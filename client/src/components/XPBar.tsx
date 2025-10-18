import { motion } from 'framer-motion';
import { UserProfile } from '@shared/schema';
import { getXPForLevel, getXPForNextLevel, getProgressToNextLevel, MAX_LEVEL } from '@/utils/xpCalculator';
import { Sparkles } from 'lucide-react';

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
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Level Badge */}
      <motion.div
        className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-success to-emerald-600 shadow-lg"
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      >
        <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300" />
        <span className="text-lg font-bold text-white">{level}</span>
      </motion.div>

      {/* XP Progress Bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-xs font-medium text-foreground">
            Level {level}
          </span>
          {!isMaxLevel && (
            <span className="text-xs text-muted-foreground">
              {xpIntoLevel.toLocaleString()} / {xpNeededForNextLevel.toLocaleString()} XP
            </span>
          )}
          {isMaxLevel && (
            <span className="text-xs font-semibold text-success">
              MAX LEVEL!
            </span>
          )}
        </div>

        {/* Progress bar container */}
        <div className="h-3 bg-muted rounded-full overflow-hidden relative shadow-inner">
          {/* Animated gradient background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-success/20 via-emerald-500/20 to-success/20"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* XP Fill Bar */}
          <motion.div
            className="h-full bg-gradient-to-r from-success to-emerald-500 relative overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: `${isMaxLevel ? 100 : progress}%` }}
            transition={{ type: 'spring', stiffness: 50, damping: 15 }}
          >
            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
                repeatDelay: 1,
              }}
            />
          </motion.div>
        </div>

        {/* Progress percentage */}
        {!isMaxLevel && (
          <div className="mt-0.5 text-right">
            <span className="text-[10px] text-muted-foreground font-medium">
              {progress}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
