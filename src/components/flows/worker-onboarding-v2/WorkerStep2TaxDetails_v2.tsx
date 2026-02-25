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
import { ArrowRight, Info, Upload, FileText, X, Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Step2Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
  buttonText?: string;
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
  { value: "PH", flag: "🇵🇭", name: "Philippines" },
  { value: "NO", flag: "🇳🇴", name: "Norway" },
  { value: "IN", flag: "🇮🇳", name: "India" },
  { value: "US", flag: "🇺🇸", name: "United States" },
  { value: "GB", flag: "🇬🇧", name: "United Kingdom" },
];

const WorkerStep2TaxDetails_v2 = ({ formData, onComplete, isProcessing, buttonText }: Step2Props) => {
  const [data, setData] = useState({
    taxCountry: formData.taxCountry || "",
    taxNumber: formData.taxNumber || formData.tinNumber || "",
    identityDocUploaded: formData.identityDocUploaded || false,
  });

  const [identityFileName, setIdentityFileName] = useState<string>(formData.identityFileName || "");

  const taxHelper = data.taxCountry ? TAX_HELPERS[data.taxCountry] : null;

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
    onComplete("tax_details", { ...data, identityFileName });
  };

  const isValid = data.taxCountry && data.taxNumber;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
        className="space-y-6 p-4 sm:p-6"
      >
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Tax Details</h3>
          <p className="text-sm text-muted-foreground">
            We need your tax information to ensure compliance and correct withholding.
          </p>
        </div>

        <div className="space-y-4">
          {/* Tax Country */}
          <div className="space-y-2">
            <Label htmlFor="taxCountry">Country of tax residency</Label>
            <Select
              value={data.taxCountry}
              onValueChange={(value) => setData({ ...data, taxCountry: value, taxNumber: "" })}
            >
              <SelectTrigger id="taxCountry">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.flag} {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

        <Button
          onClick={handleContinue}
          disabled={!isValid || isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? "Saving..." : (buttonText || "Continue")}
          {!buttonText && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </motion.div>
    </AnimatePresence>
  );
};

export default WorkerStep2TaxDetails_v2;
