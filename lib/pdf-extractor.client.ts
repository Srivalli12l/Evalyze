'use client'

/**
 * Client-side PDF text extraction using pdfjs-dist.
 * Uses a dynamic import so the build won't fail if pdfjs-dist
 * is not installed — the error surfaces only at runtime if
 * this function is actually called.
 *
 * NOTE: This file is currently NOT imported anywhere in the project.
 * Resume text extraction is handled server-side by /api/resume/analyze
 * using the `pdf-parse` package.
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist')

  pdfjsLib.GlobalWorkerOptions.workerSrc =
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  let text = ''

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map((item: any) => item.str).join(' ') + '\n'
  }

  return text.trim()
}