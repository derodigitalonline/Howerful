import { useState, useEffect, useMemo } from "react";
import { BulletItem, BulletItemType, Bucket } from "@shared/schema";
import { calculateStreak, StreakData } from "@/utils/streakCalculator";
import { useAuth } from "@/contexts/AuthContext";
import {
  useSupabaseBulletItems,
  useAddBulletItem as useAddBulletItemMutation,
  useUpdateBulletItem,
  useDeleteBulletItem as useDeleteBulletItemMutation,
} from "./useSupabaseTasks";
import { isSupabaseConfigured } from "@/lib/supabase";

const STORAGE_KEY = "howerful-bullet-journal";

export function useBulletJournal() {
  const { isAuthenticated } = useAuth();
  const { data: supabaseItems, isLoading: supabaseLoading } = useSupabaseBulletItems();
  const addItemMutation = useAddBulletItemMutation();
  const updateItemMutation = useUpdateBulletItem();
  const deleteItemMutation = useDeleteBulletItemMutation();

  const [items, setItems] = useState<BulletItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load items on mount: Supabase if logged in, otherwise localStorage
  useEffect(() => {
    if (isAuthenticated && supabaseLoading) {
      // Still loading from Supabase, wait
      return;
    }

    if (isAuthenticated && supabaseItems) {
      // Logged in: Load from Supabase
      setItems(supabaseItems);
      // Also save to localStorage as cache
      localStorage.setItem(STORAGE_KEY, JSON.stringify(supabaseItems));
      setIsLoading(false);
    } else {
      // Not logged in: Load from localStorage only
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setItems(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse stored bullet journal items", e);
        }
      }
      setIsLoading(false);
    }
  }, [isAuthenticated, supabaseItems, supabaseLoading]);

  // Save to localStorage whenever items change (cache)
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isLoading]);

  // Auto-migrate Future Log items to Today when their scheduled date arrives
  useEffect(() => {
    if (isLoading) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    const itemsToMigrate = items.filter(item =>
      item.bucket === 'future-log' &&
      item.scheduledDate &&
      new Date(item.scheduledDate) <= today
    );

    if (itemsToMigrate.length > 0) {
      console.log(`Auto-migrating ${itemsToMigrate.length} items from Future Log to Today`);

      itemsToMigrate.forEach(item => {
        // Update the item to move it to "today" bucket
        const updatedItem = {
          ...item,
          bucket: 'today' as Bucket,
          scheduledDate: undefined, // Clear scheduled date after migration
        };

        // Update local state
        setItems(prev =>
          prev.map(i => (i.id === item.id ? updatedItem : i))
        );

        // Sync to Supabase
        if (isAuthenticated && isSupabaseConfigured()) {
          updateItemMutation.mutate({
            id: item.id,
            updates: { bucket: 'today', scheduledDate: undefined },
          });
        }
      });
    }
  }, [items, isLoading, isAuthenticated]);

  const addItem = (text: string, type: BulletItemType, bucket: Bucket = 'today', time?: string, date?: string, scheduledDate?: string) => {
    // Find the highest order for this bucket
    const bucketItems = items.filter(item => item.bucket === bucket);
    const maxOrder = bucketItems.length > 0
      ? Math.max(...bucketItems.map(item => item.order))
      : -1;
    const order = maxOrder + 1;

    const newItem: BulletItem = {
      id: crypto.randomUUID(),
      type,
      text,
      bucket,
      date, // Optional - only for scheduled events
      time,
      scheduledDate, // Optional - for Future Log auto-migration
      completed: false,
      createdAt: Date.now(),
      order, // New items get next order (will appear at top after sort)
    };

    // Update local state immediately
    setItems((prev) => [...prev, newItem]);

    // Sync to Supabase if logged in (pass the same ID)
    if (isAuthenticated && isSupabaseConfigured()) {
      console.log('Adding bullet item to Supabase:', { id: newItem.id, text, type, bucket, time, date, scheduledDate, order });
      addItemMutation.mutate({ id: newItem.id, text, type, bucket, time, date, scheduledDate, order });
    } else {
      console.log('Not syncing to Supabase - authenticated:', isAuthenticated, 'configured:', isSupabaseConfigured());
    }
  };

  const deleteItem = (id: string) => {
    // Update local state immediately
    setItems((prev) => prev.filter((item) => item.id !== id));

    // Sync to Supabase if logged in
    if (isAuthenticated && isSupabaseConfigured()) {
      deleteItemMutation.mutate(id);
    }
  };

  const updateItem = (id: string, updates: Partial<BulletItem>) => {
    // Update local state immediately
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );

    // Sync to Supabase if logged in
    if (isAuthenticated && isSupabaseConfigured()) {
      updateItemMutation.mutate({ id, updates });
    }
  };

  const toggleItemCompletion = (id: string, onComplete?: () => void, onUncomplete?: () => void) => {
    let newCompleted: boolean | undefined;

    // Update local state immediately
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const wasCompleted = item.completed;
          newCompleted = !wasCompleted;

          // Only trigger callbacks for task-type items
          if (item.type === 'task') {
            if (newCompleted && onComplete) {
              onComplete();
            } else if (!newCompleted && onUncomplete) {
              onUncomplete();
            }
          }

          return { ...item, completed: newCompleted };
        }
        return item;
      })
    );

    // Sync to Supabase if logged in
    if (newCompleted !== undefined && isAuthenticated && isSupabaseConfigured()) {
      updateItemMutation.mutate({ id, updates: { completed: newCompleted } });
    }
  };

  const cycleItemType = (id: string) => {
    let updates: Partial<BulletItem> = {};

    // Update local state immediately
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const types: BulletItemType[] = ["task", "event", "note"];
          const currentIndex = types.indexOf(item.type);
          const nextIndex = (currentIndex + 1) % types.length;
          const newType = types[nextIndex];

          updates = {
            type: newType,
            completed: newType === "task" ? item.completed : false,
          };

          return { ...item, ...updates };
        }
        return item;
      })
    );

    // Sync to Supabase if logged in
    if (updates.type && isAuthenticated && isSupabaseConfigured()) {
      updateItemMutation.mutate({ id, updates });
    }
  };

  const changeItemType = (id: string, newType: BulletItemType) => {
    let updates: Partial<BulletItem> = {};

    // Update local state immediately
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          updates = {
            type: newType,
            completed: newType === "task" ? item.completed : false,
            time: newType === "event" ? item.time : undefined,
          };

          return { ...item, ...updates };
        }
        return item;
      })
    );

    // Sync to Supabase if logged in
    if (isAuthenticated && isSupabaseConfigured()) {
      updateItemMutation.mutate({ id, updates });
    }
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
    let updates: Partial<BulletItem> = {};

    // Update local state immediately
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          updates = { bucket };

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

    // Sync to Supabase if logged in
    if (isAuthenticated && isSupabaseConfigured()) {
      updateItemMutation.mutate({ id, updates });
    }
  };

  const reorderItems = (bucket: Bucket, startIndex: number, endIndex: number) => {
    let reorderedBucketItems: BulletItem[] = [];

    // Update local state immediately
    setItems((prev) => {
      const bucketItems = prev.filter(item => item.bucket === bucket)
        .sort((a, b) => b.order - a.order);
      const otherItems = prev.filter(item => item.bucket !== bucket);

      const [removed] = bucketItems.splice(startIndex, 1);
      bucketItems.splice(endIndex, 0, removed);

      // Reassign order values
      reorderedBucketItems = bucketItems.map((item, index) => ({
        ...item,
        order: bucketItems.length - 1 - index, // Reverse index for descending order
      }));

      return [...otherItems, ...reorderedBucketItems];
    });

    // Sync to Supabase if logged in (batch update all reordered items)
    if (isAuthenticated && isSupabaseConfigured()) {
      reorderedBucketItems.forEach(item => {
        updateItemMutation.mutate({ id: item.id, updates: { order: item.order } });
      });
    }
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
