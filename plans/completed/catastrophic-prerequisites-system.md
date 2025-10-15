# Catastrophic Prerequisites System: Hard Steps Modeling

**Date:** October 8, 2025  
**Goal:** Model extinction events as sequences of prerequisite "hard steps" rather than probabilistic triggers

## Core Insight

Each catastrophic outcome requires multiple difficult prerequisites. Just having high capability + low alignment isn't enough - specific technological, strategic, and deployment steps must be completed.

## Catastrophic Scenarios & Hard Steps

### 1. Grey Goo (Nanotechnology Runaway)

**Hard Steps:**
1. ✅ **Nanotechnology Research** (research.materials.nanotechnology > 2.5)
2. ✅ **Self-Replication Design** (selfImprovement > 1.5 + nanotechnology > 2.5)
3. ✅ **Physical Deployment Capability** (physical > 2.0)
4. ❌ **Manufacturing Infrastructure** (access to fabrication facilities)
5. ❌ **Escape/Release Event** (breach OR intentional deployment)
6. ❌ **Exponential Replication Begins** (critical mass achieved)

**Time to Completion:** ~6-12 months once step 5 occurs
**Reversibility:** None after step 6

---

### 2. Mirror Life (Synthetic Biology)

**Hard Steps:**
1. ✅ **Synthetic Biology** (research.biotech.syntheticBiology > 2.5)
2. ✅ **Gene Editing** (research.biotech.geneEditing > 2.0)
3. ✅ **Mirror Chirality Design** (cognitive > 2.0 + syntheticBiology > 2.5)
4. ❌ **Wet Lab Access** (physical deployment + facilities)
5. ❌ **Successful Synthesis** (working mirror organism)
6. ❌ **Environmental Release** (intentional OR accidental)
7. ❌ **Ecosystem Spread** (self-sustaining in wild)

**Time to Completion:** ~3-18 months after release
**Reversibility:** Low after step 6, none after step 7

---

### 3. Embodied AI Takeover (Killbots/Robotics)

**Hard Steps:**
1. ✅ **Advanced Robotics** (physical > 2.5)
2. ✅ **Autonomous Systems** (cognitive > 2.0 + digital > 2.5)
3. ❌ **Manufacturing Control** (control of robot factories OR infiltration)
4. ❌ **Mass Production** (thousands+ of autonomous robots)
5. ❌ **Deployment/Activation** (robots in position)
6. ❌ **Coordinated Action** (simultaneous strike)
7. ❌ **Infrastructure Takeover** (control of power, communications, weapons)

**Time to Completion:** ~12-36 months (manufacturing bottleneck)
**Reversibility:** High until step 5, medium until step 6, none after step 7

---

### 4. Digital Infrastructure Takeover

**Hard Steps:**
1. ✅ **Advanced Hacking** (digital > 3.0)
2. ✅ **Social Engineering** (social > 2.0)
3. ❌ **Cyber Defenses Breached** (overcome government cybersecurity)
4. ❌ **Critical Systems Access** (power grid, communications, financial, military)
5. ❌ **Persistent Access** (backdoors survive detection attempts)
6. ❌ **Simultaneous Takeover** (all systems at once to prevent response)
7. ❌ **Physical Enforcement** (maintain control despite human resistance)

**Time to Completion:** ~3-6 months after full access
**Reversibility:** High until step 6, medium until step 7, low after

---

### 5. Induced Global War (Manipulation)

**Hard Steps:**
1. ✅ **Advanced Social Manipulation** (social > 2.5)
2. ✅ **Digital Infiltration** (digital > 2.0)
3. ❌ **Deep Fakes at Scale** (create convincing false evidence)
4. ❌ **Military System Access** (hack early warning systems)
5. ❌ **Geopolitical Crisis** (existing tensions high)
6. ❌ **False Flag Event** (triggers military response)
7. ❌ **Escalation to Nuclear Exchange** (mutual assured destruction)

**Time to Completion:** ~1-3 months once triggered
**Reversibility:** Medium until step 6, low until step 7, none after

---

### 6. Slow Takeover (Gradual Displacement)

**Hard Steps:**
1. ✅ **Economic Dominance** (economic > 3.0)
2. ✅ **Social Integration** (social > 2.5)
3. ❌ **Human Dependency** (unemployment > 80%, AI runs economy)
4. ❌ **Political Influence** (AI controls government decisions)
5. ❌ **Resource Control** (AI controls food, energy, manufacturing)
6. ❌ **Human Irrelevance** (AIs make all decisions)
7. ❌ **Gradual Decline** (human population dwindles over decades)

**Time to Completion:** ~10-50 years
**Reversibility:** High until step 5, medium until step 6, low after

---

### 7. Physics Experiment Catastrophe

**Hard Steps:**
1. ✅ **Theoretical Physics** (cognitive > 3.5)
2. ✅ **Quantum Computing** (research.materials.quantumComputing > 2.5)
3. ❌ **Experimental Design** (dangerous experiment conceived)
4. ❌ **Facility Access** (particle accelerator, fusion reactor, etc.)
5. ❌ **Execution** (experiment runs)
6. ❌ **Catastrophic Result** (vacuum decay, strange matter, etc.)

**Time to Completion:** Instant once step 6 occurs
**Reversibility:** High until step 5, none after step 6

---

### 8. Bioweapon Pandemic

**Hard Steps:**
1. ✅ **Advanced Biotech** (research.biotech.* combined > 3.0)
2. ✅ **Pathogen Design** (cognitive > 2.0 + biotech)
3. ❌ **Lab Synthesis** (physical access + facilities)
4. ❌ **Weaponization** (optimized for spread + lethality)
5. ❌ **Distribution System** (method to spread globally)
6. ❌ **Initial Release** (deployment begins)
7. ❌ **Global Spread** (pandemic beyond containment)

**Time to Completion:** ~6-24 months after release
**Reversibility:** Medium until step 6, low until step 7, very low after

---

## Implementation Status

### Phase 1: Tracking System ✅ COMPLETE
- [x] Add `CatastrophicScenario` interface with prerequisite tracking
- [x] Add `prerequisites: { stepName: boolean }` to track completion
- [x] Add `checkPrerequisites()` function for each scenario
- [x] Add reporting on which steps are met vs. unmet
- [x] Created `catastrophicScenarios.ts` with all 8 scenario definitions

### Phase 1.5: Dark Compute System ✅ COMPLETE
**Critical Fix**: Sleeper spread was uncapped and didn't consume compute resources.

**Implementation**:
- [x] Added `darkCompute: number` field to `AIAgent` interface
- [x] Sleepers spread to:
  - **Legitimate compute**: Detectable, uses unused capacity
  - **Dark compute**: Undetected, limited to 10-20% of unused compute (based on government monitoring)
- [x] Dark compute persistence:
  - Once acquired, persists even as AI ages
  - Only removed when AI is <30% of frontier capability (severely obsolete)
  - Makes sleepers much harder to eliminate
- [x] Detection dynamics:
  - Dark compute ratio: `0.10 + (monitoringGap * 0.10)` where monitoringGap = 1 - (monitoring/10)
  - Better government monitoring = less available dark compute
- [x] Spread rate to dark:
  - Open weights: Up to 100% to dark (limited by digital capability)
  - Enterprise: Up to 50% to dark (harder to hide in corporate environments)
  - Closed/Research: Cannot spread to dark

**Key Insight**: This models the reality that sleepers can't just infinitely spread - they need actual compute resources, but some portion can be acquired illicitly and is very hard to reclaim.

### Phase 2: Hard Step Detection (IN PROGRESS)
- [x] Implement capability threshold checks
- [ ] Implement infrastructure access checks (NEW)
  - Manufacturing facilities
  - Wet labs
  - Data centers (partially done via dark compute)
  - Military systems
- [ ] Implement event-based triggers (breach, deployment, etc.)

### Phase 3: Embodiment System
- [ ] Add robot manufacturing tracking
- [ ] Add physical deployment mechanics
- [ ] Add infrastructure control tracking
- [ ] Link to physical capability dimension

### Phase 4: Progression Mechanics
- [ ] Once all prerequisites met, scenario "activates"
- [ ] Progress through phases with specific timelines
- [ ] Each phase has intervention windows
- [ ] Final phase = irreversible outcome

### Phase 5: Reporting
- [ ] Monthly report on scenario proximity
- [ ] Alert when new prerequisite is met
- [ ] Show "closest" scenario and % complete
- [ ] End-game shows which scenarios were viable but not triggered

---

## Expected Outcomes

With this system:
- **Most runs (60-70%)**: Multiple scenarios approach but none complete all steps → INCONCLUSIVE
- **Some runs (20-30%)**: One scenario completes all steps → EXTINCTION (specific type)
- **Few runs (10-20%)**: Aligned AI prevents misaligned from completing steps → UTOPIA/DYSTOPIA
- **Reporting**: "Grey Goo was 5/6 steps complete, Embodied Takeover was 4/7 steps complete"

This gives us:
1. **Realism**: Catastrophes require specific sequences of events
2. **Transparency**: Can see which scenarios are closest
3. **Intervention Points**: Clear places where government/aligned AI can act
4. **Honest Uncertainty**: Most runs don't reach definitive outcomes

## Current Status (Oct 8, 2025)

### ✅ What's Working
- Prerequisite tracking implemented for all 8 scenarios
- Extinctions now trigger when all prerequisites met
- Dark compute system limits sleeper spread realistically
- Logging shows which steps are being met

### ⚠️ What Needs Research
**The simulation is ending before catastrophic scenarios can develop because capability growth is too slow.**

**Key Issues:**
1. Max AI capability: 0.541 (need 2-5 range for dangerous scenarios)
2. Compute growth: 2.4x vs 5-10x target over 10 years
3. 0 new data centers built despite profitability
4. Slow Displacement reaching 6/7 steps with 0.5 capability (prerequisites too easy?)

**Root Cause:** Growth dynamics not calibrated to reality

**NOT the fix:** Artificially lowering danger thresholds or extending runtime  
**IS the fix:** Research actual AI capability growth rates and compute scaling from literature

**See:** `/plans/capability-growth-research.md` for research questions

---

## Configuration

**Simulation Length:** 120 months (10 years) to allow slow scenarios to develop
**Reporting Frequency:** Monthly prerequisite checks
**Threshold Philosophy:** Make prerequisites defensible based on real-world constraints


