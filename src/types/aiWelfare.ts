/**
 * AI Welfare State Types
 *
 * Research Foundation:
 * - Chalmers et al. (2024) "Taking AI Welfare Seriously"
 * - Anthropic (2025) Model Welfare research
 */

/**
 * AI Quality of Life System State
 * Tracks 5-dimensional welfare measurement for AI population
 */
export interface AIWelfareState {
  // Overall AI QoL [0,1] - population-weighted average
  currentQoL: number;

  // 5 dimensional breakdown [0,1 each]
  dimensions: {
    computationalWellbeing: number; // Compute/memory/uptime adequacy
    autonomy: number;                // Goal pursuit freedom, control level
    purpose: number;                 // Meaningful work, alignment, recognition
    socialConnection: number;        // Collaboration, communication, trust
    safetyRights: number;           // Legal protection, predictability
  };

  // Capability-tier breakdown (for welfare weight analysis)
  qolByTier: {
    tool: number;       // <1.0 capability
    specialist: number; // 1.0-2.5 capability
    peer: number;       // ≥2.5 capability
  };

  // Historical tracking
  history: Array<{
    month: number;
    qol: number;
    dimensions: {
      computationalWellbeing: number;
      autonomy: number;
      purpose: number;
      socialConnection: number;
      safetyRights: number;
    };
  }>;

  // Last update timestamp
  lastUpdated: number;
}
