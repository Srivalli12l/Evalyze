/**
 * Simple in-memory cache for AI-generated question answers.
 * Used by /api/assessment/questions to store correct answers,
 * and by /api/assessment/submit to retrieve them for grading.
 *
 * Keys are formatted as "userId:type" (e.g. "abc123:skill")
 */

interface CachedAnswers {
    correctAnswers: number[] | null    // For skill questions
    optionScores: number[][] | null    // For personality scenarios
    timestamp: number
}

class QuestionCache {
    private cache = new Map<string, CachedAnswers>()

    // Auto-expire entries after 2 hours
    private readonly TTL = 2 * 60 * 60 * 1000

    set(key: string, value: CachedAnswers) {
        this.cache.set(key, value)
        this.cleanup()
    }

    get(key: string): CachedAnswers | undefined {
        const entry = this.cache.get(key)
        if (!entry) return undefined
        if (Date.now() - entry.timestamp > this.TTL) {
            this.cache.delete(key)
            return undefined
        }
        return entry
    }

    private cleanup() {
        const now = Date.now()
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > this.TTL) {
                this.cache.delete(key)
            }
        }
    }
}

export const questionCache = new QuestionCache()
