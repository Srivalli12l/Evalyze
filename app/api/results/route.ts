import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: Request) {
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

        // 1. Fetch the LATEST resume analysis (with strengths, gaps, feedback)
        const resumeQuery = await supabaseAdmin
            .from('resume_analysis')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        const latestResume = resumeQuery.data;

        // 2. Fetch assessment_results linked to this specific analysis session
        //    Falls back to latest assessment if analysis_id link doesn't exist yet
        let assessmentData = null;
        if (latestResume) {
            // ONLY find assessment linked to this specific analysis session
            const linkedQuery = await supabaseAdmin
                .from('assessment_results')
                .select('*')
                .eq('user_id', userId)
                .eq('analysis_id', latestResume.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (linkedQuery.data) {
                assessmentData = linkedQuery.data;
            }
        }

        // 3. Parse stored JSON fields safely
        let strengths: string[] = [];
        let gaps: string[] = [];
        let feedback = '';

        if (latestResume) {
            try {
                strengths = latestResume.strengths ? JSON.parse(latestResume.strengths) : [];
            } catch { strengths = []; }
            try {
                gaps = latestResume.gaps ? JSON.parse(latestResume.gaps) : [];
            } catch { gaps = []; }
            feedback = latestResume.feedback || '';
        }

        // 4. Build response
        const results = {
            resume: latestResume ? {
                id: latestResume.id,
                file_name: 'resume.pdf',
                role_fit_score: latestResume.analysis_score,
                skills_detected: latestResume.extracted_skills
                    ? latestResume.extracted_skills.split(', ')
                    : [],
                resume_quality: latestResume.analysis_score,
                target_role: latestResume.target_role,
                strengths,
                gaps,
                feedback,
            } : null,
            assessments: {
                skill: assessmentData?.skill_score != null ? {
                    score: assessmentData.skill_score,
                    details: null,
                } : null,
                personality: assessmentData?.personality_score != null ? {
                    score: assessmentData.personality_score,
                    traits: null,
                } : null,
            },
        };

        return NextResponse.json({ success: true, data: results });

    } catch (error: any) {
        console.error("Fetch results error:", error);
        return NextResponse.json(
            { error: "Failed to fetch results" },
            { status: 500 }
        );
    }
}
