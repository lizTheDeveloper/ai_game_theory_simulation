/**
 * Volunteer Research / Citizen Science System
 * 
 * When people have time (unemployment), resources (UBI), skills (education),
 * and motivation (low meaning crisis), they contribute to research.
 * 
 * This acts as "virtual compute" multiplying research progress.
 */

import { GameState } from '@/types/game';

/**
 * Calculate volunteer research contribution
 * 
 * Returns equivalent "virtual compute" in petaflops from human volunteers.
 * 
 * Research examples:
 * - Folding@home: 1.5 exaFLOPS (1,500,000 PF) from volunteers during COVID-19
 * - BOINC projects: ~20,000 PF sustained
 * - Human creativity & intuition: Can solve problems AI struggles with
 * 
 * Not as fast as dedicated AI compute, but:
 * - Costs almost nothing (people volunteer)
 * - Provides meaning and purpose
 * - Enables breakthroughs from diverse perspectives
 */
export function calculateVolunteerResearchContribution(state: GameState): number {
  // Base: No contribution
  let volunteerCompute = 0;
  
  // 1. TIME: Need high unemployment
  const unemployment = state.society?.unemploymentLevel || 0;
  if (unemployment < 0.30) return 0; // Need 30%+ unemployment for critical mass
  
  // Scale with unemployment: 30% → 1.0x, 60% → 2.0x, 90% → 3.0x
  const timeAvailable = (unemployment - 0.30) / 0.30; // 0-2.0x
  
  // 2. RESOURCES: Need UBI (basic needs met, can afford to volunteer)
  if (!state.ubiSystem?.active) return 0;
  
  const ubiCoverage = state.ubiSystem.coverage || 0;
  const resourceSecurity = ubiCoverage; // 0-1.0
  
  // 3. SKILLS: Need purpose infrastructure (education, platforms, tools)
  const purposeInfra = state.ubiSystem.purposeInfrastructure || {
    educationAccess: 0,
    creativeSpaces: 0,
    volunteerNetworks: 0,
    socialConnection: 0,
  };
  
  const skillLevel = (
    purposeInfra.educationAccess * 0.4 +      // Education most important
    purposeInfra.volunteerNetworks * 0.3 +    // Networks enable coordination
    purposeInfra.creativeSpaces * 0.2 +       // Spaces provide tools
    purposeInfra.socialConnection * 0.1       // Social support helps
  );
  
  // 4. MOTIVATION: Need low meaning crisis (high purpose, want to help)
  const meaningCrisis = state.socialAccumulation?.meaningCrisis || 0.5;
  const motivation = Math.max(0, 1.0 - meaningCrisis); // Higher when crisis is low
  
  // 5. POPULATION: More people = more volunteers
  const population = state.population?.total || 8_000_000_000;
  const populationFactor = population / 8_000_000_000; // Relative to 2025 baseline
  
  // COMBINE FACTORS
  if (timeAvailable > 0 && resourceSecurity > 0.5 && skillLevel > 0.3 && motivation > 0.3) {
    // Base contribution: 10 PF per 1% of global population participating
    // At 30% unemployment, 80% UBI, 50% skills, 70% motivation → ~5% participate
    const participationRate = timeAvailable * resourceSecurity * skillLevel * motivation * 0.05;
    
    // Each 1% of global population = ~80 million people
    // Each 80M people volunteering = ~10 PF equivalent "virtual compute"
    // (Much slower than AI compute, but still useful for certain problems)
    volunteerCompute = participationRate * 100 * 10 * populationFactor;
    
    // Cap at realistic maximum (Folding@home peak: 1.5 million PF)
    volunteerCompute = Math.min(volunteerCompute, 1_500_000);
    
    // Breakthrough tech deployment multiplier
    // If we have advanced communication/coordination tech, volunteers are more effective
    const coordTechBonus = 1.0 + (getTechCoordinationBonus(state) * 0.5);
    volunteerCompute *= coordTechBonus;
  }
  
  return volunteerCompute;
}

/**
 * Get coordination technology bonus
 * Better communication tech = more effective volunteers
 */
function getTechCoordinationBonus(state: GameState): number {
  let bonus = 0;
  
  // Purpose infrastructure tech deployed
  const purposeNetworks = state.breakthroughTech?.collectivePurposeNetworks?.deploymentLevel || 0;
  bonus += purposeNetworks * 0.5;
  
  // Community platforms
  const communityPlatforms = state.breakthroughTech?.communityPlatforms?.deploymentLevel || 0;
  bonus += communityPlatforms * 0.3;
  
  // AI capability (AI can help coordinate volunteers)
  const avgAICapability = state.aiAgents.length > 0
    ? state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / state.aiAgents.length
    : 0;
  bonus += Math.min(0.5, avgAICapability / 10); // Up to +0.5 from AI coordination
  
  return Math.min(1.0, bonus); // Cap at 100% bonus (2x effectiveness)
}

/**
 * Log volunteer research contribution
 * Only log when it's significant (reduces spam)
 */
export function logVolunteerContribution(
  state: GameState,
  volunteerCompute: number,
  totalCompute: number
): void {
  if (volunteerCompute < 100) return; // Don't log tiny contributions
  
  const percentage = (volunteerCompute / totalCompute) * 100;
  const unemployment = state.society?.unemploymentLevel || 0;
  const participationRate = calculateParticipationRate(state);
  
  console.log(`\n🧑‍🔬 CITIZEN SCIENCE ACTIVE`);
  console.log(`   Unemployment: ${(unemployment * 100).toFixed(0)}%`);
  console.log(`   Participation: ${(participationRate * 100).toFixed(1)}% of population`);
  console.log(`   Virtual Compute: ${volunteerCompute.toFixed(0)} PF (${percentage.toFixed(1)}% of total)`);
  console.log(`   Volunteers provide distributed problem-solving, creativity, intuition`);
}

/**
 * Calculate what % of population is volunteering
 */
function calculateParticipationRate(state: GameState): number {
  const unemployment = state.society?.unemploymentLevel || 0;
  if (unemployment < 0.30) return 0;
  
  const ubiCoverage = state.ubiSystem?.coverage || 0;
  const purposeInfra = state.ubiSystem?.purposeInfrastructure;
  
  if (!purposeInfra) return 0;
  
  const skillLevel = (
    purposeInfra.educationAccess * 0.4 +
    purposeInfra.volunteerNetworks * 0.3 +
    purposeInfra.creativeSpaces * 0.2 +
    purposeInfra.socialConnection * 0.1
  );
  
  const meaningCrisis = state.socialAccumulation?.meaningCrisis || 0.5;
  const motivation = Math.max(0, 1.0 - meaningCrisis);
  
  const timeAvailable = (unemployment - 0.30) / 0.30;
  
  return timeAvailable * ubiCoverage * skillLevel * motivation * 0.05;
}

/**
 * Effects of volunteer research on society
 * 
 * Beyond just compute, volunteers gain:
 * - Purpose and meaning (reduce meaning crisis)
 * - Skills and education (increase human capital)
 * - Social connection (reduce loneliness)
 * - Trust in institutions (seeing tangible progress)
 */
export function applyVolunteerResearchBenefits(state: GameState, volunteerCompute: number): void {
  if (volunteerCompute < 10) return; // Need meaningful contribution
  
  const participationRate = calculateParticipationRate(state);
  if (participationRate < 0.01) return; // Need >1% participation
  
  // 1. MEANING: Volunteering provides purpose
  // -0.5% to -2% meaning crisis per month based on participation
  const meaningReduction = participationRate * 0.04; // Up to -2% at 50% participation
  if (state.socialAccumulation) {
    state.socialAccumulation.meaningCrisis = Math.max(
      0,
      state.socialAccumulation.meaningCrisis - meaningReduction
    );
  }
  
  // 2. EDUCATION: Learning through contribution
  // People gain skills while doing research
  if (state.ubiSystem?.purposeInfrastructure) {
    const educationGain = participationRate * 0.02; // Up to +1% per month
    state.ubiSystem.purposeInfrastructure.educationAccess = Math.min(
      1.0,
      state.ubiSystem.purposeInfrastructure.educationAccess + educationGain
    );
  }
  
  // 3. SOCIAL CONNECTION: Working together builds community
  if (state.ubiSystem?.purposeInfrastructure) {
    const socialGain = participationRate * 0.015;
    state.ubiSystem.purposeInfrastructure.socialConnection = Math.min(
      1.0,
      state.ubiSystem.purposeInfrastructure.socialConnection + socialGain
    );
  }
  
  // 4. TRUST: Seeing research make progress builds trust in institutions
  if (state.globalMetrics) {
    const trustGain = participationRate * 0.01; // Up to +0.5% per month
    state.globalMetrics.publicTrust = Math.min(
      1.0,
      (state.globalMetrics.publicTrust || 0.5) + trustGain
    );
  }
}

