import { useState, useEffect } from 'react';
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
import { useAuth } from '@/contexts/AuthContext';
import {
  useSupabaseRoutines,
  useSupabaseRoutineMetadata,
  useBulkUpsertRoutines,
  useUpdateRoutine,
  useUpsertRoutineMetadata,
  type DailyRoutine,
  type RoutineMetadata,
} from '@/hooks/useSupabaseFocus';
import { isSupabaseConfigured } from '@/lib/supabase';

interface XPAnimation {
  id: string;
  x: number;
  y: number;
}

const STORAGE_KEY = 'howerful-routines';
const MAX_ROUTINES = 20;
const BOUNTY_XP = 1000;
const ROUTINE_XP = 20;

export default function Routines() {
  const { isAuthenticated } = useAuth();
  const { data: supabaseRoutines, isLoading: routinesLoading } = useSupabaseRoutines();
  const { data: supabaseMetadata, isLoading: metadataLoading } = useSupabaseRoutineMetadata();
  const bulkUpsertRoutines = useBulkUpsertRoutines();
  const updateRoutine = useUpdateRoutine();
  const upsertMetadata = useUpsertRoutineMetadata();

  const { profile, trackRoutineCompletion } = useProfile();
  const [isSetup, setIsSetup] = useState(false);
  const [setupRoutines, setSetupRoutines] = useState<string[]>(['']);
  const [routines, setRoutines] = useState<DailyRoutine[]>([]);
  const [metadata, setMetadata] = useState<RoutineMetadata>({
    lastClaimedDate: null,
    lastResetDate: null,
    xpAwardedToday: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [xpAnimations, setXpAnimations] = useState<XPAnimation[]>([]);
  const [particleBursts, setParticleBursts] = useState<XPAnimation[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Load routines and metadata on mount: Supabase if logged in, otherwise localStorage
  useEffect(() => {
    if (isAuthenticated && (routinesLoading || metadataLoading)) {
      // Still loading from Supabase, wait
      return;
    }

    const today = new Date().toDateString();

    if (isAuthenticated && supabaseRoutines !== undefined) {
      // Logged in: Load from Supabase
      let loadedRoutines = supabaseRoutines || [];
      let loadedMetadata = supabaseMetadata || {
        lastClaimedDate: null,
        lastResetDate: null,
        xpAwardedToday: [],
      };

      // Check if we need to reset for a new day
      if (loadedMetadata.lastResetDate !== today) {
        // Reset all completions for new day
        loadedRoutines = loadedRoutines.map(r => ({ ...r, completed: false }));
        loadedMetadata = {
          ...loadedMetadata,
          lastResetDate: today,
          lastClaimedDate: null,
          xpAwardedToday: [],
        };

        // Sync the reset to Supabase
        if (loadedRoutines.length > 0 && isSupabaseConfigured()) {
          bulkUpsertRoutines.mutate(loadedRoutines);
          upsertMetadata.mutate(loadedMetadata);
        }
      }

      setRoutines(loadedRoutines);
      setMetadata(loadedMetadata);
      setIsSetup(loadedRoutines.length > 0);
      setDataLoaded(true);

      // Save to localStorage as cache
      if (loadedRoutines.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          routines: loadedRoutines,
          ...loadedMetadata,
        }));
      }
    } else if (!isAuthenticated) {
      // Not logged in: Load from localStorage only
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed: any = JSON.parse(stored);

          let loadedRoutines = parsed.routines || [];
          let loadedMetadata = {
            lastClaimedDate: parsed.lastClaimedDate || null,
            lastResetDate: parsed.lastResetDate || null,
            xpAwardedToday: parsed.xpAwardedToday || [],
          };

          // Check if we need to reset for a new day
          if (loadedMetadata.lastResetDate !== today) {
            // Reset all completions for new day
            loadedRoutines = loadedRoutines.map((r: DailyRoutine) => ({ ...r, completed: false }));
            loadedMetadata = {
              lastResetDate: today,
              lastClaimedDate: null,
              xpAwardedToday: [],
            };
          }

          setRoutines(loadedRoutines);
          setMetadata(loadedMetadata);
          setIsSetup(loadedRoutines.length > 0);
        } catch (e) {
          console.error('Failed to parse routines', e);
        }
      }
      setDataLoaded(true);
    }
  }, [isAuthenticated, supabaseRoutines, supabaseMetadata, routinesLoading, metadataLoading]);

  // Save routines to localStorage as cache
  useEffect(() => {
    if (dataLoaded && routines.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        routines,
        ...metadata,
      }));
    }
  }, [routines, metadata, dataLoaded]);

  // Populate edit mode with existing routines
  useEffect(() => {
    if (isEditing && routines.length > 0) {
      setSetupRoutines(routines.map(r => r.text));
    }
  }, [isEditing, routines]);

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
      routines.map(r => [r.text.toLowerCase(), r])
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
    const updatedMetadata: RoutineMetadata = {
      lastClaimedDate: metadata.lastClaimedDate, // Preserve bounty claim status
      lastResetDate: today,
      xpAwardedToday: metadata.xpAwardedToday, // Preserve XP tracking
    };

    // Update local state immediately
    setRoutines(newRoutines);
    setMetadata(updatedMetadata);
    setIsSetup(true);
    setIsEditing(false);

    // Sync to Supabase if logged in
    if (isAuthenticated && isSupabaseConfigured()) {
      bulkUpsertRoutines.mutate(newRoutines);
      upsertMetadata.mutate(updatedMetadata);
    }

    toast.success(`${newRoutines.length} routines saved!`, {
      description: 'Complete them all to claim your daily bounty!',
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSetupRoutines(['']);
  };

  const handleToggleRoutine = (id: string, event: React.MouseEvent) => {
    const routine = routines.find(r => r.id === id);
    if (!routine) return;

    const newCompleted = !routine.completed;

    // If completing the routine (not uncompleting), track for quests
    // But only if XP hasn't been awarded for this routine today
    if (newCompleted && !metadata.xpAwardedToday.includes(id)) {
      // Track routine completion for daily quests
      trackRoutineCompletion();

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

      // Update local state with new completion and XP tracking
      const updatedMetadata: RoutineMetadata = {
        ...metadata,
        xpAwardedToday: [...metadata.xpAwardedToday, id],
      };

      setRoutines(prev => prev.map(r =>
        r.id === id ? { ...r, completed: newCompleted } : r
      ));
      setMetadata(updatedMetadata);

      // Sync to Supabase if logged in
      if (isAuthenticated && isSupabaseConfigured()) {
        updateRoutine.mutate({ id, completed: newCompleted });
        upsertMetadata.mutate(updatedMetadata);
      }
    } else {
      // Just toggle completion without awarding XP
      setRoutines(prev => prev.map(r =>
        r.id === id ? { ...r, completed: newCompleted } : r
      ));

      // Sync to Supabase if logged in
      if (isAuthenticated && isSupabaseConfigured()) {
        updateRoutine.mutate({ id, completed: newCompleted });
      }
    }
  };

  const handleClaimBounty = () => {
    const today = new Date().toDateString();

    const updatedMetadata: RoutineMetadata = {
      ...metadata,
      lastClaimedDate: today,
    };

    // Update local state
    setMetadata(updatedMetadata);

    // Sync to Supabase if logged in
    if (isAuthenticated && isSupabaseConfigured()) {
      upsertMetadata.mutate(updatedMetadata);
    }

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
      // Update local state
      setRoutines([]);
      setMetadata({
        lastClaimedDate: null,
        lastResetDate: null,
        xpAwardedToday: [],
      });
      setIsSetup(false);
      setSetupRoutines(['']);

      // Clear localStorage
      localStorage.removeItem(STORAGE_KEY);

      // Sync to Supabase if logged in (delete all routines)
      if (isAuthenticated && isSupabaseConfigured()) {
        bulkUpsertRoutines.mutate([]);
        upsertMetadata.mutate({
          lastClaimedDate: null,
          lastResetDate: null,
          xpAwardedToday: [],
        });
      }

      toast.success('Routines reset!');
    }
  };

  const completedCount = routines.filter(r => r.completed).length;
  const totalCount = routines.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const allCompleted = totalCount > 0 && completedCount === totalCount;
  const canClaimBounty = allCompleted && metadata.lastClaimedDate !== new Date().toDateString();

  return (
    <div className="h-full p-6 md:p-8 overflow-y-auto">
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
                  {routines.filter(r => !r.completed).length === 0 ? (
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
                        {routines.filter(r => !r.completed).map((routine, index) => (
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
