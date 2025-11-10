# Fix Scenario Analysis Phase 2 Critical Blockers

**Date:** November 10, 2025
**Priority:** CRITICAL
**Estimated Complexity:** 4-6 hours
**Owner:** Orchestrator

---

## Executive Summary

Scenario Analysis Phase 2 identified 3 CRITICAL blockers preventing virtuous cascade activation. Root cause analysis reveals:

1. **WorkflowAdaptation NaN:** LIKELY test script bug (production code has assertions)
2. **Alignment milestones = 0:** Code exists but NEVER CALLED by any phase
3. **Democratic participation ceiling:** Growth rate too slow (0.02-0.04%/month)

**Impact:** No governance intervention enables virtuous cascade (4+ spirals) - technology alone insufficient for utopia outcomes.

---

## Blocker 1: WorkflowAdaptation NaN (CRITICAL)

### Symptoms
- Scientific-acceleration scenario: workflowAdaptation = NaN%
- High-trust-start scenario: workflowAdaptation = 0-2%
- Low-inequality-start scenario: workflowAdaptation = NaN%
- Research budget $50B-$100B met threshold BUT scientific spiral NEVER activates

### Root Cause Analysis

**Production Code:** `src/simulation/workflowAdaptation.ts` has proper assertions (lines 74-81, 95-102, 141-147)

**Evidence:**
```typescript
// Line 74-81: Input validation
const current = assertProbability(
  state.society.workflowAdaptation ?? 0.21,
  { location: 'updateWorkflowAdaptation', valueName: 'society.workflowAdaptation', month: state.currentMonth }
);

// Line 141-147: AI capability validation
const capability = assertFinite(ai.capability, {
  location: 'updateWorkflowAdaptation',
  valueName: `aiAgent[${ai.id}].capability`,
  month: state.currentMonth,
  additionalInfo: { agentId: ai.id }
});
```

**Hypothesis:** Test scripts create scenarios with undefined/NaN AI capabilities → assertFinite catches error and throws → test logs NaN

**Action Required:**
1. Review scenario test scripts (`scripts/testScenarios.ts`, etc.)
2. Validate AI agent initialization in scenario setup
3. Check if god mode test properly initializes AI capabilities
4. Add defensive initialization in scenario loader (not production code)

**Priority:** HIGH (diagnostic only, not production bug)

---

## Blocker 2: Alignment Milestones = 0 (CRITICAL)

### Symptoms
- 0 alignment milestones achieved across ALL scenarios
- Alignment-first scenario: $10B/month + 70% trust + 80% institutional capacity → STILL 0 milestones
- Trust cascade NEVER triggers (requires 2+ milestones)

### Root Cause Analysis

**CRITICAL FINDING:** Code exists in `src/simulation/cooperativeSpirals.ts` but **NEVER CALLED**

**Evidence:**
```bash
$ grep -n "detectAlignmentSuccessMilestones\|applyTrustCascade" src/simulation/engine/phases/*.ts
# NO RESULTS - No phase calls these functions!
```

**Existing System:** `src/simulation/cooperativeSpirals.ts:32-61`
- `detectAlignmentSuccessMilestones()` - checks 4 milestone types (needs 2+ for credibility)
- `applyTrustCascade()` - applies 15% trust boost when milestones met
- Research-backed (Putnam 2000, Acemoglu & Robinson 2001, Ostrom 2009)

**Milestone Types:**
1. No misaligned deployments (24+ months)
2. High transparency (>70%) + information integrity (>60%)
3. Low alignment gap (<15%) - AIs honest, not sandbagging
4. Successfully resolved crisis with AI assistance

**Why It Never Triggers:**
- Phase system never calls `detectAlignmentSuccessMilestones()`
- Even if conditions met, no phase checks or applies effects
- Trust cascade exists but dormant

**Action Required:**
1. Create `AlignmentMilestonesPhase.ts` (order ~23.5, after trust calculation, before upward spirals)
2. Call `detectAlignmentSuccessMilestones()` each month
3. Call `applyTrustCascade()` when conditions met
4. Log milestone achievements (pictographic event language)
5. Update state.history.cooperativeSpirals tracking
6. Ensure phase registered in PhaseOrchestrator

**Research Questions for super-alignment-researcher:**
- Timeline for alignment milestone achievement (how long after $10B investment?)
- What factors accelerate/delay milestone progression?
- Historical precedent for institutional trust cascades (speed, magnitude)

**Priority:** CRITICAL (blocks trust cascade → cooperative AI ownership → humane utopia pathway)

---

## Blocker 3: Democratic Participation Ceiling (HIGH)

### Symptoms
- Participation rate stuck at 19-49% (need >60% for democratic spiral)
- Best cases:
  - Equality-first: 42% (18 points below threshold)
  - Alignment-first: 49% (11 points below threshold)
- Even optimal conditions (UBI + high trust + transparency) fail to reach 60%

### Root Cause Analysis

**Existing Mechanism:** `src/simulation/governanceQuality.ts:143-171`

**Growth Drivers:**
- Trust bonus: `(trustInAI - 0.5) * 0.02` = ±1%/month
- Transparency bonus: `(transparency - 0.5) * 0.015` = ±0.75%/month
- Apathy penalty: `meaningCrisis * -0.015` = -1.5%/month (if meaningCrisis = 100%)

**Best Case Math:**
- Alignment-first (49% after 49 months):
  - Starting: 40%
  - Growth needed: +9% over 49 months = +0.18%/month average
  - Current mechanics: +1% trust + 0.75% transparency - 0.33% apathy = **+1.42%/month theoretical**
  - **BUT only achieved 0.18%/month actual**

**Gap Analysis:** Theoretical +1.42%/month vs actual +0.18%/month = **87% of growth is being canceled**

**Missing Factors:**
1. **No UBI → participation feedback** (more free time → more engagement)
2. **No education quality → participation** (informed citizens participate more)
3. **No collective action success → participation** (efficacy breeds engagement)
4. **No exponential growth during critical mass** (30-50% should accelerate)

**Action Required:**
1. Add UBI feedback: `(economicTransitionStage >= 3) → +0.02%/month`
2. Add education quality: `(qualityOfLife.educationAccess > 0.7) → +0.015%/month`
3. Add S-curve acceleration: When participation 30-50%, apply network effects (+0.03%/month)
4. Add collective action efficacy: Successful climate coordination → participation boost

**Research Questions for super-alignment-researcher:**
- What drives democratic participation above 60%? (Nordic countries, direct democracy examples)
- Timeline for participation growth with UBI introduction (Alaska PFD data?)
- Network effects threshold for civic engagement (critical mass)
- Direct democracy vs representative democracy participation rates

**Priority:** HIGH (blocks democratic spiral → liquid democracy → collective climate action)

---

## Implementation Strategy

### Phase 1: Research & Validation (60-90 mins)

**super-alignment-researcher** (Cynthia):
1. Find peer-reviewed research on alignment milestone timelines
   - Search: "AI alignment validation", "AI safety milestones", "institutional trust technology adoption"
   - Extract: Timeline from investment to milestone achievement
   - Extract: Factors affecting milestone speed (trust, transparency, capacity)

2. Find research on democratic participation drivers
   - Search: "democratic participation rates", "civic engagement drivers", "UBI political participation"
   - Extract: What gets participation >60%? (Nordic countries, direct democracy cantons)
   - Extract: Network effects in civic engagement (critical mass thresholds)
   - Extract: Feedback loops (success → more participation)

**research-skeptic** (Sylvia):
- Validate research findings before implementation
- Check for contradictory evidence
- Identify methodological issues
- Quality Gate 1: Must pass before implementation

### Phase 2: Implementation (2-3 hours)

**simulation-maintainer** (Roy):
1. Create `AlignmentMilestonesPhase.ts`
   - Order: 23.5 (after trust calculation, before upward spirals)
   - Call `detectAlignmentSuccessMilestones()`
   - Call `applyTrustCascade()` when triggered
   - Log milestone achievements with emojis (register in EMOJI_EVENT_MAP.txt)
   - Update history tracking

2. Enhance `governanceQuality.ts` participation mechanics
   - Add UBI feedback loop
   - Add education quality factor
   - Add S-curve acceleration (30-50% critical mass)
   - Add collective action efficacy feedback
   - Use research-backed parameters (from Cynthia's findings)

3. Validate test scripts (diagnostic)
   - Check scenario AI initialization
   - Ensure capabilities are finite
   - Fix if needed (test code, not production)

**Testing:**
- Unit tests for new phase
- Integration test for milestone detection
- Validate participation growth math

### Phase 3: Validation (1-2 hours)

**priya** (Monte Carlo Validator):
1. Re-run scenario analysis Phase 2 scenarios:
   - scientific-acceleration
   - equality-first
   - alignment-first
   - high-trust-start
   - low-inequality-start

2. Validate fixes:
   - WorkflowAdaptation: No NaN, proper range (0-60%)
   - Alignment milestones: 0-4 achieved over 120 months
   - Participation rate: Break 60% ceiling with optimal interventions

3. Monte Carlo validation (N≥10):
   - Check outcome distribution changes
   - Measure spiral activation rates
   - Validate virtuous cascade can now trigger

### Phase 4: Architecture Review (30 mins)

**architecture-skeptic**:
- Review AlignmentMilestonesPhase state propagation
- Check for performance issues
- Validate no new NaN sources
- Ensure fail-loudly philosophy maintained
- Quality Gate 2: Address CRITICAL/HIGH issues before merge

### Phase 5: Documentation (30 mins)

**wiki-documentation-updater** (Historian):
- Update docs/wiki/README.md with alignment milestones system
- Document participation growth mechanics
- Add to system interactions map

**architect**:
- Archive this plan to plans/completed/
- Update MASTER_IMPLEMENTATION_ROADMAP.md
- Mark scenario analysis Phase 2 complete

---

## Success Criteria

**Fix 1: WorkflowAdaptation**
- ✅ No NaN in any scenario
- ✅ Scientific-acceleration: 0-60% range (research-backed)
- ✅ High-trust-start: >25% critical mass with $50B budget
- ✅ Scientific spiral activates when conditions met

**Fix 2: Alignment Milestones**
- ✅ Milestones detected when conditions met (2-4 milestones over 120 months)
- ✅ Alignment-first scenario: 2+ milestones achieved ($10B/month + trust + capacity)
- ✅ Trust cascade triggers (15% institutional capacity boost)
- ✅ Trust cascade enables cooperative AI ownership pathway

**Fix 3: Democratic Participation**
- ✅ Participation breaks 60% ceiling with optimal interventions
- ✅ Equality-first scenario: >60% participation (UBI + low inequality + trust)
- ✅ Democratic spiral activates in at least 1 scenario
- ✅ Growth rate consistent with research (S-curve, network effects)

**Overall Success:**
- ✅ Re-run scenario analysis Phase 2 scenarios
- ✅ At least 1 scenario achieves 4+ spirals (virtuous cascade)
- ✅ Monte Carlo validation (N≥10, CV < 0.01% for determinism)
- ✅ Spiral activation rates improve from Phase 2 baseline
- ✅ No new CRITICAL/HIGH architectural issues

---

## Timeline Estimate

- Research & Validation: 60-90 mins
- Implementation: 2-3 hours
- Validation: 1-2 hours
- Architecture Review: 30 mins
- Documentation: 30 mins
- **Total: 5-7 hours**

---

## Dependencies

**Blockers:**
- None (all fixes are independent)

**Related Work:**
- God mode gap research (reviews/god_mode_gaps_research_roadmap_20251109.md)
- Scenario analysis Phase 2 (reviews/scenario_analysis_phase2_results_20251110.md)
- Workflow adaptation system (src/simulation/workflowAdaptation.ts)
- Cooperative spirals (src/simulation/cooperativeSpirals.ts)
- Governance quality (src/simulation/governanceQuality.ts)

**Next Phase:**
- After fixes: Scenario analysis Phase 3 (comprehensive scenario, extended timeline)
- Test threshold sensitivity (90% of thresholds - 54% vs 60% participation)
- Add missing policy options (cultural investment, biodiversity funding)

---

**END PLAN**
