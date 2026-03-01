'use client'

import { useState } from 'react'
import { downloadReportPDF } from '@/lib/pdf'
import type { ReportData } from '@/components/pdf/ReportPDF'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'

interface DownloadReportButtonProps {
    /** Report data to render into the PDF */
    data: ReportData
    /** Optional custom button text */
    label?: string
    /** Optional extra className */
    className?: string
}

/**
 * Reusable button that generates and downloads a PDF report.
 * Works in both user dashboard and admin views.
 */
export function DownloadReportButton({
    data,
    label = 'Download PDF Report',
    className,
}: DownloadReportButtonProps) {
    const [generating, setGenerating] = useState(false)

    const handleClick = async () => {
        setGenerating(true)
        try {
            await downloadReportPDF(data)
        } catch (err) {
            console.error('[DownloadReportButton] PDF generation failed:', err)
        } finally {
            setGenerating(false)
        }
    }

    return (
        <Button
            variant="outline"
            onClick={handleClick}
            disabled={generating}
            className={className}
        >
            {generating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Download className="mr-2 h-4 w-4" />
            )}
            {generating ? 'Generating…' : label}
        </Button>
    )
}
