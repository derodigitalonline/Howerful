import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shirt, Crown, Glasses, Wind, Sparkles, ArrowLeft } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import LayeredAvatar from '@/components/LayeredAvatar';
import {
  COSMETICS_LIBRARY,
  getCosmeticsByCategory,
  isCosmeticUnlocked
} from '@/constants/cosmetics';
import { CosmeticCategory } from '@shared/schema';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Customize() {
  const { profile, setProfile, trackCosmeticChange } = useProfile();
  const [selectedCategory, setSelectedCategory] = useState<CosmeticCategory>('hat');

  const equippedCosmetics = profile.equippedCosmetics || {};

  const handleEquipCosmetic = (cosmeticId: string, category: CosmeticCategory) => {
    const unlockedCosmetics = profile.unlockedCosmetics || [];

    // Check if already equipped
    const currentlyEquipped = equippedCosmetics[category];
    if (currentlyEquipped === cosmeticId) {
      // Unequip (set to "none")
      const noneId = `${category}-none`;
      setProfile({
        ...profile,
        equippedCosmetics: {
          ...equippedCosmetics,
          [category]: noneId,
        },
      });

      // Track cosmetic change for daily quests
      trackCosmeticChange();

      toast.success('Item unequipped');
    } else {
      // Check if unlocked
      if (!isCosmeticUnlocked(cosmeticId, profile.level, unlockedCosmetics)) {
        const cosmetic = COSMETICS_LIBRARY.find(c => c.id === cosmeticId);
        const lockReason = cosmetic?.unlockQuest
          ? 'Complete the required quest to unlock this item.'
          : 'Level up to unlock this cosmetic.';

        toast.error('This item is locked!', {
          description: lockReason,
        });
        return;
      }

      // Equip the new item
      setProfile({
        ...profile,
        equippedCosmetics: {
          ...equippedCosmetics,
          [category]: cosmeticId,
        },
      });

      // Track cosmetic change for daily quests
      trackCosmeticChange();

      const cosmetic = COSMETICS_LIBRARY.find(c => c.id === cosmeticId);
      toast.success(`Equipped: ${cosmetic?.name}`);
    }
  };

  const renderCosmeticGrid = (category: CosmeticCategory) => {
    const cosmetics = getCosmeticsByCategory(category);
    const currentlyEquipped = equippedCosmetics[category];
    const unlockedCosmetics = profile.unlockedCosmetics || [];

    return (
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
        {cosmetics.map((cosmetic) => {
          const isUnlocked = isCosmeticUnlocked(cosmetic.id, profile.level, unlockedCosmetics);
          const isEquipped = currentlyEquipped === cosmetic.id;
          const isNoneOption = cosmetic.id.endsWith('-none');

          return (
            <button
              key={cosmetic.id}
              onClick={() => handleEquipCosmetic(cosmetic.id, category)}
              disabled={!isUnlocked && !isNoneOption}
              className={`
                relative aspect-square rounded-lg border-2 transition-all
                flex flex-col items-center justify-center p-4 group
                ${isEquipped
                  ? 'border-primary bg-primary/10 shadow-lg'
                  : 'border-border bg-muted/30 hover:bg-muted/50 hover:border-primary/50'
                }
                ${!isUnlocked && !isNoneOption ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* Equipped Badge */}
              {isEquipped && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              )}

              {/* Lock Icon for Locked Items */}
              {!isUnlocked && !isNoneOption && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🔒</div>
                    <p className="text-xs font-semibold">
                      {cosmetic.unlockQuest ? 'Quest Reward' : `Level ${cosmetic.unlockLevel}`}
                    </p>
                  </div>
                </div>
              )}

              {/* Cosmetic Preview */}
              <div className="w-full h-full flex items-center justify-center mb-2">
                {cosmetic.imagePath ? (
                  <img
                    src={cosmetic.imagePath}
                    alt={cosmetic.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-4xl text-muted-foreground">∅</div>
                )}
              </div>

              {/* Cosmetic Name */}
              <div className="absolute bottom-2 left-2 right-2 text-center">
                <p className="text-xs font-semibold truncate">{cosmetic.name}</p>
                {cosmetic.rarity && (
                  <p className={`text-[10px] uppercase tracking-wide ${
                    cosmetic.rarity === 'legendary' ? 'text-yellow-500' :
                    cosmetic.rarity === 'epic' ? 'text-purple-500' :
                    cosmetic.rarity === 'rare' ? 'text-blue-500' :
                    'text-muted-foreground'
                  }`}>
                    {cosmetic.rarity}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="h-full p-6 md:p-8 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
            {/* Back Button */}
            <div className="mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/profile'}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Profile
              </Button>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Customize Your Howie</h1>
              <p className="text-muted-foreground">
                Mix and match cosmetics to create your unique look
              </p>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[500px_1fr] gap-6 mb-8">
              {/* Left: Live Preview */}
              <Card className="p-8 lg:sticky lg:top-6 h-fit">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                  Live Preview
                </h2>

                {/* Avatar Preview Container */}
                <div className="relative w-full aspect-square bg-gradient-to-br from-muted/50 to-muted/20 rounded-xl border-2 border-border overflow-hidden mb-4">
                  <div className="w-full h-full flex items-center justify-center p-8">
                    <LayeredAvatar
                      equippedCosmetics={equippedCosmetics}
                      size={168}
                      showPet={true}
                    />
                  </div>
                </div>

                {/* Level & Stats */}
                <div className="p-4 bg-accent/50 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Level</span>
                    <span className="text-sm font-bold text-primary">{profile.level}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Howie Name</span>
                    <span className="text-sm font-bold text-primary truncate">{profile.howieName || 'Howie'}</span>
                  </div>
                </div>
              </Card>

              {/* Right: Cosmetic Selector */}
              <Card className="p-6">
                <Tabs
                  defaultValue="hat"
                  className="w-full"
                  onValueChange={(value) => setSelectedCategory(value as CosmeticCategory)}
                >
                  <TabsList className="grid w-full grid-cols-6 mb-6">
                    <TabsTrigger value="hat" className="gap-2">
                      <Crown className="w-4 h-4" />
                      <span className="hidden sm:inline">Hats</span>
                    </TabsTrigger>
                    <TabsTrigger value="facewear" className="gap-2">
                      <Glasses className="w-4 h-4" />
                      <span className="hidden sm:inline">Facewear</span>
                    </TabsTrigger>
                    <TabsTrigger value="shirt" className="gap-2">
                      <Shirt className="w-4 h-4" />
                      <span className="hidden sm:inline">Shirts</span>
                    </TabsTrigger>
                    <TabsTrigger value="pants" className="gap-2">
                      <Glasses className="w-4 h-4" />
                      <span className="hidden sm:inline">Pants</span>
                    </TabsTrigger>
                    <TabsTrigger value="cape" className="gap-2">
                      <Wind className="w-4 h-4" />
                      <span className="hidden sm:inline">Capes</span>
                    </TabsTrigger>
                    <TabsTrigger value="pet" className="gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span className="hidden sm:inline">Pets</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="hat" className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Hats</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Top off your look with stylish headwear
                      </p>
                    </div>
                    {renderCosmeticGrid('hat')}
                  </TabsContent>

                  <TabsContent value="facewear" className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Facewear</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Stylish glasses, masks, and face accessories
                      </p>
                    </div>
                    {renderCosmeticGrid('facewear')}
                  </TabsContent>

                  <TabsContent value="shirt" className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Shirts</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Express yourself with different outfits
                      </p>
                    </div>
                    {renderCosmeticGrid('shirt')}
                  </TabsContent>

                  <TabsContent value="pants" className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Pants</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Complete your outfit from head to toe
                      </p>
                    </div>
                    {renderCosmeticGrid('pants')}
                  </TabsContent>

                  <TabsContent value="cape" className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Capes</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Add some flair with a flowing cape
                      </p>
                    </div>
                    {renderCosmeticGrid('cape')}
                  </TabsContent>

                  <TabsContent value="pet" className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Pets</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Choose a companion to accompany you
                      </p>
                    </div>
                    {renderCosmeticGrid('pet')}
                  </TabsContent>
                </Tabs>
              </Card>
            </div>
      </motion.div>
    </div>
  );
}
