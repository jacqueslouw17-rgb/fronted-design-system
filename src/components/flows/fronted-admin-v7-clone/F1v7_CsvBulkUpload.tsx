/**
 * F1v7 CSV Bulk Upload — Drag-and-drop CSV parser for bulk worker creation
 * ISOLATED: Only used in Flow 1 v7 (Future)
 */
import React, { useState, useCallback, useRef } from "react";
import * as XLSX from "xlsx";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Upload, FileSpreadsheet, AlertCircle, Check, X, Users,
  Briefcase, ChevronDown, ChevronUp, Trash2, Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Country lookup for flags ───────────────────────────────────────────
const COUNTRY_FLAGS: Record<string, string> = {
  Norway: "🇳🇴", Sweden: "🇸🇪", Denmark: "🇩🇰", Philippines: "🇵🇭",
  India: "🇮🇳", Kosovo: "🇽🇰", "United States": "🇺🇸", "United Kingdom": "🇬🇧",
  Germany: "🇩🇪", France: "🇫🇷", Spain: "🇪🇸", Netherlands: "🇳🇱",
  Canada: "🇨🇦", Australia: "🇦🇺", Brazil: "🇧🇷", Mexico: "🇲🇽",
  Japan: "🇯🇵", "South Korea": "🇰🇷", Singapore: "🇸🇬", Portugal: "🇵🇹",
  Poland: "🇵🇱", Ireland: "🇮🇪", Italy: "🇮🇹", Belgium: "🇧🇪",
  Switzerland: "🇨🇭", Austria: "🇦🇹", Finland: "🇫🇮", Estonia: "🇪🇪",
  Latvia: "🇱🇻", Lithuania: "🇱🇹", Romania: "🇷🇴", Bulgaria: "🇧🇬",
  Croatia: "🇭🇷", Serbia: "🇷🇸", "Czech Republic": "🇨🇿", Hungary: "🇭🇺",
  Greece: "🇬🇷", Turkey: "🇹🇷", "South Africa": "🇿🇦", Nigeria: "🇳🇬",
  Kenya: "🇰🇪", Egypt: "🇪🇬", UAE: "🇦🇪", "Saudi Arabia": "🇸🇦",
  Israel: "🇮🇱", Argentina: "🇦🇷", Colombia: "🇨🇴", Chile: "🇨🇱",
  Peru: "🇵🇪", Thailand: "🇹🇭", Vietnam: "🇻🇳", Indonesia: "🇮🇩",
  Malaysia: "🇲🇾", China: "🇨🇳", Taiwan: "🇹🇼", "New Zealand": "🇳🇿",
  Pakistan: "🇵🇰", Bangladesh: "🇧🇩", Ukraine: "🇺🇦", Ghana: "🇬🇭",
};

interface ParsedWorker {
  id: string;
  name: string;
  email: string;
  country: string;
  countryFlag: string;
  role: string;
  salary: string;
  employmentType: "contractor" | "employee";
  selected: boolean;
  errors: string[];
}

interface CsvBulkUploadProps {
  onImport: (workers: any[]) => void;
  onCancel: () => void;
}

// ─── CSV Parsing ────────────────────────────────────────────────────────

const REQUIRED_HEADERS = ["name", "email", "country", "role", "salary", "type"];

const HEADER_ALIASES: Record<string, string> = {
  "full name": "name", "full_name": "name", "worker name": "name", "worker_name": "name",
  "first name": "name", "first_name": "name", "employee name": "name",
  "email address": "email", "email_address": "email", "work email": "email",
  "working country": "country", "work country": "country", "location": "country",
  "job title": "role", "job_title": "role", "position": "role", "title": "role",
  "monthly salary": "salary", "annual salary": "salary", "compensation": "salary", "pay": "salary",
  "employment type": "type", "employment_type": "type", "worker type": "type", "worker_type": "type",
  "contract type": "type", "contract_type": "type",
};

function normalizeHeader(h: string): string {
  const lower = h.trim().toLowerCase().replace(/[^a-z0-9_ ]/g, "");
  return HEADER_ALIASES[lower] || lower;
}

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };
  
  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]).map(normalizeHeader);
  const rows = lines.slice(1).map(parseLine);
  return { headers, rows };
}

function resolveEmploymentType(val: string): "contractor" | "employee" {
  const lower = val.toLowerCase().trim();
  if (["contractor", "cor", "independent", "freelance", "freelancer"].includes(lower)) return "contractor";
  return "employee";
}

function parseWorkers(text: string): { workers: ParsedWorker[]; errors: string[] } {
  const { headers, rows } = parseCSV(text);
  const globalErrors: string[] = [];

  // Check required headers
  const missing = REQUIRED_HEADERS.filter(h => !headers.includes(h));
  if (missing.length > 0) {
    globalErrors.push(`Missing columns: ${missing.join(", ")}. Expected: ${REQUIRED_HEADERS.join(", ")}`);
    return { workers: [], errors: globalErrors };
  }

  const colIndex = (name: string) => headers.indexOf(name);

  const workers: ParsedWorker[] = rows
    .filter(row => row.some(cell => cell.trim()))
    .map((row, idx) => {
      const errors: string[] = [];
      const name = row[colIndex("name")] || "";
      const email = row[colIndex("email")] || "";
      const country = row[colIndex("country")] || "";
      const role = row[colIndex("role")] || "";
      const salary = row[colIndex("salary")] || "";
      const type = row[colIndex("type")] || "employee";

      if (!name) errors.push("Missing name");
      if (!email) errors.push("Missing email");
      if (!country) errors.push("Missing country");
      if (!role) errors.push("Missing role");
      if (!salary) errors.push("Missing salary");

      const flag = COUNTRY_FLAGS[country] || "🏳️";

      return {
        id: `csv-${Date.now()}-${idx}`,
        name,
        email,
        country,
        countryFlag: flag,
        role,
        salary: salary.startsWith("$") || salary.startsWith("€") || salary.startsWith("£") ? salary : salary,
        employmentType: resolveEmploymentType(type),
        selected: errors.length === 0,
        errors,
      };
    });

  return { workers, errors: globalErrors };
}

// ─── CSV Template Download ──────────────────────────────────────────────

function downloadTemplate() {
  const csv = `name,email,country,role,salary,type
Maria Santos,maria@example.com,Philippines,Senior Developer,$4500,contractor
John Smith,john@example.com,Norway,Product Manager,$8000,employee
Sarah Chen,sarah@example.com,Sweden,UX Designer,$6500,employee`;
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "workers-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Component ──────────────────────────────────────────────────────────

export const F1v7_CsvBulkUpload: React.FC<CsvBulkUploadProps> = ({ onImport, onCancel }) => {
  const [dragOver, setDragOver] = useState(false);
  const [parsedWorkers, setParsedWorkers] = useState<ParsedWorker[] | null>(null);
  const [globalErrors, setGlobalErrors] = useState<string[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processText = useCallback((text: string) => {
    const { workers, errors } = parseWorkers(text);
    setParsedWorkers(workers);
    setGlobalErrors(errors);
    if (errors.length > 0) {
      toast.error(errors[0]);
    } else if (workers.length === 0) {
      toast.error("No workers found");
    } else {
      toast.success(`Found ${workers.length} worker${workers.length > 1 ? "s" : ""}`);
    }
  }, []);

  const handleFile = useCallback((file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(ext || "")) {
      toast.error("Please upload a .csv or .xlsx file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large — max 5MB");
      return;
    }

    if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const csvText = XLSX.utils.sheet_to_csv(sheet);
          processText(csvText);
        } catch {
          toast.error("Could not read spreadsheet — check the format");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => processText(e.target?.result as string);
      reader.readAsText(file);
    }
  }, [processText]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const toggleWorker = (id: string) => {
    setParsedWorkers(prev => prev?.map(w => w.id === id ? { ...w, selected: !w.selected } : w) || null);
  };

  const toggleAll = (checked: boolean) => {
    setParsedWorkers(prev => prev?.map(w => w.errors.length === 0 ? { ...w, selected: checked } : w) || null);
  };

  const removeWorker = (id: string) => {
    setParsedWorkers(prev => prev?.filter(w => w.id !== id) || null);
  };

  const handleImport = () => {
    if (!parsedWorkers) return;
    const selected = parsedWorkers.filter(w => w.selected && w.errors.length === 0);
    if (selected.length === 0) {
      toast.error("No valid workers selected");
      return;
    }
    const formatted = selected.map(w => ({
      id: w.id,
      name: w.name,
      country: w.country,
      countryFlag: w.countryFlag,
      role: w.role,
      salary: w.salary,
      status: "offer-accepted" as const,
      formSent: false,
      dataReceived: false,
      employmentType: w.employmentType,
      hasATSData: false,
      email: w.email,
    }));
    onImport(formatted);
  };

  const validWorkers = parsedWorkers?.filter(w => w.errors.length === 0) || [];
  const errorWorkers = parsedWorkers?.filter(w => w.errors.length > 0) || [];
  const selectedCount = parsedWorkers?.filter(w => w.selected && w.errors.length === 0).length || 0;
  const allValidSelected = validWorkers.length > 0 && validWorkers.every(w => w.selected);

  // ─── Upload Zone ────────────────────────────────────────────────────
  if (!parsedWorkers || parsedWorkers.length === 0) {
    const hasError = globalErrors.length > 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* Drop zone — turns red on error */}
        <div
          className={cn(
            "relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer group",
            hasError
              ? "border-destructive/50 bg-destructive/[0.04] hover:border-destructive/70 hover:bg-destructive/[0.06]"
              : dragOver
                ? "border-primary bg-primary/5 scale-[1.01]"
                : "border-border/60 hover:border-primary/40 hover:bg-muted/30"
          )}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={handleFileInput}
          />
          <div className="flex flex-col items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
              hasError
                ? "bg-destructive/10 text-destructive"
                : dragOver
                  ? "bg-primary/15 text-primary"
                  : "bg-muted/60 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
            )}>
              {hasError ? (
                <AlertCircle className="h-6 w-6" />
              ) : dragOver ? (
                <FileSpreadsheet className="h-6 w-6" />
              ) : (
                <Upload className="h-6 w-6" />
              )}
            </div>
            <div>
              {hasError ? (
                <>
                  <p className="text-sm font-medium text-destructive">{globalErrors[0]}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Try another file or <span className="text-primary underline underline-offset-2">browse</span> to replace
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-foreground">
                    {dragOver ? "Drop your file here" : "Drag & drop a CSV or Excel file"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    or <span className="text-primary underline underline-offset-2">browse files</span> · .csv, .xlsx — max 5MB
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Template + format info */}
        <div className="flex items-center justify-between px-1">
          <p className="text-[11px] text-muted-foreground">
            Columns: <span className="font-medium text-foreground/70">name, email, country, role, salary, type</span>
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-[11px] text-primary gap-1 px-2"
            onClick={(e) => { e.stopPropagation(); downloadTemplate(); }}
          >
            <Download className="h-3 w-3" />
            Template
          </Button>
        </div>
      </motion.div>
    );
  }

  // ─── Preview Table ──────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Summary bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            {parsedWorkers.length} worker{parsedWorkers.length !== 1 ? "s" : ""} found
          </span>
          {errorWorkers.length > 0 && (
            <Badge variant="outline" className="text-[10px] h-5 border-destructive/30 text-destructive gap-1">
              <AlertCircle className="h-2.5 w-2.5" />
              {errorWorkers.length} with errors
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-[11px] text-muted-foreground gap-1"
          onClick={() => { setParsedWorkers(null); setGlobalErrors([]); }}
        >
          <X className="h-3 w-3" />
          Clear
        </Button>
      </div>

      {/* Select all */}
      <div className="flex items-center gap-2 px-1">
        <Checkbox
          checked={allValidSelected}
          onCheckedChange={(checked) => toggleAll(checked as boolean)}
          className="h-3.5 w-3.5"
        />
        <span className="text-[11px] text-muted-foreground">
          Select all valid ({validWorkers.length})
        </span>
      </div>

      {/* Worker list */}
      <ScrollArea className="h-[320px] rounded-lg border border-border/50">
        <div className="divide-y divide-border/30">
          {/* Valid workers first */}
          {validWorkers.map((worker) => (
            <div
              key={worker.id}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/30",
                worker.selected && "bg-primary/[0.03]"
              )}
            >
              <Checkbox
                checked={worker.selected}
                onCheckedChange={() => toggleWorker(worker.id)}
                className="h-3.5 w-3.5 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground truncate">{worker.name}</span>
                  {worker.employmentType === "contractor" ? (
                    <Briefcase className="h-3 w-3 text-muted-foreground shrink-0" />
                  ) : (
                    <Users className="h-3 w-3 text-muted-foreground shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-muted-foreground">
                    {worker.countryFlag} {worker.country}
                  </span>
                  <span className="text-[10px] text-muted-foreground/50">·</span>
                  <span className="text-[11px] text-muted-foreground truncate">{worker.role}</span>
                  <span className="text-[10px] text-muted-foreground/50">·</span>
                  <span className="text-[11px] font-medium text-foreground tabular-nums">{worker.salary}</span>
                </div>
              </div>
              <button
                onClick={() => removeWorker(worker.id)}
                className="p-1 rounded-md text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}

          {/* Error workers in collapsible */}
          {errorWorkers.length > 0 && (
            <div>
              <button
                onClick={() => setShowErrors(!showErrors)}
                className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-muted/20 transition-colors"
              >
                <AlertCircle className="h-3.5 w-3.5 text-destructive/60" />
                <span className="text-[11px] font-medium text-destructive/70">
                  {errorWorkers.length} row{errorWorkers.length !== 1 ? "s" : ""} with errors — will be skipped
                </span>
                {showErrors ? <ChevronUp className="h-3 w-3 text-muted-foreground ml-auto" /> : <ChevronDown className="h-3 w-3 text-muted-foreground ml-auto" />}
              </button>
              <AnimatePresence>
                {showErrors && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    {errorWorkers.map((worker) => (
                      <div
                        key={worker.id}
                        className="flex items-center gap-3 px-3 py-2 bg-destructive/[0.03] opacity-50"
                      >
                        <X className="h-3 w-3 text-destructive/50 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs text-foreground/60 truncate block">
                            {worker.name || "—"} · {worker.email || "—"}
                          </span>
                          <span className="text-[10px] text-destructive/60">
                            {worker.errors.join(", ")}
                          </span>
                        </div>
                        <button
                          onClick={() => removeWorker(worker.id)}
                          className="p-1 rounded-md text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <Button variant="outline" className="flex-1 h-11" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          className="flex-1 h-11 gap-2"
          onClick={handleImport}
          disabled={selectedCount === 0}
        >
          <Check className="h-4 w-4" />
          Import {selectedCount} Worker{selectedCount !== 1 ? "s" : ""}
        </Button>
      </div>
    </motion.div>
  );
};
