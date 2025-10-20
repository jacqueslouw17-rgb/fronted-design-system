import { motion } from "framer-motion";

interface AudioWaveVisualizerProps {
  isActive?: boolean;
}

const AudioWaveVisualizer = ({ isActive = false }: AudioWaveVisualizerProps) => {
  // Create 5 wave lines with different animations
  const waves = [
    { delay: 0, color: "hsl(var(--primary) / 0.3)", height: 40 },
    { delay: 0.1, color: "hsl(var(--primary) / 0.5)", height: 60 },
    { delay: 0.2, color: "hsl(var(--primary))", height: 80 },
    { delay: 0.3, color: "hsl(var(--secondary) / 0.5)", height: 60 },
    { delay: 0.4, color: "hsl(var(--secondary) / 0.3)", height: 40 },
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
                  height: [wave.height * 0.3, wave.height, wave.height * 0.4, wave.height, wave.height * 0.3],
                  scaleY: [1, 1.2, 0.8, 1.2, 1],
                }
              : {
                  height: wave.height * 0.2,
                }
          }
          transition={{
            duration: 1.2,
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
