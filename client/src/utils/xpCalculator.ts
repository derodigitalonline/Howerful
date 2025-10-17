/**
 * XP and leveling utilities inspired by Runescape's exponential progression
 */

// Maximum level cap
export const MAX_LEVEL = 50;

/**
 * Calculate total XP required to reach a specific level
 * Uses exponential formula similar to Runescape
 */
export function getXPForLevel(level: number): number {
  if (level <= 1) return 0;

  let total = 0;
  for (let i = 1; i < level; i++) {
    total += Math.floor(i + 300 * Math.pow(2, i / 7));
  }
  return Math.floor(total / 4);
}

/**
 * Calculate XP needed to reach next level from current level
 */
export function getXPForNextLevel(currentLevel: number): number {
  if (currentLevel >= MAX_LEVEL) return 0;
  return getXPForLevel(currentLevel + 1) - getXPForLevel(currentLevel);
}

/**
 * Get current level based on total XP
 */
export function getLevelFromXP(totalXP: number): number {
  for (let level = MAX_LEVEL; level >= 1; level--) {
    if (totalXP >= getXPForLevel(level)) {
      return level;
    }
  }
  return 1;
}

/**
 * Get progress percentage to next level
 */
export function getProgressToNextLevel(totalXP: number): number {
  const currentLevel = getLevelFromXP(totalXP);
  if (currentLevel >= MAX_LEVEL) return 100;

  const currentLevelXP = getXPForLevel(currentLevel);
  const nextLevelXP = getXPForLevel(currentLevel + 1);
  const xpIntoLevel = totalXP - currentLevelXP;
  const xpNeededForLevel = nextLevelXP - currentLevelXP;

  return Math.floor((xpIntoLevel / xpNeededForLevel) * 100);
}

/**
 * Check if gaining XP would result in a level up
 */
export function willLevelUp(currentXP: number, xpGain: number): boolean {
  const currentLevel = getLevelFromXP(currentXP);
  const newLevel = getLevelFromXP(currentXP + xpGain);
  return newLevel > currentLevel;
}

/**
 * Get XP table for reference (useful for debugging or stats display)
 */
export function getXPTable(): Array<{ level: number; totalXP: number; xpNeeded: number }> {
  const table = [];
  for (let level = 1; level <= MAX_LEVEL; level++) {
    table.push({
      level,
      totalXP: getXPForLevel(level),
      xpNeeded: getXPForNextLevel(level - 1),
    });
  }
  return table;
}
