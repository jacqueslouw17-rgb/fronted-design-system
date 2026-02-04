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
  Headphones, 
  MessageSquareText,
  CheckCircle2,
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
  const [userRole] = useState<UserRole>("internal");
  
  const [view, setView] = useState<PanelView>("selection");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Support form state
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [supportMessage, setSupportMessage] = useState("");
  const [relatedWorker, setRelatedWorker] = useState("");
  
  // Feedback form state
  const [feedbackContext, setFeedbackContext] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // Reset state when panel opens
  useEffect(() => {
    if (isOpen) {
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
        className="w-full sm:w-[440px] sm:max-w-[440px] overflow-y-auto p-0"
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
              <SheetHeader className="mb-8">
                <SheetTitle className="text-xl font-semibold">How can we help?</SheetTitle>
              </SheetHeader>

              <div className="space-y-4">
                {/* Card A: Contact Support */}
                <button
                  onClick={() => setView("support-form")}
                  className={cn(
                    "w-full rounded-2xl text-left transition-all duration-200",
                    "bg-gradient-to-br from-primary/[0.08] via-primary/[0.04] to-transparent",
                    "border border-primary/20 hover:border-primary/40",
                    "hover:shadow-lg hover:shadow-primary/5",
                    "group overflow-hidden"
                  )}
                >
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0",
                        "bg-primary/10 group-hover:bg-primary/15 transition-colors"
                      )}>
                        <Headphones className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <h3 className="font-semibold text-foreground text-base group-hover:text-primary transition-colors">
                          Contact Support
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                          Get help with payments, contracts, payroll, or account issues
                        </p>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Card B: Give Product Feedback - Internal only */}
                {isInternalUser && (
                  <button
                    onClick={() => setView("feedback-form")}
                    className={cn(
                      "w-full rounded-2xl text-left transition-all duration-200",
                      "bg-gradient-to-br from-muted/60 via-muted/30 to-transparent",
                      "border border-border/60 hover:border-border",
                      "hover:shadow-lg hover:shadow-foreground/5",
                      "group overflow-hidden"
                    )}
                  >
                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0",
                          "bg-muted group-hover:bg-muted/80 transition-colors"
                        )}>
                          <MessageSquareText className="h-6 w-6 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <h3 className="font-semibold text-foreground text-base group-hover:text-primary transition-colors">
                            Give Product Feedback
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                            Share ideas and suggestions with the team
                          </p>
                        </div>
                      </div>
                    </div>
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
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 -ml-2 hover:bg-muted"
                    onClick={handleBack}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <SheetTitle className="text-xl font-semibold">Contact Support</SheetTitle>
                </div>
              </SheetHeader>

              <form onSubmit={handleSupportSubmit} className="space-y-6">
                {/* Category Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">What do you need help with?</Label>
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
                            : "bg-card border-border hover:bg-muted/50 hover:border-border text-foreground"
                        )}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="supportMessage" className="text-sm font-medium">
                    Message <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="supportMessage"
                    placeholder="Tell us what you need help with…"
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    required
                    rows={5}
                    className="resize-none bg-background"
                  />
                </div>

                {/* Related Worker/Contract (Optional) */}
                <div className="space-y-2">
                  <Label htmlFor="relatedWorker" className="text-sm text-muted-foreground">
                    Related worker / contract (optional)
                  </Label>
                  <Input
                    id="relatedWorker"
                    placeholder="e.g., John Smith, Contract #1234"
                    value={relatedWorker}
                    onChange={(e) => setRelatedWorker(e.target.value)}
                    className="bg-background"
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

              <div className="flex flex-col gap-2 w-full max-w-[260px]">
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

          {/* Feedback Form View */}
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
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 -ml-2 hover:bg-muted"
                    onClick={handleBack}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <SheetTitle className="text-xl font-semibold">Product Feedback</SheetTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Shared with the team on Slack
                    </p>
                  </div>
                </div>
              </SheetHeader>

              <form onSubmit={handleFeedbackSubmit} className="space-y-5">
                {/* Page Context */}
                <div className="space-y-2">
                  <Label htmlFor="feedbackContext" className="text-sm font-medium">Context / Page</Label>
                  <Input
                    id="feedbackContext"
                    value={feedbackContext}
                    onChange={(e) => setFeedbackContext(e.target.value)}
                    placeholder="e.g., Dashboard, Login Page"
                    required
                    className="bg-background"
                  />
                </div>

                {/* Feedback Message */}
                <div className="space-y-2">
                  <Label htmlFor="feedbackMessage" className="text-sm font-medium">
                    Your Feedback <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="feedbackMessage"
                    placeholder="Share your thoughts..."
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    required
                    rows={6}
                    className="resize-none bg-background"
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
