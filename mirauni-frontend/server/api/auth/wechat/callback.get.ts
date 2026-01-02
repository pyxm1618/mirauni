/**
 * 微信登录回调处理
 * GET /api/auth/wechat/callback
 * Query: { code: string, state: string }
 * 
 * 流程：
 * 1. 用 code 换取 access_token
 * 2. 获取微信用户信息
 * 3. 查找已绑定的用户或跳转到绑定手机号页面
 * 4. 登录成功后跳转到首页
 */
import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'
import { getWechatAccessToken, getWechatUserInfo } from '~/server/utils/wechat'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const { code, state } = query

    // 验证参数
    if (!code || typeof code !== 'string') {
        return sendRedirect(event, '/login?error=微信授权失败')
    }

    // 从 state 中解析 redirect 参数
    let redirectUrl = '/'
    let fromPlan = false
    if (state && typeof state === 'string') {
        try {
            const stateData = JSON.parse(Buffer.from(state, 'base64url').toString())
            if (stateData.redirect) {
                redirectUrl = decodeURIComponent(stateData.redirect)
                fromPlan = stateData.from === 'plan'
            }
        } catch (e) {
            console.log('[微信登录] state 解析失败，使用默认跳转')
        }
    }

    const config = useRuntimeConfig()

    // 开发环境且未配置微信，模拟登录
    if (process.dev && !config.wechatAppId) {
        console.log('[DEV] 微信登录未配置，跳转到绑定手机号页面')
        return sendRedirect(event, `/bindphone?openid=dev_test_openid_${Date.now()}`)
    }

    try {
        console.log('[微信登录] 开始处理回调，code:', code.substring(0, 10) + '...')

        // 1. 用 code 换取 access_token
        const tokenData = await getWechatAccessToken(code)
        console.log('[微信登录] 获取 access_token 成功，openid:', tokenData.openid)

        // 2. 获取微信用户信息
        const wxUserInfo = await getWechatUserInfo(tokenData.access_token, tokenData.openid)
        console.log('[微信登录] 获取用户信息成功，nickname:', wxUserInfo.nickname)

        const supabase = await serverSupabaseClient(event)
        const supabaseAdmin = serverSupabaseServiceRole(event)

        // 3. 查找已绑定微信的用户
        console.log('[微信登录] 查询数据库，openid:', tokenData.openid)
        const { data: existingUser, error: queryError } = await supabase
            .from('users')
            .select('*')
            .eq('wechat_openid', tokenData.openid)
            .single()

        // 忽略 PGRST116 错误（未找到记录）
        if (queryError && queryError.code !== 'PGRST116') {
            console.error('[微信登录] 数据库查询错误:', queryError)
            throw new Error('数据库查询失败')
        }

        console.log('[微信登录] 用户查询结果:', existingUser ? '找到已绑定用户' : '新用户')

        if (existingUser) {
            console.log('[微信登录] 老用户登录流程，user_id:', existingUser.id)

            // 根据用户是否有手机号，使用不同的登录凭证
            let email: string
            let password: string

            if (existingUser.phone) {
                // 手机号用户
                email = `${existingUser.phone}@phone.mirauni.com`
                password = `mirauni_${existingUser.phone}_secure_pwd`
            } else {
                // 纯微信用户（临时方案创建的用户）
                email = `wx_${tokenData.openid}@wechat.mirauni.com`
                password = `mirauni_wx_${tokenData.openid}_secure`
            }

            const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
                email,
                password
            })

            if (signInError) {
                console.error('微信登录失败:', signInError)
                return sendRedirect(event, '/login?error=登录失败，请重试')
            }

            // 更新用户头像（如果微信头像有更新）
            if (wxUserInfo.headimgurl && wxUserInfo.headimgurl !== existingUser.avatar_url) {
                await supabase
                    .from('users')
                    .update({
                        avatar_url: wxUserInfo.headimgurl,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existingUser.id)
            }

            // 使用客户端 supabase 设置 session（这会自动设置 cookie）
            if (signInData.session) {
                await supabase.auth.setSession({
                    access_token: signInData.session.access_token,
                    refresh_token: signInData.session.refresh_token
                })

                // 如果来自钱途，携带 SSO tokens 跳转回去
                if (fromPlan && redirectUrl !== '/') {
                    try {
                        const targetUrl = new URL(redirectUrl)
                        targetUrl.searchParams.set('sso_access', signInData.session.access_token)
                        targetUrl.searchParams.set('sso_refresh', signInData.session.refresh_token)
                        return sendRedirect(event, targetUrl.toString())
                    } catch (e) {
                        console.error('[微信登录] redirect URL 解析失败:', e)
                    }
                }
            }

            return sendRedirect(event, redirectUrl)
        }

        // 4. 新用户，临时跳过手机绑定（短信审核期间的临时方案）
        // TODO: 短信审核通过后，恢复跳转到绑定手机号页面
        console.log('[微信登录] 新用户，临时直接创建账号（跳过手机绑定）')
        console.log('[微信登录] OpenID:', tokenData.openid)
        console.log('[微信登录] 用户信息:', wxUserInfo.nickname)

        // 使用 openid 生成账号凭证
        const newUserEmail = `wx_${tokenData.openid}@wechat.mirauni.com`
        const newUserPassword = `mirauni_wx_${tokenData.openid}_secure`

        // 4.1 创建 Supabase Auth 用户
        const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
            email: newUserEmail,
            password: newUserPassword,
            email_confirm: true,
            user_metadata: {
                wechat_openid: tokenData.openid,
                nickname: wxUserInfo.nickname,
                avatar_url: wxUserInfo.headimgurl
            }
        })

        if (signUpError) {
            console.error('[微信登录] 创建用户失败:', signUpError)
            throw new Error('创建账号失败')
        }

        console.log('[微信登录] Auth 用户创建成功:', signUpData.user.id)

        // 4.2 在 users 表创建记录
        const { error: insertError } = await supabaseAdmin
            .from('users')
            .insert({
                id: signUpData.user.id,
                wechat_openid: tokenData.openid,
                wechat_unionid: tokenData.unionid || wxUserInfo.unionid,
                username: wxUserInfo.nickname || `wx_${tokenData.openid.substring(0, 8)}`,
                avatar_url: wxUserInfo.headimgurl,
                // phone 留空，后续可补绑定
            })

        if (insertError) {
            console.error('[微信登录] 创建用户记录失败:', insertError)
            // 不影响登录，继续执行
        }

        // 4.3 登录新用户
        const { data: newSignInData, error: newSignInError } = await supabaseAdmin.auth.signInWithPassword({
            email: newUserEmail,
            password: newUserPassword
        })

        if (newSignInError || !newSignInData.session) {
            console.error('[微信登录] 新用户登录失败:', newSignInError)
            throw new Error('登录失败')
        }

        // 设置 session
        await supabase.auth.setSession({
            access_token: newSignInData.session.access_token,
            refresh_token: newSignInData.session.refresh_token
        })

        console.log('[微信登录] 新用户创建并登录成功')

        // 如果来自钱途，携带 SSO tokens 跳转回去
        if (fromPlan && redirectUrl !== '/') {
            try {
                const targetUrl = new URL(redirectUrl)
                targetUrl.searchParams.set('sso_access', newSignInData.session.access_token)
                targetUrl.searchParams.set('sso_refresh', newSignInData.session.refresh_token)
                return sendRedirect(event, targetUrl.toString())
            } catch (e) {
                console.error('[微信登录] redirect URL 解析失败:', e)
            }
        }

        return sendRedirect(event, redirectUrl)

    } catch (error: any) {
        console.error('[微信登录] 异常捕获:', error)
        console.error('[微信登录] 错误堆栈:', error.stack)
        const errorMsg = error.message || '微信登录失败'
        console.error('[微信登录] 跳转到登录页，错误信息:', errorMsg)
        return sendRedirect(event, `/login?error=${encodeURIComponent(errorMsg)}`)
    }
})
