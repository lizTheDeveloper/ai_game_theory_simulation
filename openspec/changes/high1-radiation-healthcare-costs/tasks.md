# HIGH-1: Radiation Healthcare Costs Integration - Tasks

**Status:** Proposed
**Priority:** HIGH
**Estimated Effort:** 2-3 days

---

## Quality Gate 1: Research Validation

### TASK-001: Literature Review (super-alignment-researcher)
**Status:** Pending
**Priority:** CRITICAL
**Estimated:** 2-3 hours

Verify and expand research foundation:

**Healthcare Cost Sources:**
- [ ] CDC Emergency Preparedness 2024 - ARS treatment costs
- [ ] REMM (Radiation Emergency Medical Management) - Medical countermeasures
- [ ] American Cancer Society 2024 - Cancer treatment costs
- [ ] WHO Global Health Expenditure Database 2024 - Healthcare capacity

**Additional Sources Needed:**
- [ ] Mass casualty surge capacity studies (2024-2025)
- [ ] Healthcare infrastructure resilience to disasters
- [ ] Regional healthcare cost variations (U.S. vs global average)
- [ ] Cancer latency period modeling (5-30 years post-exposure)

**Deliverable:** `research/radiation_healthcare_costs_20251208.md`

---

### TASK-002: Contradictory Evidence Search (research-skeptic)
**Status:** Pending
**Priority:** HIGH
**Estimated:** 2 hours

Challenge assumptions and find contradictory evidence:

**Questions to Investigate:**
- Are CDC cost estimates realistic for mass casualty scenarios? (economies of scale vs scarcity)
- Do healthcare systems have 2-3% surge capacity, or is that optimistic?
- Should cancer latency be modeled explicitly or as immediate burden?
- Are there examples of healthcare system collapse from disasters we can calibrate against?

**Deliverable:** `reviews/radiation_healthcare_critique_20251208.md`

---

### TASK-003: Research Validation Decision
**Status:** Pending
**Priority:** CRITICAL
**Estimated:** 30 minutes

**Decision Point:** Grade A-F based on research quality
- Grade A/B → Proceed to implementation
- Grade C → Revise research, address gaps
- Grade D/F → Block implementation, fundamental issues

---

## Implementation Phase

### TASK-004: Data Structure Implementation (simulation-maintainer)
**Status:** Pending (blocked by QG1)
**Priority:** HIGH
**Estimated:** 0.5 days

Add radiation demand tracking to healthcare system:

**Files:**
- [ ] `src/types/game.ts` - Add `radiationDemand` to `HealthcareSystem`
- [ ] `src/simulation/initializeGameState.ts` - Initialize new fields
- [ ] `src/simulation/utils/assertions.ts` - Add validation utilities (if needed)

**Requirements:**
- All fields must have clear units and research justification
- Use defensive programming (no silent fallbacks)
- Type-safe with strict TypeScript

---

### TASK-005: Healthcare Radiation Phase (simulation-maintainer)
**Status:** Pending (blocked by TASK-004)
**Priority:** HIGH
**Estimated:** 1 day

Create new phase to bridge radiation modeling → healthcare system:

**File:** `src/simulation/engine/phases/HealthcareRadiationPhase.ts`

**Responsibilities:**
1. Extract patient counts from `state.nuclearWinter.radiationZones`
2. Calculate ARS treatment demand (moderate/severe/lethal cohorts)
3. Accumulate lifetime excess cancer patients from `lifetimeExcessCancerRisk`
4. Calculate healthcare system stress multiplier
5. Update `state.healthcareSystem.radiationDemand`

**Requirements:**
- Must use assertion utilities (no silent fallbacks)
- Must use RNG as required parameter (deterministic)
- Must use pictographic event language (emoji conventions)
- Must register in `PhaseOrchestrator.ts` with correct dependencies

**Dependencies:**
- AFTER: `RadiationModelingPhase`, `NuclearWinterPhase`
- BEFORE: `HealthcareSystemPhase`, `EconomicPhase`

---

### TASK-006: Economic Integration (simulation-maintainer)
**Status:** Pending (blocked by TASK-005)
**Priority:** HIGH
**Estimated:** 0.5 days

Integrate healthcare costs into economic calculations:

**Files:**
- [ ] `src/simulation/utils/recoveryCalculations.ts` - Modify `getGDPProxy()`
- [ ] `src/simulation/economicPhase.ts` - Add healthcare cost multiplier

**Implementation:**
- Healthcare burden reduces GDP (treatment costs, lost productivity)
- Infrastructure damage from nuclear winter reduces healthcare capacity
- Regional variation (if decided in TASK-003 open questions)

---

### TASK-007: Quality of Life Integration (simulation-maintainer)
**Status:** Pending (blocked by TASK-005)
**Priority:** MEDIUM
**Estimated:** 0.5 days

Connect radiation healthcare stress to QoL health dimension:

**Files:**
- [ ] `src/simulation/qualityOfLife.ts` - Update health calculation
- [ ] `src/simulation/multiParadigmDUI.ts` - Update paradigm health indicators

**Implementation:**
- Healthcare overload reduces general population health access
- Radiation stress cascades to non-radiation healthcare needs
- Multi-paradigm perspectives reflect healthcare crisis differently

---

### TASK-008: Unit Tests (unit-test-writer)
**Status:** Pending (blocked by TASK-005)
**Priority:** HIGH
**Estimated:** 0.5 days

Create comprehensive unit tests:

**File:** `src/simulation/__tests__/healthcareRadiation.test.ts`

**Test Coverage:**
- [ ] ARS patient count calculation (moderate/severe/lethal cohorts)
- [ ] Cancer patient accumulation (lifetime excess risk integration)
- [ ] Healthcare stress multiplier calculation
- [ ] Determinism (same seed = same outputs)
- [ ] Edge cases (no radiation, extreme radiation, infrastructure collapse)
- [ ] Assertion utilities trigger on invalid values

**Target:** 80%+ coverage for new phase

---

### TASK-009: Integration Tests (integration-test-writer)
**Status:** Pending (blocked by TASK-006, TASK-007)
**Priority:** HIGH
**Estimated:** 0.5 days

Test full radiation → healthcare → economy → QoL flow:

**File:** `tests/integration/radiationHealthcareEconomy.test.ts`

**Test Scenarios:**
1. Nuclear war → ARS treatment demand → healthcare costs → GDP reduction
2. Long-term cancer burden → sustained healthcare demand → economic drag
3. Healthcare infrastructure collapse → cascading health crisis → QoL decline
4. Regional variation (if implemented)

**Validation:**
- All tests deterministic (same seed = same outputs)
- Cost estimates realistic (compare to CDC/WHO baselines)
- Economic impact measurable (nuclear war should reduce GDP)

---

## Quality Gate 2: Architecture Review

### TASK-010: Architecture Review (architecture-skeptic)
**Status:** Pending (blocked by TASK-009)
**Priority:** HIGH
**Estimated:** 2 hours

Post-implementation architecture review:

**Focus Areas:**
- [ ] Performance: Any O(n²) patterns or deep cloning?
- [ ] State Propagation: Does radiation → healthcare → economy → QoL flow correctly?
- [ ] Complexity: Is the abstraction appropriate or over-engineered?
- [ ] Missing Connections: What else should integrate but doesn't?

**Deliverable:** `reviews/architecture_review_high1_radiation_healthcare_20251208.md`

**Decision Point:** Grade A-F
- CRITICAL/HIGH issues → MUST address before merge
- MEDIUM/LOW issues → Backlog as technical debt

---

### TASK-011: Monte Carlo Validation (priya)
**Status:** Pending (blocked by TASK-009)
**Priority:** HIGH
**Estimated:** 2 hours

Statistical validation of implementation:

**Requirements:**
- [ ] N≥10 deterministic runs (same seed = identical outputs)
- [ ] Coefficient of variation < 0.01% (strict determinism)
- [ ] Outcome distribution realistic (nuclear war → healthcare crisis)
- [ ] Cost estimates within research-backed ranges

**Deliverable:** `logs/mc_high1_validation_20251208.log`

---

## Documentation & Archival

### TASK-012: Wiki Documentation (wiki-documentation-updater)
**Status:** Pending (blocked by QG2)
**Priority:** MEDIUM
**Estimated:** 1 hour

Update system documentation:

**Files:**
- [ ] `docs/wiki/README.md` - Add Healthcare-Radiation integration section
- [ ] `docs/wiki/systems/healthcare.md` - Update with radiation demand tracking
- [ ] `docs/wiki/systems/nuclear-winter.md` - Document healthcare connection

---

### TASK-013: Implementation History (architect)
**Status:** Pending (blocked by QG2)
**Priority:** MEDIUM
**Estimated:** 30 minutes

Archive completed work:

**Deliverable:** `docs/implementation-history/HIGH-1_radiation_healthcare_costs_20251208.md`

**Contents:**
- Implementation summary
- Research sources used
- Quality gate outcomes (QG1 grade, QG2 grade)
- Monte Carlo validation results
- Lessons learned

---

### TASK-014: Roadmap Update (architect)
**Status:** Pending (blocked by TASK-013)
**Priority:** MEDIUM
**Estimated:** 15 minutes

Update OpenSpec specs:

**Files:**
- [ ] `openspec/specs/simulation/spec.md` - Mark HIGH-1 as COMPLETE
- [ ] `openspec/specs/project/spec.md` - Update Active Work section
- [ ] Archive change proposal to `docs/implementation-history/`

---

## Summary

**Total Estimated Effort:** 2-3 days
**Critical Path:** TASK-001 → TASK-002 → TASK-003 → TASK-004 → TASK-005 → TASK-008 → TASK-010 → TASK-011

**Parallelization Opportunities:**
- TASK-006 and TASK-007 can run in parallel after TASK-005
- TASK-012 and TASK-013 can run in parallel after TASK-011

**Blockers:**
- Quality Gate 1 (TASK-003) blocks all implementation
- Quality Gate 2 (TASK-010, TASK-011) blocks merge and documentation

---

**Status:** Ready for Quality Gate 1
