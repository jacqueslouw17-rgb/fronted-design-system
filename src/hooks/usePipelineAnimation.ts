import { useState, useEffect } from "react";

type ContractorStatus = "offer-accepted" | "data-pending" | "drafting" | "awaiting-signature" | "certified";

interface Contractor {
  id: string;
  name: string;
  country: string;
  countryFlag: string;
  role: string;
  salary: string;
  status: ContractorStatus;
}

const statusProgression: ContractorStatus[] = [
  "offer-accepted",
  "data-pending",
  "drafting",
  "awaiting-signature",
  "certified",
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

        return current.map((c) =>
          c.id === contractorToProgress.id
            ? { ...c, status: nextStatus }
            : c
        );
      });
    }, interval);

    return () => clearInterval(timer);
  }, [autoAnimate, interval]);

  return contractors;
};
