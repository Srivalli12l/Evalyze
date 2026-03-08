"use client";

import { type ReactNode, useState } from "react";
import { useApp, type AppStep } from "@/lib/app-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  FileText,
  Brain,
  Heart,
  BarChart3,
  LogOut,
  CheckCircle2,
  Lock,
  Menu,
  X,
  History,
} from "lucide-react";

type SidebarStep = {
  id: number;
  name: string;
  icon: typeof FileText;
  navTarget: AppStep;
};

const sidebarSteps: SidebarStep[] = [
  {
    id: 1,
    name: "Resume Upload",
    icon: FileText,
    navTarget: "resume-upload",
  },
  {
    id: 2,
    name: "Skill Assessment",
    icon: Brain,
    navTarget: "skill-assessment",
  },
  {
    id: 3,
    name: "Personality Test",
    icon: Heart,
    navTarget: "personality-test",
  },
  { id: 4, name: "Results", icon: BarChart3, navTarget: "results" },
];

function getStepStatus(
  stepId: number,
  progress: {
    resumeUploaded: boolean;
    skillTestDone: boolean;
    personalityDone: boolean;
    allDone: boolean;
  },
  currentStep: AppStep
) {
  switch (stepId) {
    case 1: // Resume Upload
      if (progress.resumeUploaded) return "completed";
      if (currentStep === "resume-upload" || currentStep === "dashboard")
        return "current";
      return "available"; // Always available

    case 2: // Skill Assessment
      if (progress.skillTestDone) return "completed";
      if (currentStep === "skill-assessment") return "current";
      if (progress.resumeUploaded) return "available";
      return "locked";

    case 3: // Personality Test
      if (progress.personalityDone) return "completed";
      if (currentStep === "personality-test") return "current";
      if (progress.skillTestDone) return "available";
      return "locked";

    case 4: // Results
      if (currentStep === "results" && progress.allDone) return "current";
      if (progress.allDone) return "available";
      return "locked";

    default:
      return "locked";
  }
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout, progress, currentStep, setCurrentStep } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - Desktop */}
      <aside className="hidden w-64 flex-col border-r border-border bg-card lg:flex">
        <div className="flex items-center gap-2 border-b border-border p-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">
            Evalyze
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-4">
          <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Assessment Progress
          </p>
          {sidebarSteps.map((step, idx) => {
            const status = getStepStatus(step.id, progress, currentStep);
            // During active assessment (resume done but not all done), sidebar is display-only
            const assessmentInProgress = progress.resumeUploaded && !progress.allDone;
            const isClickable = !assessmentInProgress && (
              status === "completed" ||
              status === "current" ||
              status === "available"
            );

            // Determine if step is completed based on progress flags
            const isCompleted =
              (step.id === 1 && progress.resumeUploaded) ||
              (step.id === 2 && progress.skillTestDone) ||
              (step.id === 3 && progress.personalityDone) ||
              (step.id === 4 && progress.allDone);

            const isCurrent = status === "current";
            const isLocked = status === "locked";

            return (
              <button
                key={step.id}
                type="button"
                disabled={!isClickable}
                onClick={() => {
                  if (isClickable) setCurrentStep(step.navTarget);
                }}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
                  isCurrent &&
                  "bg-primary/10 text-primary animate-pulse-ring",
                  isCompleted && !isCurrent &&
                  "text-secondary",
                  isCompleted && !isCurrent && isClickable &&
                  "hover:bg-secondary/10",
                  !isCompleted && !isCurrent && !isLocked &&
                  "text-foreground",
                  !isCompleted && !isCurrent && !isLocked && isClickable &&
                  "hover:bg-muted",
                  isLocked &&
                  "cursor-not-allowed text-muted-foreground/50",
                  !isClickable && !isLocked &&
                  "cursor-default"
                )}
              >
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2",
                    isCurrent && "border-primary bg-primary/10",
                    isCompleted && !isCurrent &&
                    "border-secondary bg-secondary text-secondary-foreground",
                    !isCompleted && !isCurrent && !isLocked && "border-border",
                    isLocked && "border-border/50"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : isLocked ? (
                    <Lock className="h-3 w-3" />
                  ) : (
                    <span className="text-xs">{step.id}</span>
                  )}
                </div>
                {step.name}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          {/* Analysis History - visually distinct */}
          <button
            type="button"
            onClick={() => setCurrentStep("analysis-history")}
            className="mb-3 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all shadow-sm bg-primary text-primary-foreground"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-primary-foreground/30 bg-white/10">
              <History className="h-3.5 w-3.5" />
            </div>
            Analysis History
          </button>

          <div className="mb-3 flex items-center gap-3 px-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {user?.name || "User"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email || ""}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">Evalyze</span>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-foreground"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </header>

        {/* Mobile sidebar overlay */}
        {mobileMenuOpen && (
          <div className="absolute inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-foreground/20"
              onClick={() => setMobileMenuOpen(false)}
              onKeyDown={() => { }}
              role="button"
              tabIndex={-1}
            />
            <div className="relative z-10 w-64 min-h-screen bg-card border-r border-border flex flex-col">
              <div className="flex items-center justify-between border-b border-border p-5">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                    <Sparkles className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="text-lg font-bold text-foreground">Evalyze</span>
                </div>
                <button type="button" onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
              <nav className="flex flex-1 flex-col gap-1 p-4">
                {sidebarSteps.map((step) => {
                  const status = getStepStatus(step.id, progress, currentStep);
                  // During active assessment (resume done but not all done), sidebar is display-only
                  const assessmentInProgress = progress.resumeUploaded && !progress.allDone;
                  const isClickable = !assessmentInProgress && (
                    status === "completed" ||
                    status === "current" ||
                    status === "available"
                  );

                  // Determine if step is completed based on progress flags
                  const isCompleted =
                    (step.id === 1 && progress.resumeUploaded) ||
                    (step.id === 2 && progress.skillTestDone) ||
                    (step.id === 3 && progress.personalityDone) ||
                    (step.id === 4 && progress.allDone);

                  const isCurrent = status === "current";
                  const isLocked = status === "locked";

                  return (
                    <button
                      key={step.id}
                      type="button"
                      disabled={!isClickable}
                      onClick={() => {
                        if (isClickable) {
                          setCurrentStep(step.navTarget);
                          setMobileMenuOpen(false);
                        }
                      }}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
                        isCurrent && "bg-primary/10 text-primary",
                        isCompleted && !isCurrent && "text-secondary",
                        !isCompleted && !isCurrent && !isLocked && "text-foreground",
                        isLocked &&
                        "cursor-not-allowed text-muted-foreground/50",
                        !isClickable && !isLocked &&
                        "cursor-default"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2",
                          isCurrent && "border-primary bg-primary/10",
                          isCompleted && !isCurrent &&
                          "border-secondary bg-secondary text-secondary-foreground",
                          !isCompleted && !isCurrent && !isLocked && "border-border",
                          isLocked && "border-border/50"
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : isLocked ? (
                          <Lock className="h-3 w-3" />
                        ) : (
                          <span className="text-xs">{step.id}</span>
                        )}
                      </div>
                      {step.name}
                    </button>
                  );
                })}
              </nav>
              <div className="border-t border-border p-4">
                {/* Analysis History - visually distinct */}
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep("analysis-history");
                    setMobileMenuOpen(false);
                  }}
                  className="mb-3 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all shadow-sm bg-primary text-primary-foreground"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-primary-foreground/30 bg-white/10">
                    <History className="h-3.5 w-3.5" />
                  </div>
                  Analysis History
                </button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-muted-foreground"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
