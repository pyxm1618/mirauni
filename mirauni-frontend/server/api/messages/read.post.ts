import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { z } from 'zod'

const readBodySchema = z.object({
    conversationId: z.string().uuid()
})

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const body = await readBody(event)
    const result = readBodySchema.safeParse(body)
    if (!result.success) {
        throw createError({ statusCode: 400, message: 'Validation Error' })
    }
    const { conversationId } = result.data

    const client = await serverSupabaseClient(event)

    const { error } = await client
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('to_user_id', user.id)
        .eq('is_read', false)

    if (error) {
        throw createError({ statusCode: 500, message: error.message })
    }

    return { success: true }
})
