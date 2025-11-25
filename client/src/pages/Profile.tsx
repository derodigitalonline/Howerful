import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Code2, RotateCcw, CheckCircle2, Zap, TrendingUp, Sparkles } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useTasks } from '@/hooks/useTasks';
import { toast } from 'sonner';
import LayeredAvatar from '@/components/LayeredAvatar';
import XPBar from '@/components/XPBar';
import CoinDisplay from '@/components/CoinDisplay';
import { getXPForLevel } from '@/utils/xpCalculator';
import { MigrateProfile } from '@/components/MigrateProfile';

export default function Profile() {
  const { profile, resetProfile, awardXP, addXP } = useProfile();
  const { addTask } = useTasks();

  // Avatar customization - use equipped cosmetics from profile
  const hasSprite = Boolean(profile.selectedSprite);

  const handleResetProgress = () => {
    if (confirm('⚠️ Are you sure? This will reset ALL progress (XP, level, tasks completed, and quest progress). This cannot be undone!')) {
      resetProfile();
      toast.success('Progress reset!', {
        description: 'All XP, level, and quest progress has been cleared.',
      });
    }
  };

  const handleComplete5Tasks = () => {
    const quadrants = ['do-first', 'schedule', 'delegate', 'eliminate'] as const;
    for (let i = 0; i < 5; i++) {
      const quadrant = quadrants[i % quadrants.length];
      awardXP(quadrant);
      addTask(`Test task ${i + 1}`, quadrant);
    }
    toast.success('+5 tasks completed!', {
      description: 'XP has been awarded for 5 completed tasks.',
    });
  };

  const handleComplete10Tasks = () => {
    const quadrants = ['do-first', 'schedule', 'delegate', 'eliminate'] as const;
    for (let i = 0; i < 10; i++) {
      const quadrant = quadrants[i % quadrants.length];
      awardXP(quadrant);
      addTask(`Test task ${i + 1}`, quadrant);
    }
    toast.success('+10 tasks completed!', {
      description: 'XP has been awarded for 10 completed tasks.',
    });
  };

  const handleAddXP = (amount: number) => {
    // Use the addXP function which directly adds XP without incrementing tasks
    addXP(amount);
    toast.success(`+${amount} XP awarded!`, {
      description: `Your new level: ${profile.level}`,
    });
  };

  const handleSetLevel = (targetLevel: number) => {
    // Calculate XP needed for target level using the real XP formula
    const targetXP = getXPForLevel(targetLevel);
    const xpDifference = targetXP - profile.totalXP;

    if (xpDifference !== 0) {
      addXP(xpDifference);
    }

    toast.success(`Level set to ${targetLevel}!`, {
      description: `XP set to ${targetXP.toLocaleString()}`,
    });
  };

  return (
    <div className="h-full p-6 md:p-8 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-[1150px] mx-auto"
      >
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
              <p className="text-muted-foreground">
                Customize your avatar and personal space
              </p>
            </div>

            {/* Migration Tool */}
            <MigrateProfile />

            {/* Avatar & Customization Section */}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(400px,512px)_1fr] gap-6 mb-8 max-w-full">
              {/* Left: Avatar Display */}
              <Card className="p-8">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                  {profile.nickname || "Your Howie"}
                </h2>

                {/* 512x512 Container */}
                <div className="relative w-full aspect-square bg-gradient-to-br from-muted/50 to-muted/20 rounded-xl border-2 border-border overflow-hidden">
                  {hasSprite ? (
                    <div className="w-full h-full flex items-center justify-center p-8">
                      {/* LayeredAvatar Component - renders base sprite + equipped cosmetics */}
                      <LayeredAvatar
                        equippedCosmetics={profile.equippedCosmetics || {}}
                        size={168}
                        showPet={true}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <User className="w-12 h-12 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">
                          No Howie Selected
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          512 × 512 pixels
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Customize Button */}
                <div className="mt-6">
                  <Button
                    size="lg"
                    className="w-full text-base font-bold gap-2"
                    onClick={() => window.location.href = '/customize'}
                  >
                    <Sparkles className="w-5 h-5" />
                    Customize My Howie
                  </Button>
                </div>
              </Card>

              {/* Right: Stats & Customization Button */}
              <Card className="p-8 flex flex-col">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-6">
                  Your Stats
                </h2>

                {/* XP Progress Bar */}
                <div className="mb-6">
                  <XPBar profile={profile} />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-accent/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Level</p>
                    <p className="text-3xl font-bold text-primary">{profile.level}</p>
                  </div>
                  <div className="p-4 bg-accent/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Total XP</p>
                    <p className="text-3xl font-bold text-primary">{profile.totalXP.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-accent/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Tasks Completed</p>
                    <p className="text-3xl font-bold text-primary">{profile.tasksCompleted}</p>
                  </div>
                  <div className="p-4 bg-accent/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Howie Coins</p>
                    <div className="mt-1">
                      <CoinDisplay coins={profile.coins || 0} size="sm" />
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Developer Tools */}
            <Card className="p-6 max-w-2xl border-2 border-primary/20 bg-primary/5">
              <div className="flex items-center gap-2 mb-4">
                <Code2 className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold">Developer Tools</h2>
              </div>

              <p className="text-sm text-muted-foreground mb-6">
                Test XP systems, quests, and other features. Use these tools to stress test the gamification system.
              </p>

              {/* Current Stats Display */}
              <div className="grid grid-cols-4 gap-3 mb-6 p-4 bg-background/50 rounded-lg">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Level</p>
                  <p className="text-2xl font-bold text-primary">{profile.level}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Total XP</p>
                  <p className="text-2xl font-bold text-primary">{profile.totalXP.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Tasks Done</p>
                  <p className="text-2xl font-bold text-primary">{profile.tasksCompleted}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Nickname</p>
                  <p className="text-xs font-bold text-primary truncate">{profile.nickname || 'Howie'}</p>
                </div>
              </div>

              {/* Tool Buttons */}
              <div className="space-y-3">
                {/* Progress Controls */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Progress Controls</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleResetProgress}
                      className="gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset All Progress
                    </Button>
                  </div>
                </div>

                {/* Task Generation */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Task Generation</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleComplete5Tasks}
                      className="gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Complete 5 Tasks
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleComplete10Tasks}
                      className="gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Complete 10 Tasks
                    </Button>
                  </div>
                </div>

                {/* XP Manipulation */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">XP Manipulation</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddXP(100)}
                      className="gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      +100 XP
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddXP(500)}
                      className="gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      +500 XP
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddXP(1000)}
                      className="gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      +1000 XP
                    </Button>
                  </div>
                </div>

                {/* Level Jumps */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Quick Level Jumps</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetLevel(5)}
                      className="gap-2"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Jump to Level 5
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetLevel(10)}
                      className="gap-2"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Jump to Level 10
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetLevel(25)}
                      className="gap-2"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Jump to Level 25
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetLevel(50)}
                      className="gap-2"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Jump to Level 50 (MAX)
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
      </motion.div>
    </div>
  );
}
