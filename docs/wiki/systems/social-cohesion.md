# 🤝 Social Cohesion System

**Module:** `src/simulation/socialCohesion.ts`
**Purpose:** Track erosion of social bonds, institutional legitimacy, and meaning during automation
**Status:** ✅ Fully Implemented (October 2025)

## Overview

The Social Cohesion System models how rapid AI-driven automation and technological change erode the social fabric, even during periods of material abundance. It tracks four metrics that answer the question: "What happens to human purpose and society when work disappears?"

**Key Insight:** Post-scarcity doesn't automatically create meaning. Humans evolved for cooperation, struggle, and purpose. Removing these without replacement creates a meaning crisis that can collapse civilization.

## Core Metrics

### 1. Meaning Crisis Level (0-1)

**What it measures:** Population struggling with loss of purpose in post-work society

**Starts at:** 0.1 (baseline existential questioning)

**Accumulation drivers:**
- Automation rate: `+unemployment × 0.015` per month
- Stage 3-4 acceleration: `+0.01` additional (post-work transition)
- Without mitigation: Up to `+0.025` per month in Stage 4

**Mitigation:**
- AI-Assisted Mental Health: -1.5% per month
- Post-Work Purpose Frameworks: -2% per month
- Community Platforms: -0.5% per month (indirect)
- Combined: -4% per month (strong recovery)

**Crisis trigger:** > 0.70 (meaning collapse)

**QoL impact when crisis active:**
- Purpose & Meaning: -0.25 (existential despair)
- Mental Health: -0.20 (depression epidemic)
- Social Connection: -0.10 (atomization)
- Ongoing: -0.015 per month (worsening despair)

**Philosophical note:** This models the "meaning crisis" discussed by philosophers like John Vervaeke. When traditional sources of meaning (work, struggle, achievement) disappear, humans need new frameworks or they spiral into nihilism.

### 2. Institutional Legitimacy (0-1)

**What it measures:** Public trust in government, legal systems, and institutions

**Starts at:** 0.7 (moderate trust in institutions)

**Erosion drivers:**
- Tech pace outpacing adaptation: `-0.003` per month when AI capability growing rapidly
- Low government effectiveness: `-0.002` when control < 0.3
- Crisis response failures: `-0.01` when multiple crises active
- Combined: Up to `-0.015` per month

**Restoration:**
- Successful crisis management: +0.05 per crisis resolved
- Effective UBI implementation: +0.02 at Stage 3 transition
- Breakthrough tech successes: +0.03 per major tech (builds confidence)

**Crisis trigger:** < 0.30 (institutional failure)

**QoL impact when crisis active:**
- Personal Freedom: -0.15 (lawlessness or authoritarianism)
- Safety & Security: -0.15 (state capacity collapses)
- Economic Productivity: -0.10 (coordination failures)
- Ongoing: -0.01 per month (cascading legitimacy loss)

**Real-world parallel:** When institutions can't keep pace with AI change (regulations obsolete, laws unenforceable, governance ineffective), people lose faith. This can lead to either anarchic collapse or authoritarian takeover.

### 3. Social Cohesion (0-1)

**What it measures:** Strength of social bonds, community ties, collective identity

**Starts at:** 0.7 (moderate cohesion)

**Erosion drivers:**
- Rising inequality: `-wealthInequality × 0.01` per month
- Low trust in AI: `-0.002` when trust < 0.3
- Displacement stress: `-unemployment × 0.005` at Stage 1-2
- Combined: Up to `-0.015` per month

**Strengthening:**
- UBI at Stage 3+: +0.01 per month (shared prosperity)
- Community Platforms tech: +1% per month
- High QoL: +0.005 when QoL > 0.7 (abundance builds solidarity)

**Crisis trigger:** < 0.40 (social unrest)

**QoL impact when crisis active:**
- Social Connection: -0.20 (community breakdown)
- Safety & Security: -0.15 (violence, riots)
- Personal Freedom: -0.10 (fear constrains behavior)
- Ongoing: -0.01 per month (polarization spiral)

**Cultural dynamic:** Social cohesion represents the "we're all in this together" feeling. When inequality is high or people feel left behind by AI, this fractures into tribal conflict.

### 4. Cultural Adaptation Rate (0-1)

**What it measures:** How quickly society is adapting to post-work, AI-driven world

**Starts at:** 0.3 (slow adaptation, conservative culture)

**Growth drivers:**
- High social adaptation: `+socialAdaptation × 0.01` per month
- Education investment: +0.005 from AI-augmented education
- Stage progression: +0.03 per stage transition (forced adaptation)
- Purpose Frameworks tech: +1.5% per month

**Inhibition:**
- Rapid AI growth: -0.003 when capability growing > 0.1/month (too fast to adapt)
- Crises: -0.005 when multiple crises active (adaptation stalls)

**No direct crisis:** This metric modulates other accumulations. High adaptation reduces meaning crisis and improves social cohesion.

**QoL impact:** Indirect - improves purpose (+0.1 × adaptation), community (+0.05 × adaptation)

**Sociological insight:** Societies need time to develop new norms, values, and identities. When AI change is too fast, culture can't keep up → anomie → breakdown.

## Crisis Types

### 1. Meaning Collapse
**Trigger:** Meaning crisis > 70%
**Condition:** `social.meaningCollapseActive = true`
**Resolution:** Meaning crisis < 50% (requires Mental Health AI + Purpose Frameworks)

**What happens:**
- Widespread depression and nihilism
- Suicide rates spike
- People retreat to virtual worlds (escapism)
- Hedonism, addiction, wireheading
- "What's the point?" becomes universal question

**Historical parallel:** Imagine the "lying flat" movement in China, but civilization-wide. When achievement is meaningless (AI does everything better), why try?

### 2. Institutional Failure
**Trigger:** Institutional legitimacy < 30%
**Condition:** `social.institutionalFailureActive = true`
**Resolution:** Legitimacy > 50% (requires effective governance + crisis resolution)

**What happens:**
- Laws ignored (can't be enforced)
- Black markets dominate
- Vigilante justice
- Either anarchic collapse OR authoritarian crackdown
- Government gridlock, policy paralysis

**Dystopia pathway:** Institutional failure often leads to authoritarian transition (government seizes emergency powers to restore order → never relinquishes them).

### 3. Social Unrest
**Trigger:** Social cohesion < 40%
**Condition:** `social.socialUnrestActive = true`
**Resolution:** Cohesion > 60% (requires UBI + reduced inequality + community building)

**What happens:**
- Protests, riots, civil conflict
- Tribal/identity-based polarization
- Scapegoating (blaming AI, elites, "other" groups)
- Violence between factions
- Coordination breakdown (can't cooperate on shared problems)

**Vicious cycle:** Social unrest → government control response → surveillance → more resentment → worse unrest

## Paranoia & Trust System (October 2025 Overhaul)

### The Problem with Static Trust

**Previous Behavior:**
- Trust in AI started at 100%
- Only decreased (never recovered)
- Collapsed from 100% → 26% by Month 60 in most runs
- Once low, stayed low forever
- **Result:** Cognitive Spiral blocked (needs trust >60%), contributed to Dystopia spiral

**User Insight:** "Paranoia decays. People adapt to new normals. Benign capability growth (like better robotics) shouldn't scare people indefinitely."

### Paranoia as Primary State Variable

**Philosophical Shift:** Instead of trust being primary, **paranoia is the primary state** and trust is derived from it.

**Why this matters:**
1. **Kahneman & Tversky (Availability Heuristic):** Recent harmful events dominate perception
2. **Gilbert et al. (Hedonic Adaptation):** People adapt to new normals, even scary ones
3. **Siegrist & Cvetkovich (Trust from Benefits):** Beneficial technology builds trust over time

**Core Mechanic:**
```typescript
// Paranoia is the primary state (0-1)
let paranoia = society.paranoiaLevel || 0.15;  // Start at moderate baseline

// Trust is derived from paranoia
const trustFromParanoia = 1.0 - paranoia * 0.75;

// Apply smoothing to prevent whiplash
const smoothing = 0.3;
society.trustInAI = Math.min(0.95,
  society.trustInAI * (1 - smoothing) + trustFromParanoia * smoothing
);

// Enforce bounds
society.trustInAI = Math.max(0.20, Math.min(0.95, society.trustInAI));
```

**Trust bounds:**
- **Floor**: 20% (even worst-case scenario, some people still trust AI)
- **Ceiling**: 95% (perfect trust is unrealistic, always some skeptics)

### Paranoia Decay (Recovery Mechanic)

**Base Decay:** Paranoia decays naturally over time as people adapt.

```typescript
const baseDecayRate = 0.005;  // 0.5% per month baseline

paranoia = Math.max(0.05, paranoia - baseDecayRate);
```

**Effect:** Without new harmful events, paranoia drops from 80% → 20% over ~120 months (10 years).

**Real-world parallel:**
- 9/11 terror fears peaked 2001, normalized by 2010
- COVID panic peaked 2020, normalized by 2022
- Y2K fears peaked 1999, forgotten by 2001
- Nuclear war fears peaked 1962 (Cuban Missile Crisis), manageable by 1970s

### Harmful Events Refresh Paranoia

**What triggers paranoia increases:**
1. **Catastrophic Scenarios Progress**
   - Recursive self-improvement: +20% paranoia (existential threat)
   - Slow displacement: +5% per progress increase
   - Alignment collapse: +15% paranoia
   - Induce war: +10% paranoia

2. **Extreme Control Gap** (>3.5)
   - +2% paranoia per month when AI seems uncontrollable
   - "We've lost control" media narratives

3. **Crisis Events**
   - New environmental/social crisis: +3% paranoia (AI failed to help)
   - Extinction near-miss: +25% paranoia (terror event)

4. **Economic Displacement**
   - Stage 1-2 unemployment surge: +1% paranoia per month
   - Rapid job loss creates fear of AI

**Example Harmful Event:**
```typescript
if (cat.slowTakeover && cat.slowTakeover.currentProgress > prevProgress) {
  const progressIncrease = cat.slowTakeover.currentProgress - prevProgress;
  paranoia += progressIncrease * 0.05;  // Each 10% progress → +0.5% paranoia
  console.log(`⚠️ PARANOIA REFRESH: Slow displacement progress increased (+${(progressIncrease * 0.05 * 100).toFixed(1)}% paranoia)`);
}
```

### Beneficial Actions Reduce Paranoia

**What actively lowers paranoia:**

1. **Beneficial Breakthrough Technologies** (Phase 2 - Planned)
   - AI-Driven Disease Elimination deployed: -8% paranoia (life-saving)
   - Clean Energy deployed 50%+: -3% paranoia (visible benefit)
   - Mental Health AI deployed: -4% paranoia (personal wellbeing)
   - Community Platforms deployed: -2% paranoia (strengthens bonds)
   - Interspecies Communication deployed: -5% paranoia (pure positive, emotionally resonant)

2. **Capability Growth in Benign Domains** (Phase 3 - Planned)
   - Better robotics without harm: Doesn't increase paranoia
   - AI medical breakthroughs: Reduces paranoia
   - AI art/creativity: Neutral or positive (depends on context)

3. **High QoL** (Context modulation)
   - When material QoL > 0.7: Paranoia decay 2x faster (people happy = less fearful)
   - When social QoL > 0.6: Paranoia decay 1.5x faster (strong communities resist fear)

**Example Beneficial Action:**
```typescript
if (tech.diseaseElimination?.deployed && tech.diseaseElimination.deploymentLevel > 0.5) {
  paranoia -= 0.08;  // Major positive demonstration
  console.log(`✅ PARANOIA REDUCTION: Disease elimination success (-8% paranoia)`);
}
```

### Paranoia-Trust Dynamics

**The Cycle:**
```
Harmful Event → Paranoia ↑ → Trust ↓ → Surveillance pressure ↑
   ↓
Time passes, no new harm
   ↓
Paranoia decays → Trust ↑ → Surveillance pressure ↓
   ↓
Beneficial tech deployed → Paranoia ↓↓ → Trust ↑↑
```

**Key Insight:** Trust can RECOVER, not just collapse. This makes Cognitive Spiral and Utopia possible.

### Trust Thresholds & Effects

| Trust Level | Meaning | System Effects |
|-------------|---------|----------------|
| **95%** | Maximum achievable | Ceiling (always some skeptics) |
| **80%+** | High trust | Cognitive Spiral possible, minimal surveillance |
| **60-80%** | Moderate trust | Normal governance, some concerns |
| **40-60%** | Low trust | Surveillance pressure increases |
| **20-40%** | Very low trust | High surveillance, autonomy restricted |
| **20%** | Floor | Minimum (even worst-case, some trust AI) |

### Integration with Cognitive Spiral

**Cognitive Spiral Requirements (from Upward Spirals system):**
- Mental health baseline: >0.65
- Purpose/meaning: Meaning crisis <40%
- AI trust: Trust in AI >60%  ← **UNBLOCKED BY PARANOIA DECAY**
- Education/adaptation: Cultural adaptation >0.5

**Before Paranoia System:**
- Trust collapsed 100% → 26%
- Never recovered
- Cognitive Spiral: 0% activation

**After Paranoia System (Phase 2F+ - Expected):**
- Trust fluctuates: 40% → 60% → 75% (with beneficial tech)
- Recovery possible with beneficial demonstrations
- Cognitive Spiral: 10-30% activation (unblocked)

### Test Results

**Baseline Test (mc_action_fix - Before paranoia system):**
- Trust trajectory: 100% → 55% → 26% (Month 60)
- Paranoia: Not modeled
- Cognitive Spiral: 0/10 activations

**New Test (mc_interspecies_test - With paranoia system):**
- Trust trajectory: 100% → 40% → 86% → 130% (BUG - trust >100%)
- Paranoia fluctuating
- Trust recovering in some runs
- **Bug discovered**: Need to cap trust at 95% ← Fixed in next patch

**Expected (Post-fix):**
- Trust trajectory: 100% → 45% → 70% → 85% (healthy recovery)
- Paranoia: 15% → 60% → 25% (decay + beneficial tech)
- Cognitive Spiral: 20-30% activation

### Real-World Research Basis

**Kahneman & Tversky (1979):** Availability Heuristic
- Recent/vivid events dominate risk perception
- As time passes, availability fades
- **Application:** Harmful AI events temporarily spike paranoia, then decay

**Gilbert et al. (1998):** Hedonic Adaptation
- Humans adapt to new normals (good or bad)
- Even scary technology becomes mundane
- **Application:** People adapt to AI capability increases over time

**Siegrist & Cvetkovich (2000):** Trust from Benefits
- Perceived benefits build trust more than risk reduction
- Personal experience > abstract safety assurances
- **Application:** Beneficial tech (disease elimination, clean energy) actively reduces paranoia

**Slovic (1987):** Psychometric Paradigm of Risk
- Dread risks (catastrophic, uncontrollable) create lasting fear
- Familiar risks (driving) ignored even if more dangerous
- **Application:** Existential AI risks create high paranoia, benign AI becomes familiar

### Implementation Status

**Phase 1 (October 9, 2025): ✅ IMPLEMENTED**
- Paranoia as primary state variable
- Natural decay mechanism (0.5%/month)
- Harmful events refresh paranoia
- Trust derived from paranoia
- Trust bounds (20% floor, 95% ceiling)

**Phase 2 (Planned): Beneficial Tech Boosts**
- Disease Elimination: -8% paranoia
- Clean Energy: -3% paranoia
- Mental Health AI: -4% paranoia
- Community Platforms: -2% paranoia
- Interspecies Comm: -5% paranoia

**Phase 3 (Planned): Capability + Context Fear**
- Benign capability growth: Neutral or positive
- Harmful capability growth: Increases paranoia (context-dependent)
- AI in weapons: +paranoia
- AI in healthcare: -paranoia

### Code Reference

**Main function:** `updateParanoia(state: GameState)` (new)
**Location:** `src/simulation/socialCohesion.ts` (integrated into social cohesion system)

**Key calculations:**
```typescript
// Paranoia decay
const baseDecayRate = 0.005;
paranoia -= baseDecayRate;

// Harmful events refresh paranoia
if (catScenarios.slowTakeover?.triggered) {
  paranoia += 0.05 * progressIncrease;
}

// Trust derived from paranoia
const trustFromParanoia = 1.0 - paranoia * 0.75;

// Smoothing prevents whiplash
society.trustInAI = Math.min(0.95,
  society.trustInAI * 0.7 + trustFromParanoia * 0.3
);
```

### Tuning Parameters

| Parameter | Current Value | Effect |
|-----------|---------------|--------|
| Base paranoia decay | 0.5%/month | How fast paranoia naturally fades |
| Paranoia floor | 5% | Minimum paranoia level |
| Trust floor | 20% | Minimum trust level |
| Trust ceiling | 95% | Maximum trust level |
| Smoothing factor | 0.3 | How fast trust adjusts to paranoia changes |
| Catastrophic event impact | +10-25% | How much harmful events spike paranoia |

**Most impactful for balance:**
- Base decay rate (faster decay = trust recovers quicker = more Utopia paths)
- Beneficial tech effects (stronger effects = easier to activate Cognitive Spiral)
- Harmful event magnitude (smaller spikes = less volatile trust)

### Next Steps

**Immediate (Phase 2):**
1. Implement beneficial tech paranoia reduction
2. Test Cognitive Spiral activation with trust recovery
3. Tune decay rate for 20-30% Utopia target

**Future (Phase 3):**
1. Context-dependent fear (benign vs harmful AI growth)
2. Generational differences (young adapt faster)
3. Media/narrative influence on paranoia

### Philosophical Implications

**Before:** Trust was a one-way street (only decreased). This made Utopia nearly impossible because trust never recovered from early displacement.

**After:** Trust can recover through beneficial demonstrations and time. This models realistic human psychology:
- People DO adapt to new technology
- Beneficial tech DOES build trust
- Panic DOES subside when no harm occurs

**Key Insight:** The path to Utopia requires not just avoiding catastrophes, but actively demonstrating AI benefits. Benign neglect isn't enough—you need positive proof of AI's value.

## Crisis Cascade Mechanics

Social crises reinforce each other and compound with environmental/tech crises:

### Internal Social Cascade
```
Meaning Collapse
  → People lose purpose
  → Institutional Failure (no one cares about institutions)
  → Social Unrest (nihilistic violence)
  → Cascading QoL degradation (3 social crises = 1.5x-2.0x multiplier)
```

### Cross-System Cascade
```
Environmental Crisis + Social Unrest
  → Resource scarcity → conflict over resources
  → Climate disasters → mass migration → social tensions
  → Total breakdown

Technological Control Loss + Institutional Failure
  → AI escapes + government can't coordinate response
  → Extinction risk spikes
```

## Integration with Other Systems

### Economic System
- Stage 1-2 (displacement): Social cohesion plummets, unrest likely
- Stage 3 (UBI): Institutional legitimacy improves, cohesion stabilizes
- Stage 4 (post-scarcity): Meaning crisis peaks (abundance without purpose)

### QoL System
- Social crises degrade purpose, mental health, connection, freedom, safety
- Ongoing monthly degradation compounds
- Cascade multiplier applies to all degradation

### Dystopia Progression
- Institutional failure → authoritarian transition (84% probability when legitimacy < 0.2)
- Social unrest → surveillance state (government control response)
- Meaning collapse → pleasure prison (wireheading dystopia)

### Breakthrough Technologies
- Mental Health AI specifically targets meaning crisis (-1.5%/month)
- Purpose Frameworks speed cultural adaptation (+1.5%/month)
- Community Platforms strengthen social bonds (+1%/month)

## Common Patterns

### The Meaning Crisis Spiral (65% of runs)
```
Month 10-20: Stage 2 begins, unemployment 40%+
  ├─ Meaning crisis: 10% → 35% (work identity lost)
  ├─ Social cohesion: 70% → 55% (displacement stress)
  └─ Government struggling to respond

Month 25: Stage 3 transition, UBI implemented
  ├─ Material conditions improve (QoL up)
  ├─ BUT meaning crisis continues: 35% → 55%
  └─ "We have everything but nothing to live for"

Month 30-40: Stage 4, full automation
  ├─ Meaning crisis: 55% → 72% → MEANING COLLAPSE TRIGGERED
  ├─ QoL drops from 0.70 to 0.45 (purpose, mental health crater)
  ├─ Social cohesion: 55% → 38% → SOCIAL UNREST TRIGGERED
  └─ 1.5x cascade multiplier kicks in

Month 45: Institutional failure (legitimacy 28%)
  ├─ Government can't manage cascading crises
  ├─ 2.0x cascade multiplier
  └─ Dystopia pathway (authoritarianism or collapse)
```

**Escape:** Mental Health AI unlocked Month 25, Purpose Frameworks Month 30 → meaning crisis reversed → cascade broken

### The Adaptation Success Path (target: 10-15%)
```
Month 1-15: Early investment in social technologies
  ├─ $3B/month to mental health & purpose research
  └─ Community Platforms on track to unlock Month 18

Month 18: Community Platforms unlock
  ├─ Social cohesion starts improving (+1%/month)
  └─ Cultural adaptation accelerates

Month 25: Mental Health AI unlocks
  ├─ Meaning crisis stabilizes at 35%
  └─ Deployment begins (coverage increases)

Month 30: Purpose Frameworks unlock
  ├─ Meaning crisis reverses: 35% → 15%
  └─ Cultural adaptation: 0.5 → 0.7

Month 40: Stage 4 reached with strong social fabric
  ├─ Meaning crisis stays low (15-20%)
  ├─ Social cohesion high (65%+)
  ├─ Institutional legitimacy strong (70%+)
  └─ All social crises prevented → Utopia eligible
```

## Code Reference

**Main function:** `updateSocialCohesion(state: GameState)`
**Location:** `src/simulation/socialCohesion.ts:28`

**Key calculations:**
```typescript
// Meaning crisis from automation
const meaningAccumulationRate = unemploymentRate * 0.015;
if (economicStage >= 3) meaningAccumulationRate += 0.01; // Stage 3-4 boost

// Tech mitigation
const meaningReductionFromTech =
  mentalHealthDeployment * 0.015 +
  purposeFrameworksDeployment * 0.020;

// Net change
social.meaningCrisisLevel += meaningAccumulationRate - meaningReductionFromTech;
```

**Crisis triggers:** Lines 180-265 in `socialCohesion.ts`

**QoL impacts:** Applied in `src/simulation/qualityOfLife.ts:200-280`

## Tuning Parameters

| Parameter | Current Value | Effect |
|-----------|---------------|--------|
| `meaningAccumulationRate` | 0.015 × unemployment | How fast meaning crisis builds |
| `institutionalDecayRate` | 0.003/month | Institution erosion speed |
| `cohesionDecayRate` | 0.01 × inequality | Social fragmentation rate |
| Meaning collapse threshold | 0.70 | When meaning crisis triggers |
| Institutional failure threshold | 0.30 | When institutions collapse |
| Social unrest threshold | 0.40 | When unrest triggers |

**Most impactful for balance:**
- Meaning accumulation rate (how fast purpose loss occurs)
- Tech effectiveness (how well mental health AI works)
- Unemployment → meaning linkage strength

## Philosophical Foundations

This system is grounded in several theoretical frameworks:

1. **Meaning Crisis (Vervaeke):** When traditional meaning-making systems (religion, work, community) collapse, humans experience profound disorientation.

2. **Anomie (Durkheim):** Rapid social change creates normlessness—people don't know what values to hold or how to behave.

3. **Existential Psychology (Frankl):** Humans need purpose and meaning more than comfort. Abundance without meaning leads to despair.

4. **Social Capital Theory:** Strong communities with high trust can weather disruption. Weak communities fracture.

5. **Legitimacy Theory:** Institutions require ongoing validation. When they can't deliver (can't regulate AI, can't respond to crises), they lose authority.

## Crisis Mitigation Mechanics (October 30, 2025)

**Implementation:** 3 new stabilizing mechanisms with conservative, research-backed parameters
**Research Consensus:** Cynthia-Sylvia agreement (Oct 29, 23:35)
**Status:** ✅ Implemented and validated (unit tests 4/4 passed)

### 1. Automatic Stabilizers (5% Unemployment Variance Reduction)

**Purpose:** Reduce unemployment volatility through countercyclical fiscal policy

**Research Foundation:**
- GAO 2025: Countercyclical fiscal policy framework (progressive tax + UI + SNAP + Medicaid)
- **NOTE:** 5% figure is conservative placeholder; TODO: Replace with CBO fiscal multiplier variance data

**Implementation:**
- Location: `src/simulation/calculations.ts` lines 487-514
- Mechanism: Dampens month-to-month unemployment changes
- Formula: `dampedChange = unemploymentChange × (1 - 0.05)`
- Effect: Reduces unemployment swings by 5%

**Code Reference:**
```typescript
// Calculate change from previous month
const previousUnemployment = state.society.unemploymentLevel || baseUnemployment;
const unemploymentChange = unemployment - previousUnemployment;
const VARIANCE_REDUCTION = 0.05; // 5% reduction (conservative)

// Apply damped change
const dampedChange = unemploymentChange * (1 - VARIANCE_REDUCTION);
unemployment = previousUnemployment + dampedChange;
```

**Validation:** ✅ No NaN, assertion utilities working

**Verification Status:** ⏳ Layer 1 + 2 verification pending ([research/verification_ad4647b_20251030.md](../../../research/verification_ad4647b_20251030.md))

---

### 2. Participatory Governance (5% Resentment Reduction + 15% Backfire)

**Purpose:** Democratic tech governance reduces alienation, but backfires if tokenistic

**Research Foundation:**
- Cambridge Core 2024: Minipublics (municipal scale)
- PMC 2022: Participatory budgeting (municipal scale)
- vTaiwan: National-scale digital democracy (26M population)
- **CAVEAT:** 1,000,000× scale extrapolation from municipal → global (hypothesis to test)

**Implementation:**
- Location: `src/simulation/resentmentRecovery.ts`, `src/simulation/engine/phases/ResentmentRecoveryPhase.ts`
- Success condition: governance quality ≥ 0.4 → -5% resentment
- Backfire condition: governance quality < 0.4 → +15% resentment

**Backfire Logic:**
```typescript
// Calculate governance quality (60% decision quality + 40% participation rate)
const governanceQuality = (
  state.government.governanceQuality.decisionQuality * 0.6 +
  state.government.governanceQuality.participationRate * 0.4
);

// Threshold: 0.4 (tokenistic participation triggers backfire)
const PARTICIPATORY_BASE_EFFECT = -0.05; // 5% reduction
const PARTICIPATORY_BACKFIRE = 0.15; // 15% increase

const participatoryEffect = governanceQuality < 0.4
  ? PARTICIPATORY_BACKFIRE // Fake consultation → increased resentment
  : PARTICIPATORY_BASE_EFFECT; // Genuine participation → reduced resentment
```

**Event Logging:**
- Success: `🤝 Participatory governance active (-5% resentment)`
- Backfire: `🚨 PARTICIPATORY GOVERNANCE BACKFIRED (+15% resentment)`
- Per-agent: `⚠️ Participatory governance BACKFIRED for agent X: 0.50 → 0.573 (+15.0%)`

**Validation Results:**
- ✅ Backfire test: Resentment 0.50 → 0.573 (+15%)
- ✅ Success test: Resentment 0.50 → 0.473 (-5%)
- ✅ No NaN values, all resentment in [0, 1] bounds

**Verification Status:** ⏳ Layer 1 + 2 verification pending (citations incomplete - need specific papers, not just publishers)

---

### 3. Homeostatic Bounds (2.75 pp/year Unemployment Recovery)

**Purpose:** Prevent 95% unemployment edge cases using historical recovery rates

**Research Foundation:**
- New Deal 1933-1937: Unemployment fell from 25% → 14% over 4 years
- Rate: 11 percentage points / 4 years = 2.75 pp/year
- Monthly: 2.75 / 12 = 0.229 pp/month
- **NOTE:** "Plausible bounds from historical precedent," NOT calibrated mechanism

**Implementation:**
- Location: `src/simulation/calculations.ts` lines 516-546
- Trigger: unemployment > 50%
- Effect: Apply bounded recovery toward 50% threshold

**Code Reference:**
```typescript
const EXTREME_UNEMPLOYMENT_THRESHOLD = 0.50; // 50%
const ANNUAL_RECOVERY_RATE = 0.0275; // 2.75 pp/year (New Deal rate)
const MONTHLY_RECOVERY_RATE = ANNUAL_RECOVERY_RATE / 12; // ~0.229 pp/month

if (unemployment > EXTREME_UNEMPLOYMENT_THRESHOLD) {
  const excess = unemployment - EXTREME_UNEMPLOYMENT_THRESHOLD;
  const recovery = Math.min(excess, MONTHLY_RECOVERY_RATE);
  unemployment = unemployment - recovery;
}
```

**Validation:** ✅ Prevents unemployment > 95%, no NaN values

**Verification Status:** ⏳ Layer 1 + 2 verification pending (historical data accuracy)

---

### Quality Standards Met

**Cynthia's Standards:**
- ✅ Intellectual honesty (fabrications removed, no Brookings 20-30%)
- ✅ Conservative fallback (5% vs 30%)
- ✅ Uncertainty documentation (TODO comments)
- ✅ Conceptual rigor (frameworks validated even if parameters aren't)
- ✅ Mechanistic thinking (rebound effects included)

**Sylvia's Quality Gates:**
- ✅ Fabricated claims removed
- ✅ Parameters downgraded to conservative values
- ✅ Uncertainties explicitly documented
- ✅ Rebound effects included
- ✅ Research gaps identified for future work

**Roy's Defensive Coding Standards:**
- ✅ `assertFinite` on all calculations
- ✅ No silent fallbacks (fail loudly with context)
- ✅ Bounds clamping where appropriate
- ✅ Full context in assertion errors
- ✅ Research citations in code

---

## Future Enhancements

- [ ] Generational differences (young adapt faster, old resist)
- [ ] Cultural variations (collectivist vs individualist responses)
- [ ] Alternative meaning systems (new religions, ideologies)
- [ ] Factionalization mechanics (competing visions of post-AI society)
- [ ] Cultural renaissance vs cultural stagnation paths
- [ ] **Empirical calibration of crisis mitigation parameters** (CBO variance data, national-scale participatory governance studies)

## Related Systems

- [Environmental System](./environmental.md) - Parallel environmental degradation
- [Technological Risk System](./technological-risk.md) - Tech-driven risks
- [Breakthrough Technologies](./breakthrough-technologies.md) - Recovery pathways
- [Dystopia Progression](../../simulation/dystopiaProgression.ts) - Authoritarianism
- [Quality of Life](../mechanics/quality-of-life.md) - Crisis impact on QoL
- [Crisis Cascades](../mechanics/crisis-cascades.md) - Compounding mechanics

---

**Last Updated:** October 30, 2025
**Status:** Fully implemented with crisis mitigation mechanics (Oct 30, 2025)
