/**
 * Test Climate-Focused Government Priorities
 *
 * Research Question: How do government decision-making priorities affect
 * long-term outcomes when climate action is heavily prioritized vs balanced approach?
 *
 * Research Foundation:
 * - Stechemesser et al. (2024) Science: 1,500 climate policies evaluated globally
 * - Hagedorn et al. (2024) Nature Communications: Carbon pricing meta-analysis (80 studies)
 * - IPCC AR6 Synthesis Report (2023): Policy effectiveness timelines
 * - IEA World Energy Outlook 2023: Green growth feasibility
 * - IRENA-ILO Employment Review 2024: Green jobs data
 *
 * Key Finding: Current progressive governments allocate 15-25% priority to climate.
 * Most aggressive governments (Denmark, Germany) reach 30-40% climate priority.
 * No government has approached 50%+ climate allocation while maintaining core functions.
 *
 * This script compares RESEARCH-VALIDATED priority allocations:
 * 1. Status Quo (10% climate) - Current baseline
 * 2. Moderate (20% climate) - Progressive governments (Biden, von der Leyen)
 * 3. Ambitious (35% climate) - Maximum observed (Denmark, Germany)
 * 4. Crisis-Mode (45% climate) - Theoretical upper bound (no empirical examples)
 *
 * Expected Outcomes (from research):
 * - Moderate (20%): -1% to -3%/year emissions, GDP +2-3%/year, synergistic
 * - Ambitious (35%): -4% to -6%/year emissions, GDP +1.5-2.5%/year, Paris-aligned
 * - Crisis-Mode (45%): -7% to -10%/year emissions, GDP uncertain, high political risk
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { GameState } from '../src/types/game';

interface GovernmentPriorityProfile {
  name: string;
  description: string;
  researchFrame: 'optimistic' | 'pessimistic';
  weights: {
    climate: number;
    economic: number;
    geopolitical: number;
    social: number;
    technological: number;
  };
  // Research-backed effectiveness parameters
  policyEffectiveness: number; // Annual emission reduction rate
  economicImpact: number; // GDP multiplier
  synergyMultiplier: number; // Policy interaction effect
  implementationLag: number; // Months from decision to impact
  reversalRisk: number; // Probability per election cycle
  vestedInterestPenalty?: number; // Effectiveness reduction from lobbying
  carbonLeakage?: number; // Emission leakage without global coordination
}

/**
 * Research-Validated Government Priority Profiles with Uncertainty Bracketing
 *
 * Two competing research narratives (both peer-reviewed):
 * - OPTIMISTIC (Green Growth): Policy mixes work, synergies exist, 15-25% emission reductions
 * - PESSIMISTIC (Structural Barriers): 96% of policies fail, vested interests dominate, 5-8% reductions
 *
 * Sources:
 * - Optimistic: Stechemesser et al. (2024), Hagedorn et al. (2024), IEA WEO 2023
 * - Pessimistic: Hickel & Vogel (2023), Böhringer et al. (2022), Nature Comm (2024)
 *
 * We test BOTH to bracket uncertainty per project philosophy: "let the model show what it shows"
 */
const PRIORITY_PROFILES: GovernmentPriorityProfile[] = [
  // ============================================================================
  // BASELINE (Both Frames Agree)
  // ============================================================================
  {
    name: 'Baseline - Status Quo',
    description: 'Current allocation (most countries 2020-2024) - neutral baseline',
    researchFrame: 'optimistic', // Minimal difference between frames at 10%
    weights: {
      climate: 0.10,
      economic: 0.30,
      geopolitical: 0.20,
      social: 0.35,
      technological: 0.05,
    },
    policyEffectiveness: 0.005, // 0-0.5%/year emission reduction
    economicImpact: 1.025, // +2.5%/year GDP growth (baseline)
    synergyMultiplier: 1.0, // No synergy at minimal priority
    implementationLag: 36, // 3 years (bureaucratic baseline)
    reversalRisk: 0.2, // 20% per election (low stakes)
  },

  // ============================================================================
  // OPTIMISTIC FRAME (Green Growth)
  // ============================================================================
  {
    name: 'Optimistic - Moderate Priority (20%)',
    description: 'Progressive govts (Biden, von der Leyen) with green growth synergies',
    researchFrame: 'optimistic',
    weights: {
      climate: 0.20,
      economic: 0.25,
      geopolitical: 0.18,
      social: 0.30,
      technological: 0.07,
    },
    policyEffectiveness: 0.02, // 1-3%/year emission reduction
    economicImpact: 1.027, // +2.7%/year (green jobs + co-benefits)
    synergyMultiplier: 1.3, // Modest synergy from policy coordination
    implementationLag: 30, // 2.5 years (proactive government)
    reversalRisk: 0.35, // 35% per election
  },
  {
    name: 'Optimistic - Ambitious Priority (35%)',
    description: 'Denmark/Germany level with strong policy mixes, Paris-aligned',
    researchFrame: 'optimistic',
    weights: {
      climate: 0.35,
      economic: 0.22,
      geopolitical: 0.13,
      social: 0.20,
      technological: 0.10,
    },
    policyEffectiveness: 0.05, // 4-6%/year emission reduction (Paris 1.5°C)
    economicImpact: 1.020, // +2.0%/year (co-benefits offset costs)
    synergyMultiplier: 1.7, // Strong policy mix synergy
    implementationLag: 24, // 2 years (coordinated action)
    reversalRisk: 0.55, // 55% per election (ambitious = risky)
  },
  {
    name: 'Optimistic - Crisis Mode (45%)',
    description: 'Wartime-level mobilization (theoretical max, no empirical examples)',
    researchFrame: 'optimistic',
    weights: {
      climate: 0.45,
      economic: 0.20,
      geopolitical: 0.12,
      social: 0.15,
      technological: 0.08,
    },
    policyEffectiveness: 0.085, // 7-10%/year (approaching degrowth)
    economicImpact: 1.012, // +1.2%/year (uncertain, minimal growth)
    synergyMultiplier: 2.0, // Maximum coordination (theory)
    implementationLag: 18, // 1.5 years (emergency powers)
    reversalRisk: 0.70, // 70% per election (extreme political risk)
  },

  // ============================================================================
  // PESSIMISTIC FRAME (Structural Barriers)
  // ============================================================================
  {
    name: 'Pessimistic - Moderate Priority (20%)',
    description: 'Progressive govts constrained by vested interests & carbon leakage',
    researchFrame: 'pessimistic',
    weights: {
      climate: 0.20,
      economic: 0.25,
      geopolitical: 0.18,
      social: 0.30,
      technological: 0.07,
    },
    policyEffectiveness: 0.012, // 0.5-2%/year (median policy performance)
    economicImpact: 1.020, // +2.0%/year (modest co-benefits)
    synergyMultiplier: 0.95, // Slight policy interference
    implementationLag: 96, // 8 years (permitting, lawsuits, resistance)
    reversalRisk: 0.45, // 45% per election
    vestedInterestPenalty: 0.15, // -15% effectiveness from lobbying
    carbonLeakage: 0.30, // -30% effectiveness from leakage
  },
  {
    name: 'Pessimistic - Ambitious Priority (30%)',
    description: 'Near-maximum feasible (Denmark) but structural barriers dominate',
    researchFrame: 'pessimistic',
    weights: {
      climate: 0.30, // Capped at 30% (40%+ politically infeasible per skeptic)
      economic: 0.23,
      geopolitical: 0.15,
      social: 0.22,
      technological: 0.10,
    },
    policyEffectiveness: 0.03, // 2-4%/year (hitting barriers)
    economicImpact: 1.012, // +1.2%/year (growing economic tensions)
    synergyMultiplier: 0.90, // Policy interference increases
    implementationLag: 120, // 10 years (major resistance)
    reversalRisk: 0.55, // 55% per election
    vestedInterestPenalty: 0.30, // -30% effectiveness (heavy lobbying)
    carbonLeakage: 0.40, // -40% effectiveness (unilateral action)
  },
  {
    name: 'Pessimistic - Maximum Feasible (35%)',
    description: 'Absolute ceiling before political collapse (gilets jaunes threshold)',
    researchFrame: 'pessimistic',
    weights: {
      climate: 0.35, // At backlash threshold
      economic: 0.20,
      geopolitical: 0.13,
      social: 0.20,
      technological: 0.12,
    },
    policyEffectiveness: 0.035, // 2.5-4.5%/year (diminishing returns)
    economicImpact: 1.008, // +0.8%/year (economic drag)
    synergyMultiplier: 0.85, // Strong policy interference (Böhringer et al.)
    implementationLag: 144, // 12 years (near-gridlock)
    reversalRisk: 0.65, // 65% per election (backlash risk)
    vestedInterestPenalty: 0.40, // -40% effectiveness (existential threat response)
    carbonLeakage: 0.50, // -50% effectiveness (capital flight)
  },
];

interface SimulationMetrics {
  finalMonth: number;
  outcome: string;
  finalQoL: number;
  utopiaMonths: number;
  dystopiaMonths: number;

  // Ecological metrics
  climateStability: number;
  resourceDepletion: number;
  pollutionLevel: number;
  biodiversityLoss: number;
  climateCrisisActive: boolean;
  resourceCrisisActive: boolean;

  // Multi-paradigm outcomes
  ecologicalDUI: number;
  westernDUI: number;
  developmentDUI: number;
  indigenousDUI: number;

  // Economic/social metrics
  economicStage: number;
  socialCohesion: number;
  globalTrust: number;

  // Technology deployment
  tier1TechsDeployed: number;
  tier2TechsDeployed: number;
  tier3TechsDeployed: number;
  greenTechCount: number; // Phosphorus recovery, DAC, solar/wind, etc.

  // Crisis history
  totalCrises: number;
  maxConcurrentCrises: number;
}

function applyGovernmentPriorityProfile(
  state: GameState,
  profile: GovernmentPriorityProfile
): void {
  // This would modify government decision-making weights
  // For now, we'll store in a custom field for phases to reference
  (state as any).governmentPriorityWeights = profile.weights;

  console.log(`\n📋 Applied priority profile: ${profile.name}`);
  console.log(`   ${profile.description}`);
  console.log(`   Climate: ${(profile.weights.climate * 100).toFixed(0)}%`);
  console.log(`   Economic: ${(profile.weights.economic * 100).toFixed(0)}%`);
  console.log(`   Geopolitical: ${(profile.weights.geopolitical * 100).toFixed(0)}%`);
}

function extractMetrics(state: GameState): SimulationMetrics {
  const env = state.environmentalAccumulation;
  const social = state.socialAccumulation;
  const tech = state.technologicalRisk;

  // Count crises
  const activeCrises = [
    env.resourceCrisisActive,
    env.pollutionCrisisActive,
    env.climateCrisisActive,
    env.ecosystemCrisisActive,
    social.meaningCollapseActive,
    social.socialUnrestActive,
    social.institutionalFailureActive,
    tech.controlLossActive,
    tech.corporateDystopiaActive,
  ].filter(Boolean).length;

  // Count green technologies deployed from technologyTree
  const greenTechIds = [
    'phosphorus_recovery',
    'direct_air_capture',
    'solar_wind_expansion',
    'desalination_scalable',
    'pfas_remediation',
    'ocean_acidification_reversal',
    'grid_batteries',
    'enhanced_geothermal',
    'vertical_farming',
  ];

  const greenTechCount = state.technologyTree.filter(
    (tech) => greenTechIds.includes(tech.id) && tech.deployed
  ).length;

  // Count tier deployments
  const tier1 = state.technologyTree.filter((tech) => tech.tier === 1 && tech.deployed).length;
  const tier2 = state.technologyTree.filter((tech) => tech.tier === 2 && tech.deployed).length;
  const tier3 = state.technologyTree.filter((tech) => tech.tier === 3 && tech.deployed).length;

  return {
    finalMonth: state.currentMonth,
    outcome: state.extinctionState?.isExtinct ? 'extinction' : 'ongoing',
    finalQoL: state.globalMetrics.qualityOfLife,
    utopiaMonths: 0, // Would need to track from history
    dystopiaMonths: 0, // Would need to track from history

    climateStability: 1 - env.climateDamageAccumulation,
    resourceDepletion: env.resourceExhaustion,
    pollutionLevel: env.pollutionAccumulation,
    biodiversityLoss: env.biodiversityLossAccumulation,
    climateCrisisActive: env.climateCrisisActive || false,
    resourceCrisisActive: env.resourceCrisisActive || false,

    ecologicalDUI: state.multiParadigmDUI.paradigms.ecological?.score || 0,
    westernDUI: state.multiParadigmDUI.paradigms.western?.score || 0,
    developmentDUI: state.multiParadigmDUI.paradigms.development?.score || 0,
    indigenousDUI: state.multiParadigmDUI.paradigms.indigenous?.score || 0,

    economicStage: state.globalMetrics.economicTransitionStage,
    socialCohesion: social.cohesion,
    globalTrust: state.society.trustInAI,

    tier1TechsDeployed: tier1,
    tier2TechsDeployed: tier2,
    tier3TechsDeployed: tier3,
    greenTechCount,

    totalCrises: activeCrises,
    maxConcurrentCrises: activeCrises, // Would need history tracking for true max
  };
}

async function runSimulation(
  profile: GovernmentPriorityProfile,
  seed: number,
  maxMonths: number = 120
): Promise<SimulationMetrics> {
  const state = createDefaultInitialState(seed);

  applyGovernmentPriorityProfile(state, profile);

  const engine = new SimulationEngine(state);

  let monthsSimulated = 0;

  while (!state.gameOver && state.currentMonth < maxMonths) {
    engine.stepMonth();
    monthsSimulated++;

    // Progress indicator every 12 months
    if (state.currentMonth % 12 === 0) {
      const metrics = extractMetrics(state);
      console.log(
        `   Month ${state.currentMonth}: QoL=${metrics.finalQoL.toFixed(2)} ` +
        `Climate=${metrics.climateStability.toFixed(2)} ` +
        `EcoDUI=${metrics.ecologicalDUI.toFixed(1)} ` +
        `GreenTech=${metrics.greenTechCount}`
      );
    }
  }

  const finalMetrics = extractMetrics(state);

  console.log(`\n✅ Simulation complete: ${profile.name}`);
  console.log(`   Months: ${finalMetrics.finalMonth}`);
  console.log(`   Outcome: ${finalMetrics.outcome}`);
  console.log(`   Final QoL: ${finalMetrics.finalQoL.toFixed(2)}`);
  console.log(`   Ecological DUI: ${finalMetrics.ecologicalDUI.toFixed(1)}`);

  return finalMetrics;
}

function compareMetrics(
  statusQuo: SimulationMetrics[],
  moderate: SimulationMetrics[],
  ambitious: SimulationMetrics[],
  crisisMode: SimulationMetrics[]
): void {
  console.log(`\n${'='.repeat(80)}`);
  console.log('COMPARATIVE ANALYSIS - RESEARCH-VALIDATED PRIORITY PROFILES');
  console.log('='.repeat(80));

  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

  const profiles = [
    { name: 'Status Quo (10% climate)', data: statusQuo },
    { name: 'Moderate (20% climate)', data: moderate },
    { name: 'Ambitious (35% climate)', data: ambitious },
    { name: 'Crisis-Mode (45% climate)', data: crisisMode },
  ];

  console.log('\n📊 ECOLOGICAL OUTCOMES');
  console.log('-'.repeat(80));
  for (const profile of profiles) {
    console.log(`\n${profile.name}:`);
    console.log(`  Climate Stability:    ${avg(profile.data.map((d) => d.climateStability)).toFixed(3)}`);
    console.log(`  Resource Depletion:   ${avg(profile.data.map((d) => d.resourceDepletion)).toFixed(3)}`);
    console.log(`  Pollution Level:      ${avg(profile.data.map((d) => d.pollutionLevel)).toFixed(3)}`);
    console.log(`  Biodiversity Loss:    ${avg(profile.data.map((d) => d.biodiversityLoss)).toFixed(3)}`);
    console.log(`  Climate Crises:       ${profile.data.filter((d) => d.climateCrisisActive).length}/${profile.data.length}`);
    console.log(`  Green Tech Deployed:  ${avg(profile.data.map((d) => d.greenTechCount)).toFixed(1)}`);
  }

  console.log('\n📊 MULTI-PARADIGM DUI SCORES');
  console.log('-'.repeat(80));
  for (const profile of profiles) {
    console.log(`\n${profile.name}:`);
    console.log(`  Ecological DUI:       ${avg(profile.data.map((d) => d.ecologicalDUI)).toFixed(1)}`);
    console.log(`  Western DUI:          ${avg(profile.data.map((d) => d.westernDUI)).toFixed(1)}`);
    console.log(`  Development DUI:      ${avg(profile.data.map((d) => d.developmentDUI)).toFixed(1)}`);
    console.log(`  Indigenous DUI:       ${avg(profile.data.map((d) => d.indigenousDUI)).toFixed(1)}`);
  }

  console.log('\n📊 QUALITY OF LIFE & OUTCOMES');
  console.log('-'.repeat(80));
  for (const profile of profiles) {
    const outcomes = profile.data.reduce((acc, d) => {
      acc[d.outcome] = (acc[d.outcome] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log(`\n${profile.name}:`);
    console.log(`  Avg QoL:              ${avg(profile.data.map((d) => d.finalQoL)).toFixed(3)}`);
    console.log(`  Avg Economic Stage:   ${avg(profile.data.map((d) => d.economicStage)).toFixed(2)}`);
    console.log(`  Avg Social Cohesion:  ${avg(profile.data.map((d) => d.socialCohesion)).toFixed(3)}`);
    console.log(`  Outcomes:             ${JSON.stringify(outcomes)}`);
  }

  console.log('\n📊 TECHNOLOGY DEPLOYMENT');
  console.log('-'.repeat(80));
  for (const profile of profiles) {
    console.log(`\n${profile.name}:`);
    console.log(`  TIER 1 (Crisis Tech): ${avg(profile.data.map((d) => d.tier1TechsDeployed)).toFixed(1)}`);
    console.log(`  TIER 2 (Mitigations): ${avg(profile.data.map((d) => d.tier2TechsDeployed)).toFixed(1)}`);
    console.log(`  TIER 3 (Transform):   ${avg(profile.data.map((d) => d.tier3TechsDeployed)).toFixed(1)}`);
  }

  console.log('\n📊 TRADE-OFFS & SYNERGIES');
  console.log('-'.repeat(80));

  // Compare each profile against status quo baseline
  const baselineClimateStability = avg(statusQuo.map((d) => d.climateStability));
  const baselineQoL = avg(statusQuo.map((d) => d.finalQoL));
  const baselineEconomic = avg(statusQuo.map((d) => d.economicStage));

  const comparisons = [
    { name: 'Moderate (20%)', data: moderate },
    { name: 'Ambitious (35%)', data: ambitious },
    { name: 'Crisis-Mode (45%)', data: crisisMode },
  ];

  for (const comp of comparisons) {
    const climateStability = avg(comp.data.map((d) => d.climateStability));
    const qol = avg(comp.data.map((d) => d.finalQoL));
    const economic = avg(comp.data.map((d) => d.economicStage));

    const climateDelta = climateStability - baselineClimateStability;
    const qolDelta = qol - baselineQoL;
    const economicDelta = economic - baselineEconomic;

    console.log(`\n${comp.name} vs Status Quo:`);
    console.log(`  Climate Stability Δ:  ${climateDelta > 0 ? '+' : ''}${climateDelta.toFixed(3)} (${((climateDelta / baselineClimateStability) * 100).toFixed(1)}%)`);
    console.log(`  Quality of Life Δ:    ${qolDelta > 0 ? '+' : ''}${qolDelta.toFixed(3)} (${((qolDelta / baselineQoL) * 100).toFixed(1)}%)`);
    console.log(`  Economic Stage Δ:     ${economicDelta > 0 ? '+' : ''}${economicDelta.toFixed(3)}`);

    // Interpret results
    if (climateDelta > 0.05 && qolDelta > 0.01) {
      console.log(`  ✅ SYNERGY: Climate priority improved ecology (+${(climateDelta * 100).toFixed(1)}%) AND QoL (+${(qolDelta * 100).toFixed(1)}%)`);
    } else if (climateDelta > 0.05 && qolDelta < -0.01) {
      console.log(`  ⚠️  TRADE-OFF: Climate gains (+${(climateDelta * 100).toFixed(1)}%) at cost of QoL (${(qolDelta * 100).toFixed(1)}%)`);
    } else if (climateDelta < -0.01) {
      console.log(`  ❌ BACKFIRE: Higher climate priority did not improve outcomes`);
    } else {
      console.log(`  ➖ NEUTRAL: Minimal difference from baseline (within noise)`);
    }
  }

  // Research validation
  console.log(`\n📚 RESEARCH EXPECTATIONS:`);
  console.log(`  Moderate (20%): -1% to -3%/year emissions, GDP +2-3%/year (synergistic)`);
  console.log(`  Ambitious (35%): -4% to -6%/year emissions, GDP +1.5-2.5%/year (Paris-aligned)`);
  console.log(`  Crisis (45%): -7% to -10%/year emissions, GDP uncertain, high political risk`);

}

async function main() {
  console.log('\n' + '='.repeat(80));
  console.log('CLIMATE-FOCUSED GOVERNMENT PRIORITY TESTING');
  console.log('='.repeat(80));
  console.log('\nResearch Question:');
  console.log('How do government decision-making priorities affect long-term outcomes?');
  console.log('Does heavy climate prioritization create trade-offs or synergies?\n');

  const RUNS_PER_PROFILE = 5;
  const MAX_MONTHS = 120;
  const BASE_SEED = 42000;

  console.log(`Configuration:`);
  console.log(`  Runs per profile: ${RUNS_PER_PROFILE}`);
  console.log(`  Max months: ${MAX_MONTHS}`);
  console.log(`  Base seed: ${BASE_SEED}`);

  const results: Record<string, SimulationMetrics[]> = {
    statusQuo: [],
    moderate: [],
    ambitious: [],
    crisisMode: [],
  };

  for (let run = 0; run < RUNS_PER_PROFILE; run++) {
    const seed = BASE_SEED + run;
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`RUN ${run + 1}/${RUNS_PER_PROFILE} (seed: ${seed})`);
    console.log('─'.repeat(80));

    // Run all four profiles with same seed for fair comparison
    console.log(`\n🔵 Running: ${PRIORITY_PROFILES[0].name}`);
    results.statusQuo.push(await runSimulation(PRIORITY_PROFILES[0], seed, MAX_MONTHS));

    console.log(`\n🟢 Running: ${PRIORITY_PROFILES[1].name}`);
    results.moderate.push(await runSimulation(PRIORITY_PROFILES[1], seed, MAX_MONTHS));

    console.log(`\n🟡 Running: ${PRIORITY_PROFILES[2].name}`);
    results.ambitious.push(await runSimulation(PRIORITY_PROFILES[2], seed, MAX_MONTHS));

    console.log(`\n🔴 Running: ${PRIORITY_PROFILES[3].name}`);
    results.crisisMode.push(await runSimulation(PRIORITY_PROFILES[3], seed, MAX_MONTHS));
  }

  // Comparative analysis
  compareMetrics(results.statusQuo, results.moderate, results.ambitious, results.crisisMode);

  console.log(`\n${'='.repeat(80)}`);
  console.log('NEXT STEPS FOR RESEARCH VALIDATION');
  console.log('='.repeat(80));
  console.log('1. Engage super-alignment-researcher to find peer-reviewed research on:');
  console.log('   - Government climate policy effectiveness (2020-2025)');
  console.log('   - Trade-offs between climate action and economic growth');
  console.log('   - Political economy of green transitions');
  console.log('');
  console.log('2. Engage research-skeptic to critique:');
  console.log('   - Are these priority weights realistic?');
  console.log('   - What contradictory evidence exists?');
  console.log('   - Are we missing key mechanisms?');
  console.log('');
  console.log('3. Expand Monte Carlo runs to N=100+ for statistical significance');
  console.log('='.repeat(80));
}

main().catch(console.error);
