import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface BarHeaderProps {
  title: string;
  icon?: ReactNode;
  rightContent?: ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'gradient';
  className?: string;
}

/**
 * BarHeader Component
 *
 * A visually striking header bar that sits above content sections.
 * Features gradient backgrounds, animations, and flexible content slots.
 *
 * @example
 * <BarHeader
 *   title="Daily Quests"
 *   icon={<Calendar className="w-5 h-5" />}
 *   variant="gradient"
 *   rightContent={<span>Resets in 22h 31m</span>}
 * />
 */
export default function BarHeader({
  title,
  icon,
  rightContent,
  variant = 'gradient',
  className,
}: BarHeaderProps) {
  // Variant-specific styling
  const variantStyles = {
    primary: 'bg-gradient-to-r from-primary/15 via-primary/20 to-primary/15 border-primary/40',
    success: 'bg-gradient-to-r from-success/15 via-success/20 to-success/15 border-success/40',
    warning: 'bg-gradient-to-r from-yellow-500/15 via-yellow-500/20 to-yellow-500/15 border-yellow-500/40',
    gradient: 'bg-gradient-to-r from-primary/10 via-chart-2/15 to-primary/10 border-primary/30',
  };

  const glowStyles = {
    primary: 'shadow-primary/20',
    success: 'shadow-success/20',
    warning: 'shadow-yellow-500/20',
    gradient: 'shadow-primary/15',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'relative overflow-hidden',
        'border-2 rounded-t-lg',
        'px-3 py-2',
        'flex items-center justify-between',
        'backdrop-blur-sm',
        'shadow-lg',
        variantStyles[variant],
        glowStyles[variant],
        className
      )}
    >
      {/* Animated background gradient overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{ pointerEvents: 'none' }}
      />

      {/* Left: Icon + Title */}
      <div className="flex items-center gap-3 relative z-10">
        {icon && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="text-primary"
          >
            {icon}
          </motion.div>
        )}
        <motion.h2
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="text-l font-bold tracking-wide uppercase text-foreground"
        >
          {title}
        </motion.h2>
      </div>

      {/* Right: Custom content slot */}
      {rightContent && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="relative z-10"
        >
          {rightContent}
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * TimerBadge - A pre-styled component for countdown timers
 * Designed to be used in BarHeader's rightContent slot
 *
 * @example
 * <BarHeader
 *   title="Daily Quests"
 *   rightContent={<TimerBadge time="22h 31m" />}
 * />
 */
export function TimerBadge({ time, label = 'Resets in' }: { time: string; label?: string }) {
  return (
    <motion.div
      className="flex items-center gap-2 px-4 py-1 rounded-full bg-background/60 backdrop-blur-sm border border-primary/30"
      animate={{
        boxShadow: [
          '0 0 0 0 rgba(var(--primary-rgb, 59 130 246) / 0)',
          '0 0 0 4px rgba(var(--primary-rgb, 59 130 246) / 0.1)',
          '0 0 0 0 rgba(var(--primary-rgb, 59 130 246) / 0)',
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
      <motion.span
        className="text-sm font-bold text-primary tabular-nums"
        animate={{
          opacity: [1, 0.7, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {time}
      </motion.span>
    </motion.div>
  );
}
