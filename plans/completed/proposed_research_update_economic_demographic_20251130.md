# Research Update: Economic & Demographic Parameters - Proposal

**Date:** November 30, 2025
**Status:** PROPOSED
**Priority:** MEDIUM (improves realism, not blocking)
**Effort:** ~4-6 hours (research + implementation)
**Source:** Research Validation Audit (Nov 30, 2025)

## Problem Statement

Research audit identified outdated parameters in economic and demographic domains:

**Grade: C** (both domains using pre-2020 data)

### Specific Gaps

1. **Economic Parameters:** GDP baselines, automation impact rates, investment multipliers
   - Current sources: Pre-2020
   - Missing: 2024 OECD/World Bank data with post-pandemic adjustments

2. **Demographic Baseline:** Mortality rates, population growth, regional variations
   - Current sources: Pre-2020 WHO data
   - Missing: 2024 WHO mortality data (post-COVID pandemic effects)

3. **Scheffer Citation Discrepancy:** Tipping point research cited as 2024, actually 2014
   - Potential confusion with recent update or different Scheffer paper
   - Needs verification and correction

4. **Ocean Synergy Mechanism:** Acidification + warming interaction
   - Current: Single 2020 source
   - Need: 2020-2025 replication studies for robustness

## Proposed Solution

### Phase 1: Economic Parameters Update (2-3 hours)

**Research Tasks:**
1. Find 2024 World Bank/OECD GDP data
   - Global GDP baseline (~$114T current, verify 2024 figure)
   - Regional GDP distribution shifts
   - Post-pandemic economic structure changes

2. Find 2024 automation impact studies
   - AI-driven productivity gains (current: outdated estimates)
   - Labor displacement rates
   - Investment multiplier effects

**Implementation:**
- Update `src/simulation/constants/economic.ts` (or relevant file)
- Update citations in `research/economic_parameters_YYYYMMDD.md`
- Validate with existing economic phases (no behavior changes expected)

**Expected Changes:**
- GDP baseline adjustment (±5-10%)
- Automation multipliers (likely increased from pre-2020 estimates)
- Regional distribution shifts (emerging economies growth)

### Phase 2: Demographic Baseline Update (2-3 hours)

**Research Tasks:**
1. Find 2024 WHO Global Health Observatory data
   - Age-standardized mortality rates by region
   - Post-COVID mortality baseline shifts
   - Life expectancy changes 2020-2024

2. Cross-check with UN Population Division 2024 revision

**Implementation:**
- Update `getRegionalHistoricalDeathRate()` in `src/simulation/regionalPopulations.ts`
- Update baseline mortality in demographic initialization
- Update citations in `research/demographics_mortality_YYYYMMDD.md`

**Expected Changes:**
- Mortality baseline adjustments (COVID impact)
- Regional variation updates
- Life expectancy recalibration

### Phase 3: Citation Corrections (30 min)

**Scheffer Discrepancy:**
1. Grep codebase for "Scheffer" citations
2. Verify actual paper dates (2024 vs 2014)
3. Correct citations or add clarifying notes
4. Update `research/tipping_points_YYYYMMDD.md`

**Ocean Synergy:**
1. Search 2020-2025 literature for acidification-warming interactions
2. Add 2-3 replication studies to strengthen mechanism
3. Update `research/ocean_systems_YYYYMMDD.md`

### Phase 4: Validation (1 hour)

**Monte Carlo N=3:**
- Verify no unexpected outcome shifts
- Check economic/demographic time series look reasonable
- Confirm parameter changes are within expected ranges

**Hindcast Validation:**
- If affecting 1990-2010 period, verify hindcast still accurate

## Research Needed

**High Priority:**
1. 2024 World Bank World Development Indicators
2. 2024 OECD Economic Outlook
3. 2024 WHO Global Health Observatory mortality data
4. Verify Scheffer et al. citation (2024 vs 2014)

**Medium Priority:**
1. Recent ocean acidification-warming studies (2020-2025)
2. 2024 automation/AI economic impact studies
3. UN Population Division 2024 revision

## Expected Timeline

- Phase 1 (Economic): 2-3 hours
- Phase 2 (Demographic): 2-3 hours
- Phase 3 (Citations): 30 min
- Phase 4 (Validation): 1 hour
- **Total: 4-6 hours**

## Success Criteria

- ✅ All economic parameters updated to 2024 sources
- ✅ All demographic parameters updated to 2024 sources
- ✅ Scheffer citation verified/corrected
- ✅ Ocean synergy mechanism supported by 3+ sources (2020-2025)
- ✅ Research audit grade improves from C to B+ or better
- ✅ Monte Carlo validation shows no unexpected outcome shifts
- ✅ All citations documented in research/ directory

## Risks

**Medium risk:**
- Parameter changes could shift outcome distributions
- Post-COVID mortality data may have unusual patterns
- Automation estimates vary widely across sources

**Mitigation:**
- Monte Carlo N=10 validation before/after
- Document parameter value ranges from multiple sources
- Be conservative with changes (prefer incremental updates)

## Dependencies

None - can be done independently.

## Future Work

After this update:
- Consider automated research currency monitoring
- Set up 6-month review cycle for critical parameters
- Create parameter sensitivity analysis for key economic/demographic values

## Notes

- This addresses the "C-grade" domains from research audit
- Climate/AI domains already A-grade (2024-2025 literature)
- Economic parameters affect GDP-adaptive spending (recently implemented)
- Demographic parameters affect mortality cascades (critical for outcomes)
