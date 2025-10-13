# 7-Tier Outcome Classification System
**Date:** October 13, 2025  
**Session:** Regional Organization Survival + Nuanced Outcomes  
**User Insight:** *"We could survive if we lost 70% of people, it happened before"*

---

## 🎯 **The Problem**

**OLD SYSTEM (Binary):**
- 70%+ population decline → "Extinction"
- But historically, humanity survived much worse:
  - **Black Death (1347-1353):** 30-60% of Europe died → Recovered in ~200 years
  - **Bronze Age Collapse (1200 BCE):** 90% population decline in affected regions → Humanity survived
  - **Toba Supervolcano (~70,000 BCE):** ~99.9% of humans died (population → 3,000-10,000) → We're still here!

**CONCLUSION:** 70% mortality ≠ Extinction. We need graduated severity levels.

---

## ✅ **NEW SYSTEM (7 Severity Tiers)**

### **Tier 1: Status Quo**
- **Population:** 8B (baseline)
- **Mortality:** 0-10% from baseline
- **Recovery:** Not needed
- **Description:** Normal trajectory, crises manageable
- **Historical:** COVID-19 (0.08% global mortality), regional conflicts

---

### **Tier 2: Crisis Era** ⚠️
- **Population:** 7.2-6.4B (10-20% decline)
- **Mortality:** 800M-1.6B dead
- **Recovery Time:** 1-2 generations (25-50 years)
- **Description:** Multiple major crises (pandemics, regional wars, climate shocks)
- **Systems:** Strained but functional
- **Historical:** World Wars (85M dead), Spanish Flu (50M dead)

---

### **Tier 3: Collapse** 💥
- **Population:** 6.4-4.0B (20-50% decline)
- **Mortality:** 1.6B-4B dead
- **Recovery Time:** 2-5 generations (50-125 years)
- **Description:** Global systems failing, cascading crises
- **Systems:** Major institutional failures, supply chain collapse
- **Historical:** Black Death in Europe (30-60% mortality, recovered in ~200 years)

---

### **Tier 4: Dark Age** 🏚️
- **Population:** 4.0-1.0B (50-87.5% decline)
- **Mortality:** 4B-7B dead
- **Recovery Time:** 5-20 generations (125-500 years)
- **Description:** Return to pre-industrial conditions, loss of advanced technology
- **Systems:** Total collapse of global systems, isolated survivor communities
- **Tech Level:** Medieval to early industrial
- **Historical:** Bronze Age Collapse (90% decline in affected regions, took 300+ years to recover)

---

### **Tier 5: Bottleneck** 🧬
- **Population:** 1.0B-100M (87.5-98.75% decline)
- **Mortality:** 7B-7.9B dead
- **Recovery Time:** 20-100 generations (500-2500 years), uncertain if possible
- **Description:** Human population in extreme bottleneck, genetic diversity threatened
- **Systems:** Hunter-gatherer or early agricultural societies
- **Tech Level:** Stone Age to Bronze Age
- **Risks:** Genetic bottleneck diseases, inbreeding depression, loss of knowledge
- **Historical:** Toba Supervolcano (~70,000 BCE) - humanity → 3,000-10,000 individuals, recovered to 8B!

---

### **Tier 6: Terminal** ⚰️
- **Population:** 100M-1M (98.75-99.9875% decline)
- **Mortality:** 7.9B-7.999B dead
- **Recovery Time:** Impossible without extraordinary intervention
- **Description:** Population so low that extinction is likely but not certain
- **Systems:** None - scattered survivor bands
- **Risks:** Random extinction events (disease, natural disaster, genetic collapse)
- **Historical:** No precedent (humanity never this close to extinction)

---

### **Tier 7: Extinction** 💀
- **Population:** < 1M or < 10K viable breeding population
- **Mortality:** >99.9875% decline
- **Recovery Time:** N/A (evolutionary timescale to re-evolve intelligence)
- **Description:** Too few humans to maintain genetic diversity and survive
- **Threshold:** Below minimum viable population (~10,000 individuals for genetic diversity)
- **Historical:** No precedent (we've never gone extinct!)

---

## 🔧 **Implementation**

### **Code Changes:**

#### **1. Updated `OutcomeType` enum (`types/game.ts`):**
```typescript
// OLD (Binary):
export type OutcomeType = 'utopia' | 'dystopia' | 'extinction';

// NEW (7 Tiers):
export type OutcomeType = 
  | 'utopia'           // Positive outcome
  | 'dystopia'         // Oppressive but stable
  | 'status_quo'       // 0-10% mortality
  | 'crisis_era'       // 10-20% mortality, recoverable
  | 'collapse'         // 20-50% mortality, difficult recovery
  | 'dark_age'         // 50-87.5% mortality, civilization reset
  | 'bottleneck'       // 87.5-98.75% mortality, genetic bottleneck
  | 'terminal'         // 98.75-99.99% mortality, extinction likely
  | 'extinction'       // >99.99% mortality or <10K people
  | 'inconclusive';    // Uncertain trajectory
```

#### **2. New Classification Function (`engine.ts`):**
```typescript
function classifyPopulationOutcome(
  currentPop: number, 
  initialPop: number,
  state: GameState
): OutcomeType {
  const mortality = 1 - (currentPop / initialPop);
  const currentPeople = currentPop * 1_000_000_000;
  
  // EXTINCTION: <10K people OR >99.99% mortality
  if (currentPeople < 10_000 || mortality > 0.9999) {
    return 'extinction';
  }
  
  // TERMINAL: 98.75-99.99% mortality (1M-100M people)
  if (mortality > 0.9875 || currentPeople < 100_000_000) {
    if (hasIrreversibleCascade(state)) {
      return 'terminal';
    }
    return 'bottleneck';
  }
  
  // BOTTLENECK: 87.5-98.75% mortality (100M-1B people)
  if (mortality > 0.875 || currentPeople < 1_000_000_000) {
    return 'bottleneck';
  }
  
  // DARK AGE: 50-87.5% mortality (1B-4B people)
  if (mortality > 0.50) {
    if (hasCivilizationCollapse(state)) {
      return 'dark_age';
    }
    return 'collapse';
  }
  
  // COLLAPSE: 20-50% mortality (4B-6.4B people)
  if (mortality > 0.20) {
    return 'collapse';
  }
  
  // CRISIS ERA: 10-20% mortality (6.4B-7.2B people)
  if (mortality > 0.10) {
    return 'crisis_era';
  }
  
  // STATUS QUO: 0-10% mortality (7.2B-8B people)
  return 'status_quo';
}
```

#### **3. Helper Functions:**

**`hasIrreversibleCascade():`** Checks if environmental collapse is beyond recovery
```typescript
function hasIrreversibleCascade(state: GameState): boolean {
  const cascade = state.planetaryBoundariesSystem;
  const env = state.environmentalAccumulation;
  
  return (
    (cascade.cascadeSeverity > 0.8) &&  // Severe cascade
    (env.foodSecurity < 0.2) &&          // Catastrophic food failure
    (env.biodiversityIndex < 0.15)       // Ecosystem collapse
  );
}
```

**`hasCivilizationCollapse():`** Checks if institutions have failed (not just population decline)
```typescript
function hasCivilizationCollapse(state: GameState): boolean {
  const social = state.socialAccumulation;
  const tech = state.technologicalRisk;
  
  const institutionalCollapse = social.institutionalFailureActive;
  const aiTakeover = tech.controlLossActive && 
    state.aiAgents.filter(ai => ai.alignment < 0.3 && ai.capability > 2.0).length > 10;
  
  return institutionalCollapse || aiTakeover;
}
```

---

## 📈 **Recovery Potential**

### **Crisis Era (10-20% mortality):**
- ✅ **Can achieve Utopia:** YES (with good interventions)
- ✅ **Can return to Status Quo:** YES (25-50 years)
- ⚠️  **Can further collapse:** YES (if crises unresolved)

### **Collapse (20-50% mortality):**
- ⚠️  **Can achieve Utopia:** UNLIKELY (would require extraordinary interventions)
- ⚠️  **Can return to Status Quo:** MAYBE (50-125 years)
- ⚠️  **Can further collapse:** YES (high risk)

### **Dark Age (50-87.5% mortality):**
- ❌ **Can achieve Utopia:** NO (not in simulation timeframe)
- ❌ **Can return to Status Quo:** NO (not in simulation timeframe)
- ⚠️  **Can avoid Bottleneck:** YES (but difficult)

### **Bottleneck (87.5-98.75% mortality):**
- ❌ **Can achieve Utopia:** NO
- ❌ **Can return to Status Quo:** NO
- ⚠️  **Can avoid extinction:** MAYBE (with luck + interventions)

### **Terminal (98.75-99.99% mortality):**
- ❌ **Can avoid extinction:** UNLIKELY
- 💀 **Expected outcome:** Extinction within 1-10 generations

---

## 🎮 **Why This Matters**

### **1. Historical Accuracy**
We shouldn't call 70% mortality "extinction" when we've survived worse:
- **Black Death:** 50M dead (30-60% of Europe) → Recovered in 200 years
- **World Wars:** 85M dead (4% of world) → Recovered in 50 years
- **Toba Supervolcano:** 99.9%+ of humans died → We're still here

### **2. Gameplay Implications**
- **More nuanced endings:** "Dark Age" is different from "Extinction"
- **Recovery paths:** Some collapses are recoverable, some aren't
- **Player decisions matter more:** Can you avoid going from "Collapse" to "Dark Age"?

### **3. Research Realism**
- Aligns with resilience research: Systems fail gradually, not instantly
- Matches historical patterns: Civilizations collapse before humanity goes extinct
- Reflects genetic bottleneck science: 10K minimum viable population

---

## 📊 **Expected Distribution (After All Fixes)**

**With current baseline (no interventions):**
- **Extinction:** 5-10% (truly catastrophic scenarios)
- **Terminal:** 10-15% (heading to extinction)
- **Bottleneck:** 15-20% (genetic bottleneck, uncertain)
- **Dark Age:** 20-30% (civilization collapse)
- **Collapse:** 15-20% (major crisis, recoverable)
- **Crisis Era:** 10-15% (manageable with interventions)
- **Status Quo:** 0-5% (rare without interventions)
- **Utopia:** 0% (requires active interventions)

**With aggressive interventions (TIER 2):**
- **Extinction:** 1-2%
- **Terminal:** 2-5%
- **Bottleneck:** 5-10%
- **Dark Age:** 10-15%
- **Collapse:** 15-20%
- **Crisis Era:** 20-30%
- **Status Quo:** 10-15%
- **Utopia:** 5-10% ✨

---

## 🔮 **Next Steps**

### **Phase 1: Validation** (Today - In Progress)
- ✅ Implemented 7-tier classification
- 🔄 Running Monte Carlo to validate distribution
- 📊 Analyze outcome distribution

### **Phase 2: Recovery Mechanics** (Later)
- Add ability for populations to recover from bottlenecks
- Model knowledge preservation/loss during collapse
- Implement "rebuilding" phases after Dark Age

### **Phase 3: Storytelling** (Later)
- Add narrative descriptions for each outcome tier
- Show "what happened next" for each tier
- Display recovery timelines

---

## 📝 **Summary**

**Before:** Binary extinction at 70% mortality  
**After:** 7 graduated tiers reflecting historical survival patterns

**Key Insight:** Humanity is resilient. We've survived 99.9% mortality before (Toba). The simulation should reflect this reality.

**Status:** ✅ Implemented, ⏳ Testing with Monte Carlo run

