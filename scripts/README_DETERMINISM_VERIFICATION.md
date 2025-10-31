# Determinism Verification

## Quick Start

```bash
# Run determinism verification (3 runs, 12 months)
npx tsx scripts/verifyDeterminism.ts

# Output saved to /logs/determinism_verification_<timestamp>.log
```

## What It Does

1. Runs the simulation **3 times** with **identical seed** (42000)
2. Captures full state snapshots every month
3. Compares states via SHA-256 hash (detects ANY difference)
4. Reports detailed field-by-field differences if found

## Expected Output

### ✅ PASS (Deterministic)
```
✅ Month   0: All runs IDENTICAL (hash: ad0abca0...)
✅ Month   1: All runs IDENTICAL (hash: 374506be...)
✅ Month   2: All runs IDENTICAL (hash: 5a3b2c1d...)
...
✅ DETERMINISM VERIFIED: All runs produced bit-identical results! 🎉
```

### ❌ FAIL (Non-Deterministic)
```
✅ Month   0: All runs IDENTICAL (hash: ad0abca0...)
❌ Month   1: DIFFERENCES DETECTED!
   Run 2 differs from Run 1:
     Field differences:
       aiAgents[0].capability: 0.0786 !== 0.0510
       aiAgents[1].alignment:  0.7651 !== 0.7605
...
❌ DETERMINISM FAILED: Found differences in 12 month(s)!
```

## Configuration

Edit `scripts/verifyDeterminism.ts`:

```typescript
const SEED = 42000;          // Fixed seed for all runs
const NUM_RUNS = 3;          // Number of identical runs
const MAX_MONTHS = 12;       // Duration of each run
const SNAPSHOT_INTERVAL = 1; // Snapshot frequency (months)
```

## When to Run

### Required
- **After fixing non-deterministic sources** (Math.random(), Date.now())
- **Before merging changes to simulation code**
- **Before running Monte Carlo analyses** (validates reproducibility)

### Recommended
- **In CI/CD pipeline** (automated verification)
- **After adding new phases** (catch regressions)
- **When debugging RNG issues** (verify proper usage)

## Common Issues

### Issue: Script crashes with "undefined reading 'length'"
**Cause:** State field accessed before initialization
**Fix:** Add defensive checks in compareStates() function

### Issue: Month 0 differs
**Cause:** Non-deterministic initialization (very rare)
**Fix:** Check createDefaultInitialState() for Math.random() or Date.now()

### Issue: Only some months differ
**Cause:** Conditional non-determinism (e.g., random event triggers)
**Fix:** Trace which phase introduced divergence, search for Math.random()

## Debugging Non-Determinism

### Step 1: Identify divergence point
Look at which month first shows differences - that's when non-deterministic code runs.

### Step 2: Search for Math.random()
```bash
grep -r "Math\.random()" src/simulation/ --include="*.ts"
```

### Step 3: Search for Date.now()
```bash
grep -r "Date\.now()\|new Date()" src/simulation/ --include="*.ts"
```

### Step 4: Replace with deterministic alternatives
```typescript
// ❌ BEFORE (non-deterministic)
if (Math.random() < 0.5) {
  id = `event_${Date.now()}_${counter}`;
}

// ✅ AFTER (deterministic)
if (rng() < 0.5) {
  id = `event_${state.currentMonth}_${counter}`;
}
```

## Integration with CI/CD

Add to `.github/workflows/test.yml`:

```yaml
- name: Verify Determinism
  run: npx tsx scripts/verifyDeterminism.ts
  timeout-minutes: 5
```

## Performance

- **Duration:** ~1-2 minutes for 3 runs × 12 months
- **Memory:** ~500MB peak (deep state cloning)
- **CPU:** Single-threaded (deterministic execution)

## Technical Details

### Hash Algorithm
Uses SHA-256 of stable JSON (sorted keys) for:
- 100% sensitivity (detects ANY difference)
- Zero false negatives (matching hashes = identical states)
- O(1) comparison vs O(n) field-by-field

### State Snapshot
Deep clone via `JSON.parse(JSON.stringify(state))`:
- Captures full state at each interval
- Independent from simulation mutations
- Allows post-hoc analysis of divergence

### Comparison Strategy
1. **Hash comparison first** (fast, detects differences)
2. **Field-by-field only on mismatch** (slow, diagnoses cause)
3. **Limited output** (first 20 differences to avoid log spam)

## Related Documentation

- **Full Investigation Report:** `/docs/DETERMINISM_INVESTIGATION_20251030.md`
- **Summary:** `/logs/determinism_verification_summary.txt`
- **Monte Carlo Guide:** `/docs/COMMANDS.md`

---

**Maintained by:** Roy (Simulation Maintainer)
**Last Updated:** October 30, 2025
