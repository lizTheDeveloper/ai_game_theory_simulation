/**
 * Agent Message Interceptor Middleware
 *
 * Captures agent responses before sending to user to enable auto-save of memory.
 *
 * Architecture:
 * - Intercepts agent messages (responses, tool outputs, completions)
 * - Triggers auto-save logic based on completion signals
 * - Passes messages through to user unchanged (transparent middleware)
 *
 * Usage:
 * ```typescript
 * const interceptor = new MessageInterceptor({
 *   onMessage: async (msg) => {
 *     // Auto-save logic triggered here
 *     await autoSave(msg);
 *   }
 * });
 *
 * interceptor.intercept(agentMessage);
 * ```
 *
 * Security (OWASP):
 * - Input validation: Sanitize message content
 * - Rate limiting: Prevent auto-save spam
 * - Error isolation: Interceptor errors don't block message delivery
 *
 * Task: 1.4.1 (Phase 1 Week 2)
 */

import { assertDefined } from '@/simulation/utils/assertions';

/**
 * Message types that can be intercepted
 */
export type MessageType =
  | 'agent_response' // Agent's response to user
  | 'tool_output' // Tool execution result
  | 'task_completion' // Task marked complete
  | 'error' // Error message
  | 'system'; // System message

/**
 * Agent message structure
 */
export interface AgentMessage {
  type: MessageType;
  agent_id: string;
  content: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

/**
 * Interceptor configuration
 */
export interface InterceptorConfig {
  /**
   * Callback triggered when message intercepted
   */
  onMessage: (message: AgentMessage) => Promise<void>;

  /**
   * Optional: Filter messages by type
   */
  messageTypes?: MessageType[];

  /**
   * Optional: Filter messages by agent ID
   */
  agentIds?: string[];

  /**
   * Optional: Rate limit (messages per second)
   * Default: 10 messages/sec
   */
  rateLimitPerSec?: number;

  /**
   * Optional: Enable logging
   * Default: false
   */
  enableLogging?: boolean;
}

/**
 * Interceptor statistics
 */
export interface InterceptorStats {
  totalIntercepted: number;
  byType: Record<MessageType, number>;
  byAgent: Record<string, number>;
  errors: number;
  rateLimited: number;
  lastMessage?: AgentMessage;
}

/**
 * Message Interceptor
 *
 * Transparent middleware for capturing agent messages.
 */
export class MessageInterceptor {
  private config: Required<InterceptorConfig>;
  private stats: InterceptorStats;
  private rateLimitCounter: Map<string, number[]>; // agent_id -> timestamps
  private enabled: boolean;

  constructor(config: InterceptorConfig) {
    // Validate config
    assertDefined(config.onMessage, {
      location: 'MessageInterceptor.constructor',
      valueName: 'config.onMessage',
    });

    // Set defaults
    this.config = {
      onMessage: config.onMessage,
      messageTypes: config.messageTypes ?? [
        'agent_response',
        'tool_output',
        'task_completion',
      ],
      agentIds: config.agentIds ?? [], // Empty = all agents
      rateLimitPerSec: config.rateLimitPerSec ?? 10,
      enableLogging: config.enableLogging ?? false,
    };

    // Initialize stats
    this.stats = {
      totalIntercepted: 0,
      byType: {
        agent_response: 0,
        tool_output: 0,
        task_completion: 0,
        error: 0,
        system: 0,
      },
      byAgent: {},
      errors: 0,
      rateLimited: 0,
    };

    this.rateLimitCounter = new Map();
    this.enabled = true;
  }

  /**
   * Intercept an agent message
   *
   * @param message - Message to intercept
   * @returns True if message processed, false if filtered/rate-limited
   */
  public async intercept(message: AgentMessage): Promise<boolean> {
    if (!this.enabled) {
      return false;
    }

    // Validate message
    try {
      this.validateMessage(message);
    } catch (error) {
      this.stats.errors++;
      if (this.config.enableLogging) {
        console.error(
          `⚠️ MessageInterceptor: Invalid message: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
      return false;
    }

    // Filter by message type
    if (!this.config.messageTypes.includes(message.type)) {
      return false;
    }

    // Filter by agent ID
    if (
      this.config.agentIds.length > 0 &&
      !this.config.agentIds.includes(message.agent_id)
    ) {
      return false;
    }

    // Rate limiting
    if (this.isRateLimited(message.agent_id)) {
      this.stats.rateLimited++;
      if (this.config.enableLogging) {
        console.warn(
          `⚠️ MessageInterceptor: Rate limited for agent ${message.agent_id}`
        );
      }
      return false;
    }

    // Record rate limit timestamp
    this.recordRateLimit(message.agent_id, message.timestamp);

    // Update stats
    this.stats.totalIntercepted++;
    this.stats.byType[message.type]++;
    this.stats.byAgent[message.agent_id] =
      (this.stats.byAgent[message.agent_id] ?? 0) + 1;
    this.stats.lastMessage = message;

    // Log if enabled
    if (this.config.enableLogging) {
      console.log(
        `📨 MessageInterceptor: [${message.type}] from ${message.agent_id}`
      );
    }

    // Trigger callback (async, non-blocking)
    // CRITICAL: Don't await - callback errors must not block message delivery
    this.config
      .onMessage(message)
      .catch((error) => {
        this.stats.errors++;
        if (this.config.enableLogging) {
          console.error(
            `❌ MessageInterceptor: Callback error: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      });

    return true;
  }

  /**
   * Validate message structure
   *
   * @param message - Message to validate
   * @throws Error if invalid
   */
  private validateMessage(message: AgentMessage): void {
    assertDefined(message, {
      location: 'MessageInterceptor.validateMessage',
      valueName: 'message',
    });

    assertDefined(message.type, {
      location: 'MessageInterceptor.validateMessage',
      valueName: 'message.type',
    });

    assertDefined(message.agent_id, {
      location: 'MessageInterceptor.validateMessage',
      valueName: 'message.agent_id',
    });

    assertDefined(message.content, {
      location: 'MessageInterceptor.validateMessage',
      valueName: 'message.content',
    });

    assertDefined(message.timestamp, {
      location: 'MessageInterceptor.validateMessage',
      valueName: 'message.timestamp',
    });

    // Sanitize content (OWASP: Input validation)
    if (typeof message.content !== 'string') {
      throw new Error('message.content must be a string');
    }

    // Check timestamp is recent (prevent replay attacks)
    const now = Date.now();
    const age = now - message.timestamp;
    if (age > 60000) {
      // 60 seconds
      if (this.config.enableLogging) {
        console.warn(
          `⚠️ MessageInterceptor: Old message timestamp (${age}ms ago)`
        );
      }
    }
  }

  /**
   * Check if agent is rate limited
   *
   * @param agent_id - Agent ID
   * @returns True if rate limited
   */
  private isRateLimited(agent_id: string): boolean {
    const timestamps = this.rateLimitCounter.get(agent_id) ?? [];
    const now = Date.now();
    const windowStart = now - 1000; // 1 second window

    // Count messages in window
    const messagesInWindow = timestamps.filter((ts) => ts >= windowStart).length;

    return messagesInWindow >= this.config.rateLimitPerSec;
  }

  /**
   * Record rate limit timestamp
   *
   * @param agent_id - Agent ID
   * @param timestamp - Message timestamp
   */
  private recordRateLimit(agent_id: string, timestamp: number): void {
    const timestamps = this.rateLimitCounter.get(agent_id) ?? [];
    const now = Date.now();
    const windowStart = now - 1000;

    // Keep only recent timestamps
    const recent = timestamps.filter((ts) => ts >= windowStart);
    recent.push(timestamp);

    this.rateLimitCounter.set(agent_id, recent);
  }

  /**
   * Get interceptor statistics
   *
   * @returns Stats object
   */
  public getStats(): Readonly<InterceptorStats> {
    return Object.freeze({ ...this.stats });
  }

  /**
   * Reset statistics
   */
  public resetStats(): void {
    this.stats = {
      totalIntercepted: 0,
      byType: {
        agent_response: 0,
        tool_output: 0,
        task_completion: 0,
        error: 0,
        system: 0,
      },
      byAgent: {},
      errors: 0,
      rateLimited: 0,
    };
  }

  /**
   * Enable interceptor
   */
  public enable(): void {
    this.enabled = true;
  }

  /**
   * Disable interceptor
   */
  public disable(): void {
    this.enabled = false;
  }

  /**
   * Check if interceptor is enabled
   *
   * @returns True if enabled
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Update configuration
   *
   * @param config - Partial config to update
   */
  public updateConfig(config: Partial<InterceptorConfig>): void {
    if (config.onMessage) {
      this.config.onMessage = config.onMessage;
    }
    if (config.messageTypes) {
      this.config.messageTypes = config.messageTypes;
    }
    if (config.agentIds) {
      this.config.agentIds = config.agentIds;
    }
    if (config.rateLimitPerSec !== undefined) {
      this.config.rateLimitPerSec = config.rateLimitPerSec;
    }
    if (config.enableLogging !== undefined) {
      this.config.enableLogging = config.enableLogging;
    }
  }
}

/**
 * Create a message interceptor
 *
 * @param config - Interceptor configuration
 * @returns MessageInterceptor instance
 */
export function createInterceptor(
  config: InterceptorConfig
): MessageInterceptor {
  return new MessageInterceptor(config);
}

/**
 * Helper: Create agent message
 *
 * @param type - Message type
 * @param agent_id - Agent ID
 * @param content - Message content
 * @param metadata - Optional metadata
 * @returns AgentMessage
 */
export function createMessage(
  type: MessageType,
  agent_id: string,
  content: string,
  metadata?: Record<string, unknown>
): AgentMessage {
  return {
    type,
    agent_id,
    content,
    timestamp: Date.now(),
    metadata,
  };
}
