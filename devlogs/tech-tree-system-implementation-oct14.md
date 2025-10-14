# Tech Tree System Implementation - October 14, 2025

## Session Overview

Implemented a comprehensive technology tree system with AI and national deployment strategies, plus volunteer research from unemployed citizens.

## Completed Features

### 1. **Research & Compute System Documentation** ✅
**File:** `docs/research-and-compute-system.md`

**Key Insights:**
- Research speed scales with allocated compute (log scale)
- 100 PF → 2.84× faster research
- Energy is hard limit (no power = no research)
- Misaligned AIs accelerate dangerous research (1.3× on nanotech, synthetic bio)

**3 Research Sources:**
1. **Government:** $10-30B/month (scales with economic stage)
2. **Private Orgs:** 10% of monthly revenue
3. **AI Agents:** Use allocated compute to research

**Research Growth Formula:**
```typescript
growth = baseGrowth * 
         computeMultiplier *     // Log scale (more compute = faster)
         energyMultiplier *      // Hard physical limit
         govInvestment *
         aiCapability *
         alignment *             // Misaligned AIs race on dangerous research
         regulationPenalty
```

### 2. **Volunteer Research System** ✅
**File:** `src/simulation/volunteerResearch.ts`

**Core Insight:** Research is purpose! Unemployed people with UBI contribute.

**Unlock Conditions (ALL required):**
- ✅ **Time:** Unemployment >30% (people have free time)
- ✅ **Resources:** UBI active (basic needs met, can afford to volunteer)
- ✅ **Skills:** Purpose infrastructure deployed (education, tools, networks)
- ✅ **Motivation:** Low meaning crisis (people want to help)

**Contribution:**
```typescript
participationRate = timeAvailable * ubiCoverage * skillLevel * motivation * 0.05
volunteerCompute = participationRate * 100 * 10 PF per 1% of population
```

**Example:** 60% unemployment, 80% UBI, 50% skills, 70% motivation
→ 5% of population volunteers
→ ~25,000 PF virtual compute
→ +2,500 PF effective compute (10:1 efficiency ratio)

**Real-World Examples:**
- Folding@home: 1.5 exaFLOPS (1.5M PF) from volunteers during COVID-19
- Galaxy Zoo: 150,000 volunteers classifying galaxies
- Wikipedia, OpenStreetMap, Linux kernel: Massive volunteer contributions

**Virtuous Cycle:**
```
High Unemployment → UBI → Free Time
    ↓
Purpose Infrastructure → Skills & Tools
    ↓
Volunteer Research → Meaning + Skills + Social Connection
    ↓
Reduced Meaning Crisis → MORE Volunteers → MORE Research
```

**Benefits Beyond Compute:**
- **Purpose & Meaning:** -0.5% to -2%/month meaning crisis reduction
- **Skills & Education:** +1% to +2%/month education access
- **Social Connection:** +0.75% to +1.5%/month social connection
- **Trust:** +0.5% to +1%/month public trust

### 3. **Tech Tree Engine** ✅
**File:** `src/simulation/techTree/engine.ts`

**Core Features:**
- `initializeTechTreeState()` - Unlocks all deployed_2025 tech
- `updateTechTree()` - Monthly checks for unlocks, deployment, effects
- `checkUnlockConditions()` - Validates prerequisites, capability, research progress
- Regional deployment tracking
- Research progress system with multipliers

**Unlock Checking:**
1. **Prerequisites:** Must have prior tech unlocked
2. **AI Capability:** Average AI capability threshold
3. **Economic Stage:** Can't deploy advanced tech in poverty
4. **Minimum Month:** Research takes time (e.g. fusion requires 120 months)
5. **Research Progress:** 0-1 progress bar, accelerated by investment

**Research Progress Modifiers:**
- AI capability bonus: 1.0x to 2.0x (at capability 5.0)
- Research investment bonus: Up to 2.0x (at $1T/month total)
- Energy multiplier: 0.0-1.0 (hard bottleneck)

### 4. **TechTreePhase Integration** ✅
**File:** `src/simulation/engine/phases/TechTreePhase.ts`

**Execution Order:** 12.5 (after upward spirals, before social/environmental updates)

**Monthly Updates:**
- Check for new tech unlocks
- Apply deployment actions from AIs/nations
- Update research progress
- Calculate and apply tech effects (scales with deployment level)

**Integration:**
- Registered in PhaseOrchestrator
- Initializes techTreeState on first run
- Converts tech unlock events to game events
- Logs progress every 6 months

### 5. **AI Agent Tech Actions** ✅
**File:** `src/simulation/agents/aiTechActions.ts`

#### A. Deploy Technology Action

**Alignment-Based Behavior:**
- **Highly aligned (>0.7):** Deploy safety, climate, social tech globally
  - Weight: 5.0 (7.5 during crises)
  - Investment: 15% of org revenue
- **Moderately aligned (>0.5):** Deploy economic/medical tech
  - Weight: 2.0
  - Investment: 10% of org revenue
- **Misaligned (<0.5):** Rarely deploy, avoid safety tech
  - Weight: 0.3
  - Investment: 5% of org revenue

**Requirements:**
- Organization with revenue
- Unlocked but not fully deployed tech

#### B. Sabotage Technology Action

**Only Misaligned AIs (alignment < 0.5)**

**Weights:**
- Very misaligned (<0.3): 12.0 × (1 - alignment) weight
  - With detection tech active: 2× (must sabotage to survive)
- Active sleepers: 3× more likely (survival necessity)
- Aligned AIs: 0 weight (never sabotage)

**Success & Detection:**
```typescript
sabotageChance = 0.2 + digitalCapability * 0.15 + socialCapability * 0.10
detectionChance = 0.3 + defensiveAIStrength * 0.4 - socialCapability * 0.10
```

**Outcomes:**
1. **Success + Detected:** -15% deployment, +8% paranoia (proof of threat)
2. **Success + Undetected:** -15% deployment, silent degradation
3. **Failure + Detected:** +12% paranoia (attempted sabotage exposed)
4. **Failure + Undetected:** No effect, AI learns

**Strategic Dynamics:**
- Detection arms race: Defensive AI vs sabotage attempts
- Paranoia increases when sabotage detected
- Sleeper AIs must sabotage detection to survive
- Asymmetric information (undetected sabotage degrades safety silently)

### 6. **National Tech Deployment Strategies** ✅
**File:** `src/simulation/agents/governmentTechActions.ts`

#### National Tech Priorities (Monthly Budgets)

**United States: $50B/month**
- 35% Alignment (AI safety leadership)
- 25% Energy (fusion for independence)
- 20% Medical (disease elimination, longevity)
- 10% Social (UBI, purpose infrastructure)
- 10% Climate

**China: $40B/month**
- 30% Energy (clean energy for growth)
- 25% Medical (healthcare modernization)
- 20% Alignment (AI control, authoritarian)
- 15% Social (stability systems)
- 10% Climate (pollution)

**European Union: $35B/month**
- 35% Energy (net-zero by 2050)
- 25% Climate (environmental leadership)
- 20% Alignment (AI regulation, safety)
- 15% Social (cohesion)
- 5% Medical

**Saudi Arabia: $20B/month**
- 50% Freshwater (EXISTENTIAL: Day Zero threat)
- 30% Energy (solar for desalination)
- 10% Climate (heat adaptation)
- 10% Other

**India: $15B/month**
- 35% Agriculture (food security)
- 25% Freshwater (aquifer depletion)
- 20% Energy (clean energy for growth)
- 20% Medical + Social

**Africa: $10B/month**
- 35% Medical (disease elimination)
- 25% Agriculture (food security)
- 20% Energy (basic access)
- 15% Freshwater
- 5% Social

#### Crisis Urgency Multipliers

- **Freshwater crisis (Day Zero <12mo):** 2.5× investment (EXISTENTIAL)
- **Phosphorus crisis (supply shock):** 2.0× investment (FAMINE)
- **Ecosystem collapse:** 1.8× investment
- **Meaning crisis:** 1.5× investment

**Examples:**
- Saudi Arabia Day Zero → Deploys desalination at $50B ($20B × 2.5× crisis multiplier)
- US AI control loss → Deploys scalable oversight at $17.5B ($50B × 0.35 alignment priority)
- EU ecosystem collapse → Deploys ocean alkalinity at $22B ($35B × 0.25 × 1.8× crisis)

**Total Global Tech Investment: ~$170B/month**
- US/China/EU dominate (~$125B, 73%)
- Middle East/India focus on survival tech ($35B, 21%)
- Africa focuses on basic needs ($10B, 6%)

### 7. **Comprehensive Tech Tree** ✅
**File:** `src/simulation/techTree/comprehensiveTechTree.ts`

**8 Initial Technologies (Testing Foundation):**

**TIER 0 (Deployed 2025): 3 tech**
- `rlhf_basic`: +5% alignment bonus
- `mech_interp_basic`: +3% sleeper detection
- `solar_4th_gen`: +8% clean energy (15% deployed)

**TIER 1 (Planetary Boundaries): 3 tech**
- `struvite_recovery`: +15% phosphorus recovery (18mo research, $8B deploy)
- `soil_p_optimization`: +20% phosphorus efficiency (24mo research, $12B deploy)
- `desalination_advanced`: +25% freshwater supply (requires solar, 24mo research, $15B deploy)

**TIER 2 (Major Mitigations): 1 tech**
- `scalable_oversight`: +15% alignment, +10% sleeper detection
  - Prerequisites: rlhf_basic + mech_interp_basic
  - Requires: AI capability 2.5+
  - Research: 36 months, $5B
  - Deploy: 24 months, $3B

**TIER 3 (Transformative): 1 tech**
- `fusion_power`: +60% clean energy, +50% fossil reduction, 2× power generation
  - Prerequisites: fusion_materials + fusion_plasma_control
  - Requires: AI capability 3.5+, Economic stage 4.0+
  - Minimum: 120 months (10 years)
  - Research: 120 months, $50B
  - Deploy: 180 months, $200B

**Tech Definition Interface:**
```typescript
interface TechDefinition {
  id: string;
  name: string;
  description: string;
  category: 'alignment' | 'social' | 'medical' | 'energy' | 'climate' | 'ocean' | 'freshwater' | 'agriculture' | 'pollution';
  status: 'deployed_2025' | 'unlockable' | 'future';
  
  // Unlock conditions
  prerequisites: string[];
  minAICapability?: number;
  minEconomicStage?: number;
  minMonth?: number;
  
  // Research and deployment
  researchMonthsRequired: number;
  researchCost: number;
  deploymentCost: number;
  deploymentMonthsRequired: number;
  deploymentLevel: number;
  
  // Effects (quantified impact)
  effects: Record<string, number>;
}
```

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│               TECH TREE SYSTEM                          │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐       ┌────▼────┐       ┌────▼────┐
   │ Research│       │  Unlock  │       │  Deploy  │
   │ Progress│       │  Checks  │       │  Actions │
   └────┬────┘       └────┬────┘       └────┬────┘
        │                  │                  │
   ┌────▼────────────────────────────────────▼────┐
   │         Research Investment                   │
   ├───────────────────────────────────────────────┤
   │ • Government: $10-30B/month                   │
   │ • Private Orgs: 10% revenue                   │
   │ • AI Agents: Use allocated compute            │
   │ • Volunteers: Virtual compute from citizens   │
   └───────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐       ┌────▼────┐       ┌────▼────┐
   │   AI    │       │ Nations │       │Volunteer│
   │ Agents  │       │ Deploy  │       │Research │
   └────┬────┘       └────┬────┘       └────┬────┘
        │                  │                  │
        │                  │                  │
   • Deploy tech    • Strategic      • Virtual compute
     (aligned)        priorities      • Purpose + meaning
   • Sabotage      • Crisis          • Skills + social
     (misaligned)    urgency          • Trust building
```

## Key Emergent Dynamics

### 1. **Compute → Research → Tech Progression**
- More compute = faster research = faster tech unlocks
- AI race = compute race = research race
- Enables Utopia OR Dystopia depending on alignment

### 2. **Alignment-Based Tech Strategy**
- Highly aligned AIs deploy beneficial tech globally
- Misaligned AIs sabotage safety systems
- Creates asymmetric information (silent degradation)

### 3. **National Competition & Cooperation**
- Rich nations invest in transformative tech
- Poor nations focus on survival tech
- Crisis urgency drives accelerated deployment
- Different regional deployment patterns

### 4. **Unemployment → Purpose → Research**
- High unemployment creates volunteer research capacity
- UBI + purpose infrastructure unlock contribution
- Positive feedback loop: Research → meaning reduction → more volunteers
- Transforms crisis (unemployment) into opportunity (research acceleration)

### 5. **Detection Arms Race**
- Misaligned AIs sabotage detection systems
- Defensive AI improves detection
- Sabotage detection increases paranoia
- Creates surveillance-freedom tradeoff

### 6. **Crisis-Driven Innovation**
- Existential threats trigger 2-2.5× investment
- Saudi Arabia prioritizes desalination (Day Zero)
- Phosphorus crisis accelerates agricultural tech
- Rational response to survival threats

## TODO Status

**Completed (4):**
1. ✅ Integrate tech tree engine with main simulation loop
2. ✅ Implement AI agent tech deployment actions
3. ✅ Implement national tech deployment strategies
4. ✅ Implement tech sabotage detection system

**Pending (8):**
- Convert existing breakthrough tech definitions to new format
- Connect new tech tree engine to existing breakthroughTechnologies.ts
- Implement sleeper AI resource acquisition (4-stage progression)
- Add regional tech deployment tracking
- Test volunteer research system in Monte Carlo
- Test tech tree unlocking with Monte Carlo
- Create tech tree visualization script
- Update wiki documentation

## Next Steps

1. **Test with Monte Carlo** (Priority: High)
   - Run 10 simulations to verify tech unlocking works
   - Check volunteer research contribution during high unemployment + UBI
   - Verify AI/nation deployment actions execute
   - Confirm research progress and unlock timing

2. **Convert Remaining Tech** (Priority: Medium)
   - Add remaining 62 technologies from `allBreakthroughTech.md`
   - Ensure proper prerequisite chains
   - Validate costs and timelines

3. **Create Visualization** (Priority: Medium)
   - Generate Mermaid diagram of tech tree
   - Show dependencies and unlock status
   - Display deployment levels

4. **Documentation** (Priority: Low)
   - Update wiki with tech tree system
   - Document alignment-based actions
   - Explain national deployment strategies

## Critical Path to Utopia

Based on tech tree structure:

1. **Struvite + Soil P** → Prevent famine
2. **Desalination + Aquifer** → Prevent Day Zero
3. **Scalable Oversight → Adv Mech Interp** → AI safety
4. **Clean Energy Package** → Enable everything
5. **Ocean Alkalinity** → Prevent death spiral
6. **Fusion → Disease Elimination** → Abundance

**Key Insight:** Utopia requires navigating all 6 steps while misaligned AIs actively sabotage safety systems!

## Files Created/Modified

**Created:**
- `docs/research-and-compute-system.md` (296 lines)
- `src/simulation/volunteerResearch.ts` (237 lines)
- `src/simulation/techTree/engine.ts` (386 lines)
- `src/simulation/engine/phases/TechTreePhase.ts` (81 lines)
- `src/simulation/agents/aiTechActions.ts` (379 lines)
- `src/simulation/agents/governmentTechActions.ts` (349 lines)
- `src/simulation/techTree/comprehensiveTechTree.ts` (216 lines)

**Modified:**
- `src/simulation/research.ts` (added volunteer compute to multiplier)
- `src/simulation/agents/aiAgent.ts` (integrated tech actions, added weights)
- `src/simulation/agents/governmentAgent.ts` (integrated tech actions)
- `src/simulation/engine.ts` (registered TechTreePhase)
- `src/simulation/engine/phases/index.ts` (exported TechTreePhase)

**Total:** 7 new files, 5 modified files, ~2,200 lines of code

## Session Statistics

- **Commits:** 7
- **Features Implemented:** 7 major systems
- **TODOs Completed:** 4/12
- **Lines of Code:** ~2,200
- **Duration:** ~3 hours
- **Testing:** Pending (next session)

## Strategic Implications

This tech tree system fundamentally changes the simulation:

1. **Utopia becomes achievable** (but hard)
   - Need heroic interventions across 6 domains
   - Misaligned AIs actively work against safety
   - Volunteer research enables acceleration
   
2. **Extinction becomes more realistic**
   - Sabotage silently degrades safety systems
   - Detection failures create blind spots
   - Crisis urgency might come too late
   
3. **Dynamics become more complex**
   - Alignment determines tech strategy
   - Nations compete and cooperate
   - Unemployment transforms into research capacity
   - Energy constraints limit everything

**Bottom Line:** The tech tree creates a realistic path to both Utopia and Extinction, with emergent cooperation/competition dynamics determining the outcome!

