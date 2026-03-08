"use client";

import { useApp } from "@/lib/app-context";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Brain,
  Heart,
  ArrowRight,
  Upload,
  History,
} from "lucide-react";

export function DashboardContent() {
  const { user, setCurrentStep } = useApp();

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome, {user?.name}!
          </h1>
          <p className="mt-1 text-muted-foreground">
            Start by uploading your resume and selecting your target role.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setCurrentStep("analysis-history")}
        >
          <History className="h-4 w-4" />
          Analysis History
        </Button>
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
