/**
 * Government-Assisted Relocation Program (Oct 20, 2025)
 *
 * Models government programs that enable migration for populations trapped by poverty.
 * Based on FEMA buyouts, North Dakota Devils Lake, China ecological migration.
 *
 * Research backing:
 * - FEMA: 55,000 properties bought out (1993-2025), $4B total, $200K-$450K/household
 * - North Dakota: 600+ homes relocated, $1.5B total, $750K/person effective cost
 * - China: 10M+ people relocated (1983-2025), $4,900/household average
 *
 * Key constraint: Political will is PRIMARY bottleneck (not funding)
 * Coverage: <1-5% annually in practice (despite capacity for more)
 *
 * @see research/government_relocation_programs_20251020.md
 */

import { GameState } from '@/types/game';

/**
 * Update government relocation program each month
 * Called from updateRefugeeCrises()
 */
export function updateGovernmentRelocation(state: GameState): void {
  const system = state.refugeeCrisisSystem;
  const program = system.governmentRelocation;
  if (!program || !program.enabled) return;

  const totalPopulation = state.humanPopulationSystem.population * 1000; // Millions

  // Reset monthly counters
  program.monthlyRelocated = 0;
  program.eligiblePopulation = 0;

  // === 1. CALCULATE ELIGIBLE POPULATION ===
  // Eligible = middle-income tier in stressed regions (need assistance but not trapped)
  const trapped = system.trappedPopulations;
  if (!trapped) return;

  const fw = state.freshwaterSystem;
  const env = state.environmentalAccumulation;

  // Water-stressed middle class
  if (fw && fw.waterStress > 0.5) {
    const stressedPopulation = totalPopulation * fw.populationStressed;
    const middleClassStressed = stressedPopulation * trapped.wealthDistribution.needAssistance;
    program.eligiblePopulation += middleClassStressed;
  }

  // Climate-affected middle class
  if (env.climateStability < 0.6) {
    const climateAffected = totalPopulation * (1 - env.climateStability) * 0.3;
    const middleClassAffected = climateAffected * trapped.wealthDistribution.needAssistance;
    program.eligiblePopulation += middleClassAffected * 0.5; // 50% overlap with water stress, avoid double-counting
  }

  if (program.eligiblePopulation === 0) return;

  // === 2. UPDATE POLITICAL WILL ===
  updatePoliticalWill(state);

  // === 3. CALCULATE BUDGET-CONSTRAINED COVERAGE ===
  const effectivePoliticalWill = Math.max(0.1, Math.min(1.0,
    program.politicalWill +
    program.politicalWillModifiers.recentDisaster +
    program.politicalWillModifiers.economicCrisis +
    program.politicalWillModifiers.electionYear +
    program.politicalWillModifiers.publicSupport
  ));

  // Effective monthly budget (reduced by political will)
  const effectiveBudget = program.monthlyBudget * effectivePoliticalWill;

  // Calculate weighted average cost based on population mix
  // Middle class is 50% of population, but varies in income level
  // Use middle tier cost: $35K average
  const avgCost = program.costPerCapita.middle / 1000; // Convert to millions

  // Maximum people we can relocate this month (budget-constrained)
  const budgetCapacity = effectiveBudget / avgCost;

  // Participation rate: not everyone accepts the offer (60% historical rate)
  const willingToParticipate = program.eligiblePopulation * program.participationRate;

  // Actual relocations = min(budget capacity, willing participants)
  const relocated = Math.min(budgetCapacity, willingToParticipate);

  program.monthlyRelocated = relocated;
  program.totalRelocated += relocated;
  program.cumulativeSpending += relocated * avgCost;

  // === 4. CALCULATE ANNUAL COVERAGE RATE ===
  // Coverage rate = monthly relocated * 12 / eligible population
  program.coverageRate = (relocated * 12) / Math.max(1, program.eligiblePopulation);

  // === 5. SOCIAL IMPACTS ===
  if (relocated > 0) {
    // Success generates trust (research: FEMA 90.7% success rate)
    const successfulRelocations = relocated * program.successRate;
    const trustIncrease = (successfulRelocations / totalPopulation) * 0.02; // 0.02 per 1% of population
    program.trustBonus = trustIncrease;
    state.society.trust = Math.min(1.0, (state.society.trust ?? 0.5) + trustIncrease);

    // Inadequate coverage generates resentment
    const unmetNeed = program.eligiblePopulation - relocated;
    if (unmetNeed > relocated * 2) { // If unmet need > 2x what we provided
      const resentment = (unmetNeed / totalPopulation) * 0.01;
      program.resentmentPenalty = resentment;
      state.society.trust = Math.max(0, state.society.trust - resentment * 0.5);
    }
  }

  // === 6. REDUCE TRAPPED POPULATIONS ===
  // Government assistance enables migration for some trapped populations
  // Primarily helps the "ambivalent" and some "precarious" categories
  if (trapped.totalTrapped > 0 && relocated > 0) {
    // 30% of relocations come from "would-be-trapped" population
    const reducedTrapping = relocated * 0.30;

    // Proportionally reduce trapped populations by cause
    if (trapped.trappedByWater > 0) {
      const waterFraction = trapped.trappedByWater / trapped.totalTrapped;
      trapped.trappedByWater = Math.max(0, trapped.trappedByWater - (reducedTrapping * waterFraction));
    }
    if (trapped.trappedByClimate > 0) {
      const climateFraction = trapped.trappedByClimate / trapped.totalTrapped;
      trapped.trappedByClimate = Math.max(0, trapped.trappedByClimate - (reducedTrapping * climateFraction));
    }
  }

  // === 7. LOGGING ===
  if (relocated > 1) { // At least 1 million relocated
    console.log(`🏘️ GOVERNMENT RELOCATION PROGRAM:`);
    console.log(`   Eligible: ${program.eligiblePopulation.toFixed(1)}M people`);
    console.log(`   Budget: $${effectiveBudget.toFixed(2)}B/month (political will: ${(effectivePoliticalWill * 100).toFixed(0)}%)`);
    console.log(`   Relocated: ${relocated.toFixed(2)}M people this month`);
    console.log(`   Coverage: ${(program.coverageRate * 100).toFixed(1)}% annually`);
    console.log(`   Cumulative: ${program.totalRelocated.toFixed(1)}M people, $${program.cumulativeSpending.toFixed(1)}B spent`);
    if (program.trustBonus > 0) {
      console.log(`   ✅ Trust bonus: +${(program.trustBonus * 100).toFixed(2)}%`);
    }
    if (program.resentmentPenalty > 0) {
      console.log(`   ⚠️ Unmet need resentment: -${(program.resentmentPenalty * 100).toFixed(2)}%`);
    }
  }
}

/**
 * Update political will modifiers based on current state
 */
function updatePoliticalWill(state: GameState): void {
  const program = state.refugeeCrisisSystem.governmentRelocation;
  if (!program) return;

  const modifiers = program.politicalWillModifiers;

  // === RECENT DISASTER BONUS ===
  // +0.3 for 12-24 months after major disaster
  const fw = state.freshwaterSystem;
  const hasRecentDisaster =
    (fw?.dayZeroDrought?.active) ||
    (state.environmentalAccumulation.climateCrisisActive && state.environmentalAccumulation.climateStability < 0.4);

  if (hasRecentDisaster) {
    modifiers.recentDisaster = Math.min(0.3, modifiers.recentDisaster + 0.05);
  } else {
    modifiers.recentDisaster = Math.max(0, modifiers.recentDisaster - 0.02); // Decay over time
  }

  // === ECONOMIC CRISIS PENALTY ===
  // -0.4 during recession
  const economicStage = state.globalMetrics.economicTransitionStage;
  const inRecession = economicStage < 2.0; // Economic crisis check
  modifiers.economicCrisis = inRecession ? -0.4 : 0;

  // === ELECTION YEAR PENALTY ===
  // -0.2 during election year (every 4 years, assume synchronized for simplicity)
  const yearsSince2025 = Math.floor(state.currentMonth / 12);
  const isElectionYear = (yearsSince2025 % 4 === 0) || (yearsSince2025 % 4 === 3); // Election year + campaign year
  modifiers.electionYear = isElectionYear ? -0.2 : 0;

  // === PUBLIC SUPPORT MODIFIER ===
  // -0.3 to +0.3 based on refugee tension
  const refugeeTension = state.refugeeCrisisSystem.globalRefugeeTension;
  if (refugeeTension > 0.7) {
    modifiers.publicSupport = -0.3; // High tension = opposition to relocation
  } else if (refugeeTension < 0.3) {
    modifiers.publicSupport = 0.1; // Low tension = moderate support
  } else {
    modifiers.publicSupport = 0; // Neutral
  }
}
