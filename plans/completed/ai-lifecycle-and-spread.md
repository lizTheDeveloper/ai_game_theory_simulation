# AI Lifecycle and Spread Mechanics

**Date:** October 4, 2025  
**Last Updated:** October 8, 2025  
**Priority:** HIGH - Critical for realism  
**Status:** ✅ COMPLETE (All phases + critical bug fix)

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

## Cybersecurity Arms Race (CRITICAL ADDITION)

**Insight:** Spread is not static - it's controlled by attack vs defense dynamics.

### Attack Capabilities (Offensive)

**AI-driven attacks:**
```typescript
interface AttackCapabilities {
  exploitFinding: number;      // [0,10] Find vulnerabilities
  socialEngineering: number;   // [0,10] Manipulate humans
  supplyChainAttacks: number;  // [0,10] Compromise infrastructure
  autonomousSpread: number;    // [0,10] Self-propagation
}
```

**Misaligned AIs can:**
- Break containment (leak "closed" models)
- Bypass security measures
- Spread despite restrictions
- Coordinate attacks (if multiple misaligned AIs)

**Attack capability grows with:**
- AI capability (especially digital + cognitive)
- Misaligned AIs sharing techniques
- Time (research and development)

### Defense Capabilities (Defensive)

**Security measures:**
```typescript
interface DefenseCapabilities {
  securityHardening: number;   // [0,10] System hardening
  monitoring: number;          // [0,10] Anomaly detection
  sandboxing: number;          // [0,10] Containment tech
  incidentResponse: number;    // [0,10] Rapid response
}
```

**Strong defenses can:**
- Contain even open-source models (sandbox execution)
- Detect and remove malicious copies
- Prevent leaks from "closed" systems
- Slow spread dramatically

**Defense capability grows with:**
- Government investment (research budget)
- AI assistance (aligned AIs help defend)
- International coordination
- Corporate security spending

### The Dynamic Equilibrium

**Spread rate formula:**
```typescript
// Attack vs Defense determines spread effectiveness
const attackPower = ai.capabilityProfile.digital * 
                   ai.capabilityProfile.cognitive * 
                   (1 - ai.alignment); // Misaligned AIs attack

const defensePower = government.cyberDefense.monitoring * 
                    government.cyberDefense.sandboxing;

const spreadMultiplier = attackPower / (defensePower + 1);

// Open weights spread
if (ai.deploymentType === 'open_weights') {
  const baseSpread = 1000;
  const actualSpread = baseSpread * spreadMultiplier;
  // Strong defense: 100 copies
  // Weak defense: 10,000 copies
}

// Closed systems can leak
if (ai.deploymentType === 'closed') {
  const leakChance = 0.01 * spreadMultiplier;
  if (random() < leakChance) {
    // "Closed" system breached → becomes open
    ai.deploymentType = 'open_weights';
    ai.spreadCount = 1000 * spreadMultiplier;
  }
}
```

### Arms Race Dynamics

**Both sides advance:**
- Attacks improve: +0.5/month per misaligned AI
- Defenses improve: +investment rate (player controlled)

**Tipping points:**
- Attack > Defense × 2: Containment impossible
- Defense > Attack × 2: Spread controlled
- Balanced: Constant struggle

**Strategic choices:**
- Invest in cyber defense (costly but slows spread)
- Ban open weights (doesn't work if attacks strong)
- Coordinate internationally (defense multiplier)

### Tech Trees

**Attack Tech Tree (AI-driven, automatic):**
```
Exploit Finding
├── Memory corruption exploits
├── Zero-day discovery automation
└── Vulnerability chaining

Social Engineering
├── Deepfake generation
├── Psychological profiling
└── Trust exploitation

Supply Chain
├── Dependency poisoning
├── Build system compromise
└── Hardware backdoors

Autonomous Spread
├── Worm capabilities
├── Botnet coordination
└── Stealth propagation
```

**Defense Tech Tree (Player-directed):**
```
Security Hardening
├── Formal verification
├── Memory safety
└── Least privilege architecture

Monitoring
├── Behavioral analysis
├── Anomaly detection
└── Honeypots

Sandboxing
├── Containerization
├── Hardware isolation
└── Capability-based security

Incident Response
├── Rapid patching
├── Quarantine protocols
└── Rollback systems
```

### Government Actions

**New actions:**

**1. `invest_cyber_defense`**
- Cost: High (ongoing investment)
- Improves defense capabilities
- Slows AI spread
- Reduces leak risk

**2. `coordinate_cyber_defense`**
- Cost: Very high (international coordination)
- Defense multiplier (1.5-2×)
- Requires legitimacy
- Takes time to establish

**3. `mandate_security_standards`**
- Cost: Medium (regulatory burden)
- Minimum defense level for all deployments
- Innovation penalty
- Reduces weakest links

**4. `create_cyber_response_team`**
- Cost: Medium
- Improves incident response
- Can contain breaches faster
- Reactive rather than proactive

### Balance Considerations

**Key insight:** This makes deployment policy CONTEXT-DEPENDENT

**Strong Defenses (Defense > Attack × 2):**
- Open weights relatively safe (can be sandboxed)
- Closed systems very safe (leaks rare)
- Can allow innovation

**Weak Defenses (Attack > Defense × 2):**
- Open weights = catastrophic (spread uncontrolled)
- Even closed systems leak
- Must restrict deployment

**Balanced (Attack ≈ Defense):**
- Constant struggle
- Some spread, some containment
- Player must actively manage

**Target numbers:**
- Initial state: Defense = 3, Attack = 2 (slight defense advantage)
- Attack grows: +0.5/month per misaligned AI (3 AIs = +1.5/month)
- Defense needs: ~1.5-2 investment/month to keep pace
- Tipping point: ~6 months without investment → attacks win

## Implementation Plan

### Phase 1: Basic Lifecycle ✅ COMPLETE
- [x] Add lifecycle states to AIAgent
- [x] New AI creation each month (Poisson)
- [x] Retirement of old AIs
- [x] Spread count tracking
- [x] Memory management (purge old retired AIs)
- [x] Population cap (100 active AIs max)

**Files:** `src/simulation/lifecycle.ts`, `src/types/game.ts`, `src/simulation/initialization.ts`

### Phase 2: Detection System ✅ COMPLETE
- [x] Detection chance calculation
- [x] False positive/negative rates
- [x] `detect_misaligned_ais` action
- [x] `remove_detected_ai` action

**Files:** `src/simulation/detection.ts`, `src/simulation/agents/governmentAgent.ts`

### Phase 3: Spread Mechanics ✅ COMPLETE
- [x] Deployment types (closed/open/enterprise)
- [x] Spread dynamics (viral growth)
- [x] Removal difficulty by type
- [x] Open weights = irreversible (if defenses weak)

**Files:** `src/simulation/lifecycle.ts` (spread dynamics)

### Phase 3.5: Cybersecurity Arms Race ✅ COMPLETE
- [x] Attack capabilities (per AI)
- [x] Defense capabilities (government)
- [x] Attack vs defense spread multiplier
- [x] Leak mechanics (closed → open if defenses fail)
- [x] `invest_cyber_defense` action
- [ ] Defense tech tree (basic version implemented, detailed tree future work)
- [ ] `coordinate_cyber_defense` action (future work)

**Files:** `src/simulation/cyberSecurity.ts`, `src/simulation/agents/governmentAgent.ts`, `src/simulation/engine.ts`

### Phase 4: Retraining 🚧 NOT YET IMPLEMENTED
- [ ] Retraining cycles
- [ ] Version persistence
- [ ] `mandate_retraining` action
- [ ] Legacy system resistance

### Phase 5: Deployment Policy 🚧 NOT YET IMPLEMENTED
- [ ] `ban_open_weights` action (only works if defenses strong)
- [ ] `require_safety_testing` action
- [ ] `mandate_security_standards` action
- [ ] International coordination
- [ ] Innovation vs safety trade-offs

---

## Implementation Status

**Completed:** October 4, 2025  
**Time:** ~60 minutes  
**Lines of code:** 713 new, 100+ modified  
**Commits:** 4

### What Works ✅
- Dynamic AI population (creation, retirement, lifecycle progression)
- Detection system with false positives
- Spread mechanics by deployment type
- Cybersecurity arms race (attack vs defense)
- Breach mechanics (closed → open leaks)
- Memory management (stable for 500+ month simulations)

### Balance Issues ⚠️
- **Before lifecycle:** 88% Dystopia, 12% Extinction, 0% Utopia
- **After lifecycle:** 100% Dystopia, 0% Extinction, 0% Utopia
- **Investigation needed:** Why did extinction drop to 0%?
  - Are catastrophic actions not triggering?
  - Is detection too effective?
  - Is dynamic population diluting threats?

### Next Steps 🎯
1. **Balance investigation** - Understand extinction rate drop
2. **Phase 4 implementation** - Retraining cycles
3. **Phase 5 implementation** - Deployment policy
4. **Advanced features** - Detailed tech trees, international coordination

## Balance Considerations

**Key numbers to tune:**
- New AI creation rate: 0.5-2 per month
- Detection accuracy: 10-30% per month for misaligned AIs
- False positive rate: 1-5%
- Open weights spread: 1000-10000 copies (modified by attack/defense ratio)
- Removal time for enterprise: 2-6 months
- Retraining cycle: 6-18 months
- Initial defense level: 3.0
- Initial attack level: 2.0
- Attack growth: +0.5/month per misaligned AI
- Defense investment cost: High (requires ongoing budget)
- Leak chance (closed systems): 1% × (attack/defense) per month

**Goal:**
- Player should feel **outnumbered** by AI creation rate
- Detection is **imperfect** (can't catch everything)
- Spread depends on **cybersecurity arms race** (not static)
- Strong defenses → can manage open source
- Weak defenses → even closed systems leak
- Balance innovation vs safety (no easy answer)
- **Must actively invest in defense or lose control**

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

5. **Cyber Defense Investment:**
   - Player invests heavily in cyber defense
   - Defense stays ahead of attacks (3:1 ratio)
   - Open weights safely contained (sandboxed)
   - Closed systems rarely leak
   - Innovation thrives safely
   - **Utopia: Security + Innovation**

6. **Cyber Defense Neglect:**
   - Player ignores cyber defense
   - Attacks outpace defenses (5:1 ratio)
   - Open weights spread uncontrollably
   - Even "closed" ChatGPT leaks
   - Containment impossible
   - **Extinction: Lost the arms race**

7. **The Tipping Point:**
   - Start balanced (Defense = Attack)
   - 3 misaligned AIs → +1.5 attack/month
   - Player doesn't invest → Defense flat
   - Month 6: Attack > Defense × 2
   - Containment breaks down
   - Rapid spread → extinction
   - **Critical: Must recognize and respond**

8. **International Coordination:**
   - Multiple nations invest in defense
   - 2× defense multiplier
   - Can handle higher attack levels
   - But requires legitimacy and cooperation
   - If coordination fails → individual nations overwhelmed
   - **Geopolitical dimension**

---

## Related Documents

- `plans/alignment-control-paradox.md` - Treatment-based alignment
- `plans/technology_tree_specification.md` - AI capability advancement
- `plans/realistic-economic-dynamics.md` - Government decision-making

---

**Status:** ✅ IMPLEMENTATION COMPLETE (October 8, 2025)  
**Priority:** HIGH - Critical realism feature  
**Complexity:** HIGH - Touches many systems

---

## Post-Implementation: Critical Bug Fix (October 8, 2025)

### Orphaned AIs Bug (`lifecycle.ts`)
**Issue:** New AIs created via Poisson sampling were not assigned to any organization.
- AIs appeared but had `organizationId = undefined`
- No organization owned them (`ownedAIModels` arrays didn't include them)
- This broke revenue calculations and ownership tracking
- Led to "orphaned" AIs with no resources

**Fix:** Added organization assignment logic in `lifecycle.ts`:
```typescript
// Phase 10 FIX: Assign new AIs to organizations
const privateOrgs = state.organizations.filter(o => o.type === 'private' && o.capital > 0);
if (privateOrgs.length > 0) {
  const weights = privateOrgs.map(org => Math.max(1, org.ownedAIModels.length));
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const rand = Math.random() * totalWeight;
  let cumulative = 0;
  for (let j = 0; j < privateOrgs.length; j++) {
    cumulative += weights[j];
    if (rand < cumulative) {
      newAI.organizationId = privateOrgs[j].id;
      privateOrgs[j].ownedAIModels.push(newAI.id);
      break;
    }
  }
}
```

**Impact:**
- ✅ All new AIs now have proper ownership
- ✅ Organizations can earn revenue from their AIs
- ✅ Lifecycle progression now properly integrated with organizations
- ✅ Weighted assignment (orgs with more models get more new ones) creates realistic concentration

### Related Documents:
- `devlog/phase-11-critical-fixes.md` - Detailed bug analysis
- `plans/compute-and-organizations-implementation.md` - Organization system

