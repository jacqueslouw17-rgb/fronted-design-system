import { ArrowLeft, Send, DollarSign, FileText, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { GenieActionConfirmation, ActionSummaryItem } from "@/components/GenieActionConfirmation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import KurtAvatar from "@/components/KurtAvatar";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const GenieActionConfirmationsPattern = () => {
  const [payrollApproved, setPayrollApproved] = useState(false);
  const [contractApproved, setContractApproved] = useState(false);

  // Sample payroll confirmation
  const payrollSummary: ActionSummaryItem[] = [
    { label: "Total Contractors", value: "12" },
    { label: "Total Amount", value: "€52,430", highlight: true },
    { label: "Pending Approvals", value: "2" },
    { label: "Estimated FX Fee", value: "1.1%" },
    { label: "Payout Date", value: "Nov 15, 2025" },
  ];

  // Sample contract confirmation
  const contractSummary: ActionSummaryItem[] = [
    { label: "Contractor", value: "Anna Martinez" },
    { label: "Country", value: "Spain" },
    { label: "Start Date", value: "Dec 1, 2025" },
    { label: "Rate", value: "€4,500/month", highlight: true },
    { label: "Contract Type", value: "Fixed-term (12 months)" },
  ];

  // Sample compliance confirmation
  const complianceSummary: ActionSummaryItem[] = [
    { label: "Document Type", value: "Tax Certificate" },
    { label: "Contractor", value: "Theo Chen" },
    { label: "Country", value: "Singapore" },
    { label: "Valid Until", value: "Dec 31, 2026" },
    { label: "Verification", value: "Auto-verified ✓" },
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Back Button */}
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Patterns
          </Button>
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Genie Action Confirmations (HITL)
          </h1>
          <p className="text-muted-foreground mt-2">
            Human-in-the-Loop inline confirmations for high-impact automated actions
          </p>
        </div>

        {/* Pattern Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Pattern Behavior
            </CardTitle>
            <CardDescription>
              Preserves human control and auditability within Genie's automation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Core Principle</h3>
              <p className="text-sm text-muted-foreground">
                "Genie suggests, humans decide." — Every automation remains reviewable, explainable, and reversible.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Workflow</h3>
              <ol className="space-y-1 text-sm text-muted-foreground list-decimal list-inside">
                <li>Genie proposes an action</li>
                <li>Confirmation card appears inline with summary</li>
                <li>User chooses: Approve / Edit / Cancel</li>
                <li>Genie confirms acknowledgment</li>
                <li>Action logs in audit trail</li>
                <li>Trust gauge updates</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Demo Scenarios */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Interactive Examples</h2>

          {/* Payroll Scenario */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <KurtAvatar size="sm" />
              <div className="flex-1 space-y-3">
                <div className="bg-muted rounded-lg p-4 max-w-2xl">
                  <p className="text-sm">
                    Payroll for October is ready. Total: €52,430 across 12 contractors. 
                    Proceed to payout?
                  </p>
                </div>

                {!payrollApproved && (
                  <GenieActionConfirmation
                    title="Review Payroll Summary"
                    description="Review details before processing payout"
                    summaryItems={payrollSummary}
                    actionType="payroll"
                    onApprove={() => setPayrollApproved(true)}
                    onEdit={() => console.log("Edit payroll")}
                    onCancel={() => console.log("Cancel payroll")}
                    editContent={
                      <div className="space-y-4">
                        <div>
                          <Label>Total Amount</Label>
                          <Input defaultValue="€52,430" />
                        </div>
                        <div>
                          <Label>Payout Date</Label>
                          <Input type="date" defaultValue="2025-11-15" />
                        </div>
                        <Button className="w-full">Save Changes</Button>
                      </div>
                    }
                  />
                )}

                {payrollApproved && (
                  <div className="bg-muted rounded-lg p-4 max-w-2xl">
                    <p className="text-sm">
                      Confirmed. Payroll sent for processing. You'll see it reflected in the 
                      ledger shortly. ✓
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contract Scenario */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <KurtAvatar size="sm" />
              <div className="flex-1 space-y-3">
                <div className="bg-muted rounded-lg p-4 max-w-2xl">
                  <p className="text-sm">
                    I've drafted the contract for Anna Martinez. Ready for you to review 
                    before sending for e-signature.
                  </p>
                </div>

                {!contractApproved && (
                  <GenieActionConfirmation
                    title="Review Contract"
                    description="Verify contractor details before sending"
                    summaryItems={contractSummary}
                    actionType="contract"
                    onApprove={() => setContractApproved(true)}
                    onEdit={() => console.log("Edit contract")}
                    onCancel={() => console.log("Cancel contract")}
                  />
                )}

                {contractApproved && (
                  <div className="bg-muted rounded-lg p-4 max-w-2xl">
                    <p className="text-sm">
                      Perfect! Contract sent to Anna for e-signature. She'll receive an email 
                      notification shortly. ✓
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Compliance Scenario */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <KurtAvatar size="sm" />
              <div className="flex-1 space-y-3">
                <div className="bg-muted rounded-lg p-4 max-w-2xl">
                  <p className="text-sm">
                    Theo's tax certificate has been verified. Should I archive this in the 
                    compliance vault?
                  </p>
                </div>

                <GenieActionConfirmation
                  title="Archive Compliance Document"
                  description="Confirm document verification and archival"
                  summaryItems={complianceSummary}
                  actionType="compliance"
                  onApprove={() => console.log("Archive document")}
                  onCancel={() => console.log("Cancel archive")}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Common Use Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-medium">Payroll Processing</h3>
                  <p className="text-sm text-muted-foreground">
                    Before executing payouts or FX transactions
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium">Contract Sending</h3>
                  <p className="text-sm text-muted-foreground">
                    Before sending final contracts to contractors
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <h3 className="font-medium">Compliance Actions</h3>
                  <p className="text-sm text-muted-foreground">
                    Before archiving verified documents or finalizing audits
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Send className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h3 className="font-medium">Support Escalations</h3>
                  <p className="text-sm text-muted-foreground">
                    Before escalating Tier-2 support tickets
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GenieActionConfirmationsPattern;
