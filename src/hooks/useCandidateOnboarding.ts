import { useState } from "react";

export type OnboardingStatus = 
  | "awaiting_data" 
  | "awaiting_submission" 
  | "ready_for_contract"
  | "validating";

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
      status: "awaiting_data",
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
      status: "awaiting_data",
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
      status: "awaiting_data",
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
              status: "awaiting_submission",
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
