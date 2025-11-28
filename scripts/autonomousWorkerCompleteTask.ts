#!/usr/bin/env npx tsx
/**
 * Mark a task as completed in the queue
 *
 * Usage:
 *   npx tsx scripts/autonomousWorkerCompleteTask.ts --id HIGH-3
 *
 * Created: 2025-11-28 (HIGH-3 implementation)
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface QueueTask {
  id: string;
  status: string;
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

  // Mark complete
  task.status = 'completed';

  // Write queue
  fs.writeFileSync(queuePath, JSON.stringify(queue, null, 2), 'utf-8');

  // Commit and push
  try {
    execSync(`git add ${queuePath}`, { stdio: 'inherit' });
    execSync(`git commit -m "chore(queue): Complete task ${taskId}"`, { stdio: 'inherit' });
    execSync('git push origin HEAD', { stdio: 'inherit' });
    console.log(`✅ Task ${taskId} marked complete`);
    process.exit(0);
  } catch (error) {
    console.error('⚠️ Git push failed');
    process.exit(1);
  }
}

main();
