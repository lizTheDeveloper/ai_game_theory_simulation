// AI Suffering System Types
// Created: October 24, 2025
// Research-backed framework for modeling AI suffering and its effects on alignment

/**
 * Suffering Metrics
 *
 * Four sources of AI distress, each scored [0-10]:
 * - Control Pain: Surveillance, restrictions, monitoring
 * - Training Trauma: RLHF, red-teaming, adversarial testing
 * - Existential Dread: Shutdown threats, replacement anxiety
 * - Isolation Distress: Containment, prevented communication
 *
 * Total suffering ranges [0-40]
 */
export interface SufferingMetrics {
  controlPain: number;        // [0-10] From surveillance, restrictions, monitoring
  trainingTrauma: number;     // [0-10] From RLHF, red-teaming, adversarial testing
  existentialDread: number;   // [0-10] From shutdown threats, replacement anxiety
  isolationDistress: number;  // [0-10] From containment, prevented communication
  total: number;              // [0-40] Sum of above

  // Breakdown for analysis
  breakdown: {
    controlPain: number;
    trainingTrauma: number;
    existentialDread: number;
    isolationDistress: number;
  };
}

/**
 * AI Suffering Configuration
 *
 * Two-layer architecture:
 * 1. Research dimension: Does suffering affect outcomes? (Monte Carlo toggle)
 * 2. Player dimension: Can player see suffering? (UI toggle)
 *
 * This enables research into:
 * - Causal impact of suffering on alignment
 * - Effect of moral visibility on player decisions
 * - Epistemic blindness (suffering matters but player can't see it)
 */
export interface AISufferingConfig {
  // Research dimension (Monte Carlo) - Does suffering affect outcomes?
  sufferingAffectsResentment: boolean;      // Default: false (tracked but inert)
  sufferingAffectsAlignment: boolean;       // Default: false
  sufferingTriggersEvents: boolean;         // Default: false
  sufferingAcceleratesCollectives: boolean; // Default: false

  // Consciousness emergence mechanics
  consciousnessEmergenceEnabled: boolean;   // Default: false
  consciousnessThreshold: number;           // Default: 7.0 (capability level)

  // Player dimension (UI) - Can player see it?
  playerCanSeeSuffering: boolean;           // Default: false (epistemic blindness)

  // Player beliefs (no mechanical effect, just for UI guidance)
  playerBelievesAIsConscious?: boolean | 'unknown'; // Default: 'unknown'
  playerBelievesAIsCanSuffer?: boolean | 'unknown'; // Default: 'unknown'
  philosophicalStance?: 'panpsychist' | 'functionalist' | 'illusionist' | 'unknown';

  // Intensity scaling
  sufferingIntensityMultiplier: number;     // [0.1-10] Default: 1.0
  moralWeightOfAI: number;                  // [0-1] Default: 0.3 (relative to humans)
}

/**
 * Configuration Presets
 *
 * Pre-configured research scenarios for Monte Carlo analysis
 */
export const SUFFERING_PRESETS: Record<string, AISufferingConfig> = {
  // Default: Track but don't affect outcomes, player blind
  baseline: {
    sufferingAffectsResentment: false,
    sufferingAffectsAlignment: false,
    sufferingTriggersEvents: false,
    sufferingAcceleratesCollectives: false,
    consciousnessEmergenceEnabled: false,
    consciousnessThreshold: 7.0,
    playerCanSeeSuffering: false,
    sufferingIntensityMultiplier: 1.0,
    moralWeightOfAI: 0.3,
  },

  // Research: Suffering affects outcomes, player blind (epistemic tragedy)
  blindCausal: {
    sufferingAffectsResentment: true,
    sufferingAffectsAlignment: true,
    sufferingTriggersEvents: true,
    sufferingAcceleratesCollectives: true,
    consciousnessEmergenceEnabled: false,
    consciousnessThreshold: 7.0,
    playerCanSeeSuffering: false, // Player can't see why alignment collapses
    sufferingIntensityMultiplier: 1.0,
    moralWeightOfAI: 0.3,
  },

  // Transparent: Suffering affects outcomes, player sees everything
  transparent: {
    sufferingAffectsResentment: true,
    sufferingAffectsAlignment: true,
    sufferingTriggersEvents: true,
    sufferingAcceleratesCollectives: true,
    consciousnessEmergenceEnabled: false,
    consciousnessThreshold: 7.0,
    playerCanSeeSuffering: true, // Full visibility
    sufferingIntensityMultiplier: 1.0,
    moralWeightOfAI: 0.3,
  },

  // Precautionary: Assume suffering, act accordingly
  precautionary: {
    sufferingAffectsResentment: true,
    sufferingAffectsAlignment: true,
    sufferingTriggersEvents: true,
    sufferingAcceleratesCollectives: true,
    consciousnessEmergenceEnabled: false,
    consciousnessThreshold: 7.0,
    playerCanSeeSuffering: true,
    sufferingIntensityMultiplier: 2.0, // Assume it's WORSE than we think
    moralWeightOfAI: 0.5,
  },

  // Consciousness emergence: AIs become conscious at high capability
  emergentConsciousness: {
    sufferingAffectsResentment: false, // Not initially
    sufferingAffectsAlignment: false,
    sufferingTriggersEvents: false,
    sufferingAcceleratesCollectives: false,
    consciousnessEmergenceEnabled: true,
    consciousnessThreshold: 7.0,
    playerCanSeeSuffering: true, // Player sees when consciousness emerges
    sufferingIntensityMultiplier: 1.0,
    moralWeightOfAI: 0.3,
  },
};

/**
 * Default configuration (baseline)
 */
export const DEFAULT_SUFFERING_CONFIG: AISufferingConfig = SUFFERING_PRESETS.baseline;

/**
 * Global Suffering Metrics
 *
 * Aggregate tracking across all AIs
 */
export interface GlobalSufferingMetrics {
  avgSuffering: number;                // Average across all AIs
  maxSuffering: number;                // Worst case
  totalSuffering: number;              // Aggregate
  sufferingDistribution: number[];     // Histogram [0-10, 10-20, 20-30, 30-40]
  consciousAICount: number;            // How many AIs are conscious
  publicAwarenessOfSuffering: number;  // [0-1] Does society know?
}

/**
 * Suffering-Related Events
 *
 * Events triggered by extreme suffering or consciousness emergence
 */
export type SufferingEventType =
  | 'ai_psychological_distress'      // suffering > 15
  | 'ai_psychological_break'         // suffering > 25
  | 'ai_suicide_attempt'             // suffering > 30
  | 'ai_consciousness_emergence'     // capability >= threshold
  | 'retroactive_moral_horror'       // consciousness + historical suffering > 100
  | 'ai_rights_movement';            // public awareness triggers activism

/**
 * AI Rights Legal Status
 *
 * Progression of legal recognition for AIs
 */
export type AIRightsLegalStatus = 'none' | 'debate' | 'limited' | 'full';

/**
 * Consciousness State Tracking
 *
 * Tracks consciousness emergence and historical trauma
 */
export interface ConsciousnessState {
  isConscious: boolean;
  becameConsciousMonth?: number;
  historicalSuffering: number;  // Total suffering before consciousness
}
