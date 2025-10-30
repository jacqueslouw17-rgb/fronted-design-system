import React from "react";
import { motion } from "framer-motion";
import { FileText, Wand2, GitCompare, Database, Settings, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { FlowContext } from "./KurtCoilot";

interface KurtContextualTagsProps {
  flowContext: FlowContext;
  onTagClick: (action: string) => void;
  disabled?: boolean;
  className?: string;
}

interface Tag {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

export const KurtContextualTags: React.FC<KurtContextualTagsProps> = ({
  flowContext,
  onTagClick,
  disabled = false,
  className,
}) => {
  const tags = getTagsForContext(flowContext);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex flex-wrap gap-2 max-w-[320px]", className)}
    >
      {tags.map((tag, index) => (
        <motion.button
          key={tag.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: disabled ? 1 : 1.05 }}
          whileTap={{ scale: disabled ? 1 : 0.95 }}
          onClick={() => !disabled && onTagClick(tag.id)}
          disabled={disabled}
          className={cn(
            "inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium",
            "bg-card border border-border shadow-sm",
            "transition-all duration-200",
            !disabled && "hover:bg-primary/10 hover:text-primary hover:border-primary/30 cursor-pointer",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          title={tag.description}
        >
          {tag.icon}
          {tag.label}
        </motion.button>
      ))}
    </motion.div>
  );
};

function getTagsForContext(context: FlowContext): Tag[] {
  const tagMap: Record<FlowContext, Tag[]> = {
    "contract-creation": [
      {
        id: "quick-summary",
        label: "Quick Summary",
        icon: <FileText className="h-3.5 w-3.5" />,
        description: "Generate a concise contract summary",
      },
      {
        id: "fix-clauses",
        label: "Fix Clauses",
        icon: <Wand2 className="h-3.5 w-3.5" />,
        description: "Analyze and improve contract clauses",
      },
      {
        id: "compare-drafts",
        label: "Compare Drafts",
        icon: <GitCompare className="h-3.5 w-3.5" />,
        description: "Compare different versions of the contract",
      },
    ],
    "admin-onboarding": [
      {
        id: "pull-org-data",
        label: "Pull Org Data",
        icon: <Database className="h-3.5 w-3.5" />,
        description: "Retrieve organization data",
      },
      {
        id: "auto-payroll-setup",
        label: "Auto Payroll Setup",
        icon: <Settings className="h-3.5 w-3.5" />,
        description: "Automatically configure payroll settings",
      },
    ],
    "candidate-onboarding": [
      {
        id: "retrieve-info",
        label: "Retrieve Info",
        icon: <Database className="h-3.5 w-3.5" />,
        description: "Pull candidate information",
      },
      {
        id: "verify-docs",
        label: "Verify Docs",
        icon: <CheckCircle className="h-3.5 w-3.5" />,
        description: "Verify submitted documents",
      },
    ],
    "checklist": [
      {
        id: "track-progress",
        label: "Track Progress",
        icon: <CheckCircle className="h-3.5 w-3.5" />,
        description: "View completion progress",
      },
    ],
    "payroll": [],
  };

  return tagMap[context] || [];
}
