/**
 * P2.3: Bionic Skills & AI Amplification System (Oct 16, 2025)
 * 
 * Models how AI amplifies human capabilities ("bionic skills") differentially across population segments.
 * 
 * Key insights:
 * - Many projects fail due to skill gaps (70% global project failure rate)
 * - AI provides baseline capability boost for everyone
 * - LESS skilled workers benefit MORE from AI (GitHub Copilot: novices gain 56% speed)
 * - But access is unequal (digital divide limits precariat/rural access)
 * 
 * High-value skills that AI amplifies:
 * - Writing/copywriting (emails, grants, proposals)
 * - SQL/data analysis
 * - Communication/collaboration
 * - Technical documentation
 * - Code writing/debugging
 * 
 * Research:
 * - PIAAC 2023: 28% US adults at Level 1 literacy, 34% at Level 1 numeracy
 * - GitHub Copilot: 55.8% faster coding (Peng et al. 2023)
 * - ChatGPT: 70% productivity for business writing (Rajbhoj et al. 2024)
 * - Project failures: 50% due to communication gaps (PMI 2024)
 * 
 * @see Industrial-Organizational Psychology research on skill gaps
 * @see OECD PIAAC adult skills assessment
 */

import { GameState, SocietySegment } from '@/types/game';

/**
 * Skill categories that AI can amplify
 * Based on IO psychology research on project failure and PIAAC assessment
 */
export interface SkillProfile {
  // Core literacy skills (PIAAC Level 0-5)
  literacy: number;          // 0-1 (Reading, writing, communication)
  numeracy: number;          // 0-1 (Math, data analysis, SQL)
  problemSolving: number;    // 0-1 (Adaptive problem solving, debugging)
  
  // Professional skills (corporate/org success)
  technicalWriting: number;  // 0-1 (Documentation, proposals, grants)
  interpersonal: number;     // 0-1 (Collaboration, conflict resolution)
  projectManagement: number; // 0-1 (Planning, execution, tracking)
  
  // Digital skills
  softwareCompetency: number; // 0-1 (Using tools, learning new software)
  aiLiteracy: number;         // 0-1 (Knowing how to prompt/use AI effectively)
  
  // Aggregate: Overall effectiveness
  overallEffectiveness: number; // 0-1 (Combined productivity)
}

/**
 * Initialize skill profiles for each population segment
 * Based on PIAAC 2023 US data and education/economic correlations
 * 
 * PIAAC proficiency levels:
 * - Level 1 or below: 28% literacy, 34% numeracy (struggling)
 * - Level 2: 28% (basic skills)
 * - Level 3: 32% (moderate proficiency)
 * - Level 4-5: 12% (high proficiency)
 */
export function initializeSegmentSkills(segment: SocietySegment): SkillProfile {
  const status = segment.economicStatus;
  const education = segment.education;
  
  // Skill baselines by segment
  if (status === 'elite') {
    // Elite: High education, access to training, Level 4-5 PIAAC
    return {
      literacy: 0.85,
      numeracy: 0.80,
      problemSolving: 0.85,
      technicalWriting: 0.80,
      interpersonal: 0.75,
      projectManagement: 0.85,
      softwareCompetency: 0.90,
      aiLiteracy: 0.70,  // Early adopters, understand how to use AI
      overallEffectiveness: 0.85,
    };
  } else if (status === 'middle') {
    // Middle class: Moderate education, Level 2-3 PIAAC
    return {
      literacy: 0.65,
      numeracy: 0.60,
      problemSolving: 0.60,
      technicalWriting: 0.55,
      interpersonal: 0.65,
      projectManagement: 0.50,
      softwareCompetency: 0.70,
      aiLiteracy: 0.45,  // Some familiarity, learning to use AI
      overallEffectiveness: 0.60,
    };
  } else if (status === 'working') {
    // Working class: Basic education, Level 1-2 PIAAC
    return {
      literacy: 0.45,
      numeracy: 0.40,
      problemSolving: 0.40,
      technicalWriting: 0.30,
      interpersonal: 0.55,
      projectManagement: 0.30,
      softwareCompetency: 0.50,
      aiLiteracy: 0.25,  // Limited exposure, may not know how to use AI effectively
      overallEffectiveness: 0.40,
    };
  } else { // precariat
    // Precariat: Low education, Level 1 or below PIAAC (28-34% of US adults)
    return {
      literacy: 0.25,
      numeracy: 0.20,
      problemSolving: 0.25,
      technicalWriting: 0.15,
      interpersonal: 0.40,
      projectManagement: 0.15,
      softwareCompetency: 0.30,
      aiLiteracy: 0.10,  // Minimal exposure, digital divide
      overallEffectiveness: 0.25,
    };
  }
}

/**
 * Calculate task complexity from baseline skill
 * Maps skill level to cognitive complexity required
 * 
 * Capability scale (per user):
 * 1.0 = Median human (IQ 100)
 * 2.0 = 1 SD above (IQ 115)
 * 5.0 = 5 SD above (IQ 175)
 * 6.0+ = Superintelligence
 * 
 * @param baselineSkill Skill level [0,1]
 * @returns Task complexity [0.5, 4.0]
 */
function getTaskComplexity(baselineSkill: number): number {
  // Map skill to complexity:
  // 0.25 (precariat) → 0.8 (routine tasks)
  // 0.40 (working) → 1.2 (basic professional)
  // 0.60 (middle) → 1.8 (intermediate professional)
  // 0.85 (elite) → 3.5 (expert tasks)
  return 0.5 + (baselineSkill * 4.0);
}

/**
 * Determine automation phase based on AI capability vs task complexity
 * 
 * COMPLEMENTARITY: AI helps but can't replace human
 * TRANSITION: AI can do some aspects, hybrid human-AI work
 * SUBSTITUTION: AI can perform task independently
 * 
 * @param aiCapability Global AI capability [0,∞)
 * @param taskComplexity Cognitive complexity required [0.5, 4.0]
 * @returns Phase multiplier [0, 1] (1 = full complementarity, 0 = full substitution)
 */
function getAutomationPhaseMultiplier(
  aiCapability: number,
  taskComplexity: number
): number {
  const ratio = aiCapability / taskComplexity;
  
  if (ratio < 0.6) {
    // COMPLEMENTARITY: AI capability well below task complexity
    return 1.0; // Full amplification benefit
  } else if (ratio < 1.5) {
    // TRANSITION: AI approaching human-level for this task
    // Linear decay from 1.0 (ratio=0.6) to 0.2 (ratio=1.5)
    return 1.0 - ((ratio - 0.6) / 0.9) * 0.8;
  } else {
    // SUBSTITUTION: AI exceeds human-level for this task
    // Residual 20% benefit (humans still add value in edge cases)
    return 0.2;
  }
}

/**
 * Calculate AI amplification factor for a given skill
 * 
 * KEY INSIGHT: Less skilled workers benefit MORE from AI (in absolute terms)
 * But they also have LESS access (digital divide)
 * 
 * UPDATED (Oct 16, 2025): Added phase transition from complementarity → substitution
 * based on automation economics literature (Acemoglu & Restrepo 2022)
 * 
 * Research:
 * - GitHub Copilot: Novices gain 56% speed, experts gain 30%
 * - ChatGPT writing: 40% speed boost for average writers
 * - Effect size decreases with baseline skill (diminishing returns)
 * - BUT: As AI exceeds task complexity, it substitutes rather than amplifies
 * 
 * @param baselineSkill Skill level without AI [0,1]
 * @param aiCapability Global AI capability [0,∞) (1.0 = median human, 6.0 = superintelligence)
 * @param aiAccess Does this segment have access to AI? [0,1]
 * @returns Amplified skill level [0,1]
 */
export function calculateBionicSkill(
  baselineSkill: number,
  aiCapability: number,
  aiAccess: number
): number {
  // No AI or no access = no amplification
  if (aiCapability < 0.1 || aiAccess < 0.1) {
    return baselineSkill;
  }
  
  // Determine task complexity and automation phase
  const taskComplexity = getTaskComplexity(baselineSkill);
  const phaseMultiplier = getAutomationPhaseMultiplier(aiCapability, taskComplexity);
  
  // AI amplification scales with:
  // 1. AI capability (better AI = more boost)
  // 2. Access (digital divide limits benefit)
  // 3. INVERSE of baseline skill (novices benefit more)
  // 4. Automation phase (substitution reduces complementarity)
  
  // Novice benefit (skill < 0.5): Up to 60% boost
  // Expert benefit (skill > 0.8): Up to 20% boost
  const noviceBonus = (1.0 - baselineSkill) * 0.60;
  const expertBonus = baselineSkill * 0.20;
  
  // AI capability multiplier (scales with capability up to 2.0)
  // At 1.0 (median human): 50% of max benefit
  // At 2.0+ (bright human): 100% of max benefit
  const aiMultiplier = Math.min(1.0, aiCapability / 2.0);
  
  // Calculate boost with phase transition
  const rawBoost = (noviceBonus + expertBonus) * aiMultiplier * aiAccess * phaseMultiplier;
  
  // Apply boost (max out at 0.95, can't be perfect)
  const amplifiedSkill = Math.min(0.95, baselineSkill + rawBoost);
  
  return amplifiedSkill;
}

/**
 * Calculate AI access for a segment
 * Based on economic status, geography, and education
 * 
 * Digital divide research:
 * - Urban/educated: 80-90% AI tool access
 * - Rural/low-education: 20-40% access
 * - Precariat: 10-20% access (cost, infrastructure barriers)
 */
export function calculateAIAccess(segment: SocietySegment): number {
  let access = 0.5; // Base 50% access (2025 baseline)
  
  // Economic status (income = access to subscriptions, devices)
  if (segment.economicStatus === 'elite') {
    access += 0.30;  // Elite: Full access (90%+)
  } else if (segment.economicStatus === 'middle') {
    access += 0.15;  // Middle: Good access (70-80%)
  } else if (segment.economicStatus === 'working') {
    access += 0.00;  // Working: Average (50%)
  } else {
    access -= 0.30;  // Precariat: Limited (20%)
  }
  
  // Geographic (infrastructure, internet quality)
  if (segment.geographic.includes('urban')) {
    access += 0.10;  // Urban: Better infrastructure
  } else if (segment.geographic.includes('rural')) {
    access -= 0.15;  // Rural: Worse infrastructure
  }
  
  // Education (digital literacy = knowing how to use AI)
  if (segment.education === 'high') {
    access += 0.10;  // High ed: Know how to use tools
  } else if (segment.education === 'low') {
    access -= 0.10;  // Low ed: Digital literacy barriers
  }
  
  return Math.max(0.10, Math.min(0.95, access));
}

/**
 * Update segment skills with AI amplification
 * Modifies segment skill profile based on available AI capability
 * 
 * @param state Game state
 */
export function updateBionicSkills(state: GameState): void {
  if (!state.society.segments || state.society.segments.length === 0) {
    return;
  }
  
  // Get global AI capability (average across all AIs)
  const avgAICapability = state.aiAgents.length > 0
    ? state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / state.aiAgents.length
    : 0;
  
  for (const segment of state.society.segments) {
    // Get or initialize skills
    if (!(segment as any).skills) {
      (segment as any).skills = initializeSegmentSkills(segment);
    }
    
    const skills = (segment as any).skills as SkillProfile;
    const baseSkills = initializeSegmentSkills(segment); // Original baseline
    const aiAccess = calculateAIAccess(segment);
    
    // Apply AI amplification to each skill
    skills.literacy = calculateBionicSkill(baseSkills.literacy, avgAICapability, aiAccess);
    skills.numeracy = calculateBionicSkill(baseSkills.numeracy, avgAICapability, aiAccess);
    skills.problemSolving = calculateBionicSkill(baseSkills.problemSolving, avgAICapability, aiAccess);
    skills.technicalWriting = calculateBionicSkill(baseSkills.technicalWriting, avgAICapability, aiAccess);
    skills.interpersonal = calculateBionicSkill(baseSkills.interpersonal, avgAICapability, aiAccess);
    skills.projectManagement = calculateBionicSkill(baseSkills.projectManagement, avgAICapability, aiAccess);
    skills.softwareCompetency = calculateBionicSkill(baseSkills.softwareCompetency, avgAICapability, aiAccess);
    skills.aiLiteracy = calculateBionicSkill(baseSkills.aiLiteracy, avgAICapability * 1.5, aiAccess); // AI teaches AI use
    
    // Overall effectiveness = weighted average of skills
    skills.overallEffectiveness = (
      skills.literacy * 0.20 +
      skills.numeracy * 0.15 +
      skills.problemSolving * 0.15 +
      skills.technicalWriting * 0.15 +
      skills.interpersonal * 0.10 +
      skills.projectManagement * 0.10 +
      skills.softwareCompetency * 0.10 +
      skills.aiLiteracy * 0.05
    );
  }
}

/**
 * Calculate economic productivity boost from bionic skills
 * Better skills = more projects succeed = higher GDP
 * 
 * Research: 70% of projects fail globally, 50% due to communication gaps
 * AI reduces failure rate by improving communication, technical, and PM skills
 * 
 * @param state Game state
 * @returns Productivity multiplier [1.0, 2.0+]
 */
export function calculateProductivityMultiplierFromSkills(state: GameState): number {
  if (!state.society.segments || state.society.segments.length === 0) {
    return 1.0; // No segments, no boost
  }
  
  // Calculate population-weighted average skill level
  let weightedSkills = 0;
  let totalWeight = 0;
  
  for (const segment of state.society.segments) {
    const skills = (segment as any).skills as SkillProfile | undefined;
    if (skills) {
      weightedSkills += skills.overallEffectiveness * segment.populationFraction;
      totalWeight += segment.populationFraction;
    }
  }
  
  const avgSkills = totalWeight > 0 ? weightedSkills / totalWeight : 0.5;
  
  // Productivity scales with skills
  // 0.25 skills (baseline precariat) = 0.70x productivity (70% project failure)
  // 0.50 skills (baseline average) = 1.00x productivity
  // 0.75 skills (AI-amplified) = 1.40x productivity (40% failure reduction)
  // 0.90 skills (elite + AI) = 1.70x productivity
  
  const productivityMultiplier = 0.40 + (avgSkills * 1.30);
  
  return Math.max(0.40, Math.min(2.00, productivityMultiplier));
}

