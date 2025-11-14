import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ChevronDown, ChevronUp, Plus, X, ArrowLeft, Info } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface LineItem {
  id: string;
  name: string;
  amount: number;
  taxable: boolean;
  cap?: number;
  origin?: string;
}

interface EmployeePayrollSettingsData {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  currency: string;
  nationalId?: string;
  baseSalary: number;
  lineItems: LineItem[];
  allowOverride: boolean;
  // PH deductions
  sssEmployee?: number;
  philHealthEmployee?: number;
  pagIbigEmployee?: number;
  otherDeductions?: number;
  // NO employer contributions
  holidayPay?: number;
  employerTax?: number;
  pension?: number;
}

export default function EmployeePayrollSettings() {
  const navigate = useNavigate();
  const location = useLocation();
  const employee = location.state?.employee as EmployeePayrollSettingsData | undefined;

  const [profileOpen, setProfileOpen] = useState(true);
  const [compensationOpen, setCompensationOpen] = useState(true);
  const [overridesOpen, setOverridesOpen] = useState(true);
  const [deductionsOpen, setDeductionsOpen] = useState(false);
  const [contributionsOpen, setContributionsOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [formData, setFormData] = useState<EmployeePayrollSettingsData>({
    id: employee?.id || "",
    name: employee?.name || "",
    country: employee?.country || "",
    countryCode: employee?.countryCode || "",
    currency: employee?.currency || "",
    nationalId: employee?.nationalId || "",
    baseSalary: employee?.baseSalary || 0,
    lineItems: employee?.lineItems || [],
    allowOverride: employee?.allowOverride || false,
    sssEmployee: employee?.sssEmployee || 0,
    philHealthEmployee: employee?.philHealthEmployee || 0,
    pagIbigEmployee: employee?.pagIbigEmployee || 0,
    otherDeductions: employee?.otherDeductions || 0,
    holidayPay: employee?.holidayPay || 10.2,
    employerTax: employee?.employerTax || 14.1,
    pension: employee?.pension || 2,
  });

  const handleBack = () => {
    navigate("/payroll-batch");
  };

  const handleSave = () => {
    toast.success("Employee payroll settings saved successfully");
    navigate("/payroll-batch", { state: { updatedEmployee: formData } });
  };

  const handleAddLineItem = () => {
    const newItem: LineItem = {
      id: `line-${Date.now()}`,
      name: "New Line Item",
      amount: 0,
      taxable: true,
      origin: "Employee Override"
    };
    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, newItem]
    }));
  };

  const handleRemoveLineItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter(item => item.id !== id)
    }));
  };

  const handleLineItemChange = (id: string, field: keyof LineItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const dailyRate = formData.baseSalary / 22;
  const hourlyRate = dailyRate / 8;
  const totalAllowances = formData.lineItems.reduce((sum, item) => sum + item.amount, 0);
  const totalDeductions = (formData.sssEmployee || 0) + 
                          (formData.philHealthEmployee || 0) + 
                          (formData.pagIbigEmployee || 0) + 
                          (formData.otherDeductions || 0);
  const totalEmployerContributions = ((formData.baseSalary * (formData.holidayPay || 0)) / 100) +
                                    ((formData.baseSalary * (formData.employerTax || 0)) / 100) +
                                    ((formData.baseSalary * (formData.pension || 0)) / 100);
  const netPay = formData.baseSalary + totalAllowances - totalDeductions;

  const isPH = formData.countryCode === "PH";
  const isNO = formData.countryCode === "NO";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container max-w-4xl mx-auto px-6 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => navigate("/payroll-batch")} className="cursor-pointer">
                  Payroll
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink onClick={handleBack} className="cursor-pointer">
                  Employees
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{formData.name} Settings</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <div className="flex items-center gap-3 mt-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
              Back to Employee Drawer
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-4xl mx-auto px-6 py-8 space-y-6">
        
        {/* A. Employee Profile */}
        <Card className="border-border">
          <Collapsible open={profileOpen} onOpenChange={setProfileOpen}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold">Employee Profile</h2>
                  <Badge variant="secondary">Read-Only</Badge>
                </div>
                {profileOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-6 pb-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Name</Label>
                    <p className="text-foreground font-medium mt-1">{formData.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Employment Type</Label>
                    <p className="text-foreground font-medium mt-1">EOR Employee</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Country</Label>
                    <p className="text-foreground font-medium mt-1">{formData.country}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Currency</Label>
                    <p className="text-foreground font-medium mt-1">{formData.currency}</p>
                  </div>
                  {isNO && formData.nationalId && (
                    <div>
                      <Label className="text-muted-foreground">National ID</Label>
                      <p className="text-foreground font-medium mt-1">{formData.nationalId}</p>
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
              <div className="flex items-center justify-between p-6">
                <h2 className="text-lg font-semibold">Compensation Defaults</h2>
                {compensationOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-6 pb-6 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Base Monthly Salary</Label>
                    <Input
                      type="number"
                      value={formData.baseSalary}
                      onChange={(e) => setFormData(prev => ({ ...prev, baseSalary: Number(e.target.value) }))}
                      disabled={!formData.allowOverride}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Daily Rate</Label>
                    <Input
                      type="number"
                      value={dailyRate.toFixed(2)}
                      disabled
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Hourly Rate</Label>
                    <Input
                      type="number"
                      value={hourlyRate.toFixed(2)}
                      disabled
                      className="mt-1"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">Line Items</Label>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleAddLineItem}
                      disabled={!formData.allowOverride}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Line Item
                    </Button>
                  </div>

                  {formData.lineItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No line items configured</p>
                  ) : (
                    <div className="space-y-2">
                      {formData.lineItems.map((item) => (
                        <Card key={item.id} className="p-4 bg-muted/50">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 grid grid-cols-3 gap-3">
                              <div>
                                <Label className="text-xs">Name</Label>
                                <Input
                                  value={item.name}
                                  onChange={(e) => handleLineItemChange(item.id, "name", e.target.value)}
                                  disabled={!formData.allowOverride}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Amount</Label>
                                <Input
                                  type="number"
                                  value={item.amount}
                                  onChange={(e) => handleLineItemChange(item.id, "amount", Number(e.target.value))}
                                  disabled={!formData.allowOverride}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Taxable</Label>
                                <div className="flex items-center gap-2 mt-2">
                                  <Switch
                                    checked={item.taxable}
                                    onCheckedChange={(checked) => handleLineItemChange(item.id, "taxable", checked)}
                                    disabled={!formData.allowOverride}
                                  />
                                  <span className="text-sm">{item.taxable ? "Yes" : "No"}</span>
                                </div>
                              </div>
                            </div>
                            {item.origin && (
                              <Badge variant="secondary" className="text-xs">
                                {item.origin}
                              </Badge>
                            )}
                            {formData.allowOverride && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveLineItem(item.id)}
                              >
                                <X className="h-4 w-4" />
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
              <div className="flex items-center justify-between p-6">
                <h2 className="text-lg font-semibold">Employee Overrides</h2>
                {overridesOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-6 pb-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <Label className="text-base">Override defaults for this employee?</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Enable to allow custom values specific to this employee
                    </p>
                  </div>
                  <Switch
                    checked={formData.allowOverride}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowOverride: checked }))}
                  />
                </div>

                {formData.allowOverride && (
                  <div className="flex items-start gap-2 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <Info className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground">
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
                <div className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold">Deductions</h2>
                    <Badge>Philippines Only</Badge>
                  </div>
                  {deductionsOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-6 pb-6 space-y-4">
                  <div className="flex items-start gap-2 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <Info className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground">
                      Default government deduction values follow PH compliance. Overrides should only be used if the employee has a special arrangement.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>SSS (Employee Share)</Label>
                      <Input
                        type="number"
                        value={formData.sssEmployee}
                        onChange={(e) => setFormData(prev => ({ ...prev, sssEmployee: Number(e.target.value) }))}
                        disabled={!formData.allowOverride}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>PhilHealth (Employee Share)</Label>
                      <Input
                        type="number"
                        value={formData.philHealthEmployee}
                        onChange={(e) => setFormData(prev => ({ ...prev, philHealthEmployee: Number(e.target.value) }))}
                        disabled={!formData.allowOverride}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Pag-IBIG (Employee Share)</Label>
                      <Input
                        type="number"
                        value={formData.pagIbigEmployee}
                        onChange={(e) => setFormData(prev => ({ ...prev, pagIbigEmployee: Number(e.target.value) }))}
                        disabled={!formData.allowOverride}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Other Deductions</Label>
                      <Input
                        type="number"
                        value={formData.otherDeductions}
                        onChange={(e) => setFormData(prev => ({ ...prev, otherDeductions: Number(e.target.value) }))}
                        disabled={!formData.allowOverride}
                        className="mt-1"
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
                <div className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold">Employer Contributions</h2>
                    <Badge>Norway Only</Badge>
                  </div>
                  {contributionsOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-6 pb-6 space-y-4">
                  <div className="flex items-start gap-2 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <Info className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground">
                      Default contribution rates follow company-level Norway settings.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Holiday Pay %</Label>
                      <Input
                        type="number"
                        value={formData.holidayPay}
                        onChange={(e) => setFormData(prev => ({ ...prev, holidayPay: Number(e.target.value) }))}
                        disabled={!formData.allowOverride}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Employer Tax %</Label>
                      <Input
                        type="number"
                        value={formData.employerTax}
                        onChange={(e) => setFormData(prev => ({ ...prev, employerTax: Number(e.target.value) }))}
                        disabled={!formData.allowOverride}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Pension Contribution %</Label>
                      <Input
                        type="number"
                        value={formData.pension}
                        onChange={(e) => setFormData(prev => ({ ...prev, pension: Number(e.target.value) }))}
                        disabled={!formData.allowOverride}
                        className="mt-1"
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
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold">Preview</h2>
                  <Badge variant="secondary">Read-Only Summary</Badge>
                </div>
                {previewOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-6 pb-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                  <div>
                    <Label className="text-muted-foreground">Base Salary</Label>
                    <p className="text-lg font-semibold mt-1">
                      {formData.currency} {formData.baseSalary.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Total Allowances</Label>
                    <p className="text-lg font-semibold mt-1">
                      {formData.currency} {totalAllowances.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Total Deductions</Label>
                    <p className="text-lg font-semibold mt-1">
                      {formData.currency} {totalDeductions.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Total Employer Contributions</Label>
                    <p className="text-lg font-semibold mt-1">
                      {formData.currency} {totalEmployerContributions.toLocaleString()}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg">
                  <Label className="text-muted-foreground">Net Pay (Monthly)</Label>
                  <p className="text-3xl font-bold text-primary mt-2">
                    {formData.currency} {netPay.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Pay Cycle: {isPH ? "Bi-monthly (1st & 2nd Half)" : "Monthly"}
                  </p>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>

      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur-sm">
        <div className="container max-w-4xl mx-auto px-6 py-4 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={handleBack}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
