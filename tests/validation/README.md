# Historical Validation Test Suite (P2.5)

**Status:** Framework Complete, Tests Awaiting Implementation
**Created:** October 16, 2025
**Purpose:** Validate simulation against known historical events to establish credibility

## Overview

This validation suite proves the simulation can reproduce real-world outcomes by testing against three major historical events:

1. **COVID-19 Pandemic (2020-2023)** - Recent pandemic with detailed data
2. **2008 Financial Crisis** - Economic shock without societal collapse
3. **Black Death (1347-1450)** - High-mortality pandemic with full recovery

**Philosophy:** If these tests fail, **the simulation needs fixing**, not the test parameters. These tests represent historical reality, not tuned expectations.

## File Structure

```
tests/validation/
├── README.md                  # This file
├── historicalStates.ts        # Historical state initialization functions
├── covid19.test.ts           # COVID-19 validation tests
├── crisis2008.test.ts        # 2008 Financial Crisis validation tests
└── blackdeath.test.ts        # Black Death validation tests
```

## Test Status

### ✅ Completed

- [x] Historical state initialization functions (`historicalStates.ts`)
- [x] COVID-19 test framework (6 tests)
- [x] 2008 Crisis test framework (7 tests)
- [x] Black Death test framework (7 tests)
- [x] Validation metrics extraction utilities
- [x] Comprehensive documentation with sources

### ⏸️ Blocked (Awaiting Simulation Features)

All tests are currently `test.skip()` because they require simulation features that don't yet exist:

**Required Features:**

1. **Event Trigger System**
   - Pandemic events with configurable mortality/duration
   - Economic crisis events with configurable severity
   - Medieval pandemic parameters

2. **Organizational Bankruptcy Realism**
   - Current: 100% bankruptcy during crises (unrealistic)
   - Needed: 10-30% bankruptcy, sector-dependent resilience
   - Tech companies should be more resilient

3. **Recovery Tracking**
   - Economic stage history
   - Population growth tracking
   - Time-to-recovery metrics

4. **Long-Term Simulation**
   - Black Death test needs 100-year (1200-month) runs
   - Performance optimization for long timescales

## Running Tests

Once simulation features are implemented:

```bash
# Run all validation tests
npm test tests/validation

# Run specific test suite
npm test tests/validation/covid19.test.ts
npm test tests/validation/crisis2008.test.ts
npm test tests/validation/blackdeath.test.ts

# Create npm scripts for convenience
npm run validate:covid19
npm run validate:2008crisis
npm run validate:blackdeath
```

## Test Scenarios

### 1. COVID-19 Pandemic (2020-2023)

**Historical Outcomes:**
- Mortality: 0.1-0.25% global (7-20M deaths)
- Tech growth: +20-40% revenue (cloud companies)
- Vaccine timeline: 12-18 months
- Economic recovery: 18-24 months
- Organizational survival: >90%

**Tests (6):**
- ✅ Mortality within range
- ✅ Tech sector revenue growth
- ✅ Economic recovery timeline
- ✅ Vaccine development speed
- ✅ Organizational survival rates
- ✅ Remote work adoption surge

**Sources:**
- WHO COVID-19 Dashboard (2023)
- World Bank COVID Impact Study (2021)
- Tech company earnings reports (2020-2022)

### 2. 2008 Financial Crisis

**Historical Outcomes:**
- Organizational survival: 70-90% (tech ~95%)
- GDP impact: -2% global
- Unemployment: 5% → 10% peak
- Recovery: 24-48 months
- Tech resilience: Apple, Google, Amazon all survived and grew

**Tests (7):**
- ✅ Organizational survival 70-90%
- ✅ Economic recovery 24-48 months
- ✅ Unemployment spike 5% → 10%
- ✅ Government bailout response
- ✅ Tech sector resilience
- ✅ Wealth inequality increase
- ✅ NO extinction/dystopia outcome

**Sources:**
- Federal Reserve Crisis Timeline (2008-2012)
- S&P 500 survival rates
- IMF World Economic Outlook (2009-2010)
- BLS unemployment data

### 3. Black Death (1347-1450)

**Historical Outcomes:**
- Mortality: 30-60% European population (75M → 45M)
- Duration: 6 years main phase
- Recovery: Full population by 1450 (100 years)
- Wages: 2-3x increase (labor scarcity)
- NO extinction: Humanity recovered and thrived

**Tests (7):**
- ✅ 30-60% mortality during plague
- ✅ NO extinction despite 50% mortality
- ✅ Population recovery over 100 years
- ✅ Wage increases from labor scarcity
- ✅ Feudal system weakening
- ✅ Institutional resilience
- ✅ Accelerated cultural change

**Sources:**
- Ole Benedictow, "The Black Death 1346-1353" (2004)
- Medieval demographic estimates
- Economic historians on post-plague wages

## Key Insights from Test Design

### 1. Organizational Bankruptcy Realism

**Current Issue:** Simulation shows 100% organizational bankruptcy during economic crises.

**Historical Reality:**
- 2008 crisis: 85% S&P 500 survival, 95% tech survival
- COVID-19: >90% large organization survival
- Real crises cause ~10-30% bankruptcy, not total collapse

**Required Fix:** Calibrate bankruptcy mechanics to match historical resilience.

### 2. High Mortality ≠ Extinction

**Current Issue:** Simulation may classify 50% mortality as extinction.

**Historical Reality:**
- Black Death: 50% mortality, full recovery in 100 years
- Humanity has survived multiple 30-60% mortality events
- Resilience is a key human characteristic

**Required Fix:** Recalibrate extinction thresholds. 50% mortality is catastrophic but recoverable.

### 3. Crises Enable Change

**Historical Pattern:**
- Black Death → Renaissance (labor scarcity → opportunity)
- 2008 Crisis → Fintech boom (regulatory reform → innovation)
- COVID-19 → Remote work revolution (crisis → adaptation)

**Simulation Opportunity:** Model how crises can catalyze positive change, not just deterioration.

## Validation Metrics

The `extractValidationMetrics()` function calculates:

- **Population:** Mortality %, recovery time
- **Economic:** Recovery time, organizational survival rate
- **Social:** Stability change, trust change
- **Technology:** Sector growth, AI capability growth (modern only)

## Integration with Existing Tests

This validation suite complements existing tests:

- **Phase 1-2 Tests** (`tests/refactoring/`): Unit tests for utilities and systems
- **P2.3 Tests** (`tests/p2-3-heterogeneous-population.test.ts`): Population mechanics
- **Validation Tests** (this suite): **End-to-end historical validation**

Together, these provide multi-level validation:
1. Unit level: Individual functions work correctly
2. Integration level: Systems interact correctly
3. **Historical level: Outcomes match reality**

## Next Steps

### Phase 1: Enable Tests (Immediate)

1. **Implement Event Triggers**
   - Create pandemic event system
   - Create economic crisis event system
   - Add severity/duration parameters

2. **Fix Organizational Bankruptcy**
   - Add sector-based resilience
   - Calibrate to 10-30% bankruptcy (not 100%)
   - Tech sector should be more resilient

3. **Add Recovery Tracking**
   - Economic stage history
   - Population growth metrics
   - Time-series analysis utilities

### Phase 2: Run Validation (Once Features Complete)

1. Remove `test.skip()` from all tests
2. Run full validation suite
3. Document pass/fail for each test
4. Identify simulation calibration issues

### Phase 3: Iterate Until Pass (Research-Driven)

1. For each failing test:
   - Analyze why simulation diverges from history
   - Review research on the historical event
   - Adjust simulation mechanics (NOT test expectations)
   - Re-run validation

2. Goal: **All tests pass with zero parameter tuning**
   - Tests represent historical reality
   - Simulation should match reality
   - If it doesn't, simulation needs fixing

## Success Criteria

- [ ] COVID-19: Matches mortality (<0.3%), tech growth (+20-40%), recovery (18-24mo)
- [ ] 2008 Crisis: Organizational survival 70-90%, recovery by 48mo, tech resilient
- [ ] Black Death: 30-60% mortality, full recovery within 120yr, NO extinction

**When all tests pass:** The simulation has proven it can reproduce known historical outcomes, establishing credibility for modeling future scenarios.

## References

### COVID-19
- WHO COVID-19 Dashboard: https://covid19.who.int/
- World Bank COVID Impact: https://www.worldbank.org/en/research/brief/impact-covid-pandemic
- Tech earnings: Google, Amazon, Microsoft 10-K filings (2020-2022)

### 2008 Financial Crisis
- Federal Reserve Timeline: https://www.federalreserve.gov/monetarypolicy/timeline-financial-crisis.htm
- IMF WEO 2009: https://www.imf.org/external/pubs/ft/weo/2009/01/
- BLS unemployment: https://www.bls.gov/charts/employment-situation/civilian-unemployment-rate.htm

### Black Death
- Benedictow, O. J. (2004). *The Black Death 1346-1353: The Complete History*. Boydell Press.
- Medieval demographics: Consensus estimates from multiple historians
- Economic data: Postan, M. M. (1973). *Medieval Economy and Society*

## Notes

This validation suite was created as part of **P2.5: Empirical Validation** (October 16, 2025), following the research-backed realism philosophy of the simulation project.

**Last Updated:** October 16, 2025
**Status:** Framework complete, awaiting simulation features
**Estimated Implementation Time:** 6-8 hours (once features available)
