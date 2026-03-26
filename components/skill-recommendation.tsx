"use client";

import { useState } from "react";
import { ChevronDown, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SkillRecommendationCardProps {
    analysisId: string | null;
    targetRole: string | null;
    gaps: string[];
    strengths: string[];
    feedback: string;
}

export function SkillRecommendationCard({
    analysisId,
    targetRole,
    gaps,
    strengths,
    feedback,
}: SkillRecommendationCardProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [skills, setSkills] = useState<string[]>([]);

    const handleToggle = async () => {
        // If opening for the first time
        if (!isOpen && !hasFetched) {
            setLoading(true);
            setError(false);
            try {
                const response = await fetch("/api/skill-recommendation", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        analysisId,
                        targetRole,
                        gaps,
                        strengths,
                        feedback,
                    }),
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch skills");
                }

                const data = await response.json();
                if (data.success && Array.isArray(data.skills)) {
                    setSkills(data.skills);
                } else {
                    setError(true);
                }
            } catch (error) {
                console.error("Skill recommendation error:", error);
                setError(true);
            } finally {
                setLoading(false);
                setHasFetched(true);
            }
        }

        setIsOpen(!isOpen);
    };

    return (
        <div className="mb-8 overflow-hidden rounded-xl border border-border bg-card">
            {/* Clickable Header */}
            <div
                className="flex cursor-pointer border-l-4 border-l-transparent items-center justify-between p-6 transition-colors hover:bg-muted/30 hover:border-l-primary"
                onClick={handleToggle}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleToggle();
                    }
                }}
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                        <Sparkles className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground">
                        Explore Skills to Improve
                    </h2>
                </div>
                <ChevronDown
                    className={cn(
                        "h-5 w-5 text-muted-foreground transition-transform duration-300",
                        isOpen && "rotate-180"
                    )}
                />
            </div>

            {/* Expandable Content */}
            <div
                className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
            >
                <div className="overflow-hidden">
                    <div className="border-t border-border bg-muted/10 p-6">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center gap-3 py-6 text-muted-foreground">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                <p className="text-sm">Analyzing missing skills...</p>
                            </div>
                        ) : error ? (
                            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-destructive">
                                <AlertCircle className="h-4 w-4" />
                                <p className="text-sm font-medium">Skill recommendation unavailable.</p>
                            </div>
                        ) : skills.length > 0 ? (
                            <div className="flex flex-col gap-4">
                                <p className="text-sm text-foreground/80">
                                    Based on your resume analysis, mastering these skills could significantly boost your readiness for <span className="font-medium text-foreground">{targetRole || "your target role"}</span>:
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    {skills.map((skill, i) => (
                                        <div
                                            key={i}
                                            className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-primary/50 hover:bg-muted/50"
                                        >
                                            {skill}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : hasFetched ? (
                            <p className="py-4 text-center text-sm text-muted-foreground">
                                Your skills are well aligned! We couldn't find any major missing skills.
                            </p>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}
