import { BulletItem } from '@shared/schema';
import { CheckSquare, Circle, Clock, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BulletCardProps {
  item: BulletItem;
  onToggleComplete: (id: string) => void;
  onClick: (id: string) => void;
  isDragging?: boolean;
  dragHandleProps?: any;
}

export default function BulletCard({
  item,
  onToggleComplete,
  onClick,
  isDragging,
  dragHandleProps,
}: BulletCardProps) {
  const isTask = item.type === 'task';
  const isEvent = item.type === 'event';
  const isCompleted = item.completed;

  return (
    <div
      className={cn(
        "bullet-card group relative bg-card border border-border rounded-xl p-4 transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5",
        "max-w-[320px] w-full",
        isDragging && "opacity-50 scale-95",
        isCompleted && "opacity-60"
      )}
      onClick={() => onClick(item.id)}
    >
      {/* Drag Handle - Top Left */}
      <div
        {...dragHandleProps}
        className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Type Indicator & Content */}
      <div className="flex items-start gap-3 pl-6">
        {/* Type Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {isTask ? (
            <div
              className={cn(
                "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                isCompleted
                  ? "bg-primary border-primary text-primary-foreground"
                  : "border-muted-foreground hover:border-primary"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete(item.id);
              }}
            >
              {isCompleted && <CheckSquare className="w-3 h-3" />}
            </div>
          ) : (
            <Circle className="w-5 h-5 text-muted-foreground" />
          )}
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-sm break-words",
              isCompleted && "line-through text-muted-foreground"
            )}
          >
            {item.text}
          </p>

          {/* Time Badge - For Events */}
          {isEvent && item.time && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span className="font-mono">{item.time}</span>
            </div>
          )}
        </div>
      </div>

      {/* Floating DONE Button - Shows on hover for incomplete tasks */}
      {isTask && !isCompleted && (
        <Button
          size="sm"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(item.id);
          }}
        >
          DONE
        </Button>
      )}
    </div>
  );
}
