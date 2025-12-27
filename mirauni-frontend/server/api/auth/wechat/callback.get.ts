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
        // 1. 用 code 换取 access_token
        const tokenData = await getWechatAccessToken(code)

        // 2. 获取微信用户信息
        const wxUserInfo = await getWechatUserInfo(tokenData.access_token, tokenData.openid)

        const supabase = await serverSupabaseClient(event)
        const supabaseAdmin = serverSupabaseServiceRole(event)

        // 3. 查找已绑定微信的用户
        const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('wechat_openid', tokenData.openid)
            .single()

        if (existingUser) {
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

            // 设置 cookie 并跳转
            if (signInData.session) {
                // 将 session 信息通过 URL 传递（前端会处理）
                const sessionData = encodeURIComponent(JSON.stringify({
                    access_token: signInData.session.access_token,
                    refresh_token: signInData.session.refresh_token
                }))
                return sendRedirect(event, `/?wechat_session=${sessionData}`)
            }

            return sendRedirect(event, '/')
        }

        // 4. 新用户，需要绑定手机号
        // 将微信信息临时存储（或通过 URL 参数传递）
        const wxData = encodeURIComponent(JSON.stringify({
            openid: tokenData.openid,
            unionid: tokenData.unionid || wxUserInfo.unionid,
            nickname: wxUserInfo.nickname,
            avatar: wxUserInfo.headimgurl
        }))

        return sendRedirect(event, `/bindphone?wx=${wxData}`)

    } catch (error: any) {
        console.error('微信登录异常:', error)
        return sendRedirect(event, `/login?error=${encodeURIComponent(error.message || '微信登录失败')}`)
    }
})
