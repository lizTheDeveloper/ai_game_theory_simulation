# Novel Entities Zero-Effectiveness Research Task

**Priority:** TIER 1 CRITICAL from research roadmap

**Problem Statement:**
God mode testing shows 0% effectiveness for Novel Entities boundary despite 7 pollution technologies deployed (PFAS remediation, plastic-eating enzymes, microplastic capture, electrochemical destruction). This is either:
1. Implementation bug (tech not being applied)
2. Fundamental constraint (thermodynamically/economically infeasible)

**Research Questions (Answer All 5):**

## 1. Thermodynamic Feasibility (Energy Trap)
**Question:** Is cleanup energy requirement exceeding global capacity?

**Hypothesis:** PFAS thermal destruction (850-1200°C, 50-100 GJ/ton) would require 4-40% of global energy for accumulated contamination

**Research Need:** Peer-reviewed energy analysis for environmental-scale PFAS destruction (not just concentrated waste streams)

**Target Parameters:**
- Energy requirement per ton of PFAS/microplastic destroyed (GJ/ton)
- Global contamination stock estimate (million tons)
- Total energy required vs. global energy capacity (% of total)
- Renewable energy surplus available for cleanup (TWh/year)

## 2. Concentration Problem (Dilution Reality)
**Question:** Do cleanup techs only work on concentrated waste (>1000 mg/L) while environmental contamination is ng/L to μg/L (6-9 orders of magnitude too dilute)?

**Hypothesis:** Environmental concentrations are too dilute for economically viable remediation. Concentration step consumes more energy than destruction.

**Research Need:** Empirical studies on dilute-stream vs concentrated-stream remediation costs

**Target Parameters:**
- Minimum effective concentration for each tech (mg/L)
- Environmental contamination concentration ranges (ng/L to μg/L)
- Concentration factor required (orders of magnitude)
- Energy cost of concentration vs. destruction (kWh/kg)

## 3. Rebound Effects (Jevons Paradox)
**Question:** Does making cleanup "cheaper" increase pollution production (moral hazard)?

**Hypothesis:** Cleanup tech deployment reduces disposal costs → increases production rate → net effectiveness may be negative

**Research Need:** Empirical studies on waste generation following remediation tech deployment

**Target Parameters:**
- Historical waste generation before/after cleanup tech (% increase)
- Disposal cost elasticity (production change per % cost reduction)
- Net effectiveness = cleanup rate - induced production (ratio)

## 4. Irreversibility Hypothesis (Permanent Contamination)
**Question:** Are novel entities effectively permanent on human timescales?

**Evidence:** Cousins et al. 2022 shows PFAS in rainwater exceeds EPA advisories globally including Antarctica

**Research Need:** Define what fraction of contamination is reversible vs permanently distributed

**Target Parameters:**
- Atmospheric transport fraction (% that becomes global)
- Removal half-life for distributed contamination (years)
- Reversible vs irreversible fraction (%)
- Timescale to return below safe levels if production stopped (years)

## 5. Montreal Protocol Effectiveness
**Question:** How much did production ban contribute vs. cleanup for CFC phase-out?

**Research Need:** Quantify prevention vs remediation contribution ratios

**Target Parameters:**
- CFC production reduction timeline (Mt/year decline)
- Atmospheric CFC removal contribution (Mt/year)
- Prevention effectiveness ratio (% from ban vs. % from degradation)

**Deliverables:**

1. Research document: `research/novel_entities_zero_effectiveness_20251113.md`
2. All 5 questions answered with 2+ peer-reviewed sources each (2024-2025 preferred)
3. Parameter ranges with uncertainty (pessimistic/realistic/optimistic)
4. Research confidence level (50-95%)
5. Implementation recommendations (model changes needed)

**Timeline:** ~2 hours research phase

**Next Steps:**
- Research validation by Sylvia (research-skeptic)
- Diagnostic testing if implementation bug suspected
- Model design recommendations
- Documentation synthesis

**Coordination:**
- Post progress to research channel
- Flag blockers immediately
- Handoff to Sylvia when research complete
