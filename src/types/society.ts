// Society & Population Types

/**
 * P2.3: Heterogeneous Population Segment (Oct 16, 2025)
 * Models distinct social groups with different attitudes, vulnerabilities, and power
 * Research: Pew Research Political Typology (2021-2024)
 */
export interface SocietySegment {
  id: string;
  name: string;

  // Population and power
  populationFraction: number;  // % of total population (0-1, sums to 1.0)
  politicalPower: number;      // % of political influence (0-1, sums to 1.0)
  economicPower: number;       // % of economic resources (0-1, sums to 1.0)

  // Attitudes (segment-specific)
  trustInAI: number;           // 0-1
  trustInGovernment: number;   // 0-1
  trustInScience: number;      // 0-1
  openness: number;            // 0-1 (to change/innovation)

  // Demographics
  geographic: ('urban' | 'suburban' | 'rural')[];
  economicStatus: 'elite' | 'middle' | 'working' | 'precariat';
  education: 'high' | 'medium' | 'low';

  // Crisis response
  crisisVulnerability: number; // 0-1 (0 = insulated, 1 = highly exposed)
  adaptability: number;        // 0-1 (ability to cope with change)
  survivalRate: number;        // Multiplier on mortality (0.5 = half the death rate, 2.0 = double)

  // === TIER 4.6: HUMAN ENHANCEMENT (Oct 16, 2025) ===
  // AI-assisted cognitive amplification and future BCI adoption
  aiAugmentationAccess: number;     // 0-1 (access to AI tools - e.g., elite 0.90, precariat 0.10)
  aiAugmentationAdoption: number;   // 0-1 (actual usage of AI tools)
  productivityMultiplier: number;   // 0.3-2.0 (AI-enhanced productivity vs baseline)
  bciAdoption: number;              // 0-1 (future: neural interface adoption)
  enhancementLevel: number;         // 0-1 (overall cognitive enhancement: AI + BCI)
}

export interface HumanSocietyAgent {
  // === P2.3: HETEROGENEOUS POPULATION (Oct 16, 2025) ===
  segments?: SocietySegment[];  // Optional: Distinct social groups

  // Aggregate values (backward compatibility + population-weighted average)
  trustInAI: number; // [0,1] General confidence in AI systems

  // Power-weighted aggregates (for policy decisions)
  powerWeightedTrustInAI?: number;        // Trust weighted by political power
  powerWeightedTrustInGovernment?: number;

  // Polarization metrics
  polarizationIndex?: number;  // 0-1 (variance in segment attitudes)
  eliteMassGap?: number;       // Difference between elite and mass trust

  // === EXISTING FIELDS ===
  paranoiaLevel: number; // [0,1] Fear/anxiety about AI (Phase 2.8: Paranoia System)
  coordinationCapacity: number; // [0,1] Ability to organize collective action
  unemploymentLevel: number; // [0,1] Percentage of workforce displaced
  socialAdaptation: number; // [0,1] Overall adaptation to post-work economy
  activeMovements: string[]; // Active social movements (used in actionSystem.ts)
  // Quartile-based adoption model
  earlyAdopters: number; // [0,1] Q1: Fast adopters (6-12 months)
  mediumAdopters: number; // [0,1] Q2: 2-5 year horizon
  slowAdopters: number; // [0,1] Q3: Decade horizon
  resistantAdopters: number; // [0,1] Q4: Resist until extreme pressure

  // === CONTINGENCY & AGENCY PHASE 3: CRITICAL JUNCTURE AGENCY (Oct 17, 2025) ===
  // Tracks organized opposition and latent grievances for agency potential calculations
  // Research: Kuran (1991) preference falsification, Leipzig 1989 cascade mechanism
  socialMovements?: {
    strength: number;    // [0,1] Organized opposition capacity
    grievances: number;  // [0,1] Latent opposition (hidden preferences)
  };
}
