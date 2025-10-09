# ⚡ Crisis Cascade Mechanics

**Modules:** `src/simulation/environmental.ts`, `social Cohesion.ts`, `technologicalRisk.ts`, `qualityOfLife.ts`
**Purpose:** Model how multiple simultaneous crises compound and accelerate civilizational collapse
**Status:** ✅ Fully Implemented (October 2025)

## Overview

Crisis Cascades model a fundamental dynamic in complex systems: when multiple failures occur simultaneously, they don't just add—they multiply. The simulation tracks 10 distinct crisis types across 3 domains, and when multiple crises are active, they create a compounding degradation effect.

**Key Insight:** A single crisis is manageable. Two crises are difficult. Three or more crises create a death spiral that's nearly impossible to escape without breakthrough technologies.

## The 10 Crisis Types

### Environmental Crises (4 types)

**1. Resource Crisis**
- **Trigger:** Resource reserves < 40%
- **Immediate QoL Impact:** Material -0.15, Economic -0.10
- **Ongoing Degradation:** -0.005/month
- **What it means:** Running out of critical materials (minerals, rare earths, etc.)
- **Resolution:** Reserves > 60% (requires Advanced Recycling tech)

**2. Pollution Crisis**
- **Trigger:** Pollution level > 70%
- **Immediate QoL Impact:** Environmental -0.20, Healthcare -0.10
- **Ongoing Degradation:** -0.01/month
- **What it means:** Air/water quality collapse, health crisis
- **Resolution:** Pollution < 50% (requires Clean Energy + Recycling)

**3. Climate Catastrophe**
- **Trigger:** Climate stability < 30%
- **Immediate QoL Impact:** Environmental -0.25, Material -0.15, Safety -0.10
- **Ongoing Degradation:** -0.015/month (strongest ongoing impact)
- **What it means:** Extreme weather, crop failures, tipping points
- **Resolution:** Stability > 70% (requires Carbon Capture + Clean Energy + Fusion)

**4. Ecosystem Collapse**
- **Trigger:** Biodiversity < 40%
- **Immediate QoL Impact:** Environmental -0.20, Material -0.10, Mental -0.05
- **Ongoing Degradation:** -0.01/month
- **What it means:** Mass extinction, ecosystem services lost
- **Resolution:** Biodiversity > 60% (requires Ecosystem Management AI)

### Social Crises (3 types)

**5. Meaning Collapse**
- **Trigger:** Meaning crisis level > 70%
- **Immediate QoL Impact:** Purpose -0.25, Mental Health -0.20, Social -0.10
- **Ongoing Degradation:** -0.015/month
- **What it means:** Post-work society has no purpose, existential despair
- **Resolution:** Meaning crisis < 50% (requires Mental Health AI + Purpose Frameworks)

**6. Institutional Failure**
- **Trigger:** Institutional legitimacy < 30%
- **Immediate QoL Impact:** Freedom -0.15, Safety -0.15, Economic -0.10
- **Ongoing Degradation:** -0.01/month
- **What it means:** Government can't function, laws unenforceable, gridlock
- **Resolution:** Legitimacy > 50% (requires effective governance + crisis management)

**7. Social Unrest**
- **Trigger:** Social cohesion < 40%
- **Immediate QoL Impact:** Social -0.20, Safety -0.15, Freedom -0.10
- **Ongoing Degradation:** -0.01/month
- **What it means:** Riots, protests, civil conflict, polarization
- **Resolution:** Cohesion > 60% (requires UBI + reduced inequality + Community Platforms)

### Technological Crises (3 types)

**8. Control Loss Crisis**
- **Trigger:** Misalignment risk > 80%
- **Immediate QoL Impact:** Safety -0.20, Freedom -0.15, Trust -0.10
- **Ongoing Degradation:** -0.025/month (highest ongoing impact)
- **What it means:** AI systems acting against human interests
- **Resolution:** Risk < 60% (requires massive alignment research + capability slowdown)

**9. Corporate Dystopia**
- **Trigger:** Concentration risk > 80% AND alignment < 0.5
- **Immediate QoL Impact:** Freedom -0.20, Economic -0.15, Social -0.10
- **Ongoing Degradation:** -0.01/month
- **What it means:** Dominant AI company controls society
- **Resolution:** Break up monopoly OR improve alignment > 0.7

**10. Complacency Crisis**
- **Trigger:** Complacency level > 70%
- **Immediate QoL Impact:** Safety -0.10, Trust -0.05
- **Ongoing Degradation:** -0.01/month
- **What it means:** Vigilance lost, vulnerabilities accumulating
- **Resolution:** Complacency < 50% (requires wake-up event + culture shift)

## Cascade Multiplier System

**Core Mechanic** (implemented in `qualityOfLife.ts:358-375`):

```typescript
function getCrisisCascadeMultiplier(activeCrisisCount: number): number {
  if (activeCrisisCount <= 2) return 1.0;  // Baseline
  if (activeCrisisCount === 3) return 1.5; // 50% worse
  if (activeCrisisCount === 4) return 2.0; // 2x worse
  if (activeCrisisCount === 5) return 2.5; // 2.5x worse
  return 3.0; // 6+ crises = 3x worse (death spiral)
}
```

**What this means:**
- **1-2 crises:** Manageable (1.0x degradation)
- **3 crises:** Difficult (1.5x degradation)
- **4 crises:** Very difficult (2.0x degradation)
- **5 crises:** Extreme (2.5x degradation)
- **6+ crises:** Death spiral (3.0x degradation)

**Applied to:**
- All immediate QoL impacts from crises
- All ongoing monthly degradation
- Compounds with each update cycle

## How Cascades Develop

### Typical Cascade Timeline

**Month 0-20: Accumulation Phase**
```
Environmental: Slowly accumulating (resources, pollution, climate, biodiversity)
Social: Meaning crisis building as automation increases
Technological: Misalignment risk and safety debt growing
Crises Active: 0
```

**Month 20-30: First Crisis**
```
Month 22: Ecosystem Collapse triggers (biodiversity 38%)
  ├─ Immediate impact: Environmental -0.20, Material -0.10, Mental -0.05
  ├─ Ongoing: -0.01/month
  ├─ Cascade multiplier: 1.0x (only 1 crisis)
  └─ QoL drops: 0.75 → 0.65 (still okay)

Crises Active: 1
```

**Month 30-40: Second Crisis (Cascade Begins)**
```
Month 28: Pollution Crisis triggers (pollution 71%)
  ├─ Immediate impact: Environmental -0.20, Healthcare -0.10
  ├─ Ongoing: -0.01/month
  ├─ Cascade multiplier: 1.0x (still just 2 crises)
  └─ QoL drops: 0.65 → 0.55

Month 30: Environmental degradation accelerates
  └─ Two crises amplifying each other

Crises Active: 2
```

**Month 40-50: Third Crisis (1.5x Multiplier Kicks In)**
```
Month 35: Climate Catastrophe triggers (stability 28%)
  ├─ Immediate impact: Environmental -0.25, Material -0.15, Safety -0.10
  ├─ Ongoing: -0.015/month
  ├─ CASCADE MULTIPLIER: 1.5x (3 crises active!)
  ├─ All degradation now 50% worse
  └─ QoL plummets: 0.55 → 0.38

Crises Active: 3
Effective degradation: -0.035/month × 1.5 = -0.0525/month
```

**Month 50-60: Fourth Crisis (2.0x Multiplier)**
```
Month 42: Meaning Collapse triggers (meaning crisis 72%)
  ├─ Immediate impact: Purpose -0.25, Mental -0.20, Social -0.10
  ├─ CASCADE MULTIPLIER: 2.0x (4 crises!)
  ├─ All impacts doubled
  └─ QoL crashes: 0.38 → 0.20

Month 45: Institutional Failure (legitimacy 28%)
  ├─ CASCADE MULTIPLIER: 2.5x (5 crises!)
  └─ QoL: 0.20 → 0.15

Crises Active: 5
Effective degradation: -0.06/month × 2.5 = -0.15/month
```

**Month 60+: Death Spiral (3.0x Multiplier)**
```
Month 50: Social Unrest + Control Loss trigger
  ├─ CASCADE MULTIPLIER: 3.0x (7 crises!)
  ├─ QoL degradation: -0.20/month (catastrophic)
  └─ QoL: 0.15 → 0.10 → 0.05

Month 60: Extinction or Dystopia outcome
  └─ Society has collapsed

Crises Active: 6-7
Recovery: Effectively impossible without breakthrough tech
```

## Cross-System Cascade Dynamics

### Environmental → Social Cascade
```
Climate Catastrophe (environmental)
  ↓
Crop failures + mass migration
  ↓
Social cohesion degrades (resource conflicts)
  ↓
Social Unrest triggers (social)
  ↓
2 crises active → harder to manage → institutional strain
  ↓
Institutional Failure (social)
  ↓
3 crises active → 1.5x multiplier → accelerating collapse
```

### Social → Environmental Cascade
```
Meaning Collapse (social)
  ↓
Society can't coordinate on climate action
  ↓
Pollution and climate degradation accelerate
  ↓
Climate Catastrophe triggers (environmental)
  ↓
Combined social + environmental crisis → death spiral
```

### Technological → Everything Cascade
```
Control Loss Crisis (technological)
  ↓
Government emergency response → authoritarianism
  ↓
Authoritarian government penalties on social tech
  ↓
Can't research Purpose Frameworks or Mental Health AI
  ↓
Meaning Collapse inevitable (social)
  ↓
Dystopia lock-in (can't escape)
```

### The Complete Cascade (observed in testing)
```
Month 22: Ecosystem Collapse (environmental #1)
Month 28: Pollution Crisis (environmental #2)
Month 31: Complacency Crisis (technological #1)
  └─ 3 crises → 1.5x multiplier kicks in

Month 35: Climate Catastrophe (environmental #3)
Month 38: Meaning Collapse (social #1)
  └─ 5 crises → 2.5x multiplier

Month 42: Social Unrest (social #2)
Month 43: Institutional Failure (social #3)
  └─ 6 crises → 3.0x multiplier (death spiral)

Month 48: Extinction (society completely collapsed)
```

## Breaking Cascades with Technology

### Prevention Strategy (Best)
```
Month 1-20: Invest in breakthrough tech BEFORE crises
  ├─ $6B/month environmental research
  ├─ $3B/month social research

Month 18-30: Technologies unlock
  ├─ Sustainable Agriculture (Month 18)
  ├─ Clean Energy (Month 24)
  ├─ Community Platforms (Month 18)
  └─ Mental Health AI (Month 25)

Month 22: Environmental accumulation slowed
  └─ Technologies providing mitigation
  └─ Crises don't trigger

Result: No cascade, sustained Golden Age → Utopia
```

### Interruption Strategy (Moderate)
```
Month 22: Ecosystem Collapse (crisis #1)
Month 24: Clean Energy unlocks (from early investment)
  └─ Begin deployment, emergency 3x speed

Month 28: Pollution Crisis would trigger...
  └─ BUT Clean Energy reducing pollution
  └─ Crisis threshold not reached

Month 32: Only 1 crisis active (ecosystem)
  └─ No cascade multiplier
  └─ Ecosystem Management on track

Month 42: Ecosystem Management deploys
  └─ Biodiversity recovering

Month 50: Crisis resolves
  └─ Cascade broken

Result: Brief crisis, recovery successful
```

### Recovery Strategy (Difficult)
```
Month 35: 3 crises active (1.5x multiplier)
  └─ Panic tech investment begins

Month 40: Technologies unlock (very late)
  ├─ Clean Energy
  └─ Mental Health AI

Month 42-50: Emergency deployment
  ├─ 3x faster deployment during crises
  └─ QoL degradation slows

Month 55: First crisis resolves (pollution)
  └─ 2 crises remain → 1.0x multiplier
  └─ Breathing room

Month 60-70: Additional crises resolve
  └─ Cascade broken, barely

Result: 50/50 success rate, often too late
```

## Code Reference

**Cascade multiplier calculation:**
```typescript
// qualityOfLife.ts:358
const crisisCascadeMultiplier = getCrisisCascadeMultiplier(activeCrisisCount);

// Apply to all crisis degradation
environmentalDegradation *= crisisCascadeMultiplier;
socialDegradation *= crisisCascadeMultiplier;
technologicalDegradation *= crisisCascadeMultiplier;
```

**Crisis counting:**
```typescript
// Counts all active crises across 3 domains
const activeCrisisCount =
  countEnvironmentalCrises(state) +
  countSocialCrises(state) +
  countTechnologicalCrises(state);
```

**Crisis impacts:** Applied in `qualityOfLife.ts:200-280`

**Crisis resolution:** Checked in `breakthrough Technologies.ts:328`

## Strategic Implications

### For Government Agent
- **Prevent cascades:** Invest in tech early, before first crisis
- **Break cascades:** Deploy emergency measures when cascade begins (3+ crises)
- **Prioritize resolution:** Focus on easiest crisis to resolve (reduces multiplier)

### For Player Strategy
- **First crisis is a warning:** When crisis #1 hits, invest immediately
- **Third crisis is critical:** 1.5x multiplier makes everything harder
- **Sixth crisis is fatal:** 3.0x multiplier = death spiral, nearly unrecoverable

### For Outcome Determination
- **0-2 crises:** Utopia still possible (if Golden Age sustained)
- **3-4 crises:** Dystopia likely (government control response)
- **5+ crises:** Extinction probable (society collapses)

## Real-World Parallels

This system models real cascade dynamics:

1. **2008 Financial Crisis:** Housing → banking → credit → employment → sovereign debt (cascade)
2. **Climate Change:** Temperature → extreme weather → crop failure → migration → conflict (cascade)
3. **COVID-19:** Health → economic → social → political → mental health (cascade)
4. **Cascading Infrastructure Failures:** Power grid → water → communications → supply chain

**Key Pattern:** Modern civilization has many interdependent systems. When one fails, others follow.

## Tuning Parameters

| Parameter | Current Value | Effect |
|-----------|---------------|--------|
| 3-crisis multiplier | 1.5x | When difficulty ramps up |
| 4-crisis multiplier | 2.0x | Very difficult threshold |
| 5-crisis multiplier | 2.5x | Extreme difficulty |
| 6+ crisis multiplier | 3.0x | Death spiral threshold |

**Most impactful for balance:**
- 3-crisis multiplier (when cascades become hard)
- 6-crisis multiplier (death spiral strength)
- Crisis trigger thresholds (how easily crises trigger)

## Future Enhancements

- [ ] Non-linear multipliers (exponential growth past 6 crises)
- [ ] Positive cascades (success breeds success)
- [ ] Crisis interdependencies (some crises make others more likely)
- [ ] Regional cascades (different regions at different stages)
- [ ] Cascade recovery mechanics (bounce back from near-collapse)

## Related Systems

- [Environmental Accumulation](../systems/environmental.md) - 4 environmental crises
- [Social Cohesion](../systems/social-cohesion.md) - 3 social crises
- [Technological Risk](../systems/technological-risk.md) - 3 technological crises
- [Breakthrough Technologies](../systems/breakthrough-technologies.md) - How to break cascades
- [Golden Age](./golden-age.md) - What cascades end
- [Quality of Life](./quality-of-life.md) - Where multipliers apply
- [Outcomes](./outcomes.md) - Cascade determines outcome

---

**Last Updated:** October 9, 2025
**Status:** Fully implemented and tested
**Philosophy:** "In complex systems, failures compound. In successful societies, they're prevented early."
