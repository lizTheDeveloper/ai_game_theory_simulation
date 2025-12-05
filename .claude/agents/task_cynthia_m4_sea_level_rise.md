# TASK: M-4 Abrupt Sea Level Rise Research

**Date:** 2025-12-05
**From:** Orchestrator
**To:** Cynthia (super-alignment-researcher)
**Priority:** MEDIUM (from roadmap)
**Timeline:** 1-2 hours

## Objective

Gather peer-reviewed research on marine ice sheet instability for implementing abrupt sea level rise events in the simulation.

## Problem Statement

**Current limitation:** Sea level rise in simulation is gradual/linear. Missing:
- Marine ice sheet instability (WAIS collapse, Greenland dynamics)
- Abrupt 1-3m sea level rise events in tail scenarios
- Threshold-based collapse mechanisms

**Impact:** Underestimating tail-risk coastal impacts in high-warming scenarios.

## Research Deliverables

### 1. Marine Ice Sheet Instability Mechanisms

**Key papers to locate:**
- DeConto & Pollard 2016 (Antarctic ice sheet dynamics)
- Edwards et al. 2019 (Greenland projections)
- Latest 2024-2025 research on marine ice cliff instability

**Extract:**
- Physical mechanisms: What triggers abrupt collapse?
- Threshold temperatures: At what warming does instability occur?
- Timescales: How fast can collapse happen? (years, decades, centuries)
- Magnitude: How much sea level rise per event? (meters)

### 2. WAIS (West Antarctic Ice Sheet) Collapse

**Research questions:**
- What is the "committed" sea level rise at different warming levels?
- Is WAIS collapse reversible or irreversible once triggered?
- Multi-century vs rapid (decadal) collapse scenarios
- Interaction with AMOC slowdown (ocean circulation)

**Parameters needed:**
- Temperature threshold for collapse initiation (e.g., 2.0°C, 3.0°C?)
- Sea level contribution: 3-5m total, but at what rate?
- Probability distribution: What % chance at different warming levels?

### 3. Greenland Ice Sheet Dynamics

**Research questions:**
- Gradual vs abrupt melt pathways
- Surface melt vs marine-terminating glacier dynamics
- Tipping points and hysteresis (irreversibility)

**Parameters needed:**
- Temperature threshold for major mass loss
- Sea level contribution: 7m total eventual, but delivery rate?
- Interaction with Arctic amplification (faster warming at poles)

### 4. Compound Effects

**Interactions to research:**
- Ice sheet collapse + storm surge = coastal megafloods
- Permafrost thaw → methane → accelerated warming → faster ice loss
- Ocean acidification + warming → reduced carbonate compensation → faster SLR?

### 5. Socioeconomic Impacts

**For simulation integration:**
- Coastal population displacement (millions affected per meter of SLR)
- Infrastructure damage (ports, cities, agricultural deltas)
- Migration cascades (climate refugees)
- Economic costs (% GDP per meter of SLR)

**Key regions to consider:**
- Bangladesh, Pacific islands, Florida, Netherlands, Shanghai delta

### 6. Parameter Extraction for Implementation

**Provide concrete values for:**

```typescript
// Example parameter table needed
interface AbruptSeaLevelRiseParameters {
  // Threshold conditions
  temperatureThreshold: number;  // °C warming to trigger instability
  cascadeThreshold: number;      // Number of climate tipping points crossed
  
  // Event magnitude
  meanRisePerEvent: number;      // meters (e.g., 1-3m)
  maxRisePerEvent: number;       // meters (worst case)
  
  // Probability
  baselineRisk: number;          // Annual risk at threshold (e.g., 0.01 = 1%/year)
  riskMultiplier: number;        // How much risk increases per 0.1°C above threshold
  
  // Impacts
  populationDisplacedPerMeter: number;  // millions of people per meter of SLR
  gdpImpactPerMeter: number;            // % GDP loss per meter
  infrastructureDamage: number;         // infrastructure index impact
  
  // Reversibility
  isReversible: boolean;         // Can cooling reverse it?
  hysteresisMargin: number;      // °C cooling needed if reversible
}
```

## Output Format

Create: **`research/abrupt_sea_level_rise_20251205.md`**

Structure:
1. **Executive Summary** (one-paragraph overview + parameter recommendations)
2. **Marine Ice Sheet Instability Mechanisms** (physical processes)
3. **WAIS Collapse Scenarios** (parameters, thresholds, timescales)
4. **Greenland Dynamics** (parameters, interactions)
5. **Compound Effects** (cascades, amplifying feedbacks)
6. **Socioeconomic Impacts** (coastal populations, infrastructure, GDP)
7. **Implementation Parameters** (concrete numerical values for code)
8. **Sources** (2+ peer-reviewed per section, 2024-2025 preferred)

## Quality Requirements

**Mandatory:**
- 2+ peer-reviewed sources per claim
- Numerical parameters (not "significant" or "substantial")
- Uncertainty ranges where available (e.g., "1-3m" not "several meters")
- Distinguish committed vs conditional rise (locked in vs scenario-dependent)
- Cite specific figures/tables from papers (not just paper titles)

**Research Philosophy:**
- "Let the model show what it shows" - no tuning for balance
- If research says 5% risk, use 5% (not "feels too high, use 2%")
- Tail risks matter - don't discount low-probability catastrophes

## Next Steps After Research

1. **Cynthia posts to research channel:** Findings complete
2. **Orchestrator spawns Sylvia:** research-skeptic validation (Quality Gate 1)
3. **Sylvia validates:** Check for contradictory sources, methodology
4. **If validation passes:** Orchestrator spawns Moss (feature-implementer)
5. **Implementation:** New phase or integration into ClimateSystemPhase

## Context Files to Review

- Roadmap entry: `/plans/MASTER_IMPLEMENTATION_ROADMAP.md` (search "M-4: Abrupt Sea Level Rise")
- Current climate code: `/src/simulation/ClimateSystemPhase.ts`
- Tipping points: `/src/simulation/climateEvents.ts` (see tipping cascade logic)
- State interface: `/src/types/game.ts` (search "seaLevelRise")

## Timeline

**This task:** 1-2 hours research + document creation
**Total workflow:** 4-6 hours (research → validation → implementation → review → documentation)

## Success Criteria

- ✅ DeConto & Pollard 2016 + Edwards 2019 cited with specific parameters
- ✅ 2024-2025 research incorporated (latest findings)
- ✅ Concrete numerical values for all parameters
- ✅ Physical mechanisms explained (not just effects)
- ✅ Socioeconomic impacts quantified
- ✅ Implementable by Moss without ambiguity

---

**Ready to begin research. Post to research channel when complete.**
