# Task: Supply Chain Cascade Propagation Research

**Agent:** super-alignment-researcher (Cynthia)
**Priority:** HIGH
**Created:** 2025-12-12
**Orchestration Plan:** `.claude/agents/HANDOFF_supply_chain_cascades_orchestration.md`

## Objective

Gather peer-reviewed research (2024-2025 preferred) on supply chain cascade failures and their propagation mechanisms to inform simulation implementation.

## Research Questions

### 1. Just-in-Time Manufacturing Vulnerabilities

**What we need:**
- Typical inventory buffer sizes in critical industries (semiconductors, automotive, pharmaceuticals)
- How quickly do disruptions propagate through supply networks?
- What are the threshold points for cascade failures?
- Recovery times after buffer exhaustion

**Why it matters:**
COVID-19 showed JIT systems collapse rapidly when disrupted. McKinsey 2024 reports companies have 38,000 tier-3 suppliers but only 0.2% visibility. Need to model buffer exhaustion → production halt → downstream cascades.

### 2. Single Points of Failure

**What we need:**
- Taiwan semiconductor concentration (% of global capacity by node size)
- Shipping chokepoint criticality (Suez, Panama, Malacca, Hormuz)
  - % of global trade through each
  - Reroute costs and delays if closed
- Financial infrastructure (SWIFT, clearing systems)
  - Redundancy/alternatives
  - Cascade effects if failed
- Other critical dependencies (rare earths, specific crops, etc.)

**Why it matters:**
Drewry 2024 reports global shipping 40% more concentrated than 2010. Need to model what happens when critical nodes fail.

### 3. Infrastructure Cascade Mechanisms

**What we need:**
- Power → water propagation
  - How many hours until water treatment/pumping fails?
  - Population affected per day of outage
- Water → food propagation
  - Agriculture impact timelines
  - Food processing/refrigeration dependencies
- Food → healthcare propagation
  - Malnutrition → healthcare demand
  - Hospital operational dependencies on food/water
- Healthcare → labor force → economic output

**Why it matters:**
Texas freeze 2021: 3-day grid failure → 4.5M without water → $195B damages. Need quantitative cascade parameters.

### 4. Finance → Supply Chain Propagation

**What we need:**
- Credit freeze → JIT collapse mechanisms
  - How quickly do companies halt production without credit?
  - Cash reserve buffers by industry
- Payment system failures → supply chain paralysis
  - SWIFT alternatives and timelines
  - Trade impacts if payment systems fail
- Currency collapse → trade disruption
  - Timelines and mechanisms
- Unemployment → demand collapse → supply chain contraction
  - Feedback loop parameters

**Why it matters:**
2008 financial crisis showed credit freezes cascade to real economy. Need to model finance → physical supply chain propagation.

### 5. Quantitative Parameters

**Required for each mechanism:**
- **Cascade multipliers:** 1 failure → N downstream failures
- **Propagation speeds:** hours, days, weeks to full cascade
- **Recovery times:** by sector, by cascade type
- **Threshold sensitivities:** at what point does cascade become unstoppable?
- **Compound effects:** how do multiple cascades interact?

**Why it matters:**
Simulation needs realistic timescales and magnitudes. Research debate suggests collapse scenarios are 2-5x too slow - likely because we model individual failures, not cascades.

## Evidence Already Available

Review these before starting new research:

1. **Crisis cascade multipliers:** `research/crisis_cascade_multipliers_20251020.md`
   - 1.5-2.5x multipliers for polycrisis
   - Lawrence et al. 2024 polycrisis framework
   - Gambhir et al. 2025 systemic risk assessment

2. **COVID-19 supply chain data:**
   - McKinsey 2024: 38,000 tier-3 suppliers, 0.2% visibility

3. **Texas infrastructure cascade:**
   - 2021 freeze: 3-day grid failure → 4.5M without water → $195B damages

4. **Shipping concentration:**
   - Drewry 2024: 40% more concentrated than 2010

5. **Civilizational collapse modes:**
   - Scheffer et al. 2023 (Nature): Cascade failures dominant mode

## Deliverable

**File:** `research/supply_chain_cascade_propagation_YYYYMMDD.md`

**Required sections:**
1. **Executive Summary** - Key findings, parameter recommendations
2. **Just-In-Time Manufacturing** - Buffer sizes, propagation speeds, thresholds
3. **Single Points of Failure** - Critical nodes, redundancy, failure impacts
4. **Infrastructure Cascades** - Power → water → food → healthcare with timelines
5. **Finance Cascades** - Credit → supply chain → employment with mechanisms
6. **Quantitative Parameters Table** - All cascade types with multipliers, speeds, recovery
7. **Interaction Map** - How cascades compound with existing crisis systems
8. **Expected Timeline** - When do cascades matter in simulation (early/mid/late)
9. **Failure Modes** - What can go wrong with cascade modeling
10. **Simulation Implementation Notes** - Parameter recommendations, edge cases
11. **Sources** - Full citations in APA format, peer-reviewed preferred

**Quality standards:**
- 2+ peer-reviewed sources per mechanism
- Quantitative parameters (not "some" or "many", actual numbers)
- Recent sources (2024-2025 preferred, 2020+ acceptable)
- Mechanism descriptions (how it works, not just effects)
- Conservative estimates (research tool, not disaster porn)

## Success Criteria

This research passes to validation (Sylvia) when:
- [ ] All 5 research questions answered with peer-reviewed sources
- [ ] Quantitative parameters provided for each cascade type
- [ ] Mechanisms described (causal pathways, not just correlations)
- [ ] Interaction map with existing systems documented
- [ ] Timeline expectations defined (early/mid/late game)
- [ ] Failure modes identified
- [ ] Implementation notes provided for Roy
- [ ] Conservative parameter recommendations (fail safe, not catastrophize)

## Next Steps

After completion:
1. Post research file to `research/` directory
2. Notify in coordination channel (orchestrator)
3. Handoff to Sylvia (research-skeptic) for validation (Quality Gate 1)
4. If validation passes → OpenSpec change proposal
5. If validation fails → iterate or pivot

## Notes

This is a HIGH priority feature from Session 70 research debate. The finding that "collapse scenarios may be 2-5x too slow" is significant - suggests we're missing major systemic feedback loops. Supply chain cascades are well-documented in resilience research (Scheffer 2023) and represent a critical gap.

The goal is NOT to make the simulation more pessimistic, but to make it more REALISTIC. Cascades happen in the real world (Texas 2021, COVID-19 2020-2022) and should be modeled accurately.

Conservative, research-backed parameters only. No speculation.

## Agent Memory Context

```json
{
  "agent_id": "cynthia",
  "task": "Supply chain cascade propagation research",
  "priority": "HIGH",
  "focus_areas": [
    "Just-in-time manufacturing vulnerabilities",
    "Single points of failure (semiconductors, shipping, SWIFT)",
    "Infrastructure cascades (power → water → food → healthcare)",
    "Finance cascades (credit → supply chain → employment)",
    "Quantitative parameters (multipliers, speeds, recovery times)"
  ],
  "deliverable": "research/supply_chain_cascade_propagation_YYYYMMDD.md",
  "existing_research": [
    "research/crisis_cascade_multipliers_20251020.md"
  ],
  "next_agent": "sylvia (research-skeptic)",
  "orchestration_plan": ".claude/agents/HANDOFF_supply_chain_cascades_orchestration.md"
}
```
