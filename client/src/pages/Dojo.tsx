import BucketTabs from '@/components/BucketTabs';
import MasonryBucketView from '@/components/MasonryBucketView';
import FutureLogView from '@/components/FutureLogView';
import FutureLogTaskSheet from '@/components/FutureLogTaskSheet';
import FocusDropZone from '@/components/FocusDropZone';
import FocusedItemBanner from '@/components/FocusedItemBanner';
import SwitchFocusDialog from '@/components/SwitchFocusDialog';
import FloatingTaskInput from '@/components/FloatingTaskInput';
import { SlashInputRef } from '@/components/SlashInput';
import { useBulletJournal } from '@/hooks/useBulletJournal';
import { useFocus } from '@/hooks/useFocus';
import { useProfile } from '@/hooks/useProfile';
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
  const { getItemsByBucket, addItem, deleteItem, updateItem, toggleItemCompletion, cycleItemType, changeItemType, reorderItems, moveItemToBucket, archiveItem, items: allItems } = useBulletJournal();
  const { startTimer, activeItemId, activeItemText } = useFocus();
  const { trackBulletTaskCompletion } = useProfile();

  const [activeBucket, setActiveBucket] = useState<Bucket>('today');
  const inputRef = useRef<SlashInputRef>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  // Switch focus dialog state
  const [showSwitchDialog, setShowSwitchDialog] = useState(false);
  const [pendingFocus, setPendingFocus] = useState<{ itemId?: string; itemText?: string; duration?: number } | null>(null);

  // Future Log task sheet state
  const [showFutureLogSheet, setShowFutureLogSheet] = useState(false);

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

  // Calculate bucket counts for tab badges
  const bucketCounts = useMemo(() => ({
    today: getItemsByBucket('today').length,
    tomorrow: getItemsByBucket('tomorrow').length,
    someday: getItemsByBucket('someday').length,
    'future-log': getItemsByBucket('future-log').length,
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
    // Determine type based on whether time is provided
    const type = time ? 'event' : 'task';

    // Add the item to the currently active bucket
    addItem(text, type, activeBucket, time);
  };

  const handleAddToFutureLog = (text: string, scheduledDate: string, time?: string) => {
    // Determine type based on whether time is provided
    const type = time ? 'event' : 'task';

    addItem(text, type, 'future-log', time, undefined, scheduledDate);
    toast.success('Task added to Future Log!');
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
          {/* Focused Item Banner */}
          <FocusedItemBanner />

          {/* Bucket Headers */}
          <div className="mb-6">
            {activeBucket === 'today' && (
              <div className="flex items-center justify-between">
                <div>
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
          {activeBucket === 'future-log' ? (
            <FutureLogView
              items={items}
              onToggleComplete={handleToggleItemCompletion}
              onCardClick={handleCardClick}
              onArchive={archiveItem}
              onOpenAddSheet={() => setShowFutureLogSheet(true)}
            />
          ) : (
            <MasonryBucketView
              bucket={activeBucket}
              items={items}
              onToggleComplete={handleToggleItemCompletion}
              onCardClick={handleCardClick}
              onArchive={archiveItem}
              activeId={activeId}
            />
          )}
        </div>

        {/* Focus Drop Zone - shown only when dragging */}
        <FocusDropZone isVisible={activeId !== null} />
      </div>

      {/* Floating Task Input - bottom of screen */}
      <FloatingTaskInput
        ref={inputRef}
        onAddItem={handleAddItem}
        placeholder="Press / to add a task or event..."
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

      {/* Future Log Task Sheet */}
      <FutureLogTaskSheet
        open={showFutureLogSheet}
        onOpenChange={setShowFutureLogSheet}
        onAddTask={handleAddToFutureLog}
      />
    </DndContext>
  );
}
