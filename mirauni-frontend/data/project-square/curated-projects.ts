import type { ProjectIndustry } from '~/types'

export interface CuratedProjectSeed {
  id: string
  title: string
  summary: string
  category: 'saas' | 'app' | 'game' | 'ai' | 'ecommerce' | 'content' | 'hardware' | 'other'
  industry: ProjectIndustry
  listing_type: 'curated'
  is_recruiting: false
  roles_needed: string[]
  skills_required: string[]
  work_mode: null
  cooperation_type: null
  description: string
  demo_url: string
  source_repo: string
  source_url: string
  curation_rank: number
  curated_meta: {
    features: string[]
    editorial_reason: string
    tech_stack: string[]
    license: string
    official_url?: string
    source_label: string
  }
}

export const CURATED_PROJECTS: CuratedProjectSeed[] = [
  {
    id: 'd9e2b8f1-0c61-4a5d-8d65-3c79f6a20101',
    title: 'Hisabi',
    summary: '可以从短信中识别银行交易的自托管个人财务工具，把记账、分析和 AI 财务助手放到一个产品里。',
    category: 'saas',
    industry: 'finance',
    listing_type: 'curated',
    is_recruiting: false,
    roles_needed: [], skills_required: [], work_mode: null, cooperation_type: null,
    description: 'Hisabi 是一个开源、自托管的个人财务管理 Web 应用。它的产品重点不是再做一个手工记账本，而是从银行交易短信中自动识别交易，再把这些记录组织成报表、可视化和可查询的财务数据。项目同时提供 HisabAI，用 AI 辅助理解个人资金情况；因为可以自行部署，用户也能把核心财务数据留在自己的基础设施中。',
    demo_url: 'https://hisabi.saleem.dev',
    source_repo: 'hisabi-app/hisabi',
    source_url: 'https://github.com/hisabi-app/hisabi',
    curation_rank: 1,
    curated_meta: {
      features: ['短信交易解析与自动识别', '个人财务报表和数据可视化', 'HisabAI 财务助手', '支持自托管并掌握自己的数据'],
      editorial_reason: '值得看的不是“又一个记账工具”，而是它把短信识别、自托管和 AI 财务理解组合成了边界很清晰的个人产品。',
      tech_stack: ['PHP', 'Laravel', 'GraphQL', 'MySQL'],
      license: 'MIT',
      official_url: 'https://hisabi.saleem.dev',
      source_label: 'GitHub README'
    }
  },
  {
    id: 'd9e2b8f1-0c61-4a5d-8d65-3c79f6a20102',
    title: 'Table Habit',
    summary: '不只计算连续打卡，而用长期评分和成长曲线衡量习惯，并支持跨平台离线使用与 WebDAV 同步。',
    category: 'app',
    industry: 'productivity',
    listing_type: 'curated', is_recruiting: false,
    roles_needed: [], skills_required: [], work_mode: null, cooperation_type: null,
    description: 'Table Habit 是一个免费开源的跨平台习惯追踪工具，覆盖 Android、iOS、macOS、Windows 和 Linux。它用一套“Smart Scoring”长期评分来衡量习惯稳定性，而不是只强调连续多少天没有中断。应用可以完全离线运行，不要求注册账号，也不依赖自有云；需要跨设备时，可以通过 WebDAV 同步到 Nextcloud、Koofr 或用户自己的服务器。',
    demo_url: 'https://github.com/FriesI23/mhabit',
    source_repo: 'FriesI23/mhabit', source_url: 'https://github.com/FriesI23/mhabit', curation_rank: 2,
    curated_meta: {
      features: ['长期习惯评分和成长曲线', 'Android/iOS/macOS/Windows/Linux 跨平台', 'WebDAV 跨设备同步', '无需账号、无广告、离线优先'],
      editorial_reason: '它把一个非常普通的习惯赛道做出了产品主张：不把“连续打卡”当唯一指标，而是围绕长期一致性设计评分和数据所有权。',
      tech_stack: ['Flutter', 'Dart', 'SQLite'], license: 'Apache-2.0', official_url: 'https://github.com/FriesI23/mhabit', source_label: 'GitHub README'
    }
  },
  {
    id: 'd9e2b8f1-0c61-4a5d-8d65-3c79f6a20103',
    title: 'Tempus',
    summary: '为自托管音乐库设计的轻量 Android Subsonic 客户端，让自己的音乐服务有一个更原生的移动入口。',
    category: 'app', industry: 'entertainment', listing_type: 'curated', is_recruiting: false,
    roles_needed: [], skills_required: [], work_mode: null, cooperation_type: null,
    description: 'Tempus 是一个面向 Android 的开源音乐客户端，核心使用场景是连接用户自己的 Subsonic 兼容音乐服务。与把音乐全部托管在大型流媒体平台不同，这类产品服务的是已经维护私人音乐库、自建媒体服务器的人。Tempus 强调轻量和原生 Android 体验，让用户可以在移动端播放自己服务器上的音乐，并保留自托管音乐生态的控制权。',
    demo_url: 'https://eddyizm.github.io/tempus/',
    source_repo: 'eddyizm/tempus', source_url: 'https://github.com/eddyizm/tempus', curation_rank: 3,
    curated_meta: {
      features: ['连接 Subsonic 兼容音乐服务器', '原生 Android 音乐播放体验', '面向自托管音乐库', '开源且可自行构建'],
      editorial_reason: '它代表一种很典型的小产品机会：不是重新做 Spotify，而是给已有的自托管生态补一个更好用、更聚焦的终端体验。',
      tech_stack: ['Android', 'Java', 'Kotlin'], license: 'GPL-3.0', official_url: 'https://eddyizm.github.io/tempus/', source_label: 'GitHub README'
    }
  },
  {
    id: 'd9e2b8f1-0c61-4a5d-8d65-3c79f6a20104',
    title: 'openScale',
    summary: '不把身体数据上传云端，也能连接大量蓝牙体脂秤，持续记录体重、BMI、体脂和其他身体指标。',
    category: 'app', industry: 'health_fitness', listing_type: 'curated', is_recruiting: false,
    roles_needed: [], skills_required: [], work_mode: null, cooperation_type: null,
    description: 'openScale 是一个开源的体重和身体指标追踪应用，重点是兼容大量不同品牌的蓝牙体脂秤，同时不强迫用户依赖硬件厂商自己的云服务。它可以记录体重、BMI、体脂、身体水分、肌肉量等多种指标，用图表和表格查看变化，也支持多人、目标管理和 CSV 导入导出。项目明确强调隐私：应用本身不把数据发送到云端。',
    demo_url: 'https://github.com/oliexdev/openScale',
    source_repo: 'oliexdev/openScale', source_url: 'https://github.com/oliexdev/openScale', curation_rank: 4,
    curated_meta: {
      features: ['兼容多品牌 BLE 蓝牙体脂秤', '体重/BMI/体脂/肌肉等多指标跟踪', '图表、表格和 CSV 导入导出', '无需账号且数据不上传自有云'],
      editorial_reason: '它把硬件厂商割裂的设备生态变成一个中立软件层，这类“替代原厂差体验”的产品往往比从零创造需求更具体。',
      tech_stack: ['Android', 'Java'], license: 'GPL-3.0', official_url: 'https://github.com/oliexdev/openScale', source_label: 'GitHub README'
    }
  },
  {
    id: 'd9e2b8f1-0c61-4a5d-8d65-3c79f6a20105',
    title: 'Hi.Events',
    summary: '活动主办方可以自托管的售票、检票和活动经营平台，覆盖门票销售、二维码入场、退款和销售分析。',
    category: 'saas', industry: 'events', listing_type: 'curated', is_recruiting: false,
    roles_needed: [], skills_required: [], work_mode: null, cooperation_type: null,
    description: 'Hi.Events 是一套开源活动售票与管理平台，可用于会议、演出、夜店活动、工作坊和节庆。它既可以自行部署，也提供托管版本。产品覆盖免费/付费/捐赠门票、优惠码、等候名单、活动页面、PDF 门票、二维码检票、退款、批量消息、销售与税费报表、Affiliate 跟踪以及 Stripe Connect。核心价值是让主办方保留自己的品牌、结账流程和数据。',
    demo_url: 'https://hi.events',
    source_repo: 'HiEventsDev/Hi.Events', source_url: 'https://github.com/HiEventsDev/Hi.Events', curation_rank: 5,
    curated_meta: {
      features: ['门票销售、优惠码、等候名单和多日期活动', '品牌化活动页与 PDF 门票', '二维码检票、退款和参会者管理', '销售分析、Affiliate、Stripe Connect 与 REST API'],
      editorial_reason: '它不是单功能售票页，而是一条完整的活动经营链路，同时用开源/自托管切入被平台费率和数据锁定困扰的主办方。',
      tech_stack: ['Laravel', 'React', 'TypeScript', 'PostgreSQL', 'Redis'], license: 'AGPL-3.0 + additional terms', official_url: 'https://hi.events', source_label: 'GitHub README'
    }
  },
  {
    id: 'd9e2b8f1-0c61-4a5d-8d65-3c79f6a20106',
    title: 'Tamari',
    summary: '从收藏菜谱延伸到买菜清单和一周饮食计划，把“找到菜谱以后怎么办”继续做成完整家庭料理工具。',
    category: 'saas', industry: 'food_lifestyle', listing_type: 'curated', is_recruiting: false,
    roles_needed: [], skills_required: [], work_mode: null, cooperation_type: null,
    description: 'Tamari 是一个自托管的菜谱管理 Web 应用。用户可以保存、搜索、分类和分享自己的菜谱，也可以从其索引的大量公开菜谱中找到内容并导入。产品没有停在“收藏菜谱”，而是继续连接购物清单和 Meal Planner：可以把菜谱原料一键加入指定商店的采购清单、购物时勾选，甚至用条码添加商品，并把未来最多 30 天的菜谱安排到具体日期。',
    demo_url: 'https://app.tamariapp.com',
    source_repo: 'alexbates/Tamari', source_url: 'https://github.com/alexbates/Tamari', curation_rank: 6,
    curated_meta: {
      features: ['保存、搜索、分类和分享菜谱', '浏览并导入公开菜谱集合', '按商店管理购物清单并支持条码添加', '最多 30 天 Meal Planner 与 REST API'],
      editorial_reason: '真正有意思的是它沿着同一个用户任务继续向后做：收藏菜谱只是起点，买什么、哪天吃什么才构成完整使用闭环。',
      tech_stack: ['Python', 'Flask', 'Docker'], license: 'GPL-3.0', official_url: 'https://tamariapp.com', source_label: 'GitHub README'
    }
  },
  {
    id: 'd9e2b8f1-0c61-4a5d-8d65-3c79f6a20107',
    title: 'URY',
    summary: '把 POS、厨房显示、菜单配方、库存和每日经营分析放在一起的开源餐厅 ERP。',
    category: 'saas', industry: 'food_lifestyle', listing_type: 'curated', is_recruiting: false,
    roles_needed: [], skills_required: [], work_mode: null, cooperation_type: null,
    description: 'URY 是建立在 ERPNext/Frappe 生态上的餐厅经营系统，覆盖堂食、外带、配送和聚合平台订单。前台有 POS 和桌台点单，厨房端有实时 KDS/KOT 流程，菜单可以与配方 BOM、生产计划和库存联动；经营侧提供每日 P&L、缺货/过量、单品表现、员工表现和门店对比等报表。项目还特别关注延迟出餐、取消单、长期未结账等运营异常。',
    demo_url: 'https://github.com/ury-erp/ury',
    source_repo: 'ury-erp/ury', source_url: 'https://github.com/ury-erp/ury', curation_rank: 7,
    curated_meta: {
      features: ['堂食/外带/配送/聚合订单 POS', '多厨房 KDS 与 KOT 实时状态', '菜单配方 BOM、生产计划和库存联动', '每日 P&L、门店对比与运营异常提醒'],
      editorial_reason: '它说明垂直 ERP 的价值不在功能越多越好，而在把一个行业里的订单、生产、库存和利润真正串成同一条业务链。',
      tech_stack: ['Frappe', 'ERPNext', 'Python', 'JavaScript'], license: 'Open source / see repository terms', official_url: 'https://github.com/ury-erp/ury', source_label: 'GitHub README'
    }
  },
  {
    id: 'd9e2b8f1-0c61-4a5d-8d65-3c79f6a20108',
    title: 'NMF.earth',
    summary: '用生活行为和商品条码数据帮助用户理解个人碳足迹，并把抽象的排放问题变成可以持续查看的移动体验。',
    category: 'app', industry: 'sustainability', listing_type: 'curated', is_recruiting: false,
    roles_needed: [], skills_required: [], work_mode: null, cooperation_type: null,
    description: 'NMF.earth 是一个面向个人碳足迹的开源移动应用，目标是帮助用户理解并减少自己的排放。应用使用独立的 carbon-footprint 数据仓库作为碳排放数据来源，同时通过 Open Food Facts API 获取条码商品信息。项目还把可持续生活指南、方法论和排放解释以内容形式集成在应用中，因此它不仅是一个计算器，也试图把“数据—解释—行动建议”组织为连续体验。',
    demo_url: 'https://nmf.earth/',
    source_repo: 'NMF-earth/nmf-app', source_url: 'https://github.com/NMF-earth/nmf-app', curation_rank: 8,
    curated_meta: {
      features: ['个人碳足迹理解与减排场景', '独立碳排放数据源', 'Open Food Facts 条码商品数据', '应用内可持续指南和方法论内容'],
      editorial_reason: '它的启发在于把一个抽象公共议题拆成个人可感知的数据和具体商品信息，这比只做“环保知识内容”更接近可持续产品。',
      tech_stack: ['React Native', 'Expo', 'TypeScript', 'Redux Toolkit'], license: 'GPL-3.0', official_url: 'https://nmf.earth/', source_label: 'GitHub README'
    }
  },
  {
    id: 'd9e2b8f1-0c61-4a5d-8d65-3c79f6a20109',
    title: 'Horilla HRMS',
    summary: '从招聘到薪资的一整套开源人力资源管理系统，覆盖员工全生命周期而不是单点 HR 工具。',
    category: 'saas', industry: 'business_services', listing_type: 'curated', is_recruiting: false,
    roles_needed: [], skills_required: [], work_mode: null, cooperation_type: null,
    description: 'Horilla HRMS 是一个开源的人力资源管理系统，核心模块覆盖员工档案、招聘、入职与离职、考勤、休假、薪资、绩效、资产和 HR Helpdesk。项目支持 LDAP、考勤设备等更接近真实企业环境的连接方式，也提供 Docker 部署。它的产品形态不是一个轻量 HR 插件，而是尝试把企业从招聘到在职管理再到离职的主要流程集中在同一系统。',
    demo_url: 'https://www.horilla.com',
    source_repo: 'horilla-opensource/horilla', source_url: 'https://github.com/horilla-opensource/horilla', curation_rank: 9,
    curated_meta: {
      features: ['员工档案、招聘与入离职流程', '考勤、休假与生物识别设备集成', '薪资和绩效管理', '资产管理与 HR Helpdesk'],
      editorial_reason: '这是典型的垂直业务系统：用户并不是为了某个新奇功能付费，而是为了把原本分散的人事流程、记录和审批放到一处。',
      tech_stack: ['Python', 'Django', 'Docker'], license: 'LGPL-2.1', official_url: 'https://www.horilla.com', source_label: 'GitHub README'
    }
  },
  {
    id: 'd9e2b8f1-0c61-4a5d-8d65-3c79f6a20110',
    title: 'Claroline Connect',
    summary: '基于 Symfony 与 React 的开源学习管理系统，为学校、组织和培训团队提供可自行部署的 LMS 基础设施。',
    category: 'saas', industry: 'culture_education', listing_type: 'curated', is_recruiting: false,
    roles_needed: [], skills_required: [], work_mode: null, cooperation_type: null,
    description: 'Claroline Connect 是一个开源 Learning Management System，使用 Symfony 和 React 构建。项目面向需要自己掌控学习平台、课程和组织数据的学校、机构与培训场景，并维护技术安装文档和用户文档。它不是一个单一课程售卖页，而是 LMS 基础设施：重点在于提供可部署、可扩展的学习空间和管理能力，让组织可以在自己的环境中运行。',
    demo_url: 'https://www.claroline.com',
    source_repo: 'claroline/Claroline', source_url: 'https://github.com/claroline/Claroline', curation_rank: 10,
    curated_meta: {
      features: ['开源 Learning Management System', '组织级学习平台和学习空间', '可自行部署和扩展', '维护技术与用户文档'],
      editorial_reason: '它展示的是“基础设施型教育产品”的另一种路径：不围绕一门课赚钱，而是成为学校或组织承载很多学习活动的底层系统。',
      tech_stack: ['Symfony', 'React', 'PHP'], license: 'Open source / see repository', official_url: 'https://www.claroline.com', source_label: 'GitHub README'
    }
  },
  {
    id: 'd9e2b8f1-0c61-4a5d-8d65-3c79f6a20111',
    title: 'SurveyKing',
    summary: '把问卷、考试和题库练习做在同一个自托管平台里，并加入 AI 生成、自动阅卷和多语言能力。',
    category: 'saas', industry: 'culture_education', listing_type: 'curated', is_recruiting: false,
    roles_needed: [], skills_required: [], work_mode: null, cooperation_type: null,
    description: 'SurveyKing 是一个可自托管的问卷、考试与题库练习平台。问卷部分支持 20 多种题型、条件逻辑、主题和发布控制；考试部分可以复用题库、随机抽题、设置答案与分值并自动评分；练习模式则提供顺序、随机和错题练习。项目还支持通过兼容 OpenAI 的 API 用自然语言生成问卷或考试，并提供响应分析、权限体系、多语言和多种登录集成。',
    demo_url: 'https://s.surveyking.cn/',
    source_repo: 'javahuang/SurveyKing', source_url: 'https://github.com/javahuang/SurveyKing', curation_rank: 11,
    curated_meta: {
      features: ['20+ 问卷题型与条件逻辑', '考试题库、随机抽题和自动阅卷', '顺序/随机/错题练习', 'AI 辅助创建、多语言与 RBAC'],
      editorial_reason: '它没有把问卷、考试、练习拆成三个产品，而是抓住“题目—发布—作答—结果”这套共享底层结构，把相邻场景复用起来。',
      tech_stack: ['Java', 'Spring Boot', 'React', 'Ant Design', 'MySQL'], license: 'MIT', official_url: 'https://surveyking.cn/', source_label: 'GitHub README'
    }
  },
  {
    id: 'd9e2b8f1-0c61-4a5d-8d65-3c79f6a20112',
    title: 'Condo',
    summary: '面向物业公司的工单、住户、房产、收费和服务平台，并通过 mini-app 扩展机制连接更多物业服务。',
    category: 'saas', industry: 'real_estate', listing_type: 'curated', is_recruiting: false,
    roles_needed: [], skills_required: [], work_mode: null, cooperation_type: null,
    description: 'Condo 是一个开源物业管理 SaaS，面向物业公司和共享物业服务团队。系统覆盖住户联系人、物业对象、工单、付款跟踪、发票和服务市场，并提供 mini-app 扩展机制，让新的服务可以继续接入同一平台。它关注的并不是房源展示，而是物业交付后的长期运营：谁住在这里、发生了什么问题、费用有没有结清、服务如何被处理。',
    demo_url: 'https://github.com/open-condo-software/condo',
    source_repo: 'open-condo-software/condo', source_url: 'https://github.com/open-condo-software/condo', curation_rank: 12,
    curated_meta: {
      features: ['物业与住户联系人管理', '工单和服务处理', '付款跟踪与发票', '服务市场和 mini-app 扩展系统'],
      editorial_reason: '它把“房地产”从交易型网站换成长期物业运营视角：真正持续发生的工单、收费和服务才构成高频业务系统。',
      tech_stack: ['Node.js', 'JavaScript', 'PostgreSQL', 'Redis'], license: 'MIT', official_url: 'https://github.com/open-condo-software/condo', source_label: 'GitHub README'
    }
  },
  {
    id: 'd9e2b8f1-0c61-4a5d-8d65-3c79f6a20113',
    title: 'Fleetbase',
    summary: '可以管理订单、车队、路线和最后一公里配送的模块化物流操作系统，既有后台也有司机端和扩展体系。',
    category: 'saas', industry: 'logistics', listing_type: 'curated', is_recruiting: false,
    roles_needed: [], skills_required: [], work_mode: null, cooperation_type: null,
    description: 'Fleetbase 把自己定位为模块化物流与供应链操作系统，适用于电商配送、餐饮配送、快递、现场服务和企业物流。后台提供订单看板、订单工作流、实时地图、车队跟踪和服务区域；同时支持 REST API、WebSocket 和 Webhook，与外部系统连接。它还有 Navigator 司机应用和扩展机制，可以继续安装仓储、车队等能力。',
    demo_url: 'https://fleetbase.io',
    source_repo: 'fleetbase/fleetbase', source_url: 'https://github.com/fleetbase/fleetbase', curation_rank: 13,
    curated_meta: {
      features: ['订单看板和可配置订单工作流', '订单与车队实时地图跟踪', '服务区域、路线和配送运营', 'REST API/WebSocket/Webhook、司机 App 和扩展机制'],
      editorial_reason: '它的产品思路值得看：不是做一个固定物流 SaaS，而是先抽象物流共性，再通过扩展和应用层覆盖不同行业的运营需求。',
      tech_stack: ['JavaScript', 'PHP', 'Docker'], license: 'AGPL-3.0', official_url: 'https://fleetbase.io', source_label: 'GitHub README'
    }
  },
  {
    id: 'd9e2b8f1-0c61-4a5d-8d65-3c79f6a20114',
    title: 'Notifuse',
    summary: '同时覆盖 Newsletter、营销自动化和事务邮件的自托管邮件平台，把发送、自动化和分析集中到一套系统。',
    category: 'saas', industry: 'business_services', listing_type: 'curated', is_recruiting: false,
    roles_needed: [], skills_required: [], work_mode: null, cooperation_type: null,
    description: 'Notifuse 是一个自托管邮件营销和事务邮件平台。它提供可视化邮件编辑器、Campaign、名单与联系人管理、主题/内容/发送时间 A/B 测试，以及基于画布的自动化流程。开发侧有事务邮件 REST API、Webhook、Liquid 模板，并能连接 Amazon SES、Mailgun、Postmark、SendGrid、SMTP 等发送服务商。项目还集成了邮件表现分析和隐私导向的 Web Analytics。',
    demo_url: 'https://www.notifuse.com/',
    source_repo: 'Notifuse/notifuse', source_url: 'https://github.com/Notifuse/notifuse', curation_rank: 14,
    curated_meta: {
      features: ['可视化邮件编辑与 Campaign 管理', 'A/B 测试和联系人/名单分群', '可视化自动化流程、分支、延迟和 Webhook', '事务邮件 API 与多发送服务商连接'],
      editorial_reason: '它代表“把基础设施成本拆开”的产品路径：邮件产品负责客户、内容、自动化与分析，真正的发送交给可替换的底层服务商。',
      tech_stack: ['Go', 'React', 'PostgreSQL'], license: 'Business Source License 1.1 (v40+) / earlier AGPL-3.0', official_url: 'https://www.notifuse.com/', source_label: 'GitHub README'
    }
  },
  {
    id: 'd9e2b8f1-0c61-4a5d-8d65-3c79f6a20115',
    title: 'Relaticle',
    summary: '从一开始就让 AI Agent 能真正操作客户数据的自托管 CRM，提供 MCP、REST API 和高度可定制的数据模型。',
    category: 'ai', industry: 'business_services', listing_type: 'curated', is_recruiting: false,
    roles_needed: [], skills_required: [], work_mode: null, cooperation_type: null,
    description: 'Relaticle 是一个自托管 CRM，特别强调 AI Agent 不是“旁边的聊天框”，而是能够通过生产级 MCP Server 和 REST API 真正读取、更新和分析 CRM 数据。项目公开提供 37 个 MCP tools，支持联系人、公司、机会、活动历史和 Pipeline 分析，同时拥有 22 种自定义字段、字段关系、条件显示和多团队数据隔离。',
    demo_url: 'https://relaticle.com',
    source_repo: 'relaticle/relaticle', source_url: 'https://github.com/relaticle/relaticle', curation_rank: 15,
    curated_meta: {
      features: ['37 个 MCP tools 供 AI Agent 操作 CRM', 'REST API 与完整 CRUD', '22 种自定义字段与关系模型', '多团队数据隔离和自托管'],
      editorial_reason: '相比“给 CRM 加一个 AI 聊天框”，它更值得看的地方是把 Agent 能调用的业务动作本身做成一等接口，这更接近 AI-native 软件。',
      tech_stack: ['Laravel', 'Filament', 'PHP', 'PostgreSQL'], license: 'AGPL-3.0', official_url: 'https://relaticle.com', source_label: 'GitHub README'
    }
  },
  {
    id: 'd9e2b8f1-0c61-4a5d-8d65-3c79f6a20116',
    title: 'AdventureLog',
    summary: '把去过哪里、下一次旅行和整个旅行地图放到一起的自托管旅行工具，并支持照片、轨迹和共同规划。',
    category: 'app', industry: 'travel', listing_type: 'curated', is_recruiting: false,
    roles_needed: [], skills_required: [], work_mode: null, cooperation_type: null,
    description: 'AdventureLog 是一个开源旅行记录与规划工具。用户可以在地图上记录去过的地点和多次访问，附加日期、笔记、照片、分类和标签；也可以创建多天行程，管理航班、住宿、清单和每日活动。产品还会统计国家、地区和城市的旅行进度，并支持公开分享或邀请同行者共同编辑，此外可连接 Immich、Strava、Google Maps 等服务。',
    demo_url: 'https://adventurelog.app',
    source_repo: 'seanmorley15/AdventureLog', source_url: 'https://github.com/seanmorley15/AdventureLog', curation_rank: 16,
    curated_meta: {
      features: ['地图地点、访问历史、照片和标签', '多天行程、住宿、航班、清单与日历', '国家/地区/城市旅行统计', '公开分享、协同编辑及 Immich/Strava 等集成'],
      editorial_reason: '它不是把旅行计划和旅行记录分成两套工具，而是让“去过哪里”和“下一次去哪”共享同一张地图与地点数据，形成长期使用理由。',
      tech_stack: ['SvelteKit', 'Django', 'PostgreSQL', 'PostGIS'], license: 'GPL-3.0', official_url: 'https://adventurelog.app', source_label: 'GitHub README'
    }
  },
  {
    id: 'd9e2b8f1-0c61-4a5d-8d65-3c79f6a20117',
    title: 'Dreeve',
    summary: '把 Strava 等运动记录变成长期个人运动数据仪表盘，补上装备、热力图、里程碑和年度回顾等深度分析。',
    category: 'saas', industry: 'health_fitness', listing_type: 'curated', is_recruiting: false,
    roles_needed: [], skills_required: [], work_mode: null, cooperation_type: null,
    description: 'Dreeve 是一个自托管运动数据仪表盘，可以直接导入 FIT、TCX、GPX 文件，也可以连接 Strava。除了基础活动列表和统计，它进一步提供月度日历、装备使用量与维护提醒、Segment 历史、运动热力图、里程碑时间线、年度 Rewind、挑战完成情况和照片归档。项目还加入 AI workout assistant，用已有运动数据给出训练建议与洞察。',
    demo_url: 'https://dreeve.app',
    source_repo: 'dreeveapp/dreeve', source_url: 'https://github.com/dreeveapp/dreeve', curation_rank: 17,
    curated_meta: {
      features: ['FIT/TCX/GPX 导入与 Strava 连接', '活动仪表盘、月历和热力图', '装备里程与维护跟踪', 'Segment、里程碑、年度回顾和 AI workout assistant'],
      editorial_reason: '它抓住了平台型运动产品的一个外部机会：原平台负责记录，独立产品则围绕长期复盘、装备和个人分析做得更深。',
      tech_stack: ['PHP', 'JavaScript', 'Docker'], license: 'AGPL-3.0', official_url: 'https://dreeve.app', source_label: 'GitHub README'
    }
  },
  {
    id: 'd9e2b8f1-0c61-4a5d-8d65-3c79f6a20118',
    title: 'Ekylibre',
    summary: '面向农场经营的开源 Farm Management Information System，把农业生产、地块和经营数据放进同一个管理系统。',
    category: 'saas', industry: 'agriculture', listing_type: 'curated', is_recruiting: false,
    roles_needed: [], skills_required: [], work_mode: null, cooperation_type: null,
    description: 'Ekylibre 是一个开源 Farm Management Information System（FMIS）Web 应用，面向农场经营管理。它使用 Ruby on Rails、PostgreSQL 和 PostGIS，因此系统不仅能处理普通经营数据，也具备地理空间能力，适合围绕农田、地块和农业活动组织信息。项目提供 Docker 安装、官方演示数据和面向实际用户的文档，是一个长期维护的垂直行业软件案例。',
    demo_url: 'https://ekylibre.org',
    source_repo: 'ekylibre/ekylibre', source_url: 'https://github.com/ekylibre/ekylibre', curation_rank: 18,
    curated_meta: {
      features: ['农场经营信息系统 FMIS', '面向农田/地块的地理空间能力', 'PostgreSQL + PostGIS 数据基础', '支持自托管、Docker 和官方演示'],
      editorial_reason: '农业软件的门槛往往不在 UI，而在是否理解地块、作业和经营数据如何关联；它体现了垂直行业模型本身就是产品资产。',
      tech_stack: ['Ruby on Rails', 'PostgreSQL', 'PostGIS'], license: 'AGPL-3.0', official_url: 'https://ekylibre.org', source_label: 'GitHub README'
    }
  },
  {
    id: 'd9e2b8f1-0c61-4a5d-8d65-3c79f6a20119',
    title: 'OpenFront',
    summary: '围绕领土扩张和联盟博弈设计的浏览器实时战略游戏，使用真实地理主题地图进行多人对抗。',
    category: 'game', industry: 'gaming', listing_type: 'curated', is_recruiting: false,
    roles_needed: [], skills_required: [], work_mode: null, cooperation_type: null,
    description: 'OpenFront 是一个运行在现代浏览器中的在线实时战略游戏，核心玩法围绕领土控制、扩张、防御和玩家联盟。玩家在不同真实地理主题的地图上扩大自己的区域、建设结构并与其他玩家形成战略关系，同时需要管理扩张和防守之间的资源平衡。项目代码以 AGPL-3.0 发布，游戏资产采用单独许可，并公开维护客户端、核心模拟和服务器代码。',
    demo_url: 'https://openfront.io/',
    source_repo: 'openfrontio/OpenFrontIO', source_url: 'https://github.com/openfrontio/OpenFrontIO', curation_rank: 19,
    curated_meta: {
      features: ['浏览器实时战略对战', '领土扩张与资源管理', '玩家联盟和共同防御', '多张真实地理主题地图'],
      editorial_reason: '它适合放进首批样本，因为它证明“小产品”不等于工具 SaaS：一个浏览器游戏同样可以围绕明确核心循环做成持续迭代的独立产品。',
      tech_stack: ['TypeScript', 'Web browser', 'Server simulation'], license: 'AGPL-3.0 code / CC BY-SA 4.0 assets', official_url: 'https://openfront.io/', source_label: 'GitHub README'
    }
  }
]
