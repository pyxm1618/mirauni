# MiraUni / 小概率

MiraUni 是一个同仓库多业务项目，当前同时包含：

- **小概率**：面向独立开发者、创业项目方和技术合伙人的匹配平台。
- **钱途 / Money Path**：独立运行的目标拆解、执行计划与进度管理工具。

**小概率主站：** https://mirauni.com  
**钱途工具：** https://plan.mirauni.com

> 本仓库不是通用 Starter。多个业务共享仓库和部分基础设施，但产品边界必须保持清晰。

## 当前业务结构

### 小概率匹配平台

主线代码由三个子项目组成：

- `mirauni-frontend/` — Nuxt 3 Web 主站与服务端 API。
- `mirauni-admin/` — Vue 3 + Vite 管理后台。
- `mirauni_app/` — Flutter 移动端代码库，当前不是主线上线目标。

当前 Web 产品覆盖：

- 项目发布、浏览、分类与详情；
- 开发者浏览与公开主页；
- 用户注册、登录、手机号 / 微信相关认证流程；
- 联系方式付费解锁；
- 站内信；
- 学院内容；
- 个人中心与项目管理；
- Finance / Capital & Incubation 展示页；
- SEO、站点地图、百度推送队列与数据埋点。

管理后台覆盖用户、项目审核、文章、订单、仪表盘与数据分析等运营能力。

### 钱途 / Money Path

`plan/` 是与小概率并存的独立线上业务，生产站点为：

`https://plan.mirauni.com`

当前代码包含目标输入、Wizard、Dashboard、项目 / 收入 / 日历 / 分析 / 邀请 / 设置等页面，并复用 MiraUni 账号与 Supabase 基础设施。

**边界红线：**

- 未经明确的钱途开发任务，不要在小概率任务中修改 `plan/`。
- 不要因为两个产品共用仓库、账号或数据库，就把业务模型混成一个产品。
- 任何跨业务数据或认证改动都必须先确认两边影响。

## 早期 RAG 设计

仓库仍保留：

- `RAG-HANDOFF.md`
- `docs/RAG.md`
- `path_templates_seed.sql`

这些文件属于钱途相关的早期 RAG / 路径推荐设计历史，**不是当前线上 Money Path 的运行时事实源**，也不应直接作为生产迁移执行。

当前生产数据库结构应以已提交的 Supabase migration 链和真实应用代码为准。

## 技术栈

### 小概率 Web

- Nuxt 3 / Vue 3
- Supabase
- Pinia
- Nuxt UI / Tailwind CSS
- `@nuxtjs/i18n`
- Vercel

### 管理后台

- Vue 3
- Vite
- Pinia
- Tailwind CSS
- Vercel SPA deployment

### 钱途

- Nuxt 3 / Vue 3
- Supabase
- Pinia
- Nuxt UI
- `@nuxtjs/i18n`
- Vercel

### 移动端

- Flutter / Dart
- Riverpod
- Supabase
- go_router

## 数据与后端

小概率与钱途的后端能力主要由：

- `mirauni-frontend/server/api/**`
- `plan/server/api/**`
- Supabase PostgreSQL / Auth / Storage / Realtime

共同承载。

数据库变更的当前事实源是：

`mirauni-frontend/supabase/migrations/`

当前 migration 链已经包含：

- pre-20260108 legacy schema baseline；
- 用户 / 认证和管理员安全修复；
- 项目与 SEO 推送表；
- 2026-09 targeted production closeout fixes；
- Project Square schema；
- 2026-11 `task_templates` RLS hardening。

新环境重建必须按 migration 链验证，不要只依据旧的单份 `schema.sql` 或历史设计文档推断生产结构。

## 目录

| 路径 | 当前职责 |
|---|---|
| `mirauni-frontend/` | 小概率 Web 主站、SSR 页面、服务端 API、Supabase migrations |
| `mirauni-admin/` | 小概率运营管理后台 |
| `mirauni_app/` | Flutter 移动端代码库 |
| `plan/` | 钱途 / Money Path 独立线上业务 |
| `docs/` | 产品、架构、测试、部署与历史设计文档 |
| `scripts/smoke-test.js` | 公开只读冒烟验证 |
| `RAG-HANDOFF.md` | 钱途早期 RAG 交接历史 |
| `path_templates_seed.sql` | 早期 RAG 种子数据，不作为当前生产 migration |

## 本地开发

### 小概率 Web

```bash
cd mirauni-frontend
npm install
cp .env.example .env
npm run dev
```

常用验证：

```bash
npm run typecheck
npm run build
```

### 管理后台

```bash
cd mirauni-admin
npm install
npm run dev
npm run build
```

### 钱途

```bash
cd plan
npm install
npm run dev
npm run build
```

Money Path 本地开发端口由 `plan/nuxt.config.ts` 固定为 `3001`。

### Flutter App

```bash
cd mirauni_app
flutter pub get
flutter analyze
flutter test
flutter run
```

## CI 与生产验证

根级 GitHub Actions 当前对以下内容做自动验证：

- `mirauni-frontend`：安装依赖、Nuxt typecheck、生产 build；
- `mirauni-admin`：安装依赖、Vite production build。

公开只读冒烟测试：

```bash
node scripts/smoke-test.js
```

针对生产环境运行时必须显式授权：

```bash
TARGET_URL=https://mirauni.com ENABLE_PRODUCTION_SMOKE=true node scripts/smoke-test.js
```

生产部署、环境变量、Supabase migration、schema reload 和回滚流程见：

`docs/deployment-runbook.md`

## 当前生产与安全边界

近期 main 已完成多项生产收口，包括：

- 微信 OAuth state 校验；
- 微信支付原子结算；
- 移除生产数据修复测试入口；
- 学院内容改为数据库事实源；
- Supabase migration baseline 与 fresh rebuild 可复现性修复；
- `task_templates` RLS 与客户端权限收紧。

涉及认证、支付、用户私密资料、Service Role、管理员权限或数据库迁移时，不要仅依据历史需求文档修改；必须同时核对当前代码与 migrations。

## 文档事实源

优先级建议：

1. 当前应用代码与 Supabase migrations；
2. `docs/architecture-current.md` — 当前架构索引；
3. `docs/deployment-runbook.md` — 生产部署与回滚；
4. `docs/DEVELOPMENT.md` — 多业务开发边界；
5. `docs/requirements.md` / `docs/progress.md` — 产品规划与历史进度；
6. `docs/technical-design.md`、RAG 相关文件 — 历史设计参考。

历史文档与当前 executable code / migrations 冲突时，以当前运行时代码和可复现数据库迁移链为准，并单独修正文档漂移。

## License

本仓库当前**没有授予开源许可证**。

公开可查看不等于允许复制、修改、分发或商业使用小概率、Money Path 的应用源码、业务逻辑、内容和第一方资产。

第三方库、字体、SDK、素材及其他外部依赖仍分别受其原始许可证、条款和归属要求约束。
