/**
 * Air Quality Tracking (PM2.5 Annual Mean)
 *
 * **CRITICAL OMISSION FIX:**
 * PM2.5 air pollution kills 7 million people/year globally (WHO 2024),
 * but was NOT included in planetary boundaries framework (Richardson 2023)
 * or ecological footprint. This is a major gap - air quality affects both
 * health (Development paradigm) AND environment (Ecological paradigm).
 *
 * **Research Foundation:**
 * - WHO (2024): 7M premature deaths annually linked to air pollution
 * - Burnett et al. (2020, Lancet): Global estimates of mortality associated with PM2.5
 * - WHO Air Quality Database 2024: 180+ countries, population-weighted PM2.5
 * - WHO Guidelines (2021): 5 μg/m³ annual mean (safe threshold)
 *
 * **Integration:**
 * - **Ecological Paradigm:** 13th indicator (was 12)
 * - **Development Paradigm:** Cross-referenced (affects life expectancy in HDI)
 *
 * **Data Source:**
 * - WHO Global Air Quality Database 2024
 * - Coverage: 180+ countries
 * - Metric: PM2.5 annual mean (μg/m³), population-weighted
 * - Update frequency: Annual
 *
 * **Thresholds:**
 * - **Utopia:** <5 μg/m³ (WHO guideline)
 * - **Safe:** <10 μg/m³ (WHO interim target 4)
 * - **Dystopia:** >50 μg/m³ (WHO interim target 1, severe pollution)
 *
 * **Examples:**
 * - Oslo: 6 μg/m³ (utopia)
 * - Beijing 2024: 35 μg/m³ (down from 85 in 2013, improving)
 * - Delhi 2024: 110 μg/m³ (dystopia, extreme)
 * - Global urban average: ~35 μg/m³ (80% of urban population exposed to unsafe air)
 *
 * @module simulation/airQuality
 */

import { assertFinite, assertInRange } from './utils/assertions';

/**
 * Air quality state
 */
export interface AirQualityState {
  /**
   * PM2.5 annual mean (μg/m³), population-weighted
   *
   * Global average ~35 μg/m³ (2024)
   * Range: 3-150 μg/m³ (Oslo to Delhi)
   */
  pm25: number;

  /**
   * Health impact from air pollution
   */
  healthImpact: {
    /** Annual deaths attributable to air pollution */
    deaths: number;

    /** Disability-adjusted life years (DALYs) lost */
    dalys: number;

    /** % of total mortality from air pollution (global ~13%) */
    mortalityFraction: number;
  };

  /**
   * Economic cost
   *
   * % GDP lost from healthcare costs + productivity loss
   * Global: ~3-5% GDP (WHO estimates)
   */
  economicCost: number;

  /**
   * Air pollution sources (% breakdown)
   */
  sources: {
    /** Industrial emissions */
    industrial: number;

    /** Transport (vehicles, aviation) */
    transport: number;

    /** Residential (heating, cooking) */
    residential: number;

    /** Agricultural (ammonia, burning) */
    agricultural: number;

    /** Natural (dust, wildfires) */
    naturalDust: number;
  };

  /**
   * Trend (improving/worsening)
   *
   * China: Improving (-60% since 2013)
   * India: Worsening (+20% since 2013)
   * Global: Mixed (urban improving in OECD, worsening in Global South)
   */
  trend: number; // % change per year
}

/**
 * Initialize air quality state
 *
 * Sets baseline PM2.5 levels for 2025 global average.
 *
 * @returns Initial air quality state
 */
export function initializeAirQuality(): AirQualityState {
  return {
    // Global population-weighted average ~35 μg/m³ (2024 WHO data)
    pm25: 35,

    healthImpact: {
      // WHO 2024: 7M deaths/year globally from air pollution
      deaths: 7_000_000,

      // ~130M DALYs lost/year (Lancet GBD 2024)
      dalys: 130_000_000,

      // ~13% of total global mortality from air pollution
      mortalityFraction: 0.13,
    },

    // Economic cost: ~4% GDP globally (healthcare + productivity)
    economicCost: 0.04,

    sources: {
      // Source breakdown (global average, WHO 2024)
      industrial: 0.30,    // 30% industrial
      transport: 0.25,     // 25% transport
      residential: 0.20,   // 20% residential
      agricultural: 0.15,  // 15% agricultural
      naturalDust: 0.10,   // 10% natural
    },

    // Global trend: -0.5%/year (slight improvement from clean tech deployment)
    trend: -0.005,
  };
}

/**
 * Update air quality (monthly)
 *
 * PM2.5 levels affected by:
 * - Economic activity (more GDP → more emissions, unless decoupled)
 * - Technology deployment (clean energy, EVs, pollution controls)
 * - Policy interventions (emission standards, vehicle restrictions)
 * - Natural variability (wildfires, dust storms)
 *
 * @param state - Air quality state
 * @param factors - Update factors
 */
export function updateAirQuality(
  state: AirQualityState,
  factors: {
    /** GDP growth rate (more activity → more emissions, unless decoupled) */
    gdpGrowth: number;

    /** Clean technology deployment (0-1, reduces emissions) */
    cleanTechDeployment: number;

    /** Policy stringency (0-1, emission controls) */
    policyStringency: number;

    /** Natural variability (wildfires, dust storms) */
    naturalVariability: number;

    /** AI capability (affects industrial efficiency) */
    aiCapability: number;
  }
): void {
  // Economic activity effect (more GDP → more emissions)
  // But decoupling occurs with clean tech (elasticity reduces over time)
  const emissionElasticity = 0.6 - factors.cleanTechDeployment * 0.4; // 0.6 → 0.2 with full clean tech
  const economicEffect = factors.gdpGrowth * emissionElasticity;

  // Clean technology effect (EVs, renewables, industrial efficiency)
  // AI accelerates deployment and improves efficiency
  const cleanTechReduction = -factors.cleanTechDeployment * 0.02 * (1 + factors.aiCapability * 0.5);

  // Policy effect (emission standards, vehicle restrictions, coal phase-out)
  const policyReduction = -factors.policyStringency * 0.015;

  // Natural variability (±5% random fluctuation from wildfires, dust, weather)
  const naturalEffect = factors.naturalVariability * 0.05;

  // Total change
  const totalChange = economicEffect + cleanTechReduction + policyReduction + naturalEffect;

  // Update PM2.5 (bounded: minimum 3 μg/m³, no upper bound for dystopia)
  state.pm25 = Math.max(3, state.pm25 * (1 + totalChange));

  // Update trend (12-month moving average)
  state.trend = state.trend * 0.9 + totalChange * 0.1;

  // Update health impact (WHO exposure-response function)
  updateHealthImpact(state);

  // Update economic cost
  updateEconomicCost(state);
}

/**
 * Update health impact from PM2.5 exposure
 *
 * Uses WHO exposure-response function (log-linear):
 * - Relative risk increases ~6% per 10 μg/m³ increase
 * - No safe threshold (linear-no-threshold model at low levels)
 *
 * Research: Burnett et al. (2018), WHO (2021)
 */
function updateHealthImpact(state: AirQualityState): void {
  // WHO exposure-response: RR = 1.06 per 10 μg/m³
  // Attributable fraction: AF = (RR - 1) / RR
  const excessPM25 = Math.max(0, state.pm25 - 5); // Excess above WHO guideline

  // Division by constant 10 is safe, but validate result
  const relativeRisk = assertFinite(
    Math.pow(1.06, excessPM25 / 10),
    {
      location: 'updateHealthImpact',
      valueName: 'relativeRisk',
      additionalInfo: { pm25: state.pm25, excessPM25 }
    }
  );

  // Division by relativeRisk - protect against zero (shouldn't happen with RR = 1.06^x >= 1)
  if (relativeRisk === 0) {
    throw new Error(
      `❌ Division by zero in updateHealthImpact\n` +
      `   relativeRisk = 0 (impossible with formula RR = 1.06^(excessPM25/10))\n` +
      `   PM2.5: ${state.pm25}, excessPM25: ${excessPM25}\n` +
      `   This indicates a calculation bug.`
    );
  }

  const attributableFraction = assertFinite(
    (relativeRisk - 1) / relativeRisk,
    {
      location: 'updateHealthImpact',
      valueName: 'attributableFraction',
      additionalInfo: { relativeRisk, pm25: state.pm25 }
    }
  );

  // Global baseline mortality ~60M deaths/year
  const globalMortality = 60_000_000;

  // Air pollution mortality (cardiopulmonary + lung cancer + stroke)
  state.healthImpact.deaths = assertFinite(
    globalMortality * attributableFraction * 0.25,
    {
      location: 'updateHealthImpact',
      valueName: 'deaths',
      additionalInfo: { globalMortality, attributableFraction, pm25: state.pm25 }
    }
  );

  // DALYs: ~20 DALYs per death (average)
  state.healthImpact.dalys = assertFinite(
    state.healthImpact.deaths * 20,
    {
      location: 'updateHealthImpact',
      valueName: 'dalys',
      additionalInfo: { deaths: state.healthImpact.deaths }
    }
  );

  // Mortality fraction - division by constant, but validate
  state.healthImpact.mortalityFraction = assertFinite(
    state.healthImpact.deaths / globalMortality,
    {
      location: 'updateHealthImpact',
      valueName: 'mortalityFraction',
      additionalInfo: { deaths: state.healthImpact.deaths, globalMortality }
    }
  );
}

/**
 * Update economic cost from air pollution
 *
 * Includes:
 * - Healthcare costs (treatment of respiratory/cardiovascular disease)
 * - Productivity loss (sick days, premature death)
 * - Crop damage (ozone, acid rain)
 *
 * Research: WHO (2024), World Bank (2020)
 * Global cost: ~$5-8 trillion/year (~4-6% GDP)
 */
function updateEconomicCost(state: AirQualityState): void {
  // Cost scales with PM2.5 exposure (log-linear)
  // Baseline: 35 μg/m³ → 4% GDP
  // Utopia: 5 μg/m³ → 0.5% GDP
  // Dystopia: 100 μg/m³ → 10% GDP
  const costPerUnitPM25 = 0.0008; // 0.08% GDP per μg/m³

  const rawCost = state.pm25 * costPerUnitPM25;
  const boundedCost = Math.max(0.005, Math.min(0.15, rawCost));

  state.economicCost = assertInRange(
    boundedCost,
    0,
    0.2, // Allow slight buffer above 0.15 for validation
    {
      location: 'updateEconomicCost',
      valueName: 'economicCost',
      additionalInfo: { pm25: state.pm25, rawCost, boundedCost }
    }
  );
}

/**
 * Calculate air quality score for Ecological paradigm
 *
 * Normalization: INVERT (low PM2.5 = high score)
 * - 0 μg/m³ → 100
 * - 5 μg/m³ → 90 (WHO guideline, utopia)
 * - 10 μg/m³ → 80 (WHO interim target 4)
 * - 25 μg/m³ → 50 (moderate)
 * - 50 μg/m³ → 0 (WHO interim target 1, dystopia)
 *
 * Formula: max(0, 100 - (pm25 / 0.5))
 *
 * @param pm25 - PM2.5 annual mean (μg/m³)
 * @returns Air quality score (0-100)
 *
 * @example
 * ```typescript
 * calculateAirQualityScore(5);   // → 90 (utopia)
 * calculateAirQualityScore(10);  // → 80 (safe)
 * calculateAirQualityScore(25);  // → 50 (moderate)
 * calculateAirQualityScore(50);  // → 0 (dystopia)
 * calculateAirQualityScore(100); // → 0 (extreme dystopia)
 * ```
 */
export function calculateAirQualityScore(pm25: number): number {
  // Invert: Low PM2.5 = high score
  return Math.max(0, 100 - pm25 / 0.5);
}

/**
 * Get air quality classification
 *
 * @param pm25 - PM2.5 annual mean (μg/m³)
 * @returns Classification string
 */
export function getAirQualityClassification(pm25: number): string {
  if (pm25 < 5) return 'UTOPIA (WHO guideline)';
  if (pm25 < 10) return 'SAFE (WHO interim target 4)';
  if (pm25 < 25) return 'MODERATE';
  if (pm25 < 50) return 'UNHEALTHY';
  if (pm25 < 100) return 'VERY UNHEALTHY (dystopia)';
  return 'HAZARDOUS (extreme dystopia)';
}
