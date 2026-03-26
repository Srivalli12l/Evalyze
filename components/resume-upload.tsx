"use client";



import { useState, useCallback, useRef } from "react";
import { useApp } from "@/lib/app-context";
// import { mockResumeAnalysis } from "@/lib/mock-data"; 
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Upload,
  FileText,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
  Code2,
  Server,
  Layers,
  Database,
  Cloud,
  Smartphone,
} from "lucide-react";

const roles = [
  { value: "frontend", label: "Frontend Developer", icon: Code2 },
  { value: "backend", label: "Backend Developer", icon: Server },
  { value: "fullstack", label: "Full Stack Developer", icon: Layers },
  { value: "data-scientist", label: "Data Scientist", icon: Database },
  { value: "devops", label: "DevOps Engineer", icon: Cloud },
  { value: "mobile", label: "Mobile Developer", icon: Smartphone },
];

type AnalysisState = "idle" | "analyzing" | "done";

export function ResumeUpload() {
  const {
    selectedRole,
    setSelectedRole,
    resumeFile,
    setResumeFile,
    resumeAnalysis,
    setResumeAnalysis,
    analyzeResume,
    markResumeUploaded,
    setCurrentStep,
  } = useApp();

  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisState, setAnalysisState] = useState<AnalysisState>("idle");
  const [analysisPhase, setAnalysisPhase] = useState("");
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (file.type !== "application/pdf") {
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        return;
      }
      setResumeFile(file);
      setUploadProgress(100);
    },
    [setResumeFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleAnalyze = async () => {
    if (!resumeFile || !selectedRole) return;

    setAnalysisState("analyzing");
    setAnalysisError(null);

    const phases = [
      "Preparing analysis...",
      "Connecting to backend...",
      "Extracting skills...",
      "Finalizing scores...",
    ];

    // Simulated UI phases for UX, but real API call happens
    const phaseInterval = 800;

    try {
      // Analyze resume (server-side parsing)
      setAnalysisPhase("Uploading and analyzing...");

      const analysisPromise = analyzeResume(resumeFile, selectedRole);

      for (let i = 0; i < phases.length; i++) {
        setAnalysisPhase(phases[i]);
        await new Promise((r) => setTimeout(r, phaseInterval));
      }

      await analysisPromise;
      setAnalysisState("done");

      // Ensure the mobile browser scrolls down to the newly rendered results
      setTimeout(() => {
        document.getElementById("analysis-result")?.scrollIntoView({ behavior: "smooth" });
      }, 100);

      // User will manually click "Continue to Skill Assessment" button

    } catch (error: any) {
      console.error("Analysis Failed:", error);
      setAnalysisState("idle");
      setAnalysisError(error?.message || "Resume analysis failed. Please try again.");
    }
  };

  const analysis = analysisState === "done" ? resumeAnalysis : null;

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Resume Upload & Role Selection
        </h1>
        <p className="mt-1 text-muted-foreground">
          Select your target role and upload your resume for AI analysis.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column - Upload */}
        <div className="flex flex-col gap-6">
          {/* Step 1: Select Role */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                1
              </span>
              <h2 className="font-semibold text-foreground">
                Select Target Role
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {roles.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setSelectedRole(role.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-center transition-all",
                    selectedRole === role.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  )}
                >
                  <role.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{role.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Upload Resume */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                2
              </span>
              <h2 className="font-semibold text-foreground">
                Upload Your Resume
              </h2>
            </div>

            {!resumeFile ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed p-8 text-center transition-colors",
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                )}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
                }}
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">
                    Drag & drop your resume here
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    or click to browse - PDF only, max 5MB
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
              </div>
            ) : (
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {resumeFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(resumeFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setResumeFile(null);
                      setUploadProgress(0);
                      setAnalysisState("idle");
                    }}
                    className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {uploadProgress < 100 && (
                  <Progress value={uploadProgress} className="mt-3 h-1.5" />
                )}
                {uploadProgress >= 100 && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-secondary">
                    <CheckCircle2 className="h-3 w-3" />
                    Upload complete
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Step 3: Analyze */}
          <Button
            size="lg"
            className="gap-2"
            disabled={
              !selectedRole ||
              !resumeFile ||
              uploadProgress < 100 ||
              analysisState === "analyzing"
            }
            onClick={handleAnalyze}
          >
            {analysisState === "analyzing" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : analysisState === "done" ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Analysis Complete
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Analyze Resume
              </>
            )}
          </Button>
        </div>

        {/* Right Column - Results */}
        <div className="flex flex-col gap-6">
          {analysisState === "idle" && (
            <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border p-12 text-center">
              {analysisError && (
                <div className="mb-4 w-full rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  {analysisError}
                </div>
              )}
              <FileText className="mb-4 h-12 w-12 text-muted-foreground/30" />
              <p className="font-medium text-muted-foreground">
                Select role and upload resume to begin
              </p>
              <p className="mt-1 text-sm text-muted-foreground/70">
                AI analysis results will appear here
              </p>
            </div>
          )}

          {analysisState === "analyzing" && (
            <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-primary/20 bg-primary/5 p-12 text-center">
              <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
              <p className="font-medium text-foreground">
                AI is analyzing your resume...
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {analysisPhase}
              </p>
            </div>
          )}

          {analysisState === "done" && analysis && (
            <div id="analysis-result" className="flex flex-col gap-4">
              {/* Role Fit Score */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                  Role Fit Score
                </h3>
                <div className="mb-2 flex items-end gap-2">
                  <span className="text-4xl font-bold text-foreground">
                    {analysis.role_fit_score}
                  </span>
                  <span className="mb-1 text-muted-foreground">/100</span>
                </div>
                <Progress
                  value={analysis.role_fit_score}
                  className="mb-2 h-2"
                />
                <p className="text-sm text-secondary">
                  Excellent fit for{" "}
                  {roles.find((r) => r.value === selectedRole)?.label}
                </p>
              </div>

              {/* Skills Detected */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                  Skills Detected
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.skills_detected.map((skill) => {
                    const strength = analysis.skill_strength[skill];
                    return (
                      <span
                        key={skill}
                        className={cn(
                          "rounded-full px-3 py-1 text-sm font-medium",
                          strength === "strong"
                            ? "bg-secondary/10 text-secondary"
                            : "bg-accent/10 text-accent"
                        )}
                      >
                        {skill}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Resume Quality */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                  Resume Quality
                </h3>
                <div className="mb-2 flex items-end gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    {analysis.resume_quality}
                  </span>
                  <span className="mb-0.5 text-muted-foreground">/100</span>
                </div>
                <Progress value={analysis.resume_quality} className="h-2" />
              </div>

              {/* Strengths */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                  Strengths
                </h3>
                <div className="flex flex-col gap-2">
                  {analysis.strengths.map((s, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                      <p className="text-sm text-foreground">{s}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gaps */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                  Areas to Improve
                </h3>
                <div className="flex flex-col gap-2">
                  {analysis.gaps.map((g, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      <p className="text-sm text-foreground">{g}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Continue Button */}
              <Button
                size="lg"
                className="gap-2"
                onClick={() => setCurrentStep("skill-assessment")}
              >
                Continue to Skill Assessment
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
