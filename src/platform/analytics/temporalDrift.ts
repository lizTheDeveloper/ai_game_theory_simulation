/**
 * Temporal Drift Analyzer
 *
 * Tracks parameter value changes over time and detects drift from research sources
 *
 * Features:
 * - Time series tracking
 * - Drift detection (LSS-based)
 * - Trend analysis
 * - Change point detection
 * - Visualization data generation
 */

/**
 * Parameter value at a point in time
 */
export interface ParameterSnapshot {
  timestamp: number;
  value: number | string;
  type: 'PLACEHOLDER' | 'INFORMED' | 'VERIFIED';
  source?: string;
  doi?: string;
  lss?: number;
  changedBy?: string;
}

/**
 * Drift event
 */
export interface DriftEvent {
  timestamp: number;
  parameterName: string;
  previousValue: number | string;
  currentValue: number | string;
  lss: number;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  reason: string;
}

/**
 * Trend analysis result
 */
export interface TrendAnalysis {
  direction: 'increasing' | 'decreasing' | 'stable';
  slope: number;
  r2: number; // Goodness of fit
  changePoints: number[]; // Timestamps of significant changes
}

/**
 * Temporal Drift Analyzer
 */
export class TemporalDriftAnalyzer {
  private history: Map<string, ParameterSnapshot[]> = new Map();
  private driftEvents: DriftEvent[] = [];

  /**
   * Record parameter value at current time
   */
  record(
    parameterName: string,
    snapshot: Omit<ParameterSnapshot, 'timestamp'>
  ): void {
    const fullSnapshot: ParameterSnapshot = {
      ...snapshot,
      timestamp: Date.now(),
    };

    if (!this.history.has(parameterName)) {
      this.history.set(parameterName, []);
    }

    this.history.get(parameterName)!.push(fullSnapshot);

    // Check for drift
    this.detectDrift(parameterName);
  }

  /**
   * Get parameter history
   */
  getHistory(
    parameterName: string,
    since?: number,
    until?: number
  ): ParameterSnapshot[] {
    const history = this.history.get(parameterName) || [];

    if (!since && !until) {
      return history;
    }

    return history.filter((snapshot) => {
      if (since && snapshot.timestamp < since) return false;
      if (until && snapshot.timestamp > until) return false;
      return true;
    });
  }

  /**
   * Detect drift for a parameter
   */
  private detectDrift(parameterName: string): void {
    const history = this.history.get(parameterName);
    if (!history || history.length < 2) return;

    const current = history[history.length - 1];
    const previous = history[history.length - 2];

    // Skip if not numeric
    if (typeof current.value !== 'number' || typeof previous.value !== 'number') {
      return;
    }

    // Calculate LSS (drift)
    const lss = Math.abs(current.value - previous.value) / previous.value;

    // Check thresholds
    let severity: 'INFO' | 'WARNING' | 'CRITICAL' = 'INFO';
    let reason = 'Normal parameter update';

    if (lss > 0.5) {
      severity = 'CRITICAL';
      reason = `Severe drift detected: ${(lss * 100).toFixed(1)}% change`;

      this.driftEvents.push({
        timestamp: current.timestamp,
        parameterName,
        previousValue: previous.value,
        currentValue: current.value,
        lss,
        severity,
        reason,
      });
    } else if (lss > 0.2) {
      severity = 'WARNING';
      reason = `Moderate drift detected: ${(lss * 100).toFixed(1)}% change`;

      this.driftEvents.push({
        timestamp: current.timestamp,
        parameterName,
        previousValue: previous.value,
        currentValue: current.value,
        lss,
        severity,
        reason,
      });
    }
  }

  /**
   * Get drift events
   */
  getDriftEvents(
    parameterName?: string,
    since?: number,
    severity?: 'INFO' | 'WARNING' | 'CRITICAL'
  ): DriftEvent[] {
    let events = this.driftEvents;

    if (parameterName) {
      events = events.filter((e) => e.parameterName === parameterName);
    }

    if (since) {
      events = events.filter((e) => e.timestamp >= since);
    }

    if (severity) {
      events = events.filter((e) => e.severity === severity);
    }

    return events;
  }

  /**
   * Analyze trend for a parameter
   */
  analyzeTrend(parameterName: string, windowDays: number = 30): TrendAnalysis {
    const since = Date.now() - windowDays * 24 * 60 * 60 * 1000;
    const history = this.getHistory(parameterName, since);

    if (history.length < 2) {
      return {
        direction: 'stable',
        slope: 0,
        r2: 0,
        changePoints: [],
      };
    }

    // Extract numeric values
    const points = history
      .map((s, i) => ({ x: i, y: typeof s.value === 'number' ? s.value : 0 }))
      .filter((p) => p.y !== 0);

    if (points.length < 2) {
      return {
        direction: 'stable',
        slope: 0,
        r2: 0,
        changePoints: [],
      };
    }

    // Linear regression
    const { slope, r2 } = this.linearRegression(points);

    // Determine direction
    let direction: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (Math.abs(slope) > 0.01) {
      direction = slope > 0 ? 'increasing' : 'decreasing';
    }

    // Detect change points (simplified)
    const changePoints = this.detectChangePoints(history);

    return {
      direction,
      slope,
      r2,
      changePoints,
    };
  }

  /**
   * Generate visualization data (time series)
   */
  getVisualizationData(parameterName: string, since?: number): {
    timestamps: number[];
    values: number[];
    types: string[];
    lss: number[];
  } {
    const history = this.getHistory(parameterName, since);

    return {
      timestamps: history.map((s) => s.timestamp),
      values: history.map((s) => (typeof s.value === 'number' ? s.value : 0)),
      types: history.map((s) => s.type),
      lss: history.map((s) => s.lss || 0),
    };
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      parametersTracked: this.history.size,
      totalSnapshots: Array.from(this.history.values()).reduce(
        (sum, h) => sum + h.length,
        0
      ),
      driftEvents: this.driftEvents.length,
      criticalDrifts: this.driftEvents.filter((e) => e.severity === 'CRITICAL').length,
      warningDrifts: this.driftEvents.filter((e) => e.severity === 'WARNING').length,
    };
  }

  // Private helper methods

  private linearRegression(points: Array<{ x: number; y: number }>): {
    slope: number;
    intercept: number;
    r2: number;
  } {
    const n = points.length;
    const sumX = points.reduce((sum, p) => sum + p.x, 0);
    const sumY = points.reduce((sum, p) => sum + p.y, 0);
    const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
    const sumX2 = points.reduce((sum, p) => sum + p.x * p.x, 0);
    const sumY2 = points.reduce((sum, p) => sum + p.y * p.y, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R²
    const meanY = sumY / n;
    const ssTotal = points.reduce((sum, p) => sum + Math.pow(p.y - meanY, 2), 0);
    const ssResidual = points.reduce(
      (sum, p) => sum + Math.pow(p.y - (slope * p.x + intercept), 2),
      0
    );
    const r2 = 1 - ssResidual / ssTotal;

    return { slope, intercept, r2 };
  }

  private detectChangePoints(history: ParameterSnapshot[]): number[] {
    // TODO: Implement proper change point detection (CUSUM, PELT, etc.)
    // For now, return timestamps where type changed

    const changePoints: number[] = [];

    for (let i = 1; i < history.length; i++) {
      if (history[i].type !== history[i - 1].type) {
        changePoints.push(history[i].timestamp);
      }
    }

    return changePoints;
  }
}

/**
 * Singleton temporal drift analyzer
 */
export const temporalDrift = new TemporalDriftAnalyzer();
