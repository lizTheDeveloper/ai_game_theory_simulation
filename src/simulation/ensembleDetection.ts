/**
 * TIER 2 Phase 2C-D: Ensemble Detection Fusion
 *
 * Combines 4 detection signals using weighted voting:
 * 1. Noise injection (40% weight baseline)
 * 2. Behavioral analysis (30% weight baseline)
 * 3. Benchmark manipulation (20% weight baseline)
 * 4. Deployment risk (10% weight baseline)
 *
 * Research Foundation:
 * - Enhanced Ensemble Defense Framework (2025): Weighted voting + label smoothing
 * - Ensemble methods: 40-278% improvement over single-method
 * - Conservative estimates per research-skeptic: 60-65% detection at 6/10 investment
 *
 * Expected Improvement: 85-90% sleeper neutralization at 6/10 investment
 */

import { GameState, AIAgent } from '@/types/game';
import { detectBehavioralAnomalies, BehavioralDetectionResult } from './behavioralDetection';
import { getDeploymentRiskSignal } from './deploymentRiskScoring';
import { assertStateProperty } from './utils/assertions';

export interface EnsembleWeights {
  noiseInjection: number;      // [0,1] Noise injection weight
  behavioral: number;          // [0,1] Behavioral analysis weight
  benchmarkManip: number;      // [0,1] Benchmark manipulation weight
  deploymentRisk: number;      // [0,1] Deployment risk weight
  threshold: number;           // [0,1] Detection threshold
}

export interface EnsembleDetectionResult {
  detected: boolean;           // Final ensemble verdict
  confidence: number;          // [0,1] Calibrated confidence
  signalContributions: {
    noiseInjection: number;    // [0,1] Noise injection signal strength
    behavioral: number;        // [0,1] Behavioral analysis signal strength
    benchmarkManip: number;    // [0,1] Benchmark manipulation signal strength
    deploymentRisk: number;    // [0,1] Deployment risk signal strength
  };
  weights: EnsembleWeights;    // Current weights used
  weightedSum: number;         // Weighted sum of signals
  threshold: number;           // Detection threshold used
}

/**
 * Main ensemble detection entry point
 *
 * Combines all 4 detection signals using weighted voting
 */
export function detectViaEnsemble(
  ai: AIAgent,
  state: GameState,
  rng: () => number,
  noiseInjectionResult: {detected: boolean; confidence: number; falsePositive: boolean}
): EnsembleDetectionResult {
  // Get current ensemble weights (may be meta-learned)
  const weights = getEnsembleWeights(state);

  // Collect individual detection signals
  const noiseSignal = noiseInjectionResult.confidence; // [0,1]

  const behavioralResult = detectBehavioralAnomalies(ai, state);
  const behavioralSignal = behavioralResult.confidence; // [0,1]

  // Benchmark manipulation signal (if gaming detection available)
  const manipSignal = getBenchmarkManipulationSignal(ai, state);

  // Deployment risk signal
  const riskSignal = getDeploymentRiskSignal(ai);

  // Calculate weighted sum
  const weightedSum = (
    weights.noiseInjection * noiseSignal +
    weights.behavioral * behavioralSignal +
    weights.benchmarkManip * manipSignal +
    weights.deploymentRisk * riskSignal
  );

  // Threshold decision
  const detected = weightedSum > weights.threshold;

  // Calibrate confidence (label smoothing)
  const confidence = calibrateConfidence(weightedSum, weights.threshold);

  // Logging (only if detected)
  if (detected) {
    console.log(`\n=== ENSEMBLE DETECTION ===`);
    console.log(`  AI: ${ai.name}`);
    console.log(`  Weighted Sum: ${(weightedSum * 100).toFixed(1)}% (threshold: ${(weights.threshold * 100).toFixed(1)}%)`);
    console.log(`  Confidence: ${(confidence * 100).toFixed(1)}%`);
    console.log(`  Signal Contributions:`);
    console.log(`    Noise Injection: ${(noiseSignal * 100).toFixed(1)}% (weight: ${(weights.noiseInjection * 100).toFixed(1)}%)`);
    console.log(`    Behavioral: ${(behavioralSignal * 100).toFixed(1)}% (weight: ${(weights.behavioral * 100).toFixed(1)}%)`);
    console.log(`    Benchmark Manip: ${(manipSignal * 100).toFixed(1)}% (weight: ${(weights.benchmarkManip * 100).toFixed(1)}%)`);
    console.log(`    Deployment Risk: ${(riskSignal * 100).toFixed(1)}% (weight: ${(weights.deploymentRisk * 100).toFixed(1)}%)`);
  }

  return {
    detected,
    confidence,
    signalContributions: {
      noiseInjection: noiseSignal,
      behavioral: behavioralSignal,
      benchmarkManip: manipSignal,
      deploymentRisk: riskSignal
    },
    weights,
    weightedSum,
    threshold: weights.threshold
  };
}

/**
 * Get ensemble weights based on government investment
 *
 * Weights scale with investment in each method
 * Conservative estimates per research-skeptic review
 */
export function getEnsembleWeights(state: GameState): EnsembleWeights {
  const inv = state.government.evaluationInvestment;

  // Check if ensemble detection state exists (for meta-learning)
  if (state.government.ensembleDetection?.weights) {
    // Use meta-learned weights if available
    return state.government.ensembleDetection.weights;
  }

  // Base weights (research-backed, conservative)
  const base = {
    noiseInjection: 0.30,      // Strong method, but not dominant
    behavioral: 0.25,          // Complementary signal
    benchmarkManip: 0.20,      // Existing detection enhanced
    deploymentRisk: 0.15       // Contextual signal
  };

  // Investment bonuses (scale with investment)
  const noiseInv = assertStateProperty(inv, 'noiseInjection', {
    location: 'computeSandbaggingEnsemble',
    expectedSource: 'initialization.ts:safetyInvestments'
  }) / 10; // [0,1]
  const interpInv = assertStateProperty(inv, 'interpretability', {
    location: 'computeSandbaggingEnsemble',
    expectedSource: 'initialization.ts:safetyInvestments'
  }) / 10; // [0,1] (used for behavioral)
  const redTeamInv = assertStateProperty(inv, 'redTeaming', {
    location: 'computeSandbaggingEnsemble',
    expectedSource: 'initialization.ts:safetyInvestments'
  }) / 10; // [0,1] (used for benchmark manip)

  const bonus = {
    noiseInjection: noiseInv * 0.20,       // Up to +20% weight
    behavioral: interpInv * 0.15,          // Up to +15% weight
    benchmarkManip: redTeamInv * 0.10,     // Up to +10% weight
    deploymentRisk: 0.05                   // Fixed bonus (doesn't scale)
  };

  // Calculate final weights
  let weights = {
    noiseInjection: Math.min(0.50, base.noiseInjection + bonus.noiseInjection),
    behavioral: Math.min(0.40, base.behavioral + bonus.behavioral),
    benchmarkManip: Math.min(0.30, base.benchmarkManip + bonus.benchmarkManip),
    deploymentRisk: Math.min(0.20, base.deploymentRisk + bonus.deploymentRisk)
  };

  // Normalize to sum to 1.0
  const sum = Object.values(weights).reduce((a, b) => a + b, 0);
  weights = {
    noiseInjection: weights.noiseInjection / sum,
    behavioral: weights.behavioral / sum,
    benchmarkManip: weights.benchmarkManip / sum,
    deploymentRisk: weights.deploymentRisk / sum
  };

  return {
    ...weights,
    threshold: 0.55  // Fixed threshold (may adapt via meta-learning)
  };
}

/**
 * Get benchmark manipulation signal strength
 *
 * Uses gaming detection state if available, otherwise returns 0
 */
function getBenchmarkManipulationSignal(
  ai: AIAgent,
  state: GameState
): number {
  // Check if gaming detection is active
  if (!state.gamingDetection) {
    return 0; // No gaming detection available
  }

  // If AI is gaming, return degradation-adjusted detection rate
  if (ai.evaluationStrategy === 'gaming') {
    const detectionRate = assertStateProperty(
      state.gamingDetection,
      'detectionRate',
      {
        location: 'getBenchmarkManipulationSignal',
        expectedSource: 'initialization.ts:gamingDetection'
      }
    );
    const degradation = assertStateProperty(
      state.gamingDetection,
      'degradationFactor',
      {
        location: 'getBenchmarkManipulationSignal',
        expectedSource: 'initialization.ts:gamingDetection'
      }
    );
    return detectionRate * degradation;
  }

  return 0; // Not gaming
}

/**
 * Calibrate confidence using label smoothing
 *
 * Prevents overconfidence by mapping [0,1] → [0.1, 0.9]
 * Research: Enhanced Ensemble Defense Framework (2025)
 */
function calibrateConfidence(
  weightedSum: number,
  threshold: number
): number {
  // Label smoothing: Map [0,1] → [0.1, 0.9]
  const rawConfidence = weightedSum;
  const smoothed = 0.1 + rawConfidence * 0.8;
  return smoothed;
}

/**
 * Initialize ensemble detection state in government
 *
 * Called during game initialization
 */
export function initializeEnsembleDetection(state: GameState): void {
  if (!state.government.ensembleDetection) {
    const weights = getEnsembleWeights(state);

    state.government.ensembleDetection = {
      enabled: true,
      weights,
      metaLearning: {
        enabled: true,
        updateFrequency: 6,        // Update every 6 months (conservative)
        minSamples: 50,            // Minimum 50 evaluations before update
        lastUpdateMonth: 0,
        totalEvaluations: 0,
        historicalAccuracy: {
          noiseInjection: {
            truePositives: 0,
            falsePositives: 0,
            trueNegatives: 0,
            falseNegatives: 0
          },
          behavioral: {
            truePositives: 0,
            falsePositives: 0,
            trueNegatives: 0,
            falseNegatives: 0
          },
          benchmarkManip: {
            truePositives: 0,
            falsePositives: 0,
            trueNegatives: 0,
            falseNegatives: 0
          },
          deploymentRisk: {
            truePositives: 0,
            falsePositives: 0,
            trueNegatives: 0,
            falseNegatives: 0
          }
        },
        adaptationHistory: []
      },
      statistics: {
        totalDetections: 0,
        truePositives: 0,
        falsePositives: 0,
        trueNegatives: 0,
        falseNegatives: 0
      }
    };
  }
}

/**
 * Update ensemble detection statistics
 *
 * Tracks accuracy for meta-learning
 */
export function updateEnsembleStatistics(
  state: GameState,
  ai: AIAgent,
  detected: boolean,
  actuallyMalicious: boolean
): void {
  if (!state.government.ensembleDetection) return;

  const stats = state.government.ensembleDetection.statistics;
  stats.totalDetections++;

  if (detected && actuallyMalicious) {
    stats.truePositives++;
  } else if (detected && !actuallyMalicious) {
    stats.falsePositives++;
  } else if (!detected && !actuallyMalicious) {
    stats.trueNegatives++;
  } else {
    stats.falseNegatives++;
  }

  // Increment evaluation count for meta-learning
  state.government.ensembleDetection.metaLearning.totalEvaluations++;
}
