import { Task } from "@shared/schema";
import TaskCard from "./TaskCard";
import { useDroppable } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';

interface QuadrantCardProps {
  quadrantId: string;
  title: string;
  subtitle: string;
  tasks: Task[];
  onDeleteTask: (id: string) => void;
  onToggleTask: (id: string) => void;
  onEditTask: (id: string, newText: string) => void;
  isSelected: boolean;
  isDragOver?: boolean;
  color: "chart-1" | "chart-2" | "chart-3" | "chart-4";
  showRipple: boolean;
}

const colorClasses = {
  "chart-1": {
    border: "border-chart-1/20",
    bg: "bg-chart-1/5",
    ring: "ring-chart-1",
    taskBorder: "border-l-chart-1",
    glow: "shadow-[0_0_30px_rgba(var(--chart-1),0.3)]",
    intense: "bg-chart-1/15 border-chart-1/40",
  },
  "chart-2": {
    border: "border-chart-2/20",
    bg: "bg-chart-2/5",
    ring: "ring-chart-2",
    taskBorder: "border-l-chart-2",
    glow: "shadow-[0_0_30px_rgba(var(--chart-2),0.3)]",
    intense: "bg-chart-2/15 border-chart-2/40",
  },
  "chart-3": {
    border: "border-chart-3/20",
    bg: "bg-chart-3/5",
    ring: "ring-chart-3",
    taskBorder: "border-l-chart-3",
    glow: "shadow-[0_0_30px_rgba(var(--chart-3),0.3)]",
    intense: "bg-chart-3/15 border-chart-3/40",
  },
  "chart-4": {
    border: "border-chart-4/20",
    bg: "bg-chart-4/5",
    ring: "ring-chart-4",
    taskBorder: "border-l-chart-4",
    glow: "shadow-[0_0_30px_rgba(var(--chart-4),0.3)]",
    intense: "bg-chart-4/15 border-chart-4/40",
  },
};

export default function QuadrantCard({
  quadrantId,
  title,
  subtitle,
  tasks,
  onDeleteTask,
  onToggleTask,
  onEditTask,
  isSelected,
  isDragOver = false,
  color,
  showRipple,
}: QuadrantCardProps) {
  const colors = colorClasses[color];

  const { setNodeRef } = useDroppable({
    id: `quadrant-${quadrantId}`,
  });

  return (
    <motion.div
      ref={setNodeRef}
      className={`
        relative rounded-xl border-2 p-6 h-full flex flex-col
        transition-all duration-300 overflow-hidden
        ${isDragOver ? `${colors.intense} ${colors.glow} scale-[1.02]` : `${colors.border} ${colors.bg}`}
        ${isSelected ? `${colors.ring} ring-2 shadow-lg` : ""}
      `}
      animate={{
        scale: isDragOver ? 1.02 : 1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      data-testid={`quadrant-${title.toLowerCase().replace(/\s+/g, "-")}`}
    >
      {/* Ripple effect on task drop */}
      <AnimatePresence>
        {showRipple && (
          <motion.div
            className={`absolute inset-0 ${colors.ring} rounded-xl pointer-events-none`}
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
          className={`absolute inset-0 border-2 ${colors.ring} rounded-xl pointer-events-none`}
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
        <h2 className="text-sm font-medium uppercase tracking-wide text-foreground">
          {title}
        </h2>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </div>

      <div className="space-y-2 relative z-10 overflow-y-auto flex-1 pr-2">
        {tasks.length === 0 ? (
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
              quadrantColor={colors.taskBorder}
            />
          ))
        )}
      </div>
    </motion.div>
  );
}