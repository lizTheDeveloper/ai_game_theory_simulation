# Research Verification: Regional Refugee Population Constants

**Commit:** 43a9b22 - "refactor: senior dev review fixes - fail loudly, cap edge cases, extract constants"
**Date:** October 30, 2025
**System:** Refugee Crisis Triggers
**Files:** `src/simulation/refugeeCrises.ts:389-509`

---

## Summary

This commit introduced **regional population scoping** for refugee crisis triggers, replacing the previous approach that incorrectly used global population (8B) for all refugee types. The new approach uses research-backed regional population percentages.

**Impact:** Fixes 10x over-estimation bug (325M displaced → 32M displaced for typical crisis)

---

## Citations Requiring Verification

### 1. IPCC 2021 - Coastal/Low-Lying Population

**Location:** `src/simulation/refugeeCrises.ts:392-394`

**Code:**
```typescript
// Research: IPCC 2021 - ~10% of global population in coastal/low-lying areas at risk
const COASTAL_POPULATION_PERCENT = 0.10; // IPCC: 10% of global in high-risk coastal zones
```

**Claim:** 10% of global population lives in coastal/low-lying areas at high risk from climate disasters (sea level rise, storm surge, flooding).

**Verification Required:**
- **Layer 1 (Citation Existence):**
  - Does IPCC 2021 (AR6) exist? ✅ Yes
  - Is this claim in the report?
  - Which working group report? (WG1: Physical Science, WG2: Impacts/Adaptation, WG3: Mitigation)
  - Specific chapter and page number?

- **Layer 2 (Claim Accuracy):**
  - Does IPCC actually state "10% of global population" in coastal/low-lying zones?
  - Or is this extrapolated from different data?
  - Does "high-risk" definition match simulation usage (climate disaster displacement)?
  - Quote specific passage from report

**Expected Source:**
- IPCC AR6 WG2 (Impacts, Adaptation and Vulnerability), Chapter 4 (Water) or Chapter 6 (Cities, Settlements)
- Likely discusses coastal population exposure to sea level rise and extreme weather
- May cite underlying research (e.g., Nicholls et al., Merkens et al.)

---

### 2. UNHCR 2023 - Conflict Zone Population

**Location:** `src/simulation/refugeeCrises.ts:417-419`

**Code:**
```typescript
// Research: UNHCR 2023 - current global refugees ~110M, conflict zones ~5-10% of global population
const BASE_CONFLICT_ZONE_PERCENT = 0.05; // UNHCR 2023: 5% baseline of global population in conflict zones
```

**Claim:** 5% of global population lives in conflict zones (baseline), with current global refugees at ~110M.

**Verification Required:**
- **Layer 1 (Citation Existence):**
  - Does UNHCR 2023 report exist? ✅ Likely "Global Trends: Forced Displacement" annual report
  - Is 110M refugee figure accurate for 2023?
  - Does report provide conflict zone population estimate?

- **Layer 2 (Claim Accuracy):**
  - Does UNHCR state "5% of global population in conflict zones"?
  - Or is 5% inferred from 110M refugees ÷ 8B population ≈ 1.4% (NOT 5%)?
  - What is UNHCR's definition of "conflict zone"?
  - How does "conflict zone population" relate to "refugee count"? (Not all people in conflict zones are refugees)
  - Quote specific passage

**Potential Issue:**
- 110M refugees is ~1.4% of 8B global population
- 5% baseline seems higher than refugee count alone
- May be extrapolating to "people living in active conflict zones" (broader than refugee count)
- Need to verify if UNHCR provides this broader statistic

---

### 3. FAO 2023 - Food/Water Insecure Regions

**Location:** `src/simulation/refugeeCrises.ts:467-469`

**Code:**
```typescript
// Research: FAO 2023 - ~15-20% of global population in food/water insecure regions
const FOOD_INSECURE_POPULATION_PERCENT = 0.15; // FAO 2023: 15% of global in high-risk food insecurity zones
```

**Claim:** 15-20% of global population lives in food/water insecure regions (high-risk zones).

**Verification Required:**
- **Layer 1 (Citation Existence):**
  - Does FAO 2023 report exist? ✅ Likely "The State of Food Security and Nutrition in the World (SOFI) 2023"
  - Does it provide food insecurity prevalence data?
  - Does it include water insecurity data?

- **Layer 2 (Claim Accuracy):**
  - Does FAO state "15-20% of global population" in food/water insecure regions?
  - Or does FAO report food insecurity prevalence differently (e.g., moderate vs severe)?
  - What is the exact definition of "food insecure" used?
  - Does "high-risk zones" match simulation usage (regions where famine could trigger displacement)?
  - Quote specific passage

**Potential Issue:**
- FAO typically reports food insecurity as **prevalence** (% of population experiencing food insecurity globally)
- This is different from "% living in high-risk regions" (geographic concentration)
- May need to distinguish between global prevalence vs regional concentration
- SOFI 2023 likely reports ~30% moderate/severe food insecurity globally (NOT regionally concentrated)

---

### 4. Conservation International 2024 - Biodiversity Hotspots

**Location:** `src/simulation/refugeeCrises.ts:491-493`

**Code:**
```typescript
// Research: Conservation International 2024 - ~5% of global population in biodiversity hotspots
const BIODIVERSITY_HOTSPOT_PERCENT = 0.05; // 5% of global in high-biodiversity collapse zones
```

**Claim:** 5% of global population lives in biodiversity hotspots (high-biodiversity collapse zones).

**Verification Required:**
- **Layer 1 (Citation Existence):**
  - Does Conservation International have a 2024 publication on biodiversity hotspots?
  - Conservation International maintains the "Biodiversity Hotspots" framework (36 regions)
  - Is there a specific 2024 report/update?

- **Layer 2 (Claim Accuracy):**
  - Does Conservation International state "5% of global population" in biodiversity hotspots?
  - Biodiversity hotspots are defined by **species endemism** and **habitat loss**, not population
  - What is the population living in these 36 hotspot regions?
  - Does "biodiversity hotspots" match simulation usage (ecosystem collapse displacement risk)?
  - Quote specific source

**Potential Issue:**
- Biodiversity hotspots framework focuses on conservation priority, not population distribution
- 36 hotspots cover ~2.4% of Earth's land surface (mostly tropical/subtropical)
- Population density varies widely (Amazon vs Southeast Asian islands)
- May need to cite different source for population-in-hotspots estimate
- Likely extrapolated rather than directly stated

---

## Additional Constants Requiring Research Backing

### 5. Displacement Rates (No Citation)

**Location:** `src/simulation/refugeeCrises.ts:394, 421, 470, 494`

**Code:**
```typescript
const DISPLACEMENT_RATE_PER_INSTABILITY = 0.05; // 5% displaced per 0.1 climate instability
const DISPLACEMENT_RATE_PER_CONFLICT = 0.02;    // Each conflict displaces 2% of conflict zone population
const DISPLACEMENT_RATE_PER_SCARCITY = 0.10;     // 10% displaced per unit scarcity
const DISPLACEMENT_RATE_PER_COLLAPSE = 0.03;     // 3% displaced per unit ecosystem severity
```

**Issue:** These displacement rates have **NO research citations**. They appear to be calibration parameters.

**Verification Required:**
- Are these based on historical data (e.g., Syrian civil war displacement rates)?
- Or are they tuned to produce "realistic-feeling" refugee numbers?
- Should these have research backing?

**Recommendation:**
- Find historical displacement rate data:
  - Syrian civil war: 50% of 22M population displaced (11M) over 5 years
  - Hurricane Katrina: ~1M displaced from New Orleans region
  - Dust Bowl (1930s): 2.5M displaced from Great Plains
  - Indonesian tsunami (2004): 1.8M displaced
- Extract displacement rates from historical crises
- Document in code with citations

---

### 6. Conflict Zone Scaling Parameters (No Citation)

**Location:** `src/simulation/refugeeCrises.ts:423-427`

**Code:**
```typescript
const MAX_CONFLICT_ZONE_SCALING = 2.0; // Maximum 10% of global population in conflict zones
const CONFLICT_ZONE_SCALING_RATE = 0.1; // 10% increase per additional conflict
```

**Issue:** Scaling logic (5% base → 10% max as conflicts increase) has no research backing.

**Verification Required:**
- Is the 5% → 10% range historically grounded?
- How does conflict zone population scale with number of simultaneous conflicts?
- Should cite data on multi-conflict periods (e.g., 1990s Yugoslavia, Rwanda, Somalia simultaneously)

---

## Verification Workflow

**For each citation above:**

1. **Locate Source Document**
   - Use WebFetch to retrieve official report
   - Document exact title, date, authors, DOI/URL

2. **Find Specific Claim**
   - Search PDF for relevant keywords ("coastal population", "conflict zones", etc.)
   - Identify chapter/section/page with claim
   - Quote exact passage

3. **Validate Claim Accuracy**
   - Does the passage support the code's assertion?
   - Are definitions aligned (e.g., "food insecure" vs "high-risk zones")?
   - Are percentages directly stated or extrapolated?

4. **Document Verification**
   - Update this file with findings
   - Mark as ✅ VERIFIED or ❌ UNVERIFIED
   - If unverified, document discrepancy and suggest alternative source

5. **Code Updates**
   - If citation is incorrect, find correct source or adjust parameter
   - Update code comments with exact citation (report name, chapter, page)
   - Add to research/ folder with full verification details

---

## Priority Order

**High Priority (Direct Claims):**
1. IPCC 2021 coastal population (10%)
2. UNHCR 2023 conflict zones (5%)
3. FAO 2023 food insecurity (15%)

**Medium Priority (Likely Extrapolated):**
4. Conservation International 2024 biodiversity hotspots (5%)

**Low Priority (Calibration Parameters):**
5. Displacement rates (may be tuned, not research-backed)
6. Conflict zone scaling (may be tuned, not research-backed)

---

## Related Files

- `src/simulation/refugeeCrises.ts:389-509` - All refugee crisis triggers
- `docs/wiki/systems/population-dynamics.md:373-379` - Updated documentation
- Commit: `43a9b22` - Implementation

---

## Next Steps

1. **super-alignment-researcher** agent to locate and verify each citation
2. **research-skeptic** agent to review verification and identify issues
3. Update code with exact citations (report, chapter, page)
4. Document any parameters that are tuned vs research-backed
5. Create permanent research file in `research/` folder with full citations

---

**Status:** ⏳ VERIFICATION PENDING
**Created:** October 30, 2025
**Assigned To:** Orchestrator → Research Team (super-alignment-researcher + research-skeptic)
