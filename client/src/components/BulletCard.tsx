import { BulletItem } from '@shared/schema';
import { CheckSquare, Circle, Clock, GripVertical } from 'lucide-react';
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
        "w-full",
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
        {/* Type Icon - Clickable for both tasks and events */}
        <div className="flex-shrink-0 mt-0.5">
          <div
            className={cn(
              "w-5 h-5 border-2 flex items-center justify-center transition-colors cursor-pointer",
              isEvent ? "rounded-full" : "rounded",
              isCompleted
                ? "bg-primary border-primary text-primary-foreground"
                : "border-muted-foreground hover:border-primary"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete(item.id);
            }}
          >
            {isCompleted && (
              <CheckSquare className="w-3 h-3" />
            )}
          </div>
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

      {/* Compact 3D DONE Button - Bottom Right - Shows on hover for incomplete items */}
      {!isCompleted && (
        <button
          className="absolute bottom-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-150 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1.5 rounded-md shadow-[0_3px_0_0_rgba(0,0,0,0.15)] hover:shadow-[0_4px_0_0_rgba(0,0,0,0.15)] hover:-translate-y-[1px] active:shadow-[0_1px_0_0_rgba(0,0,0,0.15)] active:translate-y-[2px]"
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(item.id);
          }}
        >
          DONE
        </button>
      )}
    </div>
  );
}
