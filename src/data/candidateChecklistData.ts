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
          id: "id_doc",
          label: "Government ID",
          required: true,
          status: "verified",
          description: "Valid government-issued identification"
        },
        {
          id: "bank",
          label: "Bank Account",
          required: true,
          status: "verified",
          description: "Philippine bank account for payments"
        },
        {
          id: "tax",
          label: "Tax Residency",
          required: true,
          status: "pending_review",
          description: "TIN and tax residency declaration"
        },
        {
          id: "policy",
          label: "Policy Acknowledgment",
          required: true,
          status: "todo",
          description: "Company policies and contractor agreement"
        },
        {
          id: "nda",
          label: "NDA Signature",
          required: true,
          status: "todo",
          description: "Non-disclosure agreement signature"
        }
      ]
    },
    Employee: {
      country: "PH",
      type: "Employee",
      requirements: [
        {
          id: "id_doc",
          label: "Government ID",
          required: true,
          status: "verified",
          description: "Valid government-issued identification"
        },
        {
          id: "bank",
          label: "Bank Account",
          required: true,
          status: "verified",
          description: "Philippine bank account for salary"
        },
        {
          id: "philhealth",
          label: "PhilHealth",
          required: true,
          status: "pending_review",
          description: "PhilHealth membership number"
        },
        {
          id: "tax",
          label: "Tax Information",
          required: true,
          status: "todo",
          description: "TIN and BIR 2316 submission"
        },
        {
          id: "policy",
          label: "Policy Acknowledgment",
          required: true,
          status: "todo",
          description: "Employee handbook and policies"
        }
      ]
    }
  },
  XK: {
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
    },
    Contractor: {
      country: "XK",
      type: "Contractor",
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
          id: "tax",
          label: "Tax Registration",
          required: true,
          status: "todo",
          description: "Kosovo tax registration certificate"
        },
        {
          id: "policy",
          label: "Policy Acknowledgment",
          required: true,
          status: "todo",
          description: "Contractor agreement"
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
          id: "benefits",
          label: "Benefits Setup",
          required: false,
          status: "todo",
          description: "Optional pension and insurance enrollment"
        },
        {
          id: "2fa",
          label: "Two-Factor Authentication",
          required: true,
          status: "todo",
          description: "Enable 2FA for secure access"
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
