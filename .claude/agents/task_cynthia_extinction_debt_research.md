# Task: Research Extinction Debt Mechanics

**Agent:** Cynthia (super-alignment-researcher)
**Priority:** HIGH (H-3 from roadmap)
**Date:** November 27, 2025
**Context:** Biodiversity recovery overestimation fix

## Your Mission, Cynthia

We need comprehensive research on **extinction debt** - the phenomenon where species loss continues for 50-400 years after habitat degradation is removed. Current simulation assumes immediate recovery when stressors are removed, which overestimates recovery potential.

## Research Request

### Key Papers to Retrieve

**Priority 1 - Foundational:**
1. **Tilman et al. (1994)** - "Habitat destruction and the extinction debt"
   - Foundational theoretical paper
   - Original concept formulation

2. **Kuussaari et al. (2009)** - European grasslands extinction debt
   - 50-200 year timescales documented
   - Meta-analysis across ecosystems

3. **Halley et al. (2016)** - "Dynamics of extinction debt across five taxonomic groups"
   - Meta-analysis across 36 studies
   - Lag effect quantification

**Priority 2 - Recent Updates:**
4. Papers from 2020-2025 updating extinction debt estimates
5. Climate velocity mismatch studies (species can't migrate fast enough)
6. Pollinator network collapse timescales

### Parameters to Extract

For each ecosystem type (tropical forest, temperate forest, grassland, marine):

1. **Lag timescales:**
   - Time from habitat loss to species extinction
   - Range (min-max years)
   - Median lag time

2. **Extinction debt ratio:**
   - Committed extinctions / Total biodiversity loss
   - What percentage of loss is "in the pipeline"?

3. **Mechanisms:**
   - Population viability (Allee effects, genetic drift)
   - Trophic cascade delays
   - Mutualism collapse (pollinators, seed dispersers)
   - Climate velocity mismatch

4. **Recovery dynamics:**
   - Can debt be "paid down" with restoration?
   - Irreversibility thresholds (when is debt permanent?)
   - Half-life of recovery (if possible)

5. **Temporal patterns:**
   - Does debt accumulate linearly or exponentially?
   - Does paydown accelerate or slow over time?

### Implementation Context

**Current state:**
- Biosphere boundary has asymptotic recovery (200 year half-life, 5% floor)
- But it treats all extinction as immediate
- Missing: tracking of committed vs realized extinctions

**What we're building:**
```typescript
interface ExtinctionDebtState {
  queuedExtinctions: ExtinctionQueueEntry[];  // Species committed to extinction
  realizedExtinctions: number;                // Species actually extinct
  debtRatio: number;                          // Queued / (Queued + Realized)
  ecosystemCollapse: {
    [ecosystem: string]: {
      degradationYear: number;
      expectedDebt: number;
      realizedDebt: number;
    };
  };
}
```

**Monthly timestep:** Need parameters that work for 1-month simulation increments

### Output Format

Save to: `research/extinction_debt_YYYYMMDD.md`

**Required sections:**
1. **Executive Summary** - Key findings in 3-5 bullet points
2. **Lag Timescales Table** - By ecosystem type
3. **Mechanisms** - Detailed description of each mechanism
4. **Temporal Dynamics** - How debt accumulates and resolves
5. **Implementation Guidance** - How to model this in monthly timesteps
6. **Full Citations** - DOI, year, authors, key quotes

**Parameter format:**
```markdown
### Tropical Forest Extinction Lag

**Timescale:** 100-400 years (median: 200 years)
**Source:** Kuussaari et al. (2009), Table 2
**Mechanism:** Slow-growing trees create multi-century population inertia
**Uncertainty:** ±50% (high variability across studies)
```

### Success Criteria

- ✅ 3+ peer-reviewed papers (2009-2025 preferred)
- ✅ Quantitative lag times for 4+ ecosystem types
- ✅ Mechanism descriptions with research backing
- ✅ Clear implementation guidance for monthly simulation
- ✅ Parameter uncertainty ranges documented
- ✅ Contradictory findings noted (if any)

### What You'll Find

The plan (`proposed_extinction_debt_modeling_20251125.md`) already lists some key papers:
- Tilman et al. (1994) - foundational
- Kuussaari et al. (2009) - 50-200yr grasslands
- Dullinger et al. (2013) - 300-400yr Alpine plants
- Isbell et al. (2011) - trophic cascade delays

**Your job:** Fetch these papers, extract parameters, find any 2020-2025 updates.

### Known Context

From `biodiversity_extinction_rates_20251113.md`:
- Current extinction rate: 100-1000× background (IPBES 2019)
- Brief mention of extinction debt (lines 218-223) but no parameters

**Gap:** We have the extinction RATE but not the extinction LAG. Need both.

## Timeline

4-6 hours for comprehensive research + parameter extraction.

## Next Steps After Research

1. Hand off to Sylvia (research-skeptic) for validation
2. After validation, hand off to Roy (simulation-maintainer) for implementation
3. Priya will run Monte Carlo validation

---

**Cynthia, this is a well-documented phenomenon (200+ papers). Focus on finding the most recent quantitative estimates and making sure we have ecosystem-specific parameters. The simulation currently overestimates recovery - your research will fix this.**

**Status:** READY TO START
**Blocking Issues:** None
**Dependencies:** None (standalone research task)
