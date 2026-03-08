import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json(
                { error: "userId is required" },
                { status: 400 }
            );
        }

        const { data, error } = await supabaseAdmin
            .from('analysis_history')
            .select('id, resume_name, target_role, overall_score, readiness_level, result_json, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[analysis-history] Fetch error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: data || [] });
    } catch (error: any) {
        console.error('[analysis-history] Error:', error);
        return NextResponse.json({ error: "Failed to fetch analysis history" }, { status: 500 });
    }
}
