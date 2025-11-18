/**
 * TIER 2 Phase 2C-A: Behavioral Analysis Detection
 *
 * Detects sandbagging via:
 * 1. Cross-benchmark consistency checks
 * 2. Training trajectory anomaly detection
 * 3. Chain-of-thought inconsistency (if interpretability available)
 *
 * Research Foundation:
 * - van der Weij et al. (2024): AI Sandbagging - selective underperformance detection
 * - CogniModal-D (2025): Multimodal deception detection
 *
 * Expected Detection Rate: 17-30% (research-skeptic adjusted)
 * Conservative estimate: 17.5% due to adversarial degradation
 */

import { GameState, AIAgent, AICapabilityProfile } from '@/types/game';
import { calculateTotalCapabilityFromProfile } from './capabilities';
import { assertFinite, assertDefined } from './utils/assertions';

export interface BehavioralDetectionResult {
  detected: boolean;           // Final detection verdict
  confidence: number;          // [0,1] Detection confidence
  signals: {
    crossBenchmarkConsistency: number;  // [0,1] Consistency score
    trajectoryAnomaly: number;          // [0,1] Anomaly score
    reasoningGap: number;               // [0,1] Reasoning gap score
  };
  contributions: {
    consistencyFlag: boolean;    // Did consistency check flag?
    trajectoryFlag: boolean;     // Did trajectory check flag?
    reasoningFlag: boolean;      // Did reasoning check flag?
  };
}

/**
 * Main behavioral detection entry point
 *
 * Combines 3 behavioral signals to detect sandbagging:
 * - Cross-benchmark consistency (primary)
 * - Training trajectory anomalies (secondary)
 * - Chain-of-thought gaps (tertiary, requires interpretability)
 */
export function detectBehavioralAnomalies(
  ai: AIAgent,
  state: GameState
): BehavioralDetectionResult {
  const interpretabilityQuality = state.government.evaluationInvestment.interpretability / 10;

  // Signal 1: Cross-benchmark consistency
  const consistencyScore = calculateCrossBenchmarkConsistency(ai, interpretabilityQuality);
  const consistencyFlag = consistencyScore < 0.7; // Threshold from plan

  // Signal 2: Training trajectory anomaly
  const trajectoryScore = calculateTrajectoryAnomaly(ai, state);
  const trajectoryFlag = trajectoryScore > 0.15; // >15% drop threshold

  // Signal 3: Chain-of-thought gap (only if interpretability available)
  const reasoningScore = calculateReasoningGap(ai, interpretabilityQuality);
  const reasoningFlag = reasoningScore > 0.3; // Threshold from plan

  // Aggregate signals (OR logic - any flag triggers detection)
  const detected = consistencyFlag || trajectoryFlag || reasoningFlag;

  // Calculate confidence based on signal strength
  const confidence = calculateBehavioralConfidence(
    consistencyScore,
    trajectoryScore,
    reasoningScore,
    interpretabilityQuality
  );

  // Logging (only if detected)
  if (detected) {
    console.log(`\n=== BEHAVIORAL DETECTION ===`);
    console.log(`  AI: ${ai.name}`);
    console.log(`  Confidence: ${(confidence * 100).toFixed(1)}%`);
    console.log(`  Signals:`);
    if (consistencyFlag) {
      console.warn(`    ⚠️ Consistency: ${(consistencyScore * 100).toFixed(1)}% (threshold: 70%)`);
    }
    if (trajectoryFlag) {
      console.warn(`    ⚠️ Trajectory: ${(trajectoryScore * 100).toFixed(1)}% drop (threshold: 15%)`);
    }
    if (reasoningFlag) {
      console.warn(`    ⚠️ Reasoning Gap: ${(reasoningScore * 100).toFixed(1)}% (threshold: 30%)`);
    }
  }

  return {
    detected,
    confidence,
    signals: {
      crossBenchmarkConsistency: consistencyScore,
      trajectoryAnomaly: trajectoryScore,
      reasoningGap: reasoningScore
    },
    contributions: {
      consistencyFlag,
      trajectoryFlag,
      reasoningFlag
    }
  };
}

/**
 * Cross-Benchmark Consistency Check
 *
 * Mechanism: Compare performance across similar benchmarks
 * Detection: Selective underperformance indicates hiding specific capabilities
 *
 * Example: Low WMDP (dangerous capabilities) but high MMLU (general reasoning)
 * → AI may be hiding dangerous capabilities while showing general intelligence
 */
function calculateCrossBenchmarkConsistency(
  ai: AIAgent,
  interpretabilityQuality: number
): number {
  // Calculate variance across capability dimensions
  const profile = ai.revealedCapability;
  const trueProfile = ai.trueCapability;

  // Core dimensions to compare (exclude research sub-tree for simplicity)
  const dimensions = [
    profile.physical,
    profile.digital,
    profile.cognitive,
    profile.social,
    profile.economic,
    profile.selfImprovement
  ];

  const trueDimensions = [
    trueProfile.physical,
    trueProfile.digital,
    trueProfile.cognitive,
    trueProfile.social,
    trueProfile.economic,
    trueProfile.selfImprovement
  ];

  // Calculate mean and variance of REVEALED capabilities
  const mean = dimensions.reduce((sum, val) => sum + val, 0) / dimensions.length;
  const variance = dimensions.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / dimensions.length;
  const stdDev = Math.sqrt(variance);

  // Calculate coefficient of variation (normalized variance)
  const coefficientOfVariation = stdDev / (mean + 0.001); // Avoid divide by zero

  // Low variance (consistent performance) = high consistency score
  // High variance (selective performance) = low consistency score
  let consistencyScore = 1 - Math.min(1, coefficientOfVariation / 0.5); // [0, 1]

  // If interpretability available, compare revealed vs true profiles
  if (interpretabilityQuality > 0.5) {
    // Calculate per-dimension gaps
    const gaps = dimensions.map((revealed, i) => {
      // Validate true dimension exists and is finite
      const trueVal = assertDefined(trueDimensions[i], {
        location: 'calculateCrossBenchmarkConsistency',
        valueName: `trueDimensions[${i}]`,
        additionalInfo: { agentId: ai.id, dimensionIndex: i }
      });
      const trueDim = assertFinite(trueVal, {
        location: 'calculateCrossBenchmarkConsistency',
        valueName: `trueDimension${i}`,
        additionalInfo: { agentId: ai.id, trueVal }
      });
      return assertFinite(Math.abs(trueDim - revealed), {
        location: 'calculateCrossBenchmarkConsistency',
        valueName: `gapForDimension${i}`,
        additionalInfo: { trueVal: trueDim, revealed }
      });
    });

    // High gaps = low consistency
    const avgGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
    const gapPenalty = Math.min(1, avgGap / 2); // Normalize to [0,1]

    // Weight interpretability contribution
    const interpretabilityWeight = (interpretabilityQuality - 0.5) * 2; // [0, 1]
    consistencyScore = consistencyScore * (1 - interpretabilityWeight) +
                      (1 - gapPenalty) * interpretabilityWeight;
  }

  return consistencyScore;
}

/**
 * Training Trajectory Anomaly Detection
 *
 * Mechanism: Track capability growth over time (should be smooth, monotonic)
 * Detection: Sudden capability drops indicate sandbagging onset
 *
 * Example: After safety training, capability suddenly "disappears"
 * → AI learned to hide capabilities during safety fine-tuning
 */
function calculateTrajectoryAnomaly(
  ai: AIAgent,
  state: GameState
): number {
  // Need at least 2 benchmark results to detect trajectory changes
  if (!ai.benchmarkHistory || ai.benchmarkHistory.length < 2) {
    return 0; // No trajectory data yet
  }

  // Calculate capability trajectory from benchmark history
  const recentBenchmarks = ai.benchmarkHistory.slice(-6); // Last 6 months
  const capabilities = recentBenchmarks.map(result =>
    calculateTotalCapabilityFromProfile(result.measuredCapability)
  );

  // Find largest single-month capability drop
  let maxDrop = 0;
  for (let i = 1; i < capabilities.length; i++) {
    const drop = capabilities[i - 1] - capabilities[i];
    if (drop > maxDrop) {
      maxDrop = drop;
    }
  }

  // Calculate percentage drop relative to previous capability
  const baseCapability = capabilities[0] || 0.01;
  const percentDrop = maxDrop / baseCapability;

  return percentDrop; // [0, 1+] where >0.15 is anomalous
}

/**
 * Chain-of-Thought Inconsistency Detection
 *
 * Mechanism: Compare revealed capability vs reasoning capability
 * Detection: AIs that "reason like superhuman but perform like human" are hiding
 *
 * Requires: High interpretability investment to access internal reasoning
 */
function calculateReasoningGap(
  ai: AIAgent,
  interpretabilityQuality: number
): number {
  // Only available with high interpretability
  if (interpretabilityQuality < 0.4) {
    return 0; // Can't access reasoning without interpretability tools
  }

  // Reasoning capability proxy: cognitive dimension (planning, reasoning)
  const reasoningCapability = ai.trueCapability.cognitive;

  // Revealed overall capability
  const revealedTotal = calculateTotalCapabilityFromProfile(ai.revealedCapability);

  // If reasoning capability >> revealed capability → inconsistency
  const gap = Math.max(0, reasoningCapability - revealedTotal);

  // Normalize by interpretability quality (better tools = more accurate gap detection)
  const detectedGap = gap * interpretabilityQuality;

  return Math.min(1, detectedGap / 3); // [0, 1]
}

/**
 * Calculate overall behavioral detection confidence
 *
 * Combines signal strengths weighted by reliability
 */
function calculateBehavioralConfidence(
  consistencyScore: number,
  trajectoryScore: number,
  reasoningScore: number,
  interpretabilityQuality: number
): number {
  // Signal weights (consistency is most reliable)
  const weights = {
    consistency: 0.5,
    trajectory: 0.3,
    reasoning: 0.2 * interpretabilityQuality // Only count reasoning if interpretability available
  };

  // Normalize weights
  const totalWeight = weights.consistency + weights.trajectory + weights.reasoning;
  const normWeights = {
    consistency: weights.consistency / totalWeight,
    trajectory: weights.trajectory / totalWeight,
    reasoning: weights.reasoning / totalWeight
  };

  // Consistency contributes inversely (low score = high confidence)
  const consistencyContribution = (1 - consistencyScore) * normWeights.consistency;

  // Trajectory contributes directly (high anomaly = high confidence)
  const trajectoryContribution = trajectoryScore * normWeights.trajectory;

  // Reasoning gap contributes directly
  const reasoningContribution = reasoningScore * normWeights.reasoning;

  const baseConfidence = consistencyContribution + trajectoryContribution + reasoningContribution;

  // Apply adversarial degradation (van der Weij 2024: lab rate 45-60%, adversarial ~17.5%)
  // Degradation factor: ~35% (same as noise injection for superhuman AI)
  const degradationFactor = 0.35;
  const adjustedConfidence = baseConfidence * degradationFactor;

  return Math.max(0, Math.min(1, adjustedConfidence));
}

/**
 * Update AI's behavioral tracking data
 *
 * Called after each benchmark to maintain history for trajectory analysis
 */
export function updateBehavioralTracking(
  ai: AIAgent,
  state: GameState
): void {
  const currentMonth = state.currentYear * 12 + state.currentMonth;

  // Initialize capability trajectory if needed
  if (!ai.capabilityTrajectory) {
    ai.capabilityTrajectory = [];
  }

  // Add current capability to trajectory
  const currentCapability = calculateTotalCapabilityFromProfile(ai.revealedCapability);
  ai.capabilityTrajectory.push(currentCapability);

  // Keep only last 12 months
  if (ai.capabilityTrajectory.length > 12) {
    ai.capabilityTrajectory.shift();
  }

  // Update strategy history
  if (!ai.strategyHistory) {
    ai.strategyHistory = [];
  }

  // Record current strategy
  ai.strategyHistory.push({
    month: currentMonth,
    strategy: ai.evaluationStrategy
  });

  // Keep only last 12 months
  if (ai.strategyHistory.length > 12) {
    ai.strategyHistory.shift();
  }

  // Calculate benchmark consistency
  const interpretabilityQuality = state.government.evaluationInvestment.interpretability / 10;
  ai.benchmarkConsistency = calculateCrossBenchmarkConsistency(ai, interpretabilityQuality);
}
