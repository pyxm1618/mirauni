import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const { data: { user } } = await client.auth.getUser()

    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const body = await readBody(event)
    const { weekly_hours, work_days, background, constraints } = body

    // Validate
    if (weekly_hours !== undefined && (weekly_hours < 1 || weekly_hours > 168)) {
        throw createError({ statusCode: 400, message: '每周小时数必须在 1-168 之间' })
    }

    if (work_days !== undefined && (!Array.isArray(work_days) || work_days.length === 0)) {
        throw createError({ statusCode: 400, message: '请至少选择一个工作日' })
    }

    // Upsert profile
    const { data, error } = await client
        .from('user_profiles')
        .upsert({
            user_id: user.id,
            weekly_hours: weekly_hours ?? 20,
            work_days: work_days ?? [1, 2, 3, 4, 5],
            background: background ?? 'other',
            constraints: constraints ?? [],
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id'
        })
        .select()
        .single()

    if (error) {
        throw createError({ statusCode: 500, message: error.message })
    }

    return { success: true, profile: data }
})
