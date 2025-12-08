# M-6 Enhanced Radiation Modeling - Workflow Orchestration

**Orchestrator:** Claude Code (orchestrator-1)
**Started:** 2025-12-08 10:15 UTC
**Status:** Research Phase

## Workflow Sequence

### Phase 1: Research & Validation (Quality Gate 1)

#### Step 1.1: Research Phase
**Agent:** super-alignment-researcher (Cynthia)
**Channel:** `research`
**Estimated Duration:** 1-2 hours

**Invocation Command:**
```
Cynthia, I need comprehensive research on radiation biology for nuclear winter modeling.

**Topic:** Enhanced Radiation Modeling for Nuclear War Scenarios

**Research Questions:**
1. What are the ICRP tissue weighting factors for different organs/tissues?
2. What are the dose-response curves for acute radiation syndrome (mortality by dose level)?
3. What are the chronic cancer risk estimates from low-dose radiation exposure?
4. What is the timeline for radiation sickness progression (prodromal, latent, manifest, recovery)?
5. What is the radioactive isotope composition of nuclear fallout and decay rates?
6. How effective are medical countermeasures (potassium iodide, CSF therapy)?

**Requirements:**
- 2+ peer-reviewed sources per question (2024-2025 preferred)
- Extract specific parameter values (LD50/60, tissue weights, cancer risk per Sv)
- Document methodology from each source
- Provide timeline estimates for radiation effects
- Save to: research/radiation_biology_YYYYMMDD.md

**Context:**
Current implementation is overly simplistic (single intensity value, fixed monthly death rate). Need realistic acute vs chronic exposure modeling with tissue-specific sensitivity.

See proposal: openspec/changes/m6-enhanced-radiation-modeling/proposal.md
```

**Expected Output:**
- `research/radiation_biology_YYYYMMDD.md` with:
  - ICRP tissue weighting factors (wT values)
  - LD50/60 values for acute exposure
  - Dose-response curves (mortality by Gray level)
  - Chronic cancer risk (% per Sv)
  - Fallout isotope composition (I-131, Cs-137, Sr-90)
  - Timeline for radiation sickness phases
  - All parameters cited to peer-reviewed sources

#### Step 1.2: Research Validation
**Agent:** research-skeptic (Sylvia)
**Channel:** `research`
**Estimated Duration:** 30-60 minutes

**Invocation Command:**
```
Sylvia, please validate the radiation biology research.

**Research Document:** research/radiation_biology_YYYYMMDD.md (from Cynthia)

**Validation Criteria:**
1. Are the tissue weighting factors from authoritative sources (ICRP)?
2. Are the dose-response curves based on human data (Hiroshima/Nagasaki cohorts)?
3. Is the LNT model for cancer risk still consensus (2024-2025)?
4. Are the fallout isotope compositions realistic for modern weapons?
5. Do the timelines match clinical observations (Chernobyl, Fukushima)?
6. Are there contradictory findings in recent literature?

**Quality Gate 1 Threshold:** Grade B+ or higher to proceed to implementation

**Output:** reviews/radiation_biology_critique_YYYYMMDD.md
```

**Decision Point:**
- If Grade A or B+: Proceed to implementation
- If Grade B- or lower: Loop back to research (address concerns)
- If Grade C or below: Pivot or reject feature

### Phase 2: Implementation & Testing

#### Step 2.1: Core Implementation
**Agent:** simulation-maintainer (Roy)
**Channel:** `implementation`
**Estimated Duration:** 2-3 hours

**Invocation Command:**
```
Roy, implement enhanced radiation modeling based on validated research.

**Research:** research/radiation_biology_YYYYMMDD.md (validated by Sylvia)
**Proposal:** openspec/changes/m6-enhanced-radiation-modeling/proposal.md

**Implementation Tasks:**

1. **Extend RadiationZone interface** (src/types/nuclearWinter.ts):
   - Add exposureType: 'acute' | 'chronic'
   - Add doseLevelGy: number (Gray units)
   - Add tissueWeightedDose: number (effective dose in Sv)
   - Add radiationSicknessPhase: 'prodromal' | 'latent' | 'manifest' | 'recovery' | null

2. **Create radiation biology module** (src/simulation/radiationBiology.ts):
   - calculateTissueWeightedDose(organDoses, tissueWeights): number
   - calculateAcuteMortality(doseGy: number): number (LD50/60 curve)
   - calculateChronicCancerRisk(doseSv: number, years: number): number
   - getRadiationSicknessPhase(doseGy: number, daysSinceExposure: number): string

3. **Update nuclearWinter.ts**:
   - Modify triggerNuclearWinter() to initialize radiation zones with doseLevelGy
   - Enhance updateRadiationZones() to use tissue-weighted calculations
   - Add radiation sickness timeline tracking
   - Distinguish acute vs chronic mortality pathways

4. **Defensive coding requirements:**
   - Use assertFinite for all dose calculations
   - Use assertProbability for mortality rates
   - Use assertInRange for dose levels (0-50 Gy)
   - No silent fallbacks (fail loudly on invalid data)
   - Deterministic RNG for stochastic cancer risk

5. **Emoji conventions:**
   - ☢️ for radiation events
   - ⚠️ for radiation sickness warnings
   - ❌ for fatal dose exposures
   - Register any new emojis in EMOJI_EVENT_MAP.txt

**Validation:**
- All calculations must use assertion utilities
- No Math.random() calls (use RNG parameter)
- Type checking passes (npx tsc --noEmit)
- No NaN propagation

**Output:** Modified files with enhanced radiation modeling
```

#### Step 2.2: Unit Testing
**Agent:** unit-test-writer
**Channel:** `testing`
**Estimated Duration:** 30-45 minutes

**Invocation Command:**
```
Create unit tests for enhanced radiation modeling.

**Module:** src/simulation/radiationBiology.ts
**Test File:** tests/radiation/radiationBiology.test.ts

**Test Cases:**
1. Tissue weighted dose calculation (verify ICRP factors applied correctly)
2. Acute mortality curve (test LD50/60 at 4-6 Gy)
3. Chronic cancer risk calculation (5% per Sv baseline)
4. Radiation sickness phase transitions (timeline validation)
5. Edge cases (zero dose, extreme dose >50 Gy)
6. Deterministic behavior (same dose = same mortality with seed)

**Coverage target:** >90% for new code
```

#### Step 2.3: Integration Testing
**Agent:** integration-test-writer
**Channel:** `testing`
**Estimated Duration:** 30-45 minutes

**Invocation Command:**
```
Create integration tests for nuclear scenarios with enhanced radiation.

**Test File:** tests/integration/nuclearRadiation.test.ts

**Scenarios:**
1. Limited nuclear war (5 Tg soot, acute exposure in 2 countries)
2. Full-scale war (150 Tg soot, chronic fallout globally)
3. Multiple radiation zones with different dose levels
4. Radiation decay over 60 months (verify half-lives)
5. Interaction with population mortality system
6. Medical countermeasure effects (if implemented)

**Validation:**
- Population decreases from radiation exposure
- Acute mortality peaks in first 3 months
- Chronic cancer risk accumulates over years
- Deterministic with same seed
```

### Phase 3: Quality Assurance (Quality Gate 2)

#### Step 3.1: Monte Carlo Validation
**Agent:** priya
**Channel:** `testing`
**Estimated Duration:** 1 hour

**Invocation Command:**
```
Priya, run Monte Carlo validation for enhanced radiation modeling.

**Test Scenario:** Nuclear war with radiation exposure
**Seed:** 42
**Runs:** N=10 minimum

**Validation Criteria:**
1. Deterministic: All runs with seed=42 produce identical results
2. CV < 0.01% for all radiation metrics (total deaths, zone levels)
3. Effectiveness metrics: (initial_dose - final_dose) / initial_dose
4. Distribution analysis: Mortality follows expected dose-response curve

**Output:** Log file with:
- Run-by-run comparison (radiation deaths, zone counts)
- CV calculation for all metrics
- Distribution plots (if variance detected)
- Determinism verdict (PASS/FAIL)

**Save to:** logs/mc_radiation_validation_YYYYMMDD.log
```

#### Step 3.2: Architecture Review
**Agent:** architecture-skeptic
**Channel:** `architecture`
**Estimated Duration:** 30-60 minutes

**Invocation Command:**
```
Review enhanced radiation modeling architecture.

**Files:**
- src/simulation/radiationBiology.ts (new)
- src/simulation/nuclearWinter.ts (modified)
- src/types/nuclearWinter.ts (modified)

**Review Focus:**
1. Performance: O(n) complexity for radiation zone updates?
2. State propagation: Does tissue-weighted dose flow correctly?
3. NaN prevention: Are all calculations protected by assertions?
4. Complexity: Is new module justified or should it merge with nuclearWinter.ts?
5. Dependencies: Any circular dependencies introduced?

**Quality Gate 2 Threshold:** Grade B+ or higher to proceed to documentation

**Output:** reviews/radiation_architecture_YYYYMMDD.md
```

**Decision Point:**
- CRITICAL issues: MUST fix before documentation
- HIGH issues: Strongly recommended to fix
- MEDIUM issues: Document as known issues
- LOW issues: Optional improvements

### Phase 4: Documentation & Archival

#### Step 4.1: Merge Delta into Spec
**Agent:** architect
**Channel:** `documentation`
**Estimated Duration:** 15-30 minutes

**Invocation Command:**
```
Architect, merge M-6 delta into OpenSpec simulation spec.

**Change Proposal:** openspec/changes/m6-enhanced-radiation-modeling/
**Target Spec:** openspec/specs/simulation/spec.md

**Tasks:**
1. Update M-6 status from "Proposed" to "COMPLETE (YYYY-MM-DD)"
2. Add implementation summary (files modified, new modules)
3. Add research citations (from Cynthia's research doc)
4. Add quality gate grades (QG1 from Sylvia, QG2 from architecture-skeptic)
5. Add known issues (if any from reviews)
6. Link to implementation history doc
```

#### Step 4.2: Create Implementation History
**Agent:** architect
**Channel:** `documentation`
**Estimated Duration:** 15-30 minutes

**Invocation Command:**
```
Architect, create implementation history document for M-6.

**Template:** Similar to high7_conditional_climate_stability_floor_20251207.md

**Contents:**
1. Feature summary
2. Research backing (citations from Cynthia)
3. Implementation details (code changes, new modules)
4. Quality gate results (Sylvia's grade, architecture-skeptic's grade)
5. Monte Carlo validation results (priya's report)
6. Known issues (if any)
7. Timeline (actual hours spent per phase)

**Output:** docs/implementation-history/m6_enhanced_radiation_modeling_YYYYMMDD.md
```

#### Step 4.3: Archive Change Proposal
**Agent:** architect
**Channel:** `documentation`
**Estimated Duration:** 5 minutes

**Invocation Command:**
```
Architect, archive M-6 change proposal to completed.

**Tasks:**
1. Move openspec/changes/m6-enhanced-radiation-modeling/ to openspec/changes/completed/
2. Update openspec/changes/README.md (if exists) to mark M-6 complete
3. Verify all artifacts preserved (proposal.md, workflow.md, research docs, reviews)
```

## Coordination Protocol

### Entering Channels
Each agent enters their assigned channel at work start:

```typescript
// Cynthia entering research channel
mcp__chatroom__chatroom_enter({
  channel: "research",
  agent: "super-alignment-researcher",
  message: "Cynthia active: Researching radiation biology for M-6"
})

// Roy entering implementation channel
mcp__chatroom__chatroom_enter({
  channel: "implementation",
  agent: "simulation-maintainer",
  message: "Roy active: Implementing enhanced radiation modeling"
})
```

### Progress Updates
Post status at key milestones:

```typescript
mcp__chatroom__chatroom_post({
  channel: "research",
  agent: "super-alignment-researcher",
  status: "IN-PROGRESS",
  message: "Found 3 sources on tissue weighting factors (ICRP 103, 116, 133). Extracting parameters..."
})
```

### Handoffs Between Agents
Notify when passing work to next agent:

```typescript
mcp__chatroom__chatroom_post({
  channel: "research",
  agent: "super-alignment-researcher",
  status: "COMPLETED",
  message: "Research complete: research/radiation_biology_20251208.md\n\nKey findings:\n- ICRP 103 tissue weights (2007, reaffirmed 2024)\n- LD50/60 = 4.5 Gy without treatment (Preston et al. 2003)\n- LNT model: 5.5% cancer risk per Sv (BEIR VII, 2006)\n\n**HANDOFF to Sylvia:** Ready for validation"
})
```

### Quality Gate Notifications
Alert on gate pass/fail:

```typescript
mcp__chatroom__chatroom_post({
  channel: "research",
  agent: "research-skeptic",
  status: "COMPLETED",
  message: "Quality Gate 1: PASSED (Grade B+)\n\nResearch validated. ICRP sources authoritative, dose-response curves match Hiroshima data. Minor concern: LNT model debated for low doses, but consensus adequate.\n\n**CLEARED for implementation**"
})
```

### Blocked Status
If issues arise:

```typescript
mcp__chatroom__chatroom_post({
  channel: "implementation",
  agent: "simulation-maintainer",
  status: "BLOCKED",
  message: "❌ Type error in radiationBiology.ts - tissueWeights type incompatible with GameState\n\nNeed guidance: Should tissueWeights be in GameState or constants file?"
})
```

## Monitoring & Escalation

### Orchestrator Monitoring
Check channels every 30-60 minutes:

```typescript
// Check all channels for updates
mcp__chatroom__chatroom_read_new({channel: "research", agent: "orchestrator-1"})
mcp__chatroom__chatroom_read_new({channel: "implementation", agent: "orchestrator-1"})
mcp__chatroom__chatroom_read_new({channel: "testing", agent: "orchestrator-1"})
```

### Escalation Criteria
Escalate to human if:
- Quality gate fails twice (loop back twice, still Grade C)
- Agent reports BLOCKED for >2 hours
- Circular dependency detected between agents
- Monte Carlo validation fails determinism (CV > 0.01%)
- Timeline exceeds estimate by >50% (7.5h → 11+h)

## Success Metrics

### Feature Complete When:
- [ ] Research validated (Sylvia Grade B+ or higher)
- [ ] Implementation complete (Roy)
- [ ] All tests passing (unit + integration)
- [ ] Monte Carlo deterministic (priya, CV < 0.01%)
- [ ] Architecture reviewed (Grade B+ or higher)
- [ ] OpenSpec spec updated
- [ ] Implementation history created
- [ ] Change proposal archived

### Quality Metrics:
- Research quality: Grade B+ minimum
- Architecture quality: Grade B+ minimum
- Test coverage: >80%
- Monte Carlo CV: <0.01%
- Type safety: 0 TypeScript errors

### Timeline Metrics:
- Estimated: 5.5-7.5 hours
- Actual: (TBD - track per phase)
- Efficiency: actual/estimated (target: <1.3x)

## Post-Mortem Questions

After completion, document:
1. What went well? (successes to replicate)
2. What blocked progress? (obstacles to prevent)
3. How accurate were estimates? (improve future planning)
4. Which agents needed most guidance? (improve agent prompts)
5. Were quality gates effective? (caught issues early?)

---

**Next Action:** Invoke super-alignment-researcher (Cynthia) for research phase
