# Novel Entities Boundary Research Task - CRITICAL Priority

**Task ID:** RESEARCH-NOVEL-ENTITIES-20251112
**Priority:** TIER 1 CRITICAL
**Assigned To:** super-alignment-researcher (Cynthia)
**Coordinator:** orchestrator-1
**Status:** READY TO START
**Created:** 2025-11-12

---

## Context

God mode testing reveals 0% effectiveness for Novel Entities planetary boundary despite deploying 7 pollution-related technologies:
- PFAS remediation systems
- Plastic-eating enzymes
- Microplastic capture technologies
- Electrochemical destruction methods

This is either an implementation bug OR the problem is fundamentally harder than modeled (research hypothesis).

**Research Roadmap Reference:** `research/RESEARCH_ROADMAP.md` TIER 1, Priority 1

---

## Mission

Find peer-reviewed evidence (2024-2025 preferred) to answer CRITICAL research questions about environmental remediation feasibility.

---

## Research Questions (Priority Order)

### 1. Energy Trap (HIGHEST PRIORITY)

**Question:** Is environmental-scale PFAS/microplastic cleanup energy requirement exceeding global capacity?

**Current Hypothesis:**
- PFAS thermal destruction: 850-1200°C, consuming 50-100 GJ/ton
- Destroying accumulated contamination: 4-40% of global energy (IEA baseline)

**What You Need:**
- Peer-reviewed studies on environmental-scale (not lab-scale) PFAS destruction energy costs
- Microplastic remediation energy requirements at environmental scale
- Energy cost comparisons: concentrated waste streams vs. dilute environmental streams
- Global energy budget constraints for cleanup operations

**Key Question:** Can we validate or refute the 4-40% global energy calculation?

**Search Terms:** "PFAS thermal destruction energy", "microplastic remediation energy cost", "environmental remediation energy requirements", "dilute stream treatment energy"

---

### 2. Concentration Problem (CRITICAL)

**Question:** Do cleanup technologies only work on concentrated waste (>1000 mg/L) while environmental contamination is ng/L to μg/L (6-9 orders of magnitude too dilute)?

**What You Need:**
- Empirical studies comparing concentrated-stream vs. dilute-stream remediation costs
- Reverse osmosis concentration energy requirements (dilute → concentrated)
- Effectiveness decay as concentration decreases (power law? exponential?)
- Minimum viable concentration thresholds for each technology type

**Search Terms:** "PFAS dilute stream remediation", "concentration-dependent treatment efficiency", "environmental concentration cleanup feasibility", "reverse osmosis energy microplastics"

---

### 3. Rebound Effects (HIGH PRIORITY)

**Question:** Does making cleanup "cheaper" increase pollution production (moral hazard / Jevons Paradox)?

**What You Need:**
- Historical case studies: waste generation rates before/after remediation technology deployment
- Environmental regulation rebound effects (does easier disposal increase consumption?)
- Quantitative bounds: What's the typical rebound multiplier? (1.1x? 2x? 5x?)

**Search Terms:** "rebound effect waste management", "Jevons paradox environmental remediation", "waste generation after cleanup technology", "moral hazard pollution regulation"

---

### 4. Irreversibility Hypothesis (IMPORTANT)

**Question:** Are novel entities effectively permanent on human timescales due to atmospheric/oceanic transport?

**What You Need:**
- Cousins et al. 2022 validation: PFAS in rainwater exceeds EPA advisories everywhere including Antarctica
- Atmospheric residence times for PFAS, microplastics, other persistent pollutants
- What fraction of contamination is reversible vs. permanently distributed?
- Montreal Protocol comparison: Production ban vs. cleanup contribution to recovery

**Existing Reference:** Cousins, I. T., et al. (2022). "Outside the safe operating space of the planetary boundary for novel entities." Environmental Science & Technology. DOI: 10.1021/acs.est.2c02765

**Search Terms:** "PFAS atmospheric transport", "microplastic global distribution", "Montreal Protocol cleanup contribution", "persistent pollutant irreversibility", "global contamination recovery time"

---

## Output Format

For each research question, provide:

1. **Finding:** [Clear statement of what research shows]
2. **Source:** [Full citation - Author(s), Year, Journal, DOI]
3. **Evidence Quality:** [A+ to F, explain limitations]
4. **Quantitative Parameters:** [Extract numbers with units and confidence intervals]
5. **Model Implications:** [How should simulation use this?]
6. **Counterevidence:** [What contradicts this finding?]

---

## Success Criteria

- **Minimum:** 2 peer-reviewed sources per research question (total 8+ sources)
- **Preferred:** 2024-2025 publications (latest evidence)
- **Required:** Quantitative parameters (not just qualitative descriptions)
- **Critical:** Environmental-scale data (not lab-scale demonstrations)
- **Evidence Quality:** A- minimum (peer-reviewed, recent, quantitative)

---

## Deliverables

**Primary Output:** `research/novel_entities_energy_dilution_analysis_20251112.md`

**Required Sections:**
1. Executive Summary (key findings, model implications)
2. Energy Trap Analysis (with calculations)
3. Concentration Problem Analysis (with scaling relationships)
4. Rebound Effects Analysis (with historical case studies)
5. Irreversibility Analysis (with atmospheric/oceanic data)
6. Synthesis (combined implications for simulation)
7. Parameter Recommendations (specific values with justification)
8. References (full citations with DOIs)

---

## Coordination

**Post updates to:** `research` channel (Matrix/chatroom)
**Quality Gate 1:** research-skeptic (Sylvia) will validate findings
**Next Phase:** If validation passes → simulation-maintainer diagnostic run
**Timeline:** 2-3 hours research phase, then handoff to validation

---

## Notes

- Focus on environmental-scale feasibility, not lab-scale demonstrations
- Prioritize recent (2024-2025) peer-reviewed sources
- Extract quantitative parameters with uncertainty bounds
- Identify strongest counterevidence (not just supporting evidence)
- If research is sparse, document the gap explicitly

---

**Ready to start - please begin research and post progress updates to research channel.**
