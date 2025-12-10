import { GameState, GameEvent, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { QuantumAdvantageLevel } from '@/types/quantum-computing';
import { assertFinite, assertInRange } from '@/simulation/utils/assertions';

/**
 * Quantum Computing Phase (L-3, Dec 10, 2025)
 *
 * Models quantum computing progression from NISQ era to fault-tolerant quantum computing (FTQC).
 * Tracks logical qubit scaling, error rate improvement, and breakthrough detection.
 *
 * Order: TBD (After AI capabilities, before cryptography security)
 *
 * Research Foundation:
 * - Logical qubit doubling time: 18-24 months (current industry pace)
 * - Shor's threshold: 1,730 logical qubits (RSA-2048 breaking)
 * - General advantage: 10,000+ logical qubits
 * - Timeline: 2032-2045 realistic (vendor roadmaps 2028-2035 optimistic)
 * - Investment baseline: $2B/year (2024)
 * - Research: research/quantum_computing_cascades_20251210.md (38 sources, Grade B+)
 *
 * Key Dynamics:
 * 1. Investment drives logical qubit scaling (18-24 month doubling at baseline)
 * 2. Error rates improve asymptotically toward 1e-7 threshold
 * 3. Algorithm capabilities unlock at qubit thresholds (100, 500, 1000, 1730, 10000)
 * 4. Quantum-AI enhancement activates when quantum simulation practical
 *
 * Expected Impact:
 * - Cryptographic security crises (when Shor's algorithm practical)
 * - AI capability jumps (quantum-accelerated research)
 * - Late-game economic shocks (years 10-30)
 */
export function executeQuantumComputingPhase(
  state: GameState,
  rng: RNGFunction,
  context: PhaseContext
): PhaseResult {
  const events: GameEvent[] = [];

  // Initialize quantum system if not exists
  if (!state.quantumSystem) {
    console.log(`\n⚠️ WARNING: quantumSystem not initialized, skipping QuantumComputingPhase`);
    return { events, monthlyReport: {} };
  }

  if (!rng || typeof rng !== 'function') {
    throw new Error('❌ CRITICAL: RNG required for deterministic simulation (QuantumComputingPhase)');
  }

  const quantum = state.quantumSystem.quantumComputing;
  const initialLogicalQubits = quantum.logicalQubits;

  // --- 1. Calculate quantum R&D investment ---
  // Investment driven by AI research capabilities and economic capacity
  const baseInvestment = 2.0; // $2B baseline (2024)

  // AI research capability multiplier (more capable AI → faster quantum progress)
  const aiMultiplier = Math.min(3.0, 1.0 + (state.ai.capabilities.research / 10.0));

  // Economic capacity multiplier (higher GDP per capita → more funding)
  const economicMultiplier = state.economics.gdpPerCapita > 20000 ? 1.5 : 1.0;

  // Government prioritization (if quantum computing is prioritized)
  const govMultiplier = state.government.priorities?.quantumComputing ? 1.5 : 1.0;

  quantum.annualInvestment = baseInvestment * aiMultiplier * economicMultiplier * govMultiplier;

  assertFinite(quantum.annualInvestment, {
    location: 'QuantumComputingPhase',
    valueName: 'annualInvestment',
    month: state.currentMonth,
    additionalInfo: { aiMultiplier, economicMultiplier, govMultiplier }
  });

  // --- 2. Progress logical qubit scaling ---
  // Research: 18-24 month doubling time at baseline ($2B investment)
  // Monthly growth rate for 20-month doubling: 2^(1/20) - 1 ≈ 3.5%
  const baseMonthlyGrowthRate = Math.pow(2, 1/20) - 1; // ~0.035

  // Investment scaling (linear with investment)
  const investmentScaling = quantum.annualInvestment / baseInvestment;

  // Apply growth (with diminishing returns above 3x investment)
  const effectiveScaling = investmentScaling > 3.0
    ? 3.0 + Math.log(investmentScaling / 3.0)
    : investmentScaling;

  const monthlyGrowth = baseMonthlyGrowthRate * effectiveScaling;
  quantum.logicalQubits *= (1 + monthlyGrowth);

  assertFinite(quantum.logicalQubits, {
    location: 'QuantumComputingPhase',
    valueName: 'logicalQubits',
    month: state.currentMonth,
    additionalInfo: { monthlyGrowth, investmentScaling }
  });

  // --- 3. Improve error rates ---
  // Asymptotic improvement toward 1e-7 threshold (required for error correction)
  const errorRateTarget = 1e-7;
  const errorRateDecay = 0.05; // 5% improvement per month (exponential decay)

  quantum.errorRate =
    errorRateTarget + (quantum.errorRate - errorRateTarget) * (1 - errorRateDecay);

  assertInRange(quantum.errorRate, 1e-7, 1e-2, {
    location: 'QuantumComputingPhase',
    valueName: 'errorRate',
    month: state.currentMonth
  });

  // --- 4. Detect algorithm capability thresholds ---
  const logicalQubits = quantum.logicalQubits;
  const alg = quantum.algorithmSupport;

  // Grover's algorithm (100+ logical qubits) - Database search, optimization
  if (logicalQubits >= 100 && !alg.grovers) {
    alg.grovers = true;
    quantum.quantumAdvantageLevel = QuantumAdvantageLevel.Basic;

    console.log(`\n🔬💡 QUANTUM BREAKTHROUGH: Grover's algorithm practical (${Math.floor(logicalQubits)} logical qubits)`);
    console.log(`  ✓ Database search speedup (√N)`);
    console.log(`  ✓ Optimization algorithms enabled`);
    console.log(`  → Quantum-AI enhancement will activate`);

    events.push({
      id: state.eventIdCounter++,
      type: 'breakthrough',
      month: state.currentMonth,
      title: 'Quantum Computing: Grover\'s Algorithm',
      description: `Grover's algorithm practical with ${Math.floor(logicalQubits)} logical qubits. Quantum speedup for search and optimization problems demonstrated.`,
      severity: 'info'
    });
  }

  // Quantum Machine Learning (500+ logical qubits)
  if (logicalQubits >= 500 && !alg.quantumML) {
    alg.quantumML = true;

    console.log(`\n🔬🤖 QUANTUM ML ENABLED: ${Math.floor(logicalQubits)} logical qubits`);
    console.log(`  ✓ Quantum kernel methods`);
    console.log(`  ✓ Variational quantum eigensolver (VQE)`);
    console.log(`  → AI research capabilities enhanced`);

    events.push({
      id: state.eventIdCounter++,
      type: 'breakthrough',
      month: state.currentMonth,
      title: 'Quantum Machine Learning Unlocked',
      description: `Quantum ML algorithms practical. AI research acceleration expected.`,
      severity: 'info'
    });
  }

  // Quantum Chemistry (1,000+ logical qubits) - Molecular simulation
  if (logicalQubits >= 1000 && !alg.quantumChemistry) {
    alg.quantumChemistry = true;

    console.log(`\n🔬⚗️ QUANTUM CHEMISTRY ENABLED: ${Math.floor(logicalQubits)} logical qubits`);
    console.log(`  ✓ Molecular simulation`);
    console.log(`  ✓ Drug discovery acceleration (10-20x)`);
    console.log(`  ✓ Materials science speedup`);
    console.log(`  → Physical sciences AI capabilities boosted`);

    events.push({
      id: state.eventIdCounter++,
      type: 'breakthrough',
      month: state.currentMonth,
      title: 'Quantum Chemistry Simulation',
      description: `Quantum computers can now simulate molecular systems. Drug discovery and materials science accelerated.`,
      severity: 'info'
    });
  }

  // Shor's Algorithm (1,730+ logical qubits) - CRITICAL THRESHOLD (RSA breaking)
  if (logicalQubits >= 1730 && !alg.shors) {
    alg.shors = true;
    quantum.breakthroughAchieved = true;
    quantum.breakthroughMonth = state.currentMonth;
    quantum.quantumAdvantageLevel = QuantumAdvantageLevel.Shors;

    console.log(`\n☢️🔬 CRITICAL QUANTUM BREAKTHROUGH: Shor's algorithm practical`);
    console.log(`  Logical qubits: ${Math.floor(logicalQubits)}`);
    console.log(`  ⚠️ RSA-2048 breaking capability achieved`);
    console.log(`  ⚠️ Elliptic curve cryptography vulnerable`);
    console.log(`  🚨 CRYPTOGRAPHIC CRISIS IMMINENT`);
    console.log(`  → CryptographySecurityPhase will detect crisis`);

    events.push({
      id: state.eventIdCounter++,
      type: 'crisis',
      month: state.currentMonth,
      title: '🚨 Shor\'s Algorithm: Crypto Breaking Capability',
      description: `Quantum computers can now factor RSA-2048 and break elliptic curve cryptography. Banking, commerce, and identity systems at risk. Post-quantum cryptography deployment urgent.`,
      severity: 'critical'
    });
  }

  // General Quantum Advantage (10,000+ logical qubits)
  if (logicalQubits >= 10000 && !alg.generalAdvantage) {
    alg.generalAdvantage = true;
    quantum.quantumAdvantageLevel = QuantumAdvantageLevel.General;

    console.log(`\n🔬✨ GENERAL QUANTUM ADVANTAGE: Broad computational supremacy`);
    console.log(`  Logical qubits: ${Math.floor(logicalQubits)}`);
    console.log(`  ✓ Quantum advantage across problem classes`);
    console.log(`  ✓ AI capabilities significantly enhanced`);
    console.log(`  ✓ Scientific simulation accelerated`);

    events.push({
      id: state.eventIdCounter++,
      type: 'breakthrough',
      month: state.currentMonth,
      title: 'General Quantum Advantage Achieved',
      description: `Quantum computers demonstrate broad advantage across problem classes. Scientific and technological progress accelerated.`,
      severity: 'info'
    });
  }

  // --- 5. Progress tracking ---
  quantum.researchProgress = Math.min(1.0, quantum.logicalQubits / 10000); // 0-1 scale

  // --- 6. Generate monthly report ---
  const qubitChange = quantum.logicalQubits - initialLogicalQubits;
  const monthlyReport: Record<string, number> = {
    'Quantum: Logical Qubits': Math.floor(quantum.logicalQubits),
    'Quantum: Investment ($B/yr)': quantum.annualInvestment,
    'Quantum: Error Rate': quantum.errorRate,
  };

  if (qubitChange > 1) {
    console.log(`\n🔬 Quantum Computing Progress:`);
    console.log(`  Logical qubits: ${Math.floor(initialLogicalQubits)} → ${Math.floor(quantum.logicalQubits)} (+${qubitChange.toFixed(1)})`);
    console.log(`  Error rate: ${quantum.errorRate.toExponential(2)}`);
    console.log(`  Investment: $${quantum.annualInvestment.toFixed(1)}B/year`);
    console.log(`  Advantage level: ${QuantumAdvantageLevel[quantum.quantumAdvantageLevel]}`);
  }

  return { events, monthlyReport };
}
