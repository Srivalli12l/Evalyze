import { callGroqJSON } from "./lib/groq";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

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
        const result = await callGroqJSON(prompt);
        console.log("Success:", result);
    } catch (error) {
        console.error("Error:", error);
    }
}

test();
