# Proposal: Supply Chain Cascade Propagation

**Created:** 2025-12-12
**Priority:** HIGH
**Status:** Quality Gate 1 (Research Validation) - PENDING
**Estimated Effort:** 2-3 days implementation

---

## Motivation

### Problem Statement

Current collapse scenarios in the simulation may be **2-5x too slow** because we model individual system failures without accounting for cascade propagation through interconnected infrastructure and supply chains.

**Evidence from Session 70 Research Debate:**
- We model climate impacts, economic shocks, and social unrest as separate systems
- Real-world crises propagate through supply chains, infrastructure dependencies, and financial networks
- Texas freeze 2021: 3-day grid failure → 4.5M without water → $195B damages (cascade, not isolated failure)
- COVID-19: Supply chain disruptions → manufacturing halts → unemployment → demand collapse (cascade)

### What's Missing

1. **Just-in-time manufacturing vulnerabilities**
   - 72-hour inventory buffers in critical industries
   - Tier-3 supplier visibility (0.2% according to McKinsey 2024)
   - Buffer exhaustion → production halt → downstream cascade

2. **Single points of failure**
   - Taiwan semiconductor concentration
   - Shipping chokepoints (Suez, Panama, Malacca, Hormuz)
   - Financial infrastructure (SWIFT, clearing systems)

3. **Infrastructure cascades**
   - Power → water → food → healthcare propagation
   - Sequential dependencies (can't restore food before power)
   - Compound timelines (hours to critical, days to catastrophic)

4. **Finance → supply chain propagation**
   - Credit freeze → JIT collapse
   - Payment system failures → trade paralysis
   - Unemployment → demand collapse → further contraction

### Why Now

This is a **HIGH priority** gap identified through research debate. The simulation currently treats systems as loosely coupled when they are tightly integrated in reality.

**Supporting Research:**
- Scheffer et al. 2023 (Nature): Cascade failures are dominant mode of civilizational collapse
- Drewry 2024: Global shipping 40% more concentrated than 2010 (increased SPOF risk)
- McKinsey 2024: 38,000 tier-3 suppliers per company, 0.2% visibility (cascade blind spot)

---

## Proposed Solution

### High-Level Approach

Add a new phase system: `updateSupplyChainCascades` that models:

1. **JIT Buffer Tracking**
   - Track inventory buffers for critical inputs (semiconductors, rare earths, etc.)
   - Model buffer depletion during disruptions
   - Trigger production halts when buffers exhausted
   - Propagate to dependent industries

2. **SPOF Monitoring**
   - Track status of critical chokepoints (shipping, semiconductors, finance)
   - Calculate reroute costs/delays when chokepoints fail
   - Model global trade disruption percentages

3. **Infrastructure Cascade Propagation**
   - Model power → water → food → healthcare sequential dependencies
   - Use time-based propagation (hours to days)
   - Require sequential restoration (power first, then water, then food)

4. **Finance Cascade Modeling**
   - Credit availability → cash reserves → production halts
   - Payment system status → trade paralysis
   - Employment cascades (unemployment → demand → supply chain contraction)

### Integration with Existing Systems

**Works with existing crisis cascade multipliers:**
- `research/crisis_cascade_multipliers_20251020.md` provides 1.5-2.5x multipliers for polycrisis
- Supply chain cascades ADD propagation mechanisms to existing compound effects
- Both systems work together: cascades spread crises, multipliers amplify overlaps

**Affects existing systems:**
- Economic: Supply chain disruptions → GDP impacts, unemployment
- Social: Infrastructure failures → quality of life, mortality
- Climate: Resource scarcity → mitigation/adaptation constraints
- Geopolitical: Chokepoint failures → international tensions

### Success Metrics

Feature is successful when:
- Collapse scenarios show realistic cascade timelines (validated against historical events)
- Monte Carlo runs produce diverse outcomes (not all collapse, not all thrive)
- Infrastructure failures propagate sequentially (power → water → food)
- Financial shocks cascade to real economy within realistic timeframes
- CV < 0.01% for determinism (same seed = same cascade)

---

## Alternatives Considered

### Alternative 1: Increase existing crisis severity
**Pros:** Simple, no new code
**Cons:** Doesn't capture cascade mechanisms, unrealistic parameter values

### Alternative 2: Add ad-hoc cascade logic to each system
**Pros:** Granular control
**Cons:** Code duplication, circular dependencies, unmaintainable

### Alternative 3: Post-processing cascade layer
**Pros:** Clean separation
**Cons:** Can't feed back to upstream systems, limited dynamic interaction

**Chosen approach:** Dedicated phase system integrates cleanly, uses crisis cascade multipliers, allows dynamic propagation.

---

## Dependencies

### Research Dependencies
- Supply chain cascade research (Cynthia) - **IN PROGRESS**
- Research validation (Sylvia) - **PENDING**

### Code Dependencies
- Existing crisis cascade multiplier system (`src/simulation/crisisManagement.ts`)
- GameState interface (`src/types/game.ts`)
- Phase orchestrator (`src/simulation/engine/PhaseOrchestrator.ts`)

### Data Dependencies
- Inventory buffer parameters (from research)
- SPOF criticality data (from research)
- Cascade propagation speeds (from research)
- Recovery time baselines (from research)

---

## Risks & Mitigation

### Risk 1: Complexity Creep
**Risk:** Too many cascade types → simulation becomes overwhelming
**Mitigation:** Start with 2-3 core cascades (JIT, infrastructure, finance), expand iteratively based on data

### Risk 2: Performance Issues
**Risk:** Cascade calculations every step → performance bottleneck
**Mitigation:** Only calculate when thresholds crossed (crisis active, infrastructure degraded, etc.)

### Risk 3: Over-tuned Pessimism
**Risk:** Cascades make all scenarios collapse
**Mitigation:** Research-backed parameters (conservative estimates), Monte Carlo validation, compare to historical baselines

### Risk 4: Circular Dependencies
**Risk:** Infrastructure systems depend on each other (power needs water, water needs power)
**Mitigation:** Sequential propagation in single step (power → water → food), no same-step feedback loops

### Risk 5: Integration Conflicts
**Risk:** Supply chain cascades conflict with crisis cascade multipliers
**Mitigation:** Cascades provide propagation, multipliers provide amplification - complementary, not overlapping

---

## Timeline

### Phase 1: Research & Validation (3-5 hours)
- [ ] Research gathering (Cynthia)
- [ ] Research critique (Sylvia)
- [ ] Parameter extraction
- [ ] Quality Gate 1 pass

### Phase 2: Implementation (1-2 days)
- [ ] GameState additions
- [ ] Phase implementation (JIT, SPOF, infrastructure, finance)
- [ ] Integration with crisis cascades
- [ ] Unit tests
- [ ] Integration tests

### Phase 3: Validation (4-6 hours)
- [ ] Monte Carlo runs (N≥10)
- [ ] Determinism check (CV < 0.01%)
- [ ] Historical comparison (Texas 2021, COVID-19)
- [ ] Distribution validation

### Phase 4: Review & Documentation (2-4 hours)
- [ ] Architecture review (Quality Gate 2)
- [ ] Address CRITICAL/HIGH issues
- [ ] Wiki updates
- [ ] DevLog creation
- [ ] OpenSpec spec merge & archive

**Total Estimated:** 2-3 days

---

## Open Questions

1. **How many cascade types to implement initially?**
   - Lean: JIT + infrastructure only (faster, core mechanisms)
   - Complete: All 4 types (JIT, SPOF, infrastructure, finance)
   - **Recommendation:** All 4, but phased implementation if time constrained

2. **Should cascades be reversible?**
   - Once infrastructure cascade starts, can it be stopped mid-cascade?
   - **Recommendation:** Yes, with interventions (emergency response, resource allocation)

3. **How do cascades interact with existing prevention/mitigation?**
   - Can climate tech deployment prevent supply chain cascades?
   - Can UBI cushion employment cascades?
   - **Recommendation:** Research should inform intervention effectiveness

4. **What's the right level of detail for SPOF modeling?**
   - Track every shipping route? Or aggregate to major chokepoints?
   - **Recommendation:** Major chokepoints only (Suez, Panama, Malacca, Hormuz, Taiwan semis)

---

## Next Steps

1. **Await research completion** (Cynthia: `research/supply_chain_cascade_propagation_YYYYMMDD.md`)
2. **Research validation** (Sylvia: Quality Gate 1)
3. **Update this proposal** based on research findings
4. **Create tasks.md** with detailed implementation checklist
5. **Create specs/simulation/spec.md** with delta (ADDED requirements)
6. **Handoff to Roy** for implementation

---

## References

- Session 70 Research Debate (collapse 2-5x too slow finding)
- `research/crisis_cascade_multipliers_20251020.md` (existing cascade research)
- `.claude/agents/HANDOFF_supply_chain_cascades_orchestration.md` (orchestration plan)
- Texas freeze 2021 case study (infrastructure cascade)
- COVID-19 supply chain disruption (JIT cascade)
- McKinsey 2024 (tier-3 supplier visibility)
- Drewry 2024 (shipping concentration)
- Scheffer et al. 2023 (cascade collapse modes)
