import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/require-admin'

/**
 * Admin verification API — validates that the caller is authenticated
 * AND has role = 'admin' in the profiles table.
 *
 * Expects: Authorization: Bearer <access_token>
 * Returns: { authorized: boolean, reason?: string }
 */
export async function POST(req: NextRequest) {
    try {
        const result = await requireAdmin(req)

        if (!result.authorized) {
            return NextResponse.json(
                { authorized: false, reason: result.body.reason },
                { status: result.status }
            )
        }

        return NextResponse.json({ authorized: true })

    } catch (err: any) {
        console.error('[admin/verify] Error:', err)
        return NextResponse.json(
            { authorized: false, reason: 'Server error during verification' },
            { status: 500 }
        )
    }
}
