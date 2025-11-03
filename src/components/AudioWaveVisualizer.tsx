import { motion } from "framer-motion";

interface AudioWaveVisualizerProps {
  isActive?: boolean;
  isListening?: boolean;
  isDetectingVoice?: boolean;
}

const AudioWaveVisualizer = ({ isActive = false, isListening = false, isDetectingVoice = false }: AudioWaveVisualizerProps) => {
  // Determine animation state: full active, listening (resting), or inactive
  const isFullyActive = (isActive && !isListening) || (isListening && isDetectingVoice);
  // Create 5 wave lines with different animations
  const waves = [
    { delay: 0, color: "hsl(var(--primary) / 0.3)", activeHeight: 40, restingHeight: 12 },
    { delay: 0.1, color: "hsl(var(--primary) / 0.5)", activeHeight: 60, restingHeight: 18 },
    { delay: 0.2, color: "hsl(var(--primary))", activeHeight: 80, restingHeight: 24 },
    { delay: 0.3, color: "hsl(var(--secondary) / 0.5)", activeHeight: 60, restingHeight: 18 },
    { delay: 0.4, color: "hsl(var(--secondary) / 0.3)", activeHeight: 40, restingHeight: 12 },
  ];

  return (
    <div className="relative w-64 h-32 flex items-center justify-center gap-2" style={{ contain: 'layout' }}>
      {/* Glow effect behind waves */}
      {isFullyActive && (
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
            boxShadow: isFullyActive ? `0 0 20px ${wave.color}` : 'none',
            willChange: 'height',
          }}
          animate={
            isFullyActive
              ? {
                  height: [wave.activeHeight * 0.3, wave.activeHeight, wave.activeHeight * 0.4, wave.activeHeight, wave.activeHeight * 0.3],
                }
              : isListening
              ? {
                  height: [8, 10, 8],
                }
              : {
                  height: [wave.restingHeight * 0.8, wave.restingHeight, wave.restingHeight * 0.8],
                }
          }
          transition={{
            duration: isFullyActive ? 1.2 : isListening ? 2 : 3.5,
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
