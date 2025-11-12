import { useState, useEffect } from 'react';

export interface TimeUntilMidnight {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string; // e.g., "22h 31m"
  totalSeconds: number;
}

/**
 * Custom hook that calculates the time remaining until midnight (next day)
 * Updates every second to provide a live countdown
 *
 * @returns TimeUntilMidnight object with hours, minutes, seconds, and formatted string
 *
 * @example
 * const timer = useTimeUntilMidnight();
 * return <span>Resets in {timer.formatted}</span>;
 */
export function useTimeUntilMidnight(): TimeUntilMidnight {
  const [timeRemaining, setTimeRemaining] = useState<TimeUntilMidnight>(() =>
    calculateTimeUntilMidnight()
  );

  useEffect(() => {
    // Update the timer every second
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeUntilMidnight());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return timeRemaining;
}

/**
 * Calculates the time remaining until the next midnight (00:00:00)
 *
 * @returns TimeUntilMidnight object with time breakdown
 */
function calculateTimeUntilMidnight(): TimeUntilMidnight {
  const now = new Date();

  // Create a date object for tomorrow at midnight
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0); // Set to next midnight

  // Calculate difference in milliseconds
  const diff = midnight.getTime() - now.getTime();
  const totalSeconds = Math.floor(diff / 1000);

  // Break down into hours, minutes, seconds
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Format as "Xh Ym" (omit seconds for cleaner display)
  const formatted = `${hours}h ${minutes}m ${seconds}s`;

  return {
    hours,
    minutes,
    seconds,
    formatted,
    totalSeconds,
  };
}

/**
 * Get a static calculation without the reactive hook
 * Useful for one-time calculations
 */
export function getTimeUntilMidnight(): TimeUntilMidnight {
  return calculateTimeUntilMidnight();
}
