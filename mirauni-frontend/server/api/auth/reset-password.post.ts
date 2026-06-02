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

    if (!user) {
        throw createError({
            statusCode: 400,
            message: '用户不存在'
        })
    }

    // 3. 更新密码哈希
    const hashedPassword = await hashPassword(newPassword)
    
    // 确保 secret 存在 (如果用户存在但 secret 不存在，这里是修复的好时机，但需要 supabase_password)
    // 简单起见，只更新存在的 secret
    const { error: secretError } = await supabaseAdmin
        .from('user_secrets')
        .update({ password_hash: hashedPassword })
        .eq('user_id', user.id)
    
    if (secretError) {
        // 如果更新失败（例如无记录），尝试插入？
        // 这需要生成 supabase_password，比较复杂。
        // 假设 verify-code/login 流程已经保证了 secret 存在。
        // 如果这里失败，可能是数据不一致。
        console.error('重置密码失败 (user_secrets):', secretError)
        throw createError({
            statusCode: 500,
            message: '重置密码失败'
        })
    }

    // 4. 更新 users.has_password
    await supabaseAdmin
        .from('users')
        .update({ has_password: true })
        .eq('id', user.id)

    return {
        success: true,
        message: '密码重置成功，请使用新密码登录'
    }
})
