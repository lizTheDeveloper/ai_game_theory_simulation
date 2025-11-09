/**
 * Multi-Paradigm DUI Initialization
 *
 * Loads baseline paradigm scores from Phase 5 aggregator and initializes
 * Multi-Paradigm DUI for simulation tracking.
 *
 * **Fallback Strategy:**
 * - Attempt to load from Phase 5 aggregator (cached data)
 * - If cache unavailable, use neutral scores (50/50/50/50)
 * - Log warnings for missing data
 *
 * @module simulation/multiParadigmDUIInit
 */

import { aggregateParadigms } from '../data/aggregators/multiParadigmAggregator';
import { assertFinite } from './utils/assertions';
import type { MultiParadigmDUI } from '../types/multiParadigmDUI';
import type { RNGFunction } from '../types/game';

/**
 * Initialize Multi-Paradigm DUI from data loaders
 *
 * Loads baseline paradigm scores from V-Dem, UNDP, Ecological, WVS data.
 * Falls back to neutral scores (50/50/50/50) if data unavailable.
 *
 * @param rng - Random number generator (for uncertainty sampling, unused for now)
 * @returns Initialized Multi-Paradigm DUI
 */
export async function initializeMultiParadigmDUI(
  rng: RNGFunction
): Promise<MultiParadigmDUI> {
  try {
    console.log('[Multi-Paradigm DUI] Initializing from Phase 5 aggregator...');

    // Load baseline from Phase 5 aggregator
    const aggregated = await aggregateParadigms();

    console.log(`[Multi-Paradigm DUI] Loaded baseline: Western=${aggregated.global.paradigmScores.western.value.toFixed(1)}, Development=${aggregated.global.paradigmScores.development.value.toFixed(1)}, Ecological=${aggregated.global.paradigmScores.ecological.value.toFixed(1)}, Indigenous=${aggregated.global.diagnosticLenses.indigenous.value.toFixed(1)}`);

    // Return global Multi-Paradigm DUI (will be updated during simulation)
    return aggregated.global;
  } catch (error) {
    console.warn('[Multi-Paradigm DUI] Failed to load baseline data, using neutral scores:', error);

    // Fallback: neutral scores (50/50/50/50)
    return createNeutralMultiParadigmDUI();
  }
}

/**
 * Create neutral Multi-Paradigm DUI (fallback when data unavailable)
 *
 * @returns Multi-Paradigm DUI with neutral scores (50/50/50/50)
 */
function createNeutralMultiParadigmDUI(): MultiParadigmDUI {
  const neutralScore = 50;

  return {
    paradigmScores: {
      western: {
        value: neutralScore,
        confidence: 'LOW',
        dataAvailability: 0,
        indicators: [],
        derivedFrom: ['Fallback: No data available'],
        drivesSimulation: true,
      },
      development: {
        value: neutralScore,
        confidence: 'LOW',
        dataAvailability: 0,
        indicators: [],
        derivedFrom: ['Fallback: No data available'],
        drivesSimulation: true,
      },
      ecological: {
        value: neutralScore,
        confidence: 'LOW',
        dataAvailability: 0,
        indicators: [],
        derivedFrom: ['Fallback: No data available'],
        drivesSimulation: true,
      },
    },
    diagnosticLenses: {
      indigenous: {
        value: neutralScore,
        confidence: 'LOW',
        dataAvailability: 0,
        indicators: [],
        derivedFrom: ['Fallback: No data available'],
        drivesSimulation: false,
        caveat: 'No baseline data available. Using neutral scores.',
        derivation: {
          fromSimulation: 100,
          fromProxies: 0,
          estimated: 0,
        },
      },
    },
    divergence: {
      overall: 0,
      maxRange: 0,
      pairwise: {
        western_development: 0,
        western_ecological: 0,
        western_indigenous: 0,
        development_ecological: 0,
        development_indigenous: 0,
        ecological_indigenous: 0,
      },
      trend: 'STABLE',
    },
    correlations: {
      western_development: 0,
      western_ecological: 0,
      western_indigenous: 0,
      development_ecological: 0,
      development_indigenous: 0,
      ecological_indigenous: 0,
    },
    outcome: {
      utopiasCount: 0,
      dystopiasCount: 0,
      contested: false,
      label: 'Multi-Paradigm Hybrid (neutral baseline)',
    },
    history: [],
  };
}
