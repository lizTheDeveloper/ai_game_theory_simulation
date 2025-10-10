# Governance Quality & Democratic Resilience

**Version:** 2.1
**Last Updated:** October 2025
**Code Reference:** `src/simulation/governanceQuality.ts`

## Overview

The governance quality system models how AI-augmented government decision-making affects policy effectiveness and democratic resilience. High-capability aligned AI can make governments MORE effective, while poor governance creates vulnerabilities to authoritarian capture.

**Key Insight:** The quality of governance determines whether breakthrough technologies deploy successfully and whether societies can resist dystopian lock-in during crises.

## Core Metrics

### 1. Decision Quality (0.35-1.0)

Measures the quality of government policy decisions.

**Formula:**
```typescript
decisionQuality = (0.5 + aiAugmentation + capacityBonus) * govTypeMultiplier

where:
- aiAugmentation = min(0.3, avgCapability * avgAlignment * 0.15)
- capacityBonus = institutionalCapacity * 0.2
- govTypeMultiplier:
  - Democratic: 0.9 (slower but sustainable)
  - Technocratic: 1.2 (efficient)
  - Authoritarian: 0.7 (fear, yes-men, suppressed info)
```

**Effects:**
- Higher decision quality → better policy effectiveness (up to 1.3x)
- AI capability + alignment = better decisions
- Authoritarian governments fundamentally limited (0.7x cap)

**Range Examples:**
- Excellent technocracy + aligned AI: 1.0
- Good democracy + moderate AI: 0.75
- Authoritarian dictatorship: 0.35-0.49

### 2. Transparency (0.1-0.9)

Measures government openness and information flow to citizens.

**Monthly Dynamics:**
```typescript
// Authoritarian erosion
if (governmentType === 'authoritarian') {
  transparency -= 0.02;  // Gradual opacity
}

// Democratic improvement
if (governmentType === 'democratic' && legitimacy > 0.6) {
  transparency += 0.01;  // Slow strengthening
}

// Surveillance penalty
if (surveillance > 0.5) {
  transparency -= 0.01;  // Hiding from citizens
}
```

**Effects:**
- Affects legitimacy recovery
- Influences civic participation
- Provides defense against authoritarian takeover (up to 50%)

### 3. Participation Rate (0.1-0.9)

Percentage of population actively engaged in civic life.

**Monthly Dynamics:**
```typescript
// Trust in AI
if (trustInAI > 0.7) {
  participation += 0.02;  // AI helps coordinate
} else if (trustInAI < 0.4) {
  participation -= 0.02;  // Disengagement
}

// Transparency feedback
if (transparency > 0.7) {
  participation += 0.015;
} else if (transparency < 0.4) {
  participation -= 0.015;
}

// Meaning crisis
if (meaningCollapseActive) {
  participation -= 0.015;  // Apathy
}

// Authoritarian suppression
if (governmentType === 'authoritarian') {
  participation -= 0.025;  // Forced atomization
}
```

**Effects:**
- High participation → stronger resistance to authoritarianism (up to 30%)
- Civic engagement prevents dystopian capture
- Feedback loop with transparency and trust

### 4. Institutional Capacity (0.2-1.0)

Government's ability to execute policy and coordinate responses.

**Monthly Dynamics:**
```typescript
// Decision quality feedback
if (decisionQuality > 0.7) {
  capacity += 0.01;  // Good decisions build capacity
} else if (decisionQuality < 0.4) {
  capacity -= 0.01;  // Poor decisions erode
}

// Economic development
if (economicStage >= 4) {
  capacity += 0.005;  // Mature economy helps
}

// Crisis overload
const activeCrises = countActiveCrises();
if (activeCrises > 2) {
  capacity -= 0.01 * (activeCrises - 2);  // Overwhelmed
}
```

**Effects:**
- Affects policy effectiveness multiplier (up to 1.2x)
- Higher capacity → faster tech research
- Crisis management capability

## Key Functions

### Authoritarian Resistance

Calculates how strongly democratic institutions resist authoritarian capture:

```typescript
function getAuthoritarianResistance(state: GameState): number {
  const { transparency, participation, institutionalCapacity } =
    state.government.governanceQuality;

  // Each metric provides defensive benefit
  const transparencyDefense = transparency * 0.5;   // Up to 50%
  const participationDefense = participation * 0.3;  // Up to 30%
  const capacityDefense = institutionalCapacity * 0.2;  // Up to 20%

  const totalDefense = transparencyDefense + participationDefense + capacityDefense;
  // Max 100% defense = 0x multiplier (impossible to transition)

  return 1.0 - totalDefense;  // Returns multiplier on transition chance
}
```

**Applied to:**
- Crisis-driven authoritarian transitions (Phase 2B)
- AI threat authoritarian transitions
- Future: Coup attempts, power grabs

**Examples:**
- High-quality democracy (0.8 transparency, 0.7 participation, 0.8 capacity):
  - Defense = 0.4 + 0.21 + 0.16 = 0.77
  - Resistance = 1 - 0.77 = **0.23x** (77% reduction in auth risk)
- Weak democracy (0.4 transparency, 0.3 participation, 0.4 capacity):
  - Defense = 0.2 + 0.09 + 0.08 = 0.37
  - Resistance = 1 - 0.37 = **0.63x** (37% reduction)
- Failed state (0.2 transparency, 0.2 participation, 0.3 capacity):
  - Defense = 0.1 + 0.06 + 0.06 = 0.22
  - Resistance = 1 - 0.22 = **0.78x** (22% reduction)

### Policy Effectiveness Multiplier

Calculates how effective government policies are:

```typescript
function getPolicyEffectivenessMultiplier(state: GameState): number {
  const { decisionQuality, institutionalCapacity } =
    state.government.governanceQuality;

  // Better decisions → more effective policy (70%-130%)
  const baseMultiplier = 0.7 + (decisionQuality * 0.6);

  // Higher capacity → better execution (80%-120%)
  const executionMultiplier = 0.8 + (institutionalCapacity * 0.4);

  return baseMultiplier * executionMultiplier;  // Range: 0.56-1.56
}
```

**Applied to:**
- Breakthrough technology research speed
- Crisis resolution effectiveness
- Government action outcomes

**Examples:**
- Excellent governance (1.0 decision quality, 1.0 capacity):
  - Base: 0.7 + 0.6 = 1.3
  - Execution: 0.8 + 0.4 = 1.2
  - **Total: 1.56x effectiveness** (56% faster research)
- Average governance (0.6 decision quality, 0.6 capacity):
  - Base: 0.7 + 0.36 = 1.06
  - Execution: 0.8 + 0.24 = 1.04
  - **Total: 1.10x effectiveness** (10% faster)
- Poor governance (0.4 decision quality, 0.4 capacity):
  - Base: 0.7 + 0.24 = 0.94
  - Execution: 0.8 + 0.16 = 0.96
  - **Total: 0.90x effectiveness** (10% slower)

## Integration Points

### Engine Loop
```typescript
// After agent actions, before dystopia progression
updateGovernanceQuality(state);
updateGovernmentControlResponse(state); // Now uses authoritarian resistance
```

### Dystopia Progression
```typescript
// Crisis-driven authoritarianism
const baseChance = 0.03 * (crisisCount - 3);  // 3% per crisis above 3
const adjustedChance = baseChance * getAuthoritarianResistance(state);

// Example: 6 crises = 9% base, with good governance = 2.7% actual
```

### Breakthrough Technologies
```typescript
// Research progress
progressThisMonth *= getPolicyEffectivenessMultiplier(state);

// High-quality governance: 20-56% faster research
// Poor governance: 10-44% slower research
```

## Feedback Loops

### Virtuous Cycle (Path to Utopia)

```
High-capability aligned AI
  ↓
Better decision quality (+0.3 from AI)
  ↓
More effective research/policy (1.2-1.5x)
  ↓
Faster tech unlocks & deployment
  ↓
Crises resolve faster
  ↓
Higher trust & participation
  ↓
Stronger democratic resilience (80% resistance)
  ↓
STABILITY → Utopia achievable
```

### Vicious Cycle (Dystopia Lock-In)

```
Multiple crises + low trust
  ↓
Authoritarian transition attempt (9% with 6 crises)
  ↓
Low participation = weak resistance (0.7x multiplier)
  ↓
Authoritarian takeover succeeds
  ↓
Transparency drops (-2%/month)
  ↓
Capacity drops (crisis overload)
  ↓
Poor decision quality (0.7x multiplier)
  ↓
Can't research social tech effectively (20-50% rates)
  ↓
Crises persist indefinitely
  ↓
PERMANENT DYSTOPIA
```

## Common Patterns

### Pattern 1: AI-Augmented Democracy (15-20% of runs)
- High AI capability (2.0+) + high alignment (0.7+)
- Democratic government maintained
- Decision quality: 0.8-0.9
- Policy effectiveness: 1.3-1.5x
- **Outcome:** Technologies deploy fast, crises resolve → Utopia path

### Pattern 2: Democratic Erosion (30-40% of runs)
- Cascade of 4+ crises
- Participation drops (meaning crisis + crises)
- Transparency erodes (surveillance response)
- Authoritarian resistance weakens (0.5-0.7x)
- **Outcome:** Eventual authoritarian transition → Dystopia

### Pattern 3: Technocratic Efficiency (10-15% of runs)
- Technocratic government formed
- High decision quality (1.0-1.2x multiplier)
- Strong institutional capacity
- **Outcome:** Fast technical solutions, social challenges remain

### Pattern 4: Failed State Collapse (5-10% of runs)
- Crisis overload (5+ simultaneous)
- Capacity crashes (<0.3)
- Decision quality collapses
- No resistance to authoritarianism
- **Outcome:** Rapid authoritarian takeover or extinction

## Balance Considerations

### Why 1.56x Max Effectiveness Boost?
- Not overpowered (2x would be excessive)
- Requires BOTH high decision quality AND high capacity
- Realistic: Good governance ≠ magic, just more effective
- Matches historical evidence (effective states ~50% more productive)

### Why 80% Max Authoritarian Resistance?
- Leaves 20% chance even with perfect democracy
- Black swans and coups still possible
- Makes authoritarianism feel possible but not inevitable
- Reward for investing in democratic quality

### Why Transparency/Participation Decay Slow?
- Democratic erosion is gradual (months to years)
- Allows time to notice and respond
- Matches historical patterns (Hungary, Turkey took years)
- Prevents sudden unexpected transitions

### Why Authoritarian 0.7x Decision Quality?
- Systematic information suppression
- Yes-men and fear culture
- Reduced feedback loops
- Based on political science literature
- Creates meaningful strategic choice

## Testing & Results

**Pre-Implementation (Phase 2A):**
- Utopia: 0%
- Dystopia: 60%
- Extinction: 40%
- Authoritarian transitions felt inevitable
- No reward for high-quality governance

**Post-Implementation (Phase 2C):**
- Utopia: 0% (still blocked by spiral requirements)
- Dystopia: 60%
- Extinction: 40%
- But: Democratic runs now diverge from authoritarian
- High-quality governance speeds research ~30%

**Expected with Full Phase 2 (2D-2F):**
- Utopia: 10-20% (governance quality enables spiral activation)
- Dystopia: 45-55% (resistance helps but doesn't eliminate)
- Extinction: 30-40% (better crisis response)

## Future Enhancements

1. **Liquid Democracy Mechanics**
   - More granular participation modeling
   - Domain-specific expertise delegation
   - AI-assisted consensus finding

2. **International Coordination**
   - Multi-government dynamics
   - Governance quality affects diplomatic success
   - Transnational institution building

3. **Crisis Response Teams**
   - Institutional capacity in action
   - Emergency coordination protocols
   - Learning from past crises

4. **Technocratic Path Expansion**
   - More nuanced than democratic/authoritarian binary
   - Expert governance benefits and risks
   - Public legitimacy challenges

5. **Constitutional Safeguards**
   - Anti-authoritarian mechanisms
   - Rights protections
   - Judicial independence effects

## Related Systems

- **[Dystopia Progression](../mechanics/dystopia-progression.md)** - Authoritarian transitions
- **[Breakthrough Technologies](./breakthrough-technologies.md)** - Policy effectiveness on research
- **[Upward Spirals](./upward-spirals.md)** - Democratic spiral uses governance quality
- **[Outcomes](../mechanics/outcomes.md)** - Governance affects outcome probabilities

## Research & Inspiration

**Political Science:**
- Przeworski (1991) - Democracy and the Market
- Acemoglu & Robinson (2012) - Why Nations Fail
- Levitsky & Ziblatt (2018) - How Democracies Die

**AI Governance:**
- Critch & Krueger (2020) - AI Research Considerations
- Dafoe (2018) - AI Governance Challenges
- GovAI reports on institutional capacity

**Historical Cases:**
- Weimar Republic collapse (weak institutions)
- 2010s democratic backsliding (Hungary, Turkey)
- Nordic governance quality (transparency, participation)

---

**Code Location:** `src/simulation/governanceQuality.ts:1`
**Integration:** `src/simulation/engine.ts:125` (updateGovernanceQuality call)
**Version:** 2.1 (Phase 2C - October 2025)
