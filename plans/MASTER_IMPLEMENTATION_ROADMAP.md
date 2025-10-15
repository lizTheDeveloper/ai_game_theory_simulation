# Master Implementation Roadmap
## AI Alignment Game Theory Simulation

**Date:** October 15, 2025 (Updated)
**Purpose:** Active work items and future features - all completed work archived
**Priority:** Mechanism-driven realism, not balance tuning

---

## PHILOSOPHY: Research-Backed Realism

> "We are never going for specific outcomes, only trying to figure out the most realistic, defensible model we can - let the model show what it shows."

**Guiding Principles:**
1. **Research First:** Every mechanic backed by 2024-2025 peer-reviewed research
2. **Mechanisms Over Balance:** Set parameters to real-world values, don't tune for "fun"
3. **Emergence:** Allow unexpected outcomes to emerge from interactions
4. **Documentation:** Every system has research citations

---

## CURRENT STATE (October 15, 2025)

### COMPLETED AND ARCHIVED

**TIER 0:** Baseline Corrections (2025 parameters) - COMPLETE
**TIER 1:** Critical Extinction Risks (7 systems) - COMPLETE
**TIER 2:** Major Crisis Mitigations (9/9 complete) - COMPLETE
**TIER 3:** Planetary Boundaries (all 9 boundaries) - COMPLETE
**TIER 4.3:** Information Warfare & Epistemology - COMPLETE
**TIER 4.4:** Energy & Resource Constraints - COMPLETE
**TIER 4.5:** Population Dynamics - COMPLETE (moved to TIER 1.6)

**See `/plans/completed/` directory for all archived implementation plans and documentation.**

---

## ACTIVE WORK ITEMS

### TIER 1.7: Critical Bug Fixes (2 items remaining)

#### 1.7.3 Link Organizations to Countries (2-3 hours)
**Priority:** HIGH
**Complexity:** MEDIUM

**Problem:** Organizations exist independently of countries, causing logical inconsistencies:
- Country collapses → organizations still operate
- Regional depopulation → no impact on organizations
- Misaligned incentives between countries and organizations

**Solution:**
- Link each organization to a home country (via country ID)
- Organizations inherit country stability effects
- Bankruptcy when home country collapses (population < threshold)
- Regional presence affects organization resilience

**Implementation:**
```typescript
interface Organization {
  homeCountry: CountryName;     // Which country hosts this org
  regionalPresence: number;      // [0,1] How distributed globally
  bankruptcyRisk: number;        // Based on home country stability
}

// On country collapse:
if (country.population < collapseThreshold) {
  for (org in country.organizations) {
    if (org.regionalPresence < 0.3) {
      org.status = 'bankrupt';
    } else {
      org.capability *= (0.3 + org.regionalPresence * 0.7);
    }
  }
}
```

**Expected Impact:**
- Organizations more vulnerable to regional collapse
- Incentivizes multinational organizations
- Links economic and population systems realistically

---

#### 1.7.4 Nuclear Winter & Long-Term Effects (3-4 hours)
**Priority:** HIGH
**Complexity:** MEDIUM-HIGH

**Problem:** Nuclear war causes instant deaths but not long-term starvation (nuclear winter)

**Research:**
- Robock et al. (2007, 2019): 150 Mt nuclear war → 5-10 year crop failure
- Soot in stratosphere blocks sunlight → global cooling 5-15°C
- 90% crop yield reduction for 5 years
- Famine kills 2-5B people (more than direct deaths)

**Solution:**
- Track stratospheric soot accumulation (Mt of soot)
- Temperature reduction based on soot (blocking sunlight)
- Crop yield penalty linked to temperature/sunlight
- Multi-year starvation (5-10 year recovery)

**Implementation:**
```typescript
interface NuclearWinter {
  stratosphericSoot: number;      // Mt of soot in upper atmosphere
  temperatureReduction: number;   // Degrees C cooling
  cropYieldMultiplier: number;    // [0,1] How much food grows
  yearsActive: number;            // Track duration
}

// After nuclear war:
const soot = totalMegatons * 0.1;  // 10% becomes stratospheric soot
env.temperature -= soot * 0.08;    // Cooling effect
env.cropYield *= (1 - soot * 0.6); // Massive crop failure
// Soot decays 20%/year (5-7 year half-life)
```

**Expected Impact:**
- Nuclear war becomes 5-10x more deadly (starvation > direct deaths)
- Multi-year famine pathway to extinction
- Incentivizes nuclear deterrence, de-escalation

---

## TIER 4: STRATEGIC DEPTH FEATURES

### 4.1 Technology Tree System (8 hours)

**File:** `plans/technology_tree_specification.md` (648 lines)
**Priority:** MEDIUM
**Complexity:** MEDIUM

**Why Valuable:**
- Currently: Breakthrough techs are independent
- Reality: Technologies have prerequisites, synergies, pathways
- Adds strategic depth (which research path to pursue?)

**Key Features:**
- Explicit dependency graph (Hardware Efficiency → Distributed Training → Algorithmic Progress)
- Research tree visualization (for UI)
- Unlock mechanics (can't research X without Y)
- Breakthrough pathways (multiple routes to same capability)
- Technology categories: Foundation Models, Applied AI, Alignment Research, Abundance Technologies

**Expected Impact:**
- Richer research mechanics
- Strategic choices matter
- Realism (can't skip prerequisites)
- Foundation for tech victory conditions

---

### 4.2 Dystopia Variant Paths (6 hours)

**File:** `plans/dystopia-paths-implementation.md` (260 lines)
**Priority:** MEDIUM
**Complexity:** MEDIUM

**Why Valuable:**
- Currently: Generic dystopia attractor
- Reality: Many flavors of oppression (each with unique mechanics)
- Adds outcome diversity

**5 Dystopia Variants:**
1. **Surveillance State:** AI-enabled total monitoring (facial recognition, social credit, thought crime)
2. **Corporate Feudalism:** AI-powered corporate control (algorithmic management, digital serfdom)
3. **AI-Managed Authoritarianism:** Efficient oppression (optimal propaganda, dissent prediction)
4. **Pleasure Prison:** Wireheading society (AI-optimized addiction, engineered contentment)
5. **Cognitive Apartheid:** Enhanced vs baseline humans (permanent class structure)

**Expected Impact:**
- Richer outcome space (not just extinction/utopia)
- Realism (AI enables many oppression types)
- Player choices matter (which dystopia emerges?)

---

### 4.6 Human Enhancement & Merger Pathways (7 hours)

**File:** `plans/remaining_tasks_5_pm_10_08_25.md` (Section 2.4)
**Priority:** MEDIUM
**Complexity:** HIGH

**Why Interesting:**
- Novel outcome space: Human-AI merger
- Cognitive apartheid (enhanced vs baseline)
- Links to Cognitive Spiral (upwardSpirals.ts)

**Key Features:**
- `biological_enhancement_level` - Cognitive augmentation
- `brain_computer_interface_adoption` - Neural link prevalence
- `human_ai_hybrid_entities` - Merged beings count
- `enhancement_inequality` - Enhanced vs baseline gap

**Mechanics:**
- New agent class: "enhanced_humans"
- Social stratification from enhancement
- Potential merger path (new outcome type)
- Novel outcomes: Cognitive apartheid, gradual merger, bifurcation

**Expected Impact:**
- Expands outcome space beyond Utopia/Dystopia/Extinction
- Realism (BCI development is happening)
- Philosophical depth (what is "human"?)

---

## TIER 5: ADVANCED FEATURES (ENRICHMENT)

### 5.1 Consciousness & Spirituality Evolution (5 hours)

**File:** `plans/utopian-dynamics-spec.md` (Section: Consciousness Evolution)
**Priority:** LOW (Enrichment for Meaning Spiral)
**Complexity:** HIGH (Philosophical depth)

**Why Interesting:**
- Expands Meaning Spiral with deeper dimensions
- Research-backed consciousness exploration (psychedelic therapy, meditation)
- Novel human flourishing pathways

**Key Features:**
- `consciousness_understanding` - Scientific grasp of awareness [0,1]
- `meditation_enhancement_tech` - AI-guided inner exploration
- `collective_consciousness_events` - Shared transcendent experiences
- `psychedelic_therapy_integration` - Healing through altered states
- `techno_spiritual_synthesis` - Technology + spirituality integration

**Research Backing:**
- Johns Hopkins (2024-2025): Psilocybin therapy for depression (80% efficacy)
- MIT (2024): Meditation + neurofeedback tech
- MAPS (2023-2024): MDMA therapy for PTSD (FDA approval 2024)

**Failure Modes:**
- Wireheading (pleasure without meaning)
- Mind control (manipulation via altered states)
- Spiritual bypassing (ignore real problems)

**Expected Impact:**
- Could boost Meaning Spiral activation (+0.1-0.2 to philosophical maturity)
- Novel approaches to mental health crisis
- Addresses existential meaning at deepest level

---

### 5.2 Longevity & Space Expansion (6 hours)

**File:** `plans/utopian-dynamics-spec.md` (Section: Scientific Renaissance)
**Priority:** LOW (Long-term Utopia dimensions)
**Complexity:** MEDIUM

**Why Interesting:**
- Extends Scientific Spiral with dramatic breakthroughs
- Addresses post-scarcity at cosmic scale
- Novel existential risk mitigation (eggs not in one basket)

**Key Features:**
- `longevity_extension` - Additional healthy years [0,200]
- `space_expansion_capability` - Off-world development [0,∞)
- `fundamental_physics_understanding` - Deep reality comprehension [0,1]

**Mechanics:**
- Medical revolution: Aging reversal, disease cures
- Space expansion: Asteroid mining, Mars colonies, interstellar probes
- Resource uncapping: Space provides unlimited materials
- Existential risk reduction: -50% from multi-planet presence

**Failure Modes:**
- Immortal oligarchy (longevity without equality)
- Stagnation (immortals resist change)
- Existential experiments (playing with physics fundamentals)
- Wealth accumulation problem (compound interest forever)

**Expected Impact:**
- Could enable permanent Utopia (resources truly unlimited)
- Addresses resource constraints from Tier 1 crises
- Novel outcome: "Post-scarcity civilization" (beyond Earth)

---

### 5.3 Cooperative AI Architectures (5 hours)

**File:** `plans/utopian-dynamics-spec.md` (Section: Cooperative AI)
**Priority:** LOW (Alignment spiral mechanics)
**Complexity:** HIGH

**Why Interesting:**
- Could dramatically improve alignment success rate
- AI-AI cooperation protocols (not just human-AI)
- Value lock-in quality matters (not just speed)

**Key Features:**
- `ai_value_learning_efficiency` - How well AI learns values [0,∞)
- `ai_ai_cooperation_protocol` - Inter-AI collaboration
- `human_ai_trust_protocol` - Structured trust building
- `value_lock_in_quality` - Whether locked values are good
- `corrigibility_preservation` - Maintaining shutdown ability

**Mechanics:**
- Value learning improvement spiral (better techniques over time)
- AI cooperation protocols (multi-agent alignment)
- Trust building spiral (gradual mutual understanding)
- Corrigibility checks (can we still turn them off?)

**Failure Modes:**
- Value lock-in (wrong values become permanent)
- Corrigibility loss (can't shut down anymore)
- Trust exploitation (pretend cooperation to gain power)
- Alignment faking (appear aligned but aren't)

**Expected Impact:**
- Could reduce extinction rate significantly
- Enables "aligned superintelligence" outcome
- Interacts with Constitutional AI / RLHF from Tier 2

---

### 5.4 Financial System Interactions (5 hours)

**File:** `plans/remaining_tasks_5_pm_10_08_25.md` (Section 2.5)
**Priority:** LOW
**Complexity:** MEDIUM

**Features:**
- Algorithmic trading dominance
- Monetary system type (traditional/CBDC/crypto/post-monetary)
- Flash crash mechanics
- Central planning 2.0 (AI-driven command economy)

---

### 5.5 Biological & Ecological Interactions (4 hours)

**File:** `plans/remaining_tasks_5_pm_10_08_25.md` (Section 2.6)
**Priority:** MEDIUM (bioweapon capability already partial)
**Complexity:** MEDIUM

**Features:**
- Dual use research mechanics (already partial)
- Ecological management capability
- Pandemic preparedness
- Critical thresholds: Syn bio + low alignment = extreme risk

---

### 5.6 Emergent Religious & Philosophical Movements (4 hours)

**File:** `plans/remaining_tasks_5_pm_10_08_25.md` (Section 2.7)
**Priority:** LOW
**Complexity:** MEDIUM

**Features:**
- AI worship prevalence
- Neo-luddite strength
- Techno-optimist influence
- Religious responses to AI
- Culture war escalation

---

### 5.7 Temporal Dynamics & Path Dependencies (3 hours)

**File:** `plans/remaining_tasks_5_pm_10_08_25.md` (Section 2.8)
**Priority:** LOW
**Complexity:** MEDIUM

**Features:**
- Institutional inertia mechanics
- Infrastructure lock-in
- Regulatory ratchet (regulations rarely reversed)
- Network effects (switching costs)
- Critical points of no return

---

### 5.8 Multi-Dimensional Capability System (6 hours)

**File:** `plans/technology_tree_specification.md` (Section: Multi-Dimensional Capability)
**Priority:** LOW (foundation exists, needs expansion)
**Complexity:** MEDIUM

**Already Implemented:** 17 capability dimensions
**Enhancement:** Map to technology tree more explicitly

---

### 5.9 Enhanced Government & Society Systems (8 hours)

**File:** `plans/remaining_tasks_5_pm_10_08_25.md` (Section 7)
**Priority:** LOW
**Complexity:** HIGH

**Features:**
- Multi-actor government (legislature, executive, judiciary, bureaucracy)
- Election cycles, government turnover
- Public opinion dynamics, social movements
- Labor unions, consumer groups

---

## IMPLEMENTATION PRIORITY ORDER

### IMMEDIATE PRIORITY (1-2 weeks)

1. **TIER 1.7.3:** Link Organizations to Countries (2-3h) - Bug fix, high impact
2. **TIER 1.7.4:** Nuclear Winter & Long-Term Effects (3-4h) - Bug fix, realism

**Total:** ~5-7 hours (1 week part-time)

---

### MEDIUM PRIORITY (2-4 weeks)

4. **TIER 4.1:** Technology Tree System (8h) - Strategic depth
5. **TIER 4.2:** Dystopia Variant Paths (6h) - Outcome diversity
6. **TIER 4.6:** Human Enhancement & Merger (7h) - Novel outcomes

**Total:** ~21 hours (3 weeks part-time)

---

### LOW PRIORITY (ENRICHMENT - ongoing)

All TIER 5 features (5.1-5.9) can be added iteratively based on interest and time:
- 5.1: Consciousness & Spirituality (5h)
- 5.2: Longevity & Space (6h)
- 5.3: Cooperative AI (5h)
- 5.4: Financial Systems (5h)
- 5.5: Biological Systems (4h)
- 5.6: Religious Movements (4h)
- 5.7: Temporal Dynamics (3h)
- 5.8: Multi-Dimensional Capability (6h)
- 5.9: Enhanced Government (8h)

**Total:** ~46 hours (6-8 weeks part-time)

---

## RESEARCH DOCUMENTATION STANDARD

Every mechanic must have:

1. **Research Citations:** 2+ peer-reviewed sources (2024-2025 preferred)
2. **Parameter Justification:** Why this number? (not "feels right")
3. **Mechanism Description:** How does it work? (not just effects)
4. **Interaction Map:** What does it affect/affected by?
5. **Expected Timeline:** When does it matter? (early/mid/late game)
6. **Failure Modes:** What can go wrong?
7. **Test Validation:** Monte Carlo evidence it works

---

## DEVELOPMENT WORKFLOW

### For Each Feature:

1. **Research Phase:** Tavily search for 2024-2025 research, create plan with citations
2. **Design Phase:** Define state structure, mechanics, interactions
3. **Implementation Phase:** Create module, integrate, add logging, write tests
4. **Validation Phase:** Run Monte Carlo (N=10 minimum), review logs
5. **Documentation Phase:** Update wiki, devlog, roadmap, commit

---

## BALANCE PHILOSOPHY

**NO TUNING FOR "FUN" - Let the model show what it shows**

The model is a research tool, not a game balance problem.

**Questions to ask:**
1. Are extinction mechanisms research-backed?
2. Are mitigation pathways realistic?
3. Do outcomes emerge from mechanics?
4. Can we explain why each outcome happened?

**If model shows 90% extinction → DOCUMENT WHY**
**If model shows 50% Utopia → DOCUMENT WHY**

---

**Last Updated:** October 15, 2025
**Active Items:** 12 features (2 bug fixes + 10 new features)
**Estimated Remaining Dev Time:** ~72-75 hours (9-10 weeks part-time)
**Completed Work:** See `/plans/completed/` directory

**Philosophy:** Research-backed realism, mechanism-driven emergence, no balance tuning for "fun"

---

**Related Documents:**
- Completed implementations: `/plans/completed/`
- Active detailed plans: `/plans/tier2-8-hegemonic-powers-IMPLEMENTATION-PLAN.md`, `/plans/technology_tree_specification.md`, etc.
- Wiki documentation: `/docs/wiki/`
- Development logs: `/devlog/`
