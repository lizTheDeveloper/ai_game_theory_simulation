/**
 * Social Safety Nets & Community Infrastructure System (TIER 2.2)
 * 
 * Physical and social infrastructure to combat loneliness epidemic and enable community flourishing.
 * Based on WHO (2025), Harvard Making Caring Common (2024), US Surgeon General (2024),
 * University of Texas (2025), World Bank (2025).
 * 
 * Key Finding: "Three-quarters of those surveyed said they wanted more opportunities 
 * to develop meaningful relationships. Public and private leaders must build up social 
 * infrastructure to help people develop meaningful connections." - Harvard (Oct 2024)
 */

export interface SocialSafetyNetsSystem {
  // === PHYSICAL INFRASTRUCTURE ===
  // "Social Infrastructure in Local Communities" - US Surgeon General Pillar 1
  physicalInfrastructure: {
    parks: number;                    // [0, 1] Public parks, green spaces, playgrounds
    libraries: number;                // [0, 1] Public libraries, community learning centers
    communityCenters: number;         // [0, 1] Community centers, meeting spaces
    publicTransport: number;          // [0, 1] Local transport to connect isolated populations
    cafesAndGathering: number;        // [0, 1] Subsidized third places (cafés, maker spaces)
  };
  
  // === UNIVERSAL SERVICES ===
  // Healthcare and education as social cohesion mechanisms
  universalServices: {
    healthcare: number;               // [0, 1] Universal healthcare coverage
    mentalHealthcare: number;         // [0, 1] Mental health services accessibility
    childcare: number;                // [0, 1] Universal childcare availability
    eldercare: number;                // [0, 1] Elder care and intergenerational programs
    education: number;                // [0, 1] Free education (K-12, college, vocational)
  };
  
  // === COMMUNITY PROGRAMS ===
  // Active programs that bring people together
  communityPrograms: {
    volunteerGroups: number;          // [0, 1] Subsidies for voluntary organizations
    neighborhoodCohesion: number;     // [0, 1] Neighborhood social cohesion initiatives
    intergenerational: number;        // [0, 1] Programs connecting young and old
    culturalEvents: number;           // [0, 1] Subsidized cultural and community events
    sportsAndRecreation: number;      // [0, 1] Community sports and recreation programs
  };
  
  // === EFFECTS TRACKING ===
  effects: {
    lonelinesReduction: number;       // [0, 1] Reduction in loneliness epidemic
    communityStrengthBoost: number;   // Monthly boost to community strength
    socialCohesionIncrease: number;   // Overall social cohesion improvement
    mentalHealthImprovement: number;  // Mental health benefits from connection
    civicEngagement: number;          // Participation in community life
    trustBuilding: number;            // Interpersonal trust growth
  };
  
  // === DEPLOYMENT TRACKING ===
  active: boolean;                    // Are safety nets actively being built?
  startMonth: number;                 // When construction began (-1 if never)
  monthsActive: number;               // Months since activation
  totalInvestment: number;            // Total investment in $B
  
  // === OUTCOMES ===
  communityStrengthGain: number;      // Cumulative community strength gained
  meaningCrisisReduction: number;     // Cumulative meaning crisis reduction (synergy with UBI)
  democraticParticipation: number;    // [0, 1] Democratic engagement enabled
  
  // === SYNERGIES ===
  // Amplification effects from other systems
  ubiSynergy: number;                 // [0, 1] UBI gives people time to use infrastructure
  aiCoordination: number;             // [0, 1] AI helps optimize placement and scheduling
  governmentCapacity: number;         // [0, 1] Institutional capacity for implementation
}

/**
 * Configuration for activating social safety nets
 */
export interface SocialSafetyNetsConfig {
  investmentLevel: number;            // $B/month investment level
  priorityAreas: {
    physical: number;                 // [0, 1] Priority weight for physical infrastructure
    services: number;                 // [0, 1] Priority weight for universal services
    programs: number;                 // [0, 1] Priority weight for community programs
  };
  targetRegions: 'urban' | 'rural' | 'both'; // Where to focus initially
}

