import { motion } from "framer-motion";

interface AudioWaveVisualizerProps {
  isActive?: boolean;
  isResting?: boolean;
}

const AudioWaveVisualizer = ({ isActive = false, isResting = true }: AudioWaveVisualizerProps) => {
  // Create 5 wave lines with different animations
  const waves = [
    { delay: 0, color: "hsl(var(--primary) / 0.3)", activeHeight: 40, restingHeight: 8 },
    { delay: 0.1, color: "hsl(var(--primary) / 0.5)", activeHeight: 60, restingHeight: 12 },
    { delay: 0.2, color: "hsl(var(--primary))", activeHeight: 80, restingHeight: 16 },
    { delay: 0.3, color: "hsl(var(--secondary) / 0.5)", activeHeight: 60, restingHeight: 12 },
    { delay: 0.4, color: "hsl(var(--secondary) / 0.3)", activeHeight: 40, restingHeight: 8 },
  ];

  return (
    <div className="relative w-64 h-32 flex items-center justify-center gap-2">
      {/* Glow effect behind waves */}
      {isActive && (
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 blur-2xl"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.4), transparent)' }}
        />
      )}

      {/* Animated wave lines */}
      {waves.map((wave, index) => (
        <motion.div
          key={index}
          className="w-1 rounded-full"
          style={{
            background: wave.color,
            boxShadow: isActive ? `0 0 20px ${wave.color}` : 'none',
          }}
          animate={
            isActive
              ? {
                  height: [wave.activeHeight * 0.3, wave.activeHeight, wave.activeHeight * 0.4, wave.activeHeight, wave.activeHeight * 0.3],
                  scaleY: [1, 1.2, 0.8, 1.2, 1],
                }
              : isResting
              ? {
                  height: [wave.restingHeight * 0.8, wave.restingHeight, wave.restingHeight * 0.8],
                  scaleY: [1, 1.1, 1],
                }
              : {
                  height: wave.restingHeight * 0.5,
                }
          }
          transition={{
            duration: isActive ? 1.2 : 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: wave.delay,
          }}
        />
      ))}
    </div>
  );
};

export default AudioWaveVisualizer;
