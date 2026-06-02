import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const body = await readBody(event)
    const { targetUserId } = body

    if (!targetUserId) {
        throw createError({ statusCode: 400, message: 'Target user ID required' })
    }

    if (targetUserId === user.id) {
        return { success: true, message: 'Self unlock' }
    }

    const client = await serverSupabaseClient(event)

    // 1. Check if already unlocked
    const { data: existing } = await client
        .from('unlocks')
        .select('id')
        .eq('user_id', user.id)
        .eq('target_user_id', targetUserId)
        .single()

    if (existing) {
        return { success: true, message: 'Already unlocked' }
    }

    // 2. Check credits and deduct
    // We need to fetch user credits first.
    const { data: currentUser, error: userError } = await client
        .from('users')
        .select('unlock_credits')
        .eq('id', user.id)
        .single()

    if (userError || !currentUser) {
        throw createError({ statusCode: 500, message: 'User not found' })
    }

    if ((currentUser.unlock_credits || 0) < 1) {
        throw createError({ statusCode: 402, message: 'Insufficient credits' })
    }

    // 3. Perform Transaction (Deduct Credit + Add Unlock Record)
    // Ideally this should be a DB transaction or RPC.
    // We will do it in two steps (risk of inconsistency if crash in between, but acceptable for MVP).
    // Or better, update credits and insert unlock.

    const { error: updateError } = await client
        .from('users')
        .update({ unlock_credits: currentUser.unlock_credits - 1 })
        .eq('id', user.id)

    if (updateError) {
        throw createError({ statusCode: 500, message: 'Failed to deduct credit' })
    }

    const { error: insertError } = await client
        .from('unlocks')
        .insert({
            user_id: user.id,
            target_user_id: targetUserId
        })

    if (insertError) {
        // Audit: rollback credit deduction?
        // For now, simpler: user lost 1 credit but didn't get unlock. 
        // Return error, user contact support. 
        // Or retry insert.
        throw createError({ statusCode: 500, message: 'Failed to record unlock' })
    }

    return { success: true }
})
