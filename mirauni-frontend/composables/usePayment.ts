/**
 * 支付相关的组合式函数
 */
export function usePayment() {
    const user = useSupabaseUser()

    // 套餐定义
    const packages = [
        { id: 'basic', name: '基础包', price: 30, credits: 10, perCredit: 3.0 },
        { id: 'standard', name: '标准包', price: 50, credits: 30, perCredit: 1.67 },
        { id: 'premium', name: '高级包', price: 100, credits: 100, perCredit: 1.0 }
    ] as const

    /**
     * 创建订单
     */
    async function createOrder(packageId: string) {
        const { data, error } = await useFetch('/api/payment/create-order', {
            method: 'POST',
            body: { packageId }
        })

        if (error.value) {
            throw new Error(error.value.message || '创建订单失败')
        }

        return data.value
    }

    /**
     * 发起微信支付
     */
    async function payWithWechat(orderNo: string) {
        // 调用微信 JSAPI 支付
        // TODO: 实现微信支付逻辑
        console.log('Pay with wechat:', orderNo)
    }

    /**
     * 检查用户解锁次数
     */
    async function checkCredits() {
        if (!user.value) return 0

        const supabase = useSupabaseClient()
        const { data } = await supabase
            .from('users')
            .select('unlock_credits')
            .eq('id', user.value.id)
            .single()

        return data?.unlock_credits || 0
    }

    /**
     * 解锁用户
     */
    async function unlockUser(targetUserId: string, projectId?: string) {
        const { data, error } = await useFetch('/api/unlock', {
            method: 'POST',
            body: { targetUserId, projectId }
        })

        if (error.value) {
            throw new Error(error.value.message || '解锁失败')
        }

        return data.value
    }

    return {
        packages,
        createOrder,
        payWithWechat,
        checkCredits,
        unlockUser
    }
}
