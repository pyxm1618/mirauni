# 发布上线 Checklist

为了保障「小概率匹配平台 (主线)」每一次生产上线的绝对安全，特制定此发布上线 Checklist。在将代码合并至 `main` 分支并发布至生产环境之前，发布负责人必须逐项对照检查并打钩确认。

---

## 🔍 Phase 1: 合并前置审查 (Pre-merge Review)

*   [ ] **PR 范围检查**
    *   检查修改的文件列表。**严禁在未获得钱途工具开发指令的情况下修改 `plan/` 下的任何代码**。
    *   检查是否误改了 `package.json`（若无包升级需求）或 Vercel 的敏感全局配置。
    *   确保未将敏感的 `.env` 配置文件或本地调试的测试脚本推送到 GitHub。
*   [ ] **CI/typecheck/build 本地验证**
    *   如果分支触发了 GitHub Actions CI，确保所有流水线（包括 Linter、Unit Tests）执行通过。
    *   在本地分别执行编译与类型校验命令，必须无任何报错或 Warning：
        ```bash
        cd mirauni-frontend && npm run typecheck
        cd mirauni-frontend && npm run build
        cd mirauni-admin && npm run build
        ```
    *   如修改了 App 配置，在本地执行 Flutter 静态分析：
        ```bash
        cd mirauni_app && flutter analyze && flutter test
        ```

---

## 🖥️ Phase 2: 预览与配置核对 (Preview & Env Config)

*   [ ] **Vercel Preview 预览页检查**
    *   打开 Vercel Preview 部署成功的预览 URL。
    *   重点核对前端 CSS 样式是否渲染正常，页面是否存在明显的阻塞性 JavaScript 报错。
    *   检查修改的交互组件（如 NuxtLink 重构后的列表页）在不同屏幕尺寸下的响应式布局表现。
*   [ ] **Production env 生产环境变量检查**
    *   比对 Vercel Production 与测试环境的环境变量差异。
    *   若新版本引入了新的第三方 API key 或服务，确认 Vercel 后台已正确添加了该变量。
    *   校对生产环境的 `NUXT_PUBLIC_SITE_URL` 必须为 `https://mirauni.com`。

---

## 🗄️ Phase 3: 数据库迁移与刷新 (Database Migration)

*   [ ] **Supabase 数据库备份快照**
    *   在应用任何数据库 Migration 之前，登录 Supabase 控制台，对当前的生产数据库实例执行一次手动物理快照或备份（如果可用），以防万一。
*   [ ] **Supabase 迁移脚本应用**
    *   使用 Supabase CLI 将 `supabase/migrations/` 下新编写的向下兼容 SQL 迁移脚本应用到生产实例：
        ```bash
        supabase db push --linked
        ```
    *   或者登录 Supabase SQL Editor，按顺序执行对应增量迁移 SQL 脚本。
*   [ ] **重载 PostgREST Schema 缓存 (Critical!)**
    *   Supabase 使用 PostgREST 提供自动生成的 REST API。在数据库表结构发生改动（如新增了字段、修改了视图或修改了 RLS）后，PostgREST 的 Schema 缓存可能不会立即刷新，导致前端调用接口报 400 或找不到字段。
    *   **必须**在 Supabase 的 SQL 编辑器（SQL Editor）中，以管理员权限运行以下命令，强制重载 Schema 缓存：
        ```sql
        NOTIFY pgrst, 'reload schema';
        ```

---

## 🚀 Phase 4: 部署投产与验证 (Production Deploy & Validation)

*   [ ] **Production Redeploy 生产环境重新部署**
    *   在 Vercel 控制台中选择最近成功的 `main` 分支部署，点击 `Redeploy`，确保新代码在包含最新生产环境变量以及重载后的数据库 Schema 环境下进行干净的重新编译与拉起。
*   [ ] **P0/P1 Smoke Test 核心功能冒烟测试**
    *   部署完成后，立刻访问生产环境主站 `https://mirauni.com` 执行以下核心用例：
        1.  **用户登录**：使用手机验证码或微信登录，确保短信服务与 JWT 鉴权正常。
        2.  **项目与开发者搜索**：在主页和列表页进行分类筛选和搜索，验证 SSR 渲染和数据调取的响应时间。
        3.  **支付与解锁**：充值一分钱（如有测试套餐），并成功解锁一名开发者的联系方式，检验微信支付回调逻辑及 RPC 解锁事务的准确性。
        4.  **站内信交互**：给已解锁的开发者发送私信，确认实时消息推送正常。
        5.  **管理后台审核**：登录管理员账号，查看数据看板并审核一个测试项目。
*   [ ] **Server & Client Logs 日志检查**
    *   打开 Vercel Deployment Logs 与 Supabase API 监控日志。
    *   密切观察 10-15 分钟，确认无 RLS 触发警报、无未捕获的 `500` 运行时错误、无未处理的 `Promise Rejection`。
