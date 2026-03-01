"use client";

import React from "react"

import { useState, useMemo } from "react";
import { useApp, type AppStep } from "@/lib/app-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sparkles,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Brain,
  BarChart3,
} from "lucide-react";

function PasswordStrengthBar({ password }: { password: string }) {
  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }, [password]);

  const label =
    strength <= 1 ? "Weak" : strength <= 3 ? "Medium" : "Strong";
  const color =
    strength <= 1
      ? "bg-destructive"
      : strength <= 3
        ? "bg-accent"
        : "bg-secondary";

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? color : "bg-border"
              }`}
          />
        ))}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Password strength: {label}
      </p>
    </div>
  );
}

export function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const { setCurrentStep, signup, login, authError, authLoading, clearAuthError } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);

  // Clear error when switching modes or changing inputs
  React.useEffect(() => {
    clearAuthError();
    setShowVerificationMessage(false);
  }, [mode, clearAuthError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    setShowVerificationMessage(false);

    if (mode === "signup") {
      const result = await signup(email, password, name);
      if (result.success) {
        setShowVerificationMessage(true);
        // Clear form
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setAgreeTerms(false);
      }
    } else {
      const result = await login(email, password);
      // Login function handles navigation to dashboard on success
    }
  };

  const isLoginValid = email && password;
  const isSignupValid =
    name &&
    email &&
    password &&
    confirmPassword &&
    password === confirmPassword &&
    agreeTerms;
  const isValid = mode === "login" ? isLoginValid : isSignupValid;

  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="flex flex-1 flex-col justify-center px-8 py-12 lg:max-w-[480px] lg:px-16">
        <button
          type="button"
          onClick={() => setCurrentStep("landing")}
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </button>

        <div className="mb-8">
          <div className="mb-6 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">
              PlaceReady AI
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {mode === "login"
              ? "Sign in to continue your assessment"
              : "Start your placement readiness journey"}
          </p>

          {/* Error Message */}
          {authError && (
            <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {authError}
            </div>
          )}

          {/* Verification Success Message */}
          {showVerificationMessage && (
            <div className="mt-4 rounded-lg border border-secondary/50 bg-secondary/10 p-3 text-sm text-secondary">
              <CheckCircle2 className="mb-1 inline h-4 w-4" /> Account created successfully! Please check your email to verify your account before logging in.
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {mode === "signup" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Alex Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="alex@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {mode === "signup" && <PasswordStrengthBar password={password} />}
          </div>

          {mode === "signup" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-destructive">
                  Passwords do not match
                </p>
              )}
            </div>
          )}

          {mode === "login" ? (
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(v) => setRememberMe(!!v)}
              />
              <Label htmlFor="remember" className="text-sm text-muted-foreground">
                Remember me
              </Label>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Checkbox
                id="terms"
                checked={agreeTerms}
                onCheckedChange={(v) => setAgreeTerms(!!v)}
              />
              <Label htmlFor="terms" className="text-sm text-muted-foreground">
                I agree to the Terms of Service and Privacy Policy
              </Label>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={!isValid || authLoading}
            className="w-full"
          >
            {authLoading
              ? mode === "login"
                ? "Signing in..."
                : "Creating account..."
              : mode === "login"
                ? "Sign In"
                : "Create Account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "login" ? (
            <>
              {"Don't have an account? "}
              <button
                type="button"
                onClick={() => setCurrentStep("signup" as AppStep)}
                className="font-medium text-primary hover:underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setCurrentStep("login" as AppStep)}
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>

      {/* Right side - Gradient / Info */}
      <div className="hidden flex-1 items-center justify-center bg-primary p-12 lg:flex">
        <div className="max-w-md">
          <h2 className="mb-6 text-3xl font-bold text-primary-foreground">
            Your placement journey starts here
          </h2>
          <div className="flex flex-col gap-5">
            {[
              {
                icon: FileText,
                title: "Resume Analysis",
                desc: "AI-powered resume evaluation for your target role",
              },
              {
                icon: Brain,
                title: "Smart Assessments",
                desc: "Tests generated from your unique skills and experience",
              },
              {
                icon: BarChart3,
                title: "Actionable Feedback",
                desc: "Detailed readiness score with a clear improvement plan",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex gap-4 rounded-lg bg-primary-foreground/10 p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15">
                  <item.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary-foreground">
                    {item.title}
                  </h3>
                  <p className="text-sm text-primary-foreground/70">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex items-center gap-2 text-sm text-primary-foreground/60">
            <CheckCircle2 className="h-4 w-4" />
            Trusted by 10,000+ students across 50+ universities
          </div>
        </div>
      </div>
    </div>
  );
}
