-- ==============================================================================
-- 审计迁移：补齐 projects 表缺失字段
-- 发现日期：2026-06-03
-- 背景：生产环境执行 SELECT title FROM projects 报错 "column does not exist"
--       确认 projects 表字段严重落后于当前 projectSchema 定义
-- 风险等级：高（项目创建、项目搜索/筛选、真实项目展示能力存在阻断风险；当前公开项目页被 sample fallback 掩盖）
-- 策略：向前兼容增量 DDL，不删除任何数据，不破坏任何现有字段，不写入假占位数据
-- 执行前建议：先在 SQL Editor 中运行 SQL 1~4 确认表的真实结构，并备份数据库
-- ==============================================================================

-- -------------------------------------------------------------------
-- 1. 补齐公开信息核心字段
-- -------------------------------------------------------------------
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS title          VARCHAR(100);
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS summary        VARCHAR(200);
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS category       VARCHAR(50);

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS roles_needed   TEXT[] DEFAULT '{}'::TEXT[];
ALTER TABLE public.projects ALTER COLUMN roles_needed SET DEFAULT '{}'::TEXT[];

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS skills_required TEXT[] DEFAULT '{}'::TEXT[];
ALTER TABLE public.projects ALTER COLUMN skills_required SET DEFAULT '{}'::TEXT[];

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS work_mode      VARCHAR(20);
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS cooperation_type VARCHAR(50);

-- -------------------------------------------------------------------
-- 2. 补齐详情与可见性控制字段
-- -------------------------------------------------------------------
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS description         TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS description_visible  BOOLEAN DEFAULT true;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS background           TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS background_visible   BOOLEAN DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS vision               TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS vision_visible       BOOLEAN DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS team_info            TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS team_visible         BOOLEAN DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS demo_url             TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS demo_visible         BOOLEAN DEFAULT false;

-- -------------------------------------------------------------------
-- 3. 补齐系统字段
-- -------------------------------------------------------------------
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS view_count  INT           DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMPTZ   DEFAULT NOW();

-- -------------------------------------------------------------------
-- 4. 历史字段名兼容性搬运（仅在旧字段存在时执行，安全幂等）
--    若曾经用 'name' 字段存储标题，则搬运到 title（不使用假文案填充）
-- -------------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name   = 'projects'
          AND column_name  = 'name'
    ) THEN
        UPDATE public.projects SET title = name WHERE title IS NULL AND name IS NOT NULL;
        RAISE NOTICE '已将旧 name 字段数据迁移至 title';
    END IF;
END $$;

-- -------------------------------------------------------------------
-- 5. 补齐 updated_at 自动触发器（幂等，使用项目专用函数）
-- -------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_projects_updated_at ON public.projects;
CREATE TRIGGER set_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.set_projects_updated_at();

-- -------------------------------------------------------------------
-- 6. 通知 PostgREST 重新加载 Schema 缓存
-- -------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';

-- -------------------------------------------------------------------
-- 7. 核查：执行完毕后运行以下 SELECT 验证字段已全部就位
-- -------------------------------------------------------------------
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND table_name = 'projects'
-- ORDER BY ordinal_position;
