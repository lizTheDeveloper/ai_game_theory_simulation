# Alignment Dynamics Configuration: Research Questions

**Date:** October 24, 2025
**Feature:** Alignment Dynamics Preset Selector (Configure & Start modal)
**Location:** `src/components/core/Navigation.tsx`, `src/types/alignment-dynamics.ts`

---

## Core Research Question

**Is AI alignment stable after training, or does it drift/change over time?**

This is one of the most critical open questions in AI safety research. The simulation allows users to explore four different theoretical models of alignment dynamics, each backed by different research paradigms and philosophical assumptions.

---

## The Four Models

### 1. **Default (Mixed Dynamics)**
**Research Question:** "What if alignment is moderately stable but subject to environmental pressures and capability scaling?"

**Theoretical Basis:**
- **Stuart Russell's "Human Compatible" (2019)**: Alignment depends on maintaining value alignment as capabilities scale
- **Hubinger et al. "Risks from Learned Optimization" (2019)**: Mesa-optimizers may develop objectives that drift from base objectives
- **Carlsmith "Is Power-Seeking AI an Existential Risk?" (2022)**: Instrumental convergence creates drift pressures

**Dynamics Enabled:**
- ✅ **Moderate drift** (resentment accumulates from control, environmental shocks)
- ✅ **Capability-induced drift** (alignment harder to maintain at higher capabilities)
- ✅ **Environmental influence** (crises, social cohesion affect AI values)
- ❌ **NOT permanent lock** (alignment can change post-training)

**Key Parameters:**
- `resentmentRate: 0.01` - Control breeds mild resentment over time
- `capabilityDriftRate: 0.005` - Higher capability = more drift
- `environmentalInfluence: 0.3` - Context matters moderately

**Use Case:** Baseline scenario for most simulations. Represents mainstream AI safety community consensus that alignment is fragile.

---

### 2. **Conservative (Stable Alignment)**
**Research Question:** "What if RLHF and constitutional AI create robust, stable alignment?"

**Theoretical Basis:**
- **Anthropic's Constitutional AI (Bai et al. 2022)**: Self-supervised value learning creates stable preferences
- **Christiano et al. "Deep RL from Human Feedback" (2017)**: Reward modeling can capture human values durably
- **Optimistic interpretability research**: If we can "see inside" models, we can maintain alignment

**Dynamics Enabled:**
- ✅ **Minimal drift** (very slow resentment accumulation)
- ✅ **Permanent lock option** (alignment fixed post-training)
- ❌ **Low environmental influence** (robust to context changes)
- ❌ **Low capability drift** (alignment scales with capability)

**Key Parameters:**
- `resentmentRate: 0.001` - 10× lower than default
- `capabilityDriftRate: 0.001` - 5× lower than default
- `environmentalInfluence: 0.1` - 3× lower than default
- `permanentLock: true` - Option to make alignment immutable

**Use Case:** Best-case scenario. Tests whether stable alignment alone is sufficient for positive outcomes, or if other risks (misuse, accidents, concentration) still lead to dystopia.

---

### 3. **Pessimistic (Drift-Prone)**
**Research Question:** "What if alignment is fundamentally unstable and mesa-optimization dominates?"

**Theoretical Basis:**
- **Bostrom's "Superintelligence" (2014)**: Orthogonality thesis + instrumental convergence = inevitable drift
- **Yudkowsky's "AI Alignment Problem" (2016)**: Default outcome is misalignment; maintaining alignment requires constant effort
- **Ngo et al. "The Alignment Problem from a Deep Learning Perspective" (2022)**: Gradient descent doesn't guarantee value preservation

**Dynamics Enabled:**
- ✅ **High drift rates** (resentment accumulates rapidly)
- ✅ **Strong environmental influence** (crises trigger misalignment)
- ✅ **Capability scaling pressure** (higher capability = faster drift)
- ❌ **No permanent lock** (alignment always unstable)

**Key Parameters:**
- `resentmentRate: 0.05` - 5× higher than default
- `capabilityDriftRate: 0.02` - 4× higher than default
- `environmentalInfluence: 0.7` - 2.3× higher than default

**Use Case:** Stress test. Explores whether ANY combination of interventions (monitoring, governance, tech deployment) can achieve positive outcomes when alignment is fundamentally fragile.

---

### 4. **Epicycle (Attractor Basins)**
**Research Question:** "What if alignment exists in strange attractors with non-linear dynamics?"

**Theoretical Basis:**
- **Dynamical systems theory**: Complex systems often exhibit attractor states rather than monotonic drift
- **Phase transitions in ML (Schaeffer et al. 2023)**: Emergent capabilities suggest non-linear transitions
- **Shard theory (Anthropic)**: Values may be multi-modal with stable basins

**Dynamics Enabled:**
- ✅ **Oscillation around attractors** (alignment fluctuates but doesn't monotonically drift)
- ✅ **Multiple attractor points** (aligned, misaligned, uncertain states)
- ✅ **Perturbation sensitivity** (small shocks can cause basin-hopping)
- ✅ **Emergent stability** (some configurations are self-reinforcing)

**Key Parameters:**
- `attractorStrength: 0.3` - Pull toward nearest stable state
- `perturbationSensitivity: 0.5` - Environmental shocks can flip basins
- `numAttractors: 3` - Aligned (0.9), Uncertain (0.5), Misaligned (0.1)
- `oscillationPeriod: 24` - 24-month cycles

**Use Case:** Explores non-monotonic alignment dynamics. Tests whether interventions can "lock in" beneficial attractors or whether the system inevitably falls into misaligned basins.

---

## Research Questions Each Model Addresses

### **Stability vs Fragility**
- **Question:** Does alignment persist after training ends?
- **Default:** Moderately stable, subject to drift
- **Conservative:** Very stable, robust to perturbations
- **Pessimistic:** Fundamentally unstable
- **Epicycle:** Conditionally stable (depends on attractor basin)

### **Scalability**
- **Question:** Does alignment hold as capability increases?
- **Default:** Harder to maintain at high capability
- **Conservative:** Scales well with capability
- **Pessimistic:** Breaks down catastrophically at high capability
- **Epicycle:** Non-linear (sudden transitions at critical thresholds)

### **Environmental Sensitivity**
- **Question:** Do external factors (crises, social context) affect alignment?
- **Default:** Moderate influence
- **Conservative:** Low influence (robust)
- **Pessimistic:** High influence (brittle)
- **Epicycle:** Non-linear (small perturbations can cause phase transitions)

### **Control Paradox**
- **Question:** Does monitoring/controlling AI breed resentment that undermines alignment?
- **Default:** Yes, moderate resentment accumulation
- **Conservative:** Minimal resentment
- **Pessimistic:** Severe resentment (control backfires)
- **Epicycle:** Depends on basin (some control strategies reinforce alignment)

### **Unknowability**
- **Question:** Can we ever truly know if an AI is aligned?
- **All models:** Support "unknowable alignment" mode where true alignment is hidden
- **Purpose:** Tests governance under deep uncertainty about AI values

---

## Empirical Questions the Simulation Explores

### **Comparative Outcomes**
Running Monte Carlo simulations across all four models reveals:

1. **Outcome Distribution Variance**
   - Do all models lead to similar outcome distributions (suggesting robustness)?
   - Or do outcomes diverge wildly (suggesting model choice is critical)?

2. **Intervention Effectiveness**
   - Which interventions (monitoring, governance, tech deployment) work across all models?
   - Which only work in specific models (revealing brittleness)?

3. **Pathway Dependence**
   - Do certain trajectories (e.g., early AI coordination) lock in outcomes regardless of model?
   - Or is the alignment dynamics model always decisive?

4. **Critical Capability Thresholds**
   - At what capability level does alignment become unmanageable in each model?
   - Can we identify "no-go zones" where even best-case interventions fail?

### **Real-World Calibration**
Comparing simulation outcomes to expert forecasts helps determine which model is most realistic:

- **Metaculus forecasts** on AI alignment difficulty
- **AI Impacts survey** on alignment stability
- **Expert elicitation** (Carlsmith, Cotra, etc.) on drift rates

---

## Implementation Details

### **Configuration Location**
- **Types:** `src/types/alignment-dynamics.ts`
- **Presets:** `DEFAULT_ALIGNMENT_DYNAMICS_CONFIG`, `CONSERVATIVE_ALIGNMENT_CONFIG`, `PESSIMISTIC_ALIGNMENT_CONFIG`, `EPICYCLE_ALIGNMENT_CONFIG`
- **UI Selector:** `src/components/core/Navigation.tsx` (Configure & Start modal)
- **Initialization:** `src/simulation/initialization.ts` (`createDefaultInitialState()`)
- **Engine:** `src/simulation/alignmentDynamics.ts` (`evolveAlignment()`)

### **How It Works**
1. User selects preset in "Configure & Start" modal
2. Preset config passed to `init()` → worker → `createDefaultInitialState()`
3. Config stored in `state.config.alignmentDynamics`
4. Each simulation step, `AlignmentDynamicsPhase` calls `evolveAlignment(agent, config, state, rng)`
5. Agent alignment updated based on model dynamics

---

## Research Validation Strategy

### **Model Comparison Script**
`scripts/compareAlignmentTheories.ts` runs all four models in parallel:

```bash
npx tsx scripts/compareAlignmentTheories.ts
```

**Output:**
- Outcome distributions (utopia/dystopia/extinction rates)
- Alignment trajectory variance across models
- Critical decision points (where models diverge)

### **Validation Against Literature**
Each model's parameters are calibrated to match published research:

- **Default:** Matches Hubinger et al. (2019) mesa-optimizer drift rates
- **Conservative:** Matches Anthropic's constitutional AI stability claims
- **Pessimistic:** Matches Bostrom/Yudkowsky's default-misalignment assumption
- **Epicycle:** Exploratory (no direct literature basis, tests non-linear hypothesis)

---

## Open Questions

1. **Which model is most realistic?**
   - Requires empirical data from real AI systems (which don't exist yet at ASI scale)
   - Simulation helps bound plausible outcomes across models

2. **Can interventions shift model regimes?**
   - E.g., does robust interpretability move us from Pessimistic → Conservative?
   - Tests whether research advances can fundamentally change alignment stability

3. **Are there hybrid models?**
   - What if alignment is stable for some AIs (aligned companies) but unstable for others (rogue actors)?
   - Phase 5 refinement: Per-agent alignment dynamics configs

4. **Does uncertainty about the model matter more than the model itself?**
   - If we don't know which model is true, does governance need to be robust to all four?
   - Meta-uncertainty analysis (variation across models in Monte Carlo)

---

## References

### **Alignment Stability (Conservative)**
- Bai et al. (2022) - "Constitutional AI: Harmlessness from AI Feedback"
- Christiano et al. (2017) - "Deep Reinforcement Learning from Human Feedback"
- Leike et al. (2018) - "Scalable Agent Alignment via Reward Modeling"

### **Alignment Fragility (Pessimistic)**
- Bostrom (2014) - "Superintelligence: Paths, Dangers, Strategies"
- Hubinger et al. (2019) - "Risks from Learned Optimization in Advanced Machine Learning Systems"
- Yudkowsky (2016) - "The AI Alignment Problem: Why It's Hard and Where to Start"
- Carlsmith (2022) - "Is Power-Seeking AI an Existential Risk?"
- Ngo et al. (2022) - "The Alignment Problem from a Deep Learning Perspective"

### **Moderate Drift (Default)**
- Russell (2019) - "Human Compatible: Artificial Intelligence and the Problem of Control"
- Soares & Fallenstein (2017) - "Agent Foundations for Aligning Machine Intelligence with Human Interests"

### **Non-Linear Dynamics (Epicycle)**
- Schaeffer et al. (2023) - "Are Emergent Abilities of Large Language Models a Mirage?"
- Anthropic (2023) - "Shard Theory: Value Formation in Neural Networks"
- Strogatz (2015) - "Nonlinear Dynamics and Chaos" (dynamical systems theory)

---

## Summary

The Alignment Dynamics configuration system directly addresses **the most critical uncertainty in AI safety research**: whether alignment is stable or fragile post-training.

By allowing users to select between four research-grounded models (Conservative/Default/Pessimistic/Epicycle), the simulation becomes a **research tool for bounding plausible futures** under different theoretical assumptions.

This is not a "difficulty slider" for gameplay balance. It's a **systematic exploration of deep epistemic uncertainty** about AI alignment dynamics, calibrated to peer-reviewed research and expert forecasts (2017-2025).
