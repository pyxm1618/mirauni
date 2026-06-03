# 生产部署与上线操作手册 (docs/deployment-runbook.md)

> 本文档规范了小概率匹配平台从构建、迁移到上线的标准操作流程（Deployment Runbook），并提供了详实的问题应急回滚指南。

---

## 1. 上线前准备：Vercel 环境变量比对

在执行生产部署前，必须登录 Vercel 控制台，将当前的 Environment Variables 配置与 [mirauni-frontend/.env.example](file:///Users/pyxm1618/Documents/mirauni/mirauni-frontend/.env.example) 中的变量模板进行一一核对。

### 1.1 关键变量列表与核对点
- **Supabase 数据库连接**：
  - `SUPABASE_URL`: 生产 Supabase 实例 URL。
  - `SUPABASE_ANON_KEY`: 生产环境匿名访问密钥。
  - `SUPABASE_SERVICE_KEY`: 生产环境服务端管理密钥（必须在 Vercel 中标记为 `Secret` 且确保非暴露）。
- **安全与加密凭据**：
  - `JWT_SECRET`: 管理后台生成 JWT 所需签名秘钥，应使用高强度随机字符串。
  - `IP_HASH_SECRET`: 埋点事件中对 IP 进行 HMAC 加密脱敏的 Salt。
- **第三方集成凭据**（如有更新，需仔细确认）：
  - 微信（WeChat）：`WECHAT_APP_ID`, `WECHAT_APP_SECRET`, `WECHAT_MCH_ID`, `WECHAT_API_KEY`
  - 腾讯云短信（SMS）：`TENCENT_SECRET_ID`, `TENCENT_SECRET_KEY`, `TENCENT_SMS_SDK_APP_ID` 等
  - 百度统计：`BAIDU_PUSH_TOKEN`, `NUXT_PUBLIC_BAIDU_ANALYTICS_ID`

---

## 2. 数据库迁移 (Supabase Migration)

为了保证生产数据库的平稳过渡，表结构设计与变更需严格按照 `supabase/migrations/` 下的时间戳迁移文件执行。

### 2.1 执行步骤
1. **本地演练**：在本地开发环境或 Staging 环境的 Supabase 数据库上，率先运行新的迁移脚本，观察是否报错及 RLS 权限是否生效。
2. **应用迁移**：
   - **方式一（推荐，命令行）**：如果配置了 Supabase CLI，执行：
     ```bash
     supabase db push --linked
     ```
   - **方式二（手动控制台）**：登录 [Supabase 控制台](https://supabase.com)，进入对应生产项目的 **SQL Editor**。按时间戳顺序依次复制 `supabase/migrations/` 下新迁移文件的 SQL 内容，粘贴并点击 **Run** 执行。

---

## 3. Schema 缓存重载 (Reload Schema)

当在 Supabase 数据库执行了任何 DDL（如 `CREATE TABLE`、`ALTER TABLE`、`CREATE OR REPLACE FUNCTION` 等）后，必须向 PostgREST API 网关发送重载信号，否则客户端 API 会发生 404、400 字段缺失或缓存失效等问题。

### 3.1 执行 SQL 命令
登录 Supabase 控制台，进入 **SQL Editor**，新建查询并执行以下 SQL：
```sql
NOTIFY pgrst, 'reload schema';
```
*提示：该命令执行后会返回成功，无额外数据集输出。它会促使 PostgREST 实时拉取最新 schema 定义，无需重启任何服务。*

---

## 4. 触发生产重新部署 (Redeploy Production)

数据库和环境变量配置无误后，即可执行代码上线部署。

### 4.1 执行步骤
1. 将 `p3/ci-and-smoke-test-tooling` 分支合并至 `dev` 验证无误后，再合并至 `main`。
2. Vercel 会通过 GitHub 集成自动监测 `main` 的 push 并触发 Production 环境的构建部署。
3. **如果只是修改了环境变量**而没有提交新代码，需手动在 Vercel 网页后台触发重新部署：
   - 登录 Vercel 控制台，进入项目页面。
   - 点击 **Deployments** 选项卡。
   - 找到当前正在运行的生产部署，点击右侧的 **...**（更多）按钮。
   - 选择 **Redeploy**，并在弹窗中点击确认。

---

## 5. 回滚步骤 (Rollback Runbook)

如果在部署新代码或数据库变更后，冒烟测试失败、或者生产环境监控到大量 500、交易失败、安全漏洞报错，必须立刻启动回滚流程。

### 5.1 第一步：Vercel 前端回滚 (Vercel Rollback)
这是耗时最短、能瞬间恢复老版本代码运行的手段。
- **通过 Web 控制台**：
  1. 登录 Vercel 项目页面，切换至 **Deployments** 选项卡。
  2. 寻找本次部署之前运行时间最长、状态最稳定的那一次旧 Deployment。
  3. 点击右侧的 **...**（更多）按钮，选择 **Promote to Production**。
  4. 确认后，Vercel 会在数秒内将路由流量一键切回上一个稳定构建，无感恢复。
- **通过 CLI 命令行**：
  ```bash
  # 回滚到指定的稳定版本 Deployment ID
  vercel rollback <stable-deployment-id>
  ```

### 5.2 第二步：数据库回滚 (Database Rollback)
> [!WARNING]
> 数据库的 Schema 变更和数据变更是不可逆的操作。如果直接降级前端代码，而新数据库 Schema 与老前端代码不兼容，或者表字段类型收缩，可能会导致老版本系统奔溃。

1. **评估向后兼容性**：
   - 如果新表结构对老版本前端代码具有**向后兼容性**（例如只是新增了非必填字段、新增了独立的表），则**不需要回滚数据库**，仅回滚 Vercel 前端即可，保持数据库现状，后续再做修复。
2. **执行反向 DDL（回滚脚本）**：
   - 如果新变更为破坏性变更（例如修改了核心字段类型、删除了被老前端引用的列、收紧了 RLS 条件导致老版本报错），测试负责人需准备反向 DDL 脚本。
   - 登录 Supabase 控制台的 **SQL Editor**，执行反向 DDL（例如重新放宽 RLS 策略、通过 `ALTER TABLE ... ADD COLUMN ...` 重新加回删除的临时字段等）。
3. **防止物理数据丢失**：
   - **绝对禁止**在没有备份的前提下，在生产环境直接运行 `DROP TABLE`、`TRUNCATE` 等会造成用户物理数据丢失的回滚指令。
   - 如果确实因为严重故障需要恢复表数据，应在 Supabase Dashboard 进入 **Database -> Backups**，启动对应时间节点的备份恢复流程。
