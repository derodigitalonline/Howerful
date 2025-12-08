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
  const tabs: { bucket: Bucket; label: string; icon?: React.ReactNode }[] = [
    { bucket: 'today', label: 'Today' },
    { bucket: 'tomorrow', label: 'Tomorrow' },
    { bucket: 'someday', label: 'Someday' },
  ];

  return (
    <div className="relative border-b border-border">
      {/* Tab Container */}
      <div className="flex items-center gap-1">
        {tabs.map((tab) => {
          const isActive = activeBucket === tab.bucket;
          const count = counts[tab.bucket];

          return (
            <button
              key={tab.bucket}
              onClick={() => onBucketChange(tab.bucket)}
              className={cn(
                "relative px-4 py-2.5 rounded-md font-medium transition-all duration-200",
                isActive
                  ? "bg-card text-primary shadow-sm"
                  : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              {/* Tab Content */}
              <div className="flex items-center gap-2">
                {tab.icon}
                <span className="text-sm">{tab.label}</span>
                {count > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={cn(
                      "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "bg-muted-foreground/10 text-muted-foreground"
                    )}
                  >
                    {count}
                  </motion.span>
                )}
              </div>

              {/* Active Tab Indicator - Bottom border */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}

        {/* Future: Custom Collections Button */}
        <button
          disabled
          className="ml-2 px-3 py-2 rounded-md bg-transparent text-muted-foreground/40 cursor-not-allowed"
          title="Custom collections coming soon"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
