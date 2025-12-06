# Delta for Frontend Specification

## ADDED Requirements

### Requirement: Coverage Report Dashboard
The project SHALL provide a coverage report dashboard for tracking test coverage.

#### Scenario: Coverage Visualization
- WHEN generating a coverage report
- THEN it MUST show overall coverage percentage
- AND it MUST show trend vs 7 days ago
- AND it MUST identify files <80% coverage
- AND it MUST prioritize files by system criticality

#### Scenario: Historical Tracking
- WHEN storing coverage history
- THEN it MUST save timestamped snapshots to `logs/coverage_history/`
- AND it MUST track coverage trends over 30 days
- AND it MUST identify coverage regressions

#### Scenario: System Prioritization
- WHEN identifying undertested files
- THEN CRITICAL system files MUST be prioritized first
- AND files MUST be classified (climate/ai/social/tech/ui)
- AND priority MUST follow: CRITICAL > HIGH > MEDIUM > LOW

#### Scenario: CI/CD Integration
- WHEN running on PR
- THEN coverage delta MUST be posted as comment
- AND CI MUST fail if coverage drops >1%
- AND dashboard MUST be uploaded as artifact

---

## Implementation Notes

**Script:** `scripts/generateCoverageReport.ts`
**Output:** `coverage/dashboard.html`
**History:** `logs/coverage_history/coverage_YYYYMMDD_HHMMSS.json`

**Tech stack:** Plain HTML + Tailwind CSS (no framework dependencies)

**Performance requirements:**
- Script execution: <30 seconds
- Dashboard must work offline (no CDN dependencies)

**Prioritization logic:**
- CRITICAL: Core simulation engine, climate modeling, state interface
- HIGH: AI phases, planetary boundaries, food security
- MEDIUM: Social/tech phases, UI utilities
- LOW: React components, build tooling
