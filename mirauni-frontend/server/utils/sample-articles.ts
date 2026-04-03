export interface SampleArticle {
  id: string
  slug: string
  title: string
  summary: string
  category: string
  cover_url: string
  content: string
  created_at: string
  updated_at: string
  view_count: number
  status: 'published'
  author: {
    username: string
    avatar_url: string
  }
}

const now = '2026-04-02T00:00:00.000Z'
const author = {
  username: '小概率编辑部',
  avatar_url: ''
}

export const SAMPLE_ARTICLES: SampleArticle[] = [
  {
    id: 'demo-article-01',
    slug: 'ruhe-zhaodao-kaopu-jishu-hehuoren',
    title: '如何找到靠谱的技术合伙人',
    summary: '从项目准备、筛选标准到试合作机制，系统讲清“怎么找到靠谱技术合伙人”。',
    category: 'content',
    cover_url: '',
    content: `大多数创业者找不到技术合伙人，不是因为没人，而是招募信息不清楚。\n\n第一步先把三件事写清楚：你要解决什么用户问题、当前项目进度到哪里、加入后 30 天要完成什么。技术合伙人最怕“概念很多、落地很少”，所以你越具体，回复率越高。\n\n第二步建立筛选标准。建议至少看四项：过往真实交付案例、是否能独立拆解需求、沟通是否稳定、对合作方式是否坦诚。不要只看“技术栈匹配”，更要看“共事成本”。\n\n第三步设计试合作。先做 1-2 周小目标，例如完成一个关键页面、一个 API 流程或一次上线部署。试合作阶段重点观察：节奏感、责任心、问题暴露后的处理方式。\n\n最后，招募文案里请明确写出合作方式（股权/分成/薪酬）、投入时间预期和阶段目标。技术合伙人不是外包，双方都需要确定性。`,
    created_at: now,
    updated_at: now,
    view_count: 0,
    status: 'published',
    author
  },
  {
    id: 'demo-article-02',
    slug: 'chuangye-zaoqi-zhaomu-chengxuyuan-hehuoren',
    title: '创业早期怎么招募程序员合伙人',
    summary: '冷启动阶段最有效的招募流程：定位角色、定义产出、快速试跑。',
    category: 'saas',
    cover_url: '',
    content: `创业早期招募程序员合伙人，核心不是“画大饼”，而是“给可执行的阶段任务”。\n\n建议先定义角色：你需要的是前端、后端还是全栈？每个角色的首月交付物分别是什么？例如前端角色的首月目标可以是核心页面和埋点体系，后端角色可以是账号、权限和支付主链路。\n\n然后准备招募材料：一页项目概览（用户是谁、痛点是什么、现有验证结果）、一页合作方案（投入时间、分工边界、激励机制）、一页里程碑（30/60/90 天）。\n\n沟通阶段建议分三轮：第一轮看方向认同，第二轮看技术判断，第三轮看执行习惯。每轮只问能验证合作质量的问题，避免空泛聊天。\n\n最后别跳过试合作。先跑一个真实需求，再决定长期绑定。这样不仅降低双方风险，也能快速判断节奏是否一致。`,
    created_at: now,
    updated_at: now,
    view_count: 0,
    status: 'published',
    author
  },
  {
    id: 'demo-article-03',
    slug: 'jishu-hehuoren-zuikanzhong-shenme',
    title: '技术合伙人最看重项目方什么',
    summary: '技术合伙人真正关心的是方向清晰、执行稳定和合作规则透明。',
    category: 'content',
    cover_url: '',
    content: `很多项目方以为技术合伙人最看重“估值故事”，但实际更看重三件事：\n\n1. 项目是否清晰。包括目标用户、核心场景、竞争替代方案。\n2. 发起人是否靠谱。能否稳定推进、是否愿意承担非技术工作。\n3. 规则是否透明。股权/分成如何计算，退出机制是什么。\n\n如果你想提升招募成功率，请把“我是谁、我做了什么、下一步做什么”写具体。比如：已完成 20 位用户访谈、已有 3 位付费意向、下月目标是上线 MVP 并拿到首批留存数据。\n\n技术合伙人不会因为一句“赛道很大”加入，而会因为“你已经把困难拆开且持续推进”而加入。`,
    created_at: now,
    updated_at: now,
    view_count: 0,
    status: 'published',
    author
  },
  {
    id: 'demo-article-04',
    slug: 'zhaojishu-hehuoren-bp-zenmexie',
    title: '找技术合伙人时 BP 要怎么写',
    summary: 'BP 不是融资材料，而是招募合伙人的协作说明书。',
    category: 'saas',
    cover_url: '',
    content: `招募技术合伙人的 BP，建议控制在 8-12 页，重点不是“宏大叙事”，而是“合作可执行”。\n\n建议结构：\n1. 用户问题与场景：谁在痛、现在怎么解决、为什么现有方案不够好。\n2. 当前进展：原型、访谈、内测、留存、付费意向。\n3. 产品路线：30/60/90 天里程碑。\n4. 技术角色需求：要招什么角色、负责哪些模块、优先级如何。\n5. 合作条款：投入时长、激励方式、决策机制。\n\nBP 最有价值的是让对方快速判断“是否值得投入”。如果对方看完依旧不清楚第一周做什么，说明你还需要继续打磨。`,
    created_at: now,
    updated_at: now,
    view_count: 0,
    status: 'published',
    author
  },
  {
    id: 'demo-article-05',
    slug: 'zhaomu-jishu-hehuoren-qige-keng',
    title: '招募技术合伙人最常见的 7 个坑',
    summary: '避开七个高频错误，能显著提升技术合伙人回复率和留存率。',
    category: 'content',
    cover_url: '',
    content: `常见七个坑：\n\n第一，只写愿景不写任务。\n第二，只写“找大牛”不写角色边界。\n第三，不写合作方式。\n第四，不披露项目阶段。\n第五，把合伙人当外包。\n第六，沟通节奏混乱。\n第七，没有试合作机制。\n\n每个坑背后都是同一个问题：信息不对称。\n\n解决方案很简单：用结构化项目页替代情绪化招募帖。明确目标、阶段、角色、技能、合作方式、首月里程碑，再补充你能提供的资源和承诺。只要信息完整，哪怕项目还在早期，也能吸引到匹配的人。`,
    created_at: now,
    updated_at: now,
    view_count: 0,
    status: 'published',
    author
  },
  {
    id: 'demo-article-06',
    slug: 'guquan-fencheng-xinzi-hezuo-fangan',
    title: '股权、分成、薪资：技术合伙人合作方式怎么定',
    summary: '三种合作模式的适用阶段、优缺点和落地建议。',
    category: 'saas',
    cover_url: '',
    content: `合作方式没有绝对最优，只有阶段匹配。\n\n股权合作适合长期共建、风险共担的早期项目；分成合作适合短中期业务闭环明确的项目；薪资合作适合目标明确且现金流可预期的团队。\n\n建议做组合设计：基础保障 + 激励增量。例如“基础薪资 + 里程碑奖金”或“小比例股权 + 分成”。这样既保证投入稳定，也能把结果绑定到共同目标。\n\n无论选哪种模式，都应提前约定：投入时长、交付标准、归属权、退出机制。把规则写在前面，能减少后期误解。`,
    created_at: now,
    updated_at: now,
    view_count: 0,
    status: 'published',
    author
  },
  {
    id: 'demo-article-07',
    slug: 'ai-xiangmu-ruhe-zhao-jishu-hehuoren',
    title: 'AI 项目怎么找到合适的技术合伙人',
    summary: 'AI 项目招募的关键不是“会 AI”，而是“能把 AI 做成产品”。',
    category: 'ai',
    cover_url: '',
    content: `AI 项目招募最容易踩的坑，是把职位要求写成“会大模型即可”。\n\n真正重要的是三种能力：\n1. 工程化能力：把模型能力接进稳定产品。\n2. 业务理解能力：知道用户为什么用、何时付费。\n3. 数据闭环能力：能持续优化效果，而不是一次性演示。\n\n建议在招募信息里明确：现有模型方案、目标用户场景、可衡量指标（如转化率、留存率、人工替代比例）。\n\n如果你能把“技术问题”翻译成“业务结果”，更容易吸引到愿意长期共建的 AI 技术合伙人。`,
    created_at: now,
    updated_at: now,
    view_count: 0,
    status: 'published',
    author
  },
  {
    id: 'demo-article-08',
    slug: 'feijishu-beijing-ruhe-qidong-zhaomu',
    title: '没有技术背景，怎么启动第一个技术合伙人招募',
    summary: '非技术创始人也能招到合适技术合伙人，关键在准备度和沟通方式。',
    category: 'content',
    cover_url: '',
    content: `没有技术背景并不等于招不到技术合伙人。问题通常出在准备不足。\n\n你至少要准备三样：\n1. 用户问题文档：目标用户、核心痛点、典型场景。\n2. 产品草图：关键流程图或低保真原型。\n3. 验证证据：访谈记录、测试反馈、潜在付费意向。\n\n沟通时，不要硬聊技术细节，重点聊业务理解、优先级判断、合作节奏和里程碑。技术实现细节可以让对方主导，但方向和目标必须由你负责。\n\n招募不是“找人替你做”，而是“找到愿意和你共担风险的人”。`,
    created_at: now,
    updated_at: now,
    view_count: 0,
    status: 'published',
    author
  },
  {
    id: 'demo-article-09',
    slug: 'weishenme-zhaomu-tie-meiren-hui',
    title: '为什么很多技术合伙人招募帖没人回',
    summary: '没有回复通常不是没人看，而是信息不完整、信任不足、行动门槛太高。',
    category: 'content',
    cover_url: '',
    content: `招募帖没人回，常见原因有三类：\n\n信息问题：只写“找技术合伙人”，没有项目阶段、角色职责、合作方式。\n信任问题：没有任何已完成动作，难以判断项目真实度。\n行动问题：联系方式不清、下一步流程不明确。\n\n优化建议：标题写场景词（例如“AI SaaS 项目招募前端技术合伙人”），正文按“背景-进度-需求-合作-下一步”结构展开，最后提供明确行动按钮。\n\n当你把信息密度和确定性提高后，回复率通常会明显改善。`,
    created_at: now,
    updated_at: now,
    view_count: 0,
    status: 'published',
    author
  },
  {
    id: 'demo-article-10',
    slug: 'jishu-hehuoren-zhaomu-xiangmuxie-shenme',
    title: '找技术合伙人时，项目页应该写什么',
    summary: '一页高质量项目页应覆盖背景、阶段、角色、合作与里程碑五部分。',
    category: 'saas',
    cover_url: '',
    content: `一个高转化项目页，至少要写清五部分：\n\n项目背景：你要解决的真实问题是什么。\n当前阶段：原型、内测、付费验证走到哪一步。\n招募角色：需要谁、负责什么、希望具备哪些技能。\n合作方式：股权、分成、薪资如何设计。\n里程碑：加入后 30 天、60 天、90 天要达成什么。\n\n建议避免空话，例如“赛道很大”“机会无限”。技术合伙人更在意“你是否能推进”和“我加入后是否能快速产出价值”。\n\n把这些写透，项目页就是最好的筛选器。`,
    created_at: now,
    updated_at: now,
    view_count: 0,
    status: 'published',
    author
  },
  {
    id: 'demo-article-11',
    slug: 'jiaru-qian-zui-guanxin-10-ge-wenti',
    title: '技术合伙人加入前最关心的 10 个问题',
    summary: '提前回答这 10 个关键问题，能显著降低沟通成本。',
    category: 'content',
    cover_url: '',
    content: `技术合伙人加入前最关心的问题通常包括：\n\n1. 项目现在到什么阶段？\n2. 用户和市场验证做了多少？\n3. 我负责哪些模块？\n4. 决策机制是怎样的？\n5. 每周投入时间要求是多少？\n6. 合作方式怎么定？\n7. 失败或退出机制是什么？\n8. 知识产权归属如何处理？\n9. 第一阶段目标是什么？\n10. 团队目前最大的风险是什么？\n\n如果项目方能在页面里提前回答这些问题，双方沟通会更高效，也更容易建立信任。`,
    created_at: now,
    updated_at: now,
    view_count: 0,
    status: 'published',
    author
  },
  {
    id: 'demo-article-12',
    slug: 'chuangyezhe-qunar-zhao-jishu-hehuoren',
    title: '创业者应该去哪里找技术合伙人',
    summary: '平台、社群、熟人转介绍都有效，但要用统一筛选流程做质量控制。',
    category: 'content',
    cover_url: '',
    content: `找技术合伙人的渠道主要有三类：\n\n平台渠道：效率高、覆盖广，适合快速触达。\n垂直社群：沟通深度高，适合长期协作筛选。\n熟人转介绍：信任成本低，但样本有限。\n\n无论来自哪个渠道，都建议使用同一套筛选流程：先看项目匹配，再看执行能力，最后看合作稳定性。\n\n渠道只是入口，成功关键在“你是否准备好可执行的项目资料”和“是否有稳定推进能力”。把这两件事做好，你会更快遇到合适的技术合伙人。`,
    created_at: now,
    updated_at: now,
    view_count: 0,
    status: 'published',
    author
  }
]

export function getSampleArticleBySlug(slug: string) {
  return SAMPLE_ARTICLES.find((item) => item.slug === slug)
}

export function listSampleArticles(params: {
  category?: string
}) {
  const { category } = params
  return SAMPLE_ARTICLES.filter((item) => {
    if (category && category !== 'all' && item.category !== category) return false
    return true
  })
}
