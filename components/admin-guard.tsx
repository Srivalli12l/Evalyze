'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { Shield, LogIn, Loader2 } from 'lucide-react'

/**
 * Admin-only guard component.
 * - Checks if the user is authenticated via Supabase session
 * - Verifies admin privileges via /api/admin/verify (server-side email check)
 * - Renders children only if authorized
 */
export function AdminGuard({ children }: { children: ReactNode }) {
    const [state, setState] = useState<'loading' | 'unauthorized' | 'no-session' | 'authorized'>('loading')
    const [reason, setReason] = useState('')

    useEffect(() => {
        async function verify() {
            // 1. Check if user has a session
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                setState('no-session')
                return
            }

            // 2. Verify admin privileges on the server
            try {
                const res = await fetch('/api/admin/verify', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`,
                    },
                })

                const data = await res.json()

                if (data.authorized) {
                    setState('authorized')
                } else {
                    setReason(data.reason || 'Access denied')
                    setState('unauthorized')
                }
            } catch {
                setReason('Failed to verify admin access')
                setState('unauthorized')
            }
        }

        verify()
    }, [])

    // ── Loading state ────────────────────────────────────────────────
    if (state === 'loading') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm font-medium text-muted-foreground">Verifying admin access…</p>
                </div>
            </div>
        )
    }

    // ── No session ───────────────────────────────────────────────────
    if (state === 'no-session') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="mx-auto max-w-sm rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <LogIn className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h2 className="text-lg font-bold text-foreground">Authentication Required</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Please log in to access the admin panel.
                    </p>
                    <a
                        href="/"
                        className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                        Go to Login
                    </a>
                </div>
            </div>
        )
    }

    // ── Unauthorized ─────────────────────────────────────────────────
    if (state === 'unauthorized') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="mx-auto max-w-sm rounded-2xl border border-destructive/30 bg-card p-8 text-center shadow-sm">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                        <Shield className="h-6 w-6 text-destructive" />
                    </div>
                    <h2 className="text-lg font-bold text-foreground">Unauthorized</h2>
                    <p className="mt-2 text-sm text-muted-foreground">{reason}</p>
                    <a
                        href="/"
                        className="mt-4 inline-block rounded-lg bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/80 transition-colors"
                    >
                        Back to Dashboard
                    </a>
                </div>
            </div>
        )
    }

    // ── Authorized — render admin content ─────────────────────────────
    return <>{children}</>
}
