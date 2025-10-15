# Nuanced Outcome Classification System
**Date:** October 13, 2025  
**Goal:** Replace binary "Extinction/Not Extinction" with gradual severity levels  
**User Insight:** "We could survive if we lost 70% of people, it happened before"

---

## 🎯 **The Problem**

**Current System:**
- 70%+ population decline → "Extinction"
- But historically, humanity survived:
  - Black Death: 30-60% of Europe died, civilization recovered
  - Bronze Age Collapse: 90% population decline in some regions, humanity survived
  - Toba Supervolcano: Human population → 3,000-10,000 individuals, we survived

**We need gradual severity levels, not binary extinction.**

---

## 📊 **New Outcome Classification System**

### **Tier 1: Status Quo** (Reference: 2025 baseline)
- **Population:** 8B (baseline)
- **Mortality:** 0-10% from baseline
- **Description:** Normal trajectory, crises manageable
- **Recovery:** Not needed
- **Example:** Minor regional conflicts, economic downturns, localized disasters

---

### **Tier 2: Crisis Era** (Significant challenges, recovery possible)
- **Population:** 7.2-6.4B (10-20% decline)
- **Mortality:** 800M-1.6B dead
- **Description:** Multiple major crises (pandemics, regional wars, climate impacts)
- **Recovery Time:** 1-2 generations (25-50 years)
- **Systems:** Strained but functional
- **Example:** COVID-19 × 10, regional nuclear war, severe climate shocks
- **Historical:** World Wars (85M dead), Spanish Flu (50M dead)

---

### **Tier 3: Collapse** (Civilization breakdown, recovery difficult)
- **Population:** 6.4-4.0B (20-50% decline)
- **Mortality:** 1.6B-4B dead
- **Description:** Global systems failing, multiple cascading crises
- **Recovery Time:** 2-5 generations (50-125 years)
- **Systems:** Major institutional failures, supply chain collapse, regional governments fail
- **Example:** Global pandemic + nuclear war + climate tipping points
- **Historical:** Black Death in Europe (30-60% mortality, recovered in ~200 years)

---

### **Tier 4: Dark Age** (Civilization reset, humanity survives)
- **Population:** 4.0-1.0B (50-87.5% decline)
- **Mortality:** 4B-7B dead
- **Description:** Return to pre-industrial conditions, loss of advanced technology
- **Recovery Time:** 5-20 generations (125-500 years)
- **Systems:** Total collapse of global systems, isolated survivor communities
- **Tech Level:** Medieval to early industrial (depending on knowledge preservation)
- **Example:** Nuclear winter + ecosystem collapse + AI infrastructure destruction
- **Historical:** Bronze Age Collapse (90% decline in affected regions, took 300+ years to recover)

---

### **Tier 5: Bottleneck** (Genetic bottleneck, uncertain future)
- **Population:** 1.0B-100M (87.5-98.75% decline)
- **Mortality:** 7B-7.9B dead
- **Description:** Human population in extreme bottleneck, genetic diversity threatened
- **Recovery Time:** 20-100 generations (500-2500 years), uncertain if possible
- **Systems:** Hunter-gatherer or early agricultural societies
- **Tech Level:** Stone Age to Bronze Age
- **Risks:** Genetic bottleneck diseases, inbreeding depression, loss of knowledge
- **Example:** Nuclear winter + ecosystem collapse + 90% crop failure
- **Historical:** Toba Supervolcano (~70,000 BCE) - humanity → 3,000-10,000 individuals

---

### **Tier 6: Terminal** (Extinction trajectory, not yet extinct)
- **Population:** 100M-1M (98.75-99.9875% decline)
- **Mortality:** 7.9B-7.999B dead
- **Description:** Population so low that extinction is likely but not certain
- **Recovery Time:** Impossible without extraordinary intervention
- **Systems:** None - scattered survivor bands
- **Risks:** Random extinction events (disease, natural disaster, genetic collapse)
- **Example:** Runaway cascade + nuclear winter + complete ecosystem collapse
- **Historical:** No precedent (humanity never this close to extinction)

---

### **Tier 7: Extinction** (Humanity gone)
- **Population:** < 1M or < 10K viable breeding population
- **Mortality:** >99.9875% decline
- **Description:** Too few humans to maintain genetic diversity and survive
- **Recovery Time:** N/A (evolutionary timescale to re-evolve intelligence)
- **Systems:** None
- **Example:** Complete biosphere collapse, runaway AI extermination, total nuclear war
- **Threshold:** Below minimum viable population (~10,000 individuals for genetic diversity)

---

## 🎮 **Implementation in Simulation**

### **New Outcome Types:**
```typescript
type OutcomeType = 
  | 'utopia'           // Positive outcome
  | 'dystopia'         // Oppressive but stable
  | 'status_quo'       // 0-10% mortality, normal trajectory
  | 'crisis_era'       // 10-20% mortality, recoverable
  | 'collapse'         // 20-50% mortality, difficult recovery
  | 'dark_age'         // 50-87.5% mortality, civilization reset
  | 'bottleneck'       // 87.5-98.75% mortality, genetic bottleneck
  | 'terminal'         // 98.75-99.99% mortality, extinction likely
  | 'extinction'       // >99.99% mortality or <10K people
  | 'inconclusive';    // Uncertain trajectory
```

### **Outcome Detection Logic:**
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
  
  // TERMINAL: 98.75-99.99% mortality (100M-1M people)
  if (mortality > 0.9875 || currentPeople < 100_000_000) {
    // Check if cascading crises make recovery impossible
    if (hasIrreversibleCascade(state)) {
      return 'terminal';
    }
    return 'bottleneck'; // Could still recover with extreme effort
  }
  
  // BOTTLENECK: 87.5-98.75% mortality (1B-100M people)
  if (mortality > 0.875 || currentPeople < 1_000_000_000) {
    return 'bottleneck';
  }
  
  // DARK AGE: 50-87.5% mortality (4B-1B people)
  if (mortality > 0.50) {
    // Check if civilization systems collapsed
    if (hasCivilizationCollapse(state)) {
      return 'dark_age';
    }
    return 'collapse'; // Systems damaged but some survive
  }
  
  // COLLAPSE: 20-50% mortality (6.4B-4B people)
  if (mortality > 0.20) {
    return 'collapse';
  }
  
  // CRISIS ERA: 10-20% mortality (7.2B-6.4B people)
  if (mortality > 0.10) {
    return 'crisis_era';
  }
  
  // STATUS QUO: 0-10% mortality (8B-7.2B people)
  return 'status_quo';
}

function hasIrreversibleCascade(state: GameState): boolean {
  const cascade = state.planetaryBoundariesSystem;
  const env = state.environmentalAccumulation;
  
  // Check for conditions that make recovery impossible
  return (
    (cascade.cascadeSeverity > 0.8) &&  // Severe cascade
    (env.foodSecurity < 0.2) &&          // Catastrophic food failure
    (env.biodiversityIndex < 0.15)       // Ecosystem collapse
  );
}

function hasCivilizationCollapse(state: GameState): boolean {
  const social = state.socialAccumulation;
  const tech = state.technologicalRisk;
  
  // Check if institutions and infrastructure collapsed
  return (
    social.institutionalFailureActive &&
    (tech.controlLossActive || 
     state.aiAgents.filter(ai => ai.alignment < 0.3 && ai.capability > 2.0).length > 10)
  );
}
```

---

## 📈 **Recovery Potential**

### **Crisis Era (10-20% mortality):**
- **Can achieve Utopia:** YES (with good interventions)
- **Can return to Status Quo:** YES (25-50 years)
- **Can further collapse:** YES (if crises unresolved)

### **Collapse (20-50% mortality):**
- **Can achieve Utopia:** UNLIKELY (would require extraordinary interventions)
- **Can return to Status Quo:** MAYBE (50-125 years)
- **Can further collapse:** YES (high risk)

### **Dark Age (50-87.5% mortality):**
- **Can achieve Utopia:** NO (not in simulation timeframe)
- **Can return to Status Quo:** NO (not in simulation timeframe)
- **Can further collapse:** YES (bottleneck risk)

### **Bottleneck (87.5-98.75% mortality):**
- **Can achieve Utopia:** NO
- **Can return to Status Quo:** NO
- **Can avoid extinction:** MAYBE (with luck + interventions)

### **Terminal (98.75-99.99% mortality):**
- **Can avoid extinction:** UNLIKELY
- **Expected outcome:** Extinction within 1-10 generations

---

## 🎯 **Why This Matters**

### **1. Historical Accuracy**
- Black Death: 50M dead (30-60% of Europe) → Recovered
- World Wars: 85M dead (4% of world) → Recovered  
- Toba Supervolcano: 99.9%+ of humans died → We're still here

**We shouldn't call 70% mortality "extinction" when we've survived worse.**

### **2. Gameplay Implications**
- **More nuanced endings:** "Dark Age" is different from "Extinction"
- **Recovery paths:** Some collapses are recoverable, some aren't
- **Player decisions matter more:** Can you avoid going from "Collapse" to "Dark Age"?

### **3. Research Realism**
- Aligns with resilience research: Systems fail gradually, not instantly
- Matches historical patterns: Civilizations collapse before humanity goes extinct
- Reflects genetic bottleneck science: 10K minimum viable population

---

## 🔧 **Implementation Priority**

### **Phase 1: Add New Outcome Types** (Today)
- Add 7 new outcome types to `OutcomeType` enum
- Implement `classifyPopulationOutcome()` function
- Update outcome detection in `engine.ts`

### **Phase 2: Recovery Mechanics** (Later)
- Add ability for populations to recover from bottlenecks
- Model knowledge preservation/loss during collapse
- Implement "rebuilding" phases after Dark Age

### **Phase 3: Storytelling** (Later)
- Add narrative descriptions for each outcome tier
- Show "what happened next" for each tier
- Display recovery timelines

---

## 📊 **Expected Monte Carlo Distribution (After Fixes)**

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
- **Utopia:** 5-10% (possible!)

---

**Status:** Ready for implementation - this gives us much more realistic outcome classification!

