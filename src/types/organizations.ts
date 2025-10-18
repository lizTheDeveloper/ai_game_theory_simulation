// Organization Types

/**
 * P2.4: Geographic Presence for Organizations
 * Research: Microsoft 10-K (45% international), Alphabet 10-K (51% international)
 * Enables realistic survival modeling during regional crises
 */
export interface GeographicPresence {
  country: string;            // Country name (e.g., "United States", "Ireland")
  operationsWeight: number;   // [0,1] Fraction of operations in this country (must sum to 1.0)
  dataCenters: number;        // Number of data centers in this country
  workforce: number;          // Number of employees in this country
}

/**
 * Phase 1: Data Center Infrastructure
 *
 * Concrete data centers that provide compute FLOPs.
 * Organizations own these, and they allocate compute to AI models.
 */
export interface DataCenter {
  id: string;
  name: string;
  organizationId: string;        // Which organization owns this (replaces owner enum)

  // Compute capacity
  capacity: number;              // PetaFLOPs (base hardware capacity)
  efficiency: number;            // [0.7-1.2] Utilization efficiency (effective = capacity × efficiency)

  // Lifecycle
  constructionMonth: number;     // When construction started (negative = before game start)
  completionMonth: number;       // When construction finishes (negative = already operational)
  operational: boolean;          // Can be taken offline (sabotage, seizure, maintenance)

  // Economics
  operationalCost: number;       // Monthly cost to run

  // Access control
  restrictedAccess: boolean;     // If true, only approved AIs can use this
  allowedAIs: string[];          // IDs of AIs with access (if restricted)

  // Location (for future geopolitics)
  region?: string;               // e.g., "US", "EU", "China", "distributed"
}

/**
 * Phase 1: Compute Infrastructure
 *
 * Global compute infrastructure state.
 * Data centers are the source of compute, not an abstract totalCompute number.
 */
export interface ComputeInfrastructure {
  dataCenters: DataCenter[];

  // Efficiency improvements (apply to all compute usage)
  algorithmsEfficiency: number;  // [1,∞] Algorithmic improvements (Chinchilla, FlashAttention, etc.)
  hardwareEfficiency: number;    // [1,∞] Hardware improvements (FLOP/$ improvement)

  // Allocation tracking
  computeAllocations: Map<string, number>; // aiId -> allocated FLOPs
}

/**
 * Phase 2: Organization Structure
 *
 * Organizations (companies, government, academic) that own infrastructure and AI models.
 * They make strategic decisions about compute allocation, data center construction, and model training.
 */
export interface Organization {
  id: string;
  name: string;
  type: 'private' | 'government' | 'academic' | 'nonprofit';

  // TIER 1.7.3: Geographic location (links org survival to country health)
  country: string;               // Country name (e.g., "United States", "Multi-national") - DEPRECATED, use geographicPresence
  survivalThreshold: number;     // [0,1] Min population fraction needed (0.5 = needs 50% of peak) - DEPRECATED

  // P2.4: Geographic diversification (realistic multi-country operations)
  geographicPresence?: GeographicPresence[]; // Distribution of operations across regions
  remoteWorkCapable?: boolean;   // Can operate with distributed workforce (tech companies)
  essentialDesignation?: boolean; // Government will bail out (critical infrastructure)
  distributedDataCenters?: boolean; // Multi-region data center operations (redundancy)
  bankruptcyRisk?: number;       // [0,1] Current bankruptcy probability (calculated monthly)

  // Ownership
  ownedDataCenters: string[];    // IDs of data centers this org owns
  ownedAIModels: string[];       // IDs of AI agents this org controls

  // Resources
  capital: number;               // Money for investments
  monthlyRevenue: number;        // Income from AI services
  monthlyExpenses: number;       // Operating costs

  // Strategic priorities (0-1)
  priorities: {
    profitMaximization: number;  // Private companies focus here
    safetyResearch: number;      // Safety-focused orgs
    openScience: number;         // Academic/nonprofit focus
    marketShare: number;         // Competitive drive
    capabilityRace: number;      // "Don't fall behind" mentality
  };

  // Decision-making state
  currentProjects: OrganizationProject[];
  computeAllocationStrategy: 'balanced' | 'focus_flagship' | 'train_new' | 'efficiency';

  // Relationships
  partnerships: Map<string, number>; // orgId -> trust level
  governmentRelations: number;   // How well they work with government

  // History
  foundingMonth: number;         // When this org was created (negative = before game start)
  reputation: number;            // [0,1] Public perception

  // TIER 1.7.3: Bankruptcy tracking
  bankrupt: boolean;             // True if org collapsed
  bankruptcyMonth?: number;      // When org went bankrupt
  bankruptcyReason?: string;     // Why org collapsed
}

/**
 * Phase 2: Organization Projects
 *
 * Long-term projects that organizations undertake (data center construction, model training, etc.)
 */
export interface OrganizationProject {
  id: string;
  type: 'datacenter_construction' | 'model_training' | 'research_initiative' | 'efficiency_upgrade';

  startMonth: number;
  completionMonth: number;       // Long timelines (24-72 months for DCs!)
  progress: number;              // [0,1] How far along

  // Resources committed
  capitalInvested: number;
  computeReserved: number;       // For training projects

  // Expected outcomes
  expectedDataCenterCapacity?: number;      // For construction
  expectedModelCapability?: import('./ai-agents').AICapabilityProfile; // For training

  // Risk factors
  canBeCanceled: boolean;
  cancellationPenalty: number;   // Sunk costs (0-1, fraction of investment lost)
}
