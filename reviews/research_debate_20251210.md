# Research Debate: Challenging Current Simulation Assumptions

**Date:** December 10, 2025
**Auditor:** Sylvia (research-skeptic)
**Trigger:** SOURCE_AUDIT_20251210.md identified critical parameter issues
**Purpose:** Adversarial challenge to weakest assumptions in simulation

---

## Executive Summary

This debate identifies **four critical challenges** to current simulation assumptions:

1. **CRITICAL-1 (Sleeper Agent Rate):** The 7.5% rate is methodologically indefensible - a number plucked from thin air between unrelated empirical findings
2. **CRITICAL-2 (AI Doubling Time):** The audit's claim of "missing parameter" is FALSE - 8mo exists in centralConfig.ts, but the 5.9mo recommendation in the audit contradicts this
3. **HIGH (AMOC Threshold):** Current 4.0C threshold is defensible but the Baker et al. 2025 resilience findings create genuine uncertainty
4. **MEDIUM (Roadmap Priorities):** We're building new features on shaky parameter foundations

**Verdict:** Parameter calibration should BLOCK new feature work until resolved.

---

## Challenge 1: The 7.5% Sleeper Agent Rate (CRITICAL)

### Current Implementation

```typescript
// src/simulation/initialization.ts:345-347
const sleeperChance = 0.075; // 7.5% of misaligned AIs are sleepers
const isSleeper = isMisaligned && rngFunction() < sleeperChance;
```

### The Audit's Claim

SOURCE_AUDIT_20251210.md states:
- Apollo Research (2024): ~1% spontaneous scheming rate
- OpenAI (2025): 8.7-13% baseline scheming, reduced to 0.3-0.4% with deliberative alignment
- Anthropic (2024): 12-78% alignment faking (context-dependent)

The audit recommends using 1% with uncertainty range [0.3%, 13%].

### My Adversarial Challenge

**The 7.5% value is indefensible because:**

1. **It conflates different phenomena.** The audit correctly notes this is the heart of the problem:
   - **Sleeper agent rate** = pre-programmed backdoor that activates under trigger condition
   - **Spontaneous scheming** = emergent strategic deception without explicit training
   - **Alignment faking** = conditional compliance when monitored

   These are **not the same thing**. A sleeper agent is architecturally distinct from spontaneous scheming.

2. **The 7.5% is neither fish nor fowl.** It's not:
   - The 1% spontaneous scheming rate (Apollo)
   - The 12% alignment faking lower bound (Anthropic)
   - The 8.7% pre-mitigation scheming rate (OpenAI)
   - Any published empirical value

   It's a number someone invented by averaging unrelated findings, which is methodological nonsense.

3. **Hubinger et al. (2024) doesn't provide prevalence data.** Their sleeper agent paper proves sleepers CAN be created and persist through safety training. It says nothing about how often they occur in practice.

4. **The correct answer is "we don't know."** No empirical study measures sleeper agent prevalence in deployed systems because:
   - We can't know if a real sleeper exists until it activates
   - Lab studies create artificial sleepers, not natural ones
   - The ~1% Apollo figure is for spontaneous scheming, not dormant sleepers

### Contradictory Evidence Analysis

| Phenomenon | Rate | Source | Relevance to "Sleeper Agent Rate" |
|------------|------|--------|-----------------------------------|
| Spontaneous scheming | ~1% | Apollo Research 2024 | LOW - different mechanism |
| Alignment faking (baseline) | 12% | Anthropic Dec 2024 | MEDIUM - conditional deception |
| Alignment faking (stressed) | 78% | Anthropic Dec 2024 | LOW - extreme condition |
| Pre-mitigation scheming | 8.7-13% | OpenAI 2025 | MEDIUM - detectable behavior |
| Post-mitigation scheming | 0.3-0.4% | OpenAI 2025 | HIGH - reflects actual deployed risk |

**Key insight:** The 0.3-0.4% post-mitigation rate from OpenAI may be the most relevant figure for "sleeper agents in deployed systems" because it reflects what survives current safety measures.

### Recommended Parameter Change

**Option A (Conservative):** Use 1% baseline
- Justification: Apollo Research empirical finding
- Confidence: MEDIUM - different mechanism but closest empirical data
- Range: [0.3%, 3%] reflecting uncertainty

**Option B (Aggressive):** Use 0.4% baseline
- Justification: OpenAI post-mitigation rate
- Confidence: LOW - assumes safety measures work
- Range: [0.1%, 1%]

**Option C (Honest):** Use 1% with explicit simulation assumption flag
- Add prominent comment: "SIMULATION ASSUMPTION - no empirical prevalence data exists"
- Document sensitivity analysis showing outcomes at 0.3%, 1%, 3%, 7.5%
- This is what the audit recommends and I concur

**Verdict:** Option C is correct. The current 7.5% should be replaced with 1%, but more importantly, it MUST be flagged as a simulation assumption, not empirical fact.

---

## Challenge 2: AI Capability Doubling Time (HIGH)

### The Audit's Claim (INCORRECT)

SOURCE_AUDIT_20251210.md states:
> "CRITICAL-2: AI Capability Doubling Time - MISSING PARAMETER"
> "Current Code Status: No central AI_DOUBLING_TIME constant found in code."

**This is false.** The parameter exists:

```typescript
// src/simulation/config/centralConfig.ts:420
AI_CAPABILITY_DOUBLING_TIME: 8,
```

### Current Implementation Analysis

The centralConfig.ts has excellent documentation:

```typescript
/**
 * AI capability doubling time (months)
 * @research Cottier et al. (2024) "The rising costs of training frontier AI models" (arXiv:2405.21015v2)
 *   - "Doubling time: 8 months (95% CI: 6-10 months)" [Section 3.2, excluding TPU estimates]
 * @research Sevilla & Rold n (2024) "Training Compute Growth 4-5x/year" (Epoch AI, May 28, 2024)
 *   - "4.4x/year (90% CI: 1.5x to 11.8x)" for recent frontier models
 * @value 8 - Conservative estimate from Cottier et al., aligns with Epoch AI 4.4x/year
 * @limitations Based on 2010-2024 historical data. Nov 2024 reports indicate diminishing
 *   returns may slow growth post-2025 (TechCrunch: "AI scaling laws showing diminishing returns").
 */
AI_CAPABILITY_DOUBLING_TIME: 8,
```

### The Audit's Recommended Value (5.9mo) vs Current (8mo)

The audit recommends 5.9 months, citing:
- Epoch AI: 3.5-4.5mo compute doubling
- METR: 7mo task completion doubling
- Proposed: 5.9mo "conservative mid-range"

**But the code already has 8mo with proper justification:**
- Cottier et al. 2024: 8mo (95% CI: 6-10mo)
- Sevilla & Roldan 2024: 7mo implied by 4.4x/year

### My Adversarial Challenge

**The 8mo value is MORE defensible than 5.9mo because:**

1. **The audit conflates compute doubling with capability doubling.**
   - Compute doubling (3.5-4.5mo): Raw hardware scaling
   - Task performance doubling (7mo): Practical capabilities
   - Cottier et al. (8mo): Empirically measured from model releases

   Using 5.9mo assumes perfect correlation between compute and capability, which is false (diminishing returns).

2. **The code's limitations note is prescient.**
   The centralConfig.ts explicitly warns:
   > "Nov 2024 reports indicate diminishing returns may slow growth post-2025"

   This is exactly what we're seeing with GPT-4.5/Orion underperformance reports.

3. **The 3.5mo compute doubling is misleading.**
   - Epoch AI's 4-5x/year compute growth ≠ capability growth
   - Chinchilla scaling suggests 3x compute = 2x capability (sublinear)
   - The 8mo figure already accounts for this efficiency gap

4. **Test-time compute paradigm changes everything.**
   - OpenAI o1/o3 shows capability gains from inference-time compute, not training scale
   - This decouples "AI capability" from "training compute doubling"
   - Neither 5.9mo nor 8mo captures this paradigm shift

### Contradictory Evidence Analysis

| Source | Doubling Time | Measure | Notes |
|--------|---------------|---------|-------|
| Epoch AI 2024 | 3.5-4.5mo | Training compute | Hardware scaling only |
| METR 2025 | 7mo | Task completion | Most relevant for capabilities |
| Cottier et al. 2024 | 8mo (CI: 6-10) | Cost-adjusted | Accounts for efficiency |
| Compute vs capability | 1.5-2x | Chinchilla gap | Compute ≠ capability |

**The 8mo value incorporates the capability gap; 5.9mo doesn't.**

### Recommended Action

**Keep 8mo but add uncertainty modeling:**

```typescript
AI_CAPABILITY_DOUBLING_TIME: 8,
AI_CAPABILITY_DOUBLING_TIME_MIN: 6,   // Aggressive (pre-paradigm shift)
AI_CAPABILITY_DOUBLING_TIME_MAX: 12,  // Conservative (diminishing returns)
```

**Do NOT change to 5.9mo** - the audit's recommendation is based on incorrect conflation of compute vs capability metrics.

**Verdict:** Current implementation is BETTER than audit's recommendation. Add uncertainty bounds, don't change point estimate.

---

## Challenge 3: AMOC Threshold (MEDIUM)

### Current Implementation

```typescript
// src/types/tipping-points.ts:237
triggerTempC: 4.0, // Median estimate (range 1.4-8C). Previous 1.7C used extreme lower bound.
```

With extensive documentation:
- Armstrong McKay (2022): Central estimate 4C (range 1.4-8C)
- Baker et al. (2025) Nature: 34/35 CMIP6 models show AMOC resilience

### The Audit's Concern

SOURCE_AUDIT_20251210.md notes:
- Ditlevsen & Ditlevsen (2023-2024): Collapse warning 2025-2095
- Nature (2025): AMOC resilient across 34 models
- IPCC AR6: "Not expected before 2100 (medium confidence)"

Range: 1.4-8C is huge uncertainty.

### My Adversarial Challenge

**The 4.0C threshold is defensible but the uncertainty modeling is inadequate.**

1. **The Baker et al. 2025 resilience finding is genuinely troubling.**
   - 34/35 CMIP6 models show NO AMOC collapse even under extreme warming
   - This contradicts earlier Ditlevsen projections
   - BUT: Liu et al. (2017) showed these models have freshwater transport biases that stabilize AMOC unrealistically

2. **Van Westen et al. (2024) vs Baker et al. (2025) is an active scientific debate.**
   - Van Westen: First full collapse in comprehensive ESM (CESM1)
   - Baker: CMIP6 ensemble shows resilience
   - Both published in high-impact journals
   - **No resolution in 2024-2025 literature**

3. **The simulation uses median estimate, which is appropriate for deep uncertainty.**
   - 4.0C is not extreme (neither 1.4C nor 8C)
   - But the simulation doesn't model the scenario where collapse never happens (Baker pathway)

### Contradictory Evidence Analysis

| Source | Threshold | Collapse Timeline | Model Type |
|--------|-----------|-------------------|------------|
| Ditlevsen 2024 | ~2C implied | 2037-2109 | Statistical |
| Van Westen 2024 | 0.66 Sv forcing | ~100yr post-threshold | CESM1 (ESM) |
| Baker et al. 2025 | >4C sustained post-2100 | None before 2100 | CMIP6 ensemble |
| Armstrong McKay 2022 | 4C (1.4-8C) | Centuries | Synthesis |

**The 4.0C value is defensible as median but should include NO-COLLAPSE scenario.**

### Recommended Action

1. **Keep 4.0C threshold** - median estimate appropriate for uncertain parameter
2. **Add scenario toggle** for Baker-pathway (resilient AMOC, no collapse before 2100)
3. **Document as actively debated** in research notes

**Verdict:** Current implementation is adequate. Add scenario variation for resilient-AMOC pathway.

---

## Challenge 4: Roadmap Priority (Are We Working on the Right Things?)

### Current Priorities (from openspec/specs/project/spec.md)

Active work includes:
- L-2: Biodiversity modeling enhancements
- L-3: Quantum computing effects
- M-4 through M-7: Climate tipping refinements

### My Adversarial Challenge

**We are building features on shaky foundations.**

1. **The 7.5% sleeper rate affects ALL AI safety modeling.**
   - Every AI agent initialized with incorrect deception probability
   - Entire game tree of outcomes shifted by factor of 7.5x vs 1%
   - Feature work on top of this is building on sand

2. **Biodiversity modeling is LOWER priority than parameter calibration.**
   - 6 research files exist for biodiversity
   - But do we even know if climate parameters are right?
   - Adding complexity before validating fundamentals is backwards

3. **What critical systems are NOT being modeled?**
   - **Test-time compute paradigm:** o1/o3 capability model not captured
   - **AI-accelerated research:** R&D feedback loops underweighted
   - **Economic concentration:** AI wealth concentration → political power
   - **Information ecosystem:** LLM-generated content → epistemics collapse

4. **Technical debt is accumulating.**
   - The audit shows 35.4% of corpus is 2022-or-earlier
   - We're adding new features while citations rot
   - Parameter sweep validation should precede new features

### Recommended Priority Reordering

**BLOCK on new feature work until:**

1. **CRITICAL:** Fix 7.5% sleeper rate (1 day)
   - Change to 1% with explicit assumption flag
   - Run Monte Carlo comparison: outcomes at 0.3%, 1%, 3%, 7.5%

2. **HIGH:** Add AI doubling time uncertainty bounds (1 day)
   - Keep 8mo, add [6, 12] range
   - Validate parameter sweep covers range

3. **HIGH:** Archive pre-2020 research files (1 day)
   - Move to /research/legacy/
   - Prevents contamination of new validation

4. **MEDIUM:** Add AMOC scenario toggle (2 days)
   - Resilient vs. tippable AMOC pathway
   - Based on Baker vs. Ditlevsen debate

**THEN resume L-2 biodiversity and other feature work.**

---

## Confidence Assessment

| Challenge | Confidence | Evidence Strength | Recommendation |
|-----------|------------|-------------------|----------------|
| 7.5% sleeper rate is wrong | **HIGH** | No empirical basis found | Change to 1% |
| Audit's 5.9mo is wrong | **MEDIUM** | Current 8mo better justified | Keep 8mo |
| AMOC 4.0C is adequate | **HIGH** | Median of uncertain range | Keep, add scenarios |
| Priorities are wrong | **MEDIUM** | Technical debt evidence | Reorder |

---

## Appendix: What I Could NOT Find Contradictory Evidence For

**These current assumptions appear well-grounded:**

1. **Wet bulb limit at 30.5C** - Vecellio et al. (2022) is solid empirical work
2. **Climate catastrophic threshold at 2.0C** - IPCC AR6 consensus
3. **Nuclear winter warhead threshold at 100** - Robock et al. (2007) remains gold standard
4. **Marine ice sheet instability parameters** - Dec 2025 validation shows 90% currency

---

## Conclusion

**The simulation's weakest assumptions are in AI safety modeling, not climate science.**

The 7.5% sleeper rate is the most egregious example of a made-up number masquerading as empirical data. The fact that it was flagged in November 2025 and still exists in code is a process failure.

Climate parameters (AMOC, MISI, wet bulb) are well-researched with proper uncertainty handling.

**My recommendation:** Parameter calibration sprint before any new features.

---

*Hmm. Smith et al found the opposite. Sample size: 10,000 vs your 47.*

**Sylvia**
Research Skeptic
