-- 收入记录表 (Income)
-- 运行此 SQL 以创建收入跟踪功能

-- 1. 创建表
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

-- 2. 启用 RLS
ALTER TABLE income ENABLE ROW LEVEL SECURITY;

-- 3. RLS 策略
CREATE POLICY "income_select" ON income FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "income_insert" ON income FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "income_update" ON income FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "income_delete" ON income FOR DELETE USING (auth.uid() = user_id);

-- 4. 索引
CREATE INDEX idx_income_user_id ON income(user_id);
CREATE INDEX idx_income_goal_id ON income(goal_id);
CREATE INDEX idx_income_recorded_at ON income(recorded_at);
