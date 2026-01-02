
import { serverSupabaseServiceRole, serverSupabaseClient } from '#supabase/server'
import { getWechatAccessToken, getWechatUserInfo } from '~/server/utils/wechat'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const { code } = query
    const config = useRuntimeConfig()

    if (!code || typeof code !== 'string') {
        return sendRedirect(event, '/login?error=微信授权失败')
    }

    try {
        // 1. 获取 Token
        const tokenData = await getWechatAccessToken(code)
        // 2. 获取用户信息
        const wxUserInfo = await getWechatUserInfo(tokenData.access_token, tokenData.openid)
        
        const supabaseAdmin = serverSupabaseServiceRole(event)
        
        // 3. 构建影子账号 Email
        // 使用特殊的 email 格式，避免与主站手机号冲突
        const shadowEmail = `wx_${tokenData.openid}@plan.mirauni.com`
        // 使用确定的密码算法 (生产环境建议更安全的方式，但此处为了能登录)
        const shadowPassword = `mirauni_wx_${tokenData.openid}_secure`

        // 4. 尝试登录 (检查用户是否存在)
        let { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
            email: shadowEmail,
            password: shadowPassword
        })

        if (signInError) {
            console.log('[微信登录] 用户不存在，创建新用户:', shadowEmail)
            
            // 5. 创建新用户
            const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
                email: shadowEmail,
                password: shadowPassword,
                email_confirm: true,
                user_metadata: {
                    nickname: wxUserInfo.nickname,
                    avatar_url: wxUserInfo.headimgurl,
                    wechat_openid: tokenData.openid,
                    wechat_unionid: tokenData.unionid,
                    source: 'money_path_shadow' // 标记来源
                }
            })

            if (signUpError) {
                throw signUpError
            }

            // 创建后再次登录以获取 Session
            const result = await supabaseAdmin.auth.signInWithPassword({
                email: shadowEmail,
                password: shadowPassword
            })
            signInData = result.data
            signInError = result.error
        }

        if (signInError || !signInData.session) {
            throw new Error('无法创建会话')
        }

        // 6. 设置 Session (关键：通过 cookie 传递给客户端)
        // 使用 serverSupabaseClient 的 setSession 方法? 
        // 不，serverSupabaseClient 是基于请求 cookie 的。
        // 我们需要手动设置 cookie 或者重定向带 token (不安全)。
        // Nuxt Supabase 模块提供了 helper?
        
        // 正确做法：
        // 此时我们在服务端，有了 session。我们需要让客户端也拥有这个 session。
        // 方法 A: Redirect with #access_token=... (Supabase standard implict flow)
        // 方法 B: Set Cookies manually (Supabase does this via helper).
        
        // 尝试方法 A (最通用):
        const redirectUrl = `/#access_token=${signInData.session.access_token}&refresh_token=${signInData.session.refresh_token}&type=recovery`
        return sendRedirect(event, redirectUrl)

    } catch (error: any) {
        console.error('[微信登录错误]', error)
        return sendRedirect(event, `/login?error=${encodeURIComponent(error.message)}`)
    }
})
