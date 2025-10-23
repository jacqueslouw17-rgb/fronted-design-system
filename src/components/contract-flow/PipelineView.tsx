import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Eye, Send, Settings, FileEdit, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Contractor {
  id: string;
  name: string;
  country: string;
  countryFlag: string;
  role: string;
  salary: string;
  status: "offer-accepted" | "data-pending" | "drafting" | "awaiting-signature" | "trigger-onboarding" | "onboarding-pending" | "certified";
  formSent?: boolean;
  dataReceived?: boolean;
}

interface PipelineViewProps {
  contractors: Contractor[];
  className?: string;
  onContractorUpdate?: (contractors: Contractor[]) => void;
  onDraftContract?: (contractorIds: string[]) => void;
}

const statusConfig = {
  "offer-accepted": {
    label: "Offer Accepted",
    color: "bg-muted/50 border-border",
    badgeColor: "bg-muted text-muted-foreground",
  },
  "data-pending": {
    label: "Data Collection Pending",
    color: "bg-accent-yellow-fill/30 border-accent-yellow-outline/20",
    badgeColor: "bg-accent-yellow-fill text-accent-yellow-text border-accent-yellow-outline/30",
  },
  "drafting": {
    label: "Contract Drafting",
    color: "bg-accent-blue-fill/30 border-accent-blue-outline/20",
    badgeColor: "bg-accent-blue-fill text-accent-blue-text border-accent-blue-outline/30",
  },
  "awaiting-signature": {
    label: "Awaiting Signature",
    color: "bg-accent-purple-fill/30 border-accent-purple-outline/20",
    badgeColor: "bg-accent-purple-fill text-accent-purple-text border-accent-purple-outline/30",
  },
  "trigger-onboarding": {
    label: "Trigger Onboarding",
    color: "bg-primary/10 border-primary/20",
    badgeColor: "bg-primary/20 text-primary border-primary/30",
  },
  "onboarding-pending": {
    label: "Onboarding Pending",
    color: "bg-primary/10 border-primary/20",
    badgeColor: "bg-primary/20 text-primary border-primary/30",
  },
  "certified": {
    label: "Certified ✅",
    color: "bg-accent-green-fill/30 border-accent-green-outline/20",
    badgeColor: "bg-accent-green-fill text-accent-green-text border-accent-green-outline/30",
  },
};

const columns = [
  "offer-accepted",
  "data-pending",
  "drafting",
  "awaiting-signature",
  "trigger-onboarding",
  "certified",
] as const;

export const PipelineView: React.FC<PipelineViewProps> = ({ 
  contractors: initialContractors, 
  className,
  onContractorUpdate,
  onDraftContract,
}) => {
  const [contractors, setContractors] = useState<Contractor[]>(initialContractors);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [configureDrawerOpen, setConfigureDrawerOpen] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  
  const getContractorsByStatus = (status: typeof columns[number]) => {
    return contractors.filter((c) => c.status === status);
  };

  const handleOpenConfigure = (contractor: Contractor) => {
    setSelectedContractor(contractor);
    setConfigureDrawerOpen(true);
  };

  const handleSelectAll = (status: typeof columns[number], checked: boolean) => {
    const statusContractors = getContractorsByStatus(status);
    const newSelected = new Set(selectedIds);
    
    if (checked) {
      statusContractors.forEach(c => newSelected.add(c.id));
    } else {
      statusContractors.forEach(c => newSelected.delete(c.id));
    }
    
    setSelectedIds(newSelected);
  };

  const handleSelectContractor = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSendForm = (contractorId: string) => {
    const updated = contractors.map(c => 
      c.id === contractorId 
        ? { ...c, status: "data-pending" as const, formSent: true }
        : c
    );
    setContractors(updated);
    onContractorUpdate?.(updated);
    
    const contractor = contractors.find(c => c.id === contractorId);
    toast.success(`Form sent to ${contractor?.name}`);
  };

  const handleBulkSendForms = () => {
    const selectedInOfferAccepted = contractors.filter(
      c => selectedIds.has(c.id) && c.status === "offer-accepted"
    );
    
    const updated = contractors.map(c => 
      selectedIds.has(c.id) && c.status === "offer-accepted"
        ? { ...c, status: "data-pending" as const, formSent: true }
        : c
    );
    
    setContractors(updated);
    onContractorUpdate?.(updated);
    setSelectedIds(new Set());
    
    toast.success(`Forms sent to ${selectedInOfferAccepted.length} candidates`);
  };

  const handleMarkDataReceived = (contractorId: string) => {
    const updated = contractors.map(c => 
      c.id === contractorId 
        ? { ...c, status: "drafting" as const, dataReceived: true }
        : c
    );
    setContractors(updated);
    onContractorUpdate?.(updated);
    
    const contractor = contractors.find(c => c.id === contractorId);
    toast.success(`${contractor?.name} is ready for contract drafting`);
  };

  const handleDraftContract = (contractorIds: string[]) => {
    onDraftContract?.(contractorIds);
  };

  const handleBulkDraft = () => {
    const selectedInDrafting = Array.from(selectedIds).filter(id => 
      contractors.find(c => c.id === id && c.status === "drafting")
    );
    
    if (selectedInDrafting.length > 0) {
      handleDraftContract(selectedInDrafting);
      setSelectedIds(new Set());
    }
  };

  // Check if all contractors in a status are selected
  const areAllSelected = (status: typeof columns[number]) => {
    const statusContractors = getContractorsByStatus(status);
    return statusContractors.length > 0 && statusContractors.every(c => selectedIds.has(c.id));
  };

  // Get count of selected in a status
  const getSelectedCount = (status: typeof columns[number]) => {
    return getContractorsByStatus(status).filter(c => selectedIds.has(c.id)).length;
  };

  return (
    <div className={cn("overflow-x-auto pb-4", className)}>
      <div className="flex gap-4 min-w-max">
        {columns.map((status) => {
          const config = statusConfig[status];
          const items = getContractorsByStatus(status);

          return (
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-shrink-0 w-[280px]"
            >
              {/* Column Header */}
              <div className={cn(
                "p-3 rounded-t-lg border-t border-x",
                config.color
              )}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    {/* Select All for data-pending and drafting columns */}
                    {(status === "offer-accepted" || status === "data-pending" || status === "drafting") && items.length > 0 && (
                      <Checkbox
                        checked={areAllSelected(status)}
                        onCheckedChange={(checked) => handleSelectAll(status, checked as boolean)}
                        className="h-4 w-4"
                      />
                    )}
                    <h3 className="font-medium text-sm text-foreground">
                      {config.label}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {getSelectedCount(status) > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {getSelectedCount(status)} selected
                      </span>
                    )}
                    <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {items.length}
                    </Badge>
                  </div>
                </div>
                
                {/* Bulk Actions */}
                {status === "offer-accepted" && getSelectedCount(status) > 0 && (
                  <div className="mt-2">
                    <Button 
                      size="sm" 
                      className="w-full text-xs h-7"
                      onClick={handleBulkSendForms}
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Send Forms ({getSelectedCount(status)})
                    </Button>
                  </div>
                )}
                
                {status === "drafting" && getSelectedCount(status) > 0 && (
                  <div className="mt-2">
                    <Button 
                      size="sm" 
                      className="w-full text-xs h-7"
                      onClick={handleBulkDraft}
                    >
                      <FileEdit className="h-3 w-3 mr-1" />
                      Draft Contracts ({getSelectedCount(status)})
                    </Button>
                  </div>
                )}
              </div>

              {/* Column Body */}
              <div className={cn(
                "min-h-[400px] p-3 space-y-3 border-x border-b rounded-b-lg",
                config.color
              )}>
                <AnimatePresence mode="popLayout">
                  {items.map((contractor, index) => (
                    <motion.div
                      key={contractor.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ 
                        layout: { duration: 0.5, type: "spring" },
                        opacity: { duration: 0.2 },
                        scale: { duration: 0.2 }
                      }}
                    >
                    <Card className="hover:shadow-card transition-shadow cursor-pointer">
                      <CardContent className="p-3 space-y-2">
                        {/* Contractor Header with Checkbox */}
                        <div className="flex items-start gap-2">
                          {(status === "offer-accepted" || status === "data-pending" || status === "drafting") && (
                            <Checkbox
                              checked={selectedIds.has(contractor.id)}
                              onCheckedChange={(checked) => handleSelectContractor(contractor.id, checked as boolean)}
                              className="h-4 w-4 mt-1"
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                          <Avatar className="h-8 w-8 bg-primary/10">
                            <AvatarFallback className="text-xs">
                              {contractor.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-sm text-foreground truncate">
                                {contractor.name}
                              </span>
                              <span className="text-base">{contractor.countryFlag}</span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {contractor.role}
                            </p>
                          </div>
                        </div>

                          {/* Details */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Salary</span>
                              <span className="font-medium text-foreground">{contractor.salary}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Country</span>
                              <span className="font-medium text-foreground">{contractor.country}</span>
                            </div>
                          </div>

                          {/* Action Buttons based on status */}
                          {status === "offer-accepted" && (
                            <div className="flex gap-2 pt-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 text-xs h-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenConfigure(contractor);
                                }}
                              >
                                <Settings className="h-3 w-3 mr-1" />
                                Configure
                              </Button>
                              <Button 
                                size="sm" 
                                className="flex-1 text-xs h-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSendForm(contractor.id);
                                }}
                              >
                                <Send className="h-3 w-3 mr-1" />
                                Send Form
                              </Button>
                            </div>
                          )}

                          {status === "data-pending" && (
                            <div className="space-y-2 pt-2">
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex-1 text-xs h-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toast.info(`Viewing form for ${contractor.name}`);
                                  }}
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View Form
                                </Button>
                                <Button 
                                  variant="outline"
                                  size="sm" 
                                  className="flex-1 text-xs h-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toast.success(`Resending form to ${contractor.name}`);
                                  }}
                                >
                                  <Send className="h-3 w-3 mr-1" />
                                  Resend
                                </Button>
                              </div>
                              <Button 
                                size="sm" 
                                className="w-full text-xs h-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkDataReceived(contractor.id);
                                }}
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Mark Data Received
                              </Button>
                            </div>
                          )}

                          {status === "drafting" && (
                            <div className="pt-2">
                              <Button 
                                size="sm" 
                                className="w-full text-xs h-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDraftContract([contractor.id]);
                                }}
                              >
                                <FileEdit className="h-3 w-3 mr-1" />
                                Draft Contract
                              </Button>
                            </div>
                          )}

                          {/* Onboarding Trigger - Special Card */}
                          {status === "trigger-onboarding" && (
                            <div className="pt-2 space-y-2">
                              <div className="text-xs text-foreground/80 bg-primary/5 p-2 rounded border border-primary/10">
                                Would you like me to start their onboarding checklist?
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  className="flex-1 text-xs h-8 bg-gradient-primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toast.success(`Starting onboarding for ${contractor.name}`);
                                  }}
                                >
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Yes, Start
                                </Button>
                                <Button 
                                  variant="outline"
                                  size="sm" 
                                  className="flex-1 text-xs h-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toast.info("You can start onboarding anytime");
                                  }}
                                >
                                  Later
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Status Badge for certified */}
                          {status === "certified" && (
                            <Badge 
                              variant="outline" 
                              className={cn("w-full justify-center text-xs", config.badgeColor)}
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              {config.label}
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Configuration Drawer */}
      <Drawer open={configureDrawerOpen} onOpenChange={setConfigureDrawerOpen}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>Configure Contract Details</DrawerTitle>
          </DrawerHeader>
          <div className="px-6 pb-6 overflow-y-auto">
            {selectedContractor && (
              <div className="space-y-6">
                {/* Contractor Header */}
                <div className="flex items-center gap-3 pb-4 border-b">
                  <span className="text-4xl">{selectedContractor.countryFlag}</span>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedContractor.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedContractor.role} • {selectedContractor.country}</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Legal Name</Label>
                    <Input defaultValue={selectedContractor.name} />
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" placeholder="Enter email" />
                  </div>

                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input defaultValue={selectedContractor.role} />
                  </div>

                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input type="date" />
                  </div>

                  <div className="space-y-2">
                    <Label>Monthly Salary / Compensation</Label>
                    <Input defaultValue={selectedContractor.salary} />
                  </div>

                  <div className="space-y-2">
                    <Label>Country of Employment</Label>
                    <Input defaultValue={selectedContractor.country} disabled />
                  </div>

                  <div className="space-y-2">
                    <Label>Work Location</Label>
                    <Input defaultValue="Remote" />
                  </div>

                  <div className="space-y-2">
                    <Label>Work Hours</Label>
                    <Input defaultValue="Flexible" />
                  </div>

                  <div className="space-y-2">
                    <Label>Social ID / Tax ID</Label>
                    <Input placeholder="Optional" />
                  </div>

                  <div className="space-y-2">
                    <Label>Employer Legal Entity</Label>
                    <Input defaultValue={selectedContractor.countryFlag === "🇵🇭" ? "Fronted PH" : "Fronted NO"} disabled />
                  </div>
                </div>

                {/* Additional Terms */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-sm font-medium">Additional Contract Terms</h3>
                  
                  <div className="space-y-2">
                    <Label>Optional Clauses</Label>
                    <Textarea
                      placeholder="Add any additional clauses or terms..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Variable Pay / Bonus Config</Label>
                      <Input placeholder="e.g., 10% annual bonus" />
                    </div>

                    <div className="space-y-2">
                      <Label>Payment Schedule</Label>
                      <Input defaultValue="Monthly" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Custom Attachments (NDA, Policies)</Label>
                    <Input placeholder="e.g., NDA, Company Policy Handbook" />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => setConfigureDrawerOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => {
                      toast.success(`Configuration saved for ${selectedContractor.name}`);
                      setConfigureDrawerOpen(false);
                    }}
                    className="flex-1"
                  >
                    Save Configuration
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};
