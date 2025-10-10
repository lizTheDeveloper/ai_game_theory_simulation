/**
 * National AI Capabilities & Asymmetry System
 * 
 * USER INSIGHT: "It's capability asymmetry that creates racing tensions.
 * Nations can reduce each others AI capabilities by not allowing use of
 * their models. Developers can't open source except accidentally through
 * espionage."
 * 
 * Models how nations acquire AI capability through:
 * 1. Indigenous development (domestic labs)
 * 2. Open source models (universal access, can't restrict)
 * 3. Stolen models (espionage, leaks, "accidentally open source")
 * 4. Commercial APIs (can be restricted via export controls)
 * 
 * Key: Race intensity = capability asymmetry × geopolitical tension
 */

export type NationName = 
  | 'United States'
  | 'China'
  | 'United Kingdom'
  | 'European Union'
  | 'Russia'
  | 'Israel'
  | 'India'
  | 'South Korea'
  | 'Japan';

export interface NationalAICapability {
  nation: NationName;
  
  // === CAPABILITY SOURCES ===
  // Effective capability = MAX(all sources)
  indigenousCapability: number;      // [0, 5+] Domestic AI development
  openSourceCapability: number;      // [0, 5+] Best open source available (universal access)
  stolenCapability: number;          // [0, 5+] Via espionage/leaks
  commercialAccess: number;          // [0, 5+] API access (can be restricted)
  
  effectiveCapability: number;       // [0, 5+] MAX of all sources
  
  // === STRATEGIC POSITION ===
  leading: boolean;                  // Are they ahead?
  gap: number;                       // Distance from leader (asymmetry!)
  gapFromUS: number;                 // Specific gap vs US
  gapFromChina: number;              // Specific gap vs China
  
  // === RESOURCES ===
  computeAccess: number;             // [0, 1] Access to frontier chips/clouds
  talentPool: number;                // [0, 1] AI researchers available
  investmentLevel: number;           // $B per year in AI R&D
  
  // === POLICY ===
  exportControls: ExportControlPolicy;
  
  // === MILITARY INTEGRATION ===
  militaryAI: number;                // [0, 5+] AI in military systems
  nuclearIntegration: number;        // [0, 1] AI in nuclear C&C
  
  // === DOMESTIC LABS ===
  domesticLabs: string[];            // IDs of orgs/labs in this nation
  domesticModels: string[];          // IDs of AI agents from this nation
}

export interface ExportControlPolicy {
  // Which models are restricted
  restrictedModels: string[];        // AI agent IDs that can't be exported
  
  // Which nations are denied access
  modelsDeniedTo: NationName[];      // Can't access this nation's closed models
  chipsDeniedTo: NationName[];       // Can't buy advanced chips
  cloudsDeniedTo: NationName[];      // Can't use cloud services
  
  // Enforcement strength
  enforcementLevel: number;          // [0, 1] How well enforced
  leakProbability: number;           // [0, 1] Probability of circumvention
}

export interface GlobalOpenSourceFrontier {
  // The best openly available AI capability
  frontierCapability: number;        // [0, 5+] Current open source frontier
  lagBehindClosed: number;           // Months behind closed frontier
  
  // Which models are open source
  openSourceModels: string[];        // AI agent IDs that are open source
  
  // Contributors
  contributions: Record<NationName, number>; // How much each nation contributes
}

export interface EspionageTracking {
  // State-sponsored espionage
  chinaTheftAttempts: number;        // Cumulative attempts
  chinaSuccessfulThefts: number;     // Successful model acquisitions
  russiaTheftAttempts: number;
  russiaSuccessfulThefts: number;
  
  // Accidental leaks ("accidentally open source")
  accidentalLeaks: Array<{
    modelId: string;
    sourceNation: NationName;
    month: number;
    method: 'github_leak' | 'insider_leak' | 'hack' | 'poor_security';
  }>;
  
  // Success probability factors
  baseTheftRate: number;             // 1% per model per year
  modelCountFactor: number;          // More models = more attack surface
  securityLevelFactor: number;       // Org security practices
  stateSponsoredMultiplier: number;  // China/Russia 10x more effective
}

export interface AIRaceIntensityFactors {
  // NEW: Capability asymmetry drives racing
  capabilityGap: number;             // [0, 1] US-China gap
  usLeading: boolean;                // Is US ahead?
  chinaLeading: boolean;             // Is China ahead?
  
  // Geopolitical factors
  bilateralTension: number;          // [0, 1] US-China tension level
  nuclearFlashpoints: number;        // Count of nuclear flashpoints
  
  // Military AI deployment
  militaryAIDeployed: boolean;       // Either side has military AI >2.0
  autonomousWeapons: boolean;        // Autonomous nuclear weapons deployed
  
  // Policy factors
  exportControlsActive: boolean;     // US restricting China
  chinaAccelerating: boolean;        // China increased spending due to controls
  
  // Resulting race intensity
  raceIntensity: number;             // [0, 1] Overall AI race intensity
  
  // Breakdown
  gapContribution: number;           // How much gap contributes
  tensionContribution: number;       // How much tension contributes
  militaryContribution: number;      // How much military AI contributes
}

export interface AICooperationAgreement {
  // International coordination to slow the race
  active: boolean;
  signatories: NationName[];
  startMonth: number;
  
  // Terms
  pauseMonths: number;               // Agreed pause on capability jumps
  sharedSafetyResearch: boolean;     // Pool alignment research
  mutualInspections: boolean;        // Allow DC audits
  jointDevelopment: boolean;         // Collaborate instead of compete
  
  // Compliance
  complianceLevel: number;           // [0, 1] Average adherence
  violations: Array<{
    nation: NationName;
    month: number;
    type: 'capability_jump' | 'inspection_denied' | 'secret_development';
  }>;
  
  // Effects
  aiRaceReduction: number;           // [0, 1] How much race slows
  trustBoost: number;                // [0, 1] Improved relations
  
  // Fragility
  breakRisk: number;                 // Probability per month of collapse
  firstMoverIncentive: number;       // Gain from defecting
  monthsUntilBreak: number;          // Estimated time until defection
}

export interface NationalAISystem {
  // === NATIONS ===
  nations: NationalAICapability[];
  
  // === GLOBAL STATE ===
  globalLeader: NationName | null;   // Who's ahead
  globalFrontier: number;            // Highest capability anywhere
  openSourceFrontier: GlobalOpenSourceFrontier;
  
  // === ESPIONAGE ===
  espionage: EspionageTracking;
  
  // === RACE DYNAMICS ===
  raceIntensity: AIRaceIntensityFactors;
  
  // === COOPERATION ===
  cooperationAgreement: AICooperationAgreement | null;
  
  // === EVENTS ===
  significantEvents: Array<{
    month: number;
    type: 'capability_jump' | 'export_control' | 'theft' | 'open_source_release' | 'cooperation' | 'defection';
    nation: NationName;
    description: string;
  }>;
}

// === BASELINE DATA (2023) ===

export interface NationalAIBaseline {
  nation: NationName;
  
  // Current state (2023)
  indigenousCapability: number;      // Current domestic AI level
  computeAccess: number;             // Chip access
  talentPool: number;                // AI talent
  investmentLevel: number;           // $B/year
  
  // Major labs
  majorLabs: string[];               // e.g., ["OpenAI", "Anthropic", "DeepMind"]
  
  // Strategic posture
  exportControlTarget: boolean;      // Is this nation targeted by US controls?
  militaryFocus: boolean;            // Strong military AI focus
}

// Realistic 2023 baselines
export const NATIONAL_AI_BASELINES_2023: Record<NationName, NationalAIBaseline> = {
  'United States': {
    nation: 'United States',
    indigenousCapability: 1.0,       // GPT-4 level (frontier)
    computeAccess: 1.0,               // Full access to NVIDIA chips
    talentPool: 1.0,                  // Deepest talent pool
    investmentLevel: 100,             // ~$100B/year
    majorLabs: ['OpenAI', 'Anthropic', 'Google DeepMind', 'Meta AI'],
    exportControlTarget: false,
    militaryFocus: true,
  },
  
  'China': {
    nation: 'China',
    indigenousCapability: 0.8,       // ~6-12 months behind
    computeAccess: 0.6,               // Chip restrictions hurt
    talentPool: 0.9,                  // Large talent pool
    investmentLevel: 80,              // ~$80B/year
    majorLabs: ['Baidu', 'Alibaba', 'Tencent', 'SenseTime'],
    exportControlTarget: true,        // US export controls
    militaryFocus: true,
  },
  
  'United Kingdom': {
    nation: 'United Kingdom',
    indigenousCapability: 0.9,       // DeepMind (frontier)
    computeAccess: 1.0,               // Allied access
    talentPool: 0.7,                  // Strong but small
    investmentLevel: 10,              // ~$10B/year
    majorLabs: ['Google DeepMind (UK)'],
    exportControlTarget: false,
    militaryFocus: false,
  },
  
  'European Union': {
    nation: 'European Union',
    indigenousCapability: 0.7,       // Mistral, etc.
    computeAccess: 1.0,               // Allied access
    talentPool: 0.8,                  // Good talent
    investmentLevel: 20,              // ~$20B/year (fragmented)
    majorLabs: ['Mistral', 'Aleph Alpha'],
    exportControlTarget: false,
    militaryFocus: false,
  },
  
  'Russia': {
    nation: 'Russia',
    indigenousCapability: 0.5,       // ~2-3 years behind
    computeAccess: 0.3,               // Sanctioned, limited chips
    talentPool: 0.6,                  // Brain drain
    investmentLevel: 5,               // ~$5B/year (limited by sanctions)
    majorLabs: ['Yandex'],
    exportControlTarget: true,        // Sanctions
    militaryFocus: true,
  },
  
  'Israel': {
    nation: 'Israel',
    indigenousCapability: 0.6,       // Niche capabilities
    computeAccess: 1.0,               // Allied access
    talentPool: 0.8,                  // Strong tech sector
    investmentLevel: 5,               // ~$5B/year
    majorLabs: [],                    // Mostly private/military
    exportControlTarget: false,
    militaryFocus: true,              // Very strong military AI
  },
  
  'India': {
    nation: 'India',
    indigenousCapability: 0.4,       // Growing but behind
    computeAccess: 0.8,               // Allied access
    talentPool: 0.9,                  // Massive talent pool
    investmentLevel: 10,              // ~$10B/year
    majorLabs: [],                    // Mostly services, not research
    exportControlTarget: false,
    militaryFocus: false,
  },
  
  'South Korea': {
    nation: 'South Korea',
    indigenousCapability: 0.5,       // Strong manufacturing, weak AI
    computeAccess: 1.0,               // Allied access
    talentPool: 0.7,                  // Good tech sector
    investmentLevel: 15,              // ~$15B/year
    majorLabs: ['Samsung', 'LG'],
    exportControlTarget: false,
    militaryFocus: false,
  },
  
  'Japan': {
    nation: 'Japan',
    indigenousCapability: 0.5,       // Conservative adoption
    computeAccess: 1.0,               // Allied access
    talentPool: 0.6,                  // Aging workforce
    investmentLevel: 20,              // ~$20B/year
    majorLabs: [],                    // Strong industrial AI, weak research
    exportControlTarget: false,
    militaryFocus: false,
  },
};

