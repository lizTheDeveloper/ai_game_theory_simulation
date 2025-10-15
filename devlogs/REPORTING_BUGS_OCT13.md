# 🚨 MONTE CARLO REPORTING BUGS
**Date:** October 13, 2025, 20:45 PDT  
**Status:** 7 reporting bugs identified

---

## **🔴 CRITICAL: 90% OF DEATHS MISSING FROM BREAKDOWN**

### **The Problem:**
```
Total Deaths: 7642M
Breakdown:
  Natural: 669M
  Crisis: 8M
  Nuclear: 37M
  Cascade: 54M
  Meaning: 0M
  --------
  Sum: 768M ≠ 7642M ❌

MISSING: 6874M deaths (90% of mortality)
```

### **Root Cause:**
`calculateEnvironmentalMortality()` (Oct 13 fix) calculates death rates from food/water/climate thresholds, but **DOESN'T populate `deathsByCategory`!**

**Location:** `src/simulation/populationDynamics.ts:171`
```typescript
const environmentalMortalityRate = calculateEnvironmentalMortality(state);
pop.adjustedDeathRate = baselineDeaths + (environmentalMortalityRate * 12);

// ❌ BUG: Deaths applied but not categorized!
// pop.deathsByCategory.climate += ... ← MISSING!
// pop.deathsByCategory.ecosystem += ... ← MISSING!
// pop.deathsByCategory.disease += ... ← MISSING!
```

### **Fix Required:**
`calculateEnvironmentalMortality()` should return **both** the mortality rate AND a breakdown by cause (food/water/climate/biodiversity), then `populationDynamics.ts` should increment the appropriate categories.

---

## **🟠 HIGH PRIORITY: "DEPOPULATION" DEFINITION UNCLEAR**

### **The Problem:**
```
Countries Depopulated: 15.0 / 15 (100%)
Population Remaining: 350M (4.4%)
```
If ALL countries are "depopulated," how are 350M people still alive?

### **Root Cause:**
"Depopulation" probably means *population dropped below threshold*, not *zero population*. But the summary doesn't explain this, making it confusing.

### **Fix Required:**
Either:
1. Clarify definition: "Countries Below Threshold: 15/15 (90% decline)"
2. Or use stricter definition: "Countries Extinct (<1M): X/15"

---

## **🟠 HIGH PRIORITY: ABSURD POSITIVE FRAMING DURING COLLAPSE**

### **The Problem:**
```
✅ Excellent: Organizations are thriving!
💰 Highly profitable! Organizations accumulating wealth.
⚡ Exceptional compute growth! Infrastructure boom.
```
During **95% mortality**, the summary celebrates organizational success!

### **Root Cause:**
Summary uses positive emoji (✅, 💰, ⚡) without checking if humans are dying. It's technically correct (orgs *are* thriving) but morally tone-deaf.

### **Fix Required:**
Add context warnings:
```
⚠️  Organizations thriving despite 95% human mortality (unrealistic!)
💀 Highly profitable while customers dying (check revenue penalties!)
```

---

## **🟡 MEDIUM: "INEQUALITY IMPROVED" MISLEADING**

### **The Problem:**
```
✅ INEQUALITY IMPROVED: 15% reduction (AI helping distribution)
```
During 95% mortality, claiming inequality "improved" is misleading—it probably means everyone died equally, not that AI helped.

### **Root Cause:**
Gini coefficient drops when poor regions die faster than rich regions (convergence from below). This isn't "improvement"!

### **Fix Required:**
```
📉 Inequality changed: 15% reduction
   ⚠️  During population collapse, interpret with caution
   (May indicate convergence from death, not AI-driven equity)
```

---

## **🟡 MEDIUM: COMPUTE GROWTH 20 MILLION x?**

### **The Problem:**
```
Avg Compute Growth: 20,747,713.21x
```
Moore's Law = ~256x in 20 years. Where did 20 million x come from?

### **Root Cause:**
Either:
1. Bug in compute calculation (exponential runaway)
2. AI recursively self-improving compute (intended but unrealistic scale?)

### **Fix Required:**
Cap compute growth or investigate if this is a bug. Should be ~100-1000x in realistic scenarios, not millions.

---

## **🟡 MEDIUM: OUTCOME CLASSIFICATION CONFUSING**

### **The Problem:**
```
None: 10/10 (100%)
  🧬 Run 1: BOTTLENECK
  🧬 Run 2: BOTTLENECK
```
Why does "BOTTLENECK" map to "None"?

### **Root Cause:**
Legacy 4-category system (utopia/dystopia/extinction/stalemate) doesn't have a bucket for intermediate outcomes like bottleneck/collapse/dark_age.

### **Fix Required:**
Option 1: Show 7-tier outcomes directly (don't map to legacy categories)
Option 2: Add "Survival" category for non-extinction, non-utopia/dystopia outcomes

---

## **🟢 LOW: ALIGNMENT GAP NOT FLAGGED**

### **The Problem:**
```
Avg External Alignment: 0.633
Avg True Alignment: 0.113
Alignment Gap: 0.521 ⚠️ (huge!)
```
This 0.52 gap is buried in stats, not flagged as a critical finding.

### **Fix Required:**
```
🚨 CRITICAL: Alignment Gap = 0.52
   AIs showing 0.63 alignment but actually 0.11 (deceptive!)
   60.8 highly misaligned AIs per run
```

---

## 📋 **PRIORITY ORDER**

1. **🔴 CRITICAL:** Fix missing 90% of death breakdown (environmental deaths not categorized)
2. **🟠 HIGH:** Clarify "depopulation" definition
3. **🟠 HIGH:** Add context warnings to positive framing during collapse
4. **🟡 MEDIUM:** Fix "inequality improved" messaging
5. **🟡 MEDIUM:** Investigate/cap compute growth (20M x seems wrong)
6. **🟡 MEDIUM:** Show 7-tier outcomes directly (not mapped to "None")
7. **🟢 LOW:** Flag alignment gap as critical finding

---

**Next Step:** Fix #1 (environmental deaths not categorized) by refactoring `calculateEnvironmentalMortality()` to return death breakdown and update `deathsByCategory` appropriately.

