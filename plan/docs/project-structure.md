# 钱途 (Money Path) 项目目录结构

```
大排期/
├── app.vue                    # 应用根组件
├── app.config.ts              # 应用配置 (主题色等)
├── nuxt.config.ts             # Nuxt 配置
├── tailwind.config.ts         # Tailwind CSS 配置
├── tsconfig.json              # TypeScript 配置
├── package.json               # 依赖配置
│
├── pages/                     # 页面路由
│   ├── index.vue              # 首页 (/)
│   ├── calendar.vue           # 日历视图 (/calendar)
│   ├── wizard.vue             # 向导布局 (/wizard)
│   ├── wizard/                # 向导流程页面
│   │   ├── index.vue          # 第1步: 目标设定
│   │   ├── profile.vue        # 第2步: 个人信息
│   │   ├── idea.vue           # 第3步: 想法描述
│   │   ├── chat.vue           # 第4步: AI 对话
│   │   ├── plan.vue           # 第5步: AI 推荐方案
│   │   ├── setup.vue          # 第6步: 详细配置
│   │   └── timeline.vue       # 第7步: 时间线预览
│   ├── dashboard/             # 执行看板
│   │   ├── index.vue          # 看板首页
│   │   ├── projects.vue       # 项目列表
│   │   └── invite.vue         # 邀请监督人
│   └── p/                     # 公开页面
│       └── [userId].vue       # 用户契约页 (/p/:userId)
│
├── components/                # 组件库
│   ├── AppSwitcher.vue        # 应用切换器
│   ├── wizard/                # 向导相关组件
│   │   ├── OptionCard.vue     # 选项卡片
│   │   ├── ChatBubble.vue     # 聊天气泡
│   │   └── ProgressStepper.vue # 进度步骤条
│   ├── dashboard/             # 看板组件
│   │   └── StatCard.vue       # 统计卡片
│   ├── task/                  # 任务组件
│   │   ├── TaskItem.vue       # 任务项
│   │   └── TaskDetailModal.vue # 任务详情弹窗
│   └── supervision/           # 监督功能组件
│       └── ContractCard.vue   # 契约卡片
│
├── layouts/                   # 页面布局
│   └── default.vue            # 默认布局 (侧边栏)
│
├── stores/                    # Pinia 状态管理
│   └── wizard.ts              # 向导流程状态
│
├── composables/               # 可复用逻辑
│   └── useUser.ts             # 用户信息 Hook
│
├── middleware/                # 路由中间件
│   └── auth.global.ts         # 全局认证中间件
│
├── server/                    # 后端 API
│   ├── utils/
│   │   └── zhipu.ts           # 智谱 AI 客户端
│   └── api/
│       ├── wizard/            # 向导相关 API
│       │   ├── save.post.ts   # 保存规划
│       │   └── ai/
│       │       ├── interview.post.ts  # AI 追问
│       │       └── recommend.post.ts  # AI 推荐
│       ├── dashboard/         # 看板 API
│       ├── tasks/             # 任务 CRUD API
│       ├── interactions/      # 互动 API (点赞/催促)
│       ├── supervision/       # 监督签名 API
│       └── public/            # 公开 API
│
├── docs/                      # 项目文档
│   ├── PRD.md                 # 产品需求文档
│   └── technical-design.md    # 技术设计文档
│
└── public/                    # 静态资源
    ├── favicon.ico
    └── robots.txt
```

## 核心流程

1. **首页** → 用户点击「开始规划」
2. **Wizard 流程** → 7 步完成目标规划
3. **Dashboard** → 执行看板追踪进度
4. **日历** → 可视化任务安排

## 技术栈

- **前端**: Nuxt 3 + Vue 3 + Pinia + TailwindCSS + Nuxt UI
- **后端**: Nuxt Server (Nitro)
- **数据库**: Supabase (PostgreSQL)
- **AI**: 智谱 AI (GLM-4)
