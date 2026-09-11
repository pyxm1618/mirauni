# Project Square Curated Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a real 20-project Project Square with explicit owner-vs-curated semantics, truthful recruiting state, industry filtering, curated detail pages, and production Supabase data.

**Architecture:** Keep `mirauni_projects` as the single source of truth. Extend rows with listing metadata and conditional recruitment semantics, enforce those rules in Zod/API/database, render curated and owner detail flows separately, and seed the approved 20-project set through a repeatable SQL/data script. The feature branch is stacked on the Academy branch so deployment cannot revert the already-published Academy work.

**Tech Stack:** Nuxt 3, Vue 3, TypeScript, Zod, Supabase/PostgreSQL, GitHub Actions, Vercel.

**Spec:** `docs/superpowers/specs/2026-09-11-project-square-curated-design.md`

## Global Constraints
- Branch: `feat/project-square-curated-v1` based on `feat/academy-editorial-v1`; never implement on `main`.
- Do not merge Academy PR #25.
- Do not fabricate external project authors, recruiting roles, contact details, or project logos.
- Curated pages must not expose unlock UI or JobPosting structured data.
- Keep production sample/demo fallback disabled.
- First release contains exactly 20 active formal projects: 1 Quick I Ching owner/editorial row plus 19 curated external projects.

---

### Task 1: Content contract and validation gate

**Files:**
- Create: `mirauni-frontend/data/project-square/curated-projects.ts`
- Create: `mirauni-frontend/scripts/validate-project-square-content.ts`
- Modify: `mirauni-frontend/package.json`
- Modify: `.github/workflows/ci.yml`

**Interfaces:**
- Produces `CURATED_PROJECTS`, an array of 19 `CuratedProjectSeed` entries.
- Produces `npm run test:projects` content validation.

- [ ] Write validation first so it imports the yet-missing curated data and asserts: exactly 19 entries, unique IDs/source URLs/repos, all required industries present where intended, `listing_type='curated'`, `is_recruiting=false`, empty recruiting fields, HTTPS source URL, non-empty feature/reason/source metadata.
- [ ] Add `test:projects` to package scripts and CI immediately after Academy content validation.
- [ ] Run CI and verify the project validation step fails because the curated dataset does not yet exist.
- [ ] Implement `curated-projects.ts` with all 19 approved projects and real-source facts.
- [ ] Re-run CI until `test:projects` passes.

### Task 2: Domain types and conditional owner validation

**Files:**
- Modify: `mirauni-frontend/types/index.ts`
- Modify: `mirauni-frontend/composables/useFormSchemas.ts` if it duplicates `projectSchema`.
- Modify: `mirauni-frontend/components/project/ProjectForm.vue`

**Interfaces:**
- Produces `ProjectListingType`, `ProjectIndustry`, `PROJECT_INDUSTRIES`, and extended `Project`.
- `projectSchema` accepts non-recruiting owner rows without fake role/work/cooperation values, but requires all three when `is_recruiting=true`.

- [ ] Add schema-level failing assertions in `validate-project-square-content.ts` for the owner recruitment contract using `projectSchema.safeParse`.
- [ ] Verify they fail under the existing unconditional schema.
- [ ] Implement conditional Zod refinement and new type fields.
- [ ] Add a visible `正在招募合作伙伴` checkbox to `ProjectForm`; hide/clear recruiting controls when false and add industry selection.
- [ ] Re-run project validation and typecheck.

### Task 3: Project APIs

**Files:**
- Modify: `mirauni-frontend/server/api/projects/index.get.ts`
- Modify: `mirauni-frontend/server/api/projects/[id].get.ts`
- Modify: `mirauni-frontend/server/api/projects/index.post.ts`
- Modify: project update endpoint if present.

**Interfaces:**
- GET list accepts `listing_type`, `industry`, `category`, `role`, `keyword`.
- GET detail returns curated data without author/unlock processing.
- POST forces `listing_type='owner'`; clients cannot create curated rows.

- [ ] Extend content/API static validation to assert source code contains curated access guards and owner-forcing behavior.
- [ ] Verify the checks fail before implementation.
- [ ] Add list filters and stable curated ordering (`curation_rank`, then created_at).
- [ ] Short-circuit curated detail before author/unlock logic and set `is_unlocked=true` without contact data.
- [ ] Force owner semantics on create/update regardless of client payload.
- [ ] Re-run validation and typecheck.

### Task 4: Project cards and index page

**Files:**
- Modify: `mirauni-frontend/components/project/ProjectCard.vue`
- Modify: `mirauni-frontend/pages/projects/index.vue`

**Interfaces:**
- Card distinguishes `项目方发布` and `平台精选`, never displays UUID, and only displays recruitment chips for recruiting owner projects.
- Index adds listing type + industry filters.

- [ ] Add static validation checks that UUID label text is absent and `平台精选` handling exists.
- [ ] Verify failure against existing card/index.
- [ ] Implement CSS letter mark, source badge, industry/product tags, and real recruiting state.
- [ ] Replace pure-recruiting hero/SEO copy and add filters.
- [ ] Re-run validation/typecheck/build.

### Task 5: Curated detail route and owner detail safety

**Files:**
- Create: `mirauni-frontend/components/project/CuratedProjectDetail.vue`
- Modify: `mirauni-frontend/pages/projects/[id]/index.vue`
- Reuse: `mirauni-frontend/components/project/theme/Brutalist.vue`

**Interfaces:**
- Curated detail renders description, feature list, editorial reason, tech/license, official website/GitHub, and disclosure.
- Owner detail uses Brutalist only; unlock modal exists only for recruiting owner projects.
- Curated page adds robots noindex and no JobPosting.

- [ ] Add static validation for no deterministic three-theme selection and conditional JobPosting.
- [ ] Verify failure.
- [ ] Implement curated component and route branching.
- [ ] Make structured data computed return JobPosting only for `owner && is_recruiting`; breadcrumb always remains.
- [ ] Re-run validation/typecheck/build.

### Task 6: Database migration and repeatable seed

**Files:**
- Create: `mirauni-frontend/scripts/project-square-schema.sql`
- Create: `mirauni-frontend/scripts/project-square-seed.sql` or an equivalent generated data script.

**Interfaces:**
- Schema adds listing metadata and conditional recruiting constraints.
- Seed is idempotent and preserves one dedicated platform publisher account reference.

- [ ] Query production schema first and record existing defaults/nullability/constraints.
- [ ] Apply additive columns and safe constraint changes in a transaction.
- [ ] Create/resolve a dedicated `小概率精选` auth/profile identity using supported Supabase administration capability; never fabricate an orphan UUID.
- [ ] Insert/upsert 19 curated rows plus Quick I Ching using stable UUIDs and source metadata.
- [ ] Query production to prove exactly 20 intended active rows and 19 curated rows.

### Task 7: PR, CI, Preview, browser verification

**Files:**
- PR only; no unrelated code.

**Interfaces:**
- PR base: `feat/academy-editorial-v1`.
- Preview must serve both current Academy and new Project Square.

- [ ] Open PR `项目广场专项整治` against the Academy feature branch.
- [ ] Wait for and inspect GitHub Actions for project content validation, Nuxt typecheck, frontend build, admin build.
- [ ] Deploy/inspect Vercel Preview from this branch.
- [ ] Verify `/projects` and representative owner/curated detail pages at desktop and 375px-equivalent layout; check no UUID, no curated unlock, no curated JobPosting, correct filters and source links.
- [ ] Inspect Preview/production error logs.
- [ ] Keep the PR open and unmerged; do not publish production unless the user separately requests it after Preview acceptance.
