import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CardEyebrow } from '@/components/ui/card-eyebrow';
import { Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BulletItem } from '@shared/schema';

interface VITBannerProps {
  item: BulletItem;
  onToggleComplete: (id: string) => void;
  className?: string;
}

export default function VITBanner({
  item,
  onToggleComplete,
  className,
}: VITBannerProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', duration: 0.5 }}
      className={cn("mb-6", className)}
    >
      <Card
        className={cn(
          'relative p-4 border-2 transition-all duration-200',
          'bg-gradient-to-br from-indigo-50 via-purple-50 to-background',
          'dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-background',
          'border-indigo-300 dark:border-indigo-700',
          'shadow-lg shadow-indigo-500/20',
          'hover:shadow-xl hover:shadow-indigo-500/30'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Card Eyebrow */}
        <CardEyebrow className="bg-white dark:bg-background border-indigo-300 dark:border-indigo-700">
          [VERY IMPORTANT TASK]
        </CardEyebrow>

        {/* Main Content */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-3">
            {/* Task Text */}
            <p className="text-lg font-semibold">
              {item.text}
            </p>

            {/* Bounty Badge */}
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full shadow-md">
                <Coins className="w-4 h-4" />
                <span className="text-sm font-bold">{item.vitBounty}</span>
              </div>
            </div>
          </div>

          {/* Complete Button (shows on hover) - only for incomplete items */}
          {!item.completed && !item.vitCompletedAt && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{
                opacity: isHovered ? 1 : 0,
                x: isHovered ? 0 : 20
              }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="default"
                onClick={() => onToggleComplete(item.id)}
                className="shadow-lg"
              >
                Complete
              </Button>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
