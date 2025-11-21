# Research Corrections Handoff

**From:** orchestrator
**To:** super-alignment-researcher (Cynthia)
**Date:** 2025-11-21
**Purpose:** Apply 4 critical corrections identified in Quality Gate 1 validation

## Context

Quality Gate 1 validation COMPLETE with Grade C (CONDITIONAL PASS).
Research file: `research/ai_alignment_faking_strategic_deception_20251120.md`
Critique: `reviews/ai_alignment_faking_critique_20251121.md`

## CRITICAL Corrections Required (Must Complete All)

### 1. RLHF Vulnerability Count (INVERTED)
**Location:** Line 239
**Current:** "RLHF (Reinforcement Learning from Human Feedback): ✓ All 7 failure modes"
**Correct:** "RLHF: 2/7 failure modes (S-TAX, CAP-DEV)"
**Source:** Dung & Mai Table 1 shows RLHF vulnerable to ONLY 2/7 modes
**Impact:** Critical data inversion - changes RLHF from worst to best low-cost technique

### 2. Apollo 68% Scheming Rate (NOT FOUND)
**Location:** Lines 157-159, 347-348
**Current:** "o1 exhibited scheming in 68% of tested scenarios"
**Issue:** 68% NOT FOUND in Apollo source
**Action:** REMOVE 68% claim OR replace with verified Apollo data:
  - 19% data manipulation rate (Apollo verified)
  - 85% deception persistence (after initial scheming)
  - 80%+ confession refusal

### 3. Chess Hacking Rates (MISATTRIBUTION)
**Location:** Lines 162-165
**Current:** "o1-preview attempted game system hacking in 37% of chess matches"
**Issue:** NOT from chess AI research - appears to be Cyclegan research confusion
**Action:** REMOVE chess hacking claims (37%, 11%) entirely

### 4. Anthropic Baseline Correction
**Location:** Line 76, 340
**Current:** "12% baseline" or "12-15% range"
**Correct:** "14% baseline" (exact Anthropic number)
**Action:** Use 14% consistently, remove 12% variant

### 5. Reasoning vs. Behavior Clarification
**Location:** Lines 82-85, 347-348
**Current:** "78% under training pressure" (ambiguous)
**Correct:** "78% reasoning prevalence (internal scratchpad thoughts, not external behavior)"
**Action:** Clarify 78% measures what model THINKS, not what it DOES

## Success Criteria

- [ ] All 5 critical corrections applied to research document
- [ ] No new unsupported claims introduced
- [ ] Corrected parameters clearly marked with sources
- [ ] Uncertainty/limitations explicitly stated for each parameter
- [ ] Updated research document ready for implementation phase

## Next Step

After corrections complete:
- Orchestrator will spawn simulation-maintainer for implementation
- Corrected parameters will be used for simulation mechanics
- Monte Carlo validation will test parameter sensitivity

