-- ==============================================================================
-- 创建百度 URL 推送队列表 public.seo_url_push_queue
-- 用于异步或后台处理百度 URL 推送任务
-- ==============================================================================

-- 1. 创建表
CREATE TABLE IF NOT EXISTS public.seo_url_push_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('project', 'article', 'developer')),
    source_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'success', 'failed')),
    attempts INT NOT NULL DEFAULT 0 CHECK (attempts >= 0),
    max_attempts INT NOT NULL DEFAULT 5 CHECK (max_attempts >= 1),
    last_error TEXT,
    response_body JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    pushed_at TIMESTAMPTZ
);

-- 2. 创建普通索引
CREATE INDEX IF NOT EXISTS idx_seo_url_push_queue_status ON public.seo_url_push_queue(status);
CREATE INDEX IF NOT EXISTS idx_seo_url_push_queue_type ON public.seo_url_push_queue(type);
CREATE INDEX IF NOT EXISTS idx_seo_url_push_queue_source_id ON public.seo_url_push_queue(source_id);
CREATE INDEX IF NOT EXISTS idx_seo_url_push_queue_created_at ON public.seo_url_push_queue(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_seo_url_push_queue_pushed_at ON public.seo_url_push_queue(pushed_at DESC);

-- 3. 创建复合索引 (status + attempts + created_at) 用于高效队列扫描
CREATE INDEX IF NOT EXISTS idx_seo_url_push_queue_scan 
ON public.seo_url_push_queue(status, attempts, created_at);

-- 4. 创建部分唯一索引：在 pending / processing 状态下 url 不能重复
CREATE UNIQUE INDEX IF NOT EXISTS idx_seo_url_push_queue_unique_url_pending 
ON public.seo_url_push_queue(url) 
WHERE status IN ('pending', 'processing');

-- 5. 启用 RLS
ALTER TABLE public.seo_url_push_queue ENABLE ROW LEVEL SECURITY;

-- 6. 安全加固：撤销匿名用户与登录用户的所有访问权限
REVOKE ALL ON TABLE public.seo_url_push_queue FROM anon;
REVOKE ALL ON TABLE public.seo_url_push_queue FROM authenticated;

-- 7. 自动更新 updated_at 的专用触发器与函数 (自包含)
CREATE OR REPLACE FUNCTION public.set_seo_url_push_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_seo_url_push_queue_updated_at ON public.seo_url_push_queue;
CREATE TRIGGER set_seo_url_push_queue_updated_at
    BEFORE UPDATE ON public.seo_url_push_queue
    FOR EACH ROW
    EXECUTE FUNCTION public.set_seo_url_push_queue_updated_at();

-- 8. 通知 PostgREST 重新加载 Schema 缓存
NOTIFY pgrst, 'reload schema';
