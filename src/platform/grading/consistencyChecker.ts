/**
 * Grade Consistency Checker
 *
 * Detects grade inflation drift over time using Learning Systems Stability (LSS) monitoring.
 *
 * Features:
 * - Track grade distributions over time
 * - Compare current vs. historical distributions
 * - Detect grade inflation drift (LSS violation)
 * - Statistical significance testing
 * - Alert on consistency violations
 *
 * Integration:
 * - LSS monitor (existing multi-level state)
 * - Auto-grader (grading results)
 * - Historical grade database
 *
 * Usage:
 * ```typescript
 * const checker = new ConsistencyChecker({
 *   lssMonitor: monitor,
 *   historicalWindow: 30, // days
 *   driftThreshold: 0.15  // 15% change
 * });
 *
 * const result = checker.checkConsistency(currentGrades, historicalGrades);
 * // result = { consistent: false, drift: 0.23, alert: '23% grade inflation' }
 * ```
 *
 * Task: 2.2.2 (Phase 1 Week 2)
 */

import { assertDefined, assertInRange } from '@/simulation/utils/assertions';
import { MultiLevelState } from '../multiLevelState';
import { GradingResult } from './autoGrader';

/**
 * Grade distribution
 */
export interface GradeDistribution {
  /**
   * Letter grade counts
   */
  letterCounts: {
    A: number;
    B: number;
    C: number;
    D: number;
    F: number;
  };

  /**
   * Total graded
   */
  total: number;

  /**
   * Average grade (numeric)
   */
  average: number;

  /**
   * Standard deviation
   */
  stdDev: number;

  /**
   * Median grade
   */
  median: number;

  /**
   * Time period
   */
  period: {
    start: number; // timestamp
    end: number; // timestamp
  };
}

/**
 * Consistency check result
 */
export interface ConsistencyCheckResult {
  /**
   * Is grading consistent?
   */
  consistent: boolean;

  /**
   * Drift magnitude (0-1)
   * 0 = no drift, 1 = complete change
   */
  drift: number;

  /**
   * Drift direction
   */
  direction: 'inflation' | 'deflation' | 'stable';

  /**
   * Alert message (if drift detected)
   */
  alert?: string;

  /**
   * Statistical significance (p-value)
   */
  pValue?: number;

  /**
   * Current distribution
   */
  current: GradeDistribution;

  /**
   * Historical distribution
   */
  historical: GradeDistribution;

  /**
   * Timestamp
   */
  timestamp: number;
}

/**
 * Consistency checker configuration
 */
export interface ConsistencyCheckerConfig {
  /**
   * LSS monitor (optional)
   */
  lssMonitor?: MultiLevelState<any, any, any, any>;

  /**
   * Historical window (days)
   * Default: 30
   */
  historicalWindow?: number;

  /**
   * Drift threshold (0-1)
   * Alert if drift > threshold
   * Default: 0.15 (15%)
   */
  driftThreshold?: number;

  /**
   * Minimum samples for comparison
   * Default: 10
   */
  minSamples?: number;

  /**
   * Enable logging
   * Default: false
   */
  enableLogging?: boolean;
}

/**
 * Consistency Checker
 *
 * Monitors grade consistency over time.
 */
export class ConsistencyChecker {
  private config: Required<Omit<ConsistencyCheckerConfig, 'lssMonitor'>> & {
    lssMonitor?: MultiLevelState<any, any, any, any>;
  };
  private checkCount: number;
  private alertCount: number;
  private gradeHistory: GradingResult[];

  constructor(config?: ConsistencyCheckerConfig) {
    this.config = {
      lssMonitor: config?.lssMonitor,
      historicalWindow: config?.historicalWindow ?? 30,
      driftThreshold: config?.driftThreshold ?? 0.15,
      minSamples: config?.minSamples ?? 10,
      enableLogging: config?.enableLogging ?? false,
    };

    assertInRange(this.config.driftThreshold, 0, 1, {
      location: 'ConsistencyChecker.constructor',
      valueName: 'driftThreshold',
    });

    this.checkCount = 0;
    this.alertCount = 0;
    this.gradeHistory = [];
  }

  /**
   * Check grading consistency
   *
   * @param currentGrades - Recent grading results
   * @param historicalGrades - Historical grading results (optional)
   * @returns Consistency check result
   */
  public checkConsistency(
    currentGrades: GradingResult[],
    historicalGrades?: GradingResult[]
  ): ConsistencyCheckResult {
    assertDefined(currentGrades, {
      location: 'ConsistencyChecker.checkConsistency',
      valueName: 'currentGrades',
    });

    this.checkCount++;

    // Use provided historical grades or fetch from history
    const historical =
      historicalGrades ?? this.getHistoricalGrades(currentGrades);

    // Check minimum samples
    if (
      currentGrades.length < this.config.minSamples ||
      historical.length < this.config.minSamples
    ) {
      if (this.config.enableLogging) {
        console.warn(
          `⚠️ ConsistencyChecker: Insufficient samples (current: ${currentGrades.length}, historical: ${historical.length})`
        );
      }

      return {
        consistent: true,
        drift: 0,
        direction: 'stable',
        current: this.calculateDistribution(currentGrades),
        historical: this.calculateDistribution(historical),
        timestamp: Date.now(),
      };
    }

    // Calculate distributions
    const currentDist = this.calculateDistribution(currentGrades);
    const historicalDist = this.calculateDistribution(historical);

    // Calculate drift
    const drift = this.calculateDrift(currentDist, historicalDist);
    const direction = this.determineDriftDirection(
      currentDist,
      historicalDist
    );

    // Check consistency
    const consistent = drift <= this.config.driftThreshold;

    // Generate alert if drift detected
    let alert: string | undefined;
    if (!consistent) {
      this.alertCount++;
      alert = this.generateAlert(drift, direction, currentDist, historicalDist);

      if (this.config.enableLogging) {
        console.warn(`🚨 ConsistencyChecker: ${alert}`);
      }
    } else {
      if (this.config.enableLogging) {
        console.log(
          `✅ ConsistencyChecker: Grades consistent (drift: ${(drift * 100).toFixed(1)}%)`
        );
      }
    }

    // Calculate statistical significance (simple t-test)
    const pValue = this.calculatePValue(currentDist, historicalDist);

    return {
      consistent,
      drift,
      direction,
      alert,
      pValue,
      current: currentDist,
      historical: historicalDist,
      timestamp: Date.now(),
    };
  }

  /**
   * Add grading result to history
   *
   * @param result - Grading result
   */
  public addToHistory(result: GradingResult): void {
    this.gradeHistory.push(result);

    // Trim old history (keep within window)
    const cutoff = Date.now() - this.config.historicalWindow * 24 * 60 * 60 * 1000;
    this.gradeHistory = this.gradeHistory.filter(
      (r) => r.timestamp >= cutoff
    );
  }

  /**
   * Get historical grades within window
   *
   * @param currentGrades - Current grades
   * @returns Historical grades
   */
  private getHistoricalGrades(
    currentGrades: GradingResult[]
  ): GradingResult[] {
    // Get all grades from history that are not in current set
    const currentIds = new Set(currentGrades.map((g) => g.file));

    return this.gradeHistory.filter((g) => !currentIds.has(g.file));
  }

  /**
   * Calculate grade distribution
   *
   * @param grades - Grading results
   * @returns Distribution
   */
  private calculateDistribution(
    grades: GradingResult[]
  ): GradeDistribution {
    if (grades.length === 0) {
      return {
        letterCounts: { A: 0, B: 0, C: 0, D: 0, F: 0 },
        total: 0,
        average: 0,
        stdDev: 0,
        median: 0,
        period: { start: 0, end: 0 },
      };
    }

    // Count letter grades
    const letterCounts = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    const numericGrades: number[] = [];
    let minTimestamp = Infinity;
    let maxTimestamp = -Infinity;

    for (const result of grades) {
      letterCounts[result.letter]++;
      numericGrades.push(result.grade);

      if (result.timestamp < minTimestamp) {
        minTimestamp = result.timestamp;
      }
      if (result.timestamp > maxTimestamp) {
        maxTimestamp = result.timestamp;
      }
    }

    // Calculate statistics
    const total = grades.length;
    const average =
      numericGrades.reduce((sum, g) => sum + g, 0) / numericGrades.length;

    const variance =
      numericGrades.reduce((sum, g) => sum + Math.pow(g - average, 2), 0) /
      numericGrades.length;
    const stdDev = Math.sqrt(variance);

    const sorted = [...numericGrades].sort((a, b) => a - b);
    const median =
      sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];

    return {
      letterCounts,
      total,
      average,
      stdDev,
      median,
      period: {
        start: minTimestamp,
        end: maxTimestamp,
      },
    };
  }

  /**
   * Calculate drift between distributions
   *
   * @param current - Current distribution
   * @param historical - Historical distribution
   * @returns Drift magnitude (0-1)
   */
  private calculateDrift(
    current: GradeDistribution,
    historical: GradeDistribution
  ): number {
    // Use Kullback-Leibler divergence for distribution comparison
    // Simplified version: Compare letter grade proportions

    if (current.total === 0 || historical.total === 0) {
      return 0;
    }

    let divergence = 0;

    for (const letter of ['A', 'B', 'C', 'D', 'F'] as const) {
      const pCurrent = current.letterCounts[letter] / current.total;
      const pHistorical = historical.letterCounts[letter] / historical.total;

      if (pCurrent > 0 && pHistorical > 0) {
        divergence += pCurrent * Math.log(pCurrent / pHistorical);
      }
    }

    // Normalize to [0, 1]
    const normalizedDrift = Math.min(1, divergence / Math.log(5)); // log(5) = max divergence for 5 categories

    return Math.abs(normalizedDrift);
  }

  /**
   * Determine drift direction
   *
   * @param current - Current distribution
   * @param historical - Historical distribution
   * @returns Direction
   */
  private determineDriftDirection(
    current: GradeDistribution,
    historical: GradeDistribution
  ): 'inflation' | 'deflation' | 'stable' {
    const avgDiff = current.average - historical.average;

    if (Math.abs(avgDiff) < 5) {
      // Less than 5 point difference = stable
      return 'stable';
    }

    return avgDiff > 0 ? 'inflation' : 'deflation';
  }

  /**
   * Generate alert message
   *
   * @param drift - Drift magnitude
   * @param direction - Drift direction
   * @param current - Current distribution
   * @param historical - Historical distribution
   * @returns Alert message
   */
  private generateAlert(
    drift: number,
    direction: 'inflation' | 'deflation' | 'stable',
    current: GradeDistribution,
    historical: GradeDistribution
  ): string {
    const driftPercent = (drift * 100).toFixed(1);
    const avgChange = (current.average - historical.average).toFixed(1);

    if (direction === 'inflation') {
      return `Grade inflation detected: ${driftPercent}% drift, average increased by ${avgChange} points (${historical.average.toFixed(1)} → ${current.average.toFixed(1)})`;
    } else if (direction === 'deflation') {
      return `Grade deflation detected: ${driftPercent}% drift, average decreased by ${Math.abs(parseFloat(avgChange))} points (${historical.average.toFixed(1)} → ${current.average.toFixed(1)})`;
    } else {
      return `Grade distribution drift: ${driftPercent}% (direction: stable)`;
    }
  }

  /**
   * Calculate statistical significance (p-value)
   * Simple two-sample t-test
   *
   * @param current - Current distribution
   * @param historical - Historical distribution
   * @returns p-value
   */
  private calculatePValue(
    current: GradeDistribution,
    historical: GradeDistribution
  ): number {
    // Simplified t-test calculation
    if (current.total < 2 || historical.total < 2) {
      return 1.0; // Not enough samples
    }

    const n1 = current.total;
    const n2 = historical.total;
    const mean1 = current.average;
    const mean2 = historical.average;
    const var1 = current.stdDev * current.stdDev;
    const var2 = historical.stdDev * historical.stdDev;

    // Pooled variance
    const pooledVar = ((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2);

    // t-statistic
    const t =
      (mean1 - mean2) / Math.sqrt(pooledVar * (1 / n1 + 1 / n2));

    // Degrees of freedom
    const df = n1 + n2 - 2;

    // Approximate p-value (two-tailed)
    // This is a rough approximation
    const pValue = 2 * (1 - this.tCDF(Math.abs(t), df));

    return Math.min(1, Math.max(0, pValue));
  }

  /**
   * Student's t cumulative distribution function (approximate)
   *
   * @param t - t-statistic
   * @param df - Degrees of freedom
   * @returns CDF value
   */
  private tCDF(t: number, df: number): number {
    // Rough approximation using normal CDF for large df
    if (df > 30) {
      return this.normalCDF(t);
    }

    // For small df, use a simple approximation
    // This is not precise but sufficient for drift detection
    const x = df / (df + t * t);
    return 1 - 0.5 * Math.pow(x, df / 2);
  }

  /**
   * Standard normal cumulative distribution function (approximate)
   *
   * @param x - Value
   * @returns CDF value
   */
  private normalCDF(x: number): number {
    // Approximation using error function
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }

  /**
   * Error function (approximate)
   *
   * @param x - Value
   * @returns erf(x)
   */
  private erf(x: number): number {
    // Abramowitz and Stegun approximation
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y =
      1.0 -
      ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  /**
   * Get consistency statistics
   *
   * @returns Stats
   */
  public getStats(): {
    checkCount: number;
    alertCount: number;
    alertRate: number;
    historySize: number;
  } {
    return {
      checkCount: this.checkCount,
      alertCount: this.alertCount,
      alertRate: this.checkCount > 0 ? this.alertCount / this.checkCount : 0,
      historySize: this.gradeHistory.length,
    };
  }

  /**
   * Clear grade history
   */
  public clearHistory(): void {
    this.gradeHistory = [];
  }

  /**
   * Get current grade history
   *
   * @returns Grade history
   */
  public getHistory(): GradingResult[] {
    return [...this.gradeHistory];
  }
}

/**
 * Create consistency checker
 *
 * @param config - Checker configuration
 * @returns ConsistencyChecker instance
 */
export function createConsistencyChecker(
  config?: ConsistencyCheckerConfig
): ConsistencyChecker {
  return new ConsistencyChecker(config);
}
