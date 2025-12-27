-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE,          -- URL别名
  title VARCHAR(200) NOT NULL,
  summary VARCHAR(500),              -- 文章摘要
  content TEXT,
  category VARCHAR(50),
  cover_url TEXT,
  author_id UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'draft',
  view_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published articles are viewable by everyone"
  ON articles FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authors can manage own articles"
  ON articles FOR ALL
  USING (auth.uid() = author_id);

-- Insert sample data
INSERT INTO articles (slug, title, summary, content, category, status, view_count)
VALUES 
('hello-world', 'Hello World', '这是第一篇学院文章的摘要。', 'This is the first article in the academy.', 'other', 'published', 10),
('nuxt-3-tutorial', 'Nuxt 3 Tutorial', '一篇关于 Nuxt 3 的入门教程。', 'This is a tutorial about Nuxt 3.', 'saas', 'published', 100),
('supabase-guide', 'Supabase Guide', 'Supabase 快速上手指南。', 'This is a guide for Supabase.', 'saas', 'published', 50)
ON CONFLICT (slug) DO NOTHING;
