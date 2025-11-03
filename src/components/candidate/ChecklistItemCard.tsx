import { Card } from "@/components/ui/card";
import { CheckCircle2, Clock, AlertCircle, ChevronDown, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChecklistRequirement } from "@/data/candidateChecklistData";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChecklistItemCardProps {
  requirement: ChecklistRequirement;
  index: number;
}

const ChecklistItemCard = ({ requirement, index }: ChecklistItemCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const handleResendLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast({
      title: "Link resent successfully ✅",
      description: "We've sent a secure link to complete this requirement.",
    });
  };

  const getStatusIcon = () => {
    switch (requirement.status) {
      case 'verified':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'pending_review':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'todo':
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (requirement.status) {
      case 'verified':
        return 'Verified';
      case 'pending_review':
        return 'Pending Review';
      case 'todo':
        return 'To Complete';
    }
  };

  const getStatusColor = () => {
    switch (requirement.status) {
      case 'verified':
        return 'text-green-600 dark:text-green-400';
      case 'pending_review':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'todo':
        return 'text-muted-foreground';
    }
  };

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Card 
          className="p-4 cursor-pointer hover:shadow-md transition-all"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {getStatusIcon()}
              <div className="flex-1">
                <h4 className="font-medium text-sm">
                  {requirement.label}
                  {requirement.required && <span className="text-destructive ml-1">*</span>}
                </h4>
                <p className={`text-xs ${getStatusColor()} mt-0.5`}>
                  {getStatusText()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(requirement.status === 'pending_review' || requirement.status === 'todo') && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-3 text-xs"
                      onClick={handleResendLink}
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Resend link
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Send secure upload link again</p>
                  </TooltipContent>
                </Tooltip>
              )}
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            </div>
          </div>

        <AnimatePresence>
          {isExpanded && requirement.description && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  {requirement.description}
                </p>
                {requirement.status === 'todo' && (
                  <div className="mt-2">
                    <button className="text-xs text-primary hover:underline">
                      Complete this requirement →
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
    </TooltipProvider>
  );
};

export default ChecklistItemCard;
