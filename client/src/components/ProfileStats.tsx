import { UserProfile } from '@shared/schema';
import { Card } from '@/components/ui/card';
import { Trophy, Target, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { getXPForLevel, getXPForNextLevel } from '@/utils/xpCalculator';

interface ProfileStatsProps {
  profile: UserProfile;
}

export default function ProfileStats({ profile }: ProfileStatsProps) {
  const { level, totalXP, tasksCompleted } = profile;
  const xpForCurrentLevel = getXPForLevel(level);
  const xpForNextLevel = getXPForNextLevel(level);

  const stats = [
    {
      icon: Trophy,
      label: 'Level',
      value: level,
      color: 'text-chart-1',
      bgColor: 'bg-chart-1/10',
    },
    {
      icon: Zap,
      label: 'Total XP',
      value: totalXP.toLocaleString(),
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10',
    },
    {
      icon: Target,
      label: 'Tasks Done',
      value: tasksCompleted,
      color: 'text-chart-3',
      bgColor: 'bg-chart-3/10',
    },
    {
      icon: TrendingUp,
      label: 'Next Level',
      value: xpForNextLevel > 0 ? `${xpForNextLevel} XP` : 'MAX',
      color: 'text-chart-4',
      bgColor: 'bg-chart-4/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className={`p-4 ${stat.bgColor} border-none`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-background/50 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-medium">
                  {stat.label}
                </p>
                <p className={`text-lg font-bold ${stat.color} truncate`}>
                  {stat.value}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
