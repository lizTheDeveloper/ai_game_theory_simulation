# Research Verification: Scenario Analysis Framework Phase 2

**Commit:** 40a2f3441675c725e868bad8c7d9e8ba81ecc863
**Date:** November 11, 2025
**Files Changed:** src/types/scenarios.ts
**Priority:** HIGH (Scenario Analysis Framework Phase 2 from roadmap)

## Overview

This commit adds 13 new scenarios to systematically test which governance priorities, starting conditions, and technology deployment strategies enable upward spiral activation. The commit message claims specific parameter values are backed by research, but these need TWO-LAYER verification:

1. **Citation Existence:** Do the cited sources actually exist?
2. **Claim Verification:** Do the sources support the specific values claimed?

## Parameters Requiring Verification

### 1. Climate Spending (climate-first scenario)

**Location:** src/types/scenarios.ts:375
**Parameter:** `climateSpending: 0.10` (10% of GDP)
**Claim in Commit:** "Climate spending: 10× Paris commitments (precedent: wartime mobilization)"

**Verification Needed:**
- **Citation Check:** Are there peer-reviewed sources documenting Paris Agreement climate spending commitments?
- **Claim Accuracy:** Do current Paris commitments represent ~1% of GDP, making 10% truly "10×"?
- **Wartime Precedent:** Is there research backing "wartime mobilization" spending levels at 10% GDP for specific purposes?
- **Historical Examples:** WWII mobilization reached 40-50% GDP (Rockoff 2012), but what % was directed to specific crisis response vs general military?

**Expected Verification:**
- Find Paris Agreement financial commitment data (UNFCCC, OECD sources)
- Verify baseline: Developed nations committed $100B/year globally (~0.2% of combined GDP)
- Confirm 10% GDP represents unprecedented peacetime mobilization
- Quote specific passage supporting this scale

**Status:** ⚠️ UNVERIFIED - Needs peer-reviewed backing for Paris baseline and wartime mobilization analogy

---

### 2. Redistribution Rate (equality-first scenario)

**Location:** src/types/scenarios.ts:386
**Parameter:** `redistributionRate: 0.35` (35% of GDP)
**Claim in Commit:** "Redistribution: Nordic welfare states 25-35% GDP"

**Verification Needed:**
- **Citation Check:** Are there OECD or World Bank sources documenting Nordic welfare state spending?
- **Claim Accuracy:** Do Nordic countries (Norway, Sweden, Denmark, Finland) actually spend 25-35% of GDP on redistribution/social transfers?
- **Definition Clarity:** Does "redistribution" in the simulation match how OECD defines "social expenditure"?

**Expected Verification:**
- OECD Social Expenditure Database (SOCX) 2024
- Verify Nordic countries: Sweden ~26-28% GDP, Denmark ~28-30%, Norway ~25-27%, Finland ~28-30%
- Confirm 35% is upper bound of Nordic range (or if it exceeds actual levels)
- Quote OECD definition to ensure parameter alignment

**Status:** ⚠️ UNVERIFIED - Needs OECD SOCX data citation with specific values

---

### 3. AI Safety Budget (ai-alignment-first scenario)

**Location:** src/types/scenarios.ts:397
**Parameter:** `aiSafetyBudget: 100` ($100B/month)
**Claim in Commit:** "AI safety: Manhattan Project scale ($2T/year adjusted)"

**Verification Needed:**
- **Citation Check:** Is there historical research on Manhattan Project costs adjusted for inflation?
- **Claim Accuracy:** Was Manhattan Project ~$2B (1945) → ~$30B (2025 adjusted), or does "$2T/year adjusted" refer to sustained annual spending?
- **Scale Comparison:** Is $100B/month ($1.2T/year) truly "Manhattan Project scale"?
- **Precedent Validity:** Was Manhattan Project annual or total cost? (It was ~3 years)

**Expected Verification:**
- Historical source: Manhattan Project cost $2B (1945 dollars) over 3 years
- Inflation adjustment: $2B (1945) → ~$30B (2025) using CPI
- Annual rate: ~$10B/year (2025 dollars) if spread over 3 years
- **CRITICAL DISCREPANCY:** Claim says $2T/year, historical data suggests ~$10B/year equivalent
- May need alternative citation (e.g., Apollo Program: $280B adjusted, ~$28B/year over 10 years)

**Status:** 🚨 LIKELY INACCURATE - $100B/month appears to be ~40× Manhattan Project annual rate, not 1×

---

### 4. Democracy Levels (democratic-participation & authoritarian-efficiency scenarios)

**Location:**
- src/types/scenarios.ts:408 (`democracyLevel: 0.9`)
- src/types/scenarios.ts:424 (`democracyLevel: 0.3`)

**Claim in Commit:** "Democracy levels: V-Dem indices, China ~0.2-0.3"

**Verification Needed:**
- **Citation Check:** V-Dem Institute publishes Democracy Index (0-1 scale)?
- **Claim Accuracy:** Is China scored 0.2-0.3 on V-Dem Democracy Index?
- **Scale Definition:** What does 0.9 represent? (Top 5% of countries? Specific threshold?)
- **Threshold Validity:** Are these values empirically grounded or arbitrary?

**Expected Verification:**
- V-Dem Institute Democracy Index v14 (2024)
- Verify China score: 0.05-0.15 (electoral democracy index) or 0.20-0.30 (liberal democracy index)
- Verify 0.9 threshold: Norway 0.89, Sweden 0.87, Denmark 0.88 (top-tier democracies)
- Quote V-Dem codebook for scale definition

**Status:** ⚠️ UNVERIFIED - Needs V-Dem v14 citation with specific country scores

---

### 5. Trust Levels (high-trust-start scenario)

**Location:** src/types/scenarios.ts:442
**Parameter:** `trustInAI: 0.8`
**Claim in Commit:** "Trust levels: Historical US 1960s-1970s ~0.7-0.8"

**Verification Needed:**
- **Citation Check:** Are there surveys measuring institutional trust in 1960s-1970s US?
- **Claim Accuracy:** Was trust in institutions ~70-80% during this period?
- **Source Validity:** Can we apply historical institutional trust to "trust in AI" (future technology)?
- **Measurement Comparability:** Do 1960s surveys use same scale as simulation's 0-1 range?

**Expected Verification:**
- Pew Research Center historical trust data (tracking since 1958)
- General Social Survey (GSS) trust in institutions data
- Verify 1964-1973: ~60-80% trust in government, ~70% trust in institutions
- **CRITICAL QUESTION:** Is "trust in AI" analogous to "trust in government"?
- May need separate AI-specific trust research (Ipsos 2024, Pew AI surveys 2024)

**Status:** ⚠️ PARTIALLY VALID - Historical trust data exists, but "trust in AI" analogy needs justification

---

### 6. Inequality Levels (low-inequality-start scenario)

**Location:** src/types/scenarios.ts:453
**Parameter:** `economicEquality: 0.75` (implying Gini ~0.25)
**Claim in Commit:** "Inequality: Nordic Gini 0.25-0.28 vs global 0.38"

**Verification Needed:**
- **Citation Check:** World Bank or OECD Gini coefficient data for Nordic countries?
- **Claim Accuracy:** Are Nordic Gini coefficients 0.25-0.28?
- **Scale Mapping:** How does `economicEquality: 0.75` map to Gini 0.25? (Inverse? 1 - Gini?)
- **Global Baseline:** Is global Gini ~0.38?

**Expected Verification:**
- World Bank Gini data 2024: Norway 0.27, Sweden 0.28, Denmark 0.26, Finland 0.27
- OECD Income Distribution Database: Nordic average 0.25-0.28 (after taxes/transfers)
- Global Gini: ~0.38 (World Bank, weighted by population)
- **CRITICAL:** Clarify QoL `economicEquality` scale (0-1? 0-2?) and its relationship to Gini

**Status:** ⚠️ UNVERIFIED - Gini values need citation, QoL scale mapping needs clarification

---

### 7. Research Investment (scientific-acceleration scenario)

**Location:** src/types/scenarios.ts:420
**Parameter:** `researchInvestment: 50` ($50B/month, ~$600B/year)
**Claim in Commit:** "Scientific acceleration: $50B/month research (2× Apollo)"

**Verification Needed:**
- **Citation Check:** What was Apollo Program total cost (adjusted for inflation)?
- **Claim Accuracy:** Was Apollo ~$300B/year (making $600B "2×")?
- **Historical Data:** Apollo cost $280B (inflation-adjusted) over 10 years = ~$28B/year
- **CRITICAL DISCREPANCY:** $600B/year is ~21× Apollo, not 2×

**Expected Verification:**
- NASA historical budget data: Apollo Program $25.4B (1960s dollars)
- Inflation adjustment: $280B (2025 dollars) total, ~$28B/year average
- **MAJOR INACCURACY DETECTED:** Claim of "2× Apollo" is off by 10×
- May need alternative comparison (e.g., 2× all global R&D spending ~$2.4T → 2× = $4.8T)

**Status:** 🚨 LIKELY INACCURATE - $50B/month is ~21× Apollo, not 2×

---

### 8. Governance Quality Thresholds (strong-institutions-start, adaptive-deployment scenarios)

**Location:**
- src/types/scenarios.ts:465 (`governanceQuality: 0.8`)
- src/types/scenarios.ts:565 (`governanceThreshold: 0.6`)

**Claim in Commit:** (Implicit - no specific claim, but uses WGI 2024 governance indicators)

**Verification Needed:**
- **Citation Check:** World Governance Indicators (WGI) 2024 data?
- **Claim Accuracy:** What does 0.8 governance quality represent? (Top 10% of countries?)
- **Threshold Validity:** Is 0.6 a meaningful governance threshold from research?
- **Scale Definition:** WGI uses percentile ranks (0-100), how does this map to 0-1 scale?

**Expected Verification:**
- World Bank WGI 2024 (6 dimensions: voice/accountability, political stability, government effectiveness, regulatory quality, rule of law, control of corruption)
- Verify 0.8 threshold: Top ~15-20 countries (Nordic countries, Singapore, Switzerland ~90th percentile)
- Verify 0.6 threshold: ~60th percentile (adequate governance, not excellent)
- Quote WGI methodology for percentile interpretation

**Status:** ⚠️ UNVERIFIED - Needs WGI 2024 citation with threshold interpretation

---

## Summary of Verification Needs

| Parameter | Location | Claim Status | Priority |
|-----------|----------|--------------|----------|
| Climate spending (10% GDP) | scenarios.ts:375 | ⚠️ UNVERIFIED | HIGH |
| Redistribution (35% GDP) | scenarios.ts:386 | ⚠️ UNVERIFIED | HIGH |
| AI safety budget ($100B/month) | scenarios.ts:397 | 🚨 LIKELY INACCURATE (~40× not 1×) | CRITICAL |
| Democracy levels (0.3, 0.9) | scenarios.ts:408,424 | ⚠️ UNVERIFIED | HIGH |
| Trust in AI (0.8) | scenarios.ts:442 | ⚠️ PARTIALLY VALID | MEDIUM |
| Inequality (Gini 0.25-0.28) | scenarios.ts:453 | ⚠️ UNVERIFIED | HIGH |
| Research investment ($50B/month) | scenarios.ts:420 | 🚨 LIKELY INACCURATE (~21× not 2×) | CRITICAL |
| Governance quality (0.6, 0.8) | scenarios.ts:465,565 | ⚠️ UNVERIFIED | MEDIUM |

## Research Workflow

**Phase 1: Citation Existence**
1. Verify Paris Agreement commitment data exists (UNFCCC, OECD)
2. Verify OECD SOCX data for Nordic welfare spending
3. Verify Manhattan Project historical cost data
4. Verify V-Dem v14 Democracy Index data
5. Verify Pew/GSS historical trust data
6. Verify World Bank Gini coefficient data
7. Verify Apollo Program cost data
8. Verify WGI 2024 governance data

**Phase 2: Claim Verification (CRITICAL)**
1. For each citation, extract specific values
2. Compare claimed values to actual research findings
3. Identify discrepancies (e.g., AI safety $2T/year vs actual $30B Manhattan Project)
4. Quote specific passages supporting (or contradicting) claims
5. Mark as VERIFIED, PARTIAL, or FABRICATED

**Phase 3: Remediation**
1. Update scenario parameters to match research
2. Update commit messages with accurate comparisons
3. Document corrected values in devlog
4. Add research citations to code comments

## Expected Timeline

- **Research Phase:** 6-8 hours (8 parameters × 45min each)
- **Validation Phase:** 2-3 hours (research-skeptic review)
- **Remediation Phase:** 1-2 hours (update parameters if needed)
- **Documentation Phase:** 1 hour (devlog, wiki updates)

**Total:** 10-14 hours

## Next Steps

1. **Orchestrator:** Assign to super-alignment-researcher (Cynthia) for research phase
2. **Validation:** Assign to research-skeptic (Sylvia) for claim verification
3. **Implementation:** Assign to simulation-maintainer (Roy) if parameters need updating
4. **Documentation:** Assign to wiki-documentation-updater (historian) for final docs

## Notes

- **Two likely inaccuracies detected:** AI safety budget and research investment claims appear off by 10-40×
- **High verification priority:** These parameters directly affect scenario testing outcomes
- **Research quality gate:** Must pass before scenarios are used for Monte Carlo analysis
