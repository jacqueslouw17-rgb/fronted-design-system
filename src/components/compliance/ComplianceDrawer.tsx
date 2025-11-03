import { useState } from "react";
import { FileText, PlayCircle, Settings } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SyncStatusDot, SyncStatus } from "./SyncStatusDot";
import { RuleChangeChip, RuleChange } from "./RuleChangeChip";
import { RuleBadge, MiniRule } from "./RuleBadge";
import { SourceLink } from "./SourceLink";
import { AcknowledgeButton } from "./AcknowledgeButton";
import { toast } from "@/hooks/use-toast";

interface ComplianceDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  country: string;
  status: SyncStatus;
  lastSync?: string;
  changes: RuleChange[];
  activePolicies: MiniRule[];
  sources?: Array<{ authority: string; reference: string; url?: string }>;
}

export const ComplianceDrawer = ({
  open,
  onOpenChange,
  country: initialCountry,
  status,
  lastSync,
  changes,
  activePolicies,
  sources = []
}: ComplianceDrawerProps) => {
  const [country, setCountry] = useState(initialCountry);
  const [logToAudit, setLogToAudit] = useState(true);

  const handleApplyToTemplates = () => {
    // Mock template update
    toast({
      title: "Templates updated",
      description: "New clauses available in Draft Contracts.",
    });
    
    console.log("Genie Event: TemplatesUpdated", { country, changes: changes.map(c => c.id) });
  };

  const handleRerunValidation = () => {
    // Trigger compliance checklist
    toast({
      title: "Validation started",
      description: "Running compliance checklist...",
    });
    
    setTimeout(() => {
      toast({
        title: "Validation complete",
        description: "2 items require review",
      });
    }, 1500);
  };

  const handleOpenModule = () => {
    toast({
      title: "Opening country module",
      description: `Loading ${country} compliance module...`,
    });
  };

  const handleAcknowledge = (acknowledgedCountry: string, changeIds: string[]) => {
    // Post to audit timeline
    if (logToAudit) {
      console.log("Audit Timeline Entry:", {
        type: "system",
        message: `Acknowledged rule updates in ${acknowledgedCountry}`,
        changeIds,
        timestamp: new Date().toISOString()
      });
    }
    
    onOpenChange(false);
  };

  const handleRuleSave = (ruleId: string, newValue: string) => {
    toast({
      title: "Rule updated",
      description: `${ruleId} has been updated to: ${newValue}`,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <SheetTitle>Compliance Sync</SheetTitle>
              <SheetDescription>
                Real-time country rule status + quick actions
              </SheetDescription>
            </div>
          </div>

          {/* Header controls */}
          <div className="flex items-center gap-3 pt-2">
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NO">🇳🇴 Norway</SelectItem>
                <SelectItem value="PH">🇵🇭 Philippines</SelectItem>
                <SelectItem value="SE">🇸🇪 Sweden</SelectItem>
                <SelectItem value="US">🇺🇸 United States</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 text-xs text-muted-foreground ml-auto">
              <SyncStatusDot status={status} />
              {lastSync && <span>Last sync: {lastSync}</span>}
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* What changed section */}
          {changes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">What Changed</h3>
              <div className="space-y-2">
                {changes.map((change) => (
                  <RuleChangeChip
                    key={change.id}
                    change={change}
                    onOpenModule={handleOpenModule}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Active policies */}
          {activePolicies.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Active Policies</h3>
              <div className="flex flex-wrap gap-2">
                {activePolicies.map((rule) => (
                  <RuleBadge
                    key={rule.id}
                    rule={rule}
                    onSave={handleRuleSave}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Actions</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleApplyToTemplates}
                disabled={changes.length === 0}
              >
                <FileText className="h-4 w-4" />
                Apply to templates
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleRerunValidation}
              >
                <PlayCircle className="h-4 w-4" />
                Re-run validation
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleOpenModule}
              >
                <Settings className="h-4 w-4" />
                Open country module
              </Button>
            </div>
          </div>

          {/* Acknowledge */}
          {changes.length > 0 && (
            <AcknowledgeButton
              country={country}
              changeIds={changes.map(c => c.id)}
              onAcknowledge={handleAcknowledge}
            />
          )}

          {/* Footer */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <Label htmlFor="log-audit" className="text-xs">
                Log to audit trail
              </Label>
              <Switch
                id="log-audit"
                checked={logToAudit}
                onCheckedChange={setLogToAudit}
              />
            </div>

            {sources.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground">Sources</div>
                <div className="space-y-1">
                  {sources.map((source, idx) => (
                    <SourceLink
                      key={idx}
                      authority={source.authority}
                      reference={source.reference}
                      url={source.url}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
