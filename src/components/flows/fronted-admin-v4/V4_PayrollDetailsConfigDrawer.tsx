/**
 * Flow 1 – Fronted Admin Dashboard v4 Only
 * Payroll Details Configuration Drawer
 * 
 * Opens from "Collect Payroll Details" column cards
 * Allows admin to configure which payroll fields the candidate will complete
 * Includes custom field creation for additional payroll questions
 */

import React, { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Shield, Building2, CreditCard, Phone, Calendar, User, Plus, MoreVertical, Pencil, Trash2, GripVertical, FileText, Hash, CalendarDays, List, Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface V4_Candidate {
  id: string;
  name: string;
  country: string;
  countryFlag: string;
  role: string;
  salary: string;
  email?: string;
  startDate?: string;
  employmentType?: "contractor" | "employee";
}

export interface PayrollFieldConfig {
  id: string;
  label: string;
  required: boolean;
  enabled: boolean;
  helperText?: string;
}

export type CustomFieldType = "short_text" | "long_text" | "number" | "date" | "single_select" | "file_upload";

export interface CustomPayrollField {
  id: string;
  label: string;
  type: CustomFieldType;
  required: boolean;
  enabled: boolean;
  options?: string[]; // For single_select type
}

interface V4_PayrollDetailsConfigDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: V4_Candidate | null;
  onSave: (candidateId: string, config: PayrollFieldConfig[], customFields: CustomPayrollField[]) => void;
  initialCustomFields?: CustomPayrollField[];
}

const DEFAULT_FIELD_CONFIG: PayrollFieldConfig[] = [
  { id: "bank_country", label: "Bank Country", required: true, enabled: true, helperText: "Country where bank account is held" },
  { id: "bank_name", label: "Bank Name", required: true, enabled: true },
  { id: "account_holder_name", label: "Account Holder Name", required: true, enabled: true },
  { id: "account_number", label: "Account Number / IBAN", required: true, enabled: true },
  { id: "swift_bic", label: "SWIFT / BIC Code", required: false, enabled: true, helperText: "Required for international transfers" },
  { id: "routing_code", label: "Routing / Branch Code", required: false, enabled: true, helperText: "May be required depending on country" },
  { id: "pay_frequency", label: "Pay Frequency", required: false, enabled: true, helperText: "Read-only if set in contract" },
  { id: "emergency_contact_name", label: "Emergency Contact Name", required: false, enabled: true },
  { id: "emergency_contact_phone", label: "Emergency Contact Phone", required: false, enabled: true },
];

const FIELD_TYPE_LABELS: Record<CustomFieldType, string> = {
  short_text: "Short text",
  long_text: "Long text",
  number: "Number",
  date: "Date",
  single_select: "Dropdown",
  file_upload: "File upload",
};

const FIELD_TYPE_ICONS: Record<CustomFieldType, React.ElementType> = {
  short_text: FileText,
  long_text: FileText,
  number: Hash,
  date: CalendarDays,
  single_select: List,
  file_upload: Upload,
};

export const V4_PayrollDetailsConfigDrawer: React.FC<V4_PayrollDetailsConfigDrawerProps> = ({
  open,
  onOpenChange,
  candidate,
  onSave,
  initialCustomFields = [],
}) => {
  const [fieldConfig, setFieldConfig] = useState<PayrollFieldConfig[]>(DEFAULT_FIELD_CONFIG);
  const [customFields, setCustomFields] = useState<CustomPayrollField[]>(initialCustomFields);
  
  // Modal states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomPayrollField | null>(null);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [fieldToRemove, setFieldToRemove] = useState<CustomPayrollField | null>(null);
  
  // Form state for add/edit modal
  const [formFieldName, setFormFieldName] = useState("");
  const [formFieldType, setFormFieldType] = useState<CustomFieldType>("short_text");
  const [formFieldRequired, setFormFieldRequired] = useState(true);
  const [formFieldEnabled, setFormFieldEnabled] = useState(true);
  const [formFieldOptions, setFormFieldOptions] = useState<string[]>([""]);

  // Reset custom fields when candidate changes
  useEffect(() => {
    if (candidate) {
      setCustomFields(initialCustomFields);
    }
  }, [candidate?.id, initialCustomFields]);

  const handleToggleEnabled = (fieldId: string) => {
    setFieldConfig(prev => 
      prev.map(field => 
        field.id === fieldId ? { ...field, enabled: !field.enabled } : field
      )
    );
  };

  const handleToggleRequired = (fieldId: string) => {
    setFieldConfig(prev => 
      prev.map(field => 
        field.id === fieldId ? { ...field, required: !field.required } : field
      )
    );
  };

  const handleCustomFieldToggleEnabled = (fieldId: string) => {
    setCustomFields(prev => 
      prev.map(field => 
        field.id === fieldId ? { ...field, enabled: !field.enabled } : field
      )
    );
  };

  const handleCustomFieldToggleRequired = (fieldId: string) => {
    setCustomFields(prev => 
      prev.map(field => 
        field.id === fieldId ? { ...field, required: !field.required } : field
      )
    );
  };

  const handleSave = () => {
    if (!candidate) return;
    onSave(candidate.id, fieldConfig, customFields);
    toast.success("Payroll form configuration saved");
    onOpenChange(false);
  };

  const handleCancel = () => {
    setFieldConfig(DEFAULT_FIELD_CONFIG);
    setCustomFields(initialCustomFields);
    onOpenChange(false);
  };

  // Add/Edit Modal Handlers
  const openAddModal = () => {
    setEditingField(null);
    setFormFieldName("");
    setFormFieldType("short_text");
    setFormFieldRequired(true);
    setFormFieldEnabled(true);
    setFormFieldOptions([""]);
    setIsAddEditModalOpen(true);
  };

  const openEditModal = (field: CustomPayrollField) => {
    setEditingField(field);
    setFormFieldName(field.label);
    setFormFieldType(field.type);
    setFormFieldRequired(field.required);
    setFormFieldEnabled(field.enabled);
    setFormFieldOptions(field.options && field.options.length > 0 ? field.options : [""]);
    setIsAddEditModalOpen(true);
  };

  const handleSaveField = () => {
    if (!formFieldName.trim()) return;

    const filteredOptions = formFieldType === "single_select" 
      ? formFieldOptions.filter(opt => opt.trim() !== "")
      : undefined;

    if (editingField) {
      // Update existing field
      setCustomFields(prev => 
        prev.map(f => 
          f.id === editingField.id 
            ? { ...f, label: formFieldName.trim(), type: formFieldType, required: formFieldRequired, enabled: formFieldEnabled, options: filteredOptions }
            : f
        )
      );
      toast.success("Custom field updated");
    } else {
      // Add new field
      const newField: CustomPayrollField = {
        id: `custom_${Date.now()}`,
        label: formFieldName.trim(),
        type: formFieldType,
        required: formFieldRequired,
        enabled: formFieldEnabled,
        options: filteredOptions,
      };
      setCustomFields(prev => [...prev, newField]);
      toast.success("Custom field added");
    }
    
    setIsAddEditModalOpen(false);
  };

  const handleAddOption = () => {
    setFormFieldOptions(prev => [...prev, ""]);
  };

  const handleOptionChange = (index: number, value: string) => {
    setFormFieldOptions(prev => prev.map((opt, i) => i === index ? value : opt));
  };

  const handleRemoveOption = (index: number) => {
    if (formFieldOptions.length > 1) {
      setFormFieldOptions(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Remove field handlers
  const openRemoveDialog = (field: CustomPayrollField) => {
    setFieldToRemove(field);
    setIsRemoveDialogOpen(true);
  };

  const confirmRemoveField = () => {
    if (fieldToRemove) {
      setCustomFields(prev => prev.filter(f => f.id !== fieldToRemove.id));
      toast.success("Custom field removed");
    }
    setIsRemoveDialogOpen(false);
    setFieldToRemove(null);
  };

  if (!candidate) return null;

  const isFormValid = formFieldName.trim() !== "" && formFieldType !== undefined;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-base">Configure Payroll Details Form</SheetTitle>
          </SheetHeader>

          {/* Candidate Summary (read-only) */}
          <Card className="mt-6 border-border/40 bg-muted/30">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{candidate.countryFlag}</span>
                <div>
                  <p className="font-semibold text-foreground">{candidate.name}</p>
                  <p className="text-sm text-muted-foreground">{candidate.role}</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Country</p>
                  <p className="font-medium">{candidate.country}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Salary</p>
                  <p className="font-medium">{candidate.salary}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Employment Type</p>
                  <p className="font-medium capitalize">{candidate.employmentType || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Start Date</p>
                  <p className="font-medium">{candidate.startDate || "TBD"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Badge */}
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-4 w-4 text-primary" />
            <span>GDPR & {candidate.country} Payment Regulations Compliant</span>
          </div>

          {/* Field Configuration */}
          <div className="mt-6 space-y-6">
            {/* Bank Details Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <Label className="text-sm font-semibold">Bank Details</Label>
              </div>
              <div className="space-y-3">
                {fieldConfig.filter(f => f.id.startsWith("bank") || f.id.startsWith("account") || f.id.startsWith("swift") || f.id.startsWith("routing")).map(field => (
                  <div key={field.id} className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-card/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{field.label}</span>
                        {field.required && field.enabled && (
                          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">Required</Badge>
                        )}
                      </div>
                      {field.helperText && (
                        <p className="text-xs text-muted-foreground mt-1">{field.helperText}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">Required</span>
                        <Switch 
                          checked={field.required} 
                          onCheckedChange={() => handleToggleRequired(field.id)}
                          disabled={!field.enabled}
                          className="scale-75"
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">Show</span>
                        <Switch 
                          checked={field.enabled} 
                          onCheckedChange={() => handleToggleEnabled(field.id)}
                          className="scale-75"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Pay Frequency Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <Label className="text-sm font-semibold">Pay Frequency</Label>
              </div>
              <div className="space-y-3">
                {fieldConfig.filter(f => f.id === "pay_frequency").map(field => (
                  <div key={field.id} className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-card/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{field.label}</span>
                        {field.required && field.enabled && (
                          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">Required</Badge>
                        )}
                      </div>
                      {field.helperText && (
                        <p className="text-xs text-muted-foreground mt-1">{field.helperText}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">Required</span>
                        <Switch 
                          checked={field.required} 
                          onCheckedChange={() => handleToggleRequired(field.id)}
                          disabled={!field.enabled}
                          className="scale-75"
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">Show</span>
                        <Switch 
                          checked={field.enabled} 
                          onCheckedChange={() => handleToggleEnabled(field.id)}
                          className="scale-75"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Emergency Contact Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <Label className="text-sm font-semibold">Emergency Contact (Optional)</Label>
              </div>
              <div className="space-y-3">
                {fieldConfig.filter(f => f.id.startsWith("emergency")).map(field => (
                  <div key={field.id} className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-card/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{field.label}</span>
                        {field.required && field.enabled && (
                          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">Required</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">Required</span>
                        <Switch 
                          checked={field.required} 
                          onCheckedChange={() => handleToggleRequired(field.id)}
                          disabled={!field.enabled}
                          className="scale-75"
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">Show</span>
                        <Switch 
                          checked={field.enabled} 
                          onCheckedChange={() => handleToggleEnabled(field.id)}
                          className="scale-75"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Additional Payroll Fields Section (Custom Fields) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" />
                <Label className="text-sm font-semibold">Additional Payroll Fields</Label>
              </div>
              <p className="text-xs text-muted-foreground -mt-2">
                Use this to ask for extra payroll details only. Contract or personal info is already collected elsewhere.
              </p>

              {customFields.length === 0 ? (
                /* Empty state */
                <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-6 text-center">
                  <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Plus className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">No additional fields yet</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Add extra questions if you need more payroll details from this worker.
                  </p>
                  <Button size="sm" onClick={openAddModal} className="gap-1.5">
                    <Plus className="h-3.5 w-3.5" />
                    Add custom field
                  </Button>
                </div>
              ) : (
                /* Non-empty state */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Custom fields for this payroll form</span>
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs gap-1" onClick={openAddModal}>
                      <Plus className="h-3 w-3" />
                      Add custom field
                    </Button>
                  </div>
                  {customFields.map((field) => {
                    const TypeIcon = FIELD_TYPE_ICONS[field.type];
                    return (
                      <div key={field.id} className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-card/50">
                        <div className="flex items-center gap-3 flex-1">
                          <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium truncate">{field.label}</span>
                              {field.required && field.enabled && (
                                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary shrink-0">Required</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <TypeIcon className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{FIELD_TYPE_LABELS[field.type]}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground">Required</span>
                            <Switch 
                              checked={field.required} 
                              onCheckedChange={() => handleCustomFieldToggleRequired(field.id)}
                              disabled={!field.enabled}
                              className="scale-75"
                            />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground">Show</span>
                            <Switch 
                              checked={field.enabled} 
                              onCheckedChange={() => handleCustomFieldToggleEnabled(field.id)}
                              className="scale-75"
                            />
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover border-border">
                              <DropdownMenuItem onClick={() => openEditModal(field)} className="gap-2 cursor-pointer">
                                <Pencil className="h-3.5 w-3.5" />
                                Edit field
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => openRemoveDialog(field)} 
                                className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Remove field
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <SheetFooter className="mt-8 gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save & Close
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Add/Edit Custom Field Modal */}
      <Dialog open={isAddEditModalOpen} onOpenChange={setIsAddEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingField ? "Edit custom payroll field" : "Add custom payroll field"}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Configure a custom field that will appear on the worker's payroll details form.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Field Name */}
            <div className="space-y-2">
              <Label htmlFor="fieldName" className="text-sm">Field name</Label>
              <Input 
                id="fieldName"
                placeholder="e.g. Local tax ID, Preferred payout day"
                value={formFieldName}
                onChange={(e) => setFormFieldName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Shown as the field label to the worker.</p>
            </div>

            {/* Field Type */}
            <div className="space-y-2">
              <Label className="text-sm">Field type</Label>
              <Select value={formFieldType} onValueChange={(v) => setFormFieldType(v as CustomFieldType)}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="short_text">Short text</SelectItem>
                  <SelectItem value="long_text">Long text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="single_select">Single select (Dropdown)</SelectItem>
                  <SelectItem value="file_upload">File upload</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Options for Single Select */}
            {formFieldType === "single_select" && (
              <div className="space-y-2">
                <Label className="text-sm">Options</Label>
                <div className="space-y-2">
                  {formFieldOptions.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input 
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="flex-1"
                      />
                      {formFieldOptions.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 shrink-0"
                          onClick={() => handleRemoveOption(index)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={handleAddOption} className="gap-1.5">
                    <Plus className="h-3.5 w-3.5" />
                    Add option
                  </Button>
                </div>
              </div>
            )}

            {/* Toggles */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/30">
              <div>
                <p className="text-sm font-medium">Required field</p>
                <p className="text-xs text-muted-foreground">Worker must fill this field to submit</p>
              </div>
              <Switch checked={formFieldRequired} onCheckedChange={setFormFieldRequired} />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/30">
              <div>
                <p className="text-sm font-medium">Show on worker form</p>
                <p className="text-xs text-muted-foreground">Field will be visible to the worker</p>
              </div>
              <Switch checked={formFieldEnabled} onCheckedChange={setFormFieldEnabled} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveField} disabled={!isFormValid}>
              Save field
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Field Confirmation Dialog */}
      <AlertDialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove custom field?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove this field from the payroll details form for this worker. 
              Previously submitted responses (if any) will remain in their history but can't be edited via this form.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmRemoveField}
              className="bg-destructive hover:bg-destructive/90"
            >
              Remove field
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default V4_PayrollDetailsConfigDrawer;
