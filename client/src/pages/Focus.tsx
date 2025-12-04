import { useEffect } from "react";
import { useFocus } from "@/hooks/useFocus";
import FocusTimer from "@/components/FocusTimer";
import FocusControls from "@/components/FocusControls";
import FocusHistory from "@/components/FocusHistory";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Timer, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function Focus() {
  const { activeItemText, isRunning, startTimer, settings, sessions } = useFocus();

  // Preset durations in seconds
  const presets = [
    { label: "5 min", seconds: 5 * 60 },
    { label: "10 min", seconds: 10 * 60 },
    { label: "25 min", seconds: 25 * 60 },
  ];

  const handlePresetClick = (seconds: number) => {
    if (!isRunning) {
      startTimer(undefined, undefined, seconds);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not typing in an input
      if (e.target instanceof HTMLInputElement) return;

      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        // Pause/Resume handled by FocusControls
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">


          {/* Compact Timer + Controls + Active Item */}
          <Card className="border-2">
            <CardContent className="pt-6 pb-6">
              {/* Active Item Display - Compact */}
              {activeItemText && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 pb-4 border-b"
                >
                  <p className="text-xs text-muted-foreground mb-1">Currently focusing on</p>
                  <p className="text-base font-semibold text-primary">{activeItemText}</p>
                </motion.div>
              )}

              {/* Timer Display */}
              <div className="flex flex-col items-center gap-4 mb-4">
                <FocusTimer size="large" />
                <FocusControls variant="default" />
              </div>

              {/* Quick Start */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <h2 className="text-base font-semibold">Quick Start</h2>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {presets.map((preset) => (
                    <Button
                      key={preset.label}
                      variant="outline"
                      onClick={() => handlePresetClick(preset.seconds)}
                      disabled={isRunning}
                      className="h-12 font-medium"
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Session History */}
          <FocusHistory sessions={sessions} />
        </div>
      </div>
    </div>
  );
}
