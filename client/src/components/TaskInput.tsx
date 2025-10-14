import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { Quadrant } from '@shared/schema';

interface TaskInputProps {
  onAddTask: (text: string, quadrant: Quadrant) => void;
  selectedQuadrant: Quadrant;
  onQuadrantChange: (quadrant: Quadrant) => void;
}

const quadrantInfo = {
  'do-first': { name: 'Do First', color: 'ring-chart-1' },
  'schedule': { name: 'Schedule', color: 'ring-chart-2' },
  'delegate': { name: 'Delegate', color: 'ring-chart-3' },
  'eliminate': { name: 'Eliminate', color: 'ring-chart-4' },
};

export default function TaskInput({
  onAddTask,
  selectedQuadrant,
  onQuadrantChange,
}: TaskInputProps) {
  const [taskText, setTaskText] = useState('');
  const [isSelectingQuadrant, setIsSelectingQuadrant] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isSelectingQuadrant && e.key === 'Enter' && taskText.trim()) {
      setIsSelectingQuadrant(true);
      e.preventDefault();
      return;
    }

    if (isSelectingQuadrant) {
      const quadrantMap: Record<string, Quadrant> = {
        'ArrowLeft': selectedQuadrant === 'schedule' ? 'do-first' : selectedQuadrant === 'eliminate' ? 'delegate' : selectedQuadrant,
        'ArrowRight': selectedQuadrant === 'do-first' ? 'schedule' : selectedQuadrant === 'delegate' ? 'eliminate' : selectedQuadrant,
        'ArrowUp': selectedQuadrant === 'delegate' ? 'do-first' : selectedQuadrant === 'eliminate' ? 'schedule' : selectedQuadrant,
        'ArrowDown': selectedQuadrant === 'do-first' ? 'delegate' : selectedQuadrant === 'schedule' ? 'eliminate' : selectedQuadrant,
      };

      if (e.key in quadrantMap) {
        onQuadrantChange(quadrantMap[e.key]);
        e.preventDefault();
      } else if (e.key === 'Enter') {
        onAddTask(taskText.trim(), selectedQuadrant);
        setTaskText('');
        setIsSelectingQuadrant(false);
        e.preventDefault();
      } else if (e.key === 'Escape') {
        setIsSelectingQuadrant(false);
        e.preventDefault();
      }
    }
  };

  return (
    <div className="space-y-3">
      <Input
        ref={inputRef}
        type="text"
        placeholder="Type a task and press Enter..."
        value={taskText}
        onChange={(e) => setTaskText(e.target.value)}
        onKeyDown={handleKeyDown}
        className={`h-12 text-base ${isSelectingQuadrant ? quadrantInfo[selectedQuadrant].color : ''}`}
        data-testid="input-task"
      />
      
      {isSelectingQuadrant ? (
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Use arrow keys to select quadrant: <span className="font-medium text-foreground">{quadrantInfo[selectedQuadrant].name}</span>
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ArrowUp className="h-3 w-3" />
            <ArrowDown className="h-3 w-3" />
            <ArrowLeft className="h-3 w-3" />
            <ArrowRight className="h-3 w-3" />
            <span>to navigate</span>
            <span className="mx-2">•</span>
            <span>Enter to confirm</span>
            <span className="mx-2">•</span>
            <span>Esc to cancel</span>
          </div>
        </div>
      ) : (
        <p className="text-center text-xs text-muted-foreground/60">
          Press Enter to start selecting a quadrant
        </p>
      )}
    </div>
  );
}
