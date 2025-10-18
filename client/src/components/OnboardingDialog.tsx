import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import DefaultSprite from '@/assets/DefaultSprite.png';
import DefaultSpriteB from '@/assets/DefaultSprite-B.png';

interface OnboardingDialogProps {
  open: boolean;
  onComplete: (selectedSprite: string) => void;
}

export default function OnboardingDialog({ open, onComplete }: OnboardingDialogProps) {
  const [selectedSprite, setSelectedSprite] = useState<string | null>(null);

  const handleConfirm = () => {
    if (selectedSprite) {
      console.log('OnboardingDialog: Completing onboarding with sprite:', selectedSprite);
      onComplete(selectedSprite);
    } else {
      console.warn('OnboardingDialog: No sprite selected!');
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Choose your starting Howie!</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Don't worry - you can customize your Howie later
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {/* Sprite Selection Grid */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setSelectedSprite('default')}
              className={cn(
                'relative w-32 h-32 rounded-xl border-4 transition-all',
                'hover:border-primary/50 hover:shadow-lg',
                selectedSprite === 'default'
                  ? 'border-primary shadow-xl shadow-primary/20'
                  : 'border-border'
              )}
            >
              <img
                src={DefaultSprite}
                alt="Default Howie"
                className="w-full h-full object-contain p-2"
              />

              {/* Selected Check Mark */}
              {selectedSprite === 'default' && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-4 border-background shadow-lg">
                  <Check className="w-5 h-5 text-primary-foreground" strokeWidth={3} />
                </div>
              )}
            </button>

            <button
              onClick={() => setSelectedSprite('default-b')}
              className={cn(
                'relative w-32 h-32 rounded-xl border-4 transition-all',
                'hover:border-primary/50 hover:shadow-lg',
                selectedSprite === 'default-b'
                  ? 'border-primary shadow-xl shadow-primary/20'
                  : 'border-border'
              )}
            >
              <img
                src={DefaultSpriteB}
                alt="Default Howie B"
                className="w-full h-full object-contain p-2"
              />

              {/* Selected Check Mark */}
              {selectedSprite === 'default-b' && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-4 border-background shadow-lg">
                  <Check className="w-5 h-5 text-primary-foreground" strokeWidth={3} />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={handleConfirm}
          disabled={!selectedSprite}
          size="lg"
          className="w-full text-base font-bold"
        >
          I'm Ready!
        </Button>
      </DialogContent>
    </Dialog>
  );
}
