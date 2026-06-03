/**
 * 校验重置密码验证码有效性接口 (仅预检, 不删除)
 * POST /api/auth/check-reset-code
 * Body: { phone: string, code: string }
 */
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const { phone, code } = await readBody(event)

    // 1. 校验手机号格式 (防暴力输入)
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
        throw createError({
            statusCode: 400,
            message: '验证码错误或已过期'
        })
    }

    // 2. 校验验证码格式 (防暴破尝试)
    if (!code || !/^\d{6}$/.test(code)) {
        throw createError({
            statusCode: 400,
            message: '验证码错误或已过期'
        })
    }

    const supabaseAdmin = serverSupabaseServiceRole(event)

    // 开发模式支持万能验证码
    const isDevMasterCode = process.dev && code === '888888'

    if (!isDevMasterCode) {
        const { data: smsData, error: smsError } = await supabaseAdmin
            .from('sms_codes')
            .select()
            .eq('phone', phone)
            .eq('code', code)
            .gt('expires_at', new Date().toISOString())
            .maybeSingle()

        if (smsError || !smsData) {
            throw createError({
                statusCode: 400,
                message: '验证码错误或已过期'
            })
        }
    }

    return {
        success: true,
        message: '验证码验证通过'
    }
})
