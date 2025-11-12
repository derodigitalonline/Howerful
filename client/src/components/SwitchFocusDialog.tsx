import { useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SwitchFocusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentItemText: string;
  newItemText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function SwitchFocusDialog({
  open,
  onOpenChange,
  currentItemText,
  newItemText,
  onConfirm,
  onCancel,
}: SwitchFocusDialogProps) {
  // Keyboard shortcuts: Y to confirm, N to cancel
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'y' || e.key === 'Y') {
        e.preventDefault();
        onConfirm();
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onConfirm, onCancel]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Switch Focus Session?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              You're currently focusing on:{' '}
              <span className="font-semibold text-foreground">"{currentItemText}"</span>
            </p>
            <p>
              Start working on{' '}
              <span className="font-semibold text-foreground">"{newItemText}"</span> instead?
            </p>
            <p className="text-xs opacity-70">
              Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Y</kbd> to
              confirm or <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">N</kbd>{' '}
              to cancel
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>No (N)</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Yes (Y)</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
