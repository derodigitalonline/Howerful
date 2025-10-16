import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useRef, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface TaskCardProps {
  id: string;
  text: string;
  completed: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: (newText: string) => void;
  quadrantColor: string;
  isDragging?: boolean;
}

export default function TaskCard({ 
  id, 
  text, 
  completed, 
  onToggle, 
  onDelete, 
  onEdit, 
  quadrantColor,
  isDragging = false
}: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const inputRef = useRef<HTMLInputElement>(null);

  const { attributes, listeners, setNodeRef, transform, isDragging: isDraggingState } = useDraggable({
    id: id,
    disabled: isEditing,
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
  } : undefined;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editText.trim()) {
      onEdit(editText.trim());
      setIsEditing(false);
    } else {
      setEditText(text);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditText(text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Don't show drag cursor when editing
  const dragListeners = isEditing ? {} : listeners;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...dragListeners}>
      <Card
        className={`
          group px-4 py-3 border-l-4 ${quadrantColor} 
          animate-in fade-in slide-in-from-top-2 duration-200
          ${isDraggingState ? 'opacity-50' : ''}
          ${isDragging ? 'shadow-2xl cursor-grabbing' : 'cursor-grab hover:shadow-md'}
          ${!isEditing ? 'active:cursor-grabbing' : ''}
          transition-shadow duration-200
        `}
        data-testid={`task-${text.slice(0, 10)}`}
        onDoubleClick={() => !isEditing && !isDragging && setIsEditing(true)}
      >
        <div className="flex items-start gap-3">
          <Checkbox
            checked={completed}
            onCheckedChange={onToggle}
            className="mt-0.5"
            data-testid="checkbox-task"
          />

          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="flex-1 text-sm bg-transparent border-b border-primary focus:outline-none"
            />
          ) : (
            <p className={`text-sm flex-1 break-words ${completed ? 'line-through text-muted-foreground' : ''}`}>
              {text}
            </p>
          )}

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
    </div>
  );
}