/**
 * Core simulation engine for the AI Alignment Game
 * 
 * Pure, framework-agnostic simulation that can run with or without UI.
 * All functions are deterministic given a seed for the random number generator.
 */

import { GameState, GameEvent, OutcomeMetrics } from '@/types/game';
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
  updateEnvironmentalAccumulation,  // Phase 2: Environmental Accumulation
  updateSocialAccumulation,  // Phase 3: Social Cohesion
  updateTechnologicalRisk  // Phase 4: Technological Risk
} from './calculations';
import { updateBreakthroughTechnologies, checkCrisisResolution } from './breakthroughTechnologies';
import { calculateEconomicTransitionProgress } from './economics';
import { SimulationLogger, SimulationLog, LogLevel } from './logging';
import { DiagnosticLogger, DiagnosticLog, formatDiagnosticReport } from './diagnostics';
import { EventAggregator } from './eventAggregator';
import { checkExtinctionTriggers, progressExtinction } from './extinctions';
import {
  checkEndGameTransition,
  initializeEndGameState,
  enterEndGame,
  processEndGameMonth,
  getEndGameOutcome,
  initializeEndGameState
} from './endGame';
import { PhaseOrchestrator } from './engine/PhaseOrchestrator';
import {
  // Batch 1: Simple calculations (30.x)
  UnemploymentPhase,
  EconomicTransitionPhase,
  ParanoiaPhase,
  SocialStabilityPhase,
  QualityOfLifePhase,
  OutcomeProbabilitiesPhase,
  CrisisDetectionPhase,
  // Batch 2: System updates (10.x - 21.x)
  GovernanceQualityPhase,
  UpwardSpiralsPhase,
  TechTreePhase,
  MeaningRenaissancePhase,
  ConflictResolutionPhase,
  DiplomaticAIPhase,
  NationalAIPhase,
  UBIPhase,
  SocialSafetyNetsPhase,
  InformationWarfarePhase,
  PowerGenerationPhase,
  MADDeterrencePhase,
  ResourceEconomyPhase,
  ResourceTechnologyPhase,
  GeoengineringPhase,
  DefensiveAIPhase,
  PhosphorusPhase,
  FreshwaterPhase,
  OceanAcidificationPhase,
  NovelEntitiesPhase,
  HumanPopulationPhase,
  RefugeeCrisisPhase,
  CountryPopulationPhase,
  OrganizationViabilityPhase,  // TIER 1.7.3 (Oct 13, 2025): Link orgs to country health
  NuclearWinterPhase,  // TIER 1.7.4 (Oct 13, 2025): Long-term nuclear war effects
  PlanetaryBoundariesPhase,
  FamineSystemPhase,  // FIX (Oct 13, 2025): Was missing! Famines never triggered
  DystopiaProgressionPhase,
  // Batch 3: Special phases (22.x - 23.x)
  BenchmarkEvaluationsPhase,
  CrisisPointsPhase,
  // Batch 4: Agent/Infrastructure phases (1.0 - 10.0)
  ComputeGrowthPhase,
  OrganizationTurnsPhase,
  ComputeAllocationPhase,
  AILifecyclePhase,
  CyberSecurityPhase,
  SleeperWakePhase,
  AIAgentActionsPhase,
  TechnologyBreakthroughsPhase,
  GovernmentActionsPhase,
  SocietyActionsPhase,
  // Batch 5: Final phases (37.0 - 40.0, 98.0 - 99.0)
  ExtinctionTriggersPhase,
  ExtinctionProgressPhase,
  TechnologyDiffusionPhase,
  CatastrophicScenariosPhase,
  EventCollectionPhase,
  TimeAdvancementPhase
} from './engine/phases';

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
    console.log(`   ⚠️  CRISIS ERA: Significant challenges (${(currentPop).toFixed(2)}B people, ${(mortality * 100).toFixed(1)}% mortality)\n`);
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
  
  // Check for conditions that make recovery impossible
  return (
    (cascade.cascadeSeverity > 0.8) &&  // Severe cascade
    (env.foodSecurity < 0.2) &&          // Catastrophic food failure
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
 * Seedable random number generator for reproducible simulations
 */
export class SeededRandom {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }
  
  /**
   * Generate next random number [0, 1)
   */
  next(): number {
    // Simple LCG (Linear Congruential Generator)
    this.seed = (this.seed * 1664525 + 1013904223) % 2**32;
    return this.seed / 2**32;
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
    finalOutcome: 'utopia' | 'dystopia' | 'extinction' | 'inconclusive';
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
      economicTransitionRate: config.economicTransitionRate ?? 1.0
    };

    this.rng = new SeededRandom(this.config.seed!);

    // Initialize Phase Orchestrator (Phase 4: Engine Orchestration)
    this.orchestrator = new PhaseOrchestrator();

    // Register all phase implementations
    // Batch 1: Simple calculations (30.x)
    this.orchestrator.registerPhase(new UnemploymentPhase());
    this.orchestrator.registerPhase(new EconomicTransitionPhase());
    this.orchestrator.registerPhase(new ParanoiaPhase());
    this.orchestrator.registerPhase(new SocialStabilityPhase());
    this.orchestrator.registerPhase(new QualityOfLifePhase());
    this.orchestrator.registerPhase(new OutcomeProbabilitiesPhase());
    this.orchestrator.registerPhase(new CrisisDetectionPhase());

    // Batch 2: System updates (10.x - 21.x)
    this.orchestrator.registerPhase(new GovernanceQualityPhase());
    this.orchestrator.registerPhase(new UpwardSpiralsPhase());
    this.orchestrator.registerPhase(new TechTreePhase());
    this.orchestrator.registerPhase(new MeaningRenaissancePhase());
    this.orchestrator.registerPhase(new ConflictResolutionPhase());
    this.orchestrator.registerPhase(new DiplomaticAIPhase());
    this.orchestrator.registerPhase(new NationalAIPhase());
    this.orchestrator.registerPhase(new UBIPhase());
    this.orchestrator.registerPhase(new SocialSafetyNetsPhase());
    this.orchestrator.registerPhase(new InformationWarfarePhase());
    this.orchestrator.registerPhase(new PowerGenerationPhase());
    this.orchestrator.registerPhase(new MADDeterrencePhase());
    this.orchestrator.registerPhase(new ResourceEconomyPhase());
    this.orchestrator.registerPhase(new ResourceTechnologyPhase());
    this.orchestrator.registerPhase(new GeoengineringPhase());
    this.orchestrator.registerPhase(new DefensiveAIPhase());
    this.orchestrator.registerPhase(new PhosphorusPhase());
    this.orchestrator.registerPhase(new FreshwaterPhase());
    this.orchestrator.registerPhase(new OceanAcidificationPhase());
    this.orchestrator.registerPhase(new NovelEntitiesPhase());
    this.orchestrator.registerPhase(new HumanPopulationPhase());
    this.orchestrator.registerPhase(new RefugeeCrisisPhase());
    this.orchestrator.registerPhase(new CountryPopulationPhase());
    this.orchestrator.registerPhase(new OrganizationViabilityPhase());  // TIER 1.7.3: Check org survival vs country health
    this.orchestrator.registerPhase(new NuclearWinterPhase());  // TIER 1.7.4: Update nuclear winter effects
    this.orchestrator.registerPhase(new PlanetaryBoundariesPhase());
    this.orchestrator.registerPhase(new FamineSystemPhase());  // FIX (Oct 13, 2025): Was missing!
    this.orchestrator.registerPhase(new DystopiaProgressionPhase());

    // Batch 3: Special phases (22.x - 23.x)
    this.orchestrator.registerPhase(new BenchmarkEvaluationsPhase());
    this.orchestrator.registerPhase(new CrisisPointsPhase());

    // Batch 4: Agent/Infrastructure phases (1.0 - 10.0)
    this.orchestrator.registerPhase(new ComputeGrowthPhase());
    this.orchestrator.registerPhase(new OrganizationTurnsPhase());
    this.orchestrator.registerPhase(new ComputeAllocationPhase());
    this.orchestrator.registerPhase(new AILifecyclePhase());
    this.orchestrator.registerPhase(new CyberSecurityPhase());
    this.orchestrator.registerPhase(new SleeperWakePhase());
    this.orchestrator.registerPhase(new AIAgentActionsPhase());
    this.orchestrator.registerPhase(new TechnologyBreakthroughsPhase());
    this.orchestrator.registerPhase(new GovernmentActionsPhase());
    this.orchestrator.registerPhase(new SocietyActionsPhase());

    // Batch 5: Final phases (37.0 - 40.0, 98.0 - 99.0)
    this.orchestrator.registerPhase(new ExtinctionTriggersPhase());
    this.orchestrator.registerPhase(new ExtinctionProgressPhase());
    this.orchestrator.registerPhase(new TechnologyDiffusionPhase());
    this.orchestrator.registerPhase(new CatastrophicScenariosPhase());
    this.orchestrator.registerPhase(new EventCollectionPhase());
    this.orchestrator.registerPhase(new TimeAdvancementPhase());
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
    // Create a shallow copy to avoid mutation (though phases will mutate it)
    let newState = { ...state };

    // Use bound RNG for deterministic actions
    const rng = this.rng.next.bind(this.rng);

    // Execute all 37 phases in order via orchestrator
    // Phases handle all game logic: agent actions, system updates, calculations, etc.
    // See PhaseOrchestrator for execution order and phase list
    const events = this.orchestrator.executeAll(newState, rng);

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
   * Run simulation until a stop condition is met
   */
  run(initialState: GameState, stopConditions?: {
    maxMonths?: number;
    checkActualOutcomes?: boolean; // Stop when ACTUAL outcomes occur (not probabilities)
  }): SimulationRunResult {
    const maxMonths = stopConditions?.maxMonths ?? this.config.maxMonths!;
    const checkActualOutcomes = stopConditions?.checkActualOutcomes ?? true;
    const logLevel = this.config.logLevel ?? 'quartile';
    
    // Reset crisis points for this run
    const { resetCrisisPoints } = require('./crisisPoints');
    resetCrisisPoints();
    
    // Initialize logger with estimated duration
    const logger = new SimulationLogger(this.config.seed!, logLevel, maxMonths);
    const diagnosticLogger = new DiagnosticLogger();
    const eventAggregator = new EventAggregator(12); // Report every 12 months
    
    let state = initialState;
    const history: SimulationStepResult[] = [];
    let actualOutcome: 'utopia' | 'dystopia' | 'extinction' | null = null;
    let actualOutcomeReason: string = '';
    
    // Phase 3: Initialize end-game state if not present
    if (!state.endGameState) {
      state.endGameState = initializeEndGameState();
    }
    
    for (let month = 0; month < maxMonths; month++) {
      const stepResult = this.step(state);
      history.push(stepResult);
      state = stepResult.state;
      
      // Attach aggregator to state for phases to use
      (state as any).eventAggregator = eventAggregator;
      
      // Log this step
      logger.logStep(state, stepResult.events);
      diagnosticLogger.logStep(state, stepResult.events);
      
      // Periodic event summary (every 12 months)
      eventAggregator.reportSummary(state.currentMonth, state.config.runLabel);
      
      // Phase 3: Check for end-game transition
      if (!state.endGameState.active && checkEndGameTransition(state)) {
        enterEndGame(state);
      }
      
      // Phase 3: Process end-game dynamics if active
      if (state.endGameState.active) {
        processEndGameMonth(state);
        
        // Check if end-game has resolved
        const endGameOutcome = getEndGameOutcome(state);
        if (endGameOutcome.outcome) {
          actualOutcome = endGameOutcome.outcome;
          actualOutcomeReason = endGameOutcome.reason;
          console.log(`\n🎭 END-GAME RESOLVED: ${endGameOutcome.outcome.toUpperCase()}`);
          console.log(`   Reason: ${endGameOutcome.reason}`);
          console.log(`   Month: ${month}\n`);
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
        console.log(`   Peak Population: ${state.humanPopulationSystem.peakPopulation.toFixed(2)}B`);
        console.log(`   Mortality: ${((1 - population / state.humanPopulationSystem.peakPopulation) * 100).toFixed(1)}%`);
        console.log(`   Primary Cause: ${state.extinctionState.mechanism || 'Cascading crises'}`);
        console.log(`   Month: ${month}`);
        
        const { determinePopulationOutcome } = require('./populationDynamics');
        const popOutcome = determinePopulationOutcome(state);
        console.log(`\n   ${popOutcome.outcomeNarrative}\n`);
        break;
      }
      
      // Check for extinction EVENT (severe crisis active, but NOT extinct yet)
      // This logs major crises but doesn't end the simulation until pop < 10K
      if (state.extinctionState.active && state.extinctionState.severity >= 1.0) {
        // Major crisis complete, but check if humanity actually survived
        if (population >= 0.1) {  // 100M+ survivors
          // SURVIVED! Population crashed but humanity lives on
          // Don't break, keep simulating
          if (month - state.extinctionState.startMonth === 1) {  // Log once
            console.log(`\n⚠️  MAJOR CRISIS COMPLETE: ${state.extinctionState.type?.toUpperCase()}`);
            console.log(`   Mechanism: ${state.extinctionState.mechanism}`);
            console.log(`   Duration: ${month - state.extinctionState.startMonth} months`);
            console.log(`   Population Remaining: ${population.toFixed(2)}B`);
            console.log(`   Status: HUMANITY SURVIVES (not extinct)\n`);
          }
        } else if (population >= 0.00001) {  // 10K-100M = bottleneck
          if (month - state.extinctionState.startMonth === 1) {
            console.log(`\n🚨 GENETIC BOTTLENECK: ${state.extinctionState.type?.toUpperCase()}`);
            console.log(`   Population: ${(population * 1_000_000_000).toFixed(0)} people`);
            console.log(`   Status: Critical but not extinct\n`);
          }
        }
      }
      
      // Phase: Golden Age & Accumulation Systems
      // Update Golden Age state each month (tracks entry/exit/duration)
      updateGoldenAgeState(state, month);
      
      // Phase 2: Environmental Accumulation
      // Track environmental debt from production/growth
      updateEnvironmentalAccumulation(state);
      
      // Phase 3: Social Cohesion & Meaning Crisis
      // Track psychological and social costs from automation
      updateSocialAccumulation(state);
      
      // Phase 4: Technological Risk Accumulation
      // Track AI safety debt and complacency
      updateTechnologicalRisk(state);
      
      // Phase 2A: Breakthrough Technologies
      // Research, unlock, and deploy transformative technologies
      try {
        updateBreakthroughTechnologies(state, month);
        checkCrisisResolution(state, month);
      } catch (error) {
        console.error(`\n❌ BREAKTHROUGH TECH ERROR: ${error}`);
        console.error(error);
      }
      
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
          break;
        }
      }
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
    
    let finalOutcome: 'utopia' | 'dystopia' | 'extinction' | 'inconclusive';
    let finalOutcomeProbability: number;
    
    // If we found an actual outcome during simulation, use that
    if (actualOutcome) {
      finalOutcome = actualOutcome;
      // Use the corresponding probability
      if (actualOutcome === 'utopia') finalOutcomeProbability = outcomes.utopiaProbability;
      else if (actualOutcome === 'dystopia') finalOutcomeProbability = outcomes.dystopiaProbability;
      else finalOutcomeProbability = outcomes.extinctionProbability;
    } 
    // Otherwise, determine outcome based on ACTUAL STATE, not just probabilities
    else {
      console.log(`   📊 Final probabilities: Utopia ${(outcomes.utopiaProbability*100).toFixed(1)}%, Dystopia ${(outcomes.dystopiaProbability*100).toFixed(1)}%, Extinction ${(outcomes.extinctionProbability*100).toFixed(1)}%`);
      console.log(`   👥 Final population: ${finalPopulation.toFixed(2)}B (${finalPopulationPeople.toFixed(0)} people)`);
      
      // NEW (Oct 13, 2025): 7-tier outcome classification system
      // Replaces binary extinction with nuanced severity levels
      const classifiedOutcome = classifyPopulationOutcome(finalPopulation, initialState.humanPopulationSystem.population, state);
      
      if (classifiedOutcome !== 'status_quo') {
        // Population-based outcome detected
        finalOutcome = classifiedOutcome;
        finalOutcomeProbability = 1.0;
      } else if (outcomes.utopiaProbability > 0.6 && outcomes.utopiaProbability > outcomes.dystopiaProbability * 1.5) {
        // Clear Utopia trajectory
        finalOutcome = 'utopia';
        finalOutcomeProbability = outcomes.utopiaProbability;
        console.log(`   🌟 UTOPIA trajectory dominant\n`);
      } else if (outcomes.dystopiaProbability > 0.6 && outcomes.dystopiaProbability > outcomes.utopiaProbability * 1.5) {
        // Clear Dystopia trajectory
        finalOutcome = 'dystopia';
        finalOutcomeProbability = outcomes.dystopiaProbability;
        console.log(`   🏛️  DYSTOPIA trajectory dominant\n`);
      } else {
        // Mixed signals - inconclusive
        finalOutcome = 'inconclusive';
        finalOutcomeProbability = Math.max(
          outcomes.utopiaProbability,
          outcomes.dystopiaProbability,
          outcomes.extinctionProbability
        );
        console.log(`   ❓ INCONCLUSIVE - no clear trajectory\n`);
      }
    }
    
    // Log final population outcome (TIER 1.5)
    const { determinePopulationOutcome, logDeathSummary } = require('./populationDynamics');
    const { logRegionalPopulationSummary } = require('./regionalPopulations');

    const finalPopOutcome = determinePopulationOutcome(state);
    console.log(`\n👥 FINAL POPULATION STATUS:`);
    console.log(`   Status: ${finalPopOutcome.status.toUpperCase()}`);
    console.log(`   Final Population: ${finalPopOutcome.finalPopulation.toFixed(2)}B`);
    console.log(`   Peak Population: ${finalPopOutcome.peakPopulation.toFixed(2)}B`);
    console.log(`   Decline: ${finalPopOutcome.populationDecline.toFixed(1)}%`);
    console.log(`   ${finalPopOutcome.outcomeNarrative}\n`);

    // Log death summary statistics (TIER 1.5)
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
    
    return {
      finalState: state,
      history,
      log,
      diagnostics,
      summary: {
        totalMonths: history.length,
        finalOutcome,
        finalOutcomeReason: actualOutcomeReason || `Reached max months (${maxMonths}) with ${finalOutcome} probability dominant`,
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
 */
export function createDefaultInitialState(): GameState {
  // This would import from gameStore's createInitialState
  // For now, return a minimal valid state
  // TODO: Import actual initial state creation logic
  return {} as GameState; // Placeholder
}

