/**
 * Flow 4.1 — Employee Dashboard v4
 * Request Change Drawer (right-side panel)
 * Supports both Pay Adjustments and Leave Requests via tabs
 * INDEPENDENT from v3 - changes here do not affect other flows.
 */

import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { useF41v4_DashboardStore, type F41v4_AdjustmentType, type F41v4_LeaveType } from '@/stores/F41v4_DashboardStore';
import { cn } from '@/lib/utils';
import { Upload, X, FileText, Image, CalendarIcon } from 'lucide-react';
import { format, differenceInBusinessDays } from 'date-fns';

interface F41v4_AdjustmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: string;
}

type TabType = 'adjustment' | 'leave';

const adjustmentTypes: F41v4_AdjustmentType[] = ['Expense', 'Overtime', 'Bonus', 'Correction'];
const expenseCategories = ['Travel', 'Meals', 'Equipment', 'Software', 'Other'];
const leaveTypes: F41v4_LeaveType[] = ['Annual leave', 'Sick leave', 'Unpaid leave', 'Other'];

export const F41v4_AdjustmentModal = ({ open, onOpenChange, currency }: F41v4_AdjustmentModalProps) => {
  const { addAdjustment, addLeaveRequest } = useF41v4_DashboardStore();
  
  const [activeTab, setActiveTab] = useState<TabType>('adjustment');
  const [type, setType] = useState<F41v4_AdjustmentType>('Expense');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [leaveType, setLeaveType] = useState<F41v4_LeaveType>('Annual leave');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [leaveReason, setLeaveReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalDays = startDate && endDate ? Math.max(1, differenceInBusinessDays(endDate, startDate) + 1) : 0;

  const resetForm = () => {
    setActiveTab('adjustment');
    setType('Expense');
    setCategory('');
    setAmount('');
    setHours('');
    setDescription('');
    setReceipt(null);
    setLeaveType('Annual leave');
    setStartDate(undefined);
    setEndDate(undefined);
    setLeaveReason('');
    setErrors({});
  };

  const handleClose = () => { resetForm(); onOpenChange(false); };

  useEffect(() => { setErrors({}); }, [activeTab]);

  const validateAdjustmentForm = () => {
    const newErrors: Record<string, string> = {};
    if (type === 'Expense') {
      if (!category) newErrors.category = 'Category is required';
      if (!amount || parseFloat(amount) <= 0) newErrors.amount = 'Amount must be greater than 0';
      if (!receipt) newErrors.receipt = 'Receipt is required for expenses';
      if (!description.trim()) newErrors.description = 'Description is required';
    }
    if (type === 'Overtime') { if (!hours || parseFloat(hours) <= 0) newErrors.hours = 'Hours must be greater than 0'; }
    if (type === 'Bonus') {
      if (!amount || parseFloat(amount) <= 0) newErrors.amount = 'Amount must be greater than 0';
      if (!description.trim()) newErrors.description = 'Description is required';
    }
    if (type === 'Correction') { if (!description.trim()) newErrors.description = 'Requested change is required'; }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateLeaveForm = () => {
    const newErrors: Record<string, string> = {};
    if (!startDate) newErrors.startDate = 'Start date is required';
    if (!endDate) newErrors.endDate = 'End date is required';
    if (startDate && endDate && endDate < startDate) newErrors.endDate = 'End date must be after start date';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) { setErrors(prev => ({ ...prev, receipt: 'Only PDF, JPG, and PNG files are allowed' })); return; }
    if (file.size > 10 * 1024 * 1024) { setErrors(prev => ({ ...prev, receipt: 'File must be less than 10MB' })); return; }
    setReceipt(file);
    setErrors(prev => { const { receipt, ...rest } = prev; return rest; });
  };

  const handleSubmitAdjustment = () => {
    if (!validateAdjustmentForm()) return;
    const label = type === 'Expense' ? category : type === 'Overtime' ? `${hours}h` : type === 'Bonus' ? 'Bonus request' : 'Correction';
    addAdjustment({ type, label, amount: type === 'Overtime' ? null : parseFloat(amount), description, category: type === 'Expense' ? category : undefined, hours: type === 'Overtime' ? parseFloat(hours) : undefined, receiptUrl: receipt ? URL.createObjectURL(receipt) : undefined });
    toast.success("Adjustment submitted. We'll notify you after review.");
    handleClose();
  };

  const handleSubmitLeave = () => {
    if (!validateLeaveForm()) return;
    addLeaveRequest({ leaveType, startDate: startDate!.toISOString(), endDate: endDate!.toISOString(), totalDays, reason: leaveReason.trim() || undefined });
    toast.success("Leave request submitted. We'll notify you after review.");
    handleClose();
  };

  const handleSubmit = () => { if (activeTab === 'adjustment') handleSubmitAdjustment(); else handleSubmitLeave(); };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-border/40">
          <SheetTitle>Request a change</SheetTitle>
          <SheetDescription>Send a pay adjustment or leave request for this pay cycle.</SheetDescription>
        </SheetHeader>
        <div className="py-6">
          <div className="flex gap-2 p-1 bg-muted/50 rounded-lg mb-6">
            <button type="button" onClick={() => setActiveTab('adjustment')} className={cn('flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all', activeTab === 'adjustment' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>Pay adjustment</button>
            <button type="button" onClick={() => setActiveTab('leave')} className={cn('flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all', activeTab === 'leave' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>Leave request</button>
          </div>

          {activeTab === 'adjustment' && (
            <div className="space-y-5">
              <p className="text-xs text-muted-foreground">Use this tab to request an expense, overtime, bonus, or correction for this pay cycle.</p>
              <div className="space-y-2">
                <Label>Type</Label>
                <div className="flex flex-wrap gap-2">
                  {adjustmentTypes.map((t) => (<Button key={t} type="button" variant={type === t ? 'default' : 'outline'} size="sm" onClick={() => { setType(t); setErrors({}); }} className={cn(type === t && 'bg-primary text-primary-foreground')}>{t}</Button>))}
                </div>
              </div>
              {type === 'Expense' && (
                <>
                  <div className="space-y-2"><Label htmlFor="category">Category</Label><Select value={category} onValueChange={setCategory}><SelectTrigger className={cn(errors.category && 'border-destructive')}><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent>{expenseCategories.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent></Select>{errors.category && <p className="text-xs text-destructive">{errors.category}</p>}</div>
                  <div className="space-y-2"><Label htmlFor="amount">Amount ({currency})</Label><Input id="amount" type="number" step="0.01" min="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className={cn(errors.amount && 'border-destructive')} />{errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}</div>
                  <div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" placeholder="Brief description of the expense" value={description} onChange={(e) => setDescription(e.target.value)} className={cn(errors.description && 'border-destructive')} />{errors.description && <p className="text-xs text-destructive">{errors.description}</p>}</div>
                  <div className="space-y-2">
                    <Label>Receipt (PDF/JPG/PNG)</Label>
                    {receipt ? (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">{receipt.type === 'application/pdf' ? <FileText className="h-5 w-5 text-muted-foreground" /> : <Image className="h-5 w-5 text-muted-foreground" />}<span className="text-sm flex-1 truncate">{receipt.name}</span><Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => setReceipt(null)}><X className="h-4 w-4" /></Button></div>
                    ) : (
                      <label className={cn('flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed cursor-pointer transition-colors', errors.receipt ? 'border-destructive' : 'border-border hover:border-primary/50')}><Upload className="h-6 w-6 text-muted-foreground" /><span className="text-sm text-muted-foreground">Click to upload receipt</span><input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileChange} /></label>
                    )}
                    {errors.receipt && <p className="text-xs text-destructive">{errors.receipt}</p>}
                    <p className="text-xs text-muted-foreground">Receipts are required for expenses.</p>
                  </div>
                </>
              )}
              {type === 'Overtime' && (
                <>
                  <div className="space-y-2"><Label htmlFor="hours">Hours</Label><Input id="hours" type="number" step="0.5" min="0.5" placeholder="0" value={hours} onChange={(e) => setHours(e.target.value)} className={cn(errors.hours && 'border-destructive')} />{errors.hours && <p className="text-xs text-destructive">{errors.hours}</p>}</div>
                  <div className="space-y-2"><Label htmlFor="memo">Memo (optional)</Label><Textarea id="memo" placeholder="Additional notes" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
                  <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">Rate per company policy; final amount will be calculated by payroll.</p>
                </>
              )}
              {type === 'Bonus' && (
                <>
                  <div className="space-y-2"><Label htmlFor="amount">Amount ({currency})</Label><Input id="amount" type="number" step="0.01" min="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className={cn(errors.amount && 'border-destructive')} />{errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}</div>
                  <div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" placeholder="Reason for bonus request" value={description} onChange={(e) => setDescription(e.target.value)} className={cn(errors.description && 'border-destructive')} />{errors.description && <p className="text-xs text-destructive">{errors.description}</p>}</div>
                  <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">Subject to admin approval.</p>
                </>
              )}
              {type === 'Correction' && (
                <>
                  <div className="space-y-2"><Label htmlFor="description">Requested change</Label><Textarea id="description" placeholder="Describe the correction needed" value={description} onChange={(e) => setDescription(e.target.value)} className={cn(errors.description && 'border-destructive')} />{errors.description && <p className="text-xs text-destructive">{errors.description}</p>}</div>
                  <div className="space-y-2">
                    <Label>Attachment (optional)</Label>
                    {receipt ? (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">{receipt.type === 'application/pdf' ? <FileText className="h-5 w-5 text-muted-foreground" /> : <Image className="h-5 w-5 text-muted-foreground" />}<span className="text-sm flex-1 truncate">{receipt.name}</span><Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => setReceipt(null)}><X className="h-4 w-4" /></Button></div>
                    ) : (
                      <label className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors"><Upload className="h-6 w-6 text-muted-foreground" /><span className="text-sm text-muted-foreground">Click to upload (optional)</span><input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileChange} /></label>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'leave' && (
            <div className="space-y-5">
              <div className="space-y-2"><Label>Leave type</Label><Select value={leaveType} onValueChange={(v) => setLeaveType(v as F41v4_LeaveType)}><SelectTrigger><SelectValue placeholder="Select leave type" /></SelectTrigger><SelectContent>{leaveTypes.map((lt) => (<SelectItem key={lt} value={lt}>{lt}</SelectItem>))}</SelectContent></Select></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Start date</Label><Popover><PopoverTrigger asChild><Button variant="outline" className={cn('w-full justify-start text-left font-normal', !startDate && 'text-muted-foreground', errors.startDate && 'border-destructive')}><CalendarIcon className="mr-2 h-4 w-4" />{startDate ? format(startDate, 'MMM d, yyyy') : 'Select'}</Button></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus className="pointer-events-auto" /></PopoverContent></Popover>{errors.startDate && <p className="text-xs text-destructive">{errors.startDate}</p>}</div>
                <div className="space-y-2"><Label>End date</Label><Popover><PopoverTrigger asChild><Button variant="outline" className={cn('w-full justify-start text-left font-normal', !endDate && 'text-muted-foreground', errors.endDate && 'border-destructive')}><CalendarIcon className="mr-2 h-4 w-4" />{endDate ? format(endDate, 'MMM d, yyyy') : 'Select'}</Button></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={endDate} onSelect={setEndDate} disabled={(date) => startDate ? date < startDate : false} initialFocus className="pointer-events-auto" /></PopoverContent></Popover>{errors.endDate && <p className="text-xs text-destructive">{errors.endDate}</p>}</div>
              </div>
              {startDate && endDate && (<div className="p-3 rounded-lg bg-muted/50 border border-border/40"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Total days</span><span className="text-sm font-medium text-foreground">{totalDays} {totalDays === 1 ? 'day' : 'days'}</span></div><p className="text-xs text-muted-foreground mt-1">This request covers {totalDays} working {totalDays === 1 ? 'day' : 'days'}.</p></div>)}
              <div className="space-y-2"><Label htmlFor="leaveReason">Reason (optional)</Label><Textarea id="leaveReason" placeholder="Additional details about your leave request" value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} rows={3} /></div>
              <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">Leave requests that fall inside this pay period may impact your pay. Your admin will review and confirm.</p>
            </div>
          )}
        </div>
        <div className="flex gap-3 pt-4 border-t border-border/40">
          <Button variant="outline" onClick={handleClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSubmit} className="flex-1">{activeTab === 'adjustment' ? 'Submit' : 'Submit request'}</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
