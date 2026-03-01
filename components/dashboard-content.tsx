"use client";

import { useApp } from "@/lib/app-context";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Brain,
  Heart,
  ArrowRight,
  CheckCircle2,
  Lock,
  Upload,
} from "lucide-react";

function CircularProgress({
  value,
  size = 120,
  strokeWidth = 10,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
}) {
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
          className="stroke-border"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className="stroke-primary transition-all duration-1000"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-foreground">{value}</span>
        <span className="text-xs text-muted-foreground">/100</span>
      </div>
    </div>
  );
}

export function DashboardContent() {
  const { user, progress, setCurrentStep } = useApp();

  // State 3: All Complete
  if (progress.allDone) {
    return (
      <div className="p-6 md:p-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-1 text-muted-foreground">
            Your assessment is complete. View your results below.
          </p>
        </div>

        <div className="mb-8 flex flex-col items-center rounded-2xl border border-border bg-card p-10">
          <CircularProgress value={78} size={160} strokeWidth={12} />
          <h2 className="mt-4 text-xl font-bold text-foreground">
            Good Readiness
          </h2>
          <p className="mt-1 text-muted-foreground">
            for Frontend Developer
          </p>
          <Button
            className="mt-6 gap-2"
            onClick={() => setCurrentStep("results")}
          >
            View Detailed Feedback
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              label: "Resume Analysis",
              score: 75,
              icon: FileText,
              status: "completed" as const,
            },
            {
              label: "Skill Assessment",
              score: 80,
              icon: Brain,
              status: "completed" as const,
            },
            {
              label: "Personality Test",
              score: 85,
              icon: Heart,
              status: "completed" as const,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                <item.icon className="h-5 w-5 text-secondary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {item.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  Score: {item.score}/100
                </p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-secondary" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // State 2: Resume uploaded, tests pending
  if (progress.resumeUploaded) {
    return (
      <div className="p-6 md:p-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-1 text-muted-foreground">
            Continue your assessment journey.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-center gap-4 rounded-xl border border-secondary/30 bg-secondary/5 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
              <CheckCircle2 className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Resume Analyzed
              </p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-primary/30 bg-primary/5 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {progress.skillTestDone
                  ? "Skill Test Done"
                  : "Skill Test Pending"}
              </p>
              <p className="text-xs text-muted-foreground">
                {progress.skillTestDone ? "Completed" : "Up next"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Personality Test
              </p>
              <p className="text-xs text-muted-foreground">
                {progress.skillTestDone ? "Up next" : "Locked"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-border bg-card p-8 text-center">
          <h2 className="mb-2 text-lg font-semibold text-foreground">
            {progress.skillTestDone
              ? "Ready for Personality Assessment"
              : "Ready for Skill Assessment"}
          </h2>
          <p className="mb-6 text-muted-foreground">
            {progress.skillTestDone
              ? "Complete the personality test to unlock your final results."
              : "Take the AI-generated skill test based on your resume and target role."}
          </p>
          <Button
            className="gap-2"
            onClick={() =>
              setCurrentStep(
                progress.skillTestDone
                  ? "personality-test"
                  : "skill-assessment"
              )
            }
          >
            Continue to{" "}
            {progress.skillTestDone
              ? "Personality Assessment"
              : "Skill Assessment"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // State 1: No resume uploaded
  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Welcome, {user?.name}!
        </h1>
        <p className="mt-1 text-muted-foreground">
          Start by uploading your resume and selecting your target role.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-10 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Upload className="h-8 w-8 text-primary" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-foreground">
          Upload Your Resume
        </h2>
        <p className="mb-8 text-muted-foreground">
          Select your target role and upload your resume to get started with your
          AI-powered assessment.
        </p>
        <Button
          size="lg"
          className="gap-2"
          onClick={() => setCurrentStep("resume-upload")}
        >
          Upload Resume & Select Role
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          {
            icon: FileText,
            title: "Step 1: Resume Upload",
            desc: "Upload your resume for AI analysis",
          },
          {
            icon: Brain,
            title: "Step 2: Skill Assessment",
            desc: "Take a personalized skill test",
          },
          {
            icon: Heart,
            title: "Step 3: Personality Test",
            desc: "Complete role-specific scenarios",
          },
        ].map((step) => (
          <div
            key={step.title}
            className="rounded-xl border border-border bg-card p-5"
          >
            <step.icon className="mb-3 h-5 w-5 text-muted-foreground" />
            <h3 className="text-sm font-medium text-foreground">
              {step.title}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
