import React from 'react'
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
} from '@react-pdf/renderer'

// ── Types ────────────────────────────────────────────────────────────

export interface ReportData {
    name: string
    email: string
    resumeAnalysis?: {
        role_fit_score: number
        skills_detected: string[]
        resume_quality: number
        strengths: string[]
        gaps: string[]
    } | null
    skillResults?: {
        score: number
        totalQuestions: number
        correctAnswers: number
        accuracy: number
        skillBreakdown: Record<string, { correct: number; total: number }>
    } | null
    personalityResults?: {
        score: number
    } | null
    overallScore?: number | null
    feedback?: string | null
}

// ── Styles ───────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 11,
        fontFamily: 'Helvetica',
        color: '#1a1a2e',
    },
    title: {
        fontSize: 22,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 4,
        color: '#1a1a2e',
    },
    subtitle: {
        fontSize: 10,
        color: '#6b7280',
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 10,
        marginTop: 20,
        paddingBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        color: '#1a1a2e',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    label: {
        width: 140,
        fontFamily: 'Helvetica-Bold',
        color: '#374151',
    },
    value: {
        flex: 1,
        color: '#4b5563',
    },
    skillRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    skillName: {
        fontFamily: 'Helvetica-Bold',
        color: '#374151',
    },
    skillScore: {
        color: '#4b5563',
    },
    feedbackBox: {
        marginTop: 12,
        padding: 12,
        backgroundColor: '#f9fafb',
        borderRadius: 4,
    },
    feedbackText: {
        fontSize: 10,
        lineHeight: 1.5,
        color: '#4b5563',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 8,
        color: '#9ca3af',
    },
    breakdownWrapper: {
        marginTop: 8,
    },
    breakdownLabel: {
        width: 140,
        fontFamily: 'Helvetica-Bold',
        color: '#374151',
        marginBottom: 6,
    },
    personalityWrapper: {
        marginTop: 12,
    },
    overallWrapper: {
        marginTop: 12,
    },
    overallValue: {
        flex: 1,
        color: '#4b5563',
        fontFamily: 'Helvetica-Bold',
        fontSize: 13,
    },
})

// ── Document ─────────────────────────────────────────────────────────

export function ReportPDF({ data }: { data: ReportData }) {
    const generatedAt = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <Text style={styles.title}>Career Assessment Report</Text>
                <Text style={styles.subtitle}>
                    Generated on {generatedAt} • Evalyze
                </Text>

                {/* Section 1: User Info */}
                <Text style={styles.sectionTitle}>User Information</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Name</Text>
                    <Text style={styles.value}>{data.name || '—'}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.value}>{data.email || '—'}</Text>
                </View>

                {/* Section 2: Resume Analysis */}
                <Text style={styles.sectionTitle}>Resume Analysis</Text>
                {data.resumeAnalysis ? (
                    <>
                        <View style={styles.row}>
                            <Text style={styles.label}>Role Fit Score</Text>
                            <Text style={styles.value}>{data.resumeAnalysis.role_fit_score}%</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Resume Quality</Text>
                            <Text style={styles.value}>{data.resumeAnalysis.resume_quality}%</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Skills Detected</Text>
                            <Text style={styles.value}>
                                {data.resumeAnalysis.skills_detected.length > 0
                                    ? data.resumeAnalysis.skills_detected.join(', ')
                                    : 'None detected'}
                            </Text>
                        </View>
                        {data.resumeAnalysis.strengths.length > 0 && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Strengths</Text>
                                <Text style={styles.value}>
                                    {data.resumeAnalysis.strengths.join(', ')}
                                </Text>
                            </View>
                        )}
                        {data.resumeAnalysis.gaps.length > 0 && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Gaps</Text>
                                <Text style={styles.value}>
                                    {data.resumeAnalysis.gaps.join(', ')}
                                </Text>
                            </View>
                        )}
                    </>
                ) : (
                    <Text style={styles.value}>No resume analysis available.</Text>
                )}

                {/* Section 3: Assessment Results */}
                <Text style={styles.sectionTitle}>Assessment Results</Text>
                {data.skillResults ? (
                    <>
                        <View style={styles.row}>
                            <Text style={styles.label}>Skill Score</Text>
                            <Text style={styles.value}>{data.skillResults.score}%</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Accuracy</Text>
                            <Text style={styles.value}>
                                {data.skillResults.correctAnswers}/{data.skillResults.totalQuestions} correct ({data.skillResults.accuracy}%)
                            </Text>
                        </View>

                        {/* Skill Breakdown */}
                        {Object.keys(data.skillResults.skillBreakdown).length > 0 && (
                            <View style={styles.breakdownWrapper}>
                                <Text style={styles.breakdownLabel}>Skill Breakdown</Text>
                                {Object.entries(data.skillResults.skillBreakdown).map(([skill, result]) => (
                                    <View key={skill} style={styles.skillRow}>
                                        <Text style={styles.skillName}>{skill}</Text>
                                        <Text style={styles.skillScore}>
                                            {result.correct}/{result.total}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </>
                ) : (
                    <Text style={styles.value}>No skill assessment completed.</Text>
                )}

                {data.personalityResults && (
                    <View style={styles.personalityWrapper}>
                        <View style={styles.row}>
                            <Text style={styles.label}>Personality Score</Text>
                            <Text style={styles.value}>{data.personalityResults.score}%</Text>
                        </View>
                    </View>
                )}

                {data.overallScore != null && (
                    <View style={styles.overallWrapper}>
                        <View style={styles.row}>
                            <Text style={styles.label}>Overall Score</Text>
                            <Text style={styles.overallValue}>
                                {data.overallScore}%
                            </Text>
                        </View>
                    </View>
                )}

                {/* Feedback */}
                {data.feedback && (
                    <>
                        <Text style={styles.sectionTitle}>Feedback</Text>
                        <View style={styles.feedbackBox}>
                            <Text style={styles.feedbackText}>{data.feedback}</Text>
                        </View>
                    </>
                )}

                {/* Footer */}
                <Text style={styles.footer}>
                    Evalyze • Career Assessment Report • Confidential
                </Text>
            </Page>
        </Document>
    )
}
