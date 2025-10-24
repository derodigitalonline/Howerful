import CoinDisplay from '@/components/CoinDisplay';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ShoppingBag, Lock, Check } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { COSMETICS_LIBRARY } from '@/constants/cosmetics';
import { CosmeticCategory } from '@shared/schema';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export default function Bazaar() {
  const { profile, deductCoins, setProfile } = useProfile();
  const coins = profile.coins || 0;
  const unlockedCosmetics = profile.unlockedCosmetics || [];

  // Filter cosmetics that are available for purchase in the Bazaar
  // The Bazaar is shop-exclusive - only items with coinPrice and NO other unlock method
  // Three unlock systems (mutually exclusive):
  // 1. Quest Rewards (unlockQuest) - Not in shop
  // 2. Level Rewards (unlockLevel) - Not in shop
  // 3. Bazaar Shop (coinPrice only) - Shown here
  const shopCosmetics = COSMETICS_LIBRARY.filter(item =>
    item.coinPrice &&
    item.coinPrice > 0 &&
    !item.unlockLevel &&
    !item.unlockQuest &&
    item.imagePath !== '' // Exclude default "none" options
  );

  // Group cosmetics by category
  const categorizedCosmetics = shopCosmetics.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<CosmeticCategory, typeof shopCosmetics>);

  const handlePurchase = (cosmeticId: string, price: number, name: string) => {
    // Check if already owned
    if (unlockedCosmetics.includes(cosmeticId)) {
      toast.error('You already own this item!');
      return;
    }

    // Attempt to deduct coins
    const success = deductCoins(price);

    if (!success) {
      toast.error('Insufficient coins!', {
        description: `You need ${price} coins but only have ${coins}.`,
      });
      return;
    }

    // Add to unlocked cosmetics
    const newUnlockedCosmetics = [...unlockedCosmetics, cosmeticId];
    setProfile({
      ...profile,
      unlockedCosmetics: newUnlockedCosmetics,
    });

    // Celebration!
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#eab308', '#facc15'],
    });

    toast.success(`Purchased: ${name}!`, {
      description: 'Item added to your inventory. Check the Customize page!',
      duration: 4000,
    });
  };

  // Ownership check: Shop items are added to unlockedCosmetics when purchased
  // This is correct because shop items have NO other unlock method (no level/quest requirements)
  const isOwned = (cosmeticId: string) => unlockedCosmetics.includes(cosmeticId);
  const canAfford = (price: number) => coins >= price;

  return (
    <div className="h-full p-6 md:p-8 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-[1200px] mx-auto"
      >
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                    <ShoppingBag className="w-8 h-8" />
                    The Bazaar
                  </h1>
                  <p className="text-muted-foreground">
                    Purchase exclusive cosmetics with your Howie Coins
                  </p>
                </div>

                {/* Coin Balance */}
                <Card className="px-4 py-2 flex items-center">
                  <CoinDisplay coins={coins} size="md" showLabel />
                </Card>
              </div>
            </div>

            {/* Shop Tabs by Category */}
            <Tabs defaultValue="hat" className="w-full">
              <TabsList className="grid w-full grid-cols-6 mb-6">
                <TabsTrigger value="hat">Hats</TabsTrigger>
                <TabsTrigger value="facewear">Facewear</TabsTrigger>
                <TabsTrigger value="shirt">Shirts</TabsTrigger>
                <TabsTrigger value="pants">Pants</TabsTrigger>
                <TabsTrigger value="cape">Capes</TabsTrigger>
                <TabsTrigger value="pet">Pets</TabsTrigger>
              </TabsList>

              {Object.entries(categorizedCosmetics).map(([category, items]) => (
                <TabsContent key={category} value={category} className="mt-0">
                  {items.length === 0 ? (
                    <Card className="p-12 text-center">
                      <p className="text-muted-foreground">No items available in this category yet.</p>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {items.map((item) => {
                        const owned = isOwned(item.id);
                        const affordable = canAfford(item.coinPrice || 0);

                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Card className="p-4 h-full flex flex-col">
                              {/* Item Preview */}
                              <div className="relative w-full aspect-square bg-gradient-to-br from-muted/50 to-muted/20 rounded-lg mb-4 overflow-hidden flex items-center justify-center">
                                {item.imagePath ? (
                                  <img
                                    src={item.imagePath}
                                    alt={item.name}
                                    className="max-w-[80%] max-h-[80%] object-contain"
                                  />
                                ) : (
                                  <div className="text-muted-foreground text-sm">No Preview</div>
                                )}

                                {/* Owned Badge */}
                                {owned && (
                                  <div className="absolute top-2 right-2 bg-success text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    Owned
                                  </div>
                                )}
                              </div>

                              {/* Item Info */}
                              <div className="flex-1">
                                <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                                {item.description && (
                                  <p className="text-sm text-muted-foreground mb-3">
                                    {item.description}
                                  </p>
                                )}

                                {/* Rarity Badge */}
                                {item.rarity && (
                                  <div className={`inline-block px-2 py-1 rounded text-xs font-semibold mb-3 ${
                                    item.rarity === 'common' ? 'bg-slate-100 text-slate-700' :
                                    item.rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
                                    item.rarity === 'epic' ? 'bg-purple-100 text-purple-700' :
                                    'bg-amber-100 text-amber-700'
                                  }`}>
                                    {item.rarity.toUpperCase()}
                                  </div>
                                )}
                              </div>

                              {/* Purchase Button */}
                              <div className="pt-4 border-t">
                                {owned ? (
                                  <Button
                                    className="w-full"
                                    variant="outline"
                                    disabled
                                  >
                                    Already Owned
                                  </Button>
                                ) : (
                                  <Button
                                    className="w-full font-bold"
                                    onClick={() => handlePurchase(item.id, item.coinPrice || 0, item.name)}
                                    disabled={!affordable}
                                    variant={affordable ? 'default' : 'outline'}
                                  >
                                    {affordable ? (
                                      <div className="flex items-center gap-2">
                                        <img
                                          src="/assets/howie-coin.png"
                                          alt="Coin"
                                          width={20}
                                          height={20}
                                        />
                                        <span>{item.coinPrice}</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <Lock className="w-4 h-4" />
                                        <span>Need {item.coinPrice} coins</span>
                                      </div>
                                    )}
                                  </Button>
                                )}
                              </div>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
      </motion.div>
    </div>
  );
}
