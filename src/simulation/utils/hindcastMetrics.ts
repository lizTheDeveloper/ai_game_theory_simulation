/**
 * Hindcast Validation Metrics
 *
 * Utilities for calculating Normalized Root Mean Square Error (NRMSE) and other
 * validation metrics for historical simulation validation.
 *
 * Created: December 12, 2025
 * Protocol: docs/hindcast_validation_protocol.md
 *
 * CRITICAL: These metrics determine if the simulation is valid for forecasting.
 * NRMSE <10% is the gold standard for publication-quality validation.
 */

import { assertFinite, assertDefined, assertInRange } from './assertions';

/**
 * Single observed vs simulated data point
 */
export interface DataPoint {
  year: number;
  observed: number;
  simulated: number;
  weight?: number; // Optional weight (default 1.0)
}

/**
 * NRMSE calculation result with detailed breakdown
 */
export interface NRMSEResult {
  nrmse: number; // Normalized RMSE (0-1 scale, lower is better)
  nrmsePercent: number; // NRMSE as percentage
  rmse: number; // Raw RMSE
  mae: number; // Mean Absolute Error
  mape: number; // Mean Absolute Percentage Error
  r2: number; // R-squared (coefficient of determination)
  numPoints: number; // Number of data points
  observedRange: [number, number]; // Min/max of observed values
  meanError: number; // Mean error (bias)
  passes: boolean; // True if NRMSE below threshold
  threshold: number; // Threshold used for pass/fail
}

/**
 * Per-decade error analysis
 */
export interface DecadeErrorAnalysis {
  decade: string; // e.g., "1950-1960"
  startYear: number;
  endYear: number;
  nrmse: number;
  numPoints: number;
  meanError: number;
  maxAbsoluteError: number;
}

/**
 * Multi-metric validation report
 */
export interface ValidationReport {
  metrics: Map<string, NRMSEResult>;
  decadeAnalysis: Map<string, DecadeErrorAnalysis[]>;
  overallPass: boolean;
  primaryMetricsPass: boolean;
  secondaryMetricsPass: boolean;
  generatedAt: Date;
  notes: string[];
}

/**
 * Calculate Normalized Root Mean Square Error (NRMSE)
 *
 * NRMSE = RMSE / (max(observed) - min(observed))
 *
 * Normalization by range makes errors comparable across different metrics
 * (e.g., temperature in °C vs population in billions).
 *
 * @param dataPoints - Array of observed vs simulated pairs
 * @param threshold - Threshold for pass/fail (default 0.10 = 10%)
 * @returns Detailed NRMSE result with error metrics
 */
export function calculateNRMSE(
  dataPoints: DataPoint[],
  threshold: number = 0.10
): NRMSEResult {
  assertDefined(dataPoints, {
    location: 'calculateNRMSE',
    valueName: 'dataPoints',
  });

  if (dataPoints.length === 0) {
    throw new Error('❌ calculateNRMSE: dataPoints array is empty');
  }

  assertInRange(threshold, 0, 1, {
    location: 'calculateNRMSE',
    valueName: 'threshold',
  });

  // Extract observed and simulated values
  const observed = dataPoints.map(dp => {
    assertFinite(dp.observed, {
      location: 'calculateNRMSE',
      valueName: 'observed',
      additionalInfo: { year: dp.year },
    });
    return dp.observed;
  });

  const simulated = dataPoints.map(dp => {
    assertFinite(dp.simulated, {
      location: 'calculateNRMSE',
      valueName: 'simulated',
      additionalInfo: { year: dp.year },
    });
    return dp.simulated;
  });

  const weights = dataPoints.map(dp => dp.weight ?? 1.0);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  // Calculate errors
  const errors = dataPoints.map((dp, i) => ({
    absolute: Math.abs(dp.simulated - dp.observed),
    squared: Math.pow(dp.simulated - dp.observed, 2),
    relative: Math.abs((dp.simulated - dp.observed) / dp.observed),
    raw: dp.simulated - dp.observed,
    weight: weights[i],
  }));

  // RMSE (Root Mean Square Error)
  const mse =
    errors.reduce((sum, e) => sum + e.squared * e.weight, 0) / totalWeight;
  const rmse = Math.sqrt(mse);

  // MAE (Mean Absolute Error)
  const mae =
    errors.reduce((sum, e) => sum + e.absolute * e.weight, 0) / totalWeight;

  // MAPE (Mean Absolute Percentage Error)
  // Filter out near-zero observed values to avoid division issues
  const validRelative = errors.filter((e, i) => Math.abs(observed[i]) > 1e-10);
  const mape =
    validRelative.length > 0
      ? validRelative.reduce((sum, e) => sum + e.relative * e.weight, 0) /
        validRelative.reduce((sum, e) => sum + e.weight, 0)
      : 0;

  // Mean Error (bias - positive means overprediction)
  const meanError =
    errors.reduce((sum, e) => sum + e.raw * e.weight, 0) / totalWeight;

  // Normalization: NRMSE = RMSE / range(observed)
  const observedMin = Math.min(...observed);
  const observedMax = Math.max(...observed);
  const observedRange = observedMax - observedMin;

  if (observedRange < 1e-10) {
    throw new Error(
      `❌ calculateNRMSE: observed range too small (${observedRange}). All observed values are essentially identical.`
    );
  }

  const nrmse = rmse / observedRange;
  const nrmsePercent = nrmse * 100;

  // R-squared (coefficient of determination)
  const observedMean = observed.reduce((sum, v) => sum + v, 0) / observed.length;
  const ssTot = observed.reduce((sum, v) => sum + Math.pow(v - observedMean, 2), 0);
  const ssRes = errors.reduce((sum, e) => sum + e.squared, 0);
  const r2 = ssTot > 1e-10 ? 1 - ssRes / ssTot : 0;

  return {
    nrmse: assertFinite(nrmse, {
      location: 'calculateNRMSE',
      valueName: 'nrmse',
      additionalInfo: { rmse, observedRange },
    }),
    nrmsePercent: assertFinite(nrmsePercent, {
      location: 'calculateNRMSE',
      valueName: 'nrmsePercent',
    }),
    rmse: assertFinite(rmse, {
      location: 'calculateNRMSE',
      valueName: 'rmse',
    }),
    mae: assertFinite(mae, {
      location: 'calculateNRMSE',
      valueName: 'mae',
    }),
    mape: assertFinite(mape, {
      location: 'calculateNRMSE',
      valueName: 'mape',
    }),
    r2: assertFinite(r2, {
      location: 'calculateNRMSE',
      valueName: 'r2',
    }),
    numPoints: dataPoints.length,
    observedRange: [observedMin, observedMax],
    meanError: assertFinite(meanError, {
      location: 'calculateNRMSE',
      valueName: 'meanError',
    }),
    passes: nrmse <= threshold,
    threshold,
  };
}

/**
 * Calculate error metrics for each decade
 *
 * Breaks down NRMSE by decade to identify which periods have the worst fit.
 * Useful for targeted parameter calibration.
 *
 * @param dataPoints - Array of observed vs simulated pairs
 * @param decades - Array of decade ranges (e.g., [[1950, 1960], [1960, 1970]])
 * @returns Per-decade error analysis
 */
export function calculateDecadeErrors(
  dataPoints: DataPoint[],
  decades: [number, number][]
): DecadeErrorAnalysis[] {
  return decades.map(([startYear, endYear]) => {
    const decadePoints = dataPoints.filter(
      dp => dp.year >= startYear && dp.year < endYear
    );

    if (decadePoints.length === 0) {
      return {
        decade: `${startYear}-${endYear}`,
        startYear,
        endYear,
        nrmse: 0,
        numPoints: 0,
        meanError: 0,
        maxAbsoluteError: 0,
      };
    }

    const nrmseResult = calculateNRMSE(decadePoints, 0.10);
    const absErrors = decadePoints.map(dp => Math.abs(dp.simulated - dp.observed));

    return {
      decade: `${startYear}-${endYear}`,
      startYear,
      endYear,
      nrmse: nrmseResult.nrmse,
      numPoints: decadePoints.length,
      meanError: nrmseResult.meanError,
      maxAbsoluteError: Math.max(...absErrors),
    };
  });
}

/**
 * Generate standard decade ranges for a time period
 *
 * @param startYear - Start year (e.g., 1950)
 * @param endYear - End year (e.g., 2024)
 * @returns Array of [start, end] decade pairs
 */
export function generateDecadeRanges(
  startYear: number,
  endYear: number
): [number, number][] {
  const decades: [number, number][] = [];
  const startDecade = Math.floor(startYear / 10) * 10;
  const endDecade = Math.floor(endYear / 10) * 10;

  for (let decade = startDecade; decade <= endDecade; decade += 10) {
    const decadeStart = Math.max(decade, startYear);
    const decadeEnd = Math.min(decade + 10, endYear);
    if (decadeStart < decadeEnd) {
      decades.push([decadeStart, decadeEnd]);
    }
  }

  return decades;
}

/**
 * Create validation report for multiple metrics
 *
 * @param metricResults - Map of metric name to NRMSE result
 * @param primaryMetrics - Array of metric names that are mandatory
 * @param decadeAnalysis - Optional per-decade analysis per metric
 * @returns Comprehensive validation report
 */
export function createValidationReport(
  metricResults: Map<string, NRMSEResult>,
  primaryMetrics: string[],
  decadeAnalysis?: Map<string, DecadeErrorAnalysis[]>
): ValidationReport {
  const primaryPasses: boolean[] = [];
  const secondaryPasses: boolean[] = [];
  const notes: string[] = [];

  for (const [metric, result] of metricResults) {
    const isPrimary = primaryMetrics.includes(metric);
    if (isPrimary) {
      primaryPasses.push(result.passes);
      if (!result.passes) {
        notes.push(
          `❌ PRIMARY METRIC FAILED: ${metric} (NRMSE ${result.nrmsePercent.toFixed(1)}% > ${(result.threshold * 100).toFixed(0)}%)`
        );
      }
    } else {
      secondaryPasses.push(result.passes);
      if (!result.passes) {
        notes.push(
          `⚠️ Secondary metric below threshold: ${metric} (NRMSE ${result.nrmsePercent.toFixed(1)}%)`
        );
      }
    }
  }

  const primaryMetricsPass = primaryPasses.every(p => p);
  const secondaryMetricsPass = secondaryPasses.every(p => p);
  const overallPass = primaryMetricsPass && secondaryMetricsPass;

  if (overallPass) {
    notes.push('✅ All metrics pass validation thresholds');
  } else if (primaryMetricsPass) {
    notes.push('✅ Primary metrics pass (secondary metrics need improvement)');
  } else {
    notes.push('❌ VALIDATION FAILED - Primary metrics do not pass');
  }

  return {
    metrics: metricResults,
    decadeAnalysis: decadeAnalysis ?? new Map(),
    overallPass,
    primaryMetricsPass,
    secondaryMetricsPass,
    generatedAt: new Date(),
    notes,
  };
}

/**
 * Format validation report as human-readable text
 *
 * @param report - Validation report to format
 * @returns Multi-line formatted string
 */
export function formatValidationReport(report: ValidationReport): string {
  const lines: string[] = [];

  lines.push('');
  lines.push('='.repeat(80));
  lines.push('📊 HINDCAST VALIDATION REPORT');
  lines.push('='.repeat(80));
  lines.push(`Generated: ${report.generatedAt.toISOString()}`);
  lines.push('');

  // Overall status
  if (report.overallPass) {
    lines.push('✅ VALIDATION PASSED - Model reproduces historical data within acceptable error');
  } else if (report.primaryMetricsPass) {
    lines.push('⚠️ PARTIAL PASS - Primary metrics pass, secondary metrics need improvement');
  } else {
    lines.push('❌ VALIDATION FAILED - Model does not reproduce historical data accurately');
    lines.push('   Cannot be used for forecasting without recalibration');
  }
  lines.push('');

  // Per-metric results
  lines.push('-'.repeat(80));
  lines.push('METRIC RESULTS');
  lines.push('-'.repeat(80));
  lines.push(
    'Metric                 NRMSE   RMSE      MAE       R²      Bias    Pass'
  );
  lines.push('-'.repeat(80));

  for (const [metric, result] of report.metrics) {
    const status = result.passes ? '✅' : '❌';
    const metricPadded = metric.padEnd(20);
    const nrmsePadded = `${result.nrmsePercent.toFixed(1)}%`.padEnd(6);
    const rmsePadded = result.rmse.toFixed(2).padEnd(8);
    const maePadded = result.mae.toFixed(2).padEnd(8);
    const r2Padded = result.r2.toFixed(3).padEnd(6);
    const biasPadded = result.meanError.toFixed(2).padEnd(6);

    lines.push(
      `${metricPadded} ${nrmsePadded}  ${rmsePadded}  ${maePadded}  ${r2Padded}  ${biasPadded}  ${status}`
    );
  }

  lines.push('');

  // Decade analysis (if available)
  if (report.decadeAnalysis.size > 0) {
    lines.push('-'.repeat(80));
    lines.push('DECADE-BY-DECADE ANALYSIS');
    lines.push('-'.repeat(80));

    for (const [metric, decades] of report.decadeAnalysis) {
      lines.push(`\n${metric}:`);
      lines.push('Decade       NRMSE   Points  Mean Error  Max Error');
      for (const decade of decades) {
        if (decade.numPoints === 0) continue;
        const decadePadded = decade.decade.padEnd(11);
        const nrmsePadded = `${(decade.nrmse * 100).toFixed(1)}%`.padEnd(6);
        const pointsPadded = decade.numPoints.toString().padEnd(6);
        const meanPadded = decade.meanError.toFixed(2).padEnd(10);
        const maxPadded = decade.maxAbsoluteError.toFixed(2);
        lines.push(
          `${decadePadded} ${nrmsePadded}  ${pointsPadded}  ${meanPadded}  ${maxPadded}`
        );
      }
    }
    lines.push('');
  }

  // Notes
  if (report.notes.length > 0) {
    lines.push('-'.repeat(80));
    lines.push('NOTES');
    lines.push('-'.repeat(80));
    for (const note of report.notes) {
      lines.push(note);
    }
    lines.push('');
  }

  lines.push('='.repeat(80));
  lines.push('');

  return lines.join('\n');
}
