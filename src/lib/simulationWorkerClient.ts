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
  qualityOfLife?: number;
  population?: number;
  aiCount?: number;

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
  deployedTechs?: Array<{ name: string; tier: number; deployment: number }>;
  techRiskLevel?: number;

  // Upward Spirals & Outcomes
  activeSpirals?: Array<{ type: string; strength: number; duration: number }>;
  utopiaProgress?: number;
  extinctionProbability?: number;
  outcomeType?: string;

  // Multi-Paradigm DUI (4 perspectives)
  westernLiberalIndex?: number;
  developmentIndex?: number;
  ecologicalIndex?: number;
  indigenousIndex?: number;

  // Events (optional - only when significant changes happen)
  events?: Array<{
    type: string;
    description: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    category?: 'ai' | 'environment' | 'social' | 'crisis' | 'tech' | 'governance';
  }>;
}

export interface InitialStateSnapshot {
  currentMonth: number;
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
   */
  init(seed: number, scenario: ScenarioMode = 'historical', interval = 30000): void {
    if (this.initialized) {
      throw new Error('Already initialized. Create a new client to reinitialize.');
    }

    if (!this.worker) {
      throw new Error('Worker not available. Check browser console for errors. Web Workers may not be supported in this environment.');
    }

    console.log('[Client] Initializing worker with seed:', seed, 'scenario:', scenario);

    this.worker.postMessage({
      type: 'init',
      seed,
      scenario,
      interval
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
