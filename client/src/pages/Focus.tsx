import { useEffect, useState } from "react";
import { useFocus } from "@/hooks/useFocus";
import FocusTimer from "@/components/FocusTimer";
import FocusControls from "@/components/FocusControls";
import FocusBackground3D, { TimeOfDay, getTimeOfDay } from "@/components/FocusBackground3D";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function Focus() {
  const { activeItemText, isRunning, startTimer } = useFocus();
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(getTimeOfDay);

  const isNight = timeOfDay === 'night';

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
    <div className="relative h-full flex flex-col overflow-hidden">
      {/* 3D Background Canvas */}
      <FocusBackground3D timeOfDay={timeOfDay} onTimeChange={setTimeOfDay} />

      {/* UI Content Layer */}
      <div className="relative z-10 flex-1 overflow-y-auto flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-6 py-6">
          {/* Compact Timer + Controls + Active Item */}
          <Card className={`border-2 backdrop-blur-md transition-all duration-500 ${
            isNight
              ? 'bg-slate-900/40 border-indigo-500/30 shadow-[0_8px_32px_0_rgba(99,102,241,0.15)]'
              : 'bg-background/80 border-border'
          }`}>
            <CardContent className="pt-6 pb-6">
              {/* Active Item Display - Compact */}
              {activeItemText && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-4 pb-4 border-b ${
                    isNight ? 'border-indigo-500/20' : 'border-border'
                  }`}
                >
                  <p className={`text-xs mb-1 ${
                    isNight ? 'text-indigo-200/60' : 'text-muted-foreground'
                  }`}>Currently focusing on</p>
                  <p className={`text-base font-semibold ${
                    isNight ? 'text-indigo-100' : 'text-primary'
                  }`}>{activeItemText}</p>
                </motion.div>
              )}

              {/* Timer Display */}
              <div className="flex flex-col items-center gap-4 mb-4">
                <FocusTimer size="large" isNight={isNight} />
                <FocusControls variant="default" isNight={isNight} />
              </div>

              {/* Quick Start */}
              <div className={`space-y-3 pt-4 border-t ${
                isNight ? 'border-indigo-500/20' : 'border-border'
              }`}>
                <div className="flex items-center gap-2">
                  <Clock className={`w-4 h-4 ${
                    isNight ? 'text-indigo-300/70' : 'text-muted-foreground'
                  }`} />
                  <h2 className={`text-base font-semibold ${
                    isNight ? 'text-indigo-100' : ''
                  }`}>Quick Start</h2>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {presets.map((preset) => (
                    <Button
                      key={preset.label}
                      variant="outline"
                      onClick={() => handlePresetClick(preset.seconds)}
                      disabled={isRunning}
                      className={`h-12 font-medium transition-all ${
                        isNight
                          ? 'bg-indigo-950/30 border-indigo-400/30 text-indigo-100 hover:bg-indigo-900/50 hover:border-indigo-400/50'
                          : ''
                      }`}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
