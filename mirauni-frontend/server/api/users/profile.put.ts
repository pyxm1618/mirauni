/**
 * 更新当前用户资料
 * PUT /api/users/profile
 * Body: Partial<UserProfile>
 */
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { userProfileSchema } from '~/types'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)

    if (!user) {
        throw createError({
            statusCode: 401,
            message: '请先登录'
        })
    }

    const body = await readBody(event)

    // 验证输入
    const validationResult = userProfileSchema.safeParse(body)
    if (!validationResult.success) {
        const errors = validationResult.error.flatten().fieldErrors
        throw createError({
            statusCode: 400,
            data: { errors },
            message: '输入格式错误'
        })
    }

    const supabase = await serverSupabaseClient(event)

    // 检查用户名是否已被占用
    if (body.username) {
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('username', body.username)
            .neq('id', user.id)
            .single()

        if (existingUser) {
            throw createError({
                statusCode: 400,
                message: '用户名已被占用'
            })
        }
    }

    // 构建更新数据
    const updateData: Record<string, any> = {
        updated_at: new Date().toISOString()
    }

    // 只更新提交的字段
    const allowedFields = [
        'username', 'bio', 'profession', 'position', 'location',
        'skills', 'experience_years', 'work_preference',
        'wechat_id', 'email', 'social_links'
    ]

    for (const field of allowedFields) {
        if (body[field] !== undefined) {
            updateData[field] = body[field]
        }
    }

    // 更新数据库
    const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single()

    if (error) {
        console.error('更新用户资料失败:', error)
        throw createError({
            statusCode: 500,
            message: '更新失败'
        })
    }

    return {
        success: true,
        user: data,
        message: '资料已更新'
    }
})
