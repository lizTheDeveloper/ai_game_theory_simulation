# Research Verification: State Validation & Phase Dependencies

**Commit:** e17b61ea2fc4bec428d9b71b64c297dad253d541
**Date:** November 6, 2025
**Research Files:**
- `research/state_validation_and_dependencies_20251106.md`
- `reviews/state_validation_research_critique_20251106.md`

**Status:** NEEDS VERIFICATION
**Priority:** HIGH (foundational architecture, 180 mutations depend on validated ranges)

---

## TWO-LAYER VERIFICATION PROTOCOL

This verification requires **both citation existence checks AND claim verification**.

**Layer 1:** Do the papers exist? Are titles/authors/years accurate?
**Layer 2:** Do the papers ACTUALLY support the specific claims made?

For each citation below, verify:
1. ✅/❌ Paper exists (author, year, title match)
2. ✅/❌ Paper is accessible (not phantom publication)
3. ✅/❌ Claim is supported (quote specific passage)
4. If claim unsupported: Document discrepancy

---

## CRITICAL: Domain-Specific Validation Ranges

These bounds are used throughout the codebase in assertion utilities. If any are unsupported by research, the entire validation framework needs adjustment.

### 1. Mortality Rates

**Location:** `research/state_validation_and_dependencies_20251106.md:130-134`

**CLAIM:**
> **Mortality Rates:**
> - Valid range: [0, 0.5] per month (0-50%)
> - Rationale: Historical worst case ~40% over 7 years (Black Death)
> - Nuclear winter (Xia et al. 2022): 75% over decades (~2-3% monthly)
> - Single-month >50%: Physically implausible, indicates calculation bug

**SPECIFIC VERIFICATION NEEDED:**

#### 1.1 Black Death Mortality Rate
**Claimed Value:** ~40% over 7 years
**Implied Monthly Rate:** ~40% / 84 months = ~0.48% per month (NOT 50% per month as upper bound suggests)

**Questions:**
- Does historical Black Death research support "~40% over 7 years"?
- Is the conversion to monthly rate mathematically correct?
- Why is the upper bound 50% per month if Black Death was ~0.5% per month?

**VERIFICATION TODO:**
- [ ] Find peer-reviewed source on Black Death mortality rates
- [ ] Quote specific passage with mortality percentage and timeframe
- [ ] Explain logic for 50% monthly upper bound (seems too high?)

#### 1.2 Nuclear Winter Mortality (Xia et al. 2022)
**Claimed Value:** 75% over decades (~2-3% monthly)

**Citation:** Xia et al. 2022 (presumably "Global food insecurity and famine from reduced crop, marine fishery and livestock production due to climate disruption from nuclear war soot injection")

**VERIFICATION TODO:**
- [ ] Confirm paper title, authors, journal, year
- [ ] Locate mortality rate claim (75% over decades)
- [ ] Quote specific passage
- [ ] Verify 75% / (decades * 12 months/year) = 2-3% monthly arithmetic
- [ ] Check if paper discusses monthly mortality or only cumulative

**CRITICAL:** This value is used in `assertMortalityRate()` utility. If unsupported, 180 assertions may use wrong bounds.

---

### 2. Temperature Deltas

**Location:** `research/state_validation_and_dependencies_20251106.md:142-146`

**CLAIM:**
> **Temperature Deltas:**
> - Valid range: [-20, +10] °C per month
> - Max warming: ~5°C over decades (PETM historical record)
> - Max cooling: ~15°C (nuclear winter, Xia 2022)
> - Values outside [-20, +10]: Calculation errors

**SPECIFIC VERIFICATION NEEDED:**

#### 2.1 PETM Warming Rate
**Claimed Value:** ~5°C over decades

**Reference:** PETM (Paleocene-Eocene Thermal Maximum) historical record

**Questions:**
- Does PETM research support "~5°C over decades"?
- What is the conversion to per-month rate? (~5°C / (decades * 12) = very small monthly delta)
- Why is the upper bound +10°C per month if PETM was much slower?

**VERIFICATION TODO:**
- [ ] Find peer-reviewed PETM research
- [ ] Quote warming rate and timeframe
- [ ] Explain logic for +10°C per month upper bound

#### 2.2 Nuclear Winter Cooling (Xia 2022)
**Claimed Value:** ~15°C (nuclear winter)

**VERIFICATION TODO:**
- [ ] Locate cooling rate claim in Xia 2022 paper
- [ ] Quote specific passage
- [ ] Check if paper discusses monthly cooling or only peak cooling magnitude
- [ ] Verify -20°C per month bound is appropriate (seems very high?)

**CRITICAL:** This value is used in `assertTemperatureDelta()` utility. If unsupported, climate validation may be wrong.

---

### 3. CO2 Levels

**Location:** `research/state_validation_and_dependencies_20251106.md:148-152`

**CLAIM:**
> **CO2 Levels:**
> - Valid range: [280, 600] ppm
> - Pre-industrial: 280 ppm
> - Current (2025): ~420 ppm
> - Extreme scenarios: <600 ppm (RCP8.5 equivalent)

**SPECIFIC VERIFICATION NEEDED:**

#### 3.1 RCP8.5 Maximum CO2
**Claimed Value:** <600 ppm

**Question:** Does RCP8.5 scenario actually cap at 600 ppm by end of century?

**VERIFICATION TODO:**
- [ ] Find IPCC AR6 or similar source on RCP8.5 CO2 trajectories
- [ ] Quote specific CO2 concentration for 2100
- [ ] Verify 600 ppm is appropriate upper bound (RCP8.5 goes much higher?)

**NOTE:** Current (2025) ~420 ppm is verifiable. Pre-industrial 280 ppm is well-established. The 600 ppm upper bound is questionable.

**CRITICAL:** Used in `assertPlanetaryBoundary()` for CO2. If RCP8.5 goes to 900+ ppm, bound is too restrictive.

---

### 4. Ocean pH

**Location:** `research/state_validation_and_dependencies_20251106.md:154-158`

**CLAIM:**
> **Ocean pH:**
> - Valid range: [7.5, 8.5]
> - Pre-industrial: ~8.2
> - Current: ~8.1
> - Acidification limit: ~7.8 (ecosystem collapse threshold)

**SPECIFIC VERIFICATION NEEDED:**

#### 4.1 Ecosystem Collapse Threshold
**Claimed Value:** ~7.8 pH

**Question:** Does ocean acidification research support 7.8 as "ecosystem collapse threshold"?

**VERIFICATION TODO:**
- [ ] Find peer-reviewed ocean acidification research (2024-2025 preferred)
- [ ] Quote ecosystem collapse threshold pH value
- [ ] Verify 7.5 lower bound is appropriate

**NOTE:** Pre-industrial 8.2 and current 8.1 are well-established. The 7.8 threshold is the critical claim.

**CRITICAL:** Used in `assertPlanetaryBoundary()` for ocean pH. If threshold is wrong, validation may be too permissive/restrictive.

---

### 5. GDP Bounds

**Location:** `research/state_validation_and_dependencies_20251106.md:167-170`

**CLAIM:**
> **GDP:**
> - Valid range: [0, 200] trillion USD
> - Current global: ~$100 trillion
> - 2× current: Plausible upper bound

**SPECIFIC VERIFICATION NEEDED:**

#### 5.1 Current Global GDP
**Claimed Value:** ~$100 trillion

**VERIFICATION TODO:**
- [ ] Find World Bank or IMF data on 2024-2025 global GDP
- [ ] Verify $100 trillion is accurate (may be higher in 2025?)

#### 5.2 Upper Bound Justification
**Claimed Value:** 2× current = plausible upper bound

**Question:** Is 2× current GDP a research-backed upper bound for simulation timeframe?

**VERIFICATION TODO:**
- [ ] Find economic growth projections (2025-2100)
- [ ] Quote maximum GDP scenarios
- [ ] Verify 200 trillion is appropriate (may be too low for 75-year simulation?)

**CRITICAL:** Used in `assertEconomicMetric()`. If bound is too low, late-game scenarios may trigger false positives.

---

### 6. Economic Growth Rates

**Location:** `research/state_validation_and_dependencies_20251106.md:172-175`

**CLAIM:**
> **Growth Rates:**
> - Valid range: [-0.5, +0.5] monthly change (±50%)
> - Typical: ±0.2% monthly (~2-3% annual)
> - Great Depression: ~-30% over 4 years (~-0.7% monthly)

**SPECIFIC VERIFICATION NEEDED:**

#### 6.1 Great Depression Contraction
**Claimed Value:** ~-30% over 4 years (~-0.7% monthly)

**Arithmetic Check:** -30% / 48 months = -0.625% per month (matches ~-0.7% claim)

**VERIFICATION TODO:**
- [ ] Find economic history research on Great Depression GDP contraction
- [ ] Quote specific contraction percentage and timeframe
- [ ] Verify -50% monthly bound is appropriate (seems very high compared to Great Depression?)

**CRITICAL:** Used in `assertEconomicMetric()` for growth rates. If bound is too permissive, bugs may slip through.

---

## PRIMARY SOURCES REQUIRING VERIFICATION

### High Priority (Used for Domain Bounds)

1. **Xia et al. 2022** - Nuclear winter mortality and temperature
   - **Likely Title:** "Global food insecurity and famine from reduced crop, marine fishery and livestock production due to climate disruption from nuclear war soot injection"
   - **Journal:** Nature Food (2022)
   - **Claims:** 75% mortality over decades, ~15°C cooling
   - **Verification:** CRITICAL - used for mortality AND temperature bounds

2. **PETM (Paleocene-Eocene Thermal Maximum) research**
   - **Claims:** ~5°C warming over decades
   - **Verification:** HIGH - used for temperature upper bound

3. **Black Death historical research**
   - **Claims:** ~40% mortality over 7 years
   - **Verification:** MEDIUM - used for mortality rationale

4. **RCP8.5 CO2 projections (IPCC AR6 or similar)**
   - **Claims:** <600 ppm maximum
   - **Verification:** HIGH - used for CO2 upper bound (may be too low?)

5. **Ocean acidification ecosystem collapse threshold**
   - **Claims:** ~7.8 pH threshold
   - **Verification:** HIGH - used for ocean pH lower bound

### Medium Priority (General Framework)

6. **NAFEMS 2024** - "Verification, Validation and Uncertainty Quantification in Scientific Computing"
   - **Claims:** V&V framework components (listed in research doc)
   - **Verification:** MEDIUM - general best practices, not specific parameters

7. **Taylor & Francis (2025)** - "Model input verification of large scale simulations"
   - **Claims:** MIV methodology (pre-execution, runtime, fail-fast)
   - **Verification:** MEDIUM - general methodology

8. **arXiv 2507.23186 (2024)** - "NaN-Propagation: A Novel Method for Sparsity Detection"
   - **Claims:** NaN propagation characteristics, IEEE 754 behavior
   - **Verification:** LOW - IEEE 754 is well-established standard

9. **Journal of Climate (2024)** - "Modes of Variability in E3SM and CESM Large Ensembles"
   - **Claims:** Ensemble-based validation, reproducibility framework
   - **Verification:** MEDIUM - climate model best practices

### Low Priority (Implementation Patterns)

10. **Unity Documentation** - "System Update Order" (Entities Package)
    - **Claims:** ECS execution order patterns
    - **Verification:** LOW - implementation reference, not research

11. **Game Development Stack Exchange / Medium**
    - **Claims:** Topological sort, dependency graph patterns
    - **Verification:** LOW - algorithmic patterns, well-established

---

## EXPECTED OUTCOMES

### Best Case: All Claims Verified ✅
- Domain bounds are research-backed
- Proceed to Phase 2 (Implementation) with confidence
- 180 assertions use validated ranges

### Partial Verification ⚠️
- Some bounds need adjustment
- Update `research/state_validation_and_dependencies_20251106.md` with corrections
- Update assertion utilities with revised bounds
- Re-run Quality Gate 1 with corrections

### Claims Unsupported ❌
- Major revision needed
- Find alternative sources for bounds
- May need to widen/narrow validation ranges significantly
- Delay Phase 2 implementation until resolved

---

## ORCHESTRATOR HANDOFF

**When verification complete:**
1. If all verified → Proceed to Phase 2 (Implementation)
2. If partial → Revise research document, update bounds, re-validate
3. If unsupported → Major research revision needed

**Deliverable:** Updated research document with:
- ✅ Verified claims (with quoted passages)
- ⚠️ Partially verified claims (with adjustments)
- ❌ Unsupported claims (with alternative sources or removal)

---

## NOTES

- **Why this matters:** 180 unvalidated mutations will be fixed using these bounds. Wrong bounds = false positives/negatives in validation.
- **Timeline impact:** If major revisions needed, WEEK 3 timeline may need adjustment.
- **Research quality standard:** This project requires peer-reviewed sources (2024-2025 preferred). Engineering estimates are acceptable for MVP but must be flagged.
