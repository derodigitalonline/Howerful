import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DefaultSprite from '@/assets/DefaultSprite.png';
import { ChevronRight, User } from 'lucide-react';

interface OnboardingDialogProps {
  open: boolean;
  onComplete: (userName: string, howieName: string) => void;
}

export default function OnboardingDialog({ open, onComplete }: OnboardingDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [userName, setUserName] = useState<string>("");
  const [howieName, setHowieName] = useState<string>("Howie");

  const handleContinue = () => {
    if (step === 1 && userName.trim()) {
      setStep(2);
    } else if (step === 2) {
      console.log('OnboardingDialog: Completing onboarding with:', { userName, howieName });
      onComplete(userName.trim() || "User", howieName.trim() || "Howie");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleContinue();
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        {step === 1 ? (
          <>
            {/* Step 1: User's Name */}
            <DialogHeader>
              <DialogTitle className="text-2xl text-center">Welcome to Howerful!</DialogTitle>
              <DialogDescription className="text-center pt-2">
                Let's get to know you
              </DialogDescription>
            </DialogHeader>

            <div className="py-6 space-y-6">
              {/* User Icon */}
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full border-4 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center shadow-lg">
                  <User className="w-10 h-10 text-primary" />
                </div>
              </div>

              {/* Name Input */}
              <div className="space-y-2">
                <Label htmlFor="userName" className="text-center block text-muted-foreground">
                  What's your first name?
                </Label>
                <Input
                  id="userName"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your name"
                  maxLength={20}
                  className="text-center text-lg font-semibold"
                  autoFocus
                />
              </div>
            </div>

            {/* Action Button */}
            <Button
              onClick={handleContinue}
              disabled={!userName.trim()}
              size="lg"
              className="w-full text-base font-bold"
            >
              Continue
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </>
        ) : (
          <>
            {/* Step 2: Howie's Name */}
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
                <Label htmlFor="howieName" className="text-center block text-muted-foreground">
                  Want to give them a nickname?
                </Label>
                <Input
                  id="howieName"
                  type="text"
                  value={howieName}
                  onChange={(e) => setHowieName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Howie"
                  maxLength={20}
                  className="text-center text-lg font-semibold"
                  autoFocus
                />
                <p className="text-xs text-center text-muted-foreground">
                  You can always change this later!
                </p>
              </div>
            </div>

            {/* Action Button */}
            <Button
              onClick={handleContinue}
              size="lg"
              className="w-full text-base font-bold"
            >
              I'm Ready!
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
