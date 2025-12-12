# Tasks: Supply Chain Cascade Propagation

**Feature:** Supply chain cascade modeling
**Status:** Quality Gate 1 - PENDING (awaiting research)
**Orchestration:** `.claude/agents/HANDOFF_supply_chain_cascades_orchestration.md`

---

## Phase 1: Research & Validation (Quality Gate 1)

### Research (Cynthia)
- [ ] Just-in-time manufacturing vulnerabilities
  - [ ] Inventory buffer sizes by industry
  - [ ] Propagation speeds through supply networks
  - [ ] Threshold points for cascade failures
  - [ ] Recovery times after buffer exhaustion
- [ ] Single points of failure
  - [ ] Taiwan semiconductor concentration data
  - [ ] Shipping chokepoint criticality (Suez, Panama, Malacca, Hormuz)
  - [ ] Financial infrastructure dependencies (SWIFT, clearing)
  - [ ] Other critical dependencies (rare earths, crops)
- [ ] Infrastructure cascades
  - [ ] Power → water timelines and mechanisms
  - [ ] Water → food propagation
  - [ ] Food → healthcare dependencies
  - [ ] Quantitative parameters (hours/days to cascade)
- [ ] Finance cascades
  - [ ] Credit freeze → JIT collapse mechanisms
  - [ ] Payment system failure impacts
  - [ ] Employment → demand feedback loops
- [ ] Quantitative parameters
  - [ ] Cascade multipliers (1 → N failures)
  - [ ] Propagation speeds (hours/days/weeks)
  - [ ] Recovery times by sector
  - [ ] Threshold sensitivities
- [ ] Create deliverable: `research/supply_chain_cascade_propagation_YYYYMMDD.md`

### Validation (Sylvia)
- [ ] Review research file for methodological soundness
- [ ] Check 2+ peer-reviewed sources per mechanism
- [ ] Verify parameter values are data-backed (not assumptions)
- [ ] Validate mechanisms described (not just effects)
- [ ] Confirm interaction map with existing systems
- [ ] Check timeline expectations (early/mid/late game)
- [ ] Identify failure modes
- [ ] Look for contradictory evidence
- [ ] Create critique: `reviews/supply_chain_cascades_critique_YYYYMMDD.md`
- [ ] **DECISION:** Pass/Fail/Iterate

### Quality Gate 1 Checkpoint
- [ ] Research validated by Sylvia
- [ ] No fatal methodological flaws
- [ ] Parameters are conservative and research-backed
- [ ] Ready to proceed to implementation

---

## Phase 2: Implementation (Roy)

### GameState Additions
- [ ] Add `supplyChainCascades` to GameState interface
  - [ ] `justInTimeVulnerability` subsystem
    - [ ] `semiconductorBuffer: number` (months)
    - [ ] `rareEarthBuffer: number`
    - [ ] `criticalInputsBuffer: number`
    - [ ] `disruptionActive: boolean`
    - [ ] `daysUntilCascade: number`
  - [ ] `singlePointsOfFailure` subsystem
    - [ ] `suezStatus: 'open' | 'restricted' | 'closed'`
    - [ ] `panamaStatus: 'open' | 'restricted' | 'closed'`
    - [ ] `malaccaStatus: 'open' | 'restricted' | 'closed'`
    - [ ] `swiftStatus: 'operational' | 'restricted' | 'failed'`
    - [ ] `taiwanSemiconductorCapacity: number` (%)
  - [ ] `infrastructureCascades` subsystem
    - [ ] `powerGridStatus: number` (0-1)
    - [ ] `waterSystemStatus: number`
    - [ ] `foodSystemStatus: number`
    - [ ] `healthcareSystemStatus: number`
    - [ ] `cascadeActive: boolean`
    - [ ] `hoursInCascade: number`
  - [ ] `financeCascades` subsystem
    - [ ] `creditAvailability: number` (0-1)
    - [ ] `paymentSystemStatus: number`
    - [ ] `cashReservesDepletion: number`
    - [ ] `employmentCascadeActive: boolean`

### Phase Implementation
- [ ] Create `src/simulation/supplyChainCascades.ts`
- [ ] Implement `updateSupplyChainCascades(state, rng)` main function
  - [ ] CRITICAL: RNG must be required, never optional
  - [ ] Use assertion utilities (assertFinite, assertStateProperty)
  - [ ] No silent fallback values
  - [ ] Pictographic event language (emoji conventions)
- [ ] Implement `updateJustInTimeBuffers(state, rng)`
  - [ ] Track buffer depletion during disruptions
  - [ ] Trigger production halts at exhaustion
  - [ ] Propagate to dependent industries
  - [ ] Log with 📦 emoji
- [ ] Implement `checkSinglePointFailures(state, rng)`
  - [ ] Monitor chokepoint status
  - [ ] Calculate reroute costs/delays
  - [ ] Model trade disruption percentages
  - [ ] Log with 🚨 emoji for critical failures
- [ ] Implement `propagateInfrastructureCascades(state, rng)`
  - [ ] Power → water propagation (hours)
  - [ ] Water → food propagation (hours to days)
  - [ ] Food → healthcare propagation (days)
  - [ ] Sequential dependencies (can't restore food before power)
  - [ ] Log with 🌍 (infrastructure) + 💥 (cascade) pattern
- [ ] Implement `propagateFinanceCascades(state, rng)`
  - [ ] Credit freeze → JIT impacts
  - [ ] Payment system failures → trade paralysis
  - [ ] Employment cascades
  - [ ] Log with 💰 emoji
- [ ] Implement `applyCompoundCascadeEffects(state)`
  - [ ] Integration with crisis cascade multipliers
  - [ ] Compound effects when multiple cascades active
  - [ ] Use existing multiplier research (1.5-2.5x)

### Phase Registration
- [ ] Register phase in `PhaseOrchestrator.ts`
- [ ] Add to appropriate phase group (likely after crisis management)
- [ ] Ensure phase order doesn't create circular dependencies

### Defensive Coding Checklist
- [ ] RNG is required parameter (never optional)
- [ ] All calculations use assertion utilities
- [ ] No `?? defaultValue` in calculations
- [ ] No `isNaN(x) ? fallback : x` patterns
- [ ] Geometric means have MIN_FLOOR
- [ ] No circular dependencies in single step
- [ ] Division operations protected from zero
- [ ] Access population from `state.humanPopulationSystem.population`
- [ ] Use `getGDPProxy(state)` for GDP

### Testing
- [ ] Unit tests for each cascade type
  - [ ] `updateJustInTimeBuffers.test.ts`
  - [ ] `checkSinglePointFailures.test.ts`
  - [ ] `propagateInfrastructureCascades.test.ts`
  - [ ] `propagateFinanceCascades.test.ts`
- [ ] Integration tests
  - [ ] Compound cascade effects test
  - [ ] Integration with crisis cascade multipliers
  - [ ] Sequential infrastructure restoration test
- [ ] Edge case tests
  - [ ] Zero buffers edge case
  - [ ] All SPOFs failed simultaneously
  - [ ] Cascade interruption (emergency response)
  - [ ] Recovery after cascade

---

## Phase 3: Monte Carlo Validation (Priya)

### Determinism Check
- [ ] Run N=10 Monte Carlo simulations with identical seed
- [ ] Calculate coefficient of variation (CV) for cascade timelines
- [ ] **GATE:** CV must be < 0.01% for determinism
- [ ] If CV > 0.01%, debug non-determinism source

### Effectiveness Measurement
- [ ] Measure cascade impacts: (initial - final) / initial
- [ ] JIT buffer exhaustion → production reduction
- [ ] SPOF closure → trade disruption
- [ ] Infrastructure cascade → QoL degradation
- [ ] Finance cascade → unemployment increase

### Distribution Validation
- [ ] Cascade outcomes follow expected patterns
  - [ ] Not all scenarios collapse
  - [ ] Not all scenarios thrive
  - [ ] Historical baselines (Texas 2021, COVID-19) within range
- [ ] Cascade propagation speeds match research timelines
- [ ] Recovery times realistic

### Gap Analysis
- [ ] Identify scenarios where cascades don't trigger as expected
- [ ] Check for missing cascade pathways
- [ ] Validate threshold sensitivities
- [ ] Compare to historical data (Texas freeze, COVID-19)

### Deliverable
- [ ] Create `reviews/supply_chain_cascades_monte_carlo_YYYYMMDD.md`
- [ ] Document CV analysis
- [ ] Document effectiveness measurements
- [ ] Document distribution validation
- [ ] Document gaps/improvements needed

---

## Phase 4: Architecture Review (Quality Gate 2)

### Performance Review (Architecture Skeptic)
- [ ] Check for O(n²) or worse complexity
- [ ] Verify cascade calculations don't create bottlenecks
- [ ] Ensure only calculated when thresholds crossed (not every step)
- [ ] Check for deep cloning in hot paths

### State Propagation Review
- [ ] Verify unidirectional propagation (power → water → food)
- [ ] Check for circular dependencies
- [ ] Ensure cascades don't create feedback loops in single step
- [ ] Validate sequential restoration requirements

### Integration Review
- [ ] Clean integration with crisis cascade multipliers
- [ ] No conflicts with existing systems
- [ ] Modular and testable code structure
- [ ] Follows single responsibility principle

### Deliverable
- [ ] Create `reviews/supply_chain_cascades_architecture_YYYYMMDD.md`
- [ ] Rate issues: CRITICAL, HIGH, MEDIUM, LOW
- [ ] **GATE:** Must address CRITICAL/HIGH before documentation

### Quality Gate 2 Checkpoint
- [ ] Architecture review complete
- [ ] CRITICAL issues resolved
- [ ] HIGH issues resolved or documented
- [ ] Ready for documentation

---

## Phase 5: Documentation & Archival

### Wiki Updates (Historian)
- [ ] Add "Supply Chain Cascades" section to `docs/wiki/README.md`
- [ ] Document cascade mechanisms
  - [ ] JIT buffer exhaustion
  - [ ] SPOF failures
  - [ ] Infrastructure propagation
  - [ ] Finance propagation
- [ ] Document parameters and sources
- [ ] Document interactions with existing systems
- [ ] Add examples and expected behaviors
- [ ] Link to research files and reviews

### DevLog Creation
- [ ] Create `devlogs/supply_chain_cascades_implementation_YYYYMMDD.md`
- [ ] Feature overview
- [ ] Implementation approach
- [ ] Key decisions and rationale
- [ ] Test results and validation
- [ ] Future improvements

### OpenSpec Updates (Architect)
- [ ] Merge `openspec/changes/supply-chain-cascades/specs/simulation/spec.md` delta into `openspec/specs/simulation/spec.md`
- [ ] Archive change proposal to `docs/implementation-history/supply-chain-cascades_YYYYMMDD.md`
- [ ] Update `openspec/specs/project/spec.md` progress summary
- [ ] Mark feature complete in project tracking

---

## Completion Checklist

Feature is complete when ALL of the following are true:

- [ ] Research validated (Quality Gate 1 passed)
- [ ] Implementation complete (code works, follows defensive coding standards)
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Monte Carlo validation complete (CV < 0.01%, realistic distributions)
- [ ] Architecture review complete (Quality Gate 2 passed)
- [ ] CRITICAL issues resolved
- [ ] HIGH issues resolved or documented
- [ ] Wiki updated
- [ ] DevLog created
- [ ] OpenSpec spec merged and archived
- [ ] No regressions in existing tests

---

## Agent Assignments

- **Research:** Cynthia (super-alignment-researcher)
- **Validation:** Sylvia (research-skeptic)
- **Implementation:** Roy (simulation-maintainer)
- **Monte Carlo:** Priya (quantitative validator)
- **Architecture Review:** Architecture Skeptic
- **Documentation:** Historian (wiki-documentation-updater)
- **Archival:** Architect
- **Coordination:** Orchestrator (this context)

---

## Estimated Effort

- Research & Validation: 3-5 hours
- Implementation: 1-2 days
- Monte Carlo Validation: 4-6 hours
- Architecture Review: 2-4 hours
- Documentation: 2-4 hours

**Total:** 2-3 days

---

## Notes

This is HIGH priority work addressing a significant gap (collapse scenarios 2-5x too slow). The tasks are structured to ensure research-backed implementation with proper quality gates.

Conservative parameters only. No speculation. Fail loudly on errors. Research tool, not disaster porn.
