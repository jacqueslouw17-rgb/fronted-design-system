import { motion } from "framer-motion";
import { useState } from "react";

interface AudioWaveVisualizerProps {
  isActive?: boolean;
  isListening?: boolean;
  isDetectingVoice?: boolean;
}

const AudioWaveVisualizer = ({ isActive = false, isListening = false, isDetectingVoice = false }: AudioWaveVisualizerProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Determine animation state: full active, listening (resting), or idle
  const isFullyActive = (isActive && !isListening) || (isListening && isDetectingVoice);
  const isIdleBreathing = !isFullyActive && !isListening;
  
  // Create 5 wave lines with refined breathing animation
  const waves = [
    { delay: 0, restingHeight: 16, glowIntensity: 0.3 },
    { delay: 0.15, restingHeight: 24, glowIntensity: 0.5 },
    { delay: 0.3, restingHeight: 32, glowIntensity: 0.7 },
    { delay: 0.45, restingHeight: 24, glowIntensity: 0.5 },
    { delay: 0.6, restingHeight: 16, glowIntensity: 0.3 },
  ];

  return (
    <div 
      className="relative w-64 h-32 flex items-center justify-center gap-2 group transition-all duration-300"
      style={{ contain: 'layout' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Enhanced breathing glow effect for idle state */}
      <motion.div
        animate={{
          opacity: isIdleBreathing 
            ? [0.7, 0.9, 1, 0.9, 0.7]
            : isFullyActive 
            ? [0.3, 0.6, 0.3]
            : [0.4, 0.5, 0.4],
          scale: isIdleBreathing
            ? isHovered ? [1.05, 1.15, 1.2, 1.15, 1.05] : [1, 1.08, 1.15, 1.08, 1]
            : isFullyActive
            ? [1, 1.2, 1]
            : [1, 1.05, 1],
        }}
        transition={{
          duration: isIdleBreathing ? (isHovered ? 1.5 : 3) : isFullyActive ? 1.2 : 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 blur-3xl pointer-events-none"
        style={{ 
          background: isIdleBreathing
            ? 'radial-gradient(circle, #3B82F6 0%, #60A5FA 40%, #93C5FD 70%, transparent 100%)'
            : 'radial-gradient(circle, hsl(var(--primary) / 0.5), transparent)',
        }}
      />

      {/* Interactive hover ripple - activates on hover */}
      {isHovered && isIdleBreathing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: [0, 0.5, 0],
            scale: [0.8, 1.4, 1.6],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeOut"
          }}
          className="absolute inset-0 blur-2xl pointer-events-none"
          style={{ 
            background: 'radial-gradient(circle, #60A5FA 0%, #93C5FD 50%, transparent 100%)',
          }}
        />
      )}

      {/* Animated wave lines with enhanced idle breathing */}
      {waves.map((wave, index) => (
        <motion.div
          key={index}
          className="w-1 rounded-full transition-shadow duration-300 motion-reduce:animate-none"
          style={{
            background: `linear-gradient(to bottom, #3B82F6, #60A5FA, #93C5FD)`,
            boxShadow: isIdleBreathing 
              ? `0 0 ${10 + (isHovered ? 6 : 0)}px rgba(59, 130, 246, ${wave.glowIntensity + (isHovered ? 0.15 : 0)})`
              : isFullyActive 
              ? `0 0 20px hsl(var(--primary) / ${wave.glowIntensity})`
              : 'none',
            willChange: 'height, opacity',
          }}
          animate={{
            height: isIdleBreathing
              ? isHovered
                ? [wave.restingHeight * 0.9, wave.restingHeight * 1.15, wave.restingHeight * 1.3, wave.restingHeight * 1.15, wave.restingHeight * 0.9]
                : [wave.restingHeight * 0.85, wave.restingHeight, wave.restingHeight * 1.1, wave.restingHeight, wave.restingHeight * 0.85]
              : isFullyActive
              ? [wave.restingHeight * 1.5, wave.restingHeight * 2.5, wave.restingHeight * 1.8, wave.restingHeight * 2.5, wave.restingHeight * 1.5]
              : isListening
              ? [8, 12, 8]
              : [wave.restingHeight * 0.8, wave.restingHeight, wave.restingHeight * 0.8],
            opacity: isIdleBreathing
              ? isHovered
                ? [0.75, 0.9, 1, 0.9, 0.75]
                : [0.7, 0.85, 1, 0.85, 0.7]
              : [0.8, 1, 0.8],
          }}
          transition={{
            duration: isIdleBreathing ? (isHovered ? 1.5 : 3) : isFullyActive ? 1.2 : isListening ? 2 : 3,
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
