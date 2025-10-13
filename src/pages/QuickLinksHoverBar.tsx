import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Eye, 
  Edit, 
  Download, 
  MoreVertical, 
  AlertTriangle,
  MessageSquare,
  CheckCircle,
  FileText,
  ArrowLeft,
  Upload,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";

interface HoverBarAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive";
}

const HoverActionBar = ({ 
  actions, 
  moreActions 
}: { 
  actions: HoverBarAction[]; 
  moreActions?: HoverBarAction[];
}) => {
  return (
    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-background/95 backdrop-blur-sm px-2 py-1 rounded-md shadow-md border opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 z-10">
      <TooltipProvider delayDuration={100}>
        {actions.map((action, idx) => (
          <Tooltip key={idx}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick();
                }}
              >
                {action.icon}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{action.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
        
        {moreActions && moreActions.length > 0 && (
          <>
            <div className="h-6 w-px bg-border mx-1" />
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>More actions</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" className="w-48">
                {moreActions.map((action, idx) => (
                  <div key={idx}>
                    {idx > 0 && action.variant === "destructive" && <DropdownMenuSeparator />}
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        action.onClick();
                      }}
                      className={action.variant === "destructive" ? "text-destructive" : ""}
                    >
                      {action.icon}
                      <span className="ml-2">{action.label}</span>
                    </DropdownMenuItem>
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </TooltipProvider>
    </div>
  );
};

const QuickLinksHoverBar = () => {
  const navigate = useNavigate();
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const handleAction = (action: string, itemName: string) => {
    toast({
      title: `${action} action`,
      description: `${action} triggered for ${itemName}`,
    });
  };

  const payrollData = [
    { id: "1", batch: "Batch #42", employees: 15, amount: "$42,500", status: "pending" },
    { id: "2", batch: "Batch #41", employees: 12, amount: "$38,200", status: "approved" },
    { id: "3", batch: "Batch #40", employees: 18, amount: "$51,800", status: "completed" },
  ];

  const supportTickets = [
    { id: "1", title: "Contract renewal question", priority: "high", comments: 3, status: "open" },
    { id: "2", title: "Payroll discrepancy", priority: "urgent", comments: 7, status: "escalated" },
    { id: "3", title: "Benefits enrollment", priority: "medium", comments: 1, status: "open" },
  ];

  const complianceDocs = [
    { id: "1", name: "Tax Certificate 2024", country: "Norway", expires: "Dec 2024", status: "verified" },
    { id: "2", name: "Work Permit", country: "Philippines", expires: "Jan 2025", status: "pending" },
    { id: "3", name: "ID Document", country: "Romania", expires: "Mar 2026", status: "verified" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Pattern 12: Quick Links Hover Bar</h1>
              <p className="text-sm text-muted-foreground">Actions appear just in time — not all the time</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Payroll Table Example */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Example 1: Payroll Batches</h2>
          <Card>
            <CardHeader>
              <CardTitle>Pending Payroll Batches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {payrollData.map((batch) => (
                  <div
                    key={batch.id}
                    className="group relative p-4 border rounded-lg hover:bg-accent/50 transition-colors focus-within:ring-2 focus-within:ring-ring"
                    tabIndex={0}
                    onMouseEnter={() => setHoveredRow(batch.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <div className="flex items-center justify-between pr-32">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{batch.batch}</span>
                          <Badge variant={batch.status === "pending" ? "default" : batch.status === "approved" ? "secondary" : "outline"}>
                            {batch.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {batch.employees} employees • {batch.amount}
                        </div>
                      </div>
                    </div>
                    
                    <HoverActionBar
                      actions={[
                        {
                          icon: <Eye className="h-4 w-4" />,
                          label: "Preview payroll details",
                          onClick: () => handleAction("Preview", batch.batch)
                        },
                        {
                          icon: <Edit className="h-4 w-4" />,
                          label: "Edit payroll batch",
                          onClick: () => handleAction("Edit", batch.batch)
                        },
                        {
                          icon: <Download className="h-4 w-4" />,
                          label: "Export to CSV",
                          onClick: () => handleAction("Export", batch.batch)
                        }
                      ]}
                      moreActions={[
                        {
                          icon: <CheckCircle className="h-4 w-4" />,
                          label: "Approve batch",
                          onClick: () => handleAction("Approve", batch.batch)
                        },
                        {
                          icon: <Upload className="h-4 w-4" />,
                          label: "Upload corrections",
                          onClick: () => handleAction("Upload", batch.batch)
                        },
                        {
                          icon: <Trash2 className="h-4 w-4" />,
                          label: "Delete batch",
                          onClick: () => handleAction("Delete", batch.batch),
                          variant: "destructive"
                        }
                      ]}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Support Tickets Example */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Example 2: Support Tickets</h2>
          <Card>
            <CardHeader>
              <CardTitle>Active Support Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {supportTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="group relative p-4 border rounded-lg hover:bg-accent/50 transition-colors focus-within:ring-2 focus-within:ring-ring"
                    tabIndex={0}
                  >
                    <div className="flex items-center justify-between pr-32">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{ticket.title}</span>
                          <Badge variant={ticket.priority === "urgent" ? "destructive" : ticket.priority === "high" ? "default" : "secondary"}>
                            {ticket.priority}
                          </Badge>
                          {ticket.comments > 0 && (
                            <Badge variant="outline" className="gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {ticket.comments}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Status: {ticket.status}
                        </div>
                      </div>
                    </div>
                    
                    <HoverActionBar
                      actions={[
                        {
                          icon: <Eye className="h-4 w-4" />,
                          label: "View ticket details",
                          onClick: () => handleAction("View", ticket.title)
                        },
                        {
                          icon: <AlertTriangle className="h-4 w-4" />,
                          label: "Escalate to Tier 2",
                          onClick: () => handleAction("Escalate", ticket.title)
                        },
                        {
                          icon: <CheckCircle className="h-4 w-4" />,
                          label: "Close ticket",
                          onClick: () => handleAction("Close", ticket.title)
                        }
                      ]}
                      moreActions={[
                        {
                          icon: <MessageSquare className="h-4 w-4" />,
                          label: "Add internal note",
                          onClick: () => handleAction("Add note", ticket.title)
                        },
                        {
                          icon: <FileText className="h-4 w-4" />,
                          label: "View history",
                          onClick: () => handleAction("View history", ticket.title)
                        }
                      ]}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Compliance Documents Example */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Example 3: Compliance Documents</h2>
          <Card>
            <CardHeader>
              <CardTitle>Document Repository</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {complianceDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="group relative p-4 border rounded-lg hover:bg-accent/50 transition-colors focus-within:ring-2 focus-within:ring-ring"
                    tabIndex={0}
                  >
                    <div className="flex items-center justify-between pr-32">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{doc.name}</span>
                          <Badge variant={doc.status === "verified" ? "secondary" : "default"}>
                            {doc.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {doc.country} • Expires: {doc.expires}
                        </div>
                      </div>
                    </div>
                    
                    <HoverActionBar
                      actions={[
                        {
                          icon: <Eye className="h-4 w-4" />,
                          label: "View file",
                          onClick: () => handleAction("View", doc.name)
                        },
                        {
                          icon: <Download className="h-4 w-4" />,
                          label: "Download document",
                          onClick: () => handleAction("Download", doc.name)
                        },
                        {
                          icon: <Upload className="h-4 w-4" />,
                          label: "Request update",
                          onClick: () => handleAction("Request update", doc.name)
                        }
                      ]}
                      moreActions={[
                        {
                          icon: <CheckCircle className="h-4 w-4" />,
                          label: "Mark as verified",
                          onClick: () => handleAction("Verify", doc.name)
                        },
                        {
                          icon: <Edit className="h-4 w-4" />,
                          label: "Edit metadata",
                          onClick: () => handleAction("Edit metadata", doc.name)
                        },
                        {
                          icon: <Trash2 className="h-4 w-4" />,
                          label: "Archive document",
                          onClick: () => handleAction("Archive", doc.name),
                          variant: "destructive"
                        }
                      ]}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Info Section */}
        <Card>
          <CardHeader>
            <CardTitle>Pattern Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Key Characteristics</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Smooth fade-in on hover with 200ms transition</li>
                <li>Keyboard accessible (tab focus reveals actions)</li>
                <li>Tooltips describe each action clearly</li>
                <li>Dropdown menu for overflow actions</li>
                <li>Right-aligned with elevation and backdrop blur</li>
                <li>Optional badges for context (comment counts, status)</li>
                <li>Divider separates primary from destructive actions</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">UX Principle</h3>
              <p className="text-sm text-muted-foreground italic">
                "Actions appear just in time — not all the time."
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                The user's focus stays on the data. Actions reveal themselves contextually, 
                avoiding clutter and cognitive load, but staying one hover away for power users.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuickLinksHoverBar;
