import React from "react";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";

interface FirstTimeAdminEmptyStateProps {
  onAddCompany: () => void;
}

const FirstTimeAdminEmptyState: React.FC<FirstTimeAdminEmptyStateProps> = ({ 
  onAddCompany 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div className="max-w-md text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">
            Start by adding a company
          </h2>
          <p className="text-muted-foreground text-sm">
            Once a company is set up, you'll be able to manage candidates, contracts, and payroll from here.
          </p>
        </div>

        {/* CTA Button */}
        <Button 
          onClick={onAddCompany}
          size="lg"
          className="mt-4"
        >
          Add company
        </Button>
      </div>
    </div>
  );
};

export default FirstTimeAdminEmptyState;
