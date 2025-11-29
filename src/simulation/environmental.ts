/**
 * Environmental Accumulation System (Phase 2: Golden Age & Accumulation Systems)
 * 
 * Tracks environmental costs that accumulate silently from production/growth,
 * then manifest as crises when thresholds are crossed.
 * 
 * Mechanisms modeled:
 * - Resource depletion: Extraction > regeneration → reserves decline
 * - Pollution accumulation: Production → waste → contamination builds
 * - Climate degradation: Energy use + emissions → stability declines
 * - Biodiversity loss: Expansion + habitat disruption → ecosystems collapse
 * 
 * Key insight: High QoL can persist while environmental debt accumulates.
 * This creates the "Golden Age illusion" - prosperity masking future collapse.
 */

import { GameState, EnvironmentalAccumulation } from '@/types/game';
import { levyFlight, ALPHA_PRESETS } from './utils/levyDistributions';
import { updateCatastropheTracking } from './calculations';
import { RootCause } from '@/types/population';
import { assertFinite, assertProbability, assertInRange } from './utils/assertions';
import { calculateClimatePovertyWeights, calculateEcosystemWeights } from './utils/deathAttribution';
import { convertClimateSensitivityToRate } from './thresholds/tier1Config';
import { addMortalityRisk } from './bayesianMortality';
import { deterministicRandom } from '@/simulation/utils/deterministicRng';
import { FLOORS } from './config/centralConfig';
import { isHistoricalModeActive } from './utils/historicalMode';
import { debugLog } from './utils/debugFlags';

/**
 * Initialize environmental accumulation state
 *
 * Starting values represent 2025 REALISTIC baseline (research-backed):
 * - Resources: 1.7x overshoot (Global Footprint Network 2025)
 * - Pollution: 46% unhealthy air (American Lung Assoc 2025)
 * - Climate: +1.2°C warming (Copernicus 2024)
 * - Biodiversity: 50-70% loss since 1970 (IPBES 2024)
 *
 * **Stochastic Initialization (Oct 29, 2025 - FIX BUG #3):**
 * Adds variance to reflect scientific uncertainty in baseline measurements.
 * Research: IPCC AR6 climate sensitivity range ±30%, GFN overshoot ±13%, ALA air quality ±67%
 *
 * @param rng - REQUIRED deterministic RNG function (for Monte Carlo reproducibility)
 *              NEVER falls back to Math.random (breaks determinism)
 */
export function initializeEnvironmentalAccumulation(rng: () => number): EnvironmentalAccumulation {
  // CRITICAL FIX (Nov 7, 2025): Removed Math.random fallback (CRITICAL-3 regression)
  if (!rng || typeof rng !== 'function') {
    throw new Error('❌ CRITICAL: RNG function required for deterministic simulation. NEVER use Math.random.');
  }
  const random = rng;

  // BUG #3 FIX (Oct 29, 2025): Add stochastic variance to break determinism
  // Research-justified uncertainty ranges:
  // - Resource reserves: ±15% (GFN overshoot 1.5-1.9x = ±13% uncertainty)
  // - Pollution level: ±33% (ALA regional variance 20-60% = ±67% range → ±33% 1σ)
  // - Climate stability: ±7% (IPCC AR6 climate sensitivity 2.5-4.0°C = ±30% → ±7% for temperature anomaly)

  const resourceReserves = 0.65 + (random() - 0.5) * 0.20;  // 0.55-0.75 (±15%)
  const pollutionLevel = 0.30 + (random() - 0.5) * 0.20;     // 0.20-0.40 (±33%)
  const climateStability = 0.75 + (random() - 0.5) * 0.10;   // 0.70-0.80 (±7%)

  const clampedResourceReserves = Math.max(0.4, Math.min(0.85, resourceReserves));
  const clampedPollutionLevel = Math.max(0.15, Math.min(0.45, pollutionLevel));
  const clampedClimateStability = Math.max(0.65, Math.min(0.85, climateStability));

  // DEBUG (BUG #3): Log stochastic initialization at month 0
  console.log(`🔍 ENV INIT: reserves=${clampedResourceReserves.toFixed(3)}, pollution=${clampedPollutionLevel.toFixed(3)}, climate=${clampedClimateStability.toFixed(3)}`);

  return {
    resourceReserves: clampedResourceReserves,
    pollutionLevel: clampedPollutionLevel,
    climateStability: clampedClimateStability,
    biodiversityIndex: 0.35,      // Keep deterministic - biodiversity tracked via boundary system

    // Pollution Prevention Factor (Oct 27, 2025)
    // Research: Baseline 2025 = current regulations (EPA standards, EU REACH)
    // Factor 1.0 = baseline prevention, <1.0 = advanced green chemistry prevention
    // EPA: Green Chemistry Challenge eliminated 830M lbs hazardous chemicals/year
    pollutionPreventionFactor: 1.0,  // Baseline 2025 (current regulations only)

    // Geoengineering Risks (Oct 27, 2025)
    // Research: Robock et al. (2008), Tilmes et al. (2013), MacMartin et al. (2016)
    // Baseline 2025: 0 (no geoengineering deployed yet)
    // Risks accumulate if Stratospheric Aerosol Injection deployed
    monsoonDisruptionRisk: 0,    // No monsoon disruption risk without geoengineering
    ozoneDepletionRisk: 0,       // No ozone depletion risk without geoengineering

    resourceCrisisActive: false,
    pollutionCrisisActive: false,
    climateCrisisActive: false,
    ecosystemCrisisActive: false
  };
}

/**
 * Apply stochastic variance to environmental rates
 * Reflects uncertainty in climate/ecological models (IPCC uncertainty bounds, etc.)
 * 
 * P2.1: Added to prevent determinism and reflect scientific uncertainty
 * Research: IPCC AR6 reports uncertainty ranges (e.g., SSP5-8.5: 3.3-5.7°C)
 * 
 * @param baseRate - The base degradation/depletion rate
 * @param variance - Variance as fraction (0.25 = ±25%, range 75%-125% of base)
 * @returns Modified rate with stochastic variation
 */
function applyStochasticVariance(baseRate: number, variance: number = 0.25): number {
  const multiplier = (1 - variance) + deterministicRandom() * (2 * variance);
  return baseRate * multiplier;
}

/**
 * Get protected area coverage (% of land) for historical mode
 *
 * HIGH-8 FIX (Nov 27, 2025): Historical biodiversity calibration
 * Research: UNEP-WCMC World Database on Protected Areas (WDPA)
 *
 * @param year - Current simulation year
 * @returns Protected area coverage as fraction (0-1)
 */
function getProtectedAreaCoverage(year: number): number {
  // Protected area expansion 1990-2024
  // Source: WDPA, Convention on Biological Diversity Aichi Target 11
  const PROTECTED_AREA_DATA: Record<number, number> = {
    1990: 0.089, // 8.9% of land
    2000: 0.105, // 10.5%
    2010: 0.127, // 12.7% (Aichi Target 11: 10% by 2010 - achieved)
    2020: 0.166, // 16.6% (approaching 17% target)
    2024: 0.175, // ~17.5% (on track for 30×30 goal)
  };

  // Linear interpolation between data points
  const years = Object.keys(PROTECTED_AREA_DATA).map(Number).sort((a, b) => a - b);

  if (year <= years[0]) return PROTECTED_AREA_DATA[years[0]];
  if (year >= years[years.length - 1]) return PROTECTED_AREA_DATA[years[years.length - 1]];

  // Find surrounding years
  for (let i = 0; i < years.length - 1; i++) {
    const y1 = years[i];
    const y2 = years[i + 1];
    if (year >= y1 && year <= y2) {
      const fraction = (year - y1) / (y2 - y1);
      return PROTECTED_AREA_DATA[y1] + fraction * (PROTECTED_AREA_DATA[y2] - PROTECTED_AREA_DATA[y1]);
    }
  }

  return PROTECTED_AREA_DATA[2024]; // Fallback
}

/**
 * Update environmental accumulation based on economic activity
 *
 * Called each month to track accumulation rates.
 * Rate-based: high production = faster accumulation (unless mitigated)
 */
export function updateEnvironmentalAccumulation(
  state: GameState,
  rng: () => number
): void {
  const env = state.environmentalAccumulation;
  const economicStage = state.globalMetrics.economicTransitionStage;
  const manufacturingCap = state.globalMetrics.manufacturingCapability;
  
  // Check if we have technologies that mitigate environmental impact
  const hasFusion = state.technologyTree.some(t => t.id === 'fusion_energy' && t.completed);
  const hasAdvancedMaterials = state.technologyTree.some(t => t.id === 'advanced_materials' && t.completed);
  const hasNanotech = state.technologyTree.some(t => t.id === 'molecular_manufacturing' && t.completed);
  const hasCleanEnergy = state.technologyTree.some(t => t.id === 'clean_energy' && t.completed);
  const hasRecycling = state.technologyTree.some(t => t.id === 'advanced_recycling' && t.completed);
  const hasEcosystemManagement = state.technologyTree.some(t => t.id === 'ecosystem_management_ai' && t.completed);
  
  // === RESOURCE DEPLETION ===
  // P2.1: Global Footprint Network (2024) - 1.7x overshoot, worsening 0.5%/year
  // Earth Overshoot Day: August 1 (2024) - using resources 1.7x faster than regeneration
  // Target trajectory: (1/1.7) → (1/2.0) over 75 years = ~1.7%/year absolute decline
  // Calibration: 0.00015 base rate achieves GFN overshoot worsening trajectory
  let resourceDepletionRate = economicStage * 0.00015; // Was 0.008 (reduced 53x)

  // High production accelerates depletion
  // P2.1: Reduced to match empirical resource extraction acceleration
  resourceDepletionRate += manufacturingCap * 0.0001; // Was 0.004 (reduced 40x)

  // Rapid growth (stage transitions) spike depletion
  // P2.1: Growth surges temporarily increase extraction (industrial buildout)
  const stageGrowthRate = Math.max(0, economicStage - (economicStage - 0.1)); // Approximate growth
  resourceDepletionRate += stageGrowthRate * 0.0006; // Was 0.03 (reduced 50x)
  
  // P2.1: Apply stochastic variance (±25% = economic/extraction variability)
  resourceDepletionRate = applyStochasticVariance(resourceDepletionRate, 0.25);
  
  // Mitigation from technologies (old tech tree - may be deprecated)
  if (hasAdvancedMaterials) resourceDepletionRate *= 0.5; // 50% reduction (material efficiency)
  if (hasNanotech) resourceDepletionRate *= 0.25; // Additional 75% reduction (molecular manufacturing)
  
  // Mitigation from breakthrough technologies (Phase 2A)
  // NOTE: Resource efficiency now handled by TechTreePhase regional effects
  // No additional multiplier needed here

  // Apply depletion (with FLOORS.GEOMETRIC_MEAN_FLOOR to prevent exactly 0, which breaks geometric means)
  // FIXED: Use assertFinite to catch NaN/Infinity in calculation itself
  env.resourceReserves = assertFinite(
    Math.max(FLOORS.GEOMETRIC_MEAN_FLOOR, env.resourceReserves - resourceDepletionRate),
    {
      location: 'updateResourceReserves',
      valueName: 'resourceReserves',
      month: state.currentMonth,
    }
  );
  
  // === RESOURCE REGENERATION (Phase 2.8) ===
  // Tech-enabled recovery: Circular economy, sustainable agriculture, clean energy
  // Research basis: Ellen MacArthur Foundation (2015), Tilton (2003)
  // NOTE: Now handled by TechTreePhase regional effects
  let resourceRegeneration = 0;
  
  // NOTE: Tech-based regeneration now calculated by TechTreePhase
  // Old breakthrough tech system removed - tech tree handles all resource effects
  
  // Apply regeneration (can recover from 0%!)
  env.resourceReserves = Math.min(1.0, env.resourceReserves + resourceRegeneration);
  
  // Log significant regeneration
  if (resourceRegeneration > 0.02 && state.currentMonth % 12 === 0) {
    console.log(`🌱 RESOURCE REGENERATION: ${(resourceRegeneration * 100).toFixed(1)}%/month (reserves: ${(env.resourceReserves * 100).toFixed(0)}%)`);
  }
  
  // === POLLUTION ACCUMULATION ===
  // Base pollution from production
  let pollutionRate = economicStage * 0.006; // 0.6% per month at Stage 1

  // Manufacturing capability increases pollution
  pollutionRate += manufacturingCap * 0.005;

  // Rapid industrial growth spikes pollution
  if (economicStage > 2.0 && economicStage < 3.5) {
    pollutionRate += 0.01; // Industrial transition period
  }

  // Mitigation from clean technologies
  if (hasCleanEnergy) pollutionRate *= 0.4; // 60% reduction
  if (hasRecycling) pollutionRate *= 0.6; // Additional 40% reduction
  if (hasNanotech) pollutionRate *= 0.5; // Molecular precision reduces waste

  // Green Chemistry prevention (Oct 27, 2025)
  // Research: EPA Green Chemistry Challenge - 830M lbs hazardous chemicals eliminated/year
  // Prevents NEW pollution from entering system via benign-by-design chemicals
  // Factor 1.0 = baseline (current regulations), <1.0 = advanced prevention
  pollutionRate *= env.pollutionPreventionFactor;
  
  // Natural degradation (Earth can process some pollution)
  const naturalDegradation = 0.003; // 0.3% per month natural cleanup

  // FIXED: Use assertFinite to catch NaN/Infinity in calculation itself
  env.pollutionLevel = assertFinite(
    Math.max(0, Math.min(1, env.pollutionLevel + pollutionRate - naturalDegradation)),
    {
      location: 'updatePollutionLevel',
      valueName: 'pollutionLevel',
      month: state.currentMonth,
    }
  );
  
  // === CLIMATE DEGRADATION ===
  // Energy usage drives climate impact
  // Proxy: compute infrastructure + manufacturing + economic stage
  const totalCompute = state.computeInfrastructure.dataCenters
    .filter(dc => dc.operational)
    .reduce((sum, dc) => sum + dc.capacity * dc.efficiency, 0);

  const energyUsage = (totalCompute / 10000) + manufacturingCap + (economicStage * 0.3);

  // Phase 1B: Use sampled climate sensitivity (IPCC AR6 - ECS distribution)
  // Convert ECS (°C) to simulation degradation rate
  // Base rate calibrated to IPCC SSP5-8.5 trajectory, scaled by sampled ECS
  const baseClimateRate = convertClimateSensitivityToRate(state.thresholds.climateSensitivity);
  let climateDegradationRate = energyUsage * baseClimateRate;

  // Stage 3-4 transition: Accelerating emissions from rapid industrialization
  // Positive feedbacks (permafrost, ice-albedo) emerge after critical thresholds
  // P2.1: Reduced from 0.0016 to achieve ~700-900 month collapse timeline
  if (economicStage > 3.0) {
    climateDegradationRate += 0.0003; // Was 0.0016 (reduced 5.3x)
  }
  
  // P2.1: Apply stochastic variance (±20% = IPCC uncertainty bounds)
  climateDegradationRate = applyStochasticVariance(climateDegradationRate, 0.20);
  
  // Mitigation from clean energy
  if (hasFusion) climateDegradationRate *= 0.2; // 80% reduction (fusion is near-zero carbon)
  if (hasCleanEnergy) climateDegradationRate *= 0.5; // 50% reduction
  
  // Natural stabilization (very slow)
  const naturalStabilization = 0.001; // 0.1% per month

  // Detect NaN before calculation - fail loudly
  // Apply climate degradation (with FLOORS.GEOMETRIC_MEAN_FLOOR to prevent exactly 0, which breaks geometric means)
  // FIXED: Use assertFinite to catch NaN/Infinity in calculation itself
  env.climateStability = assertFinite(
    Math.max(FLOORS.GEOMETRIC_MEAN_FLOOR, Math.min(1, env.climateStability - climateDegradationRate + naturalStabilization)),
    {
      location: 'updateClimateStability',
      valueName: 'climateStability',
      month: state.currentMonth,
    }
  );
  
  // === BIODIVERSITY LOSS ===
  // HIGH-8 FIX (Nov 27, 2025): Add historical mode for hindcast calibration
  // Historical mode (1990-2024): Use WWF LPI empirical decline rates
  // Projection mode (2025+): Use mechanistic crisis model

  let biodiversityLossRate: number;
  let naturalRecovery: number;

  if (isHistoricalModeActive(state)) {
    // === HISTORICAL MODE (1990-2024): WWF LPI Empirical Rates ===
    // Research: WWF Living Planet Index 2024
    // - 1970: 1.00 (baseline)
    // - 1990: 0.75 (-25% from 1970)
    // - 2024: 0.49 (-51% from 1970)
    // - Decline: -34.7% from 1990 to 2024 (34 years)
    // - Annual rate: ~1.24%/year
    // - Monthly rate: 0.103%/month (1.24% / 12)

    // DEBUG (HIGH-8): Log biodiversity decline every year
    if (state.currentMonth % 12 === 0) {
      debugLog('PLANETARY', () => `🔍 HIGH-8 DEBUG: Historical mode (year=${state.currentYear}, biodiv=${(env.biodiversityIndex * 100).toFixed(2)}%)`);
    }

    // WWF LPI empirical decline rate (ALREADY includes conservation effects)
    // Calculation: 0.75 (1990) → 0.49 (2024) over 34 years
    // Geometric decline: (0.49/0.75)^(1/408) = 0.998978 → r = 0.001022/month
    // HIGH-11 FIX (Nov 28, 2025): Changed from LINEAR to GEOMETRIC decline
    // Research: WWF Living Planet Index uses geometric mean methodology (chain-indexing)
    // LPI calculates population change ratios and compounds them geometrically, not arithmetically
    const HISTORICAL_DECLINE_RATE = 0.001022; // 0.1022%/month (1.236%/year)

    // Use empirical rate directly (no modifiers - observed rate is net of all effects)
    biodiversityLossRate = HISTORICAL_DECLINE_RATE;

    // Natural recovery is ZERO during baseline (empirical rate is net)
    naturalRecovery = 0;

    // Apply GEOMETRIC decline (percentage of current value, not absolute subtraction)
    // This matches WWF LPI methodology and produces 0.49 at month 408 (within 0.2% of target)
    env.biodiversityIndex = assertFinite(
      Math.max(0, Math.min(1, env.biodiversityIndex * (1 - biodiversityLossRate) + naturalRecovery)),
      {
        location: 'updateBiodiversityIndex (historicalMode)',
        valueName: 'biodiversityIndex',
        month: state.currentMonth,
      }
    );
  } else {
    // === PROJECTION MODE (2025+): Mechanistic Crisis Model ===
    // Habitat disruption from expansion
    // P2.1: IPBES 2019 Global Assessment - 1.5%/year decline = 0.125%/month target
    // Target: 10-20% decline by Month 300 (25 years), not 99% by Month 60
    // Multi-factor model: Base rate + compounding effects from all environmental stressors
    biodiversityLossRate = economicStage * 0.00006; // Was 0.0004 (reduced 6.7x)

    // Manufacturing and resource extraction destroy habitats
    // P2.1: Reduced compounding factors to achieve IPBES timescale
    biodiversityLossRate += manufacturingCap * 0.00004; // Was 0.0003 (reduced 7.5x)
    biodiversityLossRate += (1 - env.resourceReserves) * 0.0001; // Was 0.0008 (reduced 8x)

    // Pollution and climate degrade ecosystems
    // P2.1: Critic identified compounding effects needed 6-8x reduction
    biodiversityLossRate += env.pollutionLevel * 0.00005; // Was 0.0004 (reduced 8x)
    biodiversityLossRate += (1 - env.climateStability) * 0.00008; // Was 0.0006 (reduced 7.5x)

    // P2.1: Apply stochastic variance (±30% = higher ecological uncertainty)
    biodiversityLossRate = applyStochasticVariance(biodiversityLossRate, 0.30);

    // Mitigation from ecosystem management
    if (hasEcosystemManagement) {
      biodiversityLossRate *= 0.3; // 70% reduction (AI manages ecosystems)
    }

    // Natural recovery (very slow without active management)
    naturalRecovery = hasEcosystemManagement ? 0.005 : 0.001;

    // FIXED: Use assertFinite to catch NaN/Infinity in calculation itself
    env.biodiversityIndex = assertFinite(
      Math.max(0, Math.min(1, env.biodiversityIndex - biodiversityLossRate + naturalRecovery)),
      {
        location: 'updateBiodiversityIndex',
        valueName: 'biodiversityIndex',
        month: state.currentMonth,
      }
    );
  }

  // === P1.5: ECOSYSTEM REGENERATION FROM POPULATION DECLINE ===
  // Historical evidence: Nature rebounds when human pressure reduces
  // - Chernobyl Exclusion Zone: Wildlife thrives with humans gone (1986-present)
  // - COVID-19 lockdowns: Air quality improved 30-60% in 2 months (2020)
  // - Post-Black Death: Forest regrowth in Europe (1350-1400)
  // - Mayan collapse: Jungle reclaimed cities in decades (800-900 CE)
  // Research: Ecological succession takes 20-50 years, but initial recovery is fast
  //
  // HIGH-8 FIX (Nov 27, 2025): Disable during historical mode (1990-2024)
  // WWF LPI empirical rate ALREADY includes any natural recovery that occurred
  const currentPressure = state.humanPopulationSystem.population / state.humanPopulationSystem.carryingCapacity;

  if (!isHistoricalModeActive(state) && currentPressure < 0.5) { // Population below half of carrying capacity
    // Regeneration rate scales with reduced pressure: 0-1% monthly
    // At 50% pressure: 0%/month (no bonus)
    // At 25% pressure: 0.5%/month
    // At 0% pressure: 1%/month (maximum recovery)
    const pressureReduction = 0.5 - currentPressure; // 0 to 0.5
    const regenerationRate = pressureReduction * 0.02; // Up to 1% monthly

    // Nature recovers when humans aren't actively destroying it
    env.biodiversityIndex = Math.min(1.0, env.biodiversityIndex + regenerationRate);
    env.resourceReserves = Math.min(1.0, env.resourceReserves + regenerationRate * 0.5); // 50% as fast
    env.climateStability = Math.min(1.0, env.climateStability + regenerationRate * 0.3); // 30% as fast (carbon sinks recovering)

    if (state.currentMonth % 24 === 0 && regenerationRate > 0.003) { // Log every 2 years if significant
      console.log(`🌱 NATURAL REGENERATION: Low human pressure (${(currentPressure * 100).toFixed(0)}%), ecosystems recovering at +${(regenerationRate * 100).toFixed(2)}%/month`);
      console.log(`   Biodiversity: ${(env.biodiversityIndex * 100).toFixed(1)}%, Resources: ${(env.resourceReserves * 100).toFixed(1)}%, Climate: ${(env.climateStability * 100).toFixed(1)}%`);
    }
  }

  // === PHASE 1: LÉVY FLIGHT CASCADE CHECKS (Self-Organized Criticality) ===
  // Research: Bak et al. (1987) - systems organize to critical states
  // When environmental debt is high, minor events can trigger avalanches
  // Most of the time: linear accumulation. Rarely: mega-cascade (power-law tails)

  const criticalThreshold = 0.6; // System at edge of chaos

  // Resource cascade (alpha=1.8 - fatter tails for financial-like shocks)
  if (env.resourceReserves < criticalThreshold) {
    const cascadeMagnitude = levyFlight(ALPHA_PRESETS.ENVIRONMENT, rng);

    if (cascadeMagnitude > 10.0) {
      // Mega-cascade (rare but devastating - supply chain collapse, hoarding)
      const cascadeSize = Math.min(cascadeMagnitude / 100, 0.3); // Max 30% drop
      env.resourceReserves = Math.max(0, env.resourceReserves - cascadeSize);

      console.warn(`\n  ⚠️ RESOURCE MEGA-CASCADE: Lévy flight triggered`);
      console.log(`     Magnitude: ${cascadeMagnitude.toFixed(2)} → -${(cascadeSize * 100).toFixed(1)}% reserves`);
      console.log(`     Triggered at ${(env.resourceReserves * 100).toFixed(1)}% (critical threshold)`);
    }
  }

  // Climate cascade (positive feedbacks - methane release, ice-albedo)
  if (env.climateStability < criticalThreshold) {
    const cascadeMagnitude = levyFlight(ALPHA_PRESETS.ENVIRONMENT, rng);

    if (cascadeMagnitude > 10.0) {
      // Mega-cascade (tipping point triggers positive feedbacks)
      const cascadeSize = Math.min(cascadeMagnitude / 150, 0.25); // Max 25% drop
      env.climateStability = Math.max(0, env.climateStability - cascadeSize);

      console.warn(`\n  ⚠️ CLIMATE MEGA-CASCADE: Tipping point cascade`);
      console.log(`     Magnitude: ${cascadeMagnitude.toFixed(2)} → -${(cascadeSize * 100).toFixed(1)}% stability`);
      console.log(`     Feedback loop: permafrost methane / ice-albedo effect activated`);
    }
  }

  // Biodiversity cascade (ecosystem collapse cascades)
  // HIGH-8 FIX (Nov 27, 2025): Disable cascade during historical mode (1990-2024)
  // Historical period did NOT experience catastrophic biodiversity tipping points
  // Cascades are crisis-specific mechanisms (reserved for projection mode)

  if (!isHistoricalModeActive(state) && env.biodiversityIndex < criticalThreshold) {
    const cascadeMagnitude = levyFlight(ALPHA_PRESETS.ENVIRONMENT, rng);

    if (cascadeMagnitude > 10.0) {
      // Mega-cascade (keystone species loss triggers avalanche)
      const cascadeSize = Math.min(cascadeMagnitude / 100, 0.35); // Max 35% drop
      env.biodiversityIndex = Math.max(0, env.biodiversityIndex - cascadeSize);

      console.warn(`\n  ⚠️ BIODIVERSITY MEGA-CASCADE: Keystone species collapse`);
      console.log(`     Magnitude: ${cascadeMagnitude.toFixed(2)} → -${(cascadeSize * 100).toFixed(1)}% biodiversity`);
      console.log(`     Trophic cascade: keystone predator/pollinator loss → ecosystem avalanche`);
    }
  }

  // === CRISIS TRIGGERS ===
  checkEnvironmentalCrises(state);
}

/**
 * Check if environmental accumulation has crossed crisis thresholds
 * 
 * Crises trigger QoL impacts and potentially extinction scenarios.
 */
function checkEnvironmentalCrises(state: GameState): void {
  const env = state.environmentalAccumulation;
  const qol = state.qualityOfLifeSystems;
  
  // RESOURCE CRISIS: Reserves depleted below 30%
  if (env.resourceReserves < 0.3 && !env.resourceCrisisActive) {
    env.resourceCrisisActive = true;
    updateCatastropheTracking(state, 'resource_crisis', 1.0 - env.resourceReserves);
    try {
      console.warn(`\n⚠️  RESOURCE CRISIS TRIGGERED (Month ${state.currentMonth})`);
      console.log(`   Resource Reserves: ${(env.resourceReserves * 100).toFixed(1)}%`);
      console.log(`   Impact: Manufacturing disrupted, QoL declining\n`);
    } catch (e) { /* Ignore EPIPE */ }

    // Log event
    state.eventLog.push({
      id: `resource-crisis-${state.currentMonth}`,
      type: 'crisis',
      title: 'Resource Crisis',
      timestamp: state.currentMonth,
      severity: 'critical',
      agent: 'environmental',
      description: `Resource Crisis: Reserves depleted to ${(env.resourceReserves * 100).toFixed(1)}%`,
      effects: {
        materialAbundance: -0.3,
        energyAvailability: -0.2,
        socialStability: -0.3
      }
    });

    // Immediate QoL impacts
    qol.materialAbundance = assertInRange(qol.materialAbundance * 0.7, 0, 3,
      {
      location: 'resourceCrisis_materialAbundance',
      valueName: 'materialAbundance',
      month: state.currentMonth,
    }); // 30% drop in material goods
    qol.energyAvailability = assertInRange(qol.energyAvailability * 0.8, 0, 2,
      {
      location: 'resourceCrisis_energyAvailability',
      valueName: 'energyAvailability',
      month: state.currentMonth,
    }); // 20% drop in energy
    state.globalMetrics.socialStability = assertProbability(Math.max(0, Math.min(1, state.globalMetrics.socialStability - 0.3)),
      {
      location: 'resourceCrisis_socialStability',
      valueName: 'socialStability',
      month: state.currentMonth,
    });

    // Population impact: Initial famine/scarcity deaths (0.5-1% casualties)
    // SEMI-GLOBAL: Affects food/water insecure regions (~25% of world)
    // 0.8% mortality rate in exposed regions
    const pop = state.humanPopulationSystem as any;

    // Resource component: 50%
    addMortalityRisk(pop,
      {
      type: 'famine',
      baseRisk: 0.008 * 0.50,
      proximate: 'famine',
      root: 'resource',
      confidence: 'MEDIUM',
      description: 'Resource crisis - famine/scarcity (resource component)',
      month: state.currentMonth,
      exposedFraction: 0.25
    });

    // Inequality component: 35%
    addMortalityRisk(pop,
      {
      type: 'famine',
      baseRisk: 0.008 * 0.35,
      proximate: 'famine',
      root: 'inequality',
      confidence: 'MEDIUM',
      description: 'Resource crisis - famine/scarcity (inequality component)',
      month: state.currentMonth,
      exposedFraction: 0.25
    });

    // Demographic component: 15%
    addMortalityRisk(pop,
      {
      type: 'famine',
      baseRisk: 0.008 * 0.15,
      proximate: 'famine',
      root: 'demographic',
      confidence: 'MEDIUM',
      description: 'Resource crisis - famine/scarcity (demographic component)',
      month: state.currentMonth,
      exposedFraction: 0.25
    });
  }
  
  // POLLUTION CRISIS: Pollution exceeds 70%
  if (env.pollutionLevel > 0.7 && !env.pollutionCrisisActive) {
    env.pollutionCrisisActive = true;
    updateCatastropheTracking(state, 'pollution_crisis', env.pollutionLevel);
    try {
      console.warn(`\n⚠️  POLLUTION CRISIS TRIGGERED (Month ${state.currentMonth})`);
      console.log(`   Pollution Level: ${(env.pollutionLevel * 100).toFixed(1)}%`);
      console.log(`   Impact: Health crisis, ecosystem contamination\n`);
    } catch (e) { /* Ignore EPIPE */ }

    state.eventLog.push({
      id: `pollution-crisis-${state.currentMonth}`,
      type: 'crisis',
      title: 'Pollution Crisis',
      timestamp: state.currentMonth,
      severity: 'critical',
      agent: 'environmental',
      description: `Pollution Crisis: Pollution level ${(env.pollutionLevel * 100).toFixed(1)}%`,
      effects: {
        healthcareQuality: -0.25,
        diseasesBurden: 0.3,
        ecosystemHealth: -0.4,
        qualityOfLife: -0.25
      }
    });

    // Immediate QoL impacts
    qol.healthcareQuality = assertProbability(qol.healthcareQuality * 0.75,
      {
      location: 'pollutionCrisis_healthcareQuality',
      valueName: 'healthcareQuality',
      month: state.currentMonth,
    }); // 25% drop (pollution-related diseases)
    qol.diseasesBurden = assertProbability(Math.min(1, qol.diseasesBurden + 0.3),
      {
      location: 'pollutionCrisis_diseasesBurden',
      valueName: 'diseasesBurden',
      month: state.currentMonth,
    }); // Disease burden increases
    qol.ecosystemHealth = assertProbability(qol.ecosystemHealth * 0.6,
      {
      location: 'pollutionCrisis_ecosystemHealth',
      valueName: 'ecosystemHealth',
      month: state.currentMonth,
    }); // 40% drop in ecosystem health
    state.globalMetrics.qualityOfLife = assertProbability(Math.max(0, Math.min(1, state.globalMetrics.qualityOfLife - 0.25)),
      {
      location: 'pollutionCrisis_qualityOfLife',
      valueName: 'qualityOfLife',
      month: state.currentMonth,
    });

    // Population impact: Pollution-related disease deaths (0.3-0.5% casualties)
    // SEMI-GLOBAL: Industrial nations + downwind regions (~60% of world)
    // 0.4% mortality rate from acute contamination/disease
    const pop = state.humanPopulationSystem as any;
    addMortalityRisk(pop,
      {
      type: 'pollution',
      baseRisk: 0.004,
      proximate: 'pollution',
      root: 'pollution',
      confidence: 'HIGH',
      description: 'Pollution crisis - toxic contamination (industrial regions)',
      month: state.currentMonth,
      exposedFraction: 0.60
    });
  }
  
  // ============================================================================
  // INSTANT CLIMATE CATASTROPHE REMOVED (Oct 26, 2025)
  // ============================================================================
  //
  // Replaced with Multi-Timescale Climate Tipping Points System
  // (TippingPointPhase, order 21.6)
  //
  // OLD BEHAVIOR (unrealistic):
  // - Instant catastrophe when climateStability < 0.4
  // - Immediate 40-60% QoL drops
  // - No gradual transition, no recovery possible
  //
  // NEW BEHAVIOR (research-backed):
  // - 6 tipping elements with realistic timescales (10-15,000 years)
  // - Temperature threshold detection (1.5-2.3°C above pre-industrial)
  // - Sigmoid transition curves for smooth progression
  // - Cascade amplification when multiple elements active
  // - Regional variation in impacts
  //
  // Research: Armstrong McKay et al. (2022) Science, Lenton et al. (2023), IPCC AR6
  // See: /src/simulation/engine/phases/TippingPointPhase.ts
  // ============================================================================
  
  // ECOSYSTEM TIPPING POINT: Biodiversity below 20%
  // REALISTIC TIMELINE: Threshold triggers collapse PROCESS, not instant apocalypse
  // Research: Collapse takes 20-40 years after tipping point (2040-2070)
  if (env.biodiversityIndex < 0.2 && !env.ecosystemCrisisActive) {
    env.ecosystemCrisisActive = true;
    updateCatastropheTracking(state, 'ecosystem_collapse', 1.0 - env.biodiversityIndex);
    // Initialize collapse tracking
    if (!state.ecosystemCollapse) {
      state.ecosystemCollapse = {
        triggered: true,
        triggeredAt: state.currentMonth,
        monthsSinceTrigger: 0,
        phase: 'declining' as const,
      };
    }
    
    try {
      console.log(`\n🦋 ECOSYSTEM TIPPING POINT CROSSED (Month ${state.currentMonth})`);
      console.log(`   Biodiversity Index: ${(env.biodiversityIndex * 100).toFixed(1)}%`);
      console.log(`   Impact: Entering collapse process (20-40 year timeline)`);
      console.log(`   Phase 1: DECLINING (0-2 years) - initial stress, low mortality`);
      console.log(`   Phase 2: CRISIS (2-5 years) - accelerating failures, moderate mortality`);
      console.log(`   Phase 3: COLLAPSE (5+ years) - severe failures, high mortality\n`);
    } catch (e) { /* Ignore EPIPE */ }

    state.eventLog.push({
      id: `ecosystem-collapse-${state.currentMonth}`,
      type: 'crisis',
      title: 'Ecosystem Tipping Point',
      timestamp: state.currentMonth,
      severity: 'existential',
      agent: 'environmental',
      description: `Ecosystem Tipping Point: Biodiversity ${(env.biodiversityIndex * 100).toFixed(1)}%`,
      effects: {
        biodiversityIndex: env.biodiversityIndex,
        collapsePhase: 'declining'
      }
    });

    // Initial QoL impacts (minor at first)
    qol.materialAbundance = assertInRange(qol.materialAbundance * 0.95, 0, 3,
      {
      location: 'ecosystemTipping_materialAbundance',
      valueName: 'materialAbundance',
      month: state.currentMonth,
    }); // 5% initial drop
    qol.healthcareQuality = assertProbability(qol.healthcareQuality * 0.97,
      {
      location: 'ecosystemTipping_healthcareQuality',
      valueName: 'healthcareQuality',
      month: state.currentMonth,
    }); // 3% initial drop
    qol.ecosystemHealth = assertProbability(qol.ecosystemHealth * 0.90,
      {
      location: 'ecosystemTipping_ecosystemHealth',
      valueName: 'ecosystemHealth',
      month: state.currentMonth,
    }); // 10% initial drop
    state.globalMetrics.qualityOfLife = assertProbability(Math.max(0, Math.min(1, state.globalMetrics.qualityOfLife - 0.05)),
      {
      location: 'ecosystemTipping_qualityOfLife',
      valueName: 'qualityOfLife',
      month: state.currentMonth,
    });

    // NO immediate deaths - that comes gradually over years
  }
  
  // ONGOING ECOSYSTEM COLLAPSE: Escalating impacts over time
  if (env.ecosystemCrisisActive && state.ecosystemCollapse) {
    state.ecosystemCollapse.monthsSinceTrigger = state.currentMonth - state.ecosystemCollapse.triggeredAt;
    const monthsSince = state.ecosystemCollapse.monthsSinceTrigger;
    
    // Phase transitions (realistic timeline)
    if (monthsSince < 24) {
      // Phase 1: DECLINING (0-2 years) - Initial stress
      state.ecosystemCollapse.phase = 'declining';
      
      // Very low mortality: 0.01% per month (vulnerable regions first)
      // Affects tropical regions, small island states (~5% of world)
      const pop = state.humanPopulationSystem as any;
      const ecosystemWeights1 = calculateEcosystemWeights(1);

      // Ecosystem component
      addMortalityRisk(pop,
      {
        type: 'ecosystem',
        baseRisk: 0.0001 * ecosystemWeights1.ecosystem,
        proximate: 'ecosystem',
        root: 'ecosystem',
        confidence: 'MEDIUM',
        description: 'Ecosystem decline - regional food stress (ecosystem component)',
        month: state.currentMonth,
        exposedFraction: 0.05
      });

      // Climate component
      addMortalityRisk(pop,
      {
        type: 'ecosystem',
        baseRisk: 0.0001 * ecosystemWeights1.climate,
        proximate: 'ecosystem',
        root: 'climate',
        confidence: 'MEDIUM',
        description: 'Ecosystem decline - regional food stress (climate component)',
        month: state.currentMonth,
        exposedFraction: 0.05
      });

      // Pollution component
      addMortalityRisk(pop,
      {
        type: 'ecosystem',
        baseRisk: 0.0001 * ecosystemWeights1.pollution,
        proximate: 'ecosystem',
        root: 'pollution',
        confidence: 'MEDIUM',
        description: 'Ecosystem decline - regional food stress (pollution component)',
        month: state.currentMonth,
        exposedFraction: 0.05
      });
      
      // Gradual QoL degradation
      qol.materialAbundance = assertInRange(Math.max(0.3, qol.materialAbundance - 0.002), 0, 3,
      {
        location: 'ecosystemDeclining_materialAbundance',
        valueName: 'materialAbundance',
        month: state.currentMonth,
      }); // -0.2%/month
      qol.ecosystemHealth = assertInRange(Math.max(0.2, qol.ecosystemHealth - 0.003), 0, 1,
      {
        location: 'ecosystemDeclining_ecosystemHealth',
        valueName: 'ecosystemHealth',
        month: state.currentMonth,
      }); // -0.3%/month
      
    } else if (monthsSince < 60) {
      // Phase 2: CRISIS (2-5 years) - Accelerating failures
      state.ecosystemCollapse.phase = 'crisis';
      
      // Moderate mortality: 0.1% per month
      // Spreads to agricultural regions globally (~40% of world)
      const pop = state.humanPopulationSystem as any;
      const ecosystemWeights2 = calculateEcosystemWeights(2);

      // Ecosystem component
      addMortalityRisk(pop,
      {
        type: 'ecosystem',
        baseRisk: 0.001 * ecosystemWeights2.ecosystem,
        proximate: 'ecosystem',
        root: 'ecosystem',
        confidence: 'MEDIUM',
        description: 'Ecosystem crisis - agricultural disruption (ecosystem component)',
        month: state.currentMonth,
        exposedFraction: 0.40
      });

      // Climate component
      addMortalityRisk(pop,
      {
        type: 'ecosystem',
        baseRisk: 0.001 * ecosystemWeights2.climate,
        proximate: 'ecosystem',
        root: 'climate',
        confidence: 'MEDIUM',
        description: 'Ecosystem crisis - agricultural disruption (climate component)',
        month: state.currentMonth,
        exposedFraction: 0.40
      });

      // Pollution component
      addMortalityRisk(pop,
      {
        type: 'ecosystem',
        baseRisk: 0.001 * ecosystemWeights2.pollution,
        proximate: 'ecosystem',
        root: 'pollution',
        confidence: 'MEDIUM',
        description: 'Ecosystem crisis - agricultural disruption (pollution component)',
        month: state.currentMonth,
        exposedFraction: 0.40
      });
      
      // Accelerating QoL degradation
      qol.materialAbundance = assertInRange(Math.max(0.2, qol.materialAbundance - 0.005), 0, 3,
      {
        location: 'ecosystemCrisis_materialAbundance',
        valueName: 'materialAbundance',
        month: state.currentMonth,
      }); // -0.5%/month
      qol.healthcareQuality = assertInRange(Math.max(0.3, qol.healthcareQuality - 0.003), 0, 1,
      {
        location: 'ecosystemCrisis_healthcareQuality',
        valueName: 'healthcareQuality',
        month: state.currentMonth,
      }); // -0.3%/month
      qol.ecosystemHealth = assertInRange(Math.max(0.1, qol.ecosystemHealth - 0.005), 0, 1,
      {
        location: 'ecosystemCrisis_ecosystemHealth',
        valueName: 'ecosystemHealth',
        month: state.currentMonth,
      }); // -0.5%/month
      
      // Log phase transition (once)
      if (monthsSince === 24) {
        try {
          console.log(`\n🦋 ECOSYSTEM COLLAPSE: Entering CRISIS PHASE (Month ${state.currentMonth})`);
          console.log(`   2 years since tipping point - failures accelerating`);
          console.log(`   Mortality rising, agricultural disruption spreading\n`);
        } catch (e) { /* Ignore EPIPE */ }
      }
      
    } else {
      // Phase 3: COLLAPSE (5+ years) - Severe failures
      state.ecosystemCollapse.phase = 'collapse';
      
      // High mortality: 1-2% per month
      // Global food system failure (100% of world affected)
      const pop = state.humanPopulationSystem as any;
      const ecosystemWeights3 = calculateEcosystemWeights(3);

      // Ecosystem component
      addMortalityRisk(pop,
      {
        type: 'ecosystem',
        baseRisk: 0.015 * ecosystemWeights3.ecosystem,
        proximate: 'ecosystem',
        root: 'ecosystem',
        confidence: 'MEDIUM',
        description: 'Ecosystem collapse - global food system failure (ecosystem component)',
        month: state.currentMonth,
        exposedFraction: 1.00
      });

      // Climate component
      addMortalityRisk(pop,
      {
        type: 'ecosystem',
        baseRisk: 0.015 * ecosystemWeights3.climate,
        proximate: 'ecosystem',
        root: 'climate',
        confidence: 'MEDIUM',
        description: 'Ecosystem collapse - global food system failure (climate component)',
        month: state.currentMonth,
        exposedFraction: 1.00
      });

      // Pollution component
      addMortalityRisk(pop,
      {
        type: 'ecosystem',
        baseRisk: 0.015 * ecosystemWeights3.pollution,
        proximate: 'ecosystem',
        root: 'pollution',
        confidence: 'MEDIUM',
        description: 'Ecosystem collapse - global food system failure (pollution component)',
        month: state.currentMonth,
        exposedFraction: 1.00
      });
      
      // Severe ongoing degradation
      qol.materialAbundance = assertInRange(Math.max(0.1, qol.materialAbundance - 0.01), 0, 3,
      {
        location: 'ecosystemCollapse_materialAbundance',
        valueName: 'materialAbundance',
        month: state.currentMonth,
      }); // -1%/month
      qol.healthcareQuality = assertInRange(Math.max(0.2, qol.healthcareQuality - 0.005), 0, 1,
      {
        location: 'ecosystemCollapse_healthcareQuality',
        valueName: 'healthcareQuality',
        month: state.currentMonth,
      }); // -0.5%/month
      qol.ecosystemHealth = assertInRange(Math.max(0.05, qol.ecosystemHealth - 0.008), 0, 1,
      {
        location: 'ecosystemCollapse_ecosystemHealth',
        valueName: 'ecosystemHealth',
        month: state.currentMonth,
      }); // -0.8%/month
      state.globalMetrics.qualityOfLife = assertProbability(Math.max(0, Math.min(1, state.globalMetrics.qualityOfLife - 0.01)),
      {
        location: 'ecosystemCollapse_qualityOfLife',
        valueName: 'qualityOfLife',
        month: state.currentMonth,
      });
      
      // Log phase transition (once)
      if (monthsSince === 60) {
        try {
          console.log(`\n🦋 ECOSYSTEM COLLAPSE: Entering COLLAPSE PHASE (Month ${state.currentMonth})`);
          console.log(`   5 years since tipping point - systemic failure`);
          console.log(`   Global food system failure, mass mortality\n`);
        } catch (e) { /* Ignore EPIPE */ }
      }
    }
  }
  
  // === ONGOING CRISIS IMPACTS ===
  // Once triggered, crises continue to degrade QoL
  
  // Calculate cascading failure multiplier
  const cascadeMultiplier = assertFinite(calculateCascadingFailureMultiplier(state),
      {
    location: 'checkEnvironmentalCrises',
    valueName: 'cascadeMultiplier',
    month: state.currentMonth
  });
  
  if (env.resourceCrisisActive) {
    // Ongoing resource scarcity
    qol.materialAbundance = assertInRange(Math.max(0, Math.min(3, qol.materialAbundance - 0.01 * cascadeMultiplier)), 0, 3,
      {
      location: 'ongoingResourceCrisis_materialAbundance',
      valueName: 'materialAbundance',
      month: state.currentMonth,
    });
    state.globalMetrics.socialStability = assertProbability(Math.max(0, Math.min(1, state.globalMetrics.socialStability - 0.01 * cascadeMultiplier)),
      {
      location: 'ongoingResourceCrisis_socialStability',
      valueName: 'socialStability',
      month: state.currentMonth,
    });
  }

  if (env.pollutionCrisisActive) {
    // Ongoing health impacts
    qol.healthcareQuality = assertProbability(Math.max(0, Math.min(1, qol.healthcareQuality - 0.008 * cascadeMultiplier)),
      {
      location: 'ongoingPollutionCrisis_healthcareQuality',
      valueName: 'healthcareQuality',
      month: state.currentMonth,
    });
    qol.diseasesBurden = assertProbability(Math.max(0, Math.min(1, qol.diseasesBurden + 0.01 * cascadeMultiplier)),
      {
      location: 'ongoingPollutionCrisis_diseasesBurden',
      valueName: 'diseasesBurden',
      month: state.currentMonth,
    });
  }

  if (env.climateCrisisActive) {
    // Ongoing climate disasters
    qol.physicalSafety = assertProbability(Math.max(0, Math.min(1, qol.physicalSafety - 0.012 * cascadeMultiplier)),
      {
      location: 'ongoingClimateCrisis_physicalSafety',
      valueName: 'physicalSafety',
      month: state.currentMonth,
    });
    qol.materialAbundance = assertInRange(Math.max(0, Math.min(3, qol.materialAbundance - 0.015 * cascadeMultiplier)), 0, 3,
      {
      location: 'ongoingClimateCrisis_materialAbundance',
      valueName: 'materialAbundance',
      month: state.currentMonth,
    });
  }

  if (env.ecosystemCrisisActive) {
    // Ongoing ecosystem degradation
    qol.ecosystemHealth = assertProbability(Math.max(0, Math.min(1, qol.ecosystemHealth - 0.01 * cascadeMultiplier)),
      {
      location: 'ongoingEcosystemCrisis_ecosystemHealth',
      valueName: 'ecosystemHealth',
      month: state.currentMonth,
    });
    qol.materialAbundance = assertInRange(Math.max(0, Math.min(3, qol.materialAbundance - 0.01 * cascadeMultiplier)), 0, 3,
      {
      location: 'ongoingEcosystemCrisis_materialAbundance',
      valueName: 'materialAbundance',
      month: state.currentMonth,
    });
  }
  
  // Extra cascading failure warning
  if (cascadeMultiplier > 1.5) {
    try {
      const activeCount = Math.round((cascadeMultiplier - 1.0) / 0.5 + 2);
      const crisisDetails = [
        env.resourceCrisisActive && 'Resource',
        env.pollutionCrisisActive && 'Pollution',
        env.climateCrisisActive && 'Climate',
        env.ecosystemCrisisActive && 'Ecosystem',
        state.socialAccumulation.meaningCollapseActive && 'Meaning',
        state.socialAccumulation.institutionalFailureActive && 'Institutional',
        state.socialAccumulation.socialUnrestActive && 'SocialUnrest',
        state.technologicalRisk.controlLossActive && 'ControlLoss',
        state.technologicalRisk.corporateDystopiaActive && 'Corporate',
        state.technologicalRisk.complacencyCrisisActive && 'Complacency'
      ].filter(Boolean).join(', ');
      console.warn(`   ⚠️⚠️⚠️  CASCADING FAILURES (Month ${state.currentMonth}): ${activeCount} crises active [${crisisDetails}], degradation accelerated ${cascadeMultiplier.toFixed(1)}x`);
      
      // Log cascading failure event (only once per month to avoid spam)
      const lastCascade = state.eventLog.filter(e => e.type === 'crisis').slice(-1)[0];
      if (!lastCascade || (lastCascade as any).month < state.currentMonth) {
        state.eventLog.push({
          id: `crisis-cascade-${state.currentMonth}`,
          type: 'crisis',
          severity: 'critical',
          agent: 'system',
          timestamp: state.currentMonth,
          title: `Cascading Failures: ${activeCount} crises active`,
          description: `Degradation accelerated ${cascadeMultiplier.toFixed(1)}x - Active: ${crisisDetails}`,
          effects: {}
        });
      }
    } catch (e) { /* Ignore EPIPE */ }
  }
}

/**
 * Get environmental sustainability score (0-1)
 * 
 * Used by Golden Age → Utopia transition logic.
 * Returns how sustainable the current state is.
 */
export function getEnvironmentalSustainability(env: EnvironmentalAccumulation): number {
  // Average of all environmental metrics
  // Resources and climate are inverted (low = bad), pollution is normal (high = bad)
  const resourceScore = env.resourceReserves;
  const pollutionScore = 1 - env.pollutionLevel;
  const climateScore = env.climateStability;
  const biodiversityScore = env.biodiversityIndex;
  
  // Weighted average (all equally important)
  return (resourceScore + pollutionScore + climateScore + biodiversityScore) / 4;
}

/**
 * Check if any environmental crisis would block Utopia
 * 
 * Utopia requires environmental sustainability, not just high QoL.
 */
export function hasEnvironmentalCrisis(env: EnvironmentalAccumulation): boolean {
  return env.resourceCrisisActive || 
         env.pollutionCrisisActive || 
         env.climateCrisisActive || 
         env.ecosystemCrisisActive;
}

/**
 * Calculate cascading failure multiplier based on total active crises
 *
 * When multiple crises are active across all systems, they amplify each other.
 * P1.3 FIX: Reduced compounding from 0.5 to 0.2 (was too aggressive)
 * 2 crises: 1.0x (baseline)
 * 3 crises: 1.2x degradation (was 1.5x)
 * 4 crises: 1.4x degradation (was 2.0x)
 * 6 crises: 1.8x degradation (was 3.0x)
 *
 * This represents systemic collapse where failures compound.
 * Research: Historical crises rarely amplify more than 2x (COVID + economic crisis)
 */
function calculateCascadingFailureMultiplier(state: GameState): number {
  const activeCrises = [
    // Environmental (4 possible)
    state.environmentalAccumulation.resourceCrisisActive,
    state.environmentalAccumulation.pollutionCrisisActive,
    state.environmentalAccumulation.climateCrisisActive,
    state.environmentalAccumulation.ecosystemCrisisActive,
    // Social (3 possible)
    state.socialAccumulation.meaningCollapseActive,
    state.socialAccumulation.institutionalFailureActive,
    state.socialAccumulation.socialUnrestActive,
    // Technological (3 possible)
    state.technologicalRisk.controlLossActive,
    state.technologicalRisk.corporateDystopiaActive,
    state.technologicalRisk.complacencyCrisisActive
  ].filter(Boolean).length;

  if (activeCrises <= 2) {
    return 1.0; // No amplification for 1-2 crises
  }

  // P1.3 FIX: Each crisis beyond 2 adds 20% more degradation (was 50%)
  return 1.0 + (activeCrises - 2) * 0.2;
}

