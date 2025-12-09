/**
 * Flow 1 – Fronted Admin Dashboard v4 Only
 * Candidate Details Configuration Drawer
 * 
 * Opens from "Offer Accepted" column cards via "Configure" button
 * Allows admin to configure which onboarding fields the candidate will complete
 * Includes custom field creation for additional onboarding questions
 * 
 * Sections:
 * 1. Data Source (ATS toggle controls)
 * 2. Identity & Documents (DOB, ID type, ID number)
 * 3. Tax & Residency (Tax residence country, Tax residence city/region)
 * 4. Address (Residential address, Nationality)
 * 5. Custom fields
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
import { Shield, FileText, MapPin, Globe, User, Plus, MoreVertical, Pencil, Trash2, GripVertical, Hash, CalendarDays, List, Upload, Database, Info, Lock, Eye, EyeOff } from "lucide-react";
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
export type EditabilityMode = "editable" | "readonly";

export interface OnboardingFieldConfig {
  id: string;
  label: string;
  section: "identity" | "tax" | "address";
  type: "text" | "date" | "select";
  required: boolean;
  enabled: boolean; // "Show" toggle
  helperText?: string;
  atsFieldName?: string;
  atsExampleValue?: string;
  filledBy: FilledBySource;
  adminValue?: string;
  editability?: EditabilityMode; // Only relevant when filledBy=prefilled AND enabled=true
}

export type CustomOnboardingFieldType = "short_text" | "long_text" | "number" | "date" | "single_select" | "file_upload";

export interface CustomOnboardingField {
  id: string;
  label: string;
  type: CustomOnboardingFieldType;
  required: boolean;
  enabled: boolean;
  options?: string[];
  filledBy: FilledBySource;
  adminValue?: string;
  editability?: EditabilityMode;
}

export interface OnboardingConfig {
  baseFields: OnboardingFieldConfig[];
  customFields: CustomOnboardingField[];
  useATSData?: boolean;
  allowCandidateEditATS?: boolean;
}

interface V4_ConfigureCandidateDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: V4_Candidate | null;
  onSave: (candidateId: string, config: OnboardingConfig) => void;
  initialConfig?: OnboardingConfig;
}

const DEFAULT_FIELD_CONFIG: OnboardingFieldConfig[] = [
  // Identity & Documents
  { id: "date_of_birth", label: "Date of birth", section: "identity", type: "date", required: true, enabled: true, helperText: "As shown on government ID", atsFieldName: "candidate.date_of_birth", atsExampleValue: "1992-03-15", filledBy: "candidate", editability: "editable" },
  { id: "id_type", label: "ID type", section: "identity", type: "select", required: true, enabled: true, helperText: "Passport, National ID, etc.", filledBy: "candidate", editability: "editable" },
  { id: "id_number", label: "ID number", section: "identity", type: "text", required: true, enabled: true, helperText: "Document number from selected ID", filledBy: "candidate", editability: "editable" },
  // Tax & Residency
  { id: "tax_residence_country", label: "Tax residence country", section: "tax", type: "select", required: true, enabled: true, helperText: "Country where you pay taxes", atsFieldName: "candidate.tax_country", atsExampleValue: "Philippines", filledBy: "candidate", editability: "editable" },
  { id: "tax_residence_city", label: "Tax residence city / region", section: "tax", type: "text", required: true, enabled: true, helperText: "City or region of tax residence", filledBy: "candidate", editability: "editable" },
  // Address
  { id: "residential_address", label: "Residential address", section: "address", type: "text", required: true, enabled: true, helperText: "Full street address incl. postal code and city", atsFieldName: "candidate.address", atsExampleValue: "123 Main St, Makati City 1200", filledBy: "candidate", editability: "editable" },
  { id: "nationality", label: "Nationality", section: "address", type: "select", required: true, enabled: true, helperText: "Your citizenship / nationality", atsFieldName: "candidate.nationality", atsExampleValue: "Filipino", filledBy: "candidate", editability: "editable" },
];

const FIELD_TYPE_LABELS: Record<CustomOnboardingFieldType, string> = {
  short_text: "Short text",
  long_text: "Long text",
  number: "Number",
  date: "Date",
  single_select: "Dropdown",
  file_upload: "File upload",
};

const FIELD_TYPE_ICONS: Record<CustomOnboardingFieldType, React.ElementType> = {
  short_text: FileText,
  long_text: FileText,
  number: Hash,
  date: CalendarDays,
  single_select: List,
  file_upload: Upload,
};

export const V4_ConfigureCandidateDetailsDrawer: React.FC<V4_ConfigureCandidateDetailsDrawerProps> = ({
  open,
  onOpenChange,
  candidate,
  onSave,
  initialConfig,
}) => {
  const [fieldConfig, setFieldConfig] = useState<OnboardingFieldConfig[]>(
    initialConfig?.baseFields || DEFAULT_FIELD_CONFIG
  );
  const [customFields, setCustomFields] = useState<CustomOnboardingField[]>(
    initialConfig?.customFields || []
  );
  
  // ATS data controls
  const [useATSData, setUseATSData] = useState<boolean>(
    initialConfig?.useATSData ?? true
  );
  const [allowCandidateEditATS, setAllowCandidateEditATS] = useState<boolean>(
    initialConfig?.allowCandidateEditATS ?? true
  );
  
  // Modal states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomOnboardingField | null>(null);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [fieldToRemove, setFieldToRemove] = useState<CustomOnboardingField | null>(null);
  
  // Drag and drop state
  const [draggedFieldId, setDraggedFieldId] = useState<string | null>(null);
  const [dragOverFieldId, setDragOverFieldId] = useState<string | null>(null);
  
  // Form state for add/edit modal
  const [formFieldName, setFormFieldName] = useState("");
  const [formFieldType, setFormFieldType] = useState<CustomOnboardingFieldType>("short_text");
  const [formFieldRequired, setFormFieldRequired] = useState(true);
  const [formFieldEnabled, setFormFieldEnabled] = useState(true);
  const [formFieldOptions, setFormFieldOptions] = useState<string[]>([""]);
  const [formFieldFilledBy, setFormFieldFilledBy] = useState<FilledBySource>("candidate");
  const [formFieldEditability, setFormFieldEditability] = useState<EditabilityMode>("editable");

  // Check if candidate has ATS data
  const hasATSProfile = candidate?.hasATSData ?? false;

  // Reset fields when candidate changes
  useEffect(() => {
    if (candidate) {
      setFieldConfig(initialConfig?.baseFields || DEFAULT_FIELD_CONFIG);
      setCustomFields(initialConfig?.customFields || []);
      setUseATSData(initialConfig?.useATSData ?? (candidate.hasATSData ?? true));
      setAllowCandidateEditATS(initialConfig?.allowCandidateEditATS ?? true);
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
          return { 
            ...field, 
            filledBy,
            // Reset editability to editable when switching filled by
            editability: "editable"
          };
        }
        return field;
      })
    );
  };

  const handleEditabilityChange = (fieldId: string, editability: EditabilityMode) => {
    setFieldConfig(prev => 
      prev.map(field => 
        field.id === fieldId ? { ...field, editability } : field
      )
    );
  };

  const handleAdminValueChange = (fieldId: string, value: string) => {
    setFieldConfig(prev => 
      prev.map(field => 
        field.id === fieldId ? { ...field, adminValue: value } : field
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

  const handleCustomFieldFilledByChange = (fieldId: string, filledBy: FilledBySource) => {
    setCustomFields(prev => 
      prev.map(field => {
        if (field.id === fieldId) {
          return { 
            ...field, 
            filledBy,
            editability: "editable"
          };
        }
        return field;
      })
    );
  };

  const handleCustomFieldEditabilityChange = (fieldId: string, editability: EditabilityMode) => {
    setCustomFields(prev => 
      prev.map(field => 
        field.id === fieldId ? { ...field, editability } : field
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

  const handleSave = () => {
    if (!candidate) return;
    onSave(candidate.id, { 
      baseFields: fieldConfig, 
      customFields,
      useATSData: hasATSProfile ? useATSData : false,
      allowCandidateEditATS 
    });
    toast.success("Contract details form configuration saved");
    onOpenChange(false);
  };

  const handleCancel = () => {
    setFieldConfig(initialConfig?.baseFields || DEFAULT_FIELD_CONFIG);
    setCustomFields(initialConfig?.customFields || []);
    setUseATSData(initialConfig?.useATSData ?? true);
    setAllowCandidateEditATS(initialConfig?.allowCandidateEditATS ?? true);
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
    setFormFieldEditability("editable");
    setIsAddEditModalOpen(true);
  };

  const openEditModal = (field: CustomOnboardingField) => {
    setEditingField(field);
    setFormFieldName(field.label);
    setFormFieldType(field.type);
    setFormFieldRequired(field.required);
    setFormFieldEnabled(field.enabled);
    setFormFieldOptions(field.options && field.options.length > 0 ? field.options : [""]);
    setFormFieldFilledBy(field.filledBy);
    setFormFieldEditability(field.editability || "editable");
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
            ? { 
                ...f, 
                label: formFieldName.trim(), 
                type: formFieldType, 
                required: formFieldRequired, 
                enabled: formFieldEnabled, 
                options: filteredOptions, 
                filledBy: formFieldFilledBy,
                editability: formFieldEditability
              }
            : f
        )
      );
      toast.success("Custom field updated");
    } else {
      // Add new field
      const newField: CustomOnboardingField = {
        id: `custom_onboarding_${Date.now()}`,
        label: formFieldName.trim(),
        type: formFieldType,
        required: formFieldRequired,
        enabled: formFieldEnabled,
        options: filteredOptions,
        filledBy: formFieldFilledBy,
        editability: formFieldEditability,
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
  const openRemoveDialog = (field: CustomOnboardingField) => {
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

  const identityFields = fieldConfig.filter(f => f.section === "identity");
  const taxFields = fieldConfig.filter(f => f.section === "tax");
  const addressFields = fieldConfig.filter(f => f.section === "address");

  const isFormValid = formFieldName.trim() !== "" && formFieldType !== undefined;

  const renderFieldRow = (field: OnboardingFieldConfig) => {
    const hasATS = field.atsFieldName && hasATSProfile && useATSData;
    const isPrefilled = field.filledBy === "prefilled";
    const isHidden = !field.enabled;
    const showEditabilityControl = isPrefilled && field.enabled;
    // Get ATS value if available for pre-populating
    const atsValue = hasATS && field.atsExampleValue ? field.atsExampleValue : "";
    
    return (
      <div key={field.id} className="flex items-start justify-between p-3 rounded-lg border border-border/40 bg-card/50">
        <div className="flex-1 min-w-0 pr-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{field.label}</span>
            {field.required && (
              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">Required</Badge>
            )}
          </div>
          
          {/* Helper text and filled-by controls - faded when hidden */}
          <div className={cn(isHidden && "opacity-50")}>
            {field.helperText && (
              <p className="text-xs text-muted-foreground mt-1">{field.helperText}</p>
            )}
            
            {/* ATS source indicator - only show when ATS data exists and is being used */}
            {hasATS && (
              <div className="mt-1.5">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-accent-blue-fill/50 border border-accent-blue-outline/30 cursor-help">
                        <Database className="h-3 w-3 text-accent-blue-text" />
                        <span className="text-[10px] font-medium text-accent-blue-text">ATS data available</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <div className="space-y-1">
                        <p className="text-xs font-medium">ATS Field: {field.atsFieldName}</p>
                        {field.atsExampleValue && (
                          <p className="text-xs text-muted-foreground">Example: {field.atsExampleValue}</p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
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
                  Candidate form
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
                  Pre-filled
                </button>
              </div>
              
              {/* Helper text based on selection */}
              {field.filledBy === "candidate" ? (
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  To be filled by candidate
                </p>
              ) : (
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  Not asked on candidate form. Pre-filled from ATS or by an admin.
                </p>
              )}

              {/* Editability control - only for prefilled + shown fields */}
              {showEditabilityControl && (
                <div className="mt-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[11px] text-muted-foreground font-medium">Candidate can edit?</span>
                  </div>
                  <div className="inline-flex rounded-md border border-border/60 bg-muted/30 p-0.5">
                    <button
                      type="button"
                      onClick={() => handleEditabilityChange(field.id, "editable")}
                      className={cn(
                        "px-2 py-1 text-[11px] font-medium rounded-sm transition-all",
                        field.editability !== "readonly"
                          ? "bg-background text-foreground shadow-sm" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Editable
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditabilityChange(field.id, "readonly")}
                      className={cn(
                        "px-2 py-1 text-[11px] font-medium rounded-sm transition-all flex items-center gap-1",
                        field.editability === "readonly"
                          ? "bg-background text-foreground shadow-sm" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Lock className="h-3 w-3" />
                      Read-only
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Hidden on form indicator */}
            {isHidden && (
              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <EyeOff className="h-3 w-3" />
                <span>Hidden on candidate form</span>
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
              className="scale-75"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderCustomFieldRow = (field: CustomOnboardingField) => {
    const TypeIcon = FIELD_TYPE_ICONS[field.type];
    const isDragging = draggedFieldId === field.id;
    const isDragOver = dragOverFieldId === field.id;
    const isPrefilled = field.filledBy === "prefilled";
    const isHidden = !field.enabled;
    const showEditabilityControl = isPrefilled && field.enabled;
    
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
          <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab active:cursor-grabbing shrink-0 mt-1" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium truncate">{field.label}</span>
              {field.required && (
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary shrink-0">Required</Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <TypeIcon className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{FIELD_TYPE_LABELS[field.type]}</span>
            </div>
            
            {/* Controls - faded when hidden */}
            <div className={cn(isHidden && "opacity-50")}>
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
                    Candidate form
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
                    Pre-filled
                  </button>
                </div>
                
                {/* Helper text based on selection */}
                {field.filledBy === "candidate" ? (
                  <p className="text-[10px] text-muted-foreground mt-1.5">
                    To be filled by candidate
                  </p>
                ) : (
                  <p className="text-[10px] text-muted-foreground mt-1.5">
                    Not asked on candidate form. Pre-filled from ATS or by an admin.
                  </p>
                )}

                {/* Editability control - only for prefilled + shown fields */}
                {showEditabilityControl && (
                  <div className="mt-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[11px] text-muted-foreground font-medium">Candidate can edit?</span>
                    </div>
                    <div className="inline-flex rounded-md border border-border/60 bg-muted/30 p-0.5">
                      <button
                        type="button"
                        onClick={() => handleCustomFieldEditabilityChange(field.id, "editable")}
                        className={cn(
                          "px-2 py-1 text-[11px] font-medium rounded-sm transition-all",
                          field.editability !== "readonly"
                            ? "bg-background text-foreground shadow-sm" 
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        Editable
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCustomFieldEditabilityChange(field.id, "readonly")}
                        className={cn(
                          "px-2 py-1 text-[11px] font-medium rounded-sm transition-all flex items-center gap-1",
                          field.editability === "readonly"
                            ? "bg-background text-foreground shadow-sm" 
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Lock className="h-3 w-3" />
                        Read-only
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Hidden on form indicator */}
              {isHidden && (
                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <EyeOff className="h-3 w-3" />
                  <span>Hidden on candidate form</span>
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
            <SheetTitle className="text-base">Configure Contract Details</SheetTitle>
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
                  <Badge variant="outline" className="capitalize mt-0.5">
                    {candidate.employmentType === "employee" ? "Employee (EOR)" : "Contractor (COR)"}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium text-sm truncate">{candidate.email || "Not provided"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Source Section */}
          <div className="mt-4 p-4 rounded-lg border border-border/40 bg-muted/20 space-y-3">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              <Label className="text-sm font-semibold">Data source</Label>
            </div>
            
            {hasATSProfile ? (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border/40">
                <Info className="h-4 w-4 text-primary shrink-0" />
                <p className="text-xs text-muted-foreground">
                  ATS profile connected – some fields can be pre-filled from ATS or by an admin.
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border/40">
                <Info className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground">
                  No ATS profile connected – pre-filled fields must be completed by an admin.
                </p>
              </div>
            )}
          </div>

          {/* Compliance Badge */}
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-4 w-4 text-primary" />
            <span>GDPR & local employment regulations compliant</span>
          </div>

          {/* Field Configuration */}
          <div className="mt-6 space-y-6">
            {/* Section 1: Identity & Documents */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <Label className="text-sm font-semibold">Identity & Documents</Label>
              </div>
              <div className="space-y-3">
                {identityFields.map(renderFieldRow)}
              </div>
            </div>

            <Separator />

            {/* Section 2: Tax & Residency */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <Label className="text-sm font-semibold">Tax & Residency</Label>
              </div>
              <div className="space-y-3">
                {taxFields.map(renderFieldRow)}
              </div>
            </div>

            <Separator />

            {/* Section 3: Address */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <Label className="text-sm font-semibold">Address</Label>
              </div>
              <div className="space-y-3">
                {addressFields.map(renderFieldRow)}
              </div>
            </div>

            <Separator />

            {/* Custom Fields Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" />
                <Label className="text-sm font-semibold">Custom Fields</Label>
              </div>
              <p className="text-xs text-muted-foreground -mt-2">
                Add extra onboarding questions specific to this candidate or role.
              </p>

              {customFields.length === 0 ? (
                /* Subtle empty state */
                <div className="rounded-lg border border-dashed border-border/60 bg-muted/10 p-5 text-center">
                  <div className="mx-auto w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center mb-2">
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">No custom fields yet</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Add extra questions if you need more details.
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={openAddModal} 
                    className="gap-1.5 text-xs h-8"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add custom field
                  </Button>
                </div>
              ) : (
                /* Non-empty state */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Custom fields for this onboarding form</span>
                    <Button variant="ghost" size="sm" className="h-auto p-0 text-xs gap-1" onClick={openAddModal}>
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
            <DialogTitle>{editingField ? "Edit custom field" : "Add custom field"}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Configure a custom field that will appear on the candidate's onboarding form.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Field Name */}
            <div className="space-y-2">
              <Label htmlFor="fieldName" className="text-sm">Field name</Label>
              <Input 
                id="fieldName"
                placeholder="e.g. Work permit number, Emergency contact"
                value={formFieldName}
                onChange={(e) => setFormFieldName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Shown as the field label to the candidate.</p>
            </div>

            {/* Field Type */}
            <div className="space-y-2">
              <Label className="text-sm">Field type</Label>
              <Select value={formFieldType} onValueChange={(v) => setFormFieldType(v as CustomOnboardingFieldType)}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="short_text">Short text</SelectItem>
                  <SelectItem value="long_text">Long text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="single_select">Dropdown</SelectItem>
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
                  Pre-filled
                </button>
              </div>
              {formFieldFilledBy === "candidate" ? (
                <p className="text-xs text-muted-foreground">
                  To be filled by candidate
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Not asked on candidate form. Pre-filled from ATS or by an admin.
                </p>
              )}
            </div>

            {/* Toggles */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/30">
              <div>
                <p className="text-sm font-medium">Required field</p>
                <p className="text-xs text-muted-foreground">Candidate must fill this field to submit</p>
              </div>
              <Switch checked={formFieldRequired} onCheckedChange={setFormFieldRequired} />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/30">
              <div>
                <p className="text-sm font-medium">Show on candidate form</p>
                <p className="text-xs text-muted-foreground">Field will be visible to the candidate</p>
              </div>
              <Switch checked={formFieldEnabled} onCheckedChange={setFormFieldEnabled} />
            </div>

            {/* Editability control - only for prefilled + shown */}
            {formFieldFilledBy === "prefilled" && formFieldEnabled && (
              <div className="space-y-2">
                <Label className="text-sm">Candidate can edit?</Label>
                <div className="inline-flex rounded-md border border-border/60 bg-muted/30 p-0.5">
                  <button
                    type="button"
                    onClick={() => setFormFieldEditability("editable")}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-sm transition-all",
                      formFieldEditability === "editable" 
                        ? "bg-background text-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Editable
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormFieldEditability("readonly")}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-sm transition-all flex items-center gap-1",
                      formFieldEditability === "readonly" 
                        ? "bg-background text-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Lock className="h-3 w-3" />
                    Read-only
                  </button>
                </div>
              </div>
            )}
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
              This will remove this field from the onboarding form for this candidate. 
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

export default V4_ConfigureCandidateDetailsDrawer;
