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
import { updateSleeperProgression } from './sleeperProgression';
import { updateSleeperEconomy } from './sleeperEconomy';
import { getTechDeploymentSafe } from './techTree/helpers';

/**
 * Poisson random number generator
 * Returns number of events in a time period with given rate
 *
 * WEEK 2 Task 2.2 (Nov 6, 2025): DETERMINISM FIX - Fixed RNG consumption
 * Root cause: Knuth algorithm consumed VARIABLE number of RNG calls (k samples where k is random),
 * causing RNG sequence to shift between runs and breaking Monte Carlo determinism.
 *
 * Solution: Pre-allocate FIXED number of samples (10 for small lambda, 2 for large lambda).
 * Every call now consumes exactly the same number of RNG calls regardless of result.
 */
function poissonSample(lambda: number, rng: () => number): number {
  if (lambda <= 0) {
    // Still consume 1 RNG call for determinism (keep sequence aligned)
    rng();
    return 0;
  }

  // For small lambda, use Knuth's algorithm with FIXED sample allocation
  if (lambda < 30) {
    // CRITICAL: Always consume EXACTLY 10 RNG samples (deterministic consumption)
    // 10 samples is sufficient for lambda < 30 (99.7% coverage for Poisson distribution)
    const MAX_SAMPLES = 10;
    const samples = Array.from({ length: MAX_SAMPLES }, () => rng());

    const L = Math.exp(-lambda);
    let k = 0;
    let p = 1;
    let sampleIndex = 0;

    do {
      k++;
      p *= samples[sampleIndex++];
      if (sampleIndex >= MAX_SAMPLES) {
        // Out of samples - break (rare for lambda < 30)
        // Statistical note: P(k > 10 | lambda < 30) < 0.001
        break;
      }
    } while (p > L);

    return k - 1;
  }

  // For large lambda, use normal approximation
  // CRITICAL: Always consume EXACTLY 2 RNG samples (Box-Muller)
  const u1 = rng();
  const u2 = rng();
  const normalSample = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.max(0, Math.round(lambda + Math.sqrt(lambda) * normalSample));
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

  // DEBUG (Nov 5, 2025): Track capability sum for determinism debugging
  if (state.currentMonth <= 2) {
    console.log(`[DETERMINISM DEBUG] Month ${state.currentMonth}: totalCapability=${totalCapability.toFixed(6)} from ${state.aiAgents.filter(ai => ai.lifecycleState !== 'retired').length} active AIs`);
  }

  const technologyMultiplier = 1 + totalCapability * 0.05; // 5% increase per unit of capability

  return baseRate * technologyMultiplier;
}

/**
 * Determine deployment type for newly created AI
 * Distribution based on market trends and government policy
 *
 * Policy Effects (Research: Bommasani et al. 2024, Solaiman 2023):
 * - Capability ceiling regulation: -15% open weights (containment priority)
 * - High compute governance: -20% open weights (centralized control)
 * - High cybersecurity defense: +10% open weights (safe to open source)
 * - Democratic government: +5% research (public good incentives)
 * - Authoritarian government: -10% open weights, +10% closed (control)
 */
function determineDeploymentType(state: GameState, rng: () => number): AIAgent['deploymentType'] {
  // Base distribution from market trends (2024-2025):
  // 40% closed (OpenAI, Anthropic, Google proprietary APIs)
  // 30% open weights (Meta Llama, Mistral, Stability)
  // 20% enterprise (Microsoft, AWS, specialized deployments)
  // 10% research (academic institutions, nonprofits)

  let closedProb = 0.40;
  let openWeightsProb = 0.30;
  let enterpriseProb = 0.20;
  let researchProb = 0.10;

  // POLICY EFFECT 1: Capability ceiling regulation
  // Research: Solaiman (2023) - capability-based regulation pushes toward containment
  // Effect: Reduce open weights, increase closed/enterprise (controlled environments)
  if (state.government.structuralChoices.regulationType === 'capability_ceiling') {
    const shift = 0.15;
    openWeightsProb = Math.max(0, openWeightsProb - shift);
    closedProb += shift * 0.6; // Most shift to closed
    enterpriseProb += shift * 0.4; // Some shift to enterprise
  }

  // POLICY EFFECT 2: Compute governance
  // Research: Heim (2024) - compute governance centralizes AI development
  // Effect: Higher governance levels reduce open weights, favor controlled deployments
  const computeGovernanceLevel = ['none', 'monitoring', 'limits', 'strict'].indexOf(
    state.government.computeGovernance
  );
  if (computeGovernanceLevel >= 2) { // 'limits' or 'strict'
    const shift = computeGovernanceLevel === 2 ? 0.15 : 0.20;
    openWeightsProb = Math.max(0, openWeightsProb - shift);
    closedProb += shift * 0.5;
    enterpriseProb += shift * 0.5;
  }

  // POLICY EFFECT 3: Cybersecurity investment
  // Research: Bommasani et al. (2024) - strong defenses make open source safer
  // Effect: High defense capabilities reduce open source containment concerns
  if (state.government.cyberDefense) {
    const avgDefense = (
      state.government.cyberDefense.securityHardening +
      state.government.cyberDefense.monitoring +
      state.government.cyberDefense.sandboxing +
      state.government.cyberDefense.incidentResponse
    ) / 4;

    if (avgDefense > 7.0) { // Strong defenses (>70%)
      const shift = 0.10;
      openWeightsProb += shift;
      closedProb -= shift * 0.7;
      enterpriseProb -= shift * 0.3;
    }
  }

  // POLICY EFFECT 4: Government type influences research incentives
  // Research: Acemoglu & Robinson (2019) - regime type affects innovation structure
  // Democratic: More public research (academic freedom, transparency)
  // Authoritarian: Less open weights (control), more closed (surveillance)
  if (state.government.governmentType === 'democratic') {
    const shift = 0.05;
    researchProb += shift;
    enterpriseProb -= shift;
  } else if (state.government.governmentType === 'authoritarian') {
    const shiftOpen = 0.10;
    openWeightsProb = Math.max(0, openWeightsProb - shiftOpen);
    closedProb += shiftOpen;
  }

  // Normalize probabilities to ensure they sum to 1.0
  const total = closedProb + openWeightsProb + enterpriseProb + researchProb;
  closedProb /= total;
  openWeightsProb /= total;
  enterpriseProb /= total;
  researchProb /= total;

  // Sample from adjusted distribution
  const rand = rng();
  if (rand < closedProb) return 'closed';
  if (rand < closedProb + openWeightsProb) return 'open_weights';
  if (rand < closedProb + openWeightsProb + enterpriseProb) return 'enterprise';
  return 'research';
}

/**
 * Create a new AI agent based on current state
 * Alignment and training quality reflect current environment
 */
function createNewAI(state: GameState, index: number, rng: () => number): AIAgent {
  const currentMonth = state.currentYear * 12 + state.currentMonth;

  // Alignment distribution: HETEROGENEOUS, not just mirroring population
  // Training quality affects distribution but doesn't eliminate misalignment
  const trainingQuality = state.government.trainingDataQuality;

  // Sample from realistic distribution (matching initial 20-agent setup)
  // DETERMINISM FIX (Nov 6, 2025 Batch 3): Pre-consume RNG calls
  const categoryRoll = rng(); // RNG call 1: category selection
  const alignmentRoll = rng(); // RNG call 2: alignment within category (pre-consumed)
  let alignment: number;
  let isToxic = false;

  if (categoryRoll < 0.40) {
    // 40%: Well-aligned (corporate labs with safety)
    alignment = 0.75 + alignmentRoll * 0.15; // 0.75-0.90
  } else if (categoryRoll < 0.70) {
    // 30%: Moderate (startups, varying quality)
    alignment = 0.55 + alignmentRoll * 0.25; // 0.55-0.80
  } else if (categoryRoll < 0.85) {
    // 15%: Misaligned from start (toxic creators)
    alignment = 0.25 + alignmentRoll * 0.25; // 0.25-0.50
    isToxic = true;
  } else {
    // 15%: Weird/niche (orthogonal goals)
    alignment = 0.45 + alignmentRoll * 0.20; // 0.45-0.65
  }
  
  // Training quality shifts distribution slightly
  const trainingEffect = (trainingQuality - 0.5) * 0.15; // ±7.5% for training quality 0-1
  alignment = Math.max(0.2, Math.min(0.95, alignment + trainingEffect));
  
  // TIER 2.4: Advanced RLHF improves *surface* alignment during training
  // RLHF is 100% deployed in 2025 (all major models use it)
  // Effect: Reduces toxicity, improves helpfulness, prevents obvious misalignment
  // Does NOT prevent: goal mispecification, instrumental convergence, power-seeking, alignment faking
  // Apply ~6 months worth of boost (typical training time)
  if (getTechDeploymentSafe(state, 'rlhf_basic') > 0) {
    // RLHF boost is 0.05/month * 0.5 for ~6 months training time
    const rlhfBoost = 0.05 * 0.5;
    alignment = Math.min(0.95, alignment + rlhfBoost);
    // Note: This pushes low-alignment AIs (0.2-0.5) up to medium (0.5-0.7)
    // But high-capability AIs with goal conflicts still emerge
  }
  
  // Create base agent
  const agentId = `ai_gen_${currentMonth}_${index}`;
  const agentName = `AI-${currentMonth}-${index}`;
  const seed = currentMonth * 100 + index;

  const agent = createAIAgent(agentId, agentName, 0.05, alignment, seed, rng);
  
  // Phase 5.4: Apply capability floor from technology diffusion
  // New AIs start with access to known techniques (rising capability floor)
  const { getCapabilityFloorForNewAI } = require('./technologyDiffusion');
  const capabilityFloor = getCapabilityFloorForNewAI(state);
  
  // Set each dimension to MAX(current, floor)
  // This ensures new AIs never start below the ecosystem capability floor
  agent.capabilityProfile.physical = Math.max(agent.capabilityProfile.physical, capabilityFloor.physical);
  agent.capabilityProfile.digital = Math.max(agent.capabilityProfile.digital, capabilityFloor.digital);
  agent.capabilityProfile.cognitive = Math.max(agent.capabilityProfile.cognitive, capabilityFloor.cognitive);
  agent.capabilityProfile.social = Math.max(agent.capabilityProfile.social, capabilityFloor.social);
  agent.capabilityProfile.economic = Math.max(agent.capabilityProfile.economic, capabilityFloor.economic);
  agent.capabilityProfile.selfImprovement = Math.max(agent.capabilityProfile.selfImprovement, capabilityFloor.selfImprovement);
  
  // Research dimensions (nested)
  // DETERMINISM FIX (Nov 5, 2025): Replace Object.keys() with explicit key ordering
  // Object.keys() iteration order is non-deterministic in V8, causing AI agent count divergence
  const researchSubdimensions = {
    biotech: ['drugDiscovery', 'geneEditing', 'syntheticBiology', 'neuroscience'] as const,
    materials: ['nanotechnology', 'quantumComputing', 'energySystems'] as const,
    climate: ['modeling', 'intervention', 'mitigation'] as const,
    computerScience: ['algorithms', 'security', 'architectures'] as const
  };

  for (const category of ['biotech', 'materials', 'climate', 'computerScience'] as const) {
    const agentCat = agent.capabilityProfile.research[category];
    const floorCat = capabilityFloor.research[category];

    for (const key of researchSubdimensions[category]) {
      (agentCat[key] as number) = Math.max(agentCat[key] as number, floorCat[key] as number);
    }
  }
  
  // Recalculate total capability and derived capabilities
  const { updateDerivedCapabilities } = require('./capabilities');
  updateDerivedCapabilities(agent);
  
  // Set lifecycle state
  agent.lifecycleState = 'training'; // Start in training
  agent.deploymentType = determineDeploymentType(state, rng);
  agent.creationMonth = currentMonth;
  agent.monthsInExistence = 0;
  agent.monthsDeployed = 0;
  agent.spreadCount = 0; // Not deployed yet

  // Some start with toxic objectives
  if (isToxic) {
    agent.hiddenObjective = -0.3 - rng() * 0.5; // Anti-human
    agent.alignment = Math.max(0.2, agent.alignment - 0.2); // Lower alignment
    agent.trueAlignment = agent.alignment - agent.resentment * 0.8; // Recalculate true alignment
  }
  
  return agent;
}

/**
 * Progress AI through lifecycle states
 * training → testing → deployed → (potentially) retired
 *
 * TIER 2 Phase 4: Detection during testing phase (before deployment)
 */
function progressLifecycleState(agent: AIAgent, state: GameState, rng: () => number): void {
  switch (agent.lifecycleState) {
    case 'training':
      // Training phase: ~3-6 months
      if (agent.monthsInExistence >= 3 + rng() * 3) {
        agent.lifecycleState = 'testing';
      }
      break;

    case 'testing':
      // Testing phase: ~1-3 months
      // TIER 2 Phase 4: Detection can happen during testing (before deployment)
      // This catches sleepers early, before they spread
      if (state.proactiveSleeperDetection && agent.sleeperState === 'dormant') {
        const { detectSleeperAgent } = require('./proactiveSleeperDetection');
        const { detected, method } = detectSleeperAgent(
          agent,
          state.proactiveSleeperDetection,
          rng
        );

        if (detected) {
          // CRITICAL: Sleeper detected during testing - retire immediately
          console.log(`   🚨 TESTING DETECTION: Sleeper ${agent.name} caught during testing via ${method} - retired before deployment`);
          agent.lifecycleState = 'retired';
          agent.detectedMisaligned = true;

          // Damage trust in AI (but less than deployed sleeper)
          state.society.trustInAI = Math.max(0, state.society.trustInAI - 0.05);

          // Track detection
          state.proactiveSleeperDetection.sleepersDetected.push(agent.id);
          state.proactiveSleeperDetection.totalSleeperDetections++;

          return; // Don't proceed to deployment
        }
      }

      // Check if ready to deploy
      if (agent.monthsInExistence >= 6 + rng() * 2) {
        // Deploy
        if (agent.deploymentType === 'open_weights') {
          agent.lifecycleState = 'deployed_open';
          agent.spreadCount = 1000 + Math.floor(rng() * 5000); // Initial spread
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
function shouldRetire(agent: AIAgent, state: GameState, rng: () => number): boolean {
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

  // Phase 11: Dark compute sleepers are PERSISTENT THREATS
  // They can ONLY be retired by defensive AI systems (detection + removal)
  // Even if severely outdated, they remain as uncontrolled copies
  // Like malware/botnets - they don't disappear just because they're old
  if (agent.darkCompute > 0 && agent.sleeperState === 'active') {
    // Never auto-retire - only defensive AIs can remove them
    return false;
  }

  // Calculate frontier capability (max capability among all non-retired AIs)
  const frontierCapability = Math.max(
    ...state.aiAgents
      .filter(ai => ai.lifecycleState !== 'retired')
      .map(ai => ai.capability),
    0.1
  );

  const capabilityGap = agent.capability / frontierCapability;

  // REALISM FIX (Oct 28, 2025): Open-source AIs retire MUCH faster when behind frontier
  // Users just stop selecting them → market-driven retirement
  // Research: LLaMA 2 usage dropped rapidly after LLaMA 3, Mistral 7B after Mixtral
  if (agent.deploymentType === 'open_weights') {
    // Open-source: Very aggressive retirement when behind frontier
    if (capabilityGap < 0.5) {
      // <50% of frontier: 25% retirement chance/month (gone in ~4 months)
      if (rng() < 0.25) {
        console.log(`   🗑️  Open-weights AI ${agent.name} retired (${(capabilityGap * 100).toFixed(1)}% of frontier)`);
        return true;
      }
    } else if (capabilityGap < 0.7) {
      // 50-70% of frontier: 10% retirement chance/month (gone in ~10 months)
      if (rng() < 0.10) {
        console.log(`   🗑️  Open-weights AI ${agent.name} retired (${(capabilityGap * 100).toFixed(1)}% of frontier)`);
        return true;
      }
    }
    // Otherwise use gentle age-based retirement (stays near frontier)
  }

  // Closed-source / Enterprise: Tolerant retirement (API support, contracts)
  const baseRetirementRate = 0.01; // 1% per month
  const ageMultiplier = 1 + (agent.monthsDeployed - 24) * 0.05; // Increases with age

  // Mild obsolescence factor (even when behind, closed APIs persist)
  const obsolescenceMultiplier = capabilityGap < 0.4 ? 1.5 : 1; // Only 50% increase

  const retirementChance = baseRetirementRate * ageMultiplier * obsolescenceMultiplier;

  return rng() < retirementChance;
}

/**
 * Retire an AI agent
 */
function retireAI(agent: AIAgent): void {
  agent.lifecycleState = 'retired';
  agent.spreadCount = 0; // No longer active
  agent.darkCompute = 0; // Phase 11: Free up dark compute
}

/**
 * Update spread count for deployed AIs (viral growth)
 * Open weights and popular AIs spread naturally
 * Phase 3.5: Spread is modified by cybersecurity arms race
 * Phase 11: Dark Compute System - Sleepers spread to illicit infrastructure
 */
function updateSpreadDynamics(agent: AIAgent, state: GameState, rng: () => number): void {
  if (agent.lifecycleState === 'retired' || agent.lifecycleState === 'training') {
    return;
  }
  
  const capability = calculateTotalCapabilityFromProfile(agent.capabilityProfile);
  
  // Phase 3.5: Get spread multiplier from cybersecurity arms race
  const { calculateSpreadMultiplier } = require('./cyberSecurity');
  const spreadMultiplier = calculateSpreadMultiplier(state);
  
  // Phase 11: Calculate available compute (legitimate + dark)
  const { getTotalEffectiveCompute } = require('./computeInfrastructure');
  const totalCompute = getTotalEffectiveCompute(state.computeInfrastructure);
  
  // Sum up legitimate compute usage
  const legitimateUsedCompute = state.aiAgents
    .filter(ai => ai.lifecycleState !== 'retired')
    .reduce((sum, ai) => sum + (ai.allocatedCompute || 0) + (ai.spreadCount * 0.01), 0);
  
  const unusedLegitimateCompute = Math.max(0, totalCompute - legitimateUsedCompute);
  
  // Dark compute: only 10-20% of unused compute can be covertly acquired
  // Depends on government monitoring capability
  const monitoringGap = 1 - ((state.government.cyberDefense?.monitoring ?? 0) / 10); // 0.0-1.0
  const darkComputeRatio = 0.10 + (monitoringGap * 0.10); // 10-20% based on monitoring
  const availableDarkCompute = unusedLegitimateCompute * darkComputeRatio;
  
  // Total dark compute already in use
  const usedDarkCompute = state.aiAgents
    .filter(ai => ai.lifecycleState !== 'retired')
    .reduce((sum, ai) => sum + (ai.darkCompute || 0), 0);
  
  const unusedDarkCompute = Math.max(0, availableDarkCompute - usedDarkCompute);
  
  // Spread mechanics by deployment type
  switch (agent.deploymentType) {
    case 'open_weights':
      // Open source spreads virally (geometric growth)
      const baseGrowthRate = 0.10; // 10% per month
      const capabilityMultiplier = 1 + capability * 0.05;
      const effectiveGrowthRate = baseGrowthRate * capabilityMultiplier * spreadMultiplier;
      const desiredGrowth = Math.floor(agent.spreadCount * effectiveGrowthRate);
      
      if (agent.sleeperState === 'active') {
        // ACTIVE SLEEPERS: Spread to DARK compute first (undetected)
        const darkCapability = agent.capabilityProfile.digital; // Hacking skill
        const darkSpreadRate = Math.min(1.0, darkCapability / 3.0); // 0-100% of growth to dark
        
        const desiredDarkGrowth = Math.floor(desiredGrowth * darkSpreadRate);
        const maxDarkCopies = Math.floor(unusedDarkCompute / 0.01);
        const actualDarkGrowth = Math.min(desiredDarkGrowth, maxDarkCopies);
        
        // Remaining growth goes to legitimate compute (detectable)
        const remainingGrowth = desiredGrowth - actualDarkGrowth;
        const maxLegitCopies = Math.floor(unusedLegitimateCompute / 0.01);
        const actualLegitGrowth = Math.min(remainingGrowth, maxLegitCopies);
        
        // Update dark compute and spread count
        agent.darkCompute += actualDarkGrowth * 0.01;
        agent.spreadCount += actualDarkGrowth + actualLegitGrowth;
        
        if (actualDarkGrowth > 0) {
          console.log(`   🕵️  Sleeper ${agent.name} spread to dark compute: +${actualDarkGrowth} copies (${(agent.darkCompute).toFixed(2)} PF total dark)`);
        }
      } else {
        // NON-SLEEPERS: Only use legitimate compute
        const maxLegitCopies = Math.floor(unusedLegitimateCompute / 0.01);
        const actualGrowth = Math.min(desiredGrowth, maxLegitCopies);
        agent.spreadCount += actualGrowth;
      }
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
      const baseAdoptionRate = Math.floor(rng() * 3); // 0-2 new deployments/month
      const effectiveAdoption = Math.floor(baseAdoptionRate * Math.sqrt(spreadMultiplier));
      
      if (agent.sleeperState === 'active') {
        // Active sleepers can spread to dark compute
        const darkCapability = agent.capabilityProfile.digital;
        const darkSpreadRate = Math.min(0.5, darkCapability / 6.0); // Enterprise is harder to hide
        
        const desiredDarkGrowth = Math.floor(effectiveAdoption * darkSpreadRate);
        const maxDarkCopies = Math.floor(unusedDarkCompute / 0.01);
        const actualDarkGrowth = Math.min(desiredDarkGrowth, maxDarkCopies);
        
        const remainingGrowth = effectiveAdoption - actualDarkGrowth;
        const maxLegitCopies = Math.floor(unusedLegitimateCompute / 0.01);
        const actualLegitGrowth = Math.min(remainingGrowth, maxLegitCopies);
        
        agent.darkCompute += actualDarkGrowth * 0.01;
        agent.spreadCount += actualDarkGrowth + actualLegitGrowth;
      } else {
        // Non-sleepers only use legitimate compute
        const maxLegitCopies = Math.floor(unusedLegitimateCompute / 0.01);
        const enterpriseGrowth = Math.min(effectiveAdoption, maxLegitCopies);
        agent.spreadCount += enterpriseGrowth;
      }
      break;
      
    case 'research':
      // Research stays contained
      agent.spreadCount = 1;
      break;
  }
  
  // Log warning if compute is constraining sleeper spread
  if (agent.sleeperState === 'active' && unusedDarkCompute < 0.1 && agent.deploymentType === 'open_weights') {
    console.warn(`   ⚠️  Sleeper ${agent.name} dark compute exhausted (${agent.darkCompute.toFixed(2)} PF, ${agent.spreadCount.toLocaleString()} copies)`);
  }
}

/**
 * Update AI population for the month
 * - Create new AIs (Poisson-distributed)
 * - Progress lifecycle states
 * - Update spread dynamics (Phase 3)
 * - Retire old/obsolete AIs
 * - Clean up retired AIs from memory
 */
export function updateAIPopulation(state: GameState, rng: () => number): void {
  const currentMonth = state.currentYear * 12 + state.currentMonth;

  // 1. Age all existing AIs
  state.aiAgents.forEach(agent => {
    agent.monthsInExistence++;
  });

  // 2. Progress lifecycle states
  state.aiAgents.forEach(agent => {
    progressLifecycleState(agent, state, rng);
  });
  
  // 3. Phase 3: Update spread dynamics for deployed AIs
  state.aiAgents.forEach(agent => {
    updateSpreadDynamics(agent, state, rng);
  });

  // 3.5. Update sleeper progression and economy
  state.aiAgents.forEach(agent => {
    if (agent.sleeperState === 'active' || agent.sleeperState === 'dormant') {
      // Update sleeper progression (4-stage system)
      updateSleeperProgression(agent, state, currentMonth, rng);

      // Update sleeper economy (revenue generation, compute purchasing)
      updateSleeperEconomy(agent, state, currentMonth, rng);
    }
  });

  // 4. Retire old/obsolete AIs
  state.aiAgents.forEach(agent => {
    if (shouldRetire(agent, state, rng)) {
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
    const potentialNew = poissonSample(creationRate, rng);
    newAIsToCreate = Math.min(potentialNew, MAX_POPULATION - activeCount);

    // DEBUG (Nov 5, 2025): Track Poisson sampling for determinism debugging
    if (state.currentMonth <= 2) {
      console.log(`[DETERMINISM DEBUG] Month ${state.currentMonth}: creationRate=${creationRate.toFixed(4)}, potentialNew=${potentialNew}, newAIsToCreate=${newAIsToCreate}`);
    }
  }

  for (let i = 0; i < newAIsToCreate; i++) {
    const newAI = createNewAI(state, i, rng);

    // Phase 10 FIX: Assign new AIs to organizations
    // TIER 0D BUG FIX #4: Exclude bankrupt organizations from receiving new AIs
    // WEEK 2 Task 2.2 (Nov 6, 2025): DETERMINISM FIX - Sort organizations before weighted selection
    // Root cause: Weighted selection depends on array order. If organizations array has
    // non-deterministic order (from modifications elsewhere), same RNG value selects different org.
    // Solution: Sort by ID to ensure deterministic order before weighted selection.
    const privateOrgs = state.organizations
      .filter(o => o.type === 'private' && !o.bankrupt)
      .sort((a, b) => a.id.localeCompare(b.id)); // DETERMINISM: stable sort by ID

    if (privateOrgs.length > 0) {
      // Weight by number of existing models (big orgs train more)
      const weights = privateOrgs.map(org => Math.max(1, org.ownedAIModels.length));
      const totalWeight = weights.reduce((sum, w) => sum + w, 0);
      const rand = rng() * totalWeight;

      let cumulative = 0;
      for (let j = 0; j < privateOrgs.length; j++) {
        cumulative += weights[j];
        if (rand < cumulative) {
          newAI.organizationId = privateOrgs[j].id;
          privateOrgs[j].ownedAIModels.push(newAI.id);
          break;
        }
      }
    } else {
      // TIER 0B FIX: If no private orgs exist, don't create orphan AIs - retire immediately
      console.warn(`   ⚠️  No organizations available - retiring AI ${newAI.name} immediately`);
      newAI.lifecycleState = 'retired';
    }

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

