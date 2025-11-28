// Global Metrics Types

export interface GlobalMetrics {
  socialStability: number; // [0,∞) General societal wellbeing
  technologicalBreakthroughRate: number; // [0,∞) Rate of tech advancement (used in eventSystem + UI)
  manufacturingCapability: number; // [0,∞) Physical production capacity
  economicTransitionStage: number; // [0,4] Economic system evolution stage
  wealthDistribution: number; // [0,1] Equity of AI benefit distribution
  qualityOfLife: number; // [0,∞) Key discriminator between outcomes
  informationIntegrity: number; // [0,1] Truth vs noise ratio
  trustInAI: number; // [0,1] Public trust in AI technology (used by breakthrough technologies)
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

  // === ANIMAL WELFARE INDEX (Oct 27, 2025) ===
  // Research: World Animal Foundation (2024) - 94.9B animals in factory farms yearly
  // Research: Our World in Data (2024) - 90%+ of farmed animals in factory farms
  // Research: Sentience Institute (2024) - 74% of farmed land animals in factory farms
  // Baseline 2025: 0.10 (90%+ factory farming, minimal welfare protections)
  // Tech: "Precision Fermentation" (cell-cultured meat) and "Interspecies Communication" improve this
  animalWelfareIndex: number;           // [0,1] 0 = factory farming norm, 1 = universal welfare

  // === EXISTENTIAL RISK TRACKING (Oct 27, 2025) ===
  // Research: Ord (2020) "The Precipice" - 1/6 (16.7%) existential risk this century
  // Research: Carlsmith (2021) - AI takeover risk by 2070: ~5%
  // Baseline 2025: 0.10 (10% existential risk - conservative estimate)
  catastrophicRisk: number;              // [0,1] Risk of catastrophic AI failure/takeover
  existentialRisk: number;               // [0,1] General existential risk (nanotech, biotech, AI)
  catastrophicRiskFromRecursion: number; // [0,1] Risk from recursive self-improvement
  recursiveSafety: boolean;              // Whether recursive alignment safety is active
  fusionEnabling: number;                // [0,1] Progress toward fusion enabling (0=none, 1=ready)

  // === FUSION ENABLING BONUSES (Oct 27, 2025) ===
  // Derived from fusionEnabling progress (prerequisite techs: Fusion Materials, Fusion Plasma Control)
  // Each provides 0.33, max 1.0 from both → bonuses scale with progress
  fusionResearchBonus: number;           // [0,2] Research speed multiplier (2x at 100% enabling)
  fusionDeploymentCostReduction: number; // [0,0.4] Deployment cost reduction (40% at 100%)
  fusionDeploymentTimeReduction: number; // [0,0.3] Deployment time reduction (30% at 100%)

  // === NITROGEN REDUCTION TRACKING (Nov 2025 - HIGH-11 type safety fix) ===
  // Research: Springmann et al. (2018) - N-cycle disruption coupling to food systems
  // Accumulated reduction effectiveness from technologies (used by food security + nitrogen coupling)
  // Multiplicative stacking: 1 - (1 - r1)(1 - r2)...(1 - rN) prevents >100% reduction
  nitrogenReductionTotal?: number;       // [0,1] Total nitrogen reduction from all active technologies

  // === ENVIRONMENTAL HEALTH COMPOSITE (Nov 27, 2025 - CRITICAL-1 fix) ===
  // Research: Scheffer et al. (2014) - Critical thresholds in environmental systems
  // Research: Richardson et al. (2023) - Planetary boundaries framework
  // Calculated by BifurcationLogicPhase as geometric mean of environmental metrics
  // Formula: (climateStability × biodiversityIndex × resourceReserves × (1 - pollution))^0.25
  // Used by bifurcation threshold detection (environmental collapse at ~0.35)
  environmentalHealth: number;           // [0,1] Composite environmental health metric

  // === INTERNATIONAL COORDINATION (Nov 28, 2025) ===
  // Research: Needed for ocean acidification food security dampening
  // Tracks level of international cooperation on global challenges
  // Used by ocean acidification system to model food aid/trade redistribution
  coordinationLevel: number;             // [0,1] International cooperation level
}
