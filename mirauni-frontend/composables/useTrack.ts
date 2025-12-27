/**
 * 前端埋点工具
 * 用于追踪用户行为，支持自动捕获页面信息
 */
export function useTrack() {
    const user = useSupabaseUser()

    /**
     * 发送埋点事件
     * @param eventName 事件名称，如 'page_view', 'project_view', 'unlock_click'
     * @param params 事件参数
     */
    async function track(eventName: string, params?: Record<string, any>) {
        // 仅在客户端执行
        if (!import.meta.client) return

        try {
            await $fetch('/api/track', {
                method: 'POST',
                body: {
                    event_name: eventName,
                    event_params: params,
                    page_url: window.location.href,
                    referrer: document.referrer
                }
            })
        } catch (e) {
            // 埋点失败不影响用户体验，仅打印警告
            console.warn('[Track] Failed:', e)
        }
    }

    /**
     * 页面浏览事件
     */
    function trackPageView(pageName?: string) {
        track('page_view', { page: pageName || document.title })
    }

    /**
     * 项目浏览事件
     */
    function trackProjectView(projectId: string) {
        track('project_view', { project_id: projectId })
    }

    /**
     * 开发者主页浏览事件
     */
    function trackDeveloperView(username: string) {
        track('developer_view', { username })
    }

    /**
     * 解锁点击事件
     */
    function trackUnlockClick(targetId: string, type: 'user' | 'project') {
        track('unlock_click', { target_id: targetId, type })
    }

    /**
     * 解锁成功事件
     */
    function trackUnlockSuccess(targetId: string, type: 'user' | 'project') {
        track('unlock_success', { target_id: targetId, type })
    }

    /**
     * 充值点击事件
     */
    function trackRechargeClick(packageId: string) {
        track('recharge_click', { package_id: packageId })
    }

    /**
     * 充值成功事件
     */
    function trackRechargeSuccess(packageId: string, amount: number) {
        track('recharge_success', { package_id: packageId, amount })
    }

    /**
     * 消息发送事件
     */
    function trackMessageSend(toUserId: string) {
        track('message_send', { to_user_id: toUserId })
    }

    /**
     * 注册成功事件
     */
    function trackRegister(method: 'phone' | 'wechat') {
        track('register', { method })
    }

    /**
     * 登录成功事件
     */
    function trackLogin(method: 'phone' | 'wechat') {
        track('login', { method })
    }

    return {
        track,
        trackPageView,
        trackProjectView,
        trackDeveloperView,
        trackUnlockClick,
        trackUnlockSuccess,
        trackRechargeClick,
        trackRechargeSuccess,
        trackMessageSend,
        trackRegister,
        trackLogin
    }
}
