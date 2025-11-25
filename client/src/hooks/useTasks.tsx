import { useState, useEffect } from "react";
import { Task, Quadrant, Workspace } from "@shared/schema";
import { useProfile } from "./useProfile";
import { useAuth } from "@/contexts/AuthContext";
import {
  useSupabaseTasks,
  useAddTask as useAddTaskMutation,
  useUpdateTask,
  useDeleteTask as useDeleteTaskMutation,
  useDeleteCompletedTasks as useDeleteCompletedTasksMutation,
} from "./useSupabaseTasks";
import { isSupabaseConfigured } from "@/lib/supabase";

const STORAGE_KEY = "eisenhower-tasks";

export function useTasks() {
  const { isAuthenticated } = useAuth();
  const { data: supabaseTasks, isLoading: supabaseLoading } = useSupabaseTasks();
  const addTaskMutation = useAddTaskMutation();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTaskMutation();
  const deleteCompletedTasksMutation = useDeleteCompletedTasksMutation();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { trackCleanupEvent } = useProfile();

  // Load tasks on mount: Supabase if logged in, otherwise localStorage
  useEffect(() => {
    if (isAuthenticated && supabaseLoading) {
      // Still loading from Supabase, wait
      return;
    }

    if (isAuthenticated && supabaseTasks) {
      // Logged in: Load from Supabase
      setTasks(supabaseTasks);
      // Also save to localStorage as cache
      localStorage.setItem(STORAGE_KEY, JSON.stringify(supabaseTasks));
      setIsLoading(false);
    } else {
      // Not logged in: Load from localStorage only
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setTasks(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse stored tasks", e);
        }
      }
      setIsLoading(false);
    }
  }, [isAuthenticated, supabaseTasks, supabaseLoading]);

  // Save to localStorage whenever tasks change (cache)
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks, isLoading]);

  const addTask = (text: string, quadrant?: Quadrant, workspace: Workspace = "personal") => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      text,
      quadrant,
      workspace,
      createdAt: Date.now(),
      completed: false,
    };

    // Update local state immediately (optimistic update)
    setTasks((prev) => [...prev, newTask]);

    // Sync to Supabase if logged in
    if (isAuthenticated && isSupabaseConfigured()) {
      addTaskMutation.mutate({ text, quadrant, workspace });
    }
  };

  const deleteTask = (id: string) => {
    // Update local state immediately
    setTasks((prev) => prev.filter((task) => task.id !== id));

    // Sync to Supabase if logged in
    if (isAuthenticated && isSupabaseConfigured()) {
      deleteTaskMutation.mutate(id);
    }
  };

  const toggleTaskCompletion = (id: string, onComplete?: (quadrant: Quadrant) => void, onUncomplete?: (quadrant: Quadrant) => void) => {
    let updatedTask: Task | undefined;

    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          const newCompleted = !task.completed;

          // Call callbacks for XP tracking (only for tasks with quadrants)
          if (newCompleted && onComplete && task.quadrant) {
            onComplete(task.quadrant);
          } else if (!newCompleted && onUncomplete && task.completedInQuadrant) {
            onUncomplete(task.completedInQuadrant);
          }

          updatedTask = {
            ...task,
            completed: newCompleted,
            completedInQuadrant: newCompleted ? task.quadrant : undefined,
          };
          return updatedTask;
        }
        return task;
      }),
    );

    // Sync to Supabase if logged in
    if (updatedTask && isAuthenticated && isSupabaseConfigured()) {
      updateTaskMutation.mutate({
        id,
        updates: {
          completed: updatedTask.completed,
          completedInQuadrant: updatedTask.completedInQuadrant,
        },
      });
    }
  };

  const editTask = (id: string, newText: string) => {
    // Update local state immediately
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, text: newText } : task)),
    );

    // Sync to Supabase if logged in
    if (isAuthenticated && isSupabaseConfigured()) {
      updateTaskMutation.mutate({ id, updates: { text: newText } });
    }
  };

  const moveTask = (id: string, newQuadrant?: Quadrant) => {
    let updates: Partial<Task> = {};

    // Update local state immediately
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          updates = {
            quadrant: newQuadrant,
            completedInQuadrant: task.completed && newQuadrant ? newQuadrant : task.completedInQuadrant,
          };
          return { ...task, ...updates };
        }
        return task;
      })
    );

    // Sync to Supabase if logged in
    if (isAuthenticated && isSupabaseConfigured()) {
      updateTaskMutation.mutate({ id, updates });
    }
  };

  const getTasksByQuadrant = (quadrant: Quadrant, workspace?: Workspace) => {
    return tasks.filter((task) =>
      task.quadrant === quadrant &&
      (workspace ? task.workspace === workspace : true)
    );
  };

  const getBrainDumpTasks = (workspace?: Workspace) => {
    return tasks.filter((task) =>
      !task.quadrant &&
      (workspace ? task.workspace === workspace : true)
    );
  };

  const deleteCompletedTasks = (workspace?: Workspace) => {
    // Update local state immediately
    setTasks((prev) => prev.filter((task) =>
      !task.completed || (workspace ? task.workspace !== workspace : false)
    ));

    // Track cleanup event for daily quests
    trackCleanupEvent();

    // Sync to Supabase if logged in
    if (isAuthenticated && isSupabaseConfigured()) {
      deleteCompletedTasksMutation.mutate(workspace);
    }
  };

  return {
    tasks,
    addTask,
    deleteTask,
    toggleTaskCompletion,
    editTask,
    moveTask,
    getTasksByQuadrant,
    getBrainDumpTasks,
    deleteCompletedTasks,
  };
}
