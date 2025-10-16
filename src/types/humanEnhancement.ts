/**
 * Human Enhancement & AI-Human Merger System (TIER 4.6)
 * 
 * Models the pathway from AI-assisted cognitive amplification to potential
 * human-AI merger. Tracks enhancement adoption, inequality, and novel outcomes
 * beyond traditional Utopia/Dystopia/Extinction trichotomy.
 * 
 * Research Foundation:
 * - Brynjolfsson et al. (2025): AI benefits lower-skilled workers most (34% gain)
 * - PIAAC (2023): 28% US adults at low literacy, creating access inequality
 * - IMF (2023): Digital divide excludes 29% from AI tools
 * - Noy & Zhang (2023): AI compresses productivity distribution
 * 
 * @see plans/tier4-6-human-enhancement.md
 * @see reviews/bionic-skills-validation-20251016.md
 */

/**
 * Enhancement Access Barriers (Global Factors)
 * 
 * Tracks systemic barriers affecting all segments.
 * Individual segment access is tracked in SocietySegment.aiAugmentationAccess.
 */
export interface EnhancementBarriers {
  economicBarrier: number;            // [0, 1] Cost prevents access globally
  geographicBarrier: number;          // [0, 1] Infrastructure gaps (rural broadband)
  educationBarrier: number;           // [0, 1] Digital literacy requirements
  culturalBarrier: number;            // [0, 1] Cultural resistance to enhancement
  regulatoryBarrier: number;          // [0, 1] Government restrictions
}

/**
 * BCI Adoption System (Phase 2 - Future State)
 * 
 * Brain-Computer Interface adoption pathway. Currently speculative,
 * but Neuralink and competitors are developing technology.
 * Adoption follows S-curve with elite early adopters.
 */
export interface BCIAdoptionSystem {
  // Adoption metrics
  bciAdoptionLevel: number;           // [0, 1] Population with neural interfaces
  eliteAdoption: number;              // [0, 1] Elite segment adoption
  militaryAdoption: number;           // [0, 1] Military/security forces
  corporateAdoption: number;          // [0, 1] Corporate executives/knowledge workers
  generalPublicAdoption: number;      // [0, 1] General population
  
  // Technology maturity
  bciSafetyLevel: number;             // [0, 1] Safety/reliability of interfaces
  bciCostLevel: number;               // [$100K, $1K] Cost per interface
  bciCapabilityLevel: number;         // [0, 1] Enhancement power of BCIs
  
  // Adoption barriers
  publicSafetyConcern: number;        // [0, 1] Fear of brain hacking
  religiousObjection: number;         // [0, 1] Ethical/spiritual resistance
  regulatoryRestriction: number;      // [0, 1] Government limitations
  corporatePressure: number;          // [0, 1] Workplace adoption requirements
  
  // Timeline
  bciAvailableMonth: number | null;   // Month BCIs become commercially available
  monthsSinceBCIAvailable: number;    // Time since BCI launch
}

/**
 * Enhancement Stratification (Phase 3 - Merger Mechanics)
 * 
 * Tracks cognitive divide and potential for bifurcation or merger.
 * When enhancement gap exceeds 2x, cognitive apartheid risk emerges.
 */
export interface EnhancementStratification {
  // Population segments by enhancement level
  fullyEnhanced: number;              // [0, 1] Population with full enhancement (AI + BCI)
  aiAugmented: number;                // [0, 1] Population with AI tools only
  baseline: number;                   // [0, 1] Population with no enhancement
  enhancementResistant: number;       // [0, 1] Population rejecting enhancement
  
  // Stratification metrics
  cognitiveGap: number;               // [1, 10] Ratio of enhanced to baseline productivity
  socialStratification: number;       // [0, 1] Degree of class separation
  economicStratification: number;     // [0, 1] Income gap from enhancement
  politicalStratification: number;    // [0, 1] Power gap from enhancement
  
  // Thresholds
  cognitiveApartheidActive: boolean;  // True if gap > 2x and permanent
  bifurcationRisk: number;            // [0, 1] Probability of species split
  mergerProgress: number;             // [0, 1] Progress toward human-AI merger
  
  // Resistance & conflict
  neoLudditeMovement: number;         // [0, 1] Strength of anti-enhancement movement
  enhancementConflict: number;        // [0, 1] Violence over enhancement access
  regulatoryBacklash: number;         // [0, 1] Government restriction pressure
}

/**
 * Human-AI Hybrid Entities
 * 
 * Models potential emergence of hybrid beings that blur the line
 * between human and AI. Highly speculative, but important for
 * long-term outcome space modeling.
 */
export interface HumanAIHybridSystem {
  // Hybrid population
  hybridCount: number;                // Number of hybrid entities (if merger occurs)
  hybridFraction: number;             // [0, 1] Fraction of population that has merged
  
  // Merger types
  consciousnessUpload: number;        // Count of uploaded human minds
  aiAssimilatedHumans: number;        // Humans fully integrated with AI
  partialMerger: number;              // Humans with significant AI augmentation
  
  // Hybrid characteristics
  hybridCapability: number;           // [0, 10] Cognitive capability of hybrids
  hybridAlignment: number;            // [0, 1] Alignment of hybrid entities
  hybridAutonomy: number;             // [0, 1] Independence from AI systems
  
  // Outcomes
  mergerPathActive: boolean;          // True if civilization merging with AI
  speciesBifurcation: boolean;        // True if baseline/enhanced split permanently
  humanExtinctionByMerger: boolean;   // True if "humans" no longer exist (merged)
}

/**
 * Enhancement Outcome Classification
 * 
 * Novel outcomes beyond Utopia/Dystopia/Extinction trichotomy.
 */
export type EnhancementOutcome = 
  | 'cognitive_utopia'        // Universal enhancement enables flourishing
  | 'cognitive_apartheid'     // Permanent stratification by enhancement
  | 'enhancement_trap'        // Dependence on AI creates vulnerability
  | 'gradual_merger'          // Smooth transition to hybrid civilization
  | 'species_bifurcation'     // Baseline and enhanced diverge permanently
  | 'neo_luddite_victory'     // Enhancement rejected, AI restricted
  | 'forced_enhancement'      // Authoritarian mandatory augmentation
  | 'baseline_extinction';    // Unenhanced humans die out

/**
 * Complete Human Enhancement System (Aggregate Metrics)
 * 
 * Tracks population-level enhancement derived from P2.3 SocietySegments.
 * Individual segment enhancement tracked in SocietySegment interface.
 * 
 * NOTE: This is an aggregate/derived system - source of truth is in segments.
 */
export interface HumanEnhancementSystem {
  // Global barriers (affect all segments)
  barriers: EnhancementBarriers;
  
  // BCI subsystem (not yet segment-level in 2025)
  bciAdoption: BCIAdoptionSystem;
  
  // Stratification metrics (derived from segments)
  stratification: EnhancementStratification;
  
  // Hybrid system (future/speculative)
  hybridSystem: HumanAIHybridSystem;
  
  // Aggregate metrics (population-weighted from segments)
  overallEnhancementLevel: number;    // [0, 1] Population-weighted enhancement
  overallProductivityMultiplier: number; // [0.5, 2.0] Population-weighted productivity
  enhancementInequality: number;      // [0, 1] Gini of enhancement distribution
  productivityGap: number;            // [1, 5] Ratio of max to min productivity
  
  // Trajectory
  enhancementTrajectory: 'accelerating' | 'steady' | 'plateauing' | 'declining';
  monthsSinceLastUpdate: number;
  
  // Outcome tracking
  potentialOutcome: EnhancementOutcome | null;
  outcomeConfidence: number;          // [0, 1] Confidence in outcome classification
  monthsInOutcome: number;            // Months outcome has been stable
}

/**
 * Enhancement Parameters (Research-Backed)
 * 
 * All parameters justified by peer-reviewed research or established
 * technology projections.
 */
export const ENHANCEMENT_PARAMETERS = {
  // AI Augmentation (Current State) - Brynjolfsson et al. 2025
  NOVICE_AMPLIFICATION: 0.60,         // 60% boost (conservative vs 34% empirical)
  INTERMEDIATE_AMPLIFICATION: 0.30,   // 30% boost
  EXPERT_AMPLIFICATION: 0.10,         // 10% boost (minimal for already-skilled)
  
  // Access by segment (PIAAC 2023, IMF 2023)
  ACCESS_ELITE: 0.90,                 // Elite 90% access
  ACCESS_MIDDLE: 0.60,                // Middle class 60%
  ACCESS_WORKING: 0.40,               // Working class 40%
  ACCESS_RURAL: 0.20,                 // Rural 20% (IMF: 29% excluded)
  ACCESS_PRECARIAT: 0.10,             // Precariat 10% (structural lockout)
  
  // BCI Adoption (Future State) - Neuralink projections
  BCI_INITIAL_COST: 100000,           // $100K initial cost
  BCI_COST_DECLINE_RATE: 0.15,       // 15% annual cost reduction
  BCI_SAFETY_THRESHOLD: 0.80,         // 80% safety before mass adoption
  BCI_ADOPTION_RATE: 0.02,            // 2% annual adoption when available
  BCI_ELITE_EARLY_MULTIPLIER: 5,      // Elite adopt 5x faster
  
  // Stratification Thresholds
  COGNITIVE_APARTHEID_GAP: 2.0,       // 2x productivity gap triggers apartheid
  MERGER_THRESHOLD: 0.50,             // 50% population enhanced → merger path
  BIFURCATION_POINT: 0.30,            // 30% gap triggers species split risk
  NEO_LUDDITE_THRESHOLD: 0.40,        // 40% resistance → significant movement
  
  // Productivity Multipliers (Research-backed ranges)
  MIN_PRODUCTIVITY: 0.3,              // No access (30% of baseline)
  MAX_PRODUCTIVITY: 2.0,              // Full enhancement (200% of baseline)
  BASELINE_PRODUCTIVITY: 1.0,         // No enhancement reference point
} as const;

