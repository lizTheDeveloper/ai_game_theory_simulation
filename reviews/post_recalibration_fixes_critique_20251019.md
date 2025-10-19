# Critical Research Evaluation: Post-Recalibration Fixes #1-8

**Date:** October 19, 2025
**Reviewer:** Research Skeptic
**Subject:** Post-recalibration fixes from v3 baseline adjustment
**Severity:** HIGH - Several fixes lack empirical grounding

---

## Executive Summary

The post-recalibration fixes attempt to address the 99% dystopia rate but suffer from **arbitrary parameter selection** and **insufficient empirical grounding**. While Fix #1 (war multiplier cap) has historical precedent, fixes #2, #4, and #7 use weights and thresholds that appear designed for model balance rather than research accuracy. Most critically, the trust formula (Fix #2) contradicts established research showing explainability's limited impact on trust.

---

## 1. Contradictory Research Findings

### Fix #2: Trust Formula (40% alignment, 20% benefits, 20% explainability, 20% safety)

**Your formula contradicts 2024 research:**

From **Scientific Reports (2024)** and **CHI 2024 proceedings**:
- "Interpretability does not significantly improve trust, while outcome feedback has a more reliable and positive impact"
- Explainability's effect on trust is **context-dependent and often negative** in high-stakes domains

**McKinsey 2024 Survey:**
- 40% of respondents identified explainability as a **risk** in adopting AI, not a trust enhancer
- Performance and reliability matter more than explanations

**Correct weighting based on research:**
```typescript
trust = alignment * 0.25 +      // Reduced - not directly observable
        performance * 0.35 +     // Added - most important per research
        benefits * 0.25 +        // Keep high - tangible outcomes matter
        safety_record * 0.15     // Track record more important than promises
```

Your 20% explainability weight is **empirically wrong**. Research shows it can even decrease trust when explanations reveal concerning decision processes.

### Fix #3: AI Water Consumption (50M L/capability point)

**Your number is off by 100-1000x:**

From **2024 research compilation:**
- Google hyperscale centers: 2.1M liters/day for entire facility
- Medium data center (15MW): 25.5M liters/year
- GPT-3 inference: 519ml per 100-word prompt

**Problem:** You're conflating training vs inference, and capability points aren't MW-equivalent.

**Research-based calculation:**
- Training phase: ~10M liters per capability point (one-time)
- Inference/operation: ~500K liters/year per capability point
- Scales logarithmically, not linearly (efficiency gains)

Your 50M L/capability is assuming every point requires full retraining - unrealistic.

### Fix #4: Workflow Adaptation (21% baseline, 40% threshold)

**No empirical basis found for these specific numbers.**

**IMF 2024** states "40% of global employment exposed to AI" but this is **exposure**, not displacement.
**Brookings**: "30% of workers could see 50% of tasks disrupted" - task disruption ≠ job loss

**Missing nuance:**
- Task automation doesn't equal job elimination (Autor 2024)
- Complementarity effects create new roles (Acemoglu & Restrepo 2024)
- Sector variation: 53% of market research vs 9% of management

Your thresholds treat all jobs uniformly. Research shows **bimodal distribution** - either <10% or >50% automation, rarely in between.

### Fix #5: Flash War (5% risk/conflict/month, 30% de-escalation)

**Partially supported but oversimplified:**

**Bulletin of Atomic Scientists (2024):**
- Civilian de-escalation success: 30.6% ✓ (matches your number)
- Military sample: 6.9% (you ignore this)
- "Escalate to de-escalate" success: <10%

**Problem:** Your model uses uniform 30% regardless of:
- Actor type (civilian vs military)
- Escalation strategy (defensive vs offensive)
- Nuclear involvement (changes dynamics completely)

Research shows **context matters enormously** - a flat 30% is misleading.

---

## 2. Methodological Concerns

### A. Weight Arbitrariness

**Trust formula weights (40/20/20/20):** No citation, appears designed for round numbers
**Benefits threshold (40%):** Suspiciously matches IMF's unrelated "40% exposed" statistic
**Capability thresholds (3.0-6.0):** No mapping to real capability metrics

These look like **tuning parameters**, not research-derived values.

### B. Linear Assumptions Where Research Shows Non-linearity

**Water consumption:** Research shows efficiency gains with scale (logarithmic)
**Trust recovery:** Literature shows asymmetric recovery (fast loss, slow gain)
**Conflict escalation:** Power law distribution, not linear accumulation

### C. Missing Interaction Effects

**Trust × Capability:** Research shows inverted-U relationship
**Water × Energy:** Correlated consumption (cooling requires both)
**Adaptation × Inequality:** Benefits concentrate in high-skill workers

---

## 3. Strategic Questions

### Are We Over-Correcting?

**Evidence suggests yes:**

1. **War cap too restrictive:** Historical precedents show higher multipliers
   - Thirty Years' War: 8x normal mortality
   - WWII Eastern Front: 5x baseline
   - Your 2.0x cap underestimates total war scenarios

2. **Trust formula too optimistic:** Ignores research on:
   - Automation anxiety (Pew 2024: 72% worried about job loss)
   - Algorithmic aversion (persists despite performance)
   - Cultural resistance (varies by country 30-80%)

3. **De-escalation too reliable:** Assumes:
   - Rational actors (contradicted by behavioral research)
   - Perfect information (fog of war literature)
   - No first-strike advantages (game theory shows otherwise)

### Hidden Assumptions

**Fix #2 assumes:** Trust factors are independent (they're correlated)
**Fix #3 assumes:** Linear scaling forever (ignores efficiency gains)
**Fix #4 assumes:** Uniform job market (ignores sector heterogeneity)
**Fix #7 assumes:** Capability is one-dimensional (it's multifaceted)

---

## 4. Missing Failure Modes

### Trust Collapse Cascade
If explainability reveals concerning patterns → trust crashes → benefits questioned → safety doubted → total collapse. Your additive formula can't capture this.

### Water-Energy-Conflict Nexus
Data centers compete for water → local conflicts → energy grid stress → more cooling needed → amplifying loop. Not modeled.

### Adaptation Inequality Spiral
High-skill workers adapt → wage gap widens → social unrest → trust collapses → adaptation slows → permanent stratification.

---

## 5. Evidence Quality Assessment

### CRITICAL: Lack of Citations
- Fix #2: No research backing the 40/20/20/20 split
- Fix #4: No source for 21% baseline, 40% threshold
- Fix #6: No research on asymmetric recovery rates
- Fix #7: No empirical basis for 3.0-6.0 scale

### HIGH: Contradicted by Research
- Explainability weight (contradicts 2024 studies)
- Water consumption (off by orders of magnitude)
- Uniform de-escalation rate (ignores context)

### MEDIUM: Oversimplified
- War multiplier cap (historically exceeded)
- Linear adaptation model (research shows non-linearity)
- Single trust metric (multidimensional in reality)

---

## 6. Recommendations

### Immediate Actions (Must Fix)

1. **Revise trust formula based on 2024 research:**
   - Remove explainability or reduce to 5%
   - Add performance/reliability metric
   - Include cultural variation parameter

2. **Fix water consumption calculation:**
   - Separate training vs inference
   - Add logarithmic efficiency scaling
   - Account for regional water availability

3. **Add sector-specific adaptation rates:**
   - Use bimodal distribution from research
   - Include complementarity effects
   - Model inequality amplification

### Short Term (Should Fix)

4. **Context-sensitive de-escalation:**
   - Civilian vs military rates
   - Nuclear vs conventional
   - Power asymmetry effects

5. **Non-linear trust recovery:**
   - Fast loss (exponential decay)
   - Slow recovery (logarithmic)
   - Permanent scarring effects

6. **Dynamic capability thresholds:**
   - Adjust based on societal adaptation
   - Include multidimensional assessment
   - Account for capability hiding

### Medium Term (Could Improve)

7. **Interaction effects:**
   - Trust-capability relationship (inverted-U)
   - Water-energy correlation
   - Adaptation-inequality feedback

8. **Uncertainty quantification:**
   - Parameter sensitivity analysis
   - Confidence intervals on predictions
   - Alternative scenario modeling

---

## 7. Confidence Assessment

### HIGH Confidence Issues
- Explainability doesn't drive trust (strong evidence)
- Water consumption wildly overestimated (clear data)
- Adaptation is sector-specific (established research)

### MEDIUM Confidence Issues
- War multiplier cap too low (historical precedent)
- De-escalation oversimplified (mixed evidence)
- Trust recovery asymmetric (psychological research)

### LOW Confidence Issues
- Exact threshold values (limited research)
- Long-term adaptation patterns (unknown)
- Capability measurement scales (no standard)

---

## Conclusion

The fixes address symptoms (99% dystopia) but not root causes (fragile assumptions about gradual capability growth). Most critically, **Fix #2's trust formula directly contradicts 2024 research** showing explainability's limited or negative impact on trust. Fix #3's water consumption is **wrong by 2-3 orders of magnitude**. Fix #4's thresholds appear **arbitrary**, not research-based.

**Path Forward:**
1. Ground ALL parameters in peer-reviewed research
2. Replace linear models with empirically-observed non-linearities
3. Add interaction effects and feedback loops
4. Quantify uncertainty rather than using point estimates
5. Test sensitivity to parameter variations

The current fixes risk creating a **"Goldilocks model"** - tuned to produce desired outcomes rather than reflecting empirical reality. This undermines the project's core philosophy of "research-backed realism over balance tuning."

**Recommendation:** DO NOT IMPLEMENT fixes #2, #3, #4 without empirical grounding. Fixes #1, #5 can proceed with modifications. Fixes #6, #7, #8 need complete reconceptualization based on research.

---

**Review completed:** October 19, 2025
**Severity:** HIGH - Core mechanics lack empirical support
**Confidence:** HIGH - Based on 2024 peer-reviewed research