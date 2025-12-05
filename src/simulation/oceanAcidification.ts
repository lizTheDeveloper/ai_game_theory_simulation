/**
 * Ocean Acidification Crisis System (TIER 1.3)
 *
 * Models ocean acidification - 7th planetary boundary breached Sept 2025.
 * Research: RD-2 (Nov 28, 2025) - research/ocean_acidification_cascades_REVISED_20251128.md
 *
 * Key findings:
 * - pH decline: 8.1 (pre-industrial) → 7.9 (2025) → 7.68-8.06 (2100 depending on SSP)
 * - Aragonite saturation: 4.6 → 2.8 (current) → 2.0-3.5 (2100)
 * - Coral reefs: 70% remaining (2025) → 70-90% loss by 2050 (1.5°C), >99% by 2100 (2°C)
 * - 330-500M people directly depend on reefs for protein (Coral Triangle 130M)
 * - Species sensitivity varies widely: 0.3 (Pocillopora resistant) to 1.5 (Acropora sensitive)
 * - Warming synergy: 2-3x stress multiplier when SST > 30°C AND pH < 7.9
 * - Economic: $100-500B/year conservative (fisheries $6.8B, tourism $19.5B, coastal protection $80B+)
 * - Tipping point: Evidence suggests likely approached/passed at 1.2°C ±0.3°C warming
 */

import { GameState } from '@/types/game';
import { OceanAcidificationSystem } from '@/types/oceanAcidification';
import {
  assertFinite,
  assertInRange,
  assertStateProperty,
  assertProbability
} from './utils/assertions';
import { isHistoricalModeActive } from './utils/historicalMode';

/**
 * Initialize ocean acidification system state (2025 baseline - JUST BREACHED)
 * Research: RD-2 (Nov 28, 2025) - research/ocean_acidification_cascades_REVISED_20251128.md
 */
export function initializeOceanAcidificationSystem(rng?: () => number): OceanAcidificationSystem {
  // Species sensitivity: randomized 0.8-1.2 for Monte Carlo variation
  // (0.3 = Pocillopora resistant, 1.0 = average, 1.5 = Acropora sensitive)
  // Use narrower range (0.8-1.2) for baseline runs, agents can shift composition later
  const speciesSensitivity = rng ? (0.8 + rng() * 0.4) : 1.0;

  return {
    // Research-backed fields (RD-2 Nov 28 2025)
    aragoniteSaturation: 2.8,        // Current (2025): 2.8-3.3, down from 4.6 pre-industrial
    pH: 7.95,                        // Current (2025): 7.95 (above cascade threshold, allows grace period)
    pHLevel: 0.96,                   // LEGACY: Slight decline from pre-industrial 8.2
    co2AbsorptionCapacity: 0.85,     // Still strong but declining
    coralReefHealth: 70,             // 70% (30% degradation from baseline)
    shellfishPopulation: 0.80,       // Larvae struggling but not collapsed yet
    marineEcosystemFunction: 80,     // Broader ecosystem health
    marineFoodWeb: 0.75,             // LEGACY: Moderately healthy
    coastalFisheriesYield: 0.85,     // 15% below baseline
    fishDependentImpact: 0.0,        // Not yet impacting food supply
    irreversibleLoss: 5,             // 5% already extinct (coral species)
    speciesSensitivity,              // 0.8-1.2 randomized (Monte Carlo variation)
    cascadeActive: false,            // pH still at threshold (7.9), cascade not yet triggered

    // Regional cascades (RD-2 Nov 28 2025)
    regionalCoralHealth: {
      seAsia: 0.65,           // SE Asia / Coral Triangle: Lower (higher pressure)
      pacificIslands: 0.75,   // Pacific Islands: Moderate
      caribbean: 0.60,        // Caribbean: Most degraded baseline
      indianOcean: 0.70,      // Indian Ocean: Less degraded
      globalAverage: 0.70,    // Weighted average (matches coralReefHealth)
    },
    regionalResilience: {
      seAsia: 0.3,          // Low (<35% MPAs, high fishing pressure)
      pacificIslands: 0.5,  // Moderate (some MPAs)
      caribbean: 0.4,       // Moderate-low (degraded + some restoration)
      indianOcean: 0.6,     // Higher (less pressure, some intact)
    },
    regionalSpeciesSensitivity: {
      seAsia: 1.1,          // Slightly higher (more Acropora)
      pacificIslands: 0.9,  // Slightly lower (mix)
      caribbean: 1.2,       // Higher (Acropora-dominated)
      indianOcean: 1.0,     // Average mix
    },
    compoundStressMultiplier: 1.0,  // No compounding yet (SST normal)
    warmingContribution: 0.0,       // Baseline
    acidificationContribution: 0.0, // Baseline
    monthsSinceStressOnset: 0,      // Cascade not yet active
    recoveryPotential: 1.0,         // Full recovery potential initially
    adaptationFloor: 0.4,           // 40% floor (transformation not collapse)
    thresholdsCrossed: {
      moderateStress: false,  // pH 7.9 at threshold, not crossed yet
      severeStress: false,
      ecosystemCollapse: false,
    },
    economicValueAtRisk: 100,       // $100B/year baseline (conservative)
    populationDependent: 350,       // 350M people (midpoint 330-500M)
    pHHistory: [7.95],              // Historical tracking (Month 0)
    coralHealthHistory: [70],       // Historical tracking (Month 0)

    // Existing fields
    boundaryBreached: true,          // Breached Sept 2025
    coralExtinctionActive: false,
    shellfishCollapseActive: false,
    marineFoodWebCollapseActive: false,
    monthsSinceBreach: 0,
    alkalinityEnhancementDeployment: 0.0,
    coralRestorationDeployment: 0.05, // Some existing programs
    marineProtectedAreasDeployment: 0.08, // ~8% of oceans protected (2025)
    // Geoengineering Risks (Oct 27, 2025)
    // Research: Oschlies et al. (2010), Williamson et al. (2012)
    // Baseline 2025: 0 (no artificial upwelling deployed yet)
    deadZoneRisk: 0.0,  // No dead zone risk without artificial upwelling
  };
}

/**
 * Update ocean acidification system each month
 * Research: RD-2 (Nov 28, 2025) - research/ocean_acidification_cascades_REVISED_20251128.md
 *
 * @param state - Game state
 * @param rng - REQUIRED deterministic RNG function (no fallback, fail loudly)
 */
export function updateOceanAcidificationSystem(state: GameState, rng: () => number): void {
  if (!state.oceanAcidificationSystem) return;

  // ❌ DEFENSIVE CODING: RNG REQUIRED (no silent fallback)
  if (!rng || typeof rng !== 'function') {
    throw new Error('❌ CRITICAL: RNG required for deterministic simulation (oceanAcidification)');
  }

  const oa = state.oceanAcidificationSystem;

  // === ACCESS STATE WITH ASSERTIONS (NO SILENT FALLBACKS) ===

  const climateStability = assertStateProperty(
    state.environmentalAccumulation,
    'climateStability',
    { location: 'updateOceanAcidificationSystem', month: state.currentMonth }
  );

  const pollutionLevel = assertStateProperty(
    state.environmentalAccumulation,
    'pollutionLevel',
    { location: 'updateOceanAcidificationSystem', month: state.currentMonth }
  );

  const economicStage = state.globalMetrics.economicTransitionStage;

  // Access temperature for warming synergy
  const temperatureAnomaly = assertStateProperty(
    state.resourceEconomy.co2,
    'temperatureAnomaly',
    { location: 'updateOceanAcidificationSystem[warming synergy]', month: state.currentMonth }
  );

  // Track time since breach
  if (oa.boundaryBreached) {
    oa.monthsSinceBreach++;
  }

  // === pH DECLINE (SSP Scenario-Based) ===
  // Research: Jiang et al. (2023), IPCC AR6
  // Monthly rates from RCP/SSP projections (2025-2100, 900 months)
  // CALIBRATION (Nov 28, 2025): Reduced by 50% to match research timelines

  const pH_DECLINE_RATE_PER_MONTH = {
    SSP1_1_9: -0.000005,  // Was -0.00001 → 50% reduction
    SSP1_2_6: -0.000045,  // Was -0.00009 → 50% reduction
    SSP2_4_5: -0.000095,  // Was -0.00019 → 50% reduction (moderate)
    SSP3_7_0: -0.000095,  // Capped at SSP2 level (was -0.00030)
    SSP5_8_5: -0.000095,  // Capped at SSP2 level (was -0.00043, business as usual)
  };

  // Map climate stability to SSP scenario (higher stability = better mitigation)
  let pHDeclineRate: number;
  if (climateStability > 0.9) {
    pHDeclineRate = pH_DECLINE_RATE_PER_MONTH.SSP1_1_9;
  } else if (climateStability > 0.75) {
    pHDeclineRate = pH_DECLINE_RATE_PER_MONTH.SSP1_2_6;
  } else if (climateStability > 0.55) {
    pHDeclineRate = pH_DECLINE_RATE_PER_MONTH.SSP2_4_5;
  } else if (climateStability > 0.35) {
    pHDeclineRate = pH_DECLINE_RATE_PER_MONTH.SSP3_7_0;
  } else {
    pHDeclineRate = pH_DECLINE_RATE_PER_MONTH.SSP5_8_5;
  }

  // Ocean alkalinity enhancement mitigates pH decline
  if (oa.alkalinityEnhancementDeployment > 0) {
    // Research: Albright et al. (2016) - pH restoration increases calcification
    // At full deployment (1.0), can offset SSP5-8.5 rate completely
    const mitigationRate = oa.alkalinityEnhancementDeployment * 0.00043;
    pHDeclineRate += mitigationRate; // Positive = pH increase
  }

  // Apply pH decline with fail-loudly assertion
  oa.pH = assertFinite(oa.pH + pHDeclineRate, {
    location: 'updateOceanAcidificationSystem[pH decline]',
    valueName: 'pH',
    month: state.currentMonth,
    additionalInfo: { oldpH: oa.pH, pHDeclineRate }
  });

  // Clamp pH to realistic range [7.5, 8.3]
  oa.pH = assertInRange(oa.pH, 7.5, 8.3, {
    location: 'updateOceanAcidificationSystem[pH clamp]',
    valueName: 'pH',
    month: state.currentMonth
  });

  // Update LEGACY pHLevel field (0-1 scale) for backward compatibility
  // Map: 7.5 → 0.85, 7.9 → 0.96, 8.1 → 1.0
  oa.pHLevel = assertProbability(0.85 + (oa.pH - 7.5) * 0.15 / 0.6, {
    location: 'updateOceanAcidificationSystem[pHLevel legacy]',
    valueName: 'pHLevel',
    month: state.currentMonth
  });

  // === ARAGONITE SATURATION (tracks pH) ===
  // Research: Kleypas & Langdon (2006) - Ωar correlates with pH
  // Mapping: pH 8.1 → Ωar 4.6, pH 7.9 → Ωar 3.3, pH 7.7 → Ωar 2.0

  if (oa.pH >= 8.0) {
    oa.aragoniteSaturation = 3.3 + (oa.pH - 7.9) * 13.0; // Linear 7.9-8.1 → 3.3-4.6
  } else if (oa.pH >= 7.7) {
    oa.aragoniteSaturation = 2.0 + (oa.pH - 7.7) * 6.5;  // Linear 7.7-7.9 → 2.0-3.3
  } else {
    oa.aragoniteSaturation = 1.0 + (oa.pH - 7.5) * 5.0;  // Linear 7.5-7.7 → 1.0-2.0
  }

  oa.aragoniteSaturation = assertFinite(oa.aragoniteSaturation, {
    location: 'updateOceanAcidificationSystem[aragonite]',
    valueName: 'aragoniteSaturation',
    month: state.currentMonth,
    additionalInfo: { pH: oa.pH }
  });

  // === CASCADE ACTIVATION ===
  // Trigger cascade when pH < 7.9 (population-average threshold)
  if (oa.pH < 7.9 && !oa.cascadeActive) {
    oa.cascadeActive = true;
    console.log(`🌊⚠️ Ocean acidification cascade triggered (pH ${oa.pH.toFixed(2)})`);
  }

  // === CORAL HEALTH DECLINE (Species-Adjusted) ===
  // Research: IPCC AR6, field studies (species variation wide)

  let coralDeclineRate = 0.0;

  if (oa.pH < 7.5) {
    coralDeclineRate = -5.0;      // Severe: -5%/month
  } else if (oa.pH < 7.7) {
    coralDeclineRate = -2.0;      // Collapse: -2%/month (±0.2 uncertainty)
  } else if (oa.pH < 7.8) {
    coralDeclineRate = -0.8;      // Severe stress: -0.8%/month
  } else if (oa.pH < 7.9) {
    coralDeclineRate = -0.3;      // Moderate: -0.3%/month
  } else if (oa.pH < 8.0) {
    coralDeclineRate = -0.1;      // Mild: -0.1%/month
  }

  // Apply species sensitivity multiplier (0.3-1.5 range)
  coralDeclineRate *= oa.speciesSensitivity;

  // === WARMING SYNERGY (Compound Stress) ===
  // Research: Anthony et al. (2008) - Warming + acidification = synergistic (2-3x)
  // 31°C + pH 7.8 → severe bleaching within 5 days

  // Estimate SST from temperature anomaly (baseline ~27°C tropical surface)
  const baselineSST = 27.0;
  const estimatedSST = baselineSST + temperatureAnomaly;

  if (estimatedSST > 31.5 && oa.pH < 7.9) {
    coralDeclineRate *= 3.0;  // Severe synergy
    console.log(`🌡️🪸 Synergistic coral stress (SST ${estimatedSST.toFixed(1)}°C, pH ${oa.pH.toFixed(2)}): 3× multiplier`);
  } else if (estimatedSST > 30.0 && oa.pH < 7.9) {
    coralDeclineRate *= 2.0;  // Moderate synergy
  }

  // Climate stress accelerates (heat + acid = double hit)
  const climateStressMultiplier = 1.0 + (1.0 - climateStability) * 0.5;
  coralDeclineRate *= climateStressMultiplier;

  // Coral restoration helps
  coralDeclineRate *= (1.0 - oa.coralRestorationDeployment * 0.4);

  // Protected areas help
  coralDeclineRate *= (1.0 - oa.marineProtectedAreasDeployment * 0.3);

  // HIGH-1 FIX (Nov 28, 2025): Removed duplicate coral health calculation
  // OceanAcidificationCascadePhase (order 21.8) is sole authority for coralReefHealth
  // This phase (ResourceWaterPhase order 20.2) previously calculated coralReefHealth here,
  // but cascade phase overwrote it with regional average. Removed to prevent duplicate writes.
  // Lines 237-277 (decline rate calculation) kept for research documentation.
  // coralReefHealth is now set exclusively by OceanAcidificationCascadePhase.

  // === IRREVERSIBLE LOSS ACCUMULATION ===
  // Research: Hoegh-Guldberg et al. (2017) - ocean-scale changes irreversible on centennial timescales
  // Permanent damage accumulates when coral health < 20% (species extinctions, regime shifts)

  if (oa.coralReefHealth < 20) {
    // Below 20% health, 10% of remaining corals die permanently each year
    // Monthly: 10% / 12 = 0.833%/month of remaining coral capacity
    const monthlyIrreversibleRate = (100 - oa.irreversibleLoss) * 0.00833;
    oa.irreversibleLoss = assertFinite(oa.irreversibleLoss + monthlyIrreversibleRate, {
      location: 'updateOceanAcidificationSystem[irreversible loss]',
      valueName: 'irreversibleLoss',
      month: state.currentMonth,
      additionalInfo: { coralHealth: oa.coralReefHealth }
    });
    oa.irreversibleLoss = assertInRange(oa.irreversibleLoss, 0, 100, {
      location: 'updateOceanAcidificationSystem[irreversible clamp]',
      valueName: 'irreversibleLoss',
      month: state.currentMonth
    });
  }

  // Coral extinction phase
  if (oa.coralReefHealth < 30 && !oa.coralExtinctionActive) {
    oa.coralExtinctionActive = true;
    console.log(`🪸💀 Coral reef collapse (health ${oa.coralReefHealth.toFixed(1)}%)`);
    console.log(`   pH: ${oa.pH.toFixed(2)}, Aragonite Ω: ${oa.aragoniteSaturation.toFixed(1)}`);
    console.log(`   25% of marine species losing habitat`);

    // Impact biodiversity
    if (!isHistoricalModeActive(state) && state.environmentalAccumulation) {
      state.environmentalAccumulation.biodiversityIndex = Math.max(0,
        state.environmentalAccumulation.biodiversityIndex - 0.05 // -5% instant hit
      );
    }
  }

  // === SHELLFISH COLLAPSE ===
  // Research: Bednaršek et al. (2021) - 37% shell thickness decline pH 8.03 → 7.77
  // Timeline: 2050-2075 (after corals die)

  let shellfishDeclineRate = 0;
  if (oa.aragoniteSaturation < 2.0) {
    // Critical: Active dissolution, larvae can't form shells
    shellfishDeclineRate = (2.0 - oa.aragoniteSaturation) * 0.012; // Up to 1.2%/month
  } else if (oa.aragoniteSaturation < 2.5) {
    // Stressed: Struggling larvae
    shellfishDeclineRate = 0.003; // 0.3%/month
  }

  // Ocean alkalinity helps
  shellfishDeclineRate *= (1.0 - oa.alkalinityEnhancementDeployment * 0.6);

  oa.shellfishPopulation = Math.max(0, oa.shellfishPopulation - shellfishDeclineRate);

  // Shellfish collapse phase
  if (oa.shellfishPopulation < 0.40 && !oa.shellfishCollapseActive) {
    oa.shellfishCollapseActive = true;
    console.log(`🐟📉 Shellfish fisheries collapse (population ${(oa.shellfishPopulation * 100).toFixed(0)}%)`);
    console.log(`   Aragonite Ω: ${oa.aragoniteSaturation.toFixed(1)} (below 2.5 stress threshold)`);
    console.log(`   Oyster, clam, mussel fisheries failing`);

    // Food impact for coastal populations
    state.qualityOfLifeSystems.materialAbundance = Math.max(0, state.qualityOfLifeSystems.materialAbundance - 0.04);
  }

  // === COASTAL FISHERIES YIELD (Power Law) ===
  // Research: Exponential decline (coralHealth/100)^1.2 (calibrated Nov 28, 2025)
  // Species composition factor: resistant species maintain higher yields
  // CALIBRATION: Reduced exponent from 1.5 to 1.2 (gentler decline curve)

  const speciesCompositionFactor = 0.7 + (0.6 * (1.0 - oa.speciesSensitivity));  // More resistant = higher yield
  const baseFisheriesYield = Math.pow(oa.coralReefHealth / 100, 1.2);
  oa.coastalFisheriesYield = assertFinite(baseFisheriesYield * speciesCompositionFactor, {
    location: 'updateOceanAcidificationSystem[fisheries yield]',
    valueName: 'coastalFisheriesYield',
    month: state.currentMonth,
    additionalInfo: { coralHealth: oa.coralReefHealth, speciesCompositionFactor }
  });

  oa.coastalFisheriesYield = assertInRange(oa.coastalFisheriesYield, 0, 1, {
    location: 'updateOceanAcidificationSystem[fisheries clamp]',
    valueName: 'coastalFisheriesYield',
    month: state.currentMonth
  });

  // === MARINE ECOSYSTEM FUNCTION ===
  // Broader than food web - includes biodiversity, nutrient cycling
  // Average of coral, shellfish, aragonite saturation (normalized)

  const avgHealth = (oa.coralReefHealth / 100 + oa.shellfishPopulation + oa.aragoniteSaturation / 4.6) / 3;
  oa.marineEcosystemFunction = assertFinite(avgHealth * 100, {
    location: 'updateOceanAcidificationSystem[ecosystem function]',
    valueName: 'marineEcosystemFunction',
    month: state.currentMonth
  });

  // Update LEGACY marineFoodWeb field
  oa.marineFoodWeb = oa.marineEcosystemFunction / 100;

  // Marine food web collapse
  if (oa.marineEcosystemFunction < 30 && !oa.marineFoodWebCollapseActive) {
    oa.marineFoodWebCollapseActive = true;
    console.log(`🌊💀 Marine ecosystem collapse (function ${oa.marineEcosystemFunction.toFixed(1)}%)`);
    console.log(`   Coral: ${oa.coralReefHealth.toFixed(1)}%, Shellfish: ${(oa.shellfishPopulation * 100).toFixed(0)}%`);
    console.log(`   330-500M people depend on reefs for protein`);

    // Major biodiversity hit
    if (!isHistoricalModeActive(state) && state.environmentalAccumulation) {
      state.environmentalAccumulation.biodiversityIndex = Math.max(0,
        state.environmentalAccumulation.biodiversityIndex - 0.10 // -10% instant hit
      );
    }
  }

  // === FISH-DEPENDENT POPULATION IMPACT ===
  // Research: 330-500M direct dependence (within 30km of reefs), up to 1B indirect
  // Regional variation: Coral Triangle 130M, Pacific Islands 10M (60% protein from fish)

  if (oa.marineEcosystemFunction < 50) {
    // Ecosystem stressed: Fish catches declining
    oa.fishDependentImpact = (50 - oa.marineEcosystemFunction) / 50; // 0-100% impact

    // Food QoL impact (37.5% of 8B = 3B people, but using 500M/8B = 6.25% more conservative)
    const foodImpact = oa.fishDependentImpact * 0.0625 * 0.005; // Up to 0.03%/month
    state.qualityOfLifeSystems.materialAbundance = Math.max(0, state.qualityOfLifeSystems.materialAbundance - foodImpact);
  }

  // === CO2 ABSORPTION CAPACITY DECLINE (Feedback Loop) ===
  // Research: Stockholm Resilience - "degrading oceans' ability to act as Earth's stabiliser"

  const absorptionDecline = (1.0 - oa.marineEcosystemFunction / 100) * 0.0005; // Faster as ecosystem degrades
  oa.co2AbsorptionCapacity = Math.max(0.50, oa.co2AbsorptionCapacity - absorptionDecline);

  // Feedback to climate: Lower absorption = more atmospheric CO2
  if (oa.co2AbsorptionCapacity < 0.75) {
    const climateAcceleration = (0.75 - oa.co2AbsorptionCapacity) * 0.0002;
    const currentClimateStability = assertStateProperty(
      state.environmentalAccumulation,
      'climateStability',
      { location: 'updateOceanAcidificationSystem[climate feedback]', month: state.currentMonth }
    );
    state.environmentalAccumulation.climateStability = Math.max(0,
      currentClimateStability - climateAcceleration
    );
  }

  // === EXTINCTION PATHWAY ===
  // Slow collapse: Marine food web fails + no alternatives = famine for 330-500M people

  if (oa.marineFoodWebCollapseActive && oa.fishDependentImpact > 0.70) {
    const materialAbundance = state.qualityOfLifeSystems.materialAbundance;

    // Check if alternative proteins developed
    const hasAlternatives = economicStage >= 3.5; // Post-scarcity has alternatives

    if (materialAbundance < 0.30 && !hasAlternatives) {
      console.log(`☠️ Ocean acidification extinction risk: Marine food system collapse`);
      console.log(`   Material Abundance: ${(materialAbundance * 100).toFixed(0)}%`);
      console.log(`   Marine ecosystem: ${oa.marineEcosystemFunction.toFixed(1)}%`);
      console.log(`   Fish-dependent impact: ${(oa.fishDependentImpact * 100).toFixed(0)}%`);
      console.log(`   330-500M people depend on reefs - famine spreading`);

      if (!state.extinctionState.extinctionTriggered) {
        state.extinctionState.extinctionTriggered = true;
        state.extinctionState.extinctionType = 'environmental_collapse';
        state.extinctionState.extinctionMechanism = 'ocean_acidification_famine';
        state.extinctionState.monthsUntilExtinction = 48; // 4 years of slow collapse
        state.extinctionState.description = 'Ocean acidification destroyed marine ecosystems. 330-500M reef-dependent people facing famine. Slow collapse over 48 months.';
      }
    }
  }
}

/**
 * Check if ocean acidification technologies should unlock
 *
 * NOTE: Tech unlocking now handled by TechTreePhase
 * This function is deprecated but kept for backward compatibility
 */
export function checkOceanAcidificationTechUnlocks(state: GameState): void {
  if (!state.oceanAcidificationSystem) return;
  return; // Early return - tech tree handles all unlocking now
}
