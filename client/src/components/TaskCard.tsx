import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useRef, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import ParticleBurst from './ParticleBurst';
import FloatingXP from './FloatingXP';

interface TaskCardProps {
  id: string;
  text: string;
  completed: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: (newText: string) => void;
  quadrantColor: string;
  isDragging?: boolean;
  xpAmount?: number;
  particleColor?: string;
}

export default function TaskCard({
  id,
  text,
  completed,
  onToggle,
  onDelete,
  onEdit,
  quadrantColor,
  isDragging = false,
  xpAmount = 0,
  particleColor = 'hsl(var(--success))'
}: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const inputRef = useRef<HTMLInputElement>(null);
  const checkboxRef = useRef<HTMLButtonElement>(null);

  // Animation states
  const [showParticles, setShowParticles] = useState(false);
  const [showFloatingXP, setShowFloatingXP] = useState(false);
  const [particlePosition, setParticlePosition] = useState({ x: 0, y: 0 });

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

  const handleToggleWithEffects = () => {
    // Get checkbox position for effects
    if (checkboxRef.current && !completed && xpAmount > 0) {
      const rect = checkboxRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      setParticlePosition({ x: centerX, y: centerY });
      setShowParticles(true);
      setShowFloatingXP(true);

      // Reset animations after they complete
      setTimeout(() => setShowParticles(false), 800);
      setTimeout(() => setShowFloatingXP(false), 1600);
    }

    onToggle();
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
            ref={checkboxRef}
            checked={completed}
            onCheckedChange={handleToggleWithEffects}
            className="w-5 h-5 mt-0.5"
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
            <p className={`text-m flex-1 break-words ${completed ? 'line-through text-muted-foreground' : ''}`}>
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

      {/* Visual Effects */}
      {showParticles && (
        <ParticleBurst
          x={particlePosition.x}
          y={particlePosition.y}
          color={particleColor}
          particleCount={15}
        />
      )}

      {showFloatingXP && xpAmount > 0 && (
        <FloatingXP
          x={particlePosition.x}
          y={particlePosition.y}
          amount={xpAmount}
          color={particleColor}
        />
      )}
    </div>
  );
}