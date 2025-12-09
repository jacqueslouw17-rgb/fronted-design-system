/**
 * Flow 1 – Fronted Admin Dashboard v4 Only
 * Payroll Details Configuration Drawer
 * 
 * Opens from "Collect Payroll Details" column cards
 * Allows admin to configure which payroll fields the candidate will complete
 * Includes custom field creation for additional payroll questions
 * Includes "Filled by" control matching Configure Onboarding Details Form pattern
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Shield, Building2, CreditCard, Phone, Calendar, User, Plus, MoreVertical, Pencil, Trash2, GripVertical, FileText, Hash, CalendarDays, List, Upload, Database, Edit3 } from "lucide-react";
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
  hasATSData?: boolean;
}

export type FilledBySource = "candidate" | "prefilled";

export interface PayrollFieldConfig {
  id: string;
  label: string;
  required: boolean;
  enabled: boolean;
  helperText?: string;
  filledBy: FilledBySource;
  adminValue?: string; // Value entered by admin when filledBy is "prefilled"
}

export type CustomFieldType = "short_text" | "long_text" | "number" | "date" | "single_select" | "file_upload";

export interface CustomPayrollField {
  id: string;
  label: string;
  type: CustomFieldType;
  required: boolean;
  enabled: boolean;
  options?: string[];
  filledBy: FilledBySource;
  adminValue?: string; // Value entered by admin when filledBy is "prefilled"
}

export interface PayrollConfig {
  baseFields: PayrollFieldConfig[];
  customFields: CustomPayrollField[];
}

interface V4_PayrollDetailsConfigDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: V4_Candidate | null;
  onSave: (candidateId: string, config: PayrollConfig) => void;
  initialConfig?: PayrollConfig;
  initialCustomFields?: CustomPayrollField[];
}

const DEFAULT_FIELD_CONFIG: PayrollFieldConfig[] = [
  { id: "bank_country", label: "Bank Country", required: true, enabled: true, helperText: "Country where bank account is held", filledBy: "candidate" },
  { id: "bank_name", label: "Bank Name", required: true, enabled: true, filledBy: "candidate" },
  { id: "account_holder_name", label: "Account Holder Name", required: true, enabled: true, filledBy: "candidate" },
  { id: "account_number", label: "Account Number / IBAN", required: true, enabled: true, filledBy: "candidate" },
  { id: "swift_bic", label: "SWIFT / BIC Code", required: false, enabled: true, helperText: "Required for international transfers", filledBy: "candidate" },
  { id: "routing_code", label: "Routing / Branch Code", required: false, enabled: true, helperText: "May be required depending on country", filledBy: "candidate" },
  { id: "pay_frequency", label: "Pay Frequency", required: false, enabled: true, helperText: "Read-only if set in contract", filledBy: "candidate" },
  { id: "emergency_contact_name", label: "Emergency Contact Name", required: false, enabled: true, filledBy: "candidate" },
  { id: "emergency_contact_phone", label: "Emergency Contact Phone", required: false, enabled: true, filledBy: "candidate" },
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
  initialConfig,
  initialCustomFields = [],
}) => {
  const [fieldConfig, setFieldConfig] = useState<PayrollFieldConfig[]>(() => {
    const baseFields = initialConfig?.baseFields;
    return (baseFields && baseFields.length > 0) ? baseFields : DEFAULT_FIELD_CONFIG;
  });
  const [customFields, setCustomFields] = useState<CustomPayrollField[]>(
    initialConfig?.customFields || initialCustomFields.map(f => ({ ...f, filledBy: f.filledBy || "candidate" }))
  );
  
  // Modal states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomPayrollField | null>(null);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [fieldToRemove, setFieldToRemove] = useState<CustomPayrollField | null>(null);
  
  // Drag and drop state
  const [draggedFieldId, setDraggedFieldId] = useState<string | null>(null);
  const [dragOverFieldId, setDragOverFieldId] = useState<string | null>(null);
  
  // Form state for add/edit modal
  const [formFieldName, setFormFieldName] = useState("");
  const [formFieldType, setFormFieldType] = useState<CustomFieldType>("short_text");
  const [formFieldRequired, setFormFieldRequired] = useState(true);
  const [formFieldEnabled, setFormFieldEnabled] = useState(true);
  const [formFieldOptions, setFormFieldOptions] = useState<string[]>([""]);
  const [formFieldFilledBy, setFormFieldFilledBy] = useState<FilledBySource>("candidate");

  // Check if candidate has ATS data
  const hasATSProfile = candidate?.hasATSData ?? false;

  // Reset fields only when candidate changes
  useEffect(() => {
    if (candidate) {
      const baseFields = initialConfig?.baseFields;
      setFieldConfig((baseFields && baseFields.length > 0) ? baseFields : DEFAULT_FIELD_CONFIG);
      setCustomFields(initialConfig?.customFields || initialCustomFields.map(f => ({ ...f, filledBy: f.filledBy || "candidate" })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidate?.id]);

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

  const handleFilledByChange = (fieldId: string, filledBy: FilledBySource) => {
    setFieldConfig(prev => 
      prev.map(field => {
        if (field.id === fieldId) {
          // If changing to prefilled, automatically disable "Show" toggle
          return { 
            ...field, 
            filledBy,
            enabled: filledBy === "prefilled" ? false : field.enabled 
          };
        }
        return field;
      })
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

  const handleCustomFieldFilledByChange = (fieldId: string, filledBy: FilledBySource) => {
    setCustomFields(prev => 
      prev.map(field => {
        if (field.id === fieldId) {
          return { 
            ...field, 
            filledBy,
            enabled: filledBy === "prefilled" ? false : field.enabled 
          };
        }
        return field;
      })
    );
  };

  const handleSave = () => {
    if (!candidate) return;
    onSave(candidate.id, { baseFields: fieldConfig, customFields });
    toast.success("Payroll form configuration saved");
    onOpenChange(false);
  };

  const handleCancel = () => {
    setFieldConfig(initialConfig?.baseFields || DEFAULT_FIELD_CONFIG);
    setCustomFields(initialConfig?.customFields || initialCustomFields.map(f => ({ ...f, filledBy: f.filledBy || "candidate" })));
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
    setFormFieldFilledBy("candidate");
    setIsAddEditModalOpen(true);
  };

  const openEditModal = (field: CustomPayrollField) => {
    setEditingField(field);
    setFormFieldName(field.label);
    setFormFieldType(field.type);
    setFormFieldRequired(field.required);
    setFormFieldEnabled(field.enabled);
    setFormFieldOptions(field.options && field.options.length > 0 ? field.options : [""]);
    setFormFieldFilledBy(field.filledBy || "candidate");
    setIsAddEditModalOpen(true);
  };

  const handleSaveField = () => {
    if (!formFieldName.trim()) return;

    const filteredOptions = formFieldType === "single_select" 
      ? formFieldOptions.filter(opt => opt.trim() !== "")
      : undefined;

    // If prefilled, ensure enabled is false
    const effectiveEnabled = formFieldFilledBy === "prefilled" ? false : formFieldEnabled;

    if (editingField) {
      // Update existing field
      setCustomFields(prev => 
        prev.map(f => 
          f.id === editingField.id 
            ? { ...f, label: formFieldName.trim(), type: formFieldType, required: formFieldRequired, enabled: effectiveEnabled, options: filteredOptions, filledBy: formFieldFilledBy }
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
        enabled: effectiveEnabled,
        options: filteredOptions,
        filledBy: formFieldFilledBy,
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

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, fieldId: string) => {
    e.dataTransfer.setData("text/plain", fieldId);
    e.dataTransfer.effectAllowed = "move";
    setDraggedFieldId(fieldId);
  };

  const handleDragOver = (e: React.DragEvent, fieldId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (fieldId !== draggedFieldId) {
      setDragOverFieldId(fieldId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverFieldId(null);
  };

  const handleDrop = (e: React.DragEvent, targetFieldId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const draggedId = e.dataTransfer.getData("text/plain") || draggedFieldId;
    
    if (!draggedId || draggedId === targetFieldId) {
      setDraggedFieldId(null);
      setDragOverFieldId(null);
      return;
    }

    const draggedIndex = customFields.findIndex(f => f.id === draggedId);
    const targetIndex = customFields.findIndex(f => f.id === targetFieldId);
    
    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedFieldId(null);
      setDragOverFieldId(null);
      return;
    }
    
    const newFields = [...customFields];
    const [draggedField] = newFields.splice(draggedIndex, 1);
    newFields.splice(targetIndex, 0, draggedField);
    
    setCustomFields(newFields);
    setDraggedFieldId(null);
    setDragOverFieldId(null);
  };

  const handleDragEnd = () => {
    setDraggedFieldId(null);
    setDragOverFieldId(null);
  };

  if (!candidate) return null;

  const isFormValid = formFieldName.trim() !== "" && formFieldType !== undefined;

  // Handle admin value change
  const handleAdminValueChange = (fieldId: string, value: string) => {
    setFieldConfig(prev => 
      prev.map(field => 
        field.id === fieldId ? { ...field, adminValue: value } : field
      )
    );
  };

  const handleCustomFieldAdminValueChange = (fieldId: string, value: string) => {
    setCustomFields(prev => 
      prev.map(field => 
        field.id === fieldId ? { ...field, adminValue: value } : field
      )
    );
  };

  // Render field row with "Filled by" control
  const renderFieldRow = (field: PayrollFieldConfig) => {
    return (
      <div key={field.id} className="flex items-start justify-between p-3 rounded-lg border border-border/40 bg-card/50">
        <div className="flex-1 min-w-0 pr-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{field.label}</span>
            {field.required && (
              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">Required</Badge>
            )}
          </div>
          
          {field.helperText && (
            <p className="text-xs text-muted-foreground mt-1">{field.helperText}</p>
          )}
          
          {/* Filled by selector */}
          <div className="mt-2">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[11px] text-muted-foreground font-medium">Filled by</span>
            </div>
            <div className="inline-flex rounded-md border border-border/60 bg-muted/30 p-0.5">
              <button
                type="button"
                onClick={() => handleFilledByChange(field.id, "candidate")}
                className={cn(
                  "px-2 py-1 text-[11px] font-medium rounded-sm transition-all",
                  field.filledBy === "candidate" 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Worker form
              </button>
              <button
                type="button"
                onClick={() => handleFilledByChange(field.id, "prefilled")}
                className={cn(
                  "px-2 py-1 text-[11px] font-medium rounded-sm transition-all",
                  field.filledBy === "prefilled" 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Pre-filled by admin
              </button>
            </div>
            
            {/* Helper text and admin input based on selection */}
            {field.filledBy === "candidate" ? (
              <p className="text-[10px] text-muted-foreground mt-1.5">
                To be filled by worker
              </p>
            ) : (
              <div className="mt-1.5 space-y-2">
                <p className="text-[10px] text-muted-foreground">
                  Not shown on worker form. Pre-filled in Fronted by an admin.
                </p>
                <Input
                  placeholder={`Admin value for ${field.label}`}
                  value={field.adminValue || ""}
                  onChange={(e) => handleAdminValueChange(field.id, e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Required</span>
            <Switch 
              checked={field.required} 
              onCheckedChange={() => handleToggleRequired(field.id)}
              className="scale-75"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Show</span>
            <Switch 
              checked={field.enabled} 
              onCheckedChange={() => handleToggleEnabled(field.id)}
              disabled={field.filledBy === "prefilled"}
              className="scale-75"
            />
          </div>
        </div>
      </div>
    );
  };

  // Render custom field row with "Filled by" control
  const renderCustomFieldRow = (field: CustomPayrollField) => {
    const TypeIcon = FIELD_TYPE_ICONS[field.type];
    const isDragging = draggedFieldId === field.id;
    const isDragOver = dragOverFieldId === field.id;
    
    return (
      <div 
        key={field.id} 
        draggable
        onDragStart={(e) => handleDragStart(e, field.id)}
        onDragOver={(e) => handleDragOver(e, field.id)}
        onDragLeave={(e) => handleDragLeave(e)}
        onDrop={(e) => handleDrop(e, field.id)}
        onDragEnd={handleDragEnd}
        className={cn(
          "flex items-start justify-between p-3 rounded-lg border bg-card/50 transition-all",
          isDragging && "opacity-50 border-primary/50 bg-primary/5",
          isDragOver && "border-primary border-dashed bg-primary/10",
          !isDragging && !isDragOver && "border-border/40"
        )}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab active:cursor-grabbing mt-1 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium truncate">{field.label}</span>
              {field.required && (
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary shrink-0">Required</Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <TypeIcon className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{FIELD_TYPE_LABELS[field.type]}</span>
            </div>
            
            {/* Filled by selector */}
            <div className="mt-2">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[11px] text-muted-foreground font-medium">Filled by</span>
              </div>
              <div className="inline-flex rounded-md border border-border/60 bg-muted/30 p-0.5">
                <button
                  type="button"
                  onClick={() => handleCustomFieldFilledByChange(field.id, "candidate")}
                  className={cn(
                    "px-2 py-1 text-[11px] font-medium rounded-sm transition-all",
                    field.filledBy === "candidate" 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Worker form
                </button>
                <button
                  type="button"
                  onClick={() => handleCustomFieldFilledByChange(field.id, "prefilled")}
                  className={cn(
                    "px-2 py-1 text-[11px] font-medium rounded-sm transition-all",
                    field.filledBy === "prefilled" 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Pre-filled by admin
                </button>
              </div>
              
              {/* Helper text and admin input based on selection */}
              {field.filledBy === "candidate" ? (
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  To be filled by worker
                </p>
              ) : (
                <div className="mt-1.5 space-y-2">
                  <p className="text-[10px] text-muted-foreground">
                    Not shown on worker form. Pre-filled in Fronted by an admin.
                  </p>
                  <Input
                    placeholder={`Admin value for ${field.label}`}
                    value={field.adminValue || ""}
                    onChange={(e) => handleCustomFieldAdminValueChange(field.id, e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Required</span>
            <Switch 
              checked={field.required} 
              onCheckedChange={() => handleCustomFieldToggleRequired(field.id)}
              className="scale-75"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Show</span>
            <Switch 
              checked={field.enabled} 
              onCheckedChange={() => handleCustomFieldToggleEnabled(field.id)}
              disabled={field.filledBy === "prefilled"}
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
  };

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
                {fieldConfig.filter(f => f.id.startsWith("bank") || f.id.startsWith("account") || f.id.startsWith("swift") || f.id.startsWith("routing")).map(renderFieldRow)}
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
                {fieldConfig.filter(f => f.id === "pay_frequency").map(renderFieldRow)}
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
                {fieldConfig.filter(f => f.id.startsWith("emergency")).map(renderFieldRow)}
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
                  {customFields.map(renderCustomFieldRow)}
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

            {/* Filled by control */}
            <div className="space-y-2">
              <Label className="text-sm">Filled by</Label>
              <div className="inline-flex rounded-md border border-border/60 bg-muted/30 p-0.5">
                <button
                  type="button"
                  onClick={() => setFormFieldFilledBy("candidate")}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-sm transition-all",
                    formFieldFilledBy === "candidate" 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Candidate form
                </button>
                <button
                  type="button"
                  onClick={() => setFormFieldFilledBy("prefilled")}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-sm transition-all",
                    formFieldFilledBy === "prefilled" 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Pre-filled (ATS / admin)
                </button>
              </div>
              {formFieldFilledBy === "prefilled" && (
                <p className="text-xs text-muted-foreground">
                  Not shown on worker form. Pre-filled from ATS or by an admin.
                </p>
              )}
            </div>

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
              <Switch 
                checked={formFieldFilledBy === "prefilled" ? false : formFieldEnabled} 
                onCheckedChange={setFormFieldEnabled}
                disabled={formFieldFilledBy === "prefilled"}
              />
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
