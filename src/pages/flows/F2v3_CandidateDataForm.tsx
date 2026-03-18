/**
 * Flow 2 v3 — Candidate Data Collection (Future)
 * 
 * Redesigned with v7 Future glassmorphism aesthetic.
 * Architecture mirrors Flow 5 v3: WaveVisualizer → pill stepper → glass cards.
 * 
 * Steps:
 * 1. Personal Profile (locked ATS fields + worker fills nationality, address, ID)
 * 2. Working Engagement (read-only terms confirmed by company + worker fills location)
 */

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FrostedHeader } from "@/components/shared/FrostedHeader";
import { AnimatePresence, motion } from "framer-motion";
import { AgentLayout } from "@/components/agent/AgentLayout";
import { useAgentState } from "@/hooks/useAgentState";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import "@/styles/v7-glass-theme.css";
import "@/styles/v7-glass-portals.css";

import F2v3_WaveVisualizer from "@/components/flows/candidate-data-v3/F2v3_WaveVisualizer";
import F2v3_PersonalProfileStep from "@/components/flows/candidate-data-v3/F2v3_PersonalProfileStep";
import F2v3_WorkingEngagementStep from "@/components/flows/candidate-data-v3/F2v3_WorkingEngagementStep";

const PREFILLED = {
  fullName: "Sofia Rodriguez",
  email: "sofia.rodriguez@email.com",
  role: "Marketing Manager",
  country: "Philippines",
  employmentType: "Contractor" as const,
  startDate: "2025-02-01",
  salary: "₱85,000",
  companyName: "Acme Corp",
};

const FLOW_STEPS = [
  { id: "personal_profile", title: "Personal profile", stepNumber: 1 },
  { id: "working_engagement", title: "Working engagement", stepNumber: 2 },
];

const F2v3_CandidateDataForm: React.FC = () => {
  const navigate = useNavigate();
  const { setIsSpeaking: setAgentSpeaking } = useAgentState();

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => { setAgentSpeaking(isSpeaking); }, [isSpeaking, setAgentSpeaking]);

  // Activate v7 glass portal overrides on body
  useEffect(() => {
    document.body.classList.add('v7-glass-active');
    return () => document.body.classList.remove('v7-glass-active');
  }, []);

  const activeStep = FLOW_STEPS[currentStep] || FLOW_STEPS[0];

  const getStepTitle = () => {
    switch (activeStep.id) {
      case "personal_profile": return `Hi ${PREFILLED.fullName.split(" ")[0]}! Let's verify your details`;
      case "working_engagement": return "Review your engagement";
      default: return "Setup";
    }
  };

  const getStepSubtitle = () => {
    switch (activeStep.id) {
      case "personal_profile": return "Confirm your identity and complete the remaining fields below.";
      case "working_engagement": return `Review the terms confirmed by ${PREFILLED.companyName} and add your work location.`;
      default: return "";
    }
  };

  const handleStepComplete = async (stepId: string, data?: Record<string, any>) => {
    setIsProcessing(true);
    if (data) setFormData(prev => ({ ...prev, ...data }));
    setCompletedSteps(prev => new Set(prev).add(stepId));

    const currentIdx = FLOW_STEPS.findIndex(s => s.id === stepId);

    if (currentIdx < FLOW_STEPS.length - 1) {
      await new Promise(r => setTimeout(r, 400));
      setCurrentStep(currentIdx + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Final step — show success
      setShowSuccess(true);
      setTimeout(() => {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#3B82F6', '#6366F1', '#818CF8'] });
      }, 300);
    }
    setIsProcessing(false);
  };

  if (showSuccess) {
    return (
      <AgentLayout context="Worker Data Collection v3 — Future">
        <main className="flex min-h-screen text-foreground relative">
          <FrostedHeader onLogoClick={() => navigate("/?tab=flows")} onCloseClick={() => navigate("/?tab=flows")} />
          <div
            className="v7-glass-bg flex-shrink-0 flex flex-col min-h-screen pt-20 sm:pt-24 px-4 sm:px-8 pb-16 sm:pb-32 items-center justify-center relative z-10 mx-auto"
            style={{ width: "100%", maxWidth: "680px" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="w-full text-center space-y-10"
            >
              {/* Animated icon with layered glow */}
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 160, damping: 14 }}
                className="flex justify-center"
              >
                <div className="relative">
                  {/* Outer soft glow */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: [0.4, 0.6, 0.4], scale: [1, 1.15, 1] }}
                    transition={{ delay: 0.4, duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -inset-8 rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(59,130,246,0.12) 40%, transparent 70%)' }}
                  />
                  {/* Inner ring glow */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="absolute -inset-3 rounded-full border border-primary/10"
                  />
                  {/* Main circle */}
                  <div
                    className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(145deg, #6366F1, #3B82F6, #818CF8)',
                      boxShadow: '0 12px 40px rgba(99,102,241,0.35), 0 4px 16px rgba(59,130,246,0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
                    }}
                  >
                    <motion.svg viewBox="0 0 24 24" fill="none" className="w-11 h-11 sm:w-13 sm:h-13">
                      <motion.path
                        d="M5 13l4 4L19 7"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.5, duration: 0.4, ease: "easeOut" }}
                      />
                    </motion.svg>
                  </div>
                </div>
              </motion.div>

              {/* Text */}
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5 }} className="space-y-4 px-4">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Submission Complete!
                </h1>
                <p className="text-[15px] sm:text-[17px] leading-relaxed text-muted-foreground max-w-xl mx-auto">
                  Thanks, {PREFILLED.fullName.split(" ")[0]}. Your details have been sent to the Fronted team.
                  We'll now use them to prepare your contract, and you'll receive
                  the next email when it's ready to review.
                </p>
              </motion.div>

              {/* Divider */}
              <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.6, duration: 0.4 }} className="h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent mx-auto max-w-xs" />

              {/* Status pill */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.4 }} className="flex justify-center">
                <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm text-muted-foreground v7-glass-card">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                  Your submission is being processed
                </div>
              </motion.div>
            </motion.div>
          </div>
        </main>
      </AgentLayout>
    );
  }

  return (
    <AgentLayout context="Worker Data Collection v3 — Future">
      <main className="flex min-h-screen text-foreground relative">
        <FrostedHeader onLogoClick={() => navigate("/?tab=flows")} onCloseClick={() => navigate("/?tab=flows")} />
        <div
          className="v7-glass-bg flex-shrink-0 flex flex-col min-h-screen pt-20 sm:pt-24 px-4 sm:px-8 pb-16 sm:pb-32 space-y-4 sm:space-y-6 relative z-10 mx-auto onboarding-scroll-container"
          style={{ width: "100%", maxWidth: "800px" }}
        >
          {/* Header with wave visualizer */}
          <div className="flex flex-col items-center space-y-3 sm:space-y-4 mb-2 sm:mb-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex justify-center"
            >
              <F2v3_WaveVisualizer isActive={isSpeaking} />
            </motion.div>

            {/* Title + subtitle — animated per step */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="text-center space-y-1.5 sm:space-y-2 max-w-2xl px-2 sm:px-0"
              >
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                  {getStepTitle()}
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {getStepSubtitle()}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* v7 pill stepper */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex items-center gap-1.5"
            >
              {FLOW_STEPS.map((step, idx) => (
                <div key={step.id} className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (completedSteps.has(step.id) || idx <= currentStep) setCurrentStep(idx);
                    }}
                    disabled={!completedSteps.has(step.id) && idx > currentStep}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-300 border",
                      idx === currentStep
                        ? "v7-glass-item border-primary/15 text-foreground"
                        : completedSteps.has(step.id)
                        ? "v7-glass-item border-primary/8 text-foreground/60 cursor-pointer"
                        : "border-transparent text-muted-foreground/35 cursor-not-allowed"
                    )}
                  >
                    {completedSteps.has(step.id) ? (
                      <CheckCircle2 className="h-3 w-3 text-primary/50" />
                    ) : (
                      <span className={cn(
                        "h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-bold",
                        idx === currentStep ? "bg-primary/10 text-primary/70" : "text-muted-foreground/25"
                      )}>
                        {idx + 1}
                      </span>
                    )}
                    <span className="hidden sm:inline">{step.title}</span>
                  </button>
                  {idx < FLOW_STEPS.length - 1 && (
                    <div className={cn(
                      "w-5 h-px transition-colors duration-300",
                      completedSteps.has(step.id) ? "bg-primary/15" : "bg-foreground/[0.04]"
                    )} />
                  )}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeStep.id === "personal_profile" && (
                <F2v3_PersonalProfileStep
                  formData={formData}
                  prefilled={{ fullName: PREFILLED.fullName, email: PREFILLED.email, country: PREFILLED.country }}
                  onComplete={handleStepComplete}
                  isProcessing={isProcessing}
                />
              )}
              {activeStep.id === "working_engagement" && (
                <F2v3_WorkingEngagementStep
                  formData={formData}
                  prefilled={{
                    role: PREFILLED.role,
                    employmentType: PREFILLED.employmentType,
                    startDate: PREFILLED.startDate,
                    salary: PREFILLED.salary,
                    country: PREFILLED.country,
                    companyName: PREFILLED.companyName,
                  }}
                  onComplete={handleStepComplete}
                  isProcessing={isProcessing}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </AgentLayout>
  );
};

export default F2v3_CandidateDataForm;
