import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Clock,
  DollarSign,
  FileText,
  Shield,
  Calendar,
  TrendingUp,
  Edit,
  Info,
  } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface SmartTag {
  id: string;
  label: string;
  value: string;
  description: string;
  category: "payroll" | "compliance" | "contract" | "policy";
  isActive: boolean;
  lastEdited: string;
  editedBy: string;
  icon: typeof Clock;
}

const sampleTags: SmartTag[] = [
  {
    id: "1",
    label: "Max Overtime",
    value: "10 hrs/week",
    description: "Maximum overtime hours allowed per contractor per week",
    category: "payroll",
    isActive: true,
    lastEdited: "2024-01-15",
    editedBy: "Sarah Johnson",
    icon: Clock,
  },
  {
    id: "2",
    label: "FX Spread",
    value: "0.5%",
    description: "Fixed foreign exchange spread rate for international payments",
    category: "payroll",
    isActive: true,
    lastEdited: "2024-01-10",
    editedBy: "Michael Chen",
    icon: DollarSign,
  },
  {
    id: "3",
    label: "Paid Leaves",
    value: "24 days/year",
    description: "Annual paid leave days for all contractors",
    category: "policy",
    isActive: true,
    lastEdited: "2024-01-12",
    editedBy: "Emma Davis",
    icon: Calendar,
  },
  {
    id: "4",
    label: "IP Clause",
    value: "Required for tech roles",
    description: "Intellectual property clause mandatory for technology contractors",
    category: "contract",
    isActive: true,
    lastEdited: "2024-01-08",
    editedBy: "Legal Team",
    icon: FileText,
  },
  {
    id: "5",
    label: "ID Verification",
    value: "Must be valid",
    description: "Flag contractors with expired or missing identification documents",
    category: "compliance",
    isActive: true,
    lastEdited: "2024-01-14",
    editedBy: "Compliance Team",
    icon: Shield,
  },
  {
    id: "6",
    label: "Payment Buffer",
    value: "5 business days",
    description: "Minimum buffer time between approval and payment processing",
    category: "payroll",
    isActive: false,
    lastEdited: "2024-01-05",
    editedBy: "Finance Team",
    icon: TrendingUp,
  },
];

const SmartTagsPattern = () => {
  const { toast } = useToast();
  const [selectedTag, setSelectedTag] = useState<SmartTag | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [tags, setTags] = useState<SmartTag[]>(sampleTags);

  const handleTagClick = (tag: SmartTag) => {
    setSelectedTag(tag);
    setIsDrawerOpen(true);
  };

  const handleSaveRule = () => {
    if (selectedTag) {
      setTags(tags.map(t => t.id === selectedTag.id ? selectedTag : t));
      toast({
        title: "Rule Updated",
        description: `${selectedTag.label} has been updated successfully.`,
      });
      setIsDrawerOpen(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      payroll: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      compliance: "bg-green-500/10 text-green-500 border-green-500/20",
      contract: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      policy: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    };
    return colors[category] || "bg-muted text-muted-foreground";
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, typeof Clock> = {
      payroll: DollarSign,
      compliance: Shield,
      contract: FileText,
      policy: Calendar,
    };
    return icons[category] || Info;
  };

  const groupedTags = tags.reduce((acc, tag) => {
    if (!acc[tag.category]) {
      acc[tag.category] = [];
    }
    acc[tag.category].push(tag);
    return acc;
  }, {} as Record<string, SmartTag[]>);

  const SmartTagChip = ({ tag }: { tag: SmartTag }) => {
    const Icon = tag.icon;
    
    return (
      <TooltipProvider>
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={`cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md px-3 py-1.5 ${
                tag.isActive
                  ? getCategoryColor(tag.category)
                  : "bg-muted/50 text-muted-foreground opacity-50 border-dashed"
              }`}
              onClick={() => handleTagClick(tag)}
            >
              <Icon className="h-3 w-3 mr-1.5" />
              <span className="text-xs font-medium">{tag.label}: {tag.value}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p className="text-sm">{tag.description}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Last edited by {tag.editedBy} on {tag.lastEdited}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
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
      <header className="border-b border-border bg-card pl-16 pr-8 py-6">
        <h1 className="text-2xl font-bold text-foreground">
          Mini-Rules & Smart Tags
        </h1>
        <p className="text-muted-foreground mt-1">
          Dynamic, contextual logic chips for policies and automation
        </p>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-12 space-y-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{tags.filter(t => t.isActive).length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Payroll Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{tags.filter(t => t.category === "payroll").length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Compliance Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{tags.filter(t => t.category === "compliance").length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Contract Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{tags.filter(t => t.category === "contract").length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Grouped Tags by Category */}
        <div className="space-y-6">
          {Object.entries(groupedTags).map(([category, categoryTags]) => {
            const CategoryIcon = getCategoryIcon(category);
            
            return (
              <Card key={category}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getCategoryColor(category)}`}>
                      <CategoryIcon className="h-5 w-5" />
                    </div>
                    <CardTitle className="capitalize">{category} Rules</CardTitle>
                    <Badge variant="secondary" className="ml-auto">
                      {categoryTags.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {categoryTags.map((tag) => (
                      <SmartTagChip key={tag.id} tag={tag} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Example Usage Context */}
        <Card>
          <CardHeader>
            <CardTitle>Smart Tags in Context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2">Payroll Preview - John Smith</p>
              <div className="flex flex-wrap gap-2 mb-3">
                <SmartTagChip tag={tags[0]} />
                <SmartTagChip tag={tags[1]} />
              </div>
              <p className="text-xs text-muted-foreground">
                These rules automatically apply to this payroll calculation
              </p>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2">Contract Template - Tech Contractor</p>
              <div className="flex flex-wrap gap-2 mb-3">
                <SmartTagChip tag={tags[3]} />
                <SmartTagChip tag={tags[2]} />
              </div>
              <p className="text-xs text-muted-foreground">
                These clauses will be automatically included in the contract
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pattern Features */}
        <Card>
          <CardHeader>
            <CardTitle>Pattern Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 text-primary" />
                <span>Hover over any tag to see detailed description and audit info</span>
              </li>
              <li className="flex items-start gap-2">
                <Edit className="h-4 w-4 mt-0.5 text-primary" />
                <span>Click any tag to edit rule details in a side drawer</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 mt-0.5 text-primary" />
                <span>Rules are context-aware and appear where relevant</span>
              </li>
              <li className="flex items-start gap-2">
                <Calendar className="h-4 w-4 mt-0.5 text-primary" />
                <span>Inactive rules shown with dashed borders and reduced opacity</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>

      {/* Edit Rule Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="w-full sm:max-w-[440px]">
          {selectedTag && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <selectedTag.icon className="h-5 w-5 text-primary" />
                  <SheetTitle>{selectedTag.label}</SheetTitle>
                </div>
                <SheetDescription>
                  Modify this rule and it will automatically apply across the platform
                </SheetDescription>
              </SheetHeader>

              <Separator className="my-4" />

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="ruleValue">Rule Value</Label>
                  <Input
                    id="ruleValue"
                    value={selectedTag.value}
                    onChange={(e) =>
                      setSelectedTag({ ...selectedTag, value: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ruleDescription">Description</Label>
                  <textarea
                    id="ruleDescription"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedTag.description}
                    onChange={(e) =>
                      setSelectedTag({ ...selectedTag, description: e.target.value })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="ruleActive">Active Rule</Label>
                  <Switch
                    id="ruleActive"
                    checked={selectedTag.isActive}
                    onCheckedChange={(checked) =>
                      setSelectedTag({ ...selectedTag, isActive: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="space-y-1">
                  <p className="text-sm font-medium">Audit Information</p>
                  <p className="text-xs text-muted-foreground">
                    Last edited by {selectedTag.editedBy}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    on {selectedTag.lastEdited}
                  </p>
                </div>
              </div>

              <SheetFooter className="mt-6">
                <Button variant="outline" onClick={() => setIsDrawerOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveRule}>
                  Save Changes
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
      </div>
    </div>
  );
};

export default SmartTagsPattern;
