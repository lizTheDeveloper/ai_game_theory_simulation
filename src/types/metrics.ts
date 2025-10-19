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

  // FIX #2A (Oct 19, 2025): AI Performance tracking for evidence-based trust model
  // Research: U Melbourne + KPMG (2025), Edelman (2024), DORA (2024)
  // Performance (how well AI works) is empirically most important trust driver
  previousQoL?: number; // Previous month's QoL for trend calculation
  aiPerformanceMetrics?: {
    taskCompletionRate: number;     // [0,1] How often AI succeeds at tasks
    errorFrequency: number;          // Errors per month
    reliabilityScore: number;        // [0,1] Consistency over time
  };
}
