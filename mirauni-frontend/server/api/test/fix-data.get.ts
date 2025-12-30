
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = serverSupabaseServiceRole(event)

    // 目标: 修复手机号 15555555555 的用户数据
    const targetEmail = '15555555555@phone.mirauni.com'
    const targetPhone = '15555555555'

    // 1. 通过 Admin API 查找 Auth 用户
    const { data: authData, error: authError } = await client.auth.admin.listUsers({
        page: 1,
        perPage: 100
    })

    if (authError) {
        return { success: false, error: `Admin API error: ${authError.message}` }
    }

    const authUser = authData.users.find(u => u.email === targetEmail)
    if (!authUser) {
        return { success: false, error: `No auth user found with email: ${targetEmail}` }
    }

    const authId = authUser.id

    // 2. 确保 users 表有对应记录
    const { data: profile } = await client.from('users').select('id').eq('id', authId).single()

    let profileMsg = 'Profile already exists.'
    if (!profile) {
        const { error: insertError } = await client.from('users').insert({
            id: authId,
            phone: targetPhone,
            username: `dev_${targetPhone.slice(-4)}`,
            avatar_url: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
        if (insertError) {
            profileMsg = `Failed to create profile: ${insertError.message}`
        } else {
            profileMsg = 'Profile created successfully.'
        }
    }

    // 3. 修复孤儿项目 (user_id 为 NULL)
    const { data: updatedProjects, error: updateError } = await client
        .from('projects')
        .update({ user_id: authId })
        .is('user_id', null)
        .select()

    return {
        success: true,
        authUser: { id: authId, email: authUser.email },
        profileAction: profileMsg,
        fixedProjects: updatedProjects?.length || 0,
        projects: updatedProjects,
        updateError: updateError?.message
    }
})
