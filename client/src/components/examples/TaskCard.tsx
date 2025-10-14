import TaskCard from '../TaskCard';

export default function TaskCardExample() {
  return (
    <div className="p-8 max-w-md">
      <TaskCard 
        text="Review project proposal and send feedback to team"
        onDelete={() => console.log('Delete clicked')}
        quadrantColor="border-l-chart-1"
      />
    </div>
  );
}
