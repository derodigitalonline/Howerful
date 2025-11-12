import { useDroppable } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FocusDropZoneProps {
  isVisible: boolean; // Only show when dragging
}

export default function FocusDropZone({ isVisible }: FocusDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'focus-zone',
  });

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={setNodeRef}
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed bottom-0 left-64 right-0 z-50 pointer-events-auto"
        >
          <div
            className={cn(
              'mx-6 mb-6 p-8 rounded-xl border-2 border-dashed transition-all duration-200',
              'bg-background/95 backdrop-blur-sm shadow-xl',
              isOver
                ? 'border-primary bg-primary/10 scale-105'
                : 'border-muted-foreground/30 hover:border-primary/50'
            )}
          >
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="relative">
                <Timer
                  className={cn(
                    'w-10 h-10 transition-all duration-200',
                    isOver ? 'text-primary scale-110' : 'text-muted-foreground'
                  )}
                />
                {isOver && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Target className="w-5 h-5 text-primary" />
                  </motion.div>
                )}
              </div>

              <div className="text-center">
                <p
                  className={cn(
                    'text-lg font-semibold transition-colors',
                    isOver ? 'text-primary' : 'text-foreground'
                  )}
                >
                  {isOver ? 'Drop to Start Focus Session' : 'Focus Space'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Drag a task here to begin a focused work session
                </p>
              </div>

              {/* Animated pulse ring when hovering */}
              {isOver && (
                <motion.div
                  className="absolute inset-0 rounded-xl border-2 border-primary/50"
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
