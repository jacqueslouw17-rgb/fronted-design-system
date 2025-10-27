import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Calendar, Upload, Users } from "lucide-react";

interface Step6Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  completed: boolean;
}

const WorkerStep6Checklist = ({ formData, onComplete, isProcessing, isLoadingFields }: Step6Props) => {
  const [items, setItems] = useState<ChecklistItem[]>([
    {
      id: "profile_photo",
      title: "Upload profile photo",
      description: "Add a photo for your Slack and company directory",
      icon: Upload,
      completed: false
    },
    {
      id: "laptop_confirm",
      title: "Confirm laptop receipt",
      description: "Let us know when your equipment arrives",
      icon: Upload,
      completed: false
    },
    {
      id: "hr_intro",
      title: "Schedule HR intro call",
      description: "Book a 30-minute onboarding call with HR",
      icon: Calendar,
      completed: false
    },
    {
      id: "team_meet",
      title: "Meet your team",
      description: "Attend your first team standup",
      icon: Users,
      completed: false
    }
  ]);

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleContinue = () => {
    onComplete("checklist", { checklistItems: items });
  };

  const completedCount = items.filter(item => item.completed).length;
  const progressPercentage = (completedCount / items.length) * 100;

  if (isLoadingFields) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Your Onboarding Checklist</h3>
        <p className="text-sm text-muted-foreground">
          Complete these tasks over your first few weeks. Don't worry, you can access this checklist anytime from your dashboard.
        </p>
      </div>

      <div className="bg-card/40 border border-border/40 rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Overall Progress</span>
          <span className="text-sm text-muted-foreground">
            {completedCount} of {items.length} completed
          </span>
        </div>
        <Progress value={progressPercentage} />
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="flex items-start gap-3 p-4 rounded-lg border border-border hover:bg-card/50 transition-colors"
            >
              <Checkbox
                id={item.id}
                checked={item.completed}
                onCheckedChange={() => toggleItem(item.id)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <label
                    htmlFor={item.id}
                    className={`font-medium text-sm cursor-pointer ${
                      item.completed ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {item.title}
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <p className="text-sm text-blue-600 dark:text-blue-400">
          💡 <strong>Kurt says:</strong> You can complete these tasks at your own pace. I'll remind you about pending items in your dashboard!
        </p>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
        <p className="text-sm text-yellow-600 dark:text-yellow-400">
          ⚡ <strong>Note:</strong> You don't need to complete all items now. Click Continue to proceed to the final step.
        </p>
      </div>

      <Button
        onClick={handleContinue}
        disabled={isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? "Saving..." : "Continue"}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};

export default WorkerStep6Checklist;
