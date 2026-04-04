"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/app-context";
import { Button } from "@/components/ui/button";
import { downloadReportPDF } from "@/lib/pdf";
import type { ReportData } from "@/components/pdf/ReportPDF";
import {
    Download,
    Loader2,
    RefreshCw,
    History,
    ArrowLeft,
    Trash2,
} from "lucide-react";

type HistoryRow = {
    id: string;
    resume_name: string;
    target_role: string;
    overall_score: number;
    readiness_level: string;
    result_json: any;
    created_at: string;
};

export function AnalysisHistory() {
    const { session, user, resetAssessment, setCurrentStep } = useApp();
    const [rows, setRows] = useState<HistoryRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    useEffect(() => {
        if (!session?.user?.id) return;
        const fetchHistory = async () => {
            try {
                const res = await fetch(`/api/analysis-history`, {
                    headers: {
                        Authorization: `Bearer ${session.access_token}`
                    }
                });
                const data = await res.json();
                if (data.success) {
                    const allData = data.data || [];
                    const hiddenIds = JSON.parse(localStorage.getItem('hiddenAnalysisIds') || '[]');
                    setRows(allData.filter((r: HistoryRow) => !hiddenIds.includes(r.id)));
                }
            } catch (err) {
                console.error("[AnalysisHistory] Fetch failed:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [session?.user?.id]);

    const handleDownload = async (row: HistoryRow) => {
        setDownloadingId(row.id);
        try {
            const rj = row.result_json || {};
            const reportData: ReportData = {
                name: user?.name || "",
                email: user?.email || "",
                resumeAnalysis: rj.resumeAnalysis || null,
                skillResults: rj.skillResults || null,
                personalityResults: rj.personalityResults || null,
                overallScore: row.overall_score,
                feedback: rj.resumeAnalysis?.feedback || null,
            };
            await downloadReportPDF(reportData);
        } catch (err) {
            console.error("[AnalysisHistory] Download failed:", err);
        } finally {
            setDownloadingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center p-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10">
            {/* Header */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setCurrentStep("dashboard")}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <History className="h-6 w-6 text-primary" />
                            Analysis History
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            All your previously completed resume analyses.
                        </p>
                    </div>
                </div>
                <Button className="gap-2" onClick={resetAssessment}>
                    <RefreshCw className="h-4 w-4" />
                    Analyze New Resume
                </Button>
            </div>

            {/* Table */}
            {rows.length === 0 ? (
                <div className="rounded-2xl border border-border bg-card p-12 text-center">
                    <History className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
                    <h2 className="mb-2 text-lg font-semibold text-foreground">
                        No Analysis History
                    </h2>
                    <p className="mb-6 text-muted-foreground">
                        Complete your first assessment to see results here.
                    </p>
                    <Button className="gap-2" onClick={resetAssessment}>
                        Start Your First Assessment
                    </Button>
                </div>
            ) : (
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                        Resume
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                        Target Role
                                    </th>
                                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                                        Score
                                    </th>
                                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                                        Readiness
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                        Date
                                    </th>
                                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                                    >
                                        <td className="px-4 py-3 font-medium text-foreground">
                                            {row.resume_name}
                                        </td>
                                        <td className="px-4 py-3 text-foreground capitalize">
                                            {row.target_role}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                                                {row.overall_score}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${row.readiness_level === "Excellent"
                                                    ? "bg-secondary/10 text-secondary"
                                                    : row.readiness_level === "Good"
                                                        ? "bg-primary/10 text-primary"
                                                        : "bg-accent/10 text-accent"
                                                    }`}
                                            >
                                                {row.readiness_level}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {new Date(row.created_at).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="gap-1.5"
                                                    disabled={downloadingId === row.id}
                                                    onClick={() => handleDownload(row)}
                                                >
                                                    {downloadingId === row.id ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <Download className="h-3.5 w-3.5" />
                                                    )}
                                                    {downloadingId === row.id ? "..." : "Report"}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                    onClick={() => {
                                                        const hiddenIds = JSON.parse(localStorage.getItem('hiddenAnalysisIds') || '[]');
                                                        if (!hiddenIds.includes(row.id)) {
                                                            hiddenIds.push(row.id);
                                                            localStorage.setItem('hiddenAnalysisIds', JSON.stringify(hiddenIds));
                                                        }
                                                        setRows((prev) => prev.filter((r) => r.id !== row.id));
                                                    }}
                                                    title="Remove from list (local only)"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
