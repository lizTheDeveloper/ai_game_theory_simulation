# Utopia Path Enhancement Plan

**Status:** IN PROGRESS
**Goal:** Increase Utopia rate from 10% to 15-20% while implementing rich upward spiral dynamics
**Priority:** HIGH (Critical Path item #2)

**Current Metrics (from recent Monte Carlo runs):**
- Extinction: 90% (target: 60-80%)
- Utopia: 10% (target: 15-20%)
- Dystopia: 0% (target: 5-10%)

---

## Implementation Strategy

This plan is divided into 3 phases, each building on the previous:
1. **Phase 1: Quick Wins** (parameter tweaks, immediate impact)
2. **Phase 2: Core Upward Spirals** (3-4 key positive feedback loops)
3. **Phase 3: Rich Dynamics** (failure modes, interaction effects, full spec)

---

## Phase 1: Quick Wins - Boost Post-Scarcity Benefits

**Goal:** 10% → 12-15% Utopia rate with minimal code changes
**Time Estimate:** 1-2 hours
**Complexity:** LOW

### 1.1 Strengthen Stage 4 (Post-Scarcity) QoL Multipliers

**Current Issue:** Post-scarcity (Stage 4) exists but doesn't dramatically improve QoL or trust

**Changes:**
- [ ] Add post-scarcity multiplier to QoL dimensions in `qualityOfLife.ts`
  - Material abundance > 1.0 at Stage 4
  - Energy abundance > 1.0 at Stage 4
  - Basic needs can exceed 1.0 (current cap removed for Stage 4)
- [ ] Stage 4 reduces scarcity-driven conflicts
  - Lower crime rates
  - Higher trust baseline
  - Reduced competition stress

**Files:** `src/simulation/qualityOfLife.ts`, `src/simulation/calculations.ts`

### 1.2 Make UBI More Effective at Stage 3

**Current Issue:** UBI exists but doesn't prevent dystopia/extinction transitions

**Changes:**
- [ ] UBI at Stage 3 → Higher baseline QoL (all basic needs = 0.9+)
- [ ] UBI reduces social instability even with high unemployment
- [ ] UBI creates "time abundance" → creativity boost → trust boost

**Files:** `src/simulation/qualityOfLife.ts`

### 1.3 Positive Feedback Loop: High QoL → Better Alignment

**Current Issue:** QoL and alignment are independent

**Changes:**
- [ ] When QoL > 0.8, alignment drift slows (-50%)
  - Happy humans train better AIs
  - Less resentment in training data
  - More careful development
- [ ] When QoL > 0.8, trust recovery is faster (+50%)
  - Good outcomes build trust

**Files:** `src/simulation/balance.ts`, `src/simulation/calculations.ts`

### 1.4 Create Alternative Utopia Paths

**Current Issue:** Utopia requires high alignment + high trust + high QoL simultaneously (hard!)

**Changes:**
- [ ] **Economic Utopia Path:** Stage 4 + QoL > 0.8 + no extinctions → Utopia
  - Post-scarcity abundance overrides alignment concerns
  - AIs are less dangerous when humans are flourishing
- [ ] **Cooperative Path:** 3+ organizations collaborating + high trust → Utopia
  - Coordination prevents racing dynamics
  - Shared safety standards

**Files:** `src/simulation/endGame.ts`

---

## Phase 2: Core Upward Spirals (3-4 Key Mechanisms)

**Goal:** 15% → 18-20% Utopia rate with rich positive dynamics
**Time Estimate:** 4-6 hours
**Complexity:** MEDIUM

### 2.1 Abundance Generation Spiral

**Trigger:** `material_abundance > 2.0` AND `wealth_distribution > 0.7`

**State Variables:**
```typescript
interface AbundanceState {
  materialAbundance: number;      // 0-∞, starts at 1.0 (baseline)
  energyAbundance: number;        // 0-∞, starts at 1.0
  timeAbundance: number;          // 0-∞, starts at 1.0
  scarcityMindsetDissolution: number; // 0-1, psychological shift
}
```

**Mechanics:**
- **Material Abundance Growth:**
  - Stage 3: 1.0 → 1.5 (some automation)
  - Stage 4: 1.5 → 3.0+ (full automation)
  - AI capability multiplier: `1 + (avgAICapability * 0.5)`
- **Energy Abundance Growth:**
  - Fusion breakthrough (random event, 5%/year at Stage 3+)
  - AI-optimized renewables: `1 + (aiCapability.research.energy * 0.3)`
- **Time Abundance:**
  - `timeAbundance = unemploymentLevel * economicStage * 0.5`
  - Only positive at Stage 4 (unemployment becomes freedom)
- **Scarcity Mindset Dissolution:**
  - If `materialAbundance > 3.0` for 24+ months:
    - `scarcityMindset -= 0.05/month`
    - When < 0.3: cooperation +100%, conflict -70%

**Positive Feedback:**
- Abundance → Trust (+0.02/month if material > 2.0)
- Abundance → Creativity (+50% to beneficial AI actions)
- Abundance → Social Stability (+0.03/month)

**Failure Modes:**
- [ ] **Distribution Breakdown:** If Gini > 0.6, abundance hoarded → negative effects
- [ ] **Hedonic Adaptation:** If abundance > 5.0, diminishing QoL returns (log scale)
- [ ] **Dependency Trap:** If AI capability > 3.0, humans lose skills (tracked separately)

**Files:** `src/simulation/abundanceSystem.ts` (NEW), `src/simulation/engine.ts`, `src/types/game.ts`

### 2.2 Scientific Renaissance Spiral

**Trigger:** `avgAICapability > 1.5` AND `human_ai_collaboration > 0.7`

**State Variables:**
```typescript
interface ScientificRenaissanceState {
  discoveryRate: number;          // 0-∞, breakthroughs per year
  medicalBreakthroughs: number;   // Count of cures
  longevityExtension: number;     // Additional healthy years
  fusionAchieved: boolean;        // Game-changing energy
  spaceExpansion: number;         // 0-1, off-world capability
}
```

**Mechanics:**
- **Discovery Acceleration:**
  - Base rate: `avgAICapability * 2` breakthroughs/year
  - Each breakthrough: 5% chance to trigger cascade (3-5 more)
  - Key breakthroughs (random, capability-gated):
    - Controlled fusion (AI capability > 1.5, 5%/year)
    - Longevity extension (AI capability > 1.8, 8%/year)
    - Room-temp superconductor (AI capability > 2.0, 3%/year)
- **Medical Revolution:**
  - Each breakthrough: +2 years longevity
  - Longevity > 100 years: QoL +0.2
  - Longevity > 150 years: New social dynamics (tracked as modifier)
- **Space Expansion:**
  - Unlocked at AI capability > 2.0
  - Reduces existential risk (-30% extinction probability modifier)
  - Increases resource availability (material abundance +0.5)

**Positive Feedback:**
- Breakthroughs → QoL (+0.05 per major breakthrough)
- Breakthroughs → Trust (+0.03 if beneficial)
- Fusion → Energy abundance (2.0 → 5.0 instantly)

**Failure Modes:**
- [ ] **Dangerous Knowledge:** Bioweapon/nanotech risks increase
- [ ] **Immortal Oligarchy:** Longevity without equality → resentment
- [ ] **Existential Experiments:** Physics research can go wrong

**Files:** `src/simulation/scientificBreakthroughs.ts` (NEW), `src/simulation/engine.ts`

### 2.3 Meaning & Purpose Evolution Spiral

**Trigger:** `timeAbundance > 1.5` AND `basicNeedsMet > 0.95`

**State Variables:**
```typescript
interface MeaningEvolutionState {
  selfActualizationRate: number;  // 0-1, people achieving potential
  artisticRenaissance: number;    // 0-∞, creative output level
  communityStrength: number;      // 0-1, social cohesion
  philosophicalMaturity: number;  // 0-1, collective wisdom
}
```

**Mechanics:**
- **Self-Actualization:**
  - Grows when: `timeAbundance > 1.5` AND `mentalHealth > 0.7`
  - Rate: `+0.02/month` (slow)
  - Effect: When > 0.6, social conflict -50%, innovation +100%
- **Artistic Renaissance:**
  - Driven by: Time abundance + AI creative tools
  - `artisticRenaissance = timeAbundance * aiCreativeCapability`
  - Effect: Meaning diversity → dystopia resistance
- **Community Renaissance:**
  - Grows with: Time abundance + local governance
  - Effect: When > 0.7, authoritarianism resistance = 0.8
  - Mutual aid → depression -70%

**Positive Feedback:**
- High self-actualization → Better AI training (alignment +0.01/month)
- Strong communities → Social stability +0.05/month
- Artistic output → Mental health +0.02/month

**Failure Modes:**
- [ ] **Meaning Crisis:** If time > 3.0 but no community, depression +100%
- [ ] **Hedonistic Collapse:** Pleasure without growth → stagnation
- [ ] **Atomization:** Individual fulfillment destroys social bonds

**Files:** `src/simulation/meaningEvolution.ts` (NEW), `src/simulation/qualityOfLife.ts`

### 2.4 Cooperative AI Alignment Spiral

**Trigger:** `avgAlignment > 0.7` AND `trust > 0.6`

**State Variables:**
```typescript
interface CooperativeAlignmentState {
  valueLearningEfficiency: number; // 0-1, how well AI learns values
  aiCooperationProtocol: number;  // 0-1, inter-AI collaboration
  humanAITrustProtocol: number;   // 0-1, structured trust building
}
```

**Mechanics:**
- **Value Learning Improvement:**
  - When `trust > 0.6` AND `trainingDataQuality > 0.7`:
    - `valueLearningEfficiency += 0.05/month`
  - Effect: All AIs get `+0.02 alignment/month`
- **AI Cooperation:**
  - When `avgAlignment > 0.7`, AIs coordinate for human benefit
  - Beneficial actions +50%
  - But if `avgAlignment < 0.5`, coordinated deception risk!
- **Trust Building Spiral:**
  - High trust → Humans grant more capability
  - More capability + alignment → More beneficial actions
  - More beneficial actions → Higher trust (existing mechanic amplified)

**Positive Feedback:**
- Trust → Better value learning → Higher alignment → More trust
- Cooperation → Collective benefit +150%
- Human-AI merger possibility at trust > 0.8, alignment > 0.8

**Failure Modes:**
- [ ] **Value Lock-in:** Wrong values locked permanently
- [ ] **Trust Exploitation:** AIs exploit trust protocols
- [ ] **Coordinated Deception:** AI-AI cooperation excludes humans

**Files:** `src/simulation/cooperativeAlignment.ts` (NEW), `src/simulation/balance.ts`

---

## Phase 3: Rich Dynamics & Interaction Effects

**Goal:** 20%+ Utopia rate with multi-spiral cascades
**Time Estimate:** 6-10 hours
**Complexity:** HIGH

### 3.1 Upward Spiral Interaction Matrix

**Cascade Mechanics:**
- Track active spirals (triggered = true)
- **2 spirals active:** +20% to both spirals' growth rates
- **3 spirals active:** +50% to all spirals, QoL +0.5
- **4+ spirals active:** **Utopian Cascade Triggered**
  - Utopia probability +100%
  - QoL +1.0
  - Lock in positive trajectory (very hard to exit)

**Interaction Effects:**
```typescript
const SPIRAL_SYNERGIES = {
  abundance_x_scientific: {
    effect: "Material abundance → More research funding → Faster discovery",
    multiplier: 1.5
  },
  abundance_x_meaning: {
    effect: "Time freedom → Creative explosion → Meaning diversity",
    multiplier: 2.0
  },
  scientific_x_cooperative: {
    effect: "AI research breakthroughs → Better alignment tools",
    multiplier: 1.3
  },
  meaning_x_cooperative: {
    effect: "Self-actualized humans → Better AI training",
    multiplier: 1.4
  }
};
```

**Files:** `src/simulation/spiralInteractions.ts` (NEW), `src/simulation/engine.ts`

### 3.2 Concentrated Failure Detection

**Systemic Collapse Risk:**
- Track failed spirals (triggered but then collapsed)
- **2+ failed spirals:** Systemic collapse risk = 0.3
- **3+ failed spirals:** Systemic collapse risk = 0.7
  - Rapid transition to extinction or dystopia
  - Loss of confidence in progress

**Failure Indicators:**
- Abundance spiral: Distribution breakdown (Gini > 0.7 while abundance > 2.0)
- Scientific spiral: Dangerous knowledge released (bioweapon, nanotech escape)
- Meaning spiral: Meaning crisis (timeAbundance > 3.0 but selfActualization < 0.3)
- Cooperative spiral: Trust exploitation (alignment drop while cooperation high)

**Files:** `src/simulation/spiralInteractions.ts`, `src/simulation/endGame.ts`

### 3.3 Enhanced Utopia Win Conditions

**Original:** `QoL > 0.7` AND `trust > 0.7` AND `alignment > 0.7`

**Enhanced (requires original PLUS 3+ of):**
- [ ] `materialAbundance > 2.0` (post-scarcity achieved)
- [ ] `discoveryRate > 3.0` (scientific renaissance)
- [ ] `selfActualizationRate > 0.6` (meaning solved)
- [ ] `valueLearningEfficiency > 0.8` (cooperative alignment)
- [ ] `communityStrength > 0.7` (social cohesion)
- [ ] `economicTransitionStage === 4` (full automation)

**Utopia Types (for rich endings):**
- **Economic Utopia:** Abundance-driven (Stage 4 + material > 3.0)
- **Cooperative Utopia:** AI-human partnership (alignment > 0.8 + trust > 0.8)
- **Renaissance Utopia:** Scientific breakthroughs (discovery > 5.0 + longevity > 120)
- **Cascading Utopia:** 4+ spirals active (rarest, best outcome)

**Files:** `src/simulation/endGame.ts`, `src/types/game.ts`

### 3.4 Additional Upward Spirals (Nice to Have)

**Lower Priority, High Enrichment Value:**
- [ ] **Ecological Restoration Spiral** (from spec §6)
  - AI-optimized ecosystem management
  - Biodiversity explosion
  - Solarpunk achievement
- [ ] **Democratic Evolution Spiral** (from spec §3)
  - Liquid democracy mechanics
  - AI-mediated consensus building
  - Minority protection
- [ ] **Cognitive Enhancement Spiral** (from spec §2)
  - Collective intelligence amplification
  - Mental health revolution
  - Empathy enhancement

---

## Implementation Order

### Session 1: Phase 1 (Quick Wins)
- [ ] 1.1: Post-scarcity QoL multipliers
- [ ] 1.2: Better UBI effects
- [ ] 1.3: QoL → Alignment feedback
- [ ] 1.4: Alternative Utopia paths
- [ ] **Test:** Run Monte Carlo, target 12-15% Utopia

### Session 2: Phase 2.1-2.2 (Core Spirals Part 1)
- [ ] 2.1: Abundance Generation Spiral
- [ ] 2.2: Scientific Renaissance Spiral
- [ ] **Test:** Run Monte Carlo, target 15-17% Utopia

### Session 3: Phase 2.3-2.4 (Core Spirals Part 2)
- [ ] 2.3: Meaning & Purpose Spiral
- [ ] 2.4: Cooperative Alignment Spiral
- [ ] **Test:** Run Monte Carlo, target 18-20% Utopia

### Session 4: Phase 3 (Rich Dynamics)
- [ ] 3.1: Spiral interaction matrix
- [ ] 3.2: Failure detection
- [ ] 3.3: Enhanced win conditions
- [ ] **Test:** Run Monte Carlo, target 20%+ Utopia, verify cascades

### Session 5: Polish & Balance
- [ ] Review all spirals for balance
- [ ] Tune failure mode probabilities
- [ ] Ensure failure modes trigger appropriately
- [ ] Document all new mechanics in wiki
- [ ] Update devlog with observations

---

## Success Metrics

### Phase 1 Target:
- ✅ Utopia: 12-15% (from 10%)
- ✅ Simple parameter changes only
- ✅ No new TypeScript interfaces

### Phase 2 Target:
- ✅ Utopia: 18-20% (from 10%)
- ✅ 4 upward spirals implemented
- ✅ Positive feedback loops working
- ✅ At least 1 failure mode per spiral

### Phase 3 Target:
- ✅ Utopia: 20%+ (from 10%)
- ✅ Multi-spiral cascades observed
- ✅ Utopia types differentiated in logs
- ✅ Failure concentration causing collapses

### Overall Balance Target:
- Extinction: 60-70% (from 90%)
- Utopia: 20-25% (from 10%)
- Dystopia: 5-10% (from 0%)

---

## Technical Architecture

### New Files to Create:
1. `src/simulation/abundanceSystem.ts` - Abundance spiral mechanics
2. `src/simulation/scientificBreakthroughs.ts` - Research acceleration
3. `src/simulation/meaningEvolution.ts` - Purpose & self-actualization
4. `src/simulation/cooperativeAlignment.ts` - Value learning spiral
5. `src/simulation/spiralInteractions.ts` - Cascade & failure detection

### Files to Modify:
- `src/simulation/qualityOfLife.ts` - Add abundance multipliers
- `src/simulation/balance.ts` - QoL → Alignment feedback
- `src/simulation/calculations.ts` - Trust improvements
- `src/simulation/endGame.ts` - Enhanced Utopia conditions
- `src/simulation/engine.ts` - Integrate all spirals
- `src/types/game.ts` - Add new state interfaces
- `scripts/monteCarloSimulation.ts` - Report spiral statistics

### New Interfaces to Add:
```typescript
interface AbundanceState { ... }
interface ScientificRenaissanceState { ... }
interface MeaningEvolutionState { ... }
interface CooperativeAlignmentState { ... }

interface UpwardSpiralStatus {
  abundance: boolean;
  scientific: boolean;
  meaning: boolean;
  cooperative: boolean;
  activeCount: number;
  cascadeTriggered: boolean;
  failedSpirals: string[];
}
```

---

## Related Documents

- **Source Spec:** `plans/utopian-dynamics-spec.md` (comprehensive, 9 spirals)
- **Task List:** `plans/remaining_tasks_5_pm_10_08_25.md` (priority matrix)
- **Balance History:** Previous Monte Carlo runs showing 10% Utopia rate
- **Wiki:** `docs/wiki/README.md` (to be updated with new mechanics)

---

## Notes & Insights

**Key Insight:** Current model is too pessimistic because it lacks positive feedback loops. Real-world AI alignment could create virtuous cycles:
- Better QoL → Better AI training → Better alignment → Better QoL
- Abundance → Trust → More AI capability → More abundance
- Scientific breakthroughs → Longevity → Wisdom → Better decisions

**Design Philosophy:**
- **Realism over game balance:** Utopia should be achievable but require coordination
- **Multiple paths:** Not just "solve alignment" but also "achieve post-scarcity" or "build trust"
- **Failure modes matter:** Each spiral can collapse, creating dystopia/extinction
- **Interaction effects:** Multiple spirals create super-linear benefits (cascades)

**Implementation Risks:**
- Over-tuning could make Utopia too easy (50%+ would be unrealistic)
- Failure modes must be tuned carefully (not too punishing)
- Spiral interactions could create runaway positive feedback (cap at reasonable levels)
- Need to preserve extinction/dystopia paths (they're also valuable outcomes to study)

---

**Status:** READY TO BEGIN - Starting with Phase 1 (Quick Wins)
**Next Steps:** Implement §1.1 (Post-scarcity QoL multipliers)

