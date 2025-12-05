# Game Implementation Orchestration Spec

**Created:** 2025-12-04
**Priority:** CRITICAL
**Deadline:** End of week (2025-12-07)
**Spawned by:** Architect (PM escalation)

---

## Problem Statement

**User issue:** Deployed demo at http://34.32.105.178/game-dashboard-demo shows research simulation interface, not playable game.

**Root cause:** Game layer architecture exists (Phase 1 complete) but player influence mechanics are not implemented (Phases 2-4 incomplete).

**User feedback:**
- "Load Mock Data button is bullshit"
- "Everything starts at 50 and doesn't change"
- "This is the research tool, this is not the game"

---

## Current State

### ✅ Complete (Phase 1)
- `src/game/` directory structure (17 files)
- GameSession, SimulationRunner, GameStateProvider
- InfluenceCalculator (skeleton)
- Scenario types defined (baseline, optimistic, pessimistic)
- Module boundary rules (Sylvia-approved)

### ❌ Incomplete (Phases 2-4)
- Player influence mechanics (advocacy actions don't affect simulation)
- Research scenario calibration (scenarios defined but not parameterized)
- UI integration (action buttons, decision queue, probability viz missing)
- Monte Carlo validation (player agency bounds not tested)

---

## Required Work (Phases 2-4)

### Phase 2: Player Agency System

**Objective:** Implement indirect influence mechanics that respect research integrity.

**Tasks:**
1. **Advocacy Action Catalog** (Roy + Sylvia)
   - Define 8-12 advocacy actions with bounded effects
   - Each action: name, description, influence domains, magnitude bounds
   - Research justification for effect sizes (Sylvia approval required)
   - Examples:
     - "AI Safety Public Awareness Campaign" → +5-15% safety sentiment over 6 months
     - "US-China AI Dialogue" → +10-20% international cooperation probability

2. **InfluenceCalculator Integration** (Roy)
   - Wire InfluenceCalculator to GameSession.queueAdvocacyAction()
   - Implement influence domain mapping (ai_policy, climate_action, social_cohesion, international_cooperation, research_direction)
   - Add cooldown system (prevent spam)
   - Add currency costs (reputation, political capital)

3. **Decision Queue UI** (Tessa + Roy)
   - Add action buttons to game dashboard
   - Show pending decisions with urgency indicators
   - Display influence costs and cooldowns
   - Wire buttons to GameStateProvider.queueAdvocacyAction()

4. **Tutorial Content** (Ray + Sylvia)
   - Explain indirect influence vs direct control
   - Frame uncertainty ("shift probability" not "guarantee outcome")
   - Simplification audit (Sylvia approval required)

**Deliverables:**
- `src/game/data/advocacyActions.ts` - Action catalog with research citations
- `src/game/core/InfluenceCalculator.ts` - Complete implementation
- `src/components/dashboards/game/ActionPanel.tsx` - Action buttons UI
- Tutorial script (500-800 words, Sylvia-approved)

**Quality Gate:** Sylvia approves all effect magnitudes and tutorial text.

---

### Phase 3: Research Scenarios

**Objective:** Implement validated research scenarios as alternative starting conditions.

**Tasks:**
1. **Scenario Parameter Extraction** (Cynthia + Sylvia)
   - Baseline: Median expert forecasts (RCP 4.5, current AI trajectory)
   - Optimistic: Upper bounds from uncertainty ranges (Paris targets met, high alignment progress)
   - Pessimistic: Lower bounds from uncertainty ranges (RCP 8.5, fast takeoff)
   - Extract parameters from research papers
   - Document sources in `research/game_scenarios_YYYYMMDD.md`

2. **Scenario Implementation** (Roy)
   - Update `src/game/scenarios/*.ts` with research-backed parameters
   - Wire ResearchScenarioId to simulation initialization
   - Apply scenario modifiers to initial state
   - Validate scenarios load correctly

3. **Monte Carlo Validation** (Priya)
   - Run N=100 simulations per scenario
   - Verify outcome distributions within 15% of baseline
   - Check player agency bounds (no single action shifts outcomes >20%)
   - Document results in `reviews/game_scenario_validation_YYYYMMDD.md`

**Deliverables:**
- `research/game_scenarios_YYYYMMDD.md` - Parameter sources with citations
- Updated scenario files: `src/game/scenarios/*.ts`
- Validation report: `reviews/game_scenario_validation_YYYYMMDD.md`

**Quality Gate:** Sylvia approves parameter sources, Priya approves Monte Carlo validation.

---

### Phase 4: Integration & Polish

**Objective:** Wire everything together and validate player experience.

**Tasks:**
1. **Probability Visualization** (Tessa)
   - Add outcome distribution chart to dashboard
   - Show how probabilities shift after player actions
   - Display uncertainty bands
   - Wire to GameStateProvider.outcomes

2. **Event Display** (Tessa + Roy)
   - Replace mock events with real simulation events
   - Filter events by severity (info, warning, critical)
   - Add event attribution ("Your advocacy contributed to...")
   - Wire to SimulationObserver

3. **Counterfactual Comparison** (Roy)
   - Track baseline simulation (no player actions)
   - Display "What if you did nothing?" comparison
   - Show divergence from baseline trajectory

4. **Final Validation** (Priya + Sylvia)
   - Full playthrough test (all 3 scenarios)
   - Verify determinism (same seed → same outcome)
   - Check player agency bounds
   - Sylvia final sign-off

**Deliverables:**
- `src/components/dashboards/game/OutcomeChart.tsx` - Probability viz
- `src/components/dashboards/game/EventLog.tsx` - Event display
- Updated GameStateProvider with counterfactual tracking
- Final validation report

**Quality Gate:** Sylvia final sign-off, Priya confirms determinism.

---

## Orchestrator Workflow

### Step 1: Research & Validation (Quality Gate 1)
- **Spawn:** super-alignment-researcher (parameter extraction)
- **Spawn:** research-skeptic (Sylvia approval)
- **Output:** `research/game_scenarios_YYYYMMDD.md` with approved parameters

### Step 2: Implementation & Testing
- **Spawn:** simulation-maintainer (Roy - core mechanics)
- **Spawn:** far-future-ux-designer (Tessa - UI components)
- **Spawn:** sci-fi-tech-visionary (Ray - tutorial text)
- **Output:** Implemented game mechanics + UI

### Step 3: Architecture Review (Quality Gate 2)
- **Spawn:** architecture-skeptic (performance, state propagation)
- **Address:** CRITICAL/HIGH issues before proceeding

### Step 4: Monte Carlo Validation
- **Spawn:** priya (statistical validation)
- **Output:** `reviews/game_scenario_validation_YYYYMMDD.md`

### Step 5: Final Integration
- **Spawn:** simulation-maintainer + far-future-ux-designer (polish)
- **Spawn:** research-skeptic (Sylvia final sign-off)

### Step 6: Documentation & Archival
- **Spawn:** wiki-documentation-updater (sync docs)
- **Spawn:** architect (roadmap cleanup)

---

## Success Criteria

1. ✅ Player can select scenario (baseline, optimistic, pessimistic)
2. ✅ Player can queue advocacy actions
3. ✅ Actions affect simulation outcomes (observable changes in metrics)
4. ✅ Dashboard shows probability distributions
5. ✅ Events reflect player influence
6. ✅ Outcomes within 15% of baseline (Monte Carlo validation)
7. ✅ Sylvia approves research integrity
8. ✅ Deployed to claude-workspace VM

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Parameter drift during implementation | Research validity compromised | Sylvia veto on all parameter changes |
| Player agency exceeds bounds | Unrealistic outcomes | Monte Carlo validation enforces <20% deviation |
| UI obscures uncertainty | False precision | Sylvia review of all data displays |
| Tutorial creates misconceptions | Player misunderstanding | Sylvia approval required |
| Scope creep | Deadline missed | Focus on 8-12 core actions only |

---

## Token Budget

- **Available:** 145K tokens remaining (normal mode)
- **Estimated:** ~60K tokens for full workflow
- **Approach:** Sequential specialist spawning, not parallel (token efficiency)

---

## References

- **Game Design:** `plans/game-design/GAME_DESIGN_DOCUMENT.md`
- **Roadmap:** `plans/game-design/GAME_DEVELOPMENT_ROADMAP.md`
- **Phase 1 Spec:** `plans/game-design/PHASE1_TECHNICAL_SPEC.md`
- **Architecture:** `src/game/` (17 files, Phase 1 complete)
