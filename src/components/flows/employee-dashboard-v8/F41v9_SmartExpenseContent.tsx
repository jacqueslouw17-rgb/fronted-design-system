/**
 * Flow 4.1 — Employee Dashboard v9 (Future) ONLY
 * Smart Expense Reimbursement Content
 * Content-only version for rendering inside an existing side panel.
 */

import { useState, useCallback, useRef, useMemo } from 'react';
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
import { Upload, X, Pencil } from 'lucide-react';
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
  EUR: 1,
  NOK: 0.087,
  ZAR: 0.051,
  BWP: 0.069,
  USD: 0.926,
  GBP: 1.176,
  PHP: 0.0167,
  SEK: 0.089,
  DKK: 0.134,
  CHF: 1.037,
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

interface F41v9_SmartExpenseContentProps {
  localCurrency: string;
  onSubmitted?: () => void;
}

let uploadCounter = 0;

function simulateReceiptParse(file: File): Omit<ParsedReceipt, 'id' | 'file' | 'isParsing' | 'isEditing'> {
  const name = file.name.toLowerCase();

  if (name.includes('zar') || name.includes('south_africa') || name.includes('cape')) {
    return { currency: 'ZAR', amount: Math.round(150 + Math.random() * 2500), category: 'Meals', merchant: 'Woolworths Food' };
  }

  if (name.includes('bwp') || name.includes('botswana') || name.includes('gaborone')) {
    return { currency: 'BWP', amount: Math.round(200 + Math.random() * 1800), category: 'Accommodation', merchant: 'Cresta Lodge' };
  }

  if (name.includes('nok') || name.includes('norway') || name.includes('oslo')) {
    return { currency: 'NOK', amount: Math.round(100 + Math.random() * 3000), category: 'Transport', merchant: 'SAS Airlines' };
  }

  const pool = [
    { currency: 'ZAR', merchants: ['Woolworths', 'Pick n Pay', 'Engen Fuel', "Nando's"], categories: ['Meals', 'Transport', 'Equipment'], range: [120, 3200] as [number, number] },
    { currency: 'BWP', merchants: ['Cresta Lodge', 'Choppies', 'FNB Botswana', 'Shell Gaborone'], categories: ['Accommodation', 'Meals', 'Transport'], range: [180, 2400] as [number, number] },
    { currency: 'NOK', merchants: ['Ruter AS', 'Kiwi Dagligvare', 'Circle K', 'SAS'], categories: ['Transport', 'Meals', 'Travel'], range: [85, 2800] as [number, number] },
  ];

  const pick = pool[uploadCounter % pool.length];
  uploadCounter += 1;

  const [min, max] = pick.range;
  return {
    currency: pick.currency,
    amount: Math.round(min + Math.random() * (max - min)),
    category: pick.categories[Math.floor(Math.random() * pick.categories.length)],
    merchant: pick.merchants[Math.floor(Math.random() * pick.merchants.length)],
  };
}

function convertAmount(amount: number, from: string, to: string): number {
  if (from === to) return amount;
  const inEUR = amount * (fxToEUR[from] || 1);
  if (to === 'EUR') return inEUR;
  const eurToTarget = fxToEUR[to] || 1;
  return inEUR / eurToTarget;
}

export const F41v9_SmartExpenseContent = ({ localCurrency, onSubmitted }: F41v9_SmartExpenseContentProps) => {
  const { addAdjustment } = useF41v8_DashboardStore();
  const [receipts, setReceipts] = useState<ParsedReceipt[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagError, setTagError] = useState('');
  const [displayCurrency, setDisplayCurrency] = useState<'original' | 'local' | 'eur'>('original');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback((files: File[]) => {
    const { valid, error } = validateFiles(files, receipts.length);
    if (error) {
      toast.error(error);
      return;
    }
    if (valid.length === 0) return;

    const newReceipts: ParsedReceipt[] = valid.map((file) => ({
      id: crypto.randomUUID(),
      file,
      currency: '',
      amount: 0,
      category: '',
      merchant: '',
      isParsing: true,
      isEditing: false,
    }));

    setReceipts((prev) => [...prev, ...newReceipts]);

    newReceipts.forEach((receipt, idx) => {
      setTimeout(() => {
        const parsed = simulateReceiptParse(receipt.file);
        setReceipts((prev) => prev.map((r) => (r.id === receipt.id ? { ...r, ...parsed, isParsing: false } : r)));
      }, 600 + idx * 400);
    });
  }, [receipts.length]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    processFiles(Array.from(e.dataTransfer.files));
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
    processFiles(Array.from(e.target.files || []));
    e.target.value = '';
  }, [processFiles]);

  const removeReceipt = (id: string) => setReceipts((prev) => prev.filter((r) => r.id !== id));

  const updateReceipt = (id: string, field: keyof ParsedReceipt, value: string | number) => {
    setReceipts((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const toggleEdit = (id: string) => {
    setReceipts((prev) => prev.map((r) => (r.id === id ? { ...r, isEditing: !r.isEditing } : r)));
  };

  const currencyGroups = useMemo(() => {
    const groups: Record<string, ParsedReceipt[]> = {};
    receipts.filter((r) => !r.isParsing).forEach((r) => {
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

  const isParsing = receipts.some((r) => r.isParsing);
  const hasReceipts = receipts.length > 0;
  const parsedReceipts = receipts.filter((r) => !r.isParsing);
  const canSubmit = parsedReceipts.length > 0 && parsedReceipts.every((r) => r.amount > 0 && r.currency) && !isParsing;
  const isMultiCurrency = currencyEntries.length > 1;

  const getFlag = (code: string) => receiptCurrencies.find((c) => c.code === code)?.flag || '🏳️';

  const formatDisplay = (amount: number, originalCurrency: string) => {
    if (displayCurrency === 'original') return formatCurrencyAmount(amount, originalCurrency);
    const target = displayCurrency === 'local' ? localCurrency : 'EUR';
    if (originalCurrency === target) return formatCurrencyAmount(amount, target);
    return `≈ ${formatCurrencyAmount(convertAmount(amount, originalCurrency, target), target)}`;
  };

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
      parsedReceipts.forEach((r) => {
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
    onSubmitted?.();
  };

  return (
    <div className="py-6 space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'relative flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed cursor-pointer transition-all duration-200',
          hasReceipts ? 'py-3 px-4' : 'py-8 px-4',
          isDragOver
            ? 'border-primary/60 bg-primary/[0.08]'
            : 'border-border/60 hover:border-primary/60 hover:bg-primary/[0.05]'
        )}
      >
        <Upload
          className={cn(
            isDragOver ? 'text-primary' : 'text-muted-foreground/60',
            hasReceipts ? 'h-3.5 w-3.5' : 'h-5 w-5',
            'transition-colors'
          )}
        />
        <p
          className={cn(
            isDragOver ? 'text-primary' : 'text-muted-foreground',
            hasReceipts ? 'text-[11px]' : 'text-xs',
            'transition-colors'
          )}
        >
          {hasReceipts ? 'Upload more receipts' : 'Drop receipts or click to browse'}
        </p>
        {!hasReceipts && (
          <p className="text-[10px] text-muted-foreground/50">JPG, PNG, PDF · max 5 MB each</p>
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

      {isParsing && (
        <p className="text-[11px] text-muted-foreground/60 animate-pulse px-1">Reading receipts…</p>
      )}

      {parsedReceipts.length > 0 && (
        <div className="space-y-3">
          {isMultiCurrency && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground/50 mr-1 uppercase tracking-wider">View</span>
              {(['original', 'local', 'eur'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setDisplayCurrency(mode)}
                  className={cn(
                    'px-2 py-0.5 rounded text-[10px] font-medium transition-colors',
                    displayCurrency === mode
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground/60 hover:text-foreground'
                  )}
                >
                  {mode === 'original' ? 'Original' : mode === 'local' ? localCurrency : 'EUR'}
                </button>
              ))}
            </div>
          )}

          {isMultiCurrency && displayCurrency === 'original' ? (
            currencyEntries.map(([currency, items]) => (
              <div key={currency}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[11px]">{getFlag(currency)}</span>
                  <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">{currency}</span>
                  <div className="flex-1 h-px bg-border/20" />
                </div>
                <div className="space-y-0">
                  {items.map((receipt) => (
                    <ReceiptRow
                      key={receipt.id}
                      receipt={receipt}
                      displayCurrency={displayCurrency}
                      localCurrency={localCurrency}
                      formatDisplay={formatDisplay}
                      onRemove={removeReceipt}
                      onToggleEdit={toggleEdit}
                      onUpdate={updateReceipt}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-end pr-0.5 mt-0.5">
                  <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
                    {formatCurrencyAmount(currencyTotals[currency], currency)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="space-y-0">
              {parsedReceipts.map((receipt) => (
                <ReceiptRow
                  key={receipt.id}
                  receipt={receipt}
                  displayCurrency={displayCurrency}
                  localCurrency={localCurrency}
                  formatDisplay={formatDisplay}
                  onRemove={removeReceipt}
                  onToggleEdit={toggleEdit}
                  onUpdate={updateReceipt}
                />
              ))}
            </div>
          )}

          <div className="border-t border-border/30 pt-2.5">
            {isMultiCurrency && displayCurrency !== 'original' && (
              <div className="space-y-0.5 mb-1.5">
                {currencyEntries.map(([cur]) => (
                  <div key={cur} className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground/50">{getFlag(cur)} {cur}</span>
                    <span className="text-[11px] tabular-nums text-muted-foreground/60">
                      {formatDisplay(currencyTotals[cur], cur)}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">Total</span>
              <span className="text-sm font-semibold tabular-nums text-foreground text-right">
                {displayCurrency !== 'original' && grandTotal !== null
                  ? `≈ ${formatCurrencyAmount(grandTotal, displayCurrency === 'local' ? localCurrency : 'EUR')}`
                  : currencyEntries.length === 1
                    ? formatCurrencyAmount(Object.values(currencyTotals)[0], Object.keys(currencyTotals)[0])
                    : currencyEntries.map(([cur]) => formatCurrencyAmount(currencyTotals[cur], cur)).join(' + ')}
              </span>
            </div>
          </div>

          <TagInput
            tags={tags}
            onChange={(nextTags) => {
              setTags(nextTags);
              setTagError('');
            }}
            maxTags={1}
            required={parsedReceipts.length > 1}
            error={tagError}
          />

          <Button onClick={handleSubmit} className="w-full" disabled={!canSubmit}>
            {isParsing ? 'Reading…' : `Submit ${parsedReceipts.length} expense${parsedReceipts.length > 1 ? 's' : ''}`}
          </Button>
        </div>
      )}

      {!hasReceipts && (
        <p className="text-[11px] text-muted-foreground/50 leading-relaxed px-0.5">
          Upload one or more receipts in any currency. Amounts, categories, and currencies are detected automatically.
        </p>
      )}
    </div>
  );
};

interface ReceiptRowProps {
  receipt: ParsedReceipt;
  displayCurrency: 'original' | 'local' | 'eur';
  localCurrency: string;
  formatDisplay: (amount: number, currency: string) => string;
  onRemove: (id: string) => void;
  onToggleEdit: (id: string) => void;
  onUpdate: (id: string, field: keyof ParsedReceipt, value: string | number) => void;
}

function ReceiptRow({ receipt, displayCurrency, localCurrency, formatDisplay, onRemove, onToggleEdit, onUpdate }: ReceiptRowProps) {
  const target = displayCurrency === 'local' ? localCurrency : 'EUR';

  return (
    <div className="group">
      <div className="flex items-center gap-2 py-1.5 rounded-md transition-colors hover:bg-muted/30 px-1 -mx-1">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-foreground truncate">{receipt.merchant}</span>
            <span className="text-[10px] text-muted-foreground/40">·</span>
            <span className="text-[10px] text-muted-foreground/50 truncate">{receipt.category}</span>
          </div>
          <p className="text-[10px] text-muted-foreground/30 truncate">{receipt.file.name}</p>
        </div>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleEdit(receipt.id);
            }}
            className="p-1 rounded hover:bg-muted/60 transition-colors"
          >
            <Pencil className="h-2.5 w-2.5 text-muted-foreground/50" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(receipt.id);
            }}
            className="p-1 rounded hover:bg-destructive/10 transition-colors"
          >
            <X className="h-2.5 w-2.5 text-muted-foreground/50 hover:text-destructive" />
          </button>
        </div>

        <div className="text-right shrink-0 w-[100px]">
          <p className="text-xs font-medium tabular-nums text-foreground text-right">
            {formatDisplay(receipt.amount, receipt.currency)}
          </p>
          {displayCurrency !== 'original' && receipt.currency !== target && (
            <p className="text-[10px] text-muted-foreground/30 tabular-nums text-right">
              {formatCurrencyAmount(receipt.amount, receipt.currency)}
            </p>
          )}
        </div>
      </div>

      {receipt.isEditing && (
        <div className="ml-0.5 mb-2 p-2.5 rounded-lg bg-muted/20 border border-border/20 space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-0.5">
              <Label className="text-[10px] text-muted-foreground/60">Currency</Label>
              <Select value={receipt.currency} onValueChange={(value) => onUpdate(receipt.id, 'currency', value)}>
                <SelectTrigger className="h-7 text-[11px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {receiptCurrencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.flag} {currency.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-0.5">
              <Label className="text-[10px] text-muted-foreground/60">Amount</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={receipt.amount || ''}
                onChange={(e) => onUpdate(receipt.id, 'amount', parseFloat(e.target.value) || 0)}
                className="h-7 text-[11px]"
              />
            </div>
            <div className="space-y-0.5">
              <Label className="text-[10px] text-muted-foreground/60">Category</Label>
              <Select value={receipt.category} onValueChange={(value) => onUpdate(receipt.id, 'category', value)}>
                <SelectTrigger className="h-7 text-[11px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-0.5">
              <Label className="text-[10px] text-muted-foreground/60">Merchant</Label>
              <Input
                value={receipt.merchant}
                onChange={(e) => onUpdate(receipt.id, 'merchant', e.target.value)}
                className="h-7 text-[11px]"
              />
            </div>
            <button
              onClick={() => onToggleEdit(receipt.id)}
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
