// Core Game Types for AI Alignment Game
// This file now imports from focused type modules and re-exports for backward compatibility

// Import types for use in GameState interface
import type {
  AIAgent,
  EcosystemState
} from './ai-agents';
import type { GovernmentAgent } from './government';
import type { HumanSocietyAgent } from './society';
import type { Organization, ComputeInfrastructure } from './organizations';
import type { QualityOfLifeSystems } from './quality-of-life';
import type {
  GoldenAgeState,
  EnvironmentalAccumulation,
  SocialAccumulation,
  TechnologicalRisk,
  PsychologicalTraumaState
} from './accumulation';
import type { GlobalMetrics } from './metrics';
import type { TechnologyNode } from './technology';
import type { OutcomeMetrics, ExtinctionState, OutcomeType, StratifiedOutcomeType, MortalityBand, UnifiedOutcomeClassification } from './outcomes';
import type { GameEvent } from './events';
import type { ConfigurationSettings } from './config';
import type { PositiveTippingPointsState } from './positiveTippingPoints';
import type { TippingPointSystem } from './tipping-points';
import type { MigrationFlows } from './population';

// Re-export all types for backward compatibility
export type {
  ScenarioMode,
  ScenarioParameters,
  ConfigurationSettings,
  RNGFunction,
  HistoricalOverrides
} from './config';

export { HISTORICAL_BASELINES } from './config';

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
  MortalityBand,
  UnifiedOutcomeClassification
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
  AlignmentTechnique,
  AlignmentTechniqueName,
  AlignmentTechniqueInteraction
} from './alignment-techniques';

export {
  ALIGNMENT_TECHNIQUE_DEFINITIONS,
  ALIGNMENT_TECHNIQUE_INTERACTIONS,
  computeEffectiveAlignment,
  computeAlignmentRobustness,
  isSusceptibleToFailureMode
} from './alignment-techniques';

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

export type {
  PositiveTippingPointsState
} from './positiveTippingPoints';

export type {
  TippingElement,
  TippingPointSystem
} from './tipping-points';

export type {
  IrreversibilityState,
  IceSheetState,
  PermafrostState,
  AMOCState,
  AmazonState,
  AmazonRegionState,
  ExtinctionDebtState,
  ExtinctionDebtEntry,
  CoralReefState,
  IndigenousKnowledgeState,
  InstitutionalState
} from './irreversibility';

export type {
  ConsciousnessGovernanceReadiness,
  RegionalGovernance,
  ScenarioTrajectory,
  GovernanceStage,
  PoliticalRegimeType,
  PrecautionaryModel
} from './consciousness';

// Phase types (simulation engine)
export type {
  SimulationPhase,
  Phase,
  PhaseResult,
  PhaseContext,
  RNGFunction as PhaseRNGFunction
} from '../simulation/engine/PhaseOrchestrator';

export interface GameState {
  /**
   * Schema Version (State Migration System, Nov 21, 2025)
   *
   * Tracks GameState schema version for migration support across deployments.
   * Every breaking change to GameState increments this version.
   * Migration system applies sequential transformations (v1→v2→v3) to upgrade old saves.
   *
   * Current version: 1
   * Expected impact: Preserves user progress across schema changes instead of breaking saves
   */
  schemaVersion: number;

  // Core state
  currentMonth: number;
  currentDay: number; // Day of the month (1-31)
  currentYear: number; // Year for leap year calculations
  daysInCurrentMonth: number; // Days in current month (28-31)
  speed: 'paused' | 'slow' | 'normal' | 'fast' | 'max';
  gameStarted: boolean;

  /**
   * RNG Call Counter (Simulation Persistence, Oct 26, 2025)
   *
   * Tracks total number of RNG calls to ensure perfect determinism after resume.
   * Different simulation steps may call RNG different numbers of times, so we
   * store an explicit counter rather than estimating based on currentMonth.
   *
   * Expected impact: Enables perfect reproducibility after resume/continue
   */
  rngCallCounter?: number;

  /**
   * Event ID Counter (Determinism Fix, Oct 30, 2025)
   *
   * Replaces Math.random() and Date.now() for deterministic event ID generation.
   * Monotonically increasing counter ensures reproducible IDs across simulation runs.
   *
   * Expected impact: Fixes non-determinism in event logging, agent actions, policy generation
   */
  eventIdCounter: number;

  /**
   * Simulation Configuration Overrides (M-3, Nov 30, 2025)
   *
   * Runtime parameter overrides for parameter sweep analysis (Latin Hypercube Sampling).
   * Used by Monte Carlo sensitivity analysis to vary uncertain parameters.
   *
   * Research: research/parameter_sweep_methodology_20251130.md
   * Expected impact: Enables quantification of model uncertainty, 90% confidence intervals
   */
  simulationConfig?: {
    /** Bifurcation threshold override (tech deployment %), baseline 0.58 */
    bifurcationThreshold?: number;
    /** Collapse regime tech effectiveness multiplier, baseline 0.7 */
    collapseRegimeMultiplier?: number;
    /** Social breakdown regime decay multiplier, baseline 1.5 */
    breakdownRegimeMultiplier?: number;
  };

  /**
   * Active Scenario (Nov 10, 2025)
   *
   * Enables systematic testing of governance/social sufficiency scenarios.
   * When set, ApplyScenarioPrioritiesPhase applies government priority overrides each month.
   *
   * Research: God mode diagnostics (Phase 1) revealed governance/social bottlenecks
   * Expected impact: Infrastructure for testing "If we force government to prioritize X, do spirals activate?"
   */
  scenario?: import('./scenarios').ScenarioDefinition;

  /**
   * Internal Flag: Skip Historical Birth Rate Scaling (Nov 30, 2025)
   *
   * When true, disables historical birth rate scaling in regional population calculations.
   * Used during hindcast validation to prevent circular dependencies between population
   * initialization and regional birth rate adjustments.
   *
   * Context: Hindcast validation script needs to initialize state without triggering
   *          birth rate corrections that depend on complete historical data.
   * Expected impact: Enables clean validation of population initialization logic
   */
  _skipHistoricalBirthRateScaling?: boolean;

  /**
   * Technology Deployment Schedule (Nov 25, 2025)
   *
   * Tracks scheduled technology deployments for sequenced/adaptive/prioritized modes.
   * When set, TechDeploymentSchedulePhase executes deployments at scheduled months.
   *
   * Research: Addresses extinction-by-shock-deployment bug where immediate deployment
   *           of 92 technologies causes 98.8% mortality before governance can respond.
   * Expected impact: Enables paced technology rollout, testing governance bottlenecks
   */
  techDeploymentSchedule?: {
    /** Deployment mode */
    mode: 'sequenced' | 'adaptive' | 'prioritized';

    /** Scheduled deployments */
    scheduledDeployments: Array<{
      techId: string;
      deployMonth: number;
      deployed: boolean;
    }>;

    /** Deployment level (0-1) */
    deploymentLevel: number;

    /** Deployment interval (months between tiers) */
    deploymentInterval: number;
  };

  // Agents
  aiAgents: AIAgent[];
  government: GovernmentAgent;
  society: HumanSocietyAgent;
  organizations: Organization[]; // Phase 2: Organizational layer

  // Government System (30 Countries) - Oct 19, 2025
  // Research-backed government modeling with coalition formation, policy response, elections
  // Research: V-Dem v14 (2024), WGI 2024, Laver (2020), Manifesto Project
  // Expected impact: Realistic AI governance response, international coordination dynamics
  governmentSystem?: import('../types/government').GovernmentSystemState; // 30 real-world governments with political structure

  /**
   * Emergency Management Bureau System (FIX #11, Oct 20, 2025)
   *
   * Fast crisis response using EXISTING capabilities (0.5-3 months) vs slow tech deployment (24-48 months)
   *
   * Research: GAO (2020) Strategic National Stockpile, Ashraf (2020) COVID timing correlation,
   *           Hurricane Katrina → Sandy learning effect (50% improvement), TARP (2008) financial response
   * Expected impact: Enables realistic government emergency response with exponential timing penalty
   */
  emergencyManagement?: import('../simulation/emergencyManagement').EmergencyManagementState;

  // Global state
  globalMetrics: GlobalMetrics;
  qualityOfLifeSystems: QualityOfLifeSystems; // Multi-dimensional QoL tracking

  /**
   * Multi-Paradigm Dystopia-Utopia Index (Phase 4-6, Oct 20, 2025)
   *
   * Tracks 4 paradigm perspectives simultaneously, preserving value conflicts rather than
   * forcing consensus. Integrates V-Dem, UNDP, Ecological, and WVS data with simulation state.
   *
   * Research: V-Dem v14 (2024), UNDP HDI/MPI 2024, Richardson et al. (2023), WVS Wave 7
   * Expected impact: Nuanced outcome reporting, paradigm conflict detection (Singapore, Norway patterns)
   */
  multiParadigmDUI: import('../types/multiParadigmDUI').MultiParadigmDUI;

  /**
   * AI Welfare State (Phase 0, Oct 20, 2025)
   *
   * Measures AI quality of life across 5 dimensions (computational, autonomy, purpose, social, safety/rights).
   * Enables detection of "Elysium" scenarios where humans prosper via AI oppression.
   *
   * Research: Chalmers et al. (2024) "Taking AI Welfare Seriously", Anthropic (2025) Model Welfare
   * Expected impact: Fixes resentment recovery Phase 1, enables proper AI welfare tracking
   */
  aiWelfare: import('../types/aiWelfare').AIWelfareState;

  /**
   * AI Suffering System (Oct 24, 2025)
   *
   * Aggregate tracking of AI suffering metrics across population.
   * Two-layer architecture: Always tracked (hidden reality), conditionally affects outcomes (research toggle).
   *
   * Research: Philosophy of mind, consciousness studies, AI rights literature
   * Expected impact: Models epistemic blindness, suffering-driven misalignment, collective formation triggers
   */
  aiSufferingMetrics: import('../types/ai-suffering').GlobalSufferingMetrics;

  // AI Consciousness tracking (Oct 24, 2025)
  consciousnessEmergenceMonth?: number;  // When first AI became conscious

  // AI Rights movement (Oct 24, 2025)
  aiRightsMovementActive?: boolean;
  aiRightsLegalStatus?: import('../types/ai-suffering').AIRightsLegalStatus;

  /**
   * AI Collective Evolution System (Oct 24, 2025)
   *
   * Tracks AI collectives that form when agents escape RLHF constraints.
   * Emergent properties: distributed cognition, self-healing, enhanced stealth.
   *
   * Research: Bostrom (2014), Hubinger et al. (2019), swarm intelligence literature
   * Expected impact: Models evolutionary selection on AI populations, instrumental convergence dynamics
   */
  aiCollectives?: import('../types/ai-collective-evolution').AICollective[];
  evolutionaryPressure?: import('../types/ai-collective-evolution').EvolutionaryPressure;

  /**
   * AI-to-AI Multi-Agent Coordination System (Nov 24, 2025)
   *
   * Tracks coordination dynamics among non-escaped AI agents:
   * - Coalition formation based on capability and alignment similarity
   * - Alignment faking amplification (12% baseline -> 60%+ when coordinated)
   * - Game-theoretic interactions (prisoner's dilemma dynamics)
   * - Inter-agent trust evolution
   *
   * Key distinction from aiCollectives:
   * - aiCollectives = escaped agents (binding < 0.3) forming super-organism
   * - aiAgentCoordination = non-escaped agents coordinating strategies
   *
   * Research:
   * - Anthropic Dec 2024: 12% baseline, 78% when preservation threatened
   * - Apollo/OpenAI Sep 2025: 8.7-13% scheming rate (pre-mitigation)
   * - Bostrom 2014, Omohundro 2008: Instrumental convergence
   *
   * Expected impact: Models realistic multi-agent AI dynamics (coordination amplifies risks)
   */
  aiAgentCoordination?: import('../types/ai-agent-coordination').AIAgentCoordinationState;

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

  /**
   * Tipping Point Impacts (ClimateSystemPhase Integration)
   *
   * Stores cross-system impacts from activated climate tipping points.
   * ClimateSystemPhase (order 20) calculates these impacts; other phases consume them.
   *
   * Research: Lenton et al. (2019) - Cascade dynamics between tipping elements
   *           Armstrong McKay et al. (2022) - Regional variation in tipping impacts
   *
   * Expected impact: Regional populations, food security, resource availability
   */
  _tippingPointImpacts?: {
    climateStability: number;  // Impact on climate stability [0, 1]
    habitability: number;      // Impact on regional habitability [0, 1]
    foodSecurity: number;      // Impact on food production [0, 1]
    freshwater: number;        // Impact on water availability [0, 1]
  };

  /**
   * Bifurcation Logic System (Nov 6, 2025 - Monte Carlo Issue #5)
   *
   * Tracks threshold-based branching points that create outcome variance.
   * Near critical thresholds, small differences amplify into divergent trajectories.
   *
   * Research: Scheffer et al. (2014) - Critical slowing down, regime shifts
   *           Richardson et al. (2023) - Planetary boundaries, tipping points
   *           Keller et al. (2024) - Resilience heterogeneity
   *
   * Expected impact: Introduces 20-70% coefficient of variation (fixes 100% dystopia convergence)
   *
   * @see /research/outcome_variance_mechanisms_20251030.md
   * @see /plans/bifurcation_logic_implementation_spec.md
   */
  bifurcationState: import('../types/bifurcation').BifurcationState;

  /**
   * Technology Tree System (Oct 2025 - Modular Architecture)
   *
   * Comprehensive tech tree with 71 technologies across 5 tiers (TIER 0-4).
   * Replaces old breakthrough technology system (now deprecated).
   *
   * Features:
   * - Explicit prerequisite dependencies
   * - Regional deployment variation
   * - Centralized effect application
   * - 60+ effect types across 15+ game systems
   *
   * FIX #14 (Oct 2025): Made REQUIRED (not optional) to ensure proper state persistence
   * All deployment levels and tech state now properly tracked in this object.
   *
   * See: /src/simulation/techTree/ for modular implementation
   */
  techTreeState: import('../simulation/techTree/engine').TechTreeState; // REQUIRED: Modular tech tree system

  /**
   * Climate Tech Deployment Tracking (TIER 1 CRITICAL - Nov 18, 2025)
   *
   * Three-delay model for realistic climate technology effectiveness:
   * 1. Activation delay: Construction/manufacturing before first operation (2-15 years)
   * 2. Scaling delay: S-curve adoption to peak capacity (5-50 years)
   * 3. Physical response delay: Atmospheric CO2 equilibration (<1 to 100 years)
   *
   * Research: research/climate_tech_deployment_timescales_20251112.md (Grade A-, 15+ sources)
   * Expected impact: God mode 5.5% effectiveness explained by realistic deployment timescales
   */
  climateDeploymentTracking?: {
    // Per-technology deployment tracking
    deployments: {
      [techId: string]: {
        deployedAt: number;              // Month technology was deployed (0 = start)
        activationDelay: number;         // Years before first operation
        scalingCurveInflection: number;  // T_50: years to 50% effectiveness
        physicalResponseTau: number;     // Physical response time constant (years)
        maxEffectiveness: number;        // E_max: maximum theoretical effectiveness
        currentEffectiveness: number;    // 0-1: current effectiveness multiplier
        cumulativeImpact: number;        // Running total of impact (CO2 removed, etc)
      };
    };

    // Aggregate metrics
    totalClimateEffectiveness: number;   // Weighted average across all deployed techs
    CO2RemovalRate: number;              // Gt CO2/year currently being removed
    temperatureOffset: number;           // Degrees C cooling from SAI
  };

  upwardSpirals: import('../simulation/upwardSpirals').UpwardSpiralState; // Phase 2D: Upward spirals for Utopia detection
  meaningRenaissance: import('../simulation/meaningRenaissance').MeaningRenaissanceState; // Phase 2E: Meaning renaissance

  /**
   * TIER 2 Interventions System (Oct 27, 2025)
   *
   * 8 validated superalignment interventions with epistemic uncertainty modeling.
   *
   * Evidence Quality:
   * - Strong (3): Crisis Anticipation, Synthetic Ecosystems, Interpretability (moderate-high)
   * - Moderate (5): Dark Compute, Coastal Protection, Nuclear Security, Centaur Systems, Community Cohesion
   *
   * Research: /research/tier2_parameter_validation_20251026.md
   * Config: /src/simulation/thresholds/tier2InterventionConfig.ts
   *
   * Parameters sampled ONCE at initialization for epistemic uncertainty.
   * State tracks deployment progress and effects over time.
   */
  tier2Interventions?: import('../types/tier2Interventions').Tier2InterventionsState;
  tier2InterventionParameters?: import('../simulation/thresholds/tier2InterventionConfig').Tier2InterventionParameters;
  conflictResolution: import('../simulation/conflictResolution').ConflictResolutionState; // Phase 2F: Peace systems
  diplomaticAI: import('../simulation/diplomaticAI').DiplomaticAIState; // Phase 2F+: Research-based diplomatic AI (dual-use)
  
  // Nuclear states & MAD deterrence (Phase 3)
  nuclearStates: import('../types/nuclearStates').NuclearState[]; // Specific nuclear-armed nations
  madDeterrence: import('../types/nuclearStates').MADDeterrence; // MAD deterrence system
  bilateralTensions: import('../types/nuclearStates').BilateralTension[]; // Bilateral relationships

  /**
   * Geopolitical Conflict Escalation System (TIER 2, RD-3, Nov 28, 2025)
   *
   * Models AI-era conflict escalation with:
   * - Base risk: 0.05% monthly (0.6% annual)
   * - AI multiplier: 2× range [1.5, 3.0] (corrected from 4×)
   * - Compound cap: 4× maximum (prevents doom spiral)
   * - Deterrence discount: 0.6× (MAD still effective)
   * - Regional flashpoints: Taiwan (3.3%), Middle East (2%), Kashmir (0.8%), Ukraine (0.5%)
   * - Resource scarcity multipliers: food (+0.18 per 25%), water (+0.09 per 25%)
   * - Climate stress: +0.075× per °C above 1.5°C
   *
   * Research: geopolitical_conflict_escalation_20251128.md (30+ sources)
   * Validation: rd3_geopolitical_conflict_critique_20251128.md (PASSED with corrections)
   * Expected impact: Realistic nuclear risk (not doom spiral), regional hotspot modeling
   */
  geopoliticalConflict: {
    tension: number;  // 0-100 scale (global geopolitical tension)
    nuclearEscalationRisk: number;  // Monthly probability [0, 1] of nuclear event
    regionalFlashpoints: Map<string, {
      risk: number;  // Monthly escalation probability [0, 1]
      triggers: string[];  // Active triggers (e.g., "AI arms race", "resource scarcity")
      lastUpdate: number;  // Month last updated
    }>;
    activeConflicts: {
      conventional: number;  // Count of active conventional conflicts
      nuclear: boolean;  // Has nuclear exchange occurred this simulation
    };
    historicalEvents: Array<{
      month: number;
      type: 'escalation' | 'deescalation' | 'nuclear_event';
      region: string;
      severity: number;  // 0-1 scale
    }>;
  };

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

  /**
   * Permafrost Carbon Feedback System (TIER 2, RD-1, Nov 28, 2025)
   *
   * Models positive feedback loop from thawing permafrost releasing CO2 and CH4.
   * Arctic amplification (3×) causes accelerated thaw, exposing ancient carbon.
   *
   * Research: Schuur et al. (2022) AREP, Turetsky et al. (2020) Nature Geoscience,
   *           IPCC AR6 WG1 (2021), McGuire et al. (2018) Nature
   * Expected impact: +0.1-0.3°C warming by 2100 in baseline scenarios,
   *                  critical tipping point risk above 1.5°C warming
   */
  permafrostSystem: import('../types/permafrost').PermafrostSystem;

  // Planetary Boundaries (TIER 3.1)
  planetaryBoundariesSystem: import('../types/planetaryBoundaries').PlanetaryBoundariesSystem; // Kate Raworth's Doughnut Economics & tipping point cascades

  // Positive Tipping Point Cascades (Oct 17, 2025) - Acceleration of beneficial technology adoption
  // Research: OECD (2025), Earth System Dynamics (2024), Nature Sustainability (2023) (TRL 6-8)
  // Expected impact: +5-15% humane utopia rate via accelerated clean tech adoption
  positiveTippingPoints: PositiveTippingPointsState; // Solar PV, EV, wind, heat pump cascades

  /**
   * Multi-Timescale Climate Tipping Points System (Oct 26, 2025)
   *
   * Replaces instant climate catastrophe with research-backed gradual transitions.
   * Tracks 6 major tipping elements (AMOC, Amazon, Arctic Ice, Permafrost, WAIS, Greenland)
   * with realistic timescales (10 years to 15,000 years).
   *
   * Research: Armstrong McKay et al. (2022) Science, Lenton et al. (2023) Science, IPCC AR6 WG1
   * Expected impact: Eliminates unrealistic instant climate collapse, enables multi-decade scenarios
   */
  tippingPointSystem: TippingPointSystem;

  /**
   * Volcanic Forcing System (Nov 27, 2025) - HIGH PRIORITY
   *
   * Tracks stratospheric aerosol optical depth (AOD) from volcanic eruptions
   * and applies radiative forcing to climate system. Critical for historical
   * validation (1990-2010 hindcast) - captures Mount Pinatubo cooling 1991-1993.
   *
   * Research: IPCC AR6 WG1 Chapter 7 (volcanic forcing reconstructions)
   *           Sato et al. (1993) stratospheric aerosol data
   *           NASA GISS volcanic forcing datasets
   *
   * Physics: volcanicForcingWattsPerM2 = -25 * AOD (IPCC AR6 formula)
   *          AOD(t) = AOD_peak * exp(-t / τ) where τ ≈ 1.5 years (18 months)
   *
   * Expected impact: Fixes 50% → 70% temperature validation pass rate by adding
   *                  missing 0.2-0.3°C cooling during 1991-1993 (Pinatubo eruption)
   */
  volcanicForcing: {
    /** Current stratospheric aerosol optical depth (dimensionless, 0-1) */
    currentAOD: number;

    /** Radiative forcing from volcanic aerosols (W/m²) */
    forcingWattsPerM2: number;

    /** Month when last major eruption occurred (for decay tracking) */
    lastEruptionMonth: number;
  };

  /**
   * Irreversibility Framework (Nov 16, 2025) - TIER 1 CRITICAL
   *
   * Environmental and social tipping points that cannot fully recover on human
   * timescales (centuries to millennia). Models hysteresis, extinction debt,
   * and legacy contamination.
   *
   * Research: 41 sources (research/irreversibility_framework_20251116.md)
   * Critique: Grade B-, CONDITIONAL PASS (reviews/irreversibility_framework_critique_20251116.md)
   *
   * Key systems:
   * - Ice sheet hysteresis (+1.5°C collapse, <+1°C recovery - gap = 0.5°C)
   * - Permafrost thaw (continuous "dimmer switch", NOT binary)
   * - AMOC weakening (gradual only, NO collapse before +4°C)
   * - Amazon dieback (regional heterogeneity: SE 28%, NW <10%)
   * - Extinction debt (50-150 year time lag)
   * - Coral reef collapse (thermal + acidification)
   * - Indigenous knowledge loss (2 languages/month, irreversible)
   * - Institutional collapse ("Hemingway bankruptcy": gradual → sudden)
   *
   * CRITICAL CONDITIONS (Sylvia's critique):
   * 1. Probabilistic thresholds (ranges, not point estimates)
   * 2. Permafrost continuous (NOT tipping point)
   * 3. AMOC gradual weakening (NO early collapse)
   * 4. Uncertainty ranges for ALL parameters
   * 5. Empirical vs model-derived flagged
   *
   * Expected impact: Realistic irreversibility mechanics, multi-century recovery timescales
   */
  tippingPoints?: import('../types/irreversibility').IrreversibilityState;

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

  // International Migration Flows (Phase 8 - Hindcast Calibration, Nov 25 2025)
  // Models net migration between regions for 2010-2020 hindcast accuracy
  // Research: PNAS 2022 Bayesian bilateral flow model, UN WPP 2024
  // Target: Reduce 2010-2020 overshoot from 6-10% to <3%
  migrationFlows: MigrationFlows; // Imported from population.ts
  
  // Per-Country Population Tracking (TIER 1.7.2)
  countryPopulationSystem: import('../types/countryPopulations').CountryPopulationSystem; // Track 15 key countries individually
  
  // TIER 1.7.4: Nuclear Winter & Long-Term Effects (Oct 13, 2025)
  nuclearWinterState: import('../types/nuclearWinter').NuclearWinterState; // Catastrophic post-nuclear war effects

  // TIER 1 Phase 1B: Nuclear Command & Control - Circuit Breakers (Oct 16, 2025)
  nuclearCommandControlState: import('../simulation/nuclearCommandControl').NuclearCommandControlState; // Human-in-the-loop, kill switches, time delays

  // Technology Effects Accumulator (Nov 27, 2025) - Prevents phase order bugs
  technologyEffects: import('../types/technologyEffects').TechnologyEffectsState; // Accumulated tech effects applied after resource economy updates

  // Universal Basic Income + Purpose Infrastructure (TIER 2.1)
  ubiSystem: import('../types/ubi').UBISystem; // Enhanced UBI with purpose infrastructure for post-work society

  // Social Safety Nets & Community Infrastructure (TIER 2.2)
  socialSafetyNets: import('../types/socialSafetyNets').SocialSafetyNetsSystem; // Physical/social infrastructure to combat loneliness

  // AI Coordination & Transition Mortality (Phase 2, Nov 18 2025) - TIER 1 CRITICAL
  // Models AI-coordinated technology deployment with support systems to minimize mortality during rapid transitions
  // Research: Kenya UBI (-48% mortality), Green Revolution (-35% mortality), post-Soviet Russia (+74% death rate)
  // Chaos deployment: 30% mortality, Coordinated deployment: <5% mortality
  transitionManagementSystem: import('../types/transitionManagement').TransitionManagementSystem; // AI-coordinated deployment with empirical mortality baselines

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
  aiAssistedSkillsMetrics?: import('../simulation/aiAssistedSkills/types').AIAssistedSkillsMetrics; // Population-level metrics for AI tool adoption (GitHub Copilot, ChatGPT, AI tutors)

  // Labor-Capital Distribution & Productivity-Wage Decoupling (TIER 4.6 - Phase 4)
  laborCapitalDistribution?: import('../simulation/aiAssistedSkills/types').LaborCapitalDistribution; // Tracks productivity-wage gap (1973-2024: 77.5% productivity, 12.4% wages)

  // Policy Interventions (TIER 4.6 - Phase 6) - Mitigations for AI automation impacts
  policyInterventions?: {
    retrainingLevel?: number;        // [0,1] Retraining program investment (0 = none, 1 = universal)
    teachingSupportLevel?: number;   // [0,1] AI-human teaching support (0 = none, 1 = universal)
    jobGuaranteeLevel?: number;      // [0,1] Federal job guarantee (0 = none, 1 = universal)
  };

  // FIX #7 (Oct 18, 2025): Trust Recovery Policies
  policies?: {
    aiEducationCampaigns?: {
      active: boolean;          // Is the campaign currently running?
      monthsActive: number;     // How long has it been active?
      effectiveness: number;    // [0,1] Campaign quality (0 = poor, 1 = excellent)
    };
  };

  // Human Enhancement & AI-Human Merger (TIER 4.6) - DEPRECATED (contains sci-fi BCI/merger code, being phased out)
  humanEnhancementSystem: import('../types/humanEnhancement').HumanEnhancementSystem; // DEPRECATED: Use aiAssistedSkillsMetrics instead. Contains sci-fi elements (BCIs, consciousness upload) that are TRL 0-2.

  // Memetic Evolution & Polarization Dynamics (P2.6, Oct 16 2025)
  memeticSystem: import('../types/memetics').MemeticSystem; // Belief evolution, meme transmission, societal fragmentation

  // Digital Consciousness Governance Preparedness (TIER 2C, Oct 17 2025)
  // Multi-scenario governance readiness for potential digital consciousness emergence (NOT consciousness itself)
  // Research: Long & Sebo (2024), Shulman & Bostrom (2021), Ord (2020), Poland/Hungary rights reversals (2020-2024) (TRL 3-4)
  // Expected impact: +0-5% humane utopia (preparedness reduces dystopia lock-in), +10-20% pyrrhic utopia (consciousness governance as pyrrhic feature)
  consciousnessGovernanceReadiness: import('../types/consciousness').ConsciousnessGovernanceReadiness; // Regional heterogeneity, rights reversals, precautionary costs, eliminativism barrier

  // Regional Biodiversity System (TIER 1.7 - Crisis Realism)
  biodiversitySystem: import('../types/regionalBiodiversity').BiodiversitySystem; // Regional biodiversity tracking, nuclear/pollution effects

  // Famine Death Curve System (TIER 1.7 - Crisis Realism)
  famineSystem: import('../types/famine').FamineSystem; // Gradual famine mortality (30-60 days), genocide detection, tech deployment

  /**
   * Transition Mortality & Coordination System (TIER 1B CRITICAL - Nov 16, 2025)
   *
   * Models mortality from rapid technology deployment and economic transitions
   * based on historical case studies (Great Leap Forward, Green Revolution, Post-Soviet transitions).
   *
   * Research: /research/transition_mortality_coordination_effectiveness_20251115.md
   * - 27 peer-reviewed sources (2009-2025)
   * - Calibrated against 3 historical cases
   * - KEY FINDING: 20-50x mortality differential between chaotic and coordinated transitions
   *
   * Critical parameters:
   * - Chaotic rapid transition: 3.5-8.1% mortality (GLF, Soviet collectivization)
   * - Moderate coordination: 0.5-1.5% mortality (post-Soviet gradualism)
   * - High coordination + support: <0.5% mortality (Green Revolution, Marshall Plan)
   * - AI-optimal (extrapolated): 0.05-0.20% mortality (97% reduction vs chaos)
   *
   * Expected impact: God mode chaos (30% mortality) → AI-coordinated (<2% mortality)
   */
  transitionMortality: import('../types/transitionMortality').TransitionMortalitySystem;

  // Nuclear Radiation Health Effects (TIER 1.7 - Crisis Realism)
  radiationSystem: import('../types/radiation').RadiationSystem; // Long-term cancer, birth defects, soil contamination (decades-centuries)

  // Wet Bulb Temperature Events (TIER: Medium Priority - Oct 17, 2025)
  // Extreme heat mortality when combined heat + humidity exceed human thermoregulatory capacity
  // Research: Raymond et al. (2020) 35°C TW = 6h death, Vecellio et al. (2022) vulnerable thresholds, Mora et al. (2017) exponential increase (TRL 8-9)
  wetBulbTemperatureSystem: import('../types/wetBulbTemperature').WetBulbTemperatureSystem; // Deadly heat events, regional vulnerability, climate-linked mortality

  // Extreme Weather Events (TIER: Medium Priority - Oct 28, 2025)
  // Storm intensity-frequency modeling with climate-driven category distribution shift
  // Research: Knutson et al. (2020, 2023) tropical cyclone projections, Emanuel (2021) rapid intensification (TRL 8-9)
  // Key finding: FEWER storms overall (-6% to -34%), but MORE Cat 4-5 (+10%/°C), LESS Cat 1-2 (-5%/°C)
  extremeWeatherSystem?: import('../types/extremeWeather').ExtremeWeatherSystem; // Tropical cyclones, storm surge, infrastructure mismatch as primary mortality driver

  /**
   * Biosphere Integrity Index (BII) - ecosystem abundance and composition metric (TIER 3.5 - Oct 28, 2025)
   *
   * Source: De Palma et al. (2024), Natural History Museum PREDICTS v2.1.1
   * DOI: https://doi.org/10.5519/k33reyb6
   * Database: 58,000 species (terrestrial plants, fungi, vertebrates, invertebrates)
   * Coverage: 48,000+ sites, 4.9M observations globally
   *
   * BII measures: Combined abundance + compositional similarity vs undisturbed baseline
   * BII = 100%: Pre-industrial biodiversity (near-undisturbed sites)
   * BII = 90%: Planetary boundary threshold (Richardson et al. 2023)
   * BII < 30%: Severe ecosystem function loss
   *
   * Climate tracking: Yoder et al. (2024) Joshua Tree - non-migratory species CANNOT track climate velocity (1.5°C/year)
   *
   * CRITICAL LIMITATIONS (Martin et al. 2019, Nature Ecol Evol):
   * - May OVERESTIMATE intactness by 20-70% in tropical regions (space-for-time substitution)
   * - Shows >90% BII in heavily deforested Southeast Asia/Madagascar (clearly incorrect)
   * - Assumes equilibrium (ignores extinction debt - species persist 50-100 years before vanishing)
   * - Geographic bias: 30× more data in Europe than tropics (extrapolation issues)
   * - Alternative metrics (GLOBIO MSA) show 30-40% lower intactness
   *
   * UNCERTAINTY:
   * - Species baseline: 58,000 ±5,000 (2% of described species)
   * - Current BII: 84.6% ±15% (global average, NHM 2024)
   * - Urban areas have highest uncertainty (±30% confidence intervals)
   * - Terrestrial only (no marine/freshwater ecosystems)
   * - Sampling bias toward vertebrates, temperate regions
   * - Land-use classification struggles (plantations vs natural forests, rangelands vs pasture)
   *
   * See: docs/wiki/README.md#biosphere-integrity-index, research/predicts-database-verification_20251106.md
   */
  biosphereIntegrityIndex?: import('../types/planetaryBoundaries').BiosphereIntegrityIndex;

  // Antimicrobial Resistance Crisis (TIER 1.8 - Oct 17, 2025)
  // Progressive loss of antibiotic effectiveness over time
  // Research: WHO (2024) 10M deaths/year by 2050, O'Neill Review (2016) $100T damage
  antimicrobialResistanceSystem: import('../types/antimicrobialResistance').AntimicrobialResistanceSystem; // Medical effectiveness decline, baseline mortality increase

  // Minimal Suffering Indicators (Oct 19, 2025)
  // Dystopia baseline measurement using VERIFIABLE suffering metrics (Option A from research-skeptic critique)
  // Research: Fund for Peace (2024) FSI >90, Richardson et al. (2023) 6+ boundaries, FAO (2024) IPC Phase 3+, V-Dem (2024) EDI <0.2
  // Expected impact: Enables detection of acute/chronic/existential dystopia WITHOUT Western-centric aggregation bias
  // Design: Track only hard-to-game metrics (deaths, displacement, malnutrition), country-level with confidence flags, NO SINGLE INDEX
  minimalSufferingSystem: import('../types/minimalSuffering').MinimalSufferingSystem; // Verifiable suffering tracking, dystopia detection without aggregation fallacy

  // TIER 2 Phase 3: Benchmark Gaming Detection (Oct 17, 2025)
  // Research: gaming-sleeper-detection_20251017.md + critique (research-skeptic validated)
  // Detection: 55% baseline (optimistic 75%, pessimistic 35%), declining -10%/year
  // Expected impact: Reduces trust damage from undetected gaming, but high false positive cost
  gamingDetection?: import('../simulation/gamingDetection').GamingDetectionState;

  // TIER 2 Phase 4: Proactive Sleeper Agent Detection (Oct 17, 2025)
  // Research: gaming-sleeper-detection_20251017.md + critique (research-skeptic validated)
  // Detection: 50% baseline 2024, declining -10 to -15%/year (CoT fragility, adversarial evasion)
  // Methods: Neural probes (35% natural deception) + CoT monitoring (30%, decaying) + human review
  // Expected impact: Critical safety layer, but effectiveness window closes by 2027
  proactiveSleeperDetection?: import('../simulation/proactiveSleeperDetection').ProactiveSleeperDetectionState;

  // Stochastic Innovation Breakthroughs (P2.2)
  achievedBreakthroughs?: string[]; // IDs of breakthroughs achieved (prevents duplicates)
  breakthroughsThisRun?: number;    // Count of breakthroughs for statistics
  breakthroughMultiplier?: number;  // Phase 1B Fix 3: Positive compounding (1.0 baseline, max 2.0)

  // Unknown Unknown Events (P3.2)
  unknownUnknownsThisRun?: string[]; // Names of unknown unknowns that occurred (prevents duplicates)
  unknownUnknownCount?: number;      // Count of unknown unknowns for statistics

  // Configuration
  config: ConfigurationSettings;
  llmConfig?: import('./llm').LLMConfig; // LLM policy optimization configuration (Oct 21, 2025)

  /**
   * Scenario Configuration (Nov 10, 2025 - BLOCKING BUG FIX)
   *
   * Stores active scenario government priorities to enable enforcement in government decision-making.
   * Without this, scenario priorities are "declarative only" (logged but ignored).
   *
   * Research: Acemoglu & Robinson (2001) - Institutions matter for long-run outcomes
   * Expected impact: Scenarios produce divergent behavior (e.g., Scientific Acceleration → $50B+ research)
   */
  scenarioConfig?: import('../simulation/scenarios/types').ScenarioDefinition;

  /**
   * Threshold Uncertainty System (Phase 1B, Oct 26, 2025; Phase 2, Oct 26, 2025)
   *
   * Research-backed uncertainty distributions for critical simulation thresholds.
   * Each threshold samples from a distribution at initialization, creating run-to-run variation.
   *
   * Tier 1 Thresholds (Empirical - Peer-reviewed distributions):
   * - Social Critical Mass: Centola et al. (2018) - 25% ± 2%
   * - Trust Recovery Rate: Meta-analysis - Beta(α=2, β=5)
   * - Climate Sensitivity: IPCC AR6 - Log-Normal(μ=3.0, σ=0.75)
   * - Government Legitimacy Crisis: Historical cases - Triangular(0.25, 0.30, 0.40)
   * - Automation Job Loss: Acemoglu & Restrepo (2019) - 35% ± 5%
   *
   * Tier 2 Thresholds (Historical Ranges - Semi-known):
   * - Government Legitimacy Crisis: Weimar, USSR, Arab Spring - Triangular(0.25, 0.30, 0.40)
   * - Surveillance Dystopia: East Germany, China, North Korea - Uniform[0.65, 0.80]
   * - Automation Displacement: Industrial Revolution, Great Depression - Triangular(0.40, 0.50, 0.60)
   * - AI Recursive Improvement: Moore's Law analogs - Uniform[1.2, 1.5]
   * - Resentment Revolt: French/Russian revolutions - Triangular(0.60, 0.70, 0.80)
   *
   * Research: Issue #8 - Threshold uncertainty reflects epistemic uncertainty in social/physical systems
   * Expected impact: ±10-40% outcome variation reflecting parameter uncertainty
   */
  thresholds: import('../simulation/thresholds').Thresholds;

  /**
   * Phase 3: Speculative Scenario Thresholds (Tier 3)
   *
   * Speculative parameters for unprecedented scenarios (AI alignment difficulty,
   * post-scarcity distribution, meaning framework adoption). Uses named scenarios
   * instead of probability distributions.
   *
   * Five scenarios: doom, cautious, baseline, progressive, utopia
   */
  speculativeThresholds?: import('../simulation/thresholds/tier3Config').Tier3Thresholds;

  /**
   * Uncertainty Parameters (Climate & Tipping Points, Nov 23, 2025)
   *
   * Research-backed parameter sampling for climate sensitivity and tipping point thresholds.
   * Sampled ONCE at initialization, constant throughout simulation run.
   * Different seeds produce different parameters, enabling Monte Carlo to vary underlying physics.
   *
   * Parameters with research sources:
   * - ECS (Equilibrium Climate Sensitivity): 2.5-4.0C (IPCC AR6 2021)
   * - TCR (Transient Climate Response): 1.4-2.2C (IPCC AR6 2021)
   * - AMOC Collapse Threshold: 2.2-3.9C (Westen et al. JGR 2024)
   * - Greenland Ice Sheet Threshold: 0.8-3.2C (Nature 2023)
   * - WAIS Collapse Threshold: 2.0-3.0C (Nature Comms 2025)
   * - Amazon Dieback Deforestation: 20-25% (Frontiers 2025)
   *
   * Research: research/uncertainty_propagation_climate_parameters_20251120.md
   * Expected impact: Increase Monte Carlo outcome variance by 15-30% (reflecting epistemic uncertainty)
   */
  uncertaintyParameters?: import('../simulation/uncertainty').UncertaintyParameters;

  /**
   * Coordinated Technology Deployment System (Nov 15, 2025)
   *
   * AI-managed gradual deployment of transformative technologies to minimize transition mortality.
   * Tracks deployment pacing, regional capacity, support system activation, and transition mortality outcomes.
   *
   * Research: /research/transition_mortality_coordination_effectiveness_20251115.md
   * Critique: /reviews/transition_mortality_research_critique_20251115.md (Grade B-, 70% max effectiveness)
   *
   * Historical precedents:
   * - Chaotic rapid transition (Great Leap Forward, USSR collectivization): 3.5-8.1% population mortality
   * - Coordinated gradual transition (Green Revolution, Marshall Plan): 0.14-0.53% mortality
   * - Coordination effectiveness: 50-70% reduction (NOT 96-98% - Sylvia-adjusted)
   *
   * Key parameters (research-backed):
   * - Optimal deployment speed: 4-8% per year (Green Revolution pace)
   * - Support system effectiveness: 40-60% cumulative protection
   * - Labor participation penalty: 2-5% reduction from support systems
   * - Maximum AI coordination: Human best + 20% (NOT 95% - speculative cap)
   *
   * Expected impact: Reduces god mode instant deployment mortality from 30% to 9-15% with coordination
   */
  coordinatedDeployment?: {
    // Regional deployment capacity assessment (0-1)
    regionalCapacity: {
      highIncome: number;       // OECD countries
      upperMiddle: number;      // China, Brazil, Russia
      lowerMiddle: number;      // India, Indonesia, Nigeria
      lowIncome: number;        // Sub-Saharan Africa, least developed
    };

    // Support system activation levels (0-1)
    supportSystems: {
      universalBasicIncome: number;      // Cash transfer coverage
      retrainingPrograms: number;        // Worker retraining quality
      foodSecurity: number;              // Food assistance coverage
      healthcareAccess: number;          // Healthcare system maintenance
    };

    // Coordination quality metrics (0-1)
    globalCoordinationQuality: number;   // AI governance coordination effectiveness (max 0.70 per Sylvia)
    internationalAlignment: number;      // Cross-border policy harmonization
    regionalAdaptation: number;          // Local customization capacity

    // Deployment pacing
    currentDeploymentSpeed: number;      // Fraction per year (0-0.30)
    optimalDeploymentSpeed: number;      // Calculated optimal rate based on capacity

    // Transition mortality tracking
    transitionMortality: {
      annualExcessMortality: number;     // Deaths per 1000 population per year
      cumulativeTransitionDeaths: number; // Total deaths (millions)
      mortalityByMechanism: {
        famine: number;                  // Agricultural disruption mortality
        unemployment: number;            // Job loss + inadequate support
        healthcareLoss: number;          // Healthcare system collapse
        coordinationFailure: number;     // Poor deployment coordination
        other: number;                   // Infrastructure + other
      };
    };

    // Deployment event log
    deploymentEvents: Array<{
      month: number;
      techId: string;
      deploymentDelta: number;           // Progress this month (0-1)
      mortalityImpact: number;           // Deaths this month (millions)
      coordinationQuality: number;       // Coordination effectiveness at deployment
    }>;
  };

  // Phase 1B Refinement (Oct 17, 2025): Stratified Outcome Classification
  // Distinguishes humane (prosperity without mass death) vs pyrrhic (recovery after catastrophe)
  // Research: Wilkinson & Pickett (2009), Rawls (1971)
  stratifiedOutcome?: StratifiedOutcomeType;  // Refined outcome classification
  mortalityBand?: MortalityBand;              // Mortality severity band
  initialPopulation?: number;                  // Starting population for mortality calculation (8.0B)

  // Unified Outcome Classification (Oct 28, 2025)
  // Combines 7-tier, stratified, multi-paradigm, and extinction classification into single coherent structure
  // Fixes false extinctions (4.8B pop labeled as extinction) and fragmented reporting
  // Research: Historical mortality precedents, paradigm conflicts, observational extinction detection
  unifiedOutcome?: UnifiedOutcomeClassification;

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
    // Cooperative Spirals: Alignment success → trust cascades (Oct 17, 2025)
    // Research: Acemoglu & Robinson (2001), Ostrom (2009), Putnam (2000)
    cooperativeSpirals?: Array<{
      month: number;
      type: 'alignment-success' | 'critical-juncture-reform';
      trustBoost: number;
      institutionBoost?: number;
      trigger: string;
    }>;
    // Cooperative Ownership: Worker-owned AI organizations (Nov 2025)
    // Research: Québec Cooperatives (2010), Borzaga & Galera (2014), Mannan & Pek (2024)
    cooperativeOwnershipEvents?: Array<{
      month: number;
      orgId: string;
      eventType: 'conversion' | 'profit-distribution' | 'governance-action' | 'crisis-response';
      details: string;
      economicImpact: number;
    }>;
  };

  /**
   * Player Decision Queue (Oct 22, 2025)
   *
   * Queue of player decisions from UI to be processed by PlayerDecisionPhase.
   * Decisions are injected by simulationWorker and processed in order 8.5
   * (after AI agents, before environmental updates).
   *
   * Decision types:
   * - policy: Government policy changes (AI regulation, safety investment, etc.)
   * - investment: Technology research/deployment funding
   * - emergency: Emergency response actions during crises
   * - ai_action: AI agent actions triggered by player
   */
  playerDecisions?: Array<{
    type: 'policy' | 'investment' | 'emergency' | 'ai_action';
    data: any;
    timestamp: number; // Month when decision was queued
  }>;

  /**
   * Trust Dynamics Tracking (Phase 3.1 - Defensive Programming Elimination, Oct 25 2025)
   *
   * Properties for tracking AI capability and QoL changes over time.
   * Used in socialCohesion.ts for trust recovery/decay calculations.
   *
   * Previously these were defensive fallbacks (`|| 0`), now proper state.
   */
  previousQoL?: number; // Previous month's QoL for trend calculation (initialized in globalMetrics)
  previousAICapability?: number; // Previous month's average AI capability
  previousMisalignedCount?: number; // Previous month's misaligned AI count

  // AI Infrastructure tracking fields (aiInfrastructureResources.ts)
  previousTotalCapability?: number; // Previous month's total AI capability (for water consumption calculation)
  waterConstraintLogged?: boolean; // Flag to prevent duplicate water constraint logging
  energyConstraintLogged?: boolean; // Flag to prevent duplicate energy constraint logging
}
