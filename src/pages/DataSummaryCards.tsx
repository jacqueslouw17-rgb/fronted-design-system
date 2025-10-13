import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DataSummaryCard from "@/components/DataSummaryCard";
import { DollarSign, AlertTriangle, CheckCircle, Users, TrendingUp, FileCheck, ArrowLeft } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface DrawerContent {
  title: string;
  description: string;
  data: Array<{ label: string; value: string }>;
}

const DataSummaryCards = () => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerContent, setDrawerContent] = useState<DrawerContent | null>(null);
  const { toast } = useToast();

  const handleExpand = (content: DrawerContent) => {
    setDrawerContent(content);
    setDrawerOpen(true);
    toast({
      title: "Opening details",
      description: `Viewing ${content.title}`,
    });
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-4xl font-bold">Data Summary Cards</h1>
          </div>
          <p className="text-muted-foreground ml-14">
            Compact, self-contained cards displaying key insights and metrics at a glance
          </p>
        </div>

        {/* Overview Section */}
        <div className="prose prose-sm max-w-none">
          <h2 className="text-2xl font-semibold mb-4">Pattern Overview</h2>
          <p className="text-muted-foreground">
            Show clarity first, complexity later. Each card answers a clear question like "What's happening?", 
            "Is it okay?", or "What should I do next?" — reinforcing transparency for all users.
          </p>
        </div>

        {/* Example Cards Grid */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Live Examples</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Payroll Card - Normal State */}
            <DataSummaryCard
              label="Total Payroll This Month"
              value="₱241,000"
              icon={DollarSign}
              trend={{ value: "+4%", direction: "up" }}
              status="normal"
              tooltipText="Includes approved payments across Norway and the Philippines"
              tags={["Auto-approved", "FX locked"]}
              sparklineData={[180000, 190000, 195000, 220000, 230000, 241000]}
              onExpand={() => handleExpand({
                title: "Payroll Breakdown",
                description: "Detailed breakdown of this month's payroll",
                data: [
                  { label: "Norway", value: "₱120,000" },
                  { label: "Philippines", value: "₱121,000" },
                  { label: "Processing Fees", value: "₱0" },
                  { label: "FX Spread", value: "1.4%" },
                ]
              })}
            />

            {/* SLA Breaches Card - Warning State */}
            <DataSummaryCard
              label="SLA Breaches"
              value="3"
              icon={AlertTriangle}
              status="warning"
              tooltipText="Tickets breaching SLAs at Tier 2. Genie can prioritize the most recent breach for review."
              tags={["Priority: High", "Auto-escalate"]}
              onExpand={() => handleExpand({
                title: "SLA Breach Details",
                description: "Tickets currently breaching service level agreements",
                data: [
                  { label: "Ticket #1249", value: "Overdue by 2 hours" },
                  { label: "Ticket #1256", value: "Overdue by 45 minutes" },
                  { label: "Ticket #1267", value: "Overdue by 15 minutes" },
                ]
              })}
            />

            {/* Compliance Card - Normal State */}
            <DataSummaryCard
              label="Compliance Verified"
              value="96%"
              icon={CheckCircle}
              trend={{ value: "+2%", direction: "up" }}
              status="normal"
              tooltipText="Country documents verified across all active contractors"
              tags={["Auto-verify enabled"]}
              sparklineData={[88, 90, 92, 94, 95, 96]}
              onExpand={() => handleExpand({
                title: "Compliance Status",
                description: "Document verification status by country",
                data: [
                  { label: "Norway", value: "100%" },
                  { label: "Philippines", value: "98%" },
                  { label: "United States", value: "92%" },
                  { label: "Pending Review", value: "4 documents" },
                ]
              })}
            />

            {/* Active Contractors Card */}
            <DataSummaryCard
              label="Active Contractors"
              value="127"
              icon={Users}
              trend={{ value: "+8", direction: "up" }}
              status="normal"
              tooltipText="Total number of active contractors across all countries"
              sparklineData={[110, 115, 118, 121, 124, 127]}
              onExpand={() => handleExpand({
                title: "Contractor Distribution",
                description: "Active contractors by country",
                data: [
                  { label: "Philippines", value: "62 contractors" },
                  { label: "Norway", value: "38 contractors" },
                  { label: "United States", value: "27 contractors" },
                ]
              })}
            />

            {/* Average Payroll Processing Time */}
            <DataSummaryCard
              label="Avg Processing Time"
              value="24h"
              icon={TrendingUp}
              trend={{ value: "-6h", direction: "down" }}
              status="normal"
              tooltipText="Average time from approval to payout completion"
              tags={["Improved"]}
              sparklineData={[36, 34, 30, 28, 26, 24]}
              onExpand={() => handleExpand({
                title: "Processing Time Breakdown",
                description: "Time metrics for payroll processing",
                data: [
                  { label: "Fastest", value: "18 hours" },
                  { label: "Average", value: "24 hours" },
                  { label: "Slowest", value: "32 hours" },
                  { label: "Target SLA", value: "48 hours" },
                ]
              })}
            />

            {/* Document Approvals Card - Error State */}
            <DataSummaryCard
              label="Pending Approvals"
              value="12"
              icon={FileCheck}
              status="error"
              tooltipText="Documents requiring urgent review and approval"
              tags={["Action required"]}
              onExpand={() => handleExpand({
                title: "Pending Approvals",
                description: "Documents awaiting approval",
                data: [
                  { label: "Contracts", value: "7 documents" },
                  { label: "Compliance Docs", value: "3 documents" },
                  { label: "Payroll Changes", value: "2 documents" },
                ]
              })}
            />

            {/* Loading State Example */}
            <DataSummaryCard
              label="FX Rate Data"
              value="Loading"
              icon={TrendingUp}
              status="loading"
              tooltipText="Fetching latest foreign exchange rates"
              tags={["Refreshing"]}
            />

            {/* Empty State Example */}
            <DataSummaryCard
              label="Payroll Anomalies"
              value="0"
              icon={AlertTriangle}
              status="normal"
              tooltipText="No anomalies detected in recent payroll batches"
              tags={["All clear"]}
              onExpand={() => handleExpand({
                title: "Anomaly Detection",
                description: "No anomalies found",
                data: [
                  { label: "Status", value: "All systems normal" },
                  { label: "Last Check", value: "2 minutes ago" },
                ]
              })}
            />
          </div>
        </div>

        {/* States Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Card States</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium">Normal</h3>
              <p className="text-sm text-muted-foreground">
                Default state with clean metrics and optional trends
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Warning</h3>
              <p className="text-sm text-muted-foreground">
                Amber border and background for attention-requiring items
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Error</h3>
              <p className="text-sm text-muted-foreground">
                Red border and background for critical issues
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Loading</h3>
              <p className="text-sm text-muted-foreground">
                Animated pulse while data is being fetched
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contextual Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="sm:max-w-lg">
          {drawerContent && (
            <>
              <SheetHeader>
                <SheetTitle>{drawerContent.title}</SheetTitle>
                <SheetDescription>{drawerContent.description}</SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drawerContent.data.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.label}</TableCell>
                        <TableCell className="text-right">{item.value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default DataSummaryCards;
