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
      title: "Flow 1 Fronted Admin Dashboard v1",
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
      title: "Flow 2 Candidate Data Collection v1",
      locked: true,
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
      title: "Flow 2 Candidate Data Collection v2",
      locked: false,
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
    'flow-4-candidate-onboarding': {
      path: "/flows/worker-onboarding",
      iconColor: "emerald",
      icon: UserCheck,
      title: "Flow 3 Candidate Onboarding v1",
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
      title: "Flow 3 Candidate Onboarding v2",
      locked: false,
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
      title: "Flow 4 Candidate Dashboard v1",
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
      title: "Flow 4 Candidate Dashboard v2",
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
      title: "Flow 1 Fronted Admin Dashboard v2",
      locked: true,
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
      locked: false,
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
    'flow-6-company-admin-dashboard': {
      path: "/flows/company-admin-dashboard",
      iconColor: "purple",
      icon: UserCheck,
      title: "Flow 6 Company Admin Dashboard v1",
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
      title: "Flow 6 Company Admin Dashboard v2",
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
    'flow-1.1-fronted-admin-v3': {
      path: "/flows/contract-flow-multi-company-v3",
      iconColor: "cyan",
      icon: Workflow,
      title: "Flow 1 Fronted Admin Dashboard v3",
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
    'flow-1-fronted-admin-v3': {
      path: "/flows/fronted-admin-dashboard-v4",
      iconColor: "cyan",
      icon: Workflow,
      title: "Flow 1 Fronted Admin Dashboard v3",
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
    'shared-secure-link-error': {
      path: "/secure-link-error",
      iconColor: "amber",
      icon: ShieldAlert,
      title: "Shared – Secure Link Error (403)",
      locked: false,
      deprecated: false,
      description: "Full-screen error state shown when a secure data collection link is invalid, expired, or cannot be accessed. Reusable pattern for payroll/onboarding forms.",
      steps: "1 screen",
      patterns: "1 pattern",
      badges: [
        { label: "Error State", path: "/empty-state" }
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

  return (
    <Card className={`hover:shadow-lg transition-all group h-full cursor-move ${flow.deprecated ? 'opacity-50' : ''}`}>
        <CardHeader className={flow.locked ? "relative" : ""}>
          <div className={`flex items-center gap-3 ${flow.locked ? 'mb-3' : 'mb-1.5'}`}>
            <div className={`p-2 rounded-xl ${colors.bg} ${colors.border} border transition-all duration-200 ${colors.hoverBg} ${colors.hoverBorder}`}>
              <Icon className={`h-5 w-5 ${colors.text} ${colors.darkText} transition-colors duration-200 group-hover:text-white`} />
            </div>
            <CardTitle className="text-lg flex-1">{flow.title}</CardTitle>
            {flow.locked && (
              <Badge variant="secondary" className="bg-muted text-muted-foreground border-border">
                🔒
              </Badge>
            )}
            {flow.locked && !flow.deprecated && (
              <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/30">
                Live
              </Badge>
            )}
            {flow.deprecated && (
              <Badge variant="outline" className="bg-background/50 text-muted-foreground border-muted">
                Old
              </Badge>
            )}
          </div>
          <CardDescription className="line-clamp-3">
            {flow.description}
          </CardDescription>
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
            <span className="font-medium">{flow.steps}</span>
            <span>•</span>
            <span>{flow.patterns}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {flow.badges.map((badge, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="text-xs cursor-pointer hover:bg-foreground hover:text-background transition-all duration-200"
                onClick={onPatternClick(badge.path)}
              >
                {badge.label}
              </Badge>
            ))}
            {flow.additionalCount > 0 && (
              <Badge variant="outline" className="text-xs">
                +{flow.additionalCount}
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
