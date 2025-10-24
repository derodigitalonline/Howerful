import { useState, useEffect } from "react";
import { Task, Quadrant, Workspace } from "@shared/schema";
import { useProfile } from "./useProfile";

const STORAGE_KEY = "eisenhower-tasks";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { trackCleanupEvent } = useProfile();

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setTasks(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored tasks", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (text: string, quadrant?: Quadrant, workspace: Workspace = "personal") => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      text,
      quadrant,
      workspace,
      createdAt: Date.now(),
      completed: false,
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const toggleTaskCompletion = (id: string, onComplete?: (quadrant: Quadrant) => void, onUncomplete?: (quadrant: Quadrant) => void) => {
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

          return {
            ...task,
            completed: newCompleted,
            completedInQuadrant: newCompleted ? task.quadrant : undefined,
          };
        }
        return task;
      }),
    );
  };

  const editTask = (id: string, newText: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, text: newText } : task)),
    );
  };

  const moveTask = (id: string, newQuadrant?: Quadrant) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              quadrant: newQuadrant,
              // Update completedInQuadrant if the task is completed
              completedInQuadrant: task.completed && newQuadrant ? newQuadrant : task.completedInQuadrant,
            }
          : task
      )
    );
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
    setTasks((prev) => prev.filter((task) =>
      !task.completed || (workspace ? task.workspace !== workspace : false)
    ));

    // Track cleanup event for daily quests
    trackCleanupEvent();
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
