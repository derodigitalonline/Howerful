import { BulletItem } from '@shared/schema';
import { CheckSquare, Clock, Trash2, Timer, Star, Play } from 'lucide-react';
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
            "bullet-card group relative bg-card border border-[hsl(var(--navy-border))] rounded-lg overflow-hidden transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5",
            "w-full flex flex-col",
            isDragging && "opacity-50 scale-95",
            isCompleted && "opacity-60",
            isContextMenuOpen && "ring-2 ring-primary shadow-md"
          )}
          onClick={() => onClick(item.id)}
        >
          {/* Task Content */}
          <div className="p-4">
            <p
              className={cn(
                "text-sm break-words",
                isCompleted && "line-through text-muted-foreground"
              )}
            >
              {item.text}
            </p>
          </div>

          {/* Action Buttons Row */}
          {!isCompleted && (
            <div className="flex items-center gap-2 px-2.5 pb-2.5">
              {/* COMPLETE Button - Takes most space (Stroked Primary) */}
              <button
                className="flex-1 bg-card border border-[hsl(var(--navy-border))] text-primary text-xs font-bold uppercase px-4 py-2 rounded-md shadow-[2px_2px_0_0_rgba(0,0,0,0.15)] transition-all duration-150 hover:shadow-[1px_1px_0_0_rgba(0,0,0,0.15)] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleComplete(item.id);
                }}
              >
                Complete
              </button>

              {/* Play/Focus Button - Small button (Stroked Navy) */}
              {onStartFocus && (
                <button
                  className="flex-shrink-0 bg-card border border-[hsl(var(--navy-border))] text-[hsl(var(--navy))] p-2 rounded-md shadow-[2px_2px_0_0_rgba(0,0,0,0.15)] transition-all duration-150 hover:shadow-[1px_1px_0_0_rgba(0,0,0,0.15)] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartFocus(item.id, item.text);
                  }}
                  title="Start focus session"
                >
                  <Play className="w-4 h-4 fill-[hsl(var(--navy))]" />
                </button>
              )}

              {/* Trash/Archive Button (Stroked Danger) */}
              {onArchive && (
                <button
                  className="flex-shrink-0 bg-card border border-[hsl(var(--navy-border))] text-[#FF383C] p-2 rounded-md shadow-[2px_2px_0_0_rgba(0,0,0,0.15)] transition-all duration-150 hover:shadow-[1px_1px_0_0_rgba(0,0,0,0.15)] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive(item.id);
                  }}
                  title="Archive task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Trash Icon for completed items */}
          {isCompleted && onArchive && (
            <div className="px-3 pb-3">
              <button
                className="w-full text-muted-foreground hover:text-destructive py-2 rounded-md transition-all duration-150 hover:bg-red-50 dark:hover:bg-red-950/30 border border-[hsl(var(--navy-border))] hover:border-destructive/50 flex items-center justify-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive(item.id);
                }}
                title="Archive task (removed after 30 days)"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-xs font-medium">Archive</span>
              </button>
            </div>
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
