"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/app-context";
import { Button } from "@/components/ui/button";
import { DownloadReportButton } from "@/components/download-report-button";
import { SendResultEmailButton } from "@/components/SendResultEmailButton";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Trophy,
  Target,
  FileText,
  Brain,
  Heart,
  Calendar,
  BookOpen,
  ArrowRight,
} from "lucide-react";

function AnimatedScore({
  target,
  size = 180,
  strokeWidth = 14,
}: {
  target: number;
  size?: number;
  strokeWidth?: number;
}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame: number;
    let start: number;
    const duration = 1500;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setValue(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className="stroke-primary transition-all"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-5xl font-bold text-foreground">{value}</span>
        <span className="text-sm text-muted-foreground">/100</span>
      </div>
    </div>
  );
}

export function ResultsPage() {
  const { resumeAnalysis, selectedRole, user, skillResults, personalityResults, resetAssessment } = useApp();

  // If no analysis data, show a message
  if (!resumeAnalysis) {
    return (
      <div className="mx-auto max-w-4xl p-6 md:p-10">
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold text-foreground">No Analysis Available</h2>
          <p className="mt-2 text-muted-foreground">
            Please upload and analyze your resume first.
          </p>
        </div>
      </div>
    );
  }

  const overallScore = resumeAnalysis.overall_score || resumeAnalysis.role_fit_score;
  const readinessColor =
    overallScore >= 80
      ? "text-secondary"
      : overallScore >= 60
        ? "text-primary"
        : "text-accent";

  const readinessLevel =
    overallScore >= 80 ? "Excellent" :
      overallScore >= 60 ? "Good" :
        overallScore >= 40 ? "Moderate" : "Needs Improvement";

  return (
    <div className="mx-auto max-w-4xl p-6 md:p-10">
      {/* Section A: Overall Readiness */}
      <div className="mb-8 rounded-2xl border border-border bg-primary/5 p-10 text-center">
        <AnimatedScore target={overallScore} />
        <h1 className={cn("mt-4 text-2xl font-bold", readinessColor)}>
          {readinessLevel} Readiness
        </h1>
        <p className="mt-1 text-muted-foreground">
          for {selectedRole || "your target role"}
        </p>
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          Automated Analysis
        </div>
      </div>

      {/* Section B: AI Feedback */}
      {resumeAnalysis.feedback && (
        <div className="mb-8 rounded-xl border border-primary/30 bg-primary/5 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
            <Sparkles className="h-5 w-5 text-primary" />
            Analysis Feedback
          </h2>
          <p className="text-foreground leading-relaxed">
            {resumeAnalysis.feedback}
          </p>
        </div>
      )}

      {/* Section C: Skills Detected */}
      <div className="mb-8 rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
          <CheckCircle2 className="h-5 w-5 text-secondary" />
          Skills Detected ({resumeAnalysis.skills_detected.length})
        </h2>
        {resumeAnalysis.skills_detected.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {resumeAnalysis.skills_detected.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-secondary/10 px-4 py-2 text-sm font-medium text-secondary"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No skills detected in your resume.</p>
        )}
      </div>

      {/* Section D: Resume Quality */}
      <div className="mb-8 rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
          <FileText className="h-5 w-5 text-primary" />
          Resume Quality Score
        </h2>
        <div className="mb-4 flex items-end gap-3">
          <span className="text-4xl font-bold text-foreground">
            {resumeAnalysis.resume_quality}
          </span>
          <span className="mb-1 text-muted-foreground">/100</span>
        </div>
        <div className="h-2 rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-primary transition-all duration-700"
            style={{ width: `${resumeAnalysis.resume_quality}%` }}
          />
        </div>
      </div>

      {/* Section E: Strengths */}
      {resumeAnalysis.strengths && resumeAnalysis.strengths.length > 0 && (
        <div className="mb-8 rounded-xl border border-secondary/30 bg-secondary/5 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
            <Trophy className="h-5 w-5 text-secondary" />
            Your Strengths
          </h2>
          <div className="flex flex-col gap-3">
            {resumeAnalysis.strengths.map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                <p className="text-sm leading-relaxed text-foreground">{s}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section F: Areas for Improvement */}
      {resumeAnalysis.gaps && resumeAnalysis.gaps.length > 0 && (
        <div className="mb-8 rounded-xl border border-accent/30 bg-accent/5 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
            <Target className="h-5 w-5 text-accent" />
            Areas for Improvement
          </h2>
          <div className="flex flex-col gap-3">
            {resumeAnalysis.gaps.map((gap, i) => (
              <div key={i} className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <p className="text-sm leading-relaxed text-foreground">{gap}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section G: Export */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <DownloadReportButton
          data={{
            name: user?.name || '',
            email: user?.email || '',
            resumeAnalysis: resumeAnalysis || undefined,
            skillResults: skillResults || undefined,
            personalityResults: personalityResults || undefined,
            overallScore: resumeAnalysis?.overall_score || resumeAnalysis?.role_fit_score || null,
            feedback: resumeAnalysis?.feedback || null,
          }}
          className="flex-1"
        />
        <SendResultEmailButton
          email={user?.email || ''}
          name={user?.name || ''}
          score={resumeAnalysis?.overall_score || resumeAnalysis?.role_fit_score || 0}
          strengths={resumeAnalysis?.strengths || []}
          weaknesses={resumeAnalysis?.gaps || []}
          suggestions={resumeAnalysis?.feedback ? [resumeAnalysis.feedback] : []}
          className="flex-1"
        />
      </div>

      {/* Section H: Analyze Another Resume */}
      <div className="mt-4">
        <Button
          size="lg"
          variant="outline"
          className="w-full gap-2"
          onClick={resetAssessment}
        >
          <ArrowRight className="h-4 w-4" />
          Analyze Another Resume
        </Button>
      </div>
    </div>
  );
}
