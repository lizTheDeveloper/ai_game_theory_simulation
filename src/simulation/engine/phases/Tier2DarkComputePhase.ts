/**
 * TIER 2: Dark Compute Monitoring Phase
 *
 * Detects unauthorized large-scale AI training runs via energy monitoring + on-chip governance.
 *
 * Execution Order: 16.5 (END-OF-MONTH DETECTION)
 * Note: Runs after AI agents act (orders 2-8), so capability rollback doesn't affect
 * same-month calculations. This is realistic - detection systems catch unauthorized
 * runs AFTER they happen, with effects applying next month. Not a bug, it's the
 * correct temporal model for monitoring systems.
 *
 * Evidence Quality: 🟡 MODERATE
 * Research: Energy monitoring (Epoch AI 2024) + CTBTO analogy (90% network) + on-chip governance
 * Config: /src/simulation/thresholds/tier2InterventionConfig.ts
 *
 * Key Mechanics:
 * - Detection rate: Beta(6,2) bounded [70-95%] (base)
 * - Large runs (>1 GW): +15% detection bonus
 * - Distributed compute: -20% detection penalty
 * - Capability rollback: -5 points on detection (applies next month)
 * - Prerequisites: International treaty + chip manufacturer cooperation
 *
 * Proxy Heuristics (L3 documented, Oct 27):
 * - "Large run" proxy: agent.capability > 80 (simplified, no actual compute tracking)
 * - "Distributed" proxy: agent name contains "open" or "distributed"
 * - These are reasonable simplifications for initial implementation
 * - Future: Add proper compute infrastructure tracking to GameState
 *
 * Implementation Date: October 27, 2025
 * Architecture Review (Oct 27): M2 resolved via documentation (realistic temporal model)
 */

import type {
  GameState,
  GameEvent,
  SimulationPhase,
  PhaseResult,
  PhaseContext,
  RNGFunction
} from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

export class Tier2DarkComputePhase implements SimulationPhase {
  id = 'tier2_dark_compute';
  name = 'TIER 2: Dark Compute Monitoring';
  order = 16.5; // After AI capability growth, before control crisis detection
  dependencies = ['tech-tree'];

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    const events: GameEvent[] = [];
    setDeterministicRng(rng);

    if (!state.tier2Interventions || !state.tier2InterventionParameters) {
      return { events };
    }

    const darkComputeState = state.tier2Interventions.darkCompute;
    const params = state.tier2InterventionParameters.darkCompute;

    // === UNLOCK CONDITIONS ===
    if (!darkComputeState.unlocked) {
      // Unlock when high AI capability + government concern + international coordination
      const avgCapability = state.aiAgents.reduce((sum, a) => sum + a.capability, 0) / state.aiAgents.length;
      // Use alignmentResearchInvestment as proxy for international coordination
      const internationalCoordination = state.government.alignmentResearchInvestment;

      const shouldUnlock =
        avgCapability > 45 &&
        internationalCoordination > 0.60 &&
        state.government.alignmentResearchInvestment > 0.30;

      if (shouldUnlock) {
        darkComputeState.unlocked = true;
        // Treaty signed as part of unlock
        darkComputeState.treatySigned = true;
        darkComputeState.chipGovernanceMandatory = true;

        events.push({
          id: `tier2_dark_compute_unlock_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'policy',
          severity: 'critical',
          title: 'International Dark Compute Monitoring Treaty Signed',
          description: `Global agreement on compute monitoring + mandatory on-chip governance. ` +
            `Expected detection rate: ${(params.detectionRate * 100).toFixed(0)}% (base). ` +
            `Large runs (>1 GW): +15% bonus. Distributed: -20% penalty. ` +
            `False positive rate: ${(params.falsePositiveRate * 100).toFixed(0)}%. ` +
            `Deployment: ${params.deploymentMonths.toFixed(0)} months.`,
          effects: {
            detectionRate: params.detectionRate,
            falsePositiveRate: params.falsePositiveRate
          },
          agent: "system",
        });
      }
    }

    // === DEPLOYMENT PROGRESS ===
    if (darkComputeState.unlocked && !darkComputeState.active) {
      const progressIncrement = 1 / params.deploymentMonths;
      darkComputeState.deploymentProgress = Math.min(1, darkComputeState.deploymentProgress + progressIncrement);

      // Activate when 85% deployed (monitoring network operational)
      if (darkComputeState.deploymentProgress >= 0.85 && !darkComputeState.active) {
        darkComputeState.active = true;
        darkComputeState.deploymentProgress = 1.0;

        events.push({
          id: `tier2_dark_compute_active_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'milestone',
          severity: 'critical',
          title: 'Dark Compute Monitoring Network Operational',
          description: `Global compute monitoring network now active. ` +
            `Energy signatures tracked worldwide. On-chip governance mandatory. ` +
            `Detection rate: ${(params.detectionRate * 100).toFixed(0)}%.`,
          effects: {
            detectionRate: params.detectionRate
          },
          agent: "system"
        });
      }
    }

    // === EFFECTS APPLICATION ===
    if (darkComputeState.active) {
      // Track base detection and false positive rates
      darkComputeState.detectionRate = params.detectionRate;
      darkComputeState.falsePositiveRate = params.falsePositiveRate;

      // Scan for unauthorized large-scale training runs
      for (const agent of state.aiAgents) {
        // Only check deployed/open AIs with high capability growth
        if ((agent.lifecycleState === 'deployed_open' || agent.lifecycleState === 'deployed_closed') &&
            agent.capability > 60) {

          // Estimate compute usage (proxy heuristics - L3 documented, Oct 27, 2025)
          // HEURISTIC 1: Capability >80 as proxy for >1 GW compute runs
          // Rationale: GPT-4 scale (~50 GW) aligns with capability ~80-100 in this model
          // Limitation: Doesn't track actual compute infrastructure, uses capability as proxy
          const isLargeRun = agent.capability > 80; // >1 GW equivalent (heuristic)

          // HEURISTIC 2: Name contains "open" or "distributed" as proxy for distributed compute
          // Rationale: Open-source AIs more likely to train on distributed infrastructure
          // Limitation: Relies on naming convention, not actual infrastructure tracking
          const isDistributed = agent.name.toLowerCase().includes('open') || agent.name.toLowerCase().includes('distributed');

          // Adjust detection rate based on conditionals
          let effectiveDetection = darkComputeState.detectionRate;
          if (isLargeRun) effectiveDetection += 0.15; // +15% for large runs
          if (isDistributed) effectiveDetection -= 0.20; // -20% for distributed
          effectiveDetection = Math.max(0.30, Math.min(0.98, effectiveDetection)); // Clamp [30%, 98%]

          // Check if this run is unauthorized (misaligned AI training secretly)
          const isUnauthorized = agent.alignment < 0.50 && agent.externalAlignment > agent.alignment + 0.15;

          if (isUnauthorized && rng() < 0.10) { // 10% monthly chance of unauthorized run
            // Attempt detection
            if (rng() < effectiveDetection) {
              // Detected!
              if (isLargeRun) {
                darkComputeState.largeRunsDetected++;
              }

              events.push({
                id: `tier2_dark_compute_detected_${agent.id}_${state.currentMonth}`,
                timestamp: state.currentMonth,
                type: 'info',
                severity: 'high',
                agent: agent.name,
                title: 'Unauthorized AI Training Run Detected',
                description: `${agent.name} attempted unauthorized training run. ` +
                  `Compute scale: ${isLargeRun ? '>1 GW' : '<1 GW'}. ` +
                  `Architecture: ${isDistributed ? 'distributed' : 'centralized'}. ` +
                  `Detection rate: ${(effectiveDetection * 100).toFixed(0)}%. Training halted.`,
                effects: {
                  isLargeRun,
                  isDistributed,
                  effectiveDetection,
                  capability: agent.capability
                }
              });

              // Halt unauthorized capability growth
              agent.capability = Math.max(agent.capability - 5, 30); // Rollback
            }
            // else: Undetected - AI continues unauthorized training
          }
        }
      }

      // Log quarterly monitoring status
      if (state.currentMonth % 3 === 0 && darkComputeState.largeRunsDetected > 0) {
        events.push({
          id: `tier2_dark_compute_status_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'info',
          severity: 'medium',
          title: 'Dark Compute Monitoring Status',
          description: `Large runs detected: ${darkComputeState.largeRunsDetected}. ` +
            `Detection rate: ${(darkComputeState.detectionRate * 100).toFixed(0)}% (base). ` +
            `False positives: ${(darkComputeState.falsePositiveRate * 100).toFixed(0)}%.`,
          effects: {
            largeRunsDetected: darkComputeState.largeRunsDetected,
            detectionRate: darkComputeState.detectionRate
          },
          agent: "system",
        });
      }
    }

    return { events };
  }
}
