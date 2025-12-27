/**
 * 发送短信验证码
 */
export default defineEventHandler(async (event) => {
    const { phone } = await readBody(event)

    // 验证手机号
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
        throw createError({
            statusCode: 400,
            message: '请输入正确的手机号'
        })
    }

    const supabase = await serverSupabaseClient(event)

    // 生成 6 位验证码
    const code = Math.random().toString().slice(-6)

    // 存储验证码（5分钟有效）
    const { error } = await supabase.from('sms_codes').upsert({
        phone,
        code,
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    }, {
        onConflict: 'phone'
    })

    if (error) {
        console.error('Save code error:', error)
        throw createError({
            statusCode: 500,
            message: '发送验证码失败'
        })
    }

    // TODO: 调用阿里云短信发送
    // await sendAliyunSms(phone, code)

    // 开发环境打印验证码
    if (process.dev) {
        console.log(`[DEV] SMS Code for ${phone}: ${code}`)
    }

    return {
        success: true,
        message: '验证码已发送'
    }
})
