'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
    Users,
    FileText,
    Brain,
    BarChart3,
    Sparkles,
    LogOut,
    CheckCircle2
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

// ── Types ────────────────────────────────────────────────────────────

interface User {
    name: string
    email: string
    created_at: string
}

interface Assessment {
    id: string
    user_id: string
    skill_score: number
    personality_score: number
    overall_score: number
    created_at: string
}

interface ResumeEntry {
    id: string
    user_id: string
    target_role: string
    analysis_score: number
    created_at: string
}

interface OverviewStats {
    totalUsers: number
    totalResumes: number
    totalAssessments: number
    skillAssessments: number
    personalityAssessments: number
}

interface AnalyticsData {
    stats: OverviewStats
    resumeTrend: { date: string, count: number }[]
    domainDistribution: { domain: string, count: number }[]
    skillDistribution: { range: string, count: number }[]
    personalityDistribution: { type: string, count: number }[]
    completionRate: { status: string, count: number }[]
}

// ── Component ────────────────────────────────────────────────────────

export default function AdminDashboard() {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
    const [stats, setStats] = useState<OverviewStats | null>(null) // legacy
    const [users, setUsers] = useState<User[]>([])
    const [assessments, setAssessments] = useState<Assessment[]>([])
    const [resumes, setResumes] = useState<ResumeEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true)

                // Get the current session token for auth
                const { data: { session } } = await supabase.auth.getSession()
                if (!session) {
                    throw new Error('No active session')
                }

                const authHeaders = {
                    'Authorization': `Bearer ${session.access_token}`,
                }

                const [analyticsRes, usersRes, assessmentsRes, resumesRes] = await Promise.all([
                    fetch('/api/admin/analytics', { headers: authHeaders }),
                    fetch('/api/admin/users', { headers: authHeaders }),
                    fetch('/api/admin/assessments', { headers: authHeaders }),
                    fetch('/api/admin/resumes', { headers: authHeaders }),
                ])

                if (!analyticsRes.ok || !usersRes.ok || !assessmentsRes.ok || !resumesRes.ok) {
                    throw new Error('One or more API requests failed')
                }

                const [analyticsData, usersData, assessmentsData, resumesData] = await Promise.all([
                    analyticsRes.json(),
                    usersRes.json(),
                    assessmentsRes.json(),
                    resumesRes.json(),
                ])

                setAnalytics(analyticsData)
                setStats(analyticsData.stats) // Map new stats to existing structure
                setUsers(usersData)
                setAssessments(assessmentsData)
                setResumes(resumesData)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // ── Loading ──────────────────────────────────────────────────────
    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading Admin Panel…</p>
            </div>
        </div>
    )

    // ── Error ────────────────────────────────────────────────────────
    if (error) return (
        <div className="flex items-center justify-center min-h-screen bg-background p-8">
            <div className="rounded-2xl border border-destructive/30 bg-card p-6 shadow-sm max-w-md">
                <h2 className="font-bold text-foreground mb-1">Dashboard Error</h2>
                <p className="text-sm text-destructive">{error}</p>
            </div>
        </div>
    )

    // ── Dashboard ────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-card px-6 py-5 lg:px-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                            <Sparkles className="h-4.5 w-4.5 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-foreground tracking-tight">Admin Panel</h1>
                            <p className="text-xs text-muted-foreground font-medium">Placement Readiness System</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <button
                            onClick={async () => {
                                await supabase.auth.signOut()
                                window.location.href = '/'
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/80 transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <div className="p-6 lg:p-10 space-y-8">
                {/* ── Summary Cards ──────────────────────────────────── */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                        { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-primary' },
                        { label: 'Resumes Analyzed', value: stats?.totalResumes ?? 0, icon: FileText, color: 'text-secondary' },
                        { label: 'Skill Assessments', value: stats?.skillAssessments ?? 0, icon: Brain, color: 'text-accent' },
                        { label: 'Personality Assessments', value: stats?.personalityAssessments ?? 0, icon: CheckCircle2, color: 'text-muted-foreground' },
                    ].map((card) => (
                        <div
                            key={card.label}
                            className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{card.label}</p>
                                <card.icon className={`h-5 w-5 ${card.color} opacity-70`} />
                            </div>
                            <p className={`text-4xl font-black ${card.color}`}>{card.value}</p>
                        </div>
                    ))}
                </section>

                {/* ── Analytics Charts ───────────────────────────────── */}
                {analytics && (
                    <section className="space-y-5">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {/* Resume Analysis Trend */}
                            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                                <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-widest">Resume Analysis Trend</h3>
                                <div className="h-64">
                                    <Line
                                        data={{
                                            labels: analytics.resumeTrend.map(d => new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
                                            datasets: [{
                                                label: 'Resumes Analyzed',
                                                data: analytics.resumeTrend.map(d => d.count),
                                                borderColor: 'rgb(59, 130, 246)',
                                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                                fill: true,
                                                tension: 0.4
                                            }]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { display: false } },
                                            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Domain Distribution */}
                            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                                <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-widest">Domain Distribution</h3>
                                <div className="h-64">
                                    <Bar
                                        data={{
                                            labels: analytics.domainDistribution.map(d => d.domain),
                                            datasets: [{
                                                label: 'Users',
                                                data: analytics.domainDistribution.map(d => d.count),
                                                backgroundColor: 'rgba(139, 92, 246, 0.8)',
                                                borderRadius: 4
                                            }]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { display: false } },
                                            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {/* Skill Score Distribution */}
                            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                                <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-widest">Skill Score Distribution</h3>
                                <div className="h-64">
                                    <Bar
                                        data={{
                                            labels: analytics.skillDistribution.map(d => d.range),
                                            datasets: [{
                                                label: 'Users',
                                                data: analytics.skillDistribution.map(d => d.count),
                                                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                                                borderRadius: 4
                                            }]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { display: false } },
                                            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Personality Type Distribution */}
                            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                                <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-widest">Personality Types</h3>
                                <div className="h-64 flex items-center justify-center">
                                    <Pie
                                        data={{
                                            labels: analytics.personalityDistribution.map(d => d.type),
                                            datasets: [{
                                                data: analytics.personalityDistribution.map(d => d.count),
                                                backgroundColor: [
                                                    'rgba(244, 63, 94, 0.8)',
                                                    'rgba(14, 165, 233, 0.8)',
                                                    'rgba(245, 158, 11, 0.8)',
                                                    'rgba(168, 85, 247, 0.8)',
                                                ],
                                                borderWidth: 0
                                            }]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } }
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Assessment Completion Rate */}
                            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                                <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-widest">Completion Rate</h3>
                                <div className="h-64 flex items-center justify-center">
                                    <Pie
                                        data={{
                                            labels: analytics.completionRate.map(d => d.status),
                                            datasets: [{
                                                data: analytics.completionRate.map(d => d.count),
                                                backgroundColor: [
                                                    'rgba(100, 116, 139, 0.8)',
                                                    'rgba(59, 130, 246, 0.8)',
                                                    'rgba(34, 197, 94, 0.8)',
                                                ],
                                                borderWidth: 0
                                            }]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } }
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* ── Users Table ────────────────────────────────────── */}
                <section className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-border flex justify-between items-center">
                        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            Student Profiles
                        </h2>
                        <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-full uppercase tracking-wider">
                            All Time
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-muted/50 text-muted-foreground text-[10px] font-bold uppercase tracking-widest border-b border-border">
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Email</th>
                                    <th className="px-6 py-3">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {users.length > 0 ? users.slice(0, 10).map((user, idx) => (
                                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 text-sm font-semibold text-foreground">{user.name || 'Anonymous'}</td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">{user.email}</td>
                                        <td className="px-6 py-4 text-xs text-muted-foreground">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-16 text-center text-muted-foreground italic">
                                            No users found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* ── Two-Column: Assessments + Resumes ──────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                    {/* Assessments Table */}
                    <section className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
                            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-primary" />
                                Latest Assessments
                            </h2>
                            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                Recent 10
                            </span>
                        </div>
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-muted/50 text-muted-foreground text-[10px] font-bold uppercase tracking-widest border-b border-border">
                                        <th className="px-6 py-3">User</th>
                                        <th className="px-6 py-3">Scores (S/P)</th>
                                        <th className="px-6 py-3">Overall</th>
                                        <th className="px-6 py-3 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {assessments.length > 0 ? assessments.map((a) => (
                                        <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4 text-xs font-mono font-bold text-muted-foreground">
                                                {a.user_id.slice(0, 8)}…
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold">
                                                <span className="text-primary">{a.skill_score ?? '—'}</span>
                                                <span className="text-muted-foreground mx-1">/</span>
                                                <span className="text-secondary">{a.personality_score ?? '—'}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-14 h-1.5 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${(a.overall_score ?? 0) >= 80 ? 'bg-secondary' :
                                                                (a.overall_score ?? 0) >= 60 ? 'bg-accent' : 'bg-destructive'
                                                                }`}
                                                            style={{ width: `${a.overall_score ?? 0}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-bold text-foreground">{a.overall_score ?? 0}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-muted-foreground text-right">
                                                {new Date(a.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-16 text-center text-muted-foreground italic">
                                                No assessments yet
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Resume Analysis Table */}
                    <section className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
                            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                                <FileText className="h-4 w-4 text-secondary" />
                                Resume Analyses
                            </h2>
                            <span className="text-[10px] font-bold text-secondary bg-secondary/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                Recent 10
                            </span>
                        </div>
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-muted/50 text-muted-foreground text-[10px] font-bold uppercase tracking-widest border-b border-border">
                                        <th className="px-6 py-3">User</th>
                                        <th className="px-6 py-3">Target Role</th>
                                        <th className="px-6 py-3">Score</th>
                                        <th className="px-6 py-3 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {resumes.length > 0 ? resumes.map((r) => (
                                        <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4 text-xs font-mono font-bold text-muted-foreground">
                                                {r.user_id.slice(0, 8)}…
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-foreground">
                                                {r.target_role || '—'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-14 h-1.5 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${(r.analysis_score ?? 0) >= 80 ? 'bg-secondary' :
                                                                (r.analysis_score ?? 0) >= 60 ? 'bg-accent' : 'bg-destructive'
                                                                }`}
                                                            style={{ width: `${r.analysis_score ?? 0}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-bold text-foreground">{r.analysis_score ?? 0}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-muted-foreground text-right">
                                                {new Date(r.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-16 text-center text-muted-foreground italic">
                                                No resume analyses yet
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
