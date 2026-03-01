'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Mail, Loader2, CheckCircle2 } from 'lucide-react'

interface SendResultEmailButtonProps {
    email: string
    name: string
    score: number
    strengths: string[]
    weaknesses: string[]
    suggestions: string[]
    className?: string
}

export function SendResultEmailButton({
    email,
    name,
    score,
    strengths,
    weaknesses,
    suggestions,
    className,
}: SendResultEmailButtonProps) {
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

    const handleClick = async () => {
        setStatus('sending')
        try {
            const res = await fetch('/api/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name, score, strengths, weaknesses, suggestions }),
            })

            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                console.error('[SendResultEmailButton]', data.error || res.statusText)
                setStatus('error')
                return
            }

            setStatus('sent')
        } catch (err) {
            console.error('[SendResultEmailButton] Network error:', err)
            setStatus('error')
        }
    }

    return (
        <Button
            size="lg"
            variant="outline"
            onClick={handleClick}
            disabled={status === 'sending' || status === 'sent'}
            className={className}
        >
            {status === 'sending' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {status === 'sent' && <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />}
            {status === 'idle' && <Mail className="mr-2 h-4 w-4" />}
            {status === 'error' && <Mail className="mr-2 h-4 w-4 text-red-500" />}

            {status === 'idle' && 'Email Results'}
            {status === 'sending' && 'Sending...'}
            {status === 'sent' && 'Email Sent'}
            {status === 'error' && 'Failed — Retry'}
        </Button>
    )
}
