# Coverage Report Dashboard

**Priority:** LOW
**Complexity:** 2 systems
**Estimated Effort:** 3-4 hours
**Created:** Dec 1, 2025
**Status:** PROPOSED
**Roadmap Reference:** Section 5.5 Test Infrastructure

## Problem Statement

Currently, test coverage information exists but requires manual parsing of Jest output. There's no easy way to:
- Track coverage trends over time
- Identify files that have dropped below 80% coverage
- Prioritize which files need test improvements
- Monitor coverage improvements from PRs

**Current coverage:** 81.64% (460 tests passing)

## Proposed Solution

Create `scripts/generateCoverageReport.ts` that:
1. Runs Jest with coverage collection
2. Parses coverage JSON output
3. Generates HTML dashboard with visualizations
4. Tracks coverage history in timestamped logs
5. Identifies files <80% coverage prioritized by system criticality

### Phase 1: Coverage Data Collection (60 min)

**Script:** `scripts/generateCoverageReport.ts`

```typescript
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface CoverageData {
  timestamp: string;
  overallCoverage: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
  filesCoverage: Array<{
    file: string;
    coverage: number;
    lines: number;
    uncoveredLines: number;
    system: 'climate' | 'ai' | 'social' | 'tech' | 'ui' | 'test' | 'util';
  }>;
  undertested: Array<{
    file: string;
    coverage: number;
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
}
```

**Tasks:**
- Run `npm test -- --coverage --json --outputFile=coverage/coverage.json`
- Parse Jest coverage JSON format
- Calculate per-file coverage percentages
- Classify files by system (grep for imports/paths)
- Identify files <80% coverage

### Phase 2: Coverage History Tracking (45 min)

**Location:** `logs/coverage_history/`

Store timestamped coverage snapshots:
```
logs/coverage_history/
  coverage_20251201_040000.json
  coverage_20251201_080000.json
  ...
```

**Trend calculation:**
- Compare current coverage vs last 7 days
- Identify files with coverage regressions
- Track overall project coverage trajectory

### Phase 3: HTML Dashboard Generation (90 min)

**Output:** `coverage/dashboard.html`

**Sections:**
1. **Overall Metrics Card**
   - Current coverage: 81.64%
   - Trend: +0.5% vs 7 days ago
   - Tests passing: 460
   - Total files: [count]

2. **Undertested Files Table**
   - File path (clickable to open in editor)
   - Coverage percentage
   - System (climate/ai/social/tech/ui)
   - Priority (CRITICAL/HIGH/MEDIUM/LOW)
   - Lines uncovered

3. **Coverage Trends Chart**
   - Line graph showing coverage over time (30 days)
   - Separate lines for statements/branches/functions/lines

4. **System-Level Breakdown**
   - Bar chart: Coverage by system
   - Identify which systems need test attention

**Tech stack:** Plain HTML + Tailwind CSS (no framework dependencies)

### Phase 4: CI/CD Integration (30 min)

**GitHub Actions integration:**
- Run coverage report on every PR
- Post coverage delta as comment
- Fail CI if coverage drops >1%
- Upload dashboard as artifact

**Local development:**
- Add npm script: `npm run coverage:report`
- Auto-open dashboard in browser after generation
- Add to README.md developer guide

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

## Expected Outcomes

**Developer benefits:**
- **Quick identification:** See which files need tests at a glance
- **Prioritized action:** Focus on critical simulation code first
- **Trend awareness:** Know if coverage is improving or regressing
- **PR confidence:** See coverage impact before merge

**Project benefits:**
- **Prevent regressions:** CI blocks coverage drops
- **Track progress:** See testing improvements over time
- **Research credibility:** High test coverage strengthens research claims
- **Onboarding:** New developers see which code is well-tested

## Implementation Notes

**Token efficiency:**
- Use existing Jest coverage infrastructure (no new test runner)
- Plain HTML generation (no heavy framework dependencies)
- Store only deltas in history (not full coverage files)
- Grep for file classifications (fast)

**Quality gates:**
- TypeScript compilation MUST pass
- Script must run in <30 seconds (performance requirement)
- HTML dashboard MUST work offline (no CDN dependencies for critical data)
- Architecture review NOT required (tooling-only)

## Follow-Up Work

After completion:
1. **MEDIUM:** Auto-generate test skeletons for files <50% coverage
2. **MEDIUM:** Flaky test scanner (roadmap Section 5.5 next item)
3. **LOW:** Test data factories (reduce boilerplate)

## Alternative Approaches Considered

**Alternative 1:** Use existing coverage visualization tools (Istanbul HTML reporter)
- **Rejected:** Doesn't track trends, no system prioritization, generic output

**Alternative 2:** Third-party SaaS (Codecov, Coveralls)
- **Rejected:** Token conservation mode - avoid external dependencies when possible

**Alternative 3:** Jest's built-in HTML reporter
- **Rejected:** Doesn't prioritize files, no historical tracking, no custom logic

**Chosen approach:** Custom dashboard gives full control over prioritization logic and research-specific visualizations.

## Notes

- Aligns with autonomous worker fallback workflow (Section 5.5)
- No blockers - can implement anytime
- Complements assertion migration work (both improve code quality)
- Supports research reproducibility (well-tested code = trustworthy simulations)
