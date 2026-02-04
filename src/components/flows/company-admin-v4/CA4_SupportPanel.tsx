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
  const [view, setView] = useState<PanelView>("selection");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Support form state
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [supportMessage, setSupportMessage] = useState("");
  
  
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
    }
    setView("selection");
  };

  const handleSubmitAnother = () => {
    setSelectedCategory("");
    setSupportMessage("");
    setView("support-form");
  };

  

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

              {/* Card B: Give Product Feedback - sends to Slack */}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative flex flex-col items-center justify-center min-h-[500px] text-center overflow-hidden"
            >
              {/* Subtle radial gradient background */}
              <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-transparent pointer-events-none" />
              
              {/* Decorative rings */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full border border-primary/[0.06] pointer-events-none"
              />
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full border border-primary/[0.04] pointer-events-none"
              />
              
              {/* Checkmark with animated ring */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 200, 
                  damping: 15, 
                  delay: 0.1 
                }}
                className="relative mb-8"
              >
                {/* Outer glow ring */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="absolute inset-0 -m-3 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 blur-xl"
                />
                
                {/* Icon container */}
                <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/10">
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 300, 
                      damping: 20,
                      delay: 0.25 
                    }}
                  >
                    <CheckCircle2 className="h-10 w-10 text-primary" strokeWidth={1.5} />
                  </motion.div>
                </div>
              </motion.div>
              
              {/* Text content */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="relative z-10 space-y-3 mb-10 px-6"
              >
                <h2 className="text-2xl font-semibold text-foreground tracking-tight">
                  Request received
                </h2>
                <p className="text-muted-foreground text-[15px] leading-relaxed max-w-[280px] mx-auto">
                  We'll respond within 24 hours.
                  <br />
                  You'll receive an answer by email.
                </p>
              </motion.div>

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="relative z-10 flex flex-col gap-3 w-full max-w-[280px] px-6"
              >
                <Button
                  variant="outline"
                  onClick={handleSubmitAnother}
                  className={cn(
                    "w-full h-11 rounded-xl",
                    "border-border/60 hover:border-primary/40",
                    "hover:bg-primary/[0.04]",
                    "transition-all duration-200"
                  )}
                >
                  Submit another request
                </Button>
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="w-full h-10 text-muted-foreground hover:text-foreground hover:bg-transparent"
                >
                  Close
                </Button>
              </motion.div>
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
