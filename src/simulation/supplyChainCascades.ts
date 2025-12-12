/**
 * Supply Chain Cascade Propagation
 *
 * Models fast-timescale cascade failures (days-to-weeks) through:
 * - Just-in-time manufacturing vulnerabilities
 * - Geographic chokepoint failures
 * - Infrastructure interdependence cascades (power→water→food→healthcare)
 * - Finance-supply chain feedback loops
 *
 * Research: research/supply_chain_cascades_20251212.md
 * Critique: reviews/supply_chain_cascades_critique_20251212.md (QG1: Grade B)
 * Priority: HIGH (Session 70 identified collapse scenarios 2-5x too slow)
 *
 * Key Parameters:
 * - Infrastructure cascade multiplier: 5× (One Earth 2024)
 * - Cascade spread probability: 74% (Nirandjan et al. 2024)
 * - Texas 2021 validation: 3-day power → 12M water → $195B damages
 * - Suez 2024 validation: 64% transit decline → 158-246% rate increase
 */

import { GameState } from '../types/game';
import { assertFinite, assertStateProperty } from './utils/assertions';

/**
 * Supply Chain Cascades State
 *
 * Tracks four cascade types operating on fast (days-weeks) timescales.
 */
export interface SupplyChainCascadesState {
  // Just-in-time manufacturing vulnerabilities
  justInTime: {
    semiconductorBuffer_months: number;  // Buffer stock (0-12 months)
    rareEarthBuffer_months: number;     // Rare earth buffer (0-12 months)
    criticalInputsBuffer_months: number; // Generic critical inputs (0-12 months)
    disruptionActive: boolean;          // Is cascade active?
    daysUntilCascade: number;           // Days until JIT buffer exhausted (if disruption active)
  };

  // Single points of failure (geographic chokepoints)
  chokepoints: {
    suezStatus: 'open' | 'restricted' | 'closed';
    panamaStatus: 'open' | 'restricted' | 'closed';
    malaccaStatus: 'open' | 'restricted' | 'closed';
    taiwanSemiconductorCapacity: number;  // 0-1 (% of normal capacity)
  };

  // Infrastructure cascades (power→water→food→healthcare)
  infrastructure: {
    powerGridStatus: number;      // 0-1 (% operational)
    waterSystemStatus: number;    // 0-1 (% operational)
    foodSystemStatus: number;     // 0-1 (% operational)
    healthcareSystemStatus: number; // 0-1 (% operational)
    cascadeActive: boolean;       // Is cascade propagating?
    hoursInCascade: number;       // Hours since cascade started
  };

  // Finance cascades (credit→JIT→employment)
  finance: {
    creditAvailability: number;   // 0-1 (% of normal credit)
    paymentSystemStatus: number;  // 0-1 (% operational)
    cashReservesDepletion: number; // 0-1 (0=full reserves, 1=depleted)
    employmentCascadeActive: boolean;
  };
}

/**
 * Initialize supply chain cascades state
 *
 * Conservative baseline: Normal operations, no active cascades
 */
export function initializeSupplyChainCascades(): SupplyChainCascadesState {
  return {
    justInTime: {
      semiconductorBuffer_months: 2,  // Current JIT reality: days-to-weeks
      rareEarthBuffer_months: 3,
      criticalInputsBuffer_months: 2,
      disruptionActive: false,
      daysUntilCascade: 0,
    },
    chokepoints: {
      suezStatus: 'open',
      panamaStatus: 'open',
      malaccaStatus: 'open',
      taiwanSemiconductorCapacity: 1.0,
    },
    infrastructure: {
      powerGridStatus: 1.0,
      waterSystemStatus: 1.0,
      foodSystemStatus: 1.0,
      healthcareSystemStatus: 1.0,
      cascadeActive: false,
      hoursInCascade: 0,
    },
    finance: {
      creditAvailability: 1.0,
      paymentSystemStatus: 1.0,
      cashReservesDepletion: 0,
      employmentCascadeActive: false,
    },
  };
}

/**
 * Update supply chain cascades
 *
 * Main entry point for cascade propagation modeling.
 * Called once per month during simulation step.
 *
 * @param state - Game state (will be mutated)
 * @param rng - Deterministic RNG function (REQUIRED for reproducibility)
 */
export function updateSupplyChainCascades(
  state: GameState,
  rng: () => number
): void {
  // RNG is REQUIRED for deterministic Monte Carlo validation
  if (!rng || typeof rng !== 'function') {
    throw new Error('❌ CRITICAL: RNG required for deterministic supply chain cascade modeling');
  }

  // Initialize state if not present (backward compatibility)
  if (!state.supplyChainCascades) {
    (state as any).supplyChainCascades = initializeSupplyChainCascades();
  }

  const cascades = state.supplyChainCascades!;  // Non-null assertion: just initialized above

  // Phase 1: Check for trigger conditions
  checkTriggerConditions(state, cascades, rng);

  // Phase 2: Propagate infrastructure cascades (fast timescale: days-weeks)
  updateInfrastructureCascades(state, cascades);

  // Phase 3: Model JIT buffer exhaustion
  updateJITBuffers(state, cascades, rng);

  // Phase 4: Update chokepoint status and impacts
  updateChokepoints(state, cascades, rng);

  // Phase 5: Model finance cascades
  updateFinanceCascades(state, cascades);

  // Phase 6: Apply economic/social impacts
  applyEconomicImpacts(state, cascades);

  // Phase 7: Model recovery (sequential restoration)
  modelRecovery(state, cascades);
}

/**
 * Check for cascade trigger conditions
 *
 * Triggers include:
 * - Infrastructure degradation (energy grid failure)
 * - Geopolitical conflicts (chokepoint disruptions)
 * - Economic shocks (financial system stress)
 */
function checkTriggerConditions(
  state: GameState,
  cascades: SupplyChainCascadesState,
  rng: () => number
): void {
  // Read power grid status from energy budget (if exists)
  if (state.energyBudget?.globalCapacity) {
    // Grid efficiency degrades if clean energy < 40% or growth rate negative
    const cleanShare = state.energyBudget.globalCapacity.cleanTWh /
                       state.energyBudget.globalCapacity.totalTWh;
    const growthRate = state.energyBudget.globalCapacity.growthRate;

    // Power grid degradation triggers if clean share low OR negative growth
    if (cleanShare < 0.4 || growthRate < 0) {
      const degradationAmount = Math.max(
        (0.4 - cleanShare) * 0.5,  // Clean energy shortfall
        Math.abs(Math.min(0, growthRate)) * 0.1  // Negative growth impact
      );
      cascades.infrastructure.powerGridStatus = Math.max(
        0,
        cascades.infrastructure.powerGridStatus - degradationAmount
      );
    }
  }

  // Check geopolitical conflicts for chokepoint disruptions
  if (state.geopoliticalConflict) {
    const tension = state.geopoliticalConflict.tension / 100;  // Normalize to [0,1]

    // Suez/Middle East correlation (simplified - treat as regional risk proxy)
    if (tension > 0.6) {
      const roll = rng();
      if (roll < tension * 0.1) {  // 10% max monthly disruption probability
        cascades.chokepoints.suezStatus = 'restricted';
        console.log(`\n🌍📦 SUEZ CANAL RESTRICTED (Month ${state.currentMonth})`);
        console.log(`   Geopolitical tension: ${(tension * 100).toFixed(0)}%`);
      }
    }

    // Taiwan semiconductor capacity affected by regional conflict
    if (tension > 0.7) {
      const capacityLoss = Math.min(0.5, (tension - 0.7) * 0.5);  // Max 50% loss
      cascades.chokepoints.taiwanSemiconductorCapacity = Math.max(
        0.5,
        1.0 - capacityLoss
      );
    }
  }

  // Check for economic shocks (credit availability collapse)
  if (state.globalMetrics.socialStability < 50) {
    const stabilityShock = (50 - state.globalMetrics.socialStability) / 50;
    cascades.finance.creditAvailability = Math.max(
      0.3,  // Floor at 30%
      1.0 - stabilityShock * 0.3
    );
  }
}

/**
 * Update infrastructure cascades (power→water→food→healthcare)
 *
 * Research: One Earth 2024 - 5× cascade multiplier, 74% spread probability
 * Validation: Texas 2021 - 3-day power → 12M water disruption
 */
function updateInfrastructureCascades(
  state: GameState,
  cascades: SupplyChainCascadesState
): void {
  const infra = cascades.infrastructure;

  // Check if cascade should activate
  if (infra.powerGridStatus < 0.7 && !infra.cascadeActive) {
    infra.cascadeActive = true;
    infra.hoursInCascade = 0;
    console.log(`\n⚡💥 INFRASTRUCTURE CASCADE ACTIVATED (Month ${state.currentMonth})`);
    console.log(`   Power grid status: ${(infra.powerGridStatus * 100).toFixed(0)}%`);
  }

  if (infra.cascadeActive) {
    // Increment cascade timer (720 hours per month)
    infra.hoursInCascade += 720;

    // Power → Water cascade (hours timescale)
    if (infra.hoursInCascade > 24) {  // After 24 hours
      const waterDegradation = (1.0 - infra.powerGridStatus) * 0.1;  // 10% per month at 0% power
      infra.waterSystemStatus = Math.max(
        0,
        infra.waterSystemStatus - waterDegradation
      );
    }

    // Water → Food cascade (days timescale)
    if (infra.hoursInCascade > 72 && infra.waterSystemStatus < 0.7) {  // After 3 days
      const foodDegradation = (1.0 - infra.waterSystemStatus) * 0.08;  // 8% per month
      infra.foodSystemStatus = Math.max(
        0,
        infra.foodSystemStatus - foodDegradation
      );
    }

    // Food → Healthcare cascade (days timescale)
    if (infra.hoursInCascade > 168 && infra.foodSystemStatus < 0.7) {  // After 7 days
      const healthcareDegradation = (1.0 - infra.foodSystemStatus) * 0.05;  // 5% per month
      infra.healthcareSystemStatus = Math.max(
        0,
        infra.healthcareSystemStatus - healthcareDegradation
      );
    }

    // Log cascade progression
    if (infra.hoursInCascade % 720 === 0) {  // Every month
      console.log(`\n⚡💧 INFRASTRUCTURE CASCADE (Month ${state.currentMonth})`);
      console.log(`   Power: ${(infra.powerGridStatus * 100).toFixed(0)}%`);
      console.log(`   Water: ${(infra.waterSystemStatus * 100).toFixed(0)}%`);
      console.log(`   Food: ${(infra.foodSystemStatus * 100).toFixed(0)}%`);
      console.log(`   Healthcare: ${(infra.healthcareSystemStatus * 100).toFixed(0)}%`);
    }
  }
}

/**
 * Update JIT buffer exhaustion
 *
 * Research: Supply Chain Dive 2024 - JIT buffers reduced to "days or even hours"
 * Critical threshold: Below 0.5 months triggers production disruptions
 */
function updateJITBuffers(
  state: GameState,
  cascades: SupplyChainCascadesState,
  rng: () => number
): void {
  const jit = cascades.justInTime;

  // Check if disruption is active (chokepoint closed OR geopolitical conflict)
  const chokepointDisrupted =
    cascades.chokepoints.suezStatus === 'closed' ||
    cascades.chokepoints.panamaStatus === 'closed' ||
    cascades.chokepoints.malaccaStatus === 'closed' ||
    cascades.chokepoints.taiwanSemiconductorCapacity < 0.5;

  const conflictActive = state.geopoliticalConflict?.activeConflicts?.conventional > 0;

  if (chokepointDisrupted || conflictActive) {
    jit.disruptionActive = true;

    // Deplete buffers (monthly depletion rate)
    jit.semiconductorBuffer_months = Math.max(0, jit.semiconductorBuffer_months - 0.5);
    jit.rareEarthBuffer_months = Math.max(0, jit.rareEarthBuffer_months - 0.3);
    jit.criticalInputsBuffer_months = Math.max(0, jit.criticalInputsBuffer_months - 0.4);

    // Calculate days until cascade (when buffer < 0.5 months)
    const criticalBuffer = Math.min(
      jit.semiconductorBuffer_months,
      jit.rareEarthBuffer_months,
      jit.criticalInputsBuffer_months
    );
    jit.daysUntilCascade = criticalBuffer * 30;  // Convert months to days

    // Log buffer status
    if (jit.semiconductorBuffer_months < 1.0) {
      console.log(`\n📦⚠️ JIT BUFFER DEPLETION (Month ${state.currentMonth})`);
      console.log(`   Semiconductor: ${jit.semiconductorBuffer_months.toFixed(1)} months`);
      console.log(`   Rare Earth: ${jit.rareEarthBuffer_months.toFixed(1)} months`);
      console.log(`   Critical Inputs: ${jit.criticalInputsBuffer_months.toFixed(1)} months`);
      console.log(`   Days until cascade: ${jit.daysUntilCascade.toFixed(0)}`);
    }
  } else {
    // Recovery: Slowly refill buffers when disruption ends
    if (jit.disruptionActive && !chokepointDisrupted && !conflictActive) {
      console.log(`\n📦✅ JIT BUFFER RECOVERY BEGINS (Month ${state.currentMonth})`);
    }
    jit.disruptionActive = false;

    // Refill at 0.2 months/month (5 months to full recovery)
    jit.semiconductorBuffer_months = Math.min(2.0, jit.semiconductorBuffer_months + 0.2);
    jit.rareEarthBuffer_months = Math.min(3.0, jit.rareEarthBuffer_months + 0.2);
    jit.criticalInputsBuffer_months = Math.min(2.0, jit.criticalInputsBuffer_months + 0.2);
    jit.daysUntilCascade = 0;
  }
}

/**
 * Update chokepoint status and impacts
 *
 * Research: Drewry/UNCTAD 2024 - 64% transit decline, 158-246% rate increase
 */
function updateChokepoints(
  state: GameState,
  cascades: SupplyChainCascadesState,
  rng: () => number
): void {
  // Chokepoint recovery (probability-based)
  if (cascades.chokepoints.suezStatus === 'restricted') {
    // 20% monthly chance of recovery if tension drops
    const tension = assertStateProperty(state, 'geopoliticalConflict.tension', {
      location: 'updateChokepoints',
      month: state.currentMonth
    }) / 100;
    if (rng() > tension) {
      cascades.chokepoints.suezStatus = 'open';
      console.log(`\n🌍✅ SUEZ CANAL REOPENED (Month ${state.currentMonth})`);
    }
  }

  // Taiwan semiconductor recovery (gradual)
  if (cascades.chokepoints.taiwanSemiconductorCapacity < 1.0) {
    const tension = assertStateProperty(state, 'geopoliticalConflict.tension', {
      location: 'updateChokepoints',
      month: state.currentMonth
    }) / 100;
    if (tension < 0.5) {
      cascades.chokepoints.taiwanSemiconductorCapacity = Math.min(
        1.0,
        cascades.chokepoints.taiwanSemiconductorCapacity + 0.1
      );
    }
  }
}

/**
 * Update finance cascades (credit→JIT→employment)
 *
 * Research: Texas 2021 - Economic cascade from infrastructure failure
 */
function updateFinanceCascades(
  state: GameState,
  cascades: SupplyChainCascadesState
): void {
  const finance = cascades.finance;

  // Credit availability affects payment systems
  if (finance.creditAvailability < 0.7) {
    const paymentDegradation = (1.0 - finance.creditAvailability) * 0.05;
    finance.paymentSystemStatus = Math.max(
      0.5,  // Floor at 50%
      finance.paymentSystemStatus - paymentDegradation
    );
  } else {
    // Recovery when credit restores
    finance.paymentSystemStatus = Math.min(
      1.0,
      finance.paymentSystemStatus + 0.1
    );
  }

  // Cash reserves deplete if credit unavailable
  if (finance.creditAvailability < 0.5) {
    finance.cashReservesDepletion = Math.min(
      1.0,
      finance.cashReservesDepletion + 0.05
    );
  } else {
    // Slow recovery
    finance.cashReservesDepletion = Math.max(
      0,
      finance.cashReservesDepletion - 0.02
    );
  }

  // Employment cascade activates if cash reserves depleted
  if (finance.cashReservesDepletion > 0.5 && !finance.employmentCascadeActive) {
    finance.employmentCascadeActive = true;
    console.log(`\n💰📉 EMPLOYMENT CASCADE ACTIVATED (Month ${state.currentMonth})`);
    console.log(`   Cash reserves depleted: ${(finance.cashReservesDepletion * 100).toFixed(0)}%`);
  }

  if (finance.employmentCascadeActive && finance.cashReservesDepletion < 0.3) {
    finance.employmentCascadeActive = false;
    console.log(`\n💰✅ EMPLOYMENT CASCADE ENDED (Month ${state.currentMonth})`);
  }
}

/**
 * Apply economic/social impacts from cascades
 *
 * Research: Texas 2021 - $195B damages from 3-day power failure
 * Conservative parameters - research-backed, not disaster porn
 */
function applyEconomicImpacts(
  state: GameState,
  cascades: SupplyChainCascadesState
): void {
  const infra = cascades.infrastructure;
  const jit = cascades.justInTime;
  const finance = cascades.finance;

  // Manufacturing capacity impact from infrastructure cascades
  if (infra.cascadeActive) {
    const cascadeImpact = 1.0 - (
      (infra.powerGridStatus +
       infra.waterSystemStatus +
       infra.foodSystemStatus +
       infra.healthcareSystemStatus) / 4
    );

    // Conservative: Max 20% manufacturing reduction per month (multiplicative)
    const manufacturingMultiplier = Math.max(0.8, 1.0 - (cascadeImpact * 0.2));
    state.globalMetrics.manufacturingCapability = Math.max(
      0,
      state.globalMetrics.manufacturingCapability * manufacturingMultiplier
    );
  }

  // Manufacturing capacity impact from JIT buffer exhaustion
  if (jit.disruptionActive && jit.daysUntilCascade < 15) {
    // Production disruption when buffers near exhaustion
    const bufferImpact = (15 - jit.daysUntilCascade) / 15;
    const manufacturingMultiplier = 1.0 - (bufferImpact * 0.1);  // Max 10% reduction
    state.globalMetrics.manufacturingCapability = Math.max(
      0,
      state.globalMetrics.manufacturingCapability * manufacturingMultiplier
    );
  }

  // Social stability impact from cascades
  if (infra.cascadeActive) {
    const stabilityHit = (1.0 - infra.healthcareSystemStatus) * 5;  // Max 5 points
    state.globalMetrics.socialStability = Math.max(
      0,
      state.globalMetrics.socialStability - stabilityHit
    );
  }

  // Quality of Life impact from infrastructure degradation
  if (infra.waterSystemStatus < 0.7 || infra.foodSystemStatus < 0.7) {
    const qolMultiplier = Math.min(
      infra.waterSystemStatus,
      infra.foodSystemStatus
    );

    // QoL degradation proportional to infrastructure loss
    const qolHit = (1.0 - qolMultiplier) * 0.02;  // Max 2% per month
    state.globalMetrics.qualityOfLife = assertFinite(
      Math.max(0, state.globalMetrics.qualityOfLife - qolHit),
      {
        location: 'applyEconomicImpacts',
        valueName: 'qualityOfLife',
        month: state.currentMonth,
        additionalInfo: {
          waterStatus: infra.waterSystemStatus,
          foodStatus: infra.foodSystemStatus,
          qolHit
        }
      }
    );
  }

  // Population impact from healthcare cascade (conservative)
  if (infra.healthcareSystemStatus < 0.5) {
    const mortalityIncrease = (1.0 - infra.healthcareSystemStatus) * 0.001;  // Max 0.1% per month
    const populationLoss = state.humanPopulationSystem.population * mortalityIncrease;
    state.humanPopulationSystem.population = Math.max(
      0.00001,  // Extinction threshold (10K people)
      state.humanPopulationSystem.population - populationLoss
    );
  }

  // Crisis resilience impact from finance cascades
  if (finance.employmentCascadeActive) {
    const resilienceHit = finance.cashReservesDepletion * 0.1;  // Max 10% reduction
    state.globalMetrics.crisisResilience = assertFinite(
      Math.max(0, state.globalMetrics.crisisResilience - resilienceHit),
      {
        location: 'applyEconomicImpacts',
        valueName: 'crisisResilience',
        month: state.currentMonth,
        additionalInfo: {
          cashReservesDepletion: finance.cashReservesDepletion
        }
      }
    );
  }
}

/**
 * Model recovery (sequential restoration)
 *
 * Research: Texas 2021 - Power must restore before water, water before food
 * Infrastructure must restore sequentially, not in parallel
 */
function modelRecovery(
  state: GameState,
  cascades: SupplyChainCascadesState
): void {
  const infra = cascades.infrastructure;

  // Power grid recovery (if social stability restoring)
  if (state.globalMetrics.socialStability > 50 && infra.powerGridStatus < 1.0) {
    const recoveryRate = 0.1;  // 10% per month (10 months to full recovery)
    infra.powerGridStatus = Math.min(1.0, infra.powerGridStatus + recoveryRate);
  }

  // Sequential recovery: Water can only recover if power restored
  if (infra.powerGridStatus > 0.8 && infra.waterSystemStatus < 1.0) {
    const recoveryRate = 0.15;  // Faster recovery (7 months)
    infra.waterSystemStatus = Math.min(1.0, infra.waterSystemStatus + recoveryRate);
  }

  // Sequential recovery: Food can only recover if water restored
  if (infra.waterSystemStatus > 0.8 && infra.foodSystemStatus < 1.0) {
    const recoveryRate = 0.2;  // 5 months to recovery
    infra.foodSystemStatus = Math.min(1.0, infra.foodSystemStatus + recoveryRate);
  }

  // Sequential recovery: Healthcare can only recover if food restored
  if (infra.foodSystemStatus > 0.8 && infra.healthcareSystemStatus < 1.0) {
    const recoveryRate = 0.1;  // 10 months to recovery (slowest - includes backlog)
    infra.healthcareSystemStatus = Math.min(1.0, infra.healthcareSystemStatus + recoveryRate);
  }

  // Deactivate cascade if all systems recovered
  if (infra.cascadeActive &&
      infra.powerGridStatus > 0.95 &&
      infra.waterSystemStatus > 0.95 &&
      infra.foodSystemStatus > 0.95 &&
      infra.healthcareSystemStatus > 0.95) {
    infra.cascadeActive = false;
    infra.hoursInCascade = 0;
    console.log(`\n✅ INFRASTRUCTURE CASCADE ENDED (Month ${state.currentMonth})`);
    console.log(`   All systems restored to >95%`);
  }

  // Manufacturing capacity recovery (slow multiplicative growth)
  if (!infra.cascadeActive &&
      !cascades.justInTime.disruptionActive &&
      state.globalMetrics.manufacturingCapability < 10) {
    const recoveryMultiplier = 1.02;  // 2% growth per month
    state.globalMetrics.manufacturingCapability = Math.min(
      10,
      state.globalMetrics.manufacturingCapability * recoveryMultiplier
    );
  }
}
