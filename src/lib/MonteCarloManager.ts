/**
 * Monte Carlo Manager
 *
 * Orchestrates multiple concurrent simulation workers for batch Monte Carlo analysis.
 *
 * Architecture:
 * - Worker pool pattern (reuse workers, queue tasks)
 * - Resource limits: 5 concurrent (normal), 8 max (degraded), 10 total
 * - Progressive degradation: Throttle background simulations under load
 * - IndexedDB storage: Batch metadata + individual simulation results
 *
 * Research: /research/multi_worker_orchestration_20251027.md (18 citations)
 *
 * Usage:
 *   const manager = new MonteCarloManager();
 *   const batchId = await manager.createBatch({
 *     startSeed: 42000,
 *     numRuns: 10,
 *     scenario: 'historical',
 *     maxMonths: 120
 *   });
 *   await manager.startBatch(batchId);
 *   manager.on('batchProgress', (progress) => console.log(progress));
 *   const stats = await manager.getAggregateStats(batchId);
 */

import { SimulationWorkerClient, type StateDelta } from './simulationWorkerClient';
import type { ScenarioMode } from '@/types/game';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Monte Carlo batch configuration
 */
export interface MonteCarloBatchConfig {
  // Seed configuration
  startSeed: number;                // First seed (e.g., 42000)
  numRuns: number;                  // Number of simulations (e.g., 10, 100)

  // Scenario configuration
  scenario: ScenarioMode;           // 'historical' or 'unprecedented'
  speculativeScenario?: 'doom' | 'cautious' | 'baseline' | 'progressive' | 'utopia';

  // Threshold sliders (Phase 4 unified system)
  thresholdSliders?: any;           // Custom threshold configuration

  // Nested Monte Carlo (epistemic uncertainty)
  nestedMode?: boolean;             // Enable nested MC (aleatory × epistemic)
  aleatorySamplesPerEpistemic?: number; // Default: 10

  // Run parameters
  maxMonths: number;                // Max simulation months (e.g., 120, 360)
  updateInterval?: number;          // Worker update frequency (ms, default: 1000)

  // Metadata
  name?: string;                    // Human-readable batch name
  description?: string;             // Optional description
}

/**
 * Simulation run configuration (individual simulation within batch)
 */
interface SimulationRunConfig {
  simulationId: string;             // Unique ID (e.g., "batch123_run05")
  seed: number;                     // RNG seed
  scenario: ScenarioMode;           // Scenario mode
  speculativeScenario?: 'doom' | 'cautious' | 'baseline' | 'progressive' | 'utopia';
  thresholdSliders?: any;           // Threshold configuration
  maxMonths: number;                // Max months
  updateInterval: number;           // Update frequency
  batchId: string;                  // Parent batch ID
  runIndex: number;                 // Index within batch (0-based)
}

/**
 * Simulation run status
 */
interface SimulationRunStatus {
  simulationId: string;
  batchId: string;
  seed: number;
  status: 'queued' | 'running' | 'paused' | 'completed' | 'failed';
  currentMonth: number;
  maxMonths: number;
  outcome?: 'utopia' | 'dystopia' | 'extinction' | 'stalemate' | 'none';
  outcomeReason?: string;
  startTime?: number;               // Timestamp (ms)
  endTime?: number;                 // Timestamp (ms)
  error?: string;                   // Error message if failed
}

/**
 * Parameter sweep configuration (parameter exploration)
 *
 * Generates all combinations of specified parameters to test sensitivity
 * and explore parameter space.
 *
 * Example: 10 seeds × 3 threshold scenarios = 30 simulations
 *
 * Research: Parameter sweeps are standard practice in simulation validation,
 * enabling sensitivity analysis and robustness testing across parameter space.
 */
export interface ParameterSweepConfig {
  // Seed configuration
  seeds: {
    start: number;                  // First seed (e.g., 42000)
    count: number;                  // Number of seeds (e.g., 10)
  };

  // Parameters to sweep (cartesian product)
  sweepParameters: {
    thresholdScenarios?: Array<'doom' | 'cautious' | 'baseline' | 'progressive' | 'utopia'>;
    scenarioModes?: ScenarioMode[];
    maxMonths?: number[];           // e.g., [60, 120, 360]
    nestedMC?: boolean[];           // e.g., [true, false]
    aleatoryCounts?: number[];      // e.g., [5, 10, 20] (if nested)
  };

  // Fixed parameters (same for all runs)
  fixedParameters: {
    updateInterval?: number;
    thresholdSliders?: any;
    scenario?: ScenarioMode;        // Default if not sweeping scenarios
    speculativeScenario?: 'doom' | 'cautious' | 'baseline' | 'progressive' | 'utopia';
    maxMonths?: number;             // Default if not sweeping max months
  };

  // Metadata
  name?: string;
  description?: string;
}

/**
 * Parameter sweep group (simulations with same parameter value)
 */
export interface ParameterSweepGroup {
  parameterName: string;            // e.g., "thresholdScenario"
  parameterValue: string;           // e.g., "doom"
  simulationIds: string[];          // All simulations with this value
  batchId: string;
}

/**
 * Batch run progress
 */
export interface MonteCarloBatchProgress {
  batchId: string;
  totalRuns: number;
  completedRuns: number;
  runningRuns: number;
  queuedRuns: number;
  failedRuns: number;
  progress: number;                 // 0.0 to 1.0
  estimatedTimeRemaining?: number;  // Milliseconds (null if unknown)
  startTime: number;                // Batch start timestamp
  currentTime: number;              // Current timestamp

  // Parameter sweep metadata (if applicable)
  isSweep?: boolean;
  sweepGroups?: ParameterSweepGroup[];
}

/**
 * Aggregate statistics for batch
 */
export interface MonteCarloAggregateStats {
  batchId: string;
  totalRuns: number;
  completedRuns: number;

  // Outcome distribution
  outcomeDistribution: {
    utopia: number;                 // Count
    dystopia: number;               // Count
    extinction: number;             // Count
    stalemate: number;              // Count
    none: number;                   // Count (still running)
  };

  // Outcome probabilities (percentages)
  outcomeProbabilities: {
    utopia: number;                 // 0-100
    dystopia: number;               // 0-100
    extinction: number;             // 0-100
    stalemate: number;              // 0-100
  };

  // Timeline analysis
  timeline: {
    avgMonthsToOutcome: number;     // Average across all runs
    minMonthsToOutcome: number;     // Earliest outcome
    maxMonthsToOutcome: number;     // Latest outcome
    medianMonthsToOutcome: number;  // Median
  };

  // Key metrics (averages across completed runs)
  avgFinalQoL: number;              // Average final quality of life
  avgFinalPopulation: number;       // Average final population (billions)
  avgMaxAICapability: number;       // Average max AI capability reached

  // Paradigm statistics (Phase 6 multi-paradigm DUI)
  paradigmStats?: {
    avgFinalWestern: number;
    avgFinalDevelopment: number;
    avgFinalEcological: number;
    avgFinalIndigenous: number;
    avgParadigmDivergence: number;
  };

  // Epistemic uncertainty (if nested MC)
  epistemicUncertainty?: {
    outcomeIntervals: {             // Outcome probability intervals
      utopia: { median: number; iqr: [number, number] };
      dystopia: { median: number; iqr: [number, number] };
      extinction: { median: number; iqr: [number, number] };
      stalemate: { median: number; iqr: [number, number] };
    };
  };
}

/**
 * Worker slot (reusable worker in pool)
 */
interface WorkerSlot {
  id: string;                       // Slot ID (e.g., "slot-0")
  worker: SimulationWorkerClient;   // Worker instance
  status: 'idle' | 'busy';          // Current status
  currentSimulationId?: string;     // Active simulation ID (if busy)
  assignedAt?: number;              // Assignment timestamp (if busy)
}

/**
 * Resource tier (progressive degradation strategy)
 */
type ResourceTier = 'normal' | 'busy' | 'degraded' | 'at-capacity';

// ============================================================================
// MONTE CARLO MANAGER
// ============================================================================

export class MonteCarloManager {
  // Worker pool
  private workerPool: Map<string, WorkerSlot> = new Map();
  private maxConcurrent = 5;        // Normal operation: 5 concurrent
  private maxDegraded = 8;          // Degraded operation: 8 concurrent
  private maxTotal = 10;            // Absolute maximum: 10 total

  // Batch tracking
  private batches: Map<string, MonteCarloBatchConfig> = new Map();
  private batchStatus: Map<string, SimulationRunStatus[]> = new Map();
  private batchSweepGroups: Map<string, ParameterSweepGroup[]> = new Map(); // Sweep metadata

  // Simulation queue
  private queue: SimulationRunConfig[] = [];

  // Resource monitoring
  private frameRate = 60;           // Current FPS (tracked via RAF)
  private messageQueueDepth = 0;    // Pending state updates
  private rafId: number | null = null; // requestAnimationFrame ID

  // Event callbacks
  private callbacks: Map<string, Set<(...args: any[]) => void>> = new Map();

  // Storage (IndexedDB)
  private dbName = 'superalignment-montecarlo';
  private dbVersion = 1;

  constructor() {
    this.initializeWorkerPool();
    // Only monitor frame rate in browser environment
    if (typeof requestAnimationFrame !== 'undefined') {
      this.startFrameRateMonitoring();
    }
  }

  // ==========================================================================
  // WORKER POOL MANAGEMENT
  // ==========================================================================

  /**
   * Initialize worker pool (create reusable workers)
   */
  private initializeWorkerPool(): void {
    console.log('[MonteCarloManager] Initializing worker pool');

    // Start with 5 workers (normal tier)
    for (let i = 0; i < this.maxConcurrent; i++) {
      this.createWorkerSlot(`slot-${i}`);
    }
  }

  /**
   * Create a new worker slot
   */
  private createWorkerSlot(id: string): void {
    try {
      const worker = new SimulationWorkerClient();
      const slot: WorkerSlot = {
        id,
        worker,
        status: 'idle'
      };

      this.workerPool.set(id, slot);
      console.log(`[MonteCarloManager] Created worker slot: ${id}`);
    } catch (error) {
      console.error(`[MonteCarloManager] Failed to create worker slot ${id}:`, error);
    }
  }

  /**
   * Get idle worker slot (or null if all busy)
   */
  private getIdleWorkerSlot(): WorkerSlot | null {
    for (const slot of this.workerPool.values()) {
      if (slot.status === 'idle') {
        return slot;
      }
    }
    return null;
  }

  /**
   * Get current resource tier based on active simulations
   */
  private getResourceTier(): ResourceTier {
    const activeCount = Array.from(this.workerPool.values()).filter(
      slot => slot.status === 'busy'
    ).length;

    if (activeCount <= this.maxConcurrent) return 'normal';
    if (activeCount <= this.maxDegraded) return 'busy';
    if (activeCount < this.maxTotal) return 'degraded';
    return 'at-capacity';
  }

  /**
   * Start frame rate monitoring (progressive degradation)
   */
  private startFrameRateMonitoring(): void {
    let lastTime = performance.now();
    let frameCount = 0;

    const measureFrameRate = (currentTime: number) => {
      frameCount++;
      const elapsed = currentTime - lastTime;

      // Calculate FPS every second
      if (elapsed >= 1000) {
        this.frameRate = frameCount / (elapsed / 1000);
        frameCount = 0;
        lastTime = currentTime;

        // Check for performance degradation
        if (this.frameRate < 30) {
          console.warn(`[MonteCarloManager] Frame rate dropped to ${this.frameRate.toFixed(1)} FPS - consider throttling`);
        }
      }

      this.rafId = requestAnimationFrame(measureFrameRate);
    };

    this.rafId = requestAnimationFrame(measureFrameRate);
  }

  /**
   * Stop frame rate monitoring
   */
  private stopFrameRateMonitoring(): void {
    if (this.rafId !== null && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  // ==========================================================================
  // BATCH MANAGEMENT
  // ==========================================================================

  /**
   * Create a new Monte Carlo batch
   *
   * @param config - Batch configuration
   * @returns Batch ID (unique identifier)
   */
  async createBatch(config: MonteCarloBatchConfig): Promise<string> {
    // Generate unique batch ID
    const timestamp = Date.now();
    const batchId = `batch-${config.startSeed}-${timestamp}`;

    // Validate configuration
    this.validateBatchConfig(config);

    // Store batch configuration
    this.batches.set(batchId, config);

    // Initialize batch status (all simulations start as queued)
    const statusArray: SimulationRunStatus[] = [];
    for (let i = 0; i < config.numRuns; i++) {
      const seed = config.startSeed + i;
      const simulationId = `${batchId}_run${i.toString().padStart(3, '0')}`;

      statusArray.push({
        simulationId,
        batchId,
        seed,
        status: 'queued',
        currentMonth: 0,
        maxMonths: config.maxMonths
      });
    }
    this.batchStatus.set(batchId, statusArray);

    // Persist to IndexedDB
    await this.saveBatchToIndexedDB(batchId, config, statusArray);

    console.log(`[MonteCarloManager] Created batch ${batchId} with ${config.numRuns} runs`);

    return batchId;
  }

  /**
   * Validate batch configuration
   */
  private validateBatchConfig(config: MonteCarloBatchConfig): void {
    if (config.numRuns < 1) {
      throw new Error('numRuns must be at least 1');
    }
    if (config.numRuns > 1000) {
      throw new Error('numRuns exceeds maximum (1000)');
    }
    if (config.maxMonths < 1) {
      throw new Error('maxMonths must be at least 1');
    }
    if (config.nestedMode && (!config.aleatorySamplesPerEpistemic || config.aleatorySamplesPerEpistemic < 1)) {
      throw new Error('nestedMode requires aleatorySamplesPerEpistemic >= 1');
    }
  }

  /**
   * Create a parameter sweep batch
   *
   * Generates all combinations of sweep parameters (cartesian product) and
   * creates a batch with grouped simulations for sensitivity analysis.
   *
   * @param config - Parameter sweep configuration
   * @returns Batch ID (unique identifier)
   *
   * @example
   * // 10 seeds × 3 threshold scenarios = 30 simulations
   * const batchId = await manager.createParameterSweep({
   *   seeds: { start: 42000, count: 10 },
   *   sweepParameters: {
   *     thresholdScenarios: ['doom', 'baseline', 'utopia']
   *   },
   *   fixedParameters: {
   *     scenario: 'historical',
   *     maxMonths: 120
   *   }
   * });
   */
  async createParameterSweep(config: ParameterSweepConfig): Promise<string> {
    // Validate configuration
    this.validateParameterSweepConfig(config);

    // Generate all parameter combinations
    const configurations = this.generateSweepConfigurations(config);

    console.log(`[MonteCarloManager] Generated ${configurations.length} sweep configurations`);

    // Generate unique batch ID
    const timestamp = Date.now();
    const batchId = `sweep-${config.seeds.start}-${timestamp}`;

    // Create batch configs for each combination
    const batchConfig: MonteCarloBatchConfig = {
      startSeed: config.seeds.start,
      numRuns: configurations.length,
      scenario: config.fixedParameters.scenario || 'historical',
      speculativeScenario: config.fixedParameters.speculativeScenario,
      thresholdSliders: config.fixedParameters.thresholdSliders,
      maxMonths: config.fixedParameters.maxMonths || 120,
      updateInterval: config.fixedParameters.updateInterval,
      name: config.name || `Parameter Sweep`,
      description: config.description
    };

    // Store batch configuration
    this.batches.set(batchId, batchConfig);

    // Initialize batch status with parameter metadata
    const statusArray: SimulationRunStatus[] = [];
    for (let i = 0; i < configurations.length; i++) {
      const sweepConfig = configurations[i];
      const simulationId = `${batchId}_run${i.toString().padStart(3, '0')}`;

      statusArray.push({
        simulationId,
        batchId,
        seed: sweepConfig.seed,
        status: 'queued',
        currentMonth: 0,
        maxMonths: sweepConfig.maxMonths
      });
    }
    this.batchStatus.set(batchId, statusArray);

    // Build sweep groups
    const sweepGroups = this.buildSweepGroups(batchId, configurations);

    // Store sweep groups in memory
    this.batchSweepGroups.set(batchId, sweepGroups);

    // Persist to IndexedDB (including sweep metadata)
    await this.saveSweepToIndexedDB(batchId, batchConfig, statusArray, sweepGroups);

    console.log(`[MonteCarloManager] Created parameter sweep ${batchId} with ${configurations.length} runs`);
    console.log(`[MonteCarloManager] Sweep groups:`, sweepGroups.map(g => `${g.parameterName}=${g.parameterValue} (n=${g.simulationIds.length})`));

    return batchId;
  }

  /**
   * Validate parameter sweep configuration
   */
  private validateParameterSweepConfig(config: ParameterSweepConfig): void {
    if (config.seeds.count < 1) {
      throw new Error('seeds.count must be at least 1');
    }
    if (config.seeds.count > 100) {
      throw new Error('seeds.count exceeds maximum (100 for sweeps)');
    }

    // Check that at least one sweep parameter is specified
    const hasSweep = Object.values(config.sweepParameters).some(arr => arr && arr.length > 0);
    if (!hasSweep) {
      throw new Error('At least one sweep parameter must be specified');
    }

    // Estimate total simulations
    let totalSims = config.seeds.count;
    if (config.sweepParameters.thresholdScenarios) {
      totalSims *= config.sweepParameters.thresholdScenarios.length;
    }
    if (config.sweepParameters.scenarioModes) {
      totalSims *= config.sweepParameters.scenarioModes.length;
    }
    if (config.sweepParameters.maxMonths) {
      totalSims *= config.sweepParameters.maxMonths.length;
    }
    if (config.sweepParameters.nestedMC) {
      totalSims *= config.sweepParameters.nestedMC.length;
    }

    if (totalSims > 1000) {
      throw new Error(`Parameter sweep would generate ${totalSims} simulations (max: 1000). Reduce seeds or sweep parameters.`);
    }

    console.log(`[MonteCarloManager] Parameter sweep will generate ${totalSims} simulations`);
  }

  /**
   * Generate all sweep configurations (cartesian product)
   */
  private generateSweepConfigurations(config: ParameterSweepConfig): Array<{
    seed: number;
    scenario: ScenarioMode;
    speculativeScenario?: 'doom' | 'cautious' | 'baseline' | 'progressive' | 'utopia';
    maxMonths: number;
    nestedMode?: boolean;
    aleatorySamplesPerEpistemic?: number;
    updateInterval: number;
    parameters: Record<string, string | number | boolean>; // Track which parameters were used
  }> {
    const configurations: Array<any> = [];

    // Get all parameter values to sweep
    const seeds = Array.from({ length: config.seeds.count }, (_, i) => config.seeds.start + i);
    const thresholdScenarios = config.sweepParameters.thresholdScenarios || [config.fixedParameters.speculativeScenario || undefined];
    const scenarioModes = config.sweepParameters.scenarioModes || [config.fixedParameters.scenario || 'historical'];
    const maxMonthsValues = config.sweepParameters.maxMonths || [config.fixedParameters.maxMonths || 120];
    const nestedMCValues = config.sweepParameters.nestedMC || [false];
    const aleatoryCounts = config.sweepParameters.aleatoryCounts || [10];

    // Generate cartesian product
    for (const seed of seeds) {
      for (const thresholdScenario of thresholdScenarios) {
        for (const scenarioMode of scenarioModes) {
          for (const maxMonths of maxMonthsValues) {
            for (const nestedMode of nestedMCValues) {
              // Only include aleatory count if nested mode
              const aleatoryValues = nestedMode ? aleatoryCounts : [undefined];

              for (const aleatorySamples of aleatoryValues) {
                configurations.push({
                  seed,
                  scenario: scenarioMode,
                  speculativeScenario: thresholdScenario,
                  maxMonths,
                  nestedMode,
                  aleatorySamplesPerEpistemic: aleatorySamples,
                  updateInterval: config.fixedParameters.updateInterval || 1000,
                  parameters: {
                    seed,
                    thresholdScenario: thresholdScenario || 'none',
                    scenarioMode,
                    maxMonths,
                    nestedMode,
                    ...(nestedMode && aleatorySamples ? { aleatorySamples } : {})
                  }
                });
              }
            }
          }
        }
      }
    }

    return configurations;
  }

  /**
   * Build sweep groups (group simulations by parameter values)
   */
  private buildSweepGroups(
    batchId: string,
    configurations: Array<{ parameters: Record<string, string | number | boolean> }>
  ): ParameterSweepGroup[] {
    const groups: ParameterSweepGroup[] = [];

    // Group by each swept parameter
    const parameterNames = Object.keys(configurations[0].parameters);

    for (const paramName of parameterNames) {
      // Get unique values for this parameter
      const uniqueValues = new Set(
        configurations.map(c => String(c.parameters[paramName]))
      );

      // Create group for each unique value
      for (const value of uniqueValues) {
        const simulationIds = configurations
          .map((c, i) => ({
            simulationId: `${batchId}_run${i.toString().padStart(3, '0')}`,
            paramValue: String(c.parameters[paramName])
          }))
          .filter(x => x.paramValue === value)
          .map(x => x.simulationId);

        groups.push({
          parameterName: paramName,
          parameterValue: value,
          simulationIds,
          batchId
        });
      }
    }

    return groups;
  }

  /**
   * Start parameter sweep execution
   *
   * @param batchId - Sweep batch ID
   */
  async startParameterSweep(batchId: string): Promise<void> {
    // Use the same execution logic as regular batches
    await this.startBatch(batchId);
  }

  /**
   * Start batch execution
   *
   * Launches simulations up to resource limits, queues excess.
   *
   * @param batchId - Batch ID to start
   */
  async startBatch(batchId: string): Promise<void> {
    const config = this.batches.get(batchId);
    if (!config) {
      throw new Error(`Batch ${batchId} not found`);
    }

    const statusArray = this.batchStatus.get(batchId);
    if (!statusArray) {
      throw new Error(`Batch status ${batchId} not found`);
    }

    console.log(`[MonteCarloManager] Starting batch ${batchId} (${config.numRuns} runs)`);

    // Queue all simulations
    for (let i = 0; i < config.numRuns; i++) {
      const seed = config.startSeed + i;
      const simulationId = `${batchId}_run${i.toString().padStart(3, '0')}`;

      const runConfig: SimulationRunConfig = {
        simulationId,
        seed,
        scenario: config.scenario,
        speculativeScenario: config.speculativeScenario,
        thresholdSliders: config.thresholdSliders,
        maxMonths: config.maxMonths,
        updateInterval: config.updateInterval || 1000,
        batchId,
        runIndex: i
      };

      this.queue.push(runConfig);
    }

    // Start processing queue
    this.processQueue();

    // Emit batch started event
    this.emit('batchStarted', batchId);
  }

  /**
   * Process simulation queue
   *
   * Assigns queued simulations to idle workers up to resource limits.
   */
  private processQueue(): void {
    // Check resource tier
    const tier = this.getResourceTier();

    if (tier === 'at-capacity') {
      console.log('[MonteCarloManager] At capacity, queue processing paused');
      return;
    }

    // Get idle worker
    const slot = this.getIdleWorkerSlot();
    if (!slot) {
      console.log('[MonteCarloManager] No idle workers, queue processing paused');
      return;
    }

    // Get next queued simulation
    const runConfig = this.queue.shift();
    if (!runConfig) {
      console.log('[MonteCarloManager] Queue empty');
      return;
    }

    // Assign simulation to worker
    this.assignSimulationToWorker(slot, runConfig);

    // Continue processing queue (recursive)
    if (this.queue.length > 0) {
      this.processQueue();
    }
  }

  /**
   * Assign simulation to worker slot
   */
  private assignSimulationToWorker(slot: WorkerSlot, runConfig: SimulationRunConfig): void {
    console.log(`[MonteCarloManager] Assigning ${runConfig.simulationId} to ${slot.id}`);

    // Mark slot as busy
    slot.status = 'busy';
    slot.currentSimulationId = runConfig.simulationId;
    slot.assignedAt = Date.now();

    // Update simulation status
    const statusArray = this.batchStatus.get(runConfig.batchId);
    if (statusArray) {
      const status = statusArray.find(s => s.simulationId === runConfig.simulationId);
      if (status) {
        status.status = 'running';
        status.startTime = Date.now();
      }
    }

    // Set up worker callbacks
    const worker = slot.worker;

    // Update callback (track progress)
    worker.on('update', (delta: StateDelta) => {
      this.handleSimulationUpdate(runConfig.simulationId, delta);
    });

    // Error callback
    worker.on('error', (error: Error) => {
      this.handleSimulationError(runConfig.simulationId, error);
    });

    // Initialize worker and wait for initialization to complete
    worker.once('initialized', () => {
      // Worker is ready, now start simulation
      worker.start();

      // Emit simulation started event
      this.emit('simulationStarted', runConfig.simulationId, runConfig.batchId);
    });

    // Initialize worker (async - will emit 'initialized' event when ready)
    worker.init(
      runConfig.seed,
      runConfig.scenario,
      runConfig.updateInterval,
      undefined, // alignmentConfig
      undefined, // climatePriorityConfig
      runConfig.thresholdSliders,
      runConfig.speculativeScenario
    );
  }

  /**
   * Handle simulation update (track progress, detect completion)
   */
  private handleSimulationUpdate(simulationId: string, delta: StateDelta): void {
    // Find simulation status
    let status: SimulationRunStatus | undefined;
    let batchId: string | undefined;

    for (const [bid, statusArray] of this.batchStatus.entries()) {
      const s = statusArray.find(s => s.simulationId === simulationId);
      if (s) {
        status = s;
        batchId = bid;
        break;
      }
    }

    if (!status || !batchId) {
      console.warn(`[MonteCarloManager] Unknown simulation: ${simulationId}`);
      return;
    }

    // Update current month
    if (delta.currentMonth !== undefined) {
      status.currentMonth = delta.currentMonth;
    }

    // Check for outcome (completion)
    if (delta.outcomeType) {
      // Map 7-tier outcome to 5 categories
      const outcomeType = delta.outcomeType.toLowerCase();
      if (outcomeType.includes('utopia')) {
        status.outcome = 'utopia';
      } else if (outcomeType.includes('dystopia')) {
        status.outcome = 'dystopia';
      } else if (outcomeType.includes('extinction') || outcomeType.includes('collapse')) {
        status.outcome = 'extinction';
      } else if (outcomeType.includes('status quo') || outcomeType.includes('crisis')) {
        status.outcome = 'stalemate';
      } else {
        status.outcome = 'none';
      }

      // Mark completed
      status.status = 'completed';
      status.endTime = Date.now();

      console.log(`[MonteCarloManager] Simulation ${simulationId} completed: ${status.outcome} (${status.currentMonth} months)`);

      // Free worker slot
      this.freeWorkerSlot(simulationId);

      // Emit completion event
      this.emit('simulationCompleted', simulationId, batchId, status.outcome);

      // Check if batch is complete
      this.checkBatchCompletion(batchId);

      // Process next queued simulation
      this.processQueue();
    }

    // Check for max months (timeout)
    if (delta.currentMonth && delta.currentMonth >= status.maxMonths) {
      status.outcome = 'none';
      status.outcomeReason = 'Max months reached';
      status.status = 'completed';
      status.endTime = Date.now();

      console.log(`[MonteCarloManager] Simulation ${simulationId} reached max months (${status.maxMonths})`);

      // Free worker slot
      this.freeWorkerSlot(simulationId);

      // Emit completion event
      this.emit('simulationCompleted', simulationId, batchId, status.outcome);

      // Check if batch is complete
      this.checkBatchCompletion(batchId);

      // Process next queued simulation
      this.processQueue();
    }

    // Emit progress event
    this.emit('simulationProgress', simulationId, batchId, status.currentMonth, status.maxMonths);

    // Emit batch progress event
    this.emitBatchProgress(batchId);
  }

  /**
   * Handle simulation error
   */
  private handleSimulationError(simulationId: string, error: Error): void {
    console.error(`[MonteCarloManager] Simulation ${simulationId} error:`, error);

    // Find simulation status
    let status: SimulationRunStatus | undefined;
    let batchId: string | undefined;

    for (const [bid, statusArray] of this.batchStatus.entries()) {
      const s = statusArray.find(s => s.simulationId === simulationId);
      if (s) {
        status = s;
        batchId = bid;
        break;
      }
    }

    if (!status || !batchId) {
      console.warn(`[MonteCarloManager] Unknown simulation: ${simulationId}`);
      return;
    }

    // Mark as failed
    status.status = 'failed';
    status.error = error.message;
    status.endTime = Date.now();

    // Free worker slot
    this.freeWorkerSlot(simulationId);

    // Emit error event
    this.emit('simulationError', simulationId, batchId, error);

    // Check if batch is complete
    this.checkBatchCompletion(batchId);

    // Process next queued simulation
    this.processQueue();
  }

  /**
   * Free worker slot (mark as idle)
   */
  private freeWorkerSlot(simulationId: string): void {
    for (const slot of this.workerPool.values()) {
      if (slot.currentSimulationId === simulationId) {
        slot.status = 'idle';
        slot.currentSimulationId = undefined;
        slot.assignedAt = undefined;
        console.log(`[MonteCarloManager] Freed worker slot: ${slot.id}`);
        break;
      }
    }
  }

  /**
   * Check if batch is complete
   */
  private checkBatchCompletion(batchId: string): void {
    const statusArray = this.batchStatus.get(batchId);
    if (!statusArray) return;

    const allComplete = statusArray.every(
      s => s.status === 'completed' || s.status === 'failed'
    );

    if (allComplete) {
      console.log(`[MonteCarloManager] Batch ${batchId} complete`);
      this.emit('batchCompleted', batchId);
    }
  }

  /**
   * Emit batch progress event
   */
  private emitBatchProgress(batchId: string): void {
    const progress = this.getBatchProgress(batchId);
    if (progress) {
      this.emit('batchProgress', progress);
    }
  }

  /**
   * Get batch progress
   */
  getBatchProgress(batchId: string): MonteCarloBatchProgress | null {
    const config = this.batches.get(batchId);
    const statusArray = this.batchStatus.get(batchId);

    if (!config || !statusArray) return null;

    const totalRuns = config.numRuns;
    const completedRuns = statusArray.filter(s => s.status === 'completed').length;
    const runningRuns = statusArray.filter(s => s.status === 'running').length;
    const queuedRuns = statusArray.filter(s => s.status === 'queued').length;
    const failedRuns = statusArray.filter(s => s.status === 'failed').length;
    const progress = completedRuns / totalRuns;

    // Estimate time remaining
    const completedStatuses = statusArray.filter(s => s.status === 'completed' && s.startTime && s.endTime);
    let estimatedTimeRemaining: number | undefined;

    if (completedStatuses.length > 0) {
      const avgDuration = completedStatuses.reduce((sum, s) => {
        return sum + ((s.endTime || 0) - (s.startTime || 0));
      }, 0) / completedStatuses.length;

      const remainingRuns = totalRuns - completedRuns - failedRuns;
      estimatedTimeRemaining = avgDuration * remainingRuns;
    }

    const firstStatus = statusArray.find(s => s.startTime);
    const startTime = firstStatus?.startTime || Date.now();

    // Check if this is a parameter sweep
    const sweepGroups = this.batchSweepGroups.get(batchId);
    const isSweep = batchId.startsWith('sweep-') && sweepGroups !== undefined;

    return {
      batchId,
      totalRuns,
      completedRuns,
      runningRuns,
      queuedRuns,
      failedRuns,
      progress,
      estimatedTimeRemaining,
      startTime,
      currentTime: Date.now(),
      isSweep,
      sweepGroups
    };
  }

  /**
   * Get batch configuration
   */
  getBatch(batchId: string): MonteCarloBatchConfig | null {
    return this.batches.get(batchId) || null;
  }

  /**
   * Get sweep groups with results for a parameter sweep batch
   *
   * Returns sweep groups with simulation IDs and current status.
   * Useful for displaying sweep progress and results by parameter value.
   *
   * @param batchId - Sweep batch ID
   * @returns Sweep groups with metadata and simulation IDs, or null if not a sweep
   */
  getSweepResults(batchId: string): Array<{
    label: string;
    parameterName: string;
    parameterValue: string;
    parameters: Record<string, any>;
    runs: Array<{
      simulationId: string;
      status: 'queued' | 'running' | 'completed' | 'failed';
      outcome?: string;
      summary?: any;
    }>;
  }> | null {
    const sweepGroups = this.batchSweepGroups.get(batchId);
    const statusArray = this.batchStatus.get(batchId);

    if (!sweepGroups || !statusArray) return null;

    return sweepGroups.map(group => {
      // Get status for each simulation in this group
      const runs = group.simulationIds.map(simId => {
        const status = statusArray.find(s => s.simulationId === simId);
        return {
          simulationId: simId,
          status: status?.status || 'queued',
          outcome: status?.outcome,
          summary: status?.summary
        };
      });

      return {
        label: `${group.parameterName}=${group.parameterValue} (n=${runs.length})`,
        parameterName: group.parameterName,
        parameterValue: group.parameterValue,
        parameters: { [group.parameterName]: group.parameterValue },
        runs
      };
    });
  }

  /**
   * Get aggregate statistics for batch
   */
  async getAggregateStats(batchId: string): Promise<MonteCarloAggregateStats | null> {
    const config = this.batches.get(batchId);
    const statusArray = this.batchStatus.get(batchId);

    if (!config || !statusArray) return null;

    // Filter completed runs
    const completed = statusArray.filter(s => s.status === 'completed');

    // Count outcomes
    const utopiaCount = completed.filter(s => s.outcome === 'utopia').length;
    const dystopiaCount = completed.filter(s => s.outcome === 'dystopia').length;
    const extinctionCount = completed.filter(s => s.outcome === 'extinction').length;
    const stalemateCount = completed.filter(s => s.outcome === 'stalemate').length;
    const noneCount = completed.filter(s => s.outcome === 'none').length;

    const totalCompleted = completed.length;

    // Calculate probabilities
    const outcomeProbabilities = {
      utopia: totalCompleted > 0 ? (utopiaCount / totalCompleted) * 100 : 0,
      dystopia: totalCompleted > 0 ? (dystopiaCount / totalCompleted) * 100 : 0,
      extinction: totalCompleted > 0 ? (extinctionCount / totalCompleted) * 100 : 0,
      stalemate: totalCompleted > 0 ? (stalemateCount / totalCompleted) * 100 : 0
    };

    // Calculate timeline statistics
    const months = completed.map(s => s.currentMonth).filter(m => m > 0);
    const avgMonthsToOutcome = months.length > 0 ? months.reduce((a, b) => a + b, 0) / months.length : 0;
    const minMonthsToOutcome = months.length > 0 ? Math.min(...months) : 0;
    const maxMonthsToOutcome = months.length > 0 ? Math.max(...months) : 0;
    const sortedMonths = [...months].sort((a, b) => a - b);
    const medianMonthsToOutcome = sortedMonths.length > 0
      ? sortedMonths[Math.floor(sortedMonths.length / 2)]
      : 0;

    // TODO: Calculate key metrics from IndexedDB (final QoL, population, etc.)
    // This requires querying simulation results from IndexedDB
    // For now, return placeholder values

    return {
      batchId,
      totalRuns: config.numRuns,
      completedRuns: totalCompleted,
      outcomeDistribution: {
        utopia: utopiaCount,
        dystopia: dystopiaCount,
        extinction: extinctionCount,
        stalemate: stalemateCount,
        none: noneCount
      },
      outcomeProbabilities,
      timeline: {
        avgMonthsToOutcome,
        minMonthsToOutcome,
        maxMonthsToOutcome,
        medianMonthsToOutcome
      },
      avgFinalQoL: 0.5, // TODO: Calculate from IndexedDB
      avgFinalPopulation: 8.0, // TODO: Calculate from IndexedDB
      avgMaxAICapability: 0.7 // TODO: Calculate from IndexedDB
    };
  }

  /**
   * Get grouped aggregate statistics for parameter sweep
   *
   * Returns statistics grouped by parameter values for sensitivity analysis.
   *
   * @param batchId - Sweep batch ID
   * @param parameterName - Parameter to group by (e.g., "thresholdScenario")
   * @returns Map of parameter value to aggregate statistics
   *
   * @example
   * const stats = await manager.getParameterSweepStats(batchId, "thresholdScenario");
   * // Returns: Map {
   * //   "doom" => { utopia: 0%, dystopia: 40%, extinction: 60%, ... },
   * //   "baseline" => { utopia: 10%, dystopia: 30%, extinction: 40%, ... },
   * //   "utopia" => { utopia: 30%, dystopia: 10%, extinction: 20%, ... }
   * // }
   */
  async getParameterSweepStats(
    batchId: string,
    parameterName: string
  ): Promise<Map<string, MonteCarloAggregateStats> | null> {
    const config = this.batches.get(batchId);
    const statusArray = this.batchStatus.get(batchId);

    if (!config || !statusArray) return null;

    // Get sweep groups from IndexedDB (TODO: implement persistence)
    // For now, reconstruct from batch ID pattern
    if (!batchId.startsWith('sweep-')) {
      console.warn(`[MonteCarloManager] Batch ${batchId} is not a parameter sweep`);
      return null;
    }

    // TODO: Load sweep groups from IndexedDB
    // For now, return placeholder
    console.log(`[MonteCarloManager] TODO: Load parameter sweep groups for ${batchId}`);
    return null;
  }

  // ==========================================================================
  // INDEXEDDB PERSISTENCE
  // ==========================================================================

  /**
   * Save batch to IndexedDB
   */
  private async saveBatchToIndexedDB(
    batchId: string,
    config: MonteCarloBatchConfig,
    statusArray: SimulationRunStatus[]
  ): Promise<void> {
    // TODO: Implement IndexedDB storage
    // - Create 'batches' object store
    // - Store batch configuration + status array
    // - Link to individual simulation results
    console.log(`[MonteCarloManager] TODO: Save batch ${batchId} to IndexedDB`);
  }

  /**
   * Save parameter sweep to IndexedDB
   */
  private async saveSweepToIndexedDB(
    batchId: string,
    config: MonteCarloBatchConfig,
    statusArray: SimulationRunStatus[],
    sweepGroups: ParameterSweepGroup[]
  ): Promise<void> {
    // TODO: Implement IndexedDB storage for sweeps
    // - Store sweep metadata (parameter groups)
    // - Link simulations to parameter values
    // - Enable grouped aggregate statistics
    console.log(`[MonteCarloManager] TODO: Save parameter sweep ${batchId} to IndexedDB`);
    console.log(`[MonteCarloManager] Sweep groups: ${sweepGroups.length} groups`);
  }

  // ==========================================================================
  // EVENT EMITTER
  // ==========================================================================

  /**
   * Register event callback
   */
  on(event: string, callback: (...args: any[]) => void): void {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, new Set());
    }
    this.callbacks.get(event)!.add(callback);
  }

  /**
   * Unregister event callback
   */
  off(event: string, callback: (...args: any[]) => void): void {
    this.callbacks.get(event)?.delete(callback);
  }

  /**
   * Emit event
   */
  private emit(event: string, ...args: any[]): void {
    this.callbacks.get(event)?.forEach(cb => {
      try {
        cb(...args);
      } catch (error) {
        console.error(`[MonteCarloManager] Error in ${event} callback:`, error);
      }
    });
  }

  // ==========================================================================
  // CLEANUP
  // ==========================================================================

  /**
   * Destroy manager and clean up resources
   */
  destroy(): void {
    console.log('[MonteCarloManager] Destroying manager');

    // Stop frame rate monitoring
    this.stopFrameRateMonitoring();

    // Terminate all workers
    for (const slot of this.workerPool.values()) {
      slot.worker.destroy();
    }

    // Clear all data
    this.workerPool.clear();
    this.batches.clear();
    this.batchStatus.clear();
    this.batchSweepGroups.clear();
    this.queue = [];
    this.callbacks.clear();
  }
}
