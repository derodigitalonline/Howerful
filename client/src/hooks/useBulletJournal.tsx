import { useState, useEffect, useMemo } from "react";
import { BulletItem, BulletItemType, Bucket } from "@shared/schema";
import { calculateStreak, StreakData } from "@/utils/streakCalculator";

const STORAGE_KEY = "howerful-bullet-journal";

export function useBulletJournal() {
  const [items, setItems] = useState<BulletItem[]>([]);

  // Load items from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored bullet journal items", e);
      }
    }
  }, []);

  // Save items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (text: string, type: BulletItemType, bucket: Bucket = 'today', time?: string, date?: string) => {
    setItems((prev) => {
      // Find the highest order for this bucket, default to 0
      const bucketItems = prev.filter(item => item.bucket === bucket);
      const maxOrder = bucketItems.length > 0
        ? Math.max(...bucketItems.map(item => item.order))
        : -1;

      const newItem: BulletItem = {
        id: crypto.randomUUID(),
        type,
        text,
        bucket,
        date, // Optional - only for scheduled events
        time,
        completed: false,
        createdAt: Date.now(),
        order: maxOrder + 1, // New items get next order (will appear at top after sort)
      };
      return [...prev, newItem];
    });
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, updates: Partial<BulletItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const toggleItemCompletion = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const cycleItemType = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const types: BulletItemType[] = ["task", "event", "note"];
          const currentIndex = types.indexOf(item.type);
          const nextIndex = (currentIndex + 1) % types.length;
          const newType = types[nextIndex];

          // Reset completed state when changing away from task
          return {
            ...item,
            type: newType,
            completed: newType === "task" ? item.completed : false,
          };
        }
        return item;
      })
    );
  };

  const changeItemType = (id: string, newType: BulletItemType) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            type: newType,
            // Reset completed state when changing away from task
            completed: newType === "task" ? item.completed : false,
            // Clear time field when changing away from event
            time: newType === "event" ? item.time : undefined,
          };
        }
        return item;
      })
    );
  };

  const getItemsByDate = (date: string) => {
    return items.filter((item) => item.date === date)
      .sort((a, b) => b.order - a.order); // Descending order: newest (highest order) first
  };

  const getItemsByBucket = (bucket: Bucket) => {
    return items.filter((item) => item.bucket === bucket)
      .sort((a, b) => b.order - a.order); // Descending order: newest (highest order) first
  };

  const moveItemToBucket = (id: string, bucket: Bucket) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updates: Partial<BulletItem> = { bucket };

          // Track when items are moved to Someday for backlog metadata
          if (bucket === 'someday' && item.bucket !== 'someday') {
            updates.movedToSomedayAt = Date.now();
          }

          // Clear the someday timestamp if moving out of someday
          if (bucket !== 'someday' && item.movedToSomedayAt) {
            updates.movedToSomedayAt = undefined;
          }

          return { ...item, ...updates };
        }
        return item;
      })
    );
  };

  const reorderItems = (bucket: Bucket, startIndex: number, endIndex: number) => {
    setItems((prev) => {
      const bucketItems = prev.filter(item => item.bucket === bucket)
        .sort((a, b) => b.order - a.order);
      const otherItems = prev.filter(item => item.bucket !== bucket);

      const [removed] = bucketItems.splice(startIndex, 1);
      bucketItems.splice(endIndex, 0, removed);

      // Reassign order values
      const reorderedBucketItems = bucketItems.map((item, index) => ({
        ...item,
        order: bucketItems.length - 1 - index, // Reverse index for descending order
      }));

      return [...otherItems, ...reorderedBucketItems];
    });
  };

  // Calculate streak data
  const streakData = useMemo(() => calculateStreak(items), [items]);

  return {
    items,
    addItem,
    deleteItem,
    updateItem,
    toggleItemCompletion,
    cycleItemType,
    changeItemType,
    getItemsByDate,
    getItemsByBucket,
    moveItemToBucket,
    reorderItems,
    streakData,
  };
}
