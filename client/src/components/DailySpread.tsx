import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { BulletItem as BulletItemType } from '@shared/schema';
import BulletItem from './BulletItem';
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
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface DailySpreadProps {
  items: BulletItemType[];
  deleteItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<BulletItemType>) => void;
  toggleItemCompletion: (id: string) => void;
  cycleItemType: (id: string) => void;
  reorderItems: (date: string, startIndex: number, endIndex: number) => void;
  today: string;
}

export default function DailySpread({
  items,
  deleteItem,
  updateItem,
  toggleItemCompletion,
  cycleItemType,
  reorderItems,
  today,
}: DailySpreadProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  // Separate scheduled items (events with time) from general bullets
  const scheduledItems = useMemo(() => {
    return items
      .filter(item => item.type === 'event' && item.time)
      .sort((a, b) => {
        // Sort by time
        if (a.time && b.time) {
          return a.time.localeCompare(b.time);
        }
        return 0;
      });
  }, [items]);

  const generalItems = useMemo(() => {
    return items.filter(item => !(item.type === 'event' && item.time));
  }, [items]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleUpdateItem = (id: string, text: string, time?: string) => {
    updateItem(id, { text, time });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over?.id as string | null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Find indices in the full items list for reordering
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      reorderItems(today, oldIndex, newIndex);
    }

    // Reset drag state
    setActiveId(null);
    setOverId(null);
  };

  return (
    <>
      <Card className="p-6">
        {/* Items List with Drag and Drop */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map(item => item.id)}
            strategy={verticalListSortingStrategy}
          >
            {/* General Bullets Section */}
            <div className="space-y-1">
              {generalItems.length === 0 && scheduledItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-lg">What's on your mind?</p>
                  <div className="text-xs mt-4 space-y-1">
                    <p>💡 Type naturally - the system auto-detects:</p>
                    <p>• Tasks: "call dentist" or "buy milk"</p>
                    <p>○ Events: "meeting at 2pm" or "lunch tomorrow 1:30"</p>
                    <p>− Notes: "remember that..." or "idea: ..."</p>
                  </div>
                </div>
              ) : (
                <>
                  {generalItems.map((item) => (
                    <BulletItem
                      key={item.id}
                      item={item}
                      onToggleComplete={toggleItemCompletion}
                      onCycleType={cycleItemType}
                      onUpdate={handleUpdateItem}
                      onDelete={deleteItem}
                      isOver={overId === item.id}
                      isDragging={activeId === item.id}
                    />
                  ))}
                </>
              )}
            </div>

            {/* Scheduled Today Section */}
            {scheduledItems.length > 0 && (
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                  Scheduled Today
                </h3>
                <div className="space-y-1">
                  {scheduledItems.map((item) => (
                    <BulletItem
                      key={item.id}
                      item={item}
                      onToggleComplete={toggleItemCompletion}
                      onCycleType={cycleItemType}
                      onUpdate={handleUpdateItem}
                      onDelete={deleteItem}
                      isOver={overId === item.id}
                      isDragging={activeId === item.id}
                    />
                  ))}
                </div>
              </div>
            )}
          </SortableContext>
        </DndContext>
      </Card>
    </>
  );
}
