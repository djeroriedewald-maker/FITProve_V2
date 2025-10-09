// Date utility functions for workout scheduling

/**
 * Get the next occurrence of a specific day of the week
 * @param startDate Starting date
 * @param dayName Day name (e.g., 'Mon', 'Tue', etc.)
 * @returns Date string in YYYY-MM-DD format
 */
export function getNextOccurrence(startDate: Date, dayName: string): string {
  const dayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  const targetDay = dayMap[dayName];
  if (targetDay === undefined) {
    throw new Error(`Invalid day name: ${dayName}`);
  }

  const date = new Date(startDate);
  const currentDay = date.getDay();
  const daysUntilTarget = (targetDay - currentDay + 7) % 7;

  // If today is the target day, use today; otherwise use next occurrence
  const daysToAdd = daysUntilTarget === 0 ? 0 : daysUntilTarget;

  date.setDate(date.getDate() + daysToAdd);
  return formatDate(date);
}

/**
 * Calculate the date for a specific day in a given week offset
 * @param startDate Starting date (should be the first occurrence of the first day)
 * @param dayName Day name
 * @param weekOffset Week offset (0 = same week, 1 = next week, etc.)
 * @returns Date string in YYYY-MM-DD format
 */
export function calculateDateForDay(
  startDate: string,
  dayName: string,
  weekOffset: number
): string {
  const date = new Date(startDate);
  const firstOccurrence = getNextOccurrence(date, dayName);
  const targetDate = new Date(firstOccurrence);

  // Add weeks
  targetDate.setDate(targetDate.getDate() + weekOffset * 7);

  return formatDate(targetDate);
}

/**
 * Format date as YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Add weeks to a date
 */
export function addWeeks(dateString: string, weeks: number): string {
  const date = new Date(dateString);
  date.setDate(date.getDate() + weeks * 7);
  return formatDate(date);
}

/**
 * Map preferred time to actual time string
 */
export function mapPreferredTimeToActualTime(preferredTime?: string): string | undefined {
  const timeMap: Record<string, string> = {
    Morning: '07:00',
    Afternoon: '14:00',
    Evening: '18:00',
  };

  return preferredTime ? timeMap[preferredTime] : undefined;
}

/**
 * Get day name from date
 */
export function getDayName(dateString: string): string {
  const date = new Date(dateString);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
}

/**
 * Generate dates for multiple weeks based on selected days
 */
export function generateProgramDates(
  selectedDays: string[],
  startDate: string,
  weeks: number
): Array<{ date: string; day: string }> {
  const dates: Array<{ date: string; day: string }> = [];

  for (let week = 0; week < weeks; week++) {
    for (const day of selectedDays) {
      const date = calculateDateForDay(startDate, day, week);
      dates.push({ date, day });
    }
  }

  return dates;
}
