import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/require-admin'

export async function GET(req: NextRequest) {
    try {
        // Auth + role check
        const auth = await requireAdmin(req)
        if (!auth.authorized) {
            return NextResponse.json(auth.body, { status: auth.status })
        }

        const { data, error } = await supabaseAdmin
            .from('profile')
            .select('name, email, created_at')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Users fetch error:', error)
            return NextResponse.json(
                { error: 'Failed to fetch users' },
                { status: 500 }
            )
        }

        return NextResponse.json(data || [])
    } catch (error: any) {
        console.error('Admin Users API Error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
