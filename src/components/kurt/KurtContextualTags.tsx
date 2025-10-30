import React from "react";
import { motion } from "framer-motion";
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
      className={cn("flex flex-wrap justify-center gap-2", className)}
    >
      {tags.map((tag, index) => (
        <motion.button
          key={tag.id}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.2 }}
          whileHover={{ scale: disabled ? 1 : 1.02, y: -2 }}
          whileTap={{ scale: disabled ? 1 : 0.98 }}
          onClick={() => !disabled && onTagClick(tag.id)}
          disabled={disabled}
          className={cn(
            "px-4 py-1.5 rounded-full text-xs font-medium",
            "bg-primary/5 border border-primary/20",
            "transition-all duration-200",
            !disabled && "hover:bg-primary/10 hover:border-primary/30 hover:shadow-sm cursor-pointer",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          title={tag.description}
        >
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
        description: "Generate a concise contract summary",
      },
      {
        id: "check-fields",
        label: "Check Fields",
        description: "Verify all required fields are complete",
      },
      {
        id: "fix-clauses",
        label: "Fix Clauses",
        description: "Analyze and improve contract clauses",
      },
      {
        id: "explain-term",
        label: "Explain Term",
        description: "Get clarification on legal terminology",
      },
      {
        id: "pull-data",
        label: "Pull Data",
        description: "Retrieve candidate data from ATS",
      },
      {
        id: "compare-drafts",
        label: "Compare Drafts",
        description: "Compare different versions of the contract",
      },
    ],
    "admin-onboarding": [
      {
        id: "pull-org-data",
        label: "Pull Org Data",
        description: "Retrieve organization data",
      },
      {
        id: "auto-payroll-setup",
        label: "Auto Payroll Setup",
        description: "Automatically configure payroll settings",
      },
    ],
    "candidate-onboarding": [
      {
        id: "retrieve-info",
        label: "Retrieve Info",
        description: "Pull candidate information",
      },
      {
        id: "verify-docs",
        label: "Verify Docs",
        description: "Verify submitted documents",
      },
    ],
    "checklist": [
      {
        id: "track-progress",
        label: "Track Progress",
        description: "View completion progress",
      },
      {
        id: "resend-link",
        label: "Resend Link",
        description: "Resend onboarding link to candidate",
      },
      {
        id: "mark-complete",
        label: "Mark Complete",
        description: "Mark checklist item as complete",
      },
    ],
    "payroll": [],
  };

  return tagMap[context] || [];
}
