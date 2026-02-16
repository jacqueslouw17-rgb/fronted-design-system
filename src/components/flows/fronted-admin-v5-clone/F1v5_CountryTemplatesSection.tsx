/**
 * Flow 1 v5 — Country Base Templates Section
 * 
 * Shown inside Company Settings (edit mode).
 * Lists country templates for the selected company, opens a right-side drawer for editing.
 */

import React, { useState, useMemo, useCallback } from "react";
import { Search, Globe, Clock, User, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { F1v5_CountryTemplateDrawer } from "./F1v5_CountryTemplateDrawer";

// ── Types ──

export interface TemplateAuditEntry {
  id: string;
  actionType: "SAVE_EDIT" | "RESET";
  summary: string;
  actor: string;
  timestamp: string; // ISO
}

export interface CountryTemplate {
  id: string;
  countryCode: string;
  countryName: string;
  flag: string;
  content: string;
  defaultContent: string;
  updatedAt: string; // ISO
  updatedBy: string;
  audit: TemplateAuditEntry[];
}

// ── Mock Data ──

const COUNTRY_FLAGS: Record<string, string> = {
  SG: "🇸🇬", ES: "🇪🇸", SE: "🇸🇪", PH: "🇵🇭", IE: "🇮🇪", US: "🇺🇸", GB: "🇬🇧", DE: "🇩🇪", NL: "🇳🇱", FR: "🇫🇷",
};

const makeBaseTemplate = (country: string, code: string) => {
  return `EMPLOYMENT AGREEMENT

This Employment Agreement ("Agreement") is entered into between Fronted Sweden AB (NewCo 8634 Sweden AB), registration number 559548-9914, with its registered office in Stockholm, Sweden ("the Company") and the Employee identified below ("the Employee").

1. POSITION AND DUTIES
The Employee shall serve in the capacity as specified in the individual terms, performing duties consistent with the role and as reasonably assigned by the Company. The Employee shall report to their designated manager and comply with all applicable Company policies.

2. COMPENSATION
The Employee shall receive the compensation as outlined in the individual terms, payable in accordance with the Company's standard payroll schedule for ${country}. All compensation is subject to applicable tax withholdings and statutory deductions under ${country} law.

3. WORKING HOURS
The Employee's standard working hours shall comply with applicable labor regulations in ${country}. Overtime, if applicable, shall be compensated in accordance with local statutory requirements.

4. LEAVE AND BENEFITS
The Employee shall be entitled to annual leave, sick leave, and other statutory benefits as mandated by ${country} employment law. Additional benefits, if any, shall be specified in the individual terms.

5. CONFIDENTIALITY
The Employee agrees to maintain the confidentiality of all proprietary information, trade secrets, and business data of the Company during and after employment.

6. TERMINATION
Either party may terminate this Agreement in accordance with the notice periods prescribed by ${country} labor law. The Company reserves the right to terminate for cause as defined under applicable legislation.

7. GOVERNING LAW
This Agreement shall be governed by and construed in accordance with the laws of ${country}.

8. ENTIRE AGREEMENT
This Agreement, together with any addendums, constitutes the entire agreement between the parties and supersedes all prior negotiations, representations, or agreements.`;
};

const createMockTemplates = (companyId: string): CountryTemplate[] => {
  const now = new Date();

  if (companyId === "company-default") {
    // Acme Corp — 4 countries
    return [
      {
        id: "tpl-sg",
        countryCode: "SG",
        countryName: "Singapore",
        flag: "🇸🇬",
        content: makeBaseTemplate("Singapore", "SG"),
        defaultContent: makeBaseTemplate("Singapore", "SG"),
        updatedAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
        updatedBy: "Sarah Johnson",
        audit: [
          { id: "a1", actionType: "SAVE_EDIT", summary: "Updated compensation section for SGD", actor: "Sarah Johnson", timestamp: new Date(now.getTime() - 2 * 86400000).toISOString() },
          { id: "a2", actionType: "SAVE_EDIT", summary: "Initial template setup", actor: "Joe User", timestamp: new Date(now.getTime() - 14 * 86400000).toISOString() },
        ],
      },
      {
        id: "tpl-es",
        countryCode: "ES",
        countryName: "Spain",
        flag: "🇪🇸",
        content: makeBaseTemplate("Spain", "ES"),
        defaultContent: makeBaseTemplate("Spain", "ES"),
        updatedAt: new Date(now.getTime() - 5 * 86400000).toISOString(),
        updatedBy: "Joe User",
        audit: [
          { id: "a3", actionType: "SAVE_EDIT", summary: "Added Spanish labor law references", actor: "Joe User", timestamp: new Date(now.getTime() - 5 * 86400000).toISOString() },
        ],
      },
      {
        id: "tpl-ph",
        countryCode: "PH",
        countryName: "Philippines",
        flag: "🇵🇭",
        content: makeBaseTemplate("Philippines", "PH"),
        defaultContent: makeBaseTemplate("Philippines", "PH"),
        updatedAt: new Date(now.getTime() - 10 * 86400000).toISOString(),
        updatedBy: "David Park",
        audit: [],
      },
      {
        id: "tpl-ie",
        countryCode: "IE",
        countryName: "Ireland",
        flag: "🇮🇪",
        content: makeBaseTemplate("Ireland", "IE"),
        defaultContent: makeBaseTemplate("Ireland", "IE"),
        updatedAt: new Date(now.getTime() - 7 * 86400000).toISOString(),
        updatedBy: "Emily Rodriguez",
        audit: [
          { id: "a4", actionType: "RESET", summary: "Reset to default", actor: "Emily Rodriguez", timestamp: new Date(now.getTime() - 7 * 86400000).toISOString() },
        ],
      },
    ];
  }

  // Other companies — 2 countries
  return [
    {
      id: "tpl-us",
      countryCode: "US",
      countryName: "United States",
      flag: "🇺🇸",
      content: makeBaseTemplate("United States", "US"),
      defaultContent: makeBaseTemplate("United States", "US"),
      updatedAt: new Date(now.getTime() - 3 * 86400000).toISOString(),
      updatedBy: "Joe User",
      audit: [],
    },
    {
      id: "tpl-gb",
      countryCode: "GB",
      countryName: "United Kingdom",
      flag: "🇬🇧",
      content: makeBaseTemplate("United Kingdom", "GB"),
      defaultContent: makeBaseTemplate("United Kingdom", "GB"),
      updatedAt: new Date(now.getTime() - 1 * 86400000).toISOString(),
      updatedBy: "Joe User",
      audit: [],
    },
  ];
};

// ── Formatters ──

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

// ── Component ──

interface CountryTemplatesSectionProps {
  companyId: string;
  companyName: string;
  isNewCompany?: boolean;
  /** When true, renders without its own card wrapper (used when embedded inside another card) */
  isEmbedded?: boolean;
}

export const F1v5_CountryTemplatesSection: React.FC<CountryTemplatesSectionProps> = ({
  companyId,
  companyName,
  isNewCompany = false,
  isEmbedded = false,
}) => {
  const [templates, setTemplates] = useState<CountryTemplate[]>(() =>
    isNewCompany ? [] : createMockTemplates(companyId)
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return templates;
    const q = searchQuery.toLowerCase();
    return templates.filter(t =>
      t.countryName.toLowerCase().includes(q) || t.countryCode.toLowerCase().includes(q)
    );
  }, [templates, searchQuery]);

  const selectedTemplate = useMemo(
    () => templates.find(t => t.id === selectedTemplateId) || null,
    [templates, selectedTemplateId]
  );

  const handleSave = useCallback((templateId: string, newContent: string) => {
    setTemplates(prev => prev.map(t => {
      if (t.id !== templateId) return t;
      const entry: TemplateAuditEntry = {
        id: `audit-${Date.now()}`,
        actionType: "SAVE_EDIT",
        summary: "Template updated",
        actor: "Joe User",
        timestamp: new Date().toISOString(),
      };
      return {
        ...t,
        content: newContent,
        updatedAt: new Date().toISOString(),
        updatedBy: "Joe User",
        audit: [entry, ...t.audit],
      };
    }));
  }, []);

  const handleReset = useCallback((templateId: string) => {
    setTemplates(prev => prev.map(t => {
      if (t.id !== templateId) return t;
      const entry: TemplateAuditEntry = {
        id: `audit-${Date.now()}`,
        actionType: "RESET",
        summary: "Reset to default",
        actor: "Joe User",
        timestamp: new Date().toISOString(),
      };
      return {
        ...t,
        content: t.defaultContent,
        updatedAt: new Date().toISOString(),
        updatedBy: "Joe User",
        audit: [entry, ...t.audit],
      };
    }));
  }, []);

  const content = (
    <div className="space-y-3">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <label className="text-sm font-medium text-foreground">Country templates</label>
        </div>
        <p className="text-xs text-muted-foreground">
          Base contract templates by country. Worker-specific edits are separate.
        </p>
      </div>

      {templates.length === 0 ? (
        <div className="rounded-md border border-dashed border-border/40 bg-muted/10 py-6 flex flex-col items-center gap-2">
          <Globe className="h-5 w-5 text-muted-foreground/50" />
          <p className="text-xs text-muted-foreground">No templates yet</p>
        </div>
      ) : (
        <>
          {templates.length > 3 && (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search countries…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-background/60"
              />
            </div>
          )}

          <div className="rounded-md border border-border/30 overflow-hidden divide-y divide-border/20">
            {filteredTemplates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => setSelectedTemplateId(tpl.id)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-muted/30 transition-colors text-left group"
              >
                <span className="text-base flex-shrink-0">{tpl.flag}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{tpl.countryName}</span>
                    <Badge variant="secondary" className="h-4 px-1.5 text-[9px] bg-muted/60">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(tpl.updatedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {tpl.updatedBy}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </button>
            ))}

            {filteredTemplates.length === 0 && searchQuery && (
              <div className="px-4 py-4 text-center text-xs text-muted-foreground">
                No templates match your search.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      {isEmbedded ? (
        content
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-card/40 border border-border/40 rounded-lg p-4"
        >
          {content}
        </motion.div>
      )}

      {/* Drawer */}
      <F1v5_CountryTemplateDrawer
        template={selectedTemplate}
        companyName={companyName}
        open={!!selectedTemplateId}
        onOpenChange={(open) => { if (!open) setSelectedTemplateId(null); }}
        onSave={handleSave}
        onReset={handleReset}
      />
    </>
  );
};
