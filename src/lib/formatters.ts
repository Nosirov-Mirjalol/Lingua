/**
 * Formats an array of lesson days or a comma-separated string of days into a clean, localized string.
 * Handles empty values, nulls, and placeholder strings like "string".
 * 
 * @param days - Array of day names or a comma-separated string
 * @returns A formatted string of days or a fallback message
 */
export function formatLessonDays(
  days: (string | null | undefined)[] | string | null | undefined
): string {
  if (!days) return 'No lesson days available'

  let daysArray: string[] = []

  if (Array.isArray(days)) {
    daysArray = days
      .filter((d): d is string => typeof d === 'string')
      .map((d) => d.trim())
      .filter((d) => d.length > 0 && d.toLowerCase() !== 'string')
  } else if (typeof days === 'string') {
    daysArray = days
      .split(',')
      .map((d) => d.trim())
      .filter((d) => d.length > 0 && d.toLowerCase() !== 'string')
  }

  if (daysArray.length === 0) return 'No lesson days available'

  // Join with comma and space
  return daysArray.join(', ')
}

/**
 * Capitalizes the first letter of each day name
 */
export function formatLessonDaysCapitalized(
  days: (string | null | undefined)[] | string | null | undefined
): string {
  const formatted = formatLessonDays(days)
  if (formatted === 'No lesson days available') return formatted

  return formatted
    .split(', ')
    .map((day) => day.charAt(0).toUpperCase() + day.slice(1))
    .join(', ')
}
