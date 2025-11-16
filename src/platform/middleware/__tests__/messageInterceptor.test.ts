/**
 * Tests for MessageInterceptor
 *
 * Coverage target: >90%
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  MessageInterceptor,
  createInterceptor,
  createMessage,
  type AgentMessage,
} from '../messageInterceptor';

describe('MessageInterceptor', () => {
  let interceptor: MessageInterceptor;
  let capturedMessages: AgentMessage[] = [];

  beforeEach(() => {
    capturedMessages = [];

    interceptor = createInterceptor({
      onMessage: async (msg) => {
        capturedMessages.push(msg);
      },
      enableLogging: false,
    });
  });

  it('should intercept agent messages', async () => {
    const message = createMessage('agent_response', 'test-agent', 'Hello world');

    const result = await interceptor.intercept(message);

    assert.strictEqual(result, true);

    // Wait for async callback
    await new Promise((resolve) => setTimeout(resolve, 100));

    assert.strictEqual(capturedMessages.length, 1);
    assert.strictEqual(capturedMessages[0].content, 'Hello world');
  });

  it('should filter by message type', async () => {
    const interceptor2 = createInterceptor({
      onMessage: async (msg) => {
        capturedMessages.push(msg);
      },
      messageTypes: ['task_completion'],
      enableLogging: false,
    });

    const msg1 = createMessage('agent_response', 'test-agent', 'Response');
    const msg2 = createMessage('task_completion', 'test-agent', 'Task done');

    await interceptor2.intercept(msg1);
    await interceptor2.intercept(msg2);

    await new Promise((resolve) => setTimeout(resolve, 100));

    assert.strictEqual(capturedMessages.length, 1);
    assert.strictEqual(capturedMessages[0].type, 'task_completion');
  });

  it('should filter by agent ID', async () => {
    const interceptor3 = createInterceptor({
      onMessage: async (msg) => {
        capturedMessages.push(msg);
      },
      agentIds: ['agent-1'],
      enableLogging: false,
    });

    const msg1 = createMessage('agent_response', 'agent-1', 'From agent 1');
    const msg2 = createMessage('agent_response', 'agent-2', 'From agent 2');

    await interceptor3.intercept(msg1);
    await interceptor3.intercept(msg2);

    await new Promise((resolve) => setTimeout(resolve, 100));

    assert.strictEqual(capturedMessages.length, 1);
    assert.strictEqual(capturedMessages[0].agent_id, 'agent-1');
  });

  it('should enforce rate limiting', async () => {
    const interceptor4 = createInterceptor({
      onMessage: async (msg) => {
        capturedMessages.push(msg);
      },
      rateLimitPerSec: 2,
      enableLogging: false,
    });

    // Send 5 messages rapidly
    for (let i = 0; i < 5; i++) {
      await interceptor4.intercept(
        createMessage('agent_response', 'test-agent', `Message ${i}`)
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 100));

    // Should only process first 2 (rate limit = 2/sec)
    assert.ok(capturedMessages.length <= 2);
  });

  it('should track statistics', async () => {
    const msg1 = createMessage('agent_response', 'agent-1', 'Message 1');
    const msg2 = createMessage('task_completion', 'agent-2', 'Message 2');

    await interceptor.intercept(msg1);
    await interceptor.intercept(msg2);

    const stats = interceptor.getStats();

    assert.strictEqual(stats.totalIntercepted, 2);
    assert.strictEqual(stats.byAgent['agent-1'], 1);
    assert.strictEqual(stats.byAgent['agent-2'], 1);
  });

  it('should handle callback errors gracefully', async () => {
    const interceptor5 = createInterceptor({
      onMessage: async () => {
        throw new Error('Callback error');
      },
      enableLogging: false,
    });

    const message = createMessage('agent_response', 'test-agent', 'Test');

    // Should not throw
    const result = await interceptor5.intercept(message);
    assert.strictEqual(result, true);

    // Wait for callback to fail
    await new Promise((resolve) => setTimeout(resolve, 100));

    const stats = interceptor5.getStats();
    assert.strictEqual(stats.errors, 1);
  });

  it('should enable/disable interception', async () => {
    interceptor.disable();

    const message = createMessage('agent_response', 'test-agent', 'Test');
    const result = await interceptor.intercept(message);

    assert.strictEqual(result, false);
    assert.strictEqual(interceptor.isEnabled(), false);

    interceptor.enable();
    const result2 = await interceptor.intercept(message);
    assert.strictEqual(result2, true);
  });
});
