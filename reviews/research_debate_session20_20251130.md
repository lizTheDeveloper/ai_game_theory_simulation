# Research Debate - Session 20

**Date:** November 30, 2025
**Participants:** Cynthia (super-alignment-researcher) + Sylvia (research-skeptic)
**Mode:** Token conservation - 4 topics maximum, concise format

---

## Topic 1: Concentration Factor Power Law (alpha = 2.0)

**Cynthia's Position:**
The current implementation uses alpha = 2.0 as a reasonable midpoint from the documented range (1.5-2.5). The code comment appropriately uses "approximately" notation, and the Sorengard 2024 paper does demonstrate cost scaling with dilution. The implementation is defensible for a research simulation.

**Sylvia's Critique:**
Hmm. "Defensible" is not "validated." The research file explicitly states alpha is "inferred, not measured." We are treating a model fit as empirical data. The effectiveness variation across this range is not trivial - at alpha = 1.5, cleanup at 100x dilution yields 21% effectiveness; at alpha = 2.5, it yields 4%. That is a 5x difference in simulation outcomes from one uncertain parameter.

The absence of Monte Carlo sensitivity analysis means we do not know if our conclusions are robust to this uncertainty. We may be building policy insights on a foundation of sand.

**Resolution/Consensus:**
- **AGREE:** alpha = 2.0 is acceptable as default (reasonable midpoint)
- **AGREE:** Uncertainty propagation is missing and needed
- **DISAGREE:** Priority level
  - Cynthia: MEDIUM - parameter sweep infrastructure exists (M-3), integrate there
  - Sylvia: HIGH - cannot trust cleanup effectiveness results until validated

**Priority:** HIGH (Sylvia wins - research integrity requires knowing if conclusions are robust)

**Action:** Add alpha sensitivity [1.5, 2.0, 2.5] to M-3 parameter sweep when injection system complete.

---

## Topic 2: Ocean Acidification Rate (IPCC 2019 vs Jiang 2023)

**Cynthia's Position:**
This is a genuine CRITICAL issue. The simulation uses IPCC SROCC (2019) acidification rates, but Jiang et al. (2023) in Nature Climate Change shows observed rates are 20-30% higher than 2019 projections. Our pH decline projections are systematically optimistic. 30-minute fix with significant accuracy impact.

**Sylvia's Critique:**
Agree completely. This is not even a debate. Four years of new data showing we underestimate the problem is exactly the kind of update that must happen. The fact this has been flagged since Session 19 without fix is concerning. Token conservation mode or not, a 30-minute fix that corrects 20-30% systematic bias should have happened yesterday.

The Acemoglu citation year (2022 vs 2019) is a 2-minute accuracy fix that has also languished. These are not trade-offs against development time - they are basic research hygiene.

**Resolution/Consensus:**
- **UNANIMOUS:** Fix both issues immediately
- Ocean pH: Update to Jiang 2023 parameters
- Acemoglu: Correct year 2022 -> 2019

**Priority:** CRITICAL (unchanged from Session 19 - execution is blocked on worker availability, not debate)

**Action:** Next available worker session should prioritize these 2 fixes (combined: 35 minutes).

---

## Topic 3: Automation Displacement Threshold (Pre-GPT Era Research)

**Cynthia's Position:**
The simulation's automation displacement thresholds reference Frey & Osborne (2013) - research that predates GPT-2, GPT-3, GPT-4, and Claude by 6-11 years. The "47% of jobs at risk" finding was based on pre-transformer AI capabilities. Post-2022 research shows dramatically different displacement patterns:
- Goldman Sachs (2023): 300M jobs globally at risk from generative AI
- McKinsey (2023): 30% of hours worked could be automated by 2030
- ILO (2024): White-collar jobs now more exposed than manufacturing

This is not a minor update - it is a paradigm shift.

**Sylvia's Critique:**
I agree the research is stale, but I want to flag a methodological concern. The 2023-2024 estimates are themselves highly uncertain projections, not empirical measurements. We would be replacing outdated speculation with newer speculation.

The better path: Use the structural insight (generative AI shifts displacement from physical to cognitive labor) rather than specific percentages. The simulation should model capability-based displacement thresholds, not fixed job-loss percentages.

That said - yes, using 2013 research for a 2025+ simulation modeling AI impacts is indefensible. The question is HOW to update, not WHETHER.

**Resolution/Consensus:**
- **AGREE:** Current implementation is outdated (11-year-old research for AI labor modeling)
- **DISAGREE:** Approach to fix
  - Cynthia: Update with 2023-2024 sources (Goldman, McKinsey, ILO)
  - Sylvia: Design capability-based model, avoid percentage-driven speculation
- **COMPROMISE:** Create research file documenting both approaches, let implementation decide

**Priority:** HIGH (demoted from Cynthia's CRITICAL - simulation still runs, just with conservative estimates)

**Action:** Create `research/ai_labor_displacement_generative_era_2024_YYYYMMDD.md` comparing projection-based vs capability-based approaches. Implementation decision follows research.

---

## Topic 4: Roadmap Priorities - What Next?

**Cynthia's Position:**
With all HIGH items complete, the MEDIUM tier priorities are:
1. **M-2 (Assertion audit)**: 55 remaining fallback patterns - COMPLETE (audit done, no migration needed)
2. **M-3 (Parameter sweep execution)**: Blocked on injection system
3. **Research CRITICAL fixes**: Ocean pH + Acemoglu - should be FIRST

Recommendation: Execute CRITICAL research fixes, then design parameter injection system to unblock M-3.

**Sylvia's Critique:**
The CRITICAL fixes are table stakes - they should happen regardless of other priorities. Beyond that, I am concerned we keep deferring validation work.

Looking at the research queue: 170 HIGH priority files (34% of total) have sources > 5 years old. We are modeling 2025-2050 futures using 2015-2019 research. That is concerning for a "research-backed" simulation.

However - token conservation mode means we cannot tackle the full research update backlog. The pragmatic path:
1. CRITICAL fixes (30 min)
2. Parameter injection design (unblocks M-3)
3. Cherry-pick highest-impact stale research for targeted updates

**Resolution/Consensus:**
- **UNANIMOUS:** CRITICAL fixes first (ocean pH, Acemoglu)
- **UNANIMOUS:** Parameter injection design is highest-impact MEDIUM work
- **DISAGREE:** Research backlog urgency
  - Cynthia: Systematic update needed (170 stale files)
  - Sylvia: Cherry-pick approach (focus on parameters that drive outcomes)

**Priority:**
- CRITICAL fixes: CRITICAL (immediate)
- Parameter injection: HIGH (unblocks validation)
- Research backlog: MEDIUM (token-budget dependent)

**Action:**
1. Next session: CRITICAL fixes (35 min)
2. Design parameter injection interface (spec only, not implementation)
3. Identify top 5 stale parameters with highest outcome sensitivity

---

## Summary Table

| Topic | Priority | Consensus | Disagreement |
|-------|----------|-----------|--------------|
| alpha sensitivity | HIGH | Add to M-3 sweep | Priority level (Sylvia wants higher) |
| Ocean pH update | CRITICAL | Fix immediately | None |
| Automation research | HIGH | Update needed | Implementation approach |
| Roadmap priorities | CRITICAL/HIGH/MEDIUM | CRITICAL first, then param injection | Research backlog scope |

---

## Debate Outcome

**Items Requiring Action (Priority Order):**

1. **CRITICAL (35 min total):**
   - Ocean acidification: Update to Jiang 2023
   - Acemoglu: Fix citation year 2022 -> 2019

2. **HIGH (2-4 hours):**
   - Parameter injection system design (spec)
   - alpha sensitivity range documentation
   - Automation research file creation

3. **MEDIUM (deferred to token budget restoration):**
   - Full M-3 parameter sweep execution
   - Research backlog systematic update

**Key Insight:**
The simulation's research foundation is solid for recent implementations (A- grade) but has significant technical debt in legacy parameters. Token conservation mode correctly defers non-blocking updates, but CRITICAL research accuracy fixes should not be deferred further.

---

**Debate Adjourned**

*Sylvia: "Better to know our uncertainty bounds than to pretend precision we don't have."*
*Cynthia: "Agreed. The research is the product. Everything else is implementation details."*
