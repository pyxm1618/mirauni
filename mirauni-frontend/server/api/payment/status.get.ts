import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

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

    const client = await serverSupabaseClient(event)

    const { data, error } = await client
        .from('orders')
        .select('status, credits, amount')
        .eq('order_no', orderNo)
        .single()

    if (error) {
        throw createError({ statusCode: 404, message: 'Order not found' })
    }

    return {
        success: true,
        data
    }
})
