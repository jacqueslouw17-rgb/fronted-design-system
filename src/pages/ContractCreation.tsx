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
  const returnTo = searchParams.get("returnTo");
  const companyParam = searchParams.get("company");
  const mockCandidates = useMockCandidates();
  const contractorsFromStore = useContractorStore((s) => s.contractors) as unknown as PipelineContractor[];

  // Only override navigation when the launching flow explicitly asks for it.
  // (Keeps existing default behavior unchanged.)
  const closePath =
    returnTo === "f1v5"
      ? "/flows/fronted-admin-dashboard-v5-clone"
      : returnTo === "f1v4"
      ? "/flows/fronted-admin-dashboard-v4-clone"
      : "/flows/contract-flow-multi-company";

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
    // When launched without ids (e.g. demo flows), keep existing default behavior.
    if (!idsParam) return mockCandidates.filter((c) => c.status === "Hired");

    const ids = idsParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const localStorageCandidates: Candidate[] = (() => {
      try {
        const raw = localStorage.getItem("adminflow-company-contractors");
        if (!raw) {
          console.log("[ContractCreation] No localStorage data found");
          return [];
        }
        const parsed = JSON.parse(raw) as Record<string, any[]>;
        const flattened = Object.values(parsed || {}).flat();
        console.log("[ContractCreation] localStorage candidates:", flattened.map((c: any) => ({ id: c.id, name: c.name })));
        return flattened
          .filter(Boolean)
          .map((c: any) =>
            contractorToCandidate({
              id: c.id,
              name: c.name,
              role: c.role,
              country: c.country,
              countryFlag: c.countryFlag ?? c.flag,
              salary: c.salary,
              email: c.email,
              employmentType: c.employmentType,
            })
          );
      } catch (e) {
        console.error("[ContractCreation] localStorage parse error:", e);
        return [];
      }
    })();

    const lookup = new Map<string, Candidate>();
    for (const c of allCandidates) lookup.set(c.id, c);
    for (const c of contractorsFromStore.map(contractorToCandidate)) lookup.set(c.id, c);
    for (const c of localStorageCandidates) lookup.set(c.id, c);

    console.log("[ContractCreation] Looking for ids:", ids);
    console.log("[ContractCreation] Lookup map keys:", Array.from(lookup.keys()));
    
    const result = ids.map((id) => lookup.get(id)).filter(Boolean) as Candidate[];
    console.log("[ContractCreation] Found candidates:", result.map(c => ({ id: c.id, name: c.name })));
    
    return result;
  }, [idsParam, mockCandidates, allCandidates, contractorsFromStore]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Reset the paging when a new ids set is requested.
    setIndex(0);
  }, [idsParam]);

  const current = selected[index] ?? selected[0];

  useEffect(() => {
    if (current) {
      document.title = `Contract Drafting – ${current.name}`;
    } else {
      document.title = "Contract Drafting";
    }
  }, [current]);

  if (!current) {
    return (
      <RoleLensProvider initialRole="admin">
        <div className="min-h-screen flex w-full bg-background">
          <DashboardDrawer isOpen={isDrawerOpen} userData={userData} />
          <AgentLayout context="Contract Drafting">
            <div className="flex-1 overflow-auto bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06] relative">
              <div className="relative z-10">
                <div className="flex items-center justify-between px-6 pt-6 pb-4">
                  <img
                    src={frontedLogo}
                    alt="Fronted"
                    className="h-7 sm:h-8 w-auto cursor-pointer"
                      onClick={() => navigate(closePath)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                      onClick={() => navigate(closePath)}
                    aria-label="Close and return to pipeline"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="px-6 pb-8">
                  <div className="max-w-xl">
                    <h1 className="text-xl font-semibold text-foreground">
                      Candidate not found
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                      We couldn’t find the candidate for this Draft Contract action. Please go back
                      and try again.
                    </p>
                    <div className="mt-4">
                      <Button onClick={() => navigate(closePath)}>
                        Back to pipeline
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AgentLayout>
        </div>
      </RoleLensProvider>
    );
  }

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
                  onClick={() => navigate(closePath)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => navigate(closePath)}
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
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    if (index < selected.length - 1) {
                      setIndex((i) => i + 1);
                    } else {
                      // Navigate back to the appropriate flow
                      if (returnTo === 'flow-1.1') {
                        // Return to Flow 1.1 with company context and candidate IDs preserved
                        const candidateIds = selected.map(c => c.id).join(',');
                        const params = new URLSearchParams({ 
                          phase: 'drafting',
                          ids: candidateIds,
                          ...(companyParam && { company: companyParam })
                        }).toString();
                        navigate(`/flows/contract-flow-multi-company?${params}`);
                      } else if (returnTo === 'f1v5') {
                        // Return to Flow 1 v5 clone with company context and candidate IDs preserved
                        const candidateIds = selected.map(c => c.id).join(',');
                        const params = new URLSearchParams({
                          phase: 'drafting',
                          ids: candidateIds,
                          ...(companyParam && { company: companyParam }),
                        }).toString();
                        navigate(`/flows/fronted-admin-dashboard-v5-clone?${params}`);
                      } else if (returnTo === 'f1v4') {
                        // Return to Flow 1 v4 clone with company context and candidate IDs preserved
                        const candidateIds = selected.map(c => c.id).join(',');
                        const params = new URLSearchParams({
                          phase: 'drafting',
                          ids: candidateIds,
                          ...(companyParam && { company: companyParam }),
                        }).toString();
                        navigate(`/flows/fronted-admin-dashboard-v4-clone?${params}`);
                      } else {
                        // Default: go to contract-flow drafting phase
                        navigate("/flows/contract-flow?phase=drafting");
                      }
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
