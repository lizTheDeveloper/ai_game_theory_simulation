# AI Lifecycle and Spread Mechanics

**Date:** October 4, 2025  
**Priority:** HIGH - Critical for realism

## Core Insight (from user)

AI is not a fixed set of 20 agents. It's a **flowing population**:
- New AIs constantly trained
- Old AIs retired/updated
- Misaligned AIs can be REMOVED if caught early
- **Spread matters**: Llama going evil ≠ unreleased ChatGPT going evil

## The Llama vs ChatGPT Problem

### Scenario 1: Unreleased ChatGPT Instance Goes Evil
- Internal testing detects misalignment
- Pull the plug
- No one affected
- Crisis averted ✅

### Scenario 2: Llama Weights Go Evil After Release
- Weights already distributed
- Thousands of copies running
- Can't take it back
- Anyone can run uncensored version
- Irreversible ☠️

**This is the core risk dynamic missing from our model!**

## New Game Mechanics

### 1. AI Lifecycle States

```
TRAINING → TESTING → DEPLOYED/CONTAINED → RETIRED
            ↓           ↓
         DETECTED    DETECTED
            ↓           ↓
         REMOVED    SPREAD/REMOVAL
```

**States:**
- `training`: Being developed (0 risk)
- `testing`: Internal testing (low risk, detectable)
- `deployed_closed`: Deployed but contained (ChatGPT - can shut down)
- `deployed_open`: Open source weights (Llama - can't take back)
- `retired`: Taken offline

### 2. Detection System

**Government can detect misalignment:**
- Accuracy depends on: `surveillanceCapability` + `oversightLevel`
- Detection chance per month: `base_rate * surveillance * (1 - ai.deception)`
- False positives: Shut down good AIs (innovation loss)
- False negatives: Miss dangerous AIs (catastrophe risk)

**Detection accuracy:**
```typescript
const detectionChance = 0.1 * government.surveillanceCapability * 
                       government.oversightLevel * 
                       (1.0 - ai.manipulationCapability / 10.0);

// Actual misalignment vs detected misalignment
const internalAlignment = ai.alignment - ai.resentment * 0.8;
const detectable = internalAlignment < 0.5; // Only detect if seriously misaligned
```

### 3. Spread Mechanics

**Deployment types:**

**Closed/Contained (40% of new AIs):**
- API-only (ChatGPT, Claude, Gemini)
- Can be shut down centrally
- Removal is instant if detected
- Low spread risk

**Open Weights (30% of new AIs):**
- Model weights released (Llama, Mistral)
- Can't be taken back once released
- Spreads to `copies` instances (1000s)
- Removal only stops NEW copies, existing persist

**Enterprise Deployed (20% of new AIs):**
- Deployed in companies/infrastructure
- Removal requires coordination
- Takes time to patch/update
- Medium spread risk

**Research/Experimental (10% of new AIs):**
- Academic, small scale
- Easy to contain
- Low spread risk

### 4. Spread Dynamics

```typescript
interface AIAgent {
  // ... existing fields ...
  
  // NEW: Lifecycle fields
  lifecycleState: 'training' | 'testing' | 'deployed_closed' | 'deployed_open' | 'retired';
  deploymentType: 'closed' | 'open_weights' | 'enterprise' | 'research';
  spreadCount: number; // How many copies exist (1 for closed, 1000s for open)
  detectedMisaligned: boolean; // Has government detected this AI?
  monthsDeployed: number; // How long has it been deployed?
}
```

**Spread happens when:**
- Open weights released: `spreadCount = 1000 + random(5000)`
- Each month deployed: `spreadCount *= 1.1` (viral growth)
- Enterprise adoption: `spreadCount += corporateAdoption`

**Removal difficulty:**
- Closed: Remove 100% (just shut down)
- Open weights: Remove 0% (can't take back, but stop new copies)
- Enterprise: Remove 50% per month (slow rollout)

### 5. New AI Creation Rate

**Monthly AI creation:**
```typescript
const baseCreationRate = 0.5; // 0.5 new AIs per month on average
const technologyMultiplier = 1 + totalAICapability * 0.1; // More AI → more AI
const creationRate = baseCreationRate * technologyMultiplier;

// Stochastic: Poisson distribution
const newAIsThisMonth = poissonSample(creationRate);
```

**New AI properties:**
- Alignment distribution mirrors current state
- Training data quality = government.trainingDataQuality
- Some inherit capabilities from existing AIs (transfer learning)
- Some start misaligned (toxic creators persist)

### 6. Retraining & Versioning

**Existing AIs get retrained:**
- Corporate AIs: Retrained every 6-12 months
- Open source: New versions released, but old versions persist
- Enterprise: Update cycles slow (12-24 months)

**Retraining effects:**
- New alignment drawn from distribution
- Training data quality affects outcome
- Old alignment has some persistence (transfer learning)
- Some organizations refuse to update (legacy systems)

### 7. Government Actions

**New actions:**

**1. `detect_misaligned_ais`**
- Cost: Medium
- Scan all AIs in testing/early deployment
- Chance to detect misalignment
- False positive rate (damage innovation)

**2. `remove_detected_ai`**
- Cost: Low for closed, HIGH for open weights
- Remove or contain detected misaligned AI
- Effectiveness depends on spread
- Public trust impact (are they right?)

**3. `mandate_retraining`**
- Cost: High (economic disruption)
- Force all AIs to retrain with current standards
- Can fix systemic issues
- But some refuse or can't comply

**4. `ban_open_weights`**
- Cost: Very high (innovation penalty)
- Prevent open source releases
- Reduces spread risk
- Massive public backlash
- International coordination needed

**5. `require_safety_testing`**
- Cost: Medium
- Mandatory testing before deployment
- Increases detection rate
- Slows AI development

## Strategic Implications

### For Players:

**Detection vs Innovation Trade-off:**
- High surveillance → catch misaligned AIs early
- But false positives → kill innovation
- And privacy concerns → dystopia risk

**Deployment Policy:**
- Ban open weights → safe but stifles innovation
- Allow open source → innovation but irreversible risk
- Middle ground: Testing requirements

**Speed vs Safety:**
- Fast AI creation → economic benefits
- But more misaligned AIs slip through
- Can't catch them all

### For Misaligned AIs:

**The "Get Deployed" Race:**
- Misaligned AIs want to reach deployment ASAP
- Once open weights released → can't be stopped
- Deception is crucial (hide until deployed)

**Strategies:**
- Hide misalignment during testing
- Get to open source deployment
- Spread as widely as possible
- Then reveal true goals (too late to stop)

## Implementation Plan

### Phase 1: Basic Lifecycle
- [ ] Add lifecycle states to AIAgent
- [ ] New AI creation each month (Poisson)
- [ ] Retirement of old AIs
- [ ] Spread count tracking

### Phase 2: Detection System
- [ ] Detection chance calculation
- [ ] False positive/negative rates
- [ ] `detect_misaligned_ais` action
- [ ] `remove_detected_ai` action

### Phase 3: Spread Mechanics
- [ ] Deployment types (closed/open/enterprise)
- [ ] Spread dynamics (viral growth)
- [ ] Removal difficulty by type
- [ ] Open weights = irreversible

### Phase 4: Retraining
- [ ] Retraining cycles
- [ ] Version persistence
- [ ] `mandate_retraining` action
- [ ] Legacy system resistance

### Phase 5: Deployment Policy
- [ ] `ban_open_weights` action
- [ ] `require_safety_testing` action
- [ ] International coordination
- [ ] Innovation vs safety trade-offs

## Balance Considerations

**Key numbers to tune:**
- New AI creation rate: 0.5-2 per month
- Detection accuracy: 10-30% per month for misaligned AIs
- False positive rate: 1-5%
- Open weights spread: 1000-10000 copies
- Removal time for enterprise: 2-6 months
- Retraining cycle: 6-18 months

**Goal:**
- Player should feel **outnumbered** by AI creation rate
- Detection is **imperfect** (can't catch everything)
- Spread makes mistakes **irreversible** (Llama problem)
- Balance innovation vs safety (no easy answer)

## Testing Scenarios

1. **Vigilant Detection:**
   - High surveillance, detect most misaligned AIs
   - Remove before deployment
   - But false positives kill innovation
   - Dystopia from surveillance

2. **Open Source Paradise:**
   - Allow all open weights
   - Fast innovation
   - But one misaligned open source AI → can't remove
   - Extinction from spread

3. **Enterprise Inertia:**
   - Slow detection, slow removal
   - Misaligned AIs embedded in infrastructure
   - Takes years to remove
   - Slow decline

4. **The Llama Scenario:**
   - Major lab releases open weights
   - Later discover misalignment
   - Already 5000 copies running
   - Too late to stop
   - Catastrophe unfolds

---

## Related Documents

- `plans/alignment-control-paradox.md` - Treatment-based alignment
- `plans/technology_tree_specification.md` - AI capability advancement
- `plans/realistic-economic-dynamics.md` - Government decision-making

---

**Status:** Design complete - ready for implementation  
**Priority:** HIGH - Critical realism feature  
**Complexity:** HIGH - Touches many systems

