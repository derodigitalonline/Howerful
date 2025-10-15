import QuadrantCard from '../QuadrantCard';

export default function QuadrantCardExample() {
  const mockTasks = [
    {
      id: '1',
      text: 'Complete urgent client presentation',
      quadrant: 'do-first' as const,
      createdAt: Date.now(),
      completed: false,
    },
    {
      id: '2',
      text: 'Fix critical production bug',
      quadrant: 'do-first' as const,
      createdAt: Date.now(),
      completed: true,
    },
  ];

  return (
    <div className="p-8 max-w-lg">
      <QuadrantCard
        title="Do First"
        subtitle="Urgent & Important"
        tasks={mockTasks}
        onDeleteTask={(id) => console.log('Delete task:', id)}
        onToggleTask={(id) => console.log('Toggle task:', id)}
        isSelected={true}
        color="chart-1"
        showRipple={false}
      />
    </div>
  );
}
