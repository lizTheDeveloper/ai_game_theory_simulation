#!/usr/bin/env npx tsx
/**
 * Release a claimed task (if worker crashed)
 *
 * Only allows release if claim is >2 hours old (prevent stealing active work)
 *
 * Usage:
 *   npx tsx scripts/autonomousWorkerReleaseTask.ts --id HIGH-3
 *   npx tsx scripts/autonomousWorkerReleaseTask.ts --id HIGH-3 --force  # Skip time check
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
  const force = args.includes('--force');

  if (idIndex === -1 || !args[idIndex + 1]) {
    console.error('❌ ERROR: --id required');
    process.exit(1);
  }

  const taskId = args[idIndex + 1];
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

  // Check if claimed
  if (task.status !== 'claimed') {
    console.error(`❌ ERROR: Task ${taskId} is not claimed (status: ${task.status})`);
    process.exit(1);
  }

  // Check claim age (prevent stealing active work)
  if (!force && task.claimedAt) {
    const claimTime = new Date(task.claimedAt).getTime();
    const now = Date.now();
    const ageHours = (now - claimTime) / (1000 * 60 * 60);

    if (ageHours < 2) {
      console.error(
        `❌ ERROR: Task ${taskId} claimed only ${ageHours.toFixed(1)}h ago. Wait 2h or use --force.`
      );
      process.exit(1);
    }
  }

  // Release task
  task.status = 'available';
  task.claimedBy = null;
  task.claimedAt = null;

  // Write queue
  fs.writeFileSync(queuePath, JSON.stringify(queue, null, 2), 'utf-8');

  // Commit and push
  try {
    execSync(`git add ${queuePath}`, { stdio: 'inherit' });
    execSync(`git commit -m "chore(queue): Release task ${taskId}"`, { stdio: 'inherit' });
    execSync('git push origin HEAD', { stdio: 'inherit' });
    console.log(`✅ Task ${taskId} released`);
    process.exit(0);
  } catch (error) {
    console.error('⚠️ Git push failed');
    process.exit(1);
  }
}

main();
