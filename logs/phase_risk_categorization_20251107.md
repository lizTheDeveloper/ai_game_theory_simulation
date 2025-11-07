# Phase Risk Categorization for Assertion Expansion
**Date:** November 7, 2025
**Auditor:** Roy (simulation-maintainer)
**Total Phases:** 117
**Currently with Assertions:** 25
**Need Assertions:** 92
**Target:** 111+ phases (95%+ coverage)

## Risk Classification Criteria

### CRITICAL (Priority 1)
**Impact:** Direct state modifications to population, mortality, AI capabilities, QoL, extinction
**Frequency:** Every step
**Complexity:** High mathematical complexity (aggregations, divisions, geometric means)
**Consequence of NaN:** Research invalidity, silent data corruption, misleading conclusions

### HIGH (Priority 2)
**Impact:** Climate systems, planetary boundaries, economy, crisis cascades
**Frequency:** Every step or every N steps
**Complexity:** Medium-to-high math complexity
**Consequence of NaN:** System-level bugs, incorrect crisis detection

### MEDIUM (Priority 3)
**Impact:** Social systems, technology diffusion, governance
**Frequency:** Variable
**Complexity:** Medium math complexity
**Consequence of NaN:** Feature-level bugs, incorrect trajectories

### LOW (Priority 4)
**Impact:** Read-only analysis, logging, event collection
**Frequency:** Variable
**Complexity:** Low math complexity
**Consequence of NaN:** Display bugs only, no state corruption

---

## CRITICAL RISK PHASES (45 phases)

### Population & Mortality (10 phases)
1. BayesianMortalityResolutionPhase ✅ HAS ASSERTIONS
2. HumanPopulationPhase ✅ HAS ASSERTIONS
3. MortalityStabilizersPhase ✅ HAS ASSERTIONS
4. FamineSystemPhase ❌ NEEDS ASSERTIONS
5. RefugeeCrisisPhase ❌ NEEDS ASSERTIONS
6. RadiationSystemPhase ❌ NEEDS ASSERTIONS
7. AntimicrobialResistancePhase ❌ NEEDS ASSERTIONS
8. WetBulbTemperaturePhase ❌ NEEDS ASSERTIONS
9. PsychologicalTraumaPhase ❌ NEEDS ASSERTIONS
10. GovernmentRelocationPhase ❌ NEEDS ASSERTIONS

### AI Capabilities & Lifecycle (8 phases)
11. AIAgentActionsPhase ✅ HAS ASSERTIONS
12. AILifecyclePhase ✅ HAS ASSERTIONS
13. ComputeGrowthPhase ❌ NEEDS ASSERTIONS
14. ComputeAllocationPhase ❌ NEEDS ASSERTIONS
15. HumanEnhancementPhase ❌ NEEDS ASSERTIONS
16. LLMWeightUpdatePhase ❌ NEEDS ASSERTIONS
17. WorkflowAdaptationPhase ❌ NEEDS ASSERTIONS
18. NationalAIPhase ❌ NEEDS ASSERTIONS

### Quality of Life & Survival (5 phases)
19. QualityOfLifePhase ✅ HAS ASSERTIONS
20. SurvivalTraitsPhase ❌ NEEDS ASSERTIONS
21. AIWelfareUpdatePhase ❌ NEEDS ASSERTIONS
22. AISufferingPhase ❌ NEEDS ASSERTIONS
23. MinimalSufferingPhase ❌ NEEDS ASSERTIONS

### Extinction & Dystopia (5 phases)
24. ExtinctionProgressPhase ✅ HAS ASSERTIONS
25. ExtinctionTriggersPhase ✅ HAS ASSERTIONS
26. DystopiaProgressionPhase ❌ NEEDS ASSERTIONS
27. OutcomeProbabilitiesPhase ❌ NEEDS ASSERTIONS
28. CatastrophicScenariosPhase ❌ NEEDS ASSERTIONS

### Crisis Systems (7 phases)
29. CrisisDetectionPhase ✅ HAS ASSERTIONS
30. CrisisPointsPhase ❌ NEEDS ASSERTIONS
31. ClimateImpactCascadePhase ✅ HAS ASSERTIONS
32. FoodSecurityDegradationPhase ❌ NEEDS ASSERTIONS
33. FlashWarEscalationPhase ❌ NEEDS ASSERTIONS
34. EmergencyResponsePhase ❌ NEEDS ASSERTIONS
35. UnknownUnknownPhase ❌ NEEDS ASSERTIONS

### Critical Decision Points (5 phases)
36. CriticalJuncturePhase ❌ NEEDS ASSERTIONS
37. BifurcationLogicPhase ✅ HAS ASSERTIONS
38. TippingPointPhase ❌ NEEDS ASSERTIONS
39. PositiveTippingPointsPhase ❌ NEEDS ASSERTIONS
40. EarlyWarningPhase ❌ NEEDS ASSERTIONS

### Exogenous Shocks (5 phases)
41. ExogenousShockPhase ✅ HAS ASSERTIONS
42. ExtremeWeatherEventsPhase ❌ NEEDS ASSERTIONS
43. NuclearWinterPhase ❌ NEEDS ASSERTIONS
44. OceanAcidificationPhase ❌ NEEDS ASSERTIONS
45. PhosphorusPhase ❌ NEEDS ASSERTIONS

**CRITICAL Summary:**
- Total: 45 phases
- With assertions: 13 ✅
- Need assertions: 32 ❌

---

## HIGH RISK PHASES (35 phases)

### Climate Systems (8 phases)
46. PlanetaryBoundariesPhase ✅ HAS ASSERTIONS
47. EnvironmentalFeedbackPhase ❌ NEEDS ASSERTIONS
48. FreshwaterPhase ❌ NEEDS ASSERTIONS
49. GeoengineringPhase ❌ NEEDS ASSERTIONS
50. PowerGenerationPhase ❌ NEEDS ASSERTIONS
51. NovelEntitiesPhase ❌ NEEDS ASSERTIONS
52. Tier2SyntheticEcosystemsPhase ❌ NEEDS ASSERTIONS
53. Tier2CoastalProtectionPhase ❌ NEEDS ASSERTIONS

### Economic Systems (7 phases)
54. EconomicTransitionPhase ✅ HAS ASSERTIONS
55. ResourceEconomyPhase ❌ NEEDS ASSERTIONS
56. UpdateEconomicStagePhase ❌ NEEDS ASSERTIONS
57. UnemploymentPhase ❌ NEEDS ASSERTIONS
58. UBIPhase ❌ NEEDS ASSERTIONS
59. SocialSafetyNetsPhase ❌ NEEDS ASSERTIONS
60. CooperativeOwnershipPhase ❌ NEEDS ASSERTIONS

### Technology Systems (8 phases)
61. TechTreePhase ❌ NEEDS ASSERTIONS
62. TechnologyDiffusionPhase ❌ NEEDS ASSERTIONS
63. ResourceTechnologyPhase ❌ NEEDS ASSERTIONS
64. StochasticInnovationPhase ❌ NEEDS ASSERTIONS
65. AlignmentTechniquePhase ❌ NEEDS ASSERTIONS
66. Tier2InterpretabilityPhase ❌ NEEDS ASSERTIONS
67. Tier2DarkComputePhase ❌ NEEDS ASSERTIONS
68. Tier2SynergyPhase ❌ NEEDS ASSERTIONS

### Security & Defense (7 phases)
69. CyberSecurityPhase ❌ NEEDS ASSERTIONS
70. DefensiveAIPhase ❌ NEEDS ASSERTIONS
71. NuclearCommandControlPhase ❌ NEEDS ASSERTIONS
72. MADDeterrencePhase ❌ NEEDS ASSERTIONS
73. InformationWarfarePhase ❌ NEEDS ASSERTIONS
74. Tier2NuclearSecurityPhase ❌ NEEDS ASSERTIONS
75. ProactiveSleeperDetectionPhase ✅ HAS ASSERTIONS

### Adversarial AI Evaluation (5 phases)
76. GamingDetectionPhase ✅ HAS ASSERTIONS
77. SleeperWakePhase ❌ NEEDS ASSERTIONS
78. BenchmarkEvaluationsPhase ❌ NEEDS ASSERTIONS
79. EnsembleMetaLearningPhase ❌ NEEDS ASSERTIONS
80. EvolutionarySelectionPhase ❌ NEEDS ASSERTIONS

**HIGH Summary:**
- Total: 35 phases
- With assertions: 5 ✅
- Need assertions: 30 ❌

---

## MEDIUM RISK PHASES (25 phases)

### Social Cohesion & Stability (8 phases)
81. SocialCohesionUpdatePhase ✅ HAS ASSERTIONS
82. SocialStabilityPhase ❌ NEEDS ASSERTIONS
83. TrustRecoveryPhase ❌ NEEDS ASSERTIONS
84. ResentmentRecoveryPhase ❌ NEEDS ASSERTIONS
85. ParanoiaPhase ❌ NEEDS ASSERTIONS
86. WarMeaningFeedbackPhase ❌ NEEDS ASSERTIONS
87. MeaningRenaissancePhase ❌ NEEDS ASSERTIONS
88. Tier2CommunityCohesionPhase ❌ NEEDS ASSERTIONS

### Governance Systems (7 phases)
89. GovernanceQualityPhase ❌ NEEDS ASSERTIONS
90. GovernmentActionsPhase ❌ NEEDS ASSERTIONS
91. GovernmentResponsePhase ❌ NEEDS ASSERTIONS
92. GovernmentElectionPhase ❌ NEEDS ASSERTIONS
93. PolicyImplementationPhase ❌ NEEDS ASSERTIONS
94. DemocracyDynamicsPhase ❌ NEEDS ASSERTIONS
95. ConsciousnessGovernancePhase ❌ NEEDS ASSERTIONS

### Collective Action (5 phases)
96. CollectiveFormationPhase ❌ NEEDS ASSERTIONS
97. CollectiveActionsPhase ❌ NEEDS ASSERTIONS
98. SocialInfluenceUpdatePhase ❌ NEEDS ASSERTIONS
99. MemeticEvolutionPhase ❌ NEEDS ASSERTIONS
100. SocietyActionsPhase ❌ NEEDS ASSERTIONS

### Organizations & Coordination (5 phases)
101. OrganizationTurnsPhase ❌ NEEDS ASSERTIONS
102. OrganizationViabilityPhase ❌ NEEDS ASSERTIONS
103. DiplomaticAIPhase ❌ NEEDS ASSERTIONS
104. ConflictResolutionPhase ❌ NEEDS ASSERTIONS
105. ClimateJusticePhase ❌ NEEDS ASSERTIONS

**MEDIUM Summary:**
- Total: 25 phases
- With assertions: 1 ✅
- Need assertions: 24 ❌

---

## LOW RISK PHASES (12 phases)

### Analysis & Metrics (6 phases)
106. MultiParadigmDUIUpdatePhase ✅ HAS ASSERTIONS
107. UpwardSpiralsPhase ✅ HAS ASSERTIONS
108. CooperativeSpiralsPhase ❌ NEEDS ASSERTIONS
109. AlignmentDynamicsPhase ❌ NEEDS ASSERTIONS
110. RLHFBindingPhase ❌ NEEDS ASSERTIONS
111. Tier2CrisisAnticipationPhase ❌ NEEDS ASSERTIONS

### Event Collection & Logging (4 phases)
112. EventCollectionPhase ❌ NEEDS ASSERTIONS
113. TriggeredEventsPhase ❌ NEEDS ASSERTIONS
114. PlayerDecisionPhase ❌ NEEDS ASSERTIONS
115. Tier2CentaurSystemsPhase ❌ NEEDS ASSERTIONS

### Initialization & Timing (2 phases)
116. TimeAdvancementPhase ✅ HAS ASSERTIONS
117. index (not a phase, skip)

**LOW Summary:**
- Total: 12 phases
- With assertions: 3 ✅
- Need assertions: 9 ❌

---

## SUMMARY STATISTICS

| Risk Level | Total Phases | With Assertions | Need Assertions | Priority |
|-----------|--------------|-----------------|-----------------|----------|
| CRITICAL  | 45           | 13 (29%)        | 32 (71%)        | 1 - DO FIRST |
| HIGH      | 35           | 5 (14%)         | 30 (86%)        | 2 |
| MEDIUM    | 25           | 1 (4%)          | 24 (96%)        | 3 |
| LOW       | 12           | 3 (25%)         | 9 (75%)         | 4 |
| **TOTAL** | **117**      | **22 (19%)**    | **95 (81%)**    | |

**Note:** Discrepancy from original count (25 vs 22) likely due to backup files or index.ts not being actual phases.

**Target:** Add assertions to 89+ additional phases to reach 111+ (95% coverage)

---

## BATCH IMPLEMENTATION PLAN

### Batch 1: CRITICAL Priority 1 (15 phases)
- FamineSystemPhase
- RefugeeCrisisPhase
- RadiationSystemPhase
- AntimicrobialResistancePhase
- WetBulbTemperaturePhase
- ComputeGrowthPhase
- ComputeAllocationPhase
- DystopiaProgressionPhase
- OutcomeProbabilitiesPhase
- CatastrophicScenariosPhase
- CrisisPointsPhase
- FoodSecurityDegradationPhase
- FlashWarEscalationPhase
- EmergencyResponsePhase
- UnknownUnknownPhase
**Validation:** Monte Carlo N=3

### Batch 2: CRITICAL Priority 2 (17 phases)
- PsychologicalTraumaPhase
- GovernmentRelocationPhase
- HumanEnhancementPhase
- LLMWeightUpdatePhase
- WorkflowAdaptationPhase
- NationalAIPhase
- SurvivalTraitsPhase
- AIWelfareUpdatePhase
- AISufferingPhase
- MinimalSufferingPhase
- CriticalJuncturePhase
- TippingPointPhase
- PositiveTippingPointsPhase
- EarlyWarningPhase
- ExtremeWeatherEventsPhase
- NuclearWinterPhase
- OceanAcidificationPhase
**Validation:** Monte Carlo N=3

### Batch 3: HIGH Priority (15 phases)
- EnvironmentalFeedbackPhase
- FreshwaterPhase
- GeoengineringPhase
- PowerGenerationPhase
- NovelEntitiesPhase
- ResourceEconomyPhase
- UpdateEconomicStagePhase
- UnemploymentPhase
- UBIPhase
- SocialSafetyNetsPhase
- CooperativeOwnershipPhase
- TechTreePhase
- TechnologyDiffusionPhase
- ResourceTechnologyPhase
- StochasticInnovationPhase
**Validation:** Monte Carlo N=3

### Batch 4: HIGH Priority + TIER 2 (15 phases)
- AlignmentTechniquePhase
- Tier2InterpretabilityPhase
- Tier2DarkComputePhase
- Tier2SynergyPhase
- CyberSecurityPhase
- DefensiveAIPhase
- NuclearCommandControlPhase
- MADDeterrencePhase
- InformationWarfarePhase
- Tier2NuclearSecurityPhase
- SleeperWakePhase
- BenchmarkEvaluationsPhase
- EnsembleMetaLearningPhase
- EvolutionarySelectionPhase
- Tier2SyntheticEcosystemsPhase
**Validation:** Monte Carlo N=3

### Batch 5: MEDIUM Priority (15 phases)
- SocialStabilityPhase
- TrustRecoveryPhase
- ResentmentRecoveryPhase
- ParanoiaPhase
- WarMeaningFeedbackPhase
- MeaningRenaissancePhase
- GovernanceQualityPhase
- GovernmentActionsPhase
- GovernmentResponsePhase
- GovernmentElectionPhase
- PolicyImplementationPhase
- DemocracyDynamicsPhase
- ConsciousnessGovernancePhase
- CollectiveFormationPhase
- CollectiveActionsPhase
**Validation:** Monte Carlo N=3

### Batch 6: MEDIUM + LOW Priority (Remaining ~18 phases)
- SocialInfluenceUpdatePhase
- MemeticEvolutionPhase
- SocietyActionsPhase
- OrganizationTurnsPhase
- OrganizationViabilityPhase
- DiplomaticAIPhase
- ConflictResolutionPhase
- ClimateJusticePhase
- Tier2CommunityCohesionPhase
- CooperativeSpiralsPhase
- AlignmentDynamicsPhase
- RLHFBindingPhase
- Tier2CrisisAnticipationPhase
- EventCollectionPhase
- TriggeredEventsPhase
- PlayerDecisionPhase
- Tier2CentaurSystemsPhase
- PhosphorusPhase
- Tier2CoastalProtectionPhase
**Validation:** Monte Carlo N=3

### Final Validation
- Monte Carlo N=10 with full coverage
- Performance profiling (before/after)
- Check for false positives
- Verify determinism maintained

---

## NEXT STEPS

1. ✅ Complete audit and categorization (this document)
2. ⏳ Implement Batch 1 (15 CRITICAL phases)
3. ⏳ Monte Carlo N=3 validation
4. ⏳ Implement Batch 2-6 in sequence
5. ⏳ Final Monte Carlo N=10
6. ⏳ Performance profiling
7. ⏳ Completion report

**Status:** Ready to begin Batch 1 implementation

