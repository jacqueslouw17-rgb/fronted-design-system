/**
 * Flow 1 v5 — Country Template Drawer
 * 
 * Right-side Sheet for viewing/editing a single country base template.
 * Tabs: Template | Audit log
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileEdit, RotateCcw, Save, X, Clock, User, AlertTriangle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { CountryTemplate, TemplateAuditEntry } from "./F1v5_CountryTemplatesSection";

interface Props {
  template: CountryTemplate | null;
  companyName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (templateId: string, newContent: string) => void;
  onReset: (templateId: string) => void;
}

// ── Audit helpers ──

const formatTimestamp = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC",
  }) + " UTC";
};

const formatRelative = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(diff / 86400000);
  if (days < 7) return `${days}d ago`;
  return formatTimestamp(iso);
};

export const F1v5_CountryTemplateDrawer: React.FC<Props> = ({
  template,
  companyName,
  open,
  onOpenChange,
  onSave,
  onReset,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [activeTab, setActiveTab] = useState<"template" | "audit">("template");

  // Sync edit content when template changes
  useEffect(() => {
    if (template) {
      setEditContent(template.content);
      setIsEditing(false);
      setActiveTab("template");
    }
  }, [template?.id]);

  const isModified = useMemo(() => {
    if (!template) return false;
    return editContent !== template.content;
  }, [editContent, template]);

  const isDefault = useMemo(() => {
    if (!template) return true;
    return template.content === template.defaultContent;
  }, [template]);

  const handleStartEdit = useCallback(() => {
    if (!template) return;
    setEditContent(template.content);
    setIsEditing(true);
  }, [template]);

  const handleCancel = useCallback(() => {
    if (!template) return;
    setEditContent(template.content);
    setIsEditing(false);
  }, [template]);

  const handleSave = useCallback(() => {
    if (!template || !editContent.trim()) return;
    onSave(template.id, editContent);
    setIsEditing(false);
    toast({ title: "Template saved", description: `${template.countryName} base template has been updated.` });
  }, [template, editContent, onSave]);

  const handleResetConfirm = useCallback(() => {
    if (!template) return;
    setIsResetting(true);
    // 4-second simulated reset
    setTimeout(() => {
      onReset(template.id);
      setEditContent(template.defaultContent);
      setIsEditing(false);
      setIsResetting(false);
      setShowResetDialog(false);
      toast({ title: "Template reset", description: `${template.countryName} template restored to default.` });
    }, 4000);
  }, [template, onReset]);

  if (!template) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => {
        if (!v && isEditing && isModified) {
          // Discard unsaved changes
          setIsEditing(false);
        }
        onOpenChange(v);
      }}>
        <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col" hideClose>
          {/* Header */}
          <div className="px-5 pt-5 pb-4 border-b border-border/30 flex-shrink-0">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{template.flag}</span>
                  <SheetTitle className="text-base font-semibold">{template.countryName} base template</SheetTitle>
                </div>
                <SheetDescription className="text-xs">
                  Applies to all new contracts for this country in {companyName}
                </SheetDescription>
                <Badge variant="secondary" className="text-[10px] h-5 px-2 bg-muted/60 mt-1">
                  Base template (company-level)
                </Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-5 pt-3 flex-shrink-0">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "template" | "audit")}>
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="template">Template</TabsTrigger>
                <TabsTrigger value="audit">
                  Audit log
                  {template.audit.length > 0 && (
                    <Badge variant="secondary" className="ml-1.5 h-4 px-1.5 text-[9px] bg-muted/60">
                      {template.audit.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {activeTab === "template" ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Actions bar */}
                <div className="px-5 py-3 flex items-center gap-2 flex-shrink-0 border-b border-border/20">
                  {isEditing ? (
                    <>
                      <Button size="sm" onClick={handleSave} disabled={!isModified || !editContent.trim()} className="h-7 text-xs gap-1.5">
                        <Save className="h-3 w-3" />
                        Save changes
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancel} className="h-7 text-xs">
                        Cancel
                      </Button>
                      {!isDefault && (
                        <Button size="sm" variant="ghost" onClick={() => setShowResetDialog(true)} className="h-7 text-xs text-destructive hover:text-destructive ml-auto gap-1.5">
                          <RotateCcw className="h-3 w-3" />
                          Reset to default
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" onClick={handleStartEdit} className="h-7 text-xs gap-1.5">
                        <FileEdit className="h-3 w-3" />
                        Edit template
                      </Button>
                      {!isDefault && (
                        <Button size="sm" variant="ghost" onClick={() => setShowResetDialog(true)} className="h-7 text-xs text-destructive hover:text-destructive ml-auto gap-1.5">
                          <RotateCcw className="h-3 w-3" />
                          Reset to default
                        </Button>
                      )}
                    </>
                  )}
                </div>

                {/* Helper note */}
                {isEditing && (
                  <div className="px-5 py-2 flex-shrink-0">
                    <div className="flex items-start gap-2 text-[11px] text-muted-foreground bg-muted/20 rounded-md px-3 py-2">
                      <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-primary" />
                      <span>Changes apply to <strong>future contracts</strong> for {template.countryName}. Worker-specific edits made during contract preparation are separate.</span>
                    </div>
                  </div>
                )}

                {/* Document viewer / editor */}
                <div className="flex-1 overflow-y-auto px-5 py-4">
                  <AnimatePresence mode="wait">
                    {isResetting ? (
                      <motion.div
                        key="resetting"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-3"
                      >
                        {/* Skeleton */}
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div key={i} className="space-y-1.5">
                            <div className={`h-3 bg-muted/40 rounded animate-pulse ${i === 0 ? 'w-2/3' : 'w-full'}`} />
                            {i < 7 && <div className="h-3 bg-muted/30 rounded animate-pulse w-5/6" />}
                          </div>
                        ))}
                      </motion.div>
                    ) : isEditing ? (
                      <motion.div
                        key="editing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="min-h-[500px] text-sm leading-relaxed font-mono resize-none bg-background/60 border-border/30"
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="viewing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="rounded-lg border border-border/20 bg-background/40 p-5"
                      >
                        <pre className="text-sm leading-relaxed text-foreground whitespace-pre-wrap font-sans">
                          {template.content}
                        </pre>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              /* Audit log tab */
              <div className="flex-1 overflow-y-auto px-5 py-4">
                {template.audit.length === 0 ? (
                  <div className="text-center py-12 text-xs text-muted-foreground">
                    No edits recorded yet.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {template.audit.map((entry, i) => {
                      const isReset = entry.actionType === "RESET";
                      return (
                        <div
                          key={entry.id}
                          className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg hover:bg-muted/20 transition-colors"
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            <div className={`h-5 w-5 rounded-full flex items-center justify-center ${isReset ? 'bg-primary/10' : 'bg-muted/50'}`}>
                              {isReset ? (
                                <RotateCcw className="h-3 w-3 text-primary" />
                              ) : (
                                <User className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-medium text-foreground">{entry.actor}</span>
                              {isReset && (
                                <Badge variant="secondary" className="h-4 px-1.5 text-[9px] bg-primary/10 text-primary border-0">
                                  Reset to default
                                </Badge>
                              )}
                              {i === 0 && (
                                <Badge variant="outline" className="h-4 px-1.5 text-[9px]">Latest</Badge>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{entry.summary}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-[10px] text-muted-foreground">{formatRelative(entry.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Reset confirmation dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset to default template?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the {template.countryName} template to its original version. Any manual edits will be lost. This action will be recorded in the audit log.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResetting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetConfirm}
              disabled={isResetting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isResetting ? (
                <span className="flex items-center gap-2">
                  <RotateCcw className="h-3.5 w-3.5 animate-spin" />
                  Resetting…
                </span>
              ) : (
                "Reset to default"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
