/**
 * Tech Deployment Schedule Phase (Nov 25, 2025)
 *
 * Executes scheduled technology deployments for sequenced/adaptive/prioritized modes.
 * Addresses extinction-by-shock-deployment bug where immediate deployment of 92 techs
 * causes 98.8% mortality before governance can respond.
 *
 * Research: Paced technology rollout enables governance systems to adapt,
 *           prevents catastrophic shocks from simultaneous deployment.
 * Expected impact: Enables testing of governance bottlenecks with realistic deployment timescales
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext } from '@/types/game';
import type { RNGFunction } from '@/types/config';
import { assertDefined } from '@/simulation/utils/assertions';
import { getAllTech } from '@/simulation/techTree/comprehensiveTechTree';
import { hasTech } from '@/simulation/utils/simulationIndices';

export class TechDeploymentSchedulePhase implements SimulationPhase {
  readonly id = 'tech-deployment-schedule';
  readonly name = 'Tech Deployment Schedule';
  readonly order = 1.6; // After ApplyScenarioPrioritiesPhase (1.5), before agent actions

  readonly dependencies = [] as const;

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    const month = state.currentMonth;

    // Skip if no deployment schedule
    if (!state.techDeploymentSchedule) {
      return { events: [] };
    }

    const schedule = state.techDeploymentSchedule;

    // Find techs scheduled for this month
    const dueThisMonth = schedule.scheduledDeployments.filter(
      entry => entry.deployMonth === month && !entry.deployed
    );

    if (dueThisMonth.length === 0) {
      return { events: [] };
    }

    // Deploy scheduled technologies
    console.log(`\n🔬 DEPLOYING SCHEDULED TECH (Month ${month})`);
    console.log(`   ${dueThisMonth.length} technologies due`);

    const allTech = getAllTech();
    const deploymentLevel = schedule.deploymentLevel;

    let deployedCount = 0;
    for (const entry of dueThisMonth) {
      // No index - domain-specific search (tech tree definitions)
      const tech = allTech.find(t => t.id === entry.techId);
      if (!tech) {
        console.warn(`   ⚠️  Unknown tech ID: ${entry.techId} (skipping)`);
        continue;
      }

      // Unlock tech (O(1) check with indices, O(n) fallback)
      if (!hasTech(entry.techId, context?.indices, state.techTreeState)) {
        state.techTreeState.unlockedTech.push(entry.techId);
        state.techTreeState.techUnlockedCount++;
      }

      // Initialize global deployment array if needed
      if (!state.techTreeState.regionalDeployment['global']) {
        state.techTreeState.regionalDeployment['global'] = [];
      }

      // Check if already deployed
      // No index - domain-specific search (regional deployment records)
      const existing = state.techTreeState.regionalDeployment['global'].find(
        d => d.techId === entry.techId
      );

      if (existing) {
        // Update existing deployment level
        existing.deploymentLevel = deploymentLevel;
        if (!existing.deployedBy.includes('scenario')) {
          existing.deployedBy.push('scenario');
        }
      } else {
        // Add new deployment
        state.techTreeState.regionalDeployment['global'].push({
          techId: tech.id,
          region: 'global',
          deploymentLevel,
          monthlyInvestment: 0,
          totalInvested: tech.deploymentCost * deploymentLevel,
          deployedBy: ['scenario'],
          effects: tech.effects
        });
        state.techTreeState.techDeployedCount++;
      }

      // Mark as deployed in schedule
      entry.deployed = true;
      deployedCount++;

      // Log deployment (only first 5 to avoid spam)
      if (deployedCount <= 5) {
        console.log(`   - ${tech.name}`);
      }
    }

    if (deployedCount > 5) {
      console.log(`   ... and ${deployedCount - 5} more`);
    }

    console.log(`   ✅ Deployed ${deployedCount} technologies at level ${deploymentLevel}`);

    return { events: [] };
  }
}
