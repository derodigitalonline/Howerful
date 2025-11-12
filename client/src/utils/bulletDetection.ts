import { DailySpreadItemType, Bucket } from '@shared/schema';

export interface ParsedBulletEntry {
  type: DailySpreadItemType;
  text: string;
  time?: string;
  isPriority?: boolean;
  bucket?: Bucket;
}

/**
 * Detects the bullet type from natural language input
 *
 * Detection rules:
 * - Bucket: Starts with "tomorrow:", "someday:" or "tomorrow ", "someday "
 * - Event: Contains time patterns (e.g., "2pm", "tomorrow 3:00", "meeting at 5")
 * - Note: Default type, or starts with "note:", "idea:", "thought:", or contains "..."
 * - Task: Starts with "todo:", "task:", or action verbs (call, email, buy, fix, etc.)
 *
 * Priority detection:
 * - Contains "!!" or "!!!" → marks as priority
 */
export function parseBulletEntry(input: string): ParsedBulletEntry {
  const trimmedInput = input.trim();

  // Priority detection (remove priority markers from text)
  const isPriority = /!!+/.test(trimmedInput);
  let cleanText = trimmedInput.replace(/!!+/g, '').trim();

  // Bucket detection - check for explicit bucket keywords
  let detectedBucket: Bucket | undefined;

  // Check for "tomorrow:" or "someday:" prefixes
  if (/^tomorrow:\s*/i.test(cleanText)) {
    detectedBucket = 'tomorrow';
    cleanText = cleanText.replace(/^tomorrow:\s*/i, '').trim();
  } else if (/^someday:\s*/i.test(cleanText)) {
    detectedBucket = 'someday';
    cleanText = cleanText.replace(/^someday:\s*/i, '').trim();
  } else if (/^today:\s*/i.test(cleanText)) {
    detectedBucket = 'today';
    cleanText = cleanText.replace(/^today:\s*/i, '').trim();
  }
  // Also check for "tomorrow " or "someday " at the start (without colon)
  else if (/^tomorrow\s+/i.test(cleanText) && !/\d/.test(cleanText.substring(0, 15))) {
    // Only if there's no time in the first few characters (avoid "tomorrow 2pm")
    detectedBucket = 'tomorrow';
    cleanText = cleanText.replace(/^tomorrow\s+/i, '').trim();
  } else if (/^someday\s+/i.test(cleanText)) {
    detectedBucket = 'someday';
    cleanText = cleanText.replace(/^someday\s+/i, '').trim();
  }

  // Time pattern detection
  const timePatterns = [
    // "2pm", "3:30pm", "14:00"
    /\b(\d{1,2}):?(\d{2})?\s*(am|pm)\b/i,
    // "at 2", "at 3:30"
    /\bat\s+(\d{1,2}):?(\d{2})?\s*(am|pm)?\b/i,
    // "tomorrow 2pm", "monday 3pm"
    /\b(tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s+(\d{1,2}):?(\d{2})?\s*(am|pm)?\b/i,
  ];

  let detectedTime: string | undefined;
  let type: DailySpreadItemType = 'note'; // Default type

  // Check for time patterns (Event)
  for (const pattern of timePatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      type = 'event';
      // Extract time in HH:MM format
      if (match[1]) {
        let hours = parseInt(match[1]);
        const minutes = match[2] ? match[2] : '00';
        const meridiem = match[3]?.toLowerCase();

        // Convert to 24-hour format if AM/PM specified
        if (meridiem === 'pm' && hours < 12) {
          hours += 12;
        } else if (meridiem === 'am' && hours === 12) {
          hours = 0;
        }

        detectedTime = `${hours.toString().padStart(2, '0')}:${minutes}`;
      }
      break;
    }
  }

  // Check for note patterns
  const notePatterns = [
    /^(note:)/i,
    /\.\.\./,
    /^(idea:|thought:)/i,
  ];

  for (const pattern of notePatterns) {
    if (pattern.test(cleanText)) {
      type = 'note';
      // Clean up prefixes
      cleanText = cleanText.replace(/^(note:|idea:|thought:)\s*/i, '').trim();
      break;
    }
  }

  // Task keywords (override event detection if strong task indicators)
  const taskPatterns = [
    /^(todo:|task:)/i,
    /^(call|email|text|message)\s/i,
    /^(buy|get|pick up|purchase)\s/i,
    /^(fix|repair|update)\s/i,
  ];

  for (const pattern of taskPatterns) {
    if (pattern.test(cleanText)) {
      type = 'task';
      cleanText = cleanText.replace(/^(todo:|task:)\s*/i, '').trim();
      break;
    }
  }

  return {
    type,
    text: cleanText,
    time: detectedTime,
    isPriority,
    bucket: detectedBucket,
  };
}

/**
 * Get a visual bullet symbol for display
 */
export function getBulletSymbol(type: DailySpreadItemType): string {
  switch (type) {
    case 'task':
      return '•';
    case 'event':
      return '○';
    case 'note':
      return '−';
    default:
      return '•';
  }
}
