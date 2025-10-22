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
  },
  {
    id: "2",
    name: "Oskar Nilsen",
    role: "DevOps Engineer",
    country: "Norway",
    countryCode: "NO",
    flag: "🇳🇴",
    salary: "NOK 65,000/mo",
    startDate: "Nov 15, 2025",
    noticePeriod: "60 days",
    pto: "25 days/year",
    currency: "NOK",
    signingPortal: "NO Altinn"
  },
  {
    id: "3",
    name: "Arta Krasniqi",
    role: "QA Specialist",
    country: "Kosovo",
    countryCode: "XK",
    flag: "🇽🇰",
    salary: "€2,800/mo",
    startDate: "Dec 10, 2025",
    noticePeriod: "15 days",
    pto: "20 days/year",
    currency: "EUR",
    signingPortal: "XK AuthChain"
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
    // For demo purposes, skip directly to reviewing after first draft
    setPhase("reviewing");
  }, []);

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
