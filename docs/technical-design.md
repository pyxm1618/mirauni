# 小概率独立开发者匹配平台 - 技术方案

> **技术栈**: Nuxt 3 + Supabase + Vercel  
> **域名**: mirauni.com（已备案）  
> **文档版本**: v1.0 | 更新时间: 2025-12-26

---

## 1. 技术架构概述

### 1.1 整体架构（多端统一）

```
┌───────────────────────────────────────────────────────────────────────┐
│                            用户端                                      │
├─────────────────┬─────────────────┬─────────────────┬─────────────────┤
│    Web 前台     │   Flutter App   │    H5 移动端    │   管理后台      │
│   (Nuxt 3)      │  (iOS/Android)  │   (响应式Web)   │   (Vue 3)       │
│  mirauni.com    │    App Store    │  mirauni.com    │ admin.mirauni   │
└────────┬────────┴────────┬────────┴────────┬────────┴────────┬────────┘
         │                 │                 │                 │
         │                 │                 │                 │
         ▼                 ▼                 ▼                 ▼
┌───────────────────────────────────────────────────────────────────────┐
│                         Supabase (统一后端)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  PostgreSQL  │  │     Auth     │  │   Storage    │  │  Realtime  │ │
│  │   数据库     │  │  认证服务    │  │  文件存储    │  │  实时订阅  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘ │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │              Edge Functions (共享业务逻辑)                        │ │
│  │  ├── 微信支付下单/回调                                            │ │
│  │  ├── 短信验证码发送                                               │ │
│  │  └── 复杂业务处理                                                 │ │
│  └──────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌───────────────────────────────────────────────────────────────────────┐
│                           第三方服务                                   │
│   微信支付(JSAPI/App)  │  阿里云短信  │  微信登录(Web/App)  │  百度统计 │
└───────────────────────────────────────────────────────────────────────┘
```

### 1.2 多端技术栈

| 端 | 技术栈 | 访问方式 | 主要用途 |
|------|--------|----------|----------|
| **Web 前台** | Nuxt 3 | mirauni.com | SEO、PC用户 |
| **H5 移动端** | Nuxt 3 (响应式) | mirauni.com | 微信内访问 |
| **iOS/Android App** | Flutter | App Store / 应用商店 | 原生体验 |
| **管理后台** | Vue 3 + Vite | admin.mirauni.com | 运营管理 |

### 1.3 API 架构设计

**原则：所有端共享 Supabase，Web 额外有 SSR 层**

| API 类型 | 提供方 | 调用方 | 示例 |
|----------|--------|--------|------|
| **数据 CRUD** | Supabase 直连 | Web/App/Admin 全部 | 项目列表、用户信息 |
| **复杂业务** | Supabase Edge Functions | Web/App/Admin 全部 | 支付、短信 |
| **SSR 专用** | Nuxt /server/api | 仅 Web | SEO 数据预取 |

```dart
// Flutter 调用示例
final supabase = Supabase.instance.client;

// 直接查询
final projects = await supabase.from('projects').select();

// 调用 Edge Function
final order = await supabase.functions.invoke('create-order');
```

### 1.4 技术栈选型

| 层级 | 技术 | 选型理由 |
|------|------|----------|
| Web 前台 | Nuxt 3 | SSR + SEO + Vue 生态 |
| 移动端 App | **Flutter** | 高性能、Supabase SDK 好、微信插件成熟 |
| 管理后台 | Vue 3 + Vite | 轻量快速、复用经验 |
| 统一后端 | Supabase | 多端共享、免费额度大 |
| 业务函数 | Supabase Edge Functions | 共享支付/短信等逻辑 |
| UI 框架 (Web) | Tailwind CSS | 高效开发 |
| 短信服务 | 阿里云短信 | 国内稳定 |
| 支付 | 微信支付 | JSAPI(Web) + App支付(Flutter) |

### 1.5 成本预估（月度）

| 服务 | 免费额度 | 预计费用 |
|------|----------|----------|
| Vercel (Web + Admin) | 100GB带宽 | $0 |
| Supabase | 500MB数据库 | $0 |
| 阿里云短信 | - | ¥45 |
| Apple 开发者账号 | - | ¥688/年 ≈ ¥57/月 |
| **月度总计** | | **约¥100** |

---

## 2. 项目目录结构

### 2.1 仓库根目录

```
mirauni/
├── docs/                    # 项目文档
├── mirauni-frontend/        # Web 前台 (Nuxt 3) → mirauni.com
├── mirauni-admin/           # 管理后台 (Vue 3) → admin.mirauni.com
├── mirauni-app/             # 移动端 App (Flutter) → iOS/Android
└── _archive_20251226/       # 归档的旧代码（备份）
```

### 2.2 Nuxt 3 应用结构 (mirauni-frontend/)

```
mirauni-frontend/
├── nuxt.config.ts           # Nuxt配置
├── app.vue                  # 根组件
├── pages/                   # 页面路由
│   ├── index.vue            # 首页
│   ├── login.vue            # 登录
│   ├── projects/
│   │   ├── index.vue        # 项目列表
│   │   ├── [category].vue   # 项目分类页(SSR)
│   │   └── detail/[id].vue  # 项目详情(SSR)
│   ├── developers/
│   │   ├── index.vue        # 开发者列表
│   │   └── [username].vue   # 开发者主页(SSR)
│   ├── academy/
│   │   ├── index.vue        # 学院列表
│   │   └── [slug].vue       # 文章详情(SSR)
│   └── me/
│       ├── index.vue        # 个人中心
│       ├── projects.vue     # 我的项目
│       ├── messages.vue     # 站内信
│       └── recharge.vue     # 充值
├── components/              # 组件
│   ├── ui/                  # 通用UI组件
│   ├── project/             # 项目相关组件
│   └── layout/              # 布局组件
├── composables/             # 组合式函数
│   ├── useAuth.ts           # 认证逻辑
│   ├── useSupabase.ts       # Supabase封装
│   └── usePayment.ts        # 支付逻辑
├── server/                  # 服务端
│   ├── api/                 # API路由
│   │   ├── auth/            # 认证API
│   │   ├── projects/        # 项目API
│   │   ├── users/           # 用户API
│   │   └── payment/         # 支付API
│   └── middleware/          # 中间件
├── assets/                  # 样式资源
├── public/                  # 静态资源
└── types/                   # TypeScript类型
```

### 2.3 管理后台结构 (mirauni-admin/)

```
mirauni-admin/
├── vite.config.js           # Vite配置
├── src/
│   ├── main.js              # 入口文件
│   ├── App.vue              # 根组件
│   ├── router/              # 路由配置
│   ├── stores/              # Pinia状态管理
│   ├── views/               # 页面视图
│   │   ├── Login.vue        # 登录
│   │   ├── Dashboard.vue    # 仪表盘
│   │   ├── Users.vue        # 用户管理
│   │   ├── Projects.vue     # 项目管理
│   │   ├── Review.vue       # 项目审核
│   │   └── Articles.vue     # 文章管理
│   ├── components/          # 组件
│   └── utils/               # 工具函数
└── public/                  # 静态资源
```

## 3. 数据库设计

### 3.1 ER 关系图

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   users     │────▶│  projects   │────▶│  unlocks    │
│  (用户表)   │     │  (项目表)   │     │  (解锁记录) │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │
      │                   │
      ▼                   ▼
┌─────────────┐     ┌─────────────┐
│  messages   │     │  articles   │
│  (站内信)   │     │  (学院文章) │
└─────────────┘     └─────────────┘
```

### 3.2 核心表结构

#### users 用户表

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE,          -- 手机号（唯一标识）
  wechat_openid VARCHAR(100),        -- 微信OpenID
  wechat_unionid VARCHAR(100),       -- 微信UnionID
  
  -- 公开信息
  username VARCHAR(50) UNIQUE,       -- 用户名
  avatar_url TEXT,                   -- 头像
  bio TEXT,                          -- 简介
  profession VARCHAR(50),            -- 职业
  position VARCHAR(50),              -- 职位
  location VARCHAR(50),              -- 所在地
  skills TEXT[],                     -- 技能标签
  experience_years INT,              -- 经验年限
  work_preference VARCHAR(20),       -- 全职/兼职
  social_links JSONB,                -- 社交链接 {github, bilibili, twitter...}
  
  -- 付费可见信息
  wechat_id VARCHAR(50),             -- 微信号
  email VARCHAR(100),                -- 邮箱
  
  -- 系统字段
  unlock_credits INT DEFAULT 0,      -- 解锁次数余额
  is_first_charge BOOLEAN DEFAULT true, -- 是否首充（用于首充优惠）
  role VARCHAR(20) DEFAULT 'user',   -- 角色: user/admin
  status VARCHAR(20) DEFAULT 'active', -- 状态
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### projects 项目表

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  
  -- 公开信息
  title VARCHAR(100) NOT NULL,       -- 标题
  summary VARCHAR(200),              -- 一句话简介
  category VARCHAR(50),              -- 分类
  roles_needed TEXT[],               -- 招募角色
  skills_required TEXT[],            -- 技能要求
  work_mode VARCHAR(20),             -- 远程/坐班
  cooperation_type VARCHAR(50),      -- 股权/薪酬/分成
  
  -- 可设置可见性
  description TEXT,                  -- 详细描述
  description_visible BOOLEAN DEFAULT true,
  background TEXT,                   -- 项目背景/由来
  background_visible BOOLEAN DEFAULT false,
  vision TEXT,                       -- 愿景
  vision_visible BOOLEAN DEFAULT false,
  team_info TEXT,                    -- 团队信息
  team_visible BOOLEAN DEFAULT false,
  demo_url TEXT,                     -- 演示链接
  demo_visible BOOLEAN DEFAULT false,
  
  -- 系统字段
  status VARCHAR(20) DEFAULT 'pending', -- pending/active/closed
  view_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### unlocks 解锁记录表

```sql
CREATE TABLE unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),      -- 解锁者
  target_user_id UUID REFERENCES users(id), -- 被解锁者
  target_project_id UUID REFERENCES projects(id), -- 关联项目
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### messages 站内信表

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES users(id),
  to_user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### articles 学院文章表

```sql
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE,          -- URL别名
  title VARCHAR(200) NOT NULL,
  summary VARCHAR(500),              -- 文章摘要
  content TEXT,
  category VARCHAR(50),
  cover_url TEXT,
  author_id UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'draft',
  view_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### orders 订单表

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  order_no VARCHAR(50) UNIQUE,       -- 订单号
  amount INT NOT NULL,               -- 金额（分）
  credits INT NOT NULL,              -- 获得次数
  status VARCHAR(20) DEFAULT 'pending', -- pending/paid/failed
  pay_type VARCHAR(20),              -- wechat
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### sms_codes 短信验证码表

```sql
CREATE TABLE sms_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) NOT NULL,        -- 手机号
  code VARCHAR(6) NOT NULL,          -- 验证码
  expires_at TIMESTAMPTZ NOT NULL,   -- 过期时间
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.3 枚举值定义

#### 项目分类 (category)

| 值 | 显示名 |
|---|--------|
| `saas` | SaaS 工具 |
| `app` | 移动应用 |
| `game` | 游戏 |
| `ai` | AI / 人工智能 |
| `ecommerce` | 电商 |
| `content` | 内容/社区 |
| `hardware` | 智能硬件 |
| `other` | 其他 |

#### 招募角色 (roles_needed)

| 值 | 显示名 |
|---|--------|
| `frontend` | 前端开发 |
| `backend` | 后端开发 |
| `fullstack` | 全栈开发 |
| `mobile` | 移动端开发 |
| `design` | UI/UX 设计 |
| `product` | 产品经理 |
| `operation` | 运营 |
| `marketing` | 市场推广 |

#### 技能标签 (skills)

| 值 | 显示名 | 分类 |
|---|--------|------|
| `vue` | Vue.js | 前端 |
| `react` | React | 前端 |
| `typescript` | TypeScript | 前端 |
| `flutter` | Flutter | 移动 |
| `swift` | Swift | 移动 |
| `kotlin` | Kotlin | 移动 |
| `nodejs` | Node.js | 后端 |
| `python` | Python | 后端 |
| `java` | Java | 后端 |
| `golang` | Go | 后端 |
| `rust` | Rust | 后端 |
| `mysql` | MySQL | 数据库 |
| `postgresql` | PostgreSQL | 数据库 |
| `mongodb` | MongoDB | 数据库 |
| `redis` | Redis | 数据库 |
| `docker` | Docker | DevOps |
| `kubernetes` | Kubernetes | DevOps |
| `aws` | AWS | 云服务 |
| `ai` | AI/ML | AI |
| `figma` | Figma | 设计 |

#### 工作模式 (work_mode)

| 值 | 显示名 |
|---|--------|
| `remote` | 远程办公 |
| `onsite` | 坐班 |
| `hybrid` | 混合办公 |

#### 合作方式 (cooperation_type)

| 值 | 显示名 |
|---|--------|
| `equity` | 股权合作 |
| `salary` | 薪酬合作 |
| `revenue_share` | 收益分成 |
| `volunteer` | 纯兴趣参与 |

#### 项目状态 (status)

| 值 | 显示名 |
|---|--------|
| `pending` | 待审核 |
| `active` | 招募中 |
| `closed` | 已关闭 |
| `rejected` | 审核拒绝 |

#### 订单状态 (orders.status)

| 值 | 显示名 |
|---|--------|
| `pending` | 待支付 |
| `paid` | 已支付 |
| `failed` | 支付失败 |
| `refunded` | 已退款 |

### 3.4 Supabase RLS 策略

```sql
-- 用户只能看到自己的完整信息
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- 项目公开可见
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active projects are viewable"
  ON projects FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can manage own projects"
  ON projects FOR ALL
  USING (auth.uid() = user_id);
```

---

## 4. API 接口设计

### 4.1 接口总览

> **说明**：Supabase 直连 = 多端可用；Edge Function = 多端可用；Nuxt API = 仅 Web

#### 认证接口

| 接口 | 方法 | 提供方 | 说明 |
|------|------|--------|------|
| `/api/auth/send-code` | POST | Nuxt/Edge | 发送短信验证码 |
| `/api/auth/verify-code` | POST | Nuxt/Edge | 验证码登录 |
| `/api/auth/wechat/url` | GET | Nuxt | 获取微信登录URL (Web) |
| `/api/auth/wechat/callback` | GET | Nuxt | 微信登录回调 (Web) |
| `wechat_app_login` | Edge Function | Flutter | 微信App登录 |
| `/api/auth/bindphone` | POST | Nuxt/Edge | 微信绑定手机号 |
| `/api/auth/logout` | POST | Supabase Auth | 退出登录 |

#### 用户接口

| 接口 | 方法 | 提供方 | 说明 |
|------|------|--------|------|
| `users` 表 | SELECT | Supabase 直连 | 用户列表/详情 |
| `users` 表 | UPDATE | Supabase 直连 | 更新个人资料 |
| `/api/users/:id/public` | GET | Nuxt | 获取用户公开信息 (SSR) |
| `/api/users/:id/contact` | GET | Nuxt/Edge | 获取付费信息 (需解锁) |

#### 项目接口

| 接口 | 方法 | 提供方 | 说明 |
|------|------|--------|------|
| `projects` 表 | SELECT | Supabase 直连 | 项目列表（RLS 过滤） |
| `projects` 表 | INSERT | Supabase 直连 | 发布项目 |
| `projects` 表 | UPDATE | Supabase 直连 | 编辑项目 |
| `/api/projects/:id` | GET | Nuxt | 项目详情 (SSR) |
| `/api/projects/search` | GET | Nuxt/Edge | 搜索/筛选项目 |
| `/api/projects/:id/close` | POST | Nuxt/Edge | 下架项目 |

#### 解锁接口

| 接口 | 方法 | 提供方 | 说明 |
|------|------|--------|------|
| `unlock_user` | Edge Function | 多端 | 解锁用户联系方式 |
| `unlocks` 表 | SELECT | Supabase 直连 | 已解锁列表 |
| `/api/unlock/check/:userId` | GET | Nuxt/Edge | 检查是否已解锁 |

#### 支付接口

| 接口 | 方法 | 提供方 | 说明 |
|------|------|--------|------|
| `create_order` | Edge Function | 多端 | 创建订单 |
| `create_wechat_pay` | Edge Function | 多端 | 发起微信支付 (区分JSAPI/App) |
| `/api/payment/notify` | POST | Nuxt | 微信支付回调 |
| `orders` 表 | SELECT | Supabase 直连 | 订单列表 |

#### 站内信接口

| 接口 | 方法 | 提供方 | 说明 |
|------|------|--------|------|
| `messages` 表 | INSERT | Supabase 直连 | 发送消息 (需先解锁) |
| `messages` 表 | SELECT | Supabase 直连 | 消息列表 |
| `messages` 表 | UPDATE | Supabase 直连 | 标记已读 |
| `/api/messages/unread-count` | GET | Nuxt/Edge | 未读消息数 |
| Supabase Realtime | 订阅 | Supabase | 实时消息推送 |

#### 学院文章接口

| 接口 | 方法 | 提供方 | 说明 |
|------|------|--------|------|
| `articles` 表 | SELECT | Supabase 直连 | 文章列表 |
| `/api/articles/:slug` | GET | Nuxt | 文章详情 (SSR) |

### 4.2 通用接口规范

#### 请求格式

```typescript
// POST 请求体
{
  "field1": "value1",
  "field2": "value2"
}

// 分页查询参数
?page=1&pageSize=20&sort=created_at&order=desc
```

#### 响应格式

```typescript
// 成功响应
{
  "success": true,
  "data": { ... },
  "meta": {
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}

// 错误响应
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "请先登录"
  }
}
```

#### 错误码

| 错误码 | HTTP状态 | 说明 |
|--------|----------|------|
| `UNAUTHORIZED` | 401 | 未登录 |
| `FORBIDDEN` | 403 | 无权限 |
| `NOT_FOUND` | 404 | 资源不存在 |
| `VALIDATION_ERROR` | 400 | 参数校验失败 |
| `PAYMENT_REQUIRED` | 402 | 需要付费 |
| `NOT_UNLOCKED` | 403 | 需要先解锁 |
| `INSUFFICIENT_CREDITS` | 402 | 解锁次数不足 |

### 4.3 表单验证规范

#### 验证规则

| 字段 | 规则 | 错误提示 |
|------|------|----------|
| 手机号 | `/^1[3-9]\d{9}$/` | 请输入正确的手机号 |
| 验证码 | `/^\d{6}$/` | 请输入6位验证码 |
| 用户名 | 2-20字符，字母数字下划线 | 用户名格式不正确 |
| 密码 | 8-20字符，含字母和数字 | 密码需8-20位，包含字母和数字 |
| 项目标题 | 2-50字符 | 标题长度2-50字 |
| 项目简介 | 10-200字符 | 简介长度10-200字 |
| 微信号 | 6-20字符 | 微信号格式不正确 |

#### 前端验证 (Zod)

```typescript
// types/schemas.ts
import { z } from 'zod'

export const phoneSchema = z.string().regex(/^1[3-9]\d{9}$/, '请输入正确的手机号')
export const codeSchema = z.string().regex(/^\d{6}$/, '请输入6位验证码')

export const userProfileSchema = z.object({
  username: z.string().min(2).max(20).regex(/^[a-zA-Z0-9_]+$/),
  bio: z.string().max(200).optional(),
  profession: z.string().max(50).optional(),
  skills: z.array(z.string()).max(10).optional(),
  experience_years: z.number().min(0).max(50).optional(),
})

export const projectSchema = z.object({
  title: z.string().min(2, '标题至少2个字').max(50, '标题最多50字'),
  summary: z.string().min(10, '简介至少10字').max(200, '简介最多200字'),
  category: z.enum(['saas', 'app', 'game', 'ai', 'ecommerce', 'content', 'hardware', 'other']),
  roles_needed: z.array(z.string()).min(1, '至少选择一个招募角色'),
  work_mode: z.enum(['remote', 'onsite', 'hybrid']),
  cooperation_type: z.enum(['equity', 'salary', 'revenue_share']),
  description: z.string().max(5000).optional(),
})

// 使用
const result = projectSchema.safeParse(formData)
if (!result.success) {
  const errors = result.error.flatten().fieldErrors
  // { title: ['标题至少2个字'], ... }
}
```

#### 后端验证

```typescript
// server/api/projects/index.post.ts
import { projectSchema } from '~/types/schemas'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // 验证
  const result = projectSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      data: {
        code: 'VALIDATION_ERROR',
        errors: result.error.flatten().fieldErrors
      }
    })
  }
  
  // 继续处理...
})
```

#### Flutter 验证

```dart
class Validators {
  static String? phone(String? value) {
    if (value == null || !RegExp(r'^1[3-9]\d{9}$').hasMatch(value)) {
      return '请输入正确的手机号';
    }
    return null;
  }
  
  static String? required(String? value, [String? message]) {
    if (value == null || value.isEmpty) {
      return message ?? '此项为必填';
    }
    return null;
  }
  
  static String? maxLength(String? value, int max) {
    if (value != null && value.length > max) {
      return '最多$max个字符';
    }
    return null;
  }
}

// 使用
TextFormField(
  validator: Validators.phone,
)
```

---

## 5. 搜索筛选设计

### 5.1 项目筛选

#### 筛选条件

| 字段 | 类型 | 说明 |
|------|------|------|
| `category` | 单选 | 项目分类 |
| `roles_needed` | 多选 | 招募角色 |
| `skills_required` | 多选 | 技能要求 |
| `work_mode` | 单选 | 远程/坐班 |
| `cooperation_type` | 单选 | 股权/薪酬/分成 |
| `keyword` | 文本 | 标题/简介搜索 |

#### 项目分类枚举

```typescript
const PROJECT_CATEGORIES = [
  { value: 'saas', label: 'SaaS 工具' },
  { value: 'app', label: '移动应用' },
  { value: 'game', label: '游戏' },
  { value: 'ai', label: 'AI / 人工智能' },
  { value: 'ecommerce', label: '电商' },
  { value: 'content', label: '内容/社区' },
  { value: 'hardware', label: '智能硬件' },
  { value: 'other', label: '其他' }
]
```

#### 角色枚举

```typescript
const ROLES = [
  { value: 'frontend', label: '前端开发' },
  { value: 'backend', label: '后端开发' },
  { value: 'fullstack', label: '全栈开发' },
  { value: 'mobile', label: '移动端开发' },
  { value: 'design', label: 'UI/UX 设计' },
  { value: 'product', label: '产品经理' },
  { value: 'operation', label: '运营' },
  { value: 'marketing', label: '市场推广' }
]
```

#### 筛选实现

```typescript
// /api/projects/search
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  
  let request = supabase
    .from('projects')
    .select('*, users!projects_user_id_fkey(username, avatar_url)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
  
  // 分类筛选
  if (query.category) {
    request = request.eq('category', query.category)
  }
  
  // 角色筛选 (数组包含)
  if (query.role) {
    request = request.contains('roles_needed', [query.role])
  }
  
  // 技能筛选
  if (query.skill) {
    request = request.contains('skills_required', [query.skill])
  }
  
  // 工作模式
  if (query.work_mode) {
    request = request.eq('work_mode', query.work_mode)
  }
  
  // 关键词搜索
  if (query.keyword) {
    request = request.or(`title.ilike.%${query.keyword}%,summary.ilike.%${query.keyword}%`)
  }
  
  // 分页
  const page = parseInt(query.page as string) || 1
  const pageSize = parseInt(query.pageSize as string) || 20
  const from = (page - 1) * pageSize
  
  request = request.range(from, from + pageSize - 1)
  
  const { data, count } = await request
  
  return {
    success: true,
    data,
    meta: { total: count, page, pageSize }
  }
})
```

### 5.2 开发者筛选

#### 筛选条件

| 字段 | 类型 | 说明 |
|------|------|------|
| `skills` | 多选 | 技能标签 |
| `experience_years` | 范围 | 经验年限 |
| `work_preference` | 单选 | 全职/兼职 |
| `location` | 文本 | 所在地 |
| `keyword` | 文本 | 用户名/简介搜索 |

#### 技能枚举

```typescript
const SKILLS = [
  // 前端
  { value: 'vue', label: 'Vue.js', category: 'frontend' },
  { value: 'react', label: 'React', category: 'frontend' },
  { value: 'typescript', label: 'TypeScript', category: 'frontend' },
  { value: 'flutter', label: 'Flutter', category: 'mobile' },
  
  // 后端
  { value: 'nodejs', label: 'Node.js', category: 'backend' },
  { value: 'python', label: 'Python', category: 'backend' },
  { value: 'java', label: 'Java', category: 'backend' },
  { value: 'golang', label: 'Go', category: 'backend' },
  
  // 其他
  { value: 'mysql', label: 'MySQL', category: 'database' },
  { value: 'mongodb', label: 'MongoDB', category: 'database' },
  { value: 'docker', label: 'Docker', category: 'devops' },
  { value: 'ai', label: 'AI/ML', category: 'ai' }
]
```

#### 筛选实现

```typescript
// /api/developers/search
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  
  let request = supabase
    .from('users')
    .select('id, username, avatar_url, bio, skills, experience_years, work_preference, location')
    .not('username', 'is', null)  // 只查已填资料的用户
    .order('created_at', { ascending: false })
  
  // 技能筛选
  if (query.skill) {
    request = request.contains('skills', [query.skill])
  }
  
  // 经验年限范围
  if (query.min_exp) {
    request = request.gte('experience_years', query.min_exp)
  }
  if (query.max_exp) {
    request = request.lte('experience_years', query.max_exp)
  }
  
  // 工作偏好
  if (query.work_preference) {
    request = request.eq('work_preference', query.work_preference)
  }
  
  // 关键词
  if (query.keyword) {
    request = request.or(`username.ilike.%${query.keyword}%,bio.ilike.%${query.keyword}%`)
  }
  
  // 分页
  const page = parseInt(query.page as string) || 1
  const pageSize = parseInt(query.pageSize as string) || 20
  const from = (page - 1) * pageSize
  
  request = request.range(from, from + pageSize - 1)
  
  const { data, count } = await request
  
  return {
    success: true,
    data,
    meta: { total: count, page, pageSize }
  }
})
```

---

## 6. 核心功能实现

### 5.1 用户认证

#### 手机号验证码登录

```typescript
// server/api/auth/send-code.post.ts
export default defineEventHandler(async (event) => {
  const { phone } = await readBody(event)
  
  // 1. 生成验证码
  const code = Math.random().toString().slice(-6)
  
  // 2. 存储到 Redis/Supabase（5分钟有效）
  await supabase.from('sms_codes').upsert({
    phone,
    code,
    expires_at: new Date(Date.now() + 5 * 60 * 1000)
  })
  
  // 3. 调用阿里云短信发送
  await sendAliyunSms(phone, code)
  
  return { success: true }
})

// server/api/auth/verify-code.post.ts
export default defineEventHandler(async (event) => {
  const { phone, code } = await readBody(event)
  
  // 1. 验证验证码
  const { data } = await supabase
    .from('sms_codes')
    .select()
    .eq('phone', phone)
    .eq('code', code)
    .gt('expires_at', new Date().toISOString())
    .single()
  
  if (!data) throw createError({ statusCode: 400, message: '验证码错误' })
  
  // 2. 查找或创建用户
  let user = await supabase.from('users').select().eq('phone', phone).single()
  if (!user.data) {
    user = await supabase.from('users').insert({ phone }).select().single()
  }
  
  // 3. 生成 JWT Token
  const token = signJwt({ userId: user.data.id })
  
  return { token, user: user.data }
})
```

#### 微信登录

```typescript
// server/api/auth/wechat/callback.get.ts
export default defineEventHandler(async (event) => {
  const { code, state } = getQuery(event)
  
  // 1. 用 code 换取 access_token
  const tokenRes = await $fetch('https://api.weixin.qq.com/sns/oauth2/access_token', {
    query: {
      appid: process.env.WECHAT_APPID,
      secret: process.env.WECHAT_SECRET,
      code,
      grant_type: 'authorization_code'
    }
  })
  
  // 2. 获取用户信息
  const userInfo = await $fetch('https://api.weixin.qq.com/sns/userinfo', {
    query: {
      access_token: tokenRes.access_token,
      openid: tokenRes.openid
    }
  })
  
  // 3. 绑定或创建用户
  let user = await supabase.from('users')
    .select()
    .eq('wechat_openid', tokenRes.openid)
    .single()
  
  if (!user.data) {
    // 新用户，需要绑定手机号
    return sendRedirect(event, `/bindphone?openid=${tokenRes.openid}`)
  }
  
  // 4. 生成 Token
  const token = signJwt({ userId: user.data.id })
  return sendRedirect(event, `/?token=${token}`)
})
```

### 5.2 微信支付

```typescript
// server/api/payment/create-order.post.ts
export default defineEventHandler(async (event) => {
  const { packageId } = await readBody(event)
  const userId = event.context.userId
  
  // 1. 获取套餐信息
  const packages = {
    'basic': { credits: 10, amount: 3000 },     // 30元10次
    'standard': { credits: 30, amount: 5000 },  // 50元30次
    'premium': { credits: 100, amount: 10000 }  // 100元100次
  }
  const pkg = packages[packageId]
  
  // 2. 检查首充优惠
  const { data: user } = await supabase
    .from('users')
    .select('is_first_charge')
    .eq('id', userId)
    .single()
  
  let finalAmount = pkg.amount
  let bonusCredits = 0
  
  if (user?.is_first_charge) {
    // 首充8折 + 额外30%次数
    finalAmount = Math.floor(pkg.amount * 0.8)
    bonusCredits = Math.floor(pkg.credits * 0.3)
  }
  
  const totalCredits = pkg.credits + bonusCredits
  
  // 3. 创建订单
  const orderNo = `${Date.now()}${Math.random().toString().slice(-6)}`
  await supabase.from('orders').insert({
    user_id: userId,
    order_no: orderNo,
    amount: finalAmount,
    credits: totalCredits,
    is_first_charge: user?.is_first_charge || false
  })
  
  // 4. 调用微信支付统一下单
  const wxRes = await createWechatOrder({
    out_trade_no: orderNo,
    total_fee: finalAmount,
    body: `解锁次数 x ${totalCredits}${bonusCredits > 0 ? ' (含首充赠送)' : ''}`
  })
  
  return { 
    orderNo, 
    payParams: wxRes,
    discount: {
      isFirstCharge: user?.is_first_charge,
      originalAmount: pkg.amount,
      finalAmount,
      bonusCredits
    }
  }
})

// server/api/payment/notify.post.ts (微信回调)
export default defineEventHandler(async (event) => {
  const xml = await readBody(event)
  const data = parseWechatXml(xml)
  
  // 1. 验证签名
  if (!verifyWechatSign(data)) {
    return '<xml><return_code>FAIL</return_code></xml>'
  }
  
  // 2. 更新订单状态
  const { data: order } = await supabase
    .from('orders')
    .update({ status: 'paid', paid_at: new Date() })
    .eq('order_no', data.out_trade_no)
    .select()
    .single()
  
  // 3. 增加用户解锁次数
  await supabase.rpc('add_credits', {
    user_id: order.user_id,
    credits: order.credits
  })
  
  return '<xml><return_code>SUCCESS</return_code></xml>'
})
```

### 5.3 站内信系统

#### 业务规则

1. **发送前提**：必须先解锁对方联系方式才能发消息
2. **消息限制**：同一会话每分钟最多发送 5 条
3. **内容限制**：单条消息最长 500 字
4. **通知方式**：App 推送 + 邮件提醒（可选）

#### 数据结构

```sql
-- 会话表（新增）
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES users(id),
  user2_id UUID REFERENCES users(id),
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

-- 消息表（扩展）
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id),
  from_user_id UUID REFERENCES users(id),
  to_user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX idx_messages_unread ON messages(to_user_id, is_read) WHERE is_read = false;
```

#### 发送消息流程

```typescript
// Edge Function: send_message
export async function sendMessage(fromUserId: string, toUserId: string, content: string) {
  // 1. 检查是否已解锁
  const { data: unlock } = await supabase
    .from('unlocks')
    .select()
    .eq('user_id', fromUserId)
    .eq('target_user_id', toUserId)
    .single()
  
  if (!unlock) {
    throw new Error('NOT_UNLOCKED')
  }
  
  // 2. 获取或创建会话
  let conversation = await getOrCreateConversation(fromUserId, toUserId)
  
  // 3. 检查发送频率
  const recentCount = await getRecentMessageCount(fromUserId, toUserId, 60) // 60秒内
  if (recentCount >= 5) {
    throw new Error('RATE_LIMITED')
  }
  
  // 4. 创建消息
  const { data: message } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversation.id,
      from_user_id: fromUserId,
      to_user_id: toUserId,
      content: content.slice(0, 500)
    })
    .select()
    .single()
  
  // 5. 更新会话时间
  await supabase
    .from('conversations')
    .update({ last_message_at: new Date() })
    .eq('id', conversation.id)
  
  return message
}
```

#### 实时消息推送 (Flutter)

```dart
// Flutter 实时订阅
final channel = supabase.channel('messages')
  .onPostgresChanges(
    event: PostgresChangeEvent.insert,
    schema: 'public',
    table: 'messages',
    filter: PostgresChangeFilter(
      type: PostgresChangeFilterType.eq,
      column: 'to_user_id',
      value: currentUserId,
    ),
    callback: (payload) {
      final newMessage = Message.fromJson(payload.newRecord);
      // 显示通知
      showNotification(newMessage);
    },
  )
  .subscribe();
```

#### 未读消息数

```typescript
// /api/messages/unread-count
export default defineEventHandler(async (event) => {
  const userId = event.context.userId
  
  const { count } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('to_user_id', userId)
    .eq('is_read', false)
  
  return { unreadCount: count }
})
```

### 5.4 图片上传

#### Supabase Storage 配置

```sql
-- 创建 Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),      -- 用户头像（公开）
  ('projects', 'projects', true);    -- 项目图片（公开）

-- RLS 策略
CREATE POLICY "Anyone can view public images"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('avatars', 'projects'));

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload project images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'projects' AND
    auth.uid() IS NOT NULL
  );
```

#### 上传流程 (Web)

```typescript
// composables/useUpload.ts
export function useUpload() {
  const supabase = useSupabaseClient()
  
  async function uploadAvatar(file: File): Promise<string> {
    const userId = useSupabaseUser().value?.id
    const ext = file.name.split('.').pop()
    const path = `${userId}/avatar.${ext}`
    
    // 1. 上传文件
    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })
    
    if (error) throw error
    
    // 2. 获取公开 URL
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(path)
    
    // 3. 更新用户头像 URL
    await supabase
      .from('users')
      .update({ avatar_url: data.publicUrl })
      .eq('id', userId)
    
    return data.publicUrl
  }
  
  async function uploadProjectImage(file: File, projectId: string): Promise<string> {
    const fileName = `${projectId}/${Date.now()}.${file.name.split('.').pop()}`
    
    const { error } = await supabase.storage
      .from('projects')
      .upload(fileName, file)
    
    if (error) throw error
    
    const { data } = supabase.storage
      .from('projects')
      .getPublicUrl(fileName)
    
    return data.publicUrl
  }
  
  return { uploadAvatar, uploadProjectImage }
}
```

#### 上传流程 (Flutter)

```dart
// Flutter 上传头像
Future<String> uploadAvatar(File file) async {
  final userId = supabase.auth.currentUser!.id;
  final ext = file.path.split('.').last;
  final path = '$userId/avatar.$ext';
  
  await supabase.storage
      .from('avatars')
      .upload(path, file, fileOptions: FileOptions(upsert: true));
  
  final url = supabase.storage.from('avatars').getPublicUrl(path);
  
  await supabase.from('users').update({'avatar_url': url}).eq('id', userId);
  
  return url;
}
```

#### 图片处理

| 场景 | 最大尺寸 | 格式 | 说明 |
|------|----------|------|------|
| 用户头像 | 500KB | jpg/png/webp | 前端压缩后上传 |
| 项目封面 | 2MB | jpg/png/webp | 推荐 16:9 比例 |
| 文章配图 | 2MB | jpg/png/webp | 学院文章用 |

```typescript
// 前端图片压缩
async function compressImage(file: File, maxSize = 500 * 1024): Promise<File> {
  if (file.size <= maxSize) return file
  
  const canvas = document.createElement('canvas')
  const img = await createImageBitmap(file)
  
  let quality = 0.9
  let result = file
  
  canvas.width = img.width
  canvas.height = img.height
  canvas.getContext('2d')!.drawImage(img, 0, 0)
  
  while (result.size > maxSize && quality > 0.1) {
    const blob = await new Promise<Blob>(resolve => 
      canvas.toBlob(b => resolve(b!), 'image/jpeg', quality)
    )
    result = new File([blob], file.name, { type: 'image/jpeg' })
    quality -= 0.1
  }
  
  return result
}
```

### 6.6 移动端适配

#### 响应式断点

```css
/* assets/css/breakpoints.css */
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
}

/* 移动端优先 */
.container {
  padding: 1rem;
}

@media (min-width: 768px) {
  .container {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

#### Tailwind 配置

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
    },
    extend: {
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      }
    }
  }
}
```

#### 移动端专属组件

```vue
<!-- components/MobileNav.vue -->
<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden pb-safe-bottom">
    <div class="flex justify-around py-2">
      <NuxtLink to="/" class="nav-item">
        <Icon name="home" />
        <span>首页</span>
      </NuxtLink>
      <NuxtLink to="/projects" class="nav-item">
        <Icon name="folder" />
        <span>项目</span>
      </NuxtLink>
      <NuxtLink to="/developers" class="nav-item">
        <Icon name="users" />
        <span>开发者</span>
      </NuxtLink>
      <NuxtLink to="/me" class="nav-item">
        <Icon name="user" />
        <span>我的</span>
      </NuxtLink>
    </div>
  </nav>
</template>
```

#### 触摸优化

```css
/* 触摸友好的按钮尺寸 */
.btn {
  min-height: 44px;  /* iOS 推荐触摸区域 */
  min-width: 44px;
  padding: 0.75rem 1.5rem;
}

/* 禁用双击缩放 */
html {
  touch-action: manipulation;
}

/* 移动端表单优化 */
input, textarea, select {
  font-size: 16px;  /* 防止 iOS 自动缩放 */
}
```

#### 设备检测

```typescript
// composables/useDevice.ts
export function useDevice() {
  const isMobile = computed(() => {
    if (process.server) return false
    return window.innerWidth < 768
  })
  
  const isIOS = computed(() => {
    if (process.server) return false
    return /iPhone|iPad|iPod/.test(navigator.userAgent)
  })
  
  const isWechat = computed(() => {
    if (process.server) return false
    return /MicroMessenger/.test(navigator.userAgent)
  })
  
  return { isMobile, isIOS, isWechat }
}
```

#### 微信 H5 适配

```typescript
// plugins/wechat-h5.client.ts
export default defineNuxtPlugin(() => {
  const { isWechat } = useDevice()
  
  if (isWechat.value) {
    // 隐藏微信分享菜单的特定项
    // 配置微信 JSSDK...
  }
})
```

### 6.7 SEO 优化策略

#### 4.3.1 目标关键词

**核心词（高竞争）**

| 关键词 | 搜索量估计 | 优化页面 |
|--------|------------|----------|
| 独立开发者 | 高 | 首页 |
| 技术合伙人 | 中 | 首页 |
| 找合伙人 | 中 | 项目列表 |
| 创业找人 | 中 | 首页 |

**长尾词（低竞争，精准流量）**

| 关键词 | 优化页面 |
|--------|----------|
| 独立开发者找合伙人 | 首页 |
| 技术合伙人怎么找 | 学院文章 |
| 创业项目找技术 | 项目列表 |
| 程序员副业项目 | 学院文章 |
| 远程开发合作 | 项目分类页 |
| 独立开发者社区 | 开发者列表 |
| 项目合伙人招募 | 项目详情 |
| 技术入股创业 | 学院文章 |

#### 4.3.2 页面关键词分布

| 页面 | 主关键词 | 副关键词 | Title 模板 |
|------|----------|----------|------------|
| 首页 | 独立开发者 | 技术合伙人,找合伙人 | 小概率 - 独立开发者找合伙人的第一站 |
| 项目列表 | 创业项目 | 找技术,招合伙人 | 创业项目招募 - 小概率 |
| 项目详情 | {项目名} | 找合伙人,招技术 | {项目名} - 招募技术合伙人 |
| 开发者列表 | 开发者 | 技术人才,程序员 | 开发者人才库 - 小概率 |
| 开发者主页 | {用户名} | 技能,经验 | {用户名} - 独立开发者 |
| 学院 | 独立开发 | 创业,技术 | 独立开发者学院 - 小概率 |

#### 4.3.3 技术 SEO 实现

**Nuxt 配置**

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  ssr: true,
  
  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      title: '小概率 - 独立开发者找合伙人的第一站',
      meta: [
        { name: 'description', content: '帮助独立开发者发布项目、寻找技术合伙人，找到靠谱的创业伙伴' },
        { name: 'keywords', content: '独立开发者,技术合伙人,找合伙人,创业项目,程序员副业' },
        { name: 'author', content: '小概率' },
        { property: 'og:site_name', content: '小概率' },
        { property: 'og:locale', content: 'zh_CN' },
        { name: 'robots', content: 'index,follow' }
      ],
      link: [
        { rel: 'canonical', href: 'https://mirauni.com' }
      ]
    }
  },
  
  routeRules: {
    '/': { prerender: true },
    '/projects': { swr: 600 },
    '/projects/**': { swr: 3600 },
    '/developers': { swr: 600 },
    '/developers/**': { swr: 3600 },
    '/academy': { swr: 3600 },
    '/academy/**': { swr: 86400 }
  }
})
```

**动态页面 SEO**

```vue
<!-- pages/projects/detail/[id].vue -->
<script setup>
const route = useRoute()
const { data: project } = await useFetch(`/api/projects/${route.params.id}`)

useSeoMeta({
  title: `${project.value?.title} - 招募技术合伙人 | 小概率`,
  description: project.value?.summary,
  keywords: `${project.value?.category},技术合伙人,找合伙人`,
  ogTitle: project.value?.title,
  ogDescription: project.value?.summary,
  ogType: 'article'
})

// 结构化数据
useHead({
  script: [{
    type: 'application/ld+json',
    children: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: project.value?.title,
      description: project.value?.summary,
      hiringOrganization: {
        '@type': 'Organization',
        name: '小概率'
      },
      employmentType: 'CONTRACTOR'
    })
  }]
})
</script>
```

#### 4.3.4 百度收录优化

**Sitemap 自动生成**

```typescript
// server/routes/sitemap.xml.get.ts
export default defineEventHandler(async (event) => {
  const [projects, developers, articles] = await Promise.all([
    supabase.from('projects').select('id, updated_at').eq('status', 'active'),
    supabase.from('users').select('username, updated_at').not('username', 'is', null),
    supabase.from('articles').select('slug, updated_at').eq('status', 'published')
  ])
  
  const urls = [
    { loc: 'https://mirauni.com/', priority: '1.0', changefreq: 'daily' },
    { loc: 'https://mirauni.com/projects', priority: '0.9', changefreq: 'daily' },
    { loc: 'https://mirauni.com/developers', priority: '0.8', changefreq: 'daily' },
    { loc: 'https://mirauni.com/academy', priority: '0.8', changefreq: 'weekly' },
    ...projects.data.map(p => ({
      loc: `https://mirauni.com/projects/detail/${p.id}`,
      lastmod: p.updated_at,
      priority: '0.7'
    })),
    ...developers.data.map(d => ({
      loc: `https://mirauni.com/developers/${d.username}`,
      lastmod: d.updated_at,
      priority: '0.6'
    })),
    ...articles.data.map(a => ({
      loc: `https://mirauni.com/academy/${a.slug}`,
      lastmod: a.updated_at,
      priority: '0.7'
    }))
  ]
  
  setResponseHeader(event, 'Content-Type', 'application/xml')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `<url>
  <loc>${u.loc}</loc>
  ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
  ${u.priority ? `<priority>${u.priority}</priority>` : ''}
  ${u.changefreq ? `<changefreq>${u.changefreq}</changefreq>` : ''}
</url>`).join('\n')}
</urlset>`
})
```

**百度主动推送**

```typescript
// server/api/seo/push-baidu.post.ts
export default defineEventHandler(async (event) => {
  const { urls } = await readBody(event)
  
  // 百度站长平台主动推送 API
  const response = await $fetch(
    `http://data.zz.baidu.com/urls?site=mirauni.com&token=${process.env.BAIDU_PUSH_TOKEN}`,
    {
      method: 'POST',
      body: urls.join('\n'),
      headers: { 'Content-Type': 'text/plain' }
    }
  )
  
  return response
})

// 新项目发布时自动推送
async function onProjectPublished(projectId: string) {
  await $fetch('/api/seo/push-baidu', {
    method: 'POST',
    body: { urls: [`https://mirauni.com/projects/detail/${projectId}`] }
  })
}
```

#### 4.3.5 结构化数据

**组织信息 (首页)**

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "小概率",
  "url": "https://mirauni.com",
  "logo": "https://mirauni.com/logo.png",
  "description": "独立开发者找合伙人的第一站"
}
```

**项目详情 (JobPosting)**

```json
{
  "@context": "https://schema.org",
  "@type": "JobPosting",
  "title": "招募前端技术合伙人",
  "description": "寻找 Vue/React 技术合伙人...",
  "employmentType": "CONTRACTOR",
  "hiringOrganization": { "@type": "Organization", "name": "小概率" }
}
```

#### 4.3.6 外链策略

| 渠道 | 方式 | 预期效果 |
|------|------|----------|
| V2EX | 发帖介绍项目 | 高质量外链 + 流量 |
| 知乎 | 回答"找技术合伙人"相关问题 | 长尾流量 |
| 即刻 | 独立开发者圈子分享 | 精准用户 |
| 掘金 | 技术文章引流 | 开发者流量 |
| GitHub | README 添加链接 | 技术外链 |
| 独立开发者社区 | 互换友链 | 相关性外链 |

#### 4.3.7 学院内容 SEO

**文章选题策略（长尾关键词）**

| 文章标题 | 目标关键词 |
|----------|------------|
| 如何找到靠谱的技术合伙人？ | 找技术合伙人 |
| 独立开发者如何从0到1做产品 | 独立开发者做产品 |
| 技术入股创业需要注意什么？ | 技术入股 |
| 远程协作工具推荐 | 远程协作 |
| 副业项目如何找人合作？ | 副业找合伙人 |

**文章结构规范**

- H1: 文章标题（包含关键词）
- H2: 2-4个二级标题
- 首段100字内包含主关键词
- 图片添加 alt 标签
- 内链至少3个（项目页、开发者页、其他文章）

---

## 5. 部署与运维

### 5.1 Vercel 部署

#### 项目配置

```json
// vercel.json
{
  "framework": "nuxt",
  "regions": ["hkg1"],  // 香港节点，国内访问较快
  "functions": {
    "server/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

#### 部署步骤

1. **连接 GitHub 仓库**
   - 登录 Vercel → Import Project
   - 选择 mirauni 仓库
   - Framework 选择 Nuxt.js

2. **配置构建命令**
   ```
   Build Command: npm run build
   Output Directory: .output
   Install Command: npm install
   ```

3. **设置环境变量**（见 5.3）

4. **触发部署**
   - 推送到 main 分支自动部署
   - 或手动点击 Deploy

### 5.2 Supabase 配置

#### 创建项目

1. 登录 supabase.com → New Project
2. 选择区域：**Singapore**（离国内最近）
3. 记录项目 URL 和 anon key

#### 初始化数据库

```bash
# 安装 Supabase CLI
npm install -g supabase

# 登录
supabase login

# 初始化本地配置
supabase init

# 推送数据库 schema
supabase db push
```

#### 启用 RLS

在 Supabase Dashboard → SQL Editor 执行上文的 RLS 策略脚本。

### 5.3 环境变量

#### Vercel 环境变量配置

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `SUPABASE_URL` | Supabase 项目 URL | https://xxx.supabase.co |
| `SUPABASE_KEY` | Supabase anon key | eyJhbGci... |
| `SUPABASE_SERVICE_KEY` | Supabase service key | eyJhbGci... |
| `JWT_SECRET` | JWT 签名密钥 | 随机64位字符串 |
| `WECHAT_APPID` | 微信开放平台 AppID | wx... |
| `WECHAT_SECRET` | 微信开放平台 Secret | ... |
| `WECHAT_MCH_ID` | 微信支付商户号 | 15... |
| `WECHAT_API_KEY` | 微信支付 API 密钥 | ... |
| `ALIYUN_SMS_KEY` | 阿里云短信 AccessKey | LTAI... |
| `ALIYUN_SMS_SECRET` | 阿里云短信 Secret | ... |

### 5.4 域名配置

#### Vercel 域名绑定

1. Vercel Dashboard → Project → Domains
2. 添加 `mirauni.com` 和 `www.mirauni.com`
3. 按提示配置 DNS 记录

#### DNS 配置（域名服务商）

| 类型 | 主机记录 | 记录值 |
|------|----------|--------|
| A | @ | 76.76.21.21 |
| CNAME | www | cname.vercel-dns.com |

> [!WARNING]  
> **备案说明**  
> 由于 Vercel 服务器在海外，域名虽已备案但不会解析到国内 IP。  
> 备案号可在页脚展示，但实际不影响访问。

### 5.5 监控与日志

#### Vercel 内置监控

- **Analytics**: 访问量、性能指标
- **Logs**: 实时查看函数日志
- **Speed Insights**: 页面加载速度

#### 百度统计

```typescript
// plugins/baidu-analytics.client.ts
export default defineNuxtPlugin(() => {
  if (process.client) {
    const script = document.createElement('script')
    script.src = 'https://hm.baidu.com/hm.js?你的统计ID'
    document.head.appendChild(script)
  }
})
```

#### 自建埋点系统

**埋点事件定义**

| 事件名 | 触发时机 | 参数 |
|--------|----------|------|
| `page_view` | 页面浏览 | page, referrer |
| `register` | 注册成功 | method (phone/wechat) |
| `login` | 登录成功 | method |
| `project_view` | 查看项目详情 | project_id |
| `developer_view` | 查看开发者主页 | user_id |
| `unlock_click` | 点击解锁按钮 | target_id, type |
| `unlock_success` | 解锁成功 | target_id, type |
| `recharge_click` | 点击充值 | package_id |
| `recharge_success` | 充值成功 | package_id, amount |
| `message_send` | 发送消息 | to_user_id |

**埋点数据表**

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  event_name VARCHAR(50) NOT NULL,
  event_params JSONB,
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_name ON events(event_name, created_at);
CREATE INDEX idx_events_user ON events(user_id, created_at);
```

**前端埋点工具**

```typescript
// composables/useTrack.ts
export function useTrack() {
  const user = useSupabaseUser()
  
  async function track(eventName: string, params?: Record<string, any>) {
    try {
      await $fetch('/api/track', {
        method: 'POST',
        body: {
          event_name: eventName,
          event_params: params,
          page_url: window.location.href,
          referrer: document.referrer
        }
      })
    } catch (e) {
      // 埋点失败不影响用户体验
      console.warn('Track failed:', e)
    }
  }
  
  return { track }
}

// 使用示例
const { track } = useTrack()
track('project_view', { project_id: '123' })
```

**Flutter 埋点**

```dart
class Analytics {
  static Future<void> track(String eventName, [Map<String, dynamic>? params]) async {
    try {
      await supabase.from('events').insert({
        'user_id': supabase.auth.currentUser?.id,
        'event_name': eventName,
        'event_params': params,
        'page_url': 'app://current_page',
      });
    } catch (e) {
      debugPrint('Track failed: $e');
    }
  }
}

// 使用
Analytics.track('project_view', {'project_id': '123'});
```

**转化漏斗分析**

```sql
-- 注册转化漏斗
WITH funnel AS (
  SELECT 
    COUNT(DISTINCT CASE WHEN event_name = 'page_view' THEN user_id END) AS pv_users,
    COUNT(DISTINCT CASE WHEN event_name = 'register' THEN user_id END) AS registered,
    COUNT(DISTINCT CASE WHEN event_name = 'unlock_click' THEN user_id END) AS unlock_click,
    COUNT(DISTINCT CASE WHEN event_name = 'recharge_success' THEN user_id END) AS paid
  FROM events
  WHERE created_at > NOW() - INTERVAL '7 days'
)
SELECT 
  pv_users,
  registered,
  ROUND(registered::numeric / pv_users * 100, 2) AS register_rate,
  paid,
  ROUND(paid::numeric / registered * 100, 2) AS pay_rate
FROM funnel;
```

### 8.6 常见问题

| 问题 | 解决方案 |
|------|----------|
| 国内访问慢 | 使用 Cloudflare 代理或考虑迁移到国内服务器 |
| 微信支付回调失败 | 确保回调 URL 可公网访问，检查签名 |
| Supabase 连接超时 | 检查 RLS 策略是否正确 |
| SSR 页面 500 错误 | 查看 Vercel Functions 日志 |

---

## 9. 日志规范

### 9.1 日志级别

| 级别 | 用途 | 示例 |
|------|------|------|
| `error` | 系统错误、需立即处理 | 支付失败、数据库连接失败 |
| `warn` | 警告、可能的问题 | 请求超时、重试成功 |
| `info` | 重要业务事件 | 用户注册、订单创建 |
| `debug` | 调试信息（生产环境关闭） | 请求参数、SQL 查询 |

### 9.2 日志格式

```typescript
// server/utils/logger.ts
export function log(level: 'error' | 'warn' | 'info' | 'debug', message: string, data?: any) {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    level,
    message,
    ...data
  }
  
  if (level === 'error') {
    console.error(JSON.stringify(logEntry))
  } else if (level === 'warn') {
    console.warn(JSON.stringify(logEntry))
  } else {
    console.log(JSON.stringify(logEntry))
  }
}

// 使用示例
log('info', '用户注册成功', { userId: '123', method: 'phone' })
log('error', '支付回调失败', { orderNo: 'xxx', error: err.message })
```

### 9.3 关键业务日志

| 事件 | 级别 | 记录内容 |
|------|------|----------|
| 用户注册 | info | userId, method |
| 登录成功 | info | userId, ip |
| 登录失败 | warn | phone, reason, ip |
| 项目发布 | info | projectId, userId |
| 支付创建 | info | orderNo, userId, amount |
| 支付成功 | info | orderNo, userId |
| 支付失败 | error | orderNo, error |
| 解锁成功 | info | userId, targetId |
| API 错误 | error | path, method, error, stack |

---

## 10. ASO 优化方案（App Store Optimization）

### 10.1 ASO 基础

**与 Web SEO 的区别**

| 对比项 | Web SEO | App ASO |
|--------|---------|---------|
| 搜索引擎 | 百度/Google | App Store/华为/小米等 |
| 关键词位置 | 标题、内容、meta | App名称、副标题、关键词字段 |
| 外链 | 重要 | 不适用 |
| 评分评价 | 次要 | 非常重要 |
| 下载量 | 不适用 | 核心排名因素 |

### 10.2 App Store (iOS) 优化

**元数据规划**

| 字段 | 限制 | 内容建议 |
|------|------|----------|
| App 名称 | 30字符 | 小概率 - 独立开发者合伙人 |
| 副标题 | 30字符 | 找技术合伙人的第一站 |
| 关键词 | 100字符 | 独立开发者,合伙人,创业,技术合作,找人,项目合作,程序员,副业 |
| 描述 | 4000字符 | 突出核心功能，包含关键词 |
| 预览截图 | 10张 | 核心功能展示 |

**关键词策略**

```
核心词：独立开发者, 合伙人, 技术合作
长尾词：找技术合伙人, 程序员副业, 创业找人
竞品词：（慎用）
```

### 10.3 Android 应用商店优化

**主要商店**

| 商店 | 用户量 | 审核速度 | 关键词权重 |
|------|--------|----------|------------|
| 应用宝 | 最大 | 3-5天 | 标题+简介 |
| 华为应用市场 | 大 | 1-2天 | 标题+标签 |
| 小米应用商店 | 大 | 1-3天 | 标题+简介 |
| OPPO/VIVO | 中 | 2-3天 | 标题 |

**Android 元数据**

| 字段 | 建议 |
|------|------|
| 应用名称 | 小概率-独立开发者找合伙人 |
| 一句话简介 | 帮助独立开发者找到靠谱技术合伙人 |
| 详细描述 | 包含关键词，突出功能亮点 |
| 应用分类 | 社交/效率工具 |
| 标签 | 独立开发者、创业、技术、合伙人 |

### 10.4 ASO 监控指标

| 指标 | 说明 | 目标 |
|------|------|------|
| 关键词排名 | 核心词在商店搜索排名 | Top 10 |
| 商店曝光 | 在搜索结果中展示次数 | 持续增长 |
| 下载转化率 | 曝光→下载 | > 5% |
| 评分 | 用户评分 | > 4.5 |
| 评价数 | 有效评价数量 | 尽可能多 |

### 10.5 提升评分策略

```dart
// Flutter 智能引导评分
class RatingHelper {
  static Future<void> maybeAskForRating() async {
    final prefs = await SharedPreferences.getInstance();
    final launchCount = prefs.getInt('launch_count') ?? 0;
    final hasRated = prefs.getBool('has_rated') ?? false;
    
    // 用户使用3次后，且未评分，引导评分
    if (launchCount >= 3 && !hasRated) {
      final result = await showDialog(
        // 询问是否喜欢这个应用
      );
      
      if (result == true) {
        // 喜欢 -> 跳转商店评分
        await InAppReview.instance.requestReview();
        prefs.setBool('has_rated', true);
      } else {
        // 不喜欢 -> 收集反馈
        // 跳转到反馈页面
      }
    }
    
    prefs.setInt('launch_count', launchCount + 1);
  }
}
```

---

## 11. 安全防护方案

### 9.1 认证安全

#### JWT 配置

```typescript
// server/utils/jwt.ts
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_EXPIRES = '7d'

export function signJwt(payload: { userId: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES })
}

export function verifyJwt(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch {
    return null
  }
}
```

#### Token 刷新机制

```typescript
// 中间件自动刷新
export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'token')
  if (!token) return
  
  const payload = verifyJwt(token)
  if (!payload) return
  
  // Token 还剩 1 天时自动刷新
  const decoded = jwt.decode(token) as { exp: number }
  const daysLeft = (decoded.exp * 1000 - Date.now()) / (1000 * 60 * 60 * 24)
  
  if (daysLeft < 1) {
    const newToken = signJwt({ userId: payload.userId })
    setCookie(event, 'token', newToken, { httpOnly: true, secure: true })
  }
})
```

### 9.2 请求安全

#### 速率限制

```typescript
// server/middleware/rate-limit.ts
const rateLimits = new Map<string, { count: number; resetTime: number }>()

export default defineEventHandler((event) => {
  const ip = getRequestIP(event) || 'unknown'
  const now = Date.now()
  
  const limit = rateLimits.get(ip)
  
  if (!limit || now > limit.resetTime) {
    rateLimits.set(ip, { count: 1, resetTime: now + 60000 }) // 1分钟窗口
    return
  }
  
  if (limit.count > 60) { // 每分钟最多 60 次请求
    throw createError({ statusCode: 429, message: '请求过于频繁' })
  }
  
  limit.count++
})
```

#### XSS 防护

```typescript
// 输入过滤
import DOMPurify from 'isomorphic-dompurify'

export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] })
}

// 使用示例
const title = sanitizeInput(body.title)
const content = sanitizeInput(body.content)
```

#### SQL 注入防护

```typescript
// Supabase 自动防护参数化查询
// ✅ 安全
await supabase.from('projects').select().eq('title', userInput)

// ❌ 危险 - 永远不要这样做
// await supabase.from('projects').select().filter('title', 'eq', `'${userInput}'`)
```

### 9.3 数据安全

#### 敏感数据保护

| 字段 | 保护措施 |
|------|----------|
| 手机号 | 前端显示脱敏：138****1234 |
| 微信号 | 仅解锁后返回 |
| 密码 | bcrypt 加密存储 |
| JWT Secret | 环境变量，不入库 |

```typescript
// 脱敏工具
export function maskPhone(phone: string): string {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

export function maskWechat(wechat: string): string {
  if (wechat.length <= 4) return '****'
  return wechat.slice(0, 2) + '****' + wechat.slice(-2)
}
```

#### RLS 行级安全

```sql
-- 确保用户只能访问自己的敏感数据
CREATE POLICY "Users can only see own contact"
  ON users FOR SELECT
  USING (
    auth.uid() = id OR  -- 自己的数据
    phone IS NULL OR    -- 没有手机号
    EXISTS (            -- 已解锁
      SELECT 1 FROM unlocks 
      WHERE user_id = auth.uid() AND target_user_id = users.id
    )
  );
```

### 9.4 支付安全

#### 微信支付签名验证

```typescript
import crypto from 'crypto'

export function verifyWechatSign(data: Record<string, string>): boolean {
  const { sign, ...params } = data
  
  // 1. 按字典序排序
  const sortedKeys = Object.keys(params).sort()
  const stringA = sortedKeys.map(k => `${k}=${params[k]}`).join('&')
  
  // 2. 拼接 API 密钥
  const stringSignTemp = stringA + `&key=${process.env.WECHAT_API_KEY}`
  
  // 3. MD5 签名
  const expectedSign = crypto
    .createHash('md5')
    .update(stringSignTemp)
    .digest('hex')
    .toUpperCase()
  
  return sign === expectedSign
}
```

#### 防重放攻击

```typescript
// 订单号唯一性 + 回调幂等
export async function handlePaymentNotify(orderNo: string) {
  // 使用事务确保幂等
  const { data: order } = await supabase
    .from('orders')
    .select()
    .eq('order_no', orderNo)
    .eq('status', 'pending')  // 只处理待支付订单
    .single()
  
  if (!order) {
    // 订单不存在或已处理，返回成功防止微信重试
    return { success: true }
  }
  
  // 更新订单状态...
}
```

### 9.5 安全检查清单

| 检查项 | 状态 |
|--------|------|
| HTTPS 强制 | ✅ Vercel 默认 |
| Cookie HttpOnly | ✅ |
| Cookie Secure | ✅ |
| CORS 配置 | ⚙️ 需配置 |
| CSP 头 | ⚙️ 需配置 |
| API 速率限制 | ✅ |
| 输入验证 | ✅ |
| SQL 注入防护 | ✅ Supabase 自动 |
| XSS 防护 | ✅ DOMPurify |
| 支付签名验证 | ✅ |

---

## 12. Flutter App 设计

### 12.1 项目目录结构

```
mirauni-app/
├── lib/
│   ├── main.dart                    # 入口文件
│   ├── app.dart                     # App 根组件
│   │
│   ├── config/                      # 配置
│   │   ├── constants.dart           # 常量定义
│   │   ├── theme.dart               # 主题配置
│   │   └── env.dart                 # 环境变量
│   │
│   ├── core/                        # 核心层
│   │   ├── supabase/                # Supabase 封装
│   │   │   ├── supabase_client.dart
│   │   │   └── supabase_auth.dart
│   │   ├── storage/                 # 本地存储
│   │   │   └── local_storage.dart
│   │   └── network/                 # 网络请求
│   │       └── api_client.dart
│   │
│   ├── models/                      # 数据模型
│   │   ├── user.dart
│   │   ├── project.dart
│   │   ├── message.dart
│   │   └── order.dart
│   │
│   ├── providers/                   # 状态管理 (Riverpod)
│   │   ├── auth_provider.dart
│   │   ├── user_provider.dart
│   │   ├── project_provider.dart
│   │   └── message_provider.dart
│   │
│   ├── services/                    # 业务服务
│   │   ├── auth_service.dart        # 认证服务
│   │   ├── wechat_service.dart      # 微信登录/支付
│   │   ├── payment_service.dart     # 支付服务
│   │   └── push_service.dart        # 推送服务
│   │
│   ├── pages/                       # 页面
│   │   ├── splash/                  # 启动页
│   │   ├── auth/                    # 登录注册
│   │   │   ├── login_page.dart
│   │   │   └── bind_phone_page.dart
│   │   ├── home/                    # 首页
│   │   ├── projects/                # 项目
│   │   │   ├── project_list_page.dart
│   │   │   └── project_detail_page.dart
│   │   ├── developers/              # 开发者
│   │   │   ├── developer_list_page.dart
│   │   │   └── developer_profile_page.dart
│   │   ├── messages/                # 消息
│   │   │   ├── message_list_page.dart
│   │   │   └── chat_page.dart
│   │   ├── me/                      # 我的
│   │   │   ├── profile_page.dart
│   │   │   ├── my_projects_page.dart
│   │   │   └── recharge_page.dart
│   │   └── common/                  # 公共页面
│   │       └── webview_page.dart
│   │
│   ├── widgets/                     # 通用组件
│   │   ├── common/                  # 基础组件
│   │   │   ├── loading.dart
│   │   │   ├── empty_state.dart
│   │   │   └── error_view.dart
│   │   ├── project/                 # 项目组件
│   │   │   └── project_card.dart
│   │   ├── developer/               # 开发者组件
│   │   │   └── developer_card.dart
│   │   └── form/                    # 表单组件
│   │       ├── phone_input.dart
│   │       └── code_input.dart
│   │
│   ├── router/                      # 路由
│   │   └── app_router.dart
│   │
│   └── utils/                       # 工具类
│       ├── validators.dart          # 表单验证
│       ├── formatters.dart          # 格式化
│       ├── analytics.dart           # 埋点
│       └── toast.dart               # 提示
│
├── assets/                          # 资源文件
│   ├── images/
│   ├── fonts/
│   └── icons/
│
├── pubspec.yaml                     # 依赖配置
├── android/                         # Android 配置
├── ios/                             # iOS 配置
└── test/                            # 测试
```

### 12.2 核心依赖包

```yaml
# pubspec.yaml
dependencies:
  flutter:
    sdk: flutter
  
  # Supabase
  supabase_flutter: ^2.0.0          # Supabase 官方 SDK
  
  # 状态管理
  flutter_riverpod: ^2.4.0          # Riverpod 状态管理
  riverpod_annotation: ^2.3.0       # Riverpod 注解
  
  # 路由
  go_router: ^13.0.0                # 声明式路由
  
  # 微信
  fluwx: ^4.5.0                     # 微信登录、支付、分享
  
  # 网络/存储
  dio: ^5.4.0                       # HTTP 请求（备用）
  shared_preferences: ^2.2.0        # 本地存储
  
  # UI 组件
  flutter_screenutil: ^5.9.0        # 屏幕适配
  cached_network_image: ^3.3.0      # 图片缓存
  shimmer: ^3.0.0                   # 骨架屏
  pull_to_refresh: ^2.0.0           # 下拉刷新
  
  # 表单/输入
  pin_code_fields: ^8.0.0           # 验证码输入
  image_picker: ^1.0.0              # 图片选择
  image_cropper: ^5.0.0             # 图片裁剪
  
  # 工具
  intl: ^0.18.0                     # 国际化/日期格式
  url_launcher: ^6.2.0              # 打开链接
  package_info_plus: ^5.0.0         # 应用信息
  
  # 推送
  firebase_messaging: ^14.7.0       # FCM 推送（可选）
  jpush_flutter: ^2.5.0             # 极光推送（国内）
  
  # 评分
  in_app_review: ^2.0.0             # 应用内评分

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0
  build_runner: ^2.4.0
  riverpod_generator: ^2.3.0
```

### 12.3 环境配置

```dart
// lib/config/env.dart
class Env {
  static const supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://xxx.supabase.co',
  );
  
  static const supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue: 'xxx',
  );
  
  static const wechatAppId = String.fromEnvironment(
    'WECHAT_APP_ID',
    defaultValue: 'wxXXXXXXXX',
  );
}
```

### 12.4 状态管理 (Riverpod)

#### Provider 设计

```dart
// lib/providers/auth_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

// 当前用户状态
final currentUserProvider = StateNotifierProvider<UserNotifier, User?>((ref) {
  return UserNotifier(ref);
});

class UserNotifier extends StateNotifier<User?> {
  final Ref ref;
  
  UserNotifier(this.ref) : super(null) {
    _init();
  }
  
  Future<void> _init() async {
    final session = supabase.auth.currentSession;
    if (session != null) {
      await fetchUser();
    }
  }
  
  Future<void> fetchUser() async {
    final userId = supabase.auth.currentUser?.id;
    if (userId == null) return;
    
    final data = await supabase
        .from('users')
        .select()
        .eq('id', userId)
        .single();
    
    state = User.fromJson(data);
  }
  
  void logout() {
    supabase.auth.signOut();
    state = null;
  }
}

// 是否已登录
final isLoggedInProvider = Provider<bool>((ref) {
  return ref.watch(currentUserProvider) != null;
});
```

#### 项目列表 Provider

```dart
// lib/providers/project_provider.dart
final projectListProvider = FutureProvider.family<List<Project>, ProjectFilter>(
  (ref, filter) async {
    var query = supabase
        .from('projects')
        .select('*, users!projects_user_id_fkey(username, avatar_url)')
        .eq('status', 'active')
        .order('created_at', ascending: false);
    
    if (filter.category != null) {
      query = query.eq('category', filter.category);
    }
    
    if (filter.keyword != null) {
      query = query.or('title.ilike.%${filter.keyword}%,summary.ilike.%${filter.keyword}%');
    }
    
    final data = await query.range(filter.offset, filter.offset + filter.limit - 1);
    return data.map((e) => Project.fromJson(e)).toList();
  },
);

// 筛选条件
class ProjectFilter {
  final String? category;
  final String? keyword;
  final int offset;
  final int limit;
  
  ProjectFilter({this.category, this.keyword, this.offset = 0, this.limit = 20});
}
```

#### 消息实时订阅

```dart
// lib/providers/message_provider.dart
final unreadCountProvider = StreamProvider<int>((ref) {
  final userId = ref.watch(currentUserProvider)?.id;
  if (userId == null) return Stream.value(0);
  
  return supabase
      .from('messages')
      .stream(primaryKey: ['id'])
      .eq('to_user_id', userId)
      .eq('is_read', false)
      .map((list) => list.length);
});

// 会话列表
final conversationsProvider = FutureProvider<List<Conversation>>((ref) async {
  final userId = ref.watch(currentUserProvider)?.id;
  if (userId == null) return [];
  
  final data = await supabase
      .from('conversations')
      .select('*, last_message:messages(*)')
      .or('user1_id.eq.$userId,user2_id.eq.$userId')
      .order('last_message_at', ascending: false);
  
  return data.map((e) => Conversation.fromJson(e)).toList();
});
```

### 12.5 路由设计 (go_router)

#### 路由表

| 路径 | 页面 | 需登录 |
|------|------|--------|
| `/` | 首页 (TabBar) | ❌ |
| `/login` | 登录页 | ❌ |
| `/bind-phone` | 绑定手机号 | ✅ |
| `/projects` | 项目列表 | ❌ |
| `/project/:id` | 项目详情 | ❌ |
| `/developers` | 开发者列表 | ❌ |
| `/developer/:id` | 开发者主页 | ❌ |
| `/messages` | 消息列表 | ✅ |
| `/chat/:userId` | 聊天页 | ✅ |
| `/me` | 我的 | ✅ |
| `/me/profile` | 编辑资料 | ✅ |
| `/me/projects` | 我的项目 | ✅ |
| `/recharge` | 充值页 | ✅ |

#### 路由配置

```dart
// lib/router/app_router.dart
import 'package:go_router/go_router.dart';

final appRouter = GoRouter(
  initialLocation: '/',
  redirect: (context, state) {
    final isLoggedIn = ref.read(isLoggedInProvider);
    final isAuthRoute = state.matchedLocation == '/login';
    
    // 需要登录的路由
    final protectedRoutes = ['/messages', '/chat', '/me', '/recharge'];
    final needsAuth = protectedRoutes.any((r) => state.matchedLocation.startsWith(r));
    
    if (needsAuth && !isLoggedIn) {
      return '/login?redirect=${state.matchedLocation}';
    }
    
    return null;
  },
  routes: [
    // 主页 (底部导航)
    ShellRoute(
      builder: (context, state, child) => MainShell(child: child),
      routes: [
        GoRoute(
          path: '/',
          builder: (context, state) => const HomePage(),
        ),
        GoRoute(
          path: '/projects',
          builder: (context, state) => const ProjectListPage(),
        ),
        GoRoute(
          path: '/developers',
          builder: (context, state) => const DeveloperListPage(),
        ),
        GoRoute(
          path: '/messages',
          builder: (context, state) => const MessageListPage(),
        ),
        GoRoute(
          path: '/me',
          builder: (context, state) => const MePage(),
        ),
      ],
    ),
    
    // 独立页面
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginPage(),
    ),
    GoRoute(
      path: '/bind-phone',
      builder: (context, state) => const BindPhonePage(),
    ),
    GoRoute(
      path: '/project/:id',
      builder: (context, state) => ProjectDetailPage(
        projectId: state.pathParameters['id']!,
      ),
    ),
    GoRoute(
      path: '/developer/:id',
      builder: (context, state) => DeveloperProfilePage(
        userId: state.pathParameters['id']!,
      ),
    ),
    GoRoute(
      path: '/chat/:userId',
      builder: (context, state) => ChatPage(
        targetUserId: state.pathParameters['userId']!,
      ),
    ),
    GoRoute(
      path: '/recharge',
      builder: (context, state) => const RechargePage(),
    ),
  ],
);
```

#### 底部导航

```dart
// lib/widgets/main_shell.dart
class MainShell extends StatelessWidget {
  final Widget child;
  
  const MainShell({required this.child});
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _calculateIndex(context),
        onTap: (index) => _onTap(context, index),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: '首页'),
          BottomNavigationBarItem(icon: Icon(Icons.folder), label: '项目'),
          BottomNavigationBarItem(icon: Icon(Icons.people), label: '开发者'),
          BottomNavigationBarItem(icon: Icon(Icons.message), label: '消息'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: '我的'),
        ],
      ),
    );
  }
  
  void _onTap(BuildContext context, int index) {
    final routes = ['/', '/projects', '/developers', '/messages', '/me'];
    context.go(routes[index]);
  }
}
```

### 12.6 认证流程（与 Web 保持一致）

#### 手机号验证码登录

> **数据互通**：使用同一个 Supabase Edge Function，App 和 Web 用户数据完全一致

```dart
// lib/services/auth_service.dart
class AuthService {
  final supabase = Supabase.instance.client;
  
  /// 发送验证码（调用 Edge Function，与 Web 共用）
  Future<void> sendCode(String phone) async {
    final response = await supabase.functions.invoke(
      'send-sms-code',
      body: {'phone': phone},
    );
    
    if (response.status != 200) {
      throw Exception(response.data['error'] ?? '发送失败');
    }
  }
  
  /// 验证码登录（调用 Edge Function，与 Web 共用）
  Future<User> loginWithPhone(String phone, String code) async {
    final response = await supabase.functions.invoke(
      'verify-sms-code',
      body: {'phone': phone, 'code': code},
    );
    
    if (response.status != 200) {
      throw Exception(response.data['error'] ?? '验证失败');
    }
    
    // Edge Function 返回 Supabase session
    final session = response.data['session'];
    await supabase.auth.setSession(session);
    
    return User.fromJson(response.data['user']);
  }
}
```

#### 微信 App 登录

```dart
// lib/services/wechat_service.dart
import 'package:fluwx/fluwx.dart';

class WechatService {
  final supabase = Supabase.instance.client;
  
  /// 初始化微信 SDK
  Future<void> init() async {
    await registerWxApi(
      appId: Env.wechatAppId,
      universalLink: 'https://mirauni.com/app/',
    );
  }
  
  /// 微信登录
  Future<User> loginWithWechat() async {
    // 1. 拉起微信授权
    final result = await sendWeChatAuth(
      scope: 'snsapi_userinfo',
      state: 'mirauni_login',
    );
    
    if (!result) {
      throw Exception('微信授权失败');
    }
    
    // 2. 监听回调获取 code
    final code = await _waitForWechatCode();
    
    // 3. 调用 Edge Function 换取用户信息（与 Web 共用逻辑）
    final response = await supabase.functions.invoke(
      'wechat-app-login',
      body: {'code': code},
    );
    
    if (response.status != 200) {
      throw Exception(response.data['error'] ?? '登录失败');
    }
    
    // 4. 设置 session
    final session = response.data['session'];
    await supabase.auth.setSession(session);
    
    // 5. 检查是否需要绑定手机号
    final user = User.fromJson(response.data['user']);
    if (user.phone == null) {
      // 跳转到绑定手机号页面
      throw NeedBindPhoneException(user);
    }
    
    return user;
  }
  
  Future<String> _waitForWechatCode() async {
    final completer = Completer<String>();
    
    weChatResponseEventHandler.distinct((a, b) => a == b).listen((resp) {
      if (resp is WeChatAuthResponse) {
        if (resp.errCode == 0) {
          completer.complete(resp.code);
        } else {
          completer.completeError(Exception('授权失败: ${resp.errStr}'));
        }
      }
    });
    
    return completer.future.timeout(Duration(seconds: 30));
  }
}

class NeedBindPhoneException implements Exception {
  final User user;
  NeedBindPhoneException(this.user);
}
```

#### 绑定手机号

```dart
// 微信登录后绑定手机号
Future<void> bindPhone(String phone, String code) async {
  final response = await supabase.functions.invoke(
    'bind-phone',
    body: {'phone': phone, 'code': code},
  );
  
  if (response.status != 200) {
    throw Exception(response.data['error'] ?? '绑定失败');
  }
  
  // 刷新用户信息
  await ref.read(currentUserProvider.notifier).fetchUser();
}
```

### 12.7 微信 App 支付

```dart
// lib/services/payment_service.dart
class PaymentService {
  final supabase = Supabase.instance.client;
  
  /// 创建订单并发起支付
  Future<bool> createOrderAndPay(String packageId) async {
    // 1. 调用 Edge Function 创建订单（与 Web 共用）
    final response = await supabase.functions.invoke(
      'create-order',
      body: {
        'packageId': packageId,
        'payType': 'app',  // 标识为 App 支付
      },
    );
    
    if (response.status != 200) {
      throw Exception(response.data['error'] ?? '创建订单失败');
    }
    
    final payParams = response.data['payParams'];
    
    // 2. 调用微信 App 支付
    final result = await payWithWeChat(
      appId: payParams['appid'],
      partnerId: payParams['partnerid'],
      prepayId: payParams['prepayid'],
      packageValue: payParams['package'],
      nonceStr: payParams['noncestr'],
      timeStamp: int.parse(payParams['timestamp']),
      sign: payParams['sign'],
    );
    
    if (!result) {
      throw Exception('拉起支付失败');
    }
    
    // 3. 监听支付结果
    return await _waitForPayResult();
  }
  
  Future<bool> _waitForPayResult() async {
    final completer = Completer<bool>();
    
    weChatResponseEventHandler.listen((resp) {
      if (resp is WeChatPaymentResponse) {
        if (resp.errCode == 0) {
          completer.complete(true);
        } else if (resp.errCode == -2) {
          completer.complete(false); // 用户取消
        } else {
          completer.completeError(Exception('支付失败: ${resp.errStr}'));
        }
      }
    });
    
    return completer.future.timeout(Duration(minutes: 5));
  }
  
  /// 解锁用户
  Future<void> unlockUser(String targetUserId) async {
    final response = await supabase.functions.invoke(
      'unlock-user',
      body: {'targetUserId': targetUserId},
    );
    
    if (response.status != 200) {
      throw Exception(response.data['error'] ?? '解锁失败');
    }
  }
}
```

### 12.8 数据互通说明

| 功能 | Web | Flutter App | 互通方式 |
|------|-----|-------------|----------|
| 手机号登录 | Nuxt API | Edge Function | ✅ 同一接口 |
| 微信登录 | Nuxt API (扫码) | Edge Function (App) | ✅ 同一用户表 |
| 用户数据 | Supabase | Supabase | ✅ 同一数据库 |
| 项目数据 | Supabase | Supabase | ✅ 同一数据库 |
| 订单/解锁 | Supabase | Supabase | ✅ 同一数据库 |
| 站内信 | Supabase Realtime | Supabase Realtime | ✅ 实时同步 |

**用户可以**：
- 在 Web 注册，App 登录
- 在 App 充值，Web 使用
- 在 Web 发消息，App 实时收到

---

## 13. 管理后台设计

### 12.1 功能模块

| 模块 | 功能 | 优先级 |
|------|------|--------|
| **登录** | 管理员账号密码登录 | P0 |
| **仪表盘** | 核心数据统计、快捷操作 | P0 |
| **用户管理** | 用户列表、详情、封禁 | P0 |
| **项目审核** | 待审核列表、通过/拒绝 | P0 |
| **项目管理** | 项目列表、编辑、下架 | P0 |
| **文章管理** | 学院文章发布、编辑 | P1 |
| **订单管理** | 支付订单查询 | P1 |
| **数据分析** | 埋点数据可视化、转化漏斗 | P1 |
| **系统设置** | 基础配置 | P2 |

### 12.2 数据分析页面设计

#### 页面结构

```
/admin/analytics
├── /overview          # 数据概览
├── /funnel            # 转化漏斗
├── /events            # 事件明细
└── /retention         # 留存分析
```

#### 数据概览页 (/admin/analytics/overview)

**实时数据卡片**

| 指标 | 说明 | 数据来源 |
|------|------|----------|
| 今日 UV | 独立访客 | 百度统计 API / 自建 |
| 今日 PV | 页面浏览量 | 百度统计 API / 自建 |
| 今日注册 | 新注册用户 | 自建 events 表 |
| 今日付费 | 付费用户数 | 自建 events 表 |
| 今日收入 | 总收入金额 | orders 表 |

**趋势图表（7日/30日）**

```typescript
// 后台 API: /api/admin/analytics/trend
export default defineEventHandler(async (event) => {
  const { range = 7 } = getQuery(event)
  
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - range)
  
  // 按日期分组统计
  const { data } = await supabase
    .from('events')
    .select('event_name, created_at')
    .gte('created_at', startDate.toISOString())
    .in('event_name', ['register', 'recharge_success', 'unlock_success'])
  
  // 按日期聚合
  const grouped = data.reduce((acc, item) => {
    const date = item.created_at.split('T')[0]
    if (!acc[date]) acc[date] = { register: 0, recharge: 0, unlock: 0 }
    if (item.event_name === 'register') acc[date].register++
    if (item.event_name === 'recharge_success') acc[date].recharge++
    if (item.event_name === 'unlock_success') acc[date].unlock++
    return acc
  }, {})
  
  return Object.entries(grouped).map(([date, counts]) => ({ date, ...counts }))
})
```

#### 转化漏斗页 (/admin/analytics/funnel)

**漏斗定义**

```
访问 → 注册 → 查看项目 → 点击解锁 → 付费 → 解锁成功
```

**可视化组件**

```vue
<!-- views/analytics/Funnel.vue -->
<template>
  <div class="funnel-chart">
    <div v-for="(step, index) in funnelData" :key="step.name" class="funnel-step">
      <div class="bar" :style="{ width: step.percentage + '%' }">
        <span>{{ step.name }}</span>
        <span>{{ step.count }} ({{ step.percentage }}%)</span>
      </div>
      <div v-if="index < funnelData.length - 1" class="conversion-rate">
        转化率: {{ step.conversionToNext }}%
      </div>
    </div>
  </div>
</template>

<script setup>
const funnelData = ref([
  { name: '访问', count: 10000, percentage: 100, conversionToNext: 5 },
  { name: '注册', count: 500, percentage: 5, conversionToNext: 60 },
  { name: '查看项目', count: 300, percentage: 3, conversionToNext: 20 },
  { name: '点击解锁', count: 60, percentage: 0.6, conversionToNext: 50 },
  { name: '付费', count: 30, percentage: 0.3, conversionToNext: 100 },
  { name: '解锁成功', count: 30, percentage: 0.3 }
])
</script>
```

**漏斗数据 API**

```typescript
// /api/admin/analytics/funnel
export default defineEventHandler(async (event) => {
  const { days = 7 } = getQuery(event)
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  const { data } = await supabase
    .from('events')
    .select('event_name, user_id')
    .gte('created_at', startDate.toISOString())
  
  const steps = ['page_view', 'register', 'project_view', 'unlock_click', 'recharge_success', 'unlock_success']
  
  const funnel = steps.map(eventName => ({
    event: eventName,
    count: new Set(data.filter(e => e.event_name === eventName).map(e => e.user_id || 'anonymous')).size
  }))
  
  return funnel.map((step, i) => ({
    ...step,
    percentage: funnel[0].count > 0 ? (step.count / funnel[0].count * 100).toFixed(2) : 0,
    conversionToNext: i < funnel.length - 1 && step.count > 0 
      ? (funnel[i + 1].count / step.count * 100).toFixed(2) 
      : null
  }))
})
```

#### 事件明细页 (/admin/analytics/events)

**筛选条件**

| 筛选项 | 类型 |
|--------|------|
| 事件类型 | 下拉多选 |
| 时间范围 | 日期选择器 |
| 用户ID | 文本输入 |

**数据表格**

| 列 | 说明 |
|----|------|
| 时间 | created_at |
| 事件 | event_name |
| 用户 | user_id (可点击查看) |
| 参数 | event_params (JSON展开) |
| 来源页面 | page_url |

### 12.3 百度统计与自建埋点共存方案

#### 分工说明

| 指标 | 百度统计 | 自建埋点 |
|------|----------|----------|
| UV/PV | ✅ 主要 | ✅ 备份 |
| 来源分析 | ✅ | ❌ |
| 停留时间 | ✅ | ❌ |
| 跳出率 | ✅ | ❌ |
| 注册转化 | ❌ | ✅ 主要 |
| 付费转化 | ❌ | ✅ 主要 |
| 功能使用 | ❌ | ✅ 主要 |
| 用户行为 | ❌ | ✅ 主要 |

#### 数据同步（可选）

```typescript
// 定时任务：同步百度统计数据到本地
// 使用百度统计 API 获取数据
async function syncBaiduAnalytics() {
  const data = await fetchBaiduAPI('/getData/overview/getTimeTrendRpt', {
    start_date: yesterday,
    end_date: yesterday,
    metrics: 'pv_count,visitor_count'
  })
  
  // 存入本地表，方便后台统一展示
  await supabase.from('analytics_daily').upsert({
    date: yesterday,
    source: 'baidu',
    pv: data.pv_count,
    uv: data.visitor_count
  })
}
```

#### 后台展示整合

```vue
<!-- 后台仪表盘：整合两个数据源 -->
<template>
  <div class="dashboard">
    <!-- 流量数据（百度统计） -->
    <section class="traffic">
      <h3>流量概览 <span class="source">百度统计</span></h3>
      <StatCard title="今日UV" :value="baiduData.uv" />
      <StatCard title="今日PV" :value="baiduData.pv" />
    </section>
    
    <!-- 业务数据（自建埋点） -->
    <section class="business">
      <h3>业务转化 <span class="source">自建统计</span></h3>
      <StatCard title="今日注册" :value="eventData.register" />
      <StatCard title="今日付费" :value="eventData.paid" />
      <StatCard title="今日解锁" :value="eventData.unlock" />
    </section>
  </div>
</template>
```

### 6.2 权限设计

#### 管理员角色

| 角色 | 权限 | 说明 |
|------|------|------|
| `super_admin` | 全部权限 | 超级管理员 |
| `admin` | 除系统设置外 | 普通管理员 |
| `reviewer` | 仅项目审核 | 审核员 |

#### 权限存储

```sql
-- 在 users 表中添加
ALTER TABLE users ADD COLUMN admin_role VARCHAR(20);
-- 值: super_admin / admin / reviewer / null
```

### 6.3 后台认证方案

#### 方案：独立管理员账号 + JWT

```typescript
// 管理员登录 API (前台 Nuxt 提供)
// server/api/admin/login.post.ts

export default defineEventHandler(async (event) => {
  const { username, password } = await readBody(event)
  
  // 1. 查询管理员账号
  const { data: admin } = await supabase
    .from('users')
    .select('id, username, admin_role')
    .eq('username', username)
    .not('admin_role', 'is', null)
    .single()
  
  if (!admin) throw createError({ statusCode: 401, message: '账号不存在' })
  
  // 2. 验证密码 (使用单独的 admin_password 字段或环境变量)
  const validPassword = await verifyPassword(password, admin.password_hash)
  if (!validPassword) throw createError({ statusCode: 401, message: '密码错误' })
  
  // 3. 生成 JWT
  const token = signJwt({ 
    userId: admin.id, 
    role: admin.admin_role,
    isAdmin: true 
  })
  
  return { token, admin }
})
```

#### 后台请求鉴权

```typescript
// 后台每个 API 请求添加 Authorization Header
// mirauni-admin/src/utils/api.js

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

### 6.4 后台 API 接口

#### 管理员接口列表

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/admin/login` | POST | 管理员登录 |
| `/api/admin/dashboard` | GET | 仪表盘统计数据 |
| `/api/admin/users` | GET | 用户列表 |
| `/api/admin/users/:id/ban` | POST | 封禁用户 |
| `/api/admin/projects` | GET | 项目列表 |
| `/api/admin/projects/:id` | GET | 项目详情 |
| `/api/admin/projects/:id/approve` | POST | 通过审核 |
| `/api/admin/projects/:id/reject` | POST | 拒绝审核 |
| `/api/admin/articles` | GET/POST | 文章列表/创建 |
| `/api/admin/articles/:id` | PUT/DELETE | 编辑/删除文章 |
| `/api/admin/orders` | GET | 订单列表 |

### 6.5 数据统计逻辑

#### 仪表盘数据

```typescript
// server/api/admin/dashboard.get.ts
export default defineEventHandler(async (event) => {
  // 验证管理员权限
  await requireAdmin(event)
  
  const today = new Date().toISOString().split('T')[0]
  
  // 并行查询所有统计数据
  const [
    { count: totalUsers },
    { count: todayNewUsers },
    { count: totalProjects },
    { count: pendingProjects },
    { count: totalOrders },
    { data: recentOrders }
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true })
      .gte('created_at', today),
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase.from('orders').select('*', { count: 'exact', head: true })
      .eq('status', 'paid'),
    supabase.from('orders').select('amount')
      .eq('status', 'paid')
      .gte('created_at', today)
  ])
  
  return {
    stats: {
      totalUsers,
      todayNewUsers,
      totalProjects,
      pendingProjects,
      totalOrders,
      todayRevenue: recentOrders?.reduce((sum, o) => sum + o.amount, 0) || 0
    }
  }
})
```

### 6.6 后台与 Supabase 对接

#### 方案：后台直接调用 Supabase

```javascript
// mirauni-admin/src/utils/supabase.js
import { createClient } from '@supabase/supabase-js'

// 使用 service_role key（绕过 RLS）
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_KEY
)
```

> [!WARNING]
> **安全提醒**  
> `service_role` key 具有完全权限，仅在后台使用！  
> 后台部署时需做 IP 白名单或内网访问限制。

### 6.7 后台部署配置

```json
// mirauni-admin/vercel.json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

#### 环境变量

| 变量 | 说明 |
|------|------|
| `VITE_API_URL` | Nuxt API 地址 (https://mirauni.com/api) |
| `VITE_SUPABASE_URL` | Supabase URL |
| `VITE_SUPABASE_SERVICE_KEY` | Supabase service key (仅后台用) |

## 文档进度

- [x] Part 1: 技术架构概述
- [x] Part 2: 数据库设计  
- [x] Part 3: 核心功能实现（含完整 SEO 策略）
- [x] Part 4: 部署与运维
- [x] Part 5: 管理后台设计
