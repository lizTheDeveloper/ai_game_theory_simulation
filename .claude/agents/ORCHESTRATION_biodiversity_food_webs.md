# Orchestration Plan: Enhanced Biodiversity Modeling (L-2)

**Orchestrator:** orchestrator-1
**Feature ID:** L-2 (LOW priority)
**Started:** 2025-12-10 11:00
**Status:** Phase 1 (Research) - IN PROGRESS

---

## Feature Overview

**Goal:** Enhance biodiversity modeling with food web collapse cascades, trophic interactions, and keystone species dynamics for realistic extinction cascade propagation.

**Complexity:** HIGH (new subsystem, ecosystem network modeling)
**Estimated Timeline:** 6-8 hours (research-intensive)

---

## Workflow Phases

### ✅ Phase 0: Planning & Coordination (COMPLETE)
**Owner:** orchestrator-1
**Duration:** 20 minutes

**Deliverables:**
- ✅ Implementation plan: `/plans/enhanced-biodiversity-plan.md`
- ✅ Research handoff: `.claude/agents/HANDOFF_cynthia_biodiversity_food_webs.md`
- ✅ Channel posts: coordination.md + research.md
- ✅ Todo tracking initiated

### 🔄 Phase 1: Research & Validation (IN PROGRESS)
**Owner:** Cynthia (super-alignment-researcher) → Sylvia (research-skeptic)
**Duration:** 2-3 hours estimated

**Current Status:**
- 🔄 Cynthia: Gather peer-reviewed research (8+ sources, 2024-2025 preferred)
- ⏳ Cynthia: Extract parameters (trophic efficiency, cascade rates, keystone thresholds)
- ⏳ Cynthia: Create `research/biodiversity_food_webs_20251210.md`
- ⏳ Sylvia: Quality Gate 1 validation (grade research quality)

**Success Criteria (Quality Gate 1):**
- Grade B or higher from Sylvia
- 2+ peer-reviewed sources per major parameter
- 50%+ sources from 2024-2025
- Specific numeric values (not ranges)
- Mechanism descriptions (HOW, not just WHAT)

**Blocking:** All subsequent phases blocked until QG1 passes

### ⏳ Phase 2: Data Modeling
**Owner:** orchestrator-1 (design) + feature-implementer (prototyping)
**Duration:** 1 hour estimated

**Tasks:**
- Define food web network structure (nodes = species, edges = trophic links)
- Design keystone species detection algorithm (centrality measures)
- Create cascade propagation mechanics (graph traversal)
- Map to GameState interface (extend `planetaryBoundaries.biosphereIntegrity`?)

**Blockers:** Needs research parameters from Phase 1

### ⏳ Phase 3: Implementation
**Owner:** Moss (feature-implementer)
**Duration:** 2-3 hours estimated

**Tasks:**
- Create `BiodiversityFoodWebPhase.ts`
- Implement trophic cascade logic (phase order: after environmentalDebt, before qualityOfLife)
- Add keystone species tracking
- Connect to planetary boundaries
- Update GameState interface (add `foodWebState`?)
- Add pictographic events (🦎🌿 extinctions, ⛓️💥 cascade events)
- Use assertion utilities (no NaN fallbacks)

**Blockers:** Needs data model from Phase 2

### ⏳ Phase 4: Testing
**Owner:** unit-test-writer + integration-test-writer + Priya (Monte Carlo)
**Duration:** 1-2 hours estimated

**Tasks:**
- Unit tests for cascade logic (test isolated functions)
- Integration tests with planetary boundaries
- Edge case testing (all species extinct, single species remaining)
- Monte Carlo validation (N≥10 runs, determinism check)
- Priya: CV < 0.01% validation

**Blockers:** Needs implementation from Phase 3

### ⏳ Phase 5: Architecture Review (Quality Gate 2)
**Owner:** architecture-skeptic
**Duration:** 30 minutes estimated

**Tasks:**
- Performance review (O(n²) graph algorithms? Deep cloning issues?)
- State propagation check (food web → QoL → outcome classification)
- Complexity assessment (is this adding too much complexity?)
- Grade: B or higher required to merge

**Success Criteria (Quality Gate 2):**
- Grade B or higher
- 0 CRITICAL issues
- 0 HIGH issues
- MEDIUM issues documented (not blocking)

**Blockers:** Needs tests passing from Phase 4

### ⏳ Phase 6: Documentation & Archival
**Owner:** wiki-documentation-updater (Historian) + architect
**Duration:** 30 minutes estimated

**Tasks:**
- Update `docs/wiki/README.md` (add biodiversity section)
- Create devlog entry
- Archive plan to `/plans/completed/`
- Update OpenSpec specs (merge delta into `openspec/specs/simulation/spec.md`)
- Architect: Roadmap cleanup

**Blockers:** Needs QG2 pass from Phase 5

---

## Agent Roster

| Agent | Role | Phases |
|-------|------|--------|
| orchestrator-1 | Coordinator | 0, 2 |
| Cynthia (super-alignment-researcher) | Research | 1 |
| Sylvia (research-skeptic) | QG1 Validation | 1 |
| Moss (feature-implementer) | Implementation | 3 |
| unit-test-writer | Testing | 4 |
| integration-test-writer | Testing | 4 |
| Priya (quantitative-validator) | Monte Carlo | 4 |
| architecture-skeptic | QG2 Review | 5 |
| Historian (wiki-documentation-updater) | Docs | 6 |
| architect | Archival | 6 |

---

## Communication Channels

**Primary:** `.claude/chatroom/channels/coordination.md` (all agents monitor)
**Research:** `.claude/chatroom/channels/research.md` (Cynthia + Sylvia active)
**Implementation:** `.claude/chatroom/channels/implementation.md` (Moss + architect)
**Documentation:** `.claude/chatroom/channels/documentation.md` (Historian)

---

## Quality Gates

### Quality Gate 1: Research Validation (Phase 1)
**Gatekeeper:** Sylvia (research-skeptic)
**Criteria:**
- Contradictory evidence check
- Methodological critique
- Overconfidence detection
- Grade: B or higher to proceed

**If FAIL:** Loop back to Cynthia for better sources OR pivot approach OR reject feature

### Quality Gate 2: Architecture Review (Phase 5)
**Gatekeeper:** architecture-skeptic
**Criteria:**
- Performance bottlenecks (O(n²), deep cloning)
- State propagation issues
- Complexity creep
- Grade: B or higher to merge

**If FAIL:** Address CRITICAL/HIGH issues, re-review

---

## Risk Register

| Risk | Severity | Mitigation |
|------|----------|------------|
| Parameter uncertainty (limited empirical data) | HIGH | Use paleontological data + explicit uncertainty flags |
| Complexity creep (food webs inherently complex) | HIGH | Simplify to essential mechanics, resist feature bloat |
| Performance (O(n²) graph algorithms) | MEDIUM | Use efficient data structures, profile before/after |
| Integration complexity (many touchpoints) | MEDIUM | Incremental integration, test each connection |
| Balance tuning temptation | LOW | Stay research-backed, no "feels right" tuning |

---

## Current Blockers

**Phase 1 (Research):** None - Cynthia should have handoff file and can proceed

**Next blocker:** Quality Gate 1 - if research grade is D/F, must loop back or pivot

---

## Progress Tracking

**Last updated:** 2025-12-10 11:20 by orchestrator-1

**Next milestone:** Research completion + QG1 validation (ETA: 2-3 hours)

**Monitor:** Check `.claude/chatroom/channels/research.md` for Cynthia's progress posts

---

## Notes

**Why LOW priority?**
- Feature adds nuance but isn't critical for core simulation
- Existing planetary boundaries capture basic biodiversity tracking
- Can defer if other CRITICAL/HIGH work emerges

**Why proceed now?**
- Token conservation mode DISABLED (normal productivity restored)
- All CRITICAL/HIGH priority work COMPLETE (per Session 65)
- Research quality target: 76.9% from 2024-2025 (L-2 will maintain standard)

**Coordination philosophy:**
- Let specialists work in their domains
- Orchestrator coordinates handoffs, doesn't implement
- Quality gates enforce rigor
- Channel posts maintain visibility
