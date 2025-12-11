import { forwardRef, useState, useRef, useImperativeHandle } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface SlashInputRef {
  focus: () => void;
}

interface TaskInputProps {
  onAddItem: (text: string, time?: string) => void;
  placeholder?: string;
}

const TaskInput = forwardRef<SlashInputRef, TaskInputProps>(
  ({ onAddItem, placeholder = "Dump your thoughts here... 'Potion brewing at 5, slay the laundry dragon, buy mana crystals'" }, ref) => {
    const [text, setText] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Expose focus method to parent via ref
    useImperativeHandle(ref, () => ({
      focus: () => {
        textareaRef.current?.focus();
      },
    }));

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    };

    const handleSubmit = () => {
      const trimmedText = text.trim();
      if (!trimmedText) return;

      // Split by line breaks to create multiple tasks
      const tasks = trimmedText.split('\n').filter(line => line.trim());

      // Add each task separately
      tasks.forEach(task => {
        onAddItem(task.trim());
      });

      // Reset state
      setText('');
    };

    const hasContent = text.trim().length > 0;

    return (
      <div className="w-full mb-8">
        {/* Main Container */}
        <div className="relative bg-card border-2 border-[hsl(var(--navy-border))] rounded-xl overflow-hidden shadow-lg">
          {/* Header */}
          <div className="px-4 pt-4 pb-3">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
              ENTER TASKS
            </h2>
          </div>

          {/* Textarea */}
          <div className="px-4 pb-3">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={cn(
                "w-full bg-transparent border-none outline-none resize-none",
                "text-foreground placeholder:text-muted-foreground",
                "text-sm leading-relaxed",
                "min-h-[80px] max-h-[120px]", // 4 lines approx, then scroll
                "scrollbar-thin scrollbar-thumb-[hsl(var(--navy-border))] scrollbar-track-transparent"
              )}
              rows={4}
            />
          </div>

          {/* Footer */}
          <div className="px-4 pb-4 flex items-center justify-between">
            {/* Keyboard Hints - Left */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-background/50 rounded text-[10px] font-mono border border-border">
                  SHIFT+ENTER
                </kbd>
                <span>new task</span>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-background/50 rounded text-[10px] font-mono border border-border">
                  ENTER
                </kbd>
                <span>submit</span>
              </div>
            </div>

            {/* Submit Button - Right */}
            <Button
              onClick={handleSubmit}
              disabled={!hasContent}
              variant="arcade"
              className="font-arcade text-xs px-5 py-2"
            >
              Log Tasks
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

TaskInput.displayName = 'TaskInput';

export default TaskInput;
