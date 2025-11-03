import { useState } from "react";
import { FileText, PlayCircle, Settings, ArrowLeft } from "lucide-react";
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

interface ComplianceContentProps {
  onBack: () => void;
  country: string;
  status: SyncStatus;
  lastSync?: string;
  changes: RuleChange[];
  activePolicies: MiniRule[];
  sources?: Array<{ authority: string; reference: string; url?: string }>;
}

export const ComplianceContent = ({
  onBack,
  country: initialCountry,
  status,
  lastSync,
  changes,
  activePolicies,
  sources = []
}: ComplianceContentProps) => {
  const [country, setCountry] = useState(initialCountry);
  const [logToAudit, setLogToAudit] = useState(true);

  const handleApplyToTemplates = () => {
    toast({
      title: "Templates updated",
      description: "New clauses available in Draft Contracts.",
    });
    
    console.log("Genie Event: TemplatesUpdated", { country, changes: changes.map(c => c.id) });
  };

  const handleRerunValidation = () => {
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
    if (logToAudit) {
      console.log("Audit Timeline Entry:", {
        type: "system",
        message: `Acknowledged rule updates in ${acknowledgedCountry}`,
        changeIds,
        timestamp: new Date().toISOString()
      });
    }
    
    onBack();
  };

  const handleRuleSave = (ruleId: string, newValue: string) => {
    toast({
      title: "Rule updated",
      description: `${ruleId} has been updated to: ${newValue}`,
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 space-y-1">
            <h2 className="text-2xl font-semibold">Compliance Sync</h2>
            <p className="text-sm text-muted-foreground">
              Real-time country rule status + quick actions
            </p>
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
      </div>

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
  );
};
