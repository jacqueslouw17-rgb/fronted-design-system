import { useState } from "react";
import { motion } from "framer-motion";
import { X, Upload, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";

interface ResolvePayrollIssueDrawerProps {
  open: boolean;
  onClose: () => void;
  contractorName: string;
  contractorCountry: string;
}

export const ResolvePayrollIssueDrawer: React.FC<ResolvePayrollIssueDrawerProps> = ({
  open,
  onClose,
  contractorName,
  contractorCountry,
}) => {
  const [issueDescription, setIssueDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!issueDescription.trim()) {
      toast.error("Please describe the issue");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 800));
    
    toast.success("Issue logged", {
      description: "Genie will review and respond shortly",
    });
    
    setIsSubmitting(false);
    setIssueDescription("");
    setSelectedFile(null);
    onClose();
  };

  return (
    <Drawer open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DrawerContent className="h-[90vh] sm:h-auto">
        <div className="max-w-2xl mx-auto w-full h-full overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle>Resolve Payroll Issue</DrawerTitle>
            <DrawerDescription>
              {contractorName} • {contractorCountry}
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-6 space-y-6 pb-6">
            {/* Issue Description */}
            <div className="space-y-2">
              <Label htmlFor="issue-description">Describe the issue</Label>
              <Textarea
                id="issue-description"
                placeholder="Provide details about the payroll issue..."
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file-upload">Attach supporting documents (optional)</Label>
              <div className="flex items-center gap-2">
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {selectedFile ? selectedFile.name : "Choose file"}
                </Button>
                {selectedFile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedFile(null)}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <DrawerFooter>
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !issueDescription.trim()}
              className="w-full gap-2"
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Send className="h-4 w-4" />
                  </motion.div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send to Genie
                </>
              )}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
