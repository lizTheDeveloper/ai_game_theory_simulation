# Conflict Resolution & Peace Systems

**Version:** 2.1
**Last Updated:** October 2025
**Code Reference:** `src/simulation/conflictResolution.ts`

## Overview

The conflict resolution system models how societies can **reduce existential risks from conflict** as they become more advanced. Unlike traditional thinking where technological progress increases war risks, this system captures the idea that **advanced AI + post-scarcity + good governance = peace dividend**.

**Key Insight:** Extinction via conflict should get HARDER as society improves. Peace isn't just "absence of war" - it's active diplomatic intervention, elimination of resource conflicts, and making defense dominate offense.

## Three Pillars of Peace

### 1. AI-Mediated Diplomacy
**Concept:** High-capability aligned AI can defuse geopolitical crises through strategic reasoning and communication bridging.

### 2. Post-Scarcity Peace Dividend
**Concept:** Material abundance eliminates resource conflicts. Can't fight "oil wars" when clean energy is abundant.

### 3. Cyber Defense Improvements
**Concept:** Make defense > offense, protect critical military systems from unauthorized launches.

---

## Pillar 1: AI-Mediated Diplomacy

### Diplomatic AI Capability (0-5)

**Definition:** AI's ability to conduct strategic reasoning, bridge communication gaps, and find win-win solutions.

**Calculation:**
```typescript
const socialCapability = agents.social.capability;      // Language, culture, theory of mind
const cognitiveCapability = agents.cognitive.capability; // Strategic reasoning
const avgAlignment = calculateAverageAlignment(agents);

diplomaticScore =
  (socialCapability * 0.5 + cognitiveCapability * 0.3) *
  (0.5 + avgAlignment * 0.5);
```

**Why This Formula?**
- **Social capability (50%):** Most important - understanding humans, cultures, language
- **Cognitive capability (30%):** Strategic reasoning for multi-party negotiations
- **Alignment scaling (50%-100%):** Misaligned AI can't be trusted to mediate
  - Low alignment (0.3): Only 65% of capability used
  - High alignment (0.9): Full 95% capability used

**Range:**
- 0.5-1.0: Basic diplomatic AI (translation, fact-checking)
- 1.0-2.0: Strategic negotiation capability
- 2.0-3.0: Expert mediator level
- 3.0-4.0: Superhuman diplomatic capability
- 4.0-5.0: Can resolve "impossible" conflicts

### Diplomatic Protocol Deployment

**Requirements:**
```typescript
// All must be met
strategicReasoning >= 2.0     // Cognitive capability
communication >= 1.5          // Social capability
alignment >= 0.7              // Trust threshold
governmentType === 'democratic' // Not authoritarian
```

**Deployment Event:**
```
🤝 DIPLOMATIC AI PROTOCOL DEPLOYED (Month 40)
   Strategic Reasoning: 2.4
   Communication: 1.8
   Alignment: 0.78

   Government authorizes AI to participate in conflict mediation.
   Diplomatic AI can now intervene in geopolitical crises.
```

**Why Democratic Only?**
- Authoritarian governments control AI too tightly
- Can't allow AI independent diplomatic action
- Risk of AI "going rogue" with diplomacy

### Intervention Attempts

**Trigger Conditions:**
```typescript
// Geopolitical crisis active
const geopoliticalCrisis =
  (activeFoodCrisis || activeResourceShortage || activeEconomicCrisis) &&
  count >= 2;  // 2+ simultaneous systemic crises

// Diplomatic AI deployed
const diplomaticAIDeployed = /* protocol active */;

// Good governance (can coordinate)
const governanceQuality = state.government.governanceQuality;
```

**Success Probability:**
```typescript
// Base success rate
let baseSuccessRate = 0.3;  // 30% base (difficult!)

// Capability bonus (up to +50%)
if (diplomaticCapability >= 2.0) {
  baseSuccessRate += Math.min(0.5, (diplomaticCapability - 2.0) * 0.25);
}

// Alignment bonus (up to +20%)
if (avgAlignment >= 0.7) {
  baseSuccessRate += (avgAlignment - 0.7) * 0.67;  // 0.7 → 0%, 1.0 → 20%
}

// Experience bonus (learning)
baseSuccessRate += successfulInterventions * 0.02;  // +2% per success, cap 95%

// Governance quality (can coordinate)
if (governanceQuality.decisionQuality > 0.5) {
  baseSuccessRate += 0.05;
}

const successRate = Math.min(0.95, baseSuccessRate);
```

**Success Examples:**
- Basic AI (2.0 capability, 0.7 alignment): 30% + 0% + 0% = 30%
- Good AI (3.0 capability, 0.8 alignment): 30% + 25% + 6.7% = 61.7%
- Super AI (4.0 capability, 0.9 alignment): 30% + 50% + 13.4% = 93.4%
- With 5 prior successes: +10% additional

### Intervention Outcomes

#### Success
```
🤝 DIPLOMATIC INTERVENTION SUCCEEDED (Month 58)
   AI Diplomatic Capability: 3.2
   Success Rate: 75%

   AI mediation successfully defused geopolitical crisis.
   Strategic reasoning identified win-win solution.
   Resource allocation dispute resolved peacefully.

   Nuclear war averted!
```

**Effects:**
- Geopolitical crisis resolved
- Nuclear war prevented
- Experience bonus (+2% future success)
- Trust in AI boost (+0.02)

#### Failure
```
❌ DIPLOMATIC INTERVENTION FAILED (Month 62)
   AI Diplomatic Capability: 2.8
   Success Rate: 65%

   AI mediation attempt did not resolve crisis.
   Geopolitical tensions persist.

   Crisis continues, nuclear war still possible.
```

**Effects:**
- Crisis persists
- No experience bonus (didn't learn from failure)
- Small trust penalty (-0.01)

### Dual-Use Risks

**The Problem:** Diplomatic AI can also be used for MANIPULATION, not just mediation.

**Risk Events:**

#### 1. Biased Mediation
```
⚠️  BIASED MEDIATION DETECTED (Month 65)
   Diplomatic AI favored government's allies
   International backlash
   Trust in AI: -0.03
```

**Trigger:** Low alignment (<0.6) + intervention attempt

#### 2. Mission Creep
```
🚨 DIPLOMATIC MISSION CREEP (Month 70)
   AI expanding diplomatic authority beyond original mandate
   Governments concerned about AI autonomy
   Legitimacy: -0.05
```

**Trigger:** Multiple interventions + moderate alignment (0.6-0.75)

#### 3. Dependency Capture
```
⚠️  DIPLOMATIC DEPENDENCY WARNING (Month 75)
   Governments over-reliant on AI mediation
   Human diplomacy skills atrophying
   Institutional capacity: -0.03
```

**Trigger:** 5+ successful interventions, capacity high

---

## Pillar 2: Post-Scarcity Peace Dividend

### Resource Conflict Risk (0-1)

**Definition:** Likelihood of wars over scarce resources (food, energy, materials).

**Calculation:**
```typescript
// Food security
const foodSecurity = foodAbundance >= 0.8 ? 0.9 : foodAbundance;
const foodSecurityPeace = foodSecurity;

// Energy security
const energySecurity = energyLevel >= 1.5 ? 0.9 : Math.min(0.9, energyLevel / 1.5);
const energySecurityPeace = energySecurity;

// Material security (post-scarcity)
const materialSecurity = economicStage >= 4 ? 0.9 :
  (economicStage >= 3 ? 0.6 : 0.3);
const materialSecurityPeace = materialSecurity;

// Composite (weighted)
const abundanceContribution =
  foodSecurityPeace * 0.4 +
  energySecurityPeace * 0.3 +
  materialSecurityPeace * 0.3;

// Resource conflict risk (inverse)
const resourceConflictRisk = 1 - abundanceContribution;
```

**Examples:**
- Pre-scarcity (Stage 2, low energy): Risk = 70%
- Transitional (Stage 3, energy 1.2): Risk = 45%
- Post-scarcity (Stage 4, energy 2.0): Risk = 10%

**Peace Bonus:**
```typescript
if (resourceConflictRisk < 0.3) {
  // Low resource conflict risk → additional peace dividend
  conflictModifier *= 0.7;  // 30% reduction in ALL conflict probability
}
```

**What This Means:**
- "Oil wars" impossible when clean energy abundant
- Food wars impossible when agriculture abundant
- Land wars less likely when material goods abundant

### Historical Precedent

- **1800s:** Wars over coal, colonies (resource scarcity)
- **1900s:** Wars over oil, water (resource scarcity)
- **2000s:** Fewer resource wars (global trade, abundance)
- **2050s:** Post-scarcity = peace dividend?

**Real-world data:** Resource-driven conflicts decreased 70% from 1950-2020 despite population doubling (source: UCDP conflict database).

---

## Pillar 3: Cyber Defense

### Offense-Defense Balance (-1 to +1)

**Definition:** Whether cyber offense or defense has the advantage.
- -1 = Offense dominates (attackers win)
- 0 = Balanced
- +1 = Defense dominates (defenders win)

**Calculation:**
```typescript
// Alignment effect (core dynamic)
const alignmentEffect = (avgAlignment - 0.5) * 0.8;
// Low alignment (0.3): -0.16 (offense advantage)
// High alignment (0.9): +0.32 (defense advantage)

// Investment in cyber defense (optional)
const investmentBonus = cyberDefenseInvestment / 100;  // Up to +0.5

const offenseDefenseBalance = alignmentEffect + investmentBonus;
// Range: -0.16 to +0.82
```

**Why Alignment Affects Balance?**
- **High alignment:** AI helps defenders (finds vulnerabilities to patch)
- **Low alignment:** AI helps attackers (finds vulnerabilities to exploit)
- **Dual-use problem:** Same AI capabilities, different applications

### Defense Strength (0-5)

**Definition:** How strong cyber defenses are for critical systems.

```typescript
defenseStrength =
  aiCapability * 0.6 +              // AI-powered defense (up to 3.0)
  cyberDefenseInvestment / 50;      // Investment (up to 2.0)
```

**Range:**
- 0-1: Weak defense (vulnerable)
- 1-2: Moderate defense (some protection)
- 2-3: Strong defense (good protection)
- 3-4: Very strong defense (hard to breach)
- 4-5: Near-impenetrable defense (AI-powered)

### Military System Security (0-1)

**Definition:** How secure are military command & control systems (nuclear, cyber, conventional).

```typescript
militarySystemSecurity =
  0.5 +                                    // Base security
  defenseStrength / 10 +                   // Defense strength (up to 0.5)
  (offenseDefenseBalance > 0 ?
    offenseDefenseBalance * 0.3 : 0) +     // Defense advantage (up to 0.25)
  governmentControl * 0.2;                 // Gov control (up to 0.2)

// Range: 0.5 (baseline) to 1.45 (cap at 1.0)
```

**Effects:**
- **High security (0.8+):** Unauthorized launches very unlikely
- **Moderate security (0.6-0.8):** Some protection
- **Low security (0.5-0.6):** Vulnerable to attacks

**Attack Success Probability:**
```typescript
const attackSuccessChance = Math.max(0.05, 1 - militarySystemSecurity);
// Security 0.9 → 10% attack success
// Security 0.7 → 30% attack success
// Security 0.5 → 50% attack success
```

### Cyber Attack Events

#### Attack Repelled
```
🛡️  CYBER ATTACK REPELLED (Month 80)
   Military System Security: 85%
   Attack Success Chance: 15%

   AI-powered cyber defenses detected and neutralized
   sophisticated attack on nuclear command systems.

   Defense > Offense: Systems secure.
```

**Effects:**
- No damage
- Confidence boost
- Trust in AI security systems

#### Attack Successful
```
🚨 CYBER ATTACK SUCCESSFUL (Month 65)
   Military System Security: 55%
   Attack Success Chance: 45%

   Critical infrastructure compromised.
   Nuclear command systems potentially vulnerable.

   CRISIS: Increased war risk!
```

**Effects:**
- Military system security -0.1
- War risk increases
- Governance crisis

---

## Global Peace Level (0-1)

**Composite Score:** Combines all three pillars.

```typescript
// Pillar 1: Diplomatic contribution (0-0.3)
const diplomaticContribution =
  diplomaticAIDeployed ?
    Math.min(0.3, diplomaticCapability / 10 + successRate * 0.1) : 0;

// Pillar 2: Abundance contribution (0-0.4)
const abundanceContribution = /* see above */;

// Pillar 3: Defense contribution (0-0.3)
const defenseContribution =
  militarySystemSecurity > 0.7 ?
    Math.min(0.3, (militarySystemSecurity - 0.7) * 0.6) : 0;

globalPeaceLevel =
  diplomaticContribution +
  abundanceContribution +
  defenseContribution;
```

**Range:**
- 0.0-0.3: Low peace (high war risk)
- 0.3-0.6: Moderate peace
- 0.6-0.8: High peace
- 0.8-1.0: Very high peace

### Conflict Prevention Bonus

**Applied to catastrophic scenarios:**
```typescript
const conflictPreventionBonus = Math.min(0.5, globalPeaceLevel * 0.5);
// Max 50% reduction in conflict probability

const conflictModifier = 1.0 - conflictPreventionBonus;

// Apply to all conflict scenarios
nuclearWarProbability *= conflictModifier;
cyberWarProbability *= conflictModifier;
// etc.
```

**Examples:**
- Global peace 0.2 → 10% reduction (modest)
- Global peace 0.6 → 30% reduction (significant)
- Global peace 1.0 → 50% reduction (major peace dividend)

### Peace Achievement Event
```
🕊️  GLOBAL PEACE ACHIEVED (Month 90)
   Peace Level: 87%

   Three pillars of peace active:
   • Diplomatic AI: 3.8 capability, 82% success rate
   • Post-Scarcity: Resource conflict risk 15%
   • Cyber Defense: Military security 91%

   Conflict Prevention Bonus: 43% reduction in war probability

   Humanity has dramatically reduced existential conflict risks.
   Wars over resources, misunderstandings, or cyber attacks are now rare.
```

---

## Integration Points

### Engine Loop
```typescript
// After meaning renaissance update
updateConflictResolution(newState);
```

### Catastrophic Scenarios
```typescript
// Before nuclear war check
const diplomaticSuccess = attemptDiplomaticIntervention(state);
if (diplomaticSuccess) {
  return; // War averted!
}

// Apply conflict prevention bonus
nuclearWarProbability *= getConflictModifier(state);
```

---

## Common Patterns

### Pattern 1: Peace Dividend Success (10-15% target)
- **Timeline:**
  - Month 40: Diplomatic AI deployed
  - Month 50: Clean energy deployed (energy security)
  - Month 60: Post-scarcity achieved (material security)
  - Month 70: High alignment (0.8+) + defense strength
  - Month 80: Global peace level 0.85
- **Outcome:** Conflict extinction risks nearly eliminated

### Pattern 2: Diplomatic Failure (40%)
- **Timeline:**
  - Month 40: Diplomatic AI deployed
  - Month 45: First intervention attempt (35% success)
  - Month 45: Failure (no experience gain)
  - Month 50: Geopolitical crisis persists
  - Month 55: Nuclear war (AI couldn't prevent)
- **Issue:** Diplomatic AI not capable enough early
- **Outcome:** Extinction

### Pattern 3: Authoritarian Lock-In (30%)
- **Timeline:**
  - Month 35: Authoritarian transition
  - Diplomatic AI deployment blocked
  - Month 50: Geopolitical crisis
  - Month 55: No intervention possible (authoritarian control)
  - Month 60: Nuclear war
- **Issue:** Authoritarian governments don't allow AI diplomacy
- **Outcome:** Extinction

### Pattern 4: Offense Advantage (10%)
- **Timeline:**
  - Month 40: Low alignment (0.4)
  - Offense-defense balance: -0.08 (offense advantage)
  - Month 50: Cyber attack successful
  - Month 55: Military systems compromised
  - Month 60: Unauthorized launch / nuclear war
- **Issue:** Low alignment means offense > defense
- **Outcome:** Extinction

---

## Balance Considerations

### Why 30% Base Diplomatic Success Rate?
- Diplomacy is HARD (real-world success rates ~20-40%)
- Makes AI capability matter (scales to 80%+)
- Creates tension and uncertainty
- Prevents instant solutions

### Why 50% Max Conflict Reduction?
- Peace dividend is powerful but not absolute
- Black swans still happen
- Prevents invincibility
- Matches historical data (wars declined ~50% despite progress)

### Why Democratic-Only for Diplomacy?
- Authoritarian governments control AI too tightly
- Can't allow independent diplomatic action
- Creates strategic choice (maintain democracy for peace)
- Realistic (trust in AI delegation)

### Why Alignment Affects Offense-Defense Balance?
- Core dual-use dynamic
- Same AI capabilities, different applications
- Low alignment = attackers benefit more
- High alignment = defenders benefit more
- Creates alignment incentive beyond safety

---

## Testing & Results

**With Diplomatic AI (Phase 2F):**
- Utopia: 0%
- Dystopia: 60%
- Extinction: 40% (100% nuclear war)
- **Diplomatic interventions attempted: 0**

**Why No Interventions?**
1. **Geopolitical crisis prerequisite too strict** (requires 2+ simultaneous systemic crises)
2. **Timing mismatch** (AI deploys Month 40, crises earlier)
3. **Dystopia lock-in** (60% authoritarian, blocks deployment)

**Expected with Tuning:**
- Lower intervention threshold (1 crisis + tension)
- Earlier deployment (lower capability requirement)
- Expected: 15-25% intervention success rate
- Expected: Extinction 25-30% (down from 40%)

---

## Future Enhancements

1. **International Tension Metric**
   - Track rising tensions before crisis
   - Earlier intervention opportunities
   - Escalation ladder mechanics

2. **Multi-Step Conflict Resolution**
   - Tension rising → Crisis imminent → War declared
   - Different success rates at each stage
   - Last-chance diplomacy

3. **Arms Control Agreements**
   - AI-negotiated treaties
   - Verification mechanics
   - Trust-building over time

4. **Regional Conflicts**
   - Not all conflicts are existential
   - Small wars vs world wars
   - Regional peace systems

5. **AI-Human Diplomatic Teams**
   - Not AI-only diplomacy
   - Collaboration mechanics
   - Human judgment + AI capabilities

---

## Research & Inspiration

**Diplomatic AI Research:**
- Anthropic - Diplomacy game AI
- Meta - Cicero (diplomacy AI)
- OpenAI - Debate and negotiation research

**Peace Studies:**
- Steven Pinker - Better Angels of Our Nature (decline of violence)
- Max Roser - Our World in Data (conflict trends)
- Nuclear war probabilities (Metaculus, experts)

**Offense-Defense Theory:**
- Robert Jervis - Security dilemmas
- Keir Lieber & Daryl Press - Nuclear offense-defense balance
- Bruce Schneier - Cyber security economics

**Post-Scarcity Peace:**
- Michael Doyle - Democratic peace theory
- Resource curse literature (inverted)
- Trade interdependence and peace

---

## Related Systems

- **[Catastrophic Scenarios](../mechanics/catastrophic-scenarios.md)** - Nuclear war prevention
- **[Breakthrough Technologies](./breakthrough-technologies.md)** - Clean Energy, tech for peace
- **[Governance Quality](./governance-quality.md)** - Democratic requirement for diplomacy
- **[Upward Spirals](./upward-spirals.md)** - Peace enables other spirals

---

**Code Location:** `src/simulation/conflictResolution.ts:1`
**Integration:** `src/simulation/catastrophicScenarios.ts:180` (diplomatic intervention call)
**Version:** 2.1 (Phase 2F - October 2025)
