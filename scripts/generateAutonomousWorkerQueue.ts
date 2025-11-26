#!/usr/bin/env npx tsx
/**
 * Autonomous Worker Queue Generation
 *
 * Extracts tasks from MASTER_IMPLEMENTATION_ROADMAP.md and generates
 * AUTONOMOUS_WORKER_QUEUE.json with priority-sorted tasks.
 *
 * Usage:
 *   npx tsx scripts/generateAutonomousWorkerQueue.ts [--preserve-claims]
 *
 * Options:
 *   --preserve-claims  Keep existing CLAIMED tasks instead of resetting to AVAILABLE
 *
 * Reads from: plans/MASTER_IMPLEMENTATION_ROADMAP.md
 * Writes to:  plans/AUTONOMOUS_WORKER_QUEUE.json
 */

import fs from 'fs';
import path from 'path';

// ============================================
// Types
// ============================================

type Priority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
type Status = "AVAILABLE" | "CLAIMED" | "BLOCKED" | "COMPLETED" | "ABANDONED";

interface Task {
  id: string;
  priority: Priority;
  title: string;
  assignedAgent: string;
  agentPersonality: string;
  status: Status;
  complexity: number;
  estimatedTokens: number;
  dependencies: string[];
  blockedBy: string[];
  roadmapSection: string;
  createdAt: string;
  claimedBy: string | null;
  claimedAt: string | null;
  description?: string;
}

interface QueueFile {
  queue: Task[];
  metadata: {
    lastUpdated: string;
    version: string;
    generatedFrom: string;
  };
}

// ============================================
// Configuration
// ============================================

const ROADMAP_PATH = path.resolve(process.cwd(), 'plans/MASTER_IMPLEMENTATION_ROADMAP.md');
const QUEUE_PATH = path.resolve(process.cwd(), 'plans/AUTONOMOUS_WORKER_QUEUE.json');

const args = process.argv.slice(2);
const PRESERVE_CLAIMS = args.includes('--preserve-claims');

// Agent assignee → personality mapping
const AGENT_MAPPING: Record<string, string> = {
  'simulation-maintainer': 'roy',
  'devops': 'devon',
  'super-alignment-researcher': 'cynthia',
  'research-skeptic': 'sylvia',
  'feature-implementer': 'moss',
  'far-future-ux-designer': 'tessa',
  'wiki-documentation-updater': 'historian',
  'architect': 'architect',
  'architecture-skeptic': 'sylvia',
  'orchestrator': 'orchestrator',
};

// ============================================
// Parsing Logic
// ============================================

interface RoadmapItem {
  id: string;
  priority: Priority;
  title: string;
  assignee: string;
  complexity: number;
  description: string;
  section: string;
}

function extractRoadmapItems(markdown: string): RoadmapItem[] {
  const items: RoadmapItem[] = [];
  const lines = markdown.split('\n');

  let currentSection = 'Unknown';
  let currentItem: Partial<RoadmapItem> | null = null;
  let descriptionLines: string[] = [];

  const itemPattern = /^\*\*((CRITICAL|HIGH|MEDIUM|LOW)-\d+):\s*(.+?)\*\*/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Track section headers
    if (line.startsWith('## ') || line.startsWith('### ')) {
      currentSection = line.replace(/^#+\s*/, '').trim();
    }

    // Match task items
    const match = line.match(itemPattern);
    if (match) {
      // Save previous item if exists
      if (currentItem && currentItem.id) {
        items.push({
          ...currentItem,
          description: descriptionLines.join(' ').trim(),
        } as RoadmapItem);
      }

      // Start new item
      const [, id, priority, title] = match;
      currentItem = {
        id,
        priority: priority as Priority,
        title: title.replace(/❌|✅|⏳|⚠️/g, '').trim(),
        assignee: 'unknown',
        complexity: 2,
        description: '',
        section: currentSection,
      };
      descriptionLines = [];
    } else if (currentItem) {
      // Extract metadata from bullet points
      if (line.includes('**Assignee:**')) {
        const assigneeMatch = line.match(/\*\*Assignee:\*\*\s*([a-z-]+)/);
        if (assigneeMatch) {
          currentItem.assignee = assigneeMatch[1];
        }
      }

      if (line.includes('**Complexity:**')) {
        const complexityMatch = line.match(/\*\*Complexity:\*\*\s*(\d+)/);
        if (complexityMatch) {
          currentItem.complexity = parseInt(complexityMatch[1], 10);
        }
      }

      // Collect description lines (non-metadata bullets)
      if (line.startsWith('- ') && !line.includes('**Assignee:**') && !line.includes('**Complexity:**')) {
        descriptionLines.push(line.replace(/^-\s*/, '').trim());
      }
    }
  }

  // Save last item
  if (currentItem && currentItem.id) {
    items.push({
      ...currentItem,
      description: descriptionLines.join(' ').trim(),
    } as RoadmapItem);
  }

  return items;
}

function estimateTokens(complexity: number): number {
  // Rough heuristic: complexity 1-5 maps to token budgets
  // Complexity 1: Simple fix (15k tokens)
  // Complexity 2: Moderate task (25k tokens)
  // Complexity 3: Complex feature (35k tokens)
  // Complexity 4: Multi-system integration (50k tokens)
  // Complexity 5: Major refactor (75k tokens)

  const tokenMap: Record<number, number> = {
    1: 15000,
    2: 25000,
    3: 35000,
    4: 50000,
    5: 75000,
  };

  return tokenMap[complexity] || 25000;
}

function roadmapItemToTask(item: RoadmapItem, existingTask?: Task): Task {
  const agentPersonality = AGENT_MAPPING[item.assignee] || 'orchestrator';

  // Preserve claim info if exists and --preserve-claims flag is set
  const shouldPreserveClaim = PRESERVE_CLAIMS && existingTask?.status === 'CLAIMED';

  return {
    id: item.id,
    priority: item.priority,
    title: item.title,
    assignedAgent: item.assignee,
    agentPersonality,
    status: shouldPreserveClaim ? 'CLAIMED' : 'AVAILABLE',
    complexity: item.complexity,
    estimatedTokens: estimateTokens(item.complexity),
    dependencies: [],
    blockedBy: [],
    roadmapSection: item.section,
    createdAt: existingTask?.createdAt || new Date().toISOString(),
    claimedBy: shouldPreserveClaim ? existingTask?.claimedBy || null : null,
    claimedAt: shouldPreserveClaim ? existingTask?.claimedAt || null : null,
    description: item.description,
  };
}

// ============================================
// Main Execution
// ============================================

function main(): void {
  console.log('🔄 Generating autonomous worker queue...');
  console.log('');

  // Check if roadmap exists
  if (!fs.existsSync(ROADMAP_PATH)) {
    console.error(`❌ ERROR: Roadmap not found at ${ROADMAP_PATH}`);
    process.exit(1);
  }

  // Read roadmap
  const roadmapContent = fs.readFileSync(ROADMAP_PATH, 'utf-8');

  // Parse roadmap items
  console.log('📋 Parsing roadmap items...');
  const roadmapItems = extractRoadmapItems(roadmapContent);
  console.log(`   Found ${roadmapItems.length} items`);

  // Load existing queue (if exists) to preserve claims
  let existingQueue: QueueFile | null = null;
  if (fs.existsSync(QUEUE_PATH)) {
    try {
      const existingContent = fs.readFileSync(QUEUE_PATH, 'utf-8');
      existingQueue = JSON.parse(existingContent);
      console.log(`   Loaded existing queue (${existingQueue.queue.length} tasks)`);
      if (PRESERVE_CLAIMS) {
        const claimedCount = existingQueue.queue.filter(t => t.status === 'CLAIMED').length;
        console.log(`   Preserving ${claimedCount} claimed tasks`);
      }
    } catch (error) {
      console.warn(`⚠️  Warning: Could not load existing queue: ${error}`);
    }
  }

  // Convert to tasks
  const tasks: Task[] = roadmapItems.map(item => {
    const existingTask = existingQueue?.queue.find(t => t.id === item.id);
    return roadmapItemToTask(item, existingTask);
  });

  // Filter to actionable tasks only (exclude completed items from roadmap)
  const actionableTasks = tasks.filter(t =>
    !t.title.toLowerCase().includes('complete') &&
    !t.title.toLowerCase().includes('resolved')
  );

  console.log(`   Generated ${actionableTasks.length} actionable tasks`);

  // Create queue file
  const queueData: QueueFile = {
    queue: actionableTasks,
    metadata: {
      lastUpdated: new Date().toISOString(),
      version: '1.0.0',
      generatedFrom: 'MASTER_IMPLEMENTATION_ROADMAP.md',
    },
  };

  // Write queue file
  fs.writeFileSync(
    QUEUE_PATH,
    JSON.stringify(queueData, null, 2) + '\n'
  );

  console.log('');
  console.log(`✅ Queue generated successfully: ${QUEUE_PATH}`);
  console.log('');
  console.log('📊 Priority breakdown:');
  const priorityCounts = actionableTasks.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    return acc;
  }, {} as Record<Priority, number>);

  ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].forEach(priority => {
    const count = priorityCounts[priority as Priority] || 0;
    if (count > 0) {
      console.log(`   ${priority}: ${count} tasks`);
    }
  });

  console.log('');
  console.log('💡 Next steps:');
  console.log('   1. Review queue: cat plans/AUTONOMOUS_WORKER_QUEUE.json');
  console.log('   2. Test task selection: npx tsx scripts/autonomousWorkerSelectTask.ts');
  console.log('   3. Commit queue: git add plans/AUTONOMOUS_WORKER_QUEUE.json && git commit -m "chore: Regenerate worker queue"');
}

main();
