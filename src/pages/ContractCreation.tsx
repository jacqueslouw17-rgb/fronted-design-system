import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContractCreationScreen } from "@/components/contract-flow/ContractCreationScreen";
import { Candidate, useMockCandidates } from "@/hooks/useContractFlow";

const ContractCreation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const idsParam = searchParams.get("ids");
  const allCandidates = useMockCandidates();

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
    <div className="min-h-screen bg-background">
      <header className="max-w-7xl mx-auto px-6 pt-4 pb-2">
        <Link to="/flows/contract-flow" aria-label="Back to pipeline">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </header>

      <main>
        <ContractCreationScreen
          candidate={current}
          currentIndex={index}
          totalCandidates={selected.length}
          onNext={() => {
            if (index < selected.length - 1) {
              setIndex((i) => i + 1);
            } else {
              navigate("/flows/contract-flow");
            }
          }}
        />
      </main>
    </div>
  );
};

export default ContractCreation;
