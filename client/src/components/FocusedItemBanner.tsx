import { motion } from 'framer-motion';
import { useFocus } from '@/hooks/useFocus';
import { Card } from '@/components/ui/card';
import { Timer, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import FocusControls from './FocusControls';

export default function FocusedItemBanner() {
  const { activeItemText, activeItemId, formattedTime, phase, isRunning } = useFocus();

  // Don't show banner if no item is in focus
  if (!activeItemId || !activeItemText) {
    return null;
  }

  // Phase indicator colors
  const phaseColor = {
    work: 'text-primary border-primary/30 bg-primary/5',
    shortBreak: 'text-green-500 border-green-500/30 bg-green-500/5',
    longBreak: 'text-blue-500 border-blue-500/30 bg-blue-500/5',
  }[phase];

  const phaseLabel = {
    work: 'Focusing',
    shortBreak: 'Short Break',
    longBreak: 'Long Break',
  }[phase];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="mb-6"
    >
      <Card className={`p-4 border-2 ${phaseColor} transition-colors duration-300`}>
        <div className="flex items-center gap-4">
          {/* Timer Icon with Pulse */}
          <div className="relative flex-shrink-0">
            <Timer className="w-6 h-6" />
            {isRunning && (
              <motion.div
                className="absolute inset-0 rounded-full bg-current opacity-20"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wide opacity-70">
                {phaseLabel}
              </span>
              <span className="text-xs opacity-50">•</span>
              <span className="text-sm font-mono font-semibold">
                {formattedTime}
              </span>
            </div>
            <p className="text-base font-medium truncate">
              {activeItemText}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <FocusControls variant="compact" />

            {/* Link to Focus Page */}
            <Link href="/focus">
              <a>
                <Button size="sm" variant="ghost" className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  <span className="hidden sm:inline">View</span>
                </Button>
              </a>
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
