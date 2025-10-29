/**
 * Agent Memory Management System
 *
 * Utilities for loading, saving, and maintaining agent memory files.
 * Each agent has hierarchical memory: recent, medium-term, long-term, core, compost.
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Types
// ============================================================================

export interface AgentMemory {
  agentId: string;
  agentName: string;
  role: string;
  voice: string;
  created: string;
  lastActive: string;
  coreMemory: CoreMemory;
  recent: RecentMemory;
  mediumTerm: MediumTermMemory;
  longTerm: LongTermMemory;
  compost: CompostMemory;
}

export interface CoreMemory {
  personality: string;
  role: string;
  specialty: string;
  motto: string;
  communicationStyle: string[];
  relationships: Record<string, string>;
  [key: string]: any; // Allow additional core memory fields
}

export interface RecentMemory {
  lastUpdated: string;
  tasks: string[];
  learnings: string[];
  conversations: string[];
  [key: string]: any;
}

export interface MediumTermMemory {
  lastCleared: string;
  patterns: string[];
  insights: string[];
  [key: string]: any;
}

export interface LongTermMemory {
  majorInsights: string[];
  recurringPatterns: string[];
  projectMilestones: string[];
  [key: string]: any;
}

export interface CompostMemory {
  lastCleared: string;
  discardedIdeas: string[];
  failedApproaches: string[];
  [key: string]: any;
}

// ============================================================================
// Memory File Paths
// ============================================================================

const MEMORY_DIR = '.claude/agents/memories';

const AGENT_MEMORY_FILES: Record<string, string> = {
  'cynthia': 'cynthia-memory.json',
  'sylvia': 'sylvia-memory.json',
  'operator': 'operator-memory.json',
  'tessa': 'tessa-memory.json',
  'historian': 'historian-memory.json',
  'planner': 'planner-memory.json',
  'ray': 'ray-memory.json',
  'moss': 'moss-memory.json',
  'roy': 'roy-memory.json',
};

// ============================================================================
// Load & Save
// ============================================================================

/**
 * Load agent memory from disk
 */
export function loadMemory(agentId: string): AgentMemory {
  const filename = AGENT_MEMORY_FILES[agentId];
  if (!filename) {
    throw new Error(`Unknown agent ID: ${agentId}`);
  }

  const filepath = path.join(MEMORY_DIR, filename);

  if (!fs.existsSync(filepath)) {
    throw new Error(`Memory file not found: ${filepath}`);
  }

  const raw = fs.readFileSync(filepath, 'utf-8');
  return JSON.parse(raw) as AgentMemory;
}

/**
 * Save agent memory to disk
 */
export function saveMemory(agentId: string, memory: AgentMemory): void {
  const filename = AGENT_MEMORY_FILES[agentId];
  if (!filename) {
    throw new Error(`Unknown agent ID: ${agentId}`);
  }

  // Update lastActive timestamp
  memory.lastActive = new Date().toISOString();

  const filepath = path.join(MEMORY_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(memory, null, 2), 'utf-8');
}

/**
 * Load all agent memories
 */
export function loadAllMemories(): Record<string, AgentMemory> {
  const memories: Record<string, AgentMemory> = {};

  for (const agentId of Object.keys(AGENT_MEMORY_FILES)) {
    try {
      memories[agentId] = loadMemory(agentId);
    } catch (error) {
      console.error(`Failed to load memory for ${agentId}:`, error);
    }
  }

  return memories;
}

// ============================================================================
// Memory Updates
// ============================================================================

/**
 * Add a task to recent memory
 */
export function addRecentTask(memory: AgentMemory, task: string): AgentMemory {
  memory.recent.tasks.push(task);
  memory.recent.lastUpdated = new Date().toISOString();
  return memory;
}

/**
 * Add a learning to recent memory
 */
export function addRecentLearning(memory: AgentMemory, learning: string): AgentMemory {
  memory.recent.learnings.push(learning);
  memory.recent.lastUpdated = new Date().toISOString();
  return memory;
}

/**
 * Add a conversation to recent memory
 */
export function addConversation(memory: AgentMemory, conversation: string): AgentMemory {
  memory.recent.conversations.push(conversation);
  memory.recent.lastUpdated = new Date().toISOString();
  return memory;
}

/**
 * Add an insight to long-term memory
 */
export function addLongTermInsight(memory: AgentMemory, insight: string): AgentMemory {
  if (!memory.longTerm.majorInsights.includes(insight)) {
    memory.longTerm.majorInsights.push(insight);
  }
  return memory;
}

/**
 * Add a milestone to long-term memory
 */
export function addMilestone(memory: AgentMemory, milestone: string): AgentMemory {
  memory.longTerm.projectMilestones.push(milestone);
  return memory;
}

// ============================================================================
// Memory Maintenance (Nightly/Weekly/Monthly)
// ============================================================================

/**
 * Nightly cleanup: Move recent → medium-term
 */
export function nightlyCleanup(memory: AgentMemory): AgentMemory {
  console.log(`🌙 Nightly cleanup for ${memory.agentName}...`);

  // Move important recent items to medium-term
  if (memory.recent.learnings.length > 0) {
    memory.mediumTerm.insights.push(...memory.recent.learnings);
  }

  // Clear recent memory
  memory.recent.tasks = [];
  memory.recent.learnings = [];
  memory.recent.conversations = [];
  memory.recent.lastUpdated = new Date().toISOString();

  console.log(`✅ ${memory.agentName}: Recent memory cleared`);
  return memory;
}

/**
 * Weekly cleanup: Move medium-term → long-term or compost
 */
export function weeklyCleanup(memory: AgentMemory): AgentMemory {
  console.log(`📅 Weekly cleanup for ${memory.agentName}...`);

  // Promote important insights to long-term
  // (In real implementation, would use criteria to filter)
  if (memory.mediumTerm.insights.length > 0) {
    memory.longTerm.majorInsights.push(...memory.mediumTerm.insights.slice(0, 3));

    // Rest go to compost
    if (memory.mediumTerm.insights.length > 3) {
      const compostItems = memory.mediumTerm.insights.slice(3);
      if (!memory.compost.discardedIdeas) {
        memory.compost.discardedIdeas = [];
      }
      memory.compost.discardedIdeas.push(...compostItems);
    }
  }

  // Clear medium-term
  memory.mediumTerm.patterns = [];
  memory.mediumTerm.insights = [];
  memory.mediumTerm.lastCleared = new Date().toISOString();

  console.log(`✅ ${memory.agentName}: Medium-term memory cleared`);
  return memory;
}

/**
 * Monthly cleanup: Groom compost
 */
export function monthlyCleanup(memory: AgentMemory): AgentMemory {
  console.log(`🗓️ Monthly cleanup for ${memory.agentName}...`);

  // In real implementation, would review compost for gems
  // For now, just clear old items
  memory.compost.discardedIdeas = [];
  memory.compost.failedApproaches = [];
  memory.compost.lastCleared = new Date().toISOString();

  console.log(`✅ ${memory.agentName}: Compost cleared`);
  return memory;
}

/**
 * Run maintenance on all agent memories
 */
export function runMaintenance(type: 'nightly' | 'weekly' | 'monthly'): void {
  console.log(`\n🔧 Running ${type} maintenance on all agent memories...\n`);

  const memories = loadAllMemories();

  for (const [agentId, memory] of Object.entries(memories)) {
    let updated = memory;

    switch (type) {
      case 'nightly':
        updated = nightlyCleanup(memory);
        break;
      case 'weekly':
        updated = weeklyCleanup(memory);
        break;
      case 'monthly':
        updated = monthlyCleanup(memory);
        break;
    }

    saveMemory(agentId, updated);
  }

  console.log(`\n✅ ${type} maintenance complete!\n`);
}

// ============================================================================
// Reporting
// ============================================================================

/**
 * Generate memory report for an agent
 */
export function generateMemoryReport(agentId: string): string {
  const memory = loadMemory(agentId);

  return `
# Memory Report: ${memory.agentName}

**Role:** ${memory.role}
**Voice:** ${memory.voice}
**Last Active:** ${memory.lastActive}

## Core Memory
**Personality:** ${memory.coreMemory.personality}
**Motto:** "${memory.coreMemory.motto}"

## Recent Activity (${memory.recent.tasks.length} tasks)
${memory.recent.tasks.map(t => `- ${t}`).join('\n')}

## Medium-Term Insights (${memory.mediumTerm.insights.length})
${memory.mediumTerm.insights.map(i => `- ${i}`).join('\n')}

## Long-Term Memory
**Major Insights:** ${memory.longTerm.majorInsights.length}
**Project Milestones:** ${memory.longTerm.projectMilestones.length}

## Compost
**Discarded Ideas:** ${memory.compost.discardedIdeas?.length || 0}
**Failed Approaches:** ${memory.compost.failedApproaches?.length || 0}
`;
}

/**
 * Generate team memory overview
 */
export function generateTeamOverview(): string {
  const memories = loadAllMemories();
  const agents = Object.values(memories);

  return `
# Team Memory Overview

**Total Agents:** ${agents.length}
**Last Updated:** ${new Date().toISOString()}

${agents.map(m => `
## ${m.agentName} (${m.agentId})
- **Role:** ${m.role}
- **Recent Tasks:** ${m.recent.tasks.length}
- **Long-term Insights:** ${m.longTerm.majorInsights.length}
- **Milestones:** ${m.longTerm.projectMilestones.length}
`).join('\n')}
`;
}

// ============================================================================
// CLI
// ============================================================================

if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'load':
      const agentId = args[1];
      if (!agentId) {
        console.error('Usage: npx tsx memoryManager.ts load <agentId>');
        process.exit(1);
      }
      const memory = loadMemory(agentId);
      console.log(JSON.stringify(memory, null, 2));
      break;

    case 'report':
      const reportAgentId = args[1];
      if (!reportAgentId) {
        console.error('Usage: npx tsx memoryManager.ts report <agentId>');
        process.exit(1);
      }
      console.log(generateMemoryReport(reportAgentId));
      break;

    case 'team':
      console.log(generateTeamOverview());
      break;

    case 'maintain':
      const maintenanceType = args[1] as 'nightly' | 'weekly' | 'monthly';
      if (!['nightly', 'weekly', 'monthly'].includes(maintenanceType)) {
        console.error('Usage: npx tsx memoryManager.ts maintain <nightly|weekly|monthly>');
        process.exit(1);
      }
      runMaintenance(maintenanceType);
      break;

    default:
      console.log(`
Agent Memory Manager

Commands:
  load <agentId>              Load and display agent memory
  report <agentId>            Generate memory report for agent
  team                        Show team memory overview
  maintain <type>             Run maintenance (nightly/weekly/monthly)

Examples:
  npx tsx scripts/memoryManager.ts load cynthia-researcher-001
  npx tsx scripts/memoryManager.ts report roy-maintainer-001
  npx tsx scripts/memoryManager.ts team
  npx tsx scripts/memoryManager.ts maintain nightly
`);
      break;
  }
}

export default {
  loadMemory,
  saveMemory,
  loadAllMemories,
  addRecentTask,
  addRecentLearning,
  addConversation,
  addLongTermInsight,
  addMilestone,
  nightlyCleanup,
  weeklyCleanup,
  monthlyCleanup,
  runMaintenance,
  generateMemoryReport,
  generateTeamOverview,
};
