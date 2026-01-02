/**
 * Composable to check if user has an active plan
 * Used for routing between exploration mode and execution mode
 */
export const useActivePlan = () => {
    const client = useSupabaseClient()
    const user = useSupabaseUser()

    const hasActivePlan = ref<boolean | null>(null)
    const isLoading = ref(true)
    const activeGoal = ref<any>(null)

    async function checkActivePlan(): Promise<boolean> {
        if (!user.value) {
            hasActivePlan.value = false
            isLoading.value = false
            return false
        }

        try {
            const { data: goals } = await client
                .from('goals')
                .select('id, status, income_target')
                .eq('user_id', user.value.id)
                .eq('status', 'active')
                .limit(1)

            const goal = goals?.[0] || null
            activeGoal.value = goal
            hasActivePlan.value = !!goal
            return !!goal
        } catch (e) {
            console.error('Failed to check active plan:', e)
            hasActivePlan.value = false
            return false
        } finally {
            isLoading.value = false
        }
    }

    // Auto-check on mount if we have a user
    if (import.meta.client && user.value) {
        checkActivePlan()
    }

    // Watch user changes
    watch(user, (newUser) => {
        if (newUser) {
            checkActivePlan()
        } else {
            hasActivePlan.value = false
            activeGoal.value = null
        }
    })

    return {
        hasActivePlan,
        isLoading,
        activeGoal,
        checkActivePlan
    }
}
