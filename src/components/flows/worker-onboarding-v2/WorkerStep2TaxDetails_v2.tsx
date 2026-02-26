/**
 * Flow 3 – Candidate Onboarding v2
 * Step 2: Tax Details
 * 
 * Collects tax residency, tax ID (country-adaptive), and identity document upload.
 * Worker-friendly terminology — no "payroll parameters" language.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Info, Upload, FileText, X, Download, Check, ChevronsUpDown, IndianRupee } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Step2Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
  buttonText?: string;
  backAction?: React.ReactNode;
}

const TAX_HELPERS: Record<string, { label: string; placeholder: string; hint: string }> = {
  PH: {
    label: "TIN (Tax Identification Number)",
    placeholder: "e.g., 123-456-789-000",
    hint: "Your Philippine Tax Identification Number issued by the BIR.",
  },
  NO: {
    label: "Norwegian Tax ID (Fødselsnummer)",
    placeholder: "e.g., 12345678901",
    hint: "Your 11-digit Norwegian national identity number used for tax purposes.",
  },
  IN: {
    label: "PAN (Permanent Account Number)",
    placeholder: "e.g., ABCDE1234F",
    hint: "Your 10-character alphanumeric PAN issued by the Income Tax Department.",
  },
  US: {
    label: "SSN or Tax ID",
    placeholder: "e.g., 123-45-6789",
    hint: "Your Social Security Number or Individual Taxpayer Identification Number.",
  },
  GB: {
    label: "National Insurance Number",
    placeholder: "e.g., QQ 12 34 56 A",
    hint: "Your UK National Insurance Number (NINO) used for tax and benefits.",
  },
};

const COUNTRIES = [
  { value: "AF", label: "Afghanistan", flag: "🇦🇫" },
  { value: "AX", label: "Åland Islands", flag: "🇦🇽" },
  { value: "AL", label: "Albania", flag: "🇦🇱" },
  { value: "DZ", label: "Algeria", flag: "🇩🇿" },
  { value: "AD", label: "Andorra", flag: "🇦🇩" },
  { value: "AR", label: "Argentina", flag: "🇦🇷" },
  { value: "AU", label: "Australia", flag: "🇦🇺" },
  { value: "AT", label: "Austria", flag: "🇦🇹" },
  { value: "BE", label: "Belgium", flag: "🇧🇪" },
  { value: "BR", label: "Brazil", flag: "🇧🇷" },
  { value: "CA", label: "Canada", flag: "🇨🇦" },
  { value: "CL", label: "Chile", flag: "🇨🇱" },
  { value: "CN", label: "China", flag: "🇨🇳" },
  { value: "CO", label: "Colombia", flag: "🇨🇴" },
  { value: "HR", label: "Croatia", flag: "🇭🇷" },
  { value: "CZ", label: "Czech Republic", flag: "🇨🇿" },
  { value: "DK", label: "Denmark", flag: "🇩🇰" },
  { value: "EE", label: "Estonia", flag: "🇪🇪" },
  { value: "FI", label: "Finland", flag: "🇫🇮" },
  { value: "FR", label: "France", flag: "🇫🇷" },
  { value: "DE", label: "Germany", flag: "🇩🇪" },
  { value: "GR", label: "Greece", flag: "🇬🇷" },
  { value: "HK", label: "Hong Kong", flag: "🇭🇰" },
  { value: "HU", label: "Hungary", flag: "🇭🇺" },
  { value: "IS", label: "Iceland", flag: "🇮🇸" },
  { value: "IN", label: "India", flag: "🇮🇳" },
  { value: "ID", label: "Indonesia", flag: "🇮🇩" },
  { value: "IE", label: "Ireland", flag: "🇮🇪" },
  { value: "IL", label: "Israel", flag: "🇮🇱" },
  { value: "IT", label: "Italy", flag: "🇮🇹" },
  { value: "JP", label: "Japan", flag: "🇯🇵" },
  { value: "KE", label: "Kenya", flag: "🇰🇪" },
  { value: "XK", label: "Kosovo", flag: "🇽🇰" },
  { value: "LV", label: "Latvia", flag: "🇱🇻" },
  { value: "LT", label: "Lithuania", flag: "🇱🇹" },
  { value: "LU", label: "Luxembourg", flag: "🇱🇺" },
  { value: "MY", label: "Malaysia", flag: "🇲🇾" },
  { value: "MX", label: "Mexico", flag: "🇲🇽" },
  { value: "NL", label: "Netherlands", flag: "🇳🇱" },
  { value: "NZ", label: "New Zealand", flag: "🇳🇿" },
  { value: "NG", label: "Nigeria", flag: "🇳🇬" },
  { value: "NO", label: "Norway", flag: "🇳🇴" },
  { value: "PK", label: "Pakistan", flag: "🇵🇰" },
  { value: "PH", label: "Philippines", flag: "🇵🇭" },
  { value: "PL", label: "Poland", flag: "🇵🇱" },
  { value: "PT", label: "Portugal", flag: "🇵🇹" },
  { value: "RO", label: "Romania", flag: "🇷🇴" },
  { value: "SA", label: "Saudi Arabia", flag: "🇸🇦" },
  { value: "RS", label: "Serbia", flag: "🇷🇸" },
  { value: "SG", label: "Singapore", flag: "🇸🇬" },
  { value: "SK", label: "Slovakia", flag: "🇸🇰" },
  { value: "SI", label: "Slovenia", flag: "🇸🇮" },
  { value: "ZA", label: "South Africa", flag: "🇿🇦" },
  { value: "KR", label: "South Korea", flag: "🇰🇷" },
  { value: "ES", label: "Spain", flag: "🇪🇸" },
  { value: "SE", label: "Sweden", flag: "🇸🇪" },
  { value: "CH", label: "Switzerland", flag: "🇨🇭" },
  { value: "TH", label: "Thailand", flag: "🇹🇭" },
  { value: "TR", label: "Turkey", flag: "🇹🇷" },
  { value: "UA", label: "Ukraine", flag: "🇺🇦" },
  { value: "AE", label: "United Arab Emirates", flag: "🇦🇪" },
  { value: "GB", label: "United Kingdom", flag: "🇬🇧" },
  { value: "US", label: "United States", flag: "🇺🇸" },
  { value: "VN", label: "Vietnam", flag: "🇻🇳" },
];

const WorkerStep2TaxDetails_v2 = ({ formData, onComplete, isProcessing, buttonText, backAction }: Step2Props) => {
  const [countryOpen, setCountryOpen] = useState(false);
  const [data, setData] = useState({
    taxCountry: formData.taxCountry || "",
    taxNumber: formData.taxNumber || formData.tinNumber || "",
    identityDocUploaded: formData.identityDocUploaded || false,
    // India-specific
    indiaTaxRegime: formData.indiaTaxRegime || "",
    india80CAmount: formData.india80CAmount || "",
    india80DAmount: formData.india80DAmount || "",
    indiaInvestmentProofUploaded: formData.indiaInvestmentProofUploaded || false,
  });

  const [identityFileName, setIdentityFileName] = useState<string>(formData.identityFileName || "");

  const [investmentProofFileName, setInvestmentProofFileName] = useState<string>(formData.investmentProofFileName || "");

  const taxHelper = data.taxCountry ? TAX_HELPERS[data.taxCountry] : null;
  const isIndia = data.taxCountry === "IN";

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a JPG, PNG, or PDF file.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be under 10 MB.");
        return;
      }
      setIdentityFileName(file.name);
      setData({ ...data, identityDocUploaded: true });
    }
  };

  const handleRemoveFile = () => {
    setIdentityFileName("");
    setData({ ...data, identityDocUploaded: false });
  };

  const handleInvestmentProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a JPG, PNG, or PDF file.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be under 10 MB.");
        return;
      }
      setInvestmentProofFileName(file.name);
      setData({ ...data, indiaInvestmentProofUploaded: true });
    }
  };

  const handleRemoveInvestmentProof = () => {
    setInvestmentProofFileName("");
    setData({ ...data, indiaInvestmentProofUploaded: false });
  };

  const handleContinue = () => {
    if (!data.taxCountry) {
      toast.error("Please select your country of tax residency.");
      return;
    }
    if (!data.taxNumber) {
      toast.error("Please enter your tax identification number.");
      return;
    }
    if (!data.identityDocUploaded) {
      toast.error("Please upload your identity document.");
      return;
    }
    if (isIndia && !data.indiaTaxRegime) {
      toast.error("Please select your income tax regime.");
      return;
    }
    if (isIndia && data.indiaTaxRegime === "old" && !data.indiaInvestmentProofUploaded) {
      toast.error("Please upload proof of investments/deductions.");
      return;
    }
    onComplete("tax_details", { ...data, identityFileName, investmentProofFileName });
  };

  const isValid = data.taxCountry && data.taxNumber && 
    (!isIndia || (data.indiaTaxRegime && (data.indiaTaxRegime === "new" || data.indiaInvestmentProofUploaded)));

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
        className="space-y-5 sm:space-y-6 p-3 sm:p-6"
      >
        <div className="space-y-2">
          <h3 className="text-base sm:text-lg font-semibold">Tax Details</h3>
          <p className="text-sm text-muted-foreground">
            We need your tax information to ensure compliance and correct withholding.
          </p>
        </div>

        <div className="space-y-4">
          {/* Tax Country */}
          <div className="space-y-2">
            <Label>Country of tax residency</Label>
            <Popover open={countryOpen} onOpenChange={setCountryOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={countryOpen}
                  className="w-full justify-between text-sm font-normal h-10"
                >
                  {data.taxCountry
                    ? (() => { const c = COUNTRIES.find(c => c.value === data.taxCountry); return c ? `${c.flag} ${c.label}` : data.taxCountry; })()
                    : <span className="text-muted-foreground">Search and select country</span>}
                  <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-background border border-border z-50" align="start">
                <Command>
                  <CommandInput placeholder="Search country..." className="h-10" />
                  <CommandList className="max-h-[200px]">
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup>
                      {COUNTRIES.map((c) => (
                        <CommandItem
                          key={c.value}
                          value={`${c.label} ${c.value}`}
                          onSelect={() => {
                            setData({ ...data, taxCountry: c.value, taxNumber: "" });
                            setCountryOpen(false);
                          }}
                        >
                          <Check className={cn("mr-2 h-3.5 w-3.5", data.taxCountry === c.value ? "opacity-100" : "opacity-0")} />
                          {c.flag} {c.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Tax ID — adapts label/placeholder/hint to selected country */}
          <div className="space-y-2">
            <Label htmlFor="taxNumber">
              {taxHelper?.label || "Tax identification number"}
            </Label>
            <Input
              id="taxNumber"
              value={data.taxNumber}
              onChange={(e) => setData({ ...data, taxNumber: e.target.value })}
              placeholder={taxHelper?.placeholder || "Select country first"}
              disabled={!data.taxCountry}
            />
            {taxHelper && (
              <div className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
                <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">{taxHelper.hint}</p>
              </div>
            )}
          </div>

          {/* Identity Document Upload */}
          <div className="space-y-2">
            <Label>Identity document <span className="text-destructive">*</span></Label>
            <p className="text-xs text-muted-foreground -mt-1">
              Upload a scan of your government-issued ID — JPG, PNG, or PDF up to 10 MB.
            </p>

            {data.identityDocUploaded && identityFileName ? (
              <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border/40 bg-card/30">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 bg-accent-green-fill/10">
                    <FileText className="h-4 w-4 text-accent-green-text" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-foreground truncate">{identityFileName}</p>
                      <span className="inline-flex items-center rounded-full bg-accent-green-fill/10 px-2 py-0.5 text-[10px] font-medium text-accent-green-text border border-accent-green-fill/20">
                        Uploaded
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                    onClick={() => toast.info("Downloading identity document...")}
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Download</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-destructive"
                    onClick={handleRemoveFile}
                  >
                    <X className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Remove</span>
                  </Button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-primary/5 transition-colors">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileUpload}
                />
              </label>
            )}
          </div>
        </div>

        <div className={backAction ? "flex items-center gap-2" : ""}>
          {backAction}
          <Button
            onClick={handleContinue}
            disabled={!isValid || isProcessing}
            className={backAction ? "" : "w-full"}
            size={backAction ? "sm" : "lg"}
          >
            {isProcessing ? "Saving..." : (buttonText || "Continue")}
            {!buttonText && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WorkerStep2TaxDetails_v2;
