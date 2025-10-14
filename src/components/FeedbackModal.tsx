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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Camera, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FeedbackFormData {
  name: string;
  role: string;
  pageContext: string;
  feedback: string;
  priority: "Low" | "Medium" | "High";
  includeScreenshot: boolean;
}

export const FeedbackModal = ({ isOpen, onClose }: FeedbackModalProps) => {
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FeedbackFormData>({
    name: "",
    role: "Design",
    pageContext: "",
    feedback: "",
    priority: "Medium",
    includeScreenshot: false,
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

  const captureScreenshot = async (): Promise<string | null> => {
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), 2000); // 2 second timeout
      });

      const screenshotPromise = new Promise<string | null>(async (resolve) => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          
          if (!ctx) {
            resolve(null);
            return;
          }

          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;

          const bodyHTML = document.body.innerHTML;
          const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
              <foreignObject width="100%" height="100%">
                <div xmlns="http://www.w3.org/1999/xhtml" style="font-size: 16px;">
                  ${bodyHTML}
                </div>
              </foreignObject>
            </svg>
          `;

          const blob = new Blob([svg], { type: "image/svg+xml" });
          const url = URL.createObjectURL(blob);
          
          const img = new Image();
          img.src = url;

          img.onload = () => {
            try {
              ctx.drawImage(img, 0, 0);
              URL.revokeObjectURL(url);
              resolve(canvas.toDataURL("image/png"));
            } catch (e) {
              console.error("Canvas draw failed:", e);
              resolve(null);
            }
          };

          img.onerror = () => {
            console.error("Image load failed");
            URL.revokeObjectURL(url);
            resolve(null);
          };
        } catch (e) {
          console.error("Screenshot generation failed:", e);
          resolve(null);
        }
      });

      // Race between screenshot and timeout
      const result = await Promise.race([screenshotPromise, timeoutPromise]);
      return result;
    } catch (error) {
      console.error("Screenshot capture failed:", error);
      return null;
    }
  };

  const sendToSlack = async (screenshot?: string | null) => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "send-feedback-to-slack",
        {
          body: {
            name: formData.name,
            role: formData.role,
            pageContext: formData.pageContext,
            feedback: formData.feedback,
            priority: formData.priority,
            screenshot: screenshot,
          },
        }
      );

      if (error) {
        console.error("Backend function error:", error);
        return false;
      }

      return data?.success || false;
    } catch (error) {
      console.error("Failed to send feedback:", error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.feedback) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      let screenshot = null;
      if (formData.includeScreenshot) {
        screenshot = await captureScreenshot();
      }

      const success = await sendToSlack(screenshot);

      if (success) {
        toast.success("Thanks for your feedback! It's been sent to Slack 🎉");
        onClose();
        setFormData({
          name: "",
          role: "Design",
          pageContext: "",
          feedback: "",
          priority: "Medium",
          includeScreenshot: false,
        });
      } else {
        toast.error("Failed to send feedback. Please try again.");
      }
    } catch (error) {
      console.error("Feedback submission error:", error);
      toast.error("An error occurred. Please try again.");
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
            Your feedback will be shared with the design & tech teams on Slack.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Your Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Jaco or Ioana"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, role: value }))
              }
            >
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="Tech">Tech</SelectItem>
                <SelectItem value="Ops">Ops</SelectItem>
                <SelectItem value="Legal">Legal</SelectItem>
                <SelectItem value="Leadership">Leadership</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Page Context */}
          <div className="space-y-2">
            <Label htmlFor="pageContext">Pattern / Component</Label>
            <Input
              id="pageContext"
              value={formData.pageContext}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, pageContext: e.target.value }))
              }
              readOnly
              className="bg-muted"
            />
          </div>

          {/* Feedback */}
          <div className="space-y-2">
            <Label htmlFor="feedback">
              Your Feedback <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="feedback"
              placeholder="Describe your feedback or suggestion..."
              value={formData.feedback}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, feedback: e.target.value }))
              }
              required
              rows={4}
            />
          </div>

          {/* Priority */}
          <div className="space-y-3">
            <Label>Priority</Label>
            <RadioGroup
              value={formData.priority}
              onValueChange={(value: any) =>
                setFormData((prev) => ({ ...prev, priority: value }))
              }
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Low" id="low" />
                <Label htmlFor="low" className="font-normal cursor-pointer">
                  Low
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Medium" id="medium" />
                <Label htmlFor="medium" className="font-normal cursor-pointer">
                  Medium
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="High" id="high" />
                <Label htmlFor="high" className="font-normal cursor-pointer">
                  High
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Screenshot Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <Camera className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="screenshot" className="cursor-pointer">
                  Attach Screenshot
                </Label>
                <p className="text-xs text-muted-foreground">
                  Auto-capture viewport
                </p>
              </div>
            </div>
            <Switch
              id="screenshot"
              checked={formData.includeScreenshot}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, includeScreenshot: checked }))
              }
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-[hsl(var(--accent-purple-outline))] hover:bg-[hsl(var(--accent-purple-outline))]/90 text-white"
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
