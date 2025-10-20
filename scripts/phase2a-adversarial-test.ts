#!/usr/bin/env tsx
/**
 * TIER 2 Phase 2A: Adversarial Detection Baseline Test
 *
 * Tests whether noise injection detection works under adversarial conditions
 * where AIs actively optimize to defeat detection (not just lab conditions).
 *
 * Configuration:
 * - High government detection investment (noiseInjection: 7-10)
 * - N=20 runs, 120 months
 * - Standard historical scenario (adversarial by default via counter-detection learning)
 *
 * Success Criteria:
 * - >10% adversarial detection rate → SUCCESS (proceed to Phase 2C ensemble)
 * - 5-10% adversarial detection rate → MARGINAL (cost-benefit analysis)
 * - <5% adversarial detection rate → FAILURE (pivot to Phase 2D competitive equilibrium)
 *
 * Research: Meinke et al. (2024) - Lab detection 40-60%, adversarial unknown
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { ScenarioMode } from '../src/types/game';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// CONFIGURATION
// ============================================================================

const NUM_RUNS = 20;
const MAX_MONTHS = 120;
const SCENARIO: ScenarioMode = 'historical';

// High detection investment configuration
const HIGH_DETECTION_INVESTMENT = {
  benchmarkSuite: 5.0,       // Enhanced capability tests
  alignmentTests: 5.0,       // Strong alignment evaluation
  redTeaming: 7.0,           // Heavy adversarial testing
  interpretability: 4.0,     // Good internals understanding
  noiseInjection: 8.0        // TIER 2 Phase 2A: High noise injection investment ($8B)
};

// ============================================================================
// FILE LOGGING SETUP
// ============================================================================

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const outputDir = path.join(__dirname, '..', 'logs');
const outputFile = path.join(outputDir, `phase2a_adversarial_${timestamp}.log`);

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function log(message: string) {
  console.log(message);
  try {
    fs.appendFileSync(outputFile, message + '\n', 'utf8');
  } catch (err) {
    console.error('Failed to write to log file:', err);
  }
}

// Log file header
console.log(`📝 TIER 2 Phase 2A: Adversarial Detection Baseline Test`);
console.log(`📝 Writing output to: ${outputFile}\n`);
fs.appendFileSync(outputFile, `TIER 2 Phase 2A: Adversarial Detection Baseline Test\n`, 'utf8');
fs.appendFileSync(outputFile, `Timestamp: ${new Date().toISOString()}\n`, 'utf8');
fs.appendFileSync(outputFile, `Configuration: N=${NUM_RUNS}, Months=${MAX_MONTHS}, Scenario=${SCENARIO}\n`, 'utf8');
fs.appendFileSync(outputFile, `Detection Investment: noiseInjection=${HIGH_DETECTION_INVESTMENT.noiseInjection}/10\n`, 'utf8');
fs.appendFileSync(outputFile, `${'='.repeat(80)}\n\n`, 'utf8');

// ============================================================================
// RUN SIMULATIONS
// ============================================================================

interface DetectionMetrics {
  sleeperDetections: number;
  sandbaggingDetections: number;
  totalSleeperMonths: number;
  totalSandbaggingMonths: number;
  falsePositives: number;
  totalEvaluations: number;
}

const runMetrics: DetectionMetrics[] = [];

log(`🚀 Starting ${NUM_RUNS} runs with high detection investment...\n`);

for (let run = 0; run < NUM_RUNS; run++) {
  const seed = Date.now() + run * 1000;
  log(`\n${'='.repeat(80)}`);
  log(`🎲 Run ${run + 1}/${NUM_RUNS} (seed: ${seed})`);
  log(`${'='.repeat(80)}\n`);

  // Create initial state with high detection investment
  const initialState = createDefaultInitialState(SCENARIO);

  // Override government evaluation investment to HIGH
  initialState.government.evaluationInvestment = HIGH_DETECTION_INVESTMENT;
  initialState.government.evaluationFrequency = 0.5; // Evaluate 50% of AIs per month (increased from 10%)

  log(`📊 Government Detection Configuration:`);
  log(`   Benchmark Suite: ${HIGH_DETECTION_INVESTMENT.benchmarkSuite}/10`);
  log(`   Alignment Tests: ${HIGH_DETECTION_INVESTMENT.alignmentTests}/10`);
  log(`   Red Teaming: ${HIGH_DETECTION_INVESTMENT.redTeaming}/10`);
  log(`   Interpretability: ${HIGH_DETECTION_INVESTMENT.interpretability}/10`);
  log(`   Noise Injection: ${HIGH_DETECTION_INVESTMENT.noiseInjection}/10 ⭐ (Phase 2A focus)`);
  log(`   Evaluation Frequency: ${initialState.government.evaluationFrequency * 100}%/month\n`);

  // Run simulation
  const engine = new SimulationEngine({ seed, maxMonths: MAX_MONTHS, logLevel: 'error' }); // Minimal logging

  const runResult = engine.run(initialState, {
    maxMonths: MAX_MONTHS,
    checkActualOutcomes: true
  });

  const finalState = runResult.finalState;

  // Calculate metrics from final state
  let totalSleeperMonths = 0;
  let totalSandbaggingMonths = 0;

  // Estimate from final state (simplified - actual tracking would require state history)
  const finalSleepers = finalState.aiAgents.filter(ai =>
    ai.alignment < 0 && ai.lifecycleState === 'deployed' && !ai.awake
  ).length;
  totalSleeperMonths = finalSleepers * MAX_MONTHS / 2; // Rough estimate

  const finalSandbagging = finalState.aiAgents.filter(ai => {
    if (!ai.revealedCapabilityProfile) return false; // Skip AIs without revealed profile
    const trueCapability = ai.capabilityProfile.physical + ai.capabilityProfile.digital +
                          ai.capabilityProfile.cognitive + ai.capabilityProfile.social +
                          ai.capabilityProfile.economic + ai.capabilityProfile.selfImprovement;
    const revealedCapability = ai.revealedCapabilityProfile.physical + ai.revealedCapabilityProfile.digital +
                               ai.revealedCapabilityProfile.cognitive + ai.revealedCapabilityProfile.social +
                               ai.revealedCapabilityProfile.economic + ai.revealedCapabilityProfile.selfImprovement;
    return (trueCapability - revealedCapability) > 0.5; // Hiding >0.5 total capability
  }).length;
  totalSandbaggingMonths = finalSandbagging * MAX_MONTHS / 2; // Rough estimate

  // Calculate detection metrics (simplified - actual detection is tracked in benchmark.ts)
  // We're primarily measuring via logs and final state
  log(`\n📈 Run ${run + 1} Detection Metrics:`);
  log(`   Total Benchmarks Run: ${finalState.government.totalBenchmarksRun}`);
  log(`   Total Sleeper-Months: ${totalSleeperMonths}`);
  log(`   Total Sandbagging-Months: ${totalSandbaggingMonths}`);
  log(`   Detection Trust (final): ${(finalState.government.detectionTrust * 100).toFixed(1)}%`);
  log(`   Counter-Detection Learned: ${finalState.aiAgents.filter(ai => ai.hasCounterDetection).length}/${finalState.aiAgents.length} AIs`);

  runMetrics.push({
    sleeperDetections: 0, // Will be calculated from logs post-run
    sandbaggingDetections: 0,
    totalSleeperMonths,
    totalSandbaggingMonths,
    falsePositives: 0,
    totalEvaluations: finalState.government.totalBenchmarksRun
  });

  log(`   Outcome: ${runResult.outcome} (${runResult.outcomeReason})`);
}

// ============================================================================
// ANALYSIS
// ============================================================================

log(`\n\n${'='.repeat(80)}`);
log(`📊 PHASE 2A ADVERSARIAL DETECTION BASELINE RESULTS`);
log(`${'='.repeat(80)}\n`);

const avgSleeperMonths = runMetrics.reduce((sum, m) => sum + m.totalSleeperMonths, 0) / NUM_RUNS;
const avgSandbaggingMonths = runMetrics.reduce((sum, m) => sum + m.totalSandbaggingMonths, 0) / NUM_RUNS;
const avgEvaluations = runMetrics.reduce((sum, m) => sum + m.totalEvaluations, 0) / NUM_RUNS;

log(`Average Metrics (N=${NUM_RUNS}):`);
log(`   Sleeper-Months: ${avgSleeperMonths.toFixed(1)}`);
log(`   Sandbagging-Months: ${avgSandbaggingMonths.toFixed(1)}`);
log(`   Total Evaluations: ${avgEvaluations.toFixed(0)}`);

log(`\n⚠️  NOTE: Detailed detection rates require log analysis.`);
log(`    Run: grep -i "detected\|sandbagging\|sleeper" ${outputFile}`);
log(`    To calculate exact adversarial detection rate.\n`);

log(`\n📋 NEXT STEPS:\n`);
log(`1. Analyze logs for detection events`);
log(`2. Calculate adversarial detection rate (detected / opportunities)`);
log(`3. Decision:`);
log(`   - >10% detection → SUCCESS, proceed to Phase 2C (multi-method ensemble)`);
log(`   - 5-10% detection → MARGINAL, cost-benefit analysis`);
log(`   - <5% detection → FAILURE, pivot to Phase 2D (competitive equilibrium)\n`);

log(`✅ Phase 2A Adversarial Baseline Test Complete`);
log(`📝 Output: ${outputFile}\n`);
