import { useState } from "react";

export type OnboardingStatus = 
  | "not_sent"
  | "awaiting_info" 
  | "ready_for_contract"
  | "validating"
  | "drafting"
  | "awaiting_signature"
  | "signed";

export interface OnboardingCandidate {
  id: string;
  name: string;
  email: string;
  role: string;
  country: string;
  flag: string;
  salary: string;
  startDate: string;
  status: OnboardingStatus;
  formSentAt?: string;
  dataSubmittedAt?: string;
  validatedAt?: string;
  employmentType?: "contractor" | "employee";
  employmentTypeSource?: "ats" | "suggested";
  documents?: string[];
}

export const useMockOnboardingCandidates = (): OnboardingCandidate[] => {
  return [
    {
      id: "1",
      name: "Maria Santos",
      email: "maria.santos@example.com",
      role: "Senior Backend Engineer",
      country: "Philippines",
      flag: "🇵🇭",
      salary: "₱85,000/month",
      startDate: "2025-11-15",
      status: "not_sent",
      employmentType: "contractor",
      employmentTypeSource: "ats",
      documents: ["Contractor Agreement", "NDA", "Data Privacy Addendum (PH)"],
    },
    {
      id: "2",
      name: "Lars Bjørnson",
      email: "lars.bjornson@example.com",
      role: "Product Designer",
      country: "Norway",
      flag: "🇳🇴",
      salary: "kr 65,000/month",
      startDate: "2025-11-20",
      status: "not_sent",
      employmentType: "contractor",
      employmentTypeSource: "suggested",
      documents: ["Contractor Agreement", "NDA"],
    },
    {
      id: "3",
      name: "Priya Sharma",
      email: "priya.sharma@example.com",
      role: "Data Analyst",
      country: "India",
      flag: "🇮🇳",
      salary: "₹95,000/month",
      startDate: "2025-12-01",
      status: "not_sent",
      employmentType: "employee",
      employmentTypeSource: "suggested",
      documents: [],
    },
  ];
};

export const useCandidateOnboarding = () => {
  const mockCandidates = useMockOnboardingCandidates();
  const [candidates, setCandidates] = useState<OnboardingCandidate[]>(mockCandidates);
  const [selectedCandidate, setSelectedCandidate] = useState<OnboardingCandidate | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [validatingCandidateId, setValidatingCandidateId] = useState<string | null>(null);

  const openDrawer = (candidate: OnboardingCandidate) => {
    setSelectedCandidate(candidate);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedCandidate(null);
  };

  const openSendModal = (candidate: OnboardingCandidate) => {
    setSelectedCandidate(candidate);
    setIsSendModalOpen(true);
  };

  const closeSendModal = () => {
    setIsSendModalOpen(false);
    setSelectedCandidate(null);
  };

  const sendForm = (candidateId: string) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidateId
          ? {
              ...c,
              status: "awaiting_info",
              formSentAt: new Date().toISOString(),
            }
          : c
      )
    );
  };

  const submitCandidateData = (candidateId: string) => {
    // First set to validating status
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidateId
          ? {
              ...c,
              status: "validating",
              dataSubmittedAt: new Date().toISOString(),
            }
          : c
      )
    );

    setValidatingCandidateId(candidateId);

    // Simulate Genie validation (2 seconds)
    setTimeout(() => {
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidateId
            ? {
                ...c,
                status: "ready_for_contract",
                validatedAt: new Date().toISOString(),
              }
            : c
        )
      );
      setValidatingCandidateId(null);
    }, 2000);
  };

  const allCandidatesReady = candidates.every(
    (c) => c.status === "ready_for_contract"
  );

  return {
    candidates,
    selectedCandidate,
    isDrawerOpen,
    isSendModalOpen,
    validatingCandidateId,
    allCandidatesReady,
    openDrawer,
    closeDrawer,
    openSendModal,
    closeSendModal,
    sendForm,
    submitCandidateData,
  };
};
