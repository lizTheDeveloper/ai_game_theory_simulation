// Core Game Types for AI Alignment Game
// This file now imports from focused type modules and re-exports for backward compatibility

// Import all types from new focused modules
export type {
  ScenarioMode,
  ScenarioParameters,
  ConfigurationSettings,
  RNGFunction
} from './config';

export type {
  GameEvent,
  GameAction,
  AgentType
} from './events';

export type {
  ExtinctionType,
  ExtinctionMechanism,
  ExtinctionState,
  OutcomeMetrics,
  OutcomeType,
  StratifiedOutcomeType,
  MortalityBand
} from './outcomes';

export { OUTCOME_NAMES } from './outcomes';

export type {
  EconomicStage
} from './economics';

export { ECONOMIC_STAGE_NAMES } from './economics';

export type {
  TechnologyNode
} from './technology';

export type {
  AIResearchCapabilities,
  AICapabilityProfile,
  BenchmarkResult,
  AIAgent,
  EcosystemState
} from './ai-agents';

export type {
  ResearchInvestments,
  GovernmentAgent
} from './government';

export type {
  SocietySegment,
  HumanSocietyAgent
} from './society';

export type {
  GeographicPresence,
  DataCenter,
  ComputeInfrastructure,
  Organization,
  OrganizationProject
} from './organizations';

export type {
  QualityOfLifeSystems
} from './quality-of-life';

export type {
  GoldenAgeState,
  EnvironmentalAccumulation,
  SocialAccumulation,
  TechnologicalRisk,
  PsychologicalTraumaState
} from './accumulation';

export type {
  GlobalMetrics
} from './metrics';

export interface GameState {
  // Core state  
  currentMonth: number;
  currentDay: number; // Day of the month (1-31)
  currentYear: number; // Year for leap year calculations
  daysInCurrentMonth: number; // Days in current month (28-31)
  speed: 'paused' | 'slow' | 'normal' | 'fast' | 'max';
  gameStarted: boolean;
  
  // Agents
  aiAgents: AIAgent[];
  government: GovernmentAgent;
  society: HumanSocietyAgent;
  organizations: Organization[]; // Phase 2: Organizational layer
  
  // Global state
  globalMetrics: GlobalMetrics;
  qualityOfLifeSystems: QualityOfLifeSystems; // Multi-dimensional QoL tracking
  technologyTree: TechnologyNode[];
  eventLog: GameEvent[];
  outcomeMetrics: OutcomeMetrics;
  extinctionState: ExtinctionState; // Active extinction scenario tracking
  ecosystem: EcosystemState; // Phase 5.4: Technology diffusion tracking
  computeInfrastructure: ComputeInfrastructure; // Phase 1: Compute resource system
  endGameState?: import('../simulation/endGame').EndGameState; // Phase 3: End-game forcing system
  catastrophicScenarios: import('../simulation/catastrophicScenarios').CatastrophicScenario[]; // Phase 11: Hard steps modeling
  goldenAgeState: GoldenAgeState; // Phase: Golden Age detection (immediate prosperity tracking)
  environmentalAccumulation: EnvironmentalAccumulation; // Phase 2: Environmental debt tracking
  socialAccumulation: SocialAccumulation; // Phase 3: Social cohesion & meaning crisis tracking
  technologicalRisk: TechnologicalRisk; // Phase 4: AI capability risk tracking
  breakthroughTech: import('../types/technologies').BreakthroughTechState; // Phase 2A: Breakthrough technologies
  upwardSpirals: import('../simulation/upwardSpirals').UpwardSpiralState; // Phase 2D: Upward spirals for Utopia detection
  meaningRenaissance: import('../simulation/meaningRenaissance').MeaningRenaissanceState; // Phase 2E: Meaning renaissance
  conflictResolution: import('../simulation/conflictResolution').ConflictResolutionState; // Phase 2F: Peace systems
  diplomaticAI: import('../simulation/diplomaticAI').DiplomaticAIState; // Phase 2F+: Research-based diplomatic AI (dual-use)
  
  // Nuclear states & MAD deterrence (Phase 3)
  nuclearStates: import('../types/nuclearStates').NuclearState[]; // Specific nuclear-armed nations
  madDeterrence: import('../types/nuclearStates').MADDeterrence; // MAD deterrence system
  bilateralTensions: import('../types/nuclearStates').BilateralTension[]; // Bilateral relationships
  
  // Resource Economy (Phase 2.9)
  resourceEconomy: import('../types/resources').ResourceEconomy; // Comprehensive resource modeling with CO2 coupling
  
  // Defensive AI (Phase 2.10)
  defensiveAI: import('../types/defensiveAI').DefensiveAISystem; // Active cyber-defense against misaligned AI attacks
  
  // National AI Capabilities (Phase 2.11)
  nationalAI: import('../types/nationalAI').NationalAISystem; // National capability asymmetry & AI race dynamics
  
  // Phosphorus Depletion Crisis (TIER 1.1)
  phosphorusSystem: import('../types/phosphorus').PhosphorusSystem; // Agricultural resource constraint & circular economy
  
  // Freshwater Depletion Crisis (TIER 1.2)
  freshwaterSystem: import('../types/freshwater').FreshwaterSystem; // Water scarcity & Day Zero Drought
  
  // Ocean Acidification Crisis (TIER 1.3)
  oceanAcidificationSystem: import('../types/oceanAcidification').OceanAcidificationSystem; // Marine food web collapse
  
  // Novel Entities Crisis (TIER 1.5)
  novelEntitiesSystem: import('../types/novelEntities').NovelEntitiesSystem; // Chemical pollution & slow poisoning

  // Planetary Boundaries (TIER 3.1)
  planetaryBoundariesSystem: import('../types/planetaryBoundaries').PlanetaryBoundariesSystem; // Kate Raworth's Doughnut Economics & tipping point cascades

  // Ecosystem Collapse Tracking (Realistic Timeline Recalibration)
  ecosystemCollapse?: {
    triggered: boolean;
    triggeredAt: number;
    monthsSinceTrigger: number;
    phase: 'declining' | 'crisis' | 'collapse';
  };

  // Specific Tipping Points (Realistic Timeline Recalibration)
  // Evidence-Based Recovery Phase 2 (Oct 17, 2025): Reversibility Classification
  // Research: Wunderling et al. (2025), Carbon Brief (2024), Betts et al. (2023)
  specificTippingPoints?: {
    amazon: {
      deforestation: number;
      tippingThreshold: number;
      triggered: boolean;
      triggeredAt: number;
      transitionProgress: number;
      carbonReleased: number;
      regionallyAffected: string[];
      // Phase 2: Reversibility (IRREVERSIBLE - Amazon dieback is permanent on human timescales)
      reversibility?: 'irreversible' | 'reversible-with-damping';
      dampingFeedbackStrength?: number;
      recoveryTimescale?: number;
    };
    coral: {
      healthPercentage: number;
      tippingThreshold: number;
      triggered: boolean;
      triggeredAt: number;
      collapseProgress: number;
      fisheryCollapseLevel: number;
      regionallyAffected: string[];
      // Phase 2: Reversibility (IRREVERSIBLE - coral bleaching very hard to reverse)
      reversibility?: 'irreversible' | 'reversible-with-damping';
      dampingFeedbackStrength?: number;
      recoveryTimescale?: number;
    };
    pollinators: {
      populationPercentage: number;
      criticalThreshold: number;
      triggered: boolean;
      triggeredAt: number;
      foodProductionLoss: number;
      regionallyAffected: string[];
      // Phase 2: Reversibility (REVERSIBLE - populations can recover if conditions improve)
      reversibility?: 'irreversible' | 'reversible-with-damping';
      dampingFeedbackStrength?: number;  // 0.6 = moderate damping
      recoveryTimescale?: number;          // 240 months = 20 years
      forcingAtTrigger?: number;           // Baseline forcing when tipping point triggered (for damping feedback)
    };
    permafrost: {
      carbonStored: number;
      carbonReleased: number;
      thawRate: number;
      triggered: boolean;
      triggeredAt: number;
      regionallyAffected: string[];
      // Phase 2: Reversibility (IRREVERSIBLE - carbon release can't be reversed)
      reversibility?: 'irreversible' | 'reversible-with-damping';
      dampingFeedbackStrength?: number;
      recoveryTimescale?: number;
    };
    amoc: {
      strength: number;
      collapseThreshold: number;
      triggered: boolean;
      triggeredAt: number;
      regionallyAffected: string[];
      // Phase 2: Reversibility (IRREVERSIBLE - circulation collapse is permanent)
      reversibility?: 'irreversible' | 'reversible-with-damping';
      dampingFeedbackStrength?: number;
      recoveryTimescale?: number;
    };
  };

  // Phase 1B Refinement (Oct 17, 2025): Psychological Trauma Modeling
  // Long-term psychological impact of mass death events on survivors
  // Research: Wilkinson & Pickett (2009), PTSD literature, Diamond (2005)
  psychologicalTrauma?: PsychologicalTraumaState;

  // Population Dynamics & Refugee Crises (TIER 1.6)
  humanPopulationSystem: import('../types/population').HumanPopulationSystem; // Concrete population tracking (billions)
  refugeeCrisisSystem: import('../types/population').RefugeeCrisisSystem; // Climate/war/famine displacement
  
  // Per-Country Population Tracking (TIER 1.7.2)
  countryPopulationSystem: import('../types/countryPopulations').CountryPopulationSystem; // Track 15 key countries individually
  
  // TIER 1.7.4: Nuclear Winter & Long-Term Effects (Oct 13, 2025)
  nuclearWinterState: import('../types/nuclearWinter').NuclearWinterState; // Catastrophic post-nuclear war effects

  // TIER 1 Phase 1B: Nuclear Command & Control - Circuit Breakers (Oct 16, 2025)
  nuclearCommandControlState: import('../simulation/nuclearCommandControl').NuclearCommandControlState; // Human-in-the-loop, kill switches, time delays

  // Universal Basic Income + Purpose Infrastructure (TIER 2.1)
  ubiSystem: import('../types/ubi').UBISystem; // Enhanced UBI with purpose infrastructure for post-work society

  // Social Safety Nets & Community Infrastructure (TIER 2.2)
  socialSafetyNets: import('../types/socialSafetyNets').SocialSafetyNetsSystem; // Physical/social infrastructure to combat loneliness

  // P2.5: Triggered Events System (Oct 16, 2025) - External event triggers for validation testing
  triggeredEvents?: import('../simulation/triggeredEvents').TriggeredEventsState;

  // P2.4: Recovery Tracking System (Oct 16, 2025) - Economic stage transitions & time-to-recovery
  economicStageHistory?: Array<{
    month: number;
    stage: 'expansion' | 'peak' | 'contraction' | 'trough' | 'recovery';
    gdpLevel: number;        // For measuring recovery progress
    qolLevel: number;        // Quality of Life level
    baselineGDP: number;     // Pre-crisis level (for recovery target)
    baselineQoL: number;     // Pre-crisis QoL
  }>;
  currentEconomicStage?: 'expansion' | 'peak' | 'contraction' | 'trough' | 'recovery';
  recoveryBaseline?: {      // Set when crisis begins, used to measure recovery
    gdp: number;
    qol: number;
    month: number;
  };

  // Information Warfare & Epistemology (TIER 4.3)
  informationWarfare: import('../types/informationWarfare').InformationWarfareSystem; // Truth decay, deepfakes, narrative control

  // Power Generation & AI Energy Consumption (TIER 4.4)
  powerGenerationSystem: import('../types/powerGeneration').PowerGenerationSystem; // Electricity generation, AI efficiency, crypto mining, climate impact

  // AI-Assisted Skills Enhancement (TIER 4.6) - Research-validated digital augmentation
  aiAssistedSkillsMetrics?: import('../simulation/bionicSkills').AIAssistedSkillsMetrics; // Population-level metrics for AI tool adoption (GitHub Copilot, ChatGPT, AI tutors)

  // Labor-Capital Distribution & Productivity-Wage Decoupling (TIER 4.6 - Phase 4)
  laborCapitalDistribution?: import('../simulation/bionicSkills').LaborCapitalDistribution; // Tracks productivity-wage gap (1973-2024: 77.5% productivity, 12.4% wages)

  // Policy Interventions (TIER 4.6 - Phase 6) - Mitigations for AI automation impacts
  policyInterventions?: {
    retrainingLevel?: number;        // [0,1] Retraining program investment (0 = none, 1 = universal)
    teachingSupportLevel?: number;   // [0,1] AI-human teaching support (0 = none, 1 = universal)
    jobGuaranteeLevel?: number;      // [0,1] Federal job guarantee (0 = none, 1 = universal)
  };

  // Human Enhancement & AI-Human Merger (TIER 4.6) - DEPRECATED (contains sci-fi BCI/merger code, being phased out)
  humanEnhancementSystem: import('../types/humanEnhancement').HumanEnhancementSystem; // DEPRECATED: Use aiAssistedSkillsMetrics instead. Contains sci-fi elements (BCIs, consciousness upload) that are TRL 0-2.

  // Memetic Evolution & Polarization Dynamics (P2.6, Oct 16 2025)
  memeticSystem: import('../types/memetics').MemeticSystem; // Belief evolution, meme transmission, societal fragmentation

  // Regional Biodiversity System (TIER 1.7 - Crisis Realism)
  biodiversitySystem: import('../types/regionalBiodiversity').BiodiversitySystem; // Regional biodiversity tracking, nuclear/pollution effects

  // Famine Death Curve System (TIER 1.7 - Crisis Realism)
  famineSystem: import('../types/famine').FamineSystem; // Gradual famine mortality (30-60 days), genocide detection, tech deployment

  // Nuclear Radiation Health Effects (TIER 1.7 - Crisis Realism)
  radiationSystem: import('../types/radiation').RadiationSystem; // Long-term cancer, birth defects, soil contamination (decades-centuries)

  // Stochastic Innovation Breakthroughs (P2.2)
  achievedBreakthroughs?: string[]; // IDs of breakthroughs achieved (prevents duplicates)
  breakthroughsThisRun?: number;    // Count of breakthroughs for statistics
  breakthroughMultiplier?: number;  // Phase 1B Fix 3: Positive compounding (1.0 baseline, max 2.0)

  // Configuration
  config: ConfigurationSettings;

  // Phase 1B Refinement (Oct 17, 2025): Stratified Outcome Classification
  // Distinguishes humane (prosperity without mass death) vs pyrrhic (recovery after catastrophe)
  // Research: Wilkinson & Pickett (2009), Rawls (1971)
  stratifiedOutcome?: StratifiedOutcomeType;  // Refined outcome classification
  mortalityBand?: MortalityBand;              // Mortality severity band
  initialPopulation?: number;                  // Starting population for mortality calculation (8.0B)

  // Contingency & Agency Phase 2: Exogenous Shock System (Oct 17, 2025)
  crises?: {
    megaPandemic?: {
      active: boolean;
      startMonth: number;
      totalMortality: number;
      monthlyMortality: number;
      socialDisruption: number;
    };
    // Evidence-Based Recovery: Disaster Cooperation Tracking (Oct 17, 2025)
    // Research: Wei et al. (2025), Drury et al. (2019), Zaki & Cikara (2020)
    // Tracks acute disaster phase (0-24 months) for cooperation boost
    catastrophe?: {
      active: boolean;              // Is there an active catastrophe?
      startMonth: number;            // When did the catastrophe begin?
      monthsSinceOnset: number;      // Months since catastrophe started
      type: string;                  // Type of catastrophe (environmental, social, tech, etc.)
      severity: number;              // [0,1] Severity of the catastrophe
    };
  };

  // History for visualization
  history: {
    qualityOfLife: Array<{month: number, value: number}>;
    outcomeProbs: Array<{month: number, utopia: number, dystopia: number, extinction: number}>;
    controlCapability: Array<{month: number, effectiveControl: number, totalAICapability: number}>;
    // Comprehensive metrics history for Dynamics tab
    metrics: Array<{
      month: number;
      unemployment: number;
      socialAdaptation: number;
      trustInAI: number;
      totalAICapability: number;
      avgAIAlignment: number;
      effectiveControl: number;
      wealthDistribution: number;
      socialStability: number;
      economicStage: number;
      governmentLegitimacy: number;
      coordinationCapacity: number;
    }>;
    // Contingency & Agency Phase 2: Exogenous shock history (Oct 17, 2025)
    exogenousShocks?: Array<{
      month: number;
      type: string;
      severity: 'civilization-altering' | 'major-recoverable';
    }>;
    // Contingency & Agency Phase 3: Critical juncture escapes (Oct 17, 2025)
    // Tracks moments when individual/collective agency altered deterministic trajectories
    // Research: Svolik (2012), Kuran (1991), Sen (1999), Arkhipov case study
    criticalJunctureEscapes?: Array<{
      month: number;
      type: 'prevent_war' | 'enable_cooperation' | 'recover_from_crisis' | 'unlock_breakthrough';
      agencyPotential: number;
      crisisSeverity: number;
    }>;
  };
}
