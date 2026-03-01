/**
 * Server-only Gemini API helper.
 * Uses the REST API directly — no SDK dependency required.
 * Reads AI_API_KEY from environment.
 */

const GEMINI_MODEL = 'gemini-2.0-flash'
const GEMINI_API_URL =
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

export async function callGemini(prompt: string): Promise<string> {
    const apiKey = process.env.AI_API_KEY
    if (!apiKey) {
        throw new Error('[gemini] AI_API_KEY is not set in environment variables.')
    }

    console.log('[gemini] Calling model:', GEMINI_MODEL)
    console.log('[gemini] Prompt length:', prompt.length, 'chars')

    const requestBody = {
        contents: [
            {
                parts: [{ text: prompt }],
            },
        ],
        generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 4096,
            topP: 0.95,
            topK: 40,
        },
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
        const errText = await response.text()
        console.error('[gemini] API error:', response.status, errText)
        throw new Error(`Gemini API error ${response.status}: ${errText.substring(0, 300)}`)
    }

    const data = await response.json()

    // Check for blocked responses
    if (data?.candidates?.[0]?.finishReason === 'SAFETY') {
        console.error('[gemini] Response blocked by safety filters')
        throw new Error('Gemini response blocked by safety filters')
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) {
        console.error('[gemini] Empty response. Full response:', JSON.stringify(data).substring(0, 1000))
        throw new Error('Gemini returned an empty response.')
    }

    console.log('[gemini] Response received, length:', text.length, 'chars')
    return text.trim()
}

/**
 * Calls Gemini and parses the response as JSON.
 * Strips markdown code fences if present.
 */
export async function callGeminiJSON<T = any>(prompt: string): Promise<T> {
    const raw = await callGemini(prompt)

    // Gemini sometimes wraps JSON in ```json ... ``` code fences
    let cleaned = raw
    if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '')
    }
    cleaned = cleaned.trim()

    try {
        return JSON.parse(cleaned) as T
    } catch (err) {
        console.error('[gemini] Failed to parse JSON. Raw response:')
        console.error(cleaned.substring(0, 1000))
        throw new Error(`Gemini returned invalid JSON: ${cleaned.substring(0, 200)}`)
    }
}
