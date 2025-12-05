import { Button } from "@/components/ui/button";
import { useFocus } from "@/hooks/useFocus";
import { Play, Pause, SkipForward, Square } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface FocusControlsProps {
  variant?: "default" | "compact";
  isNight?: boolean;
}

export default function FocusControls({ variant = "default", isNight = false }: FocusControlsProps) {
  const { isRunning, isPaused, pauseTimer, resumeTimer, startTimer, finishEarly, activeItemText } = useFocus();
  const [showFinishDialog, setShowFinishDialog] = useState(false);

  const buttonSize = variant === "compact" ? "sm" : "default";
  const iconSize = variant === "compact" ? "w-4 h-4" : "w-5 h-5";

  const handleFinishEarly = () => {
    setShowFinishDialog(true);
  };

  const confirmFinishEarly = () => {
    finishEarly();
    setShowFinishDialog(false);
  };

  return (
    <>
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        {!isRunning || isPaused ? (
          <Button
            size={buttonSize}
            onClick={isPaused ? resumeTimer : () => startTimer()}
            className="gap-2"
          >
            <Play className={iconSize} />
            {variant === "default" && (isPaused ? "Resume" : "Start")}
          </Button>
        ) : (
          <Button
            size={buttonSize}
            variant="outline"
            onClick={pauseTimer}
            className={`gap-2 transition-all ${
              isNight
                ? 'bg-indigo-950/30 border-indigo-400/30 text-indigo-100 hover:bg-indigo-900/50 hover:border-indigo-400/50'
                : ''
            }`}
          >
            <Pause className={iconSize} />
            {variant === "default" && "Pause"}
          </Button>
        )}

        {/* Finish Early Button */}
        {isRunning && (
          <Button
            size={buttonSize}
            variant="destructive"
            onClick={handleFinishEarly}
            className={`gap-2 transition-all ${
              isNight
                ? 'bg-red-950/40 border-red-500/40 text-red-100 hover:bg-red-900/60 hover:border-red-500/60'
                : ''
            }`}
          >
            <Square className={iconSize} />
            {variant === "default" && "Finish"}
          </Button>
        )}
      </div>

      {/* Finish Early Confirmation Dialog */}
      <AlertDialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finish Focus Session Early?</AlertDialogTitle>
            <AlertDialogDescription>
              {activeItemText ? (
                <>
                  You're currently focusing on <span className="font-semibold">"{activeItemText}"</span>.
                  <br /><br />
                  This session will be marked as complete, but the timer was interrupted early.
                </>
              ) : (
                "This session will be marked as complete, but the timer was interrupted early."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmFinishEarly}>
              Finish Early
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
