# Game Development Roadmap

**Version:** 1.0
**Created:** Current Session
**Status:** Active

---

## Research Integrity Authority

### Sylvia (Research Skeptic) - FINAL AUTHORITY ON RESEARCH INTEGRITY

**This section is non-negotiable. All team members must acknowledge and comply.**

#### Veto Power

Sylvia has **VETO POWER** over any design decision, implementation choice, or gameplay mechanic that could affect research accuracy. This includes but is not limited to:

- Parameter values used in any game mode
- Player agency boundaries (what players can/cannot influence)
- Outcome classification criteria
- Tutorial simplifications that might create misconceptions
- Difficulty/scenario design that deviates from research baselines
- UI presentations that obscure uncertainty or indirect causation
- Any "gameplay feel" adjustments to research-backed values

#### Approval Requirements

**No implementation can proceed without Sylvia's explicit approval** for:

1. **Architecture changes** affecting simulation/game separation
2. **New player actions** that influence system dynamics
3. **Scenario definitions** with modified starting conditions
4. **Tutorial content** that simplifies research concepts
5. **UI elements** that display research-derived values
6. **"Balance" adjustments** claimed to improve gameplay

#### Halt Authority

**Sylvia can halt work at any phase** if research integrity concerns emerge, including:

- Discovery of parameter drift from validated baselines
- Implementation that allows player control over red-line parameters
- UI designs that misrepresent causation or certainty
- Scenario outcomes exceeding 15% deviation from baseline
- Any mechanic that could compromise the simulation's research validity

#### Escalation Process

If Maya (Game Designer) and Sylvia disagree on a design decision:

1. **Both parties document their positions** in writing
2. **Evidence must be provided:**
   - Maya: Gameplay rationale with player experience justification
   - Sylvia: Research integrity concerns with specific risks
3. **User decides** - The human operator has final authority
4. **Decision is documented** in the relevant design file with rationale

**Default:** If no user decision is made, Sylvia's position holds. Research integrity takes precedence over gameplay preferences.

---

## Quality Gates with Sylvia Approval

### Phase 1: Architecture Foundation

**Quality Gate 1: Architecture Separation**

| Checkpoint | Requirement | Sylvia Approval |
|------------|-------------|-----------------|
| Simulation isolation | Game layer cannot modify research parameters | REQUIRED |
| Data flow | One-way from simulation to game presentation | REQUIRED |
| Parameter protection | Red-line values inaccessible to game code | REQUIRED |
| Logging separation | Research logs distinct from game events | REQUIRED |

**Sylvia Sign-off Required Before Proceeding to Phase 2**

---

### Phase 2: Tutorial & Onboarding

**Quality Gate 2: Tutorial Simplifications**

| Checkpoint | Requirement | Sylvia Approval |
|------------|-------------|-----------------|
| Simplification audit | No tutorial text creates research misconceptions | REQUIRED |
| Complexity hiding | Hidden complexity is acknowledged, not denied | REQUIRED |
| Uncertainty framing | All presented outcomes include uncertainty language | REQUIRED |
| Indirect agency | Player role as influence, not control, is clear | REQUIRED |
| Causal language | No false causation ("you caused X" vs "X became more likely") | REQUIRED |

**Sylvia Sign-off Required Before Proceeding to Phase 3**

---

### Phase 3: Research Scenarios (Difficulty)

**Quality Gate 3: Scenario Validation**

| Checkpoint | Requirement | Sylvia Approval |
|------------|-------------|-----------------|
| Baseline accuracy | Consensus trajectory matches research literature | REQUIRED |
| Optimistic bounds | Upper bounds from peer-reviewed uncertainty ranges | REQUIRED |
| Pessimistic bounds | Lower bounds from peer-reviewed uncertainty ranges | REQUIRED |
| Custom validation | Custom scenarios require N=100 Monte Carlo | REQUIRED |
| 15% deviation limit | All scenarios within 15% of baseline distributions | REQUIRED |
| No balance tuning | Zero "gameplay feel" adjustments to validated values | REQUIRED |

**Sylvia Sign-off Required Before Proceeding to Phase 4**

---

### Phase 4: Final Validation

**Quality Gate 4: Monte Carlo Comparison**

| Checkpoint | Requirement | Sylvia Approval |
|------------|-------------|-----------------|
| N >= 100 runs | All scenarios validated with sufficient sample | REQUIRED |
| Distribution matching | Outcome distributions match research expectations | REQUIRED |
| Player agency bounds | No single choice shifts outcomes > 20% | REQUIRED |
| Determinism check | CV < 0.01% for same-seed runs | REQUIRED |
| Citation completeness | All displayed values link to sources | REQUIRED |
| Counterfactual logging | Baseline comparison always available | REQUIRED |

**Sylvia Final Sign-off Required Before Release**

---

## Development Phases

### Phase 0: UI Mockups & Design (Pre-Development) - **COMPLETE** (Nov 25, 2025)

**Objective:** Design and validate all major UI components before React implementation.

**Status:** ✅ COMPLETE - All 6 interfaces designed (God Mode UI added Nov 25 final session)
- **Scenario Setup Interface** design and mockup COMPLETE (Nov 25, 2025)
- **God Mode UI** design and mockups COMPLETE (Nov 25, 2025)

#### Tasks

- [x] Main Dashboard (Crisis Response Panel) - 4 rounds of revision
- [x] Scenario Setup Interface - Conversational calibration system (Nov 25, 2025)
- [x] God Mode UI - Manual control interface for 37 simulation phases (Nov 25, 2025)
- [x] Research Tree View - 71 technologies, Active Loop panel, crisis relevance
- [x] ARIA Chat Interface - Context-aware AI advisor with citations
- [x] Global Systems Map - 10-12 regions, 6 layers, cascade animations
- [x] Cross-panel coordination design - postMessage event system

#### Deliverables

- ✅ Design specifications (6 files complete):
  - `SCENARIO_SETUP_DESIGN.md` - 7 calibration questions, belief sliders (Nov 25, 2025)
  - `GOD_MODE_UI_DESIGN.md` - 7,200 words, 37 phases, actor-based controls (Nov 25, 2025)
  - `RESEARCH_TREE_DESIGN.md` - 4,500 words, 71 tech tree spec
  - `ARIA_CHAT_DESIGN.md` - 5,200 words, tiered implementation
  - `GLOBAL_MAP_DESIGN.md` - 5,800 words, multi-layer heat map
  - `DASHBOARD_ELEMENTS_SUMMARY.md` - Integration overview

- ✅ Interactive HTML mockups (6 complete):
  - `mockups/scenario-setup.html` - Conversational calibration flow (Nov 25, 2025)
  - `mockups/god-mode-*.html` (v1-v4) - 7 panels: main, government, AI agents, queue, history, comparison, presets (Nov 25, 2025)
  - `mockups/research-tree.html` (v1-v4) - Category×tier grid, Active Loop
  - `mockups/aria-chat.html` (v1-v4) - Context-aware conversation
  - `mockups/global-map.html` (v1-v4) - Animated cascade system
  - `mockups/main-dashboard.html` - Crisis response panel

- ✅ Maya's design reviews (4 rounds):
  - v1: 7.5/6/5.5 - Identified integration needs
  - v2: 8.5/7.5/6.5 - Active Loop "game-changer"
  - v3: 9.0/8.5/8.0 - Production-ready core
  - v4: 9.5/9.0/9.0 - **PRODUCTION READY** ✅

- ✅ Screenshots: 40+ mockup versions documented
  - Research Tree, ARIA Chat, Global Map: 12 screenshots (v1-v4)
  - God Mode UI: 28 screenshots (7 panels × v1-v4)

#### Integration Tasks (Phase 2 React Conversion) - **MOSTLY COMPLETE** (Nov 25, 2025)

- [ ] Convert scenario-setup.html → React component (`src/game/components/ScenarioSetup/`) - Design COMPLETE (Nov 25)
- [ ] Convert god-mode-*.html → React component (`src/game/components/GodMode/`) - Design COMPLETE (Nov 25)
  - [ ] Main command center with timeline controls - `GodModeMain.tsx`
  - [ ] Government controls (12 policy levers) - `GovernmentControls.tsx`
  - [ ] AI agents panel (20 agents) - `AIAgentsPanel.tsx`
  - [ ] Decision queue with drag-reorder - `DecisionQueue.tsx`
  - [ ] History & audit trail - `HistoryPanel.tsx`
  - [ ] Manual vs Auto comparison - `ComparisonView.tsx`
  - [ ] Preset scenarios library - `PresetLibrary.tsx`
- [x] Convert research-tree.html → React component (`src/components/dashboards/game/ResearchTree/`) ✅
  - [x] Implement Active Loop state management - `ActiveLoop.tsx` with drag-drop, defer/accelerate
  - [x] Wire crisis relevance badges to simulation state - `TechCard.tsx` with CrisisRelevance prop
  - [x] Connect defer/accelerate actions to influence system - Event callbacks implemented
  - [x] Implement drag-drop priority reordering - Reorder mode in ActiveLoop
- [x] Convert aria-chat.html → React component (`src/components/dashboards/game/ARIAChat/`) ✅
  - [x] Implement context awareness (screen reading) - `ContextAwareness` type + panel state display
  - [x] Add citation tooltip system - `CitationTooltip.tsx` with hover tooltips
  - [x] Wire to simulation state for context - Event callbacks for cross-panel coordination
  - [x] Implement suggested questions based on UI state - `SuggestionPanel.tsx`
- [x] Convert global-map.html → React component (`src/components/dashboards/game/GlobalMap/`) ✅
  - [x] Wire regions to simulation state (10-12 regions) - `RegionOverlay.tsx` with RegionData props
  - [x] Implement 6-layer data switcher - `LayerSwitcher.tsx` (Composite, Temp, Food, Health, Economic, AI)
  - [x] Add timeline scrubber connected to simulation history - `TimelineScrubber.tsx` with playback
  - [x] Implement cascade animations (migration, crisis propagation) - `CascadeFlow.tsx` with 4 flow types
- [x] Implement cross-panel coordination via React Context - CrossPanelEvent system ✅
  - [x] Click crisis → highlight in Research Tree + trigger ARIA - MapCrossPanelEvent.highlight_tech
  - [x] Research Tree selection → update ARIA context - CrossPanelEvent.tech_selected
  - [x] Global Map layer change → update ARIA awareness - MapCrossPanelEvent.layer_changed

**Remaining:** Scenario Setup React conversion (design/mockup COMPLETE, React component pending)

#### Sylvia Checkpoint

- [ ] **Sylvia reviews UI mockups for research integrity** - Ensure no false causation language, proper uncertainty representation
- [ ] **Sylvia approves scenario calibration questions** - Verify belief sliders don't create false precision
- [ ] **Sylvia reviews ARIA chat examples** - Check citation accuracy, uncertainty framing
- [ ] **Sylvia approves Active Loop mechanics** - Verify player agency boundaries respected
- [ ] **Sylvia approves God Mode UI controls** - CRITICAL: Verify manual overrides don't violate parameter protection, ensure clear warnings about research validity when deviating from automated logic

---

### Phase 1: Core Architecture (Weeks 1-4) - **COMPLETE** (Nov 24, 2025)

**Objective:** Establish clean separation between research simulation and game presentation layer.

**Status:** ✅ COMPLETE - Architecture foundation established

#### Tasks

- [x] Define simulation/game interface boundary - `src/game/types/`
- [x] Implement read-only game state wrapper - `GameStateProvider.tsx`
- [x] Create parameter protection layer for red-line values - `src/game/core/`
- [x] Set up separate logging streams (research vs game events) - observer pattern
- [ ] Document architecture in wiki (PENDING)

#### Deliverables

- ✅ Architecture implementation: `src/game/` directory (17 files)
  - `core/` - GameManager, GameCurrencyManager, InfluenceAcquisition
  - `types/` - GameTypes, InfluenceTypes, CurrencyTypes, ScenarioTypes
  - `scenarios/` - BaseScenario, PlanetaryCouncil, CorporateAI, TechnoOptimist
  - `observers/` - BaseObserver, CurrencyObserver, DecisionObserver
- ✅ React integration: GameStateProvider, useGameState() hook
- ⏳ Protected parameter registry (documented in code, wiki update pending)
- ⏳ Interface specification document (wiki update pending)

#### Sylvia Checkpoint

- [ ] **Sylvia approves architecture separation** before proceeding (PENDING REVIEW)

---

### Phase 2: Player Agency System (Weeks 5-8)

**Objective:** Implement indirect influence mechanics that respect research integrity.

#### Tasks

- [ ] Define advocacy action catalog with bounded effects
- [ ] Implement coalition-building mechanics
- [ ] Create probability distribution visualization
- [ ] Build intervention proposal system for critical junctures
- [ ] Tutorial content development

#### Deliverables

- Advocacy system specification
- Effect magnitude documentation (with research justification)
- Tutorial script with simplification audit

#### Sylvia Checkpoint

- [ ] **Sylvia approves all tutorial simplifications** - verifies no misconceptions introduced

---

### Phase 3: Research Scenarios (Weeks 9-12)

**Objective:** Implement validated research scenarios as alternative starting conditions.

#### Tasks

- [ ] Baseline scenario: Parameter extraction from research literature
- [ ] Optimistic scenario: Upper-bound uncertainty values
- [ ] Pessimistic scenario: Lower-bound uncertainty values
- [ ] Custom scenario framework with validation requirements
- [ ] Monte Carlo validation pipeline

#### Deliverables

- Three validated scenarios with documentation
- Parameter source citations for all variations
- Validation results (N >= 100 each)

#### Sylvia Checkpoint

- [ ] **Sylvia approves all difficulty scenarios** - within 15% of baseline

---

### Phase 4: Integration & Polish (Weeks 13-16)

**Objective:** Final integration, validation, and research integrity audit.

#### Tasks

- [ ] Full Monte Carlo comparison across scenarios
- [ ] Player agency bounds verification
- [ ] Citation integration in UI
- [ ] Uncertainty visualization implementation
- [ ] Academic export functionality

#### Deliverables

- Final validation report
- Citation-linked interface
- Export tools for researchers

#### Sylvia Checkpoint

- [ ] **Sylvia signs off on final validation** - Monte Carlo comparison passed

---

## Team Roles & Responsibilities

### Maya (Game Designer)
- Player experience design
- Tutorial flow
- Engagement mechanics
- **Subject to Sylvia's research integrity veto**

### Tessa (UX Designer)
- Interface design
- Data visualization
- Accessibility
- **Must consult Sylvia on uncertainty representation**

### Roy (Simulation Maintainer)
- Technical implementation
- Performance optimization
- Architecture execution
- **Must maintain simulation/game separation**

### Ray (Narrative Designer)
- Framing and language
- Event text
- Endpoint descriptions
- **Must avoid false causation language**

### Sylvia (Research Skeptic)
- **FINAL AUTHORITY on research integrity**
- Parameter validation
- Scenario approval
- Misconception prevention

---

## Risk Register

| Risk | Impact | Mitigation | Owner |
|------|--------|------------|-------|
| Parameter drift during "balancing" | Research validity compromised | Sylvia veto on all balance changes | Sylvia |
| Tutorial oversimplification | Player misconceptions | Sylvia review of all educational content | Sylvia |
| UI obscures uncertainty | False precision impression | Sylvia review of all data displays | Sylvia + Tessa |
| Gameplay pressure overrides research | Simulation becomes invalid | Escalation to user, research default | Sylvia |
| Scenario deviation exceeds bounds | Results not comparable to research | Mandatory Monte Carlo validation | Sylvia + Roy |

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Current Session | Initial creation with Research Integrity Authority formalization |

---

## Approvals

| Role | Agent | Status | Date |
|------|-------|--------|------|
| Research Integrity Authority | Sylvia | ESTABLISHED | Current Session |
| Game Design Lead | Maya | Pending Acknowledgment | - |
| UX Lead | Tessa | Pending Acknowledgment | - |
| Technical Lead | Roy | Pending Acknowledgment | - |
| Narrative Lead | Ray | Pending Acknowledgment | - |
