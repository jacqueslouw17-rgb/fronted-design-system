/**
 * F1v4_ReviewStep - Review payroll totals and workers
 * 
 * This file is kept for backwards compatibility but is now deprecated.
 * The review functionality has been moved to F1v4_CompanyPayrollRun which 
 * shows a landing KPI view first, then enters the F1v4_SubmissionsView workflow.
 */

import React from "react";
import { F1v4_SubmissionsView, WorkerSubmission } from "./F1v4_SubmissionsView";

interface F1v4_ReviewStepProps {
  submissions: WorkerSubmission[];
  onContinue: () => void;
  onClose?: () => void;
}

export const F1v4_ReviewStep: React.FC<F1v4_ReviewStepProps> = ({
  submissions,
  onContinue,
  onClose,
}) => {
  return (
    <F1v4_SubmissionsView
      submissions={submissions}
      onContinue={onContinue}
      onClose={onClose}
    />
  );
};

export default F1v4_ReviewStep;
