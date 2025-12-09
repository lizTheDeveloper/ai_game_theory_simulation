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
import type { RNGFunction } from '@/types/config';
import {
  PlanetaryBoundariesSystem,
  PlanetaryBoundary,
  BoundaryName,
  BoundaryStatus,
  BoundaryTrend,
  TippingPointCascade,
  PlanetaryBoundaryEvent,
  LandUseSystem,
  RegionalBiome,
  OzoneRecoverySystem,
  BiosphereIntegrityIndex,
  SpeciesGroup,
  LegacyNutrientStock
} from '@/types/planetaryBoundaries';
import { assertStateProperty, assertFinite, assertProbability, assertInRange, assertDefined } from './utils/assertions';
import { deterministicRandom } from '@/simulation/utils/deterministicRng';
import { FLOORS } from './config/centralConfig';
import { initializeLegacyNutrientStock } from './legacyNutrientStocks';
import { initializeRegionalNitrogenManagement } from './nitrogenFoodCoupling';

/**
 * Sample biosphere extinction rate from log-uniform distribution
 * 
 * 🚨 CRITICAL: 10× uncertainty requires parameter sweep (NOT point estimate)
 * 
 * ⚠️⚠️ TIER 3 BRONZE - Parameter sweep required for high-uncertainty parameters
 * CONCEPT SUPPORT: Current extinction rate 100-1000× background (IPBES 2019, Richardson et al. 2023)
 * QUANTIFICATION: 10× uncertainty range explicitly stated in papers (cannot be narrowed with current data)
 * UNCERTAINTY: ±1000% (100-1000 E/MSY range)
 * PARAMETER SWEEP REQUIRED: YES (MANDATORY for high-leverage parameters)
 * 
 * Research:
 * - IPBES (2019): Current extinction rate 100-1000× background (100-1000 E/MSY)
 * - Richardson et al. (2023): Biosphere boundary transgressed
 * - Direct measurement approach: ~100 E/MSY (Ceballos et al. 2015, Pimm et al. 2014)
 * - Species-area relationship approach: ~1000 E/MSY (habitat loss extrapolation)
 * 
 * This uncertainty is METHODOLOGICAL, not measurement error:
 * - Total species count unknown (5M to 50M, 10× range)
 * - Background rate uncertain (0.1 to 1 E/MSY, 10× range)
 * - Measurement methods differ (fossil record vs IUCN vs species-area)
 * 
 * Impact: 10× parameter change → 8× shift in utopia probability (40% vs 5%)
 * - Scenario A (100 E/MSY): Biosphere recoverable, 30-40% utopia probability
 * - Scenario B (1000 E/MSY): Biosphere collapse inevitable, 5-10% utopia probability
 * 
 * Solution: Log-uniform sampling (NOT point estimate or averaging)
 * - Geometric mean of 100 and 1000: √(100 × 1000) = 316 E/MSY
 * - But do NOT use geometric mean as point estimate - must sample from distribution
 * 
 * @param rng - Random number generator (0-1 uniform)
 * @returns Sampled extinction rate in E/MSY units [100, 1000]
 */
export function sampleBiosphereExtinctionRate(rng: RNGFunction): number {
  // Log-uniform distribution over [100, 1000] E/MSY
  // This preserves multiplicative uncertainty (order-of-magnitude uncertainty)
  const logMin = Math.log(100);
  const logMax = Math.log(1000);
  const logRate = logMin + rng() * (logMax - logMin);
  return Math.exp(logRate);
}

/**
 * Initialize planetary boundaries system with 2025 baseline
 *
 * Based on Stockholm Resilience Centre 2025 data:
 * - 7 of 9 boundaries breached
 * - 2 safe (ozone improving, aerosols mostly safe)
 * - Climate + Biosphere = core boundaries (already breached)
 *
 * @param rng - REQUIRED RNG function for deterministic simulation
 *              Samples global extinction rate from log-uniform [100, 1000] E/MSY
 */
export function initializePlanetaryBoundariesSystem(rng: RNGFunction): PlanetaryBoundariesSystem {
  // CRITICAL-3 FIX (Nov 18, 2025): RNG must be required for deterministic simulation
  if (!rng || typeof rng !== 'function') {
    throw new Error('❌ CRITICAL: RNG required for deterministic planetary boundaries initialization');
  }

  const boundaries: Record<BoundaryName, PlanetaryBoundary> = {} as any;

  // === BREACHED BOUNDARIES (7/9) ===

  // 1. CLIMATE CHANGE (Core Boundary) - 425 ppm CO2 vs 350 ppm safe
  boundaries.climate_change = {
    name: 'climate_change',
    displayName: 'Climate Change',
    recoveryMonths: 0,
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
    // === IRREVERSIBILITY FRAMEWORK (Nov 30, 2025) ===
    // Research: IPCC AR6 WG1 (2021), Schellnhuber et al. (2016), Drüke et al. (2024)
    // Ice sheet inertia: 100-800 year response time (median 450)
    // Committed warming: 0.3-0.5C even with net-zero (AR6 Table SPM.2)
    // Temperature CAN stabilize, but ice sheets have multi-century lag
    irreversible: false,                   // Temperature CAN stabilize, but ice sheets have multi-century lag
    recoveryHalfLife: 450,                 // Years for half-life recovery (ice sheet inertia, Drüke et al. 2024)
    minimumAsymptoticValue: 0.35,          // 35% committed warming/SLR floor (thermal inertia + ice sheet lag)
  };

  // 2. BIOSPHERE INTEGRITY (Core Boundary) - Current ~10× safe boundary
  // UPDATED (Oct 30, 2025): BLOCKER-2 fix v3 - IPBES (2019) + Richardson et al. (2023)
  // Current extinction rate: ~100-1000 E/MSY (IPBES 2019 range, 10× uncertainty)
  // Research:
  //   - IPBES (2019): Current rate 100-1000× background (100-1000 E/MSY)
  //   - Richardson et al. (2023): Biosphere boundary transgressed
  //   - Safe threshold: 10 E/MSY (IPBES planetary boundary)
  //   - Baseline (conservative): 116 E/MSY (weighted regional, low end of range)
  //   - Boundary value: 116/10 = 11.6× safe threshold
  // NOTE: Uncertainty range spans 10× (100-1000 E/MSY) - epistemic crisis!
  boundaries.biosphere_integrity = {
    name: 'biosphere_integrity',
    displayName: 'Biosphere Integrity (Biodiversity)',
    recoveryMonths: 0,
    currentValue: 11.6,                    // BUG FIX v3: Was 2.2× (68× too low), now 11.6× (IPBES 2019 research-backed)
    boundaryThreshold: 1.0,
    preIndustrialValue: 0.0,
    highRiskThreshold: 1.5,
    status: 'high_risk',                   // Deep overshoot (11.6× > 1.5× high-risk threshold)
    trend: 'worsening',
    breachYear: 1950,
    monthsBreached: (2025 - 1950) * 12,
    isCoreBoundary: true,
    interactionStrength: 1.0,              // Affects everything
    reversible: false,                     // Extinct species don't come back (easily)
    timescaleYears: 100,
    extinctionContribution: 0.35,          // Highest contribution
    tippingPointRisk: 0.40,
    // === IRREVERSIBILITY FRAMEWORK (Nov 16, 2025) ===
    // Extinction debt - species committed to extinction even if habitat fully restored
    irreversible: false,                   // Ecosystems CAN recover, but extinctions are permanent
    recoveryHalfLife: 200,                 // Century-scale ecosystem recovery
    minimumAsymptoticValue: 0.05,          // 5% extinction debt floor (committed extinctions)
  };

  // 3. LAND SYSTEM CHANGE - 62% forest vs 75% needed
  boundaries.land_system_change = {
    name: 'land_system_change',
    displayName: 'Land System Change',
    recoveryMonths: 0,
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
    recoveryMonths: 0,
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
    recoveryMonths: 0,
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
    recoveryMonths: 0,
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
    // === IRREVERSIBILITY FRAMEWORK (Nov 16, 2025) ===
    // Research: Cousins et al. (2022), Sörengård et al. (2024)
    irreversible: true,                    // PFAS atmospheric distribution is permanent (Cousins 2022)
    recoveryHalfLife: 75,                  // 50-100 year range (Montreal Protocol analog)
    minimumAsymptoticValue: 0.15,          // Never reaches zero (15% floor from background contamination)
    legacyStock: 46000,                    // metric tons (accumulated PFAAs from Persson 2022)
  };

  // 7. OCEAN ACIDIFICATION - Just breached Sept 2025!
  boundaries.ocean_acidification = {
    name: 'ocean_acidification',
    displayName: 'Ocean Acidification',
    recoveryMonths: 0,
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
    recoveryMonths: 0,
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
    recoveryMonths: 0,
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
  // FIX (Nov 7, 2025): Sort for deterministic iteration (Issue #11)
  const boundaryValues = Object.entries(boundaries)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(e => e[1]);

  const boundariesBreached = boundaryValues
    .filter(b => b.status !== 'safe').length;

  const boundariesWorsening = boundaryValues
    .filter(b => b.trend === 'worsening').length;

  const boundariesImproving = boundaryValues
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
    compoundClimateAmplifier: 1.0,        // No amplification yet
    cascadeMultiplier: 1.0,               // No cascade yet
    cascadeActive: false,
    cascadeStartMonth: null,
    cascadeSeverity: 0,
    boundariesBreachedHistory: [boundariesBreached],
    tippingPointRiskHistory: [initialRisk],
    significantEvents: [],
    // TIER 3.2: Land Use & Biodiversity Crisis
    landUse: initializeLandUseSystem(rng),
    // TIER 3.3: Ozone Recovery
    ozoneRecovery: initializeOzoneRecoverySystem(),
    // TIER 3.4: Early Warning Systems (Oct 17, 2025)
    earlyWarning: initializeEarlyWarningSystemInternal(),
    // Invasive Species Impact (Oct 27, 2025)
    // Research: IPBES (2019) - ~40% of modern extinctions attributed to invasive species
    // Baseline 2025: 0.45 (significant global impact, contributing to extinction crisis)
    invasiveSpeciesImpact: 0.45,
    // TIER 2 HIGH: Legacy Nutrient Stocks (Nov 15, 2025)
    // Research: Lake Erie sediment loading, nitrogen half-life studies
    // Expected impact: Addresses 10% god mode effectiveness gap
    legacyNutrientStock: initializeLegacyNutrientStock(),
    // TIER 2 HIGH: Regional Nitrogen Management (Nov 15, 2025)
    // Research: Regional overuse patterns (55% South Asian rice), yield penalty curves
    // Expected impact: Realistic nitrogen-food coupling with regional differentiation
    regionalNitrogenManagement: initializeRegionalNitrogenManagement(),
  };
}

/**
 * TIER 3.4: Initialize Early Warning System (internal)
 *
 * Called from initialization - sets up detection infrastructure.
 */
function initializeEarlyWarningSystemInternal() {
  // Import here to avoid circular dependency
  const { initializeEarlyWarningSystem } = require('./earlyWarningSystems');
  return initializeEarlyWarningSystem();
}

/**
 * TIER 3.2: Initialize Land Use & Biodiversity Crisis System
 */
/**
 * Initialize Land Use System with Regional Biomes (Oct 22, 2025)
 * UPDATED (Oct 30, 2025): BLOCKER-2 fix v3 - extinction rates now match IPBES (2019) research
 * UPDATED (Nov 2, 2025): Layer 2 Remediation - Biosphere parameter sweep support
 * UPDATED (Nov 18, 2025): CRITICAL-3 fix - RNG now required for determinism
 *
 * Research-backed baseline conditions for each biome type.
 *
 * BUG FIX (Oct 30, 2025 v3): BLOCKER-2 - Biosphere baseline restoration
 * ROOT CAUSE: Previous "fix" scaled rates DOWN 68× thinking 137 E/MSY was wrong.
 *   But IPBES (2019) research shows 100-1000 E/MSY range (geometric mean 316 E/MSY).
 *   The OLD value (137 E/MSY) was CLOSER to research than "fixed" value (2.2 E/MSY).
 * RESEARCH:
 *   - IPBES (2019): Current extinction rate 100-1000× background (100-1000 E/MSY)
 *   - Richardson et al. (2023): Biosphere boundary transgressed
 *   - Safe boundary: 10 E/MSY (10× background)
 * FIX: Use conservative baseline (116 E/MSY) from low end of IPBES range
 *   - Values in E/MSY units (extinctions per million species-years)
 *   - NOT relative multipliers - these are ABSOLUTE rates
 *
 * LAYER 2 REMEDIATION (Nov 2, 2025): Biosphere Parameter Sweep
 * - Samples from log-uniform [100, 1000] E/MSY range (parameter sweep)
 * - This allows Monte Carlo to explore full uncertainty range, not just point estimate
 *
 * @param rng - REQUIRED RNG function for deterministic simulation
 *              Samples global extinction rate from log-uniform [100, 1000] E/MSY
 */
function initializeLandUseSystem(rng: RNGFunction): LandUseSystem {
  // CRITICAL-3 FIX (Nov 18, 2025): RNG must be required for deterministic simulation
  if (!rng || typeof rng !== 'function') {
    throw new Error('❌ CRITICAL: RNG required for deterministic land use initialization');
  }
  // TROPICAL: Amazon, Congo, SE Asia
  // Highest biodiversity (50% of global species), fastest deforestation, hardest to restore
  const tropical: RegionalBiome = {
    habitatCoverPercent: 65.0,          // Down from 85% historical (rapid loss)
    habitatCoverSafe: 80.0,             // Need high cover for tropical species
    habitatLossRate: 0.05,              // 0.05%/month (60% higher than global average)
    habitatRestorationRate: 0.005,      // Very slow natural recovery
    extinctionRate: 180.0,              // 180 E/MSY (hotspot, ~1.8× global average)
    extinctionAcceleration: 1.0,        // Accelerating rapidly
    biodiversityWeight: 0.50,           // 50% of global biodiversity impact
    ecosystemsLost: 0,
    ecosystemCollapseRisk: 0.50,        // High risk (50%)
    restorationDifficulty: 2.0,         // 2× harder than baseline
    climateVulnerability: 0.70,         // High vulnerability to warming
  };

  // TEMPERATE: N America, Europe, E Asia
  // Moderate biodiversity, active reforestation programs, easiest to restore
  const temperate: RegionalBiome = {
    habitatCoverPercent: 45.0,          // Historical low, now recovering
    habitatCoverSafe: 60.0,             // Lower requirement than tropical
    habitatLossRate: 0.01,              // Slow loss (protection in place)
    habitatRestorationRate: 0.02,       // Active reforestation (China, EU)
    extinctionRate: 35.0,               // 35 E/MSY (protected, reforestation)
    extinctionAcceleration: 0.3,        // Slowing down
    biodiversityWeight: 0.20,           // 20% of global biodiversity
    ecosystemsLost: 0,
    ecosystemCollapseRisk: 0.20,        // Lower risk
    restorationDifficulty: 1.0,         // Baseline difficulty
    climateVulnerability: 0.40,         // Moderate vulnerability
  };

  // GRASSLANDS: Savanna, prairie, steppe
  // Megafauna habitat, heavily converted to agriculture
  const grasslands: RegionalBiome = {
    habitatCoverPercent: 35.0,          // Heavily degraded (70% converted)
    habitatCoverSafe: 50.0,             // Need contiguous habitat for megafauna
    habitatLossRate: 0.03,              // Moderate conversion (agriculture expansion)
    habitatRestorationRate: 0.015,      // Moderate recovery potential
    extinctionRate: 80.0,               // 80 E/MSY (megafauna pressure, habitat conversion)
    extinctionAcceleration: 0.6,        // Moderate acceleration
    biodiversityWeight: 0.20,           // 20% of global biodiversity (megafauna)
    ecosystemsLost: 0,
    ecosystemCollapseRisk: 0.35,        // Moderate risk
    restorationDifficulty: 1.3,         // Harder than temperate (need large areas)
    climateVulnerability: 0.60,         // High vulnerability (drought, fire)
  };

  // BOREAL/ARCTIC: Taiga, tundra
  // Low biodiversity but mostly intact, climate-threatened
  const borealArctic: RegionalBiome = {
    habitatCoverPercent: 75.0,          // Mostly intact
    habitatCoverSafe: 70.0,             // Already above safe boundary
    habitatLossRate: 0.01,              // Slow loss (remote, protected)
    habitatRestorationRate: 0.005,      // Very slow growth (short seasons)
    extinctionRate: 30.0,               // 30 E/MSY (low diversity, mostly intact)
    extinctionAcceleration: 0.4,        // Climate-driven acceleration
    biodiversityWeight: 0.10,           // 10% of global biodiversity
    ecosystemsLost: 0,
    ecosystemCollapseRisk: 0.30,        // Climate-driven risk
    restorationDifficulty: 1.5,         // Slow growth, permafrost issues
    climateVulnerability: 0.90,         // Extreme vulnerability (fastest warming)
  };

  // Calculate global aggregates (weighted by biodiversity importance)
  // LAYER 2 REMEDIATION (Nov 2, 2025): Biosphere Parameter Sweep
  // CRITICAL-3 FIX (Nov 18, 2025): RNG now required - always sample from distribution
  // Sample global extinction rate from log-uniform [100, 1000] E/MSY range
  // Parameter sweep: Sample from log-uniform distribution
  const globalExtinctionRate = sampleBiosphereExtinctionRate(rng);
  // Scale regional rates proportionally to maintain relative differences
  // while shifting global rate to sampled value
  const baselineGlobalRate =
    tropical.extinctionRate * tropical.biodiversityWeight +
    temperate.extinctionRate * temperate.biodiversityWeight +
    grasslands.extinctionRate * grasslands.biodiversityWeight +
    borealArctic.extinctionRate * borealArctic.biodiversityWeight;
  // = 116 E/MSY (conservative baseline)

  // NaN AUDIT (Nov 7, 2025): Validate baselineGlobalRate before division
  assertFinite(baselineGlobalRate, {
    location: 'initializeLandUseSystem.scaleRegionalRates',
    valueName: 'baselineGlobalRate',
    additionalInfo: {
      tropicalRate: tropical.extinctionRate,
      temperateRate: temperate.extinctionRate,
      grasslandsRate: grasslands.extinctionRate,
      borealArcticRate: borealArctic.extinctionRate
    }
  });

  const scaleFactor = globalExtinctionRate / baselineGlobalRate;
  // Scale regional rates proportionally
  // DETERMINISM FIX (Nov 5, 2025): Clamp scaled rates to [1, 1000] E/MSY range
  // BUG FIX (Nov 11, 2025): Changed min from 10 to 1 E/MSY to allow tech improvements below safe boundary
  // Prevents assertion errors when sampling high global extinction rates
  // MIGRATION (Nov 15, 2025): Use FLOORS from centralConfig instead of inline constants
  tropical.extinctionRate = Math.max(FLOORS.MIN_EXTINCTION_RATE, Math.min(FLOORS.MAX_EXTINCTION_RATE, tropical.extinctionRate * scaleFactor));
  temperate.extinctionRate = Math.max(FLOORS.MIN_EXTINCTION_RATE, Math.min(FLOORS.MAX_EXTINCTION_RATE, temperate.extinctionRate * scaleFactor));
  grasslands.extinctionRate = Math.max(FLOORS.MIN_EXTINCTION_RATE, Math.min(FLOORS.MAX_EXTINCTION_RATE, grasslands.extinctionRate * scaleFactor));
  borealArctic.extinctionRate = Math.max(FLOORS.MIN_EXTINCTION_RATE, Math.min(FLOORS.MAX_EXTINCTION_RATE, borealArctic.extinctionRate * scaleFactor));

  const globalHabitatCover =
    tropical.habitatCoverPercent * 0.17 +      // 17% of land area
    temperate.habitatCoverPercent * 0.10 +     // 10% of land area
    grasslands.habitatCoverPercent * 0.20 +    // 20% of land area
    borealArctic.habitatCoverPercent * 0.23;   // 23% of land area
  // = 65*0.17 + 45*0.10 + 35*0.20 + 75*0.23 = 11.05 + 4.5 + 7.0 + 17.25 = 39.8% (WEIGHTED BY LAND AREA)

  return {
    regions: {
      tropical,
      temperate,
      grasslands,
      borealArctic,
    },
    globalHabitatCoverPercent: globalHabitatCover,
    globalExtinctionRate,
    globalExtinctionAcceleration: 0.6, // Weighted average
    globalEcosystemsLost: 0,
    globalEcosystemCollapseRisk: 0.50, // Maximum regional risk
    naturalExtinctionRate: 1.0,        // 1 E/MSY (background rate, for reference only - not used in calculations)
    carbonSinkLossMultiplier: 1.17,    // Deforestation climate feedback
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
  // FIX (Nov 7, 2025): Sort for deterministic iteration (Issue #11)
  const highRiskBoundaries = Object.entries(boundaries)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(e => e[1])
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
 * Get global temperature increase from planetary boundaries
 *
 * Provides decoupled access to climate change boundary value for downstream systems
 * (storm modeling, biosphere impacts, etc.).
 *
 * @param state - Game state
 * @returns Temperature increase in °C above pre-industrial baseline
 * @throws AssertionError if planetary boundaries system is missing or invalid
 */
export function getGlobalTemperatureIncrease(state: GameState): number {
  const system = assertDefined(state.planetaryBoundariesSystem, {
    location: 'getGlobalTemperatureIncrease',
    valueName: 'planetaryBoundariesSystem',
    month: state.currentMonth
  });

  const boundary = assertDefined(system.boundaries.climate_change, {
    location: 'getGlobalTemperatureIncrease',
    valueName: 'boundaries.climate_change',
    month: state.currentMonth
  });

  return assertFinite(boundary.currentValue, {
    location: 'getGlobalTemperatureIncrease',
    valueName: 'climate_change.currentValue',
    month: state.currentMonth
  });
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

  // Climate change (ARCH-4 Integration: Use actual temperature anomaly)
  // Research: Richardson et al. (2023) - Climate boundary at 1.0°C warming, high-risk at 1.5°C
  // Current approach: Direct mapping from temperature anomaly (no invented conversions)
  const climateBoundary = assertDefined(system.boundaries.climate_change, {
    location: 'updatePlanetaryBoundaries:climate',
    valueName: 'boundaries.climate_change',
    month: state.currentMonth
  });

  // Use temperature anomaly from resource economy (if available)
  if (resources?.co2?.temperatureAnomaly !== undefined) {
    const tempAnomaly = assertFinite(resources.co2.temperatureAnomaly, {
      location: 'updatePlanetaryBoundaries:climate',
      valueName: 'co2.temperatureAnomaly',
      month: state.currentMonth
    });

    // Direct mapping: boundary = 1.0°C, high-risk = 1.5°C
    // currentValue = tempAnomaly / 1.0 (boundary threshold)
    // 1.21°C warming = 1.21× boundary (current 2025 estimate)
    const newClimateValue = assertFinite(tempAnomaly / 1.0, {
      location: 'updatePlanetaryBoundaries:climate',
      valueName: 'climate_change.currentValue',
      month: state.currentMonth,
      additionalInfo: { tempAnomaly }
    });

    climateBoundary.currentValue = Math.max(0, newClimateValue);
  } else {
    // Fallback: Use climateStability (legacy behavior)
    const climateStability = assertProbability(env.climateStability, {
      location: 'updatePlanetaryBoundaries:climate_fallback',
      valueName: 'climateStability',
      month: state.currentMonth
    });

    const newClimateValue = assertFinite(Math.max(0, 1.21 - (climateStability * 0.21)), {
      location: 'updatePlanetaryBoundaries:climate_fallback',
      valueName: 'climate_change.currentValue',
      month: state.currentMonth,
      additionalInfo: { climateStability }
    });

    climateBoundary.currentValue = newClimateValue;
  }

  updateBoundaryStatus(climateBoundary);

  // Biosphere integrity (from regional extinction rates)
  // UPDATED (Oct 30, 2025): BLOCKER-2 fix v3 - IPBES (2019) + Richardson et al. (2023)
  // Current baseline: ~116 E/MSY (weighted across regions, IPBES 2019 conservative)
  // Safe threshold: 10 E/MSY (IPBES planetary boundary)
  // Invasive species contribution (Oct 27, 2025): IPBES (2019) - ~40% of modern extinctions
  if (system.landUse) {
    // Regional rates are NOW in absolute E/MSY units (180, 35, 80, 30 E/MSY)
    // Global weighted rate: 116 E/MSY (conservative, low end of 100-1000 E/MSY range)
    const baseExtinctionRateEMSY = assertFinite(system.landUse.globalExtinctionRate, {
      location: 'updatePlanetaryBoundaries:biosphere',
      valueName: 'landUse.globalExtinctionRate',
      month: state.currentMonth
    });

    // Invasive species amplify extinction rate
    // Research: IPBES (2019) - Invasive species responsible for ~40% of modern extinctions
    // Multiplier: 1.0 (no invasives) to 1.5 (catastrophic invasives at 1.0 impact)
    const invasiveImpact = assertProbability(system.invasiveSpeciesImpact, {
      location: 'updatePlanetaryBoundaries:biosphere',
      valueName: 'invasiveSpeciesImpact',
      month: state.currentMonth
    });
    const invasiveMultiplier = 1.0 + (invasiveImpact * 0.5);

    // BUG FIX v3 (Oct 30, 2025): Use absolute E/MSY values directly
    // Before (v2): Divided relative ratios (2.2×) by safe threshold (10) → 0.22× (WRONG!)
    // Now (v3): Divide absolute rates (116 E/MSY) by safe threshold (10 E/MSY) → 11.6× (CORRECT!)
    // Research: IPBES (2019) - Safe threshold is 10 E/MSY
    // MIGRATION (Nov 15, 2025): Use FLOORS.SAFE_EXTINCTION_RATE from centralConfig
    const totalExtinctionRateEMSY = baseExtinctionRateEMSY * invasiveMultiplier; // In E/MSY units

    const biosphereBoundaryValue = assertFinite(totalExtinctionRateEMSY / FLOORS.SAFE_EXTINCTION_RATE, {
      location: 'updatePlanetaryBoundaries:biosphere',
      valueName: 'biosphere_integrity.currentValue',
      month: state.currentMonth,
      additionalInfo: { baseExtinctionRateEMSY, invasiveMultiplier, totalExtinctionRateEMSY }
    });

    // === IRREVERSIBILITY FRAMEWORK (Nov 17, 2025 - Phase 2) ===
    // Research: Tilman et al. (1994) - Extinction debt concept
    // Haddad et al. (2015) - 200-year habitat fragmentation recovery timescale
    // Kuussaari et al. (2009) - 20-50 year lag timescales
    // IPBES (2019) - 100-1000× background extinction rate, permanent loss floor
    const biosphereBoundary = system.boundaries.biosphere_integrity;

    // Track historical peak extinction rate
    if (biosphereBoundary.peak === undefined) {
      biosphereBoundary.peak = biosphereBoundaryValue;
    } else {
      biosphereBoundary.peak = Math.max(biosphereBoundary.peak, biosphereBoundaryValue);
    }

    // === ASYMPTOTIC RECOVERY WITH RESTORATION TECHNOLOGIES ===
    // Check for habitat restoration and rewilding technologies
    const restorationDeployed = (state.globalMetrics as any).habitatRestorationActive === 1.0;
    const rewildingDeployed = (state.globalMetrics as any).rewildingActive === 1.0;

    // Calculate restoration effectiveness
    // Habitat restoration: 30-50% effectiveness (moderate)
    // Rewilding: 20-40% effectiveness (moderate, long-term)
    // Combined: Max 60% effectiveness (cannot fully reverse extinction)
    let restorationEffectiveness = 0;
    if (restorationDeployed) {
      restorationEffectiveness += 0.40;  // 40% from habitat restoration
    }
    if (rewildingDeployed) {
      restorationEffectiveness += 0.20;  // 20% from rewilding
    }

    // Apply asymptotic recovery if irreversible
    if (biosphereBoundary.irreversible && biosphereBoundary.recoveryHalfLife && biosphereBoundary.minimumAsymptoticValue) {
      // Import asymptotic recovery function
      const { asymptoteRecovery } = require('./utils/irreversibility');

      // Target value: current minus restoration effectiveness
      const targetValue = Math.max(
        biosphereBoundary.minimumAsymptoticValue * 10,  // Scale 5% floor to [0,10] boundary range
        biosphereBoundaryValue - (restorationEffectiveness * 10)  // Effectiveness scaled to boundary units
      );

      // Apply asymptotic recovery (exponential approach to floor)
      const recoveredValue = asymptoteRecovery(
        biosphereBoundary.currentValue || biosphereBoundaryValue,
        targetValue,
        biosphereBoundary.recoveryHalfLife,
        biosphereBoundary.minimumAsymptoticValue * 10,  // Scale floor to [0,10] range
        1/12  // 1 month = 1/12 year
      );

      biosphereBoundary.currentValue = recoveredValue;

      // Log recovery progress (annually)
      if (state.currentMonth % 12 === 0 && restorationEffectiveness > 0) {
        console.log(`  🌍 Biosphere Asymptotic Recovery:`);
        console.log(`     Current: ${recoveredValue.toFixed(3)}× | Target: ${targetValue.toFixed(3)}× | Floor: ${(biosphereBoundary.minimumAsymptoticValue! * 10).toFixed(3)}×`);
        console.log(`     Restoration: ${(restorationEffectiveness * 100).toFixed(1)}% (habitat: ${restorationDeployed ? 'Y' : 'N'}, rewilding: ${rewildingDeployed ? 'Y' : 'N'})`);
        console.log(`     Half-life: ${biosphereBoundary.recoveryHalfLife} years (Haddad 2015: century-scale)`);
      }
    } else {
      // Fallback: Direct assignment (for backward compatibility)
      biosphereBoundary.currentValue = biosphereBoundaryValue;
    }
    // = (116 * 1.225) / 10 = 142 / 10 = 14.2× safe threshold (deep overshoot)
  } else {
    // Fallback to biodiversity index if land use system not initialized
    const biodiversityIndex = assertProbability(env.biodiversityIndex, {
      location: 'updatePlanetaryBoundaries:biosphere_fallback',
      valueName: 'biodiversityIndex',
      month: state.currentMonth
    });
    system.boundaries.biosphere_integrity.currentValue = Math.max(0, 10.0 * (1 - biodiversityIndex));
  }
  updateBoundaryStatus(system.boundaries.biosphere_integrity);

  // Freshwater (from freshwater system if available)
  // FIX #3 (Oct 18, 2025): Add AI infrastructure water consumption
  // Research: UC Riverside (2024), RAND (2024) - AI data centers consume massive water
  if (state.freshwaterSystem) {
    const { calculateAIResourceConsumption, getWaterStressContribution } = require('./aiInfrastructureResources');
    const aiWaterStress = assertFinite(getWaterStressContribution(state), {
      location: 'updatePlanetaryBoundaries:freshwater',
      valueName: 'aiWaterStress',
      month: state.currentMonth
    });
    const baseStress = assertProbability(state.freshwaterSystem.waterStress, {
      location: 'updatePlanetaryBoundaries:freshwater',
      valueName: 'waterStress',
      month: state.currentMonth
    });
    const totalStress = assertFinite(baseStress + aiWaterStress, {
      location: 'updatePlanetaryBoundaries:freshwater',
      valueName: 'totalStress',
      month: state.currentMonth,
      additionalInfo: { baseStress, aiWaterStress }
    });

    const freshwaterValue = assertFinite(Math.max(0, 1.15 + (totalStress - 0.5) * 0.7), {
      location: 'updatePlanetaryBoundaries:freshwater',
      valueName: 'freshwater_change.currentValue',
      month: state.currentMonth,
      additionalInfo: { totalStress }
    });
    system.boundaries.freshwater_change.currentValue = freshwaterValue;
  }
  updateBoundaryStatus(system.boundaries.freshwater_change);

  // Biogeochemical flows (from phosphorus system + legacy nutrient stocks - TIER 2 HIGH, Nov 15, 2025)
  // Research: Lake Erie case study, nitrogen/phosphorus half-life studies
  // Expected impact: 10% god mode effectiveness gap → legacy stocks create inertia
  //
  // INTEGRATION (Nov 17, 2025): Nitrogen-food coupling now models technology-driven nitrogen reduction
  // with regional yield penalty curves. This creates realistic constraint on nitrogen management.
  if (state.phosphorusSystem) {
    const reserves = assertProbability(state.phosphorusSystem.reserves, {
      location: 'updatePlanetaryBoundaries:biogeochemical',
      valueName: 'phosphorusSystem.reserves',
      month: state.currentMonth
    });

    // Base calculation (depletion factor)
    const depletion = 1 - reserves; // reserves is already 0-1 scale

    // TIER 2 HIGH: Update legacy nutrient stocks and nitrogen-food coupling
    // Legacy stocks create INERTIA - even with 100% input reduction, pollution stays high for decades
    // Nitrogen-food coupling: reducing nitrogen hurts crop yields (regional nonlinear penalties)
    let effectiveNitrogen = 0;
    let effectivePhosphorus = 0;
    let globalFoodProductionIndex = 1.0;
    let currentNInput = 0;
    let currentPInput = 0;

    // 2025 baseline: 120 Mt N/year = 10 Mt N/month, 25 Mt P/year = 2.08 Mt P/month
    const BASELINE_N_INPUT_PER_MONTH = 10;  // Mt N/month
    const BASELINE_P_INPUT_PER_MONTH = 2.08; // Mt P/month

    if (system.legacyNutrientStock) {
      // Import update functions dynamically to avoid circular dependencies
      const { updateLegacyNutrientStocks } = require('@/simulation/legacyNutrientStocks');
      const { updateNitrogenFoodCoupling } = require('@/simulation/nitrogenFoodCoupling');

      // Get deployed nitrogen-reducing technologies
      // TODO (TIER 2 HIGH): Connect to actual technology deployment
      // 6 biogeochemical restoration technologies from research (nitrogen_food_coupling_20251115.md):
      // 1. Precision agriculture (25-30% N reduction) - TIER 3 or god mode policy
      // 2. Vertical/indoor farming (60% N reduction) - TIER 3 or god mode policy
      // 3. Food waste reduction (30% demand reduction) - TIER 3 or god mode policy
      // 4. Nitroplast integration (20-40% reduction, 2040+, 40% success probability) - TIER 4 breakthrough
      // 5. Precision fermentation (30-50% agricultural N reduction) - TIER 3 or god mode policy
      // 6. Dietary shift (protein transition 50:50 A:P ratio) - TIER 3 or god mode policy
      const deployedTechEffectiveness: number[] = [];
      // For now, no technologies deployed (baseline scenario)

      // Update nitrogen-food coupling and get global food production impact
      globalFoodProductionIndex = updateNitrogenFoodCoupling(state, deployedTechEffectiveness);

      // Current nitrogen and phosphorus inputs (Mt/month)
      // Food production index can modify this (lower food production = less nitrogen needed)
      currentNInput = BASELINE_N_INPUT_PER_MONTH * globalFoodProductionIndex;  // Mt N/month
      currentPInput = BASELINE_P_INPUT_PER_MONTH * Math.sqrt(globalFoodProductionIndex);  // Mt P/month (less elastic than N)

      // Update stocks and get effective pollution (current + legacy releases)
      const effective = updateLegacyNutrientStocks(state, currentNInput, currentPInput);
      effectiveNitrogen = effective.effectiveNitrogen;
      effectivePhosphorus = effective.effectivePhosphorus;
    } else {
      // No legacy tracking - inputs scale with depletion
      currentNInput = BASELINE_N_INPUT_PER_MONTH * (1 - depletion);
      currentPInput = BASELINE_P_INPUT_PER_MONTH * (1 - depletion);
      effectiveNitrogen = currentNInput;
      effectivePhosphorus = currentPInput;
    }

    // Boundary value calculation
    // Baseline (2025): 2.94 (294% of safe boundary)
    // Scale by effective pollution vs baseline pollution
    // Baseline total: 12.1 Mt/month (10 N + 2.1 P)
    const baselinePollution = 12.1;
    const currentEffectivePollution = effectiveNitrogen + effectivePhosphorus;
    const pollutionRatio = currentEffectivePollution / baselinePollution;

    // Legacy contribution = effective pollution minus current inputs
    // Shows how much pollution comes from legacy stocks vs current inputs
    const legacyContribution = Math.max(0, effectiveNitrogen + effectivePhosphorus - currentNInput - currentPInput);

    // Boundary value = baseline × pollution ratio + depletion factor
    // Depletion factor: phosphorus reserves declining increases boundary value
    // This creates INERTIA: reducing current inputs helps, but legacy stocks slow recovery dramatically
    const biogeochemicalValue = assertFinite(Math.max(0, 2.94 * pollutionRatio + depletion * 0.5), {
      location: 'updatePlanetaryBoundaries:biogeochemical',
      valueName: 'biogeochemical_flows.currentValue',
      month: state.currentMonth,
      additionalInfo: {
        reserves,
        depletion,
        legacyContribution,
        effectiveNitrogen,
        effectivePhosphorus,
        currentNInput,
        currentPInput,
        globalFoodProductionIndex
      }
    });
    system.boundaries.biogeochemical_flows.currentValue = biogeochemicalValue;
  }
  updateBoundaryStatus(system.boundaries.biogeochemical_flows);

  // Novel entities (from environmental pollution)
  const pollutionLevel = assertProbability(env.pollutionLevel, {
    location: 'updatePlanetaryBoundaries:novelEntities',
    valueName: 'pollutionLevel',
    month: state.currentMonth
  });
  const novelEntitiesValue = assertFinite(Math.max(0, 1.5 + (pollutionLevel - 0.3) * 0.5), {
    location: 'updatePlanetaryBoundaries:novelEntities',
    valueName: 'novel_entities.currentValue',
    month: state.currentMonth,
    additionalInfo: { pollutionLevel }
  });

  // === IRREVERSIBILITY FRAMEWORK (Nov 16, 2025) ===
  // Research: Cousins et al. (2022) - PFAS planetary boundary, Sörengård et al. (2024) - energy trap economics
  // Three barriers create energy trap: economic impossibility, dilution problem, planetary irreversibility
  // Legacy stock release + asymptotic recovery mechanics
  const novelEntitiesBoundary = system.boundaries.novel_entities;

  // Import irreversibility utilities
  const { legacyStockRelease, asymptoteRecovery } = require('./utils/irreversibility');

  // Track historical peak contamination
  if (novelEntitiesBoundary.peak === undefined) {
    novelEntitiesBoundary.peak = novelEntitiesValue;
  } else {
    novelEntitiesBoundary.peak = Math.max(novelEntitiesBoundary.peak, novelEntitiesValue);
  }

  let finalNovelEntitiesValue = novelEntitiesValue;

  // === LEGACY STOCK RELEASE (if enabled) ===
  if (novelEntitiesBoundary.legacyStock !== undefined && novelEntitiesBoundary.legacyStock > 0) {
    const releaseHalfLife = novelEntitiesBoundary.recoveryHalfLife || 75; // Default 75 years
    const { newStock, released } = legacyStockRelease(novelEntitiesBoundary.legacyStock, releaseHalfLife, 1/12);

    novelEntitiesBoundary.legacyStock = newStock;

    // Released contamination increases boundary value
    // Scale: 46,000 Mt total legacy stock = 0.5 boundary points (empirically calibrated)
    const releaseImpact = (released / 46000) * 0.5;
    finalNovelEntitiesValue = Math.min(2.0, finalNovelEntitiesValue + releaseImpact);

    // Log significant releases (quarterly)
    if (released > 100 && state.currentMonth % 3 === 0) {
      console.log(`  🌍 Novel Entities Legacy Stock Release:`);
      console.log(`     Released: ${released.toFixed(0)} Mt this month | Remaining: ${newStock.toFixed(0)} Mt`);
      console.log(`     Boundary impact: +${releaseImpact.toFixed(4)} (now ${finalNovelEntitiesValue.toFixed(3)})`);
    }
  }

  // === ASYMPTOTIC RECOVERY (if cleanup tech deployed) ===
  // Check if prevention/remediation technologies are reducing contamination
  if (novelEntitiesBoundary.irreversible && novelEntitiesBoundary.minimumAsymptoticValue !== undefined) {
    const targetValue = novelEntitiesBoundary.minimumAsymptoticValue * 2; // Floor on 0-2 scale
    const halfLife = novelEntitiesBoundary.recoveryHalfLife || 75;

    // Only apply asymptotic recovery if value is declining (tech deployed)
    if (finalNovelEntitiesValue < novelEntitiesBoundary.currentValue) {
      const recoveredValue = asymptoteRecovery(
        novelEntitiesBoundary.currentValue, // Start from current (not raw value)
        targetValue,
        halfLife,
        novelEntitiesBoundary.minimumAsymptoticValue,
        1/12 // Monthly timestep
      );

      // Use recovered value if it represents improvement
      if (recoveredValue < novelEntitiesBoundary.currentValue) {
        const delta = novelEntitiesBoundary.currentValue - recoveredValue;
        finalNovelEntitiesValue = recoveredValue;

        // Log recovery progress (annually)
        if (delta > 0.001 && state.currentMonth % 12 === 0) {
          console.log(`  ♻️ Novel Entities Asymptotic Recovery:`);
          console.log(`     Progress: ${novelEntitiesBoundary.currentValue.toFixed(3)} → ${recoveredValue.toFixed(3)} (Δ${delta.toFixed(4)})`);
          console.log(`     Asymptotic floor: ${targetValue.toFixed(3)} (${(novelEntitiesBoundary.minimumAsymptoticValue * 100).toFixed(0)}% of scale)`);
          console.log(`     Half-life: ${halfLife} years (Montreal Protocol analog)`);
        }
      }
    }
  }

  // === IRREVERSIBLE FLOOR (original mechanism - backstop) ===
  // Irreversible floor: 90% of peak contamination (atmospheric distribution prevents full cleanup)
  const irreversibleFraction = 0.90; // MODERATE estimate (10% reversible via point-source cleanup)
  const irreversibleFloor = novelEntitiesBoundary.peak * irreversibleFraction;

  // Apply floor: Cannot clean below 90% of historical peak OR asymptotic minimum
  const flooredValue = Math.max(irreversibleFloor, finalNovelEntitiesValue);

  // Log if floor is active (annually)
  if (flooredValue > finalNovelEntitiesValue && state.currentMonth % 12 === 0) {
    console.log(`  ☢️ Novel Entities Irreversibility Floor Active:`);
    console.log(`     Peak: ${novelEntitiesBoundary.peak.toFixed(3)} | Floor (90%): ${irreversibleFloor.toFixed(3)}`);
    console.log(`     Attempted: ${finalNovelEntitiesValue.toFixed(3)} | Actual: ${flooredValue.toFixed(3)}`);
    console.log(`     Cousins 2022: Global PFAS distribution prevents full remediation`);
  }

  updateBoundaryStatus(system.boundaries.novel_entities);

  // Ocean acidification (ARCH-4 Integration: Direct pH mapping)
  // Research: Richardson et al. (2023) - Ocean boundary at pH 8.0, current ~8.05 (near transgression)
  // IPCC Ocean Report (2019) - pH declining with CO2 absorption
  if (state.oceanAcidificationSystem) {
    // Use pH level directly if available (pHLevel: [0,1] where 1.0 = pre-industrial 8.2)
    const pHLevel = assertProbability(state.oceanAcidificationSystem.pHLevel, {
      location: 'updatePlanetaryBoundaries:ocean',
      valueName: 'pHLevel',
      month: state.currentMonth
    });

    // Convert pHLevel [0,1] to actual pH: pH = 7.0 + (pHLevel × 1.2)
    // pHLevel = 1.0 → pH 8.2 (pre-industrial)
    // pHLevel = 0.83 → pH 8.0 (boundary)
    // pHLevel = 0.79 → pH 7.95 (transgression)
    const actualPH = 7.0 + (pHLevel * 1.2);

    // Boundary value: (8.0 - actualPH) / (8.0 - 7.9) × 1.0 + 1.0
    // pH 8.2 → 0.0× (pre-industrial, safe)
    // pH 8.0 → 1.0× (boundary)
    // pH 7.9 → 2.0× (high-risk)
    const oceanBoundaryValue = Math.max(0, (8.0 - actualPH) / 0.1 + 1.0);

    const oceanValue = assertFinite(oceanBoundaryValue, {
      location: 'updatePlanetaryBoundaries:ocean',
      valueName: 'ocean_acidification.currentValue',
      month: state.currentMonth,
      additionalInfo: { pHLevel, actualPH }
    });
    system.boundaries.ocean_acidification.currentValue = oceanValue;
  }
  updateBoundaryStatus(system.boundaries.ocean_acidification);

  // Ozone (improving steadily - Montreal Protocol success!)
  system.boundaries.stratospheric_ozone.currentValue = Math.max(0, system.boundaries.stratospheric_ozone.currentValue - 0.0005);
  updateBoundaryStatus(system.boundaries.stratospheric_ozone);

  // Aerosols (improving with regulations)
  system.boundaries.atmospheric_aerosols.currentValue = Math.max(0, system.boundaries.atmospheric_aerosols.currentValue - 0.0003);
  updateBoundaryStatus(system.boundaries.atmospheric_aerosols);

  // === 2. RECALCULATE AGGREGATE METRICS ===
  // FIX (Nov 7, 2025): Sort for deterministic iteration (Issue #11)
  const sortedBoundaries = Object.entries(system.boundaries)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(e => e[1]);

  system.boundariesBreached = sortedBoundaries
    .filter(b => b.status !== 'safe').length;

  system.boundariesWorsening = sortedBoundaries
    .filter(b => b.trend === 'worsening').length;

  system.boundariesImproving = sortedBoundaries
    .filter(b => b.trend === 'improving').length;

  system.coreBoundariesBreached =
    system.boundaries.climate_change.status !== 'safe' &&
    system.boundaries.biosphere_integrity.status !== 'safe';

  // === 3. CALCULATE TIPPING POINT RISK ===
  const tippingPointRisk = assertProbability(calculateTippingPointRisk(
    system.boundariesBreached,
    system.boundariesWorsening,
    system.coreBoundariesBreached,
    system.boundaries
  ), {
    location: 'updatePlanetaryBoundaries:tippingPoint',
    valueName: 'tippingPointRisk',
    month: state.currentMonth
  });

  system.tippingPointRisk = tippingPointRisk;

  // Track history
  system.boundariesBreachedHistory.push(system.boundariesBreached);
  system.tippingPointRiskHistory.push(tippingPointRisk);

  // === 4. BAYESIAN CASCADE TRIGGER (Oct 16, 2025) ===
  // Blended model with 3 elements:
  // 1. Time-dependent hazard functions (different threats kill at different speeds)
  // 2. Survival-based adjustment (learning to cope reduces risk)
  // 3. Bayesian belief updating (interventions update posterior risk)
  
  if (system.tippingPointRisk > 0.5) {
    // Track when we first entered high-risk zone
    if (!(system as any).firstHighRiskMonth) {
      (system as any).firstHighRiskMonth = state.currentMonth;
    }
    
    // === ELEMENT 1: TIME-DEPENDENT HAZARD BY BOUNDARY TYPE ===
    // Fast killers (1-6 months): Water, food
    const fastBoundaries = ['freshwater_change', 'biogeochemical_flows'];
    const fastRisk = fastBoundaries.reduce((sum, name) => {
      const boundary = system.boundaries[name as BoundaryName];
      return sum + (boundary?.status !== 'safe' ? 1 : 0);
    }, 0) / fastBoundaries.length;
    
    // Medium killers (6-36 months): Climate, ocean, pollution
    const mediumBoundaries = ['climate_change', 'ocean_acidification', 'novel_entities'];
    const mediumRisk = mediumBoundaries.reduce((sum, name) => {
      const boundary = system.boundaries[name as BoundaryName];
      return sum + (boundary?.status !== 'safe' ? 1 : 0);
    }, 0) / mediumBoundaries.length;
    
    // Slow killers (36-120 months): Biodiversity, land use
    const slowBoundaries = ['biosphere_integrity', 'land_system_change'];
    const slowRisk = slowBoundaries.reduce((sum, name) => {
      const boundary = system.boundaries[name as BoundaryName];
      return sum + (boundary?.status !== 'safe' ? 1 : 0);
    }, 0) / slowBoundaries.length;
    
    // Weighted by kill speed (fast = 3x, medium = 1x, slow = 0.3x)
    const weightedRisk = (fastRisk * 3.0 + mediumRisk * 1.0 + slowRisk * 0.3) / 4.3;
    
    // === ELEMENT 2: SURVIVAL-BASED ADJUSTMENT (BAYESIAN INFERENCE) ===
    // If we've survived high risk for N months, actual risk is probably lower than estimated
    const monthsSurvivedAtHighRisk = state.currentMonth - ((system as any).firstHighRiskMonth || state.currentMonth);
    // Decay: 30 years (360 months) to fully adjust belief
    const survivalAdjustment = Math.max(0.3, 1.0 - (monthsSurvivedAtHighRisk / 360));
    
    // === ELEMENT 3: TRAJECTORY-BASED BELIEF UPDATE ===
    // Are boundaries improving or worsening?
    const recentImprovement = system.boundariesImproving / Math.max(1, system.boundariesBreached);
    const trajectoryMultiplier = system.boundariesWorsening > system.boundariesImproving ? 1.3 : 0.7;
    
    // === COMBINED POSTERIOR RISK ===
    const priorRisk = system.tippingPointRisk; // Original calculation
    const posteriorRisk = weightedRisk * survivalAdjustment * trajectoryMultiplier;
    const blendedRisk = (priorRisk + posteriorRisk) / 2; // Blend frequentist + Bayesian
    
    // Research-backed trigger rate: 40-70% over 30 years = 0.5-2% per year = 0.05-0.2% per month
    const cascadeProbability = Math.pow(Math.max(0, blendedRisk - 0.5) / 0.5, 2.0);
    const monthlyTriggerChance = cascadeProbability * 0.02; // Max 2% per month (not 10%)
    
    // Grace period: No trigger in first 24 months (cascades take 2-5 years to manifest)
    const gracePeriod = state.currentMonth < 24;

    // Stochastic trigger with Bayesian adjustment
    if (!system.cascadeActive && !gracePeriod && deterministicRandom() < monthlyTriggerChance) {
      system.cascadeActive = true;
      system.cascadeStartMonth = state.currentMonth;
      console.log(`\n🌪️ ========== TIPPING POINT CASCADE TRIGGERED ==========`);
      console.log(`Month: ${state.currentMonth}`);
      console.log(`Boundaries breached: ${system.boundariesBreached}/9`);
      console.log(`Prior risk: ${(priorRisk * 100).toFixed(1)}%`);
      console.log(`Posterior risk (Bayesian): ${(posteriorRisk * 100).toFixed(1)}%`);
      console.log(`Survival adjustment: ${(survivalAdjustment * 100).toFixed(0)}% (${monthsSurvivedAtHighRisk} months)`);
      console.log(`Trigger chance: ${(monthlyTriggerChance * 100).toFixed(3)}% per month`);
      console.log(`\n⚠️ CASCADING FEEDBACK LOOPS INITIATED`);
      console.log(`Fast killers (water/food): ${(fastRisk * 100).toFixed(0)}%`);
      console.log(`Medium killers (climate/ocean): ${(mediumRisk * 100).toFixed(0)}%`);
      console.log(`Slow killers (biodiversity/land): ${(slowRisk * 100).toFixed(0)}%`);
      console.log(`Mortality now scales with environmental thresholds`);
      console.log(`Recovery possible with aggressive interventions\n`);
    }

    // Once active, severity scales with blended risk
    if (system.cascadeActive) {
      const baseSeverity = Math.pow(Math.max(0, blendedRisk - 0.5) / 0.5, 1.5);
      const stochasticMultiplier = 0.8 + deterministicRandom() * 0.4;
      system.cascadeSeverity = baseSeverity * stochasticMultiplier;
      system.cascadeMultiplier = 1.0 + system.cascadeSeverity;
    }
  } else if (system.cascadeActive && system.tippingPointRisk < 0.45) {
    // Cascade can REVERSE if risk drops significantly
    system.cascadeActive = false;
    system.cascadeSeverity = 0;
    system.cascadeMultiplier = 1.0;
    delete (system as any).firstHighRiskMonth; // Reset survival tracking
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
  console.log('⚠️ Old cascade trigger called - system now uses continuous severity');
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
  const monthsSinceCascade = state.currentMonth - assertStateProperty(
    system,
    'cascadeStartMonth',
    {
      location: 'applyTippingPointCascadeEffects',
      month: state.currentMonth,
      expectedSource: 'planetaryBoundaries:detectTippingPoint'
    }
  );

  // === P0.5 (Oct 15, 2025): STOCHASTIC ENVIRONMENTAL COLLAPSE ===
  // Add ±25% random variation to degradation rates (weather, local conditions, random events)
  const envStochasticFactor = () => 0.75 + deterministicRandom() * 0.5; // 75% to 125%

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
    resources.food.reserves = Math.max(0, resources.food.reserves * (1 - foodDecay));
  }
  if (resources.water) {
    const waterDecay = 0.03 * envStochasticFactor(); // Base 3% ± variation (droughts, contamination)
    resources.water.reserves = Math.max(0, resources.water.reserves * (1 - waterDecay));
  }

  // === QOL COLLAPSE ===
  // NOTE: Food security degradation moved to FoodSecurityDegradationPhase (Oct 17, 2025)
  // This ensures degradation happens every month during crises, not just during cascades
  qol.healthcareQuality = Math.max(0, qol.healthcareQuality * 0.98);
  qol.physicalSafety = Math.max(0, qol.physicalSafety * 0.97);
  qol.socialConnection = Math.max(0, qol.socialConnection * 0.97);
  qol.mentalHealth = Math.max(0, qol.mentalHealth * 0.96);

  // === POPULATION DEATHS ===
  // BUG FIX (Oct 16, 2025): REMOVED direct cascade death application
  //
  // Previous approach: Apply cascade deaths separately via legacy death system (now addMortalityRisk)
  // Problem: This DOUBLE-COUNTED deaths! The cascade degrades the environment
  //          (lines 566-579), which then causes environmental mortality
  //          (climate/ecosystem/pollution deaths) via Bayesian mortality resolution
  //          in updateHumanPopulation(). So the same deaths were counted twice:
  //          - Once as "cascade" deaths
  //          - Again as "climate/ecosystem/pollution" deaths
  // 
  // Result: Cascade deaths (8,480M) > Total deaths (7,242M) - physically impossible!
  // 
  // New approach: Let the cascade degrade the environment (lines 566-589), and let
  //               the normal environmental mortality system (calculateEnvironmentalMortality)
  //               handle the deaths. The cascade's impact is already captured in the
  //               accelerated environmental degradation rates.
  // 
  // Research validation:
  // - Black Death: 30-60% over 6 years = 0.5% monthly (historical cascades)
  // - This mortality is captured via famine + disease + ecosystem collapse
  // - No separate "cascade" category needed - it's the SUM of environmental deaths
  //
  // Note: The cascade still matters! It:
  // 1. Accelerates environmental degradation (2-4% monthly vs 0.1% baseline)
  // 2. Depletes resources faster (food -4%, water -3% monthly)
  // 3. Collapses QoL (food security, healthcare, safety all decline)
  // 4. These feed into calculateEnvironmentalMortality() → deaths tracked correctly

  // === LOG PROGRESS ===
  if (monthsSinceCascade % 6 === 0) { // Log every 6 months
    const population = state.humanPopulationSystem.population;
    const baseMortalityRate = assertStateProperty(
      state.config.scenarioParameters,
      'cascadeMortalityRate',
      {
        location: 'applyTippingPointCascade',
        month: state.currentMonth,
        expectedSource: 'centralConfig.ts'
      }
    );

    // BUG FIX (Oct 30, 2025): BLOCKER-1 - Cap displayed mortality at 100% (physical constraint)
    // ROOT CAUSE: Unbounded exponential 1.05^N produces >100% mortality at long timescales
    //   Example: Month 192 (144 past crisis) → 1.05^144 = 1687.9× → 843.95% monthly mortality
    // IMPORTANT: This value is FOR DISPLAY ONLY. Actual mortality is computed by:
    //   - calculateEnvironmentalMortality() in environmental.ts
    //   - resolveMortality() in bayesianMortality.ts (with 2.8% monthly cap)
    // FIX: Cap theoretical mortality at 100%, warn when exceeded

    const theoreticalMortalityUncapped = monthsSinceCascade > 48
      ? baseMortalityRate * Math.pow(1.05, monthsSinceCascade - 48)
      : baseMortalityRate;

    // Physical constraint: monthly mortality cannot exceed 100% (entire population dies once)
    const mortalityRateDisplay = Math.min(1.0, theoreticalMortalityUncapped);
    const exceededPhysicalLimit = theoreticalMortalityUncapped > 1.0;

    console.log(`\n🌪️ TIPPING POINT CASCADE - Month ${monthsSinceCascade}`);
    console.log(`   Climate: ${(env.climateStability * 100).toFixed(1)}%`);
    console.log(`   Biodiversity: ${(env.biodiversityIndex * 100).toFixed(1)}%`);
    console.log(`   Population: ${population.toFixed(2)}B (${(population * 1_000_000_000).toFixed(0)} people)`);
    console.log(`   Monthly mortality (theoretical): ${(mortalityRateDisplay * 100).toFixed(1)}%`);

    if (exceededPhysicalLimit) {
      console.log(`   ⚠️ Theoretical mortality exceeds 100% (${(theoreticalMortalityUncapped * 100).toFixed(0)}% uncapped)`);
      console.log(`   ⚠️ Actual mortality capped by Bayesian system (2.8% monthly limit)`);
    }

    if (monthsSinceCascade < 48) {
      console.log(`   Status: Initial crisis (Month ${monthsSinceCascade}/48)`);
    } else {
      console.log(`   Status: ACCELERATING COLLAPSE (Month ${monthsSinceCascade - 48} past crisis)`);
      // NaN AUDIT (Nov 7, 2025): Protect division by baseMortalityRate (should be > 0 from config)
      if (baseMortalityRate > 0) {
        console.log(`   Death rate: ${(theoreticalMortalityUncapped / baseMortalityRate).toFixed(1)}x baseline`);
      } else {
        console.log(`   Death rate: INVALID (baseMortalityRate = ${baseMortalityRate})`);
      }
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

  // === 1. UPDATE REGIONAL BIOMES ===
  // Update each biome separately with region-specific dynamics
  const regions = landUse.regions;
  const regionNames: Array<keyof typeof regions> = ['tropical', 'temperate', 'grasslands', 'borealArctic'];

  for (const regionName of regionNames) {
    const region = regions[regionName];

    // 1A. UPDATE HABITAT COVER (region-specific rates)
    const netHabitatChange = region.habitatRestorationRate - region.habitatLossRate;
    region.habitatCoverPercent = Math.max(0, Math.min(100,
      region.habitatCoverPercent + netHabitatChange
    ));

    // 1B. FEEDBACK: HABITAT LOSS → EXTINCTION ACCELERATION
    // Threshold varies by biome - tropical more sensitive (30%), boreal/arctic less (40%)
    const criticalThreshold = regionName === 'tropical' ? 30 :
                             regionName === 'temperate' ? 35 :
                             regionName === 'grasslands' ? 40 : 45;

    const habitatLost = 100 - region.habitatCoverPercent;
    if (habitatLost > criticalThreshold) {
      const habitatSeverity = (habitatLost - criticalThreshold) / (100 - criticalThreshold);
      region.extinctionAcceleration = 0.5 + (habitatSeverity * 2.0); // 0.5x → 2.5x acceleration
    } else {
      // Recovery phase
      region.extinctionAcceleration = Math.max(0.1, region.extinctionAcceleration * 0.98);
    }

    // 1C. UPDATE REGIONAL EXTINCTION RATE
    // BUG FIX v3 (Oct 30, 2025): BLOCKER-2 - Update caps for absolute E/MSY scale
    // BUG FIX (Nov 11, 2025): Changed min from 10 to 1 E/MSY to allow tech improvements below safe boundary
    // Research: IPBES (2019) - extinction rates increase ~10-30% per decade under BAU
    // Use percentage-based growth with saturation to prevent runaway accumulation
    // Mass extinction threshold: 1000 E/MSY (100× safe boundary = >75% species loss)
    // MIGRATION (Nov 15, 2025): Use FLOORS from centralConfig instead of inline constants

    // Ensure extinction rate never drops to zero (percentage growth would get stuck)
    const currentRate = assertInRange(
      region.extinctionRate,
      FLOORS.MIN_EXTINCTION_RATE,
      FLOORS.MAX_EXTINCTION_RATE,
      {
        location: 'updateLandUseSystem (pre-update)',
        valueName: `${regionName}.extinctionRate`,
        month: state.currentMonth
      }
    );

    // Monthly percentage increase (scales with acceleration)
    // acceleration 2.0 → ~0.2% per month → ~2.4% per year → ~24% per decade (IPBES range)
    // acceleration 1.0 → ~0.1% per month → ~1.2% per year → ~12% per decade
    const monthlyPercentage = region.extinctionAcceleration * 0.001; // 0.1% at 1.0 acceleration

    // Logistic saturation: Growth slows as we approach max
    // Clamped to [0, 1] to prevent negative growth multipliers
    const saturationFactor = Math.max(0, 1.0 - (currentRate / FLOORS.MAX_EXTINCTION_RATE));
    const growthMultiplier = 1.0 + (monthlyPercentage * saturationFactor);

    const newExtinctionRate = currentRate * growthMultiplier;

    // Cap at MAX and log if we hit mass extinction threshold
    const cappedRate = Math.min(FLOORS.MAX_EXTINCTION_RATE, Math.max(FLOORS.MIN_EXTINCTION_RATE, newExtinctionRate));

    if (newExtinctionRate >= FLOORS.MAX_EXTINCTION_RATE) {
      console.log(
        `\n🌍💀 MASS EXTINCTION THRESHOLD: ${regionName} extinction rate capped at ${FLOORS.MAX_EXTINCTION_RATE}× ` +
        `(was ${newExtinctionRate.toFixed(1)}×) - >75% species loss, month ${state.currentMonth}`
      );
    }

    region.extinctionRate = assertInRange(
      cappedRate,
      FLOORS.MIN_EXTINCTION_RATE,
      FLOORS.MAX_EXTINCTION_RATE,
      {
        location: 'updateLandUseSystem (post-update)',
        valueName: `${regionName}.extinctionRate`,
        month: state.currentMonth
      }
    );

    // 1D. FEEDBACK: EXTINCTION → ECOSYSTEM COLLAPSE
    // BUG FIX v3 (Oct 30, 2025): BLOCKER-2 - Restore collapse thresholds to absolute E/MSY scale
    // Tropical collapses are cascading (highest biodiversity)
    // Thresholds in E/MSY units (when regional rate exceeds threshold, collapse risk increases)
    const collapseThreshold = regionName === 'tropical' ? 350.0 :  // 350 E/MSY (severe tropical collapse)
                             regionName === 'temperate' ? 150.0 :  // 150 E/MSY (temperate stress)
                             regionName === 'grasslands' ? 250.0 : // 250 E/MSY (megafauna collapse)
                             regionName === 'borealArctic' ? 120.0 : 100.0;  // 120 E/MSY (boreal stress)

    if (region.extinctionRate > collapseThreshold) {
      region.ecosystemCollapseRisk = Math.min(1.0, region.ecosystemCollapseRisk + 0.01);

      // Check for ecosystem collapse (varies by biodiversity weight)
      const collapseChance = region.biodiversityWeight * 0.05; // Tropical has highest chance
      if (region.ecosystemCollapseRisk > 0.80 && deterministicRandom() < collapseChance) {
        region.ecosystemsLost++;
        const regionLabel = String(regionName).toUpperCase();
        console.log(`\n🌳💀 ${regionLabel} ECOSYSTEM COLLAPSED (Total: ${region.ecosystemsLost})`);
        console.log(`   Extinction rate: ${region.extinctionRate.toFixed(0)}x baseline`);
        console.log(`   Habitat cover: ${region.habitatCoverPercent.toFixed(1)}% (need ${region.habitatCoverSafe}%)\n`);

        // Apply collapse effects (weighted by biodiversity importance)
        env.biodiversityIndex = Math.max(0, env.biodiversityIndex * (1.0 - region.biodiversityWeight * 0.10));
        env.resourceReserves = Math.max(0, env.resourceReserves * 0.95);
      }
    } else {
      // Recovery phase
      region.ecosystemCollapseRisk = Math.max(0, region.ecosystemCollapseRisk * 0.98);
    }
  }

  // === 2. AGGREGATE REGIONAL METRICS TO GLOBAL ===
  // Land area weights (for habitat cover averaging)
  const landAreaWeights = {
    tropical: 0.17,
    temperate: 0.10,
    grasslands: 0.20,
    borealArctic: 0.23,
  };

  // Global habitat cover (weighted by land area)
  landUse.globalHabitatCoverPercent =
    regions.tropical.habitatCoverPercent * landAreaWeights.tropical +
    regions.temperate.habitatCoverPercent * landAreaWeights.temperate +
    regions.grasslands.habitatCoverPercent * landAreaWeights.grasslands +
    regions.borealArctic.habitatCoverPercent * landAreaWeights.borealArctic;

  // Global extinction rate (weighted by biodiversity importance)
  landUse.globalExtinctionRate =
    regions.tropical.extinctionRate * regions.tropical.biodiversityWeight +
    regions.temperate.extinctionRate * regions.temperate.biodiversityWeight +
    regions.grasslands.extinctionRate * regions.grasslands.biodiversityWeight +
    regions.borealArctic.extinctionRate * regions.borealArctic.biodiversityWeight;

  // Global extinction acceleration (average)
  landUse.globalExtinctionAcceleration = (
    regions.tropical.extinctionAcceleration +
    regions.temperate.extinctionAcceleration +
    regions.grasslands.extinctionAcceleration +
    regions.borealArctic.extinctionAcceleration
  ) / 4;

  // Global ecosystem collapse metrics
  landUse.globalEcosystemsLost =
    regions.tropical.ecosystemsLost +
    regions.temperate.ecosystemsLost +
    regions.grasslands.ecosystemsLost +
    regions.borealArctic.ecosystemsLost;

  landUse.globalEcosystemCollapseRisk = Math.max(
    regions.tropical.ecosystemCollapseRisk,
    regions.temperate.ecosystemCollapseRisk,
    regions.grasslands.ecosystemCollapseRisk,
    regions.borealArctic.ecosystemCollapseRisk
  );

  // === 3. FEEDBACK LOOP: DEFORESTATION → CLIMATE ACCELERATION ===
  // Forest-heavy regions (tropical, boreal) contribute most to carbon sink loss
  const tropicalDeficit = Math.max(0, (regions.tropical.habitatCoverSafe - regions.tropical.habitatCoverPercent) / regions.tropical.habitatCoverSafe);
  const borealDeficit = Math.max(0, (regions.borealArctic.habitatCoverSafe - regions.borealArctic.habitatCoverPercent) / regions.borealArctic.habitatCoverSafe);

  // Tropical forests are 60% of carbon sink, boreal 30%, others 10%
  const weightedDeficit = tropicalDeficit * 0.60 + borealDeficit * 0.30 +
    ((regions.temperate.habitatCoverSafe - regions.temperate.habitatCoverPercent) / regions.temperate.habitatCoverSafe) * 0.10;

  // Use injected base multiplier (for parameter sweeps) × dynamic deforestation feedback
  // Base multiplier allows testing carbon sink sensitivity without recalculation overwriting it
  const baseMultiplier = assertFinite(
    state.simulationConfig?.carbonSinkMultiplier ?? 1.0,
    {
      location: 'updatePlanetaryBoundaries (land use → carbon sink)',
      valueName: 'baseMultiplier',
      month: state.currentMonth,
      additionalInfo: { configValue: state.simulationConfig?.carbonSinkMultiplier }
    }
  );

  const deforestationFeedback = Math.max(0, weightedDeficit * 2.0);
  landUse.carbonSinkLossMultiplier = baseMultiplier * (1.0 + deforestationFeedback);

  // Apply to climate boundary
  if (system.boundaries.climate_change) {
    const climateAcceleration = (landUse.carbonSinkLossMultiplier - 1.0) * 0.001;
    system.boundaries.climate_change.currentValue += climateAcceleration;
  }

  // === 4. UPDATE LAND SYSTEM CHANGE BOUNDARY ===
  // Use global habitat cover deficit
  if (system.boundaries.land_system_change) {
    // Average safe threshold weighted by land area
    const globalSafeThreshold =
      regions.tropical.habitatCoverSafe * landAreaWeights.tropical +
      regions.temperate.habitatCoverSafe * landAreaWeights.temperate +
      regions.grasslands.habitatCoverSafe * landAreaWeights.grasslands +
      regions.borealArctic.habitatCoverSafe * landAreaWeights.borealArctic;

    const boundaryValue = 1.0 + Math.max(0, (globalSafeThreshold - landUse.globalHabitatCoverPercent) / globalSafeThreshold);
    system.boundaries.land_system_change.currentValue = boundaryValue;

    // ARCH-4 Integration: Wet bulb events → land habitability loss
    // Research: Persistent wet bulb events make regions uninhabitable → de facto land-use change
    // Mechanism: Wet bulb >35°C = human survival limit, >30.5°C = labor productivity collapse
    if (state.wetBulbTemperatureSystem) {
      const eventsCount = state.wetBulbTemperatureSystem.eventsThisMonth.length;

      // Threshold: If sustained wet bulb events (>10/month for multiple months), model habitat loss
      // Note: This is cumulative - persistent events → permanent habitability loss
      if (eventsCount > 10 && state.currentMonth > 12) {
        // Small incremental loss per month with persistent events
        // 0.001 = 0.1% annual habitat loss if 10+ events/month sustained
        // Research: This models Persian Gulf, South Asia uninhabitability by 2070 (IPCC)
        const habitabilityLoss = 0.001;
        system.boundaries.land_system_change.currentValue += habitabilityLoss;

        // Log extreme wet bulb impact (first time only per year)
        if (state.currentMonth % 12 === 0) {
          console.log(`🌡️☠️ WET BULB CRISIS: ${eventsCount} extreme heat events this month → land habitability declining`);
        }
      }
    }
  }

  // === 5. LOGGING (Every 12 months) ===
  if (state.currentMonth % 12 === 0 && state.currentMonth > 0) {
    console.log(`\n🌳 LAND USE SYSTEM (Year ${Math.floor(state.currentMonth / 12)})`);
    console.log(`   Global habitat cover: ${landUse.globalHabitatCoverPercent.toFixed(1)}%`);
    console.log(`   Global extinction rate: ${landUse.globalExtinctionRate.toFixed(0)}x natural`);
    console.log(`   Carbon sink loss: ${((landUse.carbonSinkLossMultiplier - 1.0) * 100).toFixed(0)}% climate acceleration`);
    console.log(`   Global ecosystem collapse risk: ${(landUse.globalEcosystemCollapseRisk * 100).toFixed(0)}%`);

    // Regional details
    console.log(`   REGIONAL BREAKDOWN:`);
    console.log(`     Tropical: ${regions.tropical.habitatCoverPercent.toFixed(1)}% habitat, ${regions.tropical.extinctionRate.toFixed(0)}x extinction`);
    console.log(`     Temperate: ${regions.temperate.habitatCoverPercent.toFixed(1)}% habitat, ${regions.temperate.extinctionRate.toFixed(0)}x extinction`);
    console.log(`     Grasslands: ${regions.grasslands.habitatCoverPercent.toFixed(1)}% habitat, ${regions.grasslands.extinctionRate.toFixed(0)}x extinction`);
    console.log(`     Boreal/Arctic: ${regions.borealArctic.habitatCoverPercent.toFixed(1)}% habitat, ${regions.borealArctic.extinctionRate.toFixed(0)}x extinction`);

    if (landUse.globalEcosystemsLost > 0) {
      console.log(`   Critical ecosystems lost: ${landUse.globalEcosystemsLost} 💀`);
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
    console.log(`\n✅ OZONE RECOVERY (Year ${year}) - POLICY SUCCESS STORY`);
    console.log(`   Ozone level: ${ozone.stratosphericO3DobsonUnits.toFixed(1)} DU (target: 290 DU)`);
    console.log(`   Recovery progress: ${(ozone.recoveryProgress * 100).toFixed(1)}%`);
    console.log(`   Ozone hole: ${ozone.ozoneHoleSize.toFixed(1)}M km² (shrinking)`);
    console.log(`   CFC phase-out: ${ozone.cfcPhaseOutPercent.toFixed(1)}% complete ✅`);
    console.log(`   Years to full recovery: ${(2066 - year)} years`);

    if (ozone.rocketLaunchImpact > 0.05) {
      console.log(`   ⚠️ Rocket launch impact: ${(ozone.rocketLaunchImpact * 100).toFixed(2)}% (slowing recovery)`);
    }

    if (ozone.recoveryProgress > 0.90) {
      console.log(`   🎉 NEARLY FULLY RECOVERED - Montreal Protocol working!`);
    }
  }
}

/**
 * TIER 3.5: Initialize Biosphere Integrity Index (BII)
 *
 * Comprehensive species tracking with climate velocity modeling.
 *
 * Research backing:
 * - Natural History Museum PREDICTS database (2024): 54,000-58,000 species baseline
 *   (De Palma et al. 2024, https://doi.org/10.5519/k33reyb6)
 *   Database: 48,000+ sites, 4.9M observations, terrestrial ecosystems
 *   Used in CBD Global Biodiversity Framework as official BII indicator
 * - Richardson et al. (2024): Current extinction rates
 * - Yoder et al. (2024): Joshua Tree climate tracking failure
 * - U.S. National Park Service (2024): Climate velocity impacts
 *
 * Key insight: Non-migratory species CANNOT track climate velocity → extinction
 *
 * CRITICAL LIMITATIONS (documented in reviews/predicts-citation-critique_20251106.md):
 * - May overestimate intactness by 20-70% in tropical regions (Martin et al. 2019)
 * - Geographic bias: 30× more European than tropical data
 * - Space-for-time substitution assumes equilibrium (ignores extinction debt)
 * - Terrestrial only (no ocean/freshwater biodiversity)
 *
 * @see research/climate-mortality-biosphere-multiparadigm-framework_20251028.md (Section 2)
 * @see research/predicts-database-verification_20251106.md
 * @see reviews/predicts-citation-critique_20251106.md
 */
export function initializeBiosphereIntegrityIndex(): BiosphereIntegrityIndex {
  // Import BII_CONSTANTS from types
  const BII_CONSTANTS = {
    TOTAL_SPECIES_2024: 54000,
    MIGRATORY_PROPORTION: 0.15,
    NON_MIGRATORY_PROPORTION: 0.80,
    KEYSTONE_PROPORTION: 0.05,
    CURRENT_RATE_2025: 10,
    BIRD_DISPERSAL: 1000,
    TREE_DISPERSAL: 0.5,
    MAMMAL_DISPERSAL: 10,
    KEYSTONE_CASCADE: 2.5,
    AVG_CLIMATE_VELOCITY_TROPICS: 0.3,
    AVG_CLIMATE_VELOCITY_TEMPERATE: 0.8,
    AVG_CLIMATE_VELOCITY_ARCTIC: 2.0,
    // BUG FIX (Nov 15, 2025): SAFE_EXTINCTION_RATE is 10.0 E/MSY, not 1.0 (which is BACKGROUND)
    // MIGRATION (Nov 15, 2025): Use FLOORS from centralConfig - removed inline constant
    // Line 1654 now uses FLOORS.SAFE_EXTINCTION_RATE instead of BII_CONSTANTS.SAFE_EXTINCTION_RATE
    BACKGROUND_RATE: 0.1,
    FRAGMENTATION_BARRIER_MAX: 1.5,
  } as const;

  // === SPECIES GROUPS ===

  // Migratory species (birds, butterflies) - CAN track climate
  const migratorySpecies: SpeciesGroup = {
    name: 'migratory',
    count: Math.round(BII_CONSTANTS.TOTAL_SPECIES_2024 * BII_CONSTANTS.MIGRATORY_PROPORTION),
    extinctionRate: BII_CONSTANTS.CURRENT_RATE_2025 * 0.5, // Lower risk (can migrate)
    isMigratory: true,
    dispersalCapacity: BII_CONSTANTS.BIRD_DISPERSAL, // 1000 km/year
    isKeystone: false,
    keystoneMultiplier: 1.0,
    habitatFragmentation: 0.3, // Moderate fragmentation (flyways exist)
  };

  // Non-migratory species (trees, alpine, island endemics) - CANNOT track
  const nonMigratorySpecies: SpeciesGroup = {
    name: 'non-migratory',
    count: Math.round(BII_CONSTANTS.TOTAL_SPECIES_2024 * BII_CONSTANTS.NON_MIGRATORY_PROPORTION),
    extinctionRate: BII_CONSTANTS.CURRENT_RATE_2025, // Full current rate
    isMigratory: false,
    dispersalCapacity: BII_CONSTANTS.TREE_DISPERSAL, // 0.5 km/year
    isKeystone: false,
    keystoneMultiplier: 1.0,
    habitatFragmentation: 0.6, // High fragmentation (habitat loss)
  };

  // Keystone species (ecosystem engineers) - Critical cascades
  const keystoneSpecies: SpeciesGroup = {
    name: 'keystone',
    count: Math.round(BII_CONSTANTS.TOTAL_SPECIES_2024 * BII_CONSTANTS.KEYSTONE_PROPORTION),
    extinctionRate: BII_CONSTANTS.CURRENT_RATE_2025 * 1.2, // Slightly higher risk (targeted)
    isMigratory: false, // Most keystone species are not migratory
    dispersalCapacity: BII_CONSTANTS.MAMMAL_DISPERSAL, // 10 km/year
    isKeystone: true,
    keystoneMultiplier: BII_CONSTANTS.KEYSTONE_CASCADE, // 2.5× cascade effect
    habitatFragmentation: 0.7, // High fragmentation (large ranges)
  };

  // === CLIMATE VELOCITY (2025 baseline) ===
  // Weighted average across regions (tropical slower, arctic faster)
  const avgClimateVelocity =
    (BII_CONSTANTS.AVG_CLIMATE_VELOCITY_TROPICS * 0.4) +
    (BII_CONSTANTS.AVG_CLIMATE_VELOCITY_TEMPERATE * 0.4) +
    (BII_CONSTANTS.AVG_CLIMATE_VELOCITY_ARCTIC * 0.2);

  // === TRACKING FAILURE RATE ===
  // Initial calculation (will be updated dynamically)
  const trackingFailureRate = calculateTrackingFailureRate(
    nonMigratorySpecies,
    avgClimateVelocity
  );

  // === PLANETARY BOUNDARY INTEGRATION ===
  // Current rate: 10 E/MSY = 100× background
  // Boundary threshold: 10.0 E/MSY (IPBES planetary boundary)
  // Current value: 1.0 (at the boundary)
  // MIGRATION (Nov 15, 2025): Use FLOORS.SAFE_EXTINCTION_RATE from centralConfig (fixes BUG: was using wrong 1.0 value)
  const boundaryValue = BII_CONSTANTS.CURRENT_RATE_2025 / FLOORS.SAFE_EXTINCTION_RATE;

  // Tipping point risk (0-1)
  const tippingPointRisk = Math.min(1.0, boundaryValue / 10.0); // 0.0 at safe, 1.0 at 10× boundary

  return {
    totalSpeciesBaseline: BII_CONSTANTS.TOTAL_SPECIES_2024,
    currentSpeciesCount: BII_CONSTANTS.TOTAL_SPECIES_2024, // Starts at baseline

    backgroundExtinctionRate: BII_CONSTANTS.BACKGROUND_RATE,
    currentExtinctionRate: BII_CONSTANTS.CURRENT_RATE_2025,

    migratorySpecies,
    nonMigratorySpecies,
    keystoneSpecies,

    avgClimateVelocity,
    trackingFailureRate,

    boundaryValue,
    tippingPointRisk,
  };
}

/**
 * Calculate non-migratory species tracking failure rate
 *
 * Research: Yoder et al. (2024) - Joshua Tree example
 * - Climate velocity: 1.5°C/year
 * - Dispersal capacity: 0.4 m/year = 0.0004 km/year
 * - Result: CANNOT TRACK → extinction trajectory
 *
 * @param species - Non-migratory species group
 * @param climateVelocity - °C/year climate zone movement
 * @returns [0, 1] Proportion unable to track climate
 */
function calculateTrackingFailureRate(
  species: SpeciesGroup,
  climateVelocity: number
): number {
  // Convert climate velocity to km/year movement
  // Rule of thumb: 1°C warming = ~100-200 km poleward shift
  const kmPerDegree = 150; // km per °C (temperate zones)
  const climateVelocityKm = climateVelocity * kmPerDegree;

  // Calculate velocity gap
  const velocityGap = Math.max(0, climateVelocityKm - species.dispersalCapacity);

  // Tracking failure rate
  const baseFailureRate = velocityGap / climateVelocityKm;

  // Habitat fragmentation amplifies failure
  const fragmentationMultiplier = 1.0 + (species.habitatFragmentation * 1.5); // BII_CONSTANTS.FRAGMENTATION_BARRIER_MAX = 1.5

  // Total failure rate
  const failureRate = Math.min(1.0, baseFailureRate * fragmentationMultiplier);

  return failureRate;
}

/**
 * Calculate non-migratory species mortality from climate tracking failure
 *
 * Research: Yoder et al. (2024) - Joshua Tree, alpine species, island endemics
 *
 * Examples:
 * - Joshua Tree: 1.5°C/year velocity, 0.4m/year dispersal → EXTINCTION
 * - Alpine species: No "higher" elevation → TRAPPED → EXTINCTION
 * - Island endemics: No adjacent habitat → ISOLATED → EXTINCTION
 *
 * @param species - Non-migratory species group
 * @param climateVelocity - °C/year climate zone movement
 * @param habitatFragmentation - [0, 1] barrier to movement
 * @returns [0, 1] Proportion dying per year
 */
export function calculateNonMigratoryMortality(
  species: SpeciesGroup,
  climateVelocity: number,
  habitatFragmentation: number
): number {
  // Import assertion utilities
  const { assertProbability, assertFinite, assertInRange } = require('./utils/assertions');

  // Validate inputs
  const validatedVelocity = assertFinite(climateVelocity, {
    location: 'calculateNonMigratoryMortality',
    valueName: 'climateVelocity'
  });

  const validatedFragmentation = assertProbability(habitatFragmentation, {
    location: 'calculateNonMigratoryMortality',
    valueName: 'habitatFragmentation'
  });

  // Convert climate velocity to km/year
  const kmPerDegree = 150;
  const climateVelocityKm = validatedVelocity * kmPerDegree;

  // Calculate velocity gap (how far behind the species is)
  const velocityGap = Math.max(0, climateVelocityKm - species.dispersalCapacity);

  // Mortality from inability to track climate
  const trackingMortality = velocityGap / Math.max(1, climateVelocityKm);

  // Habitat fragmentation barrier (prevents even local movement)
  const fragmentationBarrier = validatedFragmentation * 1.5; // FRAGMENTATION_BARRIER_MAX

  // Keystone species cascade multiplier
  const keystoneMultiplier = species.isKeystone ? species.keystoneMultiplier : 1.0;

  // Total mortality rate (per year)
  const mortalityRate = Math.min(1.0,
    trackingMortality * (1 + fragmentationBarrier) * keystoneMultiplier
  );

  return assertProbability(mortalityRate, {
    location: 'calculateNonMigratoryMortality',
    valueName: 'mortalityRate',
    month: 0
  });
}

/**
 * Update Biosphere Integrity Index based on current climate state
 *
 * Integrates with planetary boundaries system and Bayesian mortality.
 *
 * @param state - Game state (mutated)
 * @param rng - Deterministic RNG function
 */
/**
 * Queue extinction debt with ecosystem-specific lag times
 *
 * Research:
 * - Grassland: 50-200 years (Krauss et al. 2010)
 * - Alpine: 300-400 years (Dullinger et al. 2012)
 * - Tropical: 50-400 years (Tremblay et al. 2006)
 * - Marine: 50-150 years (conservative estimate)
 */
function queueExtinctionDebt(
  state: GameState,
  speciesLost: number,
  rng: () => number
): void {
  // Initialize extinction debt if not present
  if (!state.extinctionDebt) {
    state.extinctionDebt = {
      committedExtinctions: [],
      totalDebt: 0,
    };
  }

  // Skip if no species lost
  if (speciesLost <= 0) return;

  const bii = state.biosphereIntegrityIndex;
  if (!bii) return;

  // Calculate magnitude as fraction of total species
  const magnitude = speciesLost / bii.totalSpeciesBaseline;

  // Determine ecosystem type based on climate velocity and habitat fragmentation
  // High velocity + high fragmentation = grassland (fast turnover)
  // Low velocity + high fragmentation = alpine (trapped species)
  // High velocity + low fragmentation = tropical (trees, slow-moving)
  // Marine gets its own category
  let ecosystemType: 'grassland' | 'alpine' | 'tropical' | 'marine';
  let minLagMonths: number;
  let maxLagMonths: number;

  const velocity = bii.avgClimateVelocity || 0;
  const fragmentation = bii.nonMigratorySpecies.habitatFragmentation || 0;

  // Simple heuristic based on conditions
  if (velocity > 0.05 && fragmentation > 0.5) {
    // Fast-changing, fragmented = grassland
    ecosystemType = 'grassland';
    minLagMonths = 600;  // 50 years
    maxLagMonths = 2400; // 200 years
  } else if (velocity < 0.02 && fragmentation > 0.5) {
    // Slow-changing, fragmented = alpine (trapped)
    ecosystemType = 'alpine';
    minLagMonths = 3600; // 300 years
    maxLagMonths = 4800; // 400 years
  } else if (velocity > 0.05 && fragmentation < 0.5) {
    // Fast-changing, connected = tropical
    ecosystemType = 'tropical';
    minLagMonths = 600;  // 50 years
    maxLagMonths = 4800; // 400 years
  } else {
    // Default to marine (conservative)
    ecosystemType = 'marine';
    minLagMonths = 600;  // 50 years
    maxLagMonths = 1800; // 150 years
  }

  // Sample lag time from uniform distribution within range
  const lagMonths = Math.floor(minLagMonths + rng() * (maxLagMonths - minLagMonths));

  // Add to queue
  state.extinctionDebt.committedExtinctions.push({
    ecosystemType,
    magnitude,
    committedMonth: state.currentMonth,
    realizationLagMonths: lagMonths,
  });

  // Update total debt
  state.extinctionDebt.totalDebt = state.extinctionDebt.committedExtinctions.reduce(
    (sum, ext) => sum + ext.magnitude,
    0
  );

  console.log(
    `🌍💀 EXTINCTION DEBT COMMITTED: ${ecosystemType} ecosystem will lose ` +
    `${(magnitude * 100).toFixed(2)}% biodiversity in ${Math.floor(lagMonths / 12)} years ` +
    `(${speciesLost.toFixed(0)} species)`
  );
}

export function updateBiosphereIntegrityIndex(
  state: GameState,
  rng: () => number
): void {
  if (!state.biosphereIntegrityIndex) {
    state.biosphereIntegrityIndex = initializeBiosphereIntegrityIndex();
  }

  const bii = state.biosphereIntegrityIndex;

  // === 1. UPDATE CLIMATE VELOCITY ===
  // Climate velocity increases with warming rate
  // Use getter function to decouple from internal planetary boundaries structure
  const globalTempIncrease = assertFinite(getGlobalTemperatureIncrease(state), {
    location: 'updateBiosphereIntegrityIndex:climateVelocity',
    valueName: 'globalTempIncrease',
    month: state.currentMonth
  });

  const monthsElapsed = state.currentMonth || 1;
  const warmingRate = assertFinite(globalTempIncrease / (monthsElapsed / 12), {
    location: 'updateBiosphereIntegrityIndex:climateVelocity',
    valueName: 'warmingRate',
    month: state.currentMonth,
    additionalInfo: { globalTempIncrease, monthsElapsed }
  }); // °C per year

  // Climate velocity scales with warming rate
  // Faster warming = faster zone movement = higher velocity
  const baseVelocity = 0.8; // °C/year baseline (temperate)
  const newClimateVelocity = assertFinite(baseVelocity * (1 + warmingRate * 0.5), {
    location: 'updateBiosphereIntegrityIndex:climateVelocity',
    valueName: 'avgClimateVelocity',
    month: state.currentMonth,
    additionalInfo: { baseVelocity, warmingRate }
  });

  bii.avgClimateVelocity = newClimateVelocity;

  // === 2. UPDATE TRACKING FAILURE RATE ===
  const trackingFailureRate = assertProbability(calculateTrackingFailureRate(
    bii.nonMigratorySpecies,
    bii.avgClimateVelocity
  ), {
    location: 'updateBiosphereIntegrityIndex:trackingFailure',
    valueName: 'trackingFailureRate',
    month: state.currentMonth
  });

  bii.trackingFailureRate = trackingFailureRate;

  // === 3. CALCULATE SPECIES MORTALITY ===
  // Non-migratory mortality (already validated in calculateNonMigratoryMortality)
  const nonMigratoryMortalityRate = calculateNonMigratoryMortality(
    bii.nonMigratorySpecies,
    bii.avgClimateVelocity,
    bii.nonMigratorySpecies.habitatFragmentation
  );

  // Annual extinctions (monthly rate)
  const monthlyExtinctions = assertFinite((nonMigratoryMortalityRate / 12) * bii.nonMigratorySpecies.count, {
    location: 'updateBiosphereIntegrityIndex:extinction',
    valueName: 'monthlyExtinctions',
    month: state.currentMonth,
    additionalInfo: {
      nonMigratoryMortalityRate,
      nonMigratoryCount: bii.nonMigratorySpecies.count
    }
  });

  // EXTINCTION DEBT: Queue extinctions instead of applying immediately
  // This models 50-400 year lags observed in research (Dullinger 2012, Krauss 2010, Tremblay 2006)
  queueExtinctionDebt(state, monthlyExtinctions, rng);

  // Species count is now updated by ExtinctionDebtPhase when debt is realized
  // (no immediate change to bii.currentSpeciesCount)

  // === 4. UPDATE EXTINCTION RATE (E/MSY) ===
  // Calculate current extinction rate from species loss
  const speciesLost = assertFinite(bii.totalSpeciesBaseline - bii.currentSpeciesCount, {
    location: 'updateBiosphereIntegrityIndex:extinctionRate',
    valueName: 'speciesLost',
    month: state.currentMonth,
    additionalInfo: {
      totalSpeciesBaseline: bii.totalSpeciesBaseline,
      currentSpeciesCount: bii.currentSpeciesCount
    }
  });

  const yearsElapsed = (state.currentMonth || 1) / 12;
  const extinctionsPerYear = assertFinite(speciesLost / Math.max(1, yearsElapsed), {
    location: 'updateBiosphereIntegrityIndex:extinctionRate',
    valueName: 'extinctionsPerYear',
    month: state.currentMonth,
    additionalInfo: { speciesLost, yearsElapsed }
  });

  // Convert to E/MSY (extinctions per million species-years)
  const newExtinctionRate = assertFinite((extinctionsPerYear / bii.totalSpeciesBaseline) * 1_000_000, {
    location: 'updateBiosphereIntegrityIndex:extinctionRate',
    valueName: 'currentExtinctionRate (E/MSY)',
    month: state.currentMonth,
    additionalInfo: { extinctionsPerYear, totalSpeciesBaseline: bii.totalSpeciesBaseline }
  });

  bii.currentExtinctionRate = newExtinctionRate;

  // === 5. UPDATE PLANETARY BOUNDARY ===
  // Boundary value: current rate / safe rate
  const SAFE_EXTINCTION_RATE = 1.0;
  const newBoundaryValue = assertFinite(bii.currentExtinctionRate / SAFE_EXTINCTION_RATE, {
    location: 'updateBiosphereIntegrityIndex:boundary',
    valueName: 'boundaryValue',
    month: state.currentMonth,
    additionalInfo: { currentExtinctionRate: bii.currentExtinctionRate }
  });

  const newTippingPointRisk = assertProbability(Math.min(1.0, newBoundaryValue / 10.0), {
    location: 'updateBiosphereIntegrityIndex:boundary',
    valueName: 'tippingPointRisk',
    month: state.currentMonth
  });

  bii.boundaryValue = newBoundaryValue;
  bii.tippingPointRisk = newTippingPointRisk;

  // Update planetary boundary in main system
  if (state.planetaryBoundariesSystem) {
    const boundary = state.planetaryBoundariesSystem.boundaries.biosphere_integrity;
    boundary.currentValue = bii.boundaryValue;
    boundary.tippingPointRisk = bii.tippingPointRisk;

    // Update status
    if (bii.boundaryValue >= 10.0) {
      boundary.status = 'high_risk';
    } else if (bii.boundaryValue >= 1.0) {
      boundary.status = 'beyond_boundary';
    } else {
      boundary.status = 'safe';
    }
  }

  // === 6. INTEGRATE WITH BAYESIAN MORTALITY ===
  // Species extinction causes indirect human mortality (ecosystem collapse)
  if (bii.trackingFailureRate > 0.5) {
    const { addMortalityRisk } = require('./bayesianMortality');
    const humanPop = state.humanPopulationSystem;

    if (humanPop) {
      // Ecosystem collapse mortality (conservative estimate)
      const ecosystemCollapseMortality = bii.trackingFailureRate * 0.01; // 1% mortality at 100% failure

      // Use ecosystem mortality type
      addMortalityRisk({count: humanPop.population * 1_000_000_000, type: 'human'} as any, {
        type: 'ecosystem', // MortalityRiskType: ecosystem (biodiversity collapse)
        baseRisk: ecosystemCollapseMortality,
        proximate: 'ecosystem', // ProximateCause: ecosystem (habitat loss, species loss)
        root: 'ecosystem', // RootCause: ecosystem (biodiversity degradation)
        confidence: 'MEDIUM',
        scope: 'GLOBAL',
        month: state.currentMonth || 0,
        description: `🦋 ${Math.round(bii.trackingFailureRate * 100)}% species unable to track climate (${bii.currentExtinctionRate.toFixed(1)} E/MSY)`
      });
    }
  }

  // === 7. LOGGING (Every 12 months) ===
  if (state.currentMonth && state.currentMonth % 12 === 0) {
    console.log(`\n🦋 BIOSPHERE INTEGRITY INDEX (Year ${Math.floor(state.currentMonth / 12)})`);
    console.log(`   Species surviving: ${Math.round(bii.currentSpeciesCount).toLocaleString()} / ${bii.totalSpeciesBaseline.toLocaleString()}`);
    console.log(`   Extinction rate: ${bii.currentExtinctionRate.toFixed(1)} E/MSY (${(bii.currentExtinctionRate / bii.backgroundExtinctionRate).toFixed(0)}× background)`);
    console.log(`   Climate velocity: ${bii.avgClimateVelocity.toFixed(2)}°C/year`);
    console.log(`   Tracking failure: ${(bii.trackingFailureRate * 100).toFixed(0)}% species unable to track`);
    console.log(`   Boundary value: ${bii.boundaryValue.toFixed(1)}× safe threshold`);

    if (bii.trackingFailureRate > 0.7) {
      console.log(`   🦋💀 MASS EXTINCTION EVENT: ${(bii.trackingFailureRate * 100).toFixed(0)}% species cannot track climate velocity!`);
    }
  }
}

