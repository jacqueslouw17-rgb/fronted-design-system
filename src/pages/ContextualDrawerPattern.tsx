import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, FileText, DollarSign, AlertCircle, CheckCircle2, Download, Edit, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";

interface DrawerContent {
  id: string;
  title: string;
  status: "pending" | "approved" | "rejected" | "review";
  type: string;
}

const sampleData: DrawerContent[] = [
  { id: "PAY-1024", title: "Payroll Run - January 2024", status: "review", type: "Payroll" },
  { id: "CON-2048", title: "Contract - John Smith", status: "pending", type: "Contract" },
  { id: "COM-3072", title: "Compliance Audit - Q4", status: "approved", type: "Compliance" },
  { id: "SUP-4096", title: "Support Ticket - IT Request", status: "review", type: "Support" },
];

const ContextualDrawerPattern = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DrawerContent | null>(null);
  const [activeTab, setActiveTab] = useState("summary");

  const handleOpenDrawer = (item: DrawerContent) => {
    setSelectedItem(item);
    setIsDrawerOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "Pending", variant: "secondary" },
      approved: { label: "Approved", variant: "default" },
      rejected: { label: "Rejected", variant: "destructive" },
      review: { label: "In Review", variant: "outline" },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Back Button */}
        <Link to="/">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Overview
          </Button>
        </Link>

        {/* Header */}
        <header className="border-b border-border bg-card px-8 py-6">
          <h1 className="text-2xl font-bold text-foreground">
            Contextual Drawer Pattern
          </h1>
          <p className="text-muted-foreground mt-1">
            Right-side panel for detailed views and actions
          </p>
        </header>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Click any item to open the contextual drawer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                This pattern demonstrates a slide-in panel that provides focused context without leaving the main view.
                Perfect for contracts, payroll previews, support tickets, and audit details.
              </p>
            </CardContent>
          </Card>

          {/* Sample Data Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sampleData.map((item) => {
              const Icon = item.type === "Payroll" ? DollarSign 
                : item.type === "Contract" ? FileText 
                : item.type === "Compliance" ? CheckCircle2 
                : AlertCircle;

              return (
                <Card
                  key={item.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover-scale"
                  onClick={() => handleOpenDrawer(item)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{item.title}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">{item.id}</p>
                        </div>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contextual Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="w-full sm:max-w-[540px] overflow-y-auto">
          {selectedItem && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2 flex-wrap">
                  <SheetTitle className="text-xl">{selectedItem.title}</SheetTitle>
                  {getStatusBadge(selectedItem.status)}
                </div>
                <SheetDescription className="mt-1">
                  Reference: {selectedItem.id}
                </SheetDescription>
              </SheetHeader>

              <Separator className="my-4" />

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="files">Files</TabsTrigger>
                  <TabsTrigger value="comments">Comments</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <Label className="text-sm text-muted-foreground">Type</Label>
                      <p className="font-medium mt-1">{selectedItem.type}</p>
                    </div>
                    
                    <div className="bg-muted/50 rounded-lg p-4">
                      <Label className="text-sm text-muted-foreground">Status</Label>
                      <p className="font-medium mt-1 capitalize">{selectedItem.status}</p>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <Label className="text-sm text-muted-foreground">Created</Label>
                      <p className="font-medium mt-1">January 15, 2024</p>
                    </div>

                    {selectedItem.type === "Payroll" && (
                      <div className="space-y-2">
                        <Label>Breakdown</Label>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Item</TableHead>
                              <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell>Base Salary</TableCell>
                              <TableCell className="text-right">$5,000.00</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Bonus</TableCell>
                              <TableCell className="text-right">$1,200.00</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Deductions</TableCell>
                              <TableCell className="text-right">-$850.00</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-bold">Total</TableCell>
                              <TableCell className="text-right font-bold">$5,350.00</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="files" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    {[
                      { name: "contract_signed.pdf", size: "2.4 MB" },
                      { name: "employee_id.jpg", size: "1.8 MB" },
                      { name: "payroll_summary.xlsx", size: "156 KB" },
                    ].map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium text-sm">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{file.size}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="comments" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <div className="space-y-3">
                      {[
                        {
                          author: "John Smith",
                          time: "2 hours ago",
                          text: "Please review the updated terms in section 3.",
                        },
                        {
                          author: "Sarah Johnson",
                          time: "1 day ago",
                          text: "Approved pending final compliance check.",
                        },
                      ].map((comment, index) => (
                        <div key={index} className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-sm">{comment.author}</p>
                            <p className="text-xs text-muted-foreground">{comment.time}</p>
                          </div>
                          <p className="text-sm">{comment.text}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newComment">Add Comment</Label>
                      <Textarea
                        id="newComment"
                        placeholder="Type your comment here..."
                        rows={3}
                      />
                      <Button size="sm">Post Comment</Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <SheetFooter className="flex flex-row gap-2 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => setIsDrawerOpen(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Close
                </Button>
                <Button variant="outline" className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button className="flex-1">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ContextualDrawerPattern;
