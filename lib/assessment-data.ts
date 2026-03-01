/**
 * Server-side assessment scoring data.
 * Mirrors the question structures in lib/mock-data.ts but contains ONLY
 * the data needed to grade answers on the backend.
 */

// ─── Skill Assessment ────────────────────────────────────────────────
// Each entry: { skill, correctIndex }
// Order matches mockSkillQuestions.questions in mock-data.ts
export const SKILL_QUESTIONS = [
    { id: 'q1', skill: 'React', correct: 1 },
    { id: 'q2', skill: 'React', correct: 1 },
    { id: 'q3', skill: 'JavaScript', correct: 2 },
    { id: 'q4', skill: 'JavaScript', correct: 0 },
    { id: 'q5', skill: 'React', correct: 1 },
    { id: 'q6', skill: 'CSS', correct: 1 },
    { id: 'q7', skill: 'JavaScript', correct: 2 },
    { id: 'q8', skill: 'React', correct: 0 },
] as const;

// Convenience: flat array of correct indices
export const SKILL_CORRECT_ANSWERS: readonly number[] = SKILL_QUESTIONS.map(
    (q) => q.correct,
);

// ─── Personality Assessment ──────────────────────────────────────────
// Per-scenario score for each option (index matches option order).
// Higher = better alignment with ideal workplace behaviour.
// Order matches mockPersonalityScenarios.scenarios in mock-data.ts
export const PERSONALITY_OPTION_SCORES: readonly (readonly number[])[] = [
    // s1 – Communication & Ethics
    [30, 100, 40, 60],
    // s2 – Collaboration & Growth
    [30, 100, 10, 20],
    // s3 – Problem Solving & Leadership
    [10, 100, 5, 40],
    // s4 – Decision Making & Leadership
    [30, 100, 40, 10],
    // s5 – Communication & Initiative
    [20, 100, 40, 10],
    // s6 – Empathy & Mentorship
    [20, 100, 30, 15],
];
