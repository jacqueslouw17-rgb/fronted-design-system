/**
 * Flow 4.1 — Employee Dashboard v4
 * Returned/Rejected Submission Banner
 * INDEPENDENT from v3 - changes here do not affect other flows.
 */

import { AlertTriangle, ArrowRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface F41v4_ReturnedSubmissionBannerProps {
  reason: string;
  resubmitBy?: string;
  onFixClick: () => void;
  className?: string;
}

export const F41v4_ReturnedSubmissionBanner = ({
  reason,
  resubmitBy,
  onFixClick,
  className,
}: F41v4_ReturnedSubmissionBannerProps) => {
  return (
    <div
      className={cn(
        'p-4 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <p className="font-medium text-amber-800 dark:text-amber-200">
              Returned to you
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300/80 mt-1">
              {reason}
            </p>
          </div>

          {resubmitBy && (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
              <Calendar className="h-3 w-3" />
              <span>Resubmit by: {resubmitBy}</span>
            </div>
          )}

          <Button
            onClick={onFixClick}
            size="sm"
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            Fix & resubmit
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};
