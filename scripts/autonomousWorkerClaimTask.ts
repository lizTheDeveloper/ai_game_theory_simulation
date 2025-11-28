#!/usr/bin/env npx tsx
/**
 * Atomically claim a task from the queue
 *
 * Usage:
 *   npx tsx scripts/autonomousWorkerClaimTask.ts --id HIGH-3 --worker worker-123
 *
 * Exit codes:
 *   0: Success
 *   1: Task not found or already claimed
 *   2: Git push failed (race condition, retry)
 *
 * Created: 2025-11-28 (HIGH-3 implementation)
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface QueueTask {
  id: string;
  status: string;
  claimedBy: string | null;
  claimedAt: string | null;
  [key: string]: unknown;
}

interface Queue {
  version: string;
  generated: string;
  tasks: QueueTask[];
}

function main() {
  const args = process.argv.slice(2);
  const idIndex = args.indexOf('--id');
  const workerIndex = args.indexOf('--worker');

  if (idIndex === -1 || !args[idIndex + 1]) {
    console.error('❌ ERROR: --id required');
    process.exit(1);
  }

  const taskId = args[idIndex + 1];
  const workerId = workerIndex !== -1 && args[workerIndex + 1]
    ? args[workerIndex + 1]
    : `worker-${Date.now()}`;

  const queuePath = path.join(process.cwd(), 'plans/AUTONOMOUS_WORKER_QUEUE.json');

  if (!fs.existsSync(queuePath)) {
    console.error('❌ ERROR: Queue file not found');
    process.exit(1);
  }

  // Read queue
  const queue: Queue = JSON.parse(fs.readFileSync(queuePath, 'utf-8'));

  // Find task
  const task = queue.tasks.find((t) => t.id === taskId);
  if (!task) {
    console.error(`❌ ERROR: Task ${taskId} not found`);
    process.exit(1);
  }

  // Check if already claimed
  if (task.status === 'claimed') {
    console.error(`❌ ERROR: Task ${taskId} already claimed by ${task.claimedBy}`);
    process.exit(1);
  }

  // Claim task
  task.status = 'claimed';
  task.claimedBy = workerId;
  task.claimedAt = new Date().toISOString();

  // Write queue
  fs.writeFileSync(queuePath, JSON.stringify(queue, null, 2), 'utf-8');

  // Commit and push
  try {
    execSync(`git add ${queuePath}`, { stdio: 'inherit' });
    execSync(`git commit -m "chore(queue): Claim task ${taskId} (${workerId})"`, { stdio: 'inherit' });
    execSync('git push origin HEAD', { stdio: 'inherit' });
    console.log(`✅ Task ${taskId} claimed successfully`);
    process.exit(0);
  } catch (error) {
    console.error('⚠️ Git push failed (race condition?)');
    process.exit(2);
  }
}

main();
