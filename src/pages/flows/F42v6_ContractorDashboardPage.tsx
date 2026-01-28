/**
 * Flow 4.2 — Contractor Dashboard v6 Page
 * INDEPENDENT from v5 and all other flows.
 */

import { useState } from 'react';
import { F42v6_UpcomingInvoiceCard, F42v6_AdjustmentsSection, F42v6_AdjustmentDrawer } from '@/components/flows/contractor-dashboard-v6';
import type { ContractorRequestType } from '@/components/flows/contractor-dashboard-v6/F42v6_AdjustmentDrawer';
import { useF42v6_DashboardStore } from '@/stores/F42v6_DashboardStore';

const F42v6_ContractorDashboardPage = () => {
  const { currency, contractType } = useF42v6_DashboardStore();
  
  const [adjustmentDrawerOpen, setAdjustmentDrawerOpen] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<ContractorRequestType>(null);
  const [adjustmentCategory, setAdjustmentCategory] = useState('');
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentRejectedId, setAdjustmentRejectedId] = useState<string | undefined>();
  const [adjustmentHours, setAdjustmentHours] = useState<number | undefined>();
  const [adjustmentDate, setAdjustmentDate] = useState<string | undefined>();
  const [adjustmentStartTime, setAdjustmentStartTime] = useState<string | undefined>();
  const [adjustmentEndTime, setAdjustmentEndTime] = useState<string | undefined>();

  const handleRequestAdjustment = (type?: string, category?: string, amount?: string, rejectedId?: string, hours?: number, date?: string, startTime?: string, endTime?: string) => {
    const typeMap: Record<string, ContractorRequestType> = {
      'expense': 'expense',
      'additional-hours': 'additional-hours',
      'bonus': 'bonus'
    };
    setAdjustmentType(type ? typeMap[type] || null : null);
    setAdjustmentCategory(category || '');
    setAdjustmentAmount(amount || '');
    setAdjustmentRejectedId(rejectedId);
    setAdjustmentHours(hours);
    setAdjustmentDate(date);
    setAdjustmentStartTime(startTime);
    setAdjustmentEndTime(endTime);
    setAdjustmentDrawerOpen(true);
  };

  const handleAdjustmentDrawerClose = (open: boolean) => {
    setAdjustmentDrawerOpen(open);
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
          <h1 className="text-2xl font-bold text-foreground">Contractor Dashboard v6</h1>
          <p className="text-sm text-muted-foreground mt-1">Independent clone for iteration</p>
        </div>
        
        <F42v6_UpcomingInvoiceCard />
        <F42v6_AdjustmentsSection onRequestAdjustment={handleRequestAdjustment} />
        
        <F42v6_AdjustmentDrawer
          open={adjustmentDrawerOpen}
          onOpenChange={handleAdjustmentDrawerClose}
          currency={currency}
          contractType={contractType}
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

export default F42v6_ContractorDashboardPage;
