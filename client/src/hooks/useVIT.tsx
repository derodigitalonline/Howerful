import { useBulletJournal } from './useBulletJournal';
import { useProfile } from './useProfile';
import type { BulletItem } from '@shared/schema';

/**
 * VIT (Very Important Task) State Management Hook
 *
 * Manages the lifecycle of VIT tasks:
 * - Finding the active VIT
 * - Marking tasks as VIT with bounty
 * - Cancelling VIT status
 * - Completing VIT with reward
 */
export function useVIT() {
  const { items, updateItem } = useBulletJournal();
  const { addCoins, trackBulletTaskCompletion } = useProfile();

  // Find current active VIT (not completed, not archived, not cancelled)
  const activeVIT = items.find(
    item => item.isVIT &&
            !item.completed &&
            !item.vitCompletedAt &&  // CRITICAL: Also check vitCompletedAt
            !item.archivedAt &&
            !item.vitCancelledAt
  );

  /**
   * Mark a task as VIT with a coin bounty
   * @param itemId - ID of the task to mark as VIT
   * @param bounty - Coin bounty (10-100)
   * @param onReplace - Callback if replacing existing VIT (for confirmation dialog)
   */
  const markAsVIT = (itemId: string, bounty: number, onReplace?: () => void) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    // If there's already an active VIT, handle replacement
    if (activeVIT && activeVIT.id !== itemId) {
      if (onReplace) {
        onReplace(); // Show confirmation dialog
        return;
      }
      // Clear previous VIT
      updateItem(activeVIT.id, {
        isVIT: false,
        vitBounty: undefined,
        vitMarkedAt: undefined,
        originalBucket: undefined,
      });
    }

    // Mark new VIT
    updateItem(itemId, {
      isVIT: true,
      vitBounty: bounty,
      vitMarkedAt: Date.now(),
      originalBucket: item.bucket,
    });
  };

  /**
   * Cancel VIT status (returns task to normal state)
   * @param itemId - ID of the VIT task to cancel
   */
  const cancelVIT = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item || !item.isVIT) return;

    updateItem(itemId, {
      isVIT: false,
      vitCancelledAt: Date.now(),
      // Keep vitBounty and vitMarkedAt for history tracking
    });
  };

  /**
   * Complete VIT and award bounty coins
   * Should be called BEFORE toggling completion in bullet journal
   * @param itemId - ID of the VIT task being completed
   */
  const completeVIT = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item || !item.isVIT || !item.vitBounty) return;

    // Prevent double-awarding: if already completed, don't award again
    if (item.vitCompletedAt || item.completed) return;

    // Award bounty coins (adds to standard 5 coin reward)
    addCoins(item.vitBounty);

    // Update VIT completion timestamp
    updateItem(itemId, {
      vitCompletedAt: Date.now(),
    });

    // Track for quests (counts as regular bullet task completion)
    trackBulletTaskCompletion();
  };

  return {
    activeVIT,
    markAsVIT,
    cancelVIT,
    completeVIT,
    hasActiveVIT: !!activeVIT,
  };
}
