import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContractCreationScreen } from "@/components/contract-flow/ContractCreationScreen";
import { Candidate, useMockCandidates } from "@/hooks/useContractFlow";
import Topbar from "@/components/dashboard/Topbar";
import DashboardDrawer from "@/components/dashboard/DashboardDrawer";
import { useDashboardDrawer } from "@/hooks/useDashboardDrawer";
import { RoleLensProvider } from "@/contexts/RoleLensContext";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";

const ContractCreation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const idsParam = searchParams.get("ids");
  const allCandidates = useMockCandidates();
  const { isOpen: isDrawerOpen, toggle: toggleDrawer } = useDashboardDrawer();

  const userData = {
    firstName: "Joe",
    lastName: "User",
    email: "joe@example.com",
    country: "United States",
    role: "admin"
  };

  const selected: Candidate[] = useMemo(() => {
    if (!idsParam) return allCandidates.filter(c => c.status === "Hired");
    const ids = idsParam.split(",").map((s) => s.trim());
    const list = allCandidates.filter((c) => ids.includes(c.id));
    return list.length > 0 ? list : allCandidates.filter(c => c.status === "Hired");
  }, [idsParam, allCandidates]);

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
      <div className="min-h-screen flex flex-col w-full bg-background">
        {/* Topbar */}
        <Topbar 
          userName={`${userData.firstName} ${userData.lastName}`}
          isDrawerOpen={isDrawerOpen}
          onDrawerToggle={toggleDrawer}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex overflow-hidden">
          {/* Dashboard Drawer */}
          <DashboardDrawer isOpen={isDrawerOpen} userData={userData} />

          {/* Contract Creation Area */}
          <AgentLayout context="Contract Drafting">
            <div className="flex-1 overflow-auto bg-gradient-to-br from-primary/[0.03] via-background to-secondary/[0.02]">
              <div className="max-w-7xl mx-auto p-8 space-y-8">
                {/* Agent Header with Back Button */}
                <div className="space-y-4">
                  <Link to="/flows/contract-flow" aria-label="Back to pipeline">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                  </Link>
                  
                  <AgentHeader 
                    title="Contract Drafting"
                    subtitle={`Let's create the employment contract for ${current.name}`}
                    placeholder="Ask Kurt for help..."
                  />
                </div>

                <ContractCreationScreen
                  candidate={current}
                  currentIndex={index}
                  totalCandidates={selected.length}
                  onNext={() => {
                    if (index < selected.length - 1) {
                      setIndex((i) => i + 1);
                    } else {
                      // Navigate to bundle creation phase
                      navigate("/flows/contract-flow?phase=bundle-creation");
                    }
                  }}
                />
              </div>
            </div>
          </AgentLayout>
        </main>
      </div>
    </RoleLensProvider>
  );
};

export default ContractCreation;
