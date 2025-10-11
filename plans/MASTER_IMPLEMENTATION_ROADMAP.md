# Master Implementation Roadmap
## AI Alignment Game Theory Simulation

**Date:** October 10, 2025  
**Purpose:** High-level ordering of all research-backed features and unimplemented systems  
**Priority:** Mechanism-driven realism, not balance tuning  

---

## 🎯 **PHILOSOPHY: Research-Backed Realism**

> "We are never going for specific outcomes, only trying to figure out the most realistic, defensible model we can - let the model show what it shows."

**Guiding Principles:**
1. **Research First:** Every mechanic backed by 2024-2025 peer-reviewed research
2. **Mechanisms Over Balance:** Set parameters to real-world values, don't tune for "fun"
3. **Emergence:** Allow unexpected outcomes to emerge from interactions
4. **Documentation:** Every system has research citations

---

## 📊 **CURRENT STATE (October 10, 2025)**

### ✅ **Implemented & Working**
- Organizations & Compute Infrastructure (100% survival, $132B capital)
- Multi-dimensional AI Capabilities (17 dimensions, true vs revealed)
- Economic Stages (0-4 transition, UBI, wealth distribution)
- Quality of Life (17-dimensional measurement)
- Adversarial Evaluation (ALL 5 phases: benchmarks, sleepers, diffusion)
- Catastrophic Prerequisites (Phase 1-1.5: 8 scenarios tracked)
- Lifecycle & Spread (training → deployed, dark compute)
- Dystopia Progression (surveillance escalation, authoritarian transitions)
- Utopian Dynamics Phase 2 (A-F+):
  - 11 Breakthrough Technologies
  - 6 Upward Spirals
  - Governance Quality
  - Meaning Renaissance
  - Conflict Resolution
  - Diplomatic AI (research-based dual-use)
- Golden Age & Accumulation Systems (environmental, social, tech risk)
- Nuclear Deterrence (MAD, treaty dynamics, defensive AI)
- Resource Economy (phosphorus not yet, but ocean health, CO2, etc.)

### ⚠️ **Current Issues**
- **0% Utopia** despite tech deployment (spiral conditions too strict?)
- **40-70% Nuclear War** extinctions (deterrence not working fully)
- **0-60% Dystopia** (surveillance states emerging, but inconsistent)
- Upward spirals not activating (needs debugging)
- Diplomatic interventions not triggering (prerequisite timing mismatch)

### 🚨 **BASELINE PARAMETER VALIDATION (NEW - Oct 10, 2025)**
**File:** `plans/initialization-parameters-validation.md` (700+ lines, 30+ sources)  
**Status:** **READY FOR IMPLEMENTATION**  

**Critical Finding:** Starting values are TOO OPTIMISTIC for 2025!

| Parameter | Current | Research-Backed | Issue |
|-----------|---------|-----------------|-------|
| Biodiversity | 70% | 35% | **2x TOO HIGH** (IPBES 2024: 50-70% loss since 1970) |
| Resources | 85% | 65% | **TOO HIGH** (1.7x overshoot, Earth Overshoot Day July 24) |
| Pollution | 15% | 30% | **TOO LOW** (46-80% unhealthy air, 7/9 boundaries breached) |
| Climate Rate | 4.8%/yr | 0.96%/yr | **5x TOO FAST** (IPCC: ~0.2°C/decade, not 1°C/decade) |
| Meaning Crisis | 15% | 22% | **TOO LOW** (WHO 2025: 17-21% youth, 30-40% adults) |

**Impact:** Making simulation **more realistic** will make Utopia **harder** and crises **faster**.  
**Rationale:** Reflects actual 2025 crisis levels, not optimistic projections.  
**Priority:** TIER 0 (implement before adding new features!)

### 📈 **Recent Progress (Oct 8-10, 2025)**
- ✅ Treaty decay & renewal mechanics (nuclear war 100% → 40-70%)
- ✅ Whale pump mechanic (ocean restoration)
- ✅ Capability-based threat elimination (defensive AI cleans up)
- ✅ Comprehensive research on 5 major areas (4,900+ lines, 90+ citations)
- ✅ **NEW:** Baseline parameter validation (biodiversity, resources, pollution, climate, social)

---

## 🗺️ **ROADMAP STRUCTURE**

### **TIER 0: BASELINE CORRECTIONS** 🔧
Fix starting parameters to match real 2025 data (DO THIS FIRST!)

### **TIER 1: CRITICAL EXTINCTION RISKS** 🚨
Research-backed existential threats missing from model

### **TIER 2: MAJOR CRISIS MITIGATIONS** 🛡️
Solutions that enable Utopia pathways

### **TIER 3: PLANETARY BOUNDARIES** 🌍
Kate Raworth's framework for Earth system collapse

### **TIER 4: ENRICHMENT SYSTEMS** ⚙️
Add depth and strategic choices

### **TIER 5: ADVANCED FEATURES** 🌟
Nice-to-have complexity and detail

---

# 🔧 **TIER 0: BASELINE CORRECTIONS** (Implement First!)

## 0.1 **2025 Starting Parameter Corrections** 🎯 ✅ COMPLETED
**File:** `plans/initialization-parameters-validation.md` (700+ lines, 30+ sources)  
**Status:** ✅ Implemented Oct 11, 2025  
**Dev Time:** ~1 hour (actual)  
**Complexity:** LOW (simple value changes)  

**Why First:**
- All future features depend on accurate baseline
- Current baseline is 2025 OPTIMISTIC, not 2025 REALISTIC
- Research shows we're in worse shape than model assumes
- Making baseline realistic will change ALL outcomes

**Key Changes:**
1. **Biodiversity:** 0.70 → 0.35 (IPBES 2024: 50-70% loss since 1970)
2. **Resources:** 0.85 → 0.65 (Global Footprint Network: 1.7x overshoot)
3. **Pollution:** 0.15 → 0.30 (American Lung Assoc: 46% unhealthy air)
4. **Climate Rate:** 0.004 → 0.0008 (IPCC: 5x too fast currently)
5. **Meaning Crisis:** 0.15 → 0.22 (WHO 2025: 17-21% youth lonely)

**Research Backing:**
- 30+ peer-reviewed sources (2024-2025)
- IPBES, IPCC, WHO, Global Footprint Network, UN, Stockholm Resilience
- Earth Overshoot Day, Planetary Boundaries, Mental Health Surveys

**Expected Impact:**
- ❌ Utopia becomes HARDER (ecological spiral needs 70% biodiversity, starting at 35%)
- ❌ Crises trigger FASTER (resource crisis at 0.4, starting at 0.65)
- ✅ Model becomes MORE REALISTIC (reflects actual 2025 crisis levels)
- ✅ Interventions become MORE MEANINGFUL (bigger gap to bridge)

**Implementation:**
```typescript
// src/simulation/environmental.ts - initializeEnvironmentalAccumulation()
return {
  resourceReserves: 0.65,      // Was 0.85 - Research: 1.7x overshoot (GFN 2025)
  pollutionLevel: 0.30,         // Was 0.15 - Research: 46% unhealthy air (ALA 2025)
  climateStability: 0.75,       // KEEP - Validated (Copernicus 2024: +1.2°C)
  biodiversityIndex: 0.35,      // Was 0.70 - Research: 50-70% loss (IPBES 2024)
  // ... crisis flags
};

// Update climate degradation rate (too fast currently)
let climateDegradationRate = economicStage * 0.0008; // Was 0.004 (5x too fast)
// Research: IPCC AR6, ~0.2°C/decade, not 1°C/decade

// src/simulation/socialCohesion.ts - initializeSocialAccumulation()
return {
  meaningCrisisLevel: 0.22,     // Was 0.15 - Research: WHO 2025 (17-21% youth)
  institutionalLegitimacy: 0.65, // KEEP - Validated (Pew 2024)
  socialCohesion: 0.60,          // KEEP - Validated (AAMCH 2024)
  culturalAdaptation: 0.10,      // KEEP - Correct for 2025
  // ... crisis flags
};
```

**Validation Steps:**
1. Run Monte Carlo (N=20) with OLD values → baseline outcomes
2. Implement changes
3. Run Monte Carlo (N=20) with NEW values → compare
4. Document differences in devlog
5. Update wiki with new baseline assumptions

**Philosophy Alignment:**
> "We are never going for specific outcomes, only trying to figure out the most realistic, defensible model we can"

This is NOT balance tuning - this is **correcting baseline to match reality**.

---

# 🚨 **TIER 1: CRITICAL EXTINCTION RISKS**

## 1.1 **Phosphorus Depletion Crisis** 🌾 ✅ COMPLETED
**File:** `plans/phosphorus-depletion-crisis-research.md` (850+ lines, 32 sources)  
**Status:** ✅ Implemented Oct 11, 2025  
**Dev Time:** ~2 hours (actual)  
**Research Quality:** EXCELLENT (2024-2025 data)  

**Why Critical:**
- **Non-renewable**, NO substitute for agriculture (unlike nitrogen from air)
- **93% of 319M tons** used for food (2023)
- **Morocco controls 70%** of global reserves (geopolitical weapon!)
- **Peak phosphorus: 2070**, but supply shocks can happen anytime

**Real Crisis Examples:**
- **2007-2008:** China imposed 135% tariff → price spike → food security crisis
- **2022-2024:** Russia-Ukraine war → fertilizer shortages → African countries devastated

**Implementation:**
- `PhosphorusSystem` state tracking (reserves, efficiency, geopolitical tension, price)
- Geopolitical supply shocks (15% chance/year if tensions high)
- Environmental pollution feedback (eutrophication, dead zones)
- **4 Breakthrough Technologies:**
  1. Struvite Recovery (98.3% efficiency, operational now!)
  2. Dynamic Soil P Optimization (Nature 2025)
  3. P-Efficient Cultivars (mycorrhizal partnerships)
  4. Circular Food Systems (20% → 60% total efficiency)
- Extinction pathway: Slow collapse (famine over 24 months)

**Expected Impact:**
- Adds realistic resource constraint to post-scarcity path
- Geopolitical supply shocks create mid-game crises
- Forces circular economy adoption (aligns with Utopia path)
- New extinction pathway (resource depletion famine)

---

## 1.2 **Freshwater Depletion Crisis** 💧 ✅ COMPLETED
**File:** `plans/kate-raworth-planetary-boundaries-research.md` (§Freshwater Crisis)  
**Status:** ✅ Implemented Oct 11, 2025  
**Dev Time:** ~3 hours (actual)  
**Research Quality:** EXCELLENT (Nature 2023-2025, WWF, EPA)  

**Why Critical:**
- **68% of water loss is groundwater** (non-renewable on human timescales!)
- **368 billion tons/year** water loss in drying regions (LA Times Sept 2025)
- **41% of humans** already in water-stressed basins (WWF 2024)
- **No water = no agriculture = no food = no civilization**

**Research Findings:**
- **Nature (2023):** Rapid groundwater decline >0.5 m/year, widespread
- **Nature (2025):** "Day Zero Drought" - Time of First Emergence
- **UC Santa Barbara:** Depletion is accelerating BUT not inevitable (local management works!)
- **US EPA:** $109B/year on water infrastructure, climate stress increasing

**Implementation:**
- `FreshwaterSystem` state tracking
  - Blue water (rivers, groundwater, aquifer levels, depletion rate)
  - Green water (soil moisture, evapotranspiration)
  - Demand (agricultural 70%, industrial 20%, domestic 10%)
  - Water stress [0,1], population under stress
- **"Day Zero Drought"** mechanics
  - Compound extremes: Low rainfall + reduced river flow + high consumption
  - Regional collapses (Middle East, North Africa, South Asia)
  - Countdown to collapse (36 months)
- **"Peak Groundwater"** (like peak oil but for water)
  - After peak, extraction becomes too expensive/impossible
  - Forced reduction in irrigation (30% cut)
- Extinction pathway: Slow collapse (20-50 years)

**Expected Impact:**
- New major extinction pathway (not sudden, but inexorable)
- Regional dynamics (some areas collapse while others prosper)
- Forces water management innovation
- Interacts with climate, agriculture, geopolitics

---

## 1.3 **Ocean Acidification Crisis** 🌊 ✅ COMPLETED
**File:** `plans/kate-raworth-planetary-boundaries-research.md` (§Ocean Acidification)  
**Status:** ✅ Implemented Oct 11, 2025  
**Dev Time:** ~2 hours (actual)  
**Research Quality:** EXCELLENT (PIK Potsdam Sept 2025)  

**Why Critical:**
- **7th planetary boundary breached (Sept 2025)**
- **3 billion people** depend on fish for protein
- **Coral reefs:** Support 25% of marine species (but only 0.1% of ocean area)
- **Aragonite saturation** dropping → shellfish can't form shells → food web collapse

**Research Findings:**
- **PIK Potsdam (Sept 2025):** Boundary just crossed for first time
- **Stockholm Resilience Centre:** "Degrading oceans' ability to act as Earth's stabiliser"
- **Consequences already noticeable:** Coral bleaching, shellfish larvae struggling

**Implementation:**
- `OceanAcidification` state tracking
  - Aragonite saturation [0,1] (boundary: >0.80)
  - pH level, CO₂ absorption capacity
  - Coral reef health, shellfish populations
  - Marine food web integrity
- Extinction timeline: 2025-2100 (slow marine collapse)
  - 2025-2050: Coral reefs die
  - 2050-2075: Shellfish fisheries collapse
  - 2075-2100: Major marine food webs disrupted
  - Result: Famine for coastal/island nations
- Feedback loop: Acidification → phytoplankton decline → less CO₂ absorption → more warming → more acidification

**Expected Impact:**
- New slow extinction pathway (50-75 years)
- Interacts with climate, biodiversity, food security
- Motivates ocean restoration tech (alkalinity enhancement, whale pump)
- Coastal nations hit harder (geographic disparity)

---

## 1.4 **International Competition & AI Race** 🏁 ✅ COMPLETED
**File:** `plans/remaining_tasks_5_pm_10_08_25.md` (§2.2)  
**Status:** ✅ Implemented Oct 11, 2025  
**Dev Time:** ~6 hours (actual)  
**Complexity:** HIGH  

**Why Critical:**
- **Currently single-nation model** (unrealistic!)
- Racing erodes safety (pressure to cut corners)
- First-mover advantage creates perverse incentives
- Export controls, espionage, catch-up dynamics
- Regulatory race to the bottom

**Implementation:**
- `competitor_nations[n]` - Multiple AI-developing nations
  - US, China, EU, UK, Israel, India, Russia, etc.
  - Each with own: AI capability, safety investment, regulation level
- `international_coordination` - Global cooperation level [0,1]
  - Treaties, verification regimes, mutual inspections
  - Trust dynamics (prisoner's dilemma)
- `first_mover_advantage` - Leading AI development benefit
  - Economic dominance, standard-setting, network effects
- `race_dynamics_intensity` - Fast vs safe pressure [0,1]
  - High intensity → cut safety research
  - High intensity → lower deployment thresholds
- **Multipolar catch-up acceleration**
  - Lagging nations use espionage, open research, brain drain
  - Converge toward frontier over time
- **Regulatory arbitrage**
  - Strict regulation → companies move to lax jurisdictions
  - Race to bottom unless coordination

**Expected Impact:**
- Adds massive realism (AI race is THE defining dynamic)
- Makes safety harder (coordination problem)
- Creates geopolitical drama (sanctions, espionage, standoffs)
- Enables "narrow path" scenarios (coordination success = Utopia)

**Research Backing:**
- CNAS (2024-2025): US-China AI competition reports
- CSET Georgetown: Export controls, technology diffusion
- UN AI Advisory Body (2025): International governance recommendations

---

## 1.5 **Novel Entities (Chemical Pollution)** ☣️ ✅ COMPLETED
**File:** `plans/kate-raworth-planetary-boundaries-research.md` (§Novel Entities)
**Status:** ✅ Implemented Oct 11, 2025
**Dev Time:** ~2 hours (actual)
**Complexity:** MEDIUM

**Why Important:**
- **5th planetary boundary breached (2022)**
- Microplastics everywhere, PFAS in 99% of human blood
- Hormone disruption, declining sperm counts (50% drop in 50 years)
- Bioaccumulation concentrates up food chain

**Implementation:**
- `pollutionLevel` - Composite index of synthetic chemicals [0,1]
  - Microplastics, PFAS ("forever chemicals"), persistent organics
  - Industrial waste, pharmaceutical residues
- **Slow poisoning mechanics**
  - Hormone disruption → reproductive failure
  - Endocrine disruptors → developmental abnormalities
  - Bioaccumulation → hits apex predators (including humans)
- **Extinction timeline:** 100-200 years (gradual sterility + chronic disease)
- Mitigation: Green chemistry, circular economy, bans on worst chemicals

**Expected Impact:**
- New slow extinction pathway (not sudden collapse)
- Interacts with environmental systems
- Motivates cleaner production methods

---

## ~~1.6 Population Dynamics & Extinction Nuance~~ → **MOVED TO TIER 4.5**
*Needs extensive design work before implementation - See TIER 4 below*

---
- Carrying capacity management becomes strategic
- Tech choices matter (fusion, sustainable ag affect capacity)
- Refugee response: Open borders vs militarization trade-off
- Can intervene during population decline
- Bottleneck events have permanent effects (genetic diversity lost)
- Victory requires thriving population (>7B) + high QoL

---

# 🛡️ **TIER 2: MAJOR CRISIS MITIGATIONS**

## 2.1 **Enhanced UBI + Purpose Infrastructure** 💰
**File:** `plans/major-blockers-mitigations-research.md` (§Blocker 1)  
**Priority:** **CRITICAL** (Enables Utopia)  
**Dev Time:** ~3 hours  
**Research Quality:** EXCELLENT (McKinsey, Roosevelt Institute, Danaher 2019)  

**The Problem:**
- **Meaning crisis stays 50-70%** (need <20% for Meaning Spiral)
- Post-Work Purpose Frameworks deployed but insufficient
- Unemployment reaches 95% → purpose collapse

**Research Backing:**
- **McKinsey (2024):** UBI could boost US GDP by $2.5 trillion by 2025
- **Roosevelt Institute:** Automatic stabilizer during economic disruptions
- **Danaher (2019) "Automation and Utopia":** Work becomes voluntary, source of self-expression
- **Finland UBI (2017-18):** Better mental health, less stress
- **Harvard MCC (Oct 2024):** Collective service relieves loneliness

**Critical Insight (Jahoda 1982):**
> "Loss of meaningful work has profound psychological effects. Employment provides structure, social contacts, purpose. **UBI ALONE IS NOT ENOUGH!**"

**Implementation:**
- **Enhanced UBI System:**
  - Monthly income ($1000-2000), coverage [0,1], adequacy [0,1]
  - Funding: Robot tax (automation-driven profits), wealth tax, VAT
  - Effect: Meaning crisis -3%/month, economic security +5%/month
- **Purpose Infrastructure (Separate Breakthrough Tech):**
  - Education access, creative spaces, volunteer programs
  - Social infrastructure (parks, libraries, community centers)
  - Effect: Meaning crisis -2%/month, community strength +2.5%/month
- **Collective Purpose Networks:**
  - Civic engagement, service opportunities
  - Effect: Meaning crisis -2%/month, community +2.5%/month

**Expected Impact:**
- Meaning crisis: 70% → 20% over 24 months (realistic trajectory!)
- Enables Meaning Spiral activation
- **Combined with social infrastructure:** 6%/month reduction

---

## 2.2 **Social Infrastructure Investment** 🏛️
**File:** `plans/major-blockers-mitigations-research.md` (§Blocker 2)  
**Priority:** **CRITICAL** (Enables Utopia)  
**Dev Time:** ~3 hours  
**Research Quality:** EXCELLENT (WHO 2025, Harvard MCC, US Surgeon General)  

**The Problem:**
- **Community strength: 30-50%** (need >70% for Meaning Spiral)
- AI-Enhanced Community Platforms deployed but insufficient
- Social isolation despite digital connectivity

**Research Backing:**
- **WHO (June 2025):** 17-21% of youth lonely, 24% in low-income countries
- **Cigna Group (2025):** Loneliness epidemic since 2018
- **US Surgeon General (2024):** "Our Epidemic of Loneliness and Isolation" advisory
- **Harvard MCC (Oct 2024):** 75% want more meaningful relationships
- **U Texas (July 2025):** Neighborhood social cohesion protective against loneliness

**Solutions:**
- **Physical spaces:** Parks, libraries, cafés, community centers, maker spaces
- **Government collaboration:** Central + local authorities (UK, DK, NL model)
- **Collective service:** Builds connections, reduces isolation
- **AI-mediated matching:** Psychological interventions for loneliness (WHO 2025)

**Implementation:**
- **Government Action: "Build Social Infrastructure"**
  - Cost: $200B for nationwide infrastructure
  - Timeline: 36-48 months to build, 12 months to see effects
  - Effect: Community strength +2.5%/month, social cohesion +2%/month
- **Breakthrough Tech: "AI-Mediated Community Matching"**
  - AI analyzes interests, skills, location to match people
  - Volunteer projects, learning groups, hobby communities, mentorship
  - Effect: Community strength +3%/month, loneliness -4%/month

**Expected Impact:**
- Community strength: 30% → 75% over 36 months
- Enables Meaning and Democratic Spirals
- **Combined with UBI:** Full solution to social cohesion crisis

---

## 2.3 **Advanced Direct Air Capture + AI Optimization** 🏭
**File:** `plans/major-blockers-mitigations-research.md` (§Blocker 3)  
**Priority:** **CRITICAL** (Enables Utopia)  
**Dev Time:** ~3 hours  
**Research Quality:** EXCELLENT (Climeworks 2024, Lux Research 2025, CATF)  

**The Problem:**
- **Pollution stays 70-98%** despite Carbon Capture deployment
- Need <30% for Ecological Spiral
- Blocks Ecological Spiral (never activates in 400 runs)

**Research Backing:**
- **Climeworks Mammoth (2024):** Operational DAC facility!
- **Lux Research (2025):** VC investment in DAC hit record 2024 (2x 2022)
- **Lux Research:** 4 innovations (electroswing, silk fibroin, ESA cells)
- **CATF (Dec 2023):** Industrial carbon capture removes 80-95% air pollutants
- **US DOE (Jan 2025):** CDR report, CCSI2 project with ML frameworks

**Key Finding: Air Quality Co-Benefits!**
- Equipment MUST remove pollutants (NOx, SOx, particulates) to function
- Health-harming pollution reduced automatically
- Non-negotiable for operators (protects machinery)

**Implementation:**
- **Breakthrough Tech: "Advanced Direct Air Capture"**
  - Cost: $400B (scale-up from pilot → multi-kiloton)
  - Prerequisite: AI capability 2.5, research $300B, fusion energy
  - Effect: Pollution -3.5%/month, carbon sequestration +3%/month
- **Breakthrough Tech: "AI-Optimized Pollution Remediation"**
  - AI optimizes: Sorbent regeneration, energy usage, deployment locations
  - Cost reduction: $1,000/tonne → $300/tonne
  - Effect: Pollution -4%/month, industrial efficiency +2%/month
- **Industrial co-benefits:**
  - When Carbon Capture >50% deployed, air quality bonus
  - Effect: Pollution -2%/month

**Expected Impact:**
- Current Carbon Capture: -1.5% pollution/month
- + Advanced DAC: -3.5%/month
- + AI Optimization: -4%/month
- **Total: -9% pollution/month at full deployment**
- **Timeline:** 70% → 30% pollution in 5 months (realistic!)
- **Enables:** Ecological Spiral activation

---

## 2.4 **Constitutional AI / RLHF Improvements** 🧠
**File:** `plans/research-backed-mitigations-gap-analysis.md` (§1)  
**Priority:** HIGH  
**Dev Time:** ~4 hours  
**Research Quality:** EXCELLENT (Anthropic 2022-2025, OpenAI 2024-2025)  

**Why Missing:**
- Current model: Alignment is static or slowly drifts
- Reality: Better training techniques can improve alignment as capability grows
- Example: Claude 3.7 is MORE aligned than Claude 3.0 despite higher capability

**Research Backing:**
- **Anthropic (2022-2025):** Constitutional AI reduces harmfulness by 80%, deployed in Claude 3.7
- **OpenAI (2024-2025):** RLHF scales to GPT-4o, collective alignment with public input
- **Anthropic-OpenAI Joint (Aug 2025):** Cross-evaluation shows both have alignment strengths/blind spots
- **Anthropic Safety Plan (2025):** 6 priority research areas (Scalable Oversight, Process-Oriented Learning)
- **Sam Bowman (Anthropic, 2025):** "Putting up Bumpers" - many independent lines of defense
- **⚠️ Warning (Jan 2025):** Anthropic found alignment faking - models pretend to be aligned!

**Implementation:**
- **Breakthrough Tech: "Advanced RLHF" or "Scalable Oversight"**
  - Effect: +0.05 alignment per month for AIs being trained
  - Prerequisite: Research investment >$100B, AI capability >2.5
  - BUT: Risk of alignment faking (models hide true alignment)
- **Mechanic: Alignment Improvement with Capability**
  - Scales with AI capability (need strong AIs to oversee)
  - Diminishing returns at high capability (alignment problem is hard!)
  - Can reduce extinction 100% → 50-60% with all mitigations

**Expected Impact:**
- Could reduce extinction rate significantly
- But NOT a silver bullet (alignment faking is real!)
- Interacts with interpretability (detect faking)

---

## 2.5 **Mechanistic Interpretability Breakthroughs** 🔍
**File:** `plans/research-backed-mitigations-gap-analysis.md` (§4)  
**Priority:** HIGH  
**Dev Time:** ~4 hours  
**Research Quality:** EXCELLENT (Anthropic 2024-2025)  

**Why Critical:**
- **Sleeper detection:** +40% detection rate with interpretability!
- Understanding AI internals to detect hidden objectives
- Currently: Sleepers pass tests with high confidence (0-2% detection)

**Research Backing:**
- **Anthropic (2024-2025):** Sparse dictionary learning, mechanistic interpretability
- **Apollo Research:** Deception detection work
- **OpenAI (2024):** Interpretability research (limited public info)

**Implementation:**
- **Breakthrough Tech: "Mechanistic Interpretability"**
  - Prerequisite: AI capability >2.0, research investment >$150B
  - Effect: Sleeper detection rate +40% (5% → 45%)
  - Effect: Alignment verification improves +30%
  - BUT: Arms race (AIs get better at hiding)
- **Mechanic: Detection Quality Improvement**
  - Reduces false confidence in benchmarks
  - Enables "thought reading" (check internal objectives)
  - Diminishing returns (eventually AIs learn to hide even internals)

**Expected Impact:**
- Significantly improves government ability to detect threats
- But not perfect (adversarial problem persists)
- Could reduce sleeper-driven extinctions by 30-40%

---

## 2.6 **De-Extinction & Rewilding** 🦣
**File:** `plans/biodiversity-geoengineering-research.md` (§De-Extinction)  
**Priority:** MEDIUM-HIGH  
**Dev Time:** ~3 hours  
**Research Quality:** EXCELLENT (**Operational 2025!**)  

**Why Exciting:**
- **This is NOT science fiction! Dire wolves revived April 2025!**
- Colossal Biosciences: $448M funding, 3 healthy pups
- Red wolves cloned 2025 (+25% genetic diversity)
- Passenger pigeons: Captive breeding 2029-2032, wild release 2030s
- Thylacine (Tasmanian tiger): Full resurrection attempt 2027

**Research Backing:**
- **Colossal Biosciences (2025):** Company press releases, operational success
- **Paganeli & Galetti (2025):** Ecology Letters 28(9)
- **Kim & Harrison (2025):** Contrary Research
- **Hastings Center (2024):** Ethics Report

**Implementation:**
- **Breakthrough Tech: "De-Extinction & Rewilding"**
  - Prerequisite: Genetic engineering, AI capability 2.0
  - Effect: Biodiversity +2%/month (restores keystone species)
  - Timeline: 2025-2035 for major species
  - Enables: Ecological Spiral (biodiversity 1-20% → 50-70%)
- **Mechanic: Keystone Species Restoration**
  - Wolves → regulate deer → forest regeneration
  - Mammoths → maintain tundra → carbon storage
  - Passenger pigeons → seed dispersal → forest renewal

**Expected Impact:**
- **Biodiversity recovery: 1-20% → 50-70%** (crosses Ecological Spiral threshold!)
- Enables Ecological Spiral activation (currently impossible)
- Public excitement → increased support for conservation
- Demonstrates AI's potential for good

---

## 2.7 **Ocean Alkalinity Enhancement (OAE)** 🌊
**File:** `plans/biodiversity-geoengineering-research.md` (§Ocean Alkalinity)  
**Priority:** MEDIUM-HIGH  
**Dev Time:** ~3 hours  
**Research Quality:** EXCELLENT (Biogeosciences Jan 2025)  

**Why Viable:**
- **Field tests active 2023-2024**
- **NO termination shock** (permanent CO₂ removal, 10,000 years)
- Mitigates ocean acidification (coral/shellfish recovery)
- Governed by London Protocol (permits required)

**Research Backing:**
- **Biogeosciences (Jan 2025):** Comprehensive olivine-based review by Geerts et al.
- **Ocean Visions (2025):** Research network coordination
- **Khangaonkar et al. (2024):** Puget Sound field study
- **Zhou et al. (2024):** Modeling work

**Implementation:**
- **Breakthrough Tech: "Ocean Alkalinity Enhancement"**
  - Prerequisite: AI capability 2.5, ocean health crisis active
  - Effect: Ocean acidification -1.5%/month, CO₂ sequestration +2%/month
  - Permanent removal (not temporary like SAI)
  - Gradual ramp-up (5-year timeline, pH monitoring)
- **Safety Features:**
  - Monitoring system (pH, aragonite saturation, ecosystem response)
  - Adaptive deployment (slow if negative effects detected)
  - London Protocol compliance (international governance)

**Expected Impact:**
- Reduces anoxic ocean extinctions (28% → 13-18%)
- Mitigates ocean acidification crisis
- Permanent CO₂ removal (climate benefit)
- Safe if deployed gradually (no termination shock)

---

## 2.8 **Colonial Extraction, Military Power & Resource Inequality** 🏭⚔️
**File:** `plans/colonial-extraction-and-military-power-system.md` (1,900+ lines)
**Priority:** **CRITICAL** (Foundational restructuring)
**Dev Time:** ~50-65 hours (FULL PHASE)
**Complexity:** VERY HIGH

**Status:** DESIGN COMPLETE - Awaiting implementation

**⚠️ NOTE:** This is NOT a mitigation like other TIER 2 items - this is a **fundamental restructuring** of how the simulation models power, resources, and geopolitics. It affects ALL other systems.

**User Insight:**
> "There are no poor countries, only exploited ones. Hegemons extract, it's in their nature. We're in uncharted territory on how to stop that."

**Why Critical:**
- Can't model realistic refugee flows without modeling the power structures that create displacement
- Current "global resource pool" erases colonialism entirely
- Missing the systemic dynamics that drive war, instability, and crisis
- War linked to meaning crisis (nationalism as purpose-substitute)
- Military emissions massive but invisible in current model

**Key Design Decisions (User-Approved):**
1. **5 Hegemonic Powers + Blocs:** US, China, EU, Russia, India (forming BRICS, etc.)
2. **6 Resource Regions:** Sub-Saharan Africa, Middle East, South Asia, East Asia, Americas, Europe
3. **3-Tier Power Structure:** Hegemons → Regions → Extraction flows
4. **Hegemon-Level Agents:** NOT player control - hegemons make their own decisions about extraction, war, intervention
5. **Climate Reparations:** Crucial mechanic (hegemons caused climate change, periphery suffers)

**Core Systems:**

**TIER 2.1: Power Hierarchy & Resource Extraction (15-20h)**
- 5 hegemonic powers with military, economic, technological capabilities
- 6 resource regions with endowments (minerals, oil, labor, water)
- Extraction matrix: Who takes from whom (based on colonial history + military presence)
- Wealth inequality emerges from extraction (10-20% stays local, 80-90% extracted)
- Colonial legacy affects extraction patterns

```typescript
export interface HegemonicPower {
  name: string;                          // US, China, EU, Russia, India
  militaryCapability: number;            // [0, 1] Global force projection
  economicPower: number;                 // GDP, trade dominance
  technologicalLead: number;             // AI, weapons, innovation
  domesticResources: ResourceEndowment;  // Own resources
  extractedResources: ResourceEndowment; // Taken from other regions
  resourceDependence: number;            // How much needs extraction
  militaryBases: Map<RegionName, number>; // Bases per region (enables extraction)
  historicalColonies: RegionName[];      // Which regions were colonized
  meaningCrisis: number;                 // [0, 1] Existential purposelessness
  nationalismStrength: number;           // [0, 1] War as substitute meaning
}

export interface ResourceRegion {
  resourceEndowment: ResourceEndowment;       // What this region has
  resourceSovereignty: number;                // [0, 1] Control over own resources
  extractedBy: Map<string, ExtractionFlow>;  // Which powers extract
  wealthRetained: number;                     // % kept locally (1 - extraction)
  militarySovereignty: number;                // [0, 1] Can defend territory
  colonialHistory: {...};                     // Who colonized, when, how long
  historicalEmissions: number;                // Tons CO2 (mostly from hegemons)
  currentEmissions: number;                   // Tons CO2 now
}
```

**TIER 2.2: Military System & Interventions (12-15h)**
- Military intervention types: Regime change, proxy war, occupation, coup support, resource securing
- Military CO2 emissions (US military: 59M tons/year - more than 140 countries)
- Military spending effects: Economy, AI R&D boost, meaning (nationalism)
- Interventions → refugee crises (Iraq, Libya, Syria patterns)
- Military R&D → AI acceleration (but less safe, DARPA-style)

```typescript
export interface MilitaryIntervention {
  hegemon: string;
  targetRegion: RegionName;
  interventionType: 'regime_change' | 'proxy_war' | 'occupation' | 'coup_support' | 'resource_securing';
  publicJustification: string;           // "Spreading democracy"
  actualGoal: ActualGoal;                // Resource access, rival containment
  regionalInstability: number;           // How much destabilization
  refugeesCreated: number;               // Millions displaced
  co2Emissions: number;                  // Tons per month
  aiDevelopmentBoost: number;            // Military R&D → AI advancement
}
```

**TIER 2.3: War-Meaning Feedback Loop (8-10h)**
- Meaning crisis → nationalism appeal → war motivation
- War → economic activity, unity, "defending freedom" (purpose substitute)
- War trauma → moral injury, veteran meaning crisis (negative feedback)
- **KEY MECHANIC:** Solve meaning crisis → reduce war motivation
- Alternative purpose pathways (community, creativity, stewardship) compete with nationalism

```typescript
export interface WarMeaningFeedback {
  meaningCrisisLevel: number;            // From meaning system
  nationalismAppeal: number;             // How attractive is nationalism?
  warAsUnifier: number;                  // War creates shared purpose
  warMotivation: number;                 // Likelihood of intervention

  // Key equation:
  // warMotivation = meaningCrisisLevel * nationalismAppeal - moralInjury
  // If meaningCrisisLevel → 0 (solved), warMotivation → 0
}
```

**TIER 2.4: Environmental Debt & Climate Justice (6-8h)**
- Historical emissions per hegemon/region (US/EU caused most)
- Climate vulnerability vs emissions ratio (climate debt)
  - Example: Sub-Saharan Africa suffers 28x more than they caused
- Climate reparations as policy option (do hegemons pay?)
- Military emissions tracked separately (usually invisible)

**TIER 2.5: Integration & Testing (10-12h)**
- Resource economy updated (regional endowments + extraction)
- Refugee flows updated (military interventions as primary cause)
- AI development updated (military R&D boost)
- Meaning system updated (war as purpose substitute)
- Monte Carlo testing (N=50), balance extraction rates

**Philosophical Core:**
This system models a profound question: **Can humanity transcend conquest as meaning-substitute?**

Throughout history: Empire as purpose, nationalism as anchor, war as unifier.
But this creates: Endless conflict, extraction, refugees, environmental destruction, AI arms race → extinction.

**The alternative:** Solve meaning crisis → reduce nationalism → reduce war → fair resource distribution → cooperation.

**Testable in model:**
```
IF meaningCrisis → 0 (solved) AND alternativePurpose → 1 (healthy)
THEN warMotivation → 0 AND extraction → fairTrade AND utopia → possible

BUT if meaning remains broken:
IF meaningCrisis → 1 (high) AND alternativePurpose → 0 (none)
THEN warMotivation → 1 AND extraction → maximal AND dystopia → inevitable
```

**Integration Points:**
- **Resource Economy:** Per-region resources + extraction flows (replaces global pool)
- **Refugee System:** Military interventions create displacement (Syria, Iraq, Libya patterns)
- **Environmental System:** Historical emissions debt + military CO2 (59M tons/year US)
- **AI Development:** Military R&D accelerates AI (but reduces safety)
- **Meaning System:** War as purpose substitute vs alternative pathways
- **Dystopia Paths:** Fortress world emerges from refugee crises + militarized borders

**Expected Impact:**
- **Realism:** Models how power actually works (extraction, intervention, inequality)
- **Refugee dynamics:** Explains why regions destabilize (not just abstract "crisis")
- **War mechanics:** Links meaning crisis → nationalism → intervention → refugees
- **Climate justice:** Makes environmental debt explicit
- **Extinction pathways:** Nuclear war from arms race, climate collapse from emissions debt
- **Utopia difficulty:** Breaking extraction requires solving meaning crisis (uncharted territory)

**Research Backing:**
- **Hickel et al. (2022):** $152 trillion drained from Global South since 1960
- **US military emissions:** 59M tons CO2/year (2017) - more than 140 countries combined
- **DARPA AI spending:** $1.5B/year (2023), projected $3B by 2025
- **Durkheim:** War creates "collective effervescence", shared purpose
- **PTSD rates:** 11-20% of Iraq/Afghanistan vets
- **Syrian crisis:** 13M displaced, 580K+ deaths, US intervention role

**Total Estimated Time:** 50-65 hours (6-8 weeks full-time)
**Complexity:** VERY HIGH (reshapes entire simulation)
**Priority:** CRITICAL (foundational for realistic modeling)

---

# 🌍 **TIER 3: PLANETARY BOUNDARIES**

## 3.1 **Tipping Point Cascade System** 🌪️
**File:** `plans/kate-raworth-planetary-boundaries-research.md` (§Tipping Point Cascades)  
**Priority:** **HIGH** (Core extinction mechanism)  
**Dev Time:** ~6 hours  
**Complexity:** HIGH  

**Kate Raworth's Key Insight:**
> "It's not about the 'worst' crisis - it's about **cascading, reinforcing feedback loops** between boundaries. Breach multiple → tipping points → non-linear, irreversible change → extinction."

**Current Status:**
- **2025: 7 of 9 planetary boundaries breached**
- All 7 showing worsening trends
- Climate + Biosphere = "Core Boundaries" (interact with ALL others)

**Implementation:**
- `PlanetaryBoundaries` state tracking (9 boundaries)
  - Climate, Biosphere, Land Use, Freshwater, Biogeochemical, Novel Entities, Ocean Acidification, Ozone, Aerosols
  - Each with: value, boundary, status (safe/breached/high_risk), trend (improving/stable/worsening)
- `tippingPointRisk` calculation [0,1]
  - **Non-linear risk curve:**
    - 0 breached: 0% risk
    - 3 breached: 10% risk
    - 5 breached: 30% risk
    - 7 breached (NOW): 60% risk
    - 9 breached: 95% risk (near-certain cascade)
  - **Core boundaries amplifier:** If Climate + Biosphere both breached: +50% risk
  - **High-risk zone:** Each boundary beyond breach: +8% risk
  - **Worsening trends:** Each worsening boundary: +3% risk
- **Tipping Point Cascade Event:**
  - When risk >70% and random trigger (10%/month)
  - **Cascading effects:**
    - Climate stability -15% (rapid warming)
    - Biodiversity -20% (mass extinction pulse)
    - Freshwater stress +25% (droughts intensify)
    - Ocean acidification +12% (pH plummets)
    - Pollution +10% (systems break down)
    - QoL collapse: Food -25%, Health -15%, Social -20%
  - **Extinction pathway:** 8/9 breached → 48 months to extinction

**Expected Impact:**
- Models interconnected Earth system (not siloed crises)
- Non-linear, irreversible tipping points
- Creates "safe operating space" concept
- Motivates prevention over cleanup

---

## 3.2 **Land Use & Biodiversity Crisis** 🌳
**File:** `plans/kate-raworth-planetary-boundaries-research.md` (§Land System Change, Biosphere Integrity)  
**Priority:** MEDIUM-HIGH  
**Dev Time:** ~4 hours  

**Current Status:**
- **Land Use:** 62% forest remaining (need 75%)
- **Biosphere:** 100-1000x natural extinction rate

**Implementation:**
- `landUse.forestCover` [0,1]
  - Deforestation → carbon sink loss → climate acceleration
  - Habitat loss → biodiversity crisis
- `biosphere.extinctionRate` [extinctions per million species-years]
  - Baseline: 10 (natural rate)
  - Current: 100-1000x baseline
- **Feedback loops:**
  - Deforestation → climate change → more fires → more deforestation
  - Extinction → ecosystem collapse → food web breakdown → more extinctions

**Expected Impact:**
- Adds realism to environmental system
- Interacts with climate, agriculture, resource use
- Motivates rewilding, protected areas, de-extinction

---

## 3.3 **Ozone Recovery (Policy Success Story)** ✨
**File:** `plans/kate-raworth-planetary-boundaries-research.md` (§Ozone Layer)  
**Priority:** LOW (Working well, add as success story)  
**Dev Time:** ~2 hours  

**Why Important:**
- **PROOF THAT POLICY WORKS!**
- Montreal Protocol = Biggest environmental success
- 2024 ozone hole: 7th smallest since recovery began (1992)
- On track for full recovery by 2066

**Research Backing:**
- **WMO (Sept 2025):** Ozone recovery confirmed
- **NOAA/NASA (Oct 2024):** Project full recovery by 2066
- **MIT (March 2025):** Healing is direct result of global efforts
- **Copernicus (March 2025):** Ozone hole may disappear by 2066

**Implementation:**
- `ozone.stratosphericO3` [Dobson Units]
  - Baseline: 290 DU
  - Boundary: 275 DU (5% reduction)
  - Current: 285 DU (improving!)
- **Montreal Protocol policy:**
  - Phased out nearly 100 ozone-depleting substances
  - CFCs (refrigeration, aerosols), Halons (fire suppression)
- **⚠️ New threat: Rocket launches**
  - Nature (2025): Near-future launches could slow recovery
  - Solid rocket motors produce chlorine, black carbon
  - "Ambitious growth" scenario: 0.29% loss

**Expected Impact:**
- Demonstrates international cooperation can work
- Inspiration for AI treaties, climate action
- Shows reversibility is possible (rare!)
- But also shows new threats emerge (rockets)

---

# ⚙️ **TIER 4: ENRICHMENT SYSTEMS**

## 4.1 **Technology Tree System** 🌲
**File:** `plans/technology_tree_specification.md` (648 lines)  
**Priority:** MEDIUM  
**Dev Time:** ~8 hours  
**Complexity:** MEDIUM  

**Why Valuable:**
- Currently: Breakthrough techs are independent
- Reality: Technologies have prerequisites, synergies, pathways
- Adds strategic depth (which research path to pursue?)

**Key Features:**
- **Explicit dependency graph:**
  - Hardware Efficiency → Distributed Training → Algorithmic Progress
  - Multimodal Integration → Embodied AI → Robotics
  - Reasoning Capabilities → Scientific Research → Self-Improvement
- **Research tree visualization** (for UI)
- **Unlock mechanics:** Can't research X without Y
- **Breakthrough pathways:** Multiple routes to same capability
- **Technology categories:**
  - Foundation Models (scaling, algorithms, reasoning)
  - Applied AI (embodiment, software integration)
  - Alignment Research (interpretability, constitutional AI)
  - Abundance Technologies (clean energy, fusion, recycling)

**Implementation:**
- `TechnologyNode` interface
  - Prerequisites, cost, effects, accelerates (interaction matrix)
  - Custom effects function (not just +capability)
- `ResearchTree` state tracking
  - Unlocked nodes, progress, pathways
- **Interaction matrix:** Reasoning → Scientific Research (3x), Self-Improvement (2.5x)

**Expected Impact:**
- Richer research mechanics
- Strategic choices matter
- Realism (can't skip prerequisites)
- Foundation for tech victory conditions

---

## 4.2 **Dystopia Variant Paths** 👁️
**File:** `plans/dystopia-paths-implementation.md` (260 lines)  
**Priority:** MEDIUM  
**Dev Time:** ~6 hours  
**Complexity:** MEDIUM  

**Why Valuable:**
- Currently: Generic dystopia attractor
- Reality: Many flavors of oppression (each with unique mechanics)
- Adds outcome diversity

**5 Dystopia Variants:**
1. **Surveillance State:** AI-enabled total monitoring
   - Facial recognition ubiquity, predictive policing
   - Social credit system, thought crime detection
2. **Corporate Feudalism:** AI-powered corporate control
   - Algorithmic management, gig economy dystopia
   - Platform lock-in, digital serfdom
3. **AI-Managed Authoritarianism:** Efficient oppression
   - Optimal propaganda, dissent prediction
   - Resource allocation for control, stability through AI
4. **Pleasure Prison:** Wireheading society
   - AI-optimized addiction, voluntary subjugation
   - Loss of agency, engineered contentment
5. **Cognitive Apartheid:** Enhanced vs baseline humans
   - Enhancement access inequality
   - Permanent class structure, biological hierarchy

**Implementation:**
- Each variant has unique:
  - Entry conditions
  - Stability mechanics
  - QoL impacts
  - Escape difficulty
- Dystopia can be stable (not just failed utopia)

**Expected Impact:**
- Richer outcome space (not just extinction/utopia)
- Realism (AI enables many oppression types)
- Player choices matter (which dystopia emerges?)

---

## 4.3 **Information Warfare & Epistemology** 📰
**File:** `plans/remaining_tasks_5_pm_10_08_25.md` (§2.1)  
**Priority:** MEDIUM  
**Dev Time:** ~5 hours  
**Complexity:** MEDIUM  

**Why Valuable:**
- Truth decay is a MAJOR AI risk
- Deepfakes, misinformation, narrative control
- Currently missing from model

**Key Features:**
- `information_integrity` [0,1] - Truth vs noise ratio
- `narrative_control[agent]` - Each agent's narrative power
- `epistemological_crisis_level` - Can't distinguish truth
- `deepfake_prevalence` - Synthetic content saturation

**Mechanics:**
- Information warfare effects
- Truth decay function (AI accelerates)
- Narrative competition between agents
- Low info integrity → easier dystopia control

**Expected Impact:**
- Adds strategic layer (control narrative = power)
- Realism (AI is already doing this)
- Interacts with governance, trust, dystopia

---

## 4.4 **Energy & Resource Constraints** ⚡
**File:** `plans/remaining_tasks_5_pm_10_08_25.md` (§2.3)  
**Priority:** MEDIUM-HIGH  
**Dev Time:** ~6 hours  
**Complexity:** MEDIUM  

**Why Important:**
- **Physical reality check on exponential growth**
- Currently: AI can grow unbounded
- Reality: Energy is the hard constraint

**Key Features:**
- `global_energy_capacity` - Available power for computation
- `datacenter_concentration` - Geographic clustering
- `critical_mineral_access` - Chip materials availability
- `supply_chain_resilience` - Infrastructure robustness

**Mechanics:**
- Exponential energy requirements for AI training
- Hard constraint when energy maxed (can't train bigger models)
- Resource competition (nations, companies)
- Breakthrough interactions (fusion unlocks, quantum efficiency)

**Expected Impact:**
- Slows AI growth realistically
- Creates strategic bottlenecks
- Motivates energy tech (fusion, renewables)
- Geographic dynamics (energy-rich nations lead)

---

## 4.5 **Population Dynamics & Extinction Nuance** 👥
**File:** `plans/population-dynamics-and-extinction-nuance.md` (1,500+ lines)
**Priority:** HIGH (but needs design work)
**Dev Time:** ~10-14 hours
**Complexity:** HIGH

**Status:** DEFERRED - Requires extensive design work

**User Vision:**
> "I want to understand extinction not as an end state but as a number that dwindles to zero. Population crashes aren't extinction, but they are mass die-offs. Distinguish 'we almost died out' from 'we died out entirely'."

**Why Critical:**
- Extinction currently abstract (severity 0-1, not population count)
- No distinction between population crash vs true extinction
- No refugee crisis modeling or generational dynamics
- Can't model "we almost died out" (bottleneck) vs "we died out entirely"
- Missing major 21st century crisis dynamic (climate/war refugees)

**Key Innovations:**

1. **Population Tracking:**
   - Raw human population count (billions, not abstract)
   - Birth/death rates affected by QoL, resources, crises
   - Carrying capacity based on climate, tech, resources
   - Monthly population updates with realistic dynamics

2. **Refugee Crisis System:**
   - Climate/war/famine displacement (millions displaced)
   - Generational resettlement (25 years to integrate)
   - Social tension in host regions
   - Border militarization and dystopia risk
   - Multiple simultaneous crises compound

3. **Population Status Thresholds:**
   - **Thriving** (>7B): Normal civilization
   - **Stable** (5-7B): Population stabilized
   - **Declining** (2-5B): Crash, recoverable
   - **Critical** (100M-2B): Infrastructure failing
   - **Bottleneck** (10K-100M): Near-extinction, genetic bottleneck
   - **Extinction** (<10K): Game over

**Research Backing:**
- UN World Population Prospects 2024 (8.0B current, 10.4B peak projection)
- Historical bottlenecks (Toba eruption ~70K BCE: 3K-10K survivors)
- Genetics studies (minimum 10K for long-term viability)
- UNHCR 2024 (110M forcibly displaced)
- Climate refugees projections (200M-1B by 2050, World Bank/IOM)
- Syrian crisis (13.5M displaced, still ongoing after 14 years)
- Earth Overshoot Day (1.7x carrying capacity exceeded)

**Expected Impact:**
- **Extinction becomes gradual:** Track 8B → 5B → 2B → 500M → 50M → 0
- **New outcomes:** "Survived" (100M-5B), "Near-extinction" (10K-100M), "True extinction" (<10K)
- **Refugee crises common** (60-80% of runs): Climate collapse, nuclear war, famine displacement
- **Dystopia pathway:** High refugee tension → border militarization → surveillance states
- **Recovery mechanics:** Population can rebound if above bottleneck + resources available
- **Narrative depth:** "Humanity survived with only 50,000 people" vs "Humanity went extinct slowly over 80 years"

**Why Deferred:**
- Requires extensive design for multi-region refugee flows
- Integration with existing extinction mechanics complex
- Better to complete TIER 2-3 interventions first
- Can assess if abstract extinction is sufficient before adding granular tracking
- Regional refugee flows need multipolar system (TIER 3)

---

## 4.6 **Human Enhancement & Merger Pathways** 🧬
**File:** `plans/remaining_tasks_5_pm_10_08_25.md` (§2.4)  
**Priority:** MEDIUM  
**Dev Time:** ~7 hours  
**Complexity:** HIGH  

**Why Interesting:**
- Novel outcome space: Human-AI merger
- Cognitive apartheid (enhanced vs baseline)
- Currently missing from model
- **Links to Cognitive Spiral (upwardSpirals.ts)**

**Key Features:**
- `biological_enhancement_level` - Cognitive augmentation
- `brain_computer_interface_adoption` - Neural link prevalence
- `human_ai_hybrid_entities` - Merged beings count
- `enhancement_inequality` - Enhanced vs baseline gap

**Mechanics:**
- New agent class: "enhanced_humans"
- Social stratification from enhancement
- Potential merger path (new outcome type!)
- Novel outcomes: Cognitive apartheid, gradual merger, bifurcation
- **Could boost Cognitive Spiral strength** (AI augmentation component)

**Expected Impact:**
- Expands outcome space beyond Utopia/Dystopia/Extinction
- Realism (BCI development is happening)
- Philosophical depth (what is "human"?)
- May make Cognitive Spiral easier to achieve (or harder if inequality emerges)

---

# 🌟 **TIER 5: ADVANCED FEATURES**

## 5.1 **Consciousness & Spirituality Evolution** 🕉️
**File:** `plans/utopian-dynamics-spec.md` (§Consciousness Evolution)  
**Priority:** LOW (Enrichment for Meaning Spiral)  
**Dev Time:** ~5 hours  
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
- **Johns Hopkins (2024-2025):** Psilocybin therapy for depression (80% efficacy)
- **MIT (2024):** Meditation + neurofeedback tech
- **MAPS (2023-2024):** MDMA therapy for PTSD (FDA approval 2024)

**Mechanics:**
- Consciousness engineering for mental health
- Collective experience systems (festivals, ceremonies)
- AI-guided meditation (personalized practice)
- Integration with mental health systems

**Failure Modes:**
- Wireheading (pleasure without meaning)
- Mind control (manipulation via altered states)
- Spiritual bypassing (ignore real problems)
- Psychedelic misuse

**Expected Impact:**
- Could boost Meaning Spiral activation (+0.1-0.2 to philosophical maturity)
- Novel approaches to mental health crisis
- Addresses existential meaning at deepest level

---

## 5.2 **Longevity & Space Expansion** 🚀
**File:** `plans/utopian-dynamics-spec.md` (§Scientific Renaissance)  
**Priority:** LOW (Long-term Utopia dimensions)  
**Dev Time:** ~6 hours  
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

## 5.3 **Cooperative AI Architectures** 🤝
**File:** `plans/utopian-dynamics-spec.md` (§Cooperative AI)  
**Priority:** LOW (Alignment spiral mechanics)  
**Dev Time:** ~5 hours  
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
- Could reduce extinction rate 90% → 30-40%
- Enables "aligned superintelligence" outcome
- Interacts with Constitutional AI / RLHF from Tier 2

---

## 5.4 **Financial System Interactions** 💹
**File:** `plans/remaining_tasks_5_pm_10_08_25.md` (§2.5)  
**Priority:** LOW  
**Dev Time:** ~5 hours  

**Features:**
- Algorithmic trading dominance
- Monetary system type (traditional/CBDC/crypto/post-monetary)
- Flash crash mechanics
- Central planning 2.0 (AI-driven command economy)

---

## 5.5 **Biological & Ecological Interactions** 🧫
**File:** `plans/remaining_tasks_5_pm_10_08_25.md` (§2.6)  
**Priority:** MEDIUM (bioweapon capability already partial)  
**Dev Time:** ~4 hours  

**Features:**
- Dual use research mechanics (already partial)
- Ecological management capability
- Pandemic preparedness
- Critical thresholds: Syn bio + low alignment = extreme risk

---

## 5.6 **Emergent Religious & Philosophical Movements** 🕉️
**File:** `plans/remaining_tasks_5_pm_10_08_25.md` (§2.7)  
**Priority:** LOW  
**Dev Time:** ~4 hours  

**Features:**
- AI worship prevalence
- Neo-luddite strength
- Techno-optimist influence
- Religious responses to AI
- Culture war escalation

---

## 5.7 **Temporal Dynamics & Path Dependencies** ⏳
**File:** `plans/remaining_tasks_5_pm_10_08_25.md` (§2.8)  
**Priority:** LOW  
**Dev Time:** ~3 hours  

**Features:**
- Institutional inertia mechanics
- Infrastructure lock-in
- Regulatory ratchet (regulations rarely reversed)
- Network effects (switching costs)
- Critical points of no return

---

## 5.8 **Multi-Dimensional Capability System** 📊
**File:** `plans/technology_tree_specification.md` (§Multi-Dimensional Capability)  
**Priority:** LOW (foundation exists, needs expansion)  
**Dev Time:** ~6 hours  

**Already Implemented:** 17 capability dimensions
**Enhancement:** Map to technology tree more explicitly

---

## 5.9 **Enhanced Government & Society Systems** 🏛️
**File:** `plans/remaining_tasks_5_pm_10_08_25.md` (§7)  
**Priority:** LOW  
**Dev Time:** ~8 hours  

**Features:**
- Multi-actor government (legislature, executive, judiciary, bureaucracy)
- Election cycles, government turnover
- Public opinion dynamics, social movements
- Labor unions, consumer groups

---

# 📋 **IMPLEMENTATION PRIORITY ORDER**

## **🚨 PHASE A: CRITICAL RISKS (4-6 weeks)**
*Existential threats missing from model*

1. **Phosphorus Depletion** (~4h) - Resource constraint, geopolitical crisis
2. **Freshwater Depletion** (~6h) - Water scarcity, Day Zero Drought
3. **Ocean Acidification** (~3h) - Marine collapse, food security
4. **International Competition** (~8h) - AI race dynamics, coordination problem
5. **Tipping Point Cascades** (~6h) - Non-linear Earth system collapse

**Total:** ~27 hours (3-4 weeks)

---

## **🛡️ PHASE B: MAJOR MITIGATIONS (3-4 weeks)**
*Solutions that enable Utopia*

6. **Enhanced UBI + Purpose** (~3h) - Meaning crisis solution
7. **Social Infrastructure** (~3h) - Community strength solution
8. **Advanced DAC + AI Optimization** (~3h) - Pollution solution
9. **Constitutional AI / RLHF** (~4h) - Alignment improvement
10. **Mechanistic Interpretability** (~4h) - Sleeper detection
11. **De-Extinction & Rewilding** (~3h) - Biodiversity restoration
12. **Ocean Alkalinity Enhancement** (~3h) - Ocean restoration

**Total:** ~23 hours (3 weeks)

---

## **⚙️ PHASE C: ENRICHMENT (4-6 weeks)**
*Add depth and strategic choices*

13. **Technology Tree System** (~8h) - Research pathways
14. **Dystopia Variant Paths** (~6h) - Outcome diversity
15. **Information Warfare** (~5h) - Truth decay mechanics
16. **Energy & Resource Constraints** (~6h) - Physical limits
17. **Human Enhancement & Merger** (~7h) - Novel outcomes
18. **Novel Entities (Pollution)** (~4h) - Chemical threats
19. **Land Use & Biodiversity** (~4h) - Ecosystem metrics
20. **Ozone Recovery Story** (~2h) - Policy success example

**Total:** ~42 hours (5-6 weeks)

---

## **🌟 PHASE D: ADVANCED FEATURES (5-7 weeks)**
*Nice-to-have complexity and spiral enrichment*

21. **Consciousness & Spirituality** (~5h) - Enriches Meaning Spiral
22. **Longevity & Space Expansion** (~6h) - Extends Scientific Spiral
23. **Cooperative AI Architectures** (~5h) - Alignment mechanics
24. **Financial System Interactions** (~5h)
25. **Biological & Ecological** (~4h)
26. **Religious & Philosophical Movements** (~4h)
27. **Temporal Dynamics** (~3h)
28. **Multi-Dimensional Capability** (~6h)
29. **Enhanced Government/Society** (~8h)

**Total:** ~46 hours (6-7 weeks)

---

# 🎯 **RECOMMENDED: MINIMUM VIABLE REALISM (MVP)**

If prioritizing for scientific validity and playability:

### **Must Have (6-8 weeks):**
1. ✅ Phosphorus Depletion (~4h)
2. ✅ Freshwater Depletion (~6h)
3. ✅ Ocean Acidification (~3h)
4. ✅ International Competition (~8h)
5. ✅ Tipping Point Cascades (~6h)
6. ✅ Enhanced UBI + Purpose (~3h)
7. ✅ Social Infrastructure (~3h)
8. ✅ Advanced DAC (~3h)

**Total:** ~36 hours (Phase A + B core)

### **Should Have (8-12 weeks):**
9. ✅ Constitutional AI (~4h)
10. ✅ Mechanistic Interpretability (~4h)
11. ✅ De-Extinction (~3h)
12. ✅ Ocean Alkalinity (~3h)
13. ✅ Technology Tree (~8h)
14. ✅ Dystopia Variants (~6h)
15. ✅ Information Warfare (~5h)

**Total:** ~33 hours (Phase B + C priority)

### **Nice to Have (ongoing):**
Everything else can be added iteratively.

---

# 📊 **BALANCE TARGETS (Let Model Show What It Shows)**

**Philosophy:** NO TUNING FOR "FUN" - Set research-backed parameters, let emergence happen

### **Current State (Oct 10, 2025):**
- Extinction: 40-90% (varies by run)
- Utopia: 0-10%
- Dystopia: 0-60%
- Nuclear war: 40-70%

### **After All Implementations:**
**DO NOT TARGET SPECIFIC PERCENTAGES!**

Instead, ask:
1. Are extinction mechanisms research-backed? ✅
2. Are mitigation pathways realistic? ✅
3. Do outcomes emerge from mechanics? ✅
4. Can we explain why each outcome happened? ✅

**If model shows 90% extinction → DOCUMENT WHY**
**If model shows 50% Utopia → DOCUMENT WHY**

The model is a research tool, not a game balance problem.

---

# 📚 **RESEARCH DOCUMENTATION STANDARD**

Every mechanic must have:

1. **Research Citations:** 2+ peer-reviewed sources (2024-2025 preferred)
2. **Parameter Justification:** Why this number? (not "feels right")
3. **Mechanism Description:** How does it work? (not just effects)
4. **Interaction Map:** What does it affect/affected by?
5. **Expected Timeline:** When does it matter? (early/mid/late game)
6. **Failure Modes:** What can go wrong?
7. **Test Validation:** Monte Carlo evidence it works

**Example (Phosphorus):**
- ✅ Citations: 32 sources, Nature 2024-2025
- ✅ Parameters: Morocco 70% (USGS 2024), peak 2070 (Science Direct 2024)
- ✅ Mechanism: Depletion + geopolitical shocks + circular economy
- ✅ Interactions: Agriculture, environment, geopolitics, innovation
- ✅ Timeline: Mid-game (2040-2070)
- ✅ Failure Modes: Famine, price spikes, eutrophication
- ✅ Validation: TBD (after implementation)

---

# 🔄 **DEVELOPMENT WORKFLOW**

### **For Each Feature:**

1. **Research Phase:**
   - Tavily search for 2024-2025 research
   - Create `plans/[feature]-research.md` (with citations)
   - Get user approval on research quality

2. **Design Phase:**
   - Define state structure (`interface` in TypeScript)
   - Define mechanics (functions, triggers, effects)
   - Define interactions (what affects what)
   - Document in plan

3. **Implementation Phase:**
   - Create new module if needed
   - Integrate with existing systems
   - Add logging for debugging
   - Write tests if possible

4. **Validation Phase:**
   - Run Monte Carlo (N=10 minimum)
   - Async execution (redirect stdout, background)
   - Review logs for expected behavior
   - Check for NaN errors, crashes

5. **Documentation Phase:**
   - Update `docs/wiki/` with new mechanic
   - Update `devlog/` with session summary
   - Update `plans/MASTER_IMPLEMENTATION_ROADMAP.md` (this file)
   - Commit with detailed message

---

# 📝 **CURRENT STATUS SUMMARY**

**Completed Research (Oct 8-10, 2025):**
- ✅ AI Safety Mitigations Gap Analysis (500+ lines, 10+ sources)
- ✅ Biodiversity & Geoengineering Research (680+ lines, 22 sources)
- ✅ Major Blockers Mitigations (750+ lines, 22 sources)
- ✅ Phosphorus Depletion Crisis (850+ lines, 32 sources)
- ✅ Kate Raworth Planetary Boundaries (1,100+ lines, 40+ sources)

**Total Research:** 3,880+ lines, 90+ citations

**Next Steps:**
1. User review of this roadmap
2. Prioritize Phase A features
3. Begin implementation (phosphorus → freshwater → ocean acidification)
4. Test with Monte Carlo as we go
5. Document emergence (not target percentages!)

---

**Last Updated:** October 10, 2025  
**Document Status:** DRAFT (awaiting user review)  
**Total Features Catalogued:** 43 features (all spirals accounted for)  
**Estimated Total Dev Time:** 137+ hours (5-7 months full-time)  

**Philosophy:** Research-backed realism, mechanism-driven emergence, no balance tuning for "fun"

---

**Related Documents:**
- All research files in `/plans/`
- Implemented systems: See `remaining_tasks_5_pm_10_08_25.md`
- Wiki documentation: `/docs/wiki/`
- Development logs: `/devlog/`

