# Web 项目缺失内容与优化需求

> **文档状态**: 待开发  
> **创建日期**: 2025-12-28  
> **优先级**: 高

---

## 一、问题总览

通过产品经理视角对 mirauni.com Web 项目进行全面审核，发现以下问题：

| 类别 | 问题数量 | 严重度 |
|------|----------|--------|
| 缺失页面 | 4 个 | 🔴 高 |
| 国际化缺失 | 1 项 | 🔴 高 |
| 中英混用 | 5+ 处 | 🟡 中 |
| 内容空白 | 2 页 | 🟡 中 |
| 链接失效 | 4 处 | 🔴 高 |

---

## 二、缺失页面清单

### 2.1 关于我们 `/about`

**当前状态**: 底部链接 `href="#"` 无效

**页面规划**:
| 板块 | 中文内容 | English Content |
|------|---------|-----------------|
| 标题 | 关于小概率 | About Mirauni |
| Slogan | 独立开发者找合伙人的第一站 | The First Stop for Indie Devs to Find Co-founders |
| 使命 | 帮助独立开发者找到志同道合的合伙人，一起把想法变成产品 | Helping indie developers find like-minded partners to turn ideas into products |
| 愿景 | 成为全球独立开发者的首选合作平台 | Becoming the go-to collaboration platform for indie developers worldwide |
| 联系方式 | 邮箱: contact@mirauni.com | Email: contact@mirauni.com |

**设计要求**:
- 沿用 Neubrutalism 风格
- 添加团队介绍区（可选）
- 添加平台数据统计（项目数、开发者数）

---

### 2.2 用户协议 `/terms`

**当前状态**: 底部链接 `href="#"` 无效

**内容大纲**:
1. 服务条款
2. 用户注册与账户安全
3. 用户行为规范
4. 内容发布规则
5. 付费服务说明
6. 知识产权声明
7. 免责声明
8. 服务变更与终止
9. 争议解决
10. 法律适用

**文案要求**:
- 中英双语版本
- 符合法律合规要求
- 清晰标注生效日期

---

### 2.3 隐私政策 `/privacy`

**当前状态**: 底部链接 `href="#"` 无效

**内容大纲**:
1. 信息收集范围
2. 信息使用方式
3. 信息存储与保护
4. 信息共享与披露
5. Cookie 使用说明
6. 用户权利（查询、更正、删除）
7. 未成年人保护
8. 政策更新说明
9. 联系方式

**文案要求**:
- 中英双语版本
- 符合 GDPR / 个人信息保护法
- 明确数据处理方

---

### 2.4 联系我们 `/contact`

**当前状态**: 底部链接 `href="#"` 无效

**页面规划**:
| 联系方式 | 内容 |
|---------|------|
| 商务合作 | business@mirauni.com |
| 用户反馈 | feedback@mirauni.com |
| 媒体咨询 | media@mirauni.com |
| 微信公众号 | 小概率（二维码） |
| 社交媒体 | Twitter / X, 即刻 |

**设计要求**:
- 添加联系表单（可选）
- 显示办公地址（可选）

---

## 三、国际化（i18n）需求

### 3.1 技术方案

使用 `@nuxtjs/i18n` 模块实现中英双语切换。

**配置结构**:
```
locales/
├── zh-CN.json  # 中文
└── en.json     # English
```

**切换方式**:
- 导航栏右上角添加语言切换按钮（🌐 / CN/EN）
- 记住用户语言偏好（localStorage）
- URL 前缀模式：`/zh/projects`, `/en/projects`

---

### 3.2 需要翻译的内容

#### 导航栏
| 当前文案 | 中文 | English |
|---------|------|---------|
| PROJECTS | 项目广场 | Projects |
| TALENT | 人才广场 | Talent |
| ACADEMY | 开发者学院 | Academy |
| LOG IN | 登录 | Log In |
| JOIN NOW | 立即加入 | Join Now |

#### 首页
| 当前文案 | 中文 | English |
|---------|------|---------|
| SHIP FASTER | 更快交付 | Ship Faster |
| START PROJECT | 发布项目 | Start Project |
| BROWSE TALENT | 浏览人才 | Browse Talent |
| "找合伙人，从0到1一起创业" | 找合伙人，从0到1一起创业 | Find co-founders, build from 0 to 1 together |

#### 项目广场
| 当前文案 | 中文 | English |
|---------|------|---------|
| PROJECT SQUARE | 项目广场 | Project Square |
| CATEGORY / 全部分类 | 全部分类 | All Categories |
| 暂无符合条件的项目 | 暂无符合条件的项目 | No projects found |

#### 学院页
| 当前文案 | 中文 | English |
|---------|------|---------|
| INDIE ACADEMY | 独立开发者学院 | Indie Academy |
| Resources, guides... | 从0到1的资源、指南与智慧分享 | Resources, guides, and wisdom for indie devs |
| NO ARTICLES FOUND | 暂无文章 | No Articles Found |
| READ MORE -> | 阅读更多 → | Read More → |

#### 通用
| 场景 | 中文 | English |
|------|------|---------|
| 加载中 | 加载中... | Loading... |
| 错误提示 | 加载失败，请重试 | Failed to load, please retry |
| 空状态 | 暂无数据 | No data |
| 按钮-确认 | 确定 | Confirm |
| 按钮-取消 | 取消 | Cancel |

---

## 四、内容规划

### 4.1 学院页内容规划

**当前问题**: 仅有测试文章 "Hello World"

**内容规划**:

| 分类 | 文章标题（中文） | 文章标题（English） |
|------|-----------------|-------------------|
| SaaS | 独立开发者如何从0到1打造SaaS产品 | How to Build a SaaS Product from Scratch |
| SaaS | SaaS定价策略：从免费到付费的转化秘诀 | SaaS Pricing: From Free to Paid |
| App开发 | Flutter vs React Native：2025年该选谁？ | Flutter vs React Native in 2025 |
| App开发 | App Store 上架全流程指南 | Complete Guide to App Store Submission |
| AI应用 | 用 AI 提升独立开发效率的10个工具 | 10 AI Tools to Boost Indie Dev Productivity |
| 增长黑客 | 零预算推广：独立开发者的冷启动策略 | Zero-Budget Marketing for Indie Devs |
| 合伙人 | 如何找到靠谱的技术合伙人 | How to Find a Reliable Tech Co-founder |

**内容来源**:
1. 原创撰写
2. 邀请独立开发者投稿
3. 整理公开经验分享

---

### 4.2 项目广场填充

**当前问题**: 列表为空白

**解决方案**:
1. 添加 3-5 个示例项目（可标记为"示例"）
2. 引导用户发布第一个项目
3. 添加"发布项目"悬浮按钮

---

## 五、设计规范

### 5.1 中英文排版

| 规范 | 说明 |
|------|------|
| 中文字体 | 思源黑体 / PingFang SC |
| 英文字体 | Space Grotesk / Inter |
| 中文行高 | 1.8 |
| 英文行高 | 1.5 |
| 中英混排 | 中英文之间加空格 |

### 5.2 语言切换按钮

**位置**: 导航栏右上角，用户头像/登录按钮左侧

**样式**: 
```
┌──────────┐
│ 🌐 CN/EN │
└──────────┘
```

---

## 六、开发优先级

| 优先级 | 任务 | 预估工时 |
|-------|------|---------|
| P0 | 用户协议页面 | 2h |
| P0 | 隐私政策页面 | 2h |
| P0 | 关于我们页面 | 2h |
| P0 | 联系我们页面 | 1h |
| P1 | i18n 架构搭建 | 4h |
| P1 | 导航栏/首页翻译 | 2h |
| P1 | 其他页面翻译 | 4h |
| P2 | 学院内容创作 | 8h+ |
| P2 | 示例项目添加 | 2h |

**总预估**: 约 27 小时

---

## 七、验收标准

- [ ] 所有底部链接可正常跳转
- [ ] 语言切换按钮功能正常
- [ ] 中文版本文案地道、无英文残留
- [ ] 英文版本文案专业、语法正确
- [ ] 用户协议/隐私政策符合法律要求
- [ ] 学院页有至少 3 篇正式文章
- [ ] 移动端适配正常
