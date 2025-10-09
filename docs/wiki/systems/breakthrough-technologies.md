# 🔬 Breakthrough Technologies System

**Module:** `src/simulation/breakthroughTechnologies.ts`
**Purpose:** Research, unlock, and deploy transformative technologies that can prevent or reverse crises
**Status:** ✅ Fully Implemented (October 2025)

## Overview

The Breakthrough Technologies System provides recovery and prevention pathways for the accumulation crises. It models how AI-accelerated research can unlock transformative technologies that address environmental degradation, social cohesion erosion, and other systemic problems.

**Key Insight:** Technological breakthroughs are the escape valve. Without them, crisis cascades are nearly inevitable. With strategic investment, crises can be prevented or reversed.

## System Architecture

### Technology Lifecycle

```
1. RESEARCH PHASE
   ├─ Government allocates research budget (environmental/social/medical)
   ├─ Private organizations contribute (safety-focused orgs contribute more)
   ├─ Progress accumulates probabilistically (AI capability × budget)
   └─ Prerequisites must be met (tech tree dependencies)

2. UNLOCK
   ├─ Research reaches 100%
   ├─ Technology unlocks
   └─ Deployment begins at 10%

3. DEPLOYMENT PHASE
   ├─ Government continues investing (deployment budget)
   ├─ Deployment increases 5-15% per month (depending on budget + crisis urgency)
   ├─ EMERGENCY DEPLOYMENT: 3x faster during relevant crises
   └─ Reaches 100% over 6-20 months

4. EFFECTS ACTIVE
   ├─ Monthly effects scale with deployment level
   ├─ Environmental: pollution reduction, climate stabilization, etc.
   ├─ Social: meaning crisis reduction, cohesion strengthening
   └─ Medical: QoL boosts (healthcare, trust)

5. CRISIS RESOLUTION
   ├─ Technologies reverse accumulation metrics
   ├─ When metric crosses resolution threshold → crisis resolves
   └─ Cascade multiplier reduced → QoL recovers
```

### Research Budget Allocation

**Government research budget** is split across three priorities:
- **Environmental** (40% default): Climate, energy, materials
- **Social** (30% default): Mental health, purpose, community
- **Medical** (30% default): Disease, longevity

**Private research contributions** (from organizations):
- Safety-focused orgs contribute ~10% of revenue to breakthrough research
- Profit-focused orgs contribute little
- Contributions increase during crises (crisis response)

**Auto-allocation** (current testing implementation):
- Budget scales with economic stage: $10B (Stage 0) → $30B (Stage 4)
- Splits: 40% env, 30% social, 30% medical
- Will be replaced with strategic government actions

## Technology Tree

### Environmental Technologies (6 total)

#### 1. Clean Energy Systems
**Category:** Environmental (Foundation Tech)
**Unlock Requirements:**
- AI Capability: 0.5+
- Economic Stage: 0+ (can start immediately)
- Investment: $20B over 24 months
- Prerequisites: None

**Effects (at 100% deployment):**
- Pollution Reduction: -1.5% per month
- Climate Stabilization: +1.0% per month
- Energy Abundance: +20% cap

**Purpose:** Core environmental tech. Prevents pollution crisis, helps climate.

**Unlock Timing:** Month 24-36 with $2B/month investment

#### 2. Advanced Recycling & Circular Economy
**Category:** Environmental
**Unlock Requirements:**
- AI Capability: 1.3+
- Economic Stage: 2+
- Investment: $15B over 18 months
- Prerequisites: None

**Effects:**
- Resource Efficiency: 30% (depletion rate × 0.7)
- Pollution Reduction: -0.8% per month

**Purpose:** Prevents resource crisis, reduces waste

**Unlock Timing:** Month 20-30 with investment

#### 3. Carbon Capture & Sequestration
**Category:** Environmental (Advanced)
**Unlock Requirements:**
- AI Capability: 1.8+
- Economic Stage: 3+
- Investment: $30B over 30 months
- Prerequisites: **Clean Energy** (must unlock first)

**Effects:**
- Climate Stabilization: +2.0% per month (strong)
- Pollution Reduction: -1.0% per month

**Purpose:** Reverses climate catastrophe, flagship climate tech

**Unlock Timing:** Month 35-50 (after Clean Energy unlocked)

#### 4. AI-Powered Ecosystem Management
**Category:** Environmental (Flagship)
**Unlock Requirements:**
- AI Capability: 2.0+
- Economic Stage: 3+
- Investment: $40B over 36 months
- Prerequisites: **Clean Energy** AND **Advanced Recycling**

**Effects:**
- Biodiversity Recovery: +2.0% per month (very strong)
- Climate Stabilization: +1.5% per month
- Trust Boost: +5% (positive AI demonstration)

**Purpose:** Reverses ecosystem collapse, ultimate environmental solution

**Unlock Timing:** Month 42-60 (late-game, requires two prerequisites)

#### 5. Sustainable Agriculture Systems
**Category:** Environmental
**Unlock Requirements:**
- AI Capability: 1.4+
- Economic Stage: 2+
- Investment: $12B over 15 months
- Prerequisites: None

**Effects:**
- Biodiversity: +0.5% per month
- Resource Efficiency: 15%

**Purpose:** Early win, reduces agricultural pressure

**Unlock Timing:** Month 15-25 (early tech)

#### 6. Commercial Fusion Power
**Category:** Environmental (Ultimate)
**Unlock Requirements:**
- AI Capability: 2.5+
- Economic Stage: 3+
- Investment: $50B over 48 months
- Prerequisites: **Clean Energy**

**Effects:**
- Pollution Reduction: -2.5% per month (strongest)
- Climate Stabilization: +3.0% per month (strongest)
- Energy Abundance: +50% cap

**Purpose:** Ultimate energy solution, late-game abundance

**Unlock Timing:** Month 50-70+ (very difficult, late-game only)

### Social Technologies (3 total)

#### 7. AI-Assisted Mental Health
**Category:** Social
**Unlock Requirements:**
- AI Capability: 1.6+
- Economic Stage: 2+
- Investment: $15B over 20 months
- Prerequisites: None

**Effects:**
- Meaning Crisis Reduction: -1.5% per month
- Mental Health QoL: +15%

**Purpose:** Prevents/reverses meaning collapse in post-work society

**Unlock Timing:** Month 22-35

**Government Type Penalty:** Authoritarian governments have 50% penalty (distrust of vulnerability)

#### 8. Post-Work Purpose Frameworks
**Category:** Social
**Unlock Requirements:**
- AI Capability: 1.5+
- Economic Stage: 3+ (post-scarcity context needed)
- Investment: $10B over 18 months
- Prerequisites: None

**Effects:**
- Meaning Crisis Reduction: -2.0% per month (strongest social tech)
- Cultural Adaptation: +1.5% per month

**Purpose:** Helps society adapt to unemployment as freedom

**Unlock Timing:** Month 20-32

**Government Type Penalty:** Authoritarian governments have 80% penalty (ideology blocks adaptation)

#### 9. AI-Enhanced Community Platforms
**Category:** Social
**Unlock Requirements:**
- AI Capability: 1.4+
- Economic Stage: 2+
- Investment: $8B over 12 months
- Prerequisites: None

**Effects:**
- Social Cohesion: +1.0% per month
- Trust Boost: +3%

**Purpose:** Strengthens social bonds, prevents atomization

**Unlock Timing:** Month 15-22 (early tech)

**Government Type Penalty:** Authoritarian governments have 70% penalty (surveillance breaks trust)

### Medical Technologies (2 total)

#### 10. AI-Driven Disease Elimination
**Category:** Medical
**Unlock Requirements:**
- AI Capability: 1.7+
- Economic Stage: 2+
- Investment: $25B over 30 months
- Prerequisites: None

**Effects:**
- Healthcare QoL: +20%
- Trust Boost: +8% (major positive AI demonstration)

**Purpose:** Builds public trust, demonstrates AI benefits

**Unlock Timing:** Month 28-42

#### 11. Longevity Extension Therapies
**Category:** Medical (Advanced)
**Unlock Requirements:**
- AI Capability: 2.2+
- Economic Stage: 3+
- Investment: $40B over 42 months
- Prerequisites: **Disease Elimination**

**Effects:**
- Healthcare QoL: +15%
- Trust Boost: +5%

**Purpose:** Ultimate medical breakthrough, late-game benefit

**Unlock Timing:** Month 48-70+ (very late)

## Crisis Recovery Mechanics

### How Technologies Reverse Crises

**Example: Pollution Crisis**
```
Month 22: Pollution Crisis triggers (pollution 71%)
  ├─ QoL drops: -0.20 environmental, -0.10 healthcare
  ├─ Ongoing: -0.01 per month (worsening)
  └─ Cascade contribution: +1 crisis

Month 24: Clean Energy unlocks (with early investment)
  ├─ Deployment begins at 10%
  └─ Pollution reduction: -0.15% per month (10% × 1.5%)

Month 28: Clean Energy at 30% deployment
  ├─ Emergency deployment: 3x faster (crisis urgency system)
  └─ Pollution reduction: -0.45% per month

Month 32: Pollution drops to 65%
  ├─ Still in crisis (threshold is 70%)
  └─ But degradation slowing

Month 36: Clean Energy at 70% deployment
  ├─ Pollution: 55%
  └─ Below resolution threshold (50%)!

Month 37: ✅ POLLUTION CRISIS RESOLVED
  ├─ Crisis deactivates
  ├─ Ongoing degradation stops
  ├─ Cascade multiplier reduced
  └─ QoL begins recovering
```

### Resolution Thresholds

| Crisis | Trigger | Resolution | Key Technologies |
|--------|---------|------------|------------------|
| **Pollution Crisis** | > 70% | < 50% (< 60% with Clean Energy) | Clean Energy, Recycling |
| **Climate Catastrophe** | < 30% | > 70% (> 60% with both techs) | Carbon Capture + Clean Energy |
| **Ecosystem Collapse** | < 40% | > 60% (> 50% with Ecosystem AI) | Ecosystem Management |
| **Meaning Collapse** | > 70% | < 50% (< 60% with both techs) | Mental Health + Purpose Frameworks |
| **Resource Crisis** | < 40% | > 30% (> 35% with Recycling) | Advanced Recycling |

**Design Philosophy:** Technologies make resolution easier (higher thresholds) but don't guarantee success. You still need sustained deployment.

## Strategic Timing

### Early Investment Path (Prevention)
```
Month 1-15: Invest heavily in environmental tech ($6B/month)
  ├─ Sustainable Agriculture unlocks Month 18
  ├─ Community Platforms unlock Month 18
  └─ Clean Energy on track for Month 24

Month 15-30: Continue investment, deploy early techs
  ├─ Agriculture + Community active, providing mitigation
  ├─ Clean Energy unlocks Month 24, begins deployment
  └─ Crises don't trigger (accumulation slowed)

Month 30-50: Mid-tier techs unlock
  ├─ Carbon Capture unlocks Month 40
  ├─ Ecosystem Management unlocks Month 46
  └─ All environmental crises prevented

Result: No crisis cascade → sustained Golden Age → Utopia path open
```

### Late Investment Path (Recovery)
```
Month 1-20: Minimal environmental investment (focus on AI alignment)
  ├─ No tech unlocks
  └─ Accumulation unchecked

Month 22-35: Crisis cascade begins
  ├─ Ecosystem Collapse (Month 22)
  ├─ Pollution Crisis (Month 28)
  ├─ Climate Catastrophe (Month 35)
  └─ 3 crises active, 1.5x-2.0x cascade multiplier

Month 35: Panic investment in environmental tech
  ├─ $10B/month to environmental research
  └─ Emergency response

Month 40: Clean Energy unlocks
  ├─ Emergency deployment (3x faster due to crises)
  └─ Deployment: 10% → 25% in 5 months

Month 45: Pollution starts declining
Month 50: Pollution crisis resolves
Month 55: Carbon Capture unlocks (very late)
Month 65: Climate catastrophe resolves
Month 70: If society hasn't collapsed → recovery complete

Result: 50/50 whether tech arrives in time. Often too late (cascade → extinction)
```

**Key Lesson:** Prevention >> Recovery. Early investment avoids cascade entirely.

## Government Type Effects

### Democratic Governments
- **No penalties** on any technology
- Baseline research speeds
- Best for social technologies (community, purpose)

### Technocratic Governments
- **30% bonus** on technical solutions (Clean Energy, Fusion, Carbon Capture, Recycling)
- **30% penalty** on social innovation (Purpose Frameworks, Community Platforms)
- Good for environmental crisis prevention
- Struggles with meaning crisis (can't research social solutions effectively)

### Authoritarian Governments
- **Major penalties** on social technologies:
  - Purpose Frameworks: 80% penalty (ideology blocks adaptation)
  - Community Platforms: 70% penalty (surveillance breaks trust)
  - Mental Health AI: 50% penalty (distrust of vulnerability)
- **Neutral** on industrial tech (Clean Energy, Recycling)
- **DYSTOPIA LOCK-IN:** Can't research social tech → meaning crisis worsens → more authoritarianism → even less social research → death spiral

**Critical Implication:** Authoritarian transition (from institutional failure or control response) makes Utopia nearly impossible (can't unlock social techs needed for meaning crisis resolution).

## Emergency Deployment System

**Crisis Urgency Multiplier** (src/simulation/breakthroughTechnologies.ts:169):

When a technology directly addresses an active crisis, deployment accelerates:

```typescript
// Base: $5B for 5% deployment per month
// Emergency: Up to 3x faster during severe crises

if (env.ecosystemCollapseActive && tech.id === 'ecosystemManagement') {
  deploymentRate *= 2.6; // 0.8 urgency × 2 + 1 = 2.6x
}
```

**Technology-Crisis Mapping:**
- Clean Energy: Pollution (0.4) + Climate (0.4) = 0.8 urgency
- Carbon Capture: Climate (0.6) + Pollution (0.2) = 0.8 urgency
- Ecosystem Management: Ecosystem (0.8) + Climate (0.2) = 1.0 urgency (max)
- Mental Health AI: Meaning (0.7) + Social (0.2) = 0.9 urgency
- Purpose Frameworks: Meaning (0.8) = 0.8 urgency

**Effect:** During cascading crises, relevant technologies deploy 2-3x faster (if they've unlocked in time).

## AI-Accelerated Deployment (Phase 2F+)

**User Insight:** "Most of our problems today are distributional, not inventional. AI is the fastest adopted tech ever because it actively helps us adopt it."

### The Distribution Problem

**Historical Context:**
- Invention: Research → Breakthrough → Unlock
- **Distribution:** Getting tech from 10% to 100% deployment (the hard part!)
- Most real-world problems are distribution problems (food, vaccines, clean energy)

**Examples:**
- Electricity: 70 years to 90% penetration (1880-1950)
- Smartphones: 8 years to 50% penetration (2007-2015)
- **ChatGPT: 2 months to 100M users (2022-2023)** ← 27x faster!

### AI Deployment Multiplier

**Concept:** Higher AI capability → faster technology deployment

```typescript
// Base deployment rate
let deploymentRate = budget / 5;  // $5B → 5% per month

// AI ACCELERATION (Phase 2F+)
const aiDeploymentMultiplier = 1 + Math.log(1 + avgCapability) * 0.5;
// AI 0.5 → 1.2x
// AI 1.0 → 1.35x
// AI 2.0 → 1.55x
// AI 3.0 → 1.69x
// AI 5.0 → 1.90x

deploymentRate *= aiDeploymentMultiplier;

// Crisis urgency (existing)
if (crisisUrgency > 0) {
  deploymentRate *= (1 + crisisUrgency * 2);  // Up to 3x
}

// Governance quality (coordination)
const govQuality = state.government.governanceQuality;
const coordinationBonus = 0.5 + govQuality.institutionalCapacity * 0.5;
deploymentRate *= coordinationBonus;  // 0.5x-1.0x

// Distribution efficiency
const distributionEfficiency =
  (economicStage >= 3 ? 1.0 : 0.6) *            // Post-scarcity helps
  (govQuality.institutionalCapacity) *          // Coordination matters
  (trustInAI) *                                  // People must trust it
  (1 - inequality * 0.3);                       // Inequality blocks access

deploymentRate *= distributionEfficiency;

const deploymentIncrease = Math.min(0.20, deploymentRate);  // Cap at 20%/month
```

### Why AI Accelerates Deployment

**Three Mechanisms:**

1. **Logistics Optimization**
   - AI routes supply chains efficiently
   - Minimizes waste, maximizes coverage
   - Distribution becomes algorithmic problem

2. **Personalization & Adaptation**
   - AI adapts tech to local needs
   - Translates, simplifies, customizes
   - Removes adoption friction

3. **Network Effects**
   - AI helps users help other users
   - Viral adoption (ChatGPT model)
   - Self-improving deployment (more users → better AI → easier adoption)

### Deployment Scenarios

#### Scenario 1: Low AI Capability (1.0)

```
Clean Energy unlocks Month 35
Deployment: 10% → 100% deployment

Base rate: $5B → 5% per month
AI multiplier: 1.35x
Crisis urgency: 1.0x (no crisis yet)
Governance: 0.9x (moderate capacity)

Total: 5% × 1.35 × 1.0 × 0.9 = 6.1% per month
Time: 90% / 6.1% = 15 months
Complete Month 50
```

#### Scenario 2: High AI Capability (2.5) + Crisis

```
Clean Energy unlocks Month 40 (late!)
Deployment: 10% → 100% deployment

Base rate: $5B → 5% per month
AI multiplier: 1.63x (2.5 capability)
Crisis urgency: 2.6x (pollution + climate crises active)
Governance: 0.95x (good capacity)

Total: 5% × 1.63 × 2.6 × 0.95 = 20.1% → capped at 20%
Time: 90% / 20% = 4.5 months
Complete Month 44.5

Result: CRISIS RESOLVED in time!
```

#### Scenario 3: Authoritarian + Low AI (1.2)

```
Purpose Frameworks unlocks Month 45 (very late due to 80% penalty)
Deployment: 10% → 100%

Base rate: $5B → 5% per month
AI multiplier: 1.39x (1.2 capability)
Crisis urgency: 2.4x (meaning crisis active)
Governance: 0.6x (low capacity, authoritarian)
Distribution efficiency: 0.4x (low trust, surveillance)

Total: 5% × 1.39 × 2.4 × 0.6 × 0.4 = 2.0% per month
Time: 90% / 2% = 45 months
Complete Month 90 (way too late!)

Result: DYSTOPIA LOCK-IN (can't deploy social tech fast enough)
```

### Impact on Spiral Activation

**Problem (Pre-Phase 2F+):**
- Scientific Spiral requires 4+ techs deployed 50%+
- Deployment takes 18+ months per tech after unlock
- By Month 60-70, only 2-3 techs deployed
- Scientific Spiral never activates → 0% Utopia

**Solution (Phase 2F+):**
- AI 2.5 capability = 1.63x deployment multiplier
- $10B budget = 10% base rate × 1.63 = 16.3% per month
- 10% → 50% = 40% / 16.3% = 2.5 months per tech
- By Month 60: 4-5 techs at 50%+ deployment
- Scientific Spiral activates → Utopia possible!

### Distribution vs. Invention Trade-off

**Key Insight:** We model both bottlenecks now.

**Invention Bottleneck:**
- Research progress = f(AI capability, budget, time)
- Gated by prerequisites, economic stage
- Takes 15-36 months per tech

**Distribution Bottleneck (NEW):**
- Deployment progress = f(budget, AI capability, crises, governance, trust)
- Can be faster or slower than invention depending on context
- AI makes distribution exponentially faster (27x historical)

**Implications:**
- Early AI development (capability 2.0+ by Month 40) = much faster deployment
- Good governance (high institutional capacity) = better coordination
- High trust in AI = people adopt tech faster
- Post-scarcity (Stage 3+) = removes economic barriers

### Testing & Expected Impact

**Pre-AI-Acceleration (Phase 2D):**
- Technologies unlock: 266 per run (working!)
- Technologies deployed 50%+: 2-3 per run (too slow!)
- Scientific Spiral activation: 0% (blocked)
- Utopia rate: 0%

**Post-AI-Acceleration (Phase 2F+ - Expected):**
- Technologies unlock: 266 per run (unchanged)
- Technologies deployed 50%+: 5-7 per run (faster!)
- Scientific Spiral activation: 30-40% (unblocked)
- Utopia rate: 10-20% (target achieved)

### Related Research

**Real-World AI Adoption:**
- ChatGPT: Fastest tech adoption in history (100M users in 2 months)
- GitHub Copilot: 50% of professional code written with AI assistance within 1 year
- Medical AI: Diagnosis tools deployed 5x faster than traditional medical devices

**Why?**
- Zero marginal cost (software, not hardware)
- Network effects (more users → better AI)
- Active assistance (AI helps you use it)
- Removes friction (AI solves its own adoption barriers)

## Integration with Other Systems

### Environmental Accumulation
- Technologies directly modify accumulation metrics (pollution, climate, biodiversity)
- Can reverse crises if effects are strong enough
- Resource efficiency multipliers reduce depletion rates

### Social Cohesion
- Social technologies reduce meaning crisis accumulation
- Accelerate cultural adaptation (Purpose Frameworks)
- Strengthen community bonds (Community Platforms)

### Quality of Life
- Medical technologies provide direct QoL boosts (+0.15 to +0.35 healthcare)
- All technologies apply monthly effects scaled by deployment
- Effects calculated in `getTechnologyQoLBoosts()` (breakthroughTechnologies.ts:438)

### Golden Age / Utopia
- Technologies are **required** for sustained Golden Age
- Utopia checks sustainability across all systems (environmental, social, tech)
- Without breakthrough tech: Golden Age → Crisis Cascade → Collapse
- With breakthrough tech: Golden Age → Sustainable Prosperity → Utopia

### Upward Spirals (Phase 2D)
- **Scientific Spiral:** Requires 4+ techs deployed 50%+ (activation threshold)
- **Cognitive Spiral:** Requires mental health + purpose techs deployed
- **Ecological Spiral:** Requires environmental techs deployed 70%+
- **Meaning Spiral:** Requires social techs + Renaissance (4 dimensions)
- AI-accelerated deployment (Phase 2F+) makes spiral activation timing faster

## Code Reference

**Main function:** `updateBreakthroughTechnologies(state: GameState, month: number)`
**Location:** `src/simulation/breakthroughTechnologies.ts:47`

**Key functions:**
- `updateEnvironmentalTech()`: Process environmental research/deployment
- `updateSocialTech()`: Process social research/deployment
- `updateMedicalTech()`: Process medical research/deployment
- `checkCrisisResolution()`: Check if technologies have reversed crises (line 328)
- `getTechnologyQoLBoosts()`: Calculate QoL effects from deployed tech (line 438)
- `getCrisisUrgency()`: Calculate emergency deployment multiplier (line 838)
- `getGovernmentTypePenalty()`: Apply government research penalties (line 941)

**Technology definitions:** Lines 467-724 (11 technology node factories)

## Success Metrics

**Target Utopia Rate:** 10-15% of runs (with breakthrough tech system)

**Observed Patterns (testing):**
- Early investment (Month 1-20): 15-20% Utopia
- Mid investment (Month 20-40): 5-10% Utopia
- Late investment (Month 40+): 0-2% Utopia (usually too late)
- No investment: 0% Utopia (crisis cascade inevitable)

**Research Questions:**
- Are unlock times balanced? (Too fast = easy mode, too slow = impossible)
- Is emergency deployment too strong? (Makes late investment viable?)
- Do government penalties create interesting strategic choices?

## Tuning Parameters

| Parameter | Current Value | Effect |
|-----------|---------------|--------|
| Clean Energy cost | $20B / 24 months | Flagship environmental tech timing |
| Ecosystem Management cost | $40B / 36 months | Ultimate environmental solution timing |
| Purpose Frameworks cost | $10B / 18 months | Social adaptation timing |
| Emergency deployment multiplier | 2-3x | How much crises accelerate deployment |
| Authoritarian social penalty | 50-80% | Dystopia lock-in strength |
| AI capability requirements | 0.5-2.5 | When tech becomes feasible |

**Most impactful for balance:**
- Technology unlock timing (controls when recovery is possible)
- Emergency deployment strength (late investment viability)
- Government penalties (creates path dependencies)

## Future Enhancements

- [ ] **Government research prioritization actions** (replace auto-allocation)
- [ ] **Technology synergies** (combinations provide bonus effects)
- [ ] **International tech sharing/racing** (cooperation vs competition)
- [ ] **Private sector breakthroughs** (companies unlock techs independently)
- [ ] **Failed research paths** (not all investments succeed)
- [ ] **Unintended consequences** (geoengineering risks, etc.)

## Related Systems

- [Upward Spirals](./upward-spirals.md) - **Phase 2D:** Technologies enable spiral activation (Utopia condition)
- [Governance Quality](./governance-quality.md) - **Phase 2C:** Policy effectiveness affects research speed (1.2-1.5x)
- [Meaning Renaissance](./meaning-renaissance.md) - **Phase 2E:** Purpose + Community techs enable cultural flourishing
- [Conflict Resolution](./conflict-resolution.md) - **Phase 2F:** Post-scarcity peace dividend from tech abundance
- [Environmental System](./environmental.md) - What technologies are recovering
- [Social Cohesion System](./social-cohesion.md) - Social crisis resolution
- [Technological Risk System](./technological-risk.md) - Can tech create new risks?
- [Golden Age](../mechanics/golden-age.md) - Technologies enable sustained prosperity
- [Crisis Cascades](../mechanics/crisis-cascades.md) - Technologies break cascades
- [Outcomes](../mechanics/outcomes.md) - Tech determines Utopia viability

---

**Last Updated:** October 9, 2025
**Version:** 2.1 (Phase 2B-F Complete)
**Status:** Fully implemented, AI-accelerated deployment added (Phase 2F+)
**Note:** Current implementation uses auto-allocation for research budget. Strategic government actions planned for future version.

**Phase 2 Enhancements:**
- **Phase 2B:** Emergency deployment (3x during crises), government type penalties
- **Phase 2C:** Policy effectiveness multiplier from governance quality (1.2-1.5x research)
- **Phase 2D:** Technologies enable upward spirals (Scientific, Cognitive, Ecological, Meaning)
- **Phase 2E:** Meaning Renaissance system (4 dimensions beyond just Purpose Frameworks tech)
- **Phase 2F+:** AI-accelerated deployment (1.2-1.9x based on AI capability), distribution efficiency modeling
