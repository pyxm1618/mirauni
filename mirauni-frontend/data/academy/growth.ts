import type { AcademyArticle } from './types'

const publishedAt = '2026-09-10T00:00:00.000Z'

export const academyGrowthArticles: AcademyArticle[] = [
  {
    id: 'academy-growth-seo',
    slug: 'what-seo-is-actually-doing',
    title: 'SEO 到底在做什么：不是“骗排名”，是让一个真实需求有一个最合适的页面',
    summary: 'SEO 最容易被做成关键词密度和批量发文。更稳定的起点是把搜索词还原成用户任务，再让站点结构、页面内容和技术信号共同说明“这个页面解决什么”。',
    category: 'growth',
    series: '增长实验室',
    featured: true,
    created_at: publishedAt,
    updated_at: publishedAt,
    view_count: 0,
    author: { username: '小概率编辑部' },
    sources: [
      { label: 'Google Search Central：SEO Starter Guide', url: 'https://developers.google.com/search/docs/fundamentals/seo-starter-guide' },
      { label: 'Google Search Central：Spam policies', url: 'https://developers.google.com/search/docs/essentials/spam-policies' },
    ],
    content: `SEO 很容易被做成一套动作：找词、把词塞进标题、写几千字、买几条外链、等排名。

问题是，搜索引擎真正要解决的并不是“哪个页面最努力做 SEO”，而是“哪个结果最适合当前这次搜索”。

所以独立开发者做 SEO，第一步不是内容生产，而是需求映射。

## 先把关键词翻译成人话

用户搜“png to webp”，通常不是想读一篇图片格式历史。他希望上传文件并得到转换结果。

用户搜“what is webp”，则很可能在找解释。

两个词都包含 webp，页面形态却完全不同。前者应该优先让工具完成任务，后者适合文章或文档。

关键词研究真正要回答的是：这个人现在要完成什么？

## 一个需求，一个主要页面

很多新站看到十个近义词，就做十个几乎一样的页面。这样做的麻烦不只是文案重复，还会让你自己无法说明这些页面有什么不同。

Google 的 canonical 文档解释过，系统会对重复或高度相似页面做聚类并选择代表性 URL。站长可以给出 canonical 等信号，但搜索引擎仍会根据页面判断代表版本。

更合理的做法是先聚类意图。用户任务相同，就让一个强页面覆盖自然变体；任务明显不同，再拆页面。

## SEO 页面首先必须是产品或内容

工具页应该真的能用，比较页应该真的比较，教程应该让用户做完某件事。

如果页面存在的唯一理由是承载一个关键词，通常会出现大量空话：先解释定义，再列优点，再放 FAQ，最后引导注册，却迟迟不给用户要的结果。

Google 当前的垃圾内容政策明确反对关键词堆砌、规模化低价值内容和以操纵排名为主要目的的行为。对独立开发者更实用的理解是：别为了覆盖词表制造页面库存。

## 技术 SEO 是让正确内容能被正常理解

内容对了，还要确保搜索引擎能访问。

页面应该返回正确 HTTP 状态；重要内容不能被误设 `noindex`；站内链接要能到达；canonical、sitemap、重定向和多语言关系不能互相打架；移动端和真实用户体验也不能坏。

这些工作不直接创造需求，只是防止已有价值因为技术错误丢失。

## 最后才是竞争

同一个需求已经有很多好页面时，你仍然要回答：为什么用户应该点你？

可能是工具更快、数据更新、解释更清楚、无需注册、免费层更合理、某个地区更适配，也可能是你拥有别人没有的一手数据。

如果没有任何更好的地方，只靠“文章更长”通常不够。

## 一张最小 SEO 工作表

每个准备做的页面只写五项：目标用户任务、主要搜索表达、页面类型、用户完成任务后的结果、与现有结果相比的理由。

五项说不清，就先别写正文。

SEO 不是把搜索引擎当漏洞，而是把已经存在的搜索需求接到一个明确、可访问、值得留下的页面上。`
  },
  {
    id: 'academy-growth-intent',
    slug: 'one-keyword-one-page-or-many-pages',
    title: '一个关键词该做一个页面还是多个页面？先判断用户是不是在完成同一件事',
    summary: '页面数量不该由关键词数量决定。近义词可能属于同一搜索意图，同一个词也可能包含不同任务。拆页之前，先比较结果页和用户最终想得到的东西。',
    category: 'growth',
    series: '增长实验室',
    created_at: publishedAt,
    updated_at: publishedAt,
    view_count: 0,
    author: { username: '小概率编辑部' },
    sources: [
      { label: 'Google Search Central：Canonicalization', url: 'https://developers.google.com/search/docs/crawling-indexing/canonicalization' },
      { label: 'Google Search Central：SEO Starter Guide', url: 'https://developers.google.com/search/docs/fundamentals/seo-starter-guide' },
    ],
    content: `关键词工具很容易给你一张几百行的表。真正难的不是把每一行变成 URL，而是决定哪些词应该共用一个页面。

这个判断做错，站点通常会走向两个极端：所有词都塞进首页，什么都讲不清；或者每个近义词建一页，页面之间只换几个标题。

## 先比较“用户最终想得到什么”

例如“image compressor”和“compress image online”大概率指向同一个任务：上传图片、压缩、下载。

“how image compression works”虽然共享词根，任务却不同：用户更可能想理解原理。

所以第一层不是比较字面相似度，而是写出每个查询的完成状态。

如果用户在两个查询下都希望得到同一个结果，优先考虑一个页面。

## 再看搜索结果是不是把它们当成同一个市场

手工搜索几个核心变体，比较前十结果。

如果大部分 URL 高度重合，说明搜索系统和市场通常把它们视为接近的意图。一个强页面覆盖它们往往更自然。

如果结果构成明显不同——一个全是工具，一个全是教程；一个偏企业采购，一个偏免费个人使用——就有拆页理由。

这不是机械公式，但比“词不同就建页”可靠。

## 页面拆分必须有真实内容差异

准备新建第二个页面前，问一个苛刻问题：去掉标题以后，两页正文和核心功能还能明显不同吗？

如果不能，很可能只是 doorway page。

Google 对 canonical 的说明指出，重复或非常相似页面会被聚类并选择代表页面。即使你手工标了 canonical，最终选择仍是搜索系统综合判断。与其制造一堆让系统帮你去重的页面，不如一开始就让信息架构清楚。

## 同一个词也可能值得多个页面，但不是复制

“invoice template”可能包含模板下载需求；“invoice template for freelancers”则可能需要自由职业者特有字段和税务提示。如果后者真的有独立任务和内容，可以有专页。

关键是它不是把主页面加一句“for freelancers”，而是交付发生变化。

同理，一个产品可以有工具页、方法页、定价页和案例页，它们围绕同一主题，但分别解决使用、理解、购买和信任问题。

## URL 架构也要跟着意图，而不是跟着词表

一级页面应该对应稳定主题，不要今天为了一个长尾词建三层目录，明天又因为关键词变化迁移。

分类页如果只是把筛选参数全部开放给搜索引擎，会产生大量近似 URL。电商和目录站尤其需要控制 faceted navigation，避免无限组合被抓取。

## 一个简单决策法

把候选关键词放进表格，只比较四列：用户任务、理想页面类型、现有 SERP 重合度、你能提供的独立价值。

四列高度一致就合并；任务或交付明显不同才拆分。

页面规划的目标不是“覆盖更多关键词”，而是让每个重要需求都能落到一个最自然的入口。`
  },
  {
    id: 'academy-growth-indexing',
    slug: 'why-google-cannot-find-new-site',
    title: '新网站上线后 Google 为什么搜不到？按抓取、索引、排名三层排查',
    summary: '“搜不到”可能是 Google 还没发现页面、发现但没有索引，或者已经索引却排得太后。三个问题的排查方法完全不同，先用 Search Console 判断处在哪一层。',
    category: 'growth',
    series: '增长实验室',
    created_at: publishedAt,
    updated_at: publishedAt,
    view_count: 0,
    author: { username: '小概率编辑部' },
    sources: [
      { label: 'Google Search Central：SEO Starter Guide', url: 'https://developers.google.com/search/docs/fundamentals/seo-starter-guide' },
      { label: 'Google Search Central：URL Inspection', url: 'https://support.google.com/webmasters/answer/9012289' },
      { label: 'Google Search Console：Performance report', url: 'https://support.google.com/webmasters/answer/7576553' },
    ],
    content: `新域名上线两天，搜索品牌名没有结果，很容易得出结论：SEO 有问题。

先别改标题。Google“搜不到”至少可能是三个完全不同的问题：没抓到、没索引、排不上来。

## 第一层：Google 知不知道这个 URL

新站没有外链、没有提交 sitemap、内部链接又弱，搜索引擎可能还没发现某些页面。

先在 Search Console 用 URL Inspection 检查具体 URL，而不是不停 `site:` 搜索。再确认 sitemap 已提交，重要页面从首页或其他可抓取页面有普通链接能到达。

Google 官方也提醒，新页面被发现和抓取需要时间，并不存在“提交以后立刻收录”的保证。

## 第二层：抓到了，为什么没进索引

页面可能被 `noindex`、robots 配置、错误状态码、重定向或 canonical 影响。

预览环境最常见的问题之一，是上线时忘了移除原本为 staging 准备的 `noindex`。另一个常见问题是多个版本同时存在：HTTP、HTTPS、www、裸域、参数页互相竞争，canonical 又指向错误地址。

还有一种情况不是技术故障：Google 抓到了页面，但认为它和站内其他内容重复、价值不足或不适合作为代表 URL，因此暂时不索引。

这时候继续提交十遍没有意义，要检查页面本身。

## 第三层：已经索引，只是没有排名

Search Console Performance 报告如果已经出现 impressions，说明页面至少在某些查询里被展示过。用户肉眼搜不到，可能只是位置太后。

这时问题从“收录”变成“竞争力”。

目标词是不是和页面意图一致？前面的结果是不是更专业、更有权威、更直接完成任务？你的站点是不是一个完全没有历史的新域名？内部链接是否让重要页面显得孤立？

这些都不是改 sitemap 能解决的。

## 不要把品牌词和通用词混在一起判断

一个刚上线的网站，品牌名如果足够独特，通常比高竞争通用词更容易出现。

如果品牌词都长期没有，优先检查发现和索引；如果品牌词能搜到，核心行业词排不到，更可能是内容、竞争和站点信号问题。

## 新站上线后的最小动作

确认生产域名只有一个 canonical 版本；所有正式页面返回 200；预览环境 noindex；robots 没误拦；sitemap 只包含希望索引的 canonical URL；重要页面有站内链接；Search Console 验证并提交 sitemap；用 URL Inspection 抽查首页和核心页。

然后给搜索系统时间。

## SEO 排错的核心是先定位阶段

“没流量”不是一个问题。

抓取解决“能不能看到”；索引解决“愿不愿意收”；排名解决“为什么是你”。三层混在一起，就会出现最常见的无效劳动：页面根本 noindex，却在研究外链；页面已经索引，却每天重复提交 sitemap。

先定位，再动手。`
  },
  {
    id: 'academy-growth-backlinks',
    slug: 'what-backlinks-are-worth-building',
    title: '外链有没有用？先把“真实推荐”“可提交入口”和垃圾链接分开',
    summary: '链接能帮助用户和搜索引擎发现站点，也可能形成推荐信号，但不是所有外链都等价。批量自动制造链接、付费传递排名权重和低质目录，反而属于 Google 明确列出的风险行为。',
    category: 'growth',
    series: '增长实验室',
    created_at: publishedAt,
    updated_at: publishedAt,
    view_count: 0,
    author: { username: '小概率编辑部' },
    sources: [
      { label: 'Google Search Central：Spam policies / Link spam', url: 'https://developers.google.com/search/docs/essentials/spam-policies' },
      { label: 'BacklinkOS：公开外链发现与执行工作流', url: 'https://github.com/pyxm1618/BacklinkOS' },
    ],
    content: `“外链有用吗”这个问题太大，因为一条媒体文章里的自然引用、一个产品目录提交、一个付费软文链接和一万条自动论坛签名，技术上都叫 backlink，价值和风险却完全不同。

独立开发者更需要先分类。

## 第一类：别人真的因为内容或产品提到你

用户写测评、开发者在文档里引用你的工具、媒体报道、合作伙伴正常链接，这类链接首先是推荐和分发。

它可能直接带来访问，也帮助搜索引擎发现页面。最重要的是，它存在的理由不是“给你做 SEO”，而是对方内容需要这个链接。

这类最难批量制造，也往往最值得长期追求。

## 第二类：产品和公司本来就该出现的入口

例如与你产品类型匹配的目录、应用商店、开源列表、行业数据库、合作生态页面。

这类入口的价值常常不止排名：有人真的在那里找工具，能带来 referral traffic、品牌曝光和第一批用户。

但目录也有质量差异。Google 当前垃圾链接政策明确把“低质量目录或书签站链接”列为 link spam 示例之一，所以“能提交”从来不是足够标准。

要看平台本身有没有真实用户、页面会不会被索引、是否与你的产品相关、提交内容是不是正常产品资料。

## 第三类：为了排名而制造的链接

买卖传递排名权重的链接、过度交换、自动程序批量创建链接、到论坛用关键词签名刷链接，都在 Google 的 link spam 示例里。

广告和赞助链接并不是不能存在，但官方要求这类关系适当标记，例如 `rel="sponsored"` 或 `nofollow`，不要伪装成自然编辑推荐来传递排名信号。

所以“买外链能不能涨排名”不是一个安全的长期增长策略问题，而是你愿意承担多大的算法与人工处罚风险。

## 外链工作本身也应该像运营，不是撒网

公开的 BacklinkOS 工作流把候选发现、平台事实、项目适配、实际提交和最终上线状态分开，正是因为“找到一个域名”不等于“获得一个有效链接”。

真正执行时要知道入口是否还活着、是否允许你的项目类型、是否需要登录、最终页面有没有上线、链接属性是什么。

这比买一个“1000 backlinks”套餐麻烦得多，但更接近事实。

## 新站应该先做哪一种

先完成那些本来就合理的身份和产品入口：公司/作者资料、GitHub、真正相关的产品目录、平台生态、合作伙伴页面。

同时做值得被引用的资产：工具、原创数据、模板、研究、清楚的教程。没有任何可引用内容，外链工作会永远变成人工求链接。

## 判断一条外链值不值得做

问三个问题就够。

如果 Google 明天完全不计算链接权重，这个入口还有没有真实用户价值？它和我的产品是否真的相关？为了得到它，我是否需要做自己不愿公开承认的操作？

前两个是，最后一个不是，通常比单看 DR/DA 更稳。

外链不是数字收藏。它最好先是一条真实的互联网关系，然后才可能成为搜索信号。`
  },
  {
    id: 'academy-growth-launch',
    slug: 'product-hunt-reddit-launch-is-not-lottery',
    title: 'Product Hunt、Reddit 冷启动：别把发布日当成一次流量抽奖',
    summary: '发布平台可以带来第一批真实用户，但“扔个链接等爆”通常没用。Product Hunt 重视完整 Launch 页面和社区互动；Reddit 对自我推广和垃圾行为有明确规则。',
    category: 'growth',
    series: '增长实验室',
    created_at: publishedAt,
    updated_at: publishedAt,
    view_count: 0,
    author: { username: '小概率编辑部' },
    sources: [
      { label: 'Product Hunt：How to launch on Product Hunt', url: 'https://www.producthunt.com/launch' },
      { label: 'Product Hunt：Prepare for launch', url: 'https://help.producthunt.com/en/articles/479557-how-to-prepare-for-your-launch' },
      { label: 'Reddit Help：Spam', url: 'https://support.reddithelp.com/hc/en-us/articles/360043504051-Spam' },
    ],
    content: `冷启动最诱人的想象是：产品做完，发到 Product Hunt 或 Reddit，一夜之间来几千用户。

这事偶尔发生，但不能拿它当增长计划。发布平台真正稳定的价值，是把一个已经能工作的产品放进目标人群面前，快速得到第一批点击、问题、反对意见和付费信号。

## Product Hunt 的准备工作发生在发布前

Product Hunt 官方 Launch 指南要求准备清晰的 tagline、描述、媒体素材、maker 信息等，并鼓励创作者在发布当天真实参与讨论。

这些要求看起来像运营细节，本质上逼你回答几个产品问题：一句话到底怎么解释？截图能不能让人理解核心价值？用户点进去以后能不能马上体验？

如果这些还说不清，提前一周找人点赞并不会救产品。

## 不要把排名当成唯一结果

发布当天的票数和榜单会受时间、受众、品类和社区反应影响。即使没有冲到第一，只要带来几十个真正目标用户，也可能足够发现重要问题。

应该提前定义更接近业务的指标：多少人进入产品、多少人完成核心动作、留下什么问题、有没有人愿意注册或付款、哪些描述让人误解。

榜单是曝光结果，不是产品验证本身。

## Reddit 更不是一个“可以发链接的流量池”

Reddit 的 Spam 政策会处理重复、无关、欺骗性和操纵性的推广行为。不同 subreddit 还有自己的自我推广规则。

真正有效的做法通常更慢：先成为正常参与者，理解社区在讨论什么；产品只有在确实解决当前问题时才出现；帖子本身提供完整信息，而不是“我做了个工具，大家看看”。

如果一个产品只能靠隐藏身份、批量发帖或伪装推荐获得点击，这种渠道很难长期维护。

## 发布内容要和社区的“工作”对上

Product Hunt 用户愿意发现新产品，所以可以直接展示产品。

Reddit 用户通常是为某个主题讨论而来，帖子应该围绕那个问题展开。Hacker News 更看重技术、创业和经验讨论。一个内容不能原封不动复制到所有平台。

渠道不是流量 API，每个社区都有自己的使用习惯。

## 发布后的 48 小时更重要

记录所有重复出现的问题。有人不会用，不要先怪用户；三个人在同一步卡住，就应该回产品看。

有人问“和 X 有什么区别”，说明定位还没讲清。有人愿意用却不愿意付费，要问是价值不够还是收费点太早。有人留下邮箱但从不回来，要看第一次成功之后有没有第二次使用理由。

这些信息比点赞数更能决定下一版。

## 把 launch 当作一次实验

发布前写下假设：谁会最感兴趣、他们会在哪一步感到价值、最可能反对什么、希望发生哪个转化。

发布以后对照事实。

这样即使流量不大，仍然能得到一轮有效学习。把发布日当抽奖，只会留下“这次没爆，再换个平台试试”的结论。

冷启动不是寻找一个神奇入口，而是把产品一次次送到真正可能需要它的人面前。`
  },
]
