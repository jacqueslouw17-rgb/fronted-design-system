/**
 * Flow 1 v6 — Payroll Verification Drawer
 * 
 * When payrollIncluded is true and the candidate has submitted their form,
 * the admin needs to review & verify submitted data before moving to contract drafting.
 * India-specific: tax regime (old → investment proofs, deductions), identity docs.
 */

import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CheckCircle2, ChevronDown, FileText, AlertTriangle, Shield, Eye, ExternalLink, IndianRupee, Upload, Building2, CreditCard, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface PayrollVerificationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractor: {
    id: string;
    name: string;
    country: string;
    countryFlag: string;
    role: string;
    salary: string;
    employmentType?: string;
  } | null;
  onVerified: (contractorId: string) => void;
}

/* ── Section Card ── */
const SectionCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ title, icon, badge, defaultOpen = true, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-xl border border-border/60 bg-card/50 overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="flex items-center gap-3 px-4 py-3 bg-muted/30 border-b border-border/40 w-full text-left hover:bg-muted/50 transition-colors cursor-pointer">
            <span className="text-muted-foreground">{icon}</span>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground leading-tight">{title}</h3>
            </div>
            {badge}
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground/60 shrink-0 transition-transform duration-200", isOpen && "rotate-180")} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-4 pt-3 space-y-3">
            {children}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

/* ── Verification Row ── */
const VerificationRow: React.FC<{
  label: string;
  value: string;
  verified: boolean;
  onVerify: (checked: boolean) => void;
  hasDocument?: boolean;
  documentName?: string;
  flagged?: boolean;
  flagReason?: string;
}> = ({ label, value, verified, onVerify, hasDocument, documentName, flagged, flagReason }) => (
  <div className={cn(
    "flex items-start gap-3 p-3 rounded-lg border transition-all duration-200",
    verified ? "bg-accent-green-fill/5 border-accent-green-outline/20" : 
    flagged ? "bg-accent-amber-fill/5 border-accent-amber-outline/30" :
    "bg-muted/20 border-border/40"
  )}>
    <Checkbox
      checked={verified}
      onCheckedChange={onVerify}
      className="mt-0.5 h-4 w-4"
    />
    <div className="flex-1 min-w-0 space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {verified && <CheckCircle2 className="h-3 w-3 text-accent-green-text" />}
        {flagged && !verified && <AlertTriangle className="h-3 w-3 text-accent-amber-text" />}
      </div>
      <p className="text-sm font-medium text-foreground">{value}</p>
      {hasDocument && documentName && (
        <button className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors mt-1">
          <FileText className="h-3 w-3" />
          <span className="underline underline-offset-2">{documentName}</span>
          <ExternalLink className="h-2.5 w-2.5" />
        </button>
      )}
      {flagged && flagReason && !verified && (
        <p className="text-[10px] text-accent-amber-text mt-1">{flagReason}</p>
      )}
    </div>
  </div>
);

/* ── India Old Regime Deductions ── */
const IndiaOldRegimeSection: React.FC<{
  verifications: Record<string, boolean>;
  onVerify: (key: string, checked: boolean) => void;
}> = ({ verifications, onVerify }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2 px-1 pb-1">
      <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Old Regime Deductions</span>
    </div>
    <VerificationRow
      label="Section 80C — Investments"
      value="₹1,50,000 (ELSS + PPF + Life Insurance)"
      verified={verifications.section80c || false}
      onVerify={(c) => onVerify("section80c", c as boolean)}
      hasDocument
      documentName="80C_investment_proof.pdf"
    />
    <VerificationRow
      label="Section 80D — Health Insurance"
      value="₹25,000 (Self + Family)"
      verified={verifications.section80d || false}
      onVerify={(c) => onVerify("section80d", c as boolean)}
      hasDocument
      documentName="health_insurance_premium.pdf"
    />
    <VerificationRow
      label="HRA Exemption"
      value="₹18,000/month — Rent receipts provided"
      verified={verifications.hra || false}
      onVerify={(c) => onVerify("hra", c as boolean)}
      hasDocument
      documentName="rent_receipts_Q1-Q4.pdf"
      flagged
      flagReason="Landlord PAN not provided — verify if rent > ₹1L/year"
    />
    <VerificationRow
      label="Section 24 — Home Loan Interest"
      value="₹2,00,000 (Certificate from bank)"
      verified={verifications.section24 || false}
      onVerify={(c) => onVerify("section24", c as boolean)}
      hasDocument
      documentName="home_loan_interest_cert.pdf"
    />
  </div>
);

/* ── Main Component ── */
export const F1v6_PayrollVerificationDrawer: React.FC<PayrollVerificationDrawerProps> = ({
  open,
  onOpenChange,
  contractor,
  onVerified,
}) => {
  const [verifications, setVerifications] = useState<Record<string, boolean>>({});
  
  if (!contractor) return null;
  
  const isIndia = contractor.country === "India";
  const isPhilippines = contractor.country === "Philippines";
  const taxRegime = "old"; // Simulated: candidate selected Old regime
  
  const handleVerify = (key: string, checked: boolean) => {
    setVerifications(prev => ({ ...prev, [key]: checked }));
  };

  // Calculate verification progress
  const getRequiredKeys = () => {
    const base = ["personalInfo", "identityDoc"];
    if (isIndia) {
      base.push("pan", "taxRegime", "bankAccount");
      if (taxRegime === "old") {
        base.push("section80c", "section80d", "hra", "section24");
      }
    } else if (isPhilippines) {
      base.push("tin", "sss", "philhealth", "bankAccount");
    } else {
      base.push("taxId", "bankAccount");
    }
    return base;
  };

  const requiredKeys = getRequiredKeys();
  const verifiedCount = requiredKeys.filter(k => verifications[k]).length;
  const totalCount = requiredKeys.length;
  const allVerified = verifiedCount === totalCount;
  const progress = Math.round((verifiedCount / totalCount) * 100);

  const handleApprove = () => {
    onVerified(contractor.id);
    setVerifications({});
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[520px] overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border/60">
          <SheetHeader className="px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-accent-amber-fill/20 flex items-center justify-center">
                <Shield className="h-5 w-5 text-accent-amber-text" />
              </div>
              <div className="flex-1 min-w-0">
                <SheetTitle className="text-base font-semibold">
                  Review & Verify Submission
                </SheetTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {contractor.countryFlag} {contractor.name} · {contractor.role}
                </p>
              </div>
            </div>
          </SheetHeader>

          {/* Progress bar */}
          <div className="px-6 pb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground">Verification progress</span>
              <span className="text-xs font-medium text-foreground">{verifiedCount}/{totalCount} verified</span>
            </div>
            <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  allVerified ? "bg-accent-green-text" : "bg-primary"
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Status banner */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-accent-amber-fill/10 border border-accent-amber-outline/20">
            <AlertTriangle className="h-4 w-4 text-accent-amber-text shrink-0" />
            <div>
              <p className="text-xs font-medium text-foreground">Payroll data included — admin verification required</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Candidate submitted personal details + payroll info. Verify all items before proceeding to contract.
              </p>
            </div>
          </div>

          {/* Personal Information */}
          <SectionCard
            title="Personal Information"
            icon={<User className="h-4 w-4" />}
            badge={verifications.personalInfo && verifications.identityDoc ? (
              <Badge className="text-[10px] px-2 py-0 h-4 font-normal bg-accent-green-text/15 text-accent-green-text border-0">
                <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> Verified
              </Badge>
            ) : undefined}
          >
            <VerificationRow
              label="Full Name & Contact"
              value={`${contractor.name} · submitted email & phone`}
              verified={verifications.personalInfo || false}
              onVerify={(c) => handleVerify("personalInfo", c as boolean)}
            />
            <VerificationRow
              label={isIndia ? "Aadhaar / PAN Card" : isPhilippines ? "National ID" : "Identity Document"}
              value={isIndia ? "Aadhaar XXXX-XXXX-4532 · PAN ABCDE1234F" : isPhilippines ? "Philippine National ID uploaded" : "Passport / ID uploaded"}
              verified={verifications.identityDoc || false}
              onVerify={(c) => handleVerify("identityDoc", c as boolean)}
              hasDocument
              documentName={isIndia ? "aadhaar_pan_scan.pdf" : isPhilippines ? "national_id.pdf" : "identity_doc.pdf"}
            />
          </SectionCard>

          {/* Tax & Compliance — India specific */}
          {isIndia && (
            <SectionCard
              title="Tax & Compliance"
              icon={<IndianRupee className="h-4 w-4" />}
              badge={
                verifications.pan && verifications.taxRegime ? (
                  <Badge className="text-[10px] px-2 py-0 h-4 font-normal bg-accent-green-text/15 text-accent-green-text border-0">
                    <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> Verified
                  </Badge>
                ) : undefined
              }
            >
              <VerificationRow
                label="PAN Number"
                value="ABCDE1234F — Verified via NSDL"
                verified={verifications.pan || false}
                onVerify={(c) => handleVerify("pan", c as boolean)}
                hasDocument
                documentName="pan_card.pdf"
              />
              <VerificationRow
                label="Income Tax Regime"
                value="Old Regime — deductions claimed below"
                verified={verifications.taxRegime || false}
                onVerify={(c) => handleVerify("taxRegime", c as boolean)}
                flagged
                flagReason="Old regime selected — all investment proofs must be verified"
              />
              
              {/* Old regime deductions */}
              {taxRegime === "old" && (
                <IndiaOldRegimeSection 
                  verifications={verifications}
                  onVerify={handleVerify}
                />
              )}
            </SectionCard>
          )}

          {/* Tax & Compliance — Philippines specific */}
          {isPhilippines && (
            <SectionCard
              title="Statutory Contributions"
              icon={<Building2 className="h-4 w-4" />}
              badge={
                verifications.tin && verifications.sss && verifications.philhealth ? (
                  <Badge className="text-[10px] px-2 py-0 h-4 font-normal bg-accent-green-text/15 text-accent-green-text border-0">
                    <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> Verified
                  </Badge>
                ) : undefined
              }
            >
              <VerificationRow
                label="TIN (Tax Identification Number)"
                value="123-456-789-000"
                verified={verifications.tin || false}
                onVerify={(c) => handleVerify("tin", c as boolean)}
              />
              <VerificationRow
                label="SSS Number"
                value="34-1234567-8"
                verified={verifications.sss || false}
                onVerify={(c) => handleVerify("sss", c as boolean)}
              />
              <VerificationRow
                label="PhilHealth Number"
                value="12-345678901-2"
                verified={verifications.philhealth || false}
                onVerify={(c) => handleVerify("philhealth", c as boolean)}
              />
            </SectionCard>
          )}

          {/* Generic tax section for other countries */}
          {!isIndia && !isPhilippines && (
            <SectionCard
              title="Tax & Compliance"
              icon={<Building2 className="h-4 w-4" />}
              badge={
                verifications.taxId ? (
                  <Badge className="text-[10px] px-2 py-0 h-4 font-normal bg-accent-green-text/15 text-accent-green-text border-0">
                    <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> Verified
                  </Badge>
                ) : undefined
              }
            >
              <VerificationRow
                label="Tax ID / Registration"
                value="Tax identification submitted"
                verified={verifications.taxId || false}
                onVerify={(c) => handleVerify("taxId", c as boolean)}
                hasDocument
                documentName="tax_registration.pdf"
              />
            </SectionCard>
          )}

          {/* Payout Destination */}
          <SectionCard
            title="Payout Destination"
            icon={<CreditCard className="h-4 w-4" />}
            badge={
              verifications.bankAccount ? (
                <Badge className="text-[10px] px-2 py-0 h-4 font-normal bg-accent-green-text/15 text-accent-green-text border-0">
                  <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> Verified
                </Badge>
              ) : undefined
            }
          >
            <VerificationRow
              label="Bank Account"
              value={isIndia ? "HDFC Bank · IFSC: HDFC0001234 · A/C: XXXX4567" : isPhilippines ? "BDO · A/C: XXXX8901" : "IBAN: XXXX · SWIFT: XXXX"}
              verified={verifications.bankAccount || false}
              onVerify={(c) => handleVerify("bankAccount", c as boolean)}
              hasDocument
              documentName="bank_statement.pdf"
            />
          </SectionCard>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-background border-t border-border/60 p-4">
          <Button
            onClick={handleApprove}
            disabled={!allVerified}
            className="w-full gap-2 bg-gradient-primary hover:opacity-90"
            size="lg"
          >
            {allVerified ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Approve & Move to Contract
              </>
            ) : (
              <>
                <Shield className="h-4 w-4" />
                Verify all items to proceed ({verifiedCount}/{totalCount})
              </>
            )}
          </Button>
          {!allVerified && (
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              All items must be verified before the candidate can proceed to contract drafting
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
