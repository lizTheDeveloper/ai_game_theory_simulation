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

      // Track transit deaths by category (convert millions to billions)
      const transitDeathsBillions = transitDeaths / 1000;
      const category = crisis.cause === 'war' || crisis.cause === 'nuclear' ? 'war' :
                       crisis.cause === 'famine' ? 'famine' :
                       crisis.cause === 'climate' ? 'climate' :
                       crisis.cause === 'ecosystem' ? 'ecosystem' : 'other';
      state.humanPopulationSystem.deathsByCategory[category] += transitDeathsBillions;
      state.humanPopulationSystem.cumulativeCrisisDeaths += transitDeathsBillions;

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

    // Update progress
    crisis.resettlementProgress = crisis.resettledCount / crisis.displacedPopulation;

    // === GENERATIONAL RESETTLEMENT MILESTONE ===
    if (crisis.monthsActive >= crisis.generationLength) {
      // After 1 generation (25 years), remaining refugees are "fully resettled"
      crisis.resettledCount += crisis.currentlyDisplaced;
      crisis.currentlyDisplaced = 0;
      crisis.resolved = true;
      crisis.duration = crisis.monthsActive;

      // Tension drops sharply
      crisis.socialTension *= 0.3;
      crisis.economicStrain *= 0.2;

      console.log(`✅ REFUGEE CRISIS RESOLVED: ${crisis.cause} (${crisis.sourceRegion})`);
      console.log(`   Duration: ${crisis.monthsActive} months (${(crisis.monthsActive / 12).toFixed(1)} years)`);
      console.log(`   Total displaced: ${crisis.displacedPopulation.toFixed(1)}M`);
      console.log(`   Resettled: ${crisis.resettledCount.toFixed(1)}M`);
    }

    // === CALCULATE SOCIAL TENSION ===
    // Tension based on: raw numbers, speed of influx, economic conditions, social stability
    const popRatio = state.humanPopulationSystem.population * 1000; // Convert to millions
    const displacementScale = crisis.currentlyDisplaced / popRatio; // Ratio
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
  state.globalMetrics.socialStability = Math.max(0,
    state.globalMetrics.socialStability * (1 - system.globalRefugeeTension * 0.1)
  );

  // Refugees increase paranoia
  if (state.society.paranoiaLevel !== undefined) {
    state.society.paranoiaLevel = Math.min(1.0,
      state.society.paranoiaLevel + system.globalRefugeeTension * 0.05
    );
  }

  // Economic strain reduces QoL
  state.globalMetrics.qualityOfLife = Math.max(0,
    state.globalMetrics.qualityOfLife * (1 - system.economicStrain * 0.05)
  );

  // Political instability increases dystopia risk
  state.outcomeMetrics.dystopiaProbability += system.globalRefugeeTension * 0.02;

  // Very high refugee crises can trigger dystopian "fortress world" outcome
  if (system.globalRefugeeTension > 0.8 && !system.bordersOpen) {
    // Militarized borders + surveillance = dystopia path
    state.government.surveillanceCapability = Math.min(10,
      state.government.surveillanceCapability + 0.05
    );
    state.government.controlDesire = Math.min(1.0,
      state.government.controlDesire + 0.02
    );

    if (state.government.structuralChoices) {
      state.government.structuralChoices.surveillanceLevel = Math.min(1.0,
        state.government.structuralChoices.surveillanceLevel + 0.03
      );
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
  const newCrises: RefugeeCrisis[] = [];

  // === 1. CLIMATE DISASTERS ===
  const env = state.environmentalAccumulation;
  if (env.climateStability < 0.5 && env.climateCrisisActive) {
    const severity = 1 - env.climateStability;
    const displaced = state.humanPopulationSystem.population * 1000 * severity * 0.05; // 5% per 0.1 instability

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
    // Each active conflict displaces 1-5% of regional population
    const conflictSeverity = state.conflictResolution.activeConflicts * 0.02;
    const displaced = state.humanPopulationSystem.population * 1000 * conflictSeverity;

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
    const foodScarcity = Math.max(0, 1 - resources.food.reserves);
    const waterScarcity = Math.max(0, 1 - resources.water.reserves);
    const severity = Math.max(foodScarcity, waterScarcity);
    const displaced = state.humanPopulationSystem.population * 1000 * severity * 0.1;

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
    const severity = 1 - env.biodiversityIndex;
    const displaced = state.humanPopulationSystem.population * 1000 * severity * 0.03;

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

  // Log new crises
  for (const crisis of newCrises) {
    console.log(`🚨 NEW REFUGEE CRISIS: ${crisis.cause.toUpperCase()}`);
    console.log(`   Source: ${crisis.sourceRegion}`);
    console.log(`   At risk: ${crisis.potentialDisplaced.toFixed(1)}M people`);
    console.log(`   Displacement: Gradual over ${crisis.displacementDuration} months (${(crisis.displacementDuration/12).toFixed(1)} years)`);
    console.log(`   Rate: 10% flee per month`);
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
