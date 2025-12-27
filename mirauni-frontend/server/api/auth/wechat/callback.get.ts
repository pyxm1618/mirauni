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
            // 用户已存在，直接登录
            const email = `${existingUser.phone}@phone.mirauni.com`
            const password = `mirauni_${existingUser.phone}_secure_pwd`

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
            }

            return sendRedirect(event, '/')
        }

        // 4. 新用户，需要绑定手机号
        console.log('[微信登录] 新用户，准备跳转到绑定手机号页面')
        console.log('[微信登录] OpenID:', tokenData.openid)
        console.log('[微信登录] 用户信息:', wxUserInfo.nickname)

        // 将微信信息临时存储（或通过 URL 参数传递）
        const wxData = encodeURIComponent(JSON.stringify({
            openid: tokenData.openid,
            unionid: tokenData.unionid || wxUserInfo.unionid,
            nickname: wxUserInfo.nickname,
            avatar: wxUserInfo.headimgurl
        }))

        const bindphoneUrl = `/bindphone?wx=${wxData}`
        console.log('[微信登录] 跳转 URL:', bindphoneUrl.substring(0, 100) + '...')

        return sendRedirect(event, bindphoneUrl)

    } catch (error: any) {
        console.error('[微信登录] 异常捕获:', error)
        console.error('[微信登录] 错误堆栈:', error.stack)
        const errorMsg = error.message || '微信登录失败'
        console.error('[微信登录] 跳转到登录页，错误信息:', errorMsg)
        return sendRedirect(event, `/login?error=${encodeURIComponent(errorMsg)}`)
    }
})
