"use client";

import { useApp } from "@/lib/app-context";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Brain,
  BarChart3,
  Upload,
  Sparkles,
  ClipboardCheck,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "AI Resume Analysis",
    description:
      "Check if your resume fits your target role with detailed skill matching and gap analysis.",
  },
  {
    icon: Brain,
    title: "Smart Skill Tests",
    description:
      "Questions generated from YOUR resume and target role, not generic assessments.",
  },
  {
    icon: BarChart3,
    title: "Readiness Score",
    description:
      "Know exactly where you stand with a comprehensive score and personalized improvement roadmap.",
  },
];

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload Resume & Select Role",
    description: "Choose your target role and upload your resume for analysis.",
  },
  {
    icon: Sparkles,
    step: "02",
    title: "AI Analyzes Fit",
    description:
      "Our AI evaluates how well your resume matches your target role.",
  },
  {
    icon: ClipboardCheck,
    step: "03",
    title: "Take AI-Generated Tests",
    description:
      "Complete skill and personality assessments tailored to your profile.",
  },
  {
    icon: TrendingUp,
    step: "04",
    title: "Get Personalized Feedback",
    description:
      "Receive your readiness score with actionable improvement steps.",
  },
];

export function LandingPage() {
  const { setCurrentStep } = useApp();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">
              Evalyze
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentStep("login")}
              className="text-muted-foreground hover:text-foreground"
            >
              Sign In
            </Button>
            <Button size="sm" onClick={() => setCurrentStep("signup")}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-24 md:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
        </div>
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Assessment Platform
          </div>
          <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground md:text-6xl">
            Ace Your Campus Placements with{" "}
            <span className="text-primary">AI-Powered Assessment</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
            Resume analysis, role-specific tests, and personalized feedback to
            help you land your dream job. Know exactly where you stand before
            your interviews.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="gap-2 px-8 text-base"
              onClick={() => setCurrentStep("signup")}
            >
              Start Free Assessment
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base bg-transparent"
              onClick={() => setCurrentStep("login")}
            >
              Already have an account?
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-card px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold text-foreground">
              Everything You Need to Prepare
            </h2>
            <p className="text-muted-foreground">
              A complete toolkit to evaluate and improve your placement
              readiness.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-border bg-background p-8 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mb-5 inline-flex rounded-lg bg-primary/10 p-3">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold text-foreground">
              How It Works
            </h2>
            <p className="text-muted-foreground">
              Four simple steps to your placement readiness score.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div key={step.step} className="relative">
                <div className="flex h-full flex-col rounded-xl border border-border bg-card p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="text-sm font-bold text-primary">
                      {step.step}
                    </span>
                    <div className="h-px flex-1 bg-border" />
                    <step.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
                {i < steps.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-border lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission / Fill */}
      <section className="border-t border-border bg-primary px-6 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-primary-foreground md:text-3xl">
            Bridging the Gap Between Preparation and Placement
          </h2>
          <p className="mt-4 text-primary-foreground/80">
            Our platform is dedicated to providing students with the tools they need to succeed in their career journeys through personalized, AI-driven insights.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-12 text-center">
          <h2 className="mb-3 text-3xl font-bold text-foreground">
            Ready to Get Started?
          </h2>
          <p className="mb-8 text-muted-foreground">
            Join the journey towards your dream placement with AI-powered assessments.
          </p>
          <Button
            size="lg"
            className="gap-2 px-8"
            onClick={() => setCurrentStep("signup")}
          >
            Start Your Assessment
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
              <Sparkles className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">
              Evalyze
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Evalyze. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
