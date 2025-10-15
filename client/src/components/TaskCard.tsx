import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface TaskCardProps {
  text: string;
  completed: boolean;
  onToggle: () => void;
  onDelete: () => void;
  quadrantColor: string;
}

export default function TaskCard({ text, completed, onToggle, onDelete, quadrantColor }: TaskCardProps) {
  return (
    <Card 
      className={`group px-4 py-3 border-l-4 ${quadrantColor} animate-in fade-in slide-in-from-top-2 duration-200`}
      data-testid={`task-${text.slice(0, 10)}`}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={completed}
          onCheckedChange={onToggle}
          className="mt-0.5"
          data-testid="checkbox-task"
        />
        <p className={`text-sm flex-1 break-words ${completed ? 'line-through text-muted-foreground' : ''}`}>
          {text}
        </p>
        <Button
          size="icon"
          variant="ghost"
          onClick={onDelete}
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          data-testid="button-delete-task"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </Card>
  );
}
