/**
 * Multi-Level State Manager
 *
 * Implements Nested Learning's multi-timescale memory architecture:
 * - Level 0 (Fast): f=1.0 - Immediate context (every operation)
 * - Level 1 (Medium): f=0.1 - Active processing (every ~10 operations)
 * - Level 2 (Slow): f=0.01 - Learned patterns (every ~100 operations)
 * - Level 3 (Core): f=0.001 - Verified knowledge (every ~1000 operations)
 *
 * Each level has its own:
 * - Update frequency (operations per update)
 * - Memory storage
 * - Consolidation criteria
 *
 * Enforces hierarchy: f_L0 > f_L1 > f_L2 > f_L3
 *
 * Reference: Behrouz et al., "Nested Learning", NeurIPS 2025
 */

import { assertFinite } from '@/simulation/utils/assertions';

/**
 * Nested Learning level (0-3)
 */
export type NLLevel = 0 | 1 | 2 | 3;

/**
 * Update frequency (operations per update)
 * Higher frequency = more frequent updates
 */
export type UpdateFrequency = 1.0 | 0.1 | 0.01 | 0.001;

/**
 * Level configuration
 */
export interface LevelConfig {
  level: NLLevel;
  frequency: UpdateFrequency;
  name: string;
  description: string;
  updateIntervalMs?: number; // Optional: time-based updates
}

/**
 * Level state metadata
 */
export interface LevelState<T = unknown> {
  level: NLLevel;
  frequency: UpdateFrequency;
  memory: T;
  lastUpdate: number; // timestamp
  updateCount: number; // total updates
  operationCount: number; // operations since last update
}

/**
 * Multi-level state update result
 */
export interface UpdateResult {
  updated: boolean;
  level: NLLevel;
  reason: string;
  nextUpdateIn?: number; // operations until next update
}

/**
 * Default level configurations
 */
export const DEFAULT_LEVEL_CONFIGS: LevelConfig[] = [
  {
    level: 0,
    frequency: 1.0,
    name: 'Fast Memory',
    description: 'Immediate context (parameters, claims, tool events)',
  },
  {
    level: 1,
    frequency: 0.1,
    name: 'Medium Memory',
    description: 'Active processing (verification, analysis, task detection)',
  },
  {
    level: 2,
    frequency: 0.01,
    name: 'Slow Memory',
    description: 'Learned patterns (classifiers, summaries, session insights)',
  },
  {
    level: 3,
    frequency: 0.001,
    name: 'Core Memory',
    description: 'Verified knowledge (research papers, core insights, agent identity)',
  },
];

/**
 * Multi-Level State Manager
 *
 * Manages state across 4 Nested Learning levels with enforced update frequency hierarchy.
 */
export class MultiLevelState<T0 = unknown, T1 = unknown, T2 = unknown, T3 = unknown> {
  private levels: [
    LevelState<T0>,
    LevelState<T1>,
    LevelState<T2>,
    LevelState<T3>
  ];

  private configs: LevelConfig[];

  constructor(
    initialMemory: [T0, T1, T2, T3],
    configs: LevelConfig[] = DEFAULT_LEVEL_CONFIGS
  ) {
    if (configs.length !== 4) {
      throw new Error('❌ CRITICAL: Must provide exactly 4 level configs');
    }

    this.configs = configs;

    // Validate frequency hierarchy
    this.validateFrequencyHierarchy();

    // Initialize level states
    const now = Date.now();
    this.levels = [
      {
        level: 0,
        frequency: configs[0].frequency,
        memory: initialMemory[0],
        lastUpdate: now,
        updateCount: 0,
        operationCount: 0,
      },
      {
        level: 1,
        frequency: configs[1].frequency,
        memory: initialMemory[1],
        lastUpdate: now,
        updateCount: 0,
        operationCount: 0,
      },
      {
        level: 2,
        frequency: configs[2].frequency,
        memory: initialMemory[2],
        lastUpdate: now,
        updateCount: 0,
        operationCount: 0,
      },
      {
        level: 3,
        frequency: configs[3].frequency,
        memory: initialMemory[3],
        lastUpdate: now,
        updateCount: 0,
        operationCount: 0,
      },
    ];
  }

  /**
   * Validate that update frequency hierarchy is maintained
   * Requirement: f_L0 > f_L1 > f_L2 > f_L3
   *
   * @throws Error if hierarchy violated
   */
  private validateFrequencyHierarchy(): void {
    for (let i = 1; i < this.configs.length; i++) {
      if (this.configs[i].frequency >= this.configs[i - 1].frequency) {
        throw new Error(
          `❌ CRITICAL: Frequency hierarchy violated: ` +
            `f_L${i} (${this.configs[i].frequency}) >= ` +
            `f_L${i - 1} (${this.configs[i - 1].frequency})\n` +
            `Required: f_L0 > f_L1 > f_L2 > f_L3`
        );
      }
    }
  }

  /**
   * Check if a level should be updated based on its frequency
   *
   * @param level - Level to check
   * @returns True if update is due
   */
  public shouldUpdate(level: NLLevel): boolean {
    const state = this.levels[level];
    const frequency = state.frequency;

    // Calculate required operations for update
    // frequency = updates per operation
    // interval = operations per update = 1 / frequency
    const requiredOperations = Math.round(1 / frequency);

    return state.operationCount >= requiredOperations;
  }

  /**
   * Increment operation counter for a level
   *
   * @param level - Level to increment
   */
  public recordOperation(level: NLLevel): void {
    this.levels[level].operationCount++;
  }

  /**
   * Update a level's memory
   *
   * @param level - Level to update
   * @param memory - New memory state
   * @param force - Force update even if not due (default: false)
   * @returns Update result
   */
  public update<L extends NLLevel>(
    level: L,
    memory: L extends 0 ? T0 : L extends 1 ? T1 : L extends 2 ? T2 : T3,
    force = false
  ): UpdateResult {
    const state = this.levels[level];

    if (!force && !this.shouldUpdate(level)) {
      const requiredOperations = Math.round(1 / state.frequency);
      const remaining = requiredOperations - state.operationCount;

      return {
        updated: false,
        level,
        reason: 'Update not due yet',
        nextUpdateIn: remaining,
      };
    }

    // Update memory
    state.memory = memory as any;
    state.lastUpdate = Date.now();
    state.updateCount++;
    state.operationCount = 0; // Reset counter

    return {
      updated: true,
      level,
      reason: force ? 'Forced update' : 'Frequency threshold reached',
    };
  }

  /**
   * Get current memory for a level
   *
   * @param level - Level to retrieve
   * @returns Current memory state
   */
  public getMemory<L extends NLLevel>(
    level: L
  ): L extends 0 ? T0 : L extends 1 ? T1 : L extends 2 ? T2 : T3 {
    return this.levels[level].memory as any;
  }

  /**
   * Get level state metadata
   *
   * @param level - Level to retrieve
   * @returns Level state
   */
  public getState(level: NLLevel): Readonly<LevelState> {
    return Object.freeze({ ...this.levels[level] });
  }

  /**
   * Get all level states
   *
   * @returns Array of all level states
   */
  public getAllStates(): Readonly<LevelState>[] {
    return this.levels.map((state) => Object.freeze({ ...state }));
  }

  /**
   * Get level configuration
   *
   * @param level - Level to retrieve
   * @returns Level config
   */
  public getConfig(level: NLLevel): Readonly<LevelConfig> {
    return Object.freeze({ ...this.configs[level] });
  }

  /**
   * Get all level configurations
   *
   * @returns Array of all configs
   */
  public getAllConfigs(): Readonly<LevelConfig>[] {
    return this.configs.map((config) => Object.freeze({ ...config }));
  }

  /**
   * Calculate operations until next update for a level
   *
   * @param level - Level to check
   * @returns Operations remaining until update
   */
  public operationsUntilUpdate(level: NLLevel): number {
    const state = this.levels[level];
    const requiredOperations = Math.round(1 / state.frequency);
    return Math.max(0, requiredOperations - state.operationCount);
  }

  /**
   * Get statistics for all levels
   *
   * @returns Stats object
   */
  public getStats() {
    return {
      levels: this.levels.map((state, level) => ({
        level,
        name: this.configs[level].name,
        frequency: state.frequency,
        updateCount: state.updateCount,
        operationCount: state.operationCount,
        operationsUntilUpdate: this.operationsUntilUpdate(level as NLLevel),
        lastUpdateAgo: Date.now() - state.lastUpdate,
      })),
      hierarchyValid: this.isHierarchyValid(),
    };
  }

  /**
   * Validate that frequency hierarchy is still maintained
   * (Useful for runtime checks)
   *
   * @returns True if hierarchy valid
   */
  public isHierarchyValid(): boolean {
    try {
      this.validateFrequencyHierarchy();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Log current state to console
   */
  public logState(): void {
    console.log('\n=== Multi-Level State ===');
    this.levels.forEach((state, level) => {
      const config = this.configs[level];
      const untilUpdate = this.operationsUntilUpdate(level as NLLevel);

      console.log(
        `Level ${level} (${config.name}): ` +
          `f=${state.frequency}, ` +
          `updates=${state.updateCount}, ` +
          `ops=${state.operationCount}, ` +
          `next in ${untilUpdate} ops`
      );
    });
    console.log('========================\n');
  }

  /**
   * Reset all operation counters (for testing)
   */
  public resetCounters(): void {
    this.levels.forEach((state) => {
      state.operationCount = 0;
    });
  }

  /**
   * Reset all state (for testing)
   */
  public reset(
    initialMemory: [T0, T1, T2, T3]
  ): void {
    const now = Date.now();
    this.levels.forEach((state, level) => {
      state.memory = initialMemory[level] as any;
      state.lastUpdate = now;
      state.updateCount = 0;
      state.operationCount = 0;
    });
  }
}
