/**
 * Diagnostic: Spiral Threshold Validation
 *
 * INVESTIGATION: Can spirals activate under ANY scenario?
 *
 * CONTEXT:
 * - 0/160 runs showed any spiral activations
 * - Spiral activation windows: years 15-30 (months 180-360)
 * - Requires mortality < 50% to reach these windows
 * - Current model: ~99% mortality by year 15 in all tested scenarios
 *
 * QUESTIONS:
 * 1. What is the minimum achievable mortality at year 15 under current model?
 * 2. Can ANY scenario reach the spiral activation windows?
 * 3. If not, what threshold adjustments would make spirals testable?
 *
 * This script tests by running two scenarios:
 * 1. Baseline: No tech deployment, measure natural mortality trajectory
 * 2. God Mode: All techs deployed immediately + unlimited resources
 *
 * @module scripts/diagnosticSpiralThresholds
 */

import { createDefaultInitialState } from '@/simulation/initialization';
import type { GameState } from '@/types/game';
import { SimulationEngine } from '@/simulation/engine';

/**
 * Log spiral state and mortality
 */
function logSpiralState(state: GameState, label: string): void {
  const pop = state.humanPopulationSystem.population;
  const initialPop = 8.1; // Starting population in billions
  const mortality = ((initialPop - pop) / initialPop) * 100;
  const year = Math.floor(state.currentMonth / 12);
  const month = state.currentMonth % 12;

  console.log(`\n=== ${label} (Year ${year}, Month ${month}) ===`);
  console.log(`  Population: ${pop.toFixed(3)}B (${(pop * 1e9).toLocaleString()} people)`);
  console.log(`  Mortality: ${mortality.toFixed(1)}%`);

  // Log spiral states
  const spirals = state.upwardSpirals;
  console.log(`\n  Spiral Activation Status:`);
  console.log(`    Abundance:   ${spirals.abundance.active ? '✅ ACTIVE' : '❌ INACTIVE'} (strength: ${spirals.abundance.strength.toFixed(2)}, months: ${spirals.abundance.monthsActive})`);
  console.log(`    Cognitive:   ${spirals.cognitive.active ? '✅ ACTIVE' : '❌ INACTIVE'} (strength: ${spirals.cognitive.strength.toFixed(2)}, months: ${spirals.cognitive.monthsActive})`);
  console.log(`    Democratic:  ${spirals.democratic.active ? '✅ ACTIVE' : '❌ INACTIVE'} (strength: ${spirals.democratic.strength.toFixed(2)}, months: ${spirals.democratic.monthsActive})`);
  console.log(`    Scientific:  ${spirals.scientific.active ? '✅ ACTIVE' : '❌ INACTIVE'} (strength: ${spirals.scientific.strength.toFixed(2)}, months: ${spirals.scientific.monthsActive})`);
  console.log(`    Meaning:     ${spirals.meaning.active ? '✅ ACTIVE' : '❌ INACTIVE'} (strength: ${spirals.meaning.strength.toFixed(2)}, months: ${spirals.meaning.monthsActive})`);
  console.log(`    Ecological:  ${spirals.ecological.active ? '✅ ACTIVE' : '❌ INACTIVE'} (strength: ${spirals.ecological.strength.toFixed(2)}, months: ${spirals.ecological.monthsActive})`);
  console.log(`    CASCADE:     ${spirals.cascadeActive ? '🌟 ACTIVE' : '⭕ INACTIVE'} (strength: ${spirals.cascadeStrength.toFixed(2)}, months: ${spirals.cascadeMonths})`);

  // Log key metrics that affect spiral activation
  console.log(`\n  Key Metrics for Spiral Activation:`);
  console.log(`    Material Abundance: ${state.qualityOfLifeSystems.materialAbundance.toFixed(2)} (need > 1.5)`);
  console.log(`    Energy Availability: ${state.qualityOfLifeSystems.energyAvailability.toFixed(2)} (need > 1.5)`);
  console.log(`    Unemployment: ${(state.society.unemploymentLevel * 100).toFixed(1)}% (need > 60%)`);
  console.log(`    Economic Transition Stage: ${state.globalMetrics.economicTransitionStage} (need >= 3)`);
  console.log(`    Disease Burden: ${(state.qualityOfLifeSystems.diseasesBurden * 100).toFixed(1)}% (need < 30%)`);
  console.log(`    Healthcare Quality: ${(state.qualityOfLifeSystems.healthcareQuality * 100).toFixed(1)}% (need > 80%)`);
  console.log(`    Meaning Crisis: ${(state.socialAccumulation.meaningCrisisLevel * 100).toFixed(1)}% (need < 30%)`);
  console.log(`    Decision Quality: ${(state.government.governanceQuality.decisionQuality * 100).toFixed(1)}% (need > 70%)`);
  console.log(`    Participation Rate: ${(state.government.governanceQuality.participationRate * 100).toFixed(1)}% (need > 60%)`);
}

/**
 * Apply god mode: Deploy all techs immediately + unlimited resources
 */
function applyGodMode(state: GameState): void {
  console.log(`\n🔧 APPLYING GOD MODE:`);
  console.log(`  - Deploying all breakthrough technologies immediately`);
  console.log(`  - Setting unlimited resource budgets`);
  console.log(`  - Maximizing governance quality`);

  // Deploy all breakthrough technologies
  if (state.breakthroughTechnologies) {
    const techs = state.breakthroughTechnologies;
    Object.keys(techs).forEach((key) => {
      const tech = techs[key as keyof typeof techs];
      if (tech && typeof tech === 'object' && 'deployed' in tech && 'deploymentLevel' in tech) {
        tech.deployed = true;
        tech.deploymentLevel = 1.0;
      }
    });
    console.log(`  ✅ Deployed all breakthrough technologies`);
  }

  // Set unlimited research budgets
  state.government.researchInvestments.totalBudget = 1000; // $1T/month
  state.government.researchInvestments.aiAlignment = 300;
  state.government.researchInvestments.climate = 300;
  state.government.researchInvestments.biotech = 200;
  state.government.researchInvestments.materials = 200;
  console.log(`  ✅ Set research budget to $1T/month`);

  // Maximize governance quality
  state.government.governanceQuality.decisionQuality = 0.9;
  state.government.governanceQuality.institutionalCapacity = 0.9;
  state.government.governanceQuality.participationRate = 0.8;
  state.government.governanceQuality.transparency = 0.9;
  state.government.governanceQuality.consensusBuildingEfficiency = 0.8;
  console.log(`  ✅ Maximized governance quality`);

  // Boost initial conditions
  state.qualityOfLifeSystems.materialAbundance = 1.2;
  state.qualityOfLifeSystems.energyAvailability = 1.2;
  state.qualityOfLifeSystems.healthcareQuality = 0.7;
  state.qualityOfLifeSystems.diseasesBurden = 0.4;
  console.log(`  ✅ Boosted initial QoL conditions`);
}

/**
 * Run simulation for specified months and track key milestones
 */
function runScenario(
  scenarioName: string,
  applyGodModeFlag: boolean,
  seed: string,
  targetMonth: number = 360 // 30 years
): void {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`SCENARIO: ${scenarioName}`);
  console.log(`${'='.repeat(80)}`);

  // Create engine with seed to get RNG
  const engine = new SimulationEngine({ seed, maxMonths: targetMonth });
  const seededRng = engine.getRNG();
  const rng = seededRng.next.bind(seededRng);
  const state = createDefaultInitialState(rng);

  if (applyGodModeFlag) {
    applyGodMode(state);
  }

  logSpiralState(state, `Initial State (Month 0)`);

  // Track milestones
  const milestones = [60, 120, 180, 240, 300, 360]; // Every 5 years
  let crashed = false;

  for (let month = 1; month <= targetMonth; month++) {
    try {
      engine.step(state, rng);

      // Log at milestones
      if (milestones.includes(month)) {
        logSpiralState(state, `Milestone Check (Month ${month})`);
      }

      // Check for crash conditions
      const pop = state.humanPopulationSystem.population;
      if (pop < 0.1) {
        console.log(`\n💀 CRASH: Population collapsed to ${pop.toFixed(3)}B at month ${month}`);
        crashed = true;
        break;
      }

      if (state.planetaryBoundaries.climateChange.breachIntensity > 10) {
        console.log(`\n🌍 CRASH: Climate breach intensity ${state.planetaryBoundaries.climateChange.breachIntensity.toFixed(1)}× at month ${month}`);
        crashed = true;
        break;
      }

    } catch (error) {
      console.log(`\n❌ ERROR at month ${month}:`, error);
      crashed = true;
      break;
    }
  }

  // Final state
  if (!crashed) {
    logSpiralState(state, `Final State (Month ${targetMonth})`);
    console.log(`\n✅ COMPLETED: Simulation ran for ${targetMonth} months without crashing`);
  }

  // Summary
  const finalPop = state.humanPopulationSystem.population;
  const initialPop = 8.1;
  const finalMortality = ((initialPop - finalPop) / initialPop) * 100;

  console.log(`\n${'='.repeat(80)}`);
  console.log(`SUMMARY: ${scenarioName}`);
  console.log(`${'='.repeat(80)}`);
  console.log(`  Status: ${crashed ? '💀 CRASHED' : '✅ COMPLETED'}`);
  console.log(`  Final Mortality: ${finalMortality.toFixed(1)}%`);
  console.log(`  Final Population: ${finalPop.toFixed(3)}B`);

  const spirals = state.upwardSpirals;
  const activeSpirals = [
    spirals.abundance.active,
    spirals.cognitive.active,
    spirals.democratic.active,
    spirals.scientific.active,
    spirals.meaning.active,
    spirals.ecological.active
  ].filter(Boolean).length;

  console.log(`  Active Spirals: ${activeSpirals}/6`);
  console.log(`  Cascade Active: ${spirals.cascadeActive ? '🌟 YES' : '⭕ NO'}`);

  // Check if spirals ever activated (not just at end)
  const everActivated = [
    spirals.abundance.lastActivatedMonth,
    spirals.cognitive.lastActivatedMonth,
    spirals.democratic.lastActivatedMonth,
    spirals.scientific.lastActivatedMonth,
    spirals.meaning.lastActivatedMonth,
    spirals.ecological.lastActivatedMonth
  ].filter(m => m >= 0).length;

  console.log(`  Spirals Ever Activated: ${everActivated}/6`);

  if (everActivated > 0) {
    console.log(`\n  📊 Activation History:`);
    if (spirals.abundance.lastActivatedMonth >= 0)
      console.log(`    Abundance: First at month ${spirals.abundance.lastActivatedMonth}`);
    if (spirals.cognitive.lastActivatedMonth >= 0)
      console.log(`    Cognitive: First at month ${spirals.cognitive.lastActivatedMonth}`);
    if (spirals.democratic.lastActivatedMonth >= 0)
      console.log(`    Democratic: First at month ${spirals.democratic.lastActivatedMonth}`);
    if (spirals.scientific.lastActivatedMonth >= 0)
      console.log(`    Scientific: First at month ${spirals.scientific.lastActivatedMonth}`);
    if (spirals.meaning.lastActivatedMonth >= 0)
      console.log(`    Meaning: First at month ${spirals.meaning.lastActivatedMonth}`);
    if (spirals.ecological.lastActivatedMonth >= 0)
      console.log(`    Ecological: First at month ${spirals.ecological.lastActivatedMonth}`);
  }
}

/**
 * Main execution
 */
function main(): void {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`SPIRAL THRESHOLD VALIDATION DIAGNOSTIC`);
  console.log(`${'='.repeat(80)}`);
  console.log(`\nOBJECTIVE: Determine if spirals can activate under ANY scenario`);
  console.log(`\nMETHOD:`);
  console.log(`  1. Run baseline (no tech) for 30 years`);
  console.log(`  2. Run god mode (all tech + unlimited resources) for 30 years`);
  console.log(`  3. Compare mortality trajectories and spiral activation`);
  console.log(`\nCRITERIA:`);
  console.log(`  - Spiral windows: Years 15-30 (months 180-360)`);
  console.log(`  - Need mortality < 50% to reach windows`);
  console.log(`  - Track if ANY spiral ever activates`);

  const seed = 'spiral-threshold-validation-2025-11-25';

  // Run baseline
  runScenario('BASELINE (No Tech Deployment)', false, seed);

  // Run god mode
  runScenario('GOD MODE (All Tech + Unlimited Resources)', true, seed);

  console.log(`\n${'='.repeat(80)}`);
  console.log(`VALIDATION COMPLETE`);
  console.log(`${'='.repeat(80)}`);
  console.log(`\nNEXT STEPS:`);
  console.log(`  1. Review mortality trajectories above`);
  console.log(`  2. Check if god mode reached year 15 with < 50% mortality`);
  console.log(`  3. If yes: Spirals may be testable with proper scenarios`);
  console.log(`  4. If no: Spiral thresholds need adjustment for current model dynamics`);
  console.log(`\nREFERENCE: reviews/governance_scenario_sequenced_analysis_20251125.md`);
}

// Run if executed directly
if (require.main === module) {
  main();
}
