import { NextRequest, NextResponse } from 'next/server'
import { callGroqJSON } from '@/lib/groq'
import { questionCache } from '@/lib/question-cache'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ─── Types ───────────────────────────────────────────────────────────

interface SkillQuestion {
    id: string
    skill: string
    question: string
    options: string[]
    correct: number
    explanation: string
}

interface PersonalityScenario {
    id: string
    context: string
    scenario: string
    options: string[]
    evaluates: string
}

// ─── Route ───────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const type = searchParams.get('type')
        const role = searchParams.get('role') || 'Software Developer'
        const skills = searchParams.get('skills') || ''
        const userId = searchParams.get('userId')

        if (!type || !['skill', 'personality'].includes(type)) {
            return NextResponse.json(
                { success: false, error: 'type must be "skill" or "personality"' },
                { status: 400 },
            )
        }

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'userId is required' },
                { status: 400 },
            )
        }

        if (type === 'skill') {
            return await generateSkillQuestions(role, skills, userId)
        } else {
            return await generatePersonalityScenarios(role, userId)
        }
    } catch (error: any) {
        console.error('[assessment/questions] Unhandled error:', error?.message)
        return NextResponse.json(
            { success: false, error: error?.message || 'Internal Server Error', fallback: true },
            { status: 500 },
        )
    }
}

// ─── Skill Question Generation ───────────────────────────────────────

async function generateSkillQuestions(role: string, skills: string, userId: string) {
    const timestamp = Date.now()
    const prompt = `Generate exactly 8 multiple-choice questions to assess a candidate for the role: "${role}".
${skills ? `Focus on these skills from their resume: ${skills}` : 'Cover core technical skills for this role.'}

REQUEST ID: ${timestamp} — generate FRESH, UNIQUE questions.

Requirements:
- Questions must be SPECIFIC and TECHNICAL
- Each question must have exactly 4 options with exactly one correct answer
- Vary difficulty: 2 easy, 4 medium, 2 hard

Respond with ONLY this JSON:
{
  "questions": [
    {
      "id": "q1",
      "skill": "<skill category>",
      "question": "<question text>",
      "options": ["<A>", "<B>", "<C>", "<D>"],
      "correct": <0-3>,
      "explanation": "<why correct>"
    }
  ]
}

Generate exactly 8 questions with IDs q1 through q8.`

    try {
        const result = await callGroqJSON<{ questions: SkillQuestion[] }>(prompt)

        if (!Array.isArray(result.questions) || result.questions.length === 0) {
            throw new Error('Groq returned empty questions array')
        }

        const correctAnswers = result.questions.map(q => q.correct)
        questionCache.set(`${userId}:skill`, {
            correctAnswers,
            optionScores: null,
            timestamp: Date.now(),
        })

        console.log('[assessment/questions] ✅ Generated', result.questions.length, 'skill questions for user:', userId)

        return NextResponse.json({
            success: true,
            data: {
                role,
                based_on_skills: skills ? skills.split(',').map(s => s.trim()) : [],
                questions: result.questions,
            },
        })
    } catch (err: any) {
        console.error('[assessment/questions] ❌ Skill generation failed:', err?.message)
        return NextResponse.json(
            { success: false, error: err?.message || 'AI generation failed', fallback: true },
            { status: 500 },
        )
    }
}

// ─── Personality Scenario Generation ─────────────────────────────────

async function generatePersonalityScenarios(role: string, userId: string) {
    const timestamp = Date.now()
    const prompt = `Generate exactly 6 workplace scenarios to assess personality traits for the role: "${role}".

REQUEST ID: ${timestamp} — generate FRESH, UNIQUE scenarios.

Each scenario: realistic workplace situation with 4 response options, ranging from poor to excellent behavior.

Respond with ONLY this JSON:
{
  "scenarios": [
    {
      "id": "s1",
      "context": "${role} workplace scenario",
      "scenario": "<2-3 sentence workplace scenario>",
      "options": ["<option A>", "<option B>", "<option C>", "<option D>"],
      "evaluates": "<trait being evaluated>"
    }
  ],
  "optionScores": [
    [<score A 0-100>, <score B>, <score C>, <score D>]
  ]
}

Generate exactly 6 scenarios (s1-s6). optionScores must have 6 entries with 4 scores each.
Higher scores = better workplace behavior.`

    try {
        const result = await callGroqJSON<{
            scenarios: PersonalityScenario[]
            optionScores: number[][]
        }>(prompt)

        if (!Array.isArray(result.scenarios) || result.scenarios.length === 0) {
            throw new Error('Groq returned empty scenarios array')
        }

        const optionScores = Array.isArray(result.optionScores) ? result.optionScores : []
        questionCache.set(`${userId}:personality`, {
            correctAnswers: null,
            optionScores,
            timestamp: Date.now(),
        })

        console.log('[assessment/questions] ✅ Generated', result.scenarios.length, 'personality scenarios for user:', userId)

        return NextResponse.json({
            success: true,
            data: {
                role,
                scenarios: result.scenarios,
            },
        })
    } catch (err: any) {
        console.error('[assessment/questions] ❌ Personality generation failed:', err?.message)
        return NextResponse.json(
            { success: false, error: err?.message || 'AI generation failed', fallback: true },
            { status: 500 },
        )
    }
}
