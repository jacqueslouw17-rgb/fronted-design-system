/**
 * Flow 1 – Fronted Admin Dashboard v4 Only
 * Payroll Details Configuration Drawer
 * 
 * Opens from "Collect Payroll Details" column cards
 * Allows admin to configure which payroll fields the candidate will complete
 */

import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Building2, CreditCard, Phone, Calendar, User } from "lucide-react";
import { toast } from "sonner";

interface V4_Candidate {
  id: string;
  name: string;
  country: string;
  countryFlag: string;
  role: string;
  salary: string;
  email?: string;
  startDate?: string;
  employmentType?: "contractor" | "employee";
}

interface PayrollFieldConfig {
  id: string;
  label: string;
  required: boolean;
  enabled: boolean;
  helperText?: string;
}

interface V4_PayrollDetailsConfigDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: V4_Candidate | null;
  onSave: (candidateId: string, config: PayrollFieldConfig[]) => void;
}

const DEFAULT_FIELD_CONFIG: PayrollFieldConfig[] = [
  { id: "bank_country", label: "Bank Country", required: true, enabled: true, helperText: "Country where bank account is held" },
  { id: "bank_name", label: "Bank Name", required: true, enabled: true },
  { id: "account_holder_name", label: "Account Holder Name", required: true, enabled: true },
  { id: "account_number", label: "Account Number / IBAN", required: true, enabled: true },
  { id: "swift_bic", label: "SWIFT / BIC Code", required: false, enabled: true, helperText: "Required for international transfers" },
  { id: "routing_code", label: "Routing / Branch Code", required: false, enabled: true, helperText: "May be required depending on country" },
  { id: "pay_frequency", label: "Pay Frequency", required: false, enabled: true, helperText: "Read-only if set in contract" },
  { id: "emergency_contact_name", label: "Emergency Contact Name", required: false, enabled: true },
  { id: "emergency_contact_phone", label: "Emergency Contact Phone", required: false, enabled: true },
];

export const V4_PayrollDetailsConfigDrawer: React.FC<V4_PayrollDetailsConfigDrawerProps> = ({
  open,
  onOpenChange,
  candidate,
  onSave,
}) => {
  const [fieldConfig, setFieldConfig] = useState<PayrollFieldConfig[]>(DEFAULT_FIELD_CONFIG);

  const handleToggleEnabled = (fieldId: string) => {
    setFieldConfig(prev => 
      prev.map(field => 
        field.id === fieldId ? { ...field, enabled: !field.enabled } : field
      )
    );
  };

  const handleToggleRequired = (fieldId: string) => {
    setFieldConfig(prev => 
      prev.map(field => 
        field.id === fieldId ? { ...field, required: !field.required } : field
      )
    );
  };

  const handleSave = () => {
    if (!candidate) return;
    onSave(candidate.id, fieldConfig);
    toast.success("Payroll form configuration saved");
    onOpenChange(false);
  };

  const handleCancel = () => {
    setFieldConfig(DEFAULT_FIELD_CONFIG);
    onOpenChange(false);
  };

  if (!candidate) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-base">Configure Payroll Details Form</SheetTitle>
        </SheetHeader>

        {/* Candidate Summary (read-only) */}
        <Card className="mt-6 border-border/40 bg-muted/30">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{candidate.countryFlag}</span>
              <div>
                <p className="font-semibold text-foreground">{candidate.name}</p>
                <p className="text-sm text-muted-foreground">{candidate.role}</p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Country</p>
                <p className="font-medium">{candidate.country}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Salary</p>
                <p className="font-medium">{candidate.salary}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Employment Type</p>
                <p className="font-medium capitalize">{candidate.employmentType || "Not specified"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Start Date</p>
                <p className="font-medium">{candidate.startDate || "TBD"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Badge */}
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-4 w-4 text-primary" />
          <span>GDPR & {candidate.country} Payment Regulations Compliant</span>
        </div>

        {/* Field Configuration */}
        <div className="mt-6 space-y-6">
          {/* Bank Details Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <Label className="text-sm font-semibold">Bank Details</Label>
            </div>
            <div className="space-y-3">
              {fieldConfig.filter(f => f.id.startsWith("bank") || f.id.startsWith("account") || f.id.startsWith("swift") || f.id.startsWith("routing")).map(field => (
                <div key={field.id} className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-card/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{field.label}</span>
                      {field.required && field.enabled && (
                        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">Required</Badge>
                      )}
                    </div>
                    {field.helperText && (
                      <p className="text-xs text-muted-foreground mt-1">{field.helperText}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">Required</span>
                      <Switch 
                        checked={field.required} 
                        onCheckedChange={() => handleToggleRequired(field.id)}
                        disabled={!field.enabled}
                        className="scale-75"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">Show</span>
                      <Switch 
                        checked={field.enabled} 
                        onCheckedChange={() => handleToggleEnabled(field.id)}
                        className="scale-75"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Pay Frequency Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <Label className="text-sm font-semibold">Pay Frequency</Label>
            </div>
            <div className="space-y-3">
              {fieldConfig.filter(f => f.id === "pay_frequency").map(field => (
                <div key={field.id} className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-card/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{field.label}</span>
                      {field.required && field.enabled && (
                        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">Required</Badge>
                      )}
                    </div>
                    {field.helperText && (
                      <p className="text-xs text-muted-foreground mt-1">{field.helperText}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">Required</span>
                      <Switch 
                        checked={field.required} 
                        onCheckedChange={() => handleToggleRequired(field.id)}
                        disabled={!field.enabled}
                        className="scale-75"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">Show</span>
                      <Switch 
                        checked={field.enabled} 
                        onCheckedChange={() => handleToggleEnabled(field.id)}
                        className="scale-75"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Emergency Contact Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              <Label className="text-sm font-semibold">Emergency Contact (Optional)</Label>
            </div>
            <div className="space-y-3">
              {fieldConfig.filter(f => f.id.startsWith("emergency")).map(field => (
                <div key={field.id} className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-card/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{field.label}</span>
                      {field.required && field.enabled && (
                        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">Required</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">Required</span>
                      <Switch 
                        checked={field.required} 
                        onCheckedChange={() => handleToggleRequired(field.id)}
                        disabled={!field.enabled}
                        className="scale-75"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">Show</span>
                      <Switch 
                        checked={field.enabled} 
                        onCheckedChange={() => handleToggleEnabled(field.id)}
                        className="scale-75"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <SheetFooter className="mt-8 gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save & Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default V4_PayrollDetailsConfigDrawer;
