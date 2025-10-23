import { GameState } from '@/types/game';

export interface TimeWindow {
  startMonth: number;
  endMonth: number;
  months: number[];
}

/**
 * Get last N months of data
 */
export function getTimeWindow(
  state: GameState,
  range: number = 12
): TimeWindow {
  const currentMonth = state.currentMonth;
  const startMonth = Math.max(0, currentMonth - range);
  const months = Array.from(
    { length: currentMonth - startMonth + 1 },
    (_, i) => startMonth + i
  );

  return { startMonth, endMonth: currentMonth, months };
}

/**
 * Extract time series data for a metric
 */
export function extractTimeSeries<T>(
  history: T[],
  window: TimeWindow
): T[] {
  return history.slice(window.startMonth, window.endMonth + 1);
}

/**
 * Calculate trend (increasing, decreasing, stable)
 */
export function calculateTrend(
  values: number[],
  threshold: number = 0.05
): 'increasing' | 'decreasing' | 'stable' {
  if (values.length < 2) return 'stable';

  const recent = values.slice(-6); // Last 6 months
  const older = values.slice(-12, -6); // Previous 6 months

  if (older.length === 0) return 'stable';

  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

  if (olderAvg === 0) return 'stable';

  const change = (recentAvg - olderAvg) / olderAvg;

  if (change > threshold) return 'increasing';
  if (change < -threshold) return 'decreasing';
  return 'stable';
}

/**
 * Get sparkline data (simplified for rendering)
 */
export function getSparklineData(
  values: number[],
  maxPoints: number = 12
): number[] {
  if (values.length <= maxPoints) return values;

  // Downsample to maxPoints
  const step = values.length / maxPoints;
  return Array.from({ length: maxPoints }, (_, i) =>
    values[Math.floor(i * step)] ?? 0
  );
}
