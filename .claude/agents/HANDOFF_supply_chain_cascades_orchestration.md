# Supply Chain Cascade Propagation - Orchestration Plan

**Date:** 2025-12-12
**Priority:** HIGH
**Estimated Effort:** 2-3 days implementation
**Confidence:** HIGH

## Context from Session 70 Research Debate

**Impact:** Collapse scenarios may be 2-5x too slow (we model individual failures, not cascades)

**What's Missing:**
- Just-in-time manufacturing (72-hour inventory buffers)
- Single points of failure (Taiwan semiconductors, Suez Canal, SWIFT)
- Power → water → food → healthcare cascades
- Finance → supply chain → employment propagation

**Evidence:**
- COVID-19 analysis (McKinsey 2024): Average company has 38,000 tier-3 suppliers, 0.2% visibility
- Texas freeze 2021: 3-day grid failure → 4.5M without water → $195B damages
- Drewry Shipping (2024): Global shipping 40% more concentrated than 2010
- Scheffer et al. (2023, Nature): Cascade failures are dominant mode of civilizational collapse

## Workflow Phases

### Phase 1: Research & Validation (Quality Gate 1)

**Agent:** super-alignment-researcher (Cynthia)
**Task:** Gather peer-reviewed research on supply chain cascade mechanisms

**Research Questions:**
1. **Just-in-time manufacturing vulnerabilities**
   - What are typical inventory buffer sizes in critical industries?
   - How quickly do disruptions propagate through supply networks?
   - What are the threshold points for cascade failures?

2. **Single points of failure**
   - Taiwan semiconductor concentration (what % of global capacity?)
   - Shipping chokepoints (Suez, Panama, Malacca, Hormuz)
   - Financial infrastructure (SWIFT alternatives, clearing systems)
   - Critical resource dependencies

3. **Infrastructure cascade mechanisms**
   - Power → water propagation (pumping, treatment)
   - Water → food propagation (agriculture, processing)
   - Food → healthcare propagation (nutrition, operations)
   - Healthcare → labor force → economic output

4. **Finance → supply chain propagation**
   - Credit freezes → just-in-time collapse
   - Payment system failures → supply chain paralysis
   - Currency collapse → trade disruption
   - Unemployment → demand collapse → further supply chain reduction

5. **Quantitative parameters needed**
   - Cascade multipliers (1 failure → N downstream failures)
   - Propagation speeds (hours, days, weeks)
   - Recovery times by sector
   - Threshold sensitivities

**Evidence Already Available:**
- `research/crisis_cascade_multipliers_20251020.md` - 1.5-2.5x multipliers for polycrisis
- COVID-19 supply chain data (McKinsey 2024)
- Texas freeze infrastructure cascade (2021)
- Shipping concentration data (Drewry 2024)
- Civilizational collapse modes (Scheffer 2023)

**Deliverable:** `research/supply_chain_cascade_propagation_YYYYMMDD.md`

**Agent Memory Context:**
```json
{
  "agent_id": "cynthia",
  "task": "Supply chain cascade research",
  "focus_areas": ["JIT manufacturing", "SPOFs", "infrastructure cascades", "finance cascades"],
  "deliverable": "research/supply_chain_cascade_propagation_YYYYMMDD.md"
}
```

---

### Phase 1b: Research Critique (Quality Gate 1)

**Agent:** research-skeptic (Sylvia)
**Task:** Validate research findings before implementation

**Validation Criteria:**
- [ ] 2+ peer-reviewed sources per mechanism
- [ ] Parameter values justified from data (not assumptions)
- [ ] Mechanisms described (not just effects)
- [ ] Interaction map with existing systems
- [ ] Expected timeline defined (early/mid/late game)
- [ ] Failure modes documented
- [ ] No methodological flaws
- [ ] No contradictory evidence ignored

**Critical Questions:**
1. Are cascade multipliers conservatively estimated or speculative?
2. Do propagation speeds reflect real-world timescales?
3. Are single points of failure truly critical or redundancy exists?
4. Do infrastructure cascades account for backup systems?
5. Are finance cascades deterministic or contingent on specific conditions?

**Decision Gate:**
- ✅ PASS → Proceed to OpenSpec change proposal
- ❌ FAIL (minor) → Loop back to researcher for better sources
- ❌ FAIL (fatal) → PIVOT to different approach or REJECT feature

**Agent Memory Context:**
```json
{
  "agent_id": "sylvia",
  "task": "Supply chain cascade validation",
  "research_file": "research/supply_chain_cascade_propagation_YYYYMMDD.md",
  "deliverable": "reviews/supply_chain_cascades_critique_YYYYMMDD.md"
}
```

---

### Phase 2: OpenSpec Change Proposal

**Agent:** orchestrator (this context)
**Task:** Create structured change proposal

**Location:** `openspec/changes/supply-chain-cascades/`

**Files to Create:**
1. `proposal.md` - Feature description, motivation, approach
2. `tasks.md` - Implementation task breakdown
3. `specs/simulation/spec.md` - Delta format (ADDED/MODIFIED sections)

**Spec Delta Requirements:**
```markdown
## ADDED: Supply Chain Cascade Propagation

### Requirement: Just-In-Time Vulnerability Modeling
The simulation SHALL model inventory buffer exhaustion in critical supply chains.

#### Scenario: Manufacturing Disruption Cascade
- WHEN a critical input is disrupted (semiconductors, rare earths, etc.)
- AND inventory buffers are depleted (72-hour typical for JIT)
- THEN downstream production halts within N days
- AND cascades to dependent industries
- AND recovery requires both input restoration AND inventory rebuild

### Requirement: Single Point of Failure Modeling
The simulation SHALL track critical infrastructure chokepoints.

#### Scenario: Shipping Chokepoint Closure
- WHEN Suez/Panama/Malacca/Hormuz closes
- THEN X% of global trade reroutes (longer, costlier)
- AND Y% of goods face severe delays
- AND cascades to manufacturing (input shortages) and consumers (price shocks)

### Requirement: Infrastructure Cascade Propagation
The simulation SHALL model interdependent infrastructure failures.

#### Scenario: Power → Water → Food → Healthcare Cascade
- WHEN power grid fails for T hours
- THEN water pumping/treatment stops
- AND food processing/refrigeration stops after T+N hours
- AND healthcare operations degrade
- AND recovery requires sequential restoration (power first, then water, then food)

### Requirement: Finance → Supply Chain Propagation
The simulation SHALL model financial system impacts on physical supply chains.

#### Scenario: Credit Freeze Cascade
- WHEN credit markets freeze (2008-style)
- THEN JIT payment systems fail
- AND suppliers demand cash-on-delivery
- AND companies without cash reserves halt production
- AND unemployment → demand collapse → further supply chain contraction
```

**Deliverable:** Structured change proposal in OpenSpec format

---

### Phase 3: Implementation

**Agent:** simulation-maintainer (Roy)
**Task:** Implement supply chain cascade mechanics

**Implementation Locations:**
- `src/simulation/supplyChainCascades.ts` (new file)
- `src/types/game.ts` (GameState additions)
- `src/simulation/engine/PhaseOrchestrator.ts` (phase registration)

**GameState Additions Needed:**
```typescript
interface GameState {
  // ... existing fields ...

  supplyChainCascades: {
    justInTimeVulnerability: {
      semiconductorBuffer: number;  // months of inventory
      rareEarthBuffer: number;
      criticalInputsBuffer: number;
      disruptionActive: boolean;
      daysUntilCascade: number;
    };

    singlePointsOfFailure: {
      suezStatus: 'open' | 'restricted' | 'closed';
      panamaStatus: 'open' | 'restricted' | 'closed';
      malaccaStatus: 'open' | 'restricted' | 'closed';
      swiftStatus: 'operational' | 'restricted' | 'failed';
      taiwanSemiconductorCapacity: number;  // % of global
    };

    infrastructureCascades: {
      powerGridStatus: number;  // 0-1
      waterSystemStatus: number;
      foodSystemStatus: number;
      healthcareSystemStatus: number;
      cascadeActive: boolean;
      hoursInCascade: number;
    };

    financeCascades: {
      creditAvailability: number;  // 0-1
      paymentSystemStatus: number;
      cashReservesDepletion: number;
      employmentCascadeActive: boolean;
    };
  };
}
```

**Phase Implementation:**
```typescript
export function updateSupplyChainCascades(
  state: GameState,
  rng: () => number
): void {
  if (!rng || typeof rng !== 'function') {
    throw new Error('❌ CRITICAL: RNG required for deterministic simulation');
  }

  // 1. Update JIT vulnerabilities
  updateJustInTimeBuffers(state, rng);

  // 2. Check single point failures
  checkSinglePointFailures(state, rng);

  // 3. Propagate infrastructure cascades
  propagateInfrastructureCascades(state, rng);

  // 4. Propagate finance cascades
  propagateFinanceCascades(state, rng);

  // 5. Calculate compound effects (use crisis cascade multipliers)
  applyCompoundCascadeEffects(state);
}
```

**Defensive Coding Requirements:**
- ✅ Required RNG (never optional with Math.random fallback)
- ✅ Use assertion utilities (assertFinite, assertStateProperty)
- ✅ No silent fallback values (fail loudly on NaN/undefined)
- ✅ Pictographic event language (emoji conventions)
- ✅ Structured logging to /logs/

**Testing Requirements:**
- Unit tests for each cascade type
- Integration tests for compound effects
- Monte Carlo validation (N≥10 runs)
- Determinism validation (same seed = same results)

**Agent Memory Context:**
```json
{
  "agent_id": "roy",
  "task": "Supply chain cascade implementation",
  "research_file": "research/supply_chain_cascade_propagation_YYYYMMDD.md",
  "critique_file": "reviews/supply_chain_cascades_critique_YYYYMMDD.md",
  "change_proposal": "openspec/changes/supply-chain-cascades/"
}
```

---

### Phase 4: Monte Carlo Validation

**Agent:** priya
**Task:** Statistical validation of cascade mechanics

**Validation Requirements:**
1. **Determinism Check:** CV < 0.01% for identical seeds
2. **Effectiveness Measurement:** (initial - final) / initial for cascade impacts
3. **Distribution Validation:** Cascade outcomes follow expected patterns
4. **Gap Analysis:** Identify scenarios where cascades don't trigger as expected

**Test Scenarios:**
- Isolated JIT disruption
- Single point failure (e.g., Suez closure alone)
- Infrastructure cascade (power → water → food)
- Finance cascade (credit freeze → unemployment)
- Compound polycrisis (3+ simultaneous)

**Metrics to Track:**
- Cascade propagation speed (days to full impact)
- Economic damage multipliers
- Recovery time by scenario
- Mortality impacts (if cascades reach food/healthcare)

**Deliverable:** `reviews/supply_chain_cascades_monte_carlo_YYYYMMDD.md`

---

### Phase 5: Architecture Review (Quality Gate 2)

**Agent:** architecture-skeptic
**Task:** Review implementation for architectural issues

**Review Criteria:**
- [ ] No O(n²) or worse performance issues
- [ ] State propagation is unidirectional (no circular dependencies)
- [ ] Integration with existing systems is clean
- [ ] No deep cloning in hot paths
- [ ] Cascade logic is modular and testable
- [ ] No complexity creep (follows single responsibility)

**Critical Questions:**
1. Do cascade calculations create performance bottlenecks?
2. Is state propagation circular (power affects water affects power)?
3. Do cascades interact cleanly with crisis cascade multipliers?
4. Are there edge cases where cascades don't terminate?

**Decision Gate:**
- ✅ PASS → Proceed to documentation
- ⚠️ CRITICAL/HIGH issues → MUST fix before proceeding
- ℹ️ MEDIUM/LOW issues → Document for future cleanup

**Deliverable:** `reviews/supply_chain_cascades_architecture_YYYYMMDD.md`

---

### Phase 6: Documentation & Archival

**Agent:** wiki-documentation-updater (Historian)
**Task:** Update wiki and create devlog

**Wiki Updates:**
1. Add "Supply Chain Cascades" section to `docs/wiki/README.md`
2. Document cascade mechanics, parameters, interactions
3. Link to research files and reviews
4. Add examples and expected behaviors

**DevLog Creation:**
Create `devlogs/supply_chain_cascades_implementation_YYYYMMDD.md`:
- Feature overview
- Implementation approach
- Key decisions and rationale
- Test results and validation
- Future improvements

**Agent:** architect
**Task:** Archive to implementation history

**Actions:**
1. Merge OpenSpec delta into `openspec/specs/simulation/spec.md`
2. Archive change proposal to `docs/implementation-history/supply-chain-cascades/`
3. Update `openspec/specs/project/spec.md` progress summary
4. Mark tasks complete in project tracking

---

## Coordination Protocol

### Chatroom Channels to Use:
- `coordination` - Overall progress updates
- `research` - Research & validation discussions
- `implementation` - Implementation progress
- `architecture` - Architecture review discussions

### Status Updates:
Post to coordination channel at each phase transition:
```markdown
---
**orchestrator** | 2025-12-12 HH:MM | [STATUS]

Supply Chain Cascades: [PHASE NAME]
**Progress:** [Description]
**Next:** [Next agent/phase]
**Blockers:** [Any issues]
---
```

### Handoff Pattern:
Each agent receives:
1. Research files from previous phases
2. Critique/review files
3. Memory context (agent_id, task, deliverables)
4. Clear success criteria

---

## Success Criteria

Feature complete when:
- ✅ Research validated (no fatal flaws)
- ✅ OpenSpec change proposal created
- ✅ Implementation complete (code works, tests pass)
- ✅ Monte Carlo validated (deterministic, realistic distributions)
- ✅ Architecture reviewed (no CRITICAL/HIGH issues)
- ✅ Wiki updated
- ✅ OpenSpec spec updated and archived

---

## Risk Assessment

**Risks:**
1. **Complexity creep** - Too many cascade types → overwhelming simulation
   - Mitigation: Start with 2-3 core cascades, expand iteratively
2. **Performance issues** - Cascade calculations in every step
   - Mitigation: Only calculate when thresholds crossed
3. **Over-tuned pessimism** - Cascades make all scenarios collapse
   - Mitigation: Research-backed parameters, Monte Carlo validation
4. **Circular dependencies** - Infrastructure systems depend on each other
   - Mitigation: Sequential propagation (power → water → food), no feedback loops in single step

**Estimated Token Usage:**
- Research: 30k-40k tokens
- Validation: 20k-30k tokens
- Implementation: 40k-50k tokens
- Reviews: 30k-40k tokens
- Documentation: 20k-30k tokens
**Total:** ~140k-190k tokens (within budget for HIGH priority)

---

## Notes

This feature addresses one of the most significant gaps identified in Session 70 research debate. Collapse scenarios being 2-5x too slow suggests we're missing major systemic feedback loops. Supply chain cascades are a well-documented mechanism in resilience research and represent a critical missing piece.

The feature should integrate cleanly with existing crisis cascade multipliers (`crisis_cascade_multipliers_20251020.md`) and compound effects systems.
