import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, name, score, strengths, weaknesses, suggestions } = body

    // ── Validate required fields ──────────────────────────────────
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid email' }, { status: 400 })
    }
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid name' }, { status: 400 })
    }
    if (typeof score !== 'number') {
      return NextResponse.json({ error: 'Missing or invalid score' }, { status: 400 })
    }
    if (!Array.isArray(strengths) || !Array.isArray(weaknesses) || !Array.isArray(suggestions)) {
      return NextResponse.json(
        { error: 'strengths, weaknesses, and suggestions must be arrays' },
        { status: 400 },
      )
    }

    // ── Build HTML email ──────────────────────────────────────────
    const listItems = (items: string[]) =>
      items.length > 0
        ? items.map((item) => `<li style="margin-bottom:6px;color:#374151;">${item}</li>`).join('')
        : '<li style="color:#9ca3af;">None</li>'

    const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">

        <!-- Header -->
        <tr>
          <td style="background-color:#1a1a2e;padding:32px 40px;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;">Placement Readiness Result</h1>
            <p style="margin:8px 0 0;color:#a5b4fc;font-size:14px;">Evalyze</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 40px;">

            <p style="margin:0 0 24px;color:#374151;font-size:15px;">
              Hello ${name},
            </p>

            <!-- Overall Score -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td style="background-color:#f0fdf4;border-radius:8px;padding:20px 24px;text-align:center;">
                  <p style="margin:0 0 4px;color:#6b7280;font-size:13px;">Overall Score</p>
                  <p style="margin:0;color:#1a1a2e;font-size:36px;font-weight:bold;">${score}<span style="font-size:18px;color:#6b7280;">/100</span></p>
                </td>
              </tr>
            </table>

            <!-- Strengths -->
            <h2 style="margin:0 0 10px;font-size:16px;color:#1a1a2e;">Strengths</h2>
            <ul style="margin:0 0 24px;padding-left:20px;list-style-type:disc;">
              ${listItems(strengths)}
            </ul>

            <!-- Weaknesses -->
            <h2 style="margin:0 0 10px;font-size:16px;color:#1a1a2e;">Areas for Improvement</h2>
            <ul style="margin:0 0 24px;padding-left:20px;list-style-type:disc;">
              ${listItems(weaknesses)}
            </ul>

            <!-- Suggestions -->
            <h2 style="margin:0 0 10px;font-size:16px;color:#1a1a2e;">Suggestions</h2>
            <ul style="margin:0 0 24px;padding-left:20px;list-style-type:disc;">
              ${listItems(suggestions)}
            </ul>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">
              This is an automated email from Evalyze. Please do not reply.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

    // ── Send email ────────────────────────────────────────────────
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'RESEND_API_KEY is not configured' }, { status: 500 })
    }

    const { data: result, error } = await resend.emails.send({
      from: 'Evalyze <onboarding@resend.dev>',
      to: email,
      subject: 'Your Placement Readiness Result',
      html,
    })

    if (error) {
      console.error('[email/route] Resend error:', JSON.stringify(error))
      return NextResponse.json(
        { error: error.message || 'Failed to send email' },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true, id: result?.id })
  } catch (err: any) {
    console.error('[email/route] Unexpected error:', err)
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 },
    )
  }
}
