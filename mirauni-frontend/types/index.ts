import { z } from 'zod'

// ==================== 验证 Schema ====================

export const phoneSchema = z.string().regex(/^1[3-9]\d{9}$/, '请输入正确的手机号')
export const codeSchema = z.string().regex(/^\d{6}$/, '请输入6位验证码')

export const usernameSchema = z
    .string()
    .min(2, '用户名至少2个字符')
    .max(20, '用户名最多20个字符')

export const userProfileSchema = z.object({
    username: usernameSchema.optional(),
    bio: z.string().max(200, '简介最多200字').optional(),
    profession: z.string().max(50).optional(),
    position: z.string().max(50).optional(),
    location: z.string().max(50).optional(),
    skills: z.array(z.string()).max(10, '最多选择10个技能').optional(),
    experience_years: z.number().min(0).max(50).optional(),
    work_preference: z.enum(['fulltime', 'parttime']).optional(),
    wechat_id: z.string().min(6).max(20).optional(),
    email: z.string().email('邮箱格式不正确').optional(),
    avatar_url: z.string().url('头像链接格式不正确').optional().or(z.literal('')),
    social_links: z.record(z.string()).optional()
})

export const PROJECT_INDUSTRY_VALUES = [
    'culture_education',
    'finance',
    'productivity',
    'entertainment',
    'health_fitness',
    'events',
    'food_lifestyle',
    'business_services',
    'sustainability',
    'real_estate',
    'logistics',
    'travel',
    'agriculture',
    'gaming'
] as const

export const projectSchema = z.object({
    title: z.string().min(2, '标题至少2个字').max(50, '标题最多50字'),
    summary: z.string().min(10, '简介至少10字').max(200, '简介最多200字'),
    category: z.enum(['saas', 'app', 'game', 'ai', 'ecommerce', 'content', 'hardware', 'other']),
    industry: z.enum(PROJECT_INDUSTRY_VALUES),
    listing_type: z.enum(['owner', 'curated']).optional(),
    is_recruiting: z.boolean().default(true),
    roles_needed: z.array(z.string()).max(5).default([]),
    skills_required: z.array(z.string()).max(10).optional(),
    work_mode: z.enum(['remote', 'onsite', 'hybrid']).nullable().optional(),
    cooperation_type: z.enum(['equity', 'salary', 'revenue_share', 'volunteer']).nullable().optional(),
    description: z.string().max(5000, '详情最多5000字').optional(),
    background: z.string().max(2000).optional(),
    vision: z.string().max(1000).optional(),
    team_info: z.string().max(1000).optional(),
    demo_url: z.string().url('请输入正确的链接').optional().or(z.literal(''))
}).superRefine((data, ctx) => {
    if (!data.is_recruiting) return

    if (data.roles_needed.length < 1) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['roles_needed'], message: '正在招募时至少选择一个招募角色' })
    }
    if (!data.work_mode) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['work_mode'], message: '正在招募时请选择工作方式' })
    }
    if (!data.cooperation_type) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['cooperation_type'], message: '正在招募时请选择合作方式' })
    }
})

// ==================== 类型定义 ====================

export type ProjectListingType = 'owner' | 'curated'
export type ProjectIndustry = typeof PROJECT_INDUSTRY_VALUES[number]

export interface CuratedProjectMeta {
    features?: string[]
    editorial_reason?: string
    tech_stack?: string[]
    license?: string
    official_url?: string
    source_label?: string
}

export interface User {
    id: string
    phone?: string
    username?: string
    avatar_url?: string
    bio?: string
    profession?: string
    position?: string
    location?: string
    skills?: string[]
    experience_years?: number
    work_preference?: 'fulltime' | 'parttime'
    social_links?: Record<string, string>
    wechat_id?: string
    email?: string
    unlock_credits: number
    is_first_charge: boolean
    role: 'user' | 'admin'
    status: 'active' | 'banned'
    created_at: string
    updated_at: string
}

export interface Project {
    id: string
    user_id: string
    title: string
    summary: string
    category: string
    industry?: ProjectIndustry
    listing_type: ProjectListingType
    is_recruiting: boolean
    roles_needed: string[]
    skills_required?: string[]
    work_mode?: string | null
    cooperation_type?: string | null
    source_repo?: string | null
    source_url?: string | null
    curated_meta?: CuratedProjectMeta
    curation_rank?: number | null
    description?: string | null
    description_visible: boolean
    background?: string | null
    background_visible: boolean
    vision?: string | null
    vision_visible: boolean
    team_info?: string | null
    team_visible: boolean
    demo_url?: string | null
    demo_visible: boolean
    status: 'pending' | 'active' | 'closed' | 'rejected'
    view_count: number
    created_at: string
    updated_at: string
    user?: Pick<User, 'id' | 'username' | 'avatar_url'>
}

export interface Message {
    id: string
    conversation_id: string
    from_user_id: string
    to_user_id: string
    content: string
    is_read: boolean
    created_at: string
    from_user?: Pick<User, 'id' | 'username' | 'avatar_url'>
}

export interface Article {
    id: string
    slug: string
    title: string
    content: string
    category: string
    cover_url?: string
    author_id: string
    status: 'draft' | 'published'
    view_count: number
    created_at: string
    updated_at: string
}

export interface Order {
    id: string
    user_id: string
    order_no: string
    amount: number
    credits: number
    status: 'pending' | 'paid' | 'failed' | 'refunded'
    pay_type: string
    paid_at?: string
    created_at: string
}

// ==================== 枚举映射 ====================

export const PROJECT_CATEGORIES = [
    { value: 'saas', label: 'SaaS 工具' },
    { value: 'app', label: '移动应用' },
    { value: 'game', label: '游戏' },
    { value: 'ai', label: 'AI / 人工智能' },
    { value: 'ecommerce', label: '电商' },
    { value: 'content', label: '内容/社区' },
    { value: 'hardware', label: '智能硬件' },
    { value: 'other', label: '其他' }
] as const

export const PROJECT_INDUSTRIES = [
    { value: 'culture_education', label: '文化教育' },
    { value: 'finance', label: '金融' },
    { value: 'productivity', label: '效率工具' },
    { value: 'entertainment', label: '内容娱乐' },
    { value: 'health_fitness', label: '健康运动' },
    { value: 'events', label: '活动票务' },
    { value: 'food_lifestyle', label: '餐饮生活' },
    { value: 'business_services', label: '企业服务' },
    { value: 'sustainability', label: '环保能源' },
    { value: 'real_estate', label: '房产建筑' },
    { value: 'logistics', label: '物流供应链' },
    { value: 'travel', label: '旅游' },
    { value: 'agriculture', label: '农业' },
    { value: 'gaming', label: '游戏' }
] as const

export const ROLES = [
    { value: 'frontend', label: '前端开发' },
    { value: 'backend', label: '后端开发' },
    { value: 'fullstack', label: '全栈开发' },
    { value: 'mobile', label: '移动端开发' },
    { value: 'design', label: 'UI/UX 设计' },
    { value: 'product', label: '产品经理' },
    { value: 'operation', label: '运营' },
    { value: 'marketing', label: '市场推广' }
] as const

export const SKILLS = [
    { value: 'vue', label: 'Vue.js', category: 'frontend' },
    { value: 'react', label: 'React', category: 'frontend' },
    { value: 'typescript', label: 'TypeScript', category: 'frontend' },
    { value: 'flutter', label: 'Flutter', category: 'mobile' },
    { value: 'swift', label: 'Swift', category: 'mobile' },
    { value: 'kotlin', label: 'Kotlin', category: 'mobile' },
    { value: 'nodejs', label: 'Node.js', category: 'backend' },
    { value: 'python', label: 'Python', category: 'backend' },
    { value: 'java', label: 'Java', category: 'backend' },
    { value: 'golang', label: 'Go', category: 'backend' },
    { value: 'rust', label: 'Rust', category: 'backend' },
    { value: 'mysql', label: 'MySQL', category: 'database' },
    { value: 'postgresql', label: 'PostgreSQL', category: 'database' },
    { value: 'mongodb', label: 'MongoDB', category: 'database' },
    { value: 'redis', label: 'Redis', category: 'database' },
    { value: 'docker', label: 'Docker', category: 'devops' },
    { value: 'kubernetes', label: 'Kubernetes', category: 'devops' },
    { value: 'aws', label: 'AWS', category: 'cloud' },
    { value: 'ai', label: 'AI/ML', category: 'ai' },
    { value: 'figma', label: 'Figma', category: 'design' }
] as const

export const WORK_MODES = [
    { value: 'remote', label: '远程办公' },
    { value: 'onsite', label: '坐班' },
    { value: 'hybrid', label: '混合办公' }
] as const

export const COOPERATION_TYPES = [
    { value: 'equity', label: '股权合作' },
    { value: 'salary', label: '薪酬合作' },
    { value: 'revenue_share', label: '收益分成' },
    { value: 'volunteer', label: '纯兴趣参与' }
] as const
