# Climate Mortality Phase 2: Source Verification Complete

**Orchestrator:** orchestrator-1
**Date:** 2025-11-06
**Status:** ✅ VERIFIED - Ready for Implementation

---

## Critical Pre-Implementation Verification: 54,000 Species Baseline

### Issue Identified

**Roadmap requirement:** "Verify IPBES 2024 source for 54,000 species baseline before implementation"

**Citation discrepancy found:**
- Cynthia's validation (Nov 1) attributed 54,000 species to "IPBES (2024) - Global Assessment Report"
- Oct 29 biodiversity verification showed IPBES 2024 does NOT contain biodiversity statistics
- Original research doc (Oct 28) cited "Natural History Museum. (2024)" and "PREDICTS project"

### Verification Results

**Web search conducted (Nov 6, 2025):**

✅ **CORRECT SOURCE IDENTIFIED:**
- **Natural History Museum's Biodiversity Intactness Index (BII)**
- **PREDICTS project data** (Projecting Responses of Ecological Diversity In Changing Terrestrial Systems)
- **Species count:** "More than 54,000 species" (some recent sources say 58,000+)
- **Coverage:** Plants, fungi, animals, insects (not just birds/mammals)
- **Version:** BII v2.1.1 (Open Access, Limited Release) - 2024

**Web search quote:**
> "The PREDICTS project calculates the BII using data that includes more than 54,000 species, encompassing not only birds and mammals, the groups most often used in biodiversity indicators, but also plants, fungi and insects."

**Source URLs:**
- https://www.nhm.ac.uk/our-science/services/data/biodiversity-intactness-index.html
- https://www.nhm.ac.uk/our-science/research/projects/predicts.html
- https://data.nhm.ac.uk/dataset/bii-developed-by-nhm-v2-1-1-limited-release

### Resolution

**Parameter validity:** ✅ CORRECT - 54,000 species baseline is accurate
**Citation:** ❌ INCORRECT in Cynthia's validation - should be Natural History Museum BII (2024), not IPBES (2024)

**Action:** Proceed with implementation, correcting attribution in code comments and documentation

---

## Additional Concerns (From Sylvia's Review)

### 1. Storm Frequency Range (-6% to -34%)

**Sylvia's concern:** 5.7x variance without scenario specification

**Orchestrator decision:** Use **middle estimate (-20%)** with sensitivity analysis
- Conservative approach per research simulation standards
- Avoids cherry-picking extremes
- Monte Carlo will test range sensitivity

### 2. Storm Intensity Range (2-11%)

**Sylvia's concern:** 5.5x variance, Atlantic basin cherry-picking

**Orchestrator decision:** Use **lower bound (2-4%)** initially
- Atlantic basin 4% is specific, use that
- Global average likely lower, be conservative
- Add note about regional variation

### 3. Storm Category Multiplier [1, 2, 4, 8, 16]

**Sylvia's concern:** "Absurd! Cat 5 hurricanes don't kill 16x more than Cat 1"

**Orchestrator decision:** **ACKNOWLEDGE AS SIMPLIFIED SCALING** in code comments
- Not directly from research (add note)
- Simplified exponential relationship
- Mortality is complex (storm surge, rainfall, infrastructure)
- Alternative: Could use [1, 1.5, 2.5, 4, 6] as more conservative scaling

**Implementation note:**
```typescript
// NOTE: Simplified exponential scaling (base 2)
// Real hurricane mortality is complex (storm surge, flooding, infrastructure)
// This is a first-order approximation pending better research
// Sylvia's critique (Nov 1): "Cat 5 doesn't kill 16x Cat 1"
// Consider sensitivity analysis with alternative scalings: [1, 1.5, 2.5, 4, 6]
const INTENSITY_MULTIPLIERS = [1, 2, 4, 8, 16] as const;
```

---

## Implementation Green Light

### Pre-Implementation Checklist

- ✅ Source verified (Natural History Museum BII, not IPBES 2024)
- ✅ Parameter validity confirmed (54,000 species is correct)
- ✅ Citation corrections documented
- ✅ Conservative parameter strategy defined
- ✅ Sylvia's concerns addressed (acknowledge simplified scaling, use middle/lower estimates)
- ✅ Monte Carlo validation plan (N≥10, test parameter ranges)

### Corrected Citations for Implementation

**BII Framework:**
```typescript
/**
 * Biodiversity Intactness Index (BII) Framework
 *
 * Source: Natural History Museum (2024). Biodiversity Intactness Index v2.1.1
 * PREDICTS project data: 54,000+ species (plants, fungi, animals, insects)
 *
 * NOT from IPBES 2024 (citation error in initial validation)
 *
 * References:
 * - https://www.nhm.ac.uk/our-science/services/data/biodiversity-intactness-index.html
 * - PREDICTS project: https://www.nhm.ac.uk/our-science/research/projects/predicts.html
 */
```

**Storm Systems:**
```typescript
/**
 * Storm intensity-frequency modeling
 *
 * Sources:
 * - Knutson et al. (2020, 2023). Tropical cyclone projections. BAMS.
 * - NOAA GFDL (2024). Hurricane-warming relationships.
 *
 * Parameters (CONSERVATIVE approach):
 * - Frequency change: -20% (middle estimate, not -34% worst case)
 * - Intensity: 2-4% (lower bound, Atlantic basin specific)
 * - Category multipliers: [1,2,4,8,16] (simplified scaling, see note)
 *
 * NOTE: Intensity multipliers are simplified exponential scaling.
 * Sylvia's critique valid: Real mortality depends on storm surge,
 * rainfall, infrastructure - not pure exponential. Consider this a
 * first-order approximation pending better calibration data.
 */
```

---

## Final Verdict

**Status:** ✅ GREEN - Proceed with Implementation

**Conditions:**
1. Use corrected citations (Natural History Museum BII, not IPBES 2024)
2. Use conservative parameters (middle/lower estimates)
3. Document simplified scaling assumptions
4. Run Monte Carlo validation (N≥10) with sensitivity analysis
5. Architecture review (Quality Gate 2) after implementation

**Risk Level:** LOW-MEDIUM
- High-quality research backing
- Citation error corrected
- Conservative parameters reduce overfitting risk
- Sylvia's concerns acknowledged and addressed

**Expected Timeline:** 4-6h implementation + 1-2h validation

---

**Orchestrator decision:** Proceed to spawn feature-implementer with corrected specification.
