/**
 * Technology Tree Engine
 * 
 * Manages tech unlocking, deployment, and effects.
 * Replaces scattered tech unlock logic across multiple files.
 */

import { GameState } from '@/types/game';
import { TechDefinition } from './comprehensiveTechTree';
import { getAllTech, getTechById } from './comprehensiveTechTree';
import { calculateTotalCapabilityFromProfile } from '../capabilities';
import { assertEconomicStage } from '../utils/assertions';
import { addSimulationEvent } from '../utils/eventLogger';
import { deterministicRandom } from '../utils/deterministicRng';

export interface TechUnlockEvent {
  techId: string;
  techName: string;
  month: number;
  reason: string;
  unlockedBy: 'capability' | 'crisis' | 'time' | 'research' | 'combination';
}

export interface TechDeploymentAction {
  techId: string;
  deployedBy: string;  // AI ID or nation name
  investment: number;  // $M invested
  targetRegion: string;
  month: number;
}

export interface RegionalTechDeployment {
  techId: string;
  region: string;
  deploymentLevel: number;  // 0-1
  monthlyInvestment: number;
  totalInvested: number;
  deployedBy: string[];
  effects: Record<string, number>;
}

/**
 * Tech Tree State
 * Tracks which tech is unlocked and deployed where
 * 
 * Uses plain objects instead of Maps/Sets for reliable JSON serialization
 */
export interface TechTreeState {
  // Global tech status
  unlockedTech: string[];  // Array of unlocked tech IDs
  researchProgress: Record<string, number>;  // techId -> progress (0-1)

  // Regional deployment
  regionalDeployment: Record<string, RegionalTechDeployment[]>;  // region -> deployments

  // HIGH #2 FIX (Oct 29, 2025): Emergency tech deployment acceleration
  // Maps tech ID to acceleration multiplier (e.g., 10x faster deployment during crisis)
  // EmergencyResponsePhase sets this during crisis response
  deploymentAcceleration: Record<string, number>;  // techId -> multiplier

  // HIGH PERFORMANCE FIX (Nov 20, 2025): O(1) lookup indexes
  // Maintained by tech tree update phase to avoid O(n) searches (284+ comparisons/month)
  // Maps tech ID -> max deployment level across all regions
  deployedTechMap: Record<string, number>;  // techId -> max deployment level [0-1]
  // Set of unlocked tech IDs for fast membership checks
  unlockedTechSet: Record<string, boolean>;  // techId -> true (if unlocked)

  // Deployment actions queue
  pendingActions: TechDeploymentAction[];

  // Unlock history
  unlockHistory: TechUnlockEvent[];

  // Statistics
  totalInvestment: number;
  techUnlockedCount: number;
  techDeployedCount: number;
}

/**
 * Initialize tech tree state
 *
 * @param startYear - Optional year for historical scenarios. If < 2025, deployed_2025 tech
 *                    will NOT be unlocked (prevents anachronistic deployment in hindcast mode).
 *                    FIX (Nov 26, 2025): CRIT-1 - mRNA vaccines, 4th gen solar were appearing in 1990.
 */
export function initializeTechTreeState(startYear?: number): TechTreeState {
  const state: TechTreeState = {
    unlockedTech: [],
    researchProgress: {},
    regionalDeployment: {},
    deploymentAcceleration: {},  // HIGH #2 FIX: Initialize empty acceleration map
    deployedTechMap: {},  // HIGH PERFORMANCE FIX (Nov 20): O(1) deployment lookups
    unlockedTechSet: {},  // HIGH PERFORMANCE FIX (Nov 20): O(1) unlocked checks
    pendingActions: [],
    unlockHistory: [],
    totalInvestment: 0,
    techUnlockedCount: 0,
    techDeployedCount: 0,
  };

  // CRIT-1 FIX (Nov 26, 2025): Skip 2025 tech deployment for historical scenarios
  // This prevents mRNA vaccines, 4th gen solar, etc. from appearing in 1990
  const isHistoricalMode = startYear !== undefined && startYear < 2025;
  if (isHistoricalMode) {
    console.log(`[TechTree] Historical mode (${startYear}): Skipping deployed_2025 tech`);
    return state;  // Return empty tech tree for historical scenarios
  }

  // Unlock all DEPLOYED_2025 tech (only for 2025+ scenarios)
  const deployedTech = getAllTech().filter(t => t.status === 'deployed_2025');
  for (const tech of deployedTech) {
    state.unlockedTech.push(tech.id);
    state.techUnlockedCount++;

    // HIGH PERFORMANCE FIX (Nov 20): Update O(1) lookup indexes
    state.unlockedTechSet[tech.id] = true;
    state.deployedTechMap[tech.id] = tech.deploymentLevel;

    // Initialize global deployment
    if (!state.regionalDeployment['global']) {
      state.regionalDeployment['global'] = [];
    }

    state.regionalDeployment['global'].push({
      techId: tech.id,
      region: 'global',
      deploymentLevel: tech.deploymentLevel,
      monthlyInvestment: 0,
      totalInvested: tech.deploymentCost * tech.deploymentLevel,
      deployedBy: ['baseline_2025'],
      effects: tech.effects,
      deploymentStartMonth: 0, // Already deployed at start (month 0)
    });
  }

  return state;
}

// No longer needed - using plain objects instead of Maps/Sets for serialization

/**
 * Update tech tree each month
 * 
 * 1. Check for new tech unlocks
 * 2. Apply deployment actions
 * 3. Update research progress
 * 4. Calculate tech effects
 */
export function updateTechTree(
  gameState: GameState,
  techTreeState: TechTreeState,
  rng: () => number
): TechUnlockEvent[] {
  const unlockEvents: TechUnlockEvent[] = [];

  // PERFORMANCE FIX (Nov 20, 2025 - HIGH-1): O(n) → O(1)
  // Build Set for O(1) membership test (array.includes is O(n))
  // Impact: 710 operations → 71 operations per step
  const unlockedTechSet = new Set(techTreeState.unlockedTech);

  // 1. Check for tech unlocks
  const lockedTech = getAllTech().filter(t =>
    !unlockedTechSet.has(t.id) &&
    (t.status === 'unlockable' || t.status === 'future')
  );
  
  // Debug logging (probabilistic to avoid spam)
  if (deterministicRandom() < 0.01 && lockedTech.length > 0) {
    const avgCapability = getAverageAICapability(gameState);
    // FIX (Oct 25, 2025): Replaced defensive fallback with assertion
    const economicStage = assertEconomicStage(gameState, 'techTree.unlock (debug)');
    
    console.log(`\n🔍 TECH TREE DEBUG (Month ${gameState.currentMonth}):`);
    console.log(`   Checking ${lockedTech.length} locked technologies`);
    console.log(`   Unlocked: ${techTreeState.unlockedTech.length} technologies`);
    console.log(`   AI Capability: ${avgCapability.toFixed(2)} (need 1.5+ for most techs)`);
    console.log(`   Economic Stage: ${economicStage.toFixed(1)} (need 2.5+ for most techs)`);
    console.log(`   First 3 unlocked: ${techTreeState.unlockedTech.slice(0, 3).join(', ')}`);
    
    // Show research progress for first few technologies
    const firstTech = lockedTech[0];
    if (firstTech) {
      const progress = techTreeState.researchProgress[firstTech.id] || 0;
      console.log(`   Sample tech "${firstTech.name}": ${(progress * 100).toFixed(1)}% research complete`);
      console.log(`   Requirements: AI ${firstTech.minAICapability || 'none'}, Econ ${firstTech.minEconomicStage || 'none'}, Month ${firstTech.minMonth || 'none'}`);
    }
  }
  
  for (const tech of lockedTech) {
    const unlockCheck = checkUnlockConditions(tech, gameState, techTreeState);
    
    if (unlockCheck.canUnlock) {
      unlockTech(tech, gameState, techTreeState, unlockCheck.reason);
      
      const event: TechUnlockEvent = {
        techId: tech.id,
        techName: tech.name,
        month: gameState.currentMonth,
        reason: unlockCheck.reason,
        unlockedBy: unlockCheck.unlockedBy,
      };
      
      unlockEvents.push(event);
      techTreeState.unlockHistory.push(event);
      
      console.log(`\n🚀 TECH UNLOCKED: ${tech.name} (Month ${gameState.currentMonth})`);
      console.log(`   Category: ${tech.category}`);
      console.log(`   Reason: ${unlockCheck.reason}`);
    }
  }
  
  // 2. Apply deployment actions
  applyDeploymentActions(gameState, techTreeState);

  // 2.5. Update deployment progress (FIX #14 Phase 1: Multi-timescale deployment)
  // Technologies deploy gradually over 10-30 years, not instantly
  const { updateDeploymentProgress } = require('./deploymentTimescales');
  updateDeploymentProgress(gameState, techTreeState);

  // 3. Update research progress for locked tech
  updateResearchProgress(gameState, techTreeState);
  
  // 4. Calculate and apply tech effects
  const { applyAllTechEffects, logTechEffects } = require('./effectsEngine');
  applyAllTechEffects(gameState, techTreeState, rng);
  logTechEffects(gameState, techTreeState);

  return unlockEvents;
}

/**
 * Check if a technology meets unlock conditions
 */
export function checkUnlockConditions(
  tech: TechDefinition,
  gameState: GameState,
  techTreeState: TechTreeState
): {
  canUnlock: boolean;
  reason: string;
  unlockedBy: 'capability' | 'crisis' | 'time' | 'research' | 'combination';
  blockers: string[];
} {
  const blockers: string[] = [];

  // PERFORMANCE FIX (Nov 20, 2025 - HIGH-1): O(n) → O(1)
  // Build Set for O(1) membership test
  const unlockedTechSet = new Set(techTreeState.unlockedTech);

  // Already unlocked?
  if (unlockedTechSet.has(tech.id)) {
    return { canUnlock: false, reason: 'Already unlocked', unlockedBy: 'combination', blockers };
  }

  // 1. Check prerequisites
  for (const prereqId of tech.prerequisites) {
    if (!unlockedTechSet.has(prereqId)) {
      const prereqTech = getTechById(prereqId);
      blockers.push(`Prerequisite not unlocked: ${prereqTech?.name || prereqId}`);
    }
  }
  
  // 2. Check AI capability (DEPRECATED - use dimensional instead)
  if (tech.minAICapability) {
    const avgCapability = getAverageAICapability(gameState);
    if (avgCapability < tech.minAICapability) {
      blockers.push(`AI capability ${avgCapability.toFixed(2)} < ${tech.minAICapability}`);
    }
  }
  
  // 2b. Check dimensional capability requirements (NEW)
  if (tech.minCapabilityDimensions) {
    for (const req of tech.minCapabilityDimensions) {
      const avgDimensionalCap = getAverageDimensionalCapability(gameState, req.dimension);
      if (avgDimensionalCap < req.threshold) {
        blockers.push(`${req.dimension} capability ${avgDimensionalCap.toFixed(2)} < ${req.threshold}`);
      }
    }
  }
  
  // 2c. Check research capability requirements (NEW)
  if (tech.minResearchCapabilities) {
    for (const req of tech.minResearchCapabilities) {
      const avgResearchCap = getAverageResearchCapability(gameState, req.domain, req.subdomain);
      const reqName = req.subdomain ? `${req.domain}.${req.subdomain}` : req.domain;
      if (avgResearchCap < req.threshold) {
        blockers.push(`Research capability ${reqName} ${avgResearchCap.toFixed(2)} < ${req.threshold}`);
      }
    }
  }
  
  // 3. Check economic stage
  if (tech.minEconomicStage) {
    // FIX (Oct 25, 2025): Replaced defensive fallback with assertion
    const economicStage = assertEconomicStage(gameState, 'techTree.checkPrerequisites');
    if (economicStage < tech.minEconomicStage) {
      blockers.push(`Economic stage ${economicStage.toFixed(1)} < ${tech.minEconomicStage}`);
    }
  }
  
  // 4. Check minimum month (research takes time)
  if (tech.minMonth && gameState.currentMonth < tech.minMonth) {
    blockers.push(`Too early: month ${gameState.currentMonth} < ${tech.minMonth}`);
  }
  
  // 5. Check research progress
  // Note: Missing research progress = 0 is valid (tech hasn't been researched yet)
  const progress = techTreeState.researchProgress[tech.id] ?? 0;
  if (progress < 1.0) {
    blockers.push(`Research incomplete: ${(progress * 100).toFixed(0)}% complete`);
  }
  
  // Determine unlock trigger type
  let unlockedBy: 'capability' | 'crisis' | 'time' | 'research' | 'combination' = 'combination';
  if (tech.minAICapability && !tech.minEconomicStage && !tech.minMonth) {
    unlockedBy = 'capability';
  } else if (tech.minMonth && !tech.minAICapability) {
    unlockedBy = 'time';
  } else if (progress >= 1.0 && blockers.length === 0) {
    unlockedBy = 'research';
  }
  
  if (blockers.length > 0) {
    return {
      canUnlock: false,
      reason: blockers[0] || 'Unknown blocker',
      unlockedBy,
      blockers,
    };
  }
  
  return {
    canUnlock: true,
    reason: generateUnlockReason(tech, gameState),
    unlockedBy,
    blockers: [],
  };
}

/**
 * Unlock a technology
 */
function unlockTech(
  tech: TechDefinition,
  gameState: GameState,
  techTreeState: TechTreeState,
  _reason: string
): void {
  techTreeState.unlockedTech.push(tech.id);
  techTreeState.techUnlockedCount++;

  // HIGH PERFORMANCE FIX (Nov 20): Update O(1) lookup index
  techTreeState.unlockedTechSet[tech.id] = true;

  // Initialize at 0% deployment in all regions
  // Deployment happens through actions

  // Add to event log
  gameState.eventLog.push({
    type: 'breakthrough',
    severity: 'info',
    agent: 'Research Community',
    title: `${tech.name} Breakthrough`,
    description: `${tech.description}. Research complete, ready for deployment.`,
    effects: {},
  } as any);
}

/**
 * Apply pending deployment actions
 */
function applyDeploymentActions(
  _gameState: GameState,
  techTreeState: TechTreeState
): void {
  for (const action of techTreeState.pendingActions) {
    const tech = getTechById(action.techId);
    if (!tech) continue;
    
    // Get or create regional deployment
    const regionExisted = action.targetRegion in techTreeState.regionalDeployment;
    if (!regionExisted) {
      console.log(`\n📍 Creating new regional deployment array for ${action.targetRegion} (Month ${_gameState.currentMonth})`);
      console.log(`   No previous deployments in this region`);
      console.log(`   First tech deployment: ${action.techId}`);
      console.log(`   All regions tracked: ${Object.keys(techTreeState.regionalDeployment).join(', ')}`);
      techTreeState.regionalDeployment[action.targetRegion] = [];
    }

    const regional = techTreeState.regionalDeployment[action.targetRegion]!;

    // DEBUG: Check array before find
    if (action.techId === 'scalable_oversight' && _gameState.currentMonth % 24 === 0) {
      console.log(`\n🔍 BEFORE FIND (Month ${_gameState.currentMonth})`);
      console.log(`   Region: ${action.targetRegion}`);
      console.log(`   Array length: ${regional.length}`);
      const matches = regional.filter(d => d.techId === 'scalable_oversight');
      console.log(`   Scalable Oversight deployments in array: ${matches.length}`);
      if (matches.length > 0) {
        matches.forEach((m, i) => {
          console.log(`   [${i}] Level: ${(m.deploymentLevel * 100).toFixed(1)}%, Start: ${m.deploymentStartMonth}`);
        });
      }
    }

    let deployment = regional.find(d => d.techId === action.techId);

    // DEBUG: Track deployment object creation vs finding
    if (action.techId === 'scalable_oversight' && _gameState.currentMonth % 24 === 0) {
      console.log(`\n🔍 DEPLOYMENT ACTION (Month ${_gameState.currentMonth})`);
      console.log(`   Tech: ${action.techId}, Region: ${action.targetRegion}`);
      console.log(`   Found existing: ${deployment ? 'YES' : 'NO'}`);
      if (deployment) {
        console.log(`   Existing level: ${(deployment.deploymentLevel * 100).toFixed(1)}%`);
        console.log(`   Existing start: ${deployment.deploymentStartMonth}`);
      }
    }

    if (!deployment) {
      // CRITICAL BUG CHECK: Verify this tech doesn't already exist in array
      const existingCount = regional.filter(d => d.techId === action.techId).length;
      if (existingCount > 0) {
        console.log(`\n🚨 BUG: ${action.techId} already exists ${existingCount} times in ${action.targetRegion}, but find() returned null!`);
        console.log(`   Array length: ${regional.length}`);
        console.log(`   This means find() is broken or array was modified during iteration!`);
      }

      deployment = {
        techId: action.techId,
        region: action.targetRegion,
        deploymentLevel: 0,
        monthlyInvestment: 0,
        totalInvested: 0,
        deployedBy: [],
        effects: tech.effects,
      };
      regional.push(deployment);

      // DEBUG: Log new deployment creation
      if (action.techId === 'scalable_oversight') {
        console.warn(`\n⚠️  CREATED NEW DEPLOYMENT (Month ${_gameState.currentMonth})`);
        console.log(`   Tech: ${action.techId}, Region: ${action.targetRegion}`);
        console.log(`   This should only happen ONCE per tech per region!`);
      }
    }
    
    // Apply investment
    deployment.monthlyInvestment += action.investment;
    deployment.totalInvested += action.investment;
    techTreeState.totalInvestment += action.investment;

    // Track deployer
    if (!deployment.deployedBy.includes(action.deployedBy)) {
      deployment.deployedBy.push(action.deployedBy);
    }

    // FIX #14 Phase 1: Remove instant deployment
    // Deployment now progresses gradually via deploymentTimescales.ts
    // Investment signals intent to deploy, but actual deployment takes years

    // Track deployment start month (if not already set)
    if (!deployment.deploymentStartMonth && action.investment > 0) {
      deployment.deploymentStartMonth = action.month;
      console.log(`\n🚀 DEPLOYMENT STARTED: ${tech.name} in ${action.targetRegion}`);
      console.log(`   Initial investment: $${action.investment}M`);
      console.log(`   Deployed by: ${action.deployedBy}`);

      // Add event to timeline
      addSimulationEvent(_gameState, {
        type: 'deployment',
        severity: 'medium',
        agent: action.deployedBy,
        title: `🚀 DEPLOYMENT STARTED: ${tech.name}`,
        description: `Deployment initiated in ${action.targetRegion}. Initial investment: $${action.investment.toFixed(0)}M. Technology will deploy gradually over ${tech.deploymentMonthsRequired / 12} years. Category: ${tech.category}.`,
        effects: {
          techId: tech.id,
          region: action.targetRegion,
          investment: action.investment,
          deployedBy: action.deployedBy,
          timescale: tech.deploymentMonthsRequired
        }
      });
    }

    // OLD BEHAVIOR (instant deployment) - DISABLED for FIX #14
    // const deploymentIncrease = action.investment / tech.deploymentCost;
    // deployment.deploymentLevel = Math.min(1.0, deployment.deploymentLevel + deploymentIncrease);

    // Deployment level now updated by updateDeploymentProgress() based on time elapsed
  }
  
  // Clear actions
  techTreeState.pendingActions = [];
}

/**
 * Update research progress for locked tech
 * Research investment accelerates unlock timeline
 */
function updateResearchProgress(
  gameState: GameState,
  techTreeState: TechTreeState
): void {
  const lockedTech = getAllTech().filter(t => 
    !techTreeState.unlockedTech.includes(t.id) && 
    (t.status === 'unlockable' || t.status === 'future')
  );
  
  for (const tech of lockedTech) {
    // Get current progress - if not found, initialize to 0
    let progress = techTreeState.researchProgress[tech.id];
    
    // Debug: Check if progress is being retrieved correctly
    if (deterministicRandom() < 0.01 && tech.id === 'struvite_recovery') {
      console.log(`\n🔍 PROGRESS RETRIEVAL DEBUG (Month ${gameState.currentMonth}):`);
      console.log(`   Tech: ${tech.name}`);
      console.log(`   Map has key: ${(tech.id in techTreeState.researchProgress)}`);
      console.log(`   Map.get() returned: ${progress}`);
      console.log(`   Progress is undefined: ${progress === undefined}`);
      console.log(`   Map size: ${Object.keys(techTreeState.researchProgress).length}`);
      console.log(`   Map is instanceof Map: ${techTreeState.researchProgress instanceof Map}`);
    }
    
    if (progress === undefined) {
      progress = 0;
    }
    
    // Ensure the tech is in the research progress map
    if (!(tech.id in techTreeState.researchProgress)) {
      techTreeState.researchProgress[tech.id] = 0;
    }
    
    // Calculate progress this month
    // Base: 1 / researchMonthsRequired per month
    const baseProgress = 1.0 / tech.researchMonthsRequired;

    // Modifiers:
    const aiCapability = getAverageAICapability(gameState);
    const aiBonus = Math.min(2.0, 1.0 + (aiCapability / 5.0)); // 1.0x to 2.0x

    // Research investment bonus (government + private)
    const totalResearch = getTotalResearchInvestment(gameState);
    const researchBonus = 1.0 + Math.min(1.0, totalResearch / 1000); // Up to 2x at $1T/month

    // Energy constraints
    const energyMultiplier = getEnergyMultiplier(gameState);

    // Crisis innovation acceleration (matches research.ts logic)
    // Normal: 1x, Moderate: 2x, Severe: 5x, Existential: 10x
    const { getCrisisSeverity } = require('./deploymentSpeed');
    const crisisSeverity = getCrisisSeverity(gameState);
    const CRISIS_RESEARCH_MULTIPLIERS: Record<string, number> = {
      'normal': 1.0,
      'moderate': 2.0,
      'severe': 5.0,
      'existential': 10.0
    };
    const crisisMultiplier = CRISIS_RESEARCH_MULTIPLIERS[crisisSeverity] || 1.0;

    // Log crisis mobilization (probabilistic to avoid spam, deterministic)
    if (crisisMultiplier > 1.0 && deterministicRandom() < 0.01) {
      console.log(`🚨🔬 CRISIS TECH ACCELERATION: ${crisisSeverity} → ${crisisMultiplier}x unlock speed`);
      console.log(`   Tech unlock now matches AI capability acceleration (Manhattan Project parity)`);
    }

    // Combined progress
    const progressThisMonth = baseProgress * aiBonus * researchBonus * energyMultiplier * crisisMultiplier;
    
    progress = Math.min(1.0, progress + progressThisMonth);
    techTreeState.researchProgress[tech.id] = progress;
    
    // Debug logging for first tech (probabilistic, 1% to reduce spam)
    if (deterministicRandom() < 0.01 && tech.id === 'struvite_recovery') {
      console.log(`\n🔬 RESEARCH DEBUG (Month ${gameState.currentMonth}):`);
      console.log(`   Tech: ${tech.name}`);
      console.log(`   Research months required: ${tech.researchMonthsRequired}`);
      console.log(`   Base progress: ${baseProgress.toFixed(4)}`);
      console.log(`   AI bonus: ${aiBonus.toFixed(2)}x`);
      console.log(`   Research bonus: ${researchBonus.toFixed(2)}x`);
      console.log(`   Energy multiplier: ${energyMultiplier.toFixed(2)}x`);
      console.log(`   Crisis multiplier: ${crisisMultiplier.toFixed(2)}x (${crisisSeverity})`);
      console.log(`   Progress this month: ${progressThisMonth.toFixed(4)}`);
      console.log(`   Old progress: ${((progress - progressThisMonth) * 100).toFixed(1)}%`);
      console.log(`   New progress: ${(progress * 100).toFixed(1)}%`);
      console.log(`   Map size: ${Object.keys(techTreeState.researchProgress).length}`);
      console.log(`   Map has tech: ${(tech.id in techTreeState.researchProgress)}`);
      console.log(`   Map get tech: ${techTreeState.researchProgress[tech.id]}`);
    }
  }
}

// Effect application moved to effectsEngine.ts for better organization

// ============================================================================
// Helper Functions
// ============================================================================

function getAverageAICapability(gameState: GameState): number {
  // FIX #19 (Oct 22, 2025): Check active agents, not total agents
  // Bug: When all AIs retired, aiAgents.length > 0 but filtered length = 0 → division by zero → NaN
  const activeAIs = gameState.aiAgents.filter(ai => ai.lifecycleState !== 'retired');
  if (activeAIs.length === 0) return 0;

  // FIX #25 (Oct 25, 2025): Import at top of file instead of inline require
  // Bug: Inline require was returning 0 during simulation (circular dependency?)
  const totalCapability = activeAIs.reduce(
    (sum, ai) => sum + calculateTotalCapabilityFromProfile(ai.capabilityProfile),
    0
  );

  return totalCapability / activeAIs.length;
}

/**
 * Get average dimensional capability across all active AIs
 */
function getAverageDimensionalCapability(
  gameState: GameState,
  dimension: 'physical' | 'digital' | 'cognitive' | 'social' | 'economic' | 'selfImprovement'
): number {
  const activeAIs = gameState.aiAgents.filter(ai => ai.lifecycleState !== 'retired');
  if (activeAIs.length === 0) return 0;
  
  const total = activeAIs.reduce((sum, ai) => sum + ai.capabilityProfile[dimension], 0);
  return total / activeAIs.length;
}

/**
 * Get average research capability for a specific domain
 */
function getAverageResearchCapability(
  gameState: GameState,
  domain: 'biotech' | 'materials' | 'climate' | 'computerScience',
  subdomain?: string
): number {
  const activeAIs = gameState.aiAgents.filter(ai => ai.lifecycleState !== 'retired');
  if (activeAIs.length === 0) return 0;
  
  const total = activeAIs.reduce((sum, ai) => {
    const domainCap = ai.capabilityProfile.research[domain];

    // FIX #25 (Oct 25, 2025): Fail loudly if domain doesn't exist
    if (domainCap === undefined) {
      throw new Error(`Research domain "${domain}" not found in AI capability profile. AI: ${ai.id}`);
    }

    if (subdomain && typeof domainCap === 'object') {
      const subdomainValue = domainCap[subdomain as keyof typeof domainCap];

      // FIX #25 (Oct 25, 2025): Fail loudly if subdomain doesn't exist
      if (subdomainValue === undefined) {
        throw new Error(`Research subdomain "${domain}.${subdomain}" not found in AI capability profile. AI: ${ai.id}`);
      }

      return sum + (typeof subdomainValue === 'number' ? subdomainValue : 0);
    }
    // If no subdomain specified or domain is a number, return the domain value
    if (typeof domainCap === 'number') return sum + domainCap;
    // If it's an object, return the average of all subdomains
    const subdomainValues = Object.values(domainCap as any).filter(v => typeof v === 'number') as number[];
    return sum + (subdomainValues.length > 0 ? subdomainValues.reduce((a, b) => a + b, 0) / subdomainValues.length : 0);
  }, 0);
  
  return total / activeAIs.length;
}

function getTotalResearchInvestment(gameState: GameState): number {
  // FIX (Nov 7, 2025): Sort for deterministic reduce order (Issue #11)
  const sortedKeys = Object.keys(gameState.government.researchInvestments).sort();
  const gov = sortedKeys
    .reduce((sum, key) => {
      const val = gameState.government.researchInvestments[key];
      if (typeof val === 'number') return sum + val;
      if (typeof val === 'object') {
        // Also sort nested object keys
        const nestedSorted = Object.keys(val).sort();
        return sum + nestedSorted.reduce((s: number, k) => s + ((val as any)[k] as number), 0);
      }
      return sum;
    }, 0);
  
  // Add private research
  const privateResearch = gameState.organizations
    .filter(org => org.type === 'private')
    .reduce((sum, org) => sum + org.monthlyRevenue * 0.1, 0);
  
  return gov + privateResearch;
}

/**
 * Calculate energy multiplier based on available vs required power
 *
 * Research-backed: Energy bottlenecks delay tech deployment (IEA 2024, McKinsey 2024)
 * - Available: Total grid capacity minus existing consumption
 * - Required: Data center baseline + tech deployment energy needs
 * - Multiplier: Fraction of available energy (capped 0.1-1.0)
 *
 * Low energy scenarios (< 0.3 multiplier) significantly slow tech progress,
 * representing grid constraints, permitting delays, and infrastructure bottlenecks.
 */
function getEnergyMultiplier(gameState: GameState): number {
  // Check if power generation system exists
  if (!gameState.powerGenerationSystem) {
    // Early game or test scenarios without power tracking
    return 1.0;
  }

  const power = gameState.powerGenerationSystem;

  // Available energy: Total grid capacity
  const totalAvailable = power.totalElectricityGeneration; // TWh per month

  // Current consumption: Data centers + traditional grid load
  const dataCenterConsumption = power.dataCenterPower; // TWh per month

  // Assume traditional grid load is ~80% of total capacity (leaves 20% headroom)
  // This represents: residential, industrial, commercial, transport electrification
  const traditionalLoad = totalAvailable * 0.80;

  // Total current consumption
  const currentConsumption = dataCenterConsumption + traditionalLoad;

  // Available headroom for new tech deployment
  const availableHeadroom = totalAvailable - currentConsumption;

  // Estimate energy required for active tech deployment/research
  // Tech deployment energy scales with:
  // - Number of active deployments
  // - Deployment speed (faster = more energy intensive)
  const techTreeState = gameState.techTreeState;

  // Count actively deploying technologies (not fully deployed)
  let activeDeployments = 0;
  // FIX (Nov 7, 2025): Sort regions for deterministic iteration (Issue #11)
  const sortedRegions = Object.keys(techTreeState.regionalDeployment).sort();
  for (const region of sortedRegions) {
    const deployments = techTreeState.regionalDeployment[region];
    if (!deployments) continue;
    for (const deployment of deployments) {
      if (deployment.deploymentLevel < 1.0) {
        activeDeployments++;
      }
    }
  }

  // Estimate energy requirement for tech deployment
  // Baseline: Each active deployment requires ~5-10 TWh/month
  // (Based on: Manufacturing, construction, AI compute for optimization, grid upgrades)
  const energyPerDeployment = 7.5; // TWh per month per active tech
  const requiredEnergy = activeDeployments * energyPerDeployment;

  // If no active deployments, no constraint
  if (requiredEnergy === 0) {
    return 1.0;
  }

  // Calculate multiplier: fraction of required energy that's available
  // If we have plenty of headroom, multiplier = 1.0 (no slowdown)
  // If headroom is insufficient, multiplier < 1.0 (proportional slowdown)
  const multiplier = availableHeadroom > 0
    ? Math.min(1.0, availableHeadroom / requiredEnergy)
    : 0.1; // Minimum 10% progress even with severe constraints

  // Cap at minimum 0.1 (severe constraint) and maximum 1.0 (no constraint)
  const finalMultiplier = Math.max(0.1, Math.min(1.0, multiplier));

  // Log energy constraints when they're significant (< 0.8)
  // Add event for severe constraints only (< 0.5) to avoid spam
  if (finalMultiplier < 0.5 && deterministicRandom() < 0.02) {
    const severity = finalMultiplier < 0.3 ? 'critical' : 'warning';
    const constraintLevel = finalMultiplier < 0.3 ? 'SEVERE' : 'MODERATE';

    addSimulationEvent(gameState, {
      type: 'technology',
      severity,
      agent: 'infrastructure',
      title: `⚡ ENERGY CONSTRAINT - Tech deployment slowed`,
      description: `${constraintLevel} energy constraint detected. Grid capacity (${totalAvailable.toFixed(0)} TWh/mo) insufficient for ${activeDeployments} active tech deployments (require ${requiredEnergy.toFixed(0)} TWh/mo). Available headroom: ${availableHeadroom.toFixed(0)} TWh/mo. Deployment speed reduced to ${(finalMultiplier * 100).toFixed(0)}% of normal rate. Data centers consuming ${dataCenterConsumption.toFixed(0)} TWh/mo.`,
      effects: {
        energyMultiplier: finalMultiplier,
        requiredEnergy,
        availableHeadroom,
        activeDeployments,
        gridCapacity: totalAvailable,
        dataCenterConsumption
      }
    });
  }

  if (finalMultiplier < 0.8 && deterministicRandom() < 0.05) {
    console.log(`\n⚡ ENERGY CONSTRAINT (Month ${gameState.currentMonth}):`);
    console.log(`   Total grid capacity: ${totalAvailable.toFixed(1)} TWh/month`);
    console.log(`   Data center consumption: ${dataCenterConsumption.toFixed(1)} TWh/month`);
    console.log(`   Traditional load (80%): ${traditionalLoad.toFixed(1)} TWh/month`);
    console.log(`   Available headroom: ${availableHeadroom.toFixed(1)} TWh/month`);
    console.log(`   Active tech deployments: ${activeDeployments}`);
    console.log(`   Required for tech: ${requiredEnergy.toFixed(1)} TWh/month`);
    console.log(`   Energy multiplier: ${finalMultiplier.toFixed(2)}x`);
    if (finalMultiplier < 0.3) {
      console.warn(`   ⚠️  SEVERE CONSTRAINT - Tech deployment significantly slowed`);
    } else if (finalMultiplier < 0.6) {
      console.warn(`   ⚠️  MODERATE CONSTRAINT - Tech deployment moderately slowed`);
    }
  }

  return finalMultiplier;
}

function generateUnlockReason(_tech: TechDefinition, gameState: GameState): string {
  const avgCapability = getAverageAICapability(gameState);
  // FIX (Oct 25, 2025): Replaced defensive fallback with assertion
  const economicStage = assertEconomicStage(gameState, 'techTree.generateUnlockReason');

  return `Prerequisites met. AI capability: ${avgCapability.toFixed(2)}, Economic stage: ${economicStage.toFixed(1)}, Research: 100%`;
}

/**
 * HIGH PERFORMANCE FIX (Nov 20, 2025): O(1) Technology Lookups
 *
 * Helper functions to replace O(n) array searches with O(1) index lookups
 * Impact: 284+ comparisons/month → ~0 comparisons
 */

/**
 * Get maximum deployment level for a technology across all regions
 * @param techTreeState Tech tree state with O(1) lookup index
 * @param techId Technology ID to look up
 * @returns Deployment level [0-1], or 0 if not deployed
 */
export function getTechDeployment(techTreeState: TechTreeState, techId: string): number {
  return techTreeState.deployedTechMap[techId] ?? 0;
}

/**
 * Check if a technology is unlocked
 * @param techTreeState Tech tree state with O(1) lookup index
 * @param techId Technology ID to check
 * @returns true if unlocked, false otherwise
 */
export function isTechUnlocked(techTreeState: TechTreeState, techId: string): boolean {
  return techTreeState.unlockedTechSet[techId] === true;
}

/**
 * Rebuild deployedTechMap index from regionalDeployment data
 * Called after deployment levels change (monthly update)
 *
 * Maps each tech ID to its maximum deployment level across all regions
 */
export function rebuildDeploymentIndex(techTreeState: TechTreeState): void {
  // Clear existing index
  techTreeState.deployedTechMap = {};

  // Iterate through all regions and find max deployment per tech
  for (const region in techTreeState.regionalDeployment) {
    const deployments = techTreeState.regionalDeployment[region];
    if (!deployments) continue;

    for (const deployment of deployments) {
      const currentMax = techTreeState.deployedTechMap[deployment.techId] ?? 0;
      techTreeState.deployedTechMap[deployment.techId] = Math.max(currentMax, deployment.deploymentLevel);
    }
  }
}

