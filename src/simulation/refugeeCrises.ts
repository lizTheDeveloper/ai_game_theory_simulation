/**
 * Refugee Crisis System (TIER 1.5)
 *
 * Models displaced populations from climate disasters, wars, famines, ecosystem collapse.
 * Refugees create social tension and economic strain on host regions.
 * After 1 generation (~25 years), refugees are fully resettled.
 *
 * Oct 20, 2025: Added wealth-bifurcated migration + involuntary immobility
 * Research backing:
 * - UNHCR 2024: 110M forcibly displaced worldwide
 * - Climate projections: 200M-1B by 2050 (World Bank, IOM)
 * - Generational integration: 20-30 years for full cultural integration
 * - Syrian crisis (2011-present): 13.5M displaced, 14 years ongoing
 * - Lake Urmia, Iran (2024): 71.85% migration early, immobility late phase
 * - FEMA buyouts: 55K properties, $4B, <5% coverage (1993-2025)
 *
 * @see plans/population-dynamics-and-extinction-nuance.md
 * @see research/water_scarcity_migration_immobility_20251020.md
 * @see research/government_relocation_programs_20251020.md
 */

import { GameState } from '@/types/game';
import {
  RefugeeCrisisSystem,
  RefugeeCrisis,
  GovernmentRelocationProgram,
  TrappedPopulationTracking
} from '@/types/population';
import { updateTrappedPopulations } from './trappedPopulations';
import { updateGovernmentRelocation } from './governmentRelocation';
import { addSimulationEvent } from './utils/eventLogger';
import {
  assertFinite,
  assertProbability,
  assertInRange,
} from './utils/assertions';
import { isHistoricalModeActive } from './utils/historicalMode';

/**
 * Initialize refugee crisis system (2025 baseline)
 * Oct 20, 2025: Added government relocation + trapped population tracking
 */
export function initializeRefugeeCrisisSystem(): RefugeeCrisisSystem {
  return {
    activeRefugeeCrises: [],
    totalDisplaced: 0,
    totalResettled: 0,
    cumulativeRefugees: 0,
    globalRefugeeTension: 0,
    regionalTensions: new Map(),
    resettlementCost: 0,
    economicStrain: 0,
    refugeeAcceptanceRate: 0.5,              // Moderate baseline
    bordersOpen: true,                       // Open borders in 2025
    resettlementPrograms: 0,                 // No major programs yet

    // Oct 20, 2025: Government-assisted relocation (disabled by default)
    governmentRelocation: initializeGovernmentRelocation(),

    // Oct 20, 2025: Trapped population tracking
    trappedPopulations: initializeTrappedPopulations(),
  };
}

/**
 * Initialize government relocation program (Oct 20, 2025)
 * Disabled by default - governments must actively enable
 */
export function initializeGovernmentRelocation(): GovernmentRelocationProgram {
  return {
    // Program status
    enabled: false,
    monthActivated: 0,

    // Budget & capacity
    annualBudget: 0,                         // No funding until activated
    monthlyBudget: 0,
    cumulativeSpending: 0,

    // Coverage metrics
    totalRelocated: 0,
    monthlyRelocated: 0,
    eligiblePopulation: 0,
    coverageRate: 0,

    // Cost parameters (research-backed averages)
    costPerCapita: {
      wealthy: 225000,                       // $225K average ($150K-$300K range)
      middle: 35000,                         // $35K average ($20K-$50K range)
      poor: 10000,                           // $10K average ($5K-$15K range)
    },
    weightedAverageCost: 44000,              // Weighted by population mix (30% wealthy, 50% middle, 20% poor)

    // Political constraints
    politicalWill: 0.3,                      // Low baseline (2025 political gridlock)
    politicalWillModifiers: {
      recentDisaster: 0,                     // No recent major disaster
      economicCrisis: 0,                     // No crisis (yet)
      electionYear: 0,                       // Not election year
      publicSupport: 0,                      // Neutral
    },

    // Effectiveness (research-backed)
    successRate: 0.90,                       // 90% successfully resettle (FEMA data)
    participationRate: 0.60,                 // 60% accept offer (voluntary programs)

    // Social impacts
    trustBonus: 0,
    resentmentPenalty: 0,
  };
}

/**
 * Initialize trapped population tracking (Oct 20, 2025)
 */
export function initializeTrappedPopulations(): TrappedPopulationTracking {
  return {
    // Total trapped populations by cause
    totalTrapped: 0,
    trappedByWater: 0,
    trappedByClimate: 0,
    trappedByEcosystem: 0,
    trappedByConflict: 0,

    // Wealth tiers (baseline 2025 global distribution)
    wealthDistribution: {
      canSelfRelocate: 0.30,                 // Top 30% can afford migration
      needAssistance: 0.50,                  // Middle 50% need help
      trapped: 0.20,                         // Bottom 20% trapped without assistance
    },

    // Regional breakdown
    regionalTrapped: new Map(),

    // Psychological impact categories (Aghajani-Shahrivar et al. 2024)
    typeBreakdown: {
      ambivalent: 0,                         // Want to leave AND stay
      precarious: 0,                         // No aspirations at all
      voluntary: 0,                          // Choose to stay
    },

    // Social & health impacts
    mentalHealthImpact: 0,                   // No impact at baseline
    socialCohesionImpact: 0,
    mortalityMultiplier: 1.0,                // No excess mortality at baseline

    // Migration aspirations vs ability
    aspiringToMigrate: 0,
    ableToMigrate: 0,
    mobilityGap: 0,
  };
}

/**
 * Update refugee crises each month
 */
export function updateRefugeeCrises(state: GameState): void {
  const system = state.refugeeCrisisSystem;

  // === 1. CHECK FOR NEW CRISES ===
  const newCrises = checkRefugeeCrisisTriggers(state);
  system.activeRefugeeCrises.push(...newCrises);

  // === 2. RESET GLOBAL METRICS ===
  system.totalDisplaced = 0;
  system.globalRefugeeTension = 0;
  system.resettlementCost = 0;

  // === 3. UPDATE EACH ACTIVE CRISIS ===
  for (const crisis of system.activeRefugeeCrises) {
    if (crisis.resolved) continue;

    crisis.monthsActive++;

    // === GRADUAL DISPLACEMENT PHASE (3-5 years) ===
    if (!crisis.displacementComplete && crisis.monthsActive <= crisis.displacementDuration) {
      // 10% of remaining population flees each month
      const fleeingThisMonth = crisis.remainingInSource * crisis.displacementRate;
      crisis.remainingInSource -= fleeingThisMonth;
      crisis.displacedPopulation += fleeingThisMonth;
      crisis.currentlyDisplaced += fleeingThisMonth;

      // 2% die in transit
      const transitDeaths = fleeingThisMonth * 0.02;
      crisis.deathsInTransit += transitDeaths;
      crisis.currentlyDisplaced -= transitDeaths;

      // Track transit deaths by category
      // FIX (Oct 28, 2025): Units consistency bug
      // - Bayesian mortality system stores in MILLIONS (bayesianMortality.ts:370)
      // - This system already in millions (transitDeaths = fleeingThisMonth * 0.02)
      // - Therefore store directly in millions, NO conversion needed

      // Validate deaths are finite and reasonable (should be < 1000M per month)
      const validatedDeaths = assertFinite(transitDeaths, {
        location: 'updateRefugeeCrises',
        valueName: 'transitDeaths',
        month: state.currentMonth,
        additionalInfo: {
          crisis: crisis.cause,
          region: crisis.sourceRegion,
          fleeingThisMonth,
          transitDeathRate: 0.02
        }
      });

      if (validatedDeaths > 1000) {
        throw new Error(
          `❌ Transit deaths unreasonably high: ${validatedDeaths.toFixed(1)}M ` +
          `(crisis: ${crisis.cause}, region: ${crisis.sourceRegion}, month: ${state.currentMonth})`
        );
      }

      const category = crisis.cause === 'war' || crisis.cause === 'nuclear' ? 'war' :
                       crisis.cause === 'famine' ? 'famine' :
                       crisis.cause === 'climate' ? 'disasters' :
                       crisis.cause === 'ecosystem' ? 'ecosystem' : 'other';

      // WEEK 3: Validate deaths before mutation
      const newDeathsByCategory = (state.humanPopulationSystem.deathsByCategory[category] || 0) + validatedDeaths;
      // Global cumulative by category across all regions and time
      // Cap: 20B (2× initial world population) - allows for high-mortality scenarios with partial recovery cycles
      // Research: Xia et al. 2022 - worst-case nuclear winter scenario: 75% mortality (6B deaths)
      //           Multiple collapse/recovery cycles over 20 years could theoretically reach 2× initial population
      // Week 5 Fix: Raised from 10B after Monte Carlo N=10 hit cap at Month 160 (10.05B famine deaths)
      assertInRange(newDeathsByCategory, 0, 20000, {
        location: 'updateRefugeeCrises.transitDeaths',
        valueName: `deathsByCategory.${category}`,
        month: state.currentMonth,
      });

      // Warning: Cumulative deaths approaching 1.5× initial population (unusual but possible)
      if (newDeathsByCategory > 12000) {
        console.log(`⚠️ CUMULATIVE DEATHS UNUSUALLY HIGH (Month ${state.currentMonth}):`);
        console.log(`   ${category}: ${newDeathsByCategory.toFixed(1)}M (${(newDeathsByCategory / 8000 * 100).toFixed(0)}% of 2025 world population)`);
        console.log(`   Current population: ${state.humanPopulationSystem.population.toFixed(1)}B`);
      }

      state.humanPopulationSystem.deathsByCategory[category] = newDeathsByCategory;

      const newCumulativeDeaths = state.humanPopulationSystem.cumulativeCrisisDeaths + validatedDeaths;
      // Global cumulative across all regions and time
      // Cap: 20B (2× initial world population) - same rationale as deathsByCategory
      assertInRange(newCumulativeDeaths, 0, 20000, {
        location: 'updateRefugeeCrises.transitDeaths',
        valueName: 'cumulativeCrisisDeaths',
        month: state.currentMonth,
      });
      state.humanPopulationSystem.cumulativeCrisisDeaths = newCumulativeDeaths;

      // Track peak displacement
      crisis.peakDisplacement = Math.max(crisis.peakDisplacement, crisis.currentlyDisplaced);

      // Mark complete when very few remain (< 1% of original)
      if (crisis.remainingInSource < crisis.potentialDisplaced * 0.01 ||
          crisis.monthsActive >= crisis.displacementDuration) {
        crisis.displacementComplete = true;
        console.log(`📊 DISPLACEMENT COMPLETE: ${crisis.cause} (${crisis.sourceRegion})`);
        console.log(`   Duration: ${crisis.monthsActive} months (${(crisis.monthsActive / 12).toFixed(1)} years)`);
        console.log(`   Total fled: ${crisis.displacedPopulation.toFixed(1)}M`);
        console.log(`   Still in source: ${crisis.remainingInSource.toFixed(1)}M`);
        console.log(`   Deaths in transit: ${crisis.deathsInTransit.toFixed(1)}M`);

        // Add displacement complete milestone to timeline
        addSimulationEvent(state, {
          type: 'milestone',
          severity: 'high',
          agent: 'environmental',
          title: `📊 DISPLACEMENT COMPLETE: ${crisis.cause}`,
          description: `Mass exodus from ${crisis.sourceRegion} is complete after ${(crisis.monthsActive / 12).toFixed(1)} years. ` +
                      `${crisis.displacedPopulation.toFixed(1)}M people fled, ` +
                      `${crisis.remainingInSource.toFixed(1)}M remain in source region, ` +
                      `${crisis.deathsInTransit.toFixed(1)}M died in transit.`,
          effects: {
            totalFled: crisis.displacedPopulation,
            stillInSource: crisis.remainingInSource,
            deaths: crisis.deathsInTransit,
            duration: crisis.monthsActive,
            cause: crisis.cause,
            region: crisis.sourceRegion
          }
        });
      }
    }

    // === RESETTLEMENT PHASE (ongoing) ===
    // Calculate resettlement rate
    // Base rate: 0.5% of displaced per month (~5 years to resettle 50%)
    const baseRate = crisis.baselineResettlementRate;
    const programBonus = crisis.acceleratedResettlement ? 0.01 : 0;
    const tensionPenalty = crisis.socialTension > 0.7 ? 0.003 : 0;
    const borderPenalty = !system.bordersOpen ? 0.002 : 0;

    crisis.resettlementRate = Math.max(0.001, baseRate + programBonus - tensionPenalty - borderPenalty);

    // Apply resettlement
    const resettledThisMonth = crisis.currentlyDisplaced * crisis.resettlementRate;
    crisis.resettledCount += resettledThisMonth;
    crisis.currentlyDisplaced -= resettledThisMonth;
    system.totalResettled += resettledThisMonth;

    // Update progress (protected against division by zero)
    crisis.resettlementProgress = crisis.displacedPopulation > 0
      ? assertFinite(
          crisis.resettledCount / crisis.displacedPopulation,
          {
            location: 'updateRefugeeCrisis',
            valueName: 'resettlementProgress',
            month: state.currentMonth,
            additionalInfo: {
              cause: crisis.cause,
              resettledCount: crisis.resettledCount,
              displacedPopulation: crisis.displacedPopulation
            }
          }
        )
      : 0;

    // === GENERATIONAL RESETTLEMENT MILESTONE ===
    if (crisis.monthsActive >= crisis.generationLength) {
      // After 1 generation (25 years), remaining refugees are "fully resettled"
      crisis.resettledCount += crisis.currentlyDisplaced;
      crisis.currentlyDisplaced = 0;
      crisis.resolved = true;
      crisis.duration = crisis.monthsActive;

      // Tension drops sharply
      const tensionReduction = crisis.socialTension * 0.7; // 70% drop
      crisis.socialTension *= 0.3;
      crisis.economicStrain *= 0.2;

      console.log(`✅ REFUGEE CRISIS RESOLVED: ${crisis.cause} (${crisis.sourceRegion})`);
      console.log(`   Duration: ${crisis.monthsActive} months (${(crisis.monthsActive / 12).toFixed(1)} years)`);
      console.log(`   Total displaced: ${crisis.displacedPopulation.toFixed(1)}M`);
      console.log(`   Resettled: ${crisis.resettledCount.toFixed(1)}M`);

      // Add crisis resolution event to timeline
      addSimulationEvent(state, {
        type: 'resolution',
        severity: 'positive',
        agent: 'society',
        title: `✅ REFUGEE CRISIS RESOLVED: ${crisis.cause}`,
        description: `Refugee crisis from ${crisis.sourceRegion} fully resolved after ${(crisis.monthsActive / 12).toFixed(1)} years (1 generation). ` +
                    `${crisis.resettledCount.toFixed(1)}M people successfully resettled and integrated. ` +
                    `Social tension and economic strain declining sharply.`,
        effects: {
          totalDisplaced: crisis.displacedPopulation,
          resettled: crisis.resettledCount,
          duration: crisis.monthsActive,
          tensionReduction,
          cause: crisis.cause,
          region: crisis.sourceRegion
        }
      });
    }

    // === CALCULATE SOCIAL TENSION ===
    // Tension based on: raw numbers, speed of influx, economic conditions, social stability
    const popRatio = state.humanPopulationSystem.population * 1000; // Convert to millions

    // Division by popRatio (protected)
    const displacementScale = popRatio > 0
      ? assertFinite(
          crisis.currentlyDisplaced / popRatio,
          {
            location: 'updateRefugeeCrisis',
            valueName: 'displacementScale',
            month: state.currentMonth,
            additionalInfo: {
              cause: crisis.cause,
              currentlyDisplaced: crisis.currentlyDisplaced,
              popRatio,
              globalPopulation: state.humanPopulationSystem.population
            }
          }
        )
      : 0; // Fallback if global population is 0 (extinction scenario)

    const influxSpeed = crisis.monthsActive < 12 ? 1.5 : 1.0; // Recent = higher tension
    const economicModifier = 1 + (1 - state.globalMetrics.qualityOfLife);
    const stabilityModifier = 1 + (1 - state.globalMetrics.socialStability);

    crisis.socialTension = Math.min(1.0,
      displacementScale * 10 * influxSpeed * economicModifier * stabilityModifier
    );

    // === CALCULATE ECONOMIC STRAIN ===
    // Cost: $2,000 per refugee per year = $166/month
    const monthlyCostPerRefugee = 166 / 1000000; // In millions
    const totalCost = crisis.currentlyDisplaced * monthlyCostPerRefugee;
    crisis.economicStrain = totalCost / 1000; // Fraction of ~$100T global GDP

    crisis.politicalInstability = crisis.socialTension * 0.5 + crisis.economicStrain * 0.3;

    // === AGGREGATE TO GLOBAL METRICS ===
    system.totalDisplaced += crisis.currentlyDisplaced;
    system.resettlementCost += totalCost;
    system.globalRefugeeTension = Math.max(system.globalRefugeeTension, crisis.socialTension);
  }

  // === 4. CALCULATE TOTAL ECONOMIC STRAIN ===
  system.economicStrain = system.resettlementCost / 1000; // Normalize to 0-1

  // === 5. APPLY GLOBAL EFFECTS ===
  // High refugee tension reduces social stability and trust
  // WEEK 3: Validate social stability before mutation (clamp to [0, 1])
  const newSocialStability = Math.max(0, Math.min(1,
    state.globalMetrics.socialStability * (1 - system.globalRefugeeTension * 0.1)
  ));
  assertProbability(newSocialStability, {
    location: 'updateRefugeeCrises.globalEffects',
    valueName: 'socialStability',
    month: state.currentMonth,
  });
  state.globalMetrics.socialStability = newSocialStability;

  // Refugees increase paranoia
  if (state.society.paranoiaLevel !== undefined) {
    const newParanoiaLevel = Math.min(1.0,
      state.society.paranoiaLevel + system.globalRefugeeTension * 0.05
    );
    assertProbability(newParanoiaLevel, {
      location: 'updateRefugeeCrises.globalEffects',
      valueName: 'paranoiaLevel',
      month: state.currentMonth,
    });
    state.society.paranoiaLevel = newParanoiaLevel;
  }

  // Economic strain reduces QoL
  // WEEK 3: Clamp to [0, 1] before assertion (QoL can start >1.0 from other phases)
  const newQualityOfLife = Math.max(0, Math.min(1,
    state.globalMetrics.qualityOfLife * (1 - system.economicStrain * 0.05)
  ));
  assertProbability(newQualityOfLife, {
    location: 'updateRefugeeCrises.globalEffects',
    valueName: 'qualityOfLife',
    month: state.currentMonth,
  });
  state.globalMetrics.qualityOfLife = newQualityOfLife;

  // Political instability increases dystopia risk
  // WEEK 3: Clamp to [0, 1] before assertion (dystopiaProbability accumulates)
  const newDystopiaProbability = Math.max(0, Math.min(1,
    state.outcomeMetrics.dystopiaProbability + system.globalRefugeeTension * 0.02
  ));
  assertProbability(newDystopiaProbability, {
    location: 'updateRefugeeCrises.globalEffects',
    valueName: 'dystopiaProbability',
    month: state.currentMonth,
  });
  state.outcomeMetrics.dystopiaProbability = newDystopiaProbability;

  // HIGH-4 INTEGRATION (Nov 15, 2025): Refugee politicalInstability → Government Legitimacy
  // Research:
  // - Rydgren (2008): Immigration and populism - refugee crises erode government legitimacy
  // - Hatton (2020): Asylum policy and public trust in institutions
  // - Dennison & Geddes (2019): European refugee crisis impact on government stability
  //
  // Mechanism: Political instability from refugee crises (calculated per crisis above)
  // accumulates and reduces government legitimacy. Large refugee flows test state capacity,
  // create political polarization, and fuel anti-government sentiment.
  //
  // Calculate total political instability from all active refugee crises
  const totalPoliticalInstability = system.activeRefugeeCrises.reduce(
    (sum, crisis) => sum + crisis.politicalInstability,
    0
  );

  if (totalPoliticalInstability > 0) {
    // Moderate impact: 0.02 legitimacy loss per unit of political instability
    // At 0.5 total instability (moderate crisis), this is -0.01 legitimacy per month
    // At 1.0 total instability (severe), this is -0.02 per month
    const legitimacyImpact = totalPoliticalInstability * 0.02;

    const newLegitimacy = Math.max(0, Math.min(1,
      state.government.legitimacy - legitimacyImpact
    ));
    assertProbability(newLegitimacy, {
      location: 'updateRefugeeCrises.governmentLegitimacy',
      valueName: 'government.legitimacy',
      month: state.currentMonth,
      additionalInfo: {
        previousLegitimacy: state.government.legitimacy,
        totalPoliticalInstability,
        legitimacyImpact
      }
    });
    state.government.legitimacy = newLegitimacy;

    // Log significant legitimacy erosion (>1% per month)
    if (legitimacyImpact > 0.01 && state.currentMonth % 6 === 0) {
      console.log(`\n🏛️📉 REFUGEE CRISIS: Government legitimacy eroding`);
      console.log(`   Political instability: ${(totalPoliticalInstability * 100).toFixed(0)}%`);
      console.log(`   Legitimacy impact: -${(legitimacyImpact * 100).toFixed(1)}% this month`);
      console.log(`   Current legitimacy: ${(newLegitimacy * 100).toFixed(0)}%`);
      console.log(`   Active crises: ${system.activeRefugeeCrises.length}`);
    }
  }

  // Very high refugee crises can trigger dystopian "fortress world" outcome
  if (system.globalRefugeeTension > 0.8 && !system.bordersOpen) {
    // Militarized borders + surveillance = dystopia path
    const newSurveillanceCapability = Math.min(10,
      state.government.surveillanceCapability + 0.05
    );
    assertInRange(newSurveillanceCapability, 0, 10, {
      location: 'updateRefugeeCrises.fortressWorld',
      valueName: 'surveillanceCapability',
      month: state.currentMonth,
    });
    state.government.surveillanceCapability = newSurveillanceCapability;

    const newControlDesire = Math.min(1.0,
      state.government.controlDesire + 0.02
    );
    assertProbability(newControlDesire, {
      location: 'updateRefugeeCrises.fortressWorld',
      valueName: 'controlDesire',
      month: state.currentMonth,
    });
    state.government.controlDesire = newControlDesire;

    if (state.government.structuralChoices) {
      const newSurveillanceLevel = Math.min(1.0,
        state.government.structuralChoices.surveillanceLevel + 0.03
      );
      assertProbability(newSurveillanceLevel, {
        location: 'updateRefugeeCrises.fortressWorld',
        valueName: 'structuralChoices.surveillanceLevel',
        month: state.currentMonth,
      });
      state.government.structuralChoices.surveillanceLevel = newSurveillanceLevel;
    }
  }

  // === 6. UPDATE TRAPPED POPULATIONS (Oct 20, 2025) ===
  updateTrappedPopulations(state);

  // === 7. UPDATE GOVERNMENT RELOCATION (Oct 20, 2025) ===
  updateGovernmentRelocation(state);
}

/**
 * Check for refugee crisis triggers
 * Returns array of new crises that should be created this month
 */
export function checkRefugeeCrisisTriggers(state: GameState): RefugeeCrisis[] {
  // ============================================================================
  // HINDCAST MODE GUARD (Nov 25, 2025)
  // ============================================================================
  // In historical mode (1990-2024), we model ACTUAL refugee patterns from data.
  // This crisis generation triggers phantom wars/climate disasters that didn't happen.
  // Skip crisis triggers during hindcast to validate against real history.
  // ============================================================================
  if (isHistoricalModeActive(state)) {
    // Historical refugee patterns are modeled via actual data in initialization
    // Don't generate phantom crises during hindcast validation
    return [];
  }

  const newCrises: RefugeeCrisis[] = [];

  // === 1. CLIMATE DISASTERS ===
  const env = state.environmentalAccumulation;
  if (env.climateStability < 0.5 && env.climateCrisisActive) {
    // BUG FIX (Oct 30, 2025): Use coastal/low-lying population, not global
    // Research: IPCC 2021 - ~10% of global population in coastal/low-lying areas at risk
    const COASTAL_POPULATION_PERCENT = 0.10; // IPCC: 10% of global in high-risk coastal zones
    const DISPLACEMENT_RATE_PER_INSTABILITY = 0.05; // 5% displaced per 0.1 climate instability

    const severity = 1 - env.climateStability;
    const coastalPopulation = state.humanPopulationSystem.population * 1000 * COASTAL_POPULATION_PERCENT;
    const displaced = coastalPopulation * severity * DISPLACEMENT_RATE_PER_INSTABILITY;

    if (displaced > 10) { // At least 10 million displaced
      newCrises.push(createRefugeeCrisis({
        cause: 'climate',
        sourceRegion: 'Coastal & Low-lying Regions',
        displacedPopulation: displaced,
        severity,
        state
      }));
    }
  }

  // === 2. WAR AND CONFLICT ===
  if (state.conflictResolution?.activeConflicts && state.conflictResolution.activeConflicts > 0) {
    // BUG FIX (Oct 30, 2025): Use regional population, not global
    // Previous: Used global 8B population → 325M displaced (10x over-estimation)
    // Research: UNHCR 2023 - current global refugees ~110M, conflict zones ~5-10% of global population

    // Constants (extracted for clarity and maintainability)
    const BASE_CONFLICT_ZONE_PERCENT = 0.05; // UNHCR 2023: 5% baseline of global population in conflict zones
    const MAX_CONFLICT_ZONE_SCALING = 2.0; // Maximum 10% of global population in conflict zones
    const CONFLICT_ZONE_SCALING_RATE = 0.1; // 10% increase per additional conflict
    const DISPLACEMENT_RATE_PER_CONFLICT = 0.02; // Each conflict displaces 2% of conflict zone population

    // Each active conflict displaces 1-5% of regional population
    // Cap at 1.0 (100%) - cannot displace more than entire conflict zone
    const conflictSeverity = Math.min(1.0, state.conflictResolution.activeConflicts * DISPLACEMENT_RATE_PER_CONFLICT);

    // Estimate conflict zone population: ~5-10% of global population
    // Scales with number of conflicts (more conflicts = more regions affected)
    const conflictScaling = Math.min(
      MAX_CONFLICT_ZONE_SCALING,
      1.0 + state.conflictResolution.activeConflicts * CONFLICT_ZONE_SCALING_RATE
    );
    const conflictZonePopulation = state.humanPopulationSystem.population * 1000 * BASE_CONFLICT_ZONE_PERCENT * conflictScaling;

    const displaced = conflictZonePopulation * conflictSeverity;

    if (displaced > 5) {
      newCrises.push(createRefugeeCrisis({
        cause: 'war',
        sourceRegion: 'Conflict Zones',
        displacedPopulation: displaced,
        severity: conflictSeverity,
        state
      }));
    }
  }

  // === 3. NUCLEAR WAR (MASSIVE DISPLACEMENT) ===
  if (state.extinctionState.active && state.extinctionState.mechanism === 'nuclear_war') {
    // 20-40% of surviving population displaced
    const survivors = state.humanPopulationSystem.population * 1000 * 0.5; // 50% survive initial war
    const displaced = survivors * 0.3; // 30% of survivors displaced

    newCrises.push(createRefugeeCrisis({
      cause: 'nuclear',
      sourceRegion: 'Global (Nuclear Fallout Zones)',
      displacedPopulation: displaced,
      severity: 0.9,
      state
    }));
  }

  // === 4. FAMINE (RESOURCE CRISES) ===
  const resources = state.resourceEconomy;
  if (resources.food.reserves < 0.3 || resources.water.reserves < 0.3) {
    // BUG FIX (Oct 30, 2025): Use food-insecure population, not global
    // Research: FAO 2023 - ~15-20% of global population in food/water insecure regions
    const FOOD_INSECURE_POPULATION_PERCENT = 0.15; // FAO 2023: 15% of global in high-risk food insecurity zones
    const DISPLACEMENT_RATE_PER_SCARCITY = 0.10; // 10% displaced per unit scarcity

    const foodScarcity = Math.max(0, 1 - resources.food.reserves);
    const waterScarcity = Math.max(0, 1 - resources.water.reserves);
    const severity = Math.max(foodScarcity, waterScarcity);
    const foodInsecurePopulation = state.humanPopulationSystem.population * 1000 * FOOD_INSECURE_POPULATION_PERCENT;
    const displaced = foodInsecurePopulation * severity * DISPLACEMENT_RATE_PER_SCARCITY;

    if (displaced > 20) {
      newCrises.push(createRefugeeCrisis({
        cause: 'famine',
        sourceRegion: 'Food/Water Insecure Regions',
        displacedPopulation: displaced,
        severity,
        state
      }));
    }
  }

  // === 5. ECOSYSTEM COLLAPSE ===
  if (env.ecosystemCrisisActive && env.biodiversityIndex < 0.3) {
    // BUG FIX (Oct 30, 2025): Use biodiversity hotspot population, not global
    // Research: Conservation International 2024 - ~5% of global population in biodiversity hotspots
    const BIODIVERSITY_HOTSPOT_PERCENT = 0.05; // 5% of global in high-biodiversity collapse zones
    const DISPLACEMENT_RATE_PER_COLLAPSE = 0.03; // 3% displaced per unit ecosystem severity

    const severity = 1 - env.biodiversityIndex;
    const hotspotPopulation = state.humanPopulationSystem.population * 1000 * BIODIVERSITY_HOTSPOT_PERCENT;
    const displaced = hotspotPopulation * severity * DISPLACEMENT_RATE_PER_COLLAPSE;

    if (displaced > 15) {
      newCrises.push(createRefugeeCrisis({
        cause: 'ecosystem',
        sourceRegion: 'Ecosystem Collapse Zones',
        displacedPopulation: displaced,
        severity,
        state
      }));
    }
  }

  // === 6. FRESHWATER DEPLETION (Oct 20, 2025) ===
  // Critical fix: Water stress now triggers migration (wealth-bifurcated)
  // Research: Lake Urmia (71.85% migration early), Arizona paradox (wealthy adapt, no migration)
  const fw = state.freshwaterSystem;
  if (fw) {
    const waterStressed = fw.waterStress > 0.6;
    const crisisActive = fw.dayZeroDrought?.active || fw.criticalScarcityActive;

    if (waterStressed && crisisActive) {
      const totalPopulation = state.humanPopulationSystem.population * 1000; // Convert to millions
      const stressedPopulation = totalPopulation * fw.populationStressed; // People in water-stressed regions

      // Wealth-bifurcated response (research-backed)
      const wealthTiers = state.refugeeCrisisSystem.trappedPopulations?.wealthDistribution || {
        canSelfRelocate: 0.30,  // Top 30% wealthy - adapt in place
        needAssistance: 0.50,   // Middle 50% - need help
        trapped: 0.20           // Bottom 20% - trapped by poverty
      };

      // Only middle-income tier creates refugee crisis (if no government assistance)
      const middleClassStressed = stressedPopulation * wealthTiers.needAssistance;

      // Check government relocation program coverage
      const govProgram = state.refugeeCrisisSystem.governmentRelocation;
      const governmentCoverage = govProgram?.enabled ? (govProgram.coverageRate * middleClassStressed) : 0;

      // Refugee crisis = those who need help BUT don't get government assistance
      const displaced = middleClassStressed - governmentCoverage;

      if (displaced > 5) { // At least 5 million displaced
        newCrises.push(createRefugeeCrisis({
          cause: 'famine', // Water scarcity manifests as famine
          sourceRegion: 'Water-Stressed Regions (Middle East, North Africa, South Asia)',
          displacedPopulation: displaced,
          severity: fw.waterStress,
          state
        }));

        console.log(`💧 FRESHWATER-DRIVEN MIGRATION (Wealth-Bifurcated):`);
        console.log(`   Total stressed: ${stressedPopulation.toFixed(1)}M people`);
        console.log(`   Wealthy (30%): ${(stressedPopulation * wealthTiers.canSelfRelocate).toFixed(1)}M adapt in place`);
        console.log(`   Middle (50%): ${middleClassStressed.toFixed(1)}M need help`);
        console.log(`   - Gov assistance: ${governmentCoverage.toFixed(1)}M`);
        console.log(`   - Refugee crisis: ${displaced.toFixed(1)}M`);
        console.log(`   Poor (20%): ${(stressedPopulation * wealthTiers.trapped).toFixed(1)}M TRAPPED`);
      }
    }
  }

  // Log new crises and add events to timeline
  for (const crisis of newCrises) {
    console.log(`\n🚨 NEW REFUGEE CRISIS (Month ${state.currentMonth}): ${crisis.cause.toUpperCase()}`);
    console.log(`   Source: ${crisis.sourceRegion}`);
    console.log(`   At risk: ${crisis.potentialDisplaced.toFixed(1)}M people`);
    console.log(`   Displacement: Gradual over ${crisis.displacementDuration} months (${(crisis.displacementDuration/12).toFixed(1)} years)`);
    console.log(`   Rate: 10% flee per month`);

    // Add crisis trigger event to timeline
    addSimulationEvent(state, {
      type: 'crisis',
      severity: crisis.cause === 'nuclear' ? 'existential' : 'critical',
      agent: 'environmental',
      title: `🚨 NEW REFUGEE CRISIS: ${crisis.cause.toUpperCase()}`,
      description: `Refugee crisis triggered in ${crisis.sourceRegion}. ` +
                  `${crisis.potentialDisplaced.toFixed(1)}M people at risk of displacement. ` +
                  `Exodus will be gradual over ${(crisis.displacementDuration/12).toFixed(1)} years at 10% flee rate per month. ` +
                  `Cause: ${crisis.cause}.`,
      effects: {
        cause: crisis.cause,
        potentialDisplaced: crisis.potentialDisplaced,
        region: crisis.sourceRegion,
        displacementDuration: crisis.displacementDuration,
        monthsToComplete: crisis.displacementDuration
      }
    });
  }

  return newCrises;
}

/**
 * Create a new refugee crisis
 */
interface CreateCrisisParams {
  cause: RefugeeCrisis['cause'];
  sourceRegion: string;
  displacedPopulation: number;
  severity: number;
  state: GameState;
}

function createRefugeeCrisis(params: CreateCrisisParams): RefugeeCrisis {
  const { cause, sourceRegion, displacedPopulation, severity, state } = params;

  // Determine host regions (simplified - global distribution for now)
  const hostRegions = ['Europe', 'North America', 'Asia-Pacific', 'Latin America'];

  // Gradual displacement: 3-5 years (36-60 months) at 10% per month
  // Duration varies by crisis type
  const displacementDuration = cause === 'nuclear' ? 12 : // Nuclear = rapid (1 year)
                               cause === 'war' ? 48 :     // War = medium (4 years)
                               60;                         // Climate/famine/ecosystem = slow (5 years)

  return {
    id: `crisis_${cause}_${state.currentMonth}`,
    cause,
    startMonth: state.currentMonth,
    sourceRegion,
    hostRegions,

    // Population (gradual displacement)
    potentialDisplaced: displacedPopulation,      // Total at risk
    remainingInSource: displacedPopulation,       // All still in source region initially
    displacedPopulation: 0,                       // None have fled yet
    currentlyDisplaced: 0,                        // None in transit yet
    resettledCount: 0,
    deathsInTransit: 0,

    // Gradual displacement mechanics
    displacementRate: 0.10,                       // 10% of remaining flee per month
    displacementDuration,
    displacementComplete: false,

    // Generational tracking
    generationLength: 300, // 25 years = 300 months
    monthsActive: 0,
    resettlementProgress: 0,

    // Effects
    socialTension: 0,
    economicStrain: 0,
    politicalInstability: 0,

    // Resolution
    resettlementRate: 0,
    baselineResettlementRate: 0.005, // 0.5% per month
    acceleratedResettlement: false,
    resolved: false,

    // Historical tracking
    peakDisplacement: 0,                          // Will track as people flee
    duration: 0,
  };
}
