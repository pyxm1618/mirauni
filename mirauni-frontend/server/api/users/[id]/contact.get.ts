import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    const id = event.context.params?.id

    if (!id) {
        throw createError({ statusCode: 400, message: 'ID required' })
    }

    const supabaseAdmin = serverSupabaseServiceRole(event)

    // 1. Check if self
    if (user && user.id === id) {
        // 使用 service_role 提取自己本人的敏感信息，绕过 RLS 自查限制
        const { data, error } = await supabaseAdmin
            .from('users')
            .select('phone, wechat_id, email')
            .eq('id', id)
            .single()
            
        if (error) throw error
        return { success: true, data }
    }

    // 2. Check if unlocked
    let isUnlocked = false
    if (user) {
        const { data } = await supabaseAdmin
            .from('unlocks')
            .select('id')
            .eq('user_id', user.id)
            .eq('target_user_id', id)
            .single()
        isUnlocked = !!data
    }

    if (!isUnlocked) {
        throw createError({ statusCode: 403, message: 'Contact info locked' })
    }

    // 3. Return contact info (以 service_role 身份，安全读取被解锁者的敏感字段)
    const { data, error } = await supabaseAdmin
        .from('users')
        .select('phone, wechat_id, email')
        .eq('id', id)
        .single()

    if (error) {
        throw createError({ statusCode: 404, message: 'User not found' })
    }

    return { success: true, data }
})
