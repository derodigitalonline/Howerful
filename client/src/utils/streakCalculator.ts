import { DailySpreadItem } from '@shared/schema';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  daysActive: number;
  lastActiveDate: string | null;
}

/**
 * Calculate streak data from daily spread items
 *
 * ADHD-friendly rules:
 * - A day counts if it has at least 1 entry
 * - Streak breaks are forgiven (we track longest streak separately)
 * - We celebrate any progress, not perfection
 */
export function calculateStreak(items: DailySpreadItem[]): StreakData {
  if (items.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      daysActive: 0,
      lastActiveDate: null,
    };
  }

  // Get unique dates with activity from items in "today" bucket (YYYY-MM-DD format)
  // We calculate streaks based on when items were created, using the createdAt timestamp
  const activeDatesSet = new Set<string>();
  items.forEach(item => {
    // Convert createdAt timestamp to YYYY-MM-DD date string
    const date = new Date(item.createdAt);
    const dateStr = date.toISOString().split('T')[0];
    activeDatesSet.add(dateStr);
  });

  const activeDates = Array.from(activeDatesSet).sort();

  const today = new Date().toISOString().split('T')[0];

  // Calculate current streak (consecutive days ending today or yesterday)
  let currentStreak = 0;
  let checkDate = new Date(today);

  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    if (activeDates.includes(dateStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // Allow one day of forgiveness for ADHD-friendly streaks
      // If we're at streak 0 and checking today, try yesterday
      if (currentStreak === 0 && dateStr === today) {
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      }
      break;
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 1;

  for (let i = 1; i < activeDates.length; i++) {
    const prevDate = new Date(activeDates[i - 1]);
    const currDate = new Date(activeDates[i]);

    // Calculate day difference
    const dayDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

    if (dayDiff === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    currentStreak,
    longestStreak,
    daysActive: activeDates.length,
    lastActiveDate: activeDates[activeDates.length - 1],
  };
}

/**
 * Get an encouraging message based on streak data
 * ADHD-friendly: Focus on progress, not perfection
 */
export function getStreakMessage(streak: StreakData): string {
  const { currentStreak, longestStreak, daysActive } = streak;

  if (currentStreak === 0) {
    if (longestStreak > 0) {
      return `Ready for a fresh start? Your best was ${longestStreak} days!`;
    }
    return "Start your journey today!";
  }

  if (currentStreak === 1) {
    return "Great start! One day at a time. 🌱";
  }

  if (currentStreak === longestStreak && currentStreak > 1) {
    return `Personal record: ${currentStreak} days! 🔥`;
  }

  if (currentStreak >= 7) {
    return `${currentStreak} day streak! You're building momentum. 💪`;
  }

  if (currentStreak >= 3) {
    return `${currentStreak} days strong! Keep it up! ⭐`;
  }

  return `Day ${currentStreak}! Progress over perfection. ✨`;
}
