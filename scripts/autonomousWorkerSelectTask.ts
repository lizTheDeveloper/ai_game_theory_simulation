#!/usr/bin/env npx tsx
/**
 * Autonomous Worker Task Selection
 *
 * Selects highest-priority available task within worker's token budget.
 * Priority order: CRITICAL > HIGH > MEDIUM > LOW
 * Infrastructure tasks (devops) get special priority boost when no CRITICAL blockers.
 *
 * Usage:
 *   npx tsx scripts/autonomousWorkerSelectTask.ts [--token-budget=200000]
 *
 * Returns: JSON task object or empty output if no tasks available
 */

import fs from 'fs';
import path from 'path';

// ============================================
// Types
// ============================================

type Priority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
type Status = "AVAILABLE" | "CLAIMED" | "BLOCKED" | "COMPLETED" | "ABANDONED";

interface TaskProgress {
  attempts: number;
  lastWorkedBy: string;
  lastWorkedAt: string;
  notes: string[];
  validationOutput?: string;
}

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
  progress?: TaskProgress;
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

const DEFAULT_TOKEN_BUDGET = 200000;
const QUEUE_FILE_PATH = path.resolve(process.cwd(), 'plans/AUTONOMOUS_WORKER_QUEUE.json');

// Parse CLI args
const args = process.argv.slice(2);
const tokenBudgetArg = args.find(arg => arg.startsWith('--token-budget='));
const resumeArg = args.includes('--resume');
const workerIdArg = args.find(arg => arg.startsWith('--worker-id='));
const WORKER_ID = workerIdArg ? workerIdArg.split('=')[1] : 'unknown';
const TOKEN_BUDGET = tokenBudgetArg
  ? parseInt(tokenBudgetArg.split('=')[1], 10)
  : DEFAULT_TOKEN_BUDGET;

// ============================================
// Task Selection Logic
// ============================================

function selectTask(queue: Task[], workerTokenBudget: number, workerId: string, resume: boolean): Task | null {
  // 1. If --resume, check for CLAIMED tasks by this worker first
  if (resume) {
    const myClaimed = queue.filter(t =>
      t.status === "CLAIMED" &&
      t.claimedBy === workerId
    );

    if (myClaimed.length > 0) {
      const task = myClaimed[0];
      console.error(`\n📋 Resuming task: ${task.id}`);
      if (task.progress) {
        console.error(`   Attempts: ${task.progress.attempts}`);
        console.error(`   Last worked: ${task.progress.lastWorkedAt}`);
        console.error(`   Notes: ${task.progress.notes.length} recorded`);
        if (task.progress.validationOutput) {
          console.error(`   Last validation: ${task.progress.validationOutput.substring(0, 100)}...`);
        }
      }
      return task;
    }
  }

  // 2. Filter to AVAILABLE tasks only
  const available = queue.filter(t => t.status === "AVAILABLE");

  if (available.length === 0) {
    return null;
  }

  // 2. Filter out tasks blocked by dependencies
  const unblocked = available.filter(t => t.blockedBy.length === 0);

  if (unblocked.length === 0) {
    return null;
  }

  // 3. Filter to tasks that fit within token budget
  const affordable = unblocked.filter(t => t.estimatedTokens <= workerTokenBudget);

  if (affordable.length === 0) {
    return null;
  }

  // 4. SPECIAL CASE: Infrastructure tasks (devops) get priority boost
  // Infrastructure work unblocks other agents - it's a force multiplier
  const criticalTasks = affordable.filter(t => t.priority === "CRITICAL");
  const infrastructureTasks = affordable.filter(t =>
    t.assignedAgent === "devops" && t.priority === "HIGH"
  );

  // If no CRITICAL blockers, infrastructure gets priority
  if (criticalTasks.length === 0 && infrastructureTasks.length > 0) {
    return infrastructureTasks[0];
  }

  // 5. Sort by priority (CRITICAL > HIGH > MEDIUM > LOW)
  const priorityOrder: Record<Priority, number> = {
    CRITICAL: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3
  };

  const sorted = affordable.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];

    // If same priority, prefer older tasks (FIFO within priority level)
    if (priorityDiff === 0) {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }

    return priorityDiff;
  });

  // 6. Return highest priority task
  return sorted[0] || null;
}

// ============================================
// Main Execution
// ============================================

function main(): void {
  // Check if queue file exists
  if (!fs.existsSync(QUEUE_FILE_PATH)) {
    console.error(`❌ ERROR: Queue file not found at ${QUEUE_FILE_PATH}`);
    process.exit(1);
  }

  // Read queue file
  let queueData: QueueFile;
  try {
    const fileContent = fs.readFileSync(QUEUE_FILE_PATH, 'utf-8');
    queueData = JSON.parse(fileContent);
  } catch (error) {
    console.error(`❌ ERROR: Failed to parse queue file: ${error}`);
    process.exit(1);
  }

  // Select task
  const selectedTask = selectTask(queueData.queue, TOKEN_BUDGET, WORKER_ID, resumeArg);

  if (!selectedTask) {
    // No tasks available - this is NOT an error condition
    // Worker should exit gracefully when no work is available
    console.error('⏸️  No tasks available within token budget');
    console.error(`   Token budget: ${TOKEN_BUDGET.toLocaleString()}`);
    console.error(`   Available tasks: ${queueData.queue.filter(t => t.status === "AVAILABLE").length}`);
    console.error(`   Affordable tasks: ${queueData.queue.filter(t => t.status === "AVAILABLE" && t.estimatedTokens <= TOKEN_BUDGET).length}`);
    if (resumeArg) {
      console.error(`   No CLAIMED tasks for worker: ${WORKER_ID}`);
    }
    process.exit(0);
  }

  // Output selected task as JSON (stdout)
  console.log(JSON.stringify(selectedTask, null, 2));
}

main();
