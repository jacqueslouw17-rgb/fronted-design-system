import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ComplianceChecklistBlock, { ComplianceStatus } from "@/components/ComplianceChecklistBlock";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CountryComplianceModule {
  country: string;
  flag: string;
  totalItems: number;
  completedItems: number;
  items: Array<{
    id: string;
    label: string;
    status: ComplianceStatus;
    tooltipText?: string;
    genieHint?: string;
    verificationHistory?: Array<{ date: string; action: string; verifiedBy: string }>;
    tags?: string[];
  }>;
}

const ComplianceChecklistPattern = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [modules, setModules] = useState<CountryComplianceModule[]>([
    {
      country: "Norway",
      flag: "🇳🇴",
      totalItems: 5,
      completedItems: 4,
      items: [
        {
          id: "no-tax-id",
          label: "Tax ID Verified",
          status: "passed",
          tooltipText: "Required for tax compliance in Norway under the Tax Administration Act",
          genieHint: "Last verified 2 days ago",
          verificationHistory: [
            { date: "Oct 7, 2024 10:42 AM", action: "Tax ID verified", verifiedBy: "Genie AI" },
            { date: "Sep 15, 2024 3:20 PM", action: "Initial verification", verifiedBy: "Admin User" },
          ],
          tags: ["Auto-verified"],
        },
        {
          id: "no-contract",
          label: "Employment Contract Approved",
          status: "passed",
          tooltipText: "Contract must comply with Norwegian Working Environment Act",
          genieHint: "Clauses verified against 2024 labor law",
          verificationHistory: [
            { date: "Oct 5, 2024 2:15 PM", action: "Contract approved", verifiedBy: "Legal Team" },
          ],
          tags: ["Country-specific"],
        },
        {
          id: "no-insurance",
          label: "Insurance Certificate Expired",
          status: "breach",
          tooltipText: "Insurance coverage is mandatory for all contractors in Norway",
          genieHint: "Would you like me to request a new upload from the contractor?",
          verificationHistory: [
            { date: "Aug 20, 2024", action: "Insurance certificate uploaded", verifiedBy: "Contractor" },
            { date: "Aug 21, 2024", action: "Verified and approved", verifiedBy: "Genie AI" },
          ],
          tags: ["Action required"],
        },
        {
          id: "no-work-permit",
          label: "Work Permit Verified",
          status: "passed",
          tooltipText: "Work authorization required for non-EU contractors",
          genieHint: "Valid until Dec 2025",
          verificationHistory: [
            { date: "Sep 10, 2024", action: "Work permit verified", verifiedBy: "HR Team" },
          ],
        },
        {
          id: "no-pension",
          label: "Pension Scheme Enrollment",
          status: "pending",
          tooltipText: "Mandatory pension contribution for Norwegian contractors",
          genieHint: "Awaiting payroll submission",
          tags: ["Pending"],
        },
      ],
    },
    {
      country: "Philippines",
      flag: "🇵🇭",
      totalItems: 4,
      completedItems: 4,
      items: [
        {
          id: "ph-tin",
          label: "TIN (Tax Identification Number) Verified",
          status: "passed",
          tooltipText: "Required by Bureau of Internal Revenue (BIR)",
          genieHint: "Verified 5 days ago",
          verificationHistory: [
            { date: "Oct 2, 2024", action: "TIN verified", verifiedBy: "Genie AI" },
          ],
          tags: ["Auto-verified"],
        },
        {
          id: "ph-sss",
          label: "SSS Contribution Active",
          status: "passed",
          tooltipText: "Social Security System registration is mandatory",
          genieHint: "Contribution rate aligned with 2024 schedule",
          verificationHistory: [
            { date: "Sep 28, 2024", action: "SSS verified", verifiedBy: "Payroll System" },
          ],
        },
        {
          id: "ph-philhealth",
          label: "PhilHealth Enrollment",
          status: "passed",
          tooltipText: "National Health Insurance Program requirement",
          genieHint: "Active enrollment confirmed",
          tags: ["Health coverage"],
        },
        {
          id: "ph-contract",
          label: "Contract Clauses Aligned with PH Labor Law",
          status: "passed",
          tooltipText: "Must comply with Philippine Labor Code",
          genieHint: "Verified by Genie against Labor Code provisions",
          verificationHistory: [
            { date: "Oct 1, 2024", action: "Contract clauses verified", verifiedBy: "Genie AI" },
          ],
          tags: ["Legal compliance"],
        },
      ],
    },
    {
      country: "United States",
      flag: "🇺🇸",
      totalItems: 5,
      completedItems: 2,
      items: [
        {
          id: "us-w9",
          label: "W-9 Form Submitted",
          status: "passed",
          tooltipText: "Required for US tax reporting",
          genieHint: "Received and verified",
          tags: ["Tax compliance"],
        },
        {
          id: "us-ein",
          label: "EIN Verification",
          status: "processing",
          tooltipText: "Employer Identification Number verification in progress",
          genieHint: "Awaiting IRS confirmation",
          tags: ["Processing"],
        },
        {
          id: "us-contract",
          label: "Independent Contractor Agreement",
          status: "pending",
          tooltipText: "Must distinguish contractor from employee per IRS guidelines",
          genieHint: "Draft ready for review",
        },
        {
          id: "us-insurance",
          label: "Liability Insurance",
          status: "na",
          tooltipText: "Not required for this contractor type",
          genieHint: "Optional for this engagement",
        },
        {
          id: "us-state-reg",
          label: "State Business Registration",
          status: "override",
          tooltipText: "Required in certain states",
          genieHint: "Manual override applied by Admin",
          verificationHistory: [
            { date: "Oct 3, 2024", action: "Manual override approved", verifiedBy: "Admin User" },
          ],
          tags: ["Manual override"],
        },
      ],
    },
  ]);

  const handleUpload = (countryIndex: number, itemId: string) => {
    toast({
      title: "Upload requested",
      description: "Document upload dialog would open here",
    });
  };

  const handleReVerify = (countryIndex: number, itemId: string) => {
    toast({
      title: "Re-verification initiated",
      description: "Genie is checking the latest compliance status",
    });
  };

  const handleViewDocs = (countryIndex: number, itemId: string) => {
    toast({
      title: "Opening documents",
      description: "Document viewer would open here",
    });
  };

  const calculateOverallCompletion = () => {
    const total = modules.reduce((sum, m) => sum + m.totalItems, 0);
    const completed = modules.reduce((sum, m) => sum + m.completedItems, 0);
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Back Button */}
        <Link to="/">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Overview
          </Button>
        </Link>
        
        {/* Header */}
        <div>
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-4xl font-bold">Compliance Checklist Blocks</h1>
          </div>
          <p className="text-muted-foreground ml-14">
            Modular, visual compliance interface ensuring every process is traceable and auditable
          </p>
        </div>

        {/* Overall Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Compliance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{calculateOverallCompletion()}%</span>
                <span className="text-sm text-muted-foreground">
                  {modules.reduce((sum, m) => sum + m.completedItems, 0)} of{" "}
                  {modules.reduce((sum, m) => sum + m.totalItems, 0)} items verified
                </span>
              </div>
              <Progress value={calculateOverallCompletion()} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Country Modules */}
        {modules.map((module, moduleIndex) => (
          <div key={module.country} className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{module.flag}</span>
                    <CardTitle>{module.country} Compliance</CardTitle>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {module.completedItems} of {module.totalItems} verified
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round((module.completedItems / module.totalItems) * 100)}% complete
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Progress
                  value={(module.completedItems / module.totalItems) * 100}
                  className="h-2 mb-4"
                />
              </CardContent>
            </Card>

            <div className="space-y-3">
              {module.items.map((item) => (
                <ComplianceChecklistBlock
                  key={item.id}
                  label={item.label}
                  status={item.status}
                  tooltipText={item.tooltipText}
                  genieHint={item.genieHint}
                  verificationHistory={item.verificationHistory}
                  tags={item.tags}
                  onUpload={() => handleUpload(moduleIndex, item.id)}
                  onReVerify={() => handleReVerify(moduleIndex, item.id)}
                  onViewDocs={() => handleViewDocs(moduleIndex, item.id)}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Pattern Information */}
        <Card>
          <CardHeader>
            <CardTitle>Pattern Features</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Status Types</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li><strong>Passed:</strong> Completed and verified</li>
                  <li><strong>Pending:</strong> Awaiting action</li>
                  <li><strong>Processing:</strong> Validation in progress</li>
                  <li><strong>Breach:</strong> Failed or expired</li>
                  <li><strong>N/A:</strong> Not applicable</li>
                  <li><strong>Override:</strong> Manual confirmation</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">Key Features</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Country-specific compliance modules</li>
                  <li>Genie AI-powered validation hints</li>
                  <li>Verification history timeline</li>
                  <li>Document upload and viewing</li>
                  <li>Progress tracking per country</li>
                  <li>Contextual tooltips and explanations</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComplianceChecklistPattern;
