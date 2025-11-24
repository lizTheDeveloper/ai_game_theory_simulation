/**
 * MetricsCollector - Aggregate metrics for UI dashboard
 *
 * Collects and aggregates simulation metrics for display.
 * Tracks historical values for trend analysis.
 */

import type {
  GameStateSnapshot,
  AggregateMetrics,
} from '../types';

/**
 * Historical metric entry
 */
export interface MetricHistory {
  month: number;
  value: number;
}

/**
 * Metric trend direction
 */
export type TrendDirection = 'up' | 'down' | 'stable';

/**
 * Metric with trend information
 */
export interface MetricWithTrend {
  current: number;
  previous: number;
  trend: TrendDirection;
  changePercent: number;
}

/**
 * MetricsCollector class
 */
export class MetricsCollector {
  private history: Map<string, MetricHistory[]> = new Map();
  private maxHistoryLength: number = 120; // 10 years of monthly data

  /**
   * Record metrics from current state
   */
  recordMetrics(state: GameStateSnapshot): void {
    const month = state.currentMonth ?? 0;
    const metrics = this.extractMetrics(state);

    for (const [key, value] of Object.entries(metrics)) {
      if (typeof value === 'number') {
        this.recordMetric(key, month, value);
      }
    }
  }

  /**
   * Record a single metric value
   */
  private recordMetric(key: string, month: number, value: number): void {
    if (!this.history.has(key)) {
      this.history.set(key, []);
    }

    const history = this.history.get(key)!;

    // Avoid duplicates
    if (history.length > 0 && history[history.length - 1].month === month) {
      history[history.length - 1].value = value;
    } else {
      history.push({ month, value });
    }

    // Trim old history
    while (history.length > this.maxHistoryLength) {
      history.shift();
    }
  }

  /**
   * Get current value for a metric
   */
  getCurrentValue(key: string): number | undefined {
    const history = this.history.get(key);
    if (!history || history.length === 0) return undefined;
    return history[history.length - 1].value;
  }

  /**
   * Get metric with trend information
   */
  getMetricWithTrend(key: string): MetricWithTrend | null {
    const history = this.history.get(key);
    if (!history || history.length < 2) {
      const current = history?.[0]?.value ?? 0;
      return {
        current,
        previous: current,
        trend: 'stable',
        changePercent: 0,
      };
    }

    const current = history[history.length - 1].value;
    const previous = history[history.length - 2].value;
    const change = current - previous;
    const changePercent = previous !== 0 ? (change / previous) * 100 : 0;

    let trend: TrendDirection = 'stable';
    if (Math.abs(changePercent) > 1) {
      trend = change > 0 ? 'up' : 'down';
    }

    return { current, previous, trend, changePercent };
  }

  /**
   * Get historical values for a metric
   */
  getHistory(key: string): MetricHistory[] {
    return this.history.get(key) ?? [];
  }

  /**
   * Get all available metric keys
   */
  getAvailableMetrics(): string[] {
    return Array.from(this.history.keys());
  }

  /**
   * Calculate rolling average for a metric
   */
  getRollingAverage(key: string, windowSize: number = 12): number | undefined {
    const history = this.history.get(key);
    if (!history || history.length === 0) return undefined;

    const window = history.slice(-windowSize);
    const sum = window.reduce((acc, h) => acc + h.value, 0);
    return sum / window.length;
  }

  /**
   * Get min/max values for a metric
   */
  getMinMax(key: string): { min: number; max: number } | null {
    const history = this.history.get(key);
    if (!history || history.length === 0) return null;

    let min = Infinity;
    let max = -Infinity;

    for (const h of history) {
      if (h.value < min) min = h.value;
      if (h.value > max) max = h.value;
    }

    return { min, max };
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.history.clear();
  }

  /**
   * Extract metrics from state
   */
  private extractMetrics(state: GameStateSnapshot): Record<string, number> {
    const metrics: Record<string, number> = {};

    // Current month
    metrics['currentMonth'] = state.currentMonth ?? 0;

    // Quality of life
    const qol = (state as Record<string, unknown>).qualityOfLifeSystems as Record<string, unknown> | undefined;
    if (qol) {
      if (typeof qol.overall === 'number') {
        metrics['qol.overall'] = qol.overall;
      }
      const dimensions = qol.dimensions as Record<string, number> | undefined;
      if (dimensions) {
        for (const [dim, value] of Object.entries(dimensions)) {
          if (typeof value === 'number') {
            metrics[`qol.${dim}`] = value;
          }
        }
      }
    }

    // Global metrics
    const globalMetrics = (state as Record<string, unknown>).globalMetrics as Record<string, unknown> | undefined;
    if (globalMetrics) {
      for (const [key, value] of Object.entries(globalMetrics)) {
        if (typeof value === 'number') {
          metrics[`global.${key}`] = value;
        }
      }
    }

    // Society metrics
    const society = (state as Record<string, unknown>).humanSociety as Record<string, unknown> | undefined;
    if (society) {
      for (const [key, value] of Object.entries(society)) {
        if (typeof value === 'number') {
          metrics[`society.${key}`] = value;
        }
      }
    }

    // Government metrics
    const government = (state as Record<string, unknown>).government as Record<string, unknown> | undefined;
    if (government) {
      for (const [key, value] of Object.entries(government)) {
        if (typeof value === 'number') {
          metrics[`government.${key}`] = value;
        }
      }
    }

    return metrics;
  }

  /**
   * Get summary statistics for dashboard
   */
  getSummaryStats(): {
    totalMetricsTracked: number;
    historyMonths: number;
    improvingMetrics: number;
    decliningMetrics: number;
  } {
    let improving = 0;
    let declining = 0;

    for (const key of this.history.keys()) {
      const trend = this.getMetricWithTrend(key);
      if (trend) {
        if (trend.trend === 'up') improving++;
        else if (trend.trend === 'down') declining++;
      }
    }

    return {
      totalMetricsTracked: this.history.size,
      historyMonths: this.maxHistoryLength,
      improvingMetrics: improving,
      decliningMetrics: declining,
    };
  }
}
