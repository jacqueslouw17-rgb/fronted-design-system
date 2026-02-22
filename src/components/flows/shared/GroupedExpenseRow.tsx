/**
 * GroupedExpenseRow — Premium grouped expense card with individual approve/reject per item.
 * Used across Flow 1 (v4, v5) and Flow 6 (v3, v4) admin dashboards.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, X, CheckCircle2, Undo2, ChevronDown,
  Paperclip, Plane, UtensilsCrossed, Car, Hotel,
  ShoppingBag, Receipt, FileText, Tag
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

const getCategoryIcon = (label: string) => {
  const l = label.toLowerCase();
  if (l.includes('travel') || l.includes('flight')) return Plane;
  if (l.includes('meal') || l.includes('food') || l.includes('dinner') || l.includes('lunch')) return UtensilsCrossed;
  if (l.includes('transport') || l.includes('taxi') || l.includes('uber') || l.includes('car')) return Car;
  if (l.includes('hotel') || l.includes('accommodation') || l.includes('lodging')) return Hotel;
  if (l.includes('shopping') || l.includes('supplies') || l.includes('equipment')) return ShoppingBag;
  return Receipt;
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

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
  const pendingCount = items.filter(i => i.status === 'pending').length;
  const approvedCount = items.filter(i => i.status === 'approved').length;
  const allApproved = items.every(i => i.status === 'approved');
  const allRejected = items.every(i => i.status === 'rejected');
  const totalAttachments = items.reduce((sum, item) => sum + (item.attachments?.length || 0), 0);

  return (
    <div className={cn(
      "-mx-3 rounded-lg transition-all duration-200 mb-1.5",
      allRejected
        ? "bg-muted/10 border border-border/15"
        : allApproved
          ? "bg-accent-green/[0.03] border border-accent-green/15"
          : "bg-card/60 border border-border/30 shadow-sm"
    )}>
      {/* Group header */}
      <div
        className="flex items-center justify-between px-3.5 py-2.5 cursor-pointer group"
        onClick={() => setIsGroupOpen(!isGroupOpen)}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={cn(
            "flex items-center justify-center h-7 w-7 rounded-md shrink-0 transition-colors",
            allRejected
              ? "bg-muted/30 border border-border/20"
              : allApproved
                ? "bg-accent-green/10 border border-accent-green/20"
                : "bg-primary/[0.06] border border-primary/15"
          )}>
            <Tag className={cn(
              "h-3.5 w-3.5",
              allRejected ? "text-muted-foreground/40" : allApproved ? "text-accent-green-text" : "text-primary/70"
            )} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-sm font-semibold truncate",
                allRejected ? "text-muted-foreground/50 line-through" : "text-foreground"
              )}>
                {groupLabel}
              </span>
              {allApproved && <CheckCircle2 className="h-3.5 w-3.5 text-accent-green-text shrink-0" />}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
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
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-3">
          <span className={cn(
            "text-sm tabular-nums font-mono font-medium",
            allRejected ? "text-muted-foreground/30 line-through" : "text-foreground"
          )}>
            +{formatAmount(totalAmount, currency)}
          </span>
          <ChevronDown className={cn(
            "h-3.5 w-3.5 text-muted-foreground/40 transition-transform duration-200",
            !isGroupOpen && "-rotate-90"
          )} />
        </div>
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
            <div className="px-3 pb-3 pt-0.5 space-y-1">
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
  const Icon = getCategoryIcon(item.label);

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
        className="flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-colors hover:bg-background/60 group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center justify-center h-7 w-7 rounded-md bg-accent-green/10 border border-accent-green/20 shrink-0">
          <CheckCircle2 className="h-3.5 w-3.5 text-accent-green-text" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
          {hasAttachments && (
            <span className="text-[10px] text-muted-foreground/50 ml-1.5">
              · <Paperclip className="h-2.5 w-2.5 inline -mt-px" /> {item.attachments!.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {item.onUndo && isHovered && (
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
        className="px-2.5 rounded-md transition-colors hover:bg-background/30 group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center gap-2.5 py-2">
          <div className="flex items-center justify-center h-7 w-7 rounded-md bg-destructive/[0.06] border border-destructive/15 shrink-0">
            <X className="h-3.5 w-3.5 text-destructive/50" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs text-muted-foreground/50 line-through">{item.label}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {item.onUndo && isHovered && (
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
        {item.rejectionReason && (
          <div className="pb-2 pl-[38px]">
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
        ? "bg-orange-50/60 dark:bg-orange-500/[0.06] border border-orange-200/30 dark:border-orange-500/15 shadow-sm"
        : "hover:bg-muted/30 border border-transparent"
    )}>
      <div
        className="flex items-center gap-2.5 px-2.5 py-2 cursor-pointer"
        onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
      >
        <div className={cn(
          "flex items-center justify-center h-7 w-7 rounded-md shrink-0 transition-colors",
          isExpanded
            ? "bg-orange-100/80 dark:bg-orange-500/15 border border-orange-200/50 dark:border-orange-500/20"
            : "bg-primary/[0.06] border border-primary/15"
        )}>
          <Icon className={cn(
            "h-3.5 w-3.5",
            isExpanded ? "text-orange-600 dark:text-orange-400" : "text-primary/70"
          )} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-foreground">{item.label}</span>
            <span className={cn(
              "inline-flex items-center h-4 px-1.5 rounded text-[9px] font-semibold uppercase tracking-wide",
              "bg-orange-100/80 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400"
            )}>
              pending
            </span>
          </div>
          {hasAttachments && !isExpanded && (
            <span className="text-[10px] text-muted-foreground/50 flex items-center gap-0.5 mt-0.5">
              <Paperclip className="h-2.5 w-2.5" /> {item.attachments!.length} {item.attachments!.length === 1 ? 'file' : 'files'}
            </span>
          )}
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
                <div className="pl-[38px]">
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
                <div className="flex items-center gap-2 pl-[38px]">
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
                  className="space-y-2 p-2.5 rounded-md border border-border/40 bg-background/90 ml-[38px]"
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
