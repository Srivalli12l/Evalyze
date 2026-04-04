"use client";

import { useState, useEffect, useCallback } from "react";
import { useApp } from "@/lib/app-context";
import { mockPersonalityScenarios, personalityTraitScores } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  ArrowLeft,
  Heart,
  Sparkles,
  MessageCircle,
  Users,
  Lightbulb,
  RefreshCw,
  Shield,
  Smile,
  Loader2,
} from "lucide-react";

const traitIcons: Record<string, typeof Heart> = {
  communication: MessageCircle,
  collaboration: Users,
  problem_solving: Lightbulb,
  adaptability: RefreshCw,
  leadership: Shield,
  empathy: Smile,
};

type Phase = "loading" | "quiz" | "results";

export function PersonalityTest() {
  const { setCurrentStep, submitPersonalityTest, personalityResults, session, selectedRole } = useApp();
  const [phase, setPhase] = useState<Phase>("loading");
  const [currentS, setCurrentS] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [scenarios, setScenarios] = useState(mockPersonalityScenarios.scenarios.slice(0, 10));
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(10).fill(null)
  );

  const fetchScenarios = async (currentOffset: number = 0, countToFetch: number = 10): Promise<boolean> => {
    try {
      const userId = session?.user?.id;
      if (!userId) { 
        if (currentOffset === 0) setPhase("quiz"); 
        return false; 
      }

      if (currentOffset > 0) {
        setIsLoadingMore(true);
      } else {
        setPhase("loading");
      }

      const role = selectedRole || 'Software Developer';
      const res = await fetch(
        `/api/assessment/questions?type=personality&role=${encodeURIComponent(role)}&userId=${userId}&count=${countToFetch}&offset=${currentOffset}`
      );
      const data = await res.json();

      if (data.success && data.data?.scenarios?.length > 0) {
        if (currentOffset === 0) {
          setScenarios(data.data.scenarios);
          setAnswers(new Array(data.data.scenarios.length).fill(null));
        } else {
          setScenarios(prev => [...prev, ...data.data.scenarios]);
          setAnswers(prev => [...prev, ...new Array(data.data.scenarios.length).fill(null)]);
        }
        console.log('[PersonalityTest] Using AI-generated scenarios');
        return true;
      } else {
        console.log('[PersonalityTest] Falling back to mock scenarios');
        return false;
      }
    } catch (err) {
      console.warn('[PersonalityTest] Fetch failed, using mock scenarios:', err);
      return false;
    } finally {
      if (currentOffset === 0) {
        setPhase("quiz");
      } else {
        setIsLoadingMore(false);
      }
    }
  };

  // Fetch initial AI-generated scenarios on mount
  useEffect(() => {
    fetchScenarios(0, 10);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const totalS = scenarios.length;

  const selectAnswer = useCallback(
    (idx: number) => {
      setAnswers((prev) => {
        const next = [...prev];
        next[currentS] = idx;
        return next;
      });
    },
    [currentS]
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const finalAnswers = answers.map((a) => a ?? 0);
    await submitPersonalityTest(finalAnswers);
    setIsSubmitting(false);
    setPhase("results");
  };

  // Loading AI scenarios
  if (phase === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Generating personality scenarios...</p>
        </div>
      </div>
    );
  }

  // Results
  if (phase === "results") {
    return (
      <div className="mx-auto max-w-3xl p-6 md:p-10">
        {/* Score Hero */}
        <div className="mb-8 rounded-2xl border border-border bg-card p-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Heart className="h-3.5 w-3.5" />
            Personality Assessment Complete
          </div>
          <div className="mb-2 text-6xl font-bold text-foreground">{personalityResults?.score ?? '--'}</div>
          <p className="text-muted-foreground">/25 Marks</p>
          <p className="mt-2 text-lg font-medium text-foreground">
            {(personalityResults?.score ?? 0) >= 20 ? "Excellent Soft Skills" : (personalityResults?.score ?? 0) >= 15 ? "Good Soft Skills" : "Keep Developing Your Soft Skills"}
          </p>
        </div>

        {/* Trait Scores */}
        <div className="mb-8 rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 font-semibold text-foreground">
            Trait Scores
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.entries(personalityTraitScores).map(([trait, score]) => {
              const Icon = traitIcons[trait] || Heart;
              const label = trait.replace(/_/g, " ");
              return (
                <div
                  key={trait}
                  className="flex items-center gap-3 rounded-lg border border-border p-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium capitalize text-foreground">
                        {label}
                      </span>
                      <span className="text-sm font-medium text-primary">
                        {score}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted">
                      <div
                        className="h-1.5 rounded-full bg-primary transition-all duration-700"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Insights */}
        <div className="mb-8 rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 font-semibold text-foreground">
            Key Insights
          </h3>
          <div className="flex flex-col gap-3">
            {[
              "Strong communication skills - you articulate concerns effectively",
              "Excellent team collaboration and mentoring abilities",
              "Data-driven decision-making approach",
              "Empathetic leadership style well-suited for team environments",
            ].map((insight, i) => (
              <div key={i} className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-sm text-foreground">{insight}</p>
              </div>
            ))}
          </div>
        </div>

        <Button
          size="lg"
          className="w-full gap-2"
          onClick={() => setCurrentStep("results")}
        >
          View Final Results
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Quiz Phase
  const scenario = scenarios[currentS];
  const allAnswered = answers.every((a) => a !== null);

  if (!scenario) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <p className="text-muted-foreground">Unable to load scenario. You can try refreshing or submit your current progress.</p>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
            Submit Assessment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-6 md:p-10">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-1 flex items-center gap-2 text-sm">
          <Heart className="h-4 w-4 text-primary" />
          <span className="font-medium text-primary">
            Personality Assessment for {(() => {
              if (!selectedRole) return "your target role";
              const lowRole = selectedRole.toLowerCase();
              if (lowRole.includes('mobile')) return 'mobile development';
              if (lowRole.includes('fullstack')) return 'fullstack development';
              if (lowRole.includes('front end')) return 'front end development';
              if (lowRole.includes('backend')) return 'backend development';
              return selectedRole;
            })()}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Scenarios tailored to your target role
        </p>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Scenario {currentS + 1} of {totalS}
          </span>
          <span className="text-xs text-muted-foreground">
            Choose what describes you best
          </span>
        </div>
        <Progress value={((currentS + 1) / totalS) * 100} className="h-1.5" />
      </div>

      {/* Scenario Card */}
      <div className="mb-6 rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Scenario {currentS + 1}
          </span>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {scenario.evaluates}
          </span>
        </div>
        <p className="mb-6 text-lg leading-relaxed text-foreground">
          {scenario.scenario}
        </p>

        <div className="flex flex-col gap-3">
          {scenario.options.map((option, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => selectAnswer(idx)}
              className={cn(
                "rounded-lg border-2 px-4 py-3 text-left text-sm transition-all",
                answers[currentS] === idx
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-xs",
                    answers[currentS] === idx
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border"
                  )}
                >
                  {answers[currentS] === idx && (
                    <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                  )}
                </div>
                <span className="leading-relaxed">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          disabled={currentS === 0}
          onClick={() => setCurrentS((c) => c - 1)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>

        {/* Scenario indicators */}
        <div className="hidden items-center gap-1.5 md:flex">
          {scenarios.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentS(i)}
              className={cn(
                "h-2 w-2 rounded-full transition-colors",
                i === currentS
                  ? "bg-primary"
                  : answers[i] !== null
                    ? "bg-secondary"
                    : "bg-border"
              )}
            />
          ))}
        </div>

        {currentS === totalS - 1 ? (
          <div className="flex gap-2">
            {totalS < 25 && (
              <Button
                variant="outline"
                className="gap-2 border-2 border-primary/20 bg-primary/5 hover:bg-primary/15 text-primary hover:text-primary transition-all duration-300 font-bold"
                disabled={isLoadingMore}
                onClick={async () => {
                  const countToFetch = Math.min(10, 25 - totalS);
                  const success = await fetchScenarios(totalS, countToFetch);
                  if (success) {
                    setCurrentS((c) => c + 1);
                  }
                }}
              >
                {isLoadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : "+ Load More Scenarios"}
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              disabled={!allAnswered || isSubmitting || isLoadingMore}
              className="gap-2"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
              {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setCurrentS((c) => c + 1)}
            className="gap-2"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
