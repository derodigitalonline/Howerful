import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Quadrant, XP_REWARDS } from '@shared/schema';
import { useTasks } from '@/hooks/useTasks';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';
import TaskInput from './TaskInput';
import QuadrantCard from './QuadrantCard';
import NavigationDrawer from './NavigationDrawer';
import TaskCard from './TaskCard';
import KeyboardShortcutsDialog from './KeyboardShortcutsDialog';
import { motion } from 'framer-motion';

export default function Matrix() {
  const { getTasksByQuadrant, addTask, deleteTask, toggleTaskCompletion, editTask, moveTask, tasks } = useTasks();
  const { awardXP, deductXP } = useProfile();
  const [selectedQuadrant, setSelectedQuadrant] = useState<Quadrant>('do-first');
  const [rippleQuadrant, setRippleQuadrant] = useState<Quadrant | null>(null);
  const [activeTask, setActiveTask] = useState<any>(null);
  const [dragOverQuadrant, setDragOverQuadrant] = useState<Quadrant | null>(null);
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);

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

  const handleToggleTask = (id: string) => {
    toggleTaskCompletion(
      id,
      (quadrant) => {
        // Award XP when completing
        const result = awardXP(quadrant);

        if (result.leveledUp) {
          // Level up toast with celebration
          toast.success(`🎉 Level Up! You're now level ${result.newLevel}!`, {
            description: `+${result.xpGained} XP earned`,
            duration: 5000,
          });
        } else {
          // Regular XP gain toast
          toast.success(`+${result.xpGained} XP`, {
            description: `Task completed in ${quadrant.replace('-', ' ')}`,
            duration: 2000,
          });
        }
      },
      (quadrant) => {
        // Deduct XP when uncompleting
        deductXP(quadrant);
        toast.info(`-${XP_REWARDS[quadrant]} XP`, {
          description: 'Task uncompleted',
          duration: 2000,
        });
      }
    );
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

      // Find the task to check if it's completed and moving between quadrants
      const task = tasks.find(t => t.id === taskId);
      if (task && task.completed && task.completedInQuadrant && task.completedInQuadrant !== targetQuadrant) {
        // Adjust XP: deduct old quadrant XP, award new quadrant XP
        deductXP(task.completedInQuadrant);
        awardXP(targetQuadrant);
        console.log(`XP adjusted: -${XP_REWARDS[task.completedInQuadrant]} from ${task.completedInQuadrant}, +${XP_REWARDS[targetQuadrant]} from ${targetQuadrant}`);
      }

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

  // Keyboard shortcut to open help dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for ? key or Ctrl+/
      if (e.key === '?' || (e.ctrlKey && e.key === '/')) {
        e.preventDefault();
        setShowShortcutsDialog(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
        <NavigationDrawer onHelpClick={() => setShowShortcutsDialog(true)} />

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
                  onToggleTask={handleToggleTask}
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

      <KeyboardShortcutsDialog
        open={showShortcutsDialog}
        onOpenChange={setShowShortcutsDialog}
      />
    </DndContext>
  );
}