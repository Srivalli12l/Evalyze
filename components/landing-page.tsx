"use client";

import { motion, Variants } from "framer-motion";
import { useApp } from "@/lib/app-context";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
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

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } },
};

export function LandingPage() {
  const { setCurrentStep } = useApp();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <motion.div 
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.4 }}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary"
            >
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </motion.div>
            <span className="text-lg font-bold text-foreground">
              Evalyze
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
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
      </motion.header>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-24 md:py-32">
        <div className="absolute inset-0 -z-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" 
          />
        </div>
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="mx-auto max-w-4xl text-center"
        >
          <motion.div variants={fadeUp} className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Assessment Platform
          </motion.div>
          <motion.h1 variants={fadeUp} className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground md:text-6xl">
            Ace Your Campus Placements with{" "}
            <span className="text-primary">AI-Powered Assessment</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mx-auto mb-10 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
            Resume analysis, role-specific tests, and personalized feedback to
            help you land your dream job. Know exactly where you stand before
            your interviews.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="gap-2 px-8 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
              onClick={() => setCurrentStep("signup")}
            >
              Start Free Assessment
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base bg-transparent border-border hover:bg-muted"
              onClick={() => setCurrentStep("login")}
            >
              Already have an account?
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-card px-6 py-20 overflow-hidden">
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="mx-auto max-w-6xl"
        >
          <motion.div variants={fadeUp} className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold text-foreground">
              Everything You Need to Prepare
            </h2>
            <p className="text-muted-foreground">
              A complete toolkit to evaluate and improve your placement
              readiness.
            </p>
          </motion.div>
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group rounded-xl border border-border bg-background p-8 shadow-sm transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
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
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20">
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.25, // Move one by one with more delay
              },
            },
          }}
          className="mx-auto max-w-6xl"
        >
          <motion.div variants={fadeUp} className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold text-foreground">
              How It Works
            </h2>
            <p className="text-muted-foreground">
              Four simple steps to your placement readiness score.
            </p>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <motion.div 
                key={step.step} 
                variants={{
                  hidden: { opacity: 0, scale: 0.8 },
                  show: { 
                    opacity: 1, 
                    scale: 1,
                    transition: { type: "spring", stiffness: 60, damping: 10 } 
                  }
                }}
                animate={{
                  y: [0, -15, 0],
                  rotate: [0, 1, -1, 0]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                  delay: i * 0.3 // Moves them one by one in a wave
                }}
                whileHover={{ scale: 1.05, rotate: -2, zIndex: 10 }}
                className="relative"
              >
                <div className="relative flex h-full flex-col overflow-hidden rounded-xl bg-border p-[1px] shadow-sm transition-all hover:shadow-xl hover:shadow-primary/20 group">
                  <div className="absolute inset-[-100%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,hsl(var(--primary))_50%,transparent_100%)] opacity-30 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="relative z-10 flex h-full flex-col overflow-hidden rounded-[11px] bg-card p-6">
                    {/* Subtle animated background glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 -z-10" />
                    
                    <div className="mb-4 flex items-center gap-3 relative">
                    <motion.span 
                      initial={{ scale: 1 }}
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      className="text-sm font-bold text-primary inline-block"
                    >
                      {step.step}
                    </motion.span>
                    <div className="h-px flex-1 bg-border" />
                    <motion.div 
                      animate={{ 
                        rotate: [0, 360],
                      }}
                      transition={{ 
                        duration: 8, 
                        repeat: Infinity, 
                        ease: "linear",
                      }}
                    >
                      <step.icon className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
                    </motion.div>
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground relative">
                    {step.title}
                  </h3>
                  <p className="flex-1 text-sm leading-relaxed text-muted-foreground relative">
                    {step.description}
                  </p>
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-border lg:block" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Mission / Immersive Typography Section */}
      <section className="relative px-6 py-12 md:py-16 overflow-hidden bg-background">
        {/* Background Grid & Glow overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.15)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.15)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_40%,transparent_100%)]" />
        <div className="absolute top-1/2 left-1/2 -z-10 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[100px]" />

        <div className="mx-auto max-w-5xl text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="mb-8 flex justify-center">
              <div className="rounded-2xl bg-primary/10 p-4 ring-1 ring-primary/20 shadow-lg shadow-primary/5">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="text-4xl font-black tracking-tighter text-foreground sm:text-6xl md:text-7xl text-balance">
              Bridging the gap between <br className="hidden lg:block"/>
              <span className="bg-gradient-to-b from-primary to-primary/50 bg-clip-text text-transparent">Preparation & Placement</span>
            </h2>
            <p className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground sm:text-xl text-balance leading-relaxed">
              Our platform is dedicated to providing students with the tools they need to succeed in their career journeys through personalized, AI-driven insights.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-12 text-center"
        >
          <motion.h2 variants={fadeUp} className="mb-3 text-3xl font-bold text-foreground">
            Ready to Get Started?
          </motion.h2>
          <motion.p variants={fadeUp} className="mb-8 text-muted-foreground">
            Join the journey towards your dream placement with AI-powered assessments.
          </motion.p>
          <motion.div variants={fadeUp}>
            <Button
              size="lg"
              className="gap-2 px-8 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow"
              onClick={() => setCurrentStep("signup")}
            >
              Start Your Assessment
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </motion.div>
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
