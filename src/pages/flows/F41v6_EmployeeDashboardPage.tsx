/**
 * Flow 4.1 — Employee Dashboard v6 Page
 * INDEPENDENT from v5 and all other flows.
 */

import { useState } from 'react';
import { F41v6_UpcomingPayCard, F41v6_AdjustmentsSection, F41v6_TimeOffSection, F41v6_TimeOffRequestDrawer, F41v6_AdjustmentModal } from '@/components/flows/employee-dashboard-v6';
import type { RequestType } from '@/components/flows/employee-dashboard-v6/F41v6_AdjustmentModal';

const F41v6_EmployeeDashboardPage = () => {
  const [timeOffDrawerOpen, setTimeOffDrawerOpen] = useState(false);
  const [timeOffRejectedId, setTimeOffRejectedId] = useState<string | undefined>();
  const [timeOffLeaveType, setTimeOffLeaveType] = useState<string | undefined>();
  const [timeOffStartDate, setTimeOffStartDate] = useState<string | undefined>();
  const [timeOffEndDate, setTimeOffEndDate] = useState<string | undefined>();
  const [timeOffRejectionReason, setTimeOffRejectionReason] = useState<string | undefined>();
  
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<RequestType>(null);
  const [adjustmentCategory, setAdjustmentCategory] = useState('');
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentRejectedId, setAdjustmentRejectedId] = useState<string | undefined>();
  const [adjustmentHours, setAdjustmentHours] = useState<number | undefined>();
  const [adjustmentDate, setAdjustmentDate] = useState<string | undefined>();
  const [adjustmentStartTime, setAdjustmentStartTime] = useState<string | undefined>();
  const [adjustmentEndTime, setAdjustmentEndTime] = useState<string | undefined>();

  const handleRequestTimeOff = (rejectedId?: string, leaveType?: string, startDate?: string, endDate?: string, rejectionReason?: string) => {
    setTimeOffRejectedId(rejectedId);
    setTimeOffLeaveType(leaveType);
    setTimeOffStartDate(startDate);
    setTimeOffEndDate(endDate);
    setTimeOffRejectionReason(rejectionReason);
    setTimeOffDrawerOpen(true);
  };

  const handleRequestAdjustment = (type?: string, category?: string, amount?: string, rejectedId?: string, hours?: number, date?: string, startTime?: string, endTime?: string) => {
    const typeMap: Record<string, RequestType> = {
      'expense': 'expense',
      'overtime': 'overtime',
      'bonus-correction': 'bonus-correction'
    };
    setAdjustmentType(type ? typeMap[type] || null : null);
    setAdjustmentCategory(category || '');
    setAdjustmentAmount(amount || '');
    setAdjustmentRejectedId(rejectedId);
    setAdjustmentHours(hours);
    setAdjustmentDate(date);
    setAdjustmentStartTime(startTime);
    setAdjustmentEndTime(endTime);
    setAdjustmentModalOpen(true);
  };

  const handleTimeOffDrawerClose = (open: boolean) => {
    setTimeOffDrawerOpen(open);
    if (!open) {
      setTimeOffRejectedId(undefined);
      setTimeOffLeaveType(undefined);
      setTimeOffStartDate(undefined);
      setTimeOffEndDate(undefined);
      setTimeOffRejectionReason(undefined);
    }
  };

  const handleAdjustmentModalClose = (open: boolean) => {
    setAdjustmentModalOpen(open);
    if (!open) {
      setAdjustmentType(null);
      setAdjustmentCategory('');
      setAdjustmentAmount('');
      setAdjustmentRejectedId(undefined);
      setAdjustmentHours(undefined);
      setAdjustmentDate(undefined);
      setAdjustmentStartTime(undefined);
      setAdjustmentEndTime(undefined);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Employee Dashboard v6</h1>
          <p className="text-sm text-muted-foreground mt-1">Independent clone for iteration</p>
        </div>
        
        <F41v6_UpcomingPayCard />
        <F41v6_AdjustmentsSection onRequestAdjustment={handleRequestAdjustment} />
        <F41v6_TimeOffSection onRequestTimeOff={handleRequestTimeOff} />
        
        <F41v6_TimeOffRequestDrawer
          open={timeOffDrawerOpen}
          onOpenChange={handleTimeOffDrawerClose}
          rejectedId={timeOffRejectedId}
          rejectionReason={timeOffRejectionReason}
          initialLeaveType={timeOffLeaveType}
          initialStartDate={timeOffStartDate}
          initialEndDate={timeOffEndDate}
        />
        
        <F41v6_AdjustmentModal
          open={adjustmentModalOpen}
          onOpenChange={handleAdjustmentModalClose}
          currency="PHP"
          initialType={adjustmentType}
          initialExpenseCategory={adjustmentCategory}
          initialExpenseAmount={adjustmentAmount}
          rejectedId={adjustmentRejectedId}
          initialHours={adjustmentHours}
          initialDate={adjustmentDate}
          initialStartTime={adjustmentStartTime}
          initialEndTime={adjustmentEndTime}
        />
      </div>
    </div>
  );
};

export default F41v6_EmployeeDashboardPage;
