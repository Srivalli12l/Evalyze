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
            .from('assessment_results')
            .select('id, user_id, skill_score, personality_score, overall_score, created_at')
            .order('created_at', { ascending: false })
            .limit(10)

        if (error) {
            console.error('Assessments fetch error:', error)
            return NextResponse.json(
                { error: 'Failed to fetch assessments' },
                { status: 500 }
            )
        }

        return NextResponse.json(data || [])
    } catch (error: any) {
        console.error('Admin Assessments API Error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
