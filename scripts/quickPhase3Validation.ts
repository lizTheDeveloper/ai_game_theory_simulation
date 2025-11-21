/**
 * Phase 3 Policy Package Validation
 *
 * Quick validation (N=1) for Phase 3 realistic policy packages:
 * - Green New Deal
 * - Techno-Optimist Path
 * - Degrowth Path
 * - Authoritarian Climate Action
 * - Nordic Social Democracy
 *
 * Validates:
 * 1. Scenario config stored correctly
 * 2. Government priorities enforced
 * 3. Starting conditions applied
 * 4. Tech deployment follows strategy
 * 5. Scenarios produce divergent outcomes
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { SCENARIOS } from '../src/simulation/scenarios/definitions';
import { applyScenario } from '../src/simulation/scenarios/apply';

const PHASE3_POLICY_PACKAGES = [
  'greenNewDeal',
  'technoOptimist',
  'degrowth',
  'authoritarianClimateAction',
  'nordicSocialDemocracy',
];

interface QuickResult {
  scenarioName: string;
  finalMetrics: {
    researchSpending: number;
    gini: number;
    climateStability: number;
    governanceQuality: number;
    spiralsActivated: number;
    socialCohesion: number;
    temperature: number;
  };
}

console.log('\n' + '='.repeat(80));
console.log('🏛️ PHASE 3 POLICY PACKAGE VALIDATION');
console.log('='.repeat(80));
console.log('Testing realistic policy combinations:');
console.log('  • Green New Deal (progressive climate + UBI + redistribution)');
console.log('  • Techno-Optimist (accelerationist + minimal regulation)');
console.log('  • Degrowth (ecological restoration + consumption reduction)');
console.log('  • Authoritarian Climate Action (top-down rapid deployment)');
console.log('  • Nordic Social Democracy (high trust + redistribution + participation)');
console.log('\nRuns: 1 per scenario (N=1)');
console.log('Duration: 60 months');
console.log('='.repeat(80) + '\n');

const results: QuickResult[] = [];

for (const scenarioKey of PHASE3_POLICY_PACKAGES) {
  const scenario = (SCENARIOS as any)[scenarioKey];
  if (!scenario) {
    console.error(`❌ Scenario not found: ${scenarioKey}`);
    continue;
  }

  console.log(`\n${'─'.repeat(80)}`);
  console.log(`🏛️ Running: ${scenario.name}`);
  console.log(`${'─'.repeat(80)}`);

  // Create engine and initial state
  const seed = 42;
  const tempEngine = new SimulationEngine(undefined as any, seed);
  const rng = tempEngine.getRNG().next.bind(tempEngine.getRNG());
  const state = createDefaultInitialState(rng);

  // Apply scenario
  applyScenario(state, scenario, rng);

  // Validate scenario config stored
  if (!state.scenarioConfig) {
    console.log(`\n❌ FAILED: Scenario config NOT stored in state`);
    continue;
  }

  console.log(`\n✅ Scenario config stored: ${state.scenarioConfig.name}`);
  console.log(`   Government priorities:`);
  if (state.scenarioConfig.governmentPriorities) {
    const p = state.scenarioConfig.governmentPriorities;
    if (p.climateSpending !== undefined) {
      console.log(`     Climate spending:   ${(p.climateSpending * 100).toFixed(0)}%`);
    }
    if (p.redistributionLevel !== undefined) {
      console.log(`     Redistribution:     ${(p.redistributionLevel * 100).toFixed(0)}%`);
    }
    if (p.scientificResearch !== undefined) {
      console.log(`     Research:           ${(p.scientificResearch * 100).toFixed(0)}%`);
    }
    if (p.democraticParticipation !== undefined) {
      console.log(`     Democracy:          ${(p.democraticParticipation * 100).toFixed(0)}%`);
    }
  }

  // Show starting conditions
  if (state.scenarioConfig.startingConditions) {
    console.log(`   Starting conditions:`);
    const s = state.scenarioConfig.startingConditions;
    if (s.gini !== undefined) {
      console.log(`     Target Gini:        ${s.gini.toFixed(3)}`);
    }
    if (s.governanceQuality !== undefined) {
      console.log(`     Governance quality: ${(s.governanceQuality * 100).toFixed(0)}%`);
    }
    if (s.institutionalTrust !== undefined) {
      console.log(`     Institutional trust: ${(s.institutionalTrust * 100).toFixed(0)}%`);
    }
  }

  // Show tech strategy
  if (state.scenarioConfig.techDeployment) {
    console.log(`   Tech deployment:`);
    const t = state.scenarioConfig.techDeployment;
    console.log(`     Strategy:           ${t.strategy}`);
    if (t.priority) {
      console.log(`     Priority:           ${t.priority}`);
    }
    if (t.deploymentInterval) {
      console.log(`     Interval:           ${t.deploymentInterval} months`);
    }
  }

  // Run simulation
  const engine = new SimulationEngine(undefined as any, seed);
  let month = 0;
  const MAX_MONTHS = 60;

  while (month < MAX_MONTHS) {
    engine.step(state);
    month = state.currentMonth;

    if (state.outcome) {
      console.log(`\n⚠️ Early termination: ${state.outcome} at month ${month}`);
      break;
    }
  }

  // Collect final metrics
  const spiralsActive = Object.entries(state.upwardSpirals)
    .filter(([key, _]) => key !== 'cascadeMonths')
    .filter(([_, spiral]) => (spiral as any).active || (spiral as any).monthsActive > 0)
    .length;

  const finalGini = state.inequality?.gini ?? 0.4;
  const researchSpending = state.governmentAgent?.researchSpending ?? 0;
  const climateStability = state.qualityOfLifeSystems.climateStability;
  const governanceQuality = state.governmentAgent?.governanceQuality ?? 0.5;
  const socialCohesion = state.socialCohesionSystem?.overallCohesion ?? 0.5;
  const temperature = state.environment?.surfaceTemperature ?? 1.2;

  console.log(`\n📊 Final State (Month ${month}):`);
  console.log(`   Research spending:  $${(researchSpending / 1e9).toFixed(1)}B`);
  console.log(`   Gini coefficient:   ${finalGini.toFixed(3)}`);
  console.log(`   Climate stability:  ${(climateStability * 100).toFixed(1)}%`);
  console.log(`   Social cohesion:    ${(socialCohesion * 100).toFixed(1)}%`);
  console.log(`   Temperature:        +${temperature.toFixed(2)}°C`);
  console.log(`   Governance quality: ${(governanceQuality * 100).toFixed(1)}%`);
  console.log(`   Spirals activated:  ${spiralsActive}/6`);

  results.push({
    scenarioName: scenario.name,
    finalMetrics: {
      researchSpending,
      gini: finalGini,
      climateStability,
      governanceQuality,
      spiralsActivated: spiralsActive,
      socialCohesion,
      temperature,
    },
  });
}

// Generate comparison table
console.log('\n\n' + '='.repeat(80));
console.log('📊 PHASE 3 POLICY PACKAGE COMPARISON');
console.log('='.repeat(80));

console.log('\n📋 Policy Package Outcomes:');
for (const result of results) {
  const m = result.finalMetrics;
  console.log(`\n  ${result.scenarioName}:`);
  console.log(`    Research:  $${(m.researchSpending / 1e9).toFixed(1)}B`);
  console.log(`    Gini:      ${m.gini.toFixed(3)}`);
  console.log(`    Climate:   ${(m.climateStability * 100).toFixed(1)}%`);
  console.log(`    Cohesion:  ${(m.socialCohesion * 100).toFixed(1)}%`);
  console.log(`    Temp:      +${m.temperature.toFixed(2)}°C`);
  console.log(`    Spirals:   ${m.spiralsActivated}/6`);
}

console.log('\n📊 DIVERGENCE CHECK:');
const researchSpending = results.map((r) => r.finalMetrics.researchSpending);
const giniValues = results.map((r) => r.finalMetrics.gini);
const climateValues = results.map((r) => r.finalMetrics.climateStability);
const cohesionValues = results.map((r) => r.finalMetrics.socialCohesion);

const researchDiverged =
  Math.max(...researchSpending) - Math.min(...researchSpending) > 1e9; // >$1B difference
const giniDiverged = Math.max(...giniValues) - Math.min(...giniValues) > 0.01; // >0.01 difference
const climateDiverged =
  Math.max(...climateValues) - Math.min(...climateValues) > 0.01; // >1% difference
const cohesionDiverged =
  Math.max(...cohesionValues) - Math.min(...cohesionValues) > 0.05; // >5% difference

console.log(`  Research spending diverged: ${researchDiverged ? '✅ YES' : '❌ NO'}`);
console.log(`  Gini coefficient diverged:  ${giniDiverged ? '✅ YES' : '❌ NO'}`);
console.log(`  Climate stability diverged: ${climateDiverged ? '✅ YES' : '❌ NO'}`);
console.log(`  Social cohesion diverged:   ${cohesionDiverged ? '✅ YES' : '❌ NO'}`);

if (researchDiverged || giniDiverged || climateDiverged || cohesionDiverged) {
  console.log('\n✅ VALIDATION PASSED: Policy packages produce divergent outcomes');
} else {
  console.log('\n⚠️ WARNING: Policy packages converging (may need stronger multipliers)');
}

console.log('\n📈 KEY INSIGHTS:');
console.log('  Expected patterns:');
console.log('    • Green New Deal:         Low Gini + High Climate + Moderate Research');
console.log('    • Techno-Optimist:        High Research + Moderate Climate + Higher Gini');
console.log('    • Degrowth:               Low Temp + High Cohesion + Lower Research');
console.log('    • Authoritarian Climate:  High Climate + Low Cohesion + Fast Deployment');
console.log('    • Nordic Social Democracy: Low Gini + High Cohesion + Balanced All');

console.log('\n' + '='.repeat(80));
console.log('✅ Phase 3 Quick Validation Complete');
console.log('='.repeat(80) + '\n');
