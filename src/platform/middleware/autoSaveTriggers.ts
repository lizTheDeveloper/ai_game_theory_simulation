/**
 * Auto-Save Trigger Logic
 *
 * Detects completion signals in agent messages and triggers memory saves.
 *
 * Trigger patterns:
 * - "implementation complete"
 * - "task finished"
 * - Session end markers
 * - Tool completion signals
 *
 * Integration:
 * - Connects MessageInterceptor → MCP agent-memory tool
 * - Extracts tasks/learnings from message content
 * - Triggers auto-save with extracted memory
 *
 * Usage:
 * ```typescript
 * const triggers = new AutoSaveTriggers({
 *   mcpClient: agentMemoryClient,
 *   enableLogging: true
 * });
 *
 * await triggers.checkAndSave(agentMessage);
 * ```
 *
 * Task: 1.4.2 (Phase 1 Week 2)
 */

import { AgentMessage } from './messageInterceptor';
import { assertDefined } from '@/simulation/utils/assertions';

/**
 * Completion signal pattern
 */
export interface CompletionPattern {
  /**
   * Pattern name
   */
  name: string;

  /**
   * Regex pattern to match
   */
  pattern: RegExp;

  /**
   * Pattern description
   */
  description: string;

  /**
   * Memory extraction strategy
   * - 'full': Save entire message as task
   * - 'extract': Extract task/learning from message
   * - 'summary': Generate summary of message
   */
  strategy: 'full' | 'extract' | 'summary';

  /**
   * Confidence level (0-1)
   * Higher = more likely to be a real completion signal
   */
  confidence: number;
}

/**
 * Default completion patterns
 */
export const DEFAULT_COMPLETION_PATTERNS: CompletionPattern[] = [
  {
    name: 'implementation_complete',
    pattern: /implementation\s+(complete|finished|done)/i,
    description: 'Implementation completion signal',
    strategy: 'extract',
    confidence: 0.95,
  },
  {
    name: 'task_finished',
    pattern: /task\s+(finished|completed|done)/i,
    description: 'Task completion signal',
    strategy: 'extract',
    confidence: 0.95,
  },
  {
    name: 'session_end',
    pattern: /(session\s+end|wrapping\s+up|summary|signing\s+off)/i,
    description: 'Session end marker',
    strategy: 'summary',
    confidence: 0.9,
  },
  {
    name: 'work_complete',
    pattern: /(all\s+done|work\s+complete|finished\s+all)/i,
    description: 'Work completion signal',
    strategy: 'extract',
    confidence: 0.85,
  },
  {
    name: 'deliverable_ready',
    pattern: /(deliverable|ready\s+for\s+review|submitted)/i,
    description: 'Deliverable ready signal',
    strategy: 'extract',
    confidence: 0.8,
  },
  {
    name: 'commit_message',
    pattern: /^(feat|fix|docs|refactor|test|chore):/i,
    description: 'Git commit message (conventional commits)',
    strategy: 'full',
    confidence: 0.7,
  },
  {
    name: 'success_indicator',
    pattern: /(✅|✓|success|passed\s+all)/i,
    description: 'Success indicator emoji/text',
    strategy: 'extract',
    confidence: 0.75,
  },
];

/**
 * Trigger match result
 */
export interface TriggerMatch {
  /**
   * Matched pattern
   */
  pattern: CompletionPattern;

  /**
   * Match confidence (0-1)
   */
  confidence: number;

  /**
   * Matched text excerpt
   */
  excerpt: string;

  /**
   * Should trigger auto-save?
   */
  shouldSave: boolean;
}

/**
 * Auto-save result
 */
export interface AutoSaveResult {
  /**
   * Save triggered?
   */
  triggered: boolean;

  /**
   * Agent ID
   */
  agent_id: string;

  /**
   * Matched patterns
   */
  matches: TriggerMatch[];

  /**
   * Extracted memory
   */
  memory?: {
    task?: string;
    learning?: string;
    conversation?: string;
  };

  /**
   * Error if save failed
   */
  error?: string;
}

/**
 * Auto-save trigger configuration
 */
export interface AutoSaveTriggerConfig {
  /**
   * MCP agent-memory client
   * (We don't have the actual MCP type, so using generic interface)
   */
  mcpClient: {
    addTask: (agent_id: string, task: string) => Promise<void>;
    addLearning: (agent_id: string, learning: string) => Promise<void>;
    addConversation: (agent_id: string, conversation: string) => Promise<void>;
  };

  /**
   * Custom completion patterns (overrides defaults)
   */
  patterns?: CompletionPattern[];

  /**
   * Confidence threshold (0-1)
   * Only trigger save if match confidence >= threshold
   * Default: 0.7
   */
  confidenceThreshold?: number;

  /**
   * Enable logging
   * Default: false
   */
  enableLogging?: boolean;

  /**
   * Dry run mode (don't actually save, just detect)
   * Default: false
   */
  dryRun?: boolean;
}

/**
 * Auto-Save Triggers
 *
 * Detects completion signals and triggers memory saves.
 */
export class AutoSaveTriggers {
  private config: Required<Omit<AutoSaveTriggerConfig, 'mcpClient'>> & {
    mcpClient: AutoSaveTriggerConfig['mcpClient'];
  };
  private patterns: CompletionPattern[];
  private saveCount: number;
  private matchCount: number;

  constructor(config: AutoSaveTriggerConfig) {
    assertDefined(config.mcpClient, {
      location: 'AutoSaveTriggers.constructor',
      valueName: 'config.mcpClient',
    });

    this.config = {
      mcpClient: config.mcpClient,
      patterns: config.patterns ?? DEFAULT_COMPLETION_PATTERNS,
      confidenceThreshold: config.confidenceThreshold ?? 0.7,
      enableLogging: config.enableLogging ?? false,
      dryRun: config.dryRun ?? false,
    };

    this.patterns = this.config.patterns;
    this.saveCount = 0;
    this.matchCount = 0;
  }

  /**
   * Check message for completion signals and trigger save if matched
   *
   * @param message - Agent message to check
   * @returns Auto-save result
   */
  public async checkAndSave(message: AgentMessage): Promise<AutoSaveResult> {
    const matches = this.detectCompletionSignals(message.content);

    if (matches.length === 0) {
      return {
        triggered: false,
        agent_id: message.agent_id,
        matches: [],
      };
    }

    this.matchCount += matches.length;

    // Filter by confidence threshold
    const highConfidenceMatches = matches.filter(
      (m) => m.confidence >= this.config.confidenceThreshold
    );

    if (highConfidenceMatches.length === 0) {
      if (this.config.enableLogging) {
        console.log(
          `⚠️ AutoSaveTriggers: Matches found but below confidence threshold (${this.config.confidenceThreshold})`
        );
      }
      return {
        triggered: false,
        agent_id: message.agent_id,
        matches,
      };
    }

    // Extract memory from message
    const memory = this.extractMemory(message, highConfidenceMatches);

    // Dry run mode: don't actually save
    if (this.config.dryRun) {
      if (this.config.enableLogging) {
        console.log(
          `🔍 AutoSaveTriggers: [DRY RUN] Would save for ${message.agent_id}:`,
          memory
        );
      }
      return {
        triggered: true,
        agent_id: message.agent_id,
        matches: highConfidenceMatches,
        memory,
      };
    }

    // Trigger auto-save
    try {
      await this.saveMemory(message.agent_id, memory);
      this.saveCount++;

      if (this.config.enableLogging) {
        console.log(
          `✅ AutoSaveTriggers: Saved memory for ${message.agent_id}`
        );
      }

      return {
        triggered: true,
        agent_id: message.agent_id,
        matches: highConfidenceMatches,
        memory,
      };
    } catch (error) {
      if (this.config.enableLogging) {
        console.error(
          `❌ AutoSaveTriggers: Save failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }

      return {
        triggered: false,
        agent_id: message.agent_id,
        matches: highConfidenceMatches,
        memory,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Detect completion signals in message content
   *
   * @param content - Message content
   * @returns Array of matches
   */
  private detectCompletionSignals(content: string): TriggerMatch[] {
    const matches: TriggerMatch[] = [];

    for (const pattern of this.patterns) {
      const match = content.match(pattern.pattern);
      if (match) {
        // Extract excerpt (50 chars before/after match)
        const matchIndex = match.index ?? 0;
        const start = Math.max(0, matchIndex - 50);
        const end = Math.min(content.length, matchIndex + match[0].length + 50);
        const excerpt = content.slice(start, end);

        matches.push({
          pattern,
          confidence: pattern.confidence,
          excerpt,
          shouldSave: pattern.confidence >= this.config.confidenceThreshold,
        });
      }
    }

    return matches;
  }

  /**
   * Extract memory from message based on matched patterns
   *
   * @param message - Agent message
   * @param matches - Matched patterns
   * @returns Extracted memory
   */
  private extractMemory(
    message: AgentMessage,
    matches: TriggerMatch[]
  ): {
    task?: string;
    learning?: string;
    conversation?: string;
  } {
    const memory: {
      task?: string;
      learning?: string;
      conversation?: string;
    } = {};

    // Determine extraction strategy based on highest-confidence match
    const topMatch = matches.reduce((best, current) =>
      current.confidence > best.confidence ? current : best
    );

    const strategy = topMatch.pattern.strategy;

    if (strategy === 'full') {
      // Save entire message as task
      memory.task = message.content;
    } else if (strategy === 'extract') {
      // Extract task/learning from message
      // Simple heuristic: Look for bullet points, numbered lists, or sentences after match
      const extracted = this.extractTaskOrLearning(message.content, topMatch);
      if (extracted.task) {
        memory.task = extracted.task;
      }
      if (extracted.learning) {
        memory.learning = extracted.learning;
      }
    } else if (strategy === 'summary') {
      // Save as conversation summary
      memory.conversation = this.generateSummary(message.content);
    }

    return memory;
  }

  /**
   * Extract task or learning from message content
   *
   * @param content - Message content
   * @param match - Trigger match
   * @returns Extracted task/learning
   */
  private extractTaskOrLearning(
    content: string,
    match: TriggerMatch
  ): { task?: string; learning?: string } {
    // Simple heuristic: Look for sentences containing keywords
    const lines = content.split('\n');
    const result: { task?: string; learning?: string } = {};

    // Look for task indicators
    const taskLine = lines.find(
      (line) =>
        line.match(/^[\s-]*(\d+\.|\-|\*)\s+/i) || // Bullet/numbered list
        line.match(/(implemented|completed|finished|delivered)/i)
    );

    if (taskLine) {
      result.task = taskLine.trim();
    }

    // Look for learning indicators
    const learningLine = lines.find(
      (line) =>
        line.match(/(learned|discovered|found|realized|insight)/i) ||
        line.match(/^[\s-]*💡/i) // Light bulb emoji
    );

    if (learningLine) {
      result.learning = learningLine.trim();
    }

    // Fallback: Use excerpt from match
    if (!result.task && !result.learning) {
      result.task = match.excerpt.trim();
    }

    return result;
  }

  /**
   * Generate summary from message content
   *
   * @param content - Message content
   * @returns Summary
   */
  private generateSummary(content: string): string {
    // Simple summary: First 200 characters
    const summary = content.slice(0, 200).trim();
    return summary + (content.length > 200 ? '...' : '');
  }

  /**
   * Save memory to MCP agent-memory
   *
   * @param agent_id - Agent ID
   * @param memory - Memory to save
   */
  private async saveMemory(
    agent_id: string,
    memory: {
      task?: string;
      learning?: string;
      conversation?: string;
    }
  ): Promise<void> {
    const promises: Promise<void>[] = [];

    if (memory.task) {
      promises.push(this.config.mcpClient.addTask(agent_id, memory.task));
    }

    if (memory.learning) {
      promises.push(this.config.mcpClient.addLearning(agent_id, memory.learning));
    }

    if (memory.conversation) {
      promises.push(
        this.config.mcpClient.addConversation(agent_id, memory.conversation)
      );
    }

    await Promise.all(promises);
  }

  /**
   * Get statistics
   *
   * @returns Stats object
   */
  public getStats(): {
    saveCount: number;
    matchCount: number;
    patterns: number;
  } {
    return {
      saveCount: this.saveCount,
      matchCount: this.matchCount,
      patterns: this.patterns.length,
    };
  }

  /**
   * Add custom pattern
   *
   * @param pattern - Completion pattern
   */
  public addPattern(pattern: CompletionPattern): void {
    this.patterns.push(pattern);
  }

  /**
   * Remove pattern by name
   *
   * @param name - Pattern name
   */
  public removePattern(name: string): void {
    this.patterns = this.patterns.filter((p) => p.name !== name);
  }

  /**
   * Get all patterns
   *
   * @returns Array of patterns
   */
  public getPatterns(): CompletionPattern[] {
    return [...this.patterns];
  }
}

/**
 * Create auto-save triggers
 *
 * @param config - Configuration
 * @returns AutoSaveTriggers instance
 */
export function createAutoSaveTriggers(
  config: AutoSaveTriggerConfig
): AutoSaveTriggers {
  return new AutoSaveTriggers(config);
}
