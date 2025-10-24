import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Gift, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DailyQuestProps {
  name: string;
  description: string;
  progress: number;
  requirement: number;
  coinReward: number;
  xpReward: number;
  completed: boolean;
  claimed: boolean;
  onClaim?: () => void;
}

export default function DailyQuest({
  name,
  description,
  progress,
  requirement,
  coinReward,
  xpReward,
  completed,
  claimed,
  onClaim,
}: DailyQuestProps) {
  const progressPercent = Math.min((progress / requirement) * 100, 100);
  const canClaim = completed && !claimed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn(
        "relative overflow-hidden transition-opacity",
        claimed && "opacity-50"
      )}>
        <div className="p-4">
          {/* Header */}
          <div className="mb-3">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className={cn(
                "font-bold text-base",
                claimed && "line-through text-muted-foreground"
              )}>
                {name}
              </h3>
              {claimed && (
                <Badge className="bg-success/20 text-success border-success/30 border font-bold text-xs shrink-0">
                  Claimed
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Progress
              </span>
              <span className="text-xs font-bold">
                {progress}/{requirement}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${
                  completed ? 'bg-success' : 'bg-primary'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Rewards */}
          <div className="mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Rewards
            </p>
            <div className="flex items-center gap-3">
              {/* Coin Reward */}
              <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1.5 rounded-lg">
                <img src="/assets/howie-coin.png" alt="Coins" className="w-4 h-4" />
                <span className="text-sm font-bold">+{coinReward}</span>
              </div>
              {/* XP Reward */}
              <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1.5 rounded-lg">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-bold">+{xpReward} XP</span>
              </div>
            </div>
          </div>

          {/* Claim Button or Status */}
          {claimed ? (
            <div className="flex items-center justify-center gap-2 py-2 text-success font-medium">
              <Check className="w-4 h-4" />
              <span className="text-sm">Claimed!</span>
            </div>
          ) : canClaim && onClaim ? (
            <Button
              onClick={onClaim}
              className="w-full bg-success hover:bg-success/90 text-white font-bold py-4 shadow-[0_3px_0_0_hsl(var(--success)/.7)] active:shadow-[0_1px_0_0_hsl(var(--success)/.7)] active:translate-y-[2px] transition-all"
              size="sm"
            >
              <Gift className="w-4 h-4 mr-2" />
              Claim Reward
            </Button>
          ) : null}
        </div>
      </Card>
    </motion.div>
  );
}
