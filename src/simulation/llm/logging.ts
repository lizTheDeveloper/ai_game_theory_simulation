/**
 * LLM Inference Logging Module
 *
 * Captures all LLM API calls for audit trail and analytics.
 * Logs are stored in IndexedDB and can be exported to Google Cloud Storage.
 *
 * Features:
 * - Full request/response capture
 * - Agent context (capability, alignment, trigger reason)
 * - Timing metrics
 * - Error logging
 * - GCS export tracking
 */

import type { GameState, AIAgent } from '@/types/game';
import type { LLMConfig } from '@/types/llm';

/**
 * LLM Inference Log structure (simulation-layer definition)
 *
 * This interface defines the shape of an LLM log entry without depending on storage implementation.
 */
export interface LLMInferenceLog {
  // Identity
  id: string;
  simulationId: string;

  // Timing
  timestamp: number;
  month: number;
  durationMs: number;

  // Agent Context
  agentId: string;
  agentName: string;
  agentCapability: number;
  agentAlignment: number;
  triggerReason: string;

  // Request Data
  requestPrompt: string;
  requestBody: object;
  provider: string;
  modelName: string;

  // Response Data
  responseBody: object;
  tokensUsed: number;
  weights: object;
  reasoning: string;

  // Error Handling
  error?: string;
  usedFallback: boolean;

  // GCS Export Tracking
  exportedToGCS: boolean;
  exportTimestamp?: number;
  gcsPath?: string;
}

/**
 * Storage interface for LLM logs (dependency injection)
 *
 * This allows simulation code to be storage-agnostic.
 * UI layer provides the IndexedDB implementation.
 */
export interface LLMLogStorage {
  addLLMLog(log: LLMInferenceLog): Promise<void>;
  getLLMLogs(simulationId: string, limit: number): Promise<LLMInferenceLog[]>;
}

/**
 * Global storage instance (injected from UI layer)
 * Default to no-op storage to prevent crashes in non-browser environments.
 */
let logStorage: LLMLogStorage = {
  async addLLMLog() { /* no-op */ },
  async getLLMLogs() { return []; }
};

/**
 * Set the storage implementation (called from UI layer)
 *
 * @param storage - Storage implementation (e.g., IndexedDB wrapper)
 */
export function setLLMLogStorage(storage: LLMLogStorage): void {
  logStorage = storage;
}

/**
 * Context for logging an LLM inference request
 */
export interface LoggingContext {
  // Simulation Context
  simulationId: string;
  month: number;

  // Agent Context
  agentId: string;
  agentName: string;
  agentCapability: number;
  agentAlignment: number;
  triggerReason: 'scheduled' | 'threshold' | 'crisis' | 'initial' | 'initial_fallback' | string;

  // LLM Config
  provider: string;
  modelName: string;
}

/**
 * Request data to log
 */
export interface LLMRequest {
  prompt: string;          // Full context string
  body: object;            // Full request JSON
}

/**
 * Response data to log
 */
export interface LLMResponse {
  body: object;            // Full response JSON
  tokensUsed: number;      // Token count
  weights: object;         // Parsed weights
  reasoning: string;       // LLM's reasoning
}

/**
 * Timing data
 */
export interface LLMTiming {
  startTime: number;       // Unix timestamp (ms)
  endTime: number;         // Unix timestamp (ms)
}

/**
 * Log an LLM inference request and response
 *
 * This is the main entry point for logging. Call this after every LLM API call.
 *
 * @param context - Simulation and agent context
 * @param request - Request data (prompt, body)
 * @param response - Response data (body, tokens, weights, reasoning)
 * @param timing - Start and end timestamps
 * @param error - Error message if call failed (optional)
 * @param usedFallback - True if fallback weights were used due to error
 */
export async function logLLMInference(
  context: LoggingContext,
  request: LLMRequest,
  response: LLMResponse,
  timing: LLMTiming,
  error?: string,
  usedFallback: boolean = false
): Promise<void> {
  try {
    // Generate unique log ID
    const timestamp = timing.startTime;
    const logId = `${context.simulationId}_${context.month}_${context.agentId}_${timestamp}`;

    // Calculate duration
    const durationMs = timing.endTime - timing.startTime;

    // Create log entry
    const log: LLMInferenceLog = {
      // Identity
      id: logId,
      simulationId: context.simulationId,

      // Timing
      timestamp,
      month: context.month,
      durationMs,

      // Agent Context
      agentId: context.agentId,
      agentName: context.agentName,
      agentCapability: context.agentCapability,
      agentAlignment: context.agentAlignment,
      triggerReason: context.triggerReason,

      // Request Data
      requestPrompt: request.prompt,
      requestBody: request.body,
      provider: context.provider,
      modelName: context.modelName,

      // Response Data
      responseBody: response.body,
      tokensUsed: response.tokensUsed,
      weights: response.weights,
      reasoning: response.reasoning,

      // Error Handling
      error,
      usedFallback,

      // GCS Export Tracking
      exportedToGCS: false
    };

    // Store via injected storage (async, non-blocking)
    await logStorage.addLLMLog(log);

    // Log success (if verbose - disabled to avoid spamming console)
    // console.log(`[LLM Logging] Logged inference: ${logId} (${durationMs}ms, ${response.tokensUsed} tokens)`);
  } catch (loggingError) {
    // Log logging errors but don't fail the simulation
    console.error('[LLM Logging] Failed to log inference:', loggingError);
    console.error('[LLM Logging] Context:', context);
  }
}

/**
 * Extract logging context from GameState and agent
 *
 * Helper function to build logging context from simulation state.
 *
 * @param state - Current GameState
 * @param agent - AI agent making the request
 * @param triggerReason - Why the update was triggered
 * @param simulationId - Simulation run identifier (format: "${seed}_${scenario}")
 * @returns Logging context ready to use
 */
export function buildLoggingContext(
  state: GameState,
  agent: AIAgent,
  triggerReason: string,
  simulationId: string = 'unknown_simulation'
): LoggingContext {
  // Validate required fields (fail loudly if missing)
  if (!state.llmConfig) {
    throw new Error('❌ state.llmConfig is required for LLM logging');
  }
  if (typeof agent.capability !== 'number') {
    throw new Error(`❌ agent.capability is not a number for agent ${agent.id}`);
  }
  if (typeof agent.trueAlignment !== 'number') {
    throw new Error(`❌ agent.trueAlignment is not a number for agent ${agent.id}`);
  }

  return {
    simulationId,
    month: state.currentMonth,
    agentId: agent.id,
    agentName: agent.name,
    agentCapability: agent.capability,
    agentAlignment: agent.trueAlignment,
    triggerReason,
    provider: state.llmConfig.provider,
    modelName: state.llmConfig.modelName
  };
}

/**
 * Get LLM inference stats for a simulation
 *
 * @param simulationId - Simulation run ID
 * @returns Statistics about logged inferences
 */
export async function getLLMInferenceStats(simulationId: string): Promise<{
  totalLogs: number;
  unexportedLogs: number;
  totalTokens: number;
  averageDuration: number;
  errorCount: number;
}> {
  try {
    const logs = await logStorage.getLLMLogs(simulationId, 10000); // Fetch all

    if (logs.length === 0) {
      return {
        totalLogs: 0,
        unexportedLogs: 0,
        totalTokens: 0,
        averageDuration: 0,
        errorCount: 0
      };
    }

    const unexportedLogs = logs.filter(log => !log.exportedToGCS).length;
    const totalTokens = logs.reduce((sum, log) => sum + log.tokensUsed, 0);
    const totalDuration = logs.reduce((sum, log) => sum + log.durationMs, 0);
    const errorCount = logs.filter(log => log.error !== undefined).length;

    return {
      totalLogs: logs.length,
      unexportedLogs,
      totalTokens,
      averageDuration: totalDuration / logs.length,
      errorCount
    };
  } catch (error) {
    console.error('[LLM Logging] Failed to get stats:', error);
    return {
      totalLogs: 0,
      unexportedLogs: 0,
      totalTokens: 0,
      averageDuration: 0,
      errorCount: 0
    };
  }
}
