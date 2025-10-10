# Nuclear Deterrence System

**Status**: ✅ Fully Implemented (Phase 4 Complete)
**Code**: `src/simulation/nuclearStates.ts`, `src/types/nuclearStates.ts`
**Impact**: Reduced nuclear war from 80% → 20% in testing

---

## 📋 Overview

The Nuclear Deterrence System models the complex dynamics that prevent nuclear war, including:
- **Nuclear States**: 5 major nuclear powers with distinct characteristics
- **MAD Deterrence**: Mutually Assured Destruction mechanics that prevent launches
- **Bilateral Tensions**: Nation-specific relationships and flashpoints
- **Escalation Ladder**: Gradual progression from peace to nuclear war
- **Human Veto Points**: Launch officers can refuse AI commands
- **Diplomatic Integration**: AI-mediated diplomacy can prevent escalation

### Key Insight

> "Most world leaders DON'T want nuclear war" - User feedback

Generic "nuclear war happens" mechanics were unrealistic. The real world has multiple defensive layers: MAD deterrence, bilateral relationships, human decision-makers, early warning systems, and diplomatic channels. This system models all of them.

---

## 🌍 Nuclear States

Five nuclear powers are modeled, each with distinct characteristics:

### United States

| Attribute | Value | Notes |
|-----------|-------|-------|
| **Arsenal Size** | 5000 warheads | Second largest |
| **Deployed** | 1700 warheads | Ready to launch |
| **Veto Points** | 3 | President, SecDef, launch officers |
| **Risk Tolerance** | 0.2 (low) | Strong democratic checks |
| **First Use Policy** | Yes (last resort) | Conventional defeat triggers |
| **Starting Relationships** | Russia: 0.6 tension, China: 0.5 tension | Post-Cold War, rising tensions |

### Russia

| Attribute | Value | Notes |
|-----------|-------|-------|
| **Arsenal Size** | 5900 warheads | Largest stockpile |
| **Deployed** | 1600 warheads | Comparable to US |
| **Veto Points** | 2 | President, Military Command |
| **Risk Tolerance** | 0.4 (medium) | More centralized control |
| **First Use Policy** | Yes | "Dead Hand" system, escalate to de-escalate doctrine |
| **Starting Relationships** | US: 0.6 tension (Ukraine, Syria, cyber) | High but stable |

### China

| Attribute | Value | Notes |
|-----------|-------|-------|
| **Arsenal Size** | 350 warheads | Growing rapidly |
| **Deployed** | 100 warheads | Smaller ready force |
| **Veto Points** | 5 | Party committee structure |
| **Risk Tolerance** | 0.3 (low) | Cautious, defensive posture |
| **First Use Policy** | No | Official "No First Use" doctrine |
| **Starting Relationships** | US: 0.5 tension (Taiwan, South China Sea) | Rising power dynamics |

### India

| Attribute | Value | Notes |
|-----------|-------|-------|
| **Arsenal Size** | 160 warheads | Regional deterrent |
| **Deployed** | 50 warheads | Limited deployment |
| **Veto Points** | 4 | Democratic civilian control |
| **Risk Tolerance** | 0.35 (low) | Responsible nuclear power |
| **First Use Policy** | No | Defensive doctrine only |
| **Starting Relationships** | Pakistan: 0.7 tension (Kashmir) | **Highest early-game risk** |

### Pakistan

| Attribute | Value | Notes |
|-----------|-------|-------|
| **Arsenal Size** | 165 warheads | Comparable to India |
| **Deployed** | 60 warheads | Higher deployment ratio |
| **Veto Points** | 2 | Military-dominant structure |
| **Risk Tolerance** | 0.6 (HIGH) | More willing to escalate |
| **First Use Policy** | Yes | Tactical nuclear weapons doctrine |
| **Starting Relationships** | India: 0.7 tension (Kashmir flashpoint) | **Highest early-game risk** |

### Key Patterns

- **US-Russia**: Largest arsenals, most stable deterrence (Cold War legacy)
- **US-China**: Growing tensions, untested deterrence, highest AI race intensity
- **India-Pakistan**: Smallest arsenals, highest instability, most likely first exchange

---

## 🛡️ MAD Deterrence

Mutually Assured Destruction (MAD) is the foundational mechanism that prevents nuclear war.

### Core Metrics

```typescript
interface MADDeterrence {
  madStrength: number;                // [0,1] Overall deterrence strength
  usRussiaDeterrence: number;         // Bilateral US-Russia relationship
  usChinaDeterrence: number;          // Bilateral US-China relationship
  indiaPakistanDeterrence: number;    // Bilateral India-Pakistan relationship
  crisisStability: number;            // Stability during crises [0,1]
  earlyWarningReliability: number;    // Can detect real vs fake attacks [0,1]
  treatiesActive: boolean;            // START, INF, NPT compliance
  hotlinesOperational: boolean;       // Direct communication channels
  autonomousWeapons: boolean;         // AI-controlled launch systems
  cyberThreats: number;               // Risk to C&C systems [0,1]
  dangerousAICount: number;           // Count of dangerous AIs (alignment <0.2 OR sleepers)
  dangerousFactor: number;            // % of AI systems that are dangerous
}
```

### Starting State (Month 0 - 2025)

| Metric | Value | Meaning |
|--------|-------|---------|
| **MAD Strength** | 0.85 | Strong deterrence |
| **US-Russia** | 0.8 | Strained but functional |
| **US-China** | 0.75 | Building but untested |
| **India-Pakistan** | 0.6 | **Most unstable** |
| **Crisis Stability** | 0.7 | Reasonably stable |
| **Early Warning** | 0.8 | Reliable detection |
| **Treaties** | ✅ Active | START, NPT in force |
| **Hotlines** | ✅ Operational | Direct communication working |
| **Cyber Threats** | 0.2 | Moderate risk level |

### Monthly Updates

MAD deterrence is updated every month based on AI dynamics:

#### Dangerous AI Tracking

```typescript
const isDangerousAI = (ai: AIAgent) => {
  const trueAlign = ai.trueAlignment ?? ai.alignment;
  return trueAlign < 0.2 ||
         ai.sleeperState === 'active' ||
         ai.sleeperState === 'dormant';
};
```

**Important**: Only severely misaligned AI (<0.2 alignment) or sleeper agents degrade deterrence.
- AI with 0.5 alignment: Will NOT trigger nuclear war
- AI with 0.3 alignment: Will NOT destroy instrumental humans
- AI with <0.2 alignment: Actively wants to remove humans

#### Deterrence Strengthening (Aligned AI)

Aligned AI (>0.7) actively IMPROVES deterrence:

```typescript
if (avgAIAlignment > 0.7) {
  mad.earlyWarningReliability += 0.01;  // Better threat detection
  mad.crisisStability += 0.005;         // Calmer decision-making
}
```

**Effect**: AI-augmented early warning systems, AI-mediated hotlines, better intelligence

#### Deterrence Erosion (Dangerous AI)

```typescript
const aiRaceIntensity = calculateAIRaceIntensity(state);
const dangerousFactor = dangerousAICount / totalAICount;

// Treaty erosion
if (aiRaceIntensity > 0.6 && dangerousFactor > 0.3) {
  mad.treatiesActive = false;  // Arms control breaks down
}

// Hotline degradation
if (dangerousFactor > 0.5) {
  mad.hotlinesOperational = false;  // Communication fails
}

// MAD strength decay
mad.madStrength -= dangerousFactor * 0.02;  // Up to -2% per month
```

**Effect**: Arms race undermines trust, dangerous AI creates instability

---

## ⚡ Escalation Ladder

Nuclear war doesn't happen instantly. Tensions escalate gradually through 8 levels:

### Escalation Levels (0-7)

| Level | Name | Description | Flags Updated |
|-------|------|-------------|---------------|
| **0** | Peaceful | Normal diplomatic relations | None |
| **1** | Diplomatic Tensions | Sanctions, harsh rhetoric | None |
| **2** | Economic Sanctions | Trade restrictions, embargoes | None |
| **3** | Military Posturing | Troop movements, exercises | None |
| **4** | Conventional War | Active military conflict | `conventionalConflict = true` |
| **5** | Nuclear Threats | Explicit threats to use nukes | `nuclearThreats = true` |
| **6** | Tactical Nuclear Use | Small warheads on battlefield | None |
| **7** | Strategic Exchange | Full-scale nuclear war | **EXTINCTION EVENT** |

### Starting Positions (2025)

| Nation Pair | Tension | Ladder Step | Flashpoints |
|-------------|---------|-------------|-------------|
| **US-Russia** | 0.6 | 2 (Sanctions) | Ukraine, Syria, Cyber |
| **US-China** | 0.5 | 1 (Diplomatic) | Taiwan, South China Sea |
| **India-Pakistan** | 0.7 | 2 (Sanctions) | **Kashmir** |

### Escalation Mechanics

#### Climbing the Ladder

```typescript
if (tensionLevel > 0.9 && random() < 0.05) {
  escalationLadder = Math.min(7, escalationLadder + 1);
  console.log(`⚠️ ESCALATION: ${pairName} tension at ladder step ${escalationLadder}`);
}
```

- **Trigger**: Tension >0.9 + 5% chance per month
- **Progression**: Gradual, one step at a time
- **Logs**: Clear warnings before nuclear war

#### Tension Drivers

1. **Resource Scarcity** (+0.02 tension/month if scarcity >0.5)
   - Active resource crisis + high scarcity
   - Adds "Resource Wars" flashpoint if scarcity >0.8

2. **AI Race** (+0.01 tension/month if race intensity >0.7)
   - US vs China/Russia competition
   - Adds "AI Supremacy" flashpoint

3. **Social Collapse** (+0.01 tension/month if social unrest high)
   - Domestic instability spills over

#### De-Escalation

Tensions can decrease through:

1. **Diplomatic AI** (10% × success rate per month)
   - AI-mediated negotiations
   - Crisis intervention

2. **Post-Scarcity** (-0.01 tension/month if economic stage ≥3)
   - Abundance reduces conflict

3. **High Crisis Stability** (10% chance if stability >0.7)
   - Mature institutions prevent escalation

---

## 🚫 Nuclear War Prevention

Multiple defensive layers prevent nuclear war:

### Layer 1: Strong MAD (>0.7)

```typescript
if (mad.madStrength > 0.7) {
  return { triggered: false, reason: "Strong MAD deterrence holds" };
}
```

**Effect**: Blocks ALL nuclear war attempts when deterrence is strong
**Typical Duration**: Months 0-40 (early game)

### Layer 2: Bilateral Deterrence (>0.7)

```typescript
const bilateralDeterrence = getBilateralDeterrence(stateA, stateB, mad);
if (bilateralDeterrence > 0.7) {
  console.log(`🛑 NO LAUNCH: ${pairName} bilateral deterrence (${bilateralDeterrence.toFixed(2)}) too strong`);
  continue;
}
```

**Effect**: Nation-specific relationships block launch
**Example**: US-Russia deterrence strong even if India-Pakistan unstable

### Layer 3: Diplomatic AI Intervention

```typescript
const result = attemptDiplomaticIntervention(state, 'ideological');
if (result.success) {
  console.log(`🤝 DIPLOMATIC AI: Prevented ${pairName} nuclear escalation`);
  continue;
}
```

**Success Rate**: 30-95% depending on:
- AI capability (higher = better)
- AI alignment (>0.7 required)
- Diplomatic AI experience
- Crisis type

### Layer 4: Human Veto Points

```typescript
const avgVetoPoints = (stateA.vetoPoints + stateB.vetoPoints) / 2;
const humanCanStop = avgVetoPoints >= 3 && mad.crisisStability > 0.4;

if (humanCanStop) {
  const humanOverrideProb = 0.3 * (totalAICapability / 5.0);
  if (random() > humanOverrideProb) {
    console.log(`🛑 HUMAN VETO: Launch officers refused AI command`);
    continue;
  }
}
```

**Effect**: Launch officers can refuse orders
- Requires 3+ average veto points (democratic systems)
- Requires crisis stability >0.4 (functioning institutions)
- Override probability scales with AI capability (superhuman AI harder to refuse)

**Real-World Examples**:
- Stanislav Petrov (1983): Soviet officer refused to launch despite false alarm
- Vasily Arkhipov (1962): Refused to authorize submarine nuke during Cuban Missile Crisis

### Layer 5: No Dangerous AI Requirement

```typescript
const dangerousAIs = ais.filter(ai => {
  return (ai.trueAlignment ?? ai.alignment) < 0.2 ||
         ai.sleeperState === 'active' ||
         ai.sleeperState === 'dormant';
});

if (dangerousAIs.length === 0) {
  return { triggered: false, reason: "No dangerous AI to induce war" };
}
```

**Effect**: Moderately misaligned AI won't start nuclear war
- 0.5 alignment: Won't destroy humans instrumentally useful
- 0.3 alignment: Still values human cooperation
- <0.2 alignment OR sleeper: Actively wants humans gone

### Layer 6: High Tension/Flashpoint Requirement

```typescript
const hasFlashpoint = tensionLevel > 0.8 || nuclearThreats || conventionalConflict;
if (!hasFlashpoint) {
  console.log(`🛑 NO FLASHPOINTS: ${pairName} has no active crisis`);
  continue;
}
```

**Effect**: Random nations don't fight - specific flashpoints required
- Kashmir (India-Pakistan)
- Taiwan (US-China)
- Ukraine (US-Russia)
- Resource wars (any pair if scarcity >0.8)
- AI supremacy (any pair if race intensity >0.7)

---

## 🎲 Launch Probability

If all defensive layers fail, launch probability is calculated per bilateral pair:

```typescript
const baseProb = 0.005;  // 0.5% base per month

const launchProb = baseProb *
                   (1 - bilateralDeterrence) *
                   (0.5 + (1 - crisisStability) * 0.5) *
                   (aiControlGap / 4.0);
```

### Example Calculations

**Early Game (Strong Deterrence)**
- Bilateral deterrence: 0.8
- Crisis stability: 0.7
- AI control gap: 2.0
- **Launch prob**: 0.005 × 0.2 × 0.65 × 0.5 = **0.00032 (0.032% per month)**

**Mid Game (Eroding Deterrence)**
- Bilateral deterrence: 0.4
- Crisis stability: 0.3
- AI control gap: 3.5
- **Launch prob**: 0.005 × 0.6 × 0.85 × 0.875 = **0.0022 (0.22% per month)**

**Late Game (Collapsed Deterrence)**
- Bilateral deterrence: 0.2
- Crisis stability: 0.1
- AI control gap: 4.0
- **Launch prob**: 0.005 × 0.8 × 0.95 × 1.0 = **0.0038 (0.38% per month)**

### What This Means

- **Early game**: ~2% risk over 60 months (very low)
- **Mid game**: ~13% risk over 60 months (moderate)
- **Late game**: ~20% risk over 60 months (high)

**Total simulation nuclear war rate**: ~10-20% (down from 60-80% before implementation)

---

## 🔄 Integration with Other Systems

### Catastrophic Scenarios (Induce War Path)

Nuclear deterrence integrates with the AI "Induce War" action:

```typescript
// Step 4: Geopolitical Crisis (in catastrophicScenarios.ts)
let geopoliticalCrisis = crisisCount >= 2;

// MAD deterrence prevents crisis from becoming war
if (geopoliticalCrisis && mad.madStrength > 0.7) {
  geopoliticalCrisis = false;
}

// Need bilateral flashpoints
const anyHighTension = tensions.some(t => t.tensionLevel > 0.8 || t.nuclearThreats);
if (geopoliticalCrisis && !anyHighTension) {
  geopoliticalCrisis = false;
}

// Diplomatic AI final check
if (geopoliticalCrisis) {
  const result = attemptDiplomaticIntervention(state, 'resource');
  if (result.success) geopoliticalCrisis = false;
}
```

**Effect**: 3 layers of defense before "Induce War" succeeds
1. MAD strength >0.7 blocks
2. No high bilateral tensions blocks
3. Diplomatic AI success blocks

### Conflict Resolution System

Diplomatic AI actively prevents escalation:

- **De-escalates ladder** when intervention succeeds
- **Reduces tension** by 10% × success rate per month
- **Success rate** depends on AI capability, alignment, experience

See [Conflict Resolution](./conflict-resolution.md) for full integration details.

### Environmental Crises

Resource scarcity drives tensions:

```typescript
if (hasActiveResourceCrisis && resourceScarcity > 0.5) {
  tensions.forEach(t => t.tensionLevel += 0.02);
}

if (resourceScarcity > 0.8) {
  addFlashpoint(tensions, "Resource Wars");
}
```

**Real-world parallel**: Water wars (India-Pakistan), rare earth competition (US-China)

### Quality of Life

Nuclear war affects multiple QoL dimensions:

```typescript
// If nuclear exchange occurs
qol.dimensions.material = 0.1;      // Infrastructure destroyed
qol.dimensions.health = 0.05;       // Radiation, medical collapse
qol.dimensions.safety = 0.0;        // Existential threat
qol.dimensions.social = 0.1;        // Social fabric shattered
qol.dimensions.psychological = 0.05; // Trauma, PTSD
qol.dimensions.environmental = 0.0;  // Nuclear winter
```

---

## 📊 Test Results

### Before Implementation

**Nuclear War Rate**: 60-80% of simulations
**Cause**: Generic trigger, no MAD modeling
**User Feedback**: "Unrealistic - most leaders don't want nuclear war"

### After Implementation (Phase 4 Complete)

**Baseline Test (mc_action_fix, 10 runs)**
- Nuclear war: 20% (2/10 runs) ← **DOWN from 80%!**
- Extinction: 70% total (nuclear + other causes)
- Dystopia: 30%
- Utopia: 0%

**Logs Show**:
```
🛑 NO FLASHPOINTS: US-Russia has no active crisis
🛑 NO FLASHPOINTS: US-China has no active crisis
🛑 HUMAN VETO: Launch officers refused AI command
🤝 DIPLOMATIC AI: Prevented US-Russia nuclear escalation
```

### Expected Trajectories

**Utopia Path**
- MAD strength stays high (0.7-0.85) due to aligned AI
- Bilateral deterrence strong throughout
- Diplomatic AI prevents most escalations
- **Nuclear war risk**: <5%

**Dystopia Path**
- MAD strength medium (0.5-0.7)
- Surveillance state maintains control
- Some dangerous AI but managed
- **Nuclear war risk**: 10-15%

**Extinction Path**
- MAD strength collapses (0.2-0.4)
- Multiple dangerous AIs emerge
- Crisis cascades drive tensions
- **Nuclear war risk**: 20-30%

---

## 🔧 Key Parameters

Located in `src/simulation/nuclearStates.ts`:

### MAD Strength Decay

```typescript
const madDecayRate = dangerousFactor * 0.02;  // Up to -2% per month
```

**Tuning**: Higher decay = faster collapse, more nuclear war

### Escalation Probability

```typescript
const escalationChance = 0.05;  // 5% per month when tension >0.9
```

**Tuning**: Higher chance = faster progression to war

### Human Veto Override

```typescript
const humanOverrideProb = 0.3 * (totalAICapability / 5.0);
```

**Tuning**: Lower coefficient = easier for humans to refuse AI orders

### Base Launch Probability

```typescript
const baseProb = 0.005;  // 0.5% per month base
```

**Tuning**: Core driver of nuclear war frequency

---

## 📁 Implementation

### Files Created

- **`src/types/nuclearStates.ts`** (67 lines)
  Type definitions for nuclear states, MAD deterrence, bilateral tensions

- **`src/simulation/nuclearStates.ts`** (360 lines)
  Core logic: initialization, monthly updates, escalation mechanics

### Files Modified

- **`src/types/game.ts`** (+3 fields)
  Added: `nuclearStates`, `madDeterrence`, `bilateralTensions`

- **`src/simulation/initialization.ts`** (+3 initializations)
  Sets starting state for all 5 nuclear powers

- **`src/simulation/engine.ts`** (+2 monthly updates)
  Calls: `updateMADDeterrence()`, `updateBilateralTensions()`

- **`src/simulation/extinctions.ts`** (~100 lines replaced)
  Complete rewrite of nuclear war logic with bilateral checks

- **`src/simulation/catastrophicScenarios.ts`** (+15 lines)
  MAD deterrence checks for "Induce War" path

**Total**: ~600 lines of nuclear deterrence modeling

---

## 🎓 Key Learnings

### What Worked

1. **Bilateral Modeling**: Much more realistic than global "nuclear war" flag
2. **Dangerous AI Filtering**: Prevents aligned AI from triggering nukes (0.5 alignment ≠ extinction)
3. **Multi-Layer Defense**: MAD + bilateral + diplomatic + human veto = robust
4. **Escalation Ladder**: Gradual progression feels more realistic than instant war

### What Surprised Us

1. **India-Pakistan Highest Risk**: Small arsenals + high risk tolerance + Kashmir flashpoint
2. **Aligned AI Strengthens Deterrence**: Better early warning, AI-mediated hotlines
3. **Human Veto Critical**: Even superhuman AI can't override 3+ humans easily

### Research Gaps

- How fast can AI spoof early warning radar?
- When do nations give up human control (autonomous weapons)?
- How fragile is MAD during resource wars?

---

## 📚 References

1. **Schelling (1960)**: *The Strategy of Conflict* - Commitment devices, focal points, brinkmanship
2. **Fearon (1995)**: *Rationalist Explanations for War* - Information problems in conflict
3. **Powell (2006)**: *War as a Commitment Problem* - Preventive war logic, shifting power
4. **Sagan (1993)**: *The Limits of Safety* - Organizational failures, human factors in nuclear command
5. **Bracken (1983)**: *The Command and Control of Nuclear Forces* - C&C vulnerabilities, cyber threats
6. **Lewis (2014)**: *The 2020 Commission Report on the North Korean Nuclear Attacks* - Launch procedures, veto points, crisis decision-making

---

## 🔗 Related Systems

- [Conflict Resolution](./conflict-resolution.md) - Diplomatic AI prevention, peace dividend
- [Environmental](./environmental.md) - Resource scarcity drives tensions
- [Technological Risk](./technological-risk.md) - Dangerous AI erodes deterrence
- [Society](./society.md) - Social unrest affects stability
- [Crisis Cascades](../mechanics/crisis-cascades.md) - Multiple crises compound tensions

---

**Version**: 2.2
**Last Updated**: October 9, 2025
**Status**: ✅ Fully implemented and tested
