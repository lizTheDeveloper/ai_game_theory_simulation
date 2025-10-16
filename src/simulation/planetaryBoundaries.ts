/**
 * Planetary Boundaries System Implementation (TIER 3.1)
 *
 * Implements Kate Raworth's Doughnut Economics + Stockholm Resilience Centre framework
 *
 * Key mechanics:
 * - Track 9 planetary boundaries (7/9 breached in 2025)
 * - Non-linear tipping point risk (exponential with multiple breaches)
 * - Core boundaries (climate + biosphere) amplify all risks
 * - Cascading feedback loops when risk > 70%
 * - Irreversible collapse pathway (48 months to extinction)
 *
 * Research: Kate Raworth 2012-2025, Stockholm Resilience Centre, PIK Potsdam
 */

import { GameState } from '@/types/game';
import {
  PlanetaryBoundariesSystem,
  PlanetaryBoundary,
  BoundaryName,
  BoundaryStatus,
  BoundaryTrend,
  TippingPointCascade,
  PlanetaryBoundaryEvent,
  LandUseSystem,
  OzoneRecoverySystem
} from '@/types/planetaryBoundaries';

/**
 * Initialize planetary boundaries system with 2025 baseline
 *
 * Based on Stockholm Resilience Centre 2025 data:
 * - 7 of 9 boundaries breached
 * - 2 safe (ozone improving, aerosols mostly safe)
 * - Climate + Biosphere = core boundaries (already breached)
 */
export function initializePlanetaryBoundariesSystem(): PlanetaryBoundariesSystem {
  const boundaries: Record<BoundaryName, PlanetaryBoundary> = {} as any;

  // === BREACHED BOUNDARIES (7/9) ===

  // 1. CLIMATE CHANGE (Core Boundary) - 425 ppm CO2 vs 350 ppm safe
  boundaries.climate_change = {
    name: 'climate_change',
    displayName: 'Climate Change',
    currentValue: 1.21,                    // 21% beyond boundary
    boundaryThreshold: 1.0,
    preIndustrialValue: 0.0,
    highRiskThreshold: 1.4,
    status: 'beyond_boundary',
    trend: 'worsening',
    breachYear: 1990,
    monthsBreached: (2025 - 1990) * 12,
    isCoreBoundary: true,
    interactionStrength: 1.0,              // Affects everything
    reversible: true,                      // Theoretically (carbon capture)
    timescaleYears: 50,
    extinctionContribution: 0.25,
    tippingPointRisk: 0.30,
  };

  // 2. BIOSPHERE INTEGRITY (Core Boundary) - 100-1000x extinction rate
  boundaries.biosphere_integrity = {
    name: 'biosphere_integrity',
    displayName: 'Biosphere Integrity (Biodiversity)',
    currentValue: 10.0,                    // 10x boundary (catastrophic)
    boundaryThreshold: 1.0,
    preIndustrialValue: 0.0,
    highRiskThreshold: 1.5,
    status: 'high_risk',
    trend: 'worsening',
    breachYear: 1950,
    monthsBreached: (2025 - 1950) * 12,
    isCoreBoundary: true,
    interactionStrength: 1.0,              // Affects everything
    reversible: false,                     // Extinct species don't come back (easily)
    timescaleYears: 100,
    extinctionContribution: 0.35,          // Highest contribution
    tippingPointRisk: 0.40,
  };

  // 3. LAND SYSTEM CHANGE - 62% forest vs 75% needed
  boundaries.land_system_change = {
    name: 'land_system_change',
    displayName: 'Land System Change',
    currentValue: 1.17,                    // 17% beyond boundary
    boundaryThreshold: 1.0,
    preIndustrialValue: 0.0,
    highRiskThreshold: 1.4,
    status: 'beyond_boundary',
    trend: 'worsening',
    breachYear: 2000,
    monthsBreached: (2025 - 2000) * 12,
    isCoreBoundary: false,
    interactionStrength: 0.7,
    reversible: true,                      // Reforestation possible
    timescaleYears: 50,
    extinctionContribution: 0.15,
    tippingPointRisk: 0.20,
  };

  // 4. FRESHWATER CHANGE - Groundwater depletion accelerating
  boundaries.freshwater_change = {
    name: 'freshwater_change',
    displayName: 'Freshwater Change',
    currentValue: 1.15,                    // 15% beyond boundary
    boundaryThreshold: 1.0,
    preIndustrialValue: 0.0,
    highRiskThreshold: 1.5,
    status: 'beyond_boundary',
    trend: 'worsening',
    breachYear: 2023,
    monthsBreached: (2025 - 2023) * 12,
    isCoreBoundary: false,
    interactionStrength: 0.6,
    reversible: false,                     // Aquifer depletion irreversible
    timescaleYears: 30,
    extinctionContribution: 0.20,
    tippingPointRisk: 0.25,
  };

  // 5. BIOGEOCHEMICAL FLOWS (Phosphorus + Nitrogen) - 3x limit!
  boundaries.biogeochemical_flows = {
    name: 'biogeochemical_flows',
    displayName: 'Biogeochemical Flows (N & P)',
    currentValue: 2.94,                    // 294% of boundary!
    boundaryThreshold: 1.0,
    preIndustrialValue: 0.0,
    highRiskThreshold: 1.5,
    status: 'high_risk',
    trend: 'worsening',
    breachYear: 1985,
    monthsBreached: (2025 - 1985) * 12,
    isCoreBoundary: false,
    interactionStrength: 0.8,
    reversible: true,                      // Reduce fertilizer use
    timescaleYears: 20,
    extinctionContribution: 0.15,
    tippingPointRisk: 0.30,
  };

  // 6. NOVEL ENTITIES (Chemical Pollution) - Microplastics, PFAS
  boundaries.novel_entities = {
    name: 'novel_entities',
    displayName: 'Novel Entities (Chemical Pollution)',
    currentValue: 1.50,                    // 50% beyond boundary
    boundaryThreshold: 1.0,
    preIndustrialValue: 0.0,
    highRiskThreshold: 2.0,
    status: 'beyond_boundary',
    trend: 'worsening',
    breachYear: 2022,
    monthsBreached: (2025 - 2022) * 12,
    isCoreBoundary: false,
    interactionStrength: 0.5,
    reversible: false,                     // Forever chemicals
    timescaleYears: 100,
    extinctionContribution: 0.10,
    tippingPointRisk: 0.15,
  };

  // 7. OCEAN ACIDIFICATION - Just breached Sept 2025!
  boundaries.ocean_acidification = {
    name: 'ocean_acidification',
    displayName: 'Ocean Acidification',
    currentValue: 1.05,                    // 5% beyond boundary (recent!)
    boundaryThreshold: 1.0,
    preIndustrialValue: 0.0,
    highRiskThreshold: 1.3,
    status: 'beyond_boundary',
    trend: 'worsening',
    breachYear: 2025,
    monthsBreached: 0,                     // Just breached
    isCoreBoundary: false,
    interactionStrength: 0.6,
    reversible: true,                      // Ocean alkalinity enhancement
    timescaleYears: 50,
    extinctionContribution: 0.20,
    tippingPointRisk: 0.10,
  };

  // === SAFE BOUNDARIES (2/9) ===

  // 8. STRATOSPHERIC OZONE - RECOVERING! (Montreal Protocol success)
  boundaries.stratospheric_ozone = {
    name: 'stratospheric_ozone',
    displayName: 'Stratospheric Ozone Depletion',
    currentValue: 0.85,                    // Within safe zone, improving
    boundaryThreshold: 1.0,
    preIndustrialValue: 0.0,
    highRiskThreshold: 1.2,
    status: 'safe',
    trend: 'improving',                    // Only boundary improving!
    breachYear: null,
    monthsBreached: 0,
    isCoreBoundary: false,
    interactionStrength: 0.3,
    reversible: true,
    timescaleYears: 50,
    extinctionContribution: 0.0,
    tippingPointRisk: 0.0,
  };

  // 9. ATMOSPHERIC AEROSOLS - Mostly safe (regional issues)
  boundaries.atmospheric_aerosols = {
    name: 'atmospheric_aerosols',
    displayName: 'Atmospheric Aerosol Loading',
    currentValue: 0.70,                    // Safe zone
    boundaryThreshold: 1.0,
    preIndustrialValue: 0.0,
    highRiskThreshold: 1.5,
    status: 'safe',
    trend: 'improving',
    breachYear: null,
    monthsBreached: 0,
    isCoreBoundary: false,
    interactionStrength: 0.4,
    reversible: true,
    timescaleYears: 10,
    extinctionContribution: 0.0,
    tippingPointRisk: 0.0,
  };

  // Calculate initial aggregate metrics
  const boundariesBreached = Object.values(boundaries)
    .filter(b => b.status !== 'safe').length;

  const boundariesWorsening = Object.values(boundaries)
    .filter(b => b.trend === 'worsening').length;

  const boundariesImproving = Object.values(boundaries)
    .filter(b => b.trend === 'improving').length;

  const coreBoundariesBreached =
    boundaries.climate_change.status !== 'safe' &&
    boundaries.biosphere_integrity.status !== 'safe';

  // Calculate initial tipping point risk
  const initialRisk = calculateTippingPointRisk(
    boundariesBreached,
    boundariesWorsening,
    coreBoundariesBreached,
    boundaries
  );

  return {
    boundaries,
    boundariesBreached,                   // 7/9
    boundariesWorsening,                  // 7/9
    boundariesImproving,                  // 2/9
    tippingPointRisk: initialRisk,
    coreBoundariesBreached: true,         // Both climate + biosphere breached
    cascadeMultiplier: 1.0,               // No cascade yet
    cascadeActive: false,
    cascadeStartMonth: null,
    cascadeSeverity: 0,
    boundariesBreachedHistory: [boundariesBreached],
    tippingPointRiskHistory: [initialRisk],
    significantEvents: [],
    // TIER 3.2: Land Use & Biodiversity Crisis
    landUse: initializeLandUseSystem(),
    // TIER 3.3: Ozone Recovery
    ozoneRecovery: initializeOzoneRecoverySystem(),
  };
}

/**
 * TIER 3.2: Initialize Land Use & Biodiversity Crisis System
 */
function initializeLandUseSystem(): LandUseSystem {
  return {
    forestCoverPercent: 62.0,
    forestCoverSafe: 75.0,
    deforestationRate: 0.03,
    reforestationRate: 0.01,
    currentExtinctionRate: 100,
    naturalExtinctionRate: 1.0,
    extinctionAcceleration: 0.5,
    habitatLossPercent: 38.0,
    criticalEcosystemsLost: 0,
    carbonSinkLossMultiplier: 1.17,
    ecosystemCollapseRisk: 0.35,
  };
}

/**
 * TIER 3.3: Initialize Ozone Recovery System
 */
function initializeOzoneRecoverySystem(): OzoneRecoverySystem {
  return {
    stratosphericO3DobsonUnits: 285,
    ozoneHoleSize: 10.0,
    recoveryProgress: 0.65,
    cfcPhaseOutPercent: 99.0,
    halonPhaseOutPercent: 95.0,
    complianceRate: 0.98,
    policyEffectiveness: 0.95,
    targetRecoveryYear: 2066,
    yearsToRecovery: 41,
    isRecovering: true,
    rocketLaunchImpact: 0.0,
    solidRocketMotorChlorine: 0.0,
    blackCarbonImpact: 0.0,
    demonstratesInternationalCooperation: true,
    reversibilityExample: true,
  };
}

/**
 * Calculate tipping point risk (non-linear)
 *
 * Risk curve:
 * - 0 breached: 0% risk
 * - 3 breached: 10% risk
 * - 5 breached: 30% risk
 * - 7 breached (NOW): 60% risk
 * - 9 breached: 95% risk
 *
 * Amplifiers:
 * - Core boundaries breached: +50% risk
 * - Each high-risk boundary: +8% risk
 * - Each worsening boundary: +3% risk
 */
export function calculateTippingPointRisk(
  boundariesBreached: number,
  boundariesWorsening: number,
  coreBoundariesBreached: boolean,
  boundaries: Record<BoundaryName, PlanetaryBoundary>
): number {
  // Base risk from number of boundaries breached (exponential curve)
  let baseRisk = 0;
  if (boundariesBreached === 0) baseRisk = 0;
  else if (boundariesBreached === 1) baseRisk = 0.02;
  else if (boundariesBreached === 2) baseRisk = 0.05;
  else if (boundariesBreached === 3) baseRisk = 0.10;
  else if (boundariesBreached === 4) baseRisk = 0.20;
  else if (boundariesBreached === 5) baseRisk = 0.30;
  else if (boundariesBreached === 6) baseRisk = 0.45;
  else if (boundariesBreached === 7) baseRisk = 0.60;
  else if (boundariesBreached === 8) baseRisk = 0.80;
  else baseRisk = 0.95;  // 9 breached = near-certain cascade

  // Core boundaries amplifier (climate + biosphere interact with all others)
  const coreAmplifier = coreBoundariesBreached ? 0.50 : 0;

  // High-risk zone amplifier (far beyond boundaries)
  const highRiskBoundaries = Object.values(boundaries)
    .filter(b => b.status === 'high_risk').length;
  const highRiskAmplifier = highRiskBoundaries * 0.08;

  // Worsening trends amplifier (negative momentum)
  const worseningAmplifier = boundariesWorsening * 0.03;

  // Total risk (capped at 0.98 - never 100% certain until it happens)
  const totalRisk = Math.min(0.98,
    baseRisk + coreAmplifier + highRiskAmplifier + worseningAmplifier
  );

  return totalRisk;
}

/**
 * Update planetary boundaries each month
 *
 * - Update boundary values based on simulation state
 * - Recalculate tipping point risk
 * - Check for cascade trigger
 * - Apply cascade effects if active
 */
export function updatePlanetaryBoundaries(state: GameState): void {
  const system = state.planetaryBoundariesSystem;
  if (!system) return;

  const env = state.environmentalAccumulation;
  const resources = state.resourceEconomy;

  // === 1. UPDATE BOUNDARY VALUES ===

  // Climate change (from environmental system)
  const climateBoundary = system.boundaries.climate_change;
  if (!climateBoundary) {
    console.warn('⚠️  Planetary Boundaries: climate_change boundary not found');
    return;
  }
  climateBoundary.currentValue = Math.max(0, 1.21 - (env.climateStability * 0.21));
  updateBoundaryStatus(climateBoundary);

  // Biosphere integrity (from biodiversity)
  system.boundaries.biosphere_integrity.currentValue = Math.max(0, 10.0 * (1 - env.biodiversityIndex));
  updateBoundaryStatus(system.boundaries.biosphere_integrity);

  // Freshwater (from freshwater system if available)
  if (state.freshwaterSystem) {
    const stress = state.freshwaterSystem.waterStress;
    system.boundaries.freshwater_change.currentValue = Math.max(0, 1.15 + (stress - 0.5) * 0.7);
  }
  updateBoundaryStatus(system.boundaries.freshwater_change);

  // Biogeochemical flows (from phosphorus system if available)
  if (state.phosphorusSystem) {
    const depletion = 1 - (state.phosphorusSystem.globalReserves / 100);
    system.boundaries.biogeochemical_flows.currentValue = Math.max(0, 2.94 + depletion * 0.5);
  }
  updateBoundaryStatus(system.boundaries.biogeochemical_flows);

  // Novel entities (from environmental pollution)
  system.boundaries.novel_entities.currentValue = Math.max(0, 1.5 + (env.pollutionLevel - 0.3) * 0.5);
  updateBoundaryStatus(system.boundaries.novel_entities);

  // Ocean acidification (from ocean system if available)
  if (state.oceanAcidificationSystem) {
    const aragonite = state.oceanAcidificationSystem.aragoniteSaturation;
    system.boundaries.ocean_acidification.currentValue = Math.max(0, 1.05 + (0.8 - aragonite) * 1.25);
  }
  updateBoundaryStatus(system.boundaries.ocean_acidification);

  // Ozone (improving steadily - Montreal Protocol success!)
  system.boundaries.stratospheric_ozone.currentValue = Math.max(0, system.boundaries.stratospheric_ozone.currentValue - 0.0005);
  updateBoundaryStatus(system.boundaries.stratospheric_ozone);

  // Aerosols (improving with regulations)
  system.boundaries.atmospheric_aerosols.currentValue = Math.max(0, system.boundaries.atmospheric_aerosols.currentValue - 0.0003);
  updateBoundaryStatus(system.boundaries.atmospheric_aerosols);

  // === 2. RECALCULATE AGGREGATE METRICS ===
  system.boundariesBreached = Object.values(system.boundaries)
    .filter(b => b.status !== 'safe').length;

  system.boundariesWorsening = Object.values(system.boundaries)
    .filter(b => b.trend === 'worsening').length;

  system.boundariesImproving = Object.values(system.boundaries)
    .filter(b => b.trend === 'improving').length;

  system.coreBoundariesBreached =
    system.boundaries.climate_change.status !== 'safe' &&
    system.boundaries.biosphere_integrity.status !== 'safe';

  // === 3. CALCULATE TIPPING POINT RISK ===
  system.tippingPointRisk = calculateTippingPointRisk(
    system.boundariesBreached,
    system.boundariesWorsening,
    system.coreBoundariesBreached,
    system.boundaries
  );

  // Track history
  system.boundariesBreachedHistory.push(system.boundariesBreached);
  system.tippingPointRiskHistory.push(system.tippingPointRisk);

  // === 4. UPDATE CASCADE TRIGGER (P0.3 FIX: STOCHASTIC) ===
  // PROBLEM: Deterministic trigger caused 100% identical outcomes in Monte Carlo
  // FIX: Stochastic trigger with quadratic probability curve
  // - Risk 50-100% maps to 0-10% monthly trigger chance
  // - Higher risk = higher probability, but never guaranteed
  // - Adds essential variance to Monte Carlo simulations
  if (system.tippingPointRisk > 0.5) {
    // Cascade probability scales quadratically with risk (more sensitive near extremes)
    const cascadeProbability = Math.pow((system.tippingPointRisk - 0.5) / 0.5, 2.0); // 0-1 scale
    const monthlyTriggerChance = cascadeProbability * 0.10; // Max 10% per month at risk=1.0

    // Stochastic trigger: cascade can START randomly based on risk
    if (!system.cascadeActive && Math.random() < monthlyTriggerChance) {
      system.cascadeActive = true;
      system.cascadeStartMonth = state.currentMonth;
      console.log(`\n🌪️ ========== TIPPING POINT CASCADE TRIGGERED ==========`);
      console.log(`Month: ${state.currentMonth}`);
      console.log(`Boundaries breached: ${system.boundariesBreached}/9`);
      console.log(`Tipping point risk: ${(system.tippingPointRisk * 100).toFixed(1)}%`);
      console.log(`Trigger chance: ${(monthlyTriggerChance * 100).toFixed(2)}% per month`);
      console.log(`\n⚠️ CASCADING FEEDBACK LOOPS INITIATED`);
      console.log(`Climate → Biosphere → Freshwater → Ocean → Land`);
      console.log(`Mortality now scales with environmental thresholds (food, water, climate)`);
      console.log(`Recovery possible with aggressive environmental interventions\n`);
    }

    // Once active, severity scales continuously with risk
    if (system.cascadeActive) {
      // P0.5 (Oct 15, 2025): Add stochastic variation to cascade severity
      const baseSeverity = Math.pow((system.tippingPointRisk - 0.5) / 0.5, 1.5); // 0-1 scale
      // Add ±20% variation for monthly shocks (extreme weather, local resilience, random events)
      const stochasticMultiplier = 0.8 + Math.random() * 0.4; // 80% to 120%
      system.cascadeSeverity = baseSeverity * stochasticMultiplier;
      system.cascadeMultiplier = 1.0 + system.cascadeSeverity; // 1.0x → 2.0x
    }
  } else if (system.cascadeActive && system.tippingPointRisk < 0.45) {
    // Cascade can REVERSE if risk drops significantly
    system.cascadeActive = false;
    system.cascadeSeverity = 0;
    system.cascadeMultiplier = 1.0;
    console.log(`\n✅ TIPPING POINT CASCADE REVERSED (Month ${state.currentMonth})`);
    console.log(`Environmental interventions successful! Risk reduced below threshold.\n`);
  }

  // === 5. APPLY CASCADE EFFECTS ===
  if (system.cascadeActive) {
    applyTippingPointCascadeEffects(state);
  }

  // === 6. UPDATE TIER 3.2 & 3.3 SYSTEMS ===
  updateLandUseSystem(state);
  updateOzoneRecoverySystem(state);
}

/**
 * Update boundary status based on current value
 */
function updateBoundaryStatus(boundary: PlanetaryBoundary): void {
  if (boundary.currentValue < boundary.boundaryThreshold) {
    boundary.status = 'safe';
    boundary.breachYear = null;
    boundary.monthsBreached = 0;
  } else if (boundary.currentValue < boundary.boundaryThreshold * 1.2) {
    boundary.status = 'beyond_boundary';
    boundary.monthsBreached++;
  } else if (boundary.currentValue < boundary.highRiskThreshold) {
    boundary.status = 'increasing_risk';
    boundary.monthsBreached++;
  } else {
    boundary.status = 'high_risk';
    boundary.monthsBreached++;
  }

  // Update trend based on recent changes (simplified)
  // In reality, would track value history
  if (boundary.name === 'stratospheric_ozone' || boundary.name === 'atmospheric_aerosols') {
    boundary.trend = 'improving';
  } else {
    boundary.trend = 'worsening';
  }
}

/**
 * OLD: triggerTippingPointCascade (REPLACED by continuous severity system)
 * 
 * The cascade is no longer a binary trigger. Instead, severity scales continuously
 * with tippingPointRisk, and mortality is calculated from actual environmental
 * thresholds (food, water, climate, biodiversity).
 * 
 * This function is kept for compatibility but no longer called.
 */
export function triggerTippingPointCascade(state: GameState): void {
  // This function is deprecated - cascade now handled in updatePlanetaryBoundaries
  console.log('⚠️  Old cascade trigger called - system now uses continuous severity');
}

/**
 * Apply tipping point cascade effects each month
 *
 * Cascading degradation across all Earth systems.
 */
export function applyTippingPointCascadeEffects(state: GameState): void {
  const system = state.planetaryBoundariesSystem;
  if (!system || !system.cascadeActive) return;

  const env = state.environmentalAccumulation;
  const qol = state.qualityOfLifeSystems;
  const resources = state.resourceEconomy;
  const monthsSinceCascade = state.currentMonth - (system.cascadeStartMonth || 0);

  // === P0.5 (Oct 15, 2025): STOCHASTIC ENVIRONMENTAL COLLAPSE ===
  // Add ±25% random variation to degradation rates (weather, local conditions, random events)
  const envStochasticFactor = () => 0.75 + Math.random() * 0.5; // 75% to 125%

  // Climate stability drops rapidly (with variation)
  const climateDecay = 0.02 * envStochasticFactor(); // Base 2% ± variation
  env.climateStability = Math.max(0, env.climateStability * (1 - climateDecay));

  // Biodiversity crashes (with variation)
  const bioDecay = 0.03 * envStochasticFactor(); // Base 3% ± variation
  env.biodiversityIndex = Math.max(0, env.biodiversityIndex * (1 - bioDecay));

  // Resources depleted faster (with variation)
  const resourceDecay = 0.015 * envStochasticFactor(); // Base 1.5% ± variation
  env.resourceReserves = Math.max(0, env.resourceReserves * (1 - resourceDecay));

  // Pollution increases as systems break down (with variation)
  const pollutionIncrease = 0.01 * envStochasticFactor(); // Base 1% ± variation
  env.pollutionLevel = Math.min(1, env.pollutionLevel * (1 + pollutionIncrease));

  // === RESOURCE CASCADES (with stochastic depletion) ===
  if (resources.food) {
    const foodDecay = 0.04 * envStochasticFactor(); // Base 4% ± variation (harvest failures, droughts)
    resources.food.currentStock = Math.max(0, resources.food.currentStock * (1 - foodDecay));
  }
  if (resources.water) {
    const waterDecay = 0.03 * envStochasticFactor(); // Base 3% ± variation (droughts, contamination)
    resources.water.currentStock = Math.max(0, resources.water.currentStock * (1 - waterDecay));
  }

  // === QOL COLLAPSE ===
  qol.foodSecurity = Math.max(0, qol.foodSecurity * 0.96);
  qol.healthcareQuality = Math.max(0, qol.healthcareQuality * 0.98);
  qol.physicalSafety = Math.max(0, qol.physicalSafety * 0.97);
  qol.socialConnection = Math.max(0, qol.socialConnection * 0.97);
  qol.mentalHealth = Math.max(0, qol.mentalHealth * 0.96);

  // === POPULATION DEATHS ===
  // TIER 1.7 FIX: Cascade accelerates over time until true extinction or intervention
  // P0.7 (Oct 16, 2025): Scenario-specific mortality rates
  // Historical: 0.5% monthly (Black Death: 30-60% over 6 years)
  // Unprecedented: 1.5% monthly (hyperconnected systemic failures)
  // Month 0-48: Base mortality from scenario
  // Month 48+: Exponential acceleration (P2 BUG FIX: Reduced from 5% to 2% growth)
  // P2 FIX: Cap at 10% not 50% - even worst cascades take months to escalate
  if (state.humanPopulationSystem) {
    // P0.7: Get scenario-specific mortality rate (default to historical 0.5% if not set)
    const baseMortalityRate = state.config.scenarioParameters?.cascadeMortalityRate ?? 0.005;
    let monthlyMortalityRate = baseMortalityRate * system.cascadeSeverity;
    
    // After initial 48-month crisis, death rate accelerates exponentially
    if (monthsSinceCascade > 48) {
      const monthsPastInitialCrisis = monthsSinceCascade - 48;
      const accelerationFactor = Math.pow(1.02, monthsPastInitialCrisis); // P2 FIX: 2% not 5% growth
      monthlyMortalityRate *= accelerationFactor;
      
      // P2 BUG FIX: Cap at 10% monthly mortality (was 50% - too extreme)
      // 10% monthly = 72% annual mortality (still catastrophic but physically plausible)
      monthlyMortalityRate = Math.min(0.10, monthlyMortalityRate);
    }
    
    const { addAcuteCrisisDeaths } = require('./populationDynamics');
    addAcuteCrisisDeaths(
      state,
      monthlyMortalityRate,
      'Tipping Point Cascade',
      1.0,  // Global
      'cascade'  // Oct 16, 2025: Dedicated category to fix death reporting
    );
  }

  // === LOG PROGRESS ===
  if (monthsSinceCascade % 6 === 0) { // Log every 6 months
    const population = state.humanPopulationSystem.population;
    const baseMortalityRate = state.config.scenarioParameters?.cascadeMortalityRate ?? 0.005;
    const mortalityRate = monthsSinceCascade > 48
      ? baseMortalityRate * Math.pow(1.05, monthsSinceCascade - 48)
      : baseMortalityRate;
    
    console.log(`\n🌪️ TIPPING POINT CASCADE - Month ${monthsSinceCascade}`);
    console.log(`   Climate: ${(env.climateStability * 100).toFixed(1)}%`);
    console.log(`   Biodiversity: ${(env.biodiversityIndex * 100).toFixed(1)}%`);
    console.log(`   Population: ${population.toFixed(2)}B (${(population * 1_000_000_000).toFixed(0)} people)`);
    console.log(`   Monthly mortality: ${(mortalityRate * 100).toFixed(1)}%`);
    
    if (monthsSinceCascade < 48) {
      console.log(`   Status: Initial crisis (Month ${monthsSinceCascade}/48)`);
    } else {
      console.log(`   Status: ACCELERATING COLLAPSE (Month ${monthsSinceCascade - 48} past crisis)`);
      console.log(`   Death rate: ${(mortalityRate / baseMortalityRate).toFixed(1)}x baseline`);
    }
  }

  // === UPDATE SEVERITY ===
  // Severity increases as population approaches extinction threshold
  // This is for tracking only, NOT for declaring extinction (that uses population)
  const population = state.humanPopulationSystem.population;
  const extinctionThreshold = 0.00001; // 10K people = 0.00001B
  if (population < 0.1) {  // < 100M people
    // Severity ramps up as we approach true extinction
    const proximityToExtinction = 1 - (Math.log10(population + extinctionThreshold) / Math.log10(0.1));
    state.extinctionState.severity = Math.min(1.0, 0.7 + proximityToExtinction * 0.3);
  }
}

/**
 * TIER 3.2: Update Land Use System
 *
 * Models feedback loops:
 * - Deforestation → carbon sink loss → climate acceleration
 * - Habitat loss → biodiversity crisis → ecosystem collapse
 * - Extinction → food web breakdown → more extinctions
 */
function updateLandUseSystem(state: GameState): void {
  const system = state.planetaryBoundariesSystem;
  if (!system || !system.landUse) return;

  const landUse = system.landUse;
  const env = state.environmentalAccumulation;

  // === 1. UPDATE FOREST COVER ===
  // Net change = reforestation - deforestation
  const netForestChange = landUse.reforestationRate - landUse.deforestationRate;
  landUse.forestCoverPercent = Math.max(0, Math.min(100,
    landUse.forestCoverPercent + netForestChange
  ));

  // Habitat loss = inverse of forest cover
  landUse.habitatLossPercent = 100 - landUse.forestCoverPercent;

  // === 2. FEEDBACK LOOP: DEFORESTATION → CLIMATE ACCELERATION ===
  // Loss of carbon sinks amplifies climate change
  const forestDeficit = (landUse.forestCoverSafe - landUse.forestCoverPercent) / landUse.forestCoverSafe;
  landUse.carbonSinkLossMultiplier = 1.0 + Math.max(0, forestDeficit * 2.0); // Up to 3x multiplier

  // Apply to climate boundary
  if (system.boundaries.climate_change) {
    const climateAcceleration = (landUse.carbonSinkLossMultiplier - 1.0) * 0.001; // +0.1% per 10% forest loss
    system.boundaries.climate_change.currentValue += climateAcceleration;
  }

  // === 3. FEEDBACK LOOP: HABITAT LOSS → BIODIVERSITY CRISIS ===
  // Habitat destruction drives extinctions
  if (landUse.habitatLossPercent > 30) {
    const habitatSeverity = (landUse.habitatLossPercent - 30) / 70; // 0-1 scale
    landUse.extinctionAcceleration = 0.5 + (habitatSeverity * 2.0); // 0.5x → 2.5x acceleration
  }

  // Update extinction rate
  landUse.currentExtinctionRate = Math.min(1000,
    landUse.currentExtinctionRate * (1 + landUse.extinctionAcceleration / 100)
  );

  // === 4. FEEDBACK LOOP: EXTINCTION → ECOSYSTEM COLLAPSE ===
  // High extinction rates → food web breakdown
  if (landUse.currentExtinctionRate > 200) {
    landUse.ecosystemCollapseRisk = Math.min(1.0, landUse.ecosystemCollapseRisk + 0.01); // +1% per month

    // Check for critical ecosystem collapse
    if (landUse.ecosystemCollapseRisk > 0.80 && Math.random() < 0.05) {
      landUse.criticalEcosystemsLost++;
      console.log(`\n🌳💀 CRITICAL ECOSYSTEM COLLAPSED (Total: ${landUse.criticalEcosystemsLost})`);
      console.log(`   Extinction rate: ${landUse.currentExtinctionRate.toFixed(0)}x baseline`);
      console.log(`   Habitat loss: ${landUse.habitatLossPercent.toFixed(1)}%`);
      console.log(`   Forest cover: ${landUse.forestCoverPercent.toFixed(1)}% (need ${landUse.forestCoverSafe}%)\n`);

      // Apply collapse effects
      env.biodiversityIndex = Math.max(0, env.biodiversityIndex * 0.90); // -10% immediate
      env.resourceReserves = Math.max(0, env.resourceReserves * 0.95); // -5% resources
    }
  }

  // === 5. UPDATE LAND SYSTEM CHANGE BOUNDARY ===
  // Boundary value scales with forest cover deficit
  if (system.boundaries.land_system_change) {
    const boundaryValue = 1.0 + (landUse.forestCoverSafe - landUse.forestCoverPercent) / landUse.forestCoverSafe;
    system.boundaries.land_system_change.currentValue = boundaryValue;
  }

  // === 6. LOGGING (Every 12 months) ===
  if (state.currentMonth % 12 === 0 && state.currentMonth > 0) {
    console.log(`\n🌳 LAND USE SYSTEM (Year ${Math.floor(state.currentMonth / 12)})`);
    console.log(`   Forest cover: ${landUse.forestCoverPercent.toFixed(1)}% (need ${landUse.forestCoverSafe}%)`);
    console.log(`   Extinction rate: ${landUse.currentExtinctionRate.toFixed(0)}x natural`);
    console.log(`   Carbon sink loss: ${((landUse.carbonSinkLossMultiplier - 1.0) * 100).toFixed(0)}% climate acceleration`);
    console.log(`   Ecosystem collapse risk: ${(landUse.ecosystemCollapseRisk * 100).toFixed(0)}%`);

    if (landUse.criticalEcosystemsLost > 0) {
      console.log(`   Critical ecosystems lost: ${landUse.criticalEcosystemsLost} 💀`);
    }
  }
}

/**
 * TIER 3.3: Update Ozone Recovery System
 *
 * Models Montreal Protocol success and new threats from rockets.
 */
function updateOzoneRecoverySystem(state: GameState): void {
  const system = state.planetaryBoundariesSystem;
  if (!system || !system.ozoneRecovery) return;

  const ozone = system.ozoneRecovery;

  // === 1. OZONE RECOVERY (Linear recovery to 2066) ===
  // Target: 290 DU by 2066, currently 285 DU (2025)
  const baseRecoveryRate = (290 - 285) / ((2066 - 2025) * 12); // DU per month

  // === 2. NEW THREAT: ROCKET LAUNCHES ===
  // Nature (2025): Near-future launches could slow recovery
  // Assume 0.01% increase per year in rocket impact as SpaceX/others scale
  const rocketGrowthRate = 0.01 / 12; // 0.01% per year = ~0.0008% per month
  ozone.rocketLaunchImpact = Math.min(0.29, ozone.rocketLaunchImpact + rocketGrowthRate);

  // Rocket impact slows recovery rate (not ozone level directly)
  const recoverySlowdown = 1 - (ozone.rocketLaunchImpact * 0.3); // Up to 30% slowdown at max impact
  const effectiveRecoveryRate = baseRecoveryRate * recoverySlowdown;

  // Apply recovery
  ozone.stratosphericO3DobsonUnits = Math.min(290,
    ozone.stratosphericO3DobsonUnits + effectiveRecoveryRate
  );

  // Ozone hole shrinking
  ozone.ozoneHoleSize = Math.max(0, ozone.ozoneHoleSize * 0.999); // -0.1% per month

  // === 3. RECOVERY PROGRESS ===
  // 0 = 1980s worst (220 DU), 1 = fully recovered (290 DU)
  ozone.recoveryProgress = (ozone.stratosphericO3DobsonUnits - 220) / (290 - 220);

  // === 4. UPDATE OZONE BOUNDARY ===
  // Boundary value = 1.0 - (current / target)
  // Safe when < 1.0, breached when > 1.0
  if (system.boundaries.stratospheric_ozone) {
    system.boundaries.stratospheric_ozone.currentValue =
      Math.max(0, 1.0 - (ozone.stratosphericO3DobsonUnits / 290));
  }

  // === 5. POLICY INSPIRATION EFFECT ===
  // Montreal Protocol success boosts confidence in other treaties
  // This could enable AI safety treaties, climate agreements, etc.
  if (ozone.demonstratesInternationalCooperation && state.globalMetrics) {
    // Small boost to international cooperation
    // (Would need to implement cooperation metric in global state)
    // For now, just track that it's working
  }

  // === 6. LOGGING (Every 12 months) ===
  if (state.currentMonth % 12 === 0 && state.currentMonth > 0) {
    const year = 2025 + Math.floor(state.currentMonth / 12);
    console.log(`\n✨ OZONE RECOVERY (Year ${year}) - POLICY SUCCESS STORY`);
    console.log(`   Ozone level: ${ozone.stratosphericO3DobsonUnits.toFixed(1)} DU (target: 290 DU)`);
    console.log(`   Recovery progress: ${(ozone.recoveryProgress * 100).toFixed(1)}%`);
    console.log(`   Ozone hole: ${ozone.ozoneHoleSize.toFixed(1)}M km² (shrinking)`);
    console.log(`   CFC phase-out: ${ozone.cfcPhaseOutPercent.toFixed(1)}% complete ✅`);
    console.log(`   Years to full recovery: ${(2066 - year)} years`);

    if (ozone.rocketLaunchImpact > 0.05) {
      console.log(`   ⚠️  Rocket launch impact: ${(ozone.rocketLaunchImpact * 100).toFixed(2)}% (slowing recovery)`);
    }

    if (ozone.recoveryProgress > 0.90) {
      console.log(`   🎉 NEARLY FULLY RECOVERED - Montreal Protocol working!`);
    }
  }
}

