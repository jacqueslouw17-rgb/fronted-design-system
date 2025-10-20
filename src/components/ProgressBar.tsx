interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressBar = ({ currentStep, totalSteps }: ProgressBarProps) => {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-foreground/80">Progress</span>
        <span className="text-sm font-semibold text-foreground">
          {currentStep} / {totalSteps}
        </span>
      </div>
      <div className="w-full h-1.5 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm">
        <div
          className="h-full bg-gradient-progress transition-all duration-500 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
