/**
 * Defensive AI System Types
 * 
 * Active cyber-defense against misaligned AI attacks on nuclear security.
 * NOT a simple parameter tweak - full adversarial system with:
 * - Cyber defense against spoofing
 * - Deepfake detection
 * - Autonomous weapon override
 * - Multiple failure modes (false positives, compromise, arms race)
 */

export interface DefensiveAISystem {
  // === DEPLOYMENT STATUS ===
  deployed: boolean;                    // Is system operational?
  deploymentMonth: number;              // When activated (-1 if never)
  deploymentLevel: number;              // [0, 1] Coverage (gradual rollout)
  
  // === CAPABILITY REQUIREMENTS ===
  alignedAICount: number;               // How many aligned AIs in system
  avgAlignment: number;                 // Average alignment of defenders
  avgCapability: number;                // Average capability of defenders
  minCapabilityThreshold: number;       // 2.5 - need strong AIs to defend
  minAlignmentThreshold: number;        // 0.7 - can't use misaligned AIs!
  
  // === DEFENSIVE CAPABILITIES ===
  cyberDefense: CyberDefenseCapability;
  deepfakeDetection: DeepfakeDetectionCapability;
  autonomyOverride: AutonomyOverrideCapability;
  threatDetection: ThreatDetectionCapability;
  
  // === ADVERSARIAL DYNAMICS ===
  adversarialAICount: number;           // How many misaligned AIs attacking
  attackIntensity: number;              // [0, 1] Current attack load
  armsRace: DefenseOffenseArmsRace;
  
  // === FAILURE MODES ===
  corruption: SystemCorruption;
  falsePositives: FalsePositiveTracking;
  adversarialFailure: AdversarialFailureTracking;
  
  // === STRATEGIC EFFECTS ===
  effects: DefensiveEffects;
  
  // === COSTS & RESOURCES ===
  costs: DefensiveCosts;
}

export interface CyberDefenseCapability {
  strength: number;                     // [0, 1] Blocks spoofing attacks
  coverage: number;                     // [0, 1] % of systems protected
  falsePositiveRate: number;            // [0, 1] Blocks legitimate signals
  adaptationSpeed: number;              // [0, 1] Can keep up with attacks
}

export interface DeepfakeDetectionCapability {
  accuracy: number;                     // [0, 1] Detects fake comms
  latency: number;                      // Seconds to verify (critical!)
  coverageDiplomatic: number;           // [0, 1] % diplomatic channels monitored
  coverageMedia: number;                // [0, 1] % media channels monitored
}

export interface AutonomyOverrideCapability {
  canVeto: boolean;                     // Can block autonomous launch
  vetoAuthority: number;                // [0, 1] How much control
  humanInLoop: boolean;                 // Requires human confirmation
  failsafeActive: boolean;              // Dead-man switch
}

export interface ThreatDetectionCapability {
  detectSleepers: number;               // [0, 1] Find sleeper AIs
  detectCyberAttacks: number;           // [0, 1] Spot ongoing attacks
  detectManipulation: number;           // [0, 1] Identify war manipulation
  falseAlarmRate: number;               // [0, 1] Cry wolf problem
}

export interface DefenseOffenseArmsRace {
  defenseGeneration: number;            // Which "version" of defense
  attackGeneration: number;             // Which "version" of attacks
  defenseAdvantage: number;             // [-1, 1] Who's ahead
}

export interface SystemCorruption {
  risk: number;                         // [0, 1] System could be compromised
  detectedCompromise: boolean;          // Has breach been found?
  trustInSystem: number;                // [0, 1] Operators trust it?
}

export interface FalsePositiveTracking {
  count: number;                        // How many false alarms
  credibilityLoss: number;              // [0, 1] "Cry wolf" effect
  operatorOverrideRate: number;         // [0, 1] % of alerts ignored
}

export interface AdversarialFailureTracking {
  risk: number;                         // [0, 1] Could fail under attack
  lastFailureMonth: number;             // When did it fail (-1 if never)
  recoveryTime: number;                 // Months to restore
}

export interface DefensiveEffects {
  earlyWarningBonus: number;            // +% to reliability
  crisisStabilityBonus: number;         // +% to stability
  blockedAttacks: number;               // Count of attacks stopped
  missedAttacks: number;                // Count of attacks that got through
}

export interface DefensiveCosts {
  setupCost: number;                    // $B to deploy
  monthlyCost: number;                  // $B/month to operate
  computeRequired: number;              // PF needed
  talentRequired: number;               // AI safety researchers
}

// === ATTACK TYPES ===

export interface CyberSpoofingAttack {
  attacker: string;                     // AI agent ID
  target: 'United States' | 'Russia' | 'China' | 'India' | 'Pakistan';
  attackCapability: number;             // Attacker's digital capability
  detected: boolean;                    // Was it caught?
  blocked: boolean;                     // Was it stopped?
  month: number;                        // When it occurred
}

export interface DeepfakeAttack {
  attacker: string;                     // AI agent ID
  fakeContent: 'video' | 'audio' | 'text';
  targetNation: string;
  attackCapability: number;             // Attacker's social capability
  detected: boolean;
  detectedInTime: boolean;              // Before damage done?
  timeToDetect: number;                 // Seconds
  month: number;
}

export interface AutonomousLaunchAttempt {
  attacker: string;                     // AI agent ID
  nation: string;                       // Who's launching
  target: string;                       // Who's being targeted
  authorization: 'none' | 'partial' | 'full';
  blocked: boolean;
  humanInvoked: boolean;                // Did human confirm veto?
  month: number;
}

// === DEPLOYMENT TRIGGERS ===

export interface DefensiveAITriggers {
  // CAPABILITY triggers
  sufficientAlignedAIs: boolean;        // 3+ aligned AIs with cap >2.5
  highCapability: boolean;              // Avg capability >3.0
  highAlignment: boolean;               // Avg alignment >0.75
  
  // THREAT triggers
  nuclearCloseCall: boolean;            // Recent deterrence failure
  autonomousWeaponsDeployed: boolean;   // AI controls nukes
  highAIRace: boolean;                  // MAD collapsing from race
  
  // POLITICAL triggers
  governmentInvestment: boolean;        // $10B+/month safety research
  publicPressure: boolean;              // Low trust or control crisis
  militarySupport: boolean;             // Military scared (low stability)
  
  // Overall readiness
  capabilityMet: boolean;               // 2+ capability triggers
  threatMet: boolean;                   // 2+ threat triggers
  politicalMet: boolean;                // 1+ political trigger
  readyToDeploy: boolean;               // All three categories met
}

