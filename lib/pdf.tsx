'use client'

import { pdf } from '@react-pdf/renderer'
import { ReportPDF, type ReportData } from '@/components/pdf/ReportPDF'

/**
 * Generates a PDF blob from report data and triggers a browser download.
 * Runs entirely on the client — no server calls.
 */
export async function downloadReportPDF(data: ReportData): Promise<void> {
    const blob = await pdf(<ReportPDF data={data} />).toBlob()

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Evalyze_Report_${data.name?.replace(/\s+/g, '_') || 'User'}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}
