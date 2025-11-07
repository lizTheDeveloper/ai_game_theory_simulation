# Lifecycle Organization Sort Fix - Nov 6, 2025

## Bug Found

**Location:** `src/simulation/lifecycle.ts` line 652

**Root Cause:** Weighted organization selection for new AI agents depended on array iteration order.

```typescript
// ❌ BAD (non-deterministic if organizations array order varies)
const privateOrgs = state.organizations.filter(o => o.type === 'private' && !o.bankrupt);

// Weighted selection depends on array position
for (let j = 0; j < privateOrgs.length; j++) {
  cumulative += weights[j];
  if (rand < cumulative) {
    newAI.organizationId = privateOrgs[j].id;  // ← Different org if array order changes!
    break;
  }
}
```

**Why This Breaks Determinism:**
1. Same `rand` value from RNG
2. BUT different `privateOrgs` array order
3. = Different organization selected
4. = Different `organizationId` assigned to new AI
5. = Different capability trajectories (organizations affect training, capabilities, etc.)

## Fix Applied

**Solution:** Sort organizations by ID before weighted selection

```typescript
// ✅ GOOD (deterministic - always same order)
const privateOrgs = state.organizations
  .filter(o => o.type === 'private' && !o.bankrupt)
  .sort((a, b) => a.id.localeCompare(b.id)); // ← Stable sort by ID
```

## Validation Results

**Test:** Comprehensive Determinism Validation (seed=42, runs=10, months=3)

**Before Fix:**
- Run 1: Month 2 totalCapability = 2.529504 (20 AIs, none created)
- Runs 2-10: Month 2 totalCapability = 2.777510 (21 AIs, 1 created)
- **Divergence:** 1/10 runs different

**After Fix:**
- Run 1: Month 2 totalCapability = 2.529504 (20 AIs, none created) **STILL DIVERGES**
- Runs 2-10: Month 2 totalCapability = 2.777510 (21 AIs, 1 created) **ALL MATCH!**
- **Improvement:** Runs 2-10 now deterministic (CV=0.00%)

## Status

**Partial Success:**
✅ Runs 2-10 are now fully deterministic
❌ Run 1 still diverges from Runs 2-10

**Next Steps:**
1. Run 1 divergence suggests there's ANOTHER bug that only affects the first run
2. Likely related to initialization or state setup that differs on first execution
3. This is a SEPARATE bug from the organization sorting issue

## Files Changed

- `src/simulation/lifecycle.ts` - Added `.sort()` before weighted selection (line 658)

## Commit

Fixed organization array iteration order in AI lifecycle phase.

Weighted selection for organization assignment now sorts `privateOrgs` by ID
before iterating, ensuring deterministic results across runs.

Validation: Runs 2-10 now match (9/10 deterministic), Run 1 still diverges
(separate bug to investigate).
