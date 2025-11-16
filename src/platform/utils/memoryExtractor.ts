/**
 * Memory Extraction Utilities
 *
 * Extracts tasks, learnings, and conversations from agent output.
 *
 * Schema matches MCP agent-memory format:
 * - Tasks: Action items, deliverables, implementations
 * - Learnings: Insights, patterns, discoveries
 * - Conversations: Discussions, debates, resolutions
 *
 * Usage:
 * ```typescript
 * const extractor = new MemoryExtractor();
 * const memory = extractor.extract(agentMessage);
 * // memory = { tasks: [...], learnings: [...], conversations: [...] }
 * ```
 *
 * Task: 1.4.3 (Phase 1 Week 2)
 */

import { AgentMessage } from '../middleware/messageInterceptor';
import { assertDefined } from '@/simulation/utils/assertions';

/**
 * Extracted task
 */
export interface ExtractedTask {
  /**
   * Task description
   */
  description: string;

  /**
   * Task type
   */
  type: 'implementation' | 'research' | 'review' | 'documentation' | 'other';

  /**
   * Confidence score (0-1)
   */
  confidence: number;

  /**
   * Timestamp
   */
  timestamp: number;

  /**
   * Source excerpt
   */
  source?: string;
}

/**
 * Extracted learning
 */
export interface ExtractedLearning {
  /**
   * Learning description
   */
  description: string;

  /**
   * Learning category
   */
  category:
    | 'pattern'
    | 'insight'
    | 'error'
    | 'optimization'
    | 'constraint'
    | 'other';

  /**
   * Confidence score (0-1)
   */
  confidence: number;

  /**
   * Timestamp
   */
  timestamp: number;

  /**
   * Source excerpt
   */
  source?: string;
}

/**
 * Extracted conversation
 */
export interface ExtractedConversation {
  /**
   * Conversation summary
   */
  summary: string;

  /**
   * Participants (agent IDs)
   */
  participants: string[];

  /**
   * Conversation type
   */
  type: 'debate' | 'collaboration' | 'review' | 'planning' | 'other';

  /**
   * Timestamp
   */
  timestamp: number;

  /**
   * Full content (optional)
   */
  content?: string;
}

/**
 * Extracted memory
 */
export interface ExtractedMemory {
  tasks: ExtractedTask[];
  learnings: ExtractedLearning[];
  conversations: ExtractedConversation[];
}

/**
 * Extraction patterns
 */
interface ExtractionPattern {
  name: string;
  pattern: RegExp;
  type: 'task' | 'learning' | 'conversation';
  confidence: number;
  extractFn: (match: RegExpMatchArray, content: string) => string;
}

/**
 * Default extraction patterns
 */
const TASK_PATTERNS: ExtractionPattern[] = [
  {
    name: 'bullet_task',
    pattern: /^[\s-]*[\*\-]\s+(.+?)$/gm,
    type: 'task',
    confidence: 0.7,
    extractFn: (match) => match[1].trim(),
  },
  {
    name: 'numbered_task',
    pattern: /^[\s-]*\d+\.\s+(.+?)$/gm,
    type: 'task',
    confidence: 0.75,
    extractFn: (match) => match[1].trim(),
  },
  {
    name: 'checkbox_task',
    pattern: /^[\s-]*\[[ xX]\]\s+(.+?)$/gm,
    type: 'task',
    confidence: 0.9,
    extractFn: (match) => match[1].trim(),
  },
  {
    name: 'implemented',
    pattern: /implemented\s+(.+?)(?:\.|$)/gi,
    type: 'task',
    confidence: 0.85,
    extractFn: (match) => match[1].trim(),
  },
  {
    name: 'completed',
    pattern: /completed\s+(.+?)(?:\.|$)/gi,
    type: 'task',
    confidence: 0.85,
    extractFn: (match) => match[1].trim(),
  },
];

const LEARNING_PATTERNS: ExtractionPattern[] = [
  {
    name: 'learned',
    pattern: /learned\s+(?:that\s+)?(.+?)(?:\.|$)/gi,
    type: 'learning',
    confidence: 0.9,
    extractFn: (match) => match[1].trim(),
  },
  {
    name: 'discovered',
    pattern: /discovered\s+(?:that\s+)?(.+?)(?:\.|$)/gi,
    type: 'learning',
    confidence: 0.85,
    extractFn: (match) => match[1].trim(),
  },
  {
    name: 'insight',
    pattern: /(?:insight|realized):\s+(.+?)(?:\.|$)/gi,
    type: 'learning',
    confidence: 0.9,
    extractFn: (match) => match[1].trim(),
  },
  {
    name: 'pattern',
    pattern: /pattern:\s+(.+?)(?:\.|$)/gi,
    type: 'learning',
    confidence: 0.85,
    extractFn: (match) => match[1].trim(),
  },
  {
    name: 'error',
    pattern: /(?:error|mistake):\s+(.+?)(?:\.|$)/gi,
    type: 'learning',
    confidence: 0.8,
    extractFn: (match) => match[1].trim(),
  },
  {
    name: 'lightbulb',
    pattern: /💡\s+(.+?)(?:\.|$)/g,
    type: 'learning',
    confidence: 0.9,
    extractFn: (match) => match[1].trim(),
  },
];

const CONVERSATION_PATTERNS: ExtractionPattern[] = [
  {
    name: 'debate',
    pattern: /(?:debate|discussion)\s+(?:about|on|regarding)\s+(.+?)(?:\.|$)/gi,
    type: 'conversation',
    confidence: 0.8,
    extractFn: (match) => match[1].trim(),
  },
  {
    name: 'collaborated',
    pattern: /collaborated\s+with\s+(.+?)\s+on\s+(.+?)(?:\.|$)/gi,
    type: 'conversation',
    confidence: 0.85,
    extractFn: (match) => `${match[1].trim()}: ${match[2].trim()}`,
  },
  {
    name: 'reviewed',
    pattern: /reviewed\s+(.+?)(?:\.|$)/gi,
    type: 'conversation',
    confidence: 0.75,
    extractFn: (match) => match[1].trim(),
  },
];

/**
 * Memory Extractor
 *
 * Extracts structured memory from agent messages.
 */
export class MemoryExtractor {
  private taskPatterns: ExtractionPattern[];
  private learningPatterns: ExtractionPattern[];
  private conversationPatterns: ExtractionPattern[];
  private minConfidence: number;

  constructor(options?: { minConfidence?: number }) {
    this.taskPatterns = [...TASK_PATTERNS];
    this.learningPatterns = [...LEARNING_PATTERNS];
    this.conversationPatterns = [...CONVERSATION_PATTERNS];
    this.minConfidence = options?.minConfidence ?? 0.7;
  }

  /**
   * Extract memory from agent message
   *
   * @param message - Agent message
   * @returns Extracted memory
   */
  public extract(message: AgentMessage): ExtractedMemory {
    assertDefined(message, {
      location: 'MemoryExtractor.extract',
      valueName: 'message',
    });

    const tasks = this.extractTasks(message);
    const learnings = this.extractLearnings(message);
    const conversations = this.extractConversations(message);

    return { tasks, learnings, conversations };
  }

  /**
   * Extract tasks from message
   *
   * @param message - Agent message
   * @returns Array of extracted tasks
   */
  private extractTasks(message: AgentMessage): ExtractedTask[] {
    const tasks: ExtractedTask[] = [];
    const content = message.content;

    for (const pattern of this.taskPatterns) {
      // Reset regex lastIndex
      pattern.pattern.lastIndex = 0;

      let match: RegExpMatchArray | null;
      while ((match = pattern.pattern.exec(content)) !== null) {
        try {
          const description = pattern.extractFn(match, content);

          if (description && description.length > 3) {
            // Infer task type from keywords
            const type = this.inferTaskType(description);

            tasks.push({
              description,
              type,
              confidence: pattern.confidence,
              timestamp: message.timestamp,
              source: match[0].substring(0, 100),
            });
          }
        } catch (error) {
          // Skip malformed matches
          continue;
        }
      }
    }

    // Deduplicate similar tasks
    return this.deduplicateTasks(tasks);
  }

  /**
   * Extract learnings from message
   *
   * @param message - Agent message
   * @returns Array of extracted learnings
   */
  private extractLearnings(message: AgentMessage): ExtractedLearning[] {
    const learnings: ExtractedLearning[] = [];
    const content = message.content;

    for (const pattern of this.learningPatterns) {
      // Reset regex lastIndex
      pattern.pattern.lastIndex = 0;

      let match: RegExpMatchArray | null;
      while ((match = pattern.pattern.exec(content)) !== null) {
        try {
          const description = pattern.extractFn(match, content);

          if (description && description.length > 3) {
            // Infer learning category from keywords
            const category = this.inferLearningCategory(description);

            learnings.push({
              description,
              category,
              confidence: pattern.confidence,
              timestamp: message.timestamp,
              source: match[0].substring(0, 100),
            });
          }
        } catch (error) {
          // Skip malformed matches
          continue;
        }
      }
    }

    // Deduplicate similar learnings
    return this.deduplicateLearnings(learnings);
  }

  /**
   * Extract conversations from message
   *
   * @param message - Agent message
   * @returns Array of extracted conversations
   */
  private extractConversations(message: AgentMessage): ExtractedConversation[] {
    const conversations: ExtractedConversation[] = [];
    const content = message.content;

    for (const pattern of this.conversationPatterns) {
      // Reset regex lastIndex
      pattern.pattern.lastIndex = 0;

      let match: RegExpMatchArray | null;
      while ((match = pattern.pattern.exec(content)) !== null) {
        try {
          const summary = pattern.extractFn(match, content);

          if (summary && summary.length > 3) {
            // Extract participants (simple heuristic: look for agent names)
            const participants = this.extractParticipants(content, message.agent_id);

            // Infer conversation type
            const type = this.inferConversationType(summary);

            conversations.push({
              summary,
              participants,
              type,
              timestamp: message.timestamp,
              content: content.length < 500 ? content : undefined,
            });
          }
        } catch (error) {
          // Skip malformed matches
          continue;
        }
      }
    }

    return conversations;
  }

  /**
   * Infer task type from description
   *
   * @param description - Task description
   * @returns Task type
   */
  private inferTaskType(
    description: string
  ): 'implementation' | 'research' | 'review' | 'documentation' | 'other' {
    const lower = description.toLowerCase();

    if (
      lower.match(
        /implement|code|build|create|develop|fix|refactor|optimize/
      )
    ) {
      return 'implementation';
    }
    if (lower.match(/research|investigate|analyze|study|explore/)) {
      return 'research';
    }
    if (lower.match(/review|validate|verify|check|audit/)) {
      return 'review';
    }
    if (lower.match(/document|write|update\s+docs|readme|wiki/)) {
      return 'documentation';
    }

    return 'other';
  }

  /**
   * Infer learning category from description
   *
   * @param description - Learning description
   * @returns Learning category
   */
  private inferLearningCategory(
    description: string
  ): 'pattern' | 'insight' | 'error' | 'optimization' | 'constraint' | 'other' {
    const lower = description.toLowerCase();

    if (lower.match(/pattern|recurring|consistent|typical/)) {
      return 'pattern';
    }
    if (lower.match(/insight|realize|understand|discover/)) {
      return 'insight';
    }
    if (lower.match(/error|mistake|bug|wrong|incorrect/)) {
      return 'error';
    }
    if (lower.match(/optimize|faster|better|improve|efficient/)) {
      return 'optimization';
    }
    if (lower.match(/constraint|limit|cannot|unable|restriction/)) {
      return 'constraint';
    }

    return 'other';
  }

  /**
   * Infer conversation type from summary
   *
   * @param summary - Conversation summary
   * @returns Conversation type
   */
  private inferConversationType(
    summary: string
  ): 'debate' | 'collaboration' | 'review' | 'planning' | 'other' {
    const lower = summary.toLowerCase();

    if (lower.match(/debate|disagree|argue|counter|oppose/)) {
      return 'debate';
    }
    if (lower.match(/collaborate|work\s+with|together|joint/)) {
      return 'collaboration';
    }
    if (lower.match(/review|feedback|critique|assess/)) {
      return 'review';
    }
    if (lower.match(/plan|roadmap|strategy|coordinate/)) {
      return 'planning';
    }

    return 'other';
  }

  /**
   * Extract participants from content
   *
   * @param content - Message content
   * @param author - Message author (agent_id)
   * @returns Array of participant IDs
   */
  private extractParticipants(content: string, author: string): string[] {
    const participants = new Set<string>([author]);

    // Look for agent names (common patterns)
    const agentPattern = /@([\w-]+)|agent-([\w-]+)|with\s+([\w-]+)/gi;
    let match: RegExpMatchArray | null;
    while ((match = agentPattern.exec(content)) !== null) {
      const agentId = match[1] || match[2] || match[3];
      if (agentId) {
        participants.add(agentId.toLowerCase());
      }
    }

    return Array.from(participants);
  }

  /**
   * Deduplicate tasks by similarity
   *
   * @param tasks - Array of tasks
   * @returns Deduplicated tasks
   */
  private deduplicateTasks(tasks: ExtractedTask[]): ExtractedTask[] {
    const unique: ExtractedTask[] = [];

    for (const task of tasks) {
      // Check if similar task already exists
      const similar = unique.find(
        (existing) =>
          this.similarity(existing.description, task.description) > 0.8
      );

      if (!similar) {
        unique.push(task);
      } else {
        // Keep higher confidence version
        if (task.confidence > similar.confidence) {
          const index = unique.indexOf(similar);
          unique[index] = task;
        }
      }
    }

    // Filter by minimum confidence
    return unique.filter((task) => task.confidence >= this.minConfidence);
  }

  /**
   * Deduplicate learnings by similarity
   *
   * @param learnings - Array of learnings
   * @returns Deduplicated learnings
   */
  private deduplicateLearnings(
    learnings: ExtractedLearning[]
  ): ExtractedLearning[] {
    const unique: ExtractedLearning[] = [];

    for (const learning of learnings) {
      // Check if similar learning already exists
      const similar = unique.find(
        (existing) =>
          this.similarity(existing.description, learning.description) > 0.8
      );

      if (!similar) {
        unique.push(learning);
      } else {
        // Keep higher confidence version
        if (learning.confidence > similar.confidence) {
          const index = unique.indexOf(similar);
          unique[index] = learning;
        }
      }
    }

    // Filter by minimum confidence
    return unique.filter(
      (learning) => learning.confidence >= this.minConfidence
    );
  }

  /**
   * Calculate similarity between two strings (simple Jaccard similarity)
   *
   * @param a - First string
   * @param b - Second string
   * @returns Similarity score (0-1)
   */
  private similarity(a: string, b: string): number {
    const tokensA = new Set(a.toLowerCase().split(/\s+/));
    const tokensB = new Set(b.toLowerCase().split(/\s+/));

    const intersection = new Set([...tokensA].filter((x) => tokensB.has(x)));
    const union = new Set([...tokensA, ...tokensB]);

    return intersection.size / union.size;
  }

  /**
   * Add custom task pattern
   *
   * @param pattern - Extraction pattern
   */
  public addTaskPattern(pattern: ExtractionPattern): void {
    if (pattern.type !== 'task') {
      throw new Error('Pattern type must be "task"');
    }
    this.taskPatterns.push(pattern);
  }

  /**
   * Add custom learning pattern
   *
   * @param pattern - Extraction pattern
   */
  public addLearningPattern(pattern: ExtractionPattern): void {
    if (pattern.type !== 'learning') {
      throw new Error('Pattern type must be "learning"');
    }
    this.learningPatterns.push(pattern);
  }

  /**
   * Add custom conversation pattern
   *
   * @param pattern - Extraction pattern
   */
  public addConversationPattern(pattern: ExtractionPattern): void {
    if (pattern.type !== 'conversation') {
      throw new Error('Pattern type must be "conversation"');
    }
    this.conversationPatterns.push(pattern);
  }
}

/**
 * Create memory extractor
 *
 * @param options - Extractor options
 * @returns MemoryExtractor instance
 */
export function createMemoryExtractor(options?: {
  minConfidence?: number;
}): MemoryExtractor {
  return new MemoryExtractor(options);
}
