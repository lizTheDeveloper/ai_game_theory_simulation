/**
 * IndexedDB wrapper for persistent event storage
 *
 * Stores all simulation events across runs for infinite scroll timeline.
 * Events are indexed by simulation run and timestamp for efficient querying.
 */

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

const DB_NAME = 'simulation_events';
const DB_VERSION = 1;
const STORE_NAME = 'events';

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

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });

          // Create indexes for efficient querying
          store.createIndex('simulationId', 'simulationId', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('simId_timestamp', ['simulationId', 'timestamp'], { unique: false });

          console.log('[EventDB] Object store created with indexes');
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

    const range = IDBKeyRange.bound(keyRangeStart, keyRangeEnd, false, beforeTimestamp !== undefined);

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
}

// Singleton instance
export const eventDatabase = new EventDatabase();
