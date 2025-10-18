import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface FloatingXPProps {
  x: number;
  y: number;
  amount: number;
  color?: string;
}

export default function FloatingXP({
  x,
  y,
  amount,
  color = 'hsl(var(--success))'
}: FloatingXPProps) {
  return (
    <motion.div
      className="fixed pointer-events-none z-50 flex items-center gap-1"
      style={{
        left: x - 40, // Center the text
        top: y - 20,
      }}
      initial={{
        y: 0,
        opacity: 0,
        scale: 0.5
      }}
      animate={{
        y: -80,
        opacity: [0, 1, 1, 0],
        scale: [0.5, 1.2, 1, 1]
      }}
      transition={{
        duration: 1.5,
        ease: 'easeOut',
        times: [0, 0.2, 0.8, 1]
      }}
    >
      <Zap
        className="w-5 h-5"
        style={{ color }}
        fill={color}
      />
      <span
        className="text-xl font-bold"
        style={{
          color,
          textShadow: `0 0 10px ${color}, 0 0 20px ${color}`
        }}
      >
        +{amount} XP
      </span>
    </motion.div>
  );
}
