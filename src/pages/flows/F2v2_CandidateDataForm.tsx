/**
 * Flow 2 v2 - Candidate Data Collection
 * 
 * Aligned with Flow 3 Candidate Onboarding v2 UX pattern:
 * AgentLayout → AgentHeader → ProgressBar → StepCard accordion
 * 
 * Steps:
 * 1. Personal Profile (locked ATS fields + worker fills nationality, address, ID)
 * 2. Working Engagement (read-only terms confirmed by company + worker fills location)
 */

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Building2, ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FrostedHeader } from "@/components/shared/FrostedHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import ProgressBar from "@/components/ProgressBar";
import StepCard from "@/components/StepCard";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import { useAgentState } from "@/hooks/useAgentState";
import { scrollToStep as utilScrollToStep } from "@/lib/scroll-utils";

// ─── Country Rules (matching admin-side F1v5) ───
interface CountryRule {
  flag: string;
  currency: string;
  probation: { default: number; unit: string };
  noticePeriod: { default: number; unit: string };
  annualLeave: { default: number; unit: string };
  sickLeave: { default: number; unit: string };
  weeklyHours: { default: number; unit: string };
  payFrequency: string;
  idLabel: string;
  idPlaceholder: string;
}

const COUNTRY_RULES: Record<string, CountryRule> = {
  Norway: {
    flag: "🇳🇴", currency: "NOK",
    probation: { default: 180, unit: "days" },
    noticePeriod: { default: 30, unit: "days" },
    annualLeave: { default: 25, unit: "days" },
    sickLeave: { default: 365, unit: "days" },
    weeklyHours: { default: 37.5, unit: "hours" },
    payFrequency: "Monthly",
    idLabel: "National ID (Fødselsnummer)",
    idPlaceholder: "11-digit personal number",
  },
  Sweden: {
    flag: "🇸🇪", currency: "SEK",
    probation: { default: 180, unit: "days" },
    noticePeriod: { default: 30, unit: "days" },
    annualLeave: { default: 25, unit: "days" },
    sickLeave: { default: 365, unit: "days" },
    weeklyHours: { default: 40, unit: "hours" },
    payFrequency: "Monthly",
    idLabel: "Personal Number (Personnummer)",
    idPlaceholder: "YYMMDD-XXXX",
  },
  Philippines: {
    flag: "🇵🇭", currency: "PHP",
    probation: { default: 180, unit: "days" },
    noticePeriod: { default: 30, unit: "days" },
    annualLeave: { default: 5, unit: "days" },
    sickLeave: { default: 5, unit: "days" },
    weeklyHours: { default: 48, unit: "hours" },
    payFrequency: "Fortnightly",
    idLabel: "TIN / PhilHealth ID",
    idPlaceholder: "e.g., 123-456-789-000",
  },
  India: {
    flag: "🇮🇳", currency: "INR",
    probation: { default: 90, unit: "days" },
    noticePeriod: { default: 30, unit: "days" },
    annualLeave: { default: 21, unit: "days" },
    sickLeave: { default: 12, unit: "days" },
    weeklyHours: { default: 48, unit: "hours" },
    payFrequency: "Monthly",
    idLabel: "PAN Number",
    idPlaceholder: "e.g., ABCDE1234F",
  },
  Kosovo: {
    flag: "🇽🇰", currency: "EUR",
    probation: { default: 180, unit: "days" },
    noticePeriod: { default: 30, unit: "days" },
    annualLeave: { default: 20, unit: "days" },
    sickLeave: { default: 20, unit: "days" },
    weeklyHours: { default: 40, unit: "hours" },
    payFrequency: "Monthly",
    idLabel: "Personal ID Number",
    idPlaceholder: "National ID number",
  },
  Denmark: {
    flag: "🇩🇰", currency: "DKK",
    probation: { default: 90, unit: "days" },
    noticePeriod: { default: 30, unit: "days" },
    annualLeave: { default: 25, unit: "days" },
    sickLeave: { default: 365, unit: "days" },
    weeklyHours: { default: 37, unit: "hours" },
    payFrequency: "Monthly",
    idLabel: "CPR Number",
    idPlaceholder: "DDMMYY-XXXX",
  },
  Singapore: {
    flag: "🇸🇬", currency: "SGD",
    probation: { default: 90, unit: "days" },
    noticePeriod: { default: 30, unit: "days" },
    annualLeave: { default: 7, unit: "days" },
    sickLeave: { default: 14, unit: "days" },
    weeklyHours: { default: 44, unit: "hours" },
    payFrequency: "Monthly",
    idLabel: "NRIC / FIN",
    idPlaceholder: "e.g., S1234567A",
  },
  Spain: {
    flag: "🇪🇸", currency: "EUR",
    probation: { default: 60, unit: "days" },
    noticePeriod: { default: 15, unit: "days" },
    annualLeave: { default: 22, unit: "days" },
    sickLeave: { default: 365, unit: "days" },
    weeklyHours: { default: 40, unit: "hours" },
    payFrequency: "Monthly",
    idLabel: "DNI / NIE",
    idPlaceholder: "e.g., 12345678Z",
  },
  Romania: {
    flag: "🇷🇴", currency: "RON",
    probation: { default: 90, unit: "days" },
    noticePeriod: { default: 20, unit: "days" },
    annualLeave: { default: 20, unit: "days" },
    sickLeave: { default: 183, unit: "days" },
    weeklyHours: { default: 40, unit: "hours" },
    payFrequency: "Monthly",
    idLabel: "CNP (Personal Numeric Code)",
    idPlaceholder: "13-digit code",
  },
};

const NATIONALITIES = [
  "American", "Australian", "Brazilian", "British", "Canadian", "Chinese", "Danish",
  "Dutch", "Filipino", "Finnish", "French", "German", "Greek", "Indian", "Indonesian",
  "Irish", "Italian", "Japanese", "Korean", "Kosovar", "Malaysian", "Mexican",
  "Norwegian", "Polish", "Portuguese", "Romanian", "Russian", "Singaporean",
  "South African", "Spanish", "Swedish", "Swiss", "Thai", "Turkish", "Ukrainian",
];

// ─── Prefilled data from ATS ───
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

// ─── Flow Steps ───
const FLOW_STEPS = [
  { id: "personal_profile", title: "Personal Profile", icon: "👤" },
  { id: "working_engagement", title: "Working Engagement", icon: "💼" },
];

// ─── Step Content Components ───

const StepPersonalProfile: React.FC<{
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
}> = ({ formData, onComplete, isProcessing }) => {
  const countryRule = COUNTRY_RULES[PREFILLED.country];
  const [data, setData] = useState({
    nationality: formData.nationality || "",
    address: formData.address || "",
    idNumber: formData.idNumber || "",
  });

  const isValid = data.nationality && data.idNumber;

  const handleContinue = () => {
    if (!isValid) {
      toast.error("Please fill in all required fields");
      return;
    }
    onComplete("personal_profile", data);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="space-y-6 p-4 sm:p-6"
    >
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Personal Profile</h3>
        <p className="text-sm text-muted-foreground">
          Verify your details and complete the remaining fields.
        </p>
      </div>

      <div className="space-y-4">
        {/* Locked ATS fields */}
        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input value={PREFILLED.fullName} disabled className="bg-muted/50" />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={PREFILLED.email} disabled className="bg-muted/50" />
        </div>

        {/* Worker fills */}
        <div className="space-y-2">
          <Label>Nationality</Label>
          <Select value={data.nationality} onValueChange={(v) => setData({ ...data, nationality: v })}>
            <SelectTrigger><SelectValue placeholder="Select your nationality" /></SelectTrigger>
            <SelectContent>
              {NATIONALITIES.map(n => (
                <SelectItem key={n} value={n}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>
            Residential Address
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-normal ml-1.5">Optional</Badge>
          </Label>
          <Input
            value={data.address}
            onChange={e => setData({ ...data, address: e.target.value })}
            placeholder="Full residential address"
          />
        </div>

        <div className="space-y-2">
          <Label>{countryRule?.idLabel || "ID Number"}</Label>
          <Input
            value={data.idNumber}
            onChange={e => setData({ ...data, idNumber: e.target.value })}
            placeholder={countryRule?.idPlaceholder || "Government-issued ID number"}
          />
          {countryRule && (
            <div className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
              <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                Your {countryRule.idLabel} as required for {PREFILLED.country}.
              </p>
            </div>
          )}
        </div>
      </div>

      <Button
        onClick={handleContinue}
        disabled={!isValid || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? "Saving..." : "Continue"}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </motion.div>
  );
};

const StepWorkingEngagement: React.FC<{
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
}> = ({ formData, onComplete, isProcessing }) => {
  const countryRule = COUNTRY_RULES[PREFILLED.country];
  const [workLocation, setWorkLocation] = useState(formData.workLocation || "");

  const handleSubmit = async () => {
    onComplete("working_engagement", { workLocation });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="space-y-6 p-4 sm:p-6"
    >
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Working Engagement</h3>
        <p className="text-sm text-muted-foreground">
          Review your engagement terms confirmed by {PREFILLED.companyName}.
        </p>
      </div>

      <div className="space-y-4">
        {/* Read-only confirmed fields */}
        <div className="space-y-2">
          <Label>Role</Label>
          <Input value={PREFILLED.role} disabled className="bg-muted/50" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Employment Type</Label>
            <Input value={PREFILLED.employmentType} disabled className="bg-muted/50" />
          </div>
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input value={PREFILLED.startDate} disabled className="bg-muted/50" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>{PREFILLED.employmentType === "Contractor" ? "Consultancy Fee" : "Salary"}</Label>
          <Input value={PREFILLED.salary} disabled className="bg-muted/50" />
        </div>

        {/* Worker fills location */}
        <div className="space-y-2">
          <Label>
            Work Location
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-normal ml-1.5">Optional</Badge>
          </Label>
          <Input
            value={workLocation}
            onChange={e => setWorkLocation(e.target.value)}
            placeholder="e.g., Manila, Oslo, Remote"
          />
        </div>

        {/* Terms & Entitlements — read-only country defaults */}
        {countryRule && (
          <div className="border-t border-border/40 pt-4 mt-2">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="h-3.5 w-3.5 text-primary" />
              <p className="text-xs text-muted-foreground">
                Terms & Entitlements — confirmed with {PREFILLED.companyName} for {PREFILLED.country}
              </p>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <ReadOnlyWithUnit label="Probation Period" value={String(countryRule.probation.default)} unit={countryRule.probation.unit} />
                <ReadOnlyWithUnit label="Notice Period" value={String(countryRule.noticePeriod.default)} unit={countryRule.noticePeriod.unit} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <ReadOnlyWithUnit label="Annual Leave" value={String(countryRule.annualLeave.default)} unit={countryRule.annualLeave.unit} />
                <ReadOnlyWithUnit label="Sick Leave" value={String(countryRule.sickLeave.default)} unit={countryRule.sickLeave.unit} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <ReadOnlyWithUnit label="Weekly Hours" value={String(countryRule.weeklyHours.default)} unit={countryRule.weeklyHours.unit} />
                <ReadOnlyWithUnit label="Pay Frequency" value={countryRule.payFrequency} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Shield className="h-4 w-4 text-primary" />
        <span>GDPR Compliant • Your data is encrypted and secure</span>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? "Submitting..." : "Submit"}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </motion.div>
  );
};

const ReadOnlyWithUnit: React.FC<{ label: string; value: string; unit?: string }> = ({ label, value, unit }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
    <div className="flex items-center gap-2">
      <Input value={value} disabled className="bg-muted/50 flex-1" />
      {unit && (
        <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2.5 py-2 rounded-md border border-border/40 whitespace-nowrap select-none">
          {unit}
        </span>
      )}
    </div>
  </div>
);

// ─── Main Component ───
const F2v2_CandidateDataForm: React.FC = () => {
  const navigate = useNavigate();
  const { setIsSpeaking: setAgentSpeaking } = useAgentState();
  
  const [currentStep, setCurrentStep] = useState("personal_profile");
  const [expandedStep, setExpandedStep] = useState<string | null>("personal_profile");
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    setAgentSpeaking(isSpeaking);
  }, [isSpeaking, setAgentSpeaking]);

  useEffect(() => {
    if (!hasInitialized.current) {
      setExpandedStep("personal_profile");
      hasInitialized.current = true;
    }
  }, []);

  const scrollToStep = (stepId: string) => {
    utilScrollToStep(stepId, { focusHeader: true, delay: 100 });
  };

  const getStepStatus = (stepId: string): "inactive" | "pending" | "active" | "completed" => {
    if (completedSteps.has(stepId)) return "completed";
    if (stepId === currentStep) return "active";
    const currentIndex = FLOW_STEPS.findIndex(s => s.id === currentStep);
    const stepIndex = FLOW_STEPS.findIndex(s => s.id === stepId);
    if (stepIndex > currentIndex) return "inactive";
    return "pending";
  };

  const handleStepComplete = async (stepId: string, data?: Record<string, any>) => {
    const currentIndex = FLOW_STEPS.findIndex(s => s.id === stepId);
    const isFinalStep = currentIndex === FLOW_STEPS.length - 1;

    if (!isFinalStep) {
      setIsProcessing(true);
    }

    if (data) {
      setFormData(prev => ({ ...prev, ...data }));
    }

    setCompletedSteps(prev => new Set(prev).add(stepId));

    if (isFinalStep) {
      toast.success("Your details have been submitted successfully", {
        description: `${PREFILLED.companyName} will be notified.`,
      });
      navigate("/");
      return;
    }

    // Advance to next step
    const nextStep = FLOW_STEPS[currentIndex + 1];
    if (nextStep) {
      await new Promise(r => setTimeout(r, 600));
      setCurrentStep(nextStep.id);
      setExpandedStep(nextStep.id);
      setIsProcessing(false);
      setTimeout(() => scrollToStep(nextStep.id), 50);
    }
  };

  const handleStepClick = (stepId: string) => {
    const status = getStepStatus(stepId);
    if (status === "inactive") return;
    const wasExpanded = expandedStep === stepId;
    const newExpanded = wasExpanded ? null : stepId;
    setExpandedStep(newExpanded);
    if (newExpanded) {
      setTimeout(() => scrollToStep(stepId), 50);
    }
  };

  const currentStepIndex = FLOW_STEPS.findIndex(s => s.id === currentStep);

  return (
    <AgentLayout context="Data Collection">
      <main className="flex min-h-screen bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06] text-foreground relative">
        <img 
          src={frontedLogo}
          alt="Fronted"
          className="fixed top-6 left-8 z-50 h-5 sm:h-6 w-auto cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate("/?tab=flows")}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/?tab=flows")}
          className="fixed top-6 right-6 z-50 h-8 w-8 sm:h-10 sm:w-10"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-secondary/[0.02] to-accent/[0.03]" />
        </div>

        <div
          className="flex-shrink-0 flex flex-col min-h-screen p-4 sm:p-8 pb-16 sm:pb-32 space-y-6 sm:space-y-8 relative z-10 mx-auto onboarding-scroll-container"
          style={{ width: "100%", maxWidth: "800px" }}
        >
          <AgentHeader
            title={`Hi ${PREFILLED.fullName.split(" ")[0]}! Let's complete your details`}
            subtitle="Please verify the information below and fill in the remaining fields."
            showPulse={true}
            isActive={isSpeaking}
            showInput={false}
          />

          <div>
            <ProgressBar currentStep={currentStepIndex + 1} totalSteps={FLOW_STEPS.length} />
          </div>

          <div className="space-y-4">
            {FLOW_STEPS.map((step, index) => {
              const status = getStepStatus(step.id);
              const isExpanded = expandedStep === step.id;
              const headerId = `step-header-${step.id}`;
              const isLocked = index > currentStepIndex && status === "inactive";

              return (
                <div key={step.id} id={`step-${step.id}`} data-step={step.id} role="region" aria-labelledby={headerId}>
                  <StepCard
                    stepNumber={index + 1}
                    title={step.title}
                    status={status}
                    isExpanded={isExpanded}
                    isLocked={isLocked}
                    onClick={() => handleStepClick(step.id)}
                    headerId={headerId}
                  >
                    <AnimatePresence mode="wait">
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {step.id === "personal_profile" && (
                            <StepPersonalProfile
                              formData={formData}
                              onComplete={handleStepComplete}
                              isProcessing={isProcessing}
                            />
                          )}
                          {step.id === "working_engagement" && (
                            <StepWorkingEngagement
                              formData={formData}
                              onComplete={handleStepComplete}
                              isProcessing={isProcessing}
                            />
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </StepCard>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </AgentLayout>
  );
};

export default F2v2_CandidateDataForm;
