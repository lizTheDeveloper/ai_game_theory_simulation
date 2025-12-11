/**
 * Simulation Indices - HIGH-1 Performance Optimization (Nov 20, 2025)
 *
 * Provides O(1) lookup structures built once per step to eliminate O(n²) patterns.
 *
 * **Root Cause:** Critical hot paths repeatedly search through arrays, creating
 * nested loops that execute 60,000-100,000 times per step.
 *
 * **Solution:** Build Map/Set indices once (O(n)), share via PhaseContext, use O(1) lookups.
 *
 * **Impact:** 98% reduction in operations (101,210 → 2,000 per step)
 *
 * **Research:** Standard CS - hash table lookups O(1) vs array.find() O(n)
 * **Architecture Review:** reviews/architecture_o2_bottlenecks_20251120.md
 */

import type { GameState, AIAgent, Organization } from '@/types/game';
import { assertDefined, assertFinite } from './assertions';

/**
 * Pre-built indices for O(1) lookups during simulation steps
 *
 * Built once per step in PhaseOrchestrator, shared via PhaseContext.
 * All phases can access these without rebuilding.
 */
export interface SimulationIndices {
  /**
   * Datacenter ownership: dcId → orgId
   *
   * Eliminates 60,000 operations per step from:
   * - governmentAgent.ts (3 instances)
   * - computeInfrastructure.ts (1 instance)
   * - crisisActions.ts (3 instances)
   *
   * Before: state.organizations.find(o => o.ownedDataCenters.includes(dc.id))
   * After: indices.datacenterOwnership.get(dc.id)
   */
  datacenterOwnership: Map<string, string>;

  /**
   * Agent lookup: agentId → AIAgent
   *
   * Eliminates 500 operations per step from:
   * - collectiveFormation.ts (multiple instances)
   *
   * Before: agents.find(a => a.id === agentId)
   * After: indices.agentMap.get(agentId)
   */
  agentMap: Map<string, AIAgent>;

  /**
   * Organization lookup: orgId → Organization
   *
   * General purpose index for organization lookups.
   *
   * Before: state.organizations.find(o => o.id === orgId)
   * After: indices.orgMap.get(orgId)
   */
  orgMap: Map<string, Organization>;

  /**
   * Unlocked technologies: Set of techId
   *
   * Eliminates 710 operations per step from:
   * - techTree/engine.ts (multiple instances)
   * - nitrogenFoodCoupling.ts
   *
   * Before: state.techTreeState.unlockedTech.includes(tech.id)
   * After: indices.unlockedTech.has(tech.id)
   */
  unlockedTech: Set<string>;

  /**
   * Organizations currently building datacenters: Set of orgId
   *
   * Eliminates 40,000 operations per step from:
   * - organizationManagement.ts line 109
   *
   * Before: state.organizations.filter(...).some(o => o.currentProjects.some(...))
   * After: indices.buildingOrgs.size > 0 or indices.buildingOrgs.has(orgId)
   */
  buildingOrgs: Set<string>;

  /**
   * Organization type lookup: orgType → Set<orgId>
   *
   * Enables fast filtering by organization type.
   *
   * Before: state.organizations.filter(o => o.type === 'private')
   * After: indices.orgsByType.get('private')
   */
  orgsByType: Map<string, Set<string>>;
}

/**
 * Build simulation indices from current game state
 *
 * Call once per simulation step in PhaseOrchestrator.executeAll(),
 * store result in PhaseContext.indices.
 *
 * @param state - Current game state
 * @returns Pre-built indices for O(1) lookups
 */
export function buildSimulationIndices(state: GameState): SimulationIndices {
  // Datacenter ownership: dcId → orgId
  const datacenterOwnership = new Map<string, string>();
  for (const org of state.organizations) {
    for (const dcId of org.ownedDataCenters) {
      datacenterOwnership.set(dcId, org.id);
    }
  }

  // Agent lookup: agentId → AIAgent
  const agentMap = new Map<string, AIAgent>();
  for (const agent of state.aiAgents) {
    agentMap.set(agent.id, agent);
  }

  // Organization lookup: orgId → Organization
  const orgMap = new Map<string, Organization>();
  for (const org of state.organizations) {
    orgMap.set(org.id, org);
  }

  // Unlocked technologies: Set of techId
  const unlockedTech = new Set<string>();
  if (state.techTreeState?.unlockedTech) {
    for (const techId of state.techTreeState.unlockedTech) {
      unlockedTech.add(techId);
    }
  }

  // Organizations currently building datacenters
  const buildingOrgs = new Set<string>();
  for (const org of state.organizations) {
    const isBuilding = org.currentProjects.some(p => p.type === 'datacenter_construction');
    if (isBuilding) {
      buildingOrgs.add(org.id);
    }
  }

  // Organization type lookup
  const orgsByType = new Map<string, Set<string>>();
  for (const org of state.organizations) {
    let typeSet = orgsByType.get(org.type);
    if (!typeSet) {
      typeSet = new Set<string>();
      orgsByType.set(org.type, typeSet);
    }
    typeSet.add(org.id);
  }

  return {
    datacenterOwnership,
    agentMap,
    orgMap,
    unlockedTech,
    buildingOrgs,
    orgsByType
  };
}

/**
 * Get datacenter owner organization (with assertion)
 *
 * Helper function that gets owner from index and validates existence.
 *
 * @param dcId - Datacenter ID
 * @param indices - Simulation indices
 * @param state - Game state (for org lookup)
 * @param location - Calling location (for error context)
 * @returns Owner organization
 * @throws Error if datacenter has no owner
 */
export function getDatacenterOwner(
  dcId: string,
  indices: SimulationIndices,
  state: GameState,
  location: string
): Organization {
  const orgId = assertDefined(
    indices.datacenterOwnership.get(dcId),
    {
      location,
      valueName: 'datacenterOwnership',
      additionalInfo: { dcId }
    }
  );

  const org = assertDefined(
    indices.orgMap.get(orgId),
    {
      location,
      valueName: 'organization',
      additionalInfo: { orgId, dcId }
    }
  );

  return org;
}

/**
 * Get datacenter owner organization (nullable)
 *
 * Helper function that returns undefined if datacenter has no owner.
 * Use when ownership is optional (e.g., filtering private DCs).
 *
 * @param dcId - Datacenter ID
 * @param indices - Simulation indices
 * @returns Owner organization or undefined
 */
export function getDatacenterOwnerNullable(
  dcId: string,
  indices: SimulationIndices
): Organization | undefined {
  const orgId = indices.datacenterOwnership.get(dcId);
  if (!orgId) return undefined;

  return indices.orgMap.get(orgId);
}

/**
 * Check if any organization is currently building datacenters
 *
 * @param indices - Simulation indices
 * @returns True if any org is building
 */
export function hasActiveDatacenterConstruction(indices: SimulationIndices): boolean {
  return indices.buildingOrgs.size > 0;
}

/**
 * Check if organization is currently building a datacenter
 *
 * @param orgId - Organization ID
 * @param indices - Simulation indices
 * @returns True if org is building
 */
export function isOrganizationBuilding(orgId: string, indices: SimulationIndices): boolean {
  return indices.buildingOrgs.has(orgId);
}

/**
 * Get all organizations of a specific type
 *
 * @param type - Organization type
 * @param indices - Simulation indices
 * @returns Set of organization IDs
 */
export function getOrganizationsByType(
  type: string,
  indices: SimulationIndices
): Set<string> {
  return indices.orgsByType.get(type) || new Set();
}

/**
 * Get government organization (O(1) lookup with fallback)
 *
 * Helper for common pattern of finding government org.
 * Uses index-first pattern with defensive fallback.
 *
 * @param state - Game state
 * @param indices - Simulation indices (optional, falls back to .find())
 * @returns Government organization or undefined
 */
export function getGovernmentOrg(
  state: GameState,
  indices?: SimulationIndices
): Organization | undefined {
  // O(1) index lookup if available
  if (indices) {
    const govOrgIds = indices.orgsByType.get('government');
    if (govOrgIds && govOrgIds.size > 0) {
      const govOrgId = govOrgIds.values().next().value;
      if (govOrgId) {
        return indices.orgMap.get(govOrgId);
      }
    }
  }

  // Fallback to O(n) search for safety (defensive coding)
  return state.organizations.find(o => o.type === 'government');
}

/**
 * Get AI agent by ID (O(1) lookup with fallback)
 *
 * Helper for common pattern of finding AI agent by ID.
 * Uses index-first pattern with defensive fallback.
 *
 * @param state - Game state
 * @param agentId - Agent ID
 * @param indices - Simulation indices (optional, falls back to .find())
 * @returns AI agent or undefined
 */
export function getAgentById(
  state: GameState,
  agentId: string,
  indices?: SimulationIndices
): AIAgent | undefined {
  // O(1) index lookup if available
  if (indices) {
    const agent = indices.agentMap.get(agentId);
    if (agent) return agent;
  }

  // Fallback to O(n) search for safety (defensive coding)
  return state.aiAgents.find(a => a.id === agentId);
}

/**
 * Get AI agent by name (O(n) search - no index available)
 *
 * Helper for finding AI agent by name.
 * Note: Name lookups cannot be O(1) without adding name index.
 *
 * @param state - Game state
 * @param agentName - Agent name
 * @returns AI agent or undefined
 */
export function getAgentByName(
  state: GameState,
  agentName: string
): AIAgent | undefined {
  return state.aiAgents.find(a => a.name === agentName);
}
