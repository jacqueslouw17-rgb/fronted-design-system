/**
 * Flow 4.1 — Employee Dashboard v4 Profile Settings
 * 
 * Isolated profile settings for v4 employees with Documents section.
 * INDEPENDENT from other flows - changes here do not affect other flows.
 */

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, KeyRound, FileText, ChevronRight, Download, X } from "lucide-react";
import { toast } from "sonner";
import CandidateStep2PersonalDetails from "@/components/flows/candidate-onboarding/CandidateStep2PersonalDetails";
import CandidateStep3Compliance from "@/components/flows/candidate-onboarding/CandidateStep3Compliance";
import CandidateStep4Bank from "@/components/flows/candidate-onboarding/CandidateStep4Bank";
import CandidateStep5WorkSetup from "@/components/flows/candidate-onboarding/CandidateStep5WorkSetup";

type Section = "overview" | "profile-details" | "change-password" | "documents";
type ProfileStep = 1 | 2 | 3 | 4;

const OVERVIEW_CARDS = [
  {
    id: "profile-details" as Section,
    icon: User,
    title: "Profile Details",
    description: "View and update your personal, compliance, and work details."
  },
  {
    id: "documents" as Section,
    icon: FileText,
    title: "Documents",
    description: "Your signed documents are stored here."
  },
  {
    id: "change-password" as Section,
    icon: KeyRound,
    title: "Change Password",
    description: "Update your login password for Fronted."
  }
];

const PROFILE_STEPS = [
  {
    number: 1,
    label: "Personal Details",
    description: "Name, contact information, and basic personal data."
  },
  {
    number: 2,
    label: "Compliance Documents",
    description: "Upload and manage identity and compliance documents."
  },
  {
    number: 3,
    label: "Payroll Details",
    description: "Banking, payout, and tax-related details."
  },
  {
    number: 4,
    label: "Work Setup & Agreements",
    description: "Work arrangements, policies, and contract-related documents."
  }
];

const F41v4_ProfileSettings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentSection, setCurrentSection] = useState<Section>("overview");
  const [currentProfileStep, setCurrentProfileStep] = useState<ProfileStep>(1);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const getReturnUrl = () => {
    const searchParams = new URLSearchParams(location.search);
    const returnUrl = searchParams.get('returnUrl') || (location.state as any)?.returnUrl;
    if (returnUrl) return returnUrl;
    return '/candidate-dashboard-employee-v4';
  };

  const handleClose = () => {
    navigate(getReturnUrl());
  };

  const handleLogoClick = () => {
    navigate(getReturnUrl());
  };

  const handleDownloadContract = () => {
    window.open("#", "_blank");
    toast.info("Downloading contract bundle...");
  };

  const handleStepComplete = (stepId: string, data?: Record<string, any>) => {
    if (data) {
      setFormData(prev => ({ ...prev, [stepId]: data }));
    }
    toast.success("Changes saved");
  };

  const renderProfileStepContent = () => {
    switch (currentProfileStep) {
      case 1:
        return (
          <CandidateStep2PersonalDetails 
            formData={formData} 
            onComplete={handleStepComplete}
            isProcessing={false}
            isLoadingFields={false}
            buttonText="Save changes"
          />
        );
      case 2:
        return (
          <CandidateStep3Compliance 
            formData={formData} 
            onComplete={handleStepComplete}
            isProcessing={false}
            isLoadingFields={false}
            buttonText="Save changes"
          />
        );
      case 3:
        return (
          <CandidateStep4Bank 
            formData={formData} 
            onComplete={handleStepComplete}
            isProcessing={false}
            isLoadingFields={false}
            buttonText="Save changes"
          />
        );
      case 4:
        return (
          <CandidateStep5WorkSetup 
            formData={formData} 
            onComplete={handleStepComplete}
            isProcessing={false}
            isLoadingFields={false}
            buttonText="Save changes"
          />
        );
      default:
        return null;
    }
  };

  const renderContent = () => {
    // Overview section
    if (currentSection === "overview") {
      return (
        <div className="space-y-4">
          {OVERVIEW_CARDS.map((card) => (
            <Card 
              key={card.id}
              className="cursor-pointer hover:border-primary/40 transition-colors"
              onClick={() => setCurrentSection(card.id)}
            >
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <card.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{card.title}</h3>
                    <p className="text-sm text-muted-foreground">{card.description}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    // Documents section
    if (currentSection === "documents") {
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Documents</h3>
            <p className="text-sm text-muted-foreground">
              Your signed documents are stored here.
            </p>
          </div>

          <div className="space-y-3">
            {/* Signed Contract Bundle */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-3 flex-1">
                <FileText className="h-5 w-5 text-accent-green-text flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Signed Contract Bundle</p>
                  <p className="text-xs text-muted-foreground">Your final HR-approved contract bundle.</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={handleDownloadContract} className="flex-shrink-0 ml-4">
                <Download className="h-4 w-4 mr-1.5" />
                Download
              </Button>
            </div>
          </div>

          <Button variant="outline" onClick={() => setCurrentSection("overview")}>
            Back to settings
          </Button>
        </div>
      );
    }

    // Profile Details section
    if (currentSection === "profile-details") {
      return (
        <div className="space-y-6">
          {/* Step Pills */}
          <div className="flex flex-wrap gap-2">
            {PROFILE_STEPS.map((step) => (
              <button
                key={step.number}
                onClick={() => setCurrentProfileStep(step.number as ProfileStep)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  currentProfileStep === step.number
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <span className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-xs ${
                  currentProfileStep === step.number
                    ? "bg-primary-foreground/20"
                    : "bg-background"
                }`}>
                  {step.number}
                </span>
                {step.label}
              </button>
            ))}
          </div>

          {/* Step Content */}
          <Card>
            <CardContent className="p-6">
              {renderProfileStepContent()}
            </CardContent>
          </Card>

          <Button variant="outline" onClick={() => setCurrentSection("overview")}>
            Back to settings
          </Button>
        </div>
      );
    }

    // Change Password section
    if (currentSection === "change-password") {
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Change Password</h3>
            <p className="text-sm text-muted-foreground">
              Update your login password for Fronted.
            </p>
          </div>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Password</label>
                <input 
                  type="password" 
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  placeholder="Enter current password"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <input 
                  type="password" 
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm New Password</label>
                <input 
                  type="password" 
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  placeholder="Confirm new password"
                />
              </div>
              <Button onClick={() => toast.success("Password updated")}>
                Update Password
              </Button>
            </CardContent>
          </Card>

          <Button variant="outline" onClick={() => setCurrentSection("overview")}>
            Back to settings
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <button 
            onClick={handleLogoClick}
            className="text-xl font-semibold text-foreground hover:text-primary transition-colors"
          >
            fronted
          </button>
          <button 
            onClick={handleClose}
            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Page Title */}
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>

          {/* Content */}
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default F41v4_ProfileSettings;
