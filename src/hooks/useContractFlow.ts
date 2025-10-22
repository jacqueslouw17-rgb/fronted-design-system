import { useState, useCallback } from "react";

export type ContractFlowPhase = 
  | "idle" 
  | "notification" 
  | "drafting" 
  | "reviewing" 
  | "signing" 
  | "complete";

export interface Candidate {
  id: string;
  name: string;
  role: string;
  country: string;
  countryCode: string;
  flag: string;
  salary: string;
  startDate: string;
  noticePeriod: string;
  pto: string;
  currency: string;
  signingPortal: string;
}

export const useMockCandidates = (): Candidate[] => [
  {
    id: "1",
    name: "Maria Santos",
    role: "UX Designer",
    country: "Philippines",
    countryCode: "PH",
    flag: "🇵🇭",
    salary: "₱85,000/mo",
    startDate: "Dec 1, 2025",
    noticePeriod: "30 days",
    pto: "15 days/year",
    currency: "PHP",
    signingPortal: "PH eSign Portal"
  }
];

export const useContractFlow = () => {
  const [phase, setPhase] = useState<ContractFlowPhase>("idle");
  const [selectedCandidates, setSelectedCandidates] = useState<Candidate[]>([]);
  const [currentDraftIndex, setCurrentDraftIndex] = useState(0);
  const [reviewComments, setReviewComments] = useState<Record<string, string>>({});
  const [signedCandidates, setSignedCandidates] = useState<string[]>([]);

  const startFlow = useCallback(() => {
    setPhase("notification");
    setSelectedCandidates(useMockCandidates());
  }, []);

  const prepareDrafts = useCallback(() => {
    setPhase("drafting");
    setCurrentDraftIndex(0);
  }, []);

  const nextDraft = useCallback(() => {
    if (currentDraftIndex < selectedCandidates.length - 1) {
      setCurrentDraftIndex(prev => prev + 1);
    } else {
      setPhase("reviewing");
    }
  }, [currentDraftIndex, selectedCandidates.length]);

  const addReviewComment = useCallback((candidateId: string, comment: string) => {
    setReviewComments(prev => ({ ...prev, [candidateId]: comment }));
  }, []);

  const startSigning = useCallback(() => {
    setPhase("signing");
  }, []);

  const signContract = useCallback((candidateId: string) => {
    setSignedCandidates(prev => [...prev, candidateId]);
  }, []);

  const completeFlow = useCallback(() => {
    setPhase("complete");
  }, []);

  const resetFlow = useCallback(() => {
    setPhase("idle");
    setSelectedCandidates([]);
    setCurrentDraftIndex(0);
    setReviewComments({});
    setSignedCandidates([]);
  }, []);

  return {
    phase,
    selectedCandidates,
    currentDraftIndex,
    reviewComments,
    signedCandidates,
    startFlow,
    prepareDrafts,
    nextDraft,
    addReviewComment,
    startSigning,
    signContract,
    completeFlow,
    resetFlow,
  };
};
