import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Quadrant } from '@shared/schema';
import { useTasks } from '@/hooks/useTasks';
import TaskInput from './TaskInput';
import QuadrantCard from './QuadrantCard';
import NavigationDrawer from './NavigationDrawer';
import TaskCard from './TaskCard';
import { motion } from 'framer-motion';

export default function Matrix() {
  const { getTasksByQuadrant, addTask, deleteTask, toggleTaskCompletion, editTask, moveTask } = useTasks();
  const [selectedQuadrant, setSelectedQuadrant] = useState<Quadrant>('do-first');
  const [rippleQuadrant, setRippleQuadrant] = useState<Quadrant | null>(null);
  const [activeTask, setActiveTask] = useState<any>(null);
  const [dragOverQuadrant, setDragOverQuadrant] = useState<Quadrant | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleAddTask = (text: string, quadrant: Quadrant) => {
    addTask(text, quadrant);
    setRippleQuadrant(quadrant);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = event.active.id as string;
    const allTasks = [
      ...getTasksByQuadrant('do-first'),
      ...getTasksByQuadrant('schedule'),
      ...getTasksByQuadrant('delegate'),
      ...getTasksByQuadrant('eliminate'),
    ];
    const task = allTasks.find(t => t.id === taskId);
    setActiveTask(task);
  };

  const handleDragOver = (event: any) => {
    const overId = event.over?.id;
    if (overId && typeof overId === 'string' && overId.startsWith('quadrant-')) {
      const quadrant = overId.replace('quadrant-', '') as Quadrant;
      setDragOverQuadrant(quadrant);
    } else {
      setDragOverQuadrant(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && typeof over.id === 'string' && over.id.startsWith('quadrant-')) {
      const targetQuadrant = over.id.replace('quadrant-', '') as Quadrant;
      const taskId = active.id as string;

      moveTask(taskId, targetQuadrant);
      setRippleQuadrant(targetQuadrant);
    }

    setActiveTask(null);
    setDragOverQuadrant(null);
  };

  const handleDragCancel = () => {
    setActiveTask(null);
    setDragOverQuadrant(null);
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
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex h-screen">
        <NavigationDrawer />

        <div className="flex-1 ml-64 flex flex-col">
          <div className="flex-1 p-4 md:p-6 pb-0 overflow-hidden">
            <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-4">
              {quadrants.map((quadrant) => (
                <QuadrantCard
                  key={quadrant.id}
                  quadrantId={quadrant.id}
                  title={quadrant.title}
                  subtitle={quadrant.subtitle}
                  tasks={getTasksByQuadrant(quadrant.id)}
                  onDeleteTask={deleteTask}
                  onToggleTask={toggleTaskCompletion}
                  onEditTask={editTask}
                  isSelected={selectedQuadrant === quadrant.id}
                  isDragOver={dragOverQuadrant === quadrant.id}
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

      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <motion.div
            initial={{ scale: 1, rotate: 0 }}
            animate={{ 
              scale: 1.05, 
              rotate: 3,
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <TaskCard
              id={activeTask.id}
              text={activeTask.text}
              completed={activeTask.completed}
              onToggle={() => {}}
              onDelete={() => {}}
              onEdit={() => {}}
              quadrantColor="border-l-primary"
              isDragging={true}
            />
          </motion.div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}