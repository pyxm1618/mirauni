import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

async function createAdmin() {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables are required!')
        process.exit(1)
    }

    const username = process.argv[2]
    const password = process.argv[3]
    const role = process.argv[4] || 'superadmin'

    if (!username || !password) {
        console.log('Usage: npx tsx scripts/create-admin.ts <username> <password> [role]')
        process.exit(1)
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log(`Generating secure bcrypt hash for password...`)
    const passwordHash = await bcrypt.hash(password, 10)

    console.log(`Checking if user "${username}" already exists...`)
    const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single()

    if (existingUser) {
        console.log(`User "${username}" exists. Upgrading to admin...`)
        const { error: updateError } = await supabase
            .from('users')
            .update({
                admin_role: role,
                admin_password_hash: passwordHash,
                role: 'admin',
                updated_at: new Date().toISOString()
            })
            .eq('id', existingUser.id)

        if (updateError) {
            console.error('Failed to update admin credentials:', updateError.message)
            process.exit(1)
        }
        console.log(`Successfully upgraded user "${username}" to "${role}"!`)
    } else {
        console.log(`Creating new auth user in Supabase...`)
        const email = `${username}_admin@mirauni.com`
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                username,
                role: 'admin'
            }
        })

        if (authError || !authUser.user) {
            console.error('Failed to create auth user:', authError?.message)
            process.exit(1)
        }

        console.log(`Inserting admin record into users table...`)
        const { error: insertError } = await supabase
            .from('users')
            .insert({
                id: authUser.user.id,
                username,
                email,
                role: 'admin',
                admin_role: role,
                admin_password_hash: passwordHash,
                status: 'active'
            })

        if (insertError) {
            console.error('Failed to insert user record:', insertError.message)
            process.exit(1)
        }
        console.log(`Successfully created new admin user "${username}" with role "${role}"!`)
    }
}

createAdmin().catch(console.error)
