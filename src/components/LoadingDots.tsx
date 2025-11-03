import { motion } from "framer-motion";

interface LoadingDotsProps {
  isActive?: boolean;
}

const LoadingDots = ({ isActive = false }: LoadingDotsProps) => {
  const dots = [
    { delay: 0, color: "hsl(var(--primary) / 0.5)" },
    { delay: 0.2, color: "hsl(var(--primary))" },
    { delay: 0.4, color: "hsl(var(--primary) / 0.7)" },
    { delay: 0.6, color: "hsl(var(--secondary) / 0.7)" },
    { delay: 0.8, color: "hsl(var(--secondary) / 0.5)" },
  ];

  return (
    <div className="relative w-64 h-32 flex items-center justify-center gap-3">
      {/* Glow effect */}
      {isActive && (
        <motion.div
          animate={{
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 blur-2xl"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.3), transparent)' }}
        />
      )}

      {/* Animated dots */}
      {dots.map((dot, index) => (
        <motion.div
          key={index}
          className="w-3 h-3 rounded-full"
          style={{
            background: dot.color,
            boxShadow: `0 0 20px ${dot.color}`,
          }}
          animate={
            isActive
              ? {
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }
              : {
                  scale: 1,
                  opacity: 0.5,
                }
          }
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: dot.delay,
          }}
        />
      ))}
    </div>
  );
};

export default LoadingDots;
