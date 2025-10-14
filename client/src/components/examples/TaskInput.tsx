import { useState } from 'react';
import TaskInput from '../TaskInput';
import { Quadrant } from '@shared/schema';

export default function TaskInputExample() {
  const [selectedQuadrant, setSelectedQuadrant] = useState<Quadrant>('do-first');

  return (
    <div className="p-8 max-w-2xl">
      <TaskInput
        onAddTask={(text, quadrant) => console.log('Add task:', text, 'to', quadrant)}
        selectedQuadrant={selectedQuadrant}
        onQuadrantChange={setSelectedQuadrant}
      />
    </div>
  );
}
