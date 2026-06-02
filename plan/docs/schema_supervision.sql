-- 钱途 (Money Path) 数据库 Schema - V2 (监督功能版)
-- 在 Supabase SQL Editor 中执行此脚本

-- ============================================
-- 0. 清理旧表 (可选，如果只是增量更新请注释掉 DROP)
-- ============================================
-- DROP TABLE IF EXISTS supervision_interactions CASCADE;
-- DROP TABLE IF EXISTS supervisions CASCADE;

-- (保留原有的 goals, paths, projects, tasks 表定义...)

-- ============================================
-- 5. 监督关系表 (Supervisions)
-- ============================================
CREATE TABLE IF NOT EXISTS supervisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    supervisor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'terminated')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, supervisor_id)
);

-- ============================================
-- 6. 监督互动表 (Supervision Interactions)
-- ============================================
CREATE TABLE IF NOT EXISTS supervision_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('like', 'nudge', 'alert', 'system')),
    message TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 7. 启用 RLS
-- ============================================
ALTER TABLE supervisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE supervision_interactions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 8. RLS 策略
-- ============================================

-- Supervisions
-- 用户可以查看关于自己的监督关系 (无论是监督别人还是被监督)
CREATE POLICY "Users can view related supervisions" ON supervisions 
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = supervisor_id);

-- 只有被监督者或者通过邀请链接验证的流程(通过API控制)可以插入
-- 这里简化为：只要是登录用户都可以插入 (API层做校验)
CREATE POLICY "Users can insert supervisions" ON supervisions 
    FOR INSERT WITH CHECK (auth.uid() = supervisor_id OR auth.uid() = user_id);

-- Interactions
-- 只能发给相关人
CREATE POLICY "Users can view own interactions" ON supervision_interactions 
    FOR SELECT USING (auth.uid() = receiver_id OR auth.uid() = sender_id);

CREATE POLICY "Users can insert interactions" ON supervision_interactions 
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update own interactions (read status)" ON supervision_interactions 
    FOR UPDATE USING (auth.uid() = receiver_id);

-- ============================================
-- 9. 索引
-- ============================================
CREATE INDEX IF NOT EXISTS idx_supervisions_user_id ON supervisions(user_id);
CREATE INDEX IF NOT EXISTS idx_supervisions_supervisor_id ON supervisions(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_interactions_receiver_id ON supervision_interactions(receiver_id);
CREATE INDEX IF NOT EXISTS idx_interactions_created_at ON supervision_interactions(created_at);
