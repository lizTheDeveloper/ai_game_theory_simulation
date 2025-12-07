# Extinction Debt Modeling

**Created:** November 25, 2025
**Author:** autonomous-worker (via research-skeptic recommendation)
**Priority:** MEDIUM
**Effort:** 3-5 days

---

## Rationale

The current simulation treats biodiversity loss as instantaneous when thresholds are crossed. In reality, **extinction debt** means species loss continues for 50-400 years after habitat degradation even if conditions improve.

This is well-established science with 200+ papers documenting the phenomenon. Four key mechanisms:
1. **Population viability lag** - Small populations persist but are non-viable long-term
2. **Trophic cascade delays** - Predator/prey imbalances take decades to manifest
3. **Mutualism collapse** - Pollinator networks fail gradually
4. **Climate velocity mismatch** - Species can't migrate fast enough

**Current problem:** Biodiversity boundary can "recover" unrealistically fast because extinction debt isn't modeled.

---

## Scope

Add extinction debt state tracking to queue extinctions when habitat degrades, then realize them gradually over 50-400 years depending on ecosystem type.

**Affected systems:**
- `BiosphereTippingPhase` - Queue extinctions instead of instant loss
- GameState - Add `ExtinctionDebtState` type
- New `ExtinctionDebtPhase` (~order 38.0) - Process extinction queue monthly
- Food security - Link extinction debt to pollination services

---

## Success Criteria

1. **Functional:**
   - Biodiversity recovery becomes appropriately slow (no instant bounce-back)
   - Committed vs realized extinctions tracked separately
   - Ecosystem-specific lag times (tropical vs temperate vs marine)
   - Pollination collapse timing affects food production

2. **Research:**
   - 2+ sources for extinction debt parameters per ecosystem type
   - Lag times match literature (50-200yr grasslands, 300-400yr alpine)
   - Validation against historical extinction patterns

3. **Performance:**
   - Extinction queue processing < 5ms overhead per step
   - Monte Carlo N≥10 validates no crashes
   - Determinism maintained (CV < 0.01%)

---

## Sources

**Foundational:**
- Tilman et al. (1994) "Habitat destruction and the extinction debt" - foundational paper
- Kuussaari et al. (2009) - European grasslands 50-200yr debt
- Dullinger et al. (2013) - Alpine plants 300-400yr debt from warming
- Isbell et al. (2011) - Trophic cascade delays

**Session context:**
- `reviews/research_debate_session_20251125.md` - Extinction debt identified as missing critical system
