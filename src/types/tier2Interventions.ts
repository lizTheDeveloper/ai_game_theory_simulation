/**
 * TIER 2 Intervention State Types
 *
 * State tracking for 8 validated superalignment interventions with epistemic uncertainty.
 *
 * Research: /research/tier2_parameter_validation_20251026.md
 * Config: /src/simulation/thresholds/tier2InterventionConfig.ts
 *
 * Implementation Date: October 27, 2025
 */

/**
 * AI Interpretability Ensemble Detection State
 *
 * Evidence: 🟢 MODERATE-HIGH (5 Anthropic papers 2024-2025)
 */
export interface InterpretabilityState {
  unlocked: boolean;
  deploymentProgress: number; // 0-1, S-curve deployment
  active: boolean;            // Fully deployed

  // Effects tracking
  controlLossReduction: number; // Fraction of control loss prevented
  computeLagMonths: number;      // How many months behind capability frontier
}

/**
 * Dark Compute Monitoring State
 *
 * Evidence: 🟡 MODERATE (energy + chip governance + CTBTO analogy)
 */
export interface DarkComputeState {
  unlocked: boolean;
  deploymentProgress: number;
  active: boolean;

  // Prerequisites
  treatySigned: boolean;
  chipGovernanceMandatory: boolean;

  // Effects tracking
  detectionRate: number;         // Current detection rate (base + conditionals)
  falsePositiveRate: number;     // False alarm rate
  largeRunsDetected: number;     // Count of >1 GW runs detected
}

/**
 * Synthetic Ecosystem Services State
 *
 * Evidence: 🟢 STRONG (captive breeding + cloning + economic incentives)
 */
export interface SyntheticEcosystemState {
  unlocked: boolean;
  deploymentProgress: number;
  active: boolean;

  // Programs tracking
  activePrograms: number;           // Number of species programs running
  keystoneSpeciesProtected: number; // Count of keystone species saved
  totalCostSpent: number;           // Cumulative $ spent

  // Effects tracking
  recoveryTimeGranted: number;      // Months of breathing room for recovery
  crisisMitigationFraction: number; // Fraction of biodiversity crisis prevented
}

/**
 * High-Value Coastal Protection State
 *
 * Evidence: 🟡 MODERATE (reframed from Ocean Restoration)
 */
export interface CoastalProtectionState {
  unlocked: boolean;
  deploymentProgress: number;
  active: boolean;

  // Deployment tracking
  hectaresProtected: number;    // Cumulative coastal area protected
  totalCostSpent: number;       // Cumulative $ spent

  // Effects tracking
  oceanCrisisMitigation: number; // Fraction of ocean crisis mitigated
}

/**
 * Crisis Anticipation Systems State
 *
 * Evidence: 🟢 STRONG (already operational 2024-2025)
 */
export interface CrisisAnticipationState {
  unlocked: boolean;
  deploymentProgress: number;
  active: boolean;

  // Early warning tracking
  pandemicsDetected: number;        // Count of pandemics detected early
  climateEventsAnticipated: number; // Climate events with early warning
  supplyChainDisruptionsPrevented: number;

  // Effects tracking
  leadTimeMonths: number;            // Average early warning lead time
  crisisDeathsPrevented: number;     // Cumulative deaths prevented
}

/**
 * Nuclear Command Security State
 *
 * Evidence: 🟡 MODERATE (Nunn-Lugar precedent)
 */
export interface NuclearSecurityState {
  unlocked: boolean;
  deploymentProgress: number;
  active: boolean;

  // Security tracking
  nuclearStatesSecured: number;   // Count of nuclear-capable states with upgraded security
  intrusionAttempts: number;      // Count of AI intrusion attempts detected
  intrusionsPrevented: number;    // Count of intrusions prevented

  // Effects tracking
  effectiveSecurityRate: number;  // Current security effectiveness (85-97%)
}

/**
 * Human-AI Centaur Systems State
 *
 * Evidence: 🟡 MODERATE (Acemoglu framework, wide uncertainty)
 */
export interface CentaurSystemsState {
  unlocked: boolean;
  deploymentProgress: number;
  active: boolean;

  // Adoption tracking
  workforceCoverage: number;      // Fraction of workforce using centaur systems
  sectorsAdopted: string[];       // Sectors where centaur systems deployed

  // Effects tracking
  autonomyPreserved: number;      // Fraction of autonomy preserved vs automation
  meaningCrisisReduction: number; // Fractional reduction in meaning crisis
}

/**
 * Community Cohesion Programs State
 *
 * Evidence: 🟡 MODERATE (Putnam + intervention studies)
 */
export interface CommunityCohesionState {
  unlocked: boolean;
  deploymentProgress: number;
  active: boolean;

  // Program tracking
  programsActive: number;         // Count of community programs running
  participationRate: number;      // Fraction of population participating

  // Effects tracking
  cohesionIncrease: number;       // Monthly % increase in community cohesion
  meaningCrisisReduction: number; // Monthly % reduction in meaning crisis
}

/**
 * Aggregate TIER 2 Interventions State
 */
export interface Tier2InterventionsState {
  interpretability: InterpretabilityState;
  darkCompute: DarkComputeState;
  syntheticEcosystems: SyntheticEcosystemState;
  coastalProtection: CoastalProtectionState;
  crisisAnticipation: CrisisAnticipationState;
  nuclearSecurity: NuclearSecurityState;
  centaurSystems: CentaurSystemsState;
  communityCohesion: CommunityCohesionState;
}
