"use client";

import { useApp } from "@/lib/app-context";
import { LandingPage } from "@/components/landing-page";
import { AuthPage } from "@/components/auth-page";
import { DashboardLayout } from "@/components/dashboard-layout";
import { DashboardContent } from "@/components/dashboard-content";
import { ResumeUpload } from "@/components/resume-upload";
import { SkillAssessment } from "@/components/skill-assessment";
import { PersonalityTest } from "@/components/personality-test";
import { ResultsPage } from "@/components/results-page";
import { AnalysisHistory } from "@/components/analysis-history";
import { Loader2 } from "lucide-react";

export default function Page() {
  const { currentStep, authLoading } = useApp();

  // Show a clean loading state while checking the session
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Public pages (no dashboard layout)
  if (currentStep === "landing") return <LandingPage />;
  if (currentStep === "login") return <AuthPage mode="login" />;
  if (currentStep === "signup") return <AuthPage mode="signup" />;

  // Protected pages (with dashboard layout)
  return (
    <DashboardLayout>
      {currentStep === "dashboard" && <DashboardContent />}
      {currentStep === "resume-upload" && <ResumeUpload />}
      {currentStep === "skill-assessment" && <SkillAssessment />}
      {currentStep === "personality-test" && <PersonalityTest />}
      {currentStep === "results" && <ResultsPage />}
      {currentStep === "analysis-history" && <AnalysisHistory />}
    </DashboardLayout>
  );
}

