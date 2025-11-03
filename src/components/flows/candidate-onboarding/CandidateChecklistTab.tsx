import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChecklistItem {
  id: string;
  label: string;
  required: boolean;
  status: "verified" | "pending_review" | "todo";
}

interface ChecklistData {
  profile: {
    country: string;
    type: string;
  };
  requirements: ChecklistItem[];
}

// Country-specific checklist data
const CHECKLIST_DATA: Record<string, ChecklistData> = {
  "PH-Contractor": {
    profile: { country: "PH", type: "Contractor" },
    requirements: [
      { id: "id_doc", label: "Government ID", required: true, status: "verified" },
      { id: "bank", label: "Bank Account", required: true, status: "verified" },
      { id: "tax", label: "Tax Residency", required: true, status: "pending_review" },
      { id: "policy", label: "Policy Acknowledgment", required: true, status: "todo" },
      { id: "nda", label: "NDA Signature", required: true, status: "todo" }
    ]
  },
  "XK-Employee": {
    profile: { country: "XK", type: "Employee" },
    requirements: [
      { id: "id_doc", label: "ID / Passport", required: true, status: "verified" },
      { id: "bank", label: "IBAN", required: true, status: "pending_review" },
      { id: "policy", label: "Policy Acknowledgment", required: true, status: "todo" }
    ]
  },
  "NO-Employee": {
    profile: { country: "NO", type: "Employee" },
    requirements: [
      { id: "id_doc", label: "ID / Fødselsnummer", required: true, status: "verified" },
      { id: "tax_card", label: "Tax Card (Skattekort)", required: true, status: "todo" },
      { id: "benefits", label: "Benefits Setup", required: false, status: "todo" },
      { id: "2fa", label: "Two-Factor Authentication", required: true, status: "todo" }
    ]
  }
};

interface CandidateChecklistTabProps {
  country: string;
  type: string;
}

const CandidateChecklistTab = ({ country, type }: CandidateChecklistTabProps) => {
  const checklistKey = `${country}-${type}`;
  const checklistData = CHECKLIST_DATA[checklistKey] || CHECKLIST_DATA["PH-Contractor"];
  
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  
  const toggleItem = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  // Calculate progress
  const totalRequired = checklistData.requirements.filter(r => r.required).length;
  const completedRequired = checklistData.requirements.filter(
    r => r.required && r.status === "verified"
  ).length;
  const progressPercent = (completedRequired / totalRequired) * 100;
  const allComplete = completedRequired === totalRequired;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">✅ Verified</Badge>;
      case "pending_review":
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">🟡 Pending Review</Badge>;
      case "todo":
        return <Badge variant="outline">📝 To Complete</Badge>;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "pending_review":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "todo":
        return <FileText className="h-5 w-5 text-muted-foreground" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Section */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Your Progress</h3>
            <span className="text-sm font-medium text-foreground">
              {completedRequired} / {totalRequired} complete
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <p className="text-sm text-muted-foreground">
            {allComplete 
              ? "🎉 All required items complete!" 
              : `${totalRequired - completedRequired} required ${totalRequired - completedRequired === 1 ? 'item' : 'items'} remaining`
            }
          </p>
        </CardContent>
      </Card>

      {/* Checklist Items */}
      {!allComplete && (
        <div className="space-y-3">
          {checklistData.requirements
            .filter(item => item.status !== "verified")
            .map((item) => {
              const isExpanded = expandedItems.has(item.id);
              
              return (
                <Card key={item.id} className="overflow-hidden">
                  <div
                    className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleItem(item.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(item.status)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{item.label}</h4>
                            {item.required && (
                              <Badge variant="outline" className="text-xs">Required</Badge>
                            )}
                          </div>
                          {getStatusBadge(item.status)}
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <CardContent className="pt-0 pb-4 px-4 border-t">
                          <div className="text-sm text-muted-foreground space-y-2 mt-4">
                            {item.status === "pending_review" && (
                              <p>Your document is being reviewed by the compliance team. This typically takes 1-2 business days.</p>
                            )}
                            {item.status === "todo" && (
                              <p>Please complete this requirement to proceed. You can upload documents or provide information in your profile settings.</p>
                            )}
                          </div>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              );
            })}
        </div>
      )}

      {/* All Complete Message */}
      {allComplete && (
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="p-6 text-center space-y-2">
            <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />
            <h3 className="text-lg font-semibold">Excellent! You're fully set up.</h3>
            <p className="text-sm text-muted-foreground">
              You'll receive updates about pay, documents, and next steps right here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CandidateChecklistTab;
