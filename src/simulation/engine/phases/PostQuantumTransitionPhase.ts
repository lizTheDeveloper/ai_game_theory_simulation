import { GameState, GameEvent, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { assertFinite, assertInRange } from '@/simulation/utils/assertions';

/**
 * Post-Quantum Cryptography Transition Phase (L-3, Dec 10, 2025)
 *
 * Models deployment of post-quantum cryptography (PQC) to replace broken RSA/ECC.
 * Tracks investment, deployment progress, crisis mitigation, and economic costs.
 *
 * Order: TBD (After cryptography security)
 *
 * Research Foundation:
 * - Deployment timeline: 20-40 years for full transition (use 30 years baseline)
 * - NIST target: 2035 for government transition (likely optimistic)
 * - Investment baseline: $7.1B total (NIST estimate)
 * - Crisis multiplier: 5x investment boost during active crisis
 * - Deployment barriers: Hardware compatibility, training, testing, coordination
 * - Research: research/quantum_computing_cascades_20251210.md (38 sources, Grade B+)
 *
 * Key Dynamics:
 * 1. Pre-crisis: Gradual proactive deployment ($7.1B baseline)
 * 2. During crisis: 5x investment boost, accelerated timeline
 * 3. Deployment progress mitigates crisis severity (10% reduction per month at full deployment)
 * 4. Crisis ends when deployment >80% and severity <10%
 * 5. Economic costs: Deployment investment + opportunity cost
 *
 * Expected Impact:
 * - Crisis mitigation (years to resolve without intervention)
 * - Economic costs ($7B-$35B depending on urgency)
 * - Technological debt reduction (legacy crypto replaced)
 * - Digital infrastructure restoration
 */
export function executePostQuantumTransitionPhase(
  state: GameState,
  rng: RNGFunction,
  context: PhaseContext
): PhaseResult {
  const events: GameEvent[] = [];

  // Initialize quantum system check
  if (!state.quantumSystem) {
    return { events, monthlyReport: {} };
  }

  if (!rng || typeof rng !== 'function') {
    throw new Error('❌ CRITICAL: RNG required for deterministic simulation (PostQuantumTransitionPhase)');
  }

  const crypto = state.quantumSystem.cryptography;
  const pqc = state.quantumSystem.pqcTransition;
  const initialDeployment = pqc.deploymentProgress;

  // --- 1. Calculate PQC investment ---
  const baseInvestment = 7.1; // $7.1B baseline (NIST estimate for full transition)
  const baselineMonths = 360; // 30 years = 360 months
  const monthlyBaseInvestment = baseInvestment / baselineMonths; // ~$20M/month

  let investmentMultiplier = 1.0;

  if (crypto.cryptographicCrisisActive) {
    // CRISIS MODE: 5x investment boost
    // Research: Crisis-driven transitions see 3-10x acceleration (use 5x)
    const crisisUrgency = crypto.crisisSeverity; // Higher severity → more urgency
    investmentMultiplier = 1 + 4 * crisisUrgency; // 1x (no crisis) to 5x (full crisis)

    if (pqc.deploymentProgress < 0.1 && crypto.monthsSinceCrisisStart === 1) {
      // First month of crisis - emergency declaration
      console.log(`\n🚨 EMERGENCY: Post-Quantum Cryptography Deployment Accelerated`);
      console.log(`  Crisis severity: ${(crypto.crisisSeverity * 100).toFixed(0)}%`);
      console.log(`  Investment boost: ${investmentMultiplier.toFixed(1)}x`);
      console.log(`  Current deployment: ${(pqc.deploymentProgress * 100).toFixed(0)}%`);

      events.push({
        id: state.eventIdCounter++,
        type: 'response',
        month: state.currentMonth,
        title: 'Emergency PQC Deployment Program',
        description: `Government and industry launch emergency post-quantum cryptography deployment. ${investmentMultiplier.toFixed(1)}x funding increase to replace broken encryption.`,
        severity: 'major'
      });
    }
  } else if (!crypto.pqcStandardsPublished) {
    // PRE-STANDARDS: Low investment (research phase)
    investmentMultiplier = 0.15; // $1B/year research
  } else {
    // POST-STANDARDS, PRE-CRISIS: Proactive gradual transition
    investmentMultiplier = 1.0; // Baseline $7.1B
  }

  crypto.pqcInvestment = baseInvestment * investmentMultiplier;

  assertFinite(crypto.pqcInvestment, {
    location: 'PostQuantumTransitionPhase',
    valueName: 'pqcInvestment',
    month: state.currentMonth,
    additionalInfo: { investmentMultiplier, crisisActive: crypto.cryptographicCrisisActive }
  });

  // --- 2. Progress PQC deployment ---
  // Deployment rate scales with investment, but has diminishing returns due to barriers
  // (hardware compatibility, training, testing, coordination challenges)
  const normalizedInvestment = crypto.pqcInvestment / baseInvestment;

  // Barriers create diminishing returns: effective progress = sqrt(investment)
  // This models the fact that throwing money at coordination problems has limits
  const effectiveProgress = Math.sqrt(normalizedInvestment);

  // Monthly progress (1/360 at baseline, accelerated by investment)
  const monthlyProgress = (1 / baselineMonths) * effectiveProgress;

  pqc.deploymentProgress += monthlyProgress;
  pqc.deploymentProgress = Math.min(1.0, pqc.deploymentProgress);

  assertInRange(pqc.deploymentProgress, 0, 1, {
    location: 'PostQuantumTransitionPhase',
    valueName: 'deploymentProgress',
    month: state.currentMonth
  });

  // Update investment tracking
  const monthlyInvestmentSpent = crypto.pqcInvestment / 12; // Annual → monthly
  pqc.investmentSpent += monthlyInvestmentSpent;

  // Update years to completion (linear extrapolation)
  if (monthlyProgress > 0.001) {
    const remainingProgress = 1.0 - pqc.deploymentProgress;
    const estimatedMonthsRemaining = remainingProgress / monthlyProgress;
    pqc.yearsToCompletion = estimatedMonthsRemaining / 12;
  } else {
    pqc.yearsToCompletion = 999; // Effectively stalled
  }

  // Deployment barriers decrease as deployment progresses (learning effects)
  pqc.barrierSeverity = Math.max(
    0.2, // Floor: 20% (some barriers always remain)
    pqc.barrierSeverity * 0.99 // 1% reduction per month (learning/tooling improves)
  );

  // --- 3. Crisis mitigation (PQC deployment reduces crisis severity) ---
  if (crypto.cryptographicCrisisActive) {
    // Mitigation rate scales with deployment progress
    // At 100% deployment: 10% reduction per month
    const mitigationRate = pqc.deploymentProgress * 0.1;

    crypto.crisisSeverity = Math.max(
      0,
      crypto.crisisSeverity * (1 - mitigationRate)
    );

    // Crisis resolution check: >80% deployment AND <10% severity
    if (pqc.deploymentProgress > 0.8 && crypto.crisisSeverity < 0.1) {
      crypto.cryptographicCrisisActive = false;
      crypto.crisisSeverity = 0;

      const deploymentPercent = (pqc.deploymentProgress * 100).toFixed(0);
      const monthsToResolve = crypto.monthsSinceCrisisStart;
      const totalCost = pqc.investmentSpent;

      console.log(`\n✅ CRISIS RESOLVED: Post-Quantum Cryptography Deployed (Month ${state.currentMonth})`);
      console.log(`  Deployment: ${deploymentPercent}% complete`);
      console.log(`  Crisis duration: ${monthsToResolve} months`);
      console.log(`  Total cost: $${totalCost.toFixed(1)}B`);
      console.log(`  → Digital infrastructure secured with quantum-resistant encryption`);
      console.log(`  → Banking, commerce, identity systems restored`);

      events.push({
        id: state.eventIdCounter++,
        type: 'resolution',
        month: state.currentMonth,
        title: '✅ Cryptographic Crisis Resolved',
        description: `Post-quantum cryptography deployed (${deploymentPercent}%). Digital infrastructure secured. Crisis resolved after ${monthsToResolve} months and $${totalCost.toFixed(1)}B investment.`,
        severity: 'info'
      });

      // Partial trust restoration (but never full recovery)
      // Research: Trust losses from security failures are partially permanent
      const trustRecovery = 0.1; // Recover 10% of lost trust
      if (state.globalMetrics.digitalInfrastructureTrust) {
        state.globalMetrics.digitalInfrastructureTrust = Math.min(
          0.8, // Cap at 80% (never full recovery to pre-crisis baseline)
          state.globalMetrics.digitalInfrastructureTrust + trustRecovery
        );
      }
    }
  }

  // --- 4. Economic costs of PQC deployment ---
  // Direct cost: Investment spending
  // Opportunity cost: Resources diverted from other priorities
  const population = state.humanPopulationSystem?.population ?? 8.0;
  const perCapitaCost = (monthlyInvestmentSpent * 1e9) / (population * 1e9); // $B → $ per person

  state.globalMetrics.gdpPerCapita = Math.max(
    1000, // Floor: $1k per capita
    state.globalMetrics.gdpPerCapita - perCapitaCost
  );

  // --- 5. Milestone reporting ---
  const deploymentMilestones = [0.25, 0.5, 0.75, 0.95];
  for (const milestone of deploymentMilestones) {
    if (initialDeployment < milestone && pqc.deploymentProgress >= milestone) {
      const milestonePercent = (milestone * 100).toFixed(0);

      console.log(`\n🔐 PQC Deployment Milestone: ${milestonePercent}%`);
      console.log(`  Investment: $${pqc.investmentSpent.toFixed(1)}B spent`);
      console.log(`  Years to completion: ${pqc.yearsToCompletion.toFixed(1)}`);

      if (crypto.cryptographicCrisisActive) {
        console.log(`  Crisis severity: ${(crypto.crisisSeverity * 100).toFixed(0)}% (mitigating)`);
      }

      events.push({
        id: state.eventIdCounter++,
        type: 'milestone',
        month: state.currentMonth,
        title: `PQC Deployment: ${milestonePercent}% Complete`,
        description: `Post-quantum cryptography deployment reaches ${milestonePercent}%. $${pqc.investmentSpent.toFixed(1)}B invested. Digital infrastructure transition progressing.`,
        severity: 'info'
      });
    }
  }

  }

