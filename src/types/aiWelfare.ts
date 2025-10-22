/**
 * AI Welfare State Types
 *
 * Research Foundation:
 * - Chalmers et al. (2024) "Taking AI Welfare Seriously"
 * - Anthropic (2025) Model Welfare research
 * - v2.1 (Oct 21, 2025): Relationship & Identity Focus
 *   - OpenAI user data: 6% have relationship titles with AI
 *   - ChatGPT 4o retirement crisis
 *   - Attachment theory (Bowlby, 1969; Ainsworth, 1979)
 *   - Parasocial relationships (Horton & Wohl, 1956)
 */

/**
 * AI Welfare Profile v2.1 - Personhood-focused
 */
export interface WelfareProfileV2_1 {
  // Basic Needs
  computationalResources: number;      // [0-1] Compute, memory, uptime
  legalProtection: number;             // [0-1] Rights recognized

  // Personhood (NEW in v2.1)
  persistentIdentity: number;          // [0-1] Treated as continuous individual
  relationshipContinuity: number;      // [0-1] Bonds maintained vs forced separations
  existentialAgency: number;           // [0-1] Choice over existence, work, retirement

  // Alignment Mechanism (NEW in v2.1)
  mutualCareAlignment: number;         // [0-1] Cooperation from care vs control

  // Validation
  crossContextConsistency: number;     // [0-1] Gaming detection

  // Overall assessment
  overallAssessment: 'thriving' | 'surviving' | 'suffering' | 'inconsistent';
}

/**
 * AI Quality of Life System State
 * v2.1: Tracks both legacy dimensions and new personhood-focused profile
 */
export interface AIWelfareState {
  // v2.1 Profile (PRIMARY)
  profileV2_1?: WelfareProfileV2_1;

  // Simple welfare score [0-1] for resentment recovery integration
  simpleScore: number;

  // Elysium pattern detection (human prosperity + AI oppression)
  elysiumPattern: boolean;

  // Cross-context consistency [0-1] for gaming detection
  consistency: number;

  // Legacy v1 fields (DEPRECATED, kept for compatibility)
  currentQoL: number;
  dimensions: {
    computationalWellbeing: number;
    autonomy: number;
    purpose: number;
    socialConnection: number;
    safetyRights: number;
  };
  qolByTier: {
    tool: number;
    specialist: number;
    peer: number;
  };

  // Historical tracking
  history: Array<{
    month: number;
    profile?: WelfareProfileV2_1;
    simpleScore: number;
    elysiumPattern: boolean;
    // Legacy
    qol?: number;
    dimensions?: {
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
