/**
 * Flow 1 v7 — Worker Templates
 * Stores reusable worker templates in localStorage.
 * Templates capture contract/engagement details but NOT personal profile info.
 */

const STORAGE_KEY = "adminflow-v7-worker-templates";

export interface WorkerTemplate {
  id: string;
  name: string; // user-given template name
  createdAt: string;
  // Engagement details (copied)
  country: string;
  countryFlag: string;
  role: string;
  salary: string;
  employmentType: "contractor" | "employee";
  companyName?: string;
  companyId?: string;
  // Contract terms
  probationPeriod?: string;
  noticePeriod?: string;
  annualLeave?: string;
  sickLeave?: string;
  weeklyHours?: string;
  payFrequency?: string;
}

export function getWorkerTemplates(): WorkerTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveWorkerTemplate(template: WorkerTemplate): void {
  const templates = getWorkerTemplates();
  templates.unshift(template);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function deleteWorkerTemplate(id: string): void {
  const templates = getWorkerTemplates().filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

/** Build a template from a contractor object (strips personal details) */
export function contractorToTemplate(
  contractor: {
    country: string;
    countryFlag?: string;
    role: string;
    salary: string;
    employmentType: string;
    companyName?: string;
    companyId?: string;
    probationPeriod?: string;
    noticePeriod?: string;
    annualLeave?: string;
    sickLeave?: string;
    weeklyHours?: string;
    payFrequency?: string;
  },
  templateName: string
): WorkerTemplate {
  return {
    id: `tpl-${Date.now()}`,
    name: templateName,
    createdAt: new Date().toISOString(),
    country: contractor.country,
    countryFlag: contractor.countryFlag || "",
    role: contractor.role,
    salary: contractor.salary,
    employmentType: contractor.employmentType as "contractor" | "employee",
    companyName: contractor.companyName,
    companyId: contractor.companyId,
    probationPeriod: contractor.probationPeriod,
    noticePeriod: contractor.noticePeriod,
    annualLeave: contractor.annualLeave,
    sickLeave: contractor.sickLeave,
    weeklyHours: contractor.weeklyHours,
    payFrequency: contractor.payFrequency,
  };
}
