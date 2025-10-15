import { useState, useEffect } from 'react';
import { Quadrant } from '@shared/schema';
import { useTasks } from '@/hooks/useTasks';
import TaskInput from './TaskInput';
import QuadrantCard from './QuadrantCard';
import NavigationDrawer from './NavigationDrawer';

export default function Matrix() {
  const { getTasksByQuadrant, addTask, deleteTask, toggleTaskCompletion } = useTasks();
  const [selectedQuadrant, setSelectedQuadrant] = useState<Quadrant>('do-first');
  const [rippleQuadrant, setRippleQuadrant] = useState<Quadrant | null>(null);

  const handleAddTask = (text: string, quadrant: Quadrant) => {
    addTask(text, quadrant);
    setRippleQuadrant(quadrant);
  };

  useEffect(() => {
    if (rippleQuadrant) {
      const timer = setTimeout(() => setRippleQuadrant(null), 600);
      return () => clearTimeout(timer);
    }
  }, [rippleQuadrant]);

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
    <div className="flex h-screen">
      <NavigationDrawer />
      
      <div className="flex-1 ml-64 flex flex-col">
        <div className="flex-1 p-4 md:p-6 pb-0 overflow-hidden">
          <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-4">
            {quadrants.map((quadrant) => (
              <QuadrantCard
                key={quadrant.id}
                title={quadrant.title}
                subtitle={quadrant.subtitle}
                tasks={getTasksByQuadrant(quadrant.id)}
                onDeleteTask={deleteTask}
                onToggleTask={toggleTaskCompletion}
                isSelected={selectedQuadrant === quadrant.id}
                color={quadrant.color}
                showRipple={rippleQuadrant === quadrant.id}
              />
            ))}
          </div>
        </div>

        <div className="border-t p-4 md:p-6 bg-background">
          <TaskInput
            onAddTask={handleAddTask}
            selectedQuadrant={selectedQuadrant}
            onQuadrantChange={setSelectedQuadrant}
          />
        </div>
      </div>
    </div>
  );
}
