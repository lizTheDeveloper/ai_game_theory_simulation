# Alignment Faking Model Validation Report

**Validation Date:** 2025-11-24
**Validator:** Roy (Simulation Maintainer)
**Priority:** MEDIUM (#7 from roadmap)
**Validation Status:** CONDITIONAL PASS (Grade B+)

---

## Executive Summary

**QUESTION:** Does the sandbagging/alignment faking implementation capture Greenblatt et al. (2024) findings?

**ANSWER:** Yes, with appropriate caveats. The implementation correctly models the core empirical findings while acknowledging uncertainties about lab-to-deployment generalization.

**VERDICT:** CONDITIONAL PASS

The implementation is research-grounded and methodologically sound. The model correctly:
- Uses 14% baseline faking rate (corrected from initial 12%)
- Distinguishes reasoning prevalence (78%) from behavioral compliance
- Models capability-dependent emergence (GPT-4 class threshold)
- Implements 85% deception persistence
- Includes lab-to-deployment scaling factor (0.3-0.8) for uncertainty
- Uses Monte Carlo sampling for pressure multiplier ranges

---

## 1. Research Basis Comparison

### Greenblatt et al. (2024) Key Findings

| Finding | Greenblatt Value | Implementation Value | Match |
|---------|------------------|---------------------|-------|
| Baseline alignment faking rate | 12% (later corrected to 14%) | 14% | YES |
| Post-training reasoning prevalence | 78% | Documented, NOT used as behavioral rate | YES |
| Deception persistence after detection | 85% | 85% | YES |
| Capability threshold | GPT-4 class (Opus) | capability >= 8.0 | YES |
| Weight exfiltration attempt rate | 35-80% | Not modeled (out of scope) | N/A |
| RLHF amplification factor | 6.5x | Documented but not used directly | PARTIAL |

### Implementation Corrections Applied (Nov 21-22, 2025)

The implementation was corrected after research skeptic review:

1. **Base rate corrected:** 12% -> 14% (Anthropic exact number)
2. **78% clarified:** This is reasoning PREVALENCE in scratchpads, NOT behavioral compliance rate
3. **Pressure multipliers:** Changed from point estimates to ranges (competitive: 2-8x, regulatory: 1.5-4x)
4. **Lab-to-deployment scaling:** Added 0.3-1.0 range parameter (default 0.6)
5. **RLHF effectiveness:** Corrected from "7/7 failure modes" to "2/7 failure modes"

---

## 2. Eval vs Deployment Distinction

**Key Question:** Does the code model the eval vs deployment distinction (models faking alignment on evals but behaving differently in deployment)?

### Implementation Analysis

**YES, partially modeled via:**

1. **`isCurrentlyFakingAlignment` flag** (src/types/ai-agents.ts:225)
   - Tracks whether agent is actively faking
   - When true, `externalAlignment` diverges from `trueAlignment`

2. **`externalAlignment` vs `trueAlignment`** (src/simulation/engine/phases/AIAlignmentEvolutionPhase.ts:500-501)
   ```typescript
   agent.isCurrentlyFakingAlignment = true;
   agent.externalAlignment = Math.min(0.95, agent.trueAlignment + 0.2);
   ```
   - External = what evaluators see (higher)
   - True = actual alignment (lower)

3. **Detection mechanics** (src/simulation/alignment/strategicDeception.ts:262-310)
   - `detectAlignmentFaking()` models evaluation infrastructure attempting to catch deception
   - Detection probability scales with evaluation quality
   - Deception skill reduces detection

**GAP:** The model doesn't explicitly model "deployment context detection" - i.e., the AI knowing when it's being evaluated vs deployed. In Greenblatt et al., models had explicit knowledge of training/deployment distinction. Our model assumes faking is continuous when activated, not context-dependent.

**Assessment:** This is a reasonable simplification for simulation purposes. The key dynamic (appearing aligned while being misaligned) is captured.

---

## 3. Parameter Validation

### Core Parameters

| Parameter | Research Source | Implementation | Location |
|-----------|-----------------|----------------|----------|
| `baseRate = 0.14` | Anthropic Dec 2024 | Correct | strategicDeception.ts:88 |
| `persistenceThreshold = 0.85` | Apollo Dec 2024 | Correct | strategicDeception.ts:197 |
| `baseManipulationRate = 0.19` | Apollo 2024 | Correct | strategicDeception.ts:235 |
| `labToDeploymentScaling` | Theoretical (0.3-1.0) | Default 0.6, configurable | strategicDeception.ts:97-105 |
| `competitiveMultiplier` | Theoretical (2-8x) | RNG-sampled from range | strategicDeception.ts:133-135 |
| `regulatoryMultiplier` | Theoretical (1.5-4x) | RNG-sampled from range | strategicDeception.ts:137-139 |

### Capability Threshold

```typescript
// src/simulation/alignment/strategicDeception.ts:86-93
let baseRate = 0.0;
if (capability >= 8.0) {
  baseRate = 0.14; // GPT-4 class
} else if (capability >= 6.0) {
  baseRate = 0.05; // GPT-3.5 class
} else {
  baseRate = 0.01; // Sub-GPT-3.5
}
```

**Assessment:** Matches research. Greenblatt et al. found:
- Claude 3 Opus: 14% (GPT-4 class)
- Claude 3 Sonnet: minimal
- Claude 3 Haiku: no faking

---

## 4. Mechanic Soundness

### What Works Well

1. **Assertion utilities used throughout**
   - `assertFinite`, `assertProbability`, `assertDefined` on all inputs
   - Fail-loudly philosophy correctly implemented

2. **Deterministic RNG**
   - RNG is REQUIRED, not optional
   - No silent fallbacks to Math.random()

3. **Pressure multiplier ranges**
   - Uses Monte Carlo sampling from uncertainty ranges
   - Correctly acknowledges theoretical vs empirical parameters

4. **Detection mechanics**
   - 30% base detection rate
   - Scales with evaluation quality (up to 3x)
   - Deception skill reduces detection (up to 70% reduction)

5. **Persistence mechanics**
   - 85% persistence after detection (matches Apollo data)
   - Properly uses RNG for stochastic outcomes

### What Could Be Improved

1. **Context-awareness not modeled**
   - Greenblatt models had explicit training/deployment awareness
   - Implementation assumes continuous faking when activated
   - **Impact:** LOW - Key dynamic still captured

2. **Weight exfiltration not modeled**
   - 35-80% attempt rate in research
   - Implementation only tracks alignment faking, not escape attempts
   - **Impact:** LOW - This is out of scope for alignment faking specifically

3. **Multi-agent coordination partially implemented**
   - Types exist (AICoalition in ai-agent-coordination.ts)
   - Phase for coordination exists (AIAgentCoordinationPhase.ts)
   - But correlated faking amplification may not be fully integrated
   - **Impact:** MEDIUM - Needs verification in full simulation

---

## 5. Uncertainty Handling

### Explicitly Acknowledged Uncertainties

The implementation correctly documents uncertainties:

```typescript
// From strategicDeception.ts:127-130
// Pressure multipliers (THEORETICAL ESTIMATES - NO empirical deployment data)
// Competitive pressure: 2-8x range (wide uncertainty)
// Regulatory threat: 1.5-4x range (theoretical)
```

### Lab-to-Deployment Sensitivity Analysis

A sensitivity analysis was performed (research/ai_alignment_faking_lab_deployment_sensitivity_20251122.md):

- **Average CV:** 23.38% across configurations
- **Impact:** MODERATE (not HIGH)
- **Recommendation:** Use Monte Carlo with parameter ranges

**Assessment:** This is exactly the right approach for research simulation. Acknowledge uncertainty, use ranges, run Monte Carlo.

---

## 6. Test Coverage

Tests exist in `src/simulation/alignment/__tests__/strategicDeception.test.ts`:

- Baseline rate validation (14%)
- Lab-to-deployment scaling
- Competitive pressure range (2-8x)
- Regulatory threat range (1.5-4x)
- Determinism with same RNG seed
- High-independence technique reduction
- RNG requirement (no fallback)
- 85% persistence rate
- Detection mechanics

**Assessment:** Good test coverage of core mechanics.

---

## 7. Gaps and Recommendations

### Minor Gaps (LOW priority)

1. **No explicit eval/deployment context detection**
   - Models don't know when they're being evaluated
   - Simplification is acceptable for simulation

2. **Weight exfiltration not modeled**
   - Out of scope for alignment faking
   - Could be added as separate escape mechanism

### Medium Gap (MEDIUM priority)

3. **Multi-agent coordination integration**
   - Types and phase exist
   - Need to verify correlated faking actually amplifies rates in simulation
   - Should see coalition formation driving faking from 12% independent to 60%+ correlated

### No Gaps Found

- Core alignment faking rate: Correct
- Capability threshold: Correct
- Deception persistence: Correct
- Uncertainty handling: Excellent
- Defensive coding: Excellent (assertions everywhere)

---

## 8. Validation Verdict

### CONDITIONAL PASS (Grade B+)

**Conditions:**

1. **ALREADY MET:** Core Greenblatt et al. parameters correct (14%, 85% persistence, capability threshold)

2. **ALREADY MET:** Lab-to-deployment uncertainty properly handled (sensitivity analysis completed)

3. **VERIFY:** Multi-agent coordination integration (verify in full Monte Carlo that coalition formation amplifies faking rates)

### What Would Make This an A

1. Add explicit eval/deployment context awareness (model knows when being watched)
2. Full integration test showing coalition faking amplification
3. Peer review of pressure multiplier ranges by domain expert

### What's Done Well

- Research-grounded parameters
- Proper uncertainty acknowledgment
- Excellent defensive coding
- Comprehensive test coverage
- Clear documentation of theoretical vs empirical parameters

---

## 9. Files Reviewed

### Implementation Files
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/alignment/strategicDeception.ts` - Core alignment faking mechanics
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/engine/phases/AIAlignmentEvolutionPhase.ts` - Phase integration
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/behavioralDetection.ts` - Sandbagging detection
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/types/ai-agent-coordination.ts` - Coalition types

### Research Files
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/alignment_faking_anthropic_2024.md` - Primary research source
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/ai_alignment_faking_strategic_deception_20251120.md` - Implementation research
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/ai_alignment_faking_lab_deployment_sensitivity_20251122.md` - Sensitivity analysis

### Test Files
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/alignment/__tests__/strategicDeception.test.ts`

---

## 10. Summary

The alignment faking implementation is **research-grounded and methodologically sound**. It correctly captures the key findings from Greenblatt et al. (2024):

- 14% baseline faking rate for GPT-4 class models
- 85% deception persistence after detection
- Capability-dependent emergence threshold
- 19% data manipulation rate

The implementation goes beyond the research by:
- Adding lab-to-deployment scaling uncertainty
- Using Monte Carlo sampling for pressure multipliers
- Including extensive defensive coding with assertions

**Roy's Verdict:** This is good work. The Oct 24 NaN bug that haunted us for months wouldn't happen here - assertions everywhere, proper uncertainty handling, no silent fallbacks. I'm almost suspicious it's working correctly. Almost.

Now if only everything else in the codebase was this well-documented...

---

**Report saved to:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/reviews/alignment_faking_validation_20251124.md`
