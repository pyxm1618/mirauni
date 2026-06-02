import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const { data: { user } } = await client.auth.getUser()

    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const body = await readBody(event)

    if (!body.amount || body.amount <= 0) {
        throw createError({ statusCode: 400, message: 'Amount is required and must be positive' })
    }

    // Get user's active goal
    const { data: goal } = await client
        .from('goals')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

    const { data, error } = await client.from('income').insert({
        user_id: user.id,
        goal_id: goal?.id || null,
        project_id: body.project_id || null,
        amount: body.amount,
        note: body.note || null
    }).select().single()

    if (error) {
        throw createError({ statusCode: 500, message: error.message })
    }

    return data
})
