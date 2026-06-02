-- ==============================================================================
-- 1. 物理 public_profiles 表的创建与安全隔离
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public_profiles (
  id UUID PRIMARY KEY, -- 直接与 users.id 对齐，不设默认生成 UUID，由 Trigger 主导
  username VARCHAR(50),
  avatar_url TEXT,
  bio TEXT,
  profession VARCHAR(50),
  position VARCHAR(50),
  location VARCHAR(50),
  skills TEXT[],
  experience_years INT,
  work_preference VARCHAR(20),
  social_links JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 对 public_profiles 表的 SELECT 性能进行优化
CREATE INDEX IF NOT EXISTS idx_public_profiles_username ON public_profiles(username);

-- 开启 public_profiles 表的 RLS 并赋予公开 SELECT 权限，严禁客户端直接写操作
ALTER TABLE public_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public_profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public_profiles FOR SELECT
  USING (true);

-- ==============================================================================
-- 2. 安全防提权级联触发器 (SECURITY DEFINER + search_path)
-- ==============================================================================

CREATE OR REPLACE FUNCTION sync_user_to_public_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- 级联过滤与同步：当且仅当 status 为 'active' 且 username 不为空时，才可公开展示
    IF (NEW.status = 'active' AND NEW.username IS NOT NULL) THEN
        INSERT INTO public_profiles (
            id,
            username,
            avatar_url,
            bio,
            profession,
            position,
            location,
            skills,
            experience_years,
            work_preference,
            social_links,
            created_at
        ) VALUES (
            NEW.id,
            NEW.username,
            NEW.avatar_url,
            NEW.bio,
            NEW.profession,
            NEW.position,
            NEW.location,
            NEW.skills,
            NEW.experience_years,
            NEW.work_preference,
            NEW.social_links,
            NEW.created_at
        )
        ON CONFLICT (id) DO UPDATE SET
            username = EXCLUDED.username,
            avatar_url = EXCLUDED.avatar_url,
            bio = EXCLUDED.bio,
            profession = EXCLUDED.profession,
            position = EXCLUDED.position,
            location = EXCLUDED.location,
            skills = EXCLUDED.skills,
            experience_years = EXCLUDED.experience_years,
            work_preference = EXCLUDED.work_preference,
            social_links = EXCLUDED.social_links;
    ELSE
        -- 状态变更（非active）或用户名被置空，自动从公开表物理擦除，防止隐藏字段通过旁路泄露
        DELETE FROM public_profiles WHERE id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 幂等创建 Trigger 绑定
DROP TRIGGER IF EXISTS trg_sync_user_to_public_profile ON users;
CREATE TRIGGER trg_sync_user_to_public_profile
    AFTER INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_to_public_profile();

-- 幂等创建 DELETE 触发器绑定
CREATE OR REPLACE FUNCTION delete_user_from_public_profile()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public_profiles WHERE id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_delete_user_from_public_profile ON users;
CREATE TRIGGER trg_delete_user_from_public_profile
    AFTER DELETE ON users
    FOR EACH ROW
    EXECUTE FUNCTION delete_user_from_public_profile();

-- 历史存量数据一次性安全灌入 (Idempotent)
INSERT INTO public_profiles
SELECT id, username, avatar_url, bio, profession, position, location, skills, experience_years, work_preference, social_links, created_at
FROM users
WHERE status = 'active' AND username IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 3. users 表 RLS 收紧加固（SELECT 权限限缩，删除 UPDATE 策略）
-- ==============================================================================

-- 彻底剥离用户表所有的 UPDATE 策略，强制移交至服务端白名单 API 统一接管
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON users;

-- 仅允许用户本人 SELECT 自身的 users 物理行，杜绝敏感微信、手机号越权泄露
DROP POLICY IF EXISTS "Users can select own profile" ON users;
CREATE POLICY "Users can select own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- ==============================================================================
-- 4. 字段规范与唯一性约束的引入 (admin_role, admin_password_hash, unlocks UNIQUE)
-- ==============================================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_role VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_password_hash VARCHAR(255);

-- 用户密码明文遗留字段在生产安全审计中不允许保留，如有旧 admin_password 则废弃
ALTER TABLE users DROP COLUMN IF EXISTS admin_password;

-- 为 unlocks 表增加联合唯一键，确保并发防重逻辑成立
-- 在引入联合唯一约束之前，先物理清洗去重 unlocks 历史重复数据，确保 migration 100% 成功
DELETE FROM unlocks a 
USING unlocks b 
WHERE a.id < b.id 
  AND a.user_id = b.user_id 
  AND a.target_user_id = b.target_user_id;

-- 为 unlocks 表增加联合唯一键，确保并发防重逻辑成立
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'unique_user_target_unlock'
    ) THEN
        ALTER TABLE unlocks ADD CONSTRAINT unique_user_target_unlock UNIQUE(user_id, target_user_id);
    END IF;
END $$;

-- ==============================================================================
-- 5. 并发安全与事务锁定 RPC (unlock_user_contact)
-- ==============================================================================

CREATE OR REPLACE FUNCTION unlock_user_contact(p_user_id UUID, p_target_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_inserted_id UUID;
    v_rows INT;
BEGIN
    -- 0. 安全防线：仅允许 service_role 提权执行，封死客户端直连路由提权漏洞
    IF auth.role() <> 'service_role' THEN
        RAISE EXCEPTION 'Forbidden';
    END IF;

    -- 1. 拦截自我解锁的异常行为，避免刷点
    IF p_user_id = p_target_user_id THEN
        RAISE EXCEPTION 'Cannot unlock yourself';
    END IF;

    -- 2. 先尝试插入权益记录。已存在则直接返回成功，不扣费。
    INSERT INTO unlocks(user_id, target_user_id)
    VALUES (p_user_id, p_target_user_id)
    ON CONFLICT (user_id, target_user_id) DO NOTHING
    RETURNING id INTO v_inserted_id;

    IF v_inserted_id IS NULL THEN
        RETURN TRUE;
    END IF;

    -- 3. 只有本次真正新增 unlock 记录，才扣费。
    UPDATE users
    SET unlock_credits = unlock_credits - 1
    WHERE id = p_user_id AND unlock_credits > 0;

    -- 4. 状态检验，判定扣费是否切实发生 (若余额不足则抛错触发整个事务及 unlocks 写入回滚)
    GET DIAGNOSTICS v_rows = ROW_COUNT;
    IF v_rows = 0 THEN
        RAISE EXCEPTION 'Insufficient credits';
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 极严防线：撤销公共及普通角色对高权 RPC 的执行许可，仅供服务端 service_role 使用
REVOKE EXECUTE ON FUNCTION unlock_user_contact(UUID, UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION unlock_user_contact(UUID, UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION unlock_user_contact(UUID, UUID) FROM authenticated;
GRANT EXECUTE ON FUNCTION unlock_user_contact(UUID, UUID) TO service_role;

-- ==============================================================================
-- 6. IP 脱敏加盐埋点 events 表及复合索引的建设
-- ==============================================================================

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_name VARCHAR(100) NOT NULL,
  event_params JSONB DEFAULT '{}'::jsonb,
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_hash VARCHAR(64) NOT NULL, -- 以加盐 HMAC-SHA256 保存，脱敏处理
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 对 events 表启用 RLS（不添加任何普通客户端策略，默认唯有 service_role 能行使读写）
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- 快速限流与统计防刷复合索引
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_ip_hash_created_at ON events(ip_hash, created_at);
CREATE INDEX IF NOT EXISTS idx_events_user_id_created_at ON events(user_id, created_at);

-- ==============================================================================
-- 7. 核心表 RLS 安全加固 (orders, unlocks, sms_codes)
-- ==============================================================================

-- orders 表 RLS 开启及自查 SELECT 限制 (INSERT/UPDATE 限制只能由 service_role 或服务端进行)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- unlocks 表 RLS 开启及自查 SELECT 限制
ALTER TABLE unlocks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own unlocks" ON unlocks;
CREATE POLICY "Users can view own unlocks"
  ON unlocks FOR SELECT
  USING (auth.uid() = user_id);

-- sms_codes 表 RLS 开启 (无公开/用户策略，客户端完全封死，仅限服务端 service_role)
ALTER TABLE sms_codes ENABLE ROW LEVEL SECURITY;
