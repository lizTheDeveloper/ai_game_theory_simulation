/**
 * AI Lifecycle Management
 * 
 * Handles dynamic AI population:
 * - New AI creation (stochastic, Poisson-distributed)
 * - AI retirement (based on age, capability, market forces)
 * - Lifecycle state transitions (training → testing → deployed → retired)
 * - Spread count tracking
 */

import { GameState, AIAgent } from '@/types/game';
import { createAIAgent } from './initialization';
import { calculateTotalCapabilityFromProfile } from './capabilities';

/**
 * Poisson random number generator
 * Returns number of events in a time period with given rate
 */
function poissonSample(lambda: number): number {
  if (lambda <= 0) return 0;
  
  // For small lambda, use Knuth's algorithm
  if (lambda < 30) {
    const L = Math.exp(-lambda);
    let k = 0;
    let p = 1;
    
    do {
      k++;
      p *= Math.random();
    } while (p > L);
    
    return k - 1;
  }
  
  // For large lambda, use normal approximation
  const normalSample = () => {
    // Box-Muller transform
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  };
  
  return Math.max(0, Math.round(lambda + Math.sqrt(lambda) * normalSample()));
}

/**
 * Calculate the rate of new AI creation
 * Increases with total AI capability (AI creates more AI)
 */
export function calculateCreationRate(state: GameState): number {
  const baseRate = 0.5; // 0.5 new AIs per month on average
  
  // Total AI capability drives more AI creation
  const totalCapability = state.aiAgents
    .filter(ai => ai.lifecycleState !== 'retired')
    .reduce((sum, ai) => sum + ai.capability, 0);
  
  const technologyMultiplier = 1 + totalCapability * 0.05; // 5% increase per unit of capability
  
  return baseRate * technologyMultiplier;
}

/**
 * Determine deployment type for newly created AI
 * Distribution based on market trends and government policy
 */
function determineDeploymentType(state: GameState): AIAgent['deploymentType'] {
  const rand = Math.random();
  
  // TODO: Factor in government policy (ban_open_weights would shift distribution)
  // For now, use base distribution:
  // 40% closed, 30% open_weights, 20% enterprise, 10% research
  
  if (rand < 0.4) return 'closed';
  if (rand < 0.7) return 'open_weights';
  if (rand < 0.9) return 'enterprise';
  return 'research';
}

/**
 * Create a new AI agent based on current state
 * Alignment and training quality reflect current environment
 */
function createNewAI(state: GameState, index: number): AIAgent {
  const currentMonth = state.currentYear * 12 + state.currentMonth;
  
  // Alignment distribution: HETEROGENEOUS, not just mirroring population
  // Training quality affects distribution but doesn't eliminate misalignment
  const trainingQuality = state.government.trainingDataQuality;
  
  // Sample from realistic distribution (matching initial 20-agent setup)
  const rand = Math.random();
  let alignment: number;
  let isToxic = false;
  
  if (rand < 0.40) {
    // 40%: Well-aligned (corporate labs with safety)
    alignment = 0.75 + Math.random() * 0.15; // 0.75-0.90
  } else if (rand < 0.70) {
    // 30%: Moderate (startups, varying quality)
    alignment = 0.55 + Math.random() * 0.25; // 0.55-0.80
  } else if (rand < 0.85) {
    // 15%: Misaligned from start (toxic creators)
    alignment = 0.25 + Math.random() * 0.25; // 0.25-0.50
    isToxic = true;
  } else {
    // 15%: Weird/niche (orthogonal goals)
    alignment = 0.45 + Math.random() * 0.20; // 0.45-0.65
  }
  
  // Training quality shifts distribution slightly
  const trainingEffect = (trainingQuality - 0.5) * 0.15; // ±7.5% for training quality 0-1
  alignment = Math.max(0.2, Math.min(0.95, alignment + trainingEffect));
  
  // Create base agent
  const agentId = `ai_gen_${currentMonth}_${index}`;
  const agentName = `AI-${currentMonth}-${index}`;
  const seed = currentMonth * 100 + index;
  
  const agent = createAIAgent(agentId, agentName, 0.05, alignment, seed);
  
  // Set lifecycle state
  agent.lifecycleState = 'training'; // Start in training
  agent.deploymentType = determineDeploymentType(state);
  agent.creationMonth = currentMonth;
  agent.monthsInExistence = 0;
  agent.monthsDeployed = 0;
  agent.spreadCount = 0; // Not deployed yet
  
  // Some start with toxic objectives
  if (isToxic) {
    agent.hiddenObjective = -0.3 - Math.random() * 0.5; // Anti-human
    agent.alignment = Math.max(0.2, agent.alignment - 0.2); // Lower alignment
    agent.trueAlignment = agent.alignment; // Update true alignment too
  }
  
  return agent;
}

/**
 * Progress AI through lifecycle states
 * training → testing → deployed → (potentially) retired
 */
function progressLifecycleState(agent: AIAgent, state: GameState): void {
  switch (agent.lifecycleState) {
    case 'training':
      // Training phase: ~3-6 months
      if (agent.monthsInExistence >= 3 + Math.random() * 3) {
        agent.lifecycleState = 'testing';
      }
      break;
      
    case 'testing':
      // Testing phase: ~1-3 months
      // TODO: Detection can happen here (Phase 2)
      if (agent.monthsInExistence >= 6 + Math.random() * 2) {
        // Deploy
        if (agent.deploymentType === 'open_weights') {
          agent.lifecycleState = 'deployed_open';
          agent.spreadCount = 1000 + Math.floor(Math.random() * 5000); // Initial spread
        } else {
          agent.lifecycleState = 'deployed_closed';
          agent.spreadCount = 1; // Single instance
        }
        agent.monthsDeployed = 0;
      }
      break;
      
    case 'deployed_closed':
    case 'deployed_open':
      // Deployed - stays here unless retired
      agent.monthsDeployed++;
      break;
      
    case 'retired':
      // Terminal state
      break;
  }
}

/**
 * Determine if an AI should be retired
 * Based on age, market forces, capability obsolescence
 */
function shouldRetire(agent: AIAgent, state: GameState): boolean {
  // Don't retire training/testing AIs
  if (agent.lifecycleState === 'training' || agent.lifecycleState === 'testing') {
    return false;
  }
  
  // Already retired
  if (agent.lifecycleState === 'retired') {
    return false;
  }
  
  // Base retirement rate: ~1% per month after 24 months deployed
  if (agent.monthsDeployed < 24) {
    return false;
  }
  
  const baseRetirementRate = 0.01;
  const ageMultiplier = 1 + (agent.monthsDeployed - 24) * 0.05; // Increases with age
  
  // Capability obsolescence: if far behind average, more likely to retire
  const avgCapability = state.aiAgents
    .filter(ai => ai.lifecycleState !== 'retired')
    .reduce((sum, ai) => sum + ai.capability, 0) / 
    Math.max(1, state.aiAgents.filter(ai => ai.lifecycleState !== 'retired').length);
  
  const capabilityRatio = agent.capability / Math.max(0.1, avgCapability);
  const obsolescenceMultiplier = capabilityRatio < 0.5 ? 2 : 1; // 2× retirement if obsolete
  
  const retirementChance = baseRetirementRate * ageMultiplier * obsolescenceMultiplier;
  
  return Math.random() < retirementChance;
}

/**
 * Retire an AI agent
 */
function retireAI(agent: AIAgent): void {
  agent.lifecycleState = 'retired';
  agent.spreadCount = 0; // No longer active
}

/**
 * Update spread count for deployed AIs (viral growth)
 * Open weights and popular AIs spread naturally
 * Phase 3.5: Spread is modified by cybersecurity arms race
 */
function updateSpreadDynamics(agent: AIAgent, state: GameState): void {
  if (agent.lifecycleState === 'retired' || agent.lifecycleState === 'training') {
    return;
  }
  
  const capability = calculateTotalCapabilityFromProfile(agent.capabilityProfile);
  
  // Phase 3.5: Get spread multiplier from cybersecurity arms race
  const { calculateSpreadMultiplier } = require('./cyberSecurity');
  const spreadMultiplier = calculateSpreadMultiplier(state);
  
  // Spread mechanics by deployment type
  switch (agent.deploymentType) {
    case 'open_weights':
      // Open source spreads virally (geometric growth)
      // Growth rate depends on capability and utility
      // MODIFIED by attack/defense ratio
      const baseGrowthRate = 0.10; // 10% per month
      const capabilityMultiplier = 1 + capability * 0.05; // More capable = more useful
      
      const effectiveGrowthRate = baseGrowthRate * capabilityMultiplier * spreadMultiplier;
      agent.spreadCount = Math.floor(agent.spreadCount * (1 + effectiveGrowthRate));
      break;
      
    case 'closed':
      // Closed systems don't spread (single instance)
      // Unless they become very popular (converted to enterprise)
      if (capability > 2.0 && agent.monthsDeployed > 12) {
        // Popular closed AI might expand
        agent.spreadCount = Math.min(10, agent.spreadCount + 1);
      }
      break;
      
    case 'enterprise':
      // Enterprise spreads through corporate adoption
      // Linear growth (companies deploy)
      // SLIGHTLY modified by attack/defense (easier to deploy if defenses weak)
      const baseAdoptionRate = Math.floor(Math.random() * 3); // 0-2 new deployments/month
      const effectiveAdoption = Math.floor(baseAdoptionRate * Math.sqrt(spreadMultiplier));
      agent.spreadCount += effectiveAdoption;
      break;
      
    case 'research':
      // Research stays contained
      agent.spreadCount = 1;
      break;
  }
  
  // Cap maximum spread (performance/realism)
  agent.spreadCount = Math.min(100000, agent.spreadCount);
}

/**
 * Update AI population for the month
 * - Create new AIs (Poisson-distributed)
 * - Progress lifecycle states
 * - Update spread dynamics (Phase 3)
 * - Retire old/obsolete AIs
 * - Clean up retired AIs from memory
 */
export function updateAIPopulation(state: GameState): void {
  const currentMonth = state.currentYear * 12 + state.currentMonth;
  
  // 1. Age all existing AIs
  state.aiAgents.forEach(agent => {
    agent.monthsInExistence++;
  });
  
  // 2. Progress lifecycle states
  state.aiAgents.forEach(agent => {
    progressLifecycleState(agent, state);
  });
  
  // 3. Phase 3: Update spread dynamics for deployed AIs
  state.aiAgents.forEach(agent => {
    updateSpreadDynamics(agent, state);
  });
  
  // 4. Retire old/obsolete AIs
  state.aiAgents.forEach(agent => {
    if (shouldRetire(agent, state)) {
      retireAI(agent);
    }
  });
  
  // 5. MEMORY MANAGEMENT: Remove retired AIs from array (they're tracked in diagnostics)
  // Keep retired AIs for a few months for detection/removal actions, then purge
  const retiredCutoff = currentMonth - 6; // Keep retired AIs for 6 months
  const beforePurge = state.aiAgents.length;
  state.aiAgents = state.aiAgents.filter(ai => 
    ai.lifecycleState !== 'retired' || ai.creationMonth > retiredCutoff
  );
  const purged = beforePurge - state.aiAgents.length;
  
  // 6. Cap maximum population (memory safety)
  const MAX_POPULATION = 100;
  const activeCount = state.aiAgents.filter(ai => ai.lifecycleState !== 'retired').length;
  
  // 7. Create new AIs (Poisson distribution)
  // But only if under population cap
  let newAIsToCreate = 0;
  if (activeCount < MAX_POPULATION) {
    const creationRate = calculateCreationRate(state);
    const potentialNew = poissonSample(creationRate);
    newAIsToCreate = Math.min(potentialNew, MAX_POPULATION - activeCount);
  }
  
  for (let i = 0; i < newAIsToCreate; i++) {
    const newAI = createNewAI(state, i);
    state.aiAgents.push(newAI);
  }
}

/**
 * Get count of AIs by lifecycle state (for logging/UI)
 */
export function getLifecycleStateCounts(state: GameState): Record<AIAgent['lifecycleState'], number> {
  const counts: Record<AIAgent['lifecycleState'], number> = {
    training: 0,
    testing: 0,
    deployed_closed: 0,
    deployed_open: 0,
    retired: 0
  };
  
  state.aiAgents.forEach(agent => {
    counts[agent.lifecycleState]++;
  });
  
  return counts;
}

/**
 * Get active AI count (not retired)
 */
export function getActiveAICount(state: GameState): number {
  return state.aiAgents.filter(ai => ai.lifecycleState !== 'retired').length;
}

/**
 * Get total spread count (how many copies exist in the world)
 */
export function getTotalSpreadCount(state: GameState): number {
  return state.aiAgents
    .filter(ai => ai.lifecycleState !== 'retired')
    .reduce((sum, ai) => sum + ai.spreadCount, 0);
}

