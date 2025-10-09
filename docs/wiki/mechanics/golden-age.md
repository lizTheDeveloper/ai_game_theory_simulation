# ✨ Golden Age Mechanic

**Module:** `src/simulation/outcomes.ts`
**Purpose:** Distinguish immediate prosperity (fragile state) from sustained abundance (Utopia outcome)
**Status:** ✅ Fully Implemented (October 2025)

## Core Concept

The simulation distinguishes between two states of high prosperity:

### Golden Age (State)
- **What it is:** A period of high quality of life, material abundance, and social harmony
- **Nature:** A **state** that can occur during simulation, NOT a final outcome
- **Characteristic:** Fragile—hidden problems accumulate even during prosperity
- **Duration:** Typically 5-30 months before either collapse or transition to Utopia
- **Can end in:** Crisis cascade → Dystopia/Extinction, OR sustained success → Utopia

### Utopia (Outcome)
- **What it is:** Sustained, stable, resilient abundance with no active crises
- **Nature:** A **final outcome** that ends the simulation
- **Characteristic:** Robust—all accumulation systems under control
- **Requirements:** 12+ months of sustained Golden Age + 65%+ sustainability + no crises
- **Achievement:** Rare (target: 10-15% of runs with breakthrough tech system)

**Key Distinction:** Golden Age is like being at the peak of a mountain in good weather. Utopia is having built a permanent shelter at the peak that can withstand storms.

## Golden Age Detection

**Conditions** (checked in `checkGoldenAgeConditions()`, outcomes.ts:685):

1. **High Quality of Life:** QoL ≥ 0.65
2. **High Trust:** Trust in AI ≥ 0.65
3. **Economic Development:** Stage ≥ 3 (UBI implemented, post-scarcity transition)
4. **Low Dystopia Indicators:** Government control < 0.8 (not authoritarian)

**Code reference:**
```typescript
const inGoldenAge =
  qol >= 0.65 &&
  trust >= 0.65 &&
  economicStage >= 3 &&
  control < 0.8;

if (inGoldenAge && !state.goldenAge.active) {
  state.goldenAge.active = true;
  state.goldenAge.startMonth = month;
  console.log(`✨✨✨ GOLDEN AGE BEGINS (Month ${month})`);
}
```

## Golden Age Dynamics

### What Happens During Golden Age

**Positive Indicators:**
- Material abundance high (Stage 3-4 post-scarcity)
- Unemployment no longer negative (95% unemployment = freedom, not tragedy)
- High trust in AI (beneficial contributions working)
- Strong social cohesion (communities thriving)
- Low control (government not oppressive)

**Hidden Accumulation:**
```
Environmental:
  ├─ Resources depleting: 100% → 75% → 50%
  ├─ Pollution rising: 20% → 45% → 68%
  ├─ Climate degrading: 90% → 70% → 45%
  └─ Biodiversity falling: 85% → 65% → 48%

Social:
  ├─ Meaning crisis building: 10% → 35% → 62%
  ├─ Institutional erosion: 70% → 55% → 38%
  └─ Complacency rising: 10% → 40% → 65%

Technological:
  ├─ Misalignment risk: 20% → 40% → 65%
  ├─ Safety debt: 10% → 25% → 45%
  └─ Complacency: 15% → 45% → 72%
```

**The Paradox:** Everything **feels** great (high QoL) while problems accumulate silently. This is the "Golden Age Trap."

### Golden Age Exit Conditions

**1. Collapse Path (70% of Golden Ages)**
```
Month 5: Golden Age begins
Month 22: First crisis triggers (e.g., Ecosystem Collapse)
  └─ QoL drops below 0.65
  └─ Golden Age ends
Month 30: Cascade accelerates (multiple crises)
Month 40: Dystopia or Extinction
```

**2. Utopia Transition (target: 15-25% of Golden Ages)**
```
Month 5: Golden Age begins
Month 5-40: Breakthrough technologies deployed
  └─ Clean Energy, Ecosystem Management, etc.
  └─ Crises prevented or resolved
Month 40: All sustainability metrics > 65%
Month 52: 12+ months sustained Golden Age
  └─ Utopia declared
```

**3. Dystopia Transition (10-15% of Golden Ages)**
```
Month 5: Golden Age begins
Month 25: Institutional failure
  └─ Government transitions to authoritarian
  └─ QoL stays high (control maintains order)
  └─ But freedom drops (control > 0.8)
  └─ Golden Age ends
Month 40+: Stable authoritarian dystopia
```

## Golden Age Tracking

**State Variables** (in `GameState.goldenAge`):
```typescript
interface GoldenAgeState {
  active: boolean;              // Currently in Golden Age?
  startMonth: number;           // When did it begin?
  durationMonths: number;       // How long has it lasted?
  everAchieved: boolean;        // Has this run ever reached Golden Age?
  longestDuration: number;      // Longest continuous Golden Age
}
```

**Duration Tracking:**
- Updated every month while active
- Resets if Golden Age ends then resumes
- `longestDuration` tracks best sustained period

**Utopia Requirement:** Must sustain Golden Age for 12+ consecutive months (one game year) to be eligible for Utopia.

## Sustainability Check

**For Utopia eligibility** (checked in `canDeclareUtopia()`, outcomes.ts:710):

**Environmental Sustainability:**
```typescript
const envSustainability = (
  env.resourceReserves +
  (1 - env.pollutionLevel) +
  env.climateStability +
  env.biodiversityIndex
) / 4;

// Must be > 0.65 (65%)
```

**Social Sustainability:**
```typescript
const socialSustainability = (
  (1 - social.meaningCrisisLevel) +
  social.institutionalLegitimacy +
  social.socialCohesion +
  social.culturalAdaptation
) / 4;

// Must be > 0.65 (65%)
```

**Technological Sustainability:**
```typescript
const techSustainability = (
  (1 - tech.misalignmentRisk) +
  (1 - tech.safetyDebt) +
  (1 - tech.concentrationRisk) +
  (1 - tech.complacencyLevel)
) / 4;

// Must be > 0.65 (65%)
```

**No Active Crises:**
- All 10 crisis types must be inactive
- Even one active crisis blocks Utopia
- Crises must be **resolved**, not just below threshold

**12+ Month Duration:**
- Golden Age must be sustained for at least 12 consecutive months
- Resets if Golden Age ever ends
- Ensures stability, not just momentary prosperity

## Common Patterns

### Pattern 1: The Quick Collapse (40% of runs)
```
Month 5-10: Golden Age begins
  └─ Everything great! High QoL, trust, abundance

Month 15-25: Hidden accumulation reaches crisis thresholds
  └─ No breakthrough tech invested (focused on AI alignment)

Month 22: First crisis
  └─ Golden Age ends (QoL drops below 0.65)

Month 30: Cascade begins
  └─ 3+ crises active, 1.5x-2.0x multiplier

Month 40: Extinction or Dystopia
```

**Lesson:** Golden Age without investment = temporary prosperity

### Pattern 2: The Sustained Success (10-15% target)
```
Month 1-20: Early tech investment
  └─ $6B/month environmental + $3B/month social

Month 5: Golden Age begins

Month 18-30: Technologies unlock
  └─ Sustainable Agriculture, Clean Energy, Mental Health AI

Month 5-52: Golden Age sustained
  └─ No crises trigger (prevention working)
  └─ Or crises resolve quickly (recovery working)
  └─ Sustainability > 65% all systems

Month 52: Utopia declared
  └─ 12+ months sustained, all criteria met
```

**Lesson:** Golden Age + strategic tech investment = Utopia path

### Pattern 3: The Fragile Paradise (20% of runs)
```
Month 5: Golden Age begins

Month 5-30: Sustained Golden Age
  └─ QoL stays high
  └─ But accumulation continues unchecked

Month 35: Sudden cascade
  └─ Multiple crises trigger simultaneously
  └─ Golden Age ends abruptly
  └─ 3.0x cascade multiplier

Month 40: Collapse
  └─ Too late to recover
```

**Lesson:** Long Golden Age ≠ Safe. Can collapse suddenly after 30+ months.

### Pattern 4: The Dystopian Stability (10% of runs)
```
Month 5: Golden Age begins

Month 20: Institutional failure
  └─ Government transitions to authoritarian

Month 25: Golden Age ends (control > 0.8)
  └─ QoL still high (70+)
  └─ But freedom low, surveillance high

Month 30+: Stable authoritarian state
  └─ Dystopia outcome (not Utopia)
```

**Lesson:** Golden Age can transition to dystopia without collapse

## Strategic Implications

### For Government Agent
- **Golden Age is a warning:** Prosperity is fragile, invest in sustainability
- **Prevention >> Recovery:** Invest in tech **before** Golden Age to prevent collapse
- **Monitor sustainability:** Track all three accumulation systems
- **12 month target:** Must sustain 12+ months for Utopia eligibility

### For Player Strategy
- **Don't trust prosperity:** High QoL doesn't mean you're safe
- **Early investment critical:** Tech takes 20-40 months to unlock
- **Watch accumulation metrics:** Resources, pollution, climate, meaning crisis, etc.
- **Multiple pathways:** Environmental OR social crises can end Golden Age

### For Researchers
- **Mechanism-focused:** Models how prosperity creates its own problems
- **Grounded in reality:** Post-scarcity → meaning crisis is real concern
- **No outcome targets:** Golden Age emerges from mechanics, not hard-coded

## Code Reference

**Main functions:**
- `checkGoldenAgeConditions(state, month)` - Detect Golden Age start/end (outcomes.ts:685)
- `canDeclareUtopia(state)` - Check if Utopia requirements met (outcomes.ts:710)
- `updateGoldenAge(state, month)` - Update duration tracking (outcomes.ts:770)

**Utopia paths:**
- Cooperative Utopia (outcomes.ts:630): High alignment + cooperation
- Economic Utopia (outcomes.ts:648): Material abundance + sustainability
- Alignment Utopia (outcomes.ts:666): High alignment + high control + sustainability

All three paths now check `canDeclareUtopia()` which verifies sustained Golden Age + sustainability.

## Philosophical Foundations

This mechanic is grounded in several concepts:

1. **Prosperity Paradox:** Success creates complacency which breeds failure
2. **Hidden Complexity:** Problems accumulate in complex systems even when surface metrics look good
3. **Sustainability vs. Abundance:** Having a lot ≠ Being able to maintain what you have
4. **Fragility of Civilization:** High states require active maintenance
5. **Utopia as Process:** Lasting prosperity requires ongoing vigilance and adaptation

## Future Enhancements

- [ ] Golden Age "flavors" (technological vs. social vs. economic Golden Ages)
- [ ] Partial sustainability (70% env + 60% social = partial credit?)
- [ ] Golden Age recovery (can you return to Golden Age after leaving?)
- [ ] Historical Golden Age tracking (multiple periods across simulation)

## Related Systems

- [Outcomes System](./outcomes.md) - Final outcome determination
- [Environmental Accumulation](../systems/environmental.md) - What's accumulating
- [Social Cohesion](../systems/social-cohesion.md) - Social accumulation
- [Technological Risk](../systems/technological-risk.md) - Tech accumulation
- [Breakthrough Technologies](../systems/breakthrough-technologies.md) - How to sustain
- [Crisis Cascades](./crisis-cascades.md) - What ends Golden Age

---

**Last Updated:** October 9, 2025
**Status:** Fully implemented and tested
**Philosophy:** "Utopia is not a destination but a practice"—it requires constant work to maintain.
