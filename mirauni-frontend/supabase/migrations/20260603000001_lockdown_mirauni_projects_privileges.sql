-- ==============================================================================
-- 固化生产数据库权限修复：收紧 public.mirauni_projects 表的安全权限
-- 确保没有任何越权 status 篡改或非法物理删除的风险
-- ==============================================================================

-- 1. 撤销匿名用户在此表上的所有现有表级和列级权限
REVOKE ALL ON TABLE public.mirauni_projects FROM anon;

-- 2. 撤销登录用户在此表上的所有现有表级和列级权限
-- 3. 从而彻底清理 authenticated 对所有列可能残留的 INSERT / UPDATE 权限
REVOKE ALL ON TABLE public.mirauni_projects FROM authenticated;

-- 4. 重新授予 SELECT 权限给 anon 和 authenticated
GRANT SELECT ON public.mirauni_projects TO anon;
GRANT SELECT ON public.mirauni_projects TO authenticated;

-- 5. 重新授予列级 INSERT 权限（仅限业务内容字段，不包含 status, reject_reason, view_count, created_at, updated_at）
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

-- 6. 重新授予列级 UPDATE 权限（仅限业务内容字段，不包含 status, reject_reason, view_count, user_id, created_at, updated_at）
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

-- 7. 显式不授予任何 DELETE 权限给 authenticated 或 anon
-- 8. 绝不修改或触碰 public.projects 表

-- 9. 通知 PostgREST 重新加载 Schema 缓存以使修改立即生效
NOTIFY pgrst, 'reload schema';
