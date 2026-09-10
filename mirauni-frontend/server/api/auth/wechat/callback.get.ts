/**
 * 微信登录回调处理
 * GET /api/auth/wechat/callback
 * Query: { code: string, state: string }
 */
import crypto from 'crypto'
import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'
import { getWechatAccessToken, getWechatUserInfo } from '~/server/utils/wechat'
import {
    normalizeInternalRedirect,
    oauthStatesMatch,
    verifyWechatOAuthState
} from '~/server/utils/wechat-oauth-state'

const STATE_COOKIE = 'mirauni_wechat_oauth_state'
const REDIRECT_COOKIE = 'mirauni_wechat_oauth_redirect'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const { code, state } = query
    const expectedState = getCookie(event, STATE_COOKIE)
    const redirectUrl = normalizeInternalRedirect(getCookie(event, REDIRECT_COOKIE))

    // state 一次性消费；任何回调尝试后都不能复用。
    deleteCookie(event, STATE_COOKIE, { path: '/api/auth/wechat' })
    deleteCookie(event, REDIRECT_COOKIE, { path: '/api/auth/wechat' })

    const stateSecret = process.env.JWT_SECRET || (process.dev ? 'dev-only-wechat-oauth-state-secret' : '')
    const stateValid = Boolean(
        stateSecret &&
        typeof state === 'string' &&
        expectedState &&
        verifyWechatOAuthState(state, stateSecret) &&
        oauthStatesMatch(state, expectedState)
    )

    if (!stateValid) {
        return sendRedirect(event, `/login?error=${encodeURIComponent('微信授权状态无效或已过期')}`)
    }

    if (!code || typeof code !== 'string') {
        return sendRedirect(event, `/login?error=${encodeURIComponent('微信授权失败')}`)
    }

    const config = useRuntimeConfig()

    // 开发环境且未配置微信，模拟登录
    if (process.dev && !config.wechatAppId) {
        if (process.dev) console.log('[DEV] 微信登录未配置，跳转到绑定手机号页面')
        return sendRedirect(event, `/bindphone?openid=dev_test_openid_${Date.now()}`)
    }

    try {
        if (process.dev) console.log('[微信登录] 开始处理回调，code:', code.substring(0, 10) + '...')

        // 1. 用 code 换取 access_token
        const tokenData = await getWechatAccessToken(code)
        if (process.dev) console.log('[微信登录] 获取 access_token 成功，openid:', tokenData.openid)

        // 2. 获取微信用户信息
        const wxUserInfo = await getWechatUserInfo(tokenData.access_token, tokenData.openid)
        if (process.dev) console.log('[微信登录] 获取用户信息成功，nickname:', wxUserInfo.nickname)

        const supabaseAdmin = serverSupabaseServiceRole(event)

        // 3. 查找已绑定微信的用户
        if (process.dev) console.log('[微信登录] 查询数据库，openid:', tokenData.openid)
        const { data: existingUser, error: queryError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('wechat_openid', tokenData.openid)
            .single()

        if (queryError && queryError.code !== 'PGRST116') {
            throw new Error('数据库查询失败')
        }

        if (process.dev) console.log('[微信登录] 用户查询结果:', existingUser ? '找到已绑定用户' : '新用户')

        const generateSafePassword = () => {
            return crypto.randomBytes(32).toString('base64url') + 'Aa1!'
        }

        if (existingUser) {
            if (process.dev) console.log('[微信登录] 老用户登录流程，user_id:', existingUser.id)

            const { data: secret } = await supabaseAdmin
                .from('user_secrets')
                .select('supabase_password')
                .eq('user_id', existingUser.id)
                .single()

            let supabasePassword = secret?.supabase_password

            if (!supabasePassword) {
                if (process.dev) console.log(`[微信登录] 迁移老用户 ${existingUser.id} 凭证体系`)
                supabasePassword = generateSafePassword()

                await supabaseAdmin.auth.admin.updateUserById(existingUser.id, { password: supabasePassword })
                await supabaseAdmin.from('user_secrets').upsert({
                    user_id: existingUser.id,
                    supabase_password: supabasePassword
                })
            }

            const email = existingUser.phone
                ? `${existingUser.phone}@phone.mirauni.com`
                : `wx_${tokenData.openid}@wechat.mirauni.com`

            const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
                email,
                password: supabasePassword
            })

            if (signInError) {
                throw new Error('登录失败')
            }

            if (wxUserInfo.headimgurl && wxUserInfo.headimgurl !== existingUser.avatar_url) {
                await supabaseAdmin
                    .from('users')
                    .update({
                        avatar_url: wxUserInfo.headimgurl,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existingUser.id)
            }

            const supabase = await serverSupabaseClient(event)
            if (signInData.session) {
                await supabase.auth.setSession({
                    access_token: signInData.session.access_token,
                    refresh_token: signInData.session.refresh_token
                })
            }

            return sendRedirect(event, redirectUrl)
        }

        // 4. 新用户，直接创建账号
        if (process.dev) console.log('[微信登录] 新用户，直接创建账号')

        const newUserEmail = `wx_${tokenData.openid}@wechat.mirauni.com`
        const newUserPassword = generateSafePassword()

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
            throw new Error('创建账号失败')
        }

        if (process.dev) console.log('[微信登录] Auth 用户创建成功:', signUpData.user.id)

        const { error: insertError } = await supabaseAdmin
            .from('users')
            .insert({
                id: signUpData.user.id,
                wechat_openid: tokenData.openid,
                wechat_unionid: tokenData.unionid || wxUserInfo.unionid,
                username: wxUserInfo.nickname || `wx_${tokenData.openid.substring(0, 8)}`,
                avatar_url: wxUserInfo.headimgurl,
            })

        if (insertError) {
            if (process.dev) console.error('[微信登录] 创建用户记录失败:', insertError)
            await supabaseAdmin.auth.admin.deleteUser(signUpData.user.id)
            throw new Error('注册失败，请稍后重试')
        }

        await supabaseAdmin.from('user_secrets').insert({
            user_id: signUpData.user.id,
            supabase_password: newUserPassword
        })

        const { data: newSignInData, error: newSignInError } = await supabaseAdmin.auth.signInWithPassword({
            email: newUserEmail,
            password: newUserPassword
        })

        if (newSignInError || !newSignInData.session) {
            throw new Error('登录失败')
        }

        const supabase = await serverSupabaseClient(event)
        await supabase.auth.setSession({
            access_token: newSignInData.session.access_token,
            refresh_token: newSignInData.session.refresh_token
        })

        if (process.dev) console.log('[微信登录] 新用户创建并登录成功')
        return sendRedirect(event, redirectUrl)
    } catch (error: any) {
        if (process.dev) {
            console.error('[微信登录] 异常捕获:', error)
            console.error('[微信登录] 错误堆栈:', error.stack)
        } else {
            console.error('[微信登录] 登录失败')
        }
        return sendRedirect(event, `/login?error=${encodeURIComponent('微信登录失败')}`)
    }
})
