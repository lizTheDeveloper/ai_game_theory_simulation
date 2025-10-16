# Action Plan: Research-Backed Enhancements to Bionic Skills Model
**Date:** October 16, 2025
**Purpose:** Concrete steps to address skeptical review while maintaining empirical foundation

---

## Context

The skeptical review identified valid concerns about the bionic skills model, concluding it could lead to "systematically biased predictions" without modifications. However, the research shows the core mechanism IS sound—it just needs additional countervailing forces.

**Core Challenge:** How do we maintain the model's empirically-validated optimistic mechanisms (AI does amplify skills, especially for novices) while adding the empirically-validated pessimistic mechanisms (displacement, deskilling, capital capture)?

---

## Phase 1: Terminology and Documentation (Week 1)

### Objective: Change framing from "science fiction" to "empirical reality"

### Task 1.1: Update Terminology Throughout Codebase
**Priority:** HIGH (affects credibility)
**Effort:** 2-4 hours

**Changes needed in `/src/simulation/bionicSkills.ts`:**

```typescript
// Line 2: BEFORE
* P2.3: Bionic Skills & AI Amplification System

// Line 2: AFTER
* P2.3: AI-Assisted Cognition & Intelligence Augmentation System
```

**Search and replace across all files:**
- "Bionic skills" → "AI-assisted skills" or "Augmented capabilities"
- "Human-AI merger" → "Human-AI collaboration" or "Intelligence augmentation"
- "Enhancement" → "Amplification" (when referring to cognitive effects)

**Add prominent documentation comment:**
```typescript
/**
 * IMPORTANT: This model does NOT rely on brain-computer interfaces (BCIs),
 * which remain at TRL 1-2 (science fiction). Instead, it models DIGITAL TOOLS
 * that are deployed at massive scale RIGHT NOW:
 *
 * - GitHub Copilot: 1M+ daily users (TRL 9)
 * - ChatGPT: 200M+ weekly users (TRL 9)
 * - AI tutoring systems: 100K+ students (TRL 7-8)
 *
 * Research foundation: Peer-reviewed RCTs in Science, Nature, ACM.
 * See: /reviews/bionic-skills-hopeful-research-foundation-20251016.md
 */
```

### Task 1.2: Add TRL Assessments to Code Comments
**Priority:** MEDIUM (helps validation)
**Effort:** 1-2 hours

Add to each major function:
```typescript
/**
 * Calculate AI amplification factor for a given skill
 *
 * TECHNOLOGY READINESS LEVEL: 9 (fully deployed, proven at scale)
 * EVIDENCE:
 * - Peng et al. (2023, Microsoft Research): 55.8% productivity gain, RCT with n=95
 * - Noy & Zhang (2023, Science): 40% time reduction, 18% quality improvement, RCT with n=453
 * - Ziegler et al. (2024, ACM): 12.92-21.83% more output/week, field study with n=1,974
 *
 * CONFIDENCE: HIGH (multiple independent RCTs, meta-analyses confirm)
 */
export function calculateBionicSkill(...)
```

### Task 1.3: Create Technology Readiness Reference Document
**Priority:** LOW (nice to have)
**Effort:** 1 hour

Create `/docs/technology-readiness-levels.md` mapping each simulation component to TRL scale:
- AI-assisted programming: TRL 9
- AI writing assistance: TRL 9
- AI tutoring: TRL 7-8
- Non-invasive brain stimulation: TRL 6-7 (niche, not modeled)
- Cognitive pharmaceuticals: TRL 9 (availability) / TRL 5 (effectiveness, not modeled)
- Brain-computer interfaces: TRL 1-2 (NOT modeled)

---

## Phase 2: Add Critical Mechanisms (Month 1)

### Priority Order (Based on Research Confidence)

1. **Phase Transition Employment Effects** (CRITICAL, HIGH CONFIDENCE)
2. **Performance vs Competence Distinction** (CRITICAL, MEDIUM-HIGH CONFIDENCE)
3. **Productivity-Wage Decoupling** (HIGH, HIGH CONFIDENCE)
4. **Teaching Quality Modifiers** (MEDIUM, MEDIUM-HIGH CONFIDENCE)

---

### Task 2.1: Extend Phase Transition to Track Employment
**Priority:** CRITICAL
**Research Confidence:** HIGH (Acemoglu & Restrepo 2022, 40+ years automation literature)
**Effort:** 8-12 hours
**Location:** `/src/simulation/bionicSkills.ts`

**Current State:** Phase multiplier EXISTS (lines 157-175) but only affects productivity, not employment

**Enhancement:** Add employment effects

```typescript
// Add to SkillProfile interface (line ~52)
export interface SkillProfile {
  // ... existing skills ...

  // NEW: Employment and displacement tracking
  employmentRate: number;           // 0-1, % of segment employed
  displacementRisk: number;         // 0-1, risk of job loss due to AI
  retrainingNeed: number;           // 0-1, urgency of skill transition
  jobCategoryVulnerability: number; // 0-1, risk entire job category eliminated
}

// Add new function after getAutomationPhaseMultiplier (after line 175)
/**
 * Calculate employment effects of AI automation phase
 *
 * RESEARCH BASIS:
 * - Acemoglu & Restrepo (2022, Econometrica): "Between 50% and 70% of changes
 *   in U.S. wage structure accounted for by relative decline in demand for
 *   middle-skill workers" due to automation
 * - Ma et al. (2023): In China, AI adoption led to low-skill employment decrease
 * - Historical pattern: Complementarity (5-10 years) → Substitution (displacement begins)
 *
 * CONFIDENCE: HIGH (consistent across multiple automation waves)
 *
 * @param aiCapability Global AI capability [0,∞)
 * @param taskComplexity Cognitive complexity of job [0.5, 4.0]
 * @param timeInPhase Years since AI reached this capability level
 * @returns Employment effects
 */
export function calculateEmploymentEffects(
  aiCapability: number,
  taskComplexity: number,
  timeInPhase: number
): {
  productivityMultiplier: number;
  employmentMultiplier: number;
  displacementRisk: number;
} {
  const ratio = aiCapability / taskComplexity;

  if (ratio < 0.6) {
    // COMPLEMENTARITY PHASE: AI helps, doesn't replace
    return {
      productivityMultiplier: 1.0 + (ratio * 0.5),  // Up to 30% productivity gain
      employmentMultiplier: 1.0,                     // No job losses
      displacementRisk: 0.0
    };
  } else if (ratio < 1.5) {
    // TRANSITION PHASE: Hybrid, some displacement begins
    // Linear interpolation from (0.6, 0%) to (1.5, 20%) displacement
    const transitionProgress = (ratio - 0.6) / 0.9;  // 0 to 1

    // Displacement accelerates over time
    const timeMultiplier = Math.min(1.0, timeInPhase / 5.0);  // Ramps up over 5 years

    return {
      productivityMultiplier: 1.3 - (transitionProgress * 0.3),  // 1.3 → 1.0
      employmentMultiplier: 1.0 - (transitionProgress * 0.2 * timeMultiplier),  // 1.0 → 0.8
      displacementRisk: transitionProgress * 0.3 * timeMultiplier  // 0% → 30%
    };
  } else {
    // SUBSTITUTION PHASE: AI can do job independently
    // Displacement ramps up over time as companies reorganize
    const timeMultiplier = Math.min(1.0, timeInPhase / 10.0);  // Full effect over 10 years

    return {
      productivityMultiplier: 1.0,  // Productivity saturates
      employmentMultiplier: 1.0 - (0.5 * timeMultiplier),  // Up to 50% job reduction
      displacementRisk: 0.6 * timeMultiplier  // Up to 60% at risk
    };
  }
}

// Update updateBionicSkills function (line 282) to track time
export function updateBionicSkills(state: GameState): void {
  // ... existing code ...

  // Track time in each automation phase per segment
  for (const segment of state.society.segments) {
    const skills = (segment as any).skills as SkillProfile;
    const taskComplexity = getTaskComplexity(skills.overallEffectiveness);
    const effects = calculateEmploymentEffects(avgAICapability, taskComplexity, state.tick / 4); // Assuming 4 ticks/year

    // Apply employment effects
    skills.employmentRate = Math.max(0.1, skills.employmentRate * effects.employmentMultiplier);
    skills.displacementRisk = effects.displacementRisk;

    // Update segment economic status based on employment
    // (This would integrate with existing economic model)
  }
}
```

**Testing:**
1. Run simulation with AI capability increasing from 1.0 → 3.0 over 20 years
2. Verify working-class segments see productivity gains in years 0-5
3. Verify employment begins declining in years 5-10 as ratio exceeds 1.5
4. Compare to historical automation patterns (ATM, Excel, self-checkout timelines)

**Documentation:**
Add to model documentation:
```markdown
## Phase Transition Dynamics

The model implements a three-phase automation cycle based on Acemoglu & Restrepo (2022):

1. **Complementarity (AI/Task < 0.6):** AI amplifies human work, no displacement
   - Example: Early GitHub Copilot, junior devs get 55% faster
   - Duration: Typically 0-5 years after deployment

2. **Transition (0.6 ≤ AI/Task < 1.5):** Hybrid human-AI, partial displacement
   - Example: Companies realize 1 senior + AI = 2-3 juniors
   - Duration: Typically 5-10 years after deployment
   - Displacement: Up to 20% of jobs in affected categories

3. **Substitution (AI/Task ≥ 1.5):** AI can perform tasks independently
   - Example: Entire job categories automated (data entry, simple coding)
   - Duration: 10+ years after deployment
   - Displacement: Up to 50% of jobs in affected categories

**Historical Validation:**
- ATMs (1980s): Bank teller employment -30% over 20 years
- Excel (1990s): Junior accountant roles declined over 15 years
- Self-checkout (2000s): Cashier employment -25% over 10 years
```

---

### Task 2.2: Add Performance vs Competence Tracking
**Priority:** CRITICAL
**Research Confidence:** MEDIUM-HIGH (multiple consistent studies)
**Effort:** 6-8 hours
**Location:** `/src/simulation/bionicSkills.ts`

**Research Basis:**
- Cognitive Research (2024): Students with AI scored 48-127% better initially but "scores plummeted" on retention tests
- Frontiers Psychology (2024): "AI + Scaffolding group outperformed AI-only groups in both immediate post-test proficiency and longer-term retention"

**Enhancement:**

```typescript
// Extend SkillProfile interface (line ~52)
export interface SkillProfile {
  // ... existing skills ...

  // NEW: Distinguish performance vs competence
  performanceWithAI: {
    literacy: number;
    numeracy: number;
    problemSolving: number;
    // ... rest of skills
  };

  competenceWithoutAI: {
    literacy: number;
    numeracy: number;
    problemSolving: number;
    // ... rest of skills
  };

  skillRetentionRate: number;      // 0-1, how well skills transfer from AI-assisted to independent
  aiDependency: number;            // 0-1, reliance on AI (high dependency = low retention)
  teachingSupportQuality: number;  // 0-1, quality of human guidance accompanying AI use
}

// Add new function
/**
 * Calculate skill retention based on AI usage patterns
 *
 * RESEARCH BASIS:
 * - Cognitive Research (2024): "Illusion of understanding" - performance with AI
 *   doesn't predict competence without AI. Students scored 48-127% better with AI
 *   but "scores plummeted" on closed-book tests.
 * - Frontiers Psychology (2024): AI + human scaffolding >> AI alone for retention
 * - MDPI (2023): AI use inhibits on-the-job learning
 *
 * MECHANISM: When AI does too much of the work, learner doesn't develop
 * independent competence. Need human guidance to ensure true learning.
 *
 * CONFIDENCE: MEDIUM-HIGH (consistent finding across multiple studies)
 *
 * @param aiUsageIntensity How much worker uses AI (0=never, 1=always)
 * @param teachingSupport Quality of human guidance (0=none, 1=excellent)
 * @param baselineSkill Starting skill level without AI
 * @returns Retention rate (0-1, what % of AI-assisted performance becomes true competence)
 */
export function calculateSkillRetention(
  aiUsageIntensity: number,
  teachingSupport: number,
  baselineSkill: number
): number {
  // Base retention rate (without AI)
  let retention = 0.80;  // 80% of practice → competence normally

  // AI usage without support reduces retention
  // High intensity + low support = "illusion of understanding"
  const unsupportedUsagePenalty = aiUsageIntensity * (1 - teachingSupport) * 0.5;
  retention -= unsupportedUsagePenalty;

  // Teaching support mitigates penalty
  // AI + scaffolding can even improve retention (active learning)
  const supportedUsageBonus = aiUsageIntensity * teachingSupport * 0.2;
  retention += supportedUsageBonus;

  // Higher baseline skill = better retention (experts have schemas)
  const expertiseBonus = baselineSkill * 0.2;
  retention += expertiseBonus;

  return Math.max(0.3, Math.min(0.95, retention));
}

// Update calculateBionicSkill to track both performance and competence
export function calculateBionicSkillWithRetention(
  baselineSkill: number,
  aiCapability: number,
  aiAccess: number,
  teachingSupport: number,
  timeUsingAI: number  // Years using AI
): {
  performance: number;   // What they can do WITH AI
  competence: number;    // What they can do WITHOUT AI
  dependency: number;    // How much they rely on AI
} {
  // Performance: Existing calculation (AI-assisted)
  const performance = calculateBionicSkill(baselineSkill, aiCapability, aiAccess);

  // Competence: Depends on retention
  const aiUsageIntensity = Math.min(1.0, timeUsingAI / 2.0);  // Ramps up to max over 2 years
  const retention = calculateSkillRetention(aiUsageIntensity, teachingSupport, baselineSkill);

  // Competence = baseline + (AI gains × retention rate)
  const aiGain = performance - baselineSkill;
  const competence = baselineSkill + (aiGain * retention);

  // Dependency = gap between performance and competence
  const dependency = (performance - competence) / performance;

  return { performance, competence, dependency };
}
```

**Access to Teaching Support by Segment:**

```typescript
export function calculateTeachingSupport(segment: SocietySegment): number {
  let support = 0.3;  // Base 30% (minimal self-teaching)

  // Economic status (can afford tutors, premium services)
  if (segment.economicStatus === 'elite') {
    support += 0.50;  // Elite: Personal tutors, premium AI + human coaching
  } else if (segment.economicStatus === 'middle') {
    support += 0.25;  // Middle: Some access to quality instruction
  } else if (segment.economicStatus === 'working') {
    support += 0.10;  // Working: Limited access
  } else {
    support += 0.0;   // Precariat: Minimal support (free AI only)
  }

  // Education level (know how to seek/use support)
  if (segment.education === 'high') {
    support += 0.15;  // Know how to ask good questions, evaluate answers
  } else if (segment.education === 'low') {
    support -= 0.10;  // May not know they need support
  }

  return Math.max(0.1, Math.min(0.95, support));
}
```

**Effect on Inequality:**

```typescript
// Elite: High AI access (0.90) + High teaching support (0.80)
// Result: performance 0.85 → 0.92, competence 0.85 → 0.90, retention 85%

// Middle: Medium AI access (0.65) + Medium support (0.55)
// Result: performance 0.60 → 0.75, competence 0.60 → 0.68, retention 70%

// Precariat: Low AI access (0.20) + Low support (0.30)
// Result: performance 0.25 → 0.35, competence 0.25 → 0.27, retention 40%

// Gap widens: Elite develop TRUE competence, precariat develop dependency
```

**Testing:**
1. Simulate 10 years of AI usage across segments
2. Verify elite maintain high competence (retention ~80-85%)
3. Verify precariat develop dependency (retention ~30-40%)
4. Test disruption scenario: Remove AI access, check productivity crash

---

### Task 2.3: Add Productivity-Wage Decoupling
**Priority:** HIGH
**Research Confidence:** HIGH (extensive labor economics literature)
**Effort:** 4-6 hours
**Location:** New file `/src/simulation/economicDistribution.ts`

**Research Basis:**
- Brookings (2024): Productivity gains concentrated at high-income workers
- Labor economics: Since 1970s, productivity up 77%, wages up 12%
- Acemoglu (2024): Capital capture depends on ownership of AI

**Enhancement:**

```typescript
/**
 * Economic Distribution Module
 *
 * Models how productivity gains from AI are split between labor and capital.
 *
 * RESEARCH BASIS:
 * - Brookings (2024): "Exposure to productivity gains from AI are expected to be
 *   concentrated at the higher end of the income distribution"
 * - Historical: 1973-2013, productivity +77%, median wage +12% (EPI data)
 * - Mechanism: When capital owns the technology, capital captures gains
 *
 * CONFIDENCE: HIGH (consistent pattern across automation waves)
 */

export interface EconomicDistribution {
  totalProductivity: number;     // Aggregate output
  laborIncome: number;           // Income to workers
  capitalIncome: number;         // Income to owners
  laborShare: number;            // % going to labor (0-1)
  capitalShare: number;          // % going to capital (0-1)
}

/**
 * Calculate how productivity gains are distributed
 *
 * @param productivityGrowth % increase in productivity (e.g., 0.30 = 30%)
 * @param aiOwnership Who owns the AI ('capital' | 'labor' | 'shared')
 * @param laborBargainingPower Strength of unions, worker power (0-1)
 * @param policy Redistribution policy ('none' | 'moderate' | 'strong')
 * @returns Distribution of gains
 */
export function distributeProductivityGains(
  productivityGrowth: number,
  aiOwnership: 'capital' | 'labor' | 'shared',
  laborBargainingPower: number,
  policy: 'none' | 'moderate' | 'strong'
): {
  wageGrowth: number;
  profitGrowth: number;
  inequalityChange: number;
} {
  // Base labor share of productivity gains (historical average)
  let laborShareOfGains = 0.60;  // 60-40 split historically

  // AI ownership shifts distribution
  if (aiOwnership === 'capital') {
    laborShareOfGains = 0.25;  // Capital owns AI, captures most gains
  } else if (aiOwnership === 'shared') {
    laborShareOfGains = 0.55;  // Co-ops, employee ownership
  } else { // 'labor' (rare)
    laborShareOfGains = 0.75;  // Workers own tools
  }

  // Bargaining power affects distribution
  laborShareOfGains *= (0.5 + laborBargainingPower * 0.5);  // Scale by power

  // Policy redistribution
  let redistributionBonus = 0;
  if (policy === 'moderate') {
    redistributionBonus = 0.15;  // Progressive taxation, social programs
  } else if (policy === 'strong') {
    redistributionBonus = 0.30;  // UBI, wealth taxes, profit-sharing mandates
  }

  // Final distribution
  const effectiveLaborShare = Math.min(0.85, laborShareOfGains + redistributionBonus);
  const wageGrowth = productivityGrowth * effectiveLaborShare;
  const profitGrowth = productivityGrowth * (1 - effectiveLaborShare);

  // Inequality change
  // If capital captures more than labor, inequality increases
  const inequalityChange = (profitGrowth - wageGrowth) * 0.5;

  return { wageGrowth, profitGrowth, inequalityChange };
}

// Example: Working class with 30% productivity gain from AI
const result = distributeProductivityGains(
  0.30,           // 30% productivity increase
  'capital',      // Companies own GitHub Copilot, ChatGPT
  0.4,            // Weak unions, some unemployment
  'none'          // No redistribution policy
);
// Result: wageGrowth = 0.30 × 0.25 × 0.7 = 5.25% (NOT 30%)
//         profitGrowth = 24.75%
//         inequalityChange = +9.75 points
```

**Integration with existing model:**

```typescript
// In updateBionicSkills or economic update function
export function updateEconomicOutcomes(state: GameState): void {
  for (const segment of state.society.segments) {
    // Calculate productivity gains (existing model)
    const productivityMultiplier = calculateProductivityMultiplierFromSkills(state);
    const productivityGrowth = (productivityMultiplier - 1.0);  // e.g., 1.3 → 0.30 (30%)

    // Distribute gains (new model)
    const distribution = distributeProductivityGains(
      productivityGrowth,
      state.policy.aiOwnership || 'capital',
      segment.laborBargainingPower || 0.5,
      state.policy.redistribution || 'none'
    );

    // Update segment wages (not just productivity)
    segment.income *= (1 + distribution.wageGrowth);
    segment.inequality += distribution.inequalityChange;
  }
}
```

**Policy Levers (for later):**
```typescript
interface PolicyOptions {
  aiOwnership: 'capital' | 'labor' | 'shared';
  redistribution: 'none' | 'moderate' | 'strong';
  unionSupport: number;  // 0-1, affects bargaining power
  profitSharing: boolean;  // Mandates sharing gains
  universalBasicIncome: boolean;  // Decouples income from employment
}
```

**Testing:**
1. Run scenario: High productivity growth (30%) + capital ownership + no policy
2. Verify wages grow slowly (<10%) while productivity grows fast (30%)
3. Verify inequality increases
4. Run scenario: Same productivity + strong redistribution
5. Verify wage growth approaches productivity growth

---

### Task 2.4: Add Teaching Quality Modifiers
**Priority:** MEDIUM
**Research Confidence:** MEDIUM-HIGH
**Effort:** 3-4 hours
**Location:** `/src/simulation/bionicSkills.ts` (integrate with Task 2.2)

**This is already partially covered in Task 2.2 (Performance vs Competence).** Just need to ensure:

1. `calculateTeachingSupport()` function is called for each segment
2. Teaching support affects retention rate
3. Elite get high support (0.80+), precariat get low support (0.30-)
4. Document inequality mechanism clearly

---

## Phase 3: Validation and Sensitivity Analysis (Month 2)

### Task 3.1: Historical Validation Against Automation Events
**Priority:** MEDIUM (builds confidence)
**Effort:** 6-8 hours

**Objective:** Compare model outputs to historical automation patterns

**Test Cases:**

1. **ATMs and Bank Tellers (1980s-2000s)**
   - Initial phase: Tellers became more productive (handled more customers)
   - Substitution phase: Teller employment declined 30% over 20 years
   - Model should replicate: 0-5 years complementarity, 5-20 years gradual substitution

2. **Excel and Junior Accountants (1990s-2010s)**
   - Initial: Accountants more productive with spreadsheets
   - Substitution: Entry-level accountant roles declined over 15 years
   - Model should replicate similar pattern

3. **Self-Checkout and Cashiers (2000s-2020s)**
   - Initial: Cashiers handled more customers with self-checkout assistance
   - Substitution: Cashier employment down 25% over 10 years
   - Model should replicate pattern

**Validation Criteria:**
- Model's phase transition timing should match historical 5-10 year window
- Displacement magnitude should be in range (20-50% over 10-20 years)
- If model diverges significantly, re-calibrate parameters

---

### Task 3.2: Sensitivity Analysis on Key Parameters
**Priority:** HIGH (quantifies uncertainty)
**Effort:** 8-12 hours

**Parameters to Vary:**

1. **Phase Transition Timeline**
   - Base case: 5-10 years
   - Fast scenario: 3-7 years (AI advances faster than historical tech)
   - Slow scenario: 7-15 years (regulatory delays, social resistance)

2. **Labor Share of Gains**
   - Base case: 25% (capital ownership)
   - Optimistic: 55% (shared ownership, strong unions)
   - Pessimistic: 10% (full capital capture)

3. **Skill Retention Rate**
   - Base case: 40-80% (varies by support quality)
   - High retention: 60-90% (excellent teaching, deliberate practice)
   - Low retention: 20-50% (pure AI dependence)

4. **AI Capability Growth Rate**
   - Base case: Linear growth 1.0 → 3.0 over 20 years
   - Fast: Exponential, reaches 3.0 in 10 years
   - Slow: Sublinear, reaches 2.0 in 20 years

**Output Metrics:**
- Year when displacement begins (working class)
- Peak inequality (Gini coefficient)
- Employment rate at year 20 by segment
- Wage growth vs productivity growth gap

**Deliverable:** Sensitivity chart showing range of outcomes under different assumptions

---

### Task 3.3: Literature Comparison
**Priority:** LOW (nice to have)
**Effort:** 4-6 hours

**Compare model predictions to:**
1. Acemoglu & Restrepo (2022) projections
2. Brynjolfsson & Unger (2023) scenarios
3. OECD (2024) inequality forecasts
4. IMF (2024) AI impact estimates

**Flag any major divergences and document assumptions causing differences**

---

## Phase 4: Policy Levers and Intervention Testing (Month 3)

### Task 4.1: Implement Policy Options
**Priority:** MEDIUM (makes model actionable)
**Effort:** 8-12 hours

**Policy Levers to Add:**

1. **Retraining Programs**
   - Affects: Skill retention rate, ability to transition between job categories
   - Parameter: Program effectiveness (0-1)
   - Research: Mixed evidence on effectiveness (40-60% success rate typically)

2. **Universal Basic Income (UBI)**
   - Affects: Decouples income from employment rate
   - Parameter: UBI level (% of median income)
   - Research: Pilots show mixed labor supply effects

3. **AI Ownership Structures**
   - Affects: Labor share of productivity gains
   - Options: Capital ownership, co-ops, employee stock, public ownership
   - Research: Co-ops historically show 55-60% labor share vs 30-40% for traditional

4. **AI Deployment Regulations**
   - Affects: Speed of phase transition, displacement timeline
   - Parameter: Stringency (0=none, 1=strict approval process)
   - Research: Precedent from drug approval, autonomous vehicle regulation

5. **Education System AI Integration**
   - Affects: Teaching support quality, skill retention
   - Parameter: Investment level in AI + teacher training
   - Research: Scientific Reports (2025) shows AI tutoring can outperform traditional instruction

**Implementation:**

```typescript
export interface PolicyConfiguration {
  retrainingPrograms: {
    enabled: boolean;
    effectiveness: number;  // 0-1
    coverage: number;       // % of displaced workers reached
  };

  universalBasicIncome: {
    enabled: boolean;
    level: number;          // % of median income
  };

  aiOwnership: 'capital' | 'labor' | 'shared' | 'public';

  aiDeploymentRegulation: {
    enabled: boolean;
    stringency: number;     // 0-1, affects phase transition speed
  };

  educationInvestment: {
    aiToolAccess: number;   // 0-1, % of students with access
    teacherTraining: number; // 0-1, quality of AI pedagogy training
  };
}

export function applyPolicyEffects(
  state: GameState,
  policy: PolicyConfiguration
): void {
  // Retraining: Reduces displacement impact
  if (policy.retrainingPrograms.enabled) {
    for (const segment of state.society.segments) {
      if (segment.skills.displacementRisk > 0.3) {
        const retrainingEffect = policy.retrainingPrograms.effectiveness * policy.retrainingPrograms.coverage;
        segment.skills.employmentRate *= (1 + retrainingEffect * 0.3);  // Up to 30% mitigation
        segment.skills.competenceWithoutAI += retrainingEffect * 0.2;   // Skill boost
      }
    }
  }

  // UBI: Decouples income from employment
  if (policy.universalBasicIncome.enabled) {
    for (const segment of state.society.segments) {
      const ubiIncome = state.economy.medianIncome * policy.universalBasicIncome.level;
      segment.income = Math.max(segment.income, ubiIncome);  // Floor on income
      // Note: Doesn't affect productivity, just distribution
    }
  }

  // AI Ownership: Affects wage distribution (already in Task 2.3)

  // Regulation: Slows phase transition
  if (policy.aiDeploymentRegulation.enabled) {
    const slowdownFactor = 1 + policy.aiDeploymentRegulation.stringency;
    // Extend timeline: Displacement that would happen in 5 years → 5*(1+s) years
    // Implementation: Scale timeInPhase parameter in calculateEmploymentEffects
  }

  // Education: Improves teaching support
  if (policy.educationInvestment.teacherTraining > 0.5) {
    for (const segment of state.society.segments) {
      segment.skills.teachingSupportQuality += policy.educationInvestment.teacherTraining * 0.3;
      // Improves retention, reduces dependency
    }
  }
}
```

---

### Task 4.2: Policy Scenario Testing
**Priority:** MEDIUM
**Effort:** 4-6 hours

**Test Scenarios:**

1. **Baseline (No Intervention)**
   - Capital ownership, no retraining, no UBI, minimal regulation
   - Expected: Productivity up, inequality up, displacement significant

2. **Moderate Intervention**
   - Some retraining, moderate UBI (30% median income), shared ownership
   - Expected: Productivity up, inequality stable, displacement mitigated

3. **Strong Intervention**
   - Comprehensive retraining, strong UBI (60%), public/labor ownership, education investment
   - Expected: Productivity up, inequality down, displacement minimized

4. **Regulation Heavy**
   - Strict AI deployment rules, slow phase transition
   - Expected: Productivity grows slower, displacement delayed, gives time for adaptation

**Deliverable:** Policy comparison chart showing:
- GDP growth vs baseline
- Inequality (Gini) vs baseline
- Employment rate vs baseline
- Wage growth vs productivity growth

---

## Phase 5: Documentation and Communication (Ongoing)

### Task 5.1: Update Model Documentation
**Priority:** HIGH
**Effort:** 6-8 hours (spread across all phases)

**Documentation Needed:**

1. **Technical Documentation** (`/docs/bionic-skills-model.md`)
   - Model architecture
   - Parameter definitions and defaults
   - Research citations for each mechanism
   - Validation results
   - Sensitivity analysis findings

2. **User Guide** (`/docs/using-bionic-skills-model.md`)
   - How to interpret results
   - What scenarios can/can't be modeled
   - Known limitations
   - Policy lever explanations

3. **Research Validation Report** (DONE: `/reviews/bionic-skills-hopeful-research-foundation-20251016.md`)
   - Already completed
   - Keep updated as new research published

### Task 5.2: Create Stakeholder Communication Materials
**Priority:** MEDIUM
**Effort:** 4-6 hours

**Audiences:**

1. **Technical Stakeholders (Researchers, Engineers)**
   - Focus: Model validity, research citations, TRL assessments
   - Format: Technical reports, code documentation

2. **Policy Stakeholders (Government, NGOs)**
   - Focus: Policy levers, intervention effectiveness, scenario comparisons
   - Format: Policy briefs, scenario visualizations

3. **Public Communication (General Audience)**
   - Focus: What the model shows, why it matters, what can be done
   - Format: Blog posts, infographics, plain-language summaries

---

## Implementation Timeline Summary

### Week 1: Quick Wins (8 hours)
- Change terminology throughout codebase
- Add TRL assessments to code comments
- Update documentation with research citations

### Weeks 2-4: Phase Transition (12 hours)
- Implement employment effects tracking
- Test against historical automation patterns
- Validate timeline assumptions

### Weeks 5-6: Performance vs Competence (8 hours)
- Add retention rate calculations
- Implement teaching support modifiers
- Test disruption scenarios

### Weeks 7-8: Economic Distribution (6 hours)
- Add productivity-wage decoupling
- Implement policy parameters
- Validate against labor economics literature

### Month 2: Validation (16 hours)
- Historical comparisons (ATMs, Excel, self-checkout)
- Sensitivity analysis on key parameters
- Literature comparison

### Month 3: Policy Testing (16 hours)
- Implement policy levers
- Run scenario comparisons
- Document policy effectiveness

### Ongoing: Documentation (12 hours total)
- Update technical docs
- Create stakeholder materials
- Maintain research citation list

**TOTAL EFFORT: ~78 hours over 3 months**

---

## Success Criteria

### Technical Success
- [ ] Model passes historical validation tests (ATM, Excel patterns)
- [ ] Phase transition timing matches literature (5-10 years)
- [ ] Sensitivity analysis shows plausible range of outcomes
- [ ] Code is well-documented with research citations
- [ ] TRL assessments are accurate and defensible

### Research Success
- [ ] Every mechanism has peer-reviewed citation
- [ ] Confidence levels are explicitly stated
- [ ] Limitations are clearly documented
- [ ] Model predictions match qualitative patterns in literature
- [ ] Divergences from literature are explained

### Communication Success
- [ ] Technical stakeholders understand model foundations
- [ ] Policy stakeholders can use model for decision support
- [ ] General audience understands key findings
- [ ] Skeptical reviewers' concerns are addressed
- [ ] "Science fiction" objections are answered with empirical evidence

---

## Risk Mitigation

### Risk 1: Time Constraints
**Mitigation:** Prioritize Phase 1 (terminology) and Phase 2 Tasks 2.1-2.3 (critical mechanisms). Tasks 2.4, 3.x, and 4.x can be deferred if needed.

### Risk 2: New Research Contradicts Model
**Mitigation:** Build model to be modular. If new evidence emerges, individual mechanisms can be updated without rebuilding entire model.

### Risk 3: Stakeholder Disagreement on Assumptions
**Mitigation:** Provide sensitivity analysis showing range of outcomes. Make assumptions explicit and tunable via policy parameters.

### Risk 4: Implementation Complexity
**Mitigation:** Start with simplified versions of mechanisms, add sophistication over time. Better to have simple, working model than complex, broken one.

---

## Next Steps

**Immediate (This Week):**
1. Get stakeholder approval on this action plan
2. Begin Phase 1: Terminology changes (quick win, high impact)
3. Set up testing framework for validation

**Next Month:**
1. Implement Phase 2 critical mechanisms (2.1-2.3)
2. Begin historical validation testing
3. Draft updated documentation

**Following Months:**
1. Complete validation and sensitivity analysis
2. Implement policy levers
3. Finalize stakeholder communication materials

---

## Conclusion

This action plan provides a concrete path to address the skeptical review's concerns while maintaining the model's empirically-validated foundations.

**Key Message:** We're not abandoning the model's core insights (AI does amplify skills, especially for novices). We're adding the necessary countervailing forces (displacement, deskilling, capital capture) that research shows occur in later phases.

**Result:** A more realistic, defensible, and useful model that captures BOTH the opportunities (short-term amplification) AND the risks (long-term displacement, inequality) of AI-assisted cognition.

The model will honestly represent the full range of research-backed outcomes—from optimistic scenarios (with strong policy intervention) to pessimistic scenarios (without intervention)—rather than presenting only one narrative.

This is science, not advocacy. We follow the research wherever it leads.
