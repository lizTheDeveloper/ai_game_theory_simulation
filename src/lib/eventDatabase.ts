/**
 * IndexedDB wrapper for persistent event storage and simulation state persistence
 *
 * Stores all simulation events across runs for infinite scroll timeline.
 * Also stores full GameState snapshots for resume/continue functionality.
 * Events are indexed by simulation run and timestamp for efficient querying.
 */

import type { GameState, ScenarioMode } from '@/types/game';

interface StoredEvent {
  id: string;                 // Unique event ID
  simulationId: string;       // Simulation run ID (seed + scenario)
  timestamp: number;          // Month when event occurred
  type: string;
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  insertedAt: number;         // Real-world timestamp when stored
}

interface StoredSimulation {
  id: string;                    // `${seed}_${scenario}_${month}`
  simulationId: string;          // `${seed}_${scenario}` (base ID for grouping)
  gameState: GameState;          // Full simulation state
  lastUpdated: number;           // Timestamp of last save
  currentMonth: number;          // Quick access to progress
  version: string;               // Semantic version for migrations (MAJOR.MINOR.PATCH)
}

interface SimulationMetadata {
  id: string;                    // Unique metadata ID (same as base simulationId)
  seed: number;
  scenario: ScenarioMode;
  startDate: string;
  currentMonth: number;
  lastUpdated: number;
  eventCount: number;
  isRunning: boolean;            // Paused vs running
  version: string;               // Schema version
  population: number;            // Current population (for display)
  qualityOfLife: number;         // Current QoL (for display)
  aiCapability: number;          // Average AI capability (for display)
}

/**
 * LLM Inference Log for audit trail and analytics
 */
interface LLMInferenceLog {
  // Identity
  id: string;                    // Unique: `${simulationId}_${month}_${agentId}_${timestamp}`
  simulationId: string;          // Group by simulation run

  // Timing
  timestamp: number;             // Real-world Unix timestamp (ms)
  month: number;                 // Simulation month
  durationMs: number;            // API call duration

  // Agent Context
  agentId: string;               // AI agent ID
  agentName: string;             // AI agent name
  agentCapability: number;       // Capability at time of call
  agentAlignment: number;        // Alignment at time of call
  triggerReason: string;         // 'scheduled' | 'threshold' | 'crisis' | 'initial'

  // Request Data
  requestPrompt: string;         // Full context string sent to LLM
  requestBody: object;           // Full request JSON (messages, tools, temperature, etc.)
  provider: string;              // 'lm-studio' | 'openai' | 'anthropic'
  modelName: string;             // Model identifier (e.g., "qwen3-32b")

  // Response Data
  responseBody: object;          // Full response JSON
  tokensUsed: number;            // Token count from response
  weights: object;               // Parsed weights from tool call
  reasoning: string;             // LLM's reasoning text

  // Error Handling
  error?: string;                // Error message if call failed
  usedFallback: boolean;         // True if fallback weights were used

  // GCS Export Tracking
  exportedToGCS: boolean;        // Has this been exported?
  exportTimestamp?: number;      // When it was exported
  gcsPath?: string;              // GCS blob path
}

const DB_NAME = 'simulation_events';
const DB_VERSION = 3;  // Incremented for llm_inference_logs store
const STORE_NAME = 'events';
const SIMULATIONS_STORE = 'simulations';
const METADATA_STORE = 'simulation_metadata';
const LLM_LOGS_STORE = 'llm_inference_logs';

// Semantic versioning for simulation state schema
const SIMULATION_STATE_VERSION = '1.0.0';

/**
 * Parse semantic version string into comparable components
 */
function parseVersion(version: string): { major: number; minor: number; patch: number } {
  const parts = version.split('.').map(Number);
  const [major, minor, patch] = parts;

  // Fail loudly if version string is invalid
  if (parts.length !== 3 || isNaN(major) || isNaN(minor) || isNaN(patch)) {
    throw new Error(`[EventDB] Invalid version string: "${version}". Expected format: "MAJOR.MINOR.PATCH"`);
  }

  return { major, minor, patch };
}

/**
 * Check if version is compatible
 * - MAJOR version change: Breaking changes, cannot resume (data structure changed)
 * - MINOR version change: New features, backward compatible (can resume with warnings)
 * - PATCH version change: Bug fixes, fully compatible (can resume seamlessly)
 */
function isVersionCompatible(savedVersion: string, currentVersion: string): {
  compatible: boolean;
  requiresMigration: boolean;
  canResume: boolean;
  reason?: string;
} {
  const saved = parseVersion(savedVersion);
  const current = parseVersion(currentVersion);

  // Major version mismatch = breaking changes
  if (saved.major !== current.major) {
    return {
      compatible: false,
      requiresMigration: false,
      canResume: false,
      reason: `Major version mismatch: saved v${savedVersion}, current v${currentVersion}. Breaking changes prevent resume.`
    };
  }

  // Minor version newer = version downgrade (saved created with newer code)
  if (saved.minor > current.minor) {
    return {
      compatible: false,
      requiresMigration: false,
      canResume: false,
      reason: `Cannot load newer save: saved v${savedVersion}, current v${currentVersion}. Update your code or use an older save.`
    };
  }

  // Minor version older = might need migration
  if (saved.minor < current.minor) {
    return {
      compatible: true,
      requiresMigration: true,
      canResume: true,
      reason: `Minor version upgrade: saved v${savedVersion}, current v${currentVersion}. Migration will be applied.`
    };
  }

  // Same major.minor = fully compatible
  return { compatible: true, requiresMigration: false, canResume: true };
}

/**
 * Example migration: Add RNG call counter to old saves
 */
function migrate_1_0_to_1_1(state: any): any {
  if (state.rngCallCounter === undefined) {
    // Estimate RNG calls based on current month (approximate)
    state.rngCallCounter = state.currentMonth * 100; // Rough estimate
    console.warn('[Migration] RNG call counter estimated - determinism may be slightly affected');
  }
  return state;
}

/**
 * Migration functions for version upgrades
 */
async function migrateSimulationState(stored: StoredSimulation, targetVersion: string): Promise<StoredSimulation> {
  const currentVersion = parseVersion(stored.version);
  const target = parseVersion(targetVersion);

  let state = stored.gameState;

  // Apply migrations sequentially
  if (currentVersion.major === 1 && currentVersion.minor === 0) {
    // Migrate 1.0.x → 1.1.0: Add rngCallCounter
    if (target.minor >= 1) {
      state = migrate_1_0_to_1_1(state);
      stored.version = '1.1.0';
    }
  }

  // Future migrations go here
  // if (currentVersion.major === 1 && currentVersion.minor === 1) {
  //   if (target.minor >= 2) {
  //     state = migrate_1_1_to_1_2(state);
  //     stored.version = '1.2.0';
  //   }
  // }

  stored.gameState = state;
  return stored;
}

class EventDatabase {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize IndexedDB connection
   */
  async init(): Promise<void> {
    if (this.db) return; // Already initialized
    if (this.initPromise) return this.initPromise; // Initialization in progress

    this.initPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        console.warn('[EventDB] IndexedDB not available (SSR or unsupported browser)');
        resolve();
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('[EventDB] Failed to open database:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('[EventDB] Database opened successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const oldVersion = event.oldVersion;

        // Create events object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });

          // Create indexes for efficient querying
          store.createIndex('simulationId', 'simulationId', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('simId_timestamp', ['simulationId', 'timestamp'], { unique: false });

          console.log('[EventDB] Events object store created with indexes');
        }

        // Create simulations object store (v2+)
        if (oldVersion < 2 && !db.objectStoreNames.contains(SIMULATIONS_STORE)) {
          const simulationsStore = db.createObjectStore(SIMULATIONS_STORE, { keyPath: 'id' });

          // Index by base simulationId for grouping saves
          simulationsStore.createIndex('simulationId', 'simulationId', { unique: false });
          // Index by lastUpdated for finding most recent save
          simulationsStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });

          console.log('[EventDB] Simulations object store created with indexes');
        }

        // Create simulation_metadata object store (v2+)
        if (oldVersion < 2 && !db.objectStoreNames.contains(METADATA_STORE)) {
          const metadataStore = db.createObjectStore(METADATA_STORE, { keyPath: 'id' });

          // Index by lastUpdated for sorting
          metadataStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });

          console.log('[EventDB] Simulation metadata object store created');
        }

        // Create llm_inference_logs object store (v3+)
        if (oldVersion < 3 && !db.objectStoreNames.contains(LLM_LOGS_STORE)) {
          const llmLogsStore = db.createObjectStore(LLM_LOGS_STORE, { keyPath: 'id' });

          // Index by simulationId for querying logs by simulation run
          llmLogsStore.createIndex('simulationId', 'simulationId', { unique: false });
          // Index by agentId for querying logs by agent
          llmLogsStore.createIndex('agentId', 'agentId', { unique: false });
          // Index by timestamp for chronological queries
          llmLogsStore.createIndex('timestamp', 'timestamp', { unique: false });
          // Index by exportedToGCS for finding unexported logs
          llmLogsStore.createIndex('exportedToGCS', 'exportedToGCS', { unique: false });
          // Composite index: simulationId + month for efficient filtering
          llmLogsStore.createIndex('simId_month', ['simulationId', 'month'], { unique: false });

          console.log('[EventDB] LLM inference logs object store created with indexes');
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Add events to the database
   */
  async addEvents(simulationId: string, events: Omit<StoredEvent, 'simulationId' | 'insertedAt'>[]): Promise<void> {
    await this.init();
    if (!this.db) {
      console.warn('[EventDB] Database not available, skipping storage');
      return;
    }

    const transaction = this.db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const now = Date.now();

    for (const event of events) {
      const storedEvent: StoredEvent = {
        ...event,
        simulationId,
        insertedAt: now
      };

      // Use put instead of add to allow updates
      store.put(storedEvent);
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Get events for a simulation run, paginated by timestamp
   *
   * @param simulationId - Simulation run ID
   * @param limit - Number of events to fetch
   * @param beforeTimestamp - Fetch events before this timestamp (for infinite scroll)
   * @returns Events in reverse chronological order (newest first)
   */
  async getEvents(
    simulationId: string,
    limit: number = 50,
    beforeTimestamp?: number
  ): Promise<StoredEvent[]> {
    await this.init();
    if (!this.db) {
      console.warn('[EventDB] Database not available');
      return [];
    }

    const transaction = this.db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('simId_timestamp');

    const events: StoredEvent[] = [];

    // Create key range for this simulation
    const keyRangeStart = [simulationId, 0];
    const keyRangeEnd = beforeTimestamp !== undefined
      ? [simulationId, beforeTimestamp]
      : [simulationId, Number.MAX_SAFE_INTEGER];

    // If beforeTimestamp is 0 or less, we can't create an exclusive upper bound
    // because it would make start === end with an open bound, which is invalid
    const upperOpen = beforeTimestamp !== undefined && beforeTimestamp > 0;
    const range = IDBKeyRange.bound(keyRangeStart, keyRangeEnd, false, upperOpen);

    return new Promise((resolve, reject) => {
      const request = index.openCursor(range, 'prev'); // Reverse order (newest first)

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;

        if (cursor && events.length < limit) {
          events.push(cursor.value);
          cursor.continue();
        } else {
          resolve(events);
        }
      };

      request.onerror = () => {
        console.error('[EventDB] Error fetching events:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get total event count for a simulation
   */
  async getEventCount(simulationId: string): Promise<number> {
    await this.init();
    if (!this.db) return 0;

    const transaction = this.db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('simulationId');

    return new Promise((resolve, reject) => {
      const request = index.count(simulationId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all events for a simulation run
   */
  async clearSimulation(simulationId: string): Promise<void> {
    await this.init();
    if (!this.db) return;

    const transaction = this.db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('simulationId');

    return new Promise((resolve, reject) => {
      const request = index.openCursor(IDBKeyRange.only(simulationId));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear entire database (all simulations)
   */
  async clearAll(): Promise<void> {
    await this.init();
    if (!this.db) return;

    const transaction = this.db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // ========================================================================
  // Simulation State Persistence Methods
  // ========================================================================

  /**
   * Save simulation state snapshot to IndexedDB
   *
   * @param simulationId - Base simulation ID (e.g., "42000_historical")
   * @param state - Full GameState to save
   * @param applyRotation - Whether to apply save rotation after saving (default: true)
   */
  async saveSimulation(simulationId: string, state: GameState, applyRotation: boolean = true): Promise<void> {
    await this.init();
    if (!this.db) {
      console.warn('[EventDB] Database not available, skipping simulation save');
      return;
    }

    try {
      const now = Date.now();
      const saveId = `${simulationId}_${state.currentMonth}`;

      // Deep clone state to avoid mutation issues
      const clonedState = JSON.parse(JSON.stringify(state)) as GameState;

      // Check storage space before saving
      const estimatedSize = this.estimateStorageSize(clonedState);
      const spaceCheck = await this.checkStorageSpace(estimatedSize);

      if (!spaceCheck.canSave) {
        console.error('[EventDB] Insufficient storage space:', spaceCheck.warning);
        throw new Error(spaceCheck.warning || 'Storage quota exceeded');
      }

      if (spaceCheck.warning) {
        console.warn('[EventDB] Storage warning:', spaceCheck.warning);
      }

      const stored: StoredSimulation = {
        id: saveId,
        simulationId,
        gameState: clonedState,
        lastUpdated: now,
        currentMonth: state.currentMonth,
        version: SIMULATION_STATE_VERSION
      };

      // Save simulation state
      const transaction = this.db.transaction([SIMULATIONS_STORE, METADATA_STORE], 'readwrite');
      const simulationsStore = transaction.objectStore(SIMULATIONS_STORE);
      const metadataStore = transaction.objectStore(METADATA_STORE);

      simulationsStore.put(stored);

      // Update metadata for listing
      // Extract seed and scenario from simulationId (format: "{seed}_{scenario}")
      const [seedStr, ...scenarioParts] = simulationId.split('_');
      const seed = parseInt(seedStr, 10) || 0;
      const scenario = scenarioParts.join('_') || 'historical';

      const eventCount = await this.getEventCount(simulationId);
      const metadata: SimulationMetadata = {
        id: simulationId,
        seed,
        scenario: scenario as ScenarioMode,
        // Use last updated time minus elapsed time as start date estimate
        // For first save, this equals current timestamp (month 0)
        // For subsequent saves, this approximates the original start time
        startDate: new Date(now - (state.currentMonth * 30 * 24 * 60 * 60 * 1000)).toISOString(),
        currentMonth: state.currentMonth,
        lastUpdated: now,
        eventCount,
        isRunning: state.speed !== 'paused',
        version: SIMULATION_STATE_VERSION,
        population: state.humanPopulationSystem.population, // Will throw if undefined - fail loudly
        qualityOfLife: state.globalMetrics.qualityOfLife, // Will throw if undefined - fail loudly
        aiCapability: state.aiAgents.length > 0
          ? state.aiAgents.reduce((sum, ai) => {
              if (ai.capability === undefined) {
                throw new Error(`[EventDB] AI agent ${ai.id} missing capability field during saveSimulation`);
              }
              return sum + ai.capability;
            }, 0) / state.aiAgents.length
          : 0
      };

      metadataStore.put(metadata);

      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => {
          console.log(`[EventDB] Saved simulation ${saveId}`);
          resolve();
        };
        transaction.onerror = () => reject(transaction.error);
      });

      // Apply save rotation to prevent unbounded growth
      if (applyRotation) {
        await this.rotateSaves(simulationId);
      }
    } catch (error) {
      console.error('[EventDB] Failed to save simulation:', error);
      throw error;
    }
  }

  /**
   * Load simulation state from IndexedDB with version compatibility checking and migration
   *
   * @param simulationId - Base simulation ID (e.g., "42000_historical")
   * @returns Most recent save for this simulation, or null if not found
   * @throws Error if version is incompatible and cannot be migrated
   */
  async loadSimulation(simulationId: string): Promise<StoredSimulation | null> {
    await this.init();
    if (!this.db) {
      console.warn('[EventDB] Database not available');
      return null;
    }

    try {
      const transaction = this.db.transaction([SIMULATIONS_STORE], 'readonly');
      const store = transaction.objectStore(SIMULATIONS_STORE);
      const index = store.index('simulationId');

      // Get all saves for this simulation, sorted by lastUpdated descending
      const saves = await new Promise<StoredSimulation[]>((resolve, reject) => {
        const results: StoredSimulation[] = [];
        const request = index.openCursor(IDBKeyRange.only(simulationId), 'prev');

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) {
            results.push(cursor.value as StoredSimulation);
            cursor.continue();
          } else {
            resolve(results);
          }
        };

        request.onerror = () => reject(request.error);
      });

      if (saves.length === 0) {
        return null;
      }

      // Get most recent save
      let stored = saves[0];

      // Validate critical fields (detect corrupted state)
      if (!stored.gameState || typeof stored.gameState !== 'object') {
        console.error('[EventDB] Corrupted simulation: missing or invalid gameState');
        throw new Error('Simulation data is corrupted (invalid gameState)');
      }

      if (stored.gameState.currentMonth === undefined || stored.gameState.currentMonth === null) {
        console.error('[EventDB] Corrupted simulation: missing currentMonth');
        throw new Error('Simulation data is corrupted (missing currentMonth)');
      }

      if (!stored.gameState.globalMetrics) {
        console.error('[EventDB] Corrupted simulation: missing globalMetrics');
        throw new Error('Simulation data is corrupted (missing globalMetrics)');
      }

      // Check version compatibility
      const compatibility = isVersionCompatible(stored.version, SIMULATION_STATE_VERSION);

      if (!compatibility.canResume) {
        console.error('[EventDB] Incompatible version:', compatibility.reason);
        throw new Error(compatibility.reason || 'Incompatible simulation version');
      }

      // Apply migration if needed
      if (compatibility.requiresMigration) {
        console.log('[EventDB] Migrating simulation from', stored.version, 'to', SIMULATION_STATE_VERSION);
        stored = await migrateSimulationState(stored, SIMULATION_STATE_VERSION);

        // Save migrated state back to database
        const writeTransaction = this.db.transaction([SIMULATIONS_STORE], 'readwrite');
        const writeStore = writeTransaction.objectStore(SIMULATIONS_STORE);
        writeStore.put(stored);

        await new Promise<void>((resolve, reject) => {
          writeTransaction.oncomplete = () => resolve();
          writeTransaction.onerror = () => reject(writeTransaction.error);
        });

        console.log('[EventDB] Migration complete, saved updated state');
      }

      return stored;
    } catch (error) {
      console.error('[EventDB] Failed to load simulation:', error);
      if (error instanceof Error && error.message.includes('version')) {
        throw error; // Re-throw version errors for UI to handle
      }
      return null;
    }
  }

  /**
   * List all simulations with metadata
   *
   * @returns Array of simulation metadata, sorted by lastUpdated descending
   */
  async listSimulations(): Promise<SimulationMetadata[]> {
    await this.init();
    if (!this.db) {
      console.warn('[EventDB] Database not available');
      return [];
    }

    try {
      const transaction = this.db.transaction([METADATA_STORE], 'readonly');
      const store = transaction.objectStore(METADATA_STORE);
      const index = store.index('lastUpdated');

      return new Promise((resolve, reject) => {
        const results: SimulationMetadata[] = [];
        const request = index.openCursor(null, 'prev'); // Descending order (newest first)

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) {
            results.push(cursor.value as SimulationMetadata);
            cursor.continue();
          } else {
            resolve(results);
          }
        };

        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('[EventDB] Failed to list simulations:', error);
      return [];
    }
  }

  /**
   * Delete a simulation and all its saves
   *
   * @param simulationId - Base simulation ID (e.g., "42000_historical")
   */
  async deleteSimulation(simulationId: string): Promise<void> {
    await this.init();
    if (!this.db) return;

    try {
      const transaction = this.db.transaction([SIMULATIONS_STORE, METADATA_STORE, STORE_NAME], 'readwrite');
      const simulationsStore = transaction.objectStore(SIMULATIONS_STORE);
      const metadataStore = transaction.objectStore(METADATA_STORE);
      const eventsStore = transaction.objectStore(STORE_NAME);

      // Delete all simulation saves
      const simulationsIndex = simulationsStore.index('simulationId');
      const simulationsCursor = simulationsIndex.openCursor(IDBKeyRange.only(simulationId));

      simulationsCursor.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      // Delete metadata
      metadataStore.delete(simulationId);

      // Delete all events
      const eventsIndex = eventsStore.index('simulationId');
      const eventsCursor = eventsIndex.openCursor(IDBKeyRange.only(simulationId));

      eventsCursor.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => {
          console.log(`[EventDB] Deleted simulation ${simulationId}`);
          resolve();
        };
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (error) {
      console.error('[EventDB] Failed to delete simulation:', error);
      throw error;
    }
  }

  /**
   * Rotate saves to prevent unbounded storage growth
   *
   * Smart rotation: Keep recent saves dense, older saves sparse
   * - Last 5 saves: Keep all (dense recent history)
   * - 6-20 saves back: Keep every other
   * - 21+ saves back: Keep every 5th
   *
   * @param simulationId - Base simulation ID
   * @param maxSaves - Maximum number of saves to keep (default: 10)
   */
  async rotateSaves(simulationId: string, maxSaves: number = 10): Promise<void> {
    await this.init();
    if (!this.db) return;

    try {
      const transaction = this.db.transaction([SIMULATIONS_STORE], 'readwrite');
      const store = transaction.objectStore(SIMULATIONS_STORE);
      const index = store.index('simulationId');

      // Get all saves for this simulation, sorted by lastUpdated descending
      const saves = await new Promise<StoredSimulation[]>((resolve, reject) => {
        const results: StoredSimulation[] = [];
        const request = index.openCursor(IDBKeyRange.only(simulationId), 'prev');

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) {
            results.push(cursor.value as StoredSimulation);
            cursor.continue();
          } else {
            resolve(results);
          }
        };

        request.onerror = () => reject(request.error);
      });

      if (saves.length <= maxSaves) {
        return; // No rotation needed
      }

      // Smart rotation logic
      const toKeep = new Set<string>();

      // Always keep most recent save
      if (saves.length > 0) {
        toKeep.add(saves[0].id);
      }

      // Keep last 5 saves (dense recent history)
      for (let i = 0; i < Math.min(5, saves.length); i++) {
        toKeep.add(saves[i].id);
      }

      // Keep every other from 6-20
      for (let i = 5; i < Math.min(20, saves.length); i += 2) {
        if (toKeep.size < maxSaves) {
          toKeep.add(saves[i].id);
        }
      }

      // Keep every 5th from 21+
      for (let i = 20; i < saves.length; i += 5) {
        if (toKeep.size < maxSaves) {
          toKeep.add(saves[i].id);
        }
      }

      // Delete saves not in toKeep set
      const deleteTransaction = this.db.transaction([SIMULATIONS_STORE], 'readwrite');
      const deleteStore = deleteTransaction.objectStore(SIMULATIONS_STORE);

      const toDelete = saves.filter(s => !toKeep.has(s.id));
      for (const save of toDelete) {
        deleteStore.delete(save.id);
      }

      await new Promise<void>((resolve, reject) => {
        deleteTransaction.oncomplete = () => {
          console.log(`[EventDB] Rotated ${toDelete.length} old saves for ${simulationId}`);
          resolve();
        };
        deleteTransaction.onerror = () => reject(deleteTransaction.error);
      });
    } catch (error) {
      console.error('[EventDB] Failed to rotate saves:', error);
      // Don't throw - rotation failure shouldn't block saves
    }
  }

  /**
   * Clear all simulation states and metadata
   * (Events are preserved)
   */
  async clearAllSimulations(): Promise<void> {
    await this.init();
    if (!this.db) return;

    const transaction = this.db.transaction([SIMULATIONS_STORE, METADATA_STORE], 'readwrite');
    const simulationsStore = transaction.objectStore(SIMULATIONS_STORE);
    const metadataStore = transaction.objectStore(METADATA_STORE);

    return new Promise((resolve, reject) => {
      let completed = 0;
      const checkComplete = () => {
        completed++;
        if (completed === 2) resolve();
      };

      simulationsStore.clear().onsuccess = checkComplete;
      metadataStore.clear().onsuccess = checkComplete;

      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Estimate storage size of a GameState object
   * @param state - GameState to measure
   * @returns Estimated size in bytes
   */
  estimateStorageSize(state: any): number {
    return JSON.stringify(state).length;
  }

  /**
   * Get storage quota information
   * @returns Object with usage, quota, and percentage used
   */
  async getStorageQuota(): Promise<{
    usage: number;
    quota: number;
    percentUsed: number;
    available: number;
  } | null> {
    if (typeof navigator === 'undefined' || !navigator.storage || !navigator.storage.estimate) {
      console.warn('[EventDB] Storage quota API not available');
      return null;
    }

    try {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percentUsed = quota > 0 ? (usage / quota) * 100 : 0;
      const available = quota - usage;

      return {
        usage,
        quota,
        percentUsed,
        available
      };
    } catch (error) {
      console.error('[EventDB] Failed to estimate storage quota:', error);
      return null;
    }
  }

  /**
   * Check if there's enough space to save a state of given size
   * @param estimatedSize - Estimated size of state in bytes
   * @param warningThreshold - Percentage at which to warn (default: 80%)
   * @returns Object with canSave flag and optional warning message
   */
  async checkStorageSpace(estimatedSize: number, warningThreshold: number = 80): Promise<{
    canSave: boolean;
    warning?: string;
    percentUsed?: number;
  }> {
    const quota = await this.getStorageQuota();

    if (!quota) {
      // Can't check quota, assume it's OK
      return { canSave: true };
    }

    const wouldUse = quota.usage + estimatedSize;
    const wouldUsePercent = (wouldUse / quota.quota) * 100;

    if (wouldUse > quota.quota) {
      return {
        canSave: false,
        warning: `Storage quota exceeded. Need ${(estimatedSize / 1024 / 1024).toFixed(2)} MB, only ${(quota.available / 1024 / 1024).toFixed(2)} MB available.`,
        percentUsed: wouldUsePercent
      };
    }

    if (wouldUsePercent >= warningThreshold) {
      return {
        canSave: true,
        warning: `Storage ${wouldUsePercent.toFixed(1)}% full. Consider deleting old simulations.`,
        percentUsed: wouldUsePercent
      };
    }

    return { canSave: true, percentUsed: wouldUsePercent };
  }

  // ========================================================================
  // LLM Inference Logging Methods
  // ========================================================================

  /**
   * Add LLM inference log to database
   *
   * @param log - LLM inference log entry
   */
  async addLLMLog(log: LLMInferenceLog): Promise<void> {
    await this.init();
    if (!this.db) {
      console.warn('[EventDB] Database not available, skipping LLM log');
      return;
    }

    const transaction = this.db.transaction([LLM_LOGS_STORE], 'readwrite');
    const store = transaction.objectStore(LLM_LOGS_STORE);

    return new Promise((resolve, reject) => {
      const request = store.put(log); // Use put to allow updates
      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error('[EventDB] Failed to add LLM log:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get LLM inference logs for a simulation run, paginated
   *
   * @param simulationId - Simulation run ID
   * @param limit - Number of logs to fetch (default: 50)
   * @param offset - Number of logs to skip (default: 0)
   * @returns Logs in chronological order (oldest first)
   */
  async getLLMLogs(
    simulationId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<LLMInferenceLog[]> {
    await this.init();
    if (!this.db) {
      console.warn('[EventDB] Database not available');
      return [];
    }

    const transaction = this.db.transaction([LLM_LOGS_STORE], 'readonly');
    const store = transaction.objectStore(LLM_LOGS_STORE);
    const index = store.index('simulationId');

    const logs: LLMInferenceLog[] = [];

    return new Promise((resolve, reject) => {
      const request = index.openCursor(IDBKeyRange.only(simulationId));
      let skipped = 0;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;

        if (cursor) {
          if (skipped < offset) {
            skipped++;
            cursor.continue();
          } else if (logs.length < limit) {
            logs.push(cursor.value as LLMInferenceLog);
            cursor.continue();
          } else {
            resolve(logs);
          }
        } else {
          resolve(logs);
        }
      };

      request.onerror = () => {
        console.error('[EventDB] Error fetching LLM logs:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get count of LLM logs for a simulation
   *
   * @param simulationId - Simulation run ID
   * @returns Count of logs
   */
  async getLLMLogCount(simulationId: string): Promise<number> {
    await this.init();
    if (!this.db) return 0;

    const transaction = this.db.transaction([LLM_LOGS_STORE], 'readonly');
    const store = transaction.objectStore(LLM_LOGS_STORE);
    const index = store.index('simulationId');

    return new Promise((resolve, reject) => {
      const request = index.count(IDBKeyRange.only(simulationId));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get unexported LLM logs (not yet sent to GCS)
   *
   * @param limit - Maximum number of logs to fetch (default: 1000)
   * @returns Logs that haven't been exported to GCS
   */
  async getUnexportedLLMLogs(limit: number = 1000): Promise<LLMInferenceLog[]> {
    await this.init();
    if (!this.db) {
      console.warn('[EventDB] Database not available');
      return [];
    }

    const transaction = this.db.transaction([LLM_LOGS_STORE], 'readonly');
    const store = transaction.objectStore(LLM_LOGS_STORE);
    const index = store.index('exportedToGCS');

    const logs: LLMInferenceLog[] = [];

    return new Promise((resolve, reject) => {
      const request = index.openCursor(IDBKeyRange.only(false)); // Query exportedToGCS === false

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;

        if (cursor && logs.length < limit) {
          logs.push(cursor.value as LLMInferenceLog);
          cursor.continue();
        } else {
          resolve(logs);
        }
      };

      request.onerror = () => {
        console.error('[EventDB] Error fetching unexported LLM logs:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Mark LLM logs as exported to GCS
   *
   * @param logIds - Array of log IDs to mark as exported
   * @param gcsPath - GCS blob path where logs were exported
   */
  async markLLMLogsAsExported(logIds: string[], gcsPath: string): Promise<void> {
    await this.init();
    if (!this.db) return;

    const transaction = this.db.transaction([LLM_LOGS_STORE], 'readwrite');
    const store = transaction.objectStore(LLM_LOGS_STORE);
    const exportTimestamp = Date.now();

    return new Promise((resolve, reject) => {
      let processed = 0;

      for (const id of logIds) {
        const getRequest = store.get(id);

        getRequest.onsuccess = () => {
          const log = getRequest.result as LLMInferenceLog;
          if (log) {
            log.exportedToGCS = true;
            log.exportTimestamp = exportTimestamp;
            log.gcsPath = gcsPath;
            store.put(log);
          }

          processed++;
          if (processed === logIds.length) {
            resolve();
          }
        };

        getRequest.onerror = () => {
          console.error(`[EventDB] Failed to mark log ${id} as exported:`, getRequest.error);
          processed++;
          if (processed === logIds.length) {
            resolve(); // Don't fail entire batch if one log fails
          }
        };
      }

      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Clear all LLM logs for a simulation
   *
   * @param simulationId - Simulation run ID
   */
  async clearLLMLogs(simulationId: string): Promise<void> {
    await this.init();
    if (!this.db) return;

    const transaction = this.db.transaction([LLM_LOGS_STORE], 'readwrite');
    const store = transaction.objectStore(LLM_LOGS_STORE);
    const index = store.index('simulationId');

    return new Promise((resolve, reject) => {
      const request = index.openCursor(IDBKeyRange.only(simulationId));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }
}

// Singleton instance
export const eventDatabase = new EventDatabase();

// Export types and utility functions
export type { StoredEvent, StoredSimulation, SimulationMetadata, LLMInferenceLog };
export { SIMULATION_STATE_VERSION, isVersionCompatible, parseVersion };
