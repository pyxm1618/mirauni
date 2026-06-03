/**
 * 重置密码 API (忘记密码流程)
 * POST /api/auth/reset-password
 * Body: { phone: string, code: string, newPassword: string }
 */
import { serverSupabaseServiceRole } from '#supabase/server'
import { hashPassword } from '../../utils/password'

export default defineEventHandler(async (event) => {
    const { phone, code, newPassword } = await readBody(event)

    if (!phone || !code || !newPassword) {
        throw createError({
            statusCode: 400,
            message: '参数不完整'
        })
    }

    if (newPassword.length < 6) {
        throw createError({
            statusCode: 400,
            message: '密码长度至少为6位'
        })
    }

    const supabaseAdmin = serverSupabaseServiceRole(event)

    // 1. 验证验证码
    // 开发模式支持万能验证码
    const isDevMasterCode = process.dev && code === '888888'

    if (!isDevMasterCode) {
        const { data: smsData, error: smsError } = await supabaseAdmin
            .from('sms_codes')
            .select()
            .eq('phone', phone)
            .eq('code', code)
            .gt('expires_at', new Date().toISOString())
            .single()

        if (smsError || !smsData) {
            throw createError({
                statusCode: 400,
                message: '验证码错误或已过期'
            })
        }

        // 删除验证码
        await supabaseAdmin.from('sms_codes').delete().eq('phone', phone)
    }

    // 2. 查找用户
    const { data: user } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single()

    if (!user || !user.id || user.id === 'undefined') {
        throw createError({
            statusCode: 400,
            message: '用户不存在'
        })
    }

    // 3. 更新密码哈希
    const hashedPassword = await hashPassword(newPassword)
    
    // 确保 secret 存在
    // 仅更新存在的 secret 并确认受影响行数
    const { data: secretData, error: secretError } = await supabaseAdmin
        .from('user_secrets')
        .update({ password_hash: hashedPassword })
        .eq('user_id', user.id)
        .select('user_id')
    
    if (secretError || !secretData || secretData.length === 0) {
        console.error('重置密码失败 (user_secrets):', secretError, secretData)
        throw createError({
            statusCode: 500,
            message: '重置密码失败，用户凭证不存在或不可更新'
        })
    }

    // 4. 更新 users.has_password
    const { error: userError } = await supabaseAdmin
        .from('users')
        .update({ has_password: true })
        .eq('id', user.id)

    if (userError) {
        console.error('更新用户状态失败:', userError)
        throw createError({
            statusCode: 500,
            message: '重置密码失败'
        })
    }

    return {
        success: true,
        message: '密码重置成功，请使用新密码登录'
    }
})
