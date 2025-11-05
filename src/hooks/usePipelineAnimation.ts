import { useState, useEffect } from "react";

type ContractorStatus = "offer-accepted" | "data-pending" | "drafting" | "awaiting-signature" | "trigger-onboarding" | "onboarding-pending" | "CERTIFIED" | "PAYROLL_PENDING" | "IN_BATCH" | "EXECUTING" | "PAID" | "ON_HOLD";

interface Contractor {
  id: string;
  name: string;
  country: string;
  countryFlag: string;
  role: string;
  salary: string;
  status: ContractorStatus;
  employmentType?: "contractor" | "employee";
  checklist?: any[];
  checklistProgress?: number;
}

const statusProgression: ContractorStatus[] = [
  "offer-accepted",
  "data-pending",
  "drafting",
  "awaiting-signature",
  "trigger-onboarding",
  "onboarding-pending",
  "CERTIFIED",
  "PAYROLL_PENDING",
  "IN_BATCH",
  "EXECUTING",
  "PAID",
];

export const usePipelineAnimation = (
  initialContractors: Contractor[],
  autoAnimate: boolean = false,
  interval: number = 3000
) => {
  const [contractors, setContractors] = useState<Contractor[]>(initialContractors);

  useEffect(() => {
    if (!autoAnimate) return;

    const timer = setInterval(() => {
      setContractors((current) => {
        // Find the first contractor that hasn't reached "PAID" status
        const contractorToProgress = current.find((c) => c.status !== "PAID");
        
        if (!contractorToProgress) {
          // All paid, stop animation
          return current;
        }

        // Progress this contractor to next stage
        const currentIndex = statusProgression.indexOf(contractorToProgress.status);
        const nextStatus = statusProgression[currentIndex + 1] || "PAID";

        // Skip onboarding-pending in auto-animation, go straight from trigger to CERTIFIED
        const finalStatus = nextStatus === "onboarding-pending" ? "CERTIFIED" : nextStatus;

        return current.map((c) =>
          c.id === contractorToProgress.id
            ? { ...c, status: finalStatus }
            : c
        );
      });
    }, interval);

    return () => clearInterval(timer);
  }, [autoAnimate, interval]);

  return contractors;
};
