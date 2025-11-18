# Task: Irreversibility Framework Phase 2 - Biosphere Extinction Debt

**TIER 1 CRITICAL Priority**
**Date:** November 17, 2025
**Assigned To:** Orchestrator
**Phase:** 2 of 6 (Phase 1 COMPLETE - Novel entities irreversibility)

## Context

Phase 1 of irreversibility framework is COMPLETE:
- Novel entities now has asymptotic recovery (75-year half-life, 15% floor)
- Energy-gated cleanup mechanics working
- Prevention-first paradigm validated
- Research foundation: Cousins et al. 2022, Sörengård et al. 2024 (Grade B+)

**Phase 2 Scope:** Implement extinction debt mechanics for biosphere_integrity boundary.

## Implementation Requirements

### 1. Add Extinction Debt Properties to Biosphere Boundary

**File:** `src/simulation/planetaryBoundaries.ts` (line ~129-147, biosphere_integrity definition)

**Add these properties:**
```typescript
irreversible: true,                    // Extinction debt is permanent
recoveryHalfLife: 200,                 // Century-scale ecosystem recovery
minimumAsymptoticValue: 0.05,          // 5% extinction debt floor (extinct species don't return)
extinctionDebtCommitted: 0,            // NEW - committed extinctions not yet realized
extinctionDebtRealized: 0,             // NEW - extinctions that have occurred
habitatLagMonths: 240,                 // NEW - 20-year lag between habitat loss and species loss
```

### 2. Extinction Debt Tracking Logic

**File:** `src/simulation/planetaryBoundaries.ts` (in update phase function)

**Add extinction debt accumulation:**
- When biosphere value worsens → increase `extinctionDebtCommitted`
- After `habitatLagMonths` delay → convert committed to realized
- Realized debt contributes to currentValue (cannot be removed)

**Asymptotic recovery:**
- Use existing `asymptoteRecovery()` function from `src/simulation/utils/irreversibility.ts`
- 200-year half-life (slower than novel entities' 75 years)
- 5% floor (permanent extinction debt - new species can evolve, but timescale > simulation)

### 3. Prevention vs Remediation

**Prevention (habitat protection):**
- Reduces NEW extinction debt accumulation
- High effectiveness (protects remaining habitat)

**Remediation (habitat restoration):**
- Reduces existing debt, but limited by:
  - Species availability (can't restore extinct species)
  - Ecosystem assembly timescales (decades to centuries)
  - Partial irreversibility (new ecosystems, not original)

### 4. Research Citations Required

Must cite peer-reviewed sources for:
- Extinction debt lag timescales (decades between habitat loss and extinction)
- Recovery half-lives (century-scale for ecosystems)
- Asymptotic floors (what % of biodiversity loss is permanent?)
- Prevention vs restoration effectiveness

**Recommended sources:**
- Tilman et al. (1994) - Extinction debt concept
- Kuussaari et al. (2009) - Extinction debt review
- Haddad et al. (2015) - Habitat fragmentation effects
- IPBES (2019) - Biodiversity loss rates

## Integration Points

- Use existing `asymptoteRecovery()` utility
- Follow same pattern as novel entities (Phase 1)
- Maintain determinism (required RNG, no Math.random())
- Use assertion utilities for validation

## Success Criteria

- ✅ Biosphere boundary has extinction debt properties
- ✅ Extinction debt accumulates with habitat loss
- ✅ Time-delayed realization (lag effects)
- ✅ Asymptotic recovery (200-year half-life, 5% floor)
- ✅ Prevention more effective than restoration
- ✅ All parameters have peer-reviewed citations
- ✅ Type safety maintained (npx tsc --noEmit passes)
- ✅ Monte Carlo validation ready (deterministic, CV < 0.01%)

## Workflow

1. **Research (if needed):** super-alignment-researcher for extinction debt citations
2. **Validation:** research-skeptic reviews parameters
3. **Implementation:** simulation-maintainer implements mechanics
4. **Testing:** Unit tests + integration tests
5. **Validation:** Priya runs Monte Carlo (N≥10)
6. **Review:** architecture-skeptic reviews
7. **Documentation:** wiki-documentation-updater syncs

## Timeline Estimate

- Research: 1-2 hours (if needed - may use existing biosphere literature)
- Implementation: 2-3 hours
- Testing: 1 hour
- Monte Carlo: 30 minutes
- Review: 1 hour
- **Total:** 5.5-7.5 hours

## Expected Impact

- Biosphere recovery becomes realistic (century-scale, not instant)
- Extinction debt visible in model (committed vs realized)
- Prevention incentivized (cheaper than restoration)
- Permanent biodiversity loss floor (aligns with IPBES research)

---

**Status:** READY TO START
**Blocking Issues:** None (Phase 1 provides utilities and patterns)
**Dependencies:** Phase 1 COMPLETE (irreversibility utilities exist)
