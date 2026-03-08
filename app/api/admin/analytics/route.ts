import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/require-admin'

export async function GET(req: NextRequest) {
    try {
        // Auth + role check
        const auth = await requireAdmin(req)
        if (!auth.authorized) {
            return NextResponse.json(auth.body, { status: auth.status })
        }

        // 1. Fetch Summary Stats
        const { count: userCount } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true })
        const { count: resumeCount } = await supabaseAdmin.from('resume_analysis').select('*', { count: 'exact', head: true })
        const { count: skillCount } = await supabaseAdmin.from('assessment_results').select('*', { count: 'exact', head: true }).not('skill_score', 'is', null)
        const { count: personalityCount } = await supabaseAdmin.from('assessment_results').select('*', { count: 'exact', head: true }).not('personality_score', 'is', null)
        const { count: totalAssessments } = await supabaseAdmin.from('assessment_results').select('*', { count: 'exact', head: true })

        // 2. Fetch Resume Trend Data (Last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: resumeAnalysisData } = await supabaseAdmin
            .from('resume_analysis')
            .select('created_at, target_role')
            .gte('created_at', thirtyDaysAgo.toISOString())
            .order('created_at', { ascending: true })

        const resumeTrendMap: Record<string, number> = {}
        const domainDistMap: Record<string, number> = {}

        if (resumeAnalysisData) {
            resumeAnalysisData.forEach(item => {
                // Resume Trend
                const dateRaw = new Date(item.created_at)
                if (!isNaN(dateRaw.getTime())) {
                    const dateStr = dateRaw.toISOString().split('T')[0]
                    resumeTrendMap[dateStr] = (resumeTrendMap[dateStr] || 0) + 1
                }

                // Domain Distribution
                if (item.target_role) {
                    domainDistMap[item.target_role] = (domainDistMap[item.target_role] || 0) + 1
                }
            })
        }

        // Fill in missing dates for trend
        const resumeTrend = []
        for (let d = new Date(thirtyDaysAgo); d <= new Date(); d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0]
            resumeTrend.push({
                date: dateStr,
                count: resumeTrendMap[dateStr] || 0
            })
        }

        const domainDistribution = Object.entries(domainDistMap).map(([domain, count]) => ({ domain, count }))

        // 3. Fetch Assessment Distribution
        const { data: assessmentData } = await supabaseAdmin
            .from('assessment_results')
            .select('user_id, skill_score, personality_score')

        const skillDistMap = { '0-40': 0, '40-60': 0, '60-80': 0, '80-100': 0 }
        const personalityDistMap = { 'Pragmatist (<40)': 0, 'Team Player (40-60)': 0, 'Innovator (60-80)': 0, 'Leader (>80)': 0 }

        // Completion rate map
        // 0: Resume only (Implicit, we will calculate based on user count)
        // 1: Resume + Skill OR Resume + Personality
        // 2: All 3 (Resume + Skill + Personality)
        const userCompletionMap: Record<string, { hasResume: boolean, hasSkill: boolean, hasPersonality: boolean }> = {}

        // Initialize userCompletionMap with users who have a resume
        if (resumeAnalysisData) {
            // We need all resumes to be accurate for completion rate
            const { data: allResumes } = await supabaseAdmin.from('resume_analysis').select('user_id')
            if (allResumes) {
                allResumes.forEach(r => {
                    if (r.user_id) {
                        userCompletionMap[r.user_id] = { hasResume: true, hasSkill: false, hasPersonality: false }
                    }
                })
            }
        }

        if (assessmentData) {
            assessmentData.forEach(item => {
                // Skill Dist
                if (item.skill_score !== null) {
                    if (item.skill_score <= 40) skillDistMap['0-40']++
                    else if (item.skill_score <= 60) skillDistMap['40-60']++
                    else if (item.skill_score <= 80) skillDistMap['60-80']++
                    else skillDistMap['80-100']++
                }

                // Personality Dist
                if (item.personality_score !== null) {
                    if (item.personality_score <= 40) personalityDistMap['Pragmatist (<40)']++
                    else if (item.personality_score <= 60) personalityDistMap['Team Player (40-60)']++
                    else if (item.personality_score <= 80) personalityDistMap['Innovator (60-80)']++
                    else personalityDistMap['Leader (>80)']++
                }

                // Completion Rate marking
                if (item.user_id) {
                    if (!userCompletionMap[item.user_id]) {
                        userCompletionMap[item.user_id] = { hasResume: false, hasSkill: false, hasPersonality: false }
                    }
                    if (item.skill_score !== null) userCompletionMap[item.user_id].hasSkill = true
                    if (item.personality_score !== null) userCompletionMap[item.user_id].hasPersonality = true
                }
            })
        }

        const skillDistribution = Object.entries(skillDistMap).map(([range, count]) => ({ range, count }))
        const personalityDistribution = Object.entries(personalityDistMap).map(([type, count]) => ({ type, count }))

        const completionDist = {
            'Resume Only': 0,
            'Resume + Skill or Personality': 0,
            'All Three': 0
        }

        Object.values(userCompletionMap).forEach(status => {
            if (status.hasResume && !status.hasSkill && !status.hasPersonality) {
                completionDist['Resume Only']++
            } else if (status.hasResume && status.hasSkill && status.hasPersonality) {
                completionDist['All Three']++
            } else if (status.hasResume && (status.hasSkill || status.hasPersonality)) {
                completionDist['Resume + Skill or Personality']++
            }
        })
        const completionRate = Object.entries(completionDist).map(([status, count]) => ({ status, count }))

        return NextResponse.json({
            stats: {
                totalUsers: userCount || 0,
                totalResumes: resumeCount || 0,
                totalAssessments: totalAssessments || 0,
                skillAssessments: skillCount || 0,
                personalityAssessments: personalityCount || 0,
            },
            resumeTrend,
            domainDistribution,
            skillDistribution,
            personalityDistribution,
            completionRate
        })

    } catch (error: any) {
        console.error('Admin Analytics API Error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
