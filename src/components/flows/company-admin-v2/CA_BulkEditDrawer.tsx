import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface Worker {
  id: string;
  name: string;
  country: string;
  currency: string;
  employmentType: "employee" | "contractor";
}

interface BulkEditDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedWorkers: Worker[];
  mode: "edit" | "adjustment";
  onApply: (data: BulkEditData) => void;
}

interface BulkEditData {
  employmentStatus?: string;
  overrideEmploymentDates?: boolean;
  adjustmentType?: string;
  adjustmentAmount?: number;
  adjustmentDescription?: string;
  withholdingTaxOverride?: boolean;
  withholdingTaxAmount?: number;
}

export const CA_BulkEditDrawer: React.FC<BulkEditDrawerProps> = ({
  open,
  onOpenChange,
  selectedWorkers,
  mode,
  onApply,
}) => {
  const [formData, setFormData] = useState<BulkEditData>({
    employmentStatus: "",
    overrideEmploymentDates: false,
    adjustmentType: "",
    adjustmentAmount: 0,
    adjustmentDescription: "",
    withholdingTaxOverride: false,
    withholdingTaxAmount: 0,
  });

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase();

  // Check if workers have mixed currencies
  const currencies = [...new Set(selectedWorkers.map(w => w.currency))];
  const hasMixedCurrencies = currencies.length > 1;

  const handleApply = () => {
    onApply(formData);
    onOpenChange(false);
    // Reset form
    setFormData({
      employmentStatus: "",
      overrideEmploymentDates: false,
      adjustmentType: "",
      adjustmentAmount: 0,
      adjustmentDescription: "",
      withholdingTaxOverride: false,
      withholdingTaxAmount: 0,
    });
  };

  const title = mode === "edit" 
    ? `Bulk edit payroll (${selectedWorkers.length} workers)`
    : `Bulk add one-time adjustment`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full p-0 bg-card">
        <SheetHeader className="px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-lg font-semibold">{title}</SheetTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Changes apply to this payroll cycle only for the selected workers.
              </p>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="px-6 py-4 space-y-6">
            {/* Selected Workers Chips */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                Selected Workers
              </Label>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {selectedWorkers.map((worker) => (
                  <Badge
                    key={worker.id}
                    variant="outline"
                    className="gap-1.5 py-1 px-2 bg-muted/30"
                  >
                    <Avatar className="h-4 w-4">
                      <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                        {getInitials(worker.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs">{worker.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      ({worker.currency})
                    </span>
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {mode === "adjustment" ? (
              /* Adjustment Mode */
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Adjustment Type</Label>
                  <Select
                    value={formData.adjustmentType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, adjustmentType: value })
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select adjustment type" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="bonus">Bonus</SelectItem>
                      <SelectItem value="overtime">Overtime</SelectItem>
                      <SelectItem value="expense">Expense Reimbursement</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Amount</Label>
                  <Input
                    type="number"
                    value={formData.adjustmentAmount || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        adjustmentAmount: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0.00"
                    className="h-9"
                  />
                  {hasMixedCurrencies && (
                    <p className="text-xs text-amber-600">
                      Note: Amounts will be applied in each worker's local currency
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Description (optional)</Label>
                  <Textarea
                    value={formData.adjustmentDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        adjustmentDescription: e.target.value,
                      })
                    }
                    placeholder="Add a note about this adjustment..."
                    className="min-h-[80px] resize-none"
                  />
                </div>
              </div>
            ) : (
              /* Edit Mode */
              <div className="space-y-6">
                {/* Employment Status */}
                <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Payroll Details</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Modify employment status for this cycle
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <Label className="text-xs text-muted-foreground">
                      Override employment dates & status for this cycle
                    </Label>
                    <Switch
                      checked={formData.overrideEmploymentDates}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, overrideEmploymentDates: checked })
                      }
                    />
                  </div>

                  {formData.overrideEmploymentDates && (
                    <div className="space-y-2">
                      <Label className="text-sm">Employment Status</Label>
                      <Select
                        value={formData.employmentStatus}
                        onValueChange={(value) =>
                          setFormData({ ...formData, employmentStatus: value })
                        }
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="On Hold">On Hold</SelectItem>
                          <SelectItem value="Terminated">Terminated</SelectItem>
                          <SelectItem value="Contract Ended">Contract Ended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Adjustment Lines */}
                <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/20">
                  <div>
                    <Label className="text-sm font-medium">Adjustment Lines</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Add one-time adjustments for this cycle
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Adjustment Type</Label>
                    <Select
                      value={formData.adjustmentType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, adjustmentType: value })
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="bonus">Bonus</SelectItem>
                        <SelectItem value="overtime">Overtime</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Amount</Label>
                    <Input
                      type="number"
                      value={formData.adjustmentAmount || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          adjustmentAmount: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="0.00"
                      className="h-9"
                    />
                  </div>
                </div>

                {/* Deductions Override (Employees only) */}
                {selectedWorkers.some((w) => w.employmentType === "employee") && (
                  <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/20">
                    <div>
                      <Label className="text-sm font-medium">Deductions</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Override withholding tax for this cycle
                      </p>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <Label className="text-xs text-muted-foreground">
                        Override withholding tax
                      </Label>
                      <Switch
                        checked={formData.withholdingTaxOverride}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, withholdingTaxOverride: checked })
                        }
                      />
                    </div>

                    {formData.withholdingTaxOverride && (
                      <div className="space-y-2">
                        <Label className="text-sm">Withholding Tax Amount</Label>
                        <Input
                          type="number"
                          value={formData.withholdingTaxAmount || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              withholdingTaxAmount: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder="0.00"
                          className="h-9"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        <SheetFooter className="px-6 py-4 border-t border-border flex flex-row justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9"
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            className="h-9"
            disabled={
              mode === "adjustment" && (!formData.adjustmentType || !formData.adjustmentAmount)
            }
          >
            Apply to {selectedWorkers.length} worker{selectedWorkers.length !== 1 ? "s" : ""}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
