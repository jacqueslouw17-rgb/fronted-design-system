import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, FileText, Workflow, UserCheck, ShieldAlert } from "lucide-react";

interface FlowCardProps {
  flowId: string;
  onPatternClick: (path: string) => (e: React.MouseEvent) => void;
}

export const FlowCard = ({ flowId, onPatternClick }: FlowCardProps) => {
  const flowsData = {
    'flow-1-admin-onboarding': {
      path: "/flows/admin/onboarding",
      iconColor: "amber",
      icon: Workflow,
      title: "Flow 5 - Company Admin Onboarding v1",
      locked: true,
      deprecated: true,
      description: "Complete end-to-end onboarding for system administrators: introduces Genie, captures company settings, sets up Mini-Rules, connects integrations, and lands in Dashboard v3",
      steps: "7 steps",
      patterns: "18 patterns",
      badges: [
        { label: "Genie-Led Conversational Onboarding", path: "/onboarding" },
        { label: "Step Card Stack + Progress Bar", path: "/step-card-pattern" },
        { label: "Dashboard-Centered Layout + Collapsible Genie Drawer", path: "/dashboard" }
      ],
      additionalCount: 15,
      dataModel: "/docs/Flow1_Admin_Onboarding_Data_Model.md"
    },
    'flow-2-admin-contracting': {
      path: "/flows/contract-flow",
      iconColor: "emerald",
      icon: Workflow,
      title: "Flow 1 Fronted Dashboard v1",
      locked: true,
      deprecated: true,
      description: "From candidate shortlist to finalized contracts: Kurt guides through draft creation, compliance review, localized e-signatures, and onboarding completion with inline editing and conversational flow",
      steps: "6 steps",
      patterns: "5 patterns",
      badges: [
        { label: "Genie-Led Conversational", path: "/onboarding" },
        { label: "Contract Preview & E-Sign", path: "/contract-preview" }
      ],
      additionalCount: 3,
      dataModel: "/docs/Flow2_Admin_Contracting_Data_Model.md"
    },
    'flow-3-candidate-data': {
      path: "/flows/candidate-onboarding",
      iconColor: "violet",
      icon: UserCheck,
      title: "Flow 2 Worker Data Collection v1",
      status: "now" as const,
      deprecated: false,
      description: "Transition candidates from offer acceptance to contract-ready status: collect personal, tax, and banking details with Genie validation, compliance checking, and ATS integration",
      steps: "4 steps",
      patterns: "4 patterns",
      badges: [
        { label: "Genie-Led Conversational", path: "/onboarding" },
        { label: "Smart Approval", path: "/confirmation-modal" },
        { label: "Compliance Checklist", path: "/compliance-checklist" }
      ],
      additionalCount: 1,
      dataModel: "/docs/Flow3_Candidate_Data_Collection_Data_Model.md"
    },
    'flow-3-candidate-data-v2': {
      path: "/flows/candidate-data-collection-v2",
      iconColor: "violet",
      icon: UserCheck,
      title: "Flow 2 Worker Data Collection v2",
      status: "next" as const,
      deprecated: false,
      description: "Editable version of v1: Transition candidates from offer acceptance to contract-ready status. This version is unlocked for development and isolated from v1.",
      steps: "4 steps",
      patterns: "4 patterns",
      badges: [
        { label: "Genie-Led Conversational", path: "/onboarding" },
        { label: "Smart Approval", path: "/confirmation-modal" },
        { label: "Compliance Checklist", path: "/compliance-checklist" }
      ],
      additionalCount: 1,
      dataModel: "/docs/Flow3_Candidate_Data_Collection_Data_Model.md"
    },
    'flow-3-candidate-data-v3': {
      path: "/flows/candidate-data-collection-v3",
      iconColor: "violet",
      icon: UserCheck,
      title: "Flow 2 Worker Data Collection v3",
      status: "future" as const,
      deprecated: false,
      description: "Future version of worker data collection: Transition candidates from offer acceptance to contract-ready status. Cloned from v2 for visionary experimentation.",
      steps: "4 steps",
      patterns: "4 patterns",
      badges: [
        { label: "Genie-Led Conversational", path: "/onboarding" },
        { label: "Smart Approval", path: "/confirmation-modal" },
        { label: "Compliance Checklist", path: "/compliance-checklist" }
      ],
      additionalCount: 1,
      dataModel: "/docs/Flow3_Candidate_Data_Collection_Data_Model.md"
    },
    'flow-4-candidate-onboarding': {
      path: "/flows/worker-onboarding",
      iconColor: "emerald",
      icon: UserCheck,
      title: "Flow 3 Worker Onboarding v1",
      locked: true,
      deprecated: false,
      description: "Post-contract onboarding for workers: verify personal info, upload compliance docs, set up payroll, complete work setup, and review onboarding checklist for a smooth first day. Locked for backend build — no further changes allowed.",
      steps: "7 steps",
      patterns: "5 patterns",
      badges: [
        { label: "Step Card Stack + Progress Bar", path: "/onboarding" },
        { label: "Compliance Checklist", path: "/compliance-checklist" },
        { label: "Checklist Progress", path: "/smart-progress" }
      ],
      additionalCount: 2,
      dataModel: "/docs/Flow4_Candidate_Onboarding_Data_Model.md"
    },
    'flow-3-candidate-onboarding-v2': {
      path: "/flows/worker-onboarding-v2",
      iconColor: "emerald",
      icon: UserCheck,
      title: "Flow 3 Worker Onboarding v2",
      status: "now" as const,
      deprecated: false,
      description: "Editable version of v1: Post-contract onboarding for workers with personal info verification, compliance docs, payroll setup, and work setup. This version is unlocked for development.",
      steps: "7 steps",
      patterns: "5 patterns",
      badges: [
        { label: "Step Card Stack + Progress Bar", path: "/onboarding" },
        { label: "Compliance Checklist", path: "/compliance-checklist" },
        { label: "Checklist Progress", path: "/smart-progress" }
      ],
      additionalCount: 2,
      dataModel: null
    },
    'flow-5-candidate-dashboard': {
      path: "/flows/candidate-dashboard",
      iconColor: "blue",
      icon: Workflow,
      title: "Flow 4 Worker Dashboard v1",
      locked: true,
      deprecated: false,
      description: "Post-onboarding candidate dashboard: contract review & signing with DocuSign sub-statuses, document management, and certification tracking. Locked — finalized flow.",
      steps: "2 steps",
      patterns: "3 patterns",
      badges: [
        { label: "Data Summary Cards", path: "/data-summary" },
        { label: "Compliance Checklist", path: "/compliance-checklist" },
        { label: "Genie-Led Conversational", path: "/onboarding" }
      ],
      additionalCount: 0,
      dataModel: "/docs/Flow5_Candidate_Dashboard_Data_Model.md"
    },
    'flow-5-candidate-dashboard-v2': {
      path: "/flows/candidate-dashboard-v2",
      iconColor: "blue",
      icon: Workflow,
      title: "Flow 4 Worker Dashboard v2",
      locked: false,
      deprecated: false,
      description: "Editable version of v1: Post-onboarding candidate dashboard with contract review & signing, document management, and certification tracking. This version is unlocked for development.",
      steps: "2 steps",
      patterns: "3 patterns",
      badges: [
        { label: "Data Summary Cards", path: "/data-summary" },
        { label: "Compliance Checklist", path: "/compliance-checklist" },
        { label: "Genie-Led Conversational", path: "/onboarding" }
      ],
      additionalCount: 0,
      dataModel: "/docs/Flow5_Candidate_Dashboard_Data_Model.md"
    },
    'flow-1.1-fronted-admin': {
      path: "/flows/contract-flow-multi-company",
      iconColor: "cyan",
      icon: Workflow,
      title: "Flow 1 Fronted Dashboard v2",
      locked: false,
      live: true,
      deprecated: false,
      description: "Multi-company version of Flow 2: Switch between companies and manage contracts across multiple organizations. Includes company switcher dropdown with 'Add New Company' action.",
      steps: "7 steps",
      patterns: "5 patterns",
      badges: [
        { label: "Genie-Led Conversational", path: "/onboarding" },
        { label: "Contract Preview & E-Sign", path: "/contract-preview" }
      ],
      additionalCount: 3,
      dataModel: null
    },
    'flow-2.1-company-admin': {
      path: "/flows/contract-flow-company-admin",
      iconColor: "purple",
      icon: Workflow,
      title: "Flow 2.2 Company Admin v1",
      locked: false,
      deprecated: false,
      description: "Multi-company version of Flow 2: Switch between companies and manage contracts across multiple organizations. Includes company switcher dropdown with 'Add New Company' action.",
      steps: "7 steps",
      patterns: "5 patterns",
      badges: [
        { label: "Genie-Led Conversational", path: "/onboarding" },
        { label: "Contract Preview & E-Sign", path: "/contract-preview" }
      ],
      additionalCount: 3,
      dataModel: null
    },
    'flow-5-company-admin-onboarding': {
      path: "/flows/company-admin-onboarding",
      iconColor: "blue",
      icon: Workflow,
      title: "Flow 5 Company Admin Onboarding v1",
      status: "now" as const,
      deprecated: false,
      description: "Standalone onboarding flow for Company Admins accessed via email invite. Duplicated from Add Company flow with admin-focused messaging and no close button.",
      steps: "3 steps",
      patterns: "3 patterns",
      badges: [
        { label: "Step Card Stack + Progress Bar", path: "/step-card-pattern" }
      ],
      additionalCount: 0,
      dataModel: null
    },
    'flow-5-company-admin-onboarding-v2': {
      path: "/flows/company-admin-onboarding-v2",
      iconColor: "blue",
      icon: Workflow,
      title: "Flow 5 Company Admin Onboarding v2",
      status: "next" as const,
      deprecated: false,
      description: "Isolated clone of Flow 5 v1. Standalone onboarding flow for Company Admins accessed via email invite.",
      steps: "3 steps",
      patterns: "3 patterns",
      badges: [
        { label: "Step Card Stack + Progress Bar", path: "/step-card-pattern" }
      ],
      additionalCount: 0,
      dataModel: null
    },
    'flow-5-company-admin-onboarding-v3': {
      path: "/flows/company-admin-onboarding-v3",
      iconColor: "blue",
      icon: Workflow,
      title: "Flow 5 Company Admin Onboarding v3",
      status: "future" as const,
      deprecated: false,
      description: "Future state clone of Flow 5 v2. Standalone onboarding flow for Company Admins accessed via email invite.",
      steps: "3 steps",
      patterns: "3 patterns",
      badges: [
        { label: "Step Card Stack + Progress Bar", path: "/step-card-pattern" }
      ],
      additionalCount: 0,
      dataModel: null
    },
    'flow-6-company-admin-dashboard': {
      path: "/flows/company-admin-dashboard",
      iconColor: "purple",
      icon: UserCheck,
      title: "Flow 6 Company Dashboard v1",
      locked: false,
      deprecated: false,
      description: "Single-tenant dashboard for company admins to view certified workers and access contracts/certificates. No company switcher — scoped to one company with search and filtering.",
      steps: "1 view",
      patterns: "2 patterns",
      badges: [
        { label: "Data Summary Cards", path: "/data-summary" },
        { label: "Dashboard Layout", path: "/dashboard" }
      ],
      additionalCount: 0,
      dataModel: null
    },
    'flow-6-company-admin-dashboard-v2': {
      path: "/flows/company-admin-dashboard-v2",
      iconColor: "purple",
      icon: UserCheck,
      title: "Flow 6 Company Dashboard v2",
      locked: false,
      deprecated: false,
      description: "Full payroll workbench for Company Admins. 1:1 clone of Flow 7 Fronted Admin Payroll v1 with self-service capabilities.",
      steps: "4 steps",
      patterns: "6 patterns",
      badges: [
        { label: "Payroll Batch", path: "/payroll-batch" },
        { label: "FX Review", path: "/payroll-batch" }
      ],
      additionalCount: 4,
      dataModel: null
    },
    'flow-6-company-admin-dashboard-v3': {
      path: "/flows/company-admin-dashboard-v3",
      iconColor: "purple",
      icon: UserCheck,
      title: "Flow 6 Company Dashboard v3",
      status: "now" as const,
      deprecated: false,
      description: "Editable version of v2: Full payroll workbench for Company Admins. Isolated clone for further development.",
      steps: "4 steps",
      patterns: "6 patterns",
      badges: [
        { label: "Payroll Batch", path: "/payroll-batch" },
        { label: "FX Review", path: "/payroll-batch" }
      ],
      additionalCount: 4,
      dataModel: null
    },
    'flow-6-company-admin-dashboard-v4': {
      path: "/flows/company-admin-dashboard-v4",
      iconColor: "purple",
      icon: UserCheck,
      title: "Flow 6 Company Dashboard v4 (Agentic)",
      status: "next" as const,
      deprecated: false,
      description: "Isolated clone of v3 with agent-first patterns and fully independent CA4_ components. Changes here do NOT affect v3.",
      steps: "4 steps",
      patterns: "6 patterns",
      badges: [
        { label: "Payroll Batch", path: "/payroll-batch" },
        { label: "FX Review", path: "/payroll-batch" }
      ],
      additionalCount: 4,
      dataModel: null
    },
    'flow-6-company-admin-dashboard-v5': {
      path: "/flows/company-admin-dashboard-v5",
      iconColor: "blue",
      icon: UserCheck,
      title: "Flow 6 Company Dashboard v5",
      status: "future" as const,
      deprecated: false,
      description: "Isolated clone of v4 for future experimentation. Independent CA5_ components ensure changes do NOT affect v4.",
      steps: "4 steps",
      patterns: "6 patterns",
      badges: [
        { label: "Payroll Batch", path: "/payroll-batch" },
        { label: "FX Review", path: "/payroll-batch" }
      ],
      additionalCount: 4,
      dataModel: null
    },
    'flow-1.1-fronted-admin-v3': {
      path: "/flows/contract-flow-multi-company-v3",
      iconColor: "cyan",
      icon: Workflow,
      title: "Flow 1 Fronted Dashboard v3",
      locked: false,
      deprecated: false,
      description: "Editable version of v2: Multi-company admin dashboard with pipeline, company switcher, add new company flow, and contractor management. This version is unlocked for development.",
      steps: "7 steps",
      patterns: "5 patterns",
      badges: [
        { label: "Genie-Led Conversational", path: "/onboarding" },
        { label: "Contract Preview & E-Sign", path: "/contract-preview" }
      ],
      additionalCount: 3,
      dataModel: null
    },
    'flow-2.1-admin-payroll': {
      path: "/payroll-batch",
      iconColor: "amber",
      icon: Workflow,
      title: "Flow 7 Fronted Admin Payroll v1",
      locked: true,
      deprecated: true,
      hidden: true,
      description: "From compliance review to payroll execution: Kurt guides through payroll batch creation, FX rate review, CFO approval workflow, and batch execution with real-time monitoring and conversational guidance",
      steps: "6 steps",
      patterns: "5 patterns",
      badges: [
        { label: "Genie-Led Conversational Onboarding", path: "/onboarding" },
        { label: "FX Breakdown Popover", path: "/fx-breakdown" },
        { label: "Confirmation Prompt + Smart Approval Modal", path: "/confirmation-modal" }
      ],
      additionalCount: 2,
      dataModel: null
    },
    'flow-5.1-employee-payroll': {
      path: "/flows/employee-payroll",
      iconColor: "blue",
      icon: Workflow,
      title: "Flow 5.1 — Employee Payroll",
      locked: false,
      deprecated: false,
      description: "Duplicate of Flow 5 for employee payroll cycle. Will later be updated to support the employee payroll cycle (after payroll posting & payslips). Currently a clean clone — no modifications yet.",
      steps: "2 steps",
      patterns: "3 patterns",
      badges: [
        { label: "Data Summary Cards", path: "/data-summary" },
        { label: "Compliance Checklist", path: "/compliance-checklist" },
        { label: "Genie-Led Conversational", path: "/onboarding" }
      ],
      additionalCount: 0,
      dataModel: null
    },
    'flow-5.2-contractor-payroll': {
      path: "/flows/contractor-payroll",
      iconColor: "blue",
      icon: Workflow,
      title: "Flow 5.2 — Contractor Payroll",
      locked: false,
      deprecated: false,
      description: "Duplicate of Flow 5 for contractor payroll cycle. Will later be updated to support the contractor payroll cycle (after payroll posting & payslips). Currently a clean clone — no modifications yet.",
      steps: "2 steps",
      patterns: "3 patterns",
      badges: [
        { label: "Data Summary Cards", path: "/data-summary" },
        { label: "Compliance Checklist", path: "/compliance-checklist" },
        { label: "Genie-Led Conversational", path: "/onboarding" }
      ],
      additionalCount: 0,
      dataModel: null
    },
    'flow-4.1-employee-dashboard-v3': {
      path: "/candidate-dashboard-employee-v3",
      iconColor: "blue",
      icon: UserCheck,
      title: "Flow 4.1 Employee Dashboard v3",
      locked: false,
      deprecated: false,
      description: "Employee-specific dashboard: Post-onboarding view with contract documents, certificates, and T-5 confirmation. Duplicate of Candidate Dashboard v2 scoped for employees.",
      steps: "1 view",
      patterns: "3 patterns",
      badges: [
        { label: "Data Summary Cards", path: "/data-summary" },
        { label: "Genie-Led Conversational", path: "/onboarding" }
      ],
      additionalCount: 0,
      dataModel: null
    },
    'flow-4.1-employee-dashboard-v4': {
      path: "/candidate-dashboard-employee-v4",
      iconColor: "blue",
      icon: UserCheck,
      title: "Flow 4.1 Employee Dashboard v4",
      locked: false,
      deprecated: false,
      description: "Isolated clone of v3: Employee-specific dashboard with T-5 confirmation and adjustments. Changes here do NOT affect v3.",
      steps: "1 view",
      patterns: "3 patterns",
      badges: [
        { label: "Data Summary Cards", path: "/data-summary" },
        { label: "Genie-Led Conversational", path: "/onboarding" }
      ],
      additionalCount: 0,
      dataModel: null
    },
    'flow-4.2-contractor-dashboard-v3': {
      path: "/candidate-dashboard-contractor-v3",
      iconColor: "emerald",
      icon: UserCheck,
      title: "Flow 4.2 Contractor Dashboard v3",
      locked: false,
      deprecated: false,
      description: "Contractor-specific dashboard: Post-onboarding view with contract documents, certificates, and T-5 confirmation. Duplicate of Candidate Dashboard v2 scoped for contractors.",
      steps: "1 view",
      patterns: "3 patterns",
      badges: [
        { label: "Data Summary Cards", path: "/data-summary" },
        { label: "Genie-Led Conversational", path: "/onboarding" }
      ],
      additionalCount: 0,
      dataModel: null
    },
    'flow-4.2-contractor-dashboard-v4': {
      path: "/candidate-dashboard-contractor-v4",
      iconColor: "emerald",
      icon: UserCheck,
      title: "Flow 4.2 Contractor Dashboard v4",
      locked: false,
      deprecated: false,
      description: "Isolated clone of v3: Contractor-specific dashboard with invoice management and adjustments. Changes here do NOT affect v3.",
      steps: "1 view",
      patterns: "3 patterns",
      badges: [
        { label: "Data Summary Cards", path: "/data-summary" },
        { label: "Genie-Led Conversational", path: "/onboarding" }
      ],
      additionalCount: 0,
      dataModel: null
    },
    'flow-4.1-employee-dashboard-v5': {
      path: "/candidate-dashboard-employee-v5",
      iconColor: "blue",
      icon: UserCheck,
      title: "Flow 4.1 Employee Dashboard v5",
      locked: false,
      deprecated: false,
      description: "Isolated clone of v4: Employee-specific dashboard with T-5 payroll confirmation, adjustments, leaves, and pay breakdown. Changes here do NOT affect v4.",
      steps: "1 view",
      patterns: "4 patterns",
      badges: [
        { label: "T-5 Confirmation", path: "/data-summary" },
        { label: "Pay Breakdown", path: "/data-summary" },
        { label: "Leave Management", path: "/data-summary" }
      ],
      additionalCount: 1,
      dataModel: null
    },
    'flow-4.2-contractor-dashboard-v5': {
      path: "/candidate-dashboard-contractor-v5",
      iconColor: "emerald",
      icon: UserCheck,
      title: "Flow 4.2 Contractor Dashboard v5",
      locked: false,
      deprecated: false,
      description: "Isolated clone of v4: Contractor-specific dashboard with T-5 invoice confirmation, adjustments, and invoice breakdown. Changes here do NOT affect v4.",
      steps: "1 view",
      patterns: "4 patterns",
      badges: [
        { label: "T-5 Confirmation", path: "/data-summary" },
        { label: "Invoice Breakdown", path: "/data-summary" },
        { label: "Adjustment Management", path: "/data-summary" }
      ],
      additionalCount: 1,
      dataModel: null
    },
    'flow-4.1-employee-dashboard-v6': {
      path: "/candidate-dashboard-employee-v6",
      iconColor: "blue",
      icon: UserCheck,
      title: "Flow 4.1 Employee Dashboard v6",
      locked: false,
      deprecated: false,
      description: "Isolated clone of v5: Employee-specific dashboard with T-5 payroll confirmation, adjustments, leaves, and pay breakdown. Changes here do NOT affect v5.",
      steps: "1 view",
      patterns: "4 patterns",
      badges: [
        { label: "T-5 Confirmation", path: "/data-summary" },
        { label: "Pay Breakdown", path: "/data-summary" },
        { label: "Leave Management", path: "/data-summary" }
      ],
      additionalCount: 1,
      dataModel: null
    },
    'flow-4.2-contractor-dashboard-v6': {
      path: "/candidate-dashboard-contractor-v6",
      iconColor: "emerald",
      icon: UserCheck,
      title: "Flow 4.2 Contractor Dashboard v6",
      locked: false,
      deprecated: false,
      description: "Isolated clone of v5: Contractor-specific dashboard with T-5 invoice confirmation, adjustments, and invoice breakdown. Changes here do NOT affect v5.",
      steps: "1 view",
      patterns: "4 patterns",
      badges: [
        { label: "T-5 Confirmation", path: "/data-summary" },
        { label: "Invoice Breakdown", path: "/data-summary" },
        { label: "Adjustment Management", path: "/data-summary" }
      ],
      additionalCount: 1,
      dataModel: null
    },
    'flow-4.1-employee-dashboard-v7': {
      path: "/candidate-dashboard-employee-v7",
      iconColor: "blue",
      icon: UserCheck,
      title: "Flow 4.1 Employee Dashboard v7",
      status: "now" as const,
      deprecated: false,
      description: "Isolated clone of v6: Employee-specific dashboard with T-5 payroll confirmation, adjustments, leaves, and pay breakdown. Changes here do NOT affect v6.",
      steps: "1 view",
      patterns: "4 patterns",
      badges: [
        { label: "T-5 Confirmation", path: "/data-summary" },
        { label: "Pay Breakdown", path: "/data-summary" },
        { label: "Leave Management", path: "/data-summary" }
      ],
      additionalCount: 1,
      dataModel: null
    },
    'flow-4.1-employee-dashboard-v7-next': {
      path: "/candidate-dashboard-employee-v7-next",
      iconColor: "amber",
      icon: UserCheck,
      title: "Flow 4.1 Employee Dashboard v8",
      status: "next" as const,
      deprecated: false,
      description: "Isolated clone of v7: Employee-specific dashboard for next iteration. Independent components (F41v7n_ prefix) ensure changes do NOT affect v7.",
      steps: "1 view",
      patterns: "4 patterns",
      badges: [
        { label: "T-5 Confirmation", path: "/data-summary" },
        { label: "Pay Breakdown", path: "/data-summary" },
        { label: "Leave Management", path: "/data-summary" }
      ],
      additionalCount: 1,
      dataModel: null
    },
    'flow-4.1-employee-dashboard-v8': {
      path: "/candidate-dashboard-employee-v8",
      iconColor: "blue",
      icon: UserCheck,
      title: "Flow 4.1 Employee Dashboard v9",
      status: "future" as const,
      deprecated: false,
      description: "Isolated clone of v7: Employee-specific dashboard for future experimentation. Independent components (F41v8_ prefix) ensure changes do NOT affect v7.",
      steps: "1 view",
      patterns: "4 patterns",
      badges: [
        { label: "T-5 Confirmation", path: "/data-summary" },
        { label: "Pay Breakdown", path: "/data-summary" },
        { label: "Leave Management", path: "/data-summary" }
      ],
      additionalCount: 1,
      dataModel: null
    },
    'flow-4.2-contractor-dashboard-v7': {
      path: "/candidate-dashboard-contractor-v7",
      iconColor: "emerald",
      icon: UserCheck,
      title: "Flow 4.2 Contractor Dashboard v7",
      status: "now" as const,
      deprecated: false,
      description: "Isolated clone of v6: Contractor-specific dashboard with T-5 invoice confirmation, adjustments, and invoice breakdown. Changes here do NOT affect v6.",
      steps: "1 view",
      patterns: "4 patterns",
      badges: [
        { label: "T-5 Confirmation", path: "/data-summary" },
        { label: "Invoice Breakdown", path: "/data-summary" },
        { label: "Adjustment Management", path: "/data-summary" }
      ],
      additionalCount: 1,
      dataModel: null
    },
    'flow-1-fronted-admin-v3': {
      path: "/flows/fronted-admin-dashboard-v4",
      iconColor: "cyan",
      icon: Workflow,
      title: "Flow 1 Fronted Dashboard v3",
      locked: false,
      deprecated: false,
      description: "Fronted internal admin dashboard: Clone of Flow 6 v2 with full payroll workbench, Workers/Payroll tabs, self-service capabilities. Decoupled from company admin context.",
      steps: "4 steps",
      patterns: "6 patterns",
      badges: [
        { label: "Payroll Batch", path: "/payroll-batch" },
        { label: "FX Review", path: "/payroll-batch" }
      ],
      additionalCount: 4,
      dataModel: null
    },
    'flow-1-fronted-admin-v4': {
      path: "/flows/fronted-admin-dashboard-v4-clone",
      iconColor: "cyan",
      icon: Workflow,
      title: "Flow 1 Fronted Dashboard v4",
      locked: false,
      deprecated: false,
      description: "Isolated copy of Flow 1 v2 (Fronted Admin Dashboard). Fresh clone for active development with full component isolation.",
      steps: "7 steps",
      patterns: "5 patterns",
      badges: [
        { label: "Genie-Led Conversational", path: "/onboarding" },
        { label: "Contract Preview & E-Sign", path: "/contract-preview" }
      ],
      additionalCount: 3,
      dataModel: null
    },
    'flow-1-fronted-admin-v5': {
      path: "/flows/fronted-admin-dashboard-v5-clone",
      iconColor: "cyan",
      icon: Workflow,
      title: "Flow 1 Fronted Dashboard v5",
      status: "now" as const,
      deprecated: false,
      description: "Isolated copy of Flow 1 v4. Fresh clone for active development. Changes do NOT affect v4.",
      steps: "7 steps",
      patterns: "5 patterns",
      badges: [
        { label: "Genie-Led Conversational", path: "/onboarding" },
        { label: "Contract Preview & E-Sign", path: "/contract-preview" }
      ],
      additionalCount: 3,
      dataModel: null
    },
    'flow-1-fronted-admin-v6': {
      path: "/flows/fronted-admin-dashboard-v6-clone",
      iconColor: "cyan",
      icon: Workflow,
      title: "Flow 1 Fronted Dashboard v6",
      status: "next" as const,
      deprecated: false,
      description: "Isolated copy of Flow 1 v5. Fresh clone for active development. Changes do NOT affect v5.",
      steps: "7 steps",
      patterns: "5 patterns",
      badges: [
        { label: "Genie-Led Conversational", path: "/onboarding" },
        { label: "Contract Preview & E-Sign", path: "/contract-preview" }
      ],
      additionalCount: 3,
      dataModel: null
    },
    'flow-1-fronted-admin-v7': {
      path: "/flows/fronted-admin-dashboard-v7-clone",
      iconColor: "cyan",
      icon: Workflow,
      title: "Flow 1 Fronted Dashboard v7 (Experimental)",
      status: "future" as const,
      deprecated: false,
      description: "Isolated clone of Flow 1 v6. Experimental branch for active development. Changes do NOT affect v6.",
      steps: "7 steps",
      patterns: "5 patterns",
      badges: [
        { label: "Genie-Led Conversational", path: "/onboarding" },
        { label: "Contract Preview & E-Sign", path: "/contract-preview" }
      ],
      additionalCount: 3,
      dataModel: null
    },
    'shared-secure-link-error': {
      path: "/secure-link-error",
      iconColor: "amber",
      icon: ShieldAlert,
      title: "Shared – Secure Link Error (403)",
      status: "now" as const,
      deprecated: false,
      description: "Full-screen error state shown when a secure data collection link is invalid, expired, or cannot be accessed. Reusable pattern for payroll/onboarding forms.",
      steps: "1 screen",
      patterns: "1 pattern",
      badges: [
        { label: "Error State", path: "/empty-state" }
      ],
      additionalCount: 0,
      dataModel: null
    },
    'shared-server-error': {
      path: "/server-error",
      iconColor: "amber",
      icon: ShieldAlert,
      title: "Shared – Server Error (500)",
      status: "now" as const,
      deprecated: false,
      description: "Full-screen error state shown when the platform hits an unexpected server error. Reusable pattern for any page (payroll, onboarding, dashboards).",
      steps: "1 screen",
      patterns: "1 pattern",
      badges: [
        { label: "Error State", path: "/empty-state" }
      ],
      additionalCount: 0,
      dataModel: null
    },
    'shared-onboarding-link-gone': {
      path: "/onboarding-link-gone",
      iconColor: "amber",
      icon: ShieldAlert,
      title: "Shared – Onboarding Link Gone (410)",
      status: "now" as const,
      deprecated: false,
      description: "Full-screen error state shown when a company admin tries to re-use an onboarding link that has already been completed. The resource existed but is no longer valid.",
      steps: "1 screen",
      patterns: "1 pattern",
      badges: [
        { label: "Error State", path: "/empty-state" }
      ],
      additionalCount: 0,
      dataModel: null
    },
    'shared-payslip-template': {
      path: "/flows/payslip-template",
      iconColor: "blue",
      icon: FileText,
      title: "Shared – Payslip Template",
      status: "now" as const,
      deprecated: false,
      description: "Universal EOR payslip template with Fronted-branded letterhead, country-adaptive earnings/deductions, YTD, holiday balances, and employer costs. Based on UK, NL, and DK standards.",
      steps: "1 screen",
      patterns: "3 patterns",
      badges: [
        { label: "Payslip Layout", path: "/flows/payslip-template" },
        { label: "Country-Adaptive", path: "/flows/payslip-template" }
      ],
      additionalCount: 1,
      dataModel: null
    },
    'shared-invoice-template': {
      path: "/flows/invoice-template",
      iconColor: "cyan",
      icon: FileText,
      title: "Shared – Invoice Template",
      status: "now" as const,
      deprecated: false,
      description: "Universal EOR invoice template supporting limited company and individual contractor modes. Fronted-branded with line items, payment details, and contractor identity display.",
      steps: "1 screen",
      patterns: "2 patterns",
      badges: [
        { label: "Company Invoice", path: "/flows/invoice-template" },
        { label: "Contractor Invoice", path: "/flows/invoice-template" }
      ],
      additionalCount: 0,
      dataModel: null
    },
    'shared-worker-empty-states': {
      path: "/flows/shared-worker-empty-states",
      iconColor: "blue",
      icon: FileText,
      title: "Shared – Worker Empty States",
      status: "next" as const,
      deprecated: false,
      description: "First-time worker dashboard experience with empty states for payroll and adjustments tabs. Used by both Flow 4.1 (Employee) and Flow 4.2 (Contractor).",
      steps: "2 tabs",
      patterns: "2 patterns",
      badges: [
        { label: "Empty Payroll", path: "/flows/shared-worker-empty-states" },
        { label: "Empty Adjustments", path: "/flows/shared-worker-empty-states" }
      ],
      additionalCount: 0,
      dataModel: null
    }
  };

  const flow = flowsData[flowId as keyof typeof flowsData];
  if (!flow) return null;

  const Icon = flow.icon || Workflow;
  const colorClasses = {
    amber: { bg: "bg-amber-500/10", border: "border-amber-500/20", hoverBg: "group-hover:bg-amber-600", hoverBorder: "group-hover:border-amber-600", text: "text-amber-600", darkText: "dark:text-amber-400" },
    emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", hoverBg: "group-hover:bg-emerald-600", hoverBorder: "group-hover:border-emerald-600", text: "text-emerald-600", darkText: "dark:text-emerald-400" },
    violet: { bg: "bg-violet-500/10", border: "border-violet-500/20", hoverBg: "group-hover:bg-violet-600", hoverBorder: "group-hover:border-violet-600", text: "text-violet-600", darkText: "dark:text-violet-400" },
    blue: { bg: "bg-blue-500/10", border: "border-blue-500/20", hoverBg: "group-hover:bg-blue-600", hoverBorder: "group-hover:border-blue-600", text: "text-blue-600", darkText: "dark:text-blue-400" },
    cyan: { bg: "bg-cyan-500/10", border: "border-cyan-500/20", hoverBg: "group-hover:bg-cyan-600", hoverBorder: "group-hover:border-cyan-600", text: "text-cyan-600", darkText: "dark:text-cyan-400" },
    purple: { bg: "bg-purple-500/10", border: "border-purple-500/20", hoverBg: "group-hover:bg-purple-600", hoverBorder: "group-hover:border-purple-600", text: "text-purple-600", darkText: "dark:text-purple-400" }
  };

  const colors = colorClasses[flow.iconColor as keyof typeof colorClasses];

  // Extract version tag from title (e.g. "v5", "v7 (Experimental)")
  const versionMatch = flow.title.match(/\s+(v\d+.*)$/i);
  const versionTag = versionMatch ? versionMatch[1].trim() : null;
  const displayTitle = (versionTag ? flow.title.replace(versionMatch[0], '') : flow.title).replace(/\s*Admin\s*/gi, ' ').replace(/\s+/g, ' ').trim();

  // Clean up version tag - remove parenthetical text like "(Experimental)"
  const cleanVersionTag = versionTag ? versionTag.replace(/\s*\(.*\)/, '') : null;

  return (
    <Card className={`hover:shadow-lg transition-all group cursor-move flex flex-col ${flow.deprecated ? 'opacity-50' : ''}`}>
        <CardHeader className="flex-1 min-h-0">
          <div className="flex items-center gap-3 mb-1.5">
            <CardTitle className="text-lg flex-1 truncate">{displayTitle}</CardTitle>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {cleanVersionTag && (
                <Badge variant="outline" className="text-[10px] font-medium text-muted-foreground border-border bg-muted/40">
                  {cleanVersionTag}
                </Badge>
              )}
              {'status' in flow && flow.status === 'now' && (
                <Badge className="text-[10px] font-medium bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30 hover:bg-emerald-100">
                  Now
                </Badge>
              )}
              {'status' in flow && flow.status === 'next' && (
                <Badge className="text-[10px] font-medium bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30 hover:bg-amber-100">
                  Next
                </Badge>
              )}
              {'status' in flow && flow.status === 'future' && (
                <Badge className="text-[10px] font-medium bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30 hover:bg-blue-100">
                  Future
                </Badge>
              )}
            </div>
          </div>
          <CardDescription className="line-clamp-2">
            {flow.description}
          </CardDescription>
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
            <span className="font-medium">{flow.steps}</span>
            <span>•</span>
            <span>{flow.patterns}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div className="flex flex-nowrap gap-1.5 overflow-hidden">
            {flow.badges.slice(0, 2).map((badge, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="text-xs cursor-pointer hover:bg-foreground hover:text-background transition-all duration-200 truncate max-w-[160px] flex-shrink-0"
                onClick={onPatternClick(badge.path)}
              >
                {badge.label}
              </Badge>
            ))}
            {(flow.additionalCount > 0 || flow.badges.length > 2) && (
              <Badge variant="outline" className="text-xs flex-shrink-0">
                +{flow.additionalCount + Math.max(0, flow.badges.length - 2)}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Link 
              to={flow.path}
              className="flex items-center text-sm text-primary hover:translate-x-1 transition-transform"
              onClick={(e) => e.stopPropagation()}
            >
              View flow
              <ArrowRight className="w-3.5 h-3.5 ml-1 hover:translate-x-0.5 transition-transform" strokeWidth={2} />
            </Link>
            {flow.dataModel && (
              <>
                <div className="h-4 w-px bg-border" />
                <a
                  href={flow.dataModel}
                  download={flow.dataModel.split('/').pop()}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                  onClick={e => e.stopPropagation()}
                >
                  <FileText className="w-3.5 h-3.5" strokeWidth={2} />
                  Data Model
                </a>
              </>
            )}
          </div>
        </CardContent>
      </Card>
  );
};
