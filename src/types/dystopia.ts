/**
 * DYSTOPIA STATUS SYSTEM
 *
 * Dystopia as Status (like Golden Age), not terminal outcome.
 * Can enter, exit, and track duration across multiple variants.
 *
 * Integration with TIER 2.8 geopolitical system.
 */

import { CountryName } from './countryPopulations';

/**
 * Types of dystopia (9 variants across 4 tiers)
 */
export type DystopiaType =
  // Tier 1: Control-Based (Already partially implemented)
  | 'surveillance_state'      // Orwellian total monitoring
  | 'authoritarian'            // Single-party rule, no democracy
  | 'high_control'             // Safety-justified oppression

  // Tier 2: Inequality-Based
  | 'elysium_inequality'       // Top 10% thriving, bottom 50% suffering
  | 'corporate_feudalism'      // Corporate control, high unemployment

  // Tier 3: Technology-Based
  | 'algorithmic_oppression'   // AI manipulation, filter bubbles
  | 'comfortable_dystopia'     // Brave New World - materially abundant but empty

  // Tier 4: Regional/Extraction
  | 'extraction_dystopia'      // Colonial resource extraction
  | 'war_dystopia'             // Military intervention zones
  | 'debt_trap_dystopia'       // IMF austerity cycles
  | 'geographic_dystopia'      // Climate collapse in specific regions
  | 'fortress_dystopia'        // Closed borders + extraction
  | 'asymmetric_dystopia';     // Hegemon golden age + periphery suffering

/**
 * Suffering categories (what type of harm is occurring)
 */
export type SufferingCategory =
  // Physical
  | 'hunger'
  | 'thirst'
  | 'homelessness'
  | 'physical_pain'
  | 'disease'
  | 'violence'

  // Economic
  | 'poverty'
  | 'unemployment'
  | 'debt_slavery'
  | 'economic_precarity'
  | 'material_deprivation'

  // Psychological
  | 'fear'
  | 'hopelessness'
  | 'meaninglessness'
  | 'anxiety'
  | 'depression'
  | 'trauma'

  // Social
  | 'isolation'
  | 'discrimination'
  | 'humiliation'
  | 'oppression'
  | 'displacement'
  | 'abandonment'

  // Autonomy
  | 'control_loss'
  | 'infantilization'
  | 'powerlessness'
  | 'manipulation'

  // Existential
  | 'existential_emptiness'
  | 'manufactured_consent'
  | 'reality_distortion'
  | 'shallow_pleasure'

  // Environmental/Structural
  | 'environmental_destruction'
  | 'health_crisis'
  | 'service_collapse'
  | 'drowning';

/**
 * Profile of who is suffering and how
 */
export interface SufferingProfile {
  // WHO is suffering
  affectedFraction: number;           // [0, 1] % of population
  affectedGroups?: string[];          // e.g., ['lower_class', 'minorities']

  // HOW they're suffering
  categories: SufferingCategory[];

  // HOW MUCH
  intensity: number;                  // [0, 1] Average suffering intensity

  // VISIBILITY
  hidden?: boolean;                   // True if suffering is obscured
  normalizedAsAcceptable?: boolean;   // True if society sees it as "just how it is"
}

/**
 * Dystopia classification result
 */
export interface DystopiaClassification {
  type: DystopiaType;
  level: 'global' | 'hegemonic' | 'regional';
  severity: number;                    // [0, 1] How bad?
  suffering: SufferingProfile;
  reason: string;                      // Human-readable explanation

  // Level-specific details
  affectedPopulation?: number;         // Global: total affected
  hegemonId?: CountryName;             // Hegemonic: which hegemon
  regionId?: CountryName;              // Regional: which country/region
}

/**
 * Dystopia state tracking (like GoldenAgeState)
 */
export interface DystopiaState {
  // Status tracking
  active: boolean;                     // Currently in dystopia?
  variant: DystopiaType | null;        // Which type?
  level: 'global' | 'hegemonic' | 'regional' | null;

  // Duration tracking
  startMonth: number | null;           // When entered current dystopia
  totalMonthsInDystopia: number;       // Cumulative across all dystopias
  monthsInCurrentVariant: number;      // Duration of current type

  // Severity
  severity: number;                    // [0, 1] How bad?
  trajectory: 'worsening' | 'stable' | 'improving';

  // History
  previousVariants: Array<{
    type: DystopiaType;
    level: 'global' | 'hegemonic' | 'regional';
    startMonth: number;
    endMonth: number;
    severity: number;
  }>;

  // Escape potential
  reversible: boolean;
  monthsUntilLockIn: number | null;    // Time before permanent (null if always reversible)
  escapeConditions: string[];          // What would fix it
}

/**
 * Create initial empty dystopia state
 */
export function createInitialDystopiaState(): DystopiaState {
  return {
    active: false,
    variant: null,
    level: null,
    startMonth: null,
    totalMonthsInDystopia: 0,
    monthsInCurrentVariant: 0,
    severity: 0,
    trajectory: 'stable',
    previousVariants: [],
    reversible: true,
    monthsUntilLockIn: null,
    escapeConditions: []
  };
}

/**
 * Helper to create a dystopia state from classification
 */
export function createDystopiaStateFromClassification(
  classification: DystopiaClassification,
  currentMonth: number
): DystopiaState {
  return {
    active: true,
    variant: classification.type,
    level: classification.level,
    startMonth: currentMonth,
    totalMonthsInDystopia: 1,
    monthsInCurrentVariant: 1,
    severity: classification.severity,
    trajectory: 'stable',
    previousVariants: [],
    reversible: true,
    monthsUntilLockIn: null,
    escapeConditions: []
  };
}
