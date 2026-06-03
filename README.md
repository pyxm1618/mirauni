# 小概率独立开发者匹配平台 与 钱途工具

> **域名**: mirauni.com  
> **项目定位**: 同仓库多业务线并存仓库。包含主线业务 **「小概率独立开发者匹配平台」** 与独立业务 **「钱途工具」**。
> **技术栈**: Nuxt 3 (Web) + Vue 3 (Admin) + Flutter (App) + Supabase + Vercel

---

## 📌 业务线划分与边界说明

1. **主线业务：小概率独立开发者匹配平台**
   - **Web 前台** (`mirauni-frontend/`): 提供项目发布、浏览、用户主页、解锁联系方式、站内信及学院等 MVP 核心功能。
   - **管理后台** (`mirauni-admin/`): Vue 3 单页应用，提供审核、用户/项目管理、订单及数据分析。
   - **移动端 App** (`mirauni_app/`): Flutter 项目，已完成基础开发，目前作为**后续/待独立端规划**。

2. **独立业务：钱途工具**
   - **钱途工具** (`plan/`): 另一个同仓库中并存的、**真实上线的独立业务模块**（Nuxt 3）。
   - ⚠️ **红线约束**：严禁对 `plan/` 进行删除、移动、重构，也不得擅自修改其业务代码。

3. **早期 RAG 设计方案**
   - 包含 `RAG-HANDOFF.md`、`docs/RAG.md` 及 `path_templates_seed.sql`。
   - 属于**钱途工具相关的早期 RAG 路径推荐设计方案，尚未确认接入当前的 plan/ 钱途工具线上业务**。
   - 该方案因 ID 类型（UUID 与普通文本 ID 'p001' 等）存在设计冲突且尚未确认接入，目前不具备直接投产条件。

---

## 目录说明

| 目录/文件 | 定位与职责 | 状态/可动性 |
|------|------|------|
| `docs/` | 📚 项目文档（包含需求、设计、当前架构索引、进度、测试等） | 可按需更新文档 |
| `docs/technical-design.md` | 🎨 匹配平台立项时的历史技术方案（保留 3400+ 行方案供历史参考） | 只加注状态警示 |
| `docs/architecture-current.md` | 🏗️ 匹配平台与钱途基于真实代码整理的当前架构索引 | 可更新维护 |
| `mirauni-frontend/` | 🖥️ 「小概率独立开发者匹配平台」Web 前台 (Nuxt 3) | 可按主线开发维护 |
| `mirauni-admin/` | 🛠️ 「小概率独立开发者匹配平台」管理后台 (Vue 3) | 可按主线开发维护 |
| `mirauni_app/` | 📱 「小概率独立开发者匹配平台」移动端 (Flutter) | 基础开发完成 / 待独立端规划 |
| `plan/` | 🧭 独立线上业务：钱途工具 (Nuxt 3) | 🔴 **真实线上业务，严禁删除/移动/重构** |
| `RAG-HANDOFF.md` | 🧠 钱途相关的早期 RAG 交接说明 | 早期设计方案，尚未接入 plan 线上业务 |
| `path_templates_seed.sql` | 🗃️ 钱途 RAG 早期路径知识库种子数据 | 早期设计数据，因 ID 类型冲突不可直接执行 |

## 快速开始

### 1. 小概率匹配平台 Web 前台
```bash
cd mirauni-frontend
npm install
npm run dev
```

### 2. 小概率匹配平台 管理后台
```bash
cd mirauni-admin
npm install
npm run dev
```

### 3. 小概率匹配平台 Flutter App (规划中)
```bash
cd mirauni_app
flutter pub get
flutter run
```

### 4. 钱途工具 (独立真实上线业务)
```bash
cd plan
npm install
npm run dev
```

## 文档索引

- [开发启动指南](./docs/DEVELOPMENT.md) (🆕 必读)
- [当前架构索引](./docs/architecture-current.md) (🆕 反映当前真实代码与数据库结构)
- [历史技术方案](./docs/technical-design.md) (🎨 立项时期的 3400+ 行完整设计，供历史参考)
- [需求文档](./docs/requirements.md)
- [项目进度](./docs/progress.md)
- [测试计划](./docs/testing.md)
- [钱途早期 RAG 方案设计](./docs/RAG.md) (早期方案，目前未接入线上业务)

---

## 测试与持续集成 (CI/CD)

项目已配置 GitHub Actions 自动化工作流与上线验收工具链：

1. **持续集成 (CI)**：每次提交或发起 Pull Request 会自动运行：
   - 前端 (`mirauni-frontend`)：静态类型检查 (`npm run typecheck`) 及生产环境构建 (`npm run build`)。
   - 管理后台 (`mirauni-admin`)：生产构建验证 (`npm run build`)。
2. **只读冒烟测试**：支持通过 `scripts/smoke-test.js` 进行公开只读接口快速验证。
   - 本地运行：`node scripts/smoke-test.js`
   - 生产环境运行（受安全拦截保护，需显式授权）：`TARGET_URL=https://mirauni.com ENABLE_PRODUCTION_SMOKE=true node scripts/smoke-test.js`
3. **部署与上线验收文档**：
   - 详见 [P1 生产环境冒烟测试指南](./docs/production-smoke-test.md) 了解手动与自动验证细节。
   - 详见 [生产部署与上线操作手册](./docs/deployment-runbook.md) 了解环境变量检查、Supabase schema 重载及回滚步骤。

