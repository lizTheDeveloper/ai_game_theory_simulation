#!/usr/bin/env npx tsx
/**
 * Generate Autonomous Worker Priority Queue
 *
 * Reads plans/MASTER_IMPLEMENTATION_ROADMAP.md and generates
 * /plans/AUTONOMOUS_WORKER_QUEUE.json with all available tasks.
 *
 * Usage:
 *   npx tsx scripts/generateAutonomousWorkerQueue.ts
 *
 * Created: 2025-11-28 (HIGH-3 implementation)
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================
// Types
// ============================================

type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
type TaskStatus = 'available' | 'claimed' | 'completed' | 'blocked';

interface QueueTask {
  id: string;
  priority: Priority;
  title: string;
  assignee: string;
  agentId: string;
  effort: string;
  dependencies: string[];
  status: TaskStatus;
  claimedBy: string | null;
  claimedAt: string | null;
  description: string;
  location: string; // File path and line numbers
}

interface Queue {
  version: string;
  generated: string;
  tasks: QueueTask[];
}

// ============================================
// Agent Personality Mapping
// ============================================

const AGENT_PERSONALITY_MAP: Record<string, string> = {
  'simulation-maintainer': 'roy',
  'far-future-ux-designer': 'tessa',
  'super-alignment-researcher': 'cynthia',
  'research-skeptic': 'sylvia',
  'architect': 'historian',
  'devops': 'devon',
  'priya': 'priya',
  'orchestrator': 'orchestrator',
  'feature-implementer': 'moss',
  'wiki-documentation-updater': 'wiki-updater',
  'unit-test-writer': 'test-writer',
  'integration-test-writer': 'test-writer',
  'architecture-skeptic': 'arch-skeptic',
  'llm-interface-optimizer': 'interface-optimizer',
  'nextjs-component-writer': 'component-writer',
  'sci-fi-tech-visionary': 'ray',
};

// ============================================
// Roadmap Parsing
// ============================================

function parseRoadmap(roadmapPath: string): QueueTask[] {
  const content = fs.readFileSync(roadmapPath, 'utf-8');
  const lines = content.split('\n');
  const tasks: QueueTask[] = [];

  let currentPriority: Priority | null = null;
  let currentTask: Partial<QueueTask> | null = null;
  let currentLineStart = 0;
  let inTaskBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect priority sections
    if (line.startsWith('### 🚨 CRITICAL Priority Items')) {
      currentPriority = 'CRITICAL';
      continue;
    } else if (line.startsWith('### 🟠 HIGH Priority Items')) {
      currentPriority = 'HIGH';
      continue;
    } else if (line.startsWith('### 🟡 MEDIUM Priority Items')) {
      currentPriority = 'MEDIUM';
      continue;
    } else if (line.startsWith('### 🔵 LOW Priority Items')) {
      currentPriority = 'LOW';
      continue;
    }

    // Detect task headers (bold item name with status)
    const taskHeaderMatch = line.match(/^\*\*([A-Z]+-\d+):\s+(.+?)\*\*/);
    if (taskHeaderMatch && currentPriority) {
      // Save previous task
      if (currentTask && currentTask.id) {
        tasks.push(finalizeTask(currentTask, currentLineStart, i - 1, roadmapPath));
      }

      // Start new task
      const [, id, title] = taskHeaderMatch;
      currentTask = {
        id,
        title: title.replace(/✅.*$/, '').trim(), // Remove status emojis
        priority: currentPriority,
        dependencies: [],
        status: 'available',
        claimedBy: null,
        claimedAt: null,
      };
      currentLineStart = i;
      inTaskBlock = true;
      continue;
    }

    // Parse task details
    if (inTaskBlock && currentTask) {
      // Check for completion markers
      if (line.includes('✅ RESOLVED') || line.includes('✅ COMPLETE') || line.includes('✅ CLOSED')) {
        currentTask.status = 'completed';
      }

      // Parse assignee
      const assigneeMatch = line.match(/- \*\*Assignee:\*\*\s+(.+?)(?:\s+\+|$)/);
      if (assigneeMatch) {
        const assignee = assigneeMatch[1].trim();
        currentTask.assignee = assignee;
        currentTask.agentId = AGENT_PERSONALITY_MAP[assignee] || 'autonomous-worker';
      }

      // Parse effort
      const effortMatch = line.match(/- \*\*Effort:\*\*\s+(.+)/);
      if (effortMatch) {
        currentTask.effort = effortMatch[1].trim();
      }

      // Parse dependencies
      const depsMatch = line.match(/- \*\*Dependencies:\*\*\s+(.+)/);
      if (depsMatch) {
        const depsText = depsMatch[1];
        if (depsText !== 'None' && depsText !== 'Unblocks') {
          currentTask.dependencies = depsText.split(',').map((d) => d.trim());
        }
      }

      // Accumulate description
      if (!currentTask.description) {
        currentTask.description = '';
      }
      currentTask.description += line + '\n';
    }

    // End of task block (next section or end of file)
    if (line.startsWith('##') && inTaskBlock && currentTask) {
      tasks.push(finalizeTask(currentTask, currentLineStart, i - 1, roadmapPath));
      currentTask = null;
      inTaskBlock = false;
    }
  }

  // Save final task
  if (currentTask && currentTask.id) {
    tasks.push(finalizeTask(currentTask, currentLineStart, lines.length - 1, roadmapPath));
  }

  return tasks;
}

function finalizeTask(
  task: Partial<QueueTask>,
  startLine: number,
  endLine: number,
  roadmapPath: string
): QueueTask {
  return {
    id: task.id || 'UNKNOWN',
    priority: task.priority || 'LOW',
    title: task.title || 'Untitled Task',
    assignee: task.assignee || 'unassigned',
    agentId: task.agentId || 'autonomous-worker',
    effort: task.effort || 'Unknown',
    dependencies: task.dependencies || [],
    status: task.status || 'available',
    claimedBy: task.claimedBy || null,
    claimedAt: task.claimedAt || null,
    description: (task.description || '').trim(),
    location: `${roadmapPath}:${startLine + 1}-${endLine + 1}`,
  };
}

// ============================================
// Queue Generation
// ============================================

function generateQueue(): Queue {
  const roadmapPath = path.join(process.cwd(), 'plans/MASTER_IMPLEMENTATION_ROADMAP.md');

  if (!fs.existsSync(roadmapPath)) {
    console.error(`❌ ERROR: Roadmap not found at ${roadmapPath}`);
    process.exit(1);
  }

  const allTasks = parseRoadmap(roadmapPath);

  // Filter out completed tasks
  const availableTasks = allTasks.filter((t) => t.status !== 'completed');

  const queue: Queue = {
    version: '1.0',
    generated: new Date().toISOString(),
    tasks: availableTasks,
  };

  return queue;
}

// ============================================
// Main
// ============================================

function main() {
  console.log('📋 Generating Autonomous Worker Priority Queue...\n');

  const queue = generateQueue();

  const outputPath = path.join(process.cwd(), 'plans/AUTONOMOUS_WORKER_QUEUE.json');
  fs.writeFileSync(outputPath, JSON.stringify(queue, null, 2), 'utf-8');

  console.log(`✅ Queue generated: ${outputPath}`);
  console.log(`\n📊 Summary:`);
  console.log(`   Total tasks: ${queue.tasks.length}`);

  const byCriticality = {
    CRITICAL: queue.tasks.filter((t) => t.priority === 'CRITICAL').length,
    HIGH: queue.tasks.filter((t) => t.priority === 'HIGH').length,
    MEDIUM: queue.tasks.filter((t) => t.priority === 'MEDIUM').length,
    LOW: queue.tasks.filter((t) => t.priority === 'LOW').length,
  };

  console.log(`   CRITICAL: ${byCriticality.CRITICAL}`);
  console.log(`   HIGH: ${byCriticality.HIGH}`);
  console.log(`   MEDIUM: ${byCriticality.MEDIUM}`);
  console.log(`   LOW: ${byCriticality.LOW}`);

  const byStatus = {
    available: queue.tasks.filter((t) => t.status === 'available').length,
    claimed: queue.tasks.filter((t) => t.status === 'claimed').length,
    blocked: queue.tasks.filter((t) => t.status === 'blocked').length,
  };

  console.log(`\n   Available: ${byStatus.available}`);
  console.log(`   Claimed: ${byStatus.claimed}`);
  console.log(`   Blocked: ${byStatus.blocked}`);

  console.log(`\n🚀 Ready for workers to claim tasks!`);
}

main();
