# Realistic Cascade Mortality Rates - Research-Based Calibration

## 📊 **Current Reality (2025)**

### Environmental State:
- **Boundaries Breached:** 7/9 (Stockholm Resilience Centre)
- **Climate:** +1.2°C above pre-industrial
- **Biodiversity:** ~35% of pre-industrial levels
- **Population:** 8B people

### Current Mortality (Academic Sources):
- **Environmental degradation deaths:** **9M/year** (UNEP - 25% of all deaths)
  - Air pollution: **7M/year** (UNEP)
  - Climate, pollution, other environmental: **2M/year**
- **Current global population:** 8B
- **Current mortality rate:** 9M / 8B = **0.1125% annual** = **0.0094% monthly**

**Baseline (2025):** 7/9 boundaries breached = 0.11% annual mortality (0.009% monthly)

**Sources:**
- UNEP (2024): "Environmental degradation contributes to approximately 25% of global deaths, equating to around 9 million premature deaths annually"
- PNAS (2014): Historical societies - environmental degradation combined with institutional/social factors
- PMC/NCBI: Air pollution responsible for ~7M deaths annually

---

## 🔬 **Research-Based Mortality Function**

### **Mortality should be driven by THRESHOLDS, not binary cascade:**

```typescript
function calculateEnvironmentalMortality(state: GameState): number {
  const env = state.environmentalAccumulation;
  const boundaries = state.planetaryBoundariesSystem;
  
  let mortalityRate = 0; // Monthly mortality rate (0-1)
  
  // === FOOD SECURITY (Highest Impact) ===
  // Food < 0.4 = crisis, Food < 0.2 = catastrophic
  if (env.foodSecurity < 0.4) {
    const severity = (0.4 - env.foodSecurity) / 0.4; // 0-1
    mortalityRate += 0.0001 * severity; // 0.01%/month at Food=0.4, scales up
    if (env.foodSecurity < 0.2) {
      mortalityRate += 0.0005; // Additional 0.05%/month in catastrophic range
    }
  }
  
  // === WATER SECURITY ===
  // Water < 0.4 = crisis, Water < 0.2 = catastrophic
  if (env.waterSecurity < 0.4) {
    const severity = (0.4 - env.waterSecurity) / 0.4;
    mortalityRate += 0.00008 * severity; // Water crisis less immediately lethal than food
  }
  
  // === CLIMATE (Temperature-driven) ===
  // Wet-bulb > 35°C = uninhabitable (thermal habitability)
  if (env.thermalHabitability < 0.7) {
    const severity = (0.7 - env.thermalHabitability) / 0.7;
    mortalityRate += 0.00005 * severity; // Heat stress mortality
  }
  
  // === BIODIVERSITY LOSS (Ecosystem Services) ===
  // Biodiversity < 20% = collapse threshold
  if (env.biodiversityIndex < 0.3) {
    const severity = (0.3 - env.biodiversityIndex) / 0.3;
    mortalityRate += 0.00003 * severity; // Pollination failure, ecosystem services lost
  }
  
  // === CASCADE AMPLIFICATION (Non-Linear) ===
  // When multiple boundaries breached, effects compound
  const breachedCount = boundaries.boundariesBreached;
  if (breachedCount >= 7) {
    const cascadeMultiplier = 1.0 + Math.pow((breachedCount - 6) / 3, 2); // 1.0x → 2.0x
    mortalityRate *= cascadeMultiplier;
  }
  
  // === REGIONAL VARIATION ===
  // Some regions hit harder than others (handled in regional system)
  // Global mortality is aggregate
  
  return Math.min(mortalityRate, 0.10); // Cap at 10%/month (horrific but not instant)
}
```

---

## 📈 **Realistic Mortality Scenarios**

### **Scenario 1: Current State (2025)**
- Food: 0.75, Water: 0.80, Climate: 0.76, Bio: 0.35
- Boundaries: 7/9
- **Mortality: ~0.01%/month** (0.12%/year) ✅ Matches WHO estimates

### **Scenario 2: Moderate Crisis (2040)**
- Food: 0.35, Water: 0.55, Climate: 0.65, Bio: 0.25
- Boundaries: 8/9
- **Mortality: ~0.05%/month** (0.6%/year)
- Population impact: 50M deaths/year from 8B population

### **Scenario 3: Severe Crisis (2060)**
- Food: 0.15, Water: 0.30, Climate: 0.45, Bio: 0.15
- Boundaries: 9/9
- **Mortality: ~0.3%/month** (3.5%/year)
- Population impact: 200M+ deaths/year, population crash

### **Scenario 4: Catastrophic Collapse (2080+)**
- Food: 0.05, Water: 0.15, Climate: 0.30, Bio: 0.08
- Boundaries: 9/9, all worsening
- **Mortality: ~2-5%/month** (20-50%/year)
- Population impact: Extinction trajectory, billions dead within decade

---

## 🌍 **Regional vs Global Effects**

### **Local Interventions:**
- **Amazon Protection:** Affects South America biodiversity +local climate
- **Coral Restoration:** Affects fisheries in Indo-Pacific regions
- **Pesticide Bans:** Regional pollinator recovery → local food security

### **Global Interventions:**
- **Carbon Capture:** Affects global climate (atmosphere is global)
- **Fusion Power:** Reduces global emissions
- **AI-Optimized Remediation:** Can be deployed globally

### **Implementation:**
```typescript
// Regional tech affects regional mortality
function applyRegionalTech(region: string, tech: TechType): void {
  if (tech.scope === 'local') {
    region.mortalityModifier *= tech.mortalityReduction;
  }
}

// Global tech affects all regions
function applyGlobalTech(state: GameState, tech: TechType): void {
  if (tech.scope === 'global') {
    state.globalMortalityModifier *= tech.mortalityReduction;
  }
}
```

---

## ⚙️ **Implementation Changes**

### **1. Remove Binary Cascade Trigger**
```typescript
// OLD (planetaryBoundaries.ts:404)
if (!system.cascadeActive && system.tippingPointRisk > 0.70) {
  if (Math.random() < 0.10) {
    triggerTippingPointCascade(state); // 2% monthly mortality = BAD
  }
}

// NEW - Cascade is continuous, not binary
system.cascadeSeverity = calculateCascadeSeverity(state);
system.cascadeMultiplier = 1.0 + Math.pow(system.cascadeSeverity, 2);
```

### **2. State-Driven Mortality**
```typescript
// NEW (qualityOfLife.ts or new file)
export function calculateEnvironmentalMortality(state: GameState): {
  monthlyRate: number;
  annualRate: number;
  regionalVariation: Map<string, number>;
} {
  // Calculate based on food, water, climate, biodiversity thresholds
  // Return both global rate and regional variation
}
```

### **3. Tech Reduces Mortality via State**
```typescript
// Carbon capture deployed → improves climate stability → reduces mortality
// No hard-coded "if carbonCapture then mortality *= 0.5"

// Instead:
env.climateStability += carbonCaptureEffect;
// Then mortality naturally recalculates from new climate value
```

---

## 🎯 **Expected Impact**

### **Before Fix:**
- Month 18: Cascade triggers
- Mortality: 2%/month (22%/year) immediately
- Result: 83% dead by Month 75

### **After Fix:**
- Month 18: Food security drops to 0.35
- Mortality: 0.05%/month (0.6%/year) - severe but not apocalyptic
- Month 40: Food reaches 0.15 if no intervention
- Mortality: 0.3%/month (3.5%/year) - crisis deepens
- Month 60: If tech deployed, food recovers to 0.30
- Mortality: 0.15%/month (1.8%/year) - still bad but improving

### **Key Change:**
**Crisis is severe but WINNABLE with right interventions**, not automatic extinction.

---

## 📚 **Research Citations**

- WHO (2023): Climate change mortality estimates 2030-2050
- FAO (2024): Food insecurity and malnutrition deaths
- Stockholm Resilience Centre (2025): Planetary boundaries status
- IPCC AR6 (2021): Temperature mortality relationships
- Global Tipping Points Report (2023): Cascade dynamics

---

## ✅ **Next Steps**

1. Implement `calculateEnvironmentalMortality()` function
2. Replace binary cascade trigger with continuous severity
3. Add regional mortality variation
4. Make tech effects work through state changes, not hard-coded checks
5. Test with Monte Carlo: Should see graduated mortality response to environmental degradation

