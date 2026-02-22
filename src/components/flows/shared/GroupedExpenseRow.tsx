/**
 * GroupedExpenseRow — Renders tagged expense groups with individual approve/reject per item.
 * Used across Flow 1 (v4, v5) and Flow 6 (v3, v4) admin dashboards.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, CheckCircle2, Undo2, ChevronDown, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AttachmentsList, AttachmentIndicator, type AttachmentItem } from './AttachmentsList';
import { cn } from '@/lib/utils';

export type GroupItemStatus = 'pending' | 'approved' | 'rejected';

export interface GroupedExpenseItem {
  itemId: string;
  label: string;
  amount: number;
  status: GroupItemStatus;
  rejectionReason?: string;
  attachments?: AttachmentItem[];
  onApprove: () => void;
  onReject: (reason: string) => void;
  onUndo?: () => void;
}

interface GroupedExpenseRowProps {
  groupLabel: string;
  items: GroupedExpenseItem[];
  currency: string;
  expandedItemId?: string | null;
  onToggleItemExpand?: (id: string | null) => void;
  isFinalized?: boolean;
}

const formatAmount = (amt: number, curr: string) => {
  const symbols: Record<string, string> = { EUR: "€", NOK: "kr", PHP: "₱", USD: "$", SGD: "S$" };
  return `${symbols[curr] || curr}${Math.abs(amt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const GroupedExpenseRow = ({
  groupLabel,
  items,
  currency,
  expandedItemId,
  onToggleItemExpand,
  isFinalized = false,
}: GroupedExpenseRowProps) => {
  const [isGroupOpen, setIsGroupOpen] = useState(true);

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
  const pendingCount = items.filter(i => i.status === 'pending').length;
  const allApproved = items.every(i => i.status === 'approved');
  const allRejected = items.every(i => i.status === 'rejected');
  const totalAttachments = items.reduce((sum, item) => sum + (item.attachments?.length || 0), 0);

  return (
    <div className={cn(
      "-mx-3 rounded-md transition-colors mb-1",
      pendingCount > 0
        ? "bg-orange-50/50 dark:bg-orange-500/5 border border-orange-200/40 dark:border-orange-500/15"
        : allRejected
          ? "bg-destructive/5 border border-destructive/10"
          : "bg-muted/20 border border-border/20"
    )}>
      {/* Group header */}
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer"
        onClick={() => setIsGroupOpen(!isGroupOpen)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform duration-150", !isGroupOpen && "-rotate-90")} />
          <span className={cn(
            "text-sm font-medium truncate",
            allRejected ? "text-muted-foreground/70 line-through" : "text-foreground"
          )}>
            {groupLabel}
          </span>
          {pendingCount > 0 && (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400">
              {pendingCount} pending
            </span>
          )}
          {allApproved && <CheckCircle2 className="h-3.5 w-3.5 text-accent-green-text shrink-0" />}
          {!isGroupOpen && totalAttachments > 0 && <AttachmentIndicator count={totalAttachments} />}
        </div>
        <span className={cn(
          "text-sm tabular-nums font-mono shrink-0 ml-3",
          allRejected ? "text-muted-foreground/40 line-through" : "text-foreground"
        )}>
          +{formatAmount(totalAmount, currency)}
        </span>
      </div>

      {/* Nested items */}
      <AnimatePresence>
        {isGroupOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-2 space-y-0.5">
              {items.map((item) => (
                <NestedExpenseItem
                  key={item.itemId}
                  item={item}
                  currency={currency}
                  isExpanded={expandedItemId === item.itemId}
                  onToggleExpand={() => onToggleItemExpand?.(expandedItemId === item.itemId ? null : item.itemId)}
                  isFinalized={isFinalized}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Nested item within a group ─── */

const NestedExpenseItem = ({
  item,
  currency,
  isExpanded,
  onToggleExpand,
  isFinalized,
}: {
  item: GroupedExpenseItem;
  currency: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isFinalized: boolean;
}) => {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReasonInput, setRejectReasonInput] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const hasAttachments = item.attachments && item.attachments.length > 0;

  const handleApproveClick = () => {
    item.onApprove();
    onToggleExpand();
  };

  const handleRejectClick = () => {
    if (rejectReasonInput.trim()) {
      item.onReject(rejectReasonInput);
      onToggleExpand();
      setShowRejectForm(false);
      setRejectReasonInput("");
    }
  };

  // Approved state
  if (item.status === 'approved') {
    return (
      <div
        className="flex items-center justify-between py-1.5 pl-5 rounded group transition-colors hover:bg-background/60"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <CheckCircle2 className="h-3 w-3 text-accent-green-text shrink-0" />
          <span className="text-xs text-muted-foreground">{item.label}</span>
          {hasAttachments && <AttachmentIndicator count={item.attachments!.length} />}
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-3">
          {item.onUndo && isHovered && (
            <button onClick={(e) => { e.stopPropagation(); item.onUndo!(); }} className="text-[10px] text-primary hover:text-primary/80 flex items-center gap-1 transition-colors font-medium">
              <Undo2 className="h-2.5 w-2.5" /> Undo
            </button>
          )}
          <span className="text-xs tabular-nums font-mono text-foreground">+{formatAmount(item.amount, currency)}</span>
        </div>
      </div>
    );
  }

  // Rejected state
  if (item.status === 'rejected') {
    return (
      <div
        className="pl-5 rounded group transition-colors hover:bg-background/30"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center justify-between py-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-muted-foreground/60 line-through">{item.label}</span>
            {hasAttachments && <AttachmentIndicator count={item.attachments!.length} />}
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            {item.onUndo && isHovered && (
              <button onClick={(e) => { e.stopPropagation(); item.onUndo!(); }} className="text-[10px] text-primary hover:text-primary/80 flex items-center gap-1 transition-colors font-medium">
                <Undo2 className="h-2.5 w-2.5" /> Undo
              </button>
            )}
            <span className="text-xs tabular-nums font-mono text-muted-foreground/40 line-through">+{formatAmount(item.amount, currency)}</span>
          </div>
        </div>
        {item.rejectionReason && (
          <div className="pb-1">
            <p className="text-[10px] text-destructive/70 leading-relaxed">
              <span className="font-medium">Rejected:</span> {item.rejectionReason}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Pending state
  return (
    <div className={cn(
      "pl-5 rounded transition-colors",
      isExpanded
        ? "bg-orange-50/80 dark:bg-orange-500/10 border border-orange-200/40 dark:border-orange-500/15 -mx-0.5 px-[calc(1.25rem+2px)]"
        : "hover:bg-orange-50/50 dark:hover:bg-orange-500/10"
    )}>
      <div
        className="flex items-center justify-between py-1.5 cursor-pointer"
        onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs text-foreground">{item.label}</span>
          <span className="text-[9px] font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400">pending</span>
          {!isExpanded && hasAttachments && <AttachmentIndicator count={item.attachments!.length} />}
        </div>
        <span className="text-xs tabular-nums font-mono text-foreground shrink-0 ml-3">+{formatAmount(item.amount, currency)}</span>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="overflow-hidden"
          >
            <div className="pb-2.5 space-y-2">
              {hasAttachments && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Paperclip className="h-2.5 w-2.5 text-muted-foreground/60" />
                    <span className="text-[10px] font-medium text-muted-foreground">Attachments ({item.attachments!.length})</span>
                  </div>
                  <AttachmentsList attachments={item.attachments!} compact />
                </div>
              )}
              {!showRejectForm ? (
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setShowRejectForm(true); }} className="flex-1 h-7 text-[11px] gap-1 border-red-200 text-red-600 bg-red-50/50 hover:bg-red-100 hover:text-red-700 hover:border-red-300 shadow-none">
                    <X className="h-3 w-3" /> Reject
                  </Button>
                  <Button size="sm" onClick={(e) => { e.stopPropagation(); handleApproveClick(); }} className="flex-1 h-7 text-[11px] gap-1 shadow-none">
                    <Check className="h-3 w-3" /> Approve
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 p-2.5 rounded-md border border-border/50 bg-background/80" onClick={(e) => e.stopPropagation()}>
                  <Textarea placeholder="Reason for rejection..." value={rejectReasonInput} onChange={(e) => setRejectReasonInput(e.target.value)} className="min-h-[50px] resize-none text-xs bg-background" autoFocus />
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setShowRejectForm(false); setRejectReasonInput(""); }} className="flex-1 h-7 text-[11px] shadow-none">Cancel</Button>
                    <Button size="sm" onClick={handleRejectClick} disabled={!rejectReasonInput.trim()} className="flex-1 h-7 text-[11px] bg-red-600 hover:bg-red-700 text-white shadow-none">Reject</Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
