# Queue System v2.1 - Progress Tracking Changelog

**Date:** 2025-11-26
**Schema:** 2.0 → 2.1
**Status:** Complete

## Problem Statement

The v2.0 queue system had a fundamental design flaw:

**Wrong model:** Validation fail → auto-FAILED status → task stuck
**Correct model:** Workers keep going until done. Validation = "are you done yet?" not "pass/fail"

When validation failed, tasks were automatically marked FAILED and couldn't continue. This broke the iterative work pattern where workers need multiple sessions to complete complex tasks.

## Solution

Add progress tracking to tasks and remove auto-FAILED logic. Tasks stay CLAIMED across sessions until validation passes or worker explicitly abandons.

## Changes

### 1. Schema Updates (`AUTONOMOUS_WORKER_QUEUE.json`)

**Added `TaskProgress` interface:**
```typescript
interface TaskProgress {
  attempts: number;           // How many work sessions
  lastWorkedBy: string;       // Who worked on it last
  lastWorkedAt: string;       // When (ISO timestamp)
  notes: string[];            // What's been tried/done
  validationOutput?: string;  // Last validation result summary
}
```

**Updated Task interface:**
```typescript
interface Task {
  // ... existing fields
  progress?: TaskProgress;  // NEW: Track work history
}
```

**Removed status:**
- `FAILED` (no longer used)

**Kept statuses:**
- `AVAILABLE` - Ready to claim
- `CLAIMED` - Being worked on (can span sessions)
- `COMPLETED` - Validation passed
- `ABANDONED` - Worker gave up
- `BLOCKED` - Dependencies unmet

### 2. Script Updates

#### `autonomousWorkerSelectTask.ts`
**New flags:**
- `--worker-id=<id>` - Identify which worker is selecting
- `--resume` - Resume CLAIMED task for this worker

**Behavior change:**
- With `--resume`, returns CLAIMED tasks for this worker first
- Shows progress context (attempts, notes, last validation) when resuming

#### `autonomousWorkerReleaseTask.ts`
**New flag:**
- `--update-progress "note"` - Add progress note

**New status option:**
- `CLAIMED` - Update progress without releasing

**Behavior changes:**
- Validation fail → stays CLAIMED (not auto-FAILED)
- Progress updated on every status change
- Validation output saved to `progress.validationOutput`

**Removed:**
- Auto-FAILED logic on validation failure

#### `autonomousWorkerValidateTask.ts`
**Behavior changes:**
- Captures validation output (stdout/stderr)
- Saves summary to `progress.validationOutput`
- Still updates `validationStatus` ("PASSED" | "FAILED")

#### `autonomousWorkerGetProgress.ts` (NEW)
**Purpose:** Show task progress history

**Displays:**
- How many attempts
- Who worked on it
- Progress notes (timestamped)
- Last validation output
- Acceptance criteria
- What to do next

**Usage:**
```bash
npx tsx scripts/autonomousWorkerGetProgress.ts <task-id>
```

### 3. Workflow Changes

#### Before (v2.0):
```
Worker claims task
  → works on it
  → tries to complete
  → validation fails
  → auto-FAILED status
  → STUCK (can't continue)
```

#### After (v2.1):
```
Session 1:
  Worker claims task
    → works on it (fixes 3/5 issues)
    → updates progress
    → task stays CLAIMED

Session 2:
  Worker resumes task (--resume flag)
    → sees progress notes
    → continues work (fixes 1 more issue)
    → updates progress again
    → task stays CLAIMED

Session 3:
  Worker resumes task
    → fixes last issue
    → tries to complete
    → validation passes
    → COMPLETED ✅
```

## Migration Guide

### For Workers

**Old workflow:**
```bash
# Claim task
autonomousWorkerClaimTask.ts CRITICAL-1 worker-01

# Work on it...

# Try to complete
autonomousWorkerReleaseTask.ts CRITICAL-1 COMPLETED worker-01
# If validation fails → FAILED status → stuck
```

**New workflow:**
```bash
# Session 1: First attempt
autonomousWorkerClaimTask.ts CRITICAL-1 worker-01
# Work on it...
autonomousWorkerReleaseTask.ts CRITICAL-1 CLAIMED worker-01 \
  --update-progress "Fixed 3/5 scenarios"

# Session 2: Resume
autonomousWorkerSelectTask.ts --worker-id=worker-01 --resume
autonomousWorkerGetProgress.ts CRITICAL-1  # See what's been done
# Continue work...
autonomousWorkerReleaseTask.ts CRITICAL-1 CLAIMED worker-01 \
  --update-progress "Fixed 4/5 scenarios"

# Session 3: Complete
autonomousWorkerSelectTask.ts --worker-id=worker-01 --resume
# Fix last issue...
autonomousWorkerReleaseTask.ts CRITICAL-1 COMPLETED worker-01
# Validation passes → COMPLETED ✅
```

### For Queue Generators

**No changes required** - Progress field is optional, gets initialized on first progress update.

### For Validation Scripts

**No changes required** - Validation still runs same way, just results are captured differently.

## Benefits

1. **Iterative work supported** - Tasks can span multiple sessions
2. **Progress preserved** - Know what's been tried before
3. **Better debugging** - Validation output saved for reference
4. **No stuck tasks** - Workers can always continue or explicitly abandon
5. **Git-friendly** - Progress updates are commit points

## Breaking Changes

**Status transitions:**
- Old: `CLAIMED → (validation fail) → FAILED`
- New: `CLAIMED → (validation fail) → CLAIMED` (with progress note)

**Scripts:**
- `autonomousWorkerSelectTask.ts` now requires `--worker-id` for `--resume`
- `autonomousWorkerReleaseTask.ts` accepts `CLAIMED` as valid status

**Queue file:**
- Added optional `progress` field (backward compatible)

## Testing

Tested workflow:
```bash
# Test script validated:
# 1. Select task (no resume)
# 2. Claim task
# 3. Update progress (CLAIMED status)
# 4. Check progress (new script)
# 5. Resume task (--resume flag)
# All steps passed ✅
```

## Documentation

- **Main docs:** `docs/QUEUE_SYSTEM_PROGRESS_TRACKING.md`
- **This changelog:** `docs/QUEUE_SYSTEM_V2.1_CHANGELOG.md`
- **Validation docs:** `docs/QUEUE_VALIDATION_SYSTEM.md`

## Future Improvements

Potential v2.2 features:
- Progress percentage calculation (items completed / total)
- Stale task detection (claimed but no progress in X days)
- Worker reassignment (claim timeout after inactivity)
- Progress analytics (average attempts per priority level)

## Credits

**Design:** Devon (DevOps)
**Implementation:** Devon
**Schema:** v2.0 → v2.1
**Commit:** 35d4d778
