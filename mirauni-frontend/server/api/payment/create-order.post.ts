import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { sign, generateNonceStr, buildXml, unifiedOrderUrl, parseXml } from '~/server/utils/wechat'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const body = await readBody(event)
    const { packageId, payType = 'native' } = body // packageId: basic, standard, premium

    // 1. 获取套餐信息（严格按照 technical-design.md）
    const packages: Record<string, { credits: number, amount: number }> = {
        'basic': { credits: 10, amount: 3000 },     // 30元10次
        'standard': { credits: 30, amount: 5000 },  // 50元30次
        'premium': { credits: 100, amount: 10000 }  // 100元100次
    }
    const pkg = packages[String(packageId)]
    if (!pkg) {
        throw createError({ statusCode: 400, message: 'Invalid package' })
    }

    const client = await serverSupabaseClient(event)
    const config = useRuntimeConfig()

    // 2. 检查首充优惠
    const { data: userData } = await client
        .from('users')
        .select('is_first_charge, wechat_openid')
        .eq('id', user.id)
        .single()

    let finalAmount = pkg.amount
    let bonusCredits = 0

    if (userData?.is_first_charge) {
        // 首充8折 + 额外30%次数
        finalAmount = Math.floor(pkg.amount * 0.8)
        bonusCredits = Math.floor(pkg.credits * 0.3)
    }

    const totalCredits = pkg.credits + bonusCredits

    // 3. 创建订单
    const orderNo = `${Date.now()}${Math.random().toString().slice(-6)}`
    const { data: order, error } = await client
        .from('orders')
        .insert({
            user_id: user.id,
            order_no: orderNo,
            amount: finalAmount,
            credits: totalCredits,
            pay_type: 'wechat',
            status: 'pending'
        })
        .select()
        .single()

    if (error) {
        throw createError({ statusCode: 500, message: error.message })
    }

    // 4. 调用微信支付统一下单
    // Mock mode check
    if (!config.wechatMchId || !config.wechatApiKey) {
        // Return Mock Data
        return {
            success: true,
            data: {
                orderNo: orderNo,
                codeUrl: 'weixin://wxpay/bizpayurl?pr=mock',
                mock: true
            },
            discount: {
                isFirstCharge: userData?.is_first_charge,
                originalAmount: pkg.amount,
                finalAmount,
                bonusCredits
            }
        }
    }

    // Real WeChat Pay
    const nonceStr = generateNonceStr()
    const params: Record<string, any> = {
        appid: config.wechatAppId,
        mch_id: config.wechatMchId,
        nonce_str: nonceStr,
        body: `解锁次数 x ${totalCredits}${bonusCredits > 0 ? ' (含首充赠送)' : ''}`,
        out_trade_no: orderNo,
        total_fee: finalAmount,
        spbill_create_ip: '127.0.0.1',
        notify_url: `${config.public.siteUrl}/api/payment/notify`,
        trade_type: payType === 'native' ? 'NATIVE' : 'JSAPI'
    }

    // OpenID is required for JSAPI
    if (payType === 'jsapi') {
        if (userData?.wechat_openid) {
            params.openid = userData.wechat_openid
        } else {
            throw createError({ statusCode: 400, message: 'WeChat OpenID missing for JSAPI' })
        }
    }

    const signStr = sign(params, config.wechatApiKey as string)
    const xml = buildXml({ ...params, sign: signStr })

    try {
        const res = await $fetch(unifiedOrderUrl, {
            method: 'POST',
            body: xml
        })
        const result = await parseXml(res as string) as any

        if (result.return_code === 'SUCCESS' && result.result_code === 'SUCCESS') {
            return {
                success: true,
                data: {
                    orderNo,
                    codeUrl: result.code_url,
                    ...(payType === 'jsapi' ? (() => {
                        const jsapiParams = {
                            appId: config.wechatAppId,
                            timeStamp: String(Math.floor(Date.now() / 1000)),
                            nonceStr: generateNonceStr(),
                            package: `prepay_id=${result.prepay_id}`,
                            signType: 'MD5'
                        }
                        const paySign = sign(jsapiParams, config.wechatApiKey as string)
                        return { ...jsapiParams, paySign }
                    })() : {})
                },
                discount: {
                    isFirstCharge: userData?.is_first_charge,
                    originalAmount: pkg.amount,
                    finalAmount,
                    bonusCredits
                }
            }
        } else {
            throw createError({ statusCode: 500, message: result.err_code_des || result.return_msg })
        }
    } catch (e: any) {
        throw createError({ statusCode: 500, message: e.message })
    }
})
