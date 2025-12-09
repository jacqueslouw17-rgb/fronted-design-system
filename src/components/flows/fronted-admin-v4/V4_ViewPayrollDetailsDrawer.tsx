/**
 * Flow 1 – Fronted Admin Dashboard v4 Only
 * Read-only Payroll Details Drawer
 * 
 * Opens from cards in "Done" column
 * Shows completed payroll details in read-only mode
 */

import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle2, Building2, CreditCard, Calendar, User, Shield, Sparkles } from "lucide-react";

interface V4_Contractor {
  id: string;
  name: string;
  country: string;
  countryFlag: string;
  role: string;
  salary: string;
  email?: string;
  employmentType?: "contractor" | "employee";
  // Payroll details
  payrollDetails?: {
    bankCountry?: string;
    bankName?: string;
    accountHolderName?: string;
    accountNumber?: string;
    swiftBic?: string;
    routingCode?: string;
    payFrequency?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    submittedAt?: string;
  };
}

interface V4_ViewPayrollDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractor: V4_Contractor | null;
}

export const V4_ViewPayrollDetailsDrawer: React.FC<V4_ViewPayrollDetailsDrawerProps> = ({
  open,
  onOpenChange,
  contractor,
}) => {
  if (!contractor) return null;

  const payroll = contractor.payrollDetails || {
    bankCountry: contractor.country,
    bankName: "Sample Bank",
    accountHolderName: contractor.name,
    accountNumber: "****1234",
    swiftBic: "SAMPBKXX",
    payFrequency: "Monthly",
    submittedAt: new Date().toLocaleDateString(),
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <SheetTitle className="text-base">Payroll Details</SheetTitle>
            <Badge className="bg-accent-green-fill/20 text-accent-green-text border border-accent-green-outline/30 gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Completed
            </Badge>
          </div>
        </SheetHeader>

        {/* Worker Summary */}
        <Card className="mt-6 border-border/40 bg-gradient-to-br from-accent-green-fill/10 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 bg-primary/10 border-2 border-accent-green-outline/30">
                <AvatarFallback className="text-sm font-medium">
                  {contractor.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{contractor.name}</span>
                  <span className="text-lg">{contractor.countryFlag}</span>
                </div>
                <p className="text-sm text-muted-foreground">{contractor.role}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{contractor.salary}</p>
                <Badge variant="outline" className="text-xs capitalize">
                  {contractor.employmentType || "Contractor"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success Message */}
        <div className="mt-4 p-3 rounded-lg bg-accent-green-fill/10 border border-accent-green-outline/20 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent-green-fill/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-4 w-4 text-accent-green-text" />
          </div>
          <div>
            <p className="text-sm font-medium text-accent-green-text">Payroll ready!</p>
            <p className="text-xs text-muted-foreground">
              All details collected and verified • Submitted {payroll.submittedAt}
            </p>
          </div>
        </div>

        {/* Bank Details Section */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Bank Details</h3>
          </div>
          
          <div className="space-y-3">
            <ReadOnlyField label="Bank Country" value={payroll.bankCountry} />
            <ReadOnlyField label="Bank Name" value={payroll.bankName} />
            <ReadOnlyField label="Account Holder" value={payroll.accountHolderName} />
            <ReadOnlyField label="Account Number" value={payroll.accountNumber} masked />
            {payroll.swiftBic && <ReadOnlyField label="SWIFT / BIC" value={payroll.swiftBic} />}
            {payroll.routingCode && <ReadOnlyField label="Routing Code" value={payroll.routingCode} />}
          </div>
        </div>

        <Separator className="my-6" />

        {/* Pay Frequency Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Pay Frequency</h3>
          </div>
          
          <ReadOnlyField label="Frequency" value={payroll.payFrequency} />
        </div>

        {payroll.emergencyContactName && (
          <>
            <Separator className="my-6" />

            {/* Emergency Contact Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Emergency Contact</h3>
              </div>
              
              <div className="space-y-3">
                <ReadOnlyField label="Name" value={payroll.emergencyContactName} />
                {payroll.emergencyContactPhone && (
                  <ReadOnlyField label="Phone" value={payroll.emergencyContactPhone} />
                )}
              </div>
            </div>
          </>
        )}

        {/* Compliance Badge */}
        <div className="mt-8 pt-4 border-t flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-4 w-4 text-primary" />
          <span>Data encrypted and stored securely • GDPR Compliant</span>
        </div>
      </SheetContent>
    </Sheet>
  );
};

const ReadOnlyField: React.FC<{ label: string; value?: string; masked?: boolean }> = ({ 
  label, 
  value,
  masked 
}) => (
  <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/30">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium text-foreground">
      {masked ? value : value || "—"}
    </span>
  </div>
);

export default V4_ViewPayrollDetailsDrawer;
