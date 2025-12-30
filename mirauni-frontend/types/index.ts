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
    email: z.string().email('邮箱格式不正确').optional()
})

export const projectSchema = z.object({
    title: z.string().min(2, '标题至少2个字').max(50, '标题最多50字'),
    summary: z.string().min(10, '简介至少10字').max(200, '简介最多200字'),
    category: z.enum(['saas', 'app', 'game', 'ai', 'ecommerce', 'content', 'hardware', 'other']),
    roles_needed: z.array(z.string()).min(1, '至少选择一个招募角色').max(5),
    skills_required: z.array(z.string()).max(10).optional(),
    work_mode: z.enum(['remote', 'onsite', 'hybrid']),
    cooperation_type: z.enum(['equity', 'salary', 'revenue_share', 'volunteer']),
    description: z.string().max(5000, '详情最多5000字').optional(),
    background: z.string().max(2000).optional(),
    vision: z.string().max(1000).optional(),
    team_info: z.string().max(1000).optional(),
    demo_url: z.string().url('请输入正确的链接').optional().or(z.literal(''))
})

// ==================== 类型定义 ====================

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
    roles_needed: string[]
    skills_required?: string[]
    work_mode: string
    cooperation_type: string
    description?: string
    description_visible: boolean
    background?: string
    background_visible: boolean
    vision?: string
    vision_visible: boolean
    team_info?: string
    team_visible: boolean
    demo_url?: string
    demo_visible: boolean
    status: 'pending' | 'active' | 'closed' | 'rejected'
    view_count: number
    created_at: string
    updated_at: string
    // 关联
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
    // 关联
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
