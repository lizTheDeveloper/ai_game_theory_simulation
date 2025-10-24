/**
 * Number Formatting Utilities
 *
 * Consistent number formatting for dashboard displays.
 */

/**
 * Format a number with fixed decimal places
 */
export const formatNumber = (value: number, decimals: number = 1): string => {
  return value.toFixed(decimals)
}

/**
 * Format a number as an integer (no decimals)
 */
export const formatInteger = (value: number): string => {
  return Math.round(value).toLocaleString()
}

/**
 * Format a large number in abbreviated form (K, M, B, T)
 */
export const formatAbbreviated = (value: number): string => {
  if (value >= 1_000_000_000_000) {
    return (value / 1_000_000_000_000).toFixed(2) + 'T'
  }
  if (value >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(2) + 'B'
  }
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(2) + 'M'
  }
  if (value >= 1_000) {
    return (value / 1_000).toFixed(2) + 'K'
  }
  return value.toFixed(0)
}

/**
 * Format a percentage (0-100 scale) with fixed decimals
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return value.toFixed(decimals) + '%'
}

/**
 * Format pH value (typically 0-14 scale) with appropriate precision
 */
export const formatPH = (value: number): string => {
  return value.toFixed(2)
}

/**
 * Format simulation date to human-readable string
 * @param year - Current year (e.g., 2025)
 * @param month - Current month (0-based, 0 = January)
 * @param day - Current day (1-31)
 * @returns Formatted date string (e.g., "November 12, 2025")
 */
export const formatSimulationDate = (year: number, month: number, day: number): string => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const monthName = monthNames[month] || 'Unknown'
  return `${monthName} ${day}, ${year}`
}
