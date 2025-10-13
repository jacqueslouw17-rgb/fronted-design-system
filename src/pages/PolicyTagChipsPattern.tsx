import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Clock,
  Calendar,
  FileText,
  Shield,
  AlertCircle,
  CheckCircle2,
  Info,
  MoreHorizontal,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PolicyChip {
  id: string;
  label: string;
  value: string;
  description: string;
  status: "active" | "pending" | "violated" | "synced";
  isEditable: boolean;
  lastEdited: string;
  editedBy: string;
  auditNote?: string;
}

const sampleChips: PolicyChip[] = [
  {
    id: "1",
    label: "Max Leave",
    value: "20 days",
    description: "Maximum annual leave days per employee",
    status: "active",
    isEditable: true,
    lastEdited: "2024-01-15",
    editedBy: "HR Manager",
    auditNote: "Updated from 18 to 20 days per board decision",
  },
  {
    id: "2",
    label: "Invoice Label",
    value: "EU-2025",
    description: "Current invoice labeling format for European region",
    status: "synced",
    isEditable: true,
    lastEdited: "2024-01-01",
    editedBy: "Finance Team",
  },
  {
    id: "3",
    label: "Cutoff Edit Window",
    value: "12 hrs",
    description: "Time window before payroll cutoff where edits are restricted",
    status: "active",
    isEditable: true,
    lastEdited: "2024-01-10",
    editedBy: "Payroll Admin",
  },
  {
    id: "4",
    label: "Doc Expiry Reminder",
    value: "ON",
    description: "Automated reminders for expiring compliance documents",
    status: "synced",
    isEditable: true,
    lastEdited: "2024-01-12",
    editedBy: "Compliance Team",
  },
  {
    id: "5",
    label: "Tax Docs Required",
    value: "Before Payment",
    description: "Tax documentation must be verified before processing payment",
    status: "violated",
    isEditable: false,
    lastEdited: "2024-01-14",
    editedBy: "System",
    auditNote: "3 contractors missing required tax forms",
  },
  {
    id: "6",
    label: "Approval Threshold",
    value: "$5,000",
    description: "Payment amount requiring manager approval",
    status: "pending",
    isEditable: true,
    lastEdited: "2024-01-13",
    editedBy: "CFO",
    auditNote: "Awaiting board approval for increase to $10,000",
  },
];

const PolicyTagChipsPattern = () => {
  const { toast } = useToast();
  const [selectedChip, setSelectedChip] = useState<PolicyChip | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [chips, setChips] = useState<PolicyChip[]>(sampleChips);
  const [showAllChips, setShowAllChips] = useState<Record<string, boolean>>({});

  const handleChipClick = (chip: PolicyChip) => {
    setSelectedChip(chip);
    setIsDrawerOpen(true);
  };

  const handleSaveRule = () => {
    if (selectedChip) {
      setChips(chips.map(c => c.id === selectedChip.id ? selectedChip : c));
      toast({
        title: "Policy Updated",
        description: `${selectedChip.label} has been updated successfully.`,
      });
      setIsDrawerOpen(false);
    }
  };

  const getStatusIndicator = (status: PolicyChip["status"]) => {
    const indicators = {
      active: <div className="w-2 h-2 rounded-full bg-green-500" />,
      pending: <div className="w-2 h-2 rounded-full bg-amber-500" />,
      violated: <div className="w-2 h-2 rounded-full bg-red-500" />,
      synced: <div className="w-2 h-2 rounded-full bg-green-500 opacity-50" />,
    };
    return indicators[status];
  };

  const getStatusDescription = (status: PolicyChip["status"]) => {
    const descriptions = {
      active: "Active and enforced",
      pending: "Awaiting approval",
      violated: "Policy violation detected",
      synced: "Verified and synced",
    };
    return descriptions[status];
  };

  const PolicyTagChip = ({ chip }: { chip: PolicyChip }) => {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={`cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md px-3 py-1.5 flex items-center gap-2 ${
                chip.status === "violated" ? "border-red-500/30 bg-red-500/5" :
                chip.status === "pending" ? "border-amber-500/30 bg-amber-500/5" :
                "border-border bg-muted/50"
              }`}
              onClick={() => handleChipClick(chip)}
            >
              {getStatusIndicator(chip.status)}
              <span className="text-xs font-medium">{chip.label}: {chip.value}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p className="text-sm font-medium">{chip.description}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Status: {getStatusDescription(chip.status)}
            </p>
            <p className="text-xs text-muted-foreground">
              Last edited by {chip.editedBy} on {chip.lastEdited}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const ChipGroup = ({ chips: groupChips, maxVisible = 3, groupName }: { chips: PolicyChip[], maxVisible?: number, groupName: string }) => {
    const visibleChips = showAllChips[groupName] ? groupChips : groupChips.slice(0, maxVisible);
    const hiddenCount = groupChips.length - maxVisible;

    return (
      <div className="flex flex-wrap items-center gap-2">
        {visibleChips.map((chip) => (
          <PolicyTagChip key={chip.id} chip={chip} />
        ))}
        {!showAllChips[groupName] && hiddenCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setShowAllChips({ ...showAllChips, [groupName]: true })}
          >
            +{hiddenCount} more
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 z-10"
        onClick={() => (window.location.href = "/")}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      {/* Header */}
      <header className="border-b border-border bg-card pl-16 pr-8 py-6">
        <h1 className="text-2xl font-bold text-foreground">
          Policy Tag Chips (Mini-Rules)
        </h1>
        <p className="text-muted-foreground mt-1">
          Lightweight, always-visible rule indicators with Genie Drawer integration
        </p>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-12 space-y-8">
        {/* Status Legend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm">Active & Enforced</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-sm">Pending Approval</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-sm">Violation Detected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 opacity-50" />
                <span className="text-sm">Verified & Synced</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Example Contexts */}
        <div className="space-y-6">
          {/* Employee Policy Pack */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Employee Policy Pack</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ChipGroup chips={[chips[0], chips[3]]} groupName="employee" />
            </CardContent>
          </Card>

          {/* Payroll Preparation */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Payroll Preparation</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ChipGroup chips={[chips[2], chips[5]]} groupName="payroll" />
            </CardContent>
          </Card>

          {/* Compliance Checklist */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Compliance Checklist</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ChipGroup chips={[chips[3], chips[4]]} groupName="compliance" />
            </CardContent>
          </Card>

          {/* Invoice Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Invoice Management</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ChipGroup chips={[chips[1], chips[5]]} groupName="invoice" />
            </CardContent>
          </Card>

          {/* All Policies with Grouping Demo */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Active Policies</CardTitle>
                <Badge variant="secondary">{chips.length} total</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ChipGroup chips={chips} maxVisible={3} groupName="all" />
            </CardContent>
          </Card>
        </div>

        {/* Audit Trail Example */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Recent Policy Changes (Audit Trail)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {chips.filter(c => c.auditNote).map(chip => (
                <div key={chip.id} className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{chip.label}</p>
                      <p className="text-xs text-muted-foreground">{chip.auditNote}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIndicator(chip.status)}
                      <span className="text-xs text-muted-foreground">{chip.lastEdited}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Modified by {chip.editedBy}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pattern Features */}
        <Card>
          <CardHeader>
            <CardTitle>Pattern Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
                <span>Status indicators (🟢 active / 🟠 pending / 🔴 violated / 🟢 synced)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
                <span>Hover to see rule summary and status description</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
                <span>Click to open Genie Drawer for editing and full context</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
                <span>Grouping with "+ N more" indicator for clean UI</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
                <span>Audit trail logging for compliance and traceability</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
                <span>Contextual placement beside relevant dashboard elements</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>

      {/* Rule Drawer (Genie Integration) */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="w-full sm:max-w-[440px]">
          {selectedChip && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <SheetTitle>{selectedChip.label}</SheetTitle>
                  {getStatusIndicator(selectedChip.status)}
                </div>
                <SheetDescription>
                  {getStatusDescription(selectedChip.status)} • {selectedChip.description}
                </SheetDescription>
              </SheetHeader>

              <Separator className="my-4" />

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="policyValue">Policy Value</Label>
                  <Input
                    id="policyValue"
                    value={selectedChip.value}
                    onChange={(e) =>
                      setSelectedChip({ ...selectedChip, value: e.target.value })
                    }
                    disabled={!selectedChip.isEditable}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="policyDescription">Description</Label>
                  <textarea
                    id="policyDescription"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedChip.description}
                    onChange={(e) =>
                      setSelectedChip({ ...selectedChip, description: e.target.value })
                    }
                    disabled={!selectedChip.isEditable}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="policyEditable">Allow Editing</Label>
                  <Switch
                    id="policyEditable"
                    checked={selectedChip.isEditable}
                    onCheckedChange={(checked) =>
                      setSelectedChip({ ...selectedChip, isEditable: checked })
                    }
                  />
                </div>

                <Separator />

                {/* Audit Information */}
                <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Audit Information</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Last edited by {selectedChip.editedBy}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      on {selectedChip.lastEdited}
                    </p>
                    {selectedChip.auditNote && (
                      <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                        Note: {selectedChip.auditNote}
                      </p>
                    )}
                  </div>
                </div>

                {/* Genie Integration Hint */}
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    💡 <strong>Genie Tip:</strong> You can ask Genie to explain this policy or suggest changes based on your workflow patterns.
                  </p>
                </div>
              </div>

              <SheetFooter className="mt-6">
                <Button variant="outline" onClick={() => setIsDrawerOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveRule}
                  disabled={!selectedChip.isEditable}
                >
                  Save Changes
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default PolicyTagChipsPattern;