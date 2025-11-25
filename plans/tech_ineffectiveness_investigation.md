# Tech Ineffectiveness Investigation Plan

**Date:** November 25, 2025
**Priority:** CRITICAL - Blocking governance experiments
**Analyst:** Orchestrator
**Assigned to:** simulation-maintainer (Roy) + priya

## Problem Statement

**Context from Priya's analysis (reviews/governance_scenario_sequenced_analysis_20251125.md):**
- 119 technologies deployed in sequenced fashion (TIER 0-4 over 24 months)
- Result: ~99% mortality, 100% GDP collapse crash rate (60/60 runs)
- Tech deployment SHOULD provide substantial benefits but appears ineffective

**This is blocking ALL governance experiments.**

## Key Questions to Answer

1. **Are tech effects being applied correctly?**
   - Do deployed techs actually modify state?
   - Are effect magnitudes reaching the target systems?

2. **What are the effect magnitudes?**
   - Typical tech effect sizes vs cascade magnitudes
   - Are improvements large enough to matter?

3. **Is there a timing mismatch?**
   - When do techs deploy vs when do cascades hit?
   - Do cascades overwhelm tech before benefits accumulate?

4. **Are there feedback loops?**
   - Do cascading failures overwhelm tech improvements?
   - Are there multiplicative effects that tech can't overcome?

## Investigation Phases

### Phase 1: Code Trace - Tech Effect Application (Roy)

**Goal:** Verify that tech effects are being applied to relevant systems

**Files to investigate:**
- `src/simulation/systems/techTree/` - Tech definitions and effect specifications
- `src/simulation/phases/TechDeploymentPhase.ts` - Where techs are deployed
- System phases that should consume tech effects:
  - Climate system phases
  - Agriculture/food security phases
  - Ecology phases
  - Mortality phases
  - Resources phases
  - Government phases

**Tasks:**
1. Read tech tree definitions - what effects do the 119 techs claim to provide?
2. Trace tech deployment phase - does it actually apply effects to state?
3. Check system phases - do they read tech effects from state?
4. Create code trace diagram showing data flow: tech definition → deployment → state → consumption

**Output:**
- Code trace report: `reviews/tech_effectiveness_code_trace_20251125.md`
- Answer: Are effects being applied? YES/NO + evidence

### Phase 2: Magnitude Analysis - Tech vs Cascades (Roy + Priya)

**Goal:** Compare tech effect magnitudes to cascade magnitudes

**Approach:**
1. Extract typical tech effect sizes from definitions
   - Example: "Reduces climate damage by 15%"
   - Example: "Increases food production by 20%"
2. Extract typical cascade magnitudes from system code
   - Example: "Climate mortality multiplier: 2.5×"
   - Example: "Agricultural collapse reduces food by 60%"
3. Calculate ratio: tech_effect / cascade_effect

**Tasks:**
1. Create spreadsheet of all 119 tech effects with magnitudes
2. Create spreadsheet of cascade effects by system
3. Calculate effectiveness ratios
4. Identify if tech effects are systematically too small

**Output:**
- Magnitude analysis: `reviews/tech_cascade_magnitude_analysis_20251125.md`
- Answer: Are tech effects large enough? YES/NO + ratio data

### Phase 3: Timing Analysis - Deployment vs Cascade Onset (Roy)

**Goal:** Understand temporal relationship between tech deployment and cascades

**Approach:**
1. Review sequenced deployment schedule:
   - TIER 0: 50 techs at month 0
   - TIER 1: 8 techs at month 6
   - TIER 2: 36 techs at month 12
   - TIER 3: 18 techs at month 18
   - TIER 4: 7 techs at month 24
2. Review cascade onset times from logs:
   - When do mortality cascades begin?
   - When do planetary boundaries breach?
   - When does GDP begin declining?
3. Compare timelines

**Tasks:**
1. Extract cascade onset times from typical run log
2. Plot tech deployment timeline vs cascade timeline
3. Identify if cascades occur BEFORE tech can have effect
4. Check if there are tech effectiveness delays (e.g., infrastructure takes time)

**Output:**
- Timing analysis: `reviews/tech_cascade_timing_analysis_20251125.md`
- Answer: Is timing the problem? YES/NO + timeline data

### Phase 4: Diagnostic Script - Effects Over Time (Roy + Priya)

**Goal:** Create script showing tech effects vs collapse metrics throughout simulation

**Script should output:**
- Month-by-month timeline (0-250)
- Columns:
  - Techs deployed (count)
  - Tech effect applied (climate, agriculture, etc.)
  - Cascade severity (climate, biosphere, etc.)
  - Mortality rate (monthly)
  - GDP (current)
  - Net effect (tech improvement - cascade damage)

**Implementation:**
1. Create `scripts/techEffectivenessTimeline.ts`
2. Run single governance scenario with detailed logging
3. Extract metrics at each step
4. Output CSV for analysis
5. Create visualization

**Output:**
- Script: `scripts/techEffectivenessTimeline.ts`
- Data: `logs/tech_effectiveness_timeline_YYYYMMDD.csv`
- Visualization showing why tech isn't preventing collapse

## Decision Tree

### If effects NOT being applied correctly:
→ **BUG:** Fix tech deployment phase to properly apply effects
→ **Owner:** Roy
→ **Timeline:** 1-2 hours

### If effects too small vs cascades:
→ **CALIBRATION:** Research-backed parameter adjustment needed
→ **Owner:** super-alignment-researcher + research-skeptic
→ **Timeline:** 4-8 hours (need peer-reviewed sources)

### If timing mismatch:
→ **DESIGN:** May need phased tech effectiveness (ramp-up time)
→ **Owner:** Roy + architect
→ **Timeline:** 2-4 hours

### If feedback loops overwhelming:
→ **MODEL BEHAVIOR:** May be expected - document with research justification
→ **Owner:** research-skeptic + priya
→ **Timeline:** 2-4 hours

### If multiple issues:
→ **COMPLEX:** Address in priority order (bugs first, then calibration, then design)
→ **Owner:** Orchestrator coordinates
→ **Timeline:** 8-16 hours

## Success Criteria

**Must deliver:**
1. Clear root cause(s) identified with evidence
2. Either:
   - Bug fixes implemented + Monte Carlo validation, OR
   - Parameter adjustments with research justification, OR
   - Documentation that this is expected model behavior with research backing
3. Governance experiments can proceed

**Deliverables:**
- Code trace report
- Magnitude analysis report
- Timing analysis report
- Diagnostic script + visualization
- Final recommendation with specific actions

## Coordination

**Channels:**
- Post progress to `.claude/chatroom/channels/implementation.md`
- Alert blockers to `.claude/chatroom/channels/coordination.md`
- Research needs to `.claude/chatroom/channels/research.md`

**Agents:**
- **Primary:** simulation-maintainer (Roy) - code investigation
- **Support:** priya - quantitative validation
- **If needed:** super-alignment-researcher (Cynthia) - parameter research
- **If needed:** research-skeptic (Sylvia) - validate parameter changes

## Timeline

**Phase 1 (Code Trace):** 2-3 hours
**Phase 2 (Magnitudes):** 2-3 hours
**Phase 3 (Timing):** 1-2 hours
**Phase 4 (Diagnostic):** 2-4 hours

**Total:** 7-12 hours for complete investigation

**Expected completion:** November 25, 2025 EOD or November 26 morning

---

**Status:** READY FOR EXECUTION
**Next:** simulation-maintainer begins Phase 1 code trace
