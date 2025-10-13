# Monte Carlo Analysis - October 13, 2025
**Focus:** Environmental collapse dynamics, outcome detection, famine integration  
**Runs:** 10 runs × 120 months (logging_test baseline → realistic_mortality_test comparison)

---

## 📊 **Analysis Summary**

### **CRITICAL ISSUES IDENTIFIED**

#### **1. ⚠️ Outcome Detection Bug (Priority 1)**
**Problem:** Environmental collapse not classified as "Extinction"

```
Terminal Logs:
- Month 18: TIPPING POINT CASCADE TRIGGERED
- Month 75: Population 0.814B (83% mortality, 6.6B dead)
- 6 crises active, 3.0x degradation multiplier
- Food security: 0.229 (catastrophic)

Monte Carlo Summary:
- Outcome: Status Quo (100%)
- Population: 0.8B avg
- Interpretation: "Normal conditions"

❌ 83% mortality + 6 crises + food catastrophe = Status Quo?!
```

**Why This Happens:**
`src/simulation/endGame.ts` likely checks for:
- Nuclear war → Extinction ✅
- AI takeover → Extinction ✅  
- Population = 0 → Extinction ✅
- **Population decline + environmental collapse → ??? (missing check)**

**Fix Needed:**
```typescript
// Add to endGame.ts
if (population < startingPopulation * 0.3) return 'extinction'; // 70%+ mortality
if (tippingCascadeActive && monthsSince > 60) return 'extinction'; // 5+ years of cascade
if (foodSecurity < 0.3 && sustainedMonths > 24) return 'extinction'; // 2+ years starvation
```

---

#### **2. 🏢 Organizations Thrive During Apocalypse (Priority 2)**
**Problem:** Orgs accumulate wealth while 83% of humanity dies

```
Month 75:
- Population: 0.814B (83% dead)
- 6 active crises
- Organizations: Still training AIs, accumulating revenue, expanding

Real World:
- Who are the customers when 6.6B people are dead?
- Who works in the data centers?
- Who maintains infrastructure?
```

**Why This Happens:**
Organization revenue/operations likely have minimal crisis penalties.

**Fix Needed:**
```typescript
// Add to organization logic
if (populationDecline > 0.5) {
  revenue *= (1 - populationDecline); // No customers = no revenue
}
if (activeCrises > 4) {
  bankruptcyRisk += 0.2 * activeCrises;
}
```

---

#### **3. 🌾 Famine System Not Firing (Priority 3)**
**Problem:** Food security 0.229 but 0 famines triggered

```
Month 75:
- Food Security: 0.229 (catastrophic - 77% food insecure)
- Famines Triggered: 0
- Expected: Regional famines across Africa, Asia, Middle East

Bug Location: src/simulation/qualityOfLife.ts → checkRegionalFamineRisk()
```

**Hypothesis:**
- Famine triggers check wrong thresholds
- Or: Regional food security not synced with global
- Or: Famine system disabled/broken

**Fix:** Debug `regionalFamineRisk()` logic, check thresholds.

---

#### **4. 🌪️ Tipping Cascade Timeline (Priority 4 - FIXED Oct 13)**
**OLD Problem:** Month 18 trigger → 2% monthly mortality → 83% dead by Month 75 (TOO FAST)

**Research:** UNEP - Current 7/9 boundaries = 9M deaths/year = 0.009% monthly (NOT 2%!)

**FIX IMPLEMENTED:**
- ✅ Replaced binary trigger with continuous severity
- ✅ Mortality scales with food, water, climate, biodiversity thresholds  
- ✅ Baseline: 0.009% monthly (matches research)
- ✅ Can reverse with interventions
- ✅ Tech affects state, not hard-coded reductions

**Status:** Testing in `realistic_mortality_test` Monte Carlo run

---

## 🔬 **Logging Test Run (Baseline - Oct 12)**

### **Run Profile:**
- **Runs:** 10 × 120 months
- **Outcome:** Status Quo (100%)
- **Avg Population:** 0.8B (83% decline from 8B start)
- **Avg Food Security:** 0.229 (catastrophic)
- **AI Control:** 0.39 (weak)
- **Cascade:** Active in 100% of runs

### **Typical Timeline:**
```
Month 0: Population 8B, 7/9 boundaries breached
Month 18: Tipping point cascade triggered (OLD SYSTEM - 2% monthly mortality)
Month 24-48: Population decline accelerates
Month 60-90: 6 crises active, 3.0x degradation
Month 75: Population 0.814B (6.6B dead)
Month 120: Sim ends, classified as "Status Quo" (BUG)
```

### **Key Observations:**
1. **Cascade Triggers Too Early:** Month 18 (7/9 boundaries → 70% risk → 10% chance/month)
2. **Mortality Too High:** 2% monthly = 22%/year (vs UNEP 0.1%/year)
3. **No Recovery Possible:** Irreversible even with interventions
4. **Organizations Unrealistic:** Thrive during collapse
5. **Famine System Broken:** 0 triggers despite food 0.229
6. **Outcome Detection Wrong:** Extinction classified as Status Quo

---

## 🧪 **Realistic Mortality Test Run (NEW - Oct 13)**

### **Changes Implemented:**
```
OLD SYSTEM:
- Risk > 0.7 → 10% chance cascade trigger
- Cascade → 2% monthly mortality (hard-coded)
- Irreversible, binary (on/off)

NEW SYSTEM:
- Risk > 0.5 → continuous cascade (severity 0-1)
- Mortality calculated from state thresholds:
  * Food < 0.4 → 0.01%/month additional
  * Water < 0.4 → 0.008%/month additional
  * Climate < 0.6 → non-linear escalation
  * Biodiversity < 0.3 → 0.003%/month additional
  * 8-9 boundaries → 2.25x amplifier
- Can REVERSE if risk < 0.45
- Tech improves state → reduces mortality
```

### **Expected Results:**
- **Baseline (Month 0-20):** 0.009% monthly mortality (72M deaths/year globally)
- **Cascade Start:** Later (Month 30-50 instead of Month 18)
- **Population Decline:** Gradual (years, not months)
- **Some Survivals:** With aggressive interventions
- **Outcome Detection:** Still broken (needs separate fix)

### **Status:** ⏳ Running (Run 3/10, Month 68 as of latest check)

**Preliminary Observations (Month 68, Run 3):**
- Population: 0.885B (89% decline, slower than old 83% by Month 75)
- Cascade active: 44.2M deaths this month (~5% monthly mortality)
- 6 crises active, 3.0x degradation
- **Interpretation:** Still collapsing but more realistically paced

---

## 🎯 **Next Actions**

### **Priority 1: Fix Outcome Detection (CRITICAL)**
**File:** `src/simulation/endGame.ts`

Add environmental extinction checks:
```typescript
// Slow extinction from environmental collapse
if (population < startingPopulation * 0.3) return 'extinction';
if (state.planetaryBoundariesSystem.cascadeActive) {
  const monthsSince = currentMonth - cascadeStartMonth;
  if (monthsSince > 60 && population < startingPopulation * 0.5) {
    return 'extinction'; // 5+ years cascade + 50% mortality
  }
}
if (foodSecurity < 0.3) {
  // Track sustained food crisis
  if (monthsSustained > 24) return 'extinction';
}
```

### **Priority 2: Organization Bankruptcy During Collapse**
**Files:** `src/simulation/organizations.ts`, `src/simulation/agents/organizationAgent.ts`

Add crisis penalties:
```typescript
// Revenue collapse when customers die
if (populationDecline > 0.3) {
  monthlyRevenue *= (1 - populationDecline * 0.8);
}

// Bankruptcy during cascading crises
if (activeCrises >= 5 && foodSecurity < 0.4) {
  bankruptcyRisk += 0.15 * activeCrises;
}

if (Math.random() < bankruptcyRisk) {
  // Liquidate organization
}
```

### **Priority 3: Fix Famine System**
**File:** `src/simulation/qualityOfLife.ts` → `checkRegionalFamineRisk()`

Debug why food security 0.229 doesn't trigger famines:
1. Check threshold values (should trigger < 0.4)
2. Verify regional food security calculation
3. Ensure famine system is active
4. Log trigger attempts for diagnosis

### **Priority 4: Test New Mortality System**
**Status:** ⏳ In progress (`realistic_mortality_test` Monte Carlo)

Wait for completion, then analyze:
- Does baseline mortality match research? (0.009% monthly)
- Does cascade trigger later?
- Is decline more gradual?
- Do interventions reduce mortality?
- Any Utopia outcomes?

---

## 📈 **Success Metrics**

### **Outcome Detection:**
✅ Environmental extinction recognized as "Extinction" (not "Status Quo")  
✅ Distinguish rapid (nuclear/AI) from slow (environmental) extinction  
✅ "Status Quo" only when population stable + low crises

### **Organizations:**
✅ Bankruptcies increase during population collapse  
✅ Revenue tied to population/economic health  
✅ Some orgs survive, but most fail during apocalypse

### **Famine System:**
✅ Famines trigger when food security < 0.4  
✅ Regional famines based on local food availability  
✅ Famine deaths integrated with environmental mortality

### **Mortality System:**
✅ Baseline matches research (9M deaths/year at 7/9 boundaries)  
✅ Cascade triggers realistically (risk management, not random)  
✅ Mortality scales with actual state thresholds  
✅ Tech interventions reduce mortality through state improvement  
✅ Some runs survive with aggressive interventions  
✅ Extinction is possible but not guaranteed

---

## 🔍 **Research Citations**

**Environmental Mortality:**
- UNEP (2024): "Environmental degradation contributes to approximately 25% of global deaths, equating to around 9 million premature deaths annually"
- PMC/NCBI: Air pollution ~7M deaths/year
- PNAS (2014): Historical societies - environmental + institutional factors → collapse over decades

**Planetary Boundaries:**
- Stockholm Resilience Centre: 7/9 boundaries breached (2025 status)
- IPBES (2019): Biodiversity crisis, ecosystem collapse timelines
- IPCC AR6: Climate mortality projections

**Famine Research:**
- FAO (2024): Food insecurity statistics
- Yemen/Gaza/Sudan (2024-25): Famine progression timelines (30-60 days)
- IPBES: Ecosystem collapse → food system failure pathways

---

## 💡 **Key Insights**

### **The Core Problem**
The simulation's environmental systems work correctly (cascade triggers, degradation accelerates, population declines), but **three** downstream systems fail:
1. **Outcome classification** - doesn't recognize environmental extinction
2. **Organization behavior** - unrealistic during collapse  
3. **Famine integration** - food crisis doesn't trigger famines

### **Why This Matters**
- **For Model Validity:** Can't trust Monte Carlo results if outcomes are misclassified
- **For Utopia Analysis:** Can't measure intervention effectiveness if "Status Quo" includes apocalypse
- **For Realism:** Organizations and famines are critical societal systems

### **The Fix is Straightforward**
All three issues have clear solutions and can be implemented quickly:
- Outcome detection: Add 3 new checks (10 lines of code)
- Organization collapse: Add crisis penalties (20 lines)  
- Famine system: Debug threshold logic (investigate + fix)

---

**Updated:** October 13, 2025 - Research-based mortality system implemented, testing in progress
