import NavigationDrawer from '@/components/NavigationDrawer';
import Quest from '@/components/Quest';
import { motion } from 'framer-motion';
import { Glasses, Shirt, Crown } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

// Quest IDs
const QUEST_GET_UR_GLASSES = 'quest-get-ur-glasses';
const QUEST_TASK_MASTER = 'quest-task-master';
const QUEST_PERFORMATIVE_PRODUCTIVITY = 'quest-performative-productivity';

// Quest Rewards (mapping quest ID to cosmetic ID)
const QUEST_REWARDS: Record<string, string> = {
  [QUEST_GET_UR_GLASSES]: 'facewear-howerful-glasses',
  [QUEST_TASK_MASTER]: 'hat-baseball-cap',
  [QUEST_PERFORMATIVE_PRODUCTIVITY]: 'shirt-tuxedo',
};

export default function Quests() {
  const { profile, setProfile } = useProfile();
  const currentLevel = profile.level;
  const claimedQuests = profile.claimedQuests || [];
  const unlockedCosmetics = profile.unlockedCosmetics || [];

  const handleClaimQuest = (questId: string, questName: string) => {
    const rewardCosmeticId = QUEST_REWARDS[questId];

    if (!rewardCosmeticId) {
      toast.error('No reward found for this quest');
      return;
    }

    // Add the cosmetic to unlocked cosmetics
    const newUnlockedCosmetics = [...unlockedCosmetics, rewardCosmeticId];

    // Mark quest as claimed
    const newClaimedQuests = [...claimedQuests, questId];

    setProfile({
      ...profile,
      unlockedCosmetics: newUnlockedCosmetics,
      claimedQuests: newClaimedQuests,
    });

    // Celebration!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4ade80', '#22c55e', '#16a34a'],
    });

    toast.success(`Quest Complete: ${questName}!`, {
      description: 'Reward added to your inventory. Check the Customize page!',
      duration: 5000,
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
              <h1 className="text-3xl font-bold mb-2">Quests</h1>
              <p className="text-muted-foreground">
                Complete quests to unlock exclusive rewards and items
              </p>
            </div>

            {/* Quests List */}
            <div className="max-w-2xl space-y-4">
              {/* Get Ur Glasses Quest */}
              <Quest
                name="Get Ur Glasses"
                requirement="Reach Level 2"
                rewardName="Howerful Glasses"
                rewardIcon={Glasses}
                progress={Math.min(currentLevel, 2)}
                total={2}
                isNew={true}
                isCompleted={currentLevel >= 2}
                isClaimed={claimedQuests.includes(QUEST_GET_UR_GLASSES)}
                onClaim={() => handleClaimQuest(QUEST_GET_UR_GLASSES, 'Get Ur Glasses')}
              />

              {/* Task Master Quest */}
              <Quest
                name="Task Master"
                requirement="Complete 10 tasks"
                rewardName="Baseball Cap"
                rewardIcon={Crown}
                progress={Math.min(profile.tasksCompleted, 10)}
                total={10}
                isNew={false}
                isCompleted={profile.tasksCompleted >= 10}
                isClaimed={claimedQuests.includes(QUEST_TASK_MASTER)}
                onClaim={() => handleClaimQuest(QUEST_TASK_MASTER, 'Task Master')}
              />

              {/* Performative Productivity Quest */}
              <Quest
                name="Performative Productivity"
                requirement="Complete 5 'Do First' tasks"
                rewardName="Tuxedo"
                rewardIcon={Shirt}
                progress={Math.min(profile.doFirstTasksCompleted || 0, 5)}
                total={5}
                isNew={false}
                isCompleted={(profile.doFirstTasksCompleted || 0) >= 5}
                isClaimed={claimedQuests.includes(QUEST_PERFORMATIVE_PRODUCTIVITY)}
                onClaim={() => handleClaimQuest(QUEST_PERFORMATIVE_PRODUCTIVITY, 'Performative Productivity')}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
