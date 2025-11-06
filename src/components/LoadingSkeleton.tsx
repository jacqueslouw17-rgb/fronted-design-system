import { motion } from "framer-motion";
import AudioWaveVisualizer from "./AudioWaveVisualizer";

interface LoadingSkeletonProps {
  title?: string;
  subtitle?: string;
  fieldCount?: number;
  onComplete?: () => void;
}

const LoadingSkeleton = ({ 
  title = "Retrieving details", 
  subtitle = "Please wait a moment",
  fieldCount = 6,
  onComplete
}: LoadingSkeletonProps) => {
  
  return (
    <div className="space-y-6 p-6">
      {/* Kurt frequency animation + text */}
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <AudioWaveVisualizer isActive={true} />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className="text-center space-y-2"
        >
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </motion.div>
      </div>
      
      {/* Sequential fade-out skeleton bars */}
      <div className="space-y-4">
        {Array.from({ length: fieldCount }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ 
              opacity: 0, 
              y: -6,
              transition: {
                duration: 0.4,
                delay: index * 0.15,
                ease: "easeOut"
              }
            }}
            className="space-y-2"
          >
            <div className="skeleton-shimmer h-4 w-32 rounded-md" />
            <div className="skeleton-shimmer h-10 w-full rounded-md" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSkeleton;
