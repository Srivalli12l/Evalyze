import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
    try {
        const { userId, name, email } = await req.json()

        if (!userId || !email) {
            return NextResponse.json(
                { error: 'userId and email are required' },
                { status: 400 }
            )
        }

        console.log('[api/profile/upsert] Attempting upsert for:', { userId, email });

        const { data, error } = await supabaseAdmin
            .from('profiles')
            .upsert(
                { id: userId, name, email, role: 'student' },
                { onConflict: 'id' }
            )
            .select()

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
