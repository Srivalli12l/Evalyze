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

        // 1. Fetch Total Users (profiles table)
        const { count: userCount, error: userError } = await supabaseAdmin
            .from('profile')
            .select('*', { count: 'exact', head: true })

        // 2. Fetch Total Resume Analyses
        const { count: resumeCount, error: resumeError } = await supabaseAdmin
            .from('resume_analysis')
            .select('*', { count: 'exact', head: true })

        // 3. Fetch Total Assessments
        const { count: assessmentCount, error: assessmentError } = await supabaseAdmin
            .from('assessment_results')
            .select('*', { count: 'exact', head: true })

        if (userError || resumeError || assessmentError) {
            console.error('Overview Stats Error:', { userError, resumeError, assessmentError })
            return NextResponse.json(
                { error: 'Failed to fetch overview statistics' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            totalUsers: userCount || 0,
            totalResumes: resumeCount || 0,
            totalAssessments: assessmentCount || 0
        })

    } catch (error: any) {
        console.error('Admin Overview API Error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
