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
 */

import { GameState } from '@/types/game';

/**
 * Environmental mortality breakdown by cause
 */
export interface EnvironmentalMortalityBreakdown {
  total: number;           // Total monthly mortality rate
  famine: number;          // Deaths from food insecurity
  disease: number;         // Deaths from water/sanitation
  climate: number;         // Deaths from heat/disasters
  ecosystem: number;       // Deaths from biodiversity loss
  pollution: number;       // Deaths from pollution (baseline)
}

/**
 * Calculate environmental mortality rate based on threshold crossings
 *
 * Research-based (UNEP 2024, PNAS 2014):
 * - Current (2025): 7/9 boundaries, 9M deaths/8B people = 0.009% monthly
 * - Mortality scales with food, water, climate, biodiversity thresholds
 * - Non-linear escalation when multiple systems fail
 *
 * FIX (Oct 13, 2025): Now returns breakdown by cause to properly track deaths
 * P0.6 (Oct 15, 2025): Episodic environmental shocks instead of continuous noise
 * Research: Real environmental disasters are episodic (heatwaves, droughts, famines)
 *   - Events occur with ~5% monthly probability based on environmental stress
 *   - Events cause 50-200% mortality spikes for 3-12 months
 *   - Between events: minimal variation (baseline + small noise)
 * Returns monthly mortality rate (0-1, where 0.01 = 1% die per month)
 */
export function calculateEnvironmentalMortality(state: GameState, month: number): EnvironmentalMortalityBreakdown {
  const env = state.environmentalAccumulation;
  const boundaries = state.planetaryBoundariesSystem;
  if (!env || !boundaries) {
    return { total: 0, famine: 0, disease: 0, climate: 0, ecosystem: 0, pollution: 0 };
  }

  let famineMortality = 0;
  let diseaseMortality = 0;
  let climateMortality = 0;
  let ecosystemMortality = 0;
  let pollutionMortality = 0;

  // === BASELINE (Current 2025 conditions) ===
  // 7/9 boundaries breached = 0.009% monthly (UNEP: 9M deaths/year globally)
  // Pollution is the main driver of current baseline mortality
  if (boundaries.boundariesBreached >= 7) {
    pollutionMortality = 0.00009; // 0.009% baseline
  }

  // === FOOD SECURITY (Highest immediate impact) ===
  // Food < 0.4 = crisis, Food < 0.2 = catastrophic
  // FIX (Oct 13, 2025): foodSecurity is in survivalFundamentals, not environmentalAccumulation
  const foodSecurity = state.survivalFundamentals?.foodSecurity ?? 0.7;
  if (foodSecurity < 0.4) {
    const foodSeverity = (0.4 - foodSecurity) / 0.4; // 0-1 scale
    famineMortality += 0.0001 * Math.pow(foodSeverity, 1.5); // 0.01%/month at threshold, scales up

    if (foodSecurity < 0.2) {
      // Catastrophic food crisis: additional mortality
      const catSeverity = (0.2 - foodSecurity) / 0.2;
      famineMortality += 0.0005 * catSeverity; // Up to 0.05%/month additional
    }
  }

  // === WATER SECURITY ===
  // Water < 0.4 = crisis (leads to cholera, dysentery, other waterborne disease)
  const waterSecurity = env.waterSecurity || 0.7;
  if (waterSecurity < 0.4) {
    const waterSeverity = (0.4 - waterSecurity) / 0.4;
    diseaseMortality += 0.00008 * Math.pow(waterSeverity, 1.5); // Slightly less immediate than food
  }

  // === CLIMATE STABILITY (Heat stress, disasters) ===
  // Climate < 0.5 = severe, Climate < 0.3 = catastrophic
  const climateStability = env.climateStability || 0.75;
  if (climateStability < 0.6) {
    const climateSeverity = (0.6 - climateStability) / 0.6;
    climateMortality += 0.00005 * Math.pow(climateSeverity, 2); // Non-linear escalation
  }

  // === BIODIVERSITY LOSS (Ecosystem services collapse) ===
  // Biodiversity < 0.3 = critical, < 0.2 = collapse
  // Loss of pollination, disease regulation, etc.
  const biodiversity = env.biodiversityIndex || 0.35;
  if (biodiversity < 0.3) {
    const bioSeverity = (0.3 - biodiversity) / 0.3;
    ecosystemMortality += 0.00003 * Math.pow(bioSeverity, 1.5); // Pollination, disease regulation lost
  }

  // === CASCADE AMPLIFICATION (Non-Linear Feedback) ===
  // When multiple systems fail simultaneously, effects compound
  const breachedCount = boundaries.boundariesBreached;
  if (breachedCount >= 8) {
    const cascadeAmplifier = 1.0 + Math.pow((breachedCount - 7) / 2, 2); // 1.0x → 2.25x at 9/9
    famineMortality *= cascadeAmplifier;
    diseaseMortality *= cascadeAmplifier;
    climateMortality *= cascadeAmplifier;
    ecosystemMortality *= cascadeAmplifier;
  }

  // === P0.6 (Oct 15, 2025): PERSISTENT ENVIRONMENTAL SHOCKS (AR1 autocorrelation) ===
  // Research: Real disasters persist for 3-12 months (not single-month events)
  // - 2003 European heatwave: Sustained for 3 months, 40,000 deaths
  // - Somalia famine 2010-12: 24 months, 256,000 deaths
  // - Agricultural shocks: 3-6 month recovery periods

  // Initialize activeShocks array if missing
  if (!env.activeShocks) {
    env.activeShocks = [];
  }

  // === APPLY ACTIVE SHOCKS (persistent mortality spikes) ===
  for (const shock of env.activeShocks) {
    // Apply shock magnitude to appropriate mortality type
    switch (shock.type) {
      case 'climate':
        climateMortality *= shock.magnitude;
        break;
      case 'famine':
        famineMortality *= shock.magnitude;
        break;
      case 'disease':
        diseaseMortality *= shock.magnitude;
        break;
      case 'ecosystem':
        ecosystemMortality *= shock.magnitude;
        break;
    }
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
  const baseProb = scenarioParams?.environmentalShockProbability ?? 0.02;
  const maxProb = baseProb + 0.13; // Scale to 13% above base
  const baseMag = scenarioParams?.environmentalShockMagnitude ?? 2.0;

  // Event probability scales with environmental stress
  const eventProbability = Math.min(maxProb, baseProb + (breachedCount / 9) * (maxProb - baseProb));

  if (Math.random() < eventProbability) {
    // New shock triggered!
    const shockType = Math.random();
    const shockMagnitude = baseMag + Math.random() * (baseMag * 0.75); // baseMag to (baseMag * 1.75)
    const shockDuration = 3 + Math.floor(Math.random() * 10); // 3-12 months

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

  // === BASELINE NOISE (±5%) ===
  // Small variation between events (not continuous dice-rolling)
  const baselineNoise = () => 0.95 + Math.random() * 0.1; // 95-105%
  famineMortality *= baselineNoise();
  diseaseMortality *= baselineNoise();
  climateMortality *= baselineNoise();
  ecosystemMortality *= baselineNoise();
  pollutionMortality *= baselineNoise();

  // === REGIONAL VARIATION MULTIPLIER ===
  // Some regions hit harder (handled by regional crisis system)
  // This is the global average; specific regions can be 2-5x worse

  const total = famineMortality + diseaseMortality + climateMortality + ecosystemMortality + pollutionMortality;

  // Cap at 10%/month (horrific but not instant extinction)
  // Even worst-case scenarios take years to play out
  const cappedTotal = Math.min(total, 0.10);

  // Scale down individual categories if we hit the cap
  const scaleFactor = total > 0.10 ? 0.10 / total : 1.0;

  return {
    total: cappedTotal,
    famine: famineMortality * scaleFactor,
    disease: diseaseMortality * scaleFactor,
    climate: climateMortality * scaleFactor,
    ecosystem: ecosystemMortality * scaleFactor,
    pollution: pollutionMortality * scaleFactor
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

  // FIX (Oct 13, 2025): foodSecurity is in survivalFundamentals, NOT environmentalAccumulation!
  // BUG: Was checking env.foodSecurity (undefined) → always defaulted to 0.7 → never triggered!
  const env = state.environmentalAccumulation;
  const globalFoodSecurity = state.survivalFundamentals?.foodSecurity ?? 0.7;

  // FIX (Oct 13, 2025): Simplified famine trigger based on global food security only
  // The regional biodiversity system isn't being maintained, so we can't rely on it
  //
  // Phase 1B Refinement (Oct 17, 2025): Lowered famine threshold from 0.4 to 0.6
  // Historical validation: Ukraine Holodomor (0.5-0.6), Bengal Famine (0.6), Somalia (0.5-0.6)
  // Research: FAO severe food insecurity threshold is 0.7, famines trigger 0.5-0.7

  if (globalFoodSecurity < 0.6) {  // Lowered from 0.4 (Oct 17, 2025)
    const totalPopulation = state.humanPopulationSystem.population;

    // Define 6 major world regions (simplified, not tied to biodiversity system)
    const worldRegions = [
      { name: 'Asia', popFraction: 0.60 },
      { name: 'Africa', popFraction: 0.18 },
      { name: 'Europe', popFraction: 0.09 },
      { name: 'North America', popFraction: 0.07 },
      { name: 'South America', popFraction: 0.05 },
      { name: 'Oceania', popFraction: 0.01 }
    ];

    // How many regions to trigger famine in, based on severity
    // Research: Severe food crisis affects multiple regions simultaneously
    const regionsToTrigger = globalFoodSecurity < 0.1 ? 6 :  // Global famine
                             globalFoodSecurity < 0.2 ? 4 :  // Severe crisis (Asia, Africa, ...)
                             globalFoodSecurity < 0.3 ? 2 :  // Major crisis (Asia, Africa)
                             1;                              // Regional crisis (Asia)

    for (let i = 0; i < regionsToTrigger; i++) {
      const region = worldRegions[i];

      // Skip if famine already active in this region
      const existingFamine = state.famineSystem.activeFamines.find(
        f => f.affectedRegion === region.name
      );
      if (existingFamine) continue;

      // Calculate population at risk
      // Research: Severe food crisis puts 30-80% of regional population at risk
      const severityFactor = (0.4 - globalFoodSecurity) / 0.4; // 0-1 scale
      const atRiskFraction = 0.30 + (severityFactor * 0.50); // 30-80% at risk
      const populationAtRisk = totalPopulation * region.popFraction * atRiskFraction;

      // Determine cause
      let cause: import('@/types/famine').FamineCause = 'crop_failure';
      if (state.phosphorusDepletion?.globalSupplyShock > 3.0) {
        cause = 'supply_chain_collapse';
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
        globalFoodSecurity
      );

      console.log(`\n🌾💀 GLOBAL FOOD CRISIS FAMINE: ${region.name}`);
      console.log(`   Global food security: ${(globalFoodSecurity * 100).toFixed(1)}%`);
      console.log(`   Population at risk: ${(populationAtRisk * 1000).toFixed(0)}M (${(atRiskFraction * 100).toFixed(0)}% of region)`);
      console.log(`   Cause: ${cause}`);
      console.log(`   Expected deaths: ~${(populationAtRisk * 0.37 * 1000).toFixed(0)}M over 6 months if no intervention\n`);
    }
  }
}
