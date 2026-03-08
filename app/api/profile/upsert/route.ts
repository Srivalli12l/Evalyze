import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const userId = user.id

        const { name, email } = await req.json()

        if (!email) {
            return NextResponse.json(
                { error: 'email is required' },
                { status: 400 }
            )
        }

        console.log('[api/profile/upsert] Attempting upsert for:', { userId, email });

        // Check if profile already exists
        const { data: existing } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('id', userId)
            .single()

        let data, error

        if (existing) {
            // Profile exists → update name/email only, do NOT overwrite role
            const result = await supabaseAdmin
                .from('profiles')
                .update({ name, email })
                .eq('id', userId)
                .select()
            data = result.data
            error = result.error
        } else {
            // New profile → insert with default role 'student'
            const result = await supabaseAdmin
                .from('profiles')
                .insert({ id: userId, name, email, role: 'student' })
                .select()
            data = result.data
            error = result.error
        }

        if (error) {
            console.error('[api/profile/upsert] Supabase Error Details:', {
                message: error.message,
                code: error.code,
                hint: error.hint,
                details: error.details
            })
            return NextResponse.json(
                { success: false, error: 'Database upsert failed', details: error.message, code: error.code },
                { status: 500 }
            )
        }

        console.log('[api/profile/upsert] SUCCESS: Profile updated for', userId);
        return NextResponse.json({ success: true, data })
    } catch (error: any) {
        console.error('[api/profile/upsert] Error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error', details: error.message },
            { status: 500 }
        )
    }
}
