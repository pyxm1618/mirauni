export interface SampleProject {
  id: string
  user_id: string
  title: string
  summary: string
  category: string
  roles_needed: string[]
  skills_required: string[]
  work_mode: 'remote' | 'onsite' | 'hybrid'
  cooperation_type: 'equity' | 'salary' | 'revenue_share' | 'volunteer'
  description: string
  description_visible: boolean
  background: string
  background_visible: boolean
  vision: string
  vision_visible: boolean
  team_info: string
  team_visible: boolean
  demo_url: string
  demo_visible: boolean
  status: 'active'
  view_count: number
  created_at: string
  updated_at: string
  users: {
    id: string
    username: string
    avatar_url: string
    bio: string
    profession: string
    position: string
    location: string
    skills: string[]
    experience_years: number
    work_preference: string
  }
}

const now = '2026-04-02T00:00:00.000Z'
const demoUserId = '00000000-0000-0000-0000-000000000001'

export const SAMPLE_PROJECTS: SampleProject[] = [
  {
    id: 'demo-ai-saas-frontend',
    user_id: demoUserId,
    title: 'AI SaaS 项目招募前端技术合伙人',
    summary: '我们在做面向中小团队的 AI 协作 SaaS，核心能力已跑通，现招募前端技术合伙人共建产品化体验。',
    category: 'ai',
    roles_needed: ['frontend'],
    skills_required: ['vue', 'typescript', 'ai'],
    work_mode: 'remote',
    cooperation_type: 'equity',
    description: '项目目标是帮助 10-50 人团队在一套工作流里完成 AI 需求拆解、提示词协作和执行复盘。当前已完成 MVP 原型和 3 家种子用户访谈，下一阶段要上线首版可用产品。我们希望你主导前端工程、交互体验和性能优化，一起把产品从“能演示”做成“能留存”。',
    description_visible: true,
    background: '我们团队来自 B 端 SaaS 和 AI 应用背景，做过企业协作与自动化工具。当前最大瓶颈是前端体验与工作流细节。',
    background_visible: true,
    vision: '做中国团队最好用的 AI 协作台，让中小团队也能低成本获得大厂级流程能力。',
    vision_visible: true,
    team_info: '目前 3 人：产品 1 人、后端/AI 1 人、增长 1 人。希望新增 1 名前端技术合伙人。',
    team_visible: true,
    demo_url: 'https://mirauni.com/projects/demo-ai-saas-frontend',
    demo_visible: true,
    status: 'active',
    view_count: 0,
    created_at: now,
    updated_at: now,
    users: {
      id: demoUserId,
      username: '示例项目方',
      avatar_url: '',
      bio: '平台演示账号，用于展示项目招募样板页。',
      profession: '产品负责人',
      position: '联合创始人',
      location: '北京',
      skills: ['product', 'operation'],
      experience_years: 8,
      work_preference: 'fulltime'
    }
  },
  {
    id: 'demo-ai-tool-fullstack',
    user_id: demoUserId,
    title: 'AI 工具项目招募全栈技术合伙人',
    summary: '面向内容创作者的 AI 自动化工具，已验证付费意愿，现招募全栈合伙人冲刺商业化。',
    category: 'ai',
    roles_needed: ['fullstack'],
    skills_required: ['nodejs', 'typescript', 'postgresql'],
    work_mode: 'remote',
    cooperation_type: 'revenue_share',
    description: '我们已经完成核心流程验证，用户可以通过模板批量生产可发布内容，当前有 80+ 内测用户，周活超过 35%。下一步要做稳定的账号体系、计费和多人协作模块。你将参与技术架构、交付节奏和关键功能决策，适合希望快速参与商业闭环的全栈伙伴。',
    description_visible: true,
    background: '创始人过去做过内容增长和自动化产品，已拿到第一批种子用户与早期付费反馈。',
    background_visible: true,
    vision: '把复杂的 AI 生产流程变成普通创作者可直接使用的“开箱即用型工具”。',
    vision_visible: true,
    team_info: '当前 2 人，分别负责产品增长与后端。希望引入 1 名全栈合伙人共担研发。',
    team_visible: true,
    demo_url: 'https://mirauni.com/projects/demo-ai-tool-fullstack',
    demo_visible: true,
    status: 'active',
    view_count: 0,
    created_at: now,
    updated_at: now,
    users: {
      id: demoUserId,
      username: '示例项目方',
      avatar_url: '',
      bio: '平台演示账号，用于展示项目招募样板页。',
      profession: '产品负责人',
      position: '联合创始人',
      location: '上海',
      skills: ['product', 'growth'],
      experience_years: 6,
      work_preference: 'fulltime'
    }
  },
  {
    id: 'demo-content-community-backend',
    user_id: demoUserId,
    title: '内容社区项目招募后端技术合伙人',
    summary: '垂直创作者社区正在启动，已有明确用户群，现招募后端合伙人搭建稳定的内容和互动系统。',
    category: 'content',
    roles_needed: ['backend'],
    skills_required: ['nodejs', 'redis', 'postgresql'],
    work_mode: 'hybrid',
    cooperation_type: 'equity',
    description: '目标用户是独立开发者和技术创作者，核心需求是高质量内容沉淀和高效互动。项目已完成产品原型和内容策略，接下来重点是用户系统、内容推荐、消息通知和风控。希望你有高并发接口设计与数据建模经验，愿意从 0 到 1 参与长期建设。',
    description_visible: true,
    background: '我们有稳定的行业社群资源，启动期就能拿到首批高质量内容供给。',
    background_visible: true,
    vision: '成为中文独立开发者最实用的内容与合作社区。',
    vision_visible: true,
    team_info: '当前 3 人（产品、运营、前端），招募 1 名后端技术合伙人。',
    team_visible: true,
    demo_url: 'https://mirauni.com/projects/demo-content-community-backend',
    demo_visible: true,
    status: 'active',
    view_count: 0,
    created_at: now,
    updated_at: now,
    users: {
      id: demoUserId,
      username: '示例项目方',
      avatar_url: '',
      bio: '平台演示账号，用于展示项目招募样板页。',
      profession: '内容产品负责人',
      position: '联合创始人',
      location: '广州',
      skills: ['content', 'operation'],
      experience_years: 7,
      work_preference: 'fulltime'
    }
  },
  {
    id: 'demo-app-flutter',
    user_id: demoUserId,
    title: 'App 项目招募 Flutter 技术合伙人',
    summary: '消费级工具 App 已完成核心交互设计，正在冲刺双端上线，招募 Flutter 技术合伙人。',
    category: 'app',
    roles_needed: ['mobile'],
    skills_required: ['flutter', 'dart', 'supabase'],
    work_mode: 'remote',
    cooperation_type: 'equity',
    description: '我们正在做一款面向自由职业者的效率 App，目标是帮助用户把碎片时间转化为可追踪的成果。产品侧已完成完整原型和用户测试，当前需要 Flutter 合伙人主导工程落地、性能优化和版本发布。你将直接参与产品策略与路线图制定。',
    description_visible: true,
    background: '团队有产品与增长经验，缺少移动端核心研发。',
    background_visible: true,
    vision: '做国内自由职业者高频使用的效率工具。',
    vision_visible: true,
    team_info: '2 人团队，招募 1 名 Flutter 技术合伙人。',
    team_visible: true,
    demo_url: 'https://mirauni.com/projects/demo-app-flutter',
    demo_visible: true,
    status: 'active',
    view_count: 0,
    created_at: now,
    updated_at: now,
    users: {
      id: demoUserId,
      username: '示例项目方',
      avatar_url: '',
      bio: '平台演示账号，用于展示项目招募样板页。',
      profession: '移动产品负责人',
      position: '发起人',
      location: '深圳',
      skills: ['product', 'growth'],
      experience_years: 5,
      work_preference: 'fulltime'
    }
  },
  {
    id: 'demo-crossborder-tool',
    user_id: demoUserId,
    title: '跨境电商工具项目招募技术合伙人',
    summary: '跨境卖家数据工具进入内测阶段，目标明确，招募技术合伙人一起搭建稳定的数据产品。',
    category: 'ecommerce',
    roles_needed: ['fullstack', 'backend'],
    skills_required: ['python', 'nodejs', 'mysql'],
    work_mode: 'hybrid',
    cooperation_type: 'revenue_share',
    description: '项目定位是给跨境卖家提供选品、竞品监控和利润分析服务，已拿到首批意向客户。接下来要做数据采集、报表引擎和账号体系。我们期待你能设计可扩展的数据链路，并一起打磨可持续的商业模型。',
    description_visible: true,
    background: '创始团队在跨境行业有多年从业经验，业务理解清晰。',
    background_visible: true,
    vision: '成为中小跨境卖家最值得信赖的数据助手。',
    vision_visible: true,
    team_info: '当前 2 人（业务 + 产品），招募 1 名技术合伙人。',
    team_visible: true,
    demo_url: 'https://mirauni.com/projects/demo-crossborder-tool',
    demo_visible: true,
    status: 'active',
    view_count: 0,
    created_at: now,
    updated_at: now,
    users: {
      id: demoUserId,
      username: '示例项目方',
      avatar_url: '',
      bio: '平台演示账号，用于展示项目招募样板页。',
      profession: '跨境业务负责人',
      position: '联合创始人',
      location: '杭州',
      skills: ['operation', 'sales'],
      experience_years: 9,
      work_preference: 'fulltime'
    }
  },
  {
    id: 'demo-indie-devtool',
    user_id: demoUserId,
    title: '独立开发工具项目招募联合开发者',
    summary: '我们正在做独立开发者增长工具，已完成方向验证，想找能一起长期迭代的联合开发者。',
    category: 'saas',
    roles_needed: ['backend', 'frontend'],
    skills_required: ['vue', 'golang', 'postgresql'],
    work_mode: 'remote',
    cooperation_type: 'equity',
    description: '产品聚焦独立开发者常见难题：流量监控、用户反馈、转化追踪，目标是一套工具打通“发布到增长”全流程。你将参与架构设计、功能拆解、版本节奏与数据指标定义。适合希望从“接需求”走向“共创产品”的技术伙伴。',
    description_visible: true,
    background: '发起人有多次独立开发上线经验，理解从 0 到 1 的真实痛点。',
    background_visible: true,
    vision: '做独立开发者最懂业务的增长工具。',
    vision_visible: true,
    team_info: '当前 1 名发起人，招募 1-2 名联合开发者。',
    team_visible: true,
    demo_url: 'https://mirauni.com/projects/demo-indie-devtool',
    demo_visible: true,
    status: 'active',
    view_count: 0,
    created_at: now,
    updated_at: now,
    users: {
      id: demoUserId,
      username: '示例项目方',
      avatar_url: '',
      bio: '平台演示账号，用于展示项目招募样板页。',
      profession: '独立开发者',
      position: '发起人',
      location: '成都',
      skills: ['product', 'backend'],
      experience_years: 7,
      work_preference: 'parttime'
    }
  }
]

export function getSampleProjectById(id: string) {
  return SAMPLE_PROJECTS.find((item) => item.id === id)
}

export function filterSampleProjects(params: {
  category?: string
  role?: string
  work_mode?: string
  keyword?: string
}) {
  const { category, role, work_mode, keyword } = params
  return SAMPLE_PROJECTS.filter((item) => {
    if (category && item.category !== category) return false
    if (work_mode && item.work_mode !== work_mode) return false
    if (role && !item.roles_needed.includes(role)) return false
    if (keyword) {
      const q = keyword.toLowerCase()
      const text = `${item.title} ${item.summary}`.toLowerCase()
      if (!text.includes(q)) return false
    }
    return true
  })
}
