# Enhanced Radiation Modeling (M-6)

**Created:** December 7, 2025
**Priority:** MEDIUM
**Effort:** 6-8 hours
**Roadmap:** M-6 from simulation spec

---

## Rationale

Current radiation system uses simple dose-response (single mortality curve). Nuclear winter scenarios need:
1. **Tissue-specific sensitivity** - Different organs have different radiation vulnerability (ICRP weighting factors)
2. **Acute vs chronic distinction** - High dose over hours (LD50) vs low dose over years (cancer risk)
3. **Time-dependent effects** - Dose-rate matters (1 Gy over 1 hour ≠ 1 Gy over 1 year)
4. **Realistic health outcomes** - Match Hiroshima/Nagasaki/Chernobyl/Fukushima epidemiology

**Current gaps:**
- No tissue weighting (all organs treated equally)
- Simple mortality curve (no acute threshold effects)
- No dose-rate dependency
- Test coverage: 59.60% (needs improvement)

---

## Scope

### Phase 1: Research (Quality Gate 1)
Extract from peer-reviewed sources (2024-2025 preferred):
1. ICRP tissue weighting factors (w_T)
2. Acute exposure thresholds (LD50/60, time dependency)
3. Chronic exposure limits (annual dose, cumulative effects)
4. Medical evidence (Hiroshima LSS cohort, Chernobyl liquidators, Fukushima surveillance)

### Phase 2: Implementation
1. Update `src/types/radiation.ts`:
   - Add tissue sensitivity interface
   - Add acute vs chronic exposure types
   - Add dose-rate calculations
2. Modify exposure calculations:
   - Apply ICRP tissue weighting
   - Implement LD50 thresholds for acute exposure
   - Model chronic accumulation separately
3. Integrate with nuclear winter phase:
   - Distinguish immediate casualties (acute) from long-term (chronic)
   - Model radiation-induced cancer with tissue-specific risks

### Phase 3: Validation
1. Unit tests for tissue weighting logic
2. Acute exposure scenarios (LD50 threshold validation)
3. Chronic accumulation over time
4. Monte Carlo validation (N≥10 runs, determinism check)

---

## Success Criteria

1. Research validated by research-skeptic (Quality Gate 1: Grade B or higher)
2. ICRP tissue weighting factors implemented with citations
3. Acute LD50 thresholds match medical literature
4. Chronic exposure accumulation realistic (vs Chernobyl/Fukushima data)
5. Test coverage >90% for radiation.ts
6. Monte Carlo runs deterministic (CV < 0.01%)
7. Architecture review passed (Quality Gate 2: no CRITICAL/HIGH issues)

---

## Research Questions

1. What are the latest ICRP tissue weighting factors (ICRP 103, 116, or newer)?
2. What is the consensus LD50/60 for acute whole-body radiation exposure?
3. How does dose-rate affect mortality (high vs low dose-rate)?
4. What annual dose limits are recommended for chronic exposure?
5. What are tissue-specific cancer risks per unit dose?

---

## Related Work

- `openspec/changes/radiation-test-coverage/` - Test-only proposal (LOW priority)
- Nuclear winter phase integration
- Radiation system phase (existing)
