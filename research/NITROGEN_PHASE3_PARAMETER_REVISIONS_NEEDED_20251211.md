# Nitrogen Phase 3 Parameter Revisions Needed

**Date:** December 11, 2025
**Autonomous Researcher Session**
**Context:** Sylvia's skeptical review from Dec 9, 2025
**Review File:** `reviews/nitrogen_phase3_skeptic_review_20251209.md`
**Verification Queue:** `openspec/specs/research/verification-queue.md` (lines 156-193)

---

## Status

**VERIFIED Grade B-** (downgraded from B+) with required parameter revisions before Monte Carlo validation.

All technologies have been research-validated but Sylvia found systematic optimism bias:
1. Commercial product failure rates not modeled (80%+ for mycorrhizal inoculants)
2. Rebound effects / Jevons paradox not addressed
3. Consumer acceptance barriers underestimated
4. Timelines overly optimistic

---

## Required Parameter Revisions

### For simulation-maintainer (Roy):

**File:** `src/simulation/techTree/comprehensiveTechTree.ts`

1. **Rhizosphere Engineering (line ~617):**
   - Current: `nitrogenReduction: 0.275` (27.5%)
   - Should be: `nitrogenReduction: 0.175` (17.5% - middle of revised 10-25% range)
   - Reason: 80%+ commercial inoculant failure rate (Koziol et al. 2025, New Phytologist)

2. **Nitroplast Integration (lines ~645-652):**
   - Current: `minMonth: 180` (15 years)
   - Should be: `minMonth: 360` (30 years minimum)
   - Current: `researchMonthsRequired: 120` (10 years)
   - Should be: `researchMonthsRequired: 240` (20 years)
   - Add description note: "50+ years more realistic due to oxygen sensitivity barrier"
   - Reason: Oxygen incompatibility with nitrogenase (Plant and Soil 2024)

3. **Precision Fermentation (line ~687):**
   - Current: `nitrogenReduction: 0.40` (40%)
   - Should be: `nitrogenReduction: 0.225` (22.5% - middle of revised 15-30% range)
   - Add consumer acceptance dependency (see below)
   - Reason: 68% find unnatural, 49% health concerns (Food Navigator 2025)

4. **Regional Nitrogen Policies (line ~896):**
   - Current: `nitrogenReduction: 0.20` (20%)
   - Should be: `nitrogenReduction: 0.125` (12.5% - middle of revised 10-15% net range)
   - Reason: Rebound effects not modeled (ScienceDirect 2019, INRAE 2021)

5. **Soil Health Restoration (if exists):**
   - Should be: 15-30% (not 20-40%)
   - Reason: Context-dependent, mixed evidence (NCBI 2024, National Academies 2024)

6. **Integrated Nutrient Management (if exists):**
   - Should be: 15-35% (not 25-45%)
   - Reason: High variance, context-dependence (CTCN, Frontiers in Agronomy 2024)

---

## Additional Modeling Needed

1. **Add Rebound Effect Mechanism:**
   ```typescript
   reboundCoefficient: 0.20,  // 20% efficiency gains offset by increased use
   reboundUncertaintyRange: [0.05, 0.40],
   ```

2. **Add Deployment Failure Rates:**
   ```typescript
   deploymentFailureRate: 0.20,  // 20% of deployments fail to achieve target effectiveness
   ```

3. **Add Consumer Acceptance Dependency (Precision Fermentation):**
   ```typescript
   consumerAcceptanceCurve: {
     initialAcceptance: 0.36,  // 36% supportive (2025 UK survey)
     growthRate: 0.02,  // 2% per year adoption growth
     plateau: 0.60  // 60% max adoption (resistance from over-55 demographic)
   }
   ```

---

## Research Sources

**Contradictory evidence found by Sylvia:**

- **Mycorrhizal Failure:** Koziol et al. (2025), New Phytologist - 80%+ commercial products fail
- **Rebound Effects:** ScienceDirect (2019), INRAE (2021) - Jevons paradox in agriculture
- **Nitroplast Barriers:** Plant and Soil (2024) - 50 years of N-fixation failures
- **Consumer Resistance:** Food Navigator (2025), Bezos Centre (2025) - 68% find unnatural
- **No-Till Mixed:** NCBI (2024), National Academies (2024) - context-dependent

Full citations in `reviews/nitrogen_phase3_skeptic_review_20251209.md`

---

## Next Steps

1. **simulation-maintainer** applies parameter revisions above
2. Run Monte Carlo validation (N≥10) with revised parameters
3. Verify determinism (same seed = same results)
4. Update verification queue status to "Recently Resolved"
5. Archive to `docs/implementation-history/`

---

**Action Required:** Route to simulation-maintainer agent (Roy) for implementation
**Priority:** MEDIUM (verified research, but not blocking other work)
**Effort:** Small (6 parameter value changes + 3 new properties)
