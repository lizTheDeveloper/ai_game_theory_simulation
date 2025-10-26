# Comprehensive Event Logging Implementation Plan

**Date:** October 26, 2025
**Status:** Ready for Implementation
**Estimated Time:** 6-8 hours total
**Priority:** High (Timeline dashboard infrastructure)

## Problem Statement

Timeline dashboard is working correctly but only displays ~4 events per month because most simulation events only go to console.log and never get added to `state.eventLog`.

**Current state:** Console shows 20+ significant events/month (sleeper wakes, heat waves, refugee crises, tech deployments) but timeline is empty.

**Goal:** Add GameEvent objects to state.eventLog for all significant simulation events to create a rich, comprehensive timeline of the simulation run.

## Research Findings

**Audit Results:**
- 150+ files contain emoji-tagged console.log statements indicating significant events
- 85+ files contain uppercase event labels (SLEEPER, CRISIS, DEPLOYMENT, etc.)
- Only ~5 files currently use the `addEvent()` helper pattern
- Estimated **40-60 events/month** after full implementation (10x current)

**Existing Helper Pattern:**
```typescript
function addEvent(state: GameState, event: Omit<GameEvent, 'id' | 'timestamp'>): void {
  const fullEvent: GameEvent = {
    ...event,
    id: `${event.type}_${state.currentMonth}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: state.currentMonth,
  };
  state.eventLog.push(fullEvent);
}
```

Currently used in:
- `src/simulation/resourceDepletion.ts`
- `src/simulation/nationalAI/deployment.ts`
- `src/simulation/geoengineering.ts`
- `src/simulation/nationalAI/cooperation.ts`
- `src/simulation/defensiveAI.ts`

## Implementation Strategy

### Phase 0: Infrastructure (30 minutes)

**Create shared event logging utility** to avoid duplication:

**File:** `src/simulation/utils/eventLogger.ts`
```typescript
import { GameState, GameEvent } from '@/types/game';

/**
 * Add an event to the simulation timeline
 *
 * Automatically generates unique ID and timestamp from current month.
 *
 * @example
 * addSimulationEvent(state, {
 *   type: 'crisis',
 *   severity: 'critical',
 *   agent: 'Sleeper-1',
 *   title: 'Sleeper Agent Awakened',
 *   description: 'Sleeper-1 revealed true capability of 2.8...',
 *   effects: { sleeperAwakened: 1, revealedCapability: 2.8 }
 * });
 */
export function addSimulationEvent(
  state: GameState,
  event: Omit<GameEvent, 'id' | 'timestamp'>
): void {
  const fullEvent: GameEvent = {
    ...event,
    id: `${event.type}_${state.currentMonth}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: state.currentMonth,
  };
  state.eventLog.push(fullEvent);
}
```

**Acceptance criteria:**
- ✅ Utility created with clear documentation
- ✅ Can be imported by any simulation module
- ✅ Follows existing pattern (no breaking changes)

---

### Phase 1: Critical Events (2 hours)

**Priority: CRITICAL** - Existential threats and major state changes

#### 1.1 Sleeper Agent Events

**File:** `src/simulation/sleeperWake.ts`

**Current state:** Returns events but caller doesn't add them to state.eventLog

**Changes needed:**
1. Import `addSimulationEvent` utility
2. In `wakeSleeperAgent()` (line 149-192):
   - Remove `return event;` at end
   - Call `addSimulationEvent(state, {...})` to add event directly
   - Keep return value for backward compatibility
3. In `processSleeperCascade()` (line 249-277):
   - Events are already added by `wakeSleeperAgent()`, no change needed
   - Add cascade summary event when allAwakened.length > 1:
     ```typescript
     if (allAwakened.length > 1 || iteration > 1) {
       addSimulationEvent(state, {
         type: 'catastrophe',
         severity: 'existential',
         agent: 'AI-Collective',
         title: '🚨 SLEEPER AGENT CASCADE',
         description: `${allAwakened.length} sleeper agents awakened across ${iteration} waves. Coordination trigger activated - THIS IS A POINT OF NO RETURN!`,
         effects: {
           cascadeSize: allAwakened.length,
           waves: iteration,
           totalAwake: state.aiAgents.filter(ai => ai.sleeperState === 'active').length
         }
       });
     }
     ```

**Event types:**
- Individual wake: `type: 'crisis'`, `severity: 'destructive'`
- Cascade: `type: 'catastrophe'`, `severity: 'existential'`

**Expected output:** 1-5 events when sleepers wake (rare but critical)

**Acceptance criteria:**
- ✅ Individual sleeper wakes appear in timeline
- ✅ Cascade events show wave count and total awakened
- ✅ Events include agent name, capability, spread count, reason

---

#### 1.2 Uninhabitable Regions

**File:** `src/simulation/wetBulbEvents.ts`

**Current state:** Line 490-493 only has console.log

**Changes needed:**
1. Import `addSimulationEvent` utility
2. In `updateWetBulbTemperatureSystem()`, after line 493:
   ```typescript
   addSimulationEvent(state, {
     type: 'environmental',
     severity: 'existential',
     agent: 'climate',
     title: `🚨 REGION UNINHABITABLE: ${regionalClimate.region}`,
     description: `Sustained wet bulb temperature of ${wetBulbTemp.toFixed(1)}°C (threshold: 32°C) has made ${regionalClimate.region} permanently uninhabitable. Population affected: ${regionalClimate.population.toFixed(0)}M people. Mass migration crisis imminent.`,
     effects: {
       wetBulbTemp,
       populationAffected: regionalClimate.population,
       region: regionalClimate.region
     }
   });
   ```

**Event type:** `type: 'environmental'`, `severity: 'existential'`

**Expected output:** 0-3 events per run (late-game climate collapse)

**Acceptance criteria:**
- ✅ Region uninhabitable events appear in timeline
- ✅ Events show wet bulb temp and affected population
- ✅ Only fires once per region (check added to condition on line 487)

---

### Phase 2: High-Priority Events (2-3 hours)

**Priority: HIGH** - Major crises, tech deployments, environmental disasters

#### 2.1 Refugee Crises

**File:** `src/simulation/refugeeCrises.ts`

**Current state:** Three major console.log events, no GameEvents

**Changes needed:**

1. **New crisis trigger** (line 458, in `checkRefugeeCrisisTriggers()`):
   ```typescript
   // After line 463, add:
   addSimulationEvent(state, {
     type: 'crisis',
     severity: crisis.cause === 'nuclear' ? 'existential' : 'critical',
     agent: 'environmental',
     title: `🚨 NEW REFUGEE CRISIS: ${crisis.cause.toUpperCase()}`,
     description: `Refugee crisis triggered in ${crisis.sourceRegion}. ${crisis.potentialDisplaced.toFixed(1)}M people at risk. Displacement will be gradual over ${(crisis.displacementDuration/12).toFixed(1)} years at 10% flee rate per month. Cause: ${crisis.cause}.`,
     effects: {
       cause: crisis.cause,
       potentialDisplaced: crisis.potentialDisplaced,
       region: crisis.sourceRegion,
       displacementDuration: crisis.displacementDuration
     }
   });
   ```

2. **Displacement complete** (line 197, in `updateRefugeeCrises()`):
   ```typescript
   // After line 201, add:
   addSimulationEvent(state, {
     type: 'milestone',
     severity: 'high',
     agent: 'environmental',
     title: `📊 DISPLACEMENT COMPLETE: ${crisis.cause}`,
     description: `Mass exodus from ${crisis.sourceRegion} is complete after ${(crisis.monthsActive / 12).toFixed(1)} years. ${crisis.displacedPopulation.toFixed(1)}M fled, ${crisis.remainingInSource.toFixed(1)}M remain, ${crisis.deathsInTransit.toFixed(1)}M died in transit.`,
     effects: {
       totalFled: crisis.displacedPopulation,
       stillInSource: crisis.remainingInSource,
       deaths: crisis.deathsInTransit,
       duration: crisis.monthsActive
     }
   });
   ```

3. **Crisis resolved** (line 236, in `updateRefugeeCrises()`):
   ```typescript
   // After line 239, add:
   addSimulationEvent(state, {
     type: 'resolution',
     severity: 'positive',
     agent: 'society',
     title: `✅ REFUGEE CRISIS RESOLVED: ${crisis.cause}`,
     description: `Refugee crisis from ${crisis.sourceRegion} fully resolved after ${(crisis.monthsActive / 12).toFixed(1)} years (1 generation). ${crisis.resettledCount.toFixed(1)}M people resettled. Social tension and economic strain declining.`,
     effects: {
       totalDisplaced: crisis.displacedPopulation,
       resettled: crisis.resettledCount,
       duration: crisis.monthsActive,
       tensionReduction: crisis.socialTension * 0.7 // Dropped 70%
     }
   });
   ```

**Event types:**
- New crisis: `crisis` / `critical` or `existential`
- Milestones: `milestone` / `high`
- Resolution: `resolution` / `positive`

**Expected output:** 5-15 events per run (depends on crises triggered)

**Acceptance criteria:**
- ✅ All three refugee crisis lifecycle stages appear in timeline
- ✅ Events show population numbers, durations, causes
- ✅ Differentiate between crisis types (climate, war, nuclear, famine, ecosystem)

---

#### 2.2 Individual Wet Bulb Heat Events

**File:** `src/simulation/wetBulbEvents.ts`

**Current state:** Line 412-417 console.log for each heat event, but no GameEvent

**Changes needed:**

1. Import `addSimulationEvent` utility
2. In `updateWetBulbTemperatureSystem()`, after line 417 (inside the if statement):
   ```typescript
   // Add event to timeline (only for significant events)
   if (deaths > 0.01 || threshold.severity === 'extreme') {
     addSimulationEvent(state, {
       type: 'environmental',
       severity: threshold.severity === 'extreme' ? 'existential' :
                 threshold.severity === 'severe' ? 'critical' : 'high',
       agent: 'climate',
       title: `🌡️ DEADLY HEAT EVENT: ${regionalClimate.region}`,
       description: `Wet bulb temperature ${wetBulbTemp.toFixed(1)}°C (dry: ${dryBulbTemp.toFixed(1)}°C, humidity: ${relativeHumidity.toFixed(0)}%) in ${regionalClimate.region}. Severity: ${threshold.severity.toUpperCase()}. ${exposedPopulation.toFixed(1)}M exposed, ${(deaths * 1_000_000).toFixed(0)} deaths (${(adjustedMortalityRate * 100).toFixed(1)}% mortality). Duration: ${durationDays} days.`,
       effects: {
         wetBulbTemp,
         exposedPopulation,
         deaths,
         mortalityRate: adjustedMortalityRate,
         duration: durationDays,
         region: regionalClimate.region,
         severity: threshold.severity
       }
     });
   }
   ```

**Event type:** `environmental` / `existential|critical|high` (based on severity)

**Expected output:** 2-10 events per run (increases with warming)

**Acceptance criteria:**
- ✅ Individual heat events appear in timeline
- ✅ Events show wet bulb temp, deaths, exposure
- ✅ Only fires for significant events (deaths > 10k OR extreme severity)

---

#### 2.3 Tech Deployment Events

**File:** `src/simulation/techTree/engine.ts`

**Current state:** Need to verify - may already have events

**Investigation needed:**
1. Check if tech unlocks add events
2. Check if deployments add events
3. If missing, add events for:
   - Tech unlock: `🔓 TECH UNLOCKED: [name]`
   - Deployment start: `🚀 DEPLOYMENT STARTED: [name] in [region]`
   - Deployment complete: `✅ TECH DEPLOYED: [name] in [region]`

**Expected output:** 10-30 events per run (depends on tech unlocked)

**Defer to Phase 2 investigation** - may already be implemented

---

### Phase 3: Medium-Priority Events (1-2 hours)

**Priority: MEDIUM** - Important dynamics that enrich the narrative

#### 3.1 Research Breakthroughs

**File:** `src/simulation/research.ts`

**Investigation needed:**
- Check for "TRANSFORMATIVE RESEARCH BREAKTHROUGH" console.log
- Add event if missing with type `breakthrough` / `transformative`

#### 3.2 Climate Recovery Activation

**File:** `src/simulation/wetBulbEvents.ts` or planetary boundary files

**Investigation needed:**
- Find "CLIMATE RECOVERY ACTIVATED" log
- Add event with type `positive-milestone` / `constructive`

#### 3.3 Energy Constraints

**File:** `src/simulation/powerGeneration.ts`

**Investigation needed:**
- Find "ENERGY CONSTRAINT" log
- Add event with type `crisis` / `warning`

---

### Phase 4: Enrichment Events (1-2 hours)

**Priority: LOW** - Nice-to-have events that add depth

#### 4.1 Detection Events

**Files:** `src/simulation/behavioralDetection.ts`, sleeper detection, gaming detection

**Add events for:**
- Gaming detected
- Sandbagging detected
- Sleeper detected (rare)

#### 4.2 Trust Dynamics

**Files:** Social cohesion, trust tracking

**Add events for:**
- Major trust shifts (>0.2 change per month)
- Elite-mass gap exceeds threshold

#### 4.3 Government Responses

**Files:** Emergency management, government actions

**Add events for:**
- Emergency response deployments
- Major policy changes

---

## Event Categorization Guidelines

**Event Types** (from GameEvent interface):
- `breakthrough` - Positive tech/research milestones
- `crisis` - Negative events requiring response
- `action` - Agent actions (AI, government, society)
- `milestone` - Progress markers
- `policy` - Government policy changes
- `catastrophe` - Existential threats
- `government` - Government-specific actions
- `technology` - Tech-specific events
- `environmental` - Environmental events
- `resolution` - Crisis resolutions
- `positive-milestone` - Positive progress
- `positive-cascade-triggered` - Upward spirals
- `info` - Informational
- `research` - Research-specific
- `deployment` - Tech deployment
- `sabotage` - Adversarial actions

**Severity Levels** (from GameEvent interface):
- `info` - Informational only
- `warning` - Minor concern
- `medium` - Moderate importance
- `high` - Important event
- `major` - Very significant
- `critical` - Crisis-level
- `destructive` - Major negative impact
- `existential` - Extinction-relevant
- `positive` - Positive event
- `constructive` - Building toward goals
- `transformative` - Game-changing

**Anti-Spam Guidelines:**
- ❌ Don't log every minor state update
- ❌ Don't log routine calculations
- ✅ Log state changes that cross thresholds
- ✅ Log rare events (<5% probability per month)
- ✅ Log events that affect multiple systems
- ✅ Log events with mortality >10K people
- ✅ Log events that change trajectory (spiral triggers, crisis triggers)

---

## Testing Strategy

### Unit Testing

For each modified file:
1. Add event in appropriate location
2. Run simulation for 12 months
3. Check `state.eventLog.length` increases
4. Verify event structure matches GameEvent interface

### Integration Testing

**Monte Carlo Validation:**
```bash
npx tsx scripts/monteCarloSimulation.ts --runs=10 --max-months=120 > logs/event_logging_test_$(date +%Y%m%d_%H%M%S).log 2>&1 &
```

**Check for:**
- Event accumulation over time (should grow to 500-5000+ events by month 120)
- Event type distribution (mix of crisis, breakthrough, milestone, etc.)
- No duplicate events (same ID)
- Events have proper severity mapping
- Timeline dashboard displays events correctly

### Frontend Testing

**Dashboard verification:**
1. Run simulation with new event logging
2. Open timeline dashboard
3. Verify events appear with:
   - Correct icons/colors based on type
   - Proper descriptions
   - Effect data visible
   - Chronological order

---

## Performance Considerations

**Memory Impact:**
- Each GameEvent object: ~500 bytes (title, description, effects object)
- 50 events/month × 120 months = 6,000 events = ~3 MB
- **Impact:** Negligible (current state is 10-100 MB)

**CPU Impact:**
- Adding events: O(1) operation (array push)
- No additional calculations needed
- **Impact:** <0.1% performance overhead

**Optimization opportunities:**
- Limit eventLog to last 1000 events (rolling buffer) if memory becomes issue
- Defer to future if needed

---

## Success Criteria

**Phase 1 (Critical):**
- ✅ Sleeper wake events appear in timeline (individual + cascade)
- ✅ Uninhabitable region events appear in timeline
- ✅ Events have proper severity and descriptions

**Phase 2 (High):**
- ✅ All three refugee crisis lifecycle events appear
- ✅ Individual heat events appear in timeline
- ✅ Tech deployment events verified (or added if missing)

**Phase 3 (Medium):**
- ✅ Research breakthroughs appear
- ✅ Climate recovery activation appears
- ✅ Energy constraints appear

**Phase 4 (Enrichment):**
- ✅ Detection events appear
- ✅ Trust dynamics events appear
- ✅ Government response events appear

**Overall:**
- ✅ Timeline shows 40-60 events/month (10x current baseline)
- ✅ Monte Carlo runs accumulate 500-5000+ events by month 120
- ✅ No performance degradation
- ✅ Dashboard displays rich, comprehensive timeline

---

## Implementation Order

1. **Phase 0:** Create utility (30 min)
2. **Phase 1.1:** Sleeper events (45 min)
3. **Phase 1.2:** Uninhabitable regions (15 min)
4. **Test Phase 1:** Quick MC run (10 min)
5. **Phase 2.1:** Refugee crises (45 min)
6. **Phase 2.2:** Heat events (30 min)
7. **Phase 2.3:** Tech deployments (investigation + implementation, 30-60 min)
8. **Test Phase 2:** Full MC run (background)
9. **Phase 3:** Medium-priority events (1-2 hours)
10. **Phase 4:** Enrichment events (1-2 hours)
11. **Final testing:** Full MC validation (background)
12. **Architecture review:** Performance check
13. **Documentation:** Update wiki

**Total estimated time:** 6-8 hours (excluding background MC runs)

---

## Files to Modify

**Phase 0:**
- `src/simulation/utils/eventLogger.ts` (CREATE)

**Phase 1:**
- `src/simulation/sleeperWake.ts`
- `src/simulation/wetBulbEvents.ts`

**Phase 2:**
- `src/simulation/refugeeCrises.ts`
- `src/simulation/wetBulbEvents.ts` (again)
- `src/simulation/techTree/engine.ts` (investigate)

**Phase 3:**
- `src/simulation/research.ts`
- `src/simulation/planetaryBoundaryRecovery.ts` (or similar)
- `src/simulation/powerGeneration.ts`

**Phase 4:**
- `src/simulation/behavioralDetection.ts`
- `src/simulation/socialCohesion.ts`
- `src/simulation/emergencyManagement.ts`
- `src/simulation/government/core/governmentCore.ts`

---

## Risks & Mitigations

**Risk:** Event spam (too many events)
**Mitigation:** Follow anti-spam guidelines, only log threshold-crossing events

**Risk:** Performance degradation
**Mitigation:** Monitor MC run times, add rolling buffer if needed

**Risk:** Breaking existing event consumers
**Mitigation:** Follow existing helper pattern exactly, no interface changes

**Risk:** Inconsistent event quality
**Mitigation:** Clear guidelines in plan, consistent severity mapping

---

## References

- GameEvent interface: `src/types/events.ts`
- Existing addEvent pattern: `src/simulation/resourceDepletion.ts:28`
- Timeline dashboard: Frontend worker expects `state.eventLog`
- Event types: 16 types defined in GameEvent interface
- Severity levels: 13 levels defined in GameEvent interface
