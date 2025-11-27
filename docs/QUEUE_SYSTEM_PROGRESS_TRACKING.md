# Queue System Progress Tracking

**Schema v2.1** - Progress-based task continuation

## Design Philosophy

**Workers keep going until done. Validation = "are you done yet?" not "pass/fail".**

The queue system models iterative work sessions, not binary success/failure. Tasks stay CLAIMED across multiple sessions until validation passes or worker explicitly abandons.

## Task States

- **AVAILABLE** - Ready to be claimed
- **CLAIMED** - Being worked on (can span multiple sessions)
- **COMPLETED** - Validation passed
- **ABANDONED** - Worker gave up explicitly
- **BLOCKED** - Dependencies not met

**No automatic FAILED status.** If validation fails, task stays CLAIMED with progress notes.

## Progress Schema

```typescript
interface TaskProgress {
  attempts: number;           // How many work sessions
  lastWorkedBy: string;       // Who worked on it last
  lastWorkedAt: string;       // When (ISO timestamp)
  notes: string[];            // What's been tried/done
  validationOutput?: string;  // Last validation result summary
}
```

## Example Flow

### Session 1: First Attempt
```bash
# Select task
npx tsx scripts/autonomousWorkerSelectTask.ts --worker-id=worker-01 > task.json

# Claim it
npx tsx scripts/autonomousWorkerClaimTask.ts CRITICAL-1 worker-01

# Work on it...
# (fix 3/5 issues)

# Update progress
npx tsx scripts/autonomousWorkerReleaseTask.ts CRITICAL-1 CLAIMED worker-01 \
  --update-progress "Fixed environmentalHealth NaN in 3/5 scenarios"

# Git commit
git add plans/AUTONOMOUS_WORKER_QUEUE.json
git commit -m "progress: CRITICAL-1 partial fix (3/5 scenarios)"
git push
```

### Session 2: Resume Work
```bash
# Resume same task
npx tsx scripts/autonomousWorkerSelectTask.ts --worker-id=worker-01 --resume

# Check what's been done
npx tsx scripts/autonomousWorkerGetProgress.ts CRITICAL-1

# Continue work...
# (fix 1 more issue)

# Update progress again
npx tsx scripts/autonomousWorkerReleaseTask.ts CRITICAL-1 CLAIMED worker-01 \
  --update-progress "Fixed 4/5 scenarios, debugging last edge case"

git add plans/AUTONOMOUS_WORKER_QUEUE.json
git commit -m "progress: CRITICAL-1 debugging final scenario"
git push
```

### Session 3: Completion
```bash
# Resume
npx tsx scripts/autonomousWorkerSelectTask.ts --worker-id=worker-01 --resume

# Fix last issue...

# Try to complete (triggers validation)
npx tsx scripts/autonomousWorkerReleaseTask.ts CRITICAL-1 COMPLETED worker-01

# If validation passes:
# ✅ Task marked COMPLETED
# If validation fails:
# ❌ Task stays CLAIMED, validation output saved to progress.validationOutput
```

## Script Usage

### Select Task
```bash
# Get highest priority available task
npx tsx scripts/autonomousWorkerSelectTask.ts --worker-id=worker-01

# Resume claimed task for this worker
npx tsx scripts/autonomousWorkerSelectTask.ts --worker-id=worker-01 --resume
```

### Claim Task
```bash
npx tsx scripts/autonomousWorkerClaimTask.ts <task-id> <worker-id>
```

### Update Progress
```bash
# Keep CLAIMED, add progress note
npx tsx scripts/autonomousWorkerReleaseTask.ts <task-id> CLAIMED <worker-id> \
  --update-progress "What I did this session"

# Complete (runs validation)
npx tsx scripts/autonomousWorkerReleaseTask.ts <task-id> COMPLETED <worker-id>

# Give up
npx tsx scripts/autonomousWorkerReleaseTask.ts <task-id> ABANDONED <worker-id> \
  --update-progress "Why I gave up"

# Reset to available
npx tsx scripts/autonomousWorkerReleaseTask.ts <task-id> AVAILABLE <worker-id>
```

### Check Progress
```bash
npx tsx scripts/autonomousWorkerGetProgress.ts <task-id>
```

Shows:
- How many attempts
- Who worked on it
- Progress notes
- Last validation output
- Acceptance criteria
- What to do next

### Validate Task
```bash
npx tsx scripts/autonomousWorkerValidateTask.ts <task-id>
```

Runs validation command, updates:
- `validationStatus`: "PASSED" | "FAILED"
- `progress.validationOutput`: Summary of what passed/failed

## Key Principles

1. **Progress is preserved** - Notes, attempts, validation output all saved
2. **No auto-fail** - Validation failure keeps task CLAIMED, doesn't mark FAILED
3. **Worker continuation** - Same worker can resume with full context
4. **Explicit abandonment** - Only ABANDONED if worker chooses to give up
5. **Git coordination** - Commit progress updates so other workers see state

## Migration Notes

**Breaking change from v2.0:**
- Old: Validation fail → auto-FAILED status
- New: Validation fail → stays CLAIMED, update progress

**Workers should:**
- Use `--resume` to continue their own CLAIMED tasks
- Update progress after each session
- Only mark COMPLETED when validation passes
- Use ABANDONED explicitly if giving up

## Schema Version

Current: **v2.1**

Changes from v2.0:
- Added `progress` field to Task interface
- Removed auto-FAILED logic on validation failure
- Added `--update-progress` flag to releaseTask
- Added `--resume` flag to selectTask
- Added `autonomousWorkerGetProgress.ts` script
