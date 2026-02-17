/**
 * Flow 1 v5 — Country Templates for Company Creation
 * 
 * Multi-select countries, per-country template management with file upload slots.
 * Reuses types from F1v5_CountryTemplatesSection for compatibility.
 */

import React, { useState, useCallback, useMemo } from "react";
import { Globe, Plus, X, ChevronRight, FileText, Upload, Check, Trash2, Loader2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

// ── Types ──

export interface TemplateSlot {
  type: string;
  label: string;
  shortLabel: string;
  required: boolean;
  fileName?: string;
  fileSize?: string;
  status: "empty" | "uploaded" | "default";
}

export interface CreationCountryEntry {
  countryCode: string;
  countryName: string;
  flag: string;
  slots: TemplateSlot[];
}

// ── Constants ──

const AVAILABLE_COUNTRIES = [
  { code: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "XK", name: "Kosovo", flag: "🇽🇰" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "IE", name: "Ireland", flag: "🇮🇪" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
];

const DEFAULT_SLOTS: Omit<TemplateSlot, "status">[] = [
  { type: "employment-agreement", label: "Employment Agreement", shortLabel: "Agreement", required: true },
  { type: "nda", label: "Non-Disclosure Agreement", shortLabel: "NDA", required: false },
  { type: "data-privacy", label: "Data Privacy Addendum", shortLabel: "Privacy", required: false },
  { type: "ip-addendum", label: "IP Assignment & Carve-outs", shortLabel: "IP", required: false },
  { type: "restrictive-covenants", label: "Restrictive Covenants", shortLabel: "Covenants", required: false },
  { type: "home-office", label: "Home Office Policy", shortLabel: "Home Office", required: false },
];

const createEmptySlots = (): TemplateSlot[] =>
  DEFAULT_SLOTS.map(s => ({ ...s, status: "empty" as const }));

const createDefaultSlots = (): TemplateSlot[] =>
  DEFAULT_SLOTS.map(s => ({
    ...s,
    status: "default" as const,
    fileName: `${s.shortLabel.toLowerCase().replace(/\s+/g, "-")}-template.pdf`,
    fileSize: `${Math.floor(Math.random() * 200 + 80)}KB`,
  }));

// ── Sub-components ──

const SlotRow: React.FC<{
  slot: TemplateSlot;
  onUpload: (type: string, file: File) => void;
  onRemove: (type: string) => void;
}> = ({ slot, onUpload, onRemove }) => {
  const hasFile = slot.status !== "empty";
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(slot.type, file);
    }
    // Reset so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-md border border-border/30 bg-background/60">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc"
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="flex items-center justify-center h-7 w-7 rounded bg-muted/40 border border-border/20 shrink-0">
        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-foreground truncate">{slot.label}</span>
          {slot.required && (
            <span className="text-[9px] text-destructive font-medium">Required</span>
          )}
        </div>
        {hasFile ? (
          <p className="text-[10px] text-muted-foreground truncate">
            {slot.fileName}
            {slot.fileSize && ` · ${slot.fileSize}`}
            {slot.status === "default" && (
              <span className="ml-1 text-primary/70">· Default</span>
            )}
          </p>
        ) : (
          <p className="text-[10px] text-muted-foreground/50">No file attached</p>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {hasFile ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(slot.type)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-3 w-3 mr-1" />
            Upload
          </Button>
        )}
      </div>
    </div>
  );
};

// ── Manage Templates Sheet ──

const ManageTemplatesSheet: React.FC<{
  entry: CreationCountryEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateSlots: (countryCode: string, slots: TemplateSlot[]) => void;
}> = ({ entry, open, onOpenChange, onUpdateSlots }) => {
  if (!entry) return null;

  const attachedCount = entry.slots.filter(s => s.status !== "empty").length;
  const requiredMet = entry.slots.filter(s => s.required).every(s => s.status !== "empty");

  const handleUpload = (type: string, file: File) => {
    const slot = entry.slots.find(s => s.type === type);
    if (!slot) return;
    const sizeKB = Math.round(file.size / 1024);
    const newSlots = entry.slots.map(s =>
      s.type === type
        ? {
            ...s,
            status: "uploaded" as const,
            fileName: file.name,
            fileSize: sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)}MB` : `${sizeKB}KB`,
          }
        : s
    );
    onUpdateSlots(entry.countryCode, newSlots);
    toast({ title: "File uploaded", description: `${slot.label} template attached.` });
  };

  const handleRemove = (type: string) => {
    const newSlots = entry.slots.map(s =>
      s.type === type
        ? { ...s, status: "empty" as const, fileName: undefined, fileSize: undefined }
        : s
    );
    onUpdateSlots(entry.countryCode, newSlots);
  };

  const handleUseDefaults = () => {
    onUpdateSlots(entry.countryCode, createDefaultSlots());
    toast({ title: "Default templates applied", description: `All template slots filled for ${entry.countryName}.` });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <div className="px-5 pt-5 pb-4 border-b border-border/30 flex-shrink-0">
          <div className="flex items-center gap-2.5 mb-1">
            <span className="text-xl">{entry.flag}</span>
            <SheetTitle className="text-base font-semibold">{entry.countryName} templates</SheetTitle>
          </div>
          <SheetDescription className="text-xs">
            Attach base contract documents for {entry.countryName}. Agreement is required.
          </SheetDescription>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {/* Template slots */}
          <div className="space-y-1.5">
            {entry.slots.map(slot => (
              <SlotRow
                key={slot.type}
                slot={slot}
                onUpload={handleUpload}
                onRemove={handleRemove}
              />
            ))}
          </div>

          {/* Contextual action below last slot */}
          <div className="mt-1 rounded-lg border border-border/20 bg-muted/30 px-3.5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary">
                <span className="text-[10px] font-semibold">{attachedCount}</span>
              </div>
              <span className="text-[11px] text-muted-foreground">
                of {entry.slots.length} templates attached
                {!requiredMet && (
                  <span className="ml-1.5 text-destructive font-medium">· Agreement required</span>
                )}
              </span>
            </div>
            <Button
              size="sm"
              className="h-7 text-xs px-4"
              onClick={() => onOpenChange(false)}
            >
              Done
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ── Main Component ──

interface Props {
  selectedCountries: CreationCountryEntry[];
  onCountriesChange: (countries: CreationCountryEntry[]) => void;
  error?: string;
}

export const F1v5_CreationCountryTemplates: React.FC<Props> = ({
  selectedCountries,
  onCountriesChange,
  error,
}) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [managingCountry, setManagingCountry] = useState<string | null>(null);

  const managingEntry = useMemo(
    () => selectedCountries.find(c => c.countryCode === managingCountry) || null,
    [selectedCountries, managingCountry]
  );

  const availableForSelection = useMemo(
    () => AVAILABLE_COUNTRIES.filter(c => !selectedCountries.some(sc => sc.countryCode === c.code)),
    [selectedCountries]
  );

  const handleAddCountry = useCallback((code: string) => {
    const country = AVAILABLE_COUNTRIES.find(c => c.code === code);
    if (!country) return;
    const entry: CreationCountryEntry = {
      countryCode: country.code,
      countryName: country.name,
      flag: country.flag,
      slots: createEmptySlots(),
    };
    onCountriesChange([...selectedCountries, entry]);
    setPopoverOpen(false);
  }, [selectedCountries, onCountriesChange]);

  const handleRemoveCountry = useCallback((code: string) => {
    onCountriesChange(selectedCountries.filter(c => c.countryCode !== code));
  }, [selectedCountries, onCountriesChange]);

  const handleUpdateSlots = useCallback((countryCode: string, slots: TemplateSlot[]) => {
    onCountriesChange(
      selectedCountries.map(c =>
        c.countryCode === countryCode ? { ...c, slots } : c
      )
    );
  }, [selectedCountries, onCountriesChange]);

  return (
    <>
      <div className="space-y-2">
        <Label className="text-sm">
          Country templates
          <span className="text-destructive ml-0.5">*</span>
        </Label>

        {selectedCountries.length === 0 ? (
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="w-full rounded-md border border-dashed border-border/40 bg-muted/10 hover:bg-muted/20 hover:border-primary/30 py-5 flex flex-col items-center gap-2 transition-colors cursor-pointer group"
              >
                <div className="h-8 w-8 rounded-full border border-dashed border-primary/30 bg-primary/[0.04] group-hover:border-primary/50 group-hover:bg-primary/[0.08] flex items-center justify-center transition-colors">
                  <Plus className="h-4 w-4 text-primary/50 group-hover:text-primary transition-colors" />
                </div>
                <p className="text-xs text-muted-foreground/60 group-hover:text-muted-foreground text-center max-w-[260px] transition-colors">
                  Add a country to attach compliant contract templates.
                </p>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0" align="start" side="bottom" sideOffset={4}>
              <Command>
                <CommandInput placeholder="Search countries…" />
                <CommandList>
                  <CommandEmpty>No countries found.</CommandEmpty>
                  <CommandGroup>
                    {availableForSelection.map(country => (
                      <CommandItem
                        key={country.code}
                        value={`${country.name} ${country.code}`}
                        onSelect={() => handleAddCountry(country.code)}
                        className="flex items-center gap-2.5 px-3 py-2 cursor-pointer text-sm"
                      >
                        <span>{country.flag}</span>
                        <span>{country.name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        ) : (
          <>
            <div className="space-y-1.5">
              {selectedCountries.map((entry) => {
                const attached = entry.slots.filter(s => s.status !== "empty").length;
                const requiredMet = entry.slots.filter(s => s.required).every(s => s.status !== "empty");

                return (
                  <div
                    key={entry.countryCode}
                    className="flex items-center gap-2.5 rounded-md border border-border/30 bg-background/60 px-3 py-2 group"
                  >
                    <span className="text-base shrink-0">{entry.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-foreground">{entry.countryName}</span>
                        {attached > 0 ? (
                          <Badge variant="secondary" className="h-4 px-1.5 text-[9px] border-0 bg-primary/10 text-primary">
                            {attached} template{attached !== 1 ? "s" : ""} attached
                          </Badge>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/50">No templates attached</span>
                        )}
                        {!requiredMet && attached > 0 && (
                          <span className="text-[9px] text-destructive">Missing required</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                        onClick={() => setManagingCountry(entry.countryCode)}
                      >
                        Manage
                        <ChevronRight className="h-3 w-3 ml-0.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground/40 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveCountry(entry.countryCode)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add another country */}
            {availableForSelection.length > 0 && (
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 text-xs text-primary/70 hover:text-primary transition-colors mt-1"
                  >
                    <Plus className="h-3 w-3" />
                    Add country
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-0" align="start" side="bottom" sideOffset={4}>
                  <Command>
                    <CommandInput placeholder="Search countries…" />
                    <CommandList>
                      <CommandEmpty>No countries found.</CommandEmpty>
                      <CommandGroup>
                        {availableForSelection.map(country => (
                          <CommandItem
                            key={country.code}
                            value={`${country.name} ${country.code}`}
                            onSelect={() => handleAddCountry(country.code)}
                            className="flex items-center gap-2.5 px-3 py-2 cursor-pointer text-sm"
                          >
                            <span>{country.flag}</span>
                            <span>{country.name}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          </>
        )}

        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <ManageTemplatesSheet
        entry={managingEntry}
        open={!!managingCountry}
        onOpenChange={(open) => { if (!open) setManagingCountry(null); }}
        onUpdateSlots={handleUpdateSlots}
      />
    </>
  );
};
