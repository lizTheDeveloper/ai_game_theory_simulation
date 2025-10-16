/**
 * Human Enhancement & AI-Human Merger System (TIER 4.6)
 * 
 * Initializes and updates human cognitive enhancement tracking.
 * Models pathway from AI-assisted amplification to potential merger.
 * 
 * Research Foundation:
 * - Brynjolfsson et al. (2025): 34% productivity gain for low-skill workers
 * - PIAAC (2023): 28% at low literacy creates access inequality  
 * - IMF (2023): 29% digital divide exclusion
 * 
 * @see plans/tier4-6-human-enhancement.md
 * @see reviews/bionic-skills-validation-20251016.md
 */

import {
  HumanEnhancementSystem,
  EnhancementAccess,
  AIAugmentationSystem,
  BCIAdoptionSystem,
  EnhancementStratification,
  HumanAIHybridSystem,
  ENHANCEMENT_PARAMETERS,
} from '../types/humanEnhancement';

/**
 * Initialize Human Enhancement System (TIER 4.6)
 * 
 * Starts with 2025 baseline: AI tools beginning to amplify cognition,
 * but not yet widespread. BCI technology in early development.
 * No cognitive stratification yet, but seeds of inequality present.
 * 
 * NOTE: Individual segment enhancement initialized in initializeSocietySegments().
 * This function creates aggregate tracking system.
 */
export function initializeHumanEnhancementSystem(): HumanEnhancementSystem {
  // Initialize global barriers (2025 baseline)
  const barriers: EnhancementBarriers = {
    economicBarrier: 0.40,        // 40% can't afford AI tools/training
    geographicBarrier: 0.25,      // 25% lack infrastructure (rural broadband)
    educationBarrier: 0.30,       // 30% lack digital literacy (PIAAC: 28%)
    culturalBarrier: 0.15,        // 15% resist technology on principle
    regulatoryBarrier: 0.10,      // 10% regulatory uncertainty (AI regulation debates)
  };

  // Initialize BCI adoption (future state - not yet available in 2025)
  const bciAdoption: BCIAdoptionSystem = {
    // No BCIs commercially available in 2025
    bciAdoptionLevel: 0,
    eliteAdoption: 0,
    militaryAdoption: 0,
    corporateAdoption: 0,
    generalPublicAdoption: 0,
    
    // Technology not ready (Neuralink still experimental)
    bciSafetyLevel: 0.20,              // 20% safety (experimental only, FDA trials)
    bciCostLevel: ENHANCEMENT_PARAMETERS.BCI_INITIAL_COST,  // $100K initial estimate
    bciCapabilityLevel: 0.10,          // 10% capability (very limited - cursor control only)
    
    // High barriers (public concern about brain hacking)
    publicSafetyConcern: 0.80,         // 80% fear brain hacking/malware
    religiousObjection: 0.40,          // 40% ethical concerns (playing god)
    regulatoryRestriction: 0.60,       // 60% regulatory uncertainty (FDA approval pending)
    corporatePressure: 0.10,           // 10% workplace pressure (low for now)
    
    // Not yet available (will be triggered by tech tree)
    bciAvailableMonth: null,
    monthsSinceBCIAvailable: 0,
  };

  // Initialize stratification (minimal in 2025)
  const stratification: EnhancementStratification = {
    // Population distribution (2025 baseline)
    fullyEnhanced: 0,                  // No full enhancement yet
    aiAugmented: 0.25,                 // 25% using AI tools
    baseline: 0.70,                    // 70% baseline (no AI)
    enhancementResistant: 0.05,        // 5% actively resist
    
    // Minimal stratification
    cognitiveGap: 1.21,                // 1.21x gap (elite vs precariat)
    socialStratification: 0.15,        // 15% stratification (early signs)
    economicStratification: 0.20,      // 20% economic gap from AI
    politicalStratification: 0.10,     // 10% political gap
    
    // No thresholds crossed yet
    cognitiveApartheidActive: false,
    bifurcationRisk: 0.05,             // 5% risk (very early)
    mergerProgress: 0,                 // No merger progress
    
    // Minimal resistance
    neoLudditeMovement: 0.10,          // 10% movement strength
    enhancementConflict: 0.05,         // 5% conflict level
    regulatoryBacklash: 0.15,          // 15% regulatory pressure
  };

  // Initialize hybrid system (purely speculative)
  const hybridSystem: HumanAIHybridSystem = {
    // No hybrids in 2025
    hybridCount: 0,
    hybridFraction: 0,
    
    // No merger types
    consciousnessUpload: 0,
    aiAssimilatedHumans: 0,
    partialMerger: 0,
    
    // No characteristics (N/A)
    hybridCapability: 0,
    hybridAlignment: 0,
    hybridAutonomy: 0,
    
    // No outcomes
    mergerPathActive: false,
    speciesBifurcation: false,
    humanExtinctionByMerger: false,
  };

  // Overall system state (aggregate metrics from segments)
  return {
    barriers,
    bciAdoption,
    stratification,
    hybridSystem,
    
    // Aggregate metrics (will be calculated from segments)
    overallEnhancementLevel: 0.10,     // 10% overall enhancement (early AI adoption)
    overallProductivityMultiplier: 1.08, // Population-weighted: ~8% boost
    enhancementInequality: 0.30,       // 30% inequality (moderate)
    productivityGap: 1.21,             // 1.15 / 0.95 = 1.21x gap (elite/precariat)
    
    // Trajectory
    enhancementTrajectory: 'accelerating',  // AI adoption accelerating rapidly
    monthsSinceLastUpdate: 0,
    
    // No outcome yet
    potentialOutcome: null,
    outcomeConfidence: 0,
    monthsInOutcome: 0,
  };
}

/**
 * Update Human Enhancement System (TIER 4.6)
 * 
 * Called each month to update enhancement adoption, BCI availability,
 * stratification, and potential merger pathways.
 * 
 * Flow:
 * 1. Update AI augmentation adoption (gradual growth)
 * 2. Check BCI availability (tech tree trigger)
 * 3. Update BCI adoption if available (S-curve)
 * 4. Calculate aggregate metrics from segments
 * 5. Check stratification thresholds
 * 6. Detect potential outcomes
 * 
 * @param state - Current game state
 */
export function updateHumanEnhancementSystem(state: import('../types/game').GameState): void {
  const system = state.humanEnhancementSystem;
  const segments = state.society.segments;
  const month = state.currentMonth;
  
  if (!segments || segments.length === 0) {
    return; // No segments, skip (backward compatibility)
  }
  
  // === STEP 1: Update AI Augmentation Adoption ===
  updateAIAugmentation(state, segments, system);
  
  // === STEP 2: Check BCI Availability (Tech Tree Trigger) ===
  checkBCIAvailability(state, system);
  
  // === STEP 3: Update BCI Adoption (if available) ===
  if (system.bciAdoption.bciAvailableMonth !== null) {
    updateBCIAdoption(state, segments, system);
  }
  
  // === STEP 4: Calculate Aggregate Metrics ===
  calculateAggregateMetrics(segments, system);
  
  // === STEP 5: Update Stratification ===
  updateStratification(segments, system);
  
  // === STEP 6: Check for Cognitive Apartheid / Merger / Bifurcation ===
  checkEnhancementOutcomes(system);
  
  // === STEP 7: Integration with Other Systems ===
  // Note: Productivity multipliers applied by QoL/economic systems
  // Social cohesion affected by enhancementInequality
  // Cognitive Spiral amplified by overallEnhancementLevel
  // Dystopia paths enabled by cognitive apartheid
  
  system.monthsSinceLastUpdate = 0;
  
  // Log significant events
  if (month % 12 === 0 && month > 0) {
    console.log(`\n[Human Enhancement - Year ${Math.floor(month/12)}]`);
    console.log(`  Overall Enhancement: ${(system.overallEnhancementLevel * 100).toFixed(1)}%`);
    console.log(`  Productivity Gap: ${system.productivityGap.toFixed(2)}x`);
    console.log(`  Inequality (Gini): ${(system.enhancementInequality * 100).toFixed(1)}%`);
    
    if (system.bciAdoption.bciAdoptionLevel > 0) {
      console.log(`  BCI Adoption: ${(system.bciAdoption.bciAdoptionLevel * 100).toFixed(1)}%`);
    }
    
    if (system.stratification.cognitiveApartheidActive) {
      console.log(`  ⚠️  COGNITIVE APARTHEID ACTIVE`);
    }
    
    if (system.potentialOutcome) {
      console.log(`  Potential Outcome: ${system.potentialOutcome} (${(system.outcomeConfidence * 100).toFixed(0)}% confidence)`);
    }
  }
}

/**
 * Step 1: Update AI Augmentation Adoption
 * 
 * AI tool adoption grows gradually over time, accelerating with:
 * - Economic stage (post-scarcity → more access)
 * - QoL (better infrastructure → easier access)
 * - Declining barriers (cost, education, infrastructure)
 */
function updateAIAugmentation(
  state: import('../types/game').GameState,
  segments: import('../types/game').SocietySegment[],
  system: HumanEnhancementSystem
): void {
  const economicStage = state.globalMetrics.economicTransitionStage;
  const qol = state.globalMetrics.qualityOfLife;
  
  // Growth rate: 2-5% per year depending on conditions
  const baseGrowthRate = 0.02 / 12; // 2% annual → 0.17% monthly
  const economicMultiplier = 1 + (economicStage * 0.5); // 1x to 3x boost
  const qolMultiplier = 0.5 + qol; // 0.5x to 1.5x boost
  const monthlyGrowth = baseGrowthRate * economicMultiplier * qolMultiplier;
  
  // Update each segment's adoption (grows toward their access level)
  segments.forEach(segment => {
    const headroom = segment.aiAugmentationAccess - segment.aiAugmentationAdoption;
    if (headroom > 0) {
      // Adoption grows toward access limit (S-curve)
      const adoptionGrowth = headroom * monthlyGrowth;
      segment.aiAugmentationAdoption = Math.min(
        segment.aiAugmentationAccess,
        segment.aiAugmentationAdoption + adoptionGrowth
      );
      
      // Update productivity multiplier based on adoption
      // Productivity = baseline + (adoption * amplification * access)
      const amplification = getAmplificationByEducation(segment.education);
      segment.productivityMultiplier = 1.0 + (
        segment.aiAugmentationAdoption * amplification * segment.aiAugmentationAccess
      );
      
      // Update overall enhancement level
      segment.enhancementLevel = segment.aiAugmentationAdoption * segment.aiAugmentationAccess + 
        segment.bciAdoption;
    }
  });
  
  // Reduce barriers over time (slowly)
  system.barriers.economicBarrier = Math.max(0.10, system.barriers.economicBarrier - 0.001); // -1.2% per year
  system.barriers.geographicBarrier = Math.max(0.05, system.barriers.geographicBarrier - 0.0005); // -0.6% per year
  system.barriers.educationBarrier = Math.max(0.15, system.barriers.educationBarrier - 0.0003); // -0.36% per year
}

/**
 * Step 2: Check if BCI becomes available
 * 
 * BCI availability triggered by breakthrough technology in tech tree.
 * Requires: Neural Interface tech unlocked + safety threshold met.
 */
function checkBCIAvailability(
  state: import('../types/game').GameState,
  system: HumanEnhancementSystem
): void {
  // Already available
  if (system.bciAdoption.bciAvailableMonth !== null) {
    system.bciAdoption.monthsSinceBCIAvailable++;
    return;
  }
  
  // Check tech tree for "Neural Interface" or similar BCI tech
  const technologies = state.breakthroughTech?.technologies || [];
  const bciTech = technologies.find(
    tech => tech.name.toLowerCase().includes('neural interface') || 
            tech.name.toLowerCase().includes('brain-computer') ||
            tech.id === 'bci_interface' // Specific ID if exists
  );
  
  // BCI available if tech deployed AND safety threshold met
  if (bciTech && bciTech.deployed && system.bciAdoption.bciSafetyLevel >= 0.70) {
    system.bciAdoption.bciAvailableMonth = state.currentMonth;
    system.bciAdoption.monthsSinceBCIAvailable = 0;
    
    console.log(`\n🧠 BRAIN-COMPUTER INTERFACES NOW AVAILABLE (Month ${state.currentMonth})`);
    console.log(`   Safety Level: ${(system.bciAdoption.bciSafetyLevel * 100).toFixed(0)}%`);
    console.log(`   Initial Cost: $${(system.bciAdoption.bciCostLevel / 1000).toFixed(0)}K`);
  }
  
  // Safety improves slowly with research investment
  if (state.government.investmentInResearch > 0.30) {
    system.bciAdoption.bciSafetyLevel = Math.min(0.95, 
      system.bciAdoption.bciSafetyLevel + 0.001); // +1.2% per year at high research
  }
}

/**
 * Step 3: Update BCI Adoption (if available)
 * 
 * BCI adoption follows S-curve with elite early adopters.
 * Adoption rate depends on: cost, safety concerns, corporate pressure.
 */
function updateBCIAdoption(
  state: import('../types/game').GameState,
  segments: import('../types/game').SocietySegment[],
  system: HumanEnhancementSystem
): void {
  const bci = system.bciAdoption;
  const monthsSince = bci.monthsSinceBCIAvailable;
  
  // Cost declines over time (15% per year = Moore's Law analogue)
  bci.bciCostLevel = Math.max(1000, 
    bci.bciCostLevel * (1 - ENHANCEMENT_PARAMETERS.BCI_COST_DECLINE_RATE / 12)
  );
  
  // Safety concerns decline slowly as adoption proves safety
  bci.publicSafetyConcern = Math.max(0.20,
    bci.publicSafetyConcern - 0.002); // -2.4% per year
  
  // Corporate pressure increases as BCIs become competitive advantage
  bci.corporatePressure = Math.min(0.70,
    bci.corporatePressure + 0.003); // +3.6% per year
  
  // Base adoption rate (S-curve parameters)
  const baseRate = ENHANCEMENT_PARAMETERS.BCI_ADOPTION_RATE / 12; // Monthly
  
  // Update segment-level BCI adoption
  segments.forEach(segment => {
    let segmentRate = baseRate;
    
    // Elite adopts faster
    if (segment.economicStatus === 'elite') {
      segmentRate *= ENHANCEMENT_PARAMETERS.BCI_ELITE_EARLY_MULTIPLIER; // 5x faster
    }
    
    // Affordability gate (cost vs economic power)
    const canAfford = segment.economicPower > (bci.bciCostLevel / 100000) * 0.01;
    if (!canAfford) {
      segmentRate *= 0.1; // 90% reduction if unaffordable
    }
    
    // Safety concerns slow adoption
    segmentRate *= (1 - bci.publicSafetyConcern * 0.5);
    
    // Corporate pressure accelerates for working segments
    if (segment.economicStatus === 'middle' || segment.economicStatus === 'working') {
      segmentRate *= (1 + bci.corporatePressure);
    }
    
    // Update segment BCI adoption (S-curve toward saturation)
    const saturation = segment.openness; // Max adoption = segment openness
    const headroom = saturation - segment.bciAdoption;
    if (headroom > 0) {
      segment.bciAdoption = Math.min(saturation,
        segment.bciAdoption + headroom * segmentRate);
      
      // BCI provides additional productivity boost
      const bciBoost = segment.bciAdoption * 0.5; // Up to 50% boost
      segment.productivityMultiplier += bciBoost;
      segment.enhancementLevel = segment.aiAugmentationAdoption * segment.aiAugmentationAccess + 
        segment.bciAdoption;
    }
  });
  
  // Update aggregate BCI metrics
  bci.bciAdoptionLevel = segments.reduce((sum, s) => 
    sum + s.bciAdoption * s.populationFraction, 0);
  bci.eliteAdoption = segments.find(s => s.economicStatus === 'elite')?.bciAdoption || 0;
  bci.generalPublicAdoption = segments.filter(s => s.economicStatus !== 'elite')
    .reduce((sum, s) => sum + s.bciAdoption * s.populationFraction, 0) / 0.95;
}

/**
 * Get amplification factor by education level
 * 
 * Lower education = higher amplification potential (Brynjolfsson et al.)
 */
function getAmplificationByEducation(education: 'high' | 'medium' | 'low'): number {
  switch (education) {
    case 'high': return ENHANCEMENT_PARAMETERS.EXPERT_AMPLIFICATION; // 0.10
    case 'medium': return ENHANCEMENT_PARAMETERS.INTERMEDIATE_AMPLIFICATION; // 0.30
    case 'low': return ENHANCEMENT_PARAMETERS.NOVICE_AMPLIFICATION; // 0.60
  }
}

/**
 * Step 4: Calculate Aggregate Metrics from Segments
 * 
 * Derive population-level metrics from individual segment data.
 */
function calculateAggregateMetrics(
  segments: import('../types/game').SocietySegment[],
  system: HumanEnhancementSystem
): void {
  // Population-weighted enhancement level
  system.overallEnhancementLevel = segments.reduce((sum, s) =>
    sum + s.enhancementLevel * s.populationFraction, 0);
  
  // Population-weighted productivity multiplier
  system.overallProductivityMultiplier = segments.reduce((sum, s) =>
    sum + s.productivityMultiplier * s.populationFraction, 0);
  
  // Calculate productivity gap (max / min)
  const productivities = segments.map(s => s.productivityMultiplier);
  const maxProd = Math.max(...productivities);
  const minProd = Math.min(...productivities);
  system.productivityGap = maxProd / minProd;
  
  // Calculate Gini coefficient of enhancement
  const enhancements = segments.map((s, i) => ({
    value: s.enhancementLevel,
    fraction: s.populationFraction
  })).sort((a, b) => a.value - b.value);
  
  let cumulativePop = 0;
  let cumulativeEnhancement = 0;
  let giniSum = 0;
  
  enhancements.forEach(e => {
    const prevCumPop = cumulativePop;
    const prevCumEnh = cumulativeEnhancement;
    cumulativePop += e.fraction;
    cumulativeEnhancement += e.value * e.fraction;
    
    // Trapezoidal rule for area under Lorenz curve
    giniSum += (cumulativePop - prevCumPop) * (cumulativeEnhancement + prevCumEnh) / 2;
  });
  
  const totalEnhancement = cumulativeEnhancement;
  const areaUnderLorenz = giniSum / (totalEnhancement || 1);
  system.enhancementInequality = 1 - 2 * areaUnderLorenz;
  system.enhancementInequality = Math.max(0, Math.min(1, system.enhancementInequality));
}

/**
 * Step 5: Update Stratification Metrics
 * 
 * Track how population segments diverge into distinct cognitive classes.
 */
function updateStratification(
  segments: import('../types/game').SocietySegment[],
  system: HumanEnhancementSystem
): void {
  const strat = system.stratification;
  
  // Classify population by enhancement level
  strat.fullyEnhanced = segments.reduce((sum, s) =>
    sum + (s.enhancementLevel > 0.70 ? s.populationFraction : 0), 0);
  strat.aiAugmented = segments.reduce((sum, s) =>
    sum + (s.enhancementLevel > 0.30 && s.enhancementLevel <= 0.70 ? s.populationFraction : 0), 0);
  strat.baseline = segments.reduce((sum, s) =>
    sum + (s.enhancementLevel > 0.05 && s.enhancementLevel <= 0.30 ? s.populationFraction : 0), 0);
  strat.enhancementResistant = segments.reduce((sum, s) =>
    sum + ((s.openness < 0.40 && s.enhancementLevel < 0.10) ? s.populationFraction : 0), 0);
  
  // Cognitive gap = productivity gap
  strat.cognitiveGap = system.productivityGap;
  
  // Social stratification = Gini * cognitive gap (compounds inequality)
  strat.socialStratification = system.enhancementInequality * (strat.cognitiveGap - 1) / 2;
  strat.socialStratification = Math.min(1, strat.socialStratification);
  
  // Economic stratification = how much economic power diverges from population
  const economicGini = calculateGini(segments.map(s => s.economicPower / s.populationFraction));
  strat.economicStratification = economicGini;
  
  // Political stratification = how much political power diverges from population
  const politicalGini = calculateGini(segments.map(s => s.politicalPower / s.populationFraction));
  strat.politicalStratification = politicalGini;
  
  // Check if cognitive apartheid threshold crossed
  const apartheidThreshold = strat.cognitiveGap >= ENHANCEMENT_PARAMETERS.COGNITIVE_APARTHEID_GAP &&
    strat.socialStratification > 0.50;
  
  if (apartheidThreshold && !strat.cognitiveApartheidActive) {
    strat.cognitiveApartheidActive = true;
    console.log(`\n⚠️  COGNITIVE APARTHEID ACTIVATED`);
    console.log(`   Cognitive Gap: ${strat.cognitiveGap.toFixed(2)}x`);
    console.log(`   Social Stratification: ${(strat.socialStratification * 100).toFixed(1)}%`);
  }
  
  // Calculate bifurcation risk
  strat.bifurcationRisk = calculateBifurcationRisk(system);
  
  // Merger progress (requires high enhancement + BCI adoption)
  const mergerProgress = (system.overallEnhancementLevel + system.bciAdoption.bciAdoptionLevel) / 2;
  strat.mergerProgress = Math.min(1, mergerProgress);
  
  // Neo-Luddite movement strength (backlash against enhancement)
  if (strat.cognitiveApartheidActive) {
    strat.neoLudditeMovement = Math.min(0.40, strat.neoLudditeMovement + 0.01); // Grows 12% per year
  } else {
    strat.neoLudditeMovement = Math.max(0.05, strat.neoLudditeMovement - 0.002); // Decays slowly
  }
  
  // Enhancement conflict (social unrest from inequality)
  strat.enhancementConflict = strat.socialStratification * strat.neoLudditeMovement;
  
  // Regulatory backlash
  strat.regulatoryBacklash = Math.min(0.70, 
    strat.enhancementConflict * 0.5 + system.barriers.regulatoryBarrier);
}

/**
 * Step 6: Check for Enhancement Outcomes
 * 
 * Detect which enhancement pathway is emerging.
 */
function checkEnhancementOutcomes(system: HumanEnhancementSystem): void {
  const strat = system.stratification;
  let outcome: EnhancementOutcome | null = null;
  let confidence = 0;
  
  // Cognitive Apartheid (stratification → permanent inequality)
  if (strat.cognitiveApartheidActive && strat.socialStratification > 0.60) {
    outcome = 'cognitive_apartheid';
    confidence = Math.min(0.95, strat.socialStratification);
  }
  
  // Gradual Merger (high enhancement + high BCI + low inequality)
  else if (system.overallEnhancementLevel > 0.60 && 
           system.bciAdoption.bciAdoptionLevel > 0.40 &&
           system.enhancementInequality < 0.30) {
    outcome = 'gradual_merger';
    confidence = (system.overallEnhancementLevel + system.bciAdoption.bciAdoptionLevel) / 2;
  }
  
  // Species Bifurcation (extreme gap + BCI divergence)
  else if (strat.bifurcationRisk > 0.60) {
    outcome = 'species_bifurcation';
    confidence = strat.bifurcationRisk;
  }
  
  // Enhancement Trap (inequality + conflict → everyone worse off)
  else if (strat.enhancementConflict > 0.30 && system.productivityGap > 2.5) {
    outcome = 'enhancement_trap';
    confidence = Math.min(0.90, strat.enhancementConflict + 0.20);
  }
  
  // Neo-Luddite Victory (backlash → enhancement rejected)
  else if (strat.neoLudditeMovement > 0.35 && strat.regulatoryBacklash > 0.50) {
    outcome = 'neo_luddite_victory';
    confidence = (strat.neoLudditeMovement + strat.regulatoryBacklash) / 2;
  }
  
  // Universal Enhancement (high enhancement + low inequality)
  else if (system.overallEnhancementLevel > 0.70 && system.enhancementInequality < 0.25) {
    outcome = 'universal_enhancement';
    confidence = system.overallEnhancementLevel * (1 - system.enhancementInequality);
  }
  
  // Update outcome tracking
  if (outcome === system.potentialOutcome) {
    system.monthsInOutcome++;
  } else {
    system.potentialOutcome = outcome;
    system.outcomeConfidence = confidence;
    system.monthsInOutcome = 1;
  }
}

/**
 * Calculate Gini coefficient from array of values
 */
function calculateGini(values: number[]): number {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const mean = sorted.reduce((sum, v) => sum + v, 0) / n;
  
  if (mean === 0) return 0;
  
  let giniSum = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      giniSum += Math.abs(sorted[i] - sorted[j]);
    }
  }
  
  return giniSum / (2 * n * n * mean);
}

/**
 * Check for cognitive apartheid threshold
 * 
 * Cognitive apartheid occurs when enhancement gap exceeds 2x
 * and becomes permanent (institutionalized inequality).
 * 
 * @param system - Enhancement system state
 * @returns True if cognitive apartheid is active
 */
export function checkCognitiveApartheidThreshold(
  system: HumanEnhancementSystem
): boolean {
  const strat = system.stratification;
  
  // Threshold: 2x gap + persistent for 24+ months
  return strat.cognitiveGap >= ENHANCEMENT_PARAMETERS.COGNITIVE_APARTHEID_GAP &&
    strat.socialStratification > 0.50;  // 50% institutionalized
}

/**
 * Check for merger pathway activation
 * 
 * Merger pathway activates when 50%+ population is enhanced
 * and trend is toward deeper integration with AI.
 * 
 * @param system - Enhancement system state
 * @returns True if merger path is active
 */
export function checkMergerPathway(
  system: HumanEnhancementSystem
): boolean {
  const strat = system.stratification;
  const bci = system.bciAdoption;
  
  // Merger requires significant BCI adoption + AI augmentation
  return (strat.fullyEnhanced + strat.aiAugmented) >= ENHANCEMENT_PARAMETERS.MERGER_THRESHOLD &&
    bci.bciAdoptionLevel > 0.20;  // 20% BCI adoption
}

/**
 * Check for species bifurcation risk
 * 
 * Bifurcation occurs when enhanced and baseline populations
 * diverge so much they become separate species.
 * 
 * @param system - Enhancement system state
 * @returns Bifurcation risk [0, 1]
 */
export function calculateBifurcationRisk(
  system: HumanEnhancementSystem
): number {
  const strat = system.stratification;
  const bci = system.bciAdoption;
  
  // Risk factors:
  // 1. Large cognitive gap (>3x)
  // 2. Significant BCI adoption creating biological difference
  // 3. Social stratification preventing mixing
  
  let risk = 0;
  
  // Cognitive gap contribution
  if (strat.cognitiveGap > 3.0) {
    risk += 0.30;  // 30% risk from gap
  } else if (strat.cognitiveGap > 2.0) {
    risk += 0.15;  // 15% risk from moderate gap
  }
  
  // BCI adoption contribution (biological divergence)
  if (bci.bciAdoptionLevel > 0.30) {
    risk += 0.40;  // 40% risk from widespread BCI
  } else if (bci.bciAdoptionLevel > 0.10) {
    risk += 0.20;  // 20% risk from emerging BCI
  }
  
  // Social stratification contribution
  risk += strat.socialStratification * 0.30;  // Up to 30% from stratification
  
  return Math.min(1.0, risk);
}

