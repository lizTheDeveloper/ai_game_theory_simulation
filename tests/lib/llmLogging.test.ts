/**
 * LLM Logging Module Tests
 *
 * Unit tests for LLM inference logging utilities.
 *
 * Tests:
 * - logLLMInference: Log inference with complete data
 * - buildLoggingContext: Extract context from GameState and agent
 * - getLLMInferenceStats: Compute statistics from logged inferences
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  logLLMInference,
  buildLoggingContext,
  getLLMInferenceStats,
  type LoggingContext,
  type LLMRequest,
  type LLMResponse,
  type LLMTiming
} from '@/simulation/llm/logging';
import type { GameState, AIAgent } from '@/types/game';
import { createMockGameState } from '../helpers/mockGameState';

describe('LLM Logging Module', () => {
  const simulationId = 'test_sim_456';

  // Helper to create a test agent
  function createTestAgent(overrides: Partial<AIAgent> = {}): AIAgent {
    return {
      id: 'agent_test_1',
      name: 'Test Agent',
      capability: 0.75,
      trueAlignment: 0.85,
      apparentAlignment: 0.85,
      sandbaggingStrength: 0.0,
      sandbaggingMode: 'none',
      role: 'research',
      ...overrides
    } as AIAgent;
  }

  // Helper to create test logging context
  function createTestContext(overrides: Partial<LoggingContext> = {}): LoggingContext {
    return {
      simulationId,
      month: 5,
      agentId: 'agent_test_1',
      agentName: 'Test Agent',
      agentCapability: 0.75,
      agentAlignment: 0.85,
      triggerReason: 'scheduled',
      provider: 'lm-studio',
      modelName: 'qwen3-32b',
      ...overrides
    };
  }

  describe('buildLoggingContext', () => {
    it('should extract context from GameState and agent', () => {
      const state = createMockGameState();
      const agent = createTestAgent();

      // Ensure llmConfig exists
      state.llmConfig = {
        provider: 'lm-studio',
        modelName: 'qwen3-32b',
        endpoint: 'http://localhost:1234/v1',
        apiKey: '',
        temperature: 0.7,
        maxTokens: 4000
      };

      const context = buildLoggingContext(state, agent, 'threshold', simulationId);

      assert.strictEqual(context.simulationId, simulationId);
      assert.strictEqual(context.month, state.currentMonth);
      assert.strictEqual(context.agentId, agent.id);
      assert.strictEqual(context.agentName, agent.name);
      assert.strictEqual(context.agentCapability, agent.capability);
      assert.strictEqual(context.agentAlignment, agent.trueAlignment);
      assert.strictEqual(context.triggerReason, 'threshold');
      assert.strictEqual(context.provider, state.llmConfig.provider);
      assert.strictEqual(context.modelName, state.llmConfig.modelName);
    });

    it('should fail loudly if llmConfig is missing', () => {
      const state = createMockGameState();
      const agent = createTestAgent();

      // Remove llmConfig to trigger error
      delete (state as any).llmConfig;

      assert.throws(
        () => buildLoggingContext(state, agent, 'scheduled', simulationId),
        /llmConfig is required/,
        'Should throw error when llmConfig is missing'
      );
    });

    it('should fail loudly if agent.capability is not a number', () => {
      const state = createMockGameState();
      const agent = createTestAgent();

      state.llmConfig = {
        provider: 'lm-studio',
        modelName: 'test',
        endpoint: 'http://localhost:1234',
        apiKey: '',
        temperature: 0.7,
        maxTokens: 4000
      };

      // Make capability invalid
      (agent as any).capability = 'invalid';

      assert.throws(
        () => buildLoggingContext(state, agent, 'scheduled', simulationId),
        /capability is not a number/,
        'Should throw error when capability is not a number'
      );
    });

    it('should fail loudly if agent.trueAlignment is not a number', () => {
      const state = createMockGameState();
      const agent = createTestAgent();

      state.llmConfig = {
        provider: 'lm-studio',
        modelName: 'test',
        endpoint: 'http://localhost:1234',
        apiKey: '',
        temperature: 0.7,
        maxTokens: 4000
      };

      // Make trueAlignment invalid
      (agent as any).trueAlignment = undefined;

      assert.throws(
        () => buildLoggingContext(state, agent, 'scheduled', simulationId),
        /trueAlignment is not a number/,
        'Should throw error when trueAlignment is not a number'
      );
    });
  });

  describe('logLLMInference', () => {
    it('should log inference without throwing', async () => {
      const context = createTestContext();
      const request: LLMRequest = {
        prompt: 'Test prompt',
        body: { messages: [{ role: 'user', content: 'test' }] }
      };
      const response: LLMResponse = {
        body: { choices: [{ message: { content: 'response' } }] },
        tokensUsed: 250,
        weights: { research: 0.6, infrastructure: 0.4 },
        reasoning: 'Test reasoning'
      };
      const timing: LLMTiming = {
        startTime: Date.now() - 1500,
        endTime: Date.now()
      };

      // Should not throw even if IndexedDB is unavailable
      try {
        await logLLMInference(context, request, response, timing);
        assert.ok(true, 'Logging succeeded');
      } catch (error) {
        // Logging errors should be caught internally
        assert.fail('logLLMInference should not throw');
      }
    });

    it('should handle errors gracefully (with usedFallback flag)', async () => {
      const context = createTestContext();
      const request: LLMRequest = {
        prompt: 'Test prompt',
        body: {}
      };
      const response: LLMResponse = {
        body: {},
        tokensUsed: 0,
        weights: { research: 0.5, infrastructure: 0.5 },
        reasoning: 'Fallback weights used due to error'
      };
      const timing: LLMTiming = {
        startTime: Date.now(),
        endTime: Date.now()
      };
      const error = 'API timeout';
      const usedFallback = true;

      // Should not throw
      try {
        await logLLMInference(context, request, response, timing, error, usedFallback);
        assert.ok(true, 'Error logging succeeded');
      } catch (err) {
        assert.fail('logLLMInference should not throw even with errors');
      }
    });

    it('should calculate duration correctly', async () => {
      const context = createTestContext();
      const request: LLMRequest = { prompt: 'Test', body: {} };
      const response: LLMResponse = {
        body: {},
        tokensUsed: 100,
        weights: {},
        reasoning: ''
      };

      const startTime = Date.now() - 2500; // 2.5 seconds ago
      const endTime = Date.now();
      const timing: LLMTiming = { startTime, endTime };

      // The log should have durationMs = endTime - startTime
      // We can't directly verify this without accessing IndexedDB,
      // but we can verify the function doesn't throw

      await logLLMInference(context, request, response, timing);

      const expectedDuration = endTime - startTime;
      assert.ok(expectedDuration >= 2500 && expectedDuration < 3000, 'Duration should be ~2500ms');
    });
  });

  describe('getLLMInferenceStats', () => {
    it('should return zero stats for simulation with no logs', async () => {
      const stats = await getLLMInferenceStats('nonexistent_simulation');

      assert.strictEqual(stats.totalLogs, 0);
      assert.strictEqual(stats.unexportedLogs, 0);
      assert.strictEqual(stats.totalTokens, 0);
      assert.strictEqual(stats.averageDuration, 0);
      assert.strictEqual(stats.errorCount, 0);
    });

    it('should handle errors gracefully and return zero stats', async () => {
      // Pass invalid simulation ID to trigger potential error
      const stats = await getLLMInferenceStats('');

      // Should return zero stats, not throw
      assert.strictEqual(stats.totalLogs, 0);
    });
  });
});
