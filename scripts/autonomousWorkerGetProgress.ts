#!/usr/bin/env npx tsx
/**
 * Autonomous Worker Get Progress
 *
 * Shows current progress on a task - what's been tried, validation results, etc.
 * Helps workers understand where to continue from.
 *
 * Usage:
 *   npx tsx scripts/autonomousWorkerGetProgress.ts <task-id>
 *
 * Examples:
 *   npx tsx scripts/autonomousWorkerGetProgress.ts CRITICAL-1
 *   npx tsx scripts/autonomousWorkerGetProgress.ts HIGH-2
 *
 * Exit codes:
 *   0: Success
 *   1: Error (task not found, etc.)
 */

import fs from 'fs';
import path from 'path';

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
  console.error('Usage: npx tsx scripts/autonomousWorkerGetProgress.ts <task-id>');
  console.error('');
  console.error('Examples:');
  console.error('  npx tsx scripts/autonomousWorkerGetProgress.ts CRITICAL-1');
  console.error('  npx tsx scripts/autonomousWorkerGetProgress.ts HIGH-2');
  process.exit(1);
}

const TASK_ID = args[0];

// ============================================
// Progress Display Logic
// ============================================

function displayProgress(task: Task): void {
  console.log(`\n=== Task Progress: ${task.id} ===`);
  console.log(`   Title: ${task.title}`);
  console.log(`   Status: ${task.status}`);
  console.log(`   Priority: ${task.priority}`);
  console.log(`   Assigned: ${task.assignedAgent} (${task.agentPersonality})`);
  console.log('');

  if (task.claimedBy) {
    console.log(`   Claimed by: ${task.claimedBy}`);
    console.log(`   Claimed at: ${task.claimedAt}`);
    console.log('');
  }

  // Progress section
  if (task.progress) {
    console.log('📊 Progress Summary:');
    console.log(`   Attempts: ${task.progress.attempts}`);
    console.log(`   Last worked by: ${task.progress.lastWorkedBy}`);
    console.log(`   Last worked at: ${task.progress.lastWorkedAt}`);
    console.log('');

    if (task.progress.notes.length > 0) {
      console.log('📝 Progress Notes:');
      task.progress.notes.forEach((note, i) => {
        console.log(`   ${i + 1}. ${note}`);
      });
      console.log('');
    }

    if (task.progress.validationOutput) {
      console.log('🔍 Last Validation Result:');
      console.log(`   ${task.progress.validationOutput}`);
      console.log('');
    }
  } else {
    console.log('📊 No progress recorded yet (first attempt)');
    console.log('');
  }

  // Acceptance criteria
  if (task.acceptanceCriteria && task.acceptanceCriteria.length > 0) {
    console.log('✅ Acceptance Criteria:');
    task.acceptanceCriteria.forEach((criterion, i) => {
      console.log(`   ${i + 1}. ${criterion}`);
    });
    console.log('');
  }

  // Description
  if (task.description) {
    console.log('📋 Description:');
    console.log(`   ${task.description}`);
    console.log('');
  }

  // Validation command
  if (task.validationCommand) {
    console.log('🔧 Validation Command:');
    console.log(`   ${task.validationCommand}`);
    console.log('');
  }

  // Next steps
  console.log('💡 Next Steps:');
  if (task.status === "CLAIMED" && task.progress) {
    console.log('   1. Review progress notes above to see what\'s been tried');
    console.log('   2. Check validation output to understand what\'s still failing');
    console.log('   3. Continue work on remaining issues');
    console.log('   4. Update progress: autonomousWorkerReleaseTask.ts <id> CLAIMED <worker> --update-progress "note"');
  } else if (task.status === "CLAIMED") {
    console.log('   1. This is the first attempt - start fresh');
    console.log('   2. Work on acceptance criteria above');
    console.log('   3. Update progress as you go');
  } else if (task.status === "COMPLETED") {
    console.log('   ✅ Task completed - no further action needed');
  } else {
    console.log('   1. Claim task: autonomousWorkerClaimTask.ts <id> <worker>');
    console.log('   2. Begin work on acceptance criteria');
  }
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

  // Find task
  const task = queueData.queue.find(t => t.id === TASK_ID);

  if (!task) {
    console.error(`❌ ERROR: Task ${TASK_ID} not found in queue`);
    console.error('');
    console.error('Available tasks:');
    queueData.queue.forEach(t => {
      console.error(`  - ${t.id}: ${t.title}`);
    });
    process.exit(1);
  }

  // Display progress
  displayProgress(task);
}

main();
