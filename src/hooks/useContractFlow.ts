import { useState, useCallback, useEffect } from "react";

export type ContractFlowPhase = 
  | "prompt"
  | "generating"
  | "idle" 
  | "notification"
  | "offer-accepted"
  | "data-collection" 
  | "drafting"
  | "bundle-creation" 
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
  status: "Shortlisted" | "Hired";
  email?: string;
  employmentType?: "contractor" | "employee";
  employmentTypeSource?: "ats" | "suggested";
  documents?: string[];
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
    signingPortal: "PH eSign Portal",
    status: "Hired",
    email: "maria.santos@example.com",
    employmentType: "contractor",
    employmentTypeSource: "ats",
    documents: ["Contractor Agreement", "NDA", "Data Privacy Addendum (PH)"],
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
    signingPortal: "NO Altinn",
    status: "Hired",
    email: "oskar.nilsen@example.com",
    employmentType: "employee",
    employmentTypeSource: "suggested",
    documents: ["Employment Agreement", "Country Compliance Attachments", "NDA / Policy Docs"],
  }
];

export const useContractFlow = (version: "v3" | "v5" = "v3") => {
  const [phase, setPhase] = useState<ContractFlowPhase>(version === "v5" ? "prompt" : "idle");
  const [selectedCandidates, setSelectedCandidates] = useState<Candidate[]>([]);
  const [currentDraftIndex, setCurrentDraftIndex] = useState(0);
  const [reviewComments, setReviewComments] = useState<Record<string, string>>({});
  const [signedCandidates, setSignedCandidates] = useState<string[]>([]);

  // Reset phase when version changes
  useEffect(() => {
    setPhase(version === "v5" ? "prompt" : "idle");
    setSelectedCandidates([]);
    setCurrentDraftIndex(0);
    setReviewComments({});
    setSignedCandidates([]);
  }, [version]);

  const startPromptFlow = useCallback(() => {
    setPhase("generating");
    setTimeout(() => {
      setPhase("idle");
    }, 2000);
  }, []);

  const startFlow = useCallback(() => {
    setPhase("offer-accepted");
    // Only show candidates with "Hired" status
    setSelectedCandidates(useMockCandidates().filter(c => c.status === "Hired"));
  }, []);

  const proceedToDataCollection = useCallback(() => {
    setPhase("data-collection");
  }, []);

  const proceedToDrafting = useCallback(() => {
    setPhase("drafting");
    setCurrentDraftIndex(0);
  }, []);

  const prepareDrafts = useCallback(() => {
    setPhase("bundle-creation");
    setCurrentDraftIndex(0);
  }, []);

  const proceedFromBundle = useCallback(() => {
    setPhase("drafting");
  }, []);

  const nextDraft = useCallback(() => {
    // v5: only show one draft, then go to reviewing
    if (version === "v5") {
      setPhase("reviewing");
    } else if (currentDraftIndex < selectedCandidates.length - 1) {
      setCurrentDraftIndex(prev => prev + 1);
    } else {
      setPhase("reviewing");
    }
  }, [currentDraftIndex, selectedCandidates.length, version]);

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
    setPhase(version === "v5" ? "prompt" : "idle");
    setSelectedCandidates([]);
    setCurrentDraftIndex(0);
    setReviewComments({});
    setSignedCandidates([]);
  }, [version]);

  return {
    phase,
    selectedCandidates,
    currentDraftIndex,
    reviewComments,
    signedCandidates,
    startPromptFlow,
    startFlow,
    proceedToDataCollection,
    proceedToDrafting,
    prepareDrafts,
    proceedFromBundle,
    nextDraft,
    addReviewComment,
    startSigning,
    signContract,
    completeFlow,
    resetFlow,
  };
};
