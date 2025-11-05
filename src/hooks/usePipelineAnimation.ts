import { useState, useEffect } from "react";

type ContractorStatus = "offer-accepted" | "data-pending" | "drafting" | "awaiting-signature" | "trigger-onboarding" | "onboarding-pending" | "certified" | "payroll-ready";

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
  "certified",
  "payroll-ready",
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
        // Find the first contractor that hasn't reached "certified" status
        const contractorToProgress = current.find((c) => c.status !== "certified");
        
        if (!contractorToProgress) {
          // All certified, stop animation
          return current;
        }

        // Progress this contractor to next stage
        const currentIndex = statusProgression.indexOf(contractorToProgress.status);
        const nextStatus = statusProgression[currentIndex + 1] || "certified";

        // Skip onboarding-pending in auto-animation, go straight from trigger to certified
        const finalStatus = nextStatus === "onboarding-pending" ? "certified" : nextStatus === "certified" ? "payroll-ready" : nextStatus;

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
