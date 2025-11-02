# Determinism Fix Strategy
**Date:** 2025-10-31
**Issue:** #11 Determinism Verification FAILED
**Roy's Status:** "Alright, I've traced the beast. Here's what we're dealing with."

## Investigation Summary

### What I Found

**Good news:** Phases ARE passing `rng` correctly ✅
**Bad news:** Helper functions have `= Math.random` fallback parameters ❌

**Determinism Test Results (from logs/determinism_verification_2025-10-31T05-02-55.log):**
- **Month 0:** ✅ IDENTICAL (initialization is deterministic with seed)
- **Month 1+:** ❌ DIVERGES IMMEDIATELY

**Primary divergence sources:**
1. **AI agent capabilities** - differ at Month 1 (0.050 vs 0.078)
2. **AI agent alignments** - differ at Month 1 (0.819 vs 0.751)
3. **Organization capital** - diverges at Month 2
4. **AI agent count** - by Month 3, even the COUNT differs (21 vs 23 agents)

### Root Cause Analysis

**Pattern identified:**
```typescript
// ❌ ANTI-PATTERN (everywhere in codebase)
export function someFunction(state: GameState, rng: () => number = Math.random): void {
  // Phase passes rng correctly, but fallback exists
  if (rng() < 0.5) { ... }
}
```

**Why this breaks determinism:**
Even though phases pass `rng`, having `= Math.random` as a fallback means:
1. TypeScript doesn't ENFORCE passing rng
2. Some code paths may not pass it
3. Function-to-function calls within modules may omit rng

**Files with fallbacks:**
- `src/simulation/government/core/governmentCore.ts` (line 40, 725)
- `src/simulation/agents/governmentAgent.ts` (37 function signatures)
- `src/simulation/organizationManagement.ts` (line 1558)
- `src/simulation/lifecycle.ts` (line 554)
- And 30+ more files...

### Scope of Work

**Total Math.random() instances:** 150 across 35 files

**Top offenders:**
1. `agents/governmentAgent.ts` - 27 calls (37 action signatures)
2. `initialization.ts` - 17 calls (fallback pattern: `rng ? rng() : Math.random()`)
3. `defensiveAI.ts` - 14 calls
4. `memetics/memeTransmission.ts` - 11 calls
5. `geoengineering.ts` - 7 calls
6. Remaining 30 files - ~74 calls

## Fix Strategy

### Phase 1: Remove Fallback Pattern (2-3 hours)

**Goal:** Make `rng` REQUIRED, remove all `= Math.random` defaults

**Approach:**
```bash
# Script to remove fallback pattern
find src/simulation -name "*.ts" -not -name "*.bak*" | xargs sed -i '' \
  's/rng: () => number = Math\.random/rng: RNGFunction/g'

# This will cause TypeScript errors everywhere rng isn't passed
# Good! That's what we want - it surfaces all the broken call sites
```

**Expected TypeScript errors:** 100-200 call sites

### Phase 2: Fix Call Sites (3-4 hours)

**Pattern to fix:**
```typescript
// Before (broken):
someFunction(state);  // TypeScript error: missing rng

// After (fixed):
someFunction(state, rng);  // Pass rng from phase
```

**Systematic approach:**
1. Run `npx tsc --noEmit` to get list of errors
2. Fix errors file by file (alphabetically)
3. Thread `rng` through call chains:
   - If function calls another function, pass rng
   - If phase calls function, phase has rng from PhaseOrchestrator
4. Commit after each file compiles

**Critical files to prioritize (based on divergence test):**
1. `lifecycle.ts` - AI agent updates
2. `organizationManagement.ts` - Organization logic
3. `capabilities.ts` - Capability calculations
4. `alignment.ts` - Alignment drift
5. Agent action files

### Phase 3: Remove Ternary Fallbacks in initialization.ts (30 min)

**Current anti-pattern:**
```typescript
const value = rng ? rng() : Math.random();  // ❌ Still allows non-determinism
```

**Fix:**
```typescript
const value = rng();  // ✅ Always use rng
```

**Files to fix:**
- `src/simulation/initialization.ts` (17 instances)
- Any other files with ternary fallback pattern

### Phase 4: Validation & Testing (1-2 hours)

**Step 1: Add determinism regression test**
```typescript
// test/determinism.test.ts
it('should produce identical results with same seed (N=3)', async () => {
  const runs = await Promise.all([
    runSimulation(42000, 12),
    runSimulation(42000, 12),
    runSimulation(42000, 12)
  ]);

  expect(hashState(runs[0])).toBe(hashState(runs[1]));
  expect(hashState(runs[1])).toBe(hashState(runs[2]));
});
```

**Step 2: Run verification script**
```bash
npx tsx scripts/verifyDeterminism.ts > logs/determinism_fixed_$(date +%Y%m%d).log 2>&1
```

**Success criteria:**
- ✅ All months show IDENTICAL hashes
- ✅ No field differences reported
- ✅ Agent counts match
- ✅ Organization capital matches

**Step 3: Monte Carlo validation**
```bash
# Run N=10 with same seed
npx tsx scripts/monteCarloSimulation.ts --runs=10 --seed=42000 --max-months=120
```

**Expected:** All 10 runs produce IDENTICAL outcomes

### Phase 5: Prevention (30 min)

**Add ESLint rule:**
```javascript
// .eslintrc.js
module.exports = {
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: 'CallExpression[callee.object.name="Math"][callee.property.name="random"]',
        message: 'Use rng parameter instead of Math.random() in simulation code'
      }
    ]
  }
};
```

**Add pre-commit hook:**
```bash
# .husky/pre-commit
# Check for Math.random() in simulation code
if git diff --cached --name-only | grep "src/simulation.*\.ts$" | xargs grep -l "Math\.random()" > /dev/null; then
  echo "❌ ERROR: Math.random() found in simulation code"
  echo "Use rng parameter for deterministic simulation"
  exit 1
fi
```

## Timeline Estimate

| Phase | Task | Time |
|-------|------|------|
| 1 | Remove fallback defaults | 2-3h |
| 2 | Fix call sites (100-200 errors) | 3-4h |
| 3 | Remove ternary fallbacks | 30min |
| 4 | Validation & testing | 1-2h |
| 5 | Prevention (ESLint + hooks) | 30min |
| **Total** | | **7-10 hours** |

## Current Status

**Completed:**
- ✅ Comprehensive audit (150 calls across 35 files)
- ✅ Determinism verification test (found Month 1 divergence)
- ✅ Root cause analysis (fallback pattern identified)
- ✅ Fix strategy documented

**Next Step:**
Phase 1 - Remove fallback pattern from function signatures

## Risk Assessment

**Low risk:**
- TypeScript will catch all broken call sites
- Determinism test validates success
- Monte Carlo provides final verification

**Potential issues:**
- Some legacy code may not have access to rng (rare)
- UI code that imports simulation functions (should never happen)
- Test code may need `createMockRNG()` utility

**Mitigation:**
- Fix systematically, one file at a time
- Commit after each file compiles
- Run determinism test after major changes

---

**Roy says:** "This is tedious but necessary. Non-deterministic simulation = worthless research. Let's do this right."
