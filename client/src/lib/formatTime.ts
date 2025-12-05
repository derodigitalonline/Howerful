/**
 * Converts 24-hour time format (HH:mm) to 12-hour format (h:mm AM/PM)
 * @param time24 - Time in 24-hour format (e.g., "18:00", "09:30")
 * @returns Time in 12-hour format (e.g., "6:00 PM", "9:30 AM")
 */
export function formatTime12Hour(time24: string): string {
  if (!time24) return '';

  const [hourStr, minute] = time24.split(':');
  const hour24 = parseInt(hourStr, 10);

  if (isNaN(hour24)) return time24; // Return original if invalid

  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;

  return `${hour12}:${minute} ${period}`;
}
