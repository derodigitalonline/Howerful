import { useState } from 'react';
import { Quadrant } from '@shared/schema';
import { useTasks } from '@/hooks/useTasks';
import TaskInput from './TaskInput';
import QuadrantCard from './QuadrantCard';
import { Grid2X2 } from 'lucide-react';

export default function Matrix() {
  const { getTasksByQuadrant, addTask, deleteTask } = useTasks();
  const [selectedQuadrant, setSelectedQuadrant] = useState<Quadrant>('do-first');

  const quadrants = [
    {
      id: 'do-first' as Quadrant,
      title: 'Do First',
      subtitle: 'Urgent & Important',
      color: 'chart-1' as const,
    },
    {
      id: 'schedule' as Quadrant,
      title: 'Schedule',
      subtitle: 'Not Urgent & Important',
      color: 'chart-2' as const,
    },
    {
      id: 'delegate' as Quadrant,
      title: 'Delegate',
      subtitle: 'Urgent & Not Important',
      color: 'chart-3' as const,
    },
    {
      id: 'eliminate' as Quadrant,
      title: 'Eliminate',
      subtitle: 'Not Urgent & Not Important',
      color: 'chart-4' as const,
    },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <Grid2X2 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-semibold">Eisenhower Matrix</h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Prioritize your tasks by urgency and importance. Type a task, press Enter, use arrow keys to select a quadrant, and press Enter again to add it.
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          <TaskInput
            onAddTask={addTask}
            selectedQuadrant={selectedQuadrant}
            onQuadrantChange={setSelectedQuadrant}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quadrants.map((quadrant) => (
            <QuadrantCard
              key={quadrant.id}
              title={quadrant.title}
              subtitle={quadrant.subtitle}
              tasks={getTasksByQuadrant(quadrant.id)}
              onDeleteTask={deleteTask}
              isSelected={selectedQuadrant === quadrant.id}
              color={quadrant.color}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
