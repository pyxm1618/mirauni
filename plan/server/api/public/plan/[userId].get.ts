import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const userId = getRouterParam(event, 'userId')
    const client = await serverSupabaseClient(event)

    // 1. Get User Profile (Mocking nickname from metadata or email for now)
    // Supabase auth.users is not directly accessible usually via client unless public wrapper.
    // We assume there's a profiles table or we use metadata if stored in a public accessibility way.
    // For MVP, if we don't have public profiles table, we might struggle to get nickname.
    // Let's Assume we can query the 'goals' table which we made RLS public readable for specific columns?
    // Or simpler: We use a server-side admin client to fetch user metadata if needed.
    // BUT: 'serverSupabaseClient' uses the user's session.
    // To fetch ANOTHER user's data publicly, we usually need 'serverSupabaseServiceRole' OR
    // specific RLS rules that allow 'select' on goals for 'anon' role.

    // Let's assume RLS allows reading 'goals' status/income if we have the ID.
    // And for nickname, maybe we just use "神秘搞钱人" if we can't fetch profile efficiently without auth.

    // Try to fetch Goal
    const { data: goal, error } = await client
        .from('goals')
        .select('income_target, created_at')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()

    if (error || !goal) {
        throw createError({ statusCode: 404, message: 'Plan not found' })
    }

    // We try to fetch user details. 
    // NOTE: In real app, create a 'profiles' table.
    // For this MVP, we return a placeholder nickname.
    const nickname = "搞钱合伙人"

    return {
        userId,
        nickname,
        incomeTarget: goal.income_target,
        createdAt: goal.created_at
    }
})
