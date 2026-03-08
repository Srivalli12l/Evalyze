import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/require-admin'

/**
 * Admin API — returns latest resume analyses (read-only).
 * Uses supabaseAdmin (service role) so it bypasses RLS.
 * Protected by requireAdmin() — only admins can access.
 */
export async function GET(req: NextRequest) {
    try {
        // Auth + role check
        const auth = await requireAdmin(req)
        if (!auth.authorized) {
            return NextResponse.json(auth.body, { status: auth.status })
        }

        const { data, error } = await supabaseAdmin
            .from('resume_analysis')
            .select('id, user_id, target_role, analysis_score, created_at')
            .order('created_at', { ascending: false })
            .limit(10)

        if (error) {
            console.error('Admin resumes fetch error:', error)
            return NextResponse.json(
                { error: 'Failed to fetch resume analyses' },
                { status: 500 }
            )
        }

        return NextResponse.json(data || [])
    } catch (error: any) {
        console.error('Admin Resumes API Error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
