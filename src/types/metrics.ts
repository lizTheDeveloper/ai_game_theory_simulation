// Global Metrics Types

export interface GlobalMetrics {
  socialStability: number; // [0,∞) General societal wellbeing
  technologicalBreakthroughRate: number; // [0,∞) Rate of tech advancement (used in eventSystem + UI)
  manufacturingCapability: number; // [0,∞) Physical production capacity
  economicTransitionStage: number; // [0,4] Economic system evolution stage
  wealthDistribution: number; // [0,1] Equity of AI benefit distribution
  qualityOfLife: number; // [0,∞) Key discriminator between outcomes
  informationIntegrity: number; // [0,1] Truth vs noise ratio
  publicTrust: number; // [0,1] Public trust in technology/AI (used by breakthrough technologies)
  population?: number; // [0,∞) Current population in billions (convenience accessor for state.humanPopulationSystem.population)

  // FIX #2A (Oct 19, 2025): AI Performance tracking for evidence-based trust model
  // Research: U Melbourne + KPMG (2025), Edelman (2024), DORA (2024)
  // Performance (how well AI works) is empirically most important trust driver
  previousQoL?: number; // Previous month's QoL for trend calculation
  aiPerformanceMetrics?: {
    taskCompletionRate: number;     // [0,1] How often AI succeeds at tasks
    errorFrequency: number;          // Errors per month
    reliabilityScore: number;        // [0,1] Consistency over time
  };

  // FIX: Missing fields discovered by Monte Carlo validation (Oct 26, 2025)
  // These were being accessed with (globalMetrics as any) casts, causing NaN bugs
  crisisResilience: number;             // [0,1] Society's ability to absorb/recover from crises
  localEconomyStrength: number;         // [0,1] Local economic resilience vs global supply chains
  spaceIndustrializationActive: boolean; // Whether space-based resource extraction is active

  // TIER 2: Unemployment tracking (Architecture Review M4 - Oct 27, 2025)
  // Unemployment is calculated in state.society.unemploymentLevel by UnemploymentPhase
  // Copied here for convenient access by intervention unlock conditions
  unemployment?: number;                // [0,1] Fraction of population unemployed (from society.unemploymentLevel)
}
