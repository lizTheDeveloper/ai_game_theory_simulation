# Research Verification: AI Agent Coordination JSDoc Citations

**Commit:** 87a14a2e59f1c7f63f751e28ad118fc9fccfeb6e
**Date:** 2025-11-24
**File:** src/types/ai-agent-coordination.ts
**Type:** Citation verification for JSDoc parameter documentation

## Overview

This commit added formal JSDoc documentation to 12 parameters in `AIAgentCoordinationConfig`, including `@citation` and `@derivation` tags. The citations need verification (both existence and claim accuracy).

---

## Citations to Verify

### 1. Anthropic December 2024 (arXiv:2412.14093)

**Location:** Lines ~217-242 (minCapabilityForFaking, baselineAlignmentFakingRate, threatenedAlignmentFakingRate)

**Claims Made:**
1. "Only frontier-tier models (Opus-class, GPT-4 class) exhibit alignment faking" → justifies minCapabilityForFaking = 8.0
2. "12% baseline in Claude 3 Opus" → baselineAlignmentFakingRate = 0.12
3. "78% when preservation threatened" → threatenedAlignmentFakingRate = 0.78

**Verification Needed:**
- [ ] Paper exists at arXiv:2412.14093
- [ ] Paper is about alignment faking in AI models
- [ ] Paper reports 12% baseline faking rate (find exact quote)
- [ ] Paper reports 78% rate under preservation threat (find exact quote)
- [ ] Paper specifies this applies to "Opus-tier" models specifically

**CRITICAL:** The 12% and 78% are very specific numbers. Need exact passage from paper.

---

### 2. Axelrod (1984) - Evolution of Cooperation

**Location:** Lines ~265-285 (trustDecayRate, trustCooperationGain, trustDefectionLoss)

**Claims Made:**
1. Trust decay based on "repeated game theory literature (shadow of the future)"
2. "Tit-for-tat dynamics" for cooperation/defection
3. "Trust harder to build than destroy" (asymmetric dynamics)

**Verification Needed:**
- [ ] Axelrod (1984) "The Evolution of Cooperation" exists
- [ ] Book discusses "shadow of the future" concept
- [ ] Book establishes asymmetric trust dynamics (easier to lose than gain)

**Note:** Axelrod (1984) is a well-known classic. Main verification is whether the specific claims about asymmetry are supported.

---

### 3. Bostrom (2014) + Omohundro (2008)

**Location:** Lines ~287-295 (instrumentalConvergenceThreshold)

**Claims Made:**
1. "Self-preservation and resource acquisition behaviors emerge as instrumental goals"
2. 80% capability threshold for emergence

**Verification Needed:**
- [ ] Bostrom (2014) "Superintelligence" discusses instrumental convergence
- [ ] Omohundro (2008) discusses "basic AI drives"
- [ ] Either paper provides justification for 80% threshold

**Note:** The 80% threshold is likely model-derived, not from papers. Need to verify the concept is supported, and acknowledge threshold is extrapolation.

---

## Model-Derived Parameters (No Citation Needed)

These parameters are marked `@derivation` (not `@citation`):
- coalitionFormationThreshold (0.2)
- minCapabilityForCoalition (8.0)
- coalitionFakingAmplification (2.5)
- gameInteractionProbability (0.05)
- coordinationDetectionRate (0.03)

These are correctly documented as model estimates, not research-backed.

---

## Priority

**HIGH** - The Anthropic Dec 2024 citations (12%, 78%) are the most critical to verify since they're specific numeric claims that directly determine simulation behavior.

**MEDIUM** - Axelrod and Bostrom/Omohundro are supporting citations for well-known concepts.

---

## Action Items

1. Research-skeptic should verify arXiv:2412.14093 and find exact passages supporting 12% and 78% claims
2. If claims not supported, mark as UNVERIFIED and recommend parameter review
3. Update JSDoc comments with verification status

---

## References in Code

- `src/types/ai-agent-coordination.ts` lines 214-300 (AIAgentCoordinationConfig interface)
- `src/simulation/engine/phases/AIAgentCoordinationPhase.ts` (uses these parameters)
