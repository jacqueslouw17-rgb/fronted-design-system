/**
 * Flow 1 v5 — Country Template Drawer (Redesigned)
 * 
 * Wide right-side Sheet (~60%) with document tabs matching the worker-level
 * contract workspace pattern. Per-document edit/save/reset.
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText, Handshake, ScrollText, Cpu, Scale, Home,
  Pencil, RotateCcw, Save, X, Clock, User, Info,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { CountryTemplate, DocumentTemplate, TemplateAuditEntry } from "./F1v5_CountryTemplatesSection";

// ── Icon map ──
const DOC_ICONS: Record<string, React.ElementType> = {
  "employment-agreement": FileText,
  "nda": Handshake,
  "data-privacy": ScrollText,
  "ip-addendum": Cpu,
  "restrictive-covenants": Scale,
  "home-office": Home,
};

// ── Props ──
interface Props {
  template: CountryTemplate | null;
  companyName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveDocument: (templateId: string, documentId: string, newContent: string) => void;
  onResetDocument: (templateId: string, documentId: string) => void;
}

// ── Helpers ──
const formatRelative = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(diff / 86400000);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const F1v5_CountryTemplateDrawer: React.FC<Props> = ({
  template,
  companyName,
  open,
  onOpenChange,
  onSaveDocument,
  onResetDocument,
}) => {
  const [activeDocId, setActiveDocId] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);

  // Reset state when template changes
  useEffect(() => {
    if (template && template.documents.length > 0) {
      setActiveDocId(template.documents[0].id);
      setIsEditing(false);
      setShowAuditLog(false);
    }
  }, [template?.id]);

  const activeDoc = useMemo(
    () => template?.documents.find(d => d.id === activeDocId) || template?.documents[0] || null,
    [template, activeDocId]
  );

  const isModified = useMemo(() => {
    if (!activeDoc) return false;
    return editContent !== activeDoc.content;
  }, [editContent, activeDoc]);

  const isDefault = useMemo(() => {
    if (!activeDoc) return true;
    return activeDoc.content === activeDoc.defaultContent;
  }, [activeDoc]);

  const handleStartEdit = useCallback(() => {
    if (!activeDoc) return;
    setEditContent(activeDoc.content);
    setIsEditing(true);
  }, [activeDoc]);

  const handleCancel = useCallback(() => {
    if (!activeDoc) return;
    setEditContent(activeDoc.content);
    setIsEditing(false);
  }, [activeDoc]);

  const handleSave = useCallback(() => {
    if (!template || !activeDoc || !editContent.trim()) return;
    onSaveDocument(template.id, activeDoc.id, editContent);
    setIsEditing(false);
    toast({ title: "Document saved", description: `${activeDoc.shortLabel} template has been updated.` });
  }, [template, activeDoc, editContent, onSaveDocument]);

  const handleResetConfirm = useCallback(() => {
    if (!template || !activeDoc) return;
    setIsResetting(true);
    setTimeout(() => {
      onResetDocument(template.id, activeDoc.id);
      setEditContent(activeDoc.defaultContent);
      setIsEditing(false);
      setIsResetting(false);
      setShowResetDialog(false);
      toast({ title: "Document reset", description: `${activeDoc.shortLabel} restored to default.` });
    }, 4000);
  }, [template, activeDoc, onResetDocument]);

  const handleDocSwitch = useCallback((docId: string) => {
    if (isEditing) {
      // Discard edits when switching
      setIsEditing(false);
    }
    setActiveDocId(docId);
  }, [isEditing]);

  if (!template) return null;

  const docs = template.documents;
  const MAX_VISIBLE = 4;
  const visibleDocs = docs.slice(0, MAX_VISIBLE);
  const overflowDocs = docs.slice(MAX_VISIBLE);
  const activeInOverflow = overflowDocs.some(d => d.id === activeDocId);

  // Audit entries for active doc
  const docAuditEntries = template.audit.filter(
    a => a.documentLabel === activeDoc?.shortLabel
  );
  const allAuditEntries = template.audit;

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => {
        if (!v && isEditing) setIsEditing(false);
        onOpenChange(v);
      }}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-[60vw] p-0 flex flex-col"
          hideClose
        >
          {/* ── Header ── */}
          <div className="px-6 pt-5 pb-4 border-b border-border/30 flex-shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{template.flag}</span>
                  <SheetTitle className="text-base font-semibold">
                    {template.countryName} templates
                  </SheetTitle>
                </div>
                <SheetDescription className="text-xs">
                  Base contract documents for {template.countryName} in {companyName}. Changes apply to all future contracts.
                </SheetDescription>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 -mt-1" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* ── Toolbar: tabs + actions ── */}
          <div className="px-6 py-2.5 border-b border-border/20 flex items-center justify-between gap-3 flex-shrink-0 bg-muted/10">
            {/* Left: Document tabs */}
            {isEditing ? (
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full flex-shrink-0 bg-warning animate-pulse" />
                <p className="text-xs text-muted-foreground truncate">
                  Editing <span className="font-medium text-foreground">{activeDoc?.shortLabel}</span> — changes apply to future {template.countryName} contracts
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-1 min-w-0">
                {visibleDocs.map((doc) => {
                  const isActive = doc.id === activeDocId;
                  const isEdited = doc.content !== doc.defaultContent;
                  const Icon = DOC_ICONS[doc.type] || FileText;
                  return (
                    <TooltipProvider key={doc.id} delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleDocSwitch(doc.id)}
                            className={cn(
                              "inline-flex items-center gap-1.5 text-xs h-7 px-3 rounded-md transition-all duration-200 max-w-[140px] truncate",
                              isActive
                                ? "bg-background text-foreground font-medium shadow-sm border border-border/60"
                                : isEdited
                                  ? "bg-primary/5 text-primary/80 hover:bg-primary/10 border border-primary/10"
                                  : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/40"
                            )}
                          >
                            <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">{doc.shortLabel}</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">
                          {doc.label}
                          {isEdited && <span className="ml-1 text-primary">(edited)</span>}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
                {overflowDocs.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className={cn(
                        "inline-flex items-center gap-1 text-xs h-7 px-2.5 rounded-md transition-all duration-200",
                        activeInOverflow
                          ? "bg-background text-foreground font-medium shadow-sm border border-border/60"
                          : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/40"
                      )}>
                        <span>{activeInOverflow ? activeDoc?.shortLabel : `+${overflowDocs.length} more`}</span>
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="min-w-[200px]">
                      {overflowDocs.map((doc) => {
                        const Icon = DOC_ICONS[doc.type] || FileText;
                        const isEdited = doc.content !== doc.defaultContent;
                        return (
                          <DropdownMenuItem
                            key={doc.id}
                            onClick={() => handleDocSwitch(doc.id)}
                            className={cn(
                              "flex items-center gap-2 text-xs cursor-pointer",
                              doc.id === activeDocId && "bg-muted font-medium"
                            )}
                          >
                            <Icon className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                            <span>{doc.label}</span>
                            {isEdited && (
                              <Badge variant="secondary" className="ml-auto h-4 px-1.5 text-[9px] bg-primary/10 text-primary border-0">edited</Badge>
                            )}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            )}

            {/* Right: Actions */}
            {isEditing ? (
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleCancel}>Cancel</Button>
                <Button size="sm" className="h-7 text-xs gap-1.5" onClick={handleSave} disabled={!isModified || !editContent.trim()}>
                  <Save className="h-3 w-3" />
                  Save {activeDoc?.shortLabel}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground" onClick={handleStartEdit}>
                  <Pencil className="h-3 w-3" />
                  Edit
                </Button>
                {!isDefault && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive gap-1.5" onClick={() => setShowResetDialog(true)}>
                    <RotateCcw className="h-3 w-3" />
                    Reset
                  </Button>
                )}
              </div>
            )}
          </div>


          {/* ── Document content ── */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <AnimatePresence mode="wait">
              {isResetting ? (
                <motion.div key="resetting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className={`h-3 bg-muted/40 rounded animate-pulse ${i === 0 ? 'w-2/3' : 'w-full'}`} />
                      {i < 7 && <div className="h-3 bg-muted/30 rounded animate-pulse w-5/6" />}
                    </div>
                  ))}
                </motion.div>
              ) : isEditing ? (
                <motion.div key={`edit-${activeDocId}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[500px] text-sm leading-relaxed font-mono resize-none bg-background/60 border-border/30"
                  />
                </motion.div>
              ) : (
                <motion.div key={`view-${activeDocId}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="max-w-3xl mx-auto">
                    {/* Document paper */}
                    <div className="rounded-lg border border-border/20 bg-background/60 shadow-sm p-8">
                      <pre className="text-sm leading-relaxed text-foreground whitespace-pre-wrap font-sans">
                        {activeDoc?.content}
                      </pre>
                    </div>

                    {/* Document meta */}
                    {activeDoc?.lastEditedAt && (
                      <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Last edited by {activeDoc.lastEditedBy} · {formatRelative(activeDoc.lastEditedAt)}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Audit log toggle ── */}
          <div className="border-t border-border/30 flex-shrink-0">
            <button
              onClick={() => setShowAuditLog(!showAuditLog)}
              className="w-full px-6 py-2.5 flex items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="font-medium">
                Audit log
                {allAuditEntries.length > 0 && (
                  <span className="ml-1.5 text-[10px] text-muted-foreground">({allAuditEntries.length})</span>
                )}
              </span>
              {showAuditLog ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
            </button>
            <AnimatePresence>
              {showAuditLog && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-4 max-h-[200px] overflow-y-auto">
                    {allAuditEntries.length === 0 ? (
                      <p className="text-center py-4 text-xs text-muted-foreground">No edits recorded yet.</p>
                    ) : (
                      <div className="space-y-1">
                        {allAuditEntries.map((entry, i) => {
                          const isReset = entry.actionType === "RESET";
                          return (
                            <div key={entry.id} className="flex items-start gap-2.5 px-3 py-2 rounded-lg hover:bg-muted/20 transition-colors">
                              <div className="flex-shrink-0 mt-0.5">
                                <div className={`h-5 w-5 rounded-full flex items-center justify-center ${isReset ? 'bg-primary/10' : 'bg-muted/50'}`}>
                                  {isReset ? <RotateCcw className="h-3 w-3 text-primary" /> : <User className="h-3 w-3 text-muted-foreground" />}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-medium text-foreground">{entry.actor}</span>
                                  <Badge variant="outline" className="h-4 px-1.5 text-[9px]">{entry.documentLabel}</Badge>
                                  {isReset && (
                                    <Badge variant="secondary" className="h-4 px-1.5 text-[9px] bg-primary/10 text-primary border-0">Reset</Badge>
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Reset dialog ── */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset {activeDoc?.shortLabel} to default?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the {activeDoc?.shortLabel} template for {template.countryName} to its original version. Any manual edits to this document will be lost.
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
