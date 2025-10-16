#!/usr/bin/env tsx
/**
 * Policy Scenario Comparison Script
 *
 * Tests different policy interventions for AI automation impacts:
 * - Baseline (no intervention)
 * - UBI only
 * - Retraining only
 * - Teaching support only
 * - Combined interventions
 *
 * Tracks outcomes: wage gap, unemployment, competence gap, labor share
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { GameState } from '../src/types/game';

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
  finalMonth: number;
  wageGap: number;
  competenceGap: number;
  laborShare: number;
  unemployment: number;
  avgQoL: number;
  outcome: string;
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
    description: 'Universal retraining programs (50% displacement reduction)',
    ubiLevel: 0,
    retrainingLevel: 1.0,
    teachingSupportLevel: 0,
    jobGuaranteeLevel: 0,
  },
  {
    name: 'Teaching Support Only',
    description: 'AI-human teaching programs (40% scaffolding boost)',
    ubiLevel: 0,
    retrainingLevel: 0,
    teachingSupportLevel: 1.0,
    jobGuaranteeLevel: 0,
  },
  {
    name: 'Job Guarantee Only',
    description: 'Federal job guarantee (5% unemployment floor)',
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
  // These will be accessed during HumanEnhancementPhase
  if (!state.policyInterventions) {
    state.policyInterventions = {};
  }

  state.policyInterventions.retrainingLevel = scenario.retrainingLevel || 0;
  state.policyInterventions.teachingSupportLevel = scenario.teachingSupportLevel || 0;
  state.policyInterventions.jobGuaranteeLevel = scenario.jobGuaranteeLevel || 0;
}

function extractMetrics(state: GameState, scenario: PolicyScenario): ScenarioMetrics {
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

  // Get unemployment level (correct field name)
  const unemployment = state.society.unemploymentLevel || 0;

  // Get average QoL
  const avgQoL = state.globalMetrics?.qualityOfLife || 0;

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
    finalMonth: state.currentMonth,
    wageGap,
    competenceGap,
    laborShare,
    unemployment,
    avgQoL,
    outcome,
  };
}

function runScenario(scenario: PolicyScenario, seed: number, maxMonths: number): ScenarioMetrics {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔬 SCENARIO: ${scenario.name}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Description: ${scenario.description}`);
  console.log(`Policies:`);
  console.log(`  UBI Level: ${((scenario.ubiLevel || 0) * 100).toFixed(0)}%`);
  console.log(`  Retraining Level: ${((scenario.retrainingLevel || 0) * 100).toFixed(0)}%`);
  console.log(`  Teaching Support: ${((scenario.teachingSupportLevel || 0) * 100).toFixed(0)}%`);
  console.log(`  Job Guarantee: ${((scenario.jobGuaranteeLevel || 0) * 100).toFixed(0)}%`);

  // Create initial state and apply policy scenario
  const initialState = createDefaultInitialState();
  applyPolicyScenario(initialState, scenario);

  // Run simulation
  const engine = new SimulationEngine({ seed, maxMonths });
  const result = engine.run(initialState, { maxMonths, checkActualOutcomes: false });

  // Extract metrics
  const metrics = extractMetrics(result.finalState, scenario);

  console.log(`\n📊 RESULTS (Month ${metrics.finalMonth}):`);
  console.log(`  Wage Gap: ${(metrics.wageGap * 100).toFixed(1)}%`);
  console.log(`  Competence Gap: ${(metrics.competenceGap * 100).toFixed(1)}%`);
  console.log(`  Labor Share: ${(metrics.laborShare * 100).toFixed(1)}%`);
  console.log(`  Unemployment: ${(metrics.unemployment * 100).toFixed(1)}%`);
  console.log(`  Avg QoL: ${(metrics.avgQoL * 100).toFixed(1)}%`);
  console.log(`  Outcome: ${metrics.outcome}`);

  return metrics;
}

function generateComparisonReport(results: ScenarioMetrics[]): void {
  console.log(`\n\n${'='.repeat(80)}`);
  console.log(`📋 POLICY SCENARIO COMPARISON REPORT`);
  console.log(`${'='.repeat(80)}\n`);

  // Create comparison table
  console.log('┌─────────────────────────┬──────────┬──────────┬───────────┬──────────────┬─────────┐');
  console.log('│ Scenario                │ Wage Gap │ Comp Gap │ Labor Sh. │ Unemployment │ Avg QoL │');
  console.log('├─────────────────────────┼──────────┼──────────┼───────────┼──────────────┼─────────┤');

  for (const result of results) {
    const scenario = result.scenario.padEnd(23);
    const wageGap = `${(result.wageGap * 100).toFixed(1)}%`.padStart(8);
    const compGap = `${(result.competenceGap * 100).toFixed(1)}%`.padStart(8);
    const laborShare = `${(result.laborShare * 100).toFixed(1)}%`.padStart(9);
    const unemployment = `${(result.unemployment * 100).toFixed(1)}%`.padStart(12);
    const avgQoL = `${(result.avgQoL * 100).toFixed(1)}%`.padStart(7);

    console.log(`│ ${scenario} │ ${wageGap} │ ${compGap} │ ${laborShare} │ ${unemployment} │ ${avgQoL} │`);
  }
  console.log('└─────────────────────────┴──────────┴──────────┴───────────┴──────────────┴─────────┘');

  // Find best scenarios for each metric
  const bestWageGap = results.reduce((best, curr) => curr.wageGap < best.wageGap ? curr : best);
  const bestCompetenceGap = results.reduce((best, curr) => curr.competenceGap < best.competenceGap ? curr : best);
  const bestLaborShare = results.reduce((best, curr) => curr.laborShare > best.laborShare ? curr : best);
  const bestUnemployment = results.reduce((best, curr) => curr.unemployment < best.unemployment ? curr : best);
  const bestQoL = results.reduce((best, curr) => curr.avgQoL > best.avgQoL ? curr : best);

  console.log(`\n🏆 BEST PERFORMERS:`);
  console.log(`  Lowest Wage Gap: ${bestWageGap.scenario} (${(bestWageGap.wageGap * 100).toFixed(1)}%)`);
  console.log(`  Lowest Competence Gap: ${bestCompetenceGap.scenario} (${(bestCompetenceGap.competenceGap * 100).toFixed(1)}%)`);
  console.log(`  Highest Labor Share: ${bestLaborShare.scenario} (${(bestLaborShare.laborShare * 100).toFixed(1)}%)`);
  console.log(`  Lowest Unemployment: ${bestUnemployment.scenario} (${(bestUnemployment.unemployment * 100).toFixed(1)}%)`);
  console.log(`  Highest Avg QoL: ${bestQoL.scenario} (${(bestQoL.avgQoL * 100).toFixed(1)}%)`);

  // Compare to baseline
  const baseline = results.find(r => r.scenario === 'Baseline');
  if (baseline) {
    console.log(`\n📊 IMPROVEMENTS VS. BASELINE:`);
    for (const result of results) {
      if (result.scenario === 'Baseline') continue;

      const wageGapDelta = ((baseline.wageGap - result.wageGap) / baseline.wageGap) * 100;
      const compGapDelta = ((baseline.competenceGap - result.competenceGap) / baseline.competenceGap) * 100;
      const laborShareDelta = ((result.laborShare - baseline.laborShare) / baseline.laborShare) * 100;
      const unemploymentDelta = ((baseline.unemployment - result.unemployment) / baseline.unemployment) * 100;
      const qolDelta = ((result.avgQoL - baseline.avgQoL) / baseline.avgQoL) * 100;

      console.log(`\n  ${result.scenario}:`);
      console.log(`    Wage Gap: ${wageGapDelta > 0 ? '↓' : '↑'} ${Math.abs(wageGapDelta).toFixed(1)}%`);
      console.log(`    Competence Gap: ${compGapDelta > 0 ? '↓' : '↑'} ${Math.abs(compGapDelta).toFixed(1)}%`);
      console.log(`    Labor Share: ${laborShareDelta > 0 ? '↑' : '↓'} ${Math.abs(laborShareDelta).toFixed(1)}%`);
      console.log(`    Unemployment: ${unemploymentDelta > 0 ? '↓' : '↑'} ${Math.abs(unemploymentDelta).toFixed(1)}%`);
      console.log(`    Avg QoL: ${qolDelta > 0 ? '↑' : '↓'} ${Math.abs(qolDelta).toFixed(1)}%`);
    }
  }

  // Policy recommendations
  console.log(`\n\n💡 POLICY RECOMMENDATIONS:`);
  console.log(`
1. **For Wage Inequality:** ${bestWageGap.scenario}
   - Most effective at preventing productivity-wage decoupling
   - Ensures workers share in AI productivity gains

2. **For Skill Development:** ${bestCompetenceGap.scenario}
   - Minimizes AI dependency and competence gaps
   - Maintains human skills alongside AI assistance

3. **For Employment:** ${bestUnemployment.scenario}
   - Best protection against AI-driven unemployment
   - Provides employment security during transition

4. **For Overall Welfare:** ${bestQoL.scenario}
   - Highest quality of life outcomes
   - Balances multiple objectives effectively

5. **Balanced Approach:** Combined Interventions
   - No single policy solves all problems
   - Multiple policies create synergies and resilience
   - Recommended: 30-40% UBI + 70% retraining + 70% teaching support
  `);
}

// Main execution
async function main() {
  const seed = 42000;
  const maxMonths = 120; // 10 years

  console.log('\n🎯 POLICY SCENARIO COMPARISON');
  console.log('================================');
  console.log(`Simulation length: ${maxMonths} months (10 years)`);
  console.log(`Random seed: ${seed}`);
  console.log(`Scenarios: ${SCENARIOS.length}`);

  const results: ScenarioMetrics[] = [];

  for (const scenario of SCENARIOS) {
    const metrics = runScenario(scenario, seed, maxMonths);
    results.push(metrics);
  }

  generateComparisonReport(results);

  console.log(`\n✅ Policy comparison complete!`);
  console.log(`\nNext steps:`);
  console.log(`  1. Review the comparison report above`);
  console.log(`  2. Test with multiple seeds to validate consistency`);
  console.log(`  3. Document findings in policy recommendations report`);
}

main().catch(console.error);
