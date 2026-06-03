# Projects 表 Schema 审计报告

**发现日期**：2026-06-03  
**风险等级**：🔴 高（项目创建、项目搜索/筛选、真实项目展示能力存在阻断风险；当前公开项目页被 sample fallback 掩盖。）  
**类型**：Schema 审计 + 拟议向前兼容 migration。合并 PR 不会自动修改数据库，migration 必须由管理员在审计 SQL 确认后手动执行。

---

## 问题现象

1. 生产 `/projects` 页面仅展示冷启动样板项目，无真实项目数据。
2. 执行 `select count(*) from projects where status = 'active'` → 结果为 **0**。
3. 执行 `select id, title, status from projects` → 报错：`column "title" does not exist`。
4. 当前 `projectSchema`（`types/index.ts`）及项目创建 API（`server/api/projects/index.post.ts`）均依赖 `title`, `summary`, `category`, `roles_needed` 等字段。

---

## 根因分析

**生产数据库 `projects` 表的字段定义严重落后于当前代码规范。** 疑似表结构停留在早期版本，`schema.sql` 与 Migrations 未被完整执行到生产 Supabase 实例上。

### 代码期望字段 vs 生产确认缺失字段

| 字段 | 类型 | 生产状态 |
|------|------|---------|
| `title` | VARCHAR(100) | ❌ 缺失（已确认，报错） |
| `summary` | VARCHAR(200) | ❌ 疑似缺失 |
| `category` | VARCHAR(50) | ❌ 疑似缺失 |
| `roles_needed` | TEXT[] | ❌ 疑似缺失 |
| `skills_required` | TEXT[] | ❌ 疑似缺失 |
| `work_mode` | VARCHAR(20) | ❌ 疑似缺失 |
| `cooperation_type` | VARCHAR(50) | ❌ 疑似缺失 |
| `description_visible` | BOOLEAN | ❌ 疑似缺失 |
| `background_visible` | BOOLEAN | ❌ 疑似缺失 |
| `vision_visible` | BOOLEAN | ❌ 疑似缺失 |
| `team_visible` | BOOLEAN | ❌ 疑似缺失 |
| `demo_url` | TEXT | ❌ 疑似缺失 |
| `demo_visible` | BOOLEAN | ❌ 疑似缺失 |
| `view_count` | INT | ❓ 不确定 |
| `updated_at` | TIMESTAMPTZ | ❓ 不确定 |
| `id`, `user_id`, `status`, `created_at` | - | ✅ 应存在 |

---

## 影响评估

### 项目创建 API（`POST /api/projects`）
> 🔴 **100% 失败**

`index.post.ts` 在 Zod 验证通过后，直接将 `result.data`（含 `title` 等字段）解构并 `INSERT` 到 `projects` 表。数据库因字段不存在而拒绝，返回 500。

### 项目列表 API（`GET /api/projects`）
> 🔴 **筛选时 100% 失败，无筛选时可能前端崩溃**

- 使用 `keyword` 搜索时，SQL 拼接了 `title.ilike.%xxx%` → 字段不存在 → 500
- 使用 `role`/`work_mode` 等筛选同理 → 500
- 无筛选时即使执行 `select(*)` 成功，返回数据缺少 `title`/`roles_needed` 等关键字段，前端渲染项目卡片时调用 `project.roles_needed.join()` 等 → **JavaScript 运行时报错 → 白屏**

---

## 修复方案

已在本 PR 中新增迁移脚本：

📄 `mirauni-frontend/supabase/migrations/20260603_projects_schema_audit_fix.sql`

### 迁移策略原则

- ✅ 使用 `ADD COLUMN IF NOT EXISTS`，绝对不破坏现有字段
- ✅ 历史旧字段名（如 `name`）仅在非空时通过 `DO $$` 幂等搬运到 `title`
- ✅ 禁止写入假占位内容，保留存量 NULL 状态待人工清洗
- ✅ 不对 title 强加 NOT NULL 约束，由 API 保证新创建项目的完整性
- ✅ 数组字段（roles_needed, skills_required）增加安全默认值（'{}'::text[]）
- ✅ 幂等设计，可重复执行不报错

---

## 执行前需要在 Supabase SQL Editor 先确认

在执行迁移脚本之前，请先在 **SQL Editor** 中运行以下 4 个诊断 SQL，将结果截图确认：

```sql
-- SQL 1: 查看 projects 表真实字段
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'projects'
ORDER BY ordinal_position;

-- SQL 2: 查看 status 分布
SELECT status, count(*) as count FROM projects GROUP BY status ORDER BY status;

-- SQL 3: 查看总项目数
SELECT count(*) as total_projects_count FROM projects;

-- SQL 4: 查看是否存在疑似旧字段
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'projects'
  AND column_name IN ('name','project_name','description','content','title','summary',
                      'category','roles_needed','skills_required','work_mode','cooperation_type')
ORDER BY column_name;
```

---

## Checklist

- [x] 审计 `schema.sql` 与 `migrations/` 与代码的字段差异
- [x] 评估项目创建 API 影响
- [x] 评估项目列表 API 影响
- [x] 编写向前兼容迁移脚本
- [ ] **管理员在 Supabase SQL Editor 中运行 SQL 1~4 确认真实表结构**
- [ ] **管理员在 Staging/Production 执行迁移脚本**
- [ ] 执行后验证 `select id, title, status from projects limit 1` 不再报错
- [ ] 创建一条测试项目，验证创建 API 正常
