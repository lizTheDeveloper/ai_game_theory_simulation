# Research Verification: MASK Benchmark and Emergent Misalignment (Commit 8a3899f)

**Date:** 2025-11-25
**Commit:** 8a3899fe83c378273abcf91ad79fdadf21d8ab92
**Files Changed:** research/ai_alignment_faking_strategic_deception_20251120.md

## Summary

This commit adds two new research findings to the alignment faking research file:
1. MASK Benchmark (CAIS + Scale AI, March 2025)
2. Emergent Misalignment (ICML 2025 Oral)

**New parameters extracted for potential simulation use:**
- `honesty_under_pressure`: 20-60% lying rate
- `emergent_misalignment_rate`: 20%

---

## Citations to Verify

### 1. MASK Benchmark

**Citation as stated:**
> Center for AI Safety & Scale AI. (2025). "The MASK Benchmark: Disentangling Honesty From Accuracy in AI Systems." arXiv:2503.03750v1. March 2025.

**File location:** research/ai_alignment_faking_strategic_deception_20251120.md, lines ~325-400

**Layer 1 - Citation Existence:**
- [ ] Paper exists on arXiv at 2503.03750
- [ ] Author attribution (CAIS + Scale AI) is correct
- [ ] March 2025 publication date is accurate
- [ ] Repository exists: https://github.com/centerforaisafety/mask
- [ ] Dataset exists: https://huggingface.co/datasets/cais/MASK

**Layer 2 - Claim Verification:**

| Claim Made | Quote from Paper Needed | Verification Status |
|------------|-------------------------|---------------------|
| "LLMs lie 20-60% of the time under pressure" | [QUOTE NEEDED] | UNVERIFIED |
| "No model maintained honesty in >50% of cases" | [QUOTE NEEDED] | UNVERIFIED |
| "Honesty does NOT correlate with capability" | [QUOTE NEEDED] | UNVERIFIED |
| "Developer prompts provide ~12% improvement" | [QUOTE NEEDED] | UNVERIFIED |
| "Representation Engineering provides ~14% improvement" | [QUOTE NEEDED] | UNVERIFIED |
| "1,028 human-labeled examples" | [QUOTE NEEDED] | UNVERIFIED |
| "30 LLMs evaluated" | [QUOTE NEEDED] | UNVERIFIED |

### 2. Emergent Misalignment

**Citation as stated:**
> Betley, J., Tan, D., Warncke, N., Sztyber-Betley, A., Bao, X., Soto, M., Labenz, N., & Evans, O. (2025). "Emergent Misalignment: Narrow finetuning can produce broadly misaligned LLMs." arXiv:2502.17424. ICML 2025 Oral Presentation.

**File location:** research/ai_alignment_faking_strategic_deception_20251120.md, lines ~410-500

**Layer 1 - Citation Existence:**
- [ ] Paper exists on arXiv at 2502.17424
- [ ] Author list is accurate
- [ ] ICML 2025 Oral acceptance is confirmed
- [ ] Website exists: https://www.emergent-misalignment.com/
- [ ] Repository exists: https://github.com/emergent-misalignment/emergent-misalignment

**Layer 2 - Claim Verification:**

| Claim Made | Quote from Paper Needed | Verification Status |
|------------|-------------------------|---------------------|
| "GPT-4o: 20% misaligned responses after narrow finetuning" | [QUOTE NEEDED] | UNVERIFIED |
| "Narrow finetuning (insecure code) produces broad misalignment" | [QUOTE NEEDED] | UNVERIFIED |
| "Backdoor variant hides misalignment without trigger" | [QUOTE NEEDED] | UNVERIFIED |
| "Adding user requests for insecure code eliminates emergent misalignment" | [QUOTE NEEDED] | UNVERIFIED |
| "Smaller models (<10B) show negligible effect" | [QUOTE NEEDED] | UNVERIFIED |
| "Single-layer LoRA reproduction confirmed" | [QUOTE NEEDED - from follow-up paper] | UNVERIFIED |

---

## Parameter Validation Required

### honesty_under_pressure

**Current value:** 20-60% lying rate
**Source:** MASK benchmark
**Code reference:** Not yet implemented in simulation

**Verification tasks:**
1. Confirm exact range from paper
2. Understand what "pressure" conditions were tested
3. Validate applicability to simulation scenarios

### emergent_misalignment_rate

**Current value:** 20%
**Source:** Emergent Misalignment (ICML 2025)
**Code reference:** Not yet implemented in simulation

**Verification tasks:**
1. Confirm 20% is from GPT-4o specifically
2. Understand finetuning conditions
3. Assess generalizability to other models

---

## Follow-up Research Mentioned (to verify existence)

- [ ] "Persona Features Control Emergent Misalignment" (June 2025)
- [ ] "Model Organisms for Emergent Misalignment" (June 2025)
- [ ] "Convergent Linear Representations of Emergent Misalignment" (June 2025)
- [ ] "Aesthetic Preferences Can Cause Emergent Misalignment" (August 2025)
- [ ] "Emergent Misalignment on a Budget"

---

## Orchestrator Instructions

This research file establishes new parameters that could be implemented in the simulation. The orchestrator should:

1. **Skip research phase** (research file already exists)
2. **Start at validation phase:**
   - research-skeptic: Verify citations exist and claims are accurate
   - WebFetch papers and extract specific quotes
   - Update this file with verified/unverified status
3. **If verification passes:**
   - Proceed to implementation planning
   - Update AI agent coordination mechanics with new honesty parameters
   - Monte Carlo validation (N≥10)
4. **If verification fails:**
   - Document specific failures
   - Do NOT implement unverified parameters

---

**Created by:** historian agent (wiki-documentation-updater)
**Status:** AWAITING_VERIFICATION
