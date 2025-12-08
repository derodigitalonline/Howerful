import BucketTabs from '@/components/BucketTabs';
import MasonryBucketView from '@/components/MasonryBucketView';
import FocusDropZone from '@/components/FocusDropZone';
import FocusedItemBanner from '@/components/FocusedItemBanner';
import SwitchFocusDialog from '@/components/SwitchFocusDialog';
import FloatingTaskInput from '@/components/FloatingTaskInput';
import VITBanner from '@/components/VITBanner';
import VITDialog from '@/components/VITDialog';
import { SlashInputRef } from '@/components/SlashInput';
import { useBulletJournal } from '@/hooks/useBulletJournal';
import { useFocus } from '@/hooks/useFocus';
import { useProfile } from '@/hooks/useProfile';
import { useVIT } from '@/hooks/useVIT';
import { useMemo, useState, useRef, useEffect } from 'react';
import { Bucket, BULLET_TASK_XP_REWARD, BULLET_TASK_COIN_REWARD } from '@shared/schema';
import { toast } from 'sonner';
import { useLocation } from 'wouter';
import { AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
} from '@dnd-kit/core';

export default function Dojo() {
  const { getItemsByBucket, addItem, deleteItem, updateItem, toggleItemCompletion, reorderItems, moveItemToBucket, archiveItem, items: allItems } = useBulletJournal();
  const { startTimer, activeItemId, activeItemText } = useFocus();
  const { trackBulletTaskCompletion, addCoins } = useProfile();
  const { activeVIT, markAsVIT, cancelVIT, completeVIT } = useVIT();
  const [, navigate] = useLocation();

  const [activeBucket, setActiveBucket] = useState<Bucket>('today');
  const inputRef = useRef<SlashInputRef>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  // Switch focus dialog state
  const [showSwitchDialog, setShowSwitchDialog] = useState(false);
  const [pendingFocus, setPendingFocus] = useState<{ itemId?: string; itemText?: string; duration?: number } | null>(null);

  // VIT dialog state
  const [showVITDialog, setShowVITDialog] = useState(false);
  const [vitDialogItemId, setVitDialogItemId] = useState<string | null>(null);

  // Handle bullet item completion with quest tracking
  const handleToggleItemCompletion = (id: string) => {
    toggleItemCompletion(
      id,
      () => {
        // Track completion for quests
        trackBulletTaskCompletion();
        toast.success('Task completed!', {
          duration: 2000,
        });
      },
      () => {
        // No deduction needed - quests track total completions
        toast.info('Task uncompleted', {
          duration: 2000,
        });
      }
    );
  };

  // Get items for current bucket
  const items = getItemsByBucket(activeBucket);

  // Calculate bucket counts for tab badges (only uncompleted tasks)
  const bucketCounts = useMemo(() => ({
    today: getItemsByBucket('today').filter(item => !item.completed).length,
    tomorrow: getItemsByBucket('tomorrow').filter(item => !item.completed).length,
    someday: getItemsByBucket('someday').filter(item => !item.completed).length,
    'future-log': getItemsByBucket('future-log').filter(item => !item.completed).length,
  }), [getItemsByBucket]);

  // Global keyboard shortcut: Press "/" to focus input from anywhere
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Focus input when "/" is pressed (and not already in an input/textarea)
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleAddItem = (text: string, time?: string) => {
    // Add the item to the currently active bucket (always as a task)
    addItem(text, activeBucket, time);
  };

  const handleCardClick = (id: string) => {
    // TODO: Phase 3 - Open edit modal
    console.log('Card clicked:', id);
  };

  const formatTodayDate = () => {
    const date = new Date();
    return `Today, ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
  };

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // Handle starting focus - navigate to start page
  const handleStartFocus = (itemId?: string, itemText?: string, duration?: number) => {
    // Navigate to focus start page with query params
    const params = new URLSearchParams();
    if (itemId) params.set('itemId', itemId);
    if (itemText) params.set('itemText', itemText);
    navigate(`/focus/start?${params.toString()}`);
  };

  const handleConfirmSwitch = () => {
    if (pendingFocus) {
      startTimer(pendingFocus.itemId, pendingFocus.itemText, pendingFocus.duration);
    }
    setShowSwitchDialog(false);
    setPendingFocus(null);
  };

  const handleCancelSwitch = () => {
    setShowSwitchDialog(false);
    setPendingFocus(null);
  };

  // VIT handlers
  const handleMarkAsVIT = (itemId: string) => {
    setVitDialogItemId(itemId);
    setShowVITDialog(true);
  };

  const handleConfirmVIT = (bounty: number) => {
    if (!vitDialogItemId) return;

    markAsVIT(vitDialogItemId, bounty, () => {
      // If replacing existing VIT, dialog is already showing with existingVIT prop
      // Dialog will show warning, user confirms by clicking again
    });

    toast.success('VIT marked! Get it done! 💪', {
      duration: 3000,
    });
  };

  const handleCancelVIT = () => {
    if (!activeVIT) return;

    cancelVIT(activeVIT.id);
    toast.info('VIT status removed. Task returned to regular list.', {
      duration: 3000,
    });
  };

  const handleToggleVITCompletion = (id: string) => {
    const item = allItems.find(i => i.id === id);
    if (!item || !item.isVIT || !item.vitBounty) return;

    // Prevent multiple clicks
    if (item.vitCompletedAt || item.completed) return;

    // Award ALL coins (bounty + standard reward)
    const totalCoins = item.vitBounty + BULLET_TASK_COIN_REWARD;
    addCoins(totalCoins);

    // Track quest completion
    trackBulletTaskCompletion();

    // SINGLE atomic update - sets both fields together to prevent race condition
    updateItem(id, {
      completed: true,
      vitCompletedAt: Date.now(),
    });

    // Show celebration
    toast.success(`VIT completed! +${totalCoins} coins earned! 🎉`, {
      duration: 4000,
    });
  };

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over?.id as string | null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over?.id === 'focus-zone') {
      // Item dropped in focus zone - check for switch dialog
      const item = allItems.find(i => i.id === active.id);
      if (item) {
        handleStartFocus(item.id, item.text);
      }
    } else if (over && active.id !== over.id) {
      // Regular reordering within bucket
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      reorderItems(activeBucket, oldIndex, newIndex);
    }

    // Reset drag state
    setActiveId(null);
    setOverId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full flex flex-col overflow-hidden">
        {/* Fixed Top Section */}
        <div className="flex-shrink-0 px-6 md:px-8 pt-6 md:pt-8 bg-background">
          {/* Bucket Tabs */}
          <div>
            <BucketTabs
              activeBucket={activeBucket}
              onBucketChange={setActiveBucket}
              counts={bucketCounts}
            />
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-6 md:px-8 pt-6 pb-32">
          {/* VIT Banner - Shows active VIT regardless of bucket */}
          <AnimatePresence>
            {activeVIT && (
              <VITBanner
                key={activeVIT.id}
                item={activeVIT}
                onToggleComplete={handleToggleVITCompletion}
              />
            )}
          </AnimatePresence>

          {/* Focused Item Banner */}
          <FocusedItemBanner />

          {/* Bucket Headers */}
          <div className="mb-6">
            {activeBucket === 'today' && (
              <div>
                <p className="text-sm text-muted-foreground mt-1">{formatTodayDate()}</p>
              </div>
            )}

            {activeBucket === 'tomorrow' && (
              <div>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(Date.now() + 86400000).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            )}

            {activeBucket === 'someday' && (
              <div>
                <p className="text-sm text-muted-foreground mt-1">You'll get to it eventually</p>
              </div>
            )}
          </div>

          {/* Bucket Content View */}
          <MasonryBucketView
            bucket={activeBucket}
            items={items}
            onToggleComplete={handleToggleItemCompletion}
            onCardClick={handleCardClick}
            onArchive={archiveItem}
            onStartFocus={handleStartFocus}
            onMarkAsVIT={handleMarkAsVIT}
            activeId={activeId}
          />
        </div>

        {/* Focus Drop Zone - shown only when dragging */}
        <FocusDropZone isVisible={activeId !== null} />
      </div>

      {/* Floating Task Input - bottom of screen */}
      <FloatingTaskInput
        ref={inputRef}
        onAddItem={handleAddItem}
        placeholder="Press / to add a task..."
      />

      {/* Switch Focus Dialog */}
      <SwitchFocusDialog
        open={showSwitchDialog}
        onOpenChange={setShowSwitchDialog}
        currentItemText={activeItemText || ''}
        newItemText={pendingFocus?.itemText || ''}
        onConfirm={handleConfirmSwitch}
        onCancel={handleCancelSwitch}
      />

      {/* VIT Dialog */}
      <VITDialog
        open={showVITDialog}
        onOpenChange={setShowVITDialog}
        onConfirm={handleConfirmVIT}
        taskText={vitDialogItemId ? allItems.find(i => i.id === vitDialogItemId)?.text || '' : ''}
        existingVIT={activeVIT && vitDialogItemId !== activeVIT.id ? { id: activeVIT.id, text: activeVIT.text } : undefined}
      />
    </DndContext>
  );
}
