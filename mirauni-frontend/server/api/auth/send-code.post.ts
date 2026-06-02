/**
 * 发送短信验证码 API
 * POST /api/auth/send-code
 * Body: { phone: string }
 */
import { serverSupabaseClient } from '#supabase/server'
import { sendTencentSms, checkSmsRateLimit } from '~/server/utils/tencent-sms'

export default defineEventHandler(async (event) => {
    const { phone } = await readBody(event)

    // 验证手机号格式
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
        throw createError({
            statusCode: 400,
            message: '请输入正确的手机号'
        })
    }

    const supabase = await serverSupabaseClient(event)

    // 检查发送频率限制（60秒一次）
    const rateCheck = await checkSmsRateLimit(phone, supabase)
    if (!rateCheck.canSend) {
        throw createError({
            statusCode: 429,
            message: `请${rateCheck.waitSeconds}秒后再试`
        })
    }

    // 生成 6 位随机验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // 存储验证码（5分钟有效）
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()

    const { error: saveError } = await supabase
        .from('sms_codes')
        .upsert({
            phone,
            code,
            expires_at: expiresAt,
            created_at: new Date().toISOString()
        }, {
            onConflict: 'phone'
        })

    if (saveError) {
        console.error('保存验证码失败:', saveError)
        throw createError({
            statusCode: 500,
            message: '发送验证码失败，请稍后重试'
        })
    }

    // 发送短信（开发环境打印到控制台）
    if (process.dev) {
        console.log(`\n========================================`)
        console.log(`[DEV] 短信验证码`)
        console.log(`手机号: ${phone}`)
        console.log(`验证码: ${code}`)
        console.log(`有效期: 5分钟`)
        console.log(`========================================\n`)
    }

    // 调用腾讯云短信发送
    const sent = await sendTencentSms({ phone, code })

    if (!sent && !process.dev) {
        throw createError({
            statusCode: 500,
            message: '短信发送失败，请稍后重试'
        })
    }

    return {
        success: true,
        message: '验证码已发送'
    }
})
