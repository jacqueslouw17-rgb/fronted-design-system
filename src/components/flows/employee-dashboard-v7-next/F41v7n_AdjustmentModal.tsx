/**
 * Flow 4.1 — Employee Dashboard v6
 * Request Change Drawer with tile-based type selection
 * INDEPENDENT: This is a complete clone - changes here do NOT affect v5 or any other flow.
 */

import { useState, useEffect } from 'react';
import { validateFiles, validateSingleFile, FILE_UPLOAD_ACCEPT, FILE_UPLOAD_MAX_COUNT, FILE_UPLOAD_HELPER, FILE_UPLOAD_HELPER_RECEIPT } from '../shared/fileUploadValidation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { useF41v7n_DashboardStore } from '@/stores/F41v7n_DashboardStore';
import { cn } from '@/lib/utils';
import { Upload, X, FileText, Image, ArrowLeft, Receipt, Clock, Gift, AlertTriangle, CalendarOff } from 'lucide-react';
import { TagInput } from '@/components/flows/shared/TagInput';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { F41v7n_TimeInput } from './F41v7n_TimeInput';

export type RequestType = 'leave' | 'expense' | 'overtime' | 'bonus-correction' | null;
export type LeaveTypeOption = 'Paid leave' | 'Unpaid leave' | 'Sick leave' | 'Maternity / parental leave' | 'Other leave';

interface F41v7n_AdjustmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: string;
  initialType?: RequestType;
  initialExpenseCategory?: string;
  initialExpenseAmount?: string;
  initialHours?: number;
  initialDays?: number; // For unpaid leave
  initialDate?: string;
  initialStartTime?: string;
  initialEndTime?: string;
  rejectedId?: string;
  onBack?: () => void;
}

const expenseCategories = ['Travel', 'Meals', 'Equipment', 'Software', 'Other'];

interface ExpenseLineItem {
  id: string;
  category: string;
  otherCategory: string;
  amount: string;
  receipt: File[];
}

interface OvertimeLineItem {
  id: string;
  date: Date | undefined;
  startTime: string;
  endTime: string;
  calculatedHours: number;
}

interface BonusLineItem {
  id: string;
  amount: string;
  attachment: File[];
}


const requestTypeOptions = [
  { 
    id: 'expense' as RequestType, 
    label: 'Expense Reimbursements', 
    description: 'Submit a reimbursement',
    icon: Receipt,
    disabled: false 
  },
  { 
    id: 'overtime' as RequestType, 
    label: 'Overtime', 
    description: 'Log extra hours',
    icon: Clock,
    disabled: false 
  },
  { 
    id: 'bonus-correction' as RequestType, 
    label: 'Bonus', 
    description: 'Request a bonus',
    icon: Gift,
    disabled: false 
  },
  { 
    id: 'leave' as RequestType, 
    label: 'Leave', 
    description: 'Request paid, unpaid, or sick leave',
    icon: CalendarOff,
    disabled: false 
  },
];

// Count weekdays (Mon–Fri) inclusive between two dates
const countWeekdays = (start: Date, end: Date): number => {
  if (!start || !end || end < start) return 0;
  let count = 0;
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  const last = new Date(end);
  last.setHours(0, 0, 0, 0);
  while (cursor <= last) {
    const dow = cursor.getDay();
    if (dow !== 0 && dow !== 6) count++;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
};

// Demo leave balances (placeholder — admin confirms before payroll)
const LEAVE_BALANCES: { type: LeaveTypeOption; label: string; dotClass: string }[] = [
  { type: 'Paid leave', label: '12 days left', dotClass: 'bg-emerald-500' },
  { type: 'Sick leave', label: '5 days used', dotClass: 'bg-amber-500' },
  { type: 'Unpaid leave', label: 'No balance', dotClass: 'bg-muted-foreground/60' },
  { type: 'Maternity / parental leave', label: 'If applicable', dotClass: 'bg-pink-500' },
  { type: 'Other leave', label: 'Requires review', dotClass: 'bg-sky-500' },
];

const LEAVE_TYPE_HELPER: Record<LeaveTypeOption, string> = {
  'Paid leave': 'Paid leave is tracked for approval and payroll visibility.',
  'Sick leave': 'Sick leave may require documentation depending on country and company rules.',
  'Unpaid leave': 'Unpaid leave may reduce pay once approved and included in payroll.',
  'Maternity / parental leave': 'This may require additional review and documentation.',
  'Other leave': 'This will be reviewed by your admin before payroll.',
};

const LEAVE_PAYROLL_IMPACT: Record<LeaveTypeOption, string> = {
  'Paid leave': 'No automatic deduction',
  'Sick leave': 'Requires review',
  'Unpaid leave': 'May reduce pay once approved',
  'Maternity / parental leave': 'Requires review',
  'Other leave': 'Requires review',
};

export const F41v7n_AdjustmentModal = ({ open, onOpenChange, currency, initialType = null, initialExpenseCategory = '', initialExpenseAmount = '', initialHours, initialDays, initialDate, initialStartTime, initialEndTime, rejectedId, onBack }: F41v7n_AdjustmentModalProps) => {
  const { addAdjustment, markRejectionResubmitted, adjustments } = useF41v7n_DashboardStore();

  const rejectedAdjustment = rejectedId
    ? adjustments.find((adj) => adj.id === rejectedId)
    : undefined;
  const rejectionReason = rejectedAdjustment?.rejectionReason;
  
  const [selectedType, setSelectedType] = useState<RequestType>(null);
  const [expenseItems, setExpenseItems] = useState<ExpenseLineItem[]>([
    { id: crypto.randomUUID(), category: initialExpenseCategory, otherCategory: '', amount: initialExpenseAmount, receipt: [] }
  ]);
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseReceipt, setExpenseReceipt] = useState<File | null>(null);
  const [expenseNotes, setExpenseNotes] = useState('');
  const [overtimeItems, setOvertimeItems] = useState<OvertimeLineItem[]>([
    { id: crypto.randomUUID(), date: undefined, startTime: '', endTime: '', calculatedHours: 0 }
  ]);
  const [bonusItems, setBonusItems] = useState<BonusLineItem[]>([
    { id: crypto.randomUUID(), amount: '', attachment: [] }
  ]);
  const [leaveType, setLeaveType] = useState<LeaveTypeOption | ''>('Paid leave');
  const [leaveStartDate, setLeaveStartDate] = useState<Date | undefined>(undefined);
  const [leaveEndDate, setLeaveEndDate] = useState<Date | undefined>(undefined);
  const [leaveDays, setLeaveDays] = useState<string>('');
  const [leaveNote, setLeaveNote] = useState<string>('');
  const [leaveAttachments, setLeaveAttachments] = useState<File[]>([]);
  const [leaveHalfDayStart, setLeaveHalfDayStart] = useState(false);
  const [leaveHalfDayEnd, setLeaveHalfDayEnd] = useState(false);
  const [leaveDaysOverridden, setLeaveDaysOverridden] = useState(false);
  const [openLeaveRangePopover, setOpenLeaveRangePopover] = useState(false);
  const [expenseTags, setExpenseTags] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const clearError = (key: string) => setErrors(prev => {
    if (!prev[key]) return prev;
    const { [key]: _, ...rest } = prev;
    return rest;
  });
  const [openDatePopoverId, setOpenDatePopoverId] = useState<string | null>(null);

  const resetForm = () => {
    setSelectedType(initialType);
    setExpenseItems([{ id: crypto.randomUUID(), category: initialExpenseCategory, otherCategory: '', amount: initialExpenseAmount, receipt: [] }]);
    setExpenseCategory(initialExpenseCategory);
    setExpenseAmount(initialExpenseAmount);
    setExpenseDescription('');
    setExpenseReceipt(null);
    setExpenseNotes('');
    setExpenseTags([]);
    setOvertimeItems([{ id: crypto.randomUUID(), date: undefined, startTime: '', endTime: '', calculatedHours: 0 }]);
    setBonusItems([{ id: crypto.randomUUID(), amount: '', attachment: [] }]);
    setLeaveType('');
    setLeaveStartDate(undefined);
    setLeaveEndDate(undefined);
    setLeaveDays(initialDays?.toString() || '');
    setLeaveNote('');
    setLeaveAttachments([]);
    setLeaveHalfDayStart(false);
    setLeaveHalfDayEnd(false);
    setLeaveDaysOverridden(false);
    setErrors({});
  };

  const addExpenseItem = () => {
    setExpenseItems(prev => [...prev, { id: crypto.randomUUID(), category: '', otherCategory: '', amount: '', receipt: [] }]);
  };

  const removeExpenseItem = (id: string) => {
    if (expenseItems.length === 1) return;
    setExpenseItems(prev => prev.filter(item => item.id !== id));
  };

  const updateExpenseItem = (id: string, field: keyof ExpenseLineItem, value: string | File[] | null) => {
    const index = expenseItems.findIndex(item => item.id === id);
    if (field === 'category') clearError(`expense_${index}_category`);
    if (field === 'amount') clearError(`expense_${index}_amount`);
    if (field === 'otherCategory') clearError(`expense_${index}_otherCategory`);
    if (field === 'receipt') clearError(`expense_${index}_receipt`);
    setExpenseItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const addOvertimeItem = () => {
    setOvertimeItems(prev => [...prev, { id: crypto.randomUUID(), date: undefined, startTime: '', endTime: '', calculatedHours: 0 }]);
  };

  const removeOvertimeItem = (id: string) => {
    if (overtimeItems.length === 1) return;
    setOvertimeItems(prev => prev.filter(item => item.id !== id));
  };

  const calculateHours = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0;
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    
    let startMinutes = startH * 60 + startM;
    let endMinutes = endH * 60 + endM;
    
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60;
    }
    
    const diffMinutes = endMinutes - startMinutes;
    return Math.round((diffMinutes / 60) * 100) / 100;
  };

  const updateOvertimeItem = (id: string, field: keyof OvertimeLineItem, value: string | Date | undefined) => {
    const index = overtimeItems.findIndex(item => item.id === id);
    if (field === 'date') clearError(`overtime_${index}_date`);
    if (field === 'startTime') clearError(`overtime_${index}_startTime`);
    if (field === 'endTime') clearError(`overtime_${index}_endTime`);
    setOvertimeItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      
      const updated = { ...item, [field]: value };
      
      if (field === 'startTime' || field === 'endTime') {
        const startTime = field === 'startTime' ? (value as string) : item.startTime;
        const endTime = field === 'endTime' ? (value as string) : item.endTime;
        updated.calculatedHours = calculateHours(startTime, endTime);
      }
      
      return updated;
    }));
  };

  const addBonusItem = () => {
    setBonusItems(prev => [...prev, { id: crypto.randomUUID(), amount: '', attachment: [] }]);
  };

  const removeBonusItem = (id: string) => {
    if (bonusItems.length === 1) return;
    setBonusItems(prev => prev.filter(item => item.id !== id));
  };

  const updateBonusItem = (id: string, field: keyof BonusLineItem, value: string | File[] | null) => {
    const index = bonusItems.findIndex(item => item.id === id);
    if (field === 'amount') clearError(`bonus_${index}_amount`);
    setBonusItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleBack = () => {
    if (onBack) {
      handleClose();
      onBack();
      return;
    }
    if (initialType) {
      handleClose();
    } else {
      setSelectedType(null);
      setErrors({});
    }
  };

  const showBackAtSelection = selectedType === null && onBack;

  useEffect(() => {
    if (open && initialType) {
      setSelectedType(initialType);
    }
    if (open && initialType === 'expense' && (initialExpenseCategory || initialExpenseAmount)) {
      setExpenseItems([{ id: crypto.randomUUID(), category: initialExpenseCategory, otherCategory: '', amount: initialExpenseAmount, receipt: [] }]);
    }
    // Pre-fill bonus amount for resubmissions
    if (open && initialType === 'bonus-correction' && initialExpenseAmount) {
      setBonusItems([{ id: crypto.randomUUID(), amount: initialExpenseAmount, attachment: [] }]);
    }
    // Pre-fill overtime hours for resubmissions
    if (open && initialType === 'overtime') {
      const parsedDate = initialDate ? new Date(initialDate) : undefined;
      setOvertimeItems([{ 
        id: crypto.randomUUID(), 
        date: parsedDate, 
        startTime: initialStartTime || '', 
        endTime: initialEndTime || '', 
        calculatedHours: initialHours || 0 
      }]);
    }
    // Pre-fill leave days for resubmissions
    if (open && initialType === 'leave' && initialDays) {
      setLeaveDays(initialDays.toString());
    }
  }, [open, initialType, initialExpenseCategory, initialExpenseAmount, initialHours, initialDays, initialDate, initialStartTime, initialEndTime]);

  useEffect(() => {
    setErrors({});
  }, [selectedType]);

  // Auto-calculate leave duration from selected dates and half-day toggles
  useEffect(() => {
    if (leaveDaysOverridden) return;
    if (!leaveStartDate || !leaveEndDate) {
      setLeaveDays('');
      return;
    }
    let weekdays = countWeekdays(leaveStartDate, leaveEndDate);
    if (weekdays <= 0) {
      setLeaveDays('');
      return;
    }
    if (leaveHalfDayStart) weekdays -= 0.5;
    if (leaveHalfDayEnd && leaveEndDate.getTime() !== leaveStartDate.getTime()) weekdays -= 0.5;
    if (leaveHalfDayStart && leaveEndDate.getTime() === leaveStartDate.getTime()) {
      // single-day half day
      weekdays = 0.5;
    }
    setLeaveDays(weekdays > 0 ? String(weekdays) : '');
  }, [leaveStartDate, leaveEndDate, leaveHalfDayStart, leaveHalfDayEnd, leaveDaysOverridden]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>, 
    setFile: (file: File | null) => void,
    fieldName: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateSingleFile(file);
    if (error) {
      setErrors(prev => ({ ...prev, [fieldName]: error }));
      return;
    }

    setFile(file);
    setErrors(prev => {
      const { [fieldName]: removed, ...rest } = prev;
      return rest;
    });
  };

  const validateExpenseItems = () => {
    const newErrors: Record<string, string> = {};
    let hasError = false;
    
    expenseItems.forEach((item, index) => {
      if (!item.category) {
        newErrors[`expense_${index}_category`] = 'Required';
        hasError = true;
      }
      if (item.category === 'Other' && !item.otherCategory.trim()) {
        newErrors[`expense_${index}_otherCategory`] = 'Please specify';
        hasError = true;
      }
      if (!item.amount || parseFloat(item.amount) <= 0) {
        newErrors[`expense_${index}_amount`] = 'Required';
        hasError = true;
      }
      if (item.receipt.length === 0) {
        newErrors[`expense_${index}_receipt`] = 'At least one document required';
        hasError = true;
      }
    });

    // Tag is required when multiple expense items
    if (expenseItems.length > 1 && expenseTags.length === 0) {
      newErrors['expense_tag'] = 'Tag is required when submitting multiple expenses';
      hasError = true;
    }
    
    setErrors(newErrors);
    return !hasError;
  };

  const validateOvertimeItems = () => {
    const newErrors: Record<string, string> = {};
    let hasError = false;
    
    overtimeItems.forEach((item, index) => {
      if (!item.date) {
        newErrors[`overtime_${index}_date`] = 'Required';
        hasError = true;
      }
      if (!item.startTime) {
        newErrors[`overtime_${index}_startTime`] = 'Required';
        hasError = true;
      }
      if (!item.endTime) {
        newErrors[`overtime_${index}_endTime`] = 'Required';
        hasError = true;
      }
      if (item.startTime && item.endTime && item.calculatedHours <= 0) {
        newErrors[`overtime_${index}_endTime`] = 'End must be after start';
        hasError = true;
      }
    });
    
    setErrors(newErrors);
    return !hasError;
  };

  const validateBonusItems = () => {
    const newErrors: Record<string, string> = {};
    let hasError = false;
    
    bonusItems.forEach((item, index) => {
      if (!item.amount || parseFloat(item.amount) <= 0) {
        newErrors[`bonus_${index}_amount`] = 'Required';
        hasError = true;
      }
    });
    
    setErrors(newErrors);
    return !hasError;
  };

  const validateLeave = () => {
    const newErrors: Record<string, string> = {};
    const days = parseFloat(leaveDays);

    if (!leaveType) {
      newErrors['leave_type'] = 'Required';
    }
    if (!leaveStartDate) {
      newErrors['leave_start_date'] = 'Required';
    }
    if (!leaveEndDate) {
      newErrors['leave_end_date'] = 'Required';
    }
    if (leaveStartDate && leaveEndDate && leaveEndDate < leaveStartDate) {
      newErrors['leave_end_date'] = 'End date cannot be before start date';
    }
    if (!leaveDays || isNaN(days) || days <= 0) {
      newErrors['leave_days'] = 'Enter a number greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitExpenses = () => {
    if (!validateExpenseItems()) return;

    const hasTags = expenseTags.length > 0;
    const now = new Date().toISOString();

    if (hasTags) {
      // Tags present: group all items into one row, use tags as label prefix
      const totalAmount = expenseItems.reduce((sum, item) => sum + parseFloat(item.amount), 0);
      const tagLabel = expenseTags.join(', ');
      const categories = expenseItems.map(i => i.category === 'Other' ? i.otherCategory : i.category);
      const label = expenseItems.length === 1
        ? `${currency} ${parseFloat(expenseItems[0].amount).toLocaleString()}`
        : `${expenseItems.length} items · ${currency} ${totalAmount.toLocaleString()}`;

      addAdjustment({
        type: 'Expense',
        label,
        amount: totalAmount,
        category: categories[0],
        receiptUrl: expenseItems[0].receipt.length > 0 ? URL.createObjectURL(expenseItems[0].receipt[0]) : undefined,
        tags: expenseTags,
      });
    } else {
      // No tags: add each expense as a separate row
      expenseItems.forEach((item) => {
        const cat = item.category === 'Other' ? item.otherCategory : item.category;
        const amt = parseFloat(item.amount);
        addAdjustment({
          type: 'Expense',
          label: `${cat} · ${currency} ${amt.toLocaleString()}`,
          amount: amt,
          category: item.category,
          receiptUrl: item.receipt.length > 0 ? URL.createObjectURL(item.receipt[0]) : undefined,
        });
      });
    }

    if (rejectedId) {
      markRejectionResubmitted(rejectedId);
    }

    const count = expenseItems.length;
    toast.success(`${count} expense${count > 1 ? 's' : ''} submitted for review.`);
    handleClose();
    
    if (onBack) {
      onBack();
    }
  };

  const handleSubmitOvertime = () => {
    if (!validateOvertimeItems()) return;

    const totalHours = overtimeItems.reduce((sum, item) => sum + item.calculatedHours, 0);
    const count = overtimeItems.length;
    const item = overtimeItems[0];
    const dateStr = item.date ? format(item.date, 'MMM d') : '';
    const timeStr = item.startTime && item.endTime ? `${item.startTime}–${item.endTime}` : '';
    const label = count === 1
      ? [
          `${item.calculatedHours}h`,
          dateStr,
          timeStr,
        ].filter(Boolean).join(' · ')
      : `${totalHours}h overtime (${count} entries)`;

    addAdjustment({
      type: 'Overtime',
      label,
      amount: null,
      hours: totalHours,
      date: overtimeItems[0].date ? format(overtimeItems[0].date, 'yyyy-MM-dd') : undefined,
      startTime: overtimeItems[0].startTime,
      endTime: overtimeItems[0].endTime,
    });

    // Mark the rejected item as resubmitted if this was a resubmission
    if (rejectedId) {
      markRejectionResubmitted(rejectedId);
    }

    toast.success(`${count} overtime entr${count > 1 ? 'ies' : 'y'} submitted (${totalHours}h total).`);
    handleClose();
  };

  const handleSubmitBonus = () => {
    if (!validateBonusItems()) return;

    const totalAmount = bonusItems.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    const count = bonusItems.length;
    const label = `${currency} ${totalAmount.toLocaleString()}`;

    addAdjustment({
      type: 'Bonus',
      label,
      amount: totalAmount,
      receiptUrl: bonusItems[0].attachment.length > 0 ? URL.createObjectURL(bonusItems[0].attachment[0]) : undefined,
    });

    // Mark the rejected item as resubmitted if this was a resubmission
    if (rejectedId) {
      markRejectionResubmitted(rejectedId);
    }

    toast.success(`${count} bonus request${count > 1 ? 's' : ''} submitted for review.`);
    handleClose();
  };

  // Round to nearest 0.5
  const roundToNearestHalf = (value: number): number => {
    return Math.round(value * 2) / 2;
  };

  const handleSubmitLeave = () => {
    if (!validateLeave()) return;

    const rawDays = parseFloat(leaveDays);
    const roundedDays = roundToNearestHalf(rawDays);
    const wasRounded = rawDays !== roundedDays;

    const startStr = leaveStartDate ? format(leaveStartDate, 'd MMM yyyy') : '';
    const endStr = leaveEndDate ? format(leaveEndDate, 'd MMM yyyy') : '';
    const sameDay = startStr && startStr === endStr;
    const range = sameDay ? startStr : `${startStr} – ${endStr}`;
    const dayLabel = `${roundedDays} ${roundedDays === 1 ? 'day' : 'days'}`;
    const label = `${leaveType} · ${dayLabel} · ${range}`;

    addAdjustment({
      type: 'Leave',
      label,
      amount: null,
      days: roundedDays,
      leaveType: leaveType as LeaveTypeOption,
      startDate: leaveStartDate ? format(leaveStartDate, 'yyyy-MM-dd') : undefined,
      endDate: leaveEndDate ? format(leaveEndDate, 'yyyy-MM-dd') : undefined,
      note: leaveNote.trim() || undefined,
      receiptUrl: leaveAttachments.length > 0 ? URL.createObjectURL(leaveAttachments[0]) : undefined,
    });

    if (rejectedId) {
      markRejectionResubmitted(rejectedId);
    }

    if (wasRounded) {
      toast.success(`Leave request submitted for review.`, {
        description: `Days rounded from ${rawDays} to ${roundedDays} (nearest half day).`,
      });
    } else {
      toast.success(`Leave request submitted for review.`);
    }
    handleClose();
  };

  const renderFileUpload = (
    file: File | null,
    setFile: (file: File | null) => void,
    fieldName: string,
    required: boolean = false
  ) => (
    <div className="space-y-2">
      <Label>{required ? 'Receipt' : 'Attachment (optional)'}</Label>
      {file ? (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
          {file.type === 'application/pdf' ? (
            <FileText className="h-5 w-5 text-muted-foreground" />
          ) : (
            <Image className="h-5 w-5 text-muted-foreground" />
          )}
          <span className="text-sm flex-1 truncate">{file.name}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setFile(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <label className={cn(
          'flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed cursor-pointer transition-colors',
          errors[fieldName] ? 'border-destructive' : 'border-border hover:border-primary/50'
        )}>
          <Upload className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Click to upload {required ? 'receipt' : '(optional)'}
          </span>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => handleFileChange(e, setFile, fieldName)}
          />
        </label>
      )}
      {errors[fieldName] ? (
        <p className="text-xs text-destructive">{errors[fieldName]}</p>
      ) : (
        <p className="text-xs text-muted-foreground">{FILE_UPLOAD_HELPER}</p>
      )}
    </div>
  );


  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-[85%] sm:w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-border/40 text-left">
          <div className="flex items-center gap-2">
            {(selectedType || showBackAtSelection) && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 -ml-2"
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <SheetTitle>
                {selectedType === null && 'Request adjustments'}
                {selectedType === 'expense' && 'Expense request'}
                {selectedType === 'overtime' && 'Overtime request'}
                {selectedType === 'bonus-correction' && 'Bonus request'}
                {selectedType === 'leave' && 'Leave'}
              </SheetTitle>
              <SheetDescription className="text-xs mt-0.5">
                {selectedType === null && 'Submit an adjustment for the current pay cycle'}
                {selectedType === 'expense' && 'Submit expenses for reimbursement'}
                {selectedType === 'overtime' && 'Log your overtime hours'}
                {selectedType === 'bonus-correction' && 'Request a bonus payment'}
                {selectedType === 'leave' && 'Request time off for the current pay cycle'}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Rejection notification for resubmissions */}
          {!!rejectedId && rejectionReason && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-destructive">Rejected by admin</p>
                <p className="text-sm text-destructive/80">{rejectionReason}</p>
              </div>
            </div>
          )}

          {/* Type Selection */}
          {selectedType === null && (
            <div className="grid grid-cols-1 gap-3">
              {requestTypeOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => !option.disabled && setSelectedType(option.id)}
                  disabled={option.disabled}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                    option.disabled
                      ? "opacity-50 cursor-not-allowed border-border/40"
                      : "border-border/60 hover:border-primary/50 hover:bg-primary/[0.02]"
                  )}
                >
                  <div className="p-2.5 rounded-lg bg-muted/50">
                    <option.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{option.label}</p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Expense Form */}
          {selectedType === 'expense' && (
            <div className="space-y-5">
              {/* Expense Line Items */}
              <div className="space-y-3">
                {expenseItems.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="p-4 rounded-xl border border-border/60 bg-card/50 space-y-3 relative group"
                  >
                    {/* Remove button - only show if more than 1 item */}
                    {expenseItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExpenseItem(item.id)}
                        className="absolute -top-2 -right-2 p-1 rounded-full bg-muted border border-border/60 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:border-destructive/30"
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                      </button>
                    )}

                    {/* Item number badge */}
                    {expenseItems.length > 1 && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                          Expense {index + 1}
                        </span>
                      </div>
                    )}

                    {/* Category & Amount row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Category</Label>
                        <Select 
                          value={item.category} 
                          onValueChange={(val) => {
                            updateExpenseItem(item.id, 'category', val);
                            if (val !== 'Other') {
                              updateExpenseItem(item.id, 'otherCategory', '');
                            }
                          }}
                        >
                          <SelectTrigger className={cn(
                            "h-9",
                            errors[`expense_${index}_category`] && 'border-destructive'
                          )}>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {expenseCategories.map((cat) => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">Amount ({currency})</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="0.00"
                          value={item.amount}
                          onChange={(e) => updateExpenseItem(item.id, 'amount', e.target.value)}
                          className={cn(
                            "h-9",
                            errors[`expense_${index}_amount`] && 'border-destructive'
                          )}
                        />
                      </div>
                    </div>

                    {/* Other category specification */}
                    {item.category === 'Other' && (
                      <div className="space-y-1.5">
                        <Label className="text-xs">Specify category</Label>
                        <Input
                          type="text"
                          placeholder="e.g., Office supplies"
                          value={item.otherCategory}
                          onChange={(e) => updateExpenseItem(item.id, 'otherCategory', e.target.value)}
                          className={cn(
                            "h-9",
                            errors[`expense_${index}_otherCategory`] && 'border-destructive'
                          )}
                        />
                        {errors[`expense_${index}_otherCategory`] && (
                          <p className="text-xs text-destructive">{errors[`expense_${index}_otherCategory`]}</p>
                        )}
                      </div>
                    )}

                    {/* Attachments - multi upload */}
                    <div className="space-y-1.5">
                      <Label className="text-xs">Attachments</Label>
                      {/* Uploaded files list */}
                      {item.receipt.length > 0 && (
                        <div className="space-y-1.5">
                          {item.receipt.map((file, fileIdx) => (
                            <div key={fileIdx} className="flex items-center gap-2 p-2 rounded-lg border border-border/60 bg-muted/30">
                              {file.type.startsWith('image/') ? (
                                <Image className="h-4 w-4 text-primary shrink-0" />
                              ) : (
                                <FileText className="h-4 w-4 text-primary shrink-0" />
                              )}
                              <span className="text-xs flex-1 truncate">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = item.receipt.filter((_, i) => i !== fileIdx);
                                  updateExpenseItem(item.id, 'receipt', updated);
                                }}
                                className="p-0.5 hover:bg-muted rounded shrink-0"
                              >
                                <X className="h-3 w-3 text-muted-foreground" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Upload trigger — hidden when at max */}
                      {item.receipt.length < FILE_UPLOAD_MAX_COUNT && (
                        <label className={cn(
                          "flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed cursor-pointer transition-colors",
                          errors[`expense_${index}_receipt`] 
                            ? "border-destructive bg-destructive/5" 
                            : "border-border/60 hover:border-primary/50 hover:bg-primary/[0.02]"
                        )}>
                          <Upload className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {item.receipt.length === 0 ? 'Upload documents' : 'Add more'}
                          </span>
                          <input
                            type="file"
                            accept={FILE_UPLOAD_ACCEPT}
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              if (files.length > 0) {
                                const { valid, error } = validateFiles(files, item.receipt.length);
                                if (error) {
                                  setErrors(prev => ({ ...prev, [`expense_${index}_receipt`]: error }));
                                } else if (valid.length > 0) {
                                  updateExpenseItem(item.id, 'receipt', [...item.receipt, ...valid]);
                                  setErrors(prev => {
                                    const { [`expense_${index}_receipt`]: _, ...rest } = prev;
                                    return rest;
                                  });
                                }
                              }
                              e.target.value = '';
                            }}
                          />
                        </label>
                      )}
                      {errors[`expense_${index}_receipt`] ? (
                        <p className="text-[11px] text-destructive">{errors[`expense_${index}_receipt`]}</p>
                      ) : (
                        <p className="text-[11px] text-muted-foreground/70">{FILE_UPLOAD_HELPER_RECEIPT}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add another expense button */}
              <button
                type="button"
                onClick={addExpenseItem}
                className="w-full p-3 rounded-xl border border-dashed border-border/60 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/[0.02] transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-lg leading-none">+</span>
                Add another expense
              </button>

              {/* Tag */}
              <TagInput
                tags={expenseTags}
                onChange={(tags) => { setExpenseTags(tags); clearError('expense_tag'); }}
                maxTags={1}
                required={expenseItems.length > 1}
                error={errors['expense_tag']}
              />

              {expenseItems.length > 0 && (
                <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Session total</span>
                    <span className="text-sm font-semibold tabular-nums">
                      {currency} {expenseItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}

              <Button onClick={handleSubmitExpenses} className="w-full">
                Request adjustment
              </Button>
            </div>
          )}

          {/* Overtime Form */}
          {selectedType === 'overtime' && (
            <div className="space-y-5">
              <div className="space-y-3">
                {overtimeItems.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="p-4 rounded-xl border border-border/60 bg-card/50 space-y-3 relative group"
                  >

                    {/* Date picker */}
                    <div className="space-y-1.5">
                      <Label className="text-xs">Date</Label>
                      <Popover
                        open={openDatePopoverId === item.id}
                        onOpenChange={(open) => setOpenDatePopoverId(open ? item.id : null)}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full h-9 justify-start text-left font-normal",
                              !item.date && "text-muted-foreground",
                              errors[`overtime_${index}_date`] && "border-destructive"
                            )}
                          >
                            {item.date ? format(item.date, 'MMM d, yyyy') : 'Select date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={item.date}
                            onSelect={(date) => {
                              updateOvertimeItem(item.id, 'date', date);
                              setOpenDatePopoverId(null);
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Start & End Time row */}
                    <div className="space-y-1.5">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Start time</Label>
                        <F41v7n_TimeInput
                            value={item.startTime}
                            onChange={(value) => updateOvertimeItem(item.id, 'startTime', value)}
                            hasError={!!errors[`overtime_${index}_startTime`]}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs">End time</Label>
                          <F41v7n_TimeInput
                            value={item.endTime}
                            onChange={(value) => updateOvertimeItem(item.id, 'endTime', value)}
                            hasError={!!errors[`overtime_${index}_endTime`]}
                          />
                          {errors[`overtime_${index}_endTime`] && (
                            <p className="text-xs text-destructive">{errors[`overtime_${index}_endTime`]}</p>
                          )}
                        </div>
                      </div>
                      {/* Timezone indicator */}
                      <p className="text-[11px] text-muted-foreground">
                        Times are in your local timezone ({Intl.DateTimeFormat().resolvedOptions().timeZone})
                      </p>
                    </div>

                    {/* Hours badge */}
                    {item.calculatedHours > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {item.calculatedHours}h calculated
                      </Badge>
                    )}
                  </div>
                ))}
              </div>


              <Button onClick={handleSubmitOvertime} className="w-full">
                Request adjustment
              </Button>
            </div>
          )}

          {/* Bonus Form */}
          {selectedType === 'bonus-correction' && (
            <div className="space-y-5">
              <div className="space-y-3">
                {bonusItems.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="p-4 rounded-xl border border-border/60 bg-card/50 space-y-3 relative group"
                  >

                    {/* Amount */}
                    <div className="space-y-1.5">
                      <Label className="text-xs">Amount ({currency})</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        value={item.amount}
                        onChange={(e) => updateBonusItem(item.id, 'amount', e.target.value)}
                        className={cn(
                          "h-9",
                          errors[`bonus_${index}_amount`] && 'border-destructive'
                        )}
                      />
                      {errors[`bonus_${index}_amount`] && (
                        <p className="text-xs text-destructive">{errors[`bonus_${index}_amount`]}</p>
                      )}
                    </div>

                    {/* Attachment upload - optional, multi */}
                    <div className="space-y-1.5">
                      <Label className="text-xs">Attachment (optional)</Label>
                      {item.attachment.length > 0 && (
                        <div className="space-y-1.5">
                          {item.attachment.map((file, fileIdx) => (
                            <div key={fileIdx} className="flex items-center gap-2 p-2 rounded-lg border border-border/60 bg-muted/30">
                              {file.type.startsWith('image/') ? (
                                <Image className="h-4 w-4 text-primary shrink-0" />
                              ) : (
                                <FileText className="h-4 w-4 text-primary shrink-0" />
                              )}
                              <span className="text-xs flex-1 truncate">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = item.attachment.filter((_, i) => i !== fileIdx);
                                  updateBonusItem(item.id, 'attachment', updated);
                                }}
                                className="p-0.5 hover:bg-muted rounded shrink-0"
                              >
                                <X className="h-3 w-3 text-muted-foreground" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {item.attachment.length < FILE_UPLOAD_MAX_COUNT && (
                        <label className="flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-border/60 cursor-pointer transition-colors hover:border-primary/50 hover:bg-primary/[0.02]">
                          <Upload className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {item.attachment.length === 0 ? 'Upload documents' : 'Add more'}
                          </span>
                          <input
                            type="file"
                            accept={FILE_UPLOAD_ACCEPT}
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              if (files.length > 0) {
                                const { valid, error } = validateFiles(files, item.attachment.length);
                                if (error) {
                                  toast.error(error);
                                } else if (valid.length > 0) {
                                  updateBonusItem(item.id, 'attachment', [...item.attachment, ...valid]);
                                }
                              }
                              e.target.value = '';
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                ))}
              </div>


              <Button onClick={handleSubmitBonus} className="w-full">
                Request adjustment
              </Button>
            </div>
          )}

          {/* Leave Form — calendar-first, lean */}
          {selectedType === 'leave' && (() => {
            const daysNum = parseFloat(leaveDays);
            const hasRange = !!(leaveStartDate && leaveEndDate);
            const sameDay = hasRange && leaveStartDate!.getTime() === leaveEndDate!.getTime();
            const rangeStr = hasRange
              ? sameDay
                ? format(leaveStartDate!, 'd MMM yyyy')
                : `${format(leaveStartDate!, 'd MMM yyyy')} – ${format(leaveEndDate!, 'd MMM yyyy')}`
              : '';
            const canSubmit = !!leaveType && hasRange && !isNaN(daysNum) && daysNum > 0;

            // Legend doubles as type selector. Shows live deduction when this type is selected.
            const legend: { type: LeaveTypeOption; short: string; total: number | null; dotClass: string }[] = [
              { type: 'Paid leave', short: 'Paid', total: 12, dotClass: 'bg-emerald-500' },
              { type: 'Sick leave', short: 'Sick', total: 5, dotClass: 'bg-amber-500' },
              { type: 'Unpaid leave', short: 'Unpaid', total: null, dotClass: 'bg-muted-foreground/60' },
              { type: 'Other leave', short: 'Other', total: null, dotClass: 'bg-sky-500' },
            ];

            return (
              <div className="space-y-5">
                {/* Calendar with inline legend (top-left) — legend chips select type and show live deduction */}
                <div className={cn(
                  'rounded-xl border bg-card/50',
                  (errors['leave_start_date'] || errors['leave_end_date'] || errors['leave_type']) ? 'border-destructive/60' : 'border-border/60'
                )}>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-3 pt-3">
                    {legend.map((b) => {
                      const isSelected = leaveType === b.type;
                      const showDeduction = isSelected && hasRange && !isNaN(daysNum) && daysNum > 0 && b.total !== null;
                      const remaining = b.total !== null ? Math.max(0, b.total - (isSelected && !isNaN(daysNum) ? daysNum : 0)) : null;
                      return (
                        <button
                          key={b.type}
                          type="button"
                          onClick={() => { setLeaveType(b.type); clearError('leave_type'); }}
                          className={cn(
                            'flex items-center gap-1.5 text-[11px] tabular-nums transition-colors rounded-md px-1.5 py-0.5 -mx-1.5',
                            isSelected ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                          )}
                        >
                          <span className={cn('h-1.5 w-1.5 rounded-full', b.dotClass, !isSelected && 'opacity-60')} />
                          <span className={cn(isSelected && 'font-medium')}>{b.short}</span>
                          {b.total !== null ? (
                            showDeduction ? (
                              <span className="text-foreground/80">
                                <span className="line-through text-muted-foreground/70 mr-1">{b.total}</span>{remaining}
                              </span>
                            ) : (
                              <span>{b.total}</span>
                            )
                          ) : (
                            <span className="text-muted-foreground/60">—</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex justify-center px-2 pb-2">
                    <Calendar
                      mode="range"
                      selected={leaveStartDate ? { from: leaveStartDate, to: leaveEndDate } : undefined}
                      onSelect={(range: any) => {
                        const from = range?.from as Date | undefined;
                        const to = (range?.to as Date | undefined) ?? from;
                        setLeaveStartDate(from);
                        setLeaveEndDate(to);
                        setLeaveDaysOverridden(false);
                        setLeaveHalfDayStart(false);
                        setLeaveHalfDayEnd(false);
                        clearError('leave_start_date');
                        clearError('leave_end_date');
                        clearError('leave_days');
                      }}
                      numberOfMonths={1}
                      modifiers={{
                        weekend: (date) => date.getDay() === 0 || date.getDay() === 6,
                      }}
                      modifiersClassNames={{
                        weekend: 'text-muted-foreground/60',
                      }}
                      initialFocus
                      className="p-2 pointer-events-auto"
                    />
                  </div>
                </div>

                {/* Selection summary input + half-day controls below */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Your leave</Label>
                  <div className={cn(
                    'flex items-center justify-between h-10 px-3 rounded-md border bg-background text-sm',
                    hasRange ? 'border-border' : 'border-border/60'
                  )}>
                    <span className={cn('tabular-nums', hasRange ? 'text-foreground' : 'text-muted-foreground')}>
                      {hasRange ? rangeStr : 'Pick dates on the calendar'}
                    </span>
                    {hasRange && !isNaN(daysNum) && daysNum > 0 && (
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {daysNum} {daysNum === 1 ? 'day' : 'days'}
                      </span>
                    )}
                  </div>
                  {hasRange && (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
                      <span className="text-[11px] text-muted-foreground">Half day?</span>
                      <button
                        type="button"
                        onClick={() => { setLeaveHalfDayStart(!leaveHalfDayStart); setLeaveDaysOverridden(false); }}
                        className={cn(
                          'text-[11px] underline-offset-2 transition-colors',
                          leaveHalfDayStart ? 'text-primary underline font-medium' : 'text-muted-foreground hover:text-foreground hover:underline'
                        )}
                      >
                        {sameDay ? 'Half day' : 'First day'}
                      </button>
                      {!sameDay && (
                        <button
                          type="button"
                          onClick={() => { setLeaveHalfDayEnd(!leaveHalfDayEnd); setLeaveDaysOverridden(false); }}
                          className={cn(
                            'text-[11px] underline-offset-2 transition-colors',
                            leaveHalfDayEnd ? 'text-primary underline font-medium' : 'text-muted-foreground hover:text-foreground hover:underline'
                          )}
                        >
                          Last day
                        </button>
                      )}
                    </div>
                  )}
                  {(errors['leave_type'] || errors['leave_start_date'] || errors['leave_end_date'] || errors['leave_days']) && (
                    <p className="text-xs text-destructive">
                      {errors['leave_type'] || errors['leave_end_date'] || errors['leave_start_date'] || errors['leave_days']}
                    </p>
                  )}
                </div>

                {/* Reason / note */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Note (optional)</Label>
                  <Textarea
                    value={leaveNote}
                    onChange={(e) => setLeaveNote(e.target.value)}
                    placeholder="Add context for your admin."
                    rows={2}
                  />
                </div>

                {/* Attachment */}
                <div className="space-y-1.5">
                  {leaveAttachments.length > 0 && (
                    <div className="space-y-1.5">
                      {leaveAttachments.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 rounded-lg border border-border/60 bg-muted/30">
                          {file.type.startsWith('image/') ? (
                            <Image className="h-4 w-4 text-primary shrink-0" />
                          ) : (
                            <FileText className="h-4 w-4 text-primary shrink-0" />
                          )}
                          <span className="text-xs flex-1 truncate">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => setLeaveAttachments((prev) => prev.filter((_, i) => i !== idx))}
                            className="p-0.5 hover:bg-muted rounded shrink-0"
                          >
                            <X className="h-3 w-3 text-muted-foreground" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {leaveAttachments.length < FILE_UPLOAD_MAX_COUNT && (
                    <label className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-dashed border-border/60 cursor-pointer transition-colors hover:border-primary/50 hover:bg-primary/[0.02]">
                      <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {leaveAttachments.length === 0 ? 'Attach proof (optional)' : 'Add more'}
                      </span>
                      <input
                        type="file"
                        accept={FILE_UPLOAD_ACCEPT}
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length > 0) {
                            const { valid, error } = validateFiles(files, leaveAttachments.length);
                            if (error) {
                              toast.error(error);
                            } else if (valid.length > 0) {
                              setLeaveAttachments((prev) => [...prev, ...valid]);
                            }
                          }
                          e.target.value = '';
                        }}
                      />
                    </label>
                  )}
                </div>

                <Button onClick={handleSubmitLeave} disabled={!canSubmit} className="w-full">
                  Request leave
                </Button>
              </div>
            );
          })()}
        </div>
      </SheetContent>
    </Sheet>
  );
};
