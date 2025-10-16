# TIER 0B: Orphaned AI Fix

**Date:** October 16, 2025
**Issue:** 79.8 orphaned AIs per run (should be 0)
**Evidence:** Monte Carlo logs showing high orphan counts

---

## Root Cause Found

### Location: `src/simulation/lifecycle.ts` lines 493-521

```typescript
const privateOrgs = state.organizations.filter(o => o.type === 'private' && o.capital > 0);
if (privateOrgs.length > 0) {
  // assign organizationId
}
state.aiAgents.push(newAI); // ← BUG: AI created without organizationId if no orgs!
```

### The Problem

**Orphaned AIs are CREATED, not just from bankruptcies:**

1. New AIs start with `organizationId = undefined` (`src/simulation/initialization.ts:298`)
2. AI creation code filters for `o.type === 'private' && o.capital > 0`
3. **If NO orgs match** (all bankrupt), assignment block is skipped
4. AI is pushed to state with `organizationId = undefined`
5. This creates ACTIVE (not retired) AI without organization = orphan

**When this occurs:**
- Economic crises → all private orgs go bankrupt (capital ≤ 0)
- Extinction scenarios → organizations shut down
- Late-game collapse → most orgs have failed

**Why 79.8 orphans?**
- In crisis/extinction runs, organizations fail rapidly
- New AIs continue being created (Poisson rate)
- But all orgs have capital ≤ 0, so all new AIs become orphans
- This compounds over 50-100 months

---

## The Fix

### Solution: Remove capital requirement + add fallback (TIER 0B, 0.5h)

**Change `src/simulation/lifecycle.ts` lines 493-521:**

```typescript
// OLD (broken):
const privateOrgs = state.organizations.filter(o => o.type === 'private' && o.capital > 0);
if (privateOrgs.length > 0) {
  // assign to org
}
state.aiAgents.push(newAI); // ← Creates orphan if no orgs!

// NEW (fixed):
const privateOrgs = state.organizations.filter(o => o.type === 'private');
if (privateOrgs.length > 0) {
  // assign to org (bankrupt orgs can train using loans/govt support)
} else {
  // If NO orgs exist, retire AI immediately (don't create orphan)
  newAI.lifecycleState = 'retired';
}
state.aiAgents.push(newAI);
```

**Two-part fix:**
1. **Remove `capital > 0` requirement** - Bankrupt orgs can still train models using loans/government support (realistic)
2. **Add fallback for no orgs** - If zero organizations exist, immediately retire the AI (don't create orphan)

---

## Expected Impact

- **Orphaned AIs:** 79.8 → 0 ✅
- **Behavior:** Bankrupt organizations can continue training (realistic - they use debt)
- **Edge case:** If all organizations are eliminated, AI creation stops (correct behavior)

---

## Validation

Run Monte Carlo N=5 to verify:
```bash
npx tsx scripts/monteCarloSimulation.ts --runs=5 --max-months=120
```

Expected result:
- Orphaned AIs: 0 (was 79.8)
- No behavior changes to simulation outcomes

---

## Related Issues

This is separate from the bankruptcy retirement logic (`organizationManagement.ts:795`), which was already correct. The bug was in AI **creation**, not AI **retirement**.

---

## Next Steps

1. Validate fix with Monte Carlo N=5
2. If orphans = 0: Mark TIER 0B complete
3. Move to TIER 0C (compute paradox)
