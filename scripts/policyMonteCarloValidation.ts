#!/usr/bin/env tsx
/**
 * Monte Carlo Policy Validation Script
 *
 * Runs each policy scenario with multiple seeds to validate:
 * - Are patterns consistent across seeds?
 * - Is "Combined Interventions" truly worse or just unlucky?
 * - What's the variance in outcomes?
 *
 * Tests differential effectiveness of government programs by socioeconomic status
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { GameState } from '../src/types/game';
import { generateDistributionReport } from './utils/statisticalAnalysis';

interface PolicyScenario {
  name: string;
  description: string;
  ubiLevel?: number;
  retrainingLevel?: number;
  teachingSupportLevel?: number;
  jobGuaranteeLevel?: number;
}

interface ScenarioMetrics {
  scenario: string;
  seed: number;
  finalMonth: number;
  wageGap: number;
  competenceGap: number;
  laborShare: number;
  unemployment: number;
  avgQoL: number;
  outcome: string;
  population: number;
}

const SCENARIOS: PolicyScenario[] = [
  {
    name: 'Baseline',
    description: 'No policy intervention (market forces only)',
    ubiLevel: 0,
    retrainingLevel: 0,
    teachingSupportLevel: 0,
    jobGuaranteeLevel: 0,
  },
  {
    name: 'UBI Only',
    description: 'Universal Basic Income at 40% median wage (~$24k/year)',
    ubiLevel: 0.40,
    retrainingLevel: 0,
    teachingSupportLevel: 0,
    jobGuaranteeLevel: 0,
  },
  {
    name: 'Retraining Only',
    description: 'Universal retraining programs (differential by class)',
    ubiLevel: 0,
    retrainingLevel: 1.0,
    teachingSupportLevel: 0,
    jobGuaranteeLevel: 0,
  },
  {
    name: 'Teaching Support Only',
    description: 'AI-human teaching programs (differential by class)',
    ubiLevel: 0,
    retrainingLevel: 0,
    teachingSupportLevel: 1.0,
    jobGuaranteeLevel: 0,
  },
  {
    name: 'Job Guarantee Only',
    description: 'Federal job guarantee (differential by class)',
    ubiLevel: 0,
    retrainingLevel: 0,
    teachingSupportLevel: 0,
    jobGuaranteeLevel: 1.0,
  },
  {
    name: 'Combined Interventions',
    description: 'All policies at moderate levels (balanced approach)',
    ubiLevel: 0.30,
    retrainingLevel: 0.70,
    teachingSupportLevel: 0.70,
    jobGuaranteeLevel: 0.70,
  },
];

function applyPolicyScenario(state: GameState, scenario: PolicyScenario): void {
  // Apply UBI level
  if (scenario.ubiLevel !== undefined && state.ubiSystem) {
    const medianIncome = 60000; // US median income ~$60k/year
    state.ubiSystem.currentAmount = medianIncome * scenario.ubiLevel;
    state.ubiSystem.isActive = scenario.ubiLevel > 0;
  }

  // Store policy levels for use by applyPolicyInterventions()
  if (!state.policyInterventions) {
    state.policyInterventions = {};
  }

  state.policyInterventions.retrainingLevel = scenario.retrainingLevel || 0;
  state.policyInterventions.teachingSupportLevel = scenario.teachingSupportLevel || 0;
  state.policyInterventions.jobGuaranteeLevel = scenario.jobGuaranteeLevel || 0;
}

function extractMetrics(state: GameState, scenario: PolicyScenario, seed: number): ScenarioMetrics {
  // Get average competence gap across segments
  let totalCompetenceGap = 0;
  let totalWeight = 0;
  if (state.society.segments) {
    for (const segment of state.society.segments) {
      const skills = (segment as any).skills;
      if (skills && skills.gaps) {
        totalCompetenceGap += skills.gaps.overall * segment.populationFraction;
        totalWeight += segment.populationFraction;
      }
    }
  }
  const competenceGap = totalWeight > 0 ? totalCompetenceGap / totalWeight : 0;

  // Get labor-capital distribution metrics
  const dist = state.laborCapitalDistribution;
  const wageGap = dist?.productivityWageGap || 0;
  const laborShare = dist?.laborShare || 0.55;

  // Get unemployment level
  const unemployment = state.society.unemploymentLevel || 0;

  // Get average QoL
  const avgQoL = state.globalMetrics?.qualityOfLife || 0;

  // Get population
  const population = state.society.totalPopulation || 8000000000;

  // Determine outcome
  let outcome = 'Unknown';
  if (state.globalMetrics) {
    if (state.globalMetrics.isUtopia) outcome = 'Utopia';
    else if (state.globalMetrics.isDystopia) outcome = 'Dystopia';
    else if (state.globalMetrics.isExtinct) outcome = 'Extinction';
    else outcome = 'Status Quo';
  }

  return {
    scenario: scenario.name,
    seed,
    finalMonth: state.currentMonth,
    wageGap,
    competenceGap,
    laborShare,
    unemployment,
    avgQoL,
    outcome,
    population,
  };
}

function runScenario(scenario: PolicyScenario, seed: number, maxMonths: number, showProgress: boolean = false): ScenarioMetrics {
  if (showProgress) {
    process.stdout.write('.');
  }

  // Create initial state and apply policy scenario
  const initialState = createDefaultInitialState();
  applyPolicyScenario(initialState, scenario);

  // Run simulation (suppress all output)
  const originalLog = console.log;
  console.log = () => {}; // Suppress all console output during simulation

  try {
    const engine = new SimulationEngine({ seed, maxMonths });
    const result = engine.run(initialState, { maxMonths, checkActualOutcomes: false });

    // Extract metrics
    const metrics = extractMetrics(result.finalState, scenario, seed);

    return metrics;
  } finally {
    console.log = originalLog; // Restore console.log
  }
}

function calculateStatistics(values: number[]): { mean: number; std: number; min: number; max: number } {
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const std = Math.sqrt(variance);
  const min = Math.min(...values);
  const max = Math.max(...values);
  return { mean, std, min, max };
}

function generateReport(allResults: ScenarioMetrics[]): void {
  console.log(`\n\n${'='.repeat(80)}`);
  console.log(`📊 MONTE CARLO POLICY VALIDATION REPORT`);
  console.log(`${'='.repeat(80)}\n`);

  // Group by scenario
  const byScenario = new Map<string, ScenarioMetrics[]>();
  for (const result of allResults) {
    if (!byScenario.has(result.scenario)) {
      byScenario.set(result.scenario, []);
    }
    byScenario.get(result.scenario)!.push(result);
  }

  // Calculate statistics for each scenario
  console.log('┌──────────────────────────┬────────────┬────────────┬────────────┬──────────────┬─────────┐');
  console.log('│ Scenario                 │ Wage Gap   │ Comp Gap   │ Labor Sh.  │ Unemployment │ Avg QoL │');
  console.log('├──────────────────────────┼────────────┼────────────┼────────────┼──────────────┼─────────┤');

  const scenarioStats = new Map<string, any>();

  for (const [scenario, results] of byScenario.entries()) {
    const wageGaps = results.map(r => r.wageGap);
    const compGaps = results.map(r => r.competenceGap);
    const laborShares = results.map(r => r.laborShare);
    const unemployments = results.map(r => r.unemployment);
    const qols = results.map(r => r.avgQoL);

    const wageStats = calculateStatistics(wageGaps);
    const compStats = calculateStatistics(compGaps);
    const laborStats = calculateStatistics(laborShares);
    const unemployStats = calculateStatistics(unemployments);
    const qolStats = calculateStatistics(qols);

    scenarioStats.set(scenario, {
      wageGap: wageStats,
      compGap: compStats,
      laborShare: laborStats,
      unemployment: unemployStats,
      qol: qolStats,
    });

    const name = scenario.padEnd(24);
    const wage = `${(wageStats.mean * 100).toFixed(1)}±${(wageStats.std * 100).toFixed(1)}%`.padStart(10);
    const comp = `${(compStats.mean * 100).toFixed(1)}±${(compStats.std * 100).toFixed(1)}%`.padStart(10);
    const labor = `${(laborStats.mean * 100).toFixed(1)}±${(laborStats.std * 100).toFixed(1)}%`.padStart(10);
    const unemp = `${(unemployStats.mean * 100).toFixed(1)}±${(unemployStats.std * 100).toFixed(1)}%`.padStart(12);
    const qol = `${(qolStats.mean * 100).toFixed(1)}±${(qolStats.std * 100).toFixed(1)}%`.padStart(7);

    console.log(`│ ${name} │ ${wage} │ ${comp} │ ${labor} │ ${unemp} │ ${qol} │`);
  }
  console.log('└──────────────────────────┴────────────┴────────────┴────────────┴──────────────┴─────────┘');
  console.log('\nNote: Values shown as Mean±StdDev');

  // Outcome distribution
  console.log(`\n\n📊 OUTCOME DISTRIBUTIONS (% of runs):\n`);
  console.log('┌──────────────────────────┬─────────┬──────────┬────────────┬────────────┐');
  console.log('│ Scenario                 │ Utopia  │ Dystopia │ Status Quo │ Extinction │');
  console.log('├──────────────────────────┼─────────┼──────────┼────────────┼────────────┤');

  for (const [scenario, results] of byScenario.entries()) {
    const total = results.length;
    const utopia = results.filter(r => r.outcome === 'Utopia').length;
    const dystopia = results.filter(r => r.outcome === 'Dystopia').length;
    const statusQuo = results.filter(r => r.outcome === 'Status Quo').length;
    const extinction = results.filter(r => r.outcome === 'Extinction').length;

    const name = scenario.padEnd(24);
    const uto = `${((utopia / total) * 100).toFixed(1)}%`.padStart(7);
    const dys = `${((dystopia / total) * 100).toFixed(1)}%`.padStart(8);
    const sta = `${((statusQuo / total) * 100).toFixed(1)}%`.padStart(10);
    const ext = `${((extinction / total) * 100).toFixed(1)}%`.padStart(10);

    console.log(`│ ${name} │ ${uto} │ ${dys} │ ${sta} │ ${ext} │`);
  }
  console.log('└──────────────────────────┴─────────┴──────────┴────────────┴────────────┘');

  // Population impact
  console.log(`\n\n👥 POPULATION IMPACT (billions):\n`);
  console.log('┌──────────────────────────┬────────────────┬──────────┬──────────┐');
  console.log('│ Scenario                 │ Final Pop (B)  │ Min      │ Max      │');
  console.log('├──────────────────────────┼────────────────┼──────────┼──────────┤');

  for (const [scenario, results] of byScenario.entries()) {
    const populations = results.map(r => r.population / 1e9);
    const popStats = calculateStatistics(populations);

    const name = scenario.padEnd(24);
    const mean = `${popStats.mean.toFixed(2)}±${popStats.std.toFixed(2)}`.padStart(14);
    const min = `${popStats.min.toFixed(2)}B`.padStart(8);
    const max = `${popStats.max.toFixed(2)}B`.padStart(8);

    console.log(`│ ${name} │ ${mean} │ ${min} │ ${max} │`);
  }
  console.log('└──────────────────────────┴────────────────┴──────────┴──────────┘');

  // Statistical significance tests
  console.log(`\n\n🔬 KEY FINDINGS:\n`);

  // Compare baseline to each intervention
  const baseline = scenarioStats.get('Baseline');
  if (baseline) {
    for (const [scenario, stats] of scenarioStats.entries()) {
      if (scenario === 'Baseline') continue;

      console.log(`\n${scenario} vs Baseline:`);

      const wageImprovement = ((baseline.wageGap.mean - stats.wageGap.mean) / baseline.wageGap.mean) * 100;
      const compImprovement = ((baseline.compGap.mean - stats.compGap.mean) / baseline.compGap.mean) * 100;
      const unemployImprovement = ((baseline.unemployment.mean - stats.unemployment.mean) / baseline.unemployment.mean) * 100;
      const qolImprovement = ((stats.qol.mean - baseline.qol.mean) / baseline.qol.mean) * 100;

      console.log(`  Wage Gap: ${wageImprovement > 0 ? '↓' : '↑'} ${Math.abs(wageImprovement).toFixed(1)}% (variance: ${(stats.wageGap.std / stats.wageGap.mean * 100).toFixed(1)}%)`);
      console.log(`  Competence Gap: ${compImprovement > 0 ? '↓' : '↑'} ${Math.abs(compImprovement).toFixed(1)}% (variance: ${(stats.compGap.std / Math.abs(stats.compGap.mean) * 100).toFixed(1)}%)`);
      console.log(`  Unemployment: ${unemployImprovement > 0 ? '↓' : '↑'} ${Math.abs(unemployImprovement).toFixed(1)}% (variance: ${(stats.unemployment.std / stats.unemployment.mean * 100).toFixed(1)}%)`);
      console.log(`  Quality of Life: ${qolImprovement > 0 ? '↑' : '↓'} ${Math.abs(qolImprovement).toFixed(1)}% (variance: ${(stats.qol.std / stats.qol.mean * 100).toFixed(1)}%)`);
    }
  }

  // Check if Combined Interventions is consistently worse
  const combined = scenarioStats.get('Combined Interventions');
  if (combined) {
    console.log(`\n\n⚠️  COMBINED INTERVENTIONS ANALYSIS:`);
    console.log(`   Unemployment: ${(combined.unemployment.mean * 100).toFixed(1)}% ± ${(combined.unemployment.std * 100).toFixed(1)}%`);
    console.log(`   Competence Gap: ${(combined.compGap.mean * 100).toFixed(1)}% ± ${(combined.compGap.std * 100).toFixed(1)}%`);

    if (combined.unemployment.mean > 0.5) {
      console.log(`   ❌ CONSISTENTLY HIGH UNEMPLOYMENT (mean > 50%)`);
      console.log(`   Possible causes:`);
      console.log(`     - Job guarantee floor conflicts with market employment`);
      console.log(`     - UBI reduces labor force participation`);
      console.log(`     - Policy interaction failures`);
    }
  }

  // DISTRIBUTION ANALYSIS - Variance investigation (TIER 0D Bug #2)
  console.log(`\n\n${'='.repeat(80)}`);
  console.log(`📊 VARIANCE & DISTRIBUTION ANALYSIS (TIER 0D Investigation)`);
  console.log(`${'='.repeat(80)}`);
  console.log(`\nAnalyzing unemployment variance to determine if high variance is due to:`);
  console.log(`  1. Bimodal distribution (crisis cascades - survivors vs collapsed)`);
  console.log(`  2. Uniform distribution (chaotic dynamics - butterfly effects)`);
  console.log(`  3. Realistic historical contingency (policy-dependent variation)\n`);

  // Generate distribution reports for each scenario
  for (const [scenario, results] of byScenario.entries()) {
    const unemployments = results.map(r => r.unemployment);
    console.log(generateDistributionReport(unemployments, `Unemployment - ${scenario}`, '%'));
  }

  // Cross-scenario comparison
  console.log(`\n\n${'='.repeat(80)}`);
  console.log(`📊 CROSS-SCENARIO VARIANCE COMPARISON`);
  console.log(`${'='.repeat(80)}\n`);

  console.log(`Coefficient of Variation (CV) by Scenario:`);
  console.log(`(CV > 100% = more variance than mean, CV > 50% = extreme variance)\n`);

  for (const [scenario, stats] of scenarioStats.entries()) {
    const unemployCV = (stats.unemployment.std / stats.unemployment.mean) * 100;
    const wageCV = (stats.wageGap.std / stats.wageGap.mean) * 100;
    const qolCV = (stats.qol.std / stats.qol.mean) * 100;

    const statusIcon = unemployCV > 100 ? '❌' : unemployCV > 50 ? '⚠️' : unemployCV > 30 ? 'ℹ️' : '✅';

    console.log(`${statusIcon} ${scenario.padEnd(25)} Unemployment CV: ${unemployCV.toFixed(1)}%  Wage Gap CV: ${wageCV.toFixed(1)}%  QoL CV: ${qolCV.toFixed(1)}%`);
  }

  console.log(`\n\n💡 INTERPRETATION SUMMARY:`);
  console.log(`See distribution histograms above for each scenario to determine:`);
  console.log(`  - If histograms show TWO PEAKS with valley between → Bimodal (crisis cascades)`);
  console.log(`  - If histograms show UNIFORM spread → Chaotic (missing stabilization)`);
  console.log(`  - If histograms show SINGLE PEAK with moderate tail → Realistic variance`);
  console.log(`\nThis analysis addresses TIER 0D Bug #2: Extreme Unemployment Variance`);
}

// Main execution
async function main() {
  const runsPerScenario = 10;
  const maxMonths = 120; // 10 years
  const baseSeed = 80000;

  console.log('\n🎯 MONTE CARLO POLICY VALIDATION');
  console.log('==================================');
  console.log(`Runs per scenario: ${runsPerScenario}`);
  console.log(`Simulation length: ${maxMonths} months (10 years)`);
  console.log(`Base seed: ${baseSeed}`);
  console.log(`Total simulations: ${SCENARIOS.length * runsPerScenario} (${SCENARIOS.length} scenarios × ${runsPerScenario} runs)`);

  const allResults: ScenarioMetrics[] = [];

  for (const scenario of SCENARIOS) {
    console.log(`\n🔬 ${scenario.name}:`);
    process.stdout.write(`   Running ${runsPerScenario} simulations: `);

    for (let i = 0; i < runsPerScenario; i++) {
      // Use random seeds to avoid seed range correlation artifacts
      const seed = Math.floor(Math.random() * 1000000);
      const metrics = runScenario(scenario, seed, maxMonths, true);
      allResults.push(metrics);
    }
    console.log(` ✓`);
  }

  generateReport(allResults);

  console.log(`\n✅ Monte Carlo validation complete!`);
  console.log(`\nNext steps:`);
  console.log(`  1. Review statistical significance of differences`);
  console.log(`  2. Investigate Combined Interventions failure mode`);
  console.log(`  3. Document systemic inequality effects in wiki`);
}

main().catch(console.error);
