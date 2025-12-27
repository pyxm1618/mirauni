import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    const id = event.context.params?.id

    if (!id) {
        throw createError({ statusCode: 400, message: 'ID required' })
    }

    const client = await serverSupabaseClient(event)

    // 1. Check if self
    if (user && user.id === id) {
        const { data } = await client.from('users').select('phone, wechat_id, email').eq('id', id).single()
        return { success: true, data }
    }

    // 2. Check if unlocked
    let isUnlocked = false
    if (user) {
        const { data } = await client
            .from('unlocks')
            .select('id')
            .eq('user_id', user.id)
            .eq('target_user_id', id)
            .single()
        isUnlocked = !!data
    }

    if (!isUnlocked) {
        // Return masked data or 403
        // Requirements say "Pay to Unlock". So likely we return 403 or specific code.
        throw createError({ statusCode: 403, message: 'Contact info locked' })
    }

    // 3. Return contact info
    const { data, error } = await client
        .from('users')
        .select('phone, wechat_id, email')
        .eq('id', id)
        .single()

    if (error) {
        throw createError({ statusCode: 404, message: 'User not found' })
    }

    return { success: true, data }
})
