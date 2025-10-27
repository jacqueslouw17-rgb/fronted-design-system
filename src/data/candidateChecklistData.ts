// Dynamic checklist requirements based on country and employment type

export interface ChecklistRequirement {
  id: string;
  label: string;
  required: boolean;
  status: 'verified' | 'pending_review' | 'todo';
  description?: string;
}

export interface ChecklistProfile {
  country: string;
  type: 'Contractor' | 'Employee';
  requirements: ChecklistRequirement[];
}

export const checklistData: Record<string, Record<string, ChecklistProfile>> = {
  PH: {
    Contractor: {
      country: "PH",
      type: "Contractor",
      requirements: [
        {
          id: "national_id",
          label: "Upload National ID",
          required: true,
          status: "verified",
          description: "Valid government-issued Philippine ID"
        },
        {
          id: "tin",
          label: "Confirm TIN Number",
          required: true,
          status: "pending_review",
          description: "Tax Identification Number verification"
        },
        {
          id: "bank",
          label: "Add Bank Account for Payroll",
          required: true,
          status: "todo",
          description: "Philippine bank account for salary payments"
        },
        {
          id: "privacy",
          label: "Accept Data Privacy Notice",
          required: true,
          status: "todo",
          description: "Data privacy policy acknowledgment"
        }
      ]
    },
    Employee: {
      country: "PH",
      type: "Employee",
      requirements: [
        {
          id: "national_id",
          label: "Upload National ID",
          required: true,
          status: "verified",
          description: "Valid government-issued Philippine ID"
        },
        {
          id: "tin",
          label: "Confirm TIN Number",
          required: true,
          status: "pending_review",
          description: "Tax Identification Number verification"
        },
        {
          id: "benefits",
          label: "Bank + PhilHealth + SSS",
          required: true,
          status: "todo",
          description: "Bank account, PhilHealth and SSS details"
        },
        {
          id: "handbook",
          label: "Sign Employee Handbook",
          required: true,
          status: "todo",
          description: "Employee handbook acknowledgment and signature"
        }
      ]
    }
  },
  XK: {
    Contractor: {
      country: "XK",
      type: "Contractor",
      requirements: [
        {
          id: "tax_residency",
          label: "Confirm Tax Residency",
          required: true,
          status: "verified",
          description: "Tax residency confirmation for Kosovo"
        },
        {
          id: "bank",
          label: "Add International Bank (IBAN)",
          required: true,
          status: "pending_review",
          description: "International bank account (IBAN)"
        },
        {
          id: "id_doc",
          label: "Upload National ID / Passport",
          required: true,
          status: "todo",
          description: "Valid Kosovo ID or passport"
        },
        {
          id: "handbook",
          label: "E-Sign Contractor Handbook",
          required: true,
          status: "todo",
          description: "Electronic signature on contractor handbook"
        }
      ]
    },
    Employee: {
      country: "XK",
      type: "Employee",
      requirements: [
        {
          id: "id_doc",
          label: "ID / Passport",
          required: true,
          status: "verified",
          description: "Valid Kosovo ID or passport"
        },
        {
          id: "bank",
          label: "IBAN",
          required: true,
          status: "pending_review",
          description: "International bank account number"
        },
        {
          id: "policy",
          label: "Policy Acknowledgment",
          required: true,
          status: "todo",
          description: "Employee contract and policies"
        }
      ]
    }
  },
  NO: {
    Employee: {
      country: "NO",
      type: "Employee",
      requirements: [
        {
          id: "tax_form",
          label: "Submit Tax Residency Form",
          required: true,
          status: "verified",
          description: "Norwegian tax residency documentation"
        },
        {
          id: "bank",
          label: "Add Norwegian Bank Account",
          required: true,
          status: "todo",
          description: "Norwegian bank account for salary"
        },
        {
          id: "health_pension",
          label: "Accept Health & Pension Policy",
          required: true,
          status: "todo",
          description: "Health insurance and pension enrollment"
        },
        {
          id: "id_doc",
          label: "Upload ID (EU/Passport)",
          required: true,
          status: "todo",
          description: "EU ID or passport verification"
        }
      ]
    },
    Contractor: {
      country: "NO",
      type: "Contractor",
      requirements: [
        {
          id: "id_doc",
          label: "ID / Fødselsnummer",
          required: true,
          status: "verified",
          description: "Norwegian national ID or birth number"
        },
        {
          id: "tax_card",
          label: "Tax Card (Skattekort)",
          required: true,
          status: "todo",
          description: "Norwegian tax deduction card"
        },
        {
          id: "2fa",
          label: "Two-Factor Authentication",
          required: true,
          status: "todo",
          description: "Enable 2FA for secure access"
        }
      ]
    }
  }
};

export const getChecklistForProfile = (country: string, type: 'Contractor' | 'Employee'): ChecklistProfile | null => {
  return checklistData[country]?.[type] || null;
};
