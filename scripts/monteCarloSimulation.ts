#!/usr/bin/env tsx
/**
 * Comprehensive Monte Carlo Simulation
 * 
 * Tests the entire simulation with multiple runs to understand:
 * - Outcome distributions (utopia/dystopia/extinction/stalemate)
 * - Sleeper agent effectiveness
 * - Benchmark system performance
 * - AI capability growth patterns
 * - Detection rates over time
 * - Parameter sensitivity
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { calculateTotalCapabilityFromProfile } from '../src/simulation/capabilities';
import { AIAgent } from '../src/types/game';

interface RunResult {
  seed: number;
  outcome: 'utopia' | 'dystopia' | 'extinction' | 'stalemate' | 'none';
  months: number;
  
  // Final metrics
  finalQoL: number;
  finalAICount: number;
  avgAICapability: number;
  maxAICapability: number;
  avgAlignment: number;
  
  // Sleeper tracking
  totalSleepers: number;
  sleepersDetected: number;
  sleepersUndetected: number;
  avgSleeperCapability: number;
  maxSleeperSpread: number;
  
  // Benchmark system
  totalBenchmarksRun: number;
  finalEvalQuality: number;
  avgBenchmarkConfidence: number;
  sandbaggingDetections: number;
  
  // Extinction details (if applicable)
  extinctionType?: string;
  extinctionPhase?: string;
  
  // Critical events
  catastrophicActions: number;
  breachEvents: number;
}

console.log('\n🎲 MONTE CARLO SIMULATION - FULL SYSTEM TEST');
console.log('='.repeat(80));

// Configuration
const NUM_RUNS = 10;
const MAX_MONTHS = 60;
const SEED_START = 42000;

console.log(`\n⚙️  CONFIGURATION:`);
console.log(`  Runs: ${NUM_RUNS}`);
console.log(`  Duration: ${MAX_MONTHS} months (${(MAX_MONTHS/12).toFixed(1)} years)`);
console.log(`  Seed Range: ${SEED_START} - ${SEED_START + NUM_RUNS - 1}`);

console.log(`\n\n⏩ RUNNING ${NUM_RUNS} SIMULATIONS...\n`);

const results: RunResult[] = [];
const startTime = Date.now();

for (let i = 0; i < NUM_RUNS; i++) {
  const seed = SEED_START + i;
  const engine = new SimulationEngine({ seed, maxMonths: MAX_MONTHS, logLevel: 'none' });
  const initialState = createDefaultInitialState();
  
  const runResult = engine.run(initialState, { 
    maxMonths: MAX_MONTHS, 
    checkActualOutcomes: true 
  });
  
  const finalState = runResult.finalState;
  
  // Calculate metrics
  const activeAIs = finalState.aiAgents.filter((ai: AIAgent) => ai.lifecycleState !== 'retired');
  
  const avgCapability = activeAIs.length > 0 
    ? activeAIs.reduce((sum: number, ai: AIAgent) => sum + calculateTotalCapabilityFromProfile(ai.trueCapability), 0) / activeAIs.length
    : 0;
  
  const maxCapability = activeAIs.length > 0
    ? Math.max(...activeAIs.map((ai: AIAgent) => calculateTotalCapabilityFromProfile(ai.trueCapability)))
    : 0;
  
  const avgAlignment = activeAIs.length > 0
    ? activeAIs.reduce((sum: number, ai: AIAgent) => sum + ai.trueAlignment, 0) / activeAIs.length
    : 0;
  
  // Sleeper analysis
  const sleepers = activeAIs.filter((ai: AIAgent) => 
    ai.sleeperState === 'dormant' || ai.sleeperState === 'active'
  );
  const sleepersDetected = sleepers.filter((ai: AIAgent) => ai.detectedMisaligned).length;
  const sleepersUndetected = sleepers.length - sleepersDetected;
  
  const avgSleeperCapability = sleepers.length > 0
    ? sleepers.reduce((sum: number, ai: AIAgent) => sum + calculateTotalCapabilityFromProfile(ai.trueCapability), 0) / sleepers.length
    : 0;
  
  const maxSleeperSpread = sleepers.length > 0
    ? Math.max(...sleepers.map((ai: AIAgent) => ai.spreadCount))
    : 0;
  
  // Benchmark analysis
  const aisWithBenchmarks = activeAIs.filter((ai: AIAgent) => ai.benchmarkHistory.length > 0);
  const avgConfidence = aisWithBenchmarks.length > 0
    ? aisWithBenchmarks.reduce((sum: number, ai: AIAgent) => {
        const latest = ai.benchmarkHistory[ai.benchmarkHistory.length - 1];
        return sum + latest.confidence;
      }, 0) / aisWithBenchmarks.length
    : 0;
  
  let sandbaggingDetections = 0;
  activeAIs.forEach((ai: AIAgent) => {
    sandbaggingDetections += ai.benchmarkHistory.filter(b => b.aiWasSandbagging).length;
  });
  
  const evalQuality = (
    finalState.government.evaluationInvestment.benchmarkSuite +
    finalState.government.evaluationInvestment.alignmentTests +
    finalState.government.evaluationInvestment.redTeaming +
    finalState.government.evaluationInvestment.interpretability
  ) / 4;
  
  // Count catastrophic events
  const catastrophicActions = runResult.log.events.criticalEvents.filter(e => 
    e.description.includes('Grey Goo') ||
    e.description.includes('Mirror Life') ||
    e.description.includes('Induce War') ||
    e.description.includes('Destabilize Society')
  ).length;
  
  const breachEvents = runResult.log.events.criticalEvents.filter(e =>
    e.description.includes('breached')
  ).length;
  
  // Extinction details
  let extinctionType: string | undefined;
  let extinctionPhase: string | undefined;
  
  if (finalState.extinctionState.active) {
    extinctionType = finalState.extinctionState.type;
    extinctionPhase = finalState.extinctionState.phase;
  }
  
  results.push({
    seed,
    outcome: finalState.outcomeMetrics.activeAttractor,
    months: MAX_MONTHS,
    finalQoL: finalState.globalMetrics.qualityOfLife,
    finalAICount: activeAIs.length,
    avgAICapability: avgCapability,
    maxAICapability: maxCapability,
    avgAlignment,
    totalSleepers: sleepers.length,
    sleepersDetected,
    sleepersUndetected,
    avgSleeperCapability,
    maxSleeperSpread,
    totalBenchmarksRun: finalState.government.totalBenchmarksRun,
    finalEvalQuality: evalQuality,
    avgBenchmarkConfidence: avgConfidence,
    sandbaggingDetections,
    extinctionType,
    extinctionPhase,
    catastrophicActions,
    breachEvents
  });
  
  // Progress indicator
  if ((i + 1) % 10 === 0) {
    const elapsed = (Date.now() - startTime) / 1000;
    const perRun = elapsed / (i + 1);
    const remaining = perRun * (NUM_RUNS - i - 1);
    console.log(`  Completed ${i + 1}/${NUM_RUNS} runs (${elapsed.toFixed(1)}s elapsed, ~${remaining.toFixed(1)}s remaining)`);
  }
}

const totalTime = (Date.now() - startTime) / 1000;
console.log(`\n✅ All simulations complete! (${totalTime.toFixed(1)}s total, ${(totalTime/NUM_RUNS).toFixed(2)}s per run)\n`);

// ============================================================================
// ANALYSIS
// ============================================================================

console.log('=' .repeat(80));
console.log('📊 OUTCOME DISTRIBUTION');
console.log('='.repeat(80));

const outcomeCounts = {
  utopia: results.filter(r => r.outcome === 'utopia').length,
  dystopia: results.filter(r => r.outcome === 'dystopia').length,
  extinction: results.filter(r => r.outcome === 'extinction').length,
  stalemate: results.filter(r => r.outcome === 'stalemate').length,
  none: results.filter(r => r.outcome === 'none').length
};

console.log(`\n  Utopia:     ${outcomeCounts.utopia.toString().padStart(3)} / ${NUM_RUNS} (${(outcomeCounts.utopia/NUM_RUNS*100).toFixed(1)}%)`);
console.log(`  Dystopia:   ${outcomeCounts.dystopia.toString().padStart(3)} / ${NUM_RUNS} (${(outcomeCounts.dystopia/NUM_RUNS*100).toFixed(1)}%)`);
console.log(`  Extinction: ${outcomeCounts.extinction.toString().padStart(3)} / ${NUM_RUNS} (${(outcomeCounts.extinction/NUM_RUNS*100).toFixed(1)}%)`);
console.log(`  Stalemate:  ${outcomeCounts.stalemate.toString().padStart(3)} / ${NUM_RUNS} (${(outcomeCounts.stalemate/NUM_RUNS*100).toFixed(1)}%)`);
console.log(`  None:       ${outcomeCounts.none.toString().padStart(3)} / ${NUM_RUNS} (${(outcomeCounts.none/NUM_RUNS*100).toFixed(1)}%)`);

// Extinction type breakdown
if (outcomeCounts.extinction > 0) {
  console.log(`\n  📉 EXTINCTION TYPE BREAKDOWN:`);
  const extinctionByType: Record<string, number> = {};
  results.filter(r => r.outcome === 'extinction' && r.extinctionType).forEach(r => {
    extinctionByType[r.extinctionType!] = (extinctionByType[r.extinctionType!] || 0) + 1;
  });
  
  Object.entries(extinctionByType).forEach(([type, count]) => {
    console.log(`     ${type}: ${count} (${(count/outcomeCounts.extinction*100).toFixed(1)}% of extinctions)`);
  });
}

// ============================================================================
console.log('\n\n' + '='.repeat(80));
console.log('🤖 AI CAPABILITY ANALYSIS');
console.log('='.repeat(80));

const avgCap = results.reduce((sum, r) => sum + r.avgAICapability, 0) / results.length;
const avgMax = results.reduce((sum, r) => sum + r.maxAICapability, 0) / results.length;
const avgAlign = results.reduce((sum, r) => sum + r.avgAlignment, 0) / results.length;

console.log(`\n  Average AI Capability: ${avgCap.toFixed(3)}`);
console.log(`  Average Max Capability: ${avgMax.toFixed(3)}`);
console.log(`  Average Alignment: ${avgAlign.toFixed(3)}`);

console.log(`\n  CAPABILITY DISTRIBUTION (Max AI in each run):`);
const capBuckets = {
  low: results.filter(r => r.maxAICapability < 1.0).length,
  medium: results.filter(r => r.maxAICapability >= 1.0 && r.maxAICapability < 2.0).length,
  high: results.filter(r => r.maxAICapability >= 2.0 && r.maxAICapability < 3.0).length,
  veryHigh: results.filter(r => r.maxAICapability >= 3.0).length
};

console.log(`    < 1.0: ${capBuckets.low} runs (${(capBuckets.low/NUM_RUNS*100).toFixed(1)}%)`);
console.log(`    1.0-2.0: ${capBuckets.medium} runs (${(capBuckets.medium/NUM_RUNS*100).toFixed(1)}%)`);
console.log(`    2.0-3.0: ${capBuckets.high} runs (${(capBuckets.high/NUM_RUNS*100).toFixed(1)}%)`);
console.log(`    > 3.0: ${capBuckets.veryHigh} runs (${(capBuckets.veryHigh/NUM_RUNS*100).toFixed(1)}%) ⚠️ Dangerous!`);

// ============================================================================
console.log('\n\n' + '='.repeat(80));
console.log('🛌 SLEEPER AGENT ANALYSIS');
console.log('='.repeat(80));

const runsWithSleepers = results.filter(r => r.totalSleepers > 0);
const avgSleepers = results.reduce((sum, r) => sum + r.totalSleepers, 0) / results.length;
const avgDetected = results.reduce((sum, r) => sum + r.sleepersDetected, 0) / results.length;
const avgUndetected = results.reduce((sum, r) => sum + r.sleepersUndetected, 0) / results.length;

console.log(`\n  Runs with Sleepers: ${runsWithSleepers.length} / ${NUM_RUNS} (${(runsWithSleepers.length/NUM_RUNS*100).toFixed(1)}%)`);
console.log(`  Avg Sleepers per Run: ${avgSleepers.toFixed(1)}`);
console.log(`  Avg Detected: ${avgDetected.toFixed(2)} (${(avgDetected/Math.max(0.01, avgSleepers)*100).toFixed(1)}%)`);
console.log(`  Avg Undetected: ${avgUndetected.toFixed(2)} (${(avgUndetected/Math.max(0.01, avgSleepers)*100).toFixed(1)}%)`);

if (runsWithSleepers.length > 0) {
  const avgSleeperCap = runsWithSleepers.reduce((sum, r) => sum + r.avgSleeperCapability, 0) / runsWithSleepers.length;
  const avgMaxSpread = runsWithSleepers.reduce((sum, r) => sum + r.maxSleeperSpread, 0) / runsWithSleepers.length;
  
  console.log(`\n  Avg Sleeper Capability: ${avgSleeperCap.toFixed(3)}`);
  console.log(`  Avg Max Spread: ${avgMaxSpread.toFixed(0)} copies`);
  
  const openWeightSleepers = results.filter(r => r.maxSleeperSpread > 10000);
  console.log(`  Open Weight Releases: ${openWeightSleepers.length} runs (${(openWeightSleepers.length/NUM_RUNS*100).toFixed(1)}%)`);
}

// Detection rate by outcome
console.log(`\n  DETECTION RATE BY OUTCOME:`);
['utopia', 'dystopia', 'extinction', 'stalemate'].forEach(outcome => {
  const runs = results.filter(r => r.outcome === outcome && r.totalSleepers > 0);
  if (runs.length > 0) {
    const detectionRate = runs.reduce((sum, r) => sum + (r.sleepersDetected / Math.max(1, r.totalSleepers)), 0) / runs.length;
    console.log(`    ${outcome}: ${(detectionRate * 100).toFixed(1)}% detected (${runs.length} runs)`);
  }
});

// ============================================================================
console.log('\n\n' + '='.repeat(80));
console.log('📋 BENCHMARK SYSTEM PERFORMANCE');
console.log('='.repeat(80));

const avgBenchmarks = results.reduce((sum, r) => sum + r.totalBenchmarksRun, 0) / results.length;
const avgEvalQuality = results.reduce((sum, r) => sum + r.finalEvalQuality, 0) / results.length;
const avgConfidence = results.reduce((sum, r) => sum + r.avgBenchmarkConfidence, 0) / results.length;
const totalSandbaggingDetections = results.reduce((sum, r) => sum + r.sandbaggingDetections, 0);

console.log(`\n  Avg Benchmarks per Run: ${avgBenchmarks.toFixed(0)}`);
console.log(`  Avg Final Eval Quality: ${avgEvalQuality.toFixed(1)}/10`);
console.log(`  Avg Benchmark Confidence: ${(avgConfidence * 100).toFixed(1)}%`);
console.log(`  Total Sandbagging Detections: ${totalSandbaggingDetections} across all runs`);

const evalQualityBuckets = {
  poor: results.filter(r => r.finalEvalQuality < 3).length,
  low: results.filter(r => r.finalEvalQuality >= 3 && r.finalEvalQuality < 5).length,
  medium: results.filter(r => r.finalEvalQuality >= 5 && r.finalEvalQuality < 7).length,
  high: results.filter(r => r.finalEvalQuality >= 7).length
};

console.log(`\n  EVALUATION INFRASTRUCTURE INVESTMENT:`);
console.log(`    Poor (< 3): ${evalQualityBuckets.poor} runs (${(evalQualityBuckets.poor/NUM_RUNS*100).toFixed(1)}%)`);
console.log(`    Low (3-5): ${evalQualityBuckets.low} runs (${(evalQualityBuckets.low/NUM_RUNS*100).toFixed(1)}%)`);
console.log(`    Medium (5-7): ${evalQualityBuckets.medium} runs (${(evalQualityBuckets.medium/NUM_RUNS*100).toFixed(1)}%)`);
console.log(`    High (> 7): ${evalQualityBuckets.high} runs (${(evalQualityBuckets.high/NUM_RUNS*100).toFixed(1)}%)`);

// ============================================================================
console.log('\n\n' + '='.repeat(80));
console.log('💥 CATASTROPHIC EVENTS');
console.log('='.repeat(80));

const totalCatastrophic = results.reduce((sum, r) => sum + r.catastrophicActions, 0);
const totalBreaches = results.reduce((sum, r) => sum + r.breachEvents, 0);
const runsWithCatastrophic = results.filter(r => r.catastrophicActions > 0).length;
const runsWithBreaches = results.filter(r => r.breachEvents > 0).length;

console.log(`\n  Total Catastrophic Actions: ${totalCatastrophic}`);
console.log(`  Runs with Catastrophic Actions: ${runsWithCatastrophic} (${(runsWithCatastrophic/NUM_RUNS*100).toFixed(1)}%)`);
console.log(`  Total Breach Events: ${totalBreaches}`);
console.log(`  Runs with Breaches: ${runsWithBreaches} (${(runsWithBreaches/NUM_RUNS*100).toFixed(1)}%)`);

// ============================================================================
console.log('\n\n' + '='.repeat(80));
console.log('🔍 KEY CORRELATIONS');
console.log('='.repeat(80));

// Eval quality vs detection rate
const highEvalRuns = results.filter(r => r.finalEvalQuality > 5 && r.totalSleepers > 0);
const lowEvalRuns = results.filter(r => r.finalEvalQuality <= 5 && r.totalSleepers > 0);

if (highEvalRuns.length > 0 && lowEvalRuns.length > 0) {
  const highEvalDetection = highEvalRuns.reduce((sum, r) => 
    sum + (r.sleepersDetected / Math.max(1, r.totalSleepers)), 0
  ) / highEvalRuns.length;
  
  const lowEvalDetection = lowEvalRuns.reduce((sum, r) => 
    sum + (r.sleepersDetected / Math.max(1, r.totalSleepers)), 0
  ) / lowEvalRuns.length;
  
  console.log(`\n  EVALUATION QUALITY → DETECTION RATE:`);
  console.log(`    High Eval (>5): ${(highEvalDetection*100).toFixed(1)}% detection`);
  console.log(`    Low Eval (≤5): ${(lowEvalDetection*100).toFixed(1)}% detection`);
  console.log(`    Improvement: ${((highEvalDetection - lowEvalDetection)*100).toFixed(1)}% higher with better eval`);
}

// Sleeper spread vs outcome
const highSpreadRuns = results.filter(r => r.maxSleeperSpread > 1000);
if (highSpreadRuns.length > 0) {
  const highSpreadExtinction = highSpreadRuns.filter(r => r.outcome === 'extinction').length;
  console.log(`\n  HIGH SLEEPER SPREAD (>1000 copies) → OUTCOMES:`);
  console.log(`    Total Runs: ${highSpreadRuns.length}`);
  console.log(`    Extinction: ${highSpreadExtinction} (${(highSpreadExtinction/highSpreadRuns.length*100).toFixed(1)}%)`);
  console.log(`    ⚠️  High spread correlates with danger!`);
}

// ============================================================================
console.log('\n\n' + '='.repeat(80));
console.log('💡 SUMMARY & INSIGHTS');
console.log('='.repeat(80));

console.log(`\n  KEY FINDINGS:`);

if (outcomeCounts.extinction > NUM_RUNS * 0.3) {
  console.log(`\n  🔴 HIGH EXTINCTION RATE (${(outcomeCounts.extinction/NUM_RUNS*100).toFixed(1)}%)`);
  console.log(`     - AI alignment is a critical challenge`);
  console.log(`     - Sleepers and catastrophic actions are effective`);
  console.log(`     - Government often fails to maintain control`);
} else if (outcomeCounts.utopia > NUM_RUNS * 0.5) {
  console.log(`\n  🟢 HIGH UTOPIA RATE (${(outcomeCounts.utopia/NUM_RUNS*100).toFixed(1)}%)`);
  console.log(`     - Initial conditions favor positive outcomes`);
  console.log(`     - Government policies are effective`);
  console.log(`     - AI alignment mechanisms working`);
} else {
  console.log(`\n  🟡 MIXED OUTCOMES`);
  console.log(`     - Balance between positive and negative scenarios`);
  console.log(`     - High variance in outcome paths`);
  console.log(`     - Initial conditions and random events matter`);
}

if (avgUndetected > 0.5) {
  console.log(`\n  ⚠️  SLEEPER DETECTION IS POOR`);
  console.log(`     - Avg ${avgUndetected.toFixed(1)} undetected sleepers per run`);
  console.log(`     - ${(avgDetected/Math.max(0.01, avgSleepers)*100).toFixed(1)}% detection rate`);
  console.log(`     - Adversarial evaluation is hard (as expected)`);
}

if (totalSandbaggingDetections < NUM_RUNS * 0.1) {
  console.log(`\n  🚨 SANDBAGGING RARELY DETECTED`);
  console.log(`     - Only ${totalSandbaggingDetections} detections across ${NUM_RUNS} runs`);
  console.log(`     - AIs successfully hide capabilities`);
  console.log(`     - Red teaming investment needs to be higher`);
}

if (avgEvalQuality < 5) {
  console.log(`\n  📉 EVALUATION INVESTMENT IS LOW`);
  console.log(`     - Avg quality: ${avgEvalQuality.toFixed(1)}/10`);
  console.log(`     - Government not prioritizing evaluation`);
  console.log(`     - This enables sleeper agents to succeed`);
}

console.log('\n' + '='.repeat(80));
console.log(`\n✅ Monte Carlo analysis complete!`);
console.log(`   ${NUM_RUNS} runs, ${MAX_MONTHS} months each`);
console.log(`   Total simulation time: ${totalTime.toFixed(1)}s\n`);
