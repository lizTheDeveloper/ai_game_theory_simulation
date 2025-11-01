# Task: Layer 2 Phase 2 - UBI Context-Dependent Model Research

**Agent:** super-alignment-researcher (Cynthia)
**Date:** October 31, 2025
**Priority:** HIGH (Layer 2 Remediation Phase 2)
**Estimated Time:** 3-5 hours

---

## Context

**Layer 2 Structured Debate Findings:**
- Current simulation extrapolates Finland UBI experiment (5-10% QoL improvement) globally
- **Problem:** Finland (Nordic welfare state, 2K unemployed, €560/month, 2 years) ≠ global contexts
- **Generalizability Crisis:** Sample bias, duration mismatch, payment amount mismatch, context mismatch

**Existing Research:**
- `/research/kangas_ubi_finland_verification_20251030.md` (220 lines) - Finland experiment verified (7.4% life satisfaction improvement)
- `/research/ubi-floor-mechanics-validation_20251027.md` - UBI mechanics spec

**Critical Issue:** Extrapolating Finland → global is INVALID without context-dependent modeling

---

## Research Objectives

### Primary Objective

**Develop context-dependent UBI effectiveness model** accounting for:
1. **State capacity** (government enforcement, corruption, infrastructure)
2. **Poverty level** (extreme poverty vs middle income vs developed)
3. **Existing safety nets** (welfare state presence, informal support networks)
4. **Payment amount relative to local purchasing power**
5. **Duration** (temporary vs permanent UBI)

### Research Questions

1. **How does UBI effectiveness vary by development level?**
   - Developed countries (Finland, Canada): X% QoL improvement
   - Middle-income countries (Kenya GiveDirectly, India pilots): Y% QoL improvement
   - Low-state-capacity regions (failed states, conflict zones): Z% QoL improvement?

2. **What are the empirical bounds?**
   - Best case (optimal conditions): Upper bound
   - Worst case (failed states, corruption): Lower bound
   - Median case: Central estimate

3. **What factors mediate effectiveness?**
   - State capacity → enforcement, corruption resistance
   - Local prices → purchasing power parity adjustments
   - Existing safety nets → substitution vs addition effects
   - Duration → adaptation, behavioral changes

### Success Criteria

- **2+ peer-reviewed sources** for each context (developed, middle-income, low-capacity)
- **Quantitative effect sizes** with confidence intervals
- **Mechanism explanations** (why effects differ by context)
- **Parameter ranges** for simulation implementation
- **Uncertainty documentation** (what we don't know)

---

## Research Strategy

### Phase 1: Developed Countries (2-3 sources needed)

**Finland (VERIFIED):**
- Kangas et al. (2019/2020): 7.4% life satisfaction improvement
- 2,000 unemployed, €560/month, 2 years
- Context: Strong welfare state, high trust, good governance

**Additional sources to find:**
- **Canada Ontario pilot** (2017-2019, cancelled early)
- **Alaska Permanent Fund Dividend** (40+ years, small amount)
- **US pilots** (Stockton, Denver, others)
- **Meta-analyses** of developed country experiments

**Expected range:** 2-10% QoL improvement (small amounts, existing safety nets provide floor)

### Phase 2: Middle-Income Countries (2-3 sources needed)

**Kenya GiveDirectly:**
- Large-scale RCT in rural Kenya
- **CRITICAL:** Find actual QoL/consumption effect sizes
- Context: Extreme poverty, limited state capacity, rural

**India pilots:**
- Madhya Pradesh (SEWA/UNICEF, 2011-2013)
- **CRITICAL:** Quantitative outcomes needed

**Brazil Bolsa Família:**
- Conditional cash transfer (not pure UBI but relevant)
- 20+ years, massive scale (14M families)

**Expected range:** 10-30% QoL improvement (extreme poverty baseline, larger relative impact)

### Phase 3: Low-State-Capacity Contexts (SPARSE DATA)

**Challenge:** Few RCTs in failed states or conflict zones

**Proxy evidence to search:**
- Cash transfers in refugee contexts (UNHCR programs)
- Post-conflict reconstruction cash programs
- Humanitarian cash assistance effectiveness
- Corruption impact on transfer programs

**Expected range:** 0-15% QoL improvement (high leakage, weak enforcement, conflict disruption)

### Phase 4: Systematic Reviews & Meta-Analyses

**Search for:**
- Meta-analyses of cash transfer programs globally
- Systematic reviews of UBI experiments
- Development economics reviews (Banerjee & Duflo, Haushofer & Shapiro, etc.)
- World Bank / IMF research on social protection

---

## Deliverable Structure

### Target Document: `/research/ubi_context_dependent_effectiveness_20251031.md`

**Required Sections:**

1. **Executive Summary**
   - Context-dependent effect sizes (developed/middle/low-capacity)
   - Confidence levels by context
   - Key findings and recommendations

2. **Developed Countries**
   - 3+ experiments with quantitative outcomes
   - Effect sizes with uncertainty ranges
   - Mechanistic explanations

3. **Middle-Income Countries**
   - 3+ experiments (Kenya, India, Brazil, etc.)
   - Effect sizes with uncertainty ranges
   - Poverty level effects

4. **Low-State-Capacity Contexts**
   - Proxy evidence from humanitarian cash programs
   - Upper/lower bounds on effectiveness
   - Corruption and leakage rates

5. **Context-Dependent Model Specification**
   - **Function:** `UBI_effectiveness = f(state_capacity, poverty_level, safety_nets, payment_amount)`
   - **Parameter ranges** for each variable
   - **Interaction effects** (e.g., low state capacity × high corruption)

6. **Uncertainty Assessment**
   - Tier assignment (GOLD/SILVER/BRONZE)
   - Confidence intervals by context
   - Data gaps identified

7. **Implementation Recommendations**
   - Simulation parameter updates needed
   - Context-dependent multipliers
   - Monte Carlo sampling strategy

---

## Research Standards

**Tier Requirements:**
- **TIER 1 GOLD:** Direct measurement from RCTs (Finland, Kenya)
- **TIER 2 SILVER:** Bounded extrapolation from related programs (Bolsa Família → UBI)
- **TIER 3 BRONZE:** Expert judgment / humanitarian proxies (failed states)

**Citation Standards:**
- Peer-reviewed sources preferred (2020-2025 most recent)
- Government/NGO reports acceptable for empirical data (World Bank, UNHCR, GiveDirectly)
- Preprints acceptable if methodology is rigorous

**Uncertainty Standards:**
- Document confidence intervals from papers
- Preserve uncertainty ranges (don't collapse to point estimates)
- Flag extrapolations explicitly

---

## Handoff Instructions

**After Research Complete:**
1. Save deliverable to `/research/ubi_context_dependent_effectiveness_20251031.md`
2. Post summary to `#research` channel
3. Hand off to **research-skeptic (Sylvia)** for Quality Gate 1 validation
4. Tag findings for orchestrator attention

**Success Metrics:**
- 6+ peer-reviewed sources (2 per context minimum)
- Quantitative effect sizes for 3 contexts
- Implementation-ready parameter ranges
- Passes research-skeptic critique

---

## Timeline

**Estimated:** 3-5 hours
- Phase 1 (Developed): 1h
- Phase 2 (Middle-income): 1-2h
- Phase 3 (Low-capacity): 1h
- Phase 4 (Meta-analyses): 1h
- Documentation: 30m-1h

**Priority:** HIGH (blocks Layer 2 Phase 2 completion)

---

## Notes

**Key Insight from Debate:**
> "Finland → global extrapolation is INVALID. Effect sizes could be 2.5% (developed) to 30% (extreme poverty) - 10× range!"

**The Challenge:**
Most UBI research is in developed countries (ethical/practical reasons). Middle-income data exists but sparse. Low-capacity contexts have almost NO UBI RCTs (only humanitarian cash proxies).

**Expected Outcome:**
- Developed: HIGH confidence (multiple RCTs)
- Middle-income: MEDIUM confidence (fewer RCTs, larger effects)
- Low-capacity: LOW confidence (no RCTs, proxy evidence only)

This is a TIER 2 SILVER / TIER 3 BRONZE hybrid parameter - empirical foundation for some contexts, extrapolation for others.
