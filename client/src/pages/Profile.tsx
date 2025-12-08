import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Sparkles, Pencil, Check, X } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import HowieViewer3D from '@/components/HowieViewer3D';
import CoinDisplay from '@/components/CoinDisplay';
import { useState } from 'react';
import { getXPForLevel, getXPForNextLevel } from '@/utils/xpCalculator';

export default function Profile() {
  const { profile, updateHowieName } = useProfile();
  const [isEditingHowie, setIsEditingHowie] = useState(false);
  const [tempHowieName, setTempHowieName] = useState(profile.howieName || 'Howie');

  const handleSaveHowieName = () => {
    updateHowieName(tempHowieName);
    setIsEditingHowie(false);
  };

  const handleCancelEdit = () => {
    setTempHowieName(profile.howieName || 'Howie');
    setIsEditingHowie(false);
  };

  // Get level tier for styling
  const getLevelBadgeStyle = (level: number) => {
    if (level >= 50) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black border-yellow-300 border-2';
    if (level >= 40) return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
    if (level >= 30) return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
    if (level >= 20) return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
    if (level >= 10) return 'bg-gradient-to-r from-orange-500 to-red-500 text-white';
    return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
  };

  // Calculate XP for current level and next level using proper exponential formula
  const currentLevelXP = getXPForLevel(profile.level);
  const nextLevelXP = getXPForLevel(profile.level + 1);
  const xpNeededForLevel = getXPForNextLevel(profile.level);
  const xpInCurrentLevel = profile.totalXP - currentLevelXP;
  const xpNeededForNextLevel = nextLevelXP - profile.totalXP;

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
              pixelSize={1}
            />
          </div>

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900 via-transparent to-transparent pointer-events-none" />

          {/* Profile Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-end gap-6">
                {/* User Info */}
                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                      {profile.userName || 'User'}
                    </h1>
                    <Badge
                      className={`text-sm px-3 py-1 font-bold ${getLevelBadgeStyle(profile.level)}`}
                    >
                      LVL {profile.level}
                    </Badge>
                  </div>
                  {isEditingHowie ? (
                    <div className="flex items-center gap-2 mb-2">
                      <Input
                        value={tempHowieName}
                        onChange={(e) => setTempHowieName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveHowieName();
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        className="max-w-[200px] h-8"
                        maxLength={20}
                        autoFocus
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={handleSaveHowieName}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={handleCancelEdit}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-lg text-muted-foreground mb-2 flex items-center gap-2 group">
                      {profile.howieName || "Howie"}'s Trainer
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setIsEditingHowie(true)}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                    </p>
                  )}

                  {/* Compact XP Bar */}
                  <div className="max-w-md">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>{xpInCurrentLevel.toLocaleString()} / {xpNeededForLevel.toLocaleString()} XP</span>
                      <span>{xpNeededForNextLevel.toLocaleString()} XP to next level</span>
                    </div>
                    <div className="relative h-[10px] bg-muted/30 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-chart-2 rounded-full transition-all duration-500"
                        style={{ width: `${(xpInCurrentLevel / xpNeededForLevel) * 100}%` }}
                      />
                    </div>
                  </div>
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
          {/* Stats Grid - 4 columns on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Howie Coins - Spans 2 columns */}
            <Card className="md:col-span-2 p-6 bg-[#FAF6F0] dark:bg-[#2A2520] border-[#E7E4E2]">
              <p className="text-xs uppercase tracking-wide text-[#8B8680] mb-3">Howie Coins</p>
              <div className="flex items-center gap-3">
                <CoinDisplay coins={profile.coins || 0} size="md" />
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto"
                  onClick={() => window.location.href = '/bazaar'}
                >
                  Shop Items
                </Button>
              </div>
            </Card>

            {/* Tasks Tracked */}
            <Card className="p-6 bg-transparent border-[#E7E4E2]">
              <p className="text-xs uppercase tracking-wide text-[#8B8680] mb-2">Tasks Tracked</p>
              <p className="text-4xl font-semibold italic text-foreground" style={{ fontFamily: 'Funnel Sans, sans-serif' }}>
                {profile.bulletTasksCompleted || 0}
              </p>
            </Card>

            {/* Quests Completed */}
            <Card className="p-6 bg-transparent border-[#E7E4E2]">
              <p className="text-xs uppercase tracking-wide text-[#8B8680] mb-2">Quests Completed</p>
              <p className="text-4xl font-semibold italic text-foreground" style={{ fontFamily: 'Funnel Sans, sans-serif' }}>
                {profile.totalQuestsCompleted || 0}
              </p>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
