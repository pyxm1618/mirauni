-- ============================================
-- Schema: Planning System Extension (v2.0)
-- Version: v2.0
-- Date: 2026-01-01
-- Purpose: 支持智能规划系统的数据库扩展，包含收入公式与里程碑
-- ============================================

-- 1. 用户画像表 (存储规划相关的用户设置)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- 每周可用时间 (小时)
    weekly_hours INTEGER DEFAULT 20,
    
    -- 每周工作天数 (0=周日, 1=周一, ..., 6=周六)
    work_days JSONB DEFAULT '[1,2,3,4,5]'::jsonb,
    
    -- 用户背景
    background TEXT DEFAULT 'other',
    
    -- 底线/约束
    constraints JSONB DEFAULT '[]'::jsonb,
    
    -- 元数据
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- RLS for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- ============================================
-- 2. 扩展 paths 表 (收入公式与参数)
-- ============================================

ALTER TABLE paths ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE paths ADD COLUMN IF NOT EXISTS duration_weeks INTEGER DEFAULT 12;

-- 存储公式配置与关键指标
-- 示例: { "type": "product", "unit_price": 249, "target_users": 1000, "frequency": 1, "conversion_rate": 0.02 }
ALTER TABLE paths ADD COLUMN IF NOT EXISTS formula_config JSONB DEFAULT '{}'::jsonb;

-- ============================================
-- 3. 扩展 projects 表 (升级为"里程碑 Milestone")
-- ============================================

ALTER TABLE projects ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS duration_weeks INTEGER DEFAULT 4;

-- 里程碑详情
ALTER TABLE projects ADD COLUMN IF NOT EXISTS acceptance_criteria TEXT; -- 验收标准
ALTER TABLE projects ADD COLUMN IF NOT EXISTS income_contribution DECIMAL(12,2) DEFAULT 0; -- 预计收入贡献
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE; -- 是否已锁定(详细规划过)

-- ============================================
-- 4. 扩展 tasks 表 (估时、分类、依赖)
-- ============================================

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(5,2) DEFAULT 2.0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS planned_date DATE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- 任务属性
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS task_type TEXT DEFAULT 'core'; -- core(核心) / support(辅助)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS output_artifact TEXT; -- 产出物描述
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS dependency_task_id UUID REFERENCES tasks(id); -- 依赖的前置任务

-- Index
CREATE INDEX IF NOT EXISTS idx_tasks_planned_date ON tasks(planned_date);
CREATE INDEX IF NOT EXISTS idx_tasks_sort_order ON tasks(project_id, sort_order);

-- ============================================
-- 5. 任务模板表 (Task Templates)
-- ============================================

CREATE TABLE IF NOT EXISTS task_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL, -- saas, content, etc.
    phase TEXT NOT NULL,    -- research, dev, growth
    name TEXT NOT NULL,
    default_hours DECIMAL(5,2) DEFAULT 4.0,
    task_type TEXT DEFAULT 'core',
    output_artifact TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 插入默认模板 (示例数据)
INSERT INTO task_templates (category, phase, name, default_hours, task_type, output_artifact, sort_order) VALUES
-- SaaS - Research Phase
('saas', 'research', '竞品调研', 4, 'core', '竞品分析文档', 1),
('saas', 'research', '定义MVP功能范围', 3, 'core', '功能清单文档', 2),
('saas', 'research', '技术方案设计', 4, 'core', '技术架构文档', 3),

-- SaaS - Development Phase
('saas', 'development', '核心功能开发', 40, 'core', '可运行的MVP', 1),
('saas', 'development', '部署上线', 6, 'core', '线上可访问地址', 2),
('saas', 'development', '设计品牌Logo', 2, 'support', 'Logo源文件', 3)
ON CONFLICT DO NOTHING;