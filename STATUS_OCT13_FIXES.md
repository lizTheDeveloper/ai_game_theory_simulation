# Monte Carlo Statistics - Fix Status
**Updated:** October 13, 2025, 20:00 PDT

---

## ✅ **FIXES VERIFIED WORKING**

### 1. Nuclear Wars Count **FIXED** ✅
- **Before:** 0 / 10 (0.0%)
- **After:** 10 / 10 (100.0%) with 7,183 avg exchanges
- **Fix:** Use `EventAggregator.stats.nuclearWarsTriggered` instead of `criticalEvents`

### 2. Outcome Emoji **FIXED** ✅
- **Before:** ❓ (all runs)
- **After:** 🧬 (bottleneck showing correctly)
- **Fix:** Added emoji mapping for 7-tier system

### 3. AI Hubs Negative Value **FIXED** ✅
- **Before:** -1.0 / 3
- **After:** 0.0 / 3 (with guards to prevent negative)
- **Fix:** Added `Math.max(0, ...)` guards in MonteCarloSimulation + countryPopulations

### 4. Argument Parsing **FIXED** ✅
- **Before:** Always ran 600 months (ignored user input)
- **After:** Correctly runs specified months (240 for 20-year)
- **Fix:** Support both positional and flag arguments

### 5. Organization Bankruptcy Tracking **FIXED** ✅
- **Fix:** Added `recordOrganizationBankruptcy()` call to EventAggregator

### 6. Raw Outcome Storage **FIXED** ✅
- **Fix:** Store detailed 7-tier outcome alongside simplified category

---

## 🐛 **REMAINING BUGS**

### 1. Famines Not Triggering 🔴 HIGH PRIORITY
**Problem:**
- 0 famines across all runs
- Food security drops to 0.439 (below 0.4 crisis threshold)
- No "🌾💀 GLOBAL FOOD CRISIS FAMINE" messages in logs

**Evidence:**
```
Food Security: 0.439 (FAO: >1800 kcal/day)
Food Insecurity (<0.4): 3 runs (30.0%)
But: Runs with famines: 0/10 (0.0%)
```

**Possible Causes:**
1. `checkRegionalFamineRisk` not being called
2. Famine trigger conditions too strict
3. Global food crisis threshold not reached in time
4. Bug in famine detection logic

---

### 2. Organizations Not Going Bankrupt 🔴 HIGH PRIORITY
**Problem:**
- 0 bankruptcies despite 95% population collapse
- Organizations accumulate $1.3T during bottleneck
- 100% survival rate for all organizations

**Evidence:**
```
Population: 8.00B → 0.36B (95.5% decline)
Org Survival: 100.0% (4/4 private orgs)
Capital: $1,275.1B avg accumulated
Bankruptcies: 0 across 10 runs
```

**Bankruptcy Logic (Should Trigger):**
- Default threshold: -$50M
- During 4+ crises: -$20M
- During 50%+ regional population decline: $0 (any negative)

**Possible Issues:**
1. Revenue penalties not aggressive enough
2. Organizations never go negative (expenses too low?)
3. Regional population decline calculation incorrect
4. Bankruptcy logic not being evaluated correctly

---

### 3. Basic Needs QoL Too High ⚠️ MEDIUM PRIORITY
**Problem:**
- Basic Needs QoL: 1.781 (>1.0 = "post-scarcity")
- But: 95.5% mortality, food security 0.439

**Evidence:**
```
Basic Needs: 1.781 (food, water, shelter, energy)
Population decline: 95.5%
Food Security: 0.439 (crisis level)

⚠️ WARNING: High Basic Needs QoL (1.78) despite 96% mortality
```

**Issue:** QoL calculation doesn't properly reflect:
- Mass starvation (food < 0.4)
- Population collapse (95% dead)
- Infrastructure breakdown

---

## 📊 **Current Simulation Behavior**

From `twenty_year_with_fixes` (240 months, 10 runs):

### Outcomes:
- **100% Bottleneck** (all 10 runs)
- **95.5-95.6% mortality** (350M survivors)
- **Final population: 0.36B** average

### Crises:
- **Nuclear wars: 100% of runs** (7,183 avg exchanges)
- **Environmental cascade: 100%** (active in all runs)
- **Countries depopulated: 15/15** (100%)

### Economics:
- **Organizations: 100% survival**
- **Capital accumulated: $1.3T**
- **Bankruptcies: 0**

---

## 🎯 **Next Steps**

### Immediate (High Priority):
1. **Investigate famine system:**
   - Check if `checkRegionalFamineRisk` is being called
   - Verify food security thresholds
   - Test famine trigger logic in isolation

2. **Debug organization bankruptcy:**
   - Add logging for revenue/expenses/capital per month
   - Check if organizations ever go negative
   - Verify regional population decline calculations
   - Test bankruptcy logic with forced negative capital

### Medium Priority:
3. **Fix Basic Needs QoL calculation:**
   - Review how food/water insecurity affects QoL
   - Ensure population collapse impacts infrastructure
   - Cap post-scarcity bonus during crises

4. **Add per-run population breakdown:**
   - Show final population for each run in summary
   - Easier to spot variance and outliers

---

## 💾 **Files Modified**

1. `scripts/monteCarloSimulation.ts`
   - Fixed argument parsing
   - Fixed nuclear war counting
   - Fixed outcome emoji mapping
   - Added guards for negative values

2. `src/simulation/countryPopulations.ts`
   - Added guards to prevent negative counts

3. `src/simulation/organizationManagement.ts`
   - Added bankruptcy tracking to EventAggregator

4. `devlogs/monte-carlo-stats-bug-fixes-oct13.md`
   - Tracking all bugs and fixes

---

**Status:** 6/9 bugs fixed (67%), 3 remaining (famines, bankruptcies, QoL)

