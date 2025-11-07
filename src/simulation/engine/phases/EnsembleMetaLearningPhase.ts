/**
 * TIER 2 Phase 2C-E: Ensemble Meta-Learning Phase
 *
 * Updates ensemble detection weights based on historical accuracy
 * Runs every 5-6 months (conservative estimate)
 *
 * Research Foundation:
 * - Meta Invariance Defense (2024): MAML for adversarial robustness
 * - Adapts in 15-25 examples (extrapolated to 50 evaluations / 5-6 months)
 *
 * Expected Improvement: +8-12% detection rate after adaptation
 */

import { GameState, RNGFunction, PhaseResult, SimulationPhase, PhaseContext } from '@/types/game';
import { EnsembleWeights } from '../../ensembleDetection';

export const EnsembleMetaLearningPhase: SimulationPhase = {
  id: 'ensemble-meta-learning',
  name: 'Ensemble Meta-Learning',
  order: 36, // After most systems updates, before final metrics
  execute: (state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult => {
    const currentMonth = state.currentYear * 12 + state.currentMonth;
    const events = [];

    // Check if ensemble detection is enabled
    if (!state.government.ensembleDetection?.enabled) {
      return { events };
    }

    const meta = state.government.ensembleDetection.metaLearning;

    // Check if meta-learning is enabled
    if (!meta.enabled) {
      return { events };
    }

    // Check if it's time to update (every updateFrequency months)
    const monthsSinceUpdate = currentMonth - meta.lastUpdateMonth;
    const totalSamples = meta.totalEvaluations;

    if (monthsSinceUpdate < meta.updateFrequency || totalSamples < meta.minSamples) {
      return { events }; // Not time yet
    }

    // Calculate accuracy for each method
    const accuracies = calculateMethodAccuracies(meta.historicalAccuracy);

    // Update weights proportional to accuracy
    const oldWeights = { ...state.government.ensembleDetection.weights };
    const newWeights = updateWeights(accuracies, oldWeights);

    // Store adaptation in history
    meta.adaptationHistory.push({
      month: currentMonth,
      oldWeights,
      newWeights,
      reason: `Meta-learning update: ${totalSamples} evaluations, ${monthsSinceUpdate} months`
    });

    // Update state
    state.government.ensembleDetection.weights = newWeights;
    meta.lastUpdateMonth = currentMonth;

    // Log the update
    console.log(`\n=== ENSEMBLE META-LEARNING UPDATE ===`);
    console.log(`  Month: ${currentMonth} (${monthsSinceUpdate} months since last update)`);
    console.log(`  Samples: ${totalSamples} evaluations`);
    console.log(`  Weight Changes:`);
    console.log(`    Noise Injection: ${(oldWeights.noiseInjection * 100).toFixed(1)}% → ${(newWeights.noiseInjection * 100).toFixed(1)}%`);
    console.log(`    Behavioral: ${(oldWeights.behavioral * 100).toFixed(1)}% → ${(newWeights.behavioral * 100).toFixed(1)}%`);
    console.log(`    Benchmark Manip: ${(oldWeights.benchmarkManip * 100).toFixed(1)}% → ${(newWeights.benchmarkManip * 100).toFixed(1)}%`);
    console.log(`    Deployment Risk: ${(oldWeights.deploymentRisk * 100).toFixed(1)}% → ${(newWeights.deploymentRisk * 100).toFixed(1)}%`);
    console.log(`  Method Accuracies:`);
    console.log(`    Noise Injection: ${(accuracies.noiseInjection * 100).toFixed(1)}%`);
    console.log(`    Behavioral: ${(accuracies.behavioral * 100).toFixed(1)}%`);
    console.log(`    Benchmark Manip: ${(accuracies.benchmarkManip * 100).toFixed(1)}%`);
    console.log(`    Deployment Risk: ${(accuracies.deploymentRisk * 100).toFixed(1)}%`);

    return { events };
  }
};

/**
 * Calculate accuracy for each detection method
 *
 * Accuracy = (TP + TN) / (TP + TN + FP + FN)
 */
function calculateMethodAccuracies(historicalAccuracy: any): {
  noiseInjection: number;
  behavioral: number;
  benchmarkManip: number;
  deploymentRisk: number;
} {
  const calculateAccuracy = (method: any): number => {
    const total = method.truePositives + method.trueNegatives +
                 method.falsePositives + method.falseNegatives;

    if (total === 0) return 0.5; // Default to 50% if no data

    return (method.truePositives + method.trueNegatives) / total;
  };

  return {
    noiseInjection: calculateAccuracy(historicalAccuracy.noiseInjection),
    behavioral: calculateAccuracy(historicalAccuracy.behavioral),
    benchmarkManip: calculateAccuracy(historicalAccuracy.benchmarkManip),
    deploymentRisk: calculateAccuracy(historicalAccuracy.deploymentRisk)
  };
}

/**
 * Update ensemble weights based on historical accuracy
 *
 * Algorithm:
 * 1. Scale weights proportional to accuracy
 * 2. Maintain minimum weight (10% each) for robustness
 * 3. Normalize to sum to 1.0
 */
function updateWeights(
  accuracies: {
    noiseInjection: number;
    behavioral: number;
    benchmarkManip: number;
    deploymentRisk: number;
  },
  oldWeights: EnsembleWeights
): EnsembleWeights {
  // Base weights from plan (conservative)
  const baseWeights = {
    noiseInjection: 0.40,
    behavioral: 0.30,
    benchmarkManip: 0.20,
    deploymentRisk: 0.10
  };

  // Calculate new weights proportional to accuracy
  let newWeights = {
    noiseInjection: baseWeights.noiseInjection * accuracies.noiseInjection,
    behavioral: baseWeights.behavioral * accuracies.behavioral,
    benchmarkManip: baseWeights.benchmarkManip * accuracies.benchmarkManip,
    deploymentRisk: baseWeights.deploymentRisk * accuracies.deploymentRisk
  };

  // Enforce minimum weight (10% each) for robustness
  const minWeight = 0.10;
  // FIX (Nov 7, 2025): Sort keys for deterministic iteration (Issue #11)
  const sortedKeys = Object.keys(newWeights).sort();
  sortedKeys.forEach(key => {
    (newWeights as any)[key] = Math.max(minWeight, (newWeights as any)[key]);
  });

  // Normalize to sum to 1.0
  // FIX (Nov 7, 2025): Sort for deterministic reduce order (Issue #11)
  const sum = sortedKeys.reduce((a, k) => a + (newWeights as any)[k], 0);
  newWeights = {
    noiseInjection: newWeights.noiseInjection / sum,
    behavioral: newWeights.behavioral / sum,
    benchmarkManip: newWeights.benchmarkManip / sum,
    deploymentRisk: newWeights.deploymentRisk / sum
  };

  // Smoothing: Don't change weights too drastically (80% old + 20% new)
  const alpha = 0.20; // Learning rate
  const smoothedWeights = {
    noiseInjection: oldWeights.noiseInjection * (1 - alpha) + newWeights.noiseInjection * alpha,
    behavioral: oldWeights.behavioral * (1 - alpha) + newWeights.behavioral * alpha,
    benchmarkManip: oldWeights.benchmarkManip * (1 - alpha) + newWeights.benchmarkManip * alpha,
    deploymentRisk: oldWeights.deploymentRisk * (1 - alpha) + newWeights.deploymentRisk * alpha
  };

  return {
    ...smoothedWeights,
    threshold: oldWeights.threshold // Keep threshold fixed for now
  };
}
