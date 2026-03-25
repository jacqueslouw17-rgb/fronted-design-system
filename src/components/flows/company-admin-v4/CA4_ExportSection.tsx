/**
 * CA4_ExportSection – Country & batch export for accountant validation
 * Flow 6 Company Admin Dashboard v4 only
 * Cloned from F1v5_ExportSection
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Download, FileSpreadsheet, Globe, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface CA4_ExportSectionProps {
  onBack: () => void;
}

const COUNTRIES = [
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "IE", name: "Ireland", flag: "🇮🇪" },
];

const BATCHES = [
  { id: "batch-mar-2026", label: "March 2026 – Regular", status: "in-review", date: "2026-03-25" },
  { id: "batch-feb-2026", label: "February 2026 – Regular", status: "completed", date: "2026-02-25" },
  { id: "batch-feb-oc-2026", label: "February 2026 – Off-Cycle", status: "completed", date: "2026-02-15" },
  { id: "batch-jan-2026", label: "January 2026 – Regular", status: "completed", date: "2026-01-25" },
];

const statusColors: Record<string, string> = {
  "in-review": "bg-amber-500",
  "completed": "bg-emerald-500",
};

export const CA4_ExportSection = ({ onBack }: CA4_ExportSectionProps) => {
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [batchOpen, setBatchOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const toggleCountry = (code: string) => {
    setSelectedCountries((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const selectAll = () => {
    if (selectedCountries.length === COUNTRIES.length) {
      setSelectedCountries([]);
    } else {
      setSelectedCountries(COUNTRIES.map((c) => c.code));
    }
  };

  const selectedBatchData = BATCHES.find((b) => b.id === selectedBatch);
  const canExport = selectedCountries.length > 0 && selectedBatch;

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      toast.success(
        `Export sent to your email`,
        { description: `${selectedCountries.length} ${selectedCountries.length === 1 ? "country" : "countries"} · ${selectedBatchData?.label}` }
      );
    }, 1500);
  };

  return (
    <div className="space-y-5">
      {/* Country Selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Select Countries</p>
          </div>
          <button
            onClick={selectAll}
            className="text-xs text-primary hover:text-primary/80 transition-colors"
          >
            {selectedCountries.length === COUNTRIES.length ? "Deselect all" : "Select all"}
          </button>
        </div>

        <div className="space-y-1.5">
          {COUNTRIES.map((country) => {
            const selected = selectedCountries.includes(country.code);
            return (
              <button
                key={country.code}
                onClick={() => toggleCountry(country.code)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-all text-left group ${
                  selected
                    ? "border-primary/40 bg-primary/[0.06]"
                    : "border-border/30 bg-card/20 hover:bg-card/40 hover:border-border/50"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-base">{country.flag}</span>
                  <p className="text-sm font-medium text-foreground">{country.name}</p>
                </div>
                <div
                  className={`h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                    selected
                      ? "bg-primary border-primary"
                      : "border-border/60 group-hover:border-border"
                  }`}
                >
                  {selected && <Check className="h-3 w-3 text-primary-foreground" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Batch Selection */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Select Payroll Batch</p>
        </div>

        <button
          onClick={() => setBatchOpen(!batchOpen)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-border/30 bg-card/20 hover:bg-card/40 hover:border-border/50 transition-all text-left"
        >
          <div className="min-w-0">
            {selectedBatchData ? (
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full shrink-0 ${statusColors[selectedBatchData.status] || "bg-muted-foreground"}`}
                />
                <p className="text-sm font-medium text-foreground">{selectedBatchData.label}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Choose a batch…</p>
            )}
          </div>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground/60 shrink-0 transition-transform ${batchOpen ? "rotate-180" : ""}`}
          />
        </button>

        <AnimatePresence>
          {batchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="mt-1.5 space-y-1">
                {BATCHES.map((batch) => (
                  <button
                    key={batch.id}
                    onClick={() => {
                      setSelectedBatch(batch.id);
                      setBatchOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-left ${
                      selectedBatch === batch.id
                        ? "bg-primary/[0.06] text-foreground"
                        : "hover:bg-card/40 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full shrink-0 ${statusColors[batch.status] || "bg-muted-foreground"}`}
                    />
                    <span className="text-sm">{batch.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 justify-center pt-2">
        <Button
          variant="outline"
          onClick={onBack}
          className="rounded-xl"
          size="sm"
        >
          Back
        </Button>
        <Button
          onClick={handleExport}
          disabled={!canExport || exporting}
          className="rounded-xl gap-2"
          size="sm"
        >
          <Download className="h-3.5 w-3.5" />
          {exporting ? "Exporting…" : "Export for Accountant"}
        </Button>
      </div>
    </div>
  );
};
