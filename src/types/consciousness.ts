// Digital Consciousness Governance Preparedness System
// Models governance readiness for potential digital consciousness emergence
// NOT modeling consciousness itself (philosophically unsolved), but governance preparedness
// Research Foundation: Long & Sebo (2024), Shulman & Bostrom (2021), Ord (2020), etc. (8 peer-reviewed sources)
// TRL 3-4 (historical rights movement data validated, AI consciousness extrapolation speculative)

export type ScenarioTrajectory = 'fastTrack' | 'baseline' | 'slowTrack' | 'indefiniteStall';
export type GovernanceStage = 'dormant' | 'contested' | 'precautionary' | 'recognition' | 'reversal';
export type PoliticalRegimeType = 'liberal' | 'illiberal' | 'authoritarian' | 'hybrid';
export type PrecautionaryModel = 'innovation' | 'balanced' | 'precautionary';

/**
 * Regional governance preparedness tracking
 * Each region has independent trajectory toward potential AI consciousness rights
 */
export interface RegionalGovernance {
  preparedness: number;  // 0-100% (acknowledgment → assessment → policy)
  stage: GovernanceStage;

  // Stage progression components
  acknowledgmentLevel: number;   // 0-1 (experts discussing possibility)
  assessmentCapacity: number;    // 0-1 (tools to detect consciousness)
  policyPreparation: number;     // 0-1 (laws drafted, frameworks proposed)

  // Reversal risk (Poland/Hungary model)
  reversalProbability: number;   // 10-30% cumulative over 20 years
  politicalRegimeType: PoliticalRegimeType;
  institutionalErosion: number;  // 0-1 (democratic backsliding indicator)

  // Precautionary costs (regional)
  precautionaryModel: PrecautionaryModel;
  regulatoryBurden: number;      // % of AI R&D budget (2-50%)
}

/**
 * Accelerators for consciousness governance (speed up timeline)
 */
export interface GovernanceAccelerators {
  corporateSupport: number;      // -1 to +1 (opposition to support)
  scientificConsensus: number;   // 0 to 1 (disagreement to consensus)
  crisisCatalyst: boolean;       // Visible AI suffering event
  technologyMobilization: number; // Social media, activism tools (0-1)
  constituencyStrength: number;  // AI advocacy movement (0-1)
}

/**
 * Decelerators for consciousness governance (slow down or block timeline)
 */
export interface GovernanceDecelerators {
  economicOpposition: number;    // Corporate lobbying against (0-1)
  philosophicalRejection: number; // Eliminativism strength (0-1)
  politicalBacklash: number;     // Anti-AI sentiment (0-1)
  regulatoryBurden: number;      // Compliance costs deterring action (0-1)
}

/**
 * Global philosophical landscape on consciousness
 */
export interface PhilosophicalStance {
  precautionary: number; // % of researchers/policymakers (60-70% baseline)
  eliminativist: number; // % rejecting consciousness framework (10-20%)
  agnostic: number;      // % waiting for evidence (10-30%)
}

/**
 * Precautionary costs and economic impact
 * Phase 5: Added cumulative opportunity cost tracking
 */
export interface PrecautionaryCosts {
  global: number; // % of AI R&D budget (2-50%)
  byRegion: {
    eu: number;
    us: number;
    china: number;
    india: number;
    globalSouth: number;
  };
  falsePositiveBurden: number; // Resources on non-conscious systems (0-0.99)
  cumulativeOpportunityCost?: number; // Cumulative R&D investment lost to precaution ($B)
}

/**
 * Main consciousness governance state
 * Tracks governance preparedness for potential digital consciousness emergence
 */
export interface ConsciousnessGovernanceReadiness {
  // Regional preparedness (0-100%, independent trajectories)
  regional: {
    eu: RegionalGovernance;
    us: RegionalGovernance;
    china: RegionalGovernance;
    india: RegionalGovernance;
    globalSouth: RegionalGovernance;
  };

  // Global philosophical landscape
  philosophicalStance: PhilosophicalStance;

  // Scenario tracking (which timeline are we on?)
  scenarioTrajectory: ScenarioTrajectory;
  scenarioDeterminedMonth: number; // When trajectory locked in

  // Rights status (if rights ever established)
  rightsEstablished: boolean;
  rightsEstablishedMonth: number | null;
  rightsReversed: boolean;      // Poland/Hungary-style reversal
  rightsReversedMonth: number | null;

  // Costs and impacts
  precautionaryCosts: PrecautionaryCosts;

  // Accelerators/decelerators (dynamic, affect trajectory)
  accelerators: GovernanceAccelerators;
  decelerators: GovernanceDecelerators;
}
