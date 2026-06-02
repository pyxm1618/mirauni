/**
 * 微信绑定手机号 API
 * POST /api/auth/bind-phone
 * Body: { phone: string, code: string, openid?: string, wxData?: object }
 * 
 * 用于微信首次登录时绑定手机号
 */
import crypto from 'crypto'
import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { phone, code, openid, wxData } = body

    // 验证参数
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
        throw createError({
            statusCode: 400,
            message: '请输入正确的手机号'
        })
    }

    if (!code || !/^\d{6}$/.test(code)) {
        throw createError({
            statusCode: 400,
            message: '请输入6位验证码'
        })
    }

    if (!openid && !wxData?.openid) {
        throw createError({
            statusCode: 400,
            message: '微信信息缺失'
        })
    }

    const wechatOpenid = openid || wxData?.openid
    const wechatUnionid = wxData?.unionid
    const wechatNickname = wxData?.nickname
    const wechatAvatar = wxData?.avatar

    const supabase = await serverSupabaseClient(event)
    const supabaseAdmin = serverSupabaseServiceRole(event)

    // 1. 验证验证码 (使用 supabaseAdmin，因为 sms_codes 已启用严格 RLS)
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

    // 删除验证码 (使用 supabaseAdmin)
    await supabaseAdmin.from('sms_codes').delete().eq('phone', phone)

    // 2. 检查手机号是否已被其他账号使用 (使用 supabaseAdmin 绕过 RLS 限制)
    const { data: existingPhoneUser } = await supabaseAdmin
        .from('users')
        .select('id, username, wechat_openid')
        .eq('phone', phone)
        .single()

    // 3. 检查微信是否已绑定其他账号 (使用 supabaseAdmin 绕过 RLS 限制)
    const { data: existingWxUser } = await supabaseAdmin
        .from('users')
        .select('id, phone')
        .eq('wechat_openid', wechatOpenid)
        .single()

    if (existingWxUser) {
        throw createError({
            statusCode: 400,
            message: '该微信已绑定其他手机号'
        })
    }

    const generateSafePassword = () => {
        return crypto.randomBytes(32).toString('base64url') + 'Aa1!'
    }

    const email = `${phone}@phone.mirauni.com`
    let supabasePassword
    let user

    if (existingPhoneUser) {
        // 手机号已存在，绑定微信到已有账号
        if (existingPhoneUser.wechat_openid && existingPhoneUser.wechat_openid !== wechatOpenid) {
            throw createError({
                statusCode: 400,
                message: '该手机号已绑定其他微信'
            })
        }

        // 从 user_secrets 查找专属的高安全随机密码，禁止 deterministic 派生
        const { data: secret } = await supabaseAdmin
            .from('user_secrets')
            .select('supabase_password')
            .eq('user_id', existingPhoneUser.id)
            .single()

        supabasePassword = secret?.supabase_password

        if (!supabasePassword) {
            supabasePassword = generateSafePassword()
            await supabaseAdmin.auth.admin.updateUserById(existingPhoneUser.id, { password: supabasePassword })
            await supabaseAdmin.from('user_secrets').upsert({
                user_id: existingPhoneUser.id,
                supabase_password: supabasePassword
            })
        }

        // 更新用户的微信信息
        const { data: updatedUser, error: updateError } = await supabaseAdmin
            .from('users')
            .update({
                wechat_openid: wechatOpenid,
                wechat_unionid: wechatUnionid,
                avatar_url: wechatAvatar || undefined,
                username: existingPhoneUser.username || wechatNickname,
                updated_at: new Date().toISOString()
            })
            .eq('id', existingPhoneUser.id)
            .select()
            .single()

        if (updateError) {
            throw createError({
                statusCode: 500,
                message: '绑定失败'
            })
        }

        user = updatedUser
    } else {
        // 新用户，生成强随机密码并创建账号
        supabasePassword = generateSafePassword()

        // 4.1 创建 Supabase Auth 用户
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: supabasePassword,
            email_confirm: true,
            user_metadata: { phone }
        })

        if (authError) {
            console.error('创建 Auth 用户失败:', authError)
            throw createError({
                statusCode: 500,
                message: '注册失败'
            })
        }

        // 4.2 创建 users 表记录
        const { data: newUser, error: insertError } = await supabaseAdmin
            .from('users')
            .insert({
                id: authUser.user.id,
                phone,
                wechat_openid: wechatOpenid,
                wechat_unionid: wechatUnionid,
                username: wechatNickname,
                avatar_url: wechatAvatar,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single()

        if (insertError) {
            // 回滚
            await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
            throw createError({
                statusCode: 500,
                message: '注册失败'
            })
        }

        // 4.3 写入安全凭据 secret
        await supabaseAdmin.from('user_secrets').insert({
            user_id: authUser.user.id,
            supabase_password: supabasePassword
        })

        user = newUser
    }

    // 5. 登录用户
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password: supabasePassword
    })

    if (signInError) {
        throw createError({
            statusCode: 500,
            message: '登录失败'
        })
    }

    return {
        success: true,
        user: {
            id: user.id,
            phone: user.phone,
            username: user.username,
            avatar_url: user.avatar_url,
            unlock_credits: user.unlock_credits,
            is_first_charge: user.is_first_charge
        },
        session: signInData.session ? {
            access_token: signInData.session.access_token,
            refresh_token: signInData.session.refresh_token,
            expires_at: signInData.session.expires_at
        } : null
    }
})
