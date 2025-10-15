import { useState } from 'react';
import TaskCard from '../TaskCard';

export default function TaskCardExample() {
  const [completed, setCompleted] = useState(false);

  return (
    <div className="p-8 max-w-md">
      <TaskCard 
        text="Review project proposal and send feedback to team"
        completed={completed}
        onToggle={() => setCompleted(!completed)}
        onDelete={() => console.log('Delete clicked')}
        quadrantColor="border-l-chart-1"
      />
    </div>
  );
}
