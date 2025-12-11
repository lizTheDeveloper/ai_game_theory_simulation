# Plan: Research Archive Migration

**Created:** December 10, 2025 (Session 65)
**Priority:** MEDIUM (improves research quality from C to B)
**Effort Estimate:** MEDIUM (4-6 hours)
**Related:** Research source validation audit (reviews/research_source_validation_20251210.md)

---

## Problem Statement

**Current State:**
- Research Quality: Grade C (53.4% sources from 2024-2025)
- 178 files need archival (31.6% of corpus)
- 9 CRITICAL files (pre-2015 sources, 17-55 years old)
- ~25 HIGH priority files (2015-2019 sources)
- ~144 MEDIUM priority files (2020-2022 sources)

**Impact:**
- Outdated parameters in simulation (humanitarian crisis, tech risk, governance)
- Lower confidence in research-backed claims
- Compliance risk (research standard requires 2024-2025 preferred)

**Goal:**
- Achieve Grade B research quality (65% currency)
- Archive outdated sources systematically
- Replace with 2024-2025 peer-reviewed equivalents

---

## Proposed Solution

Create structured archival system with quarterly refresh cycle.

### Archive Directory Structure

```
research/
├── legacy/
│   ├── pre-2015/        # 9 files (CRITICAL priority)
│   ├── 2015-2019/       # ~25 files (HIGH priority)
│   ├── 2020-2022/       # ~144 files (MEDIUM priority)
│   └── README.md        # Archive index with reasons
├── active/              # Current 2023-2025 sources
├── validation_queue/    # Pending verification
└── archive_log.md       # Migration history
```

---

## Implementation Steps

### Phase 1: CRITICAL Pre-2015 Archival (Priority 1)

**Files Identified (9 total):**
1. Trust restoration framework (2009 sources)
2. Food security baseline (2001 FAO data)
3. Catastrophe recovery patterns (2008 Dacy & Kunreuther)
4. Early climate tipping research (pre-IPCC AR5)
5. Legacy AI safety papers (pre-deep learning era)
6. Economic resilience (pre-2008 financial crisis)
7. Biodiversity loss (pre-IPBES reports)
8. Ocean acidification (early studies)
9. Nuclear winter modeling (1980s-1990s baseline)

**Replacement Strategy:**
- **Trust restoration:** Gillespie et al. 2023 (organizational trust), Kramer 2024 (institutional trust)
- **Food security:** FAO 2024 State of Food Security report
- **Catastrophe recovery:** COVID-19 recovery research (2020-2024)
- **Climate tipping:** IPCC AR6 (2021-2023), Armstrong McKay et al. 2022
- **AI safety:** Modern alignment research (2020-2025)

**Effort:** 2 hours (research + migration)

### Phase 2: HIGH 2015-2019 Archival (Priority 2)

**Domains Affected (~25 files):**
- AI capability forecasting (pre-GPT-3)
- Renewable energy costs (outdated learning curves)
- Climate sensitivity estimates (pre-AR6)
- Social media radicalization (pre-2020 landscape)
- Biotechnology risk (pre-CRISPR democratization)

**Replacement Strategy:**
- Focus on fast-moving domains first
- Preserve historical context (don't delete, just archive)
- Update parameters with 2023-2025 sources

**Effort:** 2-3 hours

### Phase 3: MEDIUM 2020-2022 Refresh (Priority 3)

**Quarterly Refresh Cycle:**
- Target: Move 36 files per quarter (144 / 4 quarters = 36)
- Focus: Parameters with high uncertainty or rapid change
- Method: Systematic domain scan (climate → AI → social → economic → governance)

**Effort:** 1 hour per quarter (ongoing maintenance)

---

## Archive Procedure

For each file being archived:

1. **Document reason:**
   ```markdown
   ## research/legacy/pre-2015/trust_restoration_2009.md
   - **Archived:** December 10, 2025
   - **Reason:** Pre-dates major trust crisis research (Brexit 2016, Trump 2016, COVID 2020)
   - **Replacement:** research/social_trust_recovery_20251210.md (Gillespie et al. 2023)
   - **Parameters Updated:** Trust decay rate, recovery timeline, institutional vs interpersonal
   - **Simulation Impact:** socialCohesion.ts (lines 145-167)
   ```

2. **Create replacement file:**
   - Same structure (Problem, Mechanism, Parameters, Citations)
   - Updated sources (2024-2025 preferred)
   - Side-by-side comparison with archived version

3. **Update simulation code:**
   - Change parameter values if research differs
   - Add assertion for validation
   - Link to new research file in comments

4. **Log in archive_log.md:**
   - Date, old file, new file, parameter changes, commit hash

---

## Expected Outcomes

### Research Quality Improvement

**Before (Current):**
- Grade C (53.4% currency)
- 178 files outdated
- 9 CRITICAL gaps
- Low confidence in legacy parameters

**After (Phase 1 + 2 Complete):**
- Grade B (65% currency)
- 144 files outdated (MEDIUM only)
- 0 CRITICAL gaps
- HIGH confidence in active parameters

**After (Full Migration):**
- Grade A- (75-80% currency)
- Quarterly refresh maintains >70%
- All sources <3 years old in fast-moving domains
- Research-backed precision

### Parameter Updates Expected

**High Impact:**
- Trust restoration: 24-36 months → 12-18 months (COVID recovery showed faster patterns)
- Food security resilience: 2001 baseline → 2024 climate-adapted agriculture
- AI capability forecasting: Pre-LLM → transformer era + test-time compute
- Catastrophe recovery: Pre-COVID → pandemic recovery empirics

**Medium Impact:**
- Renewable energy costs (learning curves steeper than 2015 projections)
- Climate sensitivity (AR6 vs AR5 estimates)
- Social media effects (2020+ landscape differs from 2015-2019)

---

## Interaction Map

**Affected Simulation Systems:**
1. **socialCohesion.ts:** Trust decay/recovery parameters
2. **humanitarianCrisis.ts:** Food security, catastrophe response
3. **research.ts:** AI capability growth
4. **climateSystem.ts:** Tipping points, sensitivity
5. **governance.ts:** Institutional effectiveness

**Research Directory:**
- 9 files archived → research/legacy/pre-2015/
- 25 files archived → research/legacy/2015-2019/
- 9+ new research files created (2024-2025 sources)
- Archive index created

---

## Failure Modes

1. **Breaking changes:** New research contradicts old parameters
   - Mitigation: Side-by-side comparison, gradual migration, Monte Carlo validation
2. **No equivalent research:** Some topics lack recent sources
   - Mitigation: Keep archived file active until replacement found, flag uncertainty
3. **Parameter drift:** Frequent changes reduce reproducibility
   - Mitigation: Document all changes in archive_log.md, version control
4. **Effort creep:** 178 files is large corpus
   - Mitigation: Phased approach (CRITICAL → HIGH → MEDIUM over 6 months)

---

## Research Standards Compliance

**Current Standard (CLAUDE.md):**
> Every mechanic must have 2+ peer-reviewed sources (2024-2025 preferred)

**Compliance Status:**

| Priority | Files | Status | Compliance |
|----------|-------|--------|------------|
| CRITICAL | 9 | Pre-2015 | ❌ Non-compliant |
| HIGH | ~25 | 2015-2019 | ⚠️ Marginal |
| MEDIUM | ~144 | 2020-2022 | ✅ Acceptable |
| ACTIVE | ~386 | 2023-2025 | ✅ Excellent |

**After Phase 1:**
- CRITICAL: 0 (all replaced with 2024-2025)
- HIGH: ~25 → 10 (fast-moving domains updated)
- MEDIUM: ~144 (quarterly refresh)
- Compliance: 90%+ (up from 68.4%)

---

## Implementation Timeline

**Week 1 (CRITICAL):**
- Archive 9 pre-2015 files
- Research 2024-2025 replacements
- Update parameters in simulation
- Monte Carlo validation (N=10)

**Week 2-3 (HIGH):**
- Archive 25 2015-2019 files
- Focus: AI, climate, social media (fast-moving)
- Update parameters
- Integration testing

**Week 4 (Documentation):**
- Create archive index
- Update docs/wiki/README.md
- Document parameter changes
- Archive to docs/implementation-history/

**Ongoing (Quarterly):**
- Refresh 36 MEDIUM priority files per quarter
- Monitor new research (2025 papers)
- Maintain >65% currency (Grade B)

---

## Success Criteria

1. **Research quality:** Grade C → B (53.4% → 65% currency)
2. **CRITICAL gaps:** 9 → 0 (all pre-2015 archived)
3. **Parameter validation:** All updated values have 2024-2025 citations
4. **Monte Carlo:** N≥10 with updated parameters show realistic distributions
5. **Documentation:** Archive index + migration log complete
6. **Quarterly refresh:** Process established (36 files/quarter)

---

## Next Steps

1. **Decision:** Approve phased migration approach
2. **Assign:** super-alignment-researcher (Cynthia) for Phase 1 research
3. **Assign:** simulation-maintainer (Roy) for parameter updates
4. **Coordinate:** research-skeptic (Sylvia) for validation
5. **Review:** architect for archive structure + documentation

---

**Status:** PROPOSED (awaiting approval for Phase 1 execution)
**Priority:** MEDIUM (improves research quality, not blocking production)
**Estimated Effort:** 6-8 hours total (2h CRITICAL, 3h HIGH, 1h documentation, 2h quarterly ongoing)
