import BucketTabs from '@/components/BucketTabs';
import BucketView from '@/components/BucketView';
import FocusDropZone from '@/components/FocusDropZone';
import FocusedItemBanner from '@/components/FocusedItemBanner';
import SwitchFocusDialog from '@/components/SwitchFocusDialog';
import { useBulletJournal } from '@/hooks/useBulletJournal';
import { useFocus } from '@/hooks/useFocus';
import { useProfile } from '@/hooks/useProfile';
import { parseBulletEntry } from '@/utils/bulletDetection';
import { Input } from '@/components/ui/input';
import { useMemo, useState, useRef, useEffect } from 'react';
import { Bucket, BULLET_TASK_XP_REWARD, BULLET_TASK_COIN_REWARD } from '@shared/schema';
import { toast } from 'sonner';
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
  const { getItemsByBucket, addItem, deleteItem, updateItem, toggleItemCompletion, cycleItemType, changeItemType, reorderItems, moveItemToBucket, items: allItems } = useBulletJournal();
  const { startTimer, activeItemId, activeItemText } = useFocus();
  const { awardXP, deductXP } = useProfile();

  const [activeBucket, setActiveBucket] = useState<Bucket>('today');
  const [newItemText, setNewItemText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  // Switch focus dialog state
  const [showSwitchDialog, setShowSwitchDialog] = useState(false);
  const [pendingFocus, setPendingFocus] = useState<{ itemId?: string; itemText?: string; duration?: number } | null>(null);

  // Handle bullet item completion with XP rewards
  const handleToggleItemCompletion = (id: string) => {
    toggleItemCompletion(
      id,
      () => {
        // Award XP and Coins when completing
        const xpGained = BULLET_TASK_XP_REWARD;
        const coinsGained = BULLET_TASK_COIN_REWARD;
        const result = awardXP('schedule'); // Use 'schedule' quadrant as base for bullet tasks

        if (result.leveledUp) {
          toast.success(`🎉 Level Up! You're now level ${result.newLevel}!`, {
            description: `+${xpGained} XP & +${coinsGained} coins earned`,
            duration: 5000,
          });
        } else {
          toast.success(`+${xpGained} XP & +${coinsGained} coins`, {
            description: `Bullet task completed`,
            duration: 2000,
          });
        }
      },
      () => {
        // Deduct XP when uncompleting
        deductXP('schedule'); // Use 'schedule' quadrant as base for bullet tasks
        toast.info(`-${BULLET_TASK_XP_REWARD} XP`, {
          description: 'Task uncompleted',
          duration: 2000,
        });
      }
    );
  };

  // Get items for current bucket
  const items = getItemsByBucket(activeBucket);

  // Calculate bucket counts for tab badges
  const bucketCounts = useMemo(() => ({
    today: getItemsByBucket('today').length,
    tomorrow: getItemsByBucket('tomorrow').length,
    someday: getItemsByBucket('someday').length,
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

  const handleAddItem = (openDetail: boolean = false) => {
    if (newItemText.trim()) {
      // Parse the input using natural language processing
      const parsed = parseBulletEntry(newItemText);

      // Add the item to the currently active bucket
      addItem(parsed.text, parsed.type, parsed.bucket || activeBucket, parsed.time);
      setNewItemText('');

      // TODO: If openDetail is true, open the detail view for the newly created item
      // This will be implemented when we add the detail view feature
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Shift + Enter: Capture and open detail view
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      handleAddItem(true);
    }
    // Enter: Instant capture
    else if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      e.preventDefault();
      handleAddItem(false);
    }
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

  // Handle starting focus with switch dialog check
  const handleStartFocus = (itemId?: string, itemText?: string, duration?: number) => {
    // If there's already an active focus session, show switch dialog
    if (activeItemId) {
      setPendingFocus({ itemId, itemText, duration });
      setShowSwitchDialog(true);
    } else {
      // No active session, start immediately
      startTimer(itemId, itemText, duration);
    }
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
          {/* Task Entry Input */}
          <div>
            <Input
              ref={inputRef}
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What's on your mind? (Press / to focus, Enter to capture)"
              className="h-12 text-base"
              autoFocus
            />
          </div>

          {/* Bucket Tabs */}
          <div className="mt-6">
            <BucketTabs
              activeBucket={activeBucket}
              onBucketChange={setActiveBucket}
              counts={bucketCounts}
            />
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6">
          {/* Focused Item Banner */}
          <FocusedItemBanner />

          {/* Bucket Headers */}
          <div className="mb-6">
            {activeBucket === 'today' && (
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">Today</h1>
                  <p className="text-sm text-muted-foreground mt-1">{formatTodayDate()}</p>
                </div>
                {items.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-semibold text-primary">{items.length}</span> {items.length === 1 ? 'thought' : 'thoughts'}
                  </div>
                )}
              </div>
            )}

            {activeBucket === 'tomorrow' && (
              <div>
                <h1 className="text-2xl font-bold">Tomorrow</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(Date.now() + 86400000).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            )}

            {activeBucket === 'someday' && (
              <div>
                <h1 className="text-2xl font-bold">Someday</h1>
                <p className="text-sm text-muted-foreground mt-1">You'll get to it eventually</p>
              </div>
            )}
          </div>

          {/* Bucket Content View */}
          <BucketView
            bucket={activeBucket}
            items={items}
            deleteItem={deleteItem}
            updateItem={updateItem}
            toggleItemCompletion={handleToggleItemCompletion}
            cycleItemType={cycleItemType}
            changeItemType={changeItemType}
            reorderItems={reorderItems}
            moveItemToBucket={moveItemToBucket}
            onStartFocus={handleStartFocus}
            activeId={activeId}
            overId={overId}
          />
        </div>

        {/* Focus Drop Zone - shown only when dragging */}
        <FocusDropZone isVisible={activeId !== null} />
      </div>

      {/* Switch Focus Dialog */}
      <SwitchFocusDialog
        open={showSwitchDialog}
        onOpenChange={setShowSwitchDialog}
        currentItemText={activeItemText || ''}
        newItemText={pendingFocus?.itemText || ''}
        onConfirm={handleConfirmSwitch}
        onCancel={handleCancelSwitch}
      />
    </DndContext>
  );
}
