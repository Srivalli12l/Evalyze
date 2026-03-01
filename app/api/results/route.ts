import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        // 1. Fetch latest resume analysis
        const resumeQuery = await supabaseAdmin
            .from('resume_analysis')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        // 2. Fetch latest assessment results
        const assessmentQuery = await supabaseAdmin
            .from('assessment_results')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        // Aggregate results
        const results = {
            resume: resumeQuery.data ? {
                file_name: 'resume.pdf',
                role_fit_score: resumeQuery.data.analysis_score,
                skills_detected: resumeQuery.data.extracted_skills
                    ? resumeQuery.data.extracted_skills.split(', ')
                    : [],
                resume_quality: resumeQuery.data.analysis_score,
            } : null,
            assessments: {
                skill: assessmentQuery.data?.skill_score != null ? {
                    score: assessmentQuery.data.skill_score,
                    details: null,
                } : null,
                personality: assessmentQuery.data?.personality_score != null ? {
                    score: assessmentQuery.data.personality_score,
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
