/**
 * Quantum Computing Type Definitions
 *
 * Types for quantum computing system state and related systems.
 * Research: research/quantum_computing_cascades_20251210.md
 */

/**
 * Quantum Algorithm Support
 *
 * Flags for different quantum algorithm capabilities.
 */
export interface QuantumAlgorithmSupport {
  /** Grover's algorithm support (100+ logical qubits) */
  grovers: boolean;

  /** Shor's algorithm support (cryptanalysis) */
  shors: boolean;

  /** Quantum chemistry algorithms (1,000+ qubits) */
  quantumChemistry: boolean;

  /** Quantum machine learning algorithms (500+ qubits) */
  quantumML: boolean;
}

/**
 * Quantum Computing State
 *
 * Tracks quantum hardware progress and algorithm support.
 */
export interface QuantumComputingState {
  /** Number of logical (error-corrected) qubits */
  logicalQubits: number;

  /** Quantum algorithm support flags */
  algorithmSupport: QuantumAlgorithmSupport;
}

/**
 * Quantum-AI Integration State
 *
 * Tracks quantum computing's impact on AI capabilities.
 */
export interface QuantumAIIntegrationState {
  /** Whether quantum-AI advantage is active */
  active: boolean;

  /** Whether quantum advantage has been demonstrated */
  demonstratedAdvantage: boolean;

  /** Month when advantage was first demonstrated */
  advantageMonth: number | null;

  /** Capability multipliers by AI dimension */
  capabilityMultipliers: {
    physical: number;
    research: number;
    digital: number;
    cognitive: number;
  };
}

/**
 * Cryptography Security State
 *
 * Tracks cryptographic security status in the quantum era.
 */
export interface CryptographySecurityState {
  /** Overall crypto security status */
  status: CryptoStatus;

  /** Post-quantum transition progress */
  postQuantumTransition: PostQuantumTransitionState;
}

/**
 * Cryptographic Security Status
 */
export type CryptoStatus =
  | 'SECURE'           // Pre-quantum era, classical crypto sufficient
  | 'TRANSITIONING'    // Post-quantum migration in progress
  | 'COMPROMISED'      // Classical crypto broken, systems vulnerable
  | 'POST_QUANTUM';    // Fully migrated to post-quantum cryptography

/**
 * Post-Quantum Cryptography Transition State
 */
export interface PostQuantumTransitionState {
  /** Progress towards full post-quantum migration (0-1) */
  progress: number;

  /** Critical infrastructure migrated to post-quantum crypto */
  criticalInfraMigrated: boolean;

  /** Financial systems migrated */
  financialSystemsMigrated: boolean;

  /** Government systems migrated */
  governmentSystemsMigrated: boolean;
}

/**
 * Overall Quantum System State
 *
 * Top-level quantum computing system state.
 */
export interface QuantumSystemState {
  /** Quantum computing hardware and algorithms */
  quantumComputing: QuantumComputingState;

  /** Quantum-AI integration */
  quantumAI: QuantumAIIntegrationState;

  /** Cryptography security */
  cryptography?: CryptographySecurityState;
}

/**
 * Initialize Quantum System State
 *
 * Creates initial quantum system state with default values.
 */
export function createInitialQuantumState(): QuantumSystemState {
  return {
    quantumComputing: {
      logicalQubits: 0,
      algorithmSupport: {
        grovers: false,
        shors: false,
        quantumChemistry: false,
        quantumML: false,
      },
    },
    quantumAI: {
      active: false,
      demonstratedAdvantage: false,
      advantageMonth: null,
      capabilityMultipliers: {
        physical: 1.0,
        research: 1.0,
        digital: 1.0,
        cognitive: 1.0,
      },
    },
    cryptography: {
      status: 'SECURE',
      postQuantumTransition: {
        progress: 0,
        criticalInfraMigrated: false,
        financialSystemsMigrated: false,
        governmentSystemsMigrated: false,
      },
    },
  };
}
