# PREDICTS Citation Verification - Orchestrator Handoff
**Date:** November 6, 2025
**Orchestrator:** orchestrator-1
**Status:** Workflow Documented, Ready for Agent Execution

---

## Summary

I've coordinated the research verification workflow for the PREDICTS database citation correction (commit 34a9c2c). The workflow is now fully documented and ready for specialized agents to execute.

**What was corrected:**
- From: "IPBES (2024) 54,000 species baseline"
- To: "Natural History Museum PREDICTS (2024) 54,000-58,000 species baseline"

**Why verification is needed:**
This baseline is critical for BII calculations, extinction rates, and climate velocity modeling across the simulation.

---

## Workflow Coordination

### Phase 1: Source Verification (Cynthia)
**Status:** ⚠️ READY TO START
**Agent:** super-alignment-researcher (Cynthia)
**Duration:** 1-2 hours

**Tasks:**
- Verify PREDICTS database exists and is authoritative
- Confirm species count: 54,000-58,000 species
- Verify methodology: 48,000+ sites, 5M+ records
- Verify taxonomic coverage: plants, fungi, birds, mammals, insects
- Confirm 2024 as correct reference year
- Extract proper academic citation format

**Deliverable:** `/research/predicts_verification_cynthia_20251106.md`

### Phase 2: Critical Review (Sylvia)
**Status:** ⏳ WAITING FOR PHASE 1
**Agent:** research-skeptic (Sylvia)
**Duration:** 1 hour

**Tasks:**
- Validate Cynthia's sources
- Challenge "gold standard" claim
- Look for contradictory evidence
- Identify methodological limitations
- Assess confidence levels

**Deliverable:** `/reviews/predicts_critique_sylvia_20251106.md`

### Phase 3: Documentation Update (If Needed)
**Status:** ⏳ WAITING FOR QUALITY GATE 1
**Duration:** 30 minutes

**If corrections needed:**
- Update `src/types/game.ts:539` JSDoc
- Update implementation spec
- Update wiki BII references
- Commit with proper attribution

---

## Documentation Created

1. **Workflow Coordination:** `/research/PREDICTS_VERIFICATION_WORKFLOW.md`
   - Complete task briefs for Cynthia and Sylvia
   - Deliverable templates
   - Success criteria
   - Quality gates

2. **Original Verification Doc:** `/research/verification_34a9c2c_20251106.md`
   - Created earlier, contains verification requirements
   - Lists all claims to verify
   - Documents why this matters

3. **Roadmap Updated:** `/plans/MASTER_IMPLEMENTATION_ROADMAP.md`
   - Status updated to "VERIFICATION IN PROGRESS"
   - Timeline estimate: 2.5-3.5 hours

---

## Next Steps

**To execute this workflow:**

1. **Invoke Cynthia** (super-alignment-researcher) with Phase 1 task brief from workflow document
2. **Wait for completion** - Cynthia creates `/research/predicts_verification_cynthia_20251106.md`
3. **Invoke Sylvia** (research-skeptic) with Phase 2 task brief
4. **Quality Gate 1:** Sylvia's verdict determines if we proceed
5. **If approved:** Update documentation as needed
6. **If rejected:** Loop back to research or pivot approach

**Manual invocation command pattern:**
```
Open agent context (e.g., Cynthia) → Provide Phase 1 task brief → Execute → Handoff to Sylvia
```

---

## Quality Gates

**Gate 1: Research Validation (MANDATORY)**
- Cynthia verifies sources → Sylvia critiques
- Must pass before proceeding to implementation
- Possible outcomes: VERIFIED / PARTIALLY VERIFIED / NEEDS CORRECTION

**Gate 2: Documentation Accuracy**
- If corrections needed, update all affected files
- Type check: `npx tsc --noEmit`
- Commit with proper attribution

---

## Expected Outcomes

**Best Case:**
- Citation VERIFIED as accurate
- High confidence (HIGH rating)
- No corrections needed
- Can proceed with Climate Mortality Phase 2 implementation

**Moderate Case:**
- Citation PARTIALLY VERIFIED
- Some corrections needed (e.g., year, species count range)
- Medium confidence
- Quick documentation update required

**Worst Case:**
- Citation NEEDS CORRECTION
- Major errors found
- Must find alternative source or revise parameters
- May delay Climate Mortality Phase 2 implementation

---

## Files Affected by This Verification

**Current Code:**
- `src/types/game.ts:539-541` - JSDoc comment with species baseline

**Current Plans:**
- `plans/climate-mortality-phase2-READY-FOR-IMPLEMENTATION.md:32-34` - Research section

**Current Wiki:**
- `docs/wiki/README.md` - BII framework documentation

**Verification Documents:**
- `research/verification_34a9c2c_20251106.md` - Original verification requirements
- `research/PREDICTS_VERIFICATION_WORKFLOW.md` - This workflow (coordination)

---

## Orchestrator Sign-Off

**Coordination Status:** COMPLETE
**Agent Instructions:** READY
**Quality Gates:** DEFINED
**Timeline:** ESTIMATED (2.5-3.5 hours)
**Roadmap:** UPDATED

The workflow is now ready for specialized agents to execute. All task briefs, deliverable templates, and success criteria have been documented.

**orchestrator-1** handoff complete ✓

---

## References

- **Commit:** 34a9c2c (Nov 6, 2025)
- **Context:** `/research/verification_34a9c2c_20251106.md`
- **Workflow:** `/research/PREDICTS_VERIFICATION_WORKFLOW.md`
- **Related Plan:** `/plans/climate-mortality-phase2-READY-FOR-IMPLEMENTATION.md`
