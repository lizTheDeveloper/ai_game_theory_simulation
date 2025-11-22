/**
 * Process Registry for Agent Lifecycle Management
 *
 * Tracks all spawned Python agent processes to prevent memory leaks and zombie processes.
 *
 * Problems solved:
 * - CRITICAL: Agent processes accumulate without cleanup on crash/restart cycles
 * - Resource exhaustion after days/weeks of operation
 * - No zombie process detection or cleanup
 *
 * Features:
 * - Tracks process birth, death, and cleanup
 * - Periodic zombie process detection (every 60 seconds)
 * - Prometheus metrics for process count and zombie detection
 * - Graceful cleanup on platform shutdown
 *
 * Author: Marcus (Platform Engineer)
 * Date: 2025-11-22
 */

import { ChildProcess } from 'child_process';
import { Gauge, Counter } from 'prom-client';
import { normalizeAgentId } from '../monitoring/metricsHelpers';

/**
 * Process lifecycle states
 */
export enum ProcessState {
  SPAWNING = 'spawning',
  RUNNING = 'running',
  STOPPING = 'stopping',
  STOPPED = 'stopped',
  CRASHED = 'crashed',
  ZOMBIE = 'zombie'
}

/**
 * Metadata for a tracked process
 */
export interface ProcessMetadata {
  /**
   * Agent ID (e.g., 'agent_001')
   */
  agentId: string;

  /**
   * Process ID (PID)
   */
  pid: number;

  /**
   * Child process object
   */
  process: ChildProcess;

  /**
   * Current process state
   */
  state: ProcessState;

  /**
   * When this process was spawned
   */
  spawnedAt: Date;

  /**
   * When this process was last seen alive (updated by health checks)
   */
  lastSeenAlive: Date;

  /**
   * How many times this agent has been restarted
   */
  restartCount: number;

  /**
   * Exit code (if process has exited)
   */
  exitCode?: number;

  /**
   * Exit signal (if process was killed by signal)
   */
  exitSignal?: string;
}

/**
 * Prometheus metrics
 */
const processCountGauge = new Gauge({
  name: 'marcus_agent_processes_total',
  help: 'Total number of agent processes tracked',
  labelNames: ['state']
});

const zombieProcessCounter = new Counter({
  name: 'marcus_agent_processes_zombies_total',
  help: 'Total number of zombie processes detected and cleaned up'
});

const processRestartCounter = new Counter({
  name: 'marcus_agent_process_restarts_total',
  help: 'Total number of agent process restarts',
  labelNames: ['agent_id']
});

/**
 * Process Registry
 *
 * Singleton that tracks all spawned agent processes.
 *
 * Usage:
 * ```typescript
 * const registry = ProcessRegistry.getInstance();
 *
 * // Register new process
 * registry.register(agentId, childProcess, 0);
 *
 * // Update state
 * registry.updateState(agentId, ProcessState.RUNNING);
 *
 * // Mark as alive (from health checks)
 * registry.markAlive(agentId);
 *
 * // Unregister on clean shutdown
 * registry.unregister(agentId);
 * ```
 */
export class ProcessRegistry {
  private static instance: ProcessRegistry;

  private processes: Map<string, ProcessMetadata> = new Map();
  private cleanupInterval?: NodeJS.Timeout;

  /**
   * How long before a process is considered a zombie (milliseconds)
   * Default: 120 seconds (2 minutes)
   */
  private zombieThresholdMs: number = 120_000;

  /**
   * How often to check for zombies (milliseconds)
   * Default: 60 seconds
   */
  private cleanupIntervalMs: number = 60_000;

  private constructor() {
    // Start periodic cleanup
    this.startCleanupMonitor();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): ProcessRegistry {
    if (!ProcessRegistry.instance) {
      ProcessRegistry.instance = new ProcessRegistry();
    }
    return ProcessRegistry.instance;
  }

  /**
   * Register a new agent process.
   *
   * @param agentId Agent ID
   * @param process Child process object
   * @param restartCount How many times this agent has been restarted
   */
  register(agentId: string, process: ChildProcess, restartCount: number = 0): void {
    if (!process.pid) {
      throw new Error(`❌ CRITICAL: Cannot register process without PID for agent ${agentId}`);
    }

    const metadata: ProcessMetadata = {
      agentId,
      pid: process.pid,
      process,
      state: ProcessState.SPAWNING,
      spawnedAt: new Date(),
      lastSeenAlive: new Date(),
      restartCount
    };

    this.processes.set(agentId, metadata);

    console.log(`📝 Process registered: ${agentId} (PID: ${process.pid}, restarts: ${restartCount})`);

    // Update metrics
    this.updateMetrics();

    // Set up exit handler
    process.on('exit', (code, signal) => {
      this.handleProcessExit(agentId, code, signal);
    });
  }

  /**
   * Update process state.
   *
   * @param agentId Agent ID
   * @param state New state
   */
  updateState(agentId: string, state: ProcessState): void {
    const metadata = this.processes.get(agentId);
    if (!metadata) {
      console.warn(`⚠️ Cannot update state for unregistered process: ${agentId}`);
      return;
    }

    metadata.state = state;

    if (state === ProcessState.RUNNING) {
      metadata.lastSeenAlive = new Date();
    }

    console.log(`📊 Process state updated: ${agentId} -> ${state}`);

    this.updateMetrics();
  }

  /**
   * Mark process as alive (called from health checks).
   *
   * @param agentId Agent ID
   */
  markAlive(agentId: string): void {
    const metadata = this.processes.get(agentId);
    if (!metadata) {
      return;
    }

    metadata.lastSeenAlive = new Date();

    // If it was in a bad state, recover
    if (metadata.state === ProcessState.ZOMBIE || metadata.state === ProcessState.CRASHED) {
      metadata.state = ProcessState.RUNNING;
      console.log(`✅ Process recovered: ${agentId}`);
      this.updateMetrics();
    }
  }

  /**
   * Unregister a process (clean shutdown).
   *
   * @param agentId Agent ID
   */
  unregister(agentId: string): void {
    const metadata = this.processes.get(agentId);
    if (!metadata) {
      return;
    }

    this.processes.delete(agentId);

    console.log(`🗑️ Process unregistered: ${agentId} (PID: ${metadata.pid})`);

    this.updateMetrics();
  }

  /**
   * Handle process exit.
   *
   * @param agentId Agent ID
   * @param code Exit code
   * @param signal Exit signal
   */
  private handleProcessExit(agentId: string, code: number | null, signal: string | null): void {
    const metadata = this.processes.get(agentId);
    if (!metadata) {
      return;
    }

    metadata.exitCode = code ?? undefined;
    metadata.exitSignal = signal ?? undefined;

    if (code === 0 || signal === 'SIGTERM') {
      // Clean exit
      metadata.state = ProcessState.STOPPED;
      console.log(`✅ Process exited cleanly: ${agentId} (code: ${code}, signal: ${signal})`);
    } else {
      // Crash
      metadata.state = ProcessState.CRASHED;
      console.error(`❌ Process crashed: ${agentId} (code: ${code}, signal: ${signal})`);
    }

    this.updateMetrics();
  }

  /**
   * Start periodic zombie process cleanup.
   */
  private startCleanupMonitor(): void {
    if (this.cleanupInterval) {
      return;
    }

    this.cleanupInterval = setInterval(() => {
      this.detectAndCleanupZombies();
    }, this.cleanupIntervalMs);

    console.log(`🧹 Zombie cleanup monitor started (interval: ${this.cleanupIntervalMs}ms, threshold: ${this.zombieThresholdMs}ms)`);
  }

  /**
   * Stop periodic cleanup.
   */
  stopCleanupMonitor(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
      console.log('🛑 Zombie cleanup monitor stopped');
    }
  }

  /**
   * Detect and cleanup zombie processes.
   *
   * A process is considered a zombie if:
   * - It hasn't been seen alive in zombieThresholdMs
   * - It's not in STOPPING or STOPPED state (those are expected)
   */
  private detectAndCleanupZombies(): void {
    const now = Date.now();
    let zombiesFound = 0;

    // Use Array.from to avoid downlevelIteration requirement
    const entries = Array.from(this.processes.entries());

    for (const [agentId, metadata] of entries) {
      // Skip processes that are supposed to be down
      if (metadata.state === ProcessState.STOPPING || metadata.state === ProcessState.STOPPED) {
        continue;
      }

      // Check if process hasn't been seen alive recently
      const timeSinceAlive = now - metadata.lastSeenAlive.getTime();

      if (timeSinceAlive > this.zombieThresholdMs) {
        console.warn(
          `☠️ Zombie process detected: ${agentId} (PID: ${metadata.pid}, ` +
          `last alive: ${Math.round(timeSinceAlive / 1000)}s ago)`
        );

        metadata.state = ProcessState.ZOMBIE;
        zombiesFound++;

        // Try to kill the process
        this.killZombieProcess(metadata);

        // Track metric
        zombieProcessCounter.inc();
      }
    }

    if (zombiesFound > 0) {
      console.warn(`⚠️ Zombie cleanup: ${zombiesFound} zombie process(es) found and killed`);
      this.updateMetrics();
    }
  }

  /**
   * Kill a zombie process.
   *
   * @param metadata Process metadata
   */
  private killZombieProcess(metadata: ProcessMetadata): void {
    try {
      // Try SIGTERM first (graceful)
      metadata.process.kill('SIGTERM');

      // Force kill after 5 seconds if still alive
      setTimeout(() => {
        if (!metadata.process.killed) {
          console.warn(`⚠️ Force killing zombie process: ${metadata.agentId} (PID: ${metadata.pid})`);
          metadata.process.kill('SIGKILL');
        }
      }, 5000);

    } catch (err) {
      console.error(`❌ Failed to kill zombie process ${metadata.agentId}:`, err);
    }
  }

  /**
   * Update Prometheus metrics.
   */
  private updateMetrics(): void {
    // Count processes by state
    const stateCounts: Record<string, number> = {};

    // Use Array.from to avoid downlevelIteration requirement
    const values = Array.from(this.processes.values());

    for (const metadata of values) {
      const state = metadata.state;
      stateCounts[state] = (stateCounts[state] || 0) + 1;
    }

    // Update gauges
    for (const [state, count] of Object.entries(stateCounts)) {
      processCountGauge.set({ state }, count);
    }

    // Set 0 for states with no processes
    for (const state of Object.values(ProcessState)) {
      if (!stateCounts[state]) {
        processCountGauge.set({ state }, 0);
      }
    }
  }

  /**
   * Get all processes.
   *
   * @returns Map of agent ID -> process metadata
   */
  getAllProcesses(): ReadonlyMap<string, ProcessMetadata> {
    return this.processes;
  }

  /**
   * Get process metadata for specific agent.
   *
   * @param agentId Agent ID
   * @returns Process metadata or undefined
   */
  getProcess(agentId: string): ProcessMetadata | undefined {
    return this.processes.get(agentId);
  }

  /**
   * Get count of processes by state.
   *
   * @param state Process state to count (optional, counts all if not specified)
   * @returns Count of processes
   */
  getProcessCount(state?: ProcessState): number {
    if (!state) {
      return this.processes.size;
    }

    let count = 0;
    // Use Array.from to avoid downlevelIteration requirement
    const values = Array.from(this.processes.values());
    for (const metadata of values) {
      if (metadata.state === state) {
        count++;
      }
    }
    return count;
  }

  /**
   * Record a process restart.
   *
   * @param agentId Agent ID
   */
  recordRestart(agentId: string): void {
    // Use normalized agent_id for cardinality control
    processRestartCounter.inc({ agent_id: normalizeAgentId(agentId) });
  }

  /**
   * Cleanup all processes (shutdown).
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Process registry shutting down...');

    this.stopCleanupMonitor();

    // Kill all remaining processes
    const killPromises: Promise<void>[] = [];

    // Use Array.from to avoid downlevelIteration requirement
    const values = Array.from(this.processes.values());

    for (const metadata of values) {
      if (metadata.state !== ProcessState.STOPPED) {
        killPromises.push(
          new Promise((resolve) => {
            metadata.process.once('exit', () => resolve());

            // Try graceful shutdown
            metadata.process.kill('SIGTERM');

            // Force kill after 5 seconds
            setTimeout(() => {
              if (!metadata.process.killed) {
                metadata.process.kill('SIGKILL');
              }
              resolve();
            }, 5000);
          })
        );
      }
    }

    await Promise.all(killPromises);

    this.processes.clear();

    console.log('✅ Process registry shutdown complete');
  }
}
