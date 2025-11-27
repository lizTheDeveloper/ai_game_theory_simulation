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
import { execSync } from 'child_process';

// ============================================
// Types
// ============================================

type Priority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
type Status = "AVAILABLE" | "CLAIMED" | "BLOCKED" | "COMPLETED" | "ABANDONED";
type ValidationStatus = "PENDING" | "PASSED" | "FAILED" | null;

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
  acceptanceCriteria?: string[];
  validationCommand?: string;
  validationStatus?: ValidationStatus;
  completedAt?: string;
  completedBy?: string;
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

const QUEUE_FILE_PATH = path.resolve(process.cwd(), 'plans/AUTONOMOUS_WORKER_QUEUE.json');

// Parse CLI args
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Usage: npx tsx scripts/autonomousWorkerReleaseTask.ts <task-id> <status> [worker-id] [--update-progress "note"]');
  console.error('');
  console.error('Status options: COMPLETED, ABANDONED, AVAILABLE');
  console.error('');
  console.error('Examples:');
  console.error('  npx tsx scripts/autonomousWorkerReleaseTask.ts CRITICAL-1 COMPLETED worker-vm-01');
  console.error('  npx tsx scripts/autonomousWorkerReleaseTask.ts HIGH-3 ABANDONED worker-vm-01');
  console.error('  npx tsx scripts/autonomousWorkerReleaseTask.ts CRITICAL-1 CLAIMED worker-vm-01 --update-progress "Fixed 3/5 issues"');
  process.exit(1);
}

const TASK_ID = args[0];
const NEW_STATUS = args[1].toUpperCase() as Status;
const WORKER_ID = args[2] || 'unknown';

// Check for --update-progress flag
const progressNoteIndex = args.findIndex(arg => arg === '--update-progress');
const PROGRESS_NOTE = progressNoteIndex !== -1 && args[progressNoteIndex + 1]
  ? args[progressNoteIndex + 1]
  : null;

// Validate status
const VALID_STATUSES: Status[] = ["COMPLETED", "ABANDONED", "AVAILABLE", "CLAIMED"];
if (!VALID_STATUSES.includes(NEW_STATUS)) {
  console.error(`❌ ERROR: Invalid status "${NEW_STATUS}"`);
  console.error(`   Valid statuses: ${VALID_STATUSES.join(', ')}`);
  process.exit(1);
}

// ============================================
// Validation Logic
// ============================================

function runValidation(taskId: string): boolean {
  console.log('');
  console.log('🔍 Running validation...');

  try {
    execSync(`npx tsx scripts/autonomousWorkerValidateTask.ts ${taskId}`, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    return true;
  } catch (error) {
    return false;
  }
}

// ============================================
// Task Release Logic
// ============================================

function updateProgress(task: Task, workerId: string, note: string | null, validationOutput?: string): void {
  if (!task.progress) {
    task.progress = {
      attempts: 0,
      lastWorkedBy: workerId,
      lastWorkedAt: new Date().toISOString(),
      notes: []
    };
  }

  task.progress.attempts += 1;
  task.progress.lastWorkedBy = workerId;
  task.progress.lastWorkedAt = new Date().toISOString();

  if (note) {
    task.progress.notes.push(`[${new Date().toISOString()}] ${note}`);
  }

  if (validationOutput) {
    task.progress.validationOutput = validationOutput;
  }
}

function releaseTask(
  queueData: QueueFile,
  taskId: string,
  newStatus: Status,
  workerId: string,
  progressNote: string | null
): QueueFile {
  // Find task in queue
  const taskIndex = queueData.queue.findIndex(t => t.id === taskId);

  if (taskIndex === -1) {
    throw new Error(`Task ${taskId} not found in queue`);
  }

  const task = queueData.queue[taskIndex];

  // If completing, run validation first (if validation command exists)
  if (newStatus === "COMPLETED" && task.validationCommand) {
    console.log('');
    console.log('⚠️  Task has validation command - validation required before completion');

    const validationPassed = runValidation(taskId);

    // Reload queue file (validation updates it)
    const updatedContent = fs.readFileSync(QUEUE_FILE_PATH, 'utf-8');
    queueData = JSON.parse(updatedContent);
    const updatedTask = queueData.queue[taskIndex];

    if (!validationPassed) {
      console.log('');
      console.log('❌ Validation FAILED - task stays CLAIMED (not auto-failed)');
      console.log('💡 Worker should continue working or explicitly ABANDON');

      // Update progress with validation failure note
      updateProgress(
        updatedTask,
        workerId,
        progressNote || 'Validation failed - continuing work',
        'Validation failed - see output above'
      );

      updatedTask.status = "CLAIMED";  // Keep CLAIMED, don't auto-fail
      queueData.metadata.lastUpdated = new Date().toISOString();
      return queueData;
    }

    console.log('');
    console.log('✅ Validation PASSED - proceeding with completion');
  }

  // Update task status
  task.status = newStatus;

  // If completing, record completion metadata
  if (newStatus === "COMPLETED") {
    task.completedAt = new Date().toISOString();
    task.completedBy = workerId;
    updateProgress(task, workerId, progressNote || 'Task completed successfully');
  }

  // If staying CLAIMED (progress update), update progress
  if (newStatus === "CLAIMED") {
    updateProgress(task, workerId, progressNote || 'Continuing work');
  }

  // If returning to AVAILABLE (abandon or manual reset), clear claim info
  if (newStatus === "AVAILABLE" || newStatus === "ABANDONED") {
    if (newStatus === "ABANDONED") {
      updateProgress(task, workerId, progressNote || 'Worker abandoned task');
    }
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
    updatedQueue = releaseTask(queueData, TASK_ID, NEW_STATUS, WORKER_ID, PROGRESS_NOTE);
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

  if (releasedTask?.progress) {
    console.log(`   Progress: ${releasedTask.progress.attempts} attempt(s)`);
    console.log(`   Last worked: ${releasedTask.progress.lastWorkedAt}`);
    if (releasedTask.progress.notes.length > 0) {
      console.log(`   Latest note: ${releasedTask.progress.notes[releasedTask.progress.notes.length - 1]}`);
    }
  }

  if (NEW_STATUS === "COMPLETED") {
    console.log('');
    console.log('💡 Next steps:');
    console.log('   1. Commit this status change');
    console.log('   2. Architect will archive to /plans/completed/ during cleanup');
  } else if (NEW_STATUS === "CLAIMED") {
    console.log('');
    console.log('💡 Task still CLAIMED - worker can continue in next session');
    console.log('   Use --resume flag to continue this task');
  } else if (NEW_STATUS === "AVAILABLE" || NEW_STATUS === "ABANDONED") {
    console.log('');
    console.log('💡 Task returned to queue - another worker can claim it');
  }
}

main();
