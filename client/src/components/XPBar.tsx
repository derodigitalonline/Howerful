import { motion } from 'framer-motion';
import { UserProfile } from '@shared/schema';
import { getXPForLevel, getXPForNextLevel, getProgressToNextLevel, MAX_LEVEL } from '@/utils/xpCalculator';

interface XPBarProps {
  profile: UserProfile;
  className?: string;
}

export default function XPBar({ profile, className = '' }: XPBarProps) {
  const { level, totalXP } = profile;
  const progress = getProgressToNextLevel(totalXP);
  const currentLevelXP = getXPForLevel(level);
  const xpIntoLevel = totalXP - currentLevelXP;
  const xpNeededForNextLevel = getXPForNextLevel(level);
  const isMaxLevel = level >= MAX_LEVEL;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Level & Total XP Display */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold text-foreground mb-1">
            Level {level}
          </div>
          <div className="text-sm text-muted-foreground">
            {totalXP.toLocaleString()} Total XP
          </div>
        </div>

        {!isMaxLevel && (
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-1">Next Lvl</div>
            <div className="text-lg font-semibold text-foreground">
              {(xpNeededForNextLevel - xpIntoLevel).toLocaleString()} XP
            </div>
          </div>
        )}
        {isMaxLevel && (
          <div className="text-right">
            <span className="text-sm font-semibold text-blue-500">
              MAX LEVEL!
            </span>
          </div>
        )}
      </div>

      {/* Progress bar container */}
      <div className="h-4 bg-muted rounded-full overflow-hidden relative shadow-inner">
        {/* XP Fill Bar - Clean Blue Gradient */}
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 relative"
          initial={{ width: 0 }}
          animate={{ width: `${isMaxLevel ? 100 : progress}%` }}
          transition={{ type: 'spring', stiffness: 50, damping: 15 }}
        />
      </div>

      {/* Progress percentage */}
      {!isMaxLevel && (
        <div className="text-center">
          <span className="text-xs text-muted-foreground font-medium">
            {progress}% to next level
          </span>
        </div>
      )}
    </div>
  );
}
