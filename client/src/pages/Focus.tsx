import { useState, useEffect } from "react";
import { useFocus } from "@/hooks/useFocus";
import FocusTimer from "@/components/FocusTimer";
import FocusControls from "@/components/FocusControls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Timer, Clock, Settings } from "lucide-react";
import { motion } from "framer-motion";

export default function Focus() {
  const { activeItemText, isRunning, startTimer, settings } = useFocus();
  const [customHours, setCustomHours] = useState("00");
  const [customMinutes, setCustomMinutes] = useState("25");
  const [customSeconds, setCustomSeconds] = useState("00");

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

  const handleCustomStart = () => {
    const hours = parseInt(customHours) || 0;
    const minutes = parseInt(customMinutes) || 0;
    const seconds = parseInt(customSeconds) || 0;

    const totalSeconds = hours * 3600 + minutes * 60 + seconds;

    // Validate duration (max 4 hours)
    if (totalSeconds > 0 && totalSeconds <= 4 * 3600) {
      startTimer(undefined, undefined, totalSeconds);
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
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Timer className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold">Focus Mode</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Deep work sessions to help you stay focused and productive
            </p>
          </div>

          {/* Active Item Display */}
          {activeItemText && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-2">Currently focusing on</p>
                  <p className="text-xl font-semibold">{activeItemText}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Timer Display */}
          <div className="flex flex-col items-center gap-8">
            <FocusTimer size="large" />
            <FocusControls variant="default" />
          </div>

          <Separator />

          {/* Preset Durations */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Quick Start</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  size="lg"
                  variant="outline"
                  onClick={() => handlePresetClick(preset.seconds)}
                  disabled={isRunning}
                  className="h-16 text-lg font-semibold"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Duration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Custom Duration
              </CardTitle>
              <CardDescription>
                Set a custom timer up to 4 hours (HH:MM:SS format)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground block mb-1">Hours</label>
                  <Input
                    type="number"
                    min="0"
                    max="4"
                    value={customHours}
                    onChange={(e) => setCustomHours(e.target.value.padStart(2, '0'))}
                    className="text-center text-lg font-mono"
                    disabled={isRunning}
                  />
                </div>
                <span className="text-2xl text-muted-foreground pt-6">:</span>
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground block mb-1">Minutes</label>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(e.target.value.padStart(2, '0'))}
                    className="text-center text-lg font-mono"
                    disabled={isRunning}
                  />
                </div>
                <span className="text-2xl text-muted-foreground pt-6">:</span>
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground block mb-1">Seconds</label>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={customSeconds}
                    onChange={(e) => setCustomSeconds(e.target.value.padStart(2, '0'))}
                    className="text-center text-lg font-mono"
                    disabled={isRunning}
                  />
                </div>
              </div>
              <Button
                onClick={handleCustomStart}
                disabled={isRunning}
                className="w-full"
                size="lg"
              >
                Start Custom Timer
              </Button>
            </CardContent>
          </Card>

          {/* Settings Info */}
          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Work Duration</p>
                  <p className="text-lg font-semibold">{Math.floor(settings.workDuration / 60)} min</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Short Break</p>
                  <p className="text-lg font-semibold">{Math.floor(settings.shortBreakDuration / 60)} min</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Long Break</p>
                  <p className="text-lg font-semibold">{Math.floor(settings.longBreakDuration / 60)} min</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Long Break After</p>
                  <p className="text-lg font-semibold">{settings.longBreakInterval} sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Keyboard Shortcuts Help */}
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Space</kbd> Pause / Resume timer</p>
                <p><kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">/</kbd> Focus input (when in Dojo)</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
