# Projects 表 Schema 审计与废弃报告

> [!CAUTION]
> **重要警告：原 `public.projects` 修改计划已废弃，原迁移脚本已被隔离！严禁执行！**
> 
> 经深入核实：
> 1. 生产数据库中的 `public.projects` 表**不是** Mirauni 项目广场表，而是 `path/tasks/income` 相关的旧业务表。
> 2. 该表已有大量存量数据（96 条），包含指向 `paths.id` 的外键 `path_id`，且被 `tasks.project_id` 和 `income.project_id` 引用。
> 3. 强行对此表执行 `ALTER TABLE` 补齐字段会破坏既有业务，属于严重生产事故隐患。
> 4. 原迁移脚本 `20260603_projects_schema_audit_fix.sql` 已被移动并隔离至 `docs/proposed-migrations/DO_NOT_EXECUTE_projects_schema_audit_fix.sql`，禁止执行。

---

## 确认证据

1. **存量数据特征**：`public.projects` 有 96 条数据，状态分布为 `todo=75`、`in_progress=21`，与 Mirauni 项目广场无关。
2. **表结构差异**：
   - 字段包括：`id`, `path_id`, `name`, `status` 等。
   - 外键关系：
     - `projects.path_id` -> `paths.id`
     - `tasks.project_id` -> `projects.id`
     - `income.project_id` -> `projects.id`
3. **Mirauni 项目广场需求**：Mirauni 需要的字段是 `title`, `summary`, `category`, `roles_needed`, `work_mode`, `cooperation_type`, `status` (值为 `active` 等)，这与旧表的数据格式和业务意义完全不符。

---

## 正确修复方向：新建 `public.mirauni_projects`

既然 `public.projects` 已被旧业务占用，Mirauni 项目广场的正确设计应为：
1. **设计新表**：在数据库中新建表 `public.mirauni_projects`，包含项目广场所需的全部字段（`id`, `title`, `summary`, `category`, `roles_needed`, `work_mode`, `cooperation_type`, `status` 等）。
2. **修改代码适配**：在 API 代码（例如 `server/api/projects/index.get.ts` 等）中，将所有涉及对 `projects` 表的查询和操作重构为查询 `mirauni_projects`。
3. **同步更新定义**：同步更新 `schema.sql`、migrations 规范和文档，不再建议对 `public.projects` 进行 `ALTER TABLE` 操作。

---

## 隔离说明

原迁移脚本已被移动到：
[DO_NOT_EXECUTE_projects_schema_audit_fix.sql](file:///Users/pyxm1618/Documents/mirauni/docs/proposed-migrations/DO_NOT_EXECUTE_projects_schema_audit_fix.sql)

并在文件顶部增加了显式警告：
```sql
-- DO NOT EXECUTE.
-- public.projects belongs to path/tasks/income domain and must not be migrated for Mirauni marketplace projects.
```

---

## Checklist

- [x] 核实 `public.projects` 数据及外键关系（确认其非项目广场表）
- [x] 隔离原 `20260603_projects_schema_audit_fix.sql` 迁移脚本至安全路径
- [x] 脚本文件顶部添加 `DO NOT EXECUTE` 警示
- [x] 更新审计与废弃报告文档，说明 `public.mirauni_projects` 新表方向
- [ ] 拟议并创建 `public.mirauni_projects` 的新建表 Migration（后续步骤）
