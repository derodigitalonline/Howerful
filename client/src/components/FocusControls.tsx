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
}

export default function FocusControls({ variant = "default" }: FocusControlsProps) {
  const { isRunning, isPaused, pauseTimer, resumeTimer, finishEarly, skipPhase, activeItemText } = useFocus();
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
            onClick={resumeTimer}
            className="gap-2"
            disabled={!isPaused && !isRunning}
          >
            <Play className={iconSize} />
            {variant === "default" && (isPaused ? "Resume" : "Start")}
          </Button>
        ) : (
          <Button
            size={buttonSize}
            variant="outline"
            onClick={pauseTimer}
            className="gap-2"
          >
            <Pause className={iconSize} />
            {variant === "default" && "Pause"}
          </Button>
        )}

        {/* Skip Phase Button */}
        {isRunning && (
          <Button
            size={buttonSize}
            variant="outline"
            onClick={skipPhase}
            className="gap-2"
          >
            <SkipForward className={iconSize} />
            {variant === "default" && "Skip"}
          </Button>
        )}

        {/* Finish Early Button */}
        {isRunning && (
          <Button
            size={buttonSize}
            variant="destructive"
            onClick={handleFinishEarly}
            className="gap-2"
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
