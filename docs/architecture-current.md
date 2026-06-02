# 当前系统架构说明与代码索引 (architecture-current.md)

> 文档定位：基于真实代码整理的当前系统架构说明与代码索引。明确区分同仓库并存的「小概率」匹配平台主线与「钱途工具」独立上线业务。  
> 更新时间：2026-06-03  
> 当前状态：Web 前台、管理后台、Flutter App 均已有基础开发；钱途工具为独立上线业务；早期 RAG 设计另见 `docs/RAG.md`。立项时期的原始历史方案请参见 [technical-design.md](file:///Users/pyxm1618/Documents/mirauni/docs/technical-design.md)。

---

## 1. 业务划分与架构总览

本仓库由以下两大业务线及独立模块组成：

### 📌 业务线划分

| 业务板块 | 子项目/路径 | 技术栈 | 职责与定位 |
|--------|------------|--------|------------|
| **小概率匹配平台 (主线)** | Web 前台 `mirauni-frontend/` | Nuxt 3 + Supabase | 提供主站、SSR 页面、用户认证、付费解锁、站内信、学院、SEO 及支付等核心 API |
| | 管理后台 `mirauni-admin/` | Vue 3 + Vite | 运营管理端，调用 Web 端接口，处理审核、分析、订单与用户管控 |
| | 移动端 App `mirauni_app/` | Flutter + Riverpod | 移动端 App，基础 UI 框架已就绪，目前作为**后续/待独立端规划** |
| **钱途工具 (独立上线业务)** | 钱途独立业务 `plan/` | Nuxt 3 | **同仓库并存的独立上线业务模块**（严禁删除、移动或重构） |
| **早期 RAG 设计方案** | 早期设计 (如 `docs/RAG.md`) | RAG 路径推荐设计 | **钱途工具的早期设计方案**，尚未确认接入当前 plan 线上业务，暂不投产 |

当前小概率匹配平台业务后端主要在 `mirauni-frontend/server/api/**` 中实现。Supabase 提供 PostgreSQL、Auth、Storage、Realtime 和 Service Role 管理能力。管理后台不另起后端，直接调用 Web 前台下的 `/api/admin/**`。

```text
用户浏览器 / Flutter App / 管理后台
        |
        | HTTP / Supabase SDK
        v
mirauni-frontend/server/api/**     Supabase
        |                          - PostgreSQL
        |                          - Auth
        |                          - Storage
        |                          - Realtime
        v
第三方服务：微信登录、微信支付、腾讯云短信、百度统计/推送
```

## 2. 代码入口

### Web 前台

| 路径 | 说明 |
|------|------|
| `mirauni-frontend/pages/` | Nuxt 页面路由 |
| `mirauni-frontend/server/api/` | 服务端 API |
| `mirauni-frontend/server/utils/` | 微信、短信、鉴权、百度推送、示例数据等工具 |
| `mirauni-frontend/composables/` | Auth、Payment、Upload、Messages、Tracking 等前端逻辑 |
| `mirauni-frontend/stores/` | Pinia 状态 |
| `mirauni-frontend/supabase/schema.sql` | 初始数据库 Schema |
| `mirauni-frontend/supabase/migrations/` | 后续数据库迁移 |
| `mirauni-frontend/.env.example` | 环境变量模板 |

### 管理后台

| 路径 | 说明 |
|------|------|
| `mirauni-admin/src/router/index.js` | 后台路由与登录守卫 |
| `mirauni-admin/src/views/` | 页面视图 |
| `mirauni-admin/src/layouts/AdminLayout.vue` | 后台主布局 |
| `mirauni-admin/src/stores/auth.js` | 管理员登录状态 |
| `mirauni-admin/src/utils/api.js` | 后台 API 客户端 |
| `mirauni-admin/vercel.json` | Vercel SPA fallback 配置 |

### Flutter App

| 路径 | 说明 |
|------|------|
| `mirauni_app/lib/router/app_router.dart` | go_router 路由 |
| `mirauni_app/lib/pages/` | 页面 |
| `mirauni_app/lib/providers/` | Riverpod Provider |
| `mirauni_app/lib/services/` | Auth、User、Payment、Wechat、Push、Rating 服务 |
| `mirauni_app/lib/models/` | 数据模型 |
| `mirauni_app/lib/config/env.dart` | App 环境配置 |

## 3. 数据模型

以代码为准：

- 初始 Schema：`mirauni-frontend/supabase/schema.sql`
- 迁移脚本：`mirauni-frontend/supabase/migrations/`

核心表：

| 表 | 职责 |
|----|------|
| `users` | 用户账号、公开资料、付费余额、角色状态 |
| `public_profiles` | 物理隔离后的公开用户资料表，由触发器从 `users` 同步 |
| `user_secrets` | 用户密码哈希等服务端私密信息 |
| `projects` | 项目发布、可见性、审核状态 |
| `unlocks` | 联系方式解锁记录，已加唯一约束防重复扣费 |
| `conversations` | 站内信会话 |
| `messages` | 站内信消息，接入 Realtime |
| `articles` | 学院文章 |
| `orders` | 充值订单 |
| `sms_codes` | 手机验证码 |
| `events` | 自建埋点事件，IP 以 HMAC hash 脱敏 |

重要迁移：

| 迁移 | 说明 |
|------|------|
| `20260108_add_has_password.sql` | 用户密码状态支持 |
| `20260602_security_and_admin_fixes.sql` | `public_profiles`、RLS 收紧、`admin_role`、`admin_password_hash`、解锁 RPC、events 表等安全修复 |

`schema.sql` 是初始化基线，安全修复和新增字段要同时看 migrations。后续改表时必须同步迁移、相关 API、测试文档和 `docs/progress.md`。

## 4. API 分布

所有业务 API 位于 `mirauni-frontend/server/api/**`。

| 模块 | 路径 |
|------|------|
| 认证 | `auth/send-code.post.ts`、`auth/verify-code.post.ts`、`auth/login-password.post.ts`、`auth/wechat/*`、`auth/bind-phone.post.ts`、`auth/set-password.post.ts`、`auth/reset-password.post.ts` |
| 用户 | `users/profile.*`、`users/[id]/contact.get.ts` |
| 项目 | `projects/index.*`、`projects/[id].*`、`projects/[id]/close.post.ts`、`projects/search.get.ts` |
| 开发者 | `developers/search.get.ts`、`developers/[id]/public.get.ts`、`developers/[id]/contact.get.ts`、`developers/lookup/[username].get.ts` |
| 解锁 | `unlock/check.get.ts`、`unlock/purchase.post.ts` |
| 支付 | `payment/create-order.post.ts`、`payment/notify.post.ts`、`payment/status.get.ts` |
| 站内信 | `messages/send.post.ts`、`messages/read.post.ts`、`messages/[id].get.ts`、`messages/conversations.get.ts`、`messages/unread-count.get.ts` |
| 学院 | `articles/index.get.ts`、`articles/[slug].get.ts` |
| SEO / 埋点 | `seo/push-baidu.post.ts`、`track.post.ts`、`server/routes/sitemap.xml.get.ts` |
| 管理后台 | `admin/**` |
| 测试工具 | `test/**`，生产环境使用需谨慎 |

管理后台 API：

| 页面 | API |
|------|-----|
| 登录 | `admin/login.post.ts` |
| 仪表盘 | `admin/dashboard.get.ts` |
| 用户 | `admin/users/index.get.ts`、`admin/users/[id]/ban.post.ts`、`admin/users/[id]/unban.post.ts` |
| 项目 | `admin/projects/index.get.ts`、`admin/projects/[id]/approve.post.ts`、`admin/projects/[id]/reject.post.ts`、`admin/projects/[id]/close.post.ts` |
| 文章 | `admin/articles/index.*`、`admin/articles/[id].put.ts`、`admin/articles/[id].delete.ts` |
| 订单 | `admin/orders/index.get.ts` |
| 分析 | `admin/analytics/events.get.ts`、`admin/analytics/funnel.get.ts`、`admin/analytics/trend.get.ts` |

## 5. 安全边界

关键原则：

- 客户端不得直接访问敏感字段。公开资料从 `public_profiles` 读取。
- `users` 物理表 SELECT 已限缩为用户本人行；公开展示不要绕回 `users`。
- 用户资料更新走服务端白名单 API。
- 管理员密码使用 `admin_password_hash`，不要存明文密码。
- 解锁扣费通过 `unlock_user_contact` RPC 做并发防重和事务扣费。
- `orders`、`unlocks`、`sms_codes`、`events` 均应由服务端或 Service Role 管控。
- `IP_HASH_SECRET`、`JWT_SECRET`、`SUPABASE_SERVICE_KEY`、微信支付密钥不得暴露到客户端。

## 6. 环境变量

Web 前台以 `mirauni-frontend/.env.example` 为准。

| 变量 | 用途 |
|------|------|
| `SUPABASE_URL` | Supabase 项目 URL |
| `SUPABASE_ANON_KEY` | Supabase 匿名 key |
| `SUPABASE_SERVICE_KEY` | 服务端管理 key |
| `WECHAT_APP_ID` / `WECHAT_APP_SECRET` | 微信登录 |
| `WECHAT_MCH_ID` / `WECHAT_API_KEY` | 微信支付 |
| `TENCENT_SECRET_ID` / `TENCENT_SECRET_KEY` | 腾讯云短信 |
| `TENCENT_SMS_SDK_APP_ID` / `TENCENT_SMS_SIGN_NAME` / `TENCENT_SMS_TEMPLATE_ID` | 短信模板 |
| `BAIDU_PUSH_TOKEN` | 百度主动推送 |
| `NUXT_PUBLIC_BAIDU_ANALYTICS_ID` | 百度统计 |
| `JWT_SECRET` | 管理后台 JWT |
| `IP_HASH_SECRET` | 埋点 IP HMAC 加盐 |
| `NUXT_PUBLIC_SITE_URL` | 站点公开 URL |

Flutter 配置看 `mirauni_app/lib/config/env.dart`。管理后台 API 地址看 `mirauni-admin/src/utils/api.js`。

## 7. 本地开发

Web 前台：

```bash
cd mirauni-frontend
npm install
cp .env.example .env
npm run dev
```

管理后台：

```bash
cd mirauni-admin
npm install
npm run dev
```

Flutter App：

```bash
cd mirauni_app
flutter pub get
flutter analyze
flutter test
flutter run
```

钱途工具：

```bash
cd plan
npm install
npm run dev
```

## 8. 部署

| 目标 | 说明 |
|------|------|
| `mirauni-frontend/` | Nuxt 3，部署到 Vercel，主域名 `mirauni.com` |
| `mirauni-admin/` | Vite SPA，`vercel.json` 已配置 fallback，建议域名 `admin.mirauni.com` |
| `mirauni_app/` | iOS / Android 商店包，需配置真实 App ID、微信 SDK、推送与签名 |
| Supabase | 先跑 `schema.sql`，再按 migrations 顺序执行 |

## 9. 测试与验收

自动化检查见 `docs/testing.md`。

常用命令：

```bash
cd mirauni-frontend && npm run typecheck
cd mirauni-frontend && npm run build
cd mirauni-admin && npm run build
cd mirauni_app && flutter analyze
cd mirauni_app && flutter test
```

关键冒烟范围：

- Web：`/`、`/projects`、`/developers`、`/academy`、`/login`
- API：`/api/projects`、`/api/developers/search`、`/api/articles`
- Admin：`/login`、仪表盘、用户、项目、文章、订单、分析页
- App：启动页、主 Shell、项目/开发者/消息/我的页面
- 支付/短信/微信登录：需要真实第三方配置后联调

## 10. 文档分工

| 文档 | 职责 |
|------|------|
| `README.md` | 项目入口和快速启动（理清多业务开发边界） |
| `docs/DEVELOPMENT.md` | 新人/AI 开发启动指南（新增绝对红线硬约束说明） |
| `docs/progress.md` | 当前开发进度和剩余待办（客观反馈模块就绪状态） |
| `docs/testing.md` | 测试计划、自动化检查、冒烟范围 |
| `docs/requirements.md` | 产品需求和功能规划 |
| `docs/web-missing-content.md` | Web 内容补齐与 i18n 需求 |
| `docs/RAG.md` | ⚠️ 早期设计：钱途路径知识库 RAG 方案设计（未确认接入线上业务） |
| `RAG-HANDOFF.md` | ⚠️ 早期设计：钱途 RAG 早期开发交接（未确认接入线上业务） |
| `AGENTS.md` | Agent 项目规则 |

## 11. 当前已知待办

- 创建真实管理员账号。
- 确认 `schema.sql` 与 migrations 的初始化流程是否需要合并成新的基线。
- 第三方服务配置后做支付、短信、微信登录、推送的真实联调。
- 上架前补 iOS/Android 商店配置、截图、隐私合规材料和 ASO 内容。
