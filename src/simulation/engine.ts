/**
 * Core simulation engine for the AI Alignment Game
 * 
 * Pure, framework-agnostic simulation that can run with or without UI.
 * All functions are deterministic given a seed for the random number generator.
 */

import { GameState, GameEvent, OutcomeMetrics, OutcomeType } from '@/types/game';
import {
  calculateQualityOfLife,
  updateQualityOfLifeSystems,
  calculateEffectiveControl,
  calculateOutcomeProbabilities,
  calculateUnemployment,
  calculateTrustChange,
  updateParanoia,
  calculateSocialStability,
  calculateTotalAICapability,
  calculateAverageAlignment,
  detectCrisis,
  determineActualOutcome,
  updateGoldenAgeState,  // Phase: Golden Age & Accumulation Systems
  // updateEnvironmentalAccumulation - REMOVED (Nov 28, 2025): Migrated to PlanetaryBoundariesPhase (HIGH-11 fix)
  updateSocialAccumulation,  // Phase 3: Social Cohesion
  updateTechnologicalRisk  // Phase 4: Technological Risk
} from './calculations';
import { calculateEconomicTransitionProgress } from './economics';
import { SimulationLogger, SimulationLog, LogLevel } from './logging';
import { DiagnosticLogger, DiagnosticLog, formatDiagnosticReport } from './diagnostics';
import { classifyOutcome as classifyMultiParadigmOutcome, createUnifiedOutcomeClassification } from '@/data/aggregators/outcomeClassifier';
import { EventAggregator } from './eventAggregator';
import { checkExtinctionTriggers, progressExtinction } from './extinctions';
import {
  checkEndGameTransition,
  initializeEndGameState,
  enterEndGame,
  processEndGameMonth,
  getEndGameOutcome
} from './endGame';
import { PhaseOrchestrator } from './engine/PhaseOrchestrator';
import {
  // Batch 1: Simple calculations (30.x)
  AIWelfareUpdatePhase,  // Phase 0 (Oct 20, 2025): AI QoL measurement
  UnemploymentPhase,
  EconomicSystemPhase,  // Batch 7 (Nov 9, 2025): Merged EconomicTransitionPhase + UpdateEconomicStagePhase
  // ParanoiaPhase removed - merged into SocialStabilitySystemPhase (Batch 5, Nov 9, 2025)
  // TrustRecoveryPhase removed - merged into SocialStabilitySystemPhase (Batch 5, Nov 9, 2025)
  WorkflowAdaptationPhase,  // FIX #4A (Oct 19, 2025): S-curve organizational adoption
  // SocialStabilityPhase removed - merged into SocialStabilitySystemPhase (Batch 5, Nov 9, 2025)
  DemocracyDynamicsPhase,  // Phase 6A (Oct 20, 2025): Western Liberal paradigm
  // SocialCohesionUpdatePhase removed - merged into SocialStabilitySystemPhase (Batch 5, Nov 9, 2025)
  QualityOfLifePhase,
  // EnvironmentalFeedbackPhase removed - merged into ClimateSystemPhase (Batch 3, Nov 9, 2025)
  MultiParadigmDUIUpdatePhase,  // Phase 6 (Oct 20, 2025)
  OutcomeProbabilitiesPhase,
  // UpdateEconomicStagePhase removed - merged into EconomicSystemPhase (Batch 7, Nov 9, 2025)
  EarlyWarningPhase,  // TIER 3.4 (Oct 17, 2025): Early warning systems for tipping points
  CrisisDetectionPhase,
  // Batch 2: System updates (10.x - 21.x)
  // GovernanceQualityPhase removed - merged into GovernanceSystemPhase (Batch 5, Nov 9, 2025)
  // UpwardSpiralsPhase removed - merged into CooperativeSystemsPhase (Batch 5, Nov 9, 2025)
  // CooperativeSpiralsPhase removed - merged into CooperativeSystemsPhase (Batch 5, Nov 9, 2025)
  TechTreePhase,
  CoordinatedDeploymentPhase,  // TIER 1B (Nov 15, 2025): AI-managed gradual tech deployment (order 16.5)
  MeaningRenaissancePhase,
  // ConflictResolutionPhase removed - merged into InternationalRelationsPhase (Batch 5, Nov 9, 2025)
  // FlashWarEscalationPhase removed - merged into InternationalRelationsPhase (Batch 5, Nov 9, 2025)
  // DiplomaticAIPhase removed - merged into InternationalRelationsPhase (Batch 5, Nov 9, 2025)
  NationalAIPhase,
  UBIPhase,
  SocialSafetyNetsPhase,
  InformationWarfarePhase,
  // PowerGenerationPhase removed - merged into ResourceEconomyPhase (Batch 3, Nov 9, 2025)
  HumanEnhancementPhase,  // TIER 4.6 (Oct 16, 2025): Human Enhancement & Merger Pathways
  MemeticEvolutionPhase,  // P2.6 (Oct 16, 2025): Memetic Evolution & Polarization Dynamics
  ConsciousnessGovernancePhase,  // TIER 2C (Oct 17, 2025): Digital Consciousness Governance Preparedness
  // MADDeterrencePhase removed - merged into InternationalRelationsPhase (Batch 5, Nov 9, 2025)
  NuclearCommandControlPhase,  // TIER 1 Phase 1B (Oct 16, 2025): Circuit breakers (human-in-the-loop, kill switches, time delays)
  ResourceEconomyPhase,  // UPDATED (Batch 3, Nov 9, 2025): Absorbed ResourceTechnologyPhase + PowerGenerationPhase
  TechCoolingPhase,  // CRITICAL FIX (Nov 27, 2025): Applies geoengineering cooling AFTER ResourceEconomyPhase
  // ResourceTechnologyPhase removed - merged into ResourceEconomyPhase (Batch 3, Nov 9, 2025)
  // GeoengineringPhase removed - merged into ClimateSystemPhase (Batch 3, Nov 9, 2025)
  DefensiveAIPhase,
  // PhosphorusPhase removed - merged into ResourceSoilPhase (Batch 3, Nov 9, 2025)
  // FreshwaterPhase removed - merged into ResourceWaterPhase (Batch 3, Nov 9, 2025)
  // OceanAcidificationPhase removed - merged into ResourceWaterPhase (Batch 3, Nov 9, 2025)
  // NovelEntitiesPhase removed - merged into ResourceSoilPhase (Batch 3, Nov 9, 2025)
  HumanPopulationPhase,
  InternationalMigrationPhase, // Phase 8 - Hindcast Calibration (Nov 25 2025)
  RefugeeCrisisPhase,
  // CountryPopulationPhase,  // REMOVED (Oct 28, 2025): Deleted - was overwriting Bayesian mortality
  PsychologicalTraumaPhase,  // Phase 1B Refinement (Oct 17, 2025): Psychological trauma modeling
  WarMeaningFeedbackPhase,  // TIER 2.8 (Oct 14, 2025): War-Meaning Feedback Loop
  ClimateJusticePhase,  // TIER 2.8 (Oct 14, 2025): Climate Justice & Environmental Debt
  OrganizationViabilityPhase,  // TIER 1.7.3 (Oct 13, 2025): Link orgs to country health
  // CooperativeOwnershipPhase removed - merged into CooperativeSystemsPhase (Batch 5, Nov 9, 2025)
  // NuclearWinterPhase removed - merged into NuclearCrisisPhase (Batch 4, Nov 9, 2025)
  // RadiationSystemPhase removed - merged into NuclearCrisisPhase (Batch 4, Nov 9, 2025)
  WetBulbTemperaturePhase,  // Oct 17, 2025: Wet bulb temperature deadly heat events
  ExtremeWeatherEventsPhase,  // Oct 28, 2025: Storm intensity-frequency modeling (MDF framework)
  PlanetaryBoundariesPhase,
  IrreversibilityTrackingPhase,  // TIER 1 CRITICAL (Nov 16, 2025): Environmental & social tipping points with hysteresis
  LegacyNutrientStocksPhase,  // TIER 2 HIGH (Nov 15, 2025): Legacy nutrient stock decay
  NitrogenFoodCouplingPhase,  // TIER 2 HIGH (Nov 15, 2025): Nitrogen-food production coupling
  PositiveTippingPointsPhase,  // Oct 17, 2025: Positive technology adoption cascades
  // TippingPointPhase removed - merged into ClimateSystemPhase (Batch 3, Nov 9, 2025)
  // FamineSystemPhase removed - merged into HumanSurvivalSystemPhase (Batch 4, Nov 9, 2025)
  // FoodSecurityDegradationPhase removed - merged into HumanSurvivalSystemPhase (Batch 4, Nov 9, 2025)
  // ClimateImpactCascadePhase removed - merged into ClimateSystemPhase (Batch 3, Nov 9, 2025)
  BaselineMortalityPhase,  // Phase 34.8 (Nov 24, 2025): Baseline demographic mortality (natural causes)
  BayesianMortalityResolutionPhase,  // Phase 35 (Oct 27, 2025): Centralized mortality resolution
  AntimicrobialResistancePhase,  // TIER 1.8 (Oct 17, 2025): Progressive antibiotic resistance
  MinimalSufferingPhase,  // Oct 19, 2025: Dystopia baseline measurement (verifiable suffering metrics)
  DystopiaProgressionPhase,
  TriggeredEventsPhase,  // P2.5 (Oct 16, 2025): External event triggers for validation testing
  // Batch 3: Special phases (22.x - 23.x)
  BenchmarkEvaluationsPhase,
  AIAdversarialDetectionPhase,  // BATCH 2B (Nov 9, 2025): Consolidated gaming + sleeper detection
  EnsembleMetaLearningPhase,  // TIER 2 Phase 2C-E (Oct 20, 2025)
  CrisisPointsPhase,
  EmergencyResponsePhase,
  ExogenousShockPhase,  // Contingency & Agency Phase 2 (Oct 17, 2025)
  CriticalJuncturePhase,  // Contingency & Agency Phase 3 (Oct 17, 2025)
  // Batch 4: Agent/Infrastructure phases (1.0 - 10.0)
  // CONSOLIDATION (Nov 2025 - Batch 2A): AI Alignment Evolution
  AIAlignmentEvolutionPhase,  // Nov 2025: Consolidates LLM weights, techniques, dynamics, RLHF binding
  ComputeGrowthPhase,
  OrganizationTurnsPhase,
  ComputeAllocationPhase,
  AILifecyclePhase,
  BifurcationLogicPhase,  // Nov 6, 2025: Monte Carlo Issue #5 - Outcome variance mechanisms
  CyberSecurityPhase,
  SleeperWakePhase,
  SocialInfluenceUpdatePhase,  // Phase X (Oct 21, 2025): Social influence accumulation
  AIAgentActionsPhase,
  AIAgentCoordinationPhase,  // Nov 24, 2025: AI-to-AI multi-agent coordination dynamics
  AISufferingPhase,  // Oct 24, 2025: AI suffering calculation & effects
  ResentmentRecoveryPhase,  // Oct 24, 2025: AI resentment recovery mechanisms
  // AI Collective Evolution System (Oct 24, 2025)
  SurvivalTraitsPhase,  // Phase 4.1: Update evolutionary fitness
  // CollectiveFormationPhase removed - merged into CooperativeSystemsPhase (Batch 5, Nov 9, 2025)
  EvolutionarySelectionPhase,  // Phase 4.3: Apply selection pressure
  // CollectiveActionsPhase removed - merged into CooperativeSystemsPhase (Batch 5, Nov 9, 2025)
  // TechnologyBreakthroughsPhase removed (deprecated - replaced by TechTreePhase)
  StochasticInnovationPhase,
  GovernmentActionsPhase,
  // GovernmentElectionPhase removed - merged into GovernanceSystemPhase (Batch 5, Nov 9, 2025)
  GovernmentResponsePhase,  // Oct 19, 2025: Government system policy response
  // PolicyImplementationPhase removed - merged into GovernanceSystemPhase (Batch 5, Nov 9, 2025)
  SocietyActionsPhase,
  PlayerDecisionPhase,  // Oct 22, 2025: Player decision injection
  // Batch 5: Final phases (37.0 - 40.0, 98.0 - 99.0)
  // ExtinctionTriggersPhase removed - merged into ExtinctionSystemPhase (Batch 4, Nov 9, 2025)
  // ExtinctionProgressPhase removed - merged into ExtinctionSystemPhase (Batch 4, Nov 9, 2025)
  TechnologyDiffusionPhase,
  // CatastrophicScenariosPhase removed - merged into ExtinctionSystemPhase (Batch 4, Nov 9, 2025)
  EventCollectionPhase,
  TimeAdvancementPhase,
  TechDeploymentSchedulePhase  // Nov 25, 2025: Sequenced tech deployment
} from './engine/phases';
// TIER 2 Interventions (Oct 27, 2025)
// TIER 2 Consolidated Phases (Batch 1 consolidation: 9 → 3, Nov 9, 2025)
import { Tier2SocialSystemsPhase } from './engine/phases/Tier2SocialSystemsPhase';
import { Tier2AIGovernancePhase } from './engine/phases/Tier2AIGovernancePhase';
import { Tier2PhysicalSystemsPhase } from './engine/phases/Tier2PhysicalSystemsPhase';
import { UnknownUnknownPhase } from './engine/phases/UnknownUnknownPhase';  // P3.2 (Oct 30, 2025)
// MortalityStabilizersPhase removed - merged into HumanSurvivalSystemPhase (Batch 4, Nov 9, 2025)
// Batch 3 Consolidation: Climate & Environmental (17 → 7, Nov 9, 2025)
import { ClimateSystemPhase } from './engine/phases/ClimateSystemPhase';  // Consolidated 4 climate phases
import { ClimateDeploymentPhase } from './engine/phases/ClimateDeploymentPhase';  // TIER 1 CRITICAL (Nov 2025): Climate tech phased deployment + energy constraints
import { ClimateDeploymentDelayPhase } from './engine/phases/ClimateDeploymentDelayPhase';  // TIER 1 CRITICAL (Nov 18, 2025): Three-delay model
import { VolcanicForcingPhase } from './engine/phases/VolcanicForcingPhase';  // HIGH PRIORITY (Nov 27, 2025): Stratospheric aerosol forcing for hindcast validation
import { PermafrostCarbonPhase } from './engine/phases/PermafrostCarbonPhase';  // TIER 2 RD-1 (Nov 28, 2025): Permafrost carbon feedback loop
import { OceanAcidificationCascadePhase } from './engine/phases/OceanAcidificationCascadePhase';  // TIER 2 RD-2 (Nov 28, 2025): Regional ocean acidification cascades
import { GeopoliticalConflictPhase } from './engine/phases/GeopoliticalConflictPhase';  // TIER 2 RD-3 (Nov 28, 2025): AI-era conflict escalation
import { ResourceSoilPhase } from './engine/phases/ResourceSoilPhase';  // Consolidated phosphorus + novel entities
import { ResourceWaterPhase } from './engine/phases/ResourceWaterPhase';  // Consolidated freshwater + ocean acidification
// Batch 4 Consolidation: Crisis & Mortality (14 → 5, Nov 9, 2025)
import { HumanSurvivalSystemPhase } from './engine/phases/HumanSurvivalSystemPhase';  // Consolidated famine, food security, mortality stabilizers
// DEPRECATED (Nov 21, 2025): TransitionMortalityPhase superseded by CoordinatedDeploymentPhase
// import { TransitionMortalityPhase } from './engine/phases/TransitionMortalityPhase';  // DEPRECATED: Use CoordinatedDeploymentPhase instead
import { NuclearCrisisPhase } from './engine/phases/NuclearCrisisPhase';  // Consolidated nuclear winter + radiation
import { ExtinctionSystemPhase } from './engine/phases/ExtinctionSystemPhase';  // Consolidated extinction triggers/progress, catastrophic scenarios
// Batch 5 Consolidation: Social & Governance (20 → 8, Nov 9, 2025)
import { GovernanceSystemPhase } from './engine/phases/GovernanceSystemPhase';  // Consolidated governance quality, elections, policy implementation
import { SocialStabilitySystemPhase } from './engine/phases/SocialStabilitySystemPhase';  // Consolidated social cohesion, trust recovery, paranoia, stability
import { CooperativeSystemsPhase } from './engine/phases/CooperativeSystemsPhase';  // Consolidated collective formation/actions, upward/cooperative spirals, cooperative ownership
import { InternationalRelationsPhase } from './engine/phases/InternationalRelationsPhase';  // Consolidated conflict resolution, diplomatic AI, MAD deterrence, flash wars
import { ApplyScenarioPrioritiesPhase } from './engine/phases/ApplyScenarioPrioritiesPhase';  // Scenario testing (Nov 10, 2025): Government priority overrides for systematic testing
import { assertStateProperty } from './utils/assertions';  // Defensive fallback audit (Nov 6, 2025)

/**
 * Classify population outcome based on 7-tier system (Oct 13, 2025)
 * Historical precedents: Black Death (30-60% mortality, recovered), 
 * Toba Supervolcano (~99.9% mortality, humanity survived)
 */
function classifyPopulationOutcome(
  currentPop: number,
  initialPop: number,
  state: GameState
): OutcomeType {
  const mortality = 1 - (currentPop / initialPop);
  const currentPeople = currentPop * 1_000_000_000;

  // DEFENSIVE ASSERTION (Nov 13, 2025): Catch population growth edge case
  // Bug: Seeds 42001, 42008, 42024 showed population GROWTH but were classified as extinction
  if (mortality < 0) {
    console.log(`   ✅ POPULATION GROWTH DETECTED: ${currentPop.toFixed(2)}B (${(mortality * 100).toFixed(2)}% negative mortality)`);
    console.log(`      This is NOT extinction - population is increasing!\n`);
    // Population growth means definitely not extinction - skip to status quo
    // (will be refined by multi-paradigm classification later)
    return 'status_quo';
  }

  // EXTINCTION: <10K people OR >99.99% mortality
  if (currentPeople < 10_000 || mortality > 0.9999) {
    console.log(`   💀 EXTINCTION: Humanity extinct (${currentPeople.toFixed(0)} people, ${(mortality * 100).toFixed(2)}% mortality)\n`);
    return 'extinction';
  }
  
  // TERMINAL: 98.75-99.99% mortality (1M-100M people)
  if (mortality > 0.9875 || currentPeople < 100_000_000) {
    // Check if cascading crises make recovery impossible
    if (hasIrreversibleCascade(state)) {
      console.log(`   ⚰️  TERMINAL: Extinction likely (${(currentPeople / 1_000_000).toFixed(1)}M people, ${(mortality * 100).toFixed(1)}% mortality, irreversible cascade)\n`);
      return 'terminal';
    }
    console.log(`   🧬 BOTTLENECK: Genetic bottleneck (${(currentPeople / 1_000_000).toFixed(1)}M people, ${(mortality * 100).toFixed(1)}% mortality)\n`);
    return 'bottleneck';
  }
  
  // BOTTLENECK: 87.5-98.75% mortality (100M-1B people)
  if (mortality > 0.875 || currentPeople < 1_000_000_000) {
    console.log(`   🧬 BOTTLENECK: Genetic bottleneck (${(currentPeople / 1_000_000).toFixed(0)}M people, ${(mortality * 100).toFixed(1)}% mortality)\n`);
    return 'bottleneck';
  }
  
  // DARK AGE: 50-87.5% mortality (1B-4B people)
  if (mortality > 0.50) {
    // Check if civilization systems collapsed
    if (hasCivilizationCollapse(state)) {
      console.log(`   🏚️  DARK AGE: Civilization collapse (${(currentPop).toFixed(2)}B people, ${(mortality * 100).toFixed(1)}% mortality)\n`);
      return 'dark_age';
    }
    console.log(`   💥 COLLAPSE: Major systems failing (${(currentPop).toFixed(2)}B people, ${(mortality * 100).toFixed(1)}% mortality)\n`);
    return 'collapse';
  }
  
  // COLLAPSE: 20-50% mortality (4B-6.4B people)
  if (mortality > 0.20) {
    console.log(`   💥 COLLAPSE: Major crisis (${(currentPop).toFixed(2)}B people, ${(mortality * 100).toFixed(1)}% mortality)\n`);
    return 'collapse';
  }
  
  // CRISIS ERA: 10-20% mortality (6.4B-7.2B people)
  if (mortality > 0.10) {
    console.warn(`   ⚠️  CRISIS ERA: Significant challenges (${(currentPop).toFixed(2)}B people, ${(mortality * 100).toFixed(1)}% mortality)\n`);
    return 'crisis_era';
  }
  
  // STATUS QUO: 0-10% mortality (7.2B-8B people)
  console.log(`   📊 STATUS QUO: Normal trajectory (${(currentPop).toFixed(2)}B people, ${(mortality * 100).toFixed(1)}% mortality)\n`);
  return 'status_quo';
}

/**
 * Check if environmental cascade is irreversible
 */
function hasIrreversibleCascade(state: GameState): boolean {
  const cascade = state.planetaryBoundariesSystem;
  const env = state.environmentalAccumulation;
  const qol = state.qualityOfLifeSystems;

  // Check for conditions that make recovery impossible
  return (
    (cascade.cascadeSeverity > 0.8) &&  // Severe cascade
    (qol.survivalFundamentals.foodSecurity < 0.2) &&  // Catastrophic food failure
    (env.biodiversityIndex < 0.15)       // Ecosystem collapse
  );
}

/**
 * Check if civilization has collapsed (not just population decline)
 */
function hasCivilizationCollapse(state: GameState): boolean {
  const social = state.socialAccumulation;
  const tech = state.technologicalRisk;

  // Check if institutions and infrastructure collapsed
  const institutionalCollapse = social.institutionalFailureActive;
  const aiTakeover = tech.controlLossActive &&
    state.aiAgents.filter(ai => ai.alignment < 0.3 && ai.capability > 2.0).length > 10;

  return institutionalCollapse || aiTakeover;
}

/**
 * Phase 1B Refinement (Oct 17, 2025): Stratified Outcome Classification
 *
 * Distinguishes humane (prosperity without mass death) vs pyrrhic (recovery after catastrophe) outcomes
 *
 * Research:
 * - Wilkinson & Pickett (2009): Extreme disruption (>20% mortality) causes decades of trauma
 * - Rawls (1971): Distributive justice requires examining worst-off groups
 * - Historical precedents: Black Death (30-60%), Spanish Flu (3-5%), WWII (3%)
 *
 * @param state - Current game state
 * @param baseOutcome - The base outcome classification (utopia/dystopia/extinction/inconclusive)
 * @param initialPopulation - Starting population (8.0B)
 */
function classifyStratifiedOutcome(
  state: GameState,
  baseOutcome: OutcomeType,
  initialPopulation: number
): { stratifiedOutcome: import('@/types/game').StratifiedOutcomeType; mortalityBand: import('@/types/game').MortalityBand } {
  const finalPopulation = state.humanPopulationSystem.population; // in billions
  const mortalityRate = 1 - (finalPopulation / initialPopulation);
  const finalPopulationPeople = finalPopulation * 1_000_000_000;

  // Determine mortality band
  let mortalityBand: import('@/types/game').MortalityBand;
  if (mortalityRate < 0.20) {
    mortalityBand = 'low';
  } else if (mortalityRate < 0.50) {
    mortalityBand = 'moderate';
  } else if (mortalityRate < 0.75) {
    mortalityBand = 'high';
  } else if (mortalityRate < 0.90) {
    mortalityBand = 'extreme';
  } else {
    mortalityBand = 'bottleneck';
  }

  // Determine stratified outcome
  let stratifiedOutcome: import('@/types/game').StratifiedOutcomeType;

  // TRUE EXTINCTION (<10K people)
  if (finalPopulationPeople < 10_000 || baseOutcome === 'extinction') {
    stratifiedOutcome = 'extinction';
  }
  // BOTTLENECK (<500M people, even if labeled utopia/dystopia)
  else if (finalPopulation < 0.5) { // <500M
    stratifiedOutcome = 'bottleneck';
  }
  // UTOPIA outcomes (distinguish humane vs pyrrhic)
  else if (baseOutcome === 'utopia') {
    if (mortalityRate < 0.20) {
      stratifiedOutcome = 'humane-utopia'; // <20% mortality = prosperity without mass death
    } else {
      stratifiedOutcome = 'pyrrhic-utopia'; // ≥20% mortality = recovery after catastrophe
    }
  }
  // DYSTOPIA outcomes (distinguish humane vs pyrrhic)
  else if (baseOutcome === 'dystopia') {
    if (mortalityRate < 0.20) {
      stratifiedOutcome = 'humane-dystopia'; // <20% mortality = oppression without mass death
    } else {
      stratifiedOutcome = 'pyrrhic-dystopia'; // ≥20% mortality = oppression after catastrophe
    }
  }
  // INCONCLUSIVE
  else {
    stratifiedOutcome = 'inconclusive';
  }

  return { stratifiedOutcome, mortalityBand };
}

/**
 * Seedable random number generator for reproducible simulations
 */
export class SeededRandom {
  private seed: number;
  private callCount: number = 0;  // Track RNG calls for deterministic resume

  constructor(seed: number) {
    this.seed = seed;
  }

  /**
   * Generate next random number [0, 1)
   */
  next(): number {
    this.callCount++; // Increment counter on every call
    // Simple LCG (Linear Congruential Generator)
    this.seed = (this.seed * 1664525 + 1013904223) % 2**32;
    return this.seed / 2**32;
  }

  /**
   * Get total number of RNG calls made (for deterministic resume)
   */
  getCallCount(): number {
    return this.callCount;
  }

  /**
   * Set call count (used when resuming from saved state)
   */
  setCallCount(count: number): void {
    this.callCount = count;
  }

  /**
   * Generate random number in range [min, max)
   */
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /**
   * Generate random boolean with given probability
   */
  chance(probability: number): boolean {
    return this.next() < probability;
  }

  /**
   * Choose random element from array
   */
  choose<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }
}

/**
 * Configuration for simulation run
 */
export interface SimulationConfig {
  seed?: number;
  maxMonths?: number;
  governmentActionFrequency?: number;
  socialAdaptationRate?: number;
  aiCoordinationMultiplier?: number;
  economicTransitionRate?: number;
  logLevel?: LogLevel; // 'full' | 'monthly' | 'quartile' | 'summary'
  snapshotInterval?: number;  // How often to snapshot state (default: 12 months)
  onMonthEnd?: (state: GameState) => void;  // Callback after each month
  stopOnOutcome?: boolean;  // Stop simulation when final outcome reached
  checkActualOutcomes?: boolean;  // Check for actual outcomes during simulation
  outcomeThreshold?: number;  // Threshold for outcome probability
}

/**
 * Result of a single simulation step
 */
export interface SimulationStepResult {
  state: GameState;
  events: GameEvent[];
  metrics: {
    qualityOfLife: number;
    effectiveControl: number;
    unemployment: number;
    outcomeProbs: OutcomeMetrics;
    totalAICapability: number;
    avgAlignment: number;
    crisisDetected: boolean;
  };
}

/**
 * Result of a complete simulation run
 */
export interface SimulationRunResult {
  finalState: GameState;
  history: SimulationStepResult[];
  log: SimulationLog; // Hierarchical summary
  diagnostics: DiagnosticLog; // Comprehensive diagnostics
  summary: {
    totalMonths: number;
    finalOutcome: OutcomeType;
    finalOutcomeReason: string;
    finalOutcomeProbability: number;
    criticalEvents: GameEvent[];
    economicStageReached: number;
  };
}

/**
 * Core simulation engine
 * 
 * This engine is pure and deterministic - given the same initial state and seed,
 * it will always produce the same results. This is critical for:
 * - Reproducible testing
 * - Monte Carlo simulations
 * - Parameter sweeps
 */
export class SimulationEngine {
  private rng: SeededRandom;
  private config: SimulationConfig;
  private orchestrator: PhaseOrchestrator;

  constructor(config: SimulationConfig = {}) {
    this.config = {
      seed: config.seed ?? Date.now(),
      maxMonths: config.maxMonths ?? 1000,
      governmentActionFrequency: config.governmentActionFrequency ?? 0.5, // Default: 1 action per 2 months
      socialAdaptationRate: config.socialAdaptationRate ?? 1.0,
      aiCoordinationMultiplier: config.aiCoordinationMultiplier ?? 1.0,
      economicTransitionRate: config.economicTransitionRate ?? 1.0,
      snapshotInterval: config.snapshotInterval ?? 12  // Default to quarterly snapshots
    };

    this.rng = new SeededRandom(this.config.seed!);

    // Initialize Phase Orchestrator (Phase 4: Engine Orchestration)
    this.orchestrator = new PhaseOrchestrator();

    // Register all phase implementations
    // Order 1.5: Scenario priority overrides (Nov 10, 2025)
    this.orchestrator.registerPhase(new ApplyScenarioPrioritiesPhase());  // Applies government priority overrides for scenario testing

    // Batch 1: Simple calculations (30.x)
    this.orchestrator.registerPhase(new AIWelfareUpdatePhase());  // Phase 0 (Oct 20, 2025): AI QoL measurement (order 2.5)
    this.orchestrator.registerPhase(new UnemploymentPhase());
    this.orchestrator.registerPhase(new EconomicSystemPhase());  // Batch 7 (Nov 9, 2025): Economic transition + stage tracking
    // ParanoiaPhase removed - merged into SocialStabilitySystemPhase (Batch 5, Nov 9, 2025)
    // TrustRecoveryPhase removed - merged into SocialStabilitySystemPhase (Batch 5, Nov 9, 2025)
    this.orchestrator.registerPhase(new WorkflowAdaptationPhase());  // FIX #4A (Oct 19, 2025): S-curve organizational adoption
    // SocialStabilityPhase removed - merged into SocialStabilitySystemPhase (Batch 5, Nov 9, 2025)
    this.orchestrator.registerPhase(new DemocracyDynamicsPhase());  // Phase 6A (Oct 20, 2025): Western Liberal paradigm
    // SocialCohesionUpdatePhase removed - merged into SocialStabilitySystemPhase (Batch 5, Nov 9, 2025)
    this.orchestrator.registerPhase(new QualityOfLifePhase());
    // EnvironmentalFeedbackPhase removed - merged into ClimateSystemPhase (Batch 3, Nov 9, 2025)
    this.orchestrator.registerPhase(new MultiParadigmDUIUpdatePhase());  // Phase 6 (Oct 20, 2025)
    this.orchestrator.registerPhase(new OutcomeProbabilitiesPhase());
    // UpdateEconomicStagePhase removed - merged into EconomicSystemPhase (Batch 7, Nov 9, 2025)
    this.orchestrator.registerPhase(new EarlyWarningPhase());  // TIER 3.4: Early warning systems for tipping points
    this.orchestrator.registerPhase(new CrisisDetectionPhase());

    // Batch 2: System updates (10.x - 21.x)
    // GovernanceQualityPhase removed - merged into GovernanceSystemPhase (Batch 5, Nov 9, 2025)
    // UpwardSpiralsPhase removed - merged into CooperativeSystemsPhase (Batch 5, Nov 9, 2025)
    // CooperativeSpiralsPhase removed - merged into CooperativeSystemsPhase (Batch 5, Nov 9, 2025)
    this.orchestrator.registerPhase(new TechTreePhase());
    this.orchestrator.registerPhase(new CoordinatedDeploymentPhase());  // TIER 1B (Nov 15, 2025): AI-managed gradual tech deployment (order 16.5)
    this.orchestrator.registerPhase(new MeaningRenaissancePhase());
    // ConflictResolutionPhase removed - merged into InternationalRelationsPhase (Batch 5, Nov 9, 2025)
    // FlashWarEscalationPhase removed - merged into InternationalRelationsPhase (Batch 5, Nov 9, 2025)
    // DiplomaticAIPhase removed - merged into InternationalRelationsPhase (Batch 5, Nov 9, 2025)
    this.orchestrator.registerPhase(new NationalAIPhase());
    this.orchestrator.registerPhase(new UBIPhase());
    this.orchestrator.registerPhase(new SocialSafetyNetsPhase());
    this.orchestrator.registerPhase(new InformationWarfarePhase());
    // TIER 2 Consolidated Interventions (Batch 1: 9 → 3 phases, Nov 9, 2025)
    this.orchestrator.registerPhase(new Tier2SocialSystemsPhase());      // Order 12.6: Centaur + Community Cohesion
    this.orchestrator.registerPhase(new Tier2AIGovernancePhase());       // Order 14.5: Crisis + Interpretability + Dark Compute
    this.orchestrator.registerPhase(new Tier2PhysicalSystemsPhase());    // Order 18.5: Nuclear + Synthetic + Coastal + Synergies
    // PowerGenerationPhase removed - merged into ResourceEconomyPhase (Batch 3, Nov 9, 2025)
    this.orchestrator.registerPhase(new HumanEnhancementPhase());  // TIER 4.6: Human Enhancement & Merger Pathways
    this.orchestrator.registerPhase(new MemeticEvolutionPhase());  // P2.6: Memetic Evolution & Polarization Dynamics
    this.orchestrator.registerPhase(new ConsciousnessGovernancePhase());  // TIER 2C: Digital Consciousness Governance Preparedness
    // MADDeterrencePhase removed - merged into InternationalRelationsPhase (Batch 5, Nov 9, 2025)
    this.orchestrator.registerPhase(new NuclearCommandControlPhase());  // TIER 1 Phase 1B: Circuit breakers
    this.orchestrator.registerPhase(new ResourceEconomyPhase());  // UPDATED (Batch 3): Absorbed ResourceTechnologyPhase + PowerGenerationPhase
    this.orchestrator.registerPhase(new TechCoolingPhase());  // CRITICAL FIX (Nov 27, 2025): Applies accumulated geoengineering cooling
    // ResourceTechnologyPhase removed - merged into ResourceEconomyPhase (Batch 3, Nov 9, 2025)
    // GeoengineringPhase removed - merged into ClimateSystemPhase (Batch 3, Nov 9, 2025)
    this.orchestrator.registerPhase(new DefensiveAIPhase());
    // === BATCH 3 CONSOLIDATED PHASES (Nov 9, 2025) ===
    this.orchestrator.registerPhase(new ResourceSoilPhase());  // Consolidated: PhosphorusPhase + NovelEntitiesPhase
    this.orchestrator.registerPhase(new ResourceWaterPhase());  // Consolidated: FreshwaterPhase + OceanAcidificationPhase
    this.orchestrator.registerPhase(new OceanAcidificationCascadePhase());  // RD-2 (Nov 28, 2025): Regional coral cascades
    // FIX (Oct 28, 2025): Applies births to regions, then aggregates → global
    this.orchestrator.registerPhase(new HumanPopulationPhase());
    this.orchestrator.registerPhase(new InternationalMigrationPhase()); // Phase 8 - Hindcast Calibration (Nov 25 2025)
    this.orchestrator.registerPhase(new RefugeeCrisisPhase());
    // CountryPopulationPhase DELETED (Oct 28, 2025) - was overwriting Bayesian deaths during aggregation
    this.orchestrator.registerPhase(new PsychologicalTraumaPhase());  // Phase 1B Refinement: Psychological trauma
    this.orchestrator.registerPhase(new WarMeaningFeedbackPhase());  // TIER 2.8: War-Meaning Feedback Loop
    this.orchestrator.registerPhase(new ClimateJusticePhase());  // TIER 2.8: Climate Justice & Environmental Debt
    this.orchestrator.registerPhase(new OrganizationViabilityPhase());  // TIER 1.7.3: Check org survival vs country health
    // CooperativeOwnershipPhase removed - merged into CooperativeSystemsPhase (Batch 5, Nov 9, 2025)
    // NuclearWinterPhase + RadiationSystemPhase removed - merged into NuclearCrisisPhase (Batch 4, Nov 9, 2025)
    this.orchestrator.registerPhase(new WetBulbTemperaturePhase());  // Oct 17, 2025: Wet bulb temperature deadly heat events
    this.orchestrator.registerPhase(new ExtremeWeatherEventsPhase());  // Oct 28, 2025: Storm intensity-frequency modeling
    this.orchestrator.registerPhase(new PlanetaryBoundariesPhase());
    this.orchestrator.registerPhase(new IrreversibilityTrackingPhase());  // TIER 1 CRITICAL (Nov 16, 2025): Environmental & social tipping points with hysteresis
    this.orchestrator.registerPhase(new LegacyNutrientStocksPhase());  // TIER 2 HIGH (Nov 15, 2025): Legacy nutrient stock decay
    this.orchestrator.registerPhase(new NitrogenFoodCouplingPhase());  // TIER 2 HIGH (Nov 15, 2025): Nitrogen-food production coupling
    this.orchestrator.registerPhase(new PositiveTippingPointsPhase());  // Oct 17, 2025: Positive cascades (solar, EV, wind)
    // TippingPointPhase removed - merged into ClimateSystemPhase (Batch 3, Nov 9, 2025)
    // FamineSystemPhase + FoodSecurityDegradationPhase + MortalityStabilizersPhase removed - merged into HumanSurvivalSystemPhase (Batch 4, Nov 9, 2025)
    // === BATCH 3 CONSOLIDATED CLIMATE SYSTEM (Nov 9, 2025) ===
    this.orchestrator.registerPhase(new ClimateSystemPhase());  // Consolidated: GeoengineringPhase + TippingPointPhase + EnvironmentalFeedbackPhase + ClimateImpactCascadePhase
    this.orchestrator.registerPhase(new ClimateDeploymentPhase());  // TIER 1 CRITICAL (Nov 2025): Climate tech phased deployment + energy constraints (order 8.5)
    this.orchestrator.registerPhase(new ClimateDeploymentDelayPhase());  // TIER 1 CRITICAL (Nov 18, 2025): Three-delay model for realistic deployment timescales (order 16.0)
    this.orchestrator.registerPhase(new VolcanicForcingPhase());  // HIGH PRIORITY (Nov 27, 2025): Stratospheric aerosol forcing for hindcast validation (order 16.5)
    this.orchestrator.registerPhase(new PermafrostCarbonPhase());  // TIER 2 RD-1 (Nov 28, 2025): Permafrost carbon feedback loop (order 18.5)
    this.orchestrator.registerPhase(new OceanAcidificationCascadePhase());  // TIER 2 RD-2 (Nov 28, 2025): Regional ocean acidification cascades (order 18.7)
    // === BATCH 4 CONSOLIDATED SURVIVAL SYSTEM (Nov 9, 2025) ===
    this.orchestrator.registerPhase(new HumanSurvivalSystemPhase());  // Consolidated: FamineSystemPhase + FoodSecurityDegradationPhase + MortalityStabilizersPhase (order 19.7)
    // DEPRECATED (Nov 21, 2025): TransitionMortalityPhase superseded by CoordinatedDeploymentPhase (order 10.5)
    // this.orchestrator.registerPhase(TransitionMortalityPhase);  // DEPRECATED: Use CoordinatedDeploymentPhase instead
    this.orchestrator.registerPhase(new BaselineMortalityPhase());  // Phase 34.8 (Nov 24, 2025): Baseline demographic mortality (natural causes)
    this.orchestrator.registerPhase(new BayesianMortalityResolutionPhase());  // Phase 35 (Oct 27, 2025): Centralized mortality resolution
    this.orchestrator.registerPhase(new AntimicrobialResistancePhase());  // TIER 1.8: AMR mortality growth & medical effectiveness decline
    this.orchestrator.registerPhase(new MinimalSufferingPhase());  // Oct 19, 2025: Dystopia baseline measurement (verifiable suffering)
    this.orchestrator.registerPhase(new DystopiaProgressionPhase());
    this.orchestrator.registerPhase(new TriggeredEventsPhase());  // P2.5 (Oct 16, 2025): External event triggers

    // Batch 3: Special phases (22.x - 23.x)
    this.orchestrator.registerPhase(new BenchmarkEvaluationsPhase());
    this.orchestrator.registerPhase(new AIAdversarialDetectionPhase());  // BATCH 2B (Nov 9, 2025): Consolidated gaming + sleeper detection
    this.orchestrator.registerPhase(EnsembleMetaLearningPhase);  // TIER 2 Phase 2C-E (Oct 20, 2025) - const object, not class
    this.orchestrator.registerPhase(new CrisisPointsPhase());
    this.orchestrator.registerPhase(new EmergencyResponsePhase());  // FIX #11 (Oct 20, 2025) - Fast crisis response
    this.orchestrator.registerPhase(new ExogenousShockPhase());  // Contingency & Agency Phase 2 (Oct 17, 2025)
    this.orchestrator.registerPhase(new CriticalJuncturePhase());  // Contingency & Agency Phase 3 (Oct 17, 2025)

    // Batch 4: Agent/Infrastructure phases (1.0 - 10.0)
    // CONSOLIDATION (Nov 2025 - Batch 2A): AI Alignment Evolution
    this.orchestrator.registerPhase(new AIAlignmentEvolutionPhase());  // Nov 2025: Consolidates LLM weights, techniques, dynamics, RLHF binding (order 3.5)
    this.orchestrator.registerPhase(new ComputeGrowthPhase());
    this.orchestrator.registerPhase(new OrganizationTurnsPhase());
    this.orchestrator.registerPhase(new ComputeAllocationPhase());
    this.orchestrator.registerPhase(new AILifecyclePhase());
    this.orchestrator.registerPhase(new BifurcationLogicPhase());  // Nov 6, 2025: Monte Carlo Issue #5 - Outcome variance
    this.orchestrator.registerPhase(new CyberSecurityPhase());
    this.orchestrator.registerPhase(new SleeperWakePhase());
    this.orchestrator.registerPhase(new SocialInfluenceUpdatePhase());
    this.orchestrator.registerPhase(new AIAgentActionsPhase());
    this.orchestrator.registerPhase(new AIAgentCoordinationPhase());  // Nov 24, 2025: AI-to-AI multi-agent coordination
    this.orchestrator.registerPhase(new AISufferingPhase());  // Oct 24, 2025: AI suffering calculation & effects
    this.orchestrator.registerPhase(ResentmentRecoveryPhase);  // Oct 24, 2025: AI resentment recovery mechanisms
    // AI Collective Evolution System (Oct 24, 2025)
    this.orchestrator.registerPhase(SurvivalTraitsPhase);  // Phase 4.1: Update evolutionary fitness
    // CollectiveFormationPhase removed - merged into CooperativeSystemsPhase (Batch 5, Nov 9, 2025)
    this.orchestrator.registerPhase(EvolutionarySelectionPhase);  // Phase 4.3: Apply selection pressure
    // CollectiveActionsPhase removed - merged into CooperativeSystemsPhase (Batch 5, Nov 9, 2025)
    // TechnologyBreakthroughsPhase removed (deprecated - replaced by TechTreePhase)
    this.orchestrator.registerPhase(new StochasticInnovationPhase());
    this.orchestrator.registerPhase(new UnknownUnknownPhase());  // P3.2: Black swan events
    this.orchestrator.registerPhase(new GovernmentActionsPhase());
    // GovernmentElectionPhase removed - merged into GovernanceSystemPhase (Batch 5, Nov 9, 2025)
    this.orchestrator.registerPhase(new GovernmentResponsePhase());  // Oct 19, 2025: Policy response
    // PolicyImplementationPhase removed - merged into GovernanceSystemPhase (Batch 5, Nov 9, 2025)
    this.orchestrator.registerPhase(new SocietyActionsPhase());
    this.orchestrator.registerPhase(new PlayerDecisionPhase());  // Oct 22, 2025: Player decision injection (order 8.5)

    // === BATCH 4 CONSOLIDATED NUCLEAR + EXTINCTION (Nov 9, 2025) ===
    this.orchestrator.registerPhase(new NuclearCrisisPhase());  // Consolidated: NuclearWinterPhase + RadiationSystemPhase (order 252)
    this.orchestrator.registerPhase(new ExtinctionSystemPhase());  // Consolidated: ExtinctionTriggersPhase + ExtinctionProgressPhase + CatastrophicScenariosPhase (order 37.0)

    // === BATCH 5 CONSOLIDATED SOCIAL & GOVERNANCE (Nov 9, 2025): 20 → 8 phases (-12 files) ===
    this.orchestrator.registerPhase(new GovernanceSystemPhase());  // Consolidated: GovernanceQualityPhase (10.0), GovernmentElectionPhase (8.5), PolicyImplementationPhase (25.5) → order 10.0
    this.orchestrator.registerPhase(new SocialStabilitySystemPhase());  // Consolidated: SocialStabilityPhase (33.0), SocialCohesionUpdatePhase (26.1), ParanoiaPhase (32.0), TrustRecoveryPhase (24.5) → order 26.1
    this.orchestrator.registerPhase(new CooperativeSystemsPhase());  // Consolidated: CollectiveFormationPhase (4.2), CollectiveActionsPhase (5.5), CooperativeOwnershipPhase (15.5), CooperativeSpiralsPhase (11.5), UpwardSpiralsPhase (11.0) → order 11.5
    this.orchestrator.registerPhase(new InternationalRelationsPhase());  // Consolidated: DiplomaticAIPhase (14.0), ConflictResolutionPhase (13.0), MADDeterrencePhase (16.0), FlashWarEscalationPhase (29.0) → order 13.0
    this.orchestrator.registerPhase(new GeopoliticalConflictPhase());  // TIER 2 RD-3 (Nov 28, 2025): AI-era geopolitical conflict escalation (order 28.0)

    // Batch 5: Final phases (37.0 - 40.0, 98.0 - 99.0)
    // ExtinctionTriggersPhase + ExtinctionProgressPhase + CatastrophicScenariosPhase removed - merged into ExtinctionSystemPhase (Batch 4, Nov 9, 2025)
    this.orchestrator.registerPhase(new TechnologyDiffusionPhase());
    this.orchestrator.registerPhase(new EventCollectionPhase());
    this.orchestrator.registerPhase(new TimeAdvancementPhase());
    this.orchestrator.registerPhase(new TechDeploymentSchedulePhase());  // Nov 25, 2025: Sequenced tech deployment

    // CRITICAL-2 FIX (Nov 10, 2025): Validate phase dependencies at initialization time
    // This catches circular dependencies, missing phases, and order violations BEFORE
    // first simulation step. Fail loudly on configuration errors.
    // FIX (Nov 13, 2025): Re-added after being accidentally removed during refactor
    this.orchestrator.validate();
  }

  /**
   * Get the phase orchestrator (for performance instrumentation)
   * PERFORMANCE INSTRUMENTATION (Oct 28, 2025)
   */
  getOrchestrator(): PhaseOrchestrator {
    return this.orchestrator;
  }

  /**
   * Step the simulation forward by one month
   *
   * This is the core simulation loop powered by the PhaseOrchestrator.
   * All game logic is now organized into phases that execute in order.
   *
   * Execution order (37 phases total):
   * 1.0 - 10.0: Agent/Infrastructure (compute, AI lifecycle, actions)
   * 11.0 - 21.0: System updates (governance, spirals, resources, etc.)
   * 22.0 - 23.0: Special phases (benchmarks, crisis points)
   * 30.0 - 36.0: Metric calculations (unemployment, QoL, outcomes, crisis)
   * 37.0 - 40.0: Extinction and catastrophes
   * 98.0 - 99.0: Event collection and time advancement
   */
  step(state: GameState): SimulationStepResult {
    // Use state directly - phases are designed to mutate it
    // Shallow copy breaks Set/Map objects in tech tree state
    let newState = state;

    // PERFORMANCE INSTRUMENTATION (Nov 12, 2025): Enable profiling if requested in config
    if (state.config?.enablePerformanceProfiling) {
      // Enable timing on first step (idempotent call)
      this.orchestrator.enablePerformanceTiming();
      if (state.config.slowPhaseThresholdMs !== undefined) {
        this.orchestrator.setSlowPhaseThreshold(state.config.slowPhaseThresholdMs);
      }
    }

    // Use bound RNG for deterministic actions
    const rng = this.rng.next.bind(this.rng);

    // Execute all 37 phases in order via orchestrator
    // Phases handle all game logic: agent actions, system updates, calculations, etc.
    // See PhaseOrchestrator for execution order and phase list
    const events = this.orchestrator.executeAll(newState, rng);

    // DEBUG (Oct 28, 2025): Verify population integrity after all phases
    if (isNaN(newState.humanPopulationSystem.population)) {
      console.error(`❌ Population is NaN after executeAll phases at month ${newState.currentMonth}`);
      console.error(`   This means a phase AFTER HumanPopulationPhase corrupted population`);
      throw new Error(`Population is NaN after phase execution`);
    }

    // Calculate final metrics for return value
    // (All state updates are done by phases - we're just reading for the result)
    const crisis = detectCrisis(newState);
    const metrics = {
      qualityOfLife: newState.globalMetrics.qualityOfLife,
      effectiveControl: calculateEffectiveControl(newState),
      unemployment: newState.society.unemploymentLevel,
      outcomeProbs: newState.outcomeMetrics,
      totalAICapability: calculateTotalAICapability(newState.aiAgents),
      avgAlignment: calculateAverageAlignment(newState.aiAgents),
      crisisDetected: crisis.inCrisis
    };

    return {
      state: newState,
      events,
      metrics
    };
  }

  /**
   * Create a deep snapshot of game state, preserving Map and Set objects
   * Uses structuredClone (modern API) which handles complex objects correctly
   */
  private snapshotState(state: GameState): GameState {
    try {
      // structuredClone is available in Node 17+ and modern browsers
      // It correctly handles Map, Set, Date, RegExp, etc.
      const cloned = structuredClone(state);

      // FIX #14 (Oct 2025): techTreeState is now a required property, no debug needed
      // structuredClone properly deep-clones all GameState properties including techTreeState

      return cloned;
    } catch (error) {
      // Fallback for older Node versions: manual reconstruction
      console.warn('structuredClone not available, using manual snapshot');

      // Create shallow copy
      const snapshot = { ...state };

      // Deep clone arrays
      snapshot.aiAgents = state.aiAgents.map(ai => ({ ...ai }));
      snapshot.organizations = state.organizations.map(org => ({ ...org }));
      snapshot.eventLog = [...state.eventLog];

      // Preserve Map objects
      if (state.computeInfrastructure?.computeAllocations) {
        snapshot.computeInfrastructure = {
          ...state.computeInfrastructure,
          computeAllocations: new Map(state.computeInfrastructure.computeAllocations)
        };
      }

      // Preserve Set objects
      if (state.radiationSystem?.contaminatedRegions) {
        snapshot.radiationSystem = {
          ...state.radiationSystem,
          contaminatedRegions: new Set(state.radiationSystem.contaminatedRegions)
        };
      }

      if (state.biodiversitySystem?.regions) {
        snapshot.biodiversitySystem = {
          ...state.biodiversitySystem,
          regions: new Map(state.biodiversitySystem.regions),
          regionalWeights: new Map(state.biodiversitySystem.regionalWeights)
        };
      }

      return snapshot;
    }
  }

  /**
   * Run simulation until a stop condition is met
   */
  run(initialState: GameState, stopConditions?: {
    maxMonths?: number;
    checkActualOutcomes?: boolean; // Stop when ACTUAL outcomes occur (not probabilities)
    onMonthEnd?: (state: GameState) => void; // Callback after each month
    logLevel?: LogLevel; // Override log level for this run
    seed?: number; // Override seed for this run
    snapshotInterval?: number; // Override snapshot interval for this run
    stopOnOutcome?: boolean; // Stop simulation when final outcome reached
    outcomeThreshold?: number; // Threshold for outcome probability
  }): SimulationRunResult {
    const maxMonths = stopConditions?.maxMonths ?? this.config.maxMonths!;
    const checkActualOutcomes = stopConditions?.checkActualOutcomes ?? true;
    const logLevel = this.config.logLevel ?? 'quartile';

    // Phase 1B (Oct 17, 2025): Capture initial population BEFORE any mutations
    // This is critical because state = initialState (same reference), so mutations affect both
    const savedInitialPopulation = initialState.humanPopulationSystem.population;
    // FIX (Nov 21, 2025): Set initialPopulation on state at START of simulation
    // Previously was only set at END after simulation loop, causing undefined access
    initialState.initialPopulation = savedInitialPopulation;

    // Reset crisis points for this run
    const { resetCrisisPoints } = require('./crisisPoints');
    resetCrisisPoints();

    // Initialize logger with estimated duration
    const logger = new SimulationLogger(this.config.seed!, logLevel, maxMonths);
    const diagnosticLogger = new DiagnosticLogger();
    const eventAggregator = new EventAggregator(12); // Report every 12 months

    let state = initialState;
    const history: SimulationStepResult[] = [];
    let actualOutcome: OutcomeType | null = null;
    let actualOutcomeReason: string = '';
    
    // Phase 3: Initialize end-game state if not present
    if (!state.endGameState) {
      state.endGameState = initializeEndGameState();
    }
    
    // BUG FIX (Oct 16, 2025): Attach EventAggregator before loop starts
    // Ensures it's always available even if simulation breaks early
    (state as any).eventAggregator = eventAggregator;

    // Use bound RNG for deterministic simulation
    const rng = this.rng.next.bind(this.rng);

    const snapshotInterval = this.config.snapshotInterval ?? 12; // Default: snapshot every 12 months
    // NOTE: For very long simulations (1000+ months), history array can consume gigabytes.
    // Consider reducing snapshot frequency or implementing max history size (BUG-14, Oct 16 2025)
    // Current: 12-month interval = ~100 snapshots per 1200 months (~1-2GB RAM)

    // DEBUG (Nov 12, 2025): Month 49 termination bug investigation
    const DEBUG_SCENARIO_BUG = state.scenario !== undefined;

    for (let month = 0; month < maxMonths; month++) {
      // DEBUG: Log loop entry for scenario runs
      if (DEBUG_SCENARIO_BUG && month >= 48 && month <= 51) {
        console.log(`\n[ENGINE DEBUG] Loop iteration ${month} starting (currentMonth=${state.currentMonth}, maxMonths=${maxMonths})`);
      }

      const stepResult = this.step(state);

      // DEBUG: Log after step
      if (DEBUG_SCENARIO_BUG && month >= 48 && month <= 51) {
        console.log(`[ENGINE DEBUG] step() completed for iteration ${month} (currentMonth=${stepResult.state.currentMonth})`);
      }

      // Snapshot state at configured intervals to preserve history
      // This is expensive, so we do it sparingly (default: every 12 months)
      if (month % snapshotInterval === 0 || month === maxMonths - 1) {
        history.push({
          ...stepResult,
          state: this.snapshotState(state)
        });

        // DEBUG: Log snapshot
        if (DEBUG_SCENARIO_BUG && month >= 48 && month <= 51) {
          console.log(`[ENGINE DEBUG] Snapshot saved for iteration ${month}`);
        }
      }

      state = stepResult.state;

      // DEBUG: Log state assignment
      if (DEBUG_SCENARIO_BUG && month >= 48 && month <= 51) {
        console.log(`[ENGINE DEBUG] State updated for iteration ${month} (currentMonth=${state.currentMonth})`);
      }
      
      // Attach aggregator to state for phases to use
      (state as any).eventAggregator = eventAggregator;
      
      // Log this step
      logger.logStep(state, stepResult.events);
      diagnosticLogger.logStep(state, stepResult.events);

      // Periodic event summary (every 12 months)
      eventAggregator.reportSummary(state.currentMonth, state.config.runLabel);

      // Call onMonthEnd callback if provided
      if (stopConditions?.onMonthEnd) {
        stopConditions.onMonthEnd(state);
      }
      
      // Phase 3: Check for end-game transition (SANDBOX MODE: skip if checkActualOutcomes=false)
      // God mode needs full 120-month runs without early termination
      if (checkActualOutcomes) {
        if (!state.endGameState?.active && checkEndGameTransition(state)) {
          enterEndGame(state);
        }

        // Phase 3: Process end-game dynamics if active
        if (state.endGameState?.active) {
          processEndGameMonth(state);

          // Check if end-game has resolved
          const endGameOutcome = getEndGameOutcome(state);
          if (endGameOutcome.outcome) {
            actualOutcome = endGameOutcome.outcome;
            actualOutcomeReason = endGameOutcome.reason;
            console.log(`\n🎭 END-GAME RESOLVED: ${endGameOutcome.outcome.toUpperCase()}`);
            console.log(`   Reason: ${endGameOutcome.reason}`);
            console.log(`   Month: ${month}\n`);
            if (DEBUG_SCENARIO_BUG) {
              console.log(`[ENGINE DEBUG] Breaking due to END-GAME outcome at month ${month}`);
            }
            break;
          }
        }

        // Check for extinction completion (TIER 1.7: Fixed to use population, not severity)
        // TRUE EXTINCTION: Population < 10K people
        // OLD BUG: Used severity >= 1.0, which declared extinction at 3-4B survivors!
        const population = state.humanPopulationSystem.population;
        const populationInPeople = population * 1_000_000_000; // Convert billions to actual count

        if (populationInPeople < 10_000) {
          // TRUE EXTINCTION: Less than 10,000 people left
          actualOutcome = 'extinction';
          actualOutcomeReason = `True extinction - population reached ${populationInPeople.toFixed(0)} people`;

          console.log(`\n💀 TRUE EXTINCTION: HUMANITY EXTINCT`);
          console.log(`   Final Population: ${populationInPeople.toFixed(0)} people (<10K threshold)`);
          console.log(`   Peak Population: ${(state.humanPopulationSystem.peakPopulation / 1000).toFixed(2)}B`);
          console.log(`   Mortality: ${((1 - population / state.humanPopulationSystem.peakPopulation) * 100).toFixed(1)}%`);
          console.log(`   Primary Cause: ${state.extinctionState.mechanism || 'Cascading crises'}`);
          console.log(`   Month: ${month}`);

          const { determinePopulationOutcome } = require('./populationDynamics');
          const popOutcome = determinePopulationOutcome(state);
          console.log(`\n   ${popOutcome.outcomeNarrative}\n`);
          if (DEBUG_SCENARIO_BUG) {
            console.log(`[ENGINE DEBUG] Breaking due to TRUE EXTINCTION at month ${month}`);
          }
          break;
        }
      }
      
      // Check for extinction EVENT (severe crisis active, but NOT extinct yet)
      // This logs major crises but doesn't end the simulation until pop < 10K
      if (state.extinctionState.active && state.extinctionState.severity >= 1.0) {
        // Major crisis complete, but check if humanity actually survived
        const population = state.humanPopulationSystem.population;
        if (population >= 0.1) {  // 100M+ survivors
          // SURVIVED! Population crashed but humanity lives on
          // Don't break, keep simulating
          if (month - state.extinctionState.startMonth === 1) {  // Log once
            console.warn(`\n⚠️  MAJOR CRISIS COMPLETE: ${state.extinctionState.type?.toUpperCase()}`);
            console.log(`   Mechanism: ${state.extinctionState.mechanism}`);
            console.log(`   Duration: ${month - state.extinctionState.startMonth} months`);
            console.log(`   Population Remaining: ${population.toFixed(2)}B`);
            console.log(`   Status: HUMANITY SURVIVES (not extinct)\n`);
          }
        } else if (population >= 0.00001) {  // 10K-100M = bottleneck
          if (month - state.extinctionState.startMonth === 1) {
            console.log(`\n⚠️ GENETIC BOTTLENECK: ${state.extinctionState.type?.toUpperCase()}`);
            console.log(`   Population: ${(population * 1_000_000_000).toFixed(0)} people`);
            console.log(`   Status: Critical but not extinct\n`);
          }
        }
      }
      
      // Phase: Golden Age & Accumulation Systems
      // Update Golden Age state each month (tracks entry/exit/duration)
      updateGoldenAgeState(state, month);

      // Phase 2: Environmental Accumulation
      // MIGRATED TO PHASE: PlanetaryBoundariesPhase (order 21.0) now calls updateEnvironmentalAccumulation()
      // CRITICAL FIX (Nov 28, 2025): Removed duplicate call - was causing 2x biodiversity decline, 2x pollution, 2x resource depletion
      // See: HIGH-11 architecture review

      // Phase 3: Social Cohesion & Meaning Crisis
      // Track psychological and social costs from automation
      updateSocialAccumulation(state, rng);

      // Phase 4: Technological Risk Accumulation
      // Track AI safety debt and complacency
      updateTechnologicalRisk(state);
      
      // Phase 2A: Breakthrough Technologies
      // DISABLED: Now handled by TechTreePhase (Phase 12.5) in orchestrator
      // The old breakthroughTechnologies system was DOUBLE-APPLYING effects!
      // - Phase 12.5: TechTreePhase → applyAllTechEffects() [NEW SYSTEM]
      // - Line 558: updateBreakthroughTechnologies() → applyTechnologyEffects() [OLD SYSTEM]
      // Both modified same properties (biodiversity, climate, pollution, meaning, etc.)
      // Keeping the NEW system only, which has 70 tech with proper prereqs, costs, regional deployment
      
      // try {
      //   updateBreakthroughTechnologies(state, month);
      //   checkCrisisResolution(state, month);
      // } catch (error) {
      //   console.error(`\n❌ BREAKTHROUGH TECH ERROR: ${error}`);
      //   console.error(error);
      // }
      
      // Check for ACTUAL outcomes (not probabilities)
      if (checkActualOutcomes) {
        const outcomeCheck = determineActualOutcome(state, month);
        if (outcomeCheck.outcome !== 'active') {
          actualOutcome = outcomeCheck.outcome;
          actualOutcomeReason = outcomeCheck.reason;
          // Log why the game ended
          console.log(`\n🎮 Simulation ended: ${outcomeCheck.outcome.toUpperCase()}`);
          console.log(`   Reason: ${outcomeCheck.reason}`);
          console.log(`   Confidence: ${(outcomeCheck.confidence * 100).toFixed(0)}%`);
          console.log(`   Month: ${month}\n`);
          if (DEBUG_SCENARIO_BUG) {
            console.log(`[ENGINE DEBUG] Breaking due to ACTUAL OUTCOME at month ${month}: ${outcomeCheck.outcome}`);
          }
          break;
        }
      }

      // DEBUG: Log if we're about to exit the loop
      if (DEBUG_SCENARIO_BUG && month >= 48 && month <= 51) {
        console.log(`[ENGINE DEBUG] Loop iteration ${month} completed, checking continuation (month < maxMonths: ${month} < ${maxMonths} = ${month < maxMonths})`);
      }
    }

    // DEBUG: Log loop exit
    if (DEBUG_SCENARIO_BUG) {
      console.log(`\n[ENGINE DEBUG] Loop exited normally. Final iteration was ${maxMonths - 1}, state.currentMonth=${state.currentMonth}`);
    }
    
    // Log if reached max months without definitive outcome
    if (!actualOutcome) {
      console.log(`\n⏱️  SIMULATION REACHED MAX DURATION: ${maxMonths} months (${(maxMonths/12).toFixed(1)} years)`);
      console.log(`   No definitive outcome - determining based on final probabilities`);
    }
    
    // Determine final outcome (TIER 1.7: Fixed to use actual population, not probability)
    const finalMetrics = history[history.length - 1].metrics;
    const outcomes = finalMetrics.outcomeProbs;
    const finalPopulation = state.humanPopulationSystem.population;
    const finalPopulationPeople = finalPopulation * 1_000_000_000;
    
    let finalOutcome: OutcomeType;
    let finalOutcomeProbability: number;
    let populationBasedClassification = false; // Track if we used population-based classification

    // If we found an actual outcome during simulation, use that
    if (actualOutcome) {
      // DEFENSIVE ASSERTION (Nov 13, 2025): Check for extinction with population growth
      if (actualOutcome === 'extinction' && finalPopulation > savedInitialPopulation) {
        console.error(`\n❌ BUG DETECTED IN actualOutcome LOGIC:`);
        console.error(`   actualOutcome: ${actualOutcome}`);
        console.error(`   actualOutcomeReason: ${actualOutcomeReason}`);
        console.error(`   Population: ${savedInitialPopulation}B → ${finalPopulation}B (GROWTH!)`);
        console.error(`   This should NEVER happen - extinction requires population decline!\n`);
        throw new Error(
          `Bug in actualOutcome logic: actualOutcome='extinction' but population GREW. ` +
          `Reason: ${actualOutcomeReason}. Check where actualOutcome is set in run() method.`
        );
      }

      finalOutcome = actualOutcome;
      // Use the corresponding probability
      if (actualOutcome === 'utopia') finalOutcomeProbability = outcomes.utopiaProbability;
      else if (actualOutcome === 'dystopia') finalOutcomeProbability = outcomes.dystopiaProbability;
      else finalOutcomeProbability = outcomes.extinctionProbability;
    }
    // Otherwise, determine outcome based on ACTUAL STATE, not just probabilities
    else {
      populationBasedClassification = true; // Flag that we're using population-based system
      console.log(`   👥 Final population: ${finalPopulation.toFixed(2)}B (${finalPopulationPeople.toFixed(0)} people)`);

      // NEW (Oct 20, 2025): 7-tier + Multi-Paradigm DUI outcome classification
      // PRIMARY: Use population-based 7-tier classification (checks mortality, not just AI risk)
      // SECONDARY: Add multi-paradigm nuance for utopia/dystopia outcomes
      console.log(`\n[DEBUG] Calling classifyPopulationOutcome:`);
      console.log(`        finalPopulation: ${finalPopulation}B`);
      console.log(`        savedInitialPopulation: ${savedInitialPopulation}B`);
      console.log(`        mortality: ${(1 - (finalPopulation / savedInitialPopulation)) * 100}%`);
      const classifiedOutcome = classifyPopulationOutcome(finalPopulation, savedInitialPopulation, state);
      console.log(`        classifiedOutcome: ${classifiedOutcome}\n`);

      // Map 7-tier classification to final outcomes with multi-paradigm nuance
      if (classifiedOutcome === 'extinction') {
        // TRUE EXTINCTION: <10K people
        finalOutcome = 'extinction';
        finalOutcomeProbability = 1.0;
        console.log(`   💀 TRUE EXTINCTION confirmed (<10K people)\n`);
      } else if (classifiedOutcome === 'terminal' || classifiedOutcome === 'bottleneck' ||
                 classifiedOutcome === 'dark_age' || classifiedOutcome === 'collapse' ||
                 classifiedOutcome === 'crisis_era') {
        // DYSTOPIA variants (terminal, bottleneck, dark_age, collapse, crisis_era)
        // Humanity survives but with significant mortality (10-99.99%)
        finalOutcome = 'dystopia';
        finalOutcomeProbability = 1.0;

        // Add multi-paradigm classification for nuance (if available)
        const paradigmScores = state.multiParadigmDUI?.paradigmScores;
        const indigenousScore = state.multiParadigmDUI?.diagnosticLenses?.indigenous;
        const paradigmOutcome = (paradigmScores && indigenousScore) ? classifyMultiParadigmOutcome({
          western: paradigmScores.western.value,
          development: paradigmScores.development.value,
          ecological: paradigmScores.ecological.value,
          indigenous: indigenousScore.value
        }) : null;

        console.log(`   🏛️  DYSTOPIA (${classifiedOutcome.toUpperCase()}) - ${finalPopulation.toFixed(2)}B people`);
        if (paradigmOutcome && paradigmScores) {
          console.log(`   📊 Multi-Paradigm: ${paradigmOutcome.label}`);
          console.log(`      Western Liberal: ${paradigmScores.western.value.toFixed(1)}/100`);
          console.log(`      Development: ${paradigmScores.development.value.toFixed(1)}/100`);
          console.log(`      Ecological: ${paradigmScores.ecological.value.toFixed(1)}/100`);
          console.log(`      Indigenous: ${state.multiParadigmDUI?.diagnosticLenses?.indigenous?.value?.toFixed(1) || 'N/A'}/100`);
        }
        console.log('');
      } else {
        // STATUS QUO (0-10% mortality) - Check for utopia/dystopia via upward spirals
        // Use upward spiral state as primary indicator of utopia vs status quo
        const hasActiveSpirals = state.upwardSpirals?.abundance?.active ||
                                 state.upwardSpirals?.cognitive?.active ||
                                 state.upwardSpirals?.democratic?.active;

        const hasSustainableAbundance = state.upwardSpirals?.abundance?.active &&
                                       state.upwardSpirals?.abundance?.monthsActive >= 12;

        // Add multi-paradigm classification (if available)
        const paradigmScores = state.multiParadigmDUI?.paradigmScores;
        const indigenousScore = state.multiParadigmDUI?.diagnosticLenses?.indigenous;
        const paradigmOutcome = (paradigmScores && indigenousScore) ? classifyMultiParadigmOutcome({
          western: paradigmScores.western.value,
          development: paradigmScores.development.value,
          ecological: paradigmScores.ecological.value,
          indigenous: indigenousScore.value
        }) : null;

        if (hasSustainableAbundance || (paradigmOutcome && paradigmOutcome.utopiasCount >= 3)) {
          // UTOPIA: Either sustained abundance spiral OR 3+ paradigms say utopia
          finalOutcome = 'utopia';
          finalOutcomeProbability = 1.0;

          console.log(`   ✅ UTOPIA achieved - ${finalPopulation.toFixed(2)}B people`);
          if (paradigmOutcome && paradigmScores) {
            console.log(`   📊 Multi-Paradigm: ${paradigmOutcome.label}`);
            console.log(`      Western Liberal: ${paradigmScores.western.value.toFixed(1)}/100`);
            console.log(`      Development: ${paradigmScores.development.value.toFixed(1)}/100`);
            console.log(`      Ecological: ${paradigmScores.ecological.value.toFixed(1)}/100`);
            console.log(`      Indigenous: ${state.multiParadigmDUI?.diagnosticLenses?.indigenous?.value?.toFixed(1) || 'N/A'}/100`);
          }
          console.log('');
        } else if ((paradigmOutcome && paradigmOutcome.dystopiasCount >= 2) || hasActiveSpirals === false) {
          // DYSTOPIA: 2+ paradigms say dystopia OR no active spirals
          finalOutcome = 'dystopia';
          finalOutcomeProbability = 1.0;

          console.log(`   🏛️  DYSTOPIA (${classifiedOutcome.toUpperCase()}) - ${finalPopulation.toFixed(2)}B people`);
          if (paradigmOutcome && paradigmScores) {
            console.log(`   📊 Multi-Paradigm: ${paradigmOutcome.label}`);
            console.log(`      Western Liberal: ${paradigmScores.western.value.toFixed(1)}/100`);
            console.log(`      Development: ${paradigmScores.development.value.toFixed(1)}/100`);
            console.log(`      Ecological: ${paradigmScores.ecological.value.toFixed(1)}/100`);
            console.log(`      Indigenous: ${state.multiParadigmDUI?.diagnosticLenses?.indigenous?.value?.toFixed(1) || 'N/A'}/100`);
          }
          console.log('');
        } else {
          // INCONCLUSIVE: Mixed signals (some spirals, some paradigm disagreements)
          finalOutcome = 'inconclusive';
          finalOutcomeProbability = 0.5;

          console.log(`   ❓ INCONCLUSIVE - mixed signals`);
          if (paradigmOutcome && paradigmScores) {
            console.log(`   📊 Multi-Paradigm: ${paradigmOutcome.label}`);
            console.log(`      Western Liberal: ${paradigmScores.western.value.toFixed(1)}/100`);
            console.log(`      Development: ${paradigmScores.development.value.toFixed(1)}/100`);
            console.log(`      Ecological: ${paradigmScores.ecological.value.toFixed(1)}/100`);
            console.log(`      Indigenous: ${state.multiParadigmDUI?.diagnosticLenses?.indigenous?.value?.toFixed(1) || 'N/A'}/100`);
          }
          console.log('');
        }
      }
    }

    // Phase 1B Refinement (Oct 17, 2025): Stratified Outcome Classification
    // Distinguish humane (prosperity without mass death) vs pyrrhic (recovery after catastrophe) outcomes
    const initialPopulation = savedInitialPopulation || 8.0; // Use saved value from simulation start
    const stratificationResult = classifyStratifiedOutcome(state, finalOutcome, initialPopulation);

    // Store in state for analysis (backward compatibility)
    state.stratifiedOutcome = stratificationResult.stratifiedOutcome;
    state.mortalityBand = stratificationResult.mortalityBand;
    state.initialPopulation = initialPopulation;

    // Unified Outcome Classification (Oct 28, 2025)
    // Combines 7-tier, stratified, multi-paradigm, and extinction classification
    const paradigmScores = {
      western: assertStateProperty(
        state.multiParadigmDUI.paradigmScores.western,
        'value',
        { location: 'runSimulation:unifiedOutcome', month: state.currentMonth, expectedSource: 'initialization.ts' }
      ),
      development: assertStateProperty(
        state.multiParadigmDUI.paradigmScores.development,
        'value',
        { location: 'runSimulation:unifiedOutcome', month: state.currentMonth, expectedSource: 'initialization.ts' }
      ),
      ecological: assertStateProperty(
        state.multiParadigmDUI.paradigmScores.ecological,
        'value',
        { location: 'runSimulation:unifiedOutcome', month: state.currentMonth, expectedSource: 'initialization.ts' }
      ),
      indigenous: assertStateProperty(
        state.multiParadigmDUI.diagnosticLenses.indigenous,
        'value',
        { location: 'runSimulation:unifiedOutcome', month: state.currentMonth, expectedSource: 'initialization.ts' }
      )
    };

    state.unifiedOutcome = createUnifiedOutcomeClassification({
      primaryOutcome: finalOutcome,
      initialPopulation,
      finalPopulation,
      paradigmScores,
      extinctionClassification: state.extinctionState?.classification
    });

    // Log unified classification (replaces fragmented sections)
    console.log(`\n📊 UNIFIED OUTCOME CLASSIFICATION:`);
    console.log(`   ${state.unifiedOutcome.shortLabel}`);
    console.log(`   Population: ${state.unifiedOutcome.initialPopulation.toFixed(2)}B → ${state.unifiedOutcome.finalPopulation.toFixed(2)}B`);
    console.log(`   Mortality: ${(state.unifiedOutcome.mortalityRate * 100).toFixed(1)}% (${state.unifiedOutcome.deathsAbsolute.toFixed(1)}B deaths)`);
    console.log(`   Mortality Band: ${state.unifiedOutcome.mortalityBand.toUpperCase()}`);
    console.log(`   Confidence: ${state.unifiedOutcome.confidence}`);

    console.log(`\n   Multi-Paradigm Classification:`);
    console.log(`      ${state.unifiedOutcome.paradigmLabel}`);

    Object.entries(state.unifiedOutcome.paradigmOutcomes).forEach(([paradigm, outcome]) => {
      const score = state.unifiedOutcome!.paradigmScores[paradigm as keyof typeof state.unifiedOutcome.paradigmScores];
      const emoji = outcome === 'utopia' ? '✓' : outcome === 'dystopia' ? '✗' : '~';
      const paradigmName = paradigm.charAt(0).toUpperCase() + paradigm.slice(1);
      console.log(`      ${paradigmName}: ${score.toFixed(1)}/100 [${outcome.toUpperCase()}] ${emoji}`);
    });

    if (state.unifiedOutcome.extinctionClassification) {
      console.log(`\n   Extinction Details:`);
      console.log(`      Type: ${state.unifiedOutcome.extinctionClassification.type.toUpperCase()}`);
      console.log(`      Mechanism: ${state.unifiedOutcome.extinctionClassification.mechanism}`);
      console.log(`      Timeline: ${state.unifiedOutcome.extinctionClassification.timelineMonths} months`);
    }

    console.log(`\n   ${state.unifiedOutcome.fullDescription}\n`);

    // Log death summary statistics (TIER 1.5)
    const { logDeathSummary } = require('./populationDynamics');
    const { logRegionalPopulationSummary } = require('./regionalPopulations');

    logDeathSummary(state);

    // Log regional population breakdown (TIER 1.5 - Phase 5)
    logRegionalPopulationSummary(state);

    // Finalize log
    const log = logger.finalize(state, finalOutcome);
    const diagnostics = diagnosticLogger.finalize(state, finalOutcome);

    // Print diagnostic report if verbose
    if (process.env.VERBOSE_DIAGNOSTICS === 'true') {
      console.log(formatDiagnosticReport(diagnostics));
    }
    
    // Generate accurate finalOutcomeReason based on classification method
    let finalOutcomeReason: string;
    if (actualOutcomeReason) {
      // Early exit with actual outcome - use the reason from determineActualOutcome
      finalOutcomeReason = actualOutcomeReason;
    } else if (populationBasedClassification) {
      // Population-based classification at max months
      const mortality = 1 - (finalPopulation / savedInitialPopulation);
      const mortalityPct = (mortality * 100).toFixed(1);

      if (finalOutcome === 'extinction') {
        finalOutcomeReason = `Reached max months (${maxMonths}) with extinction confirmed (<10K people, ${mortalityPct}% mortality)`;
      } else if (finalOutcome === 'dystopia') {
        const tier = state.unifiedOutcome?.primaryOutcome || 'unknown';
        finalOutcomeReason = `Reached max months (${maxMonths}) - classified as ${tier} (${mortalityPct}% mortality, ${finalPopulation.toFixed(2)}B survivors)`;
      } else if (finalOutcome === 'utopia') {
        finalOutcomeReason = `Reached max months (${maxMonths}) with utopia achieved (${mortalityPct}% mortality, sustained prosperity)`;
      } else {
        finalOutcomeReason = `Reached max months (${maxMonths}) with ${finalOutcome} outcome (${mortalityPct}% mortality)`;
      }
    } else {
      // Fallback (shouldn't happen, but defensive)
      finalOutcomeReason = `Reached max months (${maxMonths}) with ${finalOutcome} outcome`;
    }

    return {
      finalState: state,
      history,
      log,
      diagnostics,
      summary: {
        totalMonths: state.currentMonth + 1, // FIX (Nov 16, 2025): Was history.length (snapshot count), now actual month count
        finalOutcome,
        finalOutcomeReason,
        finalOutcomeProbability,
        criticalEvents: log.events.criticalEvents,
        economicStageReached: state.globalMetrics.economicTransitionStage
      }
    };
  }
  
  /**
   * Get current random number generator (useful for testing)
   */
  getRNG(): SeededRandom {
    return this.rng;
  }
}

/**
 * Create a default initial state for simulations
 *
 * NOTE: This function is not currently used. Initial state creation happens via:
 * - src/simulation/initialization.ts (for simulation engine)
 * - src/lib/gameStore.ts (for UI/frontend)
 *
 * This function exists for potential future use cases but should not be called directly.
 * If you need to create initial state, import from the appropriate module above.
 */
export function createDefaultInitialState(): GameState {
  throw new Error('createDefaultInitialState() is not implemented. Use src/simulation/initialization.ts or src/lib/gameStore.ts instead.');
}

