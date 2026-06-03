# 开发启动指南

> 本文档供 AI 或新开发者快速上手，并明确同仓库下多业务的开发边界。

## 📂 项目结构

```
mirauni/
├── docs/                    # 📚 项目文档（包含需求、设计、进度、测试）
│   ├── README.md            # 文档索引
│   ├── requirements.md      # 需求文档
│   ├── architecture-current.md # 当前真实架构说明与代码索引
│   ├── technical-design.md  # 历史技术方案（立项时期的全量设计方案，仅供参考）
│   ├── progress.md          # 开发进度清单
│   ├── testing.md           # 测试计划
│   └── RAG.md               # [早期方案] 钱途路径知识库 RAG 设计方案
│
├── mirauni-frontend/        # 🖥️ Web 前台 (Nuxt 3) - 「小概率」匹配平台主线
├── mirauni-admin/           # 🛠️ 管理后台 (Vue 3) - 「小概率」匹配平台主线
├── mirauni_app/             # 📱 移动端 App (Flutter) - 「小概率」匹配平台（待后续独立端规划）
├── plan/                    # 🧭 钱途工具 (Nuxt 3) - [独立线上业务，未接指令前严禁在小概率任务中擅自修改]
├── RAG-HANDOFF.md           # [早期方案] 钱途 RAG 早期交接说明（尚未确认接入 plan 线上业务）
└── path_templates_seed.sql  # [早期方案] 钱途 RAG 种子数据（因 UUID 类型冲突不可直接执行）
```

---

## 🚫 业务边界与禁止事项（绝对红线）

为确保仓库中并存的两套独立业务（「小概率独立开发者匹配平台」与「钱途工具」）平稳运行，所有新开发者与 AI 助手**必须严格遵守以下红线约束**：

1. **小概率匹配平台** 与 **钱途工具** 是并存的、完全独立的两个业务线，不得互相混淆或污染开发上下文。
2. **未经明确的钱途工具开发指令，严禁在小概率匹配平台任务中修改 `plan/` 目录下的任何代码。** `plan/` 为真实上线的独立业务模块，日常开发中两者有明确边界，不可互相污染。
3. **严禁在当前阶段将早期 RAG 路径推荐逻辑硬接入小概率匹配平台的主线。** 早期 RAG 文件（`RAG-HANDOFF.md`、`docs/RAG.md`、`path_templates_seed.sql`）目前仅作为钱途工具相关的早期设计归档保留，它们目前尚未确认接入 plan 的线上业务，且存在 UUID 字段的类型不兼容设计缺陷，不可直接投产。

---

## 🚀 开发顺序

按以下顺序开发：

### Phase 1: Web 前台 (mirauni-frontend) - 主线业务
1. 进入 `mirauni-frontend/`
2. 复制 `.env.example` 为 `.env` 并填入 Supabase、微信、短信、百度、JWT、支付配置
3. `npm install`
4. `npm run dev` 启动本地服务（固定端口 3000，用于 SSO）
5. `npm run typecheck` 做类型检查
6. `npm run build` 验证生产构建

### Phase 2: 管理后台 (mirauni-admin) - 主线业务
1. 进入 `mirauni-admin/`
2. `npm install`
3. `npm run dev` 启动 Vite 管理后台
4. 确认 `mirauni-frontend/server/api/admin/**` 可访问
5. `npm run build` 验证生产构建

### Phase 3: Flutter App (mirauni_app) - 主线移动端后续规划
1. 进入 `mirauni_app/`
2. 在 `lib/config/env.dart` 填入 Supabase、API、微信配置
3. `flutter pub get`
4. `flutter analyze`
5. `flutter test`
6. `flutter run`

### Phase 4: 独立上线业务：钱途工具 (plan)
1. `plan/` 是同仓库中并存的、**独立真实上线的业务模块**。端口固定为 3001。
2. 遵守上述红线约束，**未经明确的钱途工具开发指令，严禁在小概率匹配平台开发中擅自修改 `plan/` 下的业务代码**。
3. 对其早期 RAG 推荐设计只做归档和状态说明，不进行实质性的 RAG 代码接入。

## 📖 阅读顺序

新会话 AI 应按此顺序阅读文档：

1. **docs/README.md** - 了解项目概览
2. **docs/requirements.md** - 理解需求
3. **docs/architecture-current.md** - 当前真实系统架构说明与代码索引（区分小概率主线与钱途独立业务）
4. **docs/technical-design.md** - 历史技术方案（立项时期的 3400+ 行全量设计方案，仅供参考）
5. **docs/progress.md** - 查看任务清单，确定当前任务
6. **docs/RAG.md & RAG-HANDOFF.md** - ⚠️ 仅供了解钱途 RAG 早期设计方案历史参考，不可作为当前开发任务。

## 🔧 环境变量模板

```env
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_KEY=xxx  # 仅后台使用

# 微信
WECHAT_APP_ID=wxXXXXXXXX
WECHAT_APP_SECRET=xxx
WECHAT_MCH_ID=xxx           # 商户号
WECHAT_API_KEY=xxx          # API密钥

# 腾讯云短信
TENCENT_SECRET_ID=xxx
TENCENT_SECRET_KEY=xxx
TENCENT_SMS_SDK_APP_ID=1400XXXXXX
TENCENT_SMS_SIGN_NAME=小概率
TENCENT_SMS_TEMPLATE_ID=1234567

# 百度
BAIDU_PUSH_TOKEN=xxx
NUXT_PUBLIC_BAIDU_ANALYTICS_ID=xxx

# 安全
JWT_SECRET=xxx
IP_HASH_SECRET=xxx

# 公开配置
NUXT_PUBLIC_SITE_URL=https://mirauni.com
```

## 🔄 进度管理与多会话协作（重要！）

由于开发任务较多，我们会分多个会话进行。为了确保上下文不丢失，**请严格遵守以下规则**：

1.  **以 `docs/progress.md` 为唯一真理**
    - 新会话开始时，**必须**首先检查 `docs/progress.md`，查看哪些已打钩 `[x]`，哪些未开始 `[ ]`。
    - **不要**假设上一位 AI 做了什么，一切以文档状态为准。

2.  **做完即标记**
    - 每完成一个细分任务（如"用户登录接口"），**必须立即**更新 `docs/progress.md`，将对应的 `[ ]` 改为 `[x]`。
    - 这一步非常关键！它是下一个 AI 知道进度的唯一线索。

3.  **分阶段交付**
    - 不要试图在一个会话中完成所有工作。
    - 建议一次只专注完成一个 **Phase**（如 Phase 1 基础架构）。
    - 完成一个 Phase 后，主动提示用户："本阶段任务已完成并通过测试，建议开启新会话以清理上下文，继续下一个阶段。"

## 📝 开发规范

1. **代码风格**：使用 ESLint/Prettier (Web) 或 flutter_lints (App)
2. **Git 分支**：main (生产) / dev (开发) / feature/* (功能)
3. **提交信息**：`feat: 添加xxx` / `fix: 修复xxx` / `docs: 更新文档`

## ⚠️ 注意事项

1. **技术文档** 是核心，所有代码实现以它为准
2. **进度文档** 完成任务后记得更新状态
3. **数据互通**：Web/App 使用同一个 Supabase，用户数据共享
4. **管理后台 API**：后台前端在 `mirauni-admin/`，接口实现在 `mirauni-frontend/server/api/admin/**`
5. **旧归档目录**：当前仓库没有 `_archive_20251226/`，不要按旧文档引用它
