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
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
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
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Type a task and press Enter..."
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`h-12 text-base pr-32 ${isSelectingQuadrant ? quadrantInfo[selectedQuadrant].color : ''}`}
          data-testid="input-task"
        />
        {!taskText && !isSelectingQuadrant && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
            <kbd className="px-2 py-1 text-xs font-mono bg-muted text-muted-foreground rounded border">
              Ctrl
            </kbd>
            <span className="text-muted-foreground/50">+</span>
            <kbd className="px-2 py-1 text-xs font-mono bg-muted text-muted-foreground rounded border">
              Enter
            </kbd>
          </div>
        )}
      </div>
      
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
