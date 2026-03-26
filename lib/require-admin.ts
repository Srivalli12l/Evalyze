import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

interface AdminCheckSuccess {
    authorized: true
    userId: string
    email: string
}

interface AdminCheckFailure {
    authorized: false
    status: number
    body: { error: string; reason: string }
}

type AdminCheckResult = AdminCheckSuccess | AdminCheckFailure

/**
 * Server-side admin authorization check.
 *
 * 1. Extracts Bearer token from Authorization header
 * 2. Validates the token with Supabase (gets user identity)
 * 3. Queries the `profiles` table for role = 'admin'
 *
 * Returns { authorized: true, userId, email } on success,
 * or { authorized: false, status, body } on failure.
 */
export async function requireAdmin(req: NextRequest): Promise<AdminCheckResult> {
    const authHeader = req.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
            authorized: false,
            status: 401,
            body: { error: 'Unauthorized', reason: 'No valid authorization header' },
        }
    }

    const token = authHeader.replace('Bearer ', '')

    // Validate the token — this confirms the user is authenticated
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
        return {
            authorized: false,
            status: 401,
            body: { error: 'Unauthorized', reason: 'Invalid or expired session' },
        }
    }

    // Check the role in the database — this is the trusted source of truth
    const { data: profile, error: profileError } = await supabaseAdmin
        .from('profile')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profileError || !profile) {
        return {
            authorized: false,
            status: 403,
            body: { error: 'Forbidden', reason: 'User profile not found' },
        }
    }

    if (profile.role !== 'admin') {
        return {
            authorized: false,
            status: 403,
            body: { error: 'Forbidden', reason: 'Your account does not have admin privileges' },
        }
    }

    return { authorized: true, userId: user.id, email: user.email ?? '' }
}
