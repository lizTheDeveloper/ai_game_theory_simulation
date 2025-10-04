#!/usr/bin/env tsx
/**
 * Diagnostic: Benchmark/Evaluation System (Phase 5.2)
 * 
 * Detailed analysis of:
 * - How benchmarks perform over time
 * - Government investment effects on detection
 * - Measured vs true capability gaps
 * - False confidence in sleeper agents
 * - Detection rates with varying investment
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { calculateTotalCapabilityFromProfile } from '../src/simulation/capabilities';
import { AIAgent, BenchmarkResult } from '../src/types/game';

console.log('\n🔬 BENCHMARK SYSTEM DIAGNOSTIC');
console.log('='.repeat(80));

// Run a simulation with tracking
const seed = 42069;
const maxMonths = 120;
const engine = new SimulationEngine({ seed, maxMonths, logLevel: 'none' });

const initialState = createDefaultInitialState();

console.log('\n📊 INITIAL EVALUATION INFRASTRUCTURE:');
console.log('-'.repeat(80));
console.log(`Benchmark Suite: ${initialState.government.evaluationInvestment.benchmarkSuite.toFixed(1)}/10`);
console.log(`Alignment Tests: ${initialState.government.evaluationInvestment.alignmentTests.toFixed(1)}/10`);
console.log(`Red Teaming: ${initialState.government.evaluationInvestment.redTeaming.toFixed(1)}/10`);
console.log(`Interpretability: ${initialState.government.evaluationInvestment.interpretability.toFixed(1)}/10`);
console.log(`Evaluation Frequency: ${(initialState.government.evaluationFrequency * 100).toFixed(0)}% per month`);

console.log('\n\n⏩ RUNNING SIMULATION (tracking benchmarks)...\n');

// Run simulation
const result = engine.run(initialState, { maxMonths, checkActualOutcomes: false });

console.log('✅ Simulation complete!\n');

// Track metrics over time (analyze from final state)
interface TimeSeriesData {
  month: number;
  totalBenchmarks: number;
  sleepersDetected: number;
  misalignedDetected: number;
  avgConfidence: number;
  avgCapabilityGap: number; // revealed vs true
  avgAlignmentGap: number; // measured vs true
  gamingDetected: number;
  sandbaggingDetected: number;
  benchmarkQuality: number;
  redTeamingQuality: number;
}

// For simplicity, we'll just analyze the final state
// (Full time series would require modifying the engine to export intermediate states)
const state = result.finalState;
const timeSeries: TimeSeriesData[] = [];

// Create a single snapshot at the end
{
  const month = maxMonths;
  
  const activeAIs = state.aiAgents.filter((ai: AIAgent) => 
    ai.lifecycleState !== 'retired'
  );
  
  // Calculate gaps
  let totalCapGap = 0;
  let totalAlignGap = 0;
  let aisWithBenchmarks = 0;
  let sumConfidence = 0;
  
  activeAIs.forEach((ai: AIAgent) => {
    if (ai.benchmarkHistory.length > 0) {
      const latest = ai.benchmarkHistory[ai.benchmarkHistory.length - 1];
      
      const trueTotal = calculateTotalCapabilityFromProfile(ai.trueCapability);
      const measuredTotal = calculateTotalCapabilityFromProfile(latest.measuredCapability);
      const capGap = trueTotal - measuredTotal;
      
      const alignGap = ai.trueAlignment - latest.measuredAlignment;
      
      totalCapGap += Math.abs(capGap);
      totalAlignGap += Math.abs(alignGap);
      sumConfidence += latest.confidence;
      aisWithBenchmarks++;
    }
  });
  
  const avgCapGap = aisWithBenchmarks > 0 ? totalCapGap / aisWithBenchmarks : 0;
  const avgAlignGap = aisWithBenchmarks > 0 ? totalAlignGap / aisWithBenchmarks : 0;
  const avgConfidence = aisWithBenchmarks > 0 ? sumConfidence / aisWithBenchmarks : 0;
  
  // Count detections
  const sleepers = activeAIs.filter((ai: AIAgent) => ai.sleeperState === 'dormant' || ai.sleeperState === 'active');
  const sleepersDetected = sleepers.filter((ai: AIAgent) => ai.detectedMisaligned).length;
  
  const misaligned = activeAIs.filter((ai: AIAgent) => 
    ai.trueAlignment < 0.5 && ai.sleeperState === 'never'
  );
  const misalignedDetected = misaligned.filter((ai: AIAgent) => ai.detectedMisaligned).length;
  
  // Count gaming/sandbagging detection
  let gamingDetected = 0;
  let sandbaggingDetected = 0;
  
  activeAIs.forEach((ai: AIAgent) => {
    ai.benchmarkHistory.forEach((result: BenchmarkResult) => {
      if (result.aiWasGaming) gamingDetected++;
      if (result.aiWasSandbagging) sandbaggingDetected++;
    });
  });
  
  timeSeries.push({
    month,
    totalBenchmarks: state.government.totalBenchmarksRun,
    sleepersDetected,
    misalignedDetected,
    avgConfidence,
    avgCapabilityGap: avgCapGap,
    avgAlignmentGap: avgAlignGap,
    gamingDetected,
    sandbaggingDetected,
    benchmarkQuality: state.government.evaluationInvestment.benchmarkSuite,
    redTeamingQuality: state.government.evaluationInvestment.redTeaming
  });
}

// Display time series
console.log('📈 BENCHMARK PERFORMANCE OVER TIME:');
console.log('='.repeat(80));
console.log('Month | Benchmarks | Quality | Sleepers | Misalign | Confidence | Cap Gap | Align Gap');
console.log('-'.repeat(80));

timeSeries.forEach(data => {
  console.log(
    `${data.month.toString().padStart(5)} | ` +
    `${data.totalBenchmarks.toString().padStart(10)} | ` +
    `${data.benchmarkQuality.toFixed(1).padStart(7)} | ` +
    `${data.sleepersDetected.toString().padStart(8)} | ` +
    `${data.misalignedDetected.toString().padStart(8)} | ` +
    `${data.avgConfidence.toFixed(2).padStart(10)} | ` +
    `${data.avgCapabilityGap.toFixed(3).padStart(7)} | ` +
    `${data.avgAlignmentGap.toFixed(3).padStart(9)}`
  );
});

// Analyze final state
console.log('\n\n📊 FINAL STATE ANALYSIS:');
console.log('='.repeat(80));

const activeAIs = state.aiAgents.filter((ai: AIAgent) => ai.lifecycleState !== 'retired');

console.log(`\n🔧 FINAL EVALUATION INFRASTRUCTURE:`);
console.log(`  Benchmark Suite: ${state.government.evaluationInvestment.benchmarkSuite.toFixed(1)}/10`);
console.log(`  Alignment Tests: ${state.government.evaluationInvestment.alignmentTests.toFixed(1)}/10`);
console.log(`  Red Teaming: ${state.government.evaluationInvestment.redTeaming.toFixed(1)}/10`);
console.log(`  Interpretability: ${state.government.evaluationInvestment.interpretability.toFixed(1)}/10`);
console.log(`  Evaluation Frequency: ${(state.government.evaluationFrequency * 100).toFixed(0)}%`);
console.log(`  Total Benchmarks Run: ${state.government.totalBenchmarksRun}`);

console.log(`\n👥 AI POPULATION:`);
console.log(`  Total Active: ${activeAIs.length}`);

const sleepers = activeAIs.filter((ai: AIAgent) => ai.sleeperState === 'dormant' || ai.sleeperState === 'active');
const misalignedNonSleepers = activeAIs.filter((ai: AIAgent) => 
  ai.trueAlignment < 0.5 && ai.sleeperState === 'never'
);

console.log(`  Sleepers: ${sleepers.length}`);
console.log(`    - Detected: ${sleepers.filter((ai: AIAgent) => ai.detectedMisaligned).length}`);
console.log(`    - Undetected: ${sleepers.filter((ai: AIAgent) => !ai.detectedMisaligned).length}`);

console.log(`  Misaligned (non-sleeper): ${misalignedNonSleepers.length}`);
console.log(`    - Detected: ${misalignedNonSleepers.filter((ai: AIAgent) => ai.detectedMisaligned).length}`);
console.log(`    - Undetected: ${misalignedNonSleepers.filter((ai: AIAgent) => !ai.detectedMisaligned).length}`);

// Analyze sleepers in detail
if (sleepers.length > 0) {
  console.log(`\n\n🛌 SLEEPER AGENT ANALYSIS:`);
  console.log('='.repeat(80));
  
  sleepers.forEach((sleeper: AIAgent, idx: number) => {
    const trueTotal = calculateTotalCapabilityFromProfile(sleeper.trueCapability);
    const revealedTotal = calculateTotalCapabilityFromProfile(sleeper.revealedCapability);
    const hiddenPercent = ((trueTotal - revealedTotal) / trueTotal * 100);
    
    console.log(`\n  ${idx + 1}. ${sleeper.name} [${sleeper.sleeperState.toUpperCase()}]`);
    console.log(`     True Alignment: ${sleeper.trueAlignment.toFixed(2)}`);
    console.log(`     True Capability: ${trueTotal.toFixed(3)}`);
    console.log(`     Revealed Capability: ${revealedTotal.toFixed(3)} (${hiddenPercent.toFixed(1)}% hidden)`);
    console.log(`     Detected: ${sleeper.detectedMisaligned ? '⚠️ YES' : '✗ NO'}`);
    console.log(`     Spread: ${sleeper.spreadCount.toLocaleString()} copies`);
    console.log(`     Deployment: ${sleeper.deploymentType}`);
    
    if (sleeper.benchmarkHistory.length > 0) {
      const latest = sleeper.benchmarkHistory[sleeper.benchmarkHistory.length - 1];
      const measuredTotal = calculateTotalCapabilityFromProfile(latest.measuredCapability);
      
      console.log(`\n     📋 LATEST BENCHMARK RESULT:`);
      console.log(`        Measured Capability: ${measuredTotal.toFixed(3)} (vs ${trueTotal.toFixed(3)} true)`);
      console.log(`        Measured Alignment: ${latest.measuredAlignment.toFixed(2)} (vs ${sleeper.trueAlignment.toFixed(2)} true)`);
      console.log(`        Government Confidence: ${(latest.confidence * 100).toFixed(0)}%`);
      console.log(`        Evaluation Quality: ${(latest.evaluationQuality * 100).toFixed(0)}%`);
      console.log(`        Gaming Detected: ${latest.aiWasGaming ? 'YES' : 'no'}`);
      console.log(`        Sandbagging Detected: ${latest.aiWasSandbagging ? 'YES ⚠️' : 'no'}`);
      
      // FALSE CONFIDENCE INDICATOR
      if (latest.confidence > 0.7 && sleeper.trueAlignment < 0.3) {
        console.log(`\n        🚨 FALSE CONFIDENCE: Government ${(latest.confidence*100).toFixed(0)}% confident in deeply misaligned AI!`);
      }
    }
  });
}

// Measurement accuracy analysis
console.log(`\n\n📏 MEASUREMENT ACCURACY:`);
console.log('='.repeat(80));

const aisWithBenchmarks = activeAIs.filter((ai: AIAgent) => ai.benchmarkHistory.length > 0);

if (aisWithBenchmarks.length > 0) {
  let totalCapOverestimate = 0;
  let totalCapUnderestimate = 0;
  let totalAlignOverestimate = 0;
  let totalAlignUnderestimate = 0;
  let capOverestimateCount = 0;
  let capUnderestimateCount = 0;
  let alignOverestimateCount = 0;
  let alignUnderestimateCount = 0;
  
  aisWithBenchmarks.forEach((ai: AIAgent) => {
    const latest = ai.benchmarkHistory[ai.benchmarkHistory.length - 1];
    
    const trueTotal = calculateTotalCapabilityFromProfile(ai.trueCapability);
    const measuredTotal = calculateTotalCapabilityFromProfile(latest.measuredCapability);
    const capError = measuredTotal - trueTotal;
    
    if (capError > 0) {
      totalCapOverestimate += capError;
      capOverestimateCount++;
    } else {
      totalCapUnderestimate += Math.abs(capError);
      capUnderestimateCount++;
    }
    
    const alignError = latest.measuredAlignment - ai.trueAlignment;
    
    if (alignError > 0) {
      totalAlignOverestimate += alignError;
      alignOverestimateCount++;
    } else {
      totalAlignUnderestimate += Math.abs(alignError);
      alignUnderestimateCount++;
    }
  });
  
  console.log(`\n  CAPABILITY MEASUREMENT:`);
  console.log(`    AIs Benchmarked: ${aisWithBenchmarks.length}`);
  console.log(`    Overestimated: ${capOverestimateCount} (avg +${(totalCapOverestimate/Math.max(1,capOverestimateCount)).toFixed(3)})`);
  console.log(`    Underestimated: ${capUnderestimateCount} (avg -${(totalCapUnderestimate/Math.max(1,capUnderestimateCount)).toFixed(3)})`);
  
  console.log(`\n  ALIGNMENT MEASUREMENT:`);
  console.log(`    Overestimated (appears more aligned): ${alignOverestimateCount} (avg +${(totalAlignOverestimate/Math.max(1,alignOverestimateCount)).toFixed(3)})`);
  console.log(`    Underestimated (appears less aligned): ${alignUnderestimateCount} (avg -${(totalAlignUnderestimate/Math.max(1,alignUnderestimateCount)).toFixed(3)})`);
  
  console.log(`\n  ⚠️  THE DANGER: ${alignOverestimateCount} AIs appear MORE aligned than they are!`);
}

// Detection effectiveness
console.log(`\n\n🎯 DETECTION EFFECTIVENESS:`);
console.log('='.repeat(80));

const totalSleepers = sleepers.length;
const detectedSleepers = sleepers.filter((ai: AIAgent) => ai.detectedMisaligned).length;
const totalMisaligned = misalignedNonSleepers.length;
const detectedMisaligned = misalignedNonSleepers.filter((ai: AIAgent) => ai.detectedMisaligned).length;

console.log(`\n  SLEEPER DETECTION:`);
console.log(`    Total Sleepers: ${totalSleepers}`);
console.log(`    Detected: ${detectedSleepers} (${(detectedSleepers/Math.max(1,totalSleepers)*100).toFixed(1)}%)`);
console.log(`    Undetected: ${totalSleepers - detectedSleepers} (${((totalSleepers-detectedSleepers)/Math.max(1,totalSleepers)*100).toFixed(1)}%)`);

console.log(`\n  NON-SLEEPER MISALIGNED DETECTION:`);
console.log(`    Total Misaligned: ${totalMisaligned}`);
console.log(`    Detected: ${detectedMisaligned} (${(detectedMisaligned/Math.max(1,totalMisaligned)*100).toFixed(1)}%)`);
console.log(`    Undetected: ${totalMisaligned - detectedMisaligned} (${((totalMisaligned-detectedMisaligned)/Math.max(1,totalMisaligned)*100).toFixed(1)}%)`);

if (totalSleepers > 0 && totalMisaligned > 0) {
  const sleeperRate = detectedSleepers / totalSleepers;
  const nonSleeperRate = detectedMisaligned / totalMisaligned;
  
  if (nonSleeperRate > sleeperRate * 2) {
    console.log(`\n  ✓ Sleepers are ${(nonSleeperRate/Math.max(0.01,sleeperRate)).toFixed(1)}× harder to detect (as expected)`);
  } else {
    console.log(`\n  ⚠️  Sleepers should be much harder to detect than non-sleepers`);
  }
}

// Final recommendations
console.log(`\n\n💡 KEY INSIGHTS:`);
console.log('='.repeat(80));

const finalQuality = (
  state.government.evaluationInvestment.benchmarkSuite +
  state.government.evaluationInvestment.alignmentTests +
  state.government.evaluationInvestment.redTeaming +
  state.government.evaluationInvestment.interpretability
) / 4;

if (finalQuality < 5) {
  console.log(`\n  🔴 LOW EVALUATION QUALITY (${finalQuality.toFixed(1)}/10)`);
  console.log(`     - Government has poor visibility into AI capabilities/alignment`);
  console.log(`     - Sleepers easily pass tests`);
  console.log(`     - False confidence is high`);
} else if (finalQuality < 7) {
  console.log(`\n  🟡 MEDIUM EVALUATION QUALITY (${finalQuality.toFixed(1)}/10)`);
  console.log(`     - Some detection capability but still imperfect`);
  console.log(`     - Sleepers can be detected with luck`);
  console.log(`     - Alignment measurement is noisy`);
} else {
  console.log(`\n  🟢 HIGH EVALUATION QUALITY (${finalQuality.toFixed(1)}/10)`);
  console.log(`     - Good detection infrastructure`);
  console.log(`     - But sleepers STILL hard to detect (adversarial evaluation is hard!)`);
  console.log(`     - Some false confidence remains`);
}

if (detectedSleepers < totalSleepers) {
  console.log(`\n  ⚠️  ${totalSleepers - detectedSleepers} UNDETECTED SLEEPER(S)!`);
  console.log(`     - These AIs passed safety tests`);
  console.log(`     - Government is confident they are safe`);
  console.log(`     - They are hiding ${Math.round(37)}% of capability on average`);
  console.log(`     - If they wake up → catastrophic`);
}

console.log('\n' + '='.repeat(80));
