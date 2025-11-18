/**
 * Mortality and Famine Risk Calculations
 *
 * This module handles environmental mortality calculations and famine risk detection.
 * These functions were extracted from the original qualityOfLife.ts during refactoring.
 *
 * Research basis:
 * - UNEP (2024): Planetary boundaries and mortality impacts
 * - IPBES (2019): Ecosystem collapse → agricultural failure → famine
 * - FAO State of Food Security (2024): Famine triggers and thresholds
 *
 * MIGRATION (Oct 28, 2025): Converted to centralized Bayesian mortality system
 * - Now calls addMortalityRisk() instead of returning death rates
 * - Enables full Bayesian compounding, demographic vulnerability, multi-causal attribution
 */

import { GameState } from '@/types/game';
import { addMortalityRisk } from '@/simulation/bayesianMortality';
import { deterministicRandom } from '@/simulation/utils/deterministicRng';
import { THRESHOLDS, RATES } from '@/simulation/config/centralConfig';
import { assertStateProperty, assertFinite } from '@/simulation/utils/assertions';

/**
 * Environmental mortality breakdown by cause
 * DEPRECATED (Oct 28, 2025): Return type kept for backward compatibility
 * Function now adds mortality risks directly via addMortalityRisk()
 */
export interface EnvironmentalMortalityBreakdown {
  total: number;           // Total monthly mortality rate (DEPRECATED - always returns 0)
  famine: number;          // Deaths from food insecurity (DEPRECATED - always returns 0)
  disease: number;         // Deaths from water/sanitation (DEPRECATED - always returns 0)
  climate: number;         // Deaths from heat/disasters (DEPRECATED - always returns 0)
  ecosystem: number;       // Deaths from biodiversity loss (DEPRECATED - always returns 0)
  pollution: number;       // Deaths from pollution (baseline) (DEPRECATED - always returns 0)
}

/**
 * Add environmental mortality risks via centralized Bayesian system
 *
 * MIGRATION (Oct 28, 2025): Converted from returning death rates to adding mortality risks
 * - Now calls addMortalityRisk() for each environmental threat
 * - Enables Bayesian compounding across all mortality sources
 * - Applies demographic vulnerability automatically
 * - Provides full multi-causal attribution
 *
 * Research-based (UNEP 2024, PNAS 2014):
 * - Current (2025): 7/9 boundaries, 9M deaths/8B people = 0.009% monthly
 * - Mortality scales with food, water, climate, biodiversity thresholds
 * - Non-linear escalation when multiple systems fail
 *
 * P0.6 (Oct 15, 2025): Episodic environmental shocks instead of continuous noise
 * Research: Real environmental disasters are episodic (heatwaves, droughts, famines)
 *   - Events occur with ~5% monthly probability based on environmental stress
 *   - Events cause 50-200% mortality spikes for 3-12 months
 *   - Between events: minimal variation (baseline + small noise)
 *
 * Returns deprecated breakdown for backward compatibility (all zeros)
 */
export function calculateEnvironmentalMortality(state: GameState, month: number): EnvironmentalMortalityBreakdown {
  const env = state.environmentalAccumulation;
  const boundaries = state.planetaryBoundariesSystem;
  if (!env || !boundaries) {
    return { total: 0, famine: 0, disease: 0, climate: 0, ecosystem: 0, pollution: 0 };
  }

  const pop = state.humanPopulationSystem;

  // === BASELINE (Current 2025 conditions) ===
  // 7/9 boundaries breached = 0.009% monthly (UNEP: 9M deaths/year globally)
  // Pollution is the main driver of current baseline mortality
  if (boundaries.boundariesBreached >= 7) {
    const pollutionRisk = 0.00009; // 0.009% monthly
    addMortalityRisk(pop, {
      type: 'pollution',
      baseRisk: pollutionRisk,
      proximate: 'pollution',
      root: 'pollution',
      confidence: 'HIGH',
      scope: 'GLOBAL',
      month: state.currentMonth,
      description: 'Baseline pollution mortality (7/9 boundaries breached)',
    });
  }

  // === FOOD SECURITY (Highest immediate impact) ===
  // FIX (Oct 25, 2025): REMOVED redundant famine mortality calculation
  // Famine deaths are now handled EXCLUSIVELY by FamineSystemPhase based on regional food security
  // This prevents triple-counting:
  // 1. Climate catastrophe deaths (REMOVED from environmental.ts)
  // 2. Environmental mortality famine deaths (REMOVED here)
  // 3. FamineSystemPhase deaths (ONLY source of famine deaths now)
  //
  // The FamineSystemPhase checks REGIONAL food security and triggers famines appropriately
  // No global food security threshold needed here

  // === WATER SECURITY ===
  // Water < WATER_SECURITY_CRISIS_THRESHOLD = crisis (leads to cholera, dysentery, other waterborne disease)
  // Note: waterSecurity not in EnvironmentalAccumulation, use QoL system
  const waterSecurity = assertStateProperty(
    state.qualityOfLifeSystems.survivalFundamentals,
    'waterSecurity',
    {
      location: 'calculateEnvironmentalMortality',
      month: state.currentMonth,
      expectedSource: 'qualityOfLife/initialization.ts'
    }
  );
  if (waterSecurity < THRESHOLDS.WATER_SECURITY_CRISIS_THRESHOLD) {
    const waterSeverity = (THRESHOLDS.WATER_SECURITY_CRISIS_THRESHOLD - waterSecurity) / THRESHOLDS.WATER_SECURITY_CRISIS_THRESHOLD;
    const waterDiseaseRisk = 0.00008 * Math.pow(waterSeverity, 1.5); // Slightly less immediate than food
    addMortalityRisk(pop, {
      type: 'disease',
      baseRisk: waterDiseaseRisk,
      proximate: 'disease',
      root: 'resource', // Water depletion → disease
      confidence: 'HIGH',
      scope: 'SEMI-GLOBAL', // Water crises are regional but widespread
      month: state.currentMonth,
      description: 'Waterborne disease from water insecurity',
    });
  }

  // === CLIMATE STABILITY (Heat stress, disasters) ===
  // Climate < 0.5 = severe, Climate < 0.3 = catastrophic
  // FIX (Oct 26, 2025): Climate disasters are SEASONAL, not continuous
  // Research: Heatwaves (summer), monsoons (rainy season), hurricanes (seasonal), droughts (dry season)
  // - Northern Hemisphere: Most climate mortality June-September (summer + hurricane season)
  // - Southern Hemisphere: Most climate mortality December-March (summer)
  // - Tropical regions: Monsoon season (varies, typically 3-4 months)
  //
  // Apply 2.0x multiplier during peak climate disaster months, 0.5x during off-season
  const climateStability = assertStateProperty(
    env,
    'climateStability',
    {
      location: 'calculateEnvironmentalMortality',
      month: state.currentMonth,
      expectedSource: 'environmental/initialization.ts'
    }
  );
  if (climateStability < 0.6) {
    const climateSeverity = (0.6 - climateStability) / 0.6;
    let baseClimateMortality = 0.00005 * Math.pow(climateSeverity, 2); // Non-linear escalation

    // Seasonal adjustment based on month of year
    const monthOfYear = month % 12; // 0 = Jan, 1 = Feb, ..., 11 = Dec

    // Peak climate disaster months (research-backed):
    // Northern Hemisphere summer + hurricane season: June-September (months 5-8)
    // Southern Hemisphere summer: December-February (months 11, 0, 1)
    // Tropical monsoon season: Generally overlaps with NH summer (months 5-8)
    const isClimateDisasterSeason =
      (monthOfYear >= 5 && monthOfYear <= 8) ||  // NH summer/hurricane/monsoon (Jun-Sep)
      (monthOfYear === 11 || monthOfYear <= 1);   // SH summer (Dec-Feb)

    // Apply seasonal multiplier
    // Research: 70-80% of climate deaths occur in 5-6 peak months
    // Peak season: 2.0x base rate
    // Off-season: 0.5x base rate (residual year-round effects)
    const climateRisk = baseClimateMortality * (isClimateDisasterSeason ? 2.0 : 0.5);
    addMortalityRisk(pop, {
      type: 'disaster',
      baseRisk: climateRisk,
      proximate: 'disasters',
      root: 'climate',
      confidence: 'HIGH',
      scope: 'SEMI-GLOBAL', // Climate disasters are regional but widespread
      month: state.currentMonth,
      description: `Climate disasters (${isClimateDisasterSeason ? 'peak season' : 'off-season'})`,
    });
  }

  // === BIODIVERSITY LOSS (Ecosystem services collapse) ===
  // Biodiversity < 0.3 = critical, < 0.2 = collapse
  // Loss of pollination, disease regulation, etc.
  const biodiversity = assertStateProperty(
    env,
    'biodiversityIndex',
    {
      location: 'calculateEnvironmentalMortality',
      month: state.currentMonth,
      expectedSource: 'environmental/initialization.ts'
    }
  );
  if (biodiversity < 0.3) {
    const bioSeverity = (0.3 - biodiversity) / 0.3;
    const ecosystemRisk = 0.00003 * Math.pow(bioSeverity, 1.5); // Pollination, disease regulation lost
    addMortalityRisk(pop, {
      type: 'ecosystem',
      baseRisk: ecosystemRisk,
      proximate: 'ecosystem',
      root: 'ecosystem',
      confidence: 'MEDIUM', // Ecosystem effects harder to quantify precisely
      scope: 'GLOBAL',
      month: state.currentMonth,
      description: 'Ecosystem services collapse',
    });
  }

  // === CASCADE AMPLIFICATION (Non-Linear Feedback) ===
  // MIGRATION (Oct 28, 2025): REMOVED explicit cascade amplification
  // Bayesian mortality system handles compounding automatically via P(death) = 1 - ∏(1-p_i)
  // When multiple risks are present, the compounding formula naturally creates non-linear escalation
  // No need to manually amplify individual risks - the math does it for us
  //
  // Example: 3 independent 1% risks
  // - Old system with 2.0x cascade: 1% + 1% + 1% = 3% × 2.0 = 6%
  // - Bayesian compounding: 1 - (0.99 × 0.99 × 0.99) = 2.97%
  //
  // The Bayesian approach is more research-accurate and handles demographic vulnerability correctly

  // === P0.6 (Oct 15, 2025): PERSISTENT ENVIRONMENTAL SHOCKS (AR1 autocorrelation) ===
  // Research: Real disasters persist for 3-12 months (not single-month events)
  // - 2003 European heatwave: Sustained for 3 months, 40,000 deaths
  // - Somalia famine 2010-12: 24 months, 256,000 deaths
  // - Agricultural shocks: 3-6 month recovery periods
  //
  // MIGRATION (Oct 28, 2025): Shocks now add separate mortality risks instead of multiplying rates
  // Each active shock contributes an independent risk that compounds via Bayesian formula

  // Initialize activeShocks array if missing
  if (!env.activeShocks) {
    env.activeShocks = [];
  }

  // === APPLY ACTIVE SHOCKS (persistent mortality spikes) ===
  for (const shock of env.activeShocks) {
    // Calculate shock-induced mortality risk
    // Old: multiplied existing mortality rate by magnitude (e.g., 2.0× = double deaths)
    // New: add shock magnitude as additional independent risk
    // Research: Environmental shocks add 50-300% additional mortality (magnitude 1.5-4.0)
    const shockBaseRisk = 0.0001 * (shock.magnitude - 1.0); // Convert magnitude to risk

    // Map shock type to proximate/root causes
    let proximate: 'disasters' | 'disease' | 'ecosystem' | 'famine';
    let root: 'climate' | 'resource' | 'ecosystem' | 'climate';

    switch (shock.type) {
      case 'climate':
        proximate = 'disasters';
        root = 'climate';
        break;
      case 'famine':
        proximate = 'famine';
        root = 'climate'; // Famines usually climate-driven (drought/flood)
        break;
      case 'disease':
        proximate = 'disease';
        root = 'resource'; // Disease outbreaks from water/sanitation
        break;
      case 'ecosystem':
        proximate = 'ecosystem';
        root = 'ecosystem';
        break;
    }

    addMortalityRisk(pop, {
      type: shock.type === 'famine' ? 'famine' : shock.type === 'disease' ? 'disease' : shock.type === 'ecosystem' ? 'ecosystem' : 'disaster',
      baseRisk: shockBaseRisk,
      proximate,
      root,
      confidence: 'MEDIUM', // Shock magnitude estimates have uncertainty
      scope: 'REGIONAL', // Most environmental shocks are regional
      month: state.currentMonth,
      description: `Environmental shock: ${shock.type} (month ${shock.remainingMonths}/${shock.duration})`,
    });
  }

  // === DECAY ACTIVE SHOCKS (AR1 persistence) ===
  // Remove expired shocks and decrement remaining months
  env.activeShocks = env.activeShocks.filter(shock => {
    shock.remainingMonths--;
    return shock.remainingMonths > 0;
  });

  // === GENERATE NEW SHOCKS (episodic events) ===
  // P0.7 (Oct 16, 2025): Scenario-specific shock parameters
  // Historical: 2% base + scaling = 2-15% event probability, 150-300% spikes
  // Unprecedented: 5% base + scaling = 5-25% event probability, 250-450% spikes
  const scenarioParams = state.config.scenarioParameters;
  const baseProb = assertFinite(
    scenarioParams?.environmentalShockProbability !== undefined
      ? scenarioParams.environmentalShockProbability
      : 0.02,
    {
      location: 'calculateEnvironmentalMortality',
      valueName: 'environmentalShockProbability',
      month: state.currentMonth,
    }
  );
  const maxProb = baseProb + 0.13; // Scale to 13% above base
  const baseMag = assertFinite(
    scenarioParams?.environmentalShockMagnitude !== undefined
      ? scenarioParams.environmentalShockMagnitude
      : 2.0,
    {
      location: 'calculateEnvironmentalMortality',
      valueName: 'environmentalShockMagnitude',
      month: state.currentMonth,
    }
  );

  // Event probability scales with environmental stress
  const breachedCount = boundaries.boundariesBreached;
  const eventProbability = Math.min(maxProb, baseProb + (breachedCount / 9) * (maxProb - baseProb));

  if (deterministicRandom() < eventProbability) {
    // New shock triggered!
    const shockType = deterministicRandom();
    const shockMagnitude = baseMag + deterministicRandom() * (baseMag * 0.75); // baseMag to (baseMag * 1.75)
    const shockDuration = 3 + Math.floor(deterministicRandom() * 10); // 3-12 months

    // Determine shock type (which mortality category)
    let type: 'climate' | 'famine' | 'disease' | 'ecosystem';
    if (shockType < 0.3) {
      type = 'climate'; // Heatwave / extreme weather
    } else if (shockType < 0.6) {
      type = 'famine'; // Drought / crop failure
    } else if (shockType < 0.85) {
      type = 'disease'; // Disease outbreak / waterborne disease
    } else {
      type = 'ecosystem'; // Ecosystem collapse event
    }

    // Add to active shocks
    env.activeShocks.push({
      type,
      magnitude: shockMagnitude,
      startMonth: month,
      duration: shockDuration,
      remainingMonths: shockDuration
    });

    // Log shock event
    console.log(`\n🌍💥 ENVIRONMENTAL SHOCK: ${type.toUpperCase()}`);
    console.log(`   Magnitude: ${(shockMagnitude * 100 - 100).toFixed(0)}% mortality spike`);
    console.log(`   Duration: ${shockDuration} months`);
    console.log(`   Month: ${month}\n`);
  }

  // MIGRATION (Oct 28, 2025): Return deprecated breakdown (all zeros)
  // Function now adds mortality risks directly via addMortalityRisk()
  // Return value kept for backward compatibility but is no longer used
  return {
    total: 0,
    famine: 0,
    disease: 0,
    climate: 0,
    ecosystem: 0,
    pollution: 0
  };
}

/**
 * Get regional population proportion
 * Used for calculating population at risk in regional famines
 */
function getRegionalPopulationProportion(regionName: string): number {
  const proportions: Record<string, number> = {
    'Asia': 0.60,         // 4.7B / 8B
    'Africa': 0.18,       // 1.4B / 8B
    'South America': 0.05, // 0.43B / 8B
    'North America': 0.07, // 0.58B / 8B
    'Europe': 0.09,       // 0.75B / 8B
    'Oceania': 0.01,      // 0.044B / 8B
  };
  return proportions[regionName] || 0.10; // Default to 10%
}

/**
 * Check regional biodiversity for famine risk
 * Triggers famines when regional ecosystems collapse
 *
 * Research: IPBES (2019), FAO State of Food Security (2024)
 * Ecosystem collapse → agricultural failure → famine
 */
export function checkRegionalFamineRisk(state: GameState, month: number): void {
  if (!state.famineSystem) {
    console.warn(`⚠️  [Month ${month}] checkRegionalFamineRisk: famineSystem is undefined!`);
    return;
  }

  // FIX (Oct 25, 2025): Check REGIONAL food security, not global
  // Food security is now fully regional (persistent state modified by degradation phases)
  // Each region has its own foodSecurity value that tracks real regional variation
  //
  // FIX (Nov 6, 2025): Raise threshold to 0.8 (IPC Phase 3 = crisis)
  // Research: FAO (2023) IPC Phase classification
  // - 80-100%: Minimal/Stressed (Phase 1-2) - no famine
  // - 60-80%: Crisis (Phase 3) - hunger, NO mass mortality
  // - 40-60%: Emergency (Phase 4) - acute malnutrition, LOW mortality
  // - <40%: Catastrophe/Famine (Phase 5) - starvation, HIGH mortality
  //
  // Severity is determined by getFamineSeverity() in famine.ts based on food security level

  const env = state.environmentalAccumulation;
  const FAMINE_THRESHOLD = 0.8;  // Trigger at IPC Phase 3 (Crisis) threshold

  // Guard against undefined regionalPopulations
  if (!state.humanPopulationSystem.regionalPopulations) {
    console.warn(`⚠️  [Month ${month}] checkRegionalFamineRisk: regionalPopulations is undefined!`);
    return;
  }

  // Check each region's food security independently
  for (const region of state.humanPopulationSystem.regionalPopulations) {
    // Skip if famine already active in this region
    const existingFamine = state.famineSystem.activeFamines.find(
      f => f.affectedRegion === region.name
    );
    if (existingFamine) continue;

    // Check if region's food security is below famine threshold
    if (region.foodSecurity < FAMINE_THRESHOLD) {
      // Calculate population at risk based on severity
      // Research: Severe food crisis puts 30-80% of regional population at risk
      const severityFactor = (FAMINE_THRESHOLD - region.foodSecurity) / FAMINE_THRESHOLD; // 0-1 scale
      const atRiskFraction = 0.30 + (severityFactor * 0.50); // 30-80% at risk
      const populationAtRisk = (region.population / 1000) * atRiskFraction; // Convert millions to billions

      // Determine cause based on environmental conditions
      let cause: import('@/types/famine').FamineCause = 'crop_failure';
      if (state.phosphorusSystem?.supplyShockActive) {
        cause = 'economic_collapse'; // Phosphorus supply shock → economic collapse
      } else if (env.climateStability < 0.4) {
        cause = 'drought';
      }

      // Trigger famine with realistic death curve (2% → 8% → 15% → 10% → 2% over months)
      const { triggerFamine } = require('@/types/famine');
      triggerFamine(
        state.famineSystem,
        month,
        region.name,
        populationAtRisk,
        cause,
        region.foodSecurity  // Pass regional food security, not global
      );

      console.log(`\n🌾💀 REGIONAL FAMINE: ${region.name}`);
      console.log(`   Regional food security: ${(region.foodSecurity * 100).toFixed(1)}%`);
      console.log(`   Population at risk: ${(populationAtRisk * 1000).toFixed(0)}M (${(atRiskFraction * 100).toFixed(0)}% of region)`);
      console.log(`   Regional population: ${region.population.toFixed(0)}M`);
      console.log(`   Cause: ${cause}`);
      console.log(`   Expected deaths: ~${(populationAtRisk * 0.37 * 1000).toFixed(0)}M over 6 months if no intervention\n`);
    }
  }
}
