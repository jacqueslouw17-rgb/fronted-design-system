/**
 * Flow 1 v5 — Country Base Templates Section
 * 
 * Shown inside Company Settings (edit mode).
 * Lists country templates for the selected company, opens a wide drawer for editing.
 */

import React, { useState, useMemo, useCallback } from "react";
import { Globe, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { F1v5_CountryTemplateDrawer } from "./F1v5_CountryTemplateDrawer";

// ── Types ──

export interface TemplateAuditEntry {
  id: string;
  actionType: "SAVE_EDIT" | "RESET";
  summary: string;
  documentLabel: string; // e.g. "Agreement", "NDA"
  actor: string;
  timestamp: string; // ISO
}

export interface DocumentTemplate {
  id: string;
  type: string; // e.g. "employment-agreement"
  label: string;
  shortLabel: string;
  content: string;
  defaultContent: string;
  lastEditedAt: string | null;
  lastEditedBy: string | null;
}

export interface CountryTemplate {
  id: string;
  countryCode: string;
  countryName: string;
  flag: string;
  documents: DocumentTemplate[];
  workerCount: number;
  updatedAt: string; // ISO (latest across all docs)
  updatedBy: string;
  audit: TemplateAuditEntry[];
}

// ── Mock Data ──

const makeAgreementContent = (country: string) =>
  `Employment agreement

This Employment Agreement ("Agreement") is entered into between Fronted Sweden AB (NewCo 8634 Sweden AB), registration number 559548-9914, with its registered office in Stockholm, Sweden ("the Company") and the Employee identified below ("the Employee").

1. Position and duties
The Employee shall serve in the capacity as specified in the individual terms, performing duties consistent with the role and as reasonably assigned by the Company. The Employee shall report to their designated manager and comply with all applicable Company policies.

2. Compensation
The Employee shall receive the compensation as outlined in the individual terms, payable in accordance with the Company's standard payroll schedule for ${country}. All compensation is subject to applicable tax withholdings and statutory deductions under ${country} law.

3. Working hours
The Employee's standard working hours shall comply with applicable labor regulations in ${country}. Overtime, if applicable, shall be compensated in accordance with local statutory requirements.

4. Leave and benefits
The Employee shall be entitled to annual leave, sick leave, and other statutory benefits as mandated by ${country} employment law. Additional benefits, if any, shall be specified in the individual terms.

5. Confidentiality
The Employee agrees to maintain the confidentiality of all proprietary information, trade secrets, and business data of the Company during and after employment.

6. Termination
Either party may terminate this Agreement in accordance with the notice periods prescribed by ${country} labor law. The Company reserves the right to terminate for cause as defined under applicable legislation.

7. Governing law
This Agreement shall be governed by and construed in accordance with the laws of ${country}.

8. Entire agreement
This Agreement, together with any addendums, constitutes the entire agreement between the parties and supersedes all prior negotiations, representations, or agreements.`;

const makeNdaContent = (country: string) =>
  `Non-disclosure agreement

This Non-Disclosure Agreement ("Agreement") is made between Fronted Sweden AB ("Company" or "Disclosing Party") and the Employee/Contractor residing in ${country} ("Recipient" or "Receiving Party").

1. Definitions
"Confidential Information" means any and all non-public, proprietary, or sensitive information disclosed by the Disclosing Party to the Receiving Party, whether orally, in writing, electronically, or by any other means, including but not limited to trade secrets, business plans, financial data, client lists, and technical data.

2. Obligations of the receiving party
The Receiving Party agrees to hold all Confidential Information in strict confidence and not disclose it to any third party without the prior written consent of the Disclosing Party. Use shall be limited solely to the Authorized Purpose.

3. Exclusions
The obligations shall not apply to information that was publicly available, already known, independently developed, or received from a third party not bound by confidentiality.

4. Return and destruction of materials
Upon termination or upon request, the Receiving Party shall promptly return or destroy all Confidential Information and certify such action in writing.

5. Intellectual property
No license is granted under any patent, copyright, trademark, or trade secret right. All Confidential Information remains the exclusive property of the Disclosing Party.

6. Term and survival
This Agreement shall remain in effect for the duration of the relationship and for three (3) years following termination.

7. Remedies
The Receiving Party acknowledges that breach may cause irreparable harm. The Disclosing Party shall be entitled to seek equitable relief, including injunction and specific performance.

8. General provisions
This Agreement shall be governed by the laws of ${country}. This constitutes the entire agreement regarding the subject matter hereof.`;

const makePrivacyContent = (country: string) =>
  `Data privacy addendum

This Data Privacy Addendum ("Addendum") supplements the Agreement between Fronted Sweden AB ("Company", "Controller") and the Employee/Contractor ("Data Subject") and is governed by applicable data protection legislation in ${country}.

1. Scope and purpose
This Addendum sets out the terms under which the Company collects, processes, stores, and protects personal data relating to the Data Subject.

2. Categories of personal data
The Company collects identity data, contact data, employment data, financial data, IT data, and health data (where legally required).

3. Legal basis for processing
Processing is based on performance of contract, legal obligation, legitimate interests, or consent as applicable under ${country} law.

4. Data subject rights
Under applicable law in ${country}, the Data Subject has the right of access, rectification, erasure, restriction, data portability, objection, and rights related to automated decision-making.

5. Data sharing and transfers
Personal data may be shared with group companies, payroll providers, government authorities, and professional advisors. International transfers are protected by Standard Contractual Clauses or adequacy decisions.

6. Data security
The Company implements appropriate technical and organizational measures including encryption, access controls, and regular security assessments.

7. Retention
Personal data is retained for the duration of the relationship and for the mandatory retention period required by ${country} law.`;

const makeIpContent = (country: string) =>
  `IP assignment & carve-outs

This Intellectual Property Assignment Agreement supplements the Employment Agreement and governs the ownership and assignment of intellectual property created during the engagement.

1. Assignment of IP
The Employee hereby irrevocably assigns to the Company all right, title, and interest in and to any and all intellectual property created, conceived, or developed during the course of employment, whether during or outside of working hours.

2. Moral rights
To the extent permitted by ${country} law, the Employee waives all moral rights in any work product assigned to the Company.

3. Prior inventions
The Employee has disclosed all prior inventions, if any, in Schedule A. Any inventions not listed are deemed to have been created during employment.

4. Cooperation
The Employee agrees to execute all documents and take all actions reasonably requested by the Company to perfect its ownership of assigned intellectual property.

5. Governing law
This Agreement shall be governed by the laws of ${country}.`;

const makeRestrictiveCovenantsContent = (country: string) =>
  `Restrictive covenants

This Restrictive Covenants Agreement supplements the Employment Agreement and outlines post-employment restrictions.

1. Non-competition
For a period of 12 months following termination, the Employee shall not engage in any business that directly competes with the Company's core business in ${country}.

2. Non-solicitation of clients
For 12 months after termination, the Employee shall not solicit any client with whom they had contact during the last 12 months of employment.

3. Non-solicitation of employees
For 12 months after termination, the Employee shall not directly or indirectly recruit or attempt to recruit any Company employee or consultant.

4. Garden leave
The Company reserves the right to place the Employee on garden leave during the notice period, subject to ${country} law.

5. Enforceability
If any provision is found to be unreasonable or unenforceable, it shall be modified to the minimum extent necessary to make it enforceable under ${country} law.`;

const makeHomeOfficeContent = (country: string) =>
  `Home office policy

This Home Office Policy supplements the Employment Agreement and sets out the terms for remote work arrangements in ${country}.

1. Eligibility
Remote work is available to employees whose role permits it, subject to manager approval and applicable ${country} regulations.

2. Workspace requirements
The Employee must maintain a safe, suitable, and ergonomic workspace. The Company may provide equipment or a stipend as outlined in company policy.

3. Working hours
Remote employees shall adhere to the same working hours and availability requirements as office-based employees, in accordance with ${country} labor law.

4. Data security
The Employee shall comply with all Company data security policies when working remotely, including use of VPN, encrypted devices, and secure networks.

5. Health and safety
The Employee is responsible for ensuring their home workspace meets ${country} health and safety standards and shall report any concerns promptly.`;

const createDocuments = (country: string): DocumentTemplate[] => {
  const now = new Date().toISOString();
  return [
    { id: "doc-agreement", type: "employment-agreement", label: "Employment Agreement", shortLabel: "Agreement", content: makeAgreementContent(country), defaultContent: makeAgreementContent(country), lastEditedAt: null, lastEditedBy: null },
    { id: "doc-nda", type: "nda", label: "Non-Disclosure Agreement", shortLabel: "NDA", content: makeNdaContent(country), defaultContent: makeNdaContent(country), lastEditedAt: null, lastEditedBy: null },
    { id: "doc-privacy", type: "data-privacy", label: "Data Privacy Addendum", shortLabel: "Privacy", content: makePrivacyContent(country), defaultContent: makePrivacyContent(country), lastEditedAt: null, lastEditedBy: null },
    { id: "doc-ip", type: "ip-addendum", label: "IP Assignment & Carve-outs", shortLabel: "IP", content: makeIpContent(country), defaultContent: makeIpContent(country), lastEditedAt: null, lastEditedBy: null },
    { id: "doc-covenants", type: "restrictive-covenants", label: "Restrictive Covenants", shortLabel: "Covenants", content: makeRestrictiveCovenantsContent(country), defaultContent: makeRestrictiveCovenantsContent(country), lastEditedAt: null, lastEditedBy: null },
    { id: "doc-homeoffice", type: "home-office", label: "Home Office Policy", shortLabel: "Home Office", content: makeHomeOfficeContent(country), defaultContent: makeHomeOfficeContent(country), lastEditedAt: null, lastEditedBy: null },
  ];
};

/** Smaller doc set for countries with fewer requirements */
const createLimitedDocuments = (country: string, count: 2 | 3): DocumentTemplate[] => {
  const all = createDocuments(country);
  if (count === 2) return [all[0], all[1]]; // Agreement + NDA
  return [all[0], all[1], all[2]]; // Agreement + NDA + Privacy
};

const createMockTemplates = (companyId: string): CountryTemplate[] => {
  const now = new Date();

  if (companyId === "company-default") {
    const sgDocs = createDocuments("Singapore");
    sgDocs[0].lastEditedAt = new Date(now.getTime() - 2 * 86400000).toISOString();
    sgDocs[0].lastEditedBy = "Sarah Johnson";

    const esDocs = createDocuments("Spain");
    esDocs[1].lastEditedAt = new Date(now.getTime() - 5 * 86400000).toISOString();
    esDocs[1].lastEditedBy = "Joe User";

    return [
      {
        id: "tpl-sg", countryCode: "SG", countryName: "Singapore", flag: "🇸🇬",
        documents: sgDocs, workerCount: 8,
        updatedAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
        updatedBy: "Sarah Johnson",
        audit: [
          { id: "a1", actionType: "SAVE_EDIT", summary: "Updated compensation section for SGD", documentLabel: "Agreement", actor: "Sarah Johnson", timestamp: new Date(now.getTime() - 2 * 86400000).toISOString() },
          { id: "a2", actionType: "SAVE_EDIT", summary: "Initial template setup", documentLabel: "Agreement", actor: "Joe User", timestamp: new Date(now.getTime() - 14 * 86400000).toISOString() },
        ],
      },
      {
        id: "tpl-es", countryCode: "ES", countryName: "Spain", flag: "🇪🇸",
        documents: esDocs, workerCount: 3,
        updatedAt: new Date(now.getTime() - 5 * 86400000).toISOString(),
        updatedBy: "Joe User",
        audit: [
          { id: "a3", actionType: "SAVE_EDIT", summary: "Added Spanish labor law references", documentLabel: "NDA", actor: "Joe User", timestamp: new Date(now.getTime() - 5 * 86400000).toISOString() },
        ],
      },
      {
        id: "tpl-ph", countryCode: "PH", countryName: "Philippines", flag: "🇵🇭",
        documents: createLimitedDocuments("Philippines", 2), workerCount: 12,
        updatedAt: new Date(now.getTime() - 10 * 86400000).toISOString(),
        updatedBy: "David Park",
        audit: [],
      },
      {
        id: "tpl-ie", countryCode: "IE", countryName: "Ireland", flag: "🇮🇪",
        documents: createLimitedDocuments("Ireland", 3), workerCount: 5,
        updatedAt: new Date(now.getTime() - 7 * 86400000).toISOString(),
        updatedBy: "Emily Rodriguez",
        audit: [
          { id: "a4", actionType: "RESET", summary: "Reset to default", documentLabel: "Agreement", actor: "Emily Rodriguez", timestamp: new Date(now.getTime() - 7 * 86400000).toISOString() },
        ],
      },
    ];
  }

  return [
    {
      id: "tpl-us", countryCode: "US", countryName: "United States", flag: "🇺🇸",
      documents: createDocuments("United States"), workerCount: 15,
      updatedAt: new Date(now.getTime() - 3 * 86400000).toISOString(),
      updatedBy: "Joe User",
      audit: [],
    },
    {
      id: "tpl-gb", countryCode: "GB", countryName: "United Kingdom", flag: "🇬🇧",
      documents: createDocuments("United Kingdom"), workerCount: 6,
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
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const selectedTemplate = useMemo(
    () => templates.find(t => t.id === selectedTemplateId) || null,
    [templates, selectedTemplateId]
  );

  const selectedIndex = useMemo(
    () => templates.findIndex(t => t.id === selectedTemplateId),
    [templates, selectedTemplateId]
  );

  const handleNavigatePrev = useCallback(() => {
    if (selectedIndex > 0) setSelectedTemplateId(templates[selectedIndex - 1].id);
  }, [selectedIndex, templates]);

  const handleNavigateNext = useCallback(() => {
    if (selectedIndex < templates.length - 1) setSelectedTemplateId(templates[selectedIndex + 1].id);
  }, [selectedIndex, templates]);

  const handleSaveDocument = useCallback((templateId: string, documentId: string, newContent: string) => {
    setTemplates(prev => prev.map(t => {
      if (t.id !== templateId) return t;
      const doc = t.documents.find(d => d.id === documentId);
      const entry: TemplateAuditEntry = {
        id: `audit-${Date.now()}`,
        actionType: "SAVE_EDIT",
        summary: "Template updated",
        documentLabel: doc?.shortLabel || "Document",
        actor: "Joe User",
        timestamp: new Date().toISOString(),
      };
      return {
        ...t,
        documents: t.documents.map(d =>
          d.id === documentId
            ? { ...d, content: newContent, lastEditedAt: new Date().toISOString(), lastEditedBy: "Joe User" }
            : d
        ),
        updatedAt: new Date().toISOString(),
        updatedBy: "Joe User",
        audit: [entry, ...t.audit],
      };
    }));
  }, []);

  const handleResetDocument = useCallback((templateId: string, documentId: string) => {
    setTemplates(prev => prev.map(t => {
      if (t.id !== templateId) return t;
      const doc = t.documents.find(d => d.id === documentId);
      const entry: TemplateAuditEntry = {
        id: `audit-${Date.now()}`,
        actionType: "RESET",
        summary: "Reset to default",
        documentLabel: doc?.shortLabel || "Document",
        actor: "Joe User",
        timestamp: new Date().toISOString(),
      };
      return {
        ...t,
        documents: t.documents.map(d =>
          d.id === documentId
            ? { ...d, content: d.defaultContent, lastEditedAt: new Date().toISOString(), lastEditedBy: "Joe User" }
            : d
        ),
        updatedAt: new Date().toISOString(),
        updatedBy: "Joe User",
        audit: [entry, ...t.audit],
      };
    }));
  }, []);

  

  const content = (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">Country templates</label>

      {templates.length === 0 ? (
        <div className="rounded-md border border-dashed border-border/40 bg-muted/10 py-6 flex flex-col items-center gap-2">
          <Globe className="h-5 w-5 text-muted-foreground/50" />
          <p className="text-xs text-muted-foreground">No templates yet</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {templates.map((tpl) => {
            const editedCount = tpl.documents.filter(d => d.content !== d.defaultContent).length;
            return (
              <div
                key={tpl.id}
                className="flex items-center gap-2.5 rounded-md border border-border/30 bg-background/60 px-3 py-2"
              >
                <span className="text-base shrink-0">{tpl.flag}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-foreground">{tpl.countryName}</span>
                    <span className="text-[10px] text-muted-foreground/50">
                      {tpl.documents.length} docs · {tpl.workerCount} {tpl.workerCount === 1 ? "worker" : "workers"}
                    </span>
                    {editedCount > 0 && (
                      <Badge variant="secondary" className="h-4 px-1.5 text-[9px] bg-primary/10 text-primary border-0">
                        {editedCount} edited
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground shrink-0"
                  onClick={() => setSelectedTemplateId(tpl.id)}
                >
                  Manage
                  <ChevronRight className="h-3 w-3 ml-0.5" />
                </Button>
              </div>
            );
          })}
        </div>
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

      <F1v5_CountryTemplateDrawer
        template={selectedTemplate}
        companyName={companyName}
        open={!!selectedTemplateId}
        onOpenChange={(open) => { if (!open) setSelectedTemplateId(null); }}
        onSaveDocument={handleSaveDocument}
        onResetDocument={handleResetDocument}
        onNavigatePrev={handleNavigatePrev}
        onNavigateNext={handleNavigateNext}
        hasPrev={selectedIndex > 0}
        hasNext={selectedIndex < templates.length - 1}
        currentIndex={selectedIndex}
        totalCount={templates.length}
      />
    </>
  );
};
