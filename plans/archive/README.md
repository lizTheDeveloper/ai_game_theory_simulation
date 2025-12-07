# Plans Archive

**Created:** December 6, 2025 (OpenSpec Migration)
**Purpose:** Preserve historical planning documents no longer actively maintained

---

## Directory Structure

```
archive/
├── legacy-roadmaps/          # Pre-OpenSpec roadmap system (frozen Dec 6, 2025)
│   ├── MASTER_IMPLEMENTATION_ROADMAP.md  (221KB)
│   ├── SIMULATION_ROADMAP.md             (139KB)
│   └── FRONTEND_ROADMAP.md               (36KB)
├── workflows/                # Legacy workflow documentation
│   └── RESEARCH_TO_IMPLEMENTATION_WORKFLOW.md
├── game-design/              # Game design documents (Phase 1-4)
│   ├── GAME_DESIGN_DOCUMENT.md
│   ├── GAME_DEVELOPMENT_ROADMAP.md
│   ├── GOD_MODE_UI_DESIGN.md
│   ├── DASHBOARD_ELEMENTS_REVIEW_*.md
│   └── mockups/
└── dashboard-phase1/         # Dashboard implementation details (Phase 1 complete)
    ├── overview-api.md
    ├── domain-api.md
    └── ...
```

---

## Why These Were Archived

### Legacy Roadmaps (Dec 6, 2025)

**Replaced by:** `openspec/` directory structure

**Reason:**
- Migrated to OpenSpec spec-driven development framework
- Cleaner separation of specifications vs implementation status
- Better support for AI agent workflows
- Explicit delta format (ADDED/MODIFIED/REMOVED)

**Where to find active work now:**
- `openspec/specs/project/spec.md` - Meta-spec (master roadmap)
- `openspec/specs/simulation/spec.md` - Simulation requirements
- `openspec/specs/frontend/spec.md` - Frontend requirements
- `openspec/changes/` - Proposed work

### Workflows

**Replaced by:** `openspec/project.md` and `openspec/AGENTS.md`

**Reason:**
- Workflow now defined in OpenSpec conventions
- Agent routing documented in AGENTS.md
- Quality gates formalized in OpenSpec system

### Game Design

**Status:** Reference material for future game development track

**Reason:**
- Phase 1 (Overview Dashboard) complete
- Remaining phases (Phase 2-4) deferred
- God Mode UI design preserved in OpenSpec (openspec/specs/simulation/god-mode/)
- Detailed design docs preserved here for reference

### Dashboard Phase 1

**Status:** Implementation complete (Oct 2025)

**Reason:**
- 10 dashboards implemented (~4,700 lines)
- Phase 1 complete per game design spec
- Implementation details archived for reference
- Active dashboard work now tracked in openspec/specs/frontend/spec.md

---

## Using Archived Documents

**Do:**
- Reference for historical context
- Understand past decisions
- Learn from implementation histories
- Extract design patterns

**Don't:**
- Update these files (they're frozen)
- Use as current roadmap (use openspec/ instead)
- Treat as active specifications

---

## Migration Summary

**Date:** December 6, 2025
**Session:** 56
**Migrated by:** Claude Code

**What moved:**
- 3 legacy roadmaps (467KB total)
- 1 workflow document (24KB)
- 2 subdirectories (game-design/, dashboard/)
- ~30 individual files

**Where specs went:**
- `openspec/specs/` - Living specifications
- `openspec/changes/` - Proposed work
- `docs/implementation-history/` - Rich archives (continues to grow)

**See:** `docs/OPENSPEC_MIGRATION_SUMMARY.md` for complete migration status
