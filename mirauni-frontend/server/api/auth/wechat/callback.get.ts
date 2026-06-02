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
import crypto from 'crypto'
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
            if (process.dev) console.log('[微信登录] state 解析失败，使用默认跳转')
        }
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

        // 3. 查找已绑定微信的用户 (改用 service_role 绕过 RLS 限制)
        if (process.dev) console.log('[微信登录] 查询数据库，openid:', tokenData.openid)
        const { data: existingUser, error: queryError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('wechat_openid', tokenData.openid)
            .single()

        // 忽略 PGRST116 错误（未找到记录）
        if (queryError && queryError.code !== 'PGRST116') {
            throw new Error('数据库查询失败')
        }

        if (process.dev) console.log('[微信登录] 用户查询结果:', existingUser ? '找到已绑定用户' : '新用户')

        // 辅助函数：使用 crypto.randomBytes 生成高强度的强随机密码，绝不用 Math.random()
        const generateSafePassword = () => {
            return crypto.randomBytes(32).toString('base64url') + 'Aa1!'
        }

        if (existingUser) {
            if (process.dev) console.log('[微信登录] 老用户登录流程，user_id:', existingUser.id)

            // 从 user_secrets 查找专属的高安全随机密码，禁止 deterministic 派生
            const { data: secret } = await supabaseAdmin
                .from('user_secrets')
                .select('supabase_password')
                .eq('user_id', existingUser.id)
                .single()

            let supabasePassword = secret?.supabase_password

            if (!supabasePassword) {
                if (process.dev) console.log(`[微信登录] 迁移老用户 ${existingUser.id} 凭证体系`)
                supabasePassword = generateSafePassword()
                
                // 更新 Auth 密码
                await supabaseAdmin.auth.admin.updateUserById(existingUser.id, { password: supabasePassword })
                
                // 插入 Secret
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

            // 更新用户头像（如果微信头像有更新，使用 service_role 代理更新）
            if (wxUserInfo.headimgurl && wxUserInfo.headimgurl !== existingUser.avatar_url) {
                await supabaseAdmin
                    .from('users')
                    .update({
                        avatar_url: wxUserInfo.headimgurl,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existingUser.id)
            }

            // 使用客户端 supabase 设置 session（由于此时有 JWT_SECRET，在后端直接 setSession 并写入 Cookie）
            const supabase = await serverSupabaseClient(event)
            if (signInData.session) {
                await supabase.auth.setSession({
                    access_token: signInData.session.access_token,
                    refresh_token: signInData.session.refresh_token
                })

                // 如果来自钱途，安全降级直接跳转
                if (fromPlan && redirectUrl !== '/') {
                    try {
                        const targetUrl = new URL(redirectUrl)
                        return sendRedirect(event, targetUrl.origin)
                    } catch (e) {
                        if (process.dev) console.error('[微信登录] redirect URL 解析失败:', e)
                    }
                }
            }

            return sendRedirect(event, redirectUrl)
        }

        // 4. 新用户，临时直接创建账号（跳过手机绑定）
        if (process.dev) console.log('[微信登录] 新用户，直接创建账号')

        // 使用 openid 生成账号凭证
        const newUserEmail = `wx_${tokenData.openid}@wechat.mirauni.com`
        const newUserPassword = generateSafePassword()

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
            throw new Error('创建账号失败')
        }

        if (process.dev) console.log('[微信登录] Auth 用户创建成功:', signUpData.user.id)

        // 4.2 在 users 表创建记录
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
            // 回滚：安全删除刚刚创建的 Auth 用户以防悬挂脏数据
            await supabaseAdmin.auth.admin.deleteUser(signUpData.user.id)
            throw new Error('注册失败，请稍后重试')
        }

        // 4.3 写入安全凭据 secret
        await supabaseAdmin.from('user_secrets').insert({
            user_id: signUpData.user.id,
            supabase_password: newUserPassword
        })

        // 4.4 登录新用户
        const { data: newSignInData, error: newSignInError } = await supabaseAdmin.auth.signInWithPassword({
            email: newUserEmail,
            password: newUserPassword
        })

        if (newSignInError || !newSignInData.session) {
            throw new Error('登录失败')
        }

        // 设置 session
        const supabase = await serverSupabaseClient(event)
        await supabase.auth.setSession({
            access_token: newSignInData.session.access_token,
            refresh_token: newSignInData.session.refresh_token
        })

        if (process.dev) console.log('[微信登录] 新用户创建并登录成功')

        // 如果来自钱途，安全降级直接跳转
        if (fromPlan && redirectUrl !== '/') {
            try {
                const targetUrl = new URL(redirectUrl)
                return sendRedirect(event, targetUrl.origin)
            } catch (e) {
                console.error('[微信登录] redirect URL 解析失败:', e)
            }
        }

        return sendRedirect(event, redirectUrl)

    } catch (error: any) {
        if (process.dev) {
            console.error('[微信登录] 异常捕获:', error)
            console.error('[微信登录] 错误堆栈:', error.stack)
        } else {
            console.error('[微信登录] 登录失败')
        }
        const errorMsg = '微信登录失败'
        return sendRedirect(event, `/login?error=${encodeURIComponent(errorMsg)}`)
    }
})
