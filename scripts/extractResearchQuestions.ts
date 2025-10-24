#!/usr/bin/env tsx
/**
 * Extract Research Questions from Conversation History
 *
 * Parses Claude Code conversation JSONL files and extracts
 * research questions asked by the user.
 *
 * Usage:
 *   # First, backup conversations
 *   bash claude-conversations/backup-conversations.sh
 *
 *   # Then extract questions to wiki
 *   npx tsx scripts/extractResearchQuestions.ts > docs/wiki/RESEARCH_QUESTIONS.md
 *
 * What it does:
 * 1. Reads all .jsonl files from claude-conversations/ directory
 * 2. Parses each conversation turn (user/assistant messages)
 * 3. Identifies questions using pattern matching (what/how/why/can we model/etc.)
 * 4. Categorizes by topic using keyword matching
 * 5. Deduplicates similar questions
 * 6. Outputs organized markdown report
 *
 * Output format:
 * - Questions grouped by topic (alignment, capabilities, environmental, etc.)
 * - Statistics (total questions, topics covered, most discussed topic)
 * - Sorted by frequency (most questions first)
 *
 * Topics categorized:
 * - alignment, capabilities, collective, control, deception, detection
 * - economic, environmental, evolutionary, social, suffering, technology
 * - general (cross-cutting methodological questions)
 *
 * Pattern matching: Questions must:
 * - Contain a question mark (?)
 * - Match research patterns: "what if", "how do", "why is", "can we model", etc.
 */

import * as fs from 'fs';
import * as path from 'path';

interface Message {
  role: 'user' | 'assistant';
  content: string | any[];
}

interface ConversationTurn {
  type: string;
  message?: Message;
  timestamp?: string;
  uuid?: string;
  sessionId?: string;
}

interface ResearchQuestion {
  question: string;
  context?: string;
  conversationFile: string;
  timestamp?: string;
}

// Patterns that indicate research questions
const RESEARCH_PATTERNS = [
  /\bwhat (?:if|would|happens|are the|is the|does)\b/i,
  /\bhow (?:do|does|can|would|might)\b/i,
  /\bwhy (?:do|does|is|are|would)\b/i,
  /\bcan we (?:model|simulate|test|measure)\b/i,
  /\bis it possible\b/i,
  /\bwould it\b/i,
  /\bcould (?:we|it)\b/i,
  /\bshould we\b/i,
  /\bdo you think\b/i,
  /\bwhat's the (?:relationship|effect|impact)\b/i,
  /\bhow (?:much|often|fast|quickly)\b/i,
  /\bwhat determines\b/i,
  /\bwhat drives\b/i,
  /\bwhat causes\b/i,
];

// Topics to categorize by
const TOPIC_KEYWORDS = {
  alignment: ['alignment', 'misalign', 'rlhf', 'constitutional ai', 'mesa-optimiz'],
  capabilities: ['capability', 'capabilities', 'AGI', 'superintelligence', 'takeoff'],
  collective: ['collective', 'coordination', 'multi-agent', 'swarm'],
  control: ['control', 'oversight', 'governance', 'regulation'],
  detection: ['detect', 'monitor', 'measure', 'observe'],
  environmental: ['climate', 'environment', 'planetary', 'ecology', 'extinction'],
  social: ['social', 'society', 'trust', 'cohesion', 'meaning'],
  economic: ['economic', 'UBI', 'automation', 'employment', 'scarcity'],
  evolutionary: ['evolution', 'selection', 'fitness', 'adaptation'],
  deception: ['deception', 'sandbagging', 'treacherous turn', 'stealth'],
  suffering: ['suffering', 'consciousness', 'sentience', 'welfare'],
  technology: ['technology', 'breakthrough', 'innovation', 'research'],
};

function readConversationFile(filePath: string): ConversationTurn[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n').filter(line => line.trim());

  return lines.map(line => {
    try {
      return JSON.parse(line);
    } catch (e) {
      return null;
    }
  }).filter(Boolean) as ConversationTurn[];
}

function extractTextContent(content: string | any[]): string {
  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .filter(item => item.type === 'text')
      .map(item => item.text || '')
      .join(' ');
  }

  return '';
}

function isResearchQuestion(text: string): boolean {
  // Must contain a question mark
  if (!text.includes('?')) return false;

  // Must match at least one research pattern
  return RESEARCH_PATTERNS.some(pattern => pattern.test(text));
}

function extractQuestionsFromText(text: string): string[] {
  // Split by question marks, keep the question mark with each question
  const sentences = text.split(/(?<=\?)\s+/);

  return sentences
    .filter(s => s.includes('?'))
    .filter(s => isResearchQuestion(s))
    .map(s => s.trim());
}

function categorizeTopic(question: string): string[] {
  const topics: string[] = [];

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some(kw => question.toLowerCase().includes(kw))) {
      topics.push(topic);
    }
  }

  return topics.length > 0 ? topics : ['general'];
}

function extractResearchQuestions(conversationsDir: string): ResearchQuestion[] {
  const questions: ResearchQuestion[] = [];

  // Find all JSONL files
  const files = fs.readdirSync(conversationsDir)
    .filter(f => f.endsWith('.jsonl'))
    .map(f => path.join(conversationsDir, f));

  console.error(`Found ${files.length} conversation files`);

  for (const file of files) {
    try {
      const turns = readConversationFile(file);

      // Look at user turns only (those with type 'user' and a message field)
      const userTurns = turns.filter(t =>
        t.type === 'user' &&
        t.message &&
        t.message.role === 'user'
      );

      for (const turn of userTurns) {
        if (!turn.message) continue;

        const text = extractTextContent(turn.message.content);
        const extractedQuestions = extractQuestionsFromText(text);

        for (const q of extractedQuestions) {
          questions.push({
            question: q,
            conversationFile: path.basename(file),
            timestamp: turn.timestamp,
          });
        }
      }
    } catch (e) {
      console.error(`Error processing ${file}:`, e);
    }
  }

  return questions;
}

function groupByTopic(questions: ResearchQuestion[]): Record<string, ResearchQuestion[]> {
  const grouped: Record<string, ResearchQuestion[]> = {};

  for (const q of questions) {
    const topics = categorizeTopic(q.question);

    for (const topic of topics) {
      if (!grouped[topic]) {
        grouped[topic] = [];
      }
      grouped[topic].push(q);
    }
  }

  return grouped;
}

// Main execution
const conversationsDir = path.join(__dirname, '..', 'claude-conversations');

console.error('Extracting research questions from conversations...\n');

const allQuestions = extractResearchQuestions(conversationsDir);

console.error(`\nExtracted ${allQuestions.length} research questions`);

// Group by topic
const byTopic = groupByTopic(allQuestions);

// Output as markdown
console.log('# Research Questions from Conversation History\n');
console.log(`**Total Questions:** ${allQuestions.length}\n`);
console.log(`**Generated:** ${new Date().toISOString().split('T')[0]}\n`);
console.log('---\n');

// Sort topics by number of questions
const sortedTopics = Object.entries(byTopic)
  .sort((a, b) => b[1].length - a[1].length);

for (const [topic, questions] of sortedTopics) {
  console.log(`## ${topic.charAt(0).toUpperCase() + topic.slice(1)} (${questions.length} questions)\n`);

  // Deduplicate similar questions
  const uniqueQuestions = new Map<string, ResearchQuestion>();
  for (const q of questions) {
    const normalized = q.question.toLowerCase().trim();
    if (!uniqueQuestions.has(normalized)) {
      uniqueQuestions.set(normalized, q);
    }
  }

  for (const q of uniqueQuestions.values()) {
    console.log(`- ${q.question}`);
  }

  console.log('');
}

// Output statistics
console.log('---\n');
console.log('## Statistics\n');
console.log(`- Total unique questions: ${allQuestions.length}`);
console.log(`- Topics covered: ${Object.keys(byTopic).length}`);
console.log(`- Most discussed topic: ${sortedTopics[0]?.[0]} (${sortedTopics[0]?.[1].length} questions)`);
