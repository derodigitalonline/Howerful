import Quest from '@/components/Quest';
import DailyQuest from '@/components/DailyQuest';
import { motion } from 'framer-motion';
import { Glasses, Shirt, Crown, Calendar } from 'lucide-react';
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

// Quest Coin Rewards (bonus coins for completing quests)
const QUEST_COIN_REWARDS: Record<string, number> = {
  [QUEST_GET_UR_GLASSES]: 25,
  [QUEST_TASK_MASTER]: 50,
  [QUEST_PERFORMATIVE_PRODUCTIVITY]: 75,
};

export default function Quests() {
  const { profile, setProfile, addCoins, claimDailyQuest } = useProfile();
  const currentLevel = profile.level;
  const claimedQuests = profile.claimedQuests || [];
  const unlockedCosmetics = profile.unlockedCosmetics || [];
  const dailyQuests = profile.dailyQuests || [];

  const handleClaimQuest = (questId: string, questName: string) => {
    const rewardCosmeticId = QUEST_REWARDS[questId];
    const coinReward = QUEST_COIN_REWARDS[questId] || 0;

    if (!rewardCosmeticId) {
      toast.error('No reward found for this quest');
      return;
    }

    // Add the cosmetic to unlocked cosmetics
    const newUnlockedCosmetics = [...unlockedCosmetics, rewardCosmeticId];

    // Mark quest as claimed
    const newClaimedQuests = [...claimedQuests, questId];

    // Award coins
    if (coinReward > 0) {
      addCoins(coinReward);
    }

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
      description: `Reward added to your inventory! +${coinReward} coins earned.`,
      duration: 5000,
    });
  };

  const handleClaimDailyQuest = (questId: string, questName: string, coinReward: number, xpReward: number) => {
    const success = claimDailyQuest(questId);

    if (!success) {
      toast.error('Unable to claim quest');
      return;
    }

    // Celebration!
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#fbbf24', '#f59e0b', '#d97706'],
    });

    toast.success(`Daily Quest Complete: ${questName}!`, {
      description: `+${coinReward} coins and +${xpReward} XP earned!`,
      duration: 4000,
    });
  };

  return (
    <div className="h-full p-6 md:p-8 overflow-y-auto">
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

            {/* Daily Quests Section */}
            {dailyQuests.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h2 className="text-2xl font-bold">Daily Quests</h2>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-medium">
                    Resets Daily
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Complete these quests before they reset tomorrow for bonus rewards!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl">
                  {dailyQuests.map((quest) => (
                    <DailyQuest
                      key={quest.id}
                      name={quest.name}
                      description={quest.description}
                      progress={quest.progress}
                      requirement={quest.requirement}
                      coinReward={quest.coinReward}
                      xpReward={quest.xpReward}
                      completed={quest.completed}
                      claimed={quest.claimed}
                      onClaim={() => handleClaimDailyQuest(quest.id, quest.name, quest.coinReward, quest.xpReward)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Permanent Quests Section */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">Story Quests</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Complete these milestone quests to unlock exclusive cosmetics
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
  );
}
