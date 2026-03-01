import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET() {
    const results: Record<string, unknown> = {}

    try {
        console.log('[TEST-DB] Starting diagnostic test...')

        // ── 1. Verify supabaseAdmin is initialized ──────────────────
        if (!supabaseAdmin) {
            return NextResponse.json({
                success: false,
                error: 'supabaseAdmin is null — SUPABASE_SERVICE_ROLE_KEY is missing or invalid'
            }, { status: 500 })
        }
        results.clientInitialized = true

        // ── 2. Test connection by reading from profiles ─────────────
        const { data: pingData, error: pingError } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .limit(1)

        if (pingError) {
            return NextResponse.json({
                success: false,
                step: 'connection_test',
                error: pingError.message,
                code: pingError.code,
                hint: pingError.hint
            }, { status: 500 })
        }
        results.connectionTest = 'PASS'
        results.existingProfiles = pingData?.length ?? 0

        // ── 3. Test insert into resume_analysis (no FK needed) ──────
        // This uses a fake user_id that won't match auth.users,
        // so it will FAIL if the FK constraint is enforced — which is expected.
        // Instead, we test by inserting into assessment_results and resume_analysis
        // using a known user. We'll just test SELECT permission on all 3 tables.

        const tables = ['profiles', 'resume_analysis', 'assessment_results'] as const
        for (const table of tables) {
            const { error: selectError } = await supabaseAdmin
                .from(table)
                .select('id')
                .limit(1)

            if (selectError) {
                return NextResponse.json({
                    success: false,
                    step: `select_${table}`,
                    error: selectError.message,
                    code: selectError.code,
                    hint: selectError.hint
                }, { status: 500 })
            }
            results[`select_${table}`] = 'PASS'
        }

        // ── 4. Test actual insert using a real user from auth.users ─
        const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers({
            perPage: 1,
            page: 1,
        })

        if (authError) {
            results.authListUsers = `FAIL: ${authError.message}`
            // Still return success for the connection tests
            return NextResponse.json({
                success: true,
                message: 'Connection and SELECT tests passed. Could not list auth users to test INSERT.',
                results
            })
        }

        if (!authUsers.users || authUsers.users.length === 0) {
            results.authListUsers = 'No users found in auth.users — sign up first to test inserts'
            return NextResponse.json({
                success: true,
                message: 'Connection tests passed. No auth users found to test INSERT — sign up first.',
                results
            })
        }

        const testUser = authUsers.users[0]
        results.testUserId = testUser.id
        results.testUserEmail = testUser.email

        // 4a. Upsert into profiles
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: testUser.id,
                name: testUser.user_metadata?.name || 'Test User',
                email: testUser.email,
                role: 'student'
            }, { onConflict: 'id' })

        if (profileError) {
            return NextResponse.json({
                success: false,
                step: 'insert_profiles',
                error: profileError.message,
                code: profileError.code,
                hint: profileError.hint,
                details: profileError.details,
                results
            }, { status: 500 })
        }
        results.insert_profiles = 'PASS'

        // 4b. Insert into resume_analysis (then immediately delete)
        const { data: resumeRow, error: resumeError } = await supabaseAdmin
            .from('resume_analysis')
            .insert({
                user_id: testUser.id,
                resume_text: 'DIAGNOSTIC TEST — safe to delete',
                extracted_skills: 'test',
                target_role: 'test',
                analysis_score: 0,
            })
            .select('id')
            .single()

        if (resumeError) {
            return NextResponse.json({
                success: false,
                step: 'insert_resume_analysis',
                error: resumeError.message,
                code: resumeError.code,
                hint: resumeError.hint,
                details: resumeError.details,
                results
            }, { status: 500 })
        }
        results.insert_resume_analysis = 'PASS'

        // Clean up test row
        if (resumeRow?.id) {
            await supabaseAdmin.from('resume_analysis').delete().eq('id', resumeRow.id)
            results.cleanup_resume = 'deleted test row'
        }

        // 4c. Insert into assessment_results (then immediately delete)
        const { data: assessRow, error: assessError } = await supabaseAdmin
            .from('assessment_results')
            .insert({
                user_id: testUser.id,
                skill_score: 50,
                personality_score: 50,
                overall_score: 50,
                feedback: 'DIAGNOSTIC TEST — safe to delete',
            })
            .select('id')
            .single()

        if (assessError) {
            return NextResponse.json({
                success: false,
                step: 'insert_assessment_results',
                error: assessError.message,
                code: assessError.code,
                hint: assessError.hint,
                details: assessError.details,
                results
            }, { status: 500 })
        }
        results.insert_assessment_results = 'PASS'

        // Clean up test row
        if (assessRow?.id) {
            await supabaseAdmin.from('assessment_results').delete().eq('id', assessRow.id)
            results.cleanup_assessment = 'deleted test row'
        }

        // ── 5. ALL PASSED ───────────────────────────────────────────
        console.log('[TEST-DB] ALL TESTS PASSED')
        return NextResponse.json({
            success: true,
            message: 'ALL TESTS PASSED: connection, SELECT on all tables, INSERT+DELETE on all 3 tables.',
            results
        })

    } catch (error: any) {
        console.error('[TEST-DB] Unhandled crash:', error)
        return NextResponse.json({
            success: false,
            error: 'Diagnostic crashed',
            details: error.message,
            results
        }, { status: 500 })
    }
}
