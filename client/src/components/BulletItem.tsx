import { useState } from 'react';
import { BulletItem as BulletItemType, BulletItemType as ItemType, Bucket, BulletItemType as BulletType } from '@shared/schema';
import { Circle, Minus, X, Clock, GripVertical, ArrowRight, FastForward, ArrowLeft, CheckSquare, Check, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { formatTime12Hour } from '@/lib/formatTime';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { getRelativeTime } from '@/utils/relativeTime';

interface BulletItemProps {
  item: BulletItemType;
  currentBucket?: Bucket;
  onToggleComplete: (id: string) => void;
  onCycleType: (id: string) => void;
  onChangeType?: (id: string, type: BulletType) => void;
  onUpdate: (id: string, text: string, time?: string) => void;
  onDelete: (id: string) => void;
  onMoveToBucket?: (id: string, bucket: Bucket) => void;
  onStartFocus?: (id: string, text: string) => void;
  isOver?: boolean;
  isDragging?: boolean;
}

export default function BulletItem({
  item,
  currentBucket,
  onToggleComplete,
  onCycleType,
  onChangeType,
  onUpdate,
  onDelete,
  onMoveToBucket,
  onStartFocus,
  isOver = false,
  isDragging: isDraggingProp = false,
}: DailySpreadItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);
  const [editTime, setEditTime] = useState(item.time || '');
  const [showEventTimeDialog, setShowEventTimeDialog] = useState(false);
  const [pendingEventTime, setPendingEventTime] = useState('');
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);

  const handleSave = () => {
    if (editText.trim()) {
      onUpdate(item.id, editText.trim(), item.type === 'event' ? editTime : undefined);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditText(item.text);
      setEditTime(item.time || '');
      setIsEditing(false);
    }
  };

  const getSignifierIcon = () => {
    switch (item.type) {
      case 'task':
        return (
          <Checkbox
            checked={item.completed}
            onCheckedChange={(checked) => {
              onToggleComplete(item.id);
            }}
            onClick={(e) => e.stopPropagation()}
            className="h-[18px] w-[18px]"
          />
        );
      case 'event':
        return (
          <Circle
            className="w-5 h-5 text-muted-foreground"
          />
        );
      case 'note':
        return (
          <Minus
            className="w-5 h-5 text-muted-foreground"
          />
        );
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 p-4 bg-card border shadow-sm rounded-lg">
        <div className="w-5 h-5" /> {/* Spacer for alignment */}
        <div className="flex-1 flex gap-2">
          <Input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
            autoFocus
            placeholder="Enter item text..."
          />
          {item.type === 'event' && (
            <Input
              type="time"
              value={editTime}
              onChange={(e) => setEditTime(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-32"
              placeholder="Time"
            />
          )}
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={handleSave}>
            <Check className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setEditText(item.text);
              setEditTime(item.time || '');
              setIsEditing(false);
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div className="relative">
      {/* Drop Indicator - shown when hovering over this item during drag */}
      {isOver && (
        <div className="absolute -top-2 left-0 right-0 h-1 bg-primary/30 rounded-full z-10" />
      )}

      <ContextMenu onOpenChange={setIsContextMenuOpen}>
        <ContextMenuTrigger asChild>
          <motion.div
        ref={setNodeRef}
        style={style}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn(
          "group flex items-center gap-3 p-4 rounded-lg transition-all relative bg-card border shadow-sm hover:shadow-md",
          item.completed && item.type === 'task' && "opacity-60",
          isDragging && "opacity-50 shadow-lg scale-105",
          isOver && "ring-2 ring-primary/20",
          isContextMenuOpen && "ring-2 ring-primary shadow-md"
        )}
      >
      {/* Drag Handle - collapses when hidden, slides content to reveal on hover */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-all duration-200 ease-out opacity-0 group-hover:opacity-100 w-0 group-hover:w-4 -mr-3 group-hover:mr-0 overflow-hidden"
      >
        <GripVertical className="w-4 h-4 flex-shrink-0" />
      </div>

      {/* Signifier - visual indicator of bullet type */}
      <div className="flex-shrink-0 flex items-center justify-center h-5 w-5">
        {getSignifierIcon()}
      </div>

      {/* Content */}
      <div
        className="flex-1 cursor-pointer select-none"
        onClick={() => setIsEditing(true)}
      >
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-sm",
                item.completed && item.type === 'task' && "line-through"
              )}
            >
              {item.text}
            </span>
            {item.type === 'event' && item.time && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {formatTime12Hour(item.time)}
              </span>
            )}
          </div>

          {/* Someday Metadata - show when item was moved to backlog */}
          {currentBucket === 'someday' && item.movedToSomedayAt && (
            <span className="text-xs text-muted-foreground/70">
              Added to backlog {getRelativeTime(item.movedToSomedayAt)}
            </span>
          )}
        </div>
      </div>

      {/* Quick Action Chips - shown on hover */}
      {onMoveToBucket && currentBucket && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Show different chips based on current bucket */}
          {currentBucket === 'today' && (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs gap-1 hover:bg-primary/10 hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveToBucket(item.id, 'tomorrow');
                }}
                title="Move to Tomorrow"
              >
                <ArrowRight className="w-3 h-3" />
                <span>Tomorrow</span>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs gap-1 hover:bg-muted-foreground/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveToBucket(item.id, 'someday');
                }}
                title="Move to Someday"
              >
                <FastForward className="w-3 h-3" />
                <span>Someday</span>
              </Button>
            </>
          )}

          {currentBucket === 'tomorrow' && (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs gap-1 hover:bg-primary/10 hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveToBucket(item.id, 'today');
                }}
                title="Move to Today"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Today</span>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs gap-1 hover:bg-muted-foreground/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveToBucket(item.id, 'someday');
                }}
                title="Move to Someday"
              >
                <FastForward className="w-3 h-3" />
                <span>Someday</span>
              </Button>
            </>
          )}

          {currentBucket === 'someday' && (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs gap-1 hover:bg-primary/10 hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveToBucket(item.id, 'today');
                }}
                title="Move to Today"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Today</span>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs gap-1 hover:bg-primary/10 hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveToBucket(item.id, 'tomorrow');
                }}
                title="Move to Tomorrow"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Tomorrow</span>
              </Button>
            </>
          )}
        </div>
      )}

      {/* Delete button - shown on hover */}
      <Button
        size="sm"
        variant="ghost"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onDelete(item.id)}
      >
        <X className="w-4 h-4" />
      </Button>
    </motion.div>
        </ContextMenuTrigger>

        {/* Context Menu Content */}
        {onChangeType && (
          <ContextMenuContent className="w-48">
            <ContextMenuItem
              disabled={item.type === 'task'}
              onSelect={() => onChangeType(item.id, 'task')}
              className="flex items-center"
            >
              <div className="w-4 h-4 mr-2">
                {item.type === 'task' && <Check className="w-4 h-4" />}
              </div>
              <CheckSquare className="w-4 h-4 mr-2" />
              Change to Task
            </ContextMenuItem>

            <ContextMenuItem
              disabled={item.type === 'event'}
              onSelect={() => {
                setPendingEventTime('');
                setShowEventTimeDialog(true);
              }}
              className="flex items-center"
            >
              <div className="w-4 h-4 mr-2">
                {item.type === 'event' && <Check className="w-4 h-4" />}
              </div>
              <Circle className="w-4 h-4 mr-2" />
              Change to Event
            </ContextMenuItem>

            <ContextMenuItem
              disabled={item.type === 'note'}
              onSelect={() => onChangeType(item.id, 'note')}
              className="flex items-center"
            >
              <div className="w-4 h-4 mr-2">
                {item.type === 'note' && <Check className="w-4 h-4" />}
              </div>
              <Minus className="w-4 h-4 mr-2" />
              Change to Note
            </ContextMenuItem>

            <ContextMenuSeparator />

            {onStartFocus && (
              <ContextMenuItem
                onSelect={() => onStartFocus(item.id, item.text)}
                className="flex items-center text-primary focus:text-primary"
              >
                <Timer className="w-4 h-4 mr-2" />
                Start Focus Session
              </ContextMenuItem>
            )}

            <ContextMenuSeparator />

            <ContextMenuItem
              onSelect={() => onDelete(item.id)}
              className="text-destructive focus:text-destructive"
            >
              <X className="w-4 h-4 mr-2" />
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        )}
      </ContextMenu>

      {/* Event Time Prompt Dialog */}
      <Dialog open={showEventTimeDialog} onOpenChange={setShowEventTimeDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Set Event Time</DialogTitle>
            <DialogDescription>
              Events work best with a time. When should this happen?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Input
                type="time"
                value={pendingEventTime}
                onChange={(e) => setPendingEventTime(e.target.value)}
                className="w-full"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEventTimeDialog(false);
                setPendingEventTime('');
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={!pendingEventTime}
              onClick={() => {
                if (onChangeType && pendingEventTime) {
                  onChangeType(item.id, 'event');
                  onUpdate(item.id, item.text, pendingEventTime);
                  setShowEventTimeDialog(false);
                  setPendingEventTime('');
                }
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
