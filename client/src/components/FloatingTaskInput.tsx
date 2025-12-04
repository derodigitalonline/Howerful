import { forwardRef, useState, useRef, useImperativeHandle, useEffect } from 'react';
import { Plus, Sparkles, Clock, X, CornerDownLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/App';
import { Chip } from '@/components/ui/chip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface SlashInputRef {
  focus: () => void;
}

interface FloatingTaskInputProps {
  onAddItem: (text: string, time?: string) => void;
  placeholder?: string;
}

const TIME_PRESETS = [
  { label: 'Morning', value: '08:00' },
  { label: 'Afternoon', value: '12:00' },
  { label: 'Evening', value: '18:00' },
] as const;

const FloatingTaskInput = forwardRef<SlashInputRef, FloatingTaskInputProps>(
  ({ onAddItem, placeholder = "Press '/' to add task" }, ref) => {
    const { isCollapsed } = useSidebar();
    const [isFocused, setIsFocused] = useState(false);
    const [text, setText] = useState('');
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [showCustomTimePicker, setShowCustomTimePicker] = useState(false);
    const [customTime, setCustomTime] = useState('09:00');

    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Calculate center position accounting for sidebar width
    const leftOffset = isCollapsed ? 'calc(50vw + 40px)' : 'calc(50vw + 128px)';

    // Expose focus method to parent via ref
    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
        setIsFocused(true);
      },
    }));

    const handleSubmit = () => {
      const trimmedText = text.trim();
      if (!trimmedText) return;

      onAddItem(trimmedText, selectedTime || undefined);

      // Reset state
      setText('');
      setSelectedTime(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        inputRef.current?.blur();
      }
    };

    const handleTimePreset = (time: string) => {
      setSelectedTime(time);
      inputRef.current?.focus();
    };

    const handleCustomTimeClick = () => {
      setShowCustomTimePicker(true);
    };

    const handleCustomTimeSubmit = () => {
      setSelectedTime(customTime);
      setShowCustomTimePicker(false);
      inputRef.current?.focus();
    };

    const handleRemoveTime = () => {
      setSelectedTime(null);
      inputRef.current?.focus();
    };

    return (
      <>
        <div
          ref={containerRef}
          className="fixed bottom-6 -translate-x-1/2 w-[90%] max-w-[620px] z-40 transition-all duration-300"
          style={{ left: leftOffset }}
        >
          {/* Wrapper to clip overflow from animated gradients */}
          <div className="relative overflow-hidden rounded-2xl">
            {/* Animated Glow on Focus */}
            <div
              className={cn(
                "absolute -inset-0.5 rounded-2xl blur-md transition-opacity duration-500",
                isFocused ? "opacity-100" : "opacity-0"
              )}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 via-primary to-blue-600 animate-pulse" />
            </div>

            {/* Spinning conic gradient border - only when NOT focused */}
            <div
              className={cn(
                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400%] h-[400%] animate-spin transition-opacity duration-500",
                isFocused ? "opacity-0" : "opacity-100"
              )}
              style={{
                background: 'conic-gradient(from 90deg at 50% 50%, transparent 0%, transparent 50%, #3b82f6 70%, hsl(var(--primary)) 85%, #6366f1 100%)',
                animationDuration: '4s',
              }}
            />

            {/* Main Container */}
            <div className="relative m-[2px] bg-background/95 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl border border-border/50">
            {/* Input Row */}
            <div className="flex items-center px-4 py-4 gap-3">
              {/* Left Icon */}
              <div className={cn(
                "flex items-center justify-center w-5 h-5 transition-colors duration-300",
                isFocused ? "text-primary" : "text-muted-foreground"
              )}>
                {isFocused ? <Sparkles size={20} /> : <Plus size={20} />}
              </div>

              {/* Input Field */}
              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={(e) => {
                  // Keep focused if clicking within the container
                  if (containerRef.current?.contains(e.relatedTarget as Node)) {
                    return;
                  }
                  if (!text) setIsFocused(false);
                }}
                onKeyDown={handleKeyDown}
                placeholder={isFocused ? "What needs to be done?" : placeholder}
                className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-base font-light"
                autoComplete="off"
              />

              {/* Right Side: Keyboard Shortcut or Submit Button */}
              {!isFocused && (
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-muted-foreground bg-muted rounded-md border border-border">
                  <span className="text-[10px]">⌘</span> /
                </kbd>
              )}

              {isFocused && (
                <button
                  onClick={handleSubmit}
                  disabled={!text.trim()}
                  className={cn(
                    "p-2 rounded-lg transition-all duration-200",
                    text.trim()
                      ? "bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  <CornerDownLeft size={18} />
                </button>
              )}
            </div>

            {/* Time Chips - Expandable Section */}
            {isFocused && (
              <div className="border-t border-border/50 bg-muted/30 px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  {/* Preset Time Chips */}
                  {TIME_PRESETS.map((preset) => (
                    <Chip
                      key={preset.value}
                      selected={selectedTime === preset.value}
                      onClick={() => handleTimePreset(preset.value)}
                    >
                      <span>{preset.label}</span>
                      <span className="font-mono text-xs">{preset.value}</span>
                    </Chip>
                  ))}

                  {/* Custom Time Chip */}
                  <Chip
                    selected={selectedTime !== null && !TIME_PRESETS.some(p => p.value === selectedTime)}
                    onClick={handleCustomTimeClick}
                  >
                    <Clock className="w-3 h-3" />
                    <span>Choose</span>
                  </Chip>

                  {/* Remove Time Chip */}
                  {selectedTime && (
                    <Chip
                      variant="outline"
                      onClick={handleRemoveTime}
                    >
                      <X className="w-3 h-3" />
                      <span>No time</span>
                    </Chip>
                  )}
                </div>

                {/* Selected Time Indicator */}
                {selectedTime && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-2">
                    <Clock className="w-3 h-3" />
                    <span>Task scheduled for {selectedTime}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          </div>
        </div>

        {/* Custom Time Picker Dialog */}
        <Dialog open={showCustomTimePicker} onOpenChange={setShowCustomTimePicker}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Choose Custom Time</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Time</label>
                <Input
                  type="time"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="text-lg"
                  autoFocus
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCustomTimePicker(false)}>
                Cancel
              </Button>
              <Button onClick={handleCustomTimeSubmit}>
                Set Time
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }
);

FloatingTaskInput.displayName = 'FloatingTaskInput';

export default FloatingTaskInput;
