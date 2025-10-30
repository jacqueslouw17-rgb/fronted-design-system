import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { FlowContext } from "./KurtCoilot";
import { 
  Clock, 
  Send, 
  CheckCircle, 
  FileText, 
  CheckSquare, 
  Wrench, 
  HelpCircle, 
  Database, 
  Copy 
} from "lucide-react";

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
  icon: React.ReactNode;
}

export const KurtContextualTags: React.FC<KurtContextualTagsProps> = ({
  flowContext,
  onTagClick,
  disabled = false,
  className,
}) => {
  const tags = getTagsForContext(flowContext);
  const [clickedTag, setClickedTag] = useState<string | null>(null);

  const handleTagClick = (tagId: string) => {
    if (disabled) return;
    
    // Pulse animation on click
    setClickedTag(tagId);
    setTimeout(() => setClickedTag(null), 600);
    
    onTagClick(tagId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex flex-wrap justify-center gap-2 px-4", className)}
    >
      {tags.map((tag, index) => (
        <motion.button
          key={tag.id}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08, duration: 0.3 }}
          whileHover={{ scale: disabled ? 1 : 1.04, y: -2 }}
          whileTap={{ scale: disabled ? 1 : 0.96 }}
          onClick={() => handleTagClick(tag.id)}
          disabled={disabled}
          className={cn(
            "group relative px-4 py-2 rounded-full text-xs font-medium",
            "bg-gradient-to-br from-background via-background to-primary/5",
            "border border-border/40 shadow-sm",
            "transition-all duration-300 ease-out",
            "flex items-center gap-2",
            !disabled && "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 cursor-pointer",
            disabled && "opacity-50 cursor-not-allowed",
            clickedTag === tag.id && "animate-pulse border-primary shadow-lg shadow-primary/20"
          )}
          title={tag.description}
        >
          <span className={cn(
            "transition-colors duration-200",
            "text-muted-foreground group-hover:text-primary"
          )}>
            {tag.icon}
          </span>
          <span className="text-foreground">{tag.label}</span>
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
        icon: <FileText className="h-3.5 w-3.5" />,
      },
      {
        id: "check-fields",
        label: "Check Fields",
        description: "Verify all required fields are complete",
        icon: <CheckSquare className="h-3.5 w-3.5" />,
      },
      {
        id: "fix-clauses",
        label: "Fix Clauses",
        description: "Analyze and improve contract clauses",
        icon: <Wrench className="h-3.5 w-3.5" />,
      },
      {
        id: "explain-term",
        label: "Explain Term",
        description: "Get clarification on legal terminology",
        icon: <HelpCircle className="h-3.5 w-3.5" />,
      },
      {
        id: "pull-data",
        label: "Pull Data",
        description: "Retrieve candidate data from ATS",
        icon: <Database className="h-3.5 w-3.5" />,
      },
      {
        id: "compare-drafts",
        label: "Compare Drafts",
        description: "Compare different versions of the contract",
        icon: <Copy className="h-3.5 w-3.5" />,
      },
    ],
    "admin-onboarding": [
      {
        id: "pull-org-data",
        label: "Pull Org Data",
        description: "Retrieve organization data",
        icon: <Database className="h-3.5 w-3.5" />,
      },
      {
        id: "auto-payroll-setup",
        label: "Auto Payroll Setup",
        description: "Automatically configure payroll settings",
        icon: <CheckCircle className="h-3.5 w-3.5" />,
      },
    ],
    "candidate-onboarding": [
      {
        id: "retrieve-info",
        label: "Retrieve Info",
        description: "Pull candidate information",
        icon: <Database className="h-3.5 w-3.5" />,
      },
      {
        id: "verify-docs",
        label: "Verify Docs",
        description: "Verify submitted documents",
        icon: <CheckSquare className="h-3.5 w-3.5" />,
      },
    ],
    "checklist": [
      {
        id: "track-progress",
        label: "Track Progress",
        description: "View completion progress",
        icon: <Clock className="h-3.5 w-3.5" />,
      },
      {
        id: "resend-link",
        label: "Resend Link",
        description: "Resend onboarding link to candidate",
        icon: <Send className="h-3.5 w-3.5" />,
      },
      {
        id: "mark-complete",
        label: "Mark Complete",
        description: "Mark checklist item as complete",
        icon: <CheckCircle className="h-3.5 w-3.5" />,
      },
    ],
    "payroll": [],
  };

  return tagMap[context] || [];
}
