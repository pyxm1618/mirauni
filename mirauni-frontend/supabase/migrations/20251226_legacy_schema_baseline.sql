-- =============================================================================
-- Legacy schema bootstrap (pre-20260108).
--
-- Creates the base application objects that existed before the first migration
-- in this repository but never had a committed CREATE statement. Verbatim
-- structure is reconstructed from the production catalog (columns, types,
-- defaults, nullability, named constraints, indexes, policies, triggers) and
-- cross-checked against mirauni-frontend/supabase/schema.sql and plan/docs/*.sql.
--
-- Deliberately omitted here because the canonical migrations add them later:
--   users.has_password                      (20260108)
--   users.admin_role / admin_password_hash (20260602)
--   unlocks.unique_user_target_unlock      (20260602)
--   RLS + policies on orders/unlocks/sms_codes/articles (20260602 / 20260910090644)
--   RLS + grants on task_templates         (20261110)
--   user_secrets, public_profiles, events, mirauni_projects,
--   seo_url_push_queue                     (created by their own migrations)
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- Shared updated_at trigger function (no migration creates it).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

-- ---------------------------------------------------------------------------
-- Base tables
-- ---------------------------------------------------------------------------
CREATE TABLE public."users" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "phone" character varying(20),
    "wechat_openid" character varying(100),
    "wechat_unionid" character varying(100),
    "username" character varying(50),
    "avatar_url" text,
    "bio" text,
    "profession" character varying(50),
    "position" character varying(50),
    "location" character varying(50),
    "skills" text[],
    "experience_years" integer,
    "work_preference" character varying(20),
    "social_links" jsonb,
    "wechat_id" character varying(50),
    "email" character varying(100),
    "unlock_credits" integer DEFAULT 0,
    "is_first_charge" boolean DEFAULT true,
    "role" character varying(20) DEFAULT 'user'::character varying,
    "status" character varying(20) DEFAULT 'active'::character varying,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now()
);
ALTER TABLE public."users" ADD CONSTRAINT "users_pkey" PRIMARY KEY (id);

CREATE TABLE public."articles" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "slug" character varying(100),
    "title" character varying(200) NOT NULL,
    "content" text,
    "category" character varying(50),
    "cover_url" text,
    "author_id" uuid,
    "status" character varying(20) DEFAULT 'draft'::character varying,
    "view_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    "summary" character varying(500)
);
ALTER TABLE public."articles" ADD CONSTRAINT "articles_pkey" PRIMARY KEY (id);

CREATE TABLE public."conversations" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user1_id" uuid,
    "user2_id" uuid,
    "last_message_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT now()
);
ALTER TABLE public."conversations" ADD CONSTRAINT "conversations_pkey" PRIMARY KEY (id);

CREATE TABLE public."messages" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "conversation_id" uuid,
    "from_user_id" uuid,
    "to_user_id" uuid,
    "content" text NOT NULL,
    "is_read" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT now()
);
ALTER TABLE public."messages" ADD CONSTRAINT "messages_pkey" PRIMARY KEY (id);

CREATE TABLE public."orders" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid,
    "order_no" character varying(50),
    "amount" integer NOT NULL,
    "credits" integer NOT NULL,
    "status" character varying(20) DEFAULT 'pending'::character varying,
    "pay_type" character varying(20),
    "paid_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT now()
);
ALTER TABLE public."orders" ADD CONSTRAINT "orders_pkey" PRIMARY KEY (id);

CREATE TABLE public."unlocks" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid,
    "target_user_id" uuid,
    "target_project_id" uuid,
    "created_at" timestamp with time zone DEFAULT now()
);
ALTER TABLE public."unlocks" ADD CONSTRAINT "unlocks_pkey" PRIMARY KEY (id);

CREATE TABLE public."sms_codes" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "phone" character varying(20) NOT NULL,
    "code" character varying(6) NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT now()
);
ALTER TABLE public."sms_codes" ADD CONSTRAINT "sms_codes_pkey" PRIMARY KEY (id);

CREATE TABLE public."goals" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "year" integer NOT NULL,
    "income_target" numeric(15,2) NOT NULL,
    "status" text DEFAULT 'active'::text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public."goals" ADD CONSTRAINT "goals_pkey" PRIMARY KEY (id);

CREATE TABLE public."paths" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "goal_id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "name" text NOT NULL,
    "category" text DEFAULT 'other'::text NOT NULL,
    "income_target" numeric(15,2),
    "sort_order" integer DEFAULT 0 NOT NULL,
    "status" text DEFAULT 'active'::text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    "start_date" date,
    "duration_weeks" integer DEFAULT 12,
    "weight" integer DEFAULT 100,
    "formula_config" jsonb DEFAULT '{}'::jsonb
);
ALTER TABLE public."paths" ADD CONSTRAINT "paths_pkey" PRIMARY KEY (id);

CREATE TABLE public."projects" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "path_id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "name" text NOT NULL,
    "status" text DEFAULT 'todo'::text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    "start_date" date,
    "duration_weeks" integer DEFAULT 4,
    "end_date" date,
    "is_active" boolean DEFAULT false,
    "is_locked" boolean DEFAULT false,
    "completion_rate" numeric(5,2) DEFAULT 0,
    "acceptance_criteria" text,
    "income_contribution" numeric(12,2)
);
ALTER TABLE public."projects" ADD CONSTRAINT "projects_pkey" PRIMARY KEY (id);

CREATE TABLE public."tasks" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "project_id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "name" text NOT NULL,
    "status" text DEFAULT 'todo'::text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    "original_estimate" numeric(5,2) DEFAULT 2.0,
    "planned_date" date,
    "sort_order" integer DEFAULT 0,
    "task_type" text DEFAULT 'core'::text
);
ALTER TABLE public."tasks" ADD CONSTRAINT "tasks_pkey" PRIMARY KEY (id);

CREATE TABLE public."income" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "goal_id" uuid,
    "project_id" uuid,
    "amount" numeric(15,2) NOT NULL,
    "note" text,
    "recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public."income" ADD CONSTRAINT "income_pkey" PRIMARY KEY (id);

CREATE TABLE public."supervisions" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "supervisor_id" uuid NOT NULL,
    "status" text DEFAULT 'active'::text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "supervisor_nickname" text,
    "supervisor_avatar" text
);
ALTER TABLE public."supervisions" ADD CONSTRAINT "supervisions_pkey" PRIMARY KEY (id);

CREATE TABLE public."supervision_interactions" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "sender_id" uuid NOT NULL,
    "receiver_id" uuid NOT NULL,
    "type" text NOT NULL,
    "message" text,
    "is_read" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public."supervision_interactions" ADD CONSTRAINT "supervision_interactions_pkey" PRIMARY KEY (id);

CREATE TABLE public."user_profiles" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "weekly_hours" integer DEFAULT 20,
    "work_days" jsonb DEFAULT '[1, 2, 3, 4, 5]'::jsonb,
    "background" text DEFAULT 'other'::text,
    "constraints" jsonb DEFAULT '[]'::jsonb,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    "income_goal" numeric(15,2),
    "deadline" date
);
ALTER TABLE public."user_profiles" ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY (id);

CREATE TABLE public."task_templates" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "category" text NOT NULL,
    "phase" text NOT NULL,
    "name" text NOT NULL,
    "default_hours" numeric(5,2) DEFAULT 4.0,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT now()
);
ALTER TABLE public."task_templates" ADD CONSTRAINT "task_templates_pkey" PRIMARY KEY (id);

-- ---------------------------------------------------------------------------
-- Named constraints (FK / UNIQUE / CHECK), applied after all tables exist.
-- ---------------------------------------------------------------------------
ALTER TABLE public."articles" ADD CONSTRAINT "articles_author_id_fkey" FOREIGN KEY (author_id) REFERENCES users(id);
ALTER TABLE public."articles" ADD CONSTRAINT "articles_slug_key" UNIQUE (slug);
ALTER TABLE public."conversations" ADD CONSTRAINT "conversations_user1_id_fkey" FOREIGN KEY (user1_id) REFERENCES users(id);
ALTER TABLE public."conversations" ADD CONSTRAINT "conversations_user2_id_fkey" FOREIGN KEY (user2_id) REFERENCES users(id);
ALTER TABLE public."conversations" ADD CONSTRAINT "conversations_user1_id_user2_id_key" UNIQUE (user1_id, user2_id);
ALTER TABLE public."goals" ADD CONSTRAINT "goals_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."goals" ADD CONSTRAINT "goals_status_check" CHECK ((status = ANY (ARRAY['active'::text, 'completed'::text, 'archived'::text])));
ALTER TABLE public."income" ADD CONSTRAINT "income_goal_id_fkey" FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE SET NULL;
ALTER TABLE public."income" ADD CONSTRAINT "income_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;
ALTER TABLE public."income" ADD CONSTRAINT "income_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY (conversation_id) REFERENCES conversations(id);
ALTER TABLE public."messages" ADD CONSTRAINT "messages_from_user_id_fkey" FOREIGN KEY (from_user_id) REFERENCES users(id);
ALTER TABLE public."messages" ADD CONSTRAINT "messages_to_user_id_fkey" FOREIGN KEY (to_user_id) REFERENCES users(id);
ALTER TABLE public."orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE public."orders" ADD CONSTRAINT "orders_order_no_key" UNIQUE (order_no);
ALTER TABLE public."paths" ADD CONSTRAINT "paths_goal_id_fkey" FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE;
ALTER TABLE public."paths" ADD CONSTRAINT "paths_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."paths" ADD CONSTRAINT "paths_status_check" CHECK ((status = ANY (ARRAY['active'::text, 'completed'::text, 'archived'::text])));
ALTER TABLE public."projects" ADD CONSTRAINT "projects_path_id_fkey" FOREIGN KEY (path_id) REFERENCES paths(id) ON DELETE CASCADE;
ALTER TABLE public."projects" ADD CONSTRAINT "projects_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."projects" ADD CONSTRAINT "projects_status_check" CHECK ((status = ANY (ARRAY['todo'::text, 'in_progress'::text, 'done'::text])));
ALTER TABLE public."sms_codes" ADD CONSTRAINT "sms_codes_phone_key" UNIQUE (phone);
ALTER TABLE public."supervision_interactions" ADD CONSTRAINT "supervision_interactions_receiver_id_fkey" FOREIGN KEY (receiver_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."supervision_interactions" ADD CONSTRAINT "supervision_interactions_sender_id_fkey" FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."supervision_interactions" ADD CONSTRAINT "supervision_interactions_type_check" CHECK ((type = ANY (ARRAY['like'::text, 'nudge'::text, 'alert'::text, 'system'::text, 'check_in'::text])));
ALTER TABLE public."supervisions" ADD CONSTRAINT "supervisions_supervisor_id_fkey" FOREIGN KEY (supervisor_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."supervisions" ADD CONSTRAINT "supervisions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."supervisions" ADD CONSTRAINT "supervisions_user_id_supervisor_id_key" UNIQUE (user_id, supervisor_id);
ALTER TABLE public."supervisions" ADD CONSTRAINT "supervisions_status_check" CHECK ((status = ANY (ARRAY['active'::text, 'paused'::text, 'terminated'::text])));
ALTER TABLE public."tasks" ADD CONSTRAINT "tasks_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
ALTER TABLE public."tasks" ADD CONSTRAINT "tasks_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."tasks" ADD CONSTRAINT "tasks_status_check" CHECK ((status = ANY (ARRAY['todo'::text, 'in_progress'::text, 'done'::text])));
ALTER TABLE public."unlocks" ADD CONSTRAINT "unlocks_target_user_id_fkey" FOREIGN KEY (target_user_id) REFERENCES users(id);
ALTER TABLE public."unlocks" ADD CONSTRAINT "unlocks_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE public."user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."user_profiles" ADD CONSTRAINT "user_profiles_user_id_key" UNIQUE (user_id);
ALTER TABLE public."users" ADD CONSTRAINT "users_phone_key" UNIQUE (phone);
ALTER TABLE public."users" ADD CONSTRAINT "users_username_key" UNIQUE (username);

-- ---------------------------------------------------------------------------
-- Non-constraint indexes (verbatim from production catalog).
-- ---------------------------------------------------------------------------
CREATE INDEX idx_goals_user_id ON public.goals USING btree (user_id);
CREATE INDEX idx_goals_year ON public.goals USING btree (year);
CREATE INDEX idx_income_goal_id ON public.income USING btree (goal_id);
CREATE INDEX idx_income_recorded_at ON public.income USING btree (recorded_at);
CREATE INDEX idx_income_user_id ON public.income USING btree (user_id);
CREATE INDEX idx_messages_conversation ON public.messages USING btree (conversation_id, created_at);
CREATE INDEX idx_messages_unread ON public.messages USING btree (to_user_id, is_read) WHERE (is_read = false);
CREATE INDEX idx_paths_goal_id ON public.paths USING btree (goal_id);
CREATE INDEX idx_paths_user_id ON public.paths USING btree (user_id);
CREATE INDEX idx_projects_path_id ON public.projects USING btree (path_id);
CREATE INDEX idx_projects_user_id ON public.projects USING btree (user_id);
CREATE INDEX idx_interactions_created_at ON public.supervision_interactions USING btree (created_at);
CREATE INDEX idx_interactions_receiver_id ON public.supervision_interactions USING btree (receiver_id);
CREATE INDEX idx_supervisions_supervisor_id ON public.supervisions USING btree (supervisor_id);
CREATE INDEX idx_supervisions_user_id ON public.supervisions USING btree (user_id);
CREATE INDEX idx_tasks_planned_date ON public.tasks USING btree (planned_date);
CREATE INDEX idx_tasks_project_id ON public.tasks USING btree (project_id);
CREATE INDEX idx_tasks_sort_order ON public.tasks USING btree (project_id, sort_order);
CREATE INDEX idx_tasks_user_id ON public.tasks USING btree (user_id);
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles USING btree (user_id);

-- ---------------------------------------------------------------------------
-- RLS (only for tables whose RLS is not enabled by a later migration).
-- ---------------------------------------------------------------------------
ALTER TABLE public."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."goals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."paths" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."income" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."supervisions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."supervision_interactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."user_profiles" ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Policies (only those not created by a canonical migration).
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can create conversations" ON public."conversations" FOR INSERT WITH CHECK (((auth.uid() = user1_id) OR (auth.uid() = user2_id)));
CREATE POLICY "Users can view own conversations" ON public."conversations" FOR SELECT USING (((auth.uid() = user1_id) OR (auth.uid() = user2_id)));
CREATE POLICY "goals_delete" ON public."goals" FOR DELETE USING ((auth.uid() = user_id));
CREATE POLICY "goals_insert" ON public."goals" FOR INSERT WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "goals_select" ON public."goals" FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "goals_update" ON public."goals" FOR UPDATE USING ((auth.uid() = user_id));
CREATE POLICY "income_delete" ON public."income" FOR DELETE USING ((auth.uid() = user_id));
CREATE POLICY "income_insert" ON public."income" FOR INSERT WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "income_select" ON public."income" FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "income_update" ON public."income" FOR UPDATE USING ((auth.uid() = user_id));
CREATE POLICY "Recipients can update message status" ON public."messages" FOR UPDATE USING ((auth.uid() = to_user_id));
CREATE POLICY "Users can send messages" ON public."messages" FOR INSERT WITH CHECK ((auth.uid() = from_user_id));
CREATE POLICY "Users can view own messages" ON public."messages" FOR SELECT USING (((auth.uid() = from_user_id) OR (auth.uid() = to_user_id)));
CREATE POLICY "paths_delete" ON public."paths" FOR DELETE USING ((auth.uid() = user_id));
CREATE POLICY "paths_insert" ON public."paths" FOR INSERT WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "paths_select" ON public."paths" FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "paths_update" ON public."paths" FOR UPDATE USING ((auth.uid() = user_id));
CREATE POLICY "projects_delete" ON public."projects" FOR DELETE USING ((auth.uid() = user_id));
CREATE POLICY "projects_insert" ON public."projects" FOR INSERT WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "projects_select" ON public."projects" FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "projects_update" ON public."projects" FOR UPDATE USING ((auth.uid() = user_id));
CREATE POLICY "Users can insert interactions" ON public."supervision_interactions" FOR INSERT WITH CHECK ((auth.uid() = sender_id));
CREATE POLICY "Users can update own interactions (read status)" ON public."supervision_interactions" FOR UPDATE USING ((auth.uid() = receiver_id));
CREATE POLICY "Users can view own interactions" ON public."supervision_interactions" FOR SELECT USING (((auth.uid() = receiver_id) OR (auth.uid() = sender_id)));
CREATE POLICY "Users can insert supervisions" ON public."supervisions" FOR INSERT WITH CHECK (((auth.uid() = supervisor_id) OR (auth.uid() = user_id)));
CREATE POLICY "Users can view related supervisions" ON public."supervisions" FOR SELECT USING (((auth.uid() = user_id) OR (auth.uid() = supervisor_id)));
CREATE POLICY "tasks_delete" ON public."tasks" FOR DELETE USING ((auth.uid() = user_id));
CREATE POLICY "tasks_insert" ON public."tasks" FOR INSERT WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "tasks_select" ON public."tasks" FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "tasks_update" ON public."tasks" FOR UPDATE USING ((auth.uid() = user_id));
CREATE POLICY "Users can insert own profile" ON public."user_profiles" FOR INSERT WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can update own profile" ON public."user_profiles" FOR UPDATE USING ((auth.uid() = user_id));
CREATE POLICY "Users can view own profile" ON public."user_profiles" FOR SELECT USING ((auth.uid() = user_id));

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON public.articles
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Realtime membership for messages, matching the current project.
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

NOTIFY pgrst, 'reload schema';

COMMIT;
