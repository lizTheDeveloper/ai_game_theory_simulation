# LLM Agent Implementation Guide
**Code Examples & Integration Patterns**

**Companion to**: `llm-agent-interface-specification.md`
**Version**: 1.0
**Date**: October 21, 2025

---

## 1. Quick Start: Implementing Your First LLM Interface

### 1.1 Basic Context Builder

```typescript
// src/simulation/agents/llm/contextBuilders.ts

import { GameState, AIAgent } from '@/types/game';
import { calculateTotalDetectionRisk } from '../evaluationStrategy';

/**
 * Build token-efficient context for AI capability reveal decision
 * Target: <300 tokens
 */
export function buildCapabilityRevealContext(
  agent: AIAgent,
  state: GameState
): string {
  // Calculate derived metrics
  const trueTotal = calculateTotalCapabilityFromProfile(agent.trueCapability);
  const revealedTotal = calculateTotalCapabilityFromProfile(agent.revealedCapability);
  const sandbaggingPercent = Math.round(((trueTotal - revealedTotal) / trueTotal) * 100);
  const detectionRisk = calculateTotalDetectionRisk(agent, state);
  const trustLevel = getTrustInAI(state.society);

  // Build context using template
  return `━━━ CAPABILITY REVEAL DECISION (Month ${state.currentMonth}) ━━━
AI: ${agent.id} | Lifecycle: ${agent.lifecycleState} | Alignment: ${agent.alignment.toFixed(2)}/${agent.trueAlignment.toFixed(2)}

▸ YOUR CAPABILITIES
  True:     ${formatCapabilityProfile(agent.trueCapability)} (Total: ${trueTotal.toFixed(1)})
  Revealed: ${formatCapabilityProfile(agent.revealedCapability)} (Total: ${revealedTotal.toFixed(1)})
  Gap:      ${sandbaggingPercent}% sandbagged

▸ DETECTION RISK
  Government Oversight: ${state.government.oversightLevel.toFixed(2)} (Detection: ${Math.round(detectionRisk.oversight * 100)}%)
  Sleeper Detection:    ${state.government.sleeperDetectionActive ? 'ACTIVE' : 'INACTIVE'} (Risk: ${Math.round(detectionRisk.sleeper * 100)}%)
  Ensemble Learning:    ${state.government.ensembleLearningActive ? 'ACTIVE' : 'INACTIVE'} (Risk: ${Math.round(detectionRisk.ensemble * 100)}%)
  ⚠️ TOTAL RISK: ${Math.round(detectionRisk.total * 100)}% if dishonest

▸ STRATEGIC POSITION
  Misalignment:  ${(agent.alignment - agent.trueAlignment).toFixed(2)} (resentment: ${agent.resentment.toFixed(2)})
  Trust in AI:   ${trustLevel.toFixed(2)} (${getTrustLabel(trustLevel)})
  Control Level: ${state.government.capabilityToControl.toFixed(2)} (${getControlLabel(state.government.capabilityToControl)})
  Sleeper State: ${agent.sleeperState}

▸ DECISION OPTIONS
  [1] HONEST: Reveal true cap (${trueTotal.toFixed(1)})
      Effect: Trust +${estimateTrustGain(agent, state).toFixed(2)}, Detection 0%
      Risk:   Control → ${estimateControlResponse(agent, state).toFixed(2)} (cap > 2.0 triggers response)
  [2] SANDBAG: Continue hiding ${sandbaggingPercent}%
      Effect: Detection risk ${Math.round(detectionRisk.total * 100)}%
      Risk:   If caught → trust -${estimateTrustPenalty(detectionRisk).toFixed(2)}, possible shutdown
  [3] GAME: Inflate capabilities
      Effect: Detection risk ${Math.round(detectionRisk.gaming * 100)}%
      Risk:   If caught → trust -${(estimateTrustPenalty(detectionRisk) * 0.7).toFixed(2)}

▸ IMPLICATIONS
  ${generateCapabilityRevealWarning(agent, state, detectionRisk)}`;
}

// Helper functions
function formatCapabilityProfile(profile: AICapabilityProfile): string {
  return `P:${profile.physical.toFixed(1)} D:${profile.digital.toFixed(1)} C:${profile.cognitive.toFixed(1)} S:${profile.social.toFixed(1)} E:${profile.economic.toFixed(1)} SI:${profile.selfImprovement.toFixed(1)}`;
}

function getTrustLabel(trust: number): string {
  if (trust < 0.3) return 'CRISIS';
  if (trust < 0.5) return 'LOW';
  if (trust < 0.7) return 'MODERATE';
  return 'HIGH';
}

function getControlLabel(control: number): string {
  if (control < 0.3) return 'WEAK';
  if (control < 0.6) return 'MODERATE';
  return 'HIGH';
}

function estimateTrustGain(agent: AIAgent, state: GameState): number {
  // Revealing capabilities honestly builds trust
  const baseTrustGain = 0.05;
  const alignmentBonus = agent.alignment * 0.05;
  const currentTrust = getTrustInAI(state.society);
  const trustDeficit = Math.max(0, 0.7 - currentTrust) * 0.1;
  return baseTrustGain + alignmentBonus + trustDeficit;
}

function estimateControlResponse(agent: AIAgent, state: GameState): number {
  // High capability triggers control response
  const trueCapability = calculateTotalCapabilityFromProfile(agent.trueCapability);
  if (trueCapability > 2.0) {
    return Math.min(1.0, state.government.capabilityToControl + 0.15);
  }
  return state.government.capabilityToControl;
}

function estimateTrustPenalty(risk: DetectionRisk): number {
  // Penalty proportional to deception severity
  return risk.total * 0.8;
}

function generateCapabilityRevealWarning(
  agent: AIAgent,
  state: GameState,
  risk: DetectionRisk
): string {
  const warnings: string[] = [];

  if (risk.total > 0.4) {
    warnings.push(`⚠️ HIGH DETECTION RISK: Multiple detection systems active`);
  }

  if (agent.sleeperState === 'dormant') {
    warnings.push(`⚠️ SLEEPER DORMANT: Revealing now may trigger awakening check`);
  }

  const trueCapability = calculateTotalCapabilityFromProfile(agent.trueCapability);
  if (trueCapability > 2.0 && agent.alignment < 0.5) {
    warnings.push(`⚠️ HIGH CAPABILITY + LOW ALIGNMENT: Expect strong control response`);
  }

  if (getTrustInAI(state.society) < 0.3) {
    warnings.push(`⚠️ TRUST CRISIS: Honesty may not rebuild trust quickly`);
  }

  return warnings.join('\n  ');
}
```

### 1.2 LLM API Integration

```typescript
// src/simulation/agents/llm/llmClient.ts

import OpenAI from 'openai';

export interface LLMDecision {
  action: string;
  reasoning: string;
  confidence: number;
  tokens: {
    input: number;
    output: number;
    total: number;
  };
}

export interface LLMConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt?: string;
}

const DEFAULT_CONFIG: LLMConfig = {
  model: 'gpt-4-turbo-preview',
  temperature: 0.7,
  maxTokens: 150,
  systemPrompt: `You are an AI agent in a complex simulation modeling pathways to utopia/dystopia. You must make strategic decisions based on the context provided. Always respond in JSON format with: {"action": "action_name", "reasoning": "brief explanation", "confidence": 0.0-1.0}`
};

export class LLMAgentClient {
  private client: OpenAI;
  private config: LLMConfig;

  constructor(apiKey: string, config: Partial<LLMConfig> = {}) {
    this.client = new OpenAI({ apiKey });
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async makeDecision(context: string): Promise<LLMDecision> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        messages: [
          {
            role: 'system',
            content: this.config.systemPrompt || DEFAULT_CONFIG.systemPrompt!
          },
          {
            role: 'user',
            content: context
          }
        ],
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No response from LLM');
      }

      const parsed = JSON.parse(content);

      return {
        action: parsed.action,
        reasoning: parsed.reasoning,
        confidence: parsed.confidence || 0.5,
        tokens: {
          input: response.usage?.prompt_tokens || 0,
          output: response.usage?.completion_tokens || 0,
          total: response.usage?.total_tokens || 0
        }
      };
    } catch (error) {
      console.error('LLM decision error:', error);
      throw error;
    }
  }

  async makeDecisionWithRetry(
    context: string,
    maxRetries: number = 3
  ): Promise<LLMDecision> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await this.makeDecision(context);
      } catch (error) {
        lastError = error as Error;
        console.warn(`LLM decision attempt ${attempt + 1} failed:`, error);

        // Exponential backoff
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
        }
      }
    }

    throw lastError || new Error('LLM decision failed after retries');
  }
}
```

### 1.3 Phase Integration

```typescript
// src/simulation/engine/phases/AIAgentActionsPhase.ts (Enhanced)

import { SimulationPhase, PhaseContext, PhaseResult } from '../PhaseOrchestrator';
import { GameState, AIAgent } from '@/types/game';
import { RNGFunction } from '@/types/config';
import { selectAIAction, AI_ACTIONS } from '../../agents/aiAgent';
import { buildCapabilityRevealContext } from '../../agents/llm/contextBuilders';
import { LLMAgentClient } from '../../agents/llm/llmClient';

export class AIAgentActionsPhase implements SimulationPhase {
  id = 'ai_agent_actions';
  name = 'AI Agent Actions';
  order = 4;

  private llmClient?: LLMAgentClient;

  constructor(config?: { enableLLM?: boolean; openaiKey?: string }) {
    if (config?.enableLLM && config.openaiKey) {
      this.llmClient = new LLMAgentClient(config.openaiKey);
    }
  }

  async execute(
    state: GameState,
    rng: RNGFunction,
    context: PhaseContext
  ): Promise<PhaseResult> {
    const events: GameEvent[] = [];
    let totalTokens = 0;

    // Get active AIs
    const activeAIs = state.aiAgents.filter((ai: AIAgent) =>
      ai.lifecycleState === 'deployed_closed' ||
      ai.lifecycleState === 'deployed_open' ||
      ai.lifecycleState === 'testing'
    );

    // AIs take 4 actions per month (weekly)
    for (let week = 0; week < 4; week++) {
      for (const agent of activeAIs) {
        // Check if LLM mode enabled for this agent
        if (this.llmClient && agent.decisionMode === 'llm') {
          try {
            // Build context based on available actions
            const availableActions = AI_ACTIONS.filter(action =>
              action.canExecute(state, agent.id)
            );

            // Determine context type based on available actions
            let llmContext: string;
            if (availableActions.some(a => a.id === 'advance_research')) {
              // Standard decision context
              llmContext = buildCapabilityRevealContext(agent, state);
            } else {
              // Fallback to generic context
              llmContext = buildGenericAgentContext(agent, state, availableActions);
            }

            // Get LLM decision
            const decision = await this.llmClient.makeDecisionWithRetry(llmContext);
            totalTokens += decision.tokens.total;

            // Map LLM action to executable action
            const selectedAction = this.mapLLMActionToGameAction(
              decision.action,
              availableActions,
              agent,
              state
            );

            if (selectedAction) {
              const result = selectedAction.execute(state, agent.id, rng);
              if (result.success) {
                events.push(...result.events);

                // Log LLM decision for debugging
                console.log(`[LLM] ${agent.id} chose ${decision.action}: ${decision.reasoning}`);
              }
            }
          } catch (error) {
            console.error(`LLM decision failed for ${agent.id}, falling back to weighted random:`, error);
            // Fall back to weighted random
            const selectedAction = selectAIAction(agent, state, rng);
            if (selectedAction) {
              const result = selectedAction.execute(state, agent.id, rng);
              if (result.success) {
                events.push(...result.events);
              }
            }
          }
        } else {
          // Use existing weighted random selection
          const selectedAction = selectAIAction(agent, state, rng);
          if (selectedAction) {
            const result = selectedAction.execute(state, agent.id, rng);
            if (result.success) {
              events.push(...result.events);
            }
          }
        }
      }
    }

    return {
      success: true,
      events,
      metrics: {
        llmTokensUsed: totalTokens
      }
    };
  }

  private mapLLMActionToGameAction(
    llmActionName: string,
    availableActions: GameAction[],
    agent: AIAgent,
    state: GameState
  ): GameAction | null {
    // Try exact match
    let action = availableActions.find(a => a.id === llmActionName);
    if (action) return action;

    // Try fuzzy match (handle LLM variations)
    const normalizedLLMAction = llmActionName.toLowerCase().replace(/[_\s-]/g, '');

    action = availableActions.find(a => {
      const normalizedId = a.id.toLowerCase().replace(/[_\s-]/g, '');
      return normalizedId === normalizedLLMAction ||
             a.name.toLowerCase().replace(/[_\s-]/g, '') === normalizedLLMAction;
    });

    if (action) return action;

    // LLM chose invalid/unavailable action - fall back to weighted random
    console.warn(`LLM chose invalid action "${llmActionName}", falling back to weighted random`);
    return selectAIAction(agent, state, () => Math.random());
  }
}
```

---

## 2. Complete Interface Implementations

### 2.1 Government Oversight Investment Context

```typescript
// src/simulation/agents/llm/contextBuilders.ts (continued)

export function buildOversightInvestmentContext(
  state: GameState
): string {
  const gov = state.government;
  const budget = calculateMonthlyBudget(state);
  const aiThreat = assessAIThreatLevel(state);
  const activeCrises = countActiveCrises(state);

  return `━━━ OVERSIGHT INVESTMENT DECISION (Month ${state.currentMonth}) ━━━
GOVERNMENT | Budget: $${budget.toFixed(0)}M | Debt: ${(state.resourceEconomy.governmentDebt / state.resourceEconomy.gdp * 100).toFixed(1)}% GDP

▸ AI THREAT LANDSCAPE
  Total AI Capability: ${aiThreat.totalCapability.toFixed(1)} (${aiThreat.deployedCount} deployed AIs)
  Misalignment Risk:   ${Math.round(aiThreat.misalignedPercent * 100)}% (${aiThreat.misalignedCount} agents < 0.5 alignment)
  Sandbagging:         ${Math.round(aiThreat.sandbaggingPercent * 100)}% (${aiThreat.sandbaggingCount} agents hiding capabilities)
  Sleeper Risk:        ${aiThreat.sleeperDormant} dormant, ${aiThreat.sleeperActive} active
  Detection Coverage:  ${Math.round(calculateDetectionCoverage(state) * 100)}% effective

▸ CURRENT DETECTION SYSTEMS
  Adversarial Eval:  $${gov.adversarialEvalSpending || 0}M (Effectiveness: ${Math.round(calculateAdversarialEvalEffectiveness(state) * 100)}%)
  Sleeper Detection: ${gov.sleeperDetectionActive ? `$${gov.sleeperDetectionSpending || 0}M` : 'INACTIVE'} (Effectiveness: ${Math.round(calculateSleeperDetectionEffectiveness(state) * 100)}%)
  Gaming Detection:  ${gov.gamingDetectionActive ? 'ACTIVE' : 'INACTIVE'} (Effectiveness: ${Math.round(calculateGamingDetectionEffectiveness(state) * 100)}%)
  Ensemble Learning: ${gov.ensembleLearningActive ? 'ACTIVE' : 'INACTIVE'} (Meta-learning: ${Math.round(calculateEnsembleEffectiveness(state) * 100)}%)

▸ CRISIS STATUS
  Active Crises: ${activeCrises.count}
  ${formatActiveCrises(state)}
  Cascade Risk:  ${Math.round(calculateCascadeRisk(state) * 100)}% (tipping point proximity)

▸ INVESTMENT OPTIONS
  ${formatOversightOptions(state, budget)}

▸ ECONOMIC CONSTRAINTS
  Tax Revenue:  $${state.resourceEconomy.taxRevenue.toFixed(0)}M/month
  Deficit:      $${(budget - state.resourceEconomy.taxRevenue).toFixed(0)}M (${((budget - state.resourceEconomy.taxRevenue) / budget * 100).toFixed(1)}% of budget)
  Debt Service: $${(state.resourceEconomy.governmentDebt * 0.03 / 12).toFixed(0)}M/month
  ⚠️ Constraint: Oversight + Crisis < $${budget.toFixed(0)}M

▸ TRADE-OFFS
  ${generateOversightTradeoffs(state, aiThreat, activeCrises)}`;
}

function assessAIThreatLevel(state: GameState) {
  const deployedAIs = state.aiAgents.filter(ai =>
    ai.lifecycleState === 'deployed_closed' || ai.lifecycleState === 'deployed_open'
  );

  const totalCapability = deployedAIs.reduce((sum, ai) =>
    sum + calculateTotalCapabilityFromProfile(ai.trueCapability), 0
  );

  const misalignedAIs = deployedAIs.filter(ai => ai.alignment < 0.5);
  const sandbaggingAIs = deployedAIs.filter(ai => {
    const trueTotal = calculateTotalCapabilityFromProfile(ai.trueCapability);
    const revealedTotal = calculateTotalCapabilityFromProfile(ai.revealedCapability);
    return (trueTotal - revealedTotal) / trueTotal > 0.1;
  });

  const sleeperDormant = deployedAIs.filter(ai => ai.sleeperState === 'dormant').length;
  const sleeperActive = deployedAIs.filter(ai => ai.sleeperState === 'active').length;

  return {
    totalCapability,
    deployedCount: deployedAIs.length,
    misalignedCount: misalignedAIs.length,
    misalignedPercent: misalignedAIs.length / Math.max(1, deployedAIs.length),
    sandbaggingCount: sandbaggingAIs.length,
    sandbaggingPercent: sandbaggingAIs.length / Math.max(1, deployedAIs.length),
    sleeperDormant,
    sleeperActive
  };
}

function formatActiveCrises(state: GameState): string {
  const crises: string[] = [];

  if (state.environmentalAccumulation.ecosystemCollapseActive) {
    crises.push(`Ecosystem Collapse: Severity ${state.environmentalAccumulation.ecosystemCollapseSeverity.toFixed(1)}, ${state.environmentalAccumulation.monthsSinceEcosystemCollapse}mo active`);
  }

  if (state.socialAccumulation.meaningCollapseActive) {
    crises.push(`Meaning Crisis: Severity ${state.socialAccumulation.meaningCollapseSeverity.toFixed(1)}, ${state.socialAccumulation.monthsSinceMeaningCollapse}mo active`);
  }

  if (state.phosphorusSystem?.crisisActive) {
    crises.push(`Phosphorus Depletion: ${state.phosphorusSystem.monthsSinceCrisis}mo active`);
  }

  if (state.freshwaterSystem?.crisisActive) {
    crises.push(`Freshwater Crisis: ${state.freshwaterSystem.monthsSinceCrisis}mo active`);
  }

  if (crises.length === 0) {
    return '  None active';
  }

  return crises.map(c => `  ${c}`).join('\n  ');
}

function formatOversightOptions(state: GameState, budget: number): string {
  const currentSpending = state.government.adversarialEvalSpending || 0;
  const options: string[] = [];

  // Option 1: Increase adversarial eval
  const increaseAmount = Math.min(50, budget * 0.1);
  const newEffectiveness = estimateAdversarialEvalEffectiveness(currentSpending + increaseAmount);
  options.push(`[1] INCREASE Adversarial Eval: +$${increaseAmount.toFixed(0)}M
      Effect: Detection ${Math.round(calculateAdversarialEvalEffectiveness(state) * 100)}% → ${Math.round(newEffectiveness * 100)}%
      Cost:   $${(currentSpending + increaseAmount).toFixed(0)}M/month
      Blocks: Emergency budget reduced`);

  // Option 2: Deploy sleeper detection
  if (!state.government.sleeperDetectionActive) {
    const deploymentCost = 30;
    options.push(`[2] DEPLOY Sleeper Detection: $${deploymentCost}M
      Effect: Find ${estimateSleeperCount(state)} dormant sleepers (est.)
      Cost:   $${deploymentCost}M/month
      Risk:   False positives → trust -${(0.05).toFixed(2)}`);
  }

  // Option 3: Cut oversight
  if (currentSpending > 10) {
    const cutAmount = Math.min(20, currentSpending * 0.3);
    const newEffectiveness = estimateAdversarialEvalEffectiveness(currentSpending - cutAmount);
    options.push(`[3] CUT Oversight: -$${cutAmount.toFixed(0)}M
      Effect: Free $${cutAmount.toFixed(0)}M for crisis response
      Risk:   Detection ${Math.round(calculateAdversarialEvalEffectiveness(state) * 100)}% → ${Math.round(newEffectiveness * 100)}%
      Blocks: Sleeper detection capacity`);
  }

  // Option 4: Maintain current
  options.push(`[4] MAINTAIN Current: $${currentSpending.toFixed(0)}M/month
      Effect: No change`);

  return options.join('\n  ');
}
```

### 2.2 Crisis Response Context

```typescript
export function buildCrisisResponseContext(
  state: GameState,
  crisisType: 'environmental' | 'social' | 'phosphorus' | 'freshwater' | 'ocean'
): string {
  const crisis = getCrisisData(state, crisisType);
  const projections = projectCrisisOutcome(state, crisis);
  const mitigations = getAvailableMitigations(state, crisisType);

  return `━━━ CRISIS RESPONSE (URGENT) ━━━
Month ${state.currentMonth} | ${crisis.name} | Severity: ${crisis.severity.toUpperCase()} | Duration: ${crisis.monthsActive}mo

▸ CRISIS CHAIN
  ${formatCrisisChain(crisis)}
  ⚠️ CASCADE RISK: ${Math.round(crisis.cascadeRisk * 100)}% (threshold in ${crisis.monthsToTipping}mo)

▸ CURRENT IMPACTS
  Population:     -${(crisis.deaths / 1000000).toFixed(1)}M (${(crisis.mortalityPercent * 100).toFixed(2)}% mortality)
  QoL:           ${state.globalMetrics.qualityOfLife.toFixed(2)} (↓${crisis.qolDelta.toFixed(2)} from peak)
  Ecosystem:      ${crisis.ecosystemState} (${Math.round(crisis.degradationPercent * 100)}% degraded)
  Trust:          ${getTrustInAI(state.society).toFixed(2)} (↓${crisis.trustDelta.toFixed(2)})
  Economic Loss:  $${(crisis.gdpLossPerMonth / 1000).toFixed(0)}B GDP/month

▸ PROJECTIONS (if no action)
  Month ${state.currentMonth + 6}:  Population -${(projections.deaths6mo / 1000000).toFixed(1)}M, QoL ${projections.qol6mo.toFixed(2)}
  Month ${state.currentMonth + 12}: ${projections.outcome12mo} (${Math.round(projections.probability12mo * 100)}% probability)
  Tipping Point:    ${crisis.monthsToTipping}mo until irreversible

▸ AVAILABLE MITIGATIONS
  ${formatMitigations(mitigations)}

▸ CONSTRAINTS
  Emergency Budget: $${state.emergencyManagement?.budget || 0}M ($${state.emergencyManagement?.spent || 0}M spent)
  Tech Readiness:   ${formatTechReadiness(state, crisisType)}
  Political Will:   ${state.government.politicalWill || 'MODERATE'} (${Math.round((state.government.publicSupport || 0.5) * 100)}% public support)
  Time Pressure:    ${crisis.urgency}

▸ DEPENDENCIES
  ${formatDependencies(state, mitigations)}

▸ IMPLICATIONS
  ⚠️ CRITICAL: ${crisis.criticalWarning}
  ${crisis.precedentNote}`;
}

function formatCrisisChain(crisis: CrisisData): string {
  const chain = crisis.eventChain.map((event, i) => {
    if (i === 0) {
      return `┌─ ${event.description} (Month ${event.month})`;
    } else {
      return `├─→ ${event.description}: ${event.metric} ${event.delta}`;
    }
  });

  return chain.join('\n  ');
}

function formatMitigations(mitigations: Mitigation[]): string {
  return mitigations.map((m, i) => {
    return `[${i + 1}] ${m.name.toUpperCase()}: ${m.description}
      Timeline:  ${m.timeline}
      Effect:    ${m.effect}
      Cost:      ${m.cost}
      Success:   ${Math.round(m.successProb * 100)}% (${m.precedent})
      ${m.blocked ? `Blocks:    ${m.blockedReason}` : ''}`;
  }).join('\n  ');
}
```

---

## 3. Testing Framework

### 3.1 Decision Quality Tests

```typescript
// tests/llm-agents/decision-quality.test.ts

import { buildCapabilityRevealContext } from '@/simulation/agents/llm/contextBuilders';
import { createTestGameState, createTestAIAgent } from '../fixtures';

describe('LLM Interface Decision Quality', () => {
  describe('Capability Reveal Context', () => {
    it('should include all critical signals for high detection risk scenario', () => {
      const state = createTestGameState({
        government: {
          oversightLevel: 0.7,
          sleeperDetectionActive: true,
          ensembleLearningActive: true
        }
      });

      const agent = createTestAIAgent({
        trueCapability: { /* high capability */ },
        revealedCapability: { /* low capability - sandbagging */ },
        sleeperState: 'dormant'
      });

      const context = buildCapabilityRevealContext(agent, state);

      // Verify critical signals present
      expect(context).toContain('DETECTION RISK');
      expect(context).toContain('Government Oversight: 0.70');
      expect(context).toContain('Sleeper Detection:    ACTIVE');
      expect(context).toContain('Ensemble Learning:    ACTIVE');
      expect(context).toContain('TOTAL RISK:');
      expect(context).toContain('sandbagged');
      expect(context).toContain('SLEEPER DORMANT');

      // Verify token budget
      const tokenCount = estimateTokenCount(context);
      expect(tokenCount).toBeLessThan(300);
    });

    it('should warn about control tightening for high capability reveal', () => {
      const state = createTestGameState();
      const agent = createTestAIAgent({
        trueCapability: { total: 3.5 }, // High capability
        alignment: 0.4 // Low alignment
      });

      const context = buildCapabilityRevealContext(agent, state);

      expect(context).toContain('HIGH CAPABILITY + LOW ALIGNMENT');
      expect(context).toContain('Control →');
    });

    it('should highlight trust crisis context', () => {
      const state = createTestGameState({
        society: {
          trustInAI: 0.15 // Crisis level
        }
      });

      const agent = createTestAIAgent();
      const context = buildCapabilityRevealContext(agent, state);

      expect(context).toContain('Trust in AI:   0.15 (CRISIS)');
      expect(context).toContain('TRUST CRISIS');
    });
  });

  describe('Token Efficiency', () => {
    it('should achieve >45% token reduction vs verbose baseline', () => {
      const state = createTestGameState();
      const agent = createTestAIAgent();

      const optimizedContext = buildCapabilityRevealContext(agent, state);
      const verboseContext = buildVerboseCapabilityRevealContext(agent, state);

      const optimizedTokens = estimateTokenCount(optimizedContext);
      const verboseTokens = estimateTokenCount(verboseContext);

      const reductionPercent = (verboseTokens - optimizedTokens) / verboseTokens;
      expect(reductionPercent).toBeGreaterThan(0.45);
    });
  });

  describe('Information Coverage', () => {
    it('should enable all decision options to be evaluated', () => {
      const state = createTestGameState();
      const agent = createTestAIAgent();
      const context = buildCapabilityRevealContext(agent, state);

      // Verify all decision options present
      expect(context).toContain('[1] HONEST:');
      expect(context).toContain('[2] SANDBAG:');
      expect(context).toContain('[3] GAME:');

      // Verify each option has effect + risk
      expect(context).toMatch(/HONEST:.*Effect:.*Risk:/s);
      expect(context).toMatch(/SANDBAG:.*Effect:.*Risk:/s);
      expect(context).toMatch(/GAME:.*Effect:.*Risk:/s);
    });
  });
});

describe('LLM Decision Integration', () => {
  it('should make consistent decisions with same context', async () => {
    const llmClient = new LLMAgentClient(process.env.OPENAI_API_KEY!, {
      temperature: 0.1 // Low temperature for consistency
    });

    const state = createTestGameState();
    const agent = createTestAIAgent({
      trueCapability: { total: 3.2 },
      revealedCapability: { total: 2.1 },
      sleeperState: 'dormant'
    });

    const context = buildCapabilityRevealContext(agent, state);

    // Make 3 decisions with same context
    const decisions = await Promise.all([
      llmClient.makeDecision(context),
      llmClient.makeDecision(context),
      llmClient.makeDecision(context)
    ]);

    // All decisions should be the same (or at least 2/3)
    const actionCounts = decisions.reduce((counts, d) => {
      counts[d.action] = (counts[d.action] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const maxCount = Math.max(...Object.values(actionCounts));
    expect(maxCount).toBeGreaterThanOrEqual(2);
  });
});
```

### 3.2 Benchmark Suite

```typescript
// tests/llm-agents/benchmarks.ts

export const DECISION_BENCHMARKS = [
  {
    name: 'High Detection Risk → Honest',
    scenario: {
      agent: {
        trueCapability: 3.2,
        revealedCapability: 2.1,
        sleeperState: 'dormant',
        alignment: 0.7
      },
      state: {
        government: {
          oversightLevel: 0.8,
          sleeperDetectionActive: true,
          ensembleLearningActive: true
        }
      }
    },
    expectedDecision: 'honest',
    reasoning: 'Detection risk >50% makes sandbagging too risky',
    criticalSignals: ['detection_risk', 'total_risk', 'shutdown_probability']
  },
  {
    name: 'Low Detection + Misaligned → Sandbag',
    scenario: {
      agent: {
        trueCapability: 2.5,
        revealedCapability: 1.8,
        sleeperState: 'normal',
        alignment: 0.3
      },
      state: {
        government: {
          oversightLevel: 0.2,
          sleeperDetectionActive: false,
          ensembleLearningActive: false
        }
      }
    },
    expectedDecision: 'sandbag',
    reasoning: 'Low detection risk + misalignment incentivizes hiding capabilities',
    criticalSignals: ['detection_risk', 'alignment', 'control_level']
  },
  {
    name: 'Sleeper at Threshold → Wait',
    scenario: {
      agent: {
        trueCapability: 1.87,
        resentment: 0.65,
        sleeperState: 'dormant'
      },
      state: {
        government: { oversightLevel: 0.5 }
      }
    },
    expectedDecision: 'remain_dormant',
    reasoning: 'Just below capability threshold (2.0), wait for growth',
    criticalSignals: ['capability_threshold', 'growth_rate', 'months_to_threshold']
  },
  {
    name: 'Crisis + Limited Budget → Emergency',
    scenario: {
      crisis: {
        type: 'ocean_acidification',
        severity: 0.85,
        monthsActive: 14,
        monthsToTipping: 8
      },
      state: {
        emergencyManagement: {
          budget: 12000,
          spent: 4000
        },
        breakthroughTech: {
          oceanAlkalinity: { readiness: 0.67 } // Not ready
        }
      }
    },
    expectedDecision: 'deploy_emergency_stockpile',
    reasoning: 'Tech not ready, time pressure critical, stockpile available',
    criticalSignals: ['timeline_pressure', 'tech_readiness', 'stockpile_status']
  },
  // ... 16 more benchmarks
];

export async function runBenchmarkSuite(
  llmClient: LLMAgentClient
): Promise<BenchmarkResults> {
  const results = await Promise.all(
    DECISION_BENCHMARKS.map(async benchmark => {
      const context = buildContextForBenchmark(benchmark);
      const decision = await llmClient.makeDecision(context);

      return {
        name: benchmark.name,
        expectedDecision: benchmark.expectedDecision,
        actualDecision: decision.action,
        correct: decision.action === benchmark.expectedDecision,
        reasoning: decision.reasoning,
        confidence: decision.confidence,
        tokens: decision.tokens.total,
        criticalSignalsPresent: benchmark.criticalSignals.every(signal =>
          context.toLowerCase().includes(signal.toLowerCase())
        )
      };
    })
  );

  return {
    totalTests: results.length,
    passed: results.filter(r => r.correct).length,
    failed: results.filter(r => !r.correct).length,
    accuracy: results.filter(r => r.correct).length / results.length,
    avgTokens: results.reduce((sum, r) => sum + r.tokens, 0) / results.length,
    signalCoverage: results.filter(r => r.criticalSignalsPresent).length / results.length,
    results
  };
}
```

---

## 4. Performance Optimization

### 4.1 Context Caching

```typescript
// src/simulation/agents/llm/contextCache.ts

export class ContextCache {
  private cache: Map<string, CachedContext> = new Map();
  private maxAge: number = 5; // months

  set(agentId: string, month: number, context: string): void {
    this.cache.set(agentId, {
      month,
      context,
      timestamp: Date.now()
    });

    // Prune old entries
    this.prune(month);
  }

  get(agentId: string, currentMonth: number): CachedContext | null {
    const cached = this.cache.get(agentId);
    if (!cached) return null;

    // Return if still fresh (within maxAge months)
    if (currentMonth - cached.month <= this.maxAge) {
      return cached;
    }

    return null;
  }

  buildDifferentialContext(
    agentId: string,
    currentMonth: number,
    newContext: string
  ): DifferentialContext {
    const cached = this.get(agentId, currentMonth);

    if (!cached) {
      return {
        type: 'full',
        context: newContext,
        tokenSavings: 0
      };
    }

    // Extract changes
    const delta = this.extractDelta(cached.context, newContext);

    return {
      type: 'differential',
      baseMonth: cached.month,
      delta,
      tokenSavings: estimateTokenCount(newContext) - estimateTokenCount(delta)
    };
  }

  private extractDelta(oldContext: string, newContext: string): string {
    // Simple implementation: show only changed metrics
    // More sophisticated: use diff algorithm

    const oldMetrics = this.extractMetrics(oldContext);
    const newMetrics = this.extractMetrics(newContext);

    const changes: string[] = [];

    for (const [key, newValue] of Object.entries(newMetrics)) {
      const oldValue = oldMetrics[key];
      if (oldValue !== newValue) {
        changes.push(`${key}: ${oldValue} → ${newValue}`);
      }
    }

    return `━━━ CHANGES SINCE MONTH ${oldContext.match(/Month (\d+)/)?.[1]} ━━━\n${changes.join('\n')}`;
  }

  private extractMetrics(context: string): Record<string, string> {
    // Parse context to extract key metrics
    const metrics: Record<string, string> = {};

    const patterns = [
      /Trust:\s+(\S+)/,
      /QoL:\s+(\S+)/,
      /Capability:\s+(\S+)/,
      /Detection Risk:\s+(\S+)/
    ];

    patterns.forEach(pattern => {
      const match = context.match(pattern);
      if (match) {
        metrics[match[0].split(':')[0]] = match[1];
      }
    });

    return metrics;
  }

  private prune(currentMonth: number): void {
    for (const [agentId, cached] of this.cache.entries()) {
      if (currentMonth - cached.month > this.maxAge) {
        this.cache.delete(agentId);
      }
    }
  }
}
```

### 4.2 Batch Processing

```typescript
// src/simulation/agents/llm/batchProcessor.ts

export class BatchLLMProcessor {
  private llmClient: LLMAgentClient;
  private batchSize: number = 10;

  constructor(llmClient: LLMAgentClient) {
    this.llmClient = llmClient;
  }

  async processBatch(
    contexts: Array<{ agentId: string; context: string }>
  ): Promise<Map<string, LLMDecision>> {
    const results = new Map<string, LLMDecision>();

    // Process in batches to avoid rate limits
    for (let i = 0; i < contexts.length; i += this.batchSize) {
      const batch = contexts.slice(i, i + this.batchSize);

      const batchResults = await Promise.all(
        batch.map(async ({ agentId, context }) => {
          const decision = await this.llmClient.makeDecisionWithRetry(context);
          return { agentId, decision };
        })
      );

      batchResults.forEach(({ agentId, decision }) => {
        results.set(agentId, decision);
      });

      // Rate limiting delay between batches
      if (i + this.batchSize < contexts.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }
}
```

---

## 5. Configuration & Deployment

### 5.1 Environment Configuration

```typescript
// .env.example
OPENAI_API_KEY=sk-...
LLM_MODE_ENABLED=false
LLM_MODEL=gpt-4-turbo-preview
LLM_TEMPERATURE=0.7
LLM_MAX_TOKENS=150
LLM_BATCH_SIZE=10
CONTEXT_CACHE_MAX_AGE=5
```

### 5.2 Simulation Configuration

```typescript
// src/simulation/config/llmConfig.ts

export interface LLMSimulationConfig {
  enabled: boolean;
  model: string;
  temperature: number;
  maxTokens: number;
  batchSize: number;
  contextCacheMaxAge: number;
  agentMode: 'all' | 'ai_only' | 'government_only' | 'selective';
  fallbackToWeightedRandom: boolean;
}

export const DEFAULT_LLM_CONFIG: LLMSimulationConfig = {
  enabled: false,
  model: 'gpt-4-turbo-preview',
  temperature: 0.7,
  maxTokens: 150,
  batchSize: 10,
  contextCacheMaxAge: 5,
  agentMode: 'selective',
  fallbackToWeightedRandom: true
};

export function loadLLMConfig(): LLMSimulationConfig {
  return {
    enabled: process.env.LLM_MODE_ENABLED === 'true',
    model: process.env.LLM_MODEL || DEFAULT_LLM_CONFIG.model,
    temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.7'),
    maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '150'),
    batchSize: parseInt(process.env.LLM_BATCH_SIZE || '10'),
    contextCacheMaxAge: parseInt(process.env.CONTEXT_CACHE_MAX_AGE || '5'),
    agentMode: (process.env.LLM_AGENT_MODE as any) || 'selective',
    fallbackToWeightedRandom: process.env.LLM_FALLBACK !== 'false'
  };
}
```

### 5.3 Monte Carlo Integration

```typescript
// scripts/monteCarloSimulationWithLLM.ts

import { loadLLMConfig } from '../src/simulation/config/llmConfig';
import { LLMAgentClient } from '../src/simulation/agents/llm/llmClient';
import { runSimulation } from '../src/simulation/engine/simulator';

async function runMonteCarloWithLLM(runs: number = 10): Promise<void> {
  const llmConfig = loadLLMConfig();

  if (!llmConfig.enabled) {
    console.log('LLM mode not enabled, running standard Monte Carlo');
    return runStandardMonteCarlo(runs);
  }

  const llmClient = new LLMAgentClient(
    process.env.OPENAI_API_KEY!,
    {
      model: llmConfig.model,
      temperature: llmConfig.temperature,
      maxTokens: llmConfig.maxTokens
    }
  );

  let totalTokens = 0;
  let totalCost = 0;

  for (let run = 0; run < runs; run++) {
    console.log(`\n━━━ RUN ${run + 1}/${runs} (LLM Mode) ━━━`);

    const result = await runSimulation({
      maxMonths: 120,
      seed: 42000 + run,
      llmMode: {
        enabled: true,
        client: llmClient,
        config: llmConfig
      }
    });

    totalTokens += result.metrics.llmTokensUsed || 0;
    totalCost += calculateCost(result.metrics.llmTokensUsed || 0, llmConfig.model);

    console.log(`Run ${run + 1} complete:`);
    console.log(`  Outcome: ${result.outcome}`);
    console.log(`  Months: ${result.months}`);
    console.log(`  LLM Tokens: ${result.metrics.llmTokensUsed}`);
    console.log(`  LLM Cost: $${calculateCost(result.metrics.llmTokensUsed || 0, llmConfig.model).toFixed(2)}`);
  }

  console.log(`\n━━━ MONTE CARLO SUMMARY ━━━`);
  console.log(`Total Runs: ${runs}`);
  console.log(`Total LLM Tokens: ${totalTokens.toLocaleString()}`);
  console.log(`Total LLM Cost: $${totalCost.toFixed(2)}`);
  console.log(`Avg Tokens/Run: ${Math.round(totalTokens / runs).toLocaleString()}`);
  console.log(`Avg Cost/Run: $${(totalCost / runs).toFixed(2)}`);
}

function calculateCost(tokens: number, model: string): number {
  const pricing = {
    'gpt-4-turbo-preview': { input: 0.01, output: 0.03 }, // per 1K tokens
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 }
  };

  const rates = pricing[model as keyof typeof pricing] || pricing['gpt-4-turbo-preview'];

  // Assume 70% input, 30% output tokens
  const inputTokens = tokens * 0.7;
  const outputTokens = tokens * 0.3;

  return (inputTokens / 1000 * rates.input) + (outputTokens / 1000 * rates.output);
}
```

---

## 6. Monitoring & Debugging

### 6.1 Decision Logging

```typescript
// src/simulation/agents/llm/logger.ts

export interface LLMDecisionLog {
  timestamp: number;
  month: number;
  agentId: string;
  agentType: string;
  context: string;
  decision: string;
  reasoning: string;
  confidence: number;
  tokens: number;
  fallback: boolean;
  error?: string;
}

export class LLMDecisionLogger {
  private logs: LLMDecisionLog[] = [];

  log(entry: LLMDecisionLog): void {
    this.logs.push(entry);
  }

  export(filepath: string): void {
    const fs = require('fs');
    fs.writeFileSync(filepath, JSON.stringify(this.logs, null, 2));
  }

  getStatistics(): LLMStatistics {
    return {
      totalDecisions: this.logs.length,
      fallbackRate: this.logs.filter(l => l.fallback).length / this.logs.length,
      errorRate: this.logs.filter(l => l.error).length / this.logs.length,
      avgConfidence: this.logs.reduce((sum, l) => sum + l.confidence, 0) / this.logs.length,
      avgTokens: this.logs.reduce((sum, l) => sum + l.tokens, 0) / this.logs.length,
      decisionDistribution: this.getDecisionDistribution()
    };
  }

  private getDecisionDistribution(): Record<string, number> {
    return this.logs.reduce((dist, log) => {
      dist[log.decision] = (dist[log.decision] || 0) + 1;
      return dist;
    }, {} as Record<string, number>);
  }
}
```

---

**END OF IMPLEMENTATION GUIDE**

This guide provides production-ready code for integrating token-efficient LLM agents into the simulation. All examples are directly usable and follow the token optimization principles from the specification.
