#!/usr/bin/env npx tsx
/**
 * Select Task from Autonomous Worker Priority Queue
 *
 * Filters available tasks by token budget and returns highest priority task.
 *
 * Usage:
 *   npx tsx scripts/autonomousWorkerSelectTask.ts --budget 50000
 *   npx tsx scripts/autonomousWorkerSelectTask.ts  # No budget filter
 *
 * Returns:
 *   JSON task object or "null" if no tasks available
 *
 * Created: 2025-11-28 (HIGH-3 implementation)
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================
// Types
// ============================================

type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

interface QueueTask {
  id: string;
  priority: Priority;
  title: string;
  assignee: string;
  agentId: string;
  effort: string;
  dependencies: string[];
  status: string;
  claimedBy: string | null;
  claimedAt: string | null;
  description: string;
  location: string;
}

interface Queue {
  version: string;
  generated: string;
  tasks: QueueTask[];
}

// ============================================
// Priority Calculation
// ============================================

const PRIORITY_SCORES: Record<Priority, number> = {
  CRITICAL: 1000,
  HIGH: 500,
  MEDIUM: 100,
  LOW: 10,
};

function calculateEffectivePriority(task: QueueTask, queue: Queue): number {
  let score = PRIORITY_SCORES[task.priority];

  // Infrastructure boost when no CRITICAL blockers
  const hasCriticalBlockers = queue.tasks.some(
    (t) => t.priority === 'CRITICAL' && t.status === 'available'
  );

  if (!hasCriticalBlockers && task.assignee === 'devops') {
    score += 200; // Boosts HIGH infrastructure above MEDIUM work
  }

  return score;
}

// ============================================
// Effort Parsing
// ============================================

function parseEffortHours(effort: string): number {
  // Parse "2-4 hours", "2-3 days", etc.
  const hoursMatch = effort.match(/(\d+)-(\d+)\s*hours?/i);
  if (hoursMatch) {
    const [, min, max] = hoursMatch;
    return (parseInt(min) + parseInt(max)) / 2;
  }

  const daysMatch = effort.match(/(\d+)-(\d+)\s*days?/i);
  if (daysMatch) {
    const [, min, max] = daysMatch;
    return ((parseInt(min) + parseInt(max)) / 2) * 8; // 8 hours per day
  }

  return Infinity; // Unknown effort, assume large
}

// ============================================
// Task Selection
// ============================================

function selectTask(queue: Queue, budgetTokens?: number): QueueTask | null {
  // Filter available tasks
  const available = queue.tasks.filter(
    (t) => t.status === 'available' && t.dependencies.length === 0
  );

  if (available.length === 0) {
    return null;
  }

  // Filter by token budget (if provided)
  let candidates = available;
  if (budgetTokens) {
    // Rough heuristic: 1 hour ≈ 25,000 tokens
    const maxHours = budgetTokens / 25000;
    candidates = available.filter((t) => parseEffortHours(t.effort) <= maxHours);

    // If no tasks fit budget, return smallest task anyway
    if (candidates.length === 0) {
      candidates = available.sort((a, b) => parseEffortHours(a.effort) - parseEffortHours(b.effort));
      candidates = [candidates[0]];
    }
  }

  // Sort by effective priority
  candidates.sort((a, b) => {
    const scoreA = calculateEffectivePriority(a, queue);
    const scoreB = calculateEffectivePriority(b, queue);
    return scoreB - scoreA; // Descending
  });

  return candidates[0];
}

// ============================================
// Main
// ============================================

function main() {
  const args = process.argv.slice(2);
  let budgetTokens: number | undefined;

  // Parse --budget argument
  const budgetIndex = args.indexOf('--budget');
  if (budgetIndex !== -1 && args[budgetIndex + 1]) {
    budgetTokens = parseInt(args[budgetIndex + 1]);
  }

  const queuePath = path.join(process.cwd(), 'plans/AUTONOMOUS_WORKER_QUEUE.json');

  if (!fs.existsSync(queuePath)) {
    console.error('null');
    process.exit(1);
  }

  const queue: Queue = JSON.parse(fs.readFileSync(queuePath, 'utf-8'));
  const task = selectTask(queue, budgetTokens);

  if (task) {
    console.log(JSON.stringify(task, null, 2));
  } else {
    console.log('null');
  }
}

main();
