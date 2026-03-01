/**
 * Server-only Groq API helper.
 * Uses the OpenAI-compatible REST API — no SDK dependency.
 * Reads GROQ_API_KEY from environment.
 *
 * Model: llama-3.1-8b-instant (fast, free-tier friendly)
 */

const GROQ_MODEL = 'llama-3.1-8b-instant'
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

export async function callGroq(prompt: string): Promise<string> {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
        throw new Error('[groq] GROQ_API_KEY is not set in environment variables.')
    }

    console.log('[groq] Calling model:', GROQ_MODEL)
    console.log('[groq] Prompt length:', prompt.length, 'chars')

    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert career counselor, resume analyst, and technical interviewer. Always respond with ONLY valid JSON — no markdown, no explanations, no extra text.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.9,
            max_tokens: 4096,
            top_p: 0.95,
        }),
    })

    if (!response.ok) {
        const errText = await response.text()
        console.error('[groq] API error:', response.status, errText)
        throw new Error(`Groq API error ${response.status}: ${errText.substring(0, 300)}`)
    }

    const data = await response.json()

    const text = data?.choices?.[0]?.message?.content
    if (!text) {
        console.error('[groq] Empty response. Full response:', JSON.stringify(data).substring(0, 1000))
        throw new Error('Groq returned an empty response.')
    }

    console.log('[groq] Response received, length:', text.length, 'chars')
    console.log('[groq] Usage:', JSON.stringify(data.usage))
    return text.trim()
}

/**
 * Calls Groq and parses the response as JSON.
 * Strips markdown code fences if present.
 */
export async function callGroqJSON<T = any>(prompt: string): Promise<T> {
    const raw = await callGroq(prompt)

    // LLMs sometimes wrap JSON in ```json ... ``` code fences
    let cleaned = raw
    if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '')
    }
    cleaned = cleaned.trim()

    try {
        return JSON.parse(cleaned) as T
    } catch (err) {
        console.error('[groq] Failed to parse JSON. Raw response:')
        console.error(cleaned.substring(0, 1000))
        throw new Error(`Groq returned invalid JSON: ${cleaned.substring(0, 200)}`)
    }
}
