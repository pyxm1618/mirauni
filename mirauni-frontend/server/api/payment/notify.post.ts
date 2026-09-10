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

        // 3. 原子完成订单与权益发放；数据库行锁负责重复通知幂等。
        const orderNo = result.out_trade_no
        const totalFee = Number.parseInt(result.total_fee, 10)

        if (!orderNo || !Number.isInteger(totalFee)) {
            return buildXml({ return_code: 'FAIL', return_msg: 'Invalid payment data' })
        }

        const client = serverSupabaseServiceRole(event)
        const { error: rpcError } = await client.rpc('complete_wechat_payment', {
            p_order_no: orderNo,
            p_total_fee: totalFee
        })

        if (rpcError) {
            console.error('complete_wechat_payment error:', rpcError)
            return buildXml({ return_code: 'FAIL', return_msg: 'Payment settlement failed' })
        }

        return buildXml({ return_code: 'SUCCESS', return_msg: 'OK' })
    } catch (e: any) {
        console.error('Notify Error:', e)
        return buildXml({ return_code: 'FAIL', return_msg: 'Server Error' })
    }
})
