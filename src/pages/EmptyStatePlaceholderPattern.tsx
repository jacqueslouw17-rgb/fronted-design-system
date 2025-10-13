import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EmptyStateCard } from "@/components/EmptyStateCard";
import { toast } from "sonner";
import {
  Users,
  FileText,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Inbox,
  ArrowLeft,
  Filter,
} from "lucide-react";

const EmptyStatePlaceholderPattern = () => {
  const [filterState, setFilterState] = useState<"default" | "filtered">("default");

  const handleInviteContractor = () => {
    toast.success("Opening contractor invitation form...");
  };

  const handleRunPayroll = () => {
    toast.success("Redirecting to payroll setup...");
  };

  const handleStartChecklist = () => {
    toast.success("Opening compliance checklist...");
  };

  const handleRefresh = () => {
    toast.info("Refreshing tickets...");
  };

  const handleClearFilters = () => {
    setFilterState("default");
    toast.info("Filters cleared");
  };

  const handleLearnMore = () => {
    toast.info("Opening documentation...");
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Pattern 20: Empty State / Placeholder
            </h1>
            <p className="text-muted-foreground">
              Helpful, emotionally neutral placeholders that guide users toward their next action.
            </p>
          </div>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Overview
            </Button>
          </Link>
        </div>

        {/* State: Default - No Contractors */}
        <div>
          <h2 className="text-xl font-semibold mb-4">State: Default (No Data)</h2>
          <EmptyStateCard
            title="No contractors added yet"
            description="Once you invite contractors, they'll appear here. Start building your global team today."
            icon={Users}
            state="default"
            primaryAction={{
              label: "Invite Contractor",
              onClick: handleInviteContractor,
            }}
            secondaryAction={{
              label: "Learn How",
              onClick: handleLearnMore,
            }}
            genieHint="Would you like me to create your first invite template?"
            tooltip="Contractors will automatically sync from your ATS once the integration is active."
          />
        </div>

        {/* State: Default - No Payroll Runs */}
        <div>
          <h2 className="text-xl font-semibold mb-4">State: Default (First Time Use)</h2>
          <EmptyStateCard
            title="No payroll runs yet"
            description="Set up your first payroll run to start paying your contractors on time, every time."
            icon={DollarSign}
            state="default"
            primaryAction={{
              label: "Run First Payroll",
              onClick: handleRunPayroll,
            }}
            badge={{
              label: "Setup Required",
              variant: "secondary",
            }}
          />
        </div>

        {/* State: Pending */}
        <div>
          <h2 className="text-xl font-semibold mb-4">State: Pending (Loading)</h2>
          <EmptyStateCard
            title="Loading your data"
            description="Please wait while we fetch your recent activity..."
            state="pending"
          />
        </div>

        {/* State: Empty After Filter */}
        <div>
          <h2 className="text-xl font-semibold mb-4">State: Empty After Filter</h2>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={filterState === "filtered" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterState("filtered")}
              >
                <Filter className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
              {filterState === "filtered" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {filterState === "filtered" && (
              <EmptyStateCard
                title="No results match your filters"
                description="Try adjusting your search criteria or clearing filters to see all available data."
                icon={Filter}
                state="empty-filter"
                primaryAction={{
                  label: "Clear Filters",
                  onClick: handleClearFilters,
                  variant: "secondary",
                }}
                badge={{
                  label: "Filtered View",
                  variant: "outline",
                }}
              />
            )}
          </div>
        </div>

        {/* State: Error */}
        <div>
          <h2 className="text-xl font-semibold mb-4">State: Error</h2>
          <EmptyStateCard
            title="We couldn't load your data"
            description="There was a problem connecting to the server. Please check your connection and try again."
            icon={AlertCircle}
            state="error"
            primaryAction={{
              label: "Try Again",
              onClick: handleRefresh,
            }}
            badge={{
              label: "Connection Error",
              variant: "destructive",
            }}
          />
        </div>

        {/* State: Completed */}
        <div>
          <h2 className="text-xl font-semibold mb-4">State: Completed</h2>
          <EmptyStateCard
            title="All compliance checks completed"
            description="You're fully compliant — and that's something worth celebrating! 🎉"
            icon={CheckCircle2}
            state="completed"
            primaryAction={{
              label: "View Checklist History",
              onClick: handleStartChecklist,
              variant: "secondary",
            }}
            genieHint="Great work! Would you like me to schedule your next compliance review?"
          />
        </div>

        {/* State: Support Inbox Empty */}
        <div>
          <h2 className="text-xl font-semibold mb-4">State: All Caught Up</h2>
          <EmptyStateCard
            title="You're all caught up!"
            description="No pending support tickets at the moment. Your team is doing great."
            icon={Inbox}
            state="completed"
            primaryAction={{
              label: "Refresh Tickets",
              onClick: handleRefresh,
              variant: "outline",
            }}
          />
        </div>

        {/* State: Custom Illustration Example */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Custom Illustration</h2>
          <EmptyStateCard
            title="No drafts created yet"
            description="Draft contracts will appear here once you start creating them."
            illustration={
              <div className="relative">
                <FileText className="h-16 w-16 text-muted-foreground" />
                <div className="absolute -top-1 -right-1 bg-primary rounded-full p-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary-foreground"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </div>
              </div>
            }
            primaryAction={{
              label: "Create First Draft",
              onClick: () => toast.success("Opening draft editor..."),
            }}
            genieHint="I can help you create a compliant contract template."
          />
        </div>
      </div>
    </div>
  );
};

export default EmptyStatePlaceholderPattern;
