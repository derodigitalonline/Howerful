import { Task } from "@shared/schema";
import TaskCard from "./TaskCard";
import { useDroppable } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';

interface BrainDumpCardProps {
  tasks: Task[];
  onDeleteTask: (id: string) => void;
  onToggleTask: (id: string) => void;
  onEditTask: (id: string, newText: string) => void;
  onAddTask: (text: string) => void;
  isDragOver?: boolean;
  showRipple: boolean;
}

export default function BrainDumpCard({
  tasks,
  onDeleteTask,
  onToggleTask,
  onEditTask,
  onAddTask,
  isDragOver = false,
  showRipple,
}: BrainDumpCardProps) {
  const [newTaskText, setNewTaskText] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  const { setNodeRef } = useDroppable({
    id: 'brain-dump',
  });

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      onAddTask(newTaskText.trim());
      setNewTaskText('');
      setIsAddingTask(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask();
    } else if (e.key === 'Escape') {
      setNewTaskText('');
      setIsAddingTask(false);
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      className={`
        relative rounded-xl border-2 p-6 h-full flex flex-col
        transition-all duration-300 overflow-hidden
        ${isDragOver ? 'bg-muted/15 border-muted-foreground/40 shadow-[0_0_30px_rgba(0,0,0,0.2)] scale-[1.02]' : 'border-border/20 bg-muted/5'}
      `}
      animate={{
        scale: isDragOver ? 1.02 : 1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Ripple effect on task drop */}
      <AnimatePresence>
        {showRipple && (
          <motion.div
            className="absolute inset-0 ring-muted-foreground rounded-xl pointer-events-none"
            initial={{ opacity: 0.75, scale: 0.8 }}
            animate={{ opacity: 0, scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      {/* Pulsing border when drag over */}
      {isDragOver && (
        <motion.div
          className="absolute inset-0 border-2 ring-muted-foreground rounded-xl pointer-events-none"
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.01, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      <div className="mb-4 relative z-10 shrink-0">
        <h2 className="text-lg font-semibold uppercase tracking-wide text-foreground">
          Brain Dump
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Capture tasks, organize later
        </p>
      </div>

      <div className="space-y-2 relative z-10 overflow-y-auto flex-1 pr-2 mb-4">
        {tasks.length === 0 && !isAddingTask ? (
          <motion.div
            className="text-center py-12 text-muted-foreground/60 text-sm"
            animate={{
              scale: isDragOver ? [1, 1.05, 1] : 1,
            }}
            transition={{ duration: 0.5, repeat: isDragOver ? Infinity : 0 }}
          >
            {isDragOver ? '✨ Drop here' : 'No tasks yet'}
          </motion.div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              id={task.id}
              text={task.text}
              completed={task.completed}
              onToggle={() => onToggleTask(task.id)}
              onDelete={() => onDeleteTask(task.id)}
              onEdit={(newText) => onEditTask(task.id, newText)}
              quadrantColor="border-l-muted-foreground"
            />
          ))
        )}
      </div>

      {/* Add Task Input */}
      <div className="relative z-10 shrink-0">
        {isAddingTask ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                if (!newTaskText.trim()) {
                  setIsAddingTask(false);
                }
              }}
              placeholder="Type a task..."
              className="flex-1 px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
          </motion.div>
        ) : (
          <Button
            onClick={() => setIsAddingTask(true)}
            variant="outline"
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        )}
      </div>
    </motion.div>
  );
}
