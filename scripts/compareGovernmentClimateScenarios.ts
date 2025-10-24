/**
 * Government Climate Priority Comparative Simulation
 *
 * Tests three government behavior scenarios:
 * 1. BASELINE: Normal government behavior (current simulation)
 * 2. CRISIS-REACTIVE: Research-backed model (researcher recommendation)
 * 3. MAXIMUM-MOBILIZATION: Existential crisis response (skeptic alternative)
 *
 * Research Foundation:
 * - Researcher: /research/government_climate_investment_adoption_patterns_20251024.md
 * - Skeptic: /reviews/government_climate_investment_patterns_critique_20251024.md
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { SimulationEngine } from '../src/simulation/engine';
import { GameState } from '../src/types/game';

// Scenario configurations
type GovernmentScenario = 'baseline' | 'crisis-reactive' | 'maximum-mobilization';

interface ScenarioConfig {
  name: string;
  description: string;
  policyLag: number; // months
  scalingDuration: number; // months
  ecologyThresholds: {
    threshold: number;
    targetScaling: number;
  }[];
  proactiveGrowth: number; // annual % growth without crises
}

const SCENARIOS: Record<GovernmentScenario, ScenarioConfig> = {
  'baseline': {
    name: 'Baseline (Current Simulation)',
    description: 'Government uses normal action selection, no forced climate priorities',
    policyLag: 0,
    scalingDuration: 0,
    ecologyThresholds: [],
    proactiveGrowth: 0
  },

  'crisis-reactive': {
    name: 'Crisis-Reactive (Researcher Model)',
    description: 'Empirical model: 4-5 year doubling, 18-36 month lag, modest scaling',
    policyLag: 24, // 18-36 months average
    scalingDuration: 54, // 48-60 months average
    ecologyThresholds: [
      { threshold: 30, targetScaling: 1.35 }, // 1.2-1.5× average
      { threshold: 20, targetScaling: 1.75 }, // 1.5-2.0× average
      { threshold: 10, targetScaling: 2.25 }  // 2.0-2.5× average
    ],
    proactiveGrowth: 0.035 // 2-5% annual average
  },

  'maximum-mobilization': {
    name: 'Maximum Mobilization (Skeptic Alternative)',
    description: 'WWII-style response: 5-30× scaling, 5-11 month lag (AI-augmented)',
    policyLag: 8, // 5-11 months with AI assistance
    scalingDuration: 24, // 2 years to reach target (wartime speed)
    ecologyThresholds: [
      { threshold: 30, targetScaling: 2.0 },  // Moderate crisis
      { threshold: 20, targetScaling: 5.0 },  // Serious crisis (China renewables pace)
      { threshold: 10, targetScaling: 15.0 }, // Existential (WWII-style mobilization)
      { threshold: 5, targetScaling: 30.0 }   // Extinction-level (maximum possible)
    ],
    proactiveGrowth: 0.05 // 5% annual growth baseline
  }
};

/**
 * Apply scenario-specific government behavior override
 */
function applyGovernmentScenario(
  state: GameState,
  scenario: GovernmentScenario,
  config: ScenarioConfig,
  month: number
): void {
  if (scenario === 'baseline') {
    // No override - use normal government action selection
    return;
  }

  const currentMitigation = state.government.researchInvestments?.climate?.mitigation ?? 4;
  const currentIntervention = state.government.researchInvestments?.climate?.intervention ?? 4;
  const ecologyScore = state.multiParadigmDUI?.paradigmScores?.ecological?.value ?? 10;

  // Calculate target investment based on ecology score
  let targetScaling = 1.0;
  for (const threshold of config.ecologyThresholds) {
    if (ecologyScore < threshold.threshold) {
      targetScaling = threshold.targetScaling;
      break; // Use first (most severe) matching threshold
    }
  }

  // Apply proactive growth even without crises
  const yearsElapsed = month / 12;
  const proactiveMultiplier = Math.pow(1 + config.proactiveGrowth, yearsElapsed);

  // Baseline is 4/10 = $1.4T
  const baselineInvestment = 4;
  const targetInvestment = baselineInvestment * targetScaling * proactiveMultiplier;

  // Cap at 10 (simulation max)
  const cappedTarget = Math.min(10, targetInvestment);

  // Calculate how much we should have increased by now
  // Account for policy lag and scaling duration
  let actualTarget = baselineInvestment;

  if (month > config.policyLag) {
    const monthsSincePolicy = month - config.policyLag;
    const scalingProgress = Math.min(1.0, monthsSincePolicy / config.scalingDuration);

    // Sigmoid scaling curve (slow start, rapid middle, slow finish)
    const sigmoidProgress = 1 / (1 + Math.exp(-6 * (scalingProgress - 0.5)));

    actualTarget = baselineInvestment + (cappedTarget - baselineInvestment) * sigmoidProgress;
  }

  // Set government investment levels (force climate priority)
  if (state.government.researchInvestments) {
    state.government.researchInvestments.climate.mitigation = Math.min(10, Math.max(currentMitigation, actualTarget));
    state.government.researchInvestments.climate.intervention = Math.min(10, Math.max(currentIntervention, actualTarget));

    // Log significant changes
    if (month % 12 === 0 && Math.abs(actualTarget - currentMitigation) > 0.5) {
      const investment = (actualTarget / 10) * 3.5;
      console.log(`  📈 [${scenario.toUpperCase()}] Year ${(month/12).toFixed(0)}: Climate investment ${currentMitigation.toFixed(1)} → ${actualTarget.toFixed(1)} ($${investment.toFixed(2)}T/year)`);
      console.log(`     Ecology: ${ecologyScore.toFixed(1)}/100, Target scaling: ${targetScaling.toFixed(2)}×`);
    }
  }
}

/**
 * Run a single simulation with a specific scenario
 */
async function runScenario(
  scenario: GovernmentScenario,
  config: ScenarioConfig,
  seed: number,
  maxMonths: number
): Promise<{
  scenario: GovernmentScenario;
  finalEcology: number;
  finalInvestment: number;
  monthlyEcology: number[];
  monthlyInvestment: number[];
}> {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🔬 SCENARIO: ${config.name}`);
  console.log(`   ${config.description}`);
  console.log(`   Seed: ${seed}, Duration: ${maxMonths} months (${(maxMonths/12).toFixed(1)} years)`);
  console.log(`${'='.repeat(80)}\n`);

  const state = createDefaultInitialState(seed);
  const engine = new SimulationEngine();

  const monthlyEcology: number[] = [];
  const monthlyInvestment: number[] = [];

  for (let month = 0; month < maxMonths; month++) {
    // Apply scenario-specific government behavior
    applyGovernmentScenario(state, scenario, config, month);

    // Run simulation step
    engine.step(state);

    // Track metrics
    const ecology = state.multiParadigmDUI?.paradigmScores?.ecological?.value ?? 0;
    const investment = (state.government.researchInvestments?.climate?.mitigation ?? 0);

    // DEBUG: Log first month
    if (month === 0) {
      console.log(`\n  🔍 DEBUG Month 0:`);
      console.log(`     multiParadigmDUI exists: ${!!state.multiParadigmDUI}`);
      console.log(`     paradigmScores exists: ${!!state.multiParadigmDUI?.paradigmScores}`);
      console.log(`     ecological exists: ${!!state.multiParadigmDUI?.paradigmScores?.ecological}`);
      console.log(`     ecological.value: ${state.multiParadigmDUI?.paradigmScores?.ecological?.value}`);
      console.log(`     Using ?? 0 fallback, result: ${ecology}`);
    }

    monthlyEcology.push(ecology);
    monthlyInvestment.push(investment);

    // Log progress every year
    if (month % 12 === 0) {
      const year = month / 12;
      const investmentT = (investment / 10) * 3.5;
      console.log(`  Year ${year.toFixed(0)}: Ecology ${ecology.toFixed(1)}/100, Investment $${investmentT.toFixed(2)}T/year`);
    }
  }

  const finalEcology = state.multiParadigmDUI?.paradigmScores?.ecological?.value ?? 0;
  const finalInvestment = (state.government.researchInvestments?.climate?.mitigation ?? 0);

  console.log(`\n  ✅ FINAL: Ecology ${finalEcology.toFixed(1)}/100, Investment ${finalInvestment.toFixed(1)}/10 ($${(finalInvestment/10 * 3.5).toFixed(2)}T/year)`);

  return {
    scenario,
    finalEcology,
    finalInvestment,
    monthlyEcology,
    monthlyInvestment
  };
}

/**
 * Main comparative analysis
 */
async function main() {
  const args = process.argv.slice(2);
  const maxMonths = parseInt(args.find(arg => arg.startsWith('--months='))?.split('=')[1] ?? '360');
  const seed = parseInt(args.find(arg => arg.startsWith('--seed='))?.split('=')[1] ?? '42');

  console.log(`\n${'█'.repeat(80)}`);
  console.log(`🌍 GOVERNMENT CLIMATE PRIORITY COMPARATIVE SIMULATION`);
  console.log(`${'█'.repeat(80)}\n`);
  console.log(`Configuration:`);
  console.log(`  Duration: ${maxMonths} months (${(maxMonths/12).toFixed(1)} years)`);
  console.log(`  Seed: ${seed}`);
  console.log(`  Scenarios: 3 (baseline, crisis-reactive, maximum-mobilization)\n`);

  const results: Awaited<ReturnType<typeof runScenario>>[] = [];

  // Run each scenario
  for (const [scenarioKey, config] of Object.entries(SCENARIOS)) {
    const result = await runScenario(scenarioKey as GovernmentScenario, config, seed, maxMonths);
    results.push(result);
  }

  // Comparative summary
  console.log(`\n\n${'█'.repeat(80)}`);
  console.log(`📊 COMPARATIVE RESULTS (${(maxMonths/12).toFixed(1)} years)`);
  console.log(`${'█'.repeat(80)}\n`);

  console.log(`Scenario Comparison:\n`);
  console.log(`┌${'─'.repeat(35)}┬${'─'.repeat(20)}┬${'─'.repeat(22)}┐`);
  console.log(`│ Scenario${' '.repeat(27)}│ Ecology Score       │ Final Investment     │`);
  console.log(`├${'─'.repeat(35)}┼${'─'.repeat(20)}┼${'─'.repeat(22)}┤`);

  for (const result of results) {
    const scenarioName = SCENARIOS[result.scenario].name;
    const ecology = `${result.finalEcology.toFixed(1)}/100`;
    const investment = `${result.finalInvestment.toFixed(1)}/10 ($${(result.finalInvestment/10 * 3.5).toFixed(2)}T)`;

    console.log(`│ ${scenarioName.padEnd(33)} │ ${ecology.padEnd(18)} │ ${investment.padEnd(20)} │`);
  }
  console.log(`└${'─'.repeat(35)}┴${'─'.repeat(20)}┴${'─'.repeat(22)}┘\n`);

  // Calculate improvements
  const baseline = results.find(r => r.scenario === 'baseline');
  const reactive = results.find(r => r.scenario === 'crisis-reactive');
  const mobilization = results.find(r => r.scenario === 'maximum-mobilization');

  if (baseline && reactive && mobilization) {
    console.log(`Improvements vs Baseline:\n`);

    const reactiveImprovement = reactive.finalEcology - baseline.finalEcology;
    const mobilizationImprovement = mobilization.finalEcology - baseline.finalEcology;

    console.log(`  Crisis-Reactive:       +${reactiveImprovement.toFixed(1)} points (${((reactiveImprovement/baseline.finalEcology)*100).toFixed(1)}% improvement)`);
    console.log(`  Maximum Mobilization:  +${mobilizationImprovement.toFixed(1)} points (${((mobilizationImprovement/baseline.finalEcology)*100).toFixed(1)}% improvement)\n`);

    // Key insights
    console.log(`Key Insights:\n`);

    if (reactiveImprovement < 5) {
      console.log(`  ⚠️  Crisis-reactive model shows minimal improvement (<5 points)`);
      console.log(`      → Tech tree may be insufficient for recovery even with optimal investment`);
      console.log(`      → Or 30 years is too short for recovery to manifest\n`);
    } else if (reactiveImprovement < 20) {
      console.log(`  ✓  Crisis-reactive model shows modest improvement (5-20 points)`);
      console.log(`      → Investment scaling has measurable but limited impact`);
      console.log(`      → Recovery possible but requires sustained effort\n`);
    } else {
      console.log(`  ✅ Crisis-reactive model shows strong improvement (>20 points)`);
      console.log(`      → Investment scaling is effective for ecology recovery`);
      console.log(`      → Research-backed timescales are sufficient\n`);
    }

    if (mobilizationImprovement > reactiveImprovement * 2) {
      console.log(`  💡 Maximum mobilization dramatically outperforms reactive model`);
      console.log(`      → WWII-style response could enable rapid recovery`);
      console.log(`      → Suggests government behavior, not tech availability, is bottleneck\n`);
    }

    if (mobilization.finalEcology > 50) {
      console.log(`  🌍 Maximum mobilization achieves >50/100 ecology`);
      console.log(`      → Full recovery is technically feasible with aggressive investment`);
      console.log(`      → Question shifts to political feasibility of mobilization\n`);
    }
  }

  console.log(`\nResearch Citations:`);
  console.log(`  Researcher: research/government_climate_investment_adoption_patterns_20251024.md`);
  console.log(`  Skeptic: reviews/government_climate_investment_patterns_critique_20251024.md\n`);
}

main().catch(console.error);
