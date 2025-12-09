/**
 * V4-specific Contract Creation Page
 * 
 * This is a v4 clone of ContractCreation.tsx that navigates back to 
 * Flow 1 - Fronted Admin Dashboard v4 (Tracker tab) on close.
 * 
 * Only used by Flow 1 v4 to prevent navigation leakage into v3.
 */

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContractCreationScreen } from "@/components/contract-flow/ContractCreationScreen";
import { Candidate, useMockCandidates } from "@/hooks/useContractFlow";
import DashboardDrawer from "@/components/dashboard/DashboardDrawer";
import { useDashboardDrawer } from "@/hooks/useDashboardDrawer";
import { RoleLensProvider } from "@/contexts/RoleLensContext";
import { AgentLayout } from "@/components/agent/AgentLayout";
import frontedLogo from "@/assets/fronted-logo.png";

// V4-specific company contractors data (imported from v4 dashboard or passed via state)
const V4_MOCK_CANDIDATES: Candidate[] = [
  {
    id: "c1-1",
    name: "Maria Santos",
    email: "maria.santos@email.com",
    role: "Senior Developer",
    country: "Philippines",
    countryCode: "PH",
    flag: "🇵🇭",
    currency: "PHP",
    startDate: "2025-02-01",
    salary: "PHP 120,000/mo",
    noticePeriod: "30 days",
    pto: "15 days",
    signingPortal: "DocuSign",
    employmentType: "contractor",
    status: "Hired"
  },
  {
    id: "c1-2",
    name: "Liam Chen",
    email: "liam.chen@email.com",
    role: "Frontend Developer",
    country: "Singapore",
    countryCode: "SG",
    flag: "🇸🇬",
    currency: "SGD",
    startDate: "2025-02-01",
    salary: "SGD 7,500/mo",
    noticePeriod: "30 days",
    pto: "14 days",
    signingPortal: "DocuSign",
    employmentType: "contractor",
    status: "Hired"
  },
  {
    id: "c1-3",
    name: "Sofia Rodriguez",
    email: "sofia.rodriguez@email.com",
    role: "Marketing Manager",
    country: "Mexico",
    countryCode: "MX",
    flag: "🇲🇽",
    currency: "MXN",
    startDate: "2025-02-01",
    salary: "MXN 45,000/mo",
    noticePeriod: "15 days",
    pto: "12 days",
    signingPortal: "DocuSign",
    employmentType: "employee",
    status: "Hired"
  },
  {
    id: "c2-1",
    name: "Ahmed Hassan",
    email: "ahmed.hassan@email.com",
    role: "Backend Developer",
    country: "Egypt",
    countryCode: "EG",
    flag: "🇪🇬",
    currency: "EGP",
    startDate: "2025-02-01",
    salary: "EGP 45,000/mo",
    noticePeriod: "30 days",
    pto: "21 days",
    signingPortal: "DocuSign",
    employmentType: "contractor",
    status: "Hired"
  },
  {
    id: "c5-2",
    name: "Pierre Dubois",
    email: "pierre.dubois@email.com",
    role: "Data Analyst",
    country: "France",
    countryCode: "FR",
    flag: "🇫🇷",
    currency: "EUR",
    startDate: "2025-02-01",
    salary: "EUR 4,900/mo",
    noticePeriod: "60 days",
    pto: "25 days",
    signingPortal: "DocuSign",
    employmentType: "contractor",
    status: "Hired"
  }
];

const V4_ContractCreation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const idsParam = searchParams.get("ids");
  const companyParam = searchParams.get("company");
  const { isOpen: isDrawerOpen, toggle: toggleDrawer } = useDashboardDrawer();

  const userData = {
    firstName: "Joe",
    lastName: "User",
    email: "joe@example.com",
    country: "United States",
    role: "admin"
  };

  // Get candidates from v4 mock data or use the hook as fallback
  const allCandidates = useMockCandidates();
  const v4Candidates = [...V4_MOCK_CANDIDATES, ...allCandidates];

  const selected: Candidate[] = useMemo(() => {
    if (!idsParam) return v4Candidates.filter(c => c.status === "Hired");
    const ids = idsParam.split(",").map((s) => s.trim());
    const list = v4Candidates.filter((c) => ids.includes(c.id));
    return list.length > 0 ? list : v4Candidates.filter(c => c.status === "Hired");
  }, [idsParam, v4Candidates]);

  const [index, setIndex] = useState(0);
  const current = selected[index] ?? selected[0];

  useEffect(() => {
    if (current) {
      document.title = `Contract Drafting – ${current.name}`;
    } else {
      document.title = "Contract Drafting";
    }
  }, [current]);

  // V4-specific: Navigate back to v4 dashboard (Tracker tab)
  const handleClose = () => {
    // Preserve company selection if passed
    if (companyParam) {
      navigate(`/flows/fronted-admin-dashboard-v4?company=${companyParam}`);
    } else {
      navigate("/flows/fronted-admin-dashboard-v4");
    }
  };

  // V4-specific: Navigate to v4 bundle creation (or back to v4 tracker with status update)
  const handleComplete = () => {
    // For v4, navigate to v4-specific bundle creation route
    const idsStr = selected.map(c => c.id).join(',');
    if (companyParam) {
      navigate(`/flows/fronted-admin-dashboard-v4/bundle-creation?ids=${idsStr}&company=${companyParam}`);
    } else {
      navigate(`/flows/fronted-admin-dashboard-v4/bundle-creation?ids=${idsStr}`);
    }
  };

  if (!current) return null;

  return (
    <RoleLensProvider initialRole="admin">
      <div className="min-h-screen flex w-full bg-background">
        {/* Dashboard Drawer */}
        <DashboardDrawer isOpen={isDrawerOpen} userData={userData} />

        {/* Contract Creation Area */}
        <AgentLayout context="Contract Drafting">
          <div className="flex-1 overflow-auto bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06] relative">
            {/* Static background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-secondary/[0.02] to-accent/[0.03]" />
              <div
                className="absolute -top-20 -left-24 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-10"
                style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--secondary) / 0.05))' }}
              />
              <div
                className="absolute -bottom-24 -right-28 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-8"
                style={{ background: 'linear-gradient(225deg, hsl(var(--accent) / 0.06), hsl(var(--primary) / 0.04))' }}
              />
            </div>
            <div className="relative z-10">
              {/* Logo and Close Button - navigates back to v4 */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4">
                <img 
                  src={frontedLogo} 
                  alt="Fronted" 
                  className="h-7 sm:h-8 w-auto cursor-pointer"
                  onClick={handleClose}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleClose}
                  aria-label="Close and return to pipeline"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <ContractCreationScreen
                candidate={current}
                currentIndex={index}
                totalCandidates={selected.length}
                onPrevious={() => {
                  if (index > 0) {
                    setIndex((i) => i - 1);
                  }
                }}
                onNext={() => {
                  if (index < selected.length - 1) {
                    setIndex((i) => i + 1);
                  } else {
                    // Navigate to v4 bundle creation phase
                    handleComplete();
                  }
                }}
              />
            </div>
          </div>
        </AgentLayout>
      </div>
    </RoleLensProvider>
  );
};

export default V4_ContractCreation;
