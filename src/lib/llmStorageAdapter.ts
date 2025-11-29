/**
 * Adapter that implements LLMLogStorage interface for eventDatabase
 *
 * This bridges the simulation layer (storage-agnostic) with the UI layer (IndexedDB).
 */

import { eventDatabase } from '@/lib/eventDatabase';
import type { LLMLogStorage, LLMInferenceLog } from '@/simulation/llm/logging';

/**
 * IndexedDB implementation of LLMLogStorage
 */
export const indexedDBLLMStorage: LLMLogStorage = {
  async addLLMLog(log: LLMInferenceLog): Promise<void> {
    return eventDatabase.addLLMLog(log);
  },

  async getLLMLogs(simulationId: string, limit: number): Promise<LLMInferenceLog[]> {
    return eventDatabase.getLLMLogs(simulationId, limit);
  }
};
