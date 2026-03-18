/**
 * Flow 2 v3 — Step 1: Personal Profile (Future)
 * 
 * Glass-styled personal profile step for Flow 2 v3 only.
 */

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Lock, Info } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const NATIONALITIES = [
  "American", "Australian", "Brazilian", "British", "Canadian", "Chinese", "Danish",
  "Dutch", "Filipino", "Finnish", "French", "German", "Greek", "Indian", "Indonesian",
  "Irish", "Italian", "Japanese", "Korean", "Kosovar", "Malaysian", "Mexican",
  "Norwegian", "Polish", "Portuguese", "Romanian", "Russian", "Singaporean",
  "South African", "Spanish", "Swedish", "Swiss", "Thai", "Turkish", "Ukrainian",
];

interface CountryRule {
  idLabel: string;
  idPlaceholder: string;
}

const COUNTRY_RULES: Record<string, CountryRule> = {
  Philippines: { idLabel: "TIN / PhilHealth ID", idPlaceholder: "e.g., 123-456-789-000" },
  Norway: { idLabel: "National ID (Fødselsnummer)", idPlaceholder: "11-digit personal number" },
  Sweden: { idLabel: "Personal Number (Personnummer)", idPlaceholder: "YYMMDD-XXXX" },
  India: { idLabel: "PAN Number", idPlaceholder: "e.g., ABCDE1234F" },
  Kosovo: { idLabel: "Personal ID Number", idPlaceholder: "National ID number" },
  Denmark: { idLabel: "CPR Number", idPlaceholder: "DDMMYY-XXXX" },
  Singapore: { idLabel: "NRIC / FIN", idPlaceholder: "e.g., S1234567A" },
  Spain: { idLabel: "DNI / NIE", idPlaceholder: "e.g., 12345678Z" },
  Romania: { idLabel: "CNP (Personal Numeric Code)", idPlaceholder: "13-digit code" },
};

const LockedField = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-1.5">
    <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      <Lock className="h-3 w-3" />
      {label}
    </Label>
    <Input value={value} disabled className="bg-white/40 text-muted-foreground/80 cursor-not-allowed border-primary/10 text-sm backdrop-blur-sm" />
  </div>
);

interface F2v3PersonalProfileStepProps {
  formData: Record<string, any>;
  prefilled: { fullName: string; email: string; country: string };
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
}

const F2v3_PersonalProfileStep: React.FC<F2v3PersonalProfileStepProps> = ({ formData, prefilled, onComplete, isProcessing }) => {
  const countryRule = COUNTRY_RULES[prefilled.country];
  const [data, setData] = useState({
    nationality: formData.nationality || "",
    address: formData.address || "",
    idNumber: formData.idNumber || "",
  });
  const isValid = data.nationality && data.idNumber;

  const handleContinue = () => {
    if (!isValid) { toast.error("Please fill in all required fields"); return; }
    onComplete("personal_profile", data);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="space-y-5 w-full sm:max-w-xl sm:mx-auto px-1 sm:px-0"
    >
      <div className="v7-glass-card rounded-2xl p-5 sm:p-6 space-y-4">
        <LockedField label="Full Name" value={prefilled.fullName} />
        <LockedField label="Email" value={prefilled.email} />

        <div className="border-t border-primary/10 pt-4 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground/80">Nationality</Label>
            <Select value={data.nationality} onValueChange={(v) => setData({ ...data, nationality: v })}>
              <SelectTrigger className="bg-white/50 border-primary/10 backdrop-blur-sm">
                <SelectValue placeholder="Select your nationality" />
              </SelectTrigger>
              <SelectContent>
                {NATIONALITIES.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground/80 flex items-center gap-1.5">
              Residential Address
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-normal bg-white/40 border-primary/10">Optional</Badge>
            </Label>
            <Input
              value={data.address}
              onChange={e => setData({ ...data, address: e.target.value })}
              placeholder="Full residential address"
              className="bg-white/50 border-primary/10 backdrop-blur-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground/80">{countryRule?.idLabel || "ID Number"}</Label>
            <Input
              value={data.idNumber}
              onChange={e => setData({ ...data, idNumber: e.target.value })}
              placeholder={countryRule?.idPlaceholder || "Government-issued ID number"}
              className="bg-white/50 border-primary/10 backdrop-blur-sm"
            />
            {countryRule && (
              <div className="flex items-start gap-2 p-2.5 rounded-lg v7-glass-item">
                <Info className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Your {countryRule.idLabel} as required for {prefilled.country}.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={handleContinue}
        disabled={!isValid || isProcessing}
        className="w-full h-12 rounded-xl text-sm font-semibold text-primary-foreground transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 bg-gradient-primary"
      >
        {isProcessing ? "Saving..." : "Continue"}
        <ArrowRight className="h-4 w-4" />
      </button>
    </motion.div>
  );
};

export default F2v3_PersonalProfileStep;
