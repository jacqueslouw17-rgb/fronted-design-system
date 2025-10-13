import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContractPreviewModal } from "@/components/dashboard/ContractPreviewModal";
import { FileText, CheckCircle, XCircle, Clock } from "lucide-react";

type ContractStatus = "draft" | "reviewing" | "approved" | "signed" | "rejected" | "expired";

interface DemoContract {
  id: string;
  title: string;
  version: string;
  country: string;
  status: ContractStatus;
  timestamp: string;
  user: string;
}

const demoContracts: DemoContract[] = [
  {
    id: "1",
    title: "Employment Agreement",
    version: "v2.1",
    country: "Norway",
    status: "draft",
    timestamp: "2024-01-15 14:30",
    user: "Admin User",
  },
  {
    id: "2",
    title: "Contractor Agreement",
    version: "v1.5",
    country: "Philippines",
    status: "reviewing",
    timestamp: "2024-01-14 09:15",
    user: "HR Manager",
  },
  {
    id: "3",
    title: "NDA Agreement",
    version: "v3.0",
    country: "Global",
    status: "approved",
    timestamp: "2024-01-12 16:45",
    user: "Legal Team",
  },
  {
    id: "4",
    title: "Service Agreement",
    version: "v2.0",
    country: "United States",
    status: "signed",
    timestamp: "2024-01-10 11:20",
    user: "CFO",
  },
];

const statusIcons = {
  draft: FileText,
  reviewing: Clock,
  approved: CheckCircle,
  signed: CheckCircle,
  rejected: XCircle,
  expired: Clock,
};

export default function ContractPreviewPattern() {
  const [selectedContract, setSelectedContract] = useState<DemoContract | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleContractClick = (contract: DemoContract) => {
    setSelectedContract(contract);
    setModalOpen(true);
  };

  const handleApprove = async (comment?: string) => {
    console.log("Approving contract with comment:", comment);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const handleReject = async (reason: string) => {
    console.log("Rejecting contract with reason:", reason);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const sampleClauses = [
    {
      id: "1",
      text: "Working hours compliance verified",
      verified: true,
      genieInsight: "Aligned with Norwegian Working Environment Act",
    },
    {
      id: "2",
      text: "Tax withholding clauses validated",
      verified: true,
      genieInsight: "Current tax tables applied correctly",
    },
    {
      id: "3",
      text: "Pension benefits included",
      verified: true,
      genieInsight: "Statutory pension requirements met",
    },
    {
      id: "4",
      text: "Insurance coverage confirmed",
      verified: true,
      genieInsight: "Occupational insurance in place",
    },
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Contract Preview & E-Sign Modal</h1>
          <p className="text-muted-foreground text-lg">
            Pattern 18 — Enable users to review, approve, and sign contracts directly within
            Fronted without leaving the product flow.
          </p>
        </div>

        {/* Pattern Description */}
        <Card>
          <CardHeader>
            <CardTitle>🎯 Purpose</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Enable users (Admin, HR, Contractor, or Legal) to review, approve, and sign contracts
              directly within Fronted without leaving the product flow. Everything from clause
              validation to e-signature happens inline — visible, traceable, and powered by Genie
              for contextual understanding.
            </p>
            <div className="bg-muted/50 p-4 rounded-md">
              <p className="font-semibold mb-2">🧠 UX Principle</p>
              <p className="text-sm">
                "Make legal clarity feel effortless." Contracts shouldn't intimidate; they should
                inform and confirm. Users must feel confident they know what they're signing, why
                it's correct, and that it's already compliant.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>✨ Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>In-line PDF/document preview with scrollable viewer</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Status badges (Draft, Reviewing, Approved, Signed, Rejected)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Genie-powered clause verification and insights</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Compliance checklist with verification indicators</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Approve/Reject workflow with comment support</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Audit trail with timestamp and user metadata</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Tooltips for clause explanations and legal references</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Locked state for signed or expired contracts</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Demo Contracts */}
        <Card>
          <CardHeader>
            <CardTitle>📄 Demo Contracts</CardTitle>
            <CardDescription>
              Click any contract to open the preview and e-sign modal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {demoContracts.map((contract) => {
                const StatusIcon = statusIcons[contract.status];
                return (
                  <Button
                    key={contract.id}
                    variant="outline"
                    className="h-auto p-4 justify-start"
                    onClick={() => handleContractClick(contract)}
                  >
                    <div className="flex items-start gap-3 w-full text-left">
                      <StatusIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">
                          {contract.title} {contract.version}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {contract.country} • {contract.status}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {contract.timestamp} • {contract.user}
                        </div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Usage Notes */}
        <Card>
          <CardHeader>
            <CardTitle>📝 Usage Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex gap-2">
              <span className="font-semibold min-w-[100px]">States:</span>
              <span>Draft, Reviewing, Approved, Signed, Rejected, Expired</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold min-w-[100px]">Actions:</span>
              <span>Approve & Sign, Reject (with reason), Add comment</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold min-w-[100px]">Locked:</span>
              <span>Signed and Expired contracts cannot be modified</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold min-w-[100px]">Tooltips:</span>
              <span>Hover over clauses (underlined) for explanations</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold min-w-[100px]">Genie:</span>
              <span>Provides compliance insights and clause verification</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      {selectedContract && (
        <ContractPreviewModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          contractTitle={selectedContract.title}
          contractVersion={selectedContract.version}
          country={selectedContract.country}
          status={selectedContract.status}
          timestamp={selectedContract.timestamp}
          user={selectedContract.user}
          clauses={sampleClauses}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}
