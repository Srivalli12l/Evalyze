require("dotenv").config({ path: ".env.local" });

const GROQ_MODEL = 'llama-3.1-8b-instant'
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

async function callGroq(prompt) {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
        throw new Error('[groq] GROQ_API_KEY is not set in environment variables.')
    }

    console.log('[groq] Calling model:', GROQ_MODEL)

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
        throw new Error(`Groq API error ${response.status}: ${errText}`)
    }

    const data = await response.json()
    const text = data?.choices?.[0]?.message?.content
    return text.trim()
}

async function test() {
    try {
        const prompt = `Analyze this candidate's profile and provide skill recommendations for the target role: "Frontend Developer".

REQUEST ID: 12345

PREVIOUS ANALYSIS DATA:
Strengths identified: React, CSS
Gaps identified: testing
General Feedback: Good

INSTRUCTIONS:
1. Identify important missing or weak skills for the target role based on the Gaps and Feedback listed above.
2. Recommend a MAXIMUM of 6 skills. Do not exceed 6.
3. Use short skill names (1–3 words max per skill). Examples: "React", "Docker", "REST APIs", "System Design", "AWS".
4. Return ONLY a valid JSON object matching the expected format.

EXPECTED JSON OUTPUT:
{
  "skills": ["<Skill 1>", "<Skill 2>", "<Skill 3>"]
}`;

        console.log("Calling groq...");
        const raw = await callGroq(prompt);
        console.log("Raw output:", raw);
        let cleaned = raw;
        if (cleaned.startsWith('\`\`\`')) {
            cleaned = cleaned.replace(/^\`\`\`(?:json)?\s*/i, '').replace(/\`\`\`\s*$/, '')
        }
        cleaned = cleaned.trim();
        const json = JSON.parse(cleaned);
        console.log("Success parsed:", json);
    } catch (error) {
        console.error("Error:", error);
    }
}

test();
