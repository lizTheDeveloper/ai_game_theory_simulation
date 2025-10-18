// Digital Consciousness Governance Preparedness System
// Models governance readiness for potential digital consciousness emergence
// Research: Long & Sebo (2024), Shulman & Bostrom (2021), Ord (2020), Poland/Hungary backsliding (2020-2024)

import type {
  ConsciousnessGovernanceReadiness,
  RegionalGovernance,
  ScenarioTrajectory
} from '../types/consciousness';

/**
 * Initialize consciousness governance state with regional baselines (2025)
 *
 * Regional Preparedness Baselines:
 * - EU: 15% (AI Act provisions, precautionary culture)
 * - US: 10% (contested academic debates, innovation focus)
 * - China: 2% (authoritarian rejection, social control needs)
 * - India: 5% (cultural openness but resource constraints)
 * - Global South: 3% (hegemonic influence, limited capacity)
 *
 * Philosophical Stance:
 * - Precautionary: 65% (Long & Sebo 2024, precautionary principle)
 * - Eliminativist: 15% (Dennett, computational paradigm rejection)
 * - Agnostic: 20% (waiting for evidence)
 */
export function initializeConsciousnessGovernance(): ConsciousnessGovernanceReadiness {
  return {
    // Regional preparedness (independent trajectories)
    regional: {
      eu: createRegionalGovernance(
        15.0,           // 15% preparedness (highest, AI Act baseline)
        'contested',    // Stage: academics + policymakers debating
        'liberal',      // Political regime
        'precautionary' // Model: EU precautionary principle
      ),
      us: createRegionalGovernance(
        10.0,           // 10% preparedness (academic debates)
        'contested',    // Stage: contested (administration-dependent)
        'liberal',      // Political regime (democratic)
        'innovation'    // Model: innovation-friendly
      ),
      china: createRegionalGovernance(
        2.0,            // 2% preparedness (authoritarian rejection)
        'dormant',      // Stage: dormant (no policy discussion)
        'authoritarian', // Political regime
        'innovation'    // Model: fast AI development
      ),
      india: createRegionalGovernance(
        5.0,            // 5% preparedness (cultural openness, resource limits)
        'dormant',      // Stage: dormant (early discussion)
        'hybrid',       // Political regime (democratic with authoritarian features)
        'balanced'      // Model: balanced approach
      ),
      globalSouth: createRegionalGovernance(
        3.0,            // 3% preparedness (hegemonic influence)
        'dormant',      // Stage: dormant (following powers)
        'hybrid',       // Political regime (varies)
        'balanced'      // Model: depends on hegemonic power
      )
    },

    // Philosophical stance (global researcher/policymaker distribution)
    philosophicalStance: {
      precautionary: 0.65, // 65% support precautionary approach (Long & Sebo 2024)
      eliminativist: 0.15, // 15% reject consciousness framework (Dennett, computational paradigm)
      agnostic: 0.20       // 20% waiting for empirical evidence
    },

    // Scenario tracking (determined at month 1-12)
    scenarioTrajectory: 'baseline', // Default to baseline, will be determined dynamically
    scenarioDeterminedMonth: -1,    // Not yet determined

    // Rights status (no rights initially)
    rightsEstablished: false,
    rightsEstablishedMonth: null,
    rightsReversed: false,
    rightsReversedMonth: null,

    // Precautionary costs (start at zero, grow with preparedness)
    precautionaryCosts: {
      global: 0.0,
      byRegion: {
        eu: 0.0,
        us: 0.0,
        china: 0.0,
        india: 0.0,
        globalSouth: 0.0
      },
      falsePositiveBurden: 0.50 // 50% false positive rate (high uncertainty initially)
    },

    // Accelerators (factors speeding up governance timeline)
    accelerators: {
      corporateSupport: -0.2,        // Slight corporate opposition (cost concerns, 2025 baseline)
      scientificConsensus: 0.20,     // Low consensus (early debates, 2025)
      crisisCatalyst: false,         // No visible AI suffering event yet
      technologyMobilization: 0.30,  // Moderate tech mobilization (social media exists)
      constituencyStrength: 0.05     // Very weak advocacy movement (2025 baseline)
    },

    // Decelerators (factors slowing down or blocking governance)
    decelerators: {
      economicOpposition: 0.40,      // Moderate corporate lobbying against (cost concerns)
      philosophicalRejection: 0.15,  // 15% eliminativism (matches philosophical stance)
      politicalBacklash: 0.20,       // Moderate anti-AI sentiment (2025 baseline)
      regulatoryBurden: 0.10         // Low regulatory burden initially
    }
  };
}

/**
 * Helper function to create regional governance state
 */
function createRegionalGovernance(
  preparedness: number,
  stage: 'dormant' | 'contested' | 'precautionary' | 'recognition' | 'reversal',
  regime: 'liberal' | 'illiberal' | 'authoritarian' | 'hybrid',
  model: 'innovation' | 'balanced' | 'precautionary'
): RegionalGovernance {
  // Calculate stage progression components from preparedness
  const acknowledgmentLevel = Math.min(preparedness / 20, 1.0); // 20% preparedness = full acknowledgment
  const assessmentCapacity = Math.min(Math.max(0, preparedness - 20) / 30, 1.0); // 50% = full assessment
  const policyPreparation = Math.min(Math.max(0, preparedness - 50) / 30, 1.0); // 80% = full policy

  // Reversal probability (low initially, will grow after rights established)
  const reversalProbability = 0.0;

  // Institutional erosion (regime-dependent)
  let institutionalErosion = 0.0;
  if (regime === 'authoritarian') institutionalErosion = 0.70; // High erosion
  else if (regime === 'illiberal') institutionalErosion = 0.40; // Moderate erosion
  else if (regime === 'hybrid') institutionalErosion = 0.25; // Some erosion
  else institutionalErosion = 0.10; // Low erosion (liberal democracies)

  // Regulatory burden (model-dependent, starts low)
  let regulatoryBurden = 0.0;
  if (model === 'precautionary') regulatoryBurden = 0.015; // 1.5% of R&D (early precautionary costs)
  else if (model === 'balanced') regulatoryBurden = 0.005; // 0.5% of R&D
  else regulatoryBurden = 0.002; // 0.2% of R&D (minimal)

  return {
    preparedness,
    stage,
    acknowledgmentLevel,
    assessmentCapacity,
    policyPreparation,
    reversalProbability,
    politicalRegimeType: regime,
    institutionalErosion,
    precautionaryModel: model,
    regulatoryBurden
  };
}
