import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ArrowLeft, Plus, Edit3 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import AdaptiveWidget from "@/components/dashboard/AdaptiveWidget";
import {
  DollarSign,
  Users,
  FileCheck,
  TrendingUp,
  Clock,
  AlertCircle,
  Activity,
  Sparkles,
} from "lucide-react";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

interface WidgetConfig {
  i: string;
  title: string;
  value: string;
  trend: string;
  icon: any;
  status?: "ok" | "warning" | "breach";
  genieHint?: string;
  tooltipText?: string;
  isPinned?: boolean;
  expandedContent?: string;
}

const AdaptiveWidgetGridPattern = () => {
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [expandedWidget, setExpandedWidget] = useState<WidgetConfig | null>(null);
  const [role, setRole] = useState<"admin" | "hr" | "cfo" | "contractor">("admin");

  // Widget configurations by role
  const adminWidgets: WidgetConfig[] = [
    {
      i: "payroll",
      title: "Payroll Overview",
      value: "$145,000",
      trend: "Next run in 3 days",
      icon: DollarSign,
      status: "ok",
      genieHint: "FX spread has widened by 0.4%. Want to review?",
      tooltipText: "Total monthly payroll across all contractors",
      expandedContent: "Detailed payroll breakdown with FX rates and contractor-wise distribution.",
    },
    {
      i: "compliance",
      title: "Compliance Health",
      value: "94%",
      trend: "2 pending documents",
      icon: FileCheck,
      status: "warning",
      genieHint: "2 pending insurance documents in PH module.",
      tooltipText: "Overall compliance verification status",
      isPinned: true,
      expandedContent: "Full compliance checklist with country-specific requirements and status.",
    },
    {
      i: "contractors",
      title: "Total Contractors",
      value: "24",
      trend: "+12% this month",
      icon: Users,
      status: "ok",
      tooltipText: "Active contractors across all countries",
      expandedContent: "Contractor list with status, location, and contract details.",
    },
    {
      i: "sla",
      title: "Active SLAs",
      value: "3",
      trend: "1 High Priority",
      icon: Clock,
      status: "breach",
      genieHint: "I can escalate it to your Ops Lead.",
      tooltipText: "Live SLA countdowns and unresolved tickets",
      expandedContent: "Detailed SLA tracking with timelines and escalation options.",
    },
    {
      i: "fx",
      title: "FX Transparency",
      value: "0.8% avg",
      trend: "Spread across all currencies",
      icon: Activity,
      status: "ok",
      tooltipText: "Current FX spread and conversion fees",
      expandedContent: "Real-time FX rates, spreads, and historical trends.",
    },
    {
      i: "contracts",
      title: "Contract Status",
      value: "18 active",
      trend: "4 pending approval",
      icon: TrendingUp,
      status: "ok",
      tooltipText: "Drafted, signed, and pending contracts",
      expandedContent: "Contract pipeline with status tracking and approval workflows.",
    },
  ];

  const hrWidgets: WidgetConfig[] = [
    {
      i: "onboarding",
      title: "Onboarding Progress",
      value: "5 active",
      trend: "2 completing this week",
      icon: Users,
      status: "ok",
      tooltipText: "Active onboarding processes",
    },
    {
      i: "contracts",
      title: "Contract Status",
      value: "18 active",
      trend: "4 pending approval",
      icon: FileCheck,
      status: "warning",
      genieHint: "3 contracts need your review.",
    },
    {
      i: "documents",
      title: "Pending Documents",
      value: "7",
      trend: "Down from 12 last week",
      icon: AlertCircle,
      status: "ok",
    },
  ];

  const cfoWidgets: WidgetConfig[] = [
    {
      i: "payroll",
      title: "Total Payroll Cost",
      value: "$145,000",
      trend: "+8% from last month",
      icon: DollarSign,
      status: "ok",
      isPinned: true,
    },
    {
      i: "fx",
      title: "FX Impact",
      value: "$1,240",
      trend: "Spread cost this month",
      icon: Activity,
      status: "warning",
      genieHint: "FX spread has increased. Consider hedging strategy.",
    },
    {
      i: "compliance",
      title: "Compliance Risk Index",
      value: "Low",
      trend: "94% verified",
      icon: FileCheck,
      status: "ok",
    },
  ];

  const contractorWidgets: WidgetConfig[] = [
    {
      i: "payment",
      title: "Payment Received",
      value: "$4,500",
      trend: "Last payment: Oct 1",
      icon: DollarSign,
      status: "ok",
      tooltipText: "Your most recent payment",
    },
    {
      i: "next-payout",
      title: "Next Payout",
      value: "5 days",
      trend: "Expected: $4,500",
      icon: Clock,
      status: "ok",
    },
    {
      i: "documents",
      title: "Document Status",
      value: "All verified",
      trend: "Insurance expires in 45 days",
      icon: FileCheck,
      status: "ok",
    },
  ];

  const getWidgetsByRole = () => {
    switch (role) {
      case "hr":
        return hrWidgets;
      case "cfo":
        return cfoWidgets;
      case "contractor":
        return contractorWidgets;
      default:
        return adminWidgets;
    }
  };

  const [widgets, setWidgets] = useState(getWidgetsByRole());

  // Default layouts by role
  const layouts = {
    admin: [
      { i: "payroll", x: 0, y: 0, w: 4, h: 2 },
      { i: "compliance", x: 4, y: 0, w: 4, h: 2 },
      { i: "contractors", x: 8, y: 0, w: 4, h: 2 },
      { i: "sla", x: 0, y: 2, w: 4, h: 2 },
      { i: "fx", x: 4, y: 2, w: 4, h: 2 },
      { i: "contracts", x: 8, y: 2, w: 4, h: 2 },
    ],
    hr: [
      { i: "onboarding", x: 0, y: 0, w: 4, h: 2 },
      { i: "contracts", x: 4, y: 0, w: 4, h: 2 },
      { i: "documents", x: 8, y: 0, w: 4, h: 2 },
    ],
    cfo: [
      { i: "payroll", x: 0, y: 0, w: 4, h: 2 },
      { i: "fx", x: 4, y: 0, w: 4, h: 2 },
      { i: "compliance", x: 8, y: 0, w: 4, h: 2 },
    ],
    contractor: [
      { i: "payment", x: 0, y: 0, w: 4, h: 2 },
      { i: "next-payout", x: 4, y: 0, w: 4, h: 2 },
      { i: "documents", x: 8, y: 0, w: 4, h: 2 },
    ],
  };

  const [layout, setLayout] = useState(layouts[role]);

  const handleRoleChange = (newRole: "admin" | "hr" | "cfo" | "contractor") => {
    setRole(newRole);
    setWidgets(
      newRole === "admin"
        ? adminWidgets
        : newRole === "hr"
        ? hrWidgets
        : newRole === "cfo"
        ? cfoWidgets
        : contractorWidgets
    );
    setLayout(layouts[newRole]);
  };

  const handleExpand = (widget: WidgetConfig) => {
    setExpandedWidget(widget);
  };

  const handlePin = (widgetId: string) => {
    setWidgets(
      widgets.map((w) =>
        w.i === widgetId ? { ...w, isPinned: !w.isPinned } : w
      )
    );
  };

  const handleRemove = (widgetId: string) => {
    setWidgets(widgets.filter((w) => w.i !== widgetId));
    setLayout(layout.filter((l) => l.i !== widgetId));
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
        <header className="border-b border-border bg-card px-4 sm:px-6 py-4 rounded-lg shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
                Adaptive Widget Grid
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Personalized, modular dashboard with drag-and-drop widgets
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={isEditMode ? "default" : "outline"}
                onClick={() => setIsEditMode(!isEditMode)}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                {isEditMode ? "Done" : "Edit Layout"}
              </Button>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Widget
              </Button>
            </div>
          </div>
        </header>

        {/* Role Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">View as:</span>
          <div className="flex gap-2">
            {(["admin", "hr", "cfo", "contractor"] as const).map((r) => (
              <Button
                key={r}
                variant={role === r ? "default" : "outline"}
                size="sm"
                onClick={() => handleRoleChange(r)}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Widget Grid */}
        <div>
          <Badge variant="outline" className="mb-3">
            {isEditMode ? "Drag widgets to rearrange, resize from bottom-right corner" : "Hover over widgets to see actions"}
          </Badge>
        </div>

        <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={90}
        width={1200}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        onLayoutChange={(newLayout) => setLayout(newLayout)}
        draggableHandle=".cursor-move"
        compactType="vertical"
        margin={[16, 16]}
      >
        {widgets.map((widget) => (
          <div key={widget.i} className="h-full">
            <AdaptiveWidget
              title={widget.title}
              value={widget.value}
              trend={widget.trend}
              icon={widget.icon}
              status={widget.status}
              genieHint={widget.genieHint}
              tooltipText={widget.tooltipText}
              isPinned={widget.isPinned}
              onExpand={() => handleExpand(widget)}
              onPin={() => handlePin(widget.i)}
              onRemove={() => handleRemove(widget.i)}
            />
          </div>
        ))}
      </GridLayout>

      {/* Expanded Widget Drawer */}
      <Sheet open={!!expandedWidget} onOpenChange={() => setExpandedWidget(null)}>
        <SheetContent className="w-full sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              {expandedWidget?.icon && <expandedWidget.icon className="h-5 w-5" />}
              {expandedWidget?.title}
            </SheetTitle>
            <SheetDescription>{expandedWidget?.tooltipText}</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="p-4 rounded-lg bg-muted">
              <div className="text-3xl font-bold mb-2">{expandedWidget?.value}</div>
              <p className="text-sm text-muted-foreground">{expandedWidget?.trend}</p>
            </div>
            {expandedWidget?.genieHint && (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Genie Insight</p>
                    <p className="text-sm text-muted-foreground">{expandedWidget.genieHint}</p>
                  </div>
                </div>
              </div>
            )}
            {expandedWidget?.expandedContent && (
              <div className="p-4 rounded-lg border">
                <p className="text-sm">{expandedWidget.expandedContent}</p>
              </div>
            )}
            <div className="flex gap-2">
              <Button className="flex-1">Open in Full View</Button>
              <Button variant="outline">Ask Genie</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      </div>
    </div>
  );
};

export default AdaptiveWidgetGridPattern;
