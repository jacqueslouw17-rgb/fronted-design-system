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
import { Upload, X, ArrowLeft, Pencil } from 'lucide-react';
import { validateFiles, FILE_UPLOAD_ACCEPT } from '../shared/fileUploadValidation';
import { formatCurrencyAmount } from '../shared/CurrencyToggle';

const receiptCurrencies = [
  { code: 'NOK', flag: '🇳🇴' },
  { code: 'ZAR', flag: '🇿🇦' },
  { code: 'BWP', flag: '🇧🇼' },
  { code: 'EUR', flag: '🇪🇺' },
  { code: 'USD', flag: '🇺🇸' },
  { code: 'GBP', flag: '🇬🇧' },
  { code: 'PHP', flag: '🇵🇭' },
  { code: 'SEK', flag: '🇸🇪' },
  { code: 'DKK', flag: '🇩🇰' },
  { code: 'CHF', flag: '🇨🇭' },
];

const expenseCategories = ['Travel', 'Meals', 'Accommodation', 'Transport', 'Equipment', 'Software', 'Other'];

const fxToEUR: Record<string, number> = {
  EUR: 1, NOK: 0.087, ZAR: 0.051, BWP: 0.069, USD: 0.926,
  GBP: 1.176, PHP: 0.0167, SEK: 0.089, DKK: 0.134, CHF: 1.037,
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
  localCurrency: string;
  onBack?: () => void;
}

function simulateReceiptParse(file: File): Omit<ParsedReceipt, 'id' | 'file' | 'isParsing' | 'isEditing'> {
  const name = file.name.toLowerCase();
  if (name.includes('zar') || name.includes('south_africa') || name.includes('cape'))
    return { currency: 'ZAR', amount: Math.round(150 + Math.random() * 2500), category: 'Meals', merchant: 'Woolworths Food' };
  if (name.includes('bwp') || name.includes('botswana') || name.includes('gaborone'))
    return { currency: 'BWP', amount: Math.round(200 + Math.random() * 1800), category: 'Accommodation', merchant: 'Cresta Lodge' };
  if (name.includes('nok') || name.includes('norway') || name.includes('oslo'))
    return { currency: 'NOK', amount: Math.round(100 + Math.random() * 3000), category: 'Transport', merchant: 'SAS Airlines' };
  if (name.includes('eur') || name.includes('euro'))
    return { currency: 'EUR', amount: Math.round(20 + Math.random() * 500), category: 'Meals', merchant: 'Restaurant' };

  const currencies = ['ZAR', 'NOK', 'BWP'];
  const categories = ['Meals', 'Transport', 'Accommodation', 'Equipment'];
  const merchants = ['Uber', 'Hotel Garden Court', 'Nando\'s', 'Pick n Pay', 'Ruter AS', 'Engen Fuel'];
  const cur = currencies[Math.floor(Math.random() * currencies.length)];
  const ranges: Record<string, [number, number]> = { ZAR: [80, 3500], NOK: [50, 2500], BWP: [30, 2000] };
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
    setReceipts([]); setTags([]); setTagError('');
    setDisplayCurrency('original'); setIsDragOver(false);
    onOpenChange(false);
  };

  const handleBack = () => { handleClose(); onBack?.(); };

  const processFiles = useCallback((files: File[]) => {
    const { valid, error } = validateFiles(files, receipts.length);
    if (error) { toast.error(error); return; }
    if (valid.length === 0) return;

    const newReceipts: ParsedReceipt[] = valid.map(file => ({
      id: crypto.randomUUID(), file, currency: '', amount: 0,
      category: '', merchant: '', isParsing: true, isEditing: false,
    }));
    setReceipts(prev => [...prev, ...newReceipts]);

    newReceipts.forEach((receipt, idx) => {
      setTimeout(() => {
        const parsed = simulateReceiptParse(receipt.file);
        setReceipts(prev => prev.map(r =>
          r.id === receipt.id ? { ...r, ...parsed, isParsing: false } : r
        ));
      }, 600 + idx * 400);
    });
  }, [receipts.length]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    processFiles(Array.from(e.dataTransfer.files));
  }, [processFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(Array.from(e.target.files || []));
    e.target.value = '';
  }, [processFiles]);

  const removeReceipt = (id: string) => setReceipts(prev => prev.filter(r => r.id !== id));

  const updateReceipt = (id: string, field: keyof ParsedReceipt, value: string | number) => {
    setReceipts(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const toggleEdit = (id: string) => {
    setReceipts(prev => prev.map(r => r.id === id ? { ...r, isEditing: !r.isEditing } : r));
  };

  const currencyGroups = useMemo(() => {
    const groups: Record<string, ParsedReceipt[]> = {};
    receipts.filter(r => !r.isParsing).forEach(r => {
      if (!groups[r.currency]) groups[r.currency] = [];
      groups[r.currency].push(r);
    });
    return groups;
  }, [receipts]);

  const currencyEntries = useMemo(() => Object.entries(currencyGroups), [currencyGroups]);

  const currencyTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const [cur, items] of currencyEntries) {
      totals[cur] = items.reduce((sum, r) => sum + r.amount, 0);
    }
    return totals;
  }, [currencyEntries]);

  const grandTotal = useMemo(() => {
    const targetCur = displayCurrency === 'local' ? localCurrency : displayCurrency === 'eur' ? 'EUR' : null;
    if (!targetCur) return null;
    return Object.entries(currencyTotals).reduce((sum, [cur, amt]) => sum + convertAmount(amt, cur, targetCur), 0);
  }, [currencyTotals, displayCurrency, localCurrency]);

  const isParsing = receipts.some(r => r.isParsing);
  const hasReceipts = receipts.length > 0;
  const parsedReceipts = receipts.filter(r => !r.isParsing);
  const canSubmit = parsedReceipts.length > 0 && parsedReceipts.every(r => r.amount > 0 && r.currency) && !isParsing;
  const isMultiCurrency = currencyEntries.length > 1;

  const handleSubmit = () => {
    if (parsedReceipts.length > 1 && tags.length === 0) {
      setTagError('Tag is required when submitting multiple expenses');
      return;
    }
    const hasTags = tags.length > 0;
    const totalInLocal = Object.entries(currencyTotals).reduce((sum, [cur, amt]) => sum + convertAmount(amt, cur, localCurrency), 0);

    if (hasTags) {
      const currencySummary = Object.entries(currencyTotals).map(([cur, amt]) => formatCurrencyAmount(amt, cur)).join(' + ');
      addAdjustment({
        type: 'Expense',
        label: `${parsedReceipts.length} receipt${parsedReceipts.length > 1 ? 's' : ''} · ${currencySummary}`,
        amount: Math.round(totalInLocal),
        category: parsedReceipts[0].category,
        receiptUrl: URL.createObjectURL(parsedReceipts[0].file),
        tags,
      });
    } else {
      parsedReceipts.forEach(r => {
        addAdjustment({
          type: 'Expense',
          label: `${r.merchant} · ${formatCurrencyAmount(r.amount, r.currency)}`,
          amount: Math.round(convertAmount(r.amount, r.currency, localCurrency)),
          category: r.category,
          receiptUrl: URL.createObjectURL(r.file),
        });
      });
    }
    toast.success(`${parsedReceipts.length} expense${parsedReceipts.length > 1 ? 's' : ''} submitted for review.`);
    handleClose();
  };

  const getFlag = (code: string) => receiptCurrencies.find(c => c.code === code)?.flag || '🏳️';

  const formatDisplay = (amount: number, originalCurrency: string) => {
    if (displayCurrency === 'original') return formatCurrencyAmount(amount, originalCurrency);
    const target = displayCurrency === 'local' ? localCurrency : 'EUR';
    if (originalCurrency === target) return formatCurrencyAmount(amount, target);
    return `≈ ${formatCurrencyAmount(convertAmount(amount, originalCurrency, target), target)}`;
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-[85%] sm:w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-border/40 text-left">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <SheetTitle>Expense reimbursement</SheetTitle>
              <SheetDescription className="text-xs mt-0.5">
                Upload receipts to get started
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="py-5 space-y-4">
          {/* ── Upload zone ── */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed cursor-pointer transition-all",
              hasReceipts ? "py-3 px-4" : "py-7 px-4",
              isDragOver
                ? "border-primary/60 bg-primary/[0.04]"
                : "border-border/50 hover:border-border"
            )}
          >
            <Upload className={cn(
              "text-muted-foreground/60",
              hasReceipts ? "h-4 w-4" : "h-5 w-5"
            )} />
            <p className={cn("text-muted-foreground", hasReceipts ? "text-[11px]" : "text-xs")}>
              {hasReceipts ? 'Upload more' : 'Drop receipts or click to browse'}
            </p>
            {!hasReceipts && (
              <p className="text-[10px] text-muted-foreground/50">JPG, PNG, PDF · max 5MB each</p>
            )}
            <input ref={fileInputRef} type="file" accept={FILE_UPLOAD_ACCEPT} multiple className="hidden" onChange={handleFileInput} />
          </div>

          {/* ── Scanning state ── */}
          {isParsing && (
            <p className="text-[11px] text-muted-foreground animate-pulse px-1">
              Reading receipts…
            </p>
          )}

          {/* ── Receipt list ── */}
          {parsedReceipts.length > 0 && (
            <div className="space-y-3">
              {/* Currency view toggle — only show when multi-currency */}
              {isMultiCurrency && (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-muted-foreground/70 mr-1 uppercase tracking-wider">Show</span>
                  {(['original', 'local', 'eur'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setDisplayCurrency(mode)}
                      className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-medium transition-colors",
                        displayCurrency === mode
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {mode === 'original' ? 'Original' : mode === 'local' ? localCurrency : 'EUR'}
                    </button>
                  ))}
                </div>
              )}

              {/* Items — grouped by currency when in original mode and multi-currency */}
              {isMultiCurrency && displayCurrency === 'original' ? (
                // Grouped by currency
                currencyEntries.map(([currency, items]) => (
                  <div key={currency} className="space-y-px">
                    <div className="flex items-center gap-1.5 py-1.5 px-0.5">
                      <span className="text-xs">{getFlag(currency)}</span>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{currency}</span>
                      <div className="flex-1 h-px bg-border/30" />
                      <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
                        {formatCurrencyAmount(currencyTotals[currency], currency)}
                      </span>
                    </div>
                    {items.map(receipt => renderReceiptRow(receipt))}
                  </div>
                ))
              ) : (
                // Flat list (single currency or converted view)
                parsedReceipts.map(receipt => renderReceiptRow(receipt))
              )}

              {/* ── Totals ── */}
              <div className="border-t border-border/40 pt-3 space-y-1.5">
                {/* Per-currency subtotals when viewing in converted mode */}
                {isMultiCurrency && displayCurrency !== 'original' && (
                  currencyEntries.map(([cur]) => (
                    <div key={cur} className="flex items-center justify-between px-0.5">
                      <span className="text-[11px] text-muted-foreground">{getFlag(cur)} {cur}</span>
                      <span className="text-[11px] tabular-nums text-muted-foreground">
                        {formatDisplay(currencyTotals[cur], cur)}
                      </span>
                    </div>
                  ))
                )}
                <div className="flex items-center justify-between px-0.5">
                  <span className="text-xs font-medium text-foreground">Total</span>
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {displayCurrency !== 'original' && grandTotal !== null
                      ? `≈ ${formatCurrencyAmount(grandTotal, displayCurrency === 'local' ? localCurrency : 'EUR')}`
                      : currencyEntries.length === 1
                        ? formatCurrencyAmount(Object.values(currencyTotals)[0], Object.keys(currencyTotals)[0])
                        : currencyEntries.map(([cur]) => formatCurrencyAmount(currencyTotals[cur], cur)).join(' + ')
                    }
                  </span>
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
                {isParsing ? 'Reading…' : `Submit ${parsedReceipts.length} expense${parsedReceipts.length > 1 ? 's' : ''}`}
              </Button>
            </div>
          )}

          {/* Empty hint */}
          {!hasReceipts && (
            <p className="text-[11px] text-muted-foreground/60 leading-relaxed px-0.5">
              Upload one or more receipts in any currency. Amounts, categories, and currencies are detected automatically — you can always correct them.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );

  function renderReceiptRow(receipt: ParsedReceipt) {
    return (
      <div key={receipt.id} className="group">
        <div className="flex items-center gap-2 py-1.5 px-0.5">
          {/* Merchant + category */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-foreground truncate">{receipt.merchant}</span>
              <span className="text-[10px] text-muted-foreground/50">·</span>
              <span className="text-[10px] text-muted-foreground truncate">{receipt.category}</span>
            </div>
            <p className="text-[10px] text-muted-foreground/40 truncate">{receipt.file.name}</p>
          </div>

          {/* Amount — right aligned */}
          <div className="text-right shrink-0 min-w-[80px]">
            <p className="text-xs font-medium tabular-nums text-foreground">
              {formatDisplay(receipt.amount, receipt.currency)}
            </p>
            {displayCurrency !== 'original' && receipt.currency !== (displayCurrency === 'local' ? localCurrency : 'EUR') && (
              <p className="text-[10px] text-muted-foreground/40 tabular-nums">
                {formatCurrencyAmount(receipt.amount, receipt.currency)}
              </p>
            )}
          </div>

          {/* Hover actions */}
          <div className="flex items-center shrink-0 w-10 justify-end">
            <button
              onClick={() => toggleEdit(receipt.id)}
              className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted/60"
            >
              <Pencil className="h-2.5 w-2.5 text-muted-foreground" />
            </button>
            <button
              onClick={() => removeReceipt(receipt.id)}
              className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10"
            >
              <X className="h-2.5 w-2.5 text-muted-foreground hover:text-destructive" />
            </button>
          </div>
        </div>

        {/* Inline edit */}
        {receipt.isEditing && (
          <div className="ml-0.5 mb-2 p-2.5 rounded-lg bg-muted/30 border border-border/30 space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-0.5">
                <Label className="text-[10px] text-muted-foreground/70">Currency</Label>
                <Select value={receipt.currency} onValueChange={v => updateReceipt(receipt.id, 'currency', v)}>
                  <SelectTrigger className="h-7 text-[11px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {receiptCurrencies.map(c => (
                      <SelectItem key={c.code} value={c.code}>{c.flag} {c.code}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-0.5">
                <Label className="text-[10px] text-muted-foreground/70">Amount</Label>
                <Input
                  type="number" step="0.01" min="0.01"
                  value={receipt.amount || ''}
                  onChange={e => updateReceipt(receipt.id, 'amount', parseFloat(e.target.value) || 0)}
                  className="h-7 text-[11px]"
                />
              </div>
              <div className="space-y-0.5">
                <Label className="text-[10px] text-muted-foreground/70">Category</Label>
                <Select value={receipt.category} onValueChange={v => updateReceipt(receipt.id, 'category', v)}>
                  <SelectTrigger className="h-7 text-[11px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map(cat => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-0.5">
                <Label className="text-[10px] text-muted-foreground/70">Merchant</Label>
                <Input
                  value={receipt.merchant}
                  onChange={e => updateReceipt(receipt.id, 'merchant', e.target.value)}
                  className="h-7 text-[11px]"
                />
              </div>
              <button
                onClick={() => toggleEdit(receipt.id)}
                className="text-[10px] text-primary font-medium hover:underline pb-1.5 shrink-0"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
};
