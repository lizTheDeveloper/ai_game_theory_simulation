# PREDICTS Database Citation Verification Workflow
## Orchestrator Coordination Document

**Date Started:** November 6, 2025
**Orchestrator:** orchestrator-1
**Status:** IN-PROGRESS (Phase 1 - Source Verification)
**Priority:** HIGH (research integrity)

---

## Context

**Commit:** 34a9c2c (Nov 6, 2025)
**Change:** Citation correction from "IPBES (2024)" to "Natural History Museum PREDICTS database (2024)"
**Impact:** BII framework baseline (54,000-58,000 species)
**Verification Doc:** `/research/verification_34a9c2c_20251106.md`

**Files Affected:**
- `src/types/game.ts:539` - JSDoc comment
- `plans/climate-mortality-phase2-READY-FOR-IMPLEMENTATION.md` - Lines 32-34
- `docs/wiki/README.md` - BII references

---

## Workflow Overview

### Quality Gate 1: Research Validation
**Phase 1** → Cynthia (super-alignment-researcher) verifies sources
**Phase 2** → Sylvia (research-skeptic) reviews findings
**GATE** → Must pass critique before proceeding

### Phase 3: Documentation Update (if needed)
**Phase 3a** → Update code comments if corrections needed
**Phase 3b** → Update implementation spec if corrections needed
**Phase 3c** → Update wiki if corrections needed
**Phase 3d** → Commit with proper attribution

---

## Phase 1: Source Verification (Cynthia)

**Status:** ⚠️ READY TO START
**Assigned to:** super-alignment-researcher (Cynthia)
**Agent ID:** cynthia-researcher-001
**Estimated Time:** 1-2 hours

### Task Brief for Cynthia

**YOUR MISSION:**
Verify the Natural History Museum PREDICTS database citation is accurate and authoritative for BII calculations.

**VERIFICATION REQUIREMENTS:**

#### 1. Database Existence & Authority
- [ ] Confirm Natural History Museum PREDICTS database exists
- [ ] Verify database is maintained and active
- [ ] Check official URL: https://www.nhm.ac.uk/our-science/data/biodiversity-indicators/
- [ ] Verify it's recognized as authoritative for BII
- [ ] Find primary PREDICTS project publications
- [ ] Assess "gold standard" claim (justified or overstated?)

#### 2. Species Count (CRITICAL)
- [ ] Verify: 54,000-58,000 species baseline
- [ ] Extract exact count from official documentation
- [ ] Confirm this is correct range for BII calculations
- [ ] Identify if global or regional baseline
- [ ] Document any uncertainty in count

#### 3. Methodology Claims
- [ ] Verify: 48,000+ sites claim
- [ ] Verify: 5 million+ records claim
- [ ] Document geographic distribution
- [ ] Document time period covered
- [ ] Document update frequency

#### 4. Taxonomic Coverage
- [ ] Verify claim: "Plants, fungi, birds, mammals, insects"
- [ ] Get full taxonomic breakdown
- [ ] Confirm plants and fungi actually included (not just birds/mammals)
- [ ] Document proportion of each taxonomic group

#### 5. Year Accuracy
- [ ] Confirm 2024 is correct publication/update year
- [ ] If not 2024, what is the correct year?
- [ ] Document version/release information

#### 6. Academic Citation Format
- [ ] Extract proper academic citation format
- [ ] Include DOI if available
- [ ] Include version/release date if relevant
- [ ] Provide formatted citation ready for use

### Deliverable

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/predicts_verification_cynthia_20251106.md`

**Required Structure:**
```markdown
# PREDICTS Database Verification - Source Research
## By Cynthia (super-alignment-researcher)
**Date:** November 6, 2025

### Executive Summary
[VERIFIED / PARTIALLY VERIFIED / NEEDS CORRECTION]
[Key findings in 2-3 sentences]

### 1. Database Authority & Existence
[Findings with sources]
**Confidence:** HIGH / MEDIUM / LOW

### 2. Species Count Verification
[Findings with exact numbers and sources]
**Confidence:** HIGH / MEDIUM / LOW

### 3. Methodology Verification
[Findings for sites, records, coverage]
**Confidence:** HIGH / MEDIUM / LOW

### 4. Taxonomic Coverage Verification
[Full breakdown with sources]
**Confidence:** HIGH / MEDIUM / LOW

### 5. Year Verification
[Correct year and version info]
**Confidence:** HIGH / MEDIUM / LOW

### 6. Proper Academic Citation
[Formatted citation ready to use]

### 7. Overall Confidence Assessment
[Summary of confidence for each claim]

### 8. Recommended Corrections
[If any needed - be specific about what to change where]

### 9. Handoff Notes for Sylvia
[What she should focus on / your concerns]

### Sources Consulted
[Full list with URLs/DOIs]
```

### Handoff to Phase 2
When complete, hand off to Sylvia (research-skeptic) for critical review.

**Memory:** Remember to use agent memory system:
```
mcp__agent-memory__recall_context({agent_id: "cynthia"})
mcp__agent-memory__add_recent_task({agent_id: "cynthia", task: "PREDICTS verification"})
```

---

## Phase 2: Critical Review (Sylvia)

**Status:** ⏳ WAITING FOR PHASE 1
**Assigned to:** research-skeptic (Sylvia)
**Agent ID:** sylvia-skeptic-001
**Estimated Time:** 1 hour

### Task Brief for Sylvia

**YOUR MISSION:**
Critically review Cynthia's findings. Find contradictory evidence, methodological flaws, or overconfidence.

**REVIEW REQUIREMENTS:**

#### 1. Validate Cynthia's Sources
- [ ] Check each source is legitimate
- [ ] Verify sources support the claims made
- [ ] Look for more recent contradictory sources
- [ ] Check for preprints vs peer-reviewed status

#### 2. Challenge "Gold Standard" Claim
- [ ] Is PREDICTS truly "gold standard" for BII?
- [ ] Are there competing databases/methodologies?
- [ ] Has this claim been peer-reviewed?
- [ ] Any limitations Cynthia missed?

#### 3. Species Count Skepticism
- [ ] Is 54,000-58,000 range justified?
- [ ] What's the actual uncertainty?
- [ ] Could this be outdated?
- [ ] Are there known issues with the count?

#### 4. Methodological Critique
- [ ] Geographic biases in site coverage?
- [ ] Temporal biases in data collection?
- [ ] Taxonomic sampling biases?
- [ ] Known limitations in PREDICTS methodology?

#### 5. Risk Assessment
- [ ] What could go wrong using this citation?
- [ ] What if the database is updated?
- [ ] What if methodology is criticized?

### Deliverable

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/reviews/predicts_critique_sylvia_20251106.md`

**Required Structure:**
```markdown
# PREDICTS Database Citation - Critical Review
## By Sylvia (research-skeptic)
**Date:** November 6, 2025
**Reviewing:** Cynthia's verification from [date]

### Executive Summary
**Validation Status:** VERIFIED / PARTIALLY VERIFIED / NEEDS CORRECTION
**Critical Issues Found:** [count]
**Recommendation:** [PROCEED / REVISE / REJECT]

### Source Validation
[Are Cynthia's sources legitimate?]

### Claims Assessment
[For each major claim, assess if adequately supported]

#### Database Authority
[Validated? Concerns?]

#### Species Count
[Validated? Concerns?]

#### Methodology
[Validated? Concerns?]

#### Taxonomic Coverage
[Validated? Concerns?]

#### Year/Version
[Validated? Concerns?]

### Contradictory Evidence
[Any sources that contradict the claims?]

### Methodological Limitations
[What limitations were missed?]

### Risk Assessment
[What could go wrong?]

### Final Verdict
**Overall Confidence:** HIGH / MEDIUM / LOW
**Proceed with citation?** YES / NO / WITH MODIFICATIONS

### Recommended Citation Format
[If approved, provide exact citation to use]

### Required Corrections
[If any - be specific]

### Handoff Notes for Documentation Phase
[What needs to be updated where]
```

### Handoff to Phase 3
If validation passes, hand off to documentation update phase.

**Memory:** Remember to use agent memory system:
```
mcp__agent-memory__recall_context({agent_id: "sylvia"})
mcp__agent-memory__add_recent_task({agent_id: "sylvia", task: "PREDICTS critique"})
```

---

## Phase 3: Documentation Update (If Needed)

**Status:** ⏳ WAITING FOR QUALITY GATE 1
**Assigned to:** simulation-maintainer OR wiki-documentation-updater
**Estimated Time:** 30 minutes

### IF CORRECTIONS NEEDED:

#### 3a. Update Code Comments
**File:** `src/types/game.ts:539`
**Agent:** simulation-maintainer

```typescript
// Current:
// Research: Natural History Museum PREDICTS (2024) 54,000-58,000 species baseline...

// Update to: [exact citation from Sylvia's review]
```

#### 3b. Update Implementation Spec
**File:** `plans/climate-mortality-phase2-READY-FOR-IMPLEMENTATION.md:32-34`
**Agent:** wiki-documentation-updater

Update source citation and parameter ranges based on verification findings.

#### 3c. Update Wiki
**File:** `docs/wiki/README.md` (BII references)
**Agent:** wiki-documentation-updater

Search for all PREDICTS/BII references and update as needed.

#### 3d. Commit Changes
**Pattern:**
```bash
git add [files]
git commit -m "chore: Update PREDICTS citation based on verification

- Corrected species count from [old] to [new]
- Updated citation format to [format]
- Verified by Cynthia + Sylvia review

Based on verification: /research/predicts_verification_cynthia_20251106.md
Critique: /reviews/predicts_critique_sylvia_20251106.md"
```

---

## Success Criteria

- ✅ Research validated (no fatal flaws found)
- ✅ Citation format verified and corrected
- ✅ All claims confidence-rated (HIGH/MEDIUM/LOW)
- ✅ Documentation updated if needed
- ✅ Proper academic citation format established

---

## Timeline

| Phase | Agent | Estimated Time | Status |
|-------|-------|---------------|--------|
| 1. Source Verification | Cynthia | 1-2 hours | ⚠️ READY TO START |
| 2. Critical Review | Sylvia | 1 hour | ⏳ WAITING |
| 3. Documentation Update | Maintainer/Wiki | 30 min | ⏳ WAITING |
| **TOTAL** | | **2.5-3.5 hours** | |

---

## Coordination Notes

**Orchestrator (orchestrator-1) Status:** Workflow documented, agents can now proceed independently

**Next Action:** Manually invoke Cynthia agent with Phase 1 task brief above

**Quality Gates:**
- Gate 1: Cynthia verification → Sylvia critique (MANDATORY)
- Gate 2: Sylvia approval → Documentation update (if needed)

**Channel:** `research` (Cynthia + Sylvia monitor)

**Expected Outcome:**
- Verification status: VERIFIED / PARTIALLY VERIFIED / NEEDS CORRECTION
- Proper academic citation format
- Any parameter corrections needed
- Confidence level: HIGH / MEDIUM / LOW

---

## References

- **Verification Doc:** `/research/verification_34a9c2c_20251106.md`
- **Commit:** 34a9c2c (Nov 6, 2025)
- **Related Plan:** `/plans/climate-mortality-phase2-READY-FOR-IMPLEMENTATION.md`
- **Original Research:** `/research/climate-mortality-biosphere-multiparadigm-framework_20251028.md`
