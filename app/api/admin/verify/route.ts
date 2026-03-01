import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * Admin verification API — validates that the caller is authenticated
 * AND their email matches the NEXT_PUBLIC_ADMIN_EMAIL env var.
 *
 * Expects: Authorization: Bearer <access_token>
 * Returns: { authorized: boolean, reason?: string }
 */
export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization')

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { authorized: false, reason: 'No valid authorization header' },
                { status: 401 }
            )
        }

        const token = authHeader.replace('Bearer ', '')

        // Validate the token with Supabase
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

        if (error || !user) {
            return NextResponse.json(
                { authorized: false, reason: 'Invalid or expired session' },
                { status: 401 }
            )
        }

        // Check email against admin email
        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
        if (!adminEmail) {
            console.error('[admin/verify] NEXT_PUBLIC_ADMIN_EMAIL is not set')
            return NextResponse.json(
                { authorized: false, reason: 'Admin email not configured on server' },
                { status: 500 }
            )
        }

        if (user.email?.toLowerCase() !== adminEmail.toLowerCase()) {
            return NextResponse.json(
                { authorized: false, reason: 'Your account does not have admin privileges' },
                { status: 403 }
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
