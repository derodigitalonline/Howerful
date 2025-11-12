import { CosmeticItem, CosmeticCategory } from '@shared/schema';

/**
 * COSMETICS_LIBRARY
 *
 * This is the single source of truth for all cosmetic items in the game.
 *
 * Why a static array?
 * - Performance: Loaded once at app startup, no database queries
 * - Simplicity: Easy to add new items - just add to this array
 * - Type Safety: TypeScript validates every item at compile time
 * - Version Control: All cosmetics tracked in git
 *
 * When you want to add a new cosmetic:
 * 1. Add the PNG file to /client/src/assets/cosmetics/{category}/{name}.png
 * 2. Add an entry to this array
 * 3. TypeScript will ensure you filled in all required fields!
 */
export const COSMETICS_LIBRARY: CosmeticItem[] = [
  // ======================
  // HATS
  // ======================
  {
    id: 'hat-none',
    name: 'No Hat',
    category: 'hat',
    imagePath: '', // Empty path = nothing to render
    description: 'Go bareheaded',
    rarity: 'common',
  },
  {
    id: 'hat-baseball-cap',
    name: 'Baseball Cap',
    category: 'hat',
    imagePath: '/assets/cosmetics/hats/baseball_cap.png',
    description: 'A classic sporty look',
    unlockQuest: 'quest-task-master',
    rarity: 'common',
  },
  {
    id: 'hat-wizard',
    name: 'Wizard Hat',
    category: 'hat',
    imagePath: '/assets/cosmetics/hats/wizard-hat.png',
    description: 'Channel your inner magic',
    rarity: 'rare',
    coinPrice: 150,
  },
  {
    id: 'hat-crown',
    name: 'Golden Crown',
    category: 'hat',
    imagePath: '/assets/cosmetics/hats/golden_crown.png',
    description: 'For productivity royalty',
    unlockLevel: 25,
    rarity: 'legendary',
  },

  // ======================
  // SHIRTS
  // ======================
  {
    id: 'shirt-none',
    name: 'Default Shirt',
    category: 'shirt',
    imagePath: '', // No overlay = default sprite appearance
    description: 'Your trusty default shirt',
    rarity: 'common',
  },
  {
    id: 'shirt-tuxedo',
    name: 'Tuxedo',
    category: 'shirt',
    imagePath: '/assets/cosmetics/shirts/top-tuxedo.png',
    description: 'Dress for success with performative productivity',
    unlockQuest: 'quest-performative-productivity',
    rarity: 'epic',
  },
  {
    id: 'shirt-hoodie',
    name: 'Cozy Hoodie',
    category: 'shirt',
    imagePath: '/assets/cosmetics/shirts/shirt-hoodie.png',
    description: 'Comfort and productivity',
    rarity: 'common',
    coinPrice: 75,
  },

  // ======================
  // PANTS
  // ======================
  {
    id: 'pants-none',
    name: 'Default Pants',
    category: 'pants',
    imagePath: '',
    description: 'Classic look',
    rarity: 'common',
  },
  {
    id: 'pants-jeans',
    name: 'Blue Jeans',
    category: 'pants',
    imagePath: '/assets/cosmetics/pants/jeans.png',
    description: 'Casual and comfortable',
    rarity: 'common',
    coinPrice: 30,
  },

  // ======================
  // CAPES
  // ======================
  {
    id: 'cape-none',
    name: 'No Cape',
    category: 'cape',
    imagePath: '',
    description: 'Travel light',
    rarity: 'common',
  },
  {
    id: 'cape-red',
    name: 'Red Cape',
    category: 'cape',
    imagePath: '/assets/cosmetics/capes/red-cape.png',
    description: 'For the heroes among us',
    unlockLevel: 20,
    rarity: 'legendary',
  },
  {
    id: 'cape-blue',
    name: 'Blue Cape',
    category: 'cape',
    imagePath: '/assets/cosmetics/capes/blue.png',
    description: 'Mysterious and powerful',
    unlockLevel: 15,
    rarity: 'epic',
  },

  // ======================
  // PETS (Companions)
  // ======================
  {
    id: 'pet-none',
    name: 'No Pet',
    category: 'pet',
    imagePath: '',
    description: 'Solo adventurer',
    rarity: 'common',
  },
  {
    id: 'pet-cat',
    name: 'Tabby Cat',
    category: 'pet',
    imagePath: '/assets/cosmetics/pets/cat.png',
    description: 'A loyal feline companion',
    unlockLevel: 8,
    rarity: 'rare',
  },
  {
    id: 'pet-dog',
    name: 'Golden Retriever',
    category: 'pet',
    imagePath: '/assets/cosmetics/pets/dog.png',
    description: "Your best friend and productivity buddy",
    rarity: 'epic',
    coinPrice: 300,
  },

  // ======================
  // FACEWEAR (Glasses, Masks, etc.)
  // ======================
  {
    id: 'facewear-none',
    name: 'No Facewear',
    category: 'facewear',
    imagePath: '',
    description: 'Show off your natural look',
    rarity: 'common',
  },
  {
    id: 'facewear-howerful-glasses',
    name: 'Howerful Glasses',
    category: 'facewear',
    imagePath: '/assets/cosmetics/facewear/howerful_glasses.png',
    description: 'Stylish glasses for the productive Howie',
    unlockQuest: 'quest-get-ur-glasses',
    rarity: 'rare',
  },
];

// ======================
// HELPER FUNCTIONS
// ======================

/**
 * Get a specific cosmetic by its ID
 * Returns undefined if not found (user equipped something that no longer exists)
 */
export function getCosmeticById(id: string): CosmeticItem | undefined {
  return COSMETICS_LIBRARY.find(item => item.id === id);
}

/**
 * Get all cosmetics in a specific category
 * Useful for rendering category-specific grids in the UI
 *
 * Example: getCosmeticsByCategory('hat') returns all hats
 */
export function getCosmeticsByCategory(category: CosmeticCategory): CosmeticItem[] {
  return COSMETICS_LIBRARY.filter(item => item.category === category);
}

/**
 * Get all cosmetics the user can currently use based on their level
 *
 * @param level - The user's current level
 * @returns Array of cosmetics that are either:
 *   - Have no level requirement (unlockLevel is undefined)
 *   - Have a level requirement <= user's level
 */
export function getUnlockedCosmetics(level: number): CosmeticItem[] {
  return COSMETICS_LIBRARY.filter(
    item => !item.unlockLevel || item.unlockLevel <= level
  );
}

/**
 * Get unlocked cosmetics for a specific category
 * Combines the filtering of both functions above
 */
export function getUnlockedCosmeticsByCategory(
  level: number,
  category: CosmeticCategory
): CosmeticItem[] {
  return COSMETICS_LIBRARY.filter(
    item =>
      item.category === category &&
      (!item.unlockLevel || item.unlockLevel <= level)
  );
}

/**
 * Check if a specific cosmetic is unlocked for the user
 *
 * Three unlock systems (mutually exclusive):
 * 1. Quest Rewards - Must be in unlockedCosmetics array (earned via quest completion)
 * 2. Shop Items - Must be in unlockedCosmetics array (purchased with coins)
 * 3. Level Rewards - Unlocked when user reaches required level
 * 4. Default Items - Always available (no requirements)
 *
 * @param cosmeticId - The ID of the cosmetic to check
 * @param level - The user's current level
 * @param unlockedCosmetics - Array of cosmetic IDs unlocked via quests or shop purchases
 * @returns true if unlocked, false if locked
 */
export function isCosmeticUnlocked(
  cosmeticId: string,
  level: number,
  unlockedCosmetics: string[] = []
): boolean {
  const cosmetic = getCosmeticById(cosmeticId);
  if (!cosmetic) return false;

  // If in unlocked array, it's available (quest rewards or shop purchases)
  if (unlockedCosmetics.includes(cosmeticId)) {
    return true;
  }

  // If requires a quest but not in unlocked list, it's locked
  if (cosmetic.unlockQuest) {
    return false;
  }

  // If it's a shop item but not in unlocked list, it's locked (must purchase)
  if (cosmetic.coinPrice && cosmetic.coinPrice > 0) {
    return false;
  }

  // If it has a level requirement, check if user meets it
  if (cosmetic.unlockLevel) {
    return cosmetic.unlockLevel <= level;
  }

  // Default items (no requirements) are always available
  return true;
}

/**
 * Get the "default" cosmetic for each category (the "none" option)
 * These have empty imagePath strings
 */
export function getDefaultCosmetics(): Record<CosmeticCategory, CosmeticItem> {
  return {
    hat: getCosmeticById('hat-none')!,
    shirt: getCosmeticById('shirt-none')!,
    pants: getCosmeticById('pants-none')!,
    cape: getCosmeticById('cape-none')!,
    pet: getCosmeticById('pet-none')!,
    facewear: getCosmeticById('facewear-none')!,
  };
}
