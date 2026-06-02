# 开发启动指南

> 本文档供 AI 或新开发者快速上手

## 📂 项目结构

```
mirauni/
├── docs/                    # 📚 项目文档（先读这里）
│   ├── README.md            # 文档索引
│   ├── requirements.md      # 需求文档
│   ├── technical-design.md  # 技术文档（核心，约3400行）
│   ├── progress.md          # 开发进度清单
│   └── testing.md           # 测试计划
│
├── mirauni-frontend/        # Web 前台 (Nuxt 3) - 待创建
├── mirauni-admin/           # 管理后台 (Vue 3) - 待创建
├── mirauni-app/             # Flutter App - 待创建
└── _archive_20251226/       # 旧代码归档（仅参考）
```

## 🚀 开发顺序

按以下顺序开发：

### Phase 1: Web 前台 (mirauni-frontend)
1. 初始化 Nuxt 3 项目
2. 配置 Supabase
3. 实现用户认证
4. 实现项目/开发者模块
5. 实现付费解锁
6. 部署到 Vercel

### Phase 2: 管理后台 (mirauni-admin)
1. 初始化 Vue 3 + Vite 项目
2. 实现管理员登录
3. 实现用户/项目管理
4. 实现数据分析
5. 部署到 Vercel

### Phase 3: Flutter App (mirauni-app)
1. 初始化 Flutter 项目
2. 配置 Supabase + 微信 SDK
3. 实现核心功能
4. 上架 App Store / 应用商店

## 📖 阅读顺序

新会话 AI 应按此顺序阅读文档：

1. **docs/README.md** - 了解项目概览
2. **docs/requirements.md** - 理解需求
3. **docs/technical-design.md** - 技术实现细节
4. **docs/progress.md** - 查看任务清单，确定当前任务

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

1. **不要修改** `_archive_20251226/` 目录，仅供参考
2. **技术文档** 是核心，所有代码实现以它为准
3. **进度文档** 完成任务后记得更新状态
4. **数据互通**：Web/App 使用同一个 Supabase，用户数据共享
