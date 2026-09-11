-- Project Square owner/curated schema.
-- Production migration name: project_square_curated_v1

alter table public.mirauni_projects
    alter column work_mode drop not null,
    alter column cooperation_type drop not null;

alter table public.mirauni_projects
    add column if not exists listing_type text not null default 'owner',
    add column if not exists is_recruiting boolean not null default true,
    add column if not exists industry text,
    add column if not exists source_repo text,
    add column if not exists source_url text,
    add column if not exists curated_meta jsonb not null default '{}'::jsonb,
    add column if not exists curation_rank integer;

alter table public.mirauni_projects
    drop constraint if exists mirauni_projects_listing_type_check,
    add constraint mirauni_projects_listing_type_check
        check (listing_type in ('owner', 'curated')),
    drop constraint if exists mirauni_projects_industry_check,
    add constraint mirauni_projects_industry_check
        check (
            industry is null or industry in (
                'culture_education', 'finance', 'productivity', 'entertainment',
                'health_fitness', 'events', 'food_lifestyle', 'business_services',
                'sustainability', 'real_estate', 'logistics', 'travel',
                'agriculture', 'gaming'
            )
        ),
    drop constraint if exists mirauni_projects_listing_semantics_check,
    add constraint mirauni_projects_listing_semantics_check
        check (
            (
                listing_type = 'curated'
                and is_recruiting = false
                and cardinality(roles_needed) = 0
                and work_mode is null
                and cooperation_type is null
                and source_repo is not null
                and source_url is not null
            )
            or
            (
                listing_type = 'owner'
                and source_repo is null
                and source_url is null
                and curation_rank is null
                and curated_meta = '{}'::jsonb
                and (
                    (
                        is_recruiting = true
                        and cardinality(roles_needed) > 0
                        and work_mode is not null
                        and cooperation_type is not null
                    )
                    or
                    (
                        is_recruiting = false
                        and cardinality(roles_needed) = 0
                        and work_mode is null
                        and cooperation_type is null
                    )
                )
            )
        );

create index if not exists idx_mirauni_projects_listing_rank
    on public.mirauni_projects (listing_type, curation_rank)
    where status = 'active';

create index if not exists idx_mirauni_projects_industry
    on public.mirauni_projects (industry)
    where status = 'active';

-- Public API users may only create ordinary owner listings.
drop policy if exists insert_own_mirauni_projects on public.mirauni_projects;
create policy insert_own_mirauni_projects
    on public.mirauni_projects
    for insert
    to authenticated
    with check (
        auth.uid() = user_id
        and status = 'pending'
        and listing_type = 'owner'
        and source_repo is null
        and source_url is null
        and curation_rank is null
        and curated_meta = '{}'::jsonb
    );

-- Ordinary users can only update their own owner listings; curated rows remain platform-managed.
drop policy if exists update_own_mirauni_projects on public.mirauni_projects;
create policy update_own_mirauni_projects
    on public.mirauni_projects
    for update
    to authenticated
    using (auth.uid() = user_id and listing_type = 'owner')
    with check (
        auth.uid() = user_id
        and listing_type = 'owner'
        and source_repo is null
        and source_url is null
        and curation_rank is null
        and curated_meta = '{}'::jsonb
    );

-- Owner content edits still return active projects to moderation. Curated rows are maintained by the platform and bypass this requeue rule.
create or replace function public.requeue_active_mirauni_project_on_content_change()
returns trigger
language plpgsql
set search_path to 'public', 'pg_temp'
as $function$
begin
    if old.status = 'active' and new.listing_type = 'owner' and (
        new.title is distinct from old.title or
        new.summary is distinct from old.summary or
        new.category is distinct from old.category or
        new.industry is distinct from old.industry or
        new.is_recruiting is distinct from old.is_recruiting or
        new.roles_needed is distinct from old.roles_needed or
        new.skills_required is distinct from old.skills_required or
        new.work_mode is distinct from old.work_mode or
        new.cooperation_type is distinct from old.cooperation_type or
        new.description is distinct from old.description or
        new.description_visible is distinct from old.description_visible or
        new.background is distinct from old.background or
        new.background_visible is distinct from old.background_visible or
        new.vision is distinct from old.vision or
        new.vision_visible is distinct from old.vision_visible or
        new.team_info is distinct from old.team_info or
        new.team_visible is distinct from old.team_visible or
        new.demo_url is distinct from old.demo_url or
        new.demo_visible is distinct from old.demo_visible
    ) then
        new.status := 'pending';
        new.reject_reason := null;
    end if;

    return new;
end;
$function$;
