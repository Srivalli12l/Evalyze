import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
    throw new Error(
        '[supabase-admin] FATAL: NEXT_PUBLIC_SUPABASE_URL is missing. ' +
        'Add it to your .env.local file.'
    )
}

if (!supabaseServiceKey) {
    throw new Error(
        '[supabase-admin] FATAL: SUPABASE_SERVICE_ROLE_KEY is missing. ' +
        'Add it to your .env.local file. ' +
        'Get it from: Supabase Dashboard → Project Settings → API → service_role (secret).'
    )
}

export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
})
