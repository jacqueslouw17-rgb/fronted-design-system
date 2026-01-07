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
import { useContractorStore } from "@/hooks/useContractorStore";

type PipelineContractor = {
  id: string;
  name: string;
  role: string;
  country: string;
  countryFlag?: string;
  salary?: string;
  email?: string;
  employmentType?: "contractor" | "employee";
};

const COUNTRY_CODE_BY_NAME: Record<string, string> = {
  Philippines: "PH",
  Norway: "NO",
  Sweden: "SE",
  Denmark: "DK",
  India: "IN",
  Kosovo: "XK",
  Singapore: "SG",
  Spain: "ES",
  Romania: "RO",
};

const inferCountryCode = (country: string) => COUNTRY_CODE_BY_NAME[country] ?? "US";

const inferCurrencyFromSalary = (salary?: string) => {
  if (!salary) return "USD";
  if (salary.includes("₱")) return "PHP";
  const match = salary.match(/\b[A-Z]{3}\b/);
  if (match?.[0]) return match[0];
  return "USD";
};

const contractorToCandidate = (c: PipelineContractor): Candidate => ({
  id: c.id,
  name: c.name,
  role: c.role,
  country: c.country,
  countryCode: inferCountryCode(c.country),
  flag: c.countryFlag ?? "",
  salary: c.salary ?? "",
  startDate: "",
  noticePeriod: "30 days",
  pto: "15 days/year",
  currency: inferCurrencyFromSalary(c.salary),
  signingPortal: "",
  status: "Hired",
  email: c.email,
  employmentType: c.employmentType,
});

// Additional display candidates that appear in PipelineView
const displayCandidates: Candidate[] = [
  {
    id: "display-3",
    name: "Elena Popescu",
    role: "Backend Developer",
    country: "Romania",
    countryCode: "RO",
    flag: "🇷🇴",
    salary: "RON 18,000/mo",
    startDate: "",
    noticePeriod: "30 days",
    pto: "21 days/year",
    currency: "RON",
    signingPortal: "DocuSign",
    status: "Hired",
    email: "elena.popescu@example.com",
    employmentType: "contractor",
  },
];

const ContractCreation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const idsParam = searchParams.get("ids");
  const mockCandidates = useMockCandidates();
  // Combine mock candidates with display candidates for lookup
  const allCandidates = [...mockCandidates, ...displayCandidates];
  const { isOpen: isDrawerOpen, toggle: toggleDrawer } = useDashboardDrawer();

  const userData = {
    firstName: "Joe",
    lastName: "User",
    email: "joe@example.com",
    country: "United States",
    role: "admin"
  };

  const selected: Candidate[] = useMemo(() => {
    if (!idsParam) return mockCandidates.filter(c => c.status === "Hired");
    const ids = idsParam.split(",").map((s) => s.trim());
    const list = allCandidates.filter((c) => ids.includes(c.id));
    // Only return the specific candidates requested, don't fall back to all
    return list.length > 0 ? list : mockCandidates.filter(c => c.status === "Hired");
  }, [idsParam, allCandidates, mockCandidates]);

  const [index, setIndex] = useState(0);
  const current = selected[index] ?? selected[0];

  useEffect(() => {
    if (current) {
      document.title = `Contract Drafting – ${current.name}`;
    } else {
      document.title = "Contract Drafting";
    }
  }, [current]);

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
              {/* Logo and Close Button */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4">
                <img 
                  src={frontedLogo} 
                  alt="Fronted" 
                  className="h-7 sm:h-8 w-auto cursor-pointer"
                  onClick={() => navigate("/flows/contract-flow-multi-company")}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => navigate("/flows/contract-flow-multi-company")}
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
                      // Skip bundle-creation and go directly to drafting phase
                      navigate("/flows/contract-flow?phase=drafting");
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

export default ContractCreation;
