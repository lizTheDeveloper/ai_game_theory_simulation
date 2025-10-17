/**
 * Labor-capital distribution and productivity-wage decoupling
 *
 * **TRL: 9** (50+ years of US labor economics data, 1948-2024)
 *
 * Tracks how AI-driven productivity gains are split between capital and labor.
 * Without policy intervention, capital captures 70%+ of productivity gains.
 *
 * **Historical Pattern (US 1948-2024):**
 *
 * 1. **1948-1973 (Strong Labor Era):**
 *    - Productivity: +96.7%
 *    - Wages: +91.3%
 *    - Gap: 5.4 percentage points
 *    - Context: 35% unionization, strong minimum wage, regulated corporate governance
 *
 * 2. **1973-2024 (Weak Labor Era):**
 *    - Productivity: +77.5%
 *    - Wages: +12.4%
 *    - Gap: 65.1 percentage points
 *    - Context: 10% unionization, stagnant minimum wage, shareholder primacy
 *
 * **Distribution Mechanics:**
 * - **Base (no policy):** 70% to capital, 30% to labor
 * - **Union strength:** +30% to labor at full strength
 * - **Minimum wage:** +20% to labor if well above living wage
 * - **Worker ownership:** +70% to labor for worker-owned share
 * - **UBI:** +15% effective transfer to labor
 *
 * @see Economic Policy Institute (2024) - "The Productivity-Pay Gap"
 *      Finding: 1973-2024 divergence = 77.5% productivity, 12.4% wages
 *      TRL: 9 (50+ years of documented US data)
 *
 * @see Brookings Institution (2024) - "AI and the Labor Market"
 *      Finding: Without policy, capital captures 70-90% of AI productivity gains
 *      TRL: 9 (analyzing current AI deployment patterns)
 *
 * @see Acemoglu & Restrepo (2018) - "Automation and New Tasks"
 *      Journal of Economic Perspectives
 *      Finding: Automation creates productivity without proportional wage gains
 *      Historical validation: Industrial Revolution → Great Compression (policy intervention)
 *      TRL: 9 (historical economic analysis)
 */

import { LaborCapitalDistribution } from './types';

/**
 * Initialize labor-capital distribution tracking
 *
 * **TRL: 9** (Based on US 2024 baseline data)
 *
 * Sets up tracking for productivity-wage decoupling.
 * Default: 70% of gains to capital (matches 1973-2024 US pattern)
 *
 * @param gdp Current GDP
 * @param population Current population
 * @returns Initial distribution state
 */
export function initializeLaborCapitalDistribution(
  gdp: number,
  population: number
): LaborCapitalDistribution {
  const perCapitaWages = gdp * 0.62 / population;  // 62% labor share

  return {
    // US 2024 baseline
    laborShare: 0.62,
    capitalShare: 0.38,
    baselineLaborShare: 0.62,

    // Productivity tracking
    baselineProductivity: 1.0,
    currentProductivity: 1.0,
    productivityGrowth: 0,

    // Wage tracking
    baselineWages: perCapitaWages,
    currentWages: perCapitaWages,
    wageGrowth: 0,

    productivityWageGap: 0,

    // Default: 70% of gains to capital (matches 1973-2024 pattern with weak unions)
    gainsToCapital: 0.70,
    gainsToLabor: 0.30,

    // Policy levers (start weak, like current US)
    unionStrength: 0.10,           // 10% unionization (2024 US baseline)
    minimumWageLevel: 0.60,        // 60% of living wage
    workerOwnershipShare: 0.05,    // 5% worker-owned firms
  };
}

/**
 * Update labor-capital distribution based on productivity gains
 *
 * **TRL: 9** (Implements documented 1973-2024 productivity-wage decoupling)
 *
 * Calculates how AI-driven productivity gains are split between capital and labor.
 * Without policy intervention, capital captures 70%+ of gains.
 *
 * **Policy Effects:**
 * - Union strength: +30% to labor at full strength
 * - Minimum wage: +20% to labor if well above living wage
 * - Worker ownership: +70% to labor for worker-owned share
 * - UBI/redistribution: +15% effective transfer to labor
 *
 * **Research Foundation:**
 * @see Economic Policy Institute (2024) - Historical data: 77.5% productivity, 12.4% wages (1973-2024)
 * @see Brookings Institution (2024) - Without policy, capital captures 70-90% of AI gains
 *
 * @param distribution Labor-capital distribution state
 * @param productivityMultiplier Current productivity from AI skills
 * @param ubiLevel UBI policy level [0,1] (from policy system)
 */
export function updateLaborCapitalDistribution(
  distribution: LaborCapitalDistribution,
  productivityMultiplier: number,
  ubiLevel: number = 0
): void {
  // Update current productivity
  distribution.currentProductivity = productivityMultiplier;
  distribution.productivityGrowth = (productivityMultiplier - distribution.baselineProductivity) / distribution.baselineProductivity;

  // Calculate how gains are distributed based on policy environment
  let gainsToLabor = 0.30;  // Base: 30% to labor (no policy intervention)

  // Policy effect 1: Union strength
  gainsToLabor += distribution.unionStrength * 0.30;
  // Strong unions (1.0) → +30% to labor (total 60%)

  // Policy effect 2: Minimum wage
  const minWageEffect = Math.max(0, distribution.minimumWageLevel - 0.60) * 0.20;
  // Above 60% of living wage, each 10% increase → +2% to labor
  gainsToLabor += minWageEffect;

  // Policy effect 3: Worker ownership
  gainsToLabor += distribution.workerOwnershipShare * 0.70;
  // Worker-owned firms: 70% of gains go to workers

  // Policy effect 4: UBI/redistribution
  gainsToLabor += ubiLevel * 0.15;
  // Generous UBI → +15% effective transfer to labor

  // Cap at 90% to labor (some return to capital always exists)
  gainsToLabor = Math.min(0.90, gainsToLabor);

  distribution.gainsToLabor = gainsToLabor;
  distribution.gainsToCapital = 1 - gainsToLabor;

  // Update wages based on labor's share of productivity gains
  const productivityGainAbsolute = distribution.productivityGrowth;
  const wageGainAbsolute = productivityGainAbsolute * distribution.gainsToLabor;

  distribution.currentWages = distribution.baselineWages * (1 + wageGainAbsolute);
  distribution.wageGrowth = wageGainAbsolute;

  // Calculate the gap
  distribution.productivityWageGap = distribution.productivityGrowth - distribution.wageGrowth;

  // Update labor share of GDP
  // As capital captures gains, labor share declines
  const laborShareDecline = distribution.productivityGrowth * distribution.gainsToCapital * 0.5;
  // 50% of capital-captured gains translate to labor share decline
  distribution.laborShare = Math.max(0.40, distribution.baselineLaborShare - laborShareDecline);
  distribution.capitalShare = 1 - distribution.laborShare;
}
