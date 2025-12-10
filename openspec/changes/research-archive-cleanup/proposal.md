# Research Archive Cleanup: Legacy Source Archival

**Created:** 2025-12-10
**Priority:** MEDIUM
**Effort:** Medium (2-3 hours)
**Impact:** MEDIUM (improves research quality from C → B)
**Proposed by:** Research Source Validation Audit (Dec 10, 2025)

---

## Problem Statement

Research corpus currency is at 53.4% (Grade C), below target of 60% (Grade B).

**Key Issues:**
- 178 files have sources >5 years old (31.7% of corpus)
- Oldest sources from 1955-2020 (70 years old)
- AI safety citations lag field evolution (1995-2018 sources miss RLHF/Constitutional AI)
- Economic recovery parameters use 1989-2009 sources

**Status:** STABLE (no degradation), but below target. Recent implementations maintain excellent standards (M-4: 90%, HIGH-7: 100%).

---

## Proposed Solution

**Three-Track Approach:**

### Track 1: Archive Legacy Files (HIGH Priority)
Move 178 files with sources >5 years old to `/research/legacy/`:
- Preserve historical context
- Remove from active corpus statistics
- Free up namespace for updated versions

### Track 2: Refresh Key Citations (HIGH Priority)
Update critical verification files with 2024-2025 sources:
- AI safety: Replace 1995-2018 sources with 2024-2025 RLHF/Constitutional AI research
- Economic recovery: Replace 1989-2009 sources with 2022-2024 World Bank studies
- Population: Verify all use UN WPP 2024 (already mostly done)

### Track 3: Add Missing Citations (MEDIUM Priority)
Add research citations to 3-5 simulation parameters lacking explicit sources:
- Environmental degradation rate (environmental.ts:334)
- Unemployment recovery rate (calculations.ts:529)
- Nuclear winter mortality (nuclearWinter.ts:473)

---

## Expected Impact

**Corpus Currency Improvement:**
- Current: 53.4% from 2024-2025 (Grade C)
- After Track 1: ~60-65% (Grade B) - removing old denominator
- After Track 2: ~65-70% (Grade B+) - adding new numerator
- After Track 3: ~70%+ (Grade B+/A-) - comprehensive coverage

**Research Quality:**
- More accurate parameter values (post-COVID economics, modern AI scaling)
- Better alignment with cutting-edge research
- Stronger foundation for future features

---

## Implementation Tasks

See `tasks.md` for detailed implementation steps.

---

## Research Validation

**Not required** - This is maintenance work to improve existing research quality.

Quality Gate 1 will involve validating NEW sources added in Track 2/3, but archival (Track 1) doesn't need validation.

---

## Quality Gates

**Quality Gate 1 (Research Validation):** REQUIRED for Track 2 (new citations)
**Quality Gate 2 (Architecture Review):** SKIP (no code changes, just research)

---

## Success Criteria

1. 178 legacy files archived to `/research/legacy/` with preserved metadata
2. Research currency increased from 53.4% → 65%+ (Grade C → B)
3. AI safety citations refreshed with 2024-2025 sources
4. Economic recovery parameters updated with post-COVID research
5. 3-5 simulation parameters gain explicit research citations
6. Next audit (Q1 2026) confirms Grade B or higher

---

## Related Work

- Research Source Validation Audit (Dec 10, 2025) - Identified issue
- Session 49 audit (68.8% currency) - Historical baseline
- M-4, HIGH-7 implementations (90-100% currency) - Current standard

---

## Notes

**Time Passage Context:**
The decline from 68.8% → 53.4% is NOT due to removing research, but:
1. Time passage - 2024 sources now 1 year old
2. Older citations persisting - pre-2022 papers represent 35% of corpus
3. Slower refresh rate - not enough 2025 papers added

**Solution is NOT deletion**, but:
- Add more 2024-2025 sources to new implementations (already doing well)
- Refresh outdated verification files (2001-2020 sources)
- Archive obsolete research to `/research/legacy/`

This maintains historical context while improving currency metrics.
