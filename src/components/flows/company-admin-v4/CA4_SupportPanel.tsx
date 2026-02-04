/**
 * CA4_SupportPanel - Support & Feedback Panel for Flow 6 v4
 * 
 * Shows role-aware cards:
 * - Contact Support: Visible to all (Company Admins, Workers, Fronted Admins)
 * - Give Product Feedback: Internal team only (hidden for Company Admins, Workers)
 */

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Send, 
  ArrowLeft, 
  HeadphonesIcon, 
  MessageSquareText,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface CA4_SupportPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type PanelView = "selection" | "support-form" | "support-submitted" | "feedback-form";
type UserRole = "company-admin" | "worker" | "internal";

// Support categories - standardized across roles
const SUPPORT_CATEGORIES = [
  { id: "payments", label: "Payments & Payouts" },
  { id: "taxes", label: "Taxes & Deductions" },
  { id: "contracts", label: "Contracts & Employment" },
  { id: "payroll", label: "Payroll & Adjustments" },
  { id: "account", label: "Account & Access" },
  { id: "other", label: "Other" },
] as const;

export const CA4_SupportPanel: React.FC<CA4_SupportPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const location = useLocation();
  
  // For demo purposes, simulate internal user - in production this would come from auth context
  // Internal users can see both cards, external users only see support
  const [userRole] = useState<UserRole>("internal"); // Change to "company-admin" or "worker" to test
  
  const [view, setView] = useState<PanelView>("selection");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Support form state
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [supportMessage, setSupportMessage] = useState("");
  const [relatedWorker, setRelatedWorker] = useState("");
  
  // Feedback form state (existing functionality)
  const [feedbackContext, setFeedbackContext] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // Reset state when panel opens
  useEffect(() => {
    if (isOpen) {
      // Auto-detect page context
      const pathName = location.pathname
        .split("/")
        .filter(Boolean)
        .map((segment) =>
          segment
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
        )
        .join(" / ") || "Home";
      
      setFeedbackContext(pathName);
    }
  }, [isOpen, location.pathname]);

  // Reset to selection when panel closes
  useEffect(() => {
    if (!isOpen) {
      // Delay reset to allow close animation
      const timer = setTimeout(() => {
        setView("selection");
        setSelectedCategory("");
        setSupportMessage("");
        setRelatedWorker("");
        setFeedbackMessage("");
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCategory || !supportMessage.trim()) {
      toast.error("Please select a category and enter your message");
      return;
    }

    setIsSubmitting(true);

    try {
      // In production, this would call an edge function to create a support ticket
      // For now, we simulate success
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setView("support-submitted");
      toast.success("Support request submitted");
    } catch (error) {
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!feedbackMessage.trim()) {
      toast.error("Please enter your feedback");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke(
        "send-feedback-to-slack",
        {
          body: {
            pageContext: feedbackContext,
            feedback: feedbackMessage,
          },
        }
      );

      if (error) {
        toast.error("Failed to send feedback, please try again.");
      } else {
        toast.success("Feedback sent to Slack successfully");
        onClose();
      }
    } catch (error) {
      toast.error("Failed to send feedback, please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (view === "support-submitted") {
      setSelectedCategory("");
      setSupportMessage("");
      setRelatedWorker("");
    }
    setView("selection");
  };

  const handleSubmitAnother = () => {
    setSelectedCategory("");
    setSupportMessage("");
    setRelatedWorker("");
    setView("support-form");
  };

  const isInternalUser = userRole === "internal";

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className="w-full sm:w-[480px] sm:max-w-[480px] overflow-y-auto p-0"
      >
        <AnimatePresence mode="wait">
          {/* Selection View */}
          {view === "selection" && (
            <motion.div
              key="selection"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-6"
            >
              <SheetHeader className="mb-6">
                <SheetTitle className="text-xl">How can we help?</SheetTitle>
              </SheetHeader>

              <div className="space-y-3">
                {/* Card A: Contact Support - Always visible */}
                <button
                  onClick={() => setView("support-form")}
                  className={cn(
                    "w-full p-4 rounded-xl border text-left transition-all",
                    "bg-card hover:bg-accent/50 border-border/60 hover:border-primary/30",
                    "group flex items-start gap-4"
                  )}
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <HeadphonesIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                      Contact Support
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Get help with payments, contracts, payroll, or account issues
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary/70 flex-shrink-0 mt-0.5" />
                </button>

                {/* Card B: Give Product Feedback - Internal only */}
                {isInternalUser && (
                  <button
                    onClick={() => setView("feedback-form")}
                    className={cn(
                      "w-full p-4 rounded-xl border text-left transition-all",
                      "bg-card hover:bg-accent/50 border-border/60 hover:border-primary/30",
                      "group flex items-start gap-4"
                    )}
                  >
                    <div className="h-10 w-10 rounded-lg bg-secondary/50 flex items-center justify-center flex-shrink-0">
                      <MessageSquareText className="h-5 w-5 text-foreground/70" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                        Give Product Feedback
                      </h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Share ideas and suggestions with the team
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary/70 flex-shrink-0 mt-0.5" />
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Support Form View */}
          {view === "support-form" && (
            <motion.div
              key="support-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-6"
            >
              <SheetHeader className="mb-6">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 -ml-2"
                    onClick={handleBack}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <SheetTitle className="text-xl">Contact Support</SheetTitle>
                </div>
              </SheetHeader>

              <form onSubmit={handleSupportSubmit} className="space-y-5">
                {/* Category Selection */}
                <div className="space-y-2">
                  <Label>What do you need help with?</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {SUPPORT_CATEGORIES.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setSelectedCategory(category.id)}
                        className={cn(
                          "px-3 py-2.5 rounded-lg border text-sm text-left transition-all",
                          selectedCategory === category.id
                            ? "bg-primary/10 border-primary/40 text-primary font-medium"
                            : "bg-card border-border/60 text-foreground hover:bg-accent/50 hover:border-border"
                        )}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="supportMessage">
                    Message <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="supportMessage"
                    placeholder="Tell us what you need help with…"
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    required
                    rows={5}
                    className="resize-none"
                  />
                </div>

                {/* Related Worker/Contract (Optional) */}
                <div className="space-y-2">
                  <Label htmlFor="relatedWorker" className="text-muted-foreground">
                    Related worker / contract (optional)
                  </Label>
                  <Input
                    id="relatedWorker"
                    placeholder="e.g., John Smith, Contract #1234"
                    value={relatedWorker}
                    onChange={(e) => setRelatedWorker(e.target.value)}
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || !selectedCategory || !supportMessage.trim()}
                >
                  {isSubmitting ? "Submitting..." : "Submit request"}
                </Button>
              </form>
            </motion.div>
          )}

          {/* Support Submitted Confirmation */}
          {view === "support-submitted" && (
            <motion.div
              key="support-submitted"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="p-6 flex flex-col items-center justify-center min-h-[400px] text-center"
            >
              <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
              
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Request received
              </h2>
              <p className="text-muted-foreground mb-1">
                We'll respond within 24 hours.
              </p>
              <p className="text-muted-foreground mb-8">
                You'll receive an answer by email.
              </p>

              <div className="flex flex-col gap-2 w-full max-w-[280px]">
                <Button
                  variant="outline"
                  onClick={handleSubmitAnother}
                  className="w-full"
                >
                  Submit another request
                </Button>
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="w-full text-muted-foreground"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          )}

          {/* Feedback Form View (existing functionality) */}
          {view === "feedback-form" && (
            <motion.div
              key="feedback-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-6"
            >
              <SheetHeader className="mb-6">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 -ml-2"
                    onClick={handleBack}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <SheetTitle className="text-xl">Give Product Feedback</SheetTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your feedback will be shared with the team on Slack.
                    </p>
                  </div>
                </div>
              </SheetHeader>

              <form onSubmit={handleFeedbackSubmit} className="space-y-5">
                {/* Page Context */}
                <div className="space-y-2">
                  <Label htmlFor="feedbackContext">Context / Page</Label>
                  <Input
                    id="feedbackContext"
                    value={feedbackContext}
                    onChange={(e) => setFeedbackContext(e.target.value)}
                    placeholder="e.g., Dashboard, Login Page"
                    required
                  />
                </div>

                {/* Feedback Message */}
                <div className="space-y-2">
                  <Label htmlFor="feedbackMessage">
                    Your Feedback <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="feedbackMessage"
                    placeholder="Share your thoughts..."
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    required
                    rows={6}
                    className="resize-none"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || !feedbackMessage.trim()}
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send to Slack
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
};
