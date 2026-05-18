/**
 * F1v7_ExportSection – Country & batch export for accountant validation
 * Flow 1 v7 (Future) only – cloned from F1v5_ExportSection
 * Single country select with search, batch dropdown filtered by selected country
 */

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, FileSpreadsheet, Globe, ChevronDown, Search } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface F1v7_ExportSectionProps {
  onBack: () => void;
}

interface CountryData {
  code: string;
  name: string;
  flag: string;
}

interface BatchData {
  id: string;
  label: string;
  status: "in-review" | "processing" | "paid";
  date: string;
  countries: string[];
}

const COUNTRIES: CountryData[] = [
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "IE", name: "Ireland", flag: "🇮🇪" },
];

const BATCHES: BatchData[] = [
  { id: "batch-mar-2026", label: "March 2026 – Regular", status: "in-review", date: "2026-03-25", countries: ["GB", "DE", "FR", "NL", "ES", "IE"] },
  { id: "batch-mar-oc-2026", label: "March 2026 – Off-Cycle", status: "processing", date: "2026-03-15", countries: ["GB", "FR"] },
  { id: "batch-feb-2026", label: "February 2026 – Regular", status: "paid", date: "2026-02-25", countries: ["GB", "DE", "FR", "NL", "ES", "IE"] },
  { id: "batch-feb-oc-2026", label: "February 2026 – Off-Cycle", status: "paid", date: "2026-02-15", countries: ["GB", "DE"] },
  { id: "batch-jan-2026", label: "January 2026 – Regular", status: "paid", date: "2026-01-25", countries: ["GB", "DE", "FR", "NL", "ES", "IE"] },
];

const statusColors: Record<string, string> = {
  "in-review": "bg-amber-500",
  "processing": "bg-blue-500",
  "paid": "bg-emerald-500",
};

const statusLabels: Record<string, string> = {
  "in-review": "In Review",
  "processing": "Processing",
  "paid": "Paid",
};

export const F1v7_ExportSection = ({ onBack }: F1v7_ExportSectionProps) => {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [countrySearch, setCountrySearch] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [batchSearch, setBatchSearch] = useState("");
  const [batchOpen, setBatchOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const countryRef = useRef<HTMLDivElement>(null);
  const batchRef = useRef<HTMLDivElement>(null);
  const countryInputRef = useRef<HTMLInputElement>(null);
  const batchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setCountryOpen(false);
        setCountrySearch("");
      }
      if (batchRef.current && !batchRef.current.contains(e.target as Node)) {
        setBatchOpen(false);
        setBatchSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (countryOpen) countryInputRef.current?.focus();
  }, [countryOpen]);
  useEffect(() => {
    if (batchOpen) batchInputRef.current?.focus();
  }, [batchOpen]);

  const selectedCountryData = COUNTRIES.find((c) => c.code === selectedCountry);
  const filteredCountries = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const availableBatches = selectedCountry
    ? BATCHES.filter((b) => b.countries.includes(selectedCountry))
    : [];
  const filteredBatches = availableBatches.filter((b) =>
    b.label.toLowerCase().includes(batchSearch.toLowerCase())
  );

  const selectedBatchData = BATCHES.find((b) => b.id === selectedBatch);
  const canExport = selectedCountry && selectedBatch;

  const handleSelectCountry = (code: string) => {
    setSelectedCountry(code);
    setCountryOpen(false);
    setCountrySearch("");
    if (selectedBatch) {
      const batchStillValid = BATCHES.find(
        (b) => b.id === selectedBatch && b.countries.includes(code)
      );
      if (!batchStillValid) setSelectedBatch(null);
    }
  };

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      toast.success("Export sent to your email", {
        description: `${selectedCountryData?.name} · ${selectedBatchData?.label}`,
      });
    }, 1500);
  };

  return (
    <div className="space-y-5">
      {/* Country Selection */}
      <div ref={countryRef} className="relative">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Select Country</p>
        </div>

        <button
          onClick={() => setCountryOpen(!countryOpen)}
          className="v7-glass-item w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
        >
          <div className="min-w-0">
            {selectedCountryData ? (
              <div className="flex items-center gap-2.5">
                <span className="text-base">{selectedCountryData.flag}</span>
                <p className="text-sm font-medium text-foreground">
                  {selectedCountryData.name}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Choose a country…</p>
            )}
          </div>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground/60 shrink-0 transition-transform ${countryOpen ? "rotate-180" : ""}`}
          />
        </button>

        <AnimatePresence>
          {countryOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              className="absolute z-50 mt-1.5 w-full rounded-xl border border-border/40 bg-popover shadow-lg overflow-hidden"
            >
              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/30">
                <Search className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                <input
                  ref={countryInputRef}
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  placeholder="Search countries…"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
                />
              </div>
              <div className="max-h-[220px] overflow-y-auto py-1">
                {filteredCountries.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No countries found
                  </p>
                ) : (
                  filteredCountries.map((country) => {
                    const active = selectedCountry === country.code;
                    return (
                      <button
                        key={country.code}
                        onClick={() => handleSelectCountry(country.code)}
                        className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-colors ${
                          active
                            ? "bg-primary/[0.06] text-foreground"
                            : "hover:bg-muted/40 text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{country.flag}</span>
                          <span className="text-sm">{country.name}</span>
                        </div>
                        {active && (
                          <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Batch Selection */}
      <div ref={batchRef} className="relative">
        <div className="flex items-center gap-2 mb-3">
          <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Select Payroll Batch</p>
        </div>

        <button
          onClick={() => {
            if (!selectedCountry) {
              toast("Select a country first", { description: "Batches are filtered by country" });
              return;
            }
            setBatchOpen(!batchOpen);
          }}
          className={`v7-glass-item w-full flex items-center justify-between gap-3 px-4 py-3 text-left ${
            !selectedCountry ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          <div className="min-w-0">
            {selectedBatchData ? (
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full shrink-0 ${statusColors[selectedBatchData.status] || "bg-muted-foreground"}`}
                />
                <p className="text-sm font-medium text-foreground">
                  {selectedBatchData.label}
                </p>
                <span className="text-xs text-muted-foreground">
                  · {statusLabels[selectedBatchData.status]}
                </span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {selectedCountry ? "Choose a batch…" : "Select a country first"}
              </p>
            )}
          </div>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground/60 shrink-0 transition-transform ${batchOpen ? "rotate-180" : ""}`}
          />
        </button>

        <AnimatePresence>
          {batchOpen && selectedCountry && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              className="absolute z-50 mt-1.5 w-full rounded-xl border border-border/40 bg-popover shadow-lg overflow-hidden"
            >
              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/30">
                <Search className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                <input
                  ref={batchInputRef}
                  value={batchSearch}
                  onChange={(e) => setBatchSearch(e.target.value)}
                  placeholder="Search batches…"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
                />
              </div>
              <div className="max-h-[220px] overflow-y-auto py-1">
                {filteredBatches.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No batches found
                  </p>
                ) : (
                  filteredBatches.map((batch) => {
                    const active = selectedBatch === batch.id;
                    return (
                      <button
                        key={batch.id}
                        onClick={() => {
                          setSelectedBatch(batch.id);
                          setBatchOpen(false);
                          setBatchSearch("");
                        }}
                        className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-colors ${
                          active
                            ? "bg-primary/[0.06] text-foreground"
                            : "hover:bg-muted/40 text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`h-2 w-2 rounded-full shrink-0 ${statusColors[batch.status] || "bg-muted-foreground"}`}
                          />
                          <span className="text-sm">{batch.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {statusLabels[batch.status]}
                          </span>
                        </div>
                        {active && (
                          <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
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
          {exporting ? "Exporting…" : "Export for Accountant"}
        </Button>
      </div>
    </div>
  );
};
