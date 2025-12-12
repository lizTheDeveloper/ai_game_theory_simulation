/**
 * Supply Chain Cascade Propagation
 *
 * Models fast-cascade failure modes (days-to-weeks) distinct from slow climate tipping (decades-centuries).
 * Critical blind spot: Current collapse scenarios 2-5x too slow due to missing cascade mechanics.
 *
 * Four subsystems:
 * 1. Just-in-time buffer exhaustion: 1-7 days inventory (vs historical 90 days), critical threshold
 * 2. Single points of failure: Geographic chokepoints (Suez, Panama), semiconductor supply
 * 3. Infrastructure cascades: Power → Water → Food → Healthcare (5x multiplier, 74% spread)
 * 4. Finance cascades: Credit freeze → JIT manufacturing halt (conservative modeling)
 *
 * Research: research/supply_chain_cascades_20251212.md (One Earth 2024, Texas freeze 2021, Suez 2024)
 * Validation: reviews/supply_chain_cascades_critique_20251212.md (Quality Gate 1 PASSED, Grade A-)
 * Expected impact: Collapse scenarios 2-5x faster, realistic cascade propagation timescales
 */

import type { GameState } from '@/types/game';
import {
  assertFinite,
  assertStateProperty,
  assertProbability,
  assertInRange,
  assertDefined
} from '@/simulation/utils/assertions';

/**
 * Main entry point for supply chain cascade updates
 *
 * @param state - Game state (mutated directly)
 * @param rng - REQUIRED deterministic RNG function (NEVER optional)
 */
export function updateSupplyChainCascades(
  state: GameState,
  rng: () => number
): void {
  // CRITICAL: Validate RNG is provided (no silent fallback to Math.random)
  if (!rng || typeof rng !== 'function') {
    throw new Error('❌ CRITICAL: RNG required for deterministic supply chain cascade simulation');
  }

  // Update all subsystems in order
  updateJustInTimeBuffers(state, rng);
  checkSinglePointFailures(state, rng);
  propagateInfrastructureCascades(state, rng);
  propagateFinanceCascades(state, rng);
  applyCompoundCascadeEffects(state);
}

/**
 * Update just-in-time inventory buffers and detect exhaustion
 *
 * Research: Supply Chain Dive 2024 - "days to hours" of inventory (vs historical 90 days)
 * Critical threshold: Below several days → uncontrolled delay propagation
 * 64% shifting to just-in-case (10-15% buffer stock) but 36% still vulnerable
 */
function updateJustInTimeBuffers(state: GameState, rng: () => number): void {
  const cascades = assertDefined(state.supplyChainCascades, {
    location: 'updateJustInTimeBuffers',
    valueName: 'supplyChainCascades',
    month: state.currentMonth
  });

  const jitVuln = assertDefined(cascades.justInTimeVulnerability, {
    location: 'updateJustInTimeBuffers',
    valueName: 'justInTimeVulnerability',
    month: state.currentMonth
  });

  // Buffer depletion from active crises
  let depletionRate = 0.0;

  // Climate crises deplete buffers (shipping delays, production disruptions)
  // Use climateStability as proxy (1.0 = stable, 0 = unstable)
  const climateRisk = 1.0 - state.environmentalAccumulation.climateStability;
  if (climateRisk > 0.5) {
    const climateDepletion = (climateRisk - 0.5) * 0.1;
    depletionRate += assertFinite(climateDepletion, {
      location: 'updateJustInTimeBuffers',
      valueName: 'climateDepletion',
      month: state.currentMonth,
      additionalInfo: { climateRisk }
    });
  }

  // Geopolitical tensions deplete buffers (trade disruptions)
  // Use social stability as proxy (lower stability = more tensions)
  const geopoliticalTension = Math.max(0, 1.0 - (state.globalMetrics.socialStability / 100.0));
  if (geopoliticalTension > 0.6) {
    const tensionDepletion = (geopoliticalTension - 0.6) * 0.15;
    depletionRate += assertFinite(tensionDepletion, {
      location: 'updateJustInTimeBuffers',
      valueName: 'tensionDepletion',
      month: state.currentMonth,
      additionalInfo: { geopoliticalTension }
    });
  }

  // Infrastructure failures deplete buffers (cascading from infrastructure system)
  if (cascades.infrastructureCascades.cascadeActive) {
    depletionRate += 0.2; // Aggressive depletion during active infrastructure cascade
  }

  // Deplete buffers (days per month, ~0.033 days per day baseline)
  const daysPerMonth = 30;
  const baselineDepletion = 0.5; // 0.5 days per month baseline consumption
  const totalDepletion = baselineDepletion + depletionRate * daysPerMonth;

  jitVuln.semiconductorBuffer = Math.max(0, jitVuln.semiconductorBuffer - totalDepletion);
  jitVuln.rareEarthBuffer = Math.max(0, jitVuln.rareEarthBuffer - totalDepletion * 0.8);
  jitVuln.criticalInputsBuffer = Math.max(0, jitVuln.criticalInputsBuffer - totalDepletion * 1.2);

  // Buffer replenishment (64% adopting 10-15% buffer stock = just-in-case shift)
  const justInCaseAdoptionRate = 0.64;
  const targetBuffer = 7.0; // Target 7 days (mid-range of "several days")
  const replenishmentRate = justInCaseAdoptionRate * 0.1; // 10% of gap per month

  jitVuln.semiconductorBuffer += (targetBuffer - jitVuln.semiconductorBuffer) * replenishmentRate;
  jitVuln.rareEarthBuffer += (targetBuffer - jitVuln.rareEarthBuffer) * replenishmentRate * 0.8;
  jitVuln.criticalInputsBuffer += (targetBuffer - jitVuln.criticalInputsBuffer) * replenishmentRate * 1.2;

  // Validate buffer values
  jitVuln.semiconductorBuffer = assertFinite(jitVuln.semiconductorBuffer, {
    location: 'updateJustInTimeBuffers',
    valueName: 'semiconductorBuffer',
    month: state.currentMonth
  });

  jitVuln.rareEarthBuffer = assertFinite(jitVuln.rareEarthBuffer, {
    location: 'updateJustInTimeBuffers',
    valueName: 'rareEarthBuffer',
    month: state.currentMonth
  });

  jitVuln.criticalInputsBuffer = assertFinite(jitVuln.criticalInputsBuffer, {
    location: 'updateJustInTimeBuffers',
    valueName: 'criticalInputsBuffer',
    month: state.currentMonth
  });

  // Critical threshold: Below 3 days → uncontrolled cascade risk
  const CRITICAL_THRESHOLD = 3.0; // Days (conservative, "several days" from research)
  const minBuffer = Math.min(
    jitVuln.semiconductorBuffer,
    jitVuln.rareEarthBuffer,
    jitVuln.criticalInputsBuffer
  );

  if (minBuffer < CRITICAL_THRESHOLD) {
    jitVuln.disruptionActive = true;
    jitVuln.daysUntilCascade = Math.max(0, minBuffer);

    // Log warning
    console.log(
      `📦⚠️ BUFFER LOW: Critical buffer at ${minBuffer.toFixed(1)} days (threshold: ${CRITICAL_THRESHOLD} days)`
    );

    // If buffer exhausted, trigger production halt
    if (minBuffer < 0.5) {
      console.log(`📦❌ BUFFER EXHAUSTED: JIT manufacturing halted (buffer: ${minBuffer.toFixed(1)} days)`);

      // Impact on manufacturing capability (production halt)
      const productionImpact = 0.02; // 2% per month of buffer exhaustion
      state.globalMetrics.manufacturingCapability = Math.max(
        0.1,
        state.globalMetrics.manufacturingCapability * (1.0 - productionImpact)
      );
    }
  } else {
    jitVuln.disruptionActive = false;
    jitVuln.daysUntilCascade = CRITICAL_THRESHOLD; // Reset to threshold
  }
}

/**
 * Check single points of failure (geographic chokepoints, semiconductor supply)
 *
 * Research: Drewry/UNCTAD 2024 - Suez disruption: 64% transit decline, 158-246% cost increase
 * Research: McKinsey 2024 - Taiwan semiconductor capacity: 60% global advanced node production
 */
function checkSinglePointFailures(state: GameState, rng: () => number): void {
  const cascades = assertDefined(state.supplyChainCascades, {
    location: 'checkSinglePointFailures',
    valueName: 'supplyChainCascades',
    month: state.currentMonth
  });

  const spof = assertDefined(cascades.singlePointsOfFailure, {
    location: 'checkSinglePointFailures',
    valueName: 'singlePointsOfFailure',
    month: state.currentMonth
  });

  // Check for triggering events (climate disasters, geopolitical conflicts)
  const geopoliticalRisk = Math.max(0, 1.0 - (state.globalMetrics.socialStability / 100.0));
  const climateDisasterRisk = 1.0 - state.environmentalAccumulation.climateStability;

  // Suez Canal disruption probability
  const suezRiskBase = 0.001; // 0.1% per month baseline
  const suezRiskMultiplier = Math.max(1.0, geopoliticalRisk * 2.0 + climateDisasterRisk);
  const suezRisk = assertFinite(suezRiskBase * suezRiskMultiplier, {
    location: 'checkSinglePointFailures',
    valueName: 'suezRisk',
    month: state.currentMonth
  });

  if (rng() < suezRisk && spof.suezStatus === 'open') {
    spof.suezStatus = rng() < 0.5 ? 'restricted' : 'closed';
    console.log(`🚨 CHOKEPOINT DISRUPTION: Suez Canal ${spof.suezStatus}`);
  }

  // Panama Canal disruption (water shortages, climate-related)
  const panamaRiskBase = 0.0015; // Higher baseline (water shortage documented 2023-2024)
  const panamaRisk = assertFinite(panamaRiskBase * (1.0 + climateDisasterRisk * 2.0), {
    location: 'checkSinglePointFailures',
    valueName: 'panamaRisk',
    month: state.currentMonth
  });

  if (rng() < panamaRisk && spof.panamaStatus === 'open') {
    spof.panamaStatus = 'restricted'; // Usually restricted, not closed (water rationing)
    console.log(`🚨 CHOKEPOINT DISRUPTION: Panama Canal ${spof.panamaStatus}`);
  }

  // Malacca Strait disruption (piracy, geopolitical)
  const malaccaRiskBase = 0.0008;
  const malaccaRisk = assertFinite(malaccaRiskBase * Math.max(1.0, geopoliticalRisk * 3.0), {
    location: 'checkSinglePointFailures',
    valueName: 'malaccaRisk',
    month: state.currentMonth
  });

  if (rng() < malaccaRisk && spof.malaccaStatus === 'open') {
    spof.malaccaStatus = 'restricted';
    console.log(`🚨 CHOKEPOINT DISRUPTION: Malacca Strait ${spof.malaccaStatus}`);
  }

  // SWIFT payment system disruption (cyberattack, sanctions)
  const swiftRiskBase = 0.0005;
  const swiftRisk = assertFinite(swiftRiskBase * Math.max(1.0, geopoliticalRisk * 4.0), {
    location: 'checkSinglePointFailures',
    valueName: 'swiftRisk',
    month: state.currentMonth
  });

  if (rng() < swiftRisk && spof.swiftStatus === 'operational') {
    spof.swiftStatus = rng() < 0.3 ? 'failed' : 'restricted';
    console.log(`🚨 CRITICAL: SWIFT payment system ${spof.swiftStatus}`);
  }

  // Taiwan semiconductor capacity disruption (geopolitical, natural disaster)
  const taiwanRiskBase = 0.001;
  const taiwanRisk = assertFinite(
    taiwanRiskBase * (geopoliticalRisk * 3.0 + climateDisasterRisk * 2.0),
    {
      location: 'checkSinglePointFailures',
      valueName: 'taiwanRisk',
      month: state.currentMonth
    }
  );

  if (rng() < taiwanRisk) {
    const capacityLoss = rng() * 0.2; // Up to 20% capacity loss per event
    spof.taiwanSemiconductorCapacity = Math.max(0, spof.taiwanSemiconductorCapacity - capacityLoss);
    console.log(
      `🚨 SEMICONDUCTOR DISRUPTION: Taiwan capacity reduced to ${(spof.taiwanSemiconductorCapacity * 100).toFixed(1)}%`
    );
  } else {
    // Gradual recovery
    spof.taiwanSemiconductorCapacity = Math.min(1.0, spof.taiwanSemiconductorCapacity + 0.02);
  }

  // Apply economic impacts from chokepoint disruptions
  applyChokepointEconomicImpacts(state, spof);

  // Recovery: Gradual restoration of chokepoints
  if (spof.suezStatus !== 'open' && rng() < 0.1) {
    spof.suezStatus = spof.suezStatus === 'closed' ? 'restricted' : 'open';
    console.log(`✅ RECOVERY: Suez Canal ${spof.suezStatus}`);
  }

  if (spof.panamaStatus !== 'open' && rng() < 0.08) {
    spof.panamaStatus = 'open';
    console.log(`✅ RECOVERY: Panama Canal ${spof.panamaStatus}`);
  }

  if (spof.malaccaStatus !== 'open' && rng() < 0.12) {
    spof.malaccaStatus = 'open';
    console.log(`✅ RECOVERY: Malacca Strait ${spof.malaccaStatus}`);
  }

  if (spof.swiftStatus !== 'operational' && rng() < 0.05) {
    spof.swiftStatus = spof.swiftStatus === 'failed' ? 'restricted' : 'operational';
    console.log(`✅ RECOVERY: SWIFT system ${spof.swiftStatus}`);
  }
}

/**
 * Apply economic impacts from chokepoint disruptions
 *
 * Research: Suez 2024 - 64% transit decline, 158-246% cost increase, ~9% capacity loss
 */
function applyChokepointEconomicImpacts(
  state: GameState,
  spof: GameState['supplyChainCascades']['singlePointsOfFailure']
): void {
  let shippingCostMultiplier = 1.0;
  let capacityLossMultiplier = 1.0;

  // Suez Canal impacts
  if (spof.suezStatus === 'closed') {
    shippingCostMultiplier *= 2.46; // 246% increase (upper bound)
    capacityLossMultiplier *= 0.91; // 9% capacity loss
    console.log(`💰 COST IMPACT: Suez closure → ${(shippingCostMultiplier * 100).toFixed(0)}% shipping costs`);
  } else if (spof.suezStatus === 'restricted') {
    shippingCostMultiplier *= 1.58; // 158% increase (conservative)
    capacityLossMultiplier *= 0.95; // 5% capacity loss
  }

  // Panama Canal impacts (similar magnitude, different routes)
  if (spof.panamaStatus === 'restricted') {
    shippingCostMultiplier *= 1.3;
    capacityLossMultiplier *= 0.97;
  }

  // Malacca Strait impacts
  if (spof.malaccaStatus === 'restricted') {
    shippingCostMultiplier *= 1.4;
    capacityLossMultiplier *= 0.96;
  }

  // SWIFT system impacts (payment disruptions)
  if (spof.swiftStatus === 'failed') {
    capacityLossMultiplier *= 0.85; // 15% trade reduction (severe)
    console.log(`💰 CRITICAL: SWIFT failure → 15% trade reduction`);
  } else if (spof.swiftStatus === 'restricted') {
    capacityLossMultiplier *= 0.93; // 7% trade reduction
  }

  // Taiwan semiconductor impacts (affects tech sector specifically)
  const semiconductorImpact = (1.0 - spof.taiwanSemiconductorCapacity) * 0.05; // Up to 5% GDP impact
  capacityLossMultiplier *= 1.0 - semiconductorImpact;

  // Apply to manufacturing capability (shipping costs reduce effective economic output)
  const economicImpact = (shippingCostMultiplier - 1.0) * 0.1 + (1.0 - capacityLossMultiplier);
  state.globalMetrics.manufacturingCapability = Math.max(
    0.1,
    state.globalMetrics.manufacturingCapability * (1.0 - economicImpact * 0.5) // 50% of calculated impact (conservative)
  );
}

/**
 * Propagate infrastructure cascades (Power → Water → Food → Healthcare)
 *
 * Research: One Earth 2024 (Nirandjan) - 5x multiplier, 74% spread probability
 * Research: Texas freeze 2021 - 3-day power → 12M water disruption → $195B damages
 */
function propagateInfrastructureCascades(state: GameState, rng: () => number): void {
  const cascades = assertDefined(state.supplyChainCascades, {
    location: 'propagateInfrastructureCascades',
    valueName: 'supplyChainCascades',
    month: state.currentMonth
  });

  const infra = assertDefined(cascades.infrastructureCascades, {
    location: 'propagateInfrastructureCascades',
    valueName: 'infrastructureCascades',
    month: state.currentMonth
  });

  // Check for triggering events (climate disasters, power grid failures)
  const climateDisasterRisk = 1.0 - state.environmentalAccumulation.climateStability;
  const CASCADE_TRIGGER_THRESHOLD = 0.7; // High risk required to trigger cascade

  // Trigger new cascade if conditions met
  if (
    !infra.cascadeActive &&
    climateDisasterRisk > CASCADE_TRIGGER_THRESHOLD &&
    rng() < (climateDisasterRisk - CASCADE_TRIGGER_THRESHOLD) * 0.1
  ) {
    // Initiate cascade (power failure)
    infra.cascadeActive = true;
    infra.hoursInCascade = 0;
    infra.powerGridStatus = rng() * 0.3 + 0.3; // 30-60% power loss
    console.log(
      `🌍💥 CASCADE TRIGGERED: Power grid failure (${((1.0 - infra.powerGridStatus) * 100).toFixed(1)}% loss)`
    );
  }

  // If cascade active, propagate through dependencies
  if (infra.cascadeActive) {
    const hoursPerMonth = 24 * 30; // 720 hours per month
    infra.hoursInCascade += hoursPerMonth;

    // Power → Water cascade (1-7 days delay)
    const waterCascadeDelay = 3 * 24; // 3 days (mid-range)
    if (infra.hoursInCascade > waterCascadeDelay) {
      // Water treatment requires electricity
      const waterImpact = (1.0 - infra.powerGridStatus) * 0.8; // 80% of power loss cascades to water
      infra.waterSystemStatus = Math.max(0, 1.0 - waterImpact);

      if (infra.waterSystemStatus < 0.9) {
        console.log(
          `🌍💥 CASCADE: Power → Water (${(infra.waterSystemStatus * 100).toFixed(1)}% operational, ${(infra.hoursInCascade / 24).toFixed(0)} days)`
        );
      }
    }

    // Water → Food cascade (1-2 weeks delay)
    const foodCascadeDelay = 10 * 24; // 10 days (mid-range)
    if (infra.hoursInCascade > foodCascadeDelay) {
      // Food requires water + refrigeration (power)
      const foodImpact =
        (1.0 - infra.waterSystemStatus) * 0.6 + (1.0 - infra.powerGridStatus) * 0.4;
      infra.foodSystemStatus = Math.max(0, 1.0 - foodImpact);

      if (infra.foodSystemStatus < 0.9) {
        console.log(
          `🌍💥 CASCADE: Water → Food (${(infra.foodSystemStatus * 100).toFixed(1)}% operational)`
        );
      }
    }

    // Food/Water → Healthcare cascade (2-4 weeks delay)
    const healthcareCascadeDelay = 21 * 24; // 21 days (mid-range)
    if (infra.hoursInCascade > healthcareCascadeDelay) {
      // Healthcare requires power, water, food for staff
      const healthcareImpact =
        (1.0 - infra.powerGridStatus) * 0.4 +
        (1.0 - infra.waterSystemStatus) * 0.3 +
        (1.0 - infra.foodSystemStatus) * 0.3;
      infra.healthcareSystemStatus = Math.max(0, 1.0 - healthcareImpact);

      if (infra.healthcareSystemStatus < 0.9) {
        console.log(
          `🌍💥 CASCADE: Infrastructure → Healthcare (${(infra.healthcareSystemStatus * 100).toFixed(1)}% operational)`
        );
      }
    }

    // Apply QoL and mortality impacts
    applyInfrastructureCascadeImpacts(state, infra);

    // Recovery: Gradual restoration (sequential - can't restore food before power)
    const recoveryRate = 0.05; // 5% per month

    // Power recovery first
    if (infra.powerGridStatus < 1.0) {
      infra.powerGridStatus = Math.min(1.0, infra.powerGridStatus + recoveryRate);
    }

    // Water recovery (only if power mostly restored)
    if (infra.powerGridStatus > 0.9 && infra.waterSystemStatus < 1.0) {
      infra.waterSystemStatus = Math.min(1.0, infra.waterSystemStatus + recoveryRate);
    }

    // Food recovery (only if water mostly restored)
    if (infra.waterSystemStatus > 0.9 && infra.foodSystemStatus < 1.0) {
      infra.foodSystemStatus = Math.min(1.0, infra.foodSystemStatus + recoveryRate);
    }

    // Healthcare recovery (only if food mostly restored)
    if (infra.foodSystemStatus > 0.9 && infra.healthcareSystemStatus < 1.0) {
      infra.healthcareSystemStatus = Math.min(1.0, infra.healthcareSystemStatus + recoveryRate);
    }

    // End cascade if all systems mostly recovered
    if (
      infra.powerGridStatus > 0.95 &&
      infra.waterSystemStatus > 0.95 &&
      infra.foodSystemStatus > 0.95 &&
      infra.healthcareSystemStatus > 0.95
    ) {
      infra.cascadeActive = false;
      infra.hoursInCascade = 0;
      console.log(`✅ CASCADE ENDED: Infrastructure systems recovered`);
    }
  }
}

/**
 * Apply QoL and mortality impacts from infrastructure cascades
 *
 * Research: Texas freeze 2021 - 246-702 deaths from 3-day event
 */
function applyInfrastructureCascadeImpacts(
  state: GameState,
  infra: GameState['supplyChainCascades']['infrastructureCascades']
): void {
  const qol = state.qualityOfLifeSystems;

  // Power impacts: Energy availability, basic safety
  const powerImpact = (1.0 - infra.powerGridStatus) * 0.3;
  qol.energyAvailability = Math.max(0, qol.energyAvailability - powerImpact);
  qol.physicalSafety = Math.max(0, qol.physicalSafety - powerImpact * 0.5);

  // Water impacts: Basic survival needs
  const waterImpact = (1.0 - infra.waterSystemStatus) * 0.4;
  if (qol.survivalFundamentals.waterSecurity) {
    qol.survivalFundamentals.waterSecurity = Math.max(0, qol.survivalFundamentals.waterSecurity - waterImpact);
  }

  // Food impacts: Nutrition, food security
  const foodImpact = (1.0 - infra.foodSystemStatus) * 0.5;
  if (qol.survivalFundamentals.foodSecurity) {
    qol.survivalFundamentals.foodSecurity = Math.max(0, qol.survivalFundamentals.foodSecurity - foodImpact);
  }

  // Healthcare impacts: Healthcare quality
  const healthcareImpact = (1.0 - infra.healthcareSystemStatus) * 0.6;
  if (qol.healthcareQuality) {
    qol.healthcareQuality = Math.max(0, qol.healthcareQuality - healthcareImpact);
  }

  // Mortality (conservative - Texas freeze: 246-702 deaths for 12M affected = 0.002-0.006% mortality)
  const population = state.humanPopulationSystem?.population ?? 8e9;
  const cascadeSeverity =
    (1.0 - infra.powerGridStatus) * 0.25 +
    (1.0 - infra.waterSystemStatus) * 0.25 +
    (1.0 - infra.foodSystemStatus) * 0.25 +
    (1.0 - infra.healthcareSystemStatus) * 0.25;

  if (cascadeSeverity > 0.5) {
    const mortalityRate = cascadeSeverity * 0.0001; // 0.01% max mortality per month
    const deaths = population * mortalityRate;

    if (state.humanPopulationSystem) {
      state.humanPopulationSystem.population = Math.max(1e6, population - deaths);
    }

    if (deaths > 1e6) {
      console.log(
        `🌍💥 CASCADE MORTALITY: ${(deaths / 1e6).toFixed(2)}M deaths from infrastructure failure`
      );
    }
  }
}

/**
 * Propagate finance cascades (credit freeze → JIT manufacturing halt)
 *
 * CONSERVATIVE IMPLEMENTATION - Less empirical support than infrastructure cascades
 */
function propagateFinanceCascades(state: GameState, rng: () => number): void {
  const cascades = assertDefined(state.supplyChainCascades, {
    location: 'propagateFinanceCascades',
    valueName: 'supplyChainCascades',
    month: state.currentMonth
  });

  const finance = assertDefined(cascades.financeCascades, {
    location: 'propagateFinanceCascades',
    valueName: 'financeCascades',
    month: state.currentMonth
  });

  // Credit availability influenced by economic conditions
  const socialStability = state.globalMetrics.socialStability;
  const geopoliticalRisk = Math.max(0, 1.0 - (socialStability / 100.0));

  // Credit freeze risk (triggered by economic shocks)
  const creditFreezeRisk = Math.max(0, geopoliticalRisk - 0.7) * 0.05; // 5% per month at max risk
  if (rng() < creditFreezeRisk && finance.creditAvailability > 0.5) {
    const creditLoss = rng() * 0.3 + 0.1; // 10-40% credit loss
    finance.creditAvailability = Math.max(0, finance.creditAvailability - creditLoss);
    console.log(
      `💰 CREDIT FREEZE: Credit availability reduced to ${(finance.creditAvailability * 100).toFixed(1)}%`
    );
  }

  // Payment system status (linked to SWIFT status)
  const swiftStatus = cascades.singlePointsOfFailure.swiftStatus;
  if (swiftStatus === 'failed') {
    finance.paymentSystemStatus = Math.max(0.2, finance.paymentSystemStatus - 0.3);
    console.log(`💰 PAYMENT DISRUPTION: System status ${(finance.paymentSystemStatus * 100).toFixed(1)}%`);
  } else if (swiftStatus === 'restricted') {
    finance.paymentSystemStatus = Math.max(0.6, finance.paymentSystemStatus - 0.1);
  } else {
    // Gradual recovery
    finance.paymentSystemStatus = Math.min(1.0, finance.paymentSystemStatus + 0.05);
  }

  // Cash reserves depletion (during sustained crisis)
  const jitDisruption = cascades.justInTimeVulnerability.disruptionActive;
  if (jitDisruption || finance.creditAvailability < 0.5) {
    finance.cashReservesDepletion += 0.05; // 5% per month
    finance.cashReservesDepletion = Math.min(1.0, finance.cashReservesDepletion);

    if (finance.cashReservesDepletion > 0.7) {
      console.log(
        `💰⚠️ CASH RESERVES CRITICAL: ${(finance.cashReservesDepletion * 100).toFixed(1)}% depleted`
      );
    }
  } else {
    // Recovery
    finance.cashReservesDepletion = Math.max(0, finance.cashReservesDepletion - 0.03);
  }

  // Employment cascade (when cash reserves depleted, layoffs cascade)
  if (finance.cashReservesDepletion > 0.8 && !finance.employmentCascadeActive) {
    finance.employmentCascadeActive = true;
    console.log(`💰🚨 EMPLOYMENT CASCADE: Cash depletion triggering layoffs`);
  } else if (finance.cashReservesDepletion < 0.3 && finance.employmentCascadeActive) {
    finance.employmentCascadeActive = false;
    console.log(`✅ EMPLOYMENT RECOVERY: Hiring resuming`);
  }

  // Apply finance impacts (CONSERVATIVE)
  if (finance.employmentCascadeActive) {
    const manufacturingImpact = 0.01; // 1% manufacturing impact per month (conservative)
    state.globalMetrics.manufacturingCapability = Math.max(
      0.1,
      state.globalMetrics.manufacturingCapability * (1.0 - manufacturingImpact)
    );
  }
}

/**
 * Apply compound cascade effects (multiple simultaneous cascades)
 *
 * CONSERVATIVE: Use additive compounding initially (not multiplicative)
 * Single cascade: 5x multiplier (documented)
 * Multi-cascade: Additive until validated via Monte Carlo
 */
function applyCompoundCascadeEffects(state: GameState): void {
  const cascades = assertDefined(state.supplyChainCascades, {
    location: 'applyCompoundCascadeEffects',
    valueName: 'supplyChainCascades',
    month: state.currentMonth
  });

  // Count active cascades
  let activeCascades = 0;
  let cascadeImpact = 0.0;

  // JIT buffer exhaustion
  if (cascades.justInTimeVulnerability.disruptionActive) {
    activeCascades++;
    cascadeImpact += 0.1; // 10% impact (additive)
  }

  // Infrastructure cascade
  if (cascades.infrastructureCascades.cascadeActive) {
    activeCascades++;
    const infraImpact =
      (1.0 - cascades.infrastructureCascades.powerGridStatus) * 0.25 +
      (1.0 - cascades.infrastructureCascades.waterSystemStatus) * 0.25 +
      (1.0 - cascades.infrastructureCascades.foodSystemStatus) * 0.25 +
      (1.0 - cascades.infrastructureCascades.healthcareSystemStatus) * 0.25;
    cascadeImpact += infraImpact * 0.5; // 50% weight (infrastructure critical)
  }

  // Finance cascade
  if (cascades.financeCascades.employmentCascadeActive) {
    activeCascades++;
    cascadeImpact += 0.05; // 5% impact (conservative)
  }

  // Apply compound impact to systems (cascades amplify vulnerabilities)
  if (activeCascades > 1) {
    console.log(
      `🌍💥 COMPOUND CASCADE: ${activeCascades} simultaneous cascades (${(cascadeImpact * 100).toFixed(1)}% total impact)`
    );

    // Amplify environmental degradation (cascades make climate impacts worse)
    state.environmentalAccumulation.climateStability = Math.max(
      0.0,
      state.environmentalAccumulation.climateStability - cascadeImpact * 0.1
    );

    // Amplify social instability (cascades erode cohesion)
    state.globalMetrics.socialStability = Math.max(
      0.0,
      state.globalMetrics.socialStability * (1.0 - cascadeImpact * 0.15)
    );
  }
}
