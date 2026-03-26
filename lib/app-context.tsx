"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase";
import type { Session } from "@supabase/supabase-js";

type Step =
  | "landing"
  | "login"
  | "signup"
  | "dashboard"
  | "resume-upload"
  | "skill-assessment"
  | "personality-test"
  | "results"
  | "analysis-history";

// Export as AppStep for compatibility
export type AppStep = Step;

type User = {
  name: string;
  email: string;
};

type Progress = {
  resumeUploaded: boolean;
  skillTestDone: boolean;
  personalityDone: boolean;
  allDone: boolean;
};

type ResumeAnalysis = {
  role_fit_score: number;
  skills_detected: string[];
  skill_strength: Record<string, string>;
  resume_quality: number;
  strengths: string[];
  gaps: string[];
  feedback?: string;
  overall_score?: number;
};

type SkillResults = {
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  score: number;
  skillBreakdown: Record<string, { correct: number; total: number }>;
  answers: number[];
};

type PersonalityResults = {
  score: number;
  answers: number[];
};

type AppContextType = {
  currentStep: Step;
  setCurrentStep: (step: Step) => void;
  user: User | null;
  session: Session | null;
  authLoading: boolean;
  authError: string | null;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  clearAuthError: () => void;
  progress: Progress;
  markResumeUploaded: () => void;
  markSkillTestDone: () => void;
  markPersonalityDone: () => void;
  selectedRole: string | null;
  setSelectedRole: (role: string) => void;
  resumeFile: File | null;
  setResumeFile: (file: File | null) => void;
  resumeAnalysis: ResumeAnalysis | null;
  setResumeAnalysis: (analysis: ResumeAnalysis) => void;
  skillResults: SkillResults | null;
  setSkillResults: (results: SkillResults) => void;
  personalityResults: PersonalityResults | null;
  setPersonalityResults: (results: PersonalityResults) => void;
  analyzeResume: (file: File, target_role: string) => Promise<void>;
  submitSkillTest: (answers: number[]) => Promise<void>;
  submitPersonalityTest: (answers: number[]) => Promise<void>;
  resetAssessment: () => void;
  currentAnalysisId: string | null;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState<Step>("landing");
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const [progress, setProgress] = useState<Progress>({
    resumeUploaded: false,
    skillTestDone: false,
    personalityDone: false,
    allDone: false,
  });

  // Assessment state
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);

  /** Reset all client-side assessment state so the user can analyze a new resume */
  const resetAssessment = useCallback(() => {
    setSelectedRole(null);
    setResumeFile(null);
    setResumeAnalysis(null);
    setSkillResults(null);
    setPersonalityResults(null);
    setCurrentAnalysisId(null);
    setProgress({
      resumeUploaded: false,
      skillTestDone: false,
      personalityDone: false,
      allDone: false,
    });
    setCurrentStep("resume-upload");
  }, []);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(
    null
  );
  const [skillResults, setSkillResults] = useState<SkillResults | null>(null);
  const [personalityResults, setPersonalityResults] =
    useState<PersonalityResults | null>(null);

  // ── Helpers ──────────────────────────────────────────────────────────

  /** Upsert a row in the profiles table for the authenticated user */
  const upsertProfile = useCallback(async (name: string, email: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const response = await fetch('/api/profile/upsert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ name, email })
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('[upsertProfile] API error (HTTP', response.status, '):', text.substring(0, 200));
        return;
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        console.error('[upsertProfile] Invalid response (not JSON):', text.substring(0, 200));
        return;
      }

      const data = await response.json();
      if (!data.success) {
        console.error('[upsertProfile] API error:', data.error);
      }
    } catch (err: any) {
      console.error('[upsertProfile] Fetch error:', err?.message);
    }
  }, []);

  /**
   * Fetch the LATEST analysis results from the backend and hydrate all
   * client-side state so the dashboard shows the correct, most-recent data.
   */
  const fetchResults = useCallback(async (userId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const response = await fetch(`/api/results`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await response.json();

      if (data.success && data.data) {
        const { resume, assessments } = data.data;

        // Hydrate Resume State from REAL data
        if (resume) {
          const skill_strength: Record<string, string> = {};
          (resume.skills_detected || []).forEach((skill: string) => {
            skill_strength[skill] = "strong";
          });

          setResumeAnalysis({
            role_fit_score: resume.role_fit_score || 0,
            skills_detected: resume.skills_detected || [],
            skill_strength,
            resume_quality: resume.resume_quality || 0,
            strengths: resume.strengths || [],
            gaps: resume.gaps || [],
            feedback: resume.feedback || '',
            overall_score: resume.role_fit_score || 0,
          });
          setResumeFile({ name: resume.file_name, size: 1024 * 500 } as File);
          setProgress(prev => ({ ...prev, resumeUploaded: true }));

          // Restore the analysis ID and target role from the latest session
          if (resume.id) {
            setCurrentAnalysisId(resume.id);
          }
          if (resume.target_role) {
            setSelectedRole(resume.target_role);
          }
        }

        // Hydrate Skill State
        if (assessments.skill) {
          setSkillResults(assessments.skill.details || {
            score: assessments.skill.score,
            totalQuestions: 0, correctAnswers: 0, accuracy: 0, skillBreakdown: {}, answers: []
          });
          setProgress(prev => ({ ...prev, skillTestDone: true }));
        }

        // Hydrate Personality State
        if (assessments.personality) {
          setPersonalityResults({
            score: assessments.personality.score,
            answers: []
          });
          setProgress(prev => ({ ...prev, personalityDone: true }));
        }

        // Check all done
        setProgress(prev => {
          const allDone = prev.resumeUploaded && prev.skillTestDone && prev.personalityDone;
          return { ...prev, allDone };
        });
      }
    } catch (error) {
      console.error("Failed to fetch user results:", error);
    }
  }, []);

  // ── Initialize session on mount ─────────────────────────────────────

  useEffect(() => {
    // Helper: check role and redirect admin if needed
    async function handleSessionUser(session: Session) {
      const metadata = session.user.user_metadata;
      const userName = metadata?.name || session.user.email!.split("@")[0];
      setUser({
        email: session.user.email!,
        name: userName,
      });

      // === Profile Creation / Upsert ===
      // This guarantees the profile is created/updated on ANY valid session
      // (login, auto-login after signup, page refresh, etc.)
      try {
        await upsertProfile(userName, session.user.email!);
      } catch (err) {
        console.error("Profile upsert failed during session init:", err);
      }

      // Check if user is admin — if so, redirect to /admin
      const { data: profile } = await supabase
        .from('profile')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role === 'admin') {
        // Admin should never see user dashboard — redirect to /admin
        if (!window.location.pathname.startsWith('/admin')) {
          window.location.href = '/admin';
        }
        return;
      }

      // Regular user → always show fresh dashboard (no old data loaded)
      setCurrentStep("dashboard");
    }

    // Check for existing session
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user) {
        await handleSessionUser(session);
      }
      setAuthLoading(false);
    };
    init();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        await handleSessionUser(session);
      } else {
        setUser(null);
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [upsertProfile]);

  // ── Auth methods ────────────────────────────────────────────────────

  const signup = useCallback(async (
    email: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; error?: string }> => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
        || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: siteUrl,
        },
      });

      if (error) {
        console.error("Signup error:", error);
        if (error.status === 429) {
          const msg =
            "Too many attempts. Please wait a moment before trying again.";
          setAuthError(msg);
          setAuthLoading(false);
          return { success: false, error: msg };
        }
        setAuthError(error.message);
        setAuthLoading(false);
        return { success: false, error: error.message };
      }

      // NOTE: Do NOT call upsertProfile() here.
      // When email confirmation is required, there is no active session after signUp().
      // The profile will be created on first login instead (see handleSessionUser).

      // If email confirmation is required, Supabase returns no session.
      // Explicitly sign out to prevent any partial auto-login via onAuthStateChange.
      if (!data.session) {
        await supabase.auth.signOut();
        console.log("Signup successful — email confirmation required");
        setAuthLoading(false);
        return { success: true, message: "Account created. Please check your email to confirm." };
      }

      console.log("Signup successful", data);
      setAuthLoading(false);
      return { success: true };
    } catch (error: any) {
      console.error("Signup exception:", error);
      const errorMessage = error?.message || "An unexpected error occurred";
      setAuthError(errorMessage);
      setAuthLoading(false);
      return { success: false, error: errorMessage };
    }
  }, []);

  const login = useCallback(async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setAuthLoading(true);
    setAuthError(null);
    console.log("Attempting login for:", email);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        setAuthError(error.message);
        setAuthLoading(false);
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log("Login successful, user:", data.user);
        const metadata = data.user.user_metadata;
        const userName = metadata?.name || data.user.email!.split("@")[0];
        setUser({
          email: data.user.email!,
          name: userName,
        });

        // Fetch the user's role from the database to decide where to redirect
        const { data: profile } = await supabase
          .from('profile')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profile?.role === 'admin') {
          // Admin → redirect to admin dashboard (real Next.js route)
          setAuthLoading(false);
          window.location.href = '/admin';
          return { success: true };
        }

        // Regular user → stay in-app dashboard
        setCurrentStep("dashboard");
      }

      setAuthLoading(false);
      return { success: true };
    } catch (error: any) {
      console.error("Login exception:", error);
      const errorMessage = error?.message || "An unexpected error occurred";
      setAuthError(errorMessage);
      setAuthLoading(false);
      return { success: false, error: errorMessage };
    }
  }, [upsertProfile]);

  const logout = useCallback(async () => {
    setAuthLoading(true);

    await supabase.auth.signOut();

    // Clear all state
    setUser(null);
    setSession(null);
    setCurrentStep("landing");
    setProgress({
      resumeUploaded: false,
      skillTestDone: false,
      personalityDone: false,
      allDone: false,
    });

    // Reset assessment data
    setSelectedRole(null);
    setCurrentAnalysisId(null);
    setResumeFile(null);
    setResumeAnalysis(null);
    setSkillResults(null);
    setPersonalityResults(null);
    setAuthError(null);
    setAuthLoading(false);
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  // ── API integration ─────────────────────────────────────────────────

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const analyzeResume = async (...args: any[]) => {
    const file: File = args[0];
    const target_role: string = args[1];

    if (!session?.user?.id) {
      throw new Error('You must be logged in to analyze a resume.');
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("target_role", target_role);

      // Use AbortController for mobile timeout (55s to stay within Vercel limits)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 55000);

      let response: Response;
      try {
        response = await fetch('/api/resume/analyze', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            Accept: 'application/json'
          },
          body: formData,
          credentials: 'same-origin',
          signal: controller.signal,
        });
      } catch (fetchErr: any) {
        clearTimeout(timeoutId);
        if (fetchErr.name === 'AbortError') {
          throw new Error('Analysis timed out. Please try again with a smaller resume or on a faster connection.');
        }
        throw new Error(`Network error: ${fetchErr.message}. Check your internet connection and try again.`);
      }
      clearTimeout(timeoutId);

      // Guard: check HTTP status first
      if (!response.ok) {
        const text = await response.text();
        console.error('[analyzeResume] API error (HTTP', response.status, '):', text.substring(0, 200));
        throw new Error(`Analysis failed (HTTP ${response.status}). Please try again.`);
      }

      // Guard: ensure response is JSON before parsing
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        console.error('[analyzeResume] Expected JSON but got:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response. Please try again.');
      }

      const data = await response.json();
      if (data.success) {
        const analysis = data.data;
        const skills_detected = data.skills || (analysis.extracted_skills ? analysis.extracted_skills.split(', ') : []);

        const skill_strength: Record<string, string> = {};
        skills_detected.forEach((skill: string) => {
          skill_strength[skill] = "strong";
        });

        setResumeAnalysis({
          role_fit_score: data.score || analysis.analysis_score,
          skills_detected,
          skill_strength,
          resume_quality: data.score || analysis.analysis_score || 0,
          strengths: data.strengths || [],
          gaps: data.gaps || [],
          feedback: data.feedback || '',
          overall_score: data.score || analysis.analysis_score,
        });
        setProgress((prev) => ({ ...prev, resumeUploaded: true }));

        // Store the analysis session ID for linking assessments
        if (analysis?.id) {
          setCurrentAnalysisId(analysis.id);
        }
      } else {
        console.error("Analysis failed:", data.error);
        throw new Error(data.error);
      }
    } catch (err) {
      console.error("API Error:", err);
      throw err;
    }
  };

  const markResumeUploaded = () => {
    setProgress((prev) => ({ ...prev, resumeUploaded: true }));
  };

  const submitSkillTest = useCallback(async (answers: number[]) => {
    if (!session?.user?.id) {
      console.error('Cannot submit skill test: not authenticated');
      return;
    }

    try {
      const response = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          type: 'skill',
          answers,
          analysisId: currentAnalysisId,
        })
      });

      const data = await response.json();
      if (data.success) {
        setSkillResults(data.results);
        setProgress((prev) => ({ ...prev, skillTestDone: true }));
      } else {
        console.error('Skill test submit failed:', data.error);
      }
    } catch (err) {
      console.error("API Error:", err);
    }
  }, [session?.user?.id, currentAnalysisId]);

  const markSkillTestDone = useCallback(() => {
    setProgress((prev) => ({ ...prev, skillTestDone: true }));
  }, []);

  const submitPersonalityTest = useCallback(async (answers: number[]) => {
    if (!session?.user?.id) {
      console.error('Cannot submit personality test: not authenticated');
      return;
    }

    try {
      const response = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          type: 'personality',
          answers,
          analysisId: currentAnalysisId,
        })
      });

      const data = await response.json();
      if (data.success) {
        const newPersonalityResults = data.results;
        setPersonalityResults(newPersonalityResults);

        setProgress((prev) => {
          const newProgress = { ...prev, personalityDone: true };
          if (newProgress.resumeUploaded && newProgress.skillTestDone) {
            newProgress.allDone = true;
          }
          return newProgress;
        });

        // Save completed analysis to history
        const overallScore = resumeAnalysis?.overall_score || resumeAnalysis?.role_fit_score || 0;
        const readinessLevel =
          overallScore >= 80 ? "Excellent" :
            overallScore >= 60 ? "Good" :
              overallScore >= 40 ? "Moderate" : "Needs Improvement";

        try {
          await fetch('/api/analysis-history/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              resume_name: resumeFile?.name || 'resume.pdf',
              target_role: selectedRole || 'Unknown',
              overall_score: overallScore,
              readiness_level: readinessLevel,
              result_json: {
                resumeAnalysis,
                skillResults,
                personalityResults: newPersonalityResults,
              },
            }),
          });
        } catch (saveErr) {
          console.error('[submitPersonalityTest] Failed to save history:', saveErr);
        }
      } else {
        console.error('Personality test submit failed:', data.error);
      }
    } catch (err) {
      console.error("API Error:", err);
    }
  }, [session?.user?.id, currentAnalysisId, resumeAnalysis, skillResults, resumeFile, selectedRole]);

  const markPersonalityDone = useCallback(() => {
    setProgress((prev) => {
      const newProgress = { ...prev, personalityDone: true };
      if (
        newProgress.resumeUploaded &&
        newProgress.skillTestDone &&
        newProgress.personalityDone
      ) {
        newProgress.allDone = true;
      }
      return newProgress;
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        user,
        session,
        authLoading,
        authError,
        signup,
        login,
        logout,
        clearAuthError,
        progress,
        markResumeUploaded,
        markSkillTestDone,
        markPersonalityDone,
        selectedRole,
        setSelectedRole,
        resumeFile,
        setResumeFile,
        resumeAnalysis,
        setResumeAnalysis,
        skillResults,
        setSkillResults,
        personalityResults,
        setPersonalityResults,
        analyzeResume,
        submitSkillTest,
        submitPersonalityTest,
        resetAssessment,
        currentAnalysisId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used inside AppProvider");
  }
  return context;
}
