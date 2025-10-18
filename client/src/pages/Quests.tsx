import NavigationDrawer from '@/components/NavigationDrawer';
import Quest from '@/components/Quest';
import { motion } from 'framer-motion';
import { Glasses, Trophy, Target } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';

export default function Quests() {
  const { profile } = useProfile();
  const currentLevel = profile.level;

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
              />

              {/* Future quests - placeholder examples */}
              <Quest
                name="Task Master"
                requirement="Complete 10 tasks"
                rewardName="Golden Trophy"
                rewardIcon={Trophy}
                progress={0}
                total={10}
                isNew={false}
                isCompleted={false}
              />

              <Quest
                name="Productivity Pro"
                requirement="Complete 5 'Do First' tasks"
                rewardName="Focus Badge"
                rewardIcon={Target}
                progress={0}
                total={5}
                isNew={false}
                isCompleted={false}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
