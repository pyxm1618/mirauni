-- 补丁：给 supervisions 表添加冗余用户信息字段
-- 为了避免复杂的跨表查询，我们在建立关系时记录当时的昵称和头像

ALTER TABLE supervisions ADD COLUMN IF NOT EXISTS supervisor_nickname TEXT;
ALTER TABLE supervisions ADD COLUMN IF NOT EXISTS supervisor_avatar TEXT;
