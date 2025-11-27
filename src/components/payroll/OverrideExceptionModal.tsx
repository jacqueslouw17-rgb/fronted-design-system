import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface OverrideExceptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exception: {
    contractorName: string;
    contractorCountry?: string;
    type: string;
    description: string;
    severity: "high" | "medium" | "low";
  } | null;
  justification: string;
  onJustificationChange: (value: string) => void;
  onConfirm: () => void;
}

const exceptionTypeLabels: Record<string, string> = {
  "missing-bank": "Missing Bank Details",
  "fx-mismatch": "FX Mismatch",
  "pending-leave": "Pending Leave Confirmation",
  "unverified-identity": "Unverified Identity",
  "below-minimum-wage": "Minimum Wage",
  "allowance-exceeds-cap": "Allowance Cap",
  "missing-govt-id": "Govt ID",
  "incorrect-contribution-tier": "Contribution Tier",
  "missing-13th-month": "13th Month Pay",
  "ot-holiday-type-not-selected": "OT/Holiday Type",
  "invalid-work-type-combination": "Work Type Conflict",
  "night-differential-invalid-hours": "Night Differential",
  "missing-employer-sss": "Employer SSS",
  "missing-withholding-tax": "Withholding Tax",
  "status-mismatch": "Status Mismatch",
  "employment-ending-this-period": "Employment Ending This Period",
  "end-date-before-period": "End Date Before Current Period",
  "upcoming-contract-end": "Upcoming Contract End",
  "missing-hours": "Missing Hours",
  "missing-dates": "Missing Dates",
  "end-date-passed-active": "End Date Passed but Active",
  "deduction-exceeds-gross": "Deduction Exceeds Gross",
  "missing-tax-fields": "Missing Tax Fields",
  "adjustment-exceeds-cap": "Adjustment Exceeds Cap",
  "contribution-table-year-missing": "Contribution Table Year Missing"
};

export function OverrideExceptionModal({
  open,
  onOpenChange,
  exception,
  justification,
  onJustificationChange,
  onConfirm
}: OverrideExceptionModalProps) {
  if (!exception) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-600" />
            Override Blocking Exception
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning banner */}
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-foreground">
                  You are overriding a blocking exception for {exception.contractorName}
                </p>
                <p className="text-xs text-muted-foreground">
                  This may impact compliance or correctness of this payroll run.
                </p>
              </div>
            </div>
          </div>

          {/* Exception details */}
          <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Worker</span>
              <span className="text-sm text-foreground">{exception.contractorName}</span>
            </div>
            {exception.contractorCountry && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Country</span>
                <span className="text-sm text-foreground">{exception.contractorCountry}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Exception Type</span>
              <Badge variant="outline" className="text-xs">
                {exceptionTypeLabels[exception.type] || exception.type}
              </Badge>
            </div>
            <div className="space-y-1">
              <span className="text-sm font-medium text-foreground">Details</span>
              <p className="text-xs text-muted-foreground">
                {exception.description}
              </p>
            </div>
          </div>

          {/* Justification input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Justification <span className="text-destructive">*</span>
            </label>
            <Textarea
              placeholder="Explain why you are overriding this blocking exception..."
              value={justification}
              onChange={(e) => onJustificationChange(e.target.value)}
              className="min-h-[100px]"
              required
            />
            <p className="text-xs text-muted-foreground">
              This justification will be logged and associated with this payroll run.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!justification.trim()}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            Confirm Override
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
