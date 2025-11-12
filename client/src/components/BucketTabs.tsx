import { Bucket } from '@shared/schema';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface BucketTabsProps {
  activeBucket: Bucket;
  onBucketChange: (bucket: Bucket) => void;
  counts: {
    today: number;
    tomorrow: number;
    someday: number;
  };
}

export default function BucketTabs({ activeBucket, onBucketChange, counts }: BucketTabsProps) {
  const tabs: { bucket: Bucket; label: string }[] = [
    { bucket: 'today', label: 'Today' },
    { bucket: 'tomorrow', label: 'Tomorrow' },
    { bucket: 'someday', label: 'Someday' },
  ];

  return (
    <div className="relative">
      {/* Tab Container */}
      <div className="flex items-end gap-1">
        {tabs.map((tab) => {
          const isActive = activeBucket === tab.bucket;
          const count = counts[tab.bucket];

          return (
            <button
              key={tab.bucket}
              onClick={() => onBucketChange(tab.bucket)}
              className={cn(
                "relative px-6 py-3 rounded-t-lg font-medium transition-all duration-200",
                "border-t-2 border-x-2",
                isActive
                  ? "bg-card border-primary text-foreground z-10 -mb-[2px] shadow-md"
                  : "bg-muted/50 border-border text-muted-foreground hover:bg-muted hover:text-foreground z-0 mb-0 opacity-80"
              )}
            >
              {/* Tab Content */}
              <div className="flex items-center gap-2">
                <span className="text-sm">{tab.label}</span>
                {count > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={cn(
                      "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted-foreground/20 text-muted-foreground"
                    )}
                  >
                    {count}
                  </motion.span>
                )}
              </div>

              {/* Active Tab Indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-card"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}

        {/* Future: Custom Collections Button */}
        <button
          disabled
          className="ml-2 px-3 py-2 rounded-t-lg bg-muted/30 border-t-2 border-x-2 border-border text-muted-foreground opacity-40 cursor-not-allowed"
          title="Custom collections coming soon"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Border that connects to active tab */}
      <div className="h-[2px] bg-border -mt-[2px] relative z-0" />
    </div>
  );
}
