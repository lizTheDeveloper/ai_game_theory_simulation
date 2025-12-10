/**
 * Post-Quantum Cryptography Transition Phase (L-3, Dec 10, 2025)
 *
 * Models migration from quantum-vulnerable (RSA/ECC) to quantum-resistant (PQC) cryptography.
 * Tracks deployment progress, investment, sectoral rollout, and legacy crypto debt.
 *
 * Key Dynamics:
 * - Deployment modes: Proactive (0.4-0.8%/month) vs Reactive (1.7-3.3%/month emergency)
 * - Investment requirements: $200-300B global total, $7.1B US government
 * - Crypto agility constraints: Legacy systems slow adoption
 * - Sectoral priorities: Defense → Finance → Government → Healthcare → Commerce → Consumer
 * - Legacy debt paydown: 10-20 years for full transition
 *
 * Research: research/quantum_computing_cascades_20251210.md
 * Expected impact: Crisis mitigation, economic recovery, trust rebuilding
 */

import type { GameState } from '../../../types/game';
import type { PhaseResult } from '../PhaseOrchestrator';
import { assertFinite } from '../../utils/assertions';

/**
 * Post-Quantum Cryptography Transition Phase
 *
 * Updates PQC deployment progress and mitigates cryptographic crisis impacts.
 *
 * @param state - Current game state
 * @param rng - Random number generator (not used, but required for phase signature)
 * @returns Phase result with updated PQC transition state
 */
export function PostQuantumTransitionPhase(
  state: GameState,
  rng: () => number
): PhaseResult {
  // Skip if quantum system not initialized
  if (!state.quantumSystem) {
    return {
      stateChanges: {},
      events: [],
      errors: [],
    };
  }

  const pqc = state.quantumSystem.pqcTransition;
  const crypto = state.quantumSystem.cryptographySecurity;
  const { currentMonth } = state;

  // --- Determine Deployment Mode ---
  // Switch to reactive mode if cryptographic crisis is active
  let mode: 'proactive' | 'reactive' = pqc.mode;

  if (crypto.crisisActive && mode === 'proactive') {
    mode = 'reactive'; // Emergency crash program
    console.log(`\n🚨🔐 PQC TRANSITION: EMERGENCY MODE ACTIVATED (Month ${currentMonth})`);
    console.log(`  Switching from proactive to reactive deployment`);
  }

  // --- Calculate Deployment Rate ---
  // Proactive: 0.4-0.8%/month (NIST 2035 target = 10 years = 0.83%/month)
  // Reactive: 1.7-3.3%/month (emergency mobilization, first 2 years)
  const baseProactiveRate = 0.5; // 0.5%/month baseline
  const baseReactiveRate = 2.5; // 2.5%/month emergency (middle of 1.7-3.3 range)

  // Investment effect: Higher investment → faster deployment
  // Investment level: 0.5 = baseline, 1.0 = 2x spending
  const investmentMultiplier = 0.5 + (pqc.monthlyInvestment / 1.0); // $1B/month = 2x baseline

  // Crypto agility effect: Higher agility → faster deployment
  // Agility: 0.3 baseline (low), 1.0 = perfect (no legacy constraints)
  const agilityMultiplier = 0.5 + pqc.cryptoAgility * 0.5; // 0.5x to 1.0x

  const deploymentRate =
    mode === 'proactive'
      ? baseProactiveRate * investmentMultiplier * agilityMultiplier
      : baseReactiveRate * investmentMultiplier * agilityMultiplier;

  assertFinite(deploymentRate, {
    location: 'PostQuantumTransitionPhase',
    valueName: 'deploymentRate',
    month: currentMonth,
    additionalInfo: { mode, investmentMultiplier, agilityMultiplier },
  });

  // --- Update Deployment Progress ---
  const newDeploymentProgress = Math.min(100.0, pqc.deploymentProgress + deploymentRate);

  // --- Sectoral Deployment Progress ---
  // Different sectors deploy at different rates (priority-based)
  // Priority: Defense (2x) > Finance (1.5x) > Government (1.0x) > Healthcare (0.8x) > Commerce (0.6x) > Consumer (0.4x)
  const sectoralRates = {
    defense: deploymentRate * 2.0,
    finance: deploymentRate * 1.5,
    government: deploymentRate * 1.0,
    healthcare: deploymentRate * 0.8,
    commerce: deploymentRate * 0.6,
    consumer: deploymentRate * 0.4,
  };

  const sectoralProgress = {
    defense: Math.min(100.0, pqc.sectoralProgress.defense + sectoralRates.defense),
    finance: Math.min(100.0, pqc.sectoralProgress.finance + sectoralRates.finance),
    government: Math.min(100.0, pqc.sectoralProgress.government + sectoralRates.government),
    healthcare: Math.min(100.0, pqc.sectoralProgress.healthcare + sectoralRates.healthcare),
    commerce: Math.min(100.0, pqc.sectoralProgress.commerce + sectoralRates.commerce),
    consumer: Math.min(100.0, pqc.sectoralProgress.consumer + sectoralRates.consumer),
  };

  // --- Investment Accumulation ---
  // Monthly investment: Policy-driven (baseline $500M/month)
  // Reactive mode: 5x investment surge (emergency funding)
  const baseMonthlyInvestment = 0.5; // $500M/month
  const reactiveInvestmentSurge = mode === 'reactive' ? 5.0 : 1.0;

  const monthlyInvestment = baseMonthlyInvestment * reactiveInvestmentSurge;
  const cumulativeInvestment = pqc.cumulativeInvestment + monthlyInvestment;

  // --- Legacy Crypto Debt ---
  // Legacy debt = % of systems still using quantum-vulnerable crypto
  // Decreases as PQC deployment increases
  const legacyCryptoDebt = Math.max(0, 100.0 - newDeploymentProgress);

  // --- Crypto Agility Improvement ---
  // Crypto agility improves as organizations gain PQC deployment experience
  // Learning effect: Agility asymptotically approaches 0.8 (not perfect 1.0 due to legacy constraints)
  const targetAgility = 0.8;
  const agilityGrowthRate = 0.005; // 0.5%/month improvement
  const cryptoAgility = Math.min(
    targetAgility,
    pqc.cryptoAgility + agilityGrowthRate * (targetAgility - pqc.cryptoAgility)
  );

  // --- Estimated Completion Timeline ---
  // Months remaining = (100% - current progress) / deployment rate
  const remainingProgress = 100.0 - newDeploymentProgress;
  const estimatedCompletionMonths =
    deploymentRate > 0 ? Math.ceil(remainingProgress / deploymentRate) : 999;

  // --- Update Cryptography Security PQC Deployment ---
  // Sync pqcDeployment field with transition progress
  state.quantumSystem.cryptographySecurity.pqcDeployment = newDeploymentProgress;

  // --- Update State ---
  state.quantumSystem.pqcTransition = {
    mode,
    deploymentProgress: newDeploymentProgress,
    deploymentRate,
    cumulativeInvestment,
    monthlyInvestment,
    cryptoAgility,
    sectoralProgress,
    legacyCryptoDebt,
    estimatedCompletionMonths,
  };

  // --- Events ---
  const events = [];

  // Mode switch event
  if (pqc.mode === 'proactive' && mode === 'reactive') {
    events.push({
      id: `pqc-emergency-mode-${currentMonth}`,
      type: 'pqc-emergency-mode' as any,
      month: currentMonth,
      description: `🚨🔐 PQC deployment switched to EMERGENCY MODE. Investment surge: 5x baseline.`,
      impact: 'major',
    });
  }

  // Milestone events
  if (pqc.deploymentProgress < 25.0 && newDeploymentProgress >= 25.0) {
    events.push({
      id: `pqc-25pct-${currentMonth}`,
      type: 'pqc-milestone' as any,
      month: currentMonth,
      description: `🔐✅ PQC deployment: 25% complete. Critical infrastructure secured.`,
      impact: 'positive',
    });
  }

  if (pqc.deploymentProgress < 50.0 && newDeploymentProgress >= 50.0) {
    events.push({
      id: `pqc-50pct-${currentMonth}`,
      type: 'pqc-milestone' as any,
      month: currentMonth,
      description: `🔐✅ PQC deployment: 50% complete. Majority of systems quantum-resistant.`,
      impact: 'positive',
    });
  }

  if (pqc.deploymentProgress < 75.0 && newDeploymentProgress >= 75.0) {
    events.push({
      id: `pqc-75pct-${currentMonth}`,
      type: 'pqc-milestone' as any,
      month: currentMonth,
      description: `🔐✅ PQC deployment: 75% complete. Cryptographic crisis containment imminent.`,
      impact: 'positive',
    });
  }

  if (pqc.deploymentProgress < 90.0 && newDeploymentProgress >= 90.0) {
    events.push({
      id: `pqc-90pct-${currentMonth}`,
      type: 'pqc-milestone' as any,
      month: currentMonth,
      description: `🔐✅ PQC deployment: 90% complete. Legacy crypto debt minimal.`,
      impact: 'positive',
    });
  }

  // Full deployment completion
  if (pqc.deploymentProgress < 100.0 && newDeploymentProgress >= 100.0) {
    events.push({
      id: `pqc-complete-${currentMonth}`,
      type: 'pqc-complete' as any,
      month: currentMonth,
      description: `🔐🎉 PQC deployment: 100% COMPLETE. All systems quantum-resistant. Cryptographic security restored.`,
      impact: 'major-positive',
    });

    console.log(`\n🔐🎉 PQC DEPLOYMENT COMPLETE (Month ${currentMonth}):`);
    console.log(`  Total investment: $${cumulativeInvestment.toFixed(1)}B`);
    console.log(`  Timeline: ${(currentMonth - (crypto.crisisStartMonth ?? currentMonth))} months from crisis start`);
    console.log(`  ✅ Cryptographic security fully restored`);
  }

  return {
    stateChanges: {
      'quantumSystem.pqcTransition': state.quantumSystem.pqcTransition,
      'quantumSystem.cryptographySecurity.pqcDeployment':
        state.quantumSystem.cryptographySecurity.pqcDeployment,
    },
    events,
    errors: [],
  };
}
