# Research Verification: Species Baseline Citation Correction
## Commit 34a9c2c - November 6, 2025

**Type:** Citation Correction & Verification
**Priority:** HIGH
**Status:** ⚠️ PENDING VERIFICATION

---

## Context

During preparation of Climate Mortality Phase 2 implementation, a critical citation error was discovered and corrected:

**Original (incorrect):**
- Source: IPBES (2024)
- Species count: 54,000 species

**Corrected:**
- Source: Natural History Museum PREDICTS database (2024)
- Species count: 54,000-58,000 species

**Files affected:**
- `src/types/game.ts:539,541` - JSDoc comment
- `plans/climate-mortality-phase2-READY-FOR-IMPLEMENTATION.md` - Implementation spec
- `docs/wiki/README.md` - Documentation

---

## Verification Required

### Layer 1: Citation Existence

**Claim:** Natural History Museum PREDICTS (2024) database contains 54,000-58,000 species baseline for BII calculations.

**Verification tasks:**
1. ✅ **Database exists:** Confirm PREDICTS database is real and maintained by Natural History Museum
2. ⚠️ **Species count accuracy:** Verify 54,000-58,000 species range
3. ⚠️ **Year accuracy:** Confirm 2024 is correct publication/update year
4. ⚠️ **Accessibility:** Verify database is publicly accessible or cite proper access method

**Expected sources:**
- Natural History Museum website: https://www.nhm.ac.uk/our-science/data/biodiversity-indicators/
- PREDICTS project publications
- Peer-reviewed papers citing PREDICTS as source

### Layer 2: Claim Verification

**Specific claims to verify:**

#### Claim 1: Species Baseline (54,000-58,000)
**Location:** `src/types/game.ts:541`
**Code:**
```typescript
biosphereIntegrityIndex?: import('../types/planetaryBoundaries').BiosphereIntegrityIndex; // 54,000-58,000 species, E/MSY extinction rates, climate tracking failure
```

**Verification needed:**
- Does PREDICTS database actually contain 54,000-58,000 species?
- Is this the correct baseline for BII calculations?
- What taxonomic groups are included? (claim: plants, fungi, birds, mammals, insects)
- Is this a global baseline or regional?

#### Claim 2: Gold Standard for BII
**Location:** `plans/climate-mortality-phase2-READY-FOR-IMPLEMENTATION.md:32`
**Claim:** "PREDICTS project is the gold standard for BII"

**Verification needed:**
- Is PREDICTS widely recognized as authoritative for BII?
- Are there competing databases/methodologies?
- What is PREDICTS' actual role in BII calculation methodology?

#### Claim 3: Methodology (48,000+ sites, 5M+ records)
**Location:** `plans/climate-mortality-phase2-READY-FOR-IMPLEMENTATION.md:33`
**Claim:** "Global ecological studies across 48,000+ sites, 5 million+ records"

**Verification needed:**
- Are site and record counts accurate?
- What is the geographic distribution?
- What time period does this cover?
- How frequently is the database updated?

#### Claim 4: Taxonomic Coverage
**Location:** `plans/climate-mortality-phase2-READY-FOR-IMPLEMENTATION.md:34`
**Claim:** "Plants, fungi, birds, mammals, insects (not just birds/mammals)"

**Verification needed:**
- Full taxonomic breakdown of species in database
- Are plants and fungi actually included?
- What proportion is each taxonomic group?

---

## Why This Verification Matters

**Research integrity:** This simulation is grounded in peer-reviewed research. Incorrect citations undermine credibility.

**Parameter accuracy:** The 54,000-58,000 species baseline is used in:
- `src/simulation/planetaryBoundaries.ts` - BII calculations
- Extinction rate calculations (E/MSY)
- Climate velocity modeling
- Keystone species cascade effects

**Traceability:** Implementation spec references this source extensively. If incorrect, entire BII framework needs re-validation.

---

## Verification Workflow

### Phase 1: Source Verification (Cynthia - super-alignment-researcher)
**Tasks:**
1. Locate primary PREDICTS database documentation
2. Verify species count (54,000-58,000)
3. Verify methodology (site count, record count)
4. Verify taxonomic coverage
5. Confirm 2024 is correct reference year
6. Extract exact citation format for academic use

**Deliverable:** Research note with:
- Direct links to PREDICTS database
- Screenshot/excerpt showing species count
- Proper academic citation format
- Confidence level (HIGH/MEDIUM/LOW)

### Phase 2: Critical Review (Sylvia - research-skeptic)
**Tasks:**
1. Verify Cynthia's sources are legitimate
2. Check for contradictory sources (other BII databases?)
3. Assess if PREDICTS is truly "gold standard" or if claim is overstated
4. Identify any methodological limitations
5. Flag any uncertainty in species count range

**Deliverable:** Critical review with:
- Validation status (VERIFIED / UNVERIFIED / PARTIALLY VERIFIED)
- Confidence level
- Any corrections needed
- Recommended citation format

### Phase 3: Code Update (if needed)
**If verification reveals errors:**
1. Update `src/types/game.ts` JSDoc comments
2. Update `plans/climate-mortality-phase2-READY-FOR-IMPLEMENTATION.md`
3. Update `docs/wiki/README.md`
4. Run type check: `npx tsc --noEmit`
5. Commit with proper attribution

---

## Current Status

**Layer 1 (Citation Existence):** ⚠️ PENDING
**Layer 2 (Claim Verification):** ⚠️ PENDING

**Next action:** Assign to orchestrator for research workflow (Cynthia → Sylvia → documentation update if needed)

---

## References

**Current implementation spec:**
- `/plans/climate-mortality-phase2-READY-FOR-IMPLEMENTATION.md` (lines 27-34)

**Code locations:**
- `src/types/game.ts:539-541` - GameState interface JSDoc
- `docs/wiki/README.md:432,442,453` - Documentation references

**Related research:**
- `/research/climate-mortality-biosphere-multiparadigm-framework_20251028.md` - Original research file (may also contain IPBES error)

---

## Orchestrator Handoff

**Status:** READY FOR VALIDATION PHASE
**Reason:** Research file already exists (this file), skip straight to validation

**Workflow:**
1. ✅ Research file created (this document)
2. ⚠️ NEXT: Validation phase (Cynthia + Sylvia)
3. PENDING: Implementation update (if corrections needed)
4. PENDING: Documentation (wiki-documentation-updater)

**Channel:** `implementation`
**Alert:** RESEARCH VERIFICATION NEEDED
