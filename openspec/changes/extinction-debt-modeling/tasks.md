# Extinction Debt Modeling - Implementation Tasks

## Phase 1: Research (Quality Gate 1)
- [ ] Literature review of extinction debt quantification (2024-2025 sources preferred)
- [ ] Extract lag times by ecosystem type (tropical, temperate, alpine, marine)
- [ ] Document debt ratios (queued vs realized extinctions)
- [ ] Identify recovery impossibility thresholds
- [ ] Map pollination collapse timing to food production impacts
- [ ] Add to research verification queue
- [ ] Pass research validation (Grade B+ required)

**Key papers to review:**
- Tilman et al. (1994) - foundational
- Kuussaari et al. (2009) - grasslands 50-200yr
- Dullinger et al. (2013) - alpine plants 300-400yr
- Isbell et al. (2011) - trophic cascades
- Recent 2024-2025 updates

## Phase 2: Implementation
- [ ] Add `ExtinctionDebtState` interface to `src/types/game.ts`
  - queuedExtinctions: ExtinctionQueueEntry[]
  - realizedExtinctions: number
  - debtRatio: number
  - ecosystemCollapse tracking per ecosystem
- [ ] Modify `BiosphereTippingPhase` to queue extinctions (not instant loss)
- [ ] Create `ExtinctionDebtPhase` (order ~38.0)
  - Process extinction queue monthly
  - Ecosystem-specific lag times
  - Realize queued extinctions over time
- [ ] Connect extinction debt to food security (pollination services)
- [ ] Add config flag to enable/disable during testing

## Phase 3: Validation
- [ ] Run Monte Carlo N≥10 to verify no crashes
- [ ] Check biodiversity recovery is appropriately slow
- [ ] Validate against historical extinction patterns
- [ ] Check CV < 0.01% (determinism)
- [ ] Verify pollination collapse affects food production correctly

## Phase 4: Architecture Review (Quality Gate 2)
- [ ] Submit for architecture-skeptic review
- [ ] Address CRITICAL/HIGH issues
- [ ] Pass QG2 (Grade B+ required)

## Phase 5: Documentation
- [ ] Update wiki with extinction debt mechanics
- [ ] Document parameter sources and lag times
- [ ] Add ecosystem-specific examples
- [ ] Add to completed features list
