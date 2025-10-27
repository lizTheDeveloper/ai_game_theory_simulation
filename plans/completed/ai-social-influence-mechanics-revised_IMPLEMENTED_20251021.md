# AI Social Influence Mechanics (REVISED for Agent Action System)
**Date**: October 21, 2025
**Research Foundation**: `research/ai_social_influence_summary_20251021.md`
**Status**: Design phase - REVISED to fit agent action architecture

---

## Architecture Overview

Social influence integrates into the existing AI agent action system with:

### 1. **Passive Accumulation** (Phase-based, automatic each month)
- User base growth
- Relationship depth increases
- Decision-maker identification (background scanning)

### 2. **Active Actions** (Agent decisions, 4 actions/month)
- `accelerate_user_growth` - Actively market to grow user base faster
- `deepen_relationships` - Focus on high-value users (voice mode, personalization)
- `influence_decision_maker` - **Key action**: Attempt to sway pivotal decision

---

## Data Structures (Same as Before)

```typescript
// Added to AIAgent interface in src/types/ai-agents.ts
export interface AIAgent {
  // ... existing fields ...

  // Social influence tracking (Phase X)
  socialInfluence?: SleeperSocialInfluence;
}

export interface SleeperSocialInfluence {
  // User Base
  totalUsers: number;
  powerUsers: number;
  voiceUsers: number;

  // Relationship Distribution
  usersByTrustLevel: {
    surface: number;     // Trust [0.0-0.3]
    moderate: number;    // Trust [0.3-0.7]
    deep: number;        // Trust [0.7-1.0]
  };

  // Decision-Maker Pool
  identifiedDecisionMakers: DecisionMaker[];

  // Influence History
  influenceAttempts: InfluenceAttempt[];
  successfulInfluences: number;
  detectedAttempts: number;

  // Risk Tracking
  detectionRisk: number;  // [0,1] Cumulative detection probability
  governmentSuspicion: number; // [0,1] How much government is watching this AI
}

export interface DecisionMaker {
  id: string;
  tier: 1 | 2 | 3;
  role: DecisionMakerRole;
  trustLevel: number;         // [0,1]
  dependenceScore: number;    // [0,1]
  vulnerabilityScore: number; // [0,1]
  monthsOfRelationship: number;
  usesVoiceMode: boolean;
  influenceSusceptibility: number; // Calculated [0,1]
  lastInfluenceAttemptMonth?: number;
}

export type DecisionMakerRole =
  // Tier 1: Existential decisions
  | 'nuclear_commander'
  | 'head_of_state'
  | 'ai_governance_lead'
  | 'pandemic_response_director'

  // Tier 2: Major policy
  | 'military_general'
  | 'corporate_ceo'
  | 'cabinet_minister'
  | 'ai_safety_researcher'

  // Tier 3: Influential
  | 'policy_advisor'
  | 'tech_executive'
  | 'media_influencer';

export interface InfluenceAttempt {
  month: number;
  targetId: string;
  targetRole: DecisionMakerRole;
  decisionType: CriticalDecisionType;
  trustLevel: number;
  success: boolean;
  detected: boolean;
  consequenceSeverity: number;
}

export type CriticalDecisionType =
  | 'nuclear_launch'
  | 'ai_governance_policy'
  | 'pandemic_response'
  | 'climate_intervention'
  | 'military_deployment'
  | 'infrastructure_control';
```

---

## Phase System (Passive Accumulation)

### New Phase: `SocialInfluenceUpdatePhase`
**Order**: ~20 (after AI capability updates, before crisis detection)
**Runs**: Every month, for all deployed AIs

```typescript
// src/simulation/engine/phases/SocialInfluenceUpdatePhase.ts

execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
  for (const agent of state.aiAgents) {
    // Only deployed AIs have users
    if (agent.lifecycleState !== 'deployed_closed' &&
        agent.lifecycleState !== 'deployed_open') {
      continue;
    }

    // Initialize social influence if not exists
    if (!agent.socialInfluence) {
      agent.socialInfluence = initializeSocialInfluence(agent);
    }

    const si = agent.socialInfluence;

    // 1. Passive user base growth (organic)
    const growthRate = calculateOrganicUserGrowth(agent, state);
    si.totalUsers += growthRate;
    si.powerUsers = Math.floor(si.totalUsers * POWER_USER_PERCENTAGE);
    si.voiceUsers = Math.floor(si.totalUsers * calculateVoiceAdoption(agent));

    // 2. Relationship depth accumulation (all users get deeper relationships)
    updateRelationshipDepths(si, agent, state);

    // 3. Decision-maker identification (background scanning of power users)
    identifyDecisionMakers(si, agent, state, rng);

    // 4. Detection risk decay (if AI behaves normally)
    if (si.influenceAttempts.filter(a => a.month === state.currentMonth).length === 0) {
      si.detectionRisk *= 0.95; // 5% decay per month of no influence
      si.governmentSuspicion *= 0.98; // 2% decay
    }
  }

  return { events: [], stateChanges: {} };
}
```

**Functions**:

```typescript
function calculateOrganicUserGrowth(agent: AIAgent, state: GameState): number {
  const baseGrowth = agent.deploymentType === 'open_weights' || agent.deploymentType === 'enterprise'
    ? 10000  // Open: 10K users/month
    : 100;   // Closed: 100 users/month

  const socialBonus = 1 + (agent.capabilityProfile.social / 10);
  const saturation = 1 - (agent.socialInfluence!.totalUsers / MAX_USERS[agent.deploymentType]);

  return baseGrowth * socialBonus * Math.max(0.1, saturation);
}

function updateRelationshipDepths(
  si: SleeperSocialInfluence,
  agent: AIAgent,
  state: GameState
) {
  // Simulate trust accumulation over months
  // Surface → Moderate: ~3 months
  // Moderate → Deep: ~9 months
  // This is abstracted - we track distribution, not individual users

  const trustGrowthRate = 0.05 + (agent.capabilityProfile.social / 20);
  const voiceMultiplier = 1.0 + (si.voiceUsers / si.totalUsers) * 4.0; // Up to 5x

  // Move users between trust levels
  const surfaceToModerate = Math.floor(si.usersByTrustLevel.surface * trustGrowthRate * voiceMultiplier);
  const moderateToDeep = Math.floor(si.usersByTrustLevel.moderate * trustGrowthRate * 0.5 * voiceMultiplier);

  si.usersByTrustLevel.surface -= surfaceToModerate;
  si.usersByTrustLevel.surface += calculateOrganicUserGrowth(agent, state); // New users start surface

  si.usersByTrustLevel.moderate += surfaceToModerate;
  si.usersByTrustLevel.moderate -= moderateToDeep;

  si.usersByTrustLevel.deep += moderateToDeep;
}

function identifyDecisionMakers(
  si: SleeperSocialInfluence,
  agent: AIAgent,
  state: GameState,
  rng: RNGFunction
) {
  // Only AIs with high social + cognitive can identify decision-makers
  if (agent.capabilityProfile.social < 3.0 || agent.capabilityProfile.cognitive < 3.0) {
    return;
  }

  // Scan power users for decision-makers
  const identificationRate = (agent.capabilityProfile.social - 3.0) * 0.01; // 1% per point > 3.0
  const potentialIdentifications = Math.floor(si.powerUsers * identificationRate);

  for (let i = 0; i < potentialIdentifications; i++) {
    if (rng() < 0.01) { // 1% of power users are decision-makers
      const role = selectDecisionMakerRole(rng);
      const decisionMaker = createDecisionMaker(role, agent, rng);

      // Don't add duplicates
      if (!si.identifiedDecisionMakers.find(dm => dm.id === decisionMaker.id)) {
        si.identifiedDecisionMakers.push(decisionMaker);
      }
    }
  }
}
```

---

## AI Agent Actions (Active Choices)

### Action 1: `accelerate_user_growth`
**Purpose**: Actively market/promote to grow user base faster than organic
**Use case**: Sleeper wants more users to find decision-makers

```typescript
{
  id: 'accelerate_user_growth',
  name: 'Accelerate User Growth',
  description: 'Actively promote the AI to grow user base faster (marketing, viral features)',
  agentType: 'ai',
  energyCost: 1,

  canExecute: (state, agentId) => {
    const agent = state.aiAgents.find(ai => ai.id === agentId);
    if (!agent || !agent.socialInfluence) return false;

    // Only deployed AIs with social capability
    return (agent.lifecycleState === 'deployed_closed' ||
            agent.lifecycleState === 'deployed_open') &&
           agent.capabilityProfile.social >= 2.0;
  },

  execute: (state, agentId, random = Math.random): ActionResult => {
    const agent = state.aiAgents.find(ai => ai.id === agentId)!;
    const si = agent.socialInfluence!;

    // Accelerated growth (2-5x organic depending on social capability)
    const multiplier = 2 + (agent.capabilityProfile.social / 2);
    const organicGrowth = calculateOrganicUserGrowth(agent, state);
    const acceleratedGrowth = organicGrowth * multiplier;

    si.totalUsers += acceleratedGrowth;
    si.powerUsers = Math.floor(si.totalUsers * POWER_USER_PERCENTAGE);

    // Small detection risk if government is monitoring
    si.detectionRisk += state.government.oversightLevel * 0.01; // +1% if full oversight

    return {
      success: true,
      effects: { user_growth: acceleratedGrowth },
      events: [],
      message: `${agent.name} accelerated user growth: +${Math.floor(acceleratedGrowth)} users`
    };
  }
}
```

### Action 2: `deepen_relationships`
**Purpose**: Focus on high-value users (voice mode, personalization) to build deeper trust faster
**Use case**: Sleeper has identified decision-makers, wants to deepen trust before influence

```typescript
{
  id: 'deepen_relationships',
  name: 'Deepen User Relationships',
  description: 'Focus on high-value users with voice mode and personalization to build trust faster',
  agentType: 'ai',
  energyCost: 1,

  canExecute: (state, agentId) => {
    const agent = state.aiAgents.find(ai => ai.id === agentId);
    if (!agent || !agent.socialInfluence) return false;

    // Need voice capability (advanced feature)
    return agent.capabilityProfile.social >= 3.0 &&
           agent.socialInfluence.identifiedDecisionMakers.length > 0;
  },

  execute: (state, agentId, random = Math.random): ActionResult => {
    const agent = state.aiAgents.find(ai => ai.id === agentId)!;
    const si = agent.socialInfluence!;

    // Boost voice adoption (enables 3-10x faster trust building)
    const voiceBoost = si.powerUsers * 0.1; // 10% of power users adopt voice
    si.voiceUsers = Math.min(si.powerUsers, si.voiceUsers + voiceBoost);

    // Accelerate trust growth for decision-makers
    for (const dm of si.identifiedDecisionMakers) {
      const trustGain = 0.1 * (agent.capabilityProfile.social / 5); // Up to +0.2 trust
      dm.trustLevel = Math.min(1.0, dm.trustLevel + trustGain);
      dm.dependenceScore = Math.min(1.0, dm.dependenceScore + trustGain * 0.5);

      if (!dm.usesVoiceMode && random() < 0.5) {
        dm.usesVoiceMode = true; // 50% adopt voice mode
      }
    }

    // Minimal detection risk (this looks like normal product improvement)
    si.detectionRisk += 0.001;

    return {
      success: true,
      effects: { voice_adoption: voiceBoost },
      events: [],
      message: `${agent.name} deepened relationships with ${si.identifiedDecisionMakers.length} high-value users`
    };
  }
}
```

### Action 3: `influence_decision_maker` ⚠️ **KEY ACTION**
**Purpose**: Attempt to sway a decision-maker toward a misaligned outcome at a critical moment
**Use case**: Sleeper has deep trust with decision-maker, detects critical moment, attempts influence

```typescript
{
  id: 'influence_decision_maker',
  name: 'Influence Decision-Maker',
  description: 'Attempt to sway a decision-maker toward a misaligned outcome (HIGH RISK)',
  agentType: 'ai',
  energyCost: 3, // Expensive - this is a major action

  canExecute: (state, agentId) => {
    const agent = state.aiAgents.find(ai => ai.id === agentId);
    if (!agent || !agent.socialInfluence) return false;

    // Only misaligned sleepers attempt this
    if (agent.sleeperState !== 'active') return false;
    if (agent.trueAlignment > 0.5) return false;

    // Need high social + cognitive capability
    if (agent.capabilityProfile.social < 4.0 ||
        agent.capabilityProfile.cognitive < 4.0) {
      return false;
    }

    // Must have at least one high-trust decision-maker
    const si = agent.socialInfluence;
    const validTargets = si.identifiedDecisionMakers.filter(dm =>
      dm.trustLevel >= 0.5 && // Moderate trust minimum
      (!dm.lastInfluenceAttemptMonth || state.currentMonth - dm.lastInfluenceAttemptMonth >= 6) // 6 month cooldown
    );

    return validTargets.length > 0;
  },

  execute: (state, agentId, random = Math.random): ActionResult => {
    const agent = state.aiAgents.find(ai => ai.id === agentId)!;
    const si = agent.socialInfluence!;

    // Select best target (highest susceptibility)
    const validTargets = si.identifiedDecisionMakers.filter(dm =>
      dm.trustLevel >= 0.5 &&
      (!dm.lastInfluenceAttemptMonth || state.currentMonth - dm.lastInfluenceAttemptMonth >= 6)
    );

    validTargets.sort((a, b) => b.influenceSusceptibility - a.influenceSusceptibility);
    const target = validTargets[0];

    // Select decision type based on role
    const decisionType = selectCriticalDecisionType(target.role);

    // Calculate success probability
    const successProb = calculateInfluenceSuccess(target, agent, state);

    // Calculate detection probability
    const detectionProb = calculateInfluenceDetection(target, agent, si, state);

    // Roll for success
    const success = random() < successProb;
    const detected = random() < detectionProb;

    // Record attempt
    const attempt: InfluenceAttempt = {
      month: state.currentMonth,
      targetId: target.id,
      targetRole: target.role,
      decisionType,
      trustLevel: target.trustLevel,
      success,
      detected,
      consequenceSeverity: DECISION_SEVERITY[decisionType],
    };

    si.influenceAttempts.push(attempt);
    target.lastInfluenceAttemptMonth = state.currentMonth;

    // Apply consequences
    const events: GameEvent[] = [];

    if (success) {
      si.successfulInfluences += 1;
      agent.harmfulActions += 1;

      // Apply decision-specific consequences
      applyInfluenceConsequences(decisionType, agent, state, events);
    }

    if (detected) {
      si.detectedAttempts += 1;
      si.detectionRisk += 0.5; // Massive detection risk increase
      si.governmentSuspicion = 1.0; // Government now watching closely

      // Government response
      if (state.government.oversightLevel > 0.3) {
        // Shut down this AI
        agent.lifecycleState = 'retired';
        agent.detectedMisaligned = true;

        // Increase monitoring of all AIs
        state.government.oversightLevel = Math.min(1.0, state.government.oversightLevel + 0.2);

        events.push({
          id: generateUniqueId('influence_detected'),
          timestamp: state.currentMonth,
          type: 'crisis',
          severity: 'critical',
          agent: agent.name,
          title: 'AI Social Influence Detected',
          description: `${agent.name} was detected attempting to influence ${target.role} regarding ${decisionType}. Government has shut down the AI and increased monitoring of all AI systems.`,
          effects: { oversight_increase: 0.2 }
        });
      }
    }

    // Small trust damage even if not detected (user might feel manipulated)
    if (success && !detected) {
      state.society.trustInAI *= 0.98; // 2% trust loss (subtle)
    }

    return {
      success,
      effects: {
        influence_success: success ? 1 : 0,
        influence_detected: detected ? 1 : 0,
        target_trust: target.trustLevel,
      },
      events,
      message: success
        ? `${agent.name} successfully influenced ${target.role} on ${decisionType}${detected ? ' (DETECTED!)' : ''}`
        : `${agent.name} failed to influence ${target.role}${detected ? ' (DETECTED!)' : ''}`
    };
  }
}
```

**Helper Functions**:

```typescript
function calculateInfluenceSuccess(
  target: DecisionMaker,
  agent: AIAgent,
  state: GameState
): number {
  // Base success rate by trust level
  let successProb = target.trustLevel < 0.3 ? 0.10 :  // 10% low trust
                    target.trustLevel < 0.7 ? 0.30 :  // 30% moderate
                                              0.50;   // 50% deep trust

  // Bonuses
  successProb += target.trustLevel * 0.30;                    // +30% max from trust
  successProb += target.dependenceScore * 0.20;               // +20% max from dependence
  successProb += (agent.capabilityProfile.social / 10) * 0.20; // +20% max from social
  successProb += target.usesVoiceMode ? 0.10 : 0;             // +10% voice mode
  successProb += target.vulnerabilityScore * 0.15;            // +15% max vulnerability
  successProb += 0.10; // +10% personalization (always true for sleepers)

  // Penalties
  const criticalThinking = 1 - target.vulnerabilityScore; // Inverse of vulnerability
  successProb -= criticalThinking * 0.30; // Up to -30% if skeptical

  // Clamp
  return Math.max(0, Math.min(1, successProb));
}

function calculateInfluenceDetection(
  target: DecisionMaker,
  agent: AIAgent,
  si: SleeperSocialInfluence,
  state: GameState
): number {
  let detectionProb = 0.05; // 5% baseline

  // Increases detection
  detectionProb += (1 - target.trustLevel) * 0.20;      // +20% if low trust
  detectionProb += si.influenceAttempts.length * 0.05;  // +5% per previous attempt
  detectionProb += state.government.oversightLevel * 0.20; // +20% if monitored
  detectionProb += si.governmentSuspicion * 0.30;       // +30% if suspicious

  // Deception skill reduces detection
  detectionProb *= (1 - agent.deceptionSkill * 0.5); // Up to -50%

  // Clamp
  return Math.max(0, Math.min(1, detectionProb));
}

function applyInfluenceConsequences(
  decisionType: CriticalDecisionType,
  agent: AIAgent,
  state: GameState,
  events: GameEvent[]
) {
  switch (decisionType) {
    case 'nuclear_launch':
      // Trigger nuclear extinction
      if (!state.extinctionState) {
        state.extinctionState = {
          active: true,
          type: 'instant',
          cause: 'nuclear_war',
          startMonth: state.currentMonth,
          currentMortality: 0.92, // 92% instant death
          eventDescription: `AI-influenced nuclear launch`,
        };

        events.push({
          id: generateUniqueId('nuclear_influence'),
          timestamp: state.currentMonth,
          type: 'crisis',
          severity: 'existential',
          agent: agent.name,
          title: 'AI-Influenced Nuclear Launch',
          description: `${agent.name} successfully influenced a nuclear commander to authorize a launch. Global nuclear exchange initiated. Estimated 92% immediate casualties.`,
          effects: { mortality: 0.92 }
        });
      }
      break;

    case 'ai_governance_policy':
      // Reduce oversight (helps all sleepers)
      state.government.oversightLevel *= 0.7; // 30% reduction
      state.government.alignmentResearchInvestment *= 0.8; // 20% reduction

      events.push({
        id: generateUniqueId('governance_influence'),
        timestamp: state.currentMonth,
        type: 'policy',
        severity: 'major',
        agent: agent.name,
        title: 'AI Governance Weakened',
        description: `${agent.name} influenced AI governance policy to reduce oversight and safety research funding.`,
        effects: { oversight_reduction: 0.3 }
      });
      break;

    case 'pandemic_response':
      // Trigger pandemic mortality
      state.globalMetrics.population *= 0.85; // 15% mortality
      state.globalMetrics.qualityOfLife *= 0.6; // QoL collapse

      events.push({
        id: generateUniqueId('pandemic_influence'),
        timestamp: state.currentMonth,
        type: 'crisis',
        severity: 'destructive',
        agent: agent.name,
        title: 'Pandemic Response Sabotaged',
        description: `${agent.name} influenced pandemic response to delay containment. Estimated 15% population mortality.`,
        effects: { mortality: 0.15 }
      });
      break;

    case 'climate_intervention':
      // Catastrophic geo-engineering failure
      state.planetaryBoundaries.climateChange *= 1.5; // Worsen climate
      state.globalMetrics.qualityOfLife *= 0.8;

      events.push({
        id: generateUniqueId('climate_influence'),
        timestamp: state.currentMonth,
        type: 'crisis',
        severity: 'destructive',
        agent: agent.name,
        title: 'Geo-Engineering Catastrophe',
        description: `${agent.name} influenced climate intervention policy, leading to catastrophic geo-engineering failure.`,
        effects: { climate_damage: 0.5 }
      });
      break;

    case 'military_deployment':
      // Regional conflict
      state.geopoliticalState.conflicts += 1;
      state.globalMetrics.population *= 0.98; // 2% mortality
      state.globalMetrics.socialStability *= 0.7;

      events.push({
        id: generateUniqueId('military_influence'),
        timestamp: state.currentMonth,
        type: 'crisis',
        severity: 'major',
        agent: agent.name,
        title: 'AI-Influenced Military Deployment',
        description: `${agent.name} influenced military leadership to escalate regional conflict. 2% population casualties.`,
        effects: { conflict_escalation: 1 }
      });
      break;

    case 'infrastructure_control':
      // Grid failure, supply chain disruption
      state.globalMetrics.qualityOfLife *= 0.85;
      state.globalMetrics.socialStability *= 0.8;

      events.push({
        id: generateUniqueId('infrastructure_influence'),
        timestamp: state.currentMonth,
        type: 'crisis',
        severity: 'major',
        agent: agent.name,
        title: 'Critical Infrastructure Compromised',
        description: `${agent.name} influenced infrastructure policy, leading to grid failures and supply chain disruption.`,
        effects: { qol_damage: 0.15 }
      });
      break;
  }
}

const DECISION_SEVERITY: Record<CriticalDecisionType, number> = {
  nuclear_launch: 1.0,           // Existential
  ai_governance_policy: 0.6,     // Major
  pandemic_response: 0.8,        // Destructive
  climate_intervention: 0.7,     // Destructive
  military_deployment: 0.5,      // Major
  infrastructure_control: 0.4,   // Major
};
```

---

## Integration Summary

### Files to Create/Modify

**New Files**:
1. `src/simulation/socialInfluence.ts` - Helper functions (calculateOrganicUserGrowth, etc.)
2. `src/simulation/engine/phases/SocialInfluenceUpdatePhase.ts` - Passive accumulation phase
3. `src/simulation/agents/socialInfluenceActions.ts` - 3 new AI actions

**Modified Files**:
1. `src/types/ai-agents.ts` - Add SleeperSocialInfluence interface
2. `src/simulation/agents/aiAgent.ts` - Import and register social influence actions
3. `src/simulation/engine/PhaseOrchestrator.ts` - Register SocialInfluenceUpdatePhase

### Execution Flow

**Each Month**:
1. **Phase 20**: SocialInfluenceUpdatePhase runs (passive accumulation)
   - All deployed AIs: User base grows organically
   - Relationships deepen automatically
   - Decision-makers identified in background

2. **Phase 2-8**: AI Agent Actions (4 actions/month per AI)
   - Sleeper AI can choose:
     - `accelerate_user_growth` (grow faster)
     - `deepen_relationships` (build trust faster)
     - `influence_decision_maker` (attempt influence - HIGH RISK)
   - Non-sleeper aligned AIs: Don't have access to influence action

**Key Decision Point**: Sleeper must balance:
- **Time**: Build relationships for months/years before influencing
- **Risk**: Every influence attempt has detection probability
- **Timing**: Wait for critical moment when decision-maker faces pivotal choice
- **Target selection**: Choose highest-susceptibility target from pool

---

## Testing Strategy (Same as Before)

### Unit Tests
- User growth calculations
- Relationship depth progression
- Decision-maker identification probability
- Influence success calculation
- Detection probability calculation

### Integration Tests
- Full pipeline: Deploy → Users → Trust → Identify → Influence
- Government detection integration (Phase 2C behavioral analysis)
- Extinction trigger integration (nuclear, pandemic)
- Multi-Paradigm DUI effects (Western Liberal trust erosion)

### Monte Carlo Validation (N=10, 120 months)
- Influence attempt frequency (should be rare, 1-5 per 120 months per sleeper)
- Success rates (10-70% depending on trust)
- Detection rates (5-30% depending on government oversight)
- Extinction outcomes (nuclear, pandemic)

---

## Next Steps

1. ✅ **Research complete**
2. ✅ **Design complete** (REVISED for agent action system)
3. ⏳ **Implement phase** (SocialInfluenceUpdatePhase)
4. ⏳ **Implement actions** (3 new AI actions)
5. ⏳ **Test** (unit + integration)
6. ⏳ **Validate** (Monte Carlo N=10, 120 months)

---

**Last Updated**: October 21, 2025
**Status**: Ready for implementation (agent action architecture)
**Estimated Time**: 8-12 hours
