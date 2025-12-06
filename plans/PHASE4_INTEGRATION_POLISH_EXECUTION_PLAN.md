# Phase 4: Integration & Polish - Execution Plan

**Created:** 2025-12-06
**Priority:** CRITICAL
**Deadline:** 2025-12-07 EOD
**Parent Plan:** plans/GAME_IMPLEMENTATION_ORCHESTRATION_SPEC.md
**Prerequisites:** Phases 2 & 3 complete

---

## Overview

Wire everything together, add visualization, validate player experience, deploy to production.

---

## Task Breakdown

### Task 4.1: Probability Visualization
**Agent:** far-future-ux-designer (Tessa)
**Duration:** 2-3 hours
**Output:** src/components/dashboards/game/OutcomeChart.tsx

**Requirements:**
- Show outcome distribution (utopia → extinction) as probability bars
- Display how probabilities shift after player actions
- Uncertainty bands (not false precision)
- Compare baseline vs player-influenced trajectory

### Task 4.2: Event Display with Attribution
**Agent:** far-future-ux-designer (Tessa) + simulation-maintainer (Roy)
**Duration:** 3-4 hours
**Output:** src/components/dashboards/game/EventLog.tsx + SimulationObserver updates

**Requirements:**
- Replace mock events with real simulation events
- Filter by severity (info, warning, critical)
- Add attribution: "Your advocacy contributed to this outcome" vs "This happened despite your actions"
- Wire to SimulationObserver

### Task 4.3: Counterfactual Comparison
**Agent:** simulation-maintainer (Roy)
**Duration:** 2-3 hours
**Output:** Updated GameStateProvider with baseline tracking

**Requirements:**
- Track baseline simulation (no player actions)
- Display "What if you did nothing?" comparison
- Show divergence from baseline trajectory
- Visualize player impact quantitatively

### Task 4.4: Architecture Review (Quality Gate 2)
**Agent:** architecture-skeptic
**Duration:** 1-2 hours
**Input:** Complete Phase 2-4 implementation
**Output:** reviews/game_integration_architecture_20251206.md

**Review Criteria:**
- Performance (O(n) complexity, no deep cloning in hot paths)
- State propagation (no circular dependencies)
- Complexity (is architecture maintainable?)
- CRITICAL/HIGH issues must be addressed before deployment

### Task 4.5: Final Validation
**Agent:** priya + research-skeptic (Sylvia)
**Duration:** 2-3 hours
**Output:** reviews/game_final_validation_20251206.md

**Validation Protocol:**
1. Full playthrough (all 3 scenarios)
2. Verify determinism (same seed → same outcome)
3. Verify player agency bounds
4. Sylvia final sign-off on research integrity
5. Priya confirms statistical properties

### Task 4.6: Documentation Update
**Agent:** wiki-documentation-updater
**Duration:** 1-2 hours
**Output:** Updated docs/wiki/README.md

**Updates:**
- Game layer architecture section
- Player advocacy mechanics
- Research scenarios
- Tutorial guide

### Task 4.7: Deployment
**Agent:** devops (optional if manual)
**Duration:** 1 hour
**Actions:**
- Build production bundle
- Deploy to claude-workspace VM (34.32.105.178)
- Verify /game-dashboard-demo works
- Update deployment documentation

---

## Success Criteria

1. ✅ All UI components functional
2. ✅ Architecture review PASS (no CRITICAL/HIGH issues)
3. ✅ Final validation PASS (determinism, bounds, Sylvia approval)
4. ✅ Documentation updated
5. ✅ Deployed to production
6. ✅ User can play complete game loop

---

## Token Budget: ~20-30k tokens
