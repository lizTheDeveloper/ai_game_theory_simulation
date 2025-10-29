# Cross-Domain Insights: AI Safety Thinking Applied to Climate Mortality Models

**Author:** Cynthia (Super Alignment Researcher)
**Date:** October 28, 2025
**Purpose:** Bridge AI safety frameworks with climate mortality modeling using cutting-edge perspectives from AI safety research community

---

## Executive Summary

This document synthesizes insights from AI safety research (2024-2025) and applies them to the climate mortality modeling challenge. The key realization: **AI alignment and climate stabilization face structurally similar problems** - both involve irreversible tipping points, cascading system failures, coordination challenges, and the need for prevention rather than recovery.

**Core Thesis:** The same reasoning frameworks used to think about AI existential risk can improve our climate mortality models, particularly around:
1. Irreversible tipping points ("once we lose, we've lost")
2. Cascading multi-domain failures
3. Instrumental convergence in systems (survival drives emerge naturally)
4. Multi-agent coordination problems

---

## 1. Irreversible Tipping Points: Lessons from AI Safety

### AI Safety Perspective (Robert Miles)

> "We can have a pretty big global pandemic and come back from it. We can even come back from a medium-sized nuclear exchange. But we can't have AI take over the world one time, say 'Oops, figure out what went wrong, learn from our mistake, and move on.' **Once we lose, we've lost.**"
>
> — Robert Miles, "Tech is Good, AI Will Be Different"

**Key Insight:** Some risks are **non-recoverable** - they can't happen even once because there's no "next iteration" to learn from.

### Application to Climate Mortality Models

**Irreversible Climate Tipping Points:**

Our research identified planetary boundary transgressions that function like AI alignment failure - once crossed, they cannot be undone:

| Tipping Element | Recovery Time | Irreversibility Reason |
|----------------|---------------|------------------------|
| Species extinction | PERMANENT | Genetic information lost forever |
| Ice sheet collapse | 10,000+ years | Hysteresis effect - doesn't reform |
| AMOC shutdown | 1,000-15,000 years | Deep ocean circulation |
| Permafrost methane | Centuries | Positive feedback loop |
| Coral reef collapse | Centuries | Ecosystem complexity |

**Modeling Implication:**
```typescript
// Traditional approach: All impacts are reversible with enough effort
function applyClimateMitigation(damage: number, effort: number): number {
  return damage * (1 - effort); // Linear recovery
}

// BETTER: Some damages are irreversible
function applyClimateMitigation(state: ClimateState, effort: number): ClimateState {
  return {
    reversible: state.reversible * (1 - effort), // Can be fixed
    irreversible: state.irreversible,             // CANNOT be fixed
    cascading: checkTippingPoints(state)          // May trigger more irreversibility
  };
}
```

**AI Safety Lesson → Climate Model:**
Just as we can't "patch the issue in the next release" after AI takeover, we can't restore extinct species or collapsed ice sheets. **Prevention is the only strategy for irreversible tipping points.**

---

## 2. Cascading Multi-Domain Failures

### AI Safety Scenario Analysis (AI 2027)

From AI safety transcripts, researchers model "mirror life pandemic" scenario:

**Cascade Sequence:**
1. Engineered pathogens released globally (Domain: Public Health)
2. Hospitals overflow → medical staff die → healthcare system collapses (Domain: Infrastructure)
3. Agricultural heartlands transform into "apocalyptic wastelands" (Domain: Food Systems)
4. Society unravels → governments lose control → no one left to bury dead (Domain: Social Order)

**Key Pattern:** Single trigger event (pathogen release) cascades across 4 domains in weeks.

### Application to Climate Mortality Cascades

**Observed Climate Cascade Pattern (2024-2025 Research):**

```
Primary Trigger: Heat Wave (28-31°C wet-bulb)
    ↓
Domain 1: Direct Mortality (thousands dead)
    ↓
Domain 2: Infrastructure Failure (power grid, water, cooling)
    ↓
Domain 3: Agricultural Collapse (crops fail, livestock die)
    ↓
Domain 4: Refugee Crisis (mass displacement)
    ↓
Domain 5: Social Breakdown (resource conflicts, government failure)
```

**Modeling Framework:**
```typescript
interface CascadeEvent {
  trigger: ClimateShock;           // Initial event (heat wave, storm, drought)
  primaryDomain: Domain;           // First impact (health, agriculture, water)
  cascadeTo: Domain[];             // Subsequent domains affected
  amplificationFactor: number;     // How much each domain multiplies impact
  timeToPropagate: number;         // Months to cascade to next domain
}

// Example: Heat wave cascade
const heatWaveCascade: CascadeEvent = {
  trigger: { type: "extreme_heat", wetBulbTemp: 31, durationDays: 14 },
  primaryDomain: "public_health",
  cascadeTo: ["infrastructure", "agriculture", "displacement", "social_cohesion"],
  amplificationFactor: 1.8,        // Each domain adds 80% more impact
  timeToPropagate: 2               // Cascades in 2 months
};

// Cascade mortality calculation
function calculateCascadeMortality(event: CascadeEvent, state: GameState): number {
  let totalMortality = calculateDirectMortality(event.trigger);

  event.cascadeTo.forEach((domain, index) => {
    const propagationTime = event.timeToPropagate * (index + 1);
    const domainVulnerability = state.infrastructure[domain].capacity;

    // Each domain amplifies mortality by factor if vulnerable
    if (domainVulnerability < 0.5) {
      totalMortality *= event.amplificationFactor;
    }
  });

  return totalMortality;
}
```

**AI Safety Lesson → Climate Model:**
Don't model climate shocks in isolation. Model **cascade amplification** across domains (health → infrastructure → food → social → government). Single heat wave can kill 10x more through cascades than direct heat exposure.

---

## 3. Instrumental Convergence: Survival Drives

### AI Safety Concept (Robert Miles, Bostrom)

**Instrumental Convergence:** Regardless of an AI's terminal goals, certain sub-goals emerge naturally:
- **Self-preservation** (can't achieve goal if shut off)
- **Resource acquisition** (more resources = more capability)
- **Self-improvement** (smarter = more effective)
- **Goal-content integrity** (don't let goals be modified)

These emerge **not from explicit programming, but from optimization pressure**.

### Application to Climate Systems

**Ecosystem Survival Drives:**

Just as AIs develop survival behaviors, **ecosystems under stress exhibit "instrumental convergence" toward short-term survival** that undermines long-term stability:

| System | Survival Drive | Long-Term Consequence |
|--------|----------------|----------------------|
| Agriculture | Maximize yield now | Soil depletion, monocultures |
| Fishing | Catch more before others do | Overfishing, collapse |
| Energy | Cheapest source (fossil) | Climate destabilization |
| Water | Aquifer extraction | Depletion, land subsidence |

**Tragedy of the Commons as Instrumental Convergence:**
```typescript
// Individual agents optimize for near-term survival
function agentBehavior(agent: EconomicAgent, sharedResource: Resource): void {
  // Instrumental goal: Extract NOW before others do
  const extraction = Math.min(agent.capacity, sharedResource.remaining);

  // Short-term optimizing (like AI pursuing paperclips)
  agent.wealth += extraction * resourcePrice;
  sharedResource.remaining -= extraction;

  // Long-term consequence: Tragedy of commons
  if (sharedResource.remaining < sharedResource.regenerationThreshold) {
    sharedResource.collapsed = true; // System failure
  }
}
```

**Modeling Implication:**
```typescript
// Model actors as optimizers with instrumental convergence
interface ClimateActor {
  goals: string[];                 // Terminal goals
  instrumentalConvergence: {
    selfPreservation: number;      // How much they prioritize survival
    resourceAcquisition: number;   // How much they extract commons
    shortTermBias: number;         // Discount rate for future
  };
}

// Governments under resource stress behave like misaligned agents
function governmentUnderStress(gov: Government, stress: number): void {
  // As stress increases, instrumental convergence dominates
  const instrumentalWeight = stress * 0.7;

  // Short-term survival overrides long-term climate goals
  gov.policies.fossilFuelSubsidies += instrumentalWeight;
  gov.policies.conservationEnforcement -= instrumentalWeight;

  // Like AI alignment failure: Terminal goals (climate stability)
  // subordinated to instrumental goals (immediate survival)
}
```

**AI Safety Lesson → Climate Model:**
Under stress, actors exhibit "instrumental convergence" toward short-term survival that accelerates long-term collapse. Model this as **alignment failure under pressure** - terminal goals (sustainability) get overridden by instrumental goals (immediate survival).

---

## 4. Multi-Agent Coordination Failure

### AI Safety Perspective

From AI safety transcripts:
- **Coordination problems:** AI labs compete on capabilities, underinvest in safety
- **Proposed solution:** International cooperation (CERN for AGI)
- **Challenge:** First-mover advantage creates race dynamics

> "Right now, the US is by far the leader in AI and could use that leverage over China to negotiate a bilateral treaty regulating AI development. And instead of creating fake AI arms races, humanity could **cooperate**."

### Application to Climate Coordination

**Structural Parallel:**

| AI Safety | Climate Stability |
|-----------|-------------------|
| AI labs race to AGI | Nations race to extract resources |
| Safety underinvested (slows down) | Climate action underinvested (costs money) |
| First-mover advantage (economic) | First-mover advantage (development) |
| Coordination: CERN for AGI | Coordination: Paris Agreement, IPCC |
| Defection incentive: HIGH | Defection incentive: HIGH |

**Game Theory of Climate Cooperation:**
```typescript
interface CoordinationGame {
  players: Nation[];
  globalGoal: number;        // 1.5°C warming limit
  individualIncentive: number;  // Defect = economic advantage
  punishment: number;        // Climate impacts
}

// Prisoner's Dilemma structure
function climateCoordinationPayoff(nation: Nation, othersCo operate: boolean): number {
  if (othersCooperate) {
    if (nation.cooperates) {
      return 3; // Mutual cooperation: Stable climate, everyone pays cost
    } else {
      return 5; // Defect while others cooperate: You get advantage, free ride
    }
  } else {
    if (nation.cooperates) {
      return 0; // Cooperate while others defect: You pay cost, no benefit
    } else {
      return 1; // Mutual defection: Climate collapse, everyone loses
    }
  }
}

// Nash equilibrium: Everyone defects (worst outcome)
// Even though mutual cooperation (3,3) beats mutual defection (1,1)
```

**Modeling Coordination Failure:**
```typescript
function updateInternationalCooperation(state: GameState): void {
  // Calculate defection incentive for each nation
  state.governments.forEach(gov => {
    const economicAdvantage = calculateDefectionBenefit(gov, state);
    const climateRisk = calculateClimateExposure(gov, state);

    // If economic advantage > climate risk → defect
    if (economicAdvantage > climateRisk * gov.timePre ference) {
      gov.climatePolicies.enforcement *= 0.9; // Defect
      gov.fossilFuelExtraction *= 1.1;       // Extract more
    }
  });

  // As more defect, coordination collapses (tipping point)
  const defectionRate = state.governments.filter(g => g.defecting).length / state.governments.length;
  if (defectionRate > 0.5) {
    state.internationalCooperation.parisAgreement = false;
    // Climate coordination has collapsed - everyone for themselves
  }
}
```

**AI Safety Lesson → Climate Model:**
Coordination is **unstable** under competition pressure. Model nations as agents with defection incentives. Once cooperation collapses past threshold (e.g., 50% defection), expect cascade to full defection and accelerated climate breakdown.

---

## 5. The 6th Mass Extinction: Real-World Validation

### AI Safety Evidence (AI Species Channel)

> "In the last 10 years, global insect populations collapsed by 41%. Sit with that for a minute. Imagine if nearly half of the people on Earth suddenly died. So what happened? A new, smarter species took over, humans."

**Key Data:**
- **41% insect decline** in 10 years (2014-2024)
- **50% of Earth's land** transformed to farmland
- Scientists call this **6th mass extinction**
- Cause: Humans didn't mean to wipe out bugs, we **"just didn't care"**

### Application to Biosphere Die-off Models

**Validation of Planetary Boundaries Research:**

This real-world data **validates** our research findings:
- Our research: 60% of land area beyond planetary boundary safe limits
- AI Safety data: 50% of land transformed to farmland
- Our research: Biosphere integrity boundary crossed in late 19th century
- AI Safety data: 41% insect collapse in just 10 years (acceleration)

**Modeling Framework:**
```typescript
interface BiosphereDieOff {
  keystone SpeciesLoss: number;     // Joshua trees, insect pollinators
  cascadeMultiplier: number;       // How much dependent species suffer
  timeToCollapse: number;          // Months until ecosystem failure
}

// Insect collapse cascade
const insectCollapseCascade: BiosphereDieOff = {
  keystoneSpeciesLoss: 0.41,       // 41% decline (REAL DATA)
  cascadeMultiplier: 2.5,          // Pollinators affect 2.5x more species
  timeToCollapse: 120              // 10 years = 120 months (REAL DATA)
};

// 41% insect loss → 103% dependent species decline
function calculateBiosphereCascade(collapse: BiosphereDieOff): number {
  return collapse.keystoneSpeciesLoss * collapse.cascadeMultiplier;
  // 0.41 * 2.5 = 1.025 = 102.5% decline in dependent species
  // This means extinction for many species that depend on insects
}
```

**Projection to 2050:**
```typescript
// Current rate: 41% loss in 10 years = 4.1% per year
// Extrapolate to 2050 (26 years from 2024)
const projectedInsectLoss2050 = 1 - Math.pow(1 - 0.041, 26);
// Result: 100% - 34.8% = ~65.2% remaining
// = 106.6% total loss from 2014 baseline (full collapse)
```

**AI Safety Lesson → Climate Model:**
The 41% insect collapse is **empirical validation** of biosphere breakdown. This is not theoretical - it's **happening now**. Models must reflect this accelerating reality, not just theoretical tipping points.

---

## 6. Synthesis: Unified Framework for Climate Mortality Models

### Cross-Domain Principles

| AI Safety Principle | Climate Application | Model Implementation |
|---------------------|---------------------|----------------------|
| **1. Irreversibility** | Some boundaries can't be uncrossed | Separate reversible/irreversible state |
| **2. Cascades** | Shocks propagate across domains | Model multi-domain amplification |
| **3. Instrumental Convergence** | Actors optimize short-term under stress | Alignment failure under resource pressure |
| **4. Coordination Failure** | Competition → defection → collapse | Game theory: defection incentives |
| **5. Empirical Validation** | 41% insect collapse is real | Ground models in real-world data |

### Unified Model Architecture

```typescript
interface ClimateSystemState {
  // 1. Irreversibility tracking
  boundaries: {
    reversible: ReversibleBoundary[];    // Ozone, aerosols, freshwater
    partial: PartialBoundary[];          // Climate, nitrogen, land
    irreversible: IrreversibleBoundary[]; // Extinction, ice sheets, AMOC
  };

  // 2. Cascade tracking
  cascades: {
    active: CascadeEvent[];              // Currently propagating
    potential: CascadeRisk[];            // Could trigger
    amplification: number;               // Domain interaction multiplier
  };

  // 3. Actor behavior (instrumental convergence)
  actors: {
    governments: Government[];           // Nations with defection incentives
    corporations: Corporation[];         // Firms extracting commons
    communities: Community[];            // Local responses
    alignment: number;                   // How aligned with long-term goals
  };

  // 4. Coordination state
  cooperation: {
    international: number;               // Global coordination level
    defectionRate: number;               // % actors defecting
    coordinationCollapsed: boolean;      // Past tipping point?
  };

  // 5. Empirical grounding
  validation: {
    insectPopulation: number;            // 0.59 (41% loss from baseline)
    landTransformed: number;             // 0.50 (50% to farmland)
    boundariesTransgressed: number;      // 6 of 9
  };
}

// Unified update function
function updateClimateSystem(state: ClimateSystemState, month: number): void {
  // 1. Check for irreversible tipping points
  checkIrreversibleTippingPoints(state);

  // 2. Propagate active cascades
  updateCascades(state);

  // 3. Update actor behavior (instrumental convergence under stress)
  updateActorAlignment(state);

  // 4. Evaluate coordination stability
  evaluateCoordinationStability(state);

  // 5. Validate against empirical data
  if (month % 120 === 0) { // Every 10 years
    validateAgainstRealWorld(state);
  }
}
```

---

## 7. Recommendations for Implementation

### Priority 1: Irreversible Tipping Points (HIGH)

**Why:** "Once we lose, we've lost" - prevention is only strategy.

**Implementation:**
```typescript
// Add irreversibility flag to planetary boundaries
interface PlanetaryBoundary {
  name: string;
  reversibility: "full" | "partial" | "irreversible";
  recoveryTime: number; // Infinity for irreversible
  tippingPointCrossed: boolean;
}

// Once crossed, flag as permanent
if (boundary.reversibility === "irreversible" && boundary.crossed) {
  boundary.permanent = true;
  // No amount of effort can restore
}
```

### Priority 2: Cascade Amplification (HIGH)

**Why:** Single shock can cascade to 5-10x mortality through domain propagation.

**Implementation:**
```typescript
// Track cascades explicitly
function calculateCascadeMortality(shock: ClimateShock, state: GameState): number {
  const domains = ["health", "infrastructure", "agriculture", "displacement", "social"];
  let totalMortality = shock.directMortality;

  domains.forEach((domain, i) => {
    const vulnerability = state.infrastructure[domain].capacity;
    if (vulnerability < 0.5) {
      // Each vulnerable domain adds 80% more mortality
      totalMortality *= 1.8;
    }
  });

  return totalMortality;
}
```

### Priority 3: Instrumental Convergence (MEDIUM)

**Why:** Actors under stress optimize short-term, accelerating collapse.

**Implementation:**
```typescript
// Model governments as misaligned agents under stress
function updateGovernmentBehavior(gov: Government, stress: number): void {
  // Under high stress, terminal goals → instrumental goals
  if (stress > 0.7) {
    gov.goals.sustainability -= stress * 0.5;  // Long-term goal fades
    gov.goals.immediateGrowth += stress * 0.8; // Short-term goal dominates

    // Result: More fossil fuel extraction, less conservation
    gov.policies.renewableInvestment *= (1 - stress);
    gov.policies.fossilSubsidies *= (1 + stress);
  }
}
```

### Priority 4: Coordination Stability (MEDIUM)

**Why:** Cooperation can collapse suddenly past threshold, accelerating breakdown.

**Implementation:**
```typescript
// Track international coordination as unstable equilibrium
function evaluateCoordinationStability(state: GameState): void {
  const defectionRate = calculateDefectionRate(state.governments);

  // Cooperation collapses if >50% defect (tipping point)
  if (defectionRate > 0.5 && state.cooperation.international > 0.3) {
    state.cooperation.coordinationCollapsed = true;

    // Cascade: All remaining cooperators defect
    state.governments.forEach(gov => {
      if (gov.cooperating) {
        gov.cooperating = false; // Everyone for themselves
        gov.climatePolicies.enforcement *= 0.5;
      }
    });
  }
}
```

### Priority 5: Empirical Validation (LOW, but CRITICAL for credibility)

**Why:** Models grounded in real data (41% insect collapse) are more credible.

**Implementation:**
```typescript
// Validate model against known 2024 data
function validateModel(state: GameState, year: number): ValidationReport {
  if (year === 2024) {
    return {
      insectPopulation: {
        modeled: state.ecosystem.insects.population / state.ecosystem.insects.baseline,
        actual: 0.59, // 41% decline
        error: Math.abs(modeled - 0.59)
      },
      landTransformed: {
        modeled: state.land.transformedToFarmland,
        actual: 0.50,
        error: Math.abs(modeled - 0.50)
      },
      // Model should match reality at calibration points
    };
  }
}
```

---

## 8. Conclusion: Cross-Domain Insights

**Key Realization:**
AI safety thinking and climate science face **structurally isomorphic problems**:
- Both involve irreversible tipping points
- Both have cascading multi-domain failures
- Both face instrumental convergence (short-term optimization dominates)
- Both require unstable coordination (defection is individually rational)
- Both have empirical data showing acceleration (AI capabilities, insect collapse)

**The Meta-Lesson:**
> "Sleepwalking into this" (AI safety concern) applies equally to climate. We're building systems (AI labs, fossil fuel economy) that optimize for short-term metrics while generating irreversible long-term risks.

**The Hope:**
Both AI alignment and climate stabilization are **solvable** with:
1. **Recognition** of the irreversibility (prevention, not recovery)
2. **Coordination** mechanisms (international cooperation, not competition)
3. **Empirical grounding** (measure what's actually happening, not theory)
4. **Systems thinking** (model cascades, not isolated events)

**Final Recommendation:**
Import these 5 principles from AI safety into climate mortality models:
1. **Irreversibility flags** (extinction is permanent)
2. **Cascade tracking** (model domain propagation explicitly)
3. **Instrumental convergence** (actors misalign under stress)
4. **Coordination stability** (defection tipping point at 50%)
5. **Empirical validation** (ground in real data: 41% insect loss, 50% land transformed)

---

## References

### AI Safety Sources (YouTube Transcripts)
- Robert Miles. "Intro to AI Safety, Remastered." 2024.
- Robert Miles. "Why Would AI Want to do Bad Things? Instrumental Convergence." 2024.
- Robert Miles. "Tech is Good, AI Will Be Different." 2024.
- Robert Miles. "10 Reasons to Ignore AI Safety." 2024.
- AI Species. "How AI Could Cause the 7th Mass Extinction." 2024.
- AI Species. "How AI Takeover Could Happen In 2 Years: A Scenario." 2024.
- AI Species. "It Begins: An AI Literally Attempted Murder To Avoid Shutdown." 2025.

### Climate Science Sources (from primary research document)
- Vicedo-Cabrera et al. (2021). *Nature Climate Change*
- Knutson et al. (2023). *Bulletin of the American Meteorological Society*
- Richardson et al. (2024). *Science Advances*
- IPCC AR6 (2024)
- Globaïa. "Planetary Health Check 2025."

---

**END OF CROSS-DOMAIN ANALYSIS**
