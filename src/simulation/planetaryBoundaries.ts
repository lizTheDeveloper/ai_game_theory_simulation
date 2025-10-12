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
  PlanetaryBoundaryEvent
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

  // === 4. CHECK FOR CASCADE TRIGGER ===
  if (!system.cascadeActive && system.tippingPointRisk > 0.70) {
    // 10% chance per month when risk > 70%
    if (Math.random() < 0.10) {
      triggerTippingPointCascade(state);
    }
  }

  // === 5. APPLY CASCADE EFFECTS ===
  if (system.cascadeActive) {
    applyTippingPointCascadeEffects(state);
  }
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
 * Trigger tipping point cascade (irreversible)
 *
 * When too many boundaries are breached, cascading feedback loops begin.
 * This is a non-linear, irreversible process leading to extinction in ~48 months.
 */
export function triggerTippingPointCascade(state: GameState): void {
  const system = state.planetaryBoundariesSystem;
  if (!system) return;

  system.cascadeActive = true;
  system.cascadeStartMonth = state.currentMonth;
  system.cascadeSeverity = system.tippingPointRisk;
  system.cascadeMultiplier = 1.0 + system.tippingPointRisk * 2.0; // 1.0-3.0x

  console.log(`\n🌪️ ========== TIPPING POINT CASCADE TRIGGERED ==========`);
  console.log(`Month: ${state.currentMonth}`);
  console.log(`Boundaries breached: ${system.boundariesBreached}/9`);
  console.log(`Tipping point risk: ${(system.tippingPointRisk * 100).toFixed(1)}%`);
  console.log(`Cascade severity: ${(system.cascadeSeverity * 100).toFixed(1)}%`);
  console.log(`\n⚠️ CASCADING FEEDBACK LOOPS INITIATED`);
  console.log(`Climate → Biosphere → Freshwater → Ocean → Land`);
  console.log(`Expected timeline to collapse: 48 months`);
  console.log(`Process is IRREVERSIBLE\n`);

  // Record event
  system.significantEvents.push({
    month: state.currentMonth,
    type: 'cascade_triggered',
    boundary: null,
    description: `Tipping point cascade triggered with ${system.boundariesBreached}/9 boundaries breached`,
    impact: 'Irreversible Earth system breakdown begins',
    severity: system.cascadeSeverity,
  });

  // Activate extinction state
  if (!state.extinctionState.active) {
    state.extinctionState.active = true;
    state.extinctionState.type = 'rapid';
    state.extinctionState.mechanism = 'climate_tipping_point';
    state.extinctionState.startMonth = state.currentMonth;
    state.extinctionState.severity = system.cascadeSeverity;
  }
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

  // === ENVIRONMENTAL COLLAPSE ===
  // Climate stability drops rapidly
  env.climateStability = Math.max(0, env.climateStability * 0.98); // -2% per month

  // Biodiversity crashes
  env.biodiversityIndex = Math.max(0, env.biodiversityIndex * 0.97); // -3% per month

  // Resources depleted faster
  env.resourceReserves = Math.max(0, env.resourceReserves * 0.985); // -1.5% per month

  // Pollution increases as systems break down
  env.pollutionLevel = Math.min(1, env.pollutionLevel * 1.01); // +1% per month

  // === RESOURCE CASCADES ===
  if (resources.food) {
    resources.food.currentStock = Math.max(0, resources.food.currentStock * 0.96); // -4% per month
  }
  if (resources.water) {
    resources.water.currentStock = Math.max(0, resources.water.currentStock * 0.97); // -3% per month
  }

  // === QOL COLLAPSE ===
  qol.foodSecurity = Math.max(0, qol.foodSecurity * 0.96);
  qol.healthcareQuality = Math.max(0, qol.healthcareQuality * 0.98);
  qol.physicalSafety = Math.max(0, qol.physicalSafety * 0.97);
  qol.socialConnection = Math.max(0, qol.socialConnection * 0.97);
  qol.mentalHealth = Math.max(0, qol.mentalHealth * 0.96);

  // === POPULATION DEATHS ===
  // TIER 1.7 FIX: Cascade accelerates over time until true extinction or intervention
  // Month 0-48: Base 2% mortality
  // Month 48+: Exponential acceleration (1.05x per month = 5% growth in death rate)
  if (state.humanPopulationSystem) {
    let monthlyMortalityRate = 0.02 * system.cascadeSeverity; // Base 2% per month
    
    // After initial 48-month crisis, death rate accelerates exponentially
    if (monthsSinceCascade > 48) {
      const monthsPastInitialCrisis = monthsSinceCascade - 48;
      const accelerationFactor = Math.pow(1.05, monthsPastInitialCrisis); // 5% compound growth
      monthlyMortalityRate *= accelerationFactor;
      
      // Cap at 50% monthly mortality (prevents instant jumps)
      monthlyMortalityRate = Math.min(0.50, monthlyMortalityRate);
    }
    
    const { addAcuteCrisisDeaths } = require('./populationDynamics');
    addAcuteCrisisDeaths(
      state,
      monthlyMortalityRate,
      'Tipping Point Cascade',
      1.0,  // Global
      'climate'
    );
  }

  // === LOG PROGRESS ===
  if (monthsSinceCascade % 6 === 0) { // Log every 6 months
    const population = state.humanPopulationSystem.population;
    const mortalityRate = monthsSinceCascade > 48 
      ? 0.02 * Math.pow(1.05, monthsSinceCascade - 48) 
      : 0.02;
    
    console.log(`\n🌪️ TIPPING POINT CASCADE - Month ${monthsSinceCascade}`);
    console.log(`   Climate: ${(env.climateStability * 100).toFixed(1)}%`);
    console.log(`   Biodiversity: ${(env.biodiversityIndex * 100).toFixed(1)}%`);
    console.log(`   Population: ${population.toFixed(2)}B (${(population * 1_000_000_000).toFixed(0)} people)`);
    console.log(`   Monthly mortality: ${(mortalityRate * 100).toFixed(1)}%`);
    
    if (monthsSinceCascade < 48) {
      console.log(`   Status: Initial crisis (Month ${monthsSinceCascade}/48)`);
    } else {
      console.log(`   Status: ACCELERATING COLLAPSE (Month ${monthsSinceCascade - 48} past crisis)`);
      console.log(`   Death rate: ${(mortalityRate / 0.02).toFixed(1)}x baseline`);
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

