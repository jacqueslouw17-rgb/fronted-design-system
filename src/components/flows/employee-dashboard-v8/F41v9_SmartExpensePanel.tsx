/**
 * Flow 4.1 — Employee Dashboard v9 (Future) ONLY
 * Smart Expense Reimbursement Panel
 * Upload-first receipt experience with auto-parsing, multi-currency grouping, and currency toggle.
 * INDEPENDENT: Changes here do NOT affect any other flow or version.
 */

import { useState, useCallback, useRef, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TagInput } from '@/components/flows/shared/TagInput';
import { toast } from 'sonner';
import { useF41v8_DashboardStore } from '@/stores/F41v8_DashboardStore';
import { cn } from '@/lib/utils';
import { Upload, X, FileText, Image as ImageIcon, ArrowLeft, Receipt, ArrowLeftRight, Check, Sparkles, AlertCircle, Pencil } from 'lucide-react';
import { validateFiles, FILE_UPLOAD_ACCEPT, FILE_UPLOAD_MAX_COUNT } from '../shared/fileUploadValidation';
import { convertToEUR, formatCurrencyAmount } from '../shared/CurrencyToggle';

// Supported currencies for receipts
const receiptCurrencies = [
  { code: 'NOK', label: 'Norwegian Krone', flag: '🇳🇴' },
  { code: 'ZAR', label: 'South African Rand', flag: '🇿🇦' },
  { code: 'BWP', label: 'Botswana Pula', flag: '🇧🇼' },
  { code: 'EUR', label: 'Euro', flag: '🇪🇺' },
  { code: 'USD', label: 'US Dollar', flag: '🇺🇸' },
  { code: 'GBP', label: 'British Pound', flag: '🇬🇧' },
  { code: 'PHP', label: 'Philippine Peso', flag: '🇵🇭' },
  { code: 'SEK', label: 'Swedish Krona', flag: '🇸🇪' },
  { code: 'DKK', label: 'Danish Krone', flag: '🇩🇰' },
  { code: 'CHF', label: 'Swiss Franc', flag: '🇨🇭' },
];

const expenseCategories = ['Travel', 'Meals', 'Accommodation', 'Transport', 'Equipment', 'Software', 'Other'];

// FX rates to EUR for conversion display
const fxToEUR: Record<string, number> = {
  EUR: 1, NOK: 0.087, ZAR: 0.051, BWP: 0.069, USD: 0.926,
  GBP: 1.176, PHP: 0.0167, SEK: 0.089, DKK: 0.134, CHF: 1.037,
};
const fxToNOK: Record<string, number> = {
  NOK: 1, EUR: 11.49, ZAR: 0.586, BWP: 0.793, USD: 10.64,
  GBP: 13.52, PHP: 0.192, SEK: 1.023, DKK: 1.541, CHF: 11.92,
};

interface ParsedReceipt {
  id: string;
  file: File;
  currency: string;
  amount: number;
  category: string;
  merchant: string;
  isParsing: boolean;
  isEditing: boolean;
}

interface F41v9_SmartExpensePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  localCurrency: string; // Employee's local currency e.g. NOK
  onBack?: () => void;
}

// Simulates AI parsing of a receipt — in production this would call an OCR/AI endpoint
function simulateReceiptParse(file: File): Omit<ParsedReceipt, 'id' | 'file' | 'isParsing' | 'isEditing'> {
  const name = file.name.toLowerCase();
  
  // Heuristic: try to guess from filename
  if (name.includes('zar') || name.includes('south_africa') || name.includes('cape')) {
    return { currency: 'ZAR', amount: Math.round(150 + Math.random() * 2500), category: 'Meals', merchant: 'Woolworths Food' };
  }
  if (name.includes('bwp') || name.includes('botswana') || name.includes('gaborone')) {
    return { currency: 'BWP', amount: Math.round(200 + Math.random() * 1800), category: 'Accommodation', merchant: 'Cresta Lodge' };
  }
  if (name.includes('nok') || name.includes('norway') || name.includes('oslo')) {
    return { currency: 'NOK', amount: Math.round(100 + Math.random() * 3000), category: 'Transport', merchant: 'SAS Airlines' };
  }
  if (name.includes('eur') || name.includes('euro')) {
    return { currency: 'EUR', amount: Math.round(20 + Math.random() * 500), category: 'Meals', merchant: 'Restaurant' };
  }
  
  // Random assignment for demo
  const currencies = ['ZAR', 'NOK', 'BWP'];
  const categories = ['Meals', 'Transport', 'Accommodation', 'Equipment'];
  const merchants = ['Uber', 'Hotel Garden Court', 'Nando\'s', 'Pick n Pay', 'Ruter AS', 'Engen Fuel'];
  const cur = currencies[Math.floor(Math.random() * currencies.length)];
  
  const ranges: Record<string, [number, number]> = {
    ZAR: [80, 3500], NOK: [50, 2500], BWP: [30, 2000],
  };
  const [min, max] = ranges[cur] || [50, 1000];
  
  return {
    currency: cur,
    amount: Math.round(min + Math.random() * (max - min)),
    category: categories[Math.floor(Math.random() * categories.length)],
    merchant: merchants[Math.floor(Math.random() * merchants.length)],
  };
}

function convertAmount(amount: number, from: string, to: string): number {
  if (from === to) return amount;
  // Convert via EUR as intermediary
  const inEUR = amount * (fxToEUR[from] || 1);
  if (to === 'EUR') return inEUR;
  const eurToTarget = fxToEUR[to] || 1;
  return inEUR / eurToTarget;
}

export const F41v9_SmartExpensePanel = ({ open, onOpenChange, localCurrency, onBack }: F41v9_SmartExpensePanelProps) => {
  const { addAdjustment } = useF41v8_DashboardStore();
  const [receipts, setReceipts] = useState<ParsedReceipt[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagError, setTagError] = useState('');
  const [displayCurrency, setDisplayCurrency] = useState<'original' | 'local' | 'eur'>('original');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setReceipts([]);
    setTags([]);
    setTagError('');
    setDisplayCurrency('original');
    setIsDragOver(false);
    onOpenChange(false);
  };

  const handleBack = () => {
    handleClose();
    onBack?.();
  };

  const processFiles = useCallback((files: File[]) => {
    const { valid, error } = validateFiles(files, receipts.length);
    if (error) {
      toast.error(error);
      return;
    }
    if (valid.length === 0) return;

    // Add as parsing
    const newReceipts: ParsedReceipt[] = valid.map(file => ({
      id: crypto.randomUUID(),
      file,
      currency: '',
      amount: 0,
      category: '',
      merchant: '',
      isParsing: true,
      isEditing: false,
    }));

    setReceipts(prev => [...prev, ...newReceipts]);

    // Simulate parsing with staggered delays
    newReceipts.forEach((receipt, idx) => {
      setTimeout(() => {
        const parsed = simulateReceiptParse(receipt.file);
        setReceipts(prev => prev.map(r =>
          r.id === receipt.id
            ? { ...r, ...parsed, isParsing: false }
            : r
        ));
      }, 600 + idx * 400);
    });
  }, [receipts.length]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  }, [processFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
    e.target.value = '';
  }, [processFiles]);

  const removeReceipt = (id: string) => {
    setReceipts(prev => prev.filter(r => r.id !== id));
  };

  const updateReceipt = (id: string, field: keyof ParsedReceipt, value: string | number) => {
    setReceipts(prev => prev.map(r =>
      r.id === id ? { ...r, [field]: value } : r
    ));
  };

  const toggleEdit = (id: string) => {
    setReceipts(prev => prev.map(r =>
      r.id === id ? { ...r, isEditing: !r.isEditing } : r
    ));
  };

  // Group receipts by currency
  const currencyGroups = useMemo(() => {
    const groups: Record<string, ParsedReceipt[]> = {};
    receipts.filter(r => !r.isParsing).forEach(r => {
      if (!groups[r.currency]) groups[r.currency] = [];
      groups[r.currency].push(r);
    });
    return groups;
  }, [receipts]);

  const currencyEntries = useMemo(() => Object.entries(currencyGroups), [currencyGroups]);

  // Totals per currency
  const currencyTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const [cur, items] of currencyEntries) {
      totals[cur] = items.reduce((sum, r) => sum + r.amount, 0);
    }
    return totals;
  }, [currencyEntries]);

  // Grand total in display currency
  const grandTotal = useMemo(() => {
    const targetCur = displayCurrency === 'local' ? localCurrency : displayCurrency === 'eur' ? 'EUR' : null;
    if (!targetCur) return null;
    return Object.entries(currencyTotals).reduce((sum, [cur, amt]) => {
      return sum + convertAmount(amt, cur, targetCur);
    }, 0);
  }, [currencyTotals, displayCurrency, localCurrency]);

  const isParsing = receipts.some(r => r.isParsing);
  const hasReceipts = receipts.length > 0;
  const parsedReceipts = receipts.filter(r => !r.isParsing);
  const canSubmit = parsedReceipts.length > 0 && parsedReceipts.every(r => r.amount > 0 && r.currency) && !isParsing;

  const handleSubmit = () => {
    if (parsedReceipts.length > 1 && tags.length === 0) {
      setTagError('Tag is required when submitting multiple expenses');
      return;
    }

    const hasTags = tags.length > 0;
    const totalInLocal = Object.entries(currencyTotals).reduce((sum, [cur, amt]) => {
      return sum + convertAmount(amt, cur, localCurrency);
    }, 0);

    if (hasTags) {
      const tagLabel = tags.join(', ');
      const currencySummary = Object.entries(currencyTotals)
        .map(([cur, amt]) => formatCurrencyAmount(amt, cur))
        .join(' + ');
      const label = `${parsedReceipts.length} receipt${parsedReceipts.length > 1 ? 's' : ''} · ${currencySummary}`;

      addAdjustment({
        type: 'Expense',
        label,
        amount: Math.round(totalInLocal),
        category: parsedReceipts[0].category,
        receiptUrl: URL.createObjectURL(parsedReceipts[0].file),
        tags,
      });
    } else {
      parsedReceipts.forEach(r => {
        const amtInLocal = convertAmount(r.amount, r.currency, localCurrency);
        addAdjustment({
          type: 'Expense',
          label: `${r.merchant} · ${formatCurrencyAmount(r.amount, r.currency)}`,
          amount: Math.round(amtInLocal),
          category: r.category,
          receiptUrl: URL.createObjectURL(r.file),
        });
      });
    }

    toast.success(`${parsedReceipts.length} expense${parsedReceipts.length > 1 ? 's' : ''} submitted for review.`);
    handleClose();
  };

  const getCurrencyFlag = (code: string) => {
    return receiptCurrencies.find(c => c.code === code)?.flag || '🏳️';
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-[85%] sm:w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-border/40 text-left">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 -ml-2"
              onClick={handleBack}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <SheetTitle>Expense reimbursement</SheetTitle>
              <SheetDescription className="text-xs mt-0.5">
                Upload receipts — we'll extract the details
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="py-6 space-y-5">
          {/* ── Upload Zone ── */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200",
              hasReceipts ? "p-4" : "p-8",
              isDragOver
                ? "border-primary bg-primary/5 scale-[1.01]"
                : "border-border/60 hover:border-primary/40 hover:bg-primary/[0.02]"
            )}
          >
            <div className={cn(
              "rounded-xl flex items-center justify-center transition-all",
              hasReceipts ? "w-10 h-10 bg-muted/50" : "w-14 h-14 bg-gradient-to-br from-primary/10 to-primary/5"
            )}>
              <Upload className={cn(
                "text-primary transition-all",
                hasReceipts ? "h-4 w-4" : "h-6 w-6",
                isDragOver && "animate-bounce"
              )} />
            </div>
            <div className="text-center">
              <p className={cn(
                "font-medium text-foreground",
                hasReceipts ? "text-xs" : "text-sm"
              )}>
                {hasReceipts ? 'Add more receipts' : 'Drop receipts here'}
              </p>
              {!hasReceipts && (
                <p className="text-xs text-muted-foreground mt-1">
                  or click to browse · JPG, PNG, PDF up to 5MB
                </p>
              )}
            </div>
            {isDragOver && (
              <div className="absolute inset-0 rounded-2xl bg-primary/5 flex items-center justify-center">
                <p className="text-sm font-medium text-primary">Drop to upload</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept={FILE_UPLOAD_ACCEPT}
              multiple
              className="hidden"
              onChange={handleFileInput}
            />
          </div>

          {/* ── Parsing indicator ── */}
          {isParsing && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20">
              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
              <span className="text-xs text-primary font-medium">Scanning receipts...</span>
            </div>
          )}

          {/* ── Parsed receipts list grouped by currency ── */}
          {parsedReceipts.length > 0 && (
            <div className="space-y-4">
              {/* Currency toggle */}
              {currencyEntries.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-muted-foreground mr-1">View in:</span>
                  {['original', 'local', 'eur'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setDisplayCurrency(mode as any)}
                      className={cn(
                        "px-2 py-1 rounded-md text-[11px] font-medium transition-all border",
                        displayCurrency === mode
                          ? "bg-primary/10 text-primary border-primary/30"
                          : "text-muted-foreground border-border/40 hover:border-primary/30 hover:bg-primary/5"
                      )}
                    >
                      {mode === 'original' ? 'Original' : mode === 'local' ? localCurrency : 'EUR'}
                    </button>
                  ))}
                </div>
              )}

              {/* Currency groups */}
              {currencyEntries.map(([currency, items]) => (
                <div key={currency} className="space-y-1.5">
                  {/* Currency group header */}
                  {currencyEntries.length > 1 && (
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-sm">{getCurrencyFlag(currency)}</span>
                      <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">{currency}</span>
                      <div className="flex-1 h-px bg-border/40" />
                      <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
                        {displayCurrency === 'original'
                          ? formatCurrencyAmount(currencyTotals[currency], currency)
                          : displayCurrency === 'local'
                            ? `≈ ${formatCurrencyAmount(convertAmount(currencyTotals[currency], currency, localCurrency), localCurrency)}`
                            : `≈ ${formatCurrencyAmount(convertAmount(currencyTotals[currency], currency, 'EUR'), 'EUR')}`
                        }
                      </span>
                    </div>
                  )}

                  {/* Receipt items */}
                  {items.map(receipt => (
                    <div
                      key={receipt.id}
                      className="group rounded-xl border border-border/50 bg-card/50 overflow-hidden transition-all hover:border-border/80"
                    >
                      <div className="flex items-center gap-2.5 px-3 py-2.5">
                        {/* File icon */}
                        <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                          {receipt.file.type.startsWith('image/')
                            ? <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                            : <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                          }
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{receipt.merchant}</p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {receipt.category} · {receipt.file.name}
                          </p>
                        </div>

                        {/* Amount */}
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold tabular-nums text-foreground">
                            {displayCurrency === 'original'
                              ? formatCurrencyAmount(receipt.amount, receipt.currency)
                              : displayCurrency === 'local'
                                ? `≈ ${formatCurrencyAmount(convertAmount(receipt.amount, receipt.currency, localCurrency), localCurrency)}`
                                : `≈ ${formatCurrencyAmount(convertAmount(receipt.amount, receipt.currency, 'EUR'), 'EUR')}`
                            }
                          </p>
                          {displayCurrency !== 'original' && (
                            <p className="text-[10px] text-muted-foreground/60 tabular-nums">
                              {formatCurrencyAmount(receipt.amount, receipt.currency)}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-0.5 shrink-0">
                          <button
                            onClick={() => toggleEdit(receipt.id)}
                            className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
                          >
                            <Pencil className="h-3 w-3 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => removeReceipt(receipt.id)}
                            className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10"
                          >
                            <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>
                      </div>

                      {/* Edit row — expandable */}
                      {receipt.isEditing && (
                        <div className="px-3 pb-3 pt-1 border-t border-border/30 space-y-2.5 bg-muted/20">
                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1">
                              <Label className="text-[10px] text-muted-foreground">Currency</Label>
                              <Select value={receipt.currency} onValueChange={v => updateReceipt(receipt.id, 'currency', v)}>
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {receiptCurrencies.map(c => (
                                    <SelectItem key={c.code} value={c.code}>
                                      {c.flag} {c.code}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] text-muted-foreground">Amount</Label>
                              <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={receipt.amount || ''}
                                onChange={e => updateReceipt(receipt.id, 'amount', parseFloat(e.target.value) || 0)}
                                className="h-8 text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] text-muted-foreground">Category</Label>
                              <Select value={receipt.category} onValueChange={v => updateReceipt(receipt.id, 'category', v)}>
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {expenseCategories.map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground">Merchant</Label>
                            <Input
                              value={receipt.merchant}
                              onChange={e => updateReceipt(receipt.id, 'merchant', e.target.value)}
                              className="h-8 text-xs"
                              placeholder="e.g. Uber, Hotel, Restaurant"
                            />
                          </div>
                          <button
                            onClick={() => toggleEdit(receipt.id)}
                            className="text-[11px] text-primary font-medium hover:underline"
                          >
                            Done editing
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}

              {/* ── Grand total ── */}
              <div className="rounded-xl border border-border/50 bg-muted/30 p-3 space-y-2">
                {/* Per-currency subtotals (in original) */}
                {currencyEntries.length > 1 && displayCurrency === 'original' && (
                  <div className="space-y-1">
                    {currencyEntries.map(([cur, items]) => (
                      <div key={cur} className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{getCurrencyFlag(cur)} {cur} subtotal</span>
                        <span className="text-xs font-medium tabular-nums">{formatCurrencyAmount(currencyTotals[cur], cur)}</span>
                      </div>
                    ))}
                    <div className="h-px bg-border/40 my-1" />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Total</span>
                  <div className="text-right">
                    {displayCurrency !== 'original' && grandTotal !== null ? (
                      <>
                        <span className="text-base font-bold tabular-nums text-foreground">
                          ≈ {formatCurrencyAmount(grandTotal, displayCurrency === 'local' ? localCurrency : 'EUR')}
                        </span>
                        <p className="text-[10px] text-muted-foreground/60">
                          across {currencyEntries.length} currenc{currencyEntries.length > 1 ? 'ies' : 'y'}
                        </p>
                      </>
                    ) : currencyEntries.length === 1 ? (
                      <span className="text-base font-bold tabular-nums text-foreground">
                        {formatCurrencyAmount(Object.values(currencyTotals)[0], Object.keys(currencyTotals)[0])}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Multiple currencies — switch view above
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Tag ── */}
              <TagInput
                tags={tags}
                onChange={(t) => { setTags(t); setTagError(''); }}
                maxTags={1}
                required={parsedReceipts.length > 1}
                error={tagError}
              />

              {/* ── Submit ── */}
              <Button onClick={handleSubmit} className="w-full" disabled={!canSubmit}>
                {isParsing ? 'Scanning...' : `Submit ${parsedReceipts.length} expense${parsedReceipts.length > 1 ? 's' : ''}`}
              </Button>
            </div>
          )}

          {/* Empty state hint */}
          {!hasReceipts && (
            <div className="flex items-start gap-3 px-3 py-3 rounded-xl bg-muted/30 border border-border/30">
              <Receipt className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-foreground mb-0.5">How it works</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Upload your receipts — any currency. We'll detect the amounts, 
                  categories, and currencies automatically. You can review and edit before submitting.
                </p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
