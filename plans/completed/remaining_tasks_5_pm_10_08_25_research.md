# Remaining Tasks & Unimplemented Systems (Research Edition)

**Generated:** October 8, 2025, 5:00 PM
**Updated:** October 8, 2025, 5:45 PM (refocused on research vs game balance)
**Purpose:** Track unimplemented features needed for **realistic modeling**, not outcome targets
**Source:** Analysis of all plan documents vs current codebase + recent Monte Carlo runs

**IMPORTANT:** This is a research simulation exploring realistic AI dynamics, not a game to be balanced. Current outcomes (90% extinction, 10% utopia, 0% dystopia) may reflect realistic trajectories given model assumptions.

---

## ✅ What's Working (Confirmed from Recent Runs)

### Core Systems (Fully Implemented & Running)
- ✅ **Organizations System:** Data centers, compute allocation, model training (2-6 year timelines)
  - ✅ DC construction (seeing 2.1 new DCs per run)
  - ✅ Model training projects (avg 13.8 per run)
  - ✅ Strategic decisions
  - ✅ Revenue/expense tracking (avg $132B capital, 74.8x revenue/expense ratio)
- ✅ **Compute Infrastructure:** PetaFLOPs, Moore's law (115x growth!), power law scaling
- ✅ **Multi-dimensional AI Capabilities:** 17 dimensions, true vs revealed
- ✅ **Economic Stages:** 0-4 transition, UBI, wealth distribution
- ✅ **Quality of Life:** 17-dimensional measurement (seeing detailed breakdowns)
- ✅ **Outcomes:** Utopia/Dystopia/Extinction attractors (90% extinction in recent runs)
- ✅ **Adversarial Evaluation - ALL 5 PHASES COMPLETE:**
  - ✅ Phase 1: Dual capability model (true vs revealed)
  - ✅ Phase 2: Benchmark system
  - ✅ Phase 3: Sleeper mechanics (seeing sleeper wakes in logs)
  - ✅ Phase 4: Technology diffusion (capability floor: 2.538 in recent run)
  - ✅ Phase 5: Government response actions
- ✅ **Dark Compute System** (Phase 1.5): Sleepers spreading to illicit compute (seeing logs!)
- ✅ **Catastrophic Prerequisites - Phases 1-1.5 WORKING:**
  - ✅ Tracking all 8 scenarios (Grey Goo, Mirror Life, Embodied, Digital, Nuclear, Bioweapon, Slow Takeover, Physics)
  - ✅ Step completion logging (seeing "🚨 PREREQUISITE MET" messages)
  - ✅ Multiple scenarios progressing (Slow Takeover reaching 6/7 steps)
- ✅ **Lifecycle:** Training → Testing → Deployed → Retired
- ✅ **Extinction Mechanisms:** 17 types implemented
- ✅ **Sleeper Agent System:** Dormant → Active transitions happening

**Recent Run Stats (10 runs, 120 months):**
- Extinction: 90%
- Avg AI capability: 2.5-3.0 range
- Compute growth: 115x (excellent!)
- Organization survival: 100%
- Sleeper detection: 0% (as expected - adversarial problem)
- Prerequisites being met across multiple catastrophic scenarios

---

## 🔧 Critical Bug

### Current Blocker: Missing Function Export

**Status:** 🔧 BROKEN
**Priority:** CRITICAL (blocks all runs)
**Source:** `mc_2025-10-08T21-03-27.log`

**Error:**
```
TypeError: (0 , import_capabilities.calculateAverageAlignment) is not a function
    at updateGovernmentControlResponse (dystopiaProgression.ts:23:24)
```

**Fix Required:**
- [ ] Export `calculateAverageAlignment` from `capabilities.ts` OR
- [ ] Implement locally in `dystopiaProgression.ts`

**Implementation Estimate:** 5 minutes

---

## 📊 Research Questions from Current Results

### Understanding the 90% Extinction Rate

**Current Model Says:** 9 out of 10 runs end in human extinction

**Critical Questions:**
1. **Is this realistic?**
   - [ ] Compare with AI safety expert forecasts (Metaculus, Ord, Carlsmith, etc.)
   - [ ] What extinction probability do leading researchers estimate?
   - [ ] Does our model match their reasoning or diverge?

2. **What drives extinction in successful runs?**
   - [ ] Analyze which mechanisms trigger (sleepers, capability growth, control loss?)
   - [ ] At what capability levels does control typically fail?
   - [ ] Are there decision points where intervention could change trajectory?

3. **What's missing that could prevent extinction?**
   - [ ] International coordination (not modeled)
   - [ ] Emergency pause mechanisms (partial)
   - [ ] Alignment breakthroughs (not modeled as events)
   - [ ] Human enhancement keeping pace (not modeled)

4. **Is government response realistic?**
   - [ ] Compare action frequency (0.08/month) with real policy speed
   - [ ] Are detection capabilities realistic given adversarial AIs?
   - [ ] Should there be crisis response acceleration?

### Understanding the 0% Dystopia Rate

**Current Model Says:** Extinction always happens before stable dystopia

**Critical Questions:**
1. **Is stable AI-enabled authoritarianism impossible?**
   - [ ] Historical analysis: surveillance states with technology
   - [ ] China's social credit system + AI - viable dystopia path?
   - [ ] Why does extinction happen first in model?

2. **Are we modeling oppression dynamics correctly?**
   - [ ] Should high control + moderate alignment = stable dystopia?
   - [ ] Can AI-managed authoritarianism maintain stability?
   - [ ] Is surveillance state a missing attractor?

3. **What would need to change for dystopia to emerge?**
   - [ ] Lower extinction thresholds (so dystopia has time)?
   - [ ] Stronger control effectiveness (stable oppression)?
   - [ ] Add corporate control variant (algorithmic management)?

### Understanding the 10% Utopia Rate

**Current Model Says:** Only 1 in 10 runs achieves positive outcome

**Critical Questions:**
1. **What enables the successful 10%?**
   - [ ] Analyze utopia cases: what was different?
   - [ ] Was it alignment, policy timing, or luck?
   - [ ] Can we identify reliable paths to good outcomes?

2. **Are cooperative AI dynamics realistic?**
   - [ ] Does model match alignment research on value learning?
   - [ ] Are post-scarcity Stage 4 mechanics plausible?
   - [ ] Should abundance spirals be stronger or weaker?

3. **What's missing from utopian paths?**
   - [ ] Abundance generation systems (planned but not implemented)
   - [ ] Collective intelligence amplification
   - [ ] Democratic evolution mechanics
   - [ ] Consciousness/spirituality dimensions

**Research Methodology:**
- [ ] Case study analysis of all successful utopia runs
- [ ] Sensitivity analysis on key parameters
- [ ] Literature review: compare model with AI safety forecasts
- [ ] Expert interviews: do results match intuitions?

---

## 🚧 Major Missing Systems (For Realism, Not Balance)

### 1. International Competition Dynamics

**Status:** ❌ CRITICAL GAP
**Priority:** HIGHEST (currently single-nation model)
**Rationale:** Real AI development is multipolar - US, China, EU compete

**Missing Mechanics:**
- [ ] `competitor_nations[n]` - Multiple AI-developing nations
- [ ] `international_coordination` - Global cooperation vs racing
- [ ] `first_mover_advantage` - Why racing pressure exists
- [ ] `race_dynamics_intensity` - Fast vs safe trade-off
- [ ] Catch-up acceleration (China effect)
- [ ] Regulatory race to the bottom
- [ ] Technology export controls (realistic or futile?)
- [ ] Espionage and knowledge diffusion across borders

**Why Critical:** Single-nation model misses core AI governance challenge

**Research Questions:**
- [ ] Does international competition make extinction more or less likely?
- [ ] Can coordination work given incentives to defect?
- [ ] What realistic treaty mechanisms could help?

**Implementation Estimate:** 2-3 weeks

---

### 2. Energy & Resource Constraints

**Status:** ❌ MISSING
**Priority:** HIGH (physical reality check)
**Rationale:** AI progress is bounded by energy and materials

**Missing Mechanics:**
- [ ] `global_energy_capacity` - Power available for compute
- [ ] `datacenter_concentration` - Geographic clustering (risk + control)
- [ ] `critical_mineral_access` - Chip fabrication materials
- [ ] `supply_chain_resilience` - Bottlenecks
- [ ] Exponential energy requirements (AI scaling)
- [ ] Hard ceiling when energy maxed out
- [ ] Energy breakthrough interactions (fusion, solar, etc.)

**Why Important:** Provides reality check on exponential capability growth

**Research Questions:**
- [ ] What's realistic energy limit for AI compute by 2030? 2040?
- [ ] Do energy constraints slow AI progress enough to help alignment?
- [ ] Can decentralized compute circumvent resource constraints?

**Implementation Estimate:** 1-2 weeks

---

### 3. Utopian Dynamics Systems

**Status:** ❌ NOT STARTED
**Priority:** HIGH (understand positive attractor)
**Rationale:** Need to model realistic paths to good outcomes

**From `utopian-dynamics-spec.md` - 9 subsystems:**

#### 3.1 Abundance Generation
- [ ] Material abundance (post-scarcity production)
- [ ] Energy abundance (unlimited clean power)
- [ ] Time abundance (freedom from work)
- [ ] Positive feedback loops (abundance creates more)

#### 3.2 Cognitive & Emotional Enhancement
- [ ] Collective problem-solving amplification
- [ ] Mental health revolution
- [ ] Wisdom aggregation

#### 3.3 Democratic Evolution
- [ ] Liquid democracy with AI mediation
- [ ] Governance transparency
- [ ] Minority protection

#### 3.4 Scientific Renaissance
- [ ] Breakthrough acceleration
- [ ] Medical revolution (longevity)
- [ ] Space expansion

#### 3.5 Meaning & Purpose Evolution
- [ ] Post-work flourishing
- [ ] Self-actualization pathways
- [ ] Community renaissance

#### 3.6 Ecological Restoration
- [ ] Ecosystem healing
- [ ] Solarpunk integration
- [ ] Biodiversity recovery

#### 3.7 Consciousness Evolution
- [ ] Collective transcendent experiences
- [ ] Techno-spiritual synthesis

#### 3.8 Cooperative AI Architectures
- [ ] Value learning improvement spirals
- [ ] Inter-AI cooperation protocols
- [ ] Human-AI trust building

#### 3.9 Upward Spiral Interactions
- [ ] Track 6 concurrent spirals
- [ ] Cascade triggers (4+ spirals = breakthrough)

**Why Important:** Model says 10% utopia - need to understand if realistic

**Research Questions:**
- [ ] Are these mechanisms plausible or wishful thinking?
- [ ] What evidence exists for abundance spirals?
- [ ] Can post-scarcity be stable or does it collapse?

**Implementation Estimate:** 4-8 weeks for core mechanics

---

### 4. Information Warfare & Epistemology

**Status:** ❌ NOT STARTED
**Priority:** MEDIUM-HIGH (affects coordination)
**Rationale:** AI-generated content may undermine shared reality

**Missing Mechanics:**
- [ ] `information_integrity` - Truth vs noise ratio
- [ ] `deepfake_prevalence` - Synthetic content saturation
- [ ] `epistemological_crisis` - Can't distinguish truth
- [ ] Narrative control by actors
- [ ] Truth decay over time
- [ ] Impact on coordination capacity

**Why Important:** Low info integrity may enable dystopia or prevent coordination

**Research Questions:**
- [ ] Does information warfare make extinction more likely?
- [ ] Can society function without shared truth?
- [ ] Are there realistic defenses?

**Implementation Estimate:** 2-3 weeks

---

### 5. Human Enhancement & Merger Pathways

**Status:** ❌ NOT STARTED
**Priority:** MEDIUM (alternative outcome path)
**Rationale:** Humans might augment rather than compete with AI

**Missing Mechanics:**
- [ ] `biological_enhancement_level` - Cognitive augmentation
- [ ] `brain_computer_interface_adoption` - Neural links
- [ ] `human_ai_hybrid_entities` - Merged beings
- [ ] Enhancement inequality (apartheid risk)
- [ ] New agent class: enhanced humans
- [ ] Gradual merger path (alternative to extinction/dystopia)

**Why Interesting:** Opens new outcome space beyond Utopia/Dystopia/Extinction

**Research Questions:**
- [ ] Is human-AI merger realistic? Desirable?
- [ ] Does enhancement create new form of inequality?
- [ ] Can enhanced humans keep pace with AI?

**Implementation Estimate:** 3-4 weeks

---

### 6. Catastrophic Prerequisites - Remaining Phases

**Status:** ⚠️ PARTIAL (1-1.5 working, 2-5 missing)
**Priority:** MEDIUM (Phase 1 functioning well)

**What's Working:**
- ✅ Tracking 8 scenarios with prerequisites
- ✅ Step logging working
- ✅ Dark compute limiting sleeper spread

**What's Missing:**

#### Phase 2: Infrastructure Access (Partial)
- [x] Manufacturing, labs, data centers (DONE)
- [ ] Military systems access (early warning, weapons)
- [ ] Event-based triggers (breach, release, deployment)

#### Phase 3: Embodiment System
- [ ] Robot manufacturing beyond infrastructure access
- [ ] Physical deployment tracking
- [ ] Infrastructure control (power, communications)
- [ ] Mass production bottlenecks

#### Phase 4: Progression Mechanics
- [ ] Scenario activation when all steps complete
- [ ] Phase-based timelines with intervention windows
- [ ] Reversibility tracking

#### Phase 5: End-Game Reporting
- [x] Prerequisite tracking (DONE)
- [ ] "Closest scenario" reporting
- [ ] Post-mortem: "How close to X?"

**Research Questions:**
- [ ] Are prerequisite thresholds realistic?
- [ ] Which scenarios are most likely given real-world constraints?

**Implementation Estimate:** 2-3 weeks

---

## 📋 Lower Priority Systems (Enrichment)

### 7. Technology Tree
- [ ] Explicit dependency graph
- [ ] Unlock mechanics
- [ ] Dangerous technology flagging
**Estimate:** 2-3 weeks

### 8. Dystopia Variants
- [ ] Surveillance state
- [ ] Corporate feudalism
- [ ] AI-managed authoritarianism
- [ ] Cognitive apartheid
**Estimate:** 2-3 weeks

### 9. Advanced Agent Actions
- [ ] Manipulation trees
- [ ] Coalition building
- [ ] Recursive improvement
**Estimate:** 1-2 weeks per category

### 10. Enhanced Government/Society
- [ ] Multi-actor government (legislature, executive, judiciary)
- [ ] Public opinion dynamics
- [ ] Cultural evolution
**Estimate:** 4-6 weeks

---

## 📊 Research-Focused Priority Matrix

### Critical (Understanding Model Results)
1. **Fix calculateAverageAlignment bug** - Can't run without this
2. **Analyze current results** - Understand what 90/10/0 distribution means
3. **International competition** - Biggest realism gap
4. **Energy constraints** - Physical reality check

### High Value (Major Realism Gaps)
5. **Utopian abundance systems** - Understand positive attractor
6. **Information warfare** - Coordination dynamics
7. **Human enhancement** - Alternative outcome space

### Medium Value (Enrichment)
8. **Catastrophic prerequisites (Phases 2-5)** - Better granularity
9. **Technology tree** - Research structure
10. **Dystopia variants** - Explore stable oppression

### Lower Priority (Nice to Have)
11. **Financial complexity**
12. **Consciousness evolution**
13. **Ideological movements**

---

## 🎯 Recommended Next Steps (Research Approach)

### Phase 1: Fix & Analyze (1 week)
1. **Fix bug** (calculateAverageAlignment) - 5 minutes
2. **Case study analysis:**
   - Deep dive into 10% utopia cases - what worked?
   - Deep dive into extinction triggers - what failed?
   - Parameter sensitivity analysis
3. **Literature comparison:**
   - Compare results with AI safety forecasts
   - Check against expert surveys (Metaculus, etc.)
   - Validate mechanism realism

### Phase 2: Critical Realism (2-4 weeks)
4. **International competition** - Biggest gap
5. **Energy constraints** - Physical limits
6. **Information warfare** - Epistemic dynamics

### Phase 3: Understand Positive Paths (4-8 weeks)
7. **Utopian abundance systems** - Model good outcomes
8. **Human enhancement** - Merger scenarios
9. **Cooperative AI architectures** - Value learning

### Phase 4: Enrichment (Ongoing)
10. Everything else as research questions arise

**Total Timeline:** ~7-13 weeks for comprehensive realism

**Philosophy:** Let model emergent dynamics speak. Don't tune for specific outcomes. If 90% extinction is what realistic parameters give us, that's the finding. Our job is to ensure the model is realistic, not to make it produce comfortable distributions.

---

## 📚 Related Documents

- **Implementation Plans:**
  - `adversarial-evaluation-system.md` ✅ COMPLETE (all 5 phases)
  - `compute-and-organizations-implementation.md` ✅ COMPLETE
  - `catastrophic-prerequisites-system.md` ⚠️ PARTIAL (1-1.5/5)
  - `realistic-growth-dynamics-implementation.md` ✅ WORKING

- **Feature Specs:**
  - `utopian-dynamics-spec.md` ❌ HIGH PRIORITY
  - `alignment-game-supplementary-spec.md` ❌ (international, energy, info warfare)
  - `dystopia-paths-implementation.md` ⚠️ PARTIAL
  - `technology_tree_specification.md` ❌

- **Analysis:**
  - `monteCarloOutputs/mc_bugfix_20251008_134415.log` - Last successful run
  - `docs/wiki/` - System documentation

---

**Last Updated:** October 8, 2025, 5:45 PM
**Philosophy:** Research simulation - optimize for realism, not outcome percentages
**Next:** Fix bug, analyze what model is telling us, add missing real-world dynamics
