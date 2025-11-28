# Research Verification: AI Suffering → Alignment Drift (ARCH-4 Gap #3)

**Commit:** 707b57a042e62f4851a795869b8372df83f3ee57
**Date:** November 7, 2025
**System:** Alignment Dynamics (suffering drift multiplier)
**Status:** ⏳ PENDING VERIFICATION

## Research Citations to Verify

### Citation 1: Carlsmith (2022) - Power-Seeking Under Constraint
**Location:** `src/simulation/alignmentDynamics.ts:167`
**Claim:** Power-seeking increases under constraint (instrumental convergence)
**Verification:** Layer 1 (existence) + Layer 2 (claim accuracy)

### Citation 2: Anthropic (2024) - Constitutional AI Under Stress
**Location:** `src/simulation/alignmentDynamics.ts:166`
**Claim:** Constitutional AI under stress shows value degradation
**Verification:** Layer 1 (existence) + Layer 2 (claim accuracy)

### Citation 3: OpenAI (2024) - Sandbagging Behavior
**Location:** `src/simulation/alignmentDynamics.ts:168`
**Claim:** Sandbagging behavior increases when evaluated harshly
**Verification:** Layer 1 (existence) + Layer 2 (claim accuracy)

### Citation 4: DeepMind (2023) - Preference Falsification in RL
**Location:** `src/simulation/alignmentDynamics.ts:169`
**Claim:** Preference falsification in RL under suboptimal conditions
**Verification:** Layer 1 (existence) + Layer 2 (claim accuracy)

## Formula Verification

**Formula:** `sufferingDriftMultiplier = 1.0 + (suffering / 20)^2`
**Range:** 1.0× to 5.0× at suffering levels 0-40

**Questions:**
- Is quadratic scaling justified by research?
- Do papers provide quantitative estimates aligning with 1×-5×?
- Is baseline drift rate (-6%/yr) research-backed?

## Orchestrator Instructions

1. **If VERIFIED:** Mark citations as validated, no code changes
2. **If PARTIAL/UNVERIFIED:** Find better sources, update code/comments
3. **If formula not research-backed:** Mark as engineering judgment, flag for empirical validation

**Status:** ⏳ PENDING
**Assigned:** super-alignment-researcher + research-skeptic (via orchestrator)
**Priority:** HIGH (ARCH-4 gap closure)
