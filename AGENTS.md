# AGENTS.md

## 项目规则

- 先读 `docs/DEVELOPMENT.md`、`docs/progress.md` 以及 [architecture-current.md](file:///Users/pyxm1618/Documents/mirauni/docs/architecture-current.md)，再改代码。明确小概率主线业务与钱途上线业务的物理边界。
- Web 前台在 `mirauni-frontend/`，管理后台在 `mirauni-admin/`，Flutter App 在 `mirauni_app/`，钱途工具在 `plan/`。
- 未经明确指令，严禁在小概率开发任务中修改 `plan/` 下的任何代码。
- 管理后台前端调用的 API 实现在 `mirauni-frontend/server/api/admin/**`，不要在 `mirauni-admin/` 里另起后端。
- Web/App 共用 Supabase 数据模型；改表结构时同步 `mirauni-frontend/supabase/schema.sql`、`mirauni-frontend/supabase/migrations/`、`docs/architecture-current.md` 及历史 `docs/technical-design.md`。
- 钱途 RAG 属于早期方案，尚未确认接入 plan 线上业务，目前不应作为小概率匹配平台 MVP 的开发对象，其种子数据存在 ID 冲突缺陷不可直接执行。
- 不要修改不存在的旧归档路径；当前仓库没有 `_archive_20251226/`。

## 常用命令

```bash
cd mirauni-frontend && npm run typecheck
cd mirauni-frontend && npm run build
cd mirauni-admin && npm run build
cd mirauni_app && flutter analyze
cd mirauni_app && flutter test
```
