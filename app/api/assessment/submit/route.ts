import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { questionCache } from '@/lib/question-cache'
import {
    SKILL_QUESTIONS,
    SKILL_CORRECT_ANSWERS,
    PERSONALITY_OPTION_SCORES,
} from '@/lib/assessment-data'

// ─── Helpers ─────────────────────────────────────────────────────────

function gradeSkill(answers: number[], correctAnswers: readonly number[], skillLabels?: { id: string; skill: string }[]) {
    const totalQuestions = correctAnswers.length
    let correctCount = 0

    const buckets: Record<string, { correct: number; total: number }> = {}

    correctAnswers.forEach((correctIdx, i) => {
        const skill = skillLabels?.[i]?.skill || SKILL_QUESTIONS[i]?.skill || `Skill${i}`
        if (!buckets[skill]) buckets[skill] = { correct: 0, total: 0 }
        buckets[skill].total++

        const userAnswer = answers[i] ?? -1
        if (userAnswer === correctIdx) {
            correctCount++
            buckets[skill].correct++
        }
    })

    const accuracy = Math.round((correctCount / totalQuestions) * 100)
    const score = accuracy

    return {
        score,
        results: {
            totalQuestions,
            correctAnswers: correctCount,
            accuracy,
            score,
            skillBreakdown: buckets,
            answers,
        },
    }
}

function gradePersonality(answers: number[], optionScores: readonly (readonly number[])[]) {
    let total = 0
    const count = optionScores.length

    optionScores.forEach((scores, i) => {
        const picked = answers[i] ?? 0
        const idx = Math.max(0, Math.min(picked, scores.length - 1))
        total += scores[idx]
    })

    const score = Math.round(total / count)

    return {
        score,
        results: {
            score,
            answers,
        },
    }
}

function generateFeedback(overall: number): string {
    if (overall >= 80) return 'Excellent performance! You are well-prepared for placement.'
    if (overall >= 60) return 'Good job. Focus on strengthening your technical skills further.'
    return 'Keep practicing. We recommend focusing on core fundamentals.'
}

// ─── Route ───────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { type, answers, userId, analysisId } = body as {
            type?: string
            answers?: number[]
            userId?: string
            analysisId?: string
        }

        // ── Auth check ───────────────────────────────────────────────
        if (!userId) {
            return NextResponse.json(
                { error: 'Authentication required. No userId provided.' },
                { status: 401 },
            )
        }

        // ── Validate ─────────────────────────────────────────────────
        if (!type || !['skill', 'personality'].includes(type)) {
            return NextResponse.json(
                { error: 'type must be "skill" or "personality"' },
                { status: 400 },
            )
        }

        if (!Array.isArray(answers)) {
            return NextResponse.json(
                { error: 'answers must be an array of numbers' },
                { status: 400 },
            )
        }

        // ── Grade ────────────────────────────────────────────────────
        let skill_score: number | undefined
        let personality_score: number | undefined
        let resultsPayload: Record<string, unknown> = {}

        if (type === 'skill') {
            // Try cached Gemini answers first, fall back to hardcoded
            const cached = questionCache.get(`${userId}:skill`)
            const correctAnswers = cached?.correctAnswers || SKILL_CORRECT_ANSWERS as unknown as number[]
            console.log('[assessment/submit] Skill grading source:', cached ? 'AI-generated' : 'hardcoded fallback')

            const graded = gradeSkill(answers, correctAnswers)
            skill_score = graded.score
            resultsPayload = graded.results
        } else {
            // Try cached Gemini option scores first, fall back to hardcoded
            const cached = questionCache.get(`${userId}:personality`)
            const optionScores = (cached?.optionScores && cached.optionScores.length > 0)
                ? cached.optionScores
                : PERSONALITY_OPTION_SCORES as unknown as number[][]
            console.log('[assessment/submit] Personality grading source:', cached?.optionScores ? 'AI-generated' : 'hardcoded fallback')

            const graded = gradePersonality(answers, optionScores)
            personality_score = graded.score
            resultsPayload = graded.results
        }

        // ── Persist to Supabase ──────────────────────────────────────

        // Find existing assessment for THIS specific analysis session
        let existingQuery = supabaseAdmin
            .from('assessment_results')
            .select('id, skill_score, personality_score')
            .eq('user_id', userId)

        // Link to specific analysis session if provided
        if (analysisId) {
            existingQuery = existingQuery.eq('analysis_id', analysisId)
        }

        const { data: existing } = await existingQuery
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        // Merge scores: keep the existing score for the OTHER assessment type
        const mergedSkill = skill_score ?? existing?.skill_score ?? null
        const mergedPersonality =
            personality_score ?? existing?.personality_score ?? null

        // Compute overall only when both exist
        const overall_score =
            mergedSkill != null && mergedPersonality != null
                ? Math.round((mergedSkill + mergedPersonality) / 2)
                : mergedSkill ?? mergedPersonality ?? 0

        const feedback = generateFeedback(overall_score)

        console.log('[api/assessment/submit] Request for:', { userId, type, skill_score, personality_score, analysisId });
        console.log('[api/assessment/submit] Merged scores:', { mergedSkill, mergedPersonality, overall_score });

        let dbError: any = null
        let dbData: any = null

        if (existing) {
            console.log('[api/assessment/submit] Updating existing record:', existing.id);
            const { data, error } = await supabaseAdmin
                .from('assessment_results')
                .update({
                    skill_score: mergedSkill,
                    personality_score: mergedPersonality,
                    overall_score,
                    feedback,
                })
                .eq('id', existing.id)
                .select()

            dbError = error
            dbData = data
        } else {
            console.log('[api/assessment/submit] Inserting new record for user:', userId);
            const { data, error } = await supabaseAdmin
                .from('assessment_results')
                .insert({
                    user_id: userId,
                    analysis_id: analysisId || null,
                    skill_score: mergedSkill,
                    personality_score: mergedPersonality,
                    overall_score,
                    feedback,
                })
                .select()

            dbError = error
            dbData = data
        }

        if (dbError) {
            console.error('[api/assessment/submit] Supabase Error:', {
                message: dbError.message,
                code: dbError.code,
                details: dbError.details,
                hint: dbError.hint
            })
            return NextResponse.json(
                { success: false, error: 'Database save failed', details: dbError.message, code: dbError.code },
                { status: 500 },
            )
        }

        console.log('[api/assessment/submit] SUCCESS: Results persisted.');
        return NextResponse.json({
            success: true,
            results: resultsPayload,
            db: dbData
        })
    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error', details: error.message },
            { status: 500 },
        )
    }
}
