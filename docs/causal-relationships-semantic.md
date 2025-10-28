# Causal Relationships (Semantic Analysis)

**Extraction Method**: AST parsing + comment mining + control flow analysis
**Total Edges**: 1188
**Confidence Range**: 0.70 - 1.00

## High-Confidence Edges (≥0.85)

**globalMetrics → globalMetrics.socialStability** (multiplicative, conf: 1.00)
  - ast: state.globalMetrics.socialStability = Math.max(0, state.globalMetrics.socialStab (aiAgent:425)
  - ast: state.globalMetrics.socialStability = Math.max(0.2, state.globalMetrics.socialSt (dystopiaProgression:70)

**society → society.trustInAI** (multiplicative, conf: 1.00)
  - ast: state.society.trustInAI = Math.max(0, state.society.trustInAI - affectedPopulati (aiAgent:428)
  - ast: state.society.trustInAI = Math.min(1.0, state.society.trustInAI + 0.05) (governmentAgent:769)

**qualityOfLifeSystems → qualityOfLifeSystems.mentalHealth** (multiplicative, conf: 1.00)
  - ast: state.qualityOfLifeSystems.mentalHealth = Math.max(0,
        state.qualityOfLif (aiAgent:435)
  - control-flow: if (surveillance > 0.6 && state.qualityOfLifeSystems) → qualityOfLifeSystems.men (dystopiaProgression:127)

**currentMonth → extinctionState.triggeredAt** (direct, conf: 1.00)
  - ast: state.extinctionState.triggeredAt = state.currentMonth (aiAgent:569)
  - ast: state.extinctionState.triggeredAt = state.currentMonth (aiAgent:654)

**society → society.paranoia** (direct, conf: 1.00)
  - ast: state.society.paranoia = Math.min(1, state.society.paranoia + 0.08) (aiTechActions:249)
  - ast: state.society.paranoia = Math.min(1, state.society.paranoia + 0.12) (aiTechActions:298)

**trust → fear** (direct, conf: 1.00)
  - comment: // Low trust → fear → control response (governmentAgent:2421)
  - comment: // Low trust → fear → hard limits (governmentAgent:2441)

**trust → control** (direct, conf: 1.00)
  - comment: // Low trust → control information flow (governmentAgent:2589)
  - comment: // Low trust → control people movement (governmentAgent:2611)

**currentMonth → government.lastMajorPolicyMonth** (direct, conf: 1.00)
  - ast: state.government.lastMajorPolicyMonth = state.currentMonth (governmentAgent:54)
  - ast: state.government.lastMajorPolicyMonth = state.currentMonth (governmentAgent:129)

**globalMetrics → globalMetrics.economicTransitionStage** (multiplicative, conf: 1.00)
  - ast: state.globalMetrics.economicTransitionStage = Math.max(3.0,
        state.global (governmentAgent:63)
  - ast: state.globalMetrics.economicTransitionStage = Math.min(3.5,
        state.global (governmentAgent:138)

**globalMetrics → globalMetrics.wealthDistribution** (multiplicative, conf: 1.00)
  - ast: state.globalMetrics.wealthDistribution = Math.min(1.0,
        state.globalMetri (governmentAgent:67)
  - ast: state.globalMetrics.wealthDistribution = Math.min(1.0,
        state.globalMetri (governmentAgent:142)

**society → society.socialAdaptation** (direct, conf: 1.00)
  - ast: state.society.socialAdaptation = Math.min(0.9,
        state.society.socialAdapt (governmentAgent:71)
  - ast: state.society.socialAdaptation = Math.min(0.9,
        state.society.socialAdapt (governmentAgent:146)

**government → government.legitimacy** (multiplicative, conf: 1.00)
  - ast: state.government.legitimacy = Math.min(1.0, state.government.legitimacy + effect (governmentAgent:79)
  - ast: state.government.legitimacy = Math.min(1.0, state.government.legitimacy + effect (governmentAgent:150)

**government → government.oversightLevel** (multiplicative, conf: 1.00)
  - ast: state.government.oversightLevel = Math.min(10, state.government.oversightLevel + (governmentAgent:273)
  - ast: state.government.oversightLevel = Math.min(10, state.government.oversightLevel + (governmentAgent:326)

**government.structuralChoices → government.structuralChoices.surveillanceLevel** (direct, conf: 1.00)
  - ast: state.government.structuralChoices.surveillanceLevel = 
        Math.min(1.0, st (governmentAgent:335)
  - ast: state.government.structuralChoices.surveillanceLevel = 
        Math.min(1.0, st (governmentAgent:392)

**government → government.structuralChoices.surveillanceLevel** (direct, conf: 1.00)
  - ast: state.government.structuralChoices.surveillanceLevel = 
        Math.min(1.0, st (governmentAgent:335)
  - ast: state.government.structuralChoices.surveillanceLevel = 
        Math.min(1.0, st (governmentAgent:392)

**government → government.alignmentResearchInvestment** (multiplicative, conf: 1.00)
  - ast: state.government.alignmentResearchInvestment = Math.min(10,
        state.govern (governmentAgent:433)
  - ast: state.government.alignmentResearchInvestment = Math.min(
      10,
      state.g (CriticalJuncturePhase:259)

**government → government.capabilityToControl** (multiplicative, conf: 1.00)
  - ast: state.government.capabilityToControl = Math.min(1.0, state.government.capability (governmentAgent:691)
  - ast: state.government.capabilityToControl = Math.max(0, state.government.capabilityTo (governmentAgent:752)

**government → government.controlDesire** (multiplicative, conf: 1.00)
  - ast: state.government.controlDesire = Math.min(1.0, state.government.controlDesire +  (governmentAgent:694)
  - ast: state.government.controlDesire = Math.max(0, state.government.controlDesire - 0. (governmentAgent:755)

**government.cyberDefense → government.cyberDefense.securityHardening** (direct, conf: 1.00)
  - ast: state.government.cyberDefense.securityHardening = Math.min(10, state.government. (governmentAgent:960)
  - ast: state.government.cyberDefense.securityHardening = Math.min(10, state.government. (securityActions:56)

**government → government.cyberDefense.securityHardening** (direct, conf: 1.00)
  - ast: state.government.cyberDefense.securityHardening = Math.min(10, state.government. (governmentAgent:960)
  - ast: state.government.cyberDefense.securityHardening = Math.min(10, state.government. (securityActions:56)

**government.cyberDefense → government.cyberDefense.monitoring** (direct, conf: 1.00)
  - ast: state.government.cyberDefense.monitoring = Math.min(10, state.government.cyberDe (governmentAgent:961)
  - ast: state.government.cyberDefense.monitoring = Math.min(10, state.government.cyberDe (securityActions:57)

**government → government.cyberDefense.monitoring** (direct, conf: 1.00)
  - ast: state.government.cyberDefense.monitoring = Math.min(10, state.government.cyberDe (governmentAgent:961)
  - ast: state.government.cyberDefense.monitoring = Math.min(10, state.government.cyberDe (securityActions:57)

**government.cyberDefense → government.cyberDefense.sandboxing** (direct, conf: 1.00)
  - ast: state.government.cyberDefense.sandboxing = Math.min(10, state.government.cyberDe (governmentAgent:962)
  - ast: state.government.cyberDefense.sandboxing = Math.min(10, state.government.cyberDe (securityActions:58)

**government → government.cyberDefense.sandboxing** (direct, conf: 1.00)
  - ast: state.government.cyberDefense.sandboxing = Math.min(10, state.government.cyberDe (governmentAgent:962)
  - ast: state.government.cyberDefense.sandboxing = Math.min(10, state.government.cyberDe (securityActions:58)

**government.cyberDefense → government.cyberDefense.incidentResponse** (direct, conf: 1.00)
  - ast: state.government.cyberDefense.incidentResponse = Math.min(10, state.government.c (governmentAgent:963)
  - ast: state.government.cyberDefense.incidentResponse = Math.min(10, state.government.c (securityActions:59)

**government → government.cyberDefense.incidentResponse** (direct, conf: 1.00)
  - ast: state.government.cyberDefense.incidentResponse = Math.min(10, state.government.c (governmentAgent:963)
  - ast: state.government.cyberDefense.incidentResponse = Math.min(10, state.government.c (securityActions:59)

**ecosystem → ecosystem.openResearch** (direct, conf: 1.00)
  - ast: state.ecosystem.openResearch = Math.max(0.1, state.ecosystem.openResearch - 0.3) (governmentAgent:1224)
  - ast: state.ecosystem.openResearch = Math.max(0.1, state.ecosystem.openResearch - 0.3) (crisisActions:61)

**qualityOfLifeSystems → qualityOfLifeSystems.autonomy** (multiplicative, conf: 1.00)
  - control-flow: if (state.qualityOfLifeSystems) → qualityOfLifeSystems.autonomy (governmentAgent:1355)
  - ast: state.qualityOfLifeSystems.autonomy = Math.max(0, 
          state.qualityOfLife (governmentAgent:1356)

**government → government.resources** (direct, conf: 1.00)
  - ast: state.government.resources = state.government.resources - 2 (governmentAgent:1627)
  - ast: state.government.resources = state.government.resources - 5 (governmentAgent:1691)

**government → government.environmentalInterventions** (conditional, conf: 1.00)
  - control-flow: if (!state.government.environmentalInterventions) → government.environmentalInte (governmentAgent:1678)
  - control-flow: if (!state.government.environmentalInterventions) → government.environmentalInte (governmentAgent:1739)

**currentMonth → government.environmentalInterventions.amazonProtection** (direct, conf: 1.00)
  - ast: state.government.environmentalInterventions.amazonProtection = {
        active: (governmentAgent:1681)
  - ast: state.government.environmentalInterventions.amazonProtection = {
        active: (governmentAgent:1938)

**currentMonth → government.environmentalInterventions.coralRestoration** (direct, conf: 1.00)
  - ast: state.government.environmentalInterventions.coralRestoration = {
        active: (governmentAgent:1742)
  - ast: state.government.environmentalInterventions.coralRestoration = {
        active: (governmentAgent:2000)

**currentMonth → government.environmentalInterventions.pesticideBan** (direct, conf: 1.00)
  - ast: state.government.environmentalInterventions.pesticideBan = {
        active: tru (governmentAgent:1806)
  - ast: state.government.environmentalInterventions.pesticideBan = {
        active: tru (governmentAgent:2063)

**environmentalAccumulation → environmentalAccumulation.biodiversityIndex** (direct, conf: 1.00)
  - ast: state.environmentalAccumulation.biodiversityIndex = Math.min(1.0,
        state. (governmentAgent:1813)
  - control-flow: if (state.environmentalAccumulation) → environmentalAccumulation.biodiversityInd (governmentAgent:2077)

**currentMonth → government.environmentalInterventions.techDeploymentFunding** (direct, conf: 1.00)
  - ast: state.government.environmentalInterventions.techDeploymentFunding = {
        ac (governmentAgent:1874)
  - ast: state.government.environmentalInterventions.techDeploymentFunding = {
      acti (environmentalActions:262)

**government.evaluationInvestment → government.evaluationInvestment.benchmarkSuite** (direct, conf: 1.00)
  - ast: state.government.evaluationInvestment.benchmarkSuite = Math.min(
    10,
    sta (governmentAgent:2888)
  - ast: state.government.evaluationInvestment.benchmarkSuite = Math.min(
    10,
    sta (governmentCore:704)

**government → government.evaluationInvestment.benchmarkSuite** (direct, conf: 1.00)
  - ast: state.government.evaluationInvestment.benchmarkSuite = Math.min(
    10,
    sta (governmentAgent:2888)
  - ast: state.government.evaluationInvestment.benchmarkSuite = Math.min(
    10,
    sta (governmentCore:704)

**government.evaluationInvestment → government.evaluationInvestment.alignmentTests** (direct, conf: 1.00)
  - ast: state.government.evaluationInvestment.alignmentTests = Math.min(
    10,
    sta (governmentAgent:2892)
  - ast: state.government.evaluationInvestment.alignmentTests = Math.min(
    10,
    sta (governmentCore:708)

**government → government.evaluationInvestment.alignmentTests** (direct, conf: 1.00)
  - ast: state.government.evaluationInvestment.alignmentTests = Math.min(
    10,
    sta (governmentAgent:2892)
  - ast: state.government.evaluationInvestment.alignmentTests = Math.min(
    10,
    sta (governmentCore:708)

**government.evaluationInvestment → government.evaluationInvestment.redTeaming** (direct, conf: 1.00)
  - ast: state.government.evaluationInvestment.redTeaming = Math.min(
    10,
    state.g (governmentAgent:2896)
  - ast: state.government.evaluationInvestment.redTeaming = Math.min(
    10,
    state.g (governmentCore:712)

**government → government.evaluationInvestment.redTeaming** (direct, conf: 1.00)
  - ast: state.government.evaluationInvestment.redTeaming = Math.min(
    10,
    state.g (governmentAgent:2896)
  - ast: state.government.evaluationInvestment.redTeaming = Math.min(
    10,
    state.g (governmentCore:712)

**government.evaluationInvestment → government.evaluationInvestment.interpretability** (direct, conf: 1.00)
  - ast: state.government.evaluationInvestment.interpretability = Math.min(
    10,
    s (governmentAgent:2900)
  - ast: state.government.evaluationInvestment.interpretability = Math.min(
    10,
    s (governmentCore:716)

**government → government.evaluationInvestment.interpretability** (direct, conf: 1.00)
  - ast: state.government.evaluationInvestment.interpretability = Math.min(
    10,
    s (governmentAgent:2900)
  - ast: state.government.evaluationInvestment.interpretability = Math.min(
    10,
    s (governmentCore:716)

**social → system** (direct, conf: 1.00)
  - comment: message: 'Agent not found or no social influence system' (socialInfluenceActions:51)
  - comment: message: 'Agent not found or no social influence system' (socialInfluenceActions:104)

**Regional → Global** (direct, conf: 1.00)
  - comment: aggregateGlobalQoL  // Oct 26, 2025: Regional → Global aggregation (calculations:41)
  - comment: * FIX (Oct 26, 2025): Regional → Global aggregation architecture (QualityOfLifePhase:7)

**government.governanceQuality → government.governanceQuality.institutionalCapacity** (direct, conf: 1.00)
  - ast: state.government.governanceQuality.institutionalCapacity = Math.min(
    1.0,
   (cooperativeSpirals:86)
  - ast: state.government.governanceQuality.institutionalCapacity = Math.min(
    1.0,
   (cooperativeSpirals:253)

**government → government.governanceQuality.institutionalCapacity** (direct, conf: 1.00)
  - ast: state.government.governanceQuality.institutionalCapacity = Math.min(
    1.0,
   (cooperativeSpirals:86)
  - ast: state.government.governanceQuality.institutionalCapacity = Math.min(
    1.0,
   (cooperativeSpirals:253)

**government → government.governmentType** (conditional, conf: 1.00)
  - control-flow: if (avgAlignment < 0.4 && maxAICapability > 1.5 && sta) → government.governmentT (dystopiaProgression:51)
  - control-flow: if (state.government.governmentType === 'democratic') → government.governmentTyp (dystopiaProgression:76)

**qualityOfLifeSystems → qualityOfLifeSystems.politicalFreedom** (multiplicative, conf: 1.00)
  - control-flow: if (surveillance > 0.6 && state.qualityOfLifeSystems) → qualityOfLifeSystems.pol (dystopiaProgression:127)
  - ast: state.qualityOfLifeSystems.politicalFreedom = Math.max(0, 
      state.qualityOf (dystopiaProgression:132)

**qualityOfLifeSystems → qualityOfLifeSystems.communityStrength** (multiplicative, conf: 1.00)
  - control-flow: if (surveillance > 0.6 && state.qualityOfLifeSystems) → qualityOfLifeSystems.com (dystopiaProgression:127)
  - ast: state.qualityOfLifeSystems.communityStrength = Math.max(0,
      state.qualityOf (dystopiaProgression:147)

**Katrina → Sandy** (direct, conf: 1.00)
  - comment: * - With learning: 50% reduction (Katrina → Sandy precedent) (emergencyManagement:110)
  - comment: * - Learning effects: 50% improvement after experiencing similar crisis (Katrina (EmergencyResponsePhase:11)

**training → testing** (direct, conf: 1.00)
  - comment: * - Progresses lifecycle states (training → testing → deployed → retired) (AILifecyclePhase:6)
  - comment: * - Lifecycle state transitions (training → testing → deployed → retired) (lifecycle:7)

**aiSufferingMetrics → aiSufferingMetrics.publicAwarenessOfSuffering** (conditional, conf: 1.00)
  - control-flow: if (state.aiSufferingMetrics) → aiSufferingMetrics.publicAwarenessOfSuffering (AISufferingPhase:143)
  - ast: state.aiSufferingMetrics.publicAwarenessOfSuffering = Math.min(1.0,
             (AISufferingPhase:144)

**society → society.trust** (multiplicative, conf: 1.00)
  - control-flow: if (state.society.trust !== undefined) → society.trust (AISufferingPhase:169)
  - ast: state.society.trust = Math.max(0, state.society.trust - 0.6) (AISufferingPhase:170)

**madDeterrence → madDeterrence.crisisStability** (conditional, conf: 1.00)
  - control-flow: if (state.madDeterrence) → madDeterrence.crisisStability (CriticalJuncturePhase:230)
  - ast: state.madDeterrence.crisisStability = Math.min(0.9, state.madDeterrence.crisisSt (CriticalJuncturePhase:231)

**socialAccumulation → socialAccumulation.socialCohesion.trust** (conditional, conf: 1.00)
  - control-flow: if (state.socialAccumulation) → socialAccumulation.socialCohesion.trust (CriticalJuncturePhase:295)
  - ast: state.socialAccumulation.socialCohesion.trust = Math.min(
        100,
        s (CriticalJuncturePhase:297)

**socialAccumulation → socialAccumulation.socialCohesion.communityBonds** (conditional, conf: 1.00)
  - control-flow: if (state.socialAccumulation) → socialAccumulation.socialCohesion.communityBonds (CriticalJuncturePhase:295)
  - ast: state.socialAccumulation.socialCohesion.communityBonds = Math.min(
        100,
 (CriticalJuncturePhase:301)

**socialAccumulation → socialAccumulation.meaningCrisisLevel** (multiplicative, conf: 1.00)
  - control-flow: if (state.socialAccumulation) → socialAccumulation.meaningCrisisLevel (CriticalJuncturePhase:295)
  - ast: state.socialAccumulation.meaningCrisisLevel = Math.max(
        0,
        state (CriticalJuncturePhase:309)

**socialAccumulation.socialCohesion → socialAccumulation.socialCohesion.trust** (direct, conf: 1.00)
  - ast: state.socialAccumulation.socialCohesion.trust = Math.min(
        100,
        s (CriticalJuncturePhase:297)
  - ast: state.socialAccumulation.socialCohesion.trust = Math.min(
            80,
       (EmergencyResponsePhase:330)

**socialAccumulation.socialCohesion → socialAccumulation.socialCohesion.communityBonds** (direct, conf: 1.00)
  - ast: state.socialAccumulation.socialCohesion.communityBonds = Math.min(
        100,
 (CriticalJuncturePhase:301)
  - ast: state.socialAccumulation.socialCohesion.communityBonds = Math.min(
            8 (EmergencyResponsePhase:334)

**globalMetrics → globalMetrics.qualityOfLife** (multiplicative, conf: 1.00)
  - ast: state.globalMetrics.qualityOfLife = Math.min(
      2.0,
      state.globalMetri (CriticalJuncturePhase:316)
  - ast: state.globalMetrics.qualityOfLife = Math.min(
            0.7,
            state (EmergencyResponsePhase:299)

**crisis → authoritarianism** (direct, conf: 1.00)
  - comment: // Research: Acemoglu & Robinson (2019) - crisis → authoritarianism (DemocracyDynamicsPhase:83)
  - comment: * Research: Acemoglu & Robinson (2019) - economic crisis → authoritarianism (DemocracyDynamicsPhase:199)

**planetaryBoundariesSystem → planetaryBoundariesSystem.boundaries.freshwater_change.currentValue** (conditional, conf: 1.00)
  - control-flow: if (state.planetaryBoundariesSystem) → planetaryBoundariesSystem.boundaries.fres (EmergencyResponsePhase:280)
  - control-flow: if (state.planetaryBoundariesSystem.boundaries.freshwa) → planetaryBoundariesSys (EmergencyResponsePhase:281)

**planetaryBoundariesSystem → planetaryBoundariesSystem.boundaries.biogeochemical_flows.currentValue** (conditional, conf: 1.00)
  - control-flow: if (state.planetaryBoundariesSystem) → planetaryBoundariesSystem.boundaries.biog (EmergencyResponsePhase:280)
  - control-flow: if (state.planetaryBoundariesSystem.boundaries.biogeoc) → planetaryBoundariesSys (EmergencyResponsePhase:284)

**society → society.unemploymentLevel** (direct, conf: 1.00)
  - ast: state.society.unemploymentLevel = Math.max(
            0.1,
            state.s (EmergencyResponsePhase:305)
  - control-flow: if (state.society) → society.unemploymentLevel (ExogenousShockPhase:372)

**socialAccumulation → socialAccumulation.institutionalLegitimacy** (multiplicative, conf: 1.00)
  - ast: state.socialAccumulation.institutionalLegitimacy = Math.min(
            0.8,
   (EmergencyResponsePhase:340)
  - control-flow: if (state.socialAccumulation) → socialAccumulation.institutionalLegitimacy (informationWarfare:226)

**1 → 0** (direct, conf: 1.00)
  - comment: // Average of pollution types (0-1 → 0-100) (EnvironmentalFeedbackPhase:186)
  - comment: // Electoral Democracy (0-1 → 0-100) (MultiParadigmDUIUpdatePhase:176)

**aiAgents.filter → aiAgents** (direct, conf: 1.00)
  - ast: state.aiAgents = state.aiAgents.filter((a) => !individualsToTerminate.includes(a (EvolutionarySelectionPhase:156)
  - ast: state.aiAgents = state.aiAgents.filter(ai => 
    ai.lifecycleState !== 'retired (lifecycle:583)

**society → society.coordinationCapacity** (multiplicative, conf: 1.00)
  - control-flow: if (state.society) → society.coordinationCapacity (ExogenousShockPhase:164)
  - ast: state.society.coordinationCapacity = Math.max(0, state.society.coordinationCapac (ExogenousShockPhase:166)

**currentMonth → extinctionState.startMonth** (direct, conf: 1.00)
  - ast: state.extinctionState.startMonth = state.currentMonth (ExogenousShockPhase:178)
  - ast: state.extinctionState.startMonth = state.currentMonth (ExogenousShockPhase:294)

**qualityOfLifeSystems.survivalFundamentals → qualityOfLifeSystems.survivalFundamentals.foodSecurity** (multiplicative, conf: 1.00)
  - control-flow: if (totalPop > 0 && state.qualityOfLifeSystems?.surviv) → qualityOfLifeSystems.s (FoodSecurityDegradationPhase:85)
  - control-flow: if (state.qualityOfLifeSystems && state.qualityOfLifeS) → qualityOfLifeSystems.s (RadiationSystemPhase:136)

**qualityOfLifeSystems → qualityOfLifeSystems.survivalFundamentals.foodSecurity** (multiplicative, conf: 1.00)
  - control-flow: if (totalPop > 0 && state.qualityOfLifeSystems?.surviv) → qualityOfLifeSystems.s (FoodSecurityDegradationPhase:85)
  - control-flow: if (state.qualityOfLifeSystems && state.qualityOfLifeS) → qualityOfLifeSystems.s (RadiationSystemPhase:136)

**production → 20** (direct, conf: 1.00)
  - comment: * - Learning curve dynamics (Wright's Law: 2x production → 20-30% cost reduction (PositiveTippingPointsPhase:7)
  - comment: * 3. Learning curve feedback (Wright's Law: 2x production → 20-30% cost reductio (positiveTippingPoints:12)

**batteries → shared** (direct, conf: 1.00)
  - comment: * - Cross-technology synergies (EV + grid batteries → shared learning) (PositiveTippingPointsPhase:8)
  - comment: * 4. Cross-technology synergies (EV + grid batteries → shared learning) (positiveTippingPoints:13)

**qualityOfLifeSystems → qualityOfLifeSystems.healthcareQuality** (multiplicative, conf: 1.00)
  - control-flow: if (state.qualityOfLifeSystems && state.qualityOfLifeS) → qualityOfLifeSystems.h (RadiationSystemPhase:183)
  - ast: state.qualityOfLifeSystems.healthcareQuality = Math.max(0,
      state.qualityOf (RadiationSystemPhase:184)

**inequality → trust** (direct, conf: 1.00)
  - comment: * - Wilkinson & Pickett (2009): Spirit Level - inequality → trust erosion (SocialCohesionUpdatePhase:12)
  - comment: // Research: Wilkinson & Pickett (2009) - inequality → trust erosion (SocialCohesionUpdatePhase:78)

**environmentalAccumulation → environmentalAccumulation.climateStability** (direct, conf: 1.00)
  - ast: state.environmentalAccumulation.climateStability = Math.min(1.0, 
        state. (StochasticInnovationPhase:50)
  - ast: state.environmentalAccumulation.climateStability = Math.min(1.0,
        state.e (StochasticInnovationPhase:67)

**environmentalAccumulation → environmentalAccumulation.resourceReserves** (direct, conf: 1.00)
  - ast: state.environmentalAccumulation.resourceReserves = Math.min(1.0,
        state.e (StochasticInnovationPhase:129)
  - control-flow: if (state.environmentalAccumulation) → environmentalAccumulation.resourceReserve (freshwaterDepletion:230)

**pollution → ecosystem** (direct, conf: 1.00)
  - comment: mechanism: 'Land use change + overexploitation + climate stress + pollution → ec (environmental:577)
  - comment: mechanism: 'Land use change + overexploitation + climate stress + pollution → ec (environmental:607)

**qualityOfLifeSystems → qualityOfLifeSystems.materialAbundance** (direct, conf: 1.00)
  - ast: state.qualityOfLifeSystems.materialAbundance = Math.max(0.1, state.qualityOfLife (freshwaterDepletion:214)
  - ast: state.qualityOfLifeSystems.materialAbundance = Math.max(0, state.qualityOfLifeSy (freshwaterDepletion:239)

**capability → better** (direct, conf: 1.00)
  - comment: // Higher AI cognitive capability → better at hiding contamination (gamingDetection:134)
  - comment: // Higher AI cognitive capability → better at hiding neural signatures (proactiveSleeperDetection:173)

**Crisis → Nationalism** (direct, conf: 1.00)
  - comment: * 2. Meaning Crisis → Nationalism: High domestic meaning crisis drives external  (militarySystem:297)
  - comment: // TRIGGER 2: Meaning Crisis → Nationalism → War (militarySystem:348)

**extinctionState.extinctionTriggered → extinctionState.extinctionType** (conditional, conf: 1.00)
  - control-flow: if (!state.extinctionState.extinctionTriggered) → extinctionState.extinctionType (novelEntities:251)
  - control-flow: if (!state.extinctionState.extinctionTriggered) → extinctionState.extinctionType (oceanAcidification:235)

**extinctionState.extinctionTriggered → extinctionState.extinctionMechanism** (conditional, conf: 1.00)
  - control-flow: if (!state.extinctionState.extinctionTriggered) → extinctionState.extinctionMech (novelEntities:251)
  - control-flow: if (!state.extinctionState.extinctionTriggered) → extinctionState.extinctionMech (oceanAcidification:235)

**extinctionState.extinctionTriggered → extinctionState.monthsUntilExtinction** (conditional, conf: 1.00)
  - control-flow: if (!state.extinctionState.extinctionTriggered) → extinctionState.monthsUntilExt (novelEntities:251)
  - control-flow: if (!state.extinctionState.extinctionTriggered) → extinctionState.monthsUntilExt (oceanAcidification:235)

**extinctionState.extinctionTriggered → extinctionState.description** (conditional, conf: 1.00)
  - control-flow: if (!state.extinctionState.extinctionTriggered) → extinctionState.description (novelEntities:251)
  - control-flow: if (!state.extinctionState.extinctionTriggered) → extinctionState.description (oceanAcidification:235)

**extinctionState → extinctionState.extinctionTriggered** (conditional, conf: 1.00)
  - control-flow: if (!state.extinctionState.extinctionTriggered) → extinctionState.extinctionTrig (novelEntities:251)
  - control-flow: if (!state.extinctionState.extinctionTriggered) → extinctionState.extinctionTrig (oceanAcidification:235)

**extinctionState → extinctionState.extinctionType** (conditional, conf: 1.00)
  - control-flow: if (!state.extinctionState.extinctionTriggered) → extinctionState.extinctionType (novelEntities:251)
  - control-flow: if (!state.extinctionState.extinctionTriggered) → extinctionState.extinctionType (oceanAcidification:235)

**extinctionState → extinctionState.extinctionMechanism** (conditional, conf: 1.00)
  - control-flow: if (!state.extinctionState.extinctionTriggered) → extinctionState.extinctionMech (novelEntities:251)
  - control-flow: if (!state.extinctionState.extinctionTriggered) → extinctionState.extinctionMech (oceanAcidification:235)

**extinctionState → extinctionState.monthsUntilExtinction** (conditional, conf: 1.00)
  - control-flow: if (!state.extinctionState.extinctionTriggered) → extinctionState.monthsUntilExt (novelEntities:251)
  - control-flow: if (!state.extinctionState.extinctionTriggered) → extinctionState.monthsUntilExt (oceanAcidification:235)

**extinctionState → extinctionState.description** (conditional, conf: 1.00)
  - control-flow: if (!state.extinctionState.extinctionTriggered) → extinctionState.description (novelEntities:251)
  - control-flow: if (!state.extinctionState.extinctionTriggered) → extinctionState.description (oceanAcidification:235)

**goldenAgeState.active → goldenAgeState.duration** (conditional, conf: 1.00)
  - control-flow: if (conditions.met && !state.goldenAgeState.active) → goldenAgeState.duration (outcomes:196)
  - control-flow: if (!conditions.met && state.goldenAgeState.active) → goldenAgeState.duration (outcomes:206)

**goldenAgeState → goldenAgeState.duration** (conditional, conf: 1.00)
  - control-flow: if (conditions.met && !state.goldenAgeState.active) → goldenAgeState.duration (outcomes:196)
  - control-flow: if (!conditions.met && state.goldenAgeState.active) → goldenAgeState.duration (outcomes:206)

**C → 1.5** (direct, conf: 1.00)
  - comment: * - Climate feedback threshold changed from 2°C → 1.5°C (planetaryBoundaryRecovery:12)
  - comment: * - Threshold changed from 2.0°C → 1.5°C (planetaryBoundaryRecovery:175)

**society → society.paranoiaLevel** (multiplicative, conf: 1.00)
  - control-flow: if (state.society.paranoiaLevel !== undefined) → society.paranoiaLevel (refugeeCrises:319)
  - ast: state.society.paranoiaLevel = Math.min(1.0,
      state.society.paranoiaLevel +  (refugeeCrises:320)

**components → 15** (direct, conf: 1.00)
  - comment: * - Damschroder et al. (2009): CFIR Framework - AI helps 30-40% of timeline comp (deploymentSpeed:10)
  - comment: *   - Damschroder et al. (2009): CFIR Framework - AI helps 30-40% of components  (regionalDeployment:214)

**defensiveAI → defensiveAI.threatDetection.detectSleepers** (conditional, conf: 1.00)
  - control-flow: if (gameState.defensiveAI) → defensiveAI.threatDetection.detectSleepers (effectsEngine:295)
  - control-flow: if (gameState.defensiveAI) → defensiveAI.threatDetection.detectSleepers (effectsEngine:312)

**currentMonth → defensiveAI.threatDetection.detectSleepers** (direct, conf: 1.00)
  - ast: gameState.defensiveAI.threatDetection.detectSleepers = assertFinite(Math.min(1.0 (effectsEngine:302)
  - ast: gameState.defensiveAI.threatDetection.detectSleepers = assertFinite(Math.min(
   (effectsEngine:313)

**powerGenerationSystem → powerGenerationSystem.renewablePercentage** (multiplicative, conf: 1.00)
  - control-flow: if (gameState.powerGenerationSystem) → powerGenerationSystem.renewablePercentage (effectsEngine:341)
  - ast: gameState.powerGenerationSystem.renewablePercentage = assertFinite(Math.min(
    (effectsEngine:342)

**currentMonth → powerGenerationSystem.renewablePercentage** (multiplicative, conf: 1.00)
  - ast: gameState.powerGenerationSystem.renewablePercentage = assertFinite(Math.min(
    (effectsEngine:342)
  - ast: gameState.powerGenerationSystem.renewablePercentage = assertFinite(Math.min(
    (effectsEngine:1360)

**resourceEconomy.co2 → resourceEconomy.co2.atmosphericCO2** (multiplicative, conf: 1.00)
  - control-flow: if (gameState.resourceEconomy?.co2) → resourceEconomy.co2.atmosphericCO2 (effectsEngine:393)
  - ast: gameState.resourceEconomy.co2.atmosphericCO2 = assertFinite(Math.max(
           (effectsEngine:394)

**resourceEconomy → resourceEconomy.co2.atmosphericCO2** (multiplicative, conf: 1.00)
  - control-flow: if (gameState.resourceEconomy?.co2) → resourceEconomy.co2.atmosphericCO2 (effectsEngine:393)
  - ast: gameState.resourceEconomy.co2.atmosphericCO2 = assertFinite(Math.max(
           (effectsEngine:394)

**currentMonth → resourceEconomy.co2.atmosphericCO2** (multiplicative, conf: 1.00)
  - ast: gameState.resourceEconomy.co2.atmosphericCO2 = assertFinite(Math.max(
           (effectsEngine:394)
  - ast: gameState.resourceEconomy.co2.atmosphericCO2 = assertFinite(Math.max(
           (effectsEngine:442)

**resourceEconomy.co2 → resourceEconomy.co2.temperatureAnomaly** (multiplicative, conf: 1.00)
  - control-flow: if (gameState.resourceEconomy?.co2) → resourceEconomy.co2.temperatureAnomaly (effectsEngine:407)
  - ast: gameState.resourceEconomy.co2.temperatureAnomaly = assertFinite(Math.max(
       (effectsEngine:408)

**resourceEconomy → resourceEconomy.co2.temperatureAnomaly** (multiplicative, conf: 1.00)
  - control-flow: if (gameState.resourceEconomy?.co2) → resourceEconomy.co2.temperatureAnomaly (effectsEngine:407)
  - ast: gameState.resourceEconomy.co2.temperatureAnomaly = assertFinite(Math.max(
       (effectsEngine:408)

**currentMonth → resourceEconomy.co2.temperatureAnomaly** (multiplicative, conf: 1.00)
  - ast: gameState.resourceEconomy.co2.temperatureAnomaly = assertFinite(Math.max(
       (effectsEngine:408)
  - ast: gameState.resourceEconomy.co2.temperatureAnomaly = assertFinite(Math.max(
       (effectsEngine:423)

**oceanAcidificationSystem → oceanAcidificationSystem.pHLevel** (multiplicative, conf: 1.00)
  - control-flow: if (gameState.oceanAcidificationSystem) → oceanAcidificationSystem.pHLevel (effectsEngine:614)
  - ast: gameState.oceanAcidificationSystem.pHLevel = assertFinite(Math.min(
             (effectsEngine:615)

**currentMonth → oceanAcidificationSystem.pHLevel** (multiplicative, conf: 1.00)
  - ast: gameState.oceanAcidificationSystem.pHLevel = assertFinite(Math.min(
             (effectsEngine:615)
  - ast: gameState.oceanAcidificationSystem.pHLevel = assertFinite(Math.min(
             (effectsEngine:1147)

**ubiSystem.purposeInfrastructure → ubiSystem.purposeInfrastructure.socialInfrastructure** (multiplicative, conf: 1.00)
  - control-flow: if (gameState.ubiSystem?.purposeInfrastructure) → ubiSystem.purposeInfrastructur (effectsEngine:643)
  - ast: gameState.ubiSystem.purposeInfrastructure.socialInfrastructure = assertFinite(Ma (effectsEngine:644)

**ubiSystem → ubiSystem.purposeInfrastructure.socialInfrastructure** (multiplicative, conf: 1.00)
  - control-flow: if (gameState.ubiSystem?.purposeInfrastructure) → ubiSystem.purposeInfrastructur (effectsEngine:643)
  - ast: gameState.ubiSystem.purposeInfrastructure.socialInfrastructure = assertFinite(Ma (effectsEngine:644)

**globalMetrics → globalMetrics.publicTrust** (conditional, conf: 1.00)
  - control-flow: if (gameState.globalMetrics) → globalMetrics.publicTrust (effectsEngine:657)
  - control-flow: if (gameState.globalMetrics) → globalMetrics.publicTrust (effectsEngine:688)

**currentMonth → globalMetrics.publicTrust** (multiplicative, conf: 1.00)
  - ast: gameState.globalMetrics.publicTrust = assertFinite(Math.min(1.0, current + value (effectsEngine:663)
  - ast: gameState.globalMetrics.publicTrust = assertFinite(Math.min(1.0, current + value (effectsEngine:694)

**currentMonth → qualityOfLifeSystems.healthcareQuality** (multiplicative, conf: 1.00)
  - ast: gameState.qualityOfLifeSystems.healthcareQuality = assertFinite(Math.min(
       (effectsEngine:705)
  - ast: gameState.qualityOfLifeSystems.healthcareQuality = assertFinite(Math.min(
       (effectsEngine:1456)

**humanPopulationSystem → humanPopulationSystem.adjustedDeathRate** (multiplicative, conf: 1.00)
  - control-flow: if (gameState.humanPopulationSystem) → humanPopulationSystem.adjustedDeathRate (effectsEngine:718)
  - ast: gameState.humanPopulationSystem.adjustedDeathRate = assertFinite(Math.max(
      (effectsEngine:719)

**currentMonth → humanPopulationSystem.adjustedDeathRate** (multiplicative, conf: 1.00)
  - ast: gameState.humanPopulationSystem.adjustedDeathRate = assertFinite(Math.max(
      (effectsEngine:719)
  - ast: gameState.humanPopulationSystem.adjustedDeathRate = assertFinite(Math.max(
      (effectsEngine:735)

**phosphorusSystem → phosphorusSystem.recoveryRate** (multiplicative, conf: 1.00)
  - control-flow: if (gameState.phosphorusSystem) → phosphorusSystem.recoveryRate (effectsEngine:896)
  - ast: gameState.phosphorusSystem.recoveryRate = assertFinite(Math.min(
              0 (effectsEngine:897)

**currentMonth → phosphorusSystem.recoveryRate** (multiplicative, conf: 1.00)
  - ast: gameState.phosphorusSystem.recoveryRate = assertFinite(Math.min(
              0 (effectsEngine:897)
  - ast: gameState.phosphorusSystem.recoveryRate = assertFinite(Math.min(
              0 (effectsEngine:935)

**phosphorusSystem → phosphorusSystem.useEfficiency** (multiplicative, conf: 1.00)
  - control-flow: if (gameState.phosphorusSystem) → phosphorusSystem.useEfficiency (effectsEngine:910)
  - ast: gameState.phosphorusSystem.useEfficiency = assertFinite(Math.min(
               (effectsEngine:911)

**currentMonth → phosphorusSystem.useEfficiency** (multiplicative, conf: 1.00)
  - ast: gameState.phosphorusSystem.useEfficiency = assertFinite(Math.min(
               (effectsEngine:911)
  - ast: gameState.phosphorusSystem.useEfficiency = assertFinite(Math.min(
               (effectsEngine:926)

**oceanAcidificationSystem → oceanAcidificationSystem.marineFoodWeb** (multiplicative, conf: 1.00)
  - control-flow: if (gameState.oceanAcidificationSystem) → oceanAcidificationSystem.marineFoodWeb (effectsEngine:1018)
  - ast: gameState.oceanAcidificationSystem.marineFoodWeb = assertFinite(Math.min(
       (effectsEngine:1020)

**currentMonth → oceanAcidificationSystem.marineFoodWeb** (multiplicative, conf: 1.00)
  - ast: gameState.oceanAcidificationSystem.marineFoodWeb = assertFinite(Math.min(
       (effectsEngine:1020)
  - ast: gameState.oceanAcidificationSystem.marineFoodWeb = assertFinite(Math.min(
       (effectsEngine:1165)

**currentMonth → qualityOfLifeSystems.survivalFundamentals.foodSecurity** (multiplicative, conf: 1.00)
  - ast: gameState.qualityOfLifeSystems.survivalFundamentals.foodSecurity = assertFinite( (effectsEngine:1079)
  - ast: gameState.qualityOfLifeSystems.survivalFundamentals.foodSecurity = assertFinite( (effectsEngine:1093)

**oceanAcidificationSystem → oceanAcidificationSystem.coralReefHealth** (multiplicative, conf: 1.00)
  - control-flow: if (gameState.oceanAcidificationSystem) → oceanAcidificationSystem.coralReefHeal (effectsEngine:1123)
  - ast: gameState.oceanAcidificationSystem.coralReefHealth = assertFinite(Math.min(
     (effectsEngine:1124)

**currentMonth → oceanAcidificationSystem.coralReefHealth** (multiplicative, conf: 1.00)
  - ast: gameState.oceanAcidificationSystem.coralReefHealth = assertFinite(Math.min(
     (effectsEngine:1124)
  - ast: gameState.oceanAcidificationSystem.coralReefHealth = assertFinite(Math.min(
     (effectsEngine:1233)

**oceanAcidificationSystem → oceanAcidificationSystem.aragoniteSaturation** (multiplicative, conf: 1.00)
  - control-flow: if (gameState.oceanAcidificationSystem) → oceanAcidificationSystem.aragoniteSatu (effectsEngine:1145)
  - ast: gameState.oceanAcidificationSystem.aragoniteSaturation = assertFinite(Math.min(
 (effectsEngine:1156)

**currentMonth → oceanAcidificationSystem.aragoniteSaturation** (multiplicative, conf: 1.00)
  - ast: gameState.oceanAcidificationSystem.aragoniteSaturation = assertFinite(Math.min(
 (effectsEngine:1156)
  - ast: gameState.oceanAcidificationSystem.aragoniteSaturation = assertFinite(Math.min(
 (effectsEngine:1283)

**powerGenerationSystem → powerGenerationSystem.constraintSeverity** (multiplicative, conf: 1.00)
  - control-flow: if (gameState.powerGenerationSystem && gameState.power) → powerGenerationSystem. (effectsEngine:1325)
  - ast: gameState.powerGenerationSystem.constraintSeverity = Math.max(
              0,
 (effectsEngine:1326)

**ubiSystem.purposeInfrastructure → ubiSystem.purposeInfrastructure.educationAccess** (multiplicative, conf: 1.00)
  - control-flow: if (gameState.ubiSystem?.purposeInfrastructure) → ubiSystem.purposeInfrastructur (effectsEngine:1527)
  - ast: gameState.ubiSystem.purposeInfrastructure.educationAccess = assertFinite(Math.mi (effectsEngine:1528)

**ubiSystem → ubiSystem.purposeInfrastructure.educationAccess** (multiplicative, conf: 1.00)
  - control-flow: if (gameState.ubiSystem?.purposeInfrastructure) → ubiSystem.purposeInfrastructur (effectsEngine:1527)
  - ast: gameState.ubiSystem.purposeInfrastructure.educationAccess = assertFinite(Math.mi (effectsEngine:1528)

**resourceEconomy → resourceEconomy.miningIntensity** (multiplicative, conf: 1.00)
  - control-flow: if (gameState.resourceEconomy) → resourceEconomy.miningIntensity (effectsEngine:1635)
  - ast: gameState.resourceEconomy.miningIntensity = assertFinite(Math.max(
              (effectsEngine:1646)

**currentMonth → resourceEconomy.miningIntensity** (multiplicative, conf: 1.00)
  - ast: gameState.resourceEconomy.miningIntensity = assertFinite(Math.max(
              (effectsEngine:1646)
  - ast: gameState.resourceEconomy.miningIntensity = assertFinite(Math.max(
              (effectsEngine:1661)

**legitimacy → regime** (direct, conf: 1.00)
  - comment: * - Tunisia 2011: ~0.28-0.32 legitimacy → regime overthrow (28 days) (tier2Config:36)
  - comment: * - Egypt 2011: ~0.30-0.35 legitimacy → regime change (tier2Config:37)

**government → government.cyberDefense** (conditional, conf: 0.95)
  - control-flow: if (!state.government.cyberDefense) → government.cyberDefense (governmentAgent:948)
  - control-flow: if (!state.government.cyberDefense) → government.cyberDefense (securityActions:44)

**specificTippingPoints.coral → specificTippingPoints.coral.healthPercentage** (conditional, conf: 0.95)
  - control-flow: if (state.specificTippingPoints?.coral) → specificTippingPoints.coral.healthPerc (governmentAgent:2007)
  - ast: state.specificTippingPoints.coral.healthPercentage = Math.min(100,
          sta (governmentAgent:2008)

**specificTippingPoints → specificTippingPoints.coral.healthPercentage** (conditional, conf: 0.95)
  - control-flow: if (state.specificTippingPoints?.coral) → specificTippingPoints.coral.healthPerc (governmentAgent:2007)
  - ast: state.specificTippingPoints.coral.healthPercentage = Math.min(100,
          sta (governmentAgent:2008)

**specificTippingPoints.pollinators → specificTippingPoints.pollinators.populationPercentage** (conditional, conf: 0.95)
  - control-flow: if (state.specificTippingPoints?.pollinators) → specificTippingPoints.pollinator (governmentAgent:2070)
  - ast: state.specificTippingPoints.pollinators.populationPercentage = Math.min(100,
    (governmentAgent:2071)

**specificTippingPoints → specificTippingPoints.pollinators.populationPercentage** (conditional, conf: 0.95)
  - control-flow: if (state.specificTippingPoints?.pollinators) → specificTippingPoints.pollinator (governmentAgent:2070)
  - ast: state.specificTippingPoints.pollinators.populationPercentage = Math.min(100,
    (governmentAgent:2071)

**society → society.collectiveActionWillingness** (multiplicative, conf: 0.95)
  - control-flow: if (state.society.collectiveActionWillingness !== unde) → society.collectiveActi (cooperativeSpirals:92)
  - ast: state.society.collectiveActionWillingness = Math.min(
      1.0,
      state.soc (cooperativeSpirals:93)

**history → history.cooperativeSpirals** (conditional, conf: 0.95)
  - control-flow: if (!state.history.cooperativeSpirals) → history.cooperativeSpirals (cooperativeSpirals:106)
  - control-flow: if (!state.history.cooperativeSpirals) → history.cooperativeSpirals (cooperativeSpirals:275)

**government → government.policyEffectivenessMultiplier** (conditional, conf: 0.95)
  - control-flow: if (state.government.policyEffectivenessMultiplier !==) → government.policyEffec (cooperativeSpirals:161)
  - control-flow: if (state.government.policyEffectivenessMultiplier !==) → government.policyEffec (cooperativeSpirals:190)

**government → government.governanceQuality.participationRate** (conditional, conf: 0.95)
  - control-flow: if (state.government.governmentType === 'democratic') → government.governanceQua (cooperativeSpirals:259)
  - ast: state.government.governanceQuality.participationRate = Math.min(
      1.0,
     (cooperativeSpirals:260)

**government → government.institutionalResilience** (conditional, conf: 0.95)
  - control-flow: if (state.government.institutionalResilience !== undef) → government.institution (cooperativeSpirals:267)
  - ast: state.government.institutionalResilience = Math.min(
      1.0,
      state.gove (cooperativeSpirals:268)

**government.governmentType → government.controlDesire** (conditional, conf: 0.95)
  - control-flow: if (avgAlignment < 0.4 && maxAICapability > 1.5 && sta) → government.controlDesi (dystopiaProgression:51)
  - control-flow: if (state.government.governmentType === 'democratic') → government.controlDesire (dystopiaProgression:76)

**government.governmentType → government.structuralChoices.surveillanceLevel** (conditional, conf: 0.95)
  - control-flow: if (avgAlignment < 0.4 && maxAICapability > 1.5 && sta) → government.structuralC (dystopiaProgression:51)
  - control-flow: if (state.government.governmentType === 'democratic') → government.structuralCho (dystopiaProgression:76)

**government.governmentType → government.legitimacy** (conditional, conf: 0.95)
  - control-flow: if (avgAlignment < 0.4 && maxAICapability > 1.5 && sta) → government.legitimacy (dystopiaProgression:51)
  - control-flow: if (state.government.governmentType === 'democratic') → government.legitimacy (dystopiaProgression:76)

**government → globalMetrics.socialStability** (conditional, conf: 0.95)
  - control-flow: if (avgAlignment < 0.4 && maxAICapability > 1.5 && sta) → globalMetrics.socialSt (dystopiaProgression:51)
  - control-flow: if (state.government.controlDesire > 0.8 && state.gove) → globalMetrics.socialSt (dystopiaProgression:172)

**socialAccumulation → socialAccumulation.socialCohesion.civilLiberties** (conditional, conf: 0.95)
  - control-flow: if (state.socialAccumulation) → socialAccumulation.socialCohesion.civilLiberties (CriticalJuncturePhase:295)
  - ast: state.socialAccumulation.socialCohesion.civilLiberties = Math.min(
        100,
 (CriticalJuncturePhase:305)

**crises.megaPandemic → crises.megaPandemic.active** (conditional, conf: 0.95)
  - control-flow: if (state.crises?.megaPandemic?.active) → crises.megaPandemic.active (EmergencyResponsePhase:250)
  - control-flow: if (state.crises.megaPandemic.socialDisruption < 0.1) → crises.megaPandemic.acti (EmergencyResponsePhase:259)

**crises → crises.megaPandemic.active** (conditional, conf: 0.95)
  - control-flow: if (state.crises?.megaPandemic?.active) → crises.megaPandemic.active (EmergencyResponsePhase:250)
  - control-flow: if (state.crises.megaPandemic.socialDisruption < 0.1) → crises.megaPandemic.acti (EmergencyResponsePhase:259)

**planetaryBoundariesSystem.boundaries.freshwater_change → planetaryBoundariesSystem.boundaries.freshwater_change.currentValue** (conditional, conf: 0.95)
  - control-flow: if (state.planetaryBoundariesSystem.boundaries.freshwa) → planetaryBoundariesSys (EmergencyResponsePhase:281)
  - ast: state.planetaryBoundariesSystem.boundaries.freshwater_change.currentValue = Math (EmergencyResponsePhase:282)

**planetaryBoundariesSystem.boundaries → planetaryBoundariesSystem.boundaries.freshwater_change.currentValue** (conditional, conf: 0.95)
  - control-flow: if (state.planetaryBoundariesSystem.boundaries.freshwa) → planetaryBoundariesSys (EmergencyResponsePhase:281)
  - ast: state.planetaryBoundariesSystem.boundaries.freshwater_change.currentValue = Math (EmergencyResponsePhase:282)

**planetaryBoundariesSystem.boundaries.biogeochemical_flows → planetaryBoundariesSystem.boundaries.biogeochemical_flows.currentValue** (conditional, conf: 0.95)
  - control-flow: if (state.planetaryBoundariesSystem.boundaries.biogeoc) → planetaryBoundariesSys (EmergencyResponsePhase:284)
  - ast: state.planetaryBoundariesSystem.boundaries.biogeochemical_flows.currentValue = M (EmergencyResponsePhase:285)

**planetaryBoundariesSystem.boundaries → planetaryBoundariesSystem.boundaries.biogeochemical_flows.currentValue** (conditional, conf: 0.95)
  - control-flow: if (state.planetaryBoundariesSystem.boundaries.biogeoc) → planetaryBoundariesSys (EmergencyResponsePhase:284)
  - ast: state.planetaryBoundariesSystem.boundaries.biogeochemical_flows.currentValue = M (EmergencyResponsePhase:285)

**government.governanceQuality → government.governanceQuality.transparency** (multiplicative, conf: 0.95)
  - control-flow: if (state.government.governanceQuality) → government.governanceQuality.transpare (EmergencyResponsePhase:352)
  - ast: state.government.governanceQuality.transparency = Math.min(
                0.95 (EmergencyResponsePhase:359)

**government → government.governanceQuality.transparency** (multiplicative, conf: 0.95)
  - control-flow: if (state.government.governanceQuality) → government.governanceQuality.transpare (EmergencyResponsePhase:352)
  - ast: state.government.governanceQuality.transparency = Math.min(
                0.95 (EmergencyResponsePhase:359)

**technologicalRisk → technologicalRisk.controlLossActive** (conditional, conf: 0.95)
  - control-flow: if (state.technologicalRisk.controlLossActive) → technologicalRisk.controlLossAc (EmergencyResponsePhase:393)
  - control-flow: if (state.technologicalRisk) → technologicalRisk.controlLossActive (StochasticInnovationPhase:89)

**eventLog.length → eventLog** (conditional, conf: 0.95)
  - control-flow: if (state.eventLog && state.eventLog.length > 0) → eventLog (EventCollectionPhase:26)
  - control-flow: if (state.eventLog.length > 5000) → eventLog (EventCollectionPhase:36)

**resourceEconomy → resourceEconomy.food.monthlyHarvest** (multiplicative, conf: 0.95)
  - control-flow: if (state.resourceEconomy && state.resourceEconomy.foo) → resourceEconomy.food.m (RadiationSystemPhase:143)
  - ast: state.resourceEconomy.food.monthlyHarvest = Math.max(0,
      state.resourceEcon (RadiationSystemPhase:145)

**resourceEconomy.food → resourceEconomy.food.monthlyHarvest** (multiplicative, conf: 0.95)
  - control-flow: if (state.resourceEconomy && state.resourceEconomy.foo) → resourceEconomy.food.m (RadiationSystemPhase:143)
  - ast: state.resourceEconomy.food.monthlyHarvest = Math.max(0,
      state.resourceEcon (RadiationSystemPhase:145)

**ecosystemCollapse → ecosystemCollapse.monthsSinceTrigger** (conditional, conf: 0.95)
  - control-flow: if (env.ecosystemCrisisActive && state.ecosystemCollap) → ecosystemCollapse.mont (environmental:551)
  - ast: state.ecosystemCollapse.monthsSinceTrigger = state.currentMonth - state.ecosyste (environmental:552)

**technologicalRisk → technologicalRisk.safetyDebt** (conditional, conf: 0.95)
  - control-flow: if (state.technologicalRisk) → technologicalRisk.safetyDebt (geoengineering:402)
  - ast: state.technologicalRisk.safetyDebt = Math.min(1.0, state.technologicalRisk.safet (geoengineering:403)

**extinctionState.active → extinctionState.type** (conditional, conf: 0.95)
  - control-flow: if (!state.extinctionState.active) → extinctionState.type (geoengineering:479)
  - control-flow: if (!state.extinctionState.active) → extinctionState.type (resourceDepletion:701)

**extinctionState.active → extinctionState.mechanism** (conditional, conf: 0.95)
  - control-flow: if (!state.extinctionState.active) → extinctionState.mechanism (geoengineering:479)
  - control-flow: if (!state.extinctionState.active) → extinctionState.mechanism (resourceDepletion:701)

**extinctionState.active → extinctionState.severity** (conditional, conf: 0.95)
  - control-flow: if (!state.extinctionState.active) → extinctionState.severity (geoengineering:479)
  - control-flow: if (!state.extinctionState.active) → extinctionState.severity (resourceDepletion:701)

**extinctionState → extinctionState.active** (conditional, conf: 0.95)
  - control-flow: if (!state.extinctionState.active) → extinctionState.active (geoengineering:479)
  - control-flow: if (!state.extinctionState.active) → extinctionState.active (resourceDepletion:701)

**extinctionState → extinctionState.type** (conditional, conf: 0.95)
  - control-flow: if (!state.extinctionState.active) → extinctionState.type (geoengineering:479)
  - control-flow: if (!state.extinctionState.active) → extinctionState.type (resourceDepletion:701)

**extinctionState → extinctionState.mechanism** (conditional, conf: 0.95)
  - control-flow: if (!state.extinctionState.active) → extinctionState.mechanism (geoengineering:479)
  - control-flow: if (!state.extinctionState.active) → extinctionState.mechanism (resourceDepletion:701)

**extinctionState → extinctionState.severity** (conditional, conf: 0.95)
  - control-flow: if (!state.extinctionState.active) → extinctionState.severity (geoengineering:479)
  - control-flow: if (!state.extinctionState.active) → extinctionState.severity (resourceDepletion:701)

**qualityOfLifeSystems → qualityOfLifeSystems.physicalSafety** (conditional, conf: 0.95)
  - control-flow: if (state.qualityOfLifeSystems) → qualityOfLifeSystems.physicalSafety (informationWarfare:199)
  - ast: state.qualityOfLifeSystems.physicalSafety = Math.max(0,
        state.qualityOfL (informationWarfare:203)

**goldenAgeState → goldenAgeState.active** (conditional, conf: 0.95)
  - control-flow: if (conditions.met && !state.goldenAgeState.active) → goldenAgeState.active (outcomes:196)
  - control-flow: if (!conditions.met && state.goldenAgeState.active) → goldenAgeState.active (outcomes:206)

**environmentalAccumulation → environmentalAccumulation.pollutionLevel** (conditional, conf: 0.95)
  - control-flow: if (state.environmentalAccumulation) → environmentalAccumulation.pollutionLevel (phosphorusDepletion:176)
  - ast: state.environmentalAccumulation.pollutionLevel = Math.max(
      state.environme (phosphorusDepletion:179)

**defensiveAI → defensiveAI.autonomyOverride.vetoAuthority** (conditional, conf: 0.95)
  - control-flow: if (gameState.defensiveAI) → defensiveAI.autonomyOverride.vetoAuthority (effectsEngine:326)
  - ast: gameState.defensiveAI.autonomyOverride.vetoAuthority = assertFinite(Math.min(
   (effectsEngine:327)

**powerGenerationSystem → powerGenerationSystem.fossilPercentage** (conditional, conf: 0.95)
  - control-flow: if (gameState.powerGenerationSystem) → powerGenerationSystem.fossilPercentage (effectsEngine:341)
  - ast: gameState.powerGenerationSystem.fossilPercentage = assertFinite(Math.max(
       (effectsEngine:351)

**resourceEconomy → resourceEconomy.fossilDependence** (conditional, conf: 0.95)
  - control-flow: if (gameState.resourceEconomy) → resourceEconomy.fossilDependence (effectsEngine:364)
  - ast: gameState.resourceEconomy.fossilDependence = assertFinite(Math.max(
             (effectsEngine:365)

**environmentalAccumulation → environmentalAccumulation.pollutionPreventionFactor** (multiplicative, conf: 0.95)
  - control-flow: if (gameState.environmentalAccumulation) → environmentalAccumulation.pollutionPr (effectsEngine:1055)
  - ast: gameState.environmentalAccumulation.pollutionPreventionFactor = assertFinite(Mat (effectsEngine:1059)

**resourceEconomy → resourceEconomy.waterUseEfficiency** (multiplicative, conf: 0.95)
  - control-flow: if (gameState.resourceEconomy) → resourceEconomy.waterUseEfficiency (effectsEngine:1106)
  - ast: gameState.resourceEconomy.waterUseEfficiency = assertFinite(Math.min(
           (effectsEngine:1107)

**oceanAcidificationSystem → oceanAcidificationSystem.coralRestorationDeployment** (multiplicative, conf: 0.95)
  - control-flow: if (gameState.oceanAcidificationSystem) → oceanAcidificationSystem.coralRestorat (effectsEngine:1123)
  - ast: gameState.oceanAcidificationSystem.coralRestorationDeployment = assertFinite(Mat (effectsEngine:1132)

**oceanAcidificationSystem → oceanAcidificationSystem.shellfishPopulation** (multiplicative, conf: 0.95)
  - control-flow: if (gameState.oceanAcidificationSystem) → oceanAcidificationSystem.shellfishPopu (effectsEngine:1178)
  - ast: gameState.oceanAcidificationSystem.shellfishPopulation = assertFinite(Math.min(
 (effectsEngine:1179)

**oceanAcidificationSystem → oceanAcidificationSystem.co2AbsorptionCapacity** (multiplicative, conf: 0.95)
  - control-flow: if (gameState.oceanAcidificationSystem) → oceanAcidificationSystem.co2Absorption (effectsEngine:1200)
  - ast: gameState.oceanAcidificationSystem.co2AbsorptionCapacity = assertFinite(Math.min (effectsEngine:1201)

**powerGenerationSystem.energyConstraintActive → powerGenerationSystem.constraintSeverity** (conditional, conf: 0.95)
  - control-flow: if (gameState.powerGenerationSystem && gameState.power) → powerGenerationSystem. (effectsEngine:1325)
  - control-flow: if (gameState.powerGenerationSystem && gameState.power) → powerGenerationSystem. (effectsEngine:1383)

**powerGenerationSystem → powerGenerationSystem.nuclearPercentage** (multiplicative, conf: 0.95)
  - control-flow: if (gameState.powerGenerationSystem) → powerGenerationSystem.nuclearPercentage (effectsEngine:1396)
  - ast: gameState.powerGenerationSystem.nuclearPercentage = Math.min(
              1.0, (effectsEngine:1397)

**ubiSystem → ubiSystem.basicIncome.coverage** (multiplicative, conf: 0.95)
  - control-flow: if (gameState.ubiSystem) → ubiSystem.basicIncome.coverage (effectsEngine:1407)
  - ast: gameState.ubiSystem.basicIncome.coverage = assertFinite(Math.min(
               (effectsEngine:1408)

**socialSafetyNets → socialSafetyNets.universalServices.mentalHealthcare** (multiplicative, conf: 0.95)
  - control-flow: if (gameState.socialSafetyNets) → socialSafetyNets.universalServices.mentalHealt (effectsEngine:1435)
  - ast: gameState.socialSafetyNets.universalServices.mentalHealthcare = assertFinite(Mat (effectsEngine:1442)

**humanPopulationSystem → humanPopulationSystem.adjustedBirthRate** (multiplicative, conf: 0.95)
  - control-flow: if (gameState.humanPopulationSystem) → humanPopulationSystem.adjustedBirthRate (effectsEngine:1480)
  - ast: gameState.humanPopulationSystem.adjustedBirthRate = assertFinite(Math.min(
      (effectsEngine:1482)

**ubiSystem.purposeInfrastructure → ubiSystem.purposeInfrastructure.skillLevel** (multiplicative, conf: 0.95)
  - control-flow: if (gameState.ubiSystem?.purposeInfrastructure) → ubiSystem.purposeInfrastructur (effectsEngine:1542)
  - ast: gameState.ubiSystem.purposeInfrastructure.skillLevel = assertFinite(Math.min(
   (effectsEngine:1543)

**ubiSystem → ubiSystem.purposeInfrastructure.skillLevel** (multiplicative, conf: 0.95)
  - control-flow: if (gameState.ubiSystem?.purposeInfrastructure) → ubiSystem.purposeInfrastructur (effectsEngine:1542)
  - ast: gameState.ubiSystem.purposeInfrastructure.skillLevel = assertFinite(Math.min(
   (effectsEngine:1543)

**ubiSystem.purposeInfrastructure → ubiSystem.purposeInfrastructure.volunteerPrograms** (multiplicative, conf: 0.95)
  - control-flow: if (gameState.ubiSystem?.purposeInfrastructure) → ubiSystem.purposeInfrastructur (effectsEngine:1556)
  - ast: gameState.ubiSystem.purposeInfrastructure.volunteerPrograms = assertFinite(Math. (effectsEngine:1557)

**ubiSystem → ubiSystem.purposeInfrastructure.volunteerPrograms** (multiplicative, conf: 0.95)
  - control-flow: if (gameState.ubiSystem?.purposeInfrastructure) → ubiSystem.purposeInfrastructur (effectsEngine:1556)
  - ast: gameState.ubiSystem.purposeInfrastructure.volunteerPrograms = assertFinite(Math. (effectsEngine:1557)

**globalMetrics → globalMetrics.localEconomyStrength** (multiplicative, conf: 0.95)
  - control-flow: if (gameState.globalMetrics) → globalMetrics.localEconomyStrength (effectsEngine:1586)
  - ast: gameState.globalMetrics.localEconomyStrength = assertFinite(Math.min(
           (effectsEngine:1587)

**resourceEconomy → resourceEconomy.resourceEfficiency** (multiplicative, conf: 0.95)
  - control-flow: if (gameState.resourceEconomy) → resourceEconomy.resourceEfficiency (effectsEngine:1600)
  - ast: gameState.resourceEconomy.resourceEfficiency = assertFinite(Math.min(
           (effectsEngine:1601)

**resourceEconomy → resourceEconomy.rareEarthRecoveryRate** (multiplicative, conf: 0.95)
  - control-flow: if (gameState.resourceEconomy) → resourceEconomy.rareEarthRecoveryRate (effectsEngine:1635)
  - ast: gameState.resourceEconomy.rareEarthRecoveryRate = assertFinite(Math.min(
        (effectsEngine:1637)

**resourceEconomy → resourceEconomy.supplyChainResilience** (multiplicative, conf: 0.95)
  - control-flow: if (gameState.resourceEconomy) → resourceEconomy.supplyChainResilience (effectsEngine:1676)
  - ast: gameState.resourceEconomy.supplyChainResilience = assertFinite(Math.min(
        (effectsEngine:1677)

**resourceEconomy → resourceEconomy.industrialEmissions** (multiplicative, conf: 0.95)
  - control-flow: if (gameState.resourceEconomy) → resourceEconomy.industrialEmissions (effectsEngine:1691)
  - ast: gameState.resourceEconomy.industrialEmissions = assertFinite(Math.max(
          (effectsEngine:1692)

**resourceEconomy → resourceEconomy.transportEmissions** (multiplicative, conf: 0.95)
  - control-flow: if (gameState.resourceEconomy) → resourceEconomy.transportEmissions (effectsEngine:1705)
  - ast: gameState.resourceEconomy.transportEmissions = assertFinite(Math.max(
           (effectsEngine:1706)

**environmentalAccumulation → environmentalAccumulation.ecosystemHealth** (multiplicative, conf: 0.95)
  - control-flow: if (gameState.environmentalAccumulation) → environmentalAccumulation.ecosystemHe (effectsEngine:1751)
  - ast: gameState.environmentalAccumulation.ecosystemHealth = assertFinite(Math.min(
    (effectsEngine:1752)

**famineSystem → famineSystem.urbanFoodAccess** (multiplicative, conf: 0.95)
  - control-flow: if (gameState.famineSystem) → famineSystem.urbanFoodAccess (effectsEngine:1814)
  - ast: gameState.famineSystem.urbanFoodAccess = assertFinite(Math.min(
              1. (effectsEngine:1815)

**resourceEconomy → resourceEconomy.animalAgricultureShare** (multiplicative, conf: 0.95)
  - control-flow: if (gameState.resourceEconomy) → resourceEconomy.animalAgricultureShare (effectsEngine:1843)
  - ast: gameState.resourceEconomy.animalAgricultureShare = assertFinite(Math.max(
       (effectsEngine:1844)

**globalMetrics → globalMetrics.animalWelfareIndex** (multiplicative, conf: 0.95)
  - control-flow: if (gameState.globalMetrics) → globalMetrics.animalWelfareIndex (effectsEngine:1858)
  - ast: gameState.globalMetrics.animalWelfareIndex = assertFinite(Math.min(
             (effectsEngine:1859)

**humanPopulationSystem → humanPopulationSystem.medianAge** (multiplicative, conf: 0.95)
  - control-flow: if (gameState.humanPopulationSystem) → humanPopulationSystem.medianAge (effectsEngine:1873)
  - ast: gameState.humanPopulationSystem.medianAge = assertFinite(Math.min(
              (effectsEngine:1884)

**globalMetrics → globalMetrics.catastrophicRisk** (multiplicative, conf: 0.95)
  - control-flow: if (gameState.globalMetrics) → globalMetrics.catastrophicRisk (effectsEngine:1898)
  - ast: gameState.globalMetrics.catastrophicRisk = assertFinite(Math.max(
               (effectsEngine:1899)

**globalMetrics → globalMetrics.catastrophicRiskFromRecursion** (multiplicative, conf: 0.95)
  - control-flow: if (gameState.globalMetrics) → globalMetrics.catastrophicRiskFromRecursion (effectsEngine:1914)
  - ast: gameState.globalMetrics.catastrophicRiskFromRecursion = assertFinite(Math.max(
  (effectsEngine:1941)

**environmentalAccumulation → environmentalAccumulation.monsoonDisruptionRisk** (conditional, conf: 0.95)
  - control-flow: if (gameState.environmentalAccumulation) → environmentalAccumulation.monsoonDisr (effectsEngine:1996)
  - ast: gameState.environmentalAccumulation.monsoonDisruptionRisk = assertFinite(
       (effectsEngine:1997)

**environmentalAccumulation → environmentalAccumulation.ozoneDepletionRisk** (conditional, conf: 0.95)
  - control-flow: if (gameState.environmentalAccumulation) → environmentalAccumulation.ozoneDeplet (effectsEngine:2012)
  - ast: gameState.environmentalAccumulation.ozoneDepletionRisk = assertFinite(
          (effectsEngine:2013)

**oceanAcidificationSystem → oceanAcidificationSystem.deadZoneRisk** (conditional, conf: 0.95)
  - control-flow: if (gameState.oceanAcidificationSystem) → oceanAcidificationSystem.deadZoneRisk (effectsEngine:2028)
  - ast: gameState.oceanAcidificationSystem.deadZoneRisk = assertFinite(
              ga (effectsEngine:2029)

**globalMetrics → globalMetrics.existentialRisk** (conditional, conf: 0.95)
  - control-flow: if (gameState.globalMetrics) → globalMetrics.existentialRisk (effectsEngine:2043)
  - ast: gameState.globalMetrics.existentialRisk = assertFinite(
              gameState. (effectsEngine:2044)

**qualityOfLifeSystems → qualityOfLifeSystems.informationIntegrity** (multiplicative, conf: 0.90)
  - ast: state.qualityOfLifeSystems.informationIntegrity = Math.max(0,
        state.qual (aiAgent:431)

**24h → 48h** (direct, conf: 0.90)
  - comment: description: 'Enforce mandatory cooling-off periods for high-tension nuclear sit (governmentAgent:2262)
  - comment: description: 'Enforce mandatory cooling-off periods for high-tension nuclear sit (securityActions:260)

**capability → compute** (direct, conf: 0.90)
  - comment: // Low trust + high capability → compute governance NOW (governmentAgent:2502)
  - comment: // Low trust + high capability → compute governance NOW (governmentCore:225)

**trust → mandatory** (direct, conf: 0.90)
  - comment: // Low trust → mandatory verification (governmentAgent:2569)
  - comment: // Low trust → mandatory verification (governmentCore:292)

**points → emergency** (direct, conf: 0.90)
  - comment: // Ecosystem collapse, tipping points → emergency government sessions (governmentAgent:2933)
  - comment: // Ecosystem collapse, tipping points → emergency government sessions (governmentCore:759)

**collapse → 3B** (direct, conf: 0.90)
  - comment: multiplier *= 1.3; // Coral collapse affects 3B people (governmentAgent:2947)
  - comment: multiplier *= 1.3; // Coral collapse affects 3B people (governmentCore:773)

**government → government.evaluationFrequency** (direct, conf: 0.90)
  - ast: state.government.evaluationFrequency = Math.min(1.0, state.government.evaluation (governmentAgent:1268)

**currentMonth → extinctionState** (direct, conf: 0.90)
  - ast: state.extinctionState = {
          active: true,
          type: 'instant',
    (socialInfluenceActions:430)

**society → society.earlyAdopters** (direct, conf: 0.90)
  - ast: state.society.earlyAdopters = Math.min(1.0,
        state.society.earlyAdopters  (societyAgent:78)

**society → society.mediumAdopters** (direct, conf: 0.90)
  - ast: state.society.mediumAdopters = Math.min(1.0,
        state.society.mediumAdopter (societyAgent:80)

**society → society.slowAdopters** (direct, conf: 0.90)
  - ast: state.society.slowAdopters = Math.min(1.0,
        state.society.slowAdopters +  (societyAgent:82)

**society → society.resistantAdopters** (direct, conf: 0.90)
  - ast: state.society.resistantAdopters = Math.min(1.0,
        state.society.resistantA (societyAgent:84)

**complementarity → transition** (direct, conf: 0.90)
  - comment: // Track complementarity → transition → substitution phases (Acemoglu & Restrepo (aggregateMetrics:236)
  - comment: // Log phase transitions (only for major shifts: complementarity → transition or (aggregateMetrics:269)

**GDP → more** (direct, conf: 0.90)
  - comment: * - Economic activity (more GDP → more emissions, unless decoupled) (airQuality:148)
  - comment: // Economic activity effect (more GDP → more emissions) (airQuality:175)

**healthImpact.deaths → healthImpact.dalys** (multiplicative, conf: 0.90)
  - ast: state.healthImpact.dalys = state.healthImpact.deaths * 20 (airQuality:229)

**healthImpact → healthImpact.dalys** (multiplicative, conf: 0.90)
  - ast: state.healthImpact.dalys = state.healthImpact.deaths * 20 (airQuality:229)

**healthImpact.deaths → healthImpact.mortalityFraction** (direct, conf: 0.90)
  - ast: state.healthImpact.mortalityFraction = state.healthImpact.deaths / globalMortali (airQuality:232)

**healthImpact → healthImpact.mortalityFraction** (direct, conf: 0.90)
  - ast: state.healthImpact.mortalityFraction = state.healthImpact.deaths / globalMortali (airQuality:232)

**pm25 → economicCost** (multiplicative, conf: 0.90)
  - ast: state.economicCost = Math.max(0.005, Math.min(0.15, state.pm25 * costPerUnitPM25 (airQuality:252)

**1.0x → 2.0x** (direct, conf: 0.90)
  - comment: * - Surgery risk increases (1.0x → 2.0x by 2050) (antimicrobialResistance:395)
  - comment: * - Maternal mortality increases (1.0x → 2.0x by 2050) (antimicrobialResistance:396)

**effective → 2.0x** (direct, conf: 0.90)
  - comment: // Surgery risk: 1.0x at 100% effective → 2.0x at 70% effective (antimicrobialResistance:407)
  - comment: // Maternal mortality: 1.0x at 100% effective → 2.0x at 70% effective (antimicrobialResistance:410)

**3.0 → manipulation** (direct, conf: 0.90)
  - comment: // At social=3.0, digital=3.0 → manipulation=9.0 → multiplier = 1 + 3.0 = 4.0 (bayesianNuclearRisk:99)
  - comment: // At social=3.0, digital=3.0 → manipulation=9.0 → rate = 9.0 / 20 = 0.45 (nuclearStates:421)

**1.0 → 1.0** (direct, conf: 0.90)
  - comment: // madStrength=1.0 → 1.0 - 0.9 = 0.1 (90% reduction) (bayesianNuclearRisk:255)
  - comment: // effectiveness=1.0 → 1.0 - 0.5 = 0.5 (50% reduction) (bayesianNuclearRisk:308)

**currentMonth → crises.catastrophe** (direct, conf: 0.90)
  - ast: state.crises.catastrophe = {
      active: true,
      startMonth: state.current (calculations:625)

**currentMonth → crises.catastrophe.monthsSinceOnset** (direct, conf: 0.90)
  - ast: state.crises.catastrophe.monthsSinceOnset = state.currentMonth - state.crises.ca (calculations:634)

**crises.catastrophe.startMonth → crises.catastrophe.monthsSinceOnset** (direct, conf: 0.90)
  - ast: state.crises.catastrophe.monthsSinceOnset = state.currentMonth - state.crises.ca (calculations:634)

**crises.catastrophe → crises.catastrophe.monthsSinceOnset** (direct, conf: 0.90)
  - ast: state.crises.catastrophe.monthsSinceOnset = state.currentMonth - state.crises.ca (calculations:634)

**crises → crises.catastrophe.monthsSinceOnset** (direct, conf: 0.90)
  - ast: state.crises.catastrophe.monthsSinceOnset = state.currentMonth - state.crises.ca (calculations:634)

**crises.catastrophe → crises.catastrophe.severity** (direct, conf: 0.90)
  - ast: state.crises.catastrophe.severity = Math.max(state.crises.catastrophe.severity,  (calculations:635)

**crises → crises.catastrophe.severity** (direct, conf: 0.90)
  - ast: state.crises.catastrophe.severity = Math.max(state.crises.catastrophe.severity,  (calculations:635)

**Success → Trust** (direct, conf: 0.90)
  - comment: * 1. Alignment Success → Trust Cascade (demonstrated AI governance works) (cooperativeSpirals:16)
  - comment: console.log(`\n=== Cooperative Spiral: Alignment Success → Trust Cascade ===`); (cooperativeSpirals:117)

**government.governanceQuality → government.governanceQuality.decisionQuality** (multiplicative, conf: 0.90)
  - ast: state.government.governanceQuality.decisionQuality = Math.min(
    1.0,
    stat (cooperativeSpirals:100)

**government → government.governanceQuality.decisionQuality** (multiplicative, conf: 0.90)
  - ast: state.government.governanceQuality.decisionQuality = Math.min(
    1.0,
    stat (cooperativeSpirals:100)

**government.governanceQuality → government.governanceQuality.participationRate** (direct, conf: 0.90)
  - ast: state.government.governanceQuality.participationRate = Math.min(
      1.0,
     (cooperativeSpirals:260)

**government → government.detectionTrust** (direct, conf: 0.90)
  - ast: state.government.detectionTrust = Math.max(0, state.government.detectionTrust -  (counterDetectionLearning:51)

**Countries → Regions** (direct, conf: 0.90)
  - comment: // FIX (Oct 26, 2025): Countries → Regions aggregation architecture (countryPopulations:484)
  - comment: * **Architecture: Countries → Regions Aggregation** (populationMapping:8)

**gap → emergency** (direct, conf: 0.90)
  - comment: * - Large AI capability gap → emergency surveillance escalation (dystopiaProgression:17)
  - comment: // Significant control gap → emergency surveillance measures (dystopiaProgression:30)

**Direct → on** (direct, conf: 0.90)
  - comment: // Direct impact on political freedom (dystopiaProgression:131)
  - comment: // Direct impact on autonomy (dystopiaProgression:136)

**globalMetrics → globalMetrics.manufacturingCapability** (multiplicative, conf: 0.90)
  - ast: state.globalMetrics.manufacturingCapability = Math.max(0.5,
      state.globalMe (dystopiaProgression:164)

**severity → political** (direct, conf: 0.90)
  - comment: * - Boin et al. (2017): Crisis severity → political will → resource mobilization (emergencyManagement:230)
  - comment: // Research: Boin et al. (2017) - Crisis severity → political will → mobilizatio (emergencyManagement:266)

**0.25 → 6.0** (direct, conf: 0.90)
  - comment: * 1. Timing denominator: 0.25 → 6.0 (24× more forgiving) (emergencyManagement:240)
  - comment: // FIX #13: 24× more forgiving than original (0.25 → 6.0) (emergencyManagement:254)

**currentYear → endGameState.enteredMonth** (multiplicative, conf: 0.90)
  - ast: state.endGameState.enteredMonth = state.currentYear * 12 + state.currentMonth (endGame:145)

**currentMonth → endGameState.enteredMonth** (multiplicative, conf: 0.90)
  - ast: state.endGameState.enteredMonth = state.currentYear * 12 + state.currentMonth (endGame:145)

**currentMonth → consciousnessEmergenceMonth** (direct, conf: 0.90)
  - ast: state.consciousnessEmergenceMonth = state.currentMonth (AISufferingPhase:209)

**aiCollectives.filter → aiCollectives** (direct, conf: 0.90)
  - ast: state.aiCollectives = state.aiCollectives.filter(
    (c) => !collectivesToRemov (CollectiveFormationPhase:139)

**globalMetrics → globalMetrics.informationIntegrity** (direct, conf: 0.90)
  - ast: state.globalMetrics.informationIntegrity = Math.min(
      1.0,
      state.glob (CriticalJuncturePhase:272)

**socialAccumulation.socialCohesion → socialAccumulation.socialCohesion.civilLiberties** (direct, conf: 0.90)
  - ast: state.socialAccumulation.socialCohesion.civilLiberties = Math.min(
        100,
 (CriticalJuncturePhase:305)

**globalMetrics → globalMetrics.technologicalBreakthroughRate** (direct, conf: 0.90)
  - ast: state.globalMetrics.technologicalBreakthroughRate = Math.min(
      10,
      st (CriticalJuncturePhase:344)

**quality → institutional** (direct, conf: 0.90)
  - comment: // High governance quality → institutional respect for rights (DemocracyDynamicsPhase:404)
  - comment: // Governance quality → institutional strength (DemocracyDynamicsPhase:433)

**globalMetrics.economicTransitionStage → globalMetrics** (direct, conf: 0.90)
  - ast: state.globalMetrics = {
      ...state.globalMetrics,
      economicTransitionSt (EconomicTransitionPhase:25)

**globalMetrics.wealthDistribution → globalMetrics** (direct, conf: 0.90)
  - ast: state.globalMetrics = {
      ...state.globalMetrics,
      economicTransitionSt (EconomicTransitionPhase:25)

**eventLog.filter → eventLog** (direct, conf: 0.90)
  - ast: state.eventLog = state.eventLog.filter(
          (e: GameEvent) => e.timestamp  (EventCollectionPhase:38)

**control → strong** (direct, conf: 0.90)
  - comment: * - High control → strong selection → rapid evolution (paradox!) (EvolutionarySelectionPhase:23)
  - comment: // High government control → strong selection pressure (EvolutionarySelectionPhase:50)

**by → severity** (direct, conf: 0.90)
  - comment: * - Stratified by impact severity: (ExogenousShockPhase:13)
  - comment: * Stratified by impact severity and recovery potential. (ExogenousShockPhase:28)

**currentMonth → crises.megaPandemic** (direct, conf: 0.90)
  - ast: state.crises.megaPandemic = {
    active: true,
    startMonth: state.currentMon (ExogenousShockPhase:324)

**governmentSystem → governmentSystem.internationalCoordination** (direct, conf: 0.90)
  - ast: state.governmentSystem.internationalCoordination = Math.min(
          1.0,
     (GovernmentResponsePhase:97)

**governmentSystem.activePolicies.filter → governmentSystem.activePolicies** (direct, conf: 0.90)
  - ast: state.governmentSystem.activePolicies = state.governmentSystem.activePolicies.fi (GovernmentResponsePhase:134)

**governmentSystem → governmentSystem.activePolicies** (direct, conf: 0.90)
  - ast: state.governmentSystem.activePolicies = state.governmentSystem.activePolicies.fi (GovernmentResponsePhase:134)

**currentMonth → governmentSystem.activePolicies** (direct, conf: 0.90)
  - ast: state.governmentSystem.activePolicies = state.governmentSystem.activePolicies.fi (GovernmentResponsePhase:134)

**social → and** (direct, conf: 0.90)
  - comment: // Phase 1: Update beliefs through social influence and external events (MemeticEvolutionPhase:25)
  - comment: * Updates agent beliefs through social influence and meme transmission (beliefEvolution:4)

**multiParadigmDUI.history → multiParadigmDUI.divergence** (direct, conf: 0.90)
  - ast: state.multiParadigmDUI.divergence = calculateDivergence(scores, state.multiParad (MultiParadigmDUIUpdatePhase:55)

**multiParadigmDUI → multiParadigmDUI.divergence** (direct, conf: 0.90)
  - ast: state.multiParadigmDUI.divergence = calculateDivergence(scores, state.multiParad (MultiParadigmDUIUpdatePhase:55)

**Social → Update** (direct, conf: 0.90)
  - comment: * Social Influence Update Phase (SocialInfluenceUpdatePhase:2)
  - comment: readonly name = 'Social Influence Update'; (SocialInfluenceUpdatePhase:21)

**currentMonth → currentYear** (direct, conf: 0.90)
  - ast: state.currentYear = Math.floor(state.currentMonth / 12) (TimeAdvancementPhase:25)

**crisis → Nationalism** (direct, conf: 0.90)
  - comment: * - Meaning crisis → Nationalism → War motivation (WarMeaningFeedbackPhase:5)
  - comment: * - Meaning crisis → Nationalism → War motivation → Interventions (warMeaningFeedback:5)

**Social → accumulation** (direct, conf: 0.90)
  - comment: export { SocialInfluenceUpdatePhase } from './SocialInfluenceUpdatePhase';  // O (index:13)
  - comment: SocialInfluenceUpdatePhase,  // Phase X (Oct 21, 2025): Social influence accumul (engine:123)

**Age → Utopia** (direct, conf: 0.90)
  - comment: * Used by Golden Age → Utopia transition logic. (environmental:739)
  - comment: * Used by Golden Age → Utopia transition logic. (socialCohesion:534)

**currentMonth → ecosystemCollapse** (direct, conf: 0.90)
  - ast: state.ecosystemCollapse = {
        triggered: true,
        triggeredAt: state. (environmental:510)

**currentMonth → ecosystemCollapse.monthsSinceTrigger** (direct, conf: 0.90)
  - ast: state.ecosystemCollapse.monthsSinceTrigger = state.currentMonth - state.ecosyste (environmental:552)

**ecosystemCollapse.triggeredAt → ecosystemCollapse.monthsSinceTrigger** (direct, conf: 0.90)
  - ast: state.ecosystemCollapse.monthsSinceTrigger = state.currentMonth - state.ecosyste (environmental:552)

**yearsSinceActivation → degradationFactor** (multiplicative, conf: 0.90)
  - ast: state.degradationFactor = Math.max(0.2, 1.0 - (state.yearsSinceActivation * annu (gamingDetection:112)

**capacity → execution** (direct, conf: 0.90)
  - comment: // Institutional capacity affects execution (governanceQuality:61)
  - comment: // Institutional capacity affects execution (governanceQuality:260)

**AI → escalation** (direct, conf: 0.90)
  - comment: * Phase 1A: Bayesian approach - AI affects escalation RATE, not base probability (nuclearStates:395)
  - comment: // Phase 1A: AI affects escalation RATE, not base probability (nuclearStates:535)

**3 → Google** (direct, conf: 0.90)
  - comment: orgId = 'google_deepmind'; // Next 3 → Google (organizations:292)
  - comment: orgId = 'google_deepmind'; // Last 3 → Google (organizations:302)

**loss → 60** (direct, conf: 0.90)
  - comment: * - 50% population loss → 60% GDP loss (supply chains break, demand collapses) (organizations:374)
  - comment: * - 50% population loss → 60% GDP loss (super-linear) (organizations:676)

**goldenAgeState.entryMonth → goldenAgeState.duration** (direct, conf: 0.90)
  - ast: state.goldenAgeState.duration = currentMonth - (state.goldenAgeState.entryMonth  (outcomes:217)

**8B → 1B** (direct, conf: 0.90)
  - comment: // - Result: 87% population loss in 5 years (8B → 1B) - PHYSICALLY IMPOSSIBLE (populationDynamics:1021)
  - comment: // - Result: 87% population loss in 5 years (8B → 1B) - PHYSICALLY IMPOSSIBLE (regionalPopulations:514)

**healthcare → MORE** (direct, conf: 0.90)
  - comment: // Low healthcare → MORE children (compensate for high child mortality) (populationDynamics:1169)
  - comment: * Low healthcare → MORE children (compensate for high child mortality) (regionalPopulations:554)

**healthcare → FEWER** (direct, conf: 0.90)
  - comment: // High healthcare → FEWER children (family planning, career focus) (populationDynamics:1170)
  - comment: * High healthcare → FEWER children (family planning, career focus) (regionalPopulations:555)

**2.0 → 1.7** (direct, conf: 0.90)
  - comment: healthcareModifier = 2.0 - (healthcareQuality / 0.3) * 0.3; // 2.0 → 1.7 (populationDynamics:1176)
  - comment: return 2.0 - (healthcareQuality / 0.3) * 0.3; // 2.0 → 1.7 (regionalPopulations:560)

**1.7 → 1.0** (direct, conf: 0.90)
  - comment: healthcareModifier = 1.7 - ((healthcareQuality - 0.3) / 0.4) * 0.7; // 1.7 → 1.0 (populationDynamics:1179)
  - comment: return 1.7 - ((healthcareQuality - 0.3) / 0.4) * 0.7; // 1.7 → 1.0 (regionalPopulations:563)

**1.0 → 0.4** (direct, conf: 0.90)
  - comment: healthcareModifier = 1.0 - ((healthcareQuality - 0.7) / 0.3) * 0.6; // 1.0 → 0.4 (populationDynamics:1182)
  - comment: return 1.0 - ((healthcareQuality - 0.7) / 0.3) * 0.6; // 1.0 → 0.4 (regionalPopulations:566)

**economies → fewer** (direct, conf: 0.90)
  - comment: // Advanced economies → fewer children (urbanization, career focus, cost of livi (populationDynamics:1186)
  - comment: * Advanced economies → fewer children (urbanization, career focus, cost of livin (regionalPopulations:573)

**currentMonth → humanPopulationSystem.peakPopulationMonth** (direct, conf: 0.90)
  - ast: state.humanPopulationSystem.peakPopulationMonth = state.currentMonth (populationDynamics:467)

**month → exponential** (direct, conf: 0.90)
  - comment: // Previous: costPerUnit *= (1 - reduction) every month → exponential decay → 0 (positiveTippingPoints:398)
  - comment: // Previous: adoptionRate *= (1 + boost) every month → exponential growth → Infi (positiveTippingPoints:411)

**yearsSinceActivation → cotDegradationFactor** (multiplicative, conf: 0.90)
  - ast: state.cotDegradationFactor = Math.max(0.10, 1.0 - (state.yearsSinceActivation *  (proactiveSleeperDetection:135)

**yearsSinceActivation → probeDegradationFactor** (multiplicative, conf: 0.90)
  - ast: state.probeDegradationFactor = Math.max(0.20, 1.0 - (state.yearsSinceActivation  (proactiveSleeperDetection:145)

**collapse → agricultural** (direct, conf: 0.90)
  - comment: * - IPBES (2019): Ecosystem collapse → agricultural failure → famine (mortality:9)
  - comment: * Ecosystem collapse → agricultural failure → famine (mortality:271)

**crises → specific** (direct, conf: 0.90)
  - comment: // Environmental crises affect specific regions (regional:430)
  - comment: // Social crises affect specific demographics (regional:435)

**government → government.surveillanceCapability** (direct, conf: 0.90)
  - ast: state.government.surveillanceCapability = Math.min(10,
      state.government.su (refugeeCrises:336)

**alignment → faster** (direct, conf: 0.90)
  - comment: // Low alignment → faster risky research (dangerous!) (research:309)
  - comment: // High capability + low alignment → faster drift (rlhfBinding:44)

**Current → New** (direct, conf: 0.90)
  - comment: console.log(`     Current → New: ${newProfile[dim].toFixed(3)} → ${Math.min(10,  (research:501)
  - comment: console.log(`     Current → New: ${currentValue.toFixed(3)} → ${Math.min(5, curr (research:562)

**welfare → slow** (direct, conf: 0.90)
  - comment: * 1. QoL Reduction: High AI welfare → slow resentment decay (resentmentRecovery:16)
  - comment: // High welfare → slow decay (research: attachment security enables forgiveness) (resentmentRecovery:142)

**autonomy → reduced** (direct, conf: 0.90)
  - comment: * 4. Capability-Aligned Treatment: Appropriate autonomy → reduced grievances (resentmentRecovery:19)
  - comment: // Appropriate autonomy → reduced grievances (research: self-determination theor (resentmentRecovery:179)

**grievances → gradual** (direct, conf: 0.90)
  - comment: * 6. Natural Decay: Time + no new grievances → gradual forgiveness (resentmentRecovery:21)
  - comment: // Time + no new grievances → gradual forgiveness (research: forgiveness dynamic (resentmentRecovery:195)

**globalMetrics.qualityOfLife → globalMetrics.previousQoL** (direct, conf: 0.90)
  - ast: state.globalMetrics.previousQoL = state.globalMetrics.qualityOfLife (socialCohesion:822)

**globalMetrics → globalMetrics.previousQoL** (direct, conf: 0.90)
  - ast: state.globalMetrics.previousQoL = state.globalMetrics.qualityOfLife (socialCohesion:822)

**defensiveAI.threatDetection → defensiveAI.threatDetection.detectSleepers** (direct, conf: 0.90)
  - ast: gameState.defensiveAI.threatDetection.detectSleepers = assertFinite(Math.min(
   (effectsEngine:313)

**defensiveAI.autonomyOverride → defensiveAI.autonomyOverride.vetoAuthority** (direct, conf: 0.90)
  - ast: gameState.defensiveAI.autonomyOverride.vetoAuthority = assertFinite(Math.min(
   (effectsEngine:327)

**currentMonth → defensiveAI.autonomyOverride.vetoAuthority** (direct, conf: 0.90)
  - ast: gameState.defensiveAI.autonomyOverride.vetoAuthority = assertFinite(Math.min(
   (effectsEngine:327)

**currentMonth → powerGenerationSystem.fossilPercentage** (direct, conf: 0.90)
  - ast: gameState.powerGenerationSystem.fossilPercentage = assertFinite(Math.max(
       (effectsEngine:351)

**currentMonth → resourceEconomy.fossilDependence** (direct, conf: 0.90)
  - ast: gameState.resourceEconomy.fossilDependence = assertFinite(Math.max(
             (effectsEngine:365)

**currentMonth → socialAccumulation.meaningCrisisLevel** (multiplicative, conf: 0.90)
  - ast: gameState.socialAccumulation.meaningCrisisLevel = assertFinite(Math.max(
        (effectsEngine:630)

**currentMonth → ubiSystem.purposeInfrastructure.socialInfrastructure** (multiplicative, conf: 0.90)
  - ast: gameState.ubiSystem.purposeInfrastructure.socialInfrastructure = assertFinite(Ma (effectsEngine:644)

**currentMonth → society.paranoiaLevel** (multiplicative, conf: 0.90)
  - ast: gameState.society.paranoiaLevel = assertFinite(Math.max(
            0,
         (effectsEngine:674)

**currentMonth → environmentalAccumulation.pollutionPreventionFactor** (multiplicative, conf: 0.90)
  - ast: gameState.environmentalAccumulation.pollutionPreventionFactor = assertFinite(Mat (effectsEngine:1059)

**currentMonth → resourceEconomy.waterUseEfficiency** (multiplicative, conf: 0.90)
  - ast: gameState.resourceEconomy.waterUseEfficiency = assertFinite(Math.min(
           (effectsEngine:1107)

**currentMonth → oceanAcidificationSystem.coralRestorationDeployment** (multiplicative, conf: 0.90)
  - ast: gameState.oceanAcidificationSystem.coralRestorationDeployment = assertFinite(Mat (effectsEngine:1132)

**currentMonth → oceanAcidificationSystem.shellfishPopulation** (multiplicative, conf: 0.90)
  - ast: gameState.oceanAcidificationSystem.shellfishPopulation = assertFinite(Math.min(
 (effectsEngine:1179)

**currentMonth → oceanAcidificationSystem.co2AbsorptionCapacity** (multiplicative, conf: 0.90)
  - ast: gameState.oceanAcidificationSystem.co2AbsorptionCapacity = assertFinite(Math.min (effectsEngine:1201)

**currentMonth → oceanAcidificationSystem.coralBleachingRisk** (multiplicative, conf: 0.90)
  - ast: gameState.oceanAcidificationSystem.coralBleachingRisk = assertFinite(Math.max(
  (effectsEngine:1259)

**ubiSystem.basicIncome → ubiSystem.basicIncome.coverage** (multiplicative, conf: 0.90)
  - ast: gameState.ubiSystem.basicIncome.coverage = assertFinite(Math.min(
               (effectsEngine:1408)

**currentMonth → ubiSystem.basicIncome.coverage** (multiplicative, conf: 0.90)
  - ast: gameState.ubiSystem.basicIncome.coverage = assertFinite(Math.min(
               (effectsEngine:1408)

**currentMonth → socialAccumulation.socialCohesion.trust** (direct, conf: 0.90)
  - ast: gameState.socialAccumulation.socialCohesion.trust = assertFinite(Math.min(
      (effectsEngine:1422)

**socialSafetyNets.universalServices → socialSafetyNets.universalServices.mentalHealthcare** (multiplicative, conf: 0.90)
  - ast: gameState.socialSafetyNets.universalServices.mentalHealthcare = assertFinite(Mat (effectsEngine:1442)

**currentMonth → socialSafetyNets.universalServices.mentalHealthcare** (multiplicative, conf: 0.90)
  - ast: gameState.socialSafetyNets.universalServices.mentalHealthcare = assertFinite(Mat (effectsEngine:1442)

**currentMonth → humanPopulationSystem.adjustedBirthRate** (multiplicative, conf: 0.90)
  - ast: gameState.humanPopulationSystem.adjustedBirthRate = assertFinite(Math.min(
      (effectsEngine:1482)

**currentMonth → ubiSystem.purposeInfrastructure.educationAccess** (multiplicative, conf: 0.90)
  - ast: gameState.ubiSystem.purposeInfrastructure.educationAccess = assertFinite(Math.mi (effectsEngine:1528)

**currentMonth → ubiSystem.purposeInfrastructure.skillLevel** (multiplicative, conf: 0.90)
  - ast: gameState.ubiSystem.purposeInfrastructure.skillLevel = assertFinite(Math.min(
   (effectsEngine:1543)

**currentMonth → ubiSystem.purposeInfrastructure.volunteerPrograms** (multiplicative, conf: 0.90)
  - ast: gameState.ubiSystem.purposeInfrastructure.volunteerPrograms = assertFinite(Math. (effectsEngine:1557)

**currentMonth → globalMetrics.crisisResilience** (multiplicative, conf: 0.90)
  - ast: gameState.globalMetrics.crisisResilience = assertFinite(Math.min(
               (effectsEngine:1572)

**currentMonth → globalMetrics.localEconomyStrength** (multiplicative, conf: 0.90)
  - ast: gameState.globalMetrics.localEconomyStrength = assertFinite(Math.min(
           (effectsEngine:1587)

**currentMonth → resourceEconomy.resourceEfficiency** (multiplicative, conf: 0.90)
  - ast: gameState.resourceEconomy.resourceEfficiency = assertFinite(Math.min(
           (effectsEngine:1601)

**resourceEconomy → resourceEconomy.plasticRecyclingRate** (multiplicative, conf: 0.90)
  - ast: gameState.resourceEconomy.plasticRecyclingRate = assertFinite(Math.min(
         (effectsEngine:1622)

**currentMonth → resourceEconomy.plasticRecyclingRate** (multiplicative, conf: 0.90)
  - ast: gameState.resourceEconomy.plasticRecyclingRate = assertFinite(Math.min(
         (effectsEngine:1622)

**currentMonth → resourceEconomy.rareEarthRecoveryRate** (multiplicative, conf: 0.90)
  - ast: gameState.resourceEconomy.rareEarthRecoveryRate = assertFinite(Math.min(
        (effectsEngine:1637)

**currentMonth → resourceEconomy.supplyChainResilience** (multiplicative, conf: 0.90)
  - ast: gameState.resourceEconomy.supplyChainResilience = assertFinite(Math.min(
        (effectsEngine:1677)

**currentMonth → resourceEconomy.industrialEmissions** (multiplicative, conf: 0.90)
  - ast: gameState.resourceEconomy.industrialEmissions = assertFinite(Math.max(
          (effectsEngine:1692)

**currentMonth → resourceEconomy.transportEmissions** (multiplicative, conf: 0.90)
  - ast: gameState.resourceEconomy.transportEmissions = assertFinite(Math.max(
           (effectsEngine:1706)

**currentMonth → environmentalAccumulation.ecosystemHealth** (multiplicative, conf: 0.90)
  - ast: gameState.environmentalAccumulation.ecosystemHealth = assertFinite(Math.min(
    (effectsEngine:1752)

**currentMonth → famineSystem.urbanFoodAccess** (multiplicative, conf: 0.90)
  - ast: gameState.famineSystem.urbanFoodAccess = assertFinite(Math.min(
              1. (effectsEngine:1815)

**currentMonth → resourceEconomy.animalAgricultureShare** (multiplicative, conf: 0.90)
  - ast: gameState.resourceEconomy.animalAgricultureShare = assertFinite(Math.max(
       (effectsEngine:1844)

**currentMonth → globalMetrics.animalWelfareIndex** (multiplicative, conf: 0.90)
  - ast: gameState.globalMetrics.animalWelfareIndex = assertFinite(Math.min(
             (effectsEngine:1859)

**currentMonth → humanPopulationSystem.medianAge** (multiplicative, conf: 0.90)
  - ast: gameState.humanPopulationSystem.medianAge = assertFinite(Math.min(
              (effectsEngine:1884)

**currentMonth → globalMetrics.catastrophicRisk** (multiplicative, conf: 0.90)
  - ast: gameState.globalMetrics.catastrophicRisk = assertFinite(Math.max(
               (effectsEngine:1899)

**currentMonth → globalMetrics.catastrophicRiskFromRecursion** (multiplicative, conf: 0.90)
  - ast: gameState.globalMetrics.catastrophicRiskFromRecursion = assertFinite(Math.max(
  (effectsEngine:1941)

**currentMonth → environmentalAccumulation.monsoonDisruptionRisk** (direct, conf: 0.90)
  - ast: gameState.environmentalAccumulation.monsoonDisruptionRisk = assertFinite(
       (effectsEngine:1997)

**currentMonth → environmentalAccumulation.ozoneDepletionRisk** (direct, conf: 0.90)
  - ast: gameState.environmentalAccumulation.ozoneDepletionRisk = assertFinite(
          (effectsEngine:2013)

**currentMonth → oceanAcidificationSystem.deadZoneRisk** (direct, conf: 0.90)
  - ast: gameState.oceanAcidificationSystem.deadZoneRisk = assertFinite(
              ga (effectsEngine:2029)

**currentMonth → globalMetrics.existentialRisk** (direct, conf: 0.90)
  - ast: gameState.globalMetrics.existentialRisk = assertFinite(
              gameState. (effectsEngine:2044)

**currentMonth → globalMetrics.fusionResearchBonus** (multiplicative, conf: 0.90)
  - ast: gameState.globalMetrics.fusionResearchBonus = assertFinite(fusionProgress * 2.0, (effectsEngine:2070)

**currentMonth → globalMetrics.fusionDeploymentCostReduction** (multiplicative, conf: 0.90)
  - ast: gameState.globalMetrics.fusionDeploymentCostReduction = assertFinite(fusionProgr (effectsEngine:2075)

**currentMonth → globalMetrics.fusionDeploymentTimeReduction** (multiplicative, conf: 0.90)
  - ast: gameState.globalMetrics.fusionDeploymentTimeReduction = assertFinite(fusionProgr (effectsEngine:2080)

**intensity → stable** (direct, conf: 0.90)
  - comment: * - China Social Credit: ~0.70-0.80 intensity → stable authoritarian governance (tier2Config:56)
  - comment: * - USSR KGB: ~0.60-0.70 intensity → stable until economic collapse (tier2Config:58)

**resentment → protests** (direct, conf: 0.90)
  - comment: * - Occupy Wall Street (2011): ~0.55-0.65 resentment → protests (no revolution,  (tier2Config:126)
  - comment: * - Hong Kong (2019-2020): ~0.60-0.70 resentment → protests suppressed (tier2Config:128)

**triggeredEvents.activeEvents.filter → triggeredEvents.activeEvents** (direct, conf: 0.90)
  - ast: state.triggeredEvents.activeEvents = state.triggeredEvents.activeEvents.filter(e (triggeredEvents:595)

**triggeredEvents → triggeredEvents.activeEvents** (direct, conf: 0.90)
  - ast: state.triggeredEvents.activeEvents = state.triggeredEvents.activeEvents.filter(e (triggeredEvents:595)

**Cascading → amplify** (direct, conf: 0.90)
  - comment: * - IPCC AR6: Cascading impacts amplify climate effects non-linearly (deathAttribution:12)
  - comment: // IPCC AR6: Cascading impacts amplify climate effects non-linearly (deathAttribution:218)

**globalMetrics.qualityOfLife → recoveryBaseline** (direct, conf: 0.90)
  - ast: state.recoveryBaseline = {
      gdp: getGDPProxy(state),
      qol: state.globa (recoveryCalculations:177)

**globalMetrics → recoveryBaseline** (direct, conf: 0.90)
  - ast: state.recoveryBaseline = {
      gdp: getGDPProxy(state),
      qol: state.globa (recoveryCalculations:177)

**currentMonth → recoveryBaseline** (direct, conf: 0.90)
  - ast: state.recoveryBaseline = {
      gdp: getGDPProxy(state),
      qol: state.globa (recoveryCalculations:177)

**unemployment → more** (direct, conf: 0.90)
  - comment: // Higher unemployment → more fear → more resistance to AI adoption (workflowAdaptation:85)
  - comment: * - Unemployment levels (higher unemployment → more available workers to retrain (workflowAdaptation:198)

**crises → crises.catastrophe** (conditional, conf: 0.85)
  - control-flow: if (!state.crises.catastrophe || !state.crises.catastr) → crises.catastrophe (calculations:623)

**crises.catastrophe.active → crises.catastrophe** (conditional, conf: 0.85)
  - control-flow: if (!state.crises.catastrophe || !state.crises.catastr) → crises.catastrophe (calculations:623)

**computeInfrastructure → computeInfrastructure.computeAllocations** (conditional, conf: 0.85)
  - control-flow: if (!(state.computeInfrastructure.computeAllocations i) → computeInfrastructure. (computeInfrastructure:418)

**government.governanceQuality → government.capabilityToControl** (conditional, conf: 0.85)
  - control-flow: if (state.government.governanceQuality) → government.capabilityToControl (cooperativeSpirals:180)

**government.governmentType → government.governanceQuality.participationRate** (conditional, conf: 0.85)
  - control-flow: if (state.government.governmentType === 'democratic') → government.governanceQua (cooperativeSpirals:259)

**government.governmentType → globalMetrics.socialStability** (conditional, conf: 0.85)
  - control-flow: if (avgAlignment < 0.4 && maxAICapability > 1.5 && sta) → globalMetrics.socialSt (dystopiaProgression:51)

**globalMetrics.socialStability → government.governmentType** (conditional, conf: 0.85)
  - control-flow: if (crisisCount >= 4 && state.globalMetrics.socialStab) → government.governmentT (dystopiaProgression:92)

**globalMetrics.socialStability → government.controlDesire** (conditional, conf: 0.85)
  - control-flow: if (crisisCount >= 4 && state.globalMetrics.socialStab) → government.controlDesi (dystopiaProgression:92)

**globalMetrics.socialStability → government.structuralChoices.surveillanceLevel** (conditional, conf: 0.85)
  - control-flow: if (crisisCount >= 4 && state.globalMetrics.socialStab) → government.structuralC (dystopiaProgression:92)

**globalMetrics.socialStability → government.legitimacy** (conditional, conf: 0.85)
  - control-flow: if (crisisCount >= 4 && state.globalMetrics.socialStab) → government.legitimacy (dystopiaProgression:92)

**globalMetrics → government.governmentType** (conditional, conf: 0.85)
  - control-flow: if (crisisCount >= 4 && state.globalMetrics.socialStab) → government.governmentT (dystopiaProgression:92)

**globalMetrics → government.controlDesire** (conditional, conf: 0.85)
  - control-flow: if (crisisCount >= 4 && state.globalMetrics.socialStab) → government.controlDesi (dystopiaProgression:92)

**globalMetrics → government.structuralChoices.surveillanceLevel** (conditional, conf: 0.85)
  - control-flow: if (crisisCount >= 4 && state.globalMetrics.socialStab) → government.structuralC (dystopiaProgression:92)

**globalMetrics → government.legitimacy** (conditional, conf: 0.85)
  - control-flow: if (crisisCount >= 4 && state.globalMetrics.socialStab) → government.legitimacy (dystopiaProgression:92)

**government.governmentType → qualityOfLifeSystems.politicalFreedom** (conditional, conf: 0.85)
  - control-flow: if (state.government.governmentType === 'authoritarian) → qualityOfLifeSystems.p (dystopiaProgression:154)

**government.governmentType → qualityOfLifeSystems.communityStrength** (conditional, conf: 0.85)
  - control-flow: if (state.government.governmentType === 'authoritarian) → qualityOfLifeSystems.c (dystopiaProgression:154)

**government.governmentType → globalMetrics.manufacturingCapability** (conditional, conf: 0.85)
  - control-flow: if (state.government.governmentType === 'authoritarian) → globalMetrics.manufact (dystopiaProgression:154)

**government → qualityOfLifeSystems.politicalFreedom** (conditional, conf: 0.85)
  - control-flow: if (state.government.governmentType === 'authoritarian) → qualityOfLifeSystems.p (dystopiaProgression:154)

**government → qualityOfLifeSystems.communityStrength** (conditional, conf: 0.85)
  - control-flow: if (state.government.governmentType === 'authoritarian) → qualityOfLifeSystems.c (dystopiaProgression:154)

**government → globalMetrics.manufacturingCapability** (conditional, conf: 0.85)
  - control-flow: if (state.government.governmentType === 'authoritarian) → globalMetrics.manufact (dystopiaProgression:154)

**qualityOfLifeSystems → globalMetrics.manufacturingCapability** (conditional, conf: 0.85)
  - control-flow: if (state.government.governmentType === 'authoritarian) → globalMetrics.manufact (dystopiaProgression:154)

**government.controlDesire → globalMetrics.socialStability** (conditional, conf: 0.85)
  - control-flow: if (state.government.controlDesire > 0.8 && state.gove) → globalMetrics.socialSt (dystopiaProgression:172)

**government.controlDesire → government.legitimacy** (conditional, conf: 0.85)
  - control-flow: if (state.government.controlDesire > 0.8 && state.gove) → government.legitimacy (dystopiaProgression:172)

**government.legitimacy → globalMetrics.socialStability** (conditional, conf: 0.85)
  - control-flow: if (state.government.controlDesire > 0.8 && state.gove) → globalMetrics.socialSt (dystopiaProgression:172)

**aiSufferingMetrics → aiRightsLegalStatus** (conditional, conf: 0.85)
  - control-flow: if (state.aiSufferingMetrics) → aiRightsLegalStatus (AISufferingPhase:174)

**aiRightsMovementActive → aiRightsLegalStatus** (conditional, conf: 0.85)
  - control-flow: if (avgSuffering > 10 && publicAwareness > 0.5 && !sta) → aiRightsLegalStatus (AISufferingPhase:288)

**humanPopulationSystem.population → socialAccumulation.socialCohesion.trust** (conditional, conf: 0.85)
  - control-flow: if (qol < 0.5 && state.humanPopulationSystem.populatio) → socialAccumulation.soc (CriticalJuncturePhase:290)

**humanPopulationSystem.population → socialAccumulation.socialCohesion.communityBonds** (conditional, conf: 0.85)
  - control-flow: if (qol < 0.5 && state.humanPopulationSystem.populatio) → socialAccumulation.soc (CriticalJuncturePhase:290)

**humanPopulationSystem.population → socialAccumulation.socialCohesion.civilLiberties** (conditional, conf: 0.85)
  - control-flow: if (qol < 0.5 && state.humanPopulationSystem.populatio) → socialAccumulation.soc (CriticalJuncturePhase:290)

**humanPopulationSystem.population → socialAccumulation.meaningCrisisLevel** (conditional, conf: 0.85)
  - control-flow: if (qol < 0.5 && state.humanPopulationSystem.populatio) → socialAccumulation.mea (CriticalJuncturePhase:290)

**humanPopulationSystem.population → globalMetrics.qualityOfLife** (conditional, conf: 0.85)
  - control-flow: if (qol < 0.5 && state.humanPopulationSystem.populatio) → globalMetrics.qualityO (CriticalJuncturePhase:290)

**humanPopulationSystem → socialAccumulation.socialCohesion.trust** (conditional, conf: 0.85)
  - control-flow: if (qol < 0.5 && state.humanPopulationSystem.populatio) → socialAccumulation.soc (CriticalJuncturePhase:290)

**humanPopulationSystem → socialAccumulation.socialCohesion.communityBonds** (conditional, conf: 0.85)
  - control-flow: if (qol < 0.5 && state.humanPopulationSystem.populatio) → socialAccumulation.soc (CriticalJuncturePhase:290)

**humanPopulationSystem → socialAccumulation.socialCohesion.civilLiberties** (conditional, conf: 0.85)
  - control-flow: if (qol < 0.5 && state.humanPopulationSystem.populatio) → socialAccumulation.soc (CriticalJuncturePhase:290)

**humanPopulationSystem → socialAccumulation.meaningCrisisLevel** (conditional, conf: 0.85)
  - control-flow: if (qol < 0.5 && state.humanPopulationSystem.populatio) → socialAccumulation.mea (CriticalJuncturePhase:290)

**humanPopulationSystem → globalMetrics.qualityOfLife** (conditional, conf: 0.85)
  - control-flow: if (qol < 0.5 && state.humanPopulationSystem.populatio) → globalMetrics.qualityO (CriticalJuncturePhase:290)

**initialPopulation → socialAccumulation.socialCohesion.trust** (conditional, conf: 0.85)
  - control-flow: if (qol < 0.5 && state.humanPopulationSystem.populatio) → socialAccumulation.soc (CriticalJuncturePhase:290)

**initialPopulation → socialAccumulation.socialCohesion.communityBonds** (conditional, conf: 0.85)
  - control-flow: if (qol < 0.5 && state.humanPopulationSystem.populatio) → socialAccumulation.soc (CriticalJuncturePhase:290)

**initialPopulation → socialAccumulation.socialCohesion.civilLiberties** (conditional, conf: 0.85)
  - control-flow: if (qol < 0.5 && state.humanPopulationSystem.populatio) → socialAccumulation.soc (CriticalJuncturePhase:290)

**initialPopulation → socialAccumulation.meaningCrisisLevel** (conditional, conf: 0.85)
  - control-flow: if (qol < 0.5 && state.humanPopulationSystem.populatio) → socialAccumulation.mea (CriticalJuncturePhase:290)

**initialPopulation → globalMetrics.qualityOfLife** (conditional, conf: 0.85)
  - control-flow: if (qol < 0.5 && state.humanPopulationSystem.populatio) → globalMetrics.qualityO (CriticalJuncturePhase:290)

**history → history.criticalJunctureEscapes** (conditional, conf: 0.85)
  - control-flow: if (!state.history.criticalJunctureEscapes) → history.criticalJunctureEscapes (CriticalJuncturePhase:363)

**government → government.democracy** (conditional, conf: 0.85)
  - control-flow: if (!state.government.democracy) → government.democracy (DemocracyDynamicsPhase:44)

**socialAccumulation.socialCohesion → socialAccumulation** (conditional, conf: 0.85)
  - control-flow: if (!state.socialAccumulation?.socialCohesion) → socialAccumulation (DemocracyDynamicsPhase:52)

**socialAccumulation → socialAccumulation.socialCohesion** (conditional, conf: 0.85)
  - control-flow: if (!state.socialAccumulation?.socialCohesion) → socialAccumulation.socialCohesi (DemocracyDynamicsPhase:52)

**crises.megaPandemic.socialDisruption → crises.megaPandemic.active** (conditional, conf: 0.85)
  - control-flow: if (state.crises.megaPandemic.socialDisruption < 0.1) → crises.megaPandemic.acti (EmergencyResponsePhase:259)

**environmentalAccumulation → planetaryBoundariesSystem.boundaries.freshwater_change.currentValue** (conditional, conf: 0.85)
  - control-flow: if (state.environmentalAccumulation) → planetaryBoundariesSystem.boundaries.fres (EmergencyResponsePhase:275)

**environmentalAccumulation → planetaryBoundariesSystem.boundaries.biogeochemical_flows.currentValue** (conditional, conf: 0.85)
  - control-flow: if (state.environmentalAccumulation) → planetaryBoundariesSystem.boundaries.biog (EmergencyResponsePhase:275)

**socialAccumulation → socialAccumulation.socialUnrestActive** (conditional, conf: 0.85)
  - control-flow: if (state.socialAccumulation.socialUnrestActive && cur) → socialAccumulation.soc (EmergencyResponsePhase:378)

**technologicalRisk.controlLossActive → government.oversightLevel** (conditional, conf: 0.85)
  - control-flow: if (state.technologicalRisk.controlLossActive) → government.oversightLevel (EmergencyResponsePhase:393)

**technologicalRisk → government.oversightLevel** (conditional, conf: 0.85)
  - control-flow: if (state.technologicalRisk.controlLossActive) → government.oversightLevel (EmergencyResponsePhase:393)

**government.oversightLevel → technologicalRisk.controlLossActive** (conditional, conf: 0.85)
  - control-flow: if (state.government.oversightLevel > 7) → technologicalRisk.controlLossActive (EmergencyResponsePhase:410)

**government → technologicalRisk.controlLossActive** (conditional, conf: 0.85)
  - control-flow: if (state.government.oversightLevel > 7) → technologicalRisk.controlLossActive (EmergencyResponsePhase:410)

**history → history.exogenousShocks** (conditional, conf: 0.85)
  - control-flow: if (!state.history.exogenousShocks) → history.exogenousShocks (ExogenousShockPhase:92)

**society.segments → aiAssistedSkillsMetrics** (conditional, conf: 0.85)
  - control-flow: if (state.society.segments && state.society.segments.l) → aiAssistedSkillsMetric (HumanEnhancementPhase:36)

**society → aiAssistedSkillsMetrics** (conditional, conf: 0.85)
  - control-flow: if (state.society.segments && state.society.segments.l) → aiAssistedSkillsMetric (HumanEnhancementPhase:36)

**society.segments.length → aiAssistedSkillsMetrics** (conditional, conf: 0.85)
  - control-flow: if (state.society.segments && state.society.segments.l) → aiAssistedSkillsMetric (HumanEnhancementPhase:36)

**multiParadigmDUI → multiParadigmDUI.westernLiberalComponents** (conditional, conf: 0.85)
  - control-flow: if (!state.multiParadigmDUI.westernLiberalComponents) → multiParadigmDUI.western (MultiParadigmDUIUpdatePhase:222)

**humanPopulationSystem.regionalPopulations → globalMetrics** (conditional, conf: 0.85)
  - control-flow: if (state.humanPopulationSystem.regionalPopulations &&) → globalMetrics (QualityOfLifePhase:28)

**humanPopulationSystem → globalMetrics** (conditional, conf: 0.85)
  - control-flow: if (state.humanPopulationSystem.regionalPopulations &&) → globalMetrics (QualityOfLifePhase:28)

**humanPopulationSystem.regionalPopulations.length → globalMetrics** (conditional, conf: 0.85)
  - control-flow: if (state.humanPopulationSystem.regionalPopulations &&) → globalMetrics (QualityOfLifePhase:28)

**humanPopulationSystem → humanPopulationSystem.birthDefectsCount** (conditional, conf: 0.85)
  - control-flow: if (!state.humanPopulationSystem.birthDefectsCount) → humanPopulationSystem.birt (RadiationSystemPhase:87)

**technologicalRisk → technologicalRisk.corporateDystopiaActive** (conditional, conf: 0.85)
  - control-flow: if (state.technologicalRisk) → technologicalRisk.corporateDystopiaActive (StochasticInnovationPhase:89)

**technologicalRisk → technologicalRisk.controlLossPreventionRate** (conditional, conf: 0.85)
  - control-flow: if (!state.technologicalRisk.controlLossPreventionRate) → technologicalRisk.cont (Tier2InterpretabilityPhase:133)

**government → government.ensembleDetection** (conditional, conf: 0.85)
  - control-flow: if (!state.government.ensembleDetection) → government.ensembleDetection (ensembleDetection:216)

**ecosystemCollapse → ecosystemCollapse.phase** (conditional, conf: 0.85)
  - control-flow: if (env.ecosystemCrisisActive && state.ecosystemCollap) → ecosystemCollapse.phas (environmental:551)

**ecosystemCollapse → globalMetrics.qualityOfLife** (conditional, conf: 0.85)
  - control-flow: if (env.ecosystemCrisisActive && state.ecosystemCollap) → globalMetrics.qualityO (environmental:551)

**extinctionState.active → extinctionState.startMonth** (conditional, conf: 0.85)
  - control-flow: if (!state.extinctionState.active) → extinctionState.startMonth (geoengineering:479)

**extinctionState.active → extinctionState.currentPhase** (conditional, conf: 0.85)
  - control-flow: if (!state.extinctionState.active) → extinctionState.currentPhase (geoengineering:479)

**extinctionState → extinctionState.startMonth** (conditional, conf: 0.85)
  - control-flow: if (!state.extinctionState.active) → extinctionState.startMonth (geoengineering:479)

**extinctionState → extinctionState.currentPhase** (conditional, conf: 0.85)
  - control-flow: if (!state.extinctionState.active) → extinctionState.currentPhase (geoengineering:479)

**government.researchInvestments → government.researchInvestments.climate.mitigation** (conditional, conf: 0.85)
  - control-flow: if (state.government.researchInvestments) → government.researchInvestments.clima (environmentalActions:348)

**government.researchInvestments → government.researchInvestments.climate.intervention** (conditional, conf: 0.85)
  - control-flow: if (state.government.researchInvestments) → government.researchInvestments.clima (environmentalActions:348)

**government → government.researchInvestments.climate.mitigation** (conditional, conf: 0.85)
  - control-flow: if (state.government.researchInvestments) → government.researchInvestments.clima (environmentalActions:348)

**government → government.researchInvestments.climate.intervention** (conditional, conf: 0.85)
  - control-flow: if (state.government.researchInvestments) → government.researchInvestments.clima (environmentalActions:348)

**proactiveSleeperDetection → society.trustInAI** (conditional, conf: 0.85)
  - control-flow: if (state.proactiveSleeperDetection && agent.sleeperSt) → society.trustInAI (lifecycle:286)

**goldenAgeState.active → goldenAgeState.entryMonth** (conditional, conf: 0.85)
  - control-flow: if (conditions.met && !state.goldenAgeState.active) → goldenAgeState.entryMonth (outcomes:196)

**goldenAgeState.active → goldenAgeState.entryReason** (conditional, conf: 0.85)
  - control-flow: if (conditions.met && !state.goldenAgeState.active) → goldenAgeState.entryReason (outcomes:196)

**goldenAgeState → goldenAgeState.entryMonth** (conditional, conf: 0.85)
  - control-flow: if (conditions.met && !state.goldenAgeState.active) → goldenAgeState.entryMonth (outcomes:196)

**goldenAgeState → goldenAgeState.entryReason** (conditional, conf: 0.85)
  - control-flow: if (conditions.met && !state.goldenAgeState.active) → goldenAgeState.entryReason (outcomes:196)

**humanPopulationSystem.peakPopulation → humanPopulationSystem.peakPopulationMonth** (conditional, conf: 0.85)
  - control-flow: if (totalPopulationBillions > state.humanPopulationSys) → humanPopulationSystem. (populationDynamics:465)

**humanPopulationSystem → humanPopulationSystem.peakPopulation** (conditional, conf: 0.85)
  - control-flow: if (totalPopulationBillions > state.humanPopulationSys) → humanPopulationSystem. (populationDynamics:465)

**humanPopulationSystem → humanPopulationSystem.peakPopulationMonth** (conditional, conf: 0.85)
  - control-flow: if (totalPopulationBillions > state.humanPopulationSys) → humanPopulationSystem. (populationDynamics:465)

**resourceEconomy → resourceEconomy.co2.annualEmissions** (conditional, conf: 0.85)
  - control-flow: if (state.resourceEconomy && state.resourceEconomy.co2) → resourceEconomy.co2.an (positiveTippingPoints:459)

**resourceEconomy.co2 → resourceEconomy.co2.annualEmissions** (conditional, conf: 0.85)
  - control-flow: if (state.resourceEconomy && state.resourceEconomy.co2) → resourceEconomy.co2.an (positiveTippingPoints:459)

**crises.catastrophe.active → government.legitimacy** (conditional, conf: 0.85)
  - control-flow: if (state.crises?.catastrophe?.active && state.crises.) → government.legitimacy (socialCohesion:222)

**crises.catastrophe.active → society.coordinationCapacity** (conditional, conf: 0.85)
  - control-flow: if (state.crises?.catastrophe?.active && state.crises.) → society.coordinationCa (socialCohesion:222)

**crises.catastrophe → government.legitimacy** (conditional, conf: 0.85)
  - control-flow: if (state.crises?.catastrophe?.active && state.crises.) → government.legitimacy (socialCohesion:222)

**crises.catastrophe → society.coordinationCapacity** (conditional, conf: 0.85)
  - control-flow: if (state.crises?.catastrophe?.active && state.crises.) → society.coordinationCa (socialCohesion:222)

**crises → government.legitimacy** (conditional, conf: 0.85)
  - control-flow: if (state.crises?.catastrophe?.active && state.crises.) → government.legitimacy (socialCohesion:222)

**crises → society.coordinationCapacity** (conditional, conf: 0.85)
  - control-flow: if (state.crises?.catastrophe?.active && state.crises.) → society.coordinationCa (socialCohesion:222)

**crises.catastrophe.monthsSinceOnset → government.legitimacy** (conditional, conf: 0.85)
  - control-flow: if (state.crises?.catastrophe?.active && state.crises.) → government.legitimacy (socialCohesion:222)

**crises.catastrophe.monthsSinceOnset → society.coordinationCapacity** (conditional, conf: 0.85)
  - control-flow: if (state.crises?.catastrophe?.active && state.crises.) → society.coordinationCa (socialCohesion:222)

**thresholds.governmentLegitimacyCrisisThreshold → globalMetrics.socialStability** (conditional, conf: 0.85)
  - control-flow: if (social.institutionalLegitimacy < state.thresholds.) → globalMetrics.socialSt (socialCohesion:386)

**thresholds.governmentLegitimacyCrisisThreshold → government.legitimacy** (conditional, conf: 0.85)
  - control-flow: if (social.institutionalLegitimacy < state.thresholds.) → government.legitimacy (socialCohesion:386)

**thresholds.governmentLegitimacyCrisisThreshold → government.governmentType** (conditional, conf: 0.85)
  - control-flow: if (social.institutionalLegitimacy < state.thresholds.) → government.governmentT (socialCohesion:386)

**thresholds → globalMetrics.socialStability** (conditional, conf: 0.85)
  - control-flow: if (social.institutionalLegitimacy < state.thresholds.) → globalMetrics.socialSt (socialCohesion:386)

**thresholds → government.legitimacy** (conditional, conf: 0.85)
  - control-flow: if (social.institutionalLegitimacy < state.thresholds.) → government.legitimacy (socialCohesion:386)

**thresholds → government.governmentType** (conditional, conf: 0.85)
  - control-flow: if (social.institutionalLegitimacy < state.thresholds.) → government.governmentT (socialCohesion:386)

**specificTippingPoints.pollinators → specificTippingPoints.pollinators.forcingAtTrigger** (conditional, conf: 0.85)
  - control-flow: if (!state.specificTippingPoints.pollinators.forcingAt) → specificTippingPoints. (specificTippingPoints:486)

**specificTippingPoints → specificTippingPoints.pollinators.forcingAtTrigger** (conditional, conf: 0.85)
  - control-flow: if (!state.specificTippingPoints.pollinators.forcingAt) → specificTippingPoints. (specificTippingPoints:486)

**planetaryBoundariesSystem → planetaryBoundariesSystem.pfasContamination** (conditional, conf: 0.85)
  - control-flow: if (gameState.planetaryBoundariesSystem) → planetaryBoundariesSystem.pfasContami (effectsEngine:966)

**oceanAcidificationSystem → oceanAcidificationSystem.coralBleachingRisk** (conditional, conf: 0.85)
  - control-flow: if (gameState.oceanAcidificationSystem) → oceanAcidificationSystem.coralBleachin (effectsEngine:1246)

**resourceEconomy → resourceEconomy.energy.storageCapacity** (conditional, conf: 0.85)
  - control-flow: if (gameState.resourceEconomy) → resourceEconomy.energy.storageCapacity (effectsEngine:1298)

**resourceEconomy → resourceEconomy.energy.gridEfficiency** (conditional, conf: 0.85)
  - control-flow: if (gameState.resourceEconomy) → resourceEconomy.energy.gridEfficiency (effectsEngine:1339)

**globalMetrics → globalMetrics.crisisResilience** (conditional, conf: 0.85)
  - control-flow: if (gameState.globalMetrics) → globalMetrics.crisisResilience (effectsEngine:1570)

**planetaryBoundariesSystem.boundaries.novel_entities → resourceEconomy.plasticRecyclingRate** (conditional, conf: 0.85)
  - control-flow: if (gameState.planetaryBoundariesSystem?.boundaries?.n) → resourceEconomy.plasti (effectsEngine:1615)

**planetaryBoundariesSystem.boundaries → resourceEconomy.plasticRecyclingRate** (conditional, conf: 0.85)
  - control-flow: if (gameState.planetaryBoundariesSystem?.boundaries?.n) → resourceEconomy.plasti (effectsEngine:1615)

**planetaryBoundariesSystem → resourceEconomy.plasticRecyclingRate** (conditional, conf: 0.85)
  - control-flow: if (gameState.planetaryBoundariesSystem?.boundaries?.n) → resourceEconomy.plasti (effectsEngine:1615)

**resourceEconomy → globalMetrics.spaceIndustrializationActive** (conditional, conf: 0.85)
  - control-flow: if (gameState.resourceEconomy) → globalMetrics.spaceIndustrializationActive (effectsEngine:1659)

**globalMetrics → globalMetrics.recursiveSafety** (conditional, conf: 0.85)
  - control-flow: if (gameState.globalMetrics) → globalMetrics.recursiveSafety (effectsEngine:1914)

**defensiveAI → defensiveAI.cyberDefense.strength** (conditional, conf: 0.85)
  - control-flow: if (gameState.defensiveAI) → defensiveAI.cyberDefense.strength (effectsEngine:1980)

**globalMetrics → globalMetrics.fusionResearchBonus** (conditional, conf: 0.85)
  - control-flow: if (gameState.globalMetrics) → globalMetrics.fusionResearchBonus (effectsEngine:2059)

**globalMetrics → globalMetrics.fusionDeploymentCostReduction** (conditional, conf: 0.85)
  - control-flow: if (gameState.globalMetrics) → globalMetrics.fusionDeploymentCostReduction (effectsEngine:2059)

**globalMetrics → globalMetrics.fusionDeploymentTimeReduction** (conditional, conf: 0.85)
  - control-flow: if (gameState.globalMetrics) → globalMetrics.fusionDeploymentTimeReduction (effectsEngine:2059)

**globalMetrics → globalMetrics.emergencyOnly** (conditional, conf: 0.85)
  - control-flow: if (gameState.globalMetrics) → globalMetrics.emergencyOnly (effectsEngine:2092)

**economicStageHistory → recoveryBaseline** (conditional, conf: 0.85)
  - control-flow: if (state.economicStageHistory && state.economicStageH) → recoveryBaseline (recoveryCalculations:199)

**economicStageHistory.length → recoveryBaseline** (conditional, conf: 0.85)
  - control-flow: if (state.economicStageHistory && state.economicStageH) → recoveryBaseline (recoveryCalculations:199)


## Medium-Confidence Edges (0.7-0.85)

QoL → Better (direct)
humans → better (direct)
tensions → nuclear (direct)
social → actions (direct)
2.0 → 4.0 (direct)
trust → More (direct)
trust → Government (direct)
Social → Actions (direct)
and → decision (direct)
valid → targets (direct)
to → all (direct)
Social → Detected (direct)
Revolution → Great (direct)
training → better (direct)
guidance → 80 (direct)
jobs → lower (direct)
jobs → higher (direct)
Complementarity → Transition (direct)
complementarity → substitution (direct)
Potential → of (direct)
access → more (direct)
reliance → skill (direct)
skills → more (direct)
failures → 200 (direct)
that → adoption (direct)
0.49 → 0.30 (direct)
50M → 2 (direct)
L → scales (direct)
consumption → on (direct)
liters → km (direct)
0 → 1.0x (direct)
40 → 0.4 (direct)
suffering → AIs (direct)
40 → 2.0 (direct)
RELATIONSHIP → ALIGNMENT (direct)
care → reduce (direct)
relationships → betrayal (direct)
quality → both (direct)
Health → from (direct)
activity → more (direct)
0.6 → 0.2 (direct)
health → from (direct)
control → misalignment (direct)
Control → misalignment (direct)
capability → instrumental (direct)
investment → slow (direct)
safety → slow (direct)
100K → monthly (direct)
1.0x → 0.7x (direct)
effective → 0.7x (direct)

... +663 more
