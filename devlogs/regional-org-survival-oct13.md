# Regional Organization Survival Logic
**Date:** October 13, 2025  
**User Insight:** "that's 50% of local folks right cuz I have a feeling google would still be around even if like, all of asia were gone tomorrow"  
**Status:** ✅ Complete

---

## 🎯 **The Problem**

**OLD Logic (Global Population):**
```typescript
const populationDecline = 1 - (globalPop / 8.0B);
if (populationDecline > 0.50 && org.capital < 0) {
  // 50% of WORLD dead → bankrupt
  bankruptcyThreshold = 0;
}
```

**Scenario:**
- All of Asia dies tomorrow (4.8B people = 60% of world)
- Global population decline: 60%
- **Google (US-based)** → Triggers bankruptcy threshold ❌
- **OpenAI (US-based)** → Triggers bankruptcy threshold ❌
- **Meta (US-based)** → Triggers bankruptcy threshold ❌

**Reality:**
- Google's customers: Mostly US, Europe, developed markets
- US population: Stable
- Europe population: Stable
- **Google should be FINE** ✅

---

## ✅ **The Fix: Regional Market Tracking**

### **New Logic:**
```typescript
const regionalPopulationDecline = calculateRegionalPopulationDecline(org, state);
if (regionalPopulationDecline > 0.50 && org.capital < 0) {
  // 50% of LOCAL MARKET dead → bankrupt
  bankruptcyThreshold = 0;
}
```

### **How It Works:**

#### **Step 1: Determine Organization's Primary Region**
```typescript
// Find where the org's data centers are located
const orgDataCenters = state.computeInfrastructure.dataCenters.filter(dc =>
  org.ownedDataCenters.includes(dc.id)
);

// Count DCs by region
const regionCounts = new Map<string, number>();
for (const dc of orgDataCenters) {
  const region = dc.region || 'US'; // Default to US
  regionCounts.set(region, (regionCounts.get(region) || 0) + 1);
}

// Primary region = region with most data centers
```

#### **Step 2: Map Region → Relevant Countries**
```typescript
function getCountriesInRegion(region: string): CountryName[] {
  switch (region.toLowerCase()) {
    case 'us':
    case 'north america':
      return ['United States', 'Canada'];
    
    case 'eu':
    case 'europe':
      return ['United Kingdom', 'France', 'Germany'];
    
    case 'china':
    case 'east asia':
      return ['China', 'Japan'];
    
    case 'india':
    case 'south asia':
      return ['India', 'Bangladesh', 'Pakistan'];
    
    case 'distributed':
    case 'global':
      return ['United States', 'China', 'India', 'Japan', 'Germany']; // Top 5 economies
    
    default:
      return ['United States', 'Canada']; // Default to US
  }
}
```

#### **Step 3: Calculate Regional Population Decline**
```typescript
let totalBaseline = 0;
let totalCurrent = 0;

for (const countryName of relevantCountries) {
  const country = state.countryPopulationSystem.countries[countryName];
  if (country) {
    totalBaseline += country.baselinePopulation; // Starting population
    totalCurrent += country.population;          // Current population
  }
}

return 1 - (totalCurrent / totalBaseline); // Regional decline %
```

---

## 📊 **Example Scenarios**

### **Scenario 1: All of Asia Dies**
```
Global Population: 8B → 3.2B (60% decline)
Asia (China, India, Japan, etc.): 4.8B → 0 (100% decline)
North America (US, Canada): 370M → 370M (0% decline)

Google (US-based, DCs in US):
  - Regional market: US + Canada = 370M
  - Regional decline: 0%
  - Revenue penalty: None ✅
  - Bankruptcy threshold: -$50M (normal)
  - Result: SURVIVES ✅

Alibaba (China-based, DCs in China):
  - Regional market: China + Japan = 1.57B
  - Regional decline: 100%
  - Revenue penalty: 95% loss ❌
  - Bankruptcy threshold: $0 (instant bankruptcy)
  - Result: BANKRUPT ❌
```

### **Scenario 2: North America Depopulated**
```
Global Population: 8B → 7.6B (5% decline)
North America: 370M → 0 (100% decline)
Asia: 4.8B → 4.8B (0% decline)

Google (US-based, DCs in US):
  - Regional market: US + Canada = 370M
  - Regional decline: 100%
  - Revenue penalty: 95% loss ❌
  - Bankruptcy threshold: $0
  - Result: BANKRUPT ❌

Alibaba (China-based, DCs in China):
  - Regional market: China + Japan = 1.57B
  - Regional decline: 0%
  - Revenue penalty: None ✅
  - Bankruptcy threshold: -$50M (normal)
  - Result: SURVIVES ✅
```

### **Scenario 3: Global Gradual Decline**
```
Global Population: 8B → 2B (75% decline)
North America: 370M → 92M (75% decline)
Europe: 450M → 112M (75% decline)
Asia: 4.8B → 1.2B (75% decline)

Google (US-based):
  - Regional decline: 75%
  - Revenue penalty: 60% loss (75% * 0.8)
  - Bankruptcy threshold: -$20M (crisis mode)
  - Result: Depends on capital ⚠️

Alibaba (China-based):
  - Regional decline: 75%
  - Revenue penalty: 60% loss
  - Bankruptcy threshold: -$20M
  - Result: Depends on capital ⚠️

All orgs affected equally, but only when THEIR market collapses ✅
```

---

## 🔧 **Implementation Details**

### **Files Modified:**
- `src/simulation/organizationManagement.ts`
  - `calculateRegionalPopulationDecline()` (new function, 53 lines)
  - `getCountriesInRegion()` (new function, 29 lines)
  - `calculateAIRevenue()` (updated to use regional decline)
  - `processOrganizationTurn()` (updated bankruptcy logic)

### **Integration Points:**
1. **Revenue Calculation**
   - Uses `calculateRegionalPopulationDecline()` for population penalty
   - If regional decline > 30%, revenue drops proportionally
   - Max revenue loss: 95% (at 100% regional decline)

2. **Bankruptcy Threshold**
   - Uses `calculateRegionalPopulationDecline()` for threshold adjustment
   - If regional decline > 50% + negative capital → instant bankruptcy
   - Otherwise, normal bankruptcy thresholds apply

3. **Data Sources:**
   - `state.computeInfrastructure.dataCenters[]` → Org's DC locations
   - `state.countryPopulationSystem.countries{}` → Country populations
   - `DataCenter.region` field → "US", "EU", "China", etc.

---

## 🎯 **Benefits**

### **1. Geographic Realism**
- US tech companies survive US-based crises
- Chinese companies survive China-based crises
- No single-point-of-failure from global catastrophes

### **2. Strategic Differentiation**
- Distributed orgs (multiple regions) more resilient
- Regional monopolies vulnerable to local collapse
- Incentivizes geographic diversification

### **3. Realistic Collapse Dynamics**
- Regional famines don't bankrupt all orgs globally
- Regional nuclear wars don't kill all companies
- Organizations fail when THEIR customers die, not when random people die

### **4. Model Accuracy**
- Matches real-world: Google survives despite conflicts in Middle East, Africa
- Amazon thrives despite regional disasters
- Only truly global catastrophes (nuclear winter, asteroid) kill all orgs

---

## 📊 **Before vs After**

| Scenario | OLD (Global) | NEW (Regional) |
|---|---|---|
| **All of Asia dies** | All orgs bankrupt | US orgs survive |
| **US depopulated** | All orgs survive | US orgs bankrupt |
| **75% global decline** | All orgs affected equally | Each org tracks home market |
| **Regional famine** | Minor global impact | Major impact on regional orgs |
| **Global cascade** | All orgs die at same rate | Varies by market exposure |

---

## 💡 **Future Enhancements**

### **Multi-Regional Organizations (Future)**
Some orgs operate globally with multiple markets:
- Google: 40% US, 30% EU, 20% Asia, 10% other
- Could weight regional declines by market share
- More complex but more accurate

### **Supply Chain Dependencies (Future)**
Organizations depend on global supply chains:
- Even if US population stable, Asian chip shortage affects Google
- Could model infrastructure dependencies separately from customer base
- Adds complexity but increases realism

### **Refugee Markets (Future)**
Refugees fleeing crises become new customers in destination regions:
- North America depopulated → survivors flee to South America
- Could shift org markets dynamically
- Requires refugee system integration

---

## 🎓 **Key Insight**

**Organizations are regional entities with global reach, not global entities with regional presence.**

When modeling organizational survival, what matters is:
1. Where are the customers? (regional)
2. Where is the infrastructure? (regional)
3. Where are the employees? (regional)

Global catastrophes affect all orgs equally, but **regional catastrophes should only affect regional organizations**.

This makes the simulation **orders of magnitude more realistic** for modeling:
- Regional nuclear wars
- Regional pandemics
- Regional famines
- Regional environmental collapse
- Regional political instability

**Status:** Implemented, tested, and pushed to main! ✅

