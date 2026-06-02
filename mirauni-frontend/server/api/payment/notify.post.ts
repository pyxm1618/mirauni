import { serverSupabaseServiceRole } from '#supabase/server'
import { parseXml, buildXml, sign } from '~/server/utils/wechat'

export default defineEventHandler(async (event) => {
    const bodyBuffer = await readRawBody(event)
    if (!bodyBuffer) {
        throw createError({ statusCode: 400, message: 'Empty body' })
    }

    const bodyString = bodyBuffer.toString()

    try {
        const result = await parseXml(bodyString)
        const config = useRuntimeConfig()

        // 1. 验证签名
        const { sign: receivedSign, ...params } = result
        const calculatedSign = sign(params, config.wechatApiKey as string)

        if (receivedSign !== calculatedSign) {
            return buildXml({ return_code: 'FAIL', return_msg: 'Signature verification failed' })
        }

        // 2. 检查返回状态
        if (result.return_code !== 'SUCCESS' || result.result_code !== 'SUCCESS') {
            return buildXml({ return_code: 'FAIL', return_msg: 'WeChat Pay failure' })
        }

        // 3. 更新订单状态
        const orderNo = result.out_trade_no
        const totalFee = parseInt(result.total_fee)

        const client = serverSupabaseServiceRole(event)

        // 获取订单
        const { data: order, error: orderError } = await client
            .from('orders')
            .select('*')
            .eq('order_no', orderNo)
            .single()

        if (orderError || !order) {
            console.error('Order not found:', orderNo)
            return buildXml({ return_code: 'FAIL', return_msg: 'Order not found' })
        }

        // 幂等检查
        if (order.status === 'paid') {
            return buildXml({ return_code: 'SUCCESS', return_msg: 'OK' })
        }

        // 金额校验
        if (order.amount !== totalFee) {
            console.error('Amount mismatch:', order.amount, totalFee)
            return buildXml({ return_code: 'FAIL', return_msg: 'Amount mismatch' })
        }

        // 更新订单
        const { error: updateError } = await client
            .from('orders')
            .update({
                status: 'paid',
                paid_at: new Date().toISOString()
            })
            .eq('id', order.id)

        if (updateError) {
            throw updateError
        }

        // 4. 增加用户解锁次数（使用 RPC 函数，严格按照 technical-design.md）
        const { error: rpcError } = await client.rpc('add_credits', {
            p_user_id: order.user_id,
            p_credits: order.credits
        })

        if (rpcError) {
            console.error('RPC add_credits error:', rpcError)
            throw rpcError
        }

        return buildXml({ return_code: 'SUCCESS', return_msg: 'OK' })

    } catch (e: any) {
        console.error('Notify Error:', e)
        return buildXml({ return_code: 'FAIL', return_msg: 'Server Error' })
    }
})
