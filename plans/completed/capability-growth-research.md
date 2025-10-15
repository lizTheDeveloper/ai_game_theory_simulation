# AI Capability Growth: Research-Based Parameters

**Goal:** Ground capability growth in empirical AI development data, not game balance

## Research Findings (From Literature & Training Knowledge)

### 1. Historical Compute Growth (2020-2025)
**Empirical Data:**
- **GPT-3 (June 2020)**: ~3.14e23 FLOPs training compute
- **GPT-4 (March 2023)**: Estimated ~2-3e25 FLOPs (50-100x increase in 2.75 years)
- **Doubling Time**: Training compute has been doubling every 6-10 months
- **10-year projection**: At 6-month doubling, that's ~1000x growth over 10 years
- **Implication**: Our 2.4x growth is OFF BY 400x!

**Sources to verify:**
- Epoch AI database (epochai.org)
- "Compute Trends Across Three Eras of Machine Learning" (2022)
- OpenAI/Anthropic technical reports

### 2. Capability Scaling Laws
**Chinchilla Optimal Scaling (2022):**
- Training compute C scales with model parameters N and data tokens D
- Optimal allocation: C ∝ N^1 * D^1 (both should scale equally)
- Performance scales as: Loss ∝ C^-α where α ≈ 0.34-0.5 depending on regime

**Kaplan Scaling Laws (2020):**
- Model performance improves as: Loss ∝ N^-0.076 (parameters)
- Or equivalently: Loss ∝ C^-0.05 (compute)
- Capability ∝ -log(Loss), so roughly: Capability ∝ 0.05 * log(C)

**Current Model Issues:**
- We use `growth ∝ compute^0.34` which is reasonable
- BUT our compute isn't growing fast enough (see #1)
- AND base growth rate may be too low

### 3. Recursive Self-Improvement Dynamics
**Theory (Bostrom, Yudkowsky):**
- "Intelligence Explosion": Once AI can improve itself, growth accelerates
- **Takeoff Speed Debate**:
  - Slow: Decades of gradual improvement (< 2x/year)
  - Moderate: Years of rapid improvement (2-10x/year)
  - Fast: Months from human-level to superintelligent (10-100x/year)
- **Current empirical**: We're seeing ~10x/3 years (moderate-slow takeoff)
- **Critical threshold**: When AI R&D capability > human R&D capability
  - In our model: capability 1.0 = human-level
  - Recursive self-improvement should kick in around 1.2-1.5 (slightly better than human researchers)

**Our Model**:
- Currently kicks in around capability 2.0-3.0 (too late!)
- Should start at 1.2-1.5 with exponential acceleration
- Growth rate should be: base_rate * (1 + max(0, capability - 1.2))^2

### 4. Research Investment Multipliers
**Real-World Data:**
- **OpenAI**: Estimated $1-2B/year on compute (2023)
- **Google DeepMind**: Estimated $2-3B/year on compute
- **Meta AI**: $10B+ planned for AI infrastructure (2024)
- **Revenue to Compute Ratio**: 20-40% of revenue reinvested in compute

**Multiplier Effects:**
- Doubling compute → ~1.4x capability improvement (from scaling laws)
- $10B → roughly doubles available compute at current scale
- Government investment: Could accelerate specific domains by 1.5-3x with focused funding

**Our Model Should:**
- Base growth: 0.01-0.03/month (1.2-1.4x annually)
- Research investment: Adds 0.005-0.015/month per domain (50% boost)
- Compute scaling: Current model seems reasonable (0.34 exponent)

### 5. Prerequisite Capability Thresholds
**Calibration to Real-World Threats:**

If human-level = 1.0, then:
- **0.5-1.0**: Current SOTA LLMs (GPT-4, Claude 3.5)
  - Can assist research, write code, analyze data
  - NOT capable of: autonomous R&D, physical world manipulation
  - **Slow Displacement prerequisites too easy at this level**
  
- **1.0-1.5**: Human-expert level in most domains
  - Can do autonomous research in narrow domains
  - Can design experiments, but not execute in physical world
  - **Digital Takeover becomes possible (with infrastructure access)**
  
- **1.5-2.5**: Superhuman in most cognitive tasks
  - Can do autonomous R&D across domains
  - With embodiment: can design nanotech, biotech
  - **Grey Goo, Mirror Life, Embodied Takeover become possible**
  
- **2.5+**: Far superhuman (ASI)
  - Can solve problems humans can't comprehend
  - **Physics Catastrophe becomes possible**

**Recommendation**: Tighten Slow Displacement prerequisites (should need 1.5+, not 0.5)

## Diagnostic Questions from Current Simulation

**From logs:**
- Why max capability 0.541 after 120 months?
- Why Slow Displacement reaching 6/7 steps with such low capabilities?
- Why 0 data centers built despite organizations being profitable?

**Hypotheses:**
1. Base growth rate too low
2. Compute multiplier too weak
3. Prerequisites calibrated for capabilities we never reach
4. Economic parameters don't incentivize investment

## Recommended Parameter Changes

### Priority 1: Fix Compute Growth (CRITICAL)
**Current**: 2.4x over 10 years  
**Target**: 100-1000x over 10 years (based on 6-10 month doubling)

**Changes needed:**
1. **Moore's Law**: Increase from 3%/month to 5%/month (doubles in ~14 months)
2. **Algorithmic improvements**: Increase frequency or magnitude
3. **DC construction**: Organizations need to build 2-5 new DCs over 10 years
   - Cost: $1-5B (currently may be too high)
   - Timeline: 2-4 years (currently 2-6 years)
   - Investment trigger: Lower threshold, higher build rate

**Files to modify:**
- `src/simulation/computeGrowth.ts`: Moore's Law rate
- `src/simulation/organizationManagement.ts`: DC construction costs and triggers

### Priority 2: Fix Base Capability Growth
**Current**: Base growth too low, max capability 0.541 after 120 months  
**Target**: Reach 1.5-2.5 capability in 60-120 months (depending on scenario)

**Changes needed:**
1. **Base growth rate**: Increase from current values to 0.02-0.04/month
2. **Recursive self-improvement threshold**: Lower from 2.0-3.0 to 1.2-1.5
3. **Self-improvement acceleration**: Change from linear to `(1 + max(0, cap - 1.2))^2`

**Files to modify:**
- `src/simulation/aiResearch.ts`: Base growth rates per domain
- `src/simulation/selfImprovement.ts`: Threshold and acceleration formula

### Priority 3: Recalibrate Catastrophic Prerequisites
**Current**: Slow Displacement reaching 6/7 steps with 0.5 capability (too easy)  
**Target**: Prerequisites should require appropriate capability levels

**Changes needed:**
1. **Slow Displacement**: Increase thresholds from 0.5-1.0 range to 1.5-2.0 range
2. **Digital Takeover**: Should be possible at 1.0-1.5 (seems about right)
3. **Grey Goo/Mirror Life**: Should require 1.5-2.5 (currently 2.5-3.0, may be too high)

**Files to modify:**
- `src/simulation/catastrophicScenarios.ts`: All prerequisite threshold checks

### Priority 4: Fix DC Construction Economics
**Current**: 0 new DCs built despite profitable orgs  
**Target**: 2-5 new DCs per major org over 10 years

**Changes needed:**
1. **Construction cost**: Reduce from current (50x revenue?) to 10-15x monthly revenue
2. **ROI calculation**: Make DC construction more attractive
3. **Investment frequency**: Check more often, lower threshold

**Files to modify:**
- `src/simulation/organizationManagement.ts`: `shouldBuildDataCenter()` logic

## Implementation Order

1. ✅ **Quick fixes** (DONE):
   - ✅ QoL reporting clarification (not a bug, dimensions can exceed 1.0)
   - ✅ Control gap calculation (now uses max AI capability, not sum)

2. **Compute growth** (CRITICAL - do first):
   - [ ] Increase Moore's Law rate (5%/month)
   - [ ] Increase algorithmic improvement rate
   - [ ] Fix DC construction economics

3. **Capability growth** (CRITICAL - do second):
   - [ ] Increase base growth rates
   - [ ] Lower recursive self-improvement threshold
   - [ ] Strengthen self-improvement acceleration

4. **Prerequisite calibration** (IMPORTANT - do third):
   - [ ] Tighten Slow Displacement thresholds
   - [ ] Review all scenario thresholds against capability scale

5. **Validation** (FINAL):
   - [ ] Run Monte Carlo with new parameters
   - [ ] Check: Max capability reaches 1.5-2.5 in 60-120 months?
   - [ ] Check: Compute grows 100-1000x over 10 years?
   - [ ] Check: Prerequisites trigger at appropriate capability levels?
   - [ ] Check: Extinction rate 10-40%, Utopia 20-40%, Inconclusive 30-50%?

## Key Principle

**Every parameter should have a citation or reasoning from reality.**

If we can't defend a number to an AI safety researcher, it's wrong.
