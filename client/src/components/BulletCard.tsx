import { BulletItem } from '@shared/schema';
import { CheckSquare, Clock, Trash2, Timer, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTime12Hour } from '@/lib/formatTime';
import { useState } from 'react';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';

interface BulletCardProps {
  item: BulletItem;
  onToggleComplete: (id: string) => void;
  onClick: (id: string) => void;
  onArchive?: (id: string) => void;
  onStartFocus?: (id: string, text: string) => void;
  onMarkAsVIT?: (id: string) => void;
  isDragging?: boolean;
}

export default function BulletCard({
  item,
  onToggleComplete,
  onClick,
  onArchive,
  onStartFocus,
  onMarkAsVIT,
  isDragging,
}: BulletCardProps) {
  const isCompleted = item.completed;
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);

  return (
    <ContextMenu onOpenChange={setIsContextMenuOpen}>
      <ContextMenuTrigger asChild>
        <div
          className={cn(
            "bullet-card group relative bg-card border border-border rounded-xl p-4 transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5",
            "w-full",
            isDragging && "opacity-50 scale-95",
            isCompleted && "opacity-60",
            isContextMenuOpen && "ring-2 ring-primary shadow-md"
          )}
          onClick={() => onClick(item.id)}
        >
      {/* Type Indicator & Content */}
      <div className="flex items-start gap-3">
        {/* Type Icon - Clickable checkbox for tasks */}
        <div className="flex-shrink-0 mt-0.5">
          <div
            className={cn(
              "w-5 h-5 border-2 flex items-center justify-center transition-colors cursor-pointer rounded",
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

          {/* Time Badge - For tasks with specific times */}
          {item.time && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span className="font-mono">{formatTime12Hour(item.time)}</span>
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

      {/* Trash Icon - Bottom Center - Shows on hover for completed items */}
      {isCompleted && onArchive && (
        <button
          className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-all duration-150 text-muted-foreground hover:text-destructive p-2 rounded-md bg-card hover:bg-red-50 dark:hover:bg-red-950/30 border border-border hover:border-destructive/50"
          onClick={(e) => {
            e.stopPropagation();
            onArchive(item.id);
          }}
          title="Archive task (removed after 30 days)"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      )}
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-48">
        {onStartFocus && (
          <>
            <ContextMenuItem
              onSelect={() => onStartFocus(item.id, item.text)}
              className="flex items-center text-primary focus:text-primary"
            >
              <Timer className="w-4 h-4 mr-2" />
              Start Focus Session
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}

        {onMarkAsVIT && !item.completed && (
          <>
            <ContextMenuItem
              onSelect={() => onMarkAsVIT(item.id)}
              className="flex items-center text-amber-600 dark:text-amber-400 font-medium focus:text-amber-600 dark:focus:text-amber-400"
            >
              <Star className="w-4 h-4 mr-2 fill-amber-500" />
              Mark as VIT
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}

        {onArchive && (
          <ContextMenuItem
            onSelect={() => onArchive(item.id)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Archive
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
