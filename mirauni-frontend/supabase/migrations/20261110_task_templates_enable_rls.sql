BEGIN;

-- =============================================================================
-- Close rls_disabled_in_public for public.task_templates.
--
-- public.task_templates is static reference data (category / phase / name seed
-- rows) created ad hoc from plan/docs/schema_planning.sql. It has no application
-- caller: no .from('task_templates') access exists in mirauni-frontend,
-- mirauni-admin, mirauni_app or plan, and the database holds no RPC, view,
-- trigger or foreign key that references it.
--
-- It is therefore a service_role-only table. Access for anon and authenticated
-- is removed rather than granted, following the same pattern already used for
-- public.seo_url_push_queue (20260604_create_seo_url_push_queue.sql).
--
-- No policy is created on purpose: with RLS enabled and no policy, every role
-- except service_role (which bypasses RLS) is denied by default.
-- =============================================================================

ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;

-- Remove the broad table-level grants (SELECT/INSERT/UPDATE/DELETE/TRUNCATE/
-- REFERENCES/TRIGGER) that were inherited by the public API roles at creation.
REVOKE ALL PRIVILEGES ON TABLE public.task_templates FROM PUBLIC;
REVOKE ALL PRIVILEGES ON TABLE public.task_templates FROM anon;
REVOKE ALL PRIVILEGES ON TABLE public.task_templates FROM authenticated;

-- Backend administration keeps full access.
GRANT ALL PRIVILEGES ON TABLE public.task_templates TO service_role;

NOTIFY pgrst, 'reload schema';

COMMIT;
