/**
 * GroupedExpenseRow — Premium grouped expense card with individual approve/reject per item.
 * Used across Flow 1 (v4, v5) and Flow 6 (v3, v4) admin dashboards.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, X, Undo2, ChevronDown, Paperclip
} from 'lucide-react';
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

/* ─── Helpers ─── */

const formatAmount = (amt: number, curr: string) => {
  const symbols: Record<string, string> = { EUR: "€", NOK: "kr", PHP: "₱", USD: "$", SGD: "S$" };
  return `${symbols[curr] || curr}${Math.abs(amt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};


/* ─── Main Group Component ─── */

export const GroupedExpenseRow = ({
  groupLabel,
  items,
  currency,
  expandedItemId,
  onToggleItemExpand,
  isFinalized = false,
}: GroupedExpenseRowProps) => {
  const [isGroupOpen, setIsGroupOpen] = useState(true);
  const [hasBeenInteracted, setHasBeenInteracted] = useState(false);

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
  const pendingCount = items.filter(i => i.status === 'pending').length;
  const approvedCount = items.filter(i => i.status === 'approved').length;
  const allApproved = items.every(i => i.status === 'approved');
  const allRejected = items.every(i => i.status === 'rejected');
  const totalAttachments = items.reduce((sum, item) => sum + (item.attachments?.length || 0), 0);

  // Auto-collapse when the last pending item is resolved
  useEffect(() => {
    if (pendingCount < items.length) {
      setHasBeenInteracted(true);
    }
    if (hasBeenInteracted && pendingCount === 0) {
      setIsGroupOpen(false);
    }
  }, [pendingCount, items.length, hasBeenInteracted]);

  return (
    <div className={cn(
      "transition-all duration-200 mb-0.5",
      isGroupOpen
        ? "rounded-lg -mx-2 px-2 bg-card/60 border border-border/30 shadow-sm"
        : "",
      isGroupOpen && allRejected && "bg-muted/10 border-border/15 shadow-none",
      isGroupOpen && allApproved && "bg-accent-green/[0.03] border-accent-green/15 shadow-none",
    )}>
      {/* Group header — flush with parent row alignment */}
      <div
        className="flex items-center justify-between py-2.5 cursor-pointer group"
        onClick={() => setIsGroupOpen(!isGroupOpen)}
      >
        <div className="flex items-center gap-1 min-w-0">
          <span className={cn(
            "text-sm font-semibold truncate",
            allRejected ? "text-muted-foreground/50 line-through" : "text-foreground"
          )}>
            {groupLabel}
          </span>
          <ChevronDown className={cn(
            "h-3.5 w-3.5 text-muted-foreground/40 transition-transform duration-200 shrink-0",
            !isGroupOpen && "-rotate-90"
          )} />
          <div className="flex items-center gap-1.5 ml-1">
            {pendingCount > 0 && (
              <span className="text-[10px] font-medium text-orange-500 dark:text-orange-400">
                {pendingCount} pending
              </span>
            )}
            {approvedCount > 0 && pendingCount > 0 && (
              <span className="text-[10px] text-muted-foreground/50">·</span>
            )}
            {approvedCount > 0 && !allApproved && (
              <span className="text-[10px] font-medium text-accent-green-text">
                {approvedCount} approved
              </span>
            )}
            <span className="text-[10px] text-muted-foreground/50">
              {items.length} {items.length === 1 ? 'item' : 'items'}
              {totalAttachments > 0 && !isGroupOpen ? ` · ${totalAttachments} files` : ''}
            </span>
          </div>
        </div>
        <span className={cn(
          "whitespace-nowrap tabular-nums text-right font-mono shrink-0 ml-4 text-sm font-medium",
          allRejected ? "text-muted-foreground/30 line-through" : "text-foreground"
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
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-2 pt-0 space-y-0">
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

/* ─── Nested Item Card ─── */

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

  // ── Approved state ──
  if (item.status === 'approved') {
    return (
      <div
        className={cn("flex items-center gap-2.5 px-2.5 py-1 rounded-md transition-colors group", !isFinalized && "hover:bg-muted")}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
          {hasAttachments && (
            <span className="text-[10px] text-muted-foreground/50 ml-1.5">
              · <Paperclip className="h-2.5 w-2.5 inline -mt-px" /> {item.attachments!.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {item.onUndo && (
            <button
              onClick={(e) => { e.stopPropagation(); item.onUndo!(); }}
              className="text-[10px] text-primary hover:text-primary/80 flex items-center gap-1 transition-colors font-medium"
            >
              <Undo2 className="h-2.5 w-2.5" /> Undo
            </button>
          )}
          <span className="text-xs tabular-nums font-mono text-foreground/80">+{formatAmount(item.amount, currency)}</span>
        </div>
      </div>
    );
  }

  // ── Rejected state ──
  if (item.status === 'rejected') {
    return (
      <div
        className={cn("px-2.5 rounded-md transition-colors group", !isFinalized && "hover:bg-muted")}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center gap-2.5 py-1">
          <div className="flex-1 min-w-0">
            <span className="text-xs text-muted-foreground/50 line-through">{item.label}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {item.onUndo && (
              <button
                onClick={(e) => { e.stopPropagation(); item.onUndo!(); }}
                className="text-[10px] text-primary hover:text-primary/80 flex items-center gap-1 transition-colors font-medium"
              >
                <Undo2 className="h-2.5 w-2.5" /> Undo
              </button>
            )}
            <span className="text-xs tabular-nums font-mono text-muted-foreground/30 line-through">+{formatAmount(item.amount, currency)}</span>
          </div>
        </div>
        {item.rejectionReason && isHovered && (
          <div className="pb-2 pl-2.5">
            <p className="text-[10px] text-destructive/60 leading-relaxed">
              <span className="font-medium">Rejected:</span> {item.rejectionReason}
            </p>
          </div>
        )}
      </div>
    );
  }

  // ── Pending state ──
  return (
    <div className={cn(
      "rounded-md transition-all duration-150",
      isExpanded
        ? "bg-muted border border-border/30"
        : "hover:bg-muted border border-transparent"
    )}>
      <div
        className="flex items-center gap-2.5 px-2.5 py-1 cursor-pointer"
        onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-foreground">{item.label}</span>
            <span className={cn(
              "inline-flex items-center h-4 px-1.5 rounded text-[9px] font-semibold uppercase tracking-wide",
              "bg-orange-100/80 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400"
            )}>
              pending
            </span>
            {hasAttachments && !isExpanded && (
              <span className="text-[10px] text-muted-foreground/50 flex items-center gap-0.5">
                <Paperclip className="h-2.5 w-2.5" /> {item.attachments!.length}
              </span>
            )}
          </div>
        </div>
        <span className="text-xs tabular-nums font-mono font-medium text-foreground shrink-0">+{formatAmount(item.amount, currency)}</span>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-2.5 pb-2.5 space-y-2">
              {hasAttachments && (
                <div className="pl-2.5">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Paperclip className="h-2.5 w-2.5 text-muted-foreground/50" />
                    <span className="text-[10px] font-medium text-muted-foreground/70">
                      Attachments ({item.attachments!.length})
                    </span>
                  </div>
                  <AttachmentsList attachments={item.attachments!} compact />
                </div>
              )}
              {!showRejectForm ? (
                <div className="flex items-center gap-2 pl-2.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => { e.stopPropagation(); setShowRejectForm(true); }}
                    className="flex-1 h-8 text-[11px] gap-1.5 border-red-200/60 text-red-600 bg-red-50/30 hover:bg-red-100/60 hover:text-red-700 hover:border-red-300 shadow-none rounded-md"
                  >
                    <X className="h-3 w-3" /> Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); handleApproveClick(); }}
                    className="flex-1 h-8 text-[11px] gap-1.5 shadow-none rounded-md"
                  >
                    <Check className="h-3 w-3" /> Approve
                  </Button>
                </div>
              ) : (
                <div
                  className="space-y-2 p-2.5 rounded-md border border-border/40 bg-background/90 ml-2.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Textarea
                    placeholder="Reason for rejection..."
                    value={rejectReasonInput}
                    onChange={(e) => setRejectReasonInput(e.target.value)}
                    className="min-h-[50px] resize-none text-xs bg-background"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setShowRejectForm(false); setRejectReasonInput(""); }}
                      className="flex-1 h-7 text-[11px] shadow-none"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleRejectClick}
                      disabled={!rejectReasonInput.trim()}
                      className="flex-1 h-7 text-[11px] bg-red-600 hover:bg-red-700 text-white shadow-none"
                    >
                      Reject
                    </Button>
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
