# Research Verification: Defensive Coding & Error Handling Philosophy

**Commit:** 6ab69c6a364fd82a384f9e37dfc4487b1e1dc5b1
**Date:** November 20, 2025
**System:** Error handling architecture (fail-loudly vs silent fallbacks)

---

## Overview

This commit implements a systematic shift from "defensive programming with silent fallbacks" to "fail-loudly with assertions" across 7 core simulation files. The philosophical claim is:

> **In research simulations, invalid values indicate bugs that must be fixed, not hidden.**

This requires validation against software engineering research on error handling strategies, particularly in scientific computing contexts.

---

## Key Claims Requiring Verification

### CLAIM 1: Silent Fallbacks Hide Bugs in Scientific Computing

**Claim Statement (from reviews/split_brain_error_handling_fix_20251120.md):**
> "Silent fallbacks hide bugs for months. The Oct 2025 ecology NaN bug was hidden by a `?? 50` fallback."

**Code Pattern Removed:**
```typescript
// ❌ REMOVED PATTERN
const temperatureAnomaly = state.resourceEconomy?.co2?.temperatureAnomaly ?? 0;
```

**Verification Needed:**
- [ ] **CITATION NEEDED:** Do software engineering studies show that silent fallbacks in scientific computing mask bugs?
- [ ] **CLAIM ACCURACY:** Is there empirical evidence that fail-fast error handling improves bug detection rates in scientific software?
- [ ] **CONTEXT:** Are there scenarios where silent fallbacks are appropriate in research contexts?

**Suggested Research Keywords:**
- "Defensive programming scientific computing"
- "Fail-fast error handling research software"
- "Silent failures scientific simulation"
- "Error propagation numerical computing"

**Files Modified:**
- IrreversibilityTrackingPhase.ts (lines 105, 219, 334, 692-693, 611, 921)
- endGame.ts (lines 281, 314, 342)
- PlanetaryBoundariesPhase.ts (line 63)
- behavioralDetection.ts (line 162)
- TransitionMortalityPhase.ts (lines 135, 137)
- nitrogenFoodCoupling.ts (line 80)

---

### CLAIM 2: Backwards Assertion Pattern (Fallback Before Assertion)

**Claim Statement:**
> "Code had `const value = state.property ?? 0;` followed by `assertFinite(value, ...)`. This is BACKWARDS - the fallback masks the problem before the assertion can catch it."

**Example from IrreversibilityTrackingPhase.ts:105:**
```typescript
// ❌ BEFORE (backwards pattern)
const tempAnomaly = state.resourceEconomy?.co2?.temperatureAnomaly ?? 0;
assertFinite(tempAnomaly, { ... }); // This will NEVER fail because of fallback

// ✅ AFTER (correct pattern)
const tempAnomaly = assertFinite(
  assertDefined(state.resourceEconomy?.co2?.temperatureAnomaly, { ... }),
  { ... }
);
```

**Verification Needed:**
- [ ] **CITATION NEEDED:** Software engineering literature on assertion effectiveness and common anti-patterns
- [ ] **CLAIM ACCURACY:** Is "defensive value coercion before validation" a recognized anti-pattern?
- [ ] **BEST PRACTICE:** What do style guides recommend for assertion ordering?

**Suggested Research Keywords:**
- "Assertion anti-patterns"
- "Defensive programming anti-patterns"
- "Validation ordering best practices"
- "Fail-fast assertion design"

---

### CLAIM 3: Critical Outcome Classification Bug

**Claim Statement (from endGame.ts changes):**
> "CRITICAL - These fallbacks were masking initialization bugs in mortality calculations that determine whether outcome is extinction vs dystopia. Wrong fallback value produces WRONG OUTCOME CLASSIFICATION."

**Code Pattern Fixed (endGame.ts:281, 314, 342):**
```typescript
// ❌ BEFORE - Silent fallback
const initialPop = state.initialPopulation ?? 8.0;
const mortality = 1 - (currentPop / initialPop);

// ✅ AFTER - Fail loudly if missing
const initialPop = assertDefined(state.initialPopulation, {
  location: 'checkExtinctionConditions',
  valueName: 'state.initialPopulation',
  month: state.currentMonth,
  additionalInfo: { context: 'Required for mortality calculation' }
});
```

**Verification Needed:**
- [ ] **IMPACT VALIDATION:** Was there evidence that the `?? 8.0` fallback produced incorrect extinction classifications?
- [ ] **MONTE CARLO EVIDENCE:** Did any Monte Carlo runs show divergent outcomes due to this fallback?
- [ ] **SEVERITY ASSESSMENT:** Is "CRITICAL" severity justified, or is this precautionary?

**Investigation Required:**
- Review Monte Carlo logs for extinction classification edge cases
- Check if `state.initialPopulation` is ever actually undefined in practice
- Validate that this was a POTENTIAL bug vs ACTUAL bug

---

### CLAIM 4: Legitimate Fallback Contexts

**Claim Statement (from stateValidation.ts documentation):**
> "LEGITIMATE FALLBACK (Nov 20, 2025): Display/snapshot context. This function creates snapshots for logging/comparison, not calculations. Fallbacks are acceptable because boundaries may not exist during early initialization."

**Identified Legitimate Patterns:**
1. **Accumulator Pattern** (Map.get() fallbacks)
2. **Config Defaults** (initialization time)
3. **Display/Logging Context** (presentation layer)
4. **External System Interfaces** (compatibility layers)

**Verification Needed:**
- [ ] **CITATION NEEDED:** Software engineering guidance on when fallbacks ARE appropriate
- [ ] **BOUNDARY DEFINITION:** Clear criteria distinguishing legitimate vs problematic fallbacks
- [ ] **BEST PRACTICE:** Style guides for separating calculation vs presentation code

**Suggested Research Keywords:**
- "Separation of concerns error handling"
- "Presentation layer error tolerance"
- "Calculation vs display error handling"
- "Defensive programming boundaries"

---

## Parameters Requiring Validation

### Performance Budget (scripts/profilePhasePerformance.ts)

**PARAMETER:** `BUDGET: 120ms per step`

**Claim Context:**
> "New profiling script validates 120ms per-step performance budget"

**Verification Needed:**
- [ ] **JUSTIFICATION:** Why 120ms? Is this empirically validated or arbitrary?
- [ ] **USER EXPERIENCE:** What research backs 120ms as acceptable simulation step latency?
- [ ] **HARDWARE BASELINE:** What hardware assumptions underpin this budget?

**Current Status:** This parameter appears in multiple documents (roy_performance_investigation_20251120.md) but original justification unclear.

---

## Recommended Research Sources

### Software Engineering - Error Handling

1. **Fail-Fast Error Handling:**
   - Shore, J. & Warden, S. (2007). *The Art of Agile Development*. O'Reilly. (Chapter on fail-fast programming)
   - Hunt, A. & Thomas, D. (1999). *The Pragmatic Programmer*. (Dead Programs Tell No Lies)

2. **Scientific Computing:**
   - Wilson, G. et al. (2014). "Best Practices for Scientific Computing." *PLOS Biology* 12(1): e1001745.
   - Hatton, L. (1997). "The T-experiments: errors in scientific software." *IEEE Computational Science and Engineering* 4(2): 27-38.

3. **Defensive Programming:**
   - McConnell, S. (2004). *Code Complete, 2nd Ed.* Microsoft Press. (Chapter 8: Defensive Programming)

### Numerical Computing - Error Propagation

4. **Floating Point Errors:**
   - Goldberg, D. (1991). "What every computer scientist should know about floating-point arithmetic." *ACM Computing Surveys* 23(1): 5-48.

5. **NaN Propagation:**
   - IEEE Standard 754-2008 for Floating-Point Arithmetic (NaN behavior specification)

### Assertions & Contracts

6. **Design by Contract:**
   - Meyer, B. (1992). "Applying 'Design by Contract'." *IEEE Computer* 25(10): 40-51.

7. **Runtime Assertions:**
   - Rosenblum, D. (1995). "A Practical Approach to Programming With Assertions." *IEEE Transactions on Software Engineering* 21(1): 19-31.

---

## Two-Layer Verification Checklist

### Layer 1: Citation Existence
- [ ] Verify Wilson et al. (2014) PLOS Biology paper exists and is peer-reviewed
- [ ] Verify McConnell (2004) Code Complete contains defensive programming chapter
- [ ] Verify Hunt & Thomas (1999) Pragmatic Programmer contains "Dead Programs Tell No Lies"
- [ ] Verify Hatton (1997) IEEE paper on errors in scientific software
- [ ] Verify Goldberg (1991) ACM floating-point arithmetic survey
- [ ] Verify Meyer (1992) Design by Contract paper
- [ ] Verify Rosenblum (1995) runtime assertions paper

### Layer 2: Claim Accuracy
- [ ] **Wilson et al. (2014):** Does it SPECIFICALLY recommend fail-fast error handling in scientific code?
- [ ] **McConnell (2004):** Does it distinguish calculation vs display error handling contexts?
- [ ] **Hunt & Thomas (1999):** Does "Dead Programs Tell No Lies" apply to scientific simulations specifically?
- [ ] **Hatton (1997):** Does it provide evidence that silent failures hide bugs in scientific software?
- [ ] **Goldberg (1991):** Does it recommend NaN propagation detection strategies?
- [ ] **Meyer (1992):** Does Design by Contract support or contradict the assertion approach used here?
- [ ] **Rosenblum (1995):** Does it provide guidance on assertion granularity and placement?

---

## Expected Findings

### Strong Support Expected:
- Wilson et al. (2014) likely supports fail-fast error handling in scientific computing
- McConnell (2004) likely distinguishes defensive programming contexts
- IEEE 754-2008 specifies NaN propagation behavior (validates detection importance)

### Potential Contradictions:
- Some sources may recommend graceful degradation over fail-fast in production systems
- Design by Contract may have different assertion philosophy than used here
- Real-time systems literature may prioritize availability over correctness

### Open Questions:
- **Severity calibration:** Is "CRITICAL" justified for potential vs actual bugs?
- **Context boundaries:** Clear criteria for when fallbacks ARE appropriate
- **Testing strategy:** How to validate assertion coverage without over-constraining?

---

## Implementation Impact

**Files Modified:** 7 simulation files
**Lines Changed:** ~50 calculation patterns replaced
**Test Coverage:** Monte Carlo N=10 validation pending

**Risk Assessment:**
- **HIGH RISK:** May surface latent initialization bugs (currently masked)
- **MEDIUM RISK:** May create brittleness if assertions are too strict
- **LOW RISK:** Well-contained to calculation code (display layer unchanged)

---

## Next Steps for Validation

1. **Research Phase:** super-alignment-researcher to locate and extract claims from sources
2. **Skeptic Review:** research-skeptic to validate claim accuracy and find contradictory evidence
3. **Empirical Validation:** Run Monte Carlo N=10, check for new assertion failures
4. **Refinement:** If assertions fire on legitimate states, add feature flags or proper initialization
5. **Documentation Update:** Update CLAUDE.md with validated error handling guidelines

---

## Confidence Assessment

**Philosophy Soundness:** HIGH (fail-fast in scientific computing is well-established)
**Implementation Correctness:** MEDIUM (merge conflicts need resolution)
**Severity Claims:** MEDIUM (need evidence of actual vs potential bugs)
**Legitimate Fallback Criteria:** LOW (needs clearer boundaries and research backing)

**Recommendation:** Proceed with research validation, particularly focusing on:
1. Empirical evidence from Wilson et al. (2014) and Hatton (1997)
2. Context boundaries from McConnell (2004)
3. Assertion best practices from Meyer (1992) and Rosenblum (1995)
