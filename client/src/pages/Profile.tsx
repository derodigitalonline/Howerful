import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Trophy, Target, Flame } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import HowieViewer3D from '@/components/HowieViewer3D';
import XPBar from '@/components/XPBar';
import CoinDisplay from '@/components/CoinDisplay';
import ProfilePictureUpload from '@/components/ProfilePictureUpload';

export default function Profile() {
  const { profile } = useProfile();

  // Get level tier for styling
  const getLevelBadgeStyle = (level: number) => {
    if (level >= 50) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black border-yellow-300 border-2';
    if (level >= 40) return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
    if (level >= 30) return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
    if (level >= 20) return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
    if (level >= 10) return 'bg-gradient-to-r from-orange-500 to-red-500 text-white';
    return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
  };

  return (
    <div className="h-full overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Full-Width 3D Viewer Header */}
        <div className="relative h-[400px] bg-gradient-to-br from-background via-muted/30 to-background border-b-2 border-border overflow-hidden">
          {/* 3D Viewer */}
          <div className="absolute inset-0">
            <HowieViewer3D
              equippedCosmetics={profile.equippedCosmetics}
              autoRotate={true}
              enableZoom={true}
              enablePan={false}
              pixelSize={2}
            />
          </div>

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />

          {/* Profile Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-end gap-6">
                {/* User Info */}
                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground drop-shadow-lg">
                      {profile.userName || 'User'}
                    </h1>
                    <Badge
                      className={`text-sm px-3 py-1 font-bold ${getLevelBadgeStyle(profile.level)}`}
                    >
                      LVL {profile.level}
                    </Badge>
                  </div>
                  <p className="text-lg text-muted-foreground">
                    {profile.howieName || "Howie"}'s Trainer
                  </p>
                </div>

                {/* Customize Button */}
                <Button
                  size="lg"
                  className="gap-2 font-bold"
                  onClick={() => window.location.href = '/customize'}
                >
                  <Sparkles className="w-5 h-5" />
                  Customize Howie
                </Button>
              </div>
            </div>
          </div>

          {/* Controls Hint */}
          <div className="absolute top-4 right-4">
            <p className="text-xs text-muted-foreground bg-background/80 px-3 py-1.5 rounded-full">
              Drag to rotate • Scroll to zoom
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-7xl mx-auto p-6 md:p-8">
          {/* XP Progress */}
          <Card className="p-6 mb-6">
            <XPBar profile={profile} />
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Level */}
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Level</p>
                  <p className="text-3xl font-bold text-primary">{profile.level}</p>
                </div>
              </div>
            </Card>

            {/* Total XP */}
            <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total XP</p>
                  <p className="text-3xl font-bold text-blue-500">{profile.totalXP.toLocaleString()}</p>
                </div>
              </div>
            </Card>

            {/* Tasks Completed */}
            <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tasks</p>
                  <p className="text-3xl font-bold text-green-500">{profile.bulletTasksCompleted || 0}</p>
                </div>
              </div>
            </Card>

            {/* Howie Coins */}
            <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Howie Coins</p>
                  <div className="mt-1">
                    <CoinDisplay coins={profile.coins || 0} size="md" />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
