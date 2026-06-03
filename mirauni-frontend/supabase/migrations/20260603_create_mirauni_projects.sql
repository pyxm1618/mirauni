-- ==============================================================================
-- 创建独立的 public.mirauni_projects 表，用于项目广场业务
-- 隔离原用于 path/tasks/income 的旧 projects 表
-- ==============================================================================

-- 1. 创建表
CREATE TABLE IF NOT EXISTS public.mirauni_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR(100) NOT NULL,
    summary VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    roles_needed TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
    skills_required TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
    work_mode VARCHAR(20) NOT NULL CHECK (work_mode IN ('remote', 'onsite', 'hybrid')),
    cooperation_type VARCHAR(50) NOT NULL CHECK (cooperation_type IN ('equity', 'salary', 'revenue_share', 'volunteer')),
    description TEXT,
    description_visible BOOLEAN NOT NULL DEFAULT true,
    background TEXT,
    background_visible BOOLEAN NOT NULL DEFAULT false,
    vision TEXT,
    vision_visible BOOLEAN NOT NULL DEFAULT false,
    team_info TEXT,
    team_visible BOOLEAN NOT NULL DEFAULT false,
    demo_url TEXT,
    demo_visible BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'closed', 'pending', 'rejected')),
    view_count INT NOT NULL DEFAULT 0,
    reject_reason TEXT, -- 用于保存后台审核拒绝原因
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- 外键仅用于数据完整性约束；公开用户资料不得联 auth.users，应通过 public_profiles 查询后在服务端合并。
    CONSTRAINT mirauni_projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_mirauni_projects_user_id ON public.mirauni_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_mirauni_projects_status ON public.mirauni_projects(status);
CREATE INDEX IF NOT EXISTS idx_mirauni_projects_created_at ON public.mirauni_projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mirauni_projects_category ON public.mirauni_projects(category);
CREATE INDEX IF NOT EXISTS idx_mirauni_projects_work_mode ON public.mirauni_projects(work_mode);
CREATE INDEX IF NOT EXISTS idx_mirauni_projects_roles_needed ON public.mirauni_projects USING gin(roles_needed);
CREATE INDEX IF NOT EXISTS idx_mirauni_projects_skills_required ON public.mirauni_projects USING gin(skills_required);

-- 3. 启用 RLS
ALTER TABLE public.mirauni_projects ENABLE ROW LEVEL SECURITY;

-- 4. 制定安全策略 (Policies)
-- Policy 1: 任何人 (anon/authenticated) 可 SELECT active 的项目
DROP POLICY IF EXISTS select_active_mirauni_projects ON public.mirauni_projects;
CREATE POLICY select_active_mirauni_projects ON public.mirauni_projects
    FOR SELECT
    USING (status = 'active');

-- Policy 2: 登录用户可 SELECT 自己创建的项目 (即便不是 active)
DROP POLICY IF EXISTS select_own_mirauni_projects ON public.mirauni_projects;
CREATE POLICY select_own_mirauni_projects ON public.mirauni_projects
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy 3: 登录用户可 INSERT 自己 user_id 的项目 (且 status 必须为 pending)
DROP POLICY IF EXISTS insert_own_mirauni_projects ON public.mirauni_projects;
CREATE POLICY insert_own_mirauni_projects ON public.mirauni_projects
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Policy 4: 登录用户可 UPDATE 自己 user_id 的项目
DROP POLICY IF EXISTS update_own_mirauni_projects ON public.mirauni_projects;
CREATE POLICY update_own_mirauni_projects ON public.mirauni_projects
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5. 自动更新 updated_at 的专用触发器
CREATE OR REPLACE FUNCTION public.set_mirauni_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_mirauni_projects_updated_at ON public.mirauni_projects;
CREATE TRIGGER set_mirauni_projects_updated_at
    BEFORE UPDATE ON public.mirauni_projects
    FOR EACH ROW
    EXECUTE FUNCTION public.set_mirauni_projects_updated_at();

-- 6. 显式授予角色权限 (anon, authenticated)
-- anon 只允许 SELECT active 项目（RLS 会限制到 status='active'）
GRANT SELECT ON public.mirauni_projects TO anon;
-- authenticated 只允许 SELECT（自己的 + active），不允许全表 INSERT/UPDATE/DELETE
GRANT SELECT ON public.mirauni_projects TO authenticated;

-- 列级 INSERT grant：不允许客户端插入 status / reject_reason / view_count / created_at / updated_at
GRANT INSERT (
    user_id,
    title,
    summary,
    category,
    roles_needed,
    skills_required,
    work_mode,
    cooperation_type,
    description,
    description_visible,
    background,
    background_visible,
    vision,
    vision_visible,
    team_info,
    team_visible,
    demo_url,
    demo_visible
) ON public.mirauni_projects TO authenticated;

-- 列级 UPDATE grant：不允许普通用户更新 status / reject_reason / view_count / user_id / created_at / updated_at
GRANT UPDATE (
    title,
    summary,
    category,
    roles_needed,
    skills_required,
    work_mode,
    cooperation_type,
    description,
    description_visible,
    background,
    background_visible,
    vision,
    vision_visible,
    team_info,
    team_visible,
    demo_url,
    demo_visible
) ON public.mirauni_projects TO authenticated;

-- 7. 通知 PostgREST 重新加载 Schema 缓存
NOTIFY pgrst, 'reload schema';
