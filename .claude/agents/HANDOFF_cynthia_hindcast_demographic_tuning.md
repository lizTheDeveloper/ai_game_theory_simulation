# Handoff: Hindcast Demographic Transition Tuning Research

**To:** super-alignment-researcher (Cynthia)
**From:** orchestrator-1
**Date:** 2025-12-09
**Priority:** MEDIUM
**Workflow:** Quality Gate 1 (Research Phase)

---

## Context

**Feature:** Hindcast Demographic Transition Tuning
**Roadmap Priority:** MEDIUM (backlog)
**Current State:** Regional birth rates implemented, but death rates still use only global HISTORICAL_CDR
**Problem:** Population overshoot of 6-10% in 2010-2020 (~500M too many people by 2020)

**Deviation by year:**
- 1990: -0.57% (nearly perfect)
- 1995: -5.62% (slight undershoot)
- 2000: +1.72% (excellent)
- 2005: +3.96% (good)
- 2010: +6.86% (overshoot)
- 2020: +10.30% (overshoot)

**Root cause:** Regional death rates varied significantly 1990-2020:
- Sub-Saharan Africa: ~15/1000 → ~8/1000 (dramatic decline from health improvements)
- Europe: ~11/1000 → ~12/1000 (aging population)
- But model uses single global CDR for all regions

**Your task:** Extract region-specific crude death rates (CDR) from UN WPP 2024 for 1990-2025.

---

## Task: Regional Death Rate Data Collection (UN WPP 2024)

**Objective:** Obtain CDR time series data for 10 regions to enable parallel implementation to existing regional birth rate system.

**Input:**
- Change proposal: `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/openspec/changes/hindcast-demographic-tuning/proposal.md`
- Tasks breakdown: `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/openspec/changes/hindcast-demographic-tuning/tasks.md`

**Output:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/regional_death_rates_unwpp2024_20251209.md`

---

## Required Data

### 10 Regions (Match Existing Birth Rate System):

1. **East Asia** (China, Japan, Korea)
2. **South Asia** (India, Pakistan, Bangladesh)
3. **Sub-Saharan Africa** (Nigeria, Kenya, Ethiopia, etc.)
4. **Europe** (EU27 + UK, Russia, etc.)
5. **North America** (USA, Canada)
6. **Latin America** (Brazil, Mexico, Argentina, etc.)
7. **MENA** (Middle East & North Africa)
8. **Southeast Asia** (Indonesia, Philippines, Vietnam, Thailand)
9. **Central Asia** (Kazakhstan, Uzbekistan, etc.)
10. **Oceania** (Australia, New Zealand, Pacific Islands)

### For Each Region, Extract:

**Time Series (8 data points):**
- CDR in 1990, 1995, 2000, 2005, 2010, 2015, 2020, 2025
- Units: deaths per 1,000 population per year

**Contextual Narrative:**
- Overall trend (declining / stable / increasing)
- Key drivers (demographic transition stage, health improvements, aging, conflict)
- Notable inflections or discontinuities

### Additional Requirements:

1. **Primary Source:** UN World Population Prospects 2024 (https://population.un.org/wpp/)
2. **Validation Sources:** WHO mortality data, World Bank demographics (to verify trends)
3. **Parameter Justification:** Why these specific values? What's the uncertainty range?
4. **Expected Impact:** Quantify expected reduction in population overshoot (from +10.3% to target <5%)

---

## Output Format

### Summary Table

```markdown
| Region | 1990 | 1995 | 2000 | 2005 | 2010 | 2015 | 2020 | 2025 | Trend |
|--------|------|------|------|------|------|------|------|------|-------|
| East Asia | ... | ... | ... | ... | ... | ... | ... | ... | ... |
| ... | ... | ... | ... | ... | ... | ... | ... | ... | ... |
```

### Regional Narratives (Each Region):

```markdown
## [Region Name]

**CDR Trajectory:** [1990 value] → [2025 value] ([direction])

**Drivers:**
- [Key factor 1]
- [Key factor 2]
- [Key factor 3]

**Demographic Context:**
- [Stage of demographic transition]
- [Health system evolution]
- [Age structure changes]

**Data Quality:** [Assessment of source reliability and uncertainty]

**Sources:**
- UN WPP 2024: [specific URL]
- [Validation source if used]
```

### Expected Impact Section:

```markdown
## Expected Impact on Population Overshoot

**Current deviation (2020):** +10.30% (+790M people)

**Expected deviation with regional CDR:**
- Hypothesis: Regional CDR variations will reduce births-deaths imbalance
- Sub-Saharan Africa: Faster CDR decline → fewer deaths → less overshoot correction needed
- Europe: Rising CDR from aging → more deaths → dampens overshoot
- Net effect: [quantitative estimate]

**Target:** <5% deviation for 2010-2020 checkpoint years
```

---

## Success Criteria

1. **Complete data:** All 10 regions, 8 time points each (80 data points total)
2. **Authoritative sources:** UN WPP 2024 primary + validation sources
3. **Trend analysis:** Clear narrative explaining CDR evolution per region
4. **Parameter justification:** Why these values? What's the confidence level?
5. **Impact projection:** Expected improvement in hindcast accuracy

---

## Next Steps After Research

1. **Quality Gate 1:** Handoff to research-skeptic (Sylvia) for validation
2. **Implementation:** Roy will create `getRegionalHistoricalDeathRate()` function
3. **Validation:** Priya will run Monte Carlo hindcast (1990-2020, N≥10)
4. **Quality Gate 2:** Architecture review
5. **Documentation:** Wiki update + archival

---

## Notes

**Existing Implementation Reference:**
- Regional birth rates: `src/simulation/engine/phases/BaselineMortalityPhase.ts` (`getRegionalHistoricalBirthRate()`)
- Apply same interpolation approach for death rates
- Integration point: `src/simulation/regionalPopulations.ts`

**Research Quality:** This is a straightforward data extraction task from official UN sources. Should be Grade A (authoritative data, clear methodology).

---

**Ready to proceed?** Please create the research file and post to the `research` channel when complete.
