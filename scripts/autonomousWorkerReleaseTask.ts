#!/usr/bin/env npx tsx
/**
 * Autonomous Worker Task Release
 *
 * Releases a claimed task back to AVAILABLE status or marks it COMPLETED.
 * Used when worker completes/abandons a task.
 *
 * Usage:
 *   npx tsx scripts/autonomousWorkerReleaseTask.ts <task-id> <status> [worker-id]
 *
 * Status options: COMPLETED, ABANDONED, AVAILABLE
 *
 * Examples:
 *   npx tsx scripts/autonomousWorkerReleaseTask.ts CRITICAL-1 COMPLETED worker-vm-01
 *   npx tsx scripts/autonomousWorkerReleaseTask.ts HIGH-3 ABANDONED worker-vm-01
 *
 * Returns: 0 on success, 1 on error
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
  completedAt?: string;
  completedBy?: string;
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

const QUEUE_FILE_PATH = path.resolve(process.cwd(), 'plans/AUTONOMOUS_WORKER_QUEUE.json');

// Parse CLI args
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Usage: npx tsx scripts/autonomousWorkerReleaseTask.ts <task-id> <status> [worker-id]');
  console.error('');
  console.error('Status options: COMPLETED, ABANDONED, AVAILABLE');
  console.error('');
  console.error('Examples:');
  console.error('  npx tsx scripts/autonomousWorkerReleaseTask.ts CRITICAL-1 COMPLETED worker-vm-01');
  console.error('  npx tsx scripts/autonomousWorkerReleaseTask.ts HIGH-3 ABANDONED worker-vm-01');
  process.exit(1);
}

const TASK_ID = args[0];
const NEW_STATUS = args[1].toUpperCase() as Status;
const WORKER_ID = args[2] || 'unknown';

// Validate status
const VALID_STATUSES: Status[] = ["COMPLETED", "ABANDONED", "AVAILABLE"];
if (!VALID_STATUSES.includes(NEW_STATUS)) {
  console.error(`❌ ERROR: Invalid status "${NEW_STATUS}"`);
  console.error(`   Valid statuses: ${VALID_STATUSES.join(', ')}`);
  process.exit(1);
}

// ============================================
// Task Release Logic
// ============================================

function releaseTask(queueData: QueueFile, taskId: string, newStatus: Status, workerId: string): QueueFile {
  // Find task in queue
  const taskIndex = queueData.queue.findIndex(t => t.id === taskId);

  if (taskIndex === -1) {
    throw new Error(`Task ${taskId} not found in queue`);
  }

  const task = queueData.queue[taskIndex];

  // Update task status
  task.status = newStatus;

  // If completing, record completion metadata
  if (newStatus === "COMPLETED") {
    task.completedAt = new Date().toISOString();
    task.completedBy = workerId;
  }

  // If returning to AVAILABLE (abandon or manual reset), clear claim info
  if (newStatus === "AVAILABLE" || newStatus === "ABANDONED") {
    task.claimedBy = null;
    task.claimedAt = null;
  }

  // Update metadata
  queueData.metadata.lastUpdated = new Date().toISOString();

  return queueData;
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

  // Release task
  let updatedQueue: QueueFile;
  try {
    updatedQueue = releaseTask(queueData, TASK_ID, NEW_STATUS, WORKER_ID);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ ERROR: ${error.message}`);
    } else {
      console.error(`❌ ERROR: Unknown error releasing task`);
    }
    process.exit(1);
  }

  // Write queue back to file
  try {
    fs.writeFileSync(
      QUEUE_FILE_PATH,
      JSON.stringify(updatedQueue, null, 2) + '\n'
    );
  } catch (error) {
    console.error(`❌ ERROR: Failed to write queue file: ${error}`);
    process.exit(1);
  }

  // Success
  const releasedTask = updatedQueue.queue.find(t => t.id === TASK_ID);
  console.log(`✅ Task status updated successfully`);
  console.log(`   Task: ${TASK_ID}`);
  console.log(`   Title: ${releasedTask?.title}`);
  console.log(`   New Status: ${NEW_STATUS}`);
  console.log(`   Worker: ${WORKER_ID}`);

  if (NEW_STATUS === "COMPLETED") {
    console.log('');
    console.log('💡 Next steps:');
    console.log('   1. Commit this status change');
    console.log('   2. Architect will archive to /plans/completed/ during cleanup');
  } else if (NEW_STATUS === "AVAILABLE" || NEW_STATUS === "ABANDONED") {
    console.log('');
    console.log('💡 Task returned to queue - another worker can claim it');
  }
}

main();
