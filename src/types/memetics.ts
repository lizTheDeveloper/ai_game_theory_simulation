/**
 * P2.6: Memetic Evolution & Polarization Dynamics
 * 
 * Research-backed system modeling belief evolution, meme transmission, and societal fragmentation.
 * TRL 6-7 (validated against 2024-2025 peer-reviewed studies)
 * 
 * Key Papers:
 * - Expert Systems with Applications (2024): Multi-agent opinion dynamics
 * - npj Complexity (2024): Affective polarization in online networks
 * - Physical Review Research (2025): Depolarization mechanisms
 * - Scientific Reports (2021): Meme evolution entropy
 * 
 * @see plans/p2-6-memetic-polarization-dynamics.md
 */

/**
 * Multi-dimensional belief space
 * Each dimension ranges from -1 (strongly negative) to +1 (strongly positive)
 */
export interface BeliefVector {
  aiTrust: number;              // Trust in AI development (-1 to 1)
  climateConcern: number;       // Climate urgency (-1 to 1)
  techAdoption: number;         // Willingness to adopt new tech (-1 to 1)
  governmentTrust: number;      // Trust in government institutions (-1 to 1)
  economicOptimism: number;     // Economic outlook (-1 to 1)
  socialProgressive: number;    // Social conservatism (-1) to progressivism (1)
  globalismNationalism: number; // Globalism (1) to nationalism (-1)
  collectivismIndividualism: number; // Collectivism (-1) to individualism (1)
}

/**
 * Population segment with shared beliefs and network connections
 * Replaces monolithic society with heterogeneous belief clusters
 */
export interface MemeticSegment {
  id: string;
  name: string;                   // e.g., "AI Optimists", "Tech Skeptics", "Luddites"
  
  // Demographics
  size: number;                   // Population fraction (0-1)
  medianAge: number;
  education: number;              // Average education level (0-1)
  urbanization: number;           // Urban (1) vs rural (0)
  
  // Beliefs (multi-dimensional)
  beliefs: BeliefVector;
  
  // Cognitive properties
  susceptibilityToMemes: number;  // How easily influenced by new memes (0-1)
  memeticImmunity: number;        // Resistance to belief change (0-1)
  confirmationBias: number;       // Preference for confirming info (0-1)
  confidenceThreshold: number;    // Only interact with beliefs within threshold
  
  // Network structure
  connections: Map<string, number>; // Connections to other segments (segment_id → strength)
  internalCohesion: number;       // Strength of within-group ties (0-1)
  
  // AI-specific
  aiToolUsage: number;            // Usage of AI tools (0-1)
  deepfakeVulnerability: number;  // Susceptibility to deepfakes (0-1)
}

/**
 * Discrete information unit that spreads through network
 * Memes evolve through mutation and selection
 */
export interface Meme {
  id: string;
  
  // Classification
  contentType: 
    | 'pro_ai' 
    | 'anti_ai' 
    | 'ai_safety' 
    | 'climate_action' 
    | 'climate_denial' 
    | 'tech_optimism' 
    | 'tech_skepticism'
    | 'conspiracy'
    | 'fact_based'
    | 'propaganda';
  
  // Transmission properties
  fitness: number;                // Transmission probability (0-1)
  emotionalValence: number;       // Emotional intensity (-1 to 1)
  novelty: number;                // How new/surprising (0-1, decays with time)
  complexity: number;             // Cognitive load (0-1, higher = harder to transmit)
  
  // Prevalence by segment
  prevalence: Map<string, number>; // segment_id → adoption_rate
  
  // Evolution tracking
  generation: number;             // How many mutations from origin
  mutationHistory: string[];      // IDs of ancestor memes
  createdMonth: number;
  
  // Source
  source: 'organic' | 'ai_generated' | 'state_propaganda' | 'grassroots';
  credibility: number;            // Perceived trustworthiness (0-1)
  
  // Effects on beliefs (which dimensions does this meme push?)
  beliefEffects: Partial<BeliefVector>;
}

/**
 * Social network structure
 * Scale-free (power-law degree distribution) with community structure
 */
export interface SocialNetwork {
  // Network properties
  averageDegree: number;          // Mean connections per agent
  clusteringCoefficient: number;  // Friends-of-friends clustering
  modularity: number;             // Community isolation (0-1)
  
  // Edge dynamics
  edgeFormationRate: number;      // New connections per month
  edgeDissolutionRate: number;    // Broken connections per month
  homophilyStrength: number;      // Preference for similar beliefs (0-1)
  
  // Cross-cutting ties
  crossCuttingTies: number;       // Connections across belief clusters (0-1)
  bridgingCapital: number;        // Network integration (high = diverse connections)
}

/**
 * Polarization metrics
 * Multiple dimensions of societal fragmentation
 */
export interface PolarizationMetrics {
  // Opinion dispersion
  opinionVariance: number;        // Variance across all belief dimensions
  beliefDistance: number;         // Average distance between segments
  
  // Network structure
  echoChambersStrength: number;   // Ratio internal/external connections
  networkFragmentation: number;   // How disconnected the network is
  
  // Affective polarization (emotional dislike)
  affectivePolarization: number;  // Distrust/dislike of out-groups (0-1)
  tribalism: number;              // In-group favoritism (0-1)
  
  // Trends (early warning signals)
  varianceTrend: number;          // dVariance/dt (>0 = polarizing)
  crossGroupInteractionTrend: number; // dCrossGroup/dt (<0 = fragmenting)
  
  // Critical state indicators
  nearCriticalTransition: boolean; // Approaching tipping point
  estimatedMonthsToTransition: number; // Predicted collapse time
}

/**
 * Main memetic system state
 * Tracks population segments, active memes, network structure, and polarization
 */
export interface MemeticSystem {
  // Population structure
  segments: MemeticSegment[];
  
  // Active memes
  activeMemes: Meme[];
  memeLifespan: number;           // Avg months before meme dies
  totalMemesCreated: number;      // Lifetime counter
  
  // Network
  network: SocialNetwork;
  
  // Polarization state
  polarization: PolarizationMetrics;
  socialCohesion: number;         // Inverse of polarization (0-1)
  
  // AI amplification (increases with AI capabilities)
  algorithmicAmplification: number; // Social media algorithm boost (1.0-5.0x)
  botInfluence: number;           // Fraction of "agents" that are bots (0-1)
  deepfakePrevalence: number;     // Deepfake exposure rate (0-1)
  
  // Historical tracking
  polarizationHistory: number[];  // Monthly polarization values
  cohesionHistory: number[];      // Monthly social cohesion
  
  // Events
  lastPolarizationSpike: number;  // Month of last sudden increase
  polarizationCrisisActive: boolean; // Crossed critical threshold
}

/**
 * Parameters for memetic system (research-backed values)
 */
export interface MemeticSystemParams {
  // Population
  numSegments: number;            // How many belief clusters (default: 5-8)
  
  // Network structure
  networkType: 'scale_free' | 'small_world' | 'random';
  averageDegree: number;          // Mean connections (default: 50)
  clusteringCoefficient: number;  // Clustering (default: 0.3)
  initialModularity: number;      // Community structure (default: 0.4)
  
  // Cognitive model
  beliefDimensions: number;       // How many belief axes (default: 8)
  updateRule: 'bounded_confidence' | 'voter_model' | 'degroot';
  confidenceThreshold: number;    // Only interact within threshold (default: 0.3)
  meanSusceptibility: number;     // Average meme susceptibility (default: 0.5)
  meanConfirmationBias: number;   // Average confirmation bias (default: 0.7)
  
  // Meme evolution
  mutationRate: number;           // Mutation during transmission (default: 0.05)
  selectionPressure: number;      // Fitness advantage (default: 0.8)
  baseTransmissionProb: number;   // Base transmission chance (default: 0.3)
  memeDecayRate: number;          // Monthly decay in novelty (default: 0.1)
  
  // Polarization thresholds
  polarizationWarning: number;    // Warning threshold (default: 0.6)
  polarizationCrisis: number;     // Crisis threshold (default: 0.8)
  
  // AI effects
  aiAmplificationFactor: number;  // AI capability → amplification (default: 2.0)
  deepfakeEffectiveness: number;  // Fraction fooled (default: 0.4)
  botThreshold: number;           // AI capability for bots (default: 2.5)
}

