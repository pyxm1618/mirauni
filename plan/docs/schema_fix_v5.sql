-- 修复 500 Server Error 问题
-- 请在 Supabase SQL Editor 中执行此脚本

-- ============================================
-- 1. 创建收入表 (如果不存在)
-- ============================================
CREATE TABLE IF NOT EXISTS income (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    amount DECIMAL(15, 2) NOT NULL,
    note TEXT,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE income ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'income' AND policyname = 'income_select') THEN
        CREATE POLICY "income_select" ON income FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'income' AND policyname = 'income_insert') THEN
        CREATE POLICY "income_insert" ON income FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'income' AND policyname = 'income_update') THEN
        CREATE POLICY "income_update" ON income FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'income' AND policyname = 'income_delete') THEN
        CREATE POLICY "income_delete" ON income FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_income_user_id ON income(user_id);
CREATE INDEX IF NOT EXISTS idx_income_goal_id ON income(goal_id);
CREATE INDEX IF NOT EXISTS idx_income_recorded_at ON income(recorded_at);

-- ============================================
-- 2. 修复 Check-in 报错 (type 约束)
-- ============================================
-- 移除旧的约束 (不允许 'check_in')
ALTER TABLE supervision_interactions DROP CONSTRAINT IF EXISTS supervision_interactions_type_check;

-- 添加新的约束 (允许 'check_in')
ALTER TABLE supervision_interactions ADD CONSTRAINT supervision_interactions_type_check 
    CHECK (type IN ('like', 'nudge', 'alert', 'system', 'check_in'));
