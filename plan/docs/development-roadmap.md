# 开发进度规划 (Development Roadmap)

> **目标**：基于 Nuxt 3 + Nuxt UI + SSO 构建"钱途"目标规划工具。
> **周期预估**：约 8-10 人天

---

## 📅 Phase 1: 基础设施与 SSO (1.5天)

**目标**：项目跑通，能通过主站 Cookie 自动登录，页面框架就绪。

- [ ] **1.1 项目初始化**
  - [ ] 使用 Nuxt 3 + Nuxt UI 初始化仓库
  - [ ] 配置 Tailwind CSS (定义 `colors.toon`, `border-3`, `shadow-hard`)
  - [ ] 配置 Google Fonts (Space Grotesk + Comic Sans Fallback)
  - [ ] 配置 Supabase 客户端 (使用主项目 URL/Key)
- [ ] **1.2 SSO 集成**
  - [ ] 实现 `auth.global.ts` 中间件
  - [ ] 调试 Cookie 读取与重定向逻辑 (Dev/Prod 环境)
  - [ ] 封装 `useUser` composable 获取用户资料
- [ ] **1.3 核心布局**
  - [ ] 实现 `layouts/default.vue` (SideBar + TopBar)
  - [ ] 实现 `AppSwitcher` 组件 (跳转主站)
  - [ ] 响应式适配 (Mobile/Desktop)

## 📅 Phase 2: 核心向导流程 (3天)

**目标**：用户能完整走完"目标设定 -> AI 拆解 -> 生成计划"的全流程。

- [ ] **2.1 基础组件开发**
  - [ ] `WizardStepper` (步骤条)
  - [ ] `ChatBubble` (AI 对话气泡)
  - [ ] `OptionCard` (选择卡片)
- [ ] **2.2 向导页面开发 (P1-P4)**
  - [ ] 收入目标输入页
  - [ ] 快速画像选择页
  - [ ] 开放问题页
- [ ] **2.3 AI 交互逻辑 (P5-P6)**
  - [ ] 集成智谱 GLM-4 SDK
  - [ ] 实现 AI 追问逻辑 (Stream 流式输出)
- [ ] **2.4 方案生成与确认 (P7-P11)**
  - [ ] 路径推荐页 (PathRecommend)
  - [ ] 路径详情设定 (PathDetail)
  - [ ] 任务与时间线预览
  - [ ] 保存计划到数据库

## 📅 Phase 3: Dashboard 与执行管理 (2天)

**目标**：用户每天打开能看到今日任务，并进行勾选/管理。

- [ ] **3.1 Dashboard 首页**
  - [ ] 顶部问候与进度概览
  - [ ] 今日任务列表 (TodayTaskList)
- [ ] **3.2 任务管理功能**
  - [ ] 任务详情弹窗
  - [ ] 任务状态更新 (Done/Undo)
  - [ ] 任务改期/删除
- [ ] **3.3 项目视图**
  - [ ] 查看所有路径和项目状态

## 📅 Phase 4: 监督与传播 (2天)

**目标**：实现社交裂变功能。

- [ ] **4.1 邀请功能**
  - [ ] 生成邀请链接/海报
  - [ ] 监督者落地页 (无需登录即可签署)
- [ ] **4.2 契约签署**
  - [ ] 签字动效组件
  - [ ] 契约生效逻辑
- [ ] **4.3 监督互动**
  - [ ] "催一下" / "点赞" 互动按钮

---

## 🛠 开发规范

- **UI 库**：严格使用 `@nuxt/ui` 组件，避免手写复杂 CSS。
- **图标**：使用 `lucide-vue-next`。
- **数据**：优先使用 Supabase 类型生成工具生成 TypeScript 类型。
