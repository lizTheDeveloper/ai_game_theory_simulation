# Scenario Setup Interface Design Specification

**Version:** 1.0
**Date:** November 25, 2025
**Status:** DRAFT - Awaiting Sylvia Review

---

## Purpose

The Scenario Setup interface guides players through selecting a research scenario before starting a simulation run. It must:

1. **Educate without overwhelming** - Help players understand what different scenarios represent
2. **Preserve research integrity** - No arbitrary parameter tweaking (Sylvia's requirement)
3. **Capture player beliefs** - Use belief sliders for player model validation, NOT to change simulation
4. **Set expectations** - Be clear that outcomes are probabilistic, not deterministic

---

## Research Integrity Constraints (Non-Negotiable)

Per GAME_DESIGN_DOCUMENT.md and Sylvia's authority:

- **No player-adjustable research parameters** - Scenarios are pre-defined packages
- **Outcomes within 15% of research baseline** - All scenarios Monte Carlo validated
- **Belief sliders are diagnostic only** - Captured for research validation, don't affect simulation
- **Custom Research mode requires academic credentials** - Gated behind validation

---

## Scenario Options

### 1. Consensus Trajectory (Default)
**"What experts expect if current trends continue"**

- AI: Current capability trajectory (median forecasts)
- Climate: RCP 4.5 (moderate emissions)
- Geopolitics: Present-day tension levels
- Social: Current trust and coordination metrics

**Player guidance:** "This is your baseline - where the research consensus says we're headed."

### 2. Favorable Conditions
**"Best case supported by peer-reviewed evidence"**

- AI: Strong alignment progress (favorable end of uncertainty range)
- Climate: Paris Agreement targets met
- Geopolitics: Successful international coordination (post-WWII analogy)
- Social: High public trust, rapid adaptation

**Player guidance:** "Optimistic but grounded - these conditions have historical precedents."

### 3. Challenging Conditions
**"Realistic worst case from uncertainty ranges"**

- AI: Fast capability takeoff (Amodei/Christiano scenarios)
- Climate: RCP 8.5 pathway
- Geopolitics: Fragmented, competitive
- Social: Low trust, slow coordination

**Player guidance:** "Not doom porn - these are the unfavorable edges of legitimate uncertainty."

### 4. Custom Research (Gated)
**"For academic sensitivity analysis"**

- Requires Monte Carlo validation (N >= 100)
- Must document parameter sources
- Outcomes logged for reproducibility
- **Hidden by default** - Only shown after completing one scenario

---

## Conversational Flow

### Screen 1: Introduction

**Header:** "Before We Begin..."

**Body:**
> You're about to explore one of the most important questions of our time:
> When we solve AI alignment, what kind of world do we want to create?
>
> This simulation draws on peer-reviewed research from climate science,
> AI safety, economics, and social systems. The outcomes you see are not
> scripted - they emerge from validated models.
>
> First, let's set up your scenario.

**Action:** [Begin Setup]

---

### Screen 2: Your Role

**Header:** "You Are the Alignment Architect"

**Body:**
> As Director of the Global Alignment Initiative, you don't command nations
> or reprogram AIs. Your power is influence:
>
> - Public advocacy campaigns
> - Research prioritization recommendations
> - Coalition building
> - Crisis response coordination
>
> The world will evolve with or without you. Your choices shift probabilities.
> They don't guarantee outcomes.

**Action:** [I Understand] / [Tell Me More]

---

### Screen 3: Select Scenario

**Header:** "Choose Your Starting Conditions"

**Visual:** Three cards arranged horizontally

| Consensus | Favorable | Challenging |
|-----------|-----------|-------------|
| [Icon] | [Icon] | [Icon] |
| "Where experts think we're headed" | "Best case the evidence supports" | "Realistic worst case" |
| [Select] | [Select] | [Select] |

**Subtext:** "These aren't difficulty levels - they represent different edges of scientific uncertainty."

**Footer link:** [What about Custom Research?] -> reveals gated option

---

### Screen 4: Belief Calibration (7 Questions)

**Header:** "Before We Show You the Outcomes..."

**Subtext:** "We're capturing your expectations for research purposes. These don't change the simulation - they help us understand how beliefs compare to model outputs."

**Questions (Likert 1-7 scale or slider 0-100%):**

1. **AI Timeline:** How likely is transformative AI within 10 years?
   - "Transformative" = AI that can automate most economically valuable work
   - Anchors: 1 = Very unlikely (<5%), 7 = Very likely (>80%)

2. **Alignment Progress:** How confident are you that we'll solve alignment before capabilities outpace it?
   - Anchors: 1 = Not confident, 7 = Very confident

3. **Climate Action:** Will global coordination on climate improve substantially?
   - Anchors: 1 = Much worse, 4 = Same as now, 7 = Much better

4. **Social Resilience:** How well will societies adapt to AI-driven disruption?
   - Anchors: 1 = Poorly (mass unemployment, unrest), 7 = Well (smooth transition)

5. **Cooperation vs Competition:** Will AI development be more cooperative or competitive globally?
   - Anchors: 1 = Intense arms race, 7 = Coordinated development

6. **Existential Risk:** What probability would you assign to human extinction from AI by 2050?
   - Slider: 0% to 100%

7. **Your Overall Outlook:** How optimistic are you about the next 10 years?
   - Anchors: 1 = Deeply pessimistic, 7 = Cautiously optimistic

**Important disclosure:**
> Your answers are stored for research comparison. They don't affect the simulation.
> This helps us understand how well-calibrated different forecaster groups are.

**Action:** [Start Simulation]

---

### Screen 5: Confirmation

**Header:** "Ready to Begin"

**Summary:**
> **Scenario:** [Selected Scenario Name]
> **Duration:** 120 months (10 years)
> **Outcomes:** Emergent - based on validated models
>
> Remember: Your choices shift probabilities. The system has its own dynamics.
> You influence, but do not control.

**Actions:** [Begin] / [Change Scenario]

---

## Visual Design Notes

### Aesthetic: "Far-Future Observatory"
- Black background (#000000)
- Accent color: #00F0FF (Elysium cyan)
- Clean sans-serif typography
- Glass morphism on cards
- Subtle particle effects (optional)

### Card Design (Scenario Selection)
```
+------------------------+
|      [ICON]            |
|                        |
|  CONSENSUS TRAJECTORY  |
|                        |
|  "Where experts think  |
|   we're headed"        |
|                        |
|  [ SELECT ]            |
+------------------------+
```

### Belief Slider Design
```
Very Unlikely                    Very Likely
     |-----|-----|-----|-----|-----|-----|
     1     2     3     4     5     6     7
                         ^
                     [Your belief]
```

---

## Data Capture (For Research)

**On completion, store:**
```typescript
interface ScenarioSetupCapture {
  selectedScenario: 'consensus' | 'favorable' | 'challenging' | 'custom';
  beliefCalibration: {
    aiTimeline: number;        // 1-7
    alignmentConfidence: number; // 1-7
    climateAction: number;     // 1-7
    socialResilience: number;  // 1-7
    cooperationOutlook: number; // 1-7
    extinctionRiskPercent: number; // 0-100
    overallOptimism: number;   // 1-7
  };
  timestamp: string;
  sessionId: string;
}
```

**Purpose:** Compare player predictions to actual simulation outcomes for forecast calibration research.

---

## Accessibility

- All text at minimum 16px
- Color contrast ratio >= 4.5:1
- Keyboard navigation for all interactions
- Screen reader labels for sliders
- Skip-to-content link for navigation

---

## Sylvia Checkpoint Items

Before approval, Sylvia should verify:

1. [ ] No scenario allows parameter modification beyond validated ranges
2. [ ] Belief sliders are clearly labeled as diagnostic, not causal
3. [ ] Custom Research mode is appropriately gated
4. [ ] No misleading certainty in outcome language
5. [ ] Scenario descriptions accurately reflect research uncertainty

---

## Implementation Notes

**React Components:**
- `ScenarioSetup/` directory
  - `ScenarioSetup.tsx` - Main flow controller
  - `IntroScreen.tsx` - Welcome content
  - `RoleScreen.tsx` - Player role explanation
  - `ScenarioSelector.tsx` - Three-card selection
  - `BeliefCalibration.tsx` - 7-question form
  - `ConfirmationScreen.tsx` - Final review

**State Management:**
- Use local React state (no Redux needed)
- Pass ScenarioSetupCapture to parent on completion
- Store in session for post-run comparison

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Nov 25, 2025 | Initial specification |
