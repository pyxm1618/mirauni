import type { AcademyArticle } from './types'

const publishedAt = '2026-09-10T00:00:00.000Z'

export const academyStoryArticles: AcademyArticle[] = [
  {
    id: 'academy-story-tally-pivot',
    slug: 'tally-from-travel-startup-to-form-builder',
    title: 'Tally：一次受挫的旅游创业，最后做成了表单工具',
    summary: 'Tally 并不是从一份“表单市场分析”开始的。两位创始人先做旅游业务，疫情后失去客户，才转向一个他们自己嫌贵、嫌难用的老品类。',
    category: 'stories',
    series: '独立开发故事',
    featured: true,
    created_at: publishedAt,
    updated_at: publishedAt,
    view_count: 0,
    author: { username: '小概率编辑部' },
    sources: [
      { label: 'Tally 创始团队：How we ended up building the simplest way to create forms', url: 'https://blog.tally.so/how-we-quit-our-jobs-to-work-on-our-startup-lost-half-of-our-clients-decided-to-pivot-and-ended-up-building-a-no-code-tool/' },
      { label: 'Tally：How we grew Tally to $4M ARR, fully bootstrapped', url: 'https://blog.tally.so/how-we-grew-tally-to-4m-arr-fully-bootstrapped/', note: '收入与用户数据来自 Tally 自己披露，未经独立审计。' },
    ],
    content: `Tally 今天看起来像一个很顺的故事：表单是刚需，产品足够简单，免费版足够大方，再用 Pro 和 Business 收费。但它真正的起点并不是“我们发现了表单市场的巨大机会”。

## 先做错一个项目

2019 年底，Marie Martens 和 Filip Minev 做的是 Hotspot，一个连接酒店与旅行创作者的业务。2020 年初，两人把更多时间押进去，随后疫情直接打断旅行行业。Tally 创始团队后来在自己的博客里回忆，到 2020 年 7 月，他们已经失去大约一半客户。

这段经历很重要，因为它把“转型”从创业故事里的漂亮词，变成了一个很现实的问题：原来的行业什么时候恢复没人知道，手上的客户还在减少，继续等也是一种选择，但成本每天都在发生。

他们没有立刻追逐当时最热门的新概念，而是回到自己反复遇到的小问题：Google Forms 能用，但体验朴素；Typeform 一类产品好用，但对于早期团队和个人来说容易很快碰到付费墙。表单不是新市场，甚至可以说拥挤得不像机会。

## 一个老品类，换一个明确取舍

Tally 的切口不是“功能更多”，而是“像写文档一样做表单”。它把编辑器做得接近 Notion 的输入体验，同时把大量能力放进免费层。早期 MVP 甚至很简陋。Tally 团队自己回忆，最初版本只能插入问题，连发布表单都还不完整。

这和常见的 MVP 误区正好相反。很多人会觉得，进入成熟市场必须一开始就补齐竞品功能，否则没有资格上线。Tally 先验证的是更窄的问题：有人会不会喜欢这种编辑方式？愿不愿意继续用？哪些功能真的会被要求？

他们在 2020 年把 MVP 给朋友、Indie Hackers、创业者社区和 Slack 用户看，持续收反馈。到 2021 年 Product Hunt 正式发布时，产品已经不是“一个周末的 Demo”，但仍然围绕同一个取舍：简单、快、免费层足够有用。

## 真正拉开差距的是长期坚持同一个约束

几年以后，Tally 没有把自己扩成“表单 + CRM + 日历 + 数据库”的大套件。创始团队在 2025 年复盘时仍然把“只把一件事做好”列为核心原则。按照 Tally 自己 2025 年 10 月的披露，公司已经达到约 400 万美元 ARR；2026 年初，他们又公开写到团队约 10 人、用户超过 100 万。这里的财务数字属于公司自报，不应当当作审计口径，但它至少说明这条路线不是短期实验。

更值得注意的是它的增长结构。大量用户先免费创建表单，表单本身又会被更多人看到；一部分用户为了去品牌、团队协作、数据留存等需求升级。免费层不是单纯“送功能”，而是产品分发的一部分。

## 这个故事真正能抄的是什么

不是“去做一个表单工具”。表单市场今天比 2020 年更拥挤，照着 Tally 复制 UI 并不会复制它的结果。

更可复用的是四个判断。

第一，创业受挫后，不一定要寻找一个全新的宏大方向。你已经长期使用、长期抱怨的旧工具，反而可能更接近真实需求。

第二，成熟市场并不等于没有机会。问题是你能不能明确说出：现有产品对哪一类人不够好，你准备做出什么取舍。

第三，MVP 不需要证明“我能造出完整产品”，只需要证明最关键的体验假设有人在乎。

第四，小团队的优势不是功能数量，而是能长期拒绝不重要的东西。Tally 后来的规模变大了，但它最早的竞争力仍然能追溯到那个很窄的判断：做表单这件事，不该这么笨重。`
  },
  {
    id: 'academy-story-photopea',
    slug: 'photopea-ten-years-from-psd-viewer',
    title: 'Photopea：从“能不能在浏览器打开 PSD”开始的十多年',
    summary: 'Photopea 没有先做“网页版 Photoshop”。它最早只是一个 PSD 文件查看实验，功能一项项长出来，六年后才真正让创作者不必去找工作。',
    category: 'stories',
    series: '独立开发故事',
    created_at: publishedAt,
    updated_at: publishedAt,
    view_count: 0,
    author: { username: '小概率编辑部' },
    sources: [
      { label: 'Siesta Labs：The Independent Path of Ivan Kutskir, Founder of Photopea', url: 'https://siesta-labs.com/blog/from-passion-project-to-global-tool-the-independent-path-of-ivan-kutskir-founder-of-photopea' },
      { label: 'Indie Hackers / Ivan Kutskir：Photopea founder story', url: 'https://www.indiehackers.com/post/the-story-of-a-unicorn-solo-founder-making-500-000-arr-4c3070f0f0', note: '文中的收入数字来自创始人自述，未经独立审计。' },
    ],
    content: `Photopea 最容易被讲成一种传奇：一个人，在浏览器里做出了接近专业桌面软件体验的图片编辑器。但如果只盯着“一个人做 Photoshop”这件事，会错过这个项目更有价值的部分——它一开始根本不是 Photoshop。

## 最初只是想读懂一个文件

Ivan Kutskir 在大学期间做过很多小项目。他熟悉 Photoshop，也对浏览器技术感兴趣。2012 年，他尝试解决一个很具体的技术问题：能不能在网页里解析 PSD 文件？最早的版本更像 PSD 查看器，用户能打开文件、看到图层，再把内容导出。

这不是一个完整商业计划，也没有“全功能在线图像编辑平台”的路线图。Ivan 后来的回忆很直接：前几年他并没有打算做完整编辑器，只是在已有东西上不断加功能。

这种生长方式和现在常见的 AI 建站节奏很不一样。现在一个人很容易在几天内搭出首页、登录、支付、后台，看起来“产品齐了”。Photopea 的早期路径几乎相反：外壳并不重要，最难的核心能力先一点点变强。

## 2016 年，才真正押上全职时间

Photopea 从 2012 年开始只是爱好项目。Ivan 2016 年毕业时才遇到真正的选择：去找一份正常的软件工作，还是拿积蓄继续做它。

他选择了后者，而且生活方式并不浪漫。根据他后来的采访，他当时和几个人合租，尽量压低开支，希望把“必须去找工作”的日期往后推。Photopea 那时已经有持续增长的用户，但并没有给他稳定收入。

2017 年他开始用广告变现。Ivan 在采访里回忆，早期广告收入大约每月 500 美元。这个数字的意义不在于高，而在于它第一次改变了项目的生存条件：只要成本足够低，一个原本需要靠存款维持的项目，可以继续活下去。

之后 Photopea 的用户和收入继续增长。Ivan 多次公开过自己的收入数据，但这些都属于创始人自报，不应包装成审计事实。比数字更确定的是商业结构：大量编辑工作发生在用户浏览器本地，产品长期保持免费可用，广告是主要变现方式，Premium 和授权等形成补充。

## 十多年里，他没有把“独立”理解成拒绝用户

Photopea 很多功能来自用户提出的问题。Ivan 维护 Twitter、GitHub、Reddit 等社区入口，自己处理邮件和 bug。后来他也尝试找人协作，但在 2025 年的采访里，他坦言自己仍然更享受亲自解决问题，而不是给别人拆任务。

这并不意味着“一个人永远最好”。Photopea 恰好建立在一个非常特殊的个人能力上：创作者长期积累图形处理、文件格式和浏览器实现经验，代码又高度集中。换一个需要销售、客服、线下交付的业务，照抄这种组织方式很可能失败。

## Photopea 对独立开发者最有价值的提醒

第一，不要把“项目最初形态”想得太大。一个文件解析器可以慢慢长成编辑器；一个真正困难、真正被使用的核心能力，比十个外围页面更值钱。

第二，时间本身可以成为壁垒。Photopea 很难复制，不是因为别人不知道它有哪些按钮，而是大量兼容性和图形能力是十多年累积出来的。

第三，低成本结构会改变你能坚持多久。如果一个项目每个月必须烧掉高额云成本和广告费，它没有 Photopea 那样的试错时间。

第四，别把“独立开发”误解成“快速做很多项目”。Ivan 的案例恰好是另一条路：一个项目做很多年，慢慢把一个看起来很小的技术实验做深。它不适合所有人，但足够提醒我们——做得久，本身也可能是一种产品策略。`
  },
  {
    id: 'academy-story-simple-analytics',
    slug: 'simple-analytics-from-annoyance-to-product',
    title: 'Simple Analytics：一次“不想再装 GA”的抱怨，怎么变成产品',
    summary: 'Adriaan van Rossum 做客户网站时反复安装 Google Analytics，却越来越不喜欢这种数据收集方式。产品机会不是调查出来的，而是从自己的职业摩擦里长出来的。',
    category: 'stories',
    series: '独立开发故事',
    created_at: publishedAt,
    updated_at: publishedAt,
    view_count: 0,
    author: { username: '小概率编辑部' },
    sources: [
      { label: 'Simple Analytics 官方 About', url: 'https://www.simpleanalytics.com/about' },
      { label: 'Simple Analytics：Founder Story', url: 'https://www.simpleanalytics.com/press/founder-story' },
      { label: 'Simple Analytics：Why Simple Analytics is my first successful project', url: 'https://www.simpleanalytics.com/blog/why-simple-analytics-is-my-first-successful-project' },
    ],
    content: `很多需求发现方法都要求你去“找用户痛点”。Simple Analytics 的起点更普通：创始人 Adriaan van Rossum 当自由职业开发者时，给客户做网站，经常要重复安装 Google Analytics。他知道这些脚本会采集访问数据，这件事越来越让他不舒服。

他后来在采访里回忆，自己甚至只是和女朋友抱怨这件事，对方反问：既然你总喜欢自己做东西，为什么不做一个你愿意安装的分析工具？

## 先解决自己明确知道的问题

Adriaan 没有先设计一个“Google Analytics 替代平台”。早期版本非常窄：一个轻量脚本，一个简单后台，显示页面浏览、来源等最基本数据，不追踪个人，也不依赖复杂用户画像。

这个方向之所以值得看，不是因为“隐私赛道很大”，而是创始人同时拥有三种信息。

他是实际使用者，知道安装和查看数据的工作流；他是开发者，知道一个更轻的版本技术上可行；他又对现有方案有明确价值判断——不是“功能不好”，而是“不想用这种方式得到数据”。

这比泛泛地说“用户觉得 GA 太复杂”具体得多。

## 第一批用户来自一次真实发布

Adriaan 在 2018 年把 Simple Analytics 发到 Hacker News。根据他自己的回忆，产品在首页获得了很长时间曝光，也带来了第一批客户。此前他做过不少项目，但自己把 Simple Analytics 称为第一个真正成功的项目，其中一个变化就是：这次他没有只做完、给朋友看看、然后等 SEO 慢慢来，而是明确地把产品发布到有目标用户的社区。

这里有个容易被忽略的差别：发布不是“做营销素材”，而是把产品拿到一个会迅速给出反馈的场景。有人愿意点击不够，有人愿意付钱才让他更确信这个价值主张成立。

早期现金流仍然不宽裕。他继续做一部分自由职业，用短期服务收入换取更多时间做产品。这个组合对独立开发者很现实：不是非得在“全职创业”和“完全不做”之间二选一。

## 隐私不是一句品牌口号，而是产品约束

Simple Analytics 后来的产品和商业模式一直围绕这个约束：不使用 cookies，不收集个人数据，尽量减少脚本体积，同时用订阅收费。官方 About 页面目前仍把独立、自筹资金、隐私优先列为核心原则。

这种定位有代价。它主动放弃了一部分依赖细粒度用户追踪的分析能力，也不适合所有增长团队。但正因为放弃了一些东西，产品才有清晰边界。

更有意思的是，Simple Analytics 后来在免费策略上也做过实验。团队曾讨论免费计划能不能扩大增长，之后又根据自己的转化和收入表现调整。这说明“价值观明确”不等于商业策略一成不变；真正不变的是它不愿靠个人追踪来换增长。

## 从这个故事里能学到什么

需求未必来自陌生人的访谈。你每天重复做的工作、每次都觉得别扭但又不得不用的工具，本身就是一份需求清单。

不过“我讨厌这个工具”还不够。要继续问三句：别人是否也有同样的不满？你准备牺牲什么来换取更好的体验？这个差异是否足以让人迁移和付费？

Simple Analytics 的答案很明确：目标用户愿意用更少的追踪能力，换更轻、更简单、更尊重隐私的分析；团队再用付费订阅而不是广告数据来维持业务。

这类机会往往不是发明新品类，而是把一个你不认同的默认做法拿掉，再看看剩下的东西能不能独立成为产品。`
  },
  {
    id: 'academy-story-buttondown',
    slug: 'buttondown-side-project-to-full-time-business',
    title: 'Buttondown：先给自己做一个顺手的工具，再慢慢把它变成生意',
    summary: 'Justin Duke 没有因为“邮件工具很多”就放弃。他只是觉得现有产品太重，先做了自己愿意用的版本，几年后才从业余项目变成全职公司。',
    category: 'stories',
    series: '独立开发故事',
    created_at: publishedAt,
    updated_at: publishedAt,
    view_count: 0,
    author: { username: '小概率编辑部' },
    sources: [
      { label: 'Buttondown 官方：For creators', url: 'https://buttondown.com/features/for/creators' },
      { label: 'Medialyte：Justin Duke built Buttondown for himself', url: 'https://medialyter.substack.com/p/justin-duke-built-buttondown-for' },
      { label: 'Starter Story：Justin Duke / Buttondown', url: 'https://www.starterstory.com/stories/buttondown', note: '收入数字为创始人采访时披露，文章不将其视为审计数据。' },
    ],
    content: `Buttondown 所在的市场一点也不空。Mailchimp、ConvertKit、Substack，再加上一长串邮件营销和 newsletter 工具，任何一份“竞品数量”表格都可能让人得出结论：别做了。

Justin Duke 还是做了。原因没有那么宏大。他自己写 newsletter，觉得当时可选工具要么偏企业营销、功能太重，要么希望接管整个内容发布体系。他想要的是另一种东西：在自己的网站放一个订阅表单，写信，发出去，别让工具本身占太多注意力。

## 最开始的用户就是自己

Justin 在采访里说过一句很能解释 Buttondown 的起点：他并没有预判到 newsletter 会成为某个大趋势，只是想做一个自己更愿意用的工具。

这类“scratch your own itch”很容易被浪漫化。自己需要并不代表市场需要。Buttondown 真正跨过那道线，是朋友、陌生用户开始使用，而且有人愿意为它付费。Justin 曾提到，早期付费用户里甚至有美国威斯康星州的图书馆系统，用它发送新书更新。这和典型“科技创业用户画像”完全不同，却恰好证明一个小而清楚的产品可以被不同人理解。

## 很长时间，它只是下班后的项目

Buttondown 不是两个月冲出来然后融资扩张。Justin 当时有全职工程工作，先长期把它当业余项目维护。公开采访显示，他在 Stripe 工作期间持续做 Buttondown，等业务规模足以支撑自己以后，才离开全职岗位。

这条路径降低了一个关键风险：产品不用在发布后的几个月里立刻证明自己能养活创始人。代价则是增长更慢，晚上和周末会被占用，而且你必须对维护工作有耐心。

Justin 对这种选择一直很明确。他并不想走融资、快速扩团队、追求退出的传统创业路径。Buttondown 官方到今天仍然强调自己是独立、自筹资金的公司，并把真人支持、可迁移的数据、相对克制的产品设计当作卖点。

## “功能少”只有在取舍清楚时才成立

Buttondown 不是永远拒绝功能。它后来加入自动化、付费订阅、分群、评论、调查等能力，团队也已经不再是一个人。但它的产品结构仍然尽量把复杂能力放在用户需要时再出现。

这和“为了做 MVP 少做几个页面”不是一回事。真正的克制来自对主任务的理解：用户来这里是为了维护订阅者并发送邮件，不是为了操作一个庞大的营销软件。

它的当前定价也体现这种思路：很小的列表可以免费使用，额外能力按模块增加费用。定价方式当然会继续变化，但逻辑很稳定——尽量让基础发送这件事简单，把更复杂的业务能力放到需要它的人身上。

## 拥挤市场里，机会经常藏在“我不想成为谁”

Buttondown 最有价值的地方，不是证明“newsletter 还能做”。而是说明竞品分析不能只数产品数量。

如果一个市场里所有主流产品都在向同一个方向变重，就可能留下另一群用户：他们并不想要完整平台，只想要其中一个核心任务被处理得干净一点。

当然，做“小而美”也有硬约束。邮件不是纯前端玩具，发送信誉、退订、垃圾邮件、域名认证、合规、投递率都需要长期维护。真正的门槛并不是界面做得简洁，而是你愿不愿意把这些看不见的麻烦接过来。

Justin 做了很多年。这个时间尺度比“周末做一个 SaaS”更接近 Buttondown 的真实故事。`
  },
  {
    id: 'academy-story-plausible',
    slug: 'plausible-324-days-and-one-blog-post',
    title: 'Plausible：324 天才到 400 美元 MRR，后来一篇文章改变了增长',
    summary: 'Plausible 的早期增长并不快。创始团队公开复盘过：从第一个付费用户到 400 美元 MRR 用了 324 天，而真正的转折来自一篇击中用户立场的文章。',
    category: 'stories',
    series: '独立开发故事',
    created_at: publishedAt,
    updated_at: publishedAt,
    view_count: 0,
    author: { username: '小概率编辑部' },
    sources: [
      { label: 'Plausible：How we bootstrapped our Google Analytics alternative to $500k ARR', url: 'https://plausible.io/blog/bootstrapping-saas', note: '收入数据由 Plausible 自己披露。' },
      { label: 'Plausible 官方 About', url: 'https://plausible.io/about' },
      { label: 'Plausible：How we built a $1M ARR open source SaaS', url: 'https://plausible.io/blog/open-source-saas', note: '收入与客户数据为公司自报。' },
    ],
    content: `如果只看成熟后的 Plausible，很容易把它想成“踩中隐私趋势，所以自然增长”。创始团队自己写过的早期数据并不支持这种轻松叙事。

Plausible 在 2019 年有了第一个付费用户，但从那时到月经常性收入 400 美元，用了 324 天。对于独立开发者来说，这个时间比“发布当天冲榜”更值得记住，因为很多真实产品的前几个月就是没有戏剧性。

## 慢，并不代表什么都没发生

Plausible 最初由 Uku Taht 开始开发，目标是做一个简单、轻量、隐私友好的 Google Analytics 替代品。2020 年 Marko Saric 加入，负责营销和沟通。两个人没有融资，也没有大规模投广告。

早期产品面对一个很现实的难题：Google Analytics 免费、功能强、市场教育几乎已经完成。只说“我们也能看 PV”没有说服力。Plausible 需要把差异变成一个用户真正愿意站队的理由。

这个理由后来越来越清楚：少收数据、不依赖 cookies、界面简单、脚本轻，同时接受“它不会提供 GA 那么多追踪能力”这个取舍。

## 一篇文章带来的不是 SEO 小技巧，而是立场共振

2020 年 4 月，Plausible 发布《Why you should stop using Google Analytics on your website》。团队后来公开复盘，这篇文章登上 Hacker News 后，几天内吸引了超过 5 万阅读，并在一周带来 166 个新试用；在此之前，他们 15 个月的网站总独立访客约 2.73 万。

这个反差很大，但如果把它总结成“去 Hacker News 发文章”就学错了。

真正有用的是内容与产品主张完全一致。文章不是泛泛讲“分析工具怎么选”，而是直接挑战目标用户正在使用的默认方案，再解释为什么团队选择另一套做法。读者即便不同意，也能立刻理解 Plausible 为什么存在。

很多产品内容的问题就在这里：文章有流量，却和产品没有关系。Plausible 的那篇文章反而是产品定位本身的延伸。

## 开源也没有自动带来生意

Plausible 是开源产品。用户可以自己部署，官方则提供托管订阅。开源让代码、技术选择和产品方向更透明，也降低了一部分信任门槛，但“代码公开”不会自动产生收入。托管版仍然必须提供足够省事的体验，才能让用户愿意付钱而不是自己维护。

2022 年，Plausible 官方披露 ARR 达到 100 万美元、团队仍然很小。今天它已经比最初复杂得多，但公司继续强调独立、自筹资金和隐私优先。这里同样应当区分事实层级：这些财务数字来自公司自己的公开记录，不是第三方审计报告。

## 对独立开发者更重要的是前 324 天

成功案例最容易删除掉等待期。Plausible 把等待期写了出来。

这给了三个更现实的判断。

第一，几个月增长慢，不足以单独证明产品错误。你要看的是用户是否持续使用、有没有人愿意付钱、定位是否越来越清楚，而不是只看发布当天。

第二，内容增长不是“写很多”。一篇和产品立场强绑定、能进入目标用户讨论场的文章，可能比几十篇泛 SEO 内容更有价值。

第三，差异化必须允许你放弃一部分市场。Plausible 不会满足所有分析需求，正因为它接受这个边界，隐私和简单才不是一句广告词。

如果一个产品需要解释十分钟用户才知道它为什么存在，先别急着做内容矩阵。Plausible 的转折提醒人：有时候你真正缺的不是流量，而是一句足够明确、足够值得讨论的产品主张。`
  },
]
