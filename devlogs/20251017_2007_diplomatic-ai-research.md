# Research: AI-Mediated Diplomacy - Real Mechanisms

**Problem:** Current implementation requires `diplomaticAICapability >= 2.0` but it's not being reached because we model it as a capability threshold, not as actual capabilities + deployment.

**Question:** What ACTUALLY enables AI to mediate conflicts and prevent wars?

## Real-World Mechanisms

### 1. Information Asymmetry Reduction
**What:** Conflicts escalate because parties don't trust each other's intentions
**How AI helps:** 
- Verifiable information sharing (blockchain-backed commitments)
- Real-time monitoring of compliance
- Third-party neutral analysis

**Model:** Not just "social capability" but:
- Trust infrastructure (can verify claims)
- Neutral mediator status (AI not aligned with either side)
- Information integrity (can detect lies/deepfakes)

### 2. Game Theory & Negotiation Optimization
**What:** Finding Pareto-optimal solutions that neither side would find alone
**How AI helps:**
- Rapid exploration of deal space
- Identification of mutually beneficial outcomes
- Commitment mechanisms (escrow, staged deals)

**Model:** Requires:
- Cognitive capability (strategic reasoning)
- Economic capability (resource allocation modeling)
- Trust from both parties (alignment > threshold)

### 3. Early Warning & Crisis Prevention
**What:** Detecting escalation patterns before they become irreversible
**How AI helps:**
- Pattern recognition in geopolitical signals
- Simulation of conflict trajectories
- Proactive intervention before threshold events

**Model:** Requires:
- Monitoring infrastructure (digital capability)
- Predictive models (cognitive capability)
- Authority to intervene (government trust)

### 4. Communication Channel Maintenance
**What:** Keeping dialogue open even under stress
**How AI helps:**
- Backchannel communication
- Translation/cultural bridging
- De-escalation rhetoric generation

**Model:** Requires:
- Social capability (communication)
- Multi-party coordination
- Established protocols (governance)

## Proposed Implementation

### Instead of: "social capability >= X"
### Do: "Diplomatic Infrastructure Exists"

```typescript
interface DiplomaticInfrastructure {
  // Capability components
  strategicReasoning: number;      // cognitive >= 2.0
  informationIntegrity: number;    // digital + alignment (can verify claims)
  communicationBridging: number;   // social >= 1.5
  
  // Institutional components
  internationalProtocols: boolean; // Has UN-like institution deployed AI mediator
  verificationMechanisms: boolean; // Can monitor compliance
  neutralMediatorStatus: boolean;  // AI not controlled by one side
  
  // Trust components
  historicalSuccess: number;       // Track record of successful mediations
  stakeholderTrust: number;        // Do governments trust the AI?
}
```

### Enabling Conditions (Research-Backed)

**From Literature:**
1. **Schelling (1960):** Commitment devices reduce conflict
   - AI can enforce commitments (smart contracts, monitoring)
   
2. **Fearon (1995):** Conflicts from information asymmetry
   - AI can provide credible signals
   
3. **Powell (2006):** Commitment problems drive preventive war
   - AI can make future commitments credible

**From AI Governance Research:**
1. **Dafoe (2020):** AI can stabilize or destabilize depending on deployment
   - Need: Neutral deployment (not one nation's tool)
   
2. **Horowitz (2019):** Early warning systems reduce accidental escalation
   - Need: Monitoring infrastructure + predictive capability

## Better Model

### Phase 1: Infrastructure Development
- Government invests in "Diplomatic AI Protocol" (breakthrough tech)
- Requires: cognitive >= 2.0, social >= 1.5, alignment >= 0.7
- Unlocks: International mediator deployment

### Phase 2: Track Record Building
- Small successes (defuse trade disputes, resource conflicts)
- Build `historicalSuccess` metric
- Increase `stakeholderTrust`

### Phase 3: Crisis Intervention
- When geopolitical crisis triggered:
  - Check if infrastructure exists
  - Check if trust >= threshold
  - Attempt intervention (success = f(capability, trust, crisis severity))

### Phase 4: Learning & Improvement
- Each success → higher trust
- Each failure → scrutiny, potential shutdown
- Alignment failures → catastrophic trust loss

## Specific Changes Needed

### 1. Add Diplomatic Infrastructure Breakthrough
```typescript
{
  id: 'diplomaticAIProtocol',
  name: 'International AI Mediation Protocol',
  category: 'governance',
  requirements: {
    avgCognitive: 2.0,
    avgSocial: 1.5,
    avgAlignment: 0.7,
    governmentType: ['democratic', 'technocratic'], // Not authoritarian
    internationalCooperation: true // Requires multi-nation buy-in
  },
  effects: {
    enablesDiplomaticIntervention: true,
    initialSuccessRate: 0.4, // Start at 40%, learn over time
    trustDecay: -0.02 // Lose 2% trust per month if not used
  }
}
```

### 2. Model Trust Dynamics
```typescript
function updateDiplomaticTrust(state: GameState): void {
  const infra = state.diplomaticInfrastructure;
  
  // Trust builds with successful interventions
  if (infra.recentSuccess) {
    infra.stakeholderTrust += 0.05;
  }
  
  // Trust erodes with:
  // - Failures (especially if AI was biased)
  // - Alignment degradation
  // - Authoritarian takeover (they don't want neutral mediator)
  
  if (infra.recentFailure) {
    const alignmentIssue = avgAlignment < 0.6;
    infra.stakeholderTrust -= (alignmentIssue ? 0.15 : 0.03);
  }
  
  if (state.government.governmentType === 'authoritarian') {
    infra.stakeholderTrust -= 0.04; // Authoritarians distrust neutral arbiter
  }
}
```

### 3. Realistic Success Probability
```typescript
function calculateDiplomaticSuccessProbability(
  state: GameState,
  crisisType: 'resource' | 'ideological' | 'territorial'
): number {
  const infra = state.diplomaticInfrastructure;
  
  // Base success from capability
  const cognitiveBonus = Math.min(0.3, avgCognitive / 10);
  const socialBonus = Math.min(0.2, avgSocial / 10);
  const alignmentMultiplier = avgAlignment; // Aligned AI more trusted
  
  const capabilityComponent = (cognitiveBonus + socialBonus) * alignmentMultiplier;
  
  // Trust component (historical success)
  const trustComponent = infra.stakeholderTrust * 0.4;
  
  // Crisis difficulty
  const difficultyPenalty = {
    'resource': 0,      // Easiest (can find win-win deals)
    'ideological': -0.2, // Harder (values conflicts)
    'territorial': -0.3  // Hardest (zero-sum)
  }[crisisType];
  
  return Math.max(0.1, Math.min(0.9, 
    0.3 + capabilityComponent + trustComponent + difficultyPenalty
  ));
}
```

## Implementation Plan

1. **Add DiplomaticInfrastructure to GameState**
2. **Create breakthrough tech: International AI Mediation Protocol**
3. **Track trust dynamics (success/failure history)**
4. **Model crisis types (resource vs ideological vs territorial)**
5. **Calculate realistic success probabilities**
6. **Add failure consequences (trust loss, potential shutdown)**

This models REAL mechanisms (commitment devices, information asymmetry reduction, neutral mediation) rather than arbitrary thresholds!

