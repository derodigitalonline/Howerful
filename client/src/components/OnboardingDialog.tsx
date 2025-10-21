import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DefaultSprite from '@/assets/DefaultSprite.png';

interface OnboardingDialogProps {
  open: boolean;
  onComplete: (nickname: string) => void;
}

export default function OnboardingDialog({ open, onComplete }: OnboardingDialogProps) {
  const [nickname, setNickname] = useState<string>("Howie");

  const handleConfirm = () => {
    console.log('OnboardingDialog: Completing onboarding with nickname:', nickname);
    onComplete(nickname.trim() || "Howie");
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Meet your Howie!</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Your companion for productivity and progress
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          {/* Default Sprite Thumbnail */}
          <div className="flex justify-center">
            <div className="w-40 h-40 rounded-xl border-4 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-4 shadow-lg">
              <img
                src={DefaultSprite}
                alt="Your Howie"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Nickname Input */}
          <div className="space-y-2">
            <Label htmlFor="nickname" className="text-center block text-muted-foreground">
              Want to give them a nickname?
            </Label>
            <Input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Howie"
              maxLength={20}
              className="text-center text-lg font-semibold"
            />
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={handleConfirm}
          size="lg"
          className="w-full text-base font-bold"
        >
          I'm Ready!
        </Button>
      </DialogContent>
    </Dialog>
  );
}
