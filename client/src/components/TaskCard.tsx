import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface TaskCardProps {
  text: string;
  onDelete: () => void;
  quadrantColor: string;
}

export default function TaskCard({ text, onDelete, quadrantColor }: TaskCardProps) {
  return (
    <Card 
      className={`group relative px-4 py-3 border-l-4 ${quadrantColor}`}
      data-testid={`task-${text.slice(0, 10)}`}
    >
      <p className="text-sm pr-6 break-words">{text}</p>
      <Button
        size="icon"
        variant="ghost"
        onClick={onDelete}
        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        data-testid="button-delete-task"
      >
        <X className="h-3 w-3" />
      </Button>
    </Card>
  );
}
