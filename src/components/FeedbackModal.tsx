import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FeedbackFormData {
  pageContext: string;
  feedback: string;
}

export const FeedbackModal = ({ isOpen, onClose }: FeedbackModalProps) => {
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FeedbackFormData>({
    pageContext: "",
    feedback: "",
  });

  // Auto-detect page title from route
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
      
      setFormData((prev) => ({ ...prev, pageContext: pathName }));
    }
  }, [isOpen, location.pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.feedback) {
      toast.error("Please enter your feedback");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke(
        "send-feedback-to-slack",
        {
          body: {
            pageContext: formData.pageContext,
            feedback: formData.feedback,
          },
        }
      );

      if (error) {
        console.error("Backend function error:", error);
        toast.error("⚠️ Failed to send feedback, please try again.");
      } else {
        console.log("✅ Feedback sent to Slack successfully");
        toast.success("✅ Feedback sent to Slack successfully");
        onClose();
        setFormData({
          pageContext: "",
          feedback: "",
        });
      }
    } catch (error) {
      console.error("Feedback submission error:", error);
      toast.error("⚠️ Failed to send feedback, please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[540px] sm:max-w-[540px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl">Submit Feedback</SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Your feedback will be shared with the team on Slack.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Page Context */}
          <div className="space-y-2">
            <Label htmlFor="pageContext">Context / Page</Label>
            <Input
              id="pageContext"
              value={formData.pageContext}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, pageContext: e.target.value }))
              }
              placeholder="e.g., Dashboard, Login Page"
              required
            />
          </div>

          {/* Feedback */}
          <div className="space-y-2">
            <Label htmlFor="feedback">
              Your Feedback <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="feedback"
              placeholder="Share your thoughts..."
              value={formData.feedback}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, feedback: e.target.value }))
              }
              required
              rows={6}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
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
      </SheetContent>
    </Sheet>
  );
};
