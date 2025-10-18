import NavigationDrawer from '@/components/NavigationDrawer';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Code2, RotateCcw, CheckCircle2, Zap, TrendingUp } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useTasks } from '@/hooks/useTasks';
import { toast } from 'sonner';
import DefaultSprite from '@/assets/DefaultSprite.png';
import DefaultSpriteB from '@/assets/DefaultSprite-B.png';

export default function Profile() {
  const { profile, resetProfile, awardXP } = useProfile();
  const { addTask } = useTasks();

  // Get the correct sprite image based on selection
  const getSpriteImage = () => {
    if (!profile.selectedSprite) return null;
    if (profile.selectedSprite === 'default-b') return DefaultSpriteB;
    return DefaultSprite;
  };

  const spriteImage = getSpriteImage();

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
    // Award XP in chunks using do-first (20 XP per chunk)
    const chunks = Math.ceil(amount / 20);
    for (let i = 0; i < chunks; i++) {
      awardXP('do-first');
    }
    toast.success(`+${amount} XP awarded!`, {
      description: `Your new level: ${profile.level}`,
    });
  };

  const handleSetLevel = (level: number) => {
    resetProfile();
    // Award enough XP to reach the target level
    // This is a simplified approach - adjust XP to match level
    const targetXP = Math.pow(level, 3) * 100; // Simplified XP formula
    for (let i = 0; i < Math.ceil(targetXP / 20); i++) {
      awardXP('do-first');
    }
    toast.success(`Level set to ${level}!`, {
      description: 'Progress adjusted to target level.',
    });
  };

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
              <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
              <p className="text-muted-foreground">
                Customize your avatar and personal space
              </p>
            </div>

            {/* Avatar & Crib Container - 512x512 */}
            <Card className="p-8 mb-6 max-w-2xl">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                Avatar & Crib
              </h2>

              {/* 512x512 Container */}
              <div className="relative w-full max-w-[512px] aspect-square bg-gradient-to-br from-muted/50 to-muted/20 rounded-xl border-2 border-border overflow-hidden mx-auto">
                {spriteImage ? (
                  <div className="w-full h-full flex items-center justify-center p-8">
                    <img
                      src={spriteImage}
                      alt="Your Howie"
                      className="w-[168px] h-[168px] object-contain"
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

              <div className="mt-6 p-4 bg-accent/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Coming Soon:</span> Customize your avatar and design your personal room. Unlock new items and decorations by earning XP!
                </p>
              </div>
            </Card>

            {/* Placeholder for future features */}
            <div className="grid gap-4 md:grid-cols-2 max-w-2xl mb-8">
              <Card className="p-6">
                <h3 className="font-semibold mb-2">Wardrobe</h3>
                <p className="text-sm text-muted-foreground">
                  Unlock avatar clothing and accessories
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-2">Room Items</h3>
                <p className="text-sm text-muted-foreground">
                  Decorate your personal space
                </p>
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
                  <p className="text-xs text-muted-foreground mb-1">Sprite</p>
                  <p className="text-xs font-bold text-primary truncate">{profile.selectedSprite || 'none'}</p>
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
      </div>
    </div>
  );
}
