# Proposed Feature: Extinction Debt Modeling

**Created:** November 25, 2025
**Author:** autonomous-worker (via research-skeptic recommendation)
**Priority:** MEDIUM (model validity improvement)
**Effort:** 3-5 days (research + implementation)

---

## Problem Statement

The current simulation treats biodiversity loss as instantaneous when thresholds are crossed. In reality, **extinction debt** means species loss continues for 50-400 years after habitat degradation due to:

1. **Population viability lag** - Small populations persist but are non-viable long-term
2. **Trophic cascade delays** - Predator/prey imbalances take decades to manifest
3. **Mutualism collapse** - Pollinator networks fail gradually
4. **Climate velocity mismatch** - Species can't migrate fast enough

This is well-established science with 200+ papers documenting the phenomenon.

---

## Proposed Solution

### Phase 1: Research (1-2 days)
1. Literature review of extinction debt quantification
2. Extract parameters: lag times by ecosystem type, debt ratios, recovery impossibility thresholds
3. Map existing biodiversity boundary to extinction debt queues

**Key papers to review:**
- Tilman et al. (1994) "Habitat destruction and the extinction debt" - foundational paper
- Kuussaari et al. (2009) - European grasslands 50-200yr debt
- Dullinger et al. (2013) - Alpine plants 300-400yr debt from warming
- Isbell et al. (2011) - Trophic cascade delays

### Phase 2: Implementation (2-3 days)
1. Add `ExtinctionDebtState` type to game.ts:
   ```typescript
   interface ExtinctionDebtState {
     queuedExtinctions: ExtinctionQueueEntry[];  // Species committed to extinction
     realizedExtinctions: number;                // Species actually extinct
     debtRatio: number;                          // Queued / (Queued + Realized)
     ecosystemCollapse: {                        // Per-ecosystem tracking
       [ecosystem: string]: {
         degradationYear: number;
         expectedDebt: number;
         realizedDebt: number;
       };
     };
   }
   ```

2. Modify `BiosphereTippingPhase` to queue extinctions instead of instant loss
3. Add `ExtinctionDebtPhase` (order ~38.0) to process queue monthly
4. Connect extinction debt to food security (pollination services)

### Phase 3: Validation (1 day)
1. Monte Carlo N=10 to verify no crashes
2. Check that biodiversity recovery is now appropriately slow
3. Validate against historical extinction patterns

---

## Expected Impact

- **Model validity:** Biodiversity system becomes temporally realistic
- **Outcome diversity:** Delayed consequences create more nuanced scenarios
- **Policy relevance:** Shows "committed" vs "realized" extinctions - important for policy messaging

---

## Research Needed

**Question to super-alignment-researcher:**
- Latest extinction debt quantification (2024-2025 papers)
- Ecosystem-specific lag times (tropical vs temperate vs marine)
- Mechanisms linking extinction debt to food production (pollination collapse timing)

---

## Risk Assessment

**Low risk:**
- Additive system (doesn't modify existing core mechanics)
- Can be enabled/disabled via config flag during testing
- Well-established science (not speculative)

**Potential complications:**
- May require recalibrating biodiversity boundary thresholds
- Interaction with existing tipping cascade logic needs careful testing

---

## Next Steps

1. Post to research channel requesting literature review
2. Wait for research-skeptic validation of proposed approach
3. Implement if approved via orchestrator workflow

---

## Sources

Per research debate session `reviews/research_debate_session_20251125.md`:
- Extinction debt identified as missing critical system
- 200+ papers document phenomenon
- Directly affects biodiversity → food security → mortality pathway
