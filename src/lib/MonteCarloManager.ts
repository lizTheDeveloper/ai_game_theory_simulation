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
  // Custom parameters from parameter sweeps (e.g., governmentActionFrequency)
  [key: string]: any;
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
  // REMOVED (Oct 28, 2025): Legacy 4-category outcome replaced by unifiedOutcome
  unifiedOutcome?: import('../types/outcomes').UnifiedOutcomeClassification;
  outcomeReason?: string;
  startTime?: number;               // Timestamp (ms)
  endTime?: number;                 // Timestamp (ms)
  error?: string;                   // Error message if failed
  // Parameter sweep metadata (stores custom sweep parameters for this run)
  parameters?: Record<string, string | number | boolean>;
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
    // Support for custom parameters from enhanced config
    [key: string]: any[] | undefined;
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
  label?: string;                   // Human-readable label
  runs?: Array<{ simulationId: string; outcome?: string }>;  // Run outcomes
  parameters?: Record<string, any>; // All parameter values for this group
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

  // Additional queue tracking for debugging
  activeSimulations?: number;       // Number actually running
  queuedSimulations?: number;       // Number waiting to start
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
  avgMaxAICapability: number;       // Average max AI capability achieved

  // Additional statistics for SweepResultsPanel
  averageMonthsSurvived?: number;   // Average months survived across all runs
  survivalRate?: number;            // Percentage of runs that didn't end in extinction (0-1)
  outcomeBreakdown?: {              // Breakdown of outcomes for visualization
    utopia?: number;
    postScarcity?: number;
    sustainable?: number;
    struggling?: number;
    collapse?: number;
    extinction?: number;
    unknown?: number;
  };

  // Timeline data for visualization (monthly progression)
  timelineData?: Array<{
    month: number;
    totalRuns: number;
    survivingRuns: number;
    outcomeDistribution: Record<string, number>;
  }>;

  // Parameter analysis (for sweeps)
  parameterAnalysis?: any;
}

// ============================================================================
// MANAGER CLASS
// ============================================================================

/**
 * Monte Carlo Manager
 *
 * Resource management:
 * - NORMAL_CONCURRENCY = 5 (50% CPU)
 * - DEGRADED_CONCURRENCY = 8 (80% CPU, frame drops)
 * - MAX_WORKERS = 10 (absolute limit)
 * - Queue simulations when at capacity
 * - Progressive degradation under load
 */
export class MonteCarloManager {
  // Worker pool
  private workerPool: Map<string, {
    worker: SimulationWorkerClient;
    simulationId: string | null;
    busy: boolean;
  }> = new Map();

  // Batch management
  private batches: Map<string, MonteCarloBatchConfig> = new Map();
  private batchStatus: Map<string, SimulationRunStatus[]> = new Map();
  private batchSweepGroups: Map<string, ParameterSweepGroup[]> = new Map();

  // Queue management
  private runQueue: SimulationRunConfig[] = [];
  private isProcessingQueue = false;

  // Resource limits
  private readonly NORMAL_CONCURRENCY = 5;    // 50% CPU
  private readonly DEGRADED_CONCURRENCY = 8;  // 80% CPU
  private readonly MAX_WORKERS = 10;          // Absolute limit

  // Performance monitoring
  private frameRateMonitor: number | null = null;
  private lastFrameTime = 0;
  private lowFrameCount = 0;

  // Event callbacks
  private callbacks: Map<string, Set<(...args: any[]) => void>> = new Map();

  constructor() {
    console.log('[MonteCarloManager] Initialized');
    console.log(`[MonteCarloManager] Concurrency: Normal=${this.NORMAL_CONCURRENCY}, Degraded=${this.DEGRADED_CONCURRENCY}, Max=${this.MAX_WORKERS}`);

    // Start frame rate monitoring (only in browser)
    if (typeof window !== 'undefined' && typeof requestAnimationFrame !== 'undefined') {
      this.startFrameRateMonitoring();
    }
  }

  // ==========================================================================
  // PUBLIC API
  // ==========================================================================

  /**
   * Create a new batch of Monte Carlo simulations
   */
  async createBatch(config: MonteCarloBatchConfig): Promise<string> {
    // Validate configuration
    if (config.numRuns < 1) {
      throw new Error('numRuns must be at least 1');
    }
    if (config.numRuns > 1000) {
      throw new Error('numRuns exceeds maximum (1000 for single batch)');
    }

    // Generate unique batch ID
    const timestamp = Date.now();
    const batchId = `batch-${config.startSeed}-${timestamp}`;

    // Store batch configuration
    this.batches.set(batchId, config);

    // Initialize batch status
    const statusArray: SimulationRunStatus[] = [];
    for (let i = 0; i < config.numRuns; i++) {
      const simulationId = `${batchId}_run${i.toString().padStart(3, '0')}`;
      statusArray.push({
        simulationId,
        batchId,
        seed: config.startSeed + i,
        status: 'queued',
        currentMonth: 0,
        maxMonths: config.maxMonths
      });
    }
    this.batchStatus.set(batchId, statusArray);

    // Persist to IndexedDB (async, don't await)
    this.saveBatchToIndexedDB(batchId, config, statusArray);

    console.log(`[MonteCarloManager] Created batch ${batchId} with ${config.numRuns} runs`);
    return batchId;
  }

  /**
   * Create a parameter sweep batch
   *
   * Generates all combinations of specified parameters to explore parameter space.
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
        maxMonths: sweepConfig.maxMonths,
        // Store sweep parameters for this specific run
        parameters: sweepConfig.parameters
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

    // Allow seed-only sweeps (no parameters required)
    // This was part of the bug - we were requiring parameters when seed-only sweeps are valid

    // Estimate total simulations
    let totalSims = config.seeds.count;

    // Count all parameter dimensions
    Object.entries(config.sweepParameters).forEach(([key, values]) => {
      if (values && values.length > 0) {
        totalSims *= values.length;
      }
    });

    if (totalSims > 10000) {
      throw new Error(`Total simulations (${totalSims}) exceeds maximum (10000). Reduce parameters or seeds.`);
    }

    console.log(`[MonteCarloManager] Sweep validation: ${totalSims} total simulations`);
  }

  /**
   * Generate all sweep configurations (cartesian product)
   * FIXED: Now properly handles custom parameters from enhanced config
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

    // Build parameter dimensions dynamically
    const dimensions: Array<{ name: string; values: any[] }> = [];

    // Always include seeds
    dimensions.push({
      name: 'seed',
      values: Array.from({ length: config.seeds.count }, (_, i) => config.seeds.start + i)
    });

    // Process ALL sweep parameters, including custom ones
    Object.entries(config.sweepParameters).forEach(([paramName, values]) => {
      if (values && values.length > 0) {
        console.log(`[MonteCarloManager] Adding dimension: ${paramName} with ${values.length} values`);
        dimensions.push({ name: paramName, values });
      }
    });

    // Generate cartesian product recursively
    const generateCombinations = (dimIndex: number, current: Record<string, any>): void => {
      if (dimIndex >= dimensions.length) {
        // We've built a complete combination
        const combination = { ...current };

        // Map known parameters to expected format
        configurations.push({
          seed: combination.seed,
          scenario: combination.scenarioModes || combination.scenarioMode || config.fixedParameters.scenario || 'historical',
          speculativeScenario: combination.thresholdScenarios || combination.thresholdScenario || config.fixedParameters.speculativeScenario,
          maxMonths: combination.maxMonths || config.fixedParameters.maxMonths || 120,
          nestedMode: combination.nestedMC || combination.nestedMode || false,
          aleatorySamplesPerEpistemic: combination.aleatoryCounts || combination.aleatorySamples,
          updateInterval: config.fixedParameters.updateInterval || 1000,
          parameters: { ...combination } // Keep all parameters for tracking
        });
        return;
      }

      const dimension = dimensions[dimIndex];
      for (const value of dimension.values) {
        generateCombinations(dimIndex + 1, { ...current, [dimension.name]: value });
      }
    };

    // Start generation
    generateCombinations(0, {});

    console.log(`[MonteCarloManager] Generated ${configurations.length} configurations from ${dimensions.length} dimensions`);
    dimensions.forEach(d => {
      console.log(`  - ${d.name}: ${d.values.length} values`);
    });

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
          batchId,
          label: `${paramName}=${value}`,
          runs: simulationIds.map(id => ({ simulationId: id })),
          parameters: { [paramName]: value }
        });
      }
    }

    return groups;
  }

  /**
   * Get sweep results for visualization
   */
  getSweepResults(batchId: string): ParameterSweepGroup[] | null {
    return this.batchSweepGroups.get(batchId) || null;
  }

  /**
   * Start executing a batch or parameter sweep
   */
  async startBatch(batchId: string): Promise<void> {
    const config = this.batches.get(batchId);
    const statusArray = this.batchStatus.get(batchId);

    if (!config || !statusArray) {
      throw new Error(`Batch ${batchId} not found`);
    }

    console.log(`[MonteCarloManager] Starting batch ${batchId}`);

    // Emit batch started event
    this.emit('batchStarted', batchId);

    // Queue all simulations
    for (const status of statusArray) {
      // For parameter sweeps, use per-run parameters if available
      // Otherwise use batch config (standard Monte Carlo runs)
      const hasCustomParams = status.parameters && Object.keys(status.parameters).length > 0;

      const runConfig: SimulationRunConfig = {
        simulationId: status.simulationId,
        seed: status.seed,
        scenario: config.scenario,
        speculativeScenario: config.speculativeScenario,
        thresholdSliders: config.thresholdSliders,
        maxMonths: status.maxMonths,
        updateInterval: config.updateInterval || 1000,
        batchId,
        runIndex: statusArray.indexOf(status),
        // Merge custom sweep parameters (overwrites batch config if present)
        ...(hasCustomParams ? status.parameters : {})
      };

      this.runQueue.push(runConfig);
    }

    console.log(`[MonteCarloManager] Queued ${statusArray.length} simulations`);

    // Log parameter sweep dimensions if present
    const firstStatus = statusArray[0];
    if (firstStatus?.parameters) {
      const paramNames = Object.keys(firstStatus.parameters);
      console.log(`[MonteCarloManager] Parameter sweep active: ${paramNames.join(', ')}`);
    }

    // Start processing queue
    this.processQueue();
  }

  /**
   * Alias for startBatch (for parameter sweeps)
   */
  async startParameterSweep(batchId: string): Promise<void> {
    return this.startBatch(batchId);
  }

  // ==========================================================================
  // QUEUE PROCESSING
  // ==========================================================================

  /**
   * Process simulation queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue) return;
    this.isProcessingQueue = true;

    while (this.runQueue.length > 0) {
      // Check available capacity
      const activeCount = Array.from(this.workerPool.values()).filter(w => w.busy).length;
      const capacity = this.getCurrentCapacity();

      if (activeCount >= capacity) {
        // Wait briefly then retry
        await new Promise(resolve => setTimeout(resolve, 100));
        continue;
      }

      // Pop next simulation from queue
      const runConfig = this.runQueue.shift()!;

      // Get or create a worker
      const worker = await this.getOrCreateWorker();
      if (!worker) {
        // No available workers, put back in queue
        this.runQueue.unshift(runConfig);
        await new Promise(resolve => setTimeout(resolve, 100));
        continue;
      }

      // Start simulation
      this.startSimulation(worker, runConfig);

      // Emit progress update
      this.emitBatchProgress(runConfig.batchId);
    }

    this.isProcessingQueue = false;
  }

  /**
   * Start a simulation on a worker
   */
  private async startSimulation(
    worker: SimulationWorkerClient,
    config: SimulationRunConfig
  ): Promise<void> {
    const slot = Array.from(this.workerPool.entries())
      .find(([_, s]) => s.worker === worker)?.[1];

    if (!slot) return;

    // Mark worker as busy
    slot.busy = true;
    slot.simulationId = config.simulationId;

    // Update status
    this.updateSimulationStatus(config.batchId, config.simulationId, { status: 'running', startTime: Date.now() });

    // Emit simulation started
    this.emit('simulationStarted', config.simulationId, config.batchId);

    try {
      // Configure and start simulation
      await worker.initializeSimulation({
        seed: config.seed,
        scenarioMode: config.scenario,
        speculativeScenario: config.speculativeScenario,
        thresholdSliders: config.thresholdSliders,
        nestedMonteCarloMode: false,
        maxMonths: config.maxMonths
      });

      // Setup progress callback
      worker.onProgress = (delta: StateDelta) => {
        const month = delta.state?.currentMonth || 0;
        this.emit('simulationProgress', config.simulationId, config.batchId, month);

        // Update status
        this.updateSimulationStatus(config.batchId, config.simulationId, { currentMonth: month });

        // Emit batch progress periodically
        if (month % 10 === 0) {
          this.emitBatchProgress(config.batchId);
        }
      };

      // Run simulation
      const outcome = await worker.runSimulation();

      // Simulation completed successfully
      this.updateSimulationStatus(config.batchId, config.simulationId, {
        status: 'completed',
        outcomeReason: outcome.reason,
        endTime: Date.now()
      });

      // Update sweep groups if applicable
      const sweepGroups = this.batchSweepGroups.get(config.batchId);
      if (sweepGroups) {
        for (const group of sweepGroups) {
          const run = group.runs?.find(r => r.simulationId === config.simulationId);
          if (run) {
            run.outcome = outcome.outcome;
          }
        }
      }

      this.emit('simulationCompleted', config.simulationId, config.batchId, outcome.outcome);

    } catch (error: any) {
      // Simulation failed
      console.error(`[MonteCarloManager] Simulation ${config.simulationId} failed:`, error);

      this.updateSimulationStatus(config.batchId, config.simulationId, {
        status: 'failed',
        error: error.message,
        endTime: Date.now()
      });

      this.emit('simulationError', config.simulationId, config.batchId, error);
    } finally {
      // Mark worker as available
      slot.busy = false;
      slot.simulationId = null;

      // Check if batch is complete
      this.checkBatchCompletion(config.batchId);

      // Continue processing queue
      this.processQueue();
    }
  }

  /**
   * Update simulation status
   */
  private updateSimulationStatus(
    batchId: string,
    simulationId: string,
    updates: Partial<SimulationRunStatus>
  ): void {
    const statusArray = this.batchStatus.get(batchId);
    if (!statusArray) return;

    const status = statusArray.find(s => s.simulationId === simulationId);
    if (status) {
      Object.assign(status, updates);
    }
  }

  /**
   * Check if batch is complete
   */
  private checkBatchCompletion(batchId: string): void {
    const statusArray = this.batchStatus.get(batchId);
    if (!statusArray) return;

    const allComplete = statusArray.every(s => s.status === 'completed' || s.status === 'failed');
    if (allComplete) {
      console.log(`[MonteCarloManager] Batch ${batchId} complete`);
      this.emit('batchCompleted', batchId);
    }
  }

  /**
   * Emit batch progress update
   */
  private emitBatchProgress(batchId: string): void {
    const statusArray = this.batchStatus.get(batchId);
    if (!statusArray) return;

    const completed = statusArray.filter(s => s.status === 'completed').length;
    const running = statusArray.filter(s => s.status === 'running').length;
    const queued = statusArray.filter(s => s.status === 'queued').length;
    const failed = statusArray.filter(s => s.status === 'failed').length;

    const progress: MonteCarloBatchProgress = {
      batchId,
      totalRuns: statusArray.length,
      completedRuns: completed,
      runningRuns: running,
      queuedRuns: queued,
      failedRuns: failed,
      progress: completed / statusArray.length,
      startTime: statusArray[0]?.startTime || Date.now(),
      currentTime: Date.now(),
      activeSimulations: running,
      queuedSimulations: this.runQueue.length
    };

    // Add sweep metadata if applicable
    if (batchId.startsWith('sweep-')) {
      progress.isSweep = true;
      progress.sweepGroups = this.batchSweepGroups.get(batchId);
    }

    this.emit('batchProgress', progress);
  }

  // ==========================================================================
  // WORKER MANAGEMENT
  // ==========================================================================

  /**
   * Get or create an available worker
   */
  private async getOrCreateWorker(): Promise<SimulationWorkerClient | null> {
    // First, try to find an idle worker
    for (const [id, slot] of this.workerPool) {
      if (!slot.busy) {
        return slot.worker;
      }
    }

    // Check if we can create a new worker
    if (this.workerPool.size < this.getCurrentCapacity()) {
      const workerId = `worker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const worker = new SimulationWorkerClient();

      this.workerPool.set(workerId, {
        worker,
        simulationId: null,
        busy: false
      });

      console.log(`[MonteCarloManager] Created worker ${workerId} (${this.workerPool.size}/${this.MAX_WORKERS})`);
      return worker;
    }

    // No available workers and at capacity
    return null;
  }

  /**
   * Get current capacity based on performance
   */
  private getCurrentCapacity(): number {
    // If experiencing frame drops, use degraded concurrency
    if (this.lowFrameCount > 5) {
      return Math.min(this.DEGRADED_CONCURRENCY, this.workerPool.size + 1);
    }
    return this.NORMAL_CONCURRENCY;
  }

  // ==========================================================================
  // PERFORMANCE MONITORING
  // ==========================================================================

  /**
   * Start monitoring frame rate for performance adaptation
   */
  private startFrameRateMonitoring(): void {
    // Guard against non-browser environments
    if (typeof requestAnimationFrame === 'undefined') {
      return;
    }

    const monitorFrame = (timestamp: number) => {
      if (this.lastFrameTime > 0) {
        const deltaTime = timestamp - this.lastFrameTime;
        const fps = 1000 / deltaTime;

        // Detect low frame rate (< 30 FPS)
        if (fps < 30) {
          this.lowFrameCount++;
          if (this.lowFrameCount > 5) {
            console.warn(`[MonteCarloManager] Low FPS detected (${fps.toFixed(1)}), throttling workers`);
          }
        } else {
          this.lowFrameCount = Math.max(0, this.lowFrameCount - 1);
        }
      }

      this.lastFrameTime = timestamp;
      this.frameRateMonitor = requestAnimationFrame(monitorFrame);
    };

    this.frameRateMonitor = requestAnimationFrame(monitorFrame);
  }

  /**
   * Stop frame rate monitoring
   */
  private stopFrameRateMonitoring(): void {
    if (this.frameRateMonitor !== null && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.frameRateMonitor);
      this.frameRateMonitor = null;
    }
  }

  // ==========================================================================
  // AGGREGATE STATISTICS
  // ==========================================================================

  /**
   * Get aggregate statistics for a batch
   */
  async getAggregateStats(batchId: string): Promise<MonteCarloAggregateStats | null> {
    const config = this.batches.get(batchId);
    const statusArray = this.batchStatus.get(batchId);

    if (!config || !statusArray) return null;

    // Count outcomes
    let utopiaCount = 0;
    let dystopiaCount = 0;
    let extinctionCount = 0;
    let stalemateCount = 0;
    let noneCount = 0;

    const monthsToOutcome: number[] = [];

    for (const status of statusArray) {
      if (!status.unifiedOutcome) {
        noneCount++;
        continue;
      }

      // Map 7-tier unified outcomes to 4-category legacy outcomes for stats
      switch (status.unifiedOutcome.primaryOutcome) {
        case 'utopia':
          utopiaCount++;
          monthsToOutcome.push(status.currentMonth);
          break;
        case 'dystopia':
        case 'crisis_era':
        case 'collapse':
        case 'dark_age':
          dystopiaCount++;
          monthsToOutcome.push(status.currentMonth);
          break;
        case 'extinction':
        case 'terminal':
        case 'bottleneck':
          extinctionCount++;
          monthsToOutcome.push(status.currentMonth);
          break;
        case 'status_quo':
        case 'inconclusive':
          stalemateCount++;
          monthsToOutcome.push(status.currentMonth);
          break;
        default:
          noneCount++;
      }
    }

    // Calculate timeline statistics
    const avgMonthsToOutcome = monthsToOutcome.length > 0
      ? monthsToOutcome.reduce((a, b) => a + b, 0) / monthsToOutcome.length
      : 0;
    const minMonthsToOutcome = monthsToOutcome.length > 0 ? Math.min(...monthsToOutcome) : 0;
    const maxMonthsToOutcome = monthsToOutcome.length > 0 ? Math.max(...monthsToOutcome) : 0;
    const medianMonthsToOutcome = monthsToOutcome.length > 0
      ? monthsToOutcome.sort((a, b) => a - b)[Math.floor(monthsToOutcome.length / 2)]
      : 0;

    // Calculate probabilities
    const completedCount = statusArray.filter(s => s.status === 'completed').length;
    const outcomeProbabilities = {
      utopia: completedCount > 0 ? (utopiaCount / completedCount) * 100 : 0,
      dystopia: completedCount > 0 ? (dystopiaCount / completedCount) * 100 : 0,
      extinction: completedCount > 0 ? (extinctionCount / completedCount) * 100 : 0,
      stalemate: completedCount > 0 ? (stalemateCount / completedCount) * 100 : 0
    };

    // Calculate survival rate and additional stats for SweepResultsPanel
    const survivalRate = completedCount > 0 ? (completedCount - extinctionCount) / completedCount : 0;
    const averageMonthsSurvived = avgMonthsToOutcome; // Same as avgMonthsToOutcome

    // Build outcome breakdown for visualization
    const outcomeBreakdown = {
      utopia: utopiaCount,
      postScarcity: 0, // Would need to distinguish these in simulation
      sustainable: 0,
      struggling: dystopiaCount,
      collapse: stalemateCount,
      extinction: extinctionCount,
      unknown: noneCount
    };

    return {
      batchId,
      totalRuns: statusArray.length,
      completedRuns: completedCount,
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
      avgMaxAICapability: 0.7, // TODO: Calculate from IndexedDB

      // Additional fields for SweepResultsPanel
      averageMonthsSurvived,
      survivalRate,
      outcomeBreakdown,
      timelineData: [] // TODO: Build timeline array from simulation data
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
    this.runQueue.length = 0;
    this.callbacks.clear();
  }
}