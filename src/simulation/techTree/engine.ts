/**
 * Technology Tree Engine
 * 
 * Manages tech unlocking, deployment, and effects.
 * Replaces scattered tech unlock logic across multiple files.
 */

import { GameState } from '@/types/game';
import { TechDefinition } from './comprehensiveTechTree';
import { getAllTech, getTechById } from './comprehensiveTechTree';

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
 */
export function initializeTechTreeState(): TechTreeState {
  const state: TechTreeState = {
    unlockedTech: [],
    researchProgress: {},
    regionalDeployment: {},
    pendingActions: [],
    unlockHistory: [],
    totalInvestment: 0,
    techUnlockedCount: 0,
    techDeployedCount: 0,
  };
  
  // Unlock all DEPLOYED_2025 tech
  const deployedTech = getAllTech().filter(t => t.status === 'deployed_2025');
  for (const tech of deployedTech) {
    state.unlockedTech.push(tech.id);
    state.techUnlockedCount++;
    
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
  techTreeState: TechTreeState
): TechUnlockEvent[] {
  const unlockEvents: TechUnlockEvent[] = [];
  
  // 1. Check for tech unlocks
  const lockedTech = getAllTech().filter(t => 
    !techTreeState.unlockedTech.includes(t.id) && 
    (t.status === 'unlockable' || t.status === 'future')
  );
  
  // Debug logging (probabilistic to avoid spam)
  if (Math.random() < 0.01 && lockedTech.length > 0) {
    const avgCapability = getAverageAICapability(gameState);
    const economicStage = gameState.globalMetrics?.economicTransitionStage || 0;
    
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
  
  // 3. Update research progress for locked tech
  updateResearchProgress(gameState, techTreeState);
  
  // 4. Calculate and apply tech effects
  const { applyAllTechEffects, logTechEffects } = require('./effectsEngine');
  applyAllTechEffects(gameState, techTreeState);
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
  
  // Already unlocked?
  if (techTreeState.unlockedTech.includes(tech.id)) {
    return { canUnlock: false, reason: 'Already unlocked', unlockedBy: 'combination', blockers };
  }
  
  // 1. Check prerequisites
  for (const prereqId of tech.prerequisites) {
    if (!techTreeState.unlockedTech.includes(prereqId)) {
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
    const economicStage = gameState.globalMetrics?.economicTransitionStage || 0;
    if (economicStage < tech.minEconomicStage) {
      blockers.push(`Economic stage ${economicStage.toFixed(1)} < ${tech.minEconomicStage}`);
    }
  }
  
  // 4. Check minimum month (research takes time)
  if (tech.minMonth && gameState.currentMonth < tech.minMonth) {
    blockers.push(`Too early: month ${gameState.currentMonth} < ${tech.minMonth}`);
  }
  
  // 5. Check research progress
  const progress = techTreeState.researchProgress[tech.id] || 0;
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
    if (!(action.targetRegion in techTreeState.regionalDeployment)) {
      techTreeState.regionalDeployment[action.targetRegion] = [];
    }
    
    const regional = techTreeState.regionalDeployment[action.targetRegion]!;
    let deployment = regional.find(d => d.techId === action.techId);
    
    if (!deployment) {
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
    }
    
    // Apply investment
    deployment.monthlyInvestment += action.investment;
    deployment.totalInvested += action.investment;
    techTreeState.totalInvestment += action.investment;
    
    // Track deployer
    if (!deployment.deployedBy.includes(action.deployedBy)) {
      deployment.deployedBy.push(action.deployedBy);
    }
    
    // Calculate deployment progress
    // $1B investment = +X% deployment (based on tech cost)
    const deploymentIncrease = action.investment / tech.deploymentCost;
    deployment.deploymentLevel = Math.min(1.0, deployment.deploymentLevel + deploymentIncrease);
    
    if (deployment.deploymentLevel >= 1.0 && !techTreeState.unlockedTech.includes(`${tech.id}_deployed`)) {
      techTreeState.techDeployedCount++;
      techTreeState.unlockedTech.push(`${tech.id}_deployed`);
      
      console.log(`✅ TECH FULLY DEPLOYED: ${tech.name} in ${action.targetRegion}`);
    }
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
    if (Math.random() < 0.01 && tech.id === 'struvite_recovery') {
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
    
    // Combined progress
    const progressThisMonth = baseProgress * aiBonus * researchBonus * energyMultiplier;
    
    progress = Math.min(1.0, progress + progressThisMonth);
    techTreeState.researchProgress[tech.id] = progress;
    
    // Debug logging for first tech (probabilistic)
    if (Math.random() < 0.1 && tech.id === 'struvite_recovery') {
      console.log(`\n🔬 RESEARCH DEBUG (Month ${gameState.currentMonth}):`);
      console.log(`   Tech: ${tech.name}`);
      console.log(`   Research months required: ${tech.researchMonthsRequired}`);
      console.log(`   Base progress: ${baseProgress.toFixed(4)}`);
      console.log(`   AI bonus: ${aiBonus.toFixed(2)}x`);
      console.log(`   Research bonus: ${researchBonus.toFixed(2)}x`);
      console.log(`   Energy multiplier: ${energyMultiplier.toFixed(2)}x`);
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
  if (gameState.aiAgents.length === 0) return 0;
  
  const { calculateTotalCapabilityFromProfile } = require('../capabilities');
  const totalCapability = gameState.aiAgents
    .filter(ai => ai.lifecycleState !== 'retired')
    .reduce((sum, ai) => sum + calculateTotalCapabilityFromProfile(ai.capabilityProfile), 0);
  
  return totalCapability / gameState.aiAgents.filter(ai => ai.lifecycleState !== 'retired').length;
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
    if (subdomain && typeof domainCap === 'object') {
      return sum + (domainCap[subdomain as keyof typeof domainCap] || 0);
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
  const gov = Object.values(gameState.government.researchInvestments)
    .reduce((sum, val) => {
      if (typeof val === 'number') return sum + val;
      if (typeof val === 'object') {
        return sum + Object.values(val).reduce((s: number, v) => s + (v as number), 0);
      }
      return sum;
    }, 0);
  
  // Add private research
  const privateResearch = gameState.organizations
    .filter(org => org.type === 'private')
    .reduce((sum, org) => sum + org.monthlyRevenue * 0.1, 0);
  
  return gov + privateResearch;
}

function getEnergyMultiplier(_gameState: GameState): number {
  // TODO: Implement energy constraints when power generation system is connected
  return 1.0;
}

function generateUnlockReason(_tech: TechDefinition, gameState: GameState): string {
  const avgCapability = getAverageAICapability(gameState);
  const economicStage = gameState.globalMetrics?.economicTransitionStage || 0;
  
  return `Prerequisites met. AI capability: ${avgCapability.toFixed(2)}, Economic stage: ${economicStage.toFixed(1)}, Research: 100%`;
}

