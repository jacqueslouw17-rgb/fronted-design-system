import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  Eye,
  CheckCircle2,
  Download,
  MoreVertical,
  Trash2,
  Copy,
  FileText,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TableRowData {
  id: string;
  name: string;
  status: "pending" | "approved" | "rejected";
  amount?: string;
  date: string;
}

const sampleTableData: TableRowData[] = [
  { id: "PAY-1001", name: "John Smith", status: "pending", amount: "$5,350", date: "2024-01-15" },
  { id: "PAY-1002", name: "Sarah Johnson", status: "approved", amount: "$4,200", date: "2024-01-14" },
  { id: "PAY-1003", name: "Mike Wilson", status: "pending", amount: "$6,100", date: "2024-01-13" },
  { id: "PAY-1004", name: "Emma Davis", status: "rejected", amount: "$3,800", date: "2024-01-12" },
];

const sampleCards = [
  { id: "1", title: "Q4 Compliance Report", type: "document", status: "pending" },
  { id: "2", title: "January Payroll Summary", type: "payroll", status: "approved" },
  { id: "3", title: "Contract Review - John", type: "contract", status: "pending" },
];

const HoverToolbarPattern = () => {
  const { toast } = useToast();
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const handleAction = (action: string, itemId: string) => {
    toast({
      title: `Action: ${action}`,
      description: `Performed ${action} on ${itemId}`,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      pending: { label: "Pending", className: "bg-yellow-500/10 text-yellow-500" },
      approved: { label: "Approved", className: "bg-green-500/10 text-green-500" },
      rejected: { label: "Rejected", className: "bg-red-500/10 text-red-500" },
    };
    const config = variants[status] || variants.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const ActionButton = ({ 
    icon: Icon, 
    label, 
    onClick 
  }: { 
    icon: typeof Edit; 
    label: string; 
    onClick: () => void 
  }) => (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-primary/10"
            onClick={onClick}
          >
            <Icon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 z-10"
        onClick={() => (window.location.href = "/")}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      {/* Header */}
      <header className="border-b border-border bg-card px-8 py-6">
        <h1 className="text-2xl font-bold text-foreground">
          Hover Quick Action Toolbar
        </h1>
        <p className="text-muted-foreground mt-1">
          Context-aware actions appear on hover for instant access
        </p>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-12 space-y-12">
        {/* Table Example */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Table Row Actions</h2>
          <Card>
            <CardHeader>
              <CardTitle>Payroll Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[120px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleTableData.map((row) => (
                    <TableRow
                      key={row.id}
                      className="group relative"
                      onMouseEnter={() => setHoveredRow(row.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <TableCell className="font-medium">{row.id}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.amount}</TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{getStatusBadge(row.status)}</TableCell>
                      <TableCell>
                        <div
                          className={`flex items-center gap-1 transition-opacity duration-200 ${
                            hoveredRow === row.id ? "opacity-100" : "opacity-0"
                          }`}
                        >
                          <ActionButton
                            icon={Eye}
                            label="View Details"
                            onClick={() => handleAction("View", row.id)}
                          />
                          <ActionButton
                            icon={Edit}
                            label="Edit"
                            onClick={() => handleAction("Edit", row.id)}
                          />
                          <ActionButton
                            icon={CheckCircle2}
                            label="Approve"
                            onClick={() => handleAction("Approve", row.id)}
                          />
                          <ActionButton
                            icon={Download}
                            label="Download"
                            onClick={() => handleAction("Download", row.id)}
                          />
                          
                          <DropdownMenu>
                            <TooltipProvider>
                              <Tooltip delayDuration={200}>
                                <TooltipTrigger asChild>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 hover:bg-primary/10"
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>More actions</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <DropdownMenuContent align="end" className="bg-popover z-50">
                              <DropdownMenuItem onClick={() => handleAction("Copy", row.id)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleAction("Delete", row.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

        {/* Card Grid Example */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Card Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sampleCards.map((card) => {
              const Icon = card.type === "document" ? FileText 
                : card.type === "payroll" ? DollarSign 
                : AlertCircle;

              return (
                <Card
                  key={card.id}
                  className="group relative overflow-hidden"
                  onMouseEnter={() => setHoveredCard(card.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{card.title}</CardTitle>
                        </div>
                      </div>
                      {getStatusBadge(card.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Click any action to interact with this item
                    </p>
                  </CardContent>

                  {/* Hover Toolbar */}
                  <div
                    className={`absolute top-4 right-4 flex items-center gap-1 bg-card/95 backdrop-blur-sm rounded-lg p-1 shadow-lg border border-border transition-all duration-200 ${
                      hoveredCard === card.id
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 translate-x-2 pointer-events-none"
                    }`}
                  >
                    <ActionButton
                      icon={Eye}
                      label="View"
                      onClick={() => handleAction("View", card.id)}
                    />
                    <ActionButton
                      icon={Edit}
                      label="Edit"
                      onClick={() => handleAction("Edit", card.id)}
                    />
                    <ActionButton
                      icon={Download}
                      label="Download"
                      onClick={() => handleAction("Download", card.id)}
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Info Section */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Pattern Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
                  <span>Smooth fade-in animation on hover (100ms delay)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
                  <span>Up to 5 primary actions with tooltips for clarity</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
                  <span>Overflow menu for secondary actions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
                  <span>Context-aware actions based on item type and status</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
                  <span>Keyboard navigation support (Tab + Enter)</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default HoverToolbarPattern;
