import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from('profiles')
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
