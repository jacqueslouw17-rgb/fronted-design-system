import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProgressBar from "@/components/ProgressBar";
import StepCard from "@/components/StepCard";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

type StepStatus = "pending" | "active" | "completed";

interface Step {
  id: number;
  title: string;
  status: StepStatus;
}

const StepCardPattern = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    employees: "",
    description: "",
    terms: "",
    startDate: "",
  });

  const [steps, setSteps] = useState<Step[]>([
    { id: 1, title: "Company Information", status: "active" },
    { id: 2, title: "Business Details", status: "pending" },
    { id: 3, title: "Contract Terms", status: "pending" },
    { id: 4, title: "Review & Submit", status: "pending" },
  ]);

  const totalSteps = steps.length;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      const updatedSteps = steps.map((step) =>
        step.id === currentStep
          ? { ...step, status: "completed" as StepStatus }
          : step.id === currentStep + 1
          ? { ...step, status: "active" as StepStatus }
          : step
      );
      setSteps(updatedSteps);
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      const updatedSteps = steps.map((step) =>
        step.id === currentStep
          ? { ...step, status: "pending" as StepStatus }
          : step.id === currentStep - 1
          ? { ...step, status: "active" as StepStatus }
          : step
      );
      setSteps(updatedSteps);
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = (stepId: number) => {
    switch (stepId) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                placeholder="Acme Corp"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Select
                value={formData.industry}
                onValueChange={(value) =>
                  setFormData({ ...formData, industry: value })
                }
              >
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="employees">Number of Employees</Label>
              <Select
                value={formData.employees}
                onValueChange={(value) =>
                  setFormData({ ...formData, employees: value })
                }
              >
                <SelectTrigger id="employees">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10</SelectItem>
                  <SelectItem value="11-50">11-50</SelectItem>
                  <SelectItem value="51-200">51-200</SelectItem>
                  <SelectItem value="201-500">201-500</SelectItem>
                  <SelectItem value="500+">500+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Business Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your business..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="terms">Contract Duration</Label>
              <Select
                value={formData.terms}
                onValueChange={(value) =>
                  setFormData({ ...formData, terms: value })
                }
              >
                <SelectTrigger id="terms">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">3 Months</SelectItem>
                  <SelectItem value="6months">6 Months</SelectItem>
                  <SelectItem value="1year">1 Year</SelectItem>
                  <SelectItem value="2years">2 Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-3">
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm text-muted-foreground">Company Name</p>
              <p className="font-medium">
                {formData.companyName || "Not provided"}
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm text-muted-foreground">Industry</p>
              <p className="font-medium capitalize">
                {formData.industry || "Not provided"}
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm text-muted-foreground">Employees</p>
              <p className="font-medium">{formData.employees || "Not provided"}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm text-muted-foreground">Contract Duration</p>
              <p className="font-medium capitalize">
                {formData.terms || "Not provided"}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back Button */}
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Overview</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </Link>

      {/* Header */}
      <header className="border-b border-border bg-card px-4 sm:px-6 py-5 rounded-lg shadow-card">
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
          Step Card Stack Pattern
        </h1>
        <p className="text-muted-foreground text-sm mt-1.5">
          Guided multi-step workflow with progress tracking
        </p>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto py-12">
        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        </div>

        {/* Step Cards */}
        <div className="space-y-4">
          {steps.map((step) => (
            <StepCard
              key={step.id}
              title={step.title}
              status={step.status}
              stepNumber={step.id}
              isExpanded={step.id === currentStep}
              onClick={() => {
                if (step.status !== "pending") {
                  setCurrentStep(step.id);
                }
              }}
            >
              {renderStepContent(step.id)}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-border">
                {currentStep > 1 && (
                  <Button variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                )}
                <Button onClick={handleNext}>
                  {currentStep === totalSteps ? "Complete" : "Next"}
                </Button>
              </div>
            </StepCard>
          ))}
        </div>
      </main>
      </div>
    </div>
  );
};

export default StepCardPattern;
