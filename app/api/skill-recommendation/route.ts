import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { callGroqJSON } from "@/lib/groq";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const { analysisId, targetRole, gaps, strengths, feedback } = await req.json();

        if (!analysisId) {
            return NextResponse.json(
                { success: false, error: "analysisId is required" },
                { status: 400 }
            );
        }

        // 1. Fetch resume text using analysisId
        const { data: analysisData, error: dbError } = await supabaseAdmin
            .from("resume_analysis")
            .select("resume_text")
            .eq("id", analysisId)
            .single();

        if (dbError || !analysisData?.resume_text) {
            console.error("[skill-recommendation] Failed to fetch resume text:", dbError?.message);
            return NextResponse.json(
                { success: false, error: "Could not retrieve resume text for this analysis" },
                { status: 404 }
            );
        }

        const resumeSnippet = analysisData.resume_text.substring(0, 6000);

        // 2. Construct Prompt
        const timestamp = Date.now();
        const prompt = `Analyze this resume and provide skill recommendations for the target role: "${targetRole || "the candidate's target role"}".

REQUEST ID: ${timestamp}

PREVIOUS ANALYSIS DATA:
Strengths identified: ${strengths?.join(", ")}
Gaps identified: ${gaps?.join(", ")}
General Feedback: ${feedback}

FULL RESUME TEXT:
===RESUME START===
${resumeSnippet}
===RESUME END===

INSTRUCTIONS:
1. Identify important missing or weak skills in the resume based on the content and the target role.
2. Recommend a MAXIMUM of 6 skills. Do not exceed 6.
3. Use short skill names (1–3 words max per skill). Examples: "React", "Docker", "REST APIs", "System Design", "AWS".
4. Return ONLY a valid JSON object matching the expected format.

EXPECTED JSON OUTPUT:
{
  "skills": ["<Skill 1>", "<Skill 2>", "<Skill 3>"]
}`;

        // 3. Call Groq AI
        const result = await callGroqJSON<{ skills: string[] }>(prompt);

        // Validate and Clean up result
        let recommendedSkills = Array.isArray(result.skills) ? result.skills : [];

        // Ensure short skill names and max 6
        recommendedSkills = recommendedSkills
            .map(s => s.trim())
            .filter(s => s.length > 0 && s.split(" ").length <= 4)
            .slice(0, 6);

        return NextResponse.json({
            success: true,
            skills: recommendedSkills,
        });
    } catch (error: any) {
        console.error("[skill-recommendation] ❌ ERROR:", error?.message ?? error);
        return NextResponse.json(
            {
                success: false,
                error: "Skill recommendation failed",
                details: error?.message || "An unknown error occurred",
            },
            { status: 500 }
        );
    }
}
