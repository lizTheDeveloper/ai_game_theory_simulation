/**
 * Anomaly Detection Pipeline
 *
 * Detects anomalies in citation patterns and claim verification
 *
 * Methods:
 * - Isolation Forest (outlier detection)
 * - Local Outlier Factor (density-based)
 * - Statistical thresholds (z-score, IQR)
 *
 * Features extracted:
 * - Citation frequency
 * - Author metrics (h-index, citation count)
 * - Temporal patterns (publication date, age)
 * - Verification confidence
 * - LSS scores
 */

/**
 * Feature vector for anomaly detection
 */
export interface AnomalyFeatures {
  citationFrequency: number; // How often this citation appears
  authorHIndex: number; // Author's h-index
  authorCitations: number; // Total author citations
  publicationAge: number; // Years since publication
  verificationConfidence: number; // Verification confidence score
  lss: number; // Local Surprise Signal
  claimLength: number; // Length of claim text
  numericValue?: number; // Extracted numeric value (if applicable)
}

/**
 * Anomaly detection result
 */
export interface AnomalyResult {
  isAnomaly: boolean;
  score: number; // Anomaly score (higher = more anomalous)
  method: 'isolation_forest' | 'lof' | 'statistical';
  confidence: number;
  reasons: string[];
}

/**
 * Anomaly Detection Pipeline
 */
export class AnomalyDetectionPipeline {
  private trainingData: AnomalyFeatures[] = [];
  private stats: {
    mean: Record<string, number>;
    stdDev: Record<string, number>;
  } | null = null;

  /**
   * Train the anomaly detector on historical data
   *
   * @param data - Training data (normal examples)
   */
  train(data: AnomalyFeatures[]): void {
    console.log(`Training anomaly detector on ${data.length} examples...`);

    this.trainingData = data;

    // Calculate statistics for each feature
    const features = Object.keys(data[0]) as (keyof AnomalyFeatures)[];
    const mean: Record<string, number> = {};
    const stdDev: Record<string, number> = {};

    for (const feature of features) {
      const values = data.map((d) => d[feature] as number).filter((v) => v !== undefined);

      mean[feature] = this.calculateMean(values);
      stdDev[feature] = this.calculateStdDev(values, mean[feature]);
    }

    this.stats = { mean, stdDev };

    console.log('✅ Anomaly detector trained');
  }

  /**
   * Detect if a sample is an anomaly
   *
   * @param features - Feature vector
   * @param method - Detection method
   * @returns Anomaly detection result
   */
  detect(
    features: AnomalyFeatures,
    method: 'isolation_forest' | 'lof' | 'statistical' = 'statistical'
  ): AnomalyResult {
    if (!this.stats && method === 'statistical') {
      throw new Error('Detector not trained. Call train() first.');
    }

    switch (method) {
      case 'isolation_forest':
        return this.isolationForest(features);
      case 'lof':
        return this.localOutlierFactor(features);
      case 'statistical':
        return this.statisticalDetection(features);
      default:
        throw new Error(`Unknown method: ${method}`);
    }
  }

  /**
   * Isolation Forest detection (simplified)
   *
   * Anomalies are easier to isolate (fewer splits needed)
   */
  private isolationForest(features: AnomalyFeatures): AnomalyResult {
    // TODO: Implement proper Isolation Forest
    // For now, use simplified statistical approach

    const reasons: string[] = [];
    let anomalyScore = 0;

    // Check LSS threshold
    if (features.lss > 0.8) {
      reasons.push('High LSS (Local Surprise Signal)');
      anomalyScore += 0.4;
    }

    // Check verification confidence
    if (features.verificationConfidence < 0.5) {
      reasons.push('Low verification confidence');
      anomalyScore += 0.3;
    }

    // Check citation frequency (too low is suspicious)
    if (features.citationFrequency < 5) {
      reasons.push('Low citation frequency (obscure source)');
      anomalyScore += 0.2;
    }

    // Check publication age (too recent might not be peer-reviewed)
    if (features.publicationAge < 1) {
      reasons.push('Very recent publication (< 1 year)');
      anomalyScore += 0.1;
    }

    return {
      isAnomaly: anomalyScore > 0.5,
      score: anomalyScore,
      method: 'isolation_forest',
      confidence: 1 - anomalyScore,
      reasons,
    };
  }

  /**
   * Local Outlier Factor detection
   *
   * Density-based outlier detection
   */
  private localOutlierFactor(features: AnomalyFeatures): AnomalyResult {
    // TODO: Implement proper LOF
    // For now, use distance-based approach

    if (this.trainingData.length === 0) {
      return {
        isAnomaly: false,
        score: 0,
        method: 'lof',
        confidence: 0.5,
        reasons: ['No training data available'],
      };
    }

    // Find k-nearest neighbors
    const k = Math.min(5, this.trainingData.length);
    const distances = this.trainingData.map((sample) =>
      this.euclideanDistance(features, sample)
    );

    distances.sort((a, b) => a - b);
    const kNearestDistances = distances.slice(0, k);
    const avgDistance = this.calculateMean(kNearestDistances);

    // Anomaly if far from neighbors
    const isAnomaly = avgDistance > 2.0;

    return {
      isAnomaly,
      score: Math.min(avgDistance / 3.0, 1.0),
      method: 'lof',
      confidence: isAnomaly ? 1 - avgDistance / 3.0 : avgDistance / 3.0,
      reasons: isAnomaly ? ['Far from normal patterns'] : [],
    };
  }

  /**
   * Statistical detection (z-score based)
   */
  private statisticalDetection(features: AnomalyFeatures): AnomalyResult {
    if (!this.stats) {
      throw new Error('Statistics not calculated. Train first.');
    }

    const reasons: string[] = [];
    let maxZScore = 0;

    // Calculate z-scores for each feature
    for (const [feature, value] of Object.entries(features)) {
      if (value === undefined) continue;

      const mean = this.stats.mean[feature];
      const stdDev = this.stats.stdDev[feature];

      if (stdDev === 0) continue; // Skip constant features

      const zScore = Math.abs((value - mean) / stdDev);

      if (zScore > 3) {
        // 3-sigma rule
        reasons.push(`${feature}: z-score = ${zScore.toFixed(2)} (σ > 3)`);
        maxZScore = Math.max(maxZScore, zScore);
      }
    }

    const isAnomaly = maxZScore > 3;
    const anomalyScore = Math.min(maxZScore / 5, 1.0);

    return {
      isAnomaly,
      score: anomalyScore,
      method: 'statistical',
      confidence: isAnomaly ? 1 - anomalyScore : 1 - anomalyScore / 2,
      reasons,
    };
  }

  // Private helper methods

  private calculateMean(values: number[]): number {
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }

  private calculateStdDev(values: number[], mean: number): number {
    const variance =
      values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private euclideanDistance(a: AnomalyFeatures, b: AnomalyFeatures): number {
    let sum = 0;
    let count = 0;

    for (const key of Object.keys(a) as (keyof AnomalyFeatures)[]) {
      const aVal = a[key];
      const bVal = b[key];

      if (aVal !== undefined && bVal !== undefined) {
        sum += Math.pow((aVal as number) - (bVal as number), 2);
        count++;
      }
    }

    return count > 0 ? Math.sqrt(sum / count) : 0;
  }
}

/**
 * Singleton anomaly detector
 */
export const anomalyDetector = new AnomalyDetectionPipeline();
