/**
 * F1v6_ManualWorkerDrawer — "Add Worker Manually" drawer for Done column
 * 
 * Allows admins to add a worker directly to Done (CERTIFIED) status
 * when they already have all details and contracts signed externally.
 * 
 * 5 Sections: Personal Profile, Working Engagement, Payroll Parameters,
 * Payout Destination, Documents
 */

import React, { useState, useRef } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { ChevronDown, Upload, X, FileText, CheckCircle2, AlertCircle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getCurrencyCode } from "@/utils/currencyUtils";
import { NationalityCombobox, WorkingCountryCombobox } from "@/components/shared/SearchableCountrySelect";

// ─── Country Rules ───
interface CountryRule {
  flag: string; currency: string;
  probation: { default: number; max: number };
  noticePeriod: { default: number; min: number };
  annualLeave: { default: number; min: number };
  sickLeave: { default: number; min: number };
  weeklyHours: { default: number; max: number };
  payFrequency: { default: string; locked: boolean };
  // Document requirements
  mandatoryDocs: string[];
  optionalDocs: string[];
}

const COUNTRY_RULES: Record<string, CountryRule> = {
  India: {
    flag: "🇮🇳", currency: "INR",
    probation: { default: 90, max: 180 }, noticePeriod: { default: 30, min: 30 },
    annualLeave: { default: 21, min: 21 }, sickLeave: { default: 12, min: 12 },
    weeklyHours: { default: 48, max: 48 }, payFrequency: { default: "monthly", locked: true },
    mandatoryDocs: ["Identity document (Aadhaar/Passport)", "PAN Card", "Employment/Contractor agreement"],
    optionalDocs: ["Investment proof (80C/80D)", "Bank passbook / cancelled cheque"],
  },
  Philippines: {
    flag: "🇵🇭", currency: "PHP",
    probation: { default: 180, max: 180 }, noticePeriod: { default: 30, min: 30 },
    annualLeave: { default: 5, min: 5 }, sickLeave: { default: 5, min: 5 },
    weeklyHours: { default: 48, max: 48 }, payFrequency: { default: "fortnightly", locked: true },
    mandatoryDocs: ["Identity document (Passport/National ID)", "TIN certificate", "Employment/Contractor agreement"],
    optionalDocs: ["PhilHealth ID", "SSS ID", "Pag-IBIG ID"],
  },
  Norway: {
    flag: "🇳🇴", currency: "NOK",
    probation: { default: 180, max: 180 }, noticePeriod: { default: 30, min: 30 },
    annualLeave: { default: 25, min: 25 }, sickLeave: { default: 365, min: 0 },
    weeklyHours: { default: 37.5, max: 40 }, payFrequency: { default: "monthly", locked: true },
    mandatoryDocs: ["Identity document (Passport)", "Employment/Contractor agreement"],
    optionalDocs: ["Tax card (Skattekort)", "Work permit (non-EEA)"],
  },
  Singapore: {
    flag: "🇸🇬", currency: "SGD",
    probation: { default: 90, max: 180 }, noticePeriod: { default: 30, min: 7 },
    annualLeave: { default: 7, min: 7 }, sickLeave: { default: 14, min: 14 },
    weeklyHours: { default: 44, max: 44 }, payFrequency: { default: "monthly", locked: true },
    mandatoryDocs: ["Identity document (NRIC/Passport)", "Employment/Contractor agreement"],
    optionalDocs: ["Work pass (EP/S Pass)", "Tax residency certificate"],
  },
  Spain: {
    flag: "🇪🇸", currency: "EUR",
    probation: { default: 60, max: 180 }, noticePeriod: { default: 15, min: 15 },
    annualLeave: { default: 22, min: 22 }, sickLeave: { default: 365, min: 0 },
    weeklyHours: { default: 40, max: 40 }, payFrequency: { default: "monthly", locked: true },
    mandatoryDocs: ["Identity document (DNI/Passport)", "Employment/Contractor agreement"],
    optionalDocs: ["Social Security number", "Tax certificate"],
  },
  Kosovo: {
    flag: "🇽🇰", currency: "EUR",
    probation: { default: 180, max: 180 }, noticePeriod: { default: 30, min: 30 },
    annualLeave: { default: 20, min: 20 }, sickLeave: { default: 20, min: 20 },
    weeklyHours: { default: 40, max: 40 }, payFrequency: { default: "monthly", locked: true },
    mandatoryDocs: ["Identity document (Passport)", "Employment/Contractor agreement"],
    optionalDocs: ["Tax ID certificate"],
  },
  Sweden: {
    flag: "🇸🇪", currency: "SEK",
    probation: { default: 180, max: 180 }, noticePeriod: { default: 30, min: 30 },
    annualLeave: { default: 25, min: 25 }, sickLeave: { default: 365, min: 0 },
    weeklyHours: { default: 40, max: 40 }, payFrequency: { default: "monthly", locked: true },
    mandatoryDocs: ["Identity document (Passport)", "Employment/Contractor agreement"],
    optionalDocs: ["Personnummer certificate", "Work permit (non-EU)"],
  },
  Denmark: {
    flag: "🇩🇰", currency: "DKK",
    probation: { default: 90, max: 90 }, noticePeriod: { default: 30, min: 30 },
    annualLeave: { default: 25, min: 25 }, sickLeave: { default: 365, min: 0 },
    weeklyHours: { default: 37, max: 37 }, payFrequency: { default: "monthly", locked: true },
    mandatoryDocs: ["Identity document (Passport)", "Employment/Contractor agreement"],
    optionalDocs: ["CPR number document", "Tax card"],
  },
  Romania: {
    flag: "🇷🇴", currency: "RON",
    probation: { default: 90, max: 90 }, noticePeriod: { default: 20, min: 20 },
    annualLeave: { default: 20, min: 20 }, sickLeave: { default: 183, min: 0 },
    weeklyHours: { default: 40, max: 40 }, payFrequency: { default: "monthly", locked: true },
    mandatoryDocs: ["Identity document (CI/Passport)", "Employment/Contractor agreement"],
    optionalDocs: ["Tax registration certificate"],
  },
};

const DEFAULT_RULE: CountryRule = {
  flag: "🌍", currency: "USD",
  probation: { default: 90, max: 180 }, noticePeriod: { default: 30, min: 30 },
  annualLeave: { default: 20, min: 20 }, sickLeave: { default: 10, min: 0 },
  weeklyHours: { default: 40, max: 40 }, payFrequency: { default: "monthly", locked: true },
  mandatoryDocs: ["Identity document", "Employment/Contractor agreement"],
  optionalDocs: [],
};

interface ManualWorkerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (worker: {
    id: string;
    name: string;
    country: string;
    countryFlag: string;
    role: string;
    salary: string;
    employmentType: "contractor" | "employee";
    status: "CERTIFIED";
  }) => void;
}

/* ── Section Card ── */
const SectionCard: React.FC<{
  title: string;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ title, badge, defaultOpen = true, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-xl border border-border/60 bg-card/50 overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="flex items-center gap-3 px-5 py-3 bg-muted/30 border-b border-border/40 w-full text-left hover:bg-muted/50 transition-colors cursor-pointer">
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

/* ── Field wrapper ── */
const Field: React.FC<{
  label: string;
  optional?: boolean;
  hint?: string;
  children: React.ReactNode;
}> = ({ label, optional, hint, children }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
      {label}
      {optional && <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-normal">Optional</Badge>}
    </Label>
    {children}
    {hint && <p className="text-muted-foreground text-[11px]">{hint}</p>}
  </div>
);

/* ── Number with unit ── */
const NumberFieldWithUnit: React.FC<{
  value: string; onChange: (v: string) => void; unit: string; min?: number; max?: number; step?: number;
}> = ({ value, onChange, unit, min, max, step }) => (
  <div className="flex items-center gap-2">
    <Input type="number" value={value} onChange={e => onChange(e.target.value)} min={min} max={max} step={step}
      className="flex-1 h-10 [appearance:textfield] [&::-webkit-outer-spin-button]:opacity-100 [&::-webkit-inner-spin-button]:opacity-100" />
    <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2.5 py-2 rounded-md border border-border/40 whitespace-nowrap select-none">{unit}</span>
  </div>
);

interface DocUpload {
  name: string;
  mandatory: boolean;
  file: File | null;
  signed: boolean;
}

export const F1v6_ManualWorkerDrawer: React.FC<ManualWorkerDrawerProps> = ({
  open,
  onOpenChange,
  onSave,
}) => {
  // Personal Profile
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [nationality, setNationality] = useState("");
  const [address, setAddress] = useState("");
  const [nationalId, setNationalId] = useState("");

  // Working Engagement
  const [role, setRole] = useState("");
  const [country, setCountry] = useState("");
  const [employmentType, setEmploymentType] = useState<"contractor" | "employee">("contractor");
  const [startDate, setStartDate] = useState("");
  const [salary, setSalary] = useState("");
  const [city, setCity] = useState("");
  const [probation, setProbation] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("");
  const [annualLeave, setAnnualLeave] = useState("");
  const [sickLeave, setSickLeave] = useState("");
  const [weeklyHours, setWeeklyHours] = useState("");

  // Payroll Parameters
  const [tin, setTin] = useState("");
  const [philHealth, setPhilHealth] = useState("");
  const [payFrequency, setPayFrequency] = useState("monthly");

  // Payout Destination
  const [bankCountry, setBankCountry] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [swiftBic, setSwiftBic] = useState("");

  // Documents
  const [documents, setDocuments] = useState<DocUpload[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingDocIndex, setUploadingDocIndex] = useState<number | null>(null);

  const countryRule = COUNTRY_RULES[country] || (country ? DEFAULT_RULE : null);

  // Update defaults when country changes
  React.useEffect(() => {
    if (!countryRule) return;
    setProbation(String(countryRule.probation.default));
    setNoticePeriod(String(countryRule.noticePeriod.default));
    setAnnualLeave(String(countryRule.annualLeave.default));
    setSickLeave(String(countryRule.sickLeave.default));
    setWeeklyHours(String(countryRule.weeklyHours.default));
    setPayFrequency(countryRule.payFrequency.default);
    setBankCountry(country);
    // Build document list
    const docs: DocUpload[] = [
      ...countryRule.mandatoryDocs.map(d => ({ name: d, mandatory: true, file: null, signed: false })),
      ...countryRule.optionalDocs.map(d => ({ name: d, mandatory: false, file: null, signed: false })),
    ];
    setDocuments(docs);
  }, [country]);

  const handleFileUpload = (index: number) => {
    setUploadingDocIndex(index);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploadingDocIndex === null) return;
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, or PDF accepted.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5 MB.");
      return;
    }
    setDocuments(prev => prev.map((d, i) => i === uploadingDocIndex ? { ...d, file } : d));
    setUploadingDocIndex(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleSigned = (index: number) => {
    setDocuments(prev => prev.map((d, i) => i === index ? { ...d, signed: !d.signed } : d));
  };

  const removeFile = (index: number) => {
    setDocuments(prev => prev.map((d, i) => i === index ? { ...d, file: null } : d));
  };

  const mandatoryDocsComplete = documents.filter(d => d.mandatory).every(d => d.file !== null);
  const agreementSigned = documents.filter(d => d.name.toLowerCase().includes("agreement")).every(d => d.signed);
  const canSave = name.trim() && country && role.trim() && salary.trim() && mandatoryDocsComplete && agreementSigned;

  const handleSave = () => {
    const flag = countryRule?.flag || "🌍";
    const currencyCode = getCurrencyCode(country, employmentType);
    onSave({
      id: `manual-${Date.now()}`,
      name: name.trim(),
      country,
      countryFlag: flag,
      role: role.trim(),
      salary: `${currencyCode} ${salary}`,
      employmentType,
      status: "CERTIFIED",
    });
    toast.success(`${name.trim()} added to Done`, { description: "Worker profile is active and payroll-ready." });
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setName(""); setEmail(""); setPhone(""); setDob(""); setNationality(""); setAddress(""); setNationalId("");
    setRole(""); setCountry(""); setEmploymentType("contractor"); setStartDate(""); setSalary(""); setCity("");
    setProbation(""); setNoticePeriod(""); setAnnualLeave(""); setSickLeave(""); setWeeklyHours("");
    setTin(""); setPhilHealth(""); setPayFrequency("monthly");
    setBankCountry(""); setBankName(""); setAccountHolder(""); setAccountNumber(""); setSwiftBic("");
    setDocuments([]);
  };

  const uploadedMandatoryCount = documents.filter(d => d.mandatory && d.file).length;
  const totalMandatoryCount = documents.filter(d => d.mandatory).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[85%] sm:w-full sm:max-w-xl p-0 flex flex-col overflow-hidden">
        <SheetHeader className="px-5 pt-4 pb-3 border-b border-border/30 shrink-0">
          <SheetDescription className="sr-only">Add worker manually</SheetDescription>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <SheetTitle className="text-base font-semibold text-foreground leading-tight truncate">
                {name.trim() || "New Worker"}
              </SheetTitle>
              {country && countryRule && <span className="text-base shrink-0">{countryRule.flag}</span>}
            </div>
            <p className="text-[11px] text-muted-foreground/60 mt-0.5">Add directly to Done · All details provided by admin</p>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              For workers already running payroll externally. Fill all sections, upload signed contracts, and save.
            </p>
          </div>
        </SheetHeader>

        <input ref={fileInputRef} type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} />

        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
          {/* ── 1) Personal Profile ── */}
          <SectionCard title="Personal Profile">
            <Field label="Full Name">
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Juan Dela Cruz" className="h-10" />
            </Field>
            <Field label="Email">
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="worker@email.com" className="h-10" />
            </Field>
            <Field label="Phone" optional>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+63 917 123 4567" className="h-10" />
            </Field>
            <Field label="Date of Birth" optional>
              <Input type="date" value={dob} onChange={e => setDob(e.target.value)} className="h-10" />
            </Field>
            <Field label="Nationality" optional>
              <NationalityCombobox value={nationality} onChange={setNationality} />
            </Field>
            <Field label="Address" optional>
              <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Residential address" className="h-10" />
            </Field>
            <Field label="National ID / Government ID" optional>
              <Input value={nationalId} onChange={e => setNationalId(e.target.value)} placeholder="ID number" className="h-10" />
            </Field>
          </SectionCard>

          {/* ── 2) Working Engagement ── */}
          <SectionCard title="Working Engagement">
            <Field label="Role / Job Title">
              <Input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Software Engineer" className="h-10" />
            </Field>
            <Field label="Country">
              <WorkingCountryCombobox
                value={country}
                onChange={setCountry}
                countries={Object.entries(COUNTRY_RULES).map(([c, r]) => ({ name: c, flag: r.flag }))}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Employment Type">
                <Select value={employmentType} onValueChange={(v: "contractor" | "employee") => setEmploymentType(v)}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contractor">Contractor</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Start Date">
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-10" />
              </Field>
            </div>
            <Field label={employmentType === "employee" ? "Salary" : "Consultancy Fee"}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium pointer-events-none select-none">
                  {country ? getCurrencyCode(country, employmentType) : "USD"}
                </span>
                <Input value={salary} onChange={e => setSalary(e.target.value.replace(/[^0-9]/g, ''))} placeholder="5,000" className="pl-12 h-10" />
              </div>
            </Field>
            <Field label="Work Location" optional>
              <Input value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Manila, Oslo" className="h-10" />
            </Field>

            {/* Terms */}
            {countryRule && (
              <div className="border-t border-border/40 pt-3 mt-1">
                <p className="text-[11px] text-muted-foreground mb-3">Country defaults for {country} — adjust as negotiated</p>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Probation Period" hint={`Max: ${countryRule.probation.max} days`}>
                      <NumberFieldWithUnit value={probation} onChange={setProbation} unit="days" min={0} max={countryRule.probation.max} />
                    </Field>
                    <Field label="Notice Period" hint={`Min: ${countryRule.noticePeriod.min} days`}>
                      <NumberFieldWithUnit value={noticePeriod} onChange={setNoticePeriod} unit="days" min={countryRule.noticePeriod.min} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Annual Leave" hint={`Min: ${countryRule.annualLeave.min} days`}>
                      <NumberFieldWithUnit value={annualLeave} onChange={setAnnualLeave} unit="days" min={countryRule.annualLeave.min} />
                    </Field>
                    <Field label="Sick Leave" hint={`Min: ${countryRule.sickLeave.min} days`}>
                      <NumberFieldWithUnit value={sickLeave} onChange={setSickLeave} unit="days" min={countryRule.sickLeave.min} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Weekly Hours" hint={`Max: ${countryRule.weeklyHours.max} hrs`}>
                      <NumberFieldWithUnit value={weeklyHours} onChange={setWeeklyHours} unit="hours" max={countryRule.weeklyHours.max} step={0.5} />
                    </Field>
                  </div>
                </div>
              </div>
            )}
          </SectionCard>

          {/* ── 3) Payroll Parameters ── */}
          <SectionCard title="Payroll Parameters" defaultOpen={!!country}>
            <Field label="Pay Frequency">
              <Select value={payFrequency} onValueChange={setPayFrequency}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="fortnightly">Fortnightly</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Tax Identification Number (TIN)">
              <Input value={tin} onChange={e => setTin(e.target.value)} placeholder="e.g. 123-456-789-000" className="h-10" />
            </Field>
            {country === "Philippines" && (
              <Field label="PhilHealth Number" optional>
                <Input value={philHealth} onChange={e => setPhilHealth(e.target.value)} placeholder="12-345678901-2" className="h-10" />
              </Field>
            )}
          </SectionCard>

          {/* ── 4) Payout Destination ── */}
          <SectionCard title="Payout Destination" defaultOpen={!!country}>
            <Field label="Bank Country">
              <Input value={bankCountry} onChange={e => setBankCountry(e.target.value)} placeholder="Same as working country" className="h-10" />
            </Field>
            <Field label="Bank Name">
              <Input value={bankName} onChange={e => setBankName(e.target.value)} placeholder="e.g. BDO Unibank" className="h-10" />
            </Field>
            <Field label="Account Holder Name">
              <Input value={accountHolder || name} onChange={e => setAccountHolder(e.target.value)} className="h-10" />
            </Field>
            <Field label="Account Number / IBAN">
              <Input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="Account number" className="h-10" />
            </Field>
            <Field label="SWIFT / BIC" optional>
              <Input value={swiftBic} onChange={e => setSwiftBic(e.target.value)} placeholder="e.g. BNORPHMM" className="h-10" />
            </Field>
          </SectionCard>

          {/* ── 5) Documents ── */}
          <SectionCard
            title="Documents"
            badge={
              country ? (
                <div className="flex items-center gap-1.5">
                  {mandatoryDocsComplete && agreementSigned && (
                    <Badge className="text-[10px] px-2 py-0 h-4 font-normal bg-accent-green-text/15 text-accent-green-text border-0">
                      <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                      Verified
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-[10px] px-2 py-0 h-4 font-normal">
                    {uploadedMandatoryCount}/{totalMandatoryCount} required
                  </Badge>
                </div>
              ) : undefined
            }
          >
            {!country ? (
              <p className="text-xs text-muted-foreground/60 text-center py-4">Select a country first to see required documents</p>
            ) : (
              <div className="space-y-2">
                {documents.map((doc, i) => (
                  <div key={i} className={cn(
                    "rounded-lg border p-3 transition-colors",
                    doc.mandatory && !doc.file ? "border-amber-500/30 bg-amber-500/5" : "border-border/40 bg-card/30",
                  )}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                          {doc.mandatory ? (
                            <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 border-amber-500/30 text-amber-600 shrink-0">Required</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[9px] px-1 py-0 h-3.5 shrink-0">Optional</Badge>
                          )}
                        </div>
                        {doc.file ? (
                          <div className="flex items-center gap-2 mt-1.5">
                            <FileText className="h-3 w-3 text-primary/70" />
                            <span className="text-[11px] text-muted-foreground truncate">{doc.file.name}</span>
                            <button onClick={() => removeFile(i)} className="text-muted-foreground/50 hover:text-destructive transition-colors">
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleFileUpload(i)}
                            className="flex items-center gap-1.5 mt-1.5 text-[11px] text-primary hover:text-primary/80 transition-colors"
                          >
                            <Upload className="h-3 w-3" />
                            Upload file
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Signed toggle for agreements */}
                    {doc.name.toLowerCase().includes("agreement") && doc.file && (
                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-border/30">
                        <span className="text-[11px] text-muted-foreground">Signed by both parties?</span>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          {doc.signed ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-accent-green-text" />
                          ) : (
                            <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                          )}
                          <Switch checked={doc.signed} onCheckedChange={(checked) => {
                            setDocuments(prev => prev.map((d, idx) => idx === i ? { ...d, signed: checked } : d));
                          }} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Validation summary */}
          {country && !canSave && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
              <p className="text-[11px] text-amber-700 font-medium mb-1">Before saving:</p>
              <ul className="text-[11px] text-amber-600 space-y-0.5 list-disc list-inside">
                {!name.trim() && <li>Enter worker's full name</li>}
                {!role.trim() && <li>Enter job title / role</li>}
                {!salary.trim() && <li>Enter salary or fee amount</li>}
                {!mandatoryDocsComplete && <li>Upload all required documents</li>}
                {!agreementSigned && <li>Confirm agreement is signed by both parties</li>}
              </ul>
            </div>
          )}

          {/* Save */}
          <div className="pt-4 pb-2">
            <Button
              onClick={handleSave}
              disabled={!canSave}
              className="w-full"
            >
              Save & Add to Done
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default F1v6_ManualWorkerDrawer;
