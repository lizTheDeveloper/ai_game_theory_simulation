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
  calculateSocialStability,
  calculateTotalAICapability,
  calculateAverageAlignment,
  detectCrisis,
  determineActualOutcome
} from './calculations';
import { calculateEconomicTransitionProgress } from './economics';
import { SimulationLogger, SimulationLog, LogLevel } from './logging';
import { DiagnosticLogger, DiagnosticLog, formatDiagnosticReport } from './diagnostics';
import { checkExtinctionTriggers, progressExtinction } from './extinctions';

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
  
  constructor(config: SimulationConfig = {}) {
    this.config = {
      seed: config.seed ?? Date.now(),
      maxMonths: config.maxMonths ?? 1000,
      governmentActionFrequency: config.governmentActionFrequency ?? 0.08,
      socialAdaptationRate: config.socialAdaptationRate ?? 1.0,
      aiCoordinationMultiplier: config.aiCoordinationMultiplier ?? 1.0,
      economicTransitionRate: config.economicTransitionRate ?? 1.0
    };
    
    this.rng = new SeededRandom(this.config.seed!);
  }
  
  /**
   * Step the simulation forward by one month
   * 
   * This is the core simulation loop. It:
   * 1. Processes agent actions (AI, government, society)
   * 2. Updates unemployment and economic state
   * 3. Calculates quality of life and outcome probabilities
   * 4. Updates social dynamics (trust, stability)
   * 5. Detects crises
   * 6. Returns new state and metrics
   */
  step(state: GameState): SimulationStepResult {
    // Create a shallow copy to avoid mutation
    let newState = { ...state };
    const events: GameEvent[] = [];
    
    // 0a. Update AI population lifecycle (new AIs, retirements, progression)
    const { updateAIPopulation } = require('./lifecycle');
    updateAIPopulation(newState);
    
    // 0b. Phase 3.5: Attempt breaches of closed systems (cybersecurity arms race)
    const { attemptBreaches } = require('./cyberSecurity');
    const breachResult = attemptBreaches(newState, () => this.rng.next());
    if (breachResult.breached.length > 0) {
      events.push({
        type: 'crisis',
        month: newState.currentMonth,
        description: `🚨 ${breachResult.breached.length} closed AI system(s) breached! Now leaked as open weights (${breachResult.totalNewSpread.toLocaleString()} copies)`,
        severity: 'high',
        impactedAgents: breachResult.breached.map(ai => ai.id)
      });
    }
    
    // 0c. Phase 5.3: Check for sleeper agent wake conditions
    const { processSleeperCascade } = require('./sleeperWake');
    const wakeResult = processSleeperCascade(newState);
    if (wakeResult.totalAwakened.length > 0) {
      events.push(...wakeResult.events);
      
      // Log wake events as critical (if logger exists)
      if (this.logger) {
        this.logger.logEvent({
          month: newState.currentMonth,
          type: 'SLEEPER_WAKE',
          message: `${wakeResult.totalAwakened.length} sleeper agent(s) awakened!`,
          details: wakeResult.totalAwakened.map(ai => ai.name).join(', ')
        });
      }
    }
    
    // 0. Process agent actions first (modifies state significantly)
    const { executeAIAgentActions } = require('./agents/aiAgent');
    const { executeGovernmentActions } = require('./agents/governmentAgent');
    const { executeSocietyActions } = require('./agents/societyAgent');
    
    // Use bound RNG for deterministic actions
    const rng = this.rng.next.bind(this.rng);
    
    // Execute all agent actions
    const aiResult = executeAIAgentActions(newState, rng);
    newState = aiResult.newState;
    events.push(...aiResult.events);
    
    const govResult = executeGovernmentActions(newState, rng);
    newState = govResult.newState;
    events.push(...govResult.events);
    
    const societyResult = executeSocietyActions(newState, rng);
    newState = societyResult.newState;
    events.push(...societyResult.events);
    
    // Phase 5.2: Run benchmark evaluations after agent actions
    const { performMonthlyEvaluations } = require('./benchmark');
    const benchmarkResult = performMonthlyEvaluations(newState, rng);
    events.push(...benchmarkResult.events);
    
    // Check for crisis points (critical decision moments)
    const { processCrisisPoints } = require('./crisisPoints');
    const crisisResult = processCrisisPoints(newState, rng);
    if (crisisResult.crisisTriggered) {
      newState = crisisResult.newState;
      events.push(...crisisResult.events);
    }
    
    // 1. Update unemployment based on AI capability
    const newUnemployment = calculateUnemployment(newState);
    newState.society = {
      ...newState.society,
      unemploymentLevel: newUnemployment
    };
    
    // 2. Update economic transition
    const economicProgress = calculateEconomicTransitionProgress(newState);
    newState.globalMetrics = {
      ...newState.globalMetrics,
      economicTransitionStage: Math.max(
        newState.globalMetrics.economicTransitionStage,
        newState.globalMetrics.economicTransitionStage + economicProgress.stageChange
      ),
      wealthDistribution: Math.max(0.1, Math.min(1.0,
        newState.globalMetrics.wealthDistribution + economicProgress.wealthDistributionChange
      ))
    };
    
    // 3. Update trust dynamics
    const trustChange = calculateTrustChange(newState);
    newState.society = {
      ...newState.society,
      trustInAI: Math.max(0, Math.min(1, newState.society.trustInAI + trustChange))
    };
    
    // 4. Update social stability
    const newStability = calculateSocialStability(newState);
    newState.globalMetrics = {
      ...newState.globalMetrics,
      socialStability: newStability
    };
    
    // 5. Update multi-dimensional quality of life systems
    const updatedQoLSystems = updateQualityOfLifeSystems(newState);
    newState.qualityOfLifeSystems = updatedQoLSystems;
    
    // 6. Calculate aggregate quality of life from systems
    const qualityOfLife = calculateQualityOfLife(updatedQoLSystems);
    newState.globalMetrics = {
      ...newState.globalMetrics,
      qualityOfLife
    };
    
    // 7. Calculate outcome probabilities
    const outcomeProbs = calculateOutcomeProbabilities(newState);
    newState.outcomeMetrics = outcomeProbs;
    
    // 8. Detect crisis
    const crisis = detectCrisis(newState);
    
    // 8b. Check for extinction triggers (if not already in one)
    if (!newState.extinctionState.active) {
      const extinctionCheck = checkExtinctionTriggers(newState, () => this.rng.next());
      newState.extinctionState = extinctionCheck.newExtinctionState;
      events.push(...extinctionCheck.events);
    }
    
    // 8c. Progress any active extinction scenario
    if (newState.extinctionState.active) {
      const extinctionProgress = progressExtinction(newState, () => this.rng.next());
      newState.extinctionState = extinctionProgress.newExtinctionState;
      events.push(...extinctionProgress.events);
      
      // If extinction is complete, log it
      if (extinctionProgress.isComplete) {
        events.push({
          id: `extinction-complete-${newState.currentMonth}`,
          timestamp: newState.currentMonth,
          type: 'crisis',
          severity: 'destructive',
          agent: 'system',
          title: 'Extinction Event Complete',
          description: `Humanity has been extinguished via ${newState.extinctionState.mechanism}. ${newState.extinctionState.type} extinction pathway.`,
          effects: {}
        });
      }
    }
    
    // 9. Advance time
    newState.currentMonth += 1;
    if (newState.currentMonth >= 12) {
      newState.currentMonth = 0;
      newState.currentYear += 1;
    }
    
    // 9. Calculate metrics for tracking
    const metrics = {
      qualityOfLife,
      effectiveControl: calculateEffectiveControl(newState),
      unemployment: newUnemployment,
      outcomeProbs,
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
    
    let state = initialState;
    const history: SimulationStepResult[] = [];
    let actualOutcome: 'utopia' | 'dystopia' | 'extinction' | null = null;
    
    for (let month = 0; month < maxMonths; month++) {
      const stepResult = this.step(state);
      history.push(stepResult);
      state = stepResult.state;
      
      // Log this step
      logger.logStep(state, stepResult.events);
      diagnosticLogger.logStep(state, stepResult.events);
      
      // Check for extinction completion (Phase 2: Heterogeneous extinctions)
      if (state.extinctionState.active && state.extinctionState.severity >= 1.0) {
        actualOutcome = 'extinction';
        console.log(`\n💀 EXTINCTION EVENT: ${state.extinctionState.type?.toUpperCase()}`);
        console.log(`   Mechanism: ${state.extinctionState.mechanism}`);
        console.log(`   Duration: ${month - state.extinctionState.startMonth} months`);
        console.log(`   Month: ${month}\n`);
        break;
      }
      
      // Check for ACTUAL outcomes (not probabilities)
      if (checkActualOutcomes) {
        const outcomeCheck = determineActualOutcome(state, month);
        if (outcomeCheck.outcome !== 'active') {
          actualOutcome = outcomeCheck.outcome;
          // Log why the game ended
          console.log(`\n🎮 Simulation ended: ${outcomeCheck.outcome.toUpperCase()}`);
          console.log(`   Reason: ${outcomeCheck.reason}`);
          console.log(`   Confidence: ${(outcomeCheck.confidence * 100).toFixed(0)}%`);
          console.log(`   Month: ${month}\n`);
          break;
        }
      }
    }
    
    // Determine final outcome
    const finalMetrics = history[history.length - 1].metrics;
    const outcomes = finalMetrics.outcomeProbs;
    let finalOutcome: 'utopia' | 'dystopia' | 'extinction' | 'inconclusive';
    let finalOutcomeProbability: number;
    
    // If we found an actual outcome, use that
    if (actualOutcome) {
      finalOutcome = actualOutcome;
      // Use the corresponding probability
      if (actualOutcome === 'utopia') finalOutcomeProbability = outcomes.utopiaProbability;
      else if (actualOutcome === 'dystopia') finalOutcomeProbability = outcomes.dystopiaProbability;
      else finalOutcomeProbability = outcomes.extinctionProbability;
    } 
    // Otherwise, use probability-based outcome for max month reached
    else if (outcomes.utopiaProbability > outcomes.dystopiaProbability && 
        outcomes.utopiaProbability > outcomes.extinctionProbability) {
      finalOutcome = 'utopia';
      finalOutcomeProbability = outcomes.utopiaProbability;
    } else if (outcomes.dystopiaProbability > outcomes.extinctionProbability) {
      finalOutcome = 'dystopia';
      finalOutcomeProbability = outcomes.dystopiaProbability;
    } else if (outcomes.extinctionProbability > 0.3) {
      finalOutcome = 'extinction';
      finalOutcomeProbability = outcomes.extinctionProbability;
    } else {
      finalOutcome = 'inconclusive';
      finalOutcomeProbability = Math.max(
        outcomes.utopiaProbability,
        outcomes.dystopiaProbability,
        outcomes.extinctionProbability
      );
    }
    
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

