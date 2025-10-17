/**
 * Statistical Analysis Utilities for Monte Carlo Validation
 *
 * Provides distribution analysis, histogram generation, and bimodality detection
 * for understanding variance in simulation outcomes.
 *
 * Key Features:
 * - ASCII histograms (agent and human readable in logs)
 * - Distribution statistics (mean, std, skewness, kurtosis)
 * - Bimodality detection (Hartigan's dip test approximation)
 * - Outlier identification (IQR method)
 */

export interface DistributionStatistics {
  mean: number;
  median: number;
  std: number;
  min: number;
  max: number;
  q1: number;
  q3: number;
  iqr: number;
  skewness: number;
  kurtosis: number;
  coefficientOfVariation: number;
}

export interface BimodalityAnalysis {
  isBimodal: boolean;
  confidence: 'low' | 'medium' | 'high';
  peakCount: number;
  valleyDepth: number;
  explanation: string;
}

export interface HistogramBin {
  min: number;
  max: number;
  count: number;
  percentage: number;
}

/**
 * Calculate comprehensive distribution statistics
 */
export function calculateDistributionStats(values: number[]): DistributionStatistics {
  if (values.length === 0) {
    throw new Error('Cannot calculate statistics for empty array');
  }

  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;

  // Basic statistics
  const mean = values.reduce((sum, v) => sum + v, 0) / n;
  const median = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)];

  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / n;
  const std = Math.sqrt(variance);

  const min = sorted[0];
  const max = sorted[n - 1];

  // Quartiles
  const q1Index = Math.floor(n * 0.25);
  const q3Index = Math.floor(n * 0.75);
  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;

  // Skewness (Fisher-Pearson coefficient)
  const m3 = values.reduce((sum, v) => sum + Math.pow(v - mean, 3), 0) / n;
  const skewness = m3 / Math.pow(std, 3);

  // Kurtosis (excess kurtosis, normal = 0)
  const m4 = values.reduce((sum, v) => sum + Math.pow(v - mean, 4), 0) / n;
  const kurtosis = (m4 / Math.pow(std, 4)) - 3;

  // Coefficient of variation
  const coefficientOfVariation = std / Math.abs(mean);

  return {
    mean,
    median,
    std,
    min,
    max,
    q1,
    q3,
    iqr,
    skewness,
    kurtosis,
    coefficientOfVariation,
  };
}

/**
 * Detect bimodality using peak/valley analysis
 *
 * Approximates Hartigan's dip test with simpler heuristics:
 * - Count peaks in histogram
 * - Measure valley depth between peaks
 * - Assess confidence based on separation
 */
export function detectBimodality(values: number[], binCount: number = 20): BimodalityAnalysis {
  if (values.length < 10) {
    return {
      isBimodal: false,
      confidence: 'low',
      peakCount: 0,
      valleyDepth: 0,
      explanation: 'Insufficient data for bimodality detection (n < 10)',
    };
  }

  const bins = createHistogramBins(values, binCount);
  const counts = bins.map(b => b.count);

  // Find peaks (local maxima)
  const peaks: number[] = [];
  for (let i = 1; i < counts.length - 1; i++) {
    if (counts[i] > counts[i - 1] && counts[i] > counts[i + 1] && counts[i] > 0) {
      peaks.push(i);
    }
  }

  if (peaks.length < 2) {
    return {
      isBimodal: false,
      confidence: 'high',
      peakCount: peaks.length,
      valleyDepth: 0,
      explanation: peaks.length === 0
        ? 'No clear peaks detected (uniform distribution)'
        : 'Single peak detected (unimodal distribution)',
    };
  }

  // Find valley between two largest peaks
  const peaksByHeight = peaks.sort((a, b) => counts[b] - counts[a]);
  const peak1 = peaksByHeight[0];
  const peak2 = peaksByHeight[1];
  const [leftPeak, rightPeak] = peak1 < peak2 ? [peak1, peak2] : [peak2, peak1];

  // Find minimum between peaks
  let valleyIndex = leftPeak;
  let valleyCount = counts[leftPeak];
  for (let i = leftPeak + 1; i <= rightPeak; i++) {
    if (counts[i] < valleyCount) {
      valleyCount = counts[i];
      valleyIndex = i;
    }
  }

  // Calculate valley depth (normalized)
  const leftPeakHeight = counts[leftPeak];
  const rightPeakHeight = counts[rightPeak];
  const avgPeakHeight = (leftPeakHeight + rightPeakHeight) / 2;
  const valleyDepth = (avgPeakHeight - valleyCount) / avgPeakHeight;

  // Assess bimodality confidence
  let isBimodal = false;
  let confidence: 'low' | 'medium' | 'high' = 'low';
  let explanation = '';

  if (valleyDepth > 0.5) {
    isBimodal = true;
    confidence = 'high';
    explanation = `Strong bimodal distribution detected (valley depth ${(valleyDepth * 100).toFixed(1)}%, ${peaks.length} peaks). Suggests two distinct outcome regimes (e.g., survivors vs collapsed states).`;
  } else if (valleyDepth > 0.3) {
    isBimodal = true;
    confidence = 'medium';
    explanation = `Moderate bimodal distribution detected (valley depth ${(valleyDepth * 100).toFixed(1)}%, ${peaks.length} peaks). May indicate crisis cascade effects.`;
  } else if (valleyDepth > 0.15) {
    isBimodal = false;
    confidence = 'low';
    explanation = `Weak bimodal signal detected (valley depth ${(valleyDepth * 100).toFixed(1)}%, ${peaks.length} peaks). Insufficient evidence for distinct modes.`;
  } else {
    isBimodal = false;
    confidence = 'high';
    explanation = `Multiple peaks but shallow valley (depth ${(valleyDepth * 100).toFixed(1)}%). Likely multimodal or noisy unimodal distribution.`;
  }

  return {
    isBimodal,
    confidence,
    peakCount: peaks.length,
    valleyDepth,
    explanation,
  };
}

/**
 * Create histogram bins for distribution visualization
 */
export function createHistogramBins(values: number[], binCount: number = 20): HistogramBin[] {
  if (values.length === 0) return [];

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const binWidth = range / binCount;

  const bins: HistogramBin[] = [];
  for (let i = 0; i < binCount; i++) {
    const binMin = min + i * binWidth;
    const binMax = i === binCount - 1 ? max : binMin + binWidth;

    const count = values.filter(v => v >= binMin && v < binMax).length;
    const percentage = (count / values.length) * 100;

    bins.push({ min: binMin, max: binMax, count, percentage });
  }

  return bins;
}

/**
 * Generate ASCII histogram for terminal/log output
 *
 * Example output:
 * ```
 *   0.0 -  10.0 | ████████████████████ 20 (33.3%)
 *  10.0 -  20.0 | ████████ 8 (13.3%)
 *  20.0 -  30.0 | ████ 4 (6.7%)
 * ```
 */
export function generateAsciiHistogram(
  values: number[],
  binCount: number = 20,
  maxBarWidth: number = 50,
  label?: string
): string {
  if (values.length === 0) return 'No data to visualize';

  const bins = createHistogramBins(values, binCount);
  const maxCount = Math.max(...bins.map(b => b.count));

  let output = '';
  if (label) {
    output += `\n${label}\n`;
    output += `${'='.repeat(Math.min(label.length, 80))}\n`;
  }

  for (const bin of bins) {
    const barLength = Math.round((bin.count / maxCount) * maxBarWidth);
    const bar = '█'.repeat(barLength);
    const labelMin = bin.min.toFixed(1).padStart(6);
    const labelMax = bin.max.toFixed(1).padStart(6);
    const countStr = bin.count.toString().padStart(4);
    const pctStr = `${bin.percentage.toFixed(1)}%`.padStart(6);

    output += `${labelMin} - ${labelMax} | ${bar} ${countStr} (${pctStr})\n`;
  }

  return output;
}

/**
 * Generate comprehensive distribution analysis report
 */
export function generateDistributionReport(
  values: number[],
  metricName: string,
  unit: string = '%'
): string {
  if (values.length === 0) return `No data for ${metricName}`;

  const stats = calculateDistributionStats(values);
  const bimodality = detectBimodality(values);

  let report = `\n${'='.repeat(80)}\n`;
  report += `📊 ${metricName} DISTRIBUTION ANALYSIS (N=${values.length})\n`;
  report += `${'='.repeat(80)}\n\n`;

  // Summary statistics
  report += `📈 SUMMARY STATISTICS:\n`;
  report += `  Mean:     ${(stats.mean * 100).toFixed(1)}${unit}\n`;
  report += `  Median:   ${(stats.median * 100).toFixed(1)}${unit}\n`;
  report += `  Std Dev:  ${(stats.std * 100).toFixed(1)}${unit}\n`;
  report += `  Min:      ${(stats.min * 100).toFixed(1)}${unit}\n`;
  report += `  Max:      ${(stats.max * 100).toFixed(1)}${unit}\n`;
  report += `  Q1:       ${(stats.q1 * 100).toFixed(1)}${unit}\n`;
  report += `  Q3:       ${(stats.q3 * 100).toFixed(1)}${unit}\n`;
  report += `  IQR:      ${(stats.iqr * 100).toFixed(1)}${unit}\n`;
  report += `\n`;

  // Distribution shape
  report += `📐 DISTRIBUTION SHAPE:\n`;
  report += `  Coefficient of Variation: ${(stats.coefficientOfVariation * 100).toFixed(1)}%\n`;
  report += `    ${interpretCV(stats.coefficientOfVariation)}\n`;
  report += `  Skewness: ${stats.skewness.toFixed(3)}\n`;
  report += `    ${interpretSkewness(stats.skewness)}\n`;
  report += `  Kurtosis: ${stats.kurtosis.toFixed(3)}\n`;
  report += `    ${interpretKurtosis(stats.kurtosis)}\n`;
  report += `\n`;

  // Bimodality analysis
  report += `🔬 BIMODALITY ANALYSIS:\n`;
  report += `  Bimodal: ${bimodality.isBimodal ? 'YES' : 'NO'} (confidence: ${bimodality.confidence})\n`;
  report += `  Peak Count: ${bimodality.peakCount}\n`;
  report += `  Valley Depth: ${(bimodality.valleyDepth * 100).toFixed(1)}%\n`;
  report += `  ${bimodality.explanation}\n`;
  report += `\n`;

  // ASCII histogram
  report += generateAsciiHistogram(values, 20, 50, `📊 DISTRIBUTION HISTOGRAM`);

  // Interpretation
  report += `\n\n💡 INTERPRETATION:\n`;
  if (bimodality.isBimodal && bimodality.confidence !== 'low') {
    report += `  ⚠️  BIMODAL DISTRIBUTION DETECTED\n`;
    report += `  This suggests TWO DISTINCT OUTCOME REGIMES:\n`;
    report += `  - Likely cause: Crisis cascades (environmental/social tipping points)\n`;
    report += `  - Some seeds hit tipping points → mass disruption (high ${metricName})\n`;
    report += `  - Other seeds avoid cascades → stability (low ${metricName})\n`;
    report += `  - Recommendation: Investigate crisis correlation, add stabilization mechanisms\n`;
  } else if (stats.coefficientOfVariation > 0.5) {
    report += `  ⚠️  EXTREME VARIANCE (CV > 50%)\n`;
    report += `  This suggests CHAOTIC DYNAMICS:\n`;
    report += `  - Likely cause: Butterfly effects, exponential RNG sensitivity\n`;
    report += `  - Missing negative feedback loops or automatic stabilizers\n`;
    report += `  - Recommendation: Add homeostasis mechanisms, dampen oscillations\n`;
  } else if (stats.coefficientOfVariation > 0.3) {
    report += `  ℹ️  MODERATE VARIANCE (CV 30-50%)\n`;
    report += `  This may represent REALISTIC HISTORICAL CONTINGENCY:\n`;
    report += `  - Random events, policy choices, tipping points matter\n`;
    report += `  - Similar to real-world variation across countries/eras\n`;
    report += `  - Recommendation: Validate variance is research-backed, not artifact\n`;
  } else {
    report += `  ✅ LOW VARIANCE (CV < 30%)\n`;
    report += `  This suggests ROBUST PATTERNS:\n`;
    report += `  - Outcomes converge despite different initial conditions\n`;
    report += `  - Policy effects are consistent and predictable\n`;
    report += `  - Good for research validation and policy recommendations\n`;
  }

  return report;
}

/**
 * Interpret coefficient of variation
 */
function interpretCV(cv: number): string {
  if (cv > 1.0) return '❌ EXTREME VARIANCE (CV > 100% - more variance than mean!)';
  if (cv > 0.5) return '⚠️  Very high variance (CV > 50% - outcomes highly unpredictable)';
  if (cv > 0.3) return 'ℹ️  Moderate variance (CV 30-50% - substantial variation)';
  if (cv > 0.15) return '✅ Low variance (CV 15-30% - relatively stable)';
  return '✅ Very low variance (CV < 15% - highly stable)';
}

/**
 * Interpret skewness
 */
function interpretSkewness(skew: number): string {
  if (Math.abs(skew) < 0.5) return '✅ Approximately symmetric distribution';
  if (skew > 1) return '⚠️  Strongly right-skewed (long tail of high values)';
  if (skew > 0.5) return 'ℹ️  Moderately right-skewed';
  if (skew < -1) return '⚠️  Strongly left-skewed (long tail of low values)';
  return 'ℹ️  Moderately left-skewed';
}

/**
 * Interpret kurtosis
 */
function interpretKurtosis(kurt: number): string {
  if (Math.abs(kurt) < 0.5) return '✅ Normal kurtosis (similar to bell curve)';
  if (kurt > 3) return '⚠️  Very heavy tails (many extreme outliers)';
  if (kurt > 1) return 'ℹ️  Heavy tails (more outliers than normal)';
  if (kurt < -1) return 'ℹ️  Light tails (fewer outliers than normal)';
  return '✅ Slight deviation from normal';
}

/**
 * Identify outliers using IQR method
 */
export function identifyOutliers(values: number[]): { outliers: number[]; indices: number[] } {
  const stats = calculateDistributionStats(values);
  const lowerBound = stats.q1 - 1.5 * stats.iqr;
  const upperBound = stats.q3 + 1.5 * stats.iqr;

  const outliers: number[] = [];
  const indices: number[] = [];

  values.forEach((v, i) => {
    if (v < lowerBound || v > upperBound) {
      outliers.push(v);
      indices.push(i);
    }
  });

  return { outliers, indices };
}
