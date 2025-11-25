# Scenario Analysis Framework - Phase 1: Diagnostic Infrastructure
**Implementation Plan**

**Date:** 2025-11-13
**Priority:** HIGH (blocks understanding of spiral mechanics)
**Owner:** simulation-maintainer + priya (Monte Carlo validation)

---

## Problem Statement

God mode analysis revealed catastrophic failure despite deploying ALL 73 technologies:
- 30% population mortality
- Dystopia outcomes
- Only biosphere integrity shows 81.5% effectiveness; all others near-zero

### Critical Hypothesis

**Technology alone doesn't trigger spirals** - specific governance/social/political conditions required.

The model HAS three spiral systems (verified by Sylvia in `research/GOD_MODE_ANALYSIS_model_mechanisms_20251110.md`):
1. **Upward Spirals** (`src/simulation/upwardSpirals.ts`) - 6 positive feedback loops
2. **Cooperative Spirals** (`src/simulation/cooperativeSpirals.ts`) - alignment → trust cascades
3. **Positive Tipping Points** (`src/simulation/positiveTippingPoints.ts`) - S-curve adoption

But they aren't activating in god mode. **WHY?**

---

## Current State (Code Review Findings)

### ✅ Existing Infrastructure

1. **Scenario System** - ALREADY IMPLEMENTED
   - `src/types/scenarios.ts` - Interface definitions ✅
   - `SCENARIO_CATALOG` - Predefined scenarios ✅
   - `scripts/godModeTest.ts` - Supports scenario parameter (line 16-27) ✅

2. **Spiral Diagnostics** - ALREADY IMPLEMENTED (but commented out)
   - `src/simulation/upwardSpirals.ts` lines 692-789 - `logSpiralDiagnostics()` function ✅
   - Shows exact threshold checks for all 6 spirals ✅
   - Logs WHY each spiral is inactive ✅
   - Currently commented out (lines 704-788) to reduce log noise

3. **Cooperative Spiral Detection** - ALREADY IMPLEMENTED
   - `src/simulation/cooperativeSpirals.ts` lines 32-61 - `detectAlignmentSuccessMilestones()` ✅
   - 4 milestone criteria with clear thresholds ✅

### ❌ Missing Infrastructure

1. **Spiral logging NOT enabled in god mode test**
   - God mode runs simulation but doesn't output spiral diagnostics
   - Need to enable detailed logging to file (not console)

2. **No time-series spiral tracking**
   - Diagnostics run every 12 months but don't accumulate history
   - Can't see spiral activation over time

3. **No cooperative spiral diagnostics**
   - Upward spirals have extensive logging (commented out)
   - Cooperative spirals only log when triggered (line 118-120)
   - Need diagnostic logging for WHY cooperative spirals DON'T trigger

4. **No positive tipping point diagnostics**
   - Need to verify this file exists and add logging

---

## Implementation Tasks

### Task 1: Enable Spiral Diagnostics in God Mode Test (HIGH Priority - Blocking)

**File:** `scripts/godModeTest.ts`

**Implementation:**
1. Create diagnostic log file at start:
   ```typescript
   const logPath = `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/logs/god_mode_spiral_diagnostics_${new Date().toISOString().replace(/[:.]/g, '-')}.log`;
   const logStream = fs.createWriteStream(logPath, { flags: 'w' });
   ```

2. Add monthly spiral diagnostic callback:
   ```typescript
   // After each step, log spiral state
   engine.step();  // existing

   // NEW: Log spiral diagnostics every month (not just every 12)
   logSpiralDiagnosticsToFile(state, logStream);
   ```

3. Create `logSpiralDiagnosticsToFile()` helper:
   - Call existing `logSpiralDiagnostics()` but write to file instead of console
   - Add cooperative spiral diagnostics
   - Add positive tipping point diagnostics (if applicable)
   - Track activation history over time

**Key Data to Log Per Month:**
```
Month ${currentMonth}:
  Upward Spirals:
    Abundance: ${active ? '✅' : '❌'} | Strength: ${strength} | MonthsActive: ${monthsActive}
      - Material: ${materialAbundance} (need >1.5) ${check}
      - Energy: ${energyAvailability} (need >1.5) ${check}
      - Time Liberation: unemployment ${unemployment}%, stage ${stage} (need >60% + stage 3+) ${check}
    [... repeat for all 6 spirals ...]

  Cooperative Spirals:
    Milestones: ${milestonesAchieved}/4 (need 2+)
      - No misaligned AIs (24+ mo): ${check}
      - Transparency + integrity: ${check}
      - Alignment gap <0.15: ${check}
      - Crisis resolved: ${check}

  Cascade State:
    Virtuous cascade: ${cascadeActive ? '✅' : '❌'} | Strength: ${cascadeStrength}x
    Active spirals: ${activeSpiralNames.join(', ')}
```

**Output:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/logs/god_mode_spiral_diagnostics_YYYYMMDD_HHMMSS.log`

---

### Task 2: Uncomment and Enhance Existing Diagnostics (MEDIUM Priority)

**File:** `src/simulation/upwardSpirals.ts`

**Implementation:**
1. Uncomment diagnostic logs (lines 704-788)
2. Add parameter to control verbosity:
   ```typescript
   function logSpiralDiagnostics(state: GameState, currentMonth: number, verbose: boolean = false): void
   ```
3. Always log summary (lines 717-720)
4. Only log detailed breakdowns if `verbose === true` (lines 722-788)
5. Export function for use by god mode test

**Research Validation:**
- Line 109-121: Material abundance >1.5, energy >1.5, time liberation (unemployment >60% + stage 3)
  - **RESEARCH NEEDED:** Are these thresholds justified?
- Line 150: Disease burden <0.3, healthcare >0.8
  - **RESEARCH NEEDED:** Justification for these thresholds?
- Line 190-193: Governance quality >0.7, participation >0.6, transparency >0.7
  - **RESEARCH NEEDED:** Source for these thresholds?

**Action for research-skeptic (Sylvia):** Validate all threshold values against peer-reviewed sources.

---

### Task 3: Add Cooperative Spiral Diagnostics (MEDIUM Priority)

**File:** `src/simulation/cooperativeSpirals.ts`

**Implementation:**
1. Add diagnostic logging function similar to upward spirals:
   ```typescript
   export function logCooperativeSpiralDiagnostics(state: GameState, currentMonth: number, verbose: boolean = false): void {
     const milestones = {
       noMisalignedDeployments: ...,
       transparencySuccess: ...,
       alignmentGap: ...,
       crisisAvoided: ...
     };

     // Log each milestone status and why it's not met
     console.log(`\n🤝 COOPERATIVE SPIRAL DIAGNOSTICS`);
     console.log(`   Milestones: ${Object.values(milestones).filter(Boolean).length}/4 (need 2+)`);
     // ... detailed checks ...
   }
   ```

2. Call from god mode test monthly logging

---

### Task 4: Add Positive Tipping Point Diagnostics (MEDIUM Priority)

**File:** `src/simulation/positiveTippingPoints.ts` (verify file exists)

**Implementation:**
1. Check if file exists, if not, document in findings
2. If exists, add diagnostic logging for:
   - S-curve adoption progress
   - Learning curve acceleration
   - Tipping point proximity

---

### Task 5: Monte Carlo Validation (HIGH Priority - Quality Gate)

**Owner:** priya

**Objective:** Validate that diagnostic logging works and captures spiral activation failures

**Tasks:**
1. Run N≥10 god mode simulations with different seeds
2. Parse diagnostic logs to extract:
   - Max number of spirals ever active simultaneously
   - Longest cascade duration
   - Most common blocking factors for each spiral
3. Statistical analysis:
   - Are spiral activation rates <5%? (If so, thresholds too strict)
   - Which spirals NEVER activate? (Priority for investigation)
   - Is there variance across seeds? (Confirms determinism working)
4. Generate summary report: `reviews/spiral_diagnostics_validation_YYYYMMDD.md`

**Success Criteria:**
- ✅ Logs successfully capture spiral activation state monthly
- ✅ Logs show WHY spirals don't activate (threshold checks)
- ✅ Variance across seeds confirms determinism
- ✅ Clear identification of blocking factors

---

## Expected Outcomes

1. **Diagnostic logs revealing WHY spirals aren't activating in god mode**
   - Which threshold checks are failing?
   - Is it material abundance? Time liberation? Governance quality?

2. **Infrastructure to test "governance sufficiency" vs "technology sufficiency"**
   - Already exists via scenario system!
   - Just need to add logging to observe spiral behavior under scenarios

3. **Baseline understanding of spiral mechanics before implementing Phase 2**
   - Phase 2 will add core scenarios (Climate First, Equality First, etc.)
   - Need to understand current blocking factors first

---

## Quality Gates

### Gate 1: Research Validation (research-skeptic)
- [ ] Spiral thresholds validated against peer-reviewed sources
- [ ] Any arbitrary-seeming thresholds flagged for revision
- [ ] Research citations added to spiral files

### Gate 2: Monte Carlo Validation (priya)
- [ ] N≥10 runs with diagnostic logging
- [ ] Logs successfully capture activation failures
- [ ] Statistical summary of blocking factors
- [ ] Determinism confirmed (CV < 0.01% for key metrics)

### Gate 3: Architecture Review (architecture-skeptic)
- [ ] Scenario system extensible for Phase 2
- [ ] Diagnostic logging doesn't impact performance (file I/O async)
- [ ] No circular dependencies in spiral detection

---

## File Manifest

**Existing Files (Review):**
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/upwardSpirals.ts` - Upward spiral logic + diagnostics (commented out)
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/cooperativeSpirals.ts` - Cooperative spiral logic
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/positiveTippingPoints.ts` - Tipping point logic (verify exists)
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/types/scenarios.ts` - Scenario interface (already implemented ✅)
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/scripts/godModeTest.ts` - God mode test script

**New Files (Create):**
- None required! Infrastructure mostly exists, just needs activation.

**Output Files:**
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/logs/god_mode_spiral_diagnostics_YYYYMMDD_HHMMSS.log` - Diagnostic output

---

## Research Context

**Key Documents:**
- `research/GOD_MODE_ANALYSIS_model_mechanisms_20251110.md` - Spiral systems verification (Sylvia)
- `research/SKEPTICAL_ANALYSIS_doom_predictions_20251110.md` - Adaptive capacity analysis (Sylvia)
- `reviews/god_mode_gaps_research_roadmap_20251109.md` - Gap analysis showing 0% effectiveness for novel entities

**Spiral Activation Conditions (from code review):**

### Upward Spirals (requires 3+ sustained 12+ months):
1. **Abundance:** materialAbundance >1.5 AND energyAvailability >1.5 AND unemployment >0.6 + economicStage ≥3
2. **Cognitive:** diseasesBurden <0.3 AND healthcareQuality >0.8 AND meaningCrisis <0.3 AND demonstratedBenefits + trust >0.7
3. **Democratic:** decisionQuality >0.7 AND institutionalCapacity >0.7 AND participationRate >0.6 AND transparency >0.7 AND NOT authoritarian
4. **Scientific:** deployedTech ≥4 AND researchBudget >$50B/mo AND avgAI >1.2 AND workflowAdaptation ≥0.25
5. **Meaning:** meaningCrisis <0.2 AND socialCohesion >0.7 AND culturalAdaptation >0.7 AND autonomy >0.7 + culturalVitality >0.7
6. **Ecological:** [need to read this section]

### Cooperative Spirals (requires 2+ milestones):
- No misaligned AIs deployed for 24+ months
- High transparency (>0.7) + information integrity (>0.6)
- Low alignment gap (<0.15)
- Successfully resolved crisis with AI assistance

### Virtuous Cascade (cross-amplification):
- 4+ spirals active → 1.0-2.0× multiplier on breakthrough research, governance quality, etc.

---

## Next Steps

1. **simulation-maintainer:** Implement Task 1 (enable diagnostics in god mode)
2. **simulation-maintainer:** Implement Tasks 2-4 (enhance existing diagnostics)
3. **research-skeptic (Sylvia):** Validate spiral thresholds (Gate 1)
4. **priya:** Monte Carlo validation with N≥10 runs (Gate 2)
5. **architecture-skeptic:** Review extensibility for Phase 2 (Gate 3)
6. **wiki-documentation-updater (historian):** Document findings in wiki

**Estimated Timeline:** 4-6 hours of implementation + 2-4 hours validation

---

## Success Criteria

- ✅ Understand root cause of god mode failure
- ✅ Can identify which spiral thresholds are blocking utopia
- ✅ Validated spiral mechanics against research
- ✅ Infrastructure ready for Phase 2 scenario implementation
- ✅ Can test "governance sufficiency" hypothesis systematically
