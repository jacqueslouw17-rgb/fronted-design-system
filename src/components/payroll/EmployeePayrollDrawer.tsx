import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronUp, Plus, X, Info } from "lucide-react";
import { toast } from "sonner";

// SSS Contribution Lookup Table (2025) - Column L from official SSS table
const sssContributionTable = [
  { rangeFrom: 0, rangeTo: 4250, employeeContribution: 180 },
  { rangeFrom: 4250, rangeTo: 4750, employeeContribution: 202.50 },
  { rangeFrom: 4750, rangeTo: 5250, employeeContribution: 225 },
  { rangeFrom: 5250, rangeTo: 5750, employeeContribution: 247.50 },
  { rangeFrom: 5750, rangeTo: 6250, employeeContribution: 270 },
  { rangeFrom: 6250, rangeTo: 6750, employeeContribution: 292.50 },
  { rangeFrom: 6750, rangeTo: 7250, employeeContribution: 315 },
  { rangeFrom: 7250, rangeTo: 7750, employeeContribution: 337.50 },
  { rangeFrom: 7750, rangeTo: 8250, employeeContribution: 360 },
  { rangeFrom: 8250, rangeTo: 8750, employeeContribution: 382.50 },
  { rangeFrom: 8750, rangeTo: 9250, employeeContribution: 405 },
  { rangeFrom: 9250, rangeTo: 9750, employeeContribution: 427.50 },
  { rangeFrom: 9750, rangeTo: 10250, employeeContribution: 450 },
  { rangeFrom: 10250, rangeTo: 10750, employeeContribution: 472.50 },
  { rangeFrom: 10750, rangeTo: 11250, employeeContribution: 495 },
  { rangeFrom: 11250, rangeTo: 11750, employeeContribution: 517.50 },
  { rangeFrom: 11750, rangeTo: 12250, employeeContribution: 540 },
  { rangeFrom: 12250, rangeTo: 12750, employeeContribution: 562.50 },
  { rangeFrom: 12750, rangeTo: 13250, employeeContribution: 585 },
  { rangeFrom: 13250, rangeTo: 13750, employeeContribution: 607.50 },
  { rangeFrom: 13750, rangeTo: 14250, employeeContribution: 630 },
  { rangeFrom: 14250, rangeTo: 14750, employeeContribution: 652.50 },
  { rangeFrom: 14750, rangeTo: 15250, employeeContribution: 675 },
  { rangeFrom: 15250, rangeTo: 15750, employeeContribution: 697.50 },
  { rangeFrom: 15750, rangeTo: 16250, employeeContribution: 720 },
  { rangeFrom: 16250, rangeTo: 16750, employeeContribution: 742.50 },
  { rangeFrom: 16750, rangeTo: 17250, employeeContribution: 765 },
  { rangeFrom: 17250, rangeTo: 17750, employeeContribution: 787.50 },
  { rangeFrom: 17750, rangeTo: 18250, employeeContribution: 810 },
  { rangeFrom: 18250, rangeTo: 18750, employeeContribution: 832.50 },
  { rangeFrom: 18750, rangeTo: 19250, employeeContribution: 855 },
  { rangeFrom: 19250, rangeTo: 19750, employeeContribution: 877.50 },
  { rangeFrom: 19750, rangeTo: 20250, employeeContribution: 900 },
  { rangeFrom: 20250, rangeTo: Infinity, employeeContribution: 900 },
];

// Lookup SSS contribution based on gross compensation
const lookupSSSContribution = (grossCompensation: number): number => {
  const bracket = sssContributionTable.find(
    (row) => grossCompensation >= row.rangeFrom && grossCompensation < row.rangeTo
  );
  return bracket ? bracket.employeeContribution : 900; // Default to max if not found
};

// Calculate PhilHealth contribution based on base salary
// If Base Salary <= Cap: PhilHealth = Base Salary × Percentage
// Else: PhilHealth = Fixed Deduction
const calculatePhilHealth = (baseSalary: number, percentage: number = 5, cap: number = 100000, fixedDeduction: number = 5000): number => {
  if (baseSalary <= cap) {
    return (baseSalary * percentage) / 100;
  }
  return fixedDeduction;
};

interface LineItem {
  id: string;
  name: string;
  amount: number;
  taxable: boolean;
  applyTo: "1st_half" | "2nd_half" | "both_halves" | "full_month";
  cap?: number;
  origin?: string;
}

interface RecurringAdjustment {
  id: string;
  name: string;
  amount: number;
}

interface ContractorPayment {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  currency: string;
  employmentType: "contractor" | "employee";
  amount?: number;
  baseSalary?: number;
  netPay?: number;
  lineItems?: LineItem[];
  startDate?: string;
  nationalId?: string;
  taxEmployee?: number;
  sssEmployee?: number;
  sssEmployer?: number;
  philHealthEmployee?: number;
  philHealthEmployer?: number;
  pagIbigEmployee?: number;
  pagIbigEmployer?: number;
  withholdingTax?: number;
  otherDeductions?: number;
  holidayPay?: number;
  employerTax?: number;
  pension?: number;
  status?: string;
  estFees?: number;
  fxRate?: number;
  recvLocal?: number;
  eta?: string;
  allowOverride?: boolean;
  withholdingTaxRate?: number;
  recurringAdjustments?: RecurringAdjustment[];
}

interface EmployeePayrollDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: ContractorPayment | null;
  onSave: (data: ContractorPayment) => void;
}

export default function EmployeePayrollDrawer({ 
  open, 
  onOpenChange, 
  employee,
  onSave 
}: EmployeePayrollDrawerProps) {
  const [formData, setFormData] = useState<ContractorPayment | null>(null);
  const [profileOpen, setProfileOpen] = useState(true);
  const [compensationOpen, setCompensationOpen] = useState(true);
  const [recurringAdjustmentsOpen, setRecurringAdjustmentsOpen] = useState(true);
  const [overridesOpen, setOverridesOpen] = useState(true);
  const [deductionsOpen, setDeductionsOpen] = useState(false);
  const [contributionsOpen, setContributionsOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        ...employee,
        lineItems: employee.lineItems || [],
        recurringAdjustments: employee.recurringAdjustments || [],
        allowOverride: employee.allowOverride || false,
      });
    }
  }, [employee]);

  useEffect(() => {
    if (!formData) return;
    const isPH = formData.countryCode === "PH";
    const currentTotalAllowances = (formData.lineItems || []).reduce((sum, item) => sum + item.amount, 0);
    const currentGrossCompensation = (formData.baseSalary || 0) + currentTotalAllowances;

    let needsUpdate = false;
    const updates: Partial<ContractorPayment> = {};

    if (isPH && !formData.allowOverride) {
      const autoSSS = lookupSSSContribution(currentGrossCompensation);
      const autoPhilHealth = calculatePhilHealth(formData.baseSalary || 0);
      const autoPagIbig = 100; // Fixed monthly contribution

      if (formData.sssEmployee !== autoSSS) { updates.sssEmployee = autoSSS; needsUpdate = true; }
      if (formData.philHealthEmployee !== autoPhilHealth) { updates.philHealthEmployee = autoPhilHealth; needsUpdate = true; }
      if (formData.pagIbigEmployee !== autoPagIbig) { updates.pagIbigEmployee = autoPagIbig; needsUpdate = true; }
    }

    if (!formData.allowOverride && formData.withholdingTaxRate) {
      const autoWithholdingTax = (currentGrossCompensation * (formData.withholdingTaxRate || 0)) / 100;
      if (Math.abs((formData.withholdingTax || 0) - autoWithholdingTax) > 0.01) {
        updates.withholdingTax = autoWithholdingTax;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      setFormData(prev => prev ? ({ ...prev, ...updates }) : null);
    }
  }, [formData?.baseSalary, formData?.lineItems?.length, formData?.allowOverride, formData?.withholdingTaxRate, formData?.countryCode]);

  if (!formData) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-[600px] sm:max-w-[600px] p-0">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6">
              <SheetHeader className="space-y-1">
                <SheetTitle className="text-lg font-semibold">Employee Payroll</SheetTitle>
                <p className="text-sm text-muted-foreground">Loading employee data…</p>
              </SheetHeader>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  }

  const isPH = formData.countryCode === "PH";
  const isNO = formData.countryCode === "NO";

  const dailyRate = (formData.baseSalary || 0) / 22;
  const hourlyRate = dailyRate / 8;
  const totalAllowances = (formData.lineItems || []).reduce((sum, item) => sum + item.amount, 0);
  const grossCompensation = (formData.baseSalary || 0) + totalAllowances;

  const totalDeductions = (formData.sssEmployee || 0) + 
                          (formData.philHealthEmployee || 0) + 
                          (formData.pagIbigEmployee || 0) + 
                          (formData.withholdingTax || 0) + 
                          (formData.otherDeductions || 0);
  const totalEmployerContributions = (((formData.baseSalary || 0) * (formData.holidayPay || 0)) / 100) +
                                    (((formData.baseSalary || 0) * (formData.employerTax || 0)) / 100) +
                                    (((formData.baseSalary || 0) * (formData.pension || 0)) / 100);
  const netPay = grossCompensation - totalDeductions;

  const handleAddLineItem = () => {
    const newItem: LineItem = {
      id: `line-${Date.now()}`,
      name: "New Adjustment",
      amount: 0,
      taxable: true,
      applyTo: isPH ? "both_halves" : "full_month",
      origin: "Employee Override"
    };
    setFormData(prev => prev ? ({
      ...prev,
      lineItems: [...(prev.lineItems || []), newItem]
    }) : null);
  };

  const handleRemoveLineItem = (id: string) => {
    setFormData(prev => prev ? ({
      ...prev,
      lineItems: (prev.lineItems || []).filter(item => item.id !== id)
    }) : null);
  };

  const handleLineItemChange = (id: string, field: keyof LineItem, value: any) => {
    setFormData(prev => prev ? ({
      ...prev,
      lineItems: (prev.lineItems || []).map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }) : null);
  };

  const handleAddRecurringAdjustment = () => {
    const newAdjustment: RecurringAdjustment = {
      id: `recurring-${Date.now()}`,
      name: "New Adjustment",
      amount: 0,
    };
    setFormData(prev => prev ? ({
      ...prev,
      recurringAdjustments: [...(prev.recurringAdjustments || []), newAdjustment]
    }) : null);
  };

  const handleRemoveRecurringAdjustment = (id: string) => {
    setFormData(prev => prev ? ({
      ...prev,
      recurringAdjustments: (prev.recurringAdjustments || []).filter(adj => adj.id !== id)
    }) : null);
  };

  const handleRecurringAdjustmentChange = (id: string, field: keyof RecurringAdjustment, value: any) => {
    setFormData(prev => prev ? ({
      ...prev,
      recurringAdjustments: (prev.recurringAdjustments || []).map(adj =>
        adj.id === id ? { ...adj, [field]: value } : adj
      )
    }) : null);
  };

  const handleSave = () => {
    if (formData) {
      onSave({...formData, netPay});
      toast.success("Employee payroll updated successfully");
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[600px] sm:max-w-[600px] p-0">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            <SheetHeader className="space-y-1">
              <SheetTitle className="text-lg font-semibold">Employee Payroll</SheetTitle>
              <p className="text-sm text-muted-foreground">
                Configure salary, benefits, deductions, and settings
              </p>
            </SheetHeader>

            {/* A. Employee Profile */}
            <Card className="border-border">
              <Collapsible open={profileOpen} onOpenChange={setProfileOpen}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-semibold">Employee Profile</h3>
                      <Badge variant="secondary" className="text-xs">Read-Only</Badge>
                    </div>
                    {profileOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <Label className="text-xs text-muted-foreground">Name</Label>
                        <p className="font-medium mt-1">{formData.name}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Employment Type</Label>
                        <p className="font-medium mt-1">EOR Employee</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Country</Label>
                        <p className="font-medium mt-1">{formData.country}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Currency</Label>
                        <p className="font-medium mt-1">{formData.currency}</p>
                      </div>
                      {isNO && formData.nationalId && (
                        <div>
                          <Label className="text-xs text-muted-foreground">National ID</Label>
                          <p className="font-medium mt-1">{formData.nationalId}</p>
                        </div>
                      )}
                      <div>
                        <Label className="text-xs">Withholding Tax Rate (%)</Label>
                        <Input
                          type="number"
                          value={formData.withholdingTaxRate || 0}
                          onChange={(e) => setFormData(prev => prev ? ({ ...prev, withholdingTaxRate: Number(e.target.value) }) : null)}
                          className="mt-1 h-8"
                          placeholder="0"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Applied to gross compensation
                        </p>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* B. Compensation Defaults */}
            <Card className="border-border">
              <Collapsible open={compensationOpen} onOpenChange={setCompensationOpen}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4">
                    <h3 className="text-sm font-semibold">Compensation Defaults</h3>
                    {compensationOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs">Base Monthly Salary</Label>
                        <Input
                          type="number"
                          value={formData.baseSalary}
                          onChange={(e) => setFormData(prev => prev ? ({ ...prev, baseSalary: Number(e.target.value) }) : null)}
                          disabled={!formData.allowOverride}
                          className="mt-1 h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Daily Rate</Label>
                        <Input
                          type="number"
                          value={dailyRate.toFixed(2)}
                          disabled
                          className="mt-1 h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Hourly Rate</Label>
                        <Input
                          type="number"
                          value={hourlyRate.toFixed(2)}
                          disabled
                          className="mt-1 h-8"
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Adjustment Lines</Label>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={handleAddLineItem}
                          disabled={!formData.allowOverride}
                          className="h-7 text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Adjustment
                        </Button>
                      </div>

                      {(formData.lineItems || []).length === 0 ? (
                        <p className="text-xs text-muted-foreground">No adjustments configured</p>
                      ) : (
                        <div className="space-y-2">
                          {(formData.lineItems || []).map((item) => (
                            <Card key={item.id} className="p-3 bg-muted/50">
                              <div className="flex items-start gap-2">
                                <div className="flex-1 space-y-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <Label className="text-xs">Name</Label>
                                      <Input
                                        value={item.name}
                                        onChange={(e) => handleLineItemChange(item.id, "name", e.target.value)}
                                        disabled={!formData.allowOverride}
                                        className="mt-1 h-7 text-xs"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs">Amount</Label>
                                      <Input
                                        type="number"
                                        value={item.amount}
                                        onChange={(e) => handleLineItemChange(item.id, "amount", Number(e.target.value))}
                                        disabled={!formData.allowOverride}
                                        className="mt-1 h-7 text-xs"
                                      />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <Label className="text-xs">Taxable</Label>
                                      <div className="flex items-center gap-2 mt-1.5">
                                        <Switch
                                          checked={item.taxable}
                                          onCheckedChange={(checked) => handleLineItemChange(item.id, "taxable", checked)}
                                          disabled={!formData.allowOverride}
                                          className="scale-75"
                                        />
                                        <span className="text-xs">{item.taxable ? "Yes" : "No"}</span>
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="text-xs">Apply to</Label>
                                      <Select
                                        value={item.applyTo || (isPH ? "both_halves" : "full_month")}
                                        onValueChange={(value) => handleLineItemChange(item.id, "applyTo", value)}
                                        disabled={!formData.allowOverride}
                                      >
                                        <SelectTrigger className="h-7 text-xs mt-1">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {isPH ? (
                                            <>
                                              <SelectItem value="1st_half" className="text-xs">1st Half only (PH)</SelectItem>
                                              <SelectItem value="2nd_half" className="text-xs">2nd Half only (PH)</SelectItem>
                                              <SelectItem value="both_halves" className="text-xs">Both Halves (PH)</SelectItem>
                                            </>
                                          ) : (
                                            <SelectItem value="full_month" className="text-xs">Full Month</SelectItem>
                                          )}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                </div>
                                {item.origin && (
                                  <Badge variant="secondary" className="text-xs shrink-0">
                                    {item.origin}
                                  </Badge>
                                )}
                                {formData.allowOverride && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveLineItem(item.id)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* C. Recurring Adjustment Lines */}
            <Card className="border-border">
              <Collapsible open={recurringAdjustmentsOpen} onOpenChange={setRecurringAdjustmentsOpen}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4">
                    <h3 className="text-sm font-semibold">Recurring Adjustment Lines</h3>
                    {recurringAdjustmentsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          These adjustments are automatically applied to each monthly pay run
                        </p>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={handleAddRecurringAdjustment}
                          className="h-7 text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Adjustment
                        </Button>
                      </div>

                      {(formData.recurringAdjustments || []).length === 0 ? (
                        <p className="text-xs text-muted-foreground">No recurring adjustments configured</p>
                      ) : (
                        <div className="space-y-2">
                          {(formData.recurringAdjustments || []).map((adjustment) => (
                            <Card key={adjustment.id} className="p-3 bg-muted/50">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 grid grid-cols-2 gap-2">
                                  <div>
                                    <Label className="text-xs">Name</Label>
                                    <Input
                                      value={adjustment.name}
                                      onChange={(e) => handleRecurringAdjustmentChange(adjustment.id, "name", e.target.value)}
                                      className="mt-1 h-7 text-xs"
                                      placeholder="e.g., Housing Allowance"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Amount ({formData.currency})</Label>
                                    <Input
                                      type="number"
                                      value={adjustment.amount}
                                      onChange={(e) => handleRecurringAdjustmentChange(adjustment.id, "amount", Number(e.target.value))}
                                      className="mt-1 h-7 text-xs"
                                      placeholder="Positive or negative"
                                    />
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveRecurringAdjustment(adjustment.id)}
                                  className="h-6 w-6 p-0 mt-4"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* D. Employee Overrides */}
            <Card className="border-border">
              <Collapsible open={overridesOpen} onOpenChange={setOverridesOpen}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4">
                    <h3 className="text-sm font-semibold">Employee Overrides</h3>
                    {overridesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <Label className="text-sm">Override defaults for this employee?</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Enable to allow custom values specific to this employee
                        </p>
                      </div>
                      <Switch
                        checked={formData.allowOverride}
                        onCheckedChange={(checked) => setFormData(prev => prev ? ({ ...prev, allowOverride: checked }) : null)}
                      />
                    </div>

                    {formData.allowOverride && (
                      <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-foreground">
                          Overrides apply only to this employee and do not change the country or company defaults.
                        </p>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* E. Deductions (PH Only) */}
            {isPH && (
              <Card className="border-border">
                <Collapsible open={deductionsOpen} onOpenChange={setDeductionsOpen}>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">Deductions</h3>
                        <Badge className="text-xs">Philippines Only</Badge>
                      </div>
                      {deductionsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-3">
                      <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        <div className="space-y-1">
                          <p className="text-xs text-foreground">
                            Default government deduction values follow PH compliance. Overrides should only be used if the employee has a special arrangement.
                          </p>
                          <p className="text-xs text-muted-foreground font-medium">
                            💡 SSS contribution auto-applies based on Gross Compensation bracket (₱{grossCompensation.toLocaleString()}).
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">SSS (Employee Share)</Label>
                          <Input
                            type="number"
                            value={formData.sssEmployee}
                            onChange={(e) => setFormData(prev => prev ? ({ ...prev, sssEmployee: Number(e.target.value) }) : null)}
                            disabled={!formData.allowOverride}
                            className="mt-1 h-8"
                          />
                          {!formData.allowOverride && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Auto-calculated from SSS table
                            </p>
                          )}
                        </div>
                        <div>
                          <Label className="text-xs">PhilHealth (Employee Share)</Label>
                          <Input
                            type="number"
                            value={formData.philHealthEmployee}
                            onChange={(e) => setFormData(prev => prev ? ({ ...prev, philHealthEmployee: Number(e.target.value) }) : null)}
                            disabled={!formData.allowOverride}
                            className="mt-1 h-8"
                          />
                          {!formData.allowOverride && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Auto-calculated: {(formData.baseSalary || 0) <= 100000 
                                ? `5% of base salary`
                                : `Fixed ₱5,000`
                              }
                            </p>
                          )}
                        </div>
                        <div>
                          <Label className="text-xs">Pag-IBIG (Fixed Monthly)</Label>
                          <Input
                            type="number"
                            value={formData.pagIbigEmployee}
                            onChange={(e) => setFormData(prev => prev ? ({ ...prev, pagIbigEmployee: Number(e.target.value) }) : null)}
                            disabled={!formData.allowOverride}
                            className="mt-1 h-8"
                          />
                          {!formData.allowOverride && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Fixed contribution (₱100 per month)
                            </p>
                          )}
                        </div>
                        <div>
                          <Label className="text-xs">Withholding Tax</Label>
                          <Input
                            type="number"
                            value={formData.withholdingTax}
                            onChange={(e) => setFormData(prev => prev ? ({ ...prev, withholdingTax: Number(e.target.value) }) : null)}
                            disabled={!formData.allowOverride}
                            className="mt-1 h-8"
                          />
                          {!formData.allowOverride && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Auto-calculated: {formData.withholdingTaxRate || 0}% of gross compensation
                            </p>
                          )}
                        </div>
                        <div>
                          <Label className="text-xs">Other Deductions</Label>
                          <Input
                            type="number"
                            value={formData.otherDeductions}
                            onChange={(e) => setFormData(prev => prev ? ({ ...prev, otherDeductions: Number(e.target.value) }) : null)}
                            disabled={!formData.allowOverride}
                            className="mt-1 h-8"
                          />
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            )}

            {/* F. Employer Contributions (NO Only) */}
            {isNO && (
              <Card className="border-border">
                <Collapsible open={contributionsOpen} onOpenChange={setContributionsOpen}>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">Employer Contributions</h3>
                        <Badge className="text-xs">Norway Only</Badge>
                      </div>
                      {contributionsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-3">
                      <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-foreground">
                          Default contribution rates follow company-level Norway settings.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Holiday Pay %</Label>
                          <Input
                            type="number"
                            value={formData.holidayPay}
                            onChange={(e) => setFormData(prev => prev ? ({ ...prev, holidayPay: Number(e.target.value) }) : null)}
                            disabled={!formData.allowOverride}
                            className="mt-1 h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Employer Tax %</Label>
                          <Input
                            type="number"
                            value={formData.employerTax}
                            onChange={(e) => setFormData(prev => prev ? ({ ...prev, employerTax: Number(e.target.value) }) : null)}
                            disabled={!formData.allowOverride}
                            className="mt-1 h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Pension Contribution %</Label>
                          <Input
                            type="number"
                            value={formData.pension}
                            onChange={(e) => setFormData(prev => prev ? ({ ...prev, pension: Number(e.target.value) }) : null)}
                            disabled={!formData.allowOverride}
                            className="mt-1 h-8"
                          />
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            )}

            {/* G. Preview */}
            <Card className="border-border">
              <Collapsible open={previewOpen} onOpenChange={setPreviewOpen}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">Preview</h3>
                      <Badge variant="secondary" className="text-xs">Read-Only Summary</Badge>
                    </div>
                    {previewOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-lg text-sm">
                      <div>
                        <Label className="text-xs text-muted-foreground">Base Salary</Label>
                        <p className="font-semibold mt-1">
                          {formData.currency} {(formData.baseSalary || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Total Allowances</Label>
                        <p className="font-semibold mt-1">
                          {formData.currency} {totalAllowances.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Total Deductions</Label>
                        <p className="font-semibold mt-1">
                          {formData.currency} {totalDeductions.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Employer Contributions</Label>
                        <p className="font-semibold mt-1">
                          {formData.currency} {totalEmployerContributions.toFixed(0)}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <Label className="text-xs text-muted-foreground">Net Pay (Monthly)</Label>
                      <p className="text-2xl font-bold text-primary mt-2">
                        {formData.currency} {netPay.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Pay Cycle: {isPH ? "Bi-monthly (1st & 2nd Half)" : "Monthly"}
                      </p>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            <SheetFooter className="pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </SheetFooter>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
