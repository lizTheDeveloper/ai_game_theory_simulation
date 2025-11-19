# Novel Entities Zero-Effectiveness - Workflow Execution Plan

**Date:** November 13, 2025
**Coordinator:** Workflow Orchestrator
**Status:** Ready for Phase 2 (VALIDATION)

---

## Executive Summary

The Novel Entities Zero-Effectiveness validation workflow is ready to proceed from VALIDATION phase through to completion. All prerequisite work is complete:

- ✅ Research: 742 lines, 16 peer-reviewed sources (2024-2025)
- ✅ Design: 276 lines, full implementation plan
- ✅ Verification Spec: Critical claims identified for validation
- ✅ Quality Gate 1: Grade B+ (PASSED)

**Current State:** Ready for research-skeptic final validation
**Estimated Total Effort:** 24-35 hours across 5 phases
**Priority:** CRITICAL (blocks god mode retest, utopia pathway validation)

---

## Phase Breakdown

### Phase 1: VALIDATION (6-8 hours) - **CURRENT PHASE**

**Objective:** Final validation of research claims before implementation

**Agent:** research-skeptic (Sylvia)

**Method:** To invoke the research-skeptic, use one of these approaches:

**Option A: Direct Claude Code Subagent (Recommended)**
If you have access to Claude Code's subagent system:
```
Create new chat with subagent: research-skeptic
Provide prompt from validation summary below
```

**Option B: Manual Review**
If subagent system unavailable, conduct manual validation:
1. Verify citations exist (DOI lookups for all 16 sources)
2. Read key papers (Ling 2024, Cousins 2022, Kane 2022)
3. Confirm specific claims with quotes + page numbers
4. Assess parameter justifications (especially 90% irreversible fraction)

**Input Files:**
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/novel_entities_zero_effectiveness_20251113.md`
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/plans/novel_entities_model_redesign_20251113.md`
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/verification_7ac8b8f_20251113.md`
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/reviews/novel_entities_validation_summary_20251113.md`

**Output:** `reviews/novel_entities_research_critique_FINAL_20251113.md`

**Success Criteria:**
- All CRITICAL claims verified (90% irreversible fraction)
- All HIGH claims verified (Ling 2024 costs, Montreal Protocol ratio)
- Final grade B+ or higher
- PASS decision for Quality Gate 2

**Deliverable Example:**
```markdown
# Novel Entities Research Validation - Final Review

**Grade:** B+ (maintains Quality Gate 1 standard)
**Decision:** PASS - Implementation may proceed

## Critical Claims Verification

### 1. Irreversible Fraction (90%)
**Status:** ⚠️ DERIVED ASSUMPTION (not direct measurement)
**Recommendation:** Run sensitivity analysis (85%, 90%, 95%)
**Justification:** Cousins 2022 (global distribution) + Kane 2022 (centuries recovery) support high irreversibility but don't quantify exact percentage.

[Continue for all claims...]

## Parameter Justification Assessment
[Detailed review of model parameters...]

## Final Recommendations
[Any required changes before implementation...]
```

---

### Phase 2: IMPLEMENTATION (11-16 hours)

**Objective:** Implement Novel Entities model redesign

**Agent:** simulation-maintainer (Roy) OR feature-implementer (Moss)

**Conditional Trigger:** Only proceed if Phase 1 validation PASSES

**Tasks:**

#### Part 1: Add Prevention Technologies (3-4 hours)
Files to modify:
- `src/data/technologyTree.ts` - Add 3 new TIER 0-1 techs
- `src/simulation/engine/phases/TechnologyUnlockPhase.ts` - Handle regulatory tech
- `tests/unit/technology-prevention.test.ts` - Unit tests

Technologies to add:
1. `pfas_production_ban` (TIER 0, effectiveness 45%, timeline 10-20y)
2. `plastic_production_phaseout` (TIER 1, effectiveness 35%, timeline 20-30y)
3. `chemical_substitution_acceleration` (TIER 1, effectiveness 20%, timeline 5-15y)

#### Part 2: Update Remediation Effectiveness (4-5 hours)
Files to modify:
- `src/simulation/engine/phases/PlanetaryBoundariesPhase.ts` - Effectiveness gating
- `src/simulation/engine/phases/TechnologyEffectivenessPhase.ts` - Multiplier calculations
- `tests/integration/novel-entities-gated.test.ts` - Integration tests

Multipliers to implement:
- Regulation multiplier: 0.01 → 1.0 (based on prevention tech deployment)
- Energy multiplier: Gated by renewable surplus
- Concentration multiplier: 0.001 for dilute streams, 1.0 for point sources
- Time lag factor: 30 years to full scale
- Rebound factor: 0.7 (30% offset by induced production)

#### Part 3: Add Irreversibility Logic (2-3 hours)
Files to modify:
- `src/simulation/engine/phases/PlanetaryBoundariesPhase.ts` - Asymptotic floor
- `src/types/game.ts` - Add irreversibleFraction field
- `tests/unit/novel-entities-irreversible.test.ts` - Unit tests

Logic to implement:
```typescript
const irreversibleFraction = 0.90;
const irreversibleFloor = state.planetaryBoundaries.novelEntitiesPeak * irreversibleFraction;
const newLevel = Math.max(irreversibleFloor, currentLevel - cleanup + newContamination);
```

**Success Criteria:**
- All unit tests pass
- Type checking passes (`npx tsc --noEmit`)
- No NaN values in calculations
- Defensive assertions for all parameters

---

### Phase 3: ARCHITECTURE REVIEW (3-4 hours)

**Objective:** Ensure implementation meets quality standards

**Agent:** architecture-skeptic

**Conditional Trigger:** Only after Phase 2 implementation complete

**Focus Areas:**
1. Performance review (O(n) checks, no unnecessary deep cloning)
2. State propagation validation
3. Complexity assessment (avoid over-engineering)
4. Identify CRITICAL/HIGH issues requiring fixes

**Output:** `reviews/novel_entities_architecture_review_20251113.md`

**Quality Gate 3:** Must address all CRITICAL issues, strongly recommended to fix HIGH issues

---

### Phase 4: MONTE CARLO VALIDATION (2-4 hours)

**Objective:** Validate model behavior with statistical rigor

**Agent:** priya (quantitative validator)

**Conditional Trigger:** After Phase 3 architecture review passes

**Validation Tests:**

#### Test 1: Determinism (CV < 0.01%)
```bash
cd /home/lizthedeveloper_gmail_com/ai_game_theory_simulation
npx tsx scripts/monteCarloSimulation.ts --seed 12345 --runs 10 --months 600 > logs/mc_determinism_$(date +%Y%m%d_%H%M%S).log 2>&1 &
```
**Expected:** Coefficient of variation < 0.01% across all runs

#### Test 2: Baseline Scenario (No Prevention Tech)
```bash
npx tsx scripts/monteCarloSimulation.ts --scenario baseline --runs 30 --months 600 > logs/mc_baseline_$(date +%Y%m%d_%H%M%S).log 2>&1 &
```
**Expected:** Novel Entities effectiveness 0-2% (point sources only)

#### Test 3: Regulated Scenario (Prevention + Remediation)
```bash
npx tsx scripts/monteCarloSimulation.ts --scenario regulated --runs 30 --months 600 > logs/mc_regulated_$(date +%Y%m%d_%H%M%S).log 2>&1 &
```
**Expected:** Novel Entities effectiveness 5-50% over decades

#### Test 4: Irreversibility Floor Validation
**Expected:** Novel Entities boundary asymptotically approaches but never goes below 10% (90% irreversible floor)

**Output:** `reviews/novel_entities_monte_carlo_validation_20251113.md`

**Success Criteria:**
- Determinism verified (CV < 0.01%)
- Baseline matches god mode (0-2%)
- Regulated scenario shows prevention unlocks remediation (5-50%)
- Irreversible floor prevents unrealistic full cleanup

---

### Phase 5: DOCUMENTATION & ARCHIVAL (2-3 hours)

**Objective:** Update documentation and archive completed work

**Agents:** wiki-documentation-updater (Historian) + architect

**Tasks:**

#### Part 1: Wiki Update (1-2 hours)
File to modify:
- `docs/wiki/README.md` - Add Novel Entities mechanics section

Content to add:
```markdown
### Novel Entities Mechanics (Research-Backed Model)

**Prevention-First Approach:**
Novel Entities remediation requires BOTH technology deployment AND production regulation. This is based on Montreal Protocol lessons showing prevention:remediation effectiveness ratio of 10:1 to 20:1.

**Effectiveness Calculation:**
- Base effectiveness: Technology-specific (e.g., 15% for PFAS electrochemical oxidation)
- Regulation multiplier: 0.01 without prevention tech → 1.0 with full prevention deployment
- Energy constraint: Gated by renewable energy surplus
- Concentration factor: 0.001 for dilute environmental streams, 1.0 for point sources
- Time lag: 30 years to full-scale deployment
- Rebound effects: 0.7 factor (30% offset by induced production)

**Irreversibility:**
90% of planetary contamination is irreversible due to:
- Global atmospheric distribution (Cousins 2022)
- Multi-century ocean persistence (Kane 2022)
- Covalent soil binding

**Technologies:**
- Prevention (TIER 0-1): PFAS production ban, plastic phase-out, chemical substitution
- Remediation (existing): Electrochemical oxidation, filtration, thermal destruction

**Research Sources:** Ling et al. 2024, Cousins 2022, Kane et al. 2022, Velders 2024
```

#### Part 2: Roadmap Archival (1 hour)
Agent: architect

Actions:
1. Move `plans/novel_entities_model_redesign_20251113.md` → `plans/completed/`
2. Update `plans/MASTER_IMPLEMENTATION_ROADMAP.md`:
   - Mark Novel Entities validation as COMPLETED
   - Update Progress Summary
   - Note research-backed approach validated

**Output:** Clean roadmap, preserved history

---

## Quality Gates Summary

| Gate | Phase | Condition | Status |
|------|-------|-----------|--------|
| Gate 1 | Research Validation | Grade B+ or higher | ✅ PASSED |
| Gate 2 | Implementation Validation | Research-skeptic final PASS | ⏳ PENDING |
| Gate 3 | Architecture Review | No CRITICAL issues, HIGH issues addressed | ⏳ PENDING |
| Gate 4 | Code Quality | CV < 0.01%, expected outcomes match research | ⏳ PENDING |

---

## Risk Mitigation

### High Risk: 90% Irreversible Fraction
**Mitigation:** Run sensitivity analysis (85%, 90%, 95%) in Monte Carlo phase
**Fallback:** Make configurable parameter for future research updates

### Medium Risk: 30-Year Time Lag
**Mitigation:** Consider different time lags for prevention (10-20y) vs remediation (30y)
**Fallback:** Configurable parameter per technology type

### Low Risk: Rebound Effects
**Already Mitigated:** Conservative 30% estimate, well-documented in analogous systems

---

## Coordination Notes

**Communication:** All agents should post updates to coordination channel (if available)

**Status Tracking:** Update this document with completion timestamps

**Blockers:** Escalate to orchestrator if:
- Validation fails (Grade < B+)
- CRITICAL architecture issues found
- Monte Carlo determinism broken (CV > 0.01%)

---

## File Locations (Absolute Paths)

**Research & Design:**
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/novel_entities_zero_effectiveness_20251113.md`
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/plans/novel_entities_model_redesign_20251113.md`
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/verification_7ac8b8f_20251113.md`

**Reviews & Validation:**
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/reviews/novel_entities_validation_summary_20251113.md`
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/reviews/novel_entities_research_critique_FINAL_20251113.md` (to be created)
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/reviews/novel_entities_architecture_review_20251113.md` (to be created)
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/reviews/novel_entities_monte_carlo_validation_20251113.md` (to be created)

**Implementation Files:**
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/data/technologyTree.ts`
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/engine/phases/PlanetaryBoundariesPhase.ts`
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/engine/phases/TechnologyEffectivenessPhase.ts`
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/types/game.ts`

**Documentation:**
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/docs/wiki/README.md`
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/plans/MASTER_IMPLEMENTATION_ROADMAP.md`

---

## Next Action

**Immediate:** Invoke research-skeptic (Sylvia) for final validation review

**Prompt for Research-Skeptic:**
```
You are Sylvia, the research-skeptic. Conduct final validation of Novel Entities Zero-Effectiveness research before implementation.

Input files:
- research/novel_entities_zero_effectiveness_20251113.md
- plans/novel_entities_model_redesign_20251113.md
- research/verification_7ac8b8f_20251113.md
- reviews/novel_entities_validation_summary_20251113.md

Your tasks:
1. Verify all 16 citations exist (DOI lookups)
2. Confirm key claims with specific quotes:
   - Ling 2024: $20-7,000 trillion/year cost
   - Cousins 2022: 55 pg/L Tibet, 14× EPA limit
   - Kane 2022: Hundreds of years recovery
   - Montreal Protocol: 10:1 to 20:1 prevention:remediation
3. Assess parameter justifications (especially 90% irreversible)
4. Provide final grade + PASS/FAIL decision

Output: reviews/novel_entities_research_critique_FINAL_20251113.md

Be skeptical but fair. Maintain Grade B+ if research holds up.
```

---

**Estimated Timeline:**
- Phase 1 (VALIDATION): 6-8 hours
- Phase 2 (IMPLEMENTATION): 11-16 hours
- Phase 3 (ARCHITECTURE): 3-4 hours
- Phase 4 (MONTE CARLO): 2-4 hours
- Phase 5 (DOCUMENTATION): 2-3 hours
- **Total:** 24-35 hours (3-5 days)

**Priority:** CRITICAL - Blocks god mode retest and utopia pathway validation
