import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { DailySpreadItem as DailySpreadItemType, Bucket, DailySpreadItemType as BulletType } from '@shared/schema';
import DailySpreadItem from './DailySpreadItem';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface BucketViewProps {
  bucket: Bucket;
  items: DailySpreadItemType[];
  deleteItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<DailySpreadItemType>) => void;
  toggleItemCompletion: (id: string) => void;
  cycleItemType: (id: string) => void;
  changeItemType: (id: string, type: BulletType) => void;
  reorderItems: (bucket: Bucket, startIndex: number, endIndex: number) => void;
  moveItemToBucket: (id: string, bucket: Bucket) => void;
  onStartFocus?: (id: string, text: string) => void;
  activeId: string | null;
  overId: string | null;
}

export default function BucketView({
  bucket,
  items,
  deleteItem,
  updateItem,
  toggleItemCompletion,
  cycleItemType,
  changeItemType,
  reorderItems,
  moveItemToBucket,
  onStartFocus,
  activeId,
  overId,
}: BucketViewProps) {

  // Separate scheduled items (events with time) from general bullets
  // Only for Today and Tomorrow buckets
  const showScheduledSection = bucket === 'today' || bucket === 'tomorrow';

  const scheduledItems = useMemo(() => {
    if (!showScheduledSection) return [];
    return items
      .filter(item => item.type === 'event' && item.time)
      .sort((a, b) => {
        // Sort by time
        if (a.time && b.time) {
          return a.time.localeCompare(b.time);
        }
        return 0;
      });
  }, [items, showScheduledSection]);

  const generalItems = useMemo(() => {
    if (!showScheduledSection) return items;
    return items.filter(item => !(item.type === 'event' && item.time));
  }, [items, showScheduledSection]);

  const handleUpdateItem = (id: string, text: string, time?: string) => {
    updateItem(id, { text, time });
  };

  const getEmptyStateMessage = () => {
    switch (bucket) {
      case 'today':
        return {
          title: "What's on your mind?",
          subtitle: "Capture tasks, events, and notes for today"
        };
      case 'tomorrow':
        return {
          title: "Planning ahead?",
          subtitle: "Add items for tomorrow"
        };
      case 'someday':
        return {
          title: "Your backlog awaits",
          subtitle: "A safe space for ideas and future tasks"
        };
    }
  };

  const emptyState = getEmptyStateMessage();

  return (
    <Card className="p-6">
      {/* Items List with Drag and Drop */}
      <SortableContext
        items={items.map(item => item.id)}
        strategy={verticalListSortingStrategy}
      >
          {/* General Bullets Section */}
          <div className="space-y-1">
            {generalItems.length === 0 && scheduledItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg font-medium">{emptyState.title}</p>
                <p className="text-sm mt-2">{emptyState.subtitle}</p>
                {bucket === 'today' && (
                  <div className="text-xs mt-6 space-y-1 opacity-70">
                    <p>💡 Type naturally - the system auto-detects:</p>
                    <p>− Notes: Default for any entry</p>
                    <p>• Tasks: "todo: call dentist" or "buy milk"</p>
                    <p>○ Events: "meeting at 2pm" or "lunch tomorrow 1:30"</p>
                  </div>
                )}
              </div>
            ) : (
              <>
                {generalItems.map((item) => (
                  <DailySpreadItem
                    key={item.id}
                    item={item}
                    currentBucket={bucket}
                    onToggleComplete={toggleItemCompletion}
                    onCycleType={cycleItemType}
                    onChangeType={changeItemType}
                    onUpdate={handleUpdateItem}
                    onDelete={deleteItem}
                    onMoveToBucket={moveItemToBucket}
                    onStartFocus={onStartFocus}
                    isOver={overId === item.id}
                    isDragging={activeId === item.id}
                  />
                ))}
              </>
            )}
          </div>

          {/* Scheduled Section (Today and Tomorrow only) */}
          {showScheduledSection && scheduledItems.length > 0 && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                Scheduled {bucket === 'today' ? 'Today' : 'Tomorrow'}
              </h3>
              <div className="space-y-1">
                {scheduledItems.map((item) => (
                  <DailySpreadItem
                    key={item.id}
                    item={item}
                    currentBucket={bucket}
                    onToggleComplete={toggleItemCompletion}
                    onCycleType={cycleItemType}
                    onChangeType={changeItemType}
                    onUpdate={handleUpdateItem}
                    onDelete={deleteItem}
                    onMoveToBucket={moveItemToBucket}
                    onStartFocus={onStartFocus}
                    isOver={overId === item.id}
                    isDragging={activeId === item.id}
                  />
                ))}
              </div>
            </div>
          )}
      </SortableContext>
    </Card>
  );
}
