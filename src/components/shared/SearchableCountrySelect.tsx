/**
 * Shared searchable combobox components for Country and Nationality fields.
 * Use these across all flows for consistent UX.
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── HQ Countries (code-based, for company profile forms) ───
export const HQ_COUNTRIES = [
  { code: "NO", label: "🇳🇴 Norway" }, { code: "DK", label: "🇩🇰 Denmark" }, { code: "SE", label: "🇸🇪 Sweden" },
  { code: "FI", label: "🇫🇮 Finland" }, { code: "DE", label: "🇩🇪 Germany" }, { code: "FR", label: "🇫🇷 France" },
  { code: "NL", label: "🇳🇱 Netherlands" }, { code: "BE", label: "🇧🇪 Belgium" }, { code: "AT", label: "🇦🇹 Austria" },
  { code: "IE", label: "🇮🇪 Ireland" }, { code: "ES", label: "🇪🇸 Spain" }, { code: "PT", label: "🇵🇹 Portugal" },
  { code: "IT", label: "🇮🇹 Italy" }, { code: "GR", label: "🇬🇷 Greece" }, { code: "HR", label: "🇭🇷 Croatia" },
  { code: "BG", label: "🇧🇬 Bulgaria" }, { code: "CY", label: "🇨🇾 Cyprus" }, { code: "EE", label: "🇪🇪 Estonia" },
  { code: "LV", label: "🇱🇻 Latvia" }, { code: "LT", label: "🇱🇹 Lithuania" }, { code: "LU", label: "🇱🇺 Luxembourg" },
  { code: "MT", label: "🇲🇹 Malta" }, { code: "SK", label: "🇸🇰 Slovakia" }, { code: "SI", label: "🇸🇮 Slovenia" },
  { code: "PL", label: "🇵🇱 Poland" }, { code: "XK", label: "🇽🇰 Kosovo" }, { code: "CH", label: "🇨🇭 Switzerland" },
  { code: "GB", label: "🇬🇧 United Kingdom" }, { code: "PH", label: "🇵🇭 Philippines" }, { code: "IN", label: "🇮🇳 India" },
  { code: "SG", label: "🇸🇬 Singapore" }, { code: "JP", label: "🇯🇵 Japan" }, { code: "KR", label: "🇰🇷 South Korea" },
  { code: "US", label: "🇺🇸 United States" }, { code: "CA", label: "🇨🇦 Canada" }, { code: "MX", label: "🇲🇽 Mexico" },
  { code: "BR", label: "🇧🇷 Brazil" }, { code: "AU", label: "🇦🇺 Australia" }, { code: "NZ", label: "🇳🇿 New Zealand" },
  { code: "AE", label: "🇦🇪 United Arab Emirates" }, { code: "ZA", label: "🇿🇦 South Africa" }, { code: "IL", label: "🇮🇱 Israel" },
];

// ─── Working Countries (name-based, for candidate/contract forms) ───
export const WORKING_COUNTRIES = [
  { name: "Norway", flag: "🇳🇴" }, { name: "Sweden", flag: "🇸🇪" }, { name: "Denmark", flag: "🇩🇰" },
  { name: "Philippines", flag: "🇵🇭" }, { name: "India", flag: "🇮🇳" }, { name: "Kosovo", flag: "🇽🇰" },
  { name: "Singapore", flag: "🇸🇬" }, { name: "Spain", flag: "🇪🇸" }, { name: "Romania", flag: "🇷🇴" },
];

// ─── Nationalities ───
export const NATIONALITIES = [
  { label: "🇦🇫 Afghan", value: "Afghan" }, { label: "🇺🇸 American", value: "American" },
  { label: "🇦🇷 Argentine", value: "Argentine" }, { label: "🇦🇺 Australian", value: "Australian" },
  { label: "🇦🇹 Austrian", value: "Austrian" }, { label: "🇧🇪 Belgian", value: "Belgian" },
  { label: "🇧🇷 Brazilian", value: "Brazilian" }, { label: "🇬🇧 British", value: "British" },
  { label: "🇧🇬 Bulgarian", value: "Bulgarian" }, { label: "🇨🇦 Canadian", value: "Canadian" },
  { label: "🇨🇳 Chinese", value: "Chinese" }, { label: "🇭🇷 Croatian", value: "Croatian" },
  { label: "🇨🇾 Cypriot", value: "Cypriot" }, { label: "🇨🇿 Czech", value: "Czech" },
  { label: "🇩🇰 Danish", value: "Danish" }, { label: "🇳🇱 Dutch", value: "Dutch" },
  { label: "🇪🇪 Estonian", value: "Estonian" }, { label: "🇵🇭 Filipino", value: "Filipino" },
  { label: "🇫🇮 Finnish", value: "Finnish" }, { label: "🇫🇷 French", value: "French" },
  { label: "🇩🇪 German", value: "German" }, { label: "🇬🇷 Greek", value: "Greek" },
  { label: "🇭🇺 Hungarian", value: "Hungarian" }, { label: "🇮🇳 Indian", value: "Indian" },
  { label: "🇮🇩 Indonesian", value: "Indonesian" }, { label: "🇮🇪 Irish", value: "Irish" },
  { label: "🇮🇱 Israeli", value: "Israeli" }, { label: "🇮🇹 Italian", value: "Italian" },
  { label: "🇯🇵 Japanese", value: "Japanese" }, { label: "🇽🇰 Kosovar", value: "Kosovar" },
  { label: "🇰🇷 South Korean", value: "South Korean" }, { label: "🇱🇻 Latvian", value: "Latvian" },
  { label: "🇱🇹 Lithuanian", value: "Lithuanian" }, { label: "🇱🇺 Luxembourgish", value: "Luxembourgish" },
  { label: "🇲🇾 Malaysian", value: "Malaysian" }, { label: "🇲🇹 Maltese", value: "Maltese" },
  { label: "🇲🇽 Mexican", value: "Mexican" }, { label: "🇳🇿 New Zealander", value: "New Zealander" },
  { label: "🇳🇴 Norwegian", value: "Norwegian" }, { label: "🇵🇰 Pakistani", value: "Pakistani" },
  { label: "🇵🇱 Polish", value: "Polish" }, { label: "🇵🇹 Portuguese", value: "Portuguese" },
  { label: "🇷🇴 Romanian", value: "Romanian" }, { label: "🇸🇬 Singaporean", value: "Singaporean" },
  { label: "🇸🇰 Slovak", value: "Slovak" }, { label: "🇸🇮 Slovenian", value: "Slovenian" },
  { label: "🇿🇦 South African", value: "South African" }, { label: "🇪🇸 Spanish", value: "Spanish" },
  { label: "🇸🇪 Swedish", value: "Swedish" }, { label: "🇨🇭 Swiss", value: "Swiss" },
  { label: "🇹🇭 Thai", value: "Thai" }, { label: "🇹🇷 Turkish", value: "Turkish" },
  { label: "🇦🇪 Emirati", value: "Emirati" }, { label: "🇺🇦 Ukrainian", value: "Ukrainian" },
  { label: "🇻🇳 Vietnamese", value: "Vietnamese" },
];

// ─── HQ Country Combobox (code-based) ───
export const HQCountryCombobox: React.FC<{
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
  className?: string;
}> = ({ value, onChange, disabled, className }) => {
  const [open, setOpen] = useState(false);
  const selected = HQ_COUNTRIES.find(c => c.code === value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} disabled={disabled} className={cn("w-full justify-between text-sm font-normal", className)}>
          {selected ? selected.label : "Select country"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-background border border-border z-50" align="start">
        <Command>
          <CommandInput placeholder="Search country..." className="h-10" />
          <CommandList className="max-h-[240px]">
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {HQ_COUNTRIES.map(c => (
                <CommandItem key={c.code} value={c.label} onSelect={() => { onChange(c.code); setOpen(false); }} className="text-sm">
                  <Check className={cn("mr-2 h-4 w-4", value === c.code ? "opacity-100" : "opacity-0")} />
                  {c.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// ─── Working Country Combobox (name-based, for candidate forms) ───
export const WorkingCountryCombobox: React.FC<{
  value: string;
  onChange: (name: string) => void;
  /** Optionally restrict to specific country names */
  countries?: { name: string; flag: string }[];
  placeholder?: string;
  className?: string;
}> = ({ value, onChange, countries, placeholder = "Select country", className }) => {
  const [open, setOpen] = useState(false);
  const list = countries || WORKING_COUNTRIES;
  const selected = list.find(c => c.name === value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className={cn("w-full justify-between text-sm font-normal h-11", className)}>
          {selected ? <span>{selected.flag} {selected.name}</span> : <span className="text-muted-foreground">{placeholder}</span>}
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-background border border-border z-50" align="start">
        <Command>
          <CommandInput placeholder="Search country..." className="h-10" />
          <CommandList className="max-h-[200px]">
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {list.map(c => (
                <CommandItem key={c.name} value={`${c.flag} ${c.name}`} onSelect={() => { onChange(c.name); setOpen(false); }} className="text-sm">
                  <Check className={cn("mr-2 h-4 w-4", value === c.name ? "opacity-100" : "opacity-0")} />
                  {c.flag} {c.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// ─── Nationality Combobox ───
export const NationalityCombobox: React.FC<{
  value: string;
  onChange: (val: string) => void;
  className?: string;
}> = ({ value, onChange, className }) => {
  const [open, setOpen] = useState(false);
  const selected = NATIONALITIES.find(n => n.value === value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className={cn("w-full justify-between text-sm font-normal h-10", className)}>
          {selected ? selected.label : <span className="text-muted-foreground">Select nationality</span>}
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-background border border-border z-50" align="start">
        <Command>
          <CommandInput placeholder="Search nationality..." className="h-10" />
          <CommandList className="max-h-[200px]">
            <CommandEmpty>No nationality found.</CommandEmpty>
            <CommandGroup>
              {NATIONALITIES.map(n => (
                <CommandItem key={n.value} value={n.label} onSelect={() => { onChange(n.value); setOpen(false); }} className="text-sm">
                  <Check className={cn("mr-2 h-4 w-4", value === n.value ? "opacity-100" : "opacity-0")} />
                  {n.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
