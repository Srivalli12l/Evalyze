import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
    try {
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
