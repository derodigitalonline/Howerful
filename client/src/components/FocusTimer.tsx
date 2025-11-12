import { motion } from "framer-motion";
import { useFocus } from "@/hooks/useFocus";

interface FocusTimerProps {
  size?: "small" | "medium" | "large";
}

export default function FocusTimer({ size = "large" }: FocusTimerProps) {
  const { phase, formattedTime, progress, isRunning } = useFocus();

  // Size configurations
  const sizeConfig = {
    small: {
      container: "w-32 h-32",
      fontSize: "text-2xl",
      labelSize: "text-xs",
      strokeWidth: 6,
      radius: 45,
    },
    medium: {
      container: "w-48 h-48",
      fontSize: "text-4xl",
      labelSize: "text-sm",
      strokeWidth: 7,
      radius: 45,
    },
    large: {
      container: "w-64 h-64",
      fontSize: "text-6xl",
      labelSize: "text-base",
      strokeWidth: 8,
      radius: 45,
    },
  };

  const config = sizeConfig[size];
  const circumference = 2 * Math.PI * config.radius;
  const strokeDashoffset = circumference * (1 - progress / 100);

  // Phase labels
  const phaseLabel = {
    work: "Focus Time",
    shortBreak: "Short Break",
    longBreak: "Long Break",
  }[phase];

  // Phase colors
  const phaseColor = {
    work: "stroke-primary",
    shortBreak: "stroke-green-500",
    longBreak: "stroke-blue-500",
  }[phase];

  return (
    <div className={`relative ${config.container} flex items-center justify-center`}>
      {/* SVG Circle Progress */}
      <svg
        className="transform -rotate-90 absolute inset-0"
        viewBox="0 0 100 100"
      >
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r={config.radius}
          className="stroke-muted/20"
          strokeWidth={config.strokeWidth}
          fill="none"
        />

        {/* Progress circle */}
        <motion.circle
          cx="50"
          cy="50"
          r={config.radius}
          className={phaseColor}
          strokeWidth={config.strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </svg>

      {/* Time display */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <motion.div
          className={`${config.fontSize} font-bold font-mono tracking-tight`}
          animate={{ scale: isRunning ? [1, 1.02, 1] : 1 }}
          transition={{
            duration: 1,
            repeat: isRunning ? Infinity : 0,
            repeatType: "loop",
          }}
        >
          {formattedTime}
        </motion.div>

        <div className={`${config.labelSize} text-muted-foreground mt-2 font-medium`}>
          {phaseLabel}
        </div>
      </div>

      {/* Pulsing ring effect when running */}
      {isRunning && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary/30"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </div>
  );
}
