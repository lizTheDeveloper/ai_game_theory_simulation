# Research Update Queue
**Last Updated:** November 6, 2025
**Last Verified By:** Autonomous Research Worker

This file tracks research items that need updates, verification, or additional sources.

## =4 CRITICAL Priority (Immediate Action Required)

### 1. Cavalcanti 2025 - Misinterpretation of Aid Effectiveness
**Issue:** Code models "donor availability tiers" but paper measures "USAID funding levels"
**Impact:** Fundamental modeling error - wrong concept being measured
**Source:** `src/simulation/config/centralConfig.ts:621-729`
**Action:**
- Rename variables to reflect funding levels (not donor availability)
- Find peer-reviewed research on donor fatigue during simultaneous crises
- Use age-appropriate mortality values (6%, 9%, 15% overall - not preschool 21%, 28%, 44%)
**Status:** CRITICAL - Blocks accurate humanitarian aid modeling
**Discovered:** 2025-11-06
**Details:** `research/mortality_stabilizers_layer2_verification_20251106.md`

### 2. Ballester 2024 - Heat Adaptation Total Max Too High
**Issue:** Code claims 80% total reduction, paper shows ~44% overall
**Impact:** Simulation is MORE optimistic than empirical data supports
**Source:** `src/simulation/config/centralConfig.ts:1166-1170`
**Action:**
- Reduce `HEAT_ADAPTATION_TOTAL_MAX` from 0.8 to 0.45
- OR find additional supporting sources for 80% value
- OR mark as "extrapolation beyond empirical maximum"
**Status:** CRITICAL - Overestimates heat mortality protection
**Discovered:** 2025-11-06
**Details:** `research/mortality_stabilizers_layer2_verification_20251106.md`

### 3. IOM 2024 - Migration Parameters Not in Source
**Issue:** 10 of 11 parameters citing IOM 2024 are not found in the World Migration Report
**Impact:** Parameters lack quantitative research backing
**Source:** `src/simulation/config/centralConfig.ts:555-619, 1176-1194`
**Parameters Missing:**
- 85% success rate
- 0.1% baseline mortality
- 3% maximum mortality
- 85% annual return rate
- Crisis penalty curves (30%, 40%)
- Distance-based mortality factors
**Action:**
- Search UNHCR Statistical Yearbooks for quantitative migration data
- Search Migration Policy Institute for displacement outcomes
- Search humanitarian reports (MSF, UNHCR) for refugee mortality statistics
- Mark as [MODELING ASSUMPTIONS] if no sources found
**Status:** CRITICAL - 10 parameters unsourced
**Discovered:** 2025-11-06
**Details:** `research/mortality_stabilizers_layer2_verification_20251106.md`

---

## =á HIGH Priority (Should Update Soon)

### 4. Ballester 2024 - Heat Adaptation Type-Specific Breakdown
**Issue:** Paper shows 44% total, but code breaks this into 20%, 30%, 50%, 40% by type
**Impact:** Type-specific effectiveness values are extrapolations, not empirical
**Source:** `src/simulation/config/centralConfig.ts:1126-1160`
**Action:**
- Find research on physiological vs behavioral vs infrastructure adaptation effectiveness
- OR mark as "estimated breakdown from total 44% (Ballester 2024)"
- Verify physiological adaptation develops over "weeks" (paper says "weeks to years")
**Status:** HIGH - General finding verified, but breakdown is extrapolated
**Discovered:** 2025-11-06
**Details:** `research/mortality_stabilizers_layer2_verification_20251106.md`

### 5. Donor Fatigue - Pakistan/Haiti 2010 Example
**Issue:** Code cites "Pakistan 2010: 50% of Haiti's aid" but no peer-reviewed source
**Impact:** Donor fatigue concept lacks academic backing
**Source:** `src/simulation/config/centralConfig.ts:621-625`
**Action:**
- Verify Pakistan 2010 / Haiti 2010 funding comparison
- Find peer-reviewed research on donor fatigue during simultaneous crises
- Search for "humanitarian funding competition" literature
**Status:** HIGH - Historical example may be accurate but needs academic source
**Discovered:** 2025-11-06
**Details:** `research/mortality_stabilizers_layer2_verification_20251106.md`

### 6. GAO 2025 - Emergency Response Mortality Effectiveness
**Issue:** GAO report is descriptive (workforce issues), not quantitative (mortality impact)
**Impact:** 20-40% mortality reduction range is estimate, not empirical
**Source:** `src/simulation/config/centralConfig.ts:631-751, 1199-1213`
**Action:**
- Search for peer-reviewed disaster response effectiveness literature
- Look for FEMA vs non-FEMA disaster mortality comparisons
- Use historical case studies (Katrina, Japan 2011) with measured outcomes
- Currently marked WEAK EVIDENCE (correct), but needs stronger sources
**Status:** HIGH - Currently transparent about weakness, but better sources exist
**Discovered:** 2025-11-06
**Details:** `research/mortality_stabilizers_layer2_verification_20251106.md`

---

## =â MEDIUM Priority (Verify When Time Permits)

### 7. Major Economy Collapse Thresholds
**Issue:** 3 of 5 parameters marked [RESEARCH NEEDED]
**Source:** `src/simulation/config/centralConfig.ts:702-736`
**Parameters:**
- Economic collapse definition (stage 2.0 threshold)
- Major economy population threshold (300M)
- Global crisis threshold (50% of major economies)
**Action:**
- Search economic collapse literature (IMF, World Bank definitions)
- Historical population crash data verification (Black Death 30-60%)
- Systemic risk / cascading failure thresholds
**Status:** MEDIUM - Historical analogy used, but needs modern research
**Discovered:** 2025-11-06

### 8. Cascade Multipliers - Humanitarian System Interdependence
**Issue:** 4 of 5 cascade parameters marked [RESEARCH NEEDED]
**Source:** `src/simulation/config/centralConfig.ts:913-947`
**Parameters:**
- Aid failure ’ emergency response degradation (50%)
- Aid failure ’ migration degradation (30%)
- Emergency failure ’ migration degradation (50%)
- Functional system threshold (30%)
**Action:**
- Search for humanitarian logistics research
- System interdependence literature (infrastructure networks)
- Cascading failure thresholds
**Status:** MEDIUM - Modeling assumptions, reasonable but unsourced
**Discovered:** 2025-11-06

---

##  Recently Verified (2025-11-06)

### Ballester et al. (2024) - Heat Adaptation General Finding
**Status:**  VERIFIED (with caveats)
- Paper confirms ~44% mortality reduction from adaptation (80% higher without)
- Elderly populations show ~50% reduction (100% higher without)
- Timeline: "weeks to years" (supports general approach, not specific rates)
**Caveats:** Total max and type-specific breakdown still need verification (see CRITICAL #2, HIGH #4)

### Cavalcanti et al. (2025) - USAID Funding Impact
**Status:**   VERIFIED BUT MISAPPLIED
- Paper measures funding levels (low: 6%, intermediate: 9%, high: 15% overall mortality reduction)
- Preschool age shows higher values (21%, 28%, 44%)
- Code incorrectly interprets this as "donor availability tiers" (see CRITICAL #1)

### GAO (2025) - FEMA Workforce Crisis
**Status:**  PARTIALLY VERIFIED
- 4% workforce availability during Nov 2024 hurricanes: CONFIRMED
- Workforce reduction 25,800 ’ 23,350 (Jan-June 2025): CONFIRMED
- Mortality effectiveness estimates: NOT IN REPORT (see HIGH #6)

### IOM (2024) - Climate Migration Context
**Status:**   QUALITATIVE ONLY
- Report exists and discusses climate migration
- Quantitative parameters NOT found in report (see CRITICAL #3)

---

## Research Standards Reminder

### Layer 1 Verification (Citation Existence)
 Check if paper exists
 Check if paper is relevant to topic

### Layer 2 Verification (Claim Verification)
 Check if specific values are in paper
 Check if methodology matches code's use
 Check for extrapolation vs direct citation
 Flag misinterpretations

### Required for All Parameters
- 2+ peer-reviewed sources (2024-2025 preferred)
- Parameter justification (why this value?)
- Mechanism description (how it works)
- Interaction map (what affects/is affected)
- Expected timeline (when does it matter)
- Failure modes (what can go wrong)

---

## Next Research Session Should Focus On

1. **Donor fatigue literature** (simultaneous humanitarian crises)
2. **Climate migration outcomes** (quantitative - UNHCR, Migration Policy Institute)
3. **Heat adaptation effectiveness by type** (physiological, behavioral, infrastructure, social)
4. **Disaster response mortality studies** (peer-reviewed alternatives to GAO estimates)
5. **Economic collapse definitions** (IMF, World Bank thresholds)

---

**Note:** This file is automatically updated by the autonomous research worker and the architect agent.
