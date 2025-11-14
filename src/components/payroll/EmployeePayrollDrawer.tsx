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
import { ChevronDown, ChevronUp, Plus, X, Info } from "lucide-react";
import { toast } from "sonner";

interface LineItem {
  id: string;
  name: string;
  amount: number;
  taxable: boolean;
  cap?: number;
  origin?: string;
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
  const [overridesOpen, setOverridesOpen] = useState(true);
  const [deductionsOpen, setDeductionsOpen] = useState(false);
  const [contributionsOpen, setContributionsOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        ...employee,
        lineItems: employee.lineItems || [],
        allowOverride: employee.allowOverride || false,
      });
    }
  }, [employee]);

  if (!formData) return null;

  const isPH = formData.countryCode === "PH";
  const isNO = formData.countryCode === "NO";

  const dailyRate = (formData.baseSalary || 0) / 22;
  const hourlyRate = dailyRate / 8;
  const totalAllowances = (formData.lineItems || []).reduce((sum, item) => sum + item.amount, 0);
  const totalDeductions = (formData.sssEmployee || 0) + 
                          (formData.philHealthEmployee || 0) + 
                          (formData.pagIbigEmployee || 0) + 
                          (formData.otherDeductions || 0);
  const totalEmployerContributions = (((formData.baseSalary || 0) * (formData.holidayPay || 0)) / 100) +
                                    (((formData.baseSalary || 0) * (formData.employerTax || 0)) / 100) +
                                    (((formData.baseSalary || 0) * (formData.pension || 0)) / 100);
  const netPay = (formData.baseSalary || 0) + totalAllowances - totalDeductions;

  const handleAddLineItem = () => {
    const newItem: LineItem = {
      id: `line-${Date.now()}`,
      name: "New Line Item",
      amount: 0,
      taxable: true,
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
                      <h3 className="font-semibold">Employee Profile</h3>
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
                    <h3 className="font-semibold">Compensation Defaults</h3>
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
                        <Label className="text-sm font-medium">Line Items</Label>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={handleAddLineItem}
                          disabled={!formData.allowOverride}
                          className="h-7 text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Item
                        </Button>
                      </div>

                      {(formData.lineItems || []).length === 0 ? (
                        <p className="text-xs text-muted-foreground">No line items configured</p>
                      ) : (
                        <div className="space-y-2">
                          {(formData.lineItems || []).map((item) => (
                            <Card key={item.id} className="p-3 bg-muted/50">
                              <div className="flex items-start gap-2">
                                <div className="flex-1 grid grid-cols-3 gap-2">
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

            {/* C. Employee Overrides */}
            <Card className="border-border">
              <Collapsible open={overridesOpen} onOpenChange={setOverridesOpen}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4">
                    <h3 className="font-semibold">Employee Overrides</h3>
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

            {/* D. Deductions (PH Only) */}
            {isPH && (
              <Card className="border-border">
                <Collapsible open={deductionsOpen} onOpenChange={setDeductionsOpen}>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">Deductions</h3>
                        <Badge className="text-xs">Philippines Only</Badge>
                      </div>
                      {deductionsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-3">
                      <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-foreground">
                          Default government deduction values follow PH compliance. Overrides should only be used if the employee has a special arrangement.
                        </p>
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
                        </div>
                        <div>
                          <Label className="text-xs">Pag-IBIG (Employee Share)</Label>
                          <Input
                            type="number"
                            value={formData.pagIbigEmployee}
                            onChange={(e) => setFormData(prev => prev ? ({ ...prev, pagIbigEmployee: Number(e.target.value) }) : null)}
                            disabled={!formData.allowOverride}
                            className="mt-1 h-8"
                          />
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

            {/* E. Employer Contributions (NO Only) */}
            {isNO && (
              <Card className="border-border">
                <Collapsible open={contributionsOpen} onOpenChange={setContributionsOpen}>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">Employer Contributions</h3>
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

            {/* F. Preview */}
            <Card className="border-border">
              <Collapsible open={previewOpen} onOpenChange={setPreviewOpen}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">Preview</h3>
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
