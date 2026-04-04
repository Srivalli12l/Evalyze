"use client";

import { useState, useEffect, useCallback } from "react";
import { useApp } from "@/lib/app-context";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  ArrowLeft,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

type Phase = "loading" | "quiz" | "confirm" | "results";

export function AptitudeTest() {
  const { setCurrentStep, submitAptitudeTest, aptitudeResults, session, selectedRole } = useApp();
  const [phase, setPhase] = useState<Phase>("loading");
  const [currentQ, setCurrentQ] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(10).fill(null));
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  // Fetch AI-generated questions on mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const userId = session?.user?.id;
        if (!userId) { setPhase("quiz"); return; }

        const role = selectedRole || 'Software Developer';
        const res = await fetch(
          `/api/assessment/questions?type=aptitude&role=${encodeURIComponent(role)}&userId=${userId}`
        );
        const data = await res.json();

        if (data.success && data.data?.questions?.length > 0) {
          setQuestions(data.data.questions);
          setAnswers(new Array(data.data.questions.length).fill(null));
        } else {
          console.warn('[AptitudeTest] Failed to load questions properly');
        }
      } catch (err) {
        console.warn('[AptitudeTest] Fetch failed:', err);
      } finally {
        setPhase("quiz");
      }
    };
    fetchQuestions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const totalQ = questions.length;
  const answeredCount = answers.filter((a) => a !== null).length;

  useEffect(() => {
    if (phase !== "quiz" || totalQ === 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0) {
          clearInterval(timer);
          setPhase("confirm");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, totalQ]);

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  const selectAnswer = useCallback(
    (optionIdx: number) => {
      setAnswers((prev) => {
        const next = [...prev];
        next[currentQ] = optionIdx;
        return next;
      });
    },
    [currentQ]
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const finalAnswers = answers.map(a => a ?? -1);
    await submitAptitudeTest(finalAnswers);
    setIsSubmitting(false);
    setPhase("results");
  };

  if (phase === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Generating specific aptitude questions for your role...</p>
        </div>
      </div>
    );
  }

  if (totalQ === 0) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center p-6">
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-muted-foreground">Failed to load aptitude questions. Please try again later.</p>
          </div>
        </div>
      );
  }

  if (phase === "confirm") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-accent" />
          <h2 className="mb-2 text-xl font-bold text-foreground">
            Submit Assessment?
          </h2>
          <p className="mb-6 text-muted-foreground">
            {answeredCount} of {totalQ} questions answered
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => setPhase("quiz")}
            >
              Review
            </Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "results") {
    const correct = answers.filter((a, i) => a === questions[i].correct).length;
    const accuracy = Math.round((correct / totalQ) * 100);
    const score = accuracy;

    return (
      <div className="mx-auto max-w-3xl p-6 md:p-10">
        <div className="mb-8 rounded-2xl border border-border bg-card p-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Aptitude Test Complete
          </div>
          <div className="mb-2 text-6xl font-bold text-foreground">
            {score}
          </div>
          <p className="text-muted-foreground">/100 Score</p>
          <p className="mt-2 text-lg font-medium text-foreground">
            {score >= 80 ? "Excellent work!" : score >= 60 ? "Good job!" : "Keep practicing!"}
          </p>
        </div>

        <div className="mb-8 grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{totalQ}</p>
            <p className="text-xs text-muted-foreground">Total Questions</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-secondary">{correct}</p>
            <p className="text-xs text-muted-foreground">Correct</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-primary">{accuracy}%</p>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </div>
        </div>

        <div className="mb-8 rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 font-semibold text-foreground">Question Review</h3>
          <Accordion type="multiple" className="w-full">
            {questions.map((q, i) => {
              const isCorrect = answers[i] === q.correct;
              return (
                <AccordionItem key={q.id} value={q.id}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-3">
                      {isCorrect ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-secondary" />
                      ) : (
                        <XCircle className="h-4 w-4 shrink-0 text-destructive" />
                      )}
                      <span className="text-sm border rounded px-2 py-0.5 whitespace-nowrap text-xs">{q.category}</span>
                      <span className="text-sm">
                        Q{i + 1}: {q.question.slice(0, 50)}...
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-2 pl-7 text-sm">
                      <p className="text-muted-foreground">{q.question}</p>
                      <div className="mt-2 flex flex-col gap-1">
                        {q.options.map((opt: string, oi: number) => (
                          <div
                            key={oi}
                            className={cn(
                              "rounded-md px-3 py-1.5",
                              oi === q.correct && "bg-secondary/10 font-medium text-secondary",
                              oi === answers[i] && oi !== q.correct && "bg-destructive/10 text-destructive line-through"
                            )}
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 rounded-md bg-muted p-3 text-muted-foreground">
                        {q.explanation}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

        <Button
          size="lg"
          className="w-full gap-2"
          onClick={() => setCurrentStep("skill-assessment")}
        >
          Continue to Skill Assessment
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="mx-auto max-w-3xl p-6 md:p-10">
      <div className="mb-6">
        <div className="mb-1 flex items-center gap-2 text-sm">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-medium text-primary">
            Aptitude Test for {selectedRole || "your role"}
          </span>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex-1">
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Question {currentQ + 1} of {totalQ}
            </span>
            <div
              className={cn(
                "flex items-center gap-1 font-mono text-sm",
                timeLeft < 120 ? "text-destructive" : "text-muted-foreground"
              )}
            >
              <Clock className="h-3.5 w-3.5" />
              {formatTime(timeLeft)}
            </div>
          </div>
          <Progress value={((currentQ + 1) / totalQ) * 100} className="h-1.5" />
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Question {currentQ + 1}
          </span>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {q.category}
          </span>
        </div>
        <p className="mb-6 text-lg font-medium leading-relaxed text-foreground">
          {q.question}
        </p>

        <div className="flex flex-col gap-3">
          {q.options.map((option: string, idx: number) => (
            <button
              key={idx}
              type="button"
              onClick={() => selectAnswer(idx)}
              className={cn(
                "rounded-lg border-2 px-4 py-3 text-left text-sm transition-all",
                answers[currentQ] === idx
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs",
                    answers[currentQ] === idx
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border"
                  )}
                >
                  {String.fromCharCode(65 + idx)}
                </div>
                {option}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          disabled={currentQ === 0}
          onClick={() => setCurrentQ((c) => c - 1)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="hidden items-center gap-1 md:flex">
          {questions.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentQ(i)}
              className={cn(
                "h-2 w-2 rounded-full transition-colors",
                i === currentQ
                  ? "bg-primary"
                  : answers[i] !== null
                  ? "bg-secondary"
                  : "bg-border"
              )}
            />
          ))}
        </div>

        {currentQ === totalQ - 1 ? (
          <Button onClick={() => setPhase("confirm")} className="gap-2">
            Submit
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={() => setCurrentQ((c) => c + 1)} className="gap-2">
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
