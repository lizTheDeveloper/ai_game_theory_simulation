# Proposed: Tipping Cascade Performance Optimization

**Date:** 2025-12-08
**Priority:** MEDIUM → HIGH (when tipping elements expand)
**Complexity:** Low (1-2 hours)
**Source:** Architecture Integration Review (HIGH-1)

---

## Problem Statement

The `calculateThresholdLowering()` method in ClimateSystemPhase uses O(n*m) nested iteration:
- Outer loop: `system.elements` (currently 6 elements)
- Inner: `TIPPING_INTERACTIONS.filter()` + `.find()` per interaction

**Current impact:** Negligible (~60 iterations per phase)
**Future risk:** If tipping elements expand to 20+ regional elements (per research roadmap), this becomes a performance bottleneck.

**Location:** `src/simulation/engine/phases/ClimateSystemPhase.ts:223-272`

---

## Proposed Solution

Pre-compute interaction lookup map at initialization:

```typescript
// Build Map<sourceId, TippingInteraction[]> at module init
const interactionsBySource = new Map<string, TippingInteraction[]>();
TIPPING_INTERACTIONS.forEach(interaction => {
  if (!interactionsBySource.has(interaction.sourceId)) {
    interactionsBySource.set(interaction.sourceId, []);
  }
  interactionsBySource.get(interaction.sourceId)!.push(interaction);
});

// In calculateThresholdLowering():
system.elements.forEach(element => {
  const relevantInteractions = interactionsBySource.get(element.id) ?? [];
  relevantInteractions.forEach(interaction => {
    // Process interaction
  });
});
```

**Performance improvement:**
- Before: O(n*m) = O(6 * 10) = 60 operations (current), O(20 * 50) = 1000 operations (future)
- After: O(n + k) where k = interactions per element (typically 2-3) = O(20 + 60) = 80 operations (future)

---

## Research Needed

None - this is a pure performance optimization with no behavioral changes.

---

## Effort Estimate

**Total: 1-2 hours**
- Implementation: 30 minutes (map initialization + refactor)
- Testing: 30 minutes (verify identical outputs before/after)
- Monte Carlo validation: 30 minutes (determinism check)

---

## Success Criteria

1. ✅ Tests pass (no behavioral changes)
2. ✅ Monte Carlo runs produce identical results (seed=42, N=3)
3. ✅ TypeScript compilation passes
4. ✅ Performance measurement shows O(n) scaling instead of O(n*m)

---

## Next Steps

1. Create benchmark script to measure current performance
2. Implement lookup map optimization
3. Run comparison test (before/after outputs identical)
4. Document in devlogs

**Trigger:** Address this BEFORE expanding tipping elements beyond 10 (currently 6).
