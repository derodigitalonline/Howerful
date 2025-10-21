import { useState, useEffect } from 'react';
import NavigationDrawer from '@/components/NavigationDrawer';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';
import { Plus, X, Trophy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import FloatingXP from '@/components/FloatingXP';
import ParticleBurst from '@/components/ParticleBurst';

interface DailyRoutine {
  id: string;
  text: string;
  completed: boolean;
}

interface XPAnimation {
  id: string;
  x: number;
  y: number;
}

interface RoutineData {
  routines: DailyRoutine[];
  lastClaimedDate: string | null;
  lastResetDate: string | null;
  xpAwardedToday: string[]; // Array of routine IDs that have awarded XP today
}

const STORAGE_KEY = 'howerful-routines';
const MAX_ROUTINES = 20;
const BOUNTY_XP = 1000;
const ROUTINE_XP = 20;

export default function Routines() {
  const { profile, awardXP } = useProfile();
  const [isSetup, setIsSetup] = useState(false);
  const [setupRoutines, setSetupRoutines] = useState<string[]>(['']);
  const [data, setData] = useState<RoutineData>({
    routines: [],
    lastClaimedDate: null,
    lastResetDate: null,
    xpAwardedToday: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [xpAnimations, setXpAnimations] = useState<XPAnimation[]>([]);
  const [particleBursts, setParticleBursts] = useState<XPAnimation[]>([]);

  // Load routines from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: RoutineData = JSON.parse(stored);

        // Check if we need to reset for a new day
        const today = new Date().toDateString();
        if (parsed.lastResetDate !== today) {
          // Reset all completions for new day
          parsed.routines = parsed.routines.map(r => ({ ...r, completed: false }));
          parsed.lastResetDate = today;
          parsed.lastClaimedDate = null;
          parsed.xpAwardedToday = []; // Reset XP tracking
        }

        // Migrate old data that doesn't have xpAwardedToday
        if (!parsed.xpAwardedToday) {
          parsed.xpAwardedToday = [];
        }

        setData(parsed);
        setIsSetup(parsed.routines.length > 0);
      } catch (e) {
        console.error('Failed to parse routines', e);
      }
    }
  }, []);

  // Save routines to localStorage
  useEffect(() => {
    if (data.routines.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data]);

  // Populate edit mode with existing routines
  useEffect(() => {
    if (isEditing && data.routines.length > 0) {
      setSetupRoutines(data.routines.map(r => r.text));
    }
  }, [isEditing]);

  const handleAddRoutineField = () => {
    if (setupRoutines.length < MAX_ROUTINES) {
      setSetupRoutines([...setupRoutines, '']);
    }
  };

  const handleRemoveRoutineField = (index: number) => {
    setSetupRoutines(setupRoutines.filter((_, i) => i !== index));
  };

  const handleRoutineChange = (index: number, value: string) => {
    const updated = [...setupRoutines];
    updated[index] = value;
    setSetupRoutines(updated);
  };

  const handleSaveRoutines = () => {
    const filtered = setupRoutines.filter(r => r.trim().length > 0);

    if (filtered.length === 0) {
      toast.error('Add at least one routine!');
      return;
    }

    // Create a map of old routines by text for matching
    const oldRoutinesByText = new Map(
      data.routines.map(r => [r.text.toLowerCase(), r])
    );

    const newRoutines: DailyRoutine[] = filtered.map(text => {
      const trimmedText = text.trim();
      const oldRoutine = oldRoutinesByText.get(trimmedText.toLowerCase());

      // If this routine existed before with the same text, preserve its state
      if (oldRoutine) {
        return {
          id: oldRoutine.id, // Keep the same ID to preserve XP tracking
          text: trimmedText,
          completed: oldRoutine.completed, // Preserve completion state
        };
      }

      // New routine
      return {
        id: crypto.randomUUID(),
        text: trimmedText,
        completed: false,
      };
    });

    const today = new Date().toDateString();
    setData({
      routines: newRoutines,
      lastClaimedDate: data.lastClaimedDate, // Preserve bounty claim status
      lastResetDate: today,
      xpAwardedToday: data.xpAwardedToday, // Preserve XP tracking
    });

    setIsSetup(true);
    setIsEditing(false);
    toast.success(`${newRoutines.length} routines saved!`, {
      description: 'Complete them all to claim your daily bounty!',
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSetupRoutines(['']);
  };

  const handleToggleRoutine = (id: string, event: React.MouseEvent) => {
    const routine = data.routines.find(r => r.id === id);
    if (!routine) return;

    // If completing the routine (not uncompleting), award XP and trigger animation
    // But only if XP hasn't been awarded for this routine today
    if (!routine.completed && !data.xpAwardedToday.includes(id)) {
      awardXP('do-first'); // Awards 20 XP

      // Get click position for animation
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      // Add XP floating text animation
      const xpId = crypto.randomUUID();
      setXpAnimations(prev => [...prev, { id: xpId, x, y }]);
      setTimeout(() => {
        setXpAnimations(prev => prev.filter(anim => anim.id !== xpId));
      }, 1500);

      // Add particle burst animation
      const particleId = crypto.randomUUID();
      setParticleBursts(prev => [...prev, { id: particleId, x, y }]);
      setTimeout(() => {
        setParticleBursts(prev => prev.filter(burst => burst.id !== particleId));
      }, 1000);

      // Mark this routine as having awarded XP today
      setData(prev => ({
        ...prev,
        xpAwardedToday: [...prev.xpAwardedToday, id],
        routines: prev.routines.map(r =>
          r.id === id ? { ...r, completed: !r.completed } : r
        ),
      }));
    } else {
      // Just toggle completion without awarding XP
      setData(prev => ({
        ...prev,
        routines: prev.routines.map(r =>
          r.id === id ? { ...r, completed: !r.completed } : r
        ),
      }));
    }
  };

  const handleClaimBounty = () => {
    const today = new Date().toDateString();

    // Award XP multiple times to reach 1000 (50 chunks of 20 XP each)
    for (let i = 0; i < 50; i++) {
      awardXP('do-first');
    }

    setData(prev => ({
      ...prev,
      lastClaimedDate: today,
    }));

    // Confetti celebration!
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.4 },
      colors: ['#4ade80', '#22c55e', '#16a34a'],
    });

    toast.success(`🎉 +${BOUNTY_XP} XP Claimed!`, {
      description: 'Daily bounty complete! Come back tomorrow!',
      duration: 5000,
    });
  };

  const handleResetRoutines = () => {
    if (confirm('Are you sure you want to reset your routines? This will clear all your daily tasks.')) {
      setData({
        routines: [],
        lastClaimedDate: null,
        lastResetDate: null,
      });
      setIsSetup(false);
      setSetupRoutines(['']);
      localStorage.removeItem(STORAGE_KEY);
      toast.success('Routines reset!');
    }
  };

  const completedCount = data.routines.filter(r => r.completed).length;
  const totalCount = data.routines.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const allCompleted = totalCount > 0 && completedCount === totalCount;
  const canClaimBounty = allCompleted && data.lastClaimedDate !== new Date().toDateString();

  return (
    <div className="flex h-screen">
      <NavigationDrawer />

      <div className="flex-1 ml-64 flex flex-col">
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Daily Routines</h1>
              <p className="text-muted-foreground">
                Track your daily habits and earn bonus XP
              </p>
            </div>

            {!isSetup || isEditing ? (
              /* Setup/Edit Flow */
              <Card className="p-8">
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-2">
                    {isEditing ? 'Edit Your Daily Routines' : 'Create Your Daily Routines'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Add up to {MAX_ROUTINES} tasks you want to complete every day. These could be habits like
                    "Exercise for 30 minutes" or "Read for 20 minutes".
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  {setupRoutines.map((routine, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Routine ${index + 1}`}
                        value={routine}
                        onChange={(e) => handleRoutineChange(index, e.target.value)}
                        className="flex-1"
                        maxLength={100}
                      />
                      {setupRoutines.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveRoutineField(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleAddRoutineField}
                    disabled={setupRoutines.length >= MAX_ROUTINES}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Routine ({setupRoutines.length}/{MAX_ROUTINES})
                  </Button>
                  {isEditing && (
                    <Button
                      variant="outline"
                      onClick={handleCancelEdit}
                      className="gap-2"
                    >
                      Cancel
                    </Button>
                  )}
                  <Button onClick={handleSaveRoutines} className="gap-2">
                    <Sparkles className="w-4 h-4" />
                    Save Routines
                  </Button>
                </div>
              </Card>
            ) : (
              /* Daily Tracker */
              <div className="space-y-6">
                {/* Bounty Claim Button */}
                <AnimatePresence>
                  {canClaimBounty && (
                    <motion.div
                      initial={{ opacity: 0, y: -20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.9 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    >
                      <Button
                        onClick={handleClaimBounty}
                        className="w-full text-lg py-6 gap-3 bg-success hover:bg-success/90"
                        size="lg"
                      >
                        <Trophy className="w-6 h-6" />
                        Claim Daily Bounty (+{BOUNTY_XP} XP)
                        <Sparkles className="w-6 h-6" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Progress Card */}
                <Card className="p-6">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-semibold">Today's Progress</h2>
                      <span className="text-sm font-semibold text-muted-foreground">
                        {completedCount} of {totalCount}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-4 bg-muted rounded-full overflow-hidden relative">
                      <motion.div
                        className="h-full bg-gradient-to-r from-success to-emerald-500 relative"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      >
                        {/* Shine effect */}
                        {progressPercent > 0 && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                        )}
                      </motion.div>
                    </div>
                  </div>

                  {/* Routines List - Only show incomplete routines */}
                  {data.routines.filter(r => !r.completed).length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8 text-muted-foreground"
                    >
                      <p className="text-lg">All routines complete! 🎉</p>
                      <p className="text-sm mt-2">Check back tomorrow for a fresh start</p>
                    </motion.div>
                  ) : (
                    <div className="space-y-2">
                      <AnimatePresence mode="popLayout">
                        {data.routines.filter(r => !r.completed).map((routine, index) => (
                          <motion.div
                            key={routine.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center gap-3 p-4 rounded-lg border-2 bg-card border-border hover:border-primary/30 transition-all"
                          >
                            <Checkbox
                              checked={routine.completed}
                              onCheckedChange={(checked) => {}}
                              onClick={(e) => handleToggleRoutine(routine.id, e)}
                              className="w-6 h-6"
                            />
                            <span className="flex-1">
                              {routine.text}
                            </span>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </Card>

                {/* Edit and Reset Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="flex-1"
                  >
                    Edit Routines
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleResetRoutines}
                    className="flex-1"
                  >
                    Reset Routines
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* XP Animations */}
      {xpAnimations.map(anim => (
        <FloatingXP
          key={anim.id}
          x={anim.x}
          y={anim.y}
          amount={ROUTINE_XP}
        />
      ))}

      {/* Particle Bursts */}
      {particleBursts.map(burst => (
        <ParticleBurst
          key={burst.id}
          x={burst.x}
          y={burst.y}
          color="hsl(var(--success))"
          particleCount={8}
        />
      ))}
    </div>
  );
}
