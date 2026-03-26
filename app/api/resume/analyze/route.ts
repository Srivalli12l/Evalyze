import { NextRequest, NextResponse } from 'next/server'
import pdf from 'pdf-parse'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { callGroqJSON } from '@/lib/groq'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ─── Route ───────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
    try {
        // ── 1. Parse FormData ──────────────────────────
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

        const formData = await req.formData()
        const file = formData.get('file') as File | null
        const target_role = formData.get('target_role') as string | null

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file uploaded' },
                { status: 400 }
            )
        }

        if (!target_role) {
            return NextResponse.json(
                { success: false, error: 'target_role is required' },
                { status: 400 }
            )
        }

        // ── 2. Extract Text from PDF ──────────────────
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const pdfData = await pdf(buffer)
        const resume_text = pdfData.text

        console.log('[resume/analyze] PDF extracted. Text length:', resume_text.length, 'chars')
        console.log('[resume/analyze] First 300 chars:', resume_text.substring(0, 300))

        if (!resume_text || resume_text.trim().length < 50) {
            return NextResponse.json(
                { success: false, error: 'Could not extract meaningful text from PDF. File may be image-based or empty.' },
                { status: 400 }
            )
        }

        // ── 3. Analyze with Groq AI (NO fallback, NO mock) ───────────
        const timestamp = Date.now()
        const resumeSnippet = resume_text.substring(0, 6000)

        const prompt = `Analyze this resume for the target role: "${target_role}".

REQUEST ID: ${timestamp} — this is a unique request. Produce fresh, unique output.

FULL RESUME TEXT (extracted from uploaded PDF):
===RESUME START===
${resumeSnippet}
===RESUME END===

INSTRUCTIONS:
1. Read the ENTIRE resume text above carefully — every word matters.
2. Score how well THIS specific resume matches "${target_role}" — be realistic, not generous.
3. If the resume lacks relevant experience for "${target_role}", score LOW (20-50).
4. If it is a strong match, score HIGH (70-90). Never give 100.
5. List SPECIFIC skills found in THIS resume (actual technologies, tools, frameworks mentioned).
6. List SPECIFIC strengths drawn from THIS resume content (cite actual projects, experience, certifications).
7. List SPECIFIC gaps — skills or experience MISSING from this resume that "${target_role}" requires.
8. Write a personalized 2-3 sentence feedback paragraph about THIS resume.

Respond with ONLY this JSON structure:
{
  "score": <number 0-99>,
  "skills": ["<skill found in resume>", ...],
  "strengths": ["<specific strength from resume>", "<another>", "<another>"],
  "gaps": ["<missing skill for ${target_role}>", "<another>"],
  "feedback": "<personalized 2-3 sentence assessment>"
}`

        console.log('[resume/analyze] Sending to Groq AI. Prompt length:', prompt.length)

        const result = await callGroqJSON<{
            score: number
            skills: string[]
            strengths: string[]
            gaps: string[]
            feedback: string
        }>(prompt)

        // Validate and clamp
        const score = typeof result.score === 'number' ? Math.max(0, Math.min(99, Math.round(result.score))) : 50
        const skills = Array.isArray(result.skills) ? result.skills : []
        const strengths = Array.isArray(result.strengths) && result.strengths.length > 0
            ? result.strengths : ['Resume analyzed']
        const gaps = Array.isArray(result.gaps) && result.gaps.length > 0
            ? result.gaps : ['No specific gaps identified']
        const feedback = typeof result.feedback === 'string' && result.feedback.length > 0
            ? result.feedback : 'Resume analysis complete.'

        console.log('[resume/analyze] ✅ Groq result — score:', score, '| skills:', skills.length, '| strengths:', strengths.length, '| gaps:', gaps.length)

        // ── 4. Persist to Supabase ──────────────────────────────────
        const { data: dbRecord, error: dbError } = await supabaseAdmin
            .from('resume_analysis')
            .insert({
                user_id: userId,
                resume_text,
                extracted_skills: skills.join(', '),
                target_role,
                analysis_score: score,
                strengths: JSON.stringify(strengths),
                gaps: JSON.stringify(gaps),
                feedback,
            })
            .select()
            .single()

        if (dbError) {
            console.error('[resume/analyze] DB Error:', dbError.message)
            return NextResponse.json(
                { success: false, error: 'Failed to save analysis to database', details: dbError.message },
                { status: 500 }
            )
        }

        // ── 5. Return result ─────────────────────────────────────────
        return NextResponse.json({
            success: true,
            skills,
            score,
            feedback,
            strengths,
            gaps,
            data: dbRecord || { analysis_score: score, extracted_skills: skills.join(', ') },
        })

    } catch (error: any) {
        console.error('[resume/analyze] ❌ ERROR:', error?.message ?? error)

        return NextResponse.json(
            {
                success: false,
                error: error?.message || 'Resume analysis failed',
                details: 'Groq API call failed. Check GROQ_API_KEY in .env.local and server logs.',
            },
            { status: 500 }
        )
    }
}
