-- Phase 8: 埋点数据表
-- 用于存储前端埋点事件

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  event_name VARCHAR(50) NOT NULL,
  event_params JSONB,
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_events_name_created ON events(event_name, created_at);
CREATE INDEX IF NOT EXISTS idx_events_user_created ON events(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at);

-- RLS 策略
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- 允许服务端插入（使用 service role key）
CREATE POLICY "Service role can insert events"
  ON events FOR INSERT
  WITH CHECK (true);

-- 管理员可以查看所有事件
CREATE POLICY "Admins can view all events"
  ON events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.admin_role IS NOT NULL
    )
  );
