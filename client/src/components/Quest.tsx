import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LucideIcon, Gift } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuestProps {
  name: string;
  requirement: string;
  rewardName: string;
  rewardIcon: LucideIcon;
  progress?: number;
  total?: number;
  isNew?: boolean;
  isCompleted?: boolean;
  isClaimed?: boolean;
  onClaim?: () => void;
}

export default function Quest({
  name,
  requirement,
  rewardName,
  rewardIcon: RewardIcon,
  progress = 0,
  total = 1,
  isNew = false,
  isCompleted = false,
  isClaimed = false,
  onClaim,
}: QuestProps) {
  const progressPercent = (progress / total) * 100;
  const canClaim = isCompleted && !isClaimed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden">
        {/* NEW Badge */}
        {isNew && (
          <div className="absolute top-3 left-3 z-10">
            <Badge className="bg-destructive text-destructive-foreground font-bold text-xs px-2 py-0.5">
              NEW
            </Badge>
          </div>
        )}

        <div className="p-6">
          {/* Header */}
          <div className={`mb-4 ${isNew ? 'pt-6' : ''}`}>
            <h3 className="font-bold text-lg mb-1">{name}</h3>
            <p className="text-sm text-muted-foreground">{requirement}</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">
                Progress
              </span>
              <span className="text-xs font-bold">
                {progress}/{total}
              </span>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${
                  isCompleted ? 'bg-success' : 'bg-primary'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Rewards Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Rewards
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center border-2 border-border">
                    <RewardIcon className="w-5 h-5 text-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{rewardName}</p>
                  </div>
                </div>
              </div>

              {/* Claimed Badge */}
              {isClaimed && (
                <Badge className="bg-success/20 text-success border-success/30 border font-bold">
                  Claimed
                </Badge>
              )}
            </div>

            {/* Claim Button - Chunky Green Button */}
            {canClaim && onClaim && (
              <Button
                onClick={onClaim}
                className="w-full bg-success hover:bg-success/90 text-white font-bold py-6 shadow-[0_4px_0_0_hsl(var(--success)/.7)] active:shadow-[0_2px_0_0_hsl(var(--success)/.7)] active:translate-y-[2px] transition-all"
                size="lg"
              >
                <Gift className="w-5 h-5 mr-2" />
                Claim Reward
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
