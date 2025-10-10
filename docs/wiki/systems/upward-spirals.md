# Upward Spirals System

**Version:** 2.1
**Last Updated:** October 2025
**Code Reference:** `src/simulation/upwardSpirals.ts`

## Overview

The upward spirals system models **virtuous cascades** - positive feedback loops that make success self-reinforcing. Just as crisis cascades amplify failures (3.0x degradation), upward spirals amplify successes (1.6x improvement).

**Core Mechanic:** When 4+ spirals activate simultaneously, they cross-amplify each other, creating exponential positive growth. This is the **opposite** of cascading failures.

**Utopia Condition:** Requires **3+ sustained spirals for 12+ months** + no active crises. Multiple paths to victory!

## The Six Spirals

### 1. Abundance Spiral 🌾

**Definition:** Material post-scarcity achieved through automation, energy abundance, and time liberation.

**Activation Conditions:**
```typescript
// ALL three required (geometric mean)
const materialAbundance = economicStage >= 3 ? 0.9 : 0.5;
const energyAbundance = energyLevel >= 1.5 ? 0.9 : 0.4;
const timeLiberation = (unemploymentRate >= 0.6 && economicStage >= 3) ? 0.8 : 0.3;

spiralStrength = Math.pow(
  materialAbundance * energyAbundance * timeLiberation,
  1/3
);
```

**Activation Threshold:** 0.6 (all three factors must be strong)

**What It Represents:**
- Food, shelter, energy freely available
- No need to work for survival
- Time to pursue meaning and growth

**Contributing Factors:**
- Economic Stage 3+ (Post-Scarcity)
- High energy production (1.5+ capacity)
- 60%+ unemployment in advanced economy (automation working)

**Effects When Active:**
- Enables Cognitive spiral (time for learning)
- Enables Meaning spiral (time for purpose)
- Boosts QoL: material comfort, time pressure relief

**Common Patterns:**
- Achieved Month 30-50 in successful runs
- Often first spiral to activate
- Gateway to other spirals

---

### 2. Cognitive Spiral 🧠

**Definition:** Human cognitive capability enhanced through mental health, purpose, and AI augmentation.

**Activation Conditions:**
```typescript
// Mental health
const mentalHealthBonus = diseaseDeployment >= 0.3 ? 0.9 :
  (diseaseLevel < 0.3 ? 0.7 : 0.5);

// Purpose & meaning
const purposeBonus = meaningCrisisLevel < 0.3 ? 0.9 :
  (frameworksDeployment >= 0.3 ? 0.6 : 0.4);

// AI cognitive augmentation
const cognitiveAugmentation =
  (avgCapability >= 1.5 && trustInAI >= 0.6) ?
    0.5 + (avgCapability / 5) : 0.2;

spiralStrength =
  mentalHealthBonus * 0.35 +
  purposeBonus * 0.35 +
  cognitiveAugmentation * 0.30;
```

**Activation Threshold:** 0.7 (high bar - need all three)

**What It Represents:**
- Population becoming smarter, healthier, more capable
- AI tools amplifying human cognition
- Mental health epidemic resolved
- Clear sense of purpose in post-work world

**Contributing Technologies:**
- AI-Driven Disease Elimination (mental health)
- Post-Work Purpose Frameworks
- High AI capability + trust

**Effects When Active:**
- Faster breakthrough research
- Better governance decisions
- Enables Scientific spiral
- Boosts QoL: cognitive capability, health

**Common Patterns:**
- Requires both tech (disease + purpose) and AI trust
- Typically Month 50-70
- Often blocked by meaning crisis

---

### 3. Democratic Spiral 🗳️

**Definition:** High-quality governance with engaged citizens and effective institutions.

**Activation Conditions:**
```typescript
// Governance quality (from Phase 2C)
const qualityScore =
  (decisionQuality + institutionalCapacity) / 2;

// Civic engagement
const engagementScore =
  (participation + transparency) / 2;

// Not authoritarian (hard block)
if (governmentType === 'authoritarian') {
  spiralStrength = 0;  // Cannot activate
} else {
  spiralStrength = qualityScore * 0.5 + engagementScore * 0.5;
}
```

**Activation Threshold:**
- Quality: 0.7+ (decision quality + capacity average)
- Engagement: 0.6-0.7 (participation + transparency average)
- Total: 0.65+

**What It Represents:**
- Liquid democracy working
- People engaged and informed
- Government making good decisions
- Institutions functioning well

**Blockers:**
- Authoritarian government (automatic fail)
- Low transparency or participation
- Poor decision quality

**Effects When Active:**
- Stronger resistance to dystopia
- Better policy effectiveness (1.3-1.5x)
- Enables other spirals through good governance
- Boosts QoL: civic participation, trust in institutions

**Common Patterns:**
- Requires democratic government maintained
- Often lost during crisis cascades
- Critical for Utopia (prevents dystopia lock-in)

---

### 4. Scientific Spiral 🔬

**Definition:** Rapid scientific progress through breakthrough technologies and AI-accelerated research.

**Activation Conditions:**
```typescript
// Count deployed breakthrough technologies
const deployedCount = Object.values(breakthroughs)
  .filter(t => t.deploymentLevel >= 0.5).length;

// Research investment
const researchLevel = govResearchBudget >= 50 ? 0.9 :
  (govResearchBudget / 50);

// AI acceleration
const aiAcceleration = avgCapability >= 2.0 ?
  0.5 + (avgCapability / 10) : 0.3;

spiralStrength =
  (deployedCount / 11) * 0.4 +        // Progress rate (max 11 techs)
  researchLevel * 0.3 +                // Investment
  aiAcceleration * 0.3;                // AI capability
```

**Activation Threshold:** 0.65
- Requires 4+ breakthrough technologies deployed (50%+)
- OR 3 deployed + high research + high AI capability

**What It Represents:**
- Science accelerating exponentially
- Multiple breakthroughs deployed at scale
- AI amplifying research productivity
- Virtuous cycle: tech → more tech

**Contributing Factors:**
- $50B+/month research budget
- AI capability 2.0+ (superintelligence)
- Good policy effectiveness (governance quality)

**Effects When Active:**
- Faster research progress (1.2-1.4x)
- New technologies unlock faster
- Crisis resolution technologies deploy
- Boosts QoL: technological progress, hope

**Common Patterns:**
- Often blocked by slow deployment (see Phase 2F+)
- Requires sustained investment + governance
- Month 60-80 in good runs
- **Currently rare** (0% in recent tests - deployment too slow)

---

### 5. Meaning Spiral ✨

**Definition:** Cultural flourishing where people find purpose, community, and fulfillment beyond work.

**Activation Conditions:**
```typescript
// From Meaning Renaissance system (Phase 2E)
const renaissanceStrength = meaningRenaissance.overallRenaissanceStrength;

// Community & adaptation
const communityStrength = (socialCohesion + culturalAdaptation) / 2;

// Autonomy & creativity
const autonomyScore = (autonomy >= 0.7 &&
  renaissanceStrength >= 0.5) ? 0.9 : 0.5;

spiralStrength =
  (1 - meaningCrisisLevel) * 0.3 +     // Not in meaning crisis
  renaissanceStrength * 0.3 +          // Renaissance active
  communityStrength * 0.25 +           // Community strong
  autonomyScore * 0.15;                // Autonomy & creativity
```

**Activation Threshold:** 0.7 (high bar - meaning is hard!)

**What It Represents:**
- People finding new purpose beyond work
- Artistic and philosophical renaissance
- Strong communities and social bonds
- Cultural adaptation to post-work reality

**Contributing Systems:**
- Meaning Renaissance (4 dimensions - Phase 2E)
- Post-Work Purpose Frameworks deployed
- AI-Enhanced Community Platforms deployed
- High social cohesion + cultural adaptation

**Effects When Active:**
- Reverses meaning crisis (-1%/month recovery)
- Boosts participation and engagement
- Enables Democratic spiral
- Boosts QoL: meaning & purpose, cultural vitality, social connection

**Common Patterns:**
- Hardest spiral to achieve (only 1 tech directly helps)
- Requires time + multiple systems working
- Often the missing piece (0% Utopia if not active)
- Phase 2E makes this more achievable

---

### 6. Ecological Spiral 🌍

**Definition:** Planetary healing through environmental restoration and sustainable systems.

**Activation Conditions:**
```typescript
// Ecosystem health
const ecosystemHealth = biodiversity >= 0.7 ? 0.9 : biodiversity;

// Climate stability
const climateStability = 1 - (climateChange >= 0.7 ? 0 : climateChange);

// Pollution cleanup
const pollutionControl = pollution <= 0.3 ? 0.9 : (1 - pollution);

// Resource sustainability
const resourceHealth = resourceScarcity >= 0.7 ? 0.9 : resourceScarcity;

spiralStrength =
  ecosystemHealth * 0.3 +
  climateStability * 0.25 +
  pollutionControl * 0.25 +
  resourceHealth * 0.20;
```

**Activation Threshold:** 0.7 (all environmental metrics must be good)

**What It Represents:**
- Planet healing, not dying
- Ecosystems recovering
- Climate stabilized
- Resources sustainable

**Contributing Technologies:**
- Clean Energy Systems (pollution + climate)
- Carbon Capture & Storage (climate)
- Ecosystem Management AI (biodiversity)
- Advanced Recycling (resources)

**Effects When Active:**
- Prevents environmental crises
- Enables Abundance spiral (resources)
- Post-scarcity peace dividend
- Boosts QoL: environmental quality, long-term security

**Common Patterns:**
- Often achieved Month 50-70 with breakthrough tech
- Requires multiple environmental techs deployed
- Can be lost if tech deployment stops
- Easier than Meaning spiral but needs investment

---

## Virtuous Cascade Mechanics

### Activation Threshold

**Trigger:** 4+ spirals active simultaneously

**Why 4?** Creates meaningful strategic choice:
- 3 spirals = Utopia possible (minimum requirement)
- 4 spirals = Virtuous cascade begins
- 6 spirals = Maximum amplification

### Amplification Multipliers

```typescript
if (activeSpiralCount >= 4) {
  let multiplier = 1.0;

  if (activeSpiralCount === 4) multiplier = 1.2;
  if (activeSpiralCount === 5) multiplier = 1.4;
  if (activeSpiralCount === 6) multiplier = 1.6;

  // Applied to:
  // - Research progress
  // - Crisis resolution
  // - QoL improvements
  // - Spiral strength itself (self-reinforcing!)
}
```

**Cascade Levels:**
- **4 spirals:** 1.2x amplification (20% boost)
- **5 spirals:** 1.4x amplification (40% boost)
- **6 spirals:** 1.6x amplification (60% boost)

**What Gets Amplified:**
- Breakthrough tech research speed
- Deployment rates
- Crisis resolution effectiveness
- QoL improvements
- Spiral strength itself (positive feedback!)

### Cascade Logging

```
🌟✨ VIRTUOUS CASCADE BEGINS (Month 62)
   6 upward spirals active → 1.6x amplification
   Active spirals: Abundance, Cognitive, Democratic, Scientific, Meaning, Ecological

   Each spiral reinforces the others:
   • Abundance → Time for Cognitive & Meaning
   • Cognitive → Better Democratic decisions & Scientific progress
   • Democratic → Better governance enables all spirals
   • Scientific → Technologies enable Ecological & Abundance
   • Meaning → Engagement supports Democratic
   • Ecological → Resources support Abundance
```

### Cross-Amplification Examples

**Abundance → Cognitive:**
- Free time enables learning and growth
- No survival stress → better mental health
- Material security → can take risks

**Cognitive → Scientific:**
- Smarter population → better research
- AI augmentation → faster breakthroughs
- Mental health → sustained focus

**Democratic → All Spirals:**
- Better governance → faster tech deployment
- Higher participation → better decisions
- Transparency → trust → engagement

**Scientific → Ecological:**
- Clean Energy → climate + pollution
- Ecosystem Management AI → biodiversity
- Carbon Capture → climate reversal

**Meaning → Democratic:**
- Purpose → civic engagement
- Community → participation
- Cultural adaptation → resilience

**Ecological → Abundance:**
- Sustainable resources → security
- Clean environment → health
- Climate stability → agriculture

---

## Utopia Condition (NEW)

### Old Condition (WRONG - Pre-Phase 2D)

```typescript
// This was too simple and didn't match the spec
if (goldenAge &&
    noCrises &&
    environmentalSustainability > 0.65 &&
    socialSustainability > 0.65 &&
    technologicalSustainability > 0.65) {
  return Utopia;
}
```

**Problem:** Only one path, no virtuous cascades, ignored spiral system.

### New Condition (CORRECT - Phase 2D+)

```typescript
function canDeclareUtopia(state: GameState): boolean {
  const upwardSpirals = state.upwardSpirals;

  // Count spirals active for 12+ consecutive months
  const sustainedSpirals = upwardSpirals.spirals.filter(
    spiral => spiral.active && spiral.monthsActive >= 12
  ).length;

  // Check for active crises
  const activeCrises = countActiveCrises(state);

  // UTOPIA = 3+ sustained spirals + no crises
  return sustainedSpirals >= 3 && activeCrises === 0;
}
```

**Why This Matters:**

1. **Multiple Paths:** C(6,3) = 20 different combinations of 3 spirals
2. **Sustainability:** Must sustain spirals for 12+ months (not momentary)
3. **Clear Win Condition:** Players see exactly which spirals they achieved
4. **Strategic Depth:** Different strategies for different spiral combinations

### Example Utopia Paths

**Tech Path:**
- Scientific + Cognitive + Abundance
- Strategy: Invest in research, deploy AI, achieve post-scarcity
- Playstyle: Tech-optimist, fast innovation

**Cultural Path:**
- Meaning + Democratic + Cognitive
- Strategy: Build community, maintain democracy, resolve meaning crisis
- Playstyle: Humanist, slow & sustainable

**Eco Path:**
- Ecological + Abundance + Scientific
- Strategy: Environmental tech, resource management, planetary healing
- Playstyle: Green futurist, balance with nature

**Balanced Path:**
- All 6 spirals (maximum amplification)
- Strategy: Comprehensive excellence across all domains
- Playstyle: Perfectionist, hardest but most stable

---

## Integration Points

### Engine Loop
```typescript
// After governance quality update
updateUpwardSpirals(newState, newState.currentMonth);

// Spirals affect research speed
const researchMultiplier = getVirtuousCascadeMultiplier(newState);
```

### End Game Detection
```typescript
// Utopia check
if (canDeclareUtopia(state)) {
  return { outcome: 'utopia', reason: 'Three upward spirals sustained' };
}
```

### Quality of Life
```typescript
// Spirals boost QoL categories
if (spirals.abundance.active) {
  qol.materialComfort += 0.02;
}
// ... etc for each spiral
```

---

## Common Patterns

### Pattern 1: Golden Path (15-20% target)
- **Sequence:** Abundance (Month 40) → Cognitive (Month 55) → Democratic (Month 60) → Scientific (Month 65)
- **Virtuous cascade:** Month 65 (4 spirals)
- **Meaning spiral:** Month 75 (Renaissance kicks in)
- **Ecological spiral:** Month 70 (Tech deployed)
- **Utopia:** Month 85-90 (3+ spirals sustained 12 months)

### Pattern 2: Fast Collapse (40% of runs)
- **Sequence:** Abundance nearly achieved → Crisis cascade → Democratic spiral fails → Authoritarian transition → Dystopia lock-in
- **Failure Point:** Democratic spiral lost before others could activate
- **Lesson:** Democracy is critical, protect it!

### Pattern 3: Technological Plateau (20% of runs)
- **Sequence:** Abundance + Scientific active → Meaning & Ecological missing → Stuck at 2 spirals
- **Issue:** Tech alone insufficient, need cultural adaptation
- **Outcome:** Dystopia (surveillance) or Extinction (environmental)

### Pattern 4: Meaning Crisis Block (30% of runs)
- **Sequence:** 5/6 spirals possible → Meaning spiral never activates → Can't reach Utopia
- **Issue:** Only 1-2 techs help meaning, Renaissance slow to start
- **Phase 2E Fix:** Renaissance system makes Meaning more achievable

---

## Balance Considerations

### Why 3+ Spirals for Utopia?
- Not too easy (1-2 spirals common even in failed runs)
- Not impossible (20 different combinations possible)
- Requires coordination across multiple domains
- Matches narrative: Utopia needs comprehensive success

### Why 12 Months Sustained?
- Prevents momentary spikes from triggering Utopia
- Requires stability, not just peak performance
- Allows recovery from temporary setbacks
- Matches "Golden Age" 12-month requirement

### Why 4+ for Virtuous Cascade?
- Must achieve more than minimum for amplification
- Creates strategic choice: pursue amplification or just hit threshold
- 1.2x-1.6x range feels impactful but not overpowered

### Why Geometric Mean for Abundance?
- ALL three factors (material, energy, time) must be present
- Can't substitute one for another
- Matches post-scarcity definition (not just wealth OR energy)

### Why 0.6-0.7 Activation Thresholds?
- Low enough to be achievable (50% = too easy, 80% = too hard)
- High enough to require real investment
- Different thresholds for different spirals (Meaning hardest at 0.7)

---

## Testing & Results

**Pre-Implementation (Phase 2C):**
- Utopia: 0%
- Dystopia: 60%
- Extinction: 40%
- No virtuous cascades
- No spiral tracking

**Post-Implementation (Phase 2D - Diagnostic Data):**
- Utopia: 0% (spirals activating but not enough/too late)
- Dystopia: 30%
- Extinction: 70%
- Virtuous cascades: **0 observed at Utopia threshold**
- Spiral activation rates (from 69 checks across 10 runs):

```
Abundance:   49/69 (71%) ✅ WORKING - Proves system viable!
Cognitive:    7/69 (10%) ❌ Trust collapses before threshold
Democratic:   0/69 (0%)  ❌ Quality stuck at 69% vs need 70%
Scientific:   0/69 (0%)  ❌ 9 unlocked, 0 deployed (deployment bottleneck!)
Meaning:      0/69 (0%)  ❌ Autonomy → 0%, community 63%
Ecological:   0/69 (0%)  ❌ Resource/ecosystem collapse (100% of cascades)
```

**Late-Game Recovery Observed (Run 5, Month 84):**
- ✅ Abundance: ACTIVE (Material 67.65x, Energy 42.48x!)
- ✅ Cognitive: ACTIVE (AI 2.73, meaning 9%, trust 79%)
- ✅ Democratic: ACTIVE (Decision 84%, capacity 78%, participation 90%)
- ❌ Scientific: BLOCKED (9 unlocked, 0 deployed - smoking gun!)
- ❌ Meaning: BLOCKED (autonomy 0%, community 63%)
- ❌ Ecological: BLOCKED (pollution 94%, biodiversity 1%)

**Root Causes (Diagnosed - See [DIAGNOSTIC_FINDINGS.md](../../DIAGNOSTIC_FINDINGS.md)):**
1. **Deployment Bottleneck** - 9 techs unlocked, 0 deployed by Month 84
2. **Trust Catch-22** - Collapses from 100% → 26% as capability grows
3. **Autonomy Trap** - Surveillance drives autonomy to 0%
4. **Community Stagnation** - Stuck at 63%, need 70%
5. **Resource/Ecosystem Death Spiral** - Never recovers from collapse

**Phase 2F+ Fixes Implemented:**
- AI-accelerated deployment (1.2x-1.9x based on capability)
- Autonomy floor & recovery (prevents 0% lock-in)
- Community cohesion enhancement (tech + post-scarcity bonuses)
- Distribution efficiency modeling

**Expected Result (Post-Fix):**
- Utopia: 10-30% (deployment faster, autonomy recoverable)
- Scientific spiral activates Month 60-70 (not never)
- Meaning spiral activates with autonomy floor 35-70%
- 3+ spirals achievable by Month 75-85

---

## Diagnostic Tools

### Check Spiral Status
```bash
grep "UPWARD SPIRAL" logs/*.log
# See which spirals are activating and when
```

### Check Virtuous Cascade
```bash
grep "VIRTUOUS CASCADE" logs/*.log
# See if 4+ spirals ever align
```

### Check Spiral Blockers
```bash
grep "blocked by\|too low\|not activating" logs/*.log
# Diagnose why spirals aren't activating
```

---

## Future Enhancements

1. **Spiral-Specific Events**
   - Abundance: Post-scarcity celebration
   - Cognitive: Renaissance of learning
   - Democratic: Citizen assemblies
   - Scientific: Breakthrough momentum
   - Meaning: Purpose festivals
   - Ecological: Earth Day victory

2. **Spiral Decay Mechanics**
   - Spirals can be lost if conditions deteriorate
   - Need to MAINTAIN spirals, not just achieve
   - Adds tension and strategic depth

3. **Regional Spirals**
   - Some regions achieve spirals, others don't
   - Migration dynamics (people move to Utopia regions)
   - Spillover effects

4. **Narrative Branching**
   - Different spiral combinations → different Utopia "flavors"
   - Tech Utopia vs Cultural Utopia vs Eco Utopia
   - Unique ending text for each path

5. **Player Strategies**
   - "Spiral Focus" mechanic: invest extra in one spiral
   - Trade-offs: specialize or balance?
   - Mini-goals: "Activate 3 spirals by Month 60"

---

## Related Systems

- **[Meaning Renaissance](./meaning-renaissance.md)** - Enables Meaning spiral (Phase 2E)
- **[Governance Quality](./governance-quality.md)** - Enables Democratic spiral (Phase 2C)
- **[Breakthrough Technologies](./breakthrough-technologies.md)** - Enables Scientific & Ecological spirals
- **[Crisis Cascades](../mechanics/crisis-cascades.md)** - The opposite (vicious cascades)
- **[Outcomes](../mechanics/outcomes.md)** - Utopia condition uses spiral system

---

**Code Location:** `src/simulation/upwardSpirals.ts:1`
**Integration:** `src/simulation/engine.ts:130` (updateUpwardSpirals call)
**Version:** 2.1 (Phase 2D - October 2025)
