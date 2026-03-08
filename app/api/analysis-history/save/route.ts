import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
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
        const user_id = user.id

        const body = await req.json();
        const { resume_name, target_role, overall_score, readiness_level, result_json } = body;

        if (!target_role) {
            return NextResponse.json(
                { error: "target_role is required" },
                { status: 400 }
            );
        }

        const { data, error } = await supabaseAdmin
            .from('analysis_history')
            .insert({
                user_id,
                resume_name: resume_name || 'resume.pdf',
                target_role,
                overall_score: overall_score || 0,
                readiness_level: readiness_level || 'Needs Improvement',
                result_json: result_json || {},
            })
            .select()
            .single();

        if (error) {
            console.error('[analysis-history/save] Insert error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('[analysis-history/save] Error:', error);
        return NextResponse.json({ error: "Failed to save analysis history" }, { status: 500 });
    }
}
