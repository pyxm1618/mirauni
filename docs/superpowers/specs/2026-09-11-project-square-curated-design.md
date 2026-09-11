# 项目广场精选内容专项设计

## 目标
把项目广场从“纯创业招募列表”升级为同时承载“项目方发布”和“小概率平台精选”的真实项目目录。首批正式数据为 20 条：Quick I Ching 作为自有项目，另外 19 条来自真实公开 GitHub 项目。

## 核心原则
- `mirauni_projects` 仍是唯一正式项目表，不做前端假数据或第二套项目表。
- `listing_type = owner | curated` 明确区分项目方发布和平台精选。
- `is_recruiting` 决定是否存在真实合作需求；只有项目方真实招募时才要求角色、工作方式和合作方式。
- curated 项目不得冒充项目作者、不得出现联系方式解锁、不得生成 JobPosting JSON-LD。
- curated 详情页固定标注“由小概率根据公开资料整理，非项目方发布”。
- 项目卡片不展示 UUID。
- 不为外部项目生成或伪造 Logo。V1 使用统一的 CSS 字母标识；官方图片本轮不作为必需字段。
- 项目广场整体使用既有 brutalist editorial 视觉，不再按 UUID 随机切换三种详情主题。
- curated 详情页首版 `noindex, follow`；项目广场索引页正常 index。
- 继续保留开发环境 sample-project fallback，但生产正式 20 条来自数据库。
- 不修改项目广场以外的产品功能，不合并学院 PR #25。

## 数据模型
`mirauni_projects` 增加：
- `listing_type text not null default 'owner' check (listing_type in ('owner','curated'))`
- `is_recruiting boolean not null default true`
- `industry text`
- `source_repo text`
- `source_url text`
- `curated_meta jsonb not null default '{}'::jsonb`
- `curation_rank integer`

`roles_needed`、`work_mode`、`cooperation_type` 对 curated/non-recruiting 允许为空。应用层校验：`listing_type=owner && is_recruiting=true` 时三者必须完整。

## 行业
首版行业枚举：culture_education, finance, productivity, entertainment, health_fitness, events, food_lifestyle, business_services, sustainability, real_estate, logistics, travel, agriculture, gaming。

## 首批 20 项目
Quick I Ching；Hisabi；Table Habit；Tempus；openScale；Hi.Events；Tamari；URY；NMF.earth；Horilla HRMS；Claroline Connect；SurveyKing；Condo；Fleetbase；Notifuse；Relaticle；AdventureLog；Dreeve；Ekylibre；OpenFront。

## 页面
### /projects
- Hero 改为“看看别人正在做什么，也找到值得一起做的项目。”
- 筛选：全部/项目方发布/平台精选、行业领域、产品形态、招募角色、关键词。
- 招募角色筛选自动限制 `is_recruiting=true`。
- 卡片显示项目字母标、来源类型、标题、摘要、行业、产品形态、开源/招募状态。

### /projects/[id]
- `curated` 使用 `CuratedProjectDetail.vue`；无解锁弹窗。
- `owner` 使用统一 Brutalist 详情组件；只有真实招募项目提供联系/解锁。
- curated SEO 不输出 JobPosting，设置 noindex。

## API
- GET /api/projects 支持 `listing_type`、`industry`、`category`、`role`、`keyword`。
- GET /api/projects/[id] 对 curated 不读取/返回作者联系方式逻辑，不做 unlock 查询。
- POST/PUT 只允许普通用户创建/修改 `listing_type=owner`；客户端不能伪造 curated。

## 内容
每条 curated 必须包含中文 summary、description、3–5 个真实能力点、编辑推荐理由、source_url/source_repo、tech/license 等公开事实。不得把 GitHub stars 当作前台卖点；筛选依据可保留在 `curated_meta` 内部。

## 验收
- 生产数据库恰有首批 20 条正式 active 项目。
- 19 条外部项目均为 curated 且 source_url 可访问。
- curated 无虚假招聘、无联系方式、无积分解锁、无 JobPosting。
- 卡片无 UUID。
- 行业筛选、类型筛选、关键词、招募角色正常。
- 375px 和桌面实际页面可用。
- content validation、Nuxt typecheck、frontend build、admin build 均通过。
- PR base 为 `feat/academy-editorial-v1`，保持 stacked；学院 PR #25 不合并。