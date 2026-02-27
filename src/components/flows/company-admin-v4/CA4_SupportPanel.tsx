/**
 * CA4_SupportPanel - Support & Feedback Panel for Flow 6 v4
 * 
 * Clean drawer with two options:
 * - Contact Support
 * - Give Product Feedback (sends to Slack)
 */

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface CA4_SupportPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type PanelView = "selection" | "support-form" | "support-submitted" | "feedback-form";

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
  
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [otherCategory, setOtherCategory] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [feedbackContext, setFeedbackContext] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      const pathName = location.pathname
        .split("/")
        .filter(Boolean)
        .map((segment) =>
          segment.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
        )
        .join(" / ") || "Home";
      setFeedbackContext(pathName);
    }
  }, [isOpen, location.pathname]);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setView("selection");
        setSelectedCategory("");
        setOtherCategory("");
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
    if (selectedCategory === "other" && !otherCategory.trim()) {
      toast.error("Please specify your topic");
      return;
    }
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setView("support-submitted");
      toast.success("Support request submitted");
    } catch {
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
      const { error } = await supabase.functions.invoke("send-feedback-to-slack", {
        body: { pageContext: feedbackContext, feedback: feedbackMessage },
      });
      if (error) {
        toast.error("Failed to send feedback, please try again.");
      } else {
        toast.success("Feedback sent successfully");
        onClose();
      }
    } catch {
      toast.error("Failed to send feedback, please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (view === "support-submitted") {
      setSelectedCategory("");
      setOtherCategory("");
      setSupportMessage("");
    }
    setView("selection");
  };

  const handleSubmitAnother = () => {
    setSelectedCategory("");
    setOtherCategory("");
    setSupportMessage("");
    setView("support-form");
  };

  // Standardized drawer header
  const DrawerHeader = ({ title, showBack = false, subtitle }: { title: string; showBack?: boolean; subtitle?: string }) => (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/40 px-5 pt-4 pb-3 flex items-center justify-between">
      <div className="flex items-center gap-2 min-w-0">
        {showBack && (
          <button
            onClick={handleBack}
            className="p-1.5 -ml-1.5 rounded-lg hover:bg-muted/60 transition-colors flex-shrink-0"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
        <div className="min-w-0">
          <SheetTitle className="text-base font-semibold text-left">{title}</SheetTitle>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-1.5 rounded-lg hover:bg-muted/60 transition-colors flex-shrink-0"
        aria-label="Close"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  );

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-[85%] sm:w-[420px] sm:max-w-[420px] overflow-y-auto p-0 [&>button]:hidden"
      >
        <AnimatePresence mode="wait">
          {/* Selection View */}
          {view === "selection" && (
            <motion.div
              key="selection"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              <DrawerHeader title="How can we help?" />

              <div className="p-4 sm:p-5 space-y-3">
                {/* Contact Support */}
                <button
                  onClick={() => setView("support-form")}
                  className={cn(
                    "w-full rounded-xl text-left transition-all duration-200",
                    "border border-border/60 hover:border-primary/30",
                    "hover:bg-primary/[0.03]",
                    "group p-4"
                  )}
                >
                  <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                    Contact Support
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Get help with payments, contracts, payroll, or account issues
                  </p>
                </button>

                {/* Give Product Feedback */}
                <button
                  onClick={() => setView("feedback-form")}
                  className={cn(
                    "w-full rounded-xl text-left transition-all duration-200",
                    "border border-border/60 hover:border-border",
                    "hover:bg-muted/30",
                    "group p-4"
                  )}
                >
                  <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                    Give Product Feedback
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Share ideas and suggestions with the team
                  </p>
                </button>
              </div>
            </motion.div>
          )}

          {/* Support Form View */}
          {view === "support-form" && (
            <motion.div
              key="support-form"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              <DrawerHeader title="Contact Support" showBack />

              <form onSubmit={handleSupportSubmit} className="p-4 sm:p-5 space-y-5">
                <div className="space-y-2.5">
                  <Label className="text-sm font-medium">What do you need help with?</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {SUPPORT_CATEGORIES.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setSelectedCategory(category.id)}
                        className={cn(
                          "px-3 py-2 rounded-lg border text-xs sm:text-sm text-left transition-all",
                          selectedCategory === category.id
                            ? "bg-primary/10 border-primary/40 text-primary font-medium"
                            : "bg-card border-border/60 hover:bg-muted/50 text-foreground"
                        )}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                  {selectedCategory === "other" && (
                    <Input
                      placeholder="Please specify…"
                      value={otherCategory}
                      onChange={(e) => setOtherCategory(e.target.value)}
                      className="bg-background text-sm mt-2"
                      autoFocus
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supportMessage" className="text-sm font-medium">Message</Label>
                  <Textarea
                    id="supportMessage"
                    placeholder="Tell us what you need help with…"
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    required
                    rows={4}
                    className="resize-none bg-background text-sm"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || !selectedCategory || !supportMessage.trim() || (selectedCategory === "other" && !otherCategory.trim())}
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
              className="flex flex-col items-center justify-center min-h-[420px] text-center px-6"
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                className="mb-6 relative"
              >
                <div className="absolute inset-0 -m-2 rounded-full bg-gradient-to-br from-primary/20 to-accent/10 blur-xl" />
                <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 flex items-center justify-center border border-primary/15 shadow-lg shadow-primary/10">
                  <svg className="h-7 w-7 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <motion.path
                      d="M5 13l4 4L19 7"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
                    />
                  </svg>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 }}
                className="space-y-2 mb-8"
              >
                <h2 className="text-lg font-semibold text-foreground">Request received</h2>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[260px] mx-auto">
                  We'll respond within 24 hours. You'll receive an answer by email.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35 }}
                className="flex flex-col gap-2 w-full max-w-[260px]"
              >
                <Button variant="outline" onClick={handleSubmitAnother} className="w-full">
                  Submit another request
                </Button>
                <Button variant="ghost" onClick={onClose} className="w-full text-muted-foreground">
                  Close
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* Feedback Form View */}
          {view === "feedback-form" && (
            <motion.div
              key="feedback-form"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              <DrawerHeader title="Product Feedback" subtitle="Shared with the team on Slack" showBack />

              <form onSubmit={handleFeedbackSubmit} className="p-4 sm:p-5 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="feedbackContext" className="text-sm font-medium">Context / Page</Label>
                  <Input
                    id="feedbackContext"
                    value={feedbackContext}
                    onChange={(e) => setFeedbackContext(e.target.value)}
                    placeholder="e.g., Dashboard, Login Page"
                    required
                    className="bg-background text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feedbackMessage" className="text-sm font-medium">Your Feedback</Label>
                  <Textarea
                    id="feedbackMessage"
                    placeholder="Share your thoughts..."
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    required
                    rows={5}
                    className="resize-none bg-background text-sm"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || !feedbackMessage.trim()}
                >
                  {isSubmitting ? "Sending..." : "Send feedback"}
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
};
