import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Chip } from '@/components/ui/chip';
import { Card } from '@/components/ui/card';
import { X, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface SlashInputProps {
  onAddItem: (text: string, time?: string) => void;
  placeholder?: string;
}

export interface SlashInputRef {
  focus: () => void;
}

const TIME_PRESETS = [
  { label: 'Morning', value: '08:00', icon: '🌅' },
  { label: 'Afternoon', value: '12:00', icon: '☀️' },
  { label: 'Evening', value: '18:00', icon: '🌆' },
] as const;

const SlashInput = forwardRef<SlashInputRef, SlashInputProps>(
  ({ onAddItem, placeholder = "Press / to add a task or event..." }, ref) => {
    const [text, setText] = useState('');
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [isActive, setIsActive] = useState(false);
    const [showCustomTimePicker, setShowCustomTimePicker] = useState(false);
    const [customTime, setCustomTime] = useState('09:00');

    const inputRef = useRef<HTMLInputElement>(null);

    // Expose focus method to parent via ref
    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
        setIsActive(true);
      },
    }));

  // Focus management
  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);

  const handleFocus = () => {
    setIsActive(true);
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Don't blur if clicking on time chips or custom picker
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (relatedTarget?.closest('.time-chips') || relatedTarget?.closest('[role="dialog"]')) {
      return;
    }

    // Only reset if input is empty
    if (!text.trim()) {
      setIsActive(false);
      setSelectedTime(null);
    }
  };

  const handleCancel = () => {
    setText('');
    setSelectedTime(null);
    setIsActive(false);
    inputRef.current?.blur();
  };

  const handleSubmit = () => {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    onAddItem(trimmedText, selectedTime || undefined);

    // Reset state
    setText('');
    setSelectedTime(null);
    setIsActive(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
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
      {/* Wrap in Card when active */}
      {isActive ? (
        <Card className="p-4 space-y-3">
          {/* Input Field */}
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="pr-20 text-base h-12"
            />

            {/* Cancel Button - Inside input on right */}
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground font-medium"
              onClick={handleCancel}
              onMouseDown={(e) => e.preventDefault()}
            >
              CANCEL
            </button>
          </div>

          {/* Time Chips */}
          <div className="time-chips flex flex-wrap gap-2">
            {/* Preset Time Chips */}
            {TIME_PRESETS.map((preset) => (
              <Chip
                key={preset.value}
                selected={selectedTime === preset.value}
                onClick={() => handleTimePreset(preset.value)}
                onMouseDown={(e) => e.preventDefault()}
              >
                <span>{preset.icon}</span>
                <span>{preset.label}</span>
                <span className="font-mono">{preset.value}</span>
              </Chip>
            ))}

            {/* Custom Time Chip */}
            <Chip
              selected={selectedTime !== null && !TIME_PRESETS.some(p => p.value === selectedTime)}
              onClick={handleCustomTimeClick}
              onMouseDown={(e) => e.preventDefault()}
            >
              <Clock className="w-3 h-3" />
              <span>Choose</span>
            </Chip>

            {/* Remove Time Chip - Shows if time selected */}
            {selectedTime && (
              <Chip
                variant="outline"
                onClick={handleRemoveTime}
                onMouseDown={(e) => e.preventDefault()}
              >
                <X className="w-3 h-3" />
                <span>No time</span>
              </Chip>
            )}
          </div>

          {/* Selected Time Indicator */}
          {selectedTime && (
            <div className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
              <Clock className="w-3 h-3" />
              <span>This will be saved as an event at {selectedTime}</span>
            </div>
          )}
        </Card>
      ) : (
        /* Inactive state - just the input */
        <div className="relative">
          <Input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="text-base h-12"
          />
        </div>
      )}

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
});

SlashInput.displayName = 'SlashInput';

export default SlashInput;
