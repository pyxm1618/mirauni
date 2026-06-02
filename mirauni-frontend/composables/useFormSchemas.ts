import { z } from 'zod'

export const useFormSchemas = () => {
  const { t } = useI18n()

  const phoneSchema = z.string().regex(/^1[3-9]\d{9}$/, t('auth.error.phone') || 'Invalid phone number')
  
  const codeSchema = z.string().regex(/^\d{6}$/, t('auth.error.code') || 'Invalid code')
  
  const usernameSchema = z
    .string()
    .min(2, t('validation.username.min') || 'Username too short')
    .max(20, t('validation.username.max') || 'Username too long')

  const userProfileSchema = z.object({
    username: usernameSchema.optional(),
    bio: z.string().max(200, t('validation.bio.max') || 'Bio too long').optional(),
    profession: z.string().max(50).optional(),
    position: z.string().max(50).optional(),
    location: z.string().max(50).optional(),
    skills: z.array(z.string()).max(10, t('validation.skills.max') || 'Max 10 skills').optional(),
    experience_years: z.number().min(0).max(50).optional(),
    work_preference: z.enum(['fulltime', 'parttime']).optional(),
    wechat_id: z.string().min(6).max(20).optional(),
    email: z.string().email(t('validation.email.invalid') || 'Invalid email').optional()
  })

  const projectSchema = z.object({
    title: z.string().min(2, t('validation.project.title.min') || 'Title too short').max(50, t('validation.project.title.max') || 'Title too long'),
    summary: z.string().min(10, t('validation.project.summary.min') || 'Summary too short').max(200, t('validation.project.summary.max') || 'Summary too long'),
    category: z.enum(['saas', 'app', 'game', 'ai', 'ecommerce', 'content', 'hardware', 'other']),
    roles_needed: z.array(z.string()).min(1, t('validation.project.roles.min') || 'Select at least one role').max(5),
    skills_required: z.array(z.string()).max(10).optional(),
    work_mode: z.enum(['remote', 'onsite', 'hybrid']),
    cooperation_type: z.enum(['equity', 'salary', 'revenue_share', 'volunteer']),
    description: z.string().max(5000, t('validation.project.desc.max') || 'Description too long').optional(),
    background: z.string().max(2000).optional(),
    vision: z.string().max(1000).optional(),
    team_info: z.string().max(1000).optional(),
    demo_url: z.string().url(t('validation.url.invalid') || 'Invalid URL').optional().or(z.literal(''))
  })

  return {
    phoneSchema,
    codeSchema,
    usernameSchema,
    userProfileSchema,
    projectSchema
  }
}
