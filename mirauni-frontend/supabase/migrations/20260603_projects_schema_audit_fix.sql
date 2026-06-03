-- ==============================================================================
-- 审计迁移：补齐 projects 表缺失字段
-- 发现日期：2026-06-03
-- 背景：生产环境执行 SELECT title FROM projects 报错 "column does not exist"
--       确认 projects 表字段严重落后于当前 projectSchema 定义
-- 风险等级：高（项目创建 API 100% 失败，项目搜索 100% 失败）
-- 策略：向前兼容增量 DDL，不删除任何数据，不破坏任何现有字段
-- 执行前建议：先在 SQL Editor 中运行 SQL 1~4 确认表的真实结构
-- ==============================================================================

-- -------------------------------------------------------------------
-- 1. 补齐公开信息核心字段
-- -------------------------------------------------------------------
ALTER TABLE projects ADD COLUMN IF NOT EXISTS title          VARCHAR(100);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS summary        VARCHAR(200);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS category       VARCHAR(50);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS roles_needed   TEXT[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS skills_required TEXT[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS work_mode      VARCHAR(20);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS cooperation_type VARCHAR(50);

-- -------------------------------------------------------------------
-- 2. 补齐详情与可见性控制字段
-- -------------------------------------------------------------------
ALTER TABLE projects ADD COLUMN IF NOT EXISTS description         TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS description_visible  BOOLEAN DEFAULT true;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS background           TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS background_visible   BOOLEAN DEFAULT false;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS vision               TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS vision_visible       BOOLEAN DEFAULT false;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS team_info            TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS team_visible         BOOLEAN DEFAULT false;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS demo_url             TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS demo_visible         BOOLEAN DEFAULT false;

-- -------------------------------------------------------------------
-- 3. 补齐系统字段
-- -------------------------------------------------------------------
ALTER TABLE projects ADD COLUMN IF NOT EXISTS view_count  INT           DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMPTZ   DEFAULT NOW();

-- -------------------------------------------------------------------
-- 4. 历史字段名兼容性搬运（仅在旧字段存在时执行，安全幂等）
--    若曾经用 'name' 字段存储标题，则搬运到 title
-- -------------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name   = 'projects'
          AND column_name  = 'name'
    ) THEN
        UPDATE projects SET title = name WHERE title IS NULL;
        RAISE NOTICE '已将旧 name 字段数据迁移至 title';
    END IF;
END $$;

-- -------------------------------------------------------------------
-- 5. 为存量空白 title 记录补充占位值，再添加 NOT NULL 约束
--    （防止历史数据为 NULL 导致约束添加失败）
-- -------------------------------------------------------------------
UPDATE projects SET title = '未命名项目' WHERE title IS NULL;
ALTER TABLE projects ALTER COLUMN title SET NOT NULL;

-- -------------------------------------------------------------------
-- 6. 补齐 updated_at 自动触发器（幂等）
-- -------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- -------------------------------------------------------------------
-- 7. 核查：执行完毕后运行以下 SELECT 验证字段已全部就位
-- -------------------------------------------------------------------
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND table_name = 'projects'
-- ORDER BY ordinal_position;
