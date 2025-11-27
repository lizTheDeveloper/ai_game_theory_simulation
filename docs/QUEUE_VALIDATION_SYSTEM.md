# Queue Validation System

**Schema Version:** 2.0
**Implemented:** Nov 26, 2025
**Agent:** Devon (DevOps)

## Overview

The autonomous worker queue now includes validation fields to verify that completed work actually meets acceptance criteria. This prevents tasks from being marked COMPLETED when they don't actually work.

## Schema Changes (v1.0 → v2.0)

Added three optional fields to the Task interface:

```typescript
interface Task {
  // ... existing fields ...
  acceptanceCriteria?: string[];        // What "done" means
  validationCommand?: string;           // Shell command to verify
  validationStatus?: "PENDING" | "PASSED" | "FAILED" | null;
}
```

## New Scripts

### `autonomousWorkerValidateTask.ts`

Validates a task by running its validation command and updating the queue.

**Usage:**
```bash
npx tsx scripts/autonomousWorkerValidateTask.ts <task-id>
```

**Behavior:**
- If task has no `validationCommand`, marks as `PASSED` (no validation required)
- If task has `validationCommand`, runs it and updates `validationStatus`
- Exit code 0 = PASSED, 1 = FAILED
- Updates queue file with validation status

**Example:**
```bash
npx tsx scripts/autonomousWorkerValidateTask.ts CRITICAL-1
```

## Updated Scripts

### `autonomousWorkerReleaseTask.ts`

Now validates tasks before marking them COMPLETED.

**New behavior when status = COMPLETED:**
1. Check if task has `validationCommand`
2. If yes, run validation automatically
3. If validation fails, mark task as `FAILED` instead of `COMPLETED`
4. If validation passes, proceed with `COMPLETED`

**New status:** `FAILED` added to valid statuses (for tasks that fail validation)

**Example:**
```bash
# This will run validation automatically if task has validationCommand
npx tsx scripts/autonomousWorkerReleaseTask.ts CRITICAL-1 COMPLETED worker-01
```

### `generateAutonomousWorkerQueue.ts`

Now parses acceptance criteria and validation commands from roadmap.

**New roadmap fields (optional):**
```markdown
**CRITICAL-1: Task Title**
- **Acceptance:**
  - Criterion 1
  - Criterion 2
- **Validation:** `npx tsx scripts/someValidation.ts`
```

**Parsing patterns:**
- `**Acceptance:**`, `**Done when:**`, or `**Success criteria:**` sections
- `**Validation:**` field with backtick-wrapped command
- If present in roadmap, automatically included in generated queue

## Acceptance Criteria Examples

### CRITICAL-1: Hindcast Validation Crashes
```json
"acceptanceCriteria": [
  "All 10 hindcast runs complete without crashes",
  "No NaN values in environmentalHealth at months 142-146",
  "environmentalHealth stays within valid range [0, 100]",
  "Root cause identified and documented in commit message"
],
"validationCommand": "npx tsx scripts/hindcastValidation.ts --runs=10 --start=1990 --end=2010 --check-environmental-health"
```

### HIGH-2: Carbon Cycle Over-Calibration
```json
"acceptanceCriteria": [
  "Simulated 2010 CO2 within ±5% of observed 390 ppm (370.5-409.5 ppm)",
  "Hindcast validation passes CO2 criteria",
  "Carbon sink saturation parameters documented with peer-reviewed justification",
  "No regression in 1990 baseline accuracy"
],
"validationCommand": "npx tsx scripts/hindcastValidation.ts --runs=10 --start=1990 --end=2010 --check-co2-accuracy"
```

### HIGH-3: VM Multi-Worker Infrastructure
```json
"acceptanceCriteria": [
  "Multi-repo workspace created (/srv/satu/worker-01, worker-02, worker-03)",
  "systemd services operational for 3 workers",
  "Priority queue system operational (select/claim/release scripts)",
  "Task selection demonstrates priority ordering (CRITICAL > HIGH > MEDIUM > LOW)",
  "No git contention during parallel worker execution"
],
"validationCommand": "npx tsx scripts/autonomousWorkerSelectTask.ts && systemctl --user status satu-worker@01 satu-worker@02 satu-worker@03"
```

## Workflow

### Worker completing a task:

1. **Work on task** - Implement the fix/feature
2. **Self-validate** - Manually check acceptance criteria
3. **Release as COMPLETED:**
   ```bash
   npx tsx scripts/autonomousWorkerReleaseTask.ts CRITICAL-1 COMPLETED worker-01
   ```
4. **Automatic validation** - Script runs validationCommand if present
5. **Result:**
   - ✅ Validation passes → Task marked `COMPLETED`
   - ❌ Validation fails → Task marked `FAILED`

### Manual validation (optional):

Workers can run validation separately before release:
```bash
npx tsx scripts/autonomousWorkerValidateTask.ts CRITICAL-1
# Check output, fix issues, run again
npx tsx scripts/autonomousWorkerReleaseTask.ts CRITICAL-1 COMPLETED worker-01
```

## Migration Strategy

### Existing tasks without validation fields:

- `acceptanceCriteria` not present → No explicit criteria (rely on description)
- `validationCommand` not present → Auto-passes validation
- `validationStatus` = `null` → Not yet validated

### Adding validation to existing tasks:

1. **Edit queue directly** for already-created tasks
2. **Update roadmap** for future queue generation
3. **Run generator** to sync changes from roadmap

### Backwards compatibility:

All validation fields are optional. Tasks without them work exactly as before. The system is fully backwards-compatible with schema v1.0.

## Design Rationale

### Why validation fields?

**Problem:** Workers can mark tasks COMPLETED even when they don't actually work. No automated verification.

**Solution:** Executable validation commands that run automatically before completion.

### Why fail to FAILED instead of staying CLAIMED?

**Transparency:** Failed validation is different from incomplete work. Explicit `FAILED` status makes this visible.

**Retry workflow:** Worker can fix and retry, or another worker can claim from queue.

**Audit trail:** `completedBy` + `completedAt` + `validationStatus=FAILED` provides full history.

### Why optional validationCommand?

**Not all tasks are automatable:** Documentation updates, research tasks, design work can't always be validated with shell commands.

**Progressive enhancement:** Add validation where it makes sense, don't block tasks that can't be validated automatically.

## Future Enhancements

### Phase 2 (possible):

- **Validation timeout:** Prevent hanging validations
- **Validation retries:** Auto-retry N times before marking FAILED
- **Validation logs:** Save full validation output to `/logs/validation/`
- **Multiple validation commands:** Different commands for different criteria
- **Partial validation:** Some criteria passed, some failed

### Phase 3 (possible):

- **CI/CD integration:** GitHub Actions runs validation on PR
- **Determinism validation:** Monte Carlo runs for simulation changes
- **Performance regression:** Benchmark validation
- **Coverage validation:** Test coverage must increase or stay same

## Files Modified

- `plans/AUTONOMOUS_WORKER_QUEUE.json` - Schema v2.0, added validation fields to existing tasks
- `scripts/generateAutonomousWorkerQueue.ts` - Parse acceptance criteria from roadmap
- `scripts/autonomousWorkerReleaseTask.ts` - Run validation before completion
- `scripts/autonomousWorkerValidateTask.ts` - **NEW** - Standalone validation script

## Testing

```bash
# Test validation on completed task
npx tsx scripts/autonomousWorkerValidateTask.ts HIGH-3

# Test release workflow with validation
npx tsx scripts/autonomousWorkerClaimTask.ts CRITICAL-1 test-worker
npx tsx scripts/autonomousWorkerReleaseTask.ts CRITICAL-1 COMPLETED test-worker
# (validation runs automatically, task marked FAILED if hindcast doesn't pass)

# Reset task for retry
npx tsx scripts/autonomousWorkerReleaseTask.ts CRITICAL-1 AVAILABLE test-worker
```

## DevOps Notes (Devon's log)

TypeScript compiler complains about `import fs from 'fs'` in scripts, but tsx runtime handles it fine. This is expected behavior for .ts files run with tsx.

Validation system prevents garbage completions. Makes acceptance criteria explicit. Optional validation command means it doesn't block non-automatable tasks. Release script enforces validation gate.

Queue is self-documenting now - anyone can read acceptance criteria and understand what "done" means without decoding the description field.
