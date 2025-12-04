import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useFocus } from '@/hooks/useFocus';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SwitchFocusDialog from '@/components/SwitchFocusDialog';
import { CheckSquare, CornerDownLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FocusStart() {
  const [location, navigate] = useLocation();
  const { activeItemId, activeItemText, startTimer } = useFocus();

  // Parse query params
  const searchParams = new URLSearchParams(window.location.search);
  const itemId = searchParams.get('itemId');
  const itemText = searchParams.get('itemText');

  // State
  const [selectedDuration, setSelectedDuration] = useState<number | null>(25 * 60); // Default 25 min
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('30');
  const [showSwitchDialog, setShowSwitchDialog] = useState(false);

  // Preset durations in seconds
  const presets = [
    { label: '5 mins', seconds: 5 * 60 },
    { label: '10 mins', seconds: 10 * 60 },
    { label: '25 mins', seconds: 25 * 60 },
  ];

  // Handle BEGIN button
  const handleBegin = () => {
    if (!selectedDuration) return;

    // Check if there's an active session
    if (activeItemId) {
      setShowSwitchDialog(true);
    } else {
      // Start immediately
      startTimer(itemId || undefined, itemText || undefined, selectedDuration);
      navigate('/focus');
    }
  };

  // Handle confirming switch
  const handleConfirmSwitch = () => {
    if (selectedDuration) {
      startTimer(itemId || undefined, itemText || undefined, selectedDuration);
      navigate('/focus');
    }
  };

  // Handle custom duration submit
  const handleCustomSubmit = () => {
    const minutes = parseInt(customMinutes);
    if (minutes >= 1 && minutes <= 180) {
      setSelectedDuration(minutes * 60);
      setShowCustomPicker(false);
    }
  };

  // Enter key handler for BEGIN
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return; // Ignore if typing in input

      if (e.key === 'Enter' && selectedDuration) {
        handleBegin();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDuration, activeItemId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full mx-auto space-y-8">
        {/* Heading */}
        <h1 className="text-5xl font-bold text-white text-center mb-8">
          Ready to get started?
        </h1>

        {/* Task preview card */}
        <Card className="bg-white/10 backdrop-blur-md border border-white/20 p-6">
          <div className="flex items-center gap-3 text-white">
            <CheckSquare className="w-6 h-6 flex-shrink-0" />
            <p className="text-lg">{itemText || 'Focus session'}</p>
          </div>
        </Card>

        {/* Duration selector */}
        <div className="space-y-6">
          <h2 className="text-2xl text-white text-center">
            How long do you want to focus on this?
          </h2>

          <div className="grid grid-cols-4 gap-4">
            {/* Preset buttons */}
            {presets.map((preset) => (
              <Button
                key={preset.seconds}
                onClick={() => setSelectedDuration(preset.seconds)}
                className={cn(
                  'py-6 text-lg font-semibold transition-all',
                  selectedDuration === preset.seconds
                    ? 'bg-white text-blue-900 border-2 border-white shadow-lg scale-105'
                    : 'bg-white/20 hover:bg-white/30 border-2 border-white/40 text-white'
                )}
              >
                {preset.label}
              </Button>
            ))}

            {/* Custom button */}
            <Button
              onClick={() => setShowCustomPicker(true)}
              className={cn(
                'py-6 text-lg font-semibold transition-all',
                !presets.some((p) => p.seconds === selectedDuration) && selectedDuration
                  ? 'bg-white text-blue-900 border-2 border-white shadow-lg scale-105'
                  : 'bg-white/20 hover:bg-white/30 border-2 border-white/40 text-white'
              )}
            >
              Custom
            </Button>
          </div>
        </div>

        {/* BEGIN button */}
        <div className="flex justify-center pt-8">
          <Button
            onClick={handleBegin}
            disabled={!selectedDuration}
            className={cn(
              'bg-white text-blue-900 text-2xl py-6 px-16 rounded-2xl font-bold',
              'shadow-[0_8px_0_0_rgba(255,255,255,0.3)]',
              'hover:shadow-[0_10px_0_0_rgba(255,255,255,0.3)] hover:-translate-y-[2px]',
              'active:shadow-[0_2px_0_0_rgba(255,255,255,0.3)] active:translate-y-[6px]',
              'transition-all duration-150',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'flex items-center gap-3'
            )}
          >
            <span>Begin</span>
            <CornerDownLeft className="w-5 h-5" />
          </Button>
        </div>

        {/* Duration display hint */}
        {selectedDuration && (
          <p className="text-center text-white/60 text-sm">
            {Math.floor(selectedDuration / 60)} minute{Math.floor(selectedDuration / 60) !== 1 ? 's' : ''} selected
          </p>
        )}
      </div>

      {/* Custom duration dialog */}
      <Dialog open={showCustomPicker} onOpenChange={setShowCustomPicker}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Custom Duration</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="minutes" className="text-right">
                Minutes
              </Label>
              <Input
                id="minutes"
                type="number"
                min="1"
                max="180"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
                className="col-span-3"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCustomSubmit();
                  }
                }}
                autoFocus
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Enter a duration between 1 and 180 minutes
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCustomPicker(false)}>
              Cancel
            </Button>
            <Button onClick={handleCustomSubmit}>Set Duration</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Switch focus dialog */}
      <SwitchFocusDialog
        open={showSwitchDialog}
        onOpenChange={setShowSwitchDialog}
        currentItemText={activeItemText || ''}
        newItemText={itemText || 'this task'}
        onConfirm={handleConfirmSwitch}
        onCancel={() => setShowSwitchDialog(false)}
      />
    </div>
  );
}
