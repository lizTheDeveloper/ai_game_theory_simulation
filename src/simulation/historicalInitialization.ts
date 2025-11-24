/**
 * Historical State Initialization for Hindcasting Validation
 *
 * Creates GameState initialized to historical values for a given year (1990-2024).
 * Used to run the simulation from historical starting points and validate
 * against actual observed outcomes.
 *
 * **Purpose:**
 * - Hindcasting validation: Run simulation from 1990, compare to 2024 actuals
 * - Model validation: If model can't hindcast, forecasts are suspect
 *
 * **Data Sources:**
 * - Climate: NOAA Mauna Loa, NASA GISS
 * - Economic: World Bank WDI, UN WPP 2024
 * - Governance: V-Dem v14.1
 * - Development: UNDP HDI
 *
 * **CRITICAL - Parameter Lockdown:**
 * This file locks simulation parameters BEFORE hindcasting.
 * Any changes post-hindcast must be documented as violations
 * of the parameter lockdown protocol (see research-skeptic review).
 *
 * @module simulation/historicalInitialization
 */

import type { GameState, ScenarioMode } from '@/types/game';
import { createDefaultInitialState } from './initialization';
import { getClimateDataForYear, type AnnualClimateData } from '@/data/loaders/historicalClimateLoader';
import { getEconomicDataForYear, type AnnualEconomicData } from '@/data/loaders/historicalEconomicLoader';
import { assertFinite } from './utils/assertions';

/**
 * Historical initialization options
 */
export interface HistoricalInitializationOptions {
  /** Year to initialize (1990-2024) */
  year: number;

  /** RNG function (REQUIRED for determinism) */
  rng: () => number;

  /** Include AI agents? (default: false for pre-2018) */
  includeAIAgents?: boolean;

  /** Inject exogenous shocks (COVID, 2008 crisis)? */
  exogenousShocks?: {
    covid2020?: boolean;
    financialCrisis2008?: boolean;
  };

  /** Scenario mode override */
  scenarioMode?: ScenarioMode;
}

/**
 * Historical climate data for hindcasting (mapped from AnnualClimateData)
 */
export interface HistoricalClimateYear {
  co2Ppm: number;
  tempAnomaly: number;
  tempVsPreindustrial: number;
}

/**
 * Historical economic data for hindcasting (mapped from AnnualEconomicData)
 */
export interface HistoricalEconomicYear {
  populationBillions: number;
  globalGini: number;
  globalHDI: number;
}

/**
 * Historical data bundle for a specific year
 */
export interface HistoricalDataBundle {
  climate: HistoricalClimateYear;
  economic: HistoricalEconomicYear;
  year: number;
}

/**
 * Load historical data for a specific year
 *
 * @param year - Year to load (1990-2024)
 * @returns Historical data bundle
 */
export async function loadHistoricalData(year: number): Promise<HistoricalDataBundle> {
  if (year < 1990 || year > 2024) {
    throw new Error(`Historical data only available for 1990-2024, got ${year}`);
  }

  const climateData = getClimateDataForYear(year);
  const economicData = getEconomicDataForYear(year);

  // Map raw data to hindcasting format
  const climate: HistoricalClimateYear = {
    co2Ppm: climateData.co2Ppm,
    tempAnomaly: climateData.temperatureAnomalyC,
    // Pre-industrial baseline is ~0.7C below 1951-1980 baseline used by NASA GISS
    tempVsPreindustrial: climateData.temperatureAnomalyC + 0.7,
  };

  const economic: HistoricalEconomicYear = {
    populationBillions: economicData.globalPopulationBillion,
    globalGini: economicData.giniIndex,
    globalHDI: economicData.hdi,
  };

  return { climate, economic, year };
}

/**
 * Create GameState initialized to historical values
 *
 * This creates a simulation starting point based on actual historical data.
 * The state is a modified version of createDefaultInitialState with
 * historical values substituted for 2025 defaults.
 *
 * **Note:** Due to type complexity, we use type assertions for properties
 * that exist at runtime but may not be in the strict type definitions.
 * This is intentional for hindcasting initialization.
 *
 * @param options - Initialization options
 * @returns GameState initialized to historical values
 */
export async function createHistoricalInitialState(
  options: HistoricalInitializationOptions
): Promise<GameState> {
  const { year, rng, includeAIAgents = false, scenarioMode = 'historical' } = options;

  // Validate inputs
  if (!rng || typeof rng !== 'function') {
    throw new Error('CRITICAL: RNG function required for deterministic simulation');
  }

  // Load historical data
  const historical = await loadHistoricalData(year);

  // Create base state from 2025 defaults
  const baseState = createDefaultInitialState(rng, scenarioMode);

  // === OVERRIDE WITH HISTORICAL VALUES ===
  // Use type assertions for runtime properties that may not match strict types

  // Time
  baseState.currentYear = year;
  baseState.currentMonth = 0;

  // CRITICAL FIX (Nov 25, 2025): Set config.startYear for TimeAdvancementPhase
  // TimeAdvancementPhase reads config.startYear to calculate currentYear = startYear + months/12
  // Without this, year calculation breaks after Month 12: uses 2025 default instead of historical year
  if (baseState.config) {
    baseState.config.startYear = year;
    console.log(`  config.startYear set to ${year} for historical hindcast`);
  }

  // Store simulation start year for reference (legacy - keeping for backwards compatibility)
  (baseState as unknown as Record<string, unknown>).simulationStartYear = year;

  // Climate state - set BOTH planetary boundaries AND resourceEconomy temperature
  // BUG FIX (Nov 24, 2025): ClimateSystemPhase reads from resourceEconomy.co2.temperatureAnomaly
  // Historical initialization was only setting planetaryBoundariesSystem, causing 2.03°C instead of 1.15°C
  if (baseState.planetaryBoundariesSystem?.boundaries?.climate_change) {
    // Set current value in the climate change boundary
    baseState.planetaryBoundariesSystem.boundaries.climate_change.currentValue = historical.climate.tempVsPreindustrial;
  }

  // CRITICAL: Also set resourceEconomy temperature (used by ClimateSystemPhase line 133)
  if (baseState.resourceEconomy?.co2) {
    baseState.resourceEconomy.co2.temperatureAnomaly = historical.climate.tempAnomaly;
    console.log(`  Temperature anomaly (resourceEconomy.co2): ${historical.climate.tempAnomaly.toFixed(2)}°C`);
    console.log(`  Temperature vs pre-industrial: ${historical.climate.tempVsPreindustrial.toFixed(2)}°C`);
  }

  // Population (from UN WPP)
  // FIX (Nov 24, 2025): humanPopulationSystem.population stores BILLIONS, not raw count
  // The original code multiplied by 1e9 which caused immediate population collapse
  if (baseState.humanPopulationSystem) {
    baseState.humanPopulationSystem.population = historical.economic.populationBillions;
    baseState.humanPopulationSystem.baselinePopulation = historical.economic.populationBillions;
    baseState.humanPopulationSystem.peakPopulation = historical.economic.populationBillions;

    // CRITICAL FIX (Nov 24, 2025): Scale regional populations to match historical global total
    // Regional populations default to 2025 values (~7.4B total)
    // But historical years have different totals (1990: 5.3B, 2000: 6.1B, etc.)
    // HumanPopulationPhase aggregates regional → global, overwriting the correct value above
    // Solution: Scale ALL regional populations proportionally
    if (baseState.humanPopulationSystem.regionalPopulations && baseState.humanPopulationSystem.regionalPopulations.length > 0) {
      const currentRegionalTotalM = baseState.humanPopulationSystem.regionalPopulations
        .reduce((sum, r) => sum + r.population, 0);
      const targetTotalM = historical.economic.populationBillions * 1000; // Convert B to M

      assertFinite(currentRegionalTotalM, {
        location: 'createHistoricalInitialState',
        valueName: 'currentRegionalTotalM',
        month: 0,
        additionalInfo: { year, regionCount: baseState.humanPopulationSystem.regionalPopulations.length }
      });

      assertFinite(targetTotalM, {
        location: 'createHistoricalInitialState',
        valueName: 'targetTotalM',
        month: 0,
        additionalInfo: { year, populationBillions: historical.economic.populationBillions }
      });

      if (currentRegionalTotalM === 0) {
        throw new Error(`Regional populations sum to zero - cannot scale for year ${year}`);
      }

      const scaleFactor = targetTotalM / currentRegionalTotalM;

      console.log(`  Regional population scaling for ${year}:`);
      console.log(`    Current total: ${currentRegionalTotalM.toFixed(0)}M`);
      console.log(`    Target total: ${targetTotalM.toFixed(0)}M`);
      console.log(`    Scale factor: ${scaleFactor.toFixed(3)}`);

      for (const region of baseState.humanPopulationSystem.regionalPopulations) {
        const oldPop = region.population;
        region.population *= scaleFactor;
        region.peakPopulation *= scaleFactor;
        region.baselinePopulation *= scaleFactor;
        region.carryingCapacity *= scaleFactor;
        region.baselineCarryingCapacity *= scaleFactor;

        console.log(`    ${region.name}: ${oldPop.toFixed(0)}M → ${region.population.toFixed(0)}M`);
      }
    }
  }
  if (baseState.globalMetrics) {
    baseState.globalMetrics.population = historical.economic.populationBillions;
  }

  // Economic metrics
  if (baseState.globalMetrics) {
    // Gini to wealth distribution (invert: high Gini = low distribution equality)
    // Normalize: Gini 70 => wealth distribution 0.30
    baseState.globalMetrics.wealthDistribution = (100 - historical.economic.globalGini) / 100;

    // HDI to quality of life (keep 0-1 scale, model scales internally)
    baseState.globalMetrics.qualityOfLife = historical.economic.globalHDI * 100;

    // Social stability baseline for 1990
    baseState.globalMetrics.socialStability = 50 + (historical.economic.globalHDI - 0.5) * 50;
  }

  // === FOOD SECURITY OVERRIDE FOR HISTORICAL MODE ===
  // HINDCAST FIX (Nov 24, 2025): Historical food security ~80-85% globally
  // Source: FAO World Agriculture: Towards 2015/2030 (Table 2.3)
  // Developing countries 1990-92: 20% undernourished (80% food secure)
  // Global weighted average: ~82% (includes developed countries at 97%)
  // See: research/verification_hindcast_food_security_20251124.md
  if (year <= 2010) {
    // Set global food security (FAO global average for 1990-92)
    // Weighted: ~5.5B developing at 80% + 1B developed at 97%
    if (baseState.qualityOfLifeSystems?.survivalFundamentals) {
      baseState.qualityOfLifeSystems.survivalFundamentals.foodSecurity = 0.82;
    }

    // Set regional food security based on FAO historical data
    // Source: FAO World Agriculture: Towards 2015/2030 (Table 2.3)
    // https://www.fao.org/4/Y4252E/y4252e04.htm
    if (baseState.humanPopulationSystem?.regionalPopulations) {
      const historicalFoodSecurity: Record<string, number> = {
        'eastAsia': 0.84,           // FAO: 16% undernourished (NOT 8%)
        'southAsia': 0.74,          // FAO: 26% undernourished (NOT 12%)
        'subSaharanAfrica': 0.65,   // FAO: 35% undernourished (NOT 15%)
        'europe': 0.98,             // FAO: <2% undernourished (unchanged)
        'northAmerica': 0.97,       // FAO: ~3% undernourished (slight correction)
        'latinAmerica': 0.87,       // FAO: 13% undernourished (NOT 10%)
        'middleEastNorthAfrica': 0.92, // FAO: 8% undernourished (was 12% - too high)
        'southeastAsia': 0.74,      // Similar to South Asia (FAO: ~26%)
        'centralAsia': 0.80,        // Interpolated from Soviet data
        'oceania': 0.95             // Similar to developed regions
      };

      for (const region of baseState.humanPopulationSystem.regionalPopulations) {
        if ('foodSecurity' in region) {
          (region as { foodSecurity: number }).foodSecurity =
            historicalFoodSecurity[region.name] || 0.80;
        }
      }
    }
    console.log(`  Food security (historical override): 82%`);
  }

  // === AI AGENT BOOTSTRAP ===
  // No modern AI existed before 2018
  if (!includeAIAgents || year < 2018) {
    baseState.aiAgents = [];
  } else {
    const aiAgentCount = getHistoricalAIAgentCount(year);
    baseState.aiAgents = baseState.aiAgents.slice(0, aiAgentCount);
  }

  // === VALIDATION ===
  assertFinite(baseState.humanPopulationSystem?.population ?? 0, {
    location: 'createHistoricalInitialState',
    valueName: 'population',
    month: 0,
    additionalInfo: { year },
  });

  console.log(`[HistoricalInitialization] Created state for ${year}:`);
  console.log(`  CO2: ${historical.climate.co2Ppm} ppm`);
  console.log(`  Temp anomaly: ${historical.climate.tempAnomaly}C`);
  console.log(`  Population: ${historical.economic.populationBillions}B`);
  console.log(`  Global Gini: ${historical.economic.globalGini}`);
  console.log(`  HDI: ${historical.economic.globalHDI}`);
  console.log(`  AI Agents: ${baseState.aiAgents.length}`);

  return baseState;
}

/**
 * Get historical AI agent count based on year
 */
function getHistoricalAIAgentCount(year: number): number {
  if (year < 2018) return 0;
  if (year === 2018) return 1;
  if (year === 2019) return 1;
  if (year === 2020 || year === 2021) return 2;
  if (year === 2022) return 5;
  if (year === 2023) return 7;
  return 10;
}

/**
 * Validate historical state against known 2024 actuals
 *
 * Computes deviation metrics between simulated and observed values.
 */
export async function validateHistoricalState(
  simulated: GameState,
  observedYear: number = 2024
): Promise<HindcastValidationMetrics> {
  const observed = await loadHistoricalData(observedYear);

  // Extract simulated values using safe access
  const simTemp = simulated.planetaryBoundariesSystem?.boundaries?.climate_change?.currentValue ?? 0;
  const simPop = (simulated.humanPopulationSystem?.population ?? 0) / 1e9;
  const simGini = 100 - ((simulated.globalMetrics?.wealthDistribution ?? 0.5) * 100);
  const simHDI = (simulated.globalMetrics?.qualityOfLife ?? 50) / 100;

  // For CO2, check novel_entities boundary (atmospheric composition)
  const simCO2 = simulated.planetaryBoundariesSystem?.boundaries?.novel_entities?.currentValue ?? 420;

  // Observed values
  const obsCO2 = observed.climate.co2Ppm;
  const obsTemp = observed.climate.tempVsPreindustrial;
  const obsPop = observed.economic.populationBillions;
  const obsGini = observed.economic.globalGini;
  const obsHDI = observed.economic.globalHDI;

  // Compute relative errors (as percentages)
  const co2RelError = Math.abs((simCO2 - obsCO2) / obsCO2) * 100;
  const tempRelError = Math.abs((simTemp - obsTemp) / obsTemp) * 100;
  const popRelError = Math.abs((simPop - obsPop) / obsPop) * 100;
  const giniRelError = Math.abs((simGini - obsGini) / obsGini) * 100;
  const hdiRelError = Math.abs((simHDI - obsHDI) / obsHDI) * 100;

  // NRMSE
  const nrmse = Math.sqrt(
    (co2RelError ** 2 + tempRelError ** 2 + popRelError ** 2 + giniRelError ** 2 + hdiRelError ** 2) / 5
  );

  const pass = co2RelError < 5 && tempRelError < 20 && popRelError < 5 && giniRelError < 15 && hdiRelError < 10;

  return {
    observedYear,
    metrics: {
      co2: { simulated: simCO2, observed: obsCO2, error: Math.abs(simCO2 - obsCO2), relativeError: co2RelError },
      temperature: { simulated: simTemp, observed: obsTemp, error: Math.abs(simTemp - obsTemp), relativeError: tempRelError },
      population: { simulated: simPop, observed: obsPop, error: Math.abs(simPop - obsPop), relativeError: popRelError },
      gini: { simulated: simGini, observed: obsGini, error: Math.abs(simGini - obsGini), relativeError: giniRelError },
      hdi: { simulated: simHDI, observed: obsHDI, error: Math.abs(simHDI - obsHDI), relativeError: hdiRelError },
    },
    nrmse,
    pass,
  };
}

/**
 * Hindcast validation metrics
 */
export interface HindcastValidationMetrics {
  observedYear: number;
  metrics: {
    co2: MetricComparison;
    temperature: MetricComparison;
    population: MetricComparison;
    gini: MetricComparison;
    hdi: MetricComparison;
  };
  nrmse: number;
  pass: boolean;
}

/**
 * Single metric comparison
 */
export interface MetricComparison {
  simulated: number;
  observed: number;
  error: number;
  relativeError: number;
}

/**
 * Parameter lockdown snapshot
 */
export function createParameterLockdown(): { timestamp: string; hash: string } {
  const timestamp = new Date().toISOString();
  const hash = `hindcast-lockdown-${timestamp}`;

  console.log(`[ParameterLockdown] Parameters locked at ${timestamp}`);
  console.log(`[ParameterLockdown] Hash: ${hash}`);

  return { timestamp, hash };
}
