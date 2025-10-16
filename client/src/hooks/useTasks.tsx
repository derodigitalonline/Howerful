import { useState, useEffect } from "react";
import { Task, Quadrant } from "@shared/schema";

const STORAGE_KEY = "eisenhower-tasks";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

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

  const addTask = (text: string, quadrant: Quadrant) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      text,
      quadrant,
      createdAt: Date.now(),
      completed: false,
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const toggleTaskCompletion = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const editTask = (id: string, newText: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, text: newText } : task)),
    );
  };

  const moveTask = (id: string, newQuadrant: Quadrant) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, quadrant: newQuadrant } : task
      )
    );
  };

  const getTasksByQuadrant = (quadrant: Quadrant) => {
    return tasks.filter((task) => task.quadrant === quadrant);
  };

  return {
    tasks,
    addTask,
    deleteTask,
    toggleTaskCompletion,
    editTask,
    moveTask,
    getTasksByQuadrant,
  };
}