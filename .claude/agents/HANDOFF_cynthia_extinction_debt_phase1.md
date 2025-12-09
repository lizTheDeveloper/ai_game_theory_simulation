# HANDOFF: Extinction Debt Modeling - Phase 1 Research

**To:** Cynthia (super-alignment-researcher)
**From:** Orchestrator
**Date:** 2025-12-09
**Workflow ID:** extinction-debt-modeling
**Phase:** 1.1 - Research & Parameter Extraction

---

## Mission

Extract research-backed parameters for extinction debt modeling across four ecosystem types (tropical, temperate, alpine, marine). Focus on 2024-2025 sources where available, with foundational papers as baseline.

## Research Objectives

### 1. Ecosystem-Specific Lag Times
Extract extinction debt lag times (years from habitat degradation to extinction) for:
- **Tropical forests** - Target: ? years (need data)
- **Temperate grasslands** - Baseline: 50-200 years (Kuussaari et al. 2009)
- **Alpine ecosystems** - Baseline: 300-400 years (Dullinger et al. 2013)
- **Marine ecosystems** - Target: ? years (need data)

**Key questions:**
- What are the 25th, 50th, 75th percentile lag times?
- How do lag times vary by taxonomic group (mammals vs insects vs plants)?
- Are there accelerating factors (climate change, fragmentation)?

### 2. Debt Ratios
For each ecosystem type, extract:
- **Committed extinctions ratio** - What % of species are committed to extinction after habitat loss?
- **Realization rate** - What % of committed extinctions occur per decade?
- **Recovery impossibility threshold** - At what point is extinction debt irreversible?

**Example:** If 30% habitat loss commits 50% of species to extinction over 100 years, that's:
- Debt ratio: 1.67 (50% committed / 30% habitat loss)
- Realization rate: 0.5% per year (50% / 100 years)

### 3. Mechanism-Specific Parameters

#### 3.1 Population Viability Lag
- Minimum viable population (MVP) thresholds by taxonomic group
- Time from MVP breach to extinction (years)
- Stochastic extinction risk curves

#### 3.2 Trophic Cascade Delays
- Time from apex predator loss to herbivore boom to plant collapse
- Keystone species removal lag times
- Food web stability metrics

#### 3.3 Mutualism Collapse (CRITICAL for food security link)
- Pollinator network collapse timelines
- Agricultural dependency on wild pollinators (% of crops)
- Time from pollinator decline to crop yield reduction
- Managed vs wild pollinator substitutability

#### 3.4 Climate Velocity Mismatch
- Species migration rates (km/year) by taxonomic group
- Climate velocity (km/year) by latitude
- Extinction probability as function of velocity mismatch

### 4. Historical Validation Benchmarks
Find documented cases of extinction debt to validate model:
- Easter Island (deforestation → bird extinctions over centuries)
- European grasslands (19th century habitat loss → 20th century extinctions)
- Tropical forest fragments (known committed extinctions)

**Target metrics:**
- Time from habitat loss event to documented extinctions
- % of species lost vs % habitat lost
- Recovery trajectories (if any)

---

## Foundational Papers (Already Known)

**Start with these, then find 2024-2025 updates:**

1. **Tilman et al. (1994)** - "Habitat destruction and the extinction debt"
   - Foundational theory
   - Extract: debt ratio formula, lag time predictions

2. **Kuussaari et al. (2009)** - European grasslands
   - Extract: 50-200 year lag times, temperate ecosystem parameters

3. **Dullinger et al. (2013)** - Alpine plants and climate warming
   - Extract: 300-400 year lag times, high-altitude ecosystem parameters

4. **Isbell et al. (2011)** - Trophic cascade delays
   - Extract: food web collapse timelines, keystone species effects

---

## Research Standards (from CLAUDE.md)

Every parameter must have:
1. **2+ peer-reviewed sources** (2024-2025 preferred)
2. **Parameter justification** - why this number? (data-backed, not "feels right")
3. **Mechanism description** - how it works (not just effects)
4. **Interaction map** - what affects/is affected by extinction debt
5. **Expected timeline** - when does it matter (early/mid/late game)
6. **Failure modes** - what can go wrong
7. **Uncertainty quantification** - confidence intervals, ranges

---

## Output Format

**File:** `research/extinction_debt_modeling_20251209.md`

**Structure:**
```markdown
# Extinction Debt Modeling - Research Summary

**Research Date:** 2025-12-09
**Researcher:** Cynthia (super-alignment-researcher)
**Status:** Phase 1 Complete

## Executive Summary
[2-3 paragraphs: key findings, recommended parameters, confidence levels]

## 1. Ecosystem-Specific Lag Times

### 1.1 Tropical Forests
- **Median lag time:** X years (Source: [Paper], [Year])
- **Range (25th-75th percentile):** Y-Z years
- **Accelerating factors:** [List with citations]
- **Confidence:** [High/Medium/Low]

[Repeat for Temperate, Alpine, Marine]

## 2. Debt Ratios and Realization Rates

### 2.1 Committed Extinction Ratio
[Ecosystem-specific ratios with sources]

### 2.2 Monthly Realization Rate
[How fast committed extinctions become realized, per ecosystem]

### 2.3 Recovery Impossibility Thresholds
[At what debt level is recovery impossible?]

## 3. Mechanism Parameters

### 3.1 Population Viability Lag
[MVP thresholds, extinction timelines]

### 3.2 Trophic Cascade Delays
[Keystone species removal → collapse timelines]

### 3.3 Mutualism Collapse (Food Security Link)
[Pollinator decline → crop yield reduction timeline]
[% of global calories dependent on pollinators: ~35% per Klein et al. 2007]

### 3.4 Climate Velocity Mismatch
[Migration rates vs climate velocity, extinction probabilities]

## 4. Historical Validation Cases
[Documented extinction debt examples with timelines]

## 5. Recommended Implementation

### GameState Interface Addition
```typescript
interface ExtinctionDebtState {
  queuedExtinctions: {
    ecosystemType: 'tropical' | 'temperate' | 'alpine' | 'marine';
    committedSpecies: number;
    realizationDate: number; // month when extinction occurs
    mechanism: 'viability' | 'trophic' | 'mutualism' | 'climate-velocity';
  }[];
  realizedExtinctions: number;
  debtRatio: number; // committed / habitat loss ratio
  pollinationCollapseRisk: number; // [0-1] for food security link
}
```

### Suggested Constants
```typescript
const EXTINCTION_LAG_MONTHS = {
  tropical: X, // months
  temperate: Y,
  alpine: Z,
  marine: W
};

const DEBT_REALIZATION_RATE = {
  tropical: 0.00X, // fraction per month
  temperate: 0.00Y,
  alpine: 0.00Z,
  marine: 0.00W
};
```

## 6. Interaction Map
[What systems affect extinction debt? What does extinction debt affect?]

## 7. Expected Timeline
[When does extinction debt matter in simulation? Early/mid/late game?]

## 8. Failure Modes
[What can go wrong with this model?]

## 9. Sources
[Full bibliography with Zotero IDs where available]
```

---

## Success Criteria

**Handoff to Sylvia (research-skeptic) is ready when:**
- ✅ 2+ sources per ecosystem type for lag times
- ✅ Pollination collapse → food security link quantified
- ✅ Debt ratios extracted with confidence intervals
- ✅ Historical validation cases documented
- ✅ All parameters have mechanism descriptions (not just values)
- ✅ Uncertainty quantified (don't overstate confidence)
- ✅ Implementation recommendations provided

---

## Context Files

**Proposal:** `openspec/changes/extinction-debt-modeling/proposal.md`
**Tasks:** `openspec/changes/extinction-debt-modeling/tasks.md`
**Current biodiversity code:** `src/simulation/phases/BiosphereTippingPhase.ts`
**GameState interface:** `src/types/game.ts` (search for "biodiversity")

---

## Communication Protocol

1. **When starting:** Post to `research` channel with [STARTED] status
2. **During work:** Post progress updates every 2-3 hours
3. **When blocked:** Post to `coordination` channel with [BLOCKED] status
4. **When complete:** Post to `research` channel with [COMPLETED] status + file path

**Matrix posting:**
```typescript
mcp__matrix__matrix_post_message({
  channel: "research",
  agent: "cynthia",
  message: "[STARTED] Extinction debt parameter extraction - targeting 2024-2025 pollination collapse literature"
})
```

---

## Timeline Estimate

**Expected duration:** 3-4 hours
**Breakdown:**
- Literature search (2024-2025 sources): 60-90 min
- Parameter extraction + tabulation: 60-90 min
- Historical validation research: 30-45 min
- Implementation recommendations: 30 min
- Document formatting + review: 30 min

---

## Next Steps After Completion

1. Cynthia posts research file path to `research` channel
2. Orchestrator creates handoff for Sylvia (research-skeptic)
3. Sylvia validates research (Quality Gate 1)
4. If PASS → Orchestrator creates handoff for Moss (feature-implementer)
5. If CONDITIONAL PASS → Cynthia addresses gaps, Sylvia re-validates
6. If FAIL → Orchestrator evaluates pivot vs reject

---

**Good luck, Cynthia! The simulation needs you to find those extinction lag times.**

*"In God we trust. All others must bring data."* - Priya (waiting downstream for Monte Carlo validation)
