# Implementation Tasks

## Phase 1: Coverage Data Collection (60 min)

- [ ] Create `scripts/generateCoverageReport.ts`
- [ ] Define CoverageData interface
- [ ] Run `npm test -- --coverage --json --outputFile=coverage/coverage.json`
- [ ] Parse Jest coverage JSON format
- [ ] Calculate per-file coverage percentages
- [ ] Classify files by system (grep for imports/paths)
- [ ] Identify files <80% coverage

## Phase 2: Coverage History Tracking (45 min)

- [ ] Create `logs/coverage_history/` directory
- [ ] Store timestamped coverage snapshots
- [ ] Compare current coverage vs last 7 days
- [ ] Identify files with coverage regressions
- [ ] Track overall project coverage trajectory

## Phase 3: HTML Dashboard Generation (90 min)

- [ ] Create `coverage/dashboard.html` template
- [ ] Section 1: Overall Metrics Card
  - [ ] Current coverage: XX.XX%
  - [ ] Trend: +/-X.X% vs 7 days ago
  - [ ] Tests passing count
  - [ ] Total files count
- [ ] Section 2: Undertested Files Table
  - [ ] File path (clickable)
  - [ ] Coverage percentage
  - [ ] System (climate/ai/social/tech/ui)
  - [ ] Priority (CRITICAL/HIGH/MEDIUM/LOW)
  - [ ] Lines uncovered
- [ ] Section 3: Coverage Trends Chart
  - [ ] Line graph showing coverage over time (30 days)
  - [ ] Separate lines for statements/branches/functions/lines
- [ ] Section 4: System-Level Breakdown
  - [ ] Bar chart: Coverage by system
  - [ ] Identify which systems need test attention
- [ ] Use plain HTML + Tailwind CSS (no framework dependencies)

## Phase 4: CI/CD Integration (30 min)

- [ ] GitHub Actions integration
  - [ ] Run coverage report on every PR
  - [ ] Post coverage delta as comment
  - [ ] Fail CI if coverage drops >1%
  - [ ] Upload dashboard as artifact
- [ ] Local development
  - [ ] Add npm script: `npm run coverage:report`
  - [ ] Auto-open dashboard in browser after generation
  - [ ] Add to README.md developer guide

## Phase 5: Validation

- [ ] TypeScript compilation passes
- [ ] Script runs in <30 seconds
- [ ] HTML dashboard works offline
- [ ] Coverage history correctly tracks trends
- [ ] System prioritization logic accurate

## Phase 6: Documentation

- [ ] Update README.md with usage instructions
- [ ] Add code comments
- [ ] Document prioritization logic
