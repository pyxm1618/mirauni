import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const body = await readBody(event)
    const { targetUserId } = body

    if (!targetUserId) {
        throw createError({ statusCode: 400, message: 'Target user ID required' })
    }

    if (targetUserId === user.id) {
        throw createError({
            statusCode: 400,
            message: '不能解锁自己的联系方式'
        })
    }

    const supabaseAdmin = serverSupabaseServiceRole(event)

    // 调用并发安全且保证事务原子性的 RPC 函数
    const { data, error } = await supabaseAdmin.rpc('unlock_user_contact', {
        p_user_id: user.id,
        p_target_user_id: targetUserId
    })

    if (error) {
        // 如果是异常（例如余额不足），捕获并返回对应错误
        if (error.message.includes('Insufficient credits')) {
            throw createError({
                statusCode: 402,
                message: '解锁次数不足，请先充值'
            })
        }
        throw createError({
            statusCode: 500,
            message: error.message || '解锁失败'
        })
    }

    return {
        success: true,
        message: '解锁成功'
    }
})
