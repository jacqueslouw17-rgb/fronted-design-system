import React, { useState } from "react";
import { AlertTriangle, X, CheckCircle2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ReviewCheck } from "./CA4_ReviewCheckCard";

interface CA4_FixCheckDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  check: ReviewCheck | null;
  onSave: (checkId: string) => void;
}

export const CA4_FixCheckDrawer: React.FC<CA4_FixCheckDrawerProps> = ({
  open,
  onOpenChange,
  check,
  onSave,
}) => {
  const [bankAccountType, setBankAccountType] = useState("");
  const [iban, setIban] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!check) return null;

  const handleSave = async () => {
    setIsSubmitting(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 500));
    onSave(check.id);
    setIsSubmitting(false);
    onOpenChange(false);
    // Reset form
    setBankAccountType("");
    setIban("");
  };

  const renderFixContent = () => {
    // Render different fix forms based on check type
    if (check.title.toLowerCase().includes("bank")) {
      return (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-accent-amber-fill/10 border border-accent-amber-outline/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-accent-amber-text mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">What's missing</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {check.description}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Account Type</Label>
              <Select value={bankAccountType} onValueChange={setBankAccountType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checking">Checking</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">IBAN / Account Number</Label>
              <Input 
                placeholder="Enter IBAN or account number"
                value={iban}
                onChange={(e) => setIban(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Required for processing payment to this worker.
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Generic fix form
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-accent-amber-fill/10 border border-accent-amber-outline/20">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-accent-amber-text mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">{check.title}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {check.description}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
          <p className="text-sm text-muted-foreground">
            This issue requires action outside of payroll. You can skip this worker for this cycle, 
            or contact Fronted support for assistance.
          </p>
        </div>
      </div>
    );
  };

  const canSave = check.title.toLowerCase().includes("bank") 
    ? bankAccountType && iban
    : true;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            Fix: {check.workerName}
          </SheetTitle>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/30">
              Blocking
            </Badge>
            <span className="text-xs text-muted-foreground">{check.workerCountry}</span>
          </div>
        </SheetHeader>

        <div className="mt-6">
          {renderFixContent()}
        </div>

        <SheetFooter className="mt-8 flex-row gap-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            className="flex-1 gap-2"
            onClick={handleSave}
            disabled={!canSave || isSubmitting}
          >
            <CheckCircle2 className="h-4 w-4" />
            {isSubmitting ? "Saving..." : "Save & Recalculate"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CA4_FixCheckDrawer;
