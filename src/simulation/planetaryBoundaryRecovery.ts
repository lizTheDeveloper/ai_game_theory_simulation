/**
 * Planetary Boundary Recovery System
 *
 * Empirically-grounded recovery mechanics for Earth's 9 planetary boundaries.
 * Based on real-world recovery timescales from peer-reviewed research (2020-2025).
 *
 * Research foundation: /research/planetary_boundary_reversibility_empirical_20251020.md
 * Design document: /plans/ecological-recovery-system-design.md
 * Quality Gate 1: PASSED (research-skeptic validation 70% confidence)
 *
 * CRITICAL UPDATE (Oct 21, 2025):
 * - Climate feedback threshold changed from 2°C → 1.5°C
 * - Rationale: 2024 first full year exceeding 1.5°C, likely permanent by 2027-2031
 * - Reflects real-world acceleration of climate tipping risks
 *
 * 3-TIER RECOVERY SYSTEM:
 * - Tier 1 (Reversible): Ozone, freshwater, aerosols - 10-50 years
 * - Tier 2 (Partial): Climate, P/N, land system - 30-100+ years
 * - Tier 3 (Irreversible): Extinction, deep ocean acidification, PFAS - permanent damage
 *
 * Research citations:
 * - Montreal Protocol (1987-2025): Ozone recovery by 2066 (40-70 years)
 * - IPCC AR6 (2023): Climate overshoot requires 360-680 GtCO₂ removal
 * - Lake Erie (1972-2025): 50+ years, still failing (phosphorus legacy sediment)
 * - Jiang et al. (2023): Deep ocean 15-18% more acidic permanently
 * - PFAS/microplastics: No environmental cleanup technology exists
 */

import type { GameState, RNGFunction } from '../types/game';
import type { BoundaryName } from '../types/planetaryBoundaries';
import { isHistoricalModeActive } from './utils/historicalMode';
import { assertFinite, assertDefined, assertStateProperty } from './utils/assertions';
import { addSimulationEvent } from './utils/eventLogger';
import { asymptoteRecovery, legacyStockRelease } from './utils/irreversibility';

/**
 * Main recovery update function
 * Called monthly from PlanetaryBoundariesPhase
 */
export function updateBoundaryRecovery(state: GameState, rng: RNGFunction): void {
  // Tier 1: Reversible boundaries (10-50 years)
  updateFreshwaterRecovery(state, rng);
  updateAtmosphericAerosolRecovery(state, rng);
  // Ozone recovery already implemented in ozoneRecovery.ts

  // Tier 2: Partial recovery (30-100+ years)
  updateClimateRecovery(state, rng);
  updatePhosphorusRecovery(state, rng);
  updateNitrogenRecovery(state, rng);
  updateLandSystemRecovery(state, rng);

  // Tier 3: Irreversible/stabilization only
  updateBiosphereStabilization(state, rng);
  updateOceanAcidificationRecovery(state, rng);
  updateNovelEntitiesStabilization(state, rng);
}

// ============================================================================
// TIER 1: REVERSIBLE BOUNDARIES (10-50 years)
// ============================================================================

/**
 * Freshwater Recovery (10-30 years)
 *
 * Research: Ogallala Aquifer recharge 0.1-0.5 inches/year, depletion 6 inches/year
 * Mechanism: Aquifer recharge requires extraction below natural recharge rate
 * Timeline: 15 years (180 months) sustained improvement
 * Governance: Requires enforcement of extraction limits (tragedy of commons)
 *
 * Citations:
 * - USGS (2023): High Plains aquifer depletion rates
 * - Nature Water (2024): Global groundwater sustainability assessment
 */
function updateFreshwaterRecovery(state: GameState, rng: RNGFunction): void {
  const boundary = state.planetaryBoundariesSystem?.boundaries.freshwater_change;
  if (!boundary) return;

  // FIX (Oct 21, 2025): Recovery activates when BREACHED but conditions allow improvement
  // Old logic checked "not breached" (impossible from initial state)
  // New logic: If breached, can we start improving?
  const isBreached = boundary.currentValue >= boundary.boundaryThreshold;
  const isImproving = isBreached; // If breached, we CAN improve toward threshold

  // Governance capacity check (research-skeptic requirement)
  if (!state.government.governanceQuality) throw new Error(`❌ governanceQuality undefined in planetaryBoundaryRecovery at month ${state.currentMonth}`);
  if (typeof state.government.governanceQuality.institutionalCapacity !== "number") throw new Error(`❌ institutionalCapacity not a number in planetaryBoundaryRecovery at month ${state.currentMonth}`);
  const institutionalCapacity = state.government.governanceQuality.institutionalCapacity;
  const internationalCoordination = state.government?.structuralChoices?.internationalCoordination ? 1.0 : 0.5;
  const governanceMultiplier = (institutionalCapacity + internationalCoordination) / 2;

  if (isImproving && governanceMultiplier >= 0.3) {
    // Low governance slows recovery (not blocks completely)
    const governanceAdjustment = governanceMultiplier < 0.5 ? 0.5 : 1.0;

    boundary.recoveryMonths = boundary.recoveryMonths + governanceAdjustment;

    // FIX (Oct 21, 2025): ACTUALLY IMPROVE ENVIRONMENTAL STATE
    // Freshwater stress reduction: 0.1-0.5% monthly improvement
    // Research: Ogallala Aquifer recharge 0.1-0.5 inches/year = slow but steady
    const recoveryRate = 0.002 * governanceAdjustment; // 0.2%/month if high governance

    // Reduce water stress (conceptual - boundary derives from multiple sources)
    // This creates gradual improvement that compounds over years
    if (state.environmentalAccumulation) {
      // Track freshwater improvement (implicit in resource management)
      // Note: Freshwater boundary uses multiple inputs, so this is a proxy improvement
      boundary.currentValue = Math.max(0, boundary.currentValue - recoveryRate);
    }

    // Recovery threshold: 15 years (180 months) if high governance
    const recoveryThreshold = 180 / governanceAdjustment;

    if (boundary.recoveryMonths >= recoveryThreshold) {
      boundary.status = 'safe';
      boundary.trend = 'improving';
      boundary.monthsBreached = 0;
      boundary.breachYear = null;

      console.log(`\n=== Freshwater Boundary RECOVERED ===`);
      console.log(`  Recovery time: ${Math.floor(boundary.recoveryMonths / 12)} years`);
      console.log(`  Governance quality: ${(governanceMultiplier * 100).toFixed(1)}%`);
    }
  } else {
    // Reset recovery counter if degrading again
    boundary.recoveryMonths = 0;
  }
}

/**
 * Atmospheric Aerosol Recovery (1-5 years)
 *
 * Research: PM2.5 atmospheric residence time days-months
 * Mechanism: Natural atmospheric clearing once emissions stop
 * Timeline: 12 months sustained low emissions
 *
 * Citations:
 * - Atmospheric Chemistry & Physics (2024): Aerosol residence times
 * - WHO Air Quality Guidelines (2021): PM2.5 health thresholds
 */
function updateAtmosphericAerosolRecovery(state: GameState, rng: RNGFunction): void {
  const boundary = state.planetaryBoundariesSystem?.boundaries.atmospheric_aerosols;
  if (!boundary) return;

  const isImproving = boundary.currentValue < boundary.boundaryThreshold;

  if (isImproving) {
    boundary.recoveryMonths = boundary.recoveryMonths + 1;

    // Very fast recovery (12 months) - aerosols clear quickly
    if (boundary.recoveryMonths >= 12) {
      boundary.status = 'safe';
      boundary.trend = 'improving';
      boundary.monthsBreached = 0;
      boundary.breachYear = null;

      console.log(`\n=== Atmospheric Aerosol Boundary RECOVERED ===`);
      console.log(`  Recovery time: ${boundary.recoveryMonths} months (natural atmospheric clearing)`);
    }
  } else {
    boundary.recoveryMonths = 0;
  }
}

// ============================================================================
// TIER 2: PARTIAL RECOVERY (30-100+ years)
// ============================================================================

/**
 * Climate Change Recovery (50-100 years)
 *
 * Research: IPCC AR6 overshoot scenarios require 360-680 GtCO₂ removal
 * Mechanism: Net-negative emissions (CDR > emissions) + temperature stabilization
 * Timeline: 24 months sustained below 1.5°C with net-negative emissions
 * Critical feedback: Recovery HARDER if warming ≥ 1.5°C (permafrost, ocean uptake reduction)
 *
 * CRITICAL UPDATE (Oct 21, 2025):
 * - Threshold changed from 2.0°C → 1.5°C
 * - Rationale: 2024 first full year exceeding 1.5°C, feedback loops already activated
 *
 * Citations:
 * - IPCC AR6 WG1 (2023): Overshoot pathways and carbon removal
 * - Schuur et al. (2022): Permafrost carbon feedback (1,700 GtCO₂ at 2°C)
 * - Raymond et al. (2020): Lake Erie warming-algae bloom feedback
 */
function updateClimateRecovery(state: GameState, rng: RNGFunction): void {
  const boundary = state.planetaryBoundariesSystem?.boundaries.climate_change;
  if (!boundary) return;

  // Calculate globalWarming from planetary boundary (currentValue * 2 = degrees C)
  const globalWarming = boundary.currentValue * 2.0;

  // FIX #18.1 (Oct 22, 2025): Read emissions from correct state property
  // CRITICAL: Climate recovery was reading climateState.annualEmissions (never updated)
  // but FIX #18 updates resourceEconomy.co2.annualEmissions (actual emissions)
  // This architectural flaw meant FIX #18 had NO EFFECT on climate recovery
  //
  // FIX (Oct 25, 2025): Replaced defensive fallback with assertive validation
  // If annualEmissions is NaN/undefined, that's a BUG in CO2 system initialization
  const rawEmissions = assertDefined(
    state.resourceEconomy?.co2?.annualEmissions,
    {
      location: 'updateClimateRecovery',
      valueName: 'resourceEconomy.co2.annualEmissions',
      month: state.currentMonth,
      expectedSource: 'resourceDepletion.ts CO2 system'
    }
  );
  const annualEmissions = assertFinite(rawEmissions, {
    location: 'updateClimateRecovery',
    valueName: 'annualEmissions',
    month: state.currentMonth
  });
  // CDR tracking: No dedicated property yet, use natural sinks as proxy
  const annualCDR = (() => {
    if (!state.resourceEconomy?.co2) throw new Error(`❌ resourceEconomy.co2 undefined in planetaryBoundaryRecovery at month ${state.currentMonth}`);
    if (typeof state.resourceEconomy.co2.oceanAbsorption !== "number" || typeof state.resourceEconomy.co2.landAbsorption !== "number") throw new Error(`❌ co2 absorption values not numbers in planetaryBoundaryRecovery at month ${state.currentMonth}`);
    return state.resourceEconomy.co2.oceanAbsorption + state.resourceEconomy.co2.landAbsorption;
  })();

  const netEmissions = annualEmissions - annualCDR;

  // FIX (Oct 21, 2025): Recovery activates when CONDITIONS EXIST for recovery, not when already recovering
  // Old: Required temp < 1.5°C AND net-negative (catch-22: can't start until already done)
  // New: If breached (>1.0°C threshold), recovery can start if governance allows it
  const isBreached = globalWarming > 1.0; // Boundary threshold, not stabilization target

  // Recovery possible if: governance good enough to coordinate action
  const governanceGoodEnough = (state.government?.structuralChoices?.internationalCoordination ? 1.0 : 0.5) >= 0.3;

  const isRecovering = isBreached && governanceGoodEnough;

  // Climate feedback acceleration (research-skeptic requirement)
  // Changed from 2.0°C → 1.5°C based on 2024-2025 real-world data
  const climateMultiplier = globalWarming >= 1.5 ? 1.5 : 1.0;

  // Governance capacity (international cooperation critical for climate)
  const internationalCoordination = state.government?.structuralChoices?.internationalCoordination ? 1.0 : 0.5;
  const governanceMultiplier = internationalCoordination < 0.5 ? 0.5 : 1.0;

  if (isRecovering) {
    const combinedMultiplier = governanceMultiplier / climateMultiplier;
    boundary.recoveryMonths = boundary.recoveryMonths + combinedMultiplier;

    // DEBUG (Oct 21, 2025): Log first activation
    if (boundary.recoveryMonths <= 1.5) {
      console.log(`\n🌡️  CLIMATE RECOVERY ACTIVATED (Month ${state.currentMonth})`);
      console.log(`   Temp: ${globalWarming.toFixed(2)}°C, Emissions: ${netEmissions.toFixed(1)} GtCO₂`);
      console.log(`   isBreached: ${isBreached}, governanceGoodEnough: ${governanceGoodEnough}`);

      // Add event to timeline (first activation only)
      addSimulationEvent(state, {
        type: 'environmental',
        severity: 'constructive',
        agent: 'planetary-systems',
        title: `🌡️ CLIMATE RECOVERY ACTIVATED`,
        description: `Planetary boundary recovery triggered for climate change. Current temperature: ${globalWarming.toFixed(2)}°C above pre-industrial. Net emissions: ${netEmissions.toFixed(1)} GtCO₂/year (requires net-negative for recovery). International governance: ${(internationalCoordination * 100).toFixed(0)}%. This is the first step toward reversing climate damage.`,
        effects: {
          globalWarming,
          netEmissions,
          internationalCoordination,
          boundaryValue: boundary.currentValue,
          isBreached,
          governanceGoodEnough
        }
      });
    }

    // UPDATED (Nov 22, 2025): ASYMPTOTIC RECOVERY WITH POST-2100 COMMITMENT
    // Research: Drüke et al. (2024) - Ice sheet recovery 450 years (100-800 range)
    // - Climate temperature reversible in 50-100 years with massive CDR (atmosphere)
    // - Ice sheet recovery 450 years half-life (slow dynamics)
    // - Post-2100 commitment: 30-50% irreversible (35% central, committed SLR)
    // - Recovery approaches asymptotic floor, never reaches zero
    //
    // Key mechanic: Even after full decarbonization, ice sheets retain 35% committed melting
    // This creates permanent sea level rise regardless of future emissions

    const netNegative = netEmissions < 0;
    const hasActiveCDR = annualCDR > 5; // ≥ 5 GtCO₂/year CDR

    // Recovery only happens with net-negative emissions
    if (netNegative) {
      // Get ice sheet recovery parameters
      const recoveryHalfLife = assertStateProperty(boundary, 'recoveryHalfLife', {
        location: 'updateClimateRecovery',
        month: state.currentMonth
      });
      const minimumAsymptoticValue = assertStateProperty(boundary, 'minimumAsymptoticValue', {
        location: 'updateClimateRecovery',
        month: state.currentMonth
      });

      // Asymptotic recovery: approach floor value exponentially
      // Formula: newValue = asymptoteRecovery(currentValue, recoveryHalfLife, minimumAsymptoticValue)
      // Recovery half-life: 450 years (ice sheet inertia)
      // Asymptotic floor: 0.35 (35% committed warming/SLR)
      const climatePenalty = climateMultiplier > 1 ? 0.5 : 1.0; // Half speed if ≥1.5°C
      const governanceBonus = internationalCoordination > 0.7 ? 1.2 : 1.0; // 20% faster with cooperation
      const effectiveHalfLife = recoveryHalfLife / (climatePenalty * governanceBonus);

      const oldValue = boundary.currentValue;
      // BUG FIX (Nov 23, 2025): Pass explicit maxBoundaryValue=6 for climate boundary (0-6 Celsius scale)
      // Old code had no 6th param, causing auto-scale to pick 100 (wrong for climate values ~2.0)
      boundary.currentValue = asymptoteRecovery(
        oldValue,
        boundary.boundaryThreshold,  // Target: return to safe boundary (1.0)
        effectiveHalfLife,
        minimumAsymptoticValue,
        1/12,  // deltaYears (monthly step)
        6      // maxBoundaryValue: climate uses 0-6 Celsius scale, NOT 0-100 percentage
      );

      const recoveryDelta = oldValue - boundary.currentValue;

      // Log every 2 years if recovering
      if (state.currentMonth % 24 === 0) {
        console.log(`🌡️  CLIMATE RECOVERY: Asymptotic approach to ${(minimumAsymptoticValue * 100).toFixed(0)}% floor`);
        console.log(`   Current value: ${boundary.currentValue.toFixed(3)} (1.0 = threshold, ${minimumAsymptoticValue.toFixed(2)} = asymptotic floor)`);
        console.log(`   Monthly delta: -${(recoveryDelta * 100).toFixed(4)}% (half-life: ${Math.floor(effectiveHalfLife)} years)`);
        console.log(`   Net emissions: ${netEmissions.toFixed(1)} GtCO₂/year, CDR: ${annualCDR} GtCO₂/year`);
      }

      // Update boundary status based on actual value
      const wasBreached = boundary.status !== 'safe';
      if (boundary.currentValue < boundary.boundaryThreshold) {
        boundary.status = 'safe';
        boundary.trend = 'improving';
        boundary.monthsBreached = 0;
        boundary.breachYear = null;

        console.log(`\n=== Climate Boundary RECOVERED ===`);
        console.log(`  Boundary value: ${boundary.currentValue.toFixed(3)} (below ${boundary.boundaryThreshold} threshold)`);
        console.log(`  Temperature: ${globalWarming.toFixed(2)}°C`);
        console.log(`  Net emissions: ${netEmissions.toFixed(1)} GtCO₂/year`);
        console.log(`  Recovery time: ${Math.floor(boundary.recoveryMonths / 12)} years`);

        // Add recovery event to timeline (only once when status changes to safe)
        if (wasBreached) {
          addSimulationEvent(state, {
            type: 'environmental',
            severity: 'positive',
            agent: 'planetary-systems',
            title: `✅ CLIMATE BOUNDARY RECOVERED`,
            description: `Climate change planetary boundary returned to SAFE status after ${Math.floor(boundary.recoveryMonths / 12)} years of net-negative emissions. Boundary value: ${boundary.currentValue.toFixed(3)} (below threshold ${boundary.boundaryThreshold.toFixed(3)}). Global temperature: ${globalWarming.toFixed(2)}°C. Net emissions: ${netEmissions.toFixed(1)} GtCO₂/year. This is a major milestone for ecological sustainability.`,
            effects: {
              recoveryYears: Math.floor(boundary.recoveryMonths / 12),
              boundaryValue: boundary.currentValue,
              globalWarming,
              netEmissions,
              threshold: boundary.boundaryThreshold
            }
          });
        }
      } else {
        boundary.trend = 'improving';
      }
    } else {
      // Not net-negative - recovery stalled
      boundary.trend = 'stable';
      if (state.currentMonth % 24 === 0 && boundary.recoveryMonths > 0) {
        console.warn(`⚠️  CLIMATE RECOVERY STALLED: Net emissions still positive (+${netEmissions.toFixed(1)} GtCO₂/year)`);
        console.log(`   Need net-negative emissions for recovery`);
      }
    }
  } else {
    boundary.recoveryMonths = 0;
    boundary.trend = 'worsening';
  }
}

/**
 * Phosphorus Recovery (30-50 years)
 *
 * Research: Lake Erie 50+ years effort, still failing (40% reduction goal not met)
 * Mechanism: Input reduction (40%) + legacy sediment cleanup
 * Timeline: 60 months (5 years) with technology, 120 months (10 years) natural
 * Complication: Warming increases algal blooms even with same phosphorus (feedback)
 *
 * Citations:
 * - Lake Erie Phosphorus Task Force (2015-2025): 40% reduction target
 * - Raymond et al. (2020): Temperature-algae bloom feedback
 * - Schindler et al. (2012): Legacy phosphorus in sediments
 */
function updatePhosphorusRecovery(state: GameState, rng: RNGFunction): void {
  const boundary = state.planetaryBoundariesSystem?.boundaries.biogeochemical_flows;
  if (!boundary) return;

  const currentValue = boundary.currentValue;
  // FIX (Oct 21, 2025): Recovery works when breached, not when already safe
  const isBreached = currentValue >= boundary.boundaryThreshold;
  const isImproving = isBreached; // If breached, we CAN improve

  // Check for struvite recovery technology (TIER 1: 98% phosphorus recovery from wastewater)
  // FIX (Oct 21, 2025): Use compatibility layer to check both old and new tech systems
  const struviteDeployed = state.techTreeState.unlockedTech.includes('struvite_recovery');

  // Governance capacity (enforcement of agricultural runoff regulations)
  if (!state.government.governanceQuality) throw new Error(`❌ governanceQuality undefined in planetaryBoundaryRecovery at month ${state.currentMonth}`);
  if (typeof state.government.governanceQuality.institutionalCapacity !== "number") throw new Error(`❌ institutionalCapacity not a number in planetaryBoundaryRecovery at month ${state.currentMonth}`);
  const institutionalCapacity = state.government.governanceQuality.institutionalCapacity;
  const governanceMultiplier = institutionalCapacity < 0.5 ? 0.5 : 1.0;

  // Climate feedback (warming makes recovery harder - Lake Erie empirical)
  const climateBoundary = state.planetaryBoundariesSystem?.boundaries.climate_change;
  const globalWarming = climateBoundary ? climateBoundary.currentValue * 2.0 : 1.2;
  const climateMultiplier = globalWarming >= 1.5 ? 1.5 : 1.0;

  if (isImproving && governanceMultiplier >= 0.3) {
    const combinedMultiplier = governanceMultiplier / climateMultiplier;
    boundary.recoveryMonths = boundary.recoveryMonths + combinedMultiplier;

    // FIX (Oct 21, 2025): ACTUALLY REDUCE PHOSPHORUS POLLUTION
    // Research: Lake Erie showing 40% reduction target takes 30-50 years
    // Struvite tech can accelerate by 2x
    const baseRecoveryRate = struviteDeployed ? 0.002 : 0.001; // 0.2%/month with tech, 0.1% without
    const governanceBonus = governanceMultiplier > 0.7 ? 0.001 : 0; // +0.1% if strong governance
    const climatePenalty = climateMultiplier > 1 ? 0.7 : 1.0; // 30% slower if warming ≥ 1.5°C

    const recoveryRate = (baseRecoveryRate + governanceBonus) * climatePenalty;

    // Reduce boundary value directly (phosphorus loading reduction)
    boundary.currentValue = Math.max(0, boundary.currentValue - recoveryRate);

    // Recovery threshold: 60 months with tech, 120 months without
    const baseThreshold = struviteDeployed ? 60 : 120;
    const recoveryThreshold = baseThreshold * climateMultiplier / governanceMultiplier;

    if (boundary.recoveryMonths >= recoveryThreshold) {
      boundary.status = 'safe';
      boundary.trend = 'improving';
      boundary.monthsBreached = 0;
      boundary.breachYear = null;

      console.log(`\n=== Phosphorus Boundary RECOVERED ===`);
      console.log(`  Technology: ${struviteDeployed ? 'Struvite recovery deployed' : 'Natural sedimentation only'}`);
      console.log(`  Recovery time: ${Math.floor(boundary.recoveryMonths / 12)} years`);
      console.log(`  Governance: ${(governanceMultiplier * 100).toFixed(1)}%`);
      console.log(`  Climate penalty: ${climateMultiplier}x (warming affects algal blooms)`);
    }
  } else {
    boundary.recoveryMonths = 0;
  }
}

/**
 * Nitrogen Recovery (asymptotic approach to legacy stock floor)
 *
 * UPDATED (Nov 22, 2025): Exponential recovery with 125-year half-life
 * Research: Drüke et al. (2024) - Nitrogen recovery 125 years (50-200 range)
 * Mechanism: Input reduction from agriculture + legacy soil stock depletion
 * Timeline: 125 years half-life (NOT 3 years linear!)
 * Asymptotic floor: 10% (legacy nitrogen stocks persist in soil)
 *
 * Citations:
 * - Drüke et al. (2024): Nitrogen recovery timescales 50-200 years
 * - Rockström et al. (2009): Nitrogen boundary definition
 * - Steffen et al. (2015): Nitrogen cycle reversibility
 */
function updateNitrogenRecovery(state: GameState, rng: RNGFunction): void {
  const boundary = state.planetaryBoundariesSystem?.boundaries.biogeochemical_flows;
  if (!boundary) return;

  const isImproving = boundary.currentValue < boundary.boundaryThreshold;

  // Governance capacity (agricultural regulation enforcement)
  if (!state.government.governanceQuality) throw new Error(`❌ governanceQuality undefined in planetaryBoundaryRecovery at month ${state.currentMonth}`);
  if (typeof state.government.governanceQuality.institutionalCapacity !== "number") throw new Error(`❌ institutionalCapacity not a number in planetaryBoundaryRecovery at month ${state.currentMonth}`);
  const institutionalCapacity = state.government.governanceQuality.institutionalCapacity;
  const governanceMultiplier = institutionalCapacity < 0.5 ? 0.5 : 1.0;

  if (isImproving && governanceMultiplier >= 0.3) {
    // recoveryMonths is REQUIRED field - must be initialized
    const currentRecoveryMonths = assertStateProperty(boundary, 'recoveryMonths', {
      location: 'tryRecoverNitrogen (nitrogen boundary)',
      month: state.currentMonth
    });
    boundary.recoveryMonths = currentRecoveryMonths + governanceMultiplier;

    // Get nitrogen recovery parameters
    const recoveryHalfLife = assertStateProperty(boundary, 'recoveryHalfLife', {
      location: 'updateNitrogenRecovery',
      month: state.currentMonth
    });
    const minimumAsymptoticValue = assertStateProperty(boundary, 'minimumAsymptoticValue', {
      location: 'updateNitrogenRecovery',
      month: state.currentMonth
    });

    // Asymptotic recovery: approach 10% floor exponentially
    // Recovery half-life: 125 years (legacy soil nitrogen stocks)
    const effectiveHalfLife = recoveryHalfLife / governanceMultiplier;

    const oldValue = boundary.currentValue;
    boundary.currentValue = asymptoteRecovery(
      oldValue,
      boundary.boundaryThreshold,  // Target: return to safe boundary (1.0)
      effectiveHalfLife,
      minimumAsymptoticValue
    );

    const recoveryDelta = oldValue - boundary.currentValue;

    // Log every 2 years if recovering
    if (state.currentMonth % 24 === 0 && recoveryDelta > 0) {
      console.log(`🌾 NITROGEN RECOVERY: Asymptotic approach to ${(minimumAsymptoticValue * 100).toFixed(0)}% floor`);
      console.log(`   Current value: ${boundary.currentValue.toFixed(3)} (half-life: ${Math.floor(effectiveHalfLife)} years)`);
      console.log(`   Monthly delta: -${(recoveryDelta * 100).toFixed(4)}%`);
    }

    // Check if recovered to safe zone (but NOT to zero - asymptotic floor remains)
    if (boundary.currentValue < boundary.boundaryThreshold) {
      boundary.status = 'safe';
      boundary.trend = 'improving';
      if (state.currentMonth % 24 === 0) {
        console.log(`\n=== Nitrogen Boundary RECOVERED (to safe zone) ===`);
        console.log(`  Recovery time: ${Math.floor(boundary.recoveryMonths / 12)} years`);
        console.log(`  Asymptotic floor: ${(minimumAsymptoticValue * 100).toFixed(0)}% (legacy soil stocks)`);
      }
    }
  } else {
    boundary.recoveryMonths = 0;
  }
}

/**
 * Land System Change Recovery (30-100 years)
 *
 * Research: Tree cover ≠ ecosystem function; full restoration 60-100 years
 * Mechanism: Reforestation + ecosystem function restoration
 * Timeline: Two-stage recovery
 *   - Stage 1: Tree cover (30 years / 360 months) → partialRecovery
 *   - Stage 2: Ecosystem function (100 years / 1200 months) → full recovery
 *
 * Citations:
 * - Rewilding studies (2020-2024): Tree cover vs ecosystem function gap
 * - Chazdon et al. (2016): Tropical forest recovery timescales
 * - FAO (2025): Global forest cover trends
 */
function updateLandSystemRecovery(state: GameState, rng: RNGFunction): void {
  const boundary = state.planetaryBoundariesSystem?.boundaries.land_system_change;
  if (!boundary) return;

  if (!state.planetaryBoundariesSystem?.landUse) {
    throw new Error(`❌ planetaryBoundariesSystem.landUse is undefined at month ${state.currentMonth} in trackLandSystemRecovery`);
  }
  if (typeof state.planetaryBoundariesSystem.landUse.globalHabitatCoverPercent !== 'number') {
    throw new Error(`❌ globalHabitatCoverPercent is not a number at month ${state.currentMonth}`);
  }
  const forestCover = state.planetaryBoundariesSystem.landUse.globalHabitatCoverPercent / 100;
  const forestThreshold = 0.75; // 75% safe boundary (FAO)

  const isImproving = forestCover > forestThreshold;

  // Governance capacity (rewilding programs, habitat protection)
  if (!state.government.governanceQuality) throw new Error(`❌ governanceQuality undefined in planetaryBoundaryRecovery at month ${state.currentMonth}`);
  if (typeof state.government.governanceQuality.institutionalCapacity !== "number") throw new Error(`❌ institutionalCapacity not a number in planetaryBoundaryRecovery at month ${state.currentMonth}`);
  const institutionalCapacity = state.government.governanceQuality.institutionalCapacity;
  const governanceMultiplier = institutionalCapacity < 0.5 ? 0.5 : 1.0;

  if (isImproving && governanceMultiplier >= 0.3) {
    // recoveryMonths is REQUIRED field - must be initialized
    const currentRecoveryMonths = assertStateProperty(boundary, 'recoveryMonths', {
      location: 'trackLandSystemRecovery (land system boundary)',
      month: state.currentMonth
    });
    boundary.recoveryMonths = currentRecoveryMonths + governanceMultiplier;

    // Stage 1: Tree cover (360 months = 30 years)
    if (boundary.recoveryMonths >= 360 && !boundary.partialRecovery) {
      boundary.partialRecovery = true;
      boundary.trend = 'improving';
      console.log(`\n=== Land System PARTIAL RECOVERY ===`);
      console.log(`  Tree cover restored (30 years)`);
      console.log(`  Ecosystem function restoration in progress (70 more years)`);
    }

    // Stage 2: Ecosystem function (1200 months = 100 years)
    if (boundary.recoveryMonths >= 1200) {
      boundary.status = 'safe';
      boundary.trend = 'improving';
      boundary.monthsBreached = 0;
      boundary.breachYear = null;
      boundary.partialRecovery = false; // Full recovery achieved

      console.log(`\n=== Land System FULL RECOVERY ===`);
      console.log(`  Ecosystem function fully restored (100 years)`);
      console.log(`  Forest cover: ${(forestCover * 100).toFixed(1)}%`);
    }
  } else {
    boundary.recoveryMonths = 0;
    boundary.partialRecovery = false;
  }
}

// ============================================================================
// TIER 3: IRREVERSIBLE / STABILIZATION ONLY
// ============================================================================

/**
 * Biosphere Integrity Stabilization (extinction is permanent)
 *
 * Research: Extinction is one-way; population recovery possible but takes decades
 * Mechanism: Cannot reverse extinctions, only stop further loss
 * Timeline: Stabilization when extinction rate < 10% baseline (not recovery)
 *
 * IRREVERSIBILITY FRAMEWORK (Nov 20, 2025):
 * - Uses asymptoteRecovery() with 5% extinction debt floor
 * - Recovery half-life: 200 years (century-scale ecosystem recovery)
 * - Boundary approaches floor asymptotically, never reaches zero
 *
 * Citations:
 * - Richardson et al. (2023): Current ~2× safe boundary (not 100-1000×, see BLOCKER-2 fix)
 * - IPBES (2024): Historical estimates varied 100-1000× (measurement uncertainty)
 * - Ceballos et al. (2023): Extinction irreversibility
 * - Saiga antelope case: Population recovery (not species restoration)
 */
function updateBiosphereStabilization(state: GameState, rng: RNGFunction): void {
  const boundary = state.planetaryBoundariesSystem?.boundaries.biosphere_integrity;
  if (!boundary) return;

  if (!state.planetaryBoundariesSystem?.landUse) {
    throw new Error(`❌ planetaryBoundariesSystem.landUse is undefined at month ${state.currentMonth} in trackBiodiversityRecovery`);
  }
  if (typeof state.planetaryBoundariesSystem.landUse.globalExtinctionRate !== 'number') {
    throw new Error(`❌ globalExtinctionRate is not a number at month ${state.currentMonth}`);
  }
  if (typeof state.planetaryBoundariesSystem.landUse.naturalExtinctionRate !== 'number') {
    throw new Error(`❌ naturalExtinctionRate is not a number at month ${state.currentMonth}`);
  }
  const extinctionRate = state.planetaryBoundariesSystem.landUse.globalExtinctionRate;
  const naturalRate = state.planetaryBoundariesSystem.landUse.naturalExtinctionRate;

  // FIX (Oct 21, 2025): Stabilization activates when WORKING TOWARD recovery, not when already recovered
  // FIX (Oct 30, 2025): BLOCKER-2 - Initial extinction rate is ~2.2× (not 100×)
  // Stabilization: Extinction rate DECLINING below initial 2025 baseline (~2.2× natural)
  const INITIAL_EXTINCTION_RATE = 2.2; // Richardson et al. (2023): Current ~2× safe boundary
  const extinctionRateDeclining = extinctionRate < INITIAL_EXTINCTION_RATE;
  const isStabilizing = extinctionRateDeclining;

  // FIX (Oct 21, 2025): ACTUALLY IMPROVE BIODIVERSITY (population recovery, not species restoration)
  // Research: Saiga antelope recovered from ~50,000 to 1.3M in 15 years (population, not extinction reversal)
  // Stabilization allows POPULATION RECOVERY for surviving species
  // HIGH-11 FIX (Nov 28, 2025): Disable biodiversity recovery during historical mode
  // Historical biodiversity decline is handled by environmental.ts with empirical WWF LPI rates
  if (isStabilizing && !isHistoricalModeActive(state)) {
    boundary.stabilizing = true;
    boundary.trend = 'stable'; // Not "improving" - damage is permanent

    // Population recovery for surviving species: 0.1-0.5% monthly
    // This is NOT reversing extinction - species stay lost
    // But populations of SURVIVING species can recover
    // FIX (Oct 21, 2025): Use compatibility layer to check both old and new tech systems
    const hasEcosystemManagement = state.techTreeState.unlockedTech.includes('ecosystem_management_ai');

    const baseRecoveryRate = 0.001; // 0.1%/month (slow population rebound)
    const techBonus = hasEcosystemManagement ? 0.004 : 0; // +0.4% with AI ecosystem management
    const recoveryRate = baseRecoveryRate + techBonus;

    // Improve biodiversity INDEX (population recovery, not species resurrection)
    if (state.environmentalAccumulation) {
      const env = state.environmentalAccumulation;
      env.biodiversityIndex = Math.min(1.0, env.biodiversityIndex + recoveryRate);

      // Log every 2 years if recovering
      if (state.currentMonth % 24 === 0 && recoveryRate > 0.001) {
        console.log(`🦁 POPULATION RECOVERY: Surviving species rebounding at +${(recoveryRate * 100).toFixed(2)}%/month`);
        console.log(`   Biodiversity index: ${(env.biodiversityIndex * 100).toFixed(1)}% (extinct species still gone)`);
      }
    }

    // IRREVERSIBILITY FRAMEWORK (Nov 20, 2025):
    // Apply asymptotic recovery to boundary value with 5% extinction debt floor
    // Research: Committed extinctions from habitat loss, climate lag, invasive species
    const minimumAsymptoticValue = assertStateProperty(boundary, 'minimumAsymptoticValue', {
      location: 'updateBiosphereStabilization',
      month: state.currentMonth
    });
    const recoveryHalfLife = assertStateProperty(boundary, 'recoveryHalfLife', {
      location: 'updateBiosphereStabilization',
      month: state.currentMonth
    });

    // Track peak value for irreversibility floor calculation
    if (!boundary.peak || boundary.currentValue > boundary.peak) {
      boundary.peak = boundary.currentValue;
    }

    // Target value: asymptotic floor (minimum boundary value we can approach)
    const targetValue = minimumAsymptoticValue * 2.0; // Scale: 0-2 normalized range

    // Apply asymptotic recovery (approach floor exponentially, never reach zero)
    const newValue = asymptoteRecovery(
      boundary.currentValue,
      targetValue,
      recoveryHalfLife,
      minimumAsymptoticValue,
      1/12 // deltaYears = 1 month
    );

    // Defensive assertion: Verify no NaN/Infinity
    const recoveredValue = assertFinite(newValue, {
      location: 'updateBiosphereStabilization',
      valueName: 'asymptoteRecovery result',
      month: state.currentMonth,
      additionalInfo: {
        currentValue: boundary.currentValue,
        targetValue,
        recoveryHalfLife,
        minimumAsymptoticValue
      }
    });

    boundary.currentValue = recoveredValue;

    if (state.currentMonth % 120 === 0) { // Log every 10 years
      console.log(`\n=== Biosphere Integrity STABILIZED (not recovered) ===`);
      console.log(`  Extinction rate: ${extinctionRate.toFixed(1)}× natural (down from ${INITIAL_EXTINCTION_RATE}×)`);
      console.log(`  Boundary value: ${boundary.currentValue.toFixed(3)} (approaching ${targetValue.toFixed(3)} floor)`);
      console.log(`  Extinction debt: ${(minimumAsymptoticValue * 100).toFixed(0)}% irreversible (committed extinctions)`);
      console.log(`  Lost species: PERMANENT (extinction is irreversible)`);
      console.log(`  Population recovery: In progress for surviving species`);
    }
  } else {
    boundary.stabilizing = false;
  }

  // NEVER un-breach this boundary (extinction is permanent)
}

/**
 * Ocean Acidification Partial Recovery (surface only, 100-300 years)
 *
 * Research: Deep ocean 15-18% more acidic permanently (300+ year lag)
 * Mechanism: Surface ocean can recover if net-negative emissions, deep ocean cannot
 * Timeline: 100 years (1200 months) for surface recovery
 *
 * IRREVERSIBILITY FRAMEWORK (Nov 20, 2025):
 * - Surface component: Asymptotic recovery toward baseline (reversible)
 * - Deep ocean component: 15-18% permanent acidification (irreversible floor)
 * - Combined boundary value reflects both components
 *
 * Citations:
 * - Jiang et al. (2023): Deep ocean acidification irreversibility (15-18% permanent)
 * - IPCC AR6 WG2 (2022): Ocean carbonate chemistry hysteresis
 * - Hönisch et al. (2012): Paleo-ocean acidification recovery timescales
 */
function updateOceanAcidificationRecovery(state: GameState, rng: RNGFunction): void {
  const boundary = state.planetaryBoundariesSystem?.boundaries.ocean_acidification;
  if (!boundary) return;

  // Calculate globalWarming from climate boundary
  const climateBoundary = state.planetaryBoundariesSystem?.boundaries.climate_change;
  const globalWarming = climateBoundary ? climateBoundary.currentValue * 2.0 : 1.2;

  // FIX #18.1 (Oct 22, 2025): Read emissions from correct state property
  // CRITICAL: Ocean acidification recovery was reading climateState.annualEmissions (never updated)
  // but FIX #18 updates resourceEconomy.co2.annualEmissions (actual emissions)
  //
  // FIX (Oct 25, 2025): Replaced defensive fallback with assertive validation
  const rawEmissions = assertDefined(
    state.resourceEconomy?.co2?.annualEmissions,
    {
      location: 'updateOceanAcidificationRecovery',
      valueName: 'resourceEconomy.co2.annualEmissions',
      month: state.currentMonth,
      expectedSource: 'resourceDepletion.ts CO2 system'
    }
  );
  const annualEmissions = assertFinite(rawEmissions, {
    location: 'updateOceanAcidificationRecovery',
    valueName: 'annualEmissions',
    month: state.currentMonth
  });
  // CDR tracking: No dedicated property yet, use natural sinks as proxy
  const annualCDR = (() => {
    if (!state.resourceEconomy?.co2) throw new Error(`❌ resourceEconomy.co2 undefined in planetaryBoundaryRecovery at month ${state.currentMonth}`);
    if (typeof state.resourceEconomy.co2.oceanAbsorption !== "number" || typeof state.resourceEconomy.co2.landAbsorption !== "number") throw new Error(`❌ co2 absorption values not numbers in planetaryBoundaryRecovery at month ${state.currentMonth}`);
    return state.resourceEconomy.co2.oceanAbsorption + state.resourceEconomy.co2.landAbsorption;
  })();

  const netEmissions = annualEmissions - annualCDR;
  const surfaceRecoveryPossible = globalWarming < 1.5 && netEmissions < 0;

  // If warming > 3°C, even surface recovery becomes impossible (research-skeptic requirement)
  if (globalWarming > 3.0) {
    boundary.surfaceRecovered = false;
    boundary.recoveryMonths = 0;
    return;
  }

  if (surfaceRecoveryPossible) {
    boundary.recoveryMonths = boundary.recoveryMonths + 1;

    // IRREVERSIBILITY FRAMEWORK (Nov 20, 2025):
    // Ocean acidification has TWO components:
    // 1. Surface ocean (0-200m): Can recover with net-negative emissions (100-year timescale)
    // 2. Deep ocean (200m+): Permanent acidification (15-18% irreversible, 300+ year lag)
    //
    // Deep ocean irreversibility floor: ~15% of peak acidification
    // Research: Jiang et al. (2023) - Deep ocean mixing time scale 300+ years
    const DEEP_OCEAN_IRREVERSIBILITY_FLOOR = 0.15; // 15% of acidification is permanent

    // Track peak acidification for floor calculation
    if (!boundary.peak || boundary.currentValue > boundary.peak) {
      boundary.peak = boundary.currentValue;
    }

    // Target value: Deep ocean irreversibility floor
    // If peak was 1.5× threshold, floor is 0.15 × 1.5 = 0.225 (22.5% of peak remains)
    const targetValue = DEEP_OCEAN_IRREVERSIBILITY_FLOOR * (boundary.peak || boundary.currentValue);

    // Recovery half-life: 100 years for surface, but combined system approaches deep ocean floor
    const recoveryHalfLife = 100; // years (surface recovery timescale)

    // Apply asymptotic recovery (approach deep ocean floor, never reach zero)
    const newValue = asymptoteRecovery(
      boundary.currentValue,
      targetValue,
      recoveryHalfLife,
      DEEP_OCEAN_IRREVERSIBILITY_FLOOR,
      1/12 // deltaYears = 1 month
    );

    // Defensive assertion: Verify no NaN/Infinity
    const recoveredValue = assertFinite(newValue, {
      location: 'updateOceanAcidificationRecovery',
      valueName: 'asymptoteRecovery result',
      month: state.currentMonth,
      additionalInfo: {
        currentValue: boundary.currentValue,
        targetValue,
        recoveryHalfLife,
        deepOceanFloor: DEEP_OCEAN_IRREVERSIBILITY_FLOOR,
        peak: boundary.peak
      }
    });

    boundary.currentValue = recoveredValue;

    // Surface recovery: 100 years (1200 months)
    if (boundary.recoveryMonths >= 1200) {
      boundary.surfaceRecovered = true;
      boundary.trend = 'stable'; // Not "improving" - deep ocean still acidified

      console.log(`\n=== Ocean Acidification SURFACE RECOVERY ===`);
      console.log(`  Surface ocean: Partially recovered (100 years)`);
      console.log(`  Boundary value: ${boundary.currentValue.toFixed(3)} (approaching ${targetValue.toFixed(3)} floor)`);
      console.log(`  Deep ocean: Still 15-18% more acidic (PERMANENT on human timescales)`);
      console.log(`  Boundary: STILL BREACHED (deep ocean irreversible)`);
    }

    // Log progress every 24 months
    if (state.currentMonth % 24 === 0) {
      console.log(`🌊 OCEAN ACIDIFICATION RECOVERY: Boundary ${boundary.currentValue.toFixed(3)} → ${targetValue.toFixed(3)} (deep ocean floor)`);
    }
  } else {
    boundary.recoveryMonths = 0;
  }

  // NEVER fully un-breach this boundary (deep ocean permanent)
}

/**
 * Novel Entities Stabilization (PFAS/microplastics are permanent)
 *
 * Research: No environmental cleanup technology exists at scale
 * Mechanism: Can only stop NEW inputs, cannot remove existing contamination
 * Timeline: Instantaneous stabilization when inputs < 5% baseline
 *
 * IRREVERSIBILITY FRAMEWORK (Nov 20, 2025):
 * - Uses asymptoteRecovery() with 15% irreversibility floor (atmospheric distribution + covalent binding)
 * - Recovery half-life: 75 years (Montreal Protocol analog for PFAS phase-out)
 * - Legacy stock release: 46,000 Mt PFAS accumulated (Persson 2022)
 * - Boundary approaches floor asymptotically, never reaches zero
 *
 * Citations:
 * - Glüge et al. (2020): PFAS environmental persistence
 * - Cousins et al. (2022): "Forever chemicals" atmospheric half-life 50-100 years
 * - Sörengård et al. (2024): Economic impossibility of cleanup at current emission rates
 * - Pyrolysis: Works on concentrated sources (biosolids) not environmental cleanup
 */
function updateNovelEntitiesStabilization(state: GameState, rng: RNGFunction): void {
  const boundary = state.planetaryBoundariesSystem?.boundaries.novel_entities;
  if (!boundary) return;

  // Check if PFAS production banned (policy, not technology)
  // Note: These policies would need to be added to GameState.policies interface
  // For now, assume no policy intervention (conservative default)
  const pfasBanned = false; // TODO: Add pfasProductionBan to policies interface

  // Check if microplastic regulations in place
  const microplasticRegulated = false; // TODO: Add microplasticRegulations to policies interface

  const inputsStopped = pfasBanned && microplasticRegulated;

  if (inputsStopped) {
    boundary.inputsStopped = true;
    boundary.trend = 'stable'; // Not "improving" - existing contamination permanent

    // IRREVERSIBILITY FRAMEWORK (Nov 20, 2025):
    // Novel Entities has TWO mechanisms:
    // 1. New inputs stopped (policy intervention)
    // 2. Legacy stock release from environmental reservoirs (exponential decay)
    //
    // Research: Cousins et al. (2022) - PFAS atmospheric half-life 50-100 years
    // Even with inputs stopped, existing contamination persists for decades

    // Get irreversibility parameters from boundary
    const minimumAsymptoticValue = assertStateProperty(boundary, 'minimumAsymptoticValue', {
      location: 'updateNovelEntitiesStabilization',
      month: state.currentMonth
    });
    const recoveryHalfLife = assertStateProperty(boundary, 'recoveryHalfLife', {
      location: 'updateNovelEntitiesStabilization',
      month: state.currentMonth
    });

    // Track peak contamination for irreversibility floor calculation
    if (!boundary.peak || boundary.currentValue > boundary.peak) {
      boundary.peak = boundary.currentValue;
    }

    // Track peak value (for 90% irreversible floor from Novel Entities redesign)
    if (!boundary.peakValue || boundary.currentValue > boundary.peakValue) {
      boundary.peakValue = boundary.currentValue;
    }

    // Target value: 15% irreversibility floor (atmospheric distribution + covalent binding)
    // Research: Cousins et al. (2022) - PFAS ubiquitous in atmosphere, no cleanup tech
    const targetValue = minimumAsymptoticValue * 2.0; // Scale: 0-2 normalized range

    // Apply asymptotic recovery (approach floor exponentially, never reach zero)
    const newValue = asymptoteRecovery(
      boundary.currentValue,
      targetValue,
      recoveryHalfLife,
      minimumAsymptoticValue,
      1/12 // deltaYears = 1 month
    );

    // Defensive assertion: Verify no NaN/Infinity
    const recoveredValue = assertFinite(newValue, {
      location: 'updateNovelEntitiesStabilization',
      valueName: 'asymptoteRecovery result',
      month: state.currentMonth,
      additionalInfo: {
        currentValue: boundary.currentValue,
        targetValue,
        recoveryHalfLife,
        minimumAsymptoticValue,
        peak: boundary.peak
      }
    });

    boundary.currentValue = recoveredValue;

    // Legacy stock release (if tracked)
    if (boundary.legacyStock && boundary.legacyStock > 0) {
      // Release accumulated PFAS from environmental reservoirs
      // Research: Lake Erie phosphorus case study - sediment release matches river inputs
      const releaseHalfLife = recoveryHalfLife; // Same timescale as atmospheric clearance

      const { newStock, released } = legacyStockRelease(
        boundary.legacyStock,
        releaseHalfLife,
        1/12 // deltaYears = 1 month
      );

      // Defensive assertions
      const validatedStock = assertFinite(newStock, {
        location: 'updateNovelEntitiesStabilization',
        valueName: 'legacyStockRelease newStock',
        month: state.currentMonth,
        additionalInfo: { oldStock: boundary.legacyStock, released }
      });

      const validatedReleased = assertFinite(released, {
        location: 'updateNovelEntitiesStabilization',
        valueName: 'legacyStockRelease released',
        month: state.currentMonth,
        additionalInfo: { oldStock: boundary.legacyStock, newStock }
      });

      boundary.legacyStock = validatedStock;

      // Log every 24 months
      if (state.currentMonth % 24 === 0) {
        console.log(`🧪 PFAS LEGACY RELEASE: ${validatedReleased.toFixed(1)} Mt/month from environmental reservoirs`);
        console.log(`   Remaining stock: ${validatedStock.toFixed(0)} Mt (of 46,000 Mt initial)`);
      }
    }

    // Log stabilization status every 10 years
    if (state.currentMonth % 120 === 0) {
      console.log(`\n=== Novel Entities INPUTS STOPPED (not recovered) ===`);
      console.log(`  PFAS production: BANNED`);
      console.log(`  Microplastic regulations: ENFORCED`);
      console.log(`  Boundary value: ${boundary.currentValue.toFixed(3)} (approaching ${targetValue.toFixed(3)} floor)`);
      console.log(`  Irreversibility floor: ${(minimumAsymptoticValue * 100).toFixed(0)}% (atmospheric distribution + covalent binding)`);
      console.log(`  Existing contamination: PERMANENT (no environmental cleanup technology)`);
      console.log(`  Boundary: STILL BREACHED (ubiquitous contamination irreversible)`);
    }
  } else {
    boundary.inputsStopped = false;
  }

  // NEVER un-breach this boundary (contamination is permanent)
}

/**
 * Calculate progressive ecological score (replaces binary breach counting)
 *
 * Research-backed impact-based weighting (mortality estimates):
 * - Biosphere: 25% (famine from ecosystem collapse)
 * - Climate: 25% (wet bulb deaths + crop failures)
 * - Freshwater: 15% (direct survival need)
 * - Ocean: 15% (fisheries collapse = protein loss)
 * - P/N: 10% (eutrophication mortality)
 * - Land: 5% (indirect via food production)
 * - Novel entities: 3% (long-term cancer/endocrine)
 * - Aerosols: 2% (respiratory deaths)
 *
 * Progressive scoring: Gives credit for partial recovery before full un-breach
 */
export function calculateProgressiveEcologicalScore(state: GameState): number {
  const boundaries = state.planetaryBoundariesSystem?.boundaries;
  if (!boundaries) return 0;

  // Helper: Calculate individual boundary score (0-100)
  const boundaryScore = (name: BoundaryName): number => {
    const b = boundaries[name];
    if (!b) return 0;

    // If safe, full credit
    if (b.status === 'safe') return 100;

    // Otherwise, calculate based on recovery progress
    switch (name) {
      case 'climate_change': {
        // Tier 2: Partial recovery possible
        // Full recovery: 24 months sustained improvement
        if (typeof b.recoveryMonths !== 'number' || isNaN(b.recoveryMonths)) {
          console.error(`❌ climate_change.recoveryMonths is ${typeof b.recoveryMonths} / ${b.recoveryMonths} at month ${state.currentMonth}`);
          return 0;
        }
        const progress = Math.min(1.0, b.recoveryMonths / 24);
        return progress * 100;
      }

      case 'freshwater_change': {
        // Tier 1: Reversible (15 years / 180 months)
        if (typeof b.recoveryMonths !== 'number' || isNaN(b.recoveryMonths)) {
          console.error(`❌ freshwater_change.recoveryMonths is ${typeof b.recoveryMonths} / ${b.recoveryMonths} at month ${state.currentMonth}`);
          return 0;
        }
        const progress = Math.min(1.0, b.recoveryMonths / 180);
        return progress * 100;
      }

      case 'biogeochemical_flows': {
        // Tier 2: Partial recovery (5 years / 60 months with tech)
        if (typeof b.recoveryMonths !== 'number' || isNaN(b.recoveryMonths)) {
          console.error(`❌ biogeochemical_flows.recoveryMonths is ${typeof b.recoveryMonths} / ${b.recoveryMonths} at month ${state.currentMonth}`);
          return 0;
        }
        const progress = Math.min(1.0, b.recoveryMonths / 60);
        return progress * 100;
      }

      case 'land_system_change': {
        // Tier 2: Two-stage recovery
        if (b.partialRecovery) return 50; // Tree cover restored
        if (typeof b.recoveryMonths !== 'number' || isNaN(b.recoveryMonths)) {
          console.error(`❌ land_system_change.recoveryMonths is ${typeof b.recoveryMonths} / ${b.recoveryMonths} at month ${state.currentMonth}`);
          return 0;
        }
        const progress = Math.min(0.5, b.recoveryMonths / 360); // Progress toward partial
        return progress * 100;
      }

      case 'biosphere_integrity': {
        // Tier 3: Irreversible baseline, but habitat restoration unlocks recovery
        // Oct 22, 2025: Habitat restoration can unlock 25% → 80% recovery potential

        // Base: Extinction is permanent, max 25% if stabilized
        let baseScore = b.stabilizing ? 25 : 0;

        // Check for habitat restoration deployment (unlocks recovery beyond 25%)
        const { isTechDeployed } = require('./techTree/helpers');
        const habitatRestorationLevel = isTechDeployed(state, 'habitat_restoration');
        const rewildingLevel = isTechDeployed(state, 'ecological_proxy_rewilding');
        const ecosystemAILevel = isTechDeployed(state, 'ecosystem_management_ai');

        if (habitatRestorationLevel > 0 && b.stabilizing) {
          // Habitat restoration unlocks 25% → 80% recovery over 20-30 years
          // Research: Moreno-Mateos et al. (2017) - functional recovery 10-50 years
          // Max potential: 80% (can't fully reverse extinction, but can restore ecosystems)
          const maxPotential = 80;
          const restorationBonus = (maxPotential - 25) * habitatRestorationLevel;  // 0-55 bonus

          // Rewilding adds 10-20% boost to recovery rate
          const rewildingBonus = 15 * rewildingLevel;  // 0-15 bonus

          // Ecosystem Management AI multiplies effectiveness by 1.3×
          const aiMultiplier = 1.0 + (0.3 * ecosystemAILevel);

          baseScore = 25 + (restorationBonus + rewildingBonus) * aiMultiplier;
        }

        return Math.min(80, baseScore);  // Hard cap at 80% (extinction is still permanent)
      }

      case 'ocean_acidification': {
        // Tier 3: Partial recovery (surface only)
        if (b.surfaceRecovered) return 40; // Max 40% (deep ocean permanent)
        if (typeof b.recoveryMonths !== 'number' || isNaN(b.recoveryMonths)) {
          console.error(`❌ ocean_acidification.recoveryMonths is ${typeof b.recoveryMonths} / ${b.recoveryMonths} at month ${state.currentMonth}`);
          return 0;
        }
        const progress = Math.min(0.4, b.recoveryMonths / 1200);
        return progress * 100;
      }

      case 'novel_entities': {
        // Tier 3: Irreversible, inputs stopped counts
        return b.inputsStopped ? 20 : 0; // Max 20% (existing contamination permanent)
      }

      case 'atmospheric_aerosols': {
        // Tier 1: Reversible (12 months)
        if (typeof b.recoveryMonths !== 'number' || isNaN(b.recoveryMonths)) {
          console.error(`❌ atmospheric_aerosols.recoveryMonths is ${typeof b.recoveryMonths} / ${b.recoveryMonths} at month ${state.currentMonth}`);
          return 0;
        }
        const progress = Math.min(1.0, b.recoveryMonths / 12);
        return progress * 100;
      }

      case 'stratospheric_ozone': {
        // Already recovering (Montreal Protocol success)
        // Use ozone recovery progress from ozoneRecovery system
        if (!state.planetaryBoundariesSystem?.ozoneRecovery) {
          throw new Error(`❌ planetaryBoundariesSystem.ozoneRecovery is undefined at month ${state.currentMonth}`);
        }
        if (typeof state.planetaryBoundariesSystem.ozoneRecovery.recoveryProgress !== 'number') {
          throw new Error(`❌ ozoneRecovery.recoveryProgress is not a number at month ${state.currentMonth}`);
        }
        const ozoneProgress = state.planetaryBoundariesSystem.ozoneRecovery.recoveryProgress;
        return ozoneProgress * 100;
      }

      default:
        return 0;
    }
  };

  // Impact-based weights (research-skeptic validated)
  const scores = [
    { name: 'biosphere_integrity', value: boundaryScore('biosphere_integrity'), weight: 0.25 },
    { name: 'climate_change', value: boundaryScore('climate_change'), weight: 0.25 },
    { name: 'freshwater_change', value: boundaryScore('freshwater_change'), weight: 0.15 },
    { name: 'ocean_acidification', value: boundaryScore('ocean_acidification'), weight: 0.15 },
    { name: 'biogeochemical_flows', value: boundaryScore('biogeochemical_flows'), weight: 0.10 },
    { name: 'land_system_change', value: boundaryScore('land_system_change'), weight: 0.05 },
    { name: 'novel_entities', value: boundaryScore('novel_entities'), weight: 0.03 },
    { name: 'atmospheric_aerosols', value: boundaryScore('atmospheric_aerosols'), weight: 0.02 }
  ];

  // DEBUG: Check for NaN in any score
  for (const s of scores) {
    if (isNaN(s.value)) {
      const b = boundaries[s.name as BoundaryName];
      console.error(`\n❌ NaN detected in boundary score: ${s.name}`);
      console.error(`   status: ${b?.status}`);
      console.error(`   recoveryMonths: ${b?.recoveryMonths}`);
      console.error(`   currentValue: ${b?.currentValue}`);
      console.error(`   boundaryThreshold: ${b?.boundaryThreshold}`);
      console.error(`   Month: ${state.currentMonth}`);
      throw new Error(`Boundary ${s.name} returned NaN - initialization bug`);
    }
  }

  const weightedScore = scores.reduce((sum, s) => sum + (s.value * s.weight), 0);

  // DIAGNOSTIC: Log boundary scores every 24 months
  if (state.currentMonth % 24 === 0) {
    console.log(`\n🌍 ECOLOGICAL DUI BREAKDOWN (Month ${state.currentMonth}):`);
    console.log(`   Total Score: ${weightedScore.toFixed(1)}/100`);
    for (const s of scores) {
      const contribution = (s.value * s.weight).toFixed(1);
      const boundary = boundaries[s.name as BoundaryName];
      const status = boundary?.status || 'unknown';
      const recoveryMonths = boundary?.recoveryMonths || 0;
      console.log(`   ${s.name.padEnd(25)}: ${s.value.toFixed(1).padStart(5)}/100 × ${(s.weight * 100).toFixed(0).padStart(2)}% = ${contribution.padStart(4)} (status: ${status}, recovery: ${recoveryMonths}mo)`);
    }
  }

  return Math.max(0, Math.min(100, weightedScore));
}
