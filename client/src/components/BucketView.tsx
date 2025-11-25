import { useMemo } from 'react';
import { BulletItem as BulletItemType, Bucket, BulletItemType as BulletType } from '@shared/schema';
import BulletItem from './BulletItem';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface BucketViewProps {
  bucket: Bucket;
  items: BulletItemType[];
  deleteItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<BulletItemType>) => void;
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
    <div className="space-y-3">
      {/* Items List with Drag and Drop */}
      <SortableContext
        items={items.map(item => item.id)}
        strategy={verticalListSortingStrategy}
      >
          {/* General Bullets Section */}
          <div className="space-y-3">
            {generalItems.length === 0 && scheduledItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground/60">
                <p className="text-sm">{emptyState.subtitle}</p>
              </div>
            ) : (
              <>
                {generalItems.map((item) => (
                  <BulletItem
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
            <div className="mt-6">
              <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide px-1">
                Scheduled {bucket === 'today' ? 'Today' : 'Tomorrow'}
              </h3>
              <div className="space-y-3">
                {scheduledItems.map((item) => (
                  <BulletItem
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
    </div>
  );
}
