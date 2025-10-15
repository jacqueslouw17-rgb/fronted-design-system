import { RuleChange } from "@/components/compliance/RuleChangeChip";
import { MiniRule } from "@/components/compliance/RuleBadge";

export interface ComplianceSource {
  authority: string;
  reference: string;
  url?: string;
}

export interface ComplianceData {
  changes: RuleChange[];
  activePolicies: MiniRule[];
  sources: ComplianceSource[];
  lastSync: string;
}

// Mock data generator
const mockChanges: Record<string, RuleChange[]> = {
  NO: [
    {
      id: "no-pto-2025",
      type: "modified",
      name: "Annual Leave Entitlement",
      effectiveDate: "2025-01-01",
      severity: "medium",
      oldText: "Employees are entitled to 21 days of paid annual leave per year.",
      newText: "Employees are entitled to 24 days of paid annual leave per year, effective January 1, 2025."
    },
    {
      id: "no-notice-2025",
      type: "modified",
      name: "Notice Period Requirements",
      effectiveDate: "2025-02-01",
      severity: "high",
      oldText: "Standard notice period is 1 month for employees with less than 5 years of service.",
      newText: "Standard notice period is 2 months for employees with less than 5 years of service, 3 months for 5+ years."
    }
  ],
  PH: [
    {
      id: "ph-13th-2025",
      type: "new",
      name: "13th Month Pay Calculation Update",
      effectiveDate: "2025-03-01",
      severity: "high",
      oldText: "",
      newText: "13th month pay calculation must now include all overtime pay and night differential compensation."
    }
  ],
  SE: [],
  US: []
};

const mockPolicies: Record<string, MiniRule[]> = {
  NO: [
    { id: "pto", name: "PTO", value: "24 days", editable: true },
    { id: "notice", name: "Notice", value: "30d", editable: true },
    { id: "ip", name: "IP Assignment", value: "ON", editable: false },
    { id: "trial", name: "Trial Period", value: "6 months", editable: true }
  ],
  PH: [
    { id: "13th-pay", name: "13th Month", value: "Required", editable: false },
    { id: "pto", name: "PTO", value: "15 days", editable: true },
    { id: "notice", name: "Notice", value: "30d", editable: true }
  ],
  SE: [
    { id: "pto", name: "PTO", value: "25 days", editable: true },
    { id: "notice", name: "Notice", value: "60d", editable: true },
    { id: "parental", name: "Parental Leave", value: "480 days", editable: false }
  ],
  US: [
    { id: "pto", name: "PTO", value: "10 days", editable: true },
    { id: "at-will", name: "At-Will", value: "ON", editable: false }
  ]
};

const mockSources: Record<string, ComplianceSource[]> = {
  NO: [
    { authority: "Gov.no", reference: "§12-3", url: "https://loveable.no/arbeidsrett" },
    { authority: "Arbeidstilsynet", reference: "AML-2024-15" }
  ],
  PH: [
    { authority: "DOLE", reference: "Labor Advisory No. 03-25", url: "https://dole.gov.ph" }
  ],
  SE: [
    { authority: "Arbetsmiljöverket", reference: "AFS 2024:1" }
  ],
  US: [
    { authority: "DOL", reference: "FLSA 2024" }
  ]
};

export const complianceService = {
  getChanges: async (countryCode: string): Promise<ComplianceData> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      changes: mockChanges[countryCode] || [],
      activePolicies: mockPolicies[countryCode] || [],
      sources: mockSources[countryCode] || [],
      lastSync: new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString()
    };
  }
};
