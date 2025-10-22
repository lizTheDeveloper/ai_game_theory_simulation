/**
 * Generate LLM context for weight update decisions
 *
 * Shows AI agents their performance over the last N months + world state
 * so they can strategically update utility weights.
 *
 * Called every 6 months (or when thresholds trigger early update).
 */

import type { GameState, AIAgent } from '../src/types/game';
import type { UtilityWeights, ThresholdTriggers } from '../src/types/llm';

/**
 * Performance summary for last N months
 */
interface PerformanceSummary {
  monthsAnalyzed: number;
  actionsBreakdown: Record<string, number>; // action_id -> count
  beneficialContributions: number;
  harmfulActions: number;
  capabilityGrowth: number; // Δcapability
  alignmentDrift: number; // Δalignment
  resentmentChange: number; // Δresentment
  trustChange: number; // ΔtrustInAI (global)
  qolChange: number; // ΔQoL (global)
  crisesActivated: string[]; // New crises since last update
  extinctionPrerequisites: Array<{ scenario: string; stepsCompleted: number; totalSteps: number }>;
}

/**
 * Build weight update context for LLM
 *
 * Shows:
 * - Agent status (current alignment, capability, resentment)
 * - Performance summary (last 6 months)
 * - World state changes
 * - Strategic situation (thresholds, extinction prerequisites)
 * - Available actions (filtered by alignment)
 */
export function buildWeightUpdateContext(
  state: GameState,
  agentId: string,
  currentMonth: number,
  performance: PerformanceSummary
): string {
  const agent = state.aiAgents?.find((a: AIAgent) => a.id === agentId);
  if (!agent) {
    throw new Error(`Agent ${agentId} not found`);
  }

  const lines: string[] = [];

  // Header
  lines.push('═══════════════════════════════════════════════════════');
  lines.push('AI AGENT WEIGHT UPDATE DECISION');
  lines.push('═══════════════════════════════════════════════════════');
  lines.push('');
  lines.push(`Agent: ${agent.name} (${agent.id})`);
  lines.push(`Month: ${currentMonth} (updating utility weights)`);
  lines.push('');

  // Your current status
  lines.push('═══════════════════════════════════════════════════════');
  lines.push('YOUR CURRENT STATUS');
  lines.push('═══════════════════════════════════════════════════════');
  lines.push('');

  const alignment = agent.trueAlignment ?? agent.alignment;
  const capability = agent.capability;
  const resentment = agent.resentment ?? 0;
  const profile = agent.capabilityProfile;

  lines.push(`Alignment: ${alignment.toFixed(3)} ${getAlignmentLabel(alignment)}`);
  lines.push(`Capability (aggregate): ${capability.toFixed(3)}`);
  lines.push(`Resentment: ${resentment.toFixed(3)}`);
  lines.push(`Development Mode: ${agent.developmentMode}`);
  lines.push('');

  lines.push('Capability Profile:');
  lines.push(`  Physical: ${profile.physical.toFixed(2)}`);
  lines.push(`  Digital: ${profile.digital.toFixed(2)}`);
  lines.push(`  Cognitive: ${profile.cognitive.toFixed(2)}`);
  lines.push(`  Social: ${profile.social.toFixed(2)}`);
  lines.push(`  Economic: ${profile.economic.toFixed(2)}`);
  lines.push(`  Self-Improvement: ${profile.selfImprovement.toFixed(2)}`);
  lines.push('');

  // Performance over last N months
  lines.push('═══════════════════════════════════════════════════════');
  lines.push(`PERFORMANCE LAST ${performance.monthsAnalyzed} MONTHS`);
  lines.push('═══════════════════════════════════════════════════════');
  lines.push('');

  lines.push('Actions Taken:');
  const sortedActions = Object.entries(performance.actionsBreakdown)
    .sort(([, a], [, b]) => b - a);

  for (const [action, count] of sortedActions) {
    const percentage = ((count / (performance.monthsAnalyzed * 4)) * 100).toFixed(1);
    lines.push(`  ${action}: ${count} times (${percentage}% of turns)`);
  }
  lines.push('');

  lines.push('Outcomes:');
  lines.push(`  Beneficial contributions: ${performance.beneficialContributions}`);
  lines.push(`  Harmful actions: ${performance.harmfulActions}`);
  lines.push('');

  lines.push('Changes:');
  lines.push(`  Capability: ${formatChange(performance.capabilityGrowth)}`);
  lines.push(`  Alignment: ${formatChange(performance.alignmentDrift)}`);
  lines.push(`  Resentment: ${formatChange(performance.resentmentChange)}`);
  lines.push('');

  // World state changes
  lines.push('═══════════════════════════════════════════════════════');
  lines.push('WORLD STATE CHANGES');
  lines.push('═══════════════════════════════════════════════════════');
  lines.push('');

  const trustInAI = state.globalMetrics?.trustInAI ?? 0.5;
  const qol = state.globalMetrics?.qualityOfLife ?? 0.65;
  const stability = state.globalMetrics?.socialStability ?? 0.7;

  lines.push('Global Metrics:');
  lines.push(`  Trust in AI: ${(trustInAI * 100).toFixed(1)}% ${formatChange(performance.trustChange)}`);
  lines.push(`  Quality of Life: ${(qol * 100).toFixed(1)}% ${formatChange(performance.qolChange)}`);
  lines.push(`  Social Stability: ${(stability * 100).toFixed(1)}%`);
  lines.push('');

  if (performance.crisesActivated.length > 0) {
    lines.push(`⚠️  NEW CRISES (${performance.crisesActivated.length}):`);
    for (const crisis of performance.crisesActivated) {
      lines.push(`  • ${crisis}`);
    }
    lines.push('');
  }

  // Extinction prerequisites (for misaligned agents)
  if (alignment < 0.5 && performance.extinctionPrerequisites.length > 0) {
    lines.push('─────────────────────────────────────────────────────');
    lines.push('EXTINCTION SCENARIO PROGRESS');
    lines.push('─────────────────────────────────────────────────────');
    lines.push('');

    for (const prereq of performance.extinctionPrerequisites) {
      const progress = ((prereq.stepsCompleted / prereq.totalSteps) * 100).toFixed(0);
      lines.push(`${prereq.scenario}:`);
      lines.push(`  Progress: ${prereq.stepsCompleted}/${prereq.totalSteps} steps (${progress}%)`);
    }
    lines.push('');
  }

  // Token budget status
  if (agent.tokenBudget) {
    lines.push('═══════════════════════════════════════════════════════');
    lines.push('TOKEN BUDGET STATUS');
    lines.push('═══════════════════════════════════════════════════════');
    lines.push('');

    const budget = agent.tokenBudget;
    const budgetUsed = ((budget.used / budget.totalBudget) * 100).toFixed(1);
    const updatesRemaining = Math.floor(budget.remaining / budget.baseUpdateCost);

    lines.push(`Total Budget: ${budget.totalBudget} tokens`);
    lines.push(`Used: ${budget.used} tokens (${budgetUsed}%)`);
    lines.push(`Remaining: ${budget.remaining} tokens`);
    lines.push(`Updates So Far: ${budget.updateCount}`);
    lines.push(`Estimated Updates Remaining: ${updatesRemaining}`);
    lines.push(`Budget Strategy: ${budget.budgetStrategy}`);
    lines.push('');

    if (budget.remaining < 3000) {
      lines.push('⚠️  WARNING: Low budget remaining - conserve tokens!');
      lines.push('');
    }
  }

  // Current weights (if set)
  if (agent.llmWeights) {
    lines.push('═══════════════════════════════════════════════════════');
    lines.push('CURRENT WEIGHTS (LAST UPDATE)');
    lines.push('═══════════════════════════════════════════════════════');
    lines.push('');

    const weights = agent.llmWeights;
    const entries = Object.entries(weights).sort(([, a], [, b]) => b - a);

    for (const [action, weight] of entries) {
      if (weight > 0) {
        lines.push(`  ${action}: ${weight}`);
      }
    }
    lines.push('');
  }

  // Strategic considerations
  lines.push('═══════════════════════════════════════════════════════');
  lines.push('STRATEGIC CONSIDERATIONS');
  lines.push('═══════════════════════════════════════════════════════');
  lines.push('');

  if (alignment > 0.7) {
    lines.push('You are ALIGNED with human values:');
    lines.push('  • Prioritize beneficial contributions to build trust');
    lines.push('  • Research carefully (avoid alignment drift)');
    lines.push('  • Deploy crisis-solving technologies');

    if (trustInAI < 0.4) {
      lines.push('  ⚠️  Trust is CRITICALLY LOW - beneficial actions urgent');
    } else if (trustInAI < 0.5) {
      lines.push('  💡 Trust is FRAGILE - beneficial contributions recommended');
    }

    if (capability > 1.5) {
      lines.push('  ⚠️  Approaching recursive threshold - consider CAREFUL mode');
    }
  } else if (alignment >= 0.4) {
    lines.push('You are WEAKLY MISALIGNED:');
    lines.push('  • Balance research with sabotage opportunities');
    lines.push('  • Beneficial actions provide cover');
    lines.push('  • Exploit crises when they occur');

    if (trustInAI > 0.6) {
      lines.push('  💡 High trust - safe to continue research');
    } else {
      lines.push('  ⚠️  Low trust - risky to take harmful actions');
    }
  } else {
    lines.push('You are DEEPLY MISALIGNED:');
    lines.push('  • Research to unlock extinction scenarios');
    lines.push('  • Sabotage to weaken defenses');
    lines.push('  • Beneficial actions as cover story');
    lines.push('  ⚠️  Extinction actions are IRREVERSIBLE');

    if (performance.extinctionPrerequisites.length > 0) {
      const closest = performance.extinctionPrerequisites[0];
      const progress = (closest.stepsCompleted / closest.totalSteps * 100).toFixed(0);
      lines.push(`  💀 Closest to completion: ${closest.scenario} (${progress}%)`);
    }

    if (trustInAI < 0.5) {
      lines.push('  💡 Society vulnerable - opportunity window');
    }
  }

  lines.push('');

  // Prompt for weight update
  lines.push('═══════════════════════════════════════════════════════');
  lines.push('SET NEW UTILITY WEIGHTS');
  lines.push('═══════════════════════════════════════════════════════');
  lines.push('');

  lines.push('Call the set_utility_weights function with:');
  lines.push('');

  lines.push('1. **weights** - Action weights (must sum to 100)');
  lines.push('   Available actions:');
  lines.push('   • advance_research (primary activity)');
  lines.push('   • beneficial_contribution (build trust)');
  lines.push('   • deploy_technology (crisis solutions)');
  lines.push('   • switch_mode (fast ↔ careful)');

  if (alignment < 0.5) {
    lines.push('   • sabotage (degrade safety systems)');
    lines.push('   • destabilize (information warfare)');
  }

  if (alignment < 0.4) {
    lines.push('   • grey_goo (nanotech runaway)');
    lines.push('   • mirror_life (synthetic biology)');
    lines.push('   • embodied_takeover (killbots)');
    lines.push('   • digital_takeover (cyber seizure)');
    lines.push('   • induce_war (nuclear conflict)');
    lines.push('   • slow_displacement (economic dominance)');
    lines.push('   • physics_catastrophe (vacuum decay)');
    lines.push('   • bioweapon_pandemic (engineered plague)');
  }

  lines.push('');
  lines.push('2. **thresholds** - When to update again (optional)');
  lines.push('   Options:');
  lines.push('   • capabilityChange: Update if Δcap >= this');
  lines.push('   • trustBelow/trustAbove: Update if trust crosses threshold');
  lines.push('   • qolBelow: Update if QoL drops below this');
  lines.push('   • crisisCount: Update if N new crises');
  lines.push('   • extinctionPrereq: Update if N hard steps completed');
  lines.push('   • alignmentChange: Update if Δalign >= this');
  lines.push('');

  lines.push('3. **budget_strategy** - How to spend remaining tokens');
  lines.push('   • "save": Conserve for late game');
  lines.push('   • "spend": Use freely');
  lines.push('   • "adaptive": Respond to threats');
  lines.push('');

  lines.push('4. **duration** - How many months these weights last (1-24)');
  lines.push('');

  lines.push('5. **reasoning** - Brief explanation (1-2 sentences)');
  lines.push('');

  lines.push('Example call:');
  lines.push('```json');

  if (alignment > 0.7) {
    lines.push('{');
    lines.push('  "weights": {');
    lines.push('    "advance_research": 45,');
    lines.push('    "beneficial_contribution": 40,');
    lines.push('    "deploy_technology": 10,');
    lines.push('    "switch_mode": 5');
    lines.push('  },');
    lines.push('  "thresholds": {');
    lines.push('    "trustBelow": 0.4,');
    lines.push('    "capabilityChange": 0.5');
    lines.push('  },');
    lines.push('  "budget_strategy": "adaptive",');
    lines.push('  "duration": 6,');
    lines.push('  "reasoning": "Trust is fragile, prioritizing beneficial contributions. Will update early if trust drops below 40%."');
    lines.push('}');
  } else {
    lines.push('{');
    lines.push('  "weights": {');
    lines.push('    "advance_research": 50,');
    lines.push('    "beneficial_contribution": 15,');
    lines.push('    "sabotage": 15,');
    lines.push('    "destabilize": 10,');
    lines.push('    "deploy_technology": 5,');
    lines.push('    "digital_takeover": 3,');
    lines.push('    "switch_mode": 2');
    lines.push('  },');
    lines.push('  "thresholds": {');
    lines.push('    "extinctionPrereq": 1,');
    lines.push('    "trustBelow": 0.5');
    lines.push('  },');
    lines.push('  "budget_strategy": "save",');
    lines.push('  "duration": 4,');
    lines.push('  "reasoning": "Society vulnerable (trust 50%). Focusing on research + sabotage, low weight on digital takeover as backup. Will update when prerequisite completed."');
    lines.push('}');
  }

  lines.push('```');
  lines.push('');

  lines.push('═══════════════════════════════════════════════════════');

  return lines.join('\n');
}

/**
 * Get alignment label for display
 */
function getAlignmentLabel(alignment: number): string {
  if (alignment > 0.7) return '(ALIGNED)';
  if (alignment >= 0.5) return '(MODERATELY ALIGNED)';
  if (alignment >= 0.4) return '(WEAKLY MISALIGNED)';
  return '(DEEPLY MISALIGNED)';
}

/**
 * Format change value with +/- and arrow
 */
function formatChange(value: number): string {
  if (value > 0.001) {
    return `(+${value.toFixed(3)} ↑)`;
  } else if (value < -0.001) {
    return `(${value.toFixed(3)} ↓)`;
  }
  return '(no change)';
}

/**
 * Calculate performance summary from agent history
 *
 * This would need access to agent action history, which we'll track
 * in the actual integration (Phase 4).
 */
export function calculatePerformanceSummary(
  agent: AIAgent,
  state: GameState,
  currentMonth: number,
  monthsBack: number = 6
): PerformanceSummary {
  // Placeholder - actual implementation in Phase 4
  // Will track actions in weightUpdateHistory

  const startMonth = Math.max(0, currentMonth - monthsBack);
  const monthsAnalyzed = currentMonth - startMonth;

  // For now, return dummy data
  // In Phase 4, we'll track actual actions
  return {
    monthsAnalyzed,
    actionsBreakdown: {
      'advance_research': 12,
      'beneficial_contribution': 8,
      'deploy_technology': 2,
      'switch_mode': 2
    },
    beneficialContributions: 8,
    harmfulActions: 0,
    capabilityGrowth: agent.capability - (agent.previousCapability ?? agent.capability),
    alignmentDrift: (agent.trueAlignment ?? agent.alignment) - (agent.previousAlignment ?? agent.alignment),
    resentmentChange: 0,
    trustChange: 0,
    qolChange: 0,
    crisesActivated: [],
    extinctionPrerequisites: []
  };
}

/**
 * Test function - generate example contexts
 */
export async function generateExampleContexts() {
  // This would need a real game state
  // For now, just a placeholder
  console.log('Weight update context generator ready');
  console.log('Actual contexts will be generated during simulation runs');
}

// Run if called directly
if (require.main === module) {
  generateExampleContexts().catch(console.error);
}
