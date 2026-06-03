# SEO 优化路线图 (P2)

为了提升「小概率匹配平台 (主线)」在各大搜索引擎中的自然排名和曝光度，本路线图规划了 P2 阶段的 SEO 落地细节。每一项优化均包含明确的实施路径与验收标准。

---

## 🎯 P2.1 NuxtLink 真实内链

### 1. 目标
将前端卡片组件及列表项的编程式路由跳转（使用 `@click="navigateTo(...)"` 或 `router.push(...)`）重构为 HTML 原生的 `<a>` 标签包裹（Nuxt 中使用 `<NuxtLink>`）。这使得搜索引擎爬虫在抓取页面时能够发现超链接，并将 PageRank 权重平滑传递到详情页。

### 2. 涉及文件
*   `mirauni-frontend/components/ProjectCard.vue`
*   `mirauni-frontend/components/DeveloperCard.vue`
*   `mirauni-frontend/pages/projects/index.vue`
*   `mirauni-frontend/pages/developers/index.vue`

### 3. 风险
*   **UI 布局破坏**：默认的 `<NuxtLink>` 会被渲染为 `<a>` 标签，可能自带浏览器的默认蓝色下划线样式或破坏 flex/grid 容器样式。
*   **事件冲突**：卡片上可能存在其他交互按钮（如“收藏”、“分享”），重构为嵌套超链接后可能引起冒泡冲突（例如点击“收藏”时误触发页面跳转）。
*   **缓解措施**：
    *   在 `<NuxtLink>` 上使用 `custom` 属性，或者确保加上 `class="no-underline text-inherit block"` 清理默认样式。
    *   对卡片内按钮的点击事件添加 `.stop` 修饰符防止事件冒泡。

### 4. 验收标准
*   使用浏览器右键“检查元素”，确保卡片对应的 HTML 节点是具有真实 `href` 属性的 `<a>` 标签（例如 `<a href="/projects/123">...</a>`）。
*   本地执行 `npm run build` 和 `npm run typecheck` 无报错。
*   测试卡片内部子操作（如收藏、展开）能够正常响应且不触发父级 `href` 跳转。

### 5. 是否需要 database migration
**否**。

---

## 🎯 P2.2 项目 Slug 支持

### 1. 目标
用包含语义化关键词的英文/拼音 Slug 代替数值 ID 或 UUID 路径（例如使用 `/projects/python-fastapi-remote-developer` 代替 `/projects/8d9f1234`），大幅度提升 URL 的搜索引擎友好度与用户点击信赖感。

### 2. 涉及文件
*   **数据库修改**：`mirauni-frontend/supabase/migrations/` 下新建迁移脚本（为 `projects` 和 `public_profiles`/`users` 增加 `slug` 字段）。
*   **后端 API**：
    *   `mirauni-frontend/server/api/projects/[id].ts`（兼容 id 和 slug 查询）
    *   `mirauni-frontend/server/api/developers/[id]/public.get.ts`
*   **前端页面**：
    *   `mirauni-frontend/pages/projects/[slug].vue`（重命名旧的 `[id].vue`）
    *   `mirauni-frontend/pages/developers/[username].vue` 或 `[slug].vue`

### 3. 风险
*   **404 割裂风险**：存量被搜索引擎已收录的 `/projects/[id]` 链接在重构后直接失效返回 404。
*   **Slug 冲突**：项目标题相同导致生成的 slug 冲突。
*   **缓解措施**：
    *   引入 301 重定向中间件：如果请求匹配为纯数字/UUID 的旧格式，后端自动检索其对应的最新 slug 并 301 重定向至新 URL。
    *   Slug 生成算法：在数据库中为 `slug` 设定唯一性约束（`UNIQUE`），生成时检测冲突并在末尾自动附加随机字符或时间戳（如 `python-developer-1`）。

### 4. 验收标准
*   在浏览器输入旧的 `/projects/12` 能够自动 301 跳转到 `/projects/python-remote-developer`。
*   在后台或前台创建项目时，能自动在数据库中生成不含空格、特殊字符且唯一的 `slug` 值。
*   SSR 模式渲染出的页面无报错，返回 `200` 状态码。

### 5. 是否需要 database migration
**是**。需要为 `projects`（以及对应的 `public_profiles` / `users`）添加 `slug VARCHAR(255) UNIQUE` 字段，并在迁移脚本中为现有存量数据刷写一份默认的 slug（可基于 id 生成）。

---

## 🎯 P2.3 Sitemap / Canonical 链接规范化

### 1. 目标
*   自动向搜索引擎提供整站地图，确保新增的项目、开发者及学院文章能够被爬虫以最快速度检索。
*   在所有 SSR 页面头部动态输出 `<link rel="canonical" href="...">` 指向规范的绝对 URL，消除因动态带参、二级域名或者多路径访问引发的重复内容判定，汇聚页面权重。

### 2. 涉及文件
*   `mirauni-frontend/server/routes/sitemap.xml.get.ts`
*   `mirauni-frontend/layouts/default.vue` 或各 SSR 页面组件（`pages/projects/[slug].vue`, `pages/developers/[username].vue` 等）
*   `mirauni-frontend/nuxt.config.ts`

### 3. 风险
*   **Sitemap 性能瓶颈**：随着平台项目和用户体量增大，如果每次请求 `sitemap.xml` 都实时查询数据库，会导致严重的响应延迟甚至数据库 CPU 飙升。
*   **Canonical 配置错误**：拼接 canonical 的 host 错误，比如在开发环境把 canonical 写死为 `localhost:3000` 并同步到了生产。
*   **缓解措施**：
    *   对 `sitemap.xml` 采用 Nitro 的缓存策略（如缓存 1 小时：`routeRules: { '/sitemap.xml': { isr: 3600 } }`）。
    *   根据环境变量 `NUXT_PUBLIC_SITE_URL` 动态拼接 canonical 域名，切忌写死域名。

### 4. 验收标准
*   直接访问 `/sitemap.xml`，返回合法的 XML 文件，包含 `<urlset>`、`<url>`、`<loc>` 等标准标签，且动态包含了数据库中的公开项目与开发者。
*   查看详情页源码，在 `<head>` 中必须能找到唯一一个 `<link rel="canonical" href="https://mirauni.com/projects/[slug]">`。
*   没有开发环境（localhost）的脏 URL 混入生产 sitemap。

### 5. 是否需要 database migration
**否**。

---

## 🎯 P2.4 Schema.org 结构化数据接入

### 1. 目标
在 SSR 页面渲染时动态注入 JSON-LD 格式的 Schema.org 结构化数据。这可以显式地向搜索引擎描述网页实体，从而使网站在搜索结果中获得富媒体展现（Rich Snippets），显著提升点击率。

### 2. 涉及文件
*   `mirauni-frontend/pages/projects/[slug].vue`（配置 `JobPosting` 或 `SoftwareSourceCode`）
*   `mirauni-frontend/pages/developers/[username].vue`（配置 `ProfilePage` 或 `Person`）
*   `mirauni-frontend/pages/academy/[slug].vue`（配置 `TechArticle` 或 `Article`）

### 3. 风险
*   **数据缺失报错**：如果对象中某些必要字段（如 JobPosting 的 `hiringOrganization` 或 `jobLocation`）在数据库中是选填的，可能导致输出的 JSON-LD 数据缺失，搜索引擎会发出警告或判定为无效。
*   **注入报错**：未转义的字符直接拼入 JSON 字符串导致解析崩溃。
*   **缓解措施**：
    *   在生成 JSON-LD 前做好严格的空值兜底防护（提供默认值，如“独立开发者项目”）。
    *   使用 Nuxt 3 内置的安全结构化数据助手（如 `useSchemaOrg`）或在 `useHead` 中利用 `script` 数组安全载入 JSON 对象。

### 4. 验收标准
*   打开 Google 富媒体搜索结果测试工具（Rich Results Test）或百度结构化数据校验工具，输入对应的生产页面 URL，验证无 Syntax Error 或 Critical Warning。
*   审查页面源码，包含 `<script type="application/ld+json">` 且包含正确的业务数据。

### 5. 是否需要 database migration
**否**。

---

## 🎯 P2.5 百度收录与内容策略部署

### 1. 目标
*   针对国内主要的流量入口，实现项目/文章发布后百度实时的 API 主动推送，加速收录。
*   在 Nuxt 单页应用中完美集成百度统计，保障多页面跳转时数据准确上报。
*   妥善处理防爬屏蔽与对百度爬虫（Baiduspider）、Google 爬虫（Googlebot）的友好抓取，在数据防窃取与 SEO 曝光之间取得平衡。

### 2. 涉及文件
*   `mirauni-frontend/server/api/seo/push-baidu.post.ts`
*   `mirauni-frontend/plugins/baidu-analytics.client.ts`
*   `mirauni-frontend/server/middleware/seo-crawler.ts`（用于判断爬虫并绕过部分遮罩逻辑）
*   `mirauni-frontend/server/api/projects/index.post.ts`（发布成功后触发推送）

### 3. 风险
*   **百度统计单页应用数据失真**：Nuxt 在客户端跳转（CSR）时不会重新加载页面，导致默认的百度统计异步脚本无法记录到后续页面的访问轨迹（PV/UV 偏低）。
*   **障眼法（Cloaking）判定惩罚**：如果普通用户需要付费解锁才能看到内容，而为了收录我们让搜索引擎爬虫直接看完整内容，如果规则编写不慎被识别为欺诈（Cloaking），会导致整站被百度降权甚至 K 站。
*   **缓解措施**：
    *   在 Nuxt 客户端插件中，利用 `useRouter().afterEach` 手动调用 `_hmt.push(['_trackPageview', to.fullPath])`。
    *   内容策略上：对于敏感的联系方式（微信号、电话），普通用户与爬虫均不予展示（均显示为“解锁后可见”）。只将允许公开的“项目详细描述、技术栈要求、愿景”在服务端对所有人（包括爬虫）输出，保持一致性，彻底规避 Cloaking 风险。

### 4. 验收标准
*   在百度站长平台后台能够查看到 API 推送的历史记录和报错状态码（应为成功推送）。
*   在浏览器控制台切换页面路由，检查 Network 的 `hm.gif` 请求，确认 PV 统计随路由跳转实时发送。
*   使用 User-Agent 模拟工具切换为 `Baiduspider` 或 `Googlebot` 访问平台，网页内容结构和字段与普通匿名用户访问完全相同，无任何针对爬虫的特异性输出，但能正确被解析出 Meta 信息。

### 5. 是否需要 database migration
**否**。
