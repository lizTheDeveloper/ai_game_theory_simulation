#!/usr/bin/env npx tsx
/**
 * Autonomous Worker Task Validation
 *
 * Validates a completed task by running its validation command and updating status.
 * Used after task completion to verify the work actually meets acceptance criteria.
 *
 * Usage:
 *   npx tsx scripts/autonomousWorkerValidateTask.ts <task-id>
 *
 * Examples:
 *   npx tsx scripts/autonomousWorkerValidateTask.ts CRITICAL-1
 *   npx tsx scripts/autonomousWorkerValidateTask.ts HIGH-2
 *
 * Exit codes:
 *   0: Validation passed
 *   1: Validation failed or error
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
    schemaVersion?: string;
  };
}

// ============================================
// Configuration
// ============================================

const QUEUE_FILE_PATH = path.resolve(process.cwd(), 'plans/AUTONOMOUS_WORKER_QUEUE.json');

// Parse CLI args
const args = process.argv.slice(2);

if (args.length < 1) {
  console.error('Usage: npx tsx scripts/autonomousWorkerValidateTask.ts <task-id>');
  console.error('');
  console.error('Examples:');
  console.error('  npx tsx scripts/autonomousWorkerValidateTask.ts CRITICAL-1');
  console.error('  npx tsx scripts/autonomousWorkerValidateTask.ts HIGH-2');
  process.exit(1);
}

const TASK_ID = args[0];

// ============================================
// Validation Logic
// ============================================

function validateTask(queueData: QueueFile, taskId: string): [QueueFile, boolean] {
  // Find task in queue
  const taskIndex = queueData.queue.findIndex(t => t.id === taskId);

  if (taskIndex === -1) {
    throw new Error(`Task ${taskId} not found in queue`);
  }

  const task = queueData.queue[taskIndex];

  console.log(`\n=== Validating Task: ${task.id} ===`);
  console.log(`   Title: ${task.title}`);
  console.log(`   Status: ${task.status}`);
  console.log('');

  // Check if task has validation command
  if (!task.validationCommand) {
    console.log('⚠️  Warning: No validation command specified for this task');
    console.log('   Task will be marked as PASSED (no validation required)');
    task.validationStatus = "PASSED";
    queueData.metadata.lastUpdated = new Date().toISOString();
    return [queueData, true];
  }

  console.log(`📋 Acceptance Criteria:`);
  if (task.acceptanceCriteria && task.acceptanceCriteria.length > 0) {
    task.acceptanceCriteria.forEach((criterion, i) => {
      console.log(`   ${i + 1}. ${criterion}`);
    });
  } else {
    console.log('   (None specified)');
  }
  console.log('');

  console.log(`🔧 Running validation command:`);
  console.log(`   ${task.validationCommand}`);
  console.log('');

  // Run validation command and capture output
  let validationPassed = false;
  let validationOutput = '';
  try {
    const output = execSync(task.validationCommand, {
      stdio: 'pipe',
      cwd: process.cwd(),
      encoding: 'utf-8'
    });
    validationPassed = true;
    validationOutput = output;
    console.log(output);
    console.log('');
    console.log('✅ Validation PASSED');
  } catch (error: any) {
    const stderr = error.stderr?.toString() || '';
    const stdout = error.stdout?.toString() || '';
    validationOutput = `Exit code: ${error.status}\n\nSTDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`;
    console.log(stdout);
    console.error(stderr);
    console.log('');
    console.log('❌ Validation FAILED');
    console.log(`   Exit code: ${error.status || 'unknown'}`);
  }

  // Update task validation status
  task.validationStatus = validationPassed ? "PASSED" : "FAILED";

  // Save validation output summary to progress
  if (!task.progress) {
    task.progress = {
      attempts: 0,
      lastWorkedBy: 'validation',
      lastWorkedAt: new Date().toISOString(),
      notes: []
    };
  }

  const summary = validationPassed
    ? 'All validation checks passed'
    : `Validation failed - ${validationOutput.substring(0, 200)}...`;

  task.progress.validationOutput = summary;

  queueData.metadata.lastUpdated = new Date().toISOString();

  return [queueData, validationPassed];
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

  // Validate task
  let updatedQueue: QueueFile;
  let validationPassed: boolean;
  try {
    [updatedQueue, validationPassed] = validateTask(queueData, TASK_ID);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ ERROR: ${error.message}`);
    } else {
      console.error(`❌ ERROR: Unknown error validating task`);
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

  // Exit with appropriate code
  console.log('');
  console.log('💡 Validation status updated in queue');
  console.log(`   Queue file: ${QUEUE_FILE_PATH}`);

  process.exit(validationPassed ? 0 : 1);
}

main();
