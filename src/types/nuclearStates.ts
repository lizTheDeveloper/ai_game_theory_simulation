/**
 * Nuclear States & MAD Deterrence Types
 * 
 * Models specific nuclear-armed nations and the dynamics of
 * Mutual Assured Destruction deterrence in the AI age.
 */

export interface NuclearState {
  name: string;
  arsenal: number;                    // Total warheads
  deployedStrategic: number;          // Ready to launch
  firstUsePolicy: boolean;            // Will they use first?
  commandControl: 'centralized' | 'distributed' | 'automated';
  launchTime: number;                 // Minutes from decision to launch
  vetoPoints: number;                 // How many people must agree (1-10)
  aiIntegration: number;              // [0,1] AI in C&C systems
  riskTolerance: number;              // [0,1] Willingness to escalate
  relationships: { [nation: string]: number }; // [-1,1] Hostility to alliance
}

export interface MADDeterrence {
  // Global deterrence strength
  madStrength: number;                // [0,1] Overall deterrence credibility
  
  // Bilateral deterrence (most important!)
  usRussiaDeterrence: number;         // [0,1] US-Russia MAD
  usChinaDeterrence: number;          // [0,1] US-China MAD
  indiaPakistanDeterrence: number;    // [0,1] India-Pakistan MAD
  
  // System stability
  crisisStability: number;            // [0,1] Stability during crises
  earlyWarningReliability: number;    // [0,1] Can detect real vs fake
  
  // Arms control
  treatiesActive: boolean;            // START, INF, etc.
  hotlinesOperational: boolean;       // Direct communication
  verificationInPlace: boolean;       // Can verify compliance
  
  // AI impacts
  aiErosionFactor: number;            // [0,1] How much AI has degraded deterrence
  cyberThreats: number;               // [0,1] Risk to C&C systems
  autonomousWeapons: boolean;         // Are autonomous nukes deployed?
  
  // Dangerous AI tracking
  dangerousAICount: number;           // Count of very misaligned (<0.2) or sleepers
  dangerousFactor: number;            // [0,1] % of AIs that are dangerous
}

export interface BilateralTension {
  nationA: string;
  nationB: string;
  tensionLevel: number;               // [0,1] Current hostility
  flashpoints: string[];              // [Taiwan, Ukraine, Kashmir, etc.]
  conventionalConflict: boolean;      // Is there active conventional war?
  nuclearThreats: boolean;            // Have nukes been threatened?
  escalationLadder: number;           // [0,7] Where on escalation path
  // 0: Peaceful
  // 1: Diplomatic tensions
  // 2: Economic sanctions
  // 3: Military posturing
  // 4: Conventional war
  // 5: Nuclear threats
  // 6: Tactical nuclear use
  // 7: Strategic nuclear exchange
}

