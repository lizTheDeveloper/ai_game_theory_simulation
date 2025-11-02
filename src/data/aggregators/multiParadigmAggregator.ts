/**
 * Multi-Paradigm Aggregator
 *
 * Combines data from all 4 loaders (V-Dem, UNDP, Ecological, WVS) into complete
 * Multi-Paradigm DUI system with divergence tracking and outcome classification.
 *
 * **Architecture:**
 * - Tier 2A: 3 driving paradigms (Western, Development, Ecological)
 * - Tier 2B: 1 diagnostic lens (Indigenous)
 * - Country matching across datasets (not all countries in all datasets)
 * - Global + country-level scores
 *
 * @module data/aggregators/multiParadigmAggregator
 */

import { vdemLoader } from '../loaders/vdemLoader';
import { undpLoader } from '../loaders/undpLoader';
import { ecologicalLoader } from '../loaders/ecologicalLoader';
import { wvsLoader } from '../loaders/wvsLoader';

import { normalizeVDemBatch } from '../normalizers/vdemNormalizer';
import { normalizeUNDPBatch } from '../normalizers/undpNormalizer';
import { normalizeEcologicalBatch } from '../normalizers/ecologicalNormalizer';
import { normalizeWVSBatch } from '../normalizers/wvsNormalizer';

import { calculateDivergence } from './divergenceCalculator';
import { calculateCorrelations } from './correlationTracker';
import { classifyOutcome } from './outcomeClassifier';

import type {
  MultiParadigmDUI,
  CountryParadigmScores,
  ParadigmScore,
  DiagnosticLens,
  ConfidenceLevel,
} from '@/types/multiParadigmDUI';

/**
 * Aggregated paradigm data (output from aggregation)
 */
export interface AggregatedParadigmData {
  /** Global Multi-Paradigm DUI (uses global boundaries for ecological) */
  global: MultiParadigmDUI;

  /** Country-level paradigm scores (unique countries from all datasets) */
  countries: CountryParadigmScores[];

  /** Data coverage summary */
  coverage: {
    /** Total unique countries across all datasets */
    totalCountries: number;

    /** Countries with V-Dem data (Western Liberal) */
    vdemCountries: number;

    /** Countries with UNDP HDI data */
    hdiCountries: number;

    /** Countries with UNDP MPI data */
    mpiCountries: number;

    /** Countries with Ecological Footprint data */
    footprintCountries: number;

    /** Countries with Air Quality data */
    airQualityCountries: number;

    /** Countries with WVS data (Indigenous proxies) */
    wvsCountries: number;

    /** Countries with all 4 paradigms */
    fullCoverageCountries: number;
  };
}

/**
 * Load and aggregate all paradigm data
 *
 * @returns Complete Multi-Paradigm DUI with global + country-level scores
 */
export async function aggregateParadigms(): Promise<AggregatedParadigmData> {
  console.log('\n=== Multi-Paradigm Aggregator ===\n');

  // Load all data sources
  console.log('Loading data from all 4 loaders...');
  const vdemData = await vdemLoader.load();
  const undpData = await undpLoader.load();
  const ecologicalData = await ecologicalLoader.load();
  const wvsData = await wvsLoader.load();

  console.log(`Loaded: ${vdemData.countries.length} V-Dem, ${undpData.hdi.countries.length} HDI, ${undpData.mpi.countries.length} MPI, ${ecologicalData.footprint.countries.length} Footprint, ${ecologicalData.airQuality.countries.length} Air Quality, ${wvsData.countries.length} WVS`);

  // Normalize all data
  const normalizedVDem = normalizeVDemBatch(vdemData.countries);
  const normalizedUNDP = normalizeUNDPBatch(undpData.hdi.countries, undpData.mpi.countries);
  const normalizedEcological = normalizeEcologicalBatch(
    ecologicalData.boundaries,
    ecologicalData.footprint.countries,
    ecologicalData.airQuality.countries
  );
  const normalizedWVS = normalizeWVSBatch(wvsData.countries);

  // Get all unique country codes
  const allCountryCodes = new Set<string>([
    ...normalizedVDem.map(v => v.countryCode),
    ...normalizedUNDP.map(u => u.countryCode),
    ...normalizedEcological.map(e => e.countryCode),
    ...normalizedWVS.map(w => w.countryCode),
  ]);

  console.log(`Total unique countries: ${allCountryCodes.size}`);

  // Build country-level scores
  const countries: CountryParadigmScores[] = [];

  for (const countryCode of allCountryCodes) {
    const vdem = normalizedVDem.find(v => v.countryCode === countryCode);
    const undp = normalizedUNDP.find(u => u.countryCode === countryCode);
    const ecological = normalizedEcological.find(e => e.countryCode === countryCode);
    const wvs = normalizedWVS.find(w => w.countryCode === countryCode);

    // Get country name (from any available dataset)
    const countryName = vdem?.countryCode || undp?.countryCode || ecological?.countryCode || wvs?.countryCode || countryCode;

    // Build scores (use 50 as neutral if data missing)
    const scores = {
      western: vdem?.westernLiberalScore ?? 50,
      development: undp?.developmentScore ?? 50,
      ecological: ecological?.ecologicalScore ?? 50,
      indigenous: wvs?.indigenousScore ?? 50,
    };

    // Calculate divergence for this country
    const divergence = Math.sqrt(
      (Math.pow(scores.western - (scores.western + scores.development + scores.ecological + scores.indigenous) / 4, 2) +
       Math.pow(scores.development - (scores.western + scores.development + scores.ecological + scores.indigenous) / 4, 2) +
       Math.pow(scores.ecological - (scores.western + scores.development + scores.ecological + scores.indigenous) / 4, 2) +
       Math.pow(scores.indigenous - (scores.western + scores.development + scores.ecological + scores.indigenous) / 4, 2)) / 4
    );

    // Determine dominant paradigm
    const maxScore = Math.max(scores.western, scores.development, scores.ecological, scores.indigenous);
    const minScore = Math.min(scores.western, scores.development, scores.ecological, scores.indigenous);
    const range = maxScore - minScore;
    const maxCount = [scores.western, scores.development, scores.ecological, scores.indigenous].filter(s => s === maxScore).length;

    let dominantParadigm: 'western' | 'development' | 'ecological' | 'indigenous' | 'contested';

    // Contested if: (1) High divergence (range >40), OR (2) Multiple utopias AND dystopias
    const utopias = [
      scores.western >= 80,
      scores.development >= 80,
      scores.ecological >= 80,
      scores.indigenous >= 80,
    ].filter(Boolean).length;

    const dystopias = [
      scores.western <= 30,
      scores.development <= 30,
      scores.ecological <= 30,
      scores.indigenous <= 30,
    ].filter(Boolean).length;

    if (range > 40 || (utopias > 0 && dystopias > 0)) {
      dominantParadigm = 'contested';
    } else if (maxCount > 1) {
      // Tied for highest score
      dominantParadigm = 'contested';
    } else if (scores.western === maxScore) {
      dominantParadigm = 'western';
    } else if (scores.development === maxScore) {
      dominantParadigm = 'development';
    } else if (scores.ecological === maxScore) {
      dominantParadigm = 'ecological';
    } else {
      dominantParadigm = 'indigenous';
    }

    // Determine overall confidence
    let confidence: ConfidenceLevel;
    if (vdem && undp && ecological && wvs) {
      confidence = 'HIGH';
    } else if ((vdem && undp) || (vdem && ecological) || (undp && ecological)) {
      confidence = 'MEDIUM';
    } else {
      confidence = 'LOW';
    }

    // Check if this country is in the 30-country government system
    // Government system countries (from @political-science/government-agents package)
    // These are the exact 30 countries loaded by loadCountries() from the package
    const governmentSystemCountries = new Set([
      'USA', 'CHN', 'IND', 'DEU', 'GBR', 'FRA', 'JPN', 'ITA', 'BRA', 'CAN',
      'RUS', 'KOR', 'AUS', 'MEX', 'IDN', 'TUR', 'NLD', 'SAU', 'CHE', 'POL',
      'SWE', 'ARG', 'NOR', 'SGP', 'ISR', 'ZAF', 'ARE', 'EGY', 'IRN', 'TWN'
    ]);

    const hasGovernmentData = governmentSystemCountries.has(countryCode);

    countries.push({
      countryCode,
      countryName,
      scores,
      divergence,
      dominantParadigm,
      dataQuality: {
        hasGovernmentData,
        hasWVSData: !!wvs,
        confidence,
      },
    });
  }

  // Build global paradigm scores
  const westernGlobal = buildWesternParadigm(normalizedVDem);
  const developmentGlobal = buildDevelopmentParadigm(normalizedUNDP);
  const ecologicalGlobal = buildEcologicalParadigm(normalizedEcological);
  const indigenousGlobal = buildIndigenousLens(normalizedWVS);

  // Calculate global divergence
  const globalScores = {
    western: westernGlobal.value,
    development: developmentGlobal.value,
    ecological: ecologicalGlobal.value,
    indigenous: indigenousGlobal.value,
  };

  const divergence = calculateDivergence(globalScores, []);

  // Calculate correlations across countries
  const correlations = calculateCorrelations(countries);

  // Classify outcome
  const outcome = classifyOutcome(globalScores);

  // Build global Multi-Paradigm DUI
  const global: MultiParadigmDUI = {
    paradigmScores: {
      western: westernGlobal,
      development: developmentGlobal,
      ecological: ecologicalGlobal,
    },
    diagnosticLenses: {
      indigenous: indigenousGlobal,
    },
    divergence,
    correlations,
    outcome,
    history: [],
  };

  // Calculate coverage stats
  const coverage = {
    totalCountries: allCountryCodes.size,
    vdemCountries: normalizedVDem.length,
    hdiCountries: normalizedUNDP.length,
    mpiCountries: undpData.mpi.countries.length,
    footprintCountries: ecologicalData.footprint.countries.length,
    airQualityCountries: ecologicalData.airQuality.countries.length,
    wvsCountries: normalizedWVS.length,
    fullCoverageCountries: countries.filter(c =>
      c.dataQuality.confidence === 'HIGH'
    ).length,
  };

  console.log(`\nGlobal scores: Western=${global.paradigmScores.western.value.toFixed(1)}, Development=${global.paradigmScores.development.value.toFixed(1)}, Ecological=${global.paradigmScores.ecological.value.toFixed(1)}, Indigenous=${global.diagnosticLenses.indigenous.value.toFixed(1)}`);
  console.log(`Divergence: ${global.divergence.overall.toFixed(1)} (maxRange=${global.divergence.maxRange.toFixed(1)})`);
  console.log(`Outcome: ${global.outcome.label}`);

  return {
    global,
    countries,
    coverage,
  };
}

/**
 * Build Western Liberal paradigm score from normalized V-Dem data
 *
 * Aggregates across all countries using geometric mean.
 */
function buildWesternParadigm(
  normalizedVDem: Array<{ countryCode: string; westernLiberalScore: number; indicators: any[] }>
): ParadigmScore & { drivesSimulation: true } {
  // Calculate global average using geometric mean
  const MIN_FLOOR = 0.1;
  const product = normalizedVDem.reduce((acc, v) => {
    const floored = Math.max(v.westernLiberalScore, MIN_FLOOR);
    return acc * (floored / 100);
  }, 1);
  const globalScore = Math.pow(product, 1 / normalizedVDem.length) * 100;

  // Aggregate indicators (average across all countries)
  const allIndicators = normalizedVDem.flatMap(v => v.indicators);
  const indicatorIds = [...new Set(allIndicators.map(i => i.id))];

  const indicators = indicatorIds.map(id => {
    const matching = allIndicators.filter(i => i.id === id);
    const avgValue = matching.reduce((sum, i) => sum + i.value, 0) / matching.length;

    return {
      id,
      name: matching[0]?.name || id,
      value: avgValue,
      weight: matching[0]?.weight || 0.5,
      confidence: 'HIGH' as ConfidenceLevel,
      hasData: true,
    };
  });

  return {
    value: globalScore,
    confidence: 'HIGH',
    dataAvailability: 1.0,
    indicators,
    derivedFrom: ['V-Dem 2024'],
    drivesSimulation: true,
  };
}

/**
 * Build Development paradigm score from normalized UNDP data
 */
function buildDevelopmentParadigm(
  normalizedUNDP: Array<{ countryCode: string; developmentScore: number; indicators: any[] }>
): ParadigmScore & { drivesSimulation: true } {
  // Calculate global average using geometric mean
  const MIN_FLOOR = 0.1;
  const product = normalizedUNDP.reduce((acc, u) => {
    const floored = Math.max(u.developmentScore, MIN_FLOOR);
    return acc * (floored / 100);
  }, 1);
  const globalScore = Math.pow(product, 1 / normalizedUNDP.length) * 100;

  // Aggregate indicators
  const allIndicators = normalizedUNDP.flatMap(u => u.indicators);
  const indicatorIds = [...new Set(allIndicators.map(i => i.id))];

  const indicators = indicatorIds.map(id => {
    const matching = allIndicators.filter(i => i.id === id);
    const avgValue = matching.reduce((sum, i) => sum + i.value, 0) / matching.length;

    return {
      id,
      name: matching[0]?.name || id,
      value: avgValue,
      weight: matching[0]?.weight || 0.5,
      confidence: 'HIGH' as ConfidenceLevel,
      hasData: true,
    };
  });

  return {
    value: globalScore,
    confidence: 'HIGH',
    dataAvailability: 1.0,
    indicators,
    derivedFrom: ['UNDP HDI 2024', 'UNDP MPI 2024'],
    drivesSimulation: true,
  };
}

/**
 * Build Ecological paradigm score from normalized ecological data
 */
function buildEcologicalParadigm(
  normalizedEcological: Array<{ countryCode: string; ecologicalScore: number; indicators: any[] }>
): ParadigmScore & { drivesSimulation: true } {
  // Calculate global average using arithmetic mean
  // FIX (Nov 2, 2025): Changed from geometric mean (over-penalized outliers)
  // to arithmetic mean per planetary boundaries aggregation standards
  const weightedSum = normalizedEcological.reduce((sum, e) => {
    return sum + e.ecologicalScore;
  }, 0);
  const globalScore = weightedSum / normalizedEcological.length;

  // Aggregate indicators
  const allIndicators = normalizedEcological.flatMap(e => e.indicators);
  const indicatorIds = [...new Set(allIndicators.map(i => i.id))];

  const indicators = indicatorIds.map(id => {
    const matching = allIndicators.filter(i => i.id === id);
    const avgValue = matching.reduce((sum, i) => sum + i.value, 0) / matching.length;

    return {
      id,
      name: matching[0]?.name || id,
      value: avgValue,
      weight: matching[0]?.weight || 0.4,
      confidence: (matching[0]?.confidence || 'MEDIUM') as ConfidenceLevel,
      hasData: true,
    };
  });

  return {
    value: globalScore,
    confidence: 'MEDIUM',
    dataAvailability: 1.0,
    indicators,
    derivedFrom: ['Richardson et al. 2023', 'Global Footprint Network 2024', 'WHO 2024'],
    drivesSimulation: true,
  };
}

/**
 * Build Indigenous diagnostic lens from normalized WVS data
 */
function buildIndigenousLens(
  normalizedWVS: Array<{ countryCode: string; indigenousScore: number; indicators: any[] }>
): DiagnosticLens {
  // Calculate global average using geometric mean
  const MIN_FLOOR = 0.1;
  const product = normalizedWVS.reduce((acc, w) => {
    const floored = Math.max(w.indigenousScore, MIN_FLOOR);
    return acc * (floored / 100);
  }, 1);
  const globalScore = Math.pow(product, 1 / normalizedWVS.length) * 100;

  // Aggregate indicators
  const allIndicators = normalizedWVS.flatMap(w => w.indicators);
  const indicatorIds = [...new Set(allIndicators.map(i => i.id))];

  const indicators = indicatorIds.map(id => {
    const matching = allIndicators.filter(i => i.id === id);
    const avgValue = matching.reduce((sum, i) => sum + i.value, 0) / matching.length;

    return {
      id,
      name: matching[0]?.name || id,
      value: avgValue,
      weight: matching[0]?.weight || 0.33,
      confidence: 'MEDIUM' as ConfidenceLevel,
      hasData: true,
    };
  });

  // Calculate derivation percentages based on data coverage
  // WVS covers 28 countries out of ~200 (14%)
  // During simulation, remaining 86% derive from social cohesion system
  // At initialization (this phase), we only have proxy data from WVS
  const wvsCoverage = normalizedWVS.length; // ~28 countries
  const totalCountries = 200; // Approximate total countries
  const proxyPercentage = (wvsCoverage / totalCountries) * 100; // ~14%
  const simulationPercentage = 100 - proxyPercentage; // ~86%

  return {
    value: globalScore,
    confidence: 'MEDIUM',
    dataAvailability: proxyPercentage / 100, // ~0.14
    indicators,
    derivedFrom: ['WVS Wave 7', 'Simulation: Social Cohesion System'],
    drivesSimulation: false,
    caveat: 'Indigenous paradigm uses proxy indicators (social trust, community importance, civic participation). Only 28 countries have WVS data. Remaining countries derive from simulation mechanics (social cohesion).',
    derivation: {
      fromSimulation: simulationPercentage, // ~86% - updated from social cohesion during simulation
      fromProxies: proxyPercentage,         // ~14% - WVS Wave 7 data
      estimated: 0,
    },
  };
}

/**
 * Get paradigm score for a specific country
 *
 * Convenience function for looking up country-level scores.
 *
 * @param aggregated - Aggregated paradigm data
 * @param countryCode - ISO 3166-1 alpha-3 country code
 * @returns Country paradigm scores, or undefined if not found
 */
export function getCountryScores(
  aggregated: AggregatedParadigmData,
  countryCode: string
): CountryParadigmScores | undefined {
  return aggregated.countries.find(c => c.countryCode === countryCode);
}

/**
 * Get all countries with contested paradigms (divergence >25 OR range >40 OR utopia+dystopia conflict)
 *
 * @param aggregated - Aggregated paradigm data
 * @returns Countries with high paradigm divergence
 */
export function getContestedCountries(aggregated: AggregatedParadigmData): CountryParadigmScores[] {
  return aggregated.countries.filter(c => c.dominantParadigm === 'contested');
}
