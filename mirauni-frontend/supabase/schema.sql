-- ==============================================================================
-- 1. Enable Extensions
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. Drop existing tables (Optional - use with caution)
-- ==============================================================================
-- DROP TABLE IF EXISTS messages;
-- DROP TABLE IF EXISTS conversations;
-- DROP TABLE IF EXISTS unlocks;
-- DROP TABLE IF EXISTS orders;
-- DROP TABLE IF EXISTS projects;
-- DROP TABLE IF EXISTS users;
-- DROP TABLE IF EXISTS articles;
-- DROP TABLE IF EXISTS sms_codes;

-- ==============================================================================
-- 3. Create Tables
-- ==============================================================================

-- 3.1 users 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE,          -- 手机号（唯一标识）
  wechat_openid VARCHAR(100),        -- 微信OpenID
  wechat_unionid VARCHAR(100),       -- 微信UnionID
  
  -- 公开信息
  username VARCHAR(50) UNIQUE,       -- 用户名
  avatar_url TEXT,                   -- 头像
  bio TEXT,                          -- 简介
  profession VARCHAR(50),            -- 职业
  position VARCHAR(50),              -- 职位
  location VARCHAR(50),              -- 所在地
  skills TEXT[],                     -- 技能标签
  experience_years INT,              -- 经验年限
  work_preference VARCHAR(20),       -- 全职/兼职
  social_links JSONB,                -- 社交链接 {github, bilibili, twitter...}
  
  -- 付费可见信息
  wechat_id VARCHAR(50),             -- 微信号
  email VARCHAR(100),                -- 邮箱
  
  -- 系统字段
  unlock_credits INT DEFAULT 0,      -- 解锁次数余额
  is_first_charge BOOLEAN DEFAULT true, -- 是否首充（用于首充优惠）
  role VARCHAR(20) DEFAULT 'user',   -- 角色: user/admin
  status VARCHAR(20) DEFAULT 'active', -- 状态
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.2 projects 项目表
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  
  -- 公开信息
  title VARCHAR(100) NOT NULL,       -- 标题
  summary VARCHAR(200),              -- 一句话简介
  category VARCHAR(50),              -- 分类
  roles_needed TEXT[],               -- 招募角色
  skills_required TEXT[],            -- 技能要求
  work_mode VARCHAR(20),             -- 远程/坐班
  cooperation_type VARCHAR(50),      -- 股权/薪酬/分成
  
  -- 可设置可见性
  description TEXT,                  -- 详细描述
  description_visible BOOLEAN DEFAULT true,
  background TEXT,                   -- 项目背景/由来
  background_visible BOOLEAN DEFAULT false,
  vision TEXT,                       -- 愿景
  vision_visible BOOLEAN DEFAULT false,
  team_info TEXT,                    -- 团队信息
  team_visible BOOLEAN DEFAULT false,
  demo_url TEXT,                     -- 演示链接
  demo_visible BOOLEAN DEFAULT false,
  
  -- 系统字段
  status VARCHAR(20) DEFAULT 'pending', -- pending/active/closed
  view_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.3 unlocks 解锁记录表
CREATE TABLE unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),      -- 解锁者
  target_user_id UUID REFERENCES users(id), -- 被解锁者
  target_project_id UUID REFERENCES projects(id), -- 关联项目
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.4 conversations 会话表
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES users(id),
  user2_id UUID REFERENCES users(id),
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

-- 3.5 messages 消息表
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id),
  from_user_id UUID REFERENCES users(id),
  to_user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.6 articles 学院文章表
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE,          -- URL别名
  title VARCHAR(200) NOT NULL,
  content TEXT,
  category VARCHAR(50),
  cover_url TEXT,
  author_id UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'draft',
  view_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.7 orders 订单表
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  order_no VARCHAR(50) UNIQUE,       -- 订单号
  amount INT NOT NULL,               -- 金额（分）
  credits INT NOT NULL,              -- 获得次数
  status VARCHAR(20) DEFAULT 'pending', -- pending/paid/failed
  pay_type VARCHAR(20),              -- wechat
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.8 sms_codes 短信验证码表
CREATE TABLE sms_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) NOT NULL,        -- 手机号
  code VARCHAR(6) NOT NULL,          -- 验证码
  expires_at TIMESTAMPTZ NOT NULL,   -- 过期时间
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. Create Indexes
-- ==============================================================================
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX idx_messages_unread ON messages(to_user_id, is_read) WHERE is_read = false;

-- ==============================================================================
-- 5. Enable Row Level Security (RLS)
-- ==============================================================================

-- 5.1 users RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- 5.2 projects RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active projects are viewable"
  ON projects FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can manage own projects"
  ON projects FOR ALL
  USING (auth.uid() = user_id);

-- ==============================================================================
-- 6. Storage Buckets & Policies
-- ==============================================================================

-- 6.1 Create Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),      -- 用户头像（公开）
  ('projects', 'projects', true)     -- 项目图片（公开）
ON CONFLICT (id) DO NOTHING;

-- 6.2 Storage Policies
CREATE POLICY "Anyone can view public images"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('avatars', 'projects'));

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload project images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'projects' AND
    auth.uid() IS NOT NULL
  );

-- ==============================================================================
-- 7. Functions & Triggers (Optional but recommended)
-- ==============================================================================

-- 7.1 Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
