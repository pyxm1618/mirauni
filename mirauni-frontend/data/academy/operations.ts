import type { AcademyArticle } from './types'

const publishedAt = '2026-09-10T00:00:00.000Z'

export const academyOperationsArticles: AcademyArticle[] = [
  {
    id: 'academy-operations-privacy',
    slug: 'write-privacy-policy-from-real-data-flow',
    title: '隐私政策别从模板开始：先把你的网站到底收了什么数据画出来',
    summary: '隐私政策不是页脚装饰。注册、分析、支付、日志和 AI 服务会把数据交给不同系统。先做真实数据清单，才知道应该向用户说明什么。',
    category: 'operations',
    series: '经营手册',
    featured: true,
    created_at: publishedAt,
    updated_at: publishedAt,
    view_count: 0,
    author: { username: '小概率编辑部' },
    sources: [
      { label: 'ICO：How to write a privacy notice and what goes in it', url: 'https://ico.org.uk/for-organisations/advice-for-small-organisations/privacy-notices-and-cookies/how-to-write-a-privacy-notice-and-what-goes-in-it/' },
      { label: 'ICO：What privacy information should we provide?', url: 'https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/the-right-to-be-informed/what-privacy-information-should-we-provide/' },
    ],
    content: `很多独立网站的 Privacy Policy 来自同一个流程：找同行网站，复制一份，替换公司名和邮箱。

这恰好把顺序做反了。

隐私说明应该描述你的真实数据处理，而不是让产品去适配一份模板。不同地区法律要求不同，正式合规问题需要结合你的运营主体和目标市场确认；但产品层面有一件事可以先做，而且几乎不会错：把数据流画出来。

## 从用户第一次打开网站开始列

浏览首页时有没有 analytics？有没有错误监控？服务端日志记录 IP 吗？有没有 Cookie、本地存储或设备标识？

注册时收什么：邮箱、手机号、Google 账号资料、头像？

使用产品时又产生什么：输入内容、文件、历史记录、聊天、生成结果？这些数据是否会发给 OpenAI、Anthropic 或其他模型供应商？

付款时哪些信息由你保存，哪些只由支付服务商处理？退款记录保留多久？

把每个节点写成“数据 → 为什么需要 → 存在哪里 → 传给谁 → 留多久”。这张表比任何隐私模板更重要。

## 第三方服务不能只写一句“我们可能使用合作伙伴”

ICO 面向英国组织的指导要求在适用情况下说明个人数据的接收方或接收方类别、处理目的、保留期或判断标准等信息。

独立开发者最容易漏掉的是供应商事实。

你可能没有主动“卖用户数据”，但仍然把数据交给了邮件服务、数据库托管、支付、分析、错误监控和 AI API。用户真正需要知道的是这些系统在流程里做什么，而不是一句抽象的“可信第三方”。

供应商变化以后，隐私说明也应该跟着更新。

## AI 产品尤其要把“输入去了哪里”说清楚

用户在文本框里输入的信息可能比注册邮箱敏感得多。

如果内容会被发送给第三方模型进行推理，要弄清供应商条款、数据保留和训练设置，再写进自己的数据说明。不能一边把完整对话发给外部 API，一边在政策里笼统写“您的数据仅保存在本平台”。

最安全的文案不是最宽泛，而是和真实实现一一对应。

## 不要写自己做不到的承诺

“我们绝不会保留任何数据”“所有信息立即删除”“采用最高级别安全措施”听起来让人放心，但如果日志保存 30 天、备份按周期覆盖、支付记录依法需要保存，这些话反而制造风险。

写可验证的事实：保存哪些类别、目的是什么、通常保留多久、用户怎样联系你行使权利。

## 一份隐私政策上线前的产品检查

对照代码和后台逐项核对 analytics、cookie、数据库表、对象存储、日志、邮件、支付、AI Provider、客服工具。然后再检查政策里有没有对应描述。

如果删除一个第三方 SDK，政策也可以删掉；如果新增 Clarity、GA4 或新的模型服务，发布前就应该触发隐私复核。

把 Privacy Policy 当成数据架构的公开版本，会比复制别人的法律长文可靠得多。`
  },
  {
    id: 'academy-operations-cookie',
    slug: 'cookie-consent-not-every-cookie-needs-same-treatment',
    title: 'Cookie Banner 不是越大越合规：先分清哪些存储真的需要同意',
    summary: '登录会话、安全和购物篮等严格必要技术，与广告追踪、行为分析不是一回事。先做 cookie inventory，再决定哪些能直接设置、哪些必须等用户选择。',
    category: 'operations',
    series: '经营手册',
    created_at: publishedAt,
    updated_at: publishedAt,
    view_count: 0,
    author: { username: '小概率编辑部' },
    sources: [
      { label: 'ICO：Cookies and similar technologies', url: 'https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/cookies-and-similar-technologies/' },
      { label: 'ICO：What are the exceptions?', url: 'https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-the-exceptions/' },
    ],
    content: `有的网站一打开就弹出半屏 Banner，只有一个巨大的“Accept all”；有的网站什么都不提示，却同时加载好几个广告和分析脚本。

Cookie 合规不应该从设计弹窗开始，而应该从“浏览器里到底写了什么”开始。下面以英国 ICO 的公开指导为例说明产品思路，具体地区要求可能不同。

## 先做一次 cookie inventory

打开生产站，用浏览器 DevTools 检查 Cookies、Local Storage、第三方网络请求。再把所有 SDK 列出来：认证、分析、客服、广告、A/B 测试、支付、嵌入视频。

对每一项写清用途、供应商、持续时间、是否在用户操作前就创建。

很多团队做到这里才发现，所谓“我们只用了一个统计工具”其实顺带加载了几种存储和第三方请求。

## “严格必要”要从用户请求的服务判断

ICO 当前指导解释得很具体：严格必要指没有这项存储或访问，就无法提供用户主动请求的服务。

购物篮里记住用户刚放进去的商品、为在线服务提供必要安全的会话 Cookie、负载均衡等可能符合例外；广告 Cookie 不能因为“广告收入对我们很重要”就变成严格必要。

这个区别很关键，因为非必要 cookie 在适用规则下需要用户作出有效选择。

## 同意不能发生在脚本已经跑完以后

如果分析或广告脚本需要同意，就要把技术加载顺序和 consent 状态连起来。

用户还没选择时，不应该先创建非必要 cookie，再用 Banner 告诉他“继续浏览即同意”。ICO 对有效 consent 的描述要求清楚、具体、知情并有明确积极动作；非必要 cookie 不能在用户同意前就先设置。

所以 Cookie Banner 不是一段文案，而是一项运行时功能。

## 拒绝以后要真的拒绝

UI 上有“Reject”，但 GA、Clarity 或广告脚本已经在页面初始化时加载，是最常见的伪实现。

做法应该是默认只加载严格必要能力；用户同意某类用途以后再初始化对应 Provider；撤回同意时更新状态，并尽可能停止后续非必要处理。

如果产品根本不需要非必要 cookie，最简单的 Banner 往往是不做复杂追踪。

## 第三方嵌入也要检查

YouTube、地图、聊天组件、社交嵌入可能在页面加载时向第三方发请求。不要只搜代码里有没有 `document.cookie`。

一个完整 inventory 应该从真实浏览器网络行为出发。

## 上线以后继续维护

新增一个增长工具时，把 cookie/privacy review 放进发布清单。否则半年以后政策还写着旧供应商，页面却已经多出三套追踪。

Cookie 管理真正要解决的是：用户选择能不能控制实际数据行为。

弹窗长什么样是第二步。`
  },
  {
    id: 'academy-operations-terms',
    slug: 'terms-of-service-should-match-real-business',
    title: 'Terms of Service 为什么不能照抄同行：你的收费、退款和停服规则根本不一样',
    summary: '服务条款是交易规则，不是免责声明仓库。产品卖什么、什么时候交付、怎么续费、怎样取消、什么情况下退款，都应该和代码及购买页面一致。',
    category: 'operations',
    series: '经营手册',
    created_at: publishedAt,
    updated_at: publishedAt,
    view_count: 0,
    author: { username: '小概率编辑部' },
    sources: [
      { label: 'UK CMA：Writing a fair contract for customers', url: 'https://www.gov.uk/guidance/writing-a-fair-contract-for-customers' },
      { label: 'GOV.UK：Online and distance selling', url: 'https://www.gov.uk/online-and-distance-selling-for-businesses/online-selling' },
      { label: 'UK CMA：Selling goods and services — consumer law', url: 'https://www.gov.uk/guidance/selling-products-and-services-complying-with-consumer-protection-law' },
    ],
    content: `服务条款最危险的复制方式，是从一个看起来专业的大公司网站整页搬过来。

那家公司可能卖年费订阅，你卖一次性下载；它支持 30 天退款，你的数字内容交付规则不同；它在美国经营，你在英国或中国；它可以随时停掉企业 API，你甚至没有 API。

复制以后，文案看起来正式，真实交易规则却完全对不上。

不同市场的消费者保护要求会不同，正式法律文件应根据运营主体和目标地区确认。产品团队先要做的是把商业事实写准确。

## 条款应该从购买流程反推

先把一个用户从定价页走到离开的全过程列出来。

他买的是所有权、使用权还是一段期限内的服务？价格含税吗？自动续费吗？什么时候扣下一期？取消是立即失效还是到周期末？退款规则是什么？服务失败怎么办？账号被关闭以后已购买权益怎样处理？

这些问题必须先在产品和后台有答案，条款才能写。

## “我们可以随时做任何事”不是好条款

英国 CMA 2026 年更新的公平合同指导强调消费者条款要公平、透明。把所有风险都单方面甩给用户，并不会因为写进 Terms 就自动有效。

对小产品来说，更实际的做法是少写虚张声势的免责，多写用户真正需要预判的事情：服务范围、价格、续费、取消、退款、可接受使用、账户处理、知识产权、联系方式。

能用普通语言说明，就不要故意堆法律腔。

## 页面和条款必须说同一件事

定价页写“一次性买断”，Terms 却从模板留下“subscription renews automatically”，这是非常低级但常见的错误。

退款页写 7 天，支付弹窗写“不退款”，客服又按 14 天处理，同样会制造纠纷。

所以 Terms 不应该由一个孤立文档维护。收费模型、产品配置、退款政策、账户生命周期发生变化时，要有一张发布清单提醒同步检查法律页面。

## 数字服务尤其要把交付说清楚

GOV.UK 面向在线销售的指导要求经营者提供商品、服务或数字内容的描述、总价或计算方式、合同期限及滚动合同结束条件等信息。

这提醒独立开发者：不要只写按钮上的 `$9/month`。用户需要知道买到什么、多久一次、怎样结束。

AI 服务还要说明更特殊的边界：结果是否保证准确？专业领域有什么限制？未成功生成时怎么处理次数或费用？这些规则如果影响购买决定，应该在购买前就能找到，而不是出问题后才拿 Terms 解释。

## 一个最简单的同步机制

维护一张“商业事实表”：运营主体、产品、价格、计费方式、交付时点、自动续费、取消、退款、数据删除、客服邮箱、主要第三方。

Privacy、Terms、Refund、Pricing 和代码都从这组事实核对。

条款最重要的品质不是长，而是和你真的怎么做生意一致。`
  },
  {
    id: 'academy-operations-erasure',
    slug: 'account-deletion-is-not-delete-user-row',
    title: '“删除账号”不是删一行 users：先决定哪些数据要删、哪些要保留、备份怎么办',
    summary: '账号、内容、日志、支付、发票、客服和备份往往分散在不同系统。删除功能要先建立数据地图，并区分可以立即擦除的个人数据与有合法保留理由的记录。',
    category: 'operations',
    series: '经营手册',
    created_at: publishedAt,
    updated_at: publishedAt,
    view_count: 0,
    author: { username: '小概率编辑部' },
    sources: [
      { label: 'ICO：Right to erasure', url: 'https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/individual-rights/right-to-erasure/' },
      { label: 'ICO：How to write a privacy notice', url: 'https://ico.org.uk/for-organisations/advice-for-small-organisations/privacy-notices-and-cookies/how-to-write-a-privacy-notice-and-what-goes-in-it/' },
    ],
    content: `产品里加一个“Delete account”按钮很简单，真正执行删除通常不简单。

一个用户可能同时存在于认证 Provider、profiles 表、项目表、对象存储、邮件列表、分析系统、客服工单和支付记录里。只删除 `users` 主表，既可能留下大量孤儿个人数据，也可能把订单外键弄坏。

## 先区分“账号身份”和“业务记录”

认证账户负责登录，用户创建的内容属于业务数据，付款和退款又属于财务事实。三类数据生命周期未必相同。

例如用户要求删除个人资料和公开内容时，某些支付或税务记录可能仍需要因为法律、会计或争议处理理由保留。具体保留义务取决于地区和业务，不能用一条通用规则处理。

ICO 对英国数据保护的说明也明确指出，删除权并不是绝对权利；在某些法律义务、法律请求等情况下可能存在例外。

## 数据地图决定删除范围

实现按钮前，把与 `user_id`、email、phone、provider subject 相关的存储全部找出来。

每一项标记：立即删除、匿名化、按保留期继续保存、需要第三方同步删除、进入备份淘汰周期。

如果用户上传了文件，还要检查对象存储；如果内容发给过第三方 AI 或邮件服务，确认供应商侧可执行什么删除动作，而不是只清自己的数据库。

## 备份是最容易忘记的一层

ICO 的 erasure 指导专门讨论了 backup。有效删除请求可能需要覆盖备份环境，但技术上未必能立刻从每个不可变备份里抽出单个用户删除。

一种常见处理是让数据在备份保留周期后被覆盖，并确保这段时间处于 beyond use 状态，不再被正常业务使用。实际做法仍应结合你的备份机制和适用规则。

关键是隐私说明不要承诺“点击后所有副本瞬间消失”，如果系统根本做不到。

## 删除任务需要可恢复

跨多个 Provider 删除很容易半成功。

数据库删了，邮件服务 API 超时；对象存储成功，认证 Provider 失败。若按钮请求本身承担全部工作，用户看到一个 500，却不知道已经删到哪里。

更稳的设计是创建持久化 deletion job，记录每个阶段状态，失败可重试；在任务完成后再关闭登录能力或按设计冻结账户，避免删除过程中继续产生新数据。

## 匿名化有时比硬删除更适合历史记录

例如订单必须保留，但没必要一直关联用户昵称和头像，可以把非必要个人字段移除，保留订单编号、金额、时间等必要事实。

匿名化必须是真的无法再合理识别个人，而不是把 email 换成 hash 就宣称完全匿名。

## 删除功能也是一次架构体检

如果你无法回答“一个用户的数据到底在哪里”，说明隐私政策、备份和供应商管理也很可能不清楚。

因此账号删除不该等到用户投诉才补。产品一旦开始长期存用户数据，就应该提前设计生命周期：怎么创建、怎么更新、保存多久、怎么结束。

一条 DELETE SQL 只是其中一步。`
  },
  {
    id: 'academy-operations-subscription',
    slug: 'subscription-is-a-state-machine-not-a-boolean',
    title: '订阅不是一个 isPro 布尔值：续费失败、取消和恢复都会把状态变复杂',
    summary: '订阅系统如果只存“是否会员”，很快会遇到现实：用户已取消但本周期仍有效、扣款失败进入宽限期、恢复订阅、退款和 Provider 回调重复。',
    category: 'operations',
    series: '经营手册',
    created_at: publishedAt,
    updated_at: publishedAt,
    view_count: 0,
    author: { username: '小概率编辑部' },
    sources: [
      { label: 'Stripe：Subscriptions overview', url: 'https://docs.stripe.com/billing/subscriptions/overview' },
      { label: 'Stripe：Webhooks', url: 'https://docs.stripe.com/webhooks' },
    ],
    content: `第一次做订阅，数据库里很容易出现一个字段：` + '`is_pro boolean`' + `。

付款成功就设成 true，用户取消就改成 false。这个模型在 Demo 里够用，接到真实账单以后很快会崩。

因为“取消”本身就有至少两种含义：立即终止，或本周期结束后不再续费。第二种情况下，用户已经点了取消，但权益还应该继续到 paid-through date。

## 订阅至少同时存在几个事实

Provider 有自己的 subscription id 和状态；本地有当前套餐；有当前计费周期开始和结束；有是否计划在周期末取消；还有实际权益什么时候失效。

这些事实相关，但不是同一个字段。

Stripe 的订阅文档本身就有 trialing、active、past_due、canceled 等生命周期状态。支付失败以后还可能根据重试和业务策略继续一段时间，而不是瞬间踢出产品。

## Webhook 才能补齐异步变化

用户可能不在你的网站里取消，而是在支付 Provider 的客户门户操作；续费失败发生在凌晨；银行几小时后更新支付结果。

这些都不会经过你的“取消按钮”。本地状态必须能够根据签名 webhook 或服务端同步更新。

同一个 webhook 还可能被重试，因此订阅状态更新也需要幂等，不能每收到一次 `invoice.paid` 就重复发一份月度权益。

## 取消和恢复要定义清楚

如果用户选择“周期末取消”，本地可以记录 cancel_at_period_end，但当前权益仍然 active。用户第二天后悔，又点恢复，则需要撤销未来取消计划，而不是新建第二个订阅。

如果用户已经进入真正 canceled 的终态，再回来购买，可能才是新订阅。

这就是为什么一个 `is_pro` 无法表达生命周期。

## 续费失败需要业务策略

支付失败以后立刻停服务最简单，但不一定合理；给三天或七天宽限又会增加状态复杂度。

无论选哪种，都要把规则写死：宽限从哪个时间开始，重复失败会不会不断延长，成功补款以后怎样恢复，最终什么时候关闭权益。

这些规则应该由本地持久化，而不是临时根据“当前时间 - webhook 时间”猜。

## 退款也不是简单反转

一个用户已经使用了半个月、消费了附带积分，再发生部分退款，权益如何变化需要产品政策。Provider 只知道退多少钱，不知道你的功能应该撤掉多少。

不要让财务事件直接修改一个布尔值，要经过业务规则层。

## 订阅上线前画一张状态图

至少画出：创建、试用、激活、续费成功、续费失败、宽限、周期末取消、恢复、立即取消、退款、终止。

再给每条箭头写触发来源：用户操作、后台操作、Provider webhook、定时任务。

能画清这张图，代码才有稳定模型。

订阅的难点从来不是“每月扣一次钱”，而是用户和支付系统都可能在任何一天改变下一步。`
  },
]
