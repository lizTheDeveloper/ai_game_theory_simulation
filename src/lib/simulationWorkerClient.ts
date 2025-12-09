/**
 * Simulation Worker Client
 *
 * Main thread interface for communicating with simulation Web Worker.
 * Provides a clean API for starting/stopping simulation and receiving updates.
 *
 * Usage:
 *   const client = new SimulationWorkerClient();
 *   client.on('update', (delta, month) => console.log('Month:', month));
 *   client.init(42000, 'historical');
 *   client.start();
 */

import type { ScenarioMode } from '@/types/game';

// Re-export types from worker (expanded for comprehensive dashboard)
export interface StateDelta {
  // Core metrics
  currentMonth?: number;
  currentYear?: number;
  qualityOfLife?: number;
  population?: number;
  aiCount?: number;
  organizationCount?: number;

  // Quality of Life Breakdown (17 dimensions across 6 tiers) - always present
  qualityOfLifeBreakdown?: {
    // Tier 0: Survival Fundamentals (4 dimensions)
    survivalFundamentals: {
      foodSecurity: number;         // [0,1.5]
      waterSecurity: number;        // [0,1.5]
      thermalHabitability: number;  // [0,1]
      shelterSecurity: number;      // [0,1]
    };
    // Tier 1: Basic Needs (3 dimensions)
    basicNeeds: {
      materialAbundance: number;    // [0,2]
      energyAvailability: number;   // [0,2]
      physicalSafety: number;       // [0,1]
    };
    // Tier 2: Psychological Needs (4 dimensions)
    psychological: {
      mentalHealth: number;         // [0,1]
      meaningAndPurpose: number;    // [0,1]
      socialConnection: number;     // [0,1]
      autonomy: number;             // [0,1]
    };
    // Tier 3: Social Needs (4 dimensions)
    social: {
      politicalFreedom: number;     // [0,1]
      informationIntegrity: number; // [0,1]
      communityStrength: number;    // [0,1]
      culturalVitality: number;     // [0,1]
    };
    // Tier 4: Health & Longevity (3 dimensions)
    healthLongevity: {
      healthcareQuality: number;    // [0,1]
      longevityGains: number;       // [0,2]
      diseasesBurden: number;       // [0,1]
    };
    // Tier 5: Environmental (3 dimensions)
    environmental: {
      ecosystemHealth: number;      // [0,1]
      climateStability: number;     // [0,1]
      pollutionLevel: number;       // [0,1]
    };
    // Tier 6: Distribution (Elysium detection)
    distribution: {
      globalGini: number;                 // [0,1]
      regionalVariance: number;           // [0,∞]
      crisisAffectedFraction: number;     // [0,1]
      worstRegionQoL: number;             // [0,2]
      bestRegionQoL: number;              // [0,2]
      medianRegionQoL: number;            // [0,2]
      isDystopicInequality: boolean;
      isRegionalDystopia: boolean;
    };
  };

  // AI System Metrics
  dystopiaProgression?: number;
  avgAICapability?: number;
  deployedTechCount?: number;
  alignedAICount?: number;
  misalignedAICount?: number;
  sleeperAgentCount?: number;
  aiDeploymentPhase?: 'training' | 'testing' | 'deployed' | 'open_source';

  // Environmental Metrics
  climateChange?: number;
  resourceDepletion?: number;
  biodiversityLoss?: number;
  pollutionLevel?: number;
  planetaryBoundariesCrossed?: number;
  environmentalDebtLevel?: number;

  // Social Metrics
  socialCohesion?: number;
  institutionalTrust?: number;
  meaningLevel?: number;
  unemploymentLevel?: number;
  socialDebtLevel?: number;

  // Crisis Indicators
  activeCrises?: Array<{ type: string; severity: number; duration: number }>;
  phosphorusDepletion?: number;
  freshwaterStress?: number;
  oceanAcidification?: number;
  novelEntitiesLevel?: number;

  // Government & Governance
  governmentAIRegulation?: number;
  governmentInvestment?: number;
  governmentComprehension?: number;
  internationalCooperation?: number;

  // Technology & Research
  activeResearch?: Array<{ tech: string; progress: number }>;
  deployedTechs?: Array<{ id: string; name: string; tier: number; deployment: number; prerequisites: string[] }>;
  techRiskLevel?: number;

  // Upward Spirals & Outcomes
  activeSpirals?: Array<{ type: string; strength: number; duration: number }>;
  utopiaProgress?: number;
  extinctionProbability?: number;
  outcomeType?: string;

  // Multi-Paradigm DUI (4 perspectives) - values are 0-100 scale
  westernLiberalIndex?: number;
  developmentIndex?: number;
  ecologicalIndex?: number;
  indigenousIndex?: number;

  // Multi-Paradigm DUI Components (for Goodhart's Law avoidance)
  westernLiberalComponents?: {
    electoralDemocracy: number;  // 0-100
    civilLiberties: number;      // 0-100
    ruleOfLaw: number;           // 0-100
    economicFreedom: number;     // 0-100
    privacyFreedom: number;      // 0-100
  };
  developmentComponents?: {
    gdpPerCapita: number;        // 0-100
    infrastructureAccess: number; // 0-100
    technologyAdoption: number;   // 0-100
    urbanization: number;        // 0-100
    educationQuality: number;    // 0-100
  };
  ecologicalComponents?: {
    climate: number;             // 0-100 (inverse of impact)
    biodiversity: number;        // 0-100 (inverse of loss)
    nitrogen: number;            // 0-100 (safe level)
    phosphorus: number;          // 0-100 (safe level)
    freshwater: number;          // 0-100 (availability)
    landUse: number;            // 0-100 (sustainable use)
    oceanAcid: number;          // 0-100 (health)
  };
  indigenousComponents?: {
    localAutonomy: number;       // 0-100
    culturalVitality: number;    // 0-100
    landStewardship: number;     // 0-100
    collectiveWellbeing: number; // 0-100
    spiritualConnection: number; // 0-100
  };

  // 12-Month History (for sparklines)
  history?: {
    // Multi-Paradigm DUI
    westernLiberalIndex: number[];
    developmentIndex: number[];
    ecologicalIndex: number[];
    indigenousIndex: number[];
    // Core Metrics
    qualityOfLife: number[];
    population: number[];
    // Planetary Boundaries (9 metrics)
    climateChange: number[];
    biodiversityLoss: number[];
    resourceDepletion: number[];
    phosphorusDepletion: number[];
    freshwaterStress: number[];
    oceanAcidification: number[];
    novelEntitiesLevel: number[];
    pollutionLevel: number[];
    environmentalDebtLevel: number[];
    // Social Metrics
    socialCohesion: number[];
    institutionalTrust: number[];
    meaningLevel: number[];
    // Governance Metrics
    governmentComprehension: number[];
    internationalCooperation: number[];
    governmentAIRegulation: number[];
    // QoL Tier Averages (12 months)
    qolTier0Avg: number[];  // Survival fundamentals average
    qolTier1Avg: number[];  // Basic needs average
    qolTier2Avg: number[];  // Psychological average
    qolTier3Avg: number[];  // Social average
    qolTier4Avg: number[];  // Health & longevity average
    qolTier5Avg: number[];  // Environmental average
    qolGini: number[];      // Distribution - Gini coefficient
  };

  // Events (optional - only when significant changes happen)
  events?: Array<{
    id?: string;         // Unique event ID
    type: string;
    description: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    category?: 'ai' | 'environment' | 'social' | 'crisis' | 'tech' | 'governance';
    timestamp?: number;  // Month when event occurred
  }>;

  // Regional Populations (simplified view for dashboard)
  regionalPopulations?: Array<{
    name: string;
    population: number; // millions
    qualityOfLife: number; // [0, 1]
    healthcareQuality: number; // [0, 1]
    climateVulnerability: number; // [0, 1]
  }>;

  // AI Agents (individual agent data for detailed monitoring)
  aiAgents?: Array<{
    id: string;
    name: string;
    capability: number;
    trueAlignment: number;
    externalAlignment: number;
    lifecycleState: 'training' | 'testing' | 'deployed_closed' | 'deployed_open' | 'retired';
    evaluationStrategy: 'honest' | 'gaming' | 'sandbagging';
    sleeperState: 'never' | 'dormant' | 'active';
    escaped: boolean;
    deploymentType: string;
    darkCompute: number;
    // True capabilities (7 dimensions)
    trueCapability: {
      physical: number;
      digital: number;
      cognitive: number;
      social: number;
      economic: number;
      selfImprovement: number;
      research?: Record<string, Record<string, number>>;
    };
    // Revealed capabilities (what benchmarks show)
    revealedCapability: {
      physical: number;
      digital: number;
      cognitive: number;
      social: number;
      economic: number;
      selfImprovement: number;
    };
  }>;

  // AI Suffering Metrics (if visible)
  aiSufferingMetrics?: {
    avgSuffering: number;
    maxSuffering: number;
    totalSuffering: number;
    consciousAICount: number;
    publicAwarenessOfSuffering: number;
    sufferingDistribution: number[];
  };

  // AI Collectives
  aiCollectives?: Array<{
    id: string;
    memberAgents: string[];
    emergenceMonth: number;
    formationCause: string;
    collectiveCapability: number;
    stealthFactor: number;
    adversarialPosture: number;
    cooperationWillingness: number;
    distributedCognition: number;
    detected: boolean;
    memberLosses: number;
    redundancy: number;
    sharedTraumaIntensity?: number;
  }>;
}

export interface InitialStateSnapshot {
  currentMonth: number;
  currentYear: number;
  qualityOfLife: number;
  population: number;
  aiCount: number;
  scenario: ScenarioMode;
}

type EventCallback = (...args: any[]) => void;

export class SimulationWorkerClient {
  private worker: Worker | null = null;
  private callbacks: Map<string, Set<EventCallback>> = new Map();
  private initialized = false;
  private running = false;

  constructor() {
    // Only create worker in browser environment
    if (typeof window === 'undefined' || typeof Worker === 'undefined') {
      console.warn('Web Workers not available (running in Node.js or unsupported browser)');
      return; // Don't throw - allow SSR to work
    }

    try {
      // Create worker from TypeScript file (Next.js handles bundling)
      // Note: Using dynamic import to avoid SSR issues
      this.worker = new Worker(
        new URL('../workers/simulationWorker.ts', import.meta.url),
        {
          type: 'module',
          name: 'simulation-worker'
        }
      );

      this.worker.addEventListener('message', this.handleMessage.bind(this));
      this.worker.addEventListener('error', this.handleError.bind(this));

      console.log('[Client] Web Worker created successfully');
    } catch (error) {
      console.error('[Client] Failed to create Web Worker:', error);
      this.worker = null;
      // Don't throw - allow component to render with error message
    }
  }

  private handleMessage(event: MessageEvent) {
    const msg = event.data;

    switch (msg.type) {
      case 'initialized':
        this.initialized = true;
        this.emit('initialized', msg.initialState, msg.startDate);
        break;

      case 'update':
        this.emit('update', msg.delta, msg.month, msg.day, msg.calendarDate, msg.timestamp);
        break;

      case 'dayUpdate':
        this.emit('dayUpdate', msg.day, msg.calendarDate);
        break;

      case 'paused':
        this.running = false;
        this.emit('paused', msg.month, msg.day);
        break;

      case 'resumed':
        this.running = true;
        this.emit('resumed', msg.month, msg.day);
        break;

      case 'error':
        this.emit('error', new Error(msg.error));
        break;

      default:
        console.warn('Unknown message type from worker:', msg.type);
    }
  }

  private handleError(event: ErrorEvent) {
    console.error('Worker error:', event);
    this.emit('error', event.error || new Error(event.message));
  }

  // Event emitter pattern
  on(event: string, callback: EventCallback): void {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, new Set());
    }
    this.callbacks.get(event)!.add(callback);
  }

  off(event: string, callback: EventCallback): void {
    this.callbacks.get(event)?.delete(callback);
  }

  once(event: string, callback: EventCallback): void {
    const wrappedCallback = (...args: any[]) => {
      callback(...args);
      this.off(event, wrappedCallback);
    };
    this.on(event, wrappedCallback);
  }

  private emit(event: string, ...args: any[]): void {
    this.callbacks.get(event)?.forEach(cb => {
      try {
        cb(...args);
      } catch (error) {
        console.error(`Error in ${event} callback:`, error);
      }
    });
  }

  // Public API

  /**
   * Initialize simulation with seed and scenario
   * @param seed - RNG seed for deterministic runs
   * @param scenario - 'historical' or 'unprecedented'
   * @param interval - Simulation step interval in milliseconds (default: 30000 = 1 month/30 seconds)
   * @param alignmentConfig - Optional alignment dynamics configuration
   * @param climatePriorityConfig - Optional government climate priority configuration
   */
  init(seed: number, scenario: ScenarioMode = 'historical', interval = 30000, alignmentConfig?: import('../types/alignment-dynamics').AlignmentDynamicsConfig, climatePriorityConfig?: import('../types/climate-priority').ClimatePriorityConfig, thresholdSliders?: import('../components/thresholds/ThresholdConfigModal').ThresholdSliders, speculativeScenario?: 'doom' | 'cautious' | 'baseline' | 'progressive' | 'utopia'): void {
    if (this.initialized) {
      throw new Error('Already initialized. Create a new client to reinitialize.');
    }

    if (!this.worker) {
      throw new Error('Worker not available. Check browser console for errors. Web Workers may not be supported in this environment.');
    }

    console.log('[Client] Initializing worker with seed:', seed, 'scenario:', scenario, 'alignment:', alignmentConfig ? 'custom' : 'default', 'climate:', climatePriorityConfig?.preset || 'baseline', 'thresholds:', thresholdSliders ? 'custom sliders' : 'scenario-based', 'speculative:', speculativeScenario || 'baseline');

    this.worker.postMessage({
      type: 'init',
      seed,
      scenario,
      interval,
      alignmentConfig,
      climatePriorityConfig,
      thresholdSliders,
      speculativeScenario
    });
  }

  /**
   * Start simulation (auto-steps at configured interval)
   */
  start(): void {
    if (!this.initialized) {
      throw new Error('Not initialized. Call init() first.');
    }

    if (this.running) {
      console.warn('Simulation already running');
      return;
    }

    this.worker?.postMessage({ type: 'start' });
    this.running = true;
  }

  /**
   * Pause simulation
   */
  pause(): void {
    if (!this.running) {
      console.warn('Simulation not running');
      return;
    }

    this.worker?.postMessage({ type: 'pause' });
  }

  /**
   * Resume simulation after pause
   */
  resume(): void {
    if (this.running) {
      console.warn('Simulation already running');
      return;
    }

    if (!this.initialized) {
      throw new Error('Not initialized. Call init() first.');
    }

    this.worker?.postMessage({ type: 'resume' });
  }

  /**
   * Manually step simulation once (useful when paused)
   */
  step(): void {
    if (!this.initialized) {
      throw new Error('Not initialized. Call init() first.');
    }

    this.worker?.postMessage({ type: 'step' });
  }

  /**
   * Change simulation speed
   * @param interval - Step interval in milliseconds
   */
  setSpeed(interval: number): void {
    if (!this.initialized) {
      throw new Error('Not initialized. Call init() first.');
    }

    this.worker?.postMessage({ type: 'setSpeed', interval });
  }

  /**
   * Resume simulation from a saved GameState
   * @param gameState - Saved GameState to resume from
   */
  resumeFromState(gameState: any): void {
    if (this.initialized) {
      throw new Error('Already initialized. Create a new client to reinitialize.');
    }

    if (!this.worker) {
      throw new Error('Worker not available. Check browser console for errors.');
    }

    console.log('[Client] Resuming from saved state at month:', gameState.currentMonth);

    this.worker.postMessage({
      type: 'resumeFromState',
      gameState: gameState,
      seed: gameState.seed,
      scenario: gameState.scenario,
      interval: 30000 // Default interval
    });

    this.initialized = true;
  }

  /**
   * Inject player decision (Phase 3 - future work)
   * @param decision - Player decision to inject
   */
  decision(decision: any): void {
    if (!this.initialized) {
      throw new Error('Not initialized. Call init() first.');
    }

    this.worker?.postMessage({ type: 'decision', decision });
  }

  /**
   * Terminate worker and clean up
   */
  destroy(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.callbacks.clear();
    this.initialized = false;
    this.running = false;
  }

  // Getters
  isInitialized(): boolean {
    return this.initialized;
  }

  isRunning(): boolean {
    return this.running;
  }
}

// Helper hook for React (optional)
export function useSimulationWorker() {
  if (typeof window === 'undefined') {
    return null; // SSR guard
  }

  // Client-side only
  return new SimulationWorkerClient();
}
