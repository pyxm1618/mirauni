import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const query = getQuery(event)
    const orderNo = query.orderNo as string

    if (!orderNo) {
        throw createError({ statusCode: 400, message: 'Order No required' })
    }

    const supabaseAdmin = serverSupabaseServiceRole(event)

    const { data, error } = await supabaseAdmin
        .from('orders')
        .select('status, credits, amount')
        .eq('order_no', orderNo)
        .eq('user_id', user.id) // 越权防范：强行校验订单所有权
        .single()

    if (error) {
        throw createError({ statusCode: 404, message: 'Order not found' })
    }

    return {
        success: true,
        data
    }
})
