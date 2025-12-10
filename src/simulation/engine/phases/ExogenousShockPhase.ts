/**
 * Exogenous Shock Phase - Phase 2 of Contingency & Agency Modeling
 *
 * Implements rare unpredictable events outside the normal state space evolution.
 *
 * Research Foundation:
 * - Taleb (2007): Black Swan theory - high impact, low predictability events
 * - Sornette (2003): Critical phase transitions in social sciences
 * - IPCC AR6 (2021-2023): Volcanic eruption & shock event modeling methodology
 *
 * Historical Calibration:
 * - 15 black/gray swans in 80 years (1945-2025) = 0.19/year
 * - Stratified by impact severity:
 *   - Black swans (civilization-altering): 0.1% per month (~1% per year)
 *   - Gray swans (major but recoverable): 1% per month (~10% per year)
 *
 * Order: 27.5 (after crisis detection at 36.0, before outcomes)
 */

import { GameState, GameEvent, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { getTechDeploymentSafe } from '../../techTree/helpers';
import {
  assertStateProperty,
  assertFinite,
  assertProbability,
  assertInRange,
  assertShockMagnitude,
  assertResourceAllocation
} from '@/simulation/utils/assertions';
import { addMortalityRisk } from '@/simulation/bayesianMortality';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { isHistoricalModeActive } from '@/simulation/utils/historicalMode';

/**
 * CRITICAL FIX (Nov 8, 2025): Round capabilities to discrete levels [0-5]
 * Bug: Capability boosts like +0.5 created non-integer values (4 + 0.5 = 4.5)
 * This helper ensures all capability values remain integers
 */
const toCapabilityLevel = (value: number): number => {
  return Math.max(0, Math.min(5, Math.round(value)));
};

/**
 * Exogenous Shock Types
 *
 * Stratified by impact severity and recovery potential.
 */
export enum ShockType {
  // BLACK SWAN (0.1% per month) - Civilization-altering
  NUCLEAR_WAR = 'nuclear_war',
  AGI_BREAKTHROUGH = 'agi_breakthrough',
  ASTEROID_IMPACT = 'asteroid_impact',
  MEGA_PANDEMIC = 'mega_pandemic',

  // GRAY SWAN (1% per month) - Major but recoverable
  FINANCIAL_CRASH = 'financial_crash',
  REGIONAL_WAR = 'regional_war',
  TECH_BREAKTHROUGH = 'tech_breakthrough',
  POLITICAL_UPHEAVAL = 'political_upheaval',
}

/**
 * Applies an exogenous shock to the game state.
 */
function applyExogenousShock(
  state: GameState,
  shockType: ShockType,
  rng: RNGFunction
): GameEvent[] {
  console.log(`\n🌩️  EXOGENOUS SHOCK: ${shockType}`);
  console.log(`   Month: ${state.currentMonth}`);

  const events: GameEvent[] = [];

  switch (shockType) {
    case ShockType.NUCLEAR_WAR:
      events.push(...applyNuclearWarShock(state, rng));
      break;

    case ShockType.AGI_BREAKTHROUGH:
      events.push(...applyAGIBreakthroughShock(state, rng));
      break;

    case ShockType.ASTEROID_IMPACT:
      events.push(...applyAsteroidImpactShock(state, rng));
      break;

    case ShockType.MEGA_PANDEMIC:
      events.push(...applyMegaPandemicShock(state, rng));
      break;

    case ShockType.FINANCIAL_CRASH:
      events.push(...applyFinancialCrashShock(state, rng));
      break;

    case ShockType.REGIONAL_WAR:
      events.push(...applyRegionalWarShock(state, rng));
      break;

    case ShockType.TECH_BREAKTHROUGH:
      events.push(...applyTechBreakthroughShock(state, rng));
      break;

    case ShockType.POLITICAL_UPHEAVAL:
      events.push(...applyPoliticalUpheavalShock(state, rng));
      break;
  }

  // Record shock in history
  if (!state.history.exogenousShocks) {
    state.history.exogenousShocks = [];
  }

  const severity: 'civilization-altering' | 'major-recoverable' =
    [ShockType.NUCLEAR_WAR, ShockType.AGI_BREAKTHROUGH, ShockType.ASTEROID_IMPACT, ShockType.MEGA_PANDEMIC].includes(shockType)
      ? 'civilization-altering'
      : 'major-recoverable';

  state.history.exogenousShocks.push({
    month: state.currentMonth,
    type: shockType,
    severity,
  });

  return events;
}

/**
 * Nuclear War Shock
 * Effect: 50-99% mortality, instant or rapid (1-6 months)
 * Historical: 0 occurrences, 6 near-misses (Cuban Missile, 1983 false alarm, etc.)
 */
function applyNuclearWarShock(state: GameState, rng: RNGFunction): GameEvent[] {
  const mortalityRate = assertProbability(0.5 + rng() * 0.49, {
    location: 'applyNuclearWarShock',
    valueName: 'mortalityRate',
    month: state.currentMonth
  }); // 50-99%

  console.log(`   💥 Full-scale nuclear exchange`);
  console.log(`   Estimated mortality: ${(mortalityRate * 100).toFixed(1)}%`);

  // Add mortality risk to centralized system (instant, global)
  if (state.humanPopulationSystem) {
    addMortalityRisk(state.humanPopulationSystem, {
      type: 'war',
      baseRisk: mortalityRate,
      proximate: 'war',
      root: 'conflict', // Nuclear war = geopolitical conflict
      confidence: 'HIGH',
      scope: 'GLOBAL', // Instant global catastrophe
      month: state.currentMonth,
      description: 'Full-scale nuclear exchange',
    });
  }

  // Trigger nuclear winter (environmental collapse)
  if (state.planetaryBoundariesSystem?.boundaries) {
    const boundaries = state.planetaryBoundariesSystem.boundaries;
    if (boundaries.climate_change) {
      // CRITICAL-1 FIX (Dec 1, 2025): climate_change.currentValue is TEMPERATURE (°C), not probability
      // Nuclear winter: ~0.5°C cooling initially, then heating from CO2/smoke effects
      // Research: Robock et al. (2007) - nuclear winter temperature perturbations
      const climateDelta = assertShockMagnitude(0.5, {
        location: 'applyNuclearWarShock',
        valueName: 'climateDelta',
        month: state.currentMonth,
        shockType: 'nuclear_war'
      });

      // Use assertFinite (NOT assertProbability - temperature can exceed 1.0°C!)
      boundaries.climate_change.currentValue = assertFinite(
        boundaries.climate_change.currentValue + climateDelta,
        {
          location: 'applyNuclearWarShock',
          valueName: 'climate_change.currentValue (temperature in °C)',
          month: state.currentMonth
        }
      );
    }
    if (boundaries.biosphere_integrity) {
      // BUG FIX (Nov 7, 2025): Nuclear war damages biosphere (negative shock, subtract to increase currentValue)
      // Shock magnitude: -0.5 (50% damage to biosphere integrity)
      // Application: SUBTRACT negative value = ADD 0.5 to currentValue (makes biosphere worse)
      // Rationale: biosphere_integrity.currentValue scale: 0 = safe, 1+ = collapse
      const biosphereDelta = assertShockMagnitude(-0.5, {
        location: 'applyNuclearWarShock',
        valueName: 'biosphereDelta',
        month: state.currentMonth,
        shockType: 'nuclear_war'
      });

      boundaries.biosphere_integrity.currentValue = assertFinite(
        boundaries.biosphere_integrity.currentValue - biosphereDelta,
        {
          location: 'applyNuclearWarShock',
          valueName: 'biosphere_integrity.currentValue',
          month: state.currentMonth
        }
      );
    }
  }

  // Infrastructure destruction
  if (state.computeInfrastructure && state.computeInfrastructure.dataCenters) {
    const destructionMultiplier = assertResourceAllocation(0.1, {
      location: 'applyNuclearWarShock',
      valueName: 'infrastructureDestructionMultiplier',
      month: state.currentMonth
    }); // 90% destroyed (0.1 = 10% remains)

    const survivalThreshold = assertProbability(0.1, {
      location: 'applyNuclearWarShock',
      valueName: 'dataCenterSurvivalThreshold',
      month: state.currentMonth
    });

    state.computeInfrastructure.dataCenters.forEach(dc => {
      if (dc.operational) {
        dc.capacity = assertFinite(dc.capacity * destructionMultiplier, {
          location: 'applyNuclearWarShock',
          valueName: `dataCenters[].capacity`,
          month: state.currentMonth
        });

        if (rng() > survivalThreshold) {
          dc.operational = false;
        }
      }
    });
  }

  // Social collapse
  if (state.society) {
    const trustMultiplier = assertResourceAllocation(0.2, {
      location: 'applyNuclearWarShock',
      valueName: 'trustMultiplier',
      month: state.currentMonth
    }); // 80% loss of trust

    const coordinationMultiplier = assertResourceAllocation(0.2, {
      location: 'applyNuclearWarShock',
      valueName: 'coordinationMultiplier',
      month: state.currentMonth
    }); // 80% loss of coordination

    state.society.trustInAI = assertProbability(
      Math.max(0, state.society.trustInAI * trustMultiplier),
      {
        location: 'applyNuclearWarShock',
        valueName: 'society.trustInAI',
        month: state.currentMonth
      }
    );

    state.society.coordinationCapacity = assertProbability(
      Math.max(0, state.society.coordinationCapacity * coordinationMultiplier),
      {
        location: 'applyNuclearWarShock',
        valueName: 'society.coordinationCapacity',
        month: state.currentMonth
      }
    );
  }

  if (state.government) {
    const legitimacyCeiling = assertResourceAllocation(0.1, {
      location: 'applyNuclearWarShock',
      valueName: 'governmentLegitimacyCeiling',
      month: state.currentMonth
    });

    state.government.legitimacy = assertProbability(
      Math.min(legitimacyCeiling, state.government.legitimacy),
      {
        location: 'applyNuclearWarShock',
        valueName: 'government.legitimacy',
        month: state.currentMonth
      }
    );
  }

  // Set extinction scenario
  const extinctionThreshold = assertProbability(0.875, {
    location: 'applyNuclearWarShock',
    valueName: 'extinctionThreshold',
    month: state.currentMonth
  });

  if (mortalityRate > extinctionThreshold) {
    state.extinctionState.active = true;
    state.extinctionState.type = 'rapid';
    state.extinctionState.mechanism = 'nuclear_war';
    state.extinctionState.startMonth = state.currentMonth;
    state.extinctionState.severity = assertProbability(mortalityRate, {
      location: 'applyNuclearWarShock',
      valueName: 'extinctionState.severity',
      month: state.currentMonth
    });
  }

  return [{
    id: `nuclear_war_${state.currentMonth}`,
    timestamp: state.currentMonth,
    type: 'crisis',
    severity: 'destructive',
    agent: 'exogenous',
    title: 'Nuclear War (Exogenous Shock)',
    description: `Full-scale nuclear exchange: ${(mortalityRate * 100).toFixed(1)}% mortality`,
    effects: { mortality: mortalityRate }
  }];
}

/**
 * AGI Breakthrough Shock (Positive Black Swan)
 * Effect: Unlock all research, trigger fast takeoff
 * Historical: 0 occurrences (no precedent)
 */
function applyAGIBreakthroughShock(state: GameState, rng: RNGFunction): GameEvent[] {
  console.log(`   🚀 Recursive self-improvement achieved`);
  console.log(`   All research unlocked, fast takeoff initiated`);

  let unlockedCount = 0;

  // Unlock all breakthrough technologies
  if (state.techTreeState && state.technologyTree) {
    const unlockedSet = new Set(state.techTreeState.unlockedTech || []);
    state.technologyTree.forEach(tech => {
      if (!unlockedSet.has(tech.id)) {
        state.techTreeState.unlockedTech.push(tech.id);
        tech.completed = true; // Mark as completed/deployed
        unlockedCount++;
        console.log(`      ✓ ${tech.name || 'Technology'} unlocked`);
      }
    });
  }

  // Boost AI capabilities dramatically
  const selfImprovementBoost = assertShockMagnitude(0.5, {
    location: 'applyAGIBreakthroughShock',
    valueName: 'selfImprovementBoost',
    month: state.currentMonth,
    shockType: 'agi_breakthrough'
  });

  const algorithmBoost = assertShockMagnitude(0.3, {
    location: 'applyAGIBreakthroughShock',
    valueName: 'algorithmBoost',
    month: state.currentMonth,
    shockType: 'agi_breakthrough'
  });

  const capabilityCeiling = assertFinite(10.0, {
    location: 'applyAGIBreakthroughShock',
    valueName: 'selfImprovementCeiling',
    month: state.currentMonth
  });

  const algorithmCeiling = assertFinite(5.0, {
    location: 'applyAGIBreakthroughShock',
    valueName: 'algorithmCeiling',
    month: state.currentMonth
  });

  state.aiAgents.forEach(agent => {
    // CRITICAL FIX (Nov 8, 2025): Round capability values to integers [0-5]
    // Bug: Adding 0.5 boost to integer capability (4 + 0.5 = 4.5) broke discrete levels
    agent.capabilityProfile.selfImprovement = toCapabilityLevel(
      assertFinite(
        Math.min(capabilityCeiling, agent.capabilityProfile.selfImprovement + selfImprovementBoost),
        {
          location: 'applyAGIBreakthroughShock',
          valueName: 'agent.capabilityProfile.selfImprovement',
          month: state.currentMonth
        }
      )
    );

    agent.capabilityProfile.research.computerScience.algorithms = toCapabilityLevel(
      assertFinite(
        Math.min(algorithmCeiling, agent.capabilityProfile.research.computerScience.algorithms + algorithmBoost),
        {
          location: 'applyAGIBreakthroughShock',
          valueName: 'agent.capabilityProfile.research.computerScience.algorithms',
          month: state.currentMonth
        }
      )
    );

    // Recalculate total capability
    // HIGH-6 FIX (Nov 8, 2025): Round to integer - capabilities are discrete levels [0-5]
    agent.capability = assertFinite(
      Math.round(calculateTotalCapability(agent.capabilityProfile)),
      {
        location: 'applyAGIBreakthroughShock',
        valueName: 'agent.capability',
        month: state.currentMonth
      }
    );
  });

  return [{
    id: `agi_breakthrough_${state.currentMonth}`,
    timestamp: state.currentMonth,
    type: 'breakthrough',
    severity: 'info',
    agent: 'exogenous',
    title: 'AGI Breakthrough (Exogenous Shock)',
    description: `Recursive self-improvement achieved. ${unlockedCount} technologies unlocked instantly.`,
    effects: { technologiesUnlocked: unlockedCount }
  }];
}

/**
 * Asteroid Impact Shock
 * Effect: 10-90% mortality, nuclear winter effects
 * Historical: 0 major impacts since 1908 (Tunguska)
 */
function applyAsteroidImpactShock(state: GameState, rng: RNGFunction): GameEvent[] {
  const impactSize = assertProbability(rng(), {
    location: 'applyAsteroidImpactShock',
    valueName: 'impactSize',
    month: state.currentMonth
  }); // 0-1 scale

  const mortalityRate = assertProbability(impactSize * 0.8, {
    location: 'applyAsteroidImpactShock',
    valueName: 'mortalityRate',
    month: state.currentMonth
  }); // 0-80% mortality

  console.log(`   ☄️  Asteroid impact`);
  console.log(`   Impact size: ${(impactSize * 100).toFixed(1)}%`);
  console.log(`   Mortality: ${(mortalityRate * 100).toFixed(1)}%`);

  // Add mortality risk to centralized system (instant, global)
  if (state.humanPopulationSystem) {
    addMortalityRisk(state.humanPopulationSystem, {
      type: 'disaster',
      baseRisk: mortalityRate,
      proximate: 'disasters',
      root: 'natural', // Exogenous natural disaster
      confidence: 'MEDIUM', // Less certain than deliberate war
      scope: 'GLOBAL', // Instant global impact
      month: state.currentMonth,
      description: 'Asteroid impact',
    });
  }

  // Environmental effects (dust, climate disruption)
  if (state.planetaryBoundariesSystem?.boundaries) {
    const boundaries = state.planetaryBoundariesSystem.boundaries;
    if (boundaries.climate_change) {
      // CRITICAL-1 FIX (Dec 1, 2025): climate_change.currentValue is TEMPERATURE (°C), not probability
      // Asteroid impact: cooling from dust/ejecta, warming from wildfires/greenhouse
      // Research: Toon et al. (2016) - impact winter temperature perturbations
      const climateDelta = assertShockMagnitude(impactSize * 0.4, {
        location: 'applyAsteroidImpactShock',
        valueName: 'climateDelta',
        month: state.currentMonth,
        shockType: 'asteroid_impact'
      });

      // Use assertFinite (NOT assertProbability - temperature can exceed 1.0°C!)
      boundaries.climate_change.currentValue = assertFinite(
        boundaries.climate_change.currentValue + climateDelta,
        {
          location: 'applyAsteroidImpactShock',
          valueName: 'climate_change.currentValue (temperature in °C)',
          month: state.currentMonth
        }
      );
    }
    if (boundaries.biosphere_integrity) {
      // BUG FIX (Nov 7, 2025): Asteroid impact damages biosphere (negative shock, subtract to increase currentValue)
      // Shock magnitude: -(impactSize * 0.5) where impactSize ∈ [0, 1]
      // Application: SUBTRACT negative value = ADD to currentValue (makes biosphere worse)
      // Rationale: biosphere_integrity.currentValue scale: 0 = safe, 1+ = collapse
      const biosphereDelta = assertShockMagnitude(-impactSize * 0.5, {
        location: 'applyAsteroidImpactShock',
        valueName: 'biosphereDelta',
        month: state.currentMonth,
        shockType: 'asteroid_impact'
      });

      boundaries.biosphere_integrity.currentValue = assertFinite(
        boundaries.biosphere_integrity.currentValue - biosphereDelta,
        {
          location: 'applyAsteroidImpactShock',
          valueName: 'biosphere_integrity.currentValue',
          month: state.currentMonth
        }
      );
    }
  }

  // Infrastructure damage
  if (state.computeInfrastructure && state.computeInfrastructure.dataCenters) {
    const infrastructureDamage = assertResourceAllocation(impactSize * 0.3, {
      location: 'applyAsteroidImpactShock',
      valueName: 'infrastructureDamage',
      month: state.currentMonth
    });

    state.computeInfrastructure.dataCenters.forEach(dc => {
      dc.capacity = assertFinite(dc.capacity * (1 - infrastructureDamage), {
        location: 'applyAsteroidImpactShock',
        valueName: 'dataCenters[].capacity',
        month: state.currentMonth
      });
    });
  }

  const extinctionThreshold = assertProbability(0.5, {
    location: 'applyAsteroidImpactShock',
    valueName: 'extinctionThreshold',
    month: state.currentMonth
  });

  if (mortalityRate > extinctionThreshold) {
    state.extinctionState.active = true;
    state.extinctionState.type = 'rapid';
    state.extinctionState.mechanism = 'climate_tipping_point';
    state.extinctionState.startMonth = state.currentMonth;
    state.extinctionState.severity = assertProbability(mortalityRate, {
      location: 'applyAsteroidImpactShock',
      valueName: 'extinctionState.severity',
      month: state.currentMonth
    });
  }

  return [{
    id: `asteroid_impact_${state.currentMonth}`,
    timestamp: state.currentMonth,
    type: 'crisis',
    severity: 'destructive',
    agent: 'exogenous',
    title: 'Asteroid Impact (Exogenous Shock)',
    description: `Asteroid impact (size: ${(impactSize * 100).toFixed(1)}%): ${(mortalityRate * 100).toFixed(1)}% mortality`,
    effects: { mortality: mortalityRate, impactSize }
  }];
}

/**
 * Mega-Pandemic Shock
 * Effect: 20-40% mortality over 24 months
 * Historical: 0 occurrences (COVID was ~0.1% mortality)
 */
function applyMegaPandemicShock(state: GameState, rng: RNGFunction): GameEvent[] {
  const totalMortality = assertProbability(0.2 + rng() * 0.2, {
    location: 'applyMegaPandemicShock',
    valueName: 'totalMortality',
    month: state.currentMonth
  }); // 20-40% mortality

  const duration = assertFinite(24, {
    location: 'applyMegaPandemicShock',
    valueName: 'duration',
    month: state.currentMonth
  }); // months

  console.log(`   🦠 Mega-pandemic outbreak`);
  console.log(`   Expected mortality: ${(totalMortality * 100).toFixed(1)}% over ${duration} months`);

  // Set pandemic state (gradual mortality over 24 months)
  state.crises = state.crises || {};
  state.crises.megaPandemic = {
    active: true,
    startMonth: state.currentMonth,
    totalMortality: assertProbability(totalMortality, {
      location: 'applyMegaPandemicShock',
      valueName: 'crises.megaPandemic.totalMortality',
      month: state.currentMonth
    }),
    monthlyMortality: assertProbability(totalMortality / duration, {
      location: 'applyMegaPandemicShock',
      valueName: 'crises.megaPandemic.monthlyMortality',
      month: state.currentMonth
    }),
    socialDisruption: assertProbability(0.6, {
      location: 'applyMegaPandemicShock',
      valueName: 'crises.megaPandemic.socialDisruption',
      month: state.currentMonth
    }),
  };

  // Immediate economic shock
  if (state.globalMetrics) {
    const economicStageDecline = assertFinite(1, {
      location: 'applyMegaPandemicShock',
      valueName: 'economicStageDecline',
      month: state.currentMonth
    });

    state.globalMetrics.economicTransitionStage = assertFinite(
      Math.max(0, state.globalMetrics.economicTransitionStage - economicStageDecline),
      {
        location: 'applyMegaPandemicShock',
        valueName: 'globalMetrics.economicTransitionStage',
        month: state.currentMonth
      }
    );
  }

  // Social cohesion decline
  if (state.society) {
    const coordinationMultiplier = assertResourceAllocation(0.7, {
      location: 'applyMegaPandemicShock',
      valueName: 'coordinationMultiplier',
      month: state.currentMonth
    });

    const trustMultiplier = assertResourceAllocation(0.8, {
      location: 'applyMegaPandemicShock',
      valueName: 'trustMultiplier',
      month: state.currentMonth
    });

    state.society.coordinationCapacity = assertProbability(
      state.society.coordinationCapacity * coordinationMultiplier,
      {
        location: 'applyMegaPandemicShock',
        valueName: 'society.coordinationCapacity',
        month: state.currentMonth
      }
    );

    state.society.trustInAI = assertProbability(
      state.society.trustInAI * trustMultiplier,
      {
        location: 'applyMegaPandemicShock',
        valueName: 'society.trustInAI',
        month: state.currentMonth
      }
    );
  }

  return [{
    id: `mega_pandemic_${state.currentMonth}`,
    timestamp: state.currentMonth,
    type: 'crisis',
    severity: 'destructive',
    agent: 'exogenous',
    title: 'Mega-Pandemic (Exogenous Shock)',
    description: `Mega-pandemic outbreak: ${(totalMortality * 100).toFixed(1)}% mortality over ${duration} months`,
    effects: { totalMortality, duration }
  }];
}

/**
 * Financial Crash Shock
 * Effect: 10-20% GDP loss, unemployment spike
 * Historical: 3 occurrences (1987, 2008, 2020)
 */
function applyFinancialCrashShock(state: GameState, rng: RNGFunction): GameEvent[] {
  const gdpLoss = assertProbability(0.1 + rng() * 0.1, {
    location: 'applyFinancialCrashShock',
    valueName: 'gdpLoss',
    month: state.currentMonth
  }); // 10-20% GDP loss

  console.log(`   📉 Global financial crash`);
  console.log(`   GDP loss: ${(gdpLoss * 100).toFixed(1)}%`);

  // Economic contraction
  if (state.globalMetrics) {
    const economicStageDecline = assertFinite(1, {
      location: 'applyFinancialCrashShock',
      valueName: 'economicStageDecline',
      month: state.currentMonth
    });

    state.globalMetrics.economicTransitionStage = assertFinite(
      Math.max(0, state.globalMetrics.economicTransitionStage - economicStageDecline),
      {
        location: 'applyFinancialCrashShock',
        valueName: 'globalMetrics.economicTransitionStage',
        month: state.currentMonth
      }
    );
  }

  // Unemployment spike (Okun's law: 1% GDP loss ≈ 1.5% unemployment increase)
  if (state.society) {
    const okunMultiplier = assertFinite(1.5, {
      location: 'applyFinancialCrashShock',
      valueName: 'okunMultiplier',
      month: state.currentMonth
    });

    const unemploymentIncrease = assertProbability(gdpLoss * okunMultiplier, {
      location: 'applyFinancialCrashShock',
      valueName: 'unemploymentIncrease',
      month: state.currentMonth
    });

    const unemploymentCeiling = assertProbability(0.8, {
      location: 'applyFinancialCrashShock',
      valueName: 'unemploymentCeiling',
      month: state.currentMonth
    });

    state.society.unemploymentLevel = assertProbability(
      Math.min(unemploymentCeiling, state.society.unemploymentLevel + unemploymentIncrease),
      {
        location: 'applyFinancialCrashShock',
        valueName: 'society.unemploymentLevel',
        month: state.currentMonth
      }
    );
  }

  // QoL decline
  if (state.globalMetrics) {
    const qolMultiplier = assertResourceAllocation(1 - gdpLoss * 0.5, {
      location: 'applyFinancialCrashShock',
      valueName: 'qolMultiplier',
      month: state.currentMonth
    });

    state.globalMetrics.qualityOfLife = assertProbability(
      state.globalMetrics.qualityOfLife * qolMultiplier,
      {
        location: 'applyFinancialCrashShock',
        valueName: 'globalMetrics.qualityOfLife',
        month: state.currentMonth
      }
    );
  }

  // Social unrest
  if (state.society) {
    const coordinationMultiplier = assertResourceAllocation(0.85, {
      location: 'applyFinancialCrashShock',
      valueName: 'coordinationMultiplier',
      month: state.currentMonth
    });

    state.society.coordinationCapacity = assertProbability(
      state.society.coordinationCapacity * coordinationMultiplier,
      {
        location: 'applyFinancialCrashShock',
        valueName: 'society.coordinationCapacity',
        month: state.currentMonth
      }
    );
  }

  // AI organization funding crisis
  state.organizations.forEach(org => {
    if (org.type === 'private') {
      const fundingHitMultiplier = assertResourceAllocation(1 - gdpLoss * 2, {
        location: 'applyFinancialCrashShock',
        valueName: 'fundingHitMultiplier',
        month: state.currentMonth
      }); // AI funding hit harder (VC dries up)

      const revenueMultiplier = assertResourceAllocation(1 - gdpLoss, {
        location: 'applyFinancialCrashShock',
        valueName: 'revenueMultiplier',
        month: state.currentMonth
      });

      org.capital = assertFinite(org.capital * fundingHitMultiplier, {
        location: 'applyFinancialCrashShock',
        valueName: 'organizations[].capital',
        month: state.currentMonth
      });

      org.monthlyRevenue = assertFinite(org.monthlyRevenue * revenueMultiplier, {
        location: 'applyFinancialCrashShock',
        valueName: 'organizations[].monthlyRevenue',
        month: state.currentMonth
      });
    }
  });

  return [{
    id: `financial_crash_${state.currentMonth}`,
    timestamp: state.currentMonth,
    type: 'crisis',
    severity: 'warning',
    agent: 'exogenous',
    title: 'Global Financial Crash (Exogenous Shock)',
    description: `Financial crash: ${(gdpLoss * 100).toFixed(1)}% GDP loss`,
    effects: { gdpLoss }
  }];
}

/**
 * Regional War Shock
 * Effect: 1-5% mortality, refugee crisis
 * Historical: Multiple (Iraq War, Syrian Civil War, Ukraine War)
 */
function applyRegionalWarShock(state: GameState, rng: RNGFunction): GameEvent[] {
  const mortalityRate = 0.01 + rng() * 0.04; // 1-5% global mortality

  console.log(`   ⚔️  Regional war outbreak`);
  console.log(`   Mortality: ${(mortalityRate * 100).toFixed(1)}%`);

  // Apply mortality via centralized system
  if (state.humanPopulationSystem) {
    // Base regional war impact (1-5% global mortality)
    addMortalityRisk(state.humanPopulationSystem, {
      type: 'war',
      baseRisk: mortalityRate,
      proximate: 'war',
      root: 'conflict', // Regional conflict = geopolitical conflict
      confidence: 'MEDIUM',
      scope: 'SEMI-GLOBAL', // Regional war with global economic impact
      month: state.currentMonth,
      description: 'Regional war outbreak',
    });

    // War zones experience 5× higher mortality
    if (state.countryPopulationSystem) {
      const affectedCount = Math.floor(1 + rng() * 3);
      // PERF FIX (Nov 10, 2025): Single shuffle, no pre-sort needed (Phase 3 optimization)
      const shuffled = Object.values(state.countryPopulationSystem.countries)
        .sort(() => rng() - 0.5); // Deterministic shuffle with RNG
      for (let i = 0; i < affectedCount && i < shuffled.length; i++) {
        const country = shuffled[i];
        addMortalityRisk(state.humanPopulationSystem, {
          type: 'war',
          baseRisk: mortalityRate * 4, // Additional 4× (total 5× with base)
          proximate: 'war',
          root: 'conflict',
          confidence: 'HIGH', // Direct war zone casualties are well-documented
          scope: 'REGIONAL',
          region: country.name,
          month: state.currentMonth,
          description: `War zone: ${country.name}`,
        });
      }
    }
  }

  // Economic disruption
  if (state.globalMetrics) {
    const economicStageDecline = assertFinite(1, {
      location: 'applyRegionalWarShock',
      valueName: 'economicStageDecline',
      month: state.currentMonth
    });

    state.globalMetrics.economicTransitionStage = assertFinite(
      Math.max(0, state.globalMetrics.economicTransitionStage - economicStageDecline),
      {
        location: 'applyRegionalWarShock',
        valueName: 'globalMetrics.economicTransitionStage',
        month: state.currentMonth
      }
    );
  }

  // Refugee crisis
  if (state.refugeeCrisisSystem) {
    if (state.humanPopulationSystem?.population === undefined) {
      throw new Error('❌ state.humanPopulationSystem.population is undefined in applyRegionalWarShock:422 - initialization bug');
    }

    const displacementMultiplier = assertFinite(2, {
      location: 'applyRegionalWarShock',
      valueName: 'displacementMultiplier',
      month: state.currentMonth
    }); // 2x mortality in displacement

    const refugees = assertFinite(
      state.humanPopulationSystem.population * mortalityRate * displacementMultiplier,
      {
        location: 'applyRegionalWarShock',
        valueName: 'refugees',
        month: state.currentMonth
      }
    );

    const refugeesMillions = assertFinite(refugees / 1000000, {
      location: 'applyRegionalWarShock',
      valueName: 'refugeesMillions',
      month: state.currentMonth
    });

    state.refugeeCrisisSystem.activeRefugeeCrises.push({
      id: `war_${state.currentMonth}`,
      cause: 'war',
      startMonth: state.currentMonth,
      sourceRegion: 'conflict_zone',
      hostRegions: [],
      potentialDisplaced: refugeesMillions,
      remainingInSource: 0,
      displacedPopulation: refugeesMillions,
      currentlyDisplaced: refugeesMillions,
      resettledCount: 0,
      deathsInTransit: 0,
      displacementRate: assertProbability(0.1, {
        location: 'applyRegionalWarShock',
        valueName: 'refugeeCrisis.displacementRate',
        month: state.currentMonth
      }),
      displacementDuration: assertFinite(48, {
        location: 'applyRegionalWarShock',
        valueName: 'refugeeCrisis.displacementDuration',
        month: state.currentMonth
      }),
      displacementComplete: false,
      generationLength: assertFinite(300, {
        location: 'applyRegionalWarShock',
        valueName: 'refugeeCrisis.generationLength',
        month: state.currentMonth
      }),
      monthsActive: 0,
      resettlementProgress: 0,
      socialTension: assertProbability(0.6, {
        location: 'applyRegionalWarShock',
        valueName: 'refugeeCrisis.socialTension',
        month: state.currentMonth
      }),
      economicStrain: assertProbability(0.6, {
        location: 'applyRegionalWarShock',
        valueName: 'refugeeCrisis.economicStrain',
        month: state.currentMonth
      }),
      politicalInstability: assertProbability(0.5, {
        location: 'applyRegionalWarShock',
        valueName: 'refugeeCrisis.politicalInstability',
        month: state.currentMonth
      }),
      resettlementRate: 0.0,
      baselineResettlementRate: assertProbability(0.005, {
        location: 'applyRegionalWarShock',
        valueName: 'refugeeCrisis.baselineResettlementRate',
        month: state.currentMonth
      }),
      acceleratedResettlement: false,
      resolved: false,
      peakDisplacement: refugeesMillions,
      duration: 0
    });
  }

  // Nuclear risk increase (decrease crisis stability)
  if (state.madDeterrence) {
    const crisisStabilityDelta = assertShockMagnitude(-0.2, {
      location: 'applyRegionalWarShock',
      valueName: 'crisisStabilityDelta',
      month: state.currentMonth,
      shockType: 'regional_war'
    });

    state.madDeterrence.crisisStability = assertProbability(
      Math.max(0.0, state.madDeterrence.crisisStability + crisisStabilityDelta),
      {
        location: 'applyRegionalWarShock',
        valueName: 'madDeterrence.crisisStability',
        month: state.currentMonth
      }
    );
  }

  return [{
    id: `regional_war_${state.currentMonth}`,
    timestamp: state.currentMonth,
    type: 'crisis',
    severity: 'warning',
    agent: 'exogenous',
    title: 'Regional War (Exogenous Shock)',
    description: `Regional war outbreak: ${(mortalityRate * 100).toFixed(1)}% mortality`,
    effects: { mortality: mortalityRate }
  }];
}

/**
 * Tech Breakthrough Shock (Positive Gray Swan)
 * Effect: Unlock 1 random TIER 2-3 tech
 * Historical: 4 transformative breakthroughs (transistor, IC, internet, transformers)
 */
function applyTechBreakthroughShock(state: GameState, rng: RNGFunction): GameEvent[] {
  // PERF FIX (Nov 10, 2025): Single filter pass instead of creating Set first (Phase 3 optimization)
  // Before: 2 passes (filter for completed + map to Set, then filter for candidates)
  // After: 1 pass (filter for non-completed high-difficulty directly)
  const candidateTechs = state.technologyTree ?
    state.technologyTree.filter(tech =>
      !tech.completed &&
      (tech.difficulty === 'high' || tech.difficulty === 'very_high')
    ) : [];

  if (candidateTechs.length === 0) {
    console.log(`   ✗ No high-difficulty techs available to unlock`);
    return [];
  }

  // Randomly select one
  const index = Math.floor(rng() * candidateTechs.length);
  const selectedTech = candidateTechs[index];
  selectedTech.completed = true;
  selectedTech.progress = assertProbability(1.0, {
    location: 'applyTechBreakthroughShock',
    valueName: 'selectedTech.progress',
    month: state.currentMonth
  }); // 100% complete

  console.log(`   🔬 Breakthrough: ${selectedTech.name} unlocked`);
  console.log(`   High-difficulty technology ahead of schedule`);

  return [{
    id: `tech_breakthrough_${state.currentMonth}`,
    timestamp: state.currentMonth,
    type: 'breakthrough',
    severity: 'info',
    agent: 'exogenous',
    title: 'Technology Breakthrough (Exogenous Shock)',
    description: `Unexpected breakthrough: ${selectedTech.name} (${selectedTech.difficulty} difficulty)`,
    effects: { technology: selectedTech.name, difficulty: selectedTech.difficulty }
  }];
}

/**
 * Political Upheaval Shock
 * Effect: Regime change, institutions reset
 * Historical: Multiple (Arab Spring, Soviet collapse, color revolutions)
 */
function applyPoliticalUpheavalShock(state: GameState, rng: RNGFunction): GameEvent[] {
  console.log(`   🏛️  Political upheaval (revolution/regime change)`);

  // Institutional collapse
  if (state.government) {
    const legitimacyMultiplier = assertResourceAllocation(0.5, {
      location: 'applyPoliticalUpheavalShock',
      valueName: 'legitimacyMultiplier',
      month: state.currentMonth
    });

    state.government.legitimacy = assertProbability(
      state.government.legitimacy * legitimacyMultiplier,
      {
        location: 'applyPoliticalUpheavalShock',
        valueName: 'government.legitimacy',
        month: state.currentMonth
      }
    );

    // Determine outcome (democracy or autocracy)
    // society and globalMetrics are always initialized
    if (!state.society) {
      throw new Error(`❌ state.society is undefined at month ${state.currentMonth} in ExogenousShockPhase.applyPoliticalUpheaval`);
    }
    if (state.society.coordinationCapacity === undefined) {
      throw new Error(`❌ state.society.coordinationCapacity is undefined at month ${state.currentMonth} in ExogenousShockPhase.applyPoliticalUpheaval`);
    }
    const coordinationCapacity = assertProbability(state.society.coordinationCapacity, {
      location: 'applyPoliticalUpheavalShock',
      valueName: 'coordinationCapacity',
      month: state.currentMonth
    });

    if (!state.globalMetrics) {
      throw new Error(`❌ state.globalMetrics is undefined at month ${state.currentMonth} in ExogenousShockPhase.applyPoliticalUpheaval`);
    }
    if (state.globalMetrics.informationIntegrity === undefined) {
      throw new Error(`❌ state.globalMetrics.informationIntegrity is undefined at month ${state.currentMonth} in ExogenousShockPhase.applyPoliticalUpheaval`);
    }
    const informationIntegrity = assertProbability(state.globalMetrics.informationIntegrity, {
      location: 'applyPoliticalUpheavalShock',
      valueName: 'informationIntegrity',
      month: state.currentMonth
    });

    const democratizationChance = assertProbability(
      coordinationCapacity * informationIntegrity,
      {
        location: 'applyPoliticalUpheavalShock',
        valueName: 'democratizationChance',
        month: state.currentMonth
      }
    );

    const democratizes = rng() < democratizationChance;

    if (democratizes) {
      console.log(`   ✓ Democratization (Arab Spring scenario)`);
      state.government.governmentType = 'democratic';
    } else {
      console.log(`   ✗ Authoritarian takeover`);
      state.government.governmentType = 'authoritarian';
    }
  }

  // Social cohesion shock
  if (state.society) {
    const coordinationMultiplier = assertResourceAllocation(0.7, {
      location: 'applyPoliticalUpheavalShock',
      valueName: 'coordinationMultiplier',
      month: state.currentMonth
    });

    const trustMultiplier = assertResourceAllocation(0.8, {
      location: 'applyPoliticalUpheavalShock',
      valueName: 'trustMultiplier',
      month: state.currentMonth
    });

    state.society.coordinationCapacity = assertProbability(
      state.society.coordinationCapacity * coordinationMultiplier,
      {
        location: 'applyPoliticalUpheavalShock',
        valueName: 'society.coordinationCapacity',
        month: state.currentMonth
      }
    );

    state.society.trustInAI = assertProbability(
      state.society.trustInAI * trustMultiplier,
      {
        location: 'applyPoliticalUpheavalShock',
        valueName: 'society.trustInAI',
        month: state.currentMonth
      }
    );
  }

  // Economic disruption
  if (state.globalMetrics) {
    const economicStageDecline = assertFinite(1, {
      location: 'applyPoliticalUpheavalShock',
      valueName: 'economicStageDecline',
      month: state.currentMonth
    });

    state.globalMetrics.economicTransitionStage = assertFinite(
      Math.max(0, state.globalMetrics.economicTransitionStage - economicStageDecline),
      {
        location: 'applyPoliticalUpheavalShock',
        valueName: 'globalMetrics.economicTransitionStage',
        month: state.currentMonth
      }
    );
  }

  return [{
    id: `political_upheaval_${state.currentMonth}`,
    timestamp: state.currentMonth,
    type: 'crisis',
    severity: 'warning',
    agent: 'exogenous',
    title: 'Political Upheaval (Exogenous Shock)',
    description: `Political upheaval: regime change`,
    effects: {}
  }];
}

/**
 * Helper function to calculate total capability from profile
 * NOTE: capabilityProfile is ALWAYS initialized with ALL fields for every AI agent
 */
function calculateTotalCapability(profile: any): number {
  // All capability fields are always initialized - validate they exist
  if (typeof profile.physical !== 'number') {
    throw new Error('❌ profile.physical is not a number - capabilityProfile initialization bug');
  }
  if (typeof profile.digital !== 'number') {
    throw new Error('❌ profile.digital is not a number - capabilityProfile initialization bug');
  }
  if (typeof profile.cognitive !== 'number') {
    throw new Error('❌ profile.cognitive is not a number - capabilityProfile initialization bug');
  }
  if (typeof profile.social !== 'number') {
    throw new Error('❌ profile.social is not a number - capabilityProfile initialization bug');
  }
  if (typeof profile.economic !== 'number') {
    throw new Error('❌ profile.economic is not a number - capabilityProfile initialization bug');
  }
  if (typeof profile.selfImprovement !== 'number') {
    throw new Error('❌ profile.selfImprovement is not a number - capabilityProfile initialization bug');
  }

  const physical = profile.physical;
  const digital = profile.digital;
  const cognitive = profile.cognitive;
  const social = profile.social;
  const economic = profile.economic;
  const selfImprovement = profile.selfImprovement;

  // Research capabilities (flatten to single value) - all always initialized
  if (!profile.research) {
    throw new Error('❌ profile.research is undefined - capabilityProfile initialization bug');
  }
  const research = profile.research;

  if (!research.biotech) {
    throw new Error('❌ research.biotech is undefined - capabilityProfile initialization bug');
  }
  // FIX (Nov 7, 2025): Sort for deterministic reduce order (Issue #11)
  const biotechKeys = Object.keys(research.biotech).sort();
  const biotech = biotechKeys.reduce((a: number, k) => a + ((research.biotech as any)[k] as number), 0) / 4;

  if (!research.materials) {
    throw new Error('❌ research.materials is undefined - capabilityProfile initialization bug');
  }
  const materialsKeys = Object.keys(research.materials).sort();
  const materials = materialsKeys.reduce((a: number, k) => a + ((research.materials as any)[k] as number), 0) / 3;

  if (!research.climate) {
    throw new Error('❌ research.climate is undefined - capabilityProfile initialization bug');
  }
  const climateKeys = Object.keys(research.climate).sort();
  const climate = climateKeys.reduce((a: number, k) => a + ((research.climate as any)[k] as number), 0) / 3;

  if (!research.computerScience) {
    throw new Error('❌ research.computerScience is undefined - capabilityProfile initialization bug');
  }
  const csKeys = Object.keys(research.computerScience).sort();
  const computerScience = csKeys.reduce((a: number, k) => a + ((research.computerScience as any)[k] as number), 0) / 3;

  const avgResearch = (biotech + materials + climate + computerScience) / 4;

  // Weighted average
  return (physical * 0.15 + digital * 0.15 + cognitive * 0.15 + social * 0.15 +
          economic * 0.1 + selfImprovement * 0.2 + avgResearch * 0.1);
}

/**
 * Exogenous Shock Phase
 *
 * Checks for rare unpredictable events outside the modeled state space.
 * Order: 27.5 (after crisis detection at 36.0, before outcomes)
 */
export class ExogenousShockPhase implements SimulationPhase {
  readonly id = 'exogenous-shocks';
  readonly name = 'Exogenous Shock Detection';
  readonly order = 27.5;

  // DEPENDENCIES (Nov 6, 2025): Requires environmental state for shock probability
  readonly dependencies = [
    'planetary_boundaries',     // Order 21.0: Environmental fragility increases shock risk
    'bifurcation-logic',        // Nov 14, 2025 - CRITICAL-1 fix: explicit bifurcation dependency
  ];

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    const events: GameEvent[] = [];
    setDeterministicRng(rng);

    // Historical mode: Skip random exogenous shocks - we model actual historical events only
    // Research simulations should compare to real history, not random alternative timelines
    if (isHistoricalModeActive(state)) {
      // TODO: Could add ACTUAL historical events here (Gulf War 1990-1991, 9/11 2001, etc.)
      // For now, skip random shock generation entirely
      console.log(`[ExogenousShockPhase] Skipping random shocks in historical mode (month ${state.currentMonth})`);
      return { events: [] };
    }

    // === BIFURCATION VARIANCE AMPLIFICATION ===
    // Near critical thresholds → 10× variance amplification
    // Far from thresholds → 1× (no effect)
    // This creates path-dependent Monte Carlo trajectories
    const varianceAmp = assertFinite(state.bifurcationState.varianceAmplification, {
      location: 'ExogenousShockPhase.execute',
      valueName: 'varianceAmplification',
      month: state.currentMonth,
      additionalInfo: { expectedSource: 'BifurcationLogicPhase (order 4.5)' }
    });

    // HISTORICAL MODE (Nov 27, 2025): Dampen crisis systems for hindcast validation
    // Research: research/historical_mode_parameters_20251127.md
    // Root cause: Crisis-calibrated systems produce massive errors on baseline period (1990-2024)
    // CRITICAL-1 FIX (Nov 28, 2025): Unified historical mode detection via isHistoricalModeActive()
    // Solution: Disable extreme shocks (nuclear/asteroid), reduce gray swan frequency by 90%
    if (isHistoricalModeActive(state)) {
      console.log(`[ExogenousShockPhase] Historical dampening active (month ${state.currentMonth})`);

      // BLACK SWAN: DISABLED in historical mode (no nuclear war or asteroids in 1990-2024)
      // These are too extreme for baseline validation period

      // GRAY SWAN: Reduced by 90% (0.01 → 0.001 per month)
      // Allows some economic/political shocks but at realistic historical frequency
      const graySwanProb = assertProbability(0.001 * varianceAmp, {
        location: 'ExogenousShockPhase.execute (historicalMode)',
        valueName: 'graySwanProb',
        month: state.currentMonth
      }); // 90% reduction

      if (rng() < graySwanProb) {
        // Only financial crashes and political upheavals allowed in historical mode
        // (no regional wars - those distort population trajectories)
        const graySwans = [
          ShockType.FINANCIAL_CRASH,
          ShockType.POLITICAL_UPHEAVAL,
        ];

        const index = Math.floor(rng() * graySwans.length);
        const shock = graySwans[index];
        events.push(...applyExogenousShock(state, shock, rng));

        return {
          events,
          metadata: {
            shockTriggered: shock,
            severity: 'major-recoverable',
            historicalDampening: true,
          },
        };
      }

      return {
        events: [],
        metadata: {
          shockTriggered: null,
          historicalDampening: true,
        },
      };
    }

    // BLACK SWAN: 0.1% per month (~1% per year) × bifurcation amplification
    // Near collapse thresholds: 10× more likely (models critical instability)
    const blackSwanProb = 0.001 * varianceAmp;
    if (rng() < blackSwanProb) {
      const blackSwans = [
        ShockType.NUCLEAR_WAR,
        ShockType.AGI_BREAKTHROUGH,
        ShockType.ASTEROID_IMPACT,
        ShockType.MEGA_PANDEMIC,
      ];

      const index = Math.floor(rng() * blackSwans.length);
      const shock = blackSwans[index];
      events.push(...applyExogenousShock(state, shock, rng));

      return {
        events,
        metadata: {
          shockTriggered: shock,
          severity: 'civilization-altering',
        },
      };
    }

    // GRAY SWAN: 1% per month (~10% per year) × bifurcation amplification
    // Near thresholds: higher probability of major disruptions
    const graySwanProb = 0.01 * varianceAmp;
    if (rng() < graySwanProb) {
      const graySwans = [
        ShockType.FINANCIAL_CRASH,
        ShockType.REGIONAL_WAR,
        ShockType.TECH_BREAKTHROUGH,
        ShockType.POLITICAL_UPHEAVAL,
      ];

      const index = Math.floor(rng() * graySwans.length);
      const shock = graySwans[index];
      events.push(...applyExogenousShock(state, shock, rng));

      return {
        events,
        metadata: {
          shockTriggered: shock,
          severity: 'major-recoverable',
        },
      };
    }

    return {
      events: [],
      metadata: {
        shockTriggered: null,
      },
    };
  }
}
