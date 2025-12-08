import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { CardEyebrow } from '@/components/ui/card-eyebrow';
import { VIT_BOUNTY_MIN, VIT_BOUNTY_MAX, VIT_BOUNTY_DEFAULT } from '@shared/schema';
import { CornerDownLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VITDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (bounty: number) => void;
  taskText: string;
  existingVIT?: { id: string; text: string };
}

export default function VITDialog({
  open,
  onOpenChange,
  onConfirm,
  taskText,
  existingVIT,
}: VITDialogProps) {
  const [bounty, setBounty] = useState(VIT_BOUNTY_DEFAULT);

  // Reset bounty when dialog opens
  useEffect(() => {
    if (open) {
      setBounty(VIT_BOUNTY_DEFAULT);
    }
  }, [open]);

  const handleConfirm = () => {
    onConfirm(bounty);
    onOpenChange(false);
  };

  // Handle ENTER key to confirm
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return; // Ignore if typing

      if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, bounty]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] overflow-visible">
        {/* Card Eyebrow */}
        <CardEyebrow className="bg-white dark:bg-background">
          [VERY IMPORTANT TASK]
        </CardEyebrow>

        <DialogHeader className="pt-6">
          <DialogTitle className="text-3xl font-bold text-center">
            Launch your VIT for today!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8 py-6">
          {/* Existing VIT Warning */}
          {existingVIT && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800"
            >
              <p className="text-sm text-amber-900 dark:text-amber-100">
                <strong>Note:</strong> You already have a VIT today: <em>"{existingVIT.text}"</em>
                <br />
                This will replace it with the task below.
              </p>
            </motion.div>
          )}

          {/* Selected Task Preview */}
          <div>
            <label className="text-base text-muted-foreground mb-3 block">
              Selected Task:
            </label>
            <div className="p-4 bg-accent/50 rounded-lg border border-border">
              <p className="text-base font-medium">{taskText}</p>
            </div>
          </div>

          {/* Bounty Slider Section */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Give it a bounty!</h3>
              <p className="text-muted-foreground text-sm">
                How many coins do you want to earn on completion?
              </p>
            </div>

            {/* Animated Bounty Display */}
            <div className="flex items-center justify-center gap-4 py-4">
              <motion.div
                key={bounty}
                animate={{
                  rotate: [0, -3, 3, -2, 2, 0],
                  transition: { duration: 0.3 }
                }}
                className="relative flex items-center"
              >
                <img
                  src="/assets/howie-coin.png"
                  alt="Howie Coin"
                  width={48}
                  height={48}
                  className="absolute left-0 z-10"
                  style={{ transform: 'translateX(-50%)' }}
                />

                <div
                  className="rounded-full px-8 py-3 flex items-center justify-center min-w-[140px] pl-10"
                  style={{
                    backgroundColor: 'hsl(var(--coin-display-bg))',
                    boxShadow: 'inset 0 2px 0 0 hsl(var(--coin-display-shadow))'
                  }}
                >
                  <span className="text-3xl font-bold text-white leading-none" style={{ fontFamily: 'Fugaz One, cursive' }}>
                    {bounty}
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Slider with Labels */}
            <div className="space-y-4">
              <Slider
                min={VIT_BOUNTY_MIN}
                max={VIT_BOUNTY_MAX}
                step={5}
                value={[bounty]}
                onValueChange={(value) => setBounty(value[0])}
                className="w-full"
              />

              <div className="flex justify-between text-xs text-muted-foreground px-1">
                <span>{VIT_BOUNTY_MIN} HWC</span>
                <span className="text-center">50 HWC</span>
                <span>{VIT_BOUNTY_MAX} HWC</span>
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          <div className="flex justify-center pt-4">
            <Button
              variant="chunk"
              onClick={handleConfirm}
              className={cn(
                "relative group",
                "shadow-[0_4px_0_0_rgba(97,85,245,0.3)]",
                "hover:shadow-[0_6px_0_0_rgba(97,85,245,0.3)] hover:-translate-y-[2px]",
                "active:shadow-[0_1px_0_0_rgba(97,85,245,0.3)] active:translate-y-[3px]",
                "transition-all duration-150"
              )}
            >
              <span>Confirm</span>
              {/* ENTER Key Badge */}
              <span className="inline-flex items-center gap-1 px-1 py-1 bg-white/20 rounded text-xs">
                <CornerDownLeft className="w-4 h-4" />
                ENTER
              </span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
