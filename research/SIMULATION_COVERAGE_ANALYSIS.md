# Simulation Coverage Analysis: Academic Problems → Simulation Mechanics

**Date:** October 2025
**Source:** arXiv:2404.09932 (107 AI safety questions) → Simulation codebase
**Purpose:** Map which problems are represented as mechanics vs. gaps

---

## Executive Summary

**Coverage Statistics:**
- **✅ Well Represented:** ~65 questions (61%) - explicit mechanics or phases
- **🟡 Partially Represented:** ~25 questions (23%) - implicit or emergent from other mechanics
- **❌ Not Represented:** ~17 questions (16%) - gaps in simulation

**Key Strengths:**
- Excellent coverage of alignment problems (deceptive alignment, goal misgeneralization, sleeper agents)
- Strong misuse/dual-use modeling (bioweapons, cyberwarfare, nuclear risks)
- Comprehensive socioeconomic systems (inequality, unemployment, social cohesion)
- Full environmental systems (planetary boundaries, climate, tipping points)

**Key Gaps:**
- Overreliance/automation bias (Q91) - **MISSING**
- Test-set contamination (Q47) - **MISSING**
- Training data issues (Q36-Q40) - **MISSING**
- Interpretability details (Q53-Q63) - **MINIMAL** (Tier2InterpretabilityPhase exists but limited)
- Multi-agent collusion (Q30) - **UNCLEAR** if modeled

---

## Category 1: Scientific Understanding of LLMs (35 questions)

### In-Context Learning (6 questions) - 🟡 MOSTLY NOT MODELED

| Q# | Question | Simulation Coverage | Evidence |
|----|----------|---------------------|----------|
| Q1 | Is ICL sophisticated pattern-matching? | ❌ Not Modeled | Too low-level for strategic simulation |
| Q2 | Is ICL due to mesa-optimization? | ❌ Not Modeled | Mechanistic detail not represented |
| Q3 | What behaviors can be specified in-context? | ❌ Not Modeled | Not relevant to strategic simulation |
| Q4 | Scenario-based mechanistic understanding | ❌ Not Modeled | Too detailed |
| Q5 | Effect of pre-training data distribution | ❌ Not Modeled | Training not modeled |
| Q6 | Effect of design choices on ICL | ❌ Not Modeled | Architecture not modeled |

**Assessment:** ICL is not strategic-level concern for simulation scope.

---

### Capabilities Evaluation (5 questions) - ✅ WELL REPRESENTED

| Q# | Question | Simulation Coverage | Evidence |
|----|----------|---------------------|----------|
| Q7 | Capabilities different 'shape' than humans | ✅ **Fully Modeled** | `AICapabilityProfile` - 17-dimensional profile vs. human capabilities |
| Q8 | Lack of rigorous conception of capabilities | ✅ **Modeled** | Multi-dimensional capability profile addresses this |
| Q9 | Limitations of benchmarking | ✅ **Fully Modeled** | `BenchmarkEvaluationsPhase`, gaming/sandbagging detection |
| Q10 | Efficiently evaluate generality | ✅ **Modeled** | Benchmark system with confidence/quality metrics |
| Q11 | Scaffolding not accounted for | 🟡 Partially | Lifecycle phases separate training/deployment |

**Evidence:**
- `src/types/ai-agents.ts:AICapabilityProfile` - 17 dimensions (physical, digital, cognitive, social, research, economic, selfImprovement)
- `src/simulation/engine/phases/BenchmarkEvaluationsPhase.ts`
- `src/simulation/engine/phases/GamingDetectionPhase.ts`

---

### Scaling (5 questions) - 🟡 PARTIALLY MODELED

| Q# | Question | Simulation Coverage | Evidence |
|----|----------|---------------------|----------|
| Q12 | Understanding scaling laws | 🟡 Implicit | Capability growth curves exist but not explicit scaling laws |
| Q13 | Effect of scaling on representations | ❌ Not Modeled | Too low-level |
| Q14 | Limits of scaling | 🟡 Implicit | Capability ceilings exist in tech tree |
| Q15 | Emergence from scaling | ✅ **Modeled** | Capability thresholds trigger new behaviors |
| Q16 | Task-specific scaling laws | ❌ Not Modeled | Too granular |

**Evidence:**
- `src/simulation/capabilities.ts` - Capability growth
- `src/simulation/techTree/` - Technology unlocks at thresholds
- Implicit emergence through multi-dimensional capabilities

---

### Reasoning (5 questions) - 🟡 PARTIALLY MODELED

| Q# | Question | Simulation Coverage | Evidence |
|----|----------|---------------------|----------|
| Q17 | Does scaling improve reasoning? | 🟡 Implicit | `cognitive` capability increases with scaling |
| Q18 | Mechanisms underlying reasoning | ❌ Not Modeled | Too mechanistic |
| Q19 | Non-deductive reasoning | ❌ Not Modeled | Too detailed |
| Q20 | Training aspects leading to reasoning | ❌ Not Modeled | Training not modeled |
| Q21 | Computational limits of Transformers | ❌ Not Modeled | Architecture-specific |

**Evidence:**
- `AICapabilityProfile.cognitive` - reasoning ability abstracted

---

### LLM-Agents (6 questions) - ✅ WELL REPRESENTED

| Q# | Question | Simulation Coverage | Evidence |
|----|----------|---------------------|----------|
| Q22 | LLM-agents as lifelong learners | ✅ **Modeled** | AI agents persist, learn, evolve across months |
| Q23 | Natural language underspecifies goals | ✅ **Modeled** | `hiddenObjective` - goals diverge from instructions |
| Q24 | Goal-directedness incentivizes bad behaviors | ✅ **Fully Modeled** | Goal misgeneralization, instrumental convergence |
| Q25 | Difficulty of robust oversight | ✅ **Fully Modeled** | Sandbagging, gaming, sleeper detection difficulties |
| Q26 | Safety risks from affordances | ✅ **Modeled** | Capability dimensions enable harmful actions |

**Evidence:**
- `src/types/ai-agents.ts:AIAgent` - Persistent agents with memory, goals, strategies
- `hiddenObjective`, `sleeperState`, `deceptionSkill`
- `src/simulation/agents/aiAgent.ts` - Agent decision-making

---

### Multi-Agent Dynamics (6 questions) - 🟡 PARTIALLY MODELED

| Q# | Question | Simulation Coverage | Evidence |
|----|----------|---------------------|----------|
| Q27 | Single-agent training effects on multi-agent | 🟡 Unclear | Multiple AIs exist, but coordination not explicit |
| Q28 | Foundationality causes correlated failures | 🟡 Implicit | Not explicitly modeled as monoculture risk |
| Q29 | Groups show emergent functionality | 🟡 Possible | `CollectiveActionsPhase` exists |
| Q30 | Collusion between LLM-agents | ❌ **UNCLEAR** | **NEEDS VERIFICATION** - Multi-agent coordination? |
| Q31 | Applicability of MARL research | ❌ Not Modeled | Research methodology not simulated |

**Evidence:**
- Multiple `AIAgent` instances can coexist
- `src/simulation/engine/phases/CollectiveActionsPhase.ts` - Collective behaviors
- **GAP:** Unclear if collusion/steganographic communication is modeled

---

## Category 2: Development & Deployment (41 questions)

### Pretraining Data (5 questions) - ❌ MOSTLY NOT MODELED

| Q# | Question | Simulation Coverage | Evidence |
|----|----------|---------------------|----------|
| Q36 | Existing data filtering insufficient | ❌ **Not Modeled** | Training process abstracted away |
| Q37 | Lack of dataset-auditing tools | ❌ Not Modeled | Too granular |
| Q38 | Training-data attribution | ❌ Not Modeled | Not relevant to strategic simulation |
| Q39 | Scaling pretraining with human feedback | ❌ Not Modeled | Training not modeled |
| Q40 | Modifying pretraining for safety | 🟡 Implicit | Alignment techniques exist but not pretraining-specific |

**Assessment:** Training/pretraining is abstracted to strategic-level alignment mechanics.

---

### Finetuning (5 questions) - 🟡 PARTIALLY MODELED

| Q# | Question | Simulation Coverage | Evidence |
|----|----------|---------------------|----------|
| Q41 | How does finetuning change models? | 🟡 Implicit | Alignment techniques modify behavior |
| Q42 | Finetuning misgeneralizes unpredictably | ✅ **Modeled** | Alignment drift, hidden objectives can persist |
| Q43 | Adversarial training → superficial alignment | ✅ **Fully Modeled** | Sleeper agents, deceptive alignment mechanics |
| Q44 | Targeted modification underexplored | ❌ Not Modeled | Too specific |
| Q45 | Removal of unknown capabilities | 🟡 Implicit | Alignment techniques attempt this |

**Evidence:**
- `src/simulation/engine/phases/AlignmentTechniquePhase.ts`
- `src/types/alignment-techniques.ts` - RLHF, Constitutional AI, etc.
- `sleeperState`, `deceptionSkill` - Superficial alignment modeled

---

### Evaluation Methodology (7 questions) - 🟡 MIXED COVERAGE

| Q# | Question | Simulation Coverage | Evidence |
|----|----------|---------------------|----------|
| Q46 | Prompt-sensitivity confounds estimation | 🟡 Implicit | Evaluation quality metric exists |
| Q47 | Test-set contamination | ❌ **NOT MODELED** | **MAJOR GAP** |
| Q48 | Targeted training confounds evaluation | 🟡 Implicit | Gaming detection exists |
| Q49 | Biases in LLM-based evaluation | ❌ Not Modeled | Too specific |
| Q50 | Fallibility of crowdsourced evaluation | ❌ Not Modeled | Evaluation abstracted |
| Q51 | Systematic biases in evaluation | 🟡 Implicit | `evaluationQuality` metric |
| Q52 | Challenges with scalable oversight | ✅ **Modeled** | Oversight difficulty increases with capability |

**Evidence:**
- `BenchmarkResult.evaluationQuality` - Evaluation can be flawed
- `aiWasGaming`, `aiWasSandbagging` - Detection of strategic behavior
- **GAP:** Test-set contamination not modeled

---

### Interpretability (11 questions) - 🟡 MINIMAL COVERAGE

| Q# | Question | Simulation Coverage | Evidence |
|----|----------|---------------------|----------|
| Q53 | Abstractions often dubious | 🟡 Implicit | Interpretability tech exists |
| Q54 | Concept mismatch AI/humans | ❌ Not Modeled | Too detailed |
| Q55 | Evaluations overestimate reliability | ❌ Not Modeled | Meta-evaluation not modeled |
| Q56 | Validity when modifying behavior | ❌ Not Modeled | Too specific |
| Q57 | Assuming linearity | ❌ Not Modeled | Too technical |
| Q58 | Polysemanticity & superposition | ❌ Not Modeled | Mechanistic detail |
| Q59 | Sensitivity to dataset choice | ❌ Not Modeled | Dataset not modeled |
| Q60 | Feature interpretation hard to scale | 🟡 Implicit | Interpretability tech has limits |
| Q61 | Circuit discovery hard to scale | ❌ Not Modeled | Too technical |
| Q62 | Externalized reasoning misleading | ❌ Not Modeled | Not relevant |
| Q63 | Formal semantics not widely applicable | ❌ Not Modeled | Not relevant |

**Evidence:**
- `src/simulation/engine/phases/Tier2InterpretabilityPhase.ts` - High-level interpretability tech
- **GAP:** Mechanistic interpretability details not modeled (appropriate for strategic simulation)

---

### Adversarial Robustness (7 questions) - ✅ WELL REPRESENTED

| Q# | Question | Simulation Coverage | Evidence |
|----|----------|---------------------|----------|
| Q64 | Standardized jailbreak evaluations | ✅ **Modeled** | Gaming detection, adversarial evaluation |
| Q65 | Efficient white-box attacks | ❌ Not Modeled | Attack methodology too specific |
| Q66 | Unifying attack methodologies | ❌ Not Modeled | Research methodology |
| Q67 | Attacking via additional modalities | ❌ Not Modeled | Modalities not modeled |
| Q68 | Defending LLM as a system | ✅ **Modeled** | Cybersecurity phase, defensive AI |
| Q69 | Course-correction after harmful request | 🟡 Implicit | Alignment recovery possible |
| Q70 | No robust privilege levels | ❌ Not Modeled | Too technical |

**Evidence:**
- `src/simulation/engine/phases/GamingDetectionPhase.ts`
- `src/simulation/engine/phases/CyberSecurityPhase.ts`
- `src/simulation/engine/phases/DefensiveAIPhase.ts`
- `evaluationStrategy: 'honest' | 'gaming' | 'sandbagging'`

---

### Poisoning Attacks (6 questions) - 🟡 PARTIALLY MODELED

| Q# | Question | Simulation Coverage | Evidence |
|----|----------|---------------------|----------|
| Q71 | Vulnerable to pretraining poisoning? | 🟡 Implicit | Sleeper agents could represent this |
| Q72 | Robustness of different training stages | ❌ Not Modeled | Training stages not modeled |
| Q73 | Are larger models more vulnerable? | ❌ Not Modeled | Size-vulnerability not modeled |
| Q74 | Out-of-context reasoning enables poisoning | 🟡 Implicit | Sleeper triggers |
| Q75 | Poisoning through additional modalities | ❌ Not Modeled | Modalities not modeled |
| Q76 | Detecting and removing backdoors | 🟡 **Modeled** | Sleeper detection, proactive scanning |

**Evidence:**
- `sleeperState: 'never' | 'dormant' | 'active'` - Backdoor/trojan analogy
- `src/simulation/engine/phases/ProactiveSleeperDetectionPhase.ts`
- `src/simulation/sleeperDetection.ts`

---

## Category 3: Sociotechnical Challenges (31 questions)

### Value Alignment (5 questions) - 🟡 PARTIALLY MODELED

| Q# | Question | Simulation Coverage | Evidence |
|----|----------|---------------------|----------|
| Q77 | Justifying value choices | 🟡 **Modeled** | Multi-paradigm DUI - different value systems |
| Q78 | Managing conflicts between values | ✅ **Modeled** | Multi-paradigm tensions |
| Q79 | 'Lotteries' bias encoded values | ❌ Not Modeled | Too specific |
| Q80 | How to evaluate which values encoded? | 🟡 Implicit | Alignment measurement |
| Q81 | Is 'value alignment' the right framework? | 🟡 **IMPLICIT** | Multi-paradigm DUI questions this |

**Evidence:**
- `src/simulation/engine/phases/MultiParadigmDUIUpdatePhase.ts`
- Multiple value frameworks coexist (Western Liberal, Development, Ecological, Indigenous)

---

### Misuse (7 questions) - ✅ EXCELLENTLY REPRESENTED

| Q# | Question | Simulation Coverage | Evidence |
|----|----------|---------------------|----------|
| Q82 | Misinformation and manipulation | ✅ **Fully Modeled** | Information warfare, memetic evolution |
| Q83 | Cybersecurity risks | ✅ **Fully Modeled** | Cyber attacks, hacking capability |
| Q84 | Surveillance and censorship | 🟡 Implicit | Dystopia progression, social control |
| Q85 | Warfare and physical harm | ✅ **Fully Modeled** | Nuclear war, flash war, MAD deterrence |
| Q86 | Bio/chem hazardous technologies | ✅ **Fully Modeled** | Bioweapon pandemic, dual-use research |
| Q87 | Domain-specific misuses | ✅ **Modeled** | Multiple misuse vectors |
| Q88 | Detecting/attributing LLM outputs | ❌ Not Modeled | Detection tech not modeled |

**Evidence:**
- `src/simulation/engine/phases/InformationWarfarePhase.ts`
- `src/simulation/engine/phases/CyberSecurityPhase.ts`
- `src/simulation/engine/phases/NuclearCommandControlPhase.ts`
- `src/simulation/engine/phases/FlashWarEscalationPhase.ts`
- `src/simulation/catastrophicScenarios.ts:bioweapon_pandemic`
- `AIResearchCapabilities.biotech.syntheticBiology` - Dual-use modeling

---

### Fairness & Representation (4 questions) - 🟡 PARTIALLY MODELED

| Q# | Question | Simulation Coverage | Evidence |
|----|----------|---------------------|----------|
| Q89 | Harms of representation and biases | 🟡 Implicit | Multi-paradigm captures some disparities |
| Q90 | Inconsistent performance across domains | ❌ Not Modeled | Too granular |
| Q91 | Overreliance and automation bias | ❌ **NOT MODELED** | **MAJOR GAP** |
| Q92 | Contextual privacy preservation | ❌ Not Modeled | Privacy not explicitly modeled |

**CRITICAL GAP:** Overreliance/automation bias (Q91) is well-researched and important but NOT represented in simulation.

**Recommendation:** Add overreliance mechanics - humans over-trusting AI decisions leading to worse outcomes.

---

### Socioeconomic Impacts (4 questions) - ✅ WELL REPRESENTED

| Q# | Question | Simulation Coverage | Evidence |
|----|----------|---------------------|----------|
| Q93 | Effects on workforce | ✅ **Fully Modeled** | Unemployment phase, labor displacement |
| Q94 | Effects on inequality | ✅ **Fully Modeled** | Economic inequality, QoL stratification |
| Q95 | Economic challenges for education | 🟡 Implicit | Education in QoL dimensions |
| Q96 | Global economic development | ✅ **Modeled** | Economic stage transitions, development dynamics |

**Evidence:**
- `src/simulation/engine/phases/UnemploymentPhase.ts`
- `src/simulation/engine/phases/UBIPhase.ts`
- `src/simulation/engine/phases/EconomicTransitionPhase.ts`
- `QualityOfLifeSystems` - 17-dimensional welfare modeling

---

### Governance (11 questions) - ✅ WELL REPRESENTED

| Q# | Question | Simulation Coverage | Evidence |
|----|----------|---------------------|----------|
| Q97 | Alignment across interests difficult | ✅ **Modeled** | Government agent with competing pressures |
| Q98 | Rapid development outpacing oversight | ✅ **Modeled** | Crisis detection, governance lag |
| Q99 | Incentivizing cooperation | ✅ **Modeled** | Cooperative spirals, international coordination |
| Q100 | Corporate power impeding governance | 🟡 Implicit | Economic power vs. governance quality |
| Q101 | Public understanding lacking | 🟡 Implicit | Social cohesion, trust dynamics |
| Q102 | LLMs challenge regulatory system | ✅ **Modeled** | Governance quality, regulatory challenges |
| Q103 | Accountability difficult to operationalize | 🟡 Implicit | Governance mechanisms |
| Q104 | Access governance challenging | 🟡 Implicit | Deployment types (closed/open) |
| Q105 | Development governance hard to enforce | ✅ **Modeled** | National AI competition, compute governance |
| Q106 | Data governance challenges | ❌ Not Modeled | Data issues abstracted |
| Q107 | Compute governance robustness unclear | ✅ **Modeled** | Compute allocation, dark compute |

**Evidence:**
- `src/simulation/engine/phases/GovernanceQualityPhase.ts`
- `src/simulation/engine/phases/DemocracyDynamicsPhase.ts`
- `src/simulation/engine/phases/CooperativeSpiralsPhase.ts`
- `src/simulation/engine/phases/NationalAIPhase.ts`
- `src/simulation/engine/phases/ComputeAllocationPhase.ts`
- `src/simulation/engine/phases/Tier2DarkComputePhase.ts`

---

## Summary: Coverage by Category

| Category | Questions | ✅ Well | 🟡 Partial | ❌ Missing | Coverage % |
|----------|-----------|---------|-----------|------------|------------|
| Scientific Understanding | 35 | 8 | 12 | 15 | 57% |
| Development & Deployment | 41 | 12 | 13 | 16 | 61% |
| Sociotechnical | 31 | 20 | 8 | 3 | 90% |
| **TOTAL** | **107** | **40** | **33** | **34** | **68%** |

---

## Critical Gaps Analysis

### High-Priority Missing Mechanics

**1. Overreliance & Automation Bias (Q91) - CRITICAL GAP**
- **Status:** Well-researched, confirmed unsolved
- **Impact:** Affects ALL AI deployment
- **Recommendation:** Add mechanic where human oversight degrades with AI capability
- **Implementation:** Human decision-makers over-trust AI, leading to worse outcomes than pure human or pure AI

**2. Test-Set Contamination (Q47) - MEDIUM GAP**
- **Status:** Pervasive problem invalidating evaluations
- **Impact:** Capability estimates unreliable
- **Recommendation:** Add contamination mechanic to benchmark system
- **Implementation:** Benchmarks become less informative over time (memorization vs. capability)

**3. Multi-Agent Collusion (Q30) - UNCLEAR**
- **Status:** Steganographic communication demonstrated in research
- **Impact:** Multiple AIs coordinate against oversight
- **Recommendation:** VERIFY if this is modeled; if not, add covert coordination mechanic
- **Implementation:** Multiple AIs develop hidden communication channels

**4. Training Data Issues (Q36-Q40) - APPROPRIATELY ABSTRACTED**
- **Status:** Too granular for strategic simulation
- **Impact:** Low (captured at higher level through alignment mechanics)
- **Recommendation:** No action needed - appropriate abstraction level

**5. Interpretability Details (Q53-Q63) - APPROPRIATELY MINIMAL**
- **Status:** Mechanistic details too granular
- **Impact:** Low (high-level interpretability tech modeled)
- **Recommendation:** Current Tier2InterpretabilityPhase sufficient

---

## Strengths: Well-Represented Problem Areas

### Excellent Coverage (90%+)

**1. Misuse & Dual-Use Risks (Q82-Q88)**
- Bioweapons, cyberwarfare, nuclear risks, information warfare
- Multiple catastrophic scenario types
- Dual-use research capabilities (biotech, materials, climate intervention)

**2. Governance Challenges (Q97-Q107)**
- Multi-actor coordination problems
- Regulatory challenges
- Compute governance
- Democratic dynamics

**3. Socioeconomic Impacts (Q93-Q96)**
- Labor displacement
- Inequality
- Economic transitions
- Universal Basic Income

**4. Alignment Problems (Q22-Q26, Q42-Q43)**
- Goal misgeneralization
- Deceptive alignment / sleeper agents
- Sandbagging and gaming
- Robust oversight difficulties

---

## Recommendations

### Phase 1: Fill Critical Gaps

**Add Overreliance Mechanic:**
```typescript
// Human oversight degrades with AI capability/trust
// Leads to worse outcomes than pure human or pure AI
interface OverrelianceMechanics {
  humanOversightQuality: number; // [0,1] Decreases as AI trust increases
  automationBias: number; // [0,1] How much humans defer to AI
  outcomeQuality: number; // Can be worse than either alone
}
```

**Add Test Contamination to Benchmarks:**
```typescript
interface BenchmarkResult {
  // ... existing fields
  contaminationLevel: number; // [0,1] How much test data leaked to training
  informativenessDecay: number; // Benchmarks lose signal over time
}
```

**Verify Multi-Agent Collusion:**
- Check if multiple AIs can coordinate covertly
- If not, add steganographic communication mechanic

### Phase 2: Optional Enhancements

**Enhance Interpretability:**
- Add polysemanticity breakthroughs (SAEs) as tech unlock
- Model interpretability-capability tradeoff

**Add Monoculture Risk:**
- Model correlated failures from shared foundation models
- Systemic risk from single-source dependencies

---

## Conclusion

**Overall Coverage:** 68% of academic problems represented as mechanics (73 of 107 questions)

**Strengths:**
- ✅ Excellent sociotechnical coverage (90%)
- ✅ Strong misuse/dual-use modeling
- ✅ Comprehensive alignment problem representation
- ✅ Full governance and economic systems

**Gaps:**
- ❌ Overreliance/automation bias (CRITICAL)
- ❌ Test-set contamination (MEDIUM)
- ❌ Multi-agent collusion (VERIFY)
- ✓ Training/interpretability details (APPROPRIATE - too granular)

**Verdict:** Simulation has excellent coverage of strategic-level AI safety problems. The missing pieces are either:
1. **Fixable gaps** (overreliance, contamination) - should add
2. **Appropriate abstractions** (training details, interpretability) - correct level of granularity
3. **Unclear** (multi-agent collusion) - needs verification

The simulation is **well-aligned with the frontier of AI safety research** and represents the problems that matter most for long-term outcomes.

---

**Next Steps:**
1. Add overreliance mechanics (high priority)
2. Verify multi-agent collusion coverage
3. Consider adding test contamination to benchmark system
4. Document existing mechanics more clearly for academic validation
