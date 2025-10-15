import { Task } from '@shared/schema';
import TaskCard from './TaskCard';

interface QuadrantCardProps {
  title: string;
  subtitle: string;
  tasks: Task[];
  onDeleteTask: (id: string) => void;
  onToggleTask: (id: string) => void;
  isSelected: boolean;
  color: 'chart-1' | 'chart-2' | 'chart-3' | 'chart-4';
  showRipple: boolean;
}

const colorClasses = {
  'chart-1': {
    border: 'border-chart-1/20',
    bg: 'bg-chart-1/5',
    ring: 'ring-chart-1',
    taskBorder: 'border-l-chart-1',
  },
  'chart-2': {
    border: 'border-chart-2/20',
    bg: 'bg-chart-2/5',
    ring: 'ring-chart-2',
    taskBorder: 'border-l-chart-2',
  },
  'chart-3': {
    border: 'border-chart-3/20',
    bg: 'bg-chart-3/5',
    ring: 'ring-chart-3',
    taskBorder: 'border-l-chart-3',
  },
  'chart-4': {
    border: 'border-chart-4/20',
    bg: 'bg-chart-4/5',
    ring: 'ring-chart-4',
    taskBorder: 'border-l-chart-4',
  },
};

export default function QuadrantCard({
  title,
  subtitle,
  tasks,
  onDeleteTask,
  onToggleTask,
  isSelected,
  color,
  showRipple,
}: QuadrantCardProps) {
  const colors = colorClasses[color];

  return (
    <div
      className={`
        relative rounded-xl border-2 ${colors.border} ${colors.bg} p-6 min-h-[400px]
        transition-all duration-200 overflow-hidden
        ${isSelected ? `${colors.ring} ring-2 shadow-lg` : ''}
      `}
      data-testid={`quadrant-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {showRipple && (
        <div className={`absolute inset-0 ${colors.ring} animate-ping opacity-75 rounded-xl pointer-events-none`} />
      )}
      <div className="mb-4 relative z-10">
        <h2 className="text-sm font-medium uppercase tracking-wide text-foreground">
          {title}
        </h2>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </div>
      <div className="space-y-2 relative z-10">
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground/60 text-sm">
            No tasks yet
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              text={task.text}
              completed={task.completed}
              onToggle={() => onToggleTask(task.id)}
              onDelete={() => onDeleteTask(task.id)}
              quadrantColor={colors.taskBorder}
            />
          ))
        )}
      </div>
    </div>
  );
}
