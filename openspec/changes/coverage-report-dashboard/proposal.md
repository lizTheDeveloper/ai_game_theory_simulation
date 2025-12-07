# Proposal: Coverage Report Dashboard

**Created:** December 1, 2025
**Domain:** Frontend (Tooling)
**Priority:** LOW
**Complexity:** 2 systems
**Estimated Effort:** 3-4 hours

---

## Rationale

Currently, test coverage information exists but requires manual parsing of Jest output. There's no easy way to:
- Track coverage trends over time
- Identify files that have dropped below 80% coverage
- Prioritize which files need test improvements
- Monitor coverage improvements from PRs

**Current coverage:** 81.64% (460 tests passing)

---

## Scope

Create `scripts/generateCoverageReport.ts` that:
1. Runs Jest with coverage collection
2. Parses coverage JSON output
3. Generates HTML dashboard with visualizations
4. Tracks coverage history in timestamped logs
5. Identifies files <80% coverage prioritized by system criticality

**Phases:**
- **Phase 1:** Coverage data collection (60 min)
- **Phase 2:** Coverage history tracking (45 min)
- **Phase 3:** HTML dashboard generation (90 min)
- **Phase 4:** CI/CD integration (30 min)

---

## Success Criteria

**Developer benefits:**
- Quick identification of which files need tests
- Prioritized action (focus on critical simulation code first)
- Trend awareness (know if coverage is improving/regressing)
- PR confidence (see coverage impact before merge)

**Project benefits:**
- Prevent regressions (CI blocks coverage drops)
- Track progress (see testing improvements over time)
- Research credibility (high test coverage strengthens research claims)
- Onboarding (new developers see which code is well-tested)

**Technical criteria:**
- TypeScript compilation MUST pass
- Script MUST run in <30 seconds
- HTML dashboard MUST work offline (no CDN dependencies)
- Architecture review NOT required (tooling-only)

---

## System Prioritization Logic

Files prioritized by system criticality:

**CRITICAL (fix first):**
- `src/simulation/engine/*` - Core simulation loop
- `src/simulation/carbonCycle/*` - Climate modeling
- `src/simulation/phases/Climate*.ts` - Climate phases
- `src/types/game.ts` - State interface

**HIGH:**
- `src/simulation/phases/AI*.ts` - AI agent mechanics
- `src/simulation/phases/*Boundary*.ts` - Planetary boundaries
- `src/simulation/phases/Food*.ts` - Food security

**MEDIUM:**
- `src/simulation/phases/Social*.ts` - Social systems
- `src/simulation/phases/Tech*.ts` - Technology deployment
- `src/lib/*` - UI utilities

**LOW:**
- `src/components/*` - React components (UI-only)
- `scripts/*` - Build/dev tooling

---

## Implementation Agent

`general-purpose` agent or manual implementation
