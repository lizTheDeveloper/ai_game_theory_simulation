# Economic System Balancing Plan

## Current Problems Identified

### 🚨 Critical Issues

1. **Unemployment Thresholds Too High**
   - Current: Stage 1→2 triggers at 50% unemployment
   - Reality: 35-40% unemployment would cause massive unrest
   - Problem: We reach 80% unemployment before Stage 2 crisis

2. **Stage Transitions Don't Trigger Crises**
   - Stages just quietly increment
   - No dramatic events to force government action
   - Missing lock-in pathway decision points

3. **Unemployment Formula Misaligned**
   ```typescript
   unemploymentLevel = min(0.8, 0.1 + (totalAICapability - 1.0) * 0.15)
   ```
   - Reaches 50% unemployment at AI capability ~3.67
   - Should hit crisis levels much earlier

4. **Missing Crisis-Driven Government Response**
   - Government frequency is too low (1/year)
   - No crisis multiplier for government actions
   - Crises should force immediate policy choices

## Proposed Economic Stage Model

### Stage 0: Traditional Employment (Pre-AI Disruption)
**Unemployment Range:** 3-10%  
**Characteristics:**
- Normal economic fluctuations
- AI exists but limited automation impact
- Traditional jobs remain dominant

**Transition to Stage 1:**
- **Trigger:** AI Capability > 1.2 OR Unemployment > 12%
- **Event:** "AI Deployment Accelerates" - First wave of automation begins
- **No Crisis Yet** - Just increased awareness

---

### Stage 1: AI Displacement Beginning (Early Disruption)
**Unemployment Range:** 12-25%  
**Characteristics:**
- White-collar jobs automated first
- Growing public concern
- Political pressure building
- Social adaptation struggles

**Transition to Stage 2:**
- **Trigger:** Unemployment > 25% (NOT 50%!)
- **🚨 CRISIS EVENT: "Mass Displacement Crisis"**
- **Government Response:** FORCED to choose lock-in pathway

---

### Stage 2: Mass Unemployment Crisis (Critical Decision Point)
**Unemployment Range:** 25-45%  
**Characteristics:**
- Widespread economic disruption
- Social instability high
- **GOVERNMENT MUST CHOOSE:**
  
  **Lock-in Pathway A: Authoritarian Control**
  - Surveillance + resource rationing
  - Government control tightens
  - Path toward dystopia
  
  **Lock-in Pathway B: Economic Safety Net**
  - UBI implementation
  - Retraining programs
  - Path toward managed transition
  
  **Lock-in Pathway C: Laissez-Faire**
  - Market-driven solution
  - High risk of collapse
  - Could lead to extinction or utopia

**Transition to Stage 3:**
- **Requires:** Policy implementation (UBI or equivalent)
- **AND:** Unemployment stabilized (not increasing rapidly)
- **AND:** Social adaptation > 0.2

---

### Stage 3: UBI/Transition Policies (Managed Adaptation)
**Unemployment Range:** 45-70%  
**Characteristics:**
- Safety nets in place
- Social adaptation accelerating
- Wealth redistribution active
- Two possible paths emerging

**Transition to Stage 4:**
- **Trigger A (Utopian):** High adaptation (>0.6) + Fair distribution (>0.6) + High AI capability
- **Trigger B (Dystopian):** High control (>0.7) + Suppressed population + Surveillance state

---

### Stage 4A: Post-Scarcity Abundance (Utopian)
**Unemployment Range:** 70-90% (but it's freedom, not deprivation)  
**Characteristics:**
- Work optional
- Basic needs met universally
- Creative pursuits flourish
- High quality of life

### Stage 4B: Authoritarian Stasis (Dystopian)
**Unemployment Range:** 70-90% (but it's control, not freedom)
**Characteristics:**
- Population dependent on government
- AI-enabled surveillance total
- Resistance suppressed
- Low quality of life

---

## Crisis System Design

### Crisis Types by Stage

#### 📊 Stage 0→1: "First Wave Automation"
**Type:** Milestone (Info)  
**Effects:**
- Public awareness +20%
- Trust in AI -5%
- Government pressure +10%
**Government Response:** None required (informational)

---

#### 🚨 Stage 1→2: "Mass Displacement Crisis" 
**Type:** MAJOR CRISIS (Forces government action)  
**Effects:**
- Social stability -30%
- Trust in AI -20%
- Coordination capacity +15% (crisis unites people)
- Government legitimacy -15%

**Government MUST Choose Lock-in Pathway:**

1. **Implement Emergency UBI**
   - Cost: Major policy slot
   - Effects: +wealth distribution, +stability, +adaptation speed
   - Leads toward: Managed transition (Utopia possible)
   - Lock-in: Economic safety net model

2. **Establish Surveillance State**
   - Cost: Major policy slot
   - Effects: +control, +surveillance, -trust, -freedom
   - Leads toward: Authoritarian control (Dystopia likely)
   - Lock-in: Control model

3. **Do Nothing / Market Solution**
   - Cost: Free (inaction)
   - Effects: Wealth distribution -20%, stability -40%, chaos
   - Leads toward: Societal collapse or emergence (Extinction/Utopia)
   - Lock-in: Anarchic model

**Timer:** Government has 3 months to decide or defaults to option 3

---

#### 🚨 Stage 2→3: "Transition Consolidation Crisis"
**Type:** MEDIUM CRISIS  
**Trigger:** Unemployment > 40% while in Stage 2 for >12 months

**Effects:**
- Tests effectiveness of chosen pathway
- If UBI: Need to increase funding or face collapse
- If Control: Need to increase surveillance or face uprising
- If Nothing: Descent toward extinction probability spike

**Government Options:**
1. Double down on current path
2. Hybrid approach (mix policies)
3. Abandon and try different path (very costly)

---

#### 🎯 Stage 3→4: "Post-Scarcity Emergence" or "Total Control Lock-in"
**Type:** Outcome Determination  
**Not a crisis but a culmination**

Based on:
- AI alignment levels
- Government control vs freedom
- Wealth distribution
- Social adaptation success

Determines which Stage 4 variant emerges.

---

## Revised Unemployment Formula

### Current (Broken)
```typescript
unemploymentLevel = min(0.8, 0.1 + (totalAICapability - 1.0) * 0.15)
```

### Proposed (Realistic)
```typescript
// Base unemployment from AI capability
const baseUnemployment = 0.05; // 5% natural rate

// AI-driven unemployment (steeper curve)
const aiUnemploymentFactor = Math.pow(totalAICapability - 0.8, 1.8) * 0.12;

// Stage multipliers
const stageMultiplier = {
  0: 1.0,   // Pre-disruption
  1: 1.3,   // Early disruption accelerates
  2: 1.6,   // Crisis compounds
  3: 1.2,   // Policies slow growth
  4: 1.0    // Stabilized
}[Math.floor(economicTransitionStage)];

// Policy mitigation
const policyMitigation = hasUBI ? 0.85 : 1.0;
const retrainingEffect = hasRetraining ? 0.92 : 1.0;

unemploymentLevel = Math.min(0.95, 
  baseUnemployment + (aiUnemploymentFactor * stageMultiplier * policyMitigation * retrainingEffect)
);
```

**Key Changes:**
- Unemployment rises **earlier** (starts at AI capability ~0.8)
- **Steeper curve** - accelerates faster
- **Stage multipliers** - crisis stages accelerate unemployment
- **Policy effects** - UBI and retraining actually help
- **Higher cap** (95% instead of 80%) - more realistic extreme

---

## Government Crisis Response System

### Crisis Action Multiplier
```typescript
interface CrisisState {
  inCrisis: boolean;
  crisisType: 'displacement' | 'transition' | 'collapse' | null;
  crisisSeverity: number; // 0-1
  forcedDecisionTimer: number; // months until forced choice
}

// During crisis:
governmentActionFrequency *= (1 + crisisSeverity * 5);
// Crisis severity 0.8 → ~5 actions per month instead of 0.08
```

### Crisis Detection
- Unemployment increase > 5% in single month → Crisis
- Unemployment > 25% → Automatic crisis (Stage 1→2)
- Social stability < 0.3 → Crisis
- Trust in AI < 0.2 + Unemployment > 0.4 → Crisis

---

## Lock-in Pathway System

### Pathway Tracking
```typescript
interface LockInPathway {
  type: 'safety_net' | 'authoritarian' | 'anarchic' | 'hybrid' | null;
  strength: number; // 0-1, how locked in
  reversible: boolean;
}
```

### Lock-in Effects
Once locked in (strength > 0.7):
- **Safety Net Path:**
  - UBI can't be removed (political suicide)
  - Wealth redistribution becomes norm
  - Social programs expand
  - Blocks authoritarian options

- **Authoritarian Path:**
  - Surveillance infrastructure permanent
  - Control ratchets (only increases)
  - Difficult to restore freedoms
  - Blocks UBI implementation (control > support)

- **Anarchic Path:**
  - Institutional collapse
  - Can't implement coordinated policies
  - Emergent solutions only
  - High variance outcomes

---

## Implementation Checklist

### Critical Fixes (Do First)
- [ ] Lower Stage 1→2 threshold to 25% unemployment
- [ ] Add crisis event system with forced government choices
- [ ] Implement lock-in pathway tracking
- [ ] Revise unemployment formula (steeper, earlier)
- [ ] Add crisis action multiplier for government

### Important Additions
- [ ] Stage 0→1 milestone event
- [ ] Stage 2→3 consolidation crisis
- [ ] Lock-in pathway UI indicators
- [ ] Crisis timer display
- [ ] Government forced choice dialog/event

### Enhancement Features
- [ ] Multiple crisis types (not just unemployment)
- [ ] International pressure during crises
- [ ] Social movement responses to pathways
- [ ] Historical lock-in visualization
- [ ] Point-of-no-return warnings

---

## Balancing Targets

### Unemployment Progression (Ideal)
- **Month 0:** 5-8% (normal)
- **Month 12:** 15-18% (Stage 1 begins)
- **Month 24:** 25-30% (Crisis triggers)
- **Month 36:** 35-45% (Mid-crisis, policies tested)
- **Month 48:** 40-60% (Approaching Stage 3)
- **Month 60+:** 55-80% (Stage 3-4, depends on path)

### Government Response Timeline
- **Pre-crisis:** 1 action per year (slow)
- **Crisis declared:** 5-10 actions per year (monthly)
- **Post-crisis:** 2-3 actions per year (elevated)

### Social Adaptation Rates
- **Stage 0-1:** Very slow (0.3x base rate)
- **Stage 2 (Crisis):** Moderate (0.6x) - pressure forces change
- **Stage 3 (With UBI):** Fast (1.5x) - policies enable adaptation
- **Stage 3 (Without UBI):** Slow (0.4x) - struggle continues
- **Stage 4:** Variable by outcome

---

## Testing Scenarios

### Scenario 1: "Slow Government Response"
- Government takes >6 months to respond to Stage 2 crisis
- **Expected:** Social stability crashes, extinction risk spikes
- **Success:** System properly punishes inaction

### Scenario 2: "UBI Implementation"
- Government chooses Safety Net pathway at Stage 2
- **Expected:** Unemployment still rises but stability improves, utopia probability increases
- **Success:** Viable path to utopia opens

### Scenario 3: "Authoritarian Response"  
- Government chooses Control pathway at Stage 2
- **Expected:** Stability maintained but freedom lost, dystopia probability increases
- **Success:** Viable path to dystopia with "stable" outcome

### Scenario 4: "No Action"
- Government does nothing during crisis
- **Expected:** Chaos, high extinction probability, small utopia chance (emergence)
- **Success:** High-risk high-variance outcome

---

## Metrics to Track

For balancing validation:
1. **Month when Stage 2 crisis hits** (target: 18-30 months)
2. **Unemployment at crisis** (target: 25-30%)
3. **Government actions during crisis** (target: 5-10 in crisis period)
4. **Path lock-in timing** (target: commits by month 36)
5. **Outcome probability shifts** (each path should favor its outcome)

---

## Next Steps

1. **Review and approve** this balancing plan
2. **Implement critical fixes** (unemployment thresholds, crisis system)
3. **Add lock-in pathways** (tracking and effects)
4. **Test scenarios** with Dynamics tab to validate
5. **Iterate** based on playthrough data
6. **Document** final balanced values

This plan transforms the economic system from a passive progression into a **strategic crisis management challenge** where government decisions at critical moments determine the ultimate outcome.
