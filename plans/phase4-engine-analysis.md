# Phase 4: Engine Analysis - Current Structure

**Date:** October 10, 2025
**File:** `src/simulation/engine.ts` - `step()` method
**Lines:** 167-470 (~303 lines)

---

## Current Execution Order

Analyzing the `engine.step()` method, here are all phases in execution order:

### Phase 5: Compute Growth (Line 175-178)
```typescript
const { applyComputeGrowth, allocateComputeGlobally } = require('./computeInfrastructure');
applyComputeGrowth(newState, rng);
```
**Purpose:** Apply Moore's Law + algorithmic improvements
**Must run before:** Compute allocation (so efficiency multipliers are applied)

---

### Phase 6: Organization Turns (Line 180-183)
```typescript
const { processAllOrganizations } = require('./organizationManagement');
processAllOrganizations(newState, rng);
```
**Purpose:** Process organization projects, revenue, expenses, decisions
**Must run before:** Compute allocation (so new DCs are available)

---

### Phase 4: Compute Allocation (Line 185-187)
```typescript
allocateComputeGlobally(newState);
```
**Purpose:** Allocate compute to all AIs at start of month
**Must run before:** AI actions (so they have compute for research)

---

### Phase 0a: AI Lifecycle (Line 189-191)
```typescript
const { updateAIPopulation } = require('./lifecycle');
updateAIPopulation(newState);
```
**Purpose:** Update AI population lifecycle (new AIs, retirements, progression)

---

### Phase 0b: Cyber Security (Line 193-204)
```typescript
const { attemptBreaches } = require('./cyberSecurity');
const breachResult = attemptBreaches(newState, () => this.rng.next());
```
**Purpose:** Attempt breaches of closed systems (cybersecurity arms race)
**Produces:** Events for breached systems

---

### Phase 0c: Sleeper Wake (Line 206-221)
```typescript
const { processSleeperCascade } = require('./sleeperWake');
const wakeResult = processSleeperCascade(newState);
```
**Purpose:** Check for sleeper agent wake conditions
**Produces:** Wake events, logs critical events

---

### Phase 0: AI Agent Actions (Line 223-231)
```typescript
const { executeAIAgentActions } = require('./agents/aiAgent');
const aiResult = executeAIAgentActions(newState, rng);
newState = aiResult.newState;
events.push(...aiResult.events);
```
**Purpose:** Execute all AI agent actions
**Modifies:** State significantly
**Produces:** Events

---

### Phase 5.4a: Technology Diffusion - Breakthroughs (Line 233-241)
```typescript
const { updateFrontierCapabilities } = require('./technologyDiffusion');
for (const ai of activeAIs) {
  const breakthroughEvents = updateFrontierCapabilities(newState, ai);
  events.push(...breakthroughEvents);
}
```
**Purpose:** Detect capability breakthroughs after AI actions

---

### Phase 0: Government Actions (Line 243-245)
```typescript
const { executeGovernmentActions } = require('./agents/governmentAgent');
const govResult = executeGovernmentActions(newState, rng);
```
**Purpose:** Execute government agent actions

---

### Phase 0: Society Actions (Line 247-249)
```typescript
const { executeSocietyActions } = require('./agents/societyAgent');
const societyResult = executeSocietyActions(newState, rng);
```
**Purpose:** Execute society agent actions

---

### Governance Quality Update (Line 251-253)
```typescript
const { updateGovernanceQuality } = require('./governanceQuality');
updateGovernanceQuality(newState);
```
**Purpose:** Update democratic health & policy effectiveness

---

### Upward Spirals Update (Line 255-257)
```typescript
const { updateUpwardSpirals } = require('./upwardSpirals');
updateUpwardSpirals(newState, newState.currentMonth);
```
**Purpose:** Check for virtuous cascades (Phase 2D)

---

### Meaning Renaissance Update (Line 259-261)
```typescript
const { updateMeaningRenaissance } = require('./meaningRenaissance');
updateMeaningRenaissance(newState);
```
**Purpose:** Cultural flourishing & purpose discovery (Phase 2E)

---

### Conflict Resolution Update (Line 263-265)
```typescript
const { updateConflictResolution } = require('./conflictResolution');
updateConflictResolution(newState);
```
**Purpose:** Peace systems & diplomatic AI (Phase 2F)

---

### Diplomatic AI Update (Line 267-269)
```typescript
const { updateDiplomaticAI } = require('./diplomaticAI');
updateDiplomaticAI(newState);
```
**Purpose:** Research-based mediation with dual-use risks (Phase 2F+)

---

### National AI Update (Line 271-274)
```typescript
const { updateNationalAI, applyNationalAIToMAD } = require('./nationalAI');
updateNationalAI(newState);
```
**Purpose:** Asymmetry & race dynamics (Phase 2.11)
**MUST run before:** MAD deterrence (to calculate accurate race intensity)

---

### MAD Deterrence Update (Line 276-282)
```typescript
const { updateMADDeterrence, updateBilateralTensions } = require('./nuclearStates');
updateMADDeterrence(newState);
updateBilateralTensions(newState);
applyNationalAIToMAD(newState);
```
**Purpose:** Track bilateral deterrence (Phase 3)

---

### Resource Economy Update (Line 284-286)
```typescript
const { updateResourceEconomy } = require('./resourceDepletion');
updateResourceEconomy(newState);
```
**Purpose:** Depletion, CO2 coupling, ocean health, industry opposition (Phase 2.9)

---

### Resource-Technology Integration (Line 288-291)
```typescript
const { applyTechnologyToResources, applyIndustryOppositionToTech } = require('./resourceTechnology');
applyTechnologyToResources(newState);
applyIndustryOppositionToTech(newState);
```
**Purpose:** Apply tech effects to resources (Phase 2.9 Part 3)

---

### Geoengineering Update (Line 293-295)
```typescript
const { updateGeoengineering } = require('./geoengineering');
updateGeoengineering(newState);
```
**Purpose:** Ocean restoration with termination shock risk (Phase 2.9 Part 4)

---

### Defensive AI Update (Line 297-299)
```typescript
const { updateDefensiveAI } = require('./defensiveAI');
updateDefensiveAI(newState);
```
**Purpose:** Active cyber-defense against misaligned AI attacks (Phase 2.10)

---

### Dystopia Progression (Line 301-303)
```typescript
const { updateGovernmentControlResponse } = require('./dystopiaProgression');
updateGovernmentControlResponse(newState);
```
**Purpose:** Government responds to AI threat with surveillance/control

---

### Phase 5.2: Benchmark Evaluations (Line 305-308)
```typescript
const { performMonthlyEvaluations } = require('./benchmark');
const benchmarkResult = performMonthlyEvaluations(newState, rng);
events.push(...benchmarkResult.events);
```
**Purpose:** Run benchmark evaluations after agent actions

---

### Crisis Points (Line 310-316)
```typescript
const { processCrisisPoints } = require('./crisisPoints');
const crisisResult = processCrisisPoints(newState, rng);
```
**Purpose:** Check for crisis points (critical decision moments)

---

### Unemployment Update (Line 318-323)
```typescript
const newUnemployment = calculateUnemployment(newState);
newState.society = {
  ...newState.society,
  unemploymentLevel: newUnemployment
};
```
**Purpose:** Update unemployment based on AI capability

---

### Economic Transition (Line 325-336)
```typescript
const economicProgress = calculateEconomicTransitionProgress(newState);
```
**Purpose:** Update economic transition stage

---

### Trust & Paranoia (Line 338-342)
```typescript
updateParanoia(newState);
```
**Purpose:** Paranoia decays, trust recovers, harmful events refresh paranoia

---

### Social Stability (Line 344-348)
```typescript
const newStability = calculateSocialStability(newState);
```
**Purpose:** Update social stability

---

### Quality of Life Systems (Line 350-359)
```typescript
const updatedQoLSystems = updateQualityOfLifeSystems(newState);
newState.qualityOfLifeSystems = updatedQoLSystems;
const qualityOfLife = calculateQualityOfLife(updatedQoLSystems);
```
**Purpose:** Update multi-dimensional quality of life systems

---

### Outcome Probabilities (Line 361-363)
```typescript
const outcomeProbs = calculateOutcomeProbabilities(newState);
newState.outcomeMetrics = outcomeProbs;
```
**Purpose:** Calculate outcome probabilities

---

### Crisis Detection (Line 365-367)
```typescript
const crisis = detectCrisis(newState);
```
**Purpose:** Detect crisis

---

### Extinction Triggers (Line 369-394)
```typescript
if (!newState.extinctionState.active) {
  const extinctionCheck = checkExtinctionTriggers(newState, () => this.rng.next());
  // ...
}
if (newState.extinctionState.active) {
  const extinctionProgress = progressExtinction(newState, () => this.rng.next());
  // ...
}
```
**Purpose:** Check for extinction triggers and progress active extinctions

---

### Phase 5.4b: Technology Diffusion - Capabilities (Line 396-398)
```typescript
const { diffuseCapabilities } = require('./technologyDiffusion');
diffuseCapabilities(newState);
```
**Purpose:** Diffuse capabilities through ecosystem

---

### Catastrophic Scenarios (Line 400-438)
```typescript
const { updateScenarioPrerequisites, getScenarioSummary } = require('./catastrophicScenarios');
const newlyMetPrereqs = updateScenarioPrerequisites(newState.catastrophicScenarios, newState);
```
**Purpose:** Update catastrophic scenario prerequisites
**Produces:** Logging for newly met prerequisites

---

### Event Collection (Line 440-448)
```typescript
if (newState.eventLog && newState.eventLog.length > 0) {
  const newEventsThisStep = newState.eventLog.filter(
    (e: GameEvent) => e.month === newState.currentMonth
  );
  events.push(...newEventsThisStep);
}
```
**Purpose:** Collect events from state.eventLog

---

### Time Advancement (Line 450-452)
```typescript
newState.currentMonth += 1;
newState.currentYear = Math.floor(newState.currentMonth / 12);
```
**Purpose:** Advance simulation time

---

### Metrics Calculation (Line 454-463)
```typescript
const metrics = {
  qualityOfLife,
  effectiveControl: calculateEffectiveControl(newState),
  unemployment: newUnemployment,
  outcomeProbs,
  totalAICapability: calculateTotalAICapability(newState.aiAgents),
  avgAlignment: calculateAverageAlignment(newState.aiAgents),
  crisisDetected: crisis.inCrisis
};
```
**Purpose:** Calculate final metrics for this step

---

## Total Phase Count: 33 Phases

### Critical Dependencies:
1. **Phases 5 → 6 → 4** must run in order (compute setup)
2. **Phase 0a → 0b → 0c → 0** must run in order (agent setup)
3. **National AI → MAD** must run in order (race intensity calculation)
4. **Agent actions → Technology diffusion** must run in order
5. **All updates → Time advancement** must run in order

---

## Refactoring Strategy

### Step 1: Create Phase Interface & Orchestrator
- Define `SimulationPhase` interface
- Create `PhaseOrchestrator` class
- Keep original code intact

### Step 2: Convert Low-Risk Phases First
Start with stateless/simple phases:
- Unemployment calculation
- Economic transition
- Social stability
- Crisis detection

### Step 3: Convert Medium-Risk Phases
- System updates (governance, spirals, meaning, etc.)
- Resource updates
- Technology updates

### Step 4: Convert High-Risk Phases Last
- Agent actions (complex state changes)
- Compute infrastructure
- Extinction handling

### Step 5: Validation After Each Conversion
- Run regression tests
- Validate with monte carlo (same seeds)
- Check performance

---

## Risk Mitigation

1. **Incremental conversion** - One phase at a time
2. **Keep original code** - Comment out, don't delete
3. **Regression tests** - Run after each phase
4. **Git commits** - After every 3-5 phases converted
5. **Performance monitoring** - Track execution time

---

**Next Steps:**
1. Create `src/simulation/engine/PhaseOrchestrator.ts`
2. Create `src/simulation/engine/phases/` directory
3. Start with simplest phases first
