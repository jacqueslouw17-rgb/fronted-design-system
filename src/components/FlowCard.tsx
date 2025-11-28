import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, FileText, Workflow, UserCheck } from "lucide-react";

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
      title: "Flow 2.1 - Company Admin Onboarding v1",
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
      title: "Flow 1.1 Fronted Admin Dashboard v1",
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
      title: "Flow 1.1 Candidate Data Collection v1",
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
    'flow-4-candidate-onboarding': {
      path: "/flows/worker-onboarding",
      iconColor: "emerald",
      icon: UserCheck,
      title: "Flow 3.1 Candidate Onboarding v1",
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
    'flow-5-candidate-dashboard': {
      path: "/flows/candidate-dashboard",
      iconColor: "blue",
      icon: Workflow,
      title: "Flow 3.2 Candidate Dashboard v1",
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
    'flow-1.1-fronted-admin': {
      path: "/flows/contract-flow-multi-company",
      iconColor: "cyan",
      icon: Workflow,
      title: "Flow 1.1 Fronted Admin Dashboard v2",
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
    'flow-2.1-admin-payroll': {
      path: "/payroll-batch",
      iconColor: "amber",
      icon: Workflow,
      title: "Flow 4.1 - Fronted Admin Payroll",
      locked: false,
      deprecated: false,
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
