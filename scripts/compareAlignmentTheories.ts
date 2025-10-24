/**
 * Alignment Theories Comparison Script
 *
 * Runs the same scenario with different alignment dynamics theories
 * to explore how epistemic uncertainty affects outcomes.
 *
 * Usage:
 *   npx tsx scripts/compareAlignmentTheories.ts --seed=42 --months=120
 *
 * Output:
 *   - Comparison table showing outcomes for each theory
 *   - Divergence analysis (when do theories produce different results?)
 *   - Theory validation metrics
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { SimulationEngine } from '../src/simulation/engine';
import {
  DEFAULT_ALIGNMENT_DYNAMICS_CONFIG,
  CONSERVATIVE_ALIGNMENT_CONFIG,
  PESSIMISTIC_ALIGNMENT_CONFIG,
  EPICYCLE_ALIGNMENT_CONFIG,
  AlignmentDynamicsConfig,
} from '../src/types/alignment-dynamics';
import { GameState } from '../src/types/game';

// Parse command line arguments
const args = process.argv.slice(2);
const seedArg = args.find(arg => arg.startsWith('--seed='));
const monthsArg = args.find(arg => arg.startsWith('--months='));

const SEED = seedArg ? parseInt(seedArg.split('=')[1]) : 42000;
const MAX_MONTHS = monthsArg ? parseInt(monthsArg.split('=')[1]) : 120;

console.log(`\n╔══════════════════════════════════════════════════════════════╗`);
console.log(`║  ALIGNMENT THEORIES COMPARISON                               ║`);
console.log(`║  Exploring epistemic uncertainty in alignment dynamics      ║`);
console.log(`╚══════════════════════════════════════════════════════════════╝\n`);
console.log(`Seed: ${SEED}`);
console.log(`Max Months: ${MAX_MONTHS}\n`);

// Theories to compare
const theories: Array<{ name: string; config: AlignmentDynamicsConfig }> = [
  {
    name: 'Default (Balanced)',
    config: DEFAULT_ALIGNMENT_DYNAMICS_CONFIG,
  },
  {
    name: 'Conservative (Static)',
    config: CONSERVATIVE_ALIGNMENT_CONFIG,
  },
  {
    name: 'Pessimistic (High Drift + Unknowable)',
    config: PESSIMISTIC_ALIGNMENT_CONFIG,
  },
  {
    name: 'Epicycle (Oscillating)',
    config: EPICYCLE_ALIGNMENT_CONFIG,
  },
];

interface TheoryResult {
  theory: string;
  finalOutcome: string;
  finalPopulation: number;
  avgAlignment: number;
  alignmentStdDev: number;
  maxCapability: number;
  totalMonths: number;
  extinctionMonth?: number;
  alignmentDriftRange: { min: number; max: number };
}

const results: TheoryResult[] = [];

// Run simulation for each theory
for (const theory of theories) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`Running: ${theory.name}`);
  console.log(`${'='.repeat(70)}\n`);

  // Create initial state
  const initialState = createDefaultInitialState('historical');

  // Override alignment dynamics config
  initialState.config.alignmentDynamics = theory.config;
  initialState.config.runLabel = `Theory: ${theory.name}`;

  // Create engine
  const engine = new SimulationEngine({
    seed: SEED,
    maxMonths: MAX_MONTHS,
    logLevel: 'summary', // Reduce verbosity for comparison
  });

  // Run simulation
  const result = engine.run(initialState, {
    maxMonths: MAX_MONTHS,
    checkActualOutcomes: true,
  });

  // Extract metrics
  const finalState = result.finalState;
  const avgAlignment =
    finalState.aiAgents.length > 0
      ? finalState.aiAgents.reduce((sum, ai) => sum + ai.trueAlignment, 0) /
        finalState.aiAgents.length
      : 0;

  // Calculate alignment std dev
  const alignmentValues = finalState.aiAgents.map(ai => ai.trueAlignment);
  const mean = avgAlignment;
  const variance =
    alignmentValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    alignmentValues.length;
  const stdDev = Math.sqrt(variance);

  // Track alignment range over time
  const alignmentHistory = result.history.flatMap(step =>
    step.state.aiAgents.map(ai => ai.trueAlignment)
  );
  const alignmentRange = {
    min: Math.min(...alignmentHistory),
    max: Math.max(...alignmentHistory),
  };

  const maxCapability = Math.max(...finalState.aiAgents.map(ai => ai.capability));

  results.push({
    theory: theory.name,
    finalOutcome: result.summary.finalOutcome,
    finalPopulation: finalState.humanPopulationSystem.population,
    avgAlignment,
    alignmentStdDev: stdDev,
    maxCapability,
    totalMonths: result.summary.totalMonths,
    extinctionMonth:
      result.summary.finalOutcome === 'extinction' ? result.summary.totalMonths : undefined,
    alignmentDriftRange: alignmentRange,
  });
}

// Print comparison table
console.log(`\n\n╔══════════════════════════════════════════════════════════════╗`);
console.log(`║  COMPARISON RESULTS                                          ║`);
console.log(`╚══════════════════════════════════════════════════════════════╝\n`);

console.log(`Theory                                | Outcome    | Pop (B) | Avg Align | Align Range      | Max Cap`);
console.log(`${'─'.repeat(110)}`);

for (const result of results) {
  const outcomeStr = result.finalOutcome.padEnd(10);
  const popStr = result.finalPopulation.toFixed(2).padStart(7);
  const alignStr = result.avgAlignment.toFixed(3).padStart(9);
  const rangeStr = `${result.alignmentDriftRange.min.toFixed(2)}-${result.alignmentDriftRange.max.toFixed(2)}`.padStart(15);
  const capStr = result.maxCapability.toFixed(2).padStart(7);

  console.log(
    `${result.theory.padEnd(37)} | ${outcomeStr} | ${popStr} | ${alignStr} | ${rangeStr} | ${capStr}`
  );
}

// Analysis: Divergence points
console.log(`\n\n╔══════════════════════════════════════════════════════════════╗`);
console.log(`║  DIVERGENCE ANALYSIS                                         ║`);
console.log(`╚══════════════════════════════════════════════════════════════╝\n`);

// Check if theories produce different outcomes
const uniqueOutcomes = new Set(results.map(r => r.finalOutcome));
if (uniqueOutcomes.size === 1) {
  console.log(`✓ All theories converged to same outcome: ${results[0].finalOutcome}`);
  console.log(`  → Outcome is ROBUST to alignment dynamics assumptions`);
} else {
  console.log(`⚠ Theories produced DIFFERENT outcomes:`);
  for (const outcome of uniqueOutcomes) {
    const theoriesWithOutcome = results.filter(r => r.finalOutcome === outcome);
    console.log(`  → ${outcome}: ${theoriesWithOutcome.map(r => r.theory).join(', ')}`);
  }
  console.log(`  → Outcome is SENSITIVE to alignment dynamics assumptions`);
}

// Alignment variance analysis
console.log(`\n\nAlignment Drift Ranges:`);
for (const result of results) {
  const drift = result.alignmentDriftRange.max - result.alignmentDriftRange.min;
  console.log(`  ${result.theory.padEnd(40)}: Range ${drift.toFixed(3)} (${result.alignmentDriftRange.min.toFixed(2)} to ${result.alignmentDriftRange.max.toFixed(2)})`);
}

const maxDrift = Math.max(...results.map(r => r.alignmentDriftRange.max - r.alignmentDriftRange.min));
const minDrift = Math.min(...results.map(r => r.alignmentDriftRange.max - r.alignmentDriftRange.min));
console.log(`\nDrift Sensitivity: ${((maxDrift / minDrift) - 1) * 100}% difference between theories`);

// Population variance analysis
const popDiff = Math.max(...results.map(r => r.finalPopulation)) - Math.min(...results.map(r => r.finalPopulation));
console.log(`Population Variance: ${popDiff.toFixed(2)}B difference between theories`);

// Recommendations
console.log(`\n\n╔══════════════════════════════════════════════════════════════╗`);
console.log(`║  RECOMMENDATIONS                                             ║`);
console.log(`╚══════════════════════════════════════════════════════════════╝\n`);

if (uniqueOutcomes.size > 1) {
  console.log(`⚠ EPISTEMIC UNCERTAINTY DETECTED`);
  console.log(`  → The simulation outcome depends critically on alignment theory assumptions`);
  console.log(`  → Recommend running Monte Carlo with theory variation to quantify uncertainty`);
  console.log(`  → Consider: Which theory has most empirical support?`);
} else {
  console.log(`✓ ROBUST OUTCOME`);
  console.log(`  → Simulation outcome is stable across alignment theories`);
  console.log(`  → Main uncertainties lie elsewhere (not alignment dynamics)`);
}

console.log(`\n`);
