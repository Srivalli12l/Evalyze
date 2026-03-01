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

export default function Page() {
  const { currentStep } = useApp();

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
    </DashboardLayout>
  );
}
