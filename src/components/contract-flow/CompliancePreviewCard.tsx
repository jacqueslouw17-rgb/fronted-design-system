import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ComplianceRule {
  title: string;
  description: string;
}

interface CompliancePreviewCardProps {
  country: string;
  countryCode: string;
  flag: string;
  employmentType: "employee" | "contractor";
}

const complianceRules: Record<string, { employee: ComplianceRule[]; contractor: ComplianceRule[] }> = {
  PH: {
    employee: [
      { title: "13th Month Pay", description: "Mandatory annual bonus equivalent to 1/12 of annual salary" },
      { title: "SSS, PhilHealth, Pag-IBIG", description: "Required social security contributions" },
      { title: "Service Incentive Leave", description: "Minimum 5 days paid leave annually" },
    ],
    contractor: [
      { title: "No Mandated Benefits", description: "Benefits and PTO are optional and negotiable" },
      { title: "Tax Compliance", description: "Contractor responsible for own tax filings" },
      { title: "Business Permit", description: "May require DTI or SEC registration" },
    ],
  },
  NO: {
    employee: [
      { title: "Statutory Leave", description: "25 days annual leave + public holidays" },
      { title: "A-melding Reporting", description: "Mandatory payroll reporting to NAV" },
      { title: "Pension Contributions", description: "2% minimum occupational pension required" },
    ],
    contractor: [
      { title: "Standard Gig Clause", description: "Independent contractor agreement with clear scope" },
      { title: "Confidentiality", description: "NDA and IP protection required" },
      { title: "VAT Registration", description: "May require MVA registration if revenue exceeds threshold" },
    ],
  },
};

export const CompliancePreviewCard: React.FC<CompliancePreviewCardProps> = ({
  country,
  countryCode,
  flag,
  employmentType,
}) => {
  const [expanded, setExpanded] = useState(false);
  const rules = complianceRules[countryCode]?.[employmentType] || [];

  return (
    <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm">
      <div className="p-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Compliance Preview ({country} Rules)
            </span>
            <Badge variant="outline" className="text-xs">
              {flag} {countryCode}
            </Badge>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-3">
                {rules.map((rule, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-background border border-border"
                  >
                    <p className="text-xs font-medium text-foreground mb-1">
                      {rule.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {rule.description}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground italic">
                These clauses are informational and auto-applied to the contract template.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};
