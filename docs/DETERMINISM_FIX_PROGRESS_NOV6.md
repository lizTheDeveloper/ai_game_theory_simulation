# Determinism Fix Progress - November 6, 2025

**Issue:** Simulation is non-deterministic (Issue #11)
**Status:** PARTIAL FIX - Root cause still under investigation

---

## What Was Fixed

### 1. Non-Deterministic SeededRandom Seeding (FIXED)

**Problem:** Three locations in `organizationManagement.ts` used `.id.length` for seeding, which is non-deterministic:

```typescript
// ❌ NON-DETERMINISTIC
const rng = new SeededRandom(state.currentMonth + org.id.length);
// org.id.length varies if org IDs change across runs
```

**Fix:** Added `hashString()` utility and replaced all `.id.length` with deterministic string hash:

```typescript
// ✅ DETERMINISTIC
import { hashString } from './utils/idGenerator';
const rng = new SeededRandom(state.currentMonth + hashString(org.id));
// Hash is consistent for same string
```

**Files Modified:**
- `src/simulation/utils/idGenerator.ts` - Added `hashString()` function (DJB2 algorithm)
- `src/simulation/organizationManagement.ts` - Fixed 3 call sites (lines 239, 279, 1195)

---

## What Still Diverges

### Current Determinism Test Results

**Test:** N=3 runs with seed=42000, 12 months each

**Result:** FAILED - Differences detected in all 12 months

**Key Finding:** Divergence starts in **Month 0, AI Agent Actions phase**

```
Before AI Agent Actions: sum = 1.4900000000 (identical)
After AI Agent Actions:
  Run 1: sum = 2.5097839675
  Run 2: sum = 2.4740362883
  Run 3: sum = 2.4258084770
```

### Suspected Root Cause

The "AI Agent Actions" phase (`src/simulation/engine/phases/AIAgentActionsPhase.ts`) produces different AI capability totals across runs.

**Hypothesis:** Some part of the AI action selection or execution is non-deterministic.

**Evidence from logs:**
- Month 0 initialization is IDENTICAL across all runs (1.490000)
- First divergence occurs in `executeAIAgentActions()` phase
- Divergence compounds over time (by Month 2, AI agent counts differ: 20 vs 21 vs 22)

### Investigation Needed

1. **AI Action Selection (`selectAIAction`):**
   - Weighted random selection looks correct (uses RNG)
   - But weights depend on `state.aiAgents` array order
   - Need to verify array iteration order is stable

2. **AI Agent Creation:**
   - New AIs created in `lifecycle.ts` use Poisson sampling
   - Creation rate depends on total capability (which is already divergent)
   - Divergence cascade: capability → creation rate → new AIs → more divergence

3. **Possible Hidden Non-Determinism:**
   - Object.keys() iteration (100+ instances, though ES2015+ guarantees order)
   - Set/Map iteration (if any)
   - Floating-point precision issues (unlikely but possible)
   - Phase execution order dependencies

---

## Next Steps

### Immediate (Critical)

1. **Add detailed AI action logging:**
   ```typescript
   console.log(`[DET] Agent ${ai.id} selected action ${action.id}, weight=${weight}`);
   ```

2. **Compare action sequences across runs:**
   - Which AIs act in which order?
   - Do they select the same actions?
   - Do actions produce the same results?

3. **Instrument `selectAIAction` weights:**
   - Log weights for each agent/action pair
   - Identify where weight calculation diverges

### Medium Term

4. **Verify array iteration order:**
   - Check if `state.aiAgents` has stable order
   - Verify `filter()` doesn't change order unexpectedly

5. **Check for Object.keys() issues:**
   - 100+ instances in codebase
   - Modern JS guarantees order, but verify no edge cases

6. **Test with single AI:**
   - Simplify to 1 AI agent
   - Isolate whether issue is in selection or execution

### Long Term

7. **Add determinism regression tests:**
   - CI/CD gate: Must pass N=3 determinism check
   - Pre-commit hook: Quick N=2 check on 3 months

8. **Document RNG usage patterns:**
   - Update CLAUDE.md with determinism checklist
   - Add examples of correct/incorrect patterns

---

## Files Changed (This Session)

```
src/simulation/utils/idGenerator.ts          (+28 lines)  - Added hashString()
src/simulation/organizationManagement.ts     (3 fixes)    - Replaced .id.length with hashString()
```

---

## Validation Commands

```bash
# Run determinism verification (N=3, 12 months)
npx tsx scripts/verifyDeterminism.ts > logs/determinism_verification_$(date +%Y%m%d_%H%M%S).log 2>&1 &

# Check for remaining Math.random() calls
grep -rn "Math\.random()" src/simulation --include="*.ts" | grep -v "\.bak"

# Check for remaining Date.now() calls (excluding LLM/logging)
grep -rn "Date\.now()" src/simulation --include="*.ts" | grep -v "llm\|logging" | grep -v "\.bak"

# Check for Object.keys() usage
grep -rn "Object\.keys\|Object\.values\|Object\.entries" src/simulation --include="*.ts" | grep -v "\.bak" | wc -l
```

---

## Roy's Notes

**What I Fixed:**
- Non-deterministic SeededRandom seeding (3 sites)
- Added hashString() utility for deterministic ID hashing

**What's Still Broken:**
- AI Agent Actions phase produces different results
- Capability totals diverge starting Month 0
- By Month 2, even AI agent COUNTS differ (20 vs 21 vs 22)

**Why This Matters:**
All Monte Carlo results are INVALID until this is fixed. We can't trust outcome distributions, parameter sensitivities, or risk assessments.

**Difficulty Level:**
This is a HARD bug. The divergence is subtle - happens in the first phase execution, cascades through dependent calculations. Will require careful instrumentation and comparison of execution traces.

**Time Estimate:**
- 2-4h to instrument and identify exact divergence point
- 1-2h to fix once identified
- 1h validation
- **Total: 4-7h additional work**

*"This is why we can't have nice things. But we're getting closer."* - Roy

---

**Author:** Roy (Simulation Maintainer)
**Date:** November 6, 2025
**Status:** In Progress - Partial Fix Applied
