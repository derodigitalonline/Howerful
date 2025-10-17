import { useProfile } from '@/hooks/useProfile';
import ProfileStats from '@/components/ProfileStats';
import XPBar from '@/components/XPBar';
import NavigationDrawer from '@/components/NavigationDrawer';
import { motion } from 'framer-motion';
import { Trophy, Target, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function Progress() {
  const { profile } = useProfile();

  return (
    <div className="flex h-screen">
      <NavigationDrawer />

      <div className="flex-1 ml-64 flex flex-col">
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Your Progress</h1>
              <p className="text-muted-foreground">
                Track your level, XP, and achievements
              </p>
            </div>

            {/* XP Bar Section */}
            <Card className="p-6 mb-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                Experience
              </h2>
              <XPBar profile={profile} />
            </Card>

            {/* Stats Grid */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                Statistics
              </h2>
              <ProfileStats profile={profile} />
            </div>

            {/* Placeholder for future features */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-chart-1/10">
                    <Trophy className="w-5 h-5 text-chart-1" />
                  </div>
                  <h3 className="font-semibold">Achievements</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Coming soon: Unlock achievements as you complete tasks and level up!
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-chart-2/10">
                    <Target className="w-5 h-5 text-chart-2" />
                  </div>
                  <h3 className="font-semibold">Avatar Customization</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Coming soon: Customize your avatar with unlockable items!
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-chart-3/10">
                    <TrendingUp className="w-5 h-5 text-chart-3" />
                  </div>
                  <h3 className="font-semibold">Productivity Insights</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Coming soon: View charts and graphs of your productivity over time!
                </p>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
