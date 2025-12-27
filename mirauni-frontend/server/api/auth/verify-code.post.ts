/**
 * 验证码登录
 */
export default defineEventHandler(async (event) => {
    const { phone, code } = await readBody(event)

    // 验证参数
    if (!phone || !code) {
        throw createError({
            statusCode: 400,
            message: '手机号和验证码不能为空'
        })
    }

    const supabase = await serverSupabaseClient(event)

    // 验证验证码
    const { data: smsData, error: smsError } = await supabase
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

    // 查找或创建用户
    let { data: user } = await supabase
        .from('users')
        .select()
        .eq('phone', phone)
        .single()

    if (!user) {
        // 创建新用户
        const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert({ phone })
            .select()
            .single()

        if (createError) {
            throw createError({
                statusCode: 500,
                message: '创建用户失败'
            })
        }

        user = newUser
    }

    // 删除已使用的验证码
    await supabase.from('sms_codes').delete().eq('phone', phone)

    // TODO: 生成 JWT Token 或使用 Supabase Auth

    return {
        success: true,
        user: {
            id: user.id,
            phone: user.phone,
            username: user.username,
            avatar_url: user.avatar_url
        }
    }
})
