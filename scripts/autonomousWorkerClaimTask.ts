#!/usr/bin/env npx tsx
/**
 * Autonomous Worker Task Claim
 *
 * Atomically claims a task from the queue.
 * Must be followed by git commit + push for atomicity.
 *
 * Usage:
 *   npx tsx scripts/autonomousWorkerClaimTask.ts <task-id> <worker-id>
 *
 * Example:
 *   npx tsx scripts/autonomousWorkerClaimTask.ts CRITICAL-1 worker-vm-01
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
  console.error('Usage: npx tsx scripts/autonomousWorkerClaimTask.ts <task-id> <worker-id>');
  console.error('');
  console.error('Example:');
  console.error('  npx tsx scripts/autonomousWorkerClaimTask.ts CRITICAL-1 worker-vm-01');
  process.exit(1);
}

const TASK_ID = args[0];
const WORKER_ID = args[1];

// ============================================
// Task Claim Logic
// ============================================

function claimTask(queueData: QueueFile, taskId: string, workerId: string): QueueFile {
  // Find task in queue
  const taskIndex = queueData.queue.findIndex(t => t.id === taskId);

  if (taskIndex === -1) {
    throw new Error(`Task ${taskId} not found in queue`);
  }

  const task = queueData.queue[taskIndex];

  // Verify task is available
  if (task.status !== "AVAILABLE") {
    throw new Error(
      `Task ${taskId} is not available (status: ${task.status}, claimed by: ${task.claimedBy || 'N/A'})`
    );
  }

  // Claim task
  task.status = "CLAIMED";
  task.claimedBy = workerId;
  task.claimedAt = new Date().toISOString();

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

  // Claim task
  let updatedQueue: QueueFile;
  try {
    updatedQueue = claimTask(queueData, TASK_ID, WORKER_ID);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ ERROR: ${error.message}`);
    } else {
      console.error(`❌ ERROR: Unknown error claiming task`);
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
  const claimedTask = updatedQueue.queue.find(t => t.id === TASK_ID);
  console.log(`✅ Task claimed successfully`);
  console.log(`   Task: ${TASK_ID}`);
  console.log(`   Title: ${claimedTask?.title}`);
  console.log(`   Agent: ${claimedTask?.agentPersonality}`);
  console.log(`   Worker: ${WORKER_ID}`);
  console.log(`   Claimed at: ${claimedTask?.claimedAt}`);
  console.log('');
  console.log('⚠️  IMPORTANT: Commit and push this change to prevent other workers from claiming this task:');
  console.log(`   git add ${QUEUE_FILE_PATH}`);
  console.log(`   git commit -m "claim: ${WORKER_ID} claimed ${TASK_ID}"`);
  console.log(`   git push origin main`);
}

main();
