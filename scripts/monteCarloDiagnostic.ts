#!/usr/bin/env tsx
/**
 * P0.4 (Oct 15, 2025): Diagnostic Monte Carlo Runner
 *
 * Runs Monte Carlo simulation with enhanced diagnostics to identify
 * deterministic systems causing convergence
 *
 * Usage: npx tsx scripts/monteCarloDiagnostic.ts --runs 20 --months 240
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { analyzeDeterminism, formatDeterminismReport, DiagnosticLog } from '../src/simulation/diagnostics';
import { ScenarioMode } from '../src/types/game';
import * as fs from 'fs';
import * as path from 'path';

// Parse command line arguments
const args = process.argv.slice(2);
const runsIndex = args.indexOf('--runs');
const monthsIndex = args.indexOf('--months');
const scenarioIndex = args.indexOf('--scenario');

const numRuns = runsIndex >= 0 ? parseInt(args[runsIndex + 1]) : 20;
const numMonths = monthsIndex >= 0 ? parseInt(args[monthsIndex + 1]) : 240;
const scenarioMode: ScenarioMode | 'dual' = scenarioIndex >= 0 ? args[scenarioIndex + 1] as ScenarioMode : 'dual'; // P0.7

console.log(`\n🔬 P0.4 DIAGNOSTIC MONTE CARLO`);
console.log(`═══════════════════════════════════════════════════════`);
console.log(`Runs: ${numRuns}`);
console.log(`Duration: ${numMonths} months (${(numMonths/12).toFixed(1)} years)`);
console.log(`Scenario Mode: ${scenarioMode}${scenarioMode === 'dual' ? ' (50% historical, 50% unprecedented)' : ''}`); // P0.7
console.log(`Goal: Identify deterministic systems causing convergence\n`);

// Storage for diagnostics from all runs
const allDiagnostics: DiagnosticLog[] = [];
const allResults: Array<{
  seed: number;
  scenarioMode: ScenarioMode; // P0.7
  outcome: string;
  finalPopulation: number;
  months: number;
}> = [];

// Run simulations
for (let run = 1; run <= numRuns; run++) {
  const seed = 42000 + run; // Fixed seed base for reproducibility

  // P0.7: Determine scenario mode for this run
  let runScenarioMode: ScenarioMode;
  if (scenarioMode === 'dual') {
    // First half: historical, second half: unprecedented
    runScenarioMode = run <= numRuns / 2 ? 'historical' : 'unprecedented';
  } else {
    runScenarioMode = scenarioMode as ScenarioMode;
  }

  console.log(`\n[Run ${run}/${numRuns}] Seed: ${seed} [${runScenarioMode}]`);

  try {
    const engine = new SimulationEngine({
      seed,
      maxMonths: numMonths,
      logLevel: 'summary' // Minimal logging to reduce noise
    });

    const initialState = createDefaultInitialState(runScenarioMode);
    const result = engine.run(initialState, {
      maxMonths: numMonths,
      checkActualOutcomes: true
    });

    // Store diagnostics
    allDiagnostics.push(result.diagnostics);

    // Store summary
    const finalPop = result.finalState.humanPopulationSystem.population;
    allResults.push({
      seed,
      scenarioMode: runScenarioMode, // P0.7
      outcome: result.summary.finalOutcome,
      finalPopulation: finalPop,
      months: result.summary.totalMonths
    });

    console.log(`   Outcome: ${result.summary.finalOutcome.toUpperCase()}`);
    console.log(`   Final Population: ${finalPop.toFixed(2)}B`);
    console.log(`   Months: ${result.summary.totalMonths}`);

  } catch (error) {
    console.error(`   ❌ Run ${run} FAILED:`, error);
  }
}

// Analyze determinism across all runs
console.log(`\n\n🔍 ANALYZING DETERMINISM ACROSS ${numRuns} RUNS...`);
console.log(`═══════════════════════════════════════════════════════\n`);

const determinismAnalysis = analyzeDeterminism(allDiagnostics);
const report = formatDeterminismReport(determinismAnalysis);

console.log(report);

// Summary of outcomes
console.log(`\n📊 OUTCOME SUMMARY`);
console.log(`═══════════════════════════════════════════════════════`);

const outcomeCounts = new Map<string, number>();
for (const result of allResults) {
  const count = outcomeCounts.get(result.outcome) || 0;
  outcomeCounts.set(result.outcome, count + 1);
}

for (const [outcome, count] of outcomeCounts) {
  const pct = (count / numRuns * 100).toFixed(1);
  console.log(`   ${outcome.toUpperCase()}: ${count}/${numRuns} (${pct}%)`);
}

// Population variance analysis
const populations = allResults.map(r => r.finalPopulation);
const popMean = populations.reduce((sum, p) => sum + p, 0) / populations.length;
const popVariance = populations.reduce((sum, p) => sum + Math.pow(p - popMean, 2), 0) / populations.length;
const popStdDev = Math.sqrt(popVariance);
const popCV = popMean !== 0 ? popStdDev / popMean : 0;

console.log(`\n📈 POPULATION VARIANCE`);
console.log(`═══════════════════════════════════════════════════════`);
console.log(`   Mean: ${popMean.toFixed(2)}B`);
console.log(`   StdDev: ${popStdDev.toFixed(4)}B`);
console.log(`   Coefficient of Variation: ${(popCV * 100).toFixed(2)}%`);
console.log(`   Range: ${Math.min(...populations).toFixed(2)}B - ${Math.max(...populations).toFixed(2)}B`);

if (popCV < 0.01) {
  console.log(`\n   🔴 CRITICAL: Population variance < 1% - DETERMINISTIC CONVERGENCE!`);
} else if (popCV < 0.05) {
  console.log(`\n   🟡 WARNING: Population variance < 5% - Weak stochasticity`);
} else {
  console.log(`\n   ✅ SUCCESS: Population variance > 5% - Healthy stochasticity`);
}

// Save detailed results
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const outputDir = path.join(__dirname, '..', 'diagnosticOutputs');
const outputFile = path.join(outputDir, `determinism_${timestamp}.json`);

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const fullOutput = {
  config: {
    runs: numRuns,
    months: numMonths,
    scenarioMode, // P0.7: Include scenario mode in config
    timestamp: new Date().toISOString()
  },
  results: allResults,
  determinismAnalysis: {
    summary: determinismAnalysis.summary,
    deterministicSystems: determinismAnalysis.deterministicSystems,
    totalMetrics: determinismAnalysis.analyses.length,
    deterministicCount: determinismAnalysis.deterministicSystems.length
  },
  populationStats: {
    mean: popMean,
    stdDev: popStdDev,
    cv: popCV,
    min: Math.min(...populations),
    max: Math.max(...populations)
  }
};

fs.writeFileSync(outputFile, JSON.stringify(fullOutput, null, 2));

console.log(`\n💾 Full results saved to: ${outputFile}\n`);

// Exit with appropriate code
if (determinismAnalysis.deterministicSystems.length > 0) {
  console.log(`❌ DETERMINISM DETECTED - See report above for specific systems\n`);
  process.exit(1);
} else {
  console.log(`✅ NO DETERMINISM DETECTED - All systems show healthy variance\n`);
  process.exit(0);
}
