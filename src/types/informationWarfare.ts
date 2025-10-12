/**
 * Information Warfare & Epistemology System
 * TIER 4.3: Truth decay, deepfakes, narrative control
 * 
 * Research Basis:
 * - MIT Media Lab (2024): AI-generated content detection
 * - Oxford Internet Institute (2024): Computational propaganda research
 * - Stanford Internet Observatory (2024-2025): Platform manipulation reports
 * - Knight Foundation (2024): Trust in media declining
 * - Pew Research (2024): 73% of Americans see "made-up news" online
 * - RAND (2024): Truth Decay framework
 */

export interface InformationWarfareSystem {
  // === CORE METRICS ===
  
  /**
   * Information Integrity [0,1]
   * How much can society distinguish truth from fiction?
   * 1.0 = High trust media, fact-checking works, shared reality
   * 0.5 = Contested narratives, polarized sources
   * 0.0 = Post-truth, can't agree on basic facts
   * 
   * Research: Knight Foundation (2024) - Trust in news declining
   */
  informationIntegrity: number;
  
  /**
   * Deepfake Prevalence [0,1]
   * Saturation of AI-generated synthetic content
   * 0.0 = Rare, easily detected
   * 0.5 = Common, detection difficult
   * 1.0 = Ubiquitous, detection impossible
   * 
   * Research: MIT (2024) - AI detection arms race
   */
  deepfakePrevalence: number;
  
  /**
   * Epistemological Crisis Level [0,1]
   * Can society function without shared truth?
   * 0.0 = Shared reality, common facts
   * 0.5 = Polarized bubbles, competing realities
   * 1.0 = Total breakdown, no consensus possible
   * 
   * Research: RAND Truth Decay (2024)
   */
  epistemologicalCrisisLevel: number;
  
  // === NARRATIVE CONTROL ===
  
  /**
   * Narrative control by different actors
   * Who controls the story? Affects policy, trust, coordination
   */
  narrativeControl: {
    government: number;      // [0,1] Government messaging power
    corporations: number;    // [0,1] Corporate media influence
    aiAgents: number;        // [0,1] AI-generated narratives
    grassroots: number;      // [0,1] Organic social movements
  };
  
  // === DEFENSES ===
  
  /**
   * Detection Capability [0,1]
   * How well can we detect fake content?
   * Degrades as AI improves
   */
  detectionCapability: number;
  
  /**
   * Media Literacy [0,1]
   * Population's ability to critically evaluate info
   */
  mediaLiteracy: number;
  
  /**
   * Fact-Checking Investment [0,10]
   * Resources dedicated to verification
   */
  factCheckingInvestment: number;
  
  // === IMPACTS ===
  
  /**
   * Coordination Penalty [0,1]
   * How much does info warfare impair cooperation?
   * High crisis → hard to coordinate on solutions
   */
  coordinationPenalty: number;
  
  /**
   * Trust Erosion Rate
   * How fast is trust declining due to info warfare?
   */
  trustErosionRate: number;
  
  /**
   * Dystopia Enablement [0,1]
   * Low info integrity makes authoritarianism easier
   * "Flood the zone with shit" strategy
   */
  dystopiaEnablement: number;
}

/**
 * Initialize information warfare system
 * Starting values reflect 2025 reality
 */
export function initializeInformationWarfare(): InformationWarfareSystem {
  return {
    // === 2025 STARTING VALUES ===
    // Research: Already significant trust crisis, deepfakes emerging
    
    informationIntegrity: 0.55, // Knight Foundation: Trust declining, polarized
    deepfakePrevalence: 0.10, // Still relatively rare in 2025, but growing
    epistemologicalCrisisLevel: 0.30, // Pew: 73% see "made-up news", polarization high
    
    narrativeControl: {
      government: 0.25,      // Moderate government messaging power
      corporations: 0.40,    // Corporate media still dominant
      aiAgents: 0.05,        // Just beginning (chatbots, recommendation algorithms)
      grassroots: 0.30,      // Social media enables grassroots narratives
    },
    
    detectionCapability: 0.60, // Detection tech exists but imperfect
    mediaLiteracy: 0.40, // Pew: Most Americans struggle with media literacy
    factCheckingInvestment: 2.0, // [0,10] scale, modest investment
    
    coordinationPenalty: 0.15, // Already some coordination difficulty
    trustErosionRate: 0.005, // 0.5%/month baseline erosion
    dystopiaEnablement: 0.20, // Some authoritarian enablement already
  };
}

